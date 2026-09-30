import React, { useState } from 'react';
import { AppSettings } from '../../types/settings';
import { getTodayDateString } from '../../lib/calculations';
import { ShieldCheck, Target, ArrowRight, Check, Calendar, Banknote } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (settings: Partial<AppSettings>) => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [goalAmount, setGoalAmount] = useState<number>(200000);
  const [dailyTarget, setDailyTarget] = useState<number>(1000);
  const [startDate, setStartDate] = useState<string>(getTodayDateString());
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    try {
      setSubmitting(true);
      const start = new Date(startDate);
      const daysNeeded = Math.ceil(goalAmount / dailyTarget);
      const targetD = new Date(start);
      targetD.setDate(start.getDate() + daysNeeded);

      await onComplete({
        goalAmount,
        dailyTarget,
        startDate,
        targetDate: targetD.toISOString().split('T')[0],
        onboardingCompleted: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D4F4C]/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white border border-[#1A6B66]/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#D4A853]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-gray-600 block">
                SECURITY FUND
              </span>
              <span className="text-xs text-[#D4A853] font-semibold">
                Configuration initiale
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s ? 'w-6 bg-[#D4A853]' : step > s ? 'w-2 bg-[#D4A853]' : 'w-2 bg-[#1A6B66]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Goal Amount */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D4A853] uppercase tracking-wider">
                Étape 1 sur 3
              </span>
              <h2 className="text-lg font-bold text-white">
                Quel est ton objectif d'épargne ?
              </h2>
              <p className="text-xs text-gray-600">
                La somme cible pour construire ton bouclier financier de sécurité.
              </p>
            </div>

            <div className="pt-2">
              <div className="relative">
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full bg-[#0D4F4C] border border-[#E2E8F0] rounded-2xl px-4 py-3.5 text-xl font-bold font-mono text-white focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] pr-16"
                  min="5000"
                  step="5000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">
                  FCFA
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {[100000, 200000, 300000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setGoalAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      goalAmount === amt
                        ? 'bg-[#D4A853]/20 border-[#D4A853] text-[#D4A853]'
                        : 'bg-[#1A6B66]/60 border-[#E2E8F0] text-gray-600 hover:text-white'
                    }`}
                  >
                    {amt.toLocaleString('fr-FR')} F
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl bg-[#D4A853] hover:bg-[#D4A853] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D4A853]/40 cursor-pointer transition"
              >
                <span>Continuer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Daily Target */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D4A853] uppercase tracking-wider">
                Étape 2 sur 3
              </span>
              <h2 className="text-lg font-bold text-white">
                Combien veux-tu épargner par jour ?
              </h2>
              <p className="text-xs text-gray-600">
                La cotisation quotidienne recommandée pour progresser sans rupture.
              </p>
            </div>

            <div className="pt-2">
              <div className="relative">
                <input
                  type="number"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="w-full bg-[#0D4F4C] border border-[#E2E8F0] rounded-2xl px-4 py-3.5 text-xl font-bold font-mono text-white focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] pr-16"
                  min="200"
                  step="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">
                  FCFA / j
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {[500, 1000, 1500, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDailyTarget(amt)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      dailyTarget === amt
                        ? 'bg-[#D4A853]/20 border-[#D4A853] text-[#D4A853]'
                        : 'bg-[#1A6B66]/60 border-[#E2E8F0] text-gray-600 hover:text-white'
                    }`}
                  >
                    {amt.toLocaleString('fr-FR')} F
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-4 rounded-xl bg-[#1A6B66] text-gray-700 hover:bg-[#1A6B66] text-xs font-semibold cursor-pointer"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-xl bg-[#D4A853] hover:bg-[#D4A853] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D4A853]/40 cursor-pointer transition"
              >
                <span>Continuer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Start Date & Confirmation */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#D4A853] uppercase tracking-wider">
                Étape 3 sur 3
              </span>
              <h2 className="text-lg font-bold text-white">Quand commences-tu ?</h2>
              <p className="text-xs text-gray-600">
                Choisis le point de départ de ton engagement financier.
              </p>
            </div>

            <div className="pt-2">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0D4F4C] border border-[#E2E8F0] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#D4A853] pl-10"
                />
                <Calendar className="w-4 h-4 text-gray-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Discipline Pledge */}
            <div className="bg-[#0D4F4C]/80 border border-[#1A6B66] rounded-xl p-3.5 text-xs text-gray-700 space-y-1">
              <div className="font-semibold text-[#D4A853] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Règle d'or de sanctuarisation</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Ce fonds est dédié uniquement à ta tranquillité d'esprit (imprévus de sécurité). Il est entièrement dissocié de toute autre dépense ou entreprise.
              </p>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3.5 px-4 rounded-xl bg-[#1A6B66] text-gray-700 hover:bg-[#1A6B66] text-xs font-semibold cursor-pointer"
              >
                Retour
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="flex-1 py-3.5 rounded-xl bg-[#D4A853] hover:bg-[#B8956E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D4A853]/40 cursor-pointer transition disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>COMMENCER MON ÉPARGNE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
