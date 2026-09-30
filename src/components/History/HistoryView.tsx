import React, { useState } from 'react';
import { Contribution, ContributionFilter } from '../../types/contribution';
import { useContributions } from '../../hooks/useContributions';
import { formatFCFA, formatDateFrench } from '../../lib/calculations';
import { History, Plus, Edit3, Trash2, Search, Filter } from 'lucide-react';

interface HistoryViewProps {
  contributions: Contribution[];
  onOpenContributionModal: () => void;
  onEditContribution: (contribution: Contribution) => void;
  onDeleteContribution: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  contributions,
  onOpenContributionModal,
  onEditContribution,
  onDeleteContribution,
}) => {
  const { filter, setFilter, filteredContributions } = useContributions(contributions);
  const [searchQuery, setSearchQuery] = useState('');

  const displayList = filteredContributions.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.amount.toString().includes(q) ||
      (c.note && c.note.toLowerCase().includes(q)) ||
      c.date.includes(q)
    );
  });

  const filteredSum = displayList.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>HISTORIQUE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Journal complet de tes versements d'épargne
          </p>
        </div>

        <button
          onClick={onOpenContributionModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-2.5">
        {/* Filter Segmented Control */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(
            [
              { key: 'this_week', label: 'Cette semaine' },
              { key: 'this_month', label: 'Ce mois' },
              { key: 'all', label: 'Tout' },
            ] as { key: ContributionFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                filter === tab.key
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input if more than 5 items */}
        {contributions.length > 5 && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par note, montant, date..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>

      {/* Filtered Summary Bar */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>{displayList.length} {displayList.length > 1 ? 'cotisations trouvées' : 'cotisation trouvée'}</span>
        </div>
        <div>
          Sous-total : <strong className="text-white font-mono">{formatFCFA(filteredSum)}</strong>
        </div>
      </div>

      {/* List */}
      {displayList.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm text-slate-400">Aucune cotisation pour cette sélection.</p>
          <button
            onClick={onOpenContributionModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-emerald-400 hover:bg-slate-750 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une cotisation</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden shadow-sm">
          {displayList.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between hover:bg-slate-850/60 transition group"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-200 uppercase tracking-wider font-mono">
                  {formatDateFrench(item.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {item.note && (
                  <p className="text-xs text-slate-400 line-clamp-1 max-w-[220px] sm:max-w-md">
                    {item.note}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm sm:text-base font-extrabold font-mono text-emerald-400 block">
                    +{formatFCFA(item.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditContribution(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Modifier la cotisation"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer la cotisation de ${formatFCFA(item.amount)} du ${item.date} ?`)) {
                        onDeleteContribution(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                    title="Supprimer la cotisation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
