// Único lugar para ajustar a URL e as rotas da API
export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const BYPASS_LOGIN_TESTE = true;

export const CARACTERES_POR_SEGUNDO = 60;

export const LIMITE_CARACTERES_ACAO = 5000;

export const ROTAS_API = {
  cadastro: '/usuarios',
  login: '/login', // ainda não existe no back end
  mestre: '/mestre/mensagem',
};
