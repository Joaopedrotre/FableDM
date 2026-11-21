import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Aviso from '../../components/Aviso';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import EstadoVazio from '../../components/EstadoVazio';
import LayoutPagina from '../../components/LayoutPagina';
import Paginacao from '../../components/Paginacao';
import { useLista } from '../../hooks/useLista';
import { ErroApi, excluirPersonagem, listarPersonagens } from '../../services/api';
import type { Personagem } from '../../types';
import CartaoPersonagem from './components/CartaoPersonagem';

export default function Personagens() {
  const lista = useLista((pagina) => listarPersonagens(pagina, 6), 'personagens');
  const avisoInicial = (useLocation().state as { aviso?: string } | null)?.aviso ?? '';
  const [aviso, setAviso] = useState(avisoInicial);
  const [paraExcluir, setParaExcluir] = useState<Personagem | null>(null);
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
      await excluirPersonagem(paraExcluir.id);
      setParaExcluir(null);
      setAviso('Personagem excluído.');
      lista.recarregar();
    } catch (err) {
      setErroExclusao(err instanceof ErroApi && err.message ? err.message : 'Não foi possível excluir o personagem.');
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <LayoutPagina
      titulo="Meus personagens"
      migalhas={[{ texto: 'Personagens' }]}
      acoes={
        <Link to="/personagens/novo" className="botao">
          Novo personagem
        </Link>
      }
    >
      {aviso && <Aviso tipo="ok">{aviso}</Aviso>}
      {lista.erro && <Aviso tipo="erro">{lista.erro}</Aviso>}

      {lista.carregando && lista.dados.length === 0 ? (
        <p className="carregando" role="status">
          Carregando personagens…
        </p>
      ) : lista.dados.length === 0 && !lista.erro ? (
        <EstadoVazio
          titulo="Nenhum personagem ainda"
          texto="Crie o seu primeiro personagem para usá-lo nas campanhas."
          acao={
            <Link to="/personagens/novo" className="botao">
              Criar personagem
            </Link>
          }
        />
      ) : (
        <div className="grade-cartoes">
          {lista.dados.map((personagem) => (
            <CartaoPersonagem key={personagem.id} personagem={personagem} aoExcluir={setParaExcluir} />
          ))}
        </div>
      )}

      <Paginacao pagina={lista.pagina} totalPaginas={lista.totalPaginas} aoMudar={lista.irParaPagina} />

      {paraExcluir && (
        <ConfirmarExclusao
          titulo="Excluir personagem?"
          confirmando={excluindo}
          erro={erroExclusao}
          aoConfirmar={confirmar}
          aoCancelar={cancelar}
        >
          <p>
            Você vai excluir <strong>{paraExcluir.nome}</strong>. Todos os itens deste personagem serão excluídos e as
            campanhas que o usam ficarão sem personagem. Esta ação não pode ser desfeita.
          </p>
        </ConfirmarExclusao>
      )}
    </LayoutPagina>
  );
}
