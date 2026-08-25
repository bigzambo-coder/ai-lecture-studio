import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const COOKIE = "als_admin_session";

function secret() { return process.env.ADMIN_PASSWORD ?? ""; }
function token() { return createHmac("sha256", secret()).update("ai-lecture-studio-admin").digest("hex"); }

export function isAdmin(request: NextRequest) {
  const expected = token();
  const actual = request.cookies.get(COOKIE)?.value ?? "";
  if (!secret() || actual.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isAdmin(request), configured: Boolean(secret()) });
}

export async function POST(request: NextRequest) {
  if (!secret()) return NextResponse.json({ error: "ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다." }, { status: 503 });
  const { password = "" } = await request.json();
  const supplied = Buffer.from(String(password));
  const expected = Buffer.from(secret());
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(COOKIE, token(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
