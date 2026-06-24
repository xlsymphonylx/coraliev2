import { useEffect, useMemo, useState } from "react";
import { LogIn, LogOut, Menu, ShieldCheck, UserPlus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "@/api/client";
import { fetchCategories, buildCategoryTree } from "@/api/categories";
import type { CategoryTreeNode } from "@/api/categories";
import UserDropdown from "./UserDropdown";
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
      .catch(() => {});
  }, []);

  const topCategories = useMemo(
    () => catTree.map((node) => ({ label: node.name, slug: node.slug })),
    [catTree],
  );

  const handleLogout = () => {
    clearToken();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <Link to="/" className="navbar__brand">
        <img src="logo.png" alt="Coralie" className="navbar__brand-file" />
      </Link>

      <div className={`navbar__links${menuOpen ? " navbar__links--open" : ""}`}>
        {/* Category links — inline scrollable on desktop, 5-per-row grid in hamburger */}
        <div className="navbar__cats">
          {topCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/productos?category=${cat.slug}`}
              className="navbar__link"
              onClick={() => setMenuOpen(false)}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Mobile-only auth actions */}
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
