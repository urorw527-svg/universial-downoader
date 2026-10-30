import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { Ytdl } from '@distube/ytdl-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const ytdl = new Ytdl();

// API Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', server: 'Media Downloader Backend' });
});

// API: Inspect Video / Audio URL and retrieve genuine formats & metadata
app.post('/api/media/info', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  const cleanUrl = url.trim();
  const lower = cleanUrl.toLowerCase();

  try {
    // 1. YouTube links
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

      // Deduplicate qualities
      const seenQualities = new Set<string>();
      const distinctVideoQualities: typeof videoFormats = [];
      for (const vf of videoFormats) {
        if (vf.qualityLabel && !seenQualities.has(vf.qualityLabel)) {
          seenQualities.add(vf.qualityLabel);
          distinctVideoQualities.push(vf);
        }
      }

      const thumbs = [...(details.thumbnails || [])];
      const thumbnail = thumbs[thumbs.length - 1]?.url
        || `https://img.youtube.com/vi/${(details as any).videoId || (details as any).id || ''}/hqdefault.jpg`;

      res.json({
        success: true,
        data: {
          title: details.title,
          author: details.author?.name || 'Creator',
          duration: `${Math.floor(+details.lengthSeconds / 60)}:${String(+details.lengthSeconds % 60).padStart(2, '0')}`,
          thumbnail,
          platform: 'YouTube',
          sourceUrl: cleanUrl,
          availableVideoQualities: distinctVideoQualities,
          hasDirectStream: true
        }
      });
      return;
    }

    // 2. Direct Media files (.mp4, .mp3, etc.)
    if (lower.endsWith('.mp4') || lower.endsWith('.mp3') || lower.endsWith('.webm') || lower.endsWith('.m4a')) {
      const urlObj = new URL(cleanUrl);
      const filename = path.basename(urlObj.pathname) || 'media_file';
      const isAudio = lower.endsWith('.mp3') || lower.endsWith('.m4a');

      res.json({
        success: true,
        data: {
          title: decodeURIComponent(filename),
          duration: '--:--',
          thumbnail: isAudio 
            ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
          platform: 'Direct Media',
          sourceUrl: cleanUrl,
          hasDirectStream: true
        }
      });
      return;
    }

    // 3. Vimeo / Generic via oEmbed
    if (lower.includes('vimeo.com')) {
      const oembedRes = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(cleanUrl)}`);
      if (oembedRes.ok) {
        const oembedData: any = await oembedRes.json();
        res.json({
          success: true,
          data: {
            title: oembedData.title || 'Vimeo Video',
            author: oembedData.author_name || 'Vimeo Creator',
            duration: oembedData.duration ? `${Math.floor(oembedData.duration / 60)}:${oembedData.duration % 60}` : '--',
            thumbnail: oembedData.thumbnail_url,
            platform: 'Vimeo',
            sourceUrl: cleanUrl,
            hasDirectStream: true
          }
        });
        return;
      }
    }

    // Fallback: title from URL
    const urlObj = new URL(cleanUrl);
    res.json({
      success: true,
      data: {
        title: urlObj.hostname + ' Media Stream',
        duration: '--',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        platform: 'Web Stream',
        sourceUrl: cleanUrl,
        hasDirectStream: true
      }
    });

  } catch (err: any) {
    console.error('Error in /api/media/info:', err.message);
    res.status(500).json({ error: 'Failed to inspect media URL: ' + err.message });
  }
});

// API: Stream & Download the ACTUAL, GENUINE ORIGINAL VIDEO or AUDIO
app.get('/api/media/download', async (req: Request, res: Response) => {
  const url = req.query.url as string;
  const mode = (req.query.mode as string) || 'both'; // both, video_only, audio_only
  const quality = (req.query.quality as string) || '1080p';

  if (!url) {
    res.status(400).send('URL query parameter is required');
    return;
  }

  const cleanUrl = url.trim();
  const lower = cleanUrl.toLowerCase();

  try {
    // 1. YouTube Actual Media Stream
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

      // Video + Audio / Video Only
      const isVideoOnly = mode === 'video_only';
      const filename = `${title}_${quality}.mp4`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'video/mp4');

      const stream = ytdl.download(cleanUrl, {
        filter: (f: any) => isVideoOnly ? (f.hasVideo && !f.hasAudio) : (f.hasVideo && f.hasAudio),
        quality: quality === '1080p' ? 'highestvideo' : 'highest'
      });

      stream.on('error', (err) => {
        console.error('YouTube streaming error, falling back to highest available:', err.message);
        // Fallback to highest available stream
        if (!res.headersSent) {
          const fallbackStream = ytdl.download(cleanUrl, { quality: 'highest' });
          fallbackStream.pipe(res);
        }
      });

      stream.pipe(res);
      return;
    }

    // 2. Direct Media files: proxy raw stream
    if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mp3') || lower.endsWith('.m4a') || lower.includes('commondatastorage.googleapis.com')) {
      const response = await fetch(cleanUrl);
      if (!response.ok) {
        res.status(400).send('Failed to fetch remote media');
        return;
      }

      const urlObj = new URL(cleanUrl);
      const filename = path.basename(urlObj.pathname) || 'download.mp4';
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      if (response.headers.get('content-type')) {
        res.setHeader('Content-Type', response.headers.get('content-type')!);
      }
      if (response.headers.get('content-length')) {
        res.setHeader('Content-Length', response.headers.get('content-length')!);
      }

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
      return;
    }

    // 3. Fallback for other URLs: redirect directly
    res.redirect(cleanUrl);

  } catch (err: any) {
    console.error('Download stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).send('Error streaming media: ' + err.message);
    }
  }
});

// Setup Vite Dev Server Middleware in Development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Media Downloader Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
