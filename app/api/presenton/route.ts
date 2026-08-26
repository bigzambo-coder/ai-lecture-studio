import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

function config() {
  const url = process.env.PRESENTON_API_URL?.replace(/\/$/, "");
  const key = process.env.PRESENTON_API_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function slideCount(totalMinutes: unknown) {
  const minutes = Number(String(totalMinutes ?? "").replace(/[^0-9]/g, "")) || 60;
  return Math.max(12, Math.min(60, Math.round((minutes / 60) * 16)));
}

export async function POST(request: NextRequest) {
  const provider = config();
  if (!provider) return NextResponse.json({ error: "Presenton 엔진이 설정되지 않았습니다." }, { status: 503 });

  const body = await request.json();
  const brief = body.brief ?? {};
  const count = slideCount(brief.totalMinutes);
  const content = [
    `제목: ${body.projectTitle || brief.topic || "강의자료"}`,
    `기관: ${brief.institutionName || brief.institutionType || "기관 미정"}`,
    `대상: ${brief.audience || "대상 미정"}`,
    `주제: ${brief.topic || "주제 미정"}`,
    `교육 목적: ${brief.purpose || "실제 업무에 적용 가능한 결과물 완성"}`,
    `교육 목표: ${(brief.objectives ?? []).join(" / ")}`,
    `운영 방식: ${brief.deliveryMethod || "강의와 실습 병행"}`,
    `최종 결과물: ${brief.finalDeliverable || "업무 적용 결과물"}`,
  ].join("\n");
  const instructions = [
    "한국어 강의용 16:9 프레젠테이션으로 제작합니다.",
    `디자인 콘셉트: ${brief.designRequest || "전문적이고 세련된 교육 스타일"}`,
    `디자인 프리셋: ${brief.designPreset || "auto"}`,
    "한 시간당 약 15~20장을 기준으로 하되 설명과 실습 흐름에 맞춰 밀도를 조절합니다.",
    "표지·목차·문제 인식·핵심 개념·사례·단계별 시연·실습 안내·체크리스트·요약을 포함합니다.",
    "텍스트만 반복하지 말고 사진, 아이콘, 비교표, 프로세스, 데이터 차트를 내용에 맞게 배치합니다.",
    "각 슬라이드의 모든 글자와 도형은 PowerPoint에서 편집 가능해야 합니다.",
    brief.notionUrl ? `실습 슬라이드에는 PRACTICE ID와 Notion 워크북 주소 ${brief.notionUrl}를 표시합니다.` : "",
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch(`${provider.url}/api/v1/ppt/presentation/generate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        instructions,
        tone: "educational",
        verbosity: "standard",
        web_search: false,
        n_slides: count,
        language: "Korean",
        template: "general",
        include_table_of_contents: true,
        include_title_slide: true,
        export_as: "pptx",
      }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: "Presenton 제작 서버가 요청을 완료하지 못했습니다." }, { status: response.status });
    const absolute = (value: string) => value?.startsWith("http") ? value : `${provider.url}${value?.startsWith("/") ? "" : "/"}${value}`;
    return NextResponse.json({
      id: result.presentation_id,
      downloadUrl: absolute(result.path),
      editUrl: absolute(result.edit_path),
      slideCount: count,
      engine: "presenton",
    });
  } catch {
    return NextResponse.json({ error: "Presenton 제작 서버에 연결하지 못했습니다." }, { status: 502 });
  }
}

export async function GET() {
  const provider = config();
  if (!provider) return NextResponse.json({ configured: false, engine: "presenton" });
  try {
    const response = await fetch(provider.url, { method: "HEAD", cache: "no-store" });
    return NextResponse.json({ configured: true, reachable: response.ok, engine: "presenton" });
  } catch {
    return NextResponse.json({ configured: true, reachable: false, engine: "presenton" });
  }
}
