import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Aviso from './Aviso';
import TextoRevelado from './TextoRevelado';
import RolagemDados from './RolagemDados';
import { LIMITE_CARACTERES_ACAO } from '../config';
import type { Mensagem } from '../types';

interface Props {
  mensagens: Mensagem[];
  aoEnviar: (texto: string) => void;
  carregando?: boolean;
  erro?: string;
}

// Área central: histórico de mensagens e campo para escrever a ação.
export default function Chat({ mensagens, aoEnviar, carregando = false, erro = '' }: Props) {
  const [texto, setTexto] = useState('');
  const fim = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const [dadosAbertos, setDadosAbertos] = useState(false);

  // Rola para a última mensagem sempre que chegar uma nova
  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, carregando]);

  const seguirFim = useCallback(() => {
    const el = lista.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  function inserirRolagem(resultado: string) {
    setTexto((atual) => (atual ? `${atual} ${resultado}` : resultado).slice(0, LIMITE_CARACTERES_ACAO));
    campo.current?.focus();
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const limpo = texto.trim();
    if (!limpo || carregando) return;
    aoEnviar(limpo);
    setTexto('');
  }

  return (
    <section className="chat" aria-label="Chat da aventura">
      <div className="mensagens" aria-live="polite" ref={lista}>
        {mensagens.map((m) => (
          <article key={m.id} className={`msg ${m.autor}`}>
            <strong>{m.autor === 'mestre' ? 'Mestre' : 'Você'}</strong>
            <p>
              <TextoRevelado texto={m.texto} animar={m.animar} aoProgredir={seguirFim} />
            </p>
          </article>
        ))}
        {carregando && (
          <article className="msg mestre digitando">
            <strong>Mestre</strong>
            <p>Está narrando…</p>
          </article>
        )}
        <div ref={fim} />
      </div>

      {erro && (
        <div className="chat-aviso">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      <form className="chat-form" onSubmit={enviar}>
        <button type="button" className="botao botao-dados" onClick={() => setDadosAbertos(true)} title="Rolar dados">
          ⌬ Dados
        </button>
        <input
          ref={campo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={'O que você faz? Descreva uma ação, fala ou pensamento do seu personagem. Use "" para falas e ** para pensamentos.'}
          maxLength={LIMITE_CARACTERES_ACAO}
          aria-label="Sua ação"
        />
        <button type="submit" className="botao" disabled={carregando}>
          {carregando ? 'Enviando…' : 'Enviar'}
        </button>
      </form>

      {dadosAbertos && <RolagemDados aoRolar={inserirRolagem} aoFechar={() => setDadosAbertos(false)} />}
    </section>
  );
}
