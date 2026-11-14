import { ArrowUpRight } from 'lucide-react';
import { BotaoLP } from '../Botao/BotaoLP';

export function CardLP({
  tipo = 'beneficio',
  variante = 'is-card-green',
  numero,
  icone: Icon,
  titulo,
  texto,
  acaoText,
  onClickAcao,
  hrefAcao,
  varianteAcao = 'outline-white',
  className = ''
}) {
  if (tipo === 'passo') {
    return (
      <article className={`card is-card-hover h-100 border-0 shadow-sm ${className}`}>
        <div className="card-body p-4 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              {numero && <span className="fw-bold text-is-orange fs-5">{numero}</span>}
              {Icon && <Icon size={24} className="text-muted" aria-hidden="true" />}
            </div>
            <h3 className="card-title fw-bold fs-5 text-dark mb-2">{titulo}</h3>
            <p className="card-text fs-6 text-muted m-0 lh-base">{texto}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`card is-card-hover h-100 border-0 shadow-sm ${variante} ${className}`}>
      <div className="card-body p-4 p-md-5 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center gap-2 mb-3">
            {Icon && <Icon size={24} aria-hidden="true" />}
            <h3 className="fw-bold fs-4 mb-0">{titulo}</h3>
          </div>
          <p className="fs-6 mb-4 me-md-4">{texto}</p>
        </div>

        {acaoText && (
          <div>
            <BotaoLP
              isNav
              variante={varianteAcao}
              onClick={onClickAcao}
              href={hrefAcao}
              className="px-3.5 py-2 fw-semibold d-inline-flex align-items-center gap-2 align-self-start"
            >
              {acaoText} <ArrowUpRight size={16} aria-hidden="true" />
            </BotaoLP>
          </div>
        )}
      </div>
    </article>
  );
}

export default CardLP;
