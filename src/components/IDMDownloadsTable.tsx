import React from 'react';
import { 
  Play, 
  Pause, 
  Trash2, 
  ExternalLink, 
  Download, 
  Film, 
  Music, 
  Archive, 
  FileText, 
  Binary, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';
import { DownloadItem, DownloadCategory } from '../types/idm';

interface IDMDownloadsTableProps {
  downloads: DownloadItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onOpenDialog: (item: DownloadItem) => void;
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveToDisk: (item: DownloadItem) => void;
  onAddSample: () => void;
}

export const IDMDownloadsTable: React.FC<IDMDownloadsTableProps> = ({
  downloads,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onOpenDialog,
  onTogglePause,
  onDelete,
  onSaveToDisk,
  onAddSample
}) => {
  const getCategoryIcon = (cat: DownloadCategory) => {
    switch (cat) {
      case 'video': return <Film className="w-4 h-4 text-purple-400" />;
      case 'music': return <Music className="w-4 h-4 text-emerald-400" />;
      case 'compressed': return <Archive className="w-4 h-4 text-amber-400" />;
      case 'document': return <FileText className="w-4 h-4 text-blue-400" />;
      default: return <Binary className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatSpeed = (kbps: number) => {
    if (kbps > 1024) return `${(kbps / 1024).toFixed(2)} MB/s`;
    return `${Math.round(kbps)} KB/s`;
  };

  if (downloads.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner mb-4">
          <Download className="w-8 h-8 text-sky-400/80" />
        </div>
        <h3 className="text-base font-semibold text-white">No Downloads in Selected Category</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Click "Add URL" in the top toolbar to start downloading media, or test with ready-to-run sample streams.
        </p>
        <button
          onClick={onAddSample}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sample Media Stream</span>
        </button>
      </div>
    );
  }

  const allSelected = downloads.length > 0 && selectedIds.length === downloads.length;

  return (
    <div className="flex-1 overflow-auto bg-slate-950 font-sans text-xs select-none">
      <table className="w-full text-left border-collapse">
        {/* Table Header */}
        <thead className="bg-slate-900/90 sticky top-0 z-10 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
          <tr>
            <th className="p-2.5 w-8 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 cursor-pointer"
              />
            </th>
            <th className="p-2.5">File Name</th>
            <th className="p-2.5 w-24">Size</th>
            <th className="p-2.5 w-28">Status</th>
            <th className="p-2.5 w-44">Progress</th>
            <th className="p-2.5 w-24">Transfer Rate</th>
            <th className="p-2.5 w-24">Time Left</th>
            <th className="p-2.5 w-28">Added</th>
            <th className="p-2.5 w-28 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
          {downloads.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <tr
                key={item.id}
                onDoubleClick={() => onOpenDialog(item)}
                className={`transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/40 hover:bg-blue-950/60'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                {/* Checkbox */}
                <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                </td>

                {/* File Name */}
                <td className="p-2.5 max-w-xs truncate font-sans">
                  <div className="flex items-center gap-2 truncate">
                    <span className="shrink-0">{getCategoryIcon(item.category)}</span>
                    <span className="font-medium text-slate-200 truncate" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                </td>

                {/* File Size */}
                <td className="p-2.5 text-slate-400">
                  {formatBytes(item.totalSize)}
                </td>

                {/* Status */}
                <td className="p-2.5">
                  {item.status === 'downloading' && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Downloading
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Completed
                    </span>
                  )}
                  {item.status === 'paused' && (
                    <span className="inline-flex items-center gap-1 text-amber-400">
                      Paused
                    </span>
                  )}
                  {item.status === 'queued' && (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      Queued
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="inline-flex items-center gap-1 text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Error
                    </span>
                  )}
                </td>

                {/* Segmented Progress Bar */}
                <td className="p-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{item.progress}%</span>
                      <span>{formatBytes(item.downloadedBytes)}</span>
                    </div>
                    {/* IDM Green Striped Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-800 rounded-sm overflow-hidden p-0.5 border border-slate-700/60">
                      <div
                        className={`h-full rounded-sm transition-all duration-300 ${
                          item.status === 'completed'
                            ? 'bg-emerald-500'
                            : item.status === 'paused'
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 shadow-sm'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </td>

                {/* Transfer Rate */}
                <td className="p-2.5 text-slate-300">
                  {item.status === 'downloading' ? (
                    <span className="text-sky-300 font-bold">{formatSpeed(item.speedKbps)}</span>
                  ) : (
                    <span className="text-slate-600">--</span>
                  )}
                </td>

                {/* Time Left */}
                <td className="p-2.5 text-slate-400">
                  {item.status === 'downloading' ? (
                    item.timeLeftSeconds > 0 ? `${item.timeLeftSeconds}s` : 'Finishing'
                  ) : item.status === 'completed' ? (
                    <span className="text-emerald-400/80">Done</span>
                  ) : (
                    '--'
                  )}
                </td>

                {/* Date Added */}
                <td className="p-2.5 text-slate-500 text-[11px]">
                  {item.addedAt}
                </td>

                {/* Actions */}
                <td className="p-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onOpenDialog(item)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-sky-400 rounded"
                      title="Open IDM Download Dialog"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {item.status === 'downloading' ? (
                      <button
                        onClick={() => onTogglePause(item.id)}
                        className="p-1 hover:bg-slate-800 text-amber-400 rounded"
                        title="Pause Download"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : item.status === 'paused' ? (
                      <button
                        onClick={() => onTogglePause(item.id)}
                        className="p-1 hover:bg-slate-800 text-emerald-400 rounded"
                        title="Resume Download"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : null}

                    {item.status === 'completed' && (
                      <button
                        onClick={() => onSaveToDisk(item)}
                        className="p-1 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded"
                        title="Save / Download File to Local Disk"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded"
                      title="Delete Download Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
