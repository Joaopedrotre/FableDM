import { z } from 'zod';

export const paginacaoSchema = z.object({
  pagina: z.coerce.number().int('A página deve ser um número inteiro.').min(1, 'A página deve ser maior ou igual a 1.').default(1),
  limite: z.coerce.number().int('O limite deve ser um número inteiro.').min(1, 'O limite deve ser maior ou igual a 1.').max(50, 'O limite máximo é 50.').default(10)
});

export type ParametrosPaginacao = z.infer<typeof paginacaoSchema>;

export interface Pagina<T> {
  dados: T[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export function calcularDeslocamento({ pagina, limite }: ParametrosPaginacao): number {
  return (pagina - 1) * limite;
}

export function montarPagina<T>(dados: T[], total: number, { pagina, limite }: ParametrosPaginacao): Pagina<T> {
  return { dados, pagina, limite, total, totalPaginas: Math.max(1, Math.ceil(total / limite)) };
}
