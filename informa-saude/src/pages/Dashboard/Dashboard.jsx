import { useNavigate } from 'react-router-dom';
import { JornadasProvider } from '../../context/JorneysContext';
import {
  SystemNavbar,
  CardDiasAprendidos,
  CardProgressoSemanal,
  XPChart,
  CardStat,
  FooterSistemaMobile
} from '../../components';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <JornadasProvider>
      <div className='bg-light min-vh-100 pb-5'>
        <SystemNavbar />
        
        <main className='is-container py-4 dashboard-page'>
          <header className="dashboard-heading">
            <p className="is-eyebrow">VISÃO GERAL</p>
            <h1>Confira seu Progresso</h1>
            <p>Acompanhe sua evolução, celebre sua constância e continue construindo hábitos mais saudáveis a cada jornada.</p>
          </header>
          <section aria-label="Resumo do progresso" className='dashboard-grid'>
            <div className='learning-area'><CardDiasAprendidos /></div>
            <div className='weekly-area'><CardProgressoSemanal/></div>
            <div className="xp-area"><XPChart /></div>
            <div className="journeys-area"><CardStat type="jornadas" /></div>
            <div className="minutes-area"><CardStat type="minutos" /></div>
          </section>
        </main>

        <FooterSistemaMobile />
      </div>
    </JornadasProvider>
  );
}