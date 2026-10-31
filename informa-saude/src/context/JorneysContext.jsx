import { useReducer, useMemo } from "react";
import { JornadasContext } from "./jornadasContextStore";

const estadoInicial = {
  diasAprendidos: 241,
  progressoSemanal: [true, true, true, true, false, false, false],
  xpHistorico: [1636, 707, 1636],
  jornadas: 6,
  minutos: 63,
};

function reducer(state, action) {
  if (action.type !== "jornada-completa") return state;

  const proximoProgresso = [...state.progressoSemanal];
  const proximoDia = proximoProgresso.findIndex((completo) => !completo);

  if (proximoDia >= 0) proximoProgresso[proximoDia] = true;

  const novoXpHistorico = [...state.xpHistorico];
  if (novoXpHistorico.length > 0) {
    novoXpHistorico[novoXpHistorico.length - 1] += 320;
  } else {
    novoXpHistorico.push(320);
  }

  return {
    ...state,
    diasAprendidos: state.diasAprendidos + (proximoDia >= 0 ? 1 : 0),
    progressoSemanal: proximoProgresso,
    xpHistorico: novoXpHistorico,
    jornadas: state.jornadas + 1,
    minutos: state.minutos + 18,
  };
}

export function JornadasProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, estadoInicial);

  const value = useMemo(() => ({
    ...state,
    jornadaCompleta: () => dispatch({ type: "jornada-completa" })
  }), [state]);

  return (
    <JornadasContext.Provider value={value}>
      {children}
    </JornadasContext.Provider>
  );
}
