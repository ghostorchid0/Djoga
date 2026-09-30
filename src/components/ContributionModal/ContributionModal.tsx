import React, { useState, useEffect } from 'react';
import { Contribution } from '../../types/contribution';
import { getTodayDateString } from '../../lib/calculations';
import { X, Check, Calendar, FileText, Banknote } from 'lucide-react';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number, date: string, note?: string) => Promise<void>;
  editingContribution?: Contribution | null;
  dailyTarget?: number;
}

const QUICK_AMOUNTS = [500, 1000, 1500, 2000, 5000];

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingContribution,
  dailyTarget = 1000,
}) => {
  const [amount, setAmount] = useState<number>(dailyTarget);
  const [customAmountStr, setCustomAmountStr] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingContribution) {
        setAmount(editingContribution.amount);
        setCustomAmountStr(String(editingContribution.amount));
        setIsCustomMode(!QUICK_AMOUNTS.includes(editingContribution.amount));
        setDate(editingContribution.date);
        setNote(editingContribution.note || '');
      } else {
        setAmount(dailyTarget);
        setCustomAmountStr(String(dailyTarget));
        setIsCustomMode(false);
        setDate(getTodayDateString());
        setNote('Épargne du jour');
      }
      setError(null);
    }
  }, [isOpen, editingContribution, dailyTarget]);

  if (!isOpen) return null;

  const handleQuickSelect = (val: number) => {
    setAmount(val);
    setCustomAmountStr(String(val));
    setIsCustomMode(false);
    setError(null);
  };

  const handleCustomModeToggle = () => {
    setIsCustomMode(true);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmountStr(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
      setError(null);
    } else {
      setAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Veuillez spécifier un montant valide supérieur à 0 FCFA.');
      return;
    }
    if (!date) {
      setError('Veuillez sélectionner une date.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave(amount, date, note);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0D4F4C]/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        className="w-full max-w-md bg-white border border-[#1A6B66]/30 rounded-t-xl sm:rounded-lg shadow-2xl p-5 sm:p-6 overflow-hidden animate-in slide-in-from-bottom-6 sm:fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1A6B66]/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br bg-[#D4A853]/10 text-white/10 text-[#6366F1]">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0D4F4C]">
                {editingContribution ? 'Modifier la cotisation' : 'Ajouter une cotisation'}
              </h2>
              <p className="text-xs text-gray-600">Fonds de sécurité personnel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-600 hover:text-[#0D4F4C] hover:bg-[#F1F5F9] transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Display and Quick Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#D4A574] mb-2">
              Montant de la cotisation
            </label>

            {/* Quick buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {QUICK_AMOUNTS.map((val) => {
                const isSelected = !isCustomMode && amount === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickSelect(val)}
                    className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r bg-[#D4A853] text-white border-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                        : 'bg-[#F0F4F2] border-[#1A6B66]/30 text-gray-600 hover:bg-[#F1F5F9] hover:text-[#0D4F4C]'
                    }`}
                  >
                    {val.toLocaleString('fr-FR')} F
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleCustomModeToggle}
                className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  isCustomMode
                    ? 'bg-gradient-to-r bg-[#D4A853] text-white border-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                    : 'bg-[#F0F4F2] border-[#1A6B66]/30 text-gray-600 hover:bg-[#F1F5F9] hover:text-[#0D4F4C]'
                }`}
              >
                Autre montant
              </button>
            </div>

            {/* Explicit input if custom mode or always visible as refined adjustment */}
            <div className="relative mt-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customAmountStr}
                onChange={handleCustomInputChange}
                placeholder="Ex: 3 000"
                className="w-full bg-[#F0F4F2] border border-[#1A6B66]/30 rounded-xl px-4 py-3 text-lg font-mono font-bold text-[#0D4F4C] focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600 pointer-events-none">
                FCFA
              </span>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#F0F4F2] border border-[#1A6B66]/30 rounded-xl px-4 py-2.5 text-sm text-[#0D4F4C] focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition pl-10"
              />
              <Calendar className="w-4 h-4 text-gray-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Note (facultatif)
            </label>
            <div className="relative">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex : Épargne du jour, reliquat marché..."
                className="w-full bg-[#F0F4F2] border border-[#1A6B66]/30 rounded-xl px-4 py-2.5 text-sm text-[#0D4F4C] focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition pl-10"
              />
              <FileText className="w-4 h-4 text-gray-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#D4A853] hover:bg-[#B8956E] text-white font-bold py-3.5 px-4 text-sm shadow-lg shadow-[#D4A853]/30 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'ENREGISTREMENT...' : 'ENREGISTRER'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
