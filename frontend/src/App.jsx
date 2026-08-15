import { useEffect, useMemo, useState } from "react";

const emptyForm = { name: "", method: "V60", coffeeGrams: "", waterGrams: "", rating: "5" };
const methods = ["V60", "French Press", "AeroPress", "Chemex", "Espresso", "Other"];

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function BrewForm({ form, editingId, saving, onChange, onSubmit, onCancel }) {
  return <section className="brew-form-panel">
    <div className="form-heading"><div><p className="section-kicker">{editingId ? "UPDATE RECIPE" : "NEW RECIPE"}</p><h2>{editingId ? "Edit Brew" : "Add a Brew"}</h2><p>All fields are required.</p></div><button className="icon-button" type="button" onClick={onCancel}>×</button></div>
    <form onSubmit={onSubmit}><div className="form-grid">
      <div className="field field-wide"><label htmlFor="brew-name">Brew name</label><input id="brew-name" name="name" value={form.name} onChange={onChange} placeholder="Morning V60" required /></div>
      <div className="field"><label htmlFor="brew-method">Method</label><select id="brew-method" name="method" value={form.method} onChange={onChange}>{methods.map(m => <option key={m}>{m}</option>)}</select></div>
      <div className="field"><label htmlFor="coffee-grams">Coffee grams</label><input id="coffee-grams" type="number" min="1" name="coffeeGrams" value={form.coffeeGrams} onChange={onChange} placeholder="20" required /></div>
      <div className="field"><label htmlFor="water-grams">Water grams</label><input id="water-grams" type="number" min="1" name="waterGrams" value={form.waterGrams} onChange={onChange} placeholder="300" required /></div>
      <div className="field"><label htmlFor="brew-rating">Rating</label><select id="brew-rating" name="rating" value={form.rating} onChange={onChange}>{[5,4,3,2,1].map(r => <option key={r} value={r}>{r} / 5</option>)}</select></div>
    </div><div className="form-actions"><button className="secondary-button" type="button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Add Brew"}</button></div></form>
  </section>;
}

function Stars({ rating }) { return <span className="rating" aria-label={`Rating ${rating} out of 5`}>{"★".repeat(rating)}<span className="empty-stars">{"★".repeat(5-rating)}</span></span>; }

function BrewCard({ brew, onEdit, onDelete }) {
  const ratio = brew.coffeeGrams ? (brew.waterGrams / brew.coffeeGrams).toFixed(1) : "0.0";
  return <article className="brew-card">
    <div className="card-topline"><div><h3>{brew.name}</h3><span className="method-pill">{brew.method}</span></div><Stars rating={brew.rating} /></div>
    <div className="brew-stats"><div className="stat-item"><span>◉</span><div><small>Coffee</small><strong>{brew.coffeeGrams} g</strong></div></div><div className="stat-item"><span>♢</span><div><small>Water</small><strong>{brew.waterGrams} g</strong></div></div><div className="stat-item"><span>↔</span><div><small>Ratio</small><strong>1:{ratio}</strong></div></div></div>
    <div className="card-footer"><span>Recipe saved in your journal</span><div className="card-actions"><button onClick={() => onEdit(brew)}>Edit</button><button className="delete-button" onClick={() => onDelete(brew.id)}>Delete</button></div></div>
  </article>;
}

export default function App() {
  const [brews, setBrews] = useState([]), [form, setForm] = useState(emptyForm), [filter, setFilter] = useState("All"), [search, setSearch] = useState(""), [editingId, setEditingId] = useState(null), [showForm, setShowForm] = useState(false), [darkMode, setDarkMode] = useState(false), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState("");

  async function loadBrews() { try { setLoading(true); setBrews(await request("/api/brews")); setError(""); } catch (err) { setError(err.message); } finally { setLoading(false); } }
  useEffect(() => { loadBrews(); }, []);
  useEffect(() => { document.title = `Brews: ${brews.length}`; document.body.classList.toggle("dark-mode", darkMode); return () => document.body.classList.remove("dark-mode"); }, [brews.length, darkMode]);
  const visibleBrews = useMemo(() => { const q = search.trim().toLowerCase(); return brews.filter(b => (filter === "All" || b.method === filter) && (!q || b.name.toLowerCase().includes(q))); }, [brews, filter, search]);
  const updateField = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };
  const openNewBrew = () => { setForm(emptyForm); setEditingId(null); setMessage(""); setError(""); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };

  async function submit(e) {
    e.preventDefault(); setError(""); setMessage("");
    if (!form.name.trim() || !form.coffeeGrams || !form.waterGrams) return setError("Please complete all fields before saving.");
    const payload = { name: form.name.trim(), method: form.method, coffeeGrams: Number(form.coffeeGrams), waterGrams: Number(form.waterGrams), rating: Number(form.rating) };
    try { setSaving(true); if (editingId) { await request(`/api/brews/${editingId}`, { method: "PUT", body: JSON.stringify(payload) }); setMessage("Brew updated successfully."); } else { await request("/api/brews", { method: "POST", body: JSON.stringify(payload) }); setMessage("Brew added successfully."); } resetForm(); await loadBrews(); } catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  function editBrew(brew) { setEditingId(brew.id); setForm({ name: brew.name, method: brew.method, coffeeGrams: String(brew.coffeeGrams), waterGrams: String(brew.waterGrams), rating: String(brew.rating) }); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function deleteBrew(id) { if (!window.confirm("Delete this brew?")) return; try { await request(`/api/brews/${id}`, { method: "DELETE" }); setMessage("Brew deleted successfully."); await loadBrews(); } catch (err) { setError(err.message); } }

  return <div className="app-shell">
    <header className="topbar"><div className="topbar-inner"><div className="brand"><div className="brand-icon">☕</div><div><strong>Coffee Brew Log</strong><span>Brews: {brews.length}</span></div></div><div className="topbar-actions"><button className="theme-button" onClick={() => setDarkMode(v => !v)} aria-label="Toggle dark mode">{darkMode ? "☀" : "☾"}</button><button className="primary-button new-brew-button" onClick={openNewBrew}>⊕ <span>New Brew</span></button></div></div></header>
    <main className="page-container"><section className="page-heading"><h1>Brews: {brews.length}</h1><p>Track every cup, dial in your recipe, and remember what worked.</p></section>
      {message && <div className="notice success">{message}</div>}{error && <div className="notice error">{error}</div>}
      {showForm && <BrewForm form={form} editingId={editingId} saving={saving} onChange={updateField} onSubmit={submit} onCancel={resetForm} />}
      <section className="brew-list-section"><div className="toolbar"><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by coffee name..." /></div><div className="filter-box"><span>▽</span><select value={filter} onChange={e => setFilter(e.target.value)}><option value="All">All brew methods</option>{methods.map(m => <option key={m}>{m}</option>)}</select></div></div>
        {loading ? <div className="empty-state">Loading your brews...</div> : visibleBrews.length === 0 ? <div className="empty-state"><div className="empty-icon">☕</div><h2>{brews.length ? "No matching brews" : "No brews yet"}</h2><p>{brews.length ? "Try another search or brew method." : "Start your coffee journal by adding your first brew."}</p>{!brews.length && <button className="primary-button" onClick={openNewBrew}>⊕ Add your first brew</button>}</div> : <div className="brew-grid">{visibleBrews.map(b => <BrewCard key={b.id} brew={b} onEdit={editBrew} onDelete={deleteBrew} />)}</div>}
      </section></main><footer className="site-footer">Coffee Brew Log • Full-stack assessment project</footer>
  </div>;
}
