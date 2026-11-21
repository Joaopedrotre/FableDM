export const EMAIL_CONTA_TESTE = 'teste@fabledm.local';

export interface ContaDemonstracao {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export const CONTAS_DEMONSTRACAO: ContaDemonstracao[] = [
  { nome: 'Jogador de Teste', email: EMAIL_CONTA_TESTE, cpf: '11144477735', senha: 'Teste@12345' },
  { nome: 'Maria da Silva', email: 'maria@example.com', cpf: '52998224725', senha: 'Maria@12345' },
  { nome: 'Bruno Almeida', email: 'bruno@example.com', cpf: '39053344705', senha: 'Bruno@12345' }
];

export interface JogoDemonstracao {
  personagem: { nome: string; descricao: string };
  itens: { nome: string; descricao: string; quantidade: number }[];
  campanha: { nome: string; descricao: string; abertura: string };
}

export const JOGO_DEMONSTRACAO: JogoDemonstracao = {
  personagem: {
    nome: 'Aldric',
    descricao:
      'Guerreiro veterano de olhar cansado e cicatriz no queixo. Deixou a guarda da capital após uma traição e procura redenção. Fala pouco, desconfia de magos e jamais abandona um aliado ferido.'
  },
  itens: [
    { nome: 'Espada longa', descricao: 'Lâmina de aço com o brasão da guarda raspado do cabo.', quantidade: 1 },
    { nome: 'Poção de cura', descricao: 'Frasco de líquido vermelho que fecha ferimentos leves.', quantidade: 2 },
    { nome: 'Corda de cânhamo', descricao: 'Quinze metros de corda resistente.', quantidade: 1 },
    { nome: 'Tocha', descricao: 'Queima por cerca de uma hora.', quantidade: 3 }
  ],
  campanha: {
    nome: 'A Masmorra de Eldrath',
    descricao:
      'Você chegou à vila de Eldrath em busca do tesouro perdido. Os moradores falam de uma antiga masmorra sob as colinas, de onde ninguém voltou nos últimos anos.',
    abertura: 'A névoa cobre a estrada. À frente, você vê a entrada de uma antiga masmorra. O que você faz?'
  }
};
