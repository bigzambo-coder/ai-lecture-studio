# AI LECTURE STUDIO Codex 앱 제작 패키지

## Windows에서 시작하는 방법

1. 이 패키지의 압축을 내려받아 `C:\codex\ppt\`에 푼다.
2. Codex에서 `C:\codex\ppt\` 폴더를 프로젝트로 연다.
3. Codex에 아래 첫 명령을 입력한다.

```text
AGENTS.md, requirements.md, workflow.md, prompts.md와 sources의 통합 매뉴얼을 읽어줘.
먼저 현재 폴더를 분석하고 앱 구현 계획을 세워줘.
아직 코드는 만들지 말고 추천 기술 스택, 화면 구조, 데이터 모델, 개발 순서와 확인이 필요한 질문만 정리해줘.
```

4. 기술 스택과 구현 범위를 확인한 뒤 다음 명령을 사용한다.

```text
승인한 계획대로 MVP 1부터 구현해줘.
프로젝트 생성, 선택형 인터뷰, MASTER BRIEF 편집·승인, 단계 상태관리까지 실제로 실행되는 앱을 만들어줘.
구현 후 테스트하고 실행 방법을 알려줘.
```

## 권장 개발 순서

처음부터 DOCX·PPTX·Notion까지 모두 연결하지 않는다.

1. MVP 1: 입력, 인터뷰, MASTER BRIEF, 승인 상태
2. MVP 2: 단계별 AI 생성, 파일 제작, 렌더링과 다운로드
3. MVP 3: Notion 연결, 기관 조사, 자동 교차검수

## 폴더 설명

```text
codex_ppt_app/
├─ AGENTS.md       Codex가 자동으로 따라야 할 최상위 규칙
├─ README.md       설치와 첫 실행 안내
├─ workflow.md     제작 단계·승인·수정 영향 관계
├─ prompts.md      단계별 실제 AI 프롬프트
├─ requirements.md 앱 화면·기능·출력·MVP 요구사항
├─ sources/        전체 통합 제작 기준
├─ samples/        기관 양식과 참고 샘플
└─ assets/         로고·PPT 템플릿·이미지 저장 위치
```

## 중요한 차이

초기 요청안에 적힌 결과 형식 중 다음은 실제 운영 기준에 맞게 수정했다.

- 교육제안서: PPTX가 아니라 DOCX/PDF
- 실습워크북: DOCX/PDF가 아니라 실제 Notion 페이지
- PPT 제작 전: Content Architecture, Storyline, 기관 조사, Design Token 승인 단계 추가

## MVP 1 실행

```powershell
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 연다.

현재 구현 범위:

- 프로젝트 대시보드
- 기관·대상·주제 입력
- 필요한 산출물 개별·전체 선택
- 선택형 추가 인터뷰
- MASTER BRIEF 편집·승인 스냅샷
- 단계별 제작·수정·승인 상태 흐름
- 브라우저 로컬 저장을 이용한 프로젝트 상태 보존
- 강의기획서·교육제안서·세부커리큘럼·발표스크립트 DOCX 생성
- 기관·대상 팔레트를 적용한 실제 PPTX 생성
- PPT 설계·Design Token·FINAL QA JSON 생성
- 실제 파일 보관과 다운로드
- 실제 파일이 없는 기존 가상 승인 상태 자동 초기화

OpenAI 내용 생성을 사용하려면 `.env.local`에 다음 값을 설정한다.

```text
OPENAI_API_KEY=발급받은_API_키
OPENAI_MODEL=gpt-5.4
```

API 키가 없어도 승인된 MASTER BRIEF를 기반으로 검증 가능한 기본 콘텐츠와 실제 파일을 생성한다. 현재 실행 환경에는 LibreOffice 렌더러가 없어 DOCX·PPTX 페이지 이미지 미리보기는 아직 연결되지 않았으며, 실제 Notion 페이지 작성은 MVP 3에서 연결한다.
