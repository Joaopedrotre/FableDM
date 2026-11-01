import {
  somenteDigitos,
  validarNome,
  validarEmail,
  validarCpf,
  validarSenha,
} from '../utils/validators';

// Estado interno protegido com campos privados (#).
// Getters/setters existem só onde há validação ou transformação.
// A senha NÃO tem getter: ela só sai pelo payload de envio.
export class Usuario {
  #nome;
  #email;
  #cpf;
  #senha;

  constructor({ nome, email, cpf, senha }) {
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.senha = senha;
  }

  get nome() {
    return this.#nome;
  }
  set nome(valor) {
    const erro = validarNome(valor);
    if (erro) throw new Error(erro);
    this.#nome = valor.trim().replace(/\s+/g, ' ');
  }

  get email() {
    return this.#email;
  }
  set email(valor) {
    const erro = validarEmail(valor);
    if (erro) throw new Error(erro);
    this.#email = valor.trim().toLowerCase();
  }

  get cpf() {
    return this.#cpf; // sempre só dígitos
  }
  set cpf(valor) {
    const erro = validarCpf(valor);
    if (erro) throw new Error(erro);
    this.#cpf = somenteDigitos(valor);
  }

  set senha(valor) {
    const erro = validarSenha(valor);
    if (erro) throw new Error(erro);
    this.#senha = valor;
  }

  paraEnvio() {
    return {
      nome: this.#nome,
      email: this.#email,
      cpf: this.#cpf,
      senha: this.#senha,
    };
  }
}
