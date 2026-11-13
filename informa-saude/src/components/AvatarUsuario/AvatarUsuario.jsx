import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { BotaoSistema } from '../Botao/BotaoSistema';

export function AvatarUsuario({
  nome = 'Usuário',
  src = null,
  tamanho = 'lg',
  podeEditar = false,
  onAlterarFoto,
  onRemoverFoto
}) {
  const inputArquivoRef = useRef(null);
  const [srcComErro, setSrcComErro] = useState(null);

  const obterIniciais = (nomeCompleto) => {
    if (!nomeCompleto) return 'US';

    const partes = nomeCompleto.trim().split(/\s+/);

    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }

    return (
      partes[0].charAt(0) +
      partes[partes.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleSelecionarArquivo = (e) => {
    const arquivo = e.target.files?.[0];

    if (arquivo && onAlterarFoto) {
      const urlTemporaria = URL.createObjectURL(arquivo);
      onAlterarFoto(urlTemporaria, arquivo);
    }

    e.target.value = '';
  };

  const mostrarFoto = Boolean(src) && src !== srcComErro;

  return (
    <div
      className={`d-inline-flex flex-column align-items-center ${
        podeEditar ? 'w-100' : ''
      }`}
    >
      <input
        type="file"
        ref={inputArquivoRef}
        onChange={handleSelecionarArquivo}
        accept="image/*"
        className="d-none"
      />

      <div
        className={`is-avatar-circle is-avatar-${tamanho} ${
          mostrarFoto ? 'has-photo' : ''
        } rounded-circle d-flex align-items-center justify-content-center overflow-hidden shadow-sm ${
          podeEditar ? 'mb-3' : 'mb-0'
        }`}
      >
        {mostrarFoto ? (
          <img
            key={src}
            src={src}
            alt={nome}
            referrerPolicy="no-referrer"
            onError={() => setSrcComErro(src)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <span>{obterIniciais(nome)}</span>
        )}
      </div>

      {podeEditar && (
        <div className="d-flex flex-column align-items-center gap-2 w-100 mt-1">
          <BotaoSistema
            variante="outline-green"
            tamanho="md"
            larguraTotal
            onClick={() => inputArquivoRef.current?.click()}
            ariaLabel="Alterar foto de perfil"
          >
            <Camera size={18} /> Alterar foto
          </BotaoSistema>

          {src && (
            <button
              type="button"
              className="is-btn is-btn--profile btn-outline-danger border-danger text-danger bg-transparent w-100 fs-6"
              onClick={onRemoverFoto}
              aria-label="Remover foto de perfil"
            >
              <Trash2 size={18} /> Remover foto
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AvatarUsuario;
