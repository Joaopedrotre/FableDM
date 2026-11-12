interface Props {
  faces: number;
  valor?: number;
  rotulo?: string;
  animando?: boolean;
  pequeno?: boolean;
}

const PONTOS: Record<number, string> = {
  4: '50,6 95,90 5,90',
  8: '50,4 94,50 50,96 6,50',
  10: '50,4 92,40 50,96 8,40',
  12: '50,5 95,38 78,92 22,92 5,38',
  20: '50,4 92,27 92,73 50,96 8,73 8,27'
};

function tamanhoDaFonte(texto: string): number {
  if (texto.length >= 4) return 22;
  if (texto.length === 3) return 27;
  if (texto.length === 2) return 36;
  return 42;
}

export default function DadoSvg({ faces, valor, rotulo, animando = false, pequeno = false }: Props) {
  const texto = valor !== undefined ? String(valor) : (rotulo ?? `d${faces}`);
  const classes = ['dado-svg', animando ? 'rolando' : '', pequeno ? 'pequeno' : ''].filter(Boolean).join(' ');

  return (
    <svg className={classes} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <g className="dado-corpo">
        {faces === 6 && <rect x="10" y="10" width="80" height="80" rx="12" />}
        {faces === 100 && <circle cx="50" cy="50" r="44" />}
        {faces !== 6 && faces !== 100 && <polygon points={PONTOS[faces]} />}
      </g>
      <text x="50" y={faces === 4 ? 66 : 53} textAnchor="middle" dominantBaseline="central" fontSize={tamanhoDaFonte(texto)}>
        {texto}
      </text>
    </svg>
  );
}
