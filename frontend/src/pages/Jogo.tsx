import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Aviso from '../components/Aviso';
import Cabecalho from '../components/Cabecalho';
import Chat from '../components/Chat';
import PainelCampanha from '../components/PainelCampanha';
import PainelPersonagem from '../components/PainelPersonagem';
import { carregarMensagensAnteriores, enviarAcao, ErroApi, obterSessao } from '../services/api';
import type { Mensagem, SessaoJogo } from '../types';

const ERRO_PADRAO = 'O mestre não conseguiu responder agora. Tente novamente.';
const TAMANHO_DA_PAGINA_DE_MENSAGENS = 50;

export default function Jogo() {
  const historiaId = Number(useParams().id);

  const [sessao, setSessao] = useState<SessaoJogo | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [temAnteriores, setTemAnteriores] = useState(false);
  const [carregandoAnteriores, setCarregandoAnteriores] = useState(false);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [erroSessao, setErroSessao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const proximoIdLocal = useRef(-1);

  useEffect(() => {
    let ativo = true;
    setCarregandoSessao(true);
    setErroSessao('');
    setSessao(null);

    obterSessao(historiaId)
      .then((recebida) => {
        if (!ativo) return;
        setSessao(recebida);
        setMensagens(recebida.mensagens);
        setTemAnteriores(recebida.mensagens.length < recebida.historia.totalMensagens);
        setCarregandoSessao(false);
      })
      .catch((err: unknown) => {
        if (!ativo) return;
        setErroSessao(err instanceof ErroApi && err.message ? err.message : 'Não foi possível abrir a história.');
        setCarregandoSessao(false);
      });

    return () => {
      ativo = false;
    };
  }, [historiaId]);

  async function enviar(texto: string) {
    if (carregando) return;

    const idLocal = proximoIdLocal.current--;
    setMensagens((atuais) => [...atuais, { id: idLocal, autor: 'jogador', texto }]);
    setErro('');
    setCarregando(true);

    try {
      const { mensagem, resposta } = await enviarAcao(historiaId, texto);
      setMensagens((atuais) => [
        ...atuais.map((m) => (m.id === idLocal ? { ...m, id: mensagem.id } : m)),
        { ...resposta, animar: true },
      ]);
    } catch (err) {
      if (err instanceof ErroApi) {
        setErro(err.message || Object.values(err.campos)[0] || ERRO_PADRAO);
      } else {
        setErro(ERRO_PADRAO);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function carregarAnteriores() {
    const salvas = mensagens.filter((m) => m.id > 0);
    if (salvas.length === 0 || carregandoAnteriores) return;

    const maisAntigaId = Math.min(...salvas.map((m) => m.id));
    setCarregandoAnteriores(true);
    try {
      const { mensagens: anteriores } = await carregarMensagensAnteriores(historiaId, maisAntigaId);
      setMensagens((atuais) => [...anteriores, ...atuais]);
      setTemAnteriores(anteriores.length >= TAMANHO_DA_PAGINA_DE_MENSAGENS);
    } catch (err) {
      setErro(err instanceof ErroApi && err.message ? err.message : 'Não foi possível carregar as mensagens anteriores.');
    } finally {
      setCarregandoAnteriores(false);
    }
  }

  if (carregandoSessao) {
    return (
      <div className="jogo">
        <Cabecalho />
        <p className="carregando" role="status">
          Abrindo sua aventura…
        </p>
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="jogo">
        <Cabecalho />
        <div className="jogo-erro">
          <Aviso tipo="erro">{erroSessao}</Aviso>
          <Link to="/historias" className="botao botao-secundario">
            Voltar às histórias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="jogo">
      <Cabecalho />
      <div className="mesa-jogo">
        <PainelCampanha campanha={sessao.campanha} historia={sessao.historia} />
        <Chat
          mensagens={mensagens}
          aoEnviar={enviar}
          carregando={carregando}
          erro={erro}
          temAnteriores={temAnteriores}
          carregandoAnteriores={carregandoAnteriores}
          aoCarregarAnteriores={carregarAnteriores}
        />
        <PainelPersonagem
          campanhaId={sessao.campanha.id}
          personagem={sessao.personagem}
          itens={sessao.itens}
          totalItens={sessao.totalItens}
        />
      </div>
    </div>
  );
}
