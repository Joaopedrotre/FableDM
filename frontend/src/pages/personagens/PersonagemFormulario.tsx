import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Aviso from '../../components/Aviso';
import Campo from '../../components/Campo';
import CampoArea from '../../components/CampoArea';
import CampoImagem from '../../components/CampoImagem';
import LayoutPagina from '../../components/LayoutPagina';
import { buscarPersonagem, criarPersonagem, editarPersonagem, ErroApi } from '../../services/api';
import { validarTexto } from '../../utils/validators';

type Nome = 'nome' | 'descricao';
type Valores = Record<Nome, string>;

const regras: Record<Nome, (v: Valores) => string> = {
  nome: (v) => validarTexto(v.nome, { obrigatorio: 'Informe o nome.', minimo: 2, maximo: 100 }),
  descricao: (v) => validarTexto(v.descricao, { obrigatorio: 'Informe a descrição.', maximo: 2000 }),
};

export default function PersonagemFormulario() {
  const { id } = useParams();
  const personagemId = id === undefined ? null : Number(id);
  const editando = personagemId !== null;
  const navigate = useNavigate();

  const [valores, setValores] = useState<Valores>({ nome: '', descricao: '' });
  const [imagem, setImagem] = useState<string | null>(null);
  const [erros, setErros] = useState<Partial<Record<Nome | 'imagem', string>>>({});
  const [erroApi, setErroApi] = useState('');
  const [carregando, setCarregando] = useState(editando);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (personagemId === null) return;
    let ativo = true;
    buscarPersonagem(personagemId)
      .then((personagem) => {
        if (!ativo) return;
        setValores({ nome: personagem.nome, descricao: personagem.descricao });
        setImagem(personagem.imagem);
        setCarregando(false);
      })
      .catch((err: unknown) => {
        if (!ativo) return;
        setErroApi(err instanceof ErroApi && err.message ? err.message : 'Não foi possível carregar o personagem.');
        setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [personagemId]);

  function alterar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const nome = e.target.name as Nome;
    const novos = { ...valores, [nome]: e.target.value };
    setValores(novos);
    if (erros[nome]) setErros((atual) => ({ ...atual, [nome]: regras[nome](novos) }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroApi('');

    const novosErros = { nome: regras.nome(valores), descricao: regras.descricao(valores) };
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    const dados = { nome: valores.nome.trim(), descricao: valores.descricao.trim(), imagem };
    setEnviando(true);
    try {
      if (personagemId === null) {
        await criarPersonagem(dados);
      } else {
        await editarPersonagem(personagemId, dados);
      }
      navigate('/personagens', { state: { aviso: editando ? 'Personagem atualizado.' : 'Personagem criado.' } });
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

  const titulo = editando ? 'Editar personagem' : 'Novo personagem';

  return (
    <LayoutPagina
      titulo={titulo}
      migalhas={[{ texto: 'Personagens', para: '/personagens' }, { texto: titulo }]}
    >
      {carregando ? (
        <p className="carregando" role="status">
          Carregando…
        </p>
      ) : (
        <form className="formulario" onSubmit={enviar} noValidate>
          {erroApi && <Aviso tipo="erro">{erroApi}</Aviso>}

          <Campo id="nome" label="Nome" value={valores.nome} erro={erros.nome} onChange={alterar} maxLength={100} />
          <CampoArea
            id="descricao"
            label="Descrição"
            value={valores.descricao}
            erro={erros.descricao}
            onChange={alterar}
            maxLength={2000}
            placeholder="Aparência, história, personalidade e objetivos do personagem."
          />
          <CampoImagem nome={valores.nome} valor={imagem} aoMudar={setImagem} erro={erros.imagem} />

          <div className="formulario-acoes">
            <button type="submit" className="botao" disabled={enviando}>
              {enviando ? 'Salvando…' : 'Salvar'}
            </button>
            <Link to="/personagens" className="botao botao-secundario">
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </LayoutPagina>
  );
}
