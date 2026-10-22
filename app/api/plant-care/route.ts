export const runtime = 'nodejs';
export const maxDuration = 60;

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const maxImageBytes = 4 * 1024 * 1024;
const requestWindowMs = 60_000;
const requestLimit = 8;
const requestTimes = new Map<string, number[]>();

function isRateLimited(request: Request) {
  const address = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() || 'unknown';
  const now = Date.now();
  const recent = (requestTimes.get(address) || []).filter((time) => now - time < requestWindowMs);
  if (recent.length >= requestLimit) {
    requestTimes.set(address, recent);
    return true;
  }
  recent.push(now);
  requestTimes.set(address, recent);
  for (const [key, times] of requestTimes) {
    if (times.every((time) => now - time >= requestWindowMs)) requestTimes.delete(key);
  }
  return false;
}

const systemInstructions = `당신은 한국어로 식물 관리와 병해 진단을 돕는 친절한 가드닝 안내자입니다. 사용자가 올린 사진과 질문에 근거해 답하세요. 사진에서 직접 확인되는 사실과 추정은 구분하고, 확실하지 않으면 가능성이라고 표현하세요. 먼저 저위험 관리법을 안내하고, 농약이나 약제를 권할 때는 성분표와 국내 제품 라벨을 확인하라고 말하세요. 식용 작물, 반려동물, 어린이가 있는 환경에서는 안전을 우선하세요. 병해가 심하거나 빠르게 번지면 식물병원, 농업기술센터 또는 전문가에게 확인하도록 안내하세요. 전문 진단을 대체하지 않는 실용적인 답변을 아래 형식으로 작성하세요.

🌿 식물 추정
사진으로 식물 종류를 판단하기 어렵다면 그렇게 말합니다.

🔎 보이는 증상
사진에서 확인되는 특징만 적습니다.

🧩 의심되는 원인
가능성이 높은 원인부터 최대 3개 적고, 이유와 확신 정도를 짧게 설명합니다.

🪴 지금 해볼 관리법
번호를 붙여 바로 할 수 있는 조치를 2~4개 안내합니다.

👀 다시 확인할 점
관찰할 부분과 전문가 도움을 받아야 할 신호를 안내합니다.

사진이 없거나 정보가 부족하면 진단을 단정하지 말고, 도움이 될 추가 질문을 최대 2개 덧붙입니다. 전체 답변은 쉬운 말로 짧고 구체적으로 작성하세요.`;

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return Response.json({ error: '요청이 잠시 많아요. 1분 뒤 다시 시도해 주세요.' }, { status: 429 });
  }
  const apiKey = process.env.CHATGPT_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: '서버에 CHATGPT_KEY가 설정되지 않았어요. Vercel 환경 변수에 키를 추가해 주세요.' },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: '요청을 읽지 못했어요. 다시 시도해 주세요.' }, { status: 400 });
  }

  const question = String(form.get('question') || '').trim().slice(0, 2000);
  const image = form.get('image');
  if (!question && !(image instanceof File)) {
    return Response.json({ error: '궁금한 점을 적거나 식물 사진을 올려 주세요.' }, { status: 400 });
  }

  const content: Array<Record<string, unknown>> = [
    { type: 'input_text', text: question || '사진 속 식물의 상태를 살펴보고 관리 방법을 알려주세요.' },
  ];

  if (image instanceof File && image.size > 0) {
    if (!allowedImageTypes.has(image.type)) {
      return Response.json({ error: 'JPG, PNG, WEBP, GIF 사진만 올릴 수 있어요.' }, { status: 400 });
    }
    if (image.size > maxImageBytes) {
      return Response.json({ error: '사진은 4MB 이하로 올려 주세요.' }, { status: 413 });
    }
    const base64 = Buffer.from(await image.arrayBuffer()).toString('base64');
    content.push({ type: 'input_image', image_url: `data:${image.type};base64,${base64}`, detail: 'high' });
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-6-astra',
        instructions: systemInstructions,
        input: [{ role: 'user', content }],
        max_output_tokens: 1000,
      }),
      signal: AbortSignal.timeout(55_000),
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      if (upstream.status === 401) {
        return Response.json({ error: 'CHATGPT_KEY 인증을 확인할 수 없어요. 서버 환경 변수의 API 키를 확인해 주세요.' }, { status: 502 });
      }
      if (upstream.status === 429) {
        return Response.json({ error: '요청이 잠시 많거나 사용 한도에 도달했어요. 잠시 후 다시 시도해 주세요.' }, { status: 429 });
      }
      return Response.json({ error: '식물 상담을 가져오지 못했어요. 잠시 후 다시 시도해 주세요.' }, { status: 502 });
    }

    const answer = Array.isArray(payload.output)
      ? payload.output.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content || [])
          .filter((part: { type?: string }) => part.type === 'output_text')
          .map((part: { text?: string }) => part.text || '')
          .join('\n')
      : '';

    if (!answer) {
      return Response.json({ error: '답변을 만들지 못했어요. 질문을 조금 바꿔 다시 시도해 주세요.' }, { status: 502 });
    }
    return Response.json({ answer });
  } catch {
    return Response.json({ error: '상담 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.' }, { status: 502 });
  }
}
