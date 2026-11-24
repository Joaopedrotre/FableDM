import type { ReactNode } from 'react';
import Logo from './Logo';

// Moldura das telas de cadastro e login: marca à esquerda e formulário à direita.
// Com `centralizado`, a marca fica no topo e o formulário no meio da página (usado no perfil).
export default function LayoutAuth({ children, centralizado = false }: { children: ReactNode; centralizado?: boolean }) {
  return (
    <main className={centralizado ? 'pagina pagina-centro' : 'pagina'}>
      <aside className="lateral">
        <h1>
          <span className="marca-linha">
            <Logo />
            FableDM
          </span>
        </h1>
        <p>Sua mesa de RPG, com um mestre que nunca falta à sessão.</p>
      </aside>
      {children}
    </main>
  );
}
