import imgSono from '../assets/images/imagem-sono.webp';
import imgCardiaca from '../assets/images/imagem-cardiaca.webp';
import imgRespiracao from '../assets/images/imagem-respiracao.webp';

/**
 * Catálogo central de Jornadas de Saúde.
 * Alinhado com a Home do Sistema e o Design System do projeto (+PraTI).
 */
export const JORNADAS_DATA = {
  cardiaca: {
    id: 'cardiaca',
    titulo: 'Jornada Cardíaca',
    categoria: 'Hipertensão',
    descricao: 'Aprenda como pequenos hábitos diários podem auxiliar na prevenção de infarto, controle de hipertensão e muito mais!',
    imagemCapa: imgCardiaca,
    progresso: 65,
    episodios: [
      {
        id: 'ep1',
        numero: 1,
        titulo: 'Controlando o colesterol na alimentação',
        descricao: 'Dicas práticas sobre alimentação para manter os níveis de colesterol sob controle.',
        duracao: '8 min',
        concluido: true,
        thumb: imgCardiaca
      },
      {
        id: 'ep2',
        numero: 2,
        titulo: 'Hábitos diários para o controle da glicemia',
        descricao: 'Como pequenos ajustes na rotina ajudam na saúde cardiovascular e controle glicêmico.',
        duracao: '10 min',
        concluido: false,
        thumb: imgCardiaca
      },
      {
        id: 'ep3',
        numero: 3,
        titulo: 'Entendendo a Pressão Arterial',
        descricao: 'Saiba como interpretar os números da sua pressão e o impacto no dia a dia.',
        duracao: '6 min',
        concluido: false,
        thumb: imgCardiaca
      },
      {
        id: 'ep4',
        numero: 4,
        titulo: 'Exercícios leves para o coração',
        descricao: 'Atividades físicas seguras e de baixo impacto para fazer em casa.',
        duracao: '7 min',
        concluido: false,
        thumb: imgCardiaca
      }
    ]
  },

  sono: {
    id: 'sono',
    titulo: 'Jornada do Sono',
    categoria: 'Bem-estar',
    descricao: 'Descubra a higiene do sono e como acalmar a mente antes de dormir para melhorar suas noites.',
    imagemCapa: imgSono,
    progresso: 0,
    episodios: [
      {
        id: 'ep1',
        numero: 1,
        titulo: 'A Importância do Sono Reparador',
        descricao: 'O que acontece no seu corpo enquanto você dorme.',
        duracao: '5 min',
        concluido: false,
        thumb: imgSono
      },
      {
        id: 'ep2',
        numero: 2,
        titulo: 'Higiene do Sono na Prática',
        descricao: 'Como preparar o ambiente e desligar as telas antes de deitar.',
        duracao: '7 min',
        concluido: false,
        thumb: imgSono
      }
    ]
  },

  respiratoria: {
    id: 'respiratoria',
    titulo: 'Jornada Respiratória',
    categoria: 'Prevenção',
    descricao: 'Exercícios de respiração guiada, prevenção de crises respiratórias e cuidados diários.',
    imagemCapa: imgRespiracao,
    progresso: 30,
    episodios: [
      {
        id: 'ep1',
        numero: 1,
        titulo: 'Técnicas de Respiração Diagragmática',
        descricao: 'Aprenda a respirar usando o diafragma para reduzir o estresse e melhorar a oxigenação.',
        duracao: '5 min',
        concluido: true,
        thumb: imgRespiracao
      }
    ]
  }
};

export function obterJornadaPorId(id) {
  return JORNADAS_DATA[id] || JORNADAS_DATA.cardiaca;
}
