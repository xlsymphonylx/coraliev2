import { X } from "lucide-react";
import "@/components/admin/OrderPreviewModal.scss";

type OrderItem = { id: number; product_id: number; quantity: number };
type Order = {
  id: number; user_id: number | null; status: string; total: string; items: OrderItem[];
  anon_name: string | null; anon_email: string | null; anon_phone: string | null;
  user: { id: number; username: string; email: string; phone: string | null } | null;
  shipping_address: { id: number; label: string; line1: string; line2: string | null; city: string; state: string } | null;
  notes: string | null; created_at: string;
};

type Props = {
  order: Order;
  prodName: (id: number) => string;
  onClose: () => void;
};

function OrderPreviewModal({ order, prodName, onClose }: Props) {
  const contactName = order.anon_name ?? order.user?.username ?? `Usuario #${order.user_id}`;
  const contactEmail = order.anon_email ?? order.user?.email ?? null;
  const contactPhone = order.anon_phone ?? order.user?.phone ?? null;

  return (
    <div className="order-preview-overlay" onClick={onClose}>
      <div className="order-preview" onClick={(e) => e.stopPropagation()}>
        <div className="order-preview__header">
          <h2 className="order-preview__title">Pedido #{order.id}</h2>
          <button className="order-preview__close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="order-preview__body">
          {/* Contact */}
          <div className="order-preview__section">
            <h4>Contacto</h4>
            <p><strong>Nombre:</strong> {contactName}</p>
            {contactEmail && <p><strong>Email:</strong> {contactEmail}</p>}
            {contactPhone && <p><strong>Teléfono:</strong> {contactPhone}</p>}
            {order.user_id && <p><strong>Usuario ID:</strong> #{order.user_id}</p>}
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="order-preview__section">
              <h4>Dirección de envío</h4>
              <p>{order.shipping_address.label}</p>
              <p>{order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ""}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
            </div>
          )}

          {/* Items */}
          <div className="order-preview__section">
            <h4>Productos</h4>
            <table className="order-preview__items-table">
              <thead><tr><th>Producto</th><th>Cantidad</th></tr></thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td>{prodName(it.product_id)}</td>
                    <td>× {it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="order-preview__section">
              <h4>Notas</h4>
              <p>{order.notes}</p>
            </div>
          )}

          {/* Status + Total */}
          <div className="order-preview__footer-meta">
            <div>
              <span className="order-preview__label">Estado</span>
              <span className={`order-preview__status order-preview__status--${order.status}`}>{order.status}</span>
            </div>
            <div>
              <span className="order-preview__label">Total</span>
              <span className="order-preview__total">{`Q${order.total}`}</span>
            </div>
            <div>
              <span className="order-preview__label">Fecha</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPreviewModal;
