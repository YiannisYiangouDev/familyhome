
"use client";
import { useEffect, useState } from "react";

type Tab = "login" | "bookings" | "seasons" | "blocked" | "settings";

export default function Admin() {
  const [tab, setTab] = useState<Tab>("bookings");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/auth").then((r) => r.json()).then((d) => setAuthed(!!d.admin));
  }, []);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", password: pw }),
    });
    const d = await r.json();
    if (d.ok) { setAuthed(true); setErr(""); }
    else setErr("Wrong password");
  }

  async function doLogout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setAuthed(false);
  }

  if (authed === null) return <main className="p-12 text-center">Loading…</main>;

  if (!authed) {
    return (
      <main className="max-w-md mx-auto px-6 py-20">
        <h1 className="text-2xl font-bold mb-6">Admin login</h1>
        <form onSubmit={doLogin} className="space-y-4">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            placeholder="Password" autoFocus
            className="w-full border border-stone-300 rounded-lg px-3 py-2" />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button className="w-full bg-amber-500 text-black font-semibold py-2 rounded-lg">Log in</button>
        </form>
        <p className="text-xs text-stone-500 mt-6"><a href="/" className="hover:underline">← Back to home</a></p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin · Family Home</h1>
        <div className="flex gap-2 items-center">
          <a href="/" className="text-amber-700 hover:underline text-sm">View site</a>
          <button onClick={doLogout} className="text-sm text-stone-600 hover:underline">Log out</button>
        </div>
      </div>
      <nav className="flex gap-1 border-b border-stone-200 mb-6">
        {(["bookings", "seasons", "blocked", "settings"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-amber-500 text-amber-700" : "border-transparent text-stone-600 hover:text-stone-900"}`}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>
      {tab === "bookings" && <Bookings />}
      {tab === "seasons" && <Seasons />}
      {tab === "blocked" && <Blocked />}
      {tab === "settings" && <Settings />}
    </main>
  );
}

function Bookings() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch("/api/bookings").then((r) => r.json()).then((d) => setRows(d.bookings || [])); }, []);
  async function cancel(id: number) {
    if (!confirm("Cancel this booking?")) return;
    await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    setRows(rows.map((r) => r.id === id ? { ...r, status: "cancelled" } : r));
  }
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="text-left p-3">Date</th>
            <th className="text-left p-3">Guest</th>
            <th className="text-left p-3">Nights</th>
            <th className="text-left p-3">Total</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-stone-500">No bookings yet</td></tr>}
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-stone-100">
              <td className="p-3">{new Date(r.checkIn).toISOString().slice(0,10)} → {new Date(r.checkOut).toISOString().slice(0,10)}</td>
              <td className="p-3">{r.guestName} <div className="text-xs text-stone-500">{r.email}</div></td>
              <td className="p-3">{r.nights}</td>
              <td className="p-3">€{(r.totalCents/100).toFixed(2)}</td>
              <td className="p-3">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  r.status === "confirmed" ? "bg-green-100 text-green-700" :
                  r.status === "cancelled" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>{r.status}</span>
              </td>
              <td className="p-3">
                {r.status !== "cancelled" && (
                  <button onClick={() => cancel(r.id)} className="text-red-600 hover:underline text-xs">Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Seasons() {
  const [rows, setRows] = useState<any[]>([]);
  const [f, setF] = useState({ year: new Date().getFullYear(), startDate: "", endDate: "", rate: "", label: "" });
  useEffect(() => { fetch("/api/seasons").then((r) => r.json()).then((d) => setRows(d.seasons || [])); }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/seasons", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
    });
    const d = await r.json();
    if (d.season) {
      setRows([d.season, ...rows]);
      setF({ ...f, startDate: "", endDate: "", rate: "", label: "" });
    }
  }
  async function del(id: number) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/seasons?id=${id}`, { method: "DELETE" });
    setRows(rows.filter((r) => r.id !== id));
  }
  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white rounded-xl border border-stone-200 p-4 grid md:grid-cols-5 gap-3">
        <input type="number" required placeholder="Year" value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })} className="border rounded px-2 py-1" />
        <input type="date" required value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} className="border rounded px-2 py-1" />
        <input type="date" required value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} className="border rounded px-2 py-1" />
        <input type="number" required placeholder="€/night" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value })} className="border rounded px-2 py-1" />
        <input type="text" placeholder="Label (optional)" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} className="border rounded px-2 py-1 md:col-span-4" />
        <button className="bg-amber-500 text-black rounded px-3 py-1">Add</button>
      </form>
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200"><tr>
            <th className="text-left p-3">Year</th><th className="text-left p-3">From</th>
            <th className="text-left p-3">To</th><th className="text-left p-3">Rate</th>
            <th className="text-left p-3">Label</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-stone-100">
                <td className="p-3">{r.year}</td>
                <td className="p-3">{new Date(r.startDate).toISOString().slice(0,10)}</td>
                <td className="p-3">{new Date(r.endDate).toISOString().slice(0,10)}</td>
                <td className="p-3 font-semibold">€{r.rate}</td>
                <td className="p-3 text-stone-500">{r.label}</td>
                <td className="p-3"><button onClick={() => del(r.id)} className="text-red-600 hover:underline text-xs">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Blocked() {
  const [rows, setRows] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("blocked");
  useEffect(() => { fetch("/api/blocked").then((r) => r.json()).then((d) => setRows(d.blocked || [])); }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/blocked", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, reason }),
    });
    const d = await r.json();
    if (d.row) { setRows([...rows, d.row]); setDate(""); setReason("blocked"); }
  }
  async function del(id: number) {
    await fetch(`/api/blocked?id=${id}`, { method: "DELETE" });
    setRows(rows.filter((r) => r.id !== id));
  }
  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white rounded-xl border border-stone-200 p-4 flex gap-3">
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="border rounded px-2 py-1" />
        <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="border rounded px-2 py-1 flex-1" />
        <button className="bg-amber-500 text-black rounded px-3 py-1">Add blocked day</button>
      </form>
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200"><tr>
            <th className="text-left p-3">Date</th><th className="text-left p-3">Reason</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-stone-100">
                <td className="p-3">{new Date(r.date).toISOString().slice(0,10)}</td>
                <td className="p-3">{r.reason}</td>
                <td className="p-3"><button onClick={() => del(r.id)} className="text-red-600 hover:underline text-xs">Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Settings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => { fetch("/api/settings").then((r) => r.json()).then((d) => setS(d.settings || {})); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
    });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }
  const fields = [
    { k: "deposit_pct", label: "Deposit %", type: "number" },
    { k: "min_nights", label: "Minimum nights", type: "number" },
    { k: "cleaning_fee", label: "Cleaning fee (EUR)", type: "number" },
    { k: "contact_email", label: "Contact email", type: "email" },
    { k: "contact_phone", label: "Contact phone", type: "tel" },
  ];
  return (
    <form onSubmit={save} className="bg-white rounded-xl border border-stone-200 p-6 max-w-xl space-y-4">
      {fields.map((f) => (
        <div key={f.k}>
          <label className="block text-sm font-semibold mb-1">{f.label}</label>
          <input type={f.type} value={s[f.k] ?? ""}
            onChange={(e) => setS({ ...s, [f.k]: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2" />
        </div>
      ))}
      <button className="bg-amber-500 text-black font-semibold px-4 py-2 rounded-lg">Save</button>
      {saved && <span className="ml-2 text-green-600 text-sm">Saved ✓</span>}
    </form>
  );
}
