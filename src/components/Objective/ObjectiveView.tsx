import React from 'react';
import { AppSettings } from '../../types/settings';
import { SavingsCalculations, formatFCFA, formatDateFull } from '../../lib/calculations';
import { Target, TrendingUp, TrendingDown, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface ObjectiveViewProps {
  settings: AppSettings;
  calculations: SavingsCalculations;
  onOpenContributionModal: () => void;
  onOpenSettings: () => void;
}

export const ObjectiveView: React.FC<ObjectiveViewProps> = ({
  settings,
  calculations,
  onOpenContributionModal,
  onOpenSettings,
}) => {
  const {
    totalSaved,
    goalAmount,
    remainingAmount,
    progressPercentage,
    daysElapsed,
    theoreticalSavings,
    gap,
    realDailyAverage,
    daysRemainingToTarget,
    neededDailyAmount,
  } = calculations;

  const isCompleted = remainingAmount <= 0;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#6366F1]" />
            <span>MON OBJECTIF</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Bilan d'alignement et discipline quotidienne
          </p>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs font-semibold text-[#6366F1] hover:text-[#E8B86D] border border-[#D4A574]/30 hover:border-[#D4A853]/50 rounded-xl px-3 py-1.5 transition cursor-pointer"
        >
          Ajuster l'objectif
        </button>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Goal */}
        <div className="bg-white hover:shadow-md transition-shadow border border-[#E2E8F0] rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
            Objectif total
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-[#0F172A] mt-1 block">
            {formatFCFA(goalAmount)}
          </span>
          <span className="text-[10px] text-[#64748B]/70">fonds de sécurité</span>
        </div>

        {/* Current Saved */}
        <div className="bg-white hover:shadow-md transition-shadow border border-[#E2E8F0] rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
            Épargne actuelle
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-[#6366F1] mt-1 block">
            {formatFCFA(totalSaved)}
          </span>
          <span className="text-[10px] text-[#64748B]/70">déjà sécurisé</span>
        </div>

        {/* Remaining Amount */}
        <div className="bg-white hover:shadow-md transition-shadow border border-[#E2E8F0] rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
            Reste à épargner
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-[#E8B86D] mt-1 block">
            {formatFCFA(remainingAmount)}
          </span>
          <span className="text-[10px] text-[#64748B]/70">à compléter</span>
        </div>

        {/* Progress Percentage */}
        <div className="bg-white hover:shadow-md transition-shadow border border-[#E2E8F0] rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
            Progression
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-[#0F172A] mt-1 block">
            {progressPercentage.toFixed(1)} %
          </span>
          <span className="text-[10px] text-[#64748B]/70">du parcours validé</span>
        </div>
      </div>

      {/* Rhythm Comparison Card */}
      <div className="bg-white hover:shadow-md transition-shadow border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#6366F1]" />
          <span>Comparatif des Rythmes</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Target Pace */}
          <div className="bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl p-4">
            <span className="text-xs text-[#64748B] font-medium">Rythme cible</span>
            <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1">
              {formatFCFA(settings.dailyTarget)} <span className="text-xs font-sans text-[#64748B]/70">/ jour</span>
            </div>
            <p className="text-[11px] text-[#64748B]/70 mt-1.5">
              Niveau de discipline planifié lors de ton engagement.
            </p>
          </div>

          {/* Real Pace */}
          <div className="bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl p-4">
            <span className="text-xs text-[#64748B] font-medium">Rythme réel</span>
            <div className="text-2xl font-bold font-mono text-[#6366F1] mt-1">
              {formatFCFA(realDailyAverage)} <span className="text-xs font-sans text-[#64748B]/70">/ jour</span>
            </div>
            <p className="text-[11px] text-[#64748B]/70 mt-1.5">
              Moyenne réelle constatée sur les {daysElapsed} {daysElapsed > 1 ? 'jours écoulés' : 'jour écoulé'}.
            </p>
          </div>
        </div>
      </div>

      {/* RETARD / AVANCE CALCULATION */}
      <div className="bg-white hover:shadow-md transition-shadow border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            {gap >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#4A5D23]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#C77D63]" />
            )}
            <span>Bilan Retard / Avance</span>
          </h2>
          <span className="text-xs text-[#64748B] font-mono">
            {daysElapsed} {daysElapsed > 1 ? 'jours' : 'jour'} d'activité
          </span>
        </div>

        {/* Theoretical vs Real Comparison */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2E8F0]">
            <span className="text-[#64748B] block">Épargne théorique :</span>
            <span className="font-mono font-bold text-[#0F172A] text-sm mt-0.5 block">
              {formatFCFA(theoreticalSavings)}
            </span>
            <span className="text-[10px] text-[#64748B]/60">({daysElapsed} j × {settings.dailyTarget} F)</span>
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E2E8F0]">
            <span className="text-[#64748B] block">Épargne réelle :</span>
            <span className="font-mono font-bold text-[#6366F1] text-sm mt-0.5 block">
              {formatFCFA(totalSaved)}
            </span>
            <span className="text-[10px] text-[#64748B]/60">solde effectif</span>
          </div>
        </div>

        {/* Big Status Verdict */}
        <div
          className={`p-4 rounded-xl border ${
            gap > 0
              ? 'bg-[#4A5D23]/10 border-[#4A5D23]/30 text-[#4A5D23]'
              : gap < 0
              ? 'bg-[#C77D63]/10 border-[#C77D63]/30 text-[#C77D63]'
              : 'bg-[#FAF8F5] border-[#E2E8F0] text-[#0F172A]/80'
          }`}
        >
          <div className="flex items-start gap-3">
            {gap > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-[#4A5D23] shrink-0 mt-0.5" />
            ) : gap < 0 ? (
              <AlertCircle className="w-5 h-5 text-[#C77D63] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#64748B] shrink-0 mt-0.5" />
            )}

            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#0F172A]">
                {gap > 0
                  ? `Tu es en avance de ${formatFCFA(gap)}.`
                  : gap < 0
                  ? `Tu as ${formatFCFA(Math.abs(gap))} de retard.`
                  : 'Tu es pile au rythme prévu.'}
              </h3>
              <p className="text-xs text-[#0F172A]/80 mt-1">
                {gap > 0
                  ? 'Excellente gestion. Ta rigueur te permet de sécuriser ton fonds plus vite que prévu.'
                  : gap < 0
                  ? 'Pas d’inquiétude : rattrape ce décalage en ajustant tes prochaines cotisations quotidiennes.'
                  : 'Discipline constante et parfaitement conforme à ton calendrier.'}
              </p>
            </div>
          </div>
        </div>

        {/* Recalculated Necessary Daily Amount */}
        {!isCompleted && (
          <div className="bg-[#1A1A1A]/80 border border-[#D4A574]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-[#0F172A]/80 block">
                Nouveau montant quotidien nécessaire
              </span>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Pour atteindre les {formatFCFA(goalAmount)} d'ici le {formatDateFull(settings.targetDate)} ({daysRemainingToTarget} jours restants)
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xl font-bold font-mono text-[#4A5D23] block">
                {formatFCFA(neededDailyAmount)}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium">/ jour</span>
            </div>
          </div>
        )}
      </div>

      {/* Important Rule Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-[#D4A574]/30 text-xs text-[#64748B] space-y-1.5">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Calendar className="w-4 h-4 text-[#4A5D23]" />
          <span>Cadre de l'objectif</span>
        </div>
        <p>
          Date de lancement : <strong>{formatDateFull(settings.startDate)}</strong> · Date cible : <strong>{formatDateFull(settings.targetDate)}</strong>
        </p>
        <p className="text-slate-500 text-[11px]">
          Ce montant est sanctuarisé pour faire face aux imprévus vitaux. Ne le confonds jamais avec tes dépenses professionnelles ou personnelles annexes.
        </p>
      </div>

      {/* Action */}
      <button
        onClick={onOpenContributionModal}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-[#0F172A] font-bold py-3.5 px-4 text-sm shadow-lg shadow-emerald-950/40 cursor-pointer"
      >
        Ajouter une cotisation maintenant
      </button>
    </div>
  );
};
