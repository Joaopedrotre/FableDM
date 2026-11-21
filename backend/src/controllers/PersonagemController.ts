import type { Request, Response } from 'express';
import { usuarioAutenticado } from '../middlewares/autenticar.js';
import { PersonagemService } from '../services/PersonagemService.js';
import { personagemSchema } from '../validators/jogoValidator.js';
import {
  executar,
  lerId,
  lerPaginacao,
  naoEncontrado,
  personagemParaResposta,
  validar
} from './respostas.js';

export class PersonagemController {
  constructor(private readonly service = new PersonagemService()) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    const paginacao = lerPaginacao(req.query, res);
    if (!paginacao) return;

    await executar(res, async () => {
      const pagina = await this.service.listar(usuarioAutenticado(res), paginacao);
      res.json({ ...pagina, dados: pagina.dados.map(personagemParaResposta) });
    });
  };

  buscar = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'Personagem');

    await executar(res, async () => {
      res.json(personagemParaResposta(await this.service.buscar(usuarioAutenticado(res), id)));
    });
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    const dados = validar(personagemSchema, req.body, res);
    if (!dados) return;

    await executar(res, async () => {
      const criado = await this.service.criar(usuarioAutenticado(res), dados);
      res.status(201).json(personagemParaResposta(criado));
    });
  };

  editar = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'Personagem');
    const dados = validar(personagemSchema, req.body, res);
    if (!dados) return;

    await executar(res, async () => {
      res.json(personagemParaResposta(await this.service.editar(usuarioAutenticado(res), id, dados)));
    });
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'Personagem');

    await executar(res, async () => {
      await this.service.excluir(usuarioAutenticado(res), id);
      res.json({ mensagem: 'Personagem excluído.' });
    });
  };
}
