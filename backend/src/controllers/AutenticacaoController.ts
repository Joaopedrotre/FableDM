import type { Request, Response } from 'express';
import { loginSchema } from '../validators/autenticacaoValidator.js';
import {
  AutenticacaoService,
  ContaTesteAusenteError,
  ContaTesteDesativadaError,
  CredenciaisInvalidasError
} from '../services/AutenticacaoService.js';
import { errosDeValidacao, paraResposta } from './respostas.js';

export class AutenticacaoController {
  constructor(private readonly service = new AutenticacaoService()) {}

  entrar = async (req: Request, res: Response): Promise<void> => {
    const validacao = loginSchema.safeParse(req.body);
    if (!validacao.success) {
      res.status(400).json({ erros: errosDeValidacao(validacao.error.issues) });
      return;
    }

    try {
      const { token, usuario } = await this.service.entrar(validacao.data.email, validacao.data.senha);
      res.json({ token, usuario: paraResposta(usuario) });
    } catch (erro) {
      if (erro instanceof CredenciaisInvalidasError) {
        res.status(401).json({ mensagem: erro.message });
        return;
      }
      throw erro;
    }
  };

  entrarComoTeste = async (_req: Request, res: Response): Promise<void> => {
    try {
      const { token, usuario } = await this.service.entrarComoTeste();
      res.json({ token, usuario: paraResposta(usuario) });
    } catch (erro) {
      if (erro instanceof ContaTesteDesativadaError) {
        res.status(404).json({ mensagem: 'Rota não encontrada.' });
        return;
      }
      if (erro instanceof ContaTesteAusenteError) {
        res.status(503).json({ mensagem: 'A conta de teste ainda não foi criada no banco de dados.' });
        return;
      }
      throw erro;
    }
  };
}
