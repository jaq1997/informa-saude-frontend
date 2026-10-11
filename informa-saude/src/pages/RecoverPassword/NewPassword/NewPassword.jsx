import React, { useState } from 'react'
import './NewPassword.css'

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function ResetPassword({ onSuccess, onClose, onBack }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const isStrongPassword = (password) =>
    password.length >= 6 &&
    /[@#%*]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isStrongPassword(newPassword)) {
      setErrorMessage('A senha precisa ter no mínimo 6 caracteres, 1 símbolo (@#%*), uma letra maiúscula, uma minúscula e um número.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem!')
      return
    }

    setErrorMessage('')
    setIsSuccessModalOpen(true)
  }

  const handleModalContinue = () => {
    setIsSuccessModalOpen(false)
    onSuccess()
  }

  return (
    <div className="reset-container">
      <button type="button" className="btn-back" onClick={onBack}>
        &#8249;
      </button>

      <h2 className="title">Digite uma nova senha</h2>
      <p className="subtitle">
        Digite sua nova senha.
      </p>

      <form onSubmit={handleSubmit} className="reset-form">
        <div className="input-group">
          <label>Digite sua nova senha</label>
          <div className="input-wrapper">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              required
            />
            <button
              type="button"
              className="toggle-eye"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <EyeIcon open={showNewPassword} />
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>Confirme sua nova senha</label>
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
              required
            />
            <button
              type="button"
              className="toggle-eye"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="btn-submit">
          Alterar senha
        </button>
      </form>

      {isSuccessModalOpen && (
        <div className="modal-overlay-RecoverEmailGet">
          <div className="modal-content-RecoverEmailGet">
            <div className="modal-icon-RecoverEmailGet">
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="modal-title-RecoverEmailGet">
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
  )
}

export default ResetPassword