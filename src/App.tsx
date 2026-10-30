import React, { useState, useEffect, useRef } from 'react';
import { 
  DownloadCloud, 
  Puzzle, 
  Layers, 
  Zap, 
  Server, 
  ShieldCheck, 
  Terminal, 
  FileText,
  PlayCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { DownloadItem, DownloadStatus, DownloadCategory, DownloadMode } from './types/idm';
import { IDMToolbar } from './components/IDMToolbar';
import { IDMSidebar } from './components/IDMSidebar';
import { IDMDownloadsTable } from './components/IDMDownloadsTable';
import { IDMActiveDownloadModal } from './components/IDMActiveDownloadModal';
import { IDMAddUrlModal } from './components/IDMAddUrlModal';
import { IDMSettingsModal } from './components/IDMSettingsModal';
import { IDMSiteGrabberModal } from './components/IDMSiteGrabberModal';
import { ExtensionSimulator } from './components/ExtensionSimulator';
import { ExtensionPackager } from './components/ExtensionPackager';
import { SpecificationPlan } from './components/SpecificationPlan';
import { BackendCodeExplorer } from './components/BackendCodeExplorer';
import { SecurityValidator } from './components/SecurityValidator';
import { PowerShellWorkbench } from './components/PowerShellWorkbench';

type MainView = 
  | 'manager' 
  | 'extension-sim' 
  | 'extension-pack' 
  | 'plan' 
  | 'backend' 
  | 'security' 
  | 'powershell';

export default function App() {
  const [activeView, setActiveView] = useState<MainView>('manager');
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGrabberOpen, setIsGrabberOpen] = useState<boolean>(false);
  const [activeModalItem, setActiveModalItem] = useState<DownloadItem | null>(null);

  // Settings
  const [maxConnections, setMaxConnections] = useState<number>(8);
  const [downloadPath, setDownloadPath] = useState<string>('C:\\IDMMediaSuite\\downloads');
  const [speedLimit, setSpeedLimit] = useState<string>('unlimited');

  // Pre-populated initial downloads to provide an immediate active IDM experience
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: 'dl-1',
      name: 'BigBuckBunny_1080p_60fps.mp4',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      category: 'video',
      mode: 'both',
      quality: '1080p60 Full Mux',
      totalSize: 158 * 1024 * 1024,
      downloadedBytes: 74 * 1024 * 1024,
      speedKbps: 6450,
      status: 'downloading',
      progress: 47,
      timeLeftSeconds: 13,
      addedAt: 'Today, 14:22',
      chunks: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        startByte: i * 20000000,
        endByte: (i + 1) * 20000000 - 1,
        downloadedBytes: 9400000,
        speedKbps: 800 + (i * 20),
        isComplete: false,
        progress: 47
      }))
    },
    {
      id: 'dl-2',
      name: 'TearsOfSteel_Soundtrack_Master.mp3',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      category: 'music',
      mode: 'audio_only',
      quality: 'Audio MP3 320k',
      totalSize: 28 * 1024 * 1024,
      downloadedBytes: 28 * 1024 * 1024,
      speedKbps: 0,
      status: 'completed',
      progress: 100,
      timeLeftSeconds: 0,
      addedAt: 'Today, 14:15',
      completedAt: 'Today, 14:16',
      chunks: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        startByte: i * 3500000,
        endByte: (i + 1) * 3500000 - 1,
        downloadedBytes: 3500000,
        speedKbps: 0,
        isComplete: true,
        progress: 100
      }))
    },
    {
      id: 'dl-3',
      name: 'SciFi_Nature_Cinematic_Teaser.mp4',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'video',
      mode: 'video_only',
      quality: '1080p Visual Track',
      totalSize: 45 * 1024 * 1024,
      downloadedBytes: 12 * 1024 * 1024,
      speedKbps: 0,
      status: 'paused',
      progress: 26,
      timeLeftSeconds: 0,
      addedAt: 'Today, 13:50',
      chunks: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        startByte: i * 5625000,
        endByte: (i + 1) * 5625000 - 1,
        downloadedBytes: 1500000,
        speedKbps: 0,
        isComplete: false,
        progress: 26
      }))
    }
  ]);

  // Real-time segmented chunk simulation loop
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDownloads(prev => {
        let hasActive = false;
        const updated = prev.map(item => {
          if (item.status !== 'downloading') return item;
          hasActive = true;

          // Speed limit calculation
          let maxSpeedKb = 9000;
          if (speedLimit === '2') maxSpeedKb = 2000;
          else if (speedLimit === '5') maxSpeedKb = 5000;
          else if (speedLimit === '10') maxSpeedKb = 10000;

          const currentSpeed = Math.floor(maxSpeedKb * 0.75 + Math.random() * (maxSpeedKb * 0.25));
          const chunkSize = item.totalSize / item.chunks.length;
          let allFinished = true;
          let totalDownloaded = 0;

          const updatedChunks = item.chunks.map(chunk => {
            if (chunk.progress >= 100) {
              totalDownloaded += chunkSize;
              return { ...chunk, isComplete: true, speedKbps: 0, progress: 100 };
            }

            allFinished = false;
            const chunkSpeed = currentSpeed / item.chunks.length;
            const bytesAdded = chunkSpeed * 1024 * 0.3;
            const newDownloaded = Math.min(chunkSize, chunk.downloadedBytes + bytesAdded);
            const newProgress = Math.min(100, (newDownloaded / chunkSize) * 100);
            totalDownloaded += newDownloaded;

            return {
              ...chunk,
              downloadedBytes: newDownloaded,
              speedKbps: chunkSpeed,
              progress: newProgress,
              isComplete: newProgress >= 100
            };
          });

          const totalProg = Math.min(100, Math.round((totalDownloaded / item.totalSize) * 100));
          const remaining = item.totalSize - totalDownloaded;
          const timeLeft = currentSpeed > 0 ? Math.max(0, Math.ceil(remaining / (currentSpeed * 1024))) : 0;

          if (allFinished || totalProg >= 100) {
            return {
              ...item,
              downloadedBytes: item.totalSize,
              progress: 100,
              speedKbps: 0,
              timeLeftSeconds: 0,
              status: 'completed' as DownloadStatus,
              completedAt: 'Just now',
              chunks: updatedChunks
            };
          }

          return {
            ...item,
            downloadedBytes: Math.floor(totalDownloaded),
            progress: totalProg,
            speedKbps: currentSpeed,
            timeLeftSeconds: timeLeft,
            chunks: updatedChunks
          };
        });

        // Sync active modal item if it is open
        if (activeModalItem) {
          const fresh = updated.find(d => d.id === activeModalItem.id);
          if (fresh) setActiveModalItem(fresh);
        }

        return updated;
      });
    }, 300);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [speedLimit, activeModalItem]);

  // Download actions
  const handleStartNewDownload = (newItem: {
    url: string;
    name: string;
    mode: DownloadMode;
    quality: string;
    totalSize: number;
    category: 'video' | 'music' | 'other';
    thumbnail?: string;
  }) => {
    const chunkCount = maxConnections || 8;
    const chunkSize = newItem.totalSize / chunkCount;
    const chunks = Array.from({ length: chunkCount }, (_, i) => ({
      id: i + 1,
      startByte: Math.floor(i * chunkSize),
      endByte: Math.floor((i + 1) * chunkSize - 1),
      downloadedBytes: 0,
      speedKbps: 750,
      isComplete: false,
      progress: 0
    }));

    const downloadItem: DownloadItem = {
      id: 'dl-' + Date.now(),
      name: newItem.name,
      url: newItem.url,
      category: newItem.category,
      mode: newItem.mode,
      quality: newItem.quality,
      totalSize: newItem.totalSize,
      downloadedBytes: 0,
      speedKbps: 6000,
      status: 'downloading',
      progress: 0,
      timeLeftSeconds: Math.ceil(newItem.totalSize / (6000 * 1024)),
      addedAt: 'Just now',
      chunks: chunks,
      thumbnail: newItem.thumbnail
    };

    setDownloads(prev => [downloadItem, ...prev]);
    setActiveModalItem(downloadItem);
    setActiveView('manager');
  };

  const handleTogglePause = (id: string) => {
    setDownloads(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus: DownloadStatus = item.status === 'downloading' ? 'paused' : 'downloading';
        return {
          ...item,
          status: nextStatus,
          speedKbps: nextStatus === 'paused' ? 0 : 5000
        };
      }
      return item;
    }));
  };

  const handleResumeSelected = () => {
    setDownloads(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status: 'downloading' } : d));
  };

  const handlePauseSelected = () => {
    setDownloads(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status: 'paused', speedKbps: 0 } : d));
  };

  const handleStopAll = () => {
    setDownloads(prev => prev.map(d => ({ ...d, status: 'paused', speedKbps: 0 })));
  };

  const handleDeleteSelected = () => {
    setDownloads(prev => prev.filter(d => !selectedIds.includes(d.id)));
    setSelectedIds([]);
  };

  const handleDeleteSingle = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    if (activeModalItem?.id === id) setActiveModalItem(null);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredDownloads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDownloads.map(d => d.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Real browser file download trigger
  const handleSaveToDisk = (item: DownloadItem) => {
    if (item.url.startsWith('http') && item.url.includes('commondatastorage.googleapis.com')) {
      // Direct file link: open in new window or anchor download
      const a = document.createElement('a');
      a.href = item.url;
      a.download = item.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a local blob payload
      const dummyContent = `IDM Media Suite - Downloaded File: ${item.name}\nSource URL: ${item.url}\nQuality: ${item.quality}\nSize: ${item.totalSize} bytes\nStatus: 100% Completed via 8-part parallel Range chunking.`;
      const blob = new Blob([dummyContent], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Filtering
  const filteredDownloads = downloads.filter(d => {
    if (currentCategory === 'all') return true;
    if (currentCategory === 'downloading') return d.status === 'downloading';
    if (currentCategory === 'completed') return d.status === 'completed';
    if (currentCategory === 'paused') return d.status === 'paused';
    return d.category === currentCategory;
  });

  const counts = {
    all: downloads.length,
    downloading: downloads.filter(d => d.status === 'downloading').length,
    completed: downloads.filter(d => d.status === 'completed').length,
    paused: downloads.filter(d => d.status === 'paused').length,
    video: downloads.filter(d => d.category === 'video').length,
    music: downloads.filter(d => d.category === 'music').length,
    compressed: downloads.filter(d => d.category === 'compressed').length,
    document: downloads.filter(d => d.category === 'document').length,
    program: downloads.filter(d => d.category === 'program').length
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Application Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          
          {/* Logo & IDM Branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-sky-600 to-indigo-500 flex items-center justify-center shadow-md shadow-sky-500/20 border border-sky-400/30">
              <DownloadCloud className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-tight">Internet Download Manager</span>
                <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.2 rounded font-mono">
                  v6.42 Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                High-Speed Segmented Media Downloader & Companion Sideload Suite
              </p>
            </div>
          </div>

          {/* Top View Switcher Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveView('manager')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'manager'
                  ? 'bg-blue-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>IDM Manager</span>
              {counts.downloading > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveView('extension-pack')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeView === 'extension-pack'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Browser Extension</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                MV3
              </span>
            </button>

            <button
              onClick={() => setActiveView('extension-sim')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hidden md:flex ${
                activeView === 'extension-sim'
                  ? 'bg-sky-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>In-Tab Simulator</span>
            </button>

            <button
              onClick={() => setActiveView('plan')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hidden lg:flex ${
                activeView === 'plan'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Blueprint Spec</span>
            </button>

            <button
              onClick={() => setActiveView('backend')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hidden lg:flex ${
                activeView === 'backend'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>FastAPI</span>
            </button>

            <button
              onClick={() => setActiveView('security')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hidden xl:flex ${
                activeView === 'security'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SSRF Guard</span>
            </button>

            <button
              onClick={() => setActiveView('powershell')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hidden xl:flex ${
                activeView === 'powershell'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>PowerShell</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      {activeView === 'manager' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Classic IDM Top Action Toolbar */}
          <IDMToolbar
            onAddUrl={() => setIsAddModalOpen(true)}
            onResumeSelected={handleResumeSelected}
            onPauseSelected={handlePauseSelected}
            onStopAll={handleStopAll}
            onDeleteSelected={handleDeleteSelected}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenGrabber={() => setIsGrabberOpen(true)}
            onOpenExtension={() => setActiveView('extension-pack')}
            selectedCount={selectedIds.length}
            activeCount={counts.downloading}
            speedLimit={speedLimit}
            onSpeedLimitChange={setSpeedLimit}
          />

          {/* Split Pane: Sidebar & Downloads Grid */}
          <div className="flex-1 flex overflow-hidden">
            <IDMSidebar
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              counts={counts}
              onExportExtension={() => setActiveView('extension-pack')}
              onOpenSimulator={() => setActiveView('extension-sim')}
            />

            <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              <IDMDownloadsTable
                downloads={filteredDownloads}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onOpenDialog={(item) => setActiveModalItem(item)}
                onTogglePause={handleTogglePause}
                onDelete={handleDeleteSingle}
                onSaveToDisk={handleSaveToDisk}
                onAddSample={() => setIsAddModalOpen(true)}
              />
            </main>
          </div>
        </div>
      )}

      {/* Auxiliary Modules (Blueprint, Simulator, Extension Packager, Backend, Security, PowerShell) */}
      {activeView !== 'manager' && (
        <div className="flex-1 overflow-auto max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setActiveView('manager')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
            >
              ← Return to IDM Download Manager
            </button>
          </div>

          {activeView === 'extension-pack' && <ExtensionPackager />}
          {activeView === 'extension-sim' && (
            <ExtensionSimulator
              onSendToDownloader={(media) => {
                handleStartNewDownload({
                  url: media.url,
                  name: `${media.title.replace(/[^a-zA-Z0-9_\-]/g, '_')}.mp4`,
                  mode: media.mode as DownloadMode,
                  quality: '1080p Muxed',
                  totalSize: 45 * 1024 * 1024,
                  category: media.mode === 'audio_only' ? 'music' : 'video'
                });
              }}
            />
          )}
          {activeView === 'plan' && <SpecificationPlan />}
          {activeView === 'backend' && <BackendCodeExplorer />}
          {activeView === 'security' && <SecurityValidator />}
          {activeView === 'powershell' && <PowerShellWorkbench />}
        </div>
      )}

      {/* IDM Active Download Dialog Modal */}
      <IDMActiveDownloadModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onTogglePause={handleTogglePause}
        onSaveToDisk={handleSaveToDisk}
      />

      {/* Add URL Modal */}
      <IDMAddUrlModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStartDownload={handleStartNewDownload}
      />

      {/* Settings Modal */}
      <IDMSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        maxConnections={maxConnections}
        onMaxConnectionsChange={setMaxConnections}
        downloadPath={downloadPath}
        onDownloadPathChange={setDownloadPath}
      />

      {/* Site Grabber Modal */}
      <IDMSiteGrabberModal
        isOpen={isGrabberOpen}
        onClose={() => setIsGrabberOpen(false)}
        onQueueItems={(items) => {
          items.forEach(it => {
            handleStartNewDownload({
              url: it.url,
              name: it.name,
              mode: it.type === 'music' ? 'audio_only' : 'both',
              quality: it.resolution,
              totalSize: it.size,
              category: it.type === 'music' ? 'music' : 'video'
            });
          });
        }}
      />

      {/* Status Bar */}
      <footer className="h-6 bg-slate-900 border-t border-slate-800 px-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>Total: {downloads.length} items</span>
          <span>•</span>
          <span className="text-emerald-400">Downloading: {counts.downloading}</span>
          <span>•</span>
          <span>Finished: {counts.completed}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Max Streams: {maxConnections}</span>
          <span>•</span>
          <span className="text-sky-400">Vercel Ready</span>
        </div>
      </footer>
    </div>
  );
}
