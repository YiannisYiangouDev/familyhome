
"use client";
import { useState, useEffect } from "react";

type Price = {
  nights: number;
  breakdown: { date: string; rate: number }[];
  cleaningFee: number;
  totalCents: number;
  depositCents: number;
  depositPct: number;
};

export default function BookPage() {
  const [ci, setCi] = useState("");
  const [co, setCo] = useState("");
  const [price, setPrice] = useState<Price | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ guestName: "", email: "", phone: "", adults: 2, children: 0, notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ci || !co) return;
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/availability?ci=${ci}&co=${co}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        setLoading(false);
        if (d.error) { setErr(d.error); setPrice(null); }
        else if (d.available === false) { setErr("Selected dates unavailable"); setPrice(null); }
        else { setErr(null); setPrice(d); }
      })
      .catch(() => setLoading(false));
    return () => ctrl.abort();
  }, [ci, co]);

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
    <main className="max-w-3xl mx-auto px-6 py-12">
      <a href="/" className="text-amber-700 hover:underline text-sm">← Home</a>
      <h1 className="text-3xl font-bold mt-4 mb-8">Check availability</h1>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Check-in</label>
            <input type="date" value={ci} onChange={(e) => setCi(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Check-out</label>
            <input type="date" value={co} onChange={(e) => setCo(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2" />
          </div>
        </div>

        {loading && <p className="text-stone-500">Checking…</p>}
        {err && <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{err}</p>}
        {price && (
          <div className="bg-stone-50 rounded-lg p-4 mb-6 border border-stone-200">
            <div className="flex justify-between text-sm mb-1">
              <span>{price.nights} nights</span>
              <span>€{(price.totalCents - price.depositCents - price.cleaningFee * 100) / 100}</span>
            </div>
            {price.cleaningFee > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span>Cleaning fee</span><span>€{price.cleaningFee}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t border-stone-200 pt-2 mt-2">
              <span>Total</span><span>€{(price.totalCents / 100).toFixed(2)}</span>
            </div>
            <p className="text-sm text-stone-600 mt-2">
              Deposit now: <strong>€{(price.depositCents / 100).toFixed(2)}</strong> ({price.depositPct}%) — balance due at check-in.
            </p>
          </div>
        )}

        {price && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Guest name *</label>
              <input required value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                className="w-full border border-stone-300 rounded-lg px-3 py-2" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Email *</label>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone</label>
                <input value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Adults</label>
                <input type="number" min={1} max={7} value={form.adults}
                  onChange={(e) => setForm({ ...form, adults: Number(e.target.value) })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Children</label>
                <input type="number" min={0} max={6} value={form.children}
                  onChange={(e) => setForm({ ...form, children: Number(e.target.value) })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Notes</label>
              <textarea value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border border-stone-300 rounded-lg px-3 py-2" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition">
              {submitting ? "Starting checkout…" : `Pay deposit €${(price.depositCents / 100).toFixed(2)}`}
            </button>
            <p className="text-xs text-stone-500 text-center">Powered by Stripe. You&apos;ll be redirected to secure payment.</p>
          </form>
        )}
      </div>
    </main>
  );
}
