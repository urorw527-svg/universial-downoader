export interface PersistedDownload {
  id: string;
  title: string;
  sourceUrl: string;
  mode: 'both' | 'video_only' | 'audio_only';
  qualityLabel: string;
  filename: string;
  fileSizeBytes: number;
  date: string;
  thumbnail: string;
  platform: string;
  videoId?: string;
}

const STORAGE_KEY = 'media_downloader_history_v1';

export function getStoredHistory(): PersistedDownload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: PersistedDownload): void {
  try {
    const existing = getStoredHistory();
    const updated = [item, ...existing.filter(i => i.id !== item.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save history item to localStorage:', err);
  }
}

export function deleteHistoryItem(id: string): void {
  try {
    const existing = getStoredHistory();
    const updated = existing.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete history item from localStorage:', err);
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
