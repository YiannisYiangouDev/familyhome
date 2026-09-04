"use client";
import { useEffect, useState } from "react";

type Tab = "login" | "bookings" | "seasons" | "blocked" | "settings";

export default function Admin() {
  const [tab, setTab] = useState<Tab>("bookings");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/auth").then(r => r.json()).then(d => setAuthed(!!d.admin));
  }, []);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", password: pw }) });
    const d = await r.json();
    if (d.ok) { setAuthed(true); setErr(""); } else setErr("Wrong password");
  }

  async function doLogout() {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    setAuthed(false);
  }

  if (authed === null) return <main className="min-h-screen flex items-center justify-center text-stone-500">Loading…</main>;

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Admin Access</h1>
            <p className="text-stone-500 text-sm mt-1">Family Home Protaras</p>
          </div>
          <form onSubmit={doLogin} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="Enter password" autoFocus
              className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm" />
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition">Log in</button>
          </form>
          <p className="text-xs text-stone-400 mt-4 text-center"><a href="/" className="hover:underline">← Back to home</a></p>
        </div>
      </main>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "bookings", label: "Bookings", icon: "📋" },
    { key: "seasons", label: "Seasons", icon: "📅" },
    { key: "blocked", label: "Blocked", icon: "🚫" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏠</span>
            <h1 className="font-bold text-stone-800">Admin · Family Home</h1>
          </div>
          <div className="flex gap-3 items-center">
            <a href="/" className="text-sm text-amber-700 hover:text-amber-600 transition font-medium">View site →</a>
            <button onClick={doLogout} className="text-sm text-stone-500 hover:text-stone-700 transition">Log out</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <nav className="flex gap-1 bg-white rounded-xl border border-stone-200 p-1 mb-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${tab === t.key ? "bg-amber-500 text-black shadow-sm" : "text-stone-600 hover:bg-stone-50"}`}>
              <span className="text-base">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </nav>
        {tab === "bookings" && <Bookings />}
        {tab === "seasons" && <Seasons />}
        {tab === "blocked" && <Blocked />}
        {tab === "settings" && <Settings />}
      </div>
    </main>
  );
}

