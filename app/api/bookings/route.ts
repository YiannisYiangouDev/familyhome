import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { priceStay, parseDate } from "@/lib/pricing";
import Stripe from "stripe";
import { isAdmin } from "@/lib/auth";
import { sendBookingConfirmation } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-08-26.dahlia" });

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!rateLimit(`booking:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const checkIn = typeof body.checkIn === "string" ? body.checkIn : "";
  const checkOut = typeof body.checkOut === "string" ? body.checkOut : "";
  const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const adults = Number(body.adults);
  const children = Number(body.children);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return NextResponse.json({ error: "dates must be YYYY-MM-DD" }, { status: 400 });
  }
  if (!guestName || guestName.length > 120) {
    return NextResponse.json({ error: "invalid guest name" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const adultCount = Number.isInteger(adults) ? adults : 2;
  const childCount = Number.isInteger(children) ? children : 0;
  if (adultCount < 1 || childCount < 0 || adultCount + childCount > 7) {
    return NextResponse.json({ error: "Maximum occupancy is 7 guests" }, { status: 400 });
  }

  const priced = await priceStay(checkIn, checkOut);
  if (!priced) return NextResponse.json({ error: "pricing unavailable" }, { status: 400 });
  if ("error" in priced) return NextResponse.json({ error: priced.error }, { status: 400 });

  const booking = await prisma.booking.create({
    data: {
      checkIn: parseDate(checkIn),
      checkOut: parseDate(checkOut),
      nights: priced.nights,
      guestName,
      email,
      phone,
      adults: adultCount,
      children: childCount,
      totalCents: priced.totalCents,
      depositCents: priced.depositCents,
      notes,
      status: "pending",
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
    console.error("NEXT_PUBLIC_BASE_URL is not configured");
    return NextResponse.json({ error: "Booking service is temporarily unavailable" }, { status: 503 });
  }

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `FAMILY HOME ${checkIn} → ${checkOut}` },
          unit_amount: booking.depositCents,
        },
        quantity: 1,
      }],
      customer_email: email,
      metadata: { bookingId: String(booking.id) },
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/cancel`,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    void sendBookingConfirmation({
      guestName,
      email,
      checkIn,
      checkOut,
      nights: priced.nights,
      totalCents: booking.totalCents,
      depositCents: booking.depositCents,
    }).catch((error) => console.error("Failed to send booking confirmation", error));

    return NextResponse.json({ url: session.url });
  } catch (error) {
    await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
    console.error("Stripe checkout creation failed", error);
    return NextResponse.json({ error: "Unable to start checkout" }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { season: true },
  });
  return NextResponse.json({ bookings });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "valid id required" }, { status: 400 });
  }
  await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });
  return NextResponse.json({ ok: true });
}
