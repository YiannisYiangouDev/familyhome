"use client";
import { useState, useEffect, useMemo, useCallback } from "react";

type Price = {
  nights: number;
  breakdown: { date: string; rate: number }[];
  cleaningFee: number;
  totalCents: number;
  depositCents: number;
  depositPct: number;
};

type Rates = {
  minNights: number;
  depositPct: number;
  cleaningFee: number;
  baseRate: number;
  seasons: { startDate: string; endDate: string; rate: number; label: string }[];
  blockedDates: string[];
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Mo","Tu","We","Th","Fr","Sa","Su"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(s: string, n: number) {
  const d = new Date(s + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  return Math.round((new Date(b + "T12:00:00").getTime() - new Date(a + "T12:00:00").getTime()) / 86400000);
}
function fmtDate(s: string) {
  return new Date(s + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function BookPage() {
  const [ci, setCi] = useState("");
  const [co, setCo] = useState("");
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [price, setPrice] = useState<Price | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ guestName: "", email: "", phone: "", adults: 2, children: 0, notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [rates, setRates] = useState<Rates | null>(null);

  // Fetch public rate card (seasons + blocked dates + policy) — /api/blocked
  // returns objects, /api/rates returns flat date strings the calendar needs.
  useEffect(() => {
    fetch("/api/rates").then(r => r.json()).then(d => setRates(d)).catch(() => {});
  }, []);

  const blocked = useMemo(() => new Set(rates?.blockedDates ?? []), [rates]);
  const minNights = rates?.minNights ?? 3;

  /** Per-night rate for a date, or null if not inside any published season */
  const rateFor = useCallback((dateStr: string): number | null => {
    const s = rates?.seasons.find(x => dateStr >= x.startDate && dateStr <= x.endDate);
    return s ? s.rate : null;
  }, [rates]);

  // Fetch price
  useEffect(() => {
    if (!ci || !co) return;
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/availability?ci=${ci}&co=${co}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        setLoading(false);
        if (d.error) { setErr(d.error); setPrice(null); }
        else if (d.available === false) { setErr("Selected dates unavailable"); setPrice(null); }
        else { setErr(null); setPrice(d); }
      })
      .catch(() => setLoading(false));
    return () => ctrl.abort();
  }, [ci, co]);

  const onDayClick = useCallback((dateStr: string) => {
    if (blocked.has(dateStr) || dateStr < todayStr()) return;
    if (!ci || (ci && co)) {
      setCi(dateStr);
      setCo("");
      setPrice(null);
      setErr(null);
    } else if (dateStr > ci) {
      const n = daysBetween(ci, dateStr);
      let hasBlock = false;
      for (let i = 0; i < n; i++) { if (blocked.has(addDays(ci, i))) { hasBlock = true; break; } }
      if (hasBlock) { setErr("Unavailable dates in your selection"); return; }
      if (n < minNights) { setErr("Minimum " + minNights + "-night stay required"); return; }
      setCo(dateStr);
    } else {
      setCi(dateStr);
      setCo("");
    }
  }, [ci, co, blocked, minNights]);

  const calGrid = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells: ({ date: string; day: number } | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: ds, day: d });
    }
    return cells;
  }, [calMonth]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkIn: ci, checkOut: co, ...form }),
    });
    const d = await res.json();
    setSubmitting(false);
    if (d.url) window.location.href = d.url;
    else alert(d.error || "Failed to start checkout");
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
          <h1 className="text-4xl font-bold mt-3">Book Your Stay</h1>
          <p className="text-stone-300 mt-2 text-lg font-light">Select dates and pay a 30% deposit to confirm instantly.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left column */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                className="p-2.5 hover:bg-stone-100 rounded-xl transition text-stone-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-lg font-bold text-stone-800">{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</h2>
              <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                className="p-2.5 hover:bg-stone-100 rounded-xl transition text-stone-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DOW.map(d => <div key={d} className="text-center text-xs font-semibold text-stone-400 py-2">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calGrid.map((cell, i) => {
                if (!cell) return <div key={i} />;
                const isPast = cell.date < todayStr();
                const isBlocked = blocked.has(cell.date);
                const isToday = cell.date === todayStr();
                const isStart = cell.date === ci;
                const isEnd = cell.date === co;
                const inRange = ci && co && cell.date > ci && cell.date < co;
                const disabled = isPast || isBlocked;
                const nightRate = rateFor(cell.date);
                return (
                  <button key={i} disabled={disabled} onClick={() => onDayClick(cell.date)}
                    title={nightRate != null ? "€" + nightRate + " / night" : undefined}
                    className={`cal-day ${isStart || isEnd ? "selected" : ""} ${inRange ? "in-range" : ""} ${disabled ? "disabled" : ""} ${isToday ? "today" : ""}`}
                  >
                    <span className="day-num">{cell.day}</span>
                    {nightRate != null && !disabled && (
                      <span className="day-rate">€{nightRate}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 mt-6 text-xs text-stone-500">
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block"></span> Selected</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-yellow-100 inline-block"></span> In range</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded border-2 border-amber-500 inline-block"></span> Today</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-stone-200 opacity-30 inline-block"></span> Unavailable</span>
            </div>
          </div>

          {/* Dates summary */}
          {(ci || co) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-wrap gap-6 fade-up">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Check-in</p>
                <p className="font-semibold text-stone-800">{ci ? fmtDate(ci) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Check-out</p>
                <p className="font-semibold text-stone-800">{co ? fmtDate(co) : "—"}</p>
              </div>
              {ci && co && (
                <div className="ml-auto">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Duration</p>
                  <p className="font-semibold text-stone-800">{daysBetween(ci, co)} nights</p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4 text-stone-500 gap-2">
              <span className="inline-block animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></span>
              Checking availability…
            </div>
          )}
          {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{err}</div>}

          {/* Booking form */}
          {price && (
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-5 fade-up">
              <h3 className="text-xl font-bold text-stone-800">Guest Details</h3>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-stone-700">Full Name *</label>
                <input required value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-stone-700">Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-stone-700">Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+357 …"
                    className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-stone-700">Adults</label>
                  <div className="flex items-center gap-3 border border-stone-300 rounded-lg px-3 py-2">
                    <button type="button" onClick={() => setForm(f => ({ ...f, adults: Math.max(1, f.adults - 1) }))}
                      className="w-8 h-8 rounded-md hover:bg-stone-100 transition font-bold text-stone-600">−</button>
                    <span className="text-base font-semibold w-6 text-center">{form.adults}</span>
                    <button type="button" onClick={() => setForm(f => ({ ...f, adults: Math.min(7, f.adults + 1) }))}
                      className="w-8 h-8 rounded-md hover:bg-stone-100 transition font-bold text-stone-600">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-stone-700">Children</label>
                  <div className="flex items-center gap-3 border border-stone-300 rounded-lg px-3 py-2">
                    <button type="button" onClick={() => setForm(f => ({ ...f, children: Math.max(0, f.children - 1) }))}
                      className="w-8 h-8 rounded-md hover:bg-stone-100 transition font-bold text-stone-600">−</button>
                    <span className="text-base font-semibold w-6 text-center">{form.children}</span>
                    <button type="button" onClick={() => setForm(f => ({ ...f, children: Math.min(6, f.children + 1) }))}
                      className="w-8 h-8 rounded-md hover:bg-stone-100 transition font-bold text-stone-600">+</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-stone-700">Special Requests</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                  placeholder="Arrival time, baby cot, anything we should know…"
                  className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm resize-none" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-4 rounded-lg text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-amber-500/20">
                {submitting ? "Redirecting to Stripe…" : `Pay Deposit €${(price.depositCents / 100).toFixed(2)}`}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                Secured by Stripe · 30% deposit · Balance at check-in
              </div>
            </form>
          )}
        </div>

        {/* Right: Sticky sidebar */}
        <div>
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-lg img-zoom">
              <img src="/photos/photo-01.jpg" alt="Family Home" className="w-full h-48 object-cover" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
              <h3 className="font-bold text-stone-800 mb-1">Family Home Protaras</h3>
              <p className="text-sm text-stone-500 mb-4">⭐ 9.9 · 4 bed · 2 bath · 7 guests</p>
              <div className="border-t border-stone-100 pt-4 space-y-2.5 text-sm">
                {rates && rates.seasons.length > 0 ? (
                  rates.seasons.slice(0, 4).map(s => (
                    <div key={s.startDate} className="flex justify-between">
                      <span className="text-stone-500">{s.label || "Standard"}</span>
                      <span className="font-medium text-stone-800">€{s.rate}/night</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between"><span className="text-stone-500">Base rate</span><span className="font-medium text-stone-800">from €{rates ? rates.baseRate : 200}/night</span></div>
                )}
                <div className="flex justify-between"><span className="text-stone-500">Minimum stay</span><span className="font-medium text-stone-800">{minNights} nights</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Deposit</span><span className="font-medium text-stone-800">{rates ? rates.depositPct : 30}% at booking</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Check-in</span><span className="font-medium text-stone-800">3 PM – 7 PM</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Check-out</span><span className="font-medium text-stone-800">11:30 AM</span></div>
              </div>
            </div>

            {price && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 price-badge">
                <h3 className="font-bold text-stone-800 mb-4 text-sm">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">€{price.breakdown[0]?.rate ?? 200}/night × {price.nights}</span>
                    <span className="font-medium">€{((price.totalCents - price.cleaningFee * 100) / 100).toFixed(2)}</span>
                  </div>
                  {price.cleaningFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-stone-600">Cleaning fee</span>
                      <span className="font-medium">€{price.cleaningFee}</span>
                    </div>
                  )}
                  <div className="border-t border-amber-200 pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span><span>€{(price.totalCents / 100).toFixed(2)}</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 mt-3 border border-amber-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-amber-700 text-sm">Deposit due now</p>
                        <p className="text-xs text-stone-500 mt-0.5">Balance at check-in</p>
                      </div>
                      <span className="text-2xl font-bold text-amber-700">€{(price.depositCents / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2.5 text-xs text-stone-600">
              <p className="flex items-center gap-2"><span className="text-green-600">✓</span> Free cancellation up to 7 days before</p>
              <p className="flex items-center gap-2"><span className="text-green-600">✓</span> Instant confirmation</p>
              <p className="flex items-center gap-2"><span className="text-green-600">✓</span> Secure payment via Stripe</p>
              <p className="flex items-center gap-2"><span className="text-green-600">✓</span> Best rate — no commission</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
