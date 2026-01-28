import React, { useState } from 'react';
import { useUser, Medication } from '@/context/UserContext';
import { X, Pill, Plus, Trash2, Clock, Pencil, Check, XCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MedicationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MedicationModal({ open, onClose }: MedicationModalProps) {
  const { medications, addMedication, updateMedication, removeMedication } = useUser();
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedStartDate, setNewMedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMedEndDate, setNewMedEndDate] = useState('');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const formatTimeForDisplay = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const parseTimeFor24 = (displayTime: string) => {
    // Backend sends "HH:MM". If displayTime is already "HH:MM" (from backend), just return it?
    // Wait, backend sends "HH:MM". Frontend input type="time" uses "HH:MM".
    // So we don't need complex parsing if we just standardise on 24h format for state?
    // But `formatTimeForDisplay` converts to AM/PM for UI.

    // If input is "08:00 AM", parse it.
    // If input is "08:00", return it.

    const input = displayTime || "";
    if (input.includes("M")) { // AM/PM
      const match = input.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return '';
      let hour = parseInt(match[1]);
      const minutes = match[2];
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    }
    return input;
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

    // We store time as HH:MM 24h string (backend format)
    addMedication({
      name: newMedName.trim(),
      scheduled_time: newMedTime,
      dosage: newMedDosage || "1 pill",
      start_date: newMedStartDate || new Date().toISOString().split('T')[0],
      end_date: newMedEndDate || undefined
    });
    setNewMedName('');
    setNewMedTime('');
    setNewMedDosage('');
    setNewMedStartDate(new Date().toISOString().split('T')[0]);
    setNewMedEndDate('');
    setError('');
  };

  const startEditing = (med: Medication) => {
    setEditingId(med.id);
    setEditName(med.name);
    setEditTime(med.scheduled_time); // Assumed to be HH:MM
    setEditDosage(med.dosage);
    setEditStartDate(med.start_date);
    setEditEndDate(med.end_date || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditTime('');
    setEditDosage('');
    setEditStartDate('');
    setEditEndDate('');
  };

  const saveEdit = () => {
    if (editingId === null) return;
    if (!editName.trim()) return;
    if (!editTime) return;

    updateMedication(editingId, {
      name: editName.trim(),
      scheduled_time: editTime,
      dosage: editDosage,
      start_date: editStartDate || undefined,
      end_date: editEndDate || undefined // If empty string, send undefined/null? Schema allows null.
    });
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
            className="fixed inset-x-4 top-[10%] max-w-md mx-auto bg-card rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[85vh] flex flex-col"
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
            <div className="p-4 overflow-y-auto flex-1 hide-scrollbar space-y-4">
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
                  <input
                    type="text"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="Dosage (e.g., 500mg)"
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">From</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <input
                          type="date"
                          value={newMedStartDate}
                          onChange={(e) => setNewMedStartDate(e.target.value)}
                          className="care-input text-sm p-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">To (Optional)</label>
                      <input
                        type="date"
                        value={newMedEndDate}
                        onChange={(e) => setNewMedEndDate(e.target.value)}
                        className="care-input text-sm p-2"
                      />
                    </div>
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
                            <input
                              type="text"
                              value={editDosage}
                              onChange={(e) => setEditDosage(e.target.value)}
                              placeholder="Dosage"
                              className="care-input text-sm"
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
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground">From</label>
                                <input
                                  type="date"
                                  value={editStartDate}
                                  onChange={(e) => setEditStartDate(e.target.value)}
                                  className="care-input text-xs p-1 h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground">To</label>
                                <input
                                  type="date"
                                  value={editEndDate}
                                  onChange={(e) => setEditEndDate(e.target.value)}
                                  className="care-input text-xs p-1 h-8"
                                />
                              </div>
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
                              <p className="font-medium text-foreground">{med.name} <span className="text-xs text-muted-foreground">({med.dosage})</span></p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeForDisplay(med.scheduled_time)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {med.start_date} {med.end_date ? `- ${med.end_date}` : ''}
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
