import { useEffect, useState } from "react";

const emptyForm = { name: "", method: "V60", coffeeGrams: "", waterGrams: "", rating: "5" };
const methods = ["V60", "French Press", "AeroPress", "Chemex", "Espresso", "Other"];

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function App() {
  const [brews, setBrews] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBrews() {
    try {
      setLoading(true);
      const query = filter === "All" ? "" : `?method=${encodeURIComponent(filter)}`;
      setBrews(await request(`/api/brews${query}`));
      setError("");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadBrews(); }, [filter]);

  const updateField = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  async function submit(e) {
    e.preventDefault(); setError(""); setMessage("");
    if (!form.name.trim() || !form.method || !form.coffeeGrams || !form.waterGrams || !form.rating) {
      setError("Please complete all fields before saving."); return;
    }
    const payload = { name: form.name.trim(), method: form.method, coffeeGrams: Number(form.coffeeGrams), waterGrams: Number(form.waterGrams), rating: Number(form.rating) };
    try {
      setSaving(true);
      if (editingId) { await request(`/api/brews/${editingId}`, { method: "PUT", body: JSON.stringify(payload) }); setMessage("Brew updated successfully."); }
      else { await request("/api/brews", { method: "POST", body: JSON.stringify(payload) }); setMessage("Brew added successfully."); }
      resetForm(); await loadBrews();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  function editBrew(brew) {
    setEditingId(brew.id);
    setForm({ name: brew.name, method: brew.method, coffeeGrams: String(brew.coffeeGrams), waterGrams: String(brew.waterGrams), rating: String(brew.rating) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteBrew(id) {
    if (!window.confirm("Delete this brew?")) return;
    try { await request(`/api/brews/${id}`, { method: "DELETE" }); setMessage("Brew deleted successfully."); await loadBrews(); }
    catch (err) { setError(err.message); }
  }

  return <div className="app-shell">
    <header className="hero-section"><div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
        <div><span className="eyebrow">YOUR DAILY COFFEE JOURNAL</span><h1 className="display-4 fw-bold mb-2">Coffee Brew Log</h1><p className="lead mb-0">Record your recipes, rate your brews, and find your favourites.</p></div>
        <div className="brew-count">Brews: <strong>{brews.length}</strong></div>
      </div>
    </div></header>

    <main className="container py-4 py-lg-5">
      {message && <div className="alert alert-success shadow-sm">{message}</div>}
      {error && <div className="alert alert-danger shadow-sm">{error}</div>}

      <section className="card form-card shadow-sm border-0 mb-4"><div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4"><div><h2 className="h4 mb-1">{editingId ? "Edit Brew" : "Add a Brew"}</h2><p className="text-secondary mb-0">All fields are required.</p></div>{editingId && <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>Cancel edit</button>}</div>
        <form onSubmit={submit}><div className="row g-3">
          <div className="col-12 col-md-6"><label className="form-label">Brew name</label><input className="form-control form-control-lg" name="name" value={form.name} onChange={updateField} placeholder="Morning V60" required /></div>
          <div className="col-12 col-md-6"><label className="form-label">Method</label><select className="form-select form-select-lg" name="method" value={form.method} onChange={updateField}>{methods.map((m) => <option key={m}>{m}</option>)}</select></div>
          <div className="col-12 col-sm-4"><label className="form-label">Coffee grams</label><input className="form-control form-control-lg" type="number" min="1" name="coffeeGrams" value={form.coffeeGrams} onChange={updateField} placeholder="20" required /></div>
          <div className="col-12 col-sm-4"><label className="form-label">Water grams</label><input className="form-control form-control-lg" type="number" min="1" name="waterGrams" value={form.waterGrams} onChange={updateField} placeholder="300" required /></div>
          <div className="col-12 col-sm-4"><label className="form-label">Rating</label><select className="form-select form-select-lg" name="rating" value={form.rating} onChange={updateField}>{[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} / 5</option>)}</select></div>
        </div><button className="btn btn-coffee btn-lg mt-4" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Add Brew"}</button></form>
      </div></section>

      <section><div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3"><div><h2 className="h4 mb-1">Your brews</h2><p className="text-secondary mb-0">Filter your log by brew method.</p></div><select className="form-select filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option>{methods.map((m) => <option key={m}>{m}</option>)}</select></div>
        {loading ? <div className="text-center py-5 text-secondary">Loading brews...</div> : brews.length === 0 ? <div className="empty-state text-center py-5 px-3"><div className="empty-icon">☕</div><h3 className="h5">No brews yet</h3><p className="text-secondary mb-0">Add your first recipe above to start your log.</p></div> : <div className="row g-4">{brews.map((brew) => <div className="col-12 col-md-6 col-xl-4" key={brew.id}><article className="card brew-card h-100 border-0 shadow-sm"><div className="card-body p-4 d-flex flex-column"><div className="d-flex justify-content-between gap-3 mb-3"><div><span className="method-pill">{brew.method}</span><h3 className="h5 mt-3 mb-0">{brew.name}</h3></div><div className="rating">{"★".repeat(brew.rating)}{"☆".repeat(5-brew.rating)}</div></div><div className="stats mt-auto"><div><span>Coffee</span><strong>{brew.coffeeGrams} g</strong></div><div><span>Water</span><strong>{brew.waterGrams} g</strong></div><div><span>Ratio</span><strong>1:{(brew.waterGrams/brew.coffeeGrams).toFixed(1)}</strong></div></div><div className="d-flex gap-2 mt-4"><button className="btn btn-outline-dark flex-fill" onClick={() => editBrew(brew)}>Edit</button><button className="btn btn-outline-danger flex-fill" onClick={() => deleteBrew(brew.id)}>Delete</button></div></div></article></div>)}</div>}
      </section>
    </main>
    <footer className="container pb-4 text-center text-secondary small">Coffee Brew Log • Full-stack assessment project</footer>
  </div>;
}
