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
      <div className="bg-[#3D2B1F]/50 border border-[#D4A574]/30 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-[#D4A574]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#D4A853] shrink-0" />
          <span className="truncate">
            <strong className="text-[#F5F0E6]">Règle de fer :</strong> Ce fonds est exclusivement dédié à ta sécurité financière personnelle (200 000 FCFA).
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
        <div className="bg-[#3D2B1F]/40 border border-[#D4A574]/30 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#D4A574] uppercase tracking-wider">
              Épargne actuelle
            </span>
            <div className="p-1.5 rounded-lg bg-[#D4A853]/10 text-[#D4A853]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-mono text-[#F5F0E6] block">
              {formatFCFA(totalSaved)}
            </span>
            <span className="text-[10px] text-[#D4A574]/70">total sécurisé</span>
          </div>
        </div>

        {/* 2. Montant restant */}
        <div className="bg-[#3D2B1F]/40 border border-[#D4A574]/30 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#D4A574] uppercase tracking-wider">
              Reste à épargner
            </span>
            <div className="p-1.5 rounded-lg bg-[#C77D63]/10 text-[#C77D63]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-mono text-[#E8B86D] block">
              {formatFCFA(remainingAmount)}
            </span>
            <span className="text-[10px] text-[#D4A574]/70">pour atteindre le but</span>
          </div>
        </div>

        {/* 3. Jours cotisés */}
        <div className="bg-[#3D2B1F]/40 border border-[#D4A574]/30 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#D4A574] uppercase tracking-wider">
              Jours cotisés
            </span>
            <div className="p-1.5 rounded-lg bg-[#4A5D23]/10 text-[#4A5D23]">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold font-mono text-[#F5F0E6] block">
              {totalDaysContributed} <span className="text-xs font-normal text-[#D4A574]/70">jours</span>
            </span>
            <span className="text-[10px] text-[#D4A574]/70">jours d'action active</span>
          </div>
        </div>

        {/* 4. Série actuelle */}
        <div className="bg-[#3D2B1F]/40 border border-[#D4A574]/30 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#D4A574] uppercase tracking-wider">
              Série actuelle
            </span>
            <div className="p-1.5 rounded-lg bg-[#C77D63]/10 text-[#C77D63]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold font-mono text-[#C77D63] block">
                {currentStreak}
              </span>
              <span className="text-xs font-semibold text-[#E8B86D]">
                {currentStreak > 1 ? 'jours' : 'jour'}
              </span>
            </div>
            <span className="text-[10px] text-[#D4A574]/70">≥ {settings.dailyTarget} F/jour</span>
          </div>
        </div>
      </div>

      {/* BIG PRIMARY CALL TO ACTION */}
      <div className="pt-1">
        <button
          onClick={onOpenContributionModal}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#D4A853] via-[#E8B86D] to-[#C77D63] hover:from-[#E8B86D] hover:to-[#D4A853] text-[#1A1A1A] font-black text-base py-4 px-6 shadow-xl shadow-[#3D2B1F]/40 active:scale-[0.98] transition-all cursor-pointer"
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
          className="bg-[#3D2B1F]/40 hover:bg-[#3D2B1F]/60 border border-[#D4A574]/30 hover:border-[#D4A574]/50 rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {gap >= 0 ? (
                <TrendingUp className="w-4 h-4 text-[#4A5D23]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#C77D63]" />
              )}
              <span className="text-xs font-semibold text-[#F5F0E6]/80 uppercase tracking-wider">
                Rythme & Synchronisation
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4A574]/60" />
          </div>

          <div className="mt-2.5">
            {gap > 0 ? (
              <p className="text-xs text-[#F5F0E6]/80">
                Tu es en <strong className="text-[#4A5D23] font-bold">avance de {formatFCFA(gap)}</strong> sur ton planning initial.
              </p>
            ) : gap < 0 ? (
              <p className="text-xs text-[#F5F0E6]/80">
                Tu as <strong className="text-[#C77D63] font-bold">{formatFCFA(Math.abs(gap))} de retard</strong> sur la cible théorique.
              </p>
            ) : (
              <p className="text-xs text-[#F5F0E6]/80">
                Tu suis <strong className="text-[#4A5D23] font-bold">exactement le rythme prévu</strong> ({formatFCFA(settings.dailyTarget)} / jour).
              </p>
            )}

            {remainingAmount > 0 && neededDailyAmount > 0 && (
              <p className="text-[11px] text-[#D4A574]/70 mt-1">
                Nouveau rythme conseillé : <strong className="text-[#F5F0E6] font-mono">{formatFCFA(neededDailyAmount)} / jour</strong>
              </p>
            )}
          </div>
        </div>

        {/* Next Milestone Card */}
        <div
          onClick={() => onNavigate('milestones')}
          className="bg-[#3D2B1F]/40 hover:bg-[#3D2B1F]/60 border border-[#D4A574]/30 hover:border-[#D4A574]/50 rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E8B86D]" />
              <span className="text-xs font-semibold text-[#F5F0E6]/80 uppercase tracking-wider">
                Prochain Palier
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D4A574]/60" />
          </div>

          <div className="mt-2.5">
            {nextMilestone ? (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#F5F0E6]">{nextMilestone.label}</span>
                  <span className="text-[#D4A853] font-mono">{formatFCFA(nextMilestone.amount)}</span>
                </div>
                <div className="text-[11px] text-[#D4A574]/70 mt-1">
                  Encore {formatFCFA(Math.max(0, nextMilestone.amount - totalSaved))} à mobiliser pour valider cette étape.
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[#4A5D23] font-bold">
                  🎉 Tous les paliers ont été atteints avec succès !
                </p>
                <p className="text-[11px] text-[#D4A574]/70 mt-1">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4A574]">
            Dernières cotisations
          </h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-medium text-[#D4A853] hover:text-[#E8B86D] flex items-center gap-1 cursor-pointer"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentContributions.length === 0 ? (
          <div className="bg-[#3D2B1F]/30 border border-dashed border-[#D4A574]/30 rounded-2xl p-6 text-center">
            <p className="text-sm text-[#D4A574]">Aucune cotisation enregistrée pour le moment.</p>
            <p className="text-xs text-[#D4A574]/60 mt-1">Commence dès aujourd'hui avec 1 000 FCFA pour poser ta première pierre.</p>
            <button
              onClick={onOpenContributionModal}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D2B1F]/50 text-xs font-semibold text-[#D4A853] hover:bg-[#3D2B1F]/70 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Faire ma première cotisation</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#3D2B1F]/40 border border-[#D4A574]/30 rounded-2xl divide-y divide-[#D4A574]/20 overflow-hidden">
            {recentContributions.slice(0, 4).map((c) => (
              <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-[#3D2B1F]/60 transition">
                <div>
                  <div className="text-xs font-bold text-[#F5F0E6]/80 uppercase tracking-wide">
                    {formatDateFrench(c.date, { day: 'numeric', month: 'short' })}
                  </div>
                  {c.note && (
                    <div className="text-[11px] text-[#D4A574]/70 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                      {c.note}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-[#D4A853]">
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
