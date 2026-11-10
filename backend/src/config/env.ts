import 'dotenv/config';
import { z } from 'zod';

const schema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive().default(3306),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string().min(1),
    LLM_PROVIDER: z.enum(['anthropic', 'openai']).default('anthropic'),
    LLM_API_KEY: z.string().default(''),
    LLM_MODEL: z.string().min(1, 'Informe o modelo do provedor de IA.'),
    LLM_BASE_URL: z.string().url().optional().or(z.literal('').transform(() => undefined)),
    LLM_MAX_TOKENS: z.coerce.number().int().positive().default(600)
  })
  .superRefine((dados, ctx) => {
    const exigeChave = dados.LLM_PROVIDER === 'anthropic' || !dados.LLM_BASE_URL;
    if (exigeChave && dados.LLM_API_KEY.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['LLM_API_KEY'],
        message: 'Informe a chave de API do provedor de IA.'
      });
    }
  });

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Configuração inválida no .env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
