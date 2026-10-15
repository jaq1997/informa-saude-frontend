import React, { useEffect, useRef, useState } from 'react'
import './Codeverify.css'
import { pedirCodigo, verificarCodigo } from '../../../api/api'

const TAMANHO_CODIGO = 6
const ESPERA_REENVIO = 60

const codigoVazio = () => Array(TAMANHO_CODIGO).fill('')

const mensagemDeErro = (err) =>
  err.message === 'Failed to fetch'
    ? 'Não foi possível conectar ao servidor. Tente novamente.'
    : err.message

export function VerifyCode({ email, onSuccess, onClose, onBack }) {
  const [code, setCode] = useState(codigoVazio())
  const [errorMessage, setErrorMessage] = useState('')
  const [status, setStatus] = useState('idle')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [espera, setEspera] = useState(ESPERA_REENVIO)

  const inputRefs = useRef([])

  useEffect(() => {
    if (espera <= 0) return
    const id = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [espera])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    if (errorMessage) setErrorMessage('')
    if (status !== 'idle') setStatus('idle')

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < TAMANHO_CODIGO - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, TAMANHO_CODIGO)

    const newCode = codigoVazio()
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }
    setCode(newCode)

    const nextFocus = Math.min(pastedData.length, TAMANHO_CODIGO - 1)
    inputRefs.current[nextFocus]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const fullCode = code.join('')

    if (fullCode.length < TAMANHO_CODIGO) {
      setErrorMessage(`Preencha os ${TAMANHO_CODIGO} dígitos do código.`)
      return
    }

    setVerificando(true)
    try {
      const { reset_token } = await verificarCodigo(email, fullCode)
      setErrorMessage('')
      setStatus('success')

      setTimeout(() => {
        onSuccess(reset_token)
      }, 1800)
    } catch (err) {
      setErrorMessage(mensagemDeErro(err))
      setStatus('error')

      setTimeout(() => {
        setCode(codigoVazio())
        setStatus('idle')
        inputRefs.current[0]?.focus()
      }, 1200)
    } finally {
      setVerificando(false)
    }
  }

  const handleResendCode = async () => {
    if (espera > 0 || reenviando) return

    setReenviando(true)
    setErrorMessage('')
    try {
      await pedirCodigo(email)
      setCode(codigoVazio())
      setStatus('idle')
      setEspera(ESPERA_REENVIO)
      setIsModalOpen(true)
      inputRefs.current[0]?.focus()
    } catch (err) {
      setErrorMessage(mensagemDeErro(err))
    } finally {
      setReenviando(false)
    }
  }

  return (
    <div className="verify-container-VerifyCode">
      <div className="verify-card-VerifyCode">

        <button type="button" className="back-button-VerifyCode" onClick={onBack}>
          &#10094;
        </button>

        <h1 className="title-VerifyCode">Digite seu código</h1>
        <p className="subtitle-VerifyCode">
          Digite o código de {TAMANHO_CODIGO} dígitos enviado no e-mail.
          Se não encontrar, olhe também a caixa de spam.
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
                  ref={(el) => (inputRefs.current[index] = el)}
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

          <button
            type="submit"
            className="submit-button-VerifyCode"
            disabled={verificando || status === 'success'}
          >
            {verificando ? 'Verificando...' : 'Verificar código'}
          </button>
        </form>

        <div className="resend-container-VerifyCode">
          <p>Não recebeu o código?</p>
          <button
            type="button"
            className="resend-button-VerifyCode"
            onClick={handleResendCode}
            disabled={espera > 0 || reenviando}
          >
            {reenviando
              ? 'Enviando...'
              : espera > 0
                ? `Reenviar código (${espera}s)`
                : 'Reenviar código'}
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