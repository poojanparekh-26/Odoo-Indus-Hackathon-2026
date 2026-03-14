import { useState, useEffect } from "react";

export function useAutoSave<T>(key: string, data: T, delay = 3000) {
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!data || (typeof data === "object" && Object.keys(data as object).length === 0)) return;

    const handler = setTimeout(() => {
      localStorage.setItem(`coreinventory-draft-${key}`, JSON.stringify(data));
      setSavedAt(new Date());
      console.log(`[AutoSave] Draft saved for ${key}`);
    }, delay);

    return () => clearTimeout(handler);
  }, [data, key, delay]);

  const loadDraft = (): T | null => {
    const saved = localStorage.getItem(`coreinventory-draft-${key}`);
    return saved ? JSON.parse(saved) : null;
  };

  const clearDraft = () => {
    localStorage.removeItem(`coreinventory-draft-${key}`);
    setSavedAt(null);
  };

  return { savedAt, loadDraft, clearDraft };
}
