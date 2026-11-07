import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Mensagem } from '../types';

interface Props {
  mensagens: Mensagem[];
  aoEnviar: (texto: string) => void;
}

// Área central: histórico de mensagens e campo para escrever a ação.
export default function Chat({ mensagens, aoEnviar }: Props) {
  const [texto, setTexto] = useState('');
  const fim = useRef<HTMLDivElement>(null);

  // Rola para a última mensagem sempre que chegar uma nova
  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const limpo = texto.trim();
    if (!limpo) return;
    aoEnviar(limpo);
    setTexto('');
  }

  return (
    <section className="chat" aria-label="Chat da aventura">
      <div className="mensagens" aria-live="polite">
        {mensagens.map((m) => (
          <article key={m.id} className={`msg ${m.autor}`}>
            <strong>{m.autor === 'mestre' ? 'Mestre' : 'Você'}</strong>
            <p>{m.texto}</p>
          </article>
        ))}
        <div ref={fim} />
      </div>

      <form className="chat-form" onSubmit={enviar}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="O que você faz?"
          aria-label="Sua ação"
        />
        <button type="submit" className="botao">
          Enviar
        </button>
      </form>
    </section>
  );
}
