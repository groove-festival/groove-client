export type BrowserStorage = "local" | "session";

const getStorage = (storage: BrowserStorage): Storage =>
  storage === "local" ? window.localStorage : window.sessionStorage;

export const readStorageItem = (
  storage: BrowserStorage,
  key: string,
): string | null => {
  try {
    return getStorage(storage).getItem(key);
  } catch {
    return null;
  }
};

export const writeStorageItem = (
  storage: BrowserStorage,
  key: string,
  value: string | null,
): boolean => {
  try {
    const target = getStorage(storage);
    if (value === null) {
      target.removeItem(key);
    } else {
      target.setItem(key, value);
    }
    return true;
  } catch {
    return false;
  }
};
