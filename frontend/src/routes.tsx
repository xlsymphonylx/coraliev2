import type { ReactElement } from "react";
import type { MiddlewareKey } from "./components/middlewares/ApplyMiddleware";
import AdminDashboard from "./pages/admin/AdminDashboard";
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
  { path: "/404", element: <Error />, middleware: [] },
];
