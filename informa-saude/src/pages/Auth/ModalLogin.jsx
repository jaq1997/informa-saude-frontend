import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthModalLayout } from './AuthModalLayout';
import { FormInput } from '../../components';
import googleIcon from '../../assets/images/google.svg';
import RecoverPasswordModal from '../RecoverPassword/RecoverEmailGet/RecoverPasswordModal'

export function ModalLogin({ onClose, onAbrirCadastro }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleEntrar = (e) => {
    e.preventDefault();
    onClose();
    navigate('/inicio');
  };

  return (
    <AuthModalLayout onClose={onClose} titulo="Acessar conta" centralizarConteudo>
      <form onSubmit={handleEntrar}>
        <FormInput
          id="modal-usuario"
          label="Usuário ou E-mail"
          type="text"
          placeholder="Digite seu usuário ou e-mail"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <FormInput
          id="modal-senha"
          label="Senha"
          type="password"
          isPasswordToggle
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <div className="text-end mb-4">
          <button  className='button-recover-password' type="button" onClick={() => setOpen(true)}>Esqueceu sua senha?</button>
          <RecoverPasswordModal open={open} onClose={() => setOpen(false)} />

        </div>

        <div className="d-flex flex-column gap-2 mt-2">
          <button type="submit" className="is-btn is-btn--orange w-100 fs-6 py-2">
            Acessar conta
          </button>


          <div className="d-flex align-items-center gap-2 my-1">
            <hr className="flex-fill my-0 text-muted opacity-25" />
            <span className="text-muted fs-6 fw-semibold">OU</span>
            <hr className="flex-fill my-0 text-muted opacity-25" />
          </div>

          <button
            type="button"
            className="btn is-btn-google w-100 py-2 fs-6 d-flex align-items-center justify-content-center"
            onClick={() => alert('Integração com Google Login em breve!')}
          >
            <img src={googleIcon} alt="" width="18" height="18" className="me-2" aria-hidden="true" />
            Entrar com o Google
          </button>
        </div>

        <div className="text-center mt-2 pt-2">
          <span className="text-muted fs-6">Ainda não tem conta? </span>
          <button type="button" className="is-link-button is-auth-access-link fs-6" onClick={onAbrirCadastro}>
            Criar conta grátis
          </button>
        </div>
      </form>
    </AuthModalLayout>
  );
}

export default ModalLogin;
