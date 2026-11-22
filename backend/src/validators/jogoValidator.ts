import { z } from 'zod';
import { paginacaoSchema } from '../utils/paginacao.js';
import { LIMITE_TEXTO_JOGADOR } from './mestreValidator.js';

export const LIMITE_IMAGEM = 400_000;

const IMAGEM_DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

const nomeSchema = (minimo: number, maximo: number) =>
  z
    .string()
    .trim()
    .min(minimo, minimo === 1 ? 'Informe o nome.' : `O nome deve ter ao menos ${minimo} caracteres.`)
    .max(maximo, `O nome deve ter no máximo ${maximo} caracteres.`)
    .transform((nome) => nome.replace(/\s+/g, ' '));

const descricaoSchema = (maximo: number) =>
  z.string().trim().min(1, 'Informe a descrição.').max(maximo, `A descrição deve ter no máximo ${maximo} caracteres.`);

export const personagemSchema = z.object({
  nome: nomeSchema(2, 100),
  descricao: descricaoSchema(2000),
  imagem: z
    .string()
    .max(LIMITE_IMAGEM, 'A imagem é grande demais.')
    .regex(IMAGEM_DATA_URL, 'Formato de imagem inválido. Use PNG, JPEG ou WebP.')
    .nullable()
    .optional()
});

export const itemSchema = z.object({
  nome: nomeSchema(1, 100),
  descricao: z.string().trim().max(500, 'A descrição deve ter no máximo 500 caracteres.').default(''),
  quantidade: z
    .number({ invalid_type_error: 'Informe a quantidade.' })
    .int('A quantidade deve ser um número inteiro.')
    .min(1, 'A quantidade mínima é 1.')
    .max(999, 'A quantidade máxima é 999.')
    .default(1)
});

export const campanhaSchema = z.object({
  nome: nomeSchema(2, 120),
  descricao: descricaoSchema(2000),
  personagemId: z.number().int().positive().nullable().optional()
});

export const acaoSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(1, 'Escreva uma ação.')
    .max(LIMITE_TEXTO_JOGADOR, `A ação deve ter no máximo ${LIMITE_TEXTO_JOGADOR} caracteres.`)
});

export const historiaSchema = z.object({
  campanhaId: z
    .number({ required_error: 'Escolha uma campanha.', invalid_type_error: 'Escolha uma campanha.' })
    .int('Escolha uma campanha.')
    .positive('Escolha uma campanha.'),
  titulo: z
    .string()
    .trim()
    .min(2, 'O título deve ter ao menos 2 caracteres.')
    .max(120, 'O título deve ter no máximo 120 caracteres.')
    .transform((titulo) => titulo.replace(/\s+/g, ' ')),
  resumo: z.string().trim().max(1000, 'O resumo deve ter no máximo 1000 caracteres.').default('')
});

export const edicaoHistoriaSchema = historiaSchema.omit({ campanhaId: true });

export const consultaHistoriasSchema = paginacaoSchema.extend({
  campanhaId: z.coerce.number().int().positive().optional()
});

export const mensagensAnterioresSchema = z.object({
  antesDe: z.coerce.number().int().positive('Informe a mensagem de referência.'),
  limite: z.coerce.number().int().min(1).max(100).default(50)
});

export type PersonagemInput = z.infer<typeof personagemSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type CampanhaInput = z.infer<typeof campanhaSchema>;
export type AcaoInput = z.infer<typeof acaoSchema>;
export type HistoriaInput = z.infer<typeof historiaSchema>;
export type EdicaoHistoriaInput = z.infer<typeof edicaoHistoriaSchema>;
