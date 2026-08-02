import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Layers, Tags, ShoppingCart, Users,
  Warehouse, Building2, Percent, LogOut, ExternalLink, Image,
} from "lucide-react";
import { clearToken } from "@/api/client";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/productos", label: "Productos", icon: Package },
  { to: "/admin/categorias", label: "Categorías", icon: Layers },
  { to: "/admin/etiquetas", label: "Etiquetas", icon: Tags },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users },
  { to: "/admin/inventario", label: "Inventario", icon: Warehouse },
  { to: "/admin/almacenes", label: "Almacenes", icon: Building2 },
  { to: "/admin/descuentos", label: "Descuentos", icon: Percent },
  { to: "/admin/conjuntos-descuentos", label: "Conjuntos Descuentos", icon: Percent },
  { to: "/admin/promo", label: "Promo", icon: Image },
  { to: "/admin/vitrina", label: "Vitrina", icon: Image },
];

const storeLink = { to: "/productos?category=all", label: "Ver tienda", icon: ExternalLink };

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`admin-sidebar${open ? " admin-sidebar--open" : ""}`}>
      <div className="admin-sidebar__brand">
        <img src="/logo.png" alt="Coralie" className="admin-sidebar__logo" />
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar__footer">
        <Link
          to={storeLink.to}
          className="admin-sidebar__logout"
          onClick={onClose}
        >
          <ExternalLink size={18} />
          <span>{storeLink.label}</span>
        </Link>

        <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
