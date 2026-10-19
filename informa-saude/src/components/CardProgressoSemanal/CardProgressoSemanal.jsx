import { useJornadas } from '../../context/JorneysContext';
import { Check } from 'lucide-react';

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function CardProgressoSemanal() {
  const { progressoSemanal } = useJornadas();

  return (
    <article className='dashboard-card weekly-card'>
      <header className='weekly-card-header'>Seu progresso essa semana</header>

      <div className='weekly-days'>
        {dias.map((dia, index) => (
          <div key={dia} className='weekly-day'>
            <span className='weekly-day-label'>{dia}</span>
            <span className={`weekly-day-status${progressoSemanal[index] ? " is-complete" : ""}`}>
              <Check className='weekly-day-check' strokeWidth={3} />
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}