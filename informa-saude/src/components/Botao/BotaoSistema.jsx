import React from 'react';
import { Link } from 'react-router-dom';

export function BotaoSistema({
  children,
  onClick,
  to,
  href,
  variante = 'orange',
  tamanho = 'md',
  desabilitado = false,
  tipo = 'button',
  larguraTotal = false,
  className = '',
  ariaLabel
}) {
  const obterClasseVariante = () => {
    switch (variante) {
      case 'orange':
        return 'is-btn--orange';
      case 'outline-green':
        return 'is-btn--outline-green';
      case 'outline-white':
        return 'is-btn--outline-white';
      case 'green':
        return 'is-btn--green';
      case 'danger':
        return 'btn-danger text-white';
      case 'secondary':
        return 'btn-secondary opacity-50';
      default:
        return 'is-btn--orange';
    }
  };

  const obterClasseTamanho = () => {
    if (tamanho === 'sm') return 'is-btn-sm';
    if (tamanho === 'lg') return '';
    return 'is-btn--profile';
  };

  const classes = `is-btn ${obterClasseVariante()} ${obterClasseTamanho()} ${larguraTotal ? 'w-100' : ''} ${className}`;

  if (to) {
    return (
      <Link to={to} className={`${classes} text-decoration-none d-inline-flex align-items-center justify-content-center gap-2`} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`${classes} text-decoration-none d-inline-flex align-items-center justify-content-center gap-2`} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={desabilitado}
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
    </button>
  );
}

export default BotaoSistema;
