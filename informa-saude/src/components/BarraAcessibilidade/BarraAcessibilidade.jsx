import React from 'react';
import { IconeContraste } from '../IconeContraste/IconeContraste';

export function BarraAcessibilidade() {
  const aumentarTexto = () => {
    document.documentElement.classList.remove('font-reduzida');
    document.documentElement.classList.add('font-aumentada');
  };

  const diminuirTexto = () => {
    document.documentElement.classList.remove('font-aumentada');
    document.documentElement.classList.add('font-reduzida');
  };

  const alternarAltoContraste = () => {
    document.documentElement.classList.toggle('alto-contraste');
  };

  return (
    <div className="is-top-accessibility-bar py-1 border-bottom">
      <div className="is-container d-flex justify-content-between align-items-center text-nowrap">
        <div className="d-flex align-items-center gap-3">
          <span className="d-none d-md-inline fs-7 opacity-75">Tamanho do texto:</span>
          <button
            type="button"
            onClick={aumentarTexto}
            className="is-acc-btn"
            title="Aumentar Texto"
            aria-label="Aumentar tamanho do texto"
          >
            A+
          </button>
          <button
            type="button"
            onClick={diminuirTexto}
            className="is-acc-btn"
            title="Diminuir Texto"
            aria-label="Diminuir tamanho do texto"
          >
            A-
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={alternarAltoContraste}
            className="is-acc-btn d-inline-flex align-items-center gap-2"
            title="Alternar Contraste"
            aria-label="Alternar modo de alto contraste"
          >
            <span>Contraste</span>
            <IconeContraste size={16} className="flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BarraAcessibilidade;
