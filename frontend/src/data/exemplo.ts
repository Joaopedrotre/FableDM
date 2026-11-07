import type { Campanha, Mensagem, Personagem } from '../types';

// Dados de exemplo para montar a tela. Trocar pela API quando existir.
export const campanhaExemplo: Campanha = {
  id: 1,
  nome: 'A Masmorra de Eldrath',
  descricao: 'Você chegou à vila de Eldrath em busca do tesouro perdido.',
};

export const personagemExemplo: Personagem = {
  nome: 'Aldric',
  classe: 'Guerreiro',
  nivel: 3,
  vida: 18,
  vidaMax: 25,
  mana: 6,
  manaMax: 10,
  xp: 340,
  xpMax: 500,
};

export const mensagensExemplo: Mensagem[] = [
  { id: 1, autor: 'mestre', texto: 'A névoa cobre a estrada. À frente, você vê a entrada de uma antiga masmorra. O que você faz?' },
  { id: 2, autor: 'jogador', texto: 'Irei até a masmorra.' },
];
