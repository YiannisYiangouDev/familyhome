
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { priceStay, parseDate } from "@/lib/pricing";
import Stripe from "stripe";
import { isAdmin, login, logout } from "@/lib/auth";

const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-08-26.dahlia" });

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public POST: create booking -> Stripe Checkout
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { checkIn, checkOut, guestName, email, phone, adults, children, notes } = body;
  if (!checkIn || !checkOut || !guestName || !email) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
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
      phone: phone ?? "",
      adults: Number(adults) || 2,
      children: Number(children) || 0,
      totalCents: priced.totalCents,
      depositCents: priced.depositCents,
      notes: notes ?? "",
      status: "pending",
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3030";
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `FAMILY HOME ${checkIn} → ${checkOut}` },
            unit_amount: booking.depositCents,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: { bookingId: String(booking.id) },
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/cancel`,
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    await prisma.booking.delete({ where: { id: booking.id } });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Admin GET: list bookings
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { season: true },
  });
  return NextResponse.json({ bookings });
}

// Admin DELETE: cancel by id
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });
  return NextResponse.json({ ok: true });
}
