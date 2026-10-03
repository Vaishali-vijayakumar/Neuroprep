import React, { useEffect, useRef, useState, useCallback } from 'react';
import useInterviewStore from '../../store/interviewStore';
import { Mic, MicOff, Video, VideoOff, CheckCircle2, ArrowLeft, Play, Sparkles, Volume2, ShieldCheck } from 'lucide-react';

const TRACK_NAMES = {
  hr: 'HR Interview',
  tech: 'Technical Interview',
  dsa: 'DSA & Coding',
  system_design: 'System Design & Architecture',
  behavioral: 'Behavioral & Managerial',
  gd: 'Group Discussion',
  group_discussion: 'Group Discussion',
  communication: 'Communication',
  ai_ml: 'AI / ML Interview',
  devops: 'DevOps & SRE',
  cloud: 'Cloud Architecture',
  cybersec: 'Cybersecurity',
  cybersecurity: 'Cybersecurity',
  qa: 'QA & Automation',
  custom: 'Custom Interview'
};

export default function DeviceCheckModule({ setActiveTab }) {
  const setPipelineState = useInterviewStore((s) => s.setPipelineState);
  const setMediaStream = useInterviewStore((s) => s.setMediaStream);
  const existingStream = useInterviewStore((s) => s.mediaStream);
  const config = useInterviewStore((s) => s.config);

  const streamRef = useRef(existingStream || null);
  const videoNodeRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const [status, setStatus] = useState(() => (existingStream?.active ? 'granted' : 'idle'));
  const [error, setError] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [warmupTimer, setWarmupTimer] = useState(30);
  const [warmupComplete, setWarmupComplete] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inhale (4s)');
  const [audioLevel, setAudioLevel] = useState(25);
  const [simulatedMode, setSimulatedMode] = useState(false);

  const isReady = status === 'granted' || simulatedMode;

  // Video Callback Ref
  const setVideoRef = useCallback((node) => {
    videoNodeRef.current = node;
    if (node && streamRef.current && streamRef.current.active) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  // ── Audio Visualizer for live microphone feedback ──
  const setupAudioMeter = (stream) => {
    try {
      if (!stream || stream.getAudioTracks().length === 0) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.max(8, (avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (_) {
      // Audio level simulation fallback
      setAudioLevel(35);
    }
  };

  // ── 30-Second Warm-up Countdown ──────────────────────────────────────────
  useEffect(() => {
    if (warmupComplete) return;
    const t = setInterval(() => {
      setWarmupTimer((prev) => {
        if (prev <= 1) {
          setWarmupComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [warmupComplete]);

  // 4-second Breathing rhythm
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingPhase((prev) => (prev.includes('Inhale') ? 'Exhale (4s)' : 'Inhale (4s)'));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ── Core Stream Acquisition ──────────────────────────────────────────────
  async function startStream() {
    if (streamRef.current && streamRef.current.active) {
      if (videoNodeRef.current) {
        videoNodeRef.current.srcObject = streamRef.current;
        videoNodeRef.current.play().catch(() => {});
      }
      setupAudioMeter(streamRef.current);
      setStatus('granted');
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setStatus('granted');
      setSimulatedMode(true);
      return;
    }

    setStatus('requesting');
    setError('');

    const constraintSets = [
      { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: true },
      { video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: true },
      { video: true, audio: true },
      { video: true, audio: false },
      { video: false, audio: true }
    ];

    let ms = null;
    let lastErr = null;

    for (const constraints of constraintSets) {
      try {
        ms = await navigator.mediaDevices.getUserMedia(constraints);
        if (ms && ms.active) break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (ms && ms.active) {
      streamRef.current = ms;
      if (videoNodeRef.current) {
        videoNodeRef.current.srcObject = ms;
        videoNodeRef.current.play().catch(() => {});
      }
      setupAudioMeter(ms);
      setStatus('granted');
      setSimulatedMode(false);
    } else {
      // Graceful fallback to practice mode
      console.warn('[DeviceCheck] Stream notice:', lastErr?.message);
      setStatus('granted');
      setSimulatedMode(true);
      setError('Physical camera not detected or permissions pending. Practice mode preview enabled.');
    }
  }

  // ── Auto-start on mount ──────────────────────────────────────────────────
  useEffect(() => {
    startStream();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (_) {}
      }
    };
  }, []);

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
    if (streamRef.current) {
      setMediaStream(streamRef.current);
    }
    const currentConfig = useInterviewStore.getState().config;
    if (!currentConfig) {
      useInterviewStore.getState().setConfig({
        trackId: 'hr',
        trackName: 'HR Interview',
        difficulty: 'Adaptive AI',
        duration: 30,
        mode: 'voice_video',
        language: 'English'
      });
    }
    useInterviewStore.getState().startInterview();
  };

  const handleBack = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(t => t.stop());
      } catch (_) {}
      streamRef.current = null;
    }
    setMediaStream(null);
    setPipelineState('config');
  };

  // ── Track display & details ──────────────────────────────────────────────
  const trackDisplayName = config?.trackName || config?.trackLabel || TRACK_NAMES[config?.trackId] || 'HR Interview';

  const details = [
    { key: 'Track', val: trackDisplayName },
    { key: 'Difficulty', val: config?.difficulty || 'Adaptive AI' },
    { key: 'Duration', val: `${config?.duration || 30} min` },
    { key: 'Mode', val: config?.mode === 'text' ? 'Text Only' : 'Voice + Video' },
  ];

  const checklist = [
    { label: 'Camera connected', done: camOn },
    { label: 'Microphone connected', done: micOn },
    { label: 'Browser permissions granted', done: isReady },
    { label: 'Quiet, well-lit environment', done: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--font-body)', backgroundColor: 'var(--bg-page)', overflow: 'hidden' }}>

      {/* ── Slim Header ── */}
      <div style={{ height: '56px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: '14px', flexShrink: 0, boxShadow: '0 1px 3px rgba(45, 58, 48, 0.03)' }}>
        <button onClick={handleBack} className="btn-secondary-spec" style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <span style={{ width: 1, height: 18, backgroundColor: 'var(--border-color)' }} />
        <span className="pill-tag" style={{ fontSize: '12px' }}>Step 3 of 3</span>
        <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
          Device Setup & Readiness Check
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--btn-sage)', boxShadow: '0 0 6px var(--btn-sage)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--btn-sage)', fontFamily: 'var(--font-body)' }}>
            {simulatedMode ? 'Practice Preview Ready' : 'Devices Ready'}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', overflow: 'hidden' }}>

        {/* LEFT: Camera Preview Box */}
        <div style={{ position: 'relative', backgroundColor: '#1E2420', borderRight: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Live Real Video Feed */}
          {!simulatedMode && (
            <video
              ref={setVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: camOn ? 'block' : 'none',
              }}
            />
          )}

          {/* Simulated / Practice Mode Mirror Preview */}
          {(simulatedMode || !camOn) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: '#FAF8F5' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                backgroundColor: 'rgba(82, 98, 87, 0.35)', border: '2px solid var(--btn-sage)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(82, 98, 87, 0.4)'
              }}>
                <Video size={44} color="#F7F3EE" />
              </div>
              <div style={{ textAlign: 'center', maxWidth: '340px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  {!camOn ? 'Camera Paused' : 'Candidate Audio & Video Ready'}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#D1D5DB', lineHeight: 1.4 }}>
                  {!camOn ? 'Click "Turn On" in the controls to resume camera preview.' : 'Microphone level active. You can enter the interview room anytime.'}
                </p>
              </div>
            </div>
          )}

          {/* Live Microphone Visualizer Bar */}
          <div style={{
            position: 'absolute', bottom: 20, left: 24, zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 10,
            backgroundColor: 'rgba(30, 36, 32, 0.85)', backdropFilter: 'blur(10px)',
            padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <Volume2 size={16} color="var(--btn-sage)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>Mic:</span>
            <div style={{ width: '90px', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${micOn ? audioLevel : 0}%`, height: '100%',
                backgroundColor: 'var(--btn-sage)', borderRadius: '4px',
                transition: 'width 0.08s ease'
              }} />
            </div>
          </div>

          {/* Pre-emptive Calm Warm-up Floating Card */}
          <div style={{
            position: 'absolute', top: 16, left: 16, zIndex: 30,
            maxWidth: 360, width: 'calc(100% - 32px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '14px 18px',
            boxShadow: 'var(--shadow-3d-card)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            animation: 'bubbleFloatIn 0.35s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--btn-sage)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--main-heading)', letterSpacing: '0.3px', fontFamily: 'var(--font-body)' }}>
                  Pre-Emptive Warm-up
                </span>
              </div>
              <span className="calm-pill-terracotta" style={{ fontSize: '0.70rem', padding: '2px 8px' }}>
                {warmupComplete ? 'Calibrated' : `${warmupTimer}s Countdown`}
              </span>
            </div>

            {!warmupComplete ? (
              <div>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.80rem', color: 'var(--body-text)', lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>
                  Centering nervous system before session starts:
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 10,
                  backgroundColor: 'var(--primary-tint)', border: '1px solid rgba(82, 98, 87, 0.15)'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--btn-sage)' }}>
                    Box Breathing Rhythm
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-terracotta)' }}>
                    • {breathingPhase}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '8px 12px', borderRadius: 10,
                backgroundColor: 'var(--primary-tint)', border: '1px solid var(--btn-sage)',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <CheckCircle2 size={15} color="var(--btn-sage)" />
                <span style={{ fontSize: '0.76rem', color: 'var(--btn-sage)', fontWeight: 700 }}>
                  Baseline calibrated. You are ready to start.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Checklist & Status Panel */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>

          {/* Device Controls */}
          <div className="calm-sub-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={sectionLabel}>Device Controls</p>
            {[
              { label: 'Microphone', active: micOn, toggle: toggleMic, on: 'Mute', off: 'Unmute', icon: micOn ? Mic : MicOff },
              { label: 'Camera', active: camOn, toggle: toggleCam, on: 'Turn Off', off: 'Turn On', icon: camOn ? Video : VideoOff },
            ].map(d => {
              const IconComp = d.icon;
              return (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      backgroundColor: d.active ? 'var(--primary-tint)' : '#F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <IconComp size={16} color={d.active ? 'var(--btn-sage)' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--main-heading)' }}>{d.label}</div>
                      <div style={{ fontSize: 11, color: d.active ? 'var(--btn-sage)' : 'var(--accent-terracotta)', fontWeight: 600 }}>
                        {d.active ? 'Active' : 'Muted / Off'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={d.toggle}
                    className="btn-secondary-spec"
                    style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                  >
                    {d.active ? d.on : d.off}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Readiness Checklist */}
          <div className="calm-sub-card" style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <p style={sectionLabel}>Readiness Checklist</p>
            {checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, backgroundColor: item.done ? 'var(--btn-sage)' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.done && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1.5 4l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span style={{ fontSize: 12.5, color: item.done ? 'var(--main-heading)' : 'var(--text-muted)', fontWeight: item.done ? 700 : 500 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Session Details */}
          <div className="calm-sub-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={sectionLabel}>Session Configuration</p>
            {details.map(d => (
              <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                <span style={{ fontSize: 12.5, color: 'var(--body-text)', fontWeight: 500 }}>{d.key}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--main-heading)' }}>{d.val}</span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto', paddingTop: '8px' }}>
            <button
              onClick={handleEnter}
              className="btn-primary-spec"
              style={{
                width: '100%',
                padding: '13px 18px',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 10,
                justifyContent: 'center',
                boxShadow: 'var(--shadow-3d-btn)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Play size={16} fill="currentColor" /> Enter Interview Room
            </button>
            <button
              onClick={handleBack}
              className="btn-secondary-spec"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 10,
                justifyContent: 'center'
              }}
            >
              Back to Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionLabel = { fontSize: 11, fontWeight: 800, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 4px', fontFamily: 'var(--font-body)' };
