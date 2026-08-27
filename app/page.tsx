"use client";

import { useEffect, useMemo, useState } from "react";
import { recommendDesign, recommendDesignOptions, resolveDesign, type DesignSystem } from "./design-system";
import { classifyPlan, planTypes } from "./plan-system";

type DeliverableKey = "plan" | "proposal" | "curriculum" | "ppt" | "notion" | "script";
type StageStatus = "not_started" | "drafting" | "awaiting_approval" | "approved" | "revision_requested";
type View = "dashboard" | "create" | "interview" | "brief" | "studio";

type MasterBrief = {
  institutionName: string;
  institutionType: string;
  department: string;
  planType: string;
  audience: string;
  audienceLevel: string;
  audienceCount: string;
  topic: string;
  problem: string;
  purpose: string;
  objectives: string[];
  totalMinutes: string;
  sessions: string;
  deliveryMethod: string;
  practiceRatio: string;
  devices: string;
  accountEnvironment: string;
  designRequest: string;
  designReferenceUrl: string;
  designPreset: string;
  designLocked: boolean;
  notionUrl: string;
  deadline: string;
  location: string;
  budget: string;
  finalDeliverable: string;
};

type Stage = { key: string; label: string; status: StageStatus; version: number; selected: boolean };
type Snapshot = { version: number; approvedAt: string; brief: MasterBrief };
type ArtifactRecord = {
  id: string;
  stageKey: string;
  version: number;
  filename: string;
  format: string;
  downloadUrl: string;
  preview: string[];
  createdAt: string;
  aiGenerated: boolean;
  engineVersion?: number;
  notionUrl?: string;
};
type Project = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  deliverables: DeliverableKey[];
  brief: MasterBrief;
  briefSnapshots: Snapshot[];
  interviewAnswers: Record<string, string>;
  stages: Stage[];
  artifacts: ArtifactRecord[];
  currentStage: string;
};

const STORE_KEY = "ai-lecture-studio-projects-v1";
const DEFAULT_NOTION_URL = "https://app.notion.com/p/3c56eecc5c4d819f8e54ca4b6f9f5837?pvs=204";

const deliverableOptions: { key: DeliverableKey; title: string; description: string; icon: string }[] = [
  { key: "plan", title: "강의기획서", description: "기관 제출용 교육 기획 문서", icon: "01" },
  { key: "proposal", title: "교육제안서", description: "담당자 의사결정을 돕는 제안 문서", icon: "02" },
  { key: "curriculum", title: "세부커리큘럼", description: "시간·내용·실습·결과물 설계", icon: "03" },
  { key: "ppt", title: "강의 PPT", description: "대상 맞춤 디자인과 실제 강의자료", icon: "04" },
  { key: "notion", title: "Notion 워크북", description: "PPT 실습과 연결되는 모바일 워크북", icon: "05" },
  { key: "script", title: "발표스크립트", description: "슬라이드 번호별 대체 강사용 원고", icon: "06" },
];

const stageCatalog = [
  ["master_brief", "MASTER BRIEF", null],
  ["plan", "강의기획서", "plan"],
  ["proposal", "교육제안서", "proposal"],
  ["curriculum", "세부커리큘럼", "curriculum"],
  ["architecture", "PPT 설계", "ppt"],
  ["design", "맞춤 디자인", "ppt"],
  ["ppt", "강의 PPT", "ppt"],
  ["notion", "Notion 워크북", "notion"],
  ["script", "발표스크립트", "script"],
  ["final_qa", "FINAL QA", null],
] as const;

const emptyBrief: MasterBrief = {
  institutionName: "", institutionType: "", department:"", planType:"auto", audience: "", audienceLevel: "", audienceCount: "",
  topic: "", problem: "", purpose: "", objectives: [], totalMinutes: "", sessions: "1",
  deliveryMethod: "강의 + 따라하기 실습", practiceRatio: "50", devices: "", accountEnvironment: "",
  designRequest: "Atomic Lecture System · 첨부 MD 기반 단일 디자인 체계", designReferenceUrl:"", designPreset:"atomic_learning_system_v2", designLocked:true, notionUrl:DEFAULT_NOTION_URL, deadline: "", location:"", budget:"", finalDeliverable:"",
};

const interviewQuestions = [
  { key: "level", label: "참여자의 AI 활용 수준은 어느 정도인가요?", options: ["처음 사용", "기본 대화 가능", "업무 활용 경험"] },
  { key: "result", label: "교육 후 가장 중요한 변화는 무엇인가요?", options: ["AI에 대한 이해", "실제 결과물 완성", "업무·생활 적용"] },
  { key: "practice", label: "원하는 수업 진행 방식은 무엇인가요?", options: ["설명 중심", "설명과 실습 균형", "워크숍 중심"] },
  { key: "tone", label: "자료의 분위기는 어떻게 할까요?", options: ["신뢰감 있고 정돈된", "따뜻하고 친근한", "젊고 역동적인"] },
];

function makeStages(selected: DeliverableKey[]): Stage[] {
  return stageCatalog.map(([key, label, dependency]) => ({
    key, label, version: 0, status: "not_started",
    selected: key === "master_brief" || (dependency !== null && !["architecture","design"].includes(key) && selected.includes(dependency)),
  }));
}

