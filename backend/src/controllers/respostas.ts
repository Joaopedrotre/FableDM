import type { Response } from 'express';
import type { ZodIssue, ZodType, ZodTypeDef } from 'zod';
import type { Campanha } from '../models/Campanha.js';
import type { Historia } from '../models/Historia.js';
import type { Item } from '../models/Item.js';
import type { MensagemJogo } from '../models/MensagemJogo.js';
import type { Personagem } from '../models/Personagem.js';
import type { Usuario } from '../models/Usuario.js';
import { ProvedorError } from '../providers/LLMProvider.js';
import { RecursoNaoEncontradoError, ReferenciaInvalidaError } from '../services/erros.js';
import { paginacaoSchema, type ParametrosPaginacao } from '../utils/paginacao.js';

export function errosDeValidacao(issues: ZodIssue[]): { campo: string; mensagem: string }[] {
  return issues.map((erro) => ({
    campo: String(erro.path[0] ?? ''),
    mensagem: erro.message
  }));
}

export function paraResposta(usuario: Usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf
  };
}

export function personagemParaResposta(personagem: Personagem) {
  return {
    id: personagem.id,
    nome: personagem.nome,
    descricao: personagem.descricao,
    imagem: personagem.imagem
  };
}

export function itemParaResposta(item: Item) {
  return {
    id: item.id,
    personagemId: item.personagemId,
    nome: item.nome,
    descricao: item.descricao,
    quantidade: item.quantidade
  };
}

export function campanhaParaResposta(campanha: Campanha) {
  return {
    id: campanha.id,
    nome: campanha.nome,
    descricao: campanha.descricao,
    personagemId: campanha.personagemId,
    personagemNome: campanha.personagemNome,
    criadoEm: campanha.criadoEm.toISOString(),
    atualizadaEm: campanha.atualizadaEm.toISOString()
  };
}

export function historiaParaResposta(historia: Historia) {
  return {
    id: historia.id,
    campanhaId: historia.campanhaId,
    campanhaNome: historia.campanhaNome,
    titulo: historia.titulo,
    resumo: historia.resumo,
    totalMensagens: historia.totalMensagens,
    criadoEm: historia.criadoEm.toISOString(),
    atualizadaEm: historia.atualizadaEm.toISOString()
  };
}

export function mensagemParaResposta(mensagem: MensagemJogo) {
  return { id: mensagem.id, autor: mensagem.autor, texto: mensagem.texto };
}

export function validar<T>(schema: ZodType<T, ZodTypeDef, unknown>, dados: unknown, res: Response): T | null {
  const resultado = schema.safeParse(dados);
  if (resultado.success) return resultado.data;
  res.status(400).json({ erros: errosDeValidacao(resultado.error.issues) });
  return null;
}

export function lerId(valor: unknown): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function lerPaginacao(consulta: unknown, res: Response): ParametrosPaginacao | null {
  return validar(paginacaoSchema, consulta, res);
}

export function naoEncontrado(res: Response, recurso: string): void {
  res.status(404).json({ mensagem: `${recurso} não encontrado.` });
}

export function tratarErroDeDominio(erro: unknown, res: Response): boolean {
  if (erro instanceof RecursoNaoEncontradoError) {
    res.status(404).json({ mensagem: erro.message });
    return true;
  }
  if (erro instanceof ReferenciaInvalidaError) {
    res.status(400).json({ erros: [{ campo: erro.campo, mensagem: erro.message }] });
    return true;
  }
  if (erro instanceof ProvedorError) {
    if (erro.status === 429) {
      res.status(429).json({ mensagem: 'O mestre está recebendo muitas ações ao mesmo tempo. Tente novamente em instantes.' });
    } else {
      res.status(502).json({ mensagem: 'O mestre não conseguiu responder agora. Tente novamente.' });
    }
    return true;
  }
  return false;
}

export async function executar(res: Response, acao: () => Promise<void>): Promise<void> {
  try {
    await acao();
  } catch (erro) {
    if (!tratarErroDeDominio(erro, res)) throw erro;
  }
}
