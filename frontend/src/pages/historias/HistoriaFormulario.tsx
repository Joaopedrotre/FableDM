import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Aviso from '../../components/Aviso';
import Campo from '../../components/Campo';
import CampoArea from '../../components/CampoArea';
import CampoSelect from '../../components/CampoSelect';
import LayoutPagina from '../../components/LayoutPagina';
import { buscarHistoria, criarHistoria, editarHistoria, ErroApi, listarCampanhas } from '../../services/api';
import type { Campanha } from '../../types';
import { validarTexto } from '../../utils/validators';

type Nome = 'campanhaId' | 'titulo' | 'resumo';
type Valores = Record<Nome, string>;

export default function HistoriaFormulario() {
  const { id } = useParams();
  const historiaId = id === undefined ? null : Number(id);
  const editando = historiaId !== null;
  const campanhaDaUrl = useSearchParams()[0].get('campanha') ?? '';
  const navigate = useNavigate();

  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [nomeDaCampanha, setNomeDaCampanha] = useState('');
  const [valores, setValores] = useState<Valores>({ campanhaId: campanhaDaUrl, titulo: '', resumo: '' });
  const [erros, setErros] = useState<Partial<Record<Nome, string>>>({});
  const [erroApi, setErroApi] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const carregar =
      historiaId === null
        ? listarCampanhas(1, 50).then((pagina) => ({ campanhas: pagina.dados, historia: null }))
        : buscarHistoria(historiaId).then((historia) => ({ campanhas: [] as Campanha[], historia }));

    carregar
      .then(({ campanhas: recebidas, historia }) => {
        if (!ativo) return;
        setCampanhas(recebidas);
        if (historia) {
          setNomeDaCampanha(historia.campanhaNome);
          setValores({ campanhaId: String(historia.campanhaId), titulo: historia.titulo, resumo: historia.resumo });
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
  }, [historiaId]);

  const regras: Record<Nome, (v: Valores) => string> = {
    campanhaId: (v) => (editando || v.campanhaId !== '' ? '' : 'Escolha uma campanha.'),
    titulo: (v) => validarTexto(v.titulo, { obrigatorio: 'Informe o título da história.', minimo: 2, maximo: 120 }),
    resumo: (v) => (v.resumo.trim().length > 1000 ? 'Use no máximo 1000 caracteres.' : ''),
  };

  function alterar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const nome = e.target.name as Nome;
    const novos = { ...valores, [nome]: e.target.value };
    setValores(novos);
    if (erros[nome]) setErros((atual) => ({ ...atual, [nome]: regras[nome](novos) }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroApi('');

    const novosErros = {
      campanhaId: regras.campanhaId(valores),
      titulo: regras.titulo(valores),
      resumo: regras.resumo(valores),
    };
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    const titulo = valores.titulo.trim();
    const resumo = valores.resumo.trim();
    setEnviando(true);
    try {
      if (historiaId === null) {
        const criada = await criarHistoria({ campanhaId: Number(valores.campanhaId), titulo, resumo });
        navigate(`/jogo/${criada.id}`);
      } else {
        await editarHistoria(historiaId, { titulo, resumo });
        navigate('/historias', { state: { aviso: 'História atualizada.' } });
      }
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

  const titulo = editando ? 'Editar história' : 'Nova história';

  return (
    <LayoutPagina titulo={titulo} migalhas={[{ texto: 'Histórias', para: '/historias' }, { texto: titulo }]}>
      {carregando ? (
        <p className="carregando" role="status">
          Carregando…
        </p>
      ) : (
        <form className="formulario" onSubmit={enviar} noValidate>
          {erroApi && <Aviso tipo="erro">{erroApi}</Aviso>}

          {editando ? (
            <Campo id="campanhaNome" label="Campanha" value={nomeDaCampanha} disabled readOnly />
          ) : (
            <div>
              <CampoSelect id="campanhaId" label="Campanha" value={valores.campanhaId} erro={erros.campanhaId} onChange={alterar}>
                <option value="">Escolha uma campanha</option>
                {campanhas.map((campanha) => (
                  <option key={campanha.id} value={campanha.id}>
                    {campanha.nome}
                  </option>
                ))}
              </CampoSelect>
              {campanhas.length === 0 && (
                <p className="dica">
                  Você ainda não tem campanhas. <Link to="/campanhas/nova">Criar uma campanha</Link>
                </p>
              )}
            </div>
          )}

          <Campo id="titulo" label="Título" value={valores.titulo} erro={erros.titulo} onChange={alterar} maxLength={120} />
          <CampoArea
            id="resumo"
            label="Resumo (opcional)"
            rows={4}
            value={valores.resumo}
            erro={erros.resumo}
            onChange={alterar}
            maxLength={1000}
            placeholder="O que já aconteceu nesta história. O mestre usa este texto como contexto."
          />
          {!editando && <p className="dica">Ao salvar, você começa a jogar esta história.</p>}

          <div className="formulario-acoes">
            <button type="submit" className="botao" disabled={enviando}>
              {enviando ? 'Salvando…' : editando ? 'Salvar' : 'Salvar e jogar'}
            </button>
            <Link to="/historias" className="botao botao-secundario">
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </LayoutPagina>
  );
}
