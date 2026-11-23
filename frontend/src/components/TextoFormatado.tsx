import type { Bloco, NoInline } from '../utils/markdown';

function Inline({ nos }: { nos: NoInline[] }) {
  return (
    <>
      {nos.map((no, indice) => {
        switch (no.tipo) {
          case 'texto':
            return no.valor;
          case 'quebra':
            return <br key={indice} />;
          case 'negrito':
            return (
              <strong key={indice} className="md-negrito">
                <Inline nos={no.filhos} />
              </strong>
            );
          case 'italico':
            return (
              <em key={indice}>
                <Inline nos={no.filhos} />
              </em>
            );
          case 'codigo':
            return <code key={indice}>{no.valor}</code>;
        }
      })}
    </>
  );
}

export default function TextoFormatado({ blocos }: { blocos: Bloco[] }) {
  return (
    <>
      {blocos.map((bloco, indice) => {
        switch (bloco.tipo) {
          case 'paragrafo':
            return (
              <p key={indice}>
                <Inline nos={bloco.filhos} />
              </p>
            );
          case 'titulo':
            return (
              <p key={indice} className="md-titulo">
                <Inline nos={bloco.filhos} />
              </p>
            );
          case 'citacao':
            return (
              <blockquote key={indice}>
                <Inline nos={bloco.filhos} />
              </blockquote>
            );
          case 'lista': {
            const Lista = bloco.ordenada ? 'ol' : 'ul';
            return (
              <Lista key={indice}>
                {bloco.itens.map((item, posicao) => (
                  <li key={posicao}>
                    <Inline nos={item} />
                  </li>
                ))}
              </Lista>
            );
          }
          case 'separador':
            return <hr key={indice} />;
        }
      })}
    </>
  );
}
