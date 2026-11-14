import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Gift, BookOpen, Hospital } from 'lucide-react';

import imgProgresso from '../../assets/images/acompanhe-progresso.webp';
import { JORNADAS_DATA } from '../../data/jornadasData';

import {
  SystemNavbar,
  CardSistema,
  FooterSistemaMobile,
  TituloPaginaSistema,
  TituloSecao,
} from '../../components';

import { obterNomeUsuario } from '../../utils/usuario';
import { useUser } from '../../context/userContextStore';

import {
  buscarJornadas,
  buscarAtividadesJornada,
} from '../../api/api';

const ACOES_RAPIDAS = [
  {
    id: 'jornadas',
    icone: BookOpen,
    titulo: 'Jornadas',
    href: '#jornadas',
  },
  {
    id: 'rede-publica',
    icone: Hospital,
    titulo: 'Rede Pública',
    to: '/mapa-saude',
  },
  {
    id: 'pontos',
    icone: Gift,
    titulo: 'Pontos',
    href: '/404.html',
  },
  {
    id: 'perfil',
    icone: User,
    titulo: 'Meu Perfil',
    to: '/meu-perfil',
  },
];

const JORNADAS_RECOMENDADAS = [
  {
    id: 'sono',
    imagem: JORNADAS_DATA.sono.imagemCapa,
    imagemEspelhada: JORNADAS_DATA.sono.espelharImagemCapa,
    titulo: 'Jornada do Sono',
    descricao:
      'Construa hábitos saudáveis e conheça práticas de higiene do sono para descansar melhor.',
  },
  {
    id: 'cardiaca',
    imagem: JORNADAS_DATA.cardiaca.imagemCapa,
    imagemEspelhada: JORNADAS_DATA.cardiaca.espelharImagemCapa,
    titulo: 'Jornada Cardíaca',
    descricao:
      'Aprenda como pequenos hábitos diários podem auxiliar na prevenção e no cuidado cardiovascular.',
  },
  {
    id: 'respiratoria',
    imagem: JORNADAS_DATA.respiratoria.imagemCapa,
    imagemEspelhada: JORNADAS_DATA.respiratoria.espelharImagemCapa,
    titulo: 'Jornada Respiratória',
    descricao:
      'Conheça práticas de respiração e cuidados diários para o bem-estar respiratório.',
  },
];

function calcularProgressoJornada(codigo, atividades) {
  const jornada = JORNADAS_DATA[codigo];

  if (!jornada || !Array.isArray(jornada.episodios)) {
    return 0;
  }

  const totalEpisodios = jornada.episodios.length;

  if (totalEpisodios === 0) {
    return 0;
  }

  const referenciasConcluidas = new Set(
    atividades.map((atividade) => atividade.referencia)
  );

  const totalConcluidos = jornada.episodios.filter((episodio) =>
    referenciasConcluidas.has(`${codigo}:${episodio.id}`)
  ).length;

  return Math.round((totalConcluidos / totalEpisodios) * 100);
}

