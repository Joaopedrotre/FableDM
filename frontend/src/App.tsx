import { Routes, Route, Navigate } from 'react-router-dom';
import RotaPrivada from './components/RotaPrivada';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Jogo from './pages/Jogo';
import JogoInicio from './pages/JogoInicio';
import Perfil from './pages/Perfil';
import Campanhas from './pages/campanhas/Campanhas';
import ContinuarCampanha from './pages/campanhas/ContinuarCampanha';
import Historias from './pages/historias/Historias';
import HistoriaFormulario from './pages/historias/HistoriaFormulario';
import CampanhaFormulario from './pages/campanhas/CampanhaFormulario';
import Personagens from './pages/personagens/Personagens';
import PersonagemFormulario from './pages/personagens/PersonagemFormulario';
import Itens from './pages/personagens/Itens';
import ItemFormulario from './pages/personagens/ItemFormulario';

export default function App() {
  return (
    <Routes>
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RotaPrivada />}>
        <Route path="/jogo" element={<JogoInicio />} />
        <Route path="/jogo/:id" element={<Jogo />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/campanhas" element={<Campanhas />} />
        <Route path="/campanhas/nova" element={<CampanhaFormulario />} />
        <Route path="/campanhas/:id/editar" element={<CampanhaFormulario />} />
        <Route path="/campanhas/:id/continuar" element={<ContinuarCampanha />} />
        <Route path="/historias" element={<Historias />} />
        <Route path="/historias/nova" element={<HistoriaFormulario />} />
        <Route path="/historias/:id/editar" element={<HistoriaFormulario />} />
        <Route path="/personagens" element={<Personagens />} />
        <Route path="/personagens/novo" element={<PersonagemFormulario />} />
        <Route path="/personagens/:id/editar" element={<PersonagemFormulario />} />
        <Route path="/personagens/:id/itens" element={<Itens />} />
        <Route path="/personagens/:id/itens/novo" element={<ItemFormulario />} />
        <Route path="/personagens/:id/itens/:itemId/editar" element={<ItemFormulario />} />
      </Route>
      <Route path="*" element={<Navigate to="/jogo" replace />} />
    </Routes>
  );
}
