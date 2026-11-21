import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Aviso from '../../components/Aviso';
import Campo from '../../components/Campo';
import CampoArea from '../../components/CampoArea';
import CampoSelect from '../../components/CampoSelect';
import LayoutPagina from '../../components/LayoutPagina';
import { buscarCampanha, criarCampanha, editarCampanha, ErroApi, listarPersonagens } from '../../services/api';
import type { Personagem } from '../../types';
import { validarTexto } from '../../utils/validators';

type Nome = 'nome' | 'descricao' | 'personagemId';
type Valores = Record<Nome, string>;

const regras: Record<'nome' | 'descricao', (v: Valores) => string> = {
  nome: (v) => validarTexto(v.nome, { obrigatorio: 'Informe o nome da campanha.', minimo: 2, maximo: 120 }),
  descricao: (v) => validarTexto(v.descricao, { obrigatorio: 'Informe a descrição da campanha.', maximo: 2000 }),
};

export default function CampanhaFormulario() {
  const { id } = useParams();
  const campanhaId = id === undefined ? null : Number(id);
  const editando = campanhaId !== null;
  const navigate = useNavigate();

  const [personagens, setPersonagens] = useState<Personagem[]>([]);
  const [valores, setValores] = useState<Valores>({ nome: '', descricao: '', personagemId: '' });
  const [erros, setErros] = useState<Partial<Record<Nome, string>>>({});
  const [erroApi, setErroApi] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const carregarCampanha = campanhaId === null ? Promise.resolve(null) : buscarCampanha(campanhaId);

    Promise.all([listarPersonagens(1, 50), carregarCampanha])
      .then(([pagina, campanha]) => {
        if (!ativo) return;
        setPersonagens(pagina.dados);
        if (campanha) {
          setValores({
            nome: campanha.nome,
            descricao: campanha.descricao,
            personagemId: campanha.personagemId === null ? '' : String(campanha.personagemId),
          });
        }
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
  }, [campanhaId]);

  function alterar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const nome = e.target.name as Nome;
    const novos = { ...valores, [nome]: e.target.value };
    setValores(novos);
    if (nome !== 'personagemId' && erros[nome]) setErros((atual) => ({ ...atual, [nome]: regras[nome](novos) }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroApi('');

    const novosErros = { nome: regras.nome(valores), descricao: regras.descricao(valores) };
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    const dados = {
      nome: valores.nome.trim(),
      descricao: valores.descricao.trim(),
      personagemId: valores.personagemId === '' ? null : Number(valores.personagemId),
    };
    setEnviando(true);
    try {
      if (campanhaId === null) {
        await criarCampanha(dados);
      } else {
        await editarCampanha(campanhaId, dados);
      }
      navigate('/campanhas', { state: { aviso: editando ? 'Campanha atualizada.' : 'Campanha criada.' } });
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

  const titulo = editando ? 'Editar campanha' : 'Nova campanha';

  return (
    <LayoutPagina
      titulo={titulo}
      migalhas={[{ texto: 'Campanhas', para: '/campanhas' }, { texto: titulo }]}
    >
      {carregando ? (
        <p className="carregando" role="status">
          Carregando…
        </p>
      ) : (
        <form className="formulario" onSubmit={enviar} noValidate>
          {erroApi && <Aviso tipo="erro">{erroApi}</Aviso>}

          <Campo id="nome" label="Nome da campanha" value={valores.nome} erro={erros.nome} onChange={alterar} maxLength={120} />
          <CampoArea
            id="descricao"
            label="Descrição"
            value={valores.descricao}
            erro={erros.descricao}
            onChange={alterar}
            maxLength={2000}
            placeholder="O cenário, o objetivo e o tom da aventura. O mestre usa este texto para conduzir a história."
          />

          <div>
            <CampoSelect id="personagemId" label="Personagem" value={valores.personagemId} erro={erros.personagemId} onChange={alterar}>
              <option value="">Nenhum personagem</option>
              {personagens.map((personagem) => (
                <option key={personagem.id} value={personagem.id}>
                  {personagem.nome}
                </option>
              ))}
            </CampoSelect>
            {personagens.length === 0 && (
              <p className="dica">
                Você ainda não tem personagens. <Link to="/personagens/novo">Criar um personagem</Link>
              </p>
            )}
          </div>

          <div className="formulario-acoes">
            <button type="submit" className="botao" disabled={enviando}>
              {enviando ? 'Salvando…' : 'Salvar'}
            </button>
            <Link to="/campanhas" className="botao botao-secundario">
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </LayoutPagina>
  );
}
