import React from 'react';
import { useUser } from '@/context/UserContext';
import { X, User, Phone, MapPin, Droplet, Heart, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { profile } = useUser();

  const profileItems = [
    { icon: User, label: 'Name', value: profile.name || 'Not set' },
    { icon: User, label: 'Age', value: profile.age ? `${profile.age} years` : 'Not set' },
    { icon: Phone, label: 'Phone', value: profile.phone || 'Not set' },
    { icon: MapPin, label: 'Address', value: profile.address || 'Not set' },
    { icon: Droplet, label: 'Blood Group', value: profile.bloodGroup || 'Not set' },
    { icon: Heart, label: 'Health Issues', value: profile.healthIssues || 'None listed' },
    { icon: Shield, label: 'Emergency Contact', value: profile.nomineeName ? `${profile.nomineeName} (${profile.nomineePhone})` : 'Not set' },
  ];

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
              <h2 className="text-xl font-bold text-foreground">My Profile</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh] hide-scrollbar space-y-3">
              {/* Avatar */}
              <div className="flex flex-col items-center py-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold mb-2">
                  {profile.name ? profile.name[0].toUpperCase() : 'U'}
                </div>
                <p className="text-lg font-semibold text-foreground">{profile.name || 'User'}</p>
                <p className="text-sm text-muted-foreground capitalize">{profile.role || 'Patient'}</p>
              </div>

              {/* Profile Items */}
              {profileItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
