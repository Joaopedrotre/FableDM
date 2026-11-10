import type { Request, Response } from 'express';
import { mestreMensagemSchema } from '../validators/mestreValidator.js';
import { MestreService } from '../services/MestreService.js';
import { ProvedorError } from '../providers/LLMProvider.js';

export class MestreController {
  constructor(private readonly service = new MestreService()) {}

  responder = async (req: Request, res: Response): Promise<void> => {
    const validacao = mestreMensagemSchema.safeParse(req.body);
    if (!validacao.success) {
      res.status(400).json({
        erros: validacao.error.issues.map((erro) => ({
          campo: String(erro.path[0] ?? ''),
          mensagem: erro.message
        }))
      });
      return;
    }

    try {
      const resposta = await this.service.responder(validacao.data.mensagens);
      res.json({ resposta });
    } catch (erro) {
      if (erro instanceof ProvedorError) {
        if (erro.status === 429) {
          res.status(429).json({ mensagem: 'O mestre está recebendo muitas ações ao mesmo tempo. Tente novamente em instantes.' });
          return;
        }
        res.status(502).json({ mensagem: 'O mestre não conseguiu responder agora. Tente novamente.' });
        return;
      }
      throw erro;
    }
  };
}
