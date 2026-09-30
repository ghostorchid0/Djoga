import React from 'react';
import { Contribution } from '../../types/contribution';
import { AppSettings } from '../../types/settings';
import { SavingsCalculations, formatFCFA, formatDateFrench } from '../../lib/calculations';
import { ProgressCard } from '../ProgressCard/ProgressCard';
import {
  Plus,
  Flame,
  CalendarCheck2,
  Wallet,
  Coins,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  settings: AppSettings;
  calculations: SavingsCalculations;
  recentContributions: Contribution[];
  onOpenContributionModal: () => void;
  onNavigate: (tab: 'dashboard' | 'objective' | 'calendar' | 'history' | 'statistics' | 'projection' | 'milestones' | 'settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  calculations,
  recentContributions,
  onOpenContributionModal,
  onNavigate,
}) => {
  const {
    totalSaved,
    remainingAmount,
    totalDaysContributed,
    currentStreak,
    gap,
    milestones,
    neededDailyAmount,
  } = calculations;

  // Find next milestone to achieve
  const nextMilestone = milestones.find((m) => !m.achieved);

  return (
    <div className="space-y-5 pb-6 animate-in fade-in duration-150">
      {/* Strict Financial Discipline Banner */}
      <div className="bg-gradient-to-r bg-[#D4A853]/5 text-white/5 border border-[#6366F1]/20 rounded-lg px-4 py-3 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#6366F1] shrink-0" />
          <span className="truncate">
            <strong className="text-black">Règle de fer :</strong> Ce fonds est exclusivement dédié à ta sécurité financière personnelle (200 000 FCFA).
          </span>
        </div>
      </div>

      {/* Main Large Progress Card */}
      <ProgressCard
        calculations={calculations}
        onOpenContributionModal={onOpenContributionModal}
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Épargne actuelle */}
        <div className="bg-white border border-[#1A6B66]/30 rounded-lg p-3.5 sm:p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Épargne actuelle
            </span>
            <div className="p-1.5 rounded-lg bg-gradient-to-br bg-[#D4A853]/10 text-white/10 text-[#6366F1]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-mono text-black block">
              {formatFCFA(totalSaved)}
            </span>
            <span className="text-[10px] text-gray-600/70">total sécurisé</span>
          </div>
        </div>

        {/* 2. Montant restant */}
        <div className="bg-white border border-[#1A6B66]/30 rounded-lg p-3.5 sm:p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Reste à épargner
            </span>
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 text-[#F59E0B]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-mono text-black block">
              {formatFCFA(remainingAmount)}
            </span>
            <span className="text-[10px] text-gray-600/70">pour atteindre le but</span>
          </div>
        </div>

        {/* 3. Jours cotisés */}
        <div className="bg-white border border-[#1A6B66]/30 rounded-lg p-3.5 sm:p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Jours cotisés
            </span>
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 text-[#10B981]">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-mono text-black block">
              {totalDaysContributed} <span className="text-xs font-normal text-gray-600/70">jours</span>
            </span>
            <span className="text-[10px] text-gray-600/70">jours d'action active</span>
          </div>
        </div>

        {/* 4. Série actuelle */}
        <div className="bg-white border border-[#1A6B66]/30 rounded-lg p-3.5 sm:p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Série actuelle
            </span>
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 text-[#F59E0B]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold font-mono text-[#F59E0B] block">
                {currentStreak}
              </span>
              <span className="text-xs font-semibold text-[#F59E0B]/80">
                {currentStreak > 1 ? 'jours' : 'jour'}
              </span>
            </div>
            <span className="text-[10px] text-gray-600/70">≥ {settings.dailyTarget} F/jour</span>
          </div>
        </div>
      </div>

      {/* BIG PRIMARY CALL TO ACTION */}
      <div className="pt-1">
        <button
          onClick={onOpenContributionModal}
          className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#D4A853] hover:bg-[#B8956E] text-white font-black text-base py-4 px-6 shadow-xl shadow-[#D4A853]/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
          <span className="tracking-wide">+ AJOUTER UNE COTISATION</span>
        </button>
      </div>

      {/* Quick Insights Row: Rhythm status & Next Milestone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Ahead / Delay Card */}
        <div
          onClick={() => onNavigate('objective')}
          className="bg-white hover:bg-[#F8FAFC] border border-[#1A6B66]/30 hover:border-[#6366F1]/30 rounded-lg p-4 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {gap >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#F59E0B]" />
              )}
              <span className="text-xs font-semibold text-black/80 uppercase tracking-wider">
                Rythme & Synchronisation
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-600/60" />
          </div>

          <div className="mt-2.5">
            {gap > 0 ? (
              <p className="text-xs text-black/80">
                Tu es en <strong className="text-[#10B981] font-bold">avance de {formatFCFA(gap)}</strong> sur ton planning initial.
              </p>
            ) : gap < 0 ? (
              <p className="text-xs text-black/80">
                Tu as <strong className="text-[#F59E0B] font-bold">{formatFCFA(Math.abs(gap))} de retard</strong> sur la cible théorique.
              </p>
            ) : (
              <p className="text-xs text-black/80">
                Tu suis <strong className="text-[#10B981] font-bold">exactement le rythme prévu</strong> ({formatFCFA(settings.dailyTarget)} / jour).
              </p>
            )}

            {remainingAmount > 0 && neededDailyAmount > 0 && (
              <p className="text-[11px] text-gray-600/70 mt-1">
                Nouveau rythme conseillé : <strong className="text-black font-mono">{formatFCFA(neededDailyAmount)} / jour</strong>
              </p>
            )}
          </div>
        </div>

        {/* Next Milestone Card */}
        <div
          onClick={() => onNavigate('milestones')}
          className="bg-white hover:bg-[#F8FAFC] border border-[#1A6B66]/30 hover:border-[#6366F1]/30 rounded-lg p-4 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EC4899]" />
              <span className="text-xs font-semibold text-black/80 uppercase tracking-wider">
                Prochain Palier
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-600/60" />
          </div>

          <div className="mt-2.5">
            {nextMilestone ? (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-black">{nextMilestone.label}</span>
                  <span className="text-[#6366F1] font-mono">{formatFCFA(nextMilestone.amount)}</span>
                </div>
                <div className="text-[11px] text-gray-600/70 mt-1">
                  Encore {formatFCFA(Math.max(0, nextMilestone.amount - totalSaved))} à mobiliser pour valider cette étape.
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[#10B981] font-bold">
                  🎉 Tous les paliers ont été atteints avec succès !
                </p>
                <p className="text-[11px] text-gray-600/70 mt-1">
                  Fonds de sécurité de {formatFCFA(settings.goalAmount)} entièrement consolidé.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Contributions Preview */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Dernières cotisations
          </h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1 cursor-pointer"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentContributions.length === 0 ? (
          <div className="bg-white border border-dashed border-[#1A6B66]/30 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600">Aucune cotisation enregistrée pour le moment.</p>
            <p className="text-xs text-gray-600/60 mt-1">Commence dès aujourd'hui avec 1 000 FCFA pour poser ta première pierre.</p>
            <button
              onClick={onOpenContributionModal}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r bg-[#D4A853]/10 text-white/10 text-xs font-semibold text-[#6366F1] hover:bg-[#D4A853]/20 hover:text-white/20 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Faire ma première cotisation</span>
            </button>
          </div>
        ) : (
          <div className="bg-white border border-[#1A6B66]/30 rounded-lg divide-y divide-[#E2E8F0] overflow-hidden">
            {recentContributions.slice(0, 4).map((c) => (
              <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-[#F8FAFC] transition">
                <div>
                  <div className="text-xs font-bold text-black/80 uppercase tracking-wide">
                    {formatDateFrench(c.date, { day: 'numeric', month: 'short' })}
                  </div>
                  {c.note && (
                    <div className="text-[11px] text-gray-600/70 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                      {c.note}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-[#6366F1]">
                    +{formatFCFA(c.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
