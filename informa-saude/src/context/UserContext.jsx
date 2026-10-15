import { createContext, useContext, useEffect, useState } from 'react';
import { buscarPerfil } from '../api/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem('informa-saude-usuario-ativo');
    if (usuarioSalvo) {
      try {
        return JSON.parse(usuarioSalvo);
      } catch {
        return { nome: usuarioSalvo, email: 'joaodasilva@example.com' };
      }
    }
    return { nome: 'João da Silva', email: 'joaodasilva@example.com' };
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

  const atualizarJornada = (jornadaKey) => {
    setJornadaRecomendada(jornadaKey);
    localStorage.setItem('informa-saude-jornada-destaque', jornadaKey);
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    buscarPerfil()
      .then((perfil) => atualizarUsuario({ nome: perfil.nome, email: perfil.email }))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('informa-saude-usuario-ativo');
      });
  }, []);

  return (
    <UserContext.Provider value={{ usuario, atualizarUsuario, jornadaRecomendada, atualizarJornada }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}