import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Terminal, 
  Puzzle, 
  Server, 
  Monitor, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ChevronRight,
  ExternalLink,
  Cpu,
  FileCode,
  Zap,
  Globe,
  HardDrive
} from 'lucide-react';

export const SpecificationPlan: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'intro', label: '1. Executive Summary & Goals', icon: Layers },
    { id: 'architecture', label: '2. System Architecture & Flow', icon: Cpu },
    { id: 'features', label: '3. Core Requirements & Modes', icon: Zap },
    { id: 'frontend', label: '4. Web App (React & Vite)', icon: Monitor },
    { id: 'backend', label: '5. FastAPI & FFmpeg Engine', icon: Server },
    { id: 'extension', label: '6. MV3 Companion Extension', icon: Puzzle },
    { id: 'security', label: '7. Security, SSRF & Compliance', icon: ShieldCheck },
    { id: 'windows', label: '8. Windows & PowerShell Setup', icon: Terminal },
    { id: 'testing', label: '9. Testing & Quality Assurance', icon: FileCode },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sticky Sidebar Navigation */}
      <div className="lg:col-span-3">
        <div className="sticky top-6 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Blueprint Navigation
          </div>
          <nav className="space-y-1">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Target Standard:</span>
              <span className="text-emerald-400 font-mono">IDM Parity</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Extension Spec:</span>
              <span className="text-indigo-400 font-mono">Chrome / Edge MV3</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Model:</span>
              <span className="text-amber-400 font-mono">Unpacked Side-load</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-8">
        {/* Section 1: Executive Summary */}
        {activeSection === 'intro' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                Phase 1 • Blueprint Specifications
              </span>
              <h2 className="text-2xl font-bold text-white mt-3">
                1. Executive Summary & Project Objectives
              </h2>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                This project plan specifies the end-to-end design, implementation, and deployment of a modern, high-throughput media downloader suite inspired by Internet Download Manager (IDM). The suite combines an ultra-fast local backend engine, an interactive web dashboard, and a Manifest V3 browser companion extension designed for seamless, private developer-mode sideloading across all browser tabs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-sky-400 text-xs font-semibold uppercase">Zero Web Store Lock-in</div>
                <div className="text-sm font-medium text-slate-200 mt-1">Unpacked Sideloading</div>
                <p className="text-xs text-slate-400 mt-1">
                  Engineered specifically for local loading in Edge & Chrome without publishing to public app stores.
                </p>
              </div>
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-emerald-400 text-xs font-semibold uppercase">8x Segmented Range</div>
                <div className="text-sm font-medium text-slate-200 mt-1">IDM Chunking Engine</div>
                <p className="text-xs text-slate-400 mt-1">
                  Parallel HTTP byte-range chunks that maximize network throughput and support dynamic resume.
                </p>
              </div>
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="text-indigo-400 text-xs font-semibold uppercase">Universal Sniffing</div>
                <div className="text-sm font-medium text-slate-200 mt-1">Isolated Shadow DOM</div>
                <p className="text-xs text-slate-400 mt-1">
                  Injected into every tab on <code className="text-slate-300">&lt;all_urls&gt;</code> without site CSS conflicts.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Target Audience & Implementation Stakeholders</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Full-Stack Developers:</strong> Detailed API schemas, FFmpeg multiplexing scripts, and event streaming handlers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Security Engineers:</strong> Strict SSRF mitigations, DNS rebinding guards, private subnet isolation, and non-circumvention of DRM.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>DevOps & System Administrators:</strong> PowerShell deployment automation, PATH persistence, and Windows service orchestration.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Section 2: Architecture & Data Flow */}
        {activeSection === 'architecture' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-2xl font-bold text-white">
                2. System Architecture & Data Flow
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                A 3-tier decoupled topology separating in-browser detection from local high-performance media transcoding.
              </p>
            </div>

            {/* Architecture Diagram Box */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed">
              <div className="text-sky-400 font-semibold mb-2">SYSTEM TOPOLOGY & COMMUNICATION PIPELINE:</div>
              <pre className="text-slate-300">
{`+-----------------------------------------------------------------------------------+
|                            BROWSER PROCESS (Edge / Chrome)                        |
|                                                                                   |
|  [Tab 1: YouTube]       [Tab 2: Facebook]       [Tab 3: HTML5 Media Page]         |
|         │                      │                           │                      |
|         └──> Injected Content Script (Shadow DOM IDM Badge Overlay)               |
|                                 │                                                 |
|                        chrome.runtime.sendMessage()                               |
|                                 ▼                                                 |
|                [Manifest V3 Background Service Worker]                            |
|                                 │                                                 |
|                   HTTP POST /api/downloads/start                                  |
+─────────────────────────────────┼─────────────────────────────────────────────────+
                                  │ (Local Loopback 127.0.0.1:8000)
                                  ▼
+───────────────────────────────────────────────────────────────────────────────────+
|                       LOCAL FASTAPI BACKEND ENGINE                                |
|                                                                                   |
|  1. Security Layer (SSRF check, scheme whitelist, RFC 1918 block)                 |
|  2. Metadata Extractor (yt-dlp adapter, DRM guard, stream parsing)                |
|  3. IDM Chunk Engine (8 concurrent HTTP Range workers)                            |
|  4. Server-Sent Events (SSE) Progress Broadcaster -> React Web App Dashboard      |
|  5. FFmpeg Muxer (Merges adaptive video + audio into final MP4/MKV container)     |
|                                 │                                                 |
|                                 ▼                                                 |
|                  Local Storage: %USERPROFILE%\\IDMMediaSuite\\downloads             |
+-----------------------------------------------------------------------------------+`}
              </pre>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Key Architectural Principles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-sky-400">Low-Latency Inter-Process Bridge</div>
                  <p className="text-slate-400">
                    The browser extension communicates with the local FastAPI service via standard loopback HTTP requests (<code className="text-slate-300">http://127.0.0.1:8000</code>). Because the extension is loaded unpacked with <code className="text-slate-300">&lt;all_urls&gt;</code> host permissions, CORS is handled cleanly without external network hops.
                  </p>
                </div>
                <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-lg space-y-1">
                  <div className="font-semibold text-emerald-400">Asynchronous SSE Real-time Updates</div>
                  <p className="text-slate-400">
                    Rather than costly polling, the React dashboard subscribes to a Server-Sent Events stream (<code className="text-slate-300">/api/downloads/{'{id}'}/stream</code>) to update each chunk's progress bar at 20Hz with negligible CPU overhead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Core Requirements & Modes */}
        {activeSection === 'features' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-2xl font-bold text-white">
                3. Core Features & Three Distinct Download Modes
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Handling modern adaptive streaming (DASH, HLS, Fragmented MP4) across diverse platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-950/80 border border-sky-500/30 p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Mode 1</span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono">Recommended</span>
                </div>
                <h4 className="text-base font-semibold text-white">Video + Audio (Muxed)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Downloads the highest available video stream (e.g. 1080p60 / 4K) and highest bitrate audio stream separately, then seamlessly combines them via FFmpeg stream copy (<code className="text-slate-300">-c copy</code>) with zero re-encoding loss.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                  ffmpeg -i video.mp4 -i audio.m4a -c copy output.mp4
                </div>
              </div>

              <div className="bg-slate-950/80 border border-indigo-500/30 p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Mode 2</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">Pure Video</span>
                </div>
                <h4 className="text-base font-semibold text-white">Video Only</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts solely the visual track. Essential for video editors, VFX artists, or background video loops where audio is unwanted, maximizing download speed and minimizing file size.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                  yt-dlp -f "bestvideo[ext=mp4]" -o "video.mp4"
                </div>
              </div>

              <div className="bg-slate-950/80 border border-emerald-500/30 p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Mode 3</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Podcasts / Music</span>
                </div>
                <h4 className="text-base font-semibold text-white">Audio Only (MP3 / M4A)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts high-fidelity audio streams (Opus, AAC) and automatically transcodes or re-wraps into universal MP3 or M4A containers with embedded ID3 metadata tags.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                  ffmpeg -i input.webm -vn -c:a libmp3lame -q:a 2 audio.mp3
                </div>
              </div>
            </div>

            {/* Platform Support Matrix */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" /> Platform Extraction Capabilities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-slate-200">YouTube</div>
                  <div className="text-slate-400 text-[11px] mt-1">Adaptive DASH, 4K60, Shorts</div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-slate-200">Facebook & Instagram</div>
                  <div className="text-slate-400 text-[11px] mt-1">Reels, Stories, Video feeds</div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-slate-200">Vimeo & Dailymotion</div>
                  <div className="text-slate-400 text-[11px] mt-1">Direct MP4 & HLS Master</div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-slate-200">Generic HTML5</div>
                  <div className="text-slate-400 text-[11px] mt-1">Any embedded &lt;video&gt; / &lt;audio&gt;</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Web App (React & Vite) */}
        {activeSection === 'frontend' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-2xl font-bold text-white">
                4. Website Development (React 19, TypeScript, Tailwind)
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Responsive, accessible client interface providing media preview, chunk telemetry, and download management.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Core UI Component Hierarchy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-mono text-sky-400 font-semibold">URLInput & Inspector</div>
                  <p className="text-slate-400">
                    Accepts pasted media links, performs client-side regex check, and queries the backend metadata endpoint (<code className="text-slate-300">/api/media/inspect</code>) to display title, duration, author, and available resolutions.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-mono text-emerald-400 font-semibold">ChunkProgress (IDM Segment Visualizer)</div>
                  <p className="text-slate-400">
                    Visualizes the classic IDM 8-part segmented download bar. Each segment renders its individual byte progress, transfer rate, and completion status.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-mono text-indigo-400 font-semibold">FormatPicker & Mode Selector</div>
                  <p className="text-slate-400">
                    Presents radio tabs for Video+Audio, Video Only, and Audio Only, complete with resolution pill badges (4K, 1080p, 720p) and approximate filesize calculations.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-mono text-amber-400 font-semibold">DownloadQueueManager</div>
                  <p className="text-slate-400">
                    Provides active download pause/resume controls, download history persistence in localStorage, and one-click file revelation in Windows Explorer.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-200">Accessibility & Performance Mandates:</div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Full keyboard navigability (<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Tab</kbd>, <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Enter</kbd>, <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Esc</kbd> for modal dismissal).</li>
                <li>ARIA labels on all live download progress indicators (<code className="text-slate-300">role="progressbar"</code>, <code className="text-slate-300">aria-valuenow</code>).</li>
                <li>Zero-layout-shift thumbnail rendering with aspect-ratio containers.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Section 5: FastAPI & FFmpeg Backend */}
        {activeSection === 'backend' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-2xl font-bold text-white">
                5. Backend Architecture (Python FastAPI & FFmpeg)
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                High-throughput, asynchronous pipeline with parallel HTTP Range chunking and subprocess-safe FFmpeg muxing.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">The Multi-Segment Range Chunking Algorithm</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                IDM’s speed advantage stems from overcoming single-connection TCP congestion throttling. Our backend issues a HEAD request to verify <code className="text-sky-300">Accept-Ranges: bytes</code>, computes 8 equal byte partitions, and downloads each chunk simultaneously in parallel thread pools:
              </p>

              <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 space-y-2">
                <div className="text-sky-400"># Byte Range Calculation for 8 Workers:</div>
                <div>chunk_size = total_bytes // 8</div>
                <div>chunk[0] = Range: bytes=0-{'{chunk_size - 1}'}</div>
                <div>chunk[1] = Range: bytes={'{chunk_size}'}-{'{2*chunk_size - 1}'}</div>
                <div>...</div>
                <div>chunk[7] = Range: bytes={'{7*chunk_size}'}-{'{total_bytes - 1}'}</div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2 text-xs">
                <div className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  FFmpeg Non-Blocking Execution Standard
                </div>
                <p className="text-slate-400">
                  Subprocess calls are executed strictly with list-based arguments (<code className="text-slate-300">subprocess.run(['ffmpeg', ...], shell=False)</code>) to prevent shell command injection. Merging runs asynchronously in FastAPI BackgroundTasks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: MV3 Companion Extension */}
        {activeSection === 'extension' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Key User Requirement
              </span>
              <h2 className="text-2xl font-bold text-white mt-3">
                6. Companion Browser Extension (Chrome & Edge MV3)
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Injected into every browser tab without public Web Store publishing. Designed for direct unpacked sideloading in Edge (<code className="text-sky-300">edge://extensions</code>) and Chrome (<code className="text-sky-300">chrome://extensions</code>).
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">How "Every Tab" Injection Works Securely</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                By declaring <code className="text-sky-300">matches: ["&lt;all_urls&gt;"]</code> and <code className="text-sky-300">all_frames: true</code> in <code className="text-slate-200">manifest.json</code>, the extension automatically injects the content script into any webpage or embedded iframe currently loaded.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-semibold text-sky-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Closed Shadow DOM Isolation
                  </div>
                  <p className="text-slate-400">
                    The floating download bar is created inside a closed Shadow Root:
                    <code className="block bg-slate-900 p-2 rounded mt-1 text-slate-300">
                      const shadow = host.attachShadow(&#123; mode: 'closed' &#125;);
                    </code>
                    This guarantees that the host webpage's CSS cannot distort the IDM button, and IDM styles cannot break the host webpage.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-semibold text-emerald-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Dynamic DOM Mutation Observer
                  </div>
                  <p className="text-slate-400">
                    Modern SPAs like YouTube and Facebook dynamically insert video players into the DOM without page refreshes. A <code className="text-slate-300">MutationObserver</code> detects newly rendered <code className="text-slate-300">&lt;video&gt;</code> elements instantly and binds the floating bar.
                  </p>
                </div>
              </div>

              {/* Sideloading Instructions */}
              <div className="p-5 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-3">
                <div className="font-semibold text-indigo-300 text-sm flex items-center gap-2">
                  <Puzzle className="w-4 h-4" /> Edge & Chrome Sideloading Workflow (Zero Web Store)
                </div>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                  <li>In Edge, visit <code className="text-sky-300">edge://extensions</code> (or <code className="text-sky-300">chrome://extensions</code> in Chrome).</li>
                  <li>Toggle on <strong>Developer mode</strong> in the left sidebar or top right.</li>
                  <li>Click <strong>Load unpacked</strong> button.</li>
                  <li>Select the <code className="text-amber-300">extension</code> directory generated by our suite.</li>
                  <li>The extension is immediately active across all tabs permanently until disabled.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Section 7: Security & Compliance */}
        {activeSection === 'security' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-2xl font-bold text-white">
                7. Security, SSRF Mitigation & Platform Compliance
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Guarding against malicious URL submission, unauthorized intranet scanning, and platform legal constraints.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg space-y-2">
                <div className="text-sm font-semibold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Server-Side Request Forgery (SSRF) Defense
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Media downloaders are prime targets for SSRF attacks where attackers supply URLs like <code className="text-red-300">http://169.254.169.254/latest/meta-data/</code> to steal cloud IAM credentials or scan private subnets (<code className="text-red-300">192.168.0.0/16</code>, <code className="text-red-300">10.0.0.0/8</code>, <code className="text-red-300">127.0.0.1</code>).
                </p>
                <div className="text-xs text-slate-400 mt-2 space-y-1">
                  <div>1. <strong>Scheme Whitelist:</strong> Only <code className="text-slate-200">http://</code> and <code className="text-slate-200">https://</code> permitted. Reject <code className="text-slate-200">file://</code>, <code className="text-slate-200">gopher://</code>, <code className="text-slate-200">javascript:</code>.</div>
                  <div>2. <strong>DNS Pre-Resolution Check:</strong> Resolve hostname to IP before issuing request. Block any IP if <code className="text-slate-200">ip.is_private</code> or <code className="text-slate-200">ip.is_loopback</code>.</div>
                  <div>3. <strong>Cloud Metadata Blacklist:</strong> Explicit blocklist for <code className="text-slate-200">169.254.169.254</code> and <code className="text-slate-200">metadata.google.internal</code>.</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Platform Terms & Non-Circumvention of DRM
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The suite operates strictly within technical compliance boundaries:
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li><strong>DRM Integrity:</strong> Encrypted content protected by DRM systems (Widevine, FairPlay, PlayReady) is explicitly NOT decrypted or circumvented. Extractor filters ignore DRM flags.</li>
                  <li><strong>Rate Limiting:</strong> Requests to third-party endpoints include exponential backoff and adhere to rate limits to prevent IP banning.</li>
                  <li><strong>User Ownership:</strong> Clear in-app notice reminding users to download only content they own or have explicit authorization to store.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section 8: Windows & PowerShell Setup */}
        {activeSection === 'windows' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-2xl font-bold text-white">
                8. Windows Automated Installation (PowerShell Script)
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Zero-friction deployment on Windows 10/11 using modern Windows Package Manager (winget) and automated environment configuration.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Deployment Sequence Checklist</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <div className="font-semibold text-slate-200">Directory Creation</div>
                    <div className="text-slate-400 mt-0.5">Creates dedicated installation home at <code className="text-sky-300">%USERPROFILE%\IDMMediaSuite</code>.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <div className="font-semibold text-slate-200">Winget Package Provisioning</div>
                    <div className="text-slate-400 mt-0.5">Silently installs Python 3.11 (<code className="text-slate-300">Python.Python.3.11</code>) and FFmpeg (<code className="text-slate-300">Gyan.FFmpeg</code>) if not already detected in system PATH.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <div className="font-semibold text-slate-200">Virtual Environment & Dependencies</div>
                    <div className="text-slate-400 mt-0.5">Installs <code className="text-slate-300">fastapi, uvicorn, yt-dlp, pydantic</code> into isolated venv.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">4</span>
                  <div>
                    <div className="font-semibold text-slate-200">Desktop Shortcut & Autostart</div>
                    <div className="text-slate-400 mt-0.5">Generates a convenient Windows desktop shortcut to launch the backend with one click.</div>
                  </div>
                </div>
              </div>

              {/* Troubleshooting Callout */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
                <div className="font-semibold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Common Windows Troubleshooting Tips
                </div>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li><strong>PowerShell Execution Policy:</strong> If script execution is restricted, run: <code className="text-slate-200">Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</code>.</li>
                  <li><strong>PATH Refresh:</strong> After winget installs FFmpeg, close and reopen your terminal to load the updated system PATH.</li>
                  <li><strong>Firewall Prompt:</strong> On initial run, allow Python through the Windows Defender Firewall prompt for loopback port 8000.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section 9: Testing & Quality Assurance */}
        {activeSection === 'testing' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-2xl font-bold text-white">
                9. Testing Suite & Quality Assurance Plan
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Automated regression testing for validation defenses, concurrent chunk integrity, and FFmpeg error recovery.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Pytest Test Matrix</h3>
              <div className="overflow-hidden border border-slate-800 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Test Case</th>
                      <th className="p-3">Scope</th>
                      <th className="p-3">Expected Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    <tr className="bg-slate-900/50">
                      <td className="p-3 font-semibold text-sky-400">test_url_validation_valid</td>
                      <td className="p-3">Public HTTP/HTTPS URLs</td>
                      <td className="p-3 text-emerald-400">200 OK / Passed</td>
                    </tr>
                    <tr className="bg-slate-900/50">
                      <td className="p-3 font-semibold text-red-400">test_url_blocks_file_scheme</td>
                      <td className="p-3">file:///C:/Windows/...</td>
                      <td className="p-3 text-amber-400">400 Bad Request</td>
                    </tr>
                    <tr className="bg-slate-900/50">
                      <td className="p-3 font-semibold text-red-400">test_url_blocks_cloud_metadata</td>
                      <td className="p-3">169.254.169.254</td>
                      <td className="p-3 text-red-400">403 Forbidden (SSRF Blocked)</td>
                    </tr>
                    <tr className="bg-slate-900/50">
                      <td className="p-3 font-semibold text-indigo-400">test_chunk_reassembly_checksum</td>
                      <td className="p-3">8-part parallel stream</td>
                      <td className="p-3 text-emerald-400">MD5 Checksum Match</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
