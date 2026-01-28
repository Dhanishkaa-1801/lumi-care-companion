import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockTranscripts = [
  "I took my medicine",
  "I need help with my medication",
  "Feeling a bit tired today",
  "Please remind me to take water",
];

export default function MicInterface() {
  const { isListening, setIsListening, transcript, setTranscript, triggerEmergency, isEmergencyMode } = useApp();
  const [showTranscript, setShowTranscript] = useState(false);

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      setShowTranscript(true);
    } else {
      setIsListening(true);
      setTranscript('');
      setShowTranscript(false);
      
      // Simulate speech recognition
      setTimeout(() => {
        const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
        setTranscript(randomTranscript);
        
        // Check for emergency keyword
        if (randomTranscript.toLowerCase().includes('help')) {
          triggerEmergency();
        }
      }, 2000);
      
      // Auto stop after 3 seconds
      setTimeout(() => {
        setIsListening(false);
        setShowTranscript(true);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      {/* Status Text */}
      <motion.p 
        className={`text-lg font-medium ${isEmergencyMode ? 'text-white' : 'text-muted-foreground'}`}
        key={isListening ? 'listening' : 'idle'}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {isListening ? 'Listening...' : 'Tap to speak'}
      </motion.p>

      {/* Mic Button */}
      <div className="relative">
        {/* Pulse Rings */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className={`absolute inset-0 rounded-full ${isEmergencyMode ? 'bg-destructive' : 'bg-primary'}`}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className={`absolute inset-0 rounded-full ${isEmergencyMode ? 'bg-destructive' : 'bg-primary'}`}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={handleMicClick}
          className={`mic-button relative z-10 ${isEmergencyMode ? 'bg-destructive' : ''} ${isListening ? 'mic-button-active' : ''}`}
          whileTap={{ scale: 0.95 }}
          animate={isListening ? { scale: [1, 1.05, 1] } : {}}
          transition={isListening ? { duration: 1, repeat: Infinity } : {}}
        >
          {isListening ? (
            <Mic className="w-12 h-12" />
          ) : (
            <MicOff className="w-12 h-12" />
          )}
        </motion.button>
      </div>

      {/* Transcript Box */}
      <AnimatePresence>
        {showTranscript && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`care-card w-full text-center ${isEmergencyMode ? 'bg-white/10 border-white/20' : ''}`}
          >
            <p className={`text-sm font-medium mb-2 ${isEmergencyMode ? 'text-white/70' : 'text-muted-foreground'}`}>
              You said:
            </p>
            <p className={`text-lg font-semibold ${isEmergencyMode ? 'text-white' : 'text-foreground'}`}>
              "{transcript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden SOS Test Button */}
      <button
        onClick={triggerEmergency}
        className="mt-4 text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        Test SOS
      </button>
    </div>
  );
}
