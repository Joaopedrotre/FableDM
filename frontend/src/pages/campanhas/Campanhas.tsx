import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Aviso from '../../components/Aviso';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import EstadoVazio from '../../components/EstadoVazio';
import LayoutPagina from '../../components/LayoutPagina';
import Paginacao from '../../components/Paginacao';
import { useLista } from '../../hooks/useLista';
import { ErroApi, excluirCampanha, listarCampanhas } from '../../services/api';
import type { Campanha } from '../../types';
import CartaoCampanha from './components/CartaoCampanha';

export default function Campanhas() {
  const lista = useLista((pagina) => listarCampanhas(pagina, 6), 'campanhas');
  const avisoInicial = (useLocation().state as { aviso?: string } | null)?.aviso ?? '';
  const [aviso, setAviso] = useState(avisoInicial);
  const [paraExcluir, setParaExcluir] = useState<Campanha | null>(null);
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
      await excluirCampanha(paraExcluir.id);
      setParaExcluir(null);
      setAviso('Campanha excluída.');
      lista.recarregar();
    } catch (err) {
      setErroExclusao(err instanceof ErroApi && err.message ? err.message : 'Não foi possível excluir a campanha.');
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <LayoutPagina
      titulo="Minhas campanhas"
      migalhas={[{ texto: 'Campanhas' }]}
      acoes={
        <Link to="/campanhas/nova" className="botao">
          Nova campanha
        </Link>
      }
    >
      {aviso && <Aviso tipo="ok">{aviso}</Aviso>}
      {lista.erro && <Aviso tipo="erro">{lista.erro}</Aviso>}

      {lista.carregando && lista.dados.length === 0 ? (
        <p className="carregando" role="status">
          Carregando campanhas…
        </p>
      ) : lista.dados.length === 0 && !lista.erro ? (
        <EstadoVazio
          titulo="Nenhuma campanha ainda"
          texto="Crie uma campanha para começar sua aventura com o mestre."
          acao={
            <Link to="/campanhas/nova" className="botao">
              Criar campanha
            </Link>
          }
        />
      ) : (
        <div className="grade-cartoes">
          {lista.dados.map((campanha) => (
            <CartaoCampanha key={campanha.id} campanha={campanha} aoExcluir={setParaExcluir} />
          ))}
        </div>
      )}

      <Paginacao pagina={lista.pagina} totalPaginas={lista.totalPaginas} aoMudar={lista.irParaPagina} />

      {paraExcluir && (
        <ConfirmarExclusao
          titulo="Excluir campanha?"
          confirmando={excluindo}
          erro={erroExclusao}
          aoConfirmar={confirmar}
          aoCancelar={cancelar}
        >
          <p>
            Você vai excluir <strong>{paraExcluir.nome}</strong>. Todo o histórico da aventura será apagado e não poderá
            ser recuperado. O personagem vinculado não será excluído.
          </p>
        </ConfirmarExclusao>
      )}
    </LayoutPagina>
  );
}
