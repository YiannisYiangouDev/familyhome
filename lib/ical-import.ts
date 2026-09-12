import ical, { type CalendarResponse, type VEvent } from "node-ical";
import { prisma } from "./db";
import { parseDate, fmtDate } from "./pricing";

const SELF_DOMAIN = "familyhomeprotaras.yiangouweb.com";
const FETCH_TIMEOUT_MS = 25_000;

export type ImportResult = { ok: boolean; imported: number; error?: string };

/** Fetch the remote feed with a timeout so the scheduler can never hang. */
async function fetchFeed(url: string): Promise<CalendarResponse> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("iCal fetch timed out")), FETCH_TIMEOUT_MS)
  );
  return Promise.race([ical.async.fromURL(url), timeout]);
}

/** node-ical summaries can be plain strings or { value, params } objects. */
function summaryText(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "value" in v && typeof (v as { value: unknown }).value === "string") {
    return (v as { value: string }).value;
  }
  return "";
}

/**
 * Import the external calendar (Booking.com etc.) configured in settings.
 * The feed is authoritative for its own events: anything not in the feed is pruned.
 * Events originating from our own export feed are skipped (loop protection).
 */
export async function importExternalCalendar(): Promise<ImportResult> {
  const row = await prisma.setting.findUnique({ where: { key: "ical_import_url" } });
  const raw = row?.value?.trim() ?? "";
  if (!raw) return { ok: false, imported: 0, error: "No iCal URL configured" };
  // Booking.com hands out webcal:// links; the fetcher needs http(s).
  const url = raw.replace(/^webcal:\/\//i, "https://");
  if (!url.startsWith("https://")) return { ok: false, imported: 0, error: "iCal URL must be https" };

  let events: CalendarResponse;
  try {
    events = await fetchFeed(url);
  } catch (e) {
    return { ok: false, imported: 0, error: e instanceof Error ? e.message : "Failed to fetch iCal feed" };
  }

  const seen: string[] = [];
  let imported = 0;

  for (const [uid, entry] of Object.entries(events)) {
    if (!entry || typeof entry !== "object") continue;
    if ((entry as { type?: string }).type !== "VEVENT") continue;
    const ev = entry as VEvent;
    if (!ev.start || !ev.end) continue;
    if (uid.includes(SELF_DOMAIN)) continue; // our own feed echoed back

    const checkIn = fmtDate(new Date(ev.start));
    const checkOut = fmtDate(new Date(ev.end));
    if (checkIn >= checkOut) continue;

    await prisma.externalBooking.upsert({
      where: { uid },
      create: {
        uid,
        checkIn: parseDate(checkIn),
        checkOut: parseDate(checkOut),
        source: "booking",
        summary: summaryText(ev.summary).slice(0, 200),
      },
      update: {
        checkIn: parseDate(checkIn),
        checkOut: parseDate(checkOut),
        summary: summaryText(ev.summary).slice(0, 200),
      },
    });
    seen.push(uid);
    imported++;
  }

  // Prune events that disappeared from the feed.
  await prisma.externalBooking.deleteMany({ where: { uid: { notIn: seen } } });

  const now = new Date().toISOString();
  await prisma.setting.upsert({
    where: { key: "ical_last_sync" },
    create: { key: "ical_last_sync", value: now },
    update: { value: now },
  });

  return { ok: true, imported };
}
