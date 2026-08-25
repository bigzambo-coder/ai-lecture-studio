import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../session/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const url = process.env.SLIDE_MASTER_API_URL?.replace(/\/$/, "");
  const token = process.env.SLIDE_MASTER_API_TOKEN;
  if (!url || !token) return NextResponse.json({ error: "PPT 백엔드 연결 정보가 없습니다." }, { status: 503 });
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const [healthResponse, jobsResponse] = await Promise.all([
      fetch(`${url}/health`, { cache: "no-store" }),
      fetch(`${url}/v1/decks`, { headers, cache: "no-store" }),
    ]);
    const health = healthResponse.ok ? await healthResponse.json() : { ok: false };
    if (!jobsResponse.ok) return NextResponse.json({ health, jobs: [], backendPending: true });
    return NextResponse.json({ health, jobs: await jobsResponse.json(), backendPending: false });
  } catch {
    return NextResponse.json({ health: { ok: false }, jobs: [], backendPending: true });
  }
}
