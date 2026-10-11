import { useJornadas } from '../../context/JorneysContext';

export default function XPChart() {
  const { xpHistorico } = useJornadas();
  const legendas = ["Há 2 semanas", "Semana passada", "Esta semana"];
  const max = Math.max(...xpHistorico);
  const xpAnterior = xpHistorico[1] ?? 1;
  const xpAtual = xpHistorico[2] ?? 0;
  const crescimento = Math.round(((xpAtual - xpAnterior) / xpAnterior) * 100);

  return (
    <article className='dashboard-card xp-card'>
      <p className='xp-summary'>Você ganhou <strong>{crescimento}% XP a mais</strong> que na última semana. E avançou mais que <strong>57%</strong> das pessoas. <strong>Continue assim!</strong></p>

      <div className='xp-chart'>
        {xpHistorico.map((xp, index) => (
          <div key={legendas[index]} className='xp-column'>
            <span className={`xp-value${index === 2 ? " is-current" : ""}`}>{xp} XP</span>
            
            <div className={`xp-bar${index === 2 ? " is-current" : ""} xp-bar--${Math.max(25, Math.min(80, Math.round((xp / max) * 80 / 5) * 5))}`} role="img" aria-label={`${legendas[index]}: ${xp} XP`} />
          </div>
        ))}
      </div>

      <div className="xp-labels">
        {legendas.map((legenda) => <span key={legenda}>{legenda}</span>)}
      </div>
    </article>
  );
}