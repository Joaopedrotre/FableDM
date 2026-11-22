// Tipos usados em todo o front end

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  cpf?: string; // o back deve devolver o CPF no login para preencher o perfil
}

export interface RespostaLogin {
  token: string;
  usuario: UsuarioLogado;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

// Edição do perfil: o e-mail não entra aqui porque não pode ser alterado.
// Sem senha = a senha atual é mantida.
export interface DadosEdicao {
  nome: string;
  cpf: string;
  senha?: string;
}

export interface RespostaEdicao {
  usuario: UsuarioLogado;
}

export interface Pagina<T> {
  dados: T[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface Personagem {
  id: number;
  nome: string;
  descricao: string;
  imagem: string | null;
}

export interface DadosPersonagem {
  nome: string;
  descricao: string;
  imagem: string | null;
}

export interface Item {
  id: number;
  personagemId: number;
  nome: string;
  descricao: string;
  quantidade: number;
}

export interface DadosItem {
  nome: string;
  descricao: string;
  quantidade: number;
}

export interface Campanha {
  id: number;
  nome: string;
  descricao: string;
  personagemId: number | null;
  personagemNome: string | null;
  criadoEm: string;
  atualizadaEm: string;
}

export interface DadosCampanha {
  nome: string;
  descricao: string;
  personagemId: number | null;
}

export interface Historia {
  id: number;
  campanhaId: number;
  campanhaNome: string;
  titulo: string;
  resumo: string;
  totalMensagens: number;
  criadoEm: string;
  atualizadaEm: string;
}

export interface DadosNovaHistoria {
  campanhaId: number;
  titulo: string;
  resumo: string;
}

export interface DadosEdicaoHistoria {
  titulo: string;
  resumo: string;
}

export interface RespostaExclusao {
  mensagem: string;
}

export interface RespostaMestre {
  resposta: string;
}

export interface Mensagem {
  id: number;
  autor: 'mestre' | 'jogador';
  texto: string;
  animar?: boolean;
}

export interface SessaoJogo {
  historia: Historia;
  campanha: Campanha;
  personagem: Personagem | null;
  itens: Item[];
  totalItens: number;
  mensagens: Mensagem[];
}

export interface RespostaMensagensAnteriores {
  mensagens: Mensagem[];
}

export interface RespostaAcao {
  mensagem: Mensagem;
  resposta: Mensagem;
}
