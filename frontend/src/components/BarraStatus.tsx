interface Props {
  rotulo: string;
  valor: number;
  max: number;
  cor: 'vida' | 'mana' | 'xp';
}

// Barra de progresso com nome e número (não depende só da cor).
export default function BarraStatus({ rotulo, valor, max, cor }: Props) {
  const porcentagem = Math.min(100, Math.round((valor / max) * 100));
  return (
    <div className="status">
      <div className="status-texto">
        <span>{rotulo}</span>
        <span>
          {valor}/{max}
        </span>
      </div>
      <div className="barra" role="progressbar" aria-label={rotulo} aria-valuenow={valor} aria-valuemin={0} aria-valuemax={max}>
        <div className={`barra-cheia ${cor}`} style={{ width: `${porcentagem}%` }} />
      </div>
    </div>
  );
}
