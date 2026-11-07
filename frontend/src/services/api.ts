import { API_URL, ROTAS_API } from '../config';
import type { DadosCadastro, RespostaLogin } from '../types';

// Erro lançado quando a API (ou a conexão) falha.
// "campos" guarda erros por campo, ex: { cpf: 'CPF inválido.' }
export class ErroApi extends Error {
  readonly campos: Record<string, string>;

  constructor(mensagem: string, campos: Record<string, string> = {}) {
    super(mensagem);
    this.name = 'ErroApi';
    this.campos = campos;
  }
}

// Formato de erro do back end: { mensagem } ou { erros: [{ campo, mensagem }] }
interface CorpoErro {
  mensagem?: string;
  erros?: { campo: string; mensagem: string }[];
}

function lerErro(corpo: CorpoErro | null): ErroApi {
  const campos: Record<string, string> = {};
  corpo?.erros?.forEach((e) => {
    if (e.campo) campos[e.campo] = e.mensagem;
  });
  const temCampos = Object.keys(campos).length > 0;
  const geral = corpo?.mensagem ?? (temCampos ? '' : 'Não foi possível concluir a operação. Tente novamente.');
  return new ErroApi(geral, campos);
}

async function enviar<T>(rota: string, dados: unknown): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
  } catch {
    throw new ErroApi('Não foi possível conectar ao servidor. Verifique se a API está no ar.');
  }

  const corpo: unknown = await resposta.json().catch(() => null);
  if (!resposta.ok) throw lerErro(corpo as CorpoErro | null);
  return corpo as T;
}

export const cadastrarUsuario = (dados: DadosCadastro) => enviar<unknown>(ROTAS_API.cadastro, dados);

export const entrar = (dados: { email: string; senha: string }) =>
  enviar<RespostaLogin>(ROTAS_API.login, dados);
