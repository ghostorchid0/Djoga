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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[#F0F4F2] border border-[#1A6B66]/30 p-5 sm:p-6 shadow-lg">
      {/* Background glow element */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#D4A853]/10 to-[#0D4F4C]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#D4A853]/10 to-[#B8956E]/10 border border-[#D4A853]/20 text-[#6366F1]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[#1A6B66]/80 font-semibold block">
              ÉPARGNE DE SÉCURITÉ
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#0D4F4C]/80">
              <Target className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Objectif : <strong className="text-[#0D4F4C]">{formatFCFA(goalAmount)}</strong></span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4A853]/10 to-[#B8956E]/10 text-[#6366F1] border border-[#D4A853]/20">
            {clampedProgress.toFixed(1)} %
          </span>
        </div>
      </div>

      {/* Main Saved Amount Display */}
      <div className="my-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D4F4C] font-mono">
            {formatFCFA(totalSaved).replace(' FCFA', '')}
          </span>
          <span className="text-lg font-bold bg-gradient-to-r from-[#D4A853] to-[#B8956E] bg-clip-text text-transparent">FCFA</span>
        </div>
        <p className="text-xs text-[#1A6B66]/80 mt-1 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-[#D4A853] to-[#B8956E]" />
          <span>actuellement épargné dans ton fonds</span>
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono text-[#1A6B66]/80">
          <span>{formatFCFA(totalSaved)}</span>
          <span className="font-semibold text-[#0D4F4C]/80">{formatFCFA(goalAmount)}</span>
        </div>

        <div className="h-4 w-full bg-[#F1F5F9] rounded-full overflow-hidden p-0.5 border border-[#1A6B66]/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#D4A853] via-[#8B5CF6] to-[#B8956E] transition-all duration-500 ease-out relative"
            style={{ width: `${clampedProgress}%` }}
          >
            {clampedProgress > 15 && (
              <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-[#1A6B66]/80 pt-1">
          <span>{clampedProgress.toFixed(1)} % accompli</span>
          <span className="text-[#EC4899]/90 font-medium">
            Reste : {formatFCFA(remainingAmount)}
          </span>
        </div>
      </div>

      {/* Status banner (Ahead / Delay / On track) */}
      <div className="mt-4 pt-3.5 border-t border-[#1A6B66]/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp
            className={`w-4 h-4 shrink-0 ${
              gap > 0
                ? 'text-[#10B981]'
                : gap < 0
                ? 'text-[#F59E0B]'
                : 'text-[#1A6B66]/80'
            }`}
          />
          <span className="text-[#0D4F4C]/80">
            {gap > 0 ? (
              <>
                Tu es en <strong className="text-[#10B981] font-semibold">avance de {formatFCFA(gap)}</strong>
              </>
            ) : gap < 0 ? (
              <>
                Tu as <strong className="text-[#F59E0B] font-semibold">{formatFCFA(Math.abs(gap))} de retard</strong>
              </>
            ) : (
              <span>Tu es exactement au rythme prévu</span>
            )}
          </span>
        </div>

        <button
          onClick={onOpenContributionModal}
          className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] underline underline-offset-4 cursor-pointer"
        >
          Cotiser
        </button>
      </div>
    </div>
  );
};
