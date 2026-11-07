import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  erro?: string;
}

// Campo de formulário reutilizável: rótulo, input e mensagem de erro.
export default function Campo({ id, label, erro, ...resto }: Props) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `${id}-erro` : undefined}
        {...resto}
      />
      {erro && (
        <p className="erro" id={`${id}-erro`} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