function statusLabel(status: StageStatus) {
  return { not_started: "시작 전", drafting: "작성 중", awaiting_approval: "승인 대기", approved: "승인", revision_requested: "재검토" }[status];
}

function friendlyGenerationError(message:string) {
  if (/401|Missing bearer|Unauthorized/i.test(message)) return "OpenAI 인증 연결을 확인하고 있습니다. 잠시 후 다시 시도해주세요.";
  if (/unexpected argument|실행 옵션/i.test(message)) return "PPT 제작 서버를 업데이트하고 있습니다. 잠시 후 다시 시도해주세요.";
  if (message.length > 180) return `${message.slice(0, 177)}…`;
  return message;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState(false);
  const [storageWritable, setStorageWritable] = useState(true);
  const [view, setView] = useState<View>("dashboard");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MasterBrief>(emptyBrief);
  const [selected, setSelected] = useState<DeliverableKey[]>(["ppt", "notion"]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [objectiveText, setObjectiveText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) {
      const raw=JSON.parse(saved) as unknown;
      if(!Array.isArray(raw))throw new Error("저장 데이터가 배열 형식이 아닙니다.");
      const parsed=(raw as Project[]).map((project)=>{
        const artifacts=project.artifacts??[];
        const sourceBrief=project.brief??emptyBrief;
        const savedBrief={...emptyBrief,...sourceBrief,notionUrl:(!sourceBrief.notionUrl||sourceBrief.notionUrl.includes("eb2c089c67df4ba8adfb8c869f74fdb5")||sourceBrief.notionUrl.includes("3c56eecc5c4d8055b090f160a49fad7d"))?DEFAULT_NOTION_URL:sourceBrief.notionUrl};
        const locked=Boolean(savedBrief.designLocked&&savedBrief.designPreset&&savedBrief.designPreset!=="auto");
        const currentDesign=locked?resolveDesign(savedBrief.designPreset,savedBrief.institutionType,savedBrief.audience,savedBrief.topic):recommendDesign(savedBrief.institutionType,savedBrief.audience,savedBrief.topic);
        const brief={...savedBrief,designLocked:true,designPreset:currentDesign.key,designReferenceUrl:"",designRequest:`${currentDesign.name} · ${currentDesign.description}`};
        const storedStages=Array.isArray(project.stages)?project.stages:makeStages(project.deliverables??["ppt","notion"]);
        const visibleStages=storedStages.map(stage=>["architecture","design","final_qa"].includes(stage.key)?{...stage,selected:false}:stage);
        const visibleCurrent=visibleStages.find(stage=>stage.selected&&stage.status!=="approved")?.key??visibleStages.filter(stage=>stage.selected).at(-1)?.key??"master_brief";
        if(artifacts.length>0&&artifacts.every((artifact)=>(artifact.engineVersion??0)>=18))return {...project,brief,artifacts,stages:visibleStages,currentStage:visibleStages.some(stage=>stage.key===project.currentStage&&stage.selected)?project.currentStage:visibleCurrent};
        const stages=visibleStages.map((stage)=>stage.key==="master_brief"?stage:{...stage,status:"not_started" as StageStatus,version:0});
        return {...project,brief,artifacts:[],stages,currentStage:stages.find((stage)=>stage.selected&&stage.key!=="master_brief")?.key??"final_qa"};
      });
      setProjects(parsed);
      }
    } catch {
      setProjects([]);
      setStorageWritable(false);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready&&storageWritable) localStorage.setItem(STORE_KEY, JSON.stringify(projects));
  }, [projects, ready, storageWritable]);

  const active = useMemo(() => projects.find((project) => project.id === activeId) ?? null, [projects, activeId]);

  function patchActive(updater: (project: Project) => Project) {
    setProjects((items) => items.map((project) => project.id === activeId ? updater(project) : project));
  }

  function beginCreate() {
    setStorageWritable(true); setDraft(emptyBrief); setSelected(["ppt", "notion"]); setAnswers({}); setView("create"); setActiveId(null);
  }

  function createProject() {
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(), title: draft.topic || "새 강의 프로젝트", createdAt: now, updatedAt: now,
      deliverables: selected, brief: draft, briefSnapshots: [], interviewAnswers: {}, stages: makeStages(selected), currentStage: "master_brief",
      artifacts: [],
    };
    setProjects((items) => [project, ...items]); setActiveId(project.id); setView("interview");
  }

  function completeInterview() {
    if (!active) return;
    const result = answers.result ?? "실제 결과물 완성";
    const inferredObjectives = [
      `${active.brief.topic || "교육 주제"}의 핵심 개념을 자신의 상황에 맞게 설명할 수 있다.`,
      `AI 도구를 활용하여 ${result}에 필요한 결과물 한 가지를 완성할 수 있다.`,
      "완성한 결과물을 점검하고 자신의 상황에 맞게 수정할 수 있다.",
    ];
    const interviewDesign=active.brief.designLocked?resolveDesign(active.brief.designPreset,active.brief.institutionType,active.brief.audience,active.brief.topic):recommendDesign(active.brief.institutionType,active.brief.audience,active.brief.topic);
    patchActive((p) => ({ ...p, updatedAt: new Date().toISOString(), interviewAnswers: answers, brief: {
      ...p.brief,
      audienceLevel: answers.level ?? p.brief.audienceLevel,
      deliveryMethod: answers.practice ?? p.brief.deliveryMethod,
      designRequest: `${interviewDesign.name} · ${interviewDesign.description}`,
      designReferenceUrl:p.brief.designReferenceUrl??"",
      designPreset:interviewDesign.key,
      notionUrl:p.brief.notionUrl??"",
      objectives: p.brief.objectives.length ? p.brief.objectives : inferredObjectives,
    }}));
    setView("brief");
  }

  function approveBrief() {
    if (!active) return;
    const nextVersion = active.briefSnapshots.length + 1;
    patchActive((p) => ({
      ...p, updatedAt: new Date().toISOString(), currentStage: p.stages.find((s) => s.selected && s.key !== "master_brief")?.key ?? "final_qa",
      briefSnapshots: [...p.briefSnapshots, { version: nextVersion, approvedAt: new Date().toISOString(), brief: structuredClone(p.brief) }],
      stages: p.stages.map((s) => s.key === "master_brief" ? { ...s, status: "approved", version: nextVersion } : s),
    }));
    setView("studio");
  }

  function toggleDeliverable(key: DeliverableKey) {
    setSelected((items) => items.includes(key) ? items.filter((item) => item !== key) : [...items, key]);
  }

  function openProject(project: Project) {
    setActiveId(project.id);
    setView(project.briefSnapshots.length ? "studio" : "interview");
    setAnswers(project.interviewAnswers);
  }

  function updateStage(key: string, action: "draft" | "approve" | "revise") {
    patchActive((p) => { const nextStages:Stage[]=p.stages.map((s) => s.key === key ? {
      ...s,
      status: action === "draft" ? "awaiting_approval" : action === "approve" ? "approved" : "revision_requested",
      version: action === "draft" ? s.version + 1 : s.version,
    } : s); const nextCurrent=action === "approve" ? nextStages.find((s)=>s.selected&&s.status!=="approved")?.key ?? "final_qa" : p.currentStage; return { ...p, currentStage:nextCurrent, updatedAt: new Date().toISOString(), stages:nextStages }; });
  }

  async function generateStage(key: string) {
    if (!active) throw new Error("프로젝트를 찾을 수 없습니다.");
    const stage=active.stages.find((s)=>s.key===key);
    const version=(stage?.version ?? 0)+1;
    let slideMasterFallback=false;
    if(key==="ppt"&&!active.brief.designLocked){
      try{
        const presenton=await fetch("/api/presenton",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:active.id,projectTitle:active.title,brief:active.brief})});
        if(presenton.ok){
          const deck=await presenton.json();
          const artifact:ArtifactRecord={id:crypto.randomUUID(),stageKey:key,version,filename:`${active.title}_Presenton_v${version}.pptx`,format:"pptx",downloadUrl:deck.downloadUrl,preview:[`Presenton 오픈소스 템플릿 엔진 · ${deck.slideCount}장`,`선택 디자인 시스템 · ${resolveDesign(active.brief.designPreset,active.brief.institutionType,active.brief.audience,active.brief.topic).name}`,"편집 가능한 PPTX와 시각자료 구성 완료"],createdAt:new Date().toISOString(),aiGenerated:true,engineVersion:200};
          patchActive((p)=>({...p,artifacts:[...(p.artifacts??[]),artifact],updatedAt:new Date().toISOString(),stages:p.stages.map(s=>s.key===key?{...s,status:"awaiting_approval",version}:s)}));
          return;
        }
      }catch{/* Presenton 미설정 또는 장애 시 다음 엔진으로 자동 전환 */}
      try{
      const start=await fetch("/api/slide-master",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:active.id,projectTitle:active.title,brief:active.brief})});
      if(start.ok){
        const queued=await start.json();let job=queued;
        for(let attempt=0;attempt<180&&!["complete","failed"].includes(job.status);attempt++){
          await new Promise(resolve=>setTimeout(resolve,5000));
          const check=await fetch(`/api/slide-master?id=${encodeURIComponent(queued.id)}`,{cache:"no-store"});
          if(!check.ok)throw new Error("Slide Master 작업 상태를 확인하지 못했습니다.");
          job=await check.json();
        }
        if(job.status!=="complete")throw new Error(job.error||"Slide Master 제작 시간이 초과되었습니다.");
        const artifact:ArtifactRecord={id:crypto.randomUUID(),stageKey:key,version,filename:`${active.title}_Slide_Master_v${version}.pptx`,format:"pptx",downloadUrl:`/api/slide-master?id=${encodeURIComponent(job.id)}&download=1`,preview:["GitHub Slide Master 에이전트 파이프라인 적용","SVG→편집 가능한 PPTX 변환 완료","전체 렌더링 및 verify_deck 검수 완료"],createdAt:new Date().toISOString(),aiGenerated:true,engineVersion:100};
        patchActive((p)=>({...p,artifacts:[...(p.artifacts??[]),artifact],updatedAt:new Date().toISOString(),stages:p.stages.map(s=>s.key===key?{...s,status:"awaiting_approval",version}:s)}));
        return;
      }
      if(!start.ok)slideMasterFallback=true;
      }catch{slideMasterFallback=true}
    }
    const response=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectId:active.id,projectTitle:active.title,stage:key,version,brief:active.brief,deliverables:active.deliverables,artifacts:active.artifacts??[]})});
    const result=await response.json();
    if(!response.ok) throw new Error(result.error||"결과물 생성에 실패했습니다.");
    if(slideMasterFallback&&result.artifact?.preview)result.artifact.preview=["PPT 제작 서버 자동 복구 경로 적용",...result.artifact.preview];
    patchActive((p)=>({ ...p, artifacts:[...(p.artifacts??[]),result.artifact],updatedAt:new Date().toISOString(),stages:p.stages.map((s)=>s.key===key?{...s,status:"awaiting_approval",version}:s)}));
  }

  if (!ready) return <main className="loading">프로젝트를 불러오는 중입니다.</main>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("dashboard")}>
          <span className="brand-mark">A</span><span><b>AI LECTURE</b><small>STUDIO</small></span>
        </button>
        <nav>
          <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}><span>⌂</span> 프로젝트</button>
          <button onClick={beginCreate}><span>＋</span> 새 강의 만들기</button>
          <button><span>◇</span> 템플릿</button>
          <button onClick={() => { window.location.href = "/admin"; }}><span>⚙</span> 관리자</button>
        </nav>
        <div className="sidebar-note"><b>제작 원칙</b><p>승인된 단계만 다음 결과물의 입력으로 사용합니다.</p></div>
        <div className="profile"><span>문</span><div><b>문정수 강사</b><small>한국AI콘텐츠연구원</small></div></div>
      </aside>

      <main className="main">
        {view === "dashboard" && <Dashboard projects={projects} onCreate={beginCreate} onOpen={openProject} />}
        {view === "create" && <CreateProject draft={draft} setDraft={setDraft} selected={selected} toggle={toggleDeliverable} onNext={createProject} />}
        {view === "interview" && active && <Interview project={active} answers={answers} setAnswers={setAnswers} onBack={() => setView("create")} onComplete={completeInterview} />}
        {(view === "brief" || view === "studio") && active && <div className="global-edit-bar"><button className="secondary" onClick={() => setView(view === "studio" ? "brief" : active.briefSnapshots.length ? "studio" : "interview")}>{view === "studio" ? "기준정보 수정" : "← 이전 화면"}</button><span>{view === "studio" ? "기획서·PPT·Notion의 공통 입력값을 수정합니다." : "잘못 입력한 내용을 수정한 뒤 다시 확정할 수 있습니다."}</span></div>}
        {view === "studio" && active?.artifacts.filter(a=>a.stageKey==="notion").at(-1) && <a className="notion-workbook-quick" href={active.artifacts.filter(a=>a.stageKey==="notion").at(-1)!.downloadUrl} download>Notion 워크북 파일 ↓</a>}
        {view === "brief" && active && <Brief project={active} objectiveText={objectiveText} setObjectiveText={setObjectiveText} onChange={(brief) => patchActive((p) => ({ ...p, brief, stages:p.stages.map(s=>s.key==="master_brief"?s:{...s,status:"revision_requested"}) }))} onApprove={approveBrief} />}
        {view === "studio" && active && <Studio project={active} onStage={updateStage} onGenerate={generateStage} />}
      </main>
    </div>
  );
}

