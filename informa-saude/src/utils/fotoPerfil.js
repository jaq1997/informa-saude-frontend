const CHAVE_USUARIO_ATIVO = 'informa-saude-usuario-ativo';
const PREFIXO_FOTO_PERFIL = 'informa-saude-foto-perfil';

function obterIdentificadorUsuarioAtivo() {
  const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO_ATIVO);
  if (!usuarioSalvo) return 'demonstracao';

  try {
    const usuario = JSON.parse(usuarioSalvo);
    if (usuario?.usuario_id) return `id-${usuario.usuario_id}`;
    if (usuario?.email) return `email-${usuario.email.trim().toLowerCase()}`;
    if (usuario?.nome) return `nome-${usuario.nome.trim().toLowerCase()}`;
  } catch {
    return `nome-${usuarioSalvo.trim().toLowerCase()}`;
  }

  return 'demonstracao';
}

function obterChaveFotoPerfil() {
  return `${PREFIXO_FOTO_PERFIL}:${obterIdentificadorUsuarioAtivo()}`;
}

export function obterFotoPerfil() {
  const foto = localStorage.getItem(obterChaveFotoPerfil());
  return foto && foto !== 'null' ? foto : null;
}

export function salvarFotoPerfil(foto) {
  const chave = obterChaveFotoPerfil();
  if (foto) {
    localStorage.setItem(chave, foto);
  } else {
    localStorage.removeItem(chave);
  }
}
