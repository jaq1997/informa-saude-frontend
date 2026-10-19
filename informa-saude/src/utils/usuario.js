import fotoPerfil from '../assets/images/foto-perfil.webp';

export function resolverFoto(avatarGoogle) {
  const fotoSalva = localStorage.getItem('informa-saude-foto-perfil');
  if (fotoSalva === 'null') return null;
  if (fotoSalva) return fotoSalva;
  return avatarGoogle || fotoPerfil;
}

export function obterNomeUsuario() {
  const usuarioSalvo = localStorage.getItem('informa-saude-usuario-ativo');
  if (usuarioSalvo) {
    try {
      const dados = JSON.parse(usuarioSalvo);
      if (dados?.nome) return dados.nome;
      if (typeof dados === 'string') return dados;
    } catch {
      if (typeof usuarioSalvo === 'string') return usuarioSalvo;
    }
  }

  const contasSalvas = localStorage.getItem('informa-saude-contas');
  if (contasSalvas) {
    try {
      const contas = JSON.parse(contasSalvas);
      if (Array.isArray(contas) && contas.length > 0) {
        const ultima = contas[contas.length - 1];
        if (ultima?.nome) return ultima.nome;
      }
    } catch {}
  }

  return 'João da Silva';
}

export function obterEmailUsuario() {
  const usuarioSalvo = localStorage.getItem('informa-saude-usuario-ativo');
  if (usuarioSalvo) {
    try {
      const dados = JSON.parse(usuarioSalvo);
      if (dados?.email) return dados.email;
    } catch {}
  }
  return 'joaodasilva@example.com';
}
