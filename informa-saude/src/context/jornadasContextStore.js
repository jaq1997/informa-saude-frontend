import { createContext, useContext } from "react";

export const JornadasContext = createContext(undefined);

export function useJornadas() {
  const contexto = useContext(JornadasContext);

  if (!contexto) {
    throw new Error("useJornadas deve ser usado dentro de um JornadasProvider");
  }

  return contexto;
}
