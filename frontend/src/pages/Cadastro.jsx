import DadosMesa from '../components/DadosMesa';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Usuario } from '../models/Usuario';
import { cadastrarUsuario } from '../services/api';
import {
  formatarCpf,
  validarNome,
  validarEmail,
  validarCpf,
  validarSenha,
  validarConfirmacao,
  requisitosSenha,
} from '../utils/validators';

const vazio = { nome: '', email: '', cpf: '', senha: '', confirmacao: '' };

const regras = {
  nome: (v) => validarNome(v.nome),
  email: (v) => validarEmail(v.email),
  cpf: (v) => validarCpf(v.cpf),
  senha: (v) => validarSenha(v.senha),
  confirmacao: (v) => validarConfirmacao(v.senha, v.confirmacao),
};

function Campo({ id, label, erro, children }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      {children}
      {erro && (
        <p className="erro" id={`${id}-erro`} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

export default function Cadastro() {
  const navigate = useNavigate();
  const [valores, setValores] = useState(vazio);
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState('');
  const [enviando, setEnviando] = useState(false);

  const validarCampo = (nome, v = valores) =>
    setErros((e) => ({ ...e, [nome]: regras[nome](v) }));

  function alterar(e) {
    const { name, value } = e.target;
    const novo = { ...valores, [name]: name === 'cpf' ? formatarCpf(value) : value };
    setValores(novo);
    if (erros[name]) validarCampo(name, novo);
    if (name === 'senha' && valores.confirmacao) validarCampo('confirmacao', novo);
  }

  async function enviar(e) {
    e.preventDefault();
    setErroApi('');

    const novosErros = Object.fromEntries(
      Object.keys(regras).map((c) => [c, regras[c](valores)])
    );
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    setEnviando(true);
    try {
      const usuario = new Usuario(valores);
      await cadastrarUsuario(usuario.paraEnvio());
      navigate('/login', { state: { cadastrado: true } });
    } catch (err) {
      // erros da API: por campo (ex: cpf, email) e/ou mensagem geral
      setErros((atual) => ({ ...atual, ...(err.campos || {}) }));
      setErroApi(err.geral || (err.campos ? '' : err.message));
    } finally {
      setEnviando(false);
    }
  }

  const prop = (nome) => ({
    id: nome,
    name: nome,
    value: valores[nome],
    onChange: alterar,
    onBlur: () => validarCampo(nome),
    'aria-invalid': Boolean(erros[nome]),
    'aria-describedby': erros[nome] ? `${nome}-erro` : undefined,
  });

  return (
    <main className="pagina">
      <aside className="lateral">
        <h1>FableDM</h1>
        <p>Sua mesa de RPG, com um mestre que nunca falta à sessão.</p>
        <DadosMesa />
      </aside>

      <form className="cartao" onSubmit={enviar} noValidate>
        <h2>Criar conta</h2>

        {erroApi && (
          <p className="aviso aviso-erro" role="alert">
            {erroApi}
          </p>
        )}

        <Campo id="nome" label="Nome completo" erro={erros.nome}>
          <input {...prop('nome')} autoComplete="name" />
        </Campo>

        <Campo id="email" label="E-mail" erro={erros.email}>
          <input {...prop('email')} type="email" autoComplete="email" />
        </Campo>

        <Campo id="cpf" label="CPF" erro={erros.cpf}>
          <input {...prop('cpf')} inputMode="numeric" placeholder="000.000.000-00" />
        </Campo>

        <Campo id="senha" label="Senha" erro={erros.senha}>
          <input {...prop('senha')} type="password" autoComplete="new-password" />
        </Campo>

        <ul className="requisitos" aria-label="Requisitos da senha">
          {requisitosSenha(valores.senha).map((r) => (
            <li key={r.texto} className={r.ok ? 'ok' : ''}>
              {r.ok ? '✔' : '○'} {r.texto}
            </li>
          ))}
        </ul>

        <Campo id="confirmacao" label="Repita a senha" erro={erros.confirmacao}>
          <input {...prop('confirmacao')} type="password" autoComplete="new-password" />
        </Campo>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </button>

        <p className="rodape">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </main>
  );
}
