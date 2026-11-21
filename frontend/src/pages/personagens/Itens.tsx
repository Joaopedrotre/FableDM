import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import Aviso from '../../components/Aviso';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import EstadoVazio from '../../components/EstadoVazio';
import LayoutPagina from '../../components/LayoutPagina';
import Paginacao from '../../components/Paginacao';
import { useLista } from '../../hooks/useLista';
import { buscarPersonagem, ErroApi, excluirItem, listarItens } from '../../services/api';
import type { Item, Personagem } from '../../types';
import CartaoItem from './components/CartaoItem';

export default function Itens() {
  const personagemId = Number(useParams().id);
  const avisoInicial = (useLocation().state as { aviso?: string } | null)?.aviso ?? '';

  const [personagem, setPersonagem] = useState<Personagem | null>(null);
  const [erroPersonagem, setErroPersonagem] = useState('');
  const lista = useLista((pagina) => listarItens(personagemId, pagina, 8), personagemId);
  const [aviso, setAviso] = useState(avisoInicial);
  const [paraExcluir, setParaExcluir] = useState<Item | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');

  useEffect(() => {
    let ativo = true;
    buscarPersonagem(personagemId)
      .then((encontrado) => {
        if (ativo) setPersonagem(encontrado);
      })
      .catch((err: unknown) => {
        if (ativo) setErroPersonagem(err instanceof ErroApi && err.message ? err.message : 'Não foi possível carregar o personagem.');
      });
    return () => {
      ativo = false;
    };
  }, [personagemId]);

  function cancelar() {
    setParaExcluir(null);
    setErroExclusao('');
  }

  async function confirmar() {
    if (!paraExcluir) return;
    setExcluindo(true);
    setErroExclusao('');
    try {
      await excluirItem(personagemId, paraExcluir.id);
      setParaExcluir(null);
      setAviso('Item excluído.');
      lista.recarregar();
    } catch (err) {
      setErroExclusao(err instanceof ErroApi && err.message ? err.message : 'Não foi possível excluir o item.');
    } finally {
      setExcluindo(false);
    }
  }

  const nomeDoPersonagem = personagem?.nome ?? 'Personagem';

  return (
    <LayoutPagina
      titulo={`Itens de ${nomeDoPersonagem}`}
      migalhas={[{ texto: 'Personagens', para: '/personagens' }, { texto: nomeDoPersonagem }, { texto: 'Itens' }]}
      acoes={
        personagem && (
          <Link to={`/personagens/${personagem.id}/itens/novo`} className="botao">
            Novo item
          </Link>
        )
      }
    >
      {erroPersonagem && (
        <>
          <Aviso tipo="erro">{erroPersonagem}</Aviso>
          <Link to="/personagens" className="botao botao-secundario">
            Voltar aos personagens
          </Link>
        </>
      )}

      {personagem && (
        <section className="resumo-personagem" aria-label="Personagem">
          <Avatar nome={personagem.nome} imagem={personagem.imagem} tamanho="grande" />
          <div>
            <h3>{personagem.nome}</h3>
            <p className="cartao-lista-texto">{personagem.descricao}</p>
          </div>
        </section>
      )}

      {aviso && <Aviso tipo="ok">{aviso}</Aviso>}
      {!erroPersonagem && lista.erro && <Aviso tipo="erro">{lista.erro}</Aviso>}

      {!erroPersonagem &&
        (lista.carregando && lista.dados.length === 0 ? (
          <p className="carregando" role="status">
            Carregando itens…
          </p>
        ) : lista.dados.length === 0 && !lista.erro ? (
          <EstadoVazio
            titulo="Nenhum item no inventário"
            texto="Adicione armas, poções e outros itens que o personagem carrega."
            acao={
              <Link to={`/personagens/${personagemId}/itens/novo`} className="botao">
                Adicionar item
              </Link>
            }
          />
        ) : (
          <div className="grade-cartoes">
            {lista.dados.map((item) => (
              <CartaoItem key={item.id} item={item} aoExcluir={setParaExcluir} />
            ))}
          </div>
        ))}

      <Paginacao pagina={lista.pagina} totalPaginas={lista.totalPaginas} aoMudar={lista.irParaPagina} />

      {paraExcluir && (
        <ConfirmarExclusao
          titulo="Excluir item?"
          confirmando={excluindo}
          erro={erroExclusao}
          aoConfirmar={confirmar}
          aoCancelar={cancelar}
        >
          <p>
            Você vai excluir <strong>{paraExcluir.nome}</strong> do inventário de {nomeDoPersonagem}. Esta ação não pode
            ser desfeita.
          </p>
        </ConfirmarExclusao>
      )}
    </LayoutPagina>
  );
}
