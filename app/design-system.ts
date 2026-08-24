export type DesignSystem = {
  key: string;
  name: string;
  description: string;
  fit: string;
  references: number[];
  preview: string;
  colors: { bg:string; ink:string; primary:string; accent:string; soft:string; muted:string };
  mode: "civic"|"public"|"corporate"|"youth"|"tech"|"warm"|"editorial";
};

export const designSystems: DesignSystem[] = [
  {key:"public_youth_editorial",name:"Civic Youth Editorial",description:"공공기관의 신뢰감에 청년 창업의 에너지를 더한 비대칭 에디토리얼 그리드",fit:"공공기관·재단 × 청년·소상공인·창업",references:[1,6,10,12,14,18],preview:"/design-references/ref-18.png",mode:"civic",colors:{bg:"F7F9FC",ink:"15202B",primary:"123B5D",accent:"21A179",soft:"EAF0F6",muted:"5D6B78"}},
  {key:"public_data",name:"Public Data Blue",description:"넓은 여백, 정책형 정보 위계, 청록 포인트와 명료한 도표",fit:"공공기관·공기업·학교",references:[3,6,14,15,17],preview:"/design-references/ref-14.png",mode:"public",colors:{bg:"F5F7F6",ink:"102A2D",primary:"087E78",accent:"B7DE31",soft:"DDEDEA",muted:"607275"}},
  {key:"corporate_strategy",name:"Corporate Strategy",description:"대형 숫자, 사진과 데이터의 균형, 임원 보고형 구조",fit:"일반기업·관리자·실무자",references:[2,5,8,10,13],preview:"/design-references/ref-10.png",mode:"corporate",colors:{bg:"F4F1EA",ink:"14181D",primary:"1755D1",accent:"FF5A36",soft:"DCE6F8",muted:"697078"}},
  {key:"youth_pop",name:"Youth Pop Lab",description:"라임·바이올렛 대비, 큰 타이포, 스티커형 포인트",fit:"청년·20대·창업교육",references:[4,8,9,12],preview:"/design-references/ref-9.png",mode:"youth",colors:{bg:"F7F5FF",ink:"171527",primary:"6746E8",accent:"B8F13C",soft:"E8E0FF",muted:"666078"}},
  {key:"tech_neon",name:"Tech Neon Grid",description:"딥 네이비 바탕, 발광 포인트, 시스템·네트워크 도식",fit:"IT·AI·개발·스타트업",references:[4,9,11,13,16,17],preview:"/design-references/ref-17.png",mode:"tech",colors:{bg:"0B1020",ink:"F5F7FF",primary:"7857FF",accent:"31E6C5",soft:"192747",muted:"A9B5CF"}},
  {key:"warm_lifestyle",name:"Warm Lifestyle",description:"따뜻한 사진, 둥근 형태, 부담 없는 단계형 안내",fit:"부모·엄마·시니어·복지",references:[2,4,10,11,16],preview:"/design-references/ref-10.png",mode:"warm",colors:{bg:"FFF8EF",ink:"4B342E",primary:"D9666F",accent:"F0B84B",soft:"F7DED6",muted:"806B64"}},
  {key:"premium_editorial",name:"Premium Editorial",description:"흑백 사진, 세리프 포인트, 절제된 컬러와 과감한 크롭",fit:"브랜드·리더십·프리미엄 과정",references:[7,8,10,11,14],preview:"/design-references/ref-11.png",mode:"editorial",colors:{bg:"F2EFE8",ink:"111111",primary:"C8482E",accent:"E8C96A",soft:"DED8CD",muted:"6B6964"}},
];

export function recommendDesign(institutionType="", audience="", topic="") {
  const text=`${institutionType} ${audience} ${topic}`.toLowerCase();
  const isPublic=/공공|공기업|교육기관|재단|공단|정부|지자체|지원기관/.test(text);
  const isYouthBusiness=/청년|20대|대학생|창업|소상공인|자영업/.test(text);
  if(isPublic&&isYouthBusiness) return designSystems.find(x=>x.key==="public_youth_editorial")!;
  if(/엄마|부모|시니어|노인|복지|육아|가족/.test(text)) return designSystems.find(x=>x.key==="warm_lifestyle")!;
  if(/개발|it|ai|인공지능|데이터|테크|스타트업/.test(text) && !/공공|공기업/.test(text)) return designSystems.find(x=>x.key==="tech_neon")!;
  if(isPublic) return designSystems.find(x=>x.key==="public_data")!;
  if(isYouthBusiness) return designSystems.find(x=>x.key==="youth_pop")!;
  if(/브랜드|리더|임원|프리미엄|문화|예술/.test(text)) return designSystems.find(x=>x.key==="premium_editorial")!;
  return designSystems.find(x=>x.key==="corporate_strategy")!;
}

export function resolveDesign(key:string|undefined,institutionType="",audience="",topic="") {
  return designSystems.find(x=>x.key===key) ?? recommendDesign(institutionType,audience,topic);
}
