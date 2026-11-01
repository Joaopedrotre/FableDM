import DadosMesa from '../components/DadosMesa';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { entrar } from '../services/api';
import { validarEmail } from '../utils/validators';

export default function Login() {
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [logado, setLogado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    const erroEmail = validarEmail(email);
    if (erroEmail || !senha) return setErro(erroEmail || 'Informe sua senha.');

    setEnviando(true);
    try {
      await entrar({ email: email.trim().toLowerCase(), senha });
      setLogado(true);
    } catch (err) {
      setErro(err.geral || 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina">
      <aside className="lateral">
        <h1>FableDM</h1>
        <p>Sua mesa de RPG, com um mestre que nunca falta à sessão.</p>
        <DadosMesa />
      </aside>

      <form className="cartao" onSubmit={enviar} noValidate>
        <h2>Entrar</h2>

        {state?.cadastrado && (
          <p className="aviso aviso-ok" role="status">
            Conta criada! Entre com seu e-mail e senha.
          </p>
        )}
        {logado && (
          <p className="aviso aviso-ok" role="status">
            Login realizado.
          </p>
        )}
        {erro && (
          <p className="aviso aviso-erro" role="alert">
            {erro}
          </p>
        )}

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
        </div>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="rodape">
          Não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </main>
  );
}
