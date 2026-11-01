import { useEffect, useRef, useState } from 'react';
import './dados.css';

// Formas (viewBox 100x100) de cada tipo de dado
const FORMAS = {
  4: <polygon points="50,8 94,86 6,86" />,
  6: <rect x="10" y="10" width="80" height="80" rx="14" />,
  8: <polygon points="50,5 92,50 50,95 8,50" />,
  12: <polygon points="50,6 94,38 77,90 23,90 6,38" />,
  20: <polygon points="50,5 91,28 91,72 50,95 9,72 9,28" />,
};

// Linhas internas que dão o aspecto de "faces" no d20
const FACES_D20 = (
  <g className="faces">
    <polygon points="50,30 73,68 27,68" />
    <line x1="50" y1="30" x2="50" y2="5" />
    <line x1="73" y1="68" x2="91" y2="72" />
    <line x1="27" y1="68" x2="9" y2="72" />
  </g>
);

const reduzirMovimento = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const sortear = (lados) => Math.floor(Math.random() * lados) + 1;

function Dado({ lados, gatilho, aoRolar }) {
  const [valor, setValor] = useState(lados);
  const [rolando, setRolando] = useState(false);
  const timers = useRef([]);

  const limpar = () => {
    timers.current.forEach((t) => {
      clearInterval(t);
      clearTimeout(t);
    });
    timers.current = [];
  };

  function rolar() {
    if (rolando) return;
    const final = sortear(lados);

    if (reduzirMovimento()) {
      setValor(final);
      aoRolar(lados, final);
      return;
    }

    setRolando(true);
    timers.current.push(setInterval(() => setValor(sortear(lados)), 70));
    timers.current.push(
      setTimeout(() => {
        limpar();
        setValor(final);
        setRolando(false);
        aoRolar(lados, final);
      }, 800 + Math.random() * 500)
    );
  }

  // "Rolar todos" muda o gatilho e cada dado rola
  useEffect(() => {
    if (gatilho > 0) rolar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatilho]);

  useEffect(() => limpar, []);

  return (
    <button
      type="button"
      className={`dado d${lados} ${rolando ? 'rolando' : ''}`}
      onClick={rolar}
      aria-label={`Rolar d${lados}`}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {FORMAS[lados]}
        {lados === 20 && FACES_D20}
        <text x="50" y={lados === 20 ? 58 : 59} textAnchor="middle">
          {valor}
        </text>
      </svg>
      <span className="rotulo">d{lados}</span>
    </button>
  );
}

export default function DadosMesa() {
  const [gatilho, setGatilho] = useState(0);
  const [ultimo, setUltimo] = useState(null);

  return (
    <section className="mesa" aria-label="Mesa de dados">
      <div className="dados">
        <Dado lados={20} gatilho={gatilho} aoRolar={(l, v) => setUltimo({ l, v })} />
        <Dado lados={12} gatilho={gatilho} aoRolar={(l, v) => setUltimo({ l, v })} />
        <Dado lados={8} gatilho={gatilho} aoRolar={(l, v) => setUltimo({ l, v })} />
        <Dado lados={6} gatilho={gatilho} aoRolar={(l, v) => setUltimo({ l, v })} />
        <Dado lados={4} gatilho={gatilho} aoRolar={(l, v) => setUltimo({ l, v })} />
      </div>

      <p className="resultado" aria-live="polite">
        {ultimo ? `Você tirou ${ultimo.v} no d${ultimo.l}` : 'Clique em um dado para rolar'}
      </p>

      <button type="button" className="rolar-todos" onClick={() => setGatilho((g) => g + 1)}>
        Rolar todos
      </button>
    </section>
  );
}
