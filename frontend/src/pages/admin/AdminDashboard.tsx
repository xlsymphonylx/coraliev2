import { useEffect, useState } from "react";
import { DollarSign, Clock, ShoppingBag } from "lucide-react";
import client from "@/api/client";
import OrderPreviewModal from "@/components/admin/OrderPreviewModal";
import "@/pages/admin/AdminDashboard.scss";
import "@/pages/admin/AdminDashboard_responsive.scss";

type OrderItem = { id: number; product_id: number; quantity: number };
type Order = { id: number; user_id: number | null; user: { id: number; username: string; email: string; phone: string | null } | null; shipping_address: { id: number; label: string; line1: string; line2: string | null; city: string; state: string } | null; anon_name: string | null; anon_email: string | null; anon_phone: string | null; status: string; total: string; items: OrderItem[]; notes: string | null; created_at: string; };
type Product = { id: number; name: string; price: string };

const STATUS_ORDER = ["pending", "confirmed", "processing"];
const STATUS_LABELS: Record<string, string> = { pending: "Pendientes", confirmed: "Confirmados", processing: "En proceso" };

function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([client.get("/orders"), client.get("/products?limit=500")])
      .then(([or, pr]) => { setOrders(or.data.data ?? []); setProducts(pr.data.data ?? []); })
      .catch(() => setError("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const ordersToday = orders.filter((o) => new Date(o.created_at) >= startOfToday);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const revenueThisMonth = orders
    .filter((o) => new Date(o.created_at) >= startOfMonth && o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const outstanding = orders
    .filter((o) => STATUS_ORDER.includes(o.status))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const groupedOutstanding: Record<string, Order[]> = {};
  for (const s of STATUS_ORDER) groupedOutstanding[s] = outstanding.filter((o) => o.status === s);

  const prodName = (id: number) => products.find((p) => p.id === id)?.name ?? `#${id}`;
  const previewOrder = previewId ? orders.find((o) => o.id === previewId) ?? null : null;

  if (loading) return <div className="page-panel"><p className="status-msg">Cargando...</p></div>;
  if (error) return <div className="page-panel"><p className="error-msg">{error}</p></div>;

  return (
    <div className="page-panel">
      <div className="page-header" style={{ marginBottom: "1.25rem" }}>
        <h1 className="page-title">Panel de Administración</h1>
      </div>

      {/* ─── KPI Cards ────────────────────────────────── */}
      <div className="dashboard__kpis">
        <div className="dashboard__kpi">
          <div className="dashboard__kpi-icon" style={{ background: "var(--coralie-blush)", color: "var(--coralie-spicy)" }}>
            <ShoppingBag size={20} />
          </div>
          <div className="dashboard__kpi-body">
            <span className="dashboard__kpi-value">{ordersToday.length}</span>
            <span className="dashboard__kpi-label">Pedidos hoy</span>
          </div>
        </div>
        <div className="dashboard__kpi">
          <div className="dashboard__kpi-icon" style={{ background: "#fff3cd", color: "#856404" }}>
            <Clock size={20} />
          </div>
          <div className="dashboard__kpi-body">
            <span className="dashboard__kpi-value">{pendingCount}</span>
            <span className="dashboard__kpi-label">Pendientes</span>
          </div>
        </div>
        <div className="dashboard__kpi">
          <div className="dashboard__kpi-icon" style={{ background: "#d4edda", color: "#155724" }}>
            <DollarSign size={20} />
          </div>
          <div className="dashboard__kpi-body">
            <span className="dashboard__kpi-value">Q{Number(revenueThisMonth).toFixed(2)}</span>
            <span className="dashboard__kpi-label">Ingresos del mes</span>
          </div>
        </div>
      </div>

      {/* ─── Outstanding Orders ──────────────────────── */}
      <h2 style={{ fontFamily: "var(--coralie-contrast-font)", fontSize: "1.1rem", fontWeight: 700, color: "var(--coralie-dark)", margin: "1.25rem 0 0.75rem" }}>
        Pedidos pendientes
      </h2>

      {outstanding.length === 0 ? (
        <p className="status-msg">No hay pedidos pendientes</p>
      ) : (
        STATUS_ORDER.map((s) => {
          const list = groupedOutstanding[s];
          if (!list?.length) return null;
          return (
            <div key={s} style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontFamily: "var(--coralie-contrast-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--coralie-mid)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                {STATUS_LABELS[s]} ({list.length})
              </h3>
              <div className="dashboard__order-list">
                {list.map((o) => (
                  <div key={o.id} className="dashboard__order-card" onClick={() => setPreviewId(o.id)}>
                    <div className="dashboard__order-card-top">
                      <strong>#{o.id}</strong>
                      <span className={`dashboard__order-status dashboard__order-status--${o.status}`}>{o.status}</span>
                    </div>
                    <div className="dashboard__order-card-info">
                      <span>{o.anon_name ?? o.user?.username ?? `Usuario #${o.user_id}`}</span>
                      <span>Q{o.total}</span>
                      <span className="dashboard__order-date">{new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* ─── Preview Modal ──────────────────────────── */}
      {previewOrder && (
        <OrderPreviewModal order={previewOrder} prodName={prodName} onClose={() => setPreviewId(null)} />
      )}
    </div>
  );
}

export default AdminDashboard;
