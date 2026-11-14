import { useState } from 'react';
import './NewPassword.css';
import { definirNovaSenha } from '../../../api/api';

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const isStrongPassword = (password) => {
  const tamanhoValido =
    password.length >= 8 &&
    password.length <= 72 &&
    new TextEncoder().encode(password).length <= 72;

  return (
    tamanhoValido &&
    /[@#%*]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

function ResetPassword({ resetToken, onSuccess, onBack }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (carregando) return;

    if (!resetToken) {
      setErrorMessage(
        'Sua sessão de recuperação não está disponível. Volte e solicite um novo código.'
      );
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setErrorMessage(
        'A senha precisa ter entre 8 e 72 caracteres, no máximo 72 bytes, um símbolo (@, #, %, *), uma letra maiúscula, uma minúscula e um número.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem!');
      return;
    }

    setErrorMessage('');
    setCarregando(true);

    try {
      await definirNovaSenha(resetToken, newPassword);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setErrorMessage(
        err?.message === 'Failed to fetch'
          ? 'Não foi possível conectar ao servidor. Tente novamente.'
          : err?.status === 400
            ? 'Sua sessão de recuperação expirou ou é inválida. Volte e peça um novo código.'
            : err?.message || 'Não foi possível alterar a senha. Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleModalContinue = () => {
    setIsSuccessModalOpen(false);
    onSuccess?.();
  };

  return (
    <div className="reset-container">
      <button
        type="button"
        className="btn-back"
        onClick={onBack}
        disabled={carregando || isSuccessModalOpen}
        aria-label="Voltar"
      >
        &#8249;
      </button>

      <h2 className="title">Digite uma nova senha</h2>

      <p className="subtitle">
        Digite sua nova senha.
      </p>

      <form onSubmit={handleSubmit} className="reset-form">
        <div className="input-group">
          <label htmlFor="recover-new-password">
            Digite sua nova senha
          </label>

          <div className="input-wrapper">
            <input
              id="recover-new-password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              autoComplete="new-password"
              disabled={carregando}
              required
            />

            <button
              type="button"
              className="toggle-eye"
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={
                showNewPassword ? 'Ocultar senha' : 'Mostrar senha'
              }
            >
              <EyeIcon open={showNewPassword} />
            </button>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="recover-confirm-password">
            Confirme sua nova senha
          </label>

          <div className="input-wrapper">
            <input
              id="recover-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              autoComplete="new-password"
              disabled={carregando}
              required
            />

            <button
              type="button"
              className="toggle-eye"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword
                  ? 'Ocultar senha'
                  : 'Mostrar senha'
              }
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="error-message" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className="btn-submit"
          disabled={carregando || isSuccessModalOpen}
        >
          {carregando ? 'Alterando...' : 'Alterar senha'}
        </button>
      </form>

      {isSuccessModalOpen && (
        <div
          className="modal-overlay-RecoverEmailGet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recover-success-title"
        >
          <div className="modal-content-RecoverEmailGet">
            <div className="modal-icon-RecoverEmailGet">
              <svg
                viewBox="0 0 24 24"
                width="36"
                height="36"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2
              id="recover-success-title"
              className="modal-title-RecoverEmailGet"
            >
              Senha alterada com sucesso!
            </h2>

            <p className="modal-text-RecoverEmailGet">
              Sua senha foi redefinida. Clique em continuar para prosseguir.
            </p>

            <div className="modal-actions-RecoverEmailGet">
              <button
                type="button"
                className="btn-continue-RecoverEmailGet"
                onClick={handleModalContinue}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
