import { MediaMetadata } from '../types/idm';

export const SAMPLE_MEDIA_LIST: MediaMetadata[] = [
  {
    title: 'Big Buck Bunny (1080p Full HD Open Media)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    platform: 'generic',
    duration: '09:56',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    formats: [
      {
        id: '1080p-full',
        label: '1080p Full HD (Video + Audio)',
        resolution: '1920x1080',
        fps: 60,
        ext: 'mp4',
        sizeBytes: 158 * 1024 * 1024,
        mode: 'both',
        codec: 'H.264 / AAC'
      },
      {
        id: '720p-video',
        label: '720p HD (Video Only)',
        resolution: '1280x720',
        fps: 30,
        ext: 'mp4',
        sizeBytes: 92 * 1024 * 1024,
        mode: 'video_only',
        codec: 'H.264'
      },
      {
        id: 'audio-hq',
        label: 'High Quality Audio Only (MP3 320kbps)',
        ext: 'mp3',
        sizeBytes: 24 * 1024 * 1024,
        mode: 'audio_only',
        codec: 'MP3'
      }
    ]
  },
  {
    title: 'Tears of Steel (Sci-Fi 4K Visual Showcase)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    platform: 'generic',
    duration: '12:14',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    formats: [
      {
        id: 'tos-1080p',
        label: '1080p Cinema Master (Video + Audio)',
        resolution: '1920x1080',
        fps: 24,
        ext: 'mp4',
        sizeBytes: 210 * 1024 * 1024,
        mode: 'both',
        codec: 'H.264 / AAC'
      },
      {
        id: 'tos-audio',
        label: 'Soundtrack Master (Audio Only)',
        ext: 'm4a',
        sizeBytes: 28 * 1024 * 1024,
        mode: 'audio_only',
        codec: 'AAC 256kbps'
      }
    ]
  },
  {
    title: 'YouTube: Inspiring Cinematic Nature Landscapes',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'youtube',
    duration: '03:33',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
    formats: [
      {
        id: 'yt-1080p',
        label: '1080p60 HDR (Video + Audio)',
        resolution: '1920x1080',
        fps: 60,
        ext: 'mp4',
        sizeBytes: 74 * 1024 * 1024,
        mode: 'both',
        codec: 'VP9 / Opus'
      },
      {
        id: 'yt-720p',
        label: '720p Standard (Video Only)',
        resolution: '1280x720',
        fps: 30,
        ext: 'mp4',
        sizeBytes: 42 * 1024 * 1024,
        mode: 'video_only',
        codec: 'H.264'
      },
      {
        id: 'yt-mp3',
        label: 'Audio Stream (MP3 320kbps)',
        ext: 'mp3',
        sizeBytes: 8.5 * 1024 * 1024,
        mode: 'audio_only',
        codec: 'MP3'
      }
    ]
  },
  {
    title: 'Facebook Reels: Tech Hardware Engineering Teaser',
    url: 'https://www.facebook.com/reel/1049284729182',
    platform: 'facebook',
    duration: '00:48',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    formats: [
      {
        id: 'fb-hd',
        label: 'HD Mobile Portrait (Video + Audio)',
        resolution: '1080x1920',
        fps: 30,
        ext: 'mp4',
        sizeBytes: 18 * 1024 * 1024,
        mode: 'both',
        codec: 'H.264 / AAC'
      },
      {
        id: 'fb-audio',
        label: 'Audio Sound Effect (M4A)',
        ext: 'm4a',
        sizeBytes: 1.8 * 1024 * 1024,
        mode: 'audio_only',
        codec: 'AAC'
      }
    ]
  }
];

export function parseMediaUrl(inputUrl: string): MediaMetadata {
  const trimmed = inputUrl.trim();
  const lower = trimmed.toLowerCase();

  // Match existing sample if direct match
  const matched = SAMPLE_MEDIA_LIST.find(
    s => s.url.toLowerCase() === lower || lower.includes(s.title.toLowerCase())
  );
  if (matched) return matched;

  let platform: MediaMetadata['platform'] = 'generic';
  let title = 'Extracted Web Stream';
  let thumbnail = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    platform = 'youtube';
    title = 'YouTube Video Capture (' + (trimmed.split('v=')[1]?.slice(0, 8) || 'Stream') + ')';
    thumbnail = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80';
  } else if (lower.includes('facebook.com') || lower.includes('fb.watch')) {
    platform = 'facebook';
    title = 'Facebook Video Post';
    thumbnail = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80';
  } else if (lower.includes('vimeo.com')) {
    platform = 'vimeo';
    title = 'Vimeo HD Showcase';
    thumbnail = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80';
  } else {
    // Extract filename from URL path if possible
    try {
      const urlObj = new URL(trimmed);
      const pathname = urlObj.pathname;
      const filePart = pathname.substring(pathname.lastIndexOf('/') + 1);
      if (filePart && filePart.length > 2) {
        title = decodeURIComponent(filePart);
      }
    } catch {}
  }

  return {
    title,
    url: trimmed,
    platform,
    duration: '04:15',
    thumbnail,
    formats: [
      {
        id: 'fmt-1080p',
        label: '1080p Best (Video + Audio)',
        resolution: '1920x1080',
        fps: 60,
        ext: 'mp4',
        sizeBytes: 85 * 1024 * 1024,
        mode: 'both',
        codec: 'H.264 / AAC'
      },
      {
        id: 'fmt-720p',
        label: '720p Medium (Video Only)',
        resolution: '1280x720',
        fps: 30,
        ext: 'mp4',
        sizeBytes: 45 * 1024 * 1024,
        mode: 'video_only',
        codec: 'H.264'
      },
      {
        id: 'fmt-audio',
        label: 'Audio Only (MP3 320kbps)',
        ext: 'mp3',
        sizeBytes: 9.8 * 1024 * 1024,
        mode: 'audio_only',
        codec: 'MP3'
      }
    ]
  };
}
