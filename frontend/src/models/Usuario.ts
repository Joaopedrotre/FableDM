import type { DadosCadastro } from '../types';
import { somenteDigitos, validarNome, validarEmail, validarCpf, validarSenha } from '../utils/validators';

// Campos privados (#) protegem o estado interno.
// Getters/setters existem só onde há validação ou transformação.
// A senha não tem getter: só sai pelo paraEnvio().
export class Usuario {
  #nome = '';
  #email = '';
  #cpf = '';
  #senha = '';

  constructor(dados: DadosCadastro) {
    this.nome = dados.nome;
    this.email = dados.email;
    this.cpf = dados.cpf;
    this.senha = dados.senha;
  }

  get nome(): string {
    return this.#nome;
  }
  set nome(valor: string) {
    const erro = validarNome(valor);
    if (erro) throw new Error(erro);
    this.#nome = valor.trim().replace(/\s+/g, ' ');
  }

  get email(): string {
    return this.#email;
  }
  set email(valor: string) {
    const erro = validarEmail(valor);
    if (erro) throw new Error(erro);
    this.#email = valor.trim().toLowerCase();
  }

  get cpf(): string {
    return this.#cpf; // sempre só dígitos
  }
  set cpf(valor: string) {
    const erro = validarCpf(valor);
    if (erro) throw new Error(erro);
    this.#cpf = somenteDigitos(valor);
  }

  set senha(valor: string) {
    const erro = validarSenha(valor);
    if (erro) throw new Error(erro);
    this.#senha = valor;
  }

  paraEnvio(): DadosCadastro {
    return { nome: this.#nome, email: this.#email, cpf: this.#cpf, senha: this.#senha };
  }
}
