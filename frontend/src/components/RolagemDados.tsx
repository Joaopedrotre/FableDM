import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DURACAO_RESULTADO_MS, DURACAO_ROLAGEM_MS, MAXIMO_DADOS_POR_ROLAGEM } from '../config';
import DadoSvg from './DadoSvg';

const FACES_DISPONIVEIS = [4, 6, 8, 10, 12, 20, 100];
const INTERVALO_TROCA_MS = 70;

type Fase = 'selecao' | 'rolando' | 'resultado';

interface Props {
  aoRolar: (resultado: string) => void;
  aoFechar: () => void;
}

function sortear(faces: number): number {
  return Math.floor(Math.random() * faces) + 1;
}

function notacao(faces: number, quantidade: number): string {
  return quantidade === 1 ? `d${faces}` : `${quantidade}d${faces}`;
}

function somar(valores: number[]): number {
  return valores.reduce((soma, valor) => soma + valor, 0);
}

function descreverRolagem(faces: number, valores: number[]): string {
  if (valores.length === 1) return `(Rolagem de ${notacao(faces, 1)}: ${valores[0]})`;
  return `(Rolagem de ${notacao(faces, valores.length)}: ${valores.join(' + ')} = ${somar(valores)})`;
}

function prefereMovimentoReduzido(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export default function RolagemDados({ aoRolar, aoFechar }: Props) {
  const [faces, setFaces] = useState(20);
  const [quantidade, setQuantidade] = useState(1);
  const [fase, setFase] = useState<Fase>('selecao');
  const [exibidos, setExibidos] = useState<number[]>([]);
  const finais = useRef<number[]>([]);
  const concluido = useRef(false);
  const aoRolarRef = useRef(aoRolar);
  const aoFecharRef = useRef(aoFechar);
  aoRolarRef.current = aoRolar;
  aoFecharRef.current = aoFechar;

  const concluir = useCallback(() => {
    if (concluido.current) return;
    concluido.current = true;
    aoRolarRef.current(descreverRolagem(faces, finais.current));
    aoFecharRef.current();
  }, [faces]);

  function iniciar() {
    finais.current = Array.from({ length: quantidade }, () => sortear(faces));
    setExibidos(finais.current.map(() => sortear(faces)));
    setFase('rolando');
  }

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFecharRef.current();
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  useEffect(() => {
    if (fase !== 'rolando') return;

    if (prefereMovimentoReduzido()) {
      setExibidos(finais.current);
      setFase('resultado');
      return;
    }

    const troca = window.setInterval(() => {
      setExibidos(finais.current.map(() => sortear(faces)));
    }, INTERVALO_TROCA_MS);
    const fim = window.setTimeout(() => {
      window.clearInterval(troca);
      setExibidos(finais.current);
      setFase('resultado');
    }, DURACAO_ROLAGEM_MS);

    return () => {
      window.clearInterval(troca);
      window.clearTimeout(fim);
    };
  }, [fase, faces]);

  useEffect(() => {
    if (fase !== 'resultado') return;
    const espera = window.setTimeout(concluir, DURACAO_RESULTADO_MS);
    return () => window.clearTimeout(espera);
  }, [fase, concluir]);

  function aoClicarNoFundo() {
    if (fase === 'selecao') aoFechar();
    else concluir();
  }

  return createPortal(
    <div className="dados-overlay" role="dialog" aria-modal="true" aria-label="Rolagem de dados" onClick={aoClicarNoFundo}>
      {fase === 'selecao' ? (
        <div className="dados-painel" onClick={(e) => e.stopPropagation()}>
          <h2>Rolar dados</h2>

          <div className="dados-grade" role="radiogroup" aria-label="Tipo de dado">
            {FACES_DISPONIVEIS.map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={f === faces}
                aria-label={`d${f}`}
                className={`dado-opcao${f === faces ? ' ativo' : ''}`}
                onClick={() => setFaces(f)}
              >
                <DadoSvg faces={f} />
              </button>
            ))}
          </div>

          <div className="dados-quantidade">
            <button
              type="button"
              aria-label="Menos dados"
              disabled={quantidade <= 1}
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span aria-live="polite">
              {quantidade} × d{faces}
            </span>
            <button
              type="button"
              aria-label="Mais dados"
              disabled={quantidade >= MAXIMO_DADOS_POR_ROLAGEM}
              onClick={() => setQuantidade((q) => Math.min(MAXIMO_DADOS_POR_ROLAGEM, q + 1))}
            >
              +
            </button>
          </div>

          <button type="button" className="botao" onClick={iniciar} autoFocus>
            Rolar {notacao(faces, quantidade)}
          </button>
          <button type="button" className="dados-cancelar" onClick={aoFechar}>
            Cancelar
          </button>
        </div>
      ) : (
        <div className={`dados-palco ${fase}`}>
          <div className="dados-grupo">
            {exibidos.map((valor, i) => (
              <DadoSvg key={i} faces={faces} valor={valor} animando={fase === 'rolando'} pequeno={exibidos.length > 1} />
            ))}
          </div>
          {fase === 'resultado' && exibidos.length > 1 && <p className="dados-total">= {somar(exibidos)}</p>}
          <p className="so-leitor" aria-live="polite">
            {fase === 'resultado' ? descreverRolagem(faces, exibidos) : ''}
          </p>
        </div>
      )}
    </div>,
    document.body
  );
}
