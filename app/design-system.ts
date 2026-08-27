export type DesignSystem = {
  key: string;
  name: string;
  description: string;
  fit: string;
  references: number[];
  preview: string;
  colors: { bg:string; ink:string; primary:string; accent:string; soft:string; muted:string };
  mode: "civic"|"public"|"corporate"|"youth"|"tech"|"warm"|"editorial";
  tags: string[];
  layers: { foundation:string; atom:string; molecule:string; organism:string; template:string };
};

/** 첨부된 atomic-design-수강생용.md만을 근거로 사용하는 단일 디자인 체계. */
export const atomicLearningSystem: DesignSystem = {
  key:"atomic_learning_system_v2",
  name:"Atomic Lecture System",
  description:"실제 한국어 강의 콘텐츠를 견디는 타이포·색·간격 토큰과 재사용 가능한 정보 블록으로 슬라이드를 구성합니다.",
  fit:"기관·대상·주제에 맞춰 콘텐츠 밀도와 사례만 조정",
  references:[],
  preview:"/design-references/ref-18.png",
  mode:"civic",
  tags:["FOUNDATION","ATOM","MOLECULE","ORGANISM","TEMPLATE"],
  layers:{
    foundation:"고대비 색상 · 한국어 타입 스케일 · 8pt 간격",
    atom:"제목 · 본문 · 라벨 · 번호 · 아이콘",
    molecule:"제목+근거 · 숫자+설명 · 이미지+캡션",
    organism:"표지 · 개념 · 비교 · 프로세스 · 실습 · 차트",
    template:"내용 길이와 목적에 따라 모듈을 조합하는 강의 흐름",
  },
  colors:{bg:"F4F7F5",ink:"102A2D",primary:"123F5A",accent:"FF6B4A",soft:"DDEBE7",muted:"667771"},
};

export const designSystems: DesignSystem[] = [atomicLearningSystem];

export function recommendDesignOptions(_institutionType="", _audience="", _topic="") {
  return designSystems;
}

export function recommendDesign(_institutionType="", _audience="", _topic="") {
  return atomicLearningSystem;
}

export function resolveDesign(_key:string|undefined,_institutionType="",_audience="",_topic="") {
  return atomicLearningSystem;
}
