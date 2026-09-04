
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
  });
  const cal = ical({ name: "FAMILY HOME Protaras" });
  for (const b of bookings) {
    cal.createEvent({
      start: b.checkIn,
      end: b.checkOut,
      summary: `Booked: ${b.guestName}`,
      description: `Booking #${b.id} — ${b.nights} nights, ${b.adults}A ${b.children}C`,
    });
  }
  return new NextResponse(cal.toString(), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
}
