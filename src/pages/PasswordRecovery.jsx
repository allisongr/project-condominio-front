import { useState } from 'react';
import ForgotPassword from '../components/ForgotPassword';
import VerifyResetCode from '../components/VerifyResetCode';
import ResetPassword from '../components/ResetPassword';

const PasswordRecovery = () => {
  const [step, setStep] = useState('forgot'); // 'forgot' | 'verify' | 'reset'
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleCodeSent = (sentEmail) => {
    setEmail(sentEmail);
    setStep('verify');
  };

  const handleCodeVerified = (verifiedEmail, token) => {
    setEmail(verifiedEmail);
    setResetToken(token);
    setStep('reset');
  };

  const handleResetSuccess = () => {
    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  };

  const handleBack = () => {
    if (step === 'verify') {
      setStep('forgot');
      setEmail('');
    } else if (step === 'reset') {
      setStep('verify');
    }
  };

  return (
    <>
      {step === 'forgot' && (
        <ForgotPassword
          onCodeSent={handleCodeSent}
          onBack={() => window.location.href = '/login'}
        />
      )}

      {step === 'verify' && (
        <VerifyResetCode
          email={email}
          onCodeVerified={handleCodeVerified}
          onBackEdit={handleBack}
        />
      )}

      {step === 'reset' && (
        <ResetPassword
          email={email}
          resetToken={resetToken}
          onSuccess={handleResetSuccess}
          onBack={handleBack}
        />
      )}
    </>
  );
};

export default PasswordRecovery;
