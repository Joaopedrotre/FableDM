// Único lugar para ajustar a URL e as rotas da API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ROTAS_API = {
  cadastro: '/usuarios',
  login: '/login',
};
