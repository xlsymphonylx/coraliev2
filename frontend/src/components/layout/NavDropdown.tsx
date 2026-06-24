import { useState, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export type DropdownItem = {
  label: string;
  to: string;
  children?: DropdownItem[];
};

type NavDropdownProps = {
  icon?: ReactNode;
  label: string;
  items: DropdownItem[];
  menuOpen: boolean;
  onNavigate: () => void;
  className?: string;
};

function NavDropdown({ icon, label, items, menuOpen, onNavigate, className }: NavDropdownProps) {
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
      className={`navbar__dropdown${open ? " navbar__dropdown--open" : ""}${className ? ` ${className}` : ""}`}
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
          <div key={item.to} className="navbar__dropdown-group">
            <Link
              to={item.to}
              className="navbar__dropdown-item"
              onClick={onNavigate}
            >
              {item.label}
            </Link>
            {item.children && item.children.length > 0 && (
              <div className="navbar__dropdown-submenu">
                {item.children.map((child) => (
                  <Link
                    key={child.to}
                    to={child.to}
                    className="navbar__dropdown-item navbar__dropdown-item--sub"
                    onClick={onNavigate}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NavDropdown;
