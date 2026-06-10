import { HomeIcon, MessageCircle, Package } from "lucide-react";
import { Link } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import "@/components/layout/styles/Navbar.scss";

type NavbarProps = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
};

function Navbar({ isAuthenticated, isAdmin, username }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <img src="logo.png" alt="" className="navbar__brand-file" />
      </div>
      <div className="navbar__links">
        <Link to="/" className="navbar__link">
          <HomeIcon />
          Inicio
        </Link>
        <Link to="/productos?category=maquillaje" className="navbar__link">
          <Package />
          Productos
        </Link>
        <Link to="/" className="navbar__link">
          <MessageCircle />
          Contacto
        </Link>
      </div>
      <div className="navbar__user-area">
        {isAuthenticated ? (
          <UserDropdown isAdmin={isAdmin} username={username} />
        ) : (
          <div className="navbar__auth-actions">
            <Link
              to="/login"
              className="navbar__action navbar__action--secondary"
            >
              Login
            </Link>
            <Link to="/signup" className="navbar__action">
              Signup
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
