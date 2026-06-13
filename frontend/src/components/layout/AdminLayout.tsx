import { useState } from "react";
import type { ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { checkToken, getSessionUsername } from "@/api/client";
import AdminSidebar from "./AdminSidebar";
import "@/components/layout/styles/AdminLayout.scss";

type AdminLayoutProps = {
  children: ReactNode;
};

function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const username = getSessionUsername();
  const isAuthenticated = checkToken();

  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && <div className="admin-layout__overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-layout__main">
        <header className="admin-layout__topbar">
          <button className="admin-layout__toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="admin-layout__greeting">
            {isAuthenticated ? `Hola, ${username ?? "Admin"}` : "Admin"}
          </span>
        </header>
        <main className="admin-layout__content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
