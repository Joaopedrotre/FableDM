import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UsuarioLogado } from '../types';

// Guarda o usuário logado e deixa qualquer componente acessar com useAuth().
// Token e usuário ficam no localStorage para sobreviver ao recarregar a página.
interface Auth {
  usuario: UsuarioLogado | null;
  entrar: (token: string, usuario: UsuarioLogado) => void;
  sair: () => void;
}

const AuthContext = createContext<Auth | null>(null);

function lerUsuarioSalvo(): UsuarioLogado | null {
  try {
    const texto = localStorage.getItem('usuario');
    return texto ? (JSON.parse(texto) as UsuarioLogado) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(lerUsuarioSalvo);

  function entrar(token: string, dados: UsuarioLogado) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(dados));
    setUsuario(dados);
  }

  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  return <AuthContext.Provider value={{ usuario, entrar, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro do AuthProvider.');
  return contexto;
}
