import { Contribution } from '../../types/contribution';
import { AppSettings, DEFAULT_SETTINGS } from '../../types/settings';

const DB_NAME = 'security_fund_db';
const DB_VERSION = 1;
const CONTRIBUTIONS_STORE = 'contributions';
const SETTINGS_STORE = 'settings';
const SETTINGS_KEY = 'current_settings';

class DatabaseService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB non supporté'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Contributions store
        if (!db.objectStoreNames.contains(CONTRIBUTIONS_STORE)) {
          const contribStore = db.createObjectStore(CONTRIBUTIONS_STORE, { keyPath: 'id' });
          contribStore.createIndex('date', 'date', { unique: false });
          contribStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- Contributions ---
  async getAllContributions(): Promise<Contribution[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(CONTRIBUTIONS_STORE, 'readonly');
        const store = transaction.objectStore(CONTRIBUTIONS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
          const results: Contribution[] = request.result || [];
          // Sort by date descending, then createdAt descending
          results.sort((a, b) => {
            const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Fallback to localStorage if IndexedDB failed
      const raw = localStorage.getItem('security_fund_contributions');
      return raw ? JSON.parse(raw) : [];
    }
  }

  async saveContribution(contribution: Contribution): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(CONTRIBUTIONS_STORE, 'readwrite');
        const store = transaction.objectStore(CONTRIBUTIONS_STORE);
        const request = store.put(contribution);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // localStorage backup
      const existing = await this.getAllContributions();
      const idx = existing.findIndex((c) => c.id === contribution.id);
      if (idx >= 0) existing[idx] = contribution;
      else existing.push(contribution);
      localStorage.setItem('security_fund_contributions', JSON.stringify(existing));
    }
  }

  async deleteContribution(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(CONTRIBUTIONS_STORE, 'readwrite');
        const store = transaction.objectStore(CONTRIBUTIONS_STORE);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      const existing = await this.getAllContributions();
      const filtered = existing.filter((c) => c.id !== id);
      localStorage.setItem('security_fund_contributions', JSON.stringify(filtered));
    }
  }

  // --- Settings ---
  async getSettings(): Promise<AppSettings> {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(SETTINGS_STORE, 'readonly');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.get(SETTINGS_KEY);

        request.onsuccess = () => {
          if (request.result && request.result.data) {
            resolve({ ...DEFAULT_SETTINGS, ...request.result.data });
          } else {
            // Check localStorage migration
            const local = localStorage.getItem('security_fund_settings');
            if (local) {
              try {
                const parsed = JSON.parse(local);
                resolve({ ...DEFAULT_SETTINGS, ...parsed });
                return;
              } catch {
                // Ignore parse error
              }
            }
            resolve(DEFAULT_SETTINGS);
          }
        };
        request.onerror = () => resolve(DEFAULT_SETTINGS);
      });
    } catch {
      const local = localStorage.getItem('security_fund_settings');
      return local ? { ...DEFAULT_SETTINGS, ...JSON.parse(local) } : DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.put({ key: SETTINGS_KEY, data: settings });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Ignore
    }
    // Also mirror to localStorage for instantaneous critical settings retrieval
    localStorage.setItem('security_fund_settings', JSON.stringify(settings));
  }

  // --- Import / Export / Reset ---
  async exportData(): Promise<{ settings: AppSettings; contributions: Contribution[]; exportedAt: string }> {
    const settings = await this.getSettings();
    const contributions = await this.getAllContributions();
    return {
      settings,
      contributions,
      exportedAt: new Date().toISOString(),
    };
  }

  async importData(imported: { settings?: Partial<AppSettings>; contributions?: Contribution[] }): Promise<void> {
    if (imported.settings) {
      const current = await this.getSettings();
      await this.saveSettings({ ...current, ...imported.settings });
    }
    if (Array.isArray(imported.contributions)) {
      for (const item of imported.contributions) {
        if (item.id && typeof item.amount === 'number' && item.date) {
          await this.saveContribution(item);
        }
      }
    }
  }

  async resetAll(): Promise<void> {
    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([CONTRIBUTIONS_STORE, SETTINGS_STORE], 'readwrite');
        transaction.objectStore(CONTRIBUTIONS_STORE).clear();
        transaction.objectStore(SETTINGS_STORE).clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch {
      // Ignore
    }
    localStorage.removeItem('security_fund_contributions');
    localStorage.removeItem('security_fund_settings');
  }
}

export const dbService = new DatabaseService();
