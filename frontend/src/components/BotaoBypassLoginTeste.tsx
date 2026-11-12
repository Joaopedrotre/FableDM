import { useNavigate } from 'react-router-dom';
import { BYPASS_LOGIN_TESTE } from '../config';
import { useAuth } from '../context/AuthContext';
import type { UsuarioLogado } from '../types';

const TOKEN_BYPASS_LOGIN_TESTE = 'token-bypass-login-teste';
const USUARIO_BYPASS_LOGIN_TESTE: UsuarioLogado = { id: 0, nome: 'Jogador de Teste', email: 'teste@fabledm.local' };

export default function BotaoBypassLoginTeste() {
  const navigate = useNavigate();
  const { entrar } = useAuth();

  if (!BYPASS_LOGIN_TESTE) return null;

  function irParaOJogo() {
    entrar(TOKEN_BYPASS_LOGIN_TESTE, USUARIO_BYPASS_LOGIN_TESTE);
    navigate('/jogo');
  }

  return (
    <button type="button" className="botao botao-teste" onClick={irParaOJogo}>
      Ir direto para o jogo (teste)
    </button>
  );
}
