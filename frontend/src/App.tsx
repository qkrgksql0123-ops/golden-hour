import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import NightCarePage from "./pages/NightCarePage";
import RoutePage from "./pages/RoutePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/emergency" element={<HomePage />} />
      <Route path="/night-care" element={<NightCarePage />} />
      <Route path="/route/:id" element={<RoutePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
