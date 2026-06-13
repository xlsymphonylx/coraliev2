import { useEffect, useState } from "react";
import client from "@/api/client";
import CrudPage from "@/components/admin/CrudPage";
import "@/pages/admin/AdminOrders.scss";

type OrderItem = { id: number; product_id: number; quantity: number };
type Order = { id: number; user_id: number | null; anon_name: string | null; status: string; total: string; items: OrderItem[]; notes: string | null; created_at: string; };

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await client.get("/orders"); setItems(data.data ?? []); }
    catch { setError("Error al cargar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleStatus = async (id: number, status: string) => {
    try { await client.patch(`/orders/${id}/status`, { status }); fetch(); }
    catch { setError("Error al actualizar estado"); }
  };

  const filtered = items.filter((o) =>
    !search ||
    String(o.id).includes(search) ||
    o.anon_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CrudPage title="Pedidos" action={{ label: "Recargar", onClick: fetch }} search={{ placeholder: "Buscar por ID, cliente o estado...", value: search, onChange: setSearch }}>
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
                  <td>${o.total}</td>
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
