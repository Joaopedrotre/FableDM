import type { ReactNode } from 'react';

// Caixa de mensagem: vermelha para erro, verde para sucesso.
export default function Aviso({ tipo, children }: { tipo: 'erro' | 'ok'; children: ReactNode }) {
  return (
    <p className={`aviso aviso-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