function Bookings() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch("/api/bookings").then(r => r.json()).then(d => setRows(d.bookings || [])); }, []);
  async function cancel(id: number) {
    if (!confirm("Cancel this booking?")) return;
    await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    setRows(rows.map(r => r.id === id ? { ...r, status: "cancelled" } : r));
  }
  const statusColor: Record<string, string> = { confirmed: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", cancelled: "bg-red-100 text-red-700" };
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
        <h2 className="font-bold text-stone-800">Bookings</h2>
        <span className="text-sm text-stone-500">{rows.length} total</span>
      </div>
      {rows.length === 0 ? (
        <div className="p-12 text-center text-stone-400">No bookings yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {["Date", "Guest", "Nights", "Total", "Status", ""].map(h => (
                  <th key={h} className="text-left p-3 font-semibold text-stone-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-stone-50/50 transition">
                  <td className="p-3 text-stone-700">{r.checkIn}</td>
                  <td className="p-3"><p className="font-medium text-stone-800">{r.guestName}</p><p className="text-xs text-stone-500">{r.email}</p></td>
                  <td className="p-3 text-stone-700">{r.nights || "—"}</td>
                  <td className="p-3 font-medium text-stone-800">€{r.totalCents ? (r.totalCents / 100).toFixed(2) : "—"}</td>
                  <td className="p-3"><span className={`badge ${statusColor[r.status] || "bg-stone-100 text-stone-600"}`}>{r.status}</span></td>
                  <td className="p-3">{r.status !== "cancelled" && <button onClick={() => cancel(r.id)} className="text-red-600 hover:text-red-700 text-xs font-medium">Cancel</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Seasons() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", start: "", end: "", rate: "" });
  useEffect(() => { fetch("/api/seasons").then(r => r.json()).then(d => setRows(d.seasons || [])); }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/seasons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, rate: Number(form.rate) }) });
    setForm({ name: "", start: "", end: "", rate: "" });
    const r = await fetch("/api/seasons"); const d = await r.json(); setRows(d.seasons || []);
  }
  async function del(id: number) {
    if (!confirm("Delete this season?")) return;
    await fetch(`/api/seasons?id=${id}`, { method: "DELETE" });
    setRows(rows.filter(r => r.id !== id));
  }
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-bold text-stone-800 mb-4">Add Season</h2>
        <form onSubmit={add} className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <input required placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" required value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" required value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <input type="number" required placeholder="€/night" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} className="border border-stone-300 rounded-lg px-3 py-2 text-sm flex-1" />
            <button type="submit" className="bg-amber-500 text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-amber-400 transition">Add</button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100"><h2 className="font-bold text-stone-800">Current Seasons</h2></div>
        {rows.length === 0 ? (
          <div className="p-8 text-center text-stone-400">No seasons configured</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {rows.map(r => (
              <div key={r.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition">
                <div>
                  <p className="font-medium text-stone-800">{r.name}</p>
                  <p className="text-xs text-stone-500">{r.start} → {r.end}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-amber-700">€{r.rate}/night</span>
                  <button onClick={() => del(r.id)} className="text-red-500 hover:text-red-600 text-xs">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Blocked() {
  const [rows, setRows] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => { fetch("/api/blocked").then(r => r.json()).then(d => setRows(d.blocked || [])); }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/blocked", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, reason }) });
    setDate(""); setReason("");
    const r = await fetch("/api/blocked"); const d = await r.json(); setRows(d.blocked || []);
  }
  async function del(id: number) {
    await fetch(`/api/blocked?id=${id}`, { method: "DELETE" });
    setRows(rows.filter(r => r.id !== id));
  }
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-bold text-stone-800 mb-4">Block a Date</h2>
        <form onSubmit={add} className="flex flex-wrap gap-3">
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
          <button type="submit" className="bg-amber-500 text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-amber-400 transition">Block</button>
        </form>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100"><h2 className="font-bold text-stone-800">Blocked Dates</h2></div>
        {rows.length === 0 ? (
          <div className="p-8 text-center text-stone-400">No blocked dates</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {rows.map(r => (
              <div key={r.id} className="flex items-center justify-between px-6 py-3 hover:bg-stone-50/50 transition">
                <div>
                  <span className="font-medium text-stone-800">{r.date}</span>
                  {r.reason && <span className="text-xs text-stone-500 ml-3">{r.reason}</span>}
                </div>
                <button onClick={() => del(r.id)} className="text-red-500 hover:text-red-600 text-xs">Unblock</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Settings() {
  const [settings, setSettings] = useState<any>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => { fetch("/api/settings").then(r => r.json()).then(d => setSettings(d.settings || d)); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <form onSubmit={save} className="bg-white rounded-2xl border border-stone-200 p-6 max-w-lg">
      <h2 className="font-bold text-stone-800 mb-6">Site Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-stone-700">Base rate (€/night)</label>
          <input type="number" value={settings.baseRate ?? 200} onChange={e => setSettings({ ...settings, baseRate: Number(e.target.value) })}
            className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-stone-700">Minimum stay (nights)</label>
          <input type="number" value={settings.minStay ?? 3} onChange={e => setSettings({ ...settings, minStay: Number(e.target.value) })}
            className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-stone-700">Deposit %</label>
          <input type="number" value={settings.depositPct ?? 30} onChange={e => setSettings({ ...settings, depositPct: Number(e.target.value) })}
            className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-stone-700">Cleaning fee (€)</label>
          <input type="number" value={settings.cleaningFee ?? 0} onChange={e => setSettings({ ...settings, cleaningFee: Number(e.target.value) })}
            className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
        </div>
      </div>
      <button type="submit" className="mt-6 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-lg transition">
        {saved ? "✓ Saved" : "Save Settings"}
      </button>
    </form>
  );
}
