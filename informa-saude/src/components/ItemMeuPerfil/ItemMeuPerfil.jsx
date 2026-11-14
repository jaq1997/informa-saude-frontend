import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';


export function ItemMeuPerfil({
  icone,
  titulo,
  descricao,
  to,
  onClick,
  perigo = false,
  desabilitado = false,
}) {
  const conteudoInner = (
    <>
      <div className="is-profile-option-content text-start">
        {icone && (
          <div className="is-icon-chip mb-0 rounded-circle is-profile-icon">
            {icone}
          </div>
        )}
        <div className="is-profile-option-copy">
          <span className={`is-profile-option-title fw-bold d-block ${perigo ? 'text-danger' : 'text-dark'}`}>
            {titulo}
          </span>
          {descricao && (
            <span className="is-profile-option-description text-muted d-block">{descricao}</span>
          )}
        </div>
      </div>
      {!desabilitado && (
        <ChevronRight size={22} className="text-muted ms-2 mt-1 flex-shrink-0" />
      )}
    </>
  );

  const classeBase = `is-profile-option d-flex align-items-start justify-content-between p-3 rounded-3 bg-light text-decoration-none text-dark border w-100 text-start transition-all ${perigo ? 'is-danger' : ''} ${desabilitado ? 'opacity-75 cursor-default' : ''}`;

  if (to && !desabilitado) {
    return (
      <Link to={to} className={classeBase}>
        {conteudoInner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={desabilitado ? undefined : onClick}
      disabled={desabilitado}
      className={classeBase}
    >
      {conteudoInner}
    </button>
  );
}

export default ItemMeuPerfil;
