import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Play, Award, User } from 'lucide-react';
import { useUser } from '../../context/userContextStore';

export function FooterSistemaMobile() {
  const location = useLocation();
  const { jornadaRecomendada } = useUser();

  const isAtivo = (path) => location.pathname === path;
  const jornadaAberta = location.pathname.match(/^\/jornada\/([^/]+)$/)?.[1];
  const jornadaDestino = jornadaAberta || jornadaRecomendada || 'cardiaca';
  const jornadasAtivas = location.pathname.startsWith('/jornada/');

  return (
    <nav className="fixed-bottom bg-white border-top shadow-lg py-2 d-md-none" aria-label="Navegação inferior mobile">
      <div className="d-flex justify-content-around align-items-center text-center">
        <Link
          to="/inicio"
          className={`text-decoration-none fs-6 ${isAtivo('/inicio') ? 'text-success fw-bold' : 'text-muted'}`}
        >
          <HomeIcon size={22} className="d-block mx-auto mb-1" />
          Início
        </Link>
        <Link
          to={`/jornada/${jornadaDestino}`}
          aria-current={jornadasAtivas ? 'location' : undefined}
          className={`text-decoration-none fs-6 ${jornadasAtivas ? 'text-success fw-bold' : 'text-muted'}`}
        >
          <Play size={22} className="d-block mx-auto mb-1" />
          Jornadas
        </Link>
        <a
          href="/404.html"
          className="text-decoration-none text-muted fs-6"
        >
          <Award size={22} className="d-block mx-auto mb-1" />
          Pontos
        </a>
        <Link
          to="/meu-perfil"
          className={`text-decoration-none fs-6 ${isAtivo('/meu-perfil') ? 'text-success fw-bold' : 'text-muted'}`}
        >
          <User size={22} className="d-block mx-auto mb-1" />
          Perfil
        </Link>
      </div>
    </nav>
  );
}

export default FooterSistemaMobile;
