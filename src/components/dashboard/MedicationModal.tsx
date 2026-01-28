import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { X, Pill, Plus, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MedicationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MedicationModal({ open, onClose }: MedicationModalProps) {
  const { medications, addMedication, removeMedication } = useUser();
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newMedName.trim()) {
      setError('Please enter medication name');
      return;
    }
    if (!newMedTime) {
      setError('Please select a time');
      return;
    }
    
    // Format time for display
    const [hours, minutes] = newMedTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayTime = `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    
    addMedication({ name: newMedName.trim(), time: displayTime });
    setNewMedName('');
    setNewMedTime('');
    setError('');
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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Medication Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh] hide-scrollbar space-y-4">
              {/* Add New Medication */}
              <div className="care-card-sm bg-accent/30 border-primary/30">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Medication
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newMedName}
                    onChange={(e) => {
                      setNewMedName(e.target.value);
                      setError('');
                    }}
                    placeholder="Medication name"
                    className="care-input"
                  />
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <input
                      type="time"
                      value={newMedTime}
                      onChange={(e) => {
                        setNewMedTime(e.target.value);
                        setError('');
                      }}
                      className="care-input flex-1"
                    />
                  </div>
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <button onClick={handleAdd} className="btn-primary w-full">
                    Add Medication
                  </button>
                </div>
              </div>

              {/* Medication List */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Current Medications</h3>
                {medications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No medications added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {medications.map((med) => (
                      <motion.div
                        key={med.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-foreground">{med.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {med.time}
                          </p>
                        </div>
                        <button
                          onClick={() => removeMedication(med.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
