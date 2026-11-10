import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LayoutAuth from '../components/LayoutAuth';
import Campo from '../components/Campo';
import Aviso from '../components/Aviso';
import { Usuario } from '../models/Usuario';
import { cadastrarUsuario, ErroApi } from '../services/api';
import {
  formatarCpf,
  validarNome,
  validarEmail,
  validarCpf,
  validarSenha,
  validarConfirmacao,
  requisitosSenha,
} from '../utils/validators';

type Nome = 'nome' | 'email' | 'cpf' | 'senha' | 'confirmacao';
type Valores = Record<Nome, string>;

const vazio: Valores = { nome: '', email: '', cpf: '', senha: '', confirmacao: '' };

// Regra de validação de cada campo
const regras: Record<Nome, (v: Valores) => string> = {
  nome: (v) => validarNome(v.nome),
  email: (v) => validarEmail(v.email),
  cpf: (v) => validarCpf(v.cpf),
  senha: (v) => validarSenha(v.senha),
  confirmacao: (v) => validarConfirmacao(v.senha, v.confirmacao),
};

export default function Cadastro() {
  const navigate = useNavigate();
  const [valores, setValores] = useState<Valores>(vazio);
  const [erros, setErros] = useState<Partial<Record<Nome, string>>>({});
  const [erroApi, setErroApi] = useState('');
  const [enviando, setEnviando] = useState(false);

  const validarCampo = (nome: Nome, v: Valores = valores) =>
    setErros((atual) => ({ ...atual, [nome]: regras[nome](v) }));

  function alterar(e: ChangeEvent<HTMLInputElement>) {
    const nome = e.target.name as Nome;
    const valor = nome === 'cpf' ? formatarCpf(e.target.value) : e.target.value;
    const novos = { ...valores, [nome]: valor };
    setValores(novos);
    if (erros[nome]) validarCampo(nome, novos);
    if (nome === 'senha' && valores.confirmacao) validarCampo('confirmacao', novos);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroApi('');

    const nomes = Object.keys(regras) as Nome[];
    const novosErros = Object.fromEntries(nomes.map((n) => [n, regras[n](valores)]));
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    setEnviando(true);
    try {
      const usuario = new Usuario(valores);
      await cadastrarUsuario(usuario.paraEnvio());
      navigate('/login', { state: { cadastrado: true } });
    } catch (err) {
      if (err instanceof ErroApi) setErros((atual) => ({ ...atual, ...err.campos }));
      if (err instanceof Error) setErroApi(err.message);
    } finally {
      setEnviando(false);
    }
  }

  // value, onChange e onBlur iguais para todos os campos
  const ligar = (nome: Nome) => ({
    value: valores[nome],
    erro: erros[nome],
    onChange: alterar,
    onBlur: () => validarCampo(nome),
  });

  return (
    <LayoutAuth>
      <form className="cartao" onSubmit={enviar} noValidate>
        <h2>Criar conta</h2>
        {erroApi && <Aviso tipo="erro">{erroApi}</Aviso>}

        <Campo id="nome" label="Nome completo" autoComplete="name" {...ligar('nome')} />
        <Campo id="email" label="E-mail" type="email" autoComplete="email" {...ligar('email')} />
        <Campo id="cpf" label="CPF" inputMode="numeric" placeholder="000.000.000-00" {...ligar('cpf')} />
        <Campo id="senha" label="Senha" type="password" autoComplete="new-password" {...ligar('senha')} />

        <ul className="requisitos" aria-label="Requisitos da senha">
          {requisitosSenha(valores.senha).map((r) => (
            <li key={r.texto} className={r.ok ? 'ok' : ''}>
              {r.ok ? '✔' : '○'} {r.texto}
            </li>
          ))}
        </ul>

        <Campo id="confirmacao" label="Repita a senha" type="password" autoComplete="new-password" {...ligar('confirmacao')} />

        <button type="submit" className="botao" disabled={enviando}>
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </button>

        <p className="rodape">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </LayoutAuth>
  );
}
