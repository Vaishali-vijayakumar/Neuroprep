import React, { useEffect, useRef, useState } from 'react';
import useInterviewStore from '../../store/interviewStore';

export default function DeviceCheckModule() {
  const setPipelineState = useInterviewStore((s) => s.setPipelineState);
  const setMediaStream   = useInterviewStore((s) => s.setMediaStream);
  const existingStream   = useInterviewStore((s) => s.mediaStream);
  const config           = useInterviewStore((s) => s.config);

  const streamRef  = useRef(existingStream || null);
  const videoRef   = useRef(null);
  const callIdRef  = useRef(0);

  const [status, setStatus] = useState(existingStream?.active ? 'granted' : 'idle');
  const [error, setError]   = useState('');
  const [micOn, setMicOn]   = useState(true);
  const [camOn, setCamOn]   = useState(true);
  const [devicesFound, setDevicesFound] = useState({ hasCam: true, hasMic: true });

  const isReady = status === 'granted';

  // ── Device Enumeration ──────────────────────────────────────────────────
  async function checkDevices() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCam = devices.some(d => d.kind === 'videoinput');
      const hasMic = devices.some(d => d.kind === 'audioinput');
      setDevicesFound({ hasCam, hasMic });
      if (!hasCam && !hasMic) {
        setStatus('notfound');
        setError('No camera or microphone hardware detected on your device.');
      }
    } catch (e) {
      console.warn('Device enumeration error:', e);
    }
  }

  // ── Core Stream Acquisition (Triggered on click or mount) ─────────────────
  async function startStream() {
    // If existing stream is active and valid, reuse it!
    if (streamRef.current && streamRef.current.active) {
      if (videoRef.current) videoRef.current.srcObject = streamRef.current;
      setStatus('granted');
      return;
    }

    const myId = ++callIdRef.current;
    setStatus('requesting');
    setError('');

    // Progressive fallback constraints
    const constraintSets = [
      {
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      },
      {
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      },
      {
        video: true,
        audio: true,
      },
    ];

    let ms = null;
    let lastErr = null;

    for (const constraints of constraintSets) {
      if (callIdRef.current !== myId) return;
      try {
        ms = await navigator.mediaDevices.getUserMedia(constraints);
        if (ms && ms.active) break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (callIdRef.current !== myId) {
      if (ms) ms.getTracks().forEach(t => t.stop());
      return;
    }

    if (ms && ms.active) {
      streamRef.current = ms;
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
      }
      setStatus('granted');
    } else {
      const err = lastErr || new Error('Unknown error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
        setError('Permission denied by browser or operating system.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setStatus('notfound');
        setError('No camera or microphone found. Connect a device and click Try Again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setStatus('busy');
        setError('Camera is in use by another app (Zoom, Teams, Meet). Close them and click Try Again.');
      } else {
        setStatus('error');
        setError(`Could not start devices: ${err.message}`);
      }
    }
  }

  // ── Auto-start on mount ──────────────────────────────────────────────────
  useEffect(() => {
    checkDevices();
    startStream();

    return () => {
      callIdRef.current++;
      // Stop tracks only if we haven't stored them for the live room
      if (streamRef.current && !useInterviewStore.getState().mediaStream) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Re-attach video stream if element renders after status becomes granted
  useEffect(() => {
    if (status === 'granted' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [status]);

  // ── Controls ────────────────────────────────────────────────────────────
  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(p => !p);
  };
  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(p => !p);
  };

  const handleEnter = () => {
    setMediaStream(streamRef.current);
    useInterviewStore.getState().startInterview();
  };

  const handleBack = () => {
    callIdRef.current++;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setMediaStream(null);
    setPipelineState('config');
  };

  // ── Details & Checklist ──────────────────────────────────────────────────
  const details = [
    { key: 'Track',      val: config?.trackName  || '—' },
    { key: 'Difficulty', val: config?.difficulty || 'Adaptive AI' },
    { key: 'Duration',   val: `${config?.duration || 30} min` },
    { key: 'Mode',       val: config?.mode === 'text' ? 'Text Only' : 'Voice + Video' },
  ];

  const checklist = [
    { label: 'Camera connected',             done: isReady && camOn  },
    { label: 'Microphone connected',         done: isReady && micOn  },
    { label: 'Browser permissions granted',  done: isReady           },
    { label: 'Quiet, well-lit environment',  done: isReady           },
  ];

  const badge = {
    idle:       { text: 'Click to start',       color: '#6B7280' },
    requesting: { text: 'Requesting access…',   color: '#D97706' },
    granted:    { text: 'Devices Ready',        color: '#16A34A' },
    denied:     { text: 'Permission Blocked',   color: '#DC2626' },
    notfound:   { text: 'No Hardware Found',    color: '#DC2626' },
    busy:       { text: 'Camera In Use',        color: '#DC2626' },
    error:      { text: 'Device Error',         color: '#DC2626' },
  }[status] || { text: status, color: '#6B7280' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--font-inter)', backgroundColor: 'var(--bg-page)', overflow: 'hidden' }}>

      {/* ── Slim Header ── */}
      <div style={{ height: '52px', backgroundColor: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px', flexShrink: 0 }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500, padding: 0 }}>Back</button>
        <span style={{ width: 1, height: 16, backgroundColor: 'var(--border-color)' }} />
        <span className="pill-tag" style={{ fontSize: '12px' }}>Step 3 of 3</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>Device Setup</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: badge.color, animation: status === 'requesting' ? 'pulse 1.2s ease-in-out infinite' : 'none' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: badge.color }}>{badge.text}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>

        {/* LEFT: Camera Preview Box */}
        <div style={{ position: 'relative', backgroundColor: '#0F172A', borderRight: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: isReady && camOn ? 'block' : 'none',
            }}
          />

          {/* ── Status Overlays ── */}

          {/* Idle / Requesting prompt with explicit User Action Button */}
          {(status === 'idle' || status === 'requesting') && (
            <CentreBox>
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '24px 28px', maxWidth: 380, textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
                <h3 style={{ color: '#F1F5F9', fontSize: 16, fontWeight: 700, margin: '0 0 8px 0' }}>Camera & Mic Permission Required</h3>
                <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px 0' }}>
                  To start your AI interview, click the button below to allow your browser access to your camera and microphone.
                </p>

                <button
                  onClick={startStream}
                  disabled={status === 'requesting'}
                  style={{
                    width: '100%', padding: '12px', backgroundColor: '#FFFFFF', color: '#0F172A',
                    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: status === 'requesting' ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {status === 'requesting' ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid #0F172A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Requesting Permission…
                    </>
                  ) : (
                    'Enable Camera & Microphone'
                  )}
                </button>

                <p style={{ color: '#64748B', fontSize: 12, margin: '14px 0 0 0' }}>
                  Look for the browser popup at the top left of your screen.
                </p>
              </div>
            </CentreBox>
          )}

          {/* Permission Denied */}
          {status === 'denied' && (
            <CentreBox>
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #7F1D1D', borderRadius: 12, padding: '24px 28px', maxWidth: 360, textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <h3 style={{ color: '#FCA5A5', fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>Permission Blocked</h3>
                <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>
                  Your browser blocked camera access. Click the <strong style={{ color: '#F1F5F9' }}>lock icon 🔒</strong> in your address bar, set Camera & Mic to <strong style={{ color: '#F1F5F9' }}>Allow</strong>, then click below.
                </p>
                <button onClick={startStream} style={primaryBtn}>Try Again</button>
              </div>
            </CentreBox>
          )}

          {/* Hardware Not Found / Busy / Error */}
          {['busy', 'notfound', 'error'].includes(status) && (
            <CentreBox>
              <div style={{ backgroundColor: '#1E293B', border: '1px solid #78350F', borderRadius: 12, padding: '24px 28px', maxWidth: 360, textAlign: 'center' }}>
                <h3 style={{ color: '#FCD34D', fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>
                  {status === 'busy' ? 'Camera in Use' : status === 'notfound' ? 'No Hardware Found' : 'Device Error'}
                </h3>
                <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>{error}</p>
                <button onClick={startStream} style={primaryBtn}>Try Again</button>
              </div>
            </CentreBox>
          )}

          {/* Camera Disabled Toggle state */}
          {isReady && !camOn && (
            <CentreBox><p style={grayText}>Camera is turned off</p></CentreBox>
          )}

          {/* Live Status Indicator Bar */}
          {isReady && (
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10 }}>
              {[{ l: `Mic ${micOn ? 'On' : 'Off'}`, a: micOn }, { l: `Cam ${camOn ? 'On' : 'Off'}`, a: camOn }].map(b => (
                <span key={b.l} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, backgroundColor: b.a ? 'rgba(22,163,74,0.18)' : 'rgba(220,38,38,0.18)', color: b.a ? '#16A34A' : '#DC2626', border: `1px solid ${b.a ? '#16A34A' : '#DC2626'}` }}>
                  {b.l}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Controls Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflowY: 'auto' }}>

          {/* Primary Permission Action button if not connected */}
          {!isReady && (
            <div style={{ padding: '16px 20px', backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
              <button
                onClick={startStream}
                style={{
                  width: '100%', padding: '11px', backgroundColor: '#111827', color: '#FFFFFF',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Enable Camera & Mic
              </button>
            </div>
          )}

          {/* Device Controls */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <p style={sectionLabel}>Device Controls</p>
            {[
              { label: 'Microphone', active: micOn, toggle: toggleMic, on: 'Mute', off: 'Unmute' },
              { label: 'Camera',     active: camOn, toggle: toggleCam, on: 'Turn Off', off: 'Turn On' },
            ].map(d => (
              <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{d.label}</div>
                  <div style={{ fontSize: 12, color: isReady ? (d.active ? '#16A34A' : '#DC2626') : '#9CA3AF', fontWeight: 500 }}>
                    {isReady ? (d.active ? 'Active' : 'Off') : 'Not connected'}
                  </div>
                </div>
                <button onClick={d.toggle} disabled={!isReady} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: isReady ? 'pointer' : 'not-allowed', border: d.active ? '1px solid #111827' : '1px solid #D1D5DB', backgroundColor: d.active ? '#111827' : '#fff', color: d.active ? '#fff' : '#374151', opacity: isReady ? 1 : 0.4 }}>
                  {d.active ? d.on : d.off}
                </button>
              </div>
            ))}
          </div>

          {/* Readiness Checklist */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <p style={sectionLabel}>Readiness Checklist</p>
            {checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, backgroundColor: item.done ? '#111827' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.done && <svg width="8" height="6" viewBox="0 0 8 6"><path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ fontSize: 13, color: item.done ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: item.done ? 600 : 400 }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Session Details */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <p style={sectionLabel}>Session Configuration</p>
            {details.map(d => (
              <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.key}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{d.val}</span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Action CTAs */}
          <div style={{ padding: '16px 20px' }}>
            <button onClick={handleEnter} disabled={!isReady} style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 700, backgroundColor: isReady ? '#111827' : '#E5E7EB', color: isReady ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 8, cursor: isReady ? 'pointer' : 'not-allowed', marginBottom: 8, transition: 'background-color 0.15s' }}>
              {isReady ? 'Enter Interview Room' : 'Waiting for camera & mic…'}
            </button>
            <button onClick={handleBack} style={{ width: '100%', padding: 9, fontSize: 13, fontWeight: 600, backgroundColor: '#fff', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }}>
              Back to Configuration
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.25;} }
      `}</style>
    </div>
  );
}

const CentreBox = ({ children }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, zIndex: 10 }}>
    {children}
  </div>
);

const grayText  = { color: '#94A3B8', fontSize: 14, margin: 0, textAlign: 'center' };
const sectionLabel = { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 10px' };
const primaryBtn   = { width: '100%', padding: '10px 24px', backgroundColor: '#fff', color: '#111827', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' };
