import React from 'react';
import { useUser } from '@/context/UserContext';
import { useApp } from '@/context/AppContext';
import Header from './Header';
import MicInterface from './MicInterface';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import EmergencyAlert from './EmergencyAlert';
import ProfileModal from './ProfileModal';
import MedicationModal from './MedicationModal';
import EmergencySettingsModal from './EmergencySettingsModal';

export default function Dashboard() {
  const { isEmergencyMode } = useApp();
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showMedicationModal, setShowMedicationModal] = React.useState(false);
  const [showEmergencySettings, setShowEmergencySettings] = React.useState(false);

  return (
    <div className={`min-h-screen bg-background flex flex-col relative overflow-hidden ${isEmergencyMode ? 'emergency-mode' : ''}`}>
      <Header onProfileClick={() => setShowProfileModal(true)} />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <MicInterface />
      </main>

      <LeftSidebar />
      <RightSidebar 
        onMedicationSettings={() => setShowMedicationModal(true)}
        onEmergencySettings={() => setShowEmergencySettings(true)}
      />

      {/* Modals */}
      <ProfileModal open={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <MedicationModal open={showMedicationModal} onClose={() => setShowMedicationModal(false)} />
      <EmergencySettingsModal open={showEmergencySettings} onClose={() => setShowEmergencySettings(false)} />
      
      {/* Emergency Alert */}
      <EmergencyAlert />
    </div>
  );
}