function Dashboard({ projects, onCreate, onOpen }: { projects: Project[]; onCreate: () => void; onOpen: (p: Project) => void }) {
  const approved = projects.filter((p) => p.briefSnapshots.length).length;
  return <div className="page dashboard">
    <header className="page-header"><div><span className="eyebrow">PROJECT DASHBOARD</span><h1>좋은 강의는<br/>명확한 설계에서 시작됩니다.</h1><p>한 번 입력하고, 단계별로 확인하며, 연결된 결과물을 완성하세요.</p></div><button className="primary large" onClick={onCreate}>새 강의 만들기 <span>→</span></button></header>
    <section className="stats"><div><small>전체 프로젝트</small><b>{projects.length}</b><span>진행 중인 강의 포함</span></div><div><small>브리프 승인</small><b>{approved}</b><span>제작 준비 완료</span></div><div><small>승인 대기 단계</small><b>{projects.reduce((n,p) => n + p.stages.filter(s => s.status === "awaiting_approval").length, 0)}</b><span>확인이 필요합니다</span></div></section>
    <section className="section-title"><div><span className="eyebrow">RECENT PROJECTS</span><h2>최근 프로젝트</h2></div></section>
    {projects.length === 0 ? <div className="empty"><span>✦</span><h3>첫 번째 강의를 만들어보세요</h3><p>기관과 대상, 주제를 입력하면 필요한 질문부터 시작합니다.</p><button className="secondary" onClick={onCreate}>프로젝트 시작하기</button></div> :
      <div className="project-grid">{projects.map((p) => { const current = p.stages.find(s => s.key === p.currentStage); return <button className="project-card" key={p.id} onClick={() => onOpen(p)}><div className="project-top"><span className="tag">{p.brief.institutionType || "교육 프로젝트"}</span><span>•••</span></div><h3>{p.title}</h3><p>{p.brief.institutionName || "기관 미정"} · {p.brief.audience || "대상 미정"}</p><div className="deliverable-mini">{p.deliverables.slice(0,4).map(d => <span key={d}>{deliverableOptions.find(o=>o.key===d)?.title}</span>)}</div><div className="progress"><i style={{width: `${Math.max(8, p.stages.filter(s=>s.status==="approved").length / p.stages.filter(s=>s.selected).length * 100)}%`}}/></div><footer><span>{current?.label ?? "MASTER BRIEF"}</span><b>{p.briefSnapshots.length ? "제작 중" : "인터뷰 필요"} →</b></footer></button>})}</div>}
  </div>;
}

