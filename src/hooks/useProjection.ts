import { useMemo } from 'react';
import { SavingsCalculations, projectCompletionDate } from '../lib/calculations';

export interface ProjectionScenario {
  rate: number;
  rateLabel: string;
  projectedDate: string;
  daysRemaining: number;
}

export function useProjection(calculations: SavingsCalculations) {
  const { remainingAmount, realDailyAverage } = calculations;

  const currentRateProjection = useMemo(() => {
    if (remainingAmount <= 0) {
      return {
        available: true,
        projectedDate: 'Objectif déjà atteint !',
        daysRemaining: 0,
      };
    }
    if (realDailyAverage <= 0) {
      return {
        available: false,
        projectedDate: 'En attente de cotisations...',
        daysRemaining: 0,
      };
    }
    const days = Math.ceil(remainingAmount / realDailyAverage);
    return {
      available: true,
      projectedDate: projectCompletionDate(remainingAmount, realDailyAverage),
      daysRemaining: days,
    };
  }, [remainingAmount, realDailyAverage]);

  const presetScenarios: ProjectionScenario[] = useMemo(() => {
    const rates = [500, 1000, 1500, 2000];
    return rates.map((rate) => {
      const days = remainingAmount > 0 ? Math.ceil(remainingAmount / rate) : 0;
      return {
        rate,
        rateLabel: `${rate.toLocaleString('fr-FR')} F/jour`,
        projectedDate: projectCompletionDate(remainingAmount, rate),
        daysRemaining: days,
      };
    });
  }, [remainingAmount]);

  return {
    currentRateProjection,
    presetScenarios,
  };
}
