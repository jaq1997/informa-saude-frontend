import { useJornadas } from "../../context/jornadasContextStore";

export default function XPChart() {
  const { xpHistorico } = useJornadas();

  // O backend retorna os últimos três meses,
  // começando pelo mais antigo.
  const hoje = new Date();

  const legendas = [-2, -1, 0].map((deslocamento) => {
    const data = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + deslocamento,
      1
    );

    return new Intl.DateTimeFormat("pt-BR", {
      month: "short",
    })
      .format(data)
      .replace(".", "");
  });

  const valores = [0, 1, 2].map(
    (index) => xpHistorico[index] ?? 0
  );

  const max = Math.max(...valores, 1);

  const xpAnterior = valores[1];
  const xpAtual = valores[2];

  let mensagem;

  if (xpAnterior === 0 && xpAtual === 0) {
    mensagem = "Comece sua jornada e conquiste seus primeiros pontos de XP!";
  } else if (xpAnterior === 0) {
    mensagem = `Você conquistou ${xpAtual} XP neste mês. Continue evoluindo!`;
  } else {
    const crescimento = Math.round(
      ((xpAtual - xpAnterior) / xpAnterior) * 100
    );

    if (crescimento > 0) {
      mensagem = `Seu XP aumentou ${crescimento}% em relação ao mês anterior. Continue assim!`;
    } else if (crescimento < 0) {
      mensagem = `Seu XP está ${Math.abs(crescimento)}% abaixo do mês anterior. Continue aprendendo!`;
    } else {
      mensagem = "Você manteve seu XP em relação ao mês anterior. Continue assim!";
    }
  }

  return (
    <article className="dashboard-card xp-card">
      <p className="xp-summary">{mensagem}</p>

      <div className="xp-chart">
        {valores.map((xp, index) => {
          const altura =
            xp === 0
              ? 0
              : Math.max(
                  25,
                  Math.min(
                    80,
                    Math.round(((xp / max) * 80) / 5) * 5
                  )
                );

          return (
            <div key={legendas[index]} className="xp-column">
              <span
                className={`xp-value${
                  index === 2 ? " is-current" : ""
                }`}
              >
                {xp} XP
              </span>

              <div
                className={`xp-bar${
                  index === 2 ? " is-current" : ""
                } xp-bar--${altura}`}
                role="img"
                aria-label={`${legendas[index]}: ${xp} XP`}
              />
            </div>
          );
        })}
      </div>

      <div className="xp-labels">
        {legendas.map((legenda) => (
          <span key={legenda}>{legenda}</span>
        ))}
      </div>
    </article>
  );
}
