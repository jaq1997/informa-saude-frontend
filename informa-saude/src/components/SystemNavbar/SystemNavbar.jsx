import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import fotoPerfil from '../../assets/images/foto-perfil.webp';
import { BarraAcessibilidade } from '../BarraAcessibilidade/BarraAcessibilidade';
import { AvatarUsuario } from '../AvatarUsuario/AvatarUsuario';
import { Logo } from '../Logo/Logo';
import { obterNomeUsuario } from '../../utils/usuario';
import { useUser } from '../../context/UserContext';

const resolverFoto = (avatarGoogle) => {
  const fotoSalva = localStorage.getItem('informa-saude-foto-perfil');
  if (fotoSalva === 'null') return null;
  if (fotoSalva) return fotoSalva;
  return avatarGoogle || fotoPerfil;
};

export function SystemNavbar() {
  const navigate = useNavigate();
  const { usuario } = useUser();
  const nomeUsuario = obterNomeUsuario();
  const [modalSair, setModalSair] = useState(false);
  const [fotoNavbar, setFotoNavbar] = useState(() => resolverFoto(usuario?.avatar_url));

  useEffect(() => {
    const atualizarFoto = () => setFotoNavbar(resolverFoto(usuario?.avatar_url));

    window.addEventListener('storage', atualizarFoto);
    window.addEventListener('foto-perfil-atualizada', atualizarFoto);
    atualizarFoto();

    return () => {
      window.removeEventListener('storage', atualizarFoto);
      window.removeEventListener('foto-perfil-atualizada', atualizarFoto);
    };
  }, [usuario?.avatar_url]);

  const confirmarSaida = () => {
    setModalSair(false);
    navigate('/');
  };

  return (
    <>
      <BarraAcessibilidade />

      <header className="is-navbar sticky-top bg-white border-bottom shadow-sm">
        <nav className="is-container py-2 d-flex align-items-center justify-content-between">
          <Logo to="/inicio" />
          <div className="dropdown">
            <button
              type="button"
              className="is-user-menu d-flex align-items-center gap-2 border-0 bg-transparent text-nowrap"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <AvatarUsuario nome={nomeUsuario} src={fotoNavbar} tamanho="sm" />
              <span className="d-none d-sm-inline fw-bold text-dark text-nowrap">{nomeUsuario}</span>
              <ChevronDown size={18} className="flex-shrink-0 text-muted ms-1" aria-hidden="true" />
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
              <li><Link className="dropdown-item" to="/meu-perfil">Meu Perfil</Link></li>
              <li><Link className="dropdown-item" to="/editar-perfil">Editar Perfil</Link></li>
              <li><Link className="dropdown-item" to="/configuracoes">Configurações</Link></li>
              <li><a className="dropdown-item" href="/404.html">Meus pontos</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button type="button" className="dropdown-item text-danger" onClick={() => setModalSair(true)}>Sair</button>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {modalSair && (
        <div className="is-modal-overlay" onClick={() => setModalSair(false)}>
          <div
            className="bg-white rounded-4 shadow-lg border-0 position-relative is-modal-box is-modal-box-sm p-4 pt-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="navbar-sair-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3 z-3"
              onClick={() => setModalSair(false)}
              aria-label="Fechar"
            ></button>
            <h2 id="navbar-sair-modal-title" className="fw-bold text-dark fs-4 mb-2">Sair do aplicativo?</h2>
            <p className="text-muted fs-6 mb-4">
              Você precisará preencher suas credenciais ao acessar novamente.
            </p>
            <div className="is-modal-actions">
              <button type="button" className="is-btn is-btn--profile is-btn--orange fs-6" onClick={confirmarSaida}>
                Sim, sair
              </button>
              <button type="button" className="is-btn is-btn--profile is-btn--outline-green fs-6" onClick={() => setModalSair(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SystemNavbar;