function CreateProject({ draft, setDraft, selected, toggle, onNext }: { draft: MasterBrief; setDraft: (b: MasterBrief) => void; selected: DeliverableKey[]; toggle: (k: DeliverableKey) => void; onNext: () => void }) {
  const [step,setStep]=useState(0);
  const field = (key: keyof MasterBrief, value: string) => setDraft({ ...draft, [key]: value });
  const recommendations=recommendDesignOptions(draft.institutionType,draft.audience,draft.topic);
  const selectDesign=(design:DesignSystem)=>setDraft({...draft,designPreset:design.key,designLocked:true,designRequest:`${design.name} · ${design.description}`,designReferenceUrl:""});
  const recommendedPlan=classifyPlan(draft.institutionType,draft.audience,draft.topic,draft.purpose,draft.planType);
  const titles=["기관과 교육","기획서와 운영","PPT 디자인","결과물과 Notion"];
  const valid=[Boolean(draft.institutionType&&draft.audience&&draft.topic&&draft.totalMinutes),true,true,selected.length>0][step];
  return <div className="page form-page wizard-page"><div className="wizard-head"><div><span className="eyebrow">NEW LECTURE · STEP {step+1}/4</span><h1>{titles[step]}</h1><p>한 화면씩 입력하면 자동 저장됩니다.</p></div><div className="wizard-progress">{titles.map((t,i)=><button type="button" key={t} className={i===step?"active":i<step?"done":""} onClick={()=>i<=step&&setStep(i)}><span>{i<step?"✓":i+1}</span>{t}</button>)}</div></div>
    <div className="wizard-card">
      {step===0&&<div className="form-grid"><label>기관명<input value={draft.institutionName} onChange={e=>field("institutionName",e.target.value)} placeholder="예: 부산시설공단"/></label><label>기관 유형<select value={draft.institutionType} onChange={e=>field("institutionType",e.target.value)}><option value="">선택해주세요</option><option>공공기관</option><option>공기업</option><option>일반기업</option><option>학교·교육기관</option><option>복지기관</option><option>청년·창업기관</option><option>소상공인 지원기관</option></select></label><label>교육 대상<input value={draft.audience} onChange={e=>field("audience",e.target.value)} placeholder="예: 청년 소상공인"/></label><label>인원<input value={draft.audienceCount} onChange={e=>field("audienceCount",e.target.value)} placeholder="예: 25명"/></label><label className="wide">교육 주제<input value={draft.topic} onChange={e=>field("topic",e.target.value)} placeholder="예: 생성형 AI를 활용한 업무효율화"/></label><label>총 교육시간<input value={draft.totalMinutes} onChange={e=>field("totalMinutes",e.target.value)} placeholder="예: 180분"/></label><label>차시<input value={draft.sessions} onChange={e=>field("sessions",e.target.value)} placeholder="예: 1"/></label><label className="wide">교육 목적<textarea value={draft.purpose} onChange={e=>field("purpose",e.target.value)} placeholder="교육 후 참여자가 어떻게 달라질지 적어주세요."/></label></div>}
      {step===1&&<><div className="plan-recommend"><span>AUTO CLASSIFICATION</span><b>{recommendedPlan.key} · {recommendedPlan.name}</b><p>{recommendedPlan.document} · {recommendedPlan.focus}</p></div><div className="form-grid"><label>담당부서<input value={draft.department} onChange={e=>field("department",e.target.value)} placeholder="미정이면 비워두세요"/></label><label>기획서 유형<select value={draft.planType} onChange={e=>field("planType",e.target.value)}><option value="auto">자동 판별</option>{planTypes.map(t=><option key={t.key} value={t.key}>{t.key} · {t.name}</option>)}</select></label><label>교육 장소·환경<input value={draft.location} onChange={e=>field("location",e.target.value)} placeholder="예: 전산교육장 / 노트북 / Wi-Fi"/></label><label>예산<input value={draft.budget} onChange={e=>field("budget",e.target.value)} placeholder="미정이면 비워두세요"/></label><label className="wide">참여자 최종 결과물<input value={draft.finalDeliverable} onChange={e=>field("finalDeliverable",e.target.value)} placeholder="예: 회사소개서·제안서·카드뉴스"/></label></div></>}
      {step===2&&<><div className="design-source"><div><span>ATOMIC DESIGN SYSTEM</span><b>첨부 MD를 기준으로 하나의 디자인 체계를 적용합니다.</b><p>기관과 대상에 따라 내용 밀도와 사례는 달라지지만 구성 규칙과 품질 기준은 유지됩니다.</p></div><span className="system-badge">MD APPLIED</span></div><div className="atomic-map" aria-label="Atomic Design 적용 구조"><div><span>01 · FOUNDATION</span><b>글꼴 · 색 · 간격</b></div><i>→</i><div><span>02 · ATOM/MOLECULE</span><b>제목 · 근거 · 시각자료</b></div><i>→</i><div><span>03 · ORGANISM/TEMPLATE</span><b>표지 · 개념 · 실습 · 도표</b></div></div><div className="design-options single">{recommendations.map((p)=><button type="button" key={p.key} className={`design-option ${draft.designPreset===p.key?"selected":""}`} onClick={()=>selectDesign(p)}><div className="design-option-image" style={{backgroundImage:`linear-gradient(180deg,transparent 42%,rgba(5,13,12,.8)),url(${p.preview})`}}><span>단일 적용 디자인</span><em>{p.tags.join(" · ")}</em></div><div className="design-option-body"><div><b>{p.name}</b>{draft.designPreset===p.key&&<i>적용됨</i>}</div><p>{p.description}</p><div className="layer-contract"><span>{p.layers.foundation}</span><span>{p.layers.atom}</span><span>{p.layers.molecule}</span><span>{p.layers.organism}</span><span>{p.layers.template}</span></div><div className="palette-row">{Object.values(p.colors).slice(0,5).map((color,j)=><span key={j} style={{background:`#${color}`}}/>)}<mark>{p.fit}</mark></div></div></button>)}</div><label className="design-note">기관·대상별 추가 요청<textarea value={draft.designRequest} onChange={e=>field("designRequest",e.target.value)} placeholder="예: 공공기관 신뢰감은 유지하고 청년 사례를 더 크게 보여주세요."/></label><p className="design-legal">기존 외부 사이트 기반 프리셋은 제거했습니다. 첨부한 Atomic Design 문서의 시스템·콘텐츠·상태·검증 원칙만 적용합니다.</p></>}
      {step===3&&<><div className="deliverable-grid">{deliverableOptions.map(o=><button key={o.key} type="button" className={selected.includes(o.key)?"deliverable selected":"deliverable"} onClick={()=>toggle(o.key)}><span>{o.icon}</span><div><b>{o.title}</b><small>{o.description}</small></div><i>{selected.includes(o.key)?"✓":"＋"}</i></button>)}</div>{selected.includes("notion")&&<label className="notion-field">Notion 워크북 페이지 URL<input value={draft.notionUrl} onChange={e=>field("notionUrl",e.target.value)} placeholder="편집 가능한 빈 Notion 페이지 주소"/><small>PPT의 PRACTICE ID와 같은 실습 워크북이 자동 생성됩니다.</small></label>}</>}
    </div><div className="wizard-actions"><button className="secondary" disabled={step===0} onClick={()=>setStep(step-1)}>← 이전</button><span>{step+1} / 4</span>{step<3?<button className="primary" disabled={!valid} onClick={()=>setStep(step+1)}>다음 →</button>:<button className="primary" disabled={!valid} onClick={onNext}>입력 완료 →</button>}</div>
  </div>;
}

