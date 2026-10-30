import React, { useState, useEffect } from 'react';
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
  X, 
  Loader2, 
  Check, 
  Trash2, 
  FolderDown, 
  Play, 
  HardDrive, 
  Settings2
} from 'lucide-react';
import { 
  resolveMediaUrl, 
  downloadRealMedia, 
  ResolvedMedia, 
  VIDEO_QUALITIES, 
  AUDIO_QUALITIES, 
  QualityOption, 
  AudioQualityOption 
} from './utils/mediaResolver';
import { 
  getStoredHistory, 
  saveHistoryItem, 
  deleteHistoryItem, 
  clearAllHistory, 
  PersistedDownload 
} from './utils/historyStorage';
import { MediaPlayerModal } from './components/MediaPlayerModal';
import { EXTENSION_FILES } from './data/projectData';

export default function App() {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentMedia, setCurrentMedia] = useState<ResolvedMedia | null>(null);

  // Selected format and quality
  const [selectedMode, setSelectedMode] = useState<'both' | 'video_only' | 'audio_only'>('both');
  const [selectedVideoQuality, setSelectedVideoQuality] = useState<QualityOption>(VIDEO_QUALITIES[0]); // default 1080p
  const [selectedAudioQuality, setSelectedAudioQuality] = useState<AudioQualityOption>(AUDIO_QUALITIES[0]); // default 320k

  // Active download state
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<string>('');
  const [lastCompletedBlobUrl, setLastCompletedBlobUrl] = useState<string | null>(null);
  const [lastCompletedFilename, setLastCompletedFilename] = useState<string>('');

  // Player modal state
  const [playerModal, setPlayerModal] = useState<{
    isOpen: boolean;
    url: string | null;
    videoId?: string;
    platform?: string;
    title: string;
    filename: string;
    isAudio: boolean;
    qualityLabel: string;
  }>({
    isOpen: false,
    url: null,
    title: '',
    filename: '',
    isAudio: false,
    qualityLabel: ''
  });

  // Persistent History (Browser Cache)
  const [history, setHistory] = useState<PersistedDownload[]>([]);

  // In-memory cache of generated blobs for instant playback in current session
  const [blobCache, setBlobCache] = useState<Map<string, string>>(new Map());

  // Extension modal
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [extensionDownloaded, setExtensionDownloaded] = useState<boolean>(false);

  // Load history from browser cache (localStorage) on startup
  useEffect(() => {
    const stored = getStoredHistory();
    setHistory(stored);
  }, []);

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setErrorMessage(null);
      }
    } catch {
      setErrorMessage('Please paste the URL manually into the box.');
    }
  };

  // Fetch Media Information
  const handleFetchMedia = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = urlInput.trim();
    if (!target) {
      setErrorMessage('Please enter or paste a video link first.');
      return;
    }

    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      setErrorMessage('Please enter a valid web link starting with https://');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setCurrentMedia(null);
    setLastCompletedBlobUrl(null);

    try {
      const resolved = await resolveMediaUrl(target);
      setCurrentMedia(resolved);
    } catch {
      setErrorMessage('Could not load information for this link. Please check the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Real Download from the Link
  const handleDownload = async () => {
    if (!currentMedia) return;

    setIsDownloading(true);
    setDownloadProgress(10);
    setDownloadSpeed('Connecting to stream...');
    setLastCompletedBlobUrl(null);

    const qualityLabel = selectedMode === 'audio_only' 
      ? selectedAudioQuality.id 
      : selectedVideoQuality.id;

    try {
      const result = await downloadRealMedia(
        currentMedia,
        selectedMode,
        qualityLabel,
        (percent, speed) => {
          setDownloadProgress(percent);
          setDownloadSpeed(speed);
        }
      );

      // Create object URL for instant in-browser playback
      let objectUrl: string | null = null;
      if (result.blob.size > 0) {
        objectUrl = URL.createObjectURL(result.blob);
        setLastCompletedBlobUrl(objectUrl);

        // Trigger automatic save to disk
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Direct browser streaming anchor was triggered
        const streamUrl = `/api/media/download?url=${encodeURIComponent(currentMedia.sourceUrl)}&mode=${selectedMode}&quality=${qualityLabel}`;
        setLastCompletedBlobUrl(streamUrl);
      }

      setLastCompletedFilename(result.filename);

      // Save to persistent browser cache (localStorage)
      const fullQualityText = selectedMode === 'audio_only' 
        ? selectedAudioQuality.label 
        : selectedVideoQuality.label;

      const historyItem: PersistedDownload = {
        id: 'hist-' + Date.now(),
        title: currentMedia.title,
        sourceUrl: currentMedia.sourceUrl,
        mode: selectedMode,
        qualityLabel: fullQualityText,
        filename: result.filename,
        fileSizeBytes: result.blob.size || 15 * 1024 * 1024,
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        thumbnail: currentMedia.thumbnail,
        platform: currentMedia.platform,
        videoId: currentMedia.videoId
      };

      saveHistoryItem(historyItem);
      setHistory(getStoredHistory());

      if (objectUrl) {
        setBlobCache(prev => new Map(prev).set(historyItem.id, objectUrl!));
      }

      setDownloadProgress(100);
      setDownloadSpeed('Completed');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to download media. Please check the URL or try another quality.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Delete from history
  const handleDeleteHistory = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getStoredHistory());
  };

  // Clear all history
  const handleClearHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  // Open in-browser player for a history item
  const handlePlayMedia = (item: PersistedDownload) => {
    const playUrl = blobCache.get(item.id) 
      || `/api/media/download?url=${encodeURIComponent(item.sourceUrl)}&mode=${item.mode}&quality=1080p`;

    setPlayerModal({
      isOpen: true,
      url: playUrl,
      videoId: item.videoId,
      platform: item.platform,
      title: item.title,
      filename: item.filename,
      isAudio: item.mode === 'audio_only',
      qualityLabel: item.qualityLabel
    });
  };

  // Extension ZIP Packager
  const handleDownloadExtensionZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('media-downloader-extension');

      EXTENSION_FILES.forEach(file => {
        folder?.file(file.name, file.content);
      });

      folder?.file(
        'README.txt',
        `============================================================
MEDIA DOWNLOADER EXTENSION - EDGE & CHROME
============================================================

HOW TO USE ON EVERY TAB:
1. Extract this ZIP folder on your computer.
2. In Microsoft Edge: open edge://extensions
   In Google Chrome: open chrome://extensions
3. Turn ON "Developer mode".
4. Click "Load unpacked" button.
5. Select this unzipped folder!

Done! A download button will now float over videos in every tab.
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'media-downloader-extension.zip';
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      
      {/* Clean Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">Media Downloader</span>
              <p className="text-[11px] text-slate-400">Original video & audio stream downloader</p>
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

      {/* Main Single Page Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Title */}
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Download the original video or audio
          </h1>
          <p className="text-sm text-slate-400">
            Paste any link below to stream and save the authentic original video or audio file.
          </p>
        </div>

        {/* Clean URL Input Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
          <form onSubmit={handleFetchMedia} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Paste YouTube, Facebook, Vimeo, or video link here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-12 transition-all font-sans"
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
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Fetch Media</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <p className="text-xs text-red-400 px-1">{errorMessage}</p>
          )}
        </div>

        {/* Active Media Card & Quality Selector */}
        {currentMedia && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 animate-in fade-in duration-200">
            
            {/* Header: Thumbnail + Title + Platform */}
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
                <div className="flex items-center gap-2">
                  <span className="inline-block text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-medium">
                    {currentMedia.platform}
                  </span>
                  {currentMedia.author && (
                    <span className="text-xs text-slate-400">by {currentMedia.author}</span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-white leading-snug">
                  {currentMedia.title}
                </h3>
                <p className="text-xs text-slate-400 truncate font-mono">
                  {currentMedia.sourceUrl}
                </p>
              </div>
            </div>

            {/* Mode Selector (Video + Audio, Video Only, Audio Only) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-200">Select Media Type:</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMode('both')}
                  disabled={isDownloading}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedMode === 'both'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <Film className="w-3.5 h-3.5 text-blue-400" />
                      <span>Video + Audio</span>
                    </div>
                    {selectedMode === 'both' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">Full original video stream with sound</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('video_only')}
                  disabled={isDownloading}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedMode === 'video_only'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <Video className="w-3.5 h-3.5 text-purple-400" />
                      <span>Video Only</span>
                    </div>
                    {selectedMode === 'video_only' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">Original high-fps video track without audio</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('audio_only')}
                  disabled={isDownloading}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedMode === 'audio_only'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <Music className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Audio Only (MP3)</span>
                    </div>
                    {selectedMode === 'audio_only' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">Pure original audio track extracted to MP3</p>
                </button>
              </div>
            </div>

            {/* Quality Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {selectedMode === 'audio_only' ? 'Audio Quality (MP3):' : 'Video Resolution:'}
                  </span>
                </label>
                <span className="text-[11px] text-blue-400 font-mono">
                  {selectedMode === 'audio_only' ? selectedAudioQuality.label : selectedVideoQuality.label}
                </span>
              </div>

              {selectedMode === 'audio_only' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {AUDIO_QUALITIES.map((aq) => (
                    <button
                      key={aq.id}
                      type="button"
                      onClick={() => setSelectedAudioQuality(aq)}
                      disabled={isDownloading}
                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        selectedAudioQuality.id === aq.id
                          ? 'bg-slate-800 border-blue-500 text-white font-medium'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedAudioQuality.id === aq.id ? 'border-blue-400 bg-blue-600' : 'border-slate-600'
                        }`}>
                          {selectedAudioQuality.id === aq.id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                        <span className="text-xs">{aq.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">MP3</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {VIDEO_QUALITIES.map((vq) => (
                    <button
                      key={vq.id}
                      type="button"
                      onClick={() => setSelectedVideoQuality(vq)}
                      disabled={isDownloading}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                        selectedVideoQuality.id === vq.id
                          ? 'bg-slate-800 border-blue-500 text-white font-medium'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{vq.label}</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedVideoQuality.id === vq.id ? 'border-blue-400 bg-blue-600' : 'border-slate-600'
                        }`}>
                          {selectedVideoQuality.id === vq.id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Original Stream</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Download & Online Play Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Streaming Original Video ({downloadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      Download Original {selectedMode === 'audio_only' ? 'Audio' : 'Video'} ({selectedMode === 'audio_only' ? selectedAudioQuality.label : selectedVideoQuality.label})
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setPlayerModal({
                    isOpen: true,
                    url: lastCompletedBlobUrl || `/api/media/download?url=${encodeURIComponent(currentMedia.sourceUrl)}&mode=${selectedMode}&quality=${selectedVideoQuality.id}`,
                    videoId: currentMedia.videoId,
                    platform: currentMedia.platform,
                    title: currentMedia.title,
                    filename: lastCompletedFilename || `${currentMedia.title}.mp4`,
                    isAudio: selectedMode === 'audio_only',
                    qualityLabel: selectedMode === 'audio_only' ? selectedAudioQuality.label : selectedVideoQuality.label
                  });
                }}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-sm transition-all"
              >
                <Play className="w-4 h-4 fill-current text-blue-400" />
                <span>Play Online</span>
              </button>
            </div>

            {/* Progress Bar while downloading */}
            {isDownloading && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Streaming genuine video stream...</span>
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

            {/* Completion Box */}
            {lastCompletedBlobUrl && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-300 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-200">
                      Original video downloaded and saved to your computer!
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      File: {lastCompletedFilename}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setPlayerModal({
                        isOpen: true,
                        url: lastCompletedBlobUrl,
                        videoId: currentMedia.videoId,
                        platform: currentMedia.platform,
                        title: currentMedia.title,
                        filename: lastCompletedFilename,
                        isAudio: selectedMode === 'audio_only',
                        qualityLabel: selectedMode === 'audio_only' ? selectedAudioQuality.label : selectedVideoQuality.label
                      });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs shadow transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Video</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Persistent Browser Cache History Section */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                Download History (Saved in Browser Cache)
              </h2>
            </div>
            
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Clear download history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              <p>No downloads yet in browser cache. Paste a link above to start downloading!</p>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800/80 overflow-hidden shadow-lg">
              {history.map((item) => (
                <div key={item.id} className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:bg-slate-900/50 transition-colors">
                  
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-800 relative">
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-center font-mono text-slate-300 uppercase">
                        {item.mode === 'audio_only' ? 'MP3' : 'MP4'}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="font-medium text-white truncate max-w-md" title={item.title}>
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="text-blue-400 font-mono">{item.qualityLabel}</span>
                        <span>•</span>
                        <span>{(item.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                        <span>•</span>
                        <span className="text-slate-500">{item.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Play in Browser & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handlePlayMedia(item)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg font-medium transition-all"
                      title="Play media in browser"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </button>

                    <button
                      onClick={() => handleDeleteHistory(item.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extension Promo Banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-semibold text-sm text-white flex items-center gap-2">
              <Puzzle className="w-4 h-4 text-blue-400" />
              <span>Download videos directly from any tab in your browser</span>
            </div>
            <p className="text-xs text-slate-400">
              Install the companion extension for Microsoft Edge and Google Chrome to get a floating download button on any webpage.
            </p>
          </div>

          <button
            onClick={() => setIsExtensionModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all shrink-0"
          >
            Get Extension (.zip)
          </button>
        </div>

      </main>

      {/* In-Browser Media Player Modal */}
      <MediaPlayerModal
        mediaUrl={playerModal.url}
        videoId={playerModal.videoId}
        platform={playerModal.platform}
        title={playerModal.title}
        filename={playerModal.filename}
        isAudio={playerModal.isAudio}
        qualityLabel={playerModal.qualityLabel}
        onClose={() => setPlayerModal(prev => ({ ...prev, isOpen: false, url: null }))}
        onDownload={() => {
          if (playerModal.url) {
            const a = document.createElement('a');
            a.href = playerModal.url;
            a.download = playerModal.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }}
      />

      {/* Browser Extension Modal */}
      {isExtensionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-xs">
            
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

            <div className="p-5 space-y-4 text-slate-300">
              <p className="text-slate-400">
                You can sideload this extension in <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong> via Developer Mode:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <div className="font-semibold text-white">Download and Unzip the Extension</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Click the button below to download the ZIP file and extract it to a folder.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <div className="font-semibold text-white">Open Extensions in Edge or Chrome</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Visit <code className="text-blue-300">edge://extensions</code> or <code className="text-blue-300">chrome://extensions</code> and turn on <strong>Developer mode</strong>.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <div className="font-semibold text-white">Click "Load Unpacked"</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Select the extracted folder. A download button will appear on videos across all tabs!
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
                    <span>Packaging...</span>
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

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>Media Downloader • Stream and save original media</p>
      </footer>
    </div>
  );
}
