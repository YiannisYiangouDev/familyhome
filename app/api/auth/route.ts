
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, login, logout } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (b.action === "login") {
    // Rate limit admin logins (5/60s per IP) to blunt brute-force
    if (!rateLimit(`admin-login:${clientIp(req)}`, 5, 60_000)) {
      return NextResponse.json({ ok: false, error: "too many attempts" }, { status: 429 });
    }
    const ok = await login(b.password);
    return NextResponse.json({ ok });
  }
  if (b.action === "logout") {
    await logout();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "bad action" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({ admin: await isAdmin() });
}
