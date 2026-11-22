import type { Request, Response } from 'express';
import { usuarioAutenticado } from '../middlewares/autenticar.js';
import { CampanhaService } from '../services/CampanhaService.js';
import { campanhaSchema } from '../validators/jogoValidator.js';
import {
  campanhaParaResposta,
  executar,
  lerId,
  lerPaginacao,
  naoEncontrado,
  validar
} from './respostas.js';

export class CampanhaController {
  constructor(private readonly service = new CampanhaService()) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    const paginacao = lerPaginacao(req.query, res);
    if (!paginacao) return;

    await executar(res, async () => {
      const pagina = await this.service.listar(usuarioAutenticado(res), paginacao);
      res.json({ ...pagina, dados: pagina.dados.map(campanhaParaResposta) });
    });
  };

  buscar = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'Campanha');

    await executar(res, async () => {
      res.json(campanhaParaResposta(await this.service.buscar(usuarioAutenticado(res), id)));
    });
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    const dados = validar(campanhaSchema, req.body, res);
    if (!dados) return;

    await executar(res, async () => {
      const criada = await this.service.criar(usuarioAutenticado(res), dados);
      res.status(201).json(campanhaParaResposta(criada));
    });
  };

  editar = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'Campanha');
    const dados = validar(campanhaSchema, req.body, res);
    if (!dados) return;

    await executar(res, async () => {
      res.json(campanhaParaResposta(await this.service.editar(usuarioAutenticado(res), id, dados)));
    });
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'Campanha');

    await executar(res, async () => {
      await this.service.excluir(usuarioAutenticado(res), id);
      res.json({ mensagem: 'Campanha excluída.' });
    });
  };
}
