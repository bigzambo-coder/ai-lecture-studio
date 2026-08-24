export type PlanTypeKey = "A"|"B"|"C"|"D"|"E"|"F";

export const planTypes = [
  {key:"A" as const,name:"공공기관·지자체 일반교육",document:"교육기획서",focus:"기관 목적·교육 필요성·성과·협조사항"},
  {key:"B" as const,name:"공공기관 교육용역 입찰",document:"입찰 제안서",focus:"RFP 대응·수행계획·인력·품질·위험·증빙"},
  {key:"C" as const,name:"기업·중소기업 교육",document:"기업교육 제안서",focus:"현업 문제·업무 변화·KPI·보안·30일 활용"},
  {key:"D" as const,name:"소상공인 지원교육",document:"지원교육 기획서",focus:"쉬운 실습·무료 계정·구체적 결과물·실제 활용"},
  {key:"E" as const,name:"학교·대학 교육",document:"교육프로그램 운영계획서",focus:"학습목표·활동·평가 정렬·루브릭·안전"},
  {key:"F" as const,name:"행사·특강",document:"행사 운영계획서",focus:"당일 운영·역할·모집·비상대응·결과정리"},
];

export function classifyPlan(institutionType="",audience="",topic="",purpose="",requested="auto"){
  if(requested!=="auto"){const picked=planTypes.find(x=>x.key===requested);if(picked)return picked}
  const text=`${institutionType} ${audience} ${topic} ${purpose}`.toLowerCase();
  if(/입찰|제안요청서|rfp|나라장터|정량평가|정성평가/.test(text))return planTypes[1];
  if(/임직원|부서|업무효율|사내교육|현업 적용|현업적용/.test(text))return planTypes[2];
  if(/소상공인|자영업자|점포|매장|상권|예비창업/.test(text))return planTypes[3];
  if(/학생|학년|교사|학교|대학|비교과|진로/.test(text))return planTypes[4];
  if(/행사|특강|세미나|설명회|모집|접수/.test(text))return planTypes[5];
  return planTypes[0];
}

export function planPlaceholders(value=""){return value.trim()||"[직접 입력]"}
