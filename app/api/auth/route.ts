
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, login, logout } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (b.action === "login") {
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
