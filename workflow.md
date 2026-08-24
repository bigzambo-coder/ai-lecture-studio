# AI LECTURE STUDIO 전체 워크플로우

## 1. 단계 흐름

```text
사용자 정보 입력
→ 부족한 정보 인터뷰
→ MASTER BRIEF 작성·승인
→ 강의계획서 생성·QA·승인
→ 교육제안서 생성·QA·승인
→ 세부커리큘럼 생성·QA·승인
→ Content Architecture·Storyline 생성·승인
→ 기관 조사·Design Token 생성·승인
→ 실제 PPT 제작·렌더링 QA·승인
→ 실제 Notion 워크북 작성·QA·승인
→ 발표스크립트 제작·렌더링 QA·승인
→ FINAL QA
```

## 2. 공통 입력 항목

```yaml
institution:
  name:
  type:
  region:
audience:
  group:
  level:
  count:
education:
  topic:
  problem:
  purpose:
  behavioral_objectives: []
  total_minutes:
  sessions:
delivery:
  method:
  lecture_ratio:
  practice_ratio:
environment:
  devices: []
  tools: []
  account_type:
  internet:
outputs: []
deliverables: []
writing_tone:
ppt_design_request:
submission:
  template:
  deadline:
references: []
safety_conditions: []
```

## 3. 단계 상태

```text
not_started → drafting → qa → awaiting_approval → approved
                                 ↘ revision_requested
                                 ↘ blocked
```

## 4. 단계 간 연결 규칙

- MASTER BRIEF의 대상·목적·환경을 모든 문서에 반영한다.
- 기획서의 행동형 교육목표를 커리큘럼 학습목표에 반영한다.
- 커리큘럼의 파트·시간·실습·결과물을 PPT 설계에 반영한다.
- Content Architecture의 학습 질문과 필수 개념을 Storyline에 반영한다.
- Storyline의 슬라이드별 실제 문장과 시각자료 계획을 PPT에 반영한다.
- 기관 조사 결과를 Design Token에 반영한다.
- Design Token을 PPT와 Notion 디자인에 반영한다.
- PPT의 PART·STEP·실습 번호를 Notion과 스크립트에 1:1로 반영한다.
- Notion의 프롬프트 토글 이름을 스크립트 실습 안내에 그대로 사용한다.
- 모든 단계의 시간 합계는 MASTER BRIEF 총시간과 일치시킨다.

## 5. 수정 영향 관계

| 수정 대상 | 함께 재검토할 단계 |
|---|---|
| MASTER BRIEF | 이후 모든 단계 |
| 강의계획서 교육목표 | 제안서, 커리큘럼, PPT 설계, PPT, Notion, 스크립트 |
| 세부커리큘럼 | PPT 설계, PPT, Notion, 스크립트 |
| Storyline | PPT, Notion, 스크립트 |
| Design Token | PPT, Notion 디자인 |
| PPT 실습 번호·순서 | Notion, 스크립트 |
| Notion 프롬프트 | PPT의 프롬프트 안내, 스크립트 |

## 6. 부분 재생성 규칙

- 사용자가 특정 슬라이드, 특정 표, 특정 PART만 수정하면 해당 범위만 재생성한다.
- 수정하지 않은 승인 내용과 레이아웃은 보존한다.
- 승인 파일은 덮어쓰지 않고 새 버전을 만든다.
- 수정 전후 차이와 하위 단계 영향도를 사용자에게 보여준다.
- 상위 단계와 충돌하는 수정은 바로 적용하지 않고 확인을 요청한다.

## 7. 단계별 승인 응답

각 단계가 끝나면 다음만 보여준다.

1. 파일 또는 실제 페이지 링크
2. QA 통과·수정 사항 2~4개
3. `수정`, `승인`, `다음` 선택

## 8. 차단 조건

- 기관 양식 파일을 열 수 없음
- Notion 편집 권한 없음
- 필수 연결 또는 API 없음
- 최신 법규·정책·도구 기능을 확인할 수 없음
- 사용자 지시와 승인 산출물이 충돌함
- 파일 렌더링에 치명적인 오류가 있음

차단 상태에서는 완료라고 표시하지 않는다.

