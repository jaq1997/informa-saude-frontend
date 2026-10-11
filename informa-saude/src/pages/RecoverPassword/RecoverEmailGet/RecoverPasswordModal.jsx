import { useState } from "react";
import Modal from "./modalRecover";
import RecoverEmailGet from "./RecoverEmailGet";
import { VerifyCode } from "../Codeverify/Codeverify";
import ResetPassword from "../NewPassword/NewPassword";

export default function RecoverPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const close = () => {
    setStep(1);
    setEmail("");
    onClose();
  };

  return (
    <Modal open={open} onClose={close}>
  <div key={step} className="step-transition">
    {step === 1 && (
      <RecoverEmailGet
        onClose={close}
        onSuccess={(e) => { setEmail(e); setStep(2); }}
      />
    )}
    {step === 2 && (
      <VerifyCode
        email={email}
        onSuccess={() => setStep(3)}
        onClose={close}
        onBack={() => setStep(1)}
      />
    )}
    {step === 3 && <ResetPassword email={email} onSuccess={close} onBack={() => setStep(1)} />}
  </div>
</Modal>
  );
}