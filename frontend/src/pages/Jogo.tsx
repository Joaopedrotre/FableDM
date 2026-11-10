import { useRef, useState } from 'react';
import Cabecalho from '../components/Cabecalho';
import PainelCampanha from '../components/PainelCampanha';
import Chat from '../components/Chat';
import PainelPersonagem from '../components/PainelPersonagem';
import { campanhaExemplo, mensagensExemplo, personagemExemplo } from '../data/exemplo';
import { ErroApi, perguntarAoMestre } from '../services/api';
import type { Mensagem } from '../types';

const ERRO_PADRAO = 'O mestre não conseguiu responder agora. Tente novamente.';

// Tela principal: três colunas (campanha, chat e personagem).
export default function Jogo() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensExemplo);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const proximoId = useRef(mensagensExemplo.length + 1);

  async function enviar(texto: string) {
    if (carregando) return;

    const nova: Mensagem = { id: proximoId.current++, autor: 'jogador', texto };
    const historico = [...mensagens, nova];
    setMensagens(historico);
    setErro('');
    setCarregando(true);

    try {
      const { resposta } = await perguntarAoMestre(historico);
      setMensagens((atuais) => [...atuais, { id: proximoId.current++, autor: 'mestre', texto: resposta, animar: true }]);
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

  return (
    <div className="jogo">
      <Cabecalho />
      <div className="mesa-jogo">
        <PainelCampanha campanha={campanhaExemplo} />
        <Chat mensagens={mensagens} aoEnviar={enviar} carregando={carregando} erro={erro} />
        <PainelPersonagem personagem={personagemExemplo} />
      </div>
    </div>
  );
}
