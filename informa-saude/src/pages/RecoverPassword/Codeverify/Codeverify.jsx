import React, { useState, useRef } from 'react'
import './Codeverify.css'
import { verificarCodigoTeste } from '../test/code'

export function VerifyCode({ email, onSuccess, onClose, onBack }) {
  const [code, setCode] = useState(['', '', '', '', ''])
  const [errorMessage, setErrorMessage] = useState('')
  const [status, setStatus] = useState('idle')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    if (errorMessage) setErrorMessage('')
    if (status !== 'idle') setStatus('idle')

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 4) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 5).replace(/\D/g, '')
    const newCode = [...code]

    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    setCode(newCode)

    const nextFocus = Math.min(pastedData.length, 4)
    inputRefs[nextFocus].current?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const fullCode = code.join('')

    if (fullCode.length < 5) {
      setErrorMessage('Preencha os 5 dígitos do código.')
      return
    }

    const ehValido = verificarCodigoTeste(fullCode)

    if (ehValido) {
      setErrorMessage('')
      setStatus('success')

      setTimeout(() => {
        onSuccess()
      }, 1800)
    } else {
      setErrorMessage('Código incorreto! Tente novamente.')
      setStatus('error')

      setTimeout(() => {
        setCode(['', '', '', '', ''])
        setStatus('idle')
        inputRefs[0].current?.focus()
      }, 1200)
    }
  }

  const handleResendCode = () => {
    setIsModalOpen(true)
  }

  return (
    <div className="verify-container-VerifyCode">
      <div className="verify-card-VerifyCode">

        <button type="button" className="back-button-VerifyCode" onClick={onBack}>
  &#10094;
</button>

        <h1 className="title-VerifyCode">Digite seu código</h1>
        <p className="subtitle-VerifyCode">
          Digite o código de 5 dígitos enviado no e-mail.
        </p>

        <form onSubmit={handleSubmit} className="verify-form-VerifyCode">
          <div className="animation-wrapper-VerifyCode">

            <div className={`code-inputs-container-VerifyCode ${status}`}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  ref={inputRefs[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`code-input-VerifyCode ${digit ? 'filled' : ''}`}
                />
              ))}
            </div>

            {status === 'success' && (
              <div className="icon-badge-VerifyCode success-badge">
                <svg className="checkmark" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="23" />
                  <path className="checkmark-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
            )}

            {status === 'error' && (
              <div className="icon-badge-VerifyCode error-badge">
                <svg className="crossmark" viewBox="0 0 52 52">
                  <circle className="crossmark-circle" cx="26" cy="26" r="23" />
                  <path className="crossmark-check" d="M16 16 L36 36 M36 16 L16 36" />
                </svg>
              </div>
            )}

          </div>

        <p className="error-message-VerifyCode">
  {errorMessage}
</p>

          <button type="submit" className="submit-button-VerifyCode">
            Verificar código
          </button>
        </form>

        <div className="resend-container-VerifyCode">
          <p>Não recebeu o código?</p>
          <button
            type="button"
            className="resend-button-VerifyCode"
            onClick={handleResendCode}
          >
            Reenviar código
          </button>
          <br />
          <button type="button" className="resend-link-VerifyCode" onClick={onBack}>
            Tentar outro e-mail
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay-RecoverEmailGet">
          <div className="modal-content-RecoverEmailGet">
            <div className="modal-icon-RecoverEmailGet">
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="modal-title-RecoverEmailGet">
              Um novo código foi enviado!
            </h2>
            <p className="modal-text-RecoverEmailGet">
              Acesse seu e-mail para visualizar o novo código de verificação.
            </p>
            <div className="modal-actions-RecoverEmailGet">
              <button
                type="button"
                className="btn-continue-RecoverEmailGet"
                onClick={() => setIsModalOpen(false)}
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

export default VerifyCode