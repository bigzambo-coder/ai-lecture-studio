import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function config() {
  const url = process.env.SLIDE_MASTER_API_URL?.replace(/\/$/, "");
  const token = process.env.SLIDE_MASTER_API_TOKEN;
  if (!url || !token) return null;
  return { url, headers: { Authorization: `Bearer ${token}` } };
}

export async function POST(request: NextRequest) {
  const backend = config();
  if (!backend) return NextResponse.json({ error: "Slide Master 백엔드가 아직 연결되지 않았습니다." }, { status: 503 });
  const body = await request.json();
  const brief = body.brief ?? {};
  const response = await fetch(`${backend.url}/v1/decks`, {
    method: "POST",
    headers: { ...backend.headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      project_title: body.projectTitle,
      institution_name: brief.institutionName,
      institution_type: brief.institutionType,
      audience: brief.audience,
      topic: brief.topic,
      total_minutes: Number(String(brief.totalMinutes).replace(/[^0-9]/g, "")) || 60,
      purpose: brief.purpose,
      objectives: brief.objectives ?? [],
      final_deliverable: brief.finalDeliverable,
      design_preset: brief.designPreset,
      design_request: brief.designRequest,
      notion_url: brief.notionUrl,
    }),
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function GET(request: NextRequest) {
  const backend = config();
  if (!backend) return NextResponse.json({ error: "Slide Master 백엔드가 아직 연결되지 않았습니다." }, { status: 503 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "작업 ID가 필요합니다." }, { status: 400 });
  const download = request.nextUrl.searchParams.get("download") === "1";
  const response = await fetch(`${backend.url}/v1/decks/${encodeURIComponent(id)}${download ? "/download" : ""}`, { headers: backend.headers, cache: "no-store" });
  if (!download) return NextResponse.json(await response.json(), { status: response.status });
  if (!response.ok) return NextResponse.json(await response.json(), { status: response.status });
  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="slide-master-${id}.pptx"`,
    },
  });
}
