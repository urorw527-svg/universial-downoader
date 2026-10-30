import React, { useState } from 'react';
import { X, Layers, Search, Check, Download, Film, Music, Globe } from 'lucide-react';
import { DownloadMode } from '../types/idm';
import { SAMPLE_MEDIA_LIST } from '../data/sampleMedia';

interface IDMSiteGrabberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQueueItems: (items: any[]) => void;
}

export const IDMSiteGrabberModal: React.FC<IDMSiteGrabberModalProps> = ({
  isOpen,
  onClose,
  onQueueItems
}) => {
  const [siteUrl, setSiteUrl] = useState<string>('https://commondatastorage.googleapis.com');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [discoveredMedia, setDiscoveredMedia] = useState<any[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const results = [
        {
          name: 'BigBuckBunny_1080p_60fps.mp4',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          size: 158 * 1024 * 1024,
          type: 'video',
          resolution: '1080p'
        },
        {
          name: 'TearsOfSteel_SciFi_Cinema.mp4',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          size: 210 * 1024 * 1024,
          type: 'video',
          resolution: '1080p'
        },
        {
          name: 'Sintel_Animation_4K.mp4',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          size: 120 * 1024 * 1024,
          type: 'video',
          resolution: '720p'
        },
        {
          name: 'ElephantDream_Soundtrack.mp3',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          size: 14 * 1024 * 1024,
          type: 'music',
          resolution: 'Audio 320k'
        }
      ];
      setDiscoveredMedia(results);
      setSelectedIndices([0, 1, 2, 3]);
      setIsScanning(false);
    }, 800);
  };

  const handleQueueSelected = () => {
    const items = selectedIndices.map(idx => discoveredMedia[idx]);
    onQueueItems(items);
    onClose();
  };

  const toggleSelect = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter(i => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden font-sans text-xs select-none">
        
        {/* Title bar */}
        <div className="bg-slate-950 px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-sm">IDM Site Grabber (Batch Stream Sniffer)</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-slate-300">
          <p className="text-slate-400 text-xs">
            Scan any webpage or streaming catalog to crawl and extract all embedded video and audio streams simultaneously.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="Enter domain or webpage URL to crawl..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isScanning ? 'Scanning...' : 'Crawl Page'}</span>
            </button>
          </div>

          {/* Results list */}
          {discoveredMedia.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Discovered Streams ({discoveredMedia.length}):</span>
                <button
                  onClick={() => setSelectedIndices(discoveredMedia.map((_, i) => i))}
                  className="text-sky-400 hover:underline"
                >
                  Select All
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {discoveredMedia.map((m, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelect(idx)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-950/40 border-blue-500/50 text-slate-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-700 bg-slate-800 text-sky-500"
                        />
                        {m.type === 'video' ? <Film className="w-3.5 h-3.5 text-purple-400" /> : <Music className="w-3.5 h-3.5 text-emerald-400" />}
                        <span className="font-medium text-xs text-white">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                        <span>{m.resolution}</span>
                        <span>{(m.size / (1024 * 1024)).toFixed(1)} MB</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-slate-400 text-xs">
            Selected: <strong className="text-white">{selectedIndices.length}</strong> streams
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium">
              Cancel
            </button>
            <button
              onClick={handleQueueSelected}
              disabled={selectedIndices.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-semibold transition-all shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Selected</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
