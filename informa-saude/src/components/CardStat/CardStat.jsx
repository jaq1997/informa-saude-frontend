import { Award, Clock3 } from "lucide-react";
import { useJornadas } from "../../context/jornadasContextStore";

export default function CardStat({ type }) {
  const estado = useJornadas();

  const isJornadas = type === "jornadas";

  const Icon = isJornadas ? Award : Clock3;

  const valor = isJornadas
    ? estado.jornadas
    : estado.minutos;

  const aulasConcluidas = estado.aulasConcluidas ?? 0;

  const titulo = isJornadas
    ? `${valor} ${valor === 1 ? "Jornada de conteúdo" : "Jornadas de conteúdo"}`
    : `${valor} ${valor === 1 ? "minuto" : "minutos"}`;

  const descricao = isJornadas
    ? aulasConcluidas === 0
      ? valor === 0
        ? "Você ainda não iniciou nenhuma jornada. Que tal começar?"
        : "Você ainda não concluiu nenhuma aula. Continue aprendendo!"
      : `Você concluiu ${aulasConcluidas} ${
          aulasConcluidas === 1 ? "aula" : "aulas"
        } até agora. Continue aprendendo!`
    : valor === 0
      ? "A duração das aulas concluídas aparecerá aqui."
      : "Duração total das aulas que você concluiu.";

  return (
    <article className="dashboard-card stat-card">
      <div className="stat-card-copy">
        <h2>{titulo}</h2>
        <p>{descricao}</p>
      </div>

      <Icon
        className="stat-card-icon"
        strokeWidth={2.4}
      />
    </article>
  );
}
