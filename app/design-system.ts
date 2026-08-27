export type DesignSystem = {
  key: string;
  name: string;
  description: string;
  fit: string;
  references: number[];
  preview: string;
  colors: { bg:string; ink:string; primary:string; accent:string; soft:string; muted:string };
  mode: "civic"|"public"|"corporate"|"youth"|"tech"|"warm"|"editorial";
  inspiredBy?: string[];
  tags?: string[];
  layers?: { foundation:string; molecule:string; organism:string };
};

export const designSystems: DesignSystem[] = [
  {key:"atomic_learning_system",name:"Atomic Learning System",description:"타이포·색·간격을 토큰으로 고정하고, 핵심 메시지·근거·실습을 모듈형 레이아웃으로 조립하는 전문 교육 디자인",fit:"공공기관·기업 × 강의·워크숍·실습",references:[6,10,14,18],preview:"/design-references/ref-18.png",mode:"civic",inspiredBy:["Atomic Design","Editorial Grid","Public Service UI"],tags:["시스템","모듈","고대비","교육"],layers:{foundation:"명확한 타입 스케일 · 8pt 간격 · 고대비",molecule:"제목+근거 · 숫자+라벨 · 이미지+캡션",organism:"표지 · 개념 · 비교 · 프로세스 · 실습"},colors:{bg:"F4F7F5",ink:"102A2D",primary:"123F5A",accent:"FF6B4A",soft:"DDEBE7",muted:"667771"}},
  {key:"public_youth_editorial",name:"Civic Youth Editorial",description:"공공기관의 신뢰감에 청년 창업의 에너지를 더한 비대칭 에디토리얼 그리드",fit:"공공기관·재단 × 청년·소상공인·창업",references:[1,6,10,12,14,18],preview:"/design-references/ref-18.png",mode:"civic",colors:{bg:"F7F9FC",ink:"15202B",primary:"123B5D",accent:"21A179",soft:"EAF0F6",muted:"5D6B78"}},
  {key:"public_data",name:"Public Data Blue",description:"넓은 여백, 정책형 정보 위계, 청록 포인트와 명료한 도표",fit:"공공기관·공기업·학교",references:[3,6,14,15,17],preview:"/design-references/ref-14.png",mode:"public",colors:{bg:"F5F7F6",ink:"102A2D",primary:"087E78",accent:"B7DE31",soft:"DDEDEA",muted:"607275"}},
  {key:"corporate_strategy",name:"Corporate Strategy",description:"대형 숫자, 사진과 데이터의 균형, 임원 보고형 구조",fit:"일반기업·관리자·실무자",references:[2,5,8,10,13],preview:"/design-references/ref-10.png",mode:"corporate",colors:{bg:"F4F1EA",ink:"14181D",primary:"1755D1",accent:"FF5A36",soft:"DCE6F8",muted:"697078"}},
  {key:"youth_pop",name:"Youth Pop Lab",description:"라임·바이올렛 대비, 큰 타이포, 스티커형 포인트",fit:"청년·20대·창업교육",references:[4,8,9,12],preview:"/design-references/ref-9.png",mode:"youth",colors:{bg:"F7F5FF",ink:"171527",primary:"6746E8",accent:"B8F13C",soft:"E8E0FF",muted:"666078"}},
  {key:"tech_neon",name:"Tech Neon Grid",description:"딥 네이비 바탕, 발광 포인트, 시스템·네트워크 도식",fit:"IT·AI·개발·스타트업",references:[4,9,11,13,16,17],preview:"/design-references/ref-17.png",mode:"tech",colors:{bg:"0B1020",ink:"F5F7FF",primary:"7857FF",accent:"31E6C5",soft:"192747",muted:"A9B5CF"}},
  {key:"warm_lifestyle",name:"Warm Lifestyle",description:"따뜻한 사진, 둥근 형태, 부담 없는 단계형 안내",fit:"부모·엄마·시니어·복지",references:[2,4,10,11,16],preview:"/design-references/ref-10.png",mode:"warm",colors:{bg:"FFF8EF",ink:"4B342E",primary:"D9666F",accent:"F0B84B",soft:"F7DED6",muted:"806B64"}},
  {key:"premium_editorial",name:"Premium Editorial",description:"흑백 사진, 세리프 포인트, 절제된 컬러와 과감한 크롭",fit:"브랜드·리더십·프리미엄 과정",references:[7,8,10,11,14],preview:"/design-references/ref-11.png",mode:"editorial",colors:{bg:"F2EFE8",ink:"111111",primary:"C8482E",accent:"E8C96A",soft:"DED8CD",muted:"6B6964"}},
  {key:"korea_clear_service",name:"Clear Korean Service",description:"짧은 문장, 선명한 숫자, 넉넉한 여백으로 복잡한 정보를 쉽게 전달하는 한국형 서비스 디자인",fit:"공공서비스·금융교육·디지털 안내",references:[3,6,14,17],preview:"/design-references/ref-6.png",mode:"public",inspiredBy:["Toss","KakaoBank","NAVER Pay"],tags:["한국","라이트","쿨","핀테크"],colors:{bg:"F7FAFC",ink:"17212B",primary:"1769E0",accent:"18A999",soft:"E8F1FB",muted:"617184"}},
  {key:"fluent_enterprise",name:"Fluent Enterprise",description:"카드형 정보 구조와 정교한 그리드로 보고·교육·실행 항목을 빠르게 구분하는 엔터프라이즈 스타일",fit:"기업·공기업·관리자·B2B 교육",references:[2,5,8,15],preview:"/design-references/ref-15.png",mode:"corporate",inspiredBy:["Microsoft Fluent","Atlassian","Ant Design"],tags:["글로벌","라이트","뉴트럴","엔터프라이즈"],colors:{bg:"F6F7F9",ink:"18202A",primary:"3158D4",accent:"00A7A0",soft:"E6EAF5",muted:"66717E"}},
  {key:"local_friendly",name:"Local Friendly Commerce",description:"생활 사진과 친근한 곡선, 따뜻한 포인트로 현장 사례와 실습을 부담 없이 안내하는 스타일",fit:"소상공인·지역상권·생활밀착 교육",references:[2,10,11,16],preview:"/design-references/ref-16.png",mode:"warm",inspiredBy:["Daangn","Baemin","Ohouse"],tags:["한국","라이트","웜","커머스"],colors:{bg:"FFF9F3",ink:"382F2A",primary:"E86F3A",accent:"12A594",soft:"F8E7D9",muted:"786A61"}},
  {key:"ai_neural_gradient",name:"Neural AI Gradient",description:"깊이감 있는 그라디언트와 모듈형 다이어그램으로 AI 개념과 업무 흐름을 시각화하는 스타일",fit:"생성형 AI·테크·청년·혁신교육",references:[4,9,13,17],preview:"/design-references/ref-13.png",mode:"tech",inspiredBy:["Gemini","Figma","Microsoft Copilot"],tags:["글로벌","다크","쿨","AI"],colors:{bg:"101426",ink:"F5F7FF",primary:"7857FF",accent:"37D6C1",soft:"202B4A",muted:"ADB6D0"}},
  {key:"calm_workspace",name:"Calm Knowledge Workspace",description:"차분한 종이 질감과 문서형 레이아웃으로 학습 단계와 워크북 연결을 자연스럽게 보여주는 스타일",fit:"교육기관·부모·입문자·워크숍",references:[1,7,10,12],preview:"/design-references/ref-7.png",mode:"editorial",inspiredBy:["Notion","Claude","Coda"],tags:["글로벌","라이트","뉴트럴","생산성"],colors:{bg:"FAF8F4",ink:"25231F",primary:"5A5B73",accent:"D17755",soft:"EDE8DF",muted:"77736C"}},
];

