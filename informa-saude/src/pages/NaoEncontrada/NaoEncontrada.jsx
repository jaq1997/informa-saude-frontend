import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { CardSistema, BotaoSistema } from '../../components';

export default function NotFound() {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center p-3">
      <CardSistema className="text-center p-4 p-md-5 border-0 shadow-sm rounded-4 bg-white col-12 col-md-8 col-lg-5">
        <div className="d-flex justify-content-center mb-3">
          <Stethoscope size={64} strokeWidth={1.75} className="text-is-green" />
        </div>

        <h1 className="fw-bold text-dark fs-3 mb-2">Página não encontrada</h1>

        <p className="text-muted fs-6 mb-4">
          Não se preocupe, isso acontece. O endereço mudou ou a página não existe mais. 
          Vamos ajudar você a voltar para o início de forma segura.
        </p>

        <Link to="/inicio" className="text-decoration-none">
          <BotaoSistema variante="green" className="fs-6 py-2 px-4 fw-bold">
            Ir para a página inicial
          </BotaoSistema>
        </Link>
      </CardSistema>
    </div>
  );
}