import { useEffect, useRef, useState } from 'react';
import { ErroApi } from '../services/api';
import type { Pagina } from '../types';

export interface Lista<T> {
  dados: T[];
  pagina: number;
  total: number;
  totalPaginas: number;
  carregando: boolean;
  erro: string;
  irParaPagina: (pagina: number) => void;
  recarregar: () => void;
}

export function useLista<T>(buscar: (pagina: number) => Promise<Pagina<T>>, chave: string | number = ''): Lista<T> {
  const buscarAtual = useRef(buscar);
  buscarAtual.current = buscar;

  const [pagina, setPagina] = useState(1);
  const [versao, setVersao] = useState(0);
  const [resultado, setResultado] = useState<Pagina<T> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    buscarAtual
      .current(pagina)
      .then((recebido) => {
        if (!ativo) return;
        if (recebido.dados.length === 0 && pagina > 1) {
          setPagina(pagina - 1);
          return;
        }
        setResultado(recebido);
        setErro('');
        setCarregando(false);
      })
      .catch((falha: unknown) => {
        if (!ativo) return;
        setErro(falha instanceof ErroApi && falha.message ? falha.message : 'Não foi possível carregar a lista.');
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [pagina, versao, chave]);

  return {
    dados: resultado?.dados ?? [],
    pagina,
    total: resultado?.total ?? 0,
    totalPaginas: resultado?.totalPaginas ?? 1,
    carregando,
    erro,
    irParaPagina: setPagina,
    recarregar: () => setVersao((atual) => atual + 1),
  };
}
