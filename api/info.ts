import { Ytdl } from '@distube/ytdl-core';

const ytdl = new Ytdl();

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req.body || req.query || {};
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  const cleanUrl = String(url).trim();
  const lower = cleanUrl.toLowerCase();

  try {
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      const info = await ytdl.getInfo(cleanUrl);
      const details = info.videoDetails;

      const videoFormats = info.formats
        .filter(f => f.hasVideo)
        .map(f => ({
          qualityLabel: f.qualityLabel || `${f.height}p` || 'HD',
          width: f.width,
          height: f.height,
          fps: f.fps || 30,
          mimeType: f.mimeType,
          container: f.container || 'mp4',
          hasAudio: f.hasAudio
        }));

      const seen = new Set<string>();
      const distinct: typeof videoFormats = [];
      for (const vf of videoFormats) {
        if (vf.qualityLabel && !seen.has(vf.qualityLabel)) {
          seen.add(vf.qualityLabel);
          distinct.push(vf);
        }
      }

      const thumbs = [...(details.thumbnails || [])];
      const thumbnail = thumbs[thumbs.length - 1]?.url
        || `https://img.youtube.com/vi/${(details as any).videoId || (details as any).id || ''}/hqdefault.jpg`;

      res.status(200).json({
        success: true,
        data: {
          title: details.title,
          author: details.author?.name || 'Creator',
          duration: `${Math.floor(+details.lengthSeconds / 60)}:${String(+details.lengthSeconds % 60).padStart(2, '0')}`,
          thumbnail,
          platform: 'YouTube',
          sourceUrl: cleanUrl,
          availableVideoQualities: distinct,
          hasDirectStream: true
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        title: 'Online Video Stream',
        duration: '--',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        platform: 'Web Stream',
        sourceUrl: cleanUrl,
        hasDirectStream: true
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
