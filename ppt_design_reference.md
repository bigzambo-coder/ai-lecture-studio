# Behance·Dribbble 기반 PPT 디자인 레퍼런스 시스템

## 1. 기본 참고 사이트

- Behance 프레젠테이션 디자인 검색  
  https://www.behance.net/search/projects/presentation%20design
- Behance PowerPoint 템플릿 검색  
  https://www.behance.net/search/projects/powerpoint%20template
- Dribbble PPT 검색  
  https://dribbble.com/search/ppt
- Dribbble Presentation Layout 검색  
  https://dribbble.com/search/presentation-layout

검색 페이지는 고정 템플릿이 아니라 디자인 탐색 출발점이다. 프로젝트마다 기관·대상·주제·분위기에 맞는 검색어로 다시 탐색한다.

## 2. 사이트별 활용 목적

| 사이트 | 우선 참고할 요소 |
|---|---|
| Behance | 전체 덱의 브랜드 시스템, 표지부터 마지막 장까지의 흐름, 다양한 고유 슬라이드, 이미지·타이포·컬러의 일관성 |
| Dribbble | 한 장의 강한 레이아웃, 피치덱, 데이터 시각화, 미니멀·브랜드·테크 스타일, 컬러와 컴포지션 아이디어 |

Behance의 긴 프로젝트는 **전체 디자인 문법**을, Dribbble의 개별 샷은 **특정 레이아웃 아이디어**를 분석하는 데 사용한다.

## 3. 검색어 생성

```text
[기관유형] + [대상] + [주제] + presentation design
[산업] + education presentation
[분위기] + pitch deck
[주제] + powerpoint template
[결과물 유형] + presentation layout
```

예시:

```text
public institution AI education presentation
university workshop presentation design
senior digital literacy presentation
parenting education warm presentation
small business marketing pitch deck
technology education editorial presentation
```

## 4. 후보 수집 규칙

1. 후보 6~12개를 수집한다.
2. 같은 제작자의 유사 템플릿만 모으지 않는다.
3. 서로 다른 디자인 방향이 최소 2개 포함되게 한다.
4. 교육 대상이 읽을 수 있는 정보량인지 확인한다.
5. 16:9 화면과 한글 적용 가능성을 확인한다.
6. 텍스트가 거의 없는 장식용 포트폴리오는 우선순위를 낮춘다.
7. 각 후보의 원본 링크와 확인 날짜를 기록한다.

## 5. 레퍼런스 분석 스키마

```yaml
reference_title:
source_site:
source_url:
checked_at:
design_mood:
background_system:
color_relationship:
typography_hierarchy:
grid_and_margins:
cover_composition:
image_treatment:
shape_language:
icon_style:
chart_table_style:
layout_silhouettes: []
information_density:
korean_adaptability:
use_for_this_project: []
do_not_copy: []
```

## 6. 디자인 방향 승인

PPT를 바로 만들기 전에 서로 다른 2~3개 방향을 비교한다.

| 항목 | 방향 A | 방향 B | 방향 C |
|---|---|---|---|
| 콘셉트 |  |  |  |
| 배경 |  |  |  |
| 대표 컬러 |  |  |  |
| 타이포 |  |  |  |
| 이미지 |  |  |  |
| 레이아웃 특징 |  |  |  |
| 대상 적합성 |  |  |  |
| 장점 |  |  |  |
| 주의점 |  |  |  |
| 참고 링크 |  |  |  |

사용자 승인 후 하나의 방향으로 Design Token을 확정한다. 여러 스타일을 한 덱에 섞지 않는다.

## 7. 교육용 PPT 적용 원칙

### 표지

- 제목, 짧은 부제, 강사·기관 정보만 남긴다.
- 강한 사진, 타이포, 컬러 면 또는 상징 모티프 중 하나를 중심으로 사용한다.
- 장식 요소를 여러 개 경쟁시키지 않는다.

### 본문

