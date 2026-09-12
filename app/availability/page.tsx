import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = "https://familyhomeprotaras.yiangouweb.com";
const MONTHS_AHEAD = 12;
const PENDING_HOLD_MINUTES = 30;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const metadata: Metadata = {
  title: "Availability & Rates | Family Home Protaras",
  description:
    "Check live availability for FAMILY HOME, a 4-bedroom villa in Protaras, Cyprus. See free dates, nightly rates and minimum stay, then book direct with a 30% deposit.",
  alternates: { canonical: "/availability" },
  openGraph: {
    title: "Availability & Rates | Family Home Protaras",
    description: "See which dates are free at FAMILY HOME and book direct — 30% deposit, no commission.",
    url: `${SITE_URL}/availability`,
    images: [{ url: "/photos/photo-01.jpg", width: 1200, height: 630, alt: "Family Home Protaras villa" }],
    locale: "en_GB",
    type: "website",
  },
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dateStr(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function todayStr(): string {
  const n = new Date();
  return dateStr(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

/** Expand an inclusive start / exclusive end date range into nightly date strings (UTC). */
function nightsBetween(checkIn: Date, checkOut: Date): string[] {
  const out: string[] = [];
  const cur = new Date(Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate()));
  const end = new Date(Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate()));
  while (cur < end) {
    out.push(dateStr(cur.getUTCFullYear(), cur.getUTCMonth(), cur.getUTCDate()));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

type SeasonInfo = { startDate: string; endDate: string; rate: number; label: string };

async function loadCalendarData() {
  const now = new Date();
  const horizonStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const horizonEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + MONTHS_AHEAD, 1));

  const [seasons, blockedRows, bookings, extBookings] = await Promise.all([
    prisma.season.findMany({ orderBy: { startDate: "asc" } }),
    prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
    prisma.booking.findMany({
      where: {
        checkIn: { lt: horizonEnd },
        checkOut: { gt: horizonStart },
        OR: [
          { status: "confirmed" },
          { status: "pending", expiresAt: { gt: new Date() } },
          { status: "pending", expiresAt: null, createdAt: { gt: new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000) } },
        ],
      },
      select: { checkIn: true, checkOut: true },
    }),
    prisma.externalBooking.findMany({
      where: { checkIn: { lt: horizonEnd }, checkOut: { gt: horizonStart } },
      select: { checkIn: true, checkOut: true },
    }),
  ]);

  const blocked = new Set<string>();
  for (const b of blockedRows) blocked.add(dateStr(b.date.getUTCFullYear(), b.date.getUTCMonth(), b.date.getUTCDate()));

  const booked = new Set<string>();
  for (const bk of bookings) {
    for (const d of nightsBetween(bk.checkIn, bk.checkOut)) booked.add(d);
  }
  for (const bk of extBookings) {
    for (const d of nightsBetween(bk.checkIn, bk.checkOut)) booked.add(d);
  }

  const seasonList: SeasonInfo[] = seasons.map((s) => ({
    startDate: dateStr(s.startDate.getUTCFullYear(), s.startDate.getUTCMonth(), s.startDate.getUTCDate()),
    endDate: dateStr(s.endDate.getUTCFullYear(), s.endDate.getUTCMonth(), s.endDate.getUTCDate()),
    rate: s.rate,
    label: s.label,
  }));

  return { seasonList, blocked, booked };
}

function rateFor(seasons: SeasonInfo[], date: string): number | null {
  const s = seasons.find((x) => date >= x.startDate && date <= x.endDate);
  return s ? s.rate : null;
}

export default async function AvailabilityPage() {
  const { seasonList, blocked, booked } = await loadCalendarData();
  const today = todayStr();

  const months: { y: number; m: number }[] = [];
  const now = new Date();
  for (let i = 0; i < MONTHS_AHEAD; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    months.push({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  }

  return (
    <main className="min-h-screen bg-stone-50 pt-16">
      {/* Header */}
      <div className="bg-stone-900 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/photos/photo-01.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <a href="/" className="text-amber-400 hover:text-amber-300 text-sm transition">← Back to home</a>
          <h1 className="text-4xl font-bold mt-3">Availability Calendar</h1>
          <p className="text-stone-300 mt-2 text-lg font-light">
            Free dates, nightly rates and booked periods at a glance — updated live.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-8 text-xs text-stone-500">
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-white border border-stone-300 inline-block"></span> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-stone-200 opacity-30 inline-block"></span> Unavailable</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border-2 border-amber-500 inline-block"></span> Today</span>
          <span className="flex items-center gap-1.5"><span className="text-stone-400 font-semibold">€</span> Nightly rate</span>
        </div>

        {/* Months */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {months.map(({ y, m }, i) => {
            const firstOffset = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
            const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
            const cells: ({ date: string; day: number } | null)[] = [];
            for (let i = 0; i < firstOffset; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push({ date: dateStr(y, m, d), day: d });

            return (
              <div key={`${y}-${m}`} style={{ animationDelay: `${i * 40}ms` }} className="avail-card bg-white rounded-2xl shadow-sm border border-stone-200 p-3 sm:p-5">
                <h2 className="text-base font-bold text-stone-800 mb-4">
                  {MONTH_NAMES[m]} {y}
                </h2>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DOW.map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold text-stone-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((cell, i) => {
                    if (!cell) return <div key={i} />;
                    const isPast = cell.date < today;
                    const isBlocked = blocked.has(cell.date);
                    const isBooked = booked.has(cell.date);
                    const isToday = cell.date === today;
                    const rate = rateFor(seasonList, cell.date);
                    const unavailable = isPast || isBlocked || isBooked || rate === null;
                    let title: string;
                    if (isBooked) title = "Booked";
                    else if (isBlocked) title = "Unavailable";
                    else if (isPast) title = "Past date";
                    else if (rate === null) title = "Not bookable online yet";
                    else title = `Available — €${rate} / night`;
                    return (
                      <div
                        key={i}
                        title={title}
                        aria-label={title}
                        className={`cal-day ro ${unavailable ? "disabled" : ""} ${isToday ? "today" : ""}`}
                      >
                        <span className="day-num">{cell.day}</span>
                        {!unavailable && rate !== null && (
                          <span className="day-rate">€{rate}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-stone-900 text-white rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Found your dates?</h2>
            <p className="text-stone-300 mt-1">Select them on the booking page and pay a 30% deposit to confirm instantly — no commission, direct with us.</p>
          </div>
          <a
            href="/book"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-full transition hover:scale-105 duration-200 shadow-lg shadow-amber-500/20 whitespace-nowrap"
          >
            Book Your Stay
          </a>
        </div>
      </div>
    </main>
  );
}
