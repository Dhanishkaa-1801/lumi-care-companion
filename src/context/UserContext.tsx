import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Medication {
  id: string;
  name: string;
  time: string;
  taken: boolean;
}

export interface UserProfile {
  role: 'patient' | 'caretaker' | null;
  name: string;
  age: string;
  phone: string;
  address: string;
  bloodGroup: string;
  healthIssues: string;
  nomineeName: string;
  nomineePhone: string;
}

export interface UserContextType {
  isAuthenticated: boolean;
  profile: UserProfile;
  medications: Medication[];
  dailyProgress: number;
  setAuthenticated: (value: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addMedication: (medication: Omit<Medication, 'id' | 'taken'>) => void;
  removeMedication: (id: string) => void;
  toggleMedicationTaken: (id: string) => void;
  logout: () => void;
}

const defaultProfile: UserProfile = {
  role: null,
  name: '',
  age: '',
  phone: '',
  address: '',
  bloodGroup: '',
  healthIssues: '',
  nomineeName: '',
  nomineePhone: '',
};

const defaultMedications: Medication[] = [
  { id: '1', name: 'Metformin', time: '08:00 AM', taken: true },
  { id: '2', name: 'Lisinopril', time: '12:00 PM', taken: false },
  { id: '3', name: 'Aspirin', time: '06:00 PM', taken: false },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [medications, setMedications] = useState<Medication[]>(defaultMedications);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addMedication = (medication: Omit<Medication, 'id' | 'taken'>) => {
    const newMed: Medication = {
      ...medication,
      id: Date.now().toString(),
      taken: false,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const removeMedication = (id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const toggleMedicationTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  const logout = () => {
    setAuthenticated(false);
    setProfile(defaultProfile);
    setMedications(defaultMedications);
  };

  const dailyProgress = medications.length > 0
    ? Math.round((medications.filter((m) => m.taken).length / medications.length) * 100)
    : 0;

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        profile,
        medications,
        dailyProgress,
        setAuthenticated,
        updateProfile,
        addMedication,
        removeMedication,
        toggleMedicationTaken,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
