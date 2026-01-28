import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { X, Shield, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencySettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EmergencySettingsModal({ open, onClose }: EmergencySettingsModalProps) {
  const { profile, updateProfile } = useUser();
  const [nomineeName, setNomineeName] = useState(profile.nomineeName);
  const [nomineePhone, setNomineePhone] = useState(profile.nomineePhone);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!nomineeName.trim()) {
      setError('Please enter nominee name');
      return;
    }
    if (!nomineePhone || nomineePhone.length < 10) {
      setError('Please enter valid phone number');
      return;
    }
    
    updateProfile({ nomineeName, nomineePhone });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-destructive" />
                <h2 className="text-xl font-bold text-foreground">Emergency Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="care-card-sm bg-destructive/5 border-destructive/20">
                <p className="text-sm text-muted-foreground mb-4">
                  This contact will be notified in case of an emergency. Make sure the information is accurate.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={nomineeName}
                      onChange={(e) => {
                        setNomineeName(e.target.value);
                        setError('');
                      }}
                      placeholder="Jane Doe"
                      className="care-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={nomineePhone}
                      onChange={(e) => {
                        setNomineePhone(e.target.value);
                        setError('');
                      }}
                      placeholder="+1 (555) 000-0000"
                      className="care-input"
                    />
                  </div>

                  {error && <p className="text-destructive text-sm">{error}</p>}
                  
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-success"
                    >
                      <Save className="w-4 h-4" />
                      <span className="font-medium">Saved successfully!</span>
                    </motion.div>
                  )}
                </div>
              </div>

              <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
