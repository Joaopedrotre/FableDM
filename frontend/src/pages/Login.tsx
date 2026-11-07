import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LayoutAuth from '../components/LayoutAuth';
import Campo from '../components/Campo';
import Aviso from '../components/Aviso';
import { useAuth } from '../context/AuthContext';
import { entrar, ErroApi } from '../services/api';
import { validarEmail } from '../utils/validators';

export default function Login() {
  const navigate = useNavigate();
  const { entrar: guardarLogin } = useAuth();
  const state = useLocation().state as { cadastrado?: boolean } | null;

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro('');

    const erroEmail = validarEmail(email);
    if (erroEmail || !senha) {
      setErro(erroEmail || 'Informe sua senha.');
      return;
    }

    setEnviando(true);
    try {
      const resposta = await entrar({ email: email.trim().toLowerCase(), senha });
      guardarLogin(resposta.token, resposta.usuario);
      navigate('/jogo');
    } catch (err) {
      if (err instanceof ErroApi) setErro(err.message || Object.values(err.campos)[0] || 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutAuth>
      <form className="cartao" onSubmit={enviar} noValidate>
        <h2>Entrar</h2>
        {state?.cadastrado && <Aviso tipo="ok">Conta criada! Entre com seu e-mail e senha.</Aviso>}
        {erro && <Aviso tipo="erro">{erro}</Aviso>}

        <Campo id="email" label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Campo id="senha" label="Senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />

        <button type="submit" className="botao" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="rodape">
          Não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </LayoutAuth>
  );
}
