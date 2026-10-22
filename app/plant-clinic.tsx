'use client';

import { useRef, useState } from 'react';
import { AlertCircle, ArrowUpRight, Camera, CheckCircle2, ImagePlus, LoaderCircle, Send, Stethoscope, X } from 'lucide-react';

type Diagnosis = { answer: string; photo: string | null; question: string };
const suggestions = ['잎에 갈색 반점이 생겼어요', '잎이 노랗게 변해요', '뿌리와 흙에서 냄새가 나요', '벌레나 거미줄이 보여요'];

async function preparePhoto(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error('JPG, PNG, WEBP, GIF 사진을 선택해 주세요.');
  }
  if (file.size > 15 * 1024 * 1024) throw new Error('사진은 15MB 이하로 올려 주세요.');

  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('사진을 처리할 수 없어요. 다른 사진을 선택해 주세요.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let quality = 0.82;
    let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    while (blob && blob.size > 2.8 * 1024 * 1024 && quality > 0.5) {
      quality -= 0.1;
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    }
    if (!blob || blob.size > 2.8 * 1024 * 1024) throw new Error('사진 크기를 줄이지 못했어요. 더 작은 사진을 선택해 주세요.');
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(source);
  }
}

export default function PlantClinic() {
  const [question, setQuestion] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function selectPhoto(file?: File) {
    if (!file) return;
    setError('');
    try {
      const prepared = await preparePhoto(file);
      setPhoto(prepared);
      setPreview(URL.createObjectURL(prepared));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '사진을 불러오지 못했어요.');
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() && !photo) {
      setError('궁금한 점을 적거나 식물 사진을 올려 주세요.');
      return;
    }
    setBusy(true);
    setError('');
    const form = new FormData();
    form.set('question', question.trim());
    if (photo) form.set('image', photo);
    try {
      const response = await fetch('/api/plant-care', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '답변을 가져오지 못했어요.');
      setDiagnosis({ answer: result.answer, photo: preview, question: question.trim() || '사진 속 식물 상태를 알려주세요.' });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '상담 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="clinic-page">
      <section className="clinic-hero">
        <div className="clinic-orb clinic-orb-one" />
        <div className="clinic-orb clinic-orb-two" />
        <div className="clinic-hero-copy">
          <span className="clinic-kicker"><Stethoscope size={16} /> PLANT CARE CLINIC</span>
          <h2>우리 식물, 어디가 아픈가요?</h2>
          <p>사진과 증상을 알려주면 가능한 원인과<br className="clinic-break" /> 오늘부터 해볼 관리법을 함께 찾아드려요.</p>
        </div>
        <span className="clinic-hero-leaf" aria-hidden="true">🪴</span>
        <span className="clinic-hero-note">차근차근 살펴봐요 <span>✳</span></span>
      </section>

      <section className="clinic-card">
        <div className="clinic-heading"><div><span className="overline">ASK YOUR PLANT DOCTOR</span><h3>식물 상태를 알려주세요</h3></div><span className="clinic-heading-icon"><Camera size={19}/></span></div>
        <p className="clinic-help">사진을 올리면 잎과 줄기의 상태를 함께 살펴볼 수 있어요. 식물 이름이나 최근 관리 방법도 적어주면 더 정확해요. 사진은 답변 분석에만 사용하고 앱에는 저장하지 않아요.</p>
        <div className="clinic-suggestions" aria-label="증상 예시">
          {suggestions.map((item) => <button type="button" key={item} onClick={() => setQuestion(item)}>{item}</button>)}
        </div>
        <form className="clinic-form" onSubmit={submit}>
          <label className="clinic-text-label" htmlFor="clinic-question">어떤 변화가 있었나요?</label>
          <textarea id="clinic-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={2000} rows={4} placeholder="예: 몬스테라 잎에 갈색 반점이 늘었어요. 일주일에 한 번 물을 줘요." />
          <div className="clinic-form-bottom">
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(event) => { void selectPhoto(event.target.files?.[0]); event.currentTarget.value = ''; }} />
            <button className="clinic-photo-button" type="button" onClick={() => fileInput.current?.click()}><ImagePlus size={17}/>{preview ? '사진 바꾸기' : '식물 사진 추가'}</button>
            <span className="clinic-photo-hint">최대 15MB · JPG, PNG, WEBP, GIF</span>
            <button className="primary clinic-submit" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="clinic-spin" size={17}/> 살펴보는 중…</> : <>상태 알아보기 <Send size={16}/></>}</button>
          </div>
          {preview && <div className="clinic-preview"><img src={preview} alt="진단을 위해 올린 식물 사진"/><div><strong>사진을 추가했어요</strong><span>상담 결과에 함께 표시됩니다.</span></div><button type="button" aria-label="사진 삭제" onClick={() => { setPhoto(null); setPreview(null); }}><X size={17}/></button></div>}
          {error && <p className="clinic-error" role="alert"><AlertCircle size={16}/>{error}</p>}
        </form>
      </section>

      {diagnosis && <section className="diagnosis-card" aria-live="polite">
        <div className="diagnosis-title"><span className="diagnosis-icon"><CheckCircle2 size={20}/></span><div><span className="overline">YOUR PLANT CARE GUIDE</span><h3>함께 살펴본 결과</h3></div><button type="button" onClick={() => setDiagnosis(null)} aria-label="상담 결과 닫기"><X size={18}/></button></div>
        {diagnosis.photo && <img className="diagnosis-photo" src={diagnosis.photo} alt="상담한 식물 사진"/>}
        <p className="diagnosis-question">{diagnosis.question}</p>
        <div className="diagnosis-answer">{diagnosis.answer}</div>
        <div className="diagnosis-footnote"><AlertCircle size={15}/> 사진만으로 원인을 확정하기 어려울 수 있어요. 우선 안전한 관리법부터 시도하고, 증상이 번지면 전문가에게 문의해 주세요.</div>
      </section>}

      <div className="clinic-tip"><span>🌱</span><p><strong>사진 팁</strong> 잎의 앞·뒷면과 줄기를 가까이 찍고, 식물 전체 사진도 함께 있으면 증상을 살피는 데 도움이 돼요.</p><ArrowUpRight size={17}/></div>
    </div>
  );
}
