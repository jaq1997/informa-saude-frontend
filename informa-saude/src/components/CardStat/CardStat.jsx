import { Award, Clock3 } from 'lucide-react';
import { useJornadas } from '../../context/JorneysContext';

export default function CardStat({ type }) {
  const estado = useJornadas();
  const jornadas = type === "jornadas";
  const Icon = jornadas ? Award : Clock3;
  const valor = jornadas ? estado.jornadas : estado.minutos;

  return (
    <article className='dashboard-card stat-card'>
      <div className='stat-card-copy'>
        <h2>{valor} {jornadas ? "Jornadas de conteúdos" : "minutos"}</h2>
        <p>Você fez <strong>{jornadas ? "4 jornadas de conteúdo a mais" : "63 minutos a mais"}</strong> que na semana passada.</p>
      </div>

      <Icon className='stat-card-icon' strokeWidth={2.4} />
    </article>
  );
}