"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";

type Job = { id: string; status: "queued" | "running" | "complete" | "failed"; created_at: string; progress: string; error: string };
type Overview = { health: { ok?: boolean; engine?: string; codex_available?: boolean }; jobs: Job[]; backendPending?: boolean };
const labels = { queued: "대기", running: "제작 중", complete: "완료", failed: "실패" };

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    if (response.status === 401) { setAuthenticated(false); setLoading(false); return; }
    setOverview(await response.json()); setLoading(false);
  }, []);
  useEffect(() => { fetch("/api/admin/session").then(r => r.json()).then(data => { setAuthenticated(data.authenticated); setConfigured(data.configured); if (data.authenticated) load(); }); }, [load]);
  async function login(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const result = await response.json(); setLoading(false);
    if (!response.ok) { setError(result.error); return; }
    setPassword(""); setAuthenticated(true); load();
  }
  async function logout() { await fetch("/api/admin/session", { method: "DELETE" }); setAuthenticated(false); setOverview(null); }
  const counts = useMemo(() => ({ total: overview?.jobs.length ?? 0, running: overview?.jobs.filter(j => j.status === "queued" || j.status === "running").length ?? 0, complete: overview?.jobs.filter(j => j.status === "complete").length ?? 0, failed: overview?.jobs.filter(j => j.status === "failed").length ?? 0 }), [overview]);

  if (authenticated === null) return <main className={styles.center}>관리자 정보를 확인하는 중입니다.</main>;
  if (!authenticated) return <main className={styles.login}><a href="/" className={styles.wordmark}>AI LECTURE <span>STUDIO</span></a><form onSubmit={login}><p>ADMIN CONSOLE</p><h1>관리자 로그인</h1><span>생성 작업과 백엔드 상태를 안전하게 관리합니다.</span><label>관리자 비밀번호<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></label>{!configured && <div className={styles.notice}>배포 환경에 ADMIN_PASSWORD를 먼저 설정해주세요.</div>}{error && <div className={styles.error}>{error}</div>}<button disabled={loading || !configured}>{loading ? "확인 중…" : "관리자 페이지 열기"}</button></form></main>;

  return <main className={styles.shell}><aside><a href="/" className={styles.wordmark}>AI LECTURE <span>STUDIO</span></a><nav><b>운영 현황</b><span>사용자 프로젝트 정보는 각 브라우저에 안전하게 보관됩니다.</span></nav><a href="/">← 제작 스튜디오</a><button onClick={logout}>로그아웃</button></aside><section className={styles.content}><header><div><p>ADMIN CONSOLE</p><h1>제작 운영 현황</h1><span>Slide Master 작업과 서버 상태를 한눈에 확인하세요.</span></div><button onClick={load} disabled={loading}>{loading ? "새로 고침 중…" : "새로 고침"}</button></header><div className={styles.health}><i className={overview?.health.ok ? styles.live : ""}/><div><b>{overview?.health.ok ? "PPT 백엔드 정상" : "백엔드 확인 필요"}</b><span>{overview?.health.engine ?? "Render 연결 상태를 확인해주세요."}</span></div><em>{overview?.health.codex_available ? "CODEX READY" : "CHECK"}</em></div><div className={styles.stats}><article><span>전체 작업</span><b>{counts.total}</b></article><article><span>현재 진행</span><b>{counts.running}</b></article><article><span>완료</span><b>{counts.complete}</b></article><article><span>실패</span><b>{counts.failed}</b></article></div><section className={styles.table}><div className={styles.tableHead}><div><p>RECENT JOBS</p><h2>최근 PPT 생성 작업</h2></div><span>최근 100건</span></div>{overview?.backendPending ? <div className={styles.empty}>새 백엔드 버전이 배포되면 작업 목록이 표시됩니다.</div> : !overview?.jobs.length ? <div className={styles.empty}>아직 생성된 PPT 작업이 없습니다.</div> : <div className={styles.rows}>{overview.jobs.map(job => <article key={job.id}><div><b>{job.id.slice(0, 8).toUpperCase()}</b><span>{new Date(job.created_at).toLocaleString("ko-KR")}</span></div><p>{job.progress || "상태 정보 없음"}{job.error && <small>{job.error}</small>}</p><strong data-status={job.status}>{labels[job.status]}</strong>{job.status === "complete" ? <a href={`/api/slide-master?id=${encodeURIComponent(job.id)}&download=1`}>PPTX ↓</a> : <span className={styles.noDownload}>—</span>}</article>)}</div>}</section></section></main>;
}
