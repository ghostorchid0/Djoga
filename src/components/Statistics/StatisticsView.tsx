import React from 'react';
import { Contribution } from '../../types/contribution';
import { AppSettings } from '../../types/settings';
import { SavingsCalculations, formatFCFA, formatDateFrench } from '../../lib/calculations';
import { BarChart3, TrendingUp, Flame, CalendarX, Trophy, ShieldCheck } from 'lucide-react';

interface StatisticsViewProps {
  contributions: Contribution[];
  settings: AppSettings;
  calculations: SavingsCalculations;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  contributions,
  settings,
  calculations,
}) => {
  const {
    totalSaved,
    realDailyAverage,
    weeklyAverage,
    monthlyAverage,
    bestSingleContribution,
    totalDaysContributed,
    totalDaysWithoutContribution,
    bestStreak,
    currentStreak,
  } = calculations;

  // Build cumulative data points for the evolution graph
  const sortedContributions = [...contributions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let cumulative = 0;
  const historyMap = new Map<string, number>();
  for (const c of sortedContributions) {
    cumulative += c.amount;
    historyMap.set(c.date, cumulative);
  }

  const chartPoints = Array.from(historyMap.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const maxVal = Math.max(settings.goalAmount, totalSaved, 1000);

  // Generate SVG path coordinates
  const pointsString =
    chartPoints.length > 0
      ? chartPoints
          .map((pt, idx) => {
            const x =
              chartPoints.length === 1
                ? paddingX + innerWidth / 2
                : paddingX + (idx / (chartPoints.length - 1)) * innerWidth;
            const y = chartHeight - paddingY - (pt.total / maxVal) * innerHeight;
            return `${x},${y}`;
          })
          .join(' ')
      : '';

  const areaString =
    chartPoints.length > 0
      ? `${paddingX},${chartHeight - paddingY} ${pointsString} ${
          chartPoints.length === 1
            ? paddingX + innerWidth / 2
            : paddingX + innerWidth
        },${chartHeight - paddingY}`
      : '';

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[#0D4F4C] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#D4A853]" />
          <span>STATISTIQUES</span>
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          Indicateurs financiers de discipline et métriques de performance
        </p>
      </div>

      {/* Evolution Chart */}
      <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4A853]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Évolution du fonds d'épargne
            </h2>
          </div>
          <span className="text-xs font-mono text-[#D4A853] font-bold">
            {formatFCFA(totalSaved)}
          </span>
        </div>

        {chartPoints.length < 2 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center text-xs text-gray-600 bg-[#0D4F4C]/40 rounded-xl p-4 border border-[#1A6B66]/80">
            <p>Ajoute des cotisations sur plusieurs jours pour observer ta courbe de croissance.</p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Goal reference dashed line */}
              <line
                x1={paddingX}
                y1={chartHeight - paddingY - (settings.goalAmount / maxVal) * innerHeight}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY - (settings.goalAmount / maxVal) * innerHeight}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={chartWidth - paddingX}
                y={chartHeight - paddingY - (settings.goalAmount / maxVal) * innerHeight - 6}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="end"
                fontFamily="monospace"
              >
                But {formatFCFA(settings.goalAmount)}
              </text>

              {/* Area */}
              <polygon points={areaString} fill="url(#chartGradient)" />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Data points */}
              {chartPoints.map((pt, idx) => {
                const x =
                  chartPoints.length === 1
                    ? paddingX + innerWidth / 2
                    : paddingX + (idx / (chartPoints.length - 1)) * innerWidth;
                const y = chartHeight - paddingY - (pt.total / maxVal) * innerHeight;
                return (
                  <circle
                    key={pt.date}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#0f172a"
                    stroke="#34d399"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            <div className="flex justify-between text-[11px] text-gray-600 mt-2 px-1">
              <span>{formatDateFrench(chartPoints[0].date)}</span>
              <span>{formatDateFrench(chartPoints[chartPoints.length - 1].date)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Key Statistics (from prompt section 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        {/* Total épargné */}
        <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
            Total épargné
          </span>
          <span className="text-xl font-bold font-mono text-[#D4A853] mt-1 block">
            {formatFCFA(totalSaved)}
          </span>
          <span className="text-[10px] text-gray-600">sur {formatFCFA(settings.goalAmount)}</span>
        </div>

        {/* Moyenne par jour */}
        <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
            Moyenne par jour
          </span>
          <span className="text-xl font-bold font-mono text-[#0D4F4C] mt-1 block">
            {formatFCFA(realDailyAverage)}
          </span>
          <span className="text-[10px] text-gray-600">rythme moyen continu</span>
        </div>

        {/* Moyenne par semaine */}
        <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
            Moyenne par semaine
          </span>
          <span className="text-xl font-bold font-mono text-[#0D4F4C] mt-1 block">
            {formatFCFA(weeklyAverage)}
          </span>
          <span className="text-[10px] text-gray-600">vitesse hebdomadaire</span>
        </div>

        {/* Moyenne par mois */}
        <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
            Moyenne par mois
          </span>
          <span className="text-xl font-bold font-mono text-[#0D4F4C] mt-1 block">
            {formatFCFA(monthlyAverage)}
          </span>
          <span className="text-[10px] text-gray-600">projection 30 jours</span>
        </div>

        {/* Meilleure cotisation */}
        <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
              Meilleure cotisation
            </span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">
            {formatFCFA(bestSingleContribution)}
          </span>
          <span className="text-[10px] text-gray-600">record en 1 versement</span>
        </div>

        {/* Meilleure série */}
        <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
              Meilleure série
            </span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-xl font-bold font-mono text-orange-400 mt-1 block">
            {bestStreak} <span className="text-xs font-normal text-gray-600">jours</span>
          </span>
          <span className="text-[10px] text-gray-600">série record (actuelle: {currentStreak} j)</span>
        </div>

        {/* Jours cotisés */}
        <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
              Jours cotisés
            </span>
            <ShieldCheck className="w-4 h-4 text-[#D4A853]" />
          </div>
          <span className="text-xl font-bold font-mono text-[#D4A853] mt-1 block">
            {totalDaysContributed} <span className="text-xs font-normal text-gray-600">jours</span>
          </span>
          <span className="text-[10px] text-gray-600">présence active</span>
        </div>

        {/* Jours sans cotisation */}
        <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
              Jours sans cotisation
            </span>
            <CalendarX className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-xl font-bold font-mono text-gray-700 mt-1 block">
            {totalDaysWithoutContribution} <span className="text-xs font-normal text-gray-600">jours</span>
          </span>
          <span className="text-[10px] text-gray-600">depuis le lancement</span>
        </div>
      </div>
    </div>
  );
};
