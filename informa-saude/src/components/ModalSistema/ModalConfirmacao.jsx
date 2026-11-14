import { ModalSistema } from './ModalSistema';
import { BotaoSistema } from '../Botao/BotaoSistema';

export function ModalConfirmacao({
  aberto = false,
  onClose,
  onConfirmar,
  titulo = 'Confirmar ação?',
  mensagem = 'Tem certeza que deseja prosseguir?',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  perigo = false
}) {
  return (
    <ModalSistema aberto={aberto} onClose={onClose} tamanho="sm" centralizado>
      {perigo ? (
        <div className="alert alert-danger mb-4 border-0 rounded-3 text-center" role="alert">
          <h3 className="fw-bold fs-3 mb-2">{titulo}</h3>
          <p className="fs-6 mb-0">{mensagem}</p>
        </div>
      ) : (
        <>
          <h3 className="fw-bold text-dark fs-4 mb-2">{titulo}</h3>
          <p className="text-muted fs-6 mb-4">{mensagem}</p>
        </>
      )}

      <div className="is-modal-actions">
        <BotaoSistema
          variante="orange"
          className={`fs-6 ${perigo ? 'bg-danger border-danger' : ''}`}
          onClick={onConfirmar}
        >
          {textoConfirmar}
        </BotaoSistema>
        <BotaoSistema
          variante="outline-green"
          className="fs-6"
          onClick={onClose}
        >
          {textoCancelar}
        </BotaoSistema>
      </div>
    </ModalSistema>
  );
}

export default ModalConfirmacao;
