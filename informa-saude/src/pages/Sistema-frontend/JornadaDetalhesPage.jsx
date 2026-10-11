import { useParams } from 'react-router-dom';
import { JornadaDetalhes } from './JornadaDetalhes';
import { obterJornadaPorId } from '../../data/jornadasData';

export function JornadaDetalhesPage() {
  const { id } = useParams();
  const jornadaData = obterJornadaPorId(id);

  return <JornadaDetalhes jornadaData={jornadaData} />;
}

export default JornadaDetalhesPage;
