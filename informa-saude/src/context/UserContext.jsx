import { useCallback, useEffect, useState } from 'react';
import { buscarPerfil } from '../api/api';
import { UserContext } from './userContextStore';

const USUARIO_VAZIO = {
  usuario_id: null,
  nome: '',
  email: '',
  telefone: '',
  data_nascimento: '',
  sexo: '',
  avatar_url: null,
  provider: 'LOCAL',
};

const CHAVE_USUARIO = 'informa-saude-usuario-ativo';
const CHAVE_JORNADA = 'informa-saude-jornada-destaque';
const CHAVE_FOTO = 'informa-saude-foto-perfil';

function obterUsuarioSalvo() {
  const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);

  if (!usuarioSalvo) return USUARIO_VAZIO;

  try {
    const usuario = JSON.parse(usuarioSalvo);

    return usuario && typeof usuario === 'object'
      ? usuario
      : USUARIO_VAZIO;
  } catch {
    return USUARIO_VAZIO;
  }
}

function limparSessao() {
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem(CHAVE_USUARIO);
  localStorage.removeItem(CHAVE_FOTO);
  localStorage.removeItem(CHAVE_JORNADA);

  window.dispatchEvent(new Event('foto-perfil-atualizada'));
}

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(obterUsuarioSalvo);

  const [jornadaRecomendada, setJornadaRecomendada] = useState(
    () => localStorage.getItem(CHAVE_JORNADA) || null
  );

  const atualizarUsuario = useCallback((novosDados) => {
    const usuarioAnterior = obterUsuarioSalvo();

    const usuarioAtualizado = {
      ...usuarioAnterior,
      ...novosDados,
    };

    localStorage.setItem(
      CHAVE_USUARIO,
      JSON.stringify(usuarioAtualizado)
    );

    setUsuario(usuarioAtualizado);
  }, []);

  const atualizarJornada = useCallback((jornadaKey) => {
    setJornadaRecomendada(jornadaKey);

    if (jornadaKey) {
      localStorage.setItem(CHAVE_JORNADA, jornadaKey);
    } else {
      localStorage.removeItem(CHAVE_JORNADA);
    }
  }, []);

  const sair = useCallback(() => {
    limparSessao();

    setUsuario(USUARIO_VAZIO);
    setJornadaRecomendada(null);
  }, []);

  const carregarPerfil = useCallback(async () => {
    try {
      const perfil = await buscarPerfil();

      const usuarioAnterior = obterUsuarioSalvo();

      if (
        usuarioAnterior.email &&
        usuarioAnterior.email !== perfil.email
      ) {
        localStorage.removeItem(CHAVE_FOTO);

        window.dispatchEvent(
          new Event('foto-perfil-atualizada')
        );
      }

      atualizarUsuario({
        usuario_id: perfil.id,
        nome: perfil.nome,
        email: perfil.email,
        telefone: perfil.telefone ?? '',
        data_nascimento: perfil.data_nascimento ?? '',
        sexo: perfil.sexo ?? '',
        avatar_url: perfil.avatar_url ?? null,
        provider: perfil.provider ?? 'LOCAL',
      });

      if (perfil.jornada_recomendada !== undefined) {
        atualizarJornada(perfil.jornada_recomendada);
      }

      return perfil;
    } catch (erro) {
      sair();
      throw erro;
    }
  }, [atualizarJornada, atualizarUsuario, sair]);

  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    let ativo = true;

    async function carregarPerfilInicial() {
      try {
        const perfil = await buscarPerfil();

        if (!ativo) return;

        const usuarioAnterior = obterUsuarioSalvo();

        if (
          usuarioAnterior.email &&
          usuarioAnterior.email !== perfil.email
        ) {
          localStorage.removeItem(CHAVE_FOTO);

          window.dispatchEvent(
            new Event('foto-perfil-atualizada')
          );
        }

        atualizarUsuario({
          usuario_id: perfil.id,
          nome: perfil.nome,
          email: perfil.email,
          telefone: perfil.telefone ?? '',
          data_nascimento: perfil.data_nascimento ?? '',
          sexo: perfil.sexo ?? '',
          avatar_url: perfil.avatar_url ?? null,
          provider: perfil.provider ?? 'LOCAL',
        });

        if (perfil.jornada_recomendada !== undefined) {
          atualizarJornada(perfil.jornada_recomendada);
        }
      } catch {
        if (ativo) {
          sair();
        }
      }
    }

    carregarPerfilInicial();

    return () => {
      ativo = false;
    };
  }, [atualizarJornada, atualizarUsuario, sair]);

  return (
    <UserContext.Provider
      value={{
        usuario,
        atualizarUsuario,
        carregarPerfil,
        sair,
        jornadaRecomendada,
        atualizarJornada,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
