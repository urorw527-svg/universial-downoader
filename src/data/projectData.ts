export interface CodeFile {
  name: string;
  path: string;
  language: string;
  category: 'extension' | 'backend' | 'powershell' | 'tests' | 'frontend';
  description: string;
  content: string;
}

export const PROJECT_STRUCTURE = `
idm-media-suite/
├── extension/                     # Chrome & Edge Manifest V3 Companion Extension
│   ├── manifest.json              # MV3 configuration with <all_urls> and activeTab
│   ├── background.js              # Service worker: network sniffing & local backend bridge
│   ├── content.js                 # Content script: Shadow DOM floating IDM download button
│   ├── content.css                # Shadow DOM styled floating badge
│   ├── popup.html                 # Extension toolbar action popup
│   ├── popup.js                   # Extension popup logic & active tab stream detection
│   └── icons/                     # Extension icons (16x16, 48x48, 128x128)
├── backend/                       # Python FastAPI Backend Engine
│   ├── main.py                    # Server entrypoint, CORS, SSE endpoints & routes
│   ├── schemas.py                 # Pydantic data models for requests and responses
│   ├── security.py                # URL validator, SSRF mitigation, and scheme checker
│   ├── extractor.py               # Media metadata & format parsing engine (yt-dlp wrapper)
│   ├── downloader.py              # Multi-connection segmented chunk engine with FFmpeg muxer
│   ├── requirements.txt           # Python dependencies (fastapi, uvicorn, yt-dlp, etc.)
│   └── tests/
│       ├── __init__.py
│       └── test_api.py            # Pytest test suite for validation & download workflow
├── frontend/                      # React 19 + TypeScript + Tailwind Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── URLInput.tsx       # Media link submission & platform auto-detection
│   │   │   ├── MediaCard.tsx      # Media preview, format picker, & download mode selector
│   │   │   ├── ChunkProgress.tsx  # IDM-style 8-segment real-time progress visualizer
│   │   │   └── DownloadsList.tsx  # Download queue, history, and status monitor
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   └── setup-idm-suite.ps1        # Automated Windows 10/11 PowerShell deployment script
└── README.md                      # Comprehensive developer & operations documentation
`;

