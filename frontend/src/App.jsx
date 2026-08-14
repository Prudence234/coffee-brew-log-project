import { useEffect, useState } from "react";

const emptyForm = { name: "", method: "V60", coffeeGrams: "", waterGrams: "", rating: "5" };
const methods = ["V60", "French Press", "AeroPress", "Chemex", "Espresso", "Other"];

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function BrewForm({ form, editingId, saving, onChange, onSubmit, onCancel }) {
  return (
    <section className="card form-card shadow-sm border-0 mb-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="h4 mb-1">{editingId ? "Edit Brew" : "Add a Brew"}</h2>
            <p className="text-secondary mb-0">All fields are required.</p>
          </div>
          {editingId && (
            <button className="btn btn-outline-secondary" type="button" onClick={onCancel}>
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="brew-name">Brew name</label>
              <input id="brew-name" className="form-control form-control-lg" name="name" value={form.name} onChange={onChange} placeholder="Morning V60" required />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="brew-method">Method</label>
              <select id="brew-method" className="form-select form-select-lg" name="method" value={form.method} onChange={onChange} required>
                {methods.map((method) => <option key={method}>{method}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-4">
              <label className="form-label" htmlFor="coffee-grams">Coffee grams</label>
              <input id="coffee-grams" className="form-control form-control-lg" type="number" min="1" step="1" name="coffeeGrams" value={form.coffeeGrams} onChange={onChange} placeholder="20" required />
            </div>
            <div className="col-12 col-sm-4">
              <label className="form-label" htmlFor="water-grams">Water grams</label>
              <input id="water-grams" className="form-control form-control-lg" type="number" min="1" step="1" name="waterGrams" value={form.waterGrams} onChange={onChange} placeholder="300" required />
            </div>
            <div className="col-12 col-sm-4">
              <label className="form-label" htmlFor="brew-rating">Rating</label>
              <select id="brew-rating" className="form-select form-select-lg" name="rating" value={form.rating} onChange={onChange} required>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-coffee btn-lg mt-4" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Brew"}
          </button>
        </form>
      </div>
    </section>
  );
}

function BrewCard({ brew, onEdit, onDelete }) {
  return (
    <article className="card brew-card h-100 border-0 shadow-sm">
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between gap-3 mb-3">
          <div>
            <span className="method-pill">{brew.method}</span>
            <h3 className="h5 mt-3 mb-0">{brew.name}</h3>
          </div>
          <div className="rating" aria-label={`Rating ${brew.rating} out of 5`}>
            {"★".repeat(brew.rating)}{"☆".repeat(5 - brew.rating)}
          </div>
        </div>
        <div className="stats mt-auto">
          <div><span>Coffee</span><strong>{brew.coffeeGrams} g</strong></div>
          <div><span>Water</span><strong>{brew.waterGrams} g</strong></div>
          <div><span>Ratio</span><strong>1:{(brew.waterGrams / brew.coffeeGrams).toFixed(1)}</strong></div>
        </div>
        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-outline-dark flex-fill" onClick={() => onEdit(brew)}>Edit</button>
          <button className="btn btn-outline-danger flex-fill" onClick={() => onDelete(brew.id)}>Delete</button>
        </div>
      </div>
    </article>
  );
}

function BrewList({ brews, loading, filter, onFilterChange, onEdit, onDelete }) {
  return (
    <section>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        <div>
          <h2 className="h4 mb-1">Your brews</h2>
          <p className="text-secondary mb-0">Filter your log by brew method.</p>
        </div>
        <select className="form-select filter-select" value={filter} onChange={(event) => onFilterChange(event.target.value)} aria-label="Filter brews by method">
          <option>All</option>
          {methods.map((method) => <option key={method}>{method}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-5 text-secondary">Loading brews...</div>
      ) : brews.length === 0 ? (
        <div className="empty-state text-center py-5 px-3">
          <div className="empty-icon">☕</div>
          <h3 className="h5">No brews yet</h3>
          <p className="text-secondary mb-0">Add your first recipe above to start your log.</p>
        </div>
      ) : (
        <div className="row g-4">
          {brews.map((brew) => (
            <div className="col-12 col-md-6 col-xl-4" key={brew.id}>
              <BrewCard brew={brew} onEdit={onEdit} onDelete={onDelete} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBrews();
  }, [filter]);

  useEffect(() => {
    document.title = `Brews: ${brews.length}`;
  }, [brews.length]);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.method || !form.coffeeGrams || !form.waterGrams || !form.rating) {
      setError("Please complete all fields before saving.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      method: form.method,
      coffeeGrams: Number(form.coffeeGrams),
      waterGrams: Number(form.waterGrams),
      rating: Number(form.rating)
    };

    try {
      setSaving(true);
      if (editingId) {
        await request(`/api/brews/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        setMessage("Brew updated successfully.");
      } else {
        await request("/api/brews", { method: "POST", body: JSON.stringify(payload) });
        setMessage("Brew added successfully.");
      }
      resetForm();
      await loadBrews();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editBrew(brew) {
    setEditingId(brew.id);
    setForm({
      name: brew.name,
      method: brew.method,
      coffeeGrams: String(brew.coffeeGrams),
      waterGrams: String(brew.waterGrams),
      rating: String(brew.rating)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteBrew(id) {
    if (!window.confirm("Delete this brew?")) return;
    try {
      await request(`/api/brews/${id}`, { method: "DELETE" });
      setMessage("Brew deleted successfully.");
      await loadBrews();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="hero-section">
        <div className="container py-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <div>
              <span className="eyebrow">YOUR DAILY COFFEE JOURNAL</span>
              <h1 className="display-4 fw-bold mb-2">Brews: {brews.length}</h1>
              <p className="lead mb-0">Record your recipes, rate your brews, and find your favourites.</p>
            </div>
            <div className="brew-count">Coffee Brew Log</div>
          </div>
        </div>
      </header>

      <main className="container py-4 py-lg-5">
        {message && <div className="alert alert-success shadow-sm" role="status">{message}</div>}
        {error && <div className="alert alert-danger shadow-sm" role="alert">{error}</div>}

        <BrewForm
          form={form}
          editingId={editingId}
          saving={saving}
          onChange={updateField}
          onSubmit={submit}
          onCancel={resetForm}
        />

        <BrewList
          brews={brews}
          loading={loading}
          filter={filter}
          onFilterChange={setFilter}
          onEdit={editBrew}
          onDelete={deleteBrew}
        />
      </main>

      <footer className="container pb-4 text-center text-secondary small">
        Coffee Brew Log • Full-stack assessment project
      </footer>
    </div>
  );
}
