import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Aviso from './Aviso';
import { BYPASS_LOGIN_TESTE } from '../config';
import { useAuth } from '../context/AuthContext';
import { entrarComoTeste, ErroApi } from '../services/api';

export default function BotaoBypassLoginTeste() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  if (!BYPASS_LOGIN_TESTE) return null;

  async function irParaOJogo() {
    setErro('');
    setEnviando(true);
    try {
      const resposta = await entrarComoTeste();
      entrar(resposta.token, resposta.usuario);
      navigate('/jogo');
    } catch (err) {
      setErro(err instanceof ErroApi && err.message ? err.message : 'Não foi possível entrar com a conta de teste.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      <button type="button" className="botao botao-teste" onClick={irParaOJogo} disabled={enviando}>
        {enviando ? 'Entrando…' : 'Ir direto para o jogo (teste)'}
      </button>
    </>
  );
}
