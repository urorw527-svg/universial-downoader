import React, { useState } from 'react';
import { X, Settings, Cpu, HardDrive, Check, RotateCcw } from 'lucide-react';

interface IDMSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxConnections: number;
  onMaxConnectionsChange: (num: number) => void;
  downloadPath: string;
  onDownloadPathChange: (path: string) => void;
}

export const IDMSettingsModal: React.FC<IDMSettingsModalProps> = ({
  isOpen,
  onClose,
  maxConnections,
  onMaxConnectionsChange,
  downloadPath,
  onDownloadPathChange
}) => {
  const [connections, setConnections] = useState<number>(maxConnections);
  const [path, setPath] = useState<string>(downloadPath);
  const [autoStart, setAutoStart] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onMaxConnectionsChange(connections);
    onDownloadPathChange(path);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden font-sans text-xs select-none">
        
        {/* Title bar */}
        <div className="bg-slate-950 px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-sm">IDM Configuration & Connection Settings</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-slate-300">
          
          {/* Max Parallel Segment Connections */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Default Max Concurrent Connections per File:</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 8, 16, 32].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setConnections(num)}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    connections === num
                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-sm font-mono">{num}</div>
                  <div className="text-[10px] opacity-80">Streams</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              IDM standard is 8 connections for optimal TCP bandwidth without triggering host rate-limits.
            </p>
          </div>

          {/* Download Path */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Default Save Directory:</span>
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Behavior Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0"
              />
              <span className="text-slate-300">Automatically open download dialog upon stream capture</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition-all shadow"
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            <span>{saved ? 'Saved!' : 'Apply Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
