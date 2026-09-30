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
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-black text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#D4A853]/20 border-t-[#D4A853] rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-gray-600 font-bold">
            Djoga...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F2] text-black flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-black border-b border-[#1A6B66]/30 px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition overflow-hidden">
              <img src="/logo.jpg" alt="Djoga Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white uppercase">
                  DJOGA
                </span>
                {activeTab === 'dashboard' && (
                  <span className="text-[10px] font-mono font-bold text-[#D4A853] bg-[#D4A853]/20 px-1.5 py-0.5 rounded-full border border-[#D4A853]/40">
                    {formatFCFA(settings.goalAmount)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/80 font-medium block">
                Discipline & Épargne Personnelle
              </span>
            </div>
          </div>

          {/* Header Controls */}
          {activeTab === 'dashboard' && (
            <div className="flex items-center gap-2">
              {/* Streak Counter */}
              {calculations.currentStreak > 0 && (
                <div
                  title={`${calculations.currentStreak} jours consécutifs de cotisation`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D4A853] border border-[#B8956E] text-white text-xs font-bold font-mono"
                >
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>{calculations.currentStreak} j</span>
                </div>
              )}

              {/* PWA Install Button */}
              <PWAInstallButton variant="header" />

              {/* Settings Trigger */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-[#1A6B66]/30 border border-[#1A6B66]/30 hover:border-[#D4A853]/50 transition cursor-pointer"
                aria-label="Paramètres"
                title="Paramètres de l'application"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Secondary Category Navigation for Desktop & Tablets */}
        <div className="max-w-4xl mx-auto hidden md:flex items-center gap-1 mt-2.5 pt-2 border-t border-[#1A6B66]/30">
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
                    ? 'bg-[#D4A853] text-white shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-[#1A6B66]/30'
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-[#1A6B66]/30 px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl">
        <div className="flex items-center justify-around">
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
              activeTab === 'dashboard' ? 'text-[#D4A853] font-bold' : 'text-white/80'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px]">Accueil</span>
          </button>

          {/* 2. Objectif */}
          <button
            onClick={() => setActiveTab('objective')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
              activeTab === 'objective' ? 'text-[#D4A853] font-bold' : 'text-white/80'
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
            className="flex items-center justify-center w-11 h-11 -mt-4 rounded-2xl bg-[#D4A853] text-white shadow-lg shadow-[#D4A853]/40 active:scale-95 transition cursor-pointer"
            aria-label="Ajouter une cotisation"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          {/* 4. Calendrier */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
              activeTab === 'calendar' ? 'text-[#D4A853] font-bold' : 'text-white/80'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[10px]">Calendrier</span>
          </button>

          {/* 5. Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
              isMobileMenuOpen ? 'text-[#D4A853] font-bold' : 'text-white/80'
            }`}
          >
            <Menu className="w-4 h-4" />
            <span className="text-[10px]">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-[#1A6B66]/30 rounded-t-3xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab('history');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
                  activeTab === 'history' ? 'bg-[#D4A853] text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <History className="w-5 h-5" />
                <span className="text-sm font-semibold">Historique</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('statistics');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
                  activeTab === 'statistics' ? 'bg-[#D4A853] text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-semibold">Statistiques</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('projection');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
                  activeTab === 'projection' ? 'bg-[#D4A853] text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Compass className="w-5 h-5" />
                <span className="text-sm font-semibold">Projection</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('milestones');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
                  activeTab === 'milestones' ? 'bg-[#D4A853] text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-semibold">Paliers</span>
              </button>

              <div className="border-t border-[#1A6B66]/30 pt-2 mt-2">
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer text-white/80 hover:bg-white/10"
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span className="text-sm font-semibold">Paramètres</span>
                </button>

                <div className="px-4 py-3">
                  <PWAInstallButton variant="mobile" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discrete Toast Notice */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-black/95 border border-[#D4A853]/40 text-[#D4A853] font-medium px-4 py-2.5 text-xs shadow-2xl animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-[#D4A853] shrink-0" />
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
