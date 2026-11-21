import type { Request, Response } from 'express';
import { cadastroUsuarioSchema, edicaoUsuarioSchema } from '../validators/usuarioValidator.js';
import { CadastroError, UsuarioNaoEncontradoError, UsuarioService } from '../services/UsuarioService.js';
import { usuarioAutenticado } from '../middlewares/autenticar.js';
import { errosDeValidacao, paraResposta } from './respostas.js';

export class UsuarioController {
  constructor(private readonly service = new UsuarioService()) {}

  cadastrar = async (req: Request, res: Response): Promise<void> => {
    const validacao = cadastroUsuarioSchema.safeParse(req.body);
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
      const usuario = await this.service.cadastrar(validacao.data);
      // DTO explícito: campos privados (#) da entidade não são serializados
      // automaticamente por JSON.stringify. CPF e hash não são retornados.
      res.status(201).json({
        mensagem: 'Usuário cadastrado com sucesso.',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          criadoEm: usuario.criadoEm
        }
      });
    } catch (erro) {
      if (erro instanceof CadastroError) {
        res.status(409).json({
          erros: [{ campo: erro.campo, mensagem: erro.message }]
        });
        return;
      }
      throw erro;
    }
  };

  editar = async (req: Request, res: Response): Promise<void> => {
    const validacao = edicaoUsuarioSchema.safeParse(req.body);
    if (!validacao.success) {
      res.status(400).json({ erros: errosDeValidacao(validacao.error.issues) });
      return;
    }

    try {
      const usuario = await this.service.editar(usuarioAutenticado(res), validacao.data);
      res.json({ mensagem: 'Perfil atualizado com sucesso.', usuario: paraResposta(usuario) });
    } catch (erro) {
      if (erro instanceof CadastroError) {
        res.status(409).json({ erros: [{ campo: erro.campo, mensagem: erro.message }] });
        return;
      }
      if (erro instanceof UsuarioNaoEncontradoError) {
        res.status(404).json({ mensagem: erro.message });
        return;
      }
      throw erro;
    }
  };
}
