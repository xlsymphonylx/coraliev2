import type { ReactNode } from "react";
import { checkToken, getSessionUsername } from "@/api/client";
import AdminSidebar from "./AdminSidebar";
import "@/components/layout/styles/AdminLayout.scss";

type AdminLayoutProps = {
  children: ReactNode;
};

function AdminLayout({ children }: AdminLayoutProps) {
  const username = getSessionUsername();
  const isAuthenticated = checkToken();

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-layout__main">
        <header className="admin-layout__topbar">
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
