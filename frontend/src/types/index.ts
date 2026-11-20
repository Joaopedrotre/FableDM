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

export interface Campanha {
  id: number;
  nome: string;
  descricao: string;
}

export interface Personagem {
  nome: string;
  classe: string;
  nivel: number;
  vida: number;
  vidaMax: number;
  mana: number;
  manaMax: number;
  xp: number;
  xpMax: number;
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
