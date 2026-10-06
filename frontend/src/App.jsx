import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AgendaPage from "./pages/AgendaPage.jsx";
import PacientePage from "./pages/PacientePage.jsx";
import BuscarPacientePage from "./pages/BuscarPacientePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ConsultaPage from "./pages/ConsultaPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/agenda"
          element={
            <ProtectedRoute>
              <AgendaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buscar-paciente"
          element={
            <ProtectedRoute>
              <BuscarPacientePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paciente/:cpf"
          element={
            <ProtectedRoute>
              <PacientePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultas"
          element={
            <ProtectedRoute>
              <ConsultaPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
