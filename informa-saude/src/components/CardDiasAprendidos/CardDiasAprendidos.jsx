import { useNavigate } from "react-router-dom";
import { useJornadas } from "../../context/jornadasContextStore";

export default function CardDiasAprendidos() {
  const { diasAprendidos } = useJornadas();
  const navigate = useNavigate();

  function irParaJornadas() {
    navigate("/inicio#jornadas");
  }

  return (
    <article className="dashboard-card learning-card">
      <p className="learning-card-label">
        Dias de Aprendizado
      </p>

      <strong className="learning-card-value">
        {diasAprendidos}
      </strong>

      <p className="learning-card-message">
        Continue assim
      </p>

      <button
        type="button"
        className="btn is-btn--orange learning-card-action"
        onClick={irParaJornadas}
      >
        Fazer uma Jornada
      </button>
    </article>
  );
}
