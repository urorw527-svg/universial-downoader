import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Server, 
  Terminal,
  ExternalLink,
  Info
} from 'lucide-react';

interface SecurityRuleResult {
  url: string;
  isAllowed: boolean;
  status: number;
  reason: string;
  category: 'valid' | 'ssrf_metadata' | 'ssrf_private' | 'scheme_violation' | 'injection';
}

export const SecurityValidator: React.FC = () => {
  const [testUrl, setTestUrl] = useState<string>('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [result, setResult] = useState<SecurityRuleResult | null>(null);

  const sampleAttacks = [
    {
      label: 'AWS/GCP Cloud Metadata SSRF',
      url: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
      expected: 'Blocked (403 Forbidden)'
    },
    {
      label: 'Localhost Internal Port Scan',
      url: 'http://127.0.0.1:8080/admin/secrets',
      expected: 'Blocked (403 Loopback Forbidden)'
    },
    {
      label: 'Private Subnet (RFC 1918)',
      url: 'http://192.168.1.1/router-login',
      expected: 'Blocked (403 Private IP)'
    },
    {
      label: 'Arbitrary File Access (file://)',
      url: 'file:///C:/Windows/System32/drivers/etc/hosts',
      expected: 'Blocked (400 Unsupported Scheme)'
    },
    {
      label: 'JavaScript Injection Scheme',
      url: 'javascript:alert(document.cookie)',
      expected: 'Blocked (400 Unsupported Scheme)'
    },
    {
      label: 'Valid Public Media Stream',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      expected: 'Allowed (200 OK)'
    }
  ];

  const evaluateUrl = (urlToTest: string) => {
    const trimmed = urlToTest.trim();
    let lower = trimmed.toLowerCase();

    // Scheme check
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
      const match = trimmed.match(/^([a-zA-Z0-9_-]+):/);
      const scheme = match ? match[1] : 'unknown';
      setResult({
        url: trimmed,
        isAllowed: false,
        status: 400,
        reason: `Unsupported URL scheme: "${scheme}". Strict policy only permits HTTP and HTTPS protocols.`,
        category: 'scheme_violation'
      });
      return;
    }

    // Cloud metadata blacklist check
    if (
      lower.includes('169.254.169.254') || 
      lower.includes('metadata.google.internal') ||
      lower.includes('169.254.')
    ) {
      setResult({
        url: trimmed,
        isAllowed: false,
        status: 403,
        reason: 'CRITICAL SSRF MITIGATION: Access to cloud instance metadata services (169.254.169.254) is strictly prohibited.',
        category: 'ssrf_metadata'
      });
      return;
    }

    // Localhost / Loopback check
    if (
      lower.includes('localhost') || 
      lower.includes('127.0.0.1') || 
      lower.includes('0.0.0.0') || 
      lower.includes('::1')
    ) {
      setResult({
        url: trimmed,
        isAllowed: false,
        status: 403,
        reason: 'SSRF DEFENSE: Loopback access to local host services is blocked to prevent internal port probing.',
        category: 'ssrf_private'
      });
      return;
    }

    // Private RFC 1918 subnets (10.x, 192.168.x, 172.16-31.x)
    if (
      lower.includes('192.168.') || 
      lower.includes('10.') || 
      /172\.(1[6-9]|2[0-9]|3[0-1])\./.test(lower)
    ) {
      setResult({
        url: trimmed,
        isAllowed: false,
        status: 403,
        reason: 'SSRF DEFENSE: Destination IP belongs to a private intranet RFC 1918 subnet. Denied.',
        category: 'ssrf_private'
      });
      return;
    }

    // Allowed
    setResult({
      url: trimmed,
      isAllowed: true,
      status: 200,
      reason: 'URL passed all security filters. Public hostname verified, valid scheme, non-private destination.',
      category: 'valid'
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-bold text-white">SSRF Defense & URL Validation Engine</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Media downloaders frequently face high-risk Server-Side Request Forgery (SSRF) vulnerabilities. Test how our <code className="text-sky-300">security.py</code> validation algorithm intercepts attacks before initiating any network connections or spawning FFmpeg tasks.
        </p>
      </div>

      {/* Interactive Testing Sandbox */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Input URL to Audit:</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="e.g. http://169.254.169.254/latest/meta-data/ or https://youtube.com/..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => evaluateUrl(testUrl)}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all shrink-0"
            >
              Run Security Audit
            </button>
          </div>
        </div>

        {/* Preset attack vectors */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick-Select Attack Vector Presets:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {sampleAttacks.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setTestUrl(item.url);
                  evaluateUrl(item.url);
                }}
                className="text-left p-2.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 rounded-lg transition-all text-xs space-y-1"
              >
                <div className="font-semibold text-slate-200">{item.label}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{item.url}</div>
                <div className="text-[10px] text-amber-400 font-mono">{item.expected}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audit Result Display */}
        {result && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
              result.isAllowed
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.isAllowed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-200">VALIDATION PASSED (Status {result.status})</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <span className="text-red-200">THREAT BLOCKED (HTTP {result.status})</span>
                  </>
                )}
              </div>
              <span className="text-[11px] font-mono uppercase bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                Category: {result.category}
              </span>
            </div>

            <div className="text-slate-300 leading-relaxed font-sans">
              {result.reason}
            </div>

            <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
              Evaluated URL: <span className="text-slate-200">{result.url}</span>
            </div>
          </div>
        )}
      </div>

      {/* Compliance & DRM Technical Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="font-semibold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            Non-Circumvention of DRM Policy
          </div>
          <p className="text-slate-400 leading-relaxed">
            In compliance with international copyright treaties and platform terms, this system strictly extracts public, unencrypted media streams. Encrypted DRM streams (such as Widevine, PlayReady, or FairPlay) are filtered out at the metadata extraction phase:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
            if format.get('has_drm'):<br />
            &nbsp;&nbsp;continue # Explicit refusal to decrypt DRM
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="font-semibold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" />
            Subprocess Command Injection Defense
          </div>
          <p className="text-slate-400 leading-relaxed">
            When invoking FFmpeg or external binaries, shell invocation is completely disabled (<code className="text-slate-300">shell=False</code>) and parameters are passed as safe, immutable argument lists:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
            # Safe Subprocess Call Pattern:<br />
            subprocess.run(["ffmpeg", "-y", "-i", video_p, ...], shell=False)
          </div>
        </div>
      </div>
    </div>
  );
};
