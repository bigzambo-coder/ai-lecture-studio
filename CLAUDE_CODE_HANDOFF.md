# AI Lecture Studio — Claude Code 인수인계

## 목표

기관·대상·교육시간·주제를 한 번 입력하면 강의기획서, 교육제안서, 세부커리큘럼, PPT, Notion 워크북, 발표스크립트를 단계별 승인 방식으로 제작하는 Next.js 앱입니다.

## 먼저 읽을 파일

아래 순서로 읽고 기존 의사결정과 출력 규칙을 유지하세요.

1. `AGENTS.md`
2. `requirements.md`
3. `workflow.md`
4. `prompts.md`
5. `sources/AI_LECTURE_STUDIO_CODEX_MASTER_v9.md`
6. `sources/기획서_자동생성_코덱스용.md`
7. `ppt_design_reference.md`

## 설치와 실행

```powershell
pnpm install
pnpm dev
```

브라우저: `http://localhost:3000`

OpenAI를 연결할 경우 `.env.example`을 `.env.local`로 복사하고 API 키를 로컬에서 설정합니다. 키가 없어도 기본 콘텐츠로 DOCX와 PPTX가 생성됩니다.

## 주요 코드

- `app/page.tsx`: 프로젝트 대시보드, 입력, 인터뷰, 브리프 승인, 단계 상태, 다운로드 UI
- `app/api/generate/route.ts`: 콘텐츠 생성, DOCX/PPTX 제작, 파일 저장
- `app/api/files/route.ts`: 생성 파일 다운로드
- `app/design-system.ts`: 6개 디자인 계열과 기관·대상별 추천 규칙
- `app/globals.css`: 전체 화면 스타일

## 현재 구현 상태

- 브라우저 `localStorage` 기반 프로젝트 저장
- 기관·대상·시간·주제 입력과 추가 인터뷰
- MASTER BRIEF 버전 승인
- 산출물 개별 선택 또는 전체 선택
- 사용자 첨부 기획서 양식 기반 DOCX 생성
- A~F 제출기관 유형 자동판별과 수동 선택
- 담당부서·장소·예산·최종 결과물 입력 및 미확정 값 표시
- 제안서 전용 DOCX 생성
- 가로형 세부커리큘럼 DOCX 생성
- 교육시간 기반 PPT 장수 산정: 기본 약 4분당 1장, 15–60장 범위
- 공공/기업/청년/테크/생활/프리미엄 6개 디자인 시스템
- PPTX, DOCX, JSON 저장과 다운로드
- 기본 Notion 대상 주소 저장

## 포함된 원본과 자산

- `samples/plan-template-user.docx`: 기획서 생성의 실제 기준 양식(한글 파일명의 호환용 사본)
- `samples/교육기획서_상세양식.docx`: 이전 상세 양식
- `public/design-references/ref-*.png`: 사용자가 제공한 17개 디자인 검색 보드
- `public/assets/workshop-youth-editorial-v1.png`: 청년 교육 PPT용 생성 이미지

디자인 레퍼런스 화면을 PPT에 그대로 붙이지 마세요. 색상, 타이포 위계, 이미지 크롭, 여백, 데이터 시각화 문법만 추출해 독립적인 결과물을 만드세요.

## 중요한 데이터와 기본값

- Notion 기본 페이지: `https://app.notion.com/space/eb2c089c67df4ba8adfb8c869f74fdb5`
- 현재 생성 엔진 버전: `8`
- 기본 선택 산출물: PPT + Notion
- PPT 기본 실습 비율: 40–50%
- 60분 교육 권장: 15–20장
- 180분 교육 권장: 24–45장, 주제와 실습 구성에 따라 조정

## 반드시 개선할 부분

1. PPT 생성 코드를 슬라이드 역할별 모듈로 분리하세요.
2. 반복되는 글 중심 레이아웃을 줄이고 사진, 실제 예시, 출력물 해부, 프롬프트, 실습, 검수 페이지를 명확히 구분하세요.
3. 디자인 선택 단계에서 2–3개 추천 시안을 큰 이미지로 비교하게 하세요.
4. PPT 미리보기 이미지를 앱 안에서 확인한 뒤 선택·재생성할 수 있게 하세요.
5. Notion API/OAuth를 연결해 실습 ID와 PPT 슬라이드 번호가 연결된 실제 페이지를 작성하세요.
6. 서버 DB와 객체 저장소를 도입해 `localStorage`와 로컬 `storage/`를 대체하세요.
7. DOCX/PPTX 렌더링 QA와 오버플로 검사를 생성 파이프라인에 포함하세요.
8. 생성 진행률, 실패 재시도, 단계별 수정 영향도를 구현하세요.

## Claude Code 첫 요청문

```text
AGENTS.md와 CLAUDE_CODE_HANDOFF.md에 적힌 순서대로 요구사항 문서를 모두 읽어줘.
현재 Next.js 앱을 실행하고 기존 기능을 확인한 다음, 코드는 바로 고치지 말고 먼저 문제점과 개선 계획을 정리해줘.

가장 중요한 목표는 PPT 품질 개선이야. design 레퍼런스는 복사하지 말고 시각 시스템만 분석해서 적용해줘. 60분 강의는 보통 15~20장이고, 시간만으로 고정하지 말고 주제·실습·예시·검수에 따라 장수를 조정해줘. PPT에는 최소 6가지 레이아웃 유형, 의미 있는 이미지, 실제 예시, 프롬프트, 예상 결과, 실습, 검수 체크가 포함되어야 해.

기획서는 samples/plan-template-user.docx를 기준으로 만들고, 제안서와 세부커리큘럼은 현재 전용 생성 로직을 유지하면서 시각 검수까지 추가해줘.
```

## 패키지에서 제외한 항목

- `node_modules/`: `pnpm install`로 복원
- `.next/`: `pnpm dev` 또는 `pnpm build`로 복원
- `storage/`: 사용자별 생성 결과물이므로 소스 패키지에서 제외
- `tmp/`: 렌더링 및 검사 중간 파일
- `.env.local`: 비밀키 보호를 위해 제외
