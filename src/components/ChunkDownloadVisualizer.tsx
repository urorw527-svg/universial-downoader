import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  DownloadCloud, 
  CheckCircle2, 
  FileCheck, 
  Zap, 
  Activity, 
  Clock, 
  HardDrive,
  Cpu,
  Layers
} from 'lucide-react';

interface Chunk {
  id: number;
  progress: number; // 0 to 100
  speedKbps: number;
  startByte: number;
  endByte: number;
  downloadedBytes: number;
  isComplete: boolean;
}

export const ChunkDownloadVisualizer: React.FC<{ initialPayload?: any }> = ({ initialPayload }) => {
  const [downloadMode, setDownloadMode] = useState<'both' | 'video_only' | 'audio_only'>(
    (initialPayload?.mode as any) || 'both'
  );
  const [targetTitle, setTargetTitle] = useState<string>(
    initialPayload?.title || '4K Cinematic Landscape Showcase'
  );
  const [targetUrl, setTargetUrl] = useState<string>(
    initialPayload?.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  );
  
  const totalSizeBytes = downloadMode === 'audio_only' ? 8 * 1024 * 1024 : 64 * 1024 * 1024;
  const chunkSizeBytes = Math.floor(totalSizeBytes / 8);

  const [status, setStatus] = useState<'idle' | 'downloading' | 'paused' | 'muxing' | 'completed'>('idle');
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [currentSpeedKbps, setCurrentSpeedKbps] = useState<number>(0);
  const [etaSeconds, setEtaSeconds] = useState<number>(0);

  const [chunks, setChunks] = useState<Chunk[]>(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      progress: 0,
      speedKbps: 0,
      startByte: i * chunkSizeBytes,
      endByte: (i + 1) * chunkSizeBytes - 1,
      downloadedBytes: 0,
      isComplete: false
    }));
  });

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (initialPayload?.url) {
      setTargetUrl(initialPayload.url);
      if (initialPayload.title) setTargetTitle(initialPayload.title);
      if (initialPayload.mode) setDownloadMode(initialPayload.mode);
      resetDownload();
    }
  }, [initialPayload]);

  useEffect(() => {
    if (status === 'downloading') {
      timerRef.current = setInterval(() => {
        setChunks(prevChunks => {
          let allFinished = true;
          let totalDownloaded = 0;
          let totalSpeed = 0;

          const updated = prevChunks.map(chunk => {
            if (chunk.progress >= 100) {
              return { ...chunk, isComplete: true, speedKbps: 0 };
            }

            allFinished = false;
            // Realistic randomized speed fluctuations per chunk
            const chunkSpeed = 450 + Math.floor(Math.random() * 350);
            totalSpeed += chunkSpeed;

            const increment = (chunkSpeed * 1024 * 0.25) / chunkSizeBytes * 100;
            const newProgress = Math.min(100, chunk.progress + increment);
            const downloaded = Math.floor((newProgress / 100) * chunkSizeBytes);
            totalDownloaded += downloaded;

            return {
              ...chunk,
              progress: newProgress,
              speedKbps: chunkSpeed,
              downloadedBytes: downloaded,
              isComplete: newProgress >= 100
            };
          });

          const overall = Math.min(100, Math.round((totalDownloaded / totalSizeBytes) * 100));
          setOverallProgress(overall);
          setCurrentSpeedKbps(totalSpeed);

          if (totalSpeed > 0) {
            const remainingBytes = totalSizeBytes - totalDownloaded;
            const estSeconds = Math.max(0, Math.ceil(remainingBytes / (totalSpeed * 1024)));
            setEtaSeconds(estSeconds);
          }

          if (allFinished) {
            clearInterval(timerRef.current);
            setStatus('muxing');
            setTimeout(() => {
              setStatus('completed');
              setCurrentSpeedKbps(0);
              setEtaSeconds(0);
            }, 1800);
          }

          return updated;
        });
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, totalSizeBytes, chunkSizeBytes]);

  const startDownload = () => setStatus('downloading');
  const pauseDownload = () => setStatus('paused');
  const resetDownload = () => {
    setStatus('idle');
    setOverallProgress(0);
    setCurrentSpeedKbps(0);
    setEtaSeconds(0);
    setChunks(
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        progress: 0,
        speedKbps: 0,
        startByte: i * chunkSizeBytes,
        endByte: (i + 1) * chunkSizeBytes - 1,
        downloadedBytes: 0,
        isComplete: false
      }))
    );
  };

  const formatMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);
  const formatSpeed = (kbps: number) => {
    if (kbps > 1024) return `${(kbps / 1024).toFixed(2)} MB/s`;
    return `${Math.round(kbps)} KB/s`;
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sky-500/20 text-sky-400">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">IDM 8-Segment Parallel Chunk Engine</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time simulation of IDM's multi-connection HTTP Range requests, dynamic buffering, and FFmpeg remuxing pipeline.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          {status === 'downloading' ? (
            <button
              onClick={pauseDownload}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={startDownload}
              disabled={status === 'completed'}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{status === 'paused' ? 'Resume' : 'Start Download'}</span>
            </button>
          )}

          <button
            onClick={resetDownload}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Target Media Info & Mode Selection */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Target Media Stream</label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs">
              <span className="text-sky-400 font-mono">Stream:</span>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Selected Mode</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => { setDownloadMode('both'); resetDownload(); }}
                className={`py-1 rounded text-center font-medium transition-all ${
                  downloadMode === 'both' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Muxed
              </button>
              <button
                onClick={() => { setDownloadMode('video_only'); resetDownload(); }}
                className={`py-1 rounded text-center font-medium transition-all ${
                  downloadMode === 'video_only' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Video Only
              </button>
              <button
                onClick={() => { setDownloadMode('audio_only'); resetDownload(); }}
                className={`py-1 rounded text-center font-medium transition-all ${
                  downloadMode === 'audio_only' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Audio Only
              </button>
            </div>
          </div>
        </div>

        {/* Global Progress & Telemetry Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" /> Transfer Speed
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {formatSpeed(currentSpeedKbps)}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Estimated ETA
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {etaSeconds > 0 ? `${etaSeconds}s remaining` : status === 'completed' ? 'Done' : '--'}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Transferred
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {formatMb((overallProgress / 100) * totalSizeBytes)} / {formatMb(totalSizeBytes)} MB
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Pipeline State
            </div>
            <div className="text-base font-bold text-white font-mono mt-1 capitalize">
              {status === 'muxing' ? (
                <span className="text-purple-400 animate-pulse">FFmpeg Muxing</span>
              ) : status === 'completed' ? (
                <span className="text-emerald-400">Completed</span>
              ) : (
                status
              )}
            </div>
          </div>
        </div>

        {/* Master Overall Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold">{targetTitle}</span>
            <span className="text-sky-400 font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                status === 'muxing'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse'
                  : status === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-sky-400'
              }`}
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 8-SEGMENT IDM CHUNK VISUALIZER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            Active HTTP Range Segment Connections (8 Workers)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            8 x {(chunkSizeBytes / (1024 * 1024)).toFixed(2)} MB Partitions
          </span>
        </div>

        <div className="space-y-3">
          {chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs"
            >
              {/* Chunk Badge */}
              <div className="flex items-center gap-2 w-28 shrink-0">
                <span className="w-5 h-5 rounded bg-slate-800 text-sky-400 font-mono font-bold flex items-center justify-center text-[10px]">
                  #{chunk.id}
                </span>
                <span className="text-slate-300 font-medium font-mono text-[11px]">
                  Part {chunk.id}
                </span>
              </div>

              {/* Progress Bar & Range Header */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span className="truncate">Range: bytes={chunk.startByte}-{chunk.endByte}</span>
                  <span className="text-sky-300 font-bold">{Math.round(chunk.progress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      chunk.isComplete
                        ? 'bg-emerald-500'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${chunk.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Individual Chunk Speed */}
              <div className="w-24 shrink-0 text-right font-mono text-[11px]">
                {chunk.isComplete ? (
                  <span className="text-emerald-400 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </span>
                ) : (
                  <span className="text-slate-300">{formatSpeed(chunk.speedKbps)}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FFmpeg Muxing Notification */}
        {status === 'muxing' && (
          <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl flex items-center gap-3 text-xs text-purple-300 animate-pulse">
            <Cpu className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="font-semibold text-purple-200">FFmpeg Post-Processing Phase in Progress:</div>
              <div className="font-mono text-[11px] text-purple-300/90 mt-0.5">
                ffmpeg -y -i chunk_video_stream.mp4 -i chunk_audio_stream.m4a -c copy "{targetTitle}.mp4"
              </div>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-emerald-200">Download & FFmpeg Multiplexing Succeeded!</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Saved locally to <code className="text-slate-200 font-mono">%USERPROFILE%\IDMMediaSuite\downloads</code>
                </div>
              </div>
            </div>
            <button
              onClick={resetDownload}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
            >
              New Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