export function recommendDesignOptions(institutionType="", audience="", topic="") {
  const text=`${institutionType} ${audience} ${topic}`.toLowerCase();
  const keys:string[]=[];
  const add=(...items:string[])=>items.forEach(key=>{if(!keys.includes(key))keys.push(key)});
  const isPublic=/공공|공기업|교육기관|재단|공단|정부|지자체|지원기관/.test(text);
  const isYouth=/청년|20대|대학생|창업|소상공인|자영업/.test(text);
  if(isPublic&&isYouth)add("atomic_learning_system","public_youth_editorial",/ai|인공지능|생성형/.test(text)?"ai_neural_gradient":"korea_clear_service");
  else if(/엄마|부모|시니어|노인|복지|육아|가족/.test(text))add("calm_workspace","warm_lifestyle","korea_clear_service");
  else if(/개발|it|ai|인공지능|데이터|테크|스타트업/.test(text))add("ai_neural_gradient",isPublic?"public_data":"tech_neon","fluent_enterprise");
  else if(isPublic)add("atomic_learning_system","korea_clear_service","public_data");
  else if(isYouth)add("local_friendly","youth_pop","ai_neural_gradient");
  else if(/브랜드|리더|임원|프리미엄|문화|예술/.test(text))add("premium_editorial","fluent_enterprise","calm_workspace");
  else add("atomic_learning_system","fluent_enterprise","calm_workspace");
  return keys.slice(0,3).map(key=>designSystems.find(item=>item.key===key)!);
}

export function recommendDesign(institutionType="", audience="", topic="") {
  return recommendDesignOptions(institutionType,audience,topic)[0];
}

export function resolveDesign(key:string|undefined,institutionType="",audience="",topic="") {
  return designSystems.find(x=>x.key===key) ?? recommendDesign(institutionType,audience,topic);
}
