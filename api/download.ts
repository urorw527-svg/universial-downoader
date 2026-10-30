import { Ytdl } from '@distube/ytdl-core';

const ytdl = new Ytdl();

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, mode = 'both', quality = '1080p' } = req.query || {};
  if (!url) {
    res.status(400).send('URL query parameter is required');
    return;
  }

  const cleanUrl = String(url).trim();
  const lower = cleanUrl.toLowerCase();

  try {
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      const info = await ytdl.getInfo(cleanUrl);
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'video';

      if (mode === 'audio_only') {
        const filename = `${title}.mp3`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        const stream = ytdl.download(cleanUrl, {
          filter: (f: any) => f.hasAudio && !f.hasVideo,
          quality: 'highestaudio'
        });
        stream.pipe(res);
        return;
      }

      const filename = `${title}_${quality}.mp4`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'video/mp4');

      const isVideoOnly = mode === 'video_only';
      const stream = ytdl.download(cleanUrl, {
        filter: (f: any) => isVideoOnly ? (f.hasVideo && !f.hasAudio) : (f.hasVideo && f.hasAudio),
        quality: quality === '1080p' ? 'highestvideo' : 'highest'
      });

      stream.on('error', () => {
        if (!res.headersSent) {
          const fallback = ytdl.download(cleanUrl, { quality: 'highest' });
          fallback.pipe(res);
        }
      });

      stream.pipe(res);
      return;
    }

    // Direct files
    const response = await fetch(cleanUrl);
    if (response.ok) {
      const filename = cleanUrl.split('/').pop() || 'download.mp4';
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
      return;
    }

    res.redirect(cleanUrl);
  } catch (err: any) {
    res.status(500).send('Error streaming media: ' + err.message);
  }
}
