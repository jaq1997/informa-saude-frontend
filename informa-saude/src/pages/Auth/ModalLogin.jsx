import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthModalLayout } from './AuthModalLayout';
import { FormInput } from '../../components';
import RecoverPasswordModal from '../RecoverPassword/RecoverEmailGet/RecoverPasswordModal';
import { entrar, entrarComGoogle, buscarPerfil } from '../../api/api';
import { useUser } from '../../context/UserContext';

const mensagemDeErro = (err) =>
  err.message === 'Failed to fetch'
    ? 'Não foi possível conectar ao servidor. Tente novamente.'
    : err.message;

export function ModalLogin({ onClose, onAbrirCadastro }) {
  const navigate = useNavigate();
  const { atualizarUsuario } = useUser();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const concluirLogin = async () => {
    const perfil = await buscarPerfil();
    atualizarUsuario({ nome: perfil.nome, email: perfil.email });
    onClose();
    navigate('/inicio');
  };

  const handleEntrar = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await entrar(email.trim().toLowerCase(), senha);
      await concluirLogin();
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setCarregando(false);
    }
  };

  const handleGoogle = async ({ credential }) => {
    setErro('');
    try {
      await entrarComGoogle(credential);
      await concluirLogin();
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  };

  return (
    <AuthModalLayout onClose={onClose} titulo="Acessar conta" centralizarConteudo>
      <form onSubmit={handleEntrar}>
        <FormInput
          id="modal-email"
          label="E-mail"
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          <button
            className="button-recover-password"
            type="button"
            onClick={() => setOpen(true)}
          >
            Esqueceu sua senha?
          </button>
          <RecoverPasswordModal open={open} onClose={() => setOpen(false)} />
        </div>

        {erro && (
          <div className="text-danger fs-6 mb-2 text-center" role="alert">
            {erro}
          </div>
        )}

        <div className="d-flex flex-column gap-2 mt-2">
          <button
            type="submit"
            className="is-btn is-btn--orange w-100 fs-6 py-2"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Acessar conta'}
          </button>

          <div className="d-flex align-items-center gap-2 my-1">
            <hr className="flex-fill my-0 text-muted opacity-25" />
            <span className="text-muted fs-6 fw-semibold">OU</span>
            <hr className="flex-fill my-0 text-muted opacity-25" />
          </div>

          <div className="d-flex justify-content-center">
  <GoogleLogin
    onSuccess={handleGoogle}
    onError={() => setErro('Não foi possível entrar com o Google.')}
    locale="pt-BR"
    theme="outline"            
    size="large"              
    shape="pill"               
    text="continue_with"      
    logo_alignment="center"    
    width="350"                
  />
</div>
        </div>

        <div className="text-center mt-2 pt-2">
          <span className="text-muted fs-6">Ainda não tem conta? </span>
          <button
            type="button"
            className="is-link-button is-auth-access-link fs-6"
            onClick={onAbrirCadastro}
          >
            Criar conta grátis
          </button>
        </div>
      </form>
    </AuthModalLayout>
  );
}

export default ModalLogin;