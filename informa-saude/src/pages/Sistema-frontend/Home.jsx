import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Gift, BookOpen, Hospital } from 'lucide-react';
import imgCardiaca from '../../assets/images/imagem-cardiaca.webp';
import imgSono from '../../assets/images/imagem-sono.webp';
import imgRespiracao from '../../assets/images/imagem-respiracao.webp';
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


const ACOES_RAPIDAS = [
  { id: 'jornadas', icone: BookOpen, titulo: 'Jornadas', href: '#jornadas' },
  { id: 'rede-publica', icone: Hospital, titulo: 'Rede Pública', href: '/404.html' },
  { id: 'pontos', icone: Gift, titulo: 'Pontos', href: '/404.html' },
  { id: 'perfil', icone: User, titulo: 'Meu Perfil', to: '/meu-perfil' }
];

const CHAVE_CONTEUDOS_EM_ANDAMENTO = 'informa-saude-conteudos-em-andamento';

function obterConteudosEmAndamento(jornadaId) {
  const jornada = JORNADAS_DATA[jornadaId];
  if (!jornada) return [];

  try {
    const progressoSalvo = JSON.parse(
      localStorage.getItem(CHAVE_CONTEUDOS_EM_ANDAMENTO) || '{}'
    );
    const episodiosSalvos = progressoSalvo[jornadaId];
    if (!episodiosSalvos || typeof episodiosSalvos !== 'object' || Array.isArray(episodiosSalvos)) {
      return [];
    }

    return Object.entries(episodiosSalvos).flatMap(([episodioId, progresso]) => {
      const episodio = jornada.episodios.find(({ id }) => id === episodioId);
      if (!episodio || typeof progresso !== 'number' || progresso <= 0 || progresso >= 100) {
        return [];
      }

      return [{
        id: `${jornadaId}-${episodioId}`,
        categoria: jornada.categoria,
        titulo: episodio.titulo,
        progresso: Math.floor(progresso)
      }];
    });
  } catch (erro) {
    console.error('Não foi possível ler o progresso dos conteúdos salvos.', erro);
    return [];
  }
}

const JORNADAS_RECOMENDADAS = [
  {
    id: 'sono',
    imagem: imgSono,
    titulo: 'Jornada do Sono',
    descricao: 'Construa hábitos saudáveis e conheça práticas de higiene do sono para descansar melhor.',
    textoBotao: 'Iniciar Jornada'
  },
  {
    id: 'cardiaca',
    imagem: imgCardiaca,
    titulo: 'Jornada Cardíaca',
    descricao: 'Aprenda como pequenos hábitos diários podem auxiliar na prevenção e no cuidado cardiovascular.',
    textoBotao: 'Iniciar Jornada'
  },
  {
    id: 'respiratoria',
    imagem: imgRespiracao,
    titulo: 'Jornada Respiratória',
    descricao: 'Conheça práticas de respiração e cuidados diários para o bem-estar respiratório.',
    textoBotao: 'Iniciar Jornada'
  }
];

export function HomeSistema() {
  const nomeUsuario = obterNomeUsuario();
  const { jornadaRecomendada } = useUser();
  const navigate = useNavigate();
  const [conteudosEmAndamento] = useState(() => obterConteudosEmAndamento(jornadaRecomendada));
  const jornadaDestaque = JORNADAS_RECOMENDADAS.find(
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
              <div key={acao.id} className="col-6 col-md-4 col-lg-3">
                {acao.id === 'rede-publica' ? (
                  <div role="button" onClick={() => navigate('/mapa-saude')} style={{ cursor: 'pointer' }}>
                    <CardSistema isAcao icone={acao.icone} titulo={acao.titulo} />
                  </div>
                ) : (
                  <CardSistema isAcao icone={acao.icone} titulo={acao.titulo} href={acao.href} to={acao.to} />
                )}
              </div>
            ))}
          </div>
        </section>



        {jornadaDestaque ? (
          <CardSistema
            isMedia
            isHero
            imagem={jornadaDestaque.imagem}
            subtitulo="Sua jornada recomendada"
            titulo={jornadaDestaque.titulo}
            descricao={jornadaDestaque.descricao}
            textoBotao={jornadaDestaque.textoBotao}
            to={`/jornada/${jornadaDestaque.id}`}
            className="mb-5"
          />
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

        {conteudosEmAndamento.length > 0 && (
          <section className="mb-5">
            <TituloSecao>Continue Assistindo</TituloSecao>
            <div className="row g-3">
              {conteudosEmAndamento.map((conteudo) => (
                <div key={conteudo.id} className="col-12 col-md-6 col-lg-4">
                  <CardSistema
                    isProgresso
                    categoria={conteudo.categoria}
                    titulo={conteudo.titulo}
                    progresso={conteudo.progresso}
                    to={`/jornada/${jornadaRecomendada}`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-5" id="jornadas">
          <TituloSecao>Explore as jornadas</TituloSecao>
          <div className="row g-4">
            {JORNADAS_RECOMENDADAS.map((jornada) => (
              <div key={jornada.id} className="col-12 col-md-6 col-lg-4">
                <CardSistema
                  isMedia
                  imagem={jornada.imagem}
                  titulo={jornada.titulo}
                  textoBotao={jornada.textoBotao}
                  to={`/jornada/${jornada.id}`}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <CardSistema
            isMedia
            centralizado
            imagem={imgProgresso}
            titulo="Acompanhe seu progresso"
            textoBotao="Veja suas estatísticas"
            varianteBotao="outline-white"
            to="/dashboard"
          />
        </section>
      </main>

      <FooterSistemaMobile />
    </div>
  );
}

export default HomeSistema;