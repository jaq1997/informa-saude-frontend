import { useCallback, useEffect, useMemo, useState } from "react";
import { buscarDashboard } from "../api/api";
import { JornadasContext } from "./jornadasContextStore";

const estadoInicial = {
  diasAprendidos: 0,
  progressoSemanal: [false, false, false, false, false, false, false],
  xpHistorico: [0, 0, 0],
  jornadas: 0,
  minutos: 0,
};

export function JornadasProvider({ children }) {
  const [dashboard, setDashboard] = useState(estadoInicial);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const atualizarDashboard = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarDashboard();

      setDashboard({
        diasAprendidos: dados.diasAprendidos,
        progressoSemanal: dados.progressoSemanal,
        xpHistorico: dados.xpHistorico,
        jornadas: dados.jornadas,
        minutos: dados.minutos,
      });
    } catch (error) {
      setDashboard(estadoInicial);
      setErro(error.message || "Erro ao carregar o Dashboard.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarDashboardInicial() {
      try {
        const dados = await buscarDashboard();

        if (!ativo) return;

        setDashboard({
          diasAprendidos: dados.diasAprendidos,
          progressoSemanal: dados.progressoSemanal,
          xpHistorico: dados.xpHistorico,
          jornadas: dados.jornadas,
          minutos: dados.minutos,
        });

        setErro(null);
      } catch (error) {
        if (!ativo) return;

        setDashboard(estadoInicial);
        setErro(error.message || "Erro ao carregar o Dashboard.");
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDashboardInicial();

    return () => {
      ativo = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      ...dashboard,
      carregando,
      erro,
      atualizarDashboard,
    }),
    [dashboard, carregando, erro, atualizarDashboard]
  );

  return (
    <JornadasContext.Provider value={value}>
      {children}
    </JornadasContext.Provider>
  );
}
