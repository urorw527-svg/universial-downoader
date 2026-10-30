import React from 'react';
import { 
  X, 
  Minus, 
  Play, 
  Pause, 
  Download, 
  CheckCircle2, 
  FolderCheck, 
  ExternalLink,
  Layers,
  Activity,
  HardDrive
} from 'lucide-react';
import { DownloadItem } from '../types/idm';

interface IDMActiveDownloadModalProps {
  item: DownloadItem | null;
  onClose: () => void;
  onTogglePause: (id: string) => void;
  onSaveToDisk: (item: DownloadItem) => void;
}

export const IDMActiveDownloadModal: React.FC<IDMActiveDownloadModalProps> = ({
  item,
  onClose,
  onTogglePause,
  onSaveToDisk
}) => {
  if (!item) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatSpeed = (kbps: number) => {
    if (kbps > 1024) return `${(kbps / 1024).toFixed(2)} MB/s`;
    return `${Math.round(kbps)} KB/s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Classic IDM Dialog Window */}
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden select-none font-sans text-xs animate-in fade-in zoom-in-95 duration-150">
        
        {/* IDM Window Titlebar */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 px-3.5 py-2 flex items-center justify-between text-white border-b border-blue-700/50">
          <div className="flex items-center gap-2 truncate">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold">
              ⚡
            </span>
            <span className="font-semibold text-xs truncate">
              {item.status === 'completed' 
                ? `Completed: ${item.name}` 
                : `${item.progress}% of ${item.name}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 text-slate-300 hover:text-white rounded transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-600 text-slate-300 hover:text-white rounded transition-colors"
              title="Close Dialog"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-4 space-y-4 text-slate-300">
          
          {/* File details table */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2 text-[11px] font-mono">
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 w-28 shrink-0">Source URL:</span>
              <span className="text-slate-300 truncate max-w-md" title={item.url}>{item.url}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 w-28 shrink-0">Status:</span>
              <span className="font-semibold font-sans">
                {item.status === 'downloading' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Downloading ({item.chunks.filter(c => !c.isComplete).length} active connections)
                  </span>
                )}
                {item.status === 'completed' && <span className="text-emerald-300">Download Complete</span>}
                {item.status === 'paused' && <span className="text-amber-400">Paused</span>}
                {item.status === 'queued' && <span className="text-slate-400">Queued</span>}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 w-28 shrink-0">File Size:</span>
              <span className="text-slate-200">{formatBytes(item.totalSize)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 w-28 shrink-0">Downloaded:</span>
              <span className="text-slate-200">
                {formatBytes(item.downloadedBytes)} ({item.progress}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 w-28 shrink-0">Transfer Rate:</span>
              <span className="text-sky-400 font-bold">
                {item.status === 'downloading' ? formatSpeed(item.speedKbps) : '--'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 w-28 shrink-0">Time Left:</span>
              <span className="text-amber-400">
                {item.status === 'downloading' 
                  ? (item.timeLeftSeconds > 0 ? `${item.timeLeftSeconds} seconds` : 'Finishing...')
                  : item.status === 'completed' ? 'Finished' : '--'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 w-28 shrink-0">Resume Support:</span>
              <span className="text-emerald-400 font-bold">Yes (HTTP Range Supported)</span>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="font-semibold text-slate-200">{item.name}</span>
              <span className="text-emerald-400 font-bold">{item.progress}%</span>
            </div>
            <div className="w-full h-4 bg-slate-950 rounded border border-slate-700/80 p-0.5 overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-200 ${
                  item.status === 'completed'
                    ? 'bg-emerald-500'
                    : item.status === 'paused'
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500'
                }`}
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          </div>

          {/* THE FAMOUS IDM 8-SEGMENT CHUNK BAR */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Segment Connections (8 Concurrent Parts)</span>
              </span>
              <span className="text-sky-300">IDM Range Engine</span>
            </div>

            {/* 8-segment split bar */}
            <div className="grid grid-cols-8 gap-1 h-5 bg-slate-950 p-1 rounded border border-slate-800">
              {item.chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="bg-slate-900 rounded-xs overflow-hidden relative"
                  title={`Chunk ${chunk.id}: ${Math.round(chunk.progress)}% (${formatSpeed(chunk.speedKbps)})`}
                >
                  <div
                    className={`h-full transition-all duration-200 ${
                      chunk.isComplete
                        ? 'bg-emerald-500'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${chunk.progress}%` }}
                  ></div>
                </div>
              ))}
            </div>

            {/* Chunk telemetry text list */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono text-slate-400 pt-1">
              {item.chunks.map((c) => (
                <div key={c.id} className="bg-slate-950/70 p-1 rounded border border-slate-800 flex justify-between">
                  <span>P{c.id}: {Math.round(c.progress)}%</span>
                  <span className={c.isComplete ? 'text-emerald-400' : 'text-sky-400'}>
                    {c.isComplete ? 'Done' : `${Math.round(c.speedKbps)}k`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions Bar */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            {item.mode === 'both' ? 'Video + Audio' : item.mode === 'video_only' ? 'Video Only' : 'Audio Only'}
          </div>

          <div className="flex items-center gap-2">
            {item.status === 'downloading' ? (
              <button
                onClick={() => onTogglePause(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium shadow transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            ) : item.status === 'paused' ? (
              <button
                onClick={() => onTogglePause(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shadow transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            ) : null}

            {item.status === 'completed' && (
              <button
                onClick={() => onSaveToDisk(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shadow transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Disk</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
