import { Logo } from '../../components';

export function Footer() {
  return (
    <footer className="is-footer-green pt-5 pb-4 mt-auto" id="contato">
      <div className="is-container">
        <div className="row g-4 justify-content-between">
          <div className="col-12 col-md-4 col-lg-3 d-flex flex-column gap-3">
            <Logo to="/" className="is-logo-white is-footer-logo" />
            <p className="text-white fs-6 lh-base mb-0">
              Informações claras, acessíveis e seguras para cuidar da sua saúde diariamente.
            </p>
          </div>

          <div className="col-6 col-md-3 col-lg-2 d-flex flex-column gap-3">
            <h3 className="fw-bold mb-0 text-white fs-6 text-uppercase" style={{ letterSpacing: '0.08em' }}>
              Navegação
            </h3>
            <nav aria-label="Navegação do rodapé">
              <ul className="list-unstyled d-flex flex-column gap-2 fs-6 mb-0">
                <li>
                  <a href="#home" className="text-white text-decoration-none">
                    Início
                  </a>
                </li>
                <li>
                  <a href="#beneficios" className="text-white text-decoration-none">
                    Benefícios
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="text-white text-decoration-none">
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-white text-decoration-none">
                    Dúvidas Frequentes
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div className="col-6 col-md-3 col-lg-3 d-flex flex-column gap-3">
            <h3 className="fw-bold mb-0 text-white fs-6 text-uppercase" style={{ letterSpacing: '0.08em' }}>
              Canais de Ajuda
            </h3>
            <div className="d-flex flex-column gap-1 fs-6 text-white">
              <p className="mb-1"><strong>SUS / Disque Saúde:</strong> 136</p>
              <p className="mb-0"><strong>SAMU:</strong> 192</p>
            </div>
          </div>

          <div className="col-12 col-md-2 col-lg-3 d-flex flex-column gap-3">
            <h3 className="fw-bold mb-0 text-white fs-6 text-uppercase" style={{ letterSpacing: '0.08em' }}>
              Projeto
            </h3>
            <div className="d-flex flex-column gap-1 fs-6 text-white">
              <p className="mb-1">Desenvolvido em React & Python</p>
              <p className="mb-0 text-white fs-6">Projeto acadêmico sem fins lucrativos</p>
            </div>
          </div>
        </div>

        <div className="border-top border-white border-opacity-25 mt-5 pt-3 text-center text-white fs-6">
          © 2026 Informa Saúde. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

export default Footer;