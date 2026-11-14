import { ChevronDown } from 'lucide-react';

export function AccordionItem({
  id,
  titulo,
  pergunta,
  children,
  resposta,
  aberto = false,
  onToggle,
  icone: Icon,
  className = ''
}) {
  const itemTitulo = titulo || pergunta;
  const itemConteudo = children || resposta;
  const buttonId = `accordion-btn-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div className={`accordion-item border-0 rounded-3 overflow-hidden shadow-sm mb-3 ${className}`}>
      <h3 className="m-0 p-0 fs-6">
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          className={`accordion-button is-custom-accordion-btn ${aberto ? '' : 'collapsed'} fw-semibold text-dark fs-6 py-3 px-4 d-flex align-items-center justify-content-between gap-2`}
          aria-expanded={aberto}
          aria-controls={panelId}
        >
          <div className="d-flex align-items-center gap-2 me-2">
            {Icon && <Icon size={20} className="text-is-green flex-shrink-0" aria-hidden="true" />}
            <span>{itemTitulo}</span>
          </div>

          <ChevronDown
            size={20}
            className={`is-accordion-chevron flex-shrink-0 ms-2 ${aberto ? 'is-open' : ''}`}
            aria-hidden="true"
          />
        </button>
      </h3>

      <div
        id={panelId}
        className={`accordion-collapse collapse ${aberto ? 'show' : ''}`}
        aria-labelledby={buttonId}
        role="region"
      >
        <div className="accordion-body text-muted fs-6 py-3 px-4 lh-base border-top">
          {itemConteudo}
        </div>
      </div>
    </div>
  );
}

export default AccordionItem;
