import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Settings, 
  FolderCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode,
  Sparkles
} from 'lucide-react';
import { POWERSHELL_FILES } from '../data/projectData';

export const PowerShellWorkbench: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [installPath, setInstallPath] = useState<string>('$env:USERPROFILE\\IDMMediaSuite');
  const [backendPort, setBackendPort] = useState<number>(8000);
  const [autoOpenFolder, setAutoOpenFolder] = useState<boolean>(true);

  const baseScript = POWERSHELL_FILES[0].content;

  const customizedScript = baseScript
    .replace('$InstallDir = "$env:USERPROFILE\\\\IDMMediaSuite"', `$InstallDir = "${installPath}"`)
    .replace('[int]$BackendPort = 8000', `[int]$BackendPort = ${backendPort}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(customizedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([customizedScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'setup-idm-suite.ps1';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sky-500/20 text-sky-400">
              <Terminal className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">Windows Automated PowerShell Setup Script</h2>
          </div>
          <p className="text-xs text-slate-400">
            One-shot automated environment configuration for Windows 10/11. Installs Python, FFmpeg via winget, venv, and preps the unpacked extension.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied Script!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Script</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadScript}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download .ps1</span>
          </button>
        </div>
      </div>

      {/* Script Configuration Toggles */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Settings className="w-4 h-4 text-sky-400" />
          Customize Script Parameters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Installation Target Path:</label>
            <input
              type="text"
              value={installPath}
              onChange={(e) => setInstallPath(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">FastAPI Backend Port:</label>
            <input
              type="number"
              value={backendPort}
              onChange={(e) => setBackendPort(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Execution Instructions */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="font-semibold text-white text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          How to Run in Windows PowerShell:
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-sky-300 space-y-1">
          <div className="text-slate-500"># 1. Open PowerShell as Administrator or standard user</div>
          <div className="text-slate-500"># 2. Allow execution for the current process:</div>
          <div>Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</div>
          <div className="text-slate-500 pt-1"># 3. Execute the setup script:</div>
          <div>.\setup-idm-suite.ps1</div>
        </div>
      </div>

      {/* Script Source Code Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>scripts/setup-idm-suite.ps1</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">PowerShell 5.1 / 7+</span>
        </div>
        <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed bg-slate-950">
          <pre>{customizedScript}</pre>
        </div>
      </div>
    </div>
  );
};
