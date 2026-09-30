import React from 'react';
import { formatFCFA, SavingsCalculations } from '../../lib/calculations';
import { Target, TrendingUp, ShieldCheck } from 'lucide-react';

interface ProgressCardProps {
  calculations: SavingsCalculations;
  onOpenContributionModal: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ calculations, onOpenContributionModal }) => {
  const { totalSaved, goalAmount, remainingAmount, progressPercentage, gap } = calculations;
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800/80 p-5 sm:p-6 shadow-xl">
      {/* Background glow element */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              ÉPARGNE DE SÉCURITÉ
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span>Objectif : <strong className="text-white">{formatFCFA(goalAmount)}</strong></span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
            {clampedProgress.toFixed(1)} %
          </span>
        </div>
      </div>

      {/* Main Saved Amount Display */}
      <div className="my-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
            {formatFCFA(totalSaved).replace(' FCFA', '')}
          </span>
          <span className="text-lg font-bold text-emerald-400">FCFA</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span>actuellement épargné dans ton fonds</span>
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <span>{formatFCFA(totalSaved)}</span>
          <span className="font-semibold text-slate-300">{formatFCFA(goalAmount)}</span>
        </div>

        <div className="h-3.5 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-500 ease-out relative"
            style={{ width: `${clampedProgress}%` }}
          >
            {clampedProgress > 15 && (
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
          <span>{clampedProgress.toFixed(1)} % accompli</span>
          <span className="text-amber-400/90 font-medium">
            Reste : {formatFCFA(remainingAmount)}
          </span>
        </div>
      </div>

      {/* Status banner (Ahead / Delay / On track) */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp
            className={`w-4 h-4 shrink-0 ${
              gap > 0
                ? 'text-emerald-400'
                : gap < 0
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          />
          <span className="text-slate-300">
            {gap > 0 ? (
              <>
                Tu es en <strong className="text-emerald-400 font-semibold">avance de {formatFCFA(gap)}</strong>
              </>
            ) : gap < 0 ? (
              <>
                Tu as <strong className="text-amber-400 font-semibold">{formatFCFA(Math.abs(gap))} de retard</strong>
              </>
            ) : (
              <span>Tu es exactement au rythme prévu</span>
            )}
          </span>
        </div>

        <button
          onClick={onOpenContributionModal}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
        >
          Cotiser
        </button>
      </div>
    </div>
  );
};