function Interview({ project, answers, setAnswers, onBack, onComplete }: { project: Project; answers: Record<string,string>; setAnswers: (a:Record<string,string>)=>void; onBack:()=>void; onComplete:()=>void }) {
  return <div className="page interview-page"><div className="compact-header"><div><span className="eyebrow">SMART INTERVIEW</span><h1>결과의 방향을 정하는<br/>네 가지만 확인할게요.</h1><p><b>{project.brief.institutionName || "기관"}</b> · {project.brief.audience} · {project.brief.topic}</p></div><div className="completion-ring"><b>{Object.keys(answers).length}</b><span>/ 4</span></div></div><div className="question-list">{interviewQuestions.map((q,i)=><section className="question" key={q.key}><header><span>Q{i+1}</span><h2>{q.label}</h2>{i===1 && <em>추천 기준: 실제 결과물 중심</em>}</header><div className="answer-row">{q.options.map((option,j)=><button key={option} className={answers[q.key]===option?"answer selected":"answer"} onClick={()=>setAnswers({...answers,[q.key]:option})}><span>{j+1}</span>{option}{j===1 && <small>추천</small>}</button>)}<button className={answers[q.key]?.startsWith("직접:")?"answer selected":"answer"} onClick={()=>{const v=prompt("직접 입력해주세요"); if(v)setAnswers({...answers,[q.key]:`직접: ${v}`})}}><span>4</span>직접 입력</button></div></section>)}</div><div className="form-actions"><button className="text-button" onClick={onBack}>← 이전</button><button className="primary" disabled={Object.keys(answers).length<4} onClick={onComplete}>MASTER BRIEF 만들기 →</button></div></div>;
}