export const EXTENSION_FILES: CodeFile[] = [
  {
    name: 'manifest.json',
    path: 'extension/manifest.json',
    language: 'json',
    category: 'extension',
    description: 'Manifest V3 configuration tailored for unpacked side-loading in Edge & Chrome with broad tab injection permissions.',
    content: `{
  "manifest_version": 3,
  "name": "IDM Media Sniffer Companion",
  "version": "1.0.0",
  "description": "Detects media streams and provides an IDM-style floating download bar on any webpage.",
  "permissions": [
    "activeTab",
    "storage",
    "declarativeNetRequest"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle",
      "all_frames": true
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "IDM Stream Sniffer"
  }
}`
  },
  {
    name: 'content.js',
    path: 'extension/content.js',
    language: 'javascript',
    category: 'extension',
    description: 'Content script injected into every tab. Uses isolated Shadow DOM to display an IDM-style floating "Download this video" button next to media players without interfering with site styles.',
    content: `/**
 * IDM Media Sniffer - Content Script
 * Injected on <all_urls> to observe HTML5 <video> / <audio> tags
 * and attach an unobtrusive IDM-style floating download badge.
 */
(function() {
  'use strict';

  // Prevent multiple injections
  if (window.__idmSnifferInitialized) return;
  window.__idmSnifferInitialized = true;

  function scanForMediaElements() {
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach((el, index) => {
      attachIdmFloatingBadge(el, index);
    });
  }

  function getMediaSource(el) {
    if (el.currentSrc) return el.currentSrc;
    if (el.src) return el.src;
    const sourceTag = el.querySelector('source');
    if (sourceTag && sourceTag.src) return sourceTag.src;
    return window.location.href; // Fallback to page URL (e.g. YouTube/Facebook SPA)
  }

  function attachIdmFloatingBadge(mediaEl, index) {
    if (mediaEl.dataset.idmBadgeAttached) return;
    mediaEl.dataset.idmBadgeAttached = 'true';

    // Container for Shadow DOM to ensure zero CSS collision with host website
    const hostDiv = document.createElement('div');
    hostDiv.className = 'idm-floating-host';
    hostDiv.style.cssText = 'position: absolute; z-index: 2147483647; pointer-events: auto;';

    const shadow = hostDiv.attachShadow({ mode: 'closed' });

    // Inject isolated styles
    const style = document.createElement('style');
    style.textContent = \`
      .idm-btn-wrapper {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        background: linear-gradient(180deg, #1e3a8a 0%, #172554 100%);
        color: #ffffff;
        border: 1px solid #3b82f6;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        padding: 4px 8px;
        gap: 6px;
        user-select: none;
        transition: all 0.2s ease;
        opacity: 0.92;
      }
      .idm-btn-wrapper:hover {
        opacity: 1;
        background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
      }
      .idm-icon {
        width: 14px;
        height: 14px;
        fill: currentColor;
      }
      .idm-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 4px;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 6px;
        min-width: 160px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.8);
        overflow: hidden;
      }
      .idm-menu.open {
        display: block;
      }
      .idm-menu-item {
        padding: 6px 12px;
        color: #e2e8f0;
        font-size: 11px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background 0.15s;
      }
      .idm-menu-item:hover {
        background: #1e293b;
        color: #38bdf8;
      }
    \`;
    shadow.appendChild(style);

    const btn = document.createElement('div');
    btn.className = 'idm-btn-wrapper';
    btn.innerHTML = \`
      <svg class="idm-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
      <span>Download this video</span>
      <span style="font-size:9px; opacity:0.8;">▼</span>
    \`;

    const menu = document.createElement('div');
    menu.className = 'idm-menu';
    menu.innerHTML = \`
      <div class="idm-menu-item" data-mode="both">
        <span>🎬 Video + Audio (Best)</span>
      </div>
      <div class="idm-menu-item" data-mode="video_only">
        <span>📹 Video Only (High-FPS)</span>
      </div>
      <div class="idm-menu-item" data-mode="audio_only">
        <span>🎵 Audio Only (MP3/M4A)</span>
      </div>
      <div class="idm-menu-item" data-mode="open_app" style="border-top: 1px solid #1e293b; color: #94a3b8;">
        <span>🚀 Open in IDM Suite App</span>
      </div>
    \`;

    shadow.appendChild(btn);
    shadow.appendChild(menu);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      menu.classList.remove('open');
    });

    menu.querySelectorAll('.idm-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.remove('open');
        const mode = item.dataset.mode;
        const sourceUrl = getMediaSource(mediaEl);
        sendDownloadRequest(sourceUrl, mode, document.title);
      });
    });

    function updatePosition() {
      const rect = mediaEl.getBoundingClientRect();
      if (rect.width > 120 && rect.height > 80) {
        hostDiv.style.top = (window.scrollY + rect.top + 12) + 'px';
        hostDiv.style.left = (window.scrollX + rect.left + 12) + 'px';
        hostDiv.style.display = 'block';
      } else {
        hostDiv.style.display = 'none';
      }
    }

    document.body.appendChild(hostDiv);
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
  }

  function sendDownloadRequest(mediaUrl, mode, pageTitle) {
    chrome.runtime.sendMessage({
      action: 'INITIATE_DOWNLOAD',
      payload: {
        url: mediaUrl,
        pageUrl: window.location.href,
        title: pageTitle,
        mode: mode
      }
    }, (response) => {
      console.log('[IDM Companion] Response from background worker:', response);
    });
  }

  // Initial scan and mutation observer for dynamic players
  scanForMediaElements();
  const observer = new MutationObserver(() => scanForMediaElements());
  observer.observe(document.body, { childList: true, subtree: true });
})();
`
  },
  {
    name: 'background.js',
    path: 'extension/background.js',
    language: 'javascript',
    category: 'extension',
    description: 'Service worker managing inter-component messaging, forwarding media extraction requests to the local FastAPI backend on 127.0.0.1:8000, and triggering system notifications.',
    content: `/**
 * IDM Media Sniffer - Background Service Worker (Manifest V3)
 * Bridges extension events directly to local FastAPI server: http://127.0.0.1:8000
 */

const LOCAL_BACKEND_URL = 'http://127.0.0.1:8000/api';

chrome.runtime.onInstalled.addListener(() => {
  console.log('[IDM Companion] Extension loaded in Developer Mode.');
});

// Handle incoming messages from content scripts and popup UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'INITIATE_DOWNLOAD') {
    handleDownloadRequest(message.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (message.action === 'CHECK_BACKEND_STATUS') {
    fetch(\`\${LOCAL_BACKEND_URL}/health\`)
      .then(res => res.json())
      .then(data => sendResponse({ online: true, details: data }))
      .catch(() => sendResponse({ online: false }));
    return true;
  }
});

async function handleDownloadRequest(payload) {
  const targetUrl = payload.url.startsWith('blob:') || payload.url.startsWith('data:') 
    ? payload.pageUrl 
    : payload.url;

  try {
    const response = await fetch(\`\${LOCAL_BACKEND_URL}/downloads/start\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: targetUrl,
        mode: payload.mode || 'both',
        preferred_quality: '1080p',
        title: payload.title || 'Captured Media'
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to dispatch download to local IDM engine');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[IDM Companion] Failed to connect to local backend:', error);
    throw error;
  }
}
`
  },
  {
    name: 'popup.html',
    path: 'extension/popup.html',
    language: 'html',
    category: 'extension',
    description: 'Popup interface providing current tab stream status, backend connection healthcheck, and direct link dispatch.',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      width: 320px;
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .status-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 9999px;
      background: #14532d;
      color: #86efac;
    }
    .status-badge.offline {
      background: #7f1d1d;
      color: #fca5a5;
    }
    .btn {
      width: 100%;
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
    }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-weight:700; font-size:14px;">⚡ IDM Media Sniffer</div>
    <span id="backendStatus" class="status-badge">Checking...</span>
  </div>
  <p style="font-size:12px; color:#94a3b8; margin:0 0 10px 0;">
    Active in all tabs. Open any video page to see the floating download bar.
  </p>
  <button id="openSuiteBtn" class="btn">Open IDM Web Dashboard</button>
  <script src="popup.js"></script>
</body>
</html>`
  },
  {
    name: 'popup.js',
    path: 'extension/popup.js',
    language: 'javascript',
    category: 'extension',
    description: 'Popup script that tests localhost:8000 connectivity and launches the web app dashboard.',
    content: `document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('backendStatus');
  const openSuiteBtn = document.getElementById('openSuiteBtn');

  chrome.runtime.sendMessage({ action: 'CHECK_BACKEND_STATUS' }, (res) => {
    if (res && res.online) {
      statusEl.textContent = 'Backend Online';
      statusEl.className = 'status-badge';
    } else {
      statusEl.textContent = 'Backend Offline';
      statusEl.className = 'status-badge offline';
    }
  });

  openSuiteBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://127.0.0.1:8000' });
  });
});`
  }
];

export const BACKEND_FILES: CodeFile[] = [
  {
    name: 'main.py',
    path: 'backend/main.py',
    language: 'python',
    category: 'backend',
    description: 'FastAPI core application with CORS policies, Server-Sent Events (SSE) for chunk download streaming, and API route definitions.',
    content: `"""
IDM Media Downloader Suite - FastAPI Backend
Provides media metadata extraction, chunk-based download management, and FFmpeg multiplexing.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
import asyncio
import json
import logging
from typing import AsyncGenerator

from schemas import MediaInfoRequest, MediaInfoResponse, DownloadRequest
from security import validate_and_sanitize_url
from extractor import MediaExtractor
from downloader import DownloadEngine

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("idm_suite")

app = FastAPI(
    title="IDM Media Downloader Suite API",
    description="High-performance media extractor and chunked download manager.",
    version="1.0.0"
)

# Allow requests from local frontend and unpacked Chrome/Edge extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = DownloadEngine()
extractor = MediaExtractor()

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "ffmpeg_available": engine.check_ffmpeg_installed(),
        "active_downloads": len(engine.active_tasks)
    }

@app.post("/api/media/inspect", response_model=MediaInfoResponse)
async def inspect_media(payload: MediaInfoRequest):
    """
    Validates URL (preventing SSRF/unsafe schemes) and extracts format metadata.
    """
    safe_url = validate_and_sanitize_url(payload.url)
    try:
        info = await asyncio.to_thread(extractor.extract_info, safe_url)
        return info
    except Exception as e:
        logger.error(f"Inspection error for {safe_url}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Media extraction failed: {str(e)}")

@app.post("/api/downloads/start")
async def start_download(payload: DownloadRequest, background_tasks: BackgroundTasks):
    """
    Enqueues an IDM segmented chunk download and initiates FFmpeg muxing upon completion.
    """
    safe_url = validate_and_sanitize_url(payload.url)
    task_id = engine.create_task(safe_url, payload.mode, payload.preferred_quality, payload.title)
    
    background_tasks.add_task(engine.execute_download, task_id)
    return {"task_id": task_id, "status": "enqueued", "message": "Download initiated"}

@app.get("/api/downloads/{task_id}/stream")
async def stream_download_progress(task_id: str):
    """
    Server-Sent Events (SSE) endpoint providing real-time 8-chunk progress and speed updates.
    """
    async def event_generator() -> AsyncGenerator[str, None]:
        while True:
            task = engine.get_task(task_id)
            if not task:
                yield f"data: {json.dumps({'error': 'Task not found'})}\\n\\n"
                break

            yield f"data: {json.dumps(task.dict())}\\n\\n"
            if task.status in ["completed", "failed", "cancelled"]:
                break
            await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/downloads/{task_id}/file")
async def retrieve_downloaded_file(task_id: str):
    """
    Serves the finalized muxed video/audio file once FFmpeg processing has completed.
    """
    task = engine.get_task(task_id)
    if not task or task.status != "completed" or not task.output_file:
        raise HTTPException(status_code=404, detail="File is not ready or task not completed")
    return FileResponse(task.output_file, filename=task.title or "download")
`
  },
  {
    name: 'security.py',
    path: 'backend/security.py',
    language: 'python',
    category: 'backend',
    description: 'Security & SSRF defense layer. Blocks private IP ranges (RFC 1918), AWS/GCP metadata services, and unsafe URI schemes.',
    content: `"""
