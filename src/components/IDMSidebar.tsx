import React from 'react';
import { 
  Download, 
  CheckCircle2, 
  PauseCircle, 
  Film, 
  Music, 
  Archive, 
  FileText, 
  Binary, 
  Layers, 
  Folder, 
  Puzzle, 
  ExternalLink,
  FolderDown,
  Check
} from 'lucide-react';
import { DownloadCategory, DownloadStatus } from '../types/idm';

interface IDMSidebarProps {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  counts: {
    all: number;
    downloading: number;
    completed: number;
    paused: number;
    video: number;
    music: number;
    compressed: number;
    document: number;
    program: number;
  };
  onExportExtension: () => void;
  onOpenSimulator: () => void;
}

export const IDMSidebar: React.FC<IDMSidebarProps> = ({
  currentCategory,
  onSelectCategory,
  counts,
  onExportExtension,
  onOpenSimulator
}) => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 p-3.5 flex flex-col justify-between select-none shrink-0 h-full overflow-y-auto">
      <div className="space-y-5">
        {/* Main Status Categories */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
            <Folder className="w-3 h-3 text-sky-400" /> Categories
          </div>

          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
              currentCategory === 'all'
                ? 'bg-blue-600/20 text-sky-300 font-semibold border border-blue-500/30'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>All Downloads</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{counts.all}</span>
          </button>

          <button
            onClick={() => onSelectCategory('downloading')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
              currentCategory === 'downloading'
                ? 'bg-blue-600/20 text-sky-300 font-semibold border border-blue-500/30'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Downloading</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">{counts.downloading}</span>
          </button>

          <button
            onClick={() => onSelectCategory('completed')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
              currentCategory === 'completed'
                ? 'bg-blue-600/20 text-sky-300 font-semibold border border-blue-500/30'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Finished</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{counts.completed}</span>
          </button>

          <button
            onClick={() => onSelectCategory('paused')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
              currentCategory === 'paused'
                ? 'bg-blue-600/20 text-sky-300 font-semibold border border-blue-500/30'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Unfinished / Paused</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{counts.paused}</span>
          </button>
        </div>

        {/* Media Types Filter */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1.5">
            Media Types
          </div>

          <button
            onClick={() => onSelectCategory('video')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
              currentCategory === 'video'
                ? 'bg-blue-600/20 text-sky-300 font-semibold border border-blue-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>Video (MP4 / MKV)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{counts.video}</span>
          </button>

          <button
            onClick={() => onSelectCategory('music')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
              currentCategory === 'music'
                ? 'bg-blue-600/20 text-sky-300 font-semibold border border-blue-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>Music / Audio (MP3)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{counts.music}</span>
          </button>

          <button
            onClick={() => onSelectCategory('compressed')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
              currentCategory === 'compressed'
                ? 'bg-blue-600/20 text-sky-300 font-semibold border border-blue-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>Compressed (ZIP/RAR)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{counts.compressed}</span>
          </button>

          <button
            onClick={() => onSelectCategory('document')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
              currentCategory === 'document'
                ? 'bg-blue-600/20 text-sky-300 font-semibold border border-blue-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Documents</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">{counts.document}</span>
          </button>
        </div>

        {/* Queues */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1.5">
            Download Queues
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Main Download Queue</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Ready</span>
          </div>
        </div>
      </div>

      {/* Companion Extension Sideload Widget */}
      <div className="p-3 bg-gradient-to-b from-indigo-950/40 to-slate-900/80 rounded-lg border border-indigo-500/30 space-y-2.5 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">IDM Extension</span>
          </div>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
            Every Tab
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Sideload into Microsoft Edge or Chrome via Developer Mode without store submission.
        </p>

        <div className="flex flex-col gap-1.5 pt-1">
          <button
            onClick={onExportExtension}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded text-xs font-medium shadow transition-all"
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>Export Extension ZIP</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="w-full text-center py-1 text-[11px] text-sky-400 hover:text-sky-300 hover:underline"
          >
            Test In-Tab Floating Bar →
          </button>
        </div>
      </div>
    </aside>
  );
};
