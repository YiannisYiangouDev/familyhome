import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { importExternalCalendar } from "@/lib/ical-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Manually trigger an external calendar import (admin only) */
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await importExternalCalendar();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
