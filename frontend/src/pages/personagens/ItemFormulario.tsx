import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Aviso from '../../components/Aviso';
import Campo from '../../components/Campo';
import CampoArea from '../../components/CampoArea';
import LayoutPagina from '../../components/LayoutPagina';
import { buscarItem, buscarPersonagem, criarItem, editarItem, ErroApi } from '../../services/api';
import { validarQuantidade, validarTexto } from '../../utils/validators';

type Nome = 'nome' | 'descricao' | 'quantidade';
type Valores = Record<Nome, string>;

const regras: Record<Nome, (v: Valores) => string> = {
  nome: (v) => validarTexto(v.nome, { obrigatorio: 'Informe o nome do item.', maximo: 100 }),
  descricao: (v) => (v.descricao.trim().length > 500 ? 'Use no máximo 500 caracteres.' : ''),
  quantidade: (v) => validarQuantidade(v.quantidade),
};

export default function ItemFormulario() {
  const { id, itemId } = useParams();
  const personagemId = Number(id);
  const itemEditado = itemId === undefined ? null : Number(itemId);
  const editando = itemEditado !== null;
  const navigate = useNavigate();

  const [nomeDoPersonagem, setNomeDoPersonagem] = useState('Personagem');
  const [valores, setValores] = useState<Valores>({ nome: '', descricao: '', quantidade: '1' });
  const [erros, setErros] = useState<Partial<Record<Nome, string>>>({});
  const [erroApi, setErroApi] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const carregarItem = itemEditado === null ? Promise.resolve(null) : buscarItem(personagemId, itemEditado);

    Promise.all([buscarPersonagem(personagemId), carregarItem])
      .then(([personagem, item]) => {
        if (!ativo) return;
        setNomeDoPersonagem(personagem.nome);
        if (item) setValores({ nome: item.nome, descricao: item.descricao, quantidade: String(item.quantidade) });
        setCarregando(false);
      })
      .catch((err: unknown) => {
        if (!ativo) return;
        setErroApi(err instanceof ErroApi && err.message ? err.message : 'Não foi possível carregar os dados.');
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [personagemId, itemEditado]);

  function alterar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const nome = e.target.name as Nome;
    const novos = { ...valores, [nome]: e.target.value };
    setValores(novos);
    if (erros[nome]) setErros((atual) => ({ ...atual, [nome]: regras[nome](novos) }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroApi('');

    const novosErros = {
      nome: regras.nome(valores),
      descricao: regras.descricao(valores),
      quantidade: regras.quantidade(valores),
    };
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    const dados = {
      nome: valores.nome.trim(),
      descricao: valores.descricao.trim(),
      quantidade: Number(valores.quantidade),
    };
    setEnviando(true);
    try {
      if (itemEditado === null) {
        await criarItem(personagemId, dados);
      } else {
        await editarItem(personagemId, itemEditado, dados);
      }
      navigate(`/personagens/${personagemId}/itens`, { state: { aviso: editando ? 'Item atualizado.' : 'Item adicionado.' } });
    } catch (err) {
      if (err instanceof ErroApi) {
        setErros((atual) => ({ ...atual, ...err.campos }));
        setErroApi(err.message);
      } else {
        setErroApi('Não foi possível salvar. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  const titulo = editando ? 'Editar item' : 'Novo item';
  const voltar = `/personagens/${personagemId}/itens`;

  return (
    <LayoutPagina
      titulo={titulo}
      migalhas={[
        { texto: 'Personagens', para: '/personagens' },
        { texto: nomeDoPersonagem, para: voltar },
        { texto: titulo },
      ]}
    >
      {carregando ? (
        <p className="carregando" role="status">
          Carregando…
        </p>
      ) : (
        <form className="formulario" onSubmit={enviar} noValidate>
          {erroApi && <Aviso tipo="erro">{erroApi}</Aviso>}

          <Campo id="nome" label="Nome do item" value={valores.nome} erro={erros.nome} onChange={alterar} maxLength={100} />
          <CampoArea
            id="descricao"
            label="Descrição (opcional)"
            rows={3}
            value={valores.descricao}
            erro={erros.descricao}
            onChange={alterar}
            maxLength={500}
          />
          <Campo
            id="quantidade"
            label="Quantidade"
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            value={valores.quantidade}
            erro={erros.quantidade}
            onChange={alterar}
          />

          <div className="formulario-acoes">
            <button type="submit" className="botao" disabled={enviando}>
              {enviando ? 'Salvando…' : 'Salvar'}
            </button>
            <Link to={voltar} className="botao botao-secundario">
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </LayoutPagina>
  );
}
