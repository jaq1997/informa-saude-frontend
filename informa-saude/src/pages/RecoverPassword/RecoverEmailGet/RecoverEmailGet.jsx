import React, { useState } from 'react';
import './RecoverEmailGet.css';
import { pedirCodigo } from '../../../api/api';

export function ForgotPassword({ onSuccess, onClose }) {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setErro('')
    setCarregando(true)

    const emailLimpo = email.trim().toLowerCase()

    try {
      await pedirCodigo(emailLimpo)
      onSuccess(emailLimpo)
    } catch (err) {
      setErro(
        err.message === 'Failed to fetch'
          ? 'Não foi possível conectar ao servidor. Tente novamente.'
          : err.message
      )
    } finally {
      setCarregando(false)
    }
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

          {erro && (
            <p role="alert" style={{ color: 'crimson', fontSize: '0.9rem', margin: '0 0 8px' }}>
              {erro}
            </p>
          )}

          <button type="submit" className="submit-button-RecoverEmailGet" disabled={carregando}>
            {carregando ? 'Enviando...' : 'Recuperar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword;