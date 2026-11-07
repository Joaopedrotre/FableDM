import { useState } from 'react';
import Cabecalho from '../components/Cabecalho';
import PainelCampanha from '../components/PainelCampanha';
import Chat from '../components/Chat';
import PainelPersonagem from '../components/PainelPersonagem';
import { campanhaExemplo, mensagensExemplo, personagemExemplo } from '../data/exemplo';
import type { Mensagem } from '../types';

// Tela principal: três colunas (campanha, chat e personagem).
export default function Jogo() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensExemplo);

  function enviar(texto: string) {
    setMensagens((atuais) => [...atuais, { id: Date.now(), autor: 'jogador', texto }]);
    // TODO: enviar a ação para a API do mestre e adicionar a resposta aqui
  }

  return (
    <div className="jogo">
      <Cabecalho />
      <div className="mesa-jogo">
        <PainelCampanha campanha={campanhaExemplo} />
        <Chat mensagens={mensagens} aoEnviar={enviar} />
        <PainelPersonagem personagem={personagemExemplo} />
      </div>
    </div>
  );
}
