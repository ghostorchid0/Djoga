import React, { useState, useEffect } from 'react';
import { useSavings } from './hooks/useSavings';
import { Contribution } from './types/contribution';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ObjectiveView } from './components/Objective/ObjectiveView';
import { CalendarView } from './components/Calendar/CalendarView';
import { HistoryView } from './components/History/HistoryView';
import { StatisticsView } from './components/Statistics/StatisticsView';
import { ProjectionView } from './components/Projection/ProjectionView';
import { MilestonesView } from './components/Milestones/MilestonesView';
import { ContributionModal } from './components/ContributionModal/ContributionModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { OnboardingModal } from './components/Onboarding/OnboardingModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { sendDailyReminderNotification } from './lib/notifications';
import { getTodayDateString, formatFCFA } from './lib/calculations';
import {
  LayoutDashboard,
  Target,
  Calendar,
  History,
  BarChart3,
  Compass,
  Trophy,
  Settings as SettingsIcon,
  Plus,
  Flame,
  Shield,
  CheckCircle2,
} from 'lucide-react';

type TabType =
  | 'dashboard'
  | 'objective'
  | 'calendar'
  | 'history'
  | 'statistics'
  | 'projection'
  | 'milestones';

export default function App() {
  const {
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
    refreshData,
  } = useSavings();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetDateForAdd, setTargetDateForAdd] = useState<string | undefined>(undefined);

  // Check daily reminder trigger
  useEffect(() => {
    if (!settings.reminderEnabled || typeof window === 'undefined') return;

    const checkReminder = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      if (currentTimeStr === settings.reminderTime) {
        const todayStr = getTodayDateString();
        const todayTotal = calculations.dailyTotals.get(todayStr) || 0;
        if (todayTotal < settings.dailyTarget) {
          sendDailyReminderNotification(settings.dailyTarget);
        }
      }
    };

    const interval = setInterval(checkReminder, 60000);
    checkReminder();
    return () => clearInterval(interval);
  }, [settings.reminderEnabled, settings.reminderTime, settings.dailyTarget, calculations.dailyTotals]);

  // Handle open contribution modal for a specific date
  const handleAddForDate = (dateStr: string) => {
    setEditingContribution(null);
    setTargetDateForAdd(dateStr);
    setIsContributionModalOpen(true);
  };

  const handleEditContribution = (c: Contribution) => {
    setEditingContribution(c);
    setIsContributionModalOpen(true);
  };

  const handleSaveContribution = async (amount: number, date: string, note?: string) => {
    if (editingContribution) {
      await updateContribution(editingContribution.id, amount, date, note);
    } else {
      await addContribution(amount, date, note);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            Djoga...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#D4A574]/20 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#C77D63] flex items-center justify-center shadow-md shadow-[#3D2B1F]/40 p-1.5 group-hover:scale-105 transition">
              <Shield className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white uppercase">
                  DJOGA
                </span>
                <span className="text-[10px] font-mono font-bold text-[#3D2B1F] bg-[#D4A853]/20 px-1.5 py-0.5 rounded border border-[#D4A853]/30">
                  {formatFCFA(settings.goalAmount)}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                Discipline & Épargne Personnelle
              </span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {/* Streak Counter */}
            {calculations.currentStreak > 0 && (
              <div
                title={`${calculations.currentStreak} jours consécutifs de cotisation`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C77D63]/10 border border-[#C77D63]/30 text-[#C77D63] text-xs font-bold font-mono"
              >
                <Flame className="w-3.5 h-3.5 fill-[#C77D63]" />
                <span>{calculations.currentStreak} j</span>
              </div>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-[#D4A574] hover:text-[#3D2B1F] hover:bg-[#D4A574]/10 border border-[#D4A574]/30 hover:border-[#C77D63]/50 transition cursor-pointer"
              aria-label="Paramètres"
              title="Paramètres de l'application"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation for Desktop & Tablets */}
        <div className="max-w-4xl mx-auto hidden md:flex items-center gap-1 mt-2.5 pt-2 border-t border-[#D4A574]/20">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'objective', label: 'Objectif', icon: Target },
            { id: 'calendar', label: 'Calendrier', icon: Calendar },
            { id: 'history', label: 'Historique', icon: History },
            { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
            { id: 'projection', label: 'Projection', icon: Compass },
            { id: 'milestones', label: 'Paliers', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#D4A853] text-white shadow-xs'
                    : 'text-[#D4A574] hover:text-[#3D2B1F] hover:bg-[#D4A574]/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            settings={settings}
            calculations={calculations}
            recentContributions={contributions}
            onOpenContributionModal={() => {
              setEditingContribution(null);
              setTargetDateForAdd(undefined);
              setIsContributionModalOpen(true);
            }}
            onNavigate={(t) => {
              if (t === 'settings') {
                setIsSettingsOpen(true);
              } else {
                setActiveTab(t);
              }
            }}
          />
        )}

        {activeTab === 'objective' && (
          <ObjectiveView
            settings={settings}
            calculations={calculations}
            onOpenContributionModal={() => {
              setEditingContribution(null);
              setTargetDateForAdd(undefined);
              setIsContributionModalOpen(true);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            contributions={contributions}
            settings={settings}
            dailyTotals={calculations.dailyTotals}
            onAddForDate={handleAddForDate}
            onEditContribution={handleEditContribution}
            onDeleteContribution={deleteContribution}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            contributions={contributions}
            onOpenContributionModal={() => {
              setEditingContribution(null);
              setTargetDateForAdd(undefined);
              setIsContributionModalOpen(true);
            }}
            onEditContribution={handleEditContribution}
            onDeleteContribution={deleteContribution}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView
            contributions={contributions}
            settings={settings}
            calculations={calculations}
          />
        )}

        {activeTab === 'projection' && (
          <ProjectionView
            calculations={calculations}
            onOpenContributionModal={() => {
              setEditingContribution(null);
              setTargetDateForAdd(undefined);
              setIsContributionModalOpen(true);
            }}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestonesView
            calculations={calculations}
            onOpenContributionModal={() => {
              setEditingContribution(null);
              setTargetDateForAdd(undefined);
              setIsContributionModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Visible on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-lg border-t border-[#D4A574]/20 px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl">
        <div className="flex items-center justify-around">
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
              activeTab === 'dashboard' ? 'text-[#3D2B1F] font-bold' : 'text-[#D4A574]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px]">Accueil</span>
          </button>

          {/* 2. Objectif */}
          <button
            onClick={() => setActiveTab('objective')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
              activeTab === 'objective' ? 'text-[#3D2B1F] font-bold' : 'text-[#D4A574]'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="text-[10px]">Objectif</span>
          </button>

          {/* 3. Center Quick Add Button */}
          <button
            onClick={() => {
              setEditingContribution(null);
              setTargetDateForAdd(undefined);
              setIsContributionModalOpen(true);
            }}
            className="flex items-center justify-center w-11 h-11 -mt-4 rounded-2xl bg-gradient-to-tr from-[#D4A853] to-[#C77D63] text-[#1A1A1A] shadow-lg shadow-[#3D2B1F]/60 active:scale-95 transition cursor-pointer"
            aria-label="Ajouter une cotisation"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          {/* 4. Calendrier */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
              activeTab === 'calendar' ? 'text-[#3D2B1F] font-bold' : 'text-[#D4A574]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[10px]">Calendrier</span>
          </button>

          {/* 5. Historique / Plus */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
              activeTab === 'history' || activeTab === 'statistics' || activeTab === 'projection' || activeTab === 'milestones'
                ? 'text-[#3D2B1F] font-bold'
                : 'text-[#D4A574]'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="text-[10px]">Historique</span>
          </button>
        </div>

        {/* Secondary quick tabs on mobile for deep views */}
        {(activeTab === 'statistics' || activeTab === 'projection' || activeTab === 'milestones' || activeTab === 'history') && (
          <div className="flex items-center justify-center gap-1.5 pt-1.5 border-t border-[#D4A574]/20 mt-1">
            <button
              onClick={() => setActiveTab('history')}
              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${activeTab === 'history' ? 'bg-[#D4A853] text-white font-bold' : 'text-[#D4A574]/60'}`}
            >
              Historique
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${activeTab === 'statistics' ? 'bg-[#D4A853] text-white font-bold' : 'text-[#D4A574]/60'}`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('projection')}
              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${activeTab === 'projection' ? 'bg-[#D4A853] text-white font-bold' : 'text-[#D4A574]/60'}`}
            >
              Projection
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${activeTab === 'milestones' ? 'bg-[#D4A853] text-white font-bold' : 'text-[#D4A574]/60'}`}
            >
              Paliers
            </button>
          </div>
        )}
      </nav>

      {/* Discrete Toast Notice */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 font-medium px-4 py-2.5 text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Modal: Add / Edit Contribution */}
      <ContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => {
          setIsContributionModalOpen(false);
          setEditingContribution(null);
          setTargetDateForAdd(undefined);
        }}
        onSave={handleSaveContribution}
        editingContribution={
          editingContribution ||
          (targetDateForAdd
            ? {
                id: '',
                amount: settings.dailyTarget,
                date: targetDateForAdd,
                createdAt: '',
                updatedAt: '',
              }
            : null)
        }
        dailyTarget={settings.dailyTarget}
      />

      {/* Modal: Settings */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        contributions={contributions}
        onUpdateSettings={updateSettings}
        onResetAllData={resetAllData}
        onRefreshData={refreshData}
      />

      {/* Modal: Onboarding (First launch) */}
      <OnboardingModal
        isOpen={!settings.onboardingCompleted}
        onComplete={async (initialSettings) => {
          await updateSettings(initialSettings);
        }}
      />
    </div>
  );
}
