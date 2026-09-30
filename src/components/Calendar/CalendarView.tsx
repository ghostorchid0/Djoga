import React, { useState } from 'react';
import { Contribution } from '../../types/contribution';
import { AppSettings } from '../../types/settings';
import { formatFCFA, formatDateFull } from '../../lib/calculations';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Edit3, Trash2 } from 'lucide-react';

interface CalendarViewProps {
  contributions: Contribution[];
  settings: AppSettings;
  dailyTotals: Map<string, number>;
  onAddForDate: (dateStr: string) => void;
  onEditContribution: (contribution: Contribution) => void;
  onDeleteContribution: (id: string) => void;
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  contributions,
  settings,
  dailyTotals,
  onAddForDate,
  onEditContribution,
  onDeleteContribution,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // In JavaScript, Sunday is 0. Convert so Monday is 0
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7;

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // Get contributions for the currently selected day
  const selectedDayContributions = contributions.filter((c) => c.date === selectedDate);
  const selectedDayTotal = dailyTotals.get(selectedDate) || 0;

  // Day styling helper:
  // - Vert : objectif quotidien atteint (== settings.dailyTarget)
  // - Jaune : cotisation effectuée mais inférieure à l'objectif (< settings.dailyTarget)
  // - Bleu : cotisation supérieure à l'objectif (> settings.dailyTarget)
  // - Gris : aucune cotisation
  const getDayStatus = (dateStr: string) => {
    const total = dailyTotals.get(dateStr) || 0;
    const target = settings.dailyTarget || 1000;
    if (total === 0) return 'none';
    if (total > target) return 'above'; // Blue
    if (total === target) return 'target'; // Green
    return 'below'; // Yellow
  };

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-150">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#0D4F4C] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#D4A853]" />
            <span>CALENDRIER</span>
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Suivi visuel de tes cotisations au fil des jours
          </p>
        </div>

        <button
          onClick={handleGoToday}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#1A6B66] hover:bg-[#1A6B66] text-gray-700 border border-[#E2E8F0] transition cursor-pointer"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Calendar Card */}
      <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4 sm:p-5 shadow-xl">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-gray-600 hover:text-white hover:bg-[#1A6B66] transition cursor-pointer"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base font-bold text-[#0D4F4C] capitalize">
            {MONTH_NAMES[month]} {year}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-gray-600 hover:text-white hover:bg-[#1A6B66] transition cursor-pointer"
            aria-label="Mois suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-2.5 rounded-xl bg-white border border-[#1A6B66]/80 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-[#D4A853] shadow-xs shadow-[#D4A853]/50" />
            <span className="text-gray-700">Objectif atteint (1 000 F)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-blue-500 shadow-xs shadow-blue-500/50" />
            <span className="text-gray-700">Supérieur (&gt; 1 000 F)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-amber-500 shadow-xs shadow-amber-500/50" />
            <span className="text-gray-700">Inférieur (&lt; 1 000 F)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-[#1A6B66] border border-[#E2E8F0]" />
            <span className="text-gray-700">Aucune cotisation</span>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {WEEKDAY_NAMES.map((d) => (
            <div key={d} className="text-xs font-bold text-gray-500 py-1 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Previous month days */}
          {Array.from({ length: startingDay }).map((_, i) => {
            const dayNum = prevMonthLastDay - startingDay + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="h-11 sm:h-13 rounded-xl p-1 text-slate-600 bg-[#0D4F4C]/20 text-center flex flex-col justify-center text-xs opacity-40"
              >
                <span>{dayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const status = getDayStatus(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = todayStr === dateStr;
            const dayTotal = dailyTotals.get(dateStr) || 0;

            let badgeColor = 'bg-[#1A6B66]/40 text-gray-600 border border-[#1A6B66]/80';
            if (status === 'target') {
              badgeColor = 'bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/40 font-semibold';
            } else if (status === 'above') {
              badgeColor = 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold';
            } else if (status === 'below') {
              badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold';
            }

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`h-11 sm:h-13 rounded-xl p-1 text-center flex flex-col items-center justify-between transition-all cursor-pointer relative ${badgeColor} ${
                  isSelected ? 'ring-2 ring-[#D4A853] ring-offset-2 ring-offset-[#0D4F4C] scale-105 z-10' : 'hover:scale-[1.02]'
                } ${isToday ? 'outline-1 outline-gray-600' : ''}`}
              >
                <div className="w-full flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold leading-none">{dayNum}</span>
                  {status !== 'none' && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        status === 'target'
                          ? 'bg-[#D4A853]'
                          : status === 'above'
                          ? 'bg-blue-400'
                          : 'bg-amber-400'
                      }`}
                    />
                  )}
                </div>

                <div className="text-[9px] font-mono leading-none truncate w-full text-center pb-0.5">
                  {dayTotal > 0 ? `${dayTotal.toLocaleString('fr-FR')}F` : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      <div className="bg-[#F0F4F2]/90 border border-[#1A6B66] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A6B66]">
          <div>
            <h3 className="text-sm font-bold text-[#0D4F4C] uppercase tracking-wide">
              {formatDateFull(selectedDate)}
            </h3>
            <p className="text-xs text-gray-600">
              Total cotisé : <strong className="text-[#D4A853] font-mono">{formatFCFA(selectedDayTotal)}</strong>
            </p>
          </div>

          <button
            onClick={() => onAddForDate(selectedDate)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4A853] hover:bg-[#D4A853] text-white font-semibold text-xs shadow transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cotiser ce jour</span>
          </button>
        </div>

        {selectedDayContributions.length === 0 ? (
          <div className="py-6 text-center text-gray-600 text-xs">
            Aucune cotisation effectuée le {formatDateFull(selectedDate)}.
          </div>
        ) : (
          <div className="divide-y divide-[#1A6B66]/80 mt-2">
            {selectedDayContributions.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold font-mono text-[#0D4F4C] block">
                    +{formatFCFA(c.amount)}
                  </span>
                  {c.note && <span className="text-xs text-gray-600 block mt-0.5">{c.note}</span>}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditContribution(c)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-[#1A6B66] transition cursor-pointer"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Voulez-vous supprimer cette cotisation ?')) {
                        onDeleteContribution(c.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-rose-400 hover:bg-[#1A6B66] transition cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