- 슬라이드 제목과 핵심 문장을 즉시 구분하게 한다.
- 한 화면에서 가장 먼저 볼 요소를 하나 정한다.
- 사진은 작은 썸네일보다 화면의 35~60%를 차지하는 큰 크롭을 우선한다.
- 카드형 UI를 반복하기보다 텍스트+이미지, 비교, 프로세스, 실제 화면, 숫자 강조 등 다양한 실루엣을 사용한다.
- 15장마다 최소 6종의 레이아웃을 사용한다.
- 같은 실루엣을 3장 이상 연속 사용하지 않는다.

### 타이포그래피

- 덱 제목 50pt 이상, 슬라이드 제목 35pt 이상을 기본으로 한다.
- 중간 제목과 콜아웃은 24pt 이상을 권장한다.
- 교육용 본문은 가능하면 20~28pt를 유지하고 16pt 미만으로 내리지 않는다.
- 한글 제목이 의도치 않게 두 줄로 갈라지지 않게 레이아웃을 바꾼다.
- 굵기, 크기, 컬러 중 1~2가지로만 위계를 만든다.

### 컬러

- 기본 배경 1개, 본문색 1개, 주색 1개, 강조색 1~2개로 제한한다.
- 기관 CI 색은 명도·채도를 조정해 교육용 팔레트로 만든다.
- 의미색은 전체 덱에서 동일한 기능으로 사용한다.

### 이미지와 실제 화면

- 실제 도구 화면은 중요한 영역을 확대하고 불필요한 UI를 잘라낸다.
- 인물 사진은 텍스트가 놓일 여백을 고려해 크롭한다.
- 같은 이미지를 반복 사용하지 않는다.
- 장식용 로봇·회로·빛나는 뇌 이미지를 습관적으로 사용하지 않는다.

### 표·차트·프로세스

- 표는 비교가 실제로 필요한 경우에만 사용한다.
- 한 장에 하나의 핵심 수치 또는 비교 결론이 먼저 보이게 한다.
- 가짜 데이터와 의미 없는 그래프를 사용하지 않는다.
- 복잡한 프로세스는 단계 수를 줄이고 현재 단계를 강조한다.

## 8. 권장 레이아웃 라이브러리

15장 기준으로 아래 중 최소 6종을 선택한다.

1. 에디토리얼 표지형
2. 큰 숫자·핵심 문장형
3. 텍스트 40% + 사진 60% 분할형
4. 전체 이미지 + 짧은 오버레이형
5. Before/After 비교형
6. 3~5단계 프로세스형
7. 실제 화면 확대·주석형
8. 사례 스토리형
9. 데이터·차트 중심형
10. 결과물 쇼케이스형
11. 질문·참여 유도형
12. 실습 안내형

## 9. 금지 사항

- Behance·Dribbble 작품의 슬라이드를 캡처해 그대로 사용
- 원작자의 그래픽·일러스트·문구·레이아웃을 사실상 복제
- 출처 링크 없이 특정 작품을 템플릿처럼 재사용
- 내용과 관계없는 트렌디한 장식 추가
- 모든 장을 동일한 카드 그리드로 제작
- 작은 글자를 넣고 “Behance 스타일”이라고 표현
- 기관마다 같은 디자인을 색상만 바꿔 재사용

레퍼런스는 아이디어와 원리를 분석하기 위한 것이며, 결과물은 기관과 교육내용에 맞는 새로운 디자인이어야 한다.

## 10. Design Token 변환

```yaml
design_concept:
reference_principles:
  - source_url:
    extracted_principle:
    application:
background:
text_color:
primary_color:
accent_colors: []
typography:
grid:
margins:
image_tone:
shape_language:
icon_style:
table_chart_style:
cover_motif:
layout_library: []
forbidden_patterns: []
```

## 11. 최종 디자인 QA

- 승인한 방향과 실제 PPT의 분위기가 일치하는가
- 레퍼런스 원리를 사용했지만 특정 작품을 복제하지 않았는가
- 기관 CI와 교육 대상에 맞는가
- 레이아웃이 반복되지 않는가
- 사진과 실제 화면이 충분히 크고 선명한가
- 본문 글자가 교육 현장에서 읽히는가
- 장식보다 핵심 메시지가 먼저 보이는가
- 모든 슬라이드 렌더링과 몽타주 검수를 완료했는가

