import React, { useState, ReactNode, useEffect } from 'react';
import { UserContext } from './UserContext';
import { UserProfile, Medication, Nominee } from './UserContext';
import api from '../lib/api';

const defaultProfile: UserProfile = {
    fullname: '',
    name: '',
    phone: '',
    age: '',
    bloodGroup: '',
    address: '',
    healthIssues: '',
    nomineeName: '',
    nomineePhone: '',
    role: 'patient',
};

export function UserProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [nominees, setNominees] = useState<Nominee[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    // Initialize axios token
    if (localStorage.getItem('token')) {
        api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    }

    const updateProfile = async (updates: Partial<UserProfile>) => {
        // Update local state immediately
        setProfile((prev) => ({ ...prev, ...updates }));

        if (isAuthenticated) {
            try {
                // Map frontend profile to backend UserUpdate
                const payload: any = {};
                if (updates.name) payload.fullname = updates.name; // Map name -> fullname
                if (updates.fullname) payload.fullname = updates.fullname;
                if (updates.bloodGroup) payload.blood_group = updates.bloodGroup;
                if (updates.address) payload.address = updates.address;
                if (updates.healthIssues) payload.health_issues = updates.healthIssues;

                // Handle Age -> DOB conversion if age is updated
                if (updates.age) {
                    const age = parseInt(updates.age);
                    const dob = new Date();
                    dob.setFullYear(dob.getFullYear() - age);
                    payload.dob = dob.toISOString().split('T')[0];
                }

                await api.put('/users/me', payload);
            } catch (error) {
                console.error("Failed to update profile", error);
            }
        }
    };

    const refreshProfile = async () => {
        try {
            const res = await api.get('/users/me');
            const user = res.data;
            // Map backend user to frontend profile
            const birthYear = new Date(user.dob).getFullYear();
            const currentYear = new Date().getFullYear();
            const age = (currentYear - birthYear).toString();

            setProfile(prev => ({
                ...prev,
                fullname: user.fullname,
                name: user.fullname, // Ensure name is synced with fullname
                phone: user.phone,
                age: age, // Derived
                bloodGroup: user.blood_group,
                address: user.address,
                healthIssues: user.health_issues || "",
                role: user.role || "patient"
            }));

            // Also fetch medications
            const medsRes = await api.get('/medications');
            setMedications(medsRes.data);

            // Fetch nominees
            const nomineesRes = await api.get('/nominees/');
            setNominees(nomineesRes.data);
        } catch (e) {
            console.error("Failed to refresh profile", e);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            refreshProfile();
        }

        const handleSessionExpired = () => {
            // Show toast and logout
            // Need to import toast or use simple alert if toast not available in this scope easily
            // Dispatch logout
            logout();
            alert("Session Expired: You have logged in on another device.");
        };

        window.addEventListener('session-expired', handleSessionExpired);
        return () => window.removeEventListener('session-expired', handleSessionExpired);
    }, [isAuthenticated]);

    const addMedication = async (medication: Omit<Medication, 'id' | 'taken'>) => {
        try {
            const res = await api.post('/medications', {
                ...medication,
            });
            setMedications((prev) => [...prev, res.data]);
        } catch (error) {
            console.error("Failed to add medication", error);
        }
    };

    const updateMedication = async (id: number, updates: Partial<Omit<Medication, 'id'>>) => {
        try {
            const res = await api.put(`/medications/${id}`, updates);

            setMedications((prev) =>
                prev.map((med) =>
                    med.id === id ? { ...med, ...res.data } : med
                )
            );
        } catch (error) {
            console.error("Failed to update med", error);
        }
    };

    const removeMedication = async (id: number) => {
        try {
            await api.delete(`/medications/${id}`);
            setMedications((prev) => prev.filter((med) => med.id !== id));
        } catch (error) {
            console.error("Failed to delete med", error);
        }
    };

    const addNominee = async (nominee: { name: string; phone: string; relationship: string }) => {
        try {
            const res = await api.post('/nominees/', nominee);
            setNominees((prev) => [...prev, res.data]);
        } catch (error) {
            console.error("Failed to add nominee", error);
        }
    };

    const removeNominee = async (id: number) => {
        try {
            await api.delete(`/nominees/${id}`);
            setNominees((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error("Failed to remove nominee", error);
        }
    };

    const updateNominee = async (id: number, updates: { name?: string; phone?: string; relationship?: string }) => {
        try {
            const res = await api.put(`/nominees/${id}`, updates);
            setNominees((prev) => prev.map((n) => (n.id === id ? res.data : n)));
        } catch (error) {
            console.error("Failed to update nominee", error);
        }
    };

    const saveVitals = async (metrics: { metric_type: string; value: string; unit: string; timestamp: string }[]) => {
        try {
            if (metrics.length === 0) return;
            await api.post('/vitals/', metrics);
        } catch (error) {
            console.error("Failed to save vitals", error);
        }
    };

    const toggleMedicationTaken = (id: number) => {
        setMedications((prev) =>
            prev.map((med) =>
                med.id === id ? { ...med, taken: !med.taken } : med
            )
        );
    };

    const logout = async () => {
        try {
            await api.post('/users/logout');
        } catch (e) {
            console.error("Failed to call logout API", e);
        }
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setProfile(defaultProfile);
        setMedications([]);
    };

    const dailyProgress = medications.length > 0
        ? Math.round((medications.filter((m) => m.taken).length / medications.length) * 100)
        : 0;

    const checkUser = async (phone: string): Promise<boolean> => {
        try {
            const res = await api.post('/auth/check-user', { phone });
            return res.data.exists;
        } catch (error) {
            console.error("Check use error", error);
            throw error;
        }
    };

    const login = async (phone: string, otp: string) => {
        try {
            const res = await api.post('/auth/login', { phone: phone, otp: otp });
            localStorage.setItem('token', res.data.access_token);
            setIsAuthenticated(true);
            refreshProfile(); // Load profile immediately
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const register = async (finalProfile: UserProfile) => {
        try {
            const age = parseInt(finalProfile.age) || 30;
            const dob = new Date();
            dob.setFullYear(dob.getFullYear() - age);

            const payload = {
                fullname: finalProfile.name,
                phone: finalProfile.phone,
                dob: dob.toISOString().split('T')[0],
                blood_group: finalProfile.bloodGroup || 'O+',
                address: finalProfile.address || 'Unknown',
                health_issues: finalProfile.healthIssues || '',
                role: finalProfile.role || 'patient',
                otp: finalProfile.otp || '1234'
            };

            const res = await api.post('/auth/register', payload);
            localStorage.setItem('token', res.data.access_token);
            setIsAuthenticated(true);
            refreshProfile();

            if (finalProfile.nomineeName) {
                await api.post('/nominees/', {
                    name: finalProfile.nomineeName,
                    phone: finalProfile.nomineePhone,
                    relationship: "Nominee",
                });
            }

            return true;
        } catch (error) {
            console.error("Register failed", error);
            return false;
        }
    };

    return (
        <UserContext.Provider
            value={{
                isAuthenticated,
                profile,
                medications,
                nominees,
                dailyProgress,
                setAuthenticated: setIsAuthenticated,
                updateProfile,
                addMedication,
                updateMedication,
                removeMedication,
                toggleMedicationTaken,
                addNominee,
                updateNominee,
                removeNominee,
                saveVitals,
                logout,
                login,
                register,
                checkUser
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
