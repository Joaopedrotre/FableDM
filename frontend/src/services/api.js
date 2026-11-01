import { API_URL, ROTAS_API } from '../config';

// Normaliza vários formatos de erro possíveis do back end em:
// { geral: 'texto', campos: { cpf: 'texto', email: 'texto' } }
function lerErros(corpo, status) {
  const resultado = { geral: '', campos: {} };

  if (Array.isArray(corpo?.erros)) {
    corpo.erros.forEach((e) => {
      if (e.campo) resultado.campos[e.campo] = e.mensagem;
      else resultado.geral = e.mensagem;
    });
  } else if (corpo?.errors && typeof corpo.errors === 'object') {
    if (Array.isArray(corpo.errors)) {
      corpo.errors.forEach((e) => {
        const campo = e.campo || e.field || e.path;
        const msg = e.mensagem || e.message || e.msg;
        if (campo) resultado.campos[campo] = msg;
        else resultado.geral = msg;
      });
    } else {
      Object.assign(resultado.campos, corpo.errors);
    }
  }

  if (!resultado.geral && !Object.keys(resultado.campos).length) {
    resultado.geral =
      corpo?.mensagem ||
      corpo?.message ||
      corpo?.erro ||
      corpo?.error ||
      (status === 409
        ? 'Já existe um cadastro com esses dados.'
        : 'Não foi possível concluir a operação. Tente novamente.');
  }
  return resultado;
}

async function enviar(rota, dados) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
  } catch {
    throw {
      geral: 'Não foi possível conectar ao servidor. Verifique se a API está no ar.',
      campos: {},
    };
  }

  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok) throw lerErros(corpo, resposta.status);
  return corpo;
}

export const cadastrarUsuario = (dados) => enviar(ROTAS_API.cadastro, dados);
export const entrar = (dados) => enviar(ROTAS_API.login, dados);
