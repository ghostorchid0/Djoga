import React, { useState } from 'react';
import { SavingsCalculations, formatFCFA, projectCompletionDate } from '../../lib/calculations';
import { useProjection } from '../../hooks/useProjection';
import { Compass, Calendar, Sparkles, ArrowRight, Calculator } from 'lucide-react';

interface ProjectionViewProps {
  calculations: SavingsCalculations;
  onOpenContributionModal: () => void;
}

export const ProjectionView: React.FC<ProjectionViewProps> = ({
  calculations,
  onOpenContributionModal,
}) => {
  const { totalSaved, goalAmount, remainingAmount, realDailyAverage } = calculations;
  const { currentRateProjection, presetScenarios } = useProjection(calculations);

  const [customRate, setCustomRate] = useState<number>(1000);

  const customDaysRemaining = remainingAmount > 0 && customRate > 0 ? Math.ceil(remainingAmount / customRate) : 0;
  const customProjectedDate = projectCompletionDate(remainingAmount, customRate);

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[#0D4F4C] flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#10B981]" />
          <span>PROJECTION</span>
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          Dates estimées d'accomplissement selon ton intensité d'épargne
        </p>
      </div>

      {/* Main Focus: Current Rhythm Projection */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D4F4C]/60 via-[#F0F4F2] to-[#0D4F4C] border border-emerald-500/30 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981] mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Avec ton rythme actuel</span>
        </div>

        <div className="my-2">
          <span className="text-xs text-gray-600 block">Objectif prévu le :</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0D4F4C] tracking-tight mt-1 block">
            {currentRateProjection.projectedDate}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-700 pt-3 border-t border-[#1A6B66]/80 mt-4">
          <span>
            Basé sur ton rythme moyen constaté de <strong className="text-[#10B981] font-mono">{formatFCFA(realDailyAverage)}/j</strong>
          </span>
          {currentRateProjection.daysRemaining > 0 && (
            <span className="font-semibold text-gray-700">
              (~{currentRateProjection.daysRemaining} jours restants)
            </span>
          )}
        </div>
      </div>

      {/* Preset Scenarios Comparison (from prompt section 9) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 px-1">
          Scénarios de cotisation comparative
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presetScenarios.map((scenario) => (
            <div
              key={scenario.rate}
              className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4 flex flex-col justify-between hover:border-[#E2E8F0] transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-[#10B981]">
                  {scenario.rateLabel}
                </span>
                <span className="text-[11px] text-gray-600 font-mono">
                  {scenario.daysRemaining} {scenario.daysRemaining > 1 ? 'jours' : 'jour'}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[11px] text-gray-600 block">Date estimée :</span>
                <span className="text-base font-bold text-[#0D4F4C] capitalize mt-0.5 block">
                  {scenario.projectedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Custom Simulator */}
      <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Simulateur personnalisé
            </h2>
          </div>
          <span className="text-xs text-gray-600">
            Reste : {formatFCFA(remainingAmount)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-700">
            <span>Si j'épargne :</span>
            <span className="text-base font-bold font-mono text-[#10B981]">
              {formatFCFA(customRate)} / jour
            </span>
          </div>

          <input
            type="range"
            min="200"
            max="10000"
            step="100"
            value={customRate}
            onChange={(e) => setCustomRate(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>200 F</span>
            <span>2 500 F</span>
            <span>5 000 F</span>
            <span>10 000 F</span>
          </div>
        </div>

        <div className="bg-[#0D4F4C]/80 border border-[#1A6B66] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-600 block">Date cible résultante :</span>
            <span className="text-base font-bold text-[#0D4F4C] capitalize mt-0.5 block">
              {customProjectedDate}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-600 block">Délai :</span>
            <span className="text-sm font-bold font-mono text-[#10B981] mt-0.5 block">
              {customDaysRemaining} {customDaysRemaining > 1 ? 'jours' : 'jour'}
            </span>
          </div>
        </div>
      </div>

      {/* Recap info */}
      <div className="text-xs text-gray-600 bg-[#F0F4F2]/40 p-4 rounded-2xl border border-[#1A6B66]/80 flex items-center gap-3">
        <Calendar className="w-4 h-4 text-gray-600 shrink-0" />
        <p>
          Calcul calculé à partir de ton solde actuel ({formatFCFA(totalSaved)}). Plus tu es régulier, plus la date prévisionnelle se rapproche.
        </p>
      </div>

      <button
        onClick={onOpenContributionModal}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-4 text-sm shadow-lg shadow-emerald-950/40 cursor-pointer"
      >
        <span>Ajouter une cotisation</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
