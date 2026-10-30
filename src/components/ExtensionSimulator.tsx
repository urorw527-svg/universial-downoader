import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize2, 
  Download, 
  Send, 
  Shield, 
  CheckCircle, 
  Layers, 
  RefreshCw,
  Terminal,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface ExtensionSimulatorProps {
  onSendToDownloader?: (media: { url: string; title: string; mode: string }) => void;
}

export const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({ onSendToDownloader }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeMediaUrl, setActiveMediaUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [activeTitle, setActiveTitle] = useState<string>('Nature Cinematic 4K Showcase');
  const [simulatedPlatform, setSimulatedPlatform] = useState<'youtube' | 'facebook' | 'generic'>('youtube');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [showShadowDomInspector, setShowShadowDomInspector] = useState<boolean>(false);
  const [sniffSuccess, setSniffSuccess] = useState<boolean>(false);

  const triggerDownloadAction = (mode: string) => {
    setIsMenuOpen(false);
    const payload = {
      action: 'INITIATE_DOWNLOAD',
      tabId: 1042,
      origin: window.location.origin,
      payload: {
        url: activeMediaUrl,
        pageUrl: `https://www.${simulatedPlatform}.com/watch?v=sample123`,
        title: activeTitle,
        mode: mode,
        timestamp: new Date().toISOString()
      }
    };
    setLastMessage(payload);
    setSniffSuccess(true);
    setTimeout(() => setSniffSuccess(false), 3000);

    if (onSendToDownloader) {
      onSendToDownloader({
        url: activeMediaUrl,
        title: activeTitle,
        mode: mode
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-lg font-bold text-white">Live In-Tab Extension Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulates how the MV3 content script injects into every tab, monitors <code className="text-sky-300">&lt;video&gt;</code> elements, and attaches the floating IDM download bar via Shadow DOM.
          </p>
        </div>

        {/* Platform switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 font-medium">Simulate Host:</span>
          <button
            onClick={() => {
              setSimulatedPlatform('youtube');
              setActiveTitle('YouTube: 4K Ultra HD Nature Documentary');
            }}
            className={`px-3 py-1 rounded font-medium transition-all ${
              simulatedPlatform === 'youtube'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            YouTube Tab
          </button>
          <button
            onClick={() => {
              setSimulatedPlatform('facebook');
              setActiveTitle('Facebook Video: Product Teaser');
            }}
            className={`px-3 py-1 rounded font-medium transition-all ${
              simulatedPlatform === 'facebook'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Facebook Tab
          </button>
          <button
            onClick={() => {
              setSimulatedPlatform('generic');
              setActiveTitle('HTML5 Video Player Example');
            }}
            className={`px-3 py-1 rounded font-medium transition-all ${
              simulatedPlatform === 'generic'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Generic Site Tab
          </button>
        </div>
      </div>

      {/* Simulated Browser Viewport */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Browser Chrome Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="ml-3 flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-300 font-mono text-[11px] w-96 max-w-full truncate">
              <span className="text-emerald-400">https://</span>
              <span>www.{simulatedPlatform}.com/watch?v=sample123</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-mono">
              MV3 Injected: All Frames
            </span>
          </div>
        </div>

        {/* Browser Page Body */}
        <div className="p-6 relative">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-sm font-semibold text-slate-200">
              {activeTitle}
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 group shadow-lg">
              {/* Actual Video */}
              <video
                src={activeMediaUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />

              {/* IDM FLOATING BADGE (Simulating Isolated Shadow DOM Element) */}
              <div className="absolute top-3 left-3 z-30">
                <div className="relative">
                  {/* Floating IDM Button */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white rounded text-[11px] font-semibold border border-blue-400 shadow-xl transition-all select-none hover:scale-105 active:scale-95"
                    title="IDM Companion Sniffer: Click to download detected media"
                  >
                    <Download className="w-3.5 h-3.5 fill-current text-white" />
                    <span>Download this video</span>
                    <ChevronDown className="w-3 h-3 text-blue-200 ml-0.5" />
                  </button>

                  {/* IDM Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-60 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl py-1 text-xs text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-sky-400 tracking-wider border-b border-slate-800/80">
                        Detected Stream (1080p MP4)
                      </div>
                      
                      <button
                        onClick={() => triggerDownloadAction('both')}
                        className="w-full text-left px-3 py-2 hover:bg-blue-600/20 hover:text-sky-300 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>🎬</span>
                          <div>
                            <div className="font-medium">Video + Audio (Full Mux)</div>
                            <div className="text-[10px] text-slate-400">1080p • 60 FPS • High Bitrate</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">~45 MB</span>
                      </button>

                      <button
                        onClick={() => triggerDownloadAction('video_only')}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-600/20 hover:text-indigo-300 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>📹</span>
                          <div>
                            <div className="font-medium">Video Only (No Track)</div>
                            <div className="text-[10px] text-slate-400">1080p • Visuals Only</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">~38 MB</span>
                      </button>

                      <button
                        onClick={() => triggerDownloadAction('audio_only')}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-600/20 hover:text-emerald-300 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>🎵</span>
                          <div>
                            <div className="font-medium">Audio Only (MP3 / M4A)</div>
                            <div className="text-[10px] text-slate-400">320 kbps • Auto ID3</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">~7 MB</span>
                      </button>

                      <div className="border-t border-slate-800 my-1"></div>

                      <div className="px-3 py-1 text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Shadow DOM: Closed</span>
                        <span className="text-emerald-400 font-mono">127.0.0.1:8000</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Player Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-sky-400">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <Volume2 className="w-4 h-4 text-slate-300" />
                  <span className="text-[11px] font-mono text-slate-300">00:14 / 01:25</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">1080p60</span>
                  <Maximize2 className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            </div>

            {/* Video description mockup */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="text-slate-300 font-medium">Page Elements & DOM State:</div>
              <p>
                The extension content script attaches a <code className="text-sky-300">MutationObserver</code> on <code className="text-slate-300">document.body</code>. Notice how the IDM bar automatically mounts on the top-left edge of the <code className="text-slate-300">&lt;video&gt;</code> element above.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* IPC Telemetry & Message Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Shadow DOM Architecture */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              Shadow DOM Isolation Guarantee
            </h3>
            <button
              onClick={() => setShowShadowDomInspector(!showShadowDomInspector)}
              className="text-[11px] text-sky-400 hover:underline"
            >
              {showShadowDomInspector ? 'Hide Tree' : 'Inspect Tree'}
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            By scoping the floating button inside an isolated closed shadow tree (<code className="text-slate-300">attachShadow(&#123; mode: 'closed' &#125;)</code>), page styles (e.g., YouTube's global CSS resets) cannot override IDM colors, margins, or positioning.
          </p>

          {showShadowDomInspector && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
              <div className="text-slate-500">&lt;div class="idm-floating-host"&gt;</div>
              <div className="pl-4 text-sky-400">#shadow-root (closed)</div>
              <div className="pl-8 text-emerald-400">&lt;style&gt; .idm-btn-wrapper &#123; ... &#125; &lt;/style&gt;</div>
              <div className="pl-8 text-indigo-400">&lt;div class="idm-btn-wrapper"&gt; Download this video &lt;/div&gt;</div>
              <div className="pl-8 text-amber-400">&lt;div class="idm-menu"&gt; ... &lt;/div&gt;</div>
              <div className="text-slate-500">&lt;/div&gt;</div>
            </div>
          )}
        </div>

        {/* Right: Message Payload Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              chrome.runtime.sendMessage Payload
            </h3>
            {sniffSuccess && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Dispatched to Backend
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Click any download mode on the floating badge above to inspect the exact message passed from content script to background worker:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 h-32 overflow-y-auto">
            {lastMessage ? (
              <pre className="text-emerald-400">{JSON.stringify(lastMessage, null, 2)}</pre>
            ) : (
              <span className="text-slate-600 italic">No message dispatched yet. Click "Download this video" above.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
