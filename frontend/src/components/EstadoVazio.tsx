import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  texto: string;
  acao?: ReactNode;
}

export default function EstadoVazio({ titulo, texto, acao }: Props) {
  return (
    <section className="estado-vazio">
      <h3>{titulo}</h3>
      <p>{texto}</p>
      {acao}
    </section>
  );
}
