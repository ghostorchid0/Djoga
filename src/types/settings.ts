export interface AppSettings {
  goalAmount: number; // default: 200000
  dailyTarget: number; // default: 1000
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  reminderEnabled: boolean;
  reminderTime: string; // "20:00"
  theme: 'dark' | 'light';
  onboardingCompleted: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  goalAmount: 200000,
  dailyTarget: 1000,
  startDate: new Date().toISOString().split('T')[0],
  targetDate: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 200); // 200,000 / 1,000 = 200 days
    return d.toISOString().split('T')[0];
  })(),
  reminderEnabled: false,
  reminderTime: '20:00',
  theme: 'dark',
  onboardingCompleted: false,
};
