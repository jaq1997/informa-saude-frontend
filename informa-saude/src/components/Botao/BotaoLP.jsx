export function BotaoLP({
  children,
  onClick,
  variante = 'orange',
  href,
  tamanho = 'md',
  desabilitado = false,
  tipo = 'button',
  isNav = false,
  larguraTotal = false,
  className = '',
  ariaLabel
}) {
  const baseClass = isNav ? 'is-nav-btn' : 'is-btn';
  const prefix = isNav ? 'is-nav-btn--' : 'is-btn--';

  const obterClasseVariante = () => {
    switch (variante) {
      case 'orange':
        return `${prefix}orange`;
      case 'green':
        return `${prefix}green`;
      case 'outline-white':
        return `${prefix}outline-white`;
      case 'outline-green':
        return `${prefix}outline-green`;
      default:
        return `${prefix}orange`;
    }
  };

  const classeTamanho = tamanho === 'sm' ? 'is-btn-sm' : '';
  const classes = `${baseClass} ${obterClasseVariante()} ${classeTamanho} ${larguraTotal ? 'w-100' : ''} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        className={classes}
      >
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

export default BotaoLP;
