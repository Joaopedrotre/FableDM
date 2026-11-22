import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Aviso from '../../components/Aviso';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import EstadoVazio from '../../components/EstadoVazio';
import LayoutPagina from '../../components/LayoutPagina';
import Paginacao from '../../components/Paginacao';
import { useLista } from '../../hooks/useLista';
import { ErroApi, excluirHistoria, listarHistorias } from '../../services/api';
import type { Historia } from '../../types';
import CartaoHistoria from './components/CartaoHistoria';

export default function Historias() {
  const [parametros] = useSearchParams();
  const campanhaTexto = parametros.get('campanha');
  const campanhaId = campanhaTexto !== null && Number.isInteger(Number(campanhaTexto)) && Number(campanhaTexto) > 0 ? Number(campanhaTexto) : undefined;

  const lista = useLista((pagina) => listarHistorias(pagina, 6, campanhaId), campanhaId ?? 'todas');
  const avisoInicial = (useLocation().state as { aviso?: string } | null)?.aviso ?? '';
  const [aviso, setAviso] = useState(avisoInicial);
  const [paraExcluir, setParaExcluir] = useState<Historia | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');

  function cancelar() {
    setParaExcluir(null);
    setErroExclusao('');
  }

  async function confirmar() {
    if (!paraExcluir) return;
    setExcluindo(true);
    setErroExclusao('');
    try {
      await excluirHistoria(paraExcluir.id);
      setParaExcluir(null);
      setAviso('História excluída.');
      lista.recarregar();
    } catch (err) {
      setErroExclusao(err instanceof ErroApi && err.message ? err.message : 'Não foi possível excluir a história.');
    } finally {
      setExcluindo(false);
    }
  }

  const caminhoNova = campanhaId === undefined ? '/historias/nova' : `/historias/nova?campanha=${campanhaId}`;

  return (
    <LayoutPagina
      titulo="Minhas histórias"
      migalhas={[{ texto: 'Histórias' }]}
      acoes={
        <Link to={caminhoNova} className="botao">
          Nova história
        </Link>
      }
    >
      {campanhaId !== undefined && (
        <p className="dica">
          Mostrando apenas as histórias de uma campanha. <Link to="/historias">Ver todas</Link>
        </p>
      )}
      {aviso && <Aviso tipo="ok">{aviso}</Aviso>}
      {lista.erro && <Aviso tipo="erro">{lista.erro}</Aviso>}

      {lista.carregando && lista.dados.length === 0 ? (
        <p className="carregando" role="status">
          Carregando histórias…
        </p>
      ) : lista.dados.length === 0 && !lista.erro ? (
        <EstadoVazio
          titulo="Nenhuma história ainda"
          texto="Cada história guarda todas as mensagens de uma sessão de jogo, para você retomar de onde parou."
          acao={
            <Link to={caminhoNova} className="botao">
              Criar história
            </Link>
          }
        />
      ) : (
        <div className="grade-cartoes">
          {lista.dados.map((historia) => (
            <CartaoHistoria key={historia.id} historia={historia} aoExcluir={setParaExcluir} />
          ))}
        </div>
      )}

      <Paginacao pagina={lista.pagina} totalPaginas={lista.totalPaginas} aoMudar={lista.irParaPagina} />

      {paraExcluir && (
        <ConfirmarExclusao
          titulo="Excluir história?"
          confirmando={excluindo}
          erro={erroExclusao}
          aoConfirmar={confirmar}
          aoCancelar={cancelar}
        >
          <p>
            Você vai excluir <strong>{paraExcluir.titulo}</strong> e as {paraExcluir.totalMensagens} mensagem(ns)
            salvas nela. A campanha e o personagem não serão excluídos. Esta ação não pode ser desfeita.
          </p>
        </ConfirmarExclusao>
      )}
    </LayoutPagina>
  );
}
