import type { ReactNode } from "react";
import { checkAdminToken, checkToken, getSessionUsername } from "@/api/client";
import Footer from "./Footer";
import Navbar from "./Navbar";
import "@/components/layout/styles/Layout.scss";

type LayoutProps = {
  children: ReactNode;
};

function Layout({ children }: LayoutProps) {
  const isAuthenticated = checkToken();
  const isAdmin = checkAdminToken();
  const username = getSessionUsername();

  return (
    <div className="main-layout">
      <div className="main-layout__top">
        <Navbar
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          username={username}
        />
      </div>
      <div className="main-layout__content">{children}</div>
      <div className="main-layout__bottom">
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
