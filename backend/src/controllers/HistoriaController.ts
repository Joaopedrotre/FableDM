import type { Request, Response } from 'express';
import { usuarioAutenticado } from '../middlewares/autenticar.js';
import { HistoriaService } from '../services/HistoriaService.js';
import { JogoService } from '../services/JogoService.js';
import {
  acaoSchema,
  consultaHistoriasSchema,
  edicaoHistoriaSchema,
  historiaSchema,
  mensagensAnterioresSchema
} from '../validators/jogoValidator.js';
import {
  campanhaParaResposta,
  executar,
  historiaParaResposta,
  itemParaResposta,
  lerId,
  mensagemParaResposta,
  naoEncontrado,
  personagemParaResposta,
  validar
} from './respostas.js';

export class HistoriaController {
  constructor(
    private readonly service = new HistoriaService(),
    private readonly jogo = new JogoService()
  ) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    const consulta = validar(consultaHistoriasSchema, req.query, res);
    if (!consulta) return;

    await executar(res, async () => {
      const pagina = await this.service.listar(usuarioAutenticado(res), consulta, consulta.campanhaId);
      res.json({ ...pagina, dados: pagina.dados.map(historiaParaResposta) });
    });
  };

  buscar = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'História');

    await executar(res, async () => {
      res.json(historiaParaResposta(await this.service.buscar(usuarioAutenticado(res), id)));
    });
  };

  criar = async (req: Request, res: Response): Promise<void> => {
    const dados = validar(historiaSchema, req.body, res);
    if (!dados) return;

    await executar(res, async () => {
      const criada = await this.service.criar(usuarioAutenticado(res), dados);
      res.status(201).json(historiaParaResposta(criada));
    });
  };

  editar = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'História');
    const dados = validar(edicaoHistoriaSchema, req.body, res);
    if (!dados) return;

    await executar(res, async () => {
      res.json(historiaParaResposta(await this.service.editar(usuarioAutenticado(res), id, dados)));
    });
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'História');

    await executar(res, async () => {
      await this.service.excluir(usuarioAutenticado(res), id);
      res.json({ mensagem: 'História excluída.' });
    });
  };

  sessao = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'História');

    await executar(res, async () => {
      const sessao = await this.jogo.obterSessao(usuarioAutenticado(res), id);
      res.json({
        historia: historiaParaResposta(sessao.historia),
        campanha: campanhaParaResposta(sessao.campanha),
        personagem: sessao.personagem ? personagemParaResposta(sessao.personagem) : null,
        itens: sessao.itens.map(itemParaResposta),
        totalItens: sessao.totalItens,
        mensagens: sessao.mensagens.map(mensagemParaResposta)
      });
    });
  };

  mensagensAnteriores = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'História');
    const consulta = validar(mensagensAnterioresSchema, req.query, res);
    if (!consulta) return;

    await executar(res, async () => {
      const mensagens = await this.service.listarMensagensAnteriores(
        usuarioAutenticado(res),
        id,
        consulta.antesDe,
        consulta.limite
      );
      res.json({ mensagens: mensagens.map(mensagemParaResposta) });
    });
  };

  enviarAcao = async (req: Request, res: Response): Promise<void> => {
    const id = lerId(req.params.id);
    if (id === null) return naoEncontrado(res, 'História');
    const dados = validar(acaoSchema, req.body, res);
    if (!dados) return;

    await executar(res, async () => {
      const troca = await this.jogo.enviarAcao(usuarioAutenticado(res), id, dados.texto);
      res.json({
        mensagem: mensagemParaResposta(troca.mensagem),
        resposta: mensagemParaResposta(troca.resposta)
      });
    });
  };
}
