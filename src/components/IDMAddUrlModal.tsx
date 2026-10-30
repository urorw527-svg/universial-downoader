import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Film, 
  Music, 
  Check, 
  Sparkles, 
  Layers, 
  Clock, 
  HardDrive,
  Globe,
  Plus
} from 'lucide-react';
import { MediaMetadata, DownloadMode } from '../types/idm';
import { SAMPLE_MEDIA_LIST, parseMediaUrl } from '../data/sampleMedia';

interface IDMAddUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDownload: (item: {
    url: string;
    name: string;
    mode: DownloadMode;
    quality: string;
    totalSize: number;
    category: 'video' | 'music' | 'other';
    thumbnail?: string;
  }) => void;
}

export const IDMAddUrlModal: React.FC<IDMAddUrlModalProps> = ({
  isOpen,
  onClose,
  onStartDownload
}) => {
  const [inputUrl, setInputUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [metadata, setMetadata] = useState<MediaMetadata>(SAMPLE_MEDIA_LIST[0]);
  const [selectedMode, setSelectedMode] = useState<DownloadMode>('both');
  const [selectedFormatId, setSelectedFormatId] = useState<string>('1080p-full');

  useEffect(() => {
    if (inputUrl) {
      const parsed = parseMediaUrl(inputUrl);
      setMetadata(parsed);
      const defaultFmt = parsed.formats.find(f => f.mode === selectedMode) || parsed.formats[0];
      if (defaultFmt) setSelectedFormatId(defaultFmt.id);
    }
  }, [inputUrl]);

  useEffect(() => {
    const matchingFmt = metadata.formats.find(f => f.mode === selectedMode);
    if (matchingFmt) {
      setSelectedFormatId(matchingFmt.id);
    }
  }, [selectedMode, metadata]);

  if (!isOpen) return null;

  const currentFormat = metadata.formats.find(f => f.id === selectedFormatId) || metadata.formats[0];

  const handleStart = () => {
    const ext = currentFormat?.ext || (selectedMode === 'audio_only' ? 'mp3' : 'mp4');
    const safeTitle = metadata.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'media';
    const fileName = `${safeTitle}.${ext}`;

    onStartDownload({
      url: metadata.url,
      name: fileName,
      mode: selectedMode,
      quality: currentFormat?.label || '1080p',
      totalSize: currentFormat?.sizeBytes || 50 * 1024 * 1024,
      category: selectedMode === 'audio_only' ? 'music' : 'video',
      thumbnail: metadata.thumbnail
    });
    onClose();
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '-- MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden select-none font-sans text-xs animate-in fade-in zoom-in-95 duration-150">
        
        {/* Title bar */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 px-4 py-3 flex items-center justify-between text-white border-b border-blue-700/50">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-600">
              <Download className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="font-semibold text-sm">Enter Media URL to Download</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-5 space-y-5 text-slate-300">
          
          {/* URL Input Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Media Stream or Page Address (URL):</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste YouTube, Facebook, Vimeo, or direct video/audio URL..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setInputUrl(text);
                  } catch {}
                }}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all shrink-0"
              >
                Paste
              </button>
            </div>
          </div>

          {/* Quick Sample Presets */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Or Choose a Verified Public Sample Stream:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_MEDIA_LIST.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputUrl(sample.url);
                    setMetadata(sample);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    inputUrl === sample.url
                      ? 'bg-blue-600/20 border-blue-500 text-sky-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-[11px] truncate">{sample.title.split('(')[0]}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{sample.platform} • {sample.duration}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Extracted Metadata Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-44 aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black shrink-0 relative group">
              <img
                src={metadata.thumbnail}
                alt={metadata.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[9px] px-1 py-0.5 rounded">
                {metadata.duration}
              </span>
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-mono uppercase">
                  {metadata.platform}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {metadata.duration} duration
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white truncate" title={metadata.title}>
                {metadata.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate font-mono">
                {metadata.url}
              </p>
            </div>
          </div>

          {/* Three Distinct Download Modes (Requested) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200">Select Download Mode:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => setSelectedMode('both')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedMode === 'both'
                    ? 'bg-blue-600/20 border-blue-500 text-sky-200 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">🎬 Video + Audio</span>
                  {selectedMode === 'both' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Full 1080p/4K muxed container with crisp multichannel audio.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('video_only')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedMode === 'video_only'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">📹 Video Only</span>
                  {selectedMode === 'video_only' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Visual track only. High FPS, no sound, lower filesize.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('audio_only')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedMode === 'audio_only'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">🎵 Audio Only</span>
                  {selectedMode === 'audio_only' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  MP3 / M4A extract with automatic ID3 metadata tags.
                </p>
              </button>
            </div>
          </div>

          {/* Quality Formats Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Available Quality Stream:</label>
            <div className="space-y-1.5">
              {metadata.formats
                .filter(f => f.mode === selectedMode)
                .map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormatId(fmt.id)}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      selectedFormatId === fmt.id
                        ? 'bg-slate-800 border-sky-500 text-sky-200 font-semibold'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center">
                        {selectedFormatId === fmt.id && <span className="w-2 h-2 rounded-full bg-sky-400"></span>}
                      </span>
                      <span>{fmt.label}</span>
                      {fmt.fps && <span className="text-[10px] text-slate-500 font-mono">{fmt.fps} fps</span>}
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {formatBytes(fmt.sizeBytes)}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-slate-400 text-xs">
            Estimated Size: <strong className="text-white">{formatBytes(currentFormat?.sizeBytes || 0)}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 active:scale-95 text-white rounded-lg font-semibold shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Start Download Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