function Brief({ project, onChange, onApprove }: { project: Project; objectiveText: string; setObjectiveText:(s:string)=>void; onChange:(b:MasterBrief)=>void; onApprove:()=>void }) {
  const b=project.brief;
  const recommended=resolveDesign(b.designPreset,b.institutionType,b.audience,b.topic);
  const change=(key:keyof MasterBrief,value:string|string[])=>{const next={...b,[key]:value};if(!next.designLocked&&["institutionName","institutionType","audience","topic"].includes(key)){const design=recommendDesign(next.institutionType,next.audience,next.topic);next.designPreset=design.key;next.designRequest=`${design.name} · ${design.description}`;}onChange(next)};
  const warnings=[!b.institutionName&&"기관명이 아직 정해지지 않았습니다.",!b.totalMinutes&&"총 교육시간을 입력해주세요.",!b.devices&&"참여자 기기 환경을 확인하면 실습 설계가 더 정확해집니다."].filter(Boolean);
  return <div className="page brief-page"><div className="compact-header"><div><span className="eyebrow">MASTER BRIEF</span><h1>제작의 기준정보를 확인해주세요.</h1><p>확정하면 현재 내용을 변경할 수 없는 승인 버전으로 보관합니다.</p></div><div className="brief-status"><span>승인 전</span><b>검토가 필요합니다</b></div></div>{warnings.length>0&&<div className="warning-box"><b>확인할 내용 {warnings.length}개</b>{warnings.map(w=><span key={String(w)}>· {w}</span>)}</div>}<div className="brief-grid"><section><header><span>01</span><h2>기관과 대상</h2></header><label>기관명<input value={b.institutionName} onChange={e=>change("institutionName",e.target.value)}/></label><label>기관 유형<input value={b.institutionType} onChange={e=>change("institutionType",e.target.value)}/></label><label>대상<input value={b.audience} onChange={e=>change("audience",e.target.value)}/></label><label>수준<input value={b.audienceLevel} onChange={e=>change("audienceLevel",e.target.value)}/></label></section><section><header><span>02</span><h2>교육 설계</h2></header><label>강의 주제<input value={b.topic} onChange={e=>change("topic",e.target.value)}/></label><label>교육 목적<textarea value={b.purpose} onChange={e=>change("purpose",e.target.value)}/></label><label>총시간<input value={b.totalMinutes} onChange={e=>change("totalMinutes",e.target.value)}/></label><label>진행방식<input value={b.deliveryMethod} onChange={e=>change("deliveryMethod",e.target.value)}/></label></section><section className="span-two"><header><span>03</span><h2>행동형 교육목표</h2></header><div className="objective-list">{b.objectives.map((o,i)=><div key={i}><b>{String(i+1).padStart(2,"0")}</b><textarea value={o} onChange={e=>change("objectives",b.objectives.map((x,j)=>j===i?e.target.value:x))}/><button onClick={()=>change("objectives",b.objectives.filter((_,j)=>j!==i))}>×</button></div>)}<button className="add-row" onClick={()=>change("objectives",[...b.objectives,"새로운 행동형 목표를 입력하세요."])}>＋ 교육목표 추가</button></div></section><section><header><span>04</span><h2>환경과 안전</h2></header><label>기기 환경<input value={b.devices} onChange={e=>change("devices",e.target.value)} placeholder="예: 개인 스마트폰"/></label><label>계정·인터넷<input value={b.accountEnvironment} onChange={e=>change("accountEnvironment",e.target.value)} placeholder="예: 무료 Google 계정"/></label></section><section><header><span>05</span><h2>디자인 방향</h2></header><label>자동 생성된 디자인 콘셉트<textarea value={b.designRequest} onChange={e=>change("designRequest",e.target.value)}/></label><div className="design-preview"><span/><div><b>{recommended.name}</b><small>{recommended.description}</small></div></div></section></div><div className="form-actions sticky"><span>확정 후 수정하면 하위 단계가 재검토 상태로 전환됩니다.</span><button className="secondary">수정 내용 저장</button><button className="primary" disabled={!b.topic||!b.audience||!b.totalMinutes} onClick={onApprove}>확정하고 제작 스튜디오 열기 →</button></div></div>;
}

