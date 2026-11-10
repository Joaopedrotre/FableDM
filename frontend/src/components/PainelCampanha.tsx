import type { Campanha } from '../types';

// Coluna da esquerda: campanha em que o jogador está.
export default function PainelCampanha({ campanha }: { campanha: Campanha }) {
  return (
    <aside className="painel">
      <h2>Campanha</h2>
      <h3>{campanha.nome}</h3>
      <p>{campanha.descricao}</p>
    </aside>
  );
}
