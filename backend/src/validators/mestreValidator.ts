import { z } from 'zod';

export const LIMITE_TEXTO_JOGADOR = 5000;
export const LIMITE_TEXTO_MESTRE = 30000;

const textoComLimite = (limite: number) =>
  z
    .string()
    .trim()
    .min(1, 'Escreva uma mensagem.')
    .max(limite, `A mensagem deve ter no máximo ${limite} caracteres.`);

const mensagemSchema = z.discriminatedUnion('autor', [
  z.object({ autor: z.literal('jogador'), texto: textoComLimite(LIMITE_TEXTO_JOGADOR) }),
  z.object({ autor: z.literal('mestre'), texto: textoComLimite(LIMITE_TEXTO_MESTRE) })
]);

export const mestreMensagemSchema = z
  .object({
    mensagens: z
      .array(mensagemSchema)
      .min(1, 'Envie ao menos uma mensagem.')
      .max(40, 'O histórico enviado é muito longo.')
  })
  .refine((dados) => dados.mensagens[dados.mensagens.length - 1].autor === 'jogador', {
    message: 'A última mensagem deve ser do jogador.',
    path: ['mensagens']
  });

export type MestreMensagemInput = z.infer<typeof mestreMensagemSchema>;
export type MensagemMestreInput = MestreMensagemInput['mensagens'][number];
