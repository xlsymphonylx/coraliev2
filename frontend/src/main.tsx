import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./config.css";
import "./index.css";
import "@fontsource-variable/mulish/wght.css";
import "@fontsource-variable/eb-garamond/wght.css";
import "@fontsource-variable/quicksand/wght.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
