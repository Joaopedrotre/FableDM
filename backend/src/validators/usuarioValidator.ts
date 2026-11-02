import { z } from 'zod';
import { cpfValido, somenteDigitos } from '../utils/cpf.js';

export const cadastroUsuarioSchema = z.object({
  nome: z.string().trim().min(1, 'Informe seu nome.').refine(
    (nome) => nome.split(/\s+/).filter(Boolean).length >= 2,
    'Informe nome e sobrenome.'
  ),
  email: z.string().trim().email('E-mail inválido.').max(254, 'E-mail muito longo.'),
  cpf: z.string().transform(somenteDigitos).refine(
    cpfValido,
    'CPF inválido.'
  ),
  senha: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'A senha deve conter uma letra maiúscula.')
    .regex(/[a-z]/, 'A senha deve conter uma letra minúscula.')
    .regex(/\d/, 'A senha deve conter um número.')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter um símbolo.')
});

export type CadastroUsuarioInput = z.infer<typeof cadastroUsuarioSchema>;
