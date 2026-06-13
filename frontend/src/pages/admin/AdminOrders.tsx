import { useEffect, useState } from "react";
import client from "@/api/client";
import "@/pages/admin/AdminOrders.scss";
import "@/pages/admin/AdminOrders_responsive.scss";

type OrderItem = { id: number; product_id: number; quantity: number };
type Order = { id: number; user_id: number | null; anon_name: string | null; status: string; total: string; items: OrderItem[]; notes: string | null; created_at: string; };

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

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

  return (
    <div className="admin-orders">
      <div className="admin-orders__header">
        <h1 className="admin-orders__title">Pedidos</h1>
        <button className="admin-orders__refresh" onClick={fetch}>Recargar</button>
      </div>

      {error && <p className="admin-orders__error">{error}</p>}

      {loading ? <p className="admin-orders__status">Cargando...</p>
      : items.length === 0 ? <p className="admin-orders__status">Sin pedidos</p>
      : (
        <div className="admin-orders__table-wrap">
          <table className="admin-orders__table">
            <thead>
              <tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th><th>Items</th></tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <>
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
                  {expanded === o.id && (
                    <tr key={`${o.id}-detail`} className="admin-orders__detail">
                      <td colSpan={6}>
                        <div className="admin-orders__detail-inner">
                          <strong>Items:</strong>
                          <ul>
                            {o.items.map((it) => (
                              <li key={it.id}>Producto #{it.product_id} × {it.quantity}</li>
                            ))}
                          </ul>
                          {o.notes && <p><strong>Notas:</strong> {o.notes}</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
