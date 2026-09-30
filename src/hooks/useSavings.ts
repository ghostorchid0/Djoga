import { useState, useEffect, useCallback, useMemo } from 'react';
import { Contribution } from '../types/contribution';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { dbService } from '../lib/database';
import { calculateSavings, formatFCFA } from '../lib/calculations';
import confetti from 'canvas-confetti';

export function useSavings() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [fetchedSettings, fetchedContributions] = await Promise.all([
        dbService.getSettings(),
        dbService.getAllContributions(),
      ]);
      setSettings(fetchedSettings);
      setContributions(fetchedContributions);
    } catch (err) {
      console.error('Failed to load savings data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Force light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.className = 'bg-[#F0F4F2] text-[#0D4F4C] antialiased selection:bg-[#D4A853]/20 selection:text-[#D4A853]';
  }, []);

  const calculations = useMemo(() => {
    return calculateSavings(contributions, settings);
  }, [contributions, settings]);

  const addContribution = useCallback(
    async (amount: number, date: string, note?: string) => {
      const newContribution: Contribution = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        amount: Math.round(amount),
        date,
        note: note?.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const previousTotal = calculations.totalSaved;
      const nextTotal = previousTotal + newContribution.amount;

      await dbService.saveContribution(newContribution);
      const updated = await dbService.getAllContributions();
      setContributions(updated);

      showToast(`+${formatFCFA(newContribution.amount)} enregistré avec succès`);

      // Check if newly crossed any milestone
      for (const m of calculations.milestones) {
        if (previousTotal < m.amount && nextTotal >= m.amount) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24'],
            });
          } catch {
            // Ignore confetti error if any
          }
          showToast(`🏆 Palier atteint : ${m.label} (${formatFCFA(m.amount)}) !`);
          break;
        }
      }
    },
    [calculations, showToast]
  );

  const updateContribution = useCallback(
    async (id: string, amount: number, date: string, note?: string) => {
      const existing = contributions.find((c) => c.id === id);
      if (!existing) return;

      const updatedContribution: Contribution = {
        ...existing,
        amount: Math.round(amount),
        date,
        note: note?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      await dbService.saveContribution(updatedContribution);
      const updated = await dbService.getAllContributions();
      setContributions(updated);
      showToast('Cotisation mise à jour');
    },
    [contributions, showToast]
  );

  const deleteContribution = useCallback(
    async (id: string) => {
      await dbService.deleteContribution(id);
      const updated = await dbService.getAllContributions();
      setContributions(updated);
      showToast('Cotisation supprimée');
    },
    [showToast]
  );

  const updateSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      const merged: AppSettings = { ...settings, ...newSettings };
      await dbService.saveSettings(merged);
      setSettings(merged);
      showToast('Paramètres mis à jour');
    },
    [settings, showToast]
  );

  const resetAllData = useCallback(async () => {
    await dbService.resetAll();
    setContributions([]);
    setSettings(DEFAULT_SETTINGS);
    showToast('Toutes les données ont été réinitialisées');
  }, [showToast]);

  return {
    loading,
    contributions,
    settings,
    calculations,
    toastMessage,
    addContribution,
    updateContribution,
    deleteContribution,
    updateSettings,
    resetAllData,
    refreshData: loadData,
  };
}
