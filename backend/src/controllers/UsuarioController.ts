import type { Request, Response } from 'express';
import { cadastroUsuarioSchema } from '../validators/usuarioValidator.js';
import { CadastroError, UsuarioService } from '../services/UsuarioService.js';

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
}
