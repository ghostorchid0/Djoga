import React from 'react';
import { SavingsCalculations, formatFCFA } from '../../lib/calculations';
import { Trophy, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MilestonesViewProps {
  calculations: SavingsCalculations;
  onOpenContributionModal: () => void;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({
  calculations,
  onOpenContributionModal,
}) => {
  const { totalSaved, milestones, remainingAmount } = calculations;

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#3b82f6', '#ec4899'],
      });
    } catch {
      // Ignore
    }
  };

  const achievedCount = milestones.filter((m) => m.achieved).length;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>PALIERS D'ÉPARGNE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Étapes clés vers la sécurisation intégrale de ton fonds
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
          {achievedCount} / {milestones.length} validés
        </span>
      </div>

      {/* Summary card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Progression globale des paliers
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {formatFCFA(totalSaved)}
          </span>
        </div>

        {/* Multi-step track */}
        <div className="relative pt-2 pb-1">
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, (achievedCount / milestones.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-2">
          {remainingAmount <= 0
            ? 'Félicitations exceptionnelles ! Tous les paliers de sécurité sont conquis.'
            : `Plus que ${formatFCFA(remainingAmount)} pour verrouiller l'ensemble des 6 étapes.`}
        </p>
      </div>

      {/* Milestones List */}
      <div className="space-y-3">
        {milestones.map((milestone, idx) => {
          const isNextTarget = !milestone.achieved && (idx === 0 || milestones[idx - 1].achieved);
          const diffToMilestone = Math.max(0, milestone.amount - totalSaved);

          return (
            <div
              key={milestone.amount}
              onClick={() => {
                if (milestone.achieved) triggerCelebration();
              }}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                milestone.achieved
                  ? 'bg-slate-900/90 border-emerald-500/30 cursor-pointer hover:border-emerald-500/60'
                  : isNextTarget
                  ? 'bg-slate-900/95 border-amber-500/40 shadow-lg shadow-amber-950/20'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      milestone.achieved
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : isNextTarget
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {milestone.achieved ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isNextTarget ? (
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          milestone.achieved ? 'text-white' : isNextTarget ? 'text-amber-200' : 'text-slate-400'
                        }`}
                      >
                        {milestone.label}
                      </h3>
                      {milestone.achieved && (
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Validé
                        </span>
                      )}
                      {isNextTarget && (
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          En cours
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      {milestone.achieved
                        ? 'Ce palier d’indépendance financière a été franchi avec succès.'
                        : isNextTarget
                        ? `Encore ${formatFCFA(diffToMilestone)} pour débloquer ce niveau.`
                        : `Palier intermédiaire fixé à ${milestone.percentage}% de l'objectif final.`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-base sm:text-lg font-bold font-mono ${
                      milestone.achieved
                        ? 'text-emerald-400'
                        : isNextTarget
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatFCFA(milestone.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {milestone.percentage} %
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onOpenContributionModal}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-4 text-sm shadow-lg shadow-emerald-950/40 cursor-pointer"
      >
        Cotiser vers le prochain palier
      </button>
    </div>
  );
};
