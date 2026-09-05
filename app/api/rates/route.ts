import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public rate card — powers the price calendar on the booking page.
 * No auth: this is marketing data (published season rates + policy).
 */
export async function GET() {
  const [seasons, settingsRows, blocked] = await Promise.all([
    prisma.season.findMany({ orderBy: { startDate: "asc" } }),
    prisma.setting.findMany(),
    prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
  ]);

  const map: Record<string, string> = {};
  for (const r of settingsRows) map[r.key] = r.value;

  return NextResponse.json({
    minNights: Number(map["min_nights"] ?? "3"),
    depositPct: Number(map["deposit_pct"] ?? "30"),
    cleaningFee: Number(map["cleaning_fee"] ?? "0"),
    baseRate: Number(map["base_rate"] ?? "200"),
    seasons: seasons.map((s) => ({
      startDate: s.startDate.toISOString().slice(0, 10),
      endDate: s.endDate.toISOString().slice(0, 10),
      rate: s.rate,
      label: s.label,
    })),
    blockedDates: blocked.map((b) => b.date.toISOString().slice(0, 10)),
  });
}
