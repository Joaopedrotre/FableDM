import { useEffect, useMemo, useState } from 'react';
import { CARACTERES_POR_SEGUNDO } from '../config';
import { analisarMarkdown, contarCaracteres, truncarBlocos } from '../utils/markdown';
import TextoFormatado from './TextoFormatado';

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
  const blocos = useMemo(() => analisarMarkdown(texto), [texto]);
  const total = useMemo(() => contarCaracteres(blocos), [blocos]);
  const [visiveis, setVisiveis] = useState(() => (deveAnimar(animar) ? 0 : total));

  useEffect(() => {
    if (!deveAnimar(animar)) {
      setVisiveis(total);
      return;
    }

    setVisiveis(0);
    const inicio = performance.now();
    let quadro = 0;

    const passo = (agora: number) => {
      const revelados = Math.min(total, Math.floor(((agora - inicio) / 1000) * CARACTERES_POR_SEGUNDO));
      setVisiveis(revelados);
      if (revelados < total) quadro = requestAnimationFrame(passo);
    };

    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [total, animar]);

  useEffect(() => {
    aoProgredir?.();
  }, [visiveis, aoProgredir]);

  if (!animar) return <TextoFormatado blocos={blocos} />;

  return (
    <>
      <div aria-hidden="true">
        <TextoFormatado blocos={visiveis >= total ? blocos : truncarBlocos(blocos, visiveis)} />
      </div>
      <div className="so-leitor">
        <TextoFormatado blocos={blocos} />
      </div>
    </>
  );
}
