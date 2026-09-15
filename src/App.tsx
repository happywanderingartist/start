import { Navigate, Route, Routes } from "react-router-dom";
import { Toast } from "./components/AppChrome";
import { HomePage } from "./pages/HomePage";
import { LiveRoutePage } from "./pages/LiveRoutePage";
import { NavigationSimulationPage } from "./pages/NavigationSimulationPage";
import { RouteDetailPage } from "./pages/RouteDetailPage";

export function AppRoutes() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/routes/anpu-nanjing" element={<RouteDetailPage />} />
        <Route path="/routes/anpu-nanjing/live" element={<LiveRoutePage />} />
        <Route path="/routes/anpu-nanjing/live/navigation" element={<NavigationSimulationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </div>
  );
}
