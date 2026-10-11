import React, { useState } from 'react';
import './RecoverEmailGet.css';

export function ForgotPassword({ onSuccess, onClose }) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSuccess(email)
  }

  return (
    <div className="forgot-container-RecoverEmailGet">
      <div className="forgot-card-RecoverEmailGet">
        <button type="button" className="back-button-RecoverEmailGet" onClick={onClose}>
          &#10094;
        </button>
        <h1 className="title-RecoverEmailGet">Esqueci minha senha</h1>
        <p className="subtitle-RecoverEmailGet">
          Por favor, preencha seu e-mail para recuperar sua senha.
        </p>
        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group-RecoverEmailGet">
            <label htmlFor="email">Seu E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button-RecoverEmailGet">
            Recuperar senha
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword;