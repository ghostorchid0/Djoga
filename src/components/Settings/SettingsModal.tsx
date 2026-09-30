import React, { useState } from 'react';
import { AppSettings } from '../../types/settings';
import { Contribution } from '../../types/contribution';
import { dbService } from '../../lib/database';
import { formatFCFA } from '../../lib/calculations';
import {
  requestNotificationPermission,
  isNotificationSupported,
} from '../../lib/notifications';
import { PWAInstallButton } from '../PWAInstallButton';
import {
  X,
  Settings,
  Bell,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
  Check,
  Shield,
  Smartphone,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  contributions: Contribution[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  onResetAllData: () => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  contributions,
  onUpdateSettings,
  onResetAllData,
  onRefreshData,
}) => {
  const [goalAmount, setGoalAmount] = useState(settings.goalAmount);
  const [dailyTarget, setDailyTarget] = useState(settings.dailyTarget);
  const [startDate, setStartDate] = useState(settings.startDate);
  const [targetDate, setTargetDate] = useState(settings.targetDate);
  const [reminderEnabled, setReminderEnabled] = useState(settings.reminderEnabled);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleReminder = async (checked: boolean) => {
    if (checked) {
      const granted = await requestNotificationPermission();
      if (!granted && isNotificationSupported()) {
        alert(
          'Les notifications du navigateur ont été refusées ou bloquées. Veuillez les autoriser dans les paramètres de votre navigateur pour recevoir les rappels.'
        );
      }
    }
    setReminderEnabled(checked);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateSettings({
        goalAmount: Number(goalAmount),
        dailyTarget: Number(dailyTarget),
        startDate,
        targetDate,
        reminderEnabled,
        reminderTime,
        theme: 'light' as const,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportJSON = async () => {
    const data = await dbService.exportData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-fund-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Montant (FCFA)', 'Note', 'Date Création'];
    const rows = contributions.map((c) => [
      c.id,
      c.date,
      c.amount,
      `"${(c.note || '').replace(/"/g, '""')}"`,
      c.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-fund-cotisations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.contributions || parsed.settings) {
        await dbService.importData(parsed);
        await onRefreshData();
        setImportStatus('Données importées avec succès !');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Format de fichier invalide.');
      }
    } catch {
      setImportStatus('Erreur lors de la lecture du fichier.');
    }
  };

  const handleExecuteReset = async () => {
    if (resetConfirmInput.trim().toUpperCase() === 'SUPPRIMER') {
      await onResetAllData();
      setShowResetConfirm(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-lg bg-[#F0F4F2] border border-[#1A6B66] rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1A6B66]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#1A6B66] text-[#D4A853]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Paramètres</h2>
              <p className="text-xs text-gray-600">Configuration & Données de l'application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-[#1A6B66] transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-5">
          {/* Objectif & Cotisation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Objectifs financiers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Objectif total (FCFA)
                </label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  className="w-full bg-black border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#D4A853] focus:outline-none"
                  min="1000"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Cotisation quotidienne (FCFA)
                </label>
                <input
                  type="number"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="w-full bg-black border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#D4A853] focus:outline-none"
                  min="100"
                  step="100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-black border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-white focus:border-[#D4A853] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Date cible souhaitée
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-black border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-white focus:border-[#D4A853] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Rappel Quotidien */}
          <div className="space-y-3 pt-2 border-t border-[#1A6B66]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#D4A853]" />
              <span>Rappel quotidien</span>
            </h3>

            <div className="bg-black/70 border border-[#1A6B66]/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Activer le rappel d'épargne
                  </span>
                  <span className="text-[11px] text-gray-600">
                    « N'oublie pas de protéger ton avenir. Cotisation du jour : {formatFCFA(dailyTarget)}. »
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => handleToggleReminder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#1A6B66] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A853]"></div>
                </label>
              </div>

              {reminderEnabled && (
                <div className="flex items-center justify-between pt-2 border-t border-[#1A6B66]/60">
                  <span className="text-xs text-slate-300">Heure de notification</span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-[#F0F4F2] border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-[#D4A853] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* PWA Section */}
          <div className="space-y-2 pt-2 border-t border-[#1A6B66]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#D4A853]" />
              <span>Application & Installation</span>
            </h3>
            <PWAInstallButton variant="settings" />
          </div>

          {/* Export & Import */}
          <div className="space-y-2 pt-2 border-t border-[#1A6B66]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Sauvegarde & Restauration
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="py-2.5 px-3 rounded-xl bg-black hover:bg-[#1A6B66] border border-[#1A6B66] text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4A853]" />
                <span>Exporter en CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="py-2.5 px-3 rounded-xl bg-black hover:bg-[#1A6B66] border border-[#1A6B66] text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4A853]" />
                <span>Exporter en JSON</span>
              </button>
            </div>

            <div className="pt-1">
              <label className="w-full py-2.5 px-3 rounded-xl bg-black hover:bg-[#1A6B66] border border-[#1A6B66] text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-gray-600" />
                <span>Importer une sauvegarde (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs text-center text-[#D4A853] bg-[#D4A853]/10 p-2 rounded-lg border border-[#D4A853]/20">
                {importStatus}
              </p>
            )}
          </div>

          {/* Reset section */}
          <div className="pt-2 border-t border-[#1A6B66]">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser mes données</span>
            </button>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#D4A853] hover:bg-[#D4A853] text-white font-bold py-3 text-sm shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'ENREGISTREMENT...' : 'ENREGISTRER LES MODIFICATIONS'}</span>
            </button>
          </div>
        </form>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#F0F4F2] border border-rose-500/40 p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-white">Confirmation obligatoire</h3>
              </div>

              <p className="text-xs text-slate-300">
                Cette action supprimera irréversiblement toutes les cotisations enregistrées et réinitialisera l'application à zéro.
              </p>

              <div>
                <label className="block text-[11px] text-gray-600 mb-1">
                  Tapez <strong className="text-white">SUPPRIMER</strong> pour confirmer :
                </label>
                <input
                  type="text"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="w-full bg-black border border-rose-500/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmInput('');
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#1A6B66] text-xs font-semibold text-slate-300 hover:bg-[#E2E8F0] transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={resetConfirmInput.trim().toUpperCase() !== 'SUPPRIMER'}
                  onClick={handleExecuteReset}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition cursor-pointer disabled:opacity-40"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
