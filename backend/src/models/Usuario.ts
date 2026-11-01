export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  criado_em: Date;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  cpf: string;
  senha_hash: string;
}
