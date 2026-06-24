import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import AdminForm from "@/components/admin/AdminForm";
import "@/pages/admin/AdminOrders.scss";

type OrderItem = { id: number; product_id: number; quantity: number };
type Order = { id: number; user_id: number | null; anon_name: string | null; status: string; total: string; items: OrderItem[]; notes: string | null; created_at: string; };
type Product = { id: number; name: string; price: string };

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const action = params.get("action");

  const [items, setItems] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Create form
  const [formName, setFormName] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formItems, setFormItems] = useState<{ product_id: string; quantity: string }[]>([{ product_id: "", quantity: "1" }]);

  const fetch = async () => {
    setLoading(true);
    try {
      const [or, pr] = await Promise.all([client.get("/orders"), client.get("/products?limit=500")]);
      setItems(or.data.data ?? []);
      setProducts(pr.data.data ?? []);
    } catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const goToList = () => { setParams({}); setFormName(""); setFormNotes(""); setFormItems([{ product_id: "", quantity: "1" }]); };

  const handleStatus = async (id: number, status: string) => {
    try { await client.patch(`/orders/${id}/status`, { status }); fetch(); }
    catch { setError("Error al actualizar estado"); }
  };

  const addFormItem = () => setFormItems((prev) => [...prev, { product_id: "", quantity: "1" }]);
  const updateFormItem = (i: number, field: "product_id" | "quantity", value: string) => {
    setFormItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };
  const removeFormItem = (i: number) => setFormItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await client.post("/orders/admin", {
        items: formItems.map((f) => ({ product_id: Number(f.product_id), quantity: Number(f.quantity) })),
        anon_name: formName || null,
        notes: formNotes || null,
      });
      setParams({});
      fetch();
    } catch (err: unknown) { setError((err as any)?.response?.data?.message ?? "Error"); }
    finally { setSaving(false); }
  };

  const filtered = items.filter((o) =>
    !search ||
    String(o.id).includes(search) ||
    o.anon_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.status.toLowerCase().includes(search.toLowerCase())
  );

  if (action === "crear") {
    return (
      <AdminForm title="Nuevo pedido" onBack={goToList} onSubmit={handleCreate} saving={saving} error={error}>
        <AdminForm.Field label="Nombre del cliente">
          <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nombre del cliente" />
        </AdminForm.Field>

        <div className="admin-form__field">
          <span>Productos</span>
          {formItems.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: i > 0 ? "0.5rem" : 0 }}>
              <select value={f.product_id} onChange={(e) => updateFormItem(i, "product_id", e.target.value)} required style={{ flex: 1, minWidth: "12rem" }} className="field-input">
                <option value="">Seleccionar producto...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — Q{p.price}</option>)}
              </select>
              <input type="number" min={1} value={f.quantity} onChange={(e) => updateFormItem(i, "quantity", e.target.value)} required style={{ width: "5rem" }} className="field-input" />
              {formItems.length > 1 && (
                <button type="button" className="btn-danger" onClick={() => removeFormItem(i)} style={{ padding: "0.3rem 0.5rem" }}>X</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addFormItem} style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}>+ Agregar producto</button>
        </div>

        <AdminForm.Field label="Notas">
          <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Notas (opcional)" rows={2} style={{ resize: "vertical" }} />
        </AdminForm.Field>

        <AdminForm.Actions saving={saving} saveLabel="Crear pedido" onCancel={() => { setFormName(""); setFormNotes(""); setFormItems([{ product_id: "", quantity: "1" }]); }} />
      </AdminForm>
    );
  }

  return (
    <CrudPage
      title="Pedidos"
      action={{ label: "+ Nuevo", onClick: () => setParams({ action: "crear" }) }}
      search={{ placeholder: "Buscar por ID, cliente o estado...", value: search, onChange: setSearch }}
    >
      {error && <p className="error-msg">{error}</p>}

      {loading ? <p className="status-msg">Cargando...</p>
      : filtered.length === 0 ? <p className="status-msg">{search ? "Sin resultados" : "Sin pedidos"}</p>
      : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th><th>Items</th></tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="admin-orders__row" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <td>{o.id}</td>
                  <td>{o.anon_name ?? `Usuario #${o.user_id}`}</td>
                  <td>Q{o.total}</td>
                  <td>
                    <select
                      className={`admin-orders__status admin-orders__status--${o.status}`}
                      value={o.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatus(o.id, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>{o.items.length} producto(s)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expanded !== null && items.find((o) => o.id === expanded) && (
        <div className="admin-orders__detail">
          {(() => {
            const o = items.find((x) => x.id === expanded)!;
            return (
              <div className="admin-orders__detail-inner">
                <strong>Items:</strong>
                <ul>
                  {o.items.map((it) => (
                    <li key={it.id}>Producto #{it.product_id} × {it.quantity}</li>
                  ))}
                </ul>
                {o.notes && <p><strong>Notas:</strong> {o.notes}</p>}
              </div>
            );
          })()}
        </div>
      )}
    </CrudPage>
  );
}

export default AdminOrders;
