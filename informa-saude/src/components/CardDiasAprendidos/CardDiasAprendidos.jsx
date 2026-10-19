import { useJornadas } from '../../context/JorneysContext';

export default function CardDiasAprendidos() {
  const { diasAprendidos } = useJornadas();

  return (
    <article className='dashboard-card learning-card'>
      <p className='learning-card-label'>Dias de Aprendizado</p>
      <strong className='learning-card-value'>{diasAprendidos}</strong>
      <p className='learning-card-message'>Continue assim</p>
      <button className='btn is-btn--orange learning-card-action'>Fazer uma Jornada</button>
    </article>
  );
}