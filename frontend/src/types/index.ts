// Tipos usados em todo o front end

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
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

export interface Mensagem {
  id: number;
  autor: 'mestre' | 'jogador';
  texto: string;
}
