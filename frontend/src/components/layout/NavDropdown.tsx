import { useState, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

type DropdownItem = {
  label: string;
  to: string;
};

type NavDropdownProps = {
  icon: ReactNode;
  label: string;
  items: DropdownItem[];
  menuOpen: boolean;
  onNavigate: () => void;
};

function NavDropdown({ icon, label, items, menuOpen, onNavigate }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div
      className={`navbar__dropdown${open ? " navbar__dropdown--open" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="navbar__dropdown-trigger"
        onClick={menuOpen ? handleToggle : undefined}
        type="button"
      >
        {icon}
        {label}
        <ChevronDown className="navbar__dropdown-chevron" size={16} />
      </button>

      <div className="navbar__dropdown-menu">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="navbar__dropdown-item"
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default NavDropdown;
