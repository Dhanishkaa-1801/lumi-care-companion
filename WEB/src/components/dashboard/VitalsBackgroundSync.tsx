import React, { useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';

export default function VitalsBackgroundSync() {
    const { saveVitals, isAuthenticated, profile } = useUser();
    const bufferRef = useRef<any[]>([]);

    useEffect(() => {
        // Only run for authenticated patients
        if (!isAuthenticated || profile.role !== 'patient') return;

        const fetchData = async () => {
            try {
                const res = await fetch(`http://${window.location.hostname}:8001/all`);
                const data = await res.json();

                const payload = [
                    {
                        metric_type: 'heart_rate',
                        value: data.heart_beat.heart_rate.toString(),
                        unit: 'bpm',
                        timestamp: new Date().toISOString()
                    },
                    {
                        metric_type: 'blood_pressure',
                        value: `${data.blood_pressure.systolic}/${data.blood_pressure.diastolic}`,
                        unit: 'mmHg',
                        timestamp: new Date().toISOString()
                    },
                    {
                        metric_type: 'steps',
                        value: data.step_count.steps.toString(),
                        unit: 'count',
                        timestamp: new Date().toISOString()
                    }
                ];

                // Sync immediately without buffering
                await saveVitals(payload);
                console.log("Background: Synced vitals to server");

            } catch (err) {
                // Silent failure in background
                // console.warn("Background vitals fetch failed", err);
            }
        };

        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, [isAuthenticated, profile.role, saveVitals]);

    /* Removed Buffered Sync Loop */

    return null; // Invisible component
}
