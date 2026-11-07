import type { Personagem } from '../types';
import BarraStatus from './BarraStatus';

// Coluna da direita: personagem usado na campanha.
export default function PainelPersonagem({ personagem }: { personagem: Personagem }) {
  return (
    <aside className="painel">
      <div className="avatar" aria-hidden="true">
        {personagem.nome[0]}
      </div>
      <h2>{personagem.nome}</h2>
      <p>
        {personagem.classe} · Nível {personagem.nivel}
      </p>
      <BarraStatus rotulo="Vida" valor={personagem.vida} max={personagem.vidaMax} cor="vida" />
      <BarraStatus rotulo="Mana" valor={personagem.mana} max={personagem.manaMax} cor="mana" />
      <BarraStatus rotulo="XP" valor={personagem.xp} max={personagem.xpMax} cor="xp" />
    </aside>
  );
}