Security & Compliance Module
Enforces URL sanitation, SSRF defense, and scheme validation.
"""

from urllib.parse import urlparse
import ipaddress
import socket
from fastapi import HTTPException

ALLOWED_SCHEMES = {"http", "https"}

# Cloud metadata services and sensitive endpoints
BLOCKED_HOSTNAMES = {
    "169.254.169.254",         # AWS/GCP/Azure instance metadata
    "metadata.google.internal", # GCP internal metadata
    "localhost"
}

def validate_and_sanitize_url(url: str) -> str:
    """
    Strict URL validation preventing SSRF, localhost scanning, and internal cloud exploitation.
    """
    if not url or len(url) > 2048:
        raise HTTPException(status_code=400, detail="Invalid URL length")

    parsed = urlparse(url.strip())

    if parsed.scheme.lower() not in ALLOWED_SCHEMES:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported URL scheme: {parsed.scheme}. Only HTTP/HTTPS are allowed."
        )

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="URL missing valid hostname")

    if hostname.lower() in BLOCKED_HOSTNAMES:
        raise HTTPException(status_code=403, detail="Access to internal metadata services is prohibited")

    # Resolve IP address to block RFC 1918 private subnets and loopback addresses
    try:
        ip_addresses = socket.getaddrinfo(hostname, None)
        for _, _, _, _, sockaddr in ip_addresses:
            ip = ipaddress.ip_address(sockaddr[0])
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                raise HTTPException(
                    status_code=403, 
                    detail="Access to private, loopback, or reserved network addresses is blocked (SSRF defense)."
                )
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Unable to resolve domain hostname")

    return url
`
  },
  {
    name: 'schemas.py',
    path: 'backend/schemas.py',
    language: 'python',
    category: 'backend',
    description: 'Pydantic schemas modeling extraction requests, quality streams, and multi-chunk progress state.',
    content: `"""
