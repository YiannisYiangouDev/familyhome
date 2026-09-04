
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nightsBetween, priceStay } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const checkIn = url.searchParams.get("ci");
  const checkOut = url.searchParams.get("co");
  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: "ci and co required" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return NextResponse.json({ error: "dates must be YYYY-MM-DD" }, { status: 400 });
  }
  const nights = nightsBetween(checkIn, checkOut);
  if (nights.length === 0 || nights.length > 30) {
    return NextResponse.json({ error: "invalid stay length" }, { status: 400 });
  }

  const priced = await priceStay(checkIn, checkOut);
  return NextResponse.json({
    available: !priced || !("error" in priced) || false,
    ...(priced ?? {}),
    checkIn,
    checkOut,
  });
}
