import { Link } from 'react-router-dom';
import logoImagem from '../../assets/images/logo.svg';

export function Logo({
  to = '/',
  alt = 'InformaSaúde',
  tamanho = 'md',
  className = ''
}) {
  const obterClasseTamanho = () => {
    switch (tamanho) {
      case 'sm': return 'is-logo-sm';
      case 'lg': return 'is-logo-lg';
      default: return 'is-header-logo';
    }
  };

  const conteudoLogo = (
    <img
      src={logoImagem}
      alt={alt}
      className={`${obterClasseTamanho()} ${className}`}
    />
  );

  if (to) {
    return (
      <Link to={to} className="navbar-brand m-0 p-0 text-decoration-none d-flex align-items-center">
        {conteudoLogo}
      </Link>
    );
  }

  return conteudoLogo;
}

export default Logo;
