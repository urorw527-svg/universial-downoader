import React from 'react';
import { 
  Plus, 
  Play, 
  Square, 
  Trash2, 
  Settings, 
  Layers, 
  Puzzle, 
  Gauge, 
  FolderDown, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface IDMToolbarProps {
  onAddUrl: () => void;
  onResumeSelected: () => void;
  onPauseSelected: () => void;
  onStopAll: () => void;
  onDeleteSelected: () => void;
  onOpenSettings: () => void;
  onOpenGrabber: () => void;
  onOpenExtension: () => void;
  selectedCount: number;
  activeCount: number;
  speedLimit: string;
  onSpeedLimitChange: (limit: string) => void;
}

export const IDMToolbar: React.FC<IDMToolbarProps> = ({
  onAddUrl,
  onResumeSelected,
  onPauseSelected,
  onStopAll,
  onDeleteSelected,
  onOpenSettings,
  onOpenGrabber,
  onOpenExtension,
  selectedCount,
  activeCount,
  speedLimit,
  onSpeedLimitChange
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md select-none">
      {/* Primary IDM Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
        <button
          onClick={onAddUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-95 text-white rounded text-xs font-semibold shadow-sm transition-all border border-blue-500"
          title="Add new media download URL"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add URL</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block"></div>

        <button
          onClick={onResumeSelected}
          disabled={selectedCount === 0}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 text-slate-200 rounded text-xs font-medium transition-all border border-slate-700"
          title="Resume selected download(s)"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
          <span className="hidden sm:inline">Resume</span>
        </button>

        <button
          onClick={onPauseSelected}
          disabled={selectedCount === 0}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 text-slate-200 rounded text-xs font-medium transition-all border border-slate-700"
          title="Stop / Pause selected download(s)"
        >
          <Square className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span className="hidden sm:inline">Stop</span>
        </button>

        <button
          onClick={onStopAll}
          disabled={activeCount === 0}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 text-slate-200 rounded text-xs font-medium transition-all border border-slate-700"
          title="Stop all active downloads"
        >
          <Square className="w-3.5 h-3.5 text-red-400" />
          <span>Stop All</span>
        </button>

        <button
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 text-slate-200 rounded text-xs font-medium transition-all border border-slate-700"
          title="Delete selected item(s)"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden md:inline">Delete</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block"></div>

        <button
          onClick={onOpenGrabber}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded text-xs font-medium transition-all border border-slate-700"
          title="IDM Site Grabber (Batch media extractor)"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Grabber</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded text-xs font-medium transition-all border border-slate-700"
          title="IDM Options & Connections Config"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Options</span>
        </button>
      </div>

      {/* Right Controls: Speed Limiter & Companion Extension */}
      <div className="flex items-center gap-2">
        {/* Speed limiter selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-xs">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] text-slate-400 hidden lg:inline">Speed:</span>
          <select
            value={speedLimit}
            onChange={(e) => onSpeedLimitChange(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="unlimited" className="bg-slate-900 text-slate-200">Unlimited</option>
            <option value="10" className="bg-slate-900 text-slate-200">10 MB/s</option>
            <option value="5" className="bg-slate-900 text-slate-200">5 MB/s</option>
            <option value="2" className="bg-slate-900 text-slate-200">2 MB/s</option>
          </select>
        </div>

        {/* Companion Extension Quick Action */}
        <button
          onClick={onOpenExtension}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded text-xs font-semibold transition-all"
          title="Edge & Chrome Companion Extension Sideloading (Every-Tab Injection)"
        >
          <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Browser Extension</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
        </button>
      </div>
    </div>
  );
};
