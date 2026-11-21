import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Cabecalho from './Cabecalho';

export interface Migalha {
  texto: string;
  para?: string;
}

interface Props {
  titulo: string;
  migalhas?: Migalha[];
  acoes?: ReactNode;
  children: ReactNode;
}

export default function LayoutPagina({ titulo, migalhas = [], acoes, children }: Props) {
  return (
    <div className="pagina-interna">
      <Cabecalho />
      <main className="conteudo">
        {migalhas.length > 0 && (
          <nav className="migalhas" aria-label="Você está em">
            {migalhas.map((migalha, indice) => (
              <span key={`${migalha.texto}-${indice}`}>
                {migalha.para ? <Link to={migalha.para}>{migalha.texto}</Link> : <span aria-current="page">{migalha.texto}</span>}
                {indice < migalhas.length - 1 && <span aria-hidden="true"> › </span>}
              </span>
            ))}
          </nav>
        )}
        <div className="topo-pagina">
          <h2>{titulo}</h2>
          {acoes && <div className="topo-acoes">{acoes}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
