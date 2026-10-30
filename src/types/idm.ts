export type DownloadStatus = 'downloading' | 'paused' | 'completed' | 'queued' | 'error';

export type DownloadCategory = 'video' | 'music' | 'compressed' | 'document' | 'program' | 'other';

export type DownloadMode = 'both' | 'video_only' | 'audio_only';

export interface ChunkSegment {
  id: number;
  startByte: number;
  endByte: number;
  downloadedBytes: number;
  speedKbps: number;
  isComplete: boolean;
  progress: number;
}

export interface DownloadItem {
  id: string;
  name: string;
  url: string;
  category: DownloadCategory;
  mode: DownloadMode;
  quality: string;
  totalSize: number; // in bytes
  downloadedBytes: number;
  speedKbps: number;
  status: DownloadStatus;
  progress: number; // 0 to 100
  timeLeftSeconds: number;
  addedAt: string;
  completedAt?: string;
  chunks: ChunkSegment[];
  localBlobUrl?: string;
  thumbnail?: string;
  error?: string;
}

export interface MediaMetadata {
  title: string;
  url: string;
  platform: 'youtube' | 'facebook' | 'vimeo' | 'generic';
  duration: string;
  thumbnail: string;
  formats: {
    id: string;
    label: string;
    resolution?: string;
    fps?: number;
    ext: string;
    sizeBytes: number;
    mode: DownloadMode;
    codec?: string;
  }[];
}
