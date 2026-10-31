import { useState } from "react";
import Modal from "./modalRecover";
import RecoverEmailGet from "./RecoverEmailGet";
import { VerifyCode } from "../Codeverify/Codeverify";
import ResetPassword from "../NewPassword/NewPassword";

export default function RecoverPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const close = () => {
    setStep(1);
    setEmail("");
    setResetToken("");
    onClose();
  };

  const voltarParaEmail = () => {
    setResetToken("");
    setStep(1);
  };

  return (
    <Modal open={open} onClose={close}>
      <div key={step} className="step-transition">
        {step === 1 && (
          <RecoverEmailGet
            onClose={close}
            onSuccess={(emailDigitado) => {
              setEmail(emailDigitado);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <VerifyCode
            email={email}
            onSuccess={(token) => {
              setResetToken(token);
              setStep(3);
            }}
            onClose={close}
            onBack={voltarParaEmail}
          />
        )}

        {step === 3 && (
          <ResetPassword
            resetToken={resetToken}
            onSuccess={close}
            onBack={voltarParaEmail}
          />
        )}
      </div>
    </Modal>
  );
}