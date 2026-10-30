import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Download, 
  ArrowRight, 
  Clipboard, 
  Film, 
  Music, 
  Video, 
  CheckCircle2, 
  Puzzle, 
  ExternalLink, 
  X, 
  Loader2, 
  Check, 
  FileText,
  Trash2,
  FolderDown,
  Info
} from 'lucide-react';
import { resolveMediaUrl, downloadMediaFile, ResolvedMedia } from './utils/mediaResolver';
import { EXTENSION_FILES } from './data/projectData';

interface HistoryItem {
  id: string;
  title: string;
  mode: 'both' | 'video_only' | 'audio_only';
  filename: string;
  date: string;
  thumbnail: string;
  platform: string;
  fileBlobUrl?: string;
}

export default function App() {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentMedia, setCurrentMedia] = useState<ResolvedMedia | null>(null);

  // Download in progress state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [activeDownloadMode, setActiveDownloadMode] = useState<'both' | 'video_only' | 'audio_only' | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<string>('');
  const [downloadCompleted, setDownloadCompleted] = useState<boolean>(false);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Extension modal
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [extensionDownloaded, setExtensionDownloaded] = useState<boolean>(false);

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setErrorMessage(null);
      }
    } catch {
      setErrorMessage('Please paste the URL manually into the input box.');
    }
  };

  // Fetch / Inspect URL
  const handleFetchMedia = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = urlInput.trim();
    if (!target) {
      setErrorMessage('Please enter or paste a video link first.');
      return;
    }

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      setErrorMessage('Please enter a valid link starting with https://');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setCurrentMedia(null);
    setDownloadCompleted(false);

    try {
      const resolved = await resolveMediaUrl(target);
      setCurrentMedia(resolved);
    } catch (err: any) {
      setErrorMessage('Could not load information for this link. Please check the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Download
  const handleDownload = async (mode: 'both' | 'video_only' | 'audio_only') => {
    if (!currentMedia) return;

    setIsDownloading(true);
    setActiveDownloadMode(mode);
    setDownloadProgress(5);
    setDownloadSpeed('Connecting...');
    setDownloadCompleted(false);

    try {
      await downloadMediaFile(currentMedia, mode, (percent, speed) => {
        setDownloadProgress(percent);
        setDownloadSpeed(speed);
      });

      setDownloadProgress(100);
      setDownloadCompleted(true);

      const ext = mode === 'audio_only' ? 'mp3' : 'mp4';
      const cleanName = `${currentMedia.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'media'}.${ext}`;

      const newItem: HistoryItem = {
        id: 'hist-' + Date.now(),
        title: currentMedia.title,
        mode,
        filename: cleanName,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thumbnail: currentMedia.thumbnail,
        platform: currentMedia.platform
      };

      setHistory(prev => [newItem, ...prev]);
    } catch (err) {
      setErrorMessage('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download Companion Extension ZIP
  const handleDownloadExtensionZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('media-sniffer-extension');

      EXTENSION_FILES.forEach(file => {
        folder?.file(file.name, file.content);
      });

      folder?.file(
        'README-SETUP.txt',
        `============================================================
MEDIA SNIFFER BROWSER EXTENSION (EDGE & CHROME)
============================================================

HOW TO USE IN ANY TAB:
1. Unzip this folder on your computer.
2. In Microsoft Edge, go to: edge://extensions
   (or in Google Chrome, go to: chrome://extensions)
3. Turn ON "Developer mode" (switch in the corner).
4. Click "Load unpacked" button.
5. Select this unzipped folder!

Done! A download button will now appear on videos in every tab.
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'media-sniffer-extension.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExtensionDownloaded(true);
      setTimeout(() => setExtensionDownloaded(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Clean, Simple Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">Media Downloader</span>
              <p className="text-[11px] text-slate-400">Simple video & audio downloader</p>
            </div>
          </div>

          <button
            onClick={() => setIsExtensionModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
          >
            <Puzzle className="w-3.5 h-3.5 text-blue-400" />
            <span>Browser Extension</span>
          </button>
        </div>
      </header>

      {/* Main Single-Page Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Simple Hero */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Download video or audio from any link
          </h1>
          <p className="text-sm text-slate-400">
            Paste a link from YouTube, Facebook, Vimeo, or any website to save it to your device.
          </p>
        </div>

        {/* Main URL Input Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <form onSubmit={handleFetchMedia} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Paste video or audio link here (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-12 transition-all"
              />
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                title="Paste from clipboard"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded transition-colors"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Fetch Video</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <p className="text-xs text-red-400 pt-1 px-1">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Active Media Download Card */}
        {currentMedia && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
            
            {/* Thumbnail & Title */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shrink-0 relative">
                <img
                  src={currentMedia.thumbnail}
                  alt={currentMedia.title}
                  className="w-full h-full object-cover"
                />
                {currentMedia.duration && (
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {currentMedia.duration}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="inline-block text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-medium">
                  {currentMedia.platform}
                </span>
                <h3 className="text-base font-semibold text-white leading-snug">
                  {currentMedia.title}
                </h3>
                <p className="text-xs text-slate-400 truncate font-mono">
                  {currentMedia.sourceUrl}
                </p>
              </div>
            </div>

            {/* Three Simple Download Mode Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300">Choose format to download:</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Mode 1: Video + Audio */}
                <button
                  onClick={() => handleDownload('both')}
                  disabled={isDownloading}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    activeDownloadMode === 'both' && isDownloading
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-700 hover:border-blue-500 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Film className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-sm text-white">Video + Audio</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Full MP4 video with sound (1080p / 720p)
                  </p>
                </button>

                {/* Mode 2: Video Only */}
                <button
                  onClick={() => handleDownload('video_only')}
                  disabled={isDownloading}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    activeDownloadMode === 'video_only' && isDownloading
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-700 hover:border-blue-500 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-sm text-white">Video Only</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    MP4 video without audio track
                  </p>
                </button>

                {/* Mode 3: Audio Only */}
                <button
                  onClick={() => handleDownload('audio_only')}
                  disabled={isDownloading}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    activeDownloadMode === 'audio_only' && isDownloading
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-700 hover:border-blue-500 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Music className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-sm text-white">Audio Only (MP3)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Clean MP3 audio file for music or speech
                  </p>
                </button>

              </div>
            </div>

            {/* Live Download Progress Bar */}
            {isDownloading && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">Downloading to your computer...</span>
                  <span className="text-blue-400 font-bold">{downloadProgress}% ({downloadSpeed})</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-150 rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {downloadCompleted && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Download completed! Saved to your computer's Downloads folder.</span>
                </div>
                <button
                  onClick={() => {
                    if (activeDownloadMode) handleDownload(activeDownloadMode);
                  }}
                  className="text-white bg-emerald-700 hover:bg-emerald-600 px-2.5 py-1 rounded font-medium text-xs"
                >
                  Download Again
                </button>
              </div>
            )}

          </div>
        )}

        {/* Recent Downloads in This Session */}
        {history.length > 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">Recent Downloads</h4>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-slate-500 hover:text-slate-400"
              >
                Clear History
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800/80 overflow-hidden">
              {history.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-800">
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate max-w-sm">{item.filename}</div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {item.platform} • {item.mode === 'audio_only' ? 'Audio MP3' : 'Video MP4'} • {item.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clean, Simple Extension Promo Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-semibold text-sm text-white flex items-center gap-2">
              <Puzzle className="w-4 h-4 text-blue-400" />
              <span>Want a download button on every video in your browser?</span>
            </div>
            <p className="text-xs text-slate-400">
              Get our companion browser extension for Microsoft Edge and Google Chrome. Works in every tab.
            </p>
          </div>

          <button
            onClick={() => setIsExtensionModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all shrink-0"
          >
            Get Extension Instructions
          </button>
        </div>

      </main>

      {/* Simple Browser Extension Modal */}
      {isExtensionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-xs">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm">Browser Extension Setup</span>
              </div>
              <button
                onClick={() => setIsExtensionModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simple 3 Steps */}
            <div className="p-5 space-y-4 text-slate-300">
              <p className="text-slate-400">
                You can install this extension directly in <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong> without needing the web store.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <div className="font-semibold text-white">Download and Unzip the Extension</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Click the button below to download the ZIP file and extract it to a folder on your computer.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <div className="font-semibold text-white">Open Extensions in Edge or Chrome</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      In your browser, visit <code className="text-blue-300">edge://extensions</code> or <code className="text-blue-300">chrome://extensions</code>, and turn on the <strong>Developer mode</strong> switch.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <div className="font-semibold text-white">Click "Load Unpacked"</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Select your unzipped folder. A "Download video" button will now appear on videos across all tabs!
                    </div>
                  </div>
                </div>
              </div>

              {extensionDownloaded && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Extension ZIP downloaded! Extract it and click "Load unpacked".</span>
                </div>
              )}
            </div>

            {/* Footer with Big Action Button */}
            <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setIsExtensionModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
              >
                Close
              </button>

              <button
                onClick={handleDownloadExtensionZip}
                disabled={isZipping}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white rounded-lg font-semibold shadow-md transition-all"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing ZIP...</span>
                  </>
                ) : (
                  <>
                    <FolderDown className="w-4 h-4" />
                    <span>Download Extension (.zip)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>Media Downloader • Fast, simple video and audio saving</p>
      </footer>
    </div>
  );
}
