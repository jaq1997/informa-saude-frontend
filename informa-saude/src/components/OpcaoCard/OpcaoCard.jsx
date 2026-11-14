import { Check } from 'lucide-react';

export function OpcaoCard({
  titulo,
  descricao,
  selecionado = false,
  onClick,
  ariaLabel
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selecionado}
      aria-label={ariaLabel || titulo}
      onClick={onClick}
      className={`is-card is-opcao-card is-questionnaire-option-card text-start w-100 h-100 p-4 rounded-4 transition-all cursor-pointer d-flex flex-column justify-content-between gap-3 ${
        selecionado ? 'is-selected' : ''
      }`}
    >
      <div className="d-flex align-items-start gap-3 w-100 mb-2">
        <div className="flex-shrink-0">
          {selecionado ? (
            <div className="is-option-check-circle rounded-circle d-flex align-items-center justify-content-center">
              <Check size={16} strokeWidth={3} />
            </div>
          ) : (
            <div className="is-questionnaire-option-indicator rounded-circle" />
          )}
        </div>
        <h2 className="text-dark fs-5 mb-0">{titulo}</h2>
      </div>

      {descricao && (
        <p className="text-muted fs-6 mb-0 flex-grow-1">{descricao}</p>
      )}
    </button>
  );
}

export default OpcaoCard;
