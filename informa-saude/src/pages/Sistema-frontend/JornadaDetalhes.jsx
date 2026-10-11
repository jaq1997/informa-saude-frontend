import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Clock } from 'lucide-react';
import { JORNADAS_DATA } from '../../data/jornadasData';
import {
  SystemNavbar,
  FooterSistemaMobile,
  BotaoSistema,
  DropdownSistema
} from '../../components';

export function JornadaDetalhes({ jornadaData: propJornada }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('episodios');

  const jornadaId = propJornada?.id || id || 'cardiaca';
  const jornada = propJornada || JORNADAS_DATA[jornadaId] || JORNADAS_DATA.cardiaca;

  const episodios = jornada.episodios || [];
  const noticias = jornada.noticias || [];

  const opcoesJornadas = [
    { valor: 'cardiaca', label: 'Jornada Cardíaca' },
    { valor: 'sono', label: 'Jornada do Sono' },
    { valor: 'respiratoria', label: 'Jornada Respiratória' },
  ];

  const outrasJornadas = Object.values(JORNADAS_DATA).filter(j => j.id !== jornadaId);

  return (
    <div className="is-jornada-page">
      <SystemNavbar />

      <section className="is-jornada-hero">
        {jornada.imagemCapa && (
          <div className="is-jornada-hero-bg">
            <div className="is-jornada-hero-img-wrapper d-none d-md-block">
              <img
                src={jornada.imagemCapa}
                alt={jornada.titulo}
                className="is-jornada-hero-img"
              />
              <div className="is-jornada-hero-overlay" />
            </div>

            <img
              src={jornada.imagemCapa}
              alt=""
              className="is-jornada-hero-mobile-img d-md-none"
            />
          </div>
        )}

        <div className="position-relative is-container py-5">
          <div className="mb-4">
            <Link to="/inicio" className="is-jornada-back-link">
              <ArrowLeft size={18} />
              <span>Voltar ao início</span>
            </Link>
          </div>

          <div className="is-jornada-hero-content">
            <h1 className="is-jornada-hero-title display-4 mb-3">
              {jornada.titulo}
            </h1>

            {jornada.subtitulo && (
              <p className="is-jornada-hero-subtitle mb-2">
                {jornada.subtitulo}
              </p>
            )}

            <p className="is-jornada-hero-desc mb-4">
              {jornada.descricao}
            </p>

            <div className="is-jornada-meta mb-4">
              <span className="text-is-orange">
                {jornada.categoriaTag || jornada.categoria || 'Saúde do coração'}
              </span>
              <span>•</span>
              <span>{jornada.totalEpisodios || episodios.length} episódios</span>
              <span>•</span>
              <span>{jornada.duracaoTotal || '30 min'}</span>
            </div>

            <BotaoSistema variante="orange">
              <Play size={18} fill="currentColor" />
              <span>{jornada.progresso > 0 ? 'Continuar jornada' : 'Iniciar jornada'}</span>
            </BotaoSistema>
          </div>
        </div>
      </section>

      <main className="is-container pt-5">
        <div className="is-jornada-tabs-nav">
          <div className="d-flex gap-4">
            {[
              { key: 'episodios', label: `Episódios ${String(episodios.length).padStart(2, '0')}` },
              { key: 'noticias', label: 'Notícias relacionadas' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setAbaAtiva(key)}
                className={`is-jornada-tab-btn ${abaAtiva === key ? 'is-active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {abaAtiva === 'episodios' && (
          <section className="mb-5">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <h4 className="fw-bold mb-1 fs-5 text-white">
                  Um cuidado de cada vez
                </h4>
                <p className="fw-medium text-white-50 fs-6 m-0">
                  Todos os episódios desta jornada
                </p>
              </div>

              <DropdownSistema
                opcoes={opcoesJornadas}
                valorAtual={jornadaId}
                onChange={(novoId) => navigate(`/jornada/${novoId}`)}
                temaEscuro={true}
              />
            </div>

            <div className="d-flex flex-column">
              {episodios.map((ep, idx) => (
                <div key={ep.id || idx} className="is-jornada-episode-item">
                  <div className="row align-items-center g-3">
                    <div className="col-auto d-none d-sm-block">
                      <span className="is-jornada-episode-number">
                        {String(ep.numero || idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="col-12 col-sm-4 col-md-3">
                      <div className="is-jornada-thumb-container">
                        <img
                          src={ep.thumb || jornada.imagemCapa}
                          alt={ep.titulo}
                          className="w-100 h-100 object-fit-cover"
                        />
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <button
                            type="button"
                            className="btn is-jornada-play-badge"
                            aria-label={`Reproduzir ${ep.titulo}`}
                          >
                            <Play size={18} fill="currentColor" className="ms-1" />
                          </button>
                        </div>
                        {ep.concluido && (
                          <div className="is-jornada-done-badge">
                            ✓ CONCLUÍDO
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col">
                      <h5 className="fw-bold mb-2 fs-6 text-white">
                        {ep.titulo}
                      </h5>
                      <p className="fw-medium mb-0 text-white-50 fs-6">
                        {ep.descricao}
                      </p>
                    </div>

                    <div className="col-12 col-md-auto d-flex flex-column align-items-md-end justify-content-center">
                      <span className="d-inline-flex align-items-center gap-1 fw-bold text-white fs-6">
                        <Clock size={16} /> {ep.duracao || '10 min'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {abaAtiva === 'noticias' && (
          <section className="mb-5">
            <div className="row g-4">
              {noticias.length > 0 ? (
                noticias.map((noticia, idx) => (
                  <div key={noticia.id || idx} className="col-12 col-md-4">
                    <div className="h-100 rounded-4 overflow-hidden d-flex flex-column shadow-sm bg-is-green">
                      <div className="position-relative overflow-hidden" style={{ height: '180px' }}>
                        <img
                          src={jornada.imagemCapa}
                          alt={noticia.titulo}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                      <div className="p-4 d-flex flex-column flex-grow-1">
                        <span className="text-uppercase fw-bold d-block mb-2 text-is-orange fs-7">
                          {noticia.categoria || 'SAÚDE'}
                        </span>
                        <h5 className="fw-bold mb-2 fs-6 text-white">
                          {noticia.titulo}
                        </h5>
                        <p className="fw-medium flex-grow-1 text-white-50 fs-6">
                          {noticia.resumo || 'Informação para complementar a sua jornada de cuidado.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="fw-bold text-white-50">
                    Notícias relacionadas em breve.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="pt-4 border-top border-secondary border-opacity-25">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <span className="text-uppercase fw-bold d-block mb-1 text-white-50 fs-7">
                CONTINUE EXPLORANDO
              </span>
              <h4 className="fw-bold mb-0 text-white fs-4">
                Outras jornadas para você
              </h4>
            </div>
          </div>

          <div className="row g-4">
            {outrasJornadas.map((j) => (
              <div key={j.id} className="col-12 col-md-6">
                <Link to={`/jornada/${j.id}`} className="is-jornada-other-card">
                  {j.imagemCapa && (
                    <img
                      src={j.imagemCapa}
                      alt={j.titulo}
                      className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                    />
                  )}
                  <div className="is-jornada-other-overlay" />
                  <div className="is-jornada-other-content">
                    <span className="text-uppercase fw-bold d-block mb-1 text-white-50 fs-7">
                      {j.episodios?.length || 0} EPISÓDIOS
                    </span>
                    <div className="d-flex align-items-center justify-content-between">
                      <h3 className="fw-bold mb-0 text-white fs-5">
                        {j.titulo}
                      </h3>
                      <button
                        type="button"
                        className="btn is-jornada-play-badge"
                        aria-label={`Ver ${j.titulo}`}
                      >
                        <Play size={18} fill="currentColor" className="ms-1" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <FooterSistemaMobile />
    </div>
  );
}

export default JornadaDetalhes;
