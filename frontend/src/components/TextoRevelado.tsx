import { useEffect, useState } from 'react';
import { CARACTERES_POR_SEGUNDO } from '../config';

interface Props {
  texto: string;
  animar?: boolean;
  aoProgredir?: () => void;
}

function deveAnimar(animar: boolean): boolean {
  if (!animar || CARACTERES_POR_SEGUNDO <= 0) return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function TextoRevelado({ texto, animar = false, aoProgredir }: Props) {
  const [visiveis, setVisiveis] = useState(() => (deveAnimar(animar) ? 0 : texto.length));

  useEffect(() => {
    if (!deveAnimar(animar)) {
      setVisiveis(texto.length);
      return;
    }

    setVisiveis(0);
    const inicio = performance.now();
    let quadro = 0;

    const passo = (agora: number) => {
      const total = Math.min(texto.length, Math.floor(((agora - inicio) / 1000) * CARACTERES_POR_SEGUNDO));
      setVisiveis(total);
      if (total < texto.length) quadro = requestAnimationFrame(passo);
    };

    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [texto, animar]);

  useEffect(() => {
    aoProgredir?.();
  }, [visiveis, aoProgredir]);

  if (!animar) return <>{texto}</>;

  return (
    <>
      <span aria-hidden="true">{texto.slice(0, visiveis)}</span>
      <span className="so-leitor">{texto}</span>
    </>
  );
}
