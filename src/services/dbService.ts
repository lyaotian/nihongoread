import { QuizHistoryItem } from '../types';

const DB_NAME = 'NihongoReadDB';
const STORE_NAME = 'quizHistory';
const DB_VERSION = 1;

export class DBService {
  private static instance: DBService;
  private db: IDBDatabase | null = null;

  private constructor() {}

  public static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService();
    }
    return DBService.instance;
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject('Failed to open database');
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  public async saveQuiz(item: Omit<QuizHistoryItem, 'id'>): Promise<number> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject('Failed to save quiz result');
    });
  }

  public async getHistory(): Promise<QuizHistoryItem[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by timestamp descending
        const items = (request.result as QuizHistoryItem[]).sort((a, b) => b.timestamp - a.timestamp);
        resolve(items);
      };
      request.onerror = () => reject('Failed to fetch history');
    });
  }

  public async deleteQuiz(id: number): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Failed to delete quiz result');
    });
  }
}

export const dbService = DBService.getInstance();
