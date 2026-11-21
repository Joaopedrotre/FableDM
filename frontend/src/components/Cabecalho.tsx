import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OPCOES_DO_MENU = [
  { rotulo: 'Campanhas', caminho: '/campanhas' },
  { rotulo: 'Personagens', caminho: '/personagens' },
  { rotulo: 'Meu perfil', caminho: '/perfil' },
];

export default function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  function irPara(caminho: string) {
    setAberto(false);
    navigate(caminho);
  }

  function aoSair() {
    sair();
    navigate('/login');
  }

  return (
    <header className="cabecalho">
      <button
        type="button"
        className="menu-btn"
        aria-label="Abrir menu"
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
      >
        <span />
        <span />
        <span />
      </button>

      <h1 className="marca">FableDM</h1>
      <span className="usuario-nome">{usuario?.nome}</span>

      {aberto && (
        <nav className="gaveta" aria-label="Menu principal">
          {OPCOES_DO_MENU.map((opcao) => (
            <button key={opcao.caminho} type="button" onClick={() => irPara(opcao.caminho)}>
              {opcao.rotulo}
            </button>
          ))}
          <button type="button" onClick={aoSair}>
            Sair
          </button>
        </nav>
      )}
    </header>
  );
}
