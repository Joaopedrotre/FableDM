import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Aviso from '../components/Aviso';
import { ErroApi, listarCampanhas, listarHistorias } from '../services/api';

export default function JogoInicio() {
  const navigate = useNavigate();
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarHistorias(1, 1)
      .then(async ({ dados }) => {
        if (!ativo) return;
        if (dados.length > 0) {
          navigate(`/jogo/${dados[0].id}`, { replace: true });
          return;
        }
        const campanhas = await listarCampanhas(1, 1);
        if (ativo) navigate(campanhas.dados.length > 0 ? '/historias/nova' : '/campanhas', { replace: true });
      })
      .catch((err: unknown) => {
        if (ativo) setErro(err instanceof ErroApi && err.message ? err.message : 'Não foi possível abrir sua aventura.');
      });
    return () => {
      ativo = false;
    };
  }, [navigate]);

  if (erro) {
    return (
      <div className="jogo-erro">
        <Aviso tipo="erro">{erro}</Aviso>
        <Link to="/campanhas" className="botao botao-secundario">
          Ir para as campanhas
        </Link>
      </div>
    );
  }

  return (
    <p className="carregando" role="status">
      Abrindo sua aventura…
    </p>
  );
}
