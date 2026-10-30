import React, { useState } from 'react';
import { X, Download, Play, Film, Music, CheckCircle } from 'lucide-react';

interface MediaPlayerModalProps {
  mediaUrl: string | null;
  videoId?: string;
  platform?: string;
  title: string;
  filename: string;
  isAudio: boolean;
  qualityLabel: string;
  onClose: () => void;
  onDownload: () => void;
}

export const MediaPlayerModal: React.FC<MediaPlayerModalProps> = ({
  mediaUrl,
  videoId,
  platform,
  title,
  filename,
  isAudio,
  qualityLabel,
  onClose,
  onDownload
}) => {
  const [videoError, setVideoError] = useState(false);

  // If this is a YouTube video and the local blob or stream has trouble playing in this browser,
  // we embed the official YouTube player so the user can ALWAYS watch the authentic original video online!
  const isYouTube = platform === 'YouTube' || !!videoId;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden font-sans text-xs">
        
        {/* Title Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between text-white bg-slate-950">
          <div className="flex items-center gap-2 min-w-0">
            {isAudio ? <Music className="w-4 h-4 text-emerald-400" /> : <Film className="w-4 h-4 text-blue-400" />}
            <span className="font-semibold text-sm truncate max-w-sm" title={title}>{title}</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono shrink-0">
              {qualityLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Viewport */}
        <div className="p-4 bg-black flex items-center justify-center">
          {isAudio ? (
            <div className="py-12 px-6 flex flex-col items-center justify-center space-y-4 w-full">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                <Music className="w-8 h-8" />
              </div>
              <p className="text-white text-sm font-medium text-center">{title}</p>
              {mediaUrl && (
                <audio src={mediaUrl} controls autoPlay className="w-full max-w-md" />
              )}
            </div>
          ) : (
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center relative">
              {isYouTube && videoId ? (
                // YouTube high-definition embed player
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : mediaUrl && !videoError ? (
                <video
                  src={mediaUrl}
                  controls
                  autoPlay
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8 text-slate-400 space-y-2">
                  <Film className="w-10 h-10 text-slate-600 mx-auto" />
                  <p>Playing stream...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>Ready for full playback and direct download</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-all"
            >
              Close
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File to PC</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
