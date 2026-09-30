import { useMemo, useState } from 'react';
import { Contribution, ContributionFilter } from '../types/contribution';
import { parseDate } from '../lib/calculations';

export function useContributions(contributions: Contribution[]) {
  const [filter, setFilter] = useState<ContributionFilter>('all');

  const filteredContributions = useMemo(() => {
    if (filter === 'all') return contributions;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === 'this_week') {
      // Beginning of current week (Monday)
      const currentDay = today.getDay();
      const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - distanceToMonday);

      return contributions.filter((c) => {
        const itemDate = parseDate(c.date);
        return itemDate >= monday;
      });
    }

    if (filter === 'this_month') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return contributions.filter((c) => {
        const itemDate = parseDate(c.date);
        return itemDate >= firstDayOfMonth;
      });
    }

    return contributions;
  }, [contributions, filter]);

  return {
    filter,
    setFilter,
    filteredContributions,
  };
}
