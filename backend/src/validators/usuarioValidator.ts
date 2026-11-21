import { z } from 'zod';
import { cpfValido, somenteDigitos } from '../utils/cpf.js';

const nomeSchema = z.string().trim().min(1, 'Informe seu nome.').refine(
  (nome) => nome.split(/\s+/).filter(Boolean).length >= 2,
  'Informe nome e sobrenome.'
);

const cpfSchema = z.string().transform(somenteDigitos).refine(
  cpfValido,
  'CPF inválido.'
);

const senhaSchema = z.string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres.')
  .regex(/[A-Z]/, 'A senha deve conter uma letra maiúscula.')
  .regex(/[a-z]/, 'A senha deve conter uma letra minúscula.')
  .regex(/\d/, 'A senha deve conter um número.')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter um símbolo.');

export const cadastroUsuarioSchema = z.object({
  nome: nomeSchema,
  email: z.string().trim().email('E-mail inválido.').max(254, 'E-mail muito longo.'),
  cpf: cpfSchema,
  senha: senhaSchema
});

export const edicaoUsuarioSchema = z.object({
  nome: nomeSchema,
  cpf: cpfSchema,
  senha: senhaSchema.optional(),
  email: z.unknown().refine((valor) => valor === undefined, 'O e-mail não pode ser alterado.')
});

export type CadastroUsuarioInput = z.infer<typeof cadastroUsuarioSchema>;
export type EdicaoUsuarioInput = z.infer<typeof edicaoUsuarioSchema>;
