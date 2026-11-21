import type { Request, Response } from 'express';
import { usuarioAutenticado } from '../middlewares/autenticar.js';
import { ItemService } from '../services/ItemService.js';
import { itemSchema } from '../validators/jogoValidator.js';
import { executar, itemParaResposta, lerId, lerPaginacao, naoEncontrado, validar } from './respostas.js';

export class ItemController {
  constructor(private readonly service = new ItemService()) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    const personagemId = lerId(req.params.id);
    if (personagemId === null) return naoEncontrado(res, 'Personagem');
    const paginacao = lerPaginacao(req.query, res);
    if (!paginacao) return;

    await executar(res, async () => {
      const pagina = await this.service.listar(usuarioAutenticado(res), personagemId, paginacao);
      res.json({ ...pagina, dados: pagina.dados.map(itemParaResposta) });
    });
  };

  buscar = async (req: Request, res: Response): Promise<void> => {
    const personagemId = lerId(req.params.id);
    if (personagemId === null) return naoEncontrado(res, 'Personagem');
    const id = lerId(req.params.itemId);
    if (id === null) return naoEncontrado(res, 'Item');

    await executar(res, async () => {
      res.json(itemParaResposta(await this.service.buscar(usuarioAutenticado(res), personagemId, id)));
    });
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    const personagemId = lerId(req.params.id);
    if (personagemId === null) return naoEncontrado(res, 'Personagem');
    const dados = validar(itemSchema, req.body, res);
    if (!dados) return;

    await executar(res, async () => {
      const criado = await this.service.criar(usuarioAutenticado(res), personagemId, dados);
      res.status(201).json(itemParaResposta(criado));
    });
  };

  editar = async (req: Request, res: Response): Promise<void> => {
    const personagemId = lerId(req.params.id);
    if (personagemId === null) return naoEncontrado(res, 'Personagem');
    const id = lerId(req.params.itemId);
    if (id === null) return naoEncontrado(res, 'Item');
    const dados = validar(itemSchema, req.body, res);
    if (!dados) return;

    await executar(res, async () => {
      res.json(itemParaResposta(await this.service.editar(usuarioAutenticado(res), personagemId, id, dados)));
    });
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    const personagemId = lerId(req.params.id);
    if (personagemId === null) return naoEncontrado(res, 'Personagem');
    const id = lerId(req.params.itemId);
    if (id === null) return naoEncontrado(res, 'Item');

    await executar(res, async () => {
      await this.service.excluir(usuarioAutenticado(res), personagemId, id);
      res.json({ mensagem: 'Item excluído.' });
    });
  };
}
