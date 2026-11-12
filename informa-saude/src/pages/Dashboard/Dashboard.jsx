import { JornadasProvider } from "../../context/JorneysContext";
import { useJornadas } from "../../context/jornadasContextStore";

import {
  SystemNavbar,
  CardDiasAprendidos,
  CardProgressoSemanal,
  XPChart,
  CardStat,
  FooterSistemaMobile,
} from "../../components";

function DashboardConteudo() {
  const { carregando, erro, atualizarDashboard } = useJornadas();

  return (
    <div className="bg-light min-vh-100 pb-5">
      <SystemNavbar />

      <main className="is-container py-4 dashboard-page">
        <header className="dashboard-heading">
          <p className="is-eyebrow">VISÃO GERAL</p>

          <h1>Confira seu Progresso</h1>

          <p>
            Acompanhe sua evolução, celebre sua constância e continue
            construindo hábitos mais saudáveis a cada jornada.
          </p>
        </header>

        {carregando ? (
          <section
            className="d-flex flex-column align-items-center justify-content-center py-5"
            role="status"
            aria-live="polite"
          >
            <div
              className="spinner-border text-success mb-3"
              aria-hidden="true"
            />

            <p className="text-muted">
              Carregando seu progresso...
            </p>
          </section>
        ) : erro ? (
          <section
            className="alert alert-danger mt-4"
            role="alert"
          >
            <h2 className="h5">
              Não foi possível carregar seu progresso
            </h2>

            <p>{erro}</p>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={atualizarDashboard}
            >
              Tentar novamente
            </button>
          </section>
        ) : (
          <section
            aria-label="Resumo do progresso"
            className="dashboard-grid"
          >
            <div className="learning-area">
              <CardDiasAprendidos />
            </div>

            <div className="weekly-area">
              <CardProgressoSemanal />
            </div>

            <div className="xp-area">
              <XPChart />
            </div>

            <div className="journeys-area">
              <CardStat type="jornadas" />
            </div>

            <div className="minutes-area">
              <CardStat type="minutos" />
            </div>
          </section>
        )}
      </main>

      <FooterSistemaMobile />
    </div>
  );
}

export default function Dashboard() {
  return (
    <JornadasProvider>
      <DashboardConteudo />
    </JornadasProvider>
  );
}
