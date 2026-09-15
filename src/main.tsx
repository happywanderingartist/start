import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./App";
import { RouteSessionProvider } from "./state/RouteSessionContext";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RouteSessionProvider>
        <AppRoutes />
      </RouteSessionProvider>
    </BrowserRouter>
  </StrictMode>,
);
