import type { TextareaHTMLAttributes } from 'react';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  erro?: string;
}

export default function CampoArea({ id, label, erro, ...resto }: Props) {
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={id}
        rows={5}
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
