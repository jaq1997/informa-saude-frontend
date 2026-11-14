import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export function ToastFeedback({
  visivel = false,
  onClose,
  titulo,
  mensagem,
  tipo = 'sucesso',
  duracao = 4000
}) {
  useEffect(() => {
    if (!visivel || duracao <= 0) return undefined;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duracao);

    return () => clearTimeout(timer);
  }, [visivel, duracao, onClose]);

  if (!visivel) return null;

  const obterEstilosTipo = () => {
    switch (tipo) {
      case 'sucesso':
        return {
          classeBg: 'text-bg-success',
          icone: <CheckCircle2 size={18} className="me-2 text-white" />
        };
      case 'erro':
      case 'error':
        return {
          classeBg: 'text-bg-danger',
          icone: <XCircle size={18} className="me-2 text-white" />
        };
      case 'alerta':
        return {
          classeBg: 'text-bg-warning text-dark',
          icone: <AlertTriangle size={18} className="me-2 text-dark" />
        };
      case 'info':
        return {
          classeBg: 'text-bg-info text-dark',
          icone: <Info size={18} className="me-2 text-dark" />
        };
      case 'neutro':
      case 'secondary':
        return {
          classeBg: 'text-bg-secondary',
          icone: <Info size={18} className="me-2 text-white" />
        };
      default:
        return {
          classeBg: 'text-bg-success',
          icone: <CheckCircle2 size={18} className="me-2 text-white" />
        };
    }
  };

  const { classeBg, icone } = obterEstilosTipo();

  return (
    <div className="toast-container is-toast-container position-fixed top-0 end-0 p-3">
      <div 
        className={`toast show ${classeBg} shadow-lg border-0 rounded-3`} 
        role={tipo === 'erro' || tipo === 'alerta' ? 'alert' : 'status'} 
        aria-live="polite" 
        aria-atomic="true"
      >
        <div className={`toast-header ${classeBg} border-bottom border-white border-opacity-25 d-flex align-items-center`}>
          {icone}
          <strong className="me-auto fs-6">{titulo || 'Notificação'}</strong>
          <button
            type="button"
            className="btn-close btn-close-white ms-2"
            onClick={onClose}
            aria-label="Fechar notificação"
          ></button>
        </div>
        {mensagem && (
          <div className="toast-body fs-6">
            {mensagem}
          </div>
        )}
      </div>
    </div>
  );
}

export default ToastFeedback;
