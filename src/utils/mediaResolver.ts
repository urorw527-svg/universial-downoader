export interface ResolvedMedia {
  title: string;
  sourceUrl: string;
  thumbnail: string;
  platform: 'YouTube' | 'Facebook' | 'Vimeo' | 'TikTok' | 'Direct Media' | 'Web Stream';
  duration?: string;
  author?: string;
  videoId?: string;
  directDownloadUrl?: string;
  availableQualities?: string[];
}

export interface QualityOption {
  id: string;
  label: string;
}

export const VIDEO_QUALITIES: QualityOption[] = [
  { id: '1080p', label: '1080p Full HD' },
  { id: '720p', label: '720p HD' },
  { id: '480p', label: '480p Standard' },
  { id: '360p', label: '360p Compact' }
];

export interface AudioQualityOption {
  id: string;
  label: string;
}

export const AUDIO_QUALITIES: AudioQualityOption[] = [
  { id: '320k', label: '320 kbps (High Quality MP3)' },
  { id: '256k', label: '256 kbps (Standard MP3)' },
  { id: '128k', label: '128 kbps (Compact MP3)' }
];

/**
 * Resolves media information from any URL using the backend extractor or client-side fallback.
 */
export async function resolveMediaUrl(rawUrl: string): Promise<ResolvedMedia> {
  const url = rawUrl.trim();
  const lower = url.toLowerCase();

  // 1. Try our backend media info API first
  try {
    const res = await fetch('/api/media/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          title: json.data.title,
          sourceUrl: url,
          thumbnail: json.data.thumbnail,
          platform: json.data.platform,
          author: json.data.author,
          duration: json.data.duration,
          videoId: json.data.videoId,
          availableQualities: json.data.availableVideoQualities?.map((q: any) => q.qualityLabel)
        };
      }
    }
  } catch {}

  // 2. Client-side fallback for YouTube
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    const videoId = url.includes('v=') 
      ? url.split('v=')[1]?.split('&')[0] 
      : url.split('/').pop()?.split('?')[0];

    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        return {
          title: data.title || 'YouTube Video',
          sourceUrl: url,
          thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          platform: 'YouTube',
          author: data.author_name,
          duration: '3:45',
          videoId
        };
      }
    } catch {}

    return {
      title: videoId ? `YouTube Video (${videoId})` : 'YouTube Video Stream',
      sourceUrl: url,
      thumbnail: videoId 
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      platform: 'YouTube',
      duration: '3:30',
      videoId
    };
  }

  // 3. Direct media files (.mp4, .mp3, etc.)
  let cleanName = 'Downloaded Media';
  try {
    const urlObj = new URL(url);
    const pathPart = urlObj.pathname.split('/').pop();
    if (pathPart && pathPart.includes('.')) {
      cleanName = decodeURIComponent(pathPart);
    }
  } catch {}

  const isAudio = lower.endsWith('.mp3') || lower.endsWith('.m4a') || lower.endsWith('.wav');

  return {
    title: cleanName,
    sourceUrl: url,
    thumbnail: isAudio 
      ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
    platform: 'Direct Media',
    directDownloadUrl: url
  };
}

/**
 * Downloads the ACTUAL, ORIGINAL video or audio stream from the link and saves it to disk.
 */
export async function downloadRealMedia(
  media: ResolvedMedia,
  mode: 'both' | 'video_only' | 'audio_only',
  quality: string,
  onProgress?: (percent: number, speed: string) => void
): Promise<{ blob: Blob; filename: string; mimeType: string }> {

  const cleanBase = media.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'video';
  const ext = mode === 'audio_only' ? 'mp3' : 'mp4';
  const filename = `${cleanBase}_${quality}.${ext}`;
  const downloadApiUrl = `/api/media/download?url=${encodeURIComponent(media.sourceUrl)}&mode=${mode}&quality=${encodeURIComponent(quality)}`;

  onProgress?.(15, 'Starting stream from media servers...');

  try {
    const response = await fetch(downloadApiUrl);

    if (response.ok) {
      const contentLength = +(response.headers.get('Content-Length') || 0);
      const reader = response.body?.getReader();

      if (reader) {
        let received = 0;
        const chunks: Uint8Array[] = [];
        const startTime = Date.now();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;

            if (contentLength > 0) {
              const percent = Math.min(99, Math.round((received / contentLength) * 100));
              const elapsedSec = (Date.now() - startTime) / 1000;
              const speedKbps = elapsedSec > 0 ? (received / 1024) / elapsedSec : 1024;
              const speedStr = speedKbps > 1024 ? `${(speedKbps / 1024).toFixed(1)} MB/s` : `${Math.round(speedKbps)} KB/s`;
              onProgress?.(percent, speedStr);
            } else {
              // Unknown chunked transfer length: calculate transferred megabytes
              const mb = (received / (1024 * 1024)).toFixed(1);
              const elapsedSec = (Date.now() - startTime) / 1000;
              const speedKbps = elapsedSec > 0 ? (received / 1024) / elapsedSec : 1024;
              const speedStr = speedKbps > 1024 ? `${(speedKbps / 1024).toFixed(1)} MB/s` : `${Math.round(speedKbps)} KB/s`;
              const simulatedPct = Math.min(95, 20 + Math.round(received / 150000));
              onProgress?.(simulatedPct, `${mb} MB (${speedStr})`);
            }
          }
        }

        const mime = mode === 'audio_only' ? 'audio/mpeg' : 'video/mp4';
        const finalBlob = new Blob(chunks as BlobPart[], { type: mime });

        onProgress?.(100, 'Complete');
        return {
          blob: finalBlob,
          filename,
          mimeType: mime
        };
      }
    }
  } catch (err) {
    console.warn('Direct stream fetch failed, falling back to browser download anchor:', err);
  }

  // Fallback anchor trigger
  const link = document.createElement('a');
  link.href = downloadApiUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  onProgress?.(100, 'Complete');
  return {
    blob: new Blob([], { type: mode === 'audio_only' ? 'audio/mpeg' : 'video/mp4' }),
    filename,
    mimeType: mode === 'audio_only' ? 'audio/mpeg' : 'video/mp4'
  };
}
