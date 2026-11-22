import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Aviso from '../../components/Aviso';
import { ErroApi, listarHistorias } from '../../services/api';

export default function ContinuarCampanha() {
  const campanhaId = Number(useParams().id);
  const navigate = useNavigate();
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarHistorias(1, 1, campanhaId)
      .then(({ dados }) => {
        if (!ativo) return;
        navigate(dados.length > 0 ? `/jogo/${dados[0].id}` : `/historias/nova?campanha=${campanhaId}`, { replace: true });
      })
      .catch((err: unknown) => {
        if (ativo) setErro(err instanceof ErroApi && err.message ? err.message : 'Não foi possível abrir a campanha.');
      });
    return () => {
      ativo = false;
    };
  }, [campanhaId, navigate]);

  if (erro) {
    return (
      <div className="jogo-erro">
        <Aviso tipo="erro">{erro}</Aviso>
        <Link to="/campanhas" className="botao botao-secundario">
          Voltar às campanhas
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
