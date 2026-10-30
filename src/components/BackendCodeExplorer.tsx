import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Server, 
  Terminal, 
  FolderTree, 
  Cpu, 
  Layers,
  ShieldCheck
} from 'lucide-react';
import { BACKEND_FILES, TEST_FILES, PROJECT_STRUCTURE } from '../data/projectData';

export const BackendCodeExplorer: React.FC = () => {
  const allBackendFiles = [...BACKEND_FILES, ...TEST_FILES];
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [showTree, setShowTree] = useState<boolean>(false);

  const activeFile = allBackendFiles[selectedFileIndex];

  const handleCopy = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sky-500/20 text-sky-400">
              <Server className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">FastAPI & FFmpeg Backend Engine Sources</h2>
          </div>
          <p className="text-xs text-slate-400">
            High-performance asynchronous server with yt-dlp metadata extraction, 8-channel Range chunking, and Pytest coverage.
          </p>
        </div>

        <button
          onClick={() => setShowTree(!showTree)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
        >
          <FolderTree className="w-4 h-4 text-sky-400" />
          <span>{showTree ? 'Hide Tree' : 'View Project Tree'}</span>
        </button>
      </div>

      {/* Project Structure Tree Drawer */}
      {showTree && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 overflow-x-auto">
          <div className="text-sky-400 font-semibold mb-2">COMPLETE PROJECT STRUCTURE:</div>
          <pre>{PROJECT_STRUCTURE}</pre>
        </div>
      )}

      {/* Code Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {allBackendFiles.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setSelectedFileIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  selectedFileIndex === idx
                    ? 'bg-slate-800 text-sky-400 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopy(activeFile.content, activeFile.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium transition-all"
          >
            {copiedFile === activeFile.name ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-mono">File: </span>
            <span className="text-sky-400 font-mono">{activeFile.path}</span>
            <span className="text-slate-500 mx-2">•</span>
            <span>{activeFile.description}</span>
          </div>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
            {activeFile.language}
          </span>
        </div>

        <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto max-h-[550px] leading-relaxed bg-slate-950">
          <pre>{activeFile.content}</pre>
        </div>
      </div>
    </div>
  );
};