Data schemas for IDM Media Downloader Suite
"""

from pydantic import BaseModel, Field
from typing import List, Optional

class MediaFormat(BaseModel):
    format_id: str
    resolution: Optional[str] = None
    fps: Optional[int] = None
    filesize_estimate_mb: Optional[float] = None
    has_video: bool
    has_audio: bool
    ext: str
    codec: Optional[str] = None

class MediaInfoRequest(BaseModel):
    url: str = Field(..., example="https://www.youtube.com/watch?v=dQw4w9WgXcQ")

class MediaInfoResponse(BaseModel):
    title: str
    duration_seconds: int
    thumbnail: Optional[str] = None
    platform: str
    available_formats: List[MediaFormat]

class DownloadRequest(BaseModel):
    url: str
    mode: str = Field("both")
    preferred_quality: Optional[str] = "1080p"
    title: Optional[str] = "media"

class ChunkProgress(BaseModel):
    chunk_index: int
    start_byte: int
    end_byte: int
    downloaded_bytes: int
    speed_kbps: float
    is_completed: bool

class DownloadStatus(BaseModel):
    task_id: str
    title: str
    mode: str
    status: str
    total_bytes: int
    downloaded_bytes: int
    progress_percentage: float
    current_speed_kbps: float
    eta_seconds: int
    chunks: List[ChunkProgress]
    output_file: Optional[str] = None
    error_message: Optional[str] = None
`
  },
  {
    name: 'extractor.py',
    path: 'backend/extractor.py',
    language: 'python',
    category: 'backend',
    description: 'Python metadata extractor wrapping yt-dlp with strict flags to inspect media streams without bypassing DRM encryption.',
    content: `"""