export function HomeSistema() {
  const nomeUsuario = obterNomeUsuario();
  const { jornadaRecomendada } = useUser();
  const navigate = useNavigate();

  const [progressoJornadas, setProgressoJornadas] = useState({});
  const [carregandoJornadas, setCarregandoJornadas] = useState(true);
  const [erroJornadas, setErroJornadas] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarProgresso() {
      try {
        setCarregandoJornadas(true);
        setErroJornadas('');

        const jornadas = await buscarJornadas();

        if (!Array.isArray(jornadas)) {
          throw new Error('Resposta inválida ao consultar jornadas.');
        }

        const resultados = await Promise.all(
          jornadas.map(async (jornada) => {
            const atividades = await buscarAtividadesJornada(jornada.id);

            if (!Array.isArray(atividades)) {
              throw new Error(
                'Resposta inválida ao consultar atividades.'
              );
            }

            return {
              codigo: jornada.codigo,
              concluida: Boolean(jornada.concluida_em),
              progresso: calcularProgressoJornada(
                jornada.codigo,
                atividades
              ),
            };
          })
        );

        if (!ativo) return;

        const progressoPorCodigo = Object.fromEntries(
          resultados.map((resultado) => [
            resultado.codigo,
            resultado,
          ])
        );

        setProgressoJornadas(progressoPorCodigo);
      } catch (erro) {
        if (!ativo) return;

        console.error(
          'Erro ao carregar progresso das jornadas:',
          erro
        );

        setErroJornadas(
          'Não foi possível carregar o progresso das jornadas.'
        );
      } finally {
        if (ativo) {
          setCarregandoJornadas(false);
        }
      }
    }

    carregarProgresso();

    return () => {
      ativo = false;
    };
  }, []);

  const jornadasComProgresso = JORNADAS_RECOMENDADAS.map(
    (jornada) => {
      const registro = progressoJornadas[jornada.id];

      let textoBotao = 'Iniciar Jornada';

      if (registro?.concluida) {
        textoBotao = 'Revisar Jornada';
      } else if (registro) {
        textoBotao = 'Continuar Jornada';
      }

      return {
        ...jornada,
        iniciada: Boolean(registro),
        concluida: registro?.concluida ?? false,
        progresso: registro?.progresso ?? 0,
        textoBotao,
      };
    }
  );

  const jornadasEmAndamento = jornadasComProgresso.filter(
    (jornada) => jornada.iniciada && !jornada.concluida
  );

  const jornadaDestaque = jornadasComProgresso.find(
    (jornada) => jornada.id === jornadaRecomendada
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      <SystemNavbar />

      <main className="is-container py-4">
        <TituloPaginaSistema
          isBoasVindas
          nome={nomeUsuario}
          subtitulo="Acesse suas jornadas, pontos e serviços de saúde"
        />

        <section className="mb-5">
          <TituloSecao>Ações Rápidas</TituloSecao>

          <div className="row g-3">
            {ACOES_RAPIDAS.map((acao) => (
              <div
                key={acao.id}
                className="col-6 col-md-4 col-lg-3"
              >
                <CardSistema
                  isAcao
                  icone={acao.icone}
                  titulo={acao.titulo}
                  href={acao.href}
                  to={acao.to}
                />
              </div>
            ))}
          </div>
        </section>

        {jornadaDestaque ? (
          <section className="mb-5">
            <CardSistema
              isMedia
              isHero
              imagem={jornadaDestaque.imagem}
              subtitulo="Sua jornada recomendada"
              titulo={jornadaDestaque.titulo}
              descricao={jornadaDestaque.descricao}
              textoBotao={
                carregandoJornadas || erroJornadas
                  ? undefined
                  : jornadaDestaque.textoBotao
              }
              to={`/jornada/${jornadaDestaque.id}`}
              className={
                jornadaDestaque.imagemEspelhada
                  ? 'is-jornada-card--espelhada'
                  : ''
              }
            />

            {!carregandoJornadas &&
              !erroJornadas &&
              jornadaDestaque.iniciada && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-dark">
                      {jornadaDestaque.concluida
                        ? 'Jornada concluída'
                        : 'Seu progresso'}
                    </span>

                    <span className="text-muted">
                      {jornadaDestaque.progresso}%
                    </span>
                  </div>

                  <div
                    className="progress"
                    role="progressbar"
                    aria-label={`Progresso da ${jornadaDestaque.titulo}`}
                    aria-valuenow={jornadaDestaque.progresso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="progress-bar"
                      style={{
                        width: `${jornadaDestaque.progresso}%`,
                      }}
                    />
                  </div>
                </div>
              )}
          </section>
        ) : (
          <CardSistema
            isMedia
            isHero
            subtitulo="Comece por aqui"
            titulo="Escolha sua jornada"
            descricao="Responda ao questionário de preferência para receber uma sugestão de tema para começar."
            textoBotao="Responder ao questionário"
            to="/questionario"
            className="mb-5"
          />
        )}

        {!carregandoJornadas &&
          !erroJornadas &&
          jornadasEmAndamento.length > 0 && (
            <section className="mb-5">
              <TituloSecao>Continue Assistindo</TituloSecao>

              <div className="row g-3">
                {jornadasEmAndamento.map((jornada) => (
                  <div
                    key={jornada.id}
                    className="col-12 col-md-6 col-lg-4"
                  >
                    <CardSistema
                      isProgresso
                      categoria={
                        JORNADAS_DATA[jornada.id]?.categoria
                      }
                      titulo={jornada.titulo}
                      progresso={jornada.progresso}
                      to={`/jornada/${jornada.id}`}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

        <section className="mb-5" id="jornadas">
          <TituloSecao>Explore as jornadas</TituloSecao>

          <div className="row g-4">
            {jornadasComProgresso.map((jornada) => (
              <div
                key={jornada.id}
                className="col-12 col-md-6 col-lg-4"
              >
                <CardSistema
                  isMedia
                  imagem={jornada.imagem}
                  titulo={jornada.titulo}
                  textoBotao={
                    carregandoJornadas || erroJornadas
                      ? undefined
                      : jornada.textoBotao
                  }
                  to={`/jornada/${jornada.id}`}
                  className={
                    jornada.imagemEspelhada
                      ? 'is-jornada-card--espelhada'
                      : ''
                  }
                />
              </div>
            ))}
          </div>
        </section>

        {erroJornadas && (
          <p className="text-danger mb-4" role="alert">
            {erroJornadas}
          </p>
        )}

        <section>
          <CardSistema
            isMedia
            centralizado
            imagem={imgProgresso}
            titulo="Acompanhe seu progresso"
            textoBotao="Veja suas estatísticas"
            varianteBotao="outline-white"
            to="/dashboard"
            className="is-progress-card"
          />
        </section>
      </main>

      <FooterSistemaMobile />
    </div>
  );
}

export default HomeSistema;