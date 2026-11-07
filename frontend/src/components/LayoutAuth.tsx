import type { ReactNode } from 'react';

// Moldura das telas de cadastro e login: marca à esquerda e formulário à direita.
export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <main className="pagina">
      <aside className="lateral">
        <h1>FableDM</h1>
        <p>Sua mesa de RPG, com um mestre que nunca falta à sessão.</p>
      </aside>
      {children}
    </main>
  );
}
