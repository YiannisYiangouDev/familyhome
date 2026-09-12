import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { notifyAdmins } from "@/lib/push";

const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-08-26.dahlia" });

export const runtime = "nodejs";

function notifyConfirmed(booking: { guestName: string; checkIn: Date; checkOut: Date; totalCents: number }) {
  const ci = booking.checkIn.toISOString().slice(0, 10);
  const co = booking.checkOut.toISOString().slice(0, 10);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://familyhomeprotaras.yiangouweb.com";
  void notifyAdmins(
    "Booking confirmed ✅",
    `${booking.guestName} · ${ci} → ${co} · €${(booking.totalCents / 100).toFixed(2)}`,
    `${baseUrl}/admin`
  ).catch(() => {});
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sess = event.data.object as Stripe.Checkout.Session;
    const id = Number(sess.metadata?.bookingId);
    if (Number.isInteger(id) && id > 0) {
      const booking = await prisma.booking.findUnique({ where: { id } });
      await prisma.booking.updateMany({
        where: { id, status: "pending" },
        data: {
          status: "confirmed",
          stripePaymentId: typeof sess.payment_intent === "string" ? sess.payment_intent : null,
          expiresAt: null,
        },
      });
      if (booking) notifyConfirmed(booking);
    }
  }

  if (event.type === "checkout.session.expired") {
    const sess = event.data.object as Stripe.Checkout.Session;
    const id = Number(sess.metadata?.bookingId);
    if (Number.isInteger(id) && id > 0) {
      await prisma.booking.updateMany({
        where: { id, status: "pending" },
        data: { status: "expired", expiresAt: null },
      });
    }
  }

  return NextResponse.json({ received: true });
}
