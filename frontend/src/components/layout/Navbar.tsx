import { useEffect, useState } from "react";
import { HomeIcon, LogIn, LogOut, Menu, MessageCircle, Package, ShieldCheck, UserPlus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "@/api/client";
import { fetchCategories, buildCategoryTree } from "@/api/categories";
import type { CategoryTreeNode } from "@/api/categories";
import UserDropdown from "./UserDropdown";
import NavDropdown from "./NavDropdown";
import type { DropdownItem } from "./NavDropdown";
import "@/components/layout/styles/Navbar.scss";
import "@/components/layout/styles/Navbar_responsive.scss";

type NavbarProps = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
};

function Navbar({ isAuthenticated, isAdmin, username }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catTree, setCatTree] = useState<CategoryTreeNode[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCatTree(buildCategoryTree(cats)))
      .catch(() => {}); // non-critical, navbar still works
  }, []);

  const handleLogout = () => {
    clearToken();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  /** Convert category tree nodes into NavDropdown items */
  function treeToDropdownItems(nodes: CategoryTreeNode[]): DropdownItem[] {
    const items: DropdownItem[] = nodes.map((node) => ({
      label: node.name,
      to: `/productos?category=${node.slug}`,
      children: node.children.length > 0 ? treeToDropdownItems(node.children) : undefined,
    }));
    // Add "Ver todos" at the end
    items.push({ label: "Ver todos", to: "/productos" });
    return items;
  }

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <img src="logo.png" alt="" className="navbar__brand-file" />
      </div>

      <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`navbar__links${menuOpen ? " navbar__links--open" : ""}`}>
        <Link to="/" className="navbar__link" onClick={() => setMenuOpen(false)}>
          <HomeIcon />
          Inicio
        </Link>
        <NavDropdown
          icon={<Package />}
          label="Productos"
          menuOpen={menuOpen}
          onNavigate={() => setMenuOpen(false)}
          items={treeToDropdownItems(catTree)}
        />
        <Link to="/" className="navbar__link" onClick={() => setMenuOpen(false)}>
          <MessageCircle />
          Contacto
        </Link>
        {!isAuthenticated ? (
          <div className="navbar__mobile-auth">
            <Link to="/login" className="navbar__link" onClick={() => setMenuOpen(false)}>
              <LogIn /> Login
            </Link>
            <Link to="/signup" className="navbar__link" onClick={() => setMenuOpen(false)}>
              <UserPlus /> Signup
            </Link>
          </div>
        ) : (
          <div className="navbar__mobile-auth">
            {isAdmin && (
              <Link to="/admin" className="navbar__link" onClick={() => setMenuOpen(false)}>
                <ShieldCheck /> Admin
              </Link>
            )}
            <button className="navbar__link" onClick={handleLogout}>
              <LogOut /> Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <div className="navbar__user-area">
        {isAuthenticated ? (
          <UserDropdown isAdmin={isAdmin} username={username} />
        ) : (
          <div className="navbar__auth-actions">
            <Link to="/login" className="navbar__action navbar__action--secondary">Login</Link>
            <Link to="/signup" className="navbar__action">Signup</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
