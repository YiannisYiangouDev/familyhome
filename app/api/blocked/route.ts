
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { parseDate } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.blockedDate.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json({ blocked: rows });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  const row = await prisma.blockedDate.upsert({
    where: { date: parseDate(b.date) },
    create: { date: parseDate(b.date), reason: b.reason ?? "blocked" },
    update: { reason: b.reason ?? "blocked" },
  });
  return NextResponse.json({ row });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.blockedDate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
