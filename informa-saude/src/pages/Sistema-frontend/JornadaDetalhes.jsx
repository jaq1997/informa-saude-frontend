import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, ExternalLink, X } from 'lucide-react';
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
  const [videoAtivoId, setVideoAtivoId] = useState(null);
  const videoDialogRef = useRef(null);
  const videoCloseButtonRef = useRef(null);
  const videoTriggerRef = useRef(null);

  const jornadaId = propJornada?.id || id || 'cardiaca';
  const jornada = propJornada || JORNADAS_DATA[jornadaId] || JORNADAS_DATA.cardiaca;
  const imagemEspelhada = jornada.espelharImagemCapa;

  const episodios = jornada.episodios || [];
  const videoAtivo = episodios.find((episodio) => episodio.id === videoAtivoId);
  useEffect(() => {
    if (!videoAtivo) return undefined;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    videoCloseButtonRef.current?.focus();

    const controlarTeclado = (event) => {
      if (event.key === 'Escape') {
        setVideoAtivoId(null);
        return;
      }

      if (event.key !== 'Tab') return;

      const elementosFocaveis = videoDialogRef.current?.querySelectorAll(
        'button:not(:disabled), a[href], iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (!elementosFocaveis?.length) return;

      const primeiroElemento = elementosFocaveis[0];
      const ultimoElemento = elementosFocaveis[elementosFocaveis.length - 1];
      const focoForaDoDialogo = !videoDialogRef.current.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === primeiroElemento || focoForaDoDialogo)) {
        event.preventDefault();
        ultimoElemento.focus();
      } else if (!event.shiftKey && (document.activeElement === ultimoElemento || focoForaDoDialogo)) {
        event.preventDefault();
        primeiroElemento.focus();
      }
    };
    window.addEventListener('keydown', controlarTeclado);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', controlarTeclado);
      if (videoTriggerRef.current?.isConnected) videoTriggerRef.current.focus();
    };
  }, [videoAtivo]);

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
                alt=""
                className={`is-jornada-hero-img ${imagemEspelhada ? 'is-jornada-hero-img--espelhada' : ''}`}
              />
              <div className="is-jornada-hero-overlay" />
            </div>

            <img
              src={jornada.imagemCapa}
              alt=""
              className={`is-jornada-hero-mobile-img d-md-none ${imagemEspelhada ? 'is-jornada-hero-img--espelhada' : ''}`}
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
              <span>Vídeos do YouTube</span>
            </div>

            <BotaoSistema
              variante="orange"
              onClick={() => {
                setVideoAtivoId(episodios[0]?.id);
                document.getElementById('jornada-episodios')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Play size={18} fill="currentColor" />
              <span>{jornada.progresso > 0 ? 'Continuar jornada' : 'Iniciar jornada'}</span>
            </BotaoSistema>
          </div>
        </div>
      </section>

      <main className="is-container pt-5">
        <section
          className="mb-5"
          id="jornada-episodios"
          aria-labelledby="jornada-episodios-titulo"
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <h2 className="is-jornada-section-title fw-bold mb-1" id="jornada-episodios-titulo">
                Um cuidado de cada vez
              </h2>
              <p className="fw-medium text-white-50 fs-6 m-0">
                Todos os {episodios.length} episódios desta jornada
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
              <article key={ep.id || idx} className="is-jornada-episode-item">
                <div className="row align-items-center g-3">
                  <div className="col-auto d-none d-sm-block">
                    <span className="is-jornada-episode-number" aria-hidden="true">
                      {String(ep.numero || idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="col-12 col-sm-4 col-md-3">
                    <div className="is-jornada-thumb-container">
                      <button
                        type="button"
                        className="is-jornada-video-thumbnail"
                        aria-haspopup="dialog"
                        onClick={(event) => {
                          videoTriggerRef.current = event.currentTarget;
                          setVideoAtivoId(ep.id);
                        }}
                        aria-label={`Reproduzir ${ep.titulo}`}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${ep.youtubeId}/mqdefault.jpg`}
                          alt=""
                          className="is-jornada-thumbnail-image"
                          onError={(event) => {
                            event.currentTarget.src = ep.thumb || jornada.imagemCapa;
                          }}
                        />
                        <span className="position-absolute top-50 start-50 translate-middle" aria-hidden="true">
                          <span className="btn is-jornada-play-badge">
                            <Play size={18} fill="currentColor" className="ms-1" />
                          </span>
                        </span>
                      </button>
                      {ep.concluido && (
                        <div className="is-jornada-done-badge">
                          ✓ CONCLUÍDO
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col">
                    <h3 className="is-jornada-episode-title">
                      {ep.titulo}
                    </h3>
                    <p className="is-jornada-episode-description">
                      {ep.descricao}
                    </p>
                    <a
                      href={`https://www.youtube.com/watch?v=${ep.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="is-jornada-youtube-link"
                    >
                      Assistir no YouTube <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

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

          <div className="is-jornada-other-links">
            {outrasJornadas.map((j) => (
              <Link
                key={j.id}
                to={`/jornada/${j.id}`}
                className="is-jornada-other-link"
              >
                {j.titulo}
              </Link>
            ))}
          </div>
        </section>
      </main>

      {videoAtivo && (
        <div
          className="is-video-modal-overlay"
          role="presentation"
          onClick={() => setVideoAtivoId(null)}
        >
          <section
            className="is-video-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="is-video-modal-title"
            onClick={(event) => event.stopPropagation()}
            ref={videoDialogRef}
          >
            <button
              type="button"
              className="is-video-modal-close"
              onClick={() => setVideoAtivoId(null)}
              ref={videoCloseButtonRef}
              aria-label="Fechar vídeo"
            >
              <X size={24} />
            </button>
            <div className="is-video-modal-player">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoAtivo.youtubeId}?autoplay=1`}
                title={videoAtivo.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <h2 className="is-video-modal-title" id="is-video-modal-title">{videoAtivo.titulo}</h2>
            <a
              href={`https://www.youtube.com/watch?v=${videoAtivo.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="is-video-modal-link"
            >
              Assistir no YouTube <ExternalLink size={16} />
            </a>
          </section>
        </div>
      )}

      <FooterSistemaMobile />
    </div>
  );
}

export default JornadaDetalhes;
