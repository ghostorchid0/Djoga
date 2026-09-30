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
    <div className="relative overflow-hidden rounded-2xl bg-white border border-[#D4A574]/30 p-5 sm:p-6 shadow-xl">
      {/* Background glow element */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4A853]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/30 text-[#D4A853]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[#D4A574] font-semibold block">
              ÉPARGNE DE SÉCURITÉ
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#3D2B1F]/80">
              <Target className="w-3.5 h-3.5 text-[#D4A574]" />
              <span>Objectif : <strong className="text-[#1A1A1A]">{formatFCFA(goalAmount)}</strong></span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#D4A853]/10 text-[#3D2B1F] border border-[#D4A853]/30">
            {clampedProgress.toFixed(1)} %
          </span>
        </div>
      </div>

      {/* Main Saved Amount Display */}
      <div className="my-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A] font-mono">
            {formatFCFA(totalSaved).replace(' FCFA', '')}
          </span>
          <span className="text-lg font-bold text-[#D4A853]">FCFA</span>
        </div>
        <p className="text-xs text-[#D4A574] mt-1 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#D4A853]" />
          <span>actuellement épargné dans ton fonds</span>
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono text-[#D4A574]">
          <span>{formatFCFA(totalSaved)}</span>
          <span className="font-semibold text-[#1A1A1A]/80">{formatFCFA(goalAmount)}</span>
        </div>

        <div className="h-3.5 w-full bg-[#E8E4DC] rounded-full overflow-hidden p-0.5 border border-[#D4A574]/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#D4A853] via-[#E8B86D] to-[#C77D63] transition-all duration-500 ease-out relative"
            style={{ width: `${clampedProgress}%` }}
          >
            {clampedProgress > 15 && (
              <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-[#D4A574] pt-1">
          <span>{clampedProgress.toFixed(1)} % accompli</span>
          <span className="text-[#C77D63]/90 font-medium">
            Reste : {formatFCFA(remainingAmount)}
          </span>
        </div>
      </div>

      {/* Status banner (Ahead / Delay / On track) */}
      <div className="mt-4 pt-3.5 border-t border-[#D4A574]/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp
            className={`w-4 h-4 shrink-0 ${
              gap > 0
                ? 'text-[#4A5D23]'
                : gap < 0
                ? 'text-[#C77D63]'
                : 'text-[#D4A574]'
            }`}
          />
          <span className="text-[#1A1A1A]/80">
            {gap > 0 ? (
              <>
                Tu es en <strong className="text-[#4A5D23] font-semibold">avance de {formatFCFA(gap)}</strong>
              </>
            ) : gap < 0 ? (
              <>
                Tu as <strong className="text-[#C77D63] font-semibold">{formatFCFA(Math.abs(gap))} de retard</strong>
              </>
            ) : (
              <span>Tu es exactement au rythme prévu</span>
            )}
          </span>
        </div>

        <button
          onClick={onOpenContributionModal}
          className="text-xs font-semibold text-[#D4A853] hover:text-[#E8B86D] underline underline-offset-4 cursor-pointer"
        >
          Cotiser
        </button>
      </div>
    </div>
  );
};
