import React, { useRef, useState, useEffect } from 'react';
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
  const [erroImagem, setErroImagem] = useState(false);

  useEffect(() => {
    setErroImagem(false);
  }, [src]);

  const obterIniciais = (nomeCompleto) => {
    if (!nomeCompleto) return 'US';
    const partes = nomeCompleto.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  };

  const dimensoes = () => {
    switch (tamanho) {
      case 'sm': return { width: 40, height: 40, fontSize: '0.9rem' };
      case 'md': return { width: 56, height: 56, fontSize: '1.2rem' };
      case 'xl': return { width: 140, height: 140, fontSize: '2.5rem' };
      default: return { width: 120, height: 120, fontSize: '2.2rem' };
    }
  };

  const { width, height, fontSize } = dimensoes();

  const handleSelecionarArquivo = (e) => {
    const arquivo = e.target.files?.[0];
    if (arquivo && onAlterarFoto) {
      const urlTemporaria = URL.createObjectURL(arquivo);
      onAlterarFoto(urlTemporaria, arquivo);
    }
  };

  const mostrarFoto = src && !erroImagem;

  return (
    <div className={`d-inline-flex flex-column align-items-center ${podeEditar ? 'w-100' : ''}`}>
      <input
        type="file"
        ref={inputArquivoRef}
        onChange={handleSelecionarArquivo}
        accept="image/*"
        className="d-none"
      />

      <div
        className={`is-avatar-circle is-avatar-${tamanho} ${mostrarFoto ? 'has-photo' : ''} rounded-circle d-flex align-items-center justify-content-center overflow-hidden shadow-sm ${podeEditar ? 'mb-3' : 'mb-0'}`}
      >
        {mostrarFoto ? (
          <img
            src={src}
            alt={nome}
            referrerPolicy="no-referrer"
            onError={() => setErroImagem(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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