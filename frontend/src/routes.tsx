import type { ReactElement } from "react";
import type { MiddlewareKey } from "./components/middlewares/ApplyMiddleware";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDiscountSets from "./pages/admin/AdminDiscountSets";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminTags from "./pages/admin/AdminTags";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminWarehouses from "./pages/admin/AdminWarehouses";
import Login from "./pages/auth/Login";
import ProductPage from "./pages/productPage/ProductPage";
import Signup from "./pages/auth/Signup";
import HomePage from "./pages/homepage/HomePage";
import Error from "./pages/error/Error";

type AppRoute = {
  path: string;
  element: ReactElement;
  middleware?: MiddlewareKey[];
};

export const routes: AppRoute[] = [
  { path: "/", element: <HomePage />, middleware: [] },
  { path: "/productos/", element: <ProductPage />, middleware: [] },
  { path: "/login", element: <Login />, middleware: ["skipLanding"] },
  { path: "/signup", element: <Signup />, middleware: ["skipLanding"] },
  { path: "/admin", element: <AdminDashboard />, middleware: ["admin"] },
  { path: "/admin/productos", element: <AdminProducts />, middleware: ["admin"] },
  { path: "/admin/categorias", element: <AdminCategories />, middleware: ["admin"] },
  { path: "/admin/etiquetas", element: <AdminTags />, middleware: ["admin"] },
  { path: "/admin/pedidos", element: <AdminOrders />, middleware: ["admin"] },
  { path: "/admin/usuarios", element: <AdminUsers />, middleware: ["admin"] },
  { path: "/admin/inventario", element: <AdminInventory />, middleware: ["admin"] },
  { path: "/admin/almacenes", element: <AdminWarehouses />, middleware: ["admin"] },
  { path: "/admin/descuentos", element: <AdminDiscounts />, middleware: ["admin"] },
  { path: "/admin/conjuntos-descuentos", element: <AdminDiscountSets />, middleware: ["admin"] },
  { path: "/404", element: <Error />, middleware: [] },
];
