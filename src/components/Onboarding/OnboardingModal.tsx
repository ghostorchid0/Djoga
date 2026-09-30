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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
                SECURITY FUND
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                Configuration initiale
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s ? 'w-6 bg-emerald-400' : step > s ? 'w-2 bg-emerald-600' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Goal Amount */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Étape 1 sur 3
              </span>
              <h2 className="text-lg font-bold text-white">
                Quel est ton objectif d'épargne ?
              </h2>
              <p className="text-xs text-slate-400">
                La somme cible pour construire ton bouclier financier de sécurité.
              </p>
            </div>

            <div className="pt-2">
              <div className="relative">
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-16"
                  min="5000"
                  step="5000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
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
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
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
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition"
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
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Étape 2 sur 3
              </span>
              <h2 className="text-lg font-bold text-white">
                Combien veux-tu épargner par jour ?
              </h2>
              <p className="text-xs text-slate-400">
                La cotisation quotidienne recommandée pour progresser sans rupture.
              </p>
            </div>

            <div className="pt-2">
              <div className="relative">
                <input
                  type="number"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-16"
                  min="200"
                  step="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
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
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
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
                className="py-3.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 text-xs font-semibold cursor-pointer"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition"
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
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Étape 3 sur 3
              </span>
              <h2 className="text-lg font-bold text-white">Quand commences-tu ?</h2>
              <p className="text-xs text-slate-400">
                Choisis le point de départ de ton engagement financier.
              </p>
            </div>

            <div className="pt-2">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 pl-10"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Discipline Pledge */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Règle d'or de sanctuarisation</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ce fonds est dédié uniquement à ta tranquillité d'esprit (imprévus de sécurité). Il est entièrement dissocié de toute autre dépense ou entreprise.
              </p>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 text-xs font-semibold cursor-pointer"
              >
                Retour
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition disabled:opacity-50"
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
