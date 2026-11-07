import { Routes, Route, Navigate } from 'react-router-dom';
import RotaPrivada from './components/RotaPrivada';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Jogo from './pages/Jogo';

// Rotas do site. /jogo só abre para quem está logado.
export default function App() {
  return (
    <Routes>
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RotaPrivada />}>
        <Route path="/jogo" element={<Jogo />} />
      </Route>
      <Route path="*" element={<Navigate to="/jogo" replace />} />
    </Routes>
  );
}
