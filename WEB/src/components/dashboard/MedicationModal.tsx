import React, { useState } from 'react';
import { useUser, Medication } from '@/context/UserContext';
import { X, Pill, Plus, Trash2, Clock, Pencil, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MedicationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MedicationModal({ open, onClose }: MedicationModalProps) {
  const { medications, addMedication, updateMedication, removeMedication } = useUser();
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');

  const formatTimeForDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const parseTimeFor24 = (displayTime: string) => {
    // Convert "08:00 AM" to "08:00"
    const match = displayTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return '';
    let hour = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleAdd = () => {
    if (!newMedName.trim()) {
      setError('Please enter medication name');
      return;
    }
    if (!newMedTime) {
      setError('Please select a time');
      return;
    }
    
    const displayTime = formatTimeForDisplay(newMedTime);
    addMedication({ name: newMedName.trim(), time: displayTime });
    setNewMedName('');
    setNewMedTime('');
    setError('');
  };

  const startEditing = (med: Medication) => {
    setEditingId(med.id);
    setEditName(med.name);
    setEditTime(parseTimeFor24(med.time));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditTime('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!editName.trim()) return;
    if (!editTime) return;

    const displayTime = formatTimeForDisplay(editTime);
    updateMedication(editingId, { name: editName.trim(), time: displayTime });
    cancelEditing();
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
                        className="p-3 bg-muted/50 rounded-xl"
                      >
                        {editingId === med.id ? (
                          /* Edit Mode */
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Medication name"
                              className="care-input text-sm"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <input
                                type="time"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="care-input flex-1 text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-1"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{med.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {med.time}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEditing(med)}
                                className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                                title="Edit medication"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeMedication(med.id)}
                                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                                title="Delete medication"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
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
