// Cada função devolve '' quando o valor é válido, ou a mensagem de erro.

export const somenteDigitos = (v) => String(v || '').replace(/\D/g, '');

export function formatarCpf(v) {
  const d = somenteDigitos(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function digitoVerificador(digitos, pesoInicial) {
  const soma = digitos
    .split('')
    .reduce((acc, n, i) => acc + Number(n) * (pesoInicial - i), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function cpfEhValido(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const d1 = digitoVerificador(cpf.slice(0, 9), 10);
  const d2 = digitoVerificador(cpf.slice(0, 10), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

export const validarNome = (v) =>
  String(v || '').trim().split(/\s+/).filter(Boolean).length >= 2
    ? ''
    : 'Informe nome e sobrenome.';

export const validarEmail = (v) => {
  if (!String(v || '').trim()) return 'Informe seu e-mail.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
    ? ''
    : 'E-mail inválido. Exemplo: nome@dominio.com';
};

export const validarCpf = (v) => {
  if (!somenteDigitos(v)) return 'Informe seu CPF.';
  return cpfEhValido(v) ? '' : 'CPF inválido.';
};

export function requisitosSenha(v) {
  const s = String(v || '');
  return [
    { ok: s.length >= 8, texto: 'Mínimo de 8 caracteres' },
    { ok: /[A-Z]/.test(s), texto: 'Uma letra maiúscula' },
    { ok: /[a-z]/.test(s), texto: 'Uma letra minúscula' },
    { ok: /\d/.test(s), texto: 'Um número' },
    { ok: /[^A-Za-z0-9]/.test(s), texto: 'Um símbolo (ex: @ # !)' },
  ];
}

export const validarSenha = (v) => {
  if (!v) return 'Crie uma senha.';
  return requisitosSenha(v).every((r) => r.ok)
    ? ''
    : 'A senha não atende a todos os requisitos.';
};

export const validarConfirmacao = (senha, confirmacao) => {
  if (!confirmacao) return 'Repita a senha.';
  return senha === confirmacao ? '' : 'As senhas não coincidem.';
};