function Studio({ project, onStage, onGenerate }: { project: Project; onStage:(key:string,action:"draft"|"approve"|"revise")=>void; onGenerate:(key:string)=>Promise<void> }) {
  const [generating,setGenerating]=useState(false); const [error,setError]=useState("");
  const selectedStages=project.stages.filter(s=>s.selected);
  const nextStage=selectedStages.find(s=>s.status!=="approved") ?? selectedStages[selectedStages.length-1];
  const [viewedKey,setViewedKey]=useState(project.currentStage||nextStage.key);
  useEffect(()=>{if(!selectedStages.some(s=>s.key===viewedKey))setViewedKey(nextStage.key)},[project.currentStage]);
  const current=selectedStages.find(s=>s.key===viewedKey)??nextStage;
  const artifacts=(project.artifacts??[]).filter(a=>a.stageKey===current.key);
  const artifact=artifacts.at(-1);
  const isNext=current.key===nextStage.key;
  async function run(){setGenerating(true);setError("");try{await onGenerate(current.key)}catch(e){setError(friendlyGenerationError(e instanceof Error?e.message:"결과물 생성에 실패했습니다."))}finally{setGenerating(false)}}
  return <div className="studio">
    <aside className="stage-list"><div className="stage-project"><span className="eyebrow">PRODUCTION WORKSPACE</span><h2>{project.title}</h2><p>{project.brief.institutionName} · {project.brief.audience}</p></div><div className="stage-progress"><span>{selectedStages.filter(s=>s.status==="approved").length}/{selectedStages.length} 완료</span><i><b style={{width:`${selectedStages.filter(s=>s.status==="approved").length/selectedStages.length*100}%`}}/></i></div><ol>{selectedStages.map((s,i)=><li className={`${s.key===current.key?"current ":""}${s.status==="approved"?"done":""}`} key={s.key}><button type="button" onClick={()=>{setViewedKey(s.key);setError("")}}><span>{s.status==="approved"?"✓":String(i+1).padStart(2,"0")}</span><div><b>{s.label}</b><small>{statusLabel(s.status)}{s.version?` · v${s.version}`:""}</small></div></button></li>)}</ol></aside>
    <section className="studio-main"><header><div><span className="eyebrow">{isNext?"NEXT PRODUCTION STEP":"RESULT ARCHIVE"} · {current.key.toUpperCase()}</span><h1>{current.label}</h1><p>{isNext?`승인된 MASTER BRIEF v${project.briefSnapshots.at(-1)?.version}을 기준으로 제작합니다.`:"완료된 단계의 결과를 다시 확인하고 내려받을 수 있습니다."}</p></div><span className={`status-pill ${current.status}`}>{statusLabel(current.status)}</span></header>
      <div className="preview-panel"><div className="preview-icon">{generating?"…":artifact?"✓":"✦"}</div><span className="result-kicker">{artifact?"DELIVERABLE READY":"READY TO PRODUCE"}</span><h2>{generating?"실제 결과물을 생성하고 있습니다.":artifact?artifact.filename:`${current.label} 제작 준비가 되었습니다.`}</h2><p>{generating?"내용 구성과 파일 제작을 진행 중입니다. 잠시만 기다려주세요.":artifact?current.key==="notion"?"실제 Notion 워크북이 준비되었습니다.":"생성된 최종 결과물을 내려받을 수 있습니다.":isNext?"아래 버튼을 누르면 승인된 내용을 기준으로 실제 결과물을 만듭니다.":"이 단계에는 저장된 결과물이 없습니다."}</p>{error&&<div className="generation-error">{error}</div>}{artifact&&<div className="artifact-preview">{artifact.preview.map((line,i)=><p key={i}>{line}</p>)}<a className="download-button" href={current.key==="notion"?project.brief.notionUrl:artifact.downloadUrl} target={current.key==="notion"?"_blank":undefined} rel="noreferrer" download={current.key==="notion"?undefined:true}>{current.key==="notion"?"Notion 워크북 보기":"결과물 다운로드"}<span>{current.key==="notion"?"↗":"↓"}</span></a><small>최신 결과 · v{artifact.version}</small>{current.key!=="notion"&&artifacts.length>1&&<div className="version-list"><b>이전 결과</b>{artifacts.slice(0,-1).reverse().map(a=><a key={a.id} href={a.downloadUrl} download>v{a.version} · 결과물<span>↓</span></a>)}</div>}</div>}<div className="input-summary"><span>PROJECT SOURCE</span><b>{project.brief.topic}</b><small>{project.brief.totalMinutes} · {project.brief.deliveryMethod}</small></div></div>
      <footer className="studio-actions">{isNext&&(current.status==="not_started"||current.status==="revision_requested")&&<button className="primary" disabled={generating} onClick={run}>{generating?"생성 중…":"결과물 생성 →"}</button>}{isNext&&current.status==="awaiting_approval"&&artifact&&<><button className="secondary" onClick={()=>onStage(current.key,"revise")}>수정 요청</button><button className="primary" onClick={()=>{onStage(current.key,"approve");const idx=selectedStages.findIndex(s=>s.key===current.key);setViewedKey(selectedStages[idx+1]?.key??current.key)}}>확인 및 승인 →</button></>}</footer></section>
    <aside className="qa-panel"><span className="eyebrow">QUALITY CONTROL</span><h3>산출물 상태</h3><div className="quality-score"><b>{artifact?"READY":"WAIT"}</b><span>{artifact?"다운로드 가능":"생성 대기"}</span></div><ul><li><span>✓</span>승인 브리프 연결</li><li><span>✓</span>선택 결과물 범위 확인</li><li><span>✓</span>기관·대상 디자인 기준</li><li><span>{artifact?"✓":"○"}</span>실제 결과 파일</li></ul><div className="mapping-card"><b>PPT ↔ Notion 연결</b><p>실습 ID와 슬라이드 번호를 하나의 흐름으로 관리합니다.</p><code>PRACTICE-01 · S07</code></div></aside>
  </div>;
}
