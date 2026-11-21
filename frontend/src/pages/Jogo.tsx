import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Aviso from '../components/Aviso';
import Cabecalho from '../components/Cabecalho';
import Chat from '../components/Chat';
import PainelCampanha from '../components/PainelCampanha';
import PainelPersonagem from '../components/PainelPersonagem';
import { enviarAcao, ErroApi, obterSessao } from '../services/api';
import type { Mensagem, SessaoJogo } from '../types';

const ERRO_PADRAO = 'O mestre não conseguiu responder agora. Tente novamente.';

export default function Jogo() {
  const campanhaId = Number(useParams().id);

  const [sessao, setSessao] = useState<SessaoJogo | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
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

    obterSessao(campanhaId)
      .then((recebida) => {
        if (!ativo) return;
        setSessao(recebida);
        setMensagens(recebida.mensagens);
        setCarregandoSessao(false);
      })
      .catch((err: unknown) => {
        if (!ativo) return;
        setErroSessao(err instanceof ErroApi && err.message ? err.message : 'Não foi possível abrir a campanha.');
        setCarregandoSessao(false);
      });

    return () => {
      ativo = false;
    };
  }, [campanhaId]);

  async function enviar(texto: string) {
    if (carregando) return;

    setMensagens((atuais) => [...atuais, { id: proximoIdLocal.current--, autor: 'jogador', texto }]);
    setErro('');
    setCarregando(true);

    try {
      const { resposta } = await enviarAcao(campanhaId, texto);
      setMensagens((atuais) => [...atuais, { ...resposta, animar: true }]);
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
          <Link to="/campanhas" className="botao botao-secundario">
            Voltar às campanhas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="jogo">
      <Cabecalho />
      <div className="mesa-jogo">
        <PainelCampanha campanha={sessao.campanha} />
        <Chat mensagens={mensagens} aoEnviar={enviar} carregando={carregando} erro={erro} />
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
