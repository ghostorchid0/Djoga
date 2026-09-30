import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
    } else if (hasBeenOffline) {
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
        setHasBeenOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  if (!isOnline) {
    return (
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/90 text-[#0D4F4C] font-medium px-4 py-2.5 text-xs shadow-lg backdrop-blur-xs animate-in slide-in-from-bottom-2">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
        <span>Mode hors-ligne · Vos données restent 100% enregistrées en local</span>
      </div>
    );
  }

  if (showRestoredNotice) {
    return (
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#D4A853]/95 text-white font-semibold px-4 py-2.5 text-xs shadow-lg animate-in slide-in-from-bottom-2">
        <Wifi className="w-4 h-4 shrink-0" />
        <span>Connexion rétablie · Données synchronisées</span>
      </div>
    );
  }

  return null;
};
