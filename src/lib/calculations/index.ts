import { Contribution } from '../../types/contribution';
import { AppSettings } from '../../types/settings';

export interface Milestone {
  amount: number;
  label: string;
  percentage: number;
  achieved: boolean;
  dateAchieved?: string;
}

export interface SavingsCalculations {
  totalSaved: number;
  goalAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  daysElapsed: number;
  theoreticalSavings: number;
  gap: number; // positive = advance, negative = delay
  realDailyAverage: number;
  daysRemainingToTarget: number;
  neededDailyAmount: number;
  currentStreak: number;
  bestStreak: number;
  totalDaysContributed: number;
  totalDaysWithoutContribution: number;
  bestSingleContribution: number;
  weeklyAverage: number;
  monthlyAverage: number;
  milestones: Milestone[];
  dailyTotals: Map<string, number>;
}

export function formatFCFA(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

export function formatDateFrench(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('fr-FR', options || { day: 'numeric', month: 'short' }).toUpperCase();
  } catch {
    return dateStr;
  }
}

export function formatDateFull(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function calculateSavings(
  contributions: Contribution[],
  settings: AppSettings
): SavingsCalculations {
  const todayStr = getTodayDateString();
  const today = parseDate(todayStr);
  const startDate = parseDate(settings.startDate);
  const targetDate = parseDate(settings.targetDate);

  // Group contributions by date
  const dailyTotals = new Map<string, number>();
  let totalSaved = 0;
  let bestSingleContribution = 0;

  for (const item of contributions) {
    totalSaved += item.amount;
    const current = dailyTotals.get(item.date) || 0;
    dailyTotals.set(item.date, current + item.amount);
    if (item.amount > bestSingleContribution) {
      bestSingleContribution = item.amount;
    }
  }

  const goalAmount = settings.goalAmount || 200000;
  const remainingAmount = Math.max(0, goalAmount - totalSaved);
  const progressPercentage = goalAmount > 0 ? (totalSaved / goalAmount) * 100 : 0;

  // Days elapsed (start date to today, inclusive)
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(1, diffDays + 1);

  // Theoretical savings: elapsed days * daily target
  const theoreticalSavings = daysElapsed * settings.dailyTarget;
  const gap = totalSaved - theoreticalSavings;

  // Real pace (daily average since start)
  const realDailyAverage = totalSaved / daysElapsed;
  const weeklyAverage = realDailyAverage * 7;
  const monthlyAverage = realDailyAverage * 30.4375;

  // Days remaining to target date
  const targetDiffTime = targetDate.getTime() - today.getTime();
  const daysRemainingToTarget = Math.max(1, Math.ceil(targetDiffTime / (1000 * 60 * 60 * 24)));

  // Needed daily amount to reach goal on target date
  const neededDailyAmount = remainingAmount > 0 ? Math.ceil(remainingAmount / daysRemainingToTarget) : 0;

  // Total unique days contributed
  const totalDaysContributed = dailyTotals.size;
  const totalDaysWithoutContribution = Math.max(0, daysElapsed - totalDaysContributed);

  // Streak calculations
  // A day counts as successful if daily contributions sum >= 1000 FCFA (or settings.dailyTarget)
  const targetForStreak = Math.min(1000, settings.dailyTarget);

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date(today);
  const todayTotal = dailyTotals.get(todayStr) || 0;

  // If today hasn't reached target yet, check if yesterday was successful to avoid breaking streak midway through the day
  if (todayTotal < targetForStreak) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;

    const amountForDate = dailyTotals.get(dateKey) || 0;
    if (amountForDate >= targetForStreak) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak across all history
  const sortedDates = Array.from(dailyTotals.keys()).sort();
  let bestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dateKey of sortedDates) {
    const amount = dailyTotals.get(dateKey) || 0;
    if (amount >= targetForStreak) {
      const currentDate = parseDate(dateKey);
      if (prevDate) {
        const diff = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      } else {
        runningStreak = 1;
      }
      prevDate = currentDate;
      if (runningStreak > bestStreak) {
        bestStreak = runningStreak;
      }
    }
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  // Milestones:
  // 10 000 F -> Premier pas
  // 25 000 F -> 12,5 %
  // 50 000 F -> 25 %
  // 100 000 F -> 50 %
  // 150 000 F -> 75 %
  // 200 000 F -> OBJECTIF ATTEINT
  const milestonesList = [
    { amount: 10000, label: 'Premier pas', percentage: 5 },
    { amount: 25000, label: '12,5 %', percentage: 12.5 },
    { amount: 50000, label: '25 %', percentage: 25 },
    { amount: 100000, label: '50 % (Mi-parcours)', percentage: 50 },
    { amount: 150000, label: '75 % (Dernière ligne droite)', percentage: 75 },
    { amount: 200000, label: 'OBJECTIF ATTEINT 🎉', percentage: 100 },
  ];

  // Adjust percentage dynamically if user customizes goalAmount
  const milestones: Milestone[] = milestonesList.map((m) => {
    const targetAmt = (m.amount / 200000) * goalAmount;
    return {
      amount: Math.round(targetAmt),
      label: m.label,
      percentage: Math.round((targetAmt / goalAmount) * 1000) / 10,
      achieved: totalSaved >= targetAmt,
    };
  });

  return {
    totalSaved,
    goalAmount,
    remainingAmount,
    progressPercentage,
    daysElapsed,
    theoreticalSavings,
    gap,
    realDailyAverage,
    daysRemainingToTarget,
    neededDailyAmount,
    currentStreak,
    bestStreak,
    totalDaysContributed,
    totalDaysWithoutContribution,
    bestSingleContribution,
    weeklyAverage,
    monthlyAverage,
    milestones,
    dailyTotals,
  };
}

export function projectCompletionDate(remainingAmount: number, dailyRate: number): string {
  if (remainingAmount <= 0) return 'Objectif déjà atteint !';
  if (dailyRate <= 0) return 'Rythme indéterminé';

  const daysNeeded = Math.ceil(remainingAmount / dailyRate);
  const now = new Date();
  now.setDate(now.getDate() + daysNeeded);

  return now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