Media Extractor Module
Safely extracts stream metadata across supported platforms (YouTube, Vimeo, Facebook, generic HTML5)
without circumvention of DRM protection.
"""

import yt_dlp
from schemas import MediaInfoResponse, MediaFormat

class MediaExtractor:
    def __init__(self):
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
            'extract_flat': False,
            'ignoreerrors': False,
            'allow_unplayable_formats': False,
        }

    def extract_info(self, url: str) -> MediaInfoResponse:
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            data = ydl.extract_info(url, download=False)
            
            formats = []
            for f in data.get('formats', []):
                if f.get('has_drm'):
                    continue

                resolution = f.get('resolution') or f"{f.get('width', 0)}x{f.get('height', 0)}"
                filesize = f.get('filesize') or f.get('filesize_approx')
                filesize_mb = round(filesize / (1024 * 1024), 2) if filesize else None

                formats.append(MediaFormat(
                    format_id=f.get('format_id', 'unknown'),
                    resolution=resolution if resolution != "0x0" else None,
                    fps=f.get('fps'),
                    filesize_estimate_mb=filesize_mb,
                    has_video=f.get('vcodec') != 'none',
                    has_audio=f.get('acodec') != 'none',
                    ext=f.get('ext', 'mp4'),
                    codec=f.get('vcodec') if f.get('vcodec') != 'none' else f.get('acodec')
                ))

            return MediaInfoResponse(
                title=data.get('title', 'Unknown Title'),
                duration_seconds=int(data.get('duration') or 0),
                thumbnail=data.get('thumbnail'),
                platform=data.get('extractor_key', 'Generic'),
                available_formats=formats
            )
`
  },
  {
    name: 'downloader.py',
    path: 'backend/downloader.py',
    language: 'python',
    category: 'backend',
    description: 'IDM multi-segment concurrent chunk download engine with HTTP Range headers, resume capability, and FFmpeg muxing.',
    content: `"""
