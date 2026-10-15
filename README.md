# 초록모아 · 가드닝 정보 공유

파스텔 클레이모피즘 디자인의 한국어 가드닝 커뮤니티입니다.

## 실행

Node.js 22 이상에서 `npm ci`, `npm run dev`로 시작합니다. `npm run build`로 배포 빌드를 검증합니다.

## 기능

- 커뮤니티 게시물, 카테고리/검색/인기순 필터, 상세 읽기
- 이메일 매직 링크 로그인, 인증된 회원 글쓰기와 중복 방지 좋아요
- 북마크와 식물 관리 체크리스트 (기기별 localStorage)
- 5문항 가드닝 퀴즈와 학습용 점수 랭킹
- 다크 모드, 모바일/태블릿/데스크톱 대응
- CSS로 직접 만든 입체 식물 일러스트

## Supabase

Vercel Marketplace에서 서울(ap-northeast-2) 프로젝트를 연결하고 `supabase/migrations/001_initial.sql`을 SQL Editor에서 실행합니다. 환경변수는 `.env.example`을 참고합니다. 비밀 키는 커밋하지 마세요. 클라이언트에는 publishable/anon 키만 사용합니다.

Supabase Auth의 Site URL과 Redirect URLs에 프로덕션 도메인을 등록합니다. 게시물과 랭킹은 공개 읽기, 쓰기는 본인 계정에만 허용됩니다. 좋아요는 계정당 한 번만 허용하는 SQL 함수로 증가합니다. 서버 관리 키는 클라이언트에 노출하지 않습니다.

DB 설정이 없으면 체험 모드로 동작하며 글은 해당 브라우저에 저장됩니다. 초기 콘텐츠는 샘플입니다. 퀴즈는 학습용이며 클라이언트 제출 점수는 공식 검증/보상 용도로 사용하지 않습니다.

## 배포

Vercel에서 이 저장소를 Import하고 Next.js 프리셋을 사용합니다. `vercel.json`의 `regions: ["icn1"]`이 서버리스 함수를 서울로 지정합니다. `/api/health`에서 실행 리전과 DB 설정 여부를 확인할 수 있습니다. 동일 리전이어도 실제 지연시간은 부하와 연결 방식에 따라 다릅니다.

## 현재 운영 상태 (2026-10-15)

- 라이브: https://gardening-community-two.vercel.app/
- 서버 런타임: icn1, Supabase: ap-northeast-2 (서울).
- posts 6개, rankings 3개 샘플 데이터 등록 및 세 테이블 RLS 활성화 확인.
- Vercel Marketplace의 SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY를 next.config.ts에서 공개 클라이언트 변수로 매핑합니다. 비밀 관리 키는 매핑하지 않습니다.
- 로컬 .env.local에는 앱 실행에 필요한 URL 및 공개 publishable 키를 저장했습니다.
- 일반 사용자 이메일 로그인 운영에는 별도 custom SMTP가 필요합니다. 현재 기본 메일 서비스는 프로젝트 팀 주소만 지원합니다. https://supabase.com/docs/guides/auth/auth-smtp
- Git 사용자 정보는 저장소 로컬 설정이며, SSH 키는 work/ssh/id_ed25519에 있습니다. 홈 경로 쓰기 제한으로 전역 설정 및 ~/.ssh 위치는 적용하지 못했습니다. SSH push는 work/git-ssh.cmd를 GIT_SSH로 지정해 443 포트를 사용합니다.
