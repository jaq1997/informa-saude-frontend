import { createContext, useContext, useEffect, useState } from 'react';
import { buscarPerfil } from '../api/api';

const UserContext = createContext();

const USUARIO_VAZIO = { nome: '', email: '' };

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem('informa-saude-usuario-ativo');
    if (usuarioSalvo) {
      try {
        return JSON.parse(usuarioSalvo);
      } catch {
        return { nome: usuarioSalvo, email: '' };
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
    setUsuario(USUARIO_VAZIO);
  };

  const atualizarJornada = (jornadaKey) => {
    setJornadaRecomendada(jornadaKey);
    localStorage.setItem('informa-saude-jornada-destaque', jornadaKey);
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    buscarPerfil()
      .then((perfil) => atualizarUsuario({ nome: perfil.nome, email: perfil.email }))
      .catch(() => sair()); // token expirado ou inválido: limpa a sessão
  }, []);

  return (
    <UserContext.Provider
      value={{ usuario, atualizarUsuario, sair, jornadaRecomendada, atualizarJornada }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}