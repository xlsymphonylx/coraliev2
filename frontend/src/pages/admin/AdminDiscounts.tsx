import { useEffect, useState } from "react";
import client from "@/api/client";
import "@/pages/admin/AdminDiscounts.scss";
import "@/pages/admin/AdminDiscounts_responsive.scss";

type ProdDiscount = { id: number; product_id: number; discount_percent: string; active: boolean; starts_at: string | null; ends_at: string | null };
type VolDiscount = { id: number; product_id: number | null; min_quantity: number; discount_percent: string; description: string | null };

function AdminDiscounts() {
  const [tab, setTab] = useState<"product" | "volume">("product");
  const [pd, setPd] = useState<ProdDiscount[]>([]);
  const [vd, setVd] = useState<VolDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ product_id: "", discount_percent: "", active: "true", starts_at: "", ends_at: "", min_quantity: "5", description: "", product_id_v: "" });
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const [pr, vr] = await Promise.all([client.get("/product-discounts"), client.get("/volume-discounts")]);
      setPd(pr.data.data ?? []); setVd(vr.data.data ?? []);
    } catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => { setShowForm(false); setEditing(null); setForm({ product_id: "", discount_percent: "", active: "true", starts_at: "", ends_at: "", min_quantity: "5", description: "", product_id_v: "" }); }, [tab]);

  const resetForm = () => {
    setShowForm(false); setEditing(null);
    setForm({ product_id: "", discount_percent: "", active: "true", starts_at: "", ends_at: "", min_quantity: "5", description: "", product_id_v: "" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      if (tab === "product") {
        const payload = { product_id: Number(form.product_id), discount_percent: form.discount_percent, active: form.active === "true", starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null, ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null };
        if (editing) await client.patch(`/product-discounts/${editing}`, payload);
        else await client.post("/product-discounts", payload);
      } else {
        const payload = { product_id: form.product_id_v ? Number(form.product_id_v) : null, min_quantity: Number(form.min_quantity), discount_percent: form.discount_percent, description: form.description || null };
        if (editing) await client.patch(`/volume-discounts/${editing}`, { min_quantity: payload.min_quantity, discount_percent: payload.discount_percent, description: payload.description });
        else await client.post("/volume-discounts", payload);
      }
      resetForm(); fetch();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-disc">
      <div className="admin-disc__header">
        <h1 className="admin-disc__title">Descuentos</h1>
      </div>

      <div className="admin-disc__tabs">
        <button className={`admin-disc__tab${tab === "product" ? " admin-disc__tab--active" : ""}`} onClick={() => setTab("product")}>Por producto</button>
        <button className={`admin-disc__tab${tab === "volume" ? " admin-disc__tab--active" : ""}`} onClick={() => setTab("volume")}>Por volumen</button>
      </div>

      {error && <p className="admin-disc__error">{error}</p>}

      <button className="admin-disc__create" onClick={() => { resetForm(); setShowForm(true); }}>
        + {tab === "product" ? "Nuevo descuento" : "Nuevo desc. por volumen"}
      </button>

      {showForm && (
        <form className="admin-disc__form" onSubmit={handleSave}>
          {tab === "product" ? (
            <>
              <label className="admin-disc__field"><span>Producto ID *</span><input type="number" value={form.product_id} onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))} required /></label>
              <label className="admin-disc__field"><span>% descuento *</span><input type="number" step="0.01" value={form.discount_percent} onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))} required /></label>
              <label className="admin-disc__field"><span>Activo</span><select value={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.value }))}><option value="true">Sí</option><option value="false">No</option></select></label>
              <div className="admin-disc__row">
                <label className="admin-disc__field"><span>Inicio</span><input type="date" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} /></label>
                <label className="admin-disc__field"><span>Fin</span><input type="date" value={form.ends_at} onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))} /></label>
              </div>
            </>
          ) : (
            <>
              <label className="admin-disc__field"><span>Producto ID (opcional)</span><input type="number" value={form.product_id_v} onChange={(e) => setForm((f) => ({ ...f, product_id_v: e.target.value }))} placeholder="Vacío = aplica a todos" /></label>
              <label className="admin-disc__field"><span>Cantidad mínima *</span><input type="number" value={form.min_quantity} onChange={(e) => setForm((f) => ({ ...f, min_quantity: e.target.value }))} required /></label>
              <label className="admin-disc__field"><span>% descuento *</span><input type="number" step="0.01" value={form.discount_percent} onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))} required /></label>
              <label className="admin-disc__field"><span>Descripción</span><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></label>
            </>
          )}
          <div className="admin-disc__actions">
            <button type="submit" className="admin-disc__save" disabled={saving}>{saving ? "..." : "Guardar"}</button>
            <button type="button" className="admin-disc__cancel" onClick={resetForm}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <p className="admin-disc__status">Cargando...</p>
      : (
        <div className="admin-disc__tables">
          {tab === "product" && (
            pd.length === 0 ? <p className="admin-disc__status">Sin descuentos</p>
            : (
              <div className="admin-disc__table-wrap">
                <table className="admin-disc__table">
                  <thead><tr><th>ID</th><th>Producto</th><th>%</th><th>Activo</th><th>Vigencia</th><th>Acción</th></tr></thead>
                  <tbody>
                    {pd.map((d) => (
                      <tr key={d.id}>
                        <td>{d.id}</td><td>#{d.product_id}</td><td>{d.discount_percent}%</td>
                        <td>{d.active ? "✅" : "❌"}</td>
                        <td>{d.starts_at ? `${new Date(d.starts_at).toLocaleDateString()} - ${d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "∞"}` : "Siempre"}</td>
                        <td><button className="admin-disc__delete" onClick={async () => { if (confirm("Eliminar?")) { try { await client.delete(`/product-discounts/${d.id}`); fetch(); } catch { setError("Error"); } }}}>Eliminar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
          {tab === "volume" && (
            vd.length === 0 ? <p className="admin-disc__status">Sin descuentos por volumen</p>
            : (
              <div className="admin-disc__table-wrap">
                <table className="admin-disc__table">
                  <thead><tr><th>ID</th><th>Producto</th><th>Mín</th><th>%</th><th>Descripción</th><th>Acción</th></tr></thead>
                  <tbody>
                    {vd.map((d) => (
                      <tr key={d.id}>
                        <td>{d.id}</td><td>{d.product_id ? `#${d.product_id}` : "Todos"}</td>
                        <td>{d.min_quantity}</td><td>{d.discount_percent}%</td>
                        <td>{d.description ?? "—"}</td>
                        <td><button className="admin-disc__delete" onClick={async () => { if (confirm("Eliminar?")) { try { await client.delete(`/volume-discounts/${d.id}`); fetch(); } catch { setError("Error"); } }}}>Eliminar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDiscounts;
