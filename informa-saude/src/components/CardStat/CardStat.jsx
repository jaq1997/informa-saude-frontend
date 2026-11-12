import { Award, Clock3 } from "lucide-react";
import { useJornadas } from "../../context/jornadasContextStore";

export default function CardStat({ type }) {
  const estado = useJornadas();

  const isJornadas = type === "jornadas";

  const Icon = isJornadas ? Award : Clock3;

  const valor = isJornadas
    ? estado.jornadas
    : estado.minutos;

  const titulo = isJornadas
    ? `${valor} ${valor === 1 ? "Jornada de conteúdo" : "Jornadas de conteúdo"}`
    : `${valor} ${valor === 1 ? "minuto" : "minutos"}`;

  const descricao = isJornadas
    ? valor === 0
      ? "Você ainda não iniciou nenhuma jornada. Que tal começar?"
      : "Continue explorando conteúdos e ampliando seus conhecimentos."
    : valor === 0
      ? "Seu tempo de aprendizado aparecerá aqui quando você iniciar suas atividades."
      : "Tempo total dedicado às suas atividades de aprendizado.";

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
