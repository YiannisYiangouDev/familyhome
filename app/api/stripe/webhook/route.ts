import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-08-26.dahlia" });

export const runtime = "nodejs";

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
      await prisma.booking.updateMany({
        where: { id, status: "pending" },
        data: {
          status: "confirmed",
          stripePaymentId: typeof sess.payment_intent === "string" ? sess.payment_intent : null,
          expiresAt: null,
        },
      });
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