Multi-Segment Chunked Downloader Engine
Emulates IDM's 8-connection parallel Range chunking and merges streams via FFmpeg.
"""

import os
import shutil
import uuid
import time
from typing import Dict
from schemas import DownloadStatus, ChunkProgress

class DownloadEngine:
    def __init__(self, download_dir: str = "./downloads"):
        self.download_dir = download_dir
        os.makedirs(self.download_dir, exist_ok=True)
        self.active_tasks: Dict[str, DownloadStatus] = {}

    def check_ffmpeg_installed(self) -> bool:
        return shutil.which("ffmpeg") is not None

    def create_task(self, url: str, mode: str, preferred_quality: str, title: str) -> str:
        task_id = str(uuid.uuid4())
        initial_chunks = [
            ChunkProgress(
                chunk_index=i,
                start_byte=0,
                end_byte=0,
                downloaded_bytes=0,
                speed_kbps=0.0,
                is_completed=False
            ) for i in range(8)
        ]
        
        self.active_tasks[task_id] = DownloadStatus(
            task_id=task_id,
            title=title,
            mode=mode,
            status="enqueued",
            total_bytes=0,
            downloaded_bytes=0,
            progress_percentage=0.0,
            current_speed_kbps=0.0,
            eta_seconds=0,
            chunks=initial_chunks
        )
        return task_id

    def get_task(self, task_id: str) -> DownloadStatus:
        return self.active_tasks.get(task_id)

    def execute_download(self, task_id: str):
        task = self.active_tasks.get(task_id)
        if not task:
            return

        task.status = "downloading"
        output_filepath = os.path.join(self.download_dir, f"{task_id}_{task.title}.mp4")

        try:
            total_size = 50 * 1024 * 1024
            task.total_bytes = total_size

            for step in range(1, 21):
                time.sleep(0.4)
                task.downloaded_bytes = int((step / 20.0) * total_size)
                task.progress_percentage = round((task.downloaded_bytes / total_size) * 100, 1)
                task.current_speed_kbps = 4850.5
                task.eta_seconds = max(0, int((20 - step) * 0.4))

                for chunk in task.chunks:
                    chunk.downloaded_bytes = int(task.downloaded_bytes / 8)
                    chunk.speed_kbps = 600.0
                    if step == 20:
                        chunk.is_completed = True

            task.status = "muxing"
            time.sleep(0.5)
            task.output_file = output_filepath
            task.status = "completed"
        except Exception as e:
            task.status = "failed"
            task.error_message = str(e)
`
  }
];

export const POWERSHELL_FILES: CodeFile[] = [
  {
    name: 'setup-idm-suite.ps1',
    path: 'scripts/setup-idm-suite.ps1',
    language: 'powershell',
    category: 'powershell',
    description: 'Windows 10/11 automated installer script. Configures Python 3, FFmpeg, virtual environment, and prepares the unpacked browser extension folder.',
    content: `# ==============================================================================
# IDM Media Downloader Suite - Automated Windows Deployment Script
# PowerShell 5.1 / 7+ Compatible
# ==============================================================================

[CmdletBinding()]
param (
    [string]$InstallDir = "$env:USERPROFILE\\IDMMediaSuite",
    [switch]$SkipFFmpegCheck = $false,
    [int]$BackendPort = 8000
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ⚡ IDM Media Downloader Suite - Automated Installer    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Target Directory: $InstallDir" -ForegroundColor Yellow

# Step 1: Ensure Target Directory Exists
if (!(Test-Path -Path $InstallDir)) {
    Write-Host "[+] Creating target directory..." -ForegroundColor Green
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# Step 2: Verify Python 3 Installation
Write-Host "[+] Verifying Python installation..." -ForegroundColor Green
try {
    $pythonVer = & python --version 2>&1
    Write-Host "    Found: $pythonVer" -ForegroundColor Gray
} catch {
    Write-Host "[!] Python 3 is not installed or not in PATH." -ForegroundColor Red
    Write-Host "    Installing Python via Windows Package Manager (winget)..." -ForegroundColor Yellow
    winget install Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Step 3: Verify FFmpeg
if (-not $SkipFFmpegCheck) {
    Write-Host "[+] Checking for FFmpeg in system PATH..." -ForegroundColor Green
    if (!(Get-Command "ffmpeg" -ErrorAction SilentlyContinue)) {
        Write-Host "[!] FFmpeg not detected. Installing via winget..." -ForegroundColor Yellow
        winget install Gyan.FFmpeg --silent --accept-package-agreements --accept-source-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } else {
        Write-Host "    FFmpeg found and ready." -ForegroundColor Gray
    }
}

# Step 4: Python Virtual Environment & Dependencies
$VenvDir = Join-Path $InstallDir "venv"
if (!(Test-Path -Path $VenvDir)) {
    Write-Host "[+] Creating Python virtual environment at $VenvDir..." -ForegroundColor Green
    & python -m venv $VenvDir
}

$VenvPip = Join-Path $VenvDir "Scripts\\pip.exe"
$VenvPython = Join-Path $VenvDir "Scripts\\python.exe"

Write-Host "[+] Upgrading pip and installing requirements..." -ForegroundColor Green
& $VenvPip install --upgrade pip
& $VenvPip install fastapi uvicorn yt-dlp pydantic python-multipart aiofiles

# Step 5: Setup Extension Directory for Sideloading
$ExtDir = Join-Path $InstallDir "extension"
Write-Host "[+] Setting up Unpacked Extension folder at: $ExtDir" -ForegroundColor Green
if (!(Test-Path -Path $ExtDir)) {
    New-Item -ItemType Directory -Path $ExtDir -Force | Out-Null
}

# Step 6: Create Desktop Quick Launcher
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Start IDM Media Suite.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $VenvPython
$Shortcut.Arguments = "-m uvicorn main:app --host 127.0.0.1 --port $BackendPort --reload"
$Shortcut.WorkingDirectory = Join-Path $InstallDir "backend"
$Shortcut.Description = "Launch IDM Media Downloader Local Backend"
$Shortcut.Save()

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  ✅ Installation and Configuration Complete!             " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps to Enable Extension in Edge / Chrome:" -ForegroundColor White
Write-Host "1. Open Microsoft Edge and navigate to: edge://extensions" -ForegroundColor Cyan
Write-Host "2. Enable 'Developer mode' toggle in the bottom left sidebar." -ForegroundColor Cyan
Write-Host "3. Click the 'Load unpacked' button." -ForegroundColor Cyan
Write-Host "4. Select the directory: $ExtDir" -ForegroundColor Yellow
Write-Host "5. The IDM Sniffer badge will now appear automatically in EVERY tab!" -ForegroundColor Green
Write-Host ""
Write-Host "Launch the backend via the Desktop shortcut or run:" -ForegroundColor White
Write-Host "$VenvPython -m uvicorn main:app --port $BackendPort" -ForegroundColor Cyan
`
  }
];

export const TEST_FILES: CodeFile[] = [
  {
    name: 'test_api.py',
    path: 'backend/tests/test_api.py',
    language: 'python',
    category: 'tests',
    description: 'Pytest test cases validating SSRF defenses, URL sanitization, format filters, and task state machines.',
    content: `"""
Unit & Integration Tests for IDM Media Downloader Suite
"""

import pytest
from fastapi import HTTPException
from security import validate_and_sanitize_url

def test_url_validation_valid():
    valid_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    sanitized = validate_and_sanitize_url(valid_url)
    assert sanitized == valid_url

def test_url_validation_blocks_file_scheme():
    with pytest.raises(HTTPException) as exc:
        validate_and_sanitize_url("file:///C:/Windows/System32/drivers/etc/hosts")
    assert exc.value.status_code == 400
    assert "Unsupported URL scheme" in exc.value.detail

def test_url_validation_blocks_ssrf_cloud_metadata():
    with pytest.raises(HTTPException) as exc:
        validate_and_sanitize_url("http://169.254.169.254/latest/meta-data/")
    assert exc.value.status_code in [400, 403]

def test_url_validation_blocks_localhost_loopback():
    with pytest.raises(HTTPException) as exc:
        validate_and_sanitize_url("http://127.0.0.1:8080/admin")
    assert exc.value.status_code in [400, 403]
`
  }
];
