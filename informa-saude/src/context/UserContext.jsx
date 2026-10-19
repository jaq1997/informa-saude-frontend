import { createContext, useContext, useEffect, useState } from 'react';
import { buscarPerfil } from '../api/api';

const UserContext = createContext();

const USUARIO_VAZIO = { nome: '', email: '', avatar_url: null };

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem('informa-saude-usuario-ativo');
    if (usuarioSalvo) {
      try {
        return JSON.parse(usuarioSalvo);
      } catch {
        return { nome: usuarioSalvo, email: '', avatar_url: null };
      }
    }
    return USUARIO_VAZIO;
  });

  const [jornadaRecomendada, setJornadaRecomendada] = useState(() => {
    return localStorage.getItem('informa-saude-jornada-destaque') || 'cardiaca';
  });

  const atualizarUsuario = (novosDados) => {
    setUsuario((prev) => {
      const atualizado = { ...prev, ...novosDados };
      localStorage.setItem('informa-saude-usuario-ativo', JSON.stringify(atualizado));
      return atualizado;
    });
  };

  const sair = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('informa-saude-usuario-ativo');
    localStorage.removeItem('informa-saude-foto-perfil');
    setUsuario(USUARIO_VAZIO);
    window.dispatchEvent(new Event('foto-perfil-atualizada'));
  };

  const atualizarJornada = (jornadaKey) => {
    setJornadaRecomendada(jornadaKey);
    localStorage.setItem('informa-saude-jornada-destaque', jornadaKey);
  };

  const carregarPerfil = () =>
    buscarPerfil()
      .then((perfil) => {
        const salvo = localStorage.getItem('informa-saude-usuario-ativo');
        let anterior = null;
        try {
          anterior = salvo ? JSON.parse(salvo) : null;
        } catch {
          anterior = null;
        }
        if (anterior?.email && anterior.email !== perfil.email) {
          localStorage.removeItem('informa-saude-foto-perfil');
          window.dispatchEvent(new Event('foto-perfil-atualizada'));
        }
        atualizarUsuario({
          nome: perfil.nome,
          email: perfil.email,
          avatar_url: perfil.avatar_url,
        });
      })
      .catch(() => sair());

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    carregarPerfil();
  }, []);

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

export function useUser() {
  return useContext(UserContext);
}