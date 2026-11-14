import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TituloPaginaSistema({
  isBoasVindas = false,
  nome = 'João da Silva',
  titulo,
  subtitulo,
  linkVoltar,
  className = ''
}) {
  return (
    <>
      <div className={`mb-4 ${className}`}>
        {isBoasVindas ? (
          <h1 className="fw-bold text-dark fs-2 mb-1">
            Bem-vindo de volta, <span className="text-is-green">{nome}!</span>
          </h1>
        ) : (
          <h1 className="fw-bold text-dark fs-2 mb-1">{titulo}</h1>
        )}
        {subtitulo && <p className="text-muted fs-6 mb-0">{subtitulo}</p>}
      </div>

      {linkVoltar && (
        <div className="mb-3">
          <Link
            to={linkVoltar.to}
            className="is-link-green d-inline-flex align-items-center gap-1 fs-6"
          >
            <ArrowLeft size={18} /> {linkVoltar.texto}
          </Link>
        </div>
      )}
    </>
  );
}

export default TituloPaginaSistema;
