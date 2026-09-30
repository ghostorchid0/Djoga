import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'settings' | 'mobile' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as standalone PWA
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-xs text-[#D4A853] font-medium bg-[#D4A853]/10 px-3 py-2 rounded-lg border border-[#D4A853]/20">
          <CheckCircle2 className="w-4 h-4 text-[#D4A853] shrink-0" />
          <span>Application déjà installée sur cet appareil</span>
        </div>
      );
    }
    if (variant === 'mobile') {
      return (
        <div className="flex items-center gap-2 text-xs text-[#D4A853] font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#D4A853] shrink-0" />
          <span>Installée</span>
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={
          variant === 'settings'
            ? 'w-full flex items-center justify-center gap-2 rounded-xl bg-[#D4A853] hover:bg-[#B8956E] px-4 py-3 text-sm font-semibold text-white shadow-md active:scale-[0.98] transition cursor-pointer'
            : variant === 'mobile'
            ? 'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer text-white/80 hover:bg-white/10'
            : 'flex items-center gap-1.5 rounded-lg bg-[#D4A853]/15 hover:bg-[#D4A853]/25 border border-[#D4A853]/30 px-2.5 py-1.5 text-xs font-semibold text-[#D4A853] transition cursor-pointer'
        }
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>Installer l'app</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'settings'
              ? 'w-full flex items-center justify-center gap-2 rounded-xl bg-[#1A6B66] hover:bg-[#1A6B66] border border-[#E2E8F0] px-4 py-3 text-sm font-medium text-slate-200 active:scale-[0.98] transition cursor-pointer'
              : variant === 'mobile'
              ? 'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer text-white/80 hover:bg-white/10'
              : 'flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#1A6B66]/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer'
          }
        >
          <Share className="w-3.5 h-3.5 shrink-0" />
          <span>Installer sur iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-[#F0F4F2] border border-[#1A6B66] p-6 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A6B66]">
                <h3 className="text-base font-semibold text-white">Installer sur iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-gray-600 hover:text-white hover:bg-[#1A6B66] transition"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4A853]/20 text-xs font-bold text-[#D4A853]">1</span>
                  <span>Appuie sur le bouton <strong>Partager</strong> <Share className="inline w-3.5 h-3.5 mx-0.5" /> dans la barre Safari.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4A853]/20 text-xs font-bold text-[#D4A853]">2</span>
                  <span>Fais défiler vers le bas et choisis <strong>Sur l'écran d'accueil</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4A853]/20 text-xs font-bold text-[#D4A853]">3</span>
                  <span>Appuie sur <strong>Ajouter</strong> en haut à droite.</span>
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-[#1A6B66] hover:bg-[#E2E8F0] py-2.5 text-sm font-semibold text-white transition cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for desktop Chrome/Edge without prompt trigger or manual install help
  if (variant === 'settings') {
    return (
      <div className="text-xs text-gray-600 bg-[#F0F4F2]/60 p-3 rounded-xl border border-[#1A6B66]/80">
        💡 Pour installer l'application sur ton ordinateur ou mobile, clique sur l'icône d'installation dans la barre d'adresse de ton navigateur.
      </div>
    );
  }

  return null;
};
