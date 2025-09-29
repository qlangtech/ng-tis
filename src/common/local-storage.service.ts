/**
 * Modern LocalStorage Service compatible with Angular 17
 * Replacement for angular-2-local-storage
 */
import { Injectable } from '@angular/core';

export interface ILocalStorageServiceConfig {
  prefix?: string;
  storageType?: 'localStorage' | 'sessionStorage';
  notifyOptions?: {
    setItem?: boolean;
    removeItem?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private prefix: string = 'tis';
  private storageType: 'localStorage' | 'sessionStorage' = 'localStorage';
  private notifyOptions = {
    setItem: true,
    removeItem: true
  };

  constructor() {}

  public configure(config: ILocalStorageServiceConfig): void {
    if (config.prefix !== undefined) {
      this.prefix = config.prefix;
    }
    if (config.storageType !== undefined) {
      this.storageType = config.storageType;
    }
    if (config.notifyOptions !== undefined) {
      this.notifyOptions = { ...this.notifyOptions, ...config.notifyOptions };
    }
  }

  private getStorage(): Storage {
    return this.storageType === 'localStorage' ? localStorage : sessionStorage;
  }

  private deriveKey(key: string): string {
    return `${this.prefix}.${key}`;
  }

  public isSupported(): boolean {
    try {
      const storage = this.getStorage();
      const testKey = '__test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  public set<T>(key: string, value: T): boolean {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const storage = this.getStorage();
      const storageKey = this.deriveKey(key);
      const serializedValue = JSON.stringify(value);
      storage.setItem(storageKey, serializedValue);
      return true;
    } catch (e) {
      console.error('LocalStorage set error:', e);
      return false;
    }
  }

  public get<T>(key: string): T | null {
    if (!this.isSupported()) {
      return null;
    }

    try {
      const storage = this.getStorage();
      const storageKey = this.deriveKey(key);
      const item = storage.getItem(storageKey);

      if (item === null) {
        return null;
      }

      return JSON.parse(item) as T;
    } catch (e) {
      console.error('LocalStorage get error:', e);
      return null;
    }
  }

  public keys(): string[] {
    if (!this.isSupported()) {
      return [];
    }

    const storage = this.getStorage();
    const keys: string[] = [];
    const prefixLength = this.prefix.length + 1;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.prefix + '.')) {
        keys.push(key.substring(prefixLength));
      }
    }

    return keys;
  }

  public remove(...keys: string[]): boolean {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const storage = this.getStorage();
      keys.forEach(key => {
        const storageKey = this.deriveKey(key);
        storage.removeItem(storageKey);
      });
      return true;
    } catch (e) {
      console.error('LocalStorage remove error:', e);
      return false;
    }
  }

  public clearAll(regularExpression?: string): boolean {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const storage = this.getStorage();
      const keys = this.keys();

      if (regularExpression) {
        const regex = new RegExp(regularExpression);
        keys.filter(key => regex.test(key)).forEach(key => {
          storage.removeItem(this.deriveKey(key));
        });
      } else {
        keys.forEach(key => {
          storage.removeItem(this.deriveKey(key));
        });
      }

      return true;
    } catch (e) {
      console.error('LocalStorage clearAll error:', e);
      return false;
    }
  }

  public length(): number {
    return this.keys().length;
  }
}