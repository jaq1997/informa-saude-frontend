import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export function DropdownSistema({
  opcoes = [],
  valorAtual,
  onChange,
  label = 'Selecionar',
  temaEscuro = false,
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickFora(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const opcaoAtual = opcoes.find(o => o.valor === valorAtual);
  const textoBotao = opcaoAtual?.label || label;

  const handleSelecionar = (valor) => {
    setAberto(false);
    if (onChange) onChange(valor);
  };

  return (
    <div className="dropdown position-relative d-inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className={`is-dropdown-trigger ${temaEscuro ? 'is-dropdown-trigger--dark-theme' : ''}`}
      >
        <span>{textoBotao}</span>
        <ChevronDown
          size={16}
          className={`is-dropdown-chevron ${aberto ? 'is-open' : ''}`}
        />
      </button>

      {aberto && (
        <ul role="listbox" className="dropdown-menu dropdown-menu-end show">
          {opcoes.map(opcao => {
            const ativo = opcao.valor === valorAtual;
            return (
              <li key={opcao.valor}>
                <button
                  type="button"
                  role="option"
                  aria-selected={ativo}
                  onClick={() => handleSelecionar(opcao.valor)}
                  className={`dropdown-item ${ativo ? 'active' : ''}`}
                >
                  {opcao.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default DropdownSistema;
