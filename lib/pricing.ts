import { prisma } from "./db";

export type NightRate = { date: string; rate: number };

export function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function parseDate(s: string): Date {
  return new Date(s + "T00:00:00.000Z");
}

/** Expand [checkIn, checkOut) into nightly dates */
export function nightsBetween(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  let cur = parseDate(checkIn);
  const end = parseDate(checkOut);
  while (cur < end) {
    out.push(fmtDate(cur));
    cur = new Date(cur.getTime() + 86400000);
  }
  return out;
}

const PENDING_HOLD_MINUTES = 30;

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    depositPct: Number(map["deposit_pct"] ?? "30"),
    minNights: Number(map["min_nights"] ?? "3"),
    cleaningFee: Number(map["cleaning_fee"] ?? "0"), // EUR
    contactEmail: map["contact_email"] ?? "",
    contactPhone: map["contact_phone"] ?? "",
  };
}

/**
 * Price a stay. Returns null if unavailable/blocked/too short.
 */
export async function priceStay(checkIn: string, checkOut: string) {
  const settings = await getSettings();
  const nights = nightsBetween(checkIn, checkOut);
  if (nights.length === 0) return null;
  if (nights.length < settings.minNights) {
    return { error: `Minimum stay is ${settings.minNights} nights` } as const;
  }

  const ci = parseDate(checkIn);
  const co = parseDate(checkOut);

  const blocked = await prisma.blockedDate.findMany({
    where: { date: { gte: ci, lt: co } },
  });
  if (blocked.length > 0) {
    return { error: "Selected dates are not available" } as const;
  }

  const pendingCutoff = new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000);
  const clash = await prisma.booking.findFirst({
    where: {
      checkIn: { lt: co },
      checkOut: { gt: ci },
      OR: [
        { status: "confirmed" },
        { status: "pending", expiresAt: { gt: new Date() } },
        { status: "pending", expiresAt: null, createdAt: { gt: pendingCutoff } },
      ],
    },
  });
  if (clash) {
    return { error: "Selected dates are already booked" } as const;
  }

  const seasons = await prisma.season.findMany({
    where: { startDate: { lte: ci }, endDate: { gte: co } },
    orderBy: { startDate: "asc" },
  });

  const breakdown: NightRate[] = [];
  let total = 0;
  let cursor = ci;
  for (const s of seasons) {
    while (cursor < co && cursor < addDay(s.endDate)) {
      breakdown.push({ date: fmtDate(cursor), rate: s.rate });
      total += s.rate;
      cursor = addDay(cursor);
    }
  }
  if (cursor < co) {
    return { error: "Rates for these dates are not published yet" } as const;
  }

  const totalCents = (total + settings.cleaningFee) * 100;
  const depositCents = Math.round((totalCents * settings.depositPct) / 100);
  return {
    nights: nights.length,
    breakdown,
    cleaningFee: settings.cleaningFee,
    totalCents,
    depositCents,
    depositPct: settings.depositPct,
    settings,
  } as const;
}

function addDay(d: Date): Date {
  return new Date(d.getTime() + 86400000);
}
