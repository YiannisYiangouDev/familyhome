
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { parseDate } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const seasons = await prisma.season.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json({ seasons });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  const season = await prisma.season.upsert({
    where: {
      year_startDate_endDate: {
        year: Number(b.year),
        startDate: parseDate(b.startDate),
        endDate: parseDate(b.endDate),
      },
    },
    create: {
      year: Number(b.year),
      startDate: parseDate(b.startDate),
      endDate: parseDate(b.endDate),
      rate: Number(b.rate),
      label: b.label ?? "",
    },
    update: { rate: Number(b.rate), label: b.label ?? "" },
  });
  return NextResponse.json({ season });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.season.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
