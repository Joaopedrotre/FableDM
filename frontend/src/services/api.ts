import { API_URL, ROTAS_API } from '../config';
import type {
  Campanha,
  DadosCadastro,
  DadosCampanha,
  DadosEdicaoHistoria,
  DadosNovaHistoria,
  DadosEdicao,
  DadosItem,
  DadosPersonagem,
  Historia,
  Item,
  Mensagem,
  Pagina,
  Personagem,
  RespostaAcao,
  RespostaEdicao,
  RespostaExclusao,
  RespostaLogin,
  RespostaMensagensAnteriores,
  RespostaMestre,
  SessaoJogo,
} from '../types';

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

// Se houver token salvo, ele vai no cabeçalho Authorization (rotas autenticadas).
function cabecalhos(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

const ROTAS_SEM_SESSAO: string[] = [ROTAS_API.login, ROTAS_API.loginTeste];

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function enviar<T>(rota: string, dados?: unknown, metodo: Metodo = 'POST'): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      method: metodo,
      headers: cabecalhos(),
      body: dados === undefined ? undefined : JSON.stringify(dados),
    });
  } catch {
    throw new ErroApi('Não foi possível conectar ao servidor. Verifique se a API está no ar.');
  }

  const corpo: unknown = await resposta.json().catch(() => null);

  if (resposta.status === 401 && localStorage.getItem('token') && !ROTAS_SEM_SESSAO.includes(rota)) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.assign('/login');
  }

  if (!resposta.ok) throw lerErro(corpo as CorpoErro | null);
  return corpo as T;
}

export const cadastrarUsuario = (dados: DadosCadastro) => enviar<unknown>(ROTAS_API.cadastro, dados);

export const entrar = (dados: { email: string; senha: string }) =>
  enviar<RespostaLogin>(ROTAS_API.login, dados);

export const entrarComoTeste = () => enviar<RespostaLogin>(ROTAS_API.loginTeste, {});

export const editarPerfil = (dados: DadosEdicao) =>
  enviar<RespostaEdicao>(ROTAS_API.perfil, dados, 'PUT');

export const perguntarAoMestre = (mensagens: Mensagem[]) =>
  enviar<RespostaMestre>(
    ROTAS_API.mestre,
    { mensagens: mensagens.map(({ autor, texto }) => ({ autor, texto })) }
  );

const consulta = (pagina: number, limite: number) => `?pagina=${pagina}&limite=${limite}`;

export const listarPersonagens = (pagina: number, limite = 6) =>
  enviar<Pagina<Personagem>>(`${ROTAS_API.personagens}${consulta(pagina, limite)}`, undefined, 'GET');

export const buscarPersonagem = (id: number) =>
  enviar<Personagem>(`${ROTAS_API.personagens}/${id}`, undefined, 'GET');

export const criarPersonagem = (dados: DadosPersonagem) => enviar<Personagem>(ROTAS_API.personagens, dados);

export const editarPersonagem = (id: number, dados: DadosPersonagem) =>
  enviar<Personagem>(`${ROTAS_API.personagens}/${id}`, dados, 'PUT');

export const excluirPersonagem = (id: number) =>
  enviar<RespostaExclusao>(`${ROTAS_API.personagens}/${id}`, undefined, 'DELETE');

export const listarItens = (personagemId: number, pagina: number, limite = 8) =>
  enviar<Pagina<Item>>(`${ROTAS_API.personagens}/${personagemId}/itens${consulta(pagina, limite)}`, undefined, 'GET');

export const buscarItem = (personagemId: number, itemId: number) =>
  enviar<Item>(`${ROTAS_API.personagens}/${personagemId}/itens/${itemId}`, undefined, 'GET');

export const criarItem = (personagemId: number, dados: DadosItem) =>
  enviar<Item>(`${ROTAS_API.personagens}/${personagemId}/itens`, dados);

export const editarItem = (personagemId: number, itemId: number, dados: DadosItem) =>
  enviar<Item>(`${ROTAS_API.personagens}/${personagemId}/itens/${itemId}`, dados, 'PUT');

export const excluirItem = (personagemId: number, itemId: number) =>
  enviar<RespostaExclusao>(`${ROTAS_API.personagens}/${personagemId}/itens/${itemId}`, undefined, 'DELETE');

export const listarCampanhas = (pagina: number, limite = 6) =>
  enviar<Pagina<Campanha>>(`${ROTAS_API.campanhas}${consulta(pagina, limite)}`, undefined, 'GET');

export const buscarCampanha = (id: number) =>
  enviar<Campanha>(`${ROTAS_API.campanhas}/${id}`, undefined, 'GET');

export const criarCampanha = (dados: DadosCampanha) => enviar<Campanha>(ROTAS_API.campanhas, dados);

export const editarCampanha = (id: number, dados: DadosCampanha) =>
  enviar<Campanha>(`${ROTAS_API.campanhas}/${id}`, dados, 'PUT');

export const excluirCampanha = (id: number) =>
  enviar<RespostaExclusao>(`${ROTAS_API.campanhas}/${id}`, undefined, 'DELETE');

export const listarHistorias = (pagina: number, limite = 6, campanhaId?: number) =>
  enviar<Pagina<Historia>>(
    `${ROTAS_API.historias}${consulta(pagina, limite)}${campanhaId === undefined ? '' : `&campanhaId=${campanhaId}`}`,
    undefined,
    'GET'
  );

export const buscarHistoria = (id: number) =>
  enviar<Historia>(`${ROTAS_API.historias}/${id}`, undefined, 'GET');

export const criarHistoria = (dados: DadosNovaHistoria) => enviar<Historia>(ROTAS_API.historias, dados);

export const editarHistoria = (id: number, dados: DadosEdicaoHistoria) =>
  enviar<Historia>(`${ROTAS_API.historias}/${id}`, dados, 'PUT');

export const excluirHistoria = (id: number) =>
  enviar<RespostaExclusao>(`${ROTAS_API.historias}/${id}`, undefined, 'DELETE');

export const obterSessao = (historiaId: number) =>
  enviar<SessaoJogo>(`${ROTAS_API.historias}/${historiaId}/sessao`, undefined, 'GET');

export const carregarMensagensAnteriores = (historiaId: number, antesDe: number) =>
  enviar<RespostaMensagensAnteriores>(
    `${ROTAS_API.historias}/${historiaId}/mensagens?antesDe=${antesDe}&limite=50`,
    undefined,
    'GET'
  );

export const enviarAcao = (historiaId: number, texto: string) =>
  enviar<RespostaAcao>(`${ROTAS_API.historias}/${historiaId}/mensagens`, { texto });
