interface Props {
  nome: string;
  imagem: string | null;
  tamanho?: 'pequeno' | 'medio' | 'grande';
}

export default function Avatar({ nome, imagem, tamanho = 'medio' }: Props) {
  if (imagem) {
    return <img className={`retrato retrato-${tamanho}`} src={imagem} alt={`Retrato de ${nome}`} />;
  }
  return (
    <div className={`avatar avatar-${tamanho}`} aria-hidden="true">
      {nome.trim().charAt(0).toUpperCase()}
    </div>
  );
}
