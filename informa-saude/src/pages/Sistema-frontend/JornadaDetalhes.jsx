import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, ExternalLink, X } from 'lucide-react';
import { JORNADAS_DATA } from '../../data/jornadasData';
import {
  buscarJornadas,
  buscarAtividadesJornada,
  iniciarJornada,
  registrarAtividade
} from '../../api/api';
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
  const [jornadaRegistrada, setJornadaRegistrada] = useState(null);
  const [atividadesConcluidas, setAtividadesConcluidas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [episodioProcessando, setEpisodioProcessando] = useState(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const videoDialogRef = useRef(null);
  const videoCloseButtonRef = useRef(null);
  const videoTriggerRef = useRef(null);
  const requisicaoAtualRef = useRef(0);

  const codigoJornada = id || propJornada?.id || 'cardiaca';
  const jornada = JORNADAS_DATA[codigoJornada] || propJornada || JORNADAS_DATA.cardiaca;
  const imagemEspelhada = jornada.espelharImagemCapa;
  const episodios = jornada.episodios || [];

  const videoAtivo = episodios.find(
    (episodio) => episodio.id === videoAtivoId
  );

  const referenciasConcluidas = new Set(
    atividadesConcluidas.map((atividade) => atividade.referencia)
  );

  const totalConcluidos = episodios.filter(
    (episodio) =>
      referenciasConcluidas.has(`${codigoJornada}:${episodio.id}`)
  ).length;

  const progresso = episodios.length
    ? Math.round((totalConcluidos / episodios.length) * 100)
    : 0;

  const jornadaConcluida = Boolean(jornadaRegistrada?.concluida_em);

  useEffect(() => {
    const requisicao = ++requisicaoAtualRef.current;
    let ativo = true;

    setVideoAtivoId(null);
    setJornadaRegistrada(null);
    setAtividadesConcluidas([]);
    setCarregando(true);
    setProcessando(false);
    setEpisodioProcessando(null);
    setErro('');
    setMensagem('');

    async function carregarProgresso() {
      try {
        const jornadas = await buscarJornadas();

        if (!ativo || requisicao !== requisicaoAtualRef.current) {
          return;
        }

        const encontrada = jornadas.find(
          (item) => item.codigo === codigoJornada
        );

        if (!encontrada) {
          return;
        }

        const atividades = await buscarAtividadesJornada(encontrada.id);

        if (!ativo || requisicao !== requisicaoAtualRef.current) {
          return;
        }

        setJornadaRegistrada(encontrada);
        setAtividadesConcluidas(atividades);
      } catch (error) {
        if (ativo && requisicao === requisicaoAtualRef.current) {
          setErro(error.message || 'Não foi possível carregar a jornada.');
        }
      } finally {
        if (ativo && requisicao === requisicaoAtualRef.current) {
          setCarregando(false);
        }
      }
    }

    carregarProgresso();

    return () => {
      ativo = false;
    };
  }, [codigoJornada]);

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

      const focoForaDoDialogo = !videoDialogRef.current.contains(
        document.activeElement
      );

      if (
        event.shiftKey &&
        (document.activeElement === primeiroElemento || focoForaDoDialogo)
      ) {
        event.preventDefault();
        ultimoElemento.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === ultimoElemento || focoForaDoDialogo)
      ) {
        event.preventDefault();
        primeiroElemento.focus();
      }
    };

    window.addEventListener('keydown', controlarTeclado);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', controlarTeclado);

      if (videoTriggerRef.current?.isConnected) {
        videoTriggerRef.current.focus();
      }
    };
  }, [videoAtivo]);

  async function atualizarProgresso(jornadaId, codigoEsperado) {
    const [jornadas, atividades] = await Promise.all([
      buscarJornadas(),
      buscarAtividadesJornada(jornadaId)
    ]);

    if (codigoEsperado !== codigoJornada) return;

    const atualizada = jornadas.find(
      (item) => item.id === jornadaId
    );

    if (atualizada) {
      setJornadaRegistrada(atualizada);
    }

    setAtividadesConcluidas(atividades);
  }

  async function iniciarOuContinuarJornada() {
    if (carregando || processando) return;

    setErro('');
    setMensagem('');
    setProcessando(true);

    const codigoAtual = codigoJornada;

    try {
      let registro = jornadaRegistrada;

      if (!registro) {
        try {
          registro = await iniciarJornada(
            codigoAtual,
            jornada.titulo
          );
        } catch (error) {
          if (error.status !== 409) {
            throw error;
          }

          const jornadas = await buscarJornadas();

          registro = jornadas.find(
            (item) => item.codigo === codigoAtual
          );

          if (!registro) {
            throw error;
          }
        }
      }

      if (codigoAtual !== codigoJornada) return;

      setJornadaRegistrada(registro);

      await atualizarProgresso(registro.id, codigoAtual);

      if (codigoAtual !== codigoJornada) return;

      const primeiroPendente = episodios.find(
        (episodio) =>
          !referenciasConcluidas.has(
            `${codigoAtual}:${episodio.id}`
          )
      );

      const episodioParaAbrir = primeiroPendente || episodios[0];

      if (episodioParaAbrir) {
        videoTriggerRef.current = document.activeElement;
        setVideoAtivoId(episodioParaAbrir.id);
      }

      document.getElementById('jornada-episodios')?.scrollIntoView({
        behavior: 'smooth'
      });
    } catch (error) {
      if (codigoAtual === codigoJornada) {
        setErro(error.message || 'Não foi possível iniciar a jornada.');
      }
    } finally {
      if (codigoAtual === codigoJornada) {
        setProcessando(false);
      }
    }
  }

  async function concluirEpisodio(episodio) {
    if (
      carregando ||
      processando ||
      episodioProcessando !== null ||
      jornadaConcluida
    ) {
      return;
    }

    const referencia = `${codigoJornada}:${episodio.id}`;

    if (referenciasConcluidas.has(referencia)) {
      return;
    }

    const codigoAtual = codigoJornada;

    setErro('');
    setMensagem('');
    setEpisodioProcessando(episodio.id);

    try {
      let registro = jornadaRegistrada;

      if (!registro) {
        try {
          registro = await iniciarJornada(
            codigoAtual,
            jornada.titulo
          );
        } catch (error) {
          if (error.status !== 409) {
            throw error;
          }

          const jornadas = await buscarJornadas();

          registro = jornadas.find(
            (item) => item.codigo === codigoAtual
          );

          if (!registro) {
            throw error;
          }
        }

        if (codigoAtual !== codigoJornada) return;

        setJornadaRegistrada(registro);
      }

      try {
        await registrarAtividade(
          registro.id,
          codigoAtual,
          episodio.id
        );
      } catch (error) {
        if (error.status !== 409) {
          throw error;
        }
      }

      await atualizarProgresso(registro.id, codigoAtual);

      if (codigoAtual !== codigoJornada) return;

      setMensagem('Progresso atualizado com sucesso!');
    } catch (error) {
      if (codigoAtual === codigoJornada) {
        setErro(error.message || 'Não foi possível concluir a aula.');
      }
    } finally {
      if (codigoAtual === codigoJornada) {
        setEpisodioProcessando(null);
      }
    }
  }

  const opcoesJornadas = [
    { valor: 'cardiaca', label: 'Jornada Cardíaca' },
    { valor: 'sono', label: 'Jornada do Sono' },
    { valor: 'respiratoria', label: 'Jornada Respiratória' }
  ];

  const outrasJornadas = Object.values(JORNADAS_DATA).filter(
    (item) => item.id !== codigoJornada
  );

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
                className={`is-jornada-hero-img ${
                  imagemEspelhada ? 'is-jornada-hero-img--espelhada' : ''
                }`}
              />
              <div className="is-jornada-hero-overlay" />
            </div>

            <img
              src={jornada.imagemCapa}
              alt=""
              className={`is-jornada-hero-mobile-img d-md-none ${
                imagemEspelhada ? 'is-jornada-hero-img--espelhada' : ''
              }`}
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
                {jornada.categoriaTag ||
                  jornada.categoria ||
                  'Saúde do coração'}
              </span>
              <span>•</span>
              <span>
                {jornada.totalEpisodios || episodios.length} episódios
              </span>
              <span>•</span>
              <span>Vídeos do YouTube</span>
            </div>

            <div className="mb-4" aria-live="polite">
              <p className="text-white mb-2">
                {carregando
                  ? 'Carregando progresso...'
                  : `${totalConcluidos} de ${episodios.length} aulas concluídas — ${progresso}%`}
              </p>

              <div
                className="progress"
                role="progressbar"
                aria-label="Progresso da jornada"
                aria-valuenow={progresso}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>

            {jornadaConcluida && (
              <p className="text-success fw-bold" role="status">
                Jornada concluída!
              </p>
            )}

            {erro && (
              <p className="text-danger fw-medium" role="alert">
                {erro}
              </p>
            )}

            {mensagem && (
              <p className="text-success fw-medium" role="status">
                {mensagem}
              </p>
            )}

            <BotaoSistema
              variante="orange"
              onClick={iniciarOuContinuarJornada}
              disabled={carregando || processando}
            >
              <Play size={18} fill="currentColor" />
              <span>
                {processando
                  ? 'Aguarde...'
                  : jornadaConcluida
                    ? 'Rever jornada'
                    : jornadaRegistrada
                      ? 'Continuar jornada'
                      : 'Iniciar jornada'}
              </span>
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
              <h2
                className="is-jornada-section-title fw-bold mb-1"
                id="jornada-episodios-titulo"
              >
                Um cuidado de cada vez
              </h2>
              <p className="fw-medium text-white-50 fs-6 m-0">
                Todos os {episodios.length} episódios desta jornada
              </p>
            </div>

            <DropdownSistema
              opcoes={opcoesJornadas}
              valorAtual={codigoJornada}
              onChange={(novoId) => navigate(`/jornada/${novoId}`)}
              temaEscuro={true}
            />
          </div>

          <div className="d-flex flex-column">
            {episodios.map((ep, idx) => {
              const concluido = referenciasConcluidas.has(
                `${codigoJornada}:${ep.id}`
              );

              const salvando = episodioProcessando === ep.id;

              return (
                <article
                  key={ep.id || idx}
                  className="is-jornada-episode-item"
                >
                  <div className="row align-items-center g-3">
                    <div className="col-auto d-none d-sm-block">
                      <span
                        className="is-jornada-episode-number"
                        aria-hidden="true"
                      >
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
                              const imagemAlternativa =
                                ep.thumb || jornada.imagemCapa;

                              if (
                                imagemAlternativa &&
                                event.currentTarget.src !== imagemAlternativa
                              ) {
                                event.currentTarget.src = imagemAlternativa;
                              }
                            }}
                          />

                          <span
                            className="position-absolute top-50 start-50 translate-middle"
                            aria-hidden="true"
                          >
                            <span className="btn is-jornada-play-badge">
                              <Play
                                size={18}
                                fill="currentColor"
                                className="ms-1"
                              />
                            </span>
                          </span>
                        </button>

                        {concluido && (
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
                        Assistir no YouTube
                        <ExternalLink
                          size={14}
                          aria-hidden="true"
                        />
                      </a>

                      <div className="mt-3">
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            concluido
                              ? 'btn-outline-success'
                              : 'btn-outline-warning'
                          }`}
                          onClick={() => concluirEpisodio(ep)}
                          disabled={
                            carregando ||
                            processando ||
                            episodioProcessando !== null ||
                            concluido ||
                            jornadaConcluida
                          }
                        >
                          {concluido
                            ? '✓ Aula concluída'
                            : salvando
                              ? 'Salvando...'
                              : 'Marcar como concluída'}
                        </button>

                        {!concluido && (
                          <span className="text-white-50 ms-2 small">
                            +10 XP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
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
            {outrasJornadas.map((item) => (
              <Link
                key={item.id}
                to={`/jornada/${item.id}`}
                className="is-jornada-other-link"
              >
                {item.titulo}
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

            <h2
              className="is-video-modal-title"
              id="is-video-modal-title"
            >
              {videoAtivo.titulo}
            </h2>

            <a
              href={`https://www.youtube.com/watch?v=${videoAtivo.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="is-video-modal-link"
            >
              Assistir no YouTube
              <ExternalLink size={16} />
            </a>
          </section>
        </div>
      )}

      <FooterSistemaMobile />
    </div>
  );
}

export default JornadaDetalhes;
