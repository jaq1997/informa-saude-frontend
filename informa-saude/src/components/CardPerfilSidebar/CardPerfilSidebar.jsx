import { AvatarUsuario } from '../AvatarUsuario/AvatarUsuario';

export function CardPerfilSidebar({
  nome = 'João Da Silva',
  email = 'joaodasilva@example.com',
  foto,
  podeEditar = false,
  onAlterarFoto,
  onRemoverFoto,
  className = ''
}) {
  return (
    <div className={`bg-white rounded-4 shadow-sm p-4 text-center border-0 ${className}`}>
      <div className="d-flex justify-content-center mb-3">
        <AvatarUsuario
          nome={nome}
          src={foto}
          podeEditar={podeEditar}
          onAlterarFoto={onAlterarFoto}
          onRemoverFoto={onRemoverFoto}
        />
      </div>
      <h3 className="fw-bold text-dark fs-3 mb-1">{nome}</h3>
      <p className="text-muted fs-6 mb-0">{email}</p>
    </div>
  );
}

export default CardPerfilSidebar;
