import { useEffect } from 'react';

export function ModalSistema({
  aberto = false,
  onClose,
  titulo,
  tamanho = 'sm',
  centralizado = false,
  perigo = false,
  children,
  className = ''
}) {
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  if (!aberto) return null;

  const obterClasseTamanho = () => {
    if (tamanho === 'sm') return 'is-modal-box-sm';
    if (tamanho === 'auto') return 'is-modal-box-auto';
    return '';
  };

  return (
    <div className="is-modal-overlay" onClick={onClose} role="presentation">
      <div
        className={`bg-white rounded-4 shadow-lg border-0 position-relative is-modal-box ${obterClasseTamanho()} p-4 ${
          centralizado ? 'text-center pt-5' : ''
        } ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo ? 'modal-sistema-titulo' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-3 z-3"
          onClick={onClose}
          aria-label="Fechar"
        />

        {titulo && (
          <h3
            id="modal-sistema-titulo"
            className={`fw-bold text-dark fs-4 mb-3 ${perigo ? 'text-danger' : ''}`}
          >
            {titulo}
          </h3>
        )}

        {children}
      </div>
    </div>
  );
}

export default ModalSistema;
