// Único lugar para ajustar a URL e as rotas da API
export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const BYPASS_LOGIN_TESTE: boolean = import.meta.env.VITE_TESTE_LOGIN === 'true';

export const CARACTERES_POR_SEGUNDO = 60;

export const DURACAO_ROLAGEM_MS = 1400;
export const DURACAO_RESULTADO_MS = 1000;
export const MAXIMO_DADOS_POR_ROLAGEM = 10;

export const LIMITE_CARACTERES_ACAO = 5000;

export const ROTAS_API = {
  cadastro: '/usuarios',
  login: '/login',
  loginTeste: '/login/teste',
  perfil: '/usuarios/me', // PUT autenticado: o back identifica o usuário pelo token
  mestre: '/mestre/mensagem',
  personagens: '/personagens',
  campanhas: '/campanhas',
};
