// Cada função devolve '' quando o valor é válido, ou a mensagem de erro.

export const somenteDigitos = (v: string): string => v.replace(/\D/g, '');

export function formatarCpf(v: string): string {
  return somenteDigitos(v)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function digitoVerificador(base: string, pesoInicial: number): number {
  const soma = [...base].reduce((total, n, i) => total + Number(n) * (pesoInicial - i), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function cpfEhValido(valor: string): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  return (
    digitoVerificador(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    digitoVerificador(cpf.slice(0, 10), 11) === Number(cpf[10])
  );
}

export const validarNome = (v: string): string =>
  v.trim().split(/\s+/).filter(Boolean).length >= 2 ? '' : 'Informe nome e sobrenome.';

export function validarEmail(v: string): string {
  if (!v.trim()) return 'Informe seu e-mail.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'E-mail inválido. Exemplo: nome@dominio.com';
}

export function validarCpf(v: string): string {
  if (!somenteDigitos(v)) return 'Informe seu CPF.';
  return cpfEhValido(v) ? '' : 'CPF inválido.';
}

export function requisitosSenha(v: string): { ok: boolean; texto: string }[] {
  return [
    { ok: v.length >= 8, texto: 'Mínimo de 8 caracteres' },
    { ok: /[A-Z]/.test(v), texto: 'Uma letra maiúscula' },
    { ok: /[a-z]/.test(v), texto: 'Uma letra minúscula' },
    { ok: /\d/.test(v), texto: 'Um número' },
    { ok: /[^A-Za-z0-9]/.test(v), texto: 'Um símbolo (ex: @ # !)' },
  ];
}

export function validarSenha(v: string): string {
  if (!v) return 'Crie uma senha.';
  return requisitosSenha(v).every((r) => r.ok) ? '' : 'A senha não atende a todos os requisitos.';
}

export function validarConfirmacao(senha: string, confirmacao: string): string {
  if (!confirmacao) return 'Repita a senha.';
  return senha === confirmacao ? '' : 'As senhas não coincidem.';
}
