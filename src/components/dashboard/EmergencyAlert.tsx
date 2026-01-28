import React from 'react';
import { useApp } from '@/context/AppContext';
import { useUser } from '@/context/UserContext';
import { AlertTriangle, Phone, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencyAlert() {
  const { isEmergencyMode, clearEmergency } = useApp();
  const { profile } = useUser();

  const handleCall = () => {
    // In a real app, this would trigger a phone call
    window.open(`tel:${profile.nomineePhone}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isEmergencyMode && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-[100] p-4"
        >
          <div className="max-w-md mx-auto bg-destructive rounded-2xl shadow-emergency overflow-hidden">
            {/* Alert Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/20">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <AlertTriangle className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-bold text-white text-lg">EMERGENCY ALERT</span>
              </div>
              <button
                onClick={clearEmergency}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Alert Content */}
            <div className="p-4">
              <p className="text-white/90 text-center mb-4">
                <span className="font-bold">{profile.name || 'User'}</span> needs help!
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCall}
                  className="flex-1 bg-white text-destructive font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call {profile.nomineeName || 'Nominee'}
                </button>
                <button className="bg-white/20 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/30 transition-colors">
                  <Camera className="w-5 h-5" />
                  Camera
                </button>
              </div>
            </div>

            {/* Pulsing Bottom Bar */}
            <motion.div
              className="h-1 bg-white/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
