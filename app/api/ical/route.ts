import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import ical from "ical-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const expected = process.env.ICAL_TOKEN || "";
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }
  const bookings = await prisma.booking.findMany({
    where: { status: "confirmed" },
    select: { id: true, checkIn: true, checkOut: true },
  });
  const cal = ical({ name: "FAMILY HOME Protaras" });
  for (const b of bookings) {
    cal.createEvent({
      id: `booking-${b.id}@familyhomeprotaras.yiangouweb.com`,
      start: b.checkIn,
      end: b.checkOut,
      summary: "Booked",
    });
  }
  return new NextResponse(cal.toString(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
