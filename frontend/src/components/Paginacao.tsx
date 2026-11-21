interface Props {
  pagina: number;
  totalPaginas: number;
  aoMudar: (pagina: number) => void;
}

const JANELA = 5;

export default function Paginacao({ pagina, totalPaginas, aoMudar }: Props) {
  if (totalPaginas <= 1) return null;

  const inicio = Math.max(1, Math.min(pagina - Math.floor(JANELA / 2), totalPaginas - JANELA + 1));
  const fim = Math.min(totalPaginas, inicio + JANELA - 1);
  const numeros = Array.from({ length: fim - inicio + 1 }, (_, indice) => inicio + indice);

  return (
    <nav className="paginacao" aria-label="Paginação">
      <button type="button" onClick={() => aoMudar(pagina - 1)} disabled={pagina <= 1}>
        Anterior
      </button>
      {numeros.map((numero) => (
        <button
          key={numero}
          type="button"
          className={numero === pagina ? 'ativa' : ''}
          aria-current={numero === pagina ? 'page' : undefined}
          aria-label={`Página ${numero}`}
          onClick={() => aoMudar(numero)}
        >
          {numero}
        </button>
      ))}
      <button type="button" onClick={() => aoMudar(pagina + 1)} disabled={pagina >= totalPaginas}>
        Próxima
      </button>
    </nav>
  );
}
