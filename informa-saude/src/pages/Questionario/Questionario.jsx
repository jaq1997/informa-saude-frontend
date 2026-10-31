import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { BarraAcessibilidade, BotaoSistema, OpcaoCard, Logo } from '../../components';
import { useUser } from '../../context/userContextStore';

export function Questionario() {
  const navigate = useNavigate();
  const { atualizarJornada } = useUser();

  const [perguntas, setPerguntas] = useState([]);
  const [erroCarregamento, setErroCarregamento] = useState('');
  const [telaBoasVindas, setTelaBoasVindas] = useState(true);
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [isConcluindo, setIsConcluindo] = useState(false);
  const [erroConclusao, setErroConclusao] = useState('');
  const [jornadaRecomendada, setJornadaRecomendada] = useState(null);
  const [jornadasEmpatadas, setJornadasEmpatadas] = useState([]);
  const [aguardandoDesempate, setAguardandoDesempate] = useState(false);
  const [jornadaEscolhidaDesempate, setJornadaEscolhidaDesempate] = useState(null);
  const [avisoPersistencia, setAvisoPersistencia] = useState('');

  useEffect(() => {
    let cancelada = false;

    const carregarPerguntas = async () => {
      try {
        const resposta = await fetch(`${API_BASE_URL}/api/questionario/perguntas`);
        if (!resposta.ok) {
          throw new Error(`Falha ao carregar o questionário (HTTP ${resposta.status}).`);
        }

        const perguntasCarregadas = await resposta.json();
        if (!Array.isArray(perguntasCarregadas) || perguntasCarregadas.length === 0) {
          throw new Error('O questionário não possui perguntas disponíveis.');
        }

        if (!cancelada) setPerguntas(perguntasCarregadas);
      } catch (erro) {
        if (!cancelada) {
          setErroCarregamento(
            erro instanceof Error
              ? erro.message
              : 'Não foi possível carregar as perguntas do questionário.'
          );
        }
      }
    };

    carregarPerguntas();
    return () => {
      cancelada = true;
    };
  }, []);

  const perguntaAtual = perguntas[etapaAtual];
  const opcaoSelecionada = perguntaAtual ? respostas[perguntaAtual.id] : null;
  const percentualProgresso = perguntas.length
    ? ((etapaAtual + 1) / perguntas.length) * 100
    : 0;

  const handleSelecionarOpcao = (opcaoId) => {
    setRespostas(prev => ({
      ...prev,
      [perguntaAtual.id]: opcaoId
    }));
  };

  const concluirQuestionario = async (jornadaEscolhida = null) => {
    setErroConclusao('');
    setIsConcluindo(true);
    let usuarioId;
    try {
      const usuario = JSON.parse(localStorage.getItem('informa-saude-usuario-ativo') || 'null');
      const id = Number(usuario?.usuario_id);
      if (Number.isSafeInteger(id) && id > 0) usuarioId = id;
    } catch (erro) {
      console.warn('Não foi possível ler o ID da conta ativa.', erro);
    }

    try {
      const payload = {
        usuario_id: usuarioId ?? null,
        respostas: Object.fromEntries(
          Object.entries(respostas).map(([id, opcaoId]) => [String(id), opcaoId])
        ),
        jornada_escolhida: jornadaEscolhida
      };
      const res = await fetch(`${API_BASE_URL}/api/questionario/resultado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(payload)
      });

      const dados = await res.json();
      if (!res.ok) {
        throw new Error(dados.detail || 'Não foi possível processar suas respostas.');
      }

      if (dados.empate && !jornadaEscolhida) {
        setJornadasEmpatadas(dados.jornadas_empatadas);
        setAguardandoDesempate(true);
        setAvisoPersistencia('');
        return;
      }

      if (!dados.jornada_recomendada) {
        throw new Error('O servidor não retornou uma jornada recomendada.');
      }

      setJornadaRecomendada(dados.jornada_recomendada);
      setJornadasEmpatadas(dados.jornadas_empatadas || []);
      setAguardandoDesempate(false);
      setAvisoPersistencia(
        dados.persistido ? '' : 'Sua recomendação foi calculada, mas não foi salva na conta porque ela ainda não tem ID no servidor.'
      );
      atualizarJornada(dados.jornada_recomendada);
    } catch (erro) {
      setErroConclusao(
        erro instanceof Error ? erro.message : 'Não foi possível conectar ao servidor para calcular o resultado.'
      );
    }
  };

  const handleEscolherJornada = async (jornada) => {
    setJornadaEscolhidaDesempate(jornada);
    await concluirQuestionario(jornada);
  };

  const handleAvancar = async () => {
    if (etapaAtual < perguntas.length - 1) {
      setEtapaAtual(prev => prev + 1);
      return;
    }

    setIsConcluindo(true);
    setJornadaEscolhidaDesempate(null);
    await concluirQuestionario();
  };

  const handleVoltar = () => {
    if (etapaAtual > 0) {
      setEtapaAtual(prev => prev - 1);
    } else {
      setTelaBoasVindas(true);
    }
  };

  const nomesJornadas = {
    cardiaca: 'Jornada Cardíaca',
    sono: 'Jornada do Sono',
    respiratoria: 'Jornada Respiratória'
  };

  if (erroCarregamento || perguntas.length === 0) {
    return (
      <div className="is-questionnaire min-vh-100 d-flex flex-column justify-content-center align-items-center p-4">
        <div className="is-questionnaire-panel p-4 text-center">
          {erroCarregamento ? (
            <>
              <h1 className="is-questionnaire-heading mb-2">Não foi possível abrir o questionário</h1>
              <p className="is-questionnaire-copy mb-4" role="alert">{erroCarregamento}</p>
              <BotaoSistema variante="outline-green" onClick={() => navigate('/inicio')}>
                Voltar para o início
              </BotaoSistema>
            </>
          ) : (
            <>
              <Loader2 size={40} className="is-questionnaire-spinner spin mb-3" aria-hidden="true" />
              <p className="is-questionnaire-copy mb-0">Carregando as perguntas...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isConcluindo) {
    return (
      <div className="is-questionnaire min-vh-100 d-flex flex-column justify-content-center align-items-center p-4">
        <div className="is-questionnaire-panel p-4 p-md-5 text-center">
          {erroConclusao ? (
            <div>
              <h2 className="is-questionnaire-heading mb-3">Não foi possível calcular o resultado</h2>
              <p className="is-questionnaire-copy mb-4" role="alert">{erroConclusao}</p>
              <BotaoSistema
                variante="orange"
                className="is-questionnaire-button"
                onClick={() => concluirQuestionario(jornadaEscolhidaDesempate)}
              >
                Tentar novamente
              </BotaoSistema>
            </div>
          ) : aguardandoDesempate ? (
            <div>
              <h2 className="is-questionnaire-heading mb-3">Suas respostas empataram</h2>
              <p className="is-questionnaire-copy mb-4">
                Suas respostas indicam interesse em mais de uma jornada. Escolha por qual prefere começar:
              </p>
              <div className="d-flex flex-column gap-3 is-questionnaire-tie-options">
                {jornadasEmpatadas.map((jornada) => (
                  <BotaoSistema
                    key={jornada}
                    variante="orange"
                    className="is-questionnaire-button"
                    onClick={() => handleEscolherJornada(jornada)}
                  >
                    {nomesJornadas[jornada]}
                  </BotaoSistema>
                ))}
              </div>
            </div>
          ) : !jornadaRecomendada ? (
            <div>
              <Loader2 size={40} className="is-questionnaire-spinner spin mb-3" aria-hidden="true" />
              <h2 className="is-questionnaire-heading mb-2">Calculando o resultado</h2>
              <p className="is-questionnaire-copy mb-0">Só um instante.</p>
            </div>
          ) : (
            <div>
              <CheckCircle2 size={40} className="is-questionnaire-success-icon mb-3" aria-hidden="true" />
              <h2 className="is-questionnaire-heading mb-3">Resultado do questionário</h2>
              {avisoPersistencia && (
                <p className="is-questionnaire-note mb-3" role="status">
                  {avisoPersistencia}
                </p>
              )}

              <div className="is-questionnaire-result mb-4" role="status" aria-live="polite">
                <Loader2 size={24} className="is-questionnaire-spinner spin" aria-hidden="true" />
                <div>
                  <span>{nomesJornadas[jornadaRecomendada] || 'Jornada Cardíaca'}</span>
                  {jornadasEmpatadas.length > 1 && (
                    <span className="is-questionnaire-copy d-block mt-2">
                      Suas respostas empataram. Você escolheu começar por esta jornada.
                    </span>
                  )}
                </div>
              </div>

              <BotaoSistema
                variante="orange"
                className="is-questionnaire-button"
                onClick={() => navigate(`/jornada/${jornadaRecomendada}`)}
              >
                Acessar minha jornada
              </BotaoSistema>
              <p className="is-questionnaire-copy small mt-3 mb-0">
                A recomendação está pronta. Acesse quando quiser.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (telaBoasVindas) {
    return (
      <div className="is-questionnaire min-vh-100">
        <BarraAcessibilidade />
        <main className="is-container min-vh-100 d-flex align-items-center justify-content-center py-4">
          <section className="is-questionnaire-panel is-questionnaire-welcome p-4 p-md-5">
            <Logo to="/inicio" />
            <h1 className="is-questionnaire-heading mt-4 mb-3">Boas-vindas ao InformaSaúde!</h1>
            <p className="is-questionnaire-note is-questionnaire-note--plain mb-4" role="note">
              Este questionário é uma ferramenta educativa para ajudar você a escolher por qual tema deseja
              começar sua jornada de aprendizado. Não é uma avaliação de saúde, triagem ou diagnóstico médico.
            </p>
            <h2 className="is-questionnaire-heading is-questionnaire-welcome-prompt mb-2">
              Vamos escolher por qual tema você gostaria de começar?
            </h2>
            <p className="is-questionnaire-copy mb-4">
              São {perguntas.length} perguntas rápidas para conhecermos seus interesses.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <BotaoSistema
                variante="orange"
                className="is-questionnaire-button flex-grow-1"
                onClick={() => setTelaBoasVindas(false)}
              >
                Começar
              </BotaoSistema>
              <BotaoSistema
                variante="outline-green"
                className="is-questionnaire-button flex-grow-1"
                onClick={() => navigate('/inicio')}
              >
                Agora não
              </BotaoSistema>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="is-questionnaire min-vh-100 d-flex flex-column justify-content-between pb-5">
      <div>
        <BarraAcessibilidade />

        <header className="bg-white border-bottom py-3 shadow-sm sticky-top">
          <div className="is-container">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <Logo to="/inicio" />

              <span className="is-questionnaire-counter">
                {etapaAtual + 1} de {perguntas.length}
              </span>
            </div>

            <div className="progress is-questionnaire-progress overflow-hidden rounded-pill">
              <div 
                className="progress-bar transition-all" 
                role="progressbar" 
                style={{ width: `${percentualProgresso}%` }} 
                aria-valuenow={percentualProgresso} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </header>

        <main className="is-container py-4 py-md-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8 col-xl-7">
              <div className="is-questionnaire-intro">
                <h1 className="is-questionnaire-heading">{perguntaAtual.titulo}</h1>
                <p className="is-questionnaire-subtitle">{perguntaAtual.subtitulo}</p>
              </div>

              <div className="is-questionnaire-actions">
                <button
                  type="button"
                  onClick={handleVoltar}
                  className="is-questionnaire-back-link"
                  aria-label={etapaAtual === 0 ? 'Voltar para boas-vindas' : 'Ir para a pergunta anterior'}
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                  <span>Voltar</span>
                </button>
                <BotaoSistema
                  variante={opcaoSelecionada ? 'orange' : 'secondary'}
                  desabilitado={!opcaoSelecionada}
                  className="is-questionnaire-button is-questionnaire-next"
                  onClick={handleAvancar}
                >
                  {etapaAtual === perguntas.length - 1 ? 'Ver resultado' : 'Continuar'}
                </BotaoSistema>
              </div>

              <div 
                className="row row-cols-1 g-3 mb-4"
                role="radiogroup" 
                aria-label={perguntaAtual.titulo}
              >
                {perguntaAtual.opcoes.map((opcao) => (
                  <div key={opcao.id} className="col">
                    <OpcaoCard
                      titulo={opcao.titulo}
                      descricao={opcao.descricao}
                      selecionado={opcaoSelecionada === opcao.id}
                      onClick={() => handleSelecionarOpcao(opcao.id)}
                    />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>

    </div>
  );
}

export default Questionario;
