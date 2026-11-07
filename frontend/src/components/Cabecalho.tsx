import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Barra do topo: menu hambúrguer, nome do site e usuário logado.
export default function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

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
        <nav className="gaveta">
          <button type="button" onClick={aoSair}>
            Sair
          </button>
        </nav>
      )}
    </header>
  );
}
