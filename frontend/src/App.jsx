import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AgendaPage from './pages/AgendaPage.jsx'
import PacientePage from './pages/PacientePage.jsx'
import BuscarPacientePage from './pages/BuscarPacientePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ConsultaPage from './pages/ConsultaPage.jsx'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path='/agenda' element={<AgendaPage />} />
        <Route path="/buscar-paciente" element={<BuscarPacientePage />} />
        <Route path="/paciente/:id" element={<PacientePage />} />
        <Route path="/consultas" element={<ConsultaPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App