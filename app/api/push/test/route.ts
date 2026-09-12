import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { notifyAdmins } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sends a test push notification to all admin subscriptions */
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_BASE_URL ?? "https://familyhomeprotaras.yiangouweb.com";
  await notifyAdmins("Test notification 🔔", "Push notifications are working — you'll be alerted about new bookings.", `${url}/admin`);
  return NextResponse.json({ ok: true });
}
