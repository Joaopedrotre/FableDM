import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import LayoutAuth from '../components/LayoutAuth';
import Campo from '../components/Campo';
import Aviso from '../components/Aviso';
import { useAuth } from '../context/AuthContext';
import { editarPerfil, ErroApi } from '../services/api';
import {
  formatarCpf,
  validarNome,
  validarCpf,
  validarSenha,
  validarConfirmacao,
  requisitosSenha,
} from '../utils/validators';

type Nome = 'nome' | 'cpf' | 'senha' | 'confirmacao';
type Valores = Record<Nome, string>;

// A senha é opcional na edição: só é validada e enviada se o usuário digitar uma nova.
const regras: Record<Nome, (v: Valores) => string> = {
  nome: (v) => validarNome(v.nome),
  cpf: (v) => validarCpf(v.cpf),
  senha: (v) => (v.senha ? validarSenha(v.senha) : ''),
  confirmacao: (v) => (v.senha ? validarConfirmacao(v.senha, v.confirmacao) : ''),
};

// Tela "Meu perfil": o usuário edita nome, CPF e senha. O e-mail aparece bloqueado.
export default function Perfil() {
  const { usuario, atualizar } = useAuth();

  const [valores, setValores] = useState<Valores>({
    nome: usuario?.nome ?? '',
    cpf: formatarCpf(usuario?.cpf ?? ''),
    senha: '',
    confirmacao: '',
  });
  const [erros, setErros] = useState<Partial<Record<Nome, string>>>({});
  const [erroApi, setErroApi] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const validarCampo = (nome: Nome, v: Valores = valores) =>
    setErros((atual) => ({ ...atual, [nome]: regras[nome](v) }));

  function alterar(e: ChangeEvent<HTMLInputElement>) {
    const nome = e.target.name as Nome;
    const valor = nome === 'cpf' ? formatarCpf(e.target.value) : e.target.value;
    const novos = { ...valores, [nome]: valor };
    setValores(novos);
    setSucesso(false);
    if (erros[nome]) validarCampo(nome, novos);
    if (nome === 'senha' && (valores.confirmacao || erros.confirmacao)) validarCampo('confirmacao', novos);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroApi('');
    setSucesso(false);

    const nomes = Object.keys(regras) as Nome[];
    const novosErros = Object.fromEntries(nomes.map((n) => [n, regras[n](valores)]));
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    setEnviando(true);
    try {
      const { usuario: atualizado } = await editarPerfil({
        nome: valores.nome.trim().replace(/\s+/g, ' '),
        cpf: valores.cpf.replace(/\D/g, ''),
        ...(valores.senha ? { senha: valores.senha } : {}),
      });
      atualizar(atualizado); // atualiza o contexto: o nome no cabeçalho muda na hora
      setValores((v) => ({ ...v, senha: '', confirmacao: '' }));
      setSucesso(true);
    } catch (err) {
      if (err instanceof ErroApi) {
        setErros((atual) => ({ ...atual, ...err.campos }));
        setErroApi(err.message);
      } else {
        setErroApi('Não foi possível salvar. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  const ligar = (nome: Nome) => ({
    value: valores[nome],
    erro: erros[nome],
    onChange: alterar,
    onBlur: () => validarCampo(nome),
  });

  return (
    <LayoutAuth centralizado>
      <form className="cartao cartao-centro" onSubmit={enviar} noValidate>
        <h2>Meu perfil</h2>
        {sucesso && <Aviso tipo="ok">Perfil atualizado com sucesso!</Aviso>}
        {erroApi && <Aviso tipo="erro">{erroApi}</Aviso>}

        <Campo id="nome" label="Nome completo" autoComplete="name" {...ligar('nome')} />

        <div>
          <Campo id="email" label="E-mail" type="email" value={usuario?.email ?? ''} disabled readOnly />
          <p className="dica">O e-mail não pode ser alterado.</p>
        </div>

        <Campo id="cpf" label="CPF" inputMode="numeric" placeholder="000.000.000-00" {...ligar('cpf')} />

        <p className="dica">Para trocar a senha, preencha os campos abaixo. Deixe em branco para manter a atual.</p>
        <Campo id="senha" label="Nova senha" type="password" autoComplete="new-password" {...ligar('senha')} />

        <ul className="requisitos" aria-label="Requisitos da senha">
          {requisitosSenha(valores.senha).map((r) => (
            <li key={r.texto} className={r.ok ? 'ok' : ''}>
              {r.ok ? '✔' : '○'} {r.texto}
            </li>
          ))}
        </ul>

        <Campo id="confirmacao" label="Repita a nova senha" type="password" autoComplete="new-password" {...ligar('confirmacao')} />

        <div className="perfil-acoes">
          <button type="submit" className="botao" disabled={enviando}>
            {enviando ? 'Salvando…' : 'Salvar alterações'}
          </button>
          <Link to="/jogo" className="botao botao-secundario">
            Voltar ao jogo
          </Link>
        </div>
      </form>
    </LayoutAuth>
  );
}
