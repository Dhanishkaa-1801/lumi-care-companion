import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Phone, ArrowLeft, Check } from 'lucide-react';

interface PhoneVerifyProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PhoneVerify({ onNext, onBack }: PhoneVerifyProps) {
  const { profile, updateProfile } = useUser();
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (!profile.phone || profile.phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      setIsVerified(true);
      setTimeout(onNext, 1000);
    } else {
      setError('Please enter a valid 6-digit OTP');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Verify Your Phone</h2>
        <p className="text-muted-foreground">
          {otpSent ? 'Enter the OTP sent to your phone' : 'Enter your phone number to continue'}
        </p>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        {!otpSent ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => {
                  updateProfile({ phone: e.target.value });
                  setError('');
                }}
                placeholder="+1 (555) 000-0000"
                className="care-input"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="000000"
                className="care-input text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive code?{' '}
              <button className="text-primary hover:underline">Resend</button>
            </p>
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
          </div>
        )}

        {isVerified && (
          <div className="flex items-center justify-center gap-2 text-success mt-6 animate-fade-in">
            <Check className="w-5 h-5" />
            <span className="font-medium">Verified Successfully!</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6">
        {!otpSent ? (
          <button onClick={handleSendOtp} className="btn-primary w-full">
            Send OTP
          </button>
        ) : !isVerified ? (
          <button onClick={handleVerifyOtp} className="btn-primary w-full">
            Verify OTP
          </button>
        ) : null}
      </div>
    </div>
  );
}
