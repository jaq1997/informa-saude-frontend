import imgSono from '../assets/images/sleep.jpg';
import imgCardiaca from '../assets/images/cardiac-hero.jpg';
import imgRespiracao from '../assets/images/breathing.jpg';

/**
 * Catálogo central de Jornadas de Saúde.
 * Alinhado com a Home do Sistema e o Design System do projeto (+PraTI).
 */
export const JORNADAS_DATA = {
  cardiaca: {
    id: 'cardiaca',
    titulo: 'Jornada Cardíaca',
    categoria: 'Saúde do coração',
    descricao: 'Conteúdos educativos sobre saúde do coração, sinais de alerta e cuidados cardiovasculares.',
    imagemCapa: imgCardiaca,
    progresso: 0,
    episodios: [
      {
        id: 'xjea2uaogqi',
        numero: 1,
        titulo: 'Batimentos cardíacos irregulares podem ser sinal de arritmia cardíaca | DrauzioCast',
        descricao: 'Vídeo educativo sobre arritmia cardíaca.',
        youtubeId: 'XJeA2uaOgQI',
        concluido: false,
        thumb: imgCardiaca
      },
      {
        id: 'hzedusxt9cu',
        numero: 2,
        titulo: 'Como ter um coração saudável?',
        descricao: 'Conteúdo educativo sobre cuidados com a saúde do coração.',
        youtubeId: 'hZeDUSxT9cU',
        concluido: false,
        thumb: imgCardiaca
      },
      {
        id: 'tjhguf9jbzk',
        numero: 3,
        titulo: 'Doenças cardíacas crônicas | DrauzioCast',
        descricao: 'Vídeo educativo sobre doenças cardíacas crônicas.',
        youtubeId: 'TJhguf9JBZk',
        concluido: false,
        thumb: imgCardiaca
      },
      {
        id: 'qfsm6hhxu50',
        numero: 4,
        titulo: 'Dr. Drauzio Varella explica como identificar e agir diante de um infarto.',
        descricao: 'Orientações educativas para reconhecer sinais de infarto e buscar ajuda.',
        youtubeId: 'QFSm6HhXU50',
        concluido: false,
        thumb: imgCardiaca
      },
      {
        id: 'sey-ks4fb-g',
        numero: 5,
        titulo: 'Infarto (ataque cardíaco) | Dicas de Saúde',
        descricao: 'Vídeo educativo sobre infarto.',
        youtubeId: 'sEY_kS4fb-g',
        concluido: false,
        thumb: imgCardiaca
      },
      {
        id: 'spvp-cy72ui',
        numero: 6,
        titulo: 'Menopausa aumenta o risco de doenças cardiovasculares?',
        descricao: 'Conteúdo educativo sobre menopausa e saúde cardiovascular.',
        youtubeId: 'sPvp-CY72uI',
        concluido: false,
        thumb: imgCardiaca
      }
    ]
  },

  sono: {
    id: 'sono',
    titulo: 'Jornada do Sono',
    categoria: 'Bem-estar',
    descricao: 'Vídeos educativos sobre sono, hábitos e descanso em diferentes rotinas.',
    imagemCapa: imgSono,
    espelharImagemCapa: true,
    progresso: 0,
    episodios: [
      {
        id: 'lpxdrhtq91a',
        numero: 1,
        titulo: 'Como a qualidade do sono pode influenciar no surgimento de demências?',
        descricao: 'Conteúdo educativo sobre sono e saúde cerebral.',
        youtubeId: 'lPXDRHTQ91A',
        concluido: false,
        thumb: imgSono
      },
      {
        id: 'cpsjc8ozw',
        numero: 2,
        titulo: 'Hábitos que podem melhorar o seu sono',
        descricao: 'Sugestões educativas sobre hábitos relacionados ao sono.',
        youtubeId: '_cPSjc8OZ_w',
        concluido: false,
        thumb: imgSono
      },
      {
        id: '9jy4uwp38ui',
        numero: 3,
        titulo: 'É possível dormir bem trabalhando de madrugada?',
        descricao: 'Conteúdo educativo sobre sono e trabalho noturno.',
        youtubeId: '9JY4UWP38uI',
        concluido: false,
        thumb: imgSono
      }
    ]
  },

  respiratoria: {
    id: 'respiratoria',
    titulo: 'Jornada Respiratória',
    categoria: 'Saúde respiratória',
    descricao: 'Conteúdos educativos sobre doenças respiratórias, prevenção e cuidados com a respiração.',
    imagemCapa: imgRespiracao,
    espelharImagemCapa: true,
    progresso: 0,
    episodios: [
      {
        id: '8e18bbal1ac',
        numero: 1,
        titulo: 'Aumento de casos de síndrome respiratória aguda grave (SRAG)',
        descricao: 'Conteúdo educativo sobre o aumento de casos de SRAG.',
        youtubeId: '8e18bBA11Ac',
        concluido: false,
        thumb: imgRespiracao
      },
      {
        id: '7u4gu3a-x40',
        numero: 2,
        titulo: 'DPOC: 3 fatos que você precisa saber sobre essa condição respiratória grave',
        descricao: 'Vídeo educativo sobre doença pulmonar obstrutiva crônica (DPOC).',
        youtubeId: '7U4gu3a-x40',
        concluido: false,
        thumb: imgRespiracao
      },
      {
        id: 'vusjxamq-zc',
        numero: 3,
        titulo: 'Diferença entre alergia respiratória e resfriado | Coluna #116',
        descricao: 'Conteúdo educativo sobre diferenças entre alergia respiratória e resfriado.',
        youtubeId: 'VuSJXamq-Zc',
        concluido: false,
        thumb: imgRespiracao
      },
      {
        id: 'guye1ajfcpu',
        numero: 4,
        titulo: 'Proteja-se do vírus sincicial respiratório e outras doenças respiratórias',
        descricao: 'Orientações educativas sobre prevenção de doenças respiratórias.',
        youtubeId: 'GUyE1AJfCPU',
        concluido: false,
        thumb: imgRespiracao
      }
    ]
  }
};

export function obterJornadaPorId(id) {
  return JORNADAS_DATA[id] || JORNADAS_DATA.cardiaca;
}
