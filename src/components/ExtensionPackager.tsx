import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Puzzle, 
  Download, 
  Copy, 
  Check, 
  FolderDown, 
  ExternalLink, 
  FileCode, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { EXTENSION_FILES } from '../data/projectData';

export const ExtensionPackager: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const selectedFile = EXTENSION_FILES[selectedFileIndex];

  const copyToClipboard = (text: string, filename: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const extFolder = zip.folder('idm-companion-extension');

      // Add all extension files to zip
      EXTENSION_FILES.forEach((f) => {
        extFolder?.file(f.name, f.content);
      });

      // Add an informative README.txt for the user
      extFolder?.file(
        'README-INSTALL.txt',
        `========================================================================
IDM MEDIA SNIFFER COMPANION EXTENSION (MANIFEST V3)
Private Sideloading Instructions for Microsoft Edge & Google Chrome
========================================================================

You do NOT need to upload this to Edge Add-ons Store or Chrome Web Store.
This extension is designed to run in Developer Mode across ALL tabs.

STEP-BY-STEP INSTRUCTIONS:
1. Unzip this folder to a permanent location (e.g. C:\\IDMMediaSuite\\extension).
2. In Microsoft Edge:
   - Type in the address bar: edge://extensions
   - Turn ON the "Developer mode" toggle in the bottom left sidebar.
   - Click the "Load unpacked" button at the top.
   - Select this unzipped folder!
3. In Google Chrome:
   - Type in the address bar: chrome://extensions
   - Turn ON the "Developer mode" toggle in the top-right corner.
   - Click "Load unpacked" on the top left.
   - Select this unzipped folder!

RESULT:
Open any tab (YouTube, Facebook, or any video site). The IDM "Download this video" 
button will now automatically appear on the video player in EVERY tab!
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'idm-companion-extension-unpacked.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to create extension zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header & Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Puzzle className="w-3.5 h-3.5" /> Manifest V3 Private Sideload Package
          </div>
          <h2 className="text-xl font-bold text-white">
            Unpacked Extension Builder (Every-Tab Injection)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            As requested, this companion extension runs locally in developer mode on <strong>every tab of Edge or Chrome</strong> without ever needing to be uploaded or published to the public Edge Add-ons Store or Chrome Web Store.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isZipping ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Packaging ZIP...</span>
              </>
            ) : (
              <>
                <FolderDown className="w-4 h-4" />
                <span>Export Extension ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>idm-companion-extension-unpacked.zip</strong> downloaded! Extract and click "Load unpacked" in <code className="text-white bg-emerald-900/40 px-1 py-0.5 rounded">edge://extensions</code>.
            </span>
          </div>
        </div>
      )}

      {/* Sideloading Step-by-Step Visual Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          How to Load in Edge / Chrome (No Public Store Required)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">1</div>
            <div className="font-semibold text-slate-200">Extract ZIP</div>
            <p className="text-slate-400">
              Unzip <code className="text-sky-300">idm-companion-extension-unpacked.zip</code> to a folder like <code className="text-slate-300">C:\IDMMediaSuite\extension</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">2</div>
            <div className="font-semibold text-slate-200">Open Extensions Page</div>
            <p className="text-slate-400">
              In Edge: open <code className="text-sky-300">edge://extensions</code>.<br />
              In Chrome: open <code className="text-sky-300">chrome://extensions</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">3</div>
            <div className="font-semibold text-slate-200">Enable Developer Mode</div>
            <p className="text-slate-400">
              Toggle the switch for <strong>Developer mode</strong> (bottom-left in Edge, top-right in Chrome).
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">4</div>
            <div className="font-semibold text-slate-200">Click "Load Unpacked"</div>
            <p className="text-slate-400">
              Select the unzipped folder. The extension immediately activates on <strong>every tab</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Code Browser for Extension Source Files */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* File tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {EXTENSION_FILES.map((file, idx) => (
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

          {/* Copy button */}
          <button
            onClick={() => copyToClipboard(selectedFile.content, selectedFile.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium transition-all"
          >
            {copiedFile === selectedFile.name ? (
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

        <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300">
          <span className="text-slate-500 font-mono">Role: </span>
          {selectedFile.description}
        </div>

        {/* Code View */}
        <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed bg-slate-950">
          <pre>{selectedFile.content}</pre>
        </div>
      </div>
    </div>
  );
};
