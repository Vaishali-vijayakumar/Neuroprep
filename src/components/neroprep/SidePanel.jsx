import React, { useState, useEffect, useRef } from 'react';
import useInterviewStore from '../../store/interviewStore';
import { StressScorer } from './engines/StressScorer';

let scorerInstance = null;
try { scorerInstance = new StressScorer(); } catch (_) {}

const BLACK  = '#111111';
const GREY   = '#6B7280';
const BORDER = '#E5E7EB';
const BG     = '#FAFAFA';

// Spark-line micro chart (last 20 values)
function SparkLine({ values = [], color = '#526257', height = 24 }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 100 ${height}`} style={{ width: '100%', height: `${height}px`, display: 'block' }}
      preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Animated gauge ring
function GaugeRing({ value = 0, size = 52, color = '#526257', label = '', sub = '' }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(100, Math.max(0, value));
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
          style={{ fill: color, fontSize: '11px', fontWeight: 800, fontFamily: 'monospace',
                   transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}>
          {pct}%
        </text>
      </svg>
      <span style={{ fontSize: '9px', fontWeight: 700, color: GREY, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
      {sub && <span style={{ fontSize: '8px', color: '#9CA3AF', textAlign: 'center' }}>{sub}</span>}
    </div>
  );
}

export default function SidePanel({
  faceTelemetry     = {},
  audioMetrics      = {},
  vocalAnalysis     = null,
  userAnswerText    = '',
  interimText       = '',
  onSendAnswer      = () => {},
  aiStatus          = 'listening',
  elapsedSeconds    = 0,
  tabSwitchCount    = 0,
  liveDistractionScore = 0,
}) {
  const [focusMode, setFocusMode]   = useState(false);
  const [hrHistory,  setHrHistory]  = useState([72]);
  const [hrvHistory, setHrvHistory] = useState([48]);
  const [fearHistory, setFearHistory] = useState([12]);
  const [stressHistory, setStressHistory] = useState([22]);
  const [blinkAnim, setBlinkAnim]   = useState(false);
  const lastBlinkRef = useRef(0);

  const config     = useInterviewStore((s) => s.config);
  const storeStress = useInterviewStore((s) => s.stressIndex) || 0;
  const transcript = useInterviewStore((s) => s.transcript) || [];
  const lastRubric = useInterviewStore((s) => s.lastRubric);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  };

  // Append HR, HRV, fear, stress to history rings every time telemetry changes
  useEffect(() => {
    if (faceTelemetry?.hrBpm != null) {
      setHrHistory(h  => [...h.slice(-19), faceTelemetry.hrBpm]);
    }
    if (faceTelemetry?.hrvMs != null) {
      setHrvHistory(h => [...h.slice(-19), faceTelemetry.hrvMs]);
    }
    if (faceTelemetry?.fearScore != null) {
      setFearHistory(h => [...h.slice(-19), faceTelemetry.fearScore]);
    }
    if (faceTelemetry?.stressScore != null) {
      setStressHistory(h => [...h.slice(-19), faceTelemetry.stressScore]);
    }
    // Blink animation
    const blinkRate = faceTelemetry?.blinkRate || 0;
    const now = Date.now();
    if (blinkRate > lastBlinkRef.current && now - (lastBlinkRef._t || 0) > 400) {
      lastBlinkRef._t = now;
      setBlinkAnim(true);
      setTimeout(() => setBlinkAnim(false), 220);
    }
    lastBlinkRef.current = blinkRate;
  }, [faceTelemetry]);

  // Destructure live values
  const {
    faceDetected    = false,
    stressScore     = 22,
    headPose        = 'forward',
    isLookingDown   = false,
    eyeContact      = 92,
    blinkRate       = 14,
    fearScore       = 12,
    facialStressScore = 14,
    hrBpm           = 72,
    hrvMs           = 48,
    primaryEmotion  = 'Calm',
    cognitiveLoad   = 'Optimal',
    maskedPanicDetected = false,
    phoneAlerts     = 0,
    phoneReadingDetected = false,
    phoneAlertReason = '',
    phoneDistractionScore = 0,
    baselineCalibration = { isCalibrated: false, progress: 0, baseline: { hr: 72, hrv: 45 } },
    stressMarkers   = [],
  } = faceTelemetry || {};

  const { volume = 0, wpm = 0, isVoice = false } = audioMetrics || {};

  // Fused score
  let fusedScore = stressScore || storeStress || 22;
  if (scorerInstance) {
    try {
      scorerInstance.updateFace({ faceDetected, stressScore, fearScore, headPose, isLookingDown, eyeContact, blinkRate });
      const res = scorerInstance.updateAudio({ volume, wpm, isVoice });
      if (res?.score > 0) fusedScore = res.score;
    } catch (_) {}
  }

  const loadPct   = Math.min(100, Math.max(5, fusedScore));
  const isHigh    = fusedScore >= 55 || fearScore >= 55;
  const isMedium  = !isHigh && (fusedScore >= 28 || fearScore >= 28);
  const loadColor = isHigh ? '#DC2626' : isMedium ? '#D97706' : '#526257';
  const loadLabel = isHigh ? 'High' : isMedium ? 'Moderate' : 'Low';

  // Baseline display
  const calProgress = baselineCalibration?.isCalibrated || elapsedSeconds >= 45
    ? 100
    : Math.max(
        baselineCalibration?.progress || 0,
        Math.min(99, Math.round((elapsedSeconds / 45) * 100))
      );
  const isCalibrated = baselineCalibration?.isCalibrated || elapsedSeconds >= 45;

  // HR color
  const hrColor  = hrBpm > 100 ? '#DC2626' : hrBpm > 88 ? '#D97706' : BLACK;
  const fearColor = fearScore >= 55 ? '#DC2626' : fearScore >= 35 ? '#D97706' : '#526257';

  // Transcript
  const currentLive = (userAnswerText || interimText || '').trim();
  const userLines   = transcript.filter(t => t?.role === 'user');
  const lastText    = userLines.length > 0 ? userLines[userLines.length - 1]?.text : '';
  const liveText    = currentLive || lastText || '';

  const isHrTrack = String(config?.trackId || '').toLowerCase() === 'hr';
  const lower = liveText.toLowerCase();
  const star  = {
    hasSituation: /\b(when|in my|during|at my|previous|project was|client|scenario|situation|context|background)\b/i.test(lower),
    hasTask:      /\b(my role|my task|responsibility|responsible for|objective|goal|needed to|assigned to|duty)\b/i.test(lower),
    hasAction:    /\b(i developed|i implemented|i led|i created|i resolved|i analyzed|i proposed|i coordinated|i decided|i communicated|i designed|i took|i stepped)\b/i.test(lower),
    hasResult:    /\b(result|outcome|increased|reduced|improved|percent|%|saved|delivered|achieved|learned|launched|impact)\b/i.test(lower),
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(168deg, rgba(254,252,250,0.97) 0%, rgba(246,240,234,0.93) 100%)',
      borderLeft: `1px solid ${BORDER}`, fontFamily: 'var(--font-body)', overflow: 'hidden',
    }}>

      {/* ── HEADER ─── */}
      <div style={{
        padding: '12px 16px', borderBottom: `1px solid ${BORDER}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFFFFF',
      }}>
        <div>
          <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block' }}>
            {config?.trackName || 'Interview Track'}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--main-heading)' }}>
            Session Monitor
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Tab Switch Badge */}
          {tabSwitchCount > 0 && (
            <span style={{
              fontSize: '10px', fontWeight: 800,
              padding: '2px 7px', borderRadius: '10px',
              backgroundColor: tabSwitchCount >= 3 ? '#FEF2F2' : '#FFF7ED',
              color: tabSwitchCount >= 3 ? '#DC2626' : '#D97706',
              border: `1px solid ${tabSwitchCount >= 3 ? '#FCA5A5' : '#FDE68A'}`,
            }}>
              🔴 {tabSwitchCount} Tab Switch{tabSwitchCount > 1 ? 'es' : ''}
            </span>
          )}

          {/* View Toggle */}
          <button
            type="button"
            onClick={() => setFocusMode(!focusMode)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 9px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: focusMode ? '#F0FDF4' : '#F3F4F6',
              color: focusMode ? '#166534' : '#374151',
              border: `1px solid ${focusMode ? '#BBF7D0' : '#D1D5DB'}`,
              transition: 'all 0.15s ease',
            }}
          >
            {focusMode ? '🛡️ Focus' : '⚙️ Proctor'}
          </button>
        </div>
      </div>

      {focusMode ? (
        /* ───────────────────────── FOCUS VIEW ───────────────────────── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Mic Activity */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Microphone
              </span>
              <span style={{ fontSize: '11px', color: GREY, fontWeight: 600 }}>{formatTime(elapsedSeconds)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: '8px', backgroundColor: BG, border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '16px' }}>
                  {[10,14,8,12].map((h,i) => {
                    const b = isVoice && volume > 8;
                    return (
                      <div key={i} style={{
                        width: '3px', borderRadius: '2px',
                        height: b ? `${Math.min(16, Math.max(4, (volume/100)*h*1.5))}px` : '3px',
                        backgroundColor: b ? 'var(--btn-sage)' : '#D1D5DB',
                        transition: 'height 0.1s ease',
                      }} />
                    );
                  })}
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--main-heading)' }}>
                    {aiStatus === 'speaking' ? 'Interviewer Speaking' : isVoice ? 'You are speaking' : 'Listening…'}
                  </div>
                  <div style={{ fontSize: '10px', color: GREY }}>
                    {isVoice ? `${wpm > 0 ? wpm : 138} WPM` : 'Mic active'}
                  </div>
                </div>
              </div>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: aiStatus === 'speaking' ? '#F59E0B' : isVoice ? '#10B981' : '#9CA3AF',
                boxShadow: isVoice ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
              }} />
            </div>
          </div>

          {/* Live transcript */}
          <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: GREY, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Live Speech
              </span>
              {isVoice && (
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
                  backgroundColor: '#111827', color: '#FFF' }}>● LIVE</span>
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', borderRadius: '8px',
              backgroundColor: '#FFF', border: `1px solid ${BORDER}`, fontSize: '12.5px',
              lineHeight: 1.6, color: 'var(--main-heading)' }}>
              {liveText
                ? <p style={{ margin: 0 }}>{liveText}</p>
                : <p style={{ margin: 0, color: GREY, fontStyle: 'italic', fontSize: '12px' }}>
                    Speak into your microphone — your response appears here in real time.
                  </p>
              }
            </div>
            <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '8px',
              backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: '#475569' }}>
              <span style={{ fontSize: '12px' }}>🔒</span>
              <span><strong>Secured:</strong> Rubrics, STAR breakdown &amp; biometrics compiled post-session.</span>
            </div>
          </div>
        </div>

      ) : (
        /* ───────────────────────── PROCTOR VIEW ───────────────────────── */
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* ── COGNITIVE LOAD ── */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: GREY, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Cognitive Load
              </span>
              <span style={{
                fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                backgroundColor: isHigh ? '#FEF2F2' : isMedium ? '#FFF7ED' : '#F0FDF4',
                color: loadColor, border: `1px solid ${isHigh ? '#FCA5A5' : isMedium ? '#FDE68A' : '#BBF7D0'}`,
                transition: 'all 0.3s ease',
              }}>
                {phoneReadingDetected ? '🚨 Phone Alert' : `${loadLabel} — ${cognitiveLoad}`}
              </span>
            </div>

            {/* Load Bar */}
            <div style={{ position: 'relative', margin: '10px 0 4px 0' }}>
              <div style={{ backgroundColor: '#E5E7EB', height: '6px', borderRadius: '3px' }}>
                <div style={{
                  width: `${loadPct}%`, height: '100%', borderRadius: '3px',
                  backgroundColor: loadColor, transition: 'width 0.5s ease, background-color 0.3s ease',
                }} />
              </div>
              <div style={{
                position: 'absolute', top: '-5px', left: `calc(${loadPct}% - 7px)`,
                width: '14px', height: '14px', borderRadius: '50%',
                backgroundColor: loadColor, border: '2px solid #FFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: GREY, fontWeight: 600 }}>
              <span>Calm</span><span>Focused</span>
              <span style={{ color: isHigh ? loadColor : GREY }}>High Load</span>
            </div>

            {/* Masked Panic Alert */}
            {maskedPanicDetected && (
              <div style={{ marginTop: '8px', padding: '7px 10px', borderRadius: '6px',
                backgroundColor: '#FEF2F2', border: '1px solid #F87171',
                display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ fontSize: '13px' }}>⚠️</span>
                <div>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#991B1B', display: 'block' }}>
                    Masked Anxiety Detected
                  </span>
                  <span style={{ fontSize: '9.5px', color: '#B91C1C', lineHeight: 1.3, display: 'block' }}>
                    Forced smile masking autonomic surge — safety floor active
                  </span>
                </div>
              </div>
            )}

            {/* 4-Metric Telemetry Grid */}
            <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>

              {/* Facial Emotion */}
              <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '9.5px', color: GREY, display: 'block', fontWeight: 600, marginBottom: '2px' }}>
                  Facial Emotion
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800,
                  color: fearScore >= 55 ? '#DC2626' : fearScore >= 35 ? '#D97706' : '#166534' }}>
                  {primaryEmotion}
                </span>
                <div style={{ marginTop: '4px' }}>
                  <SparkLine values={fearHistory} color={fearColor} height={18} />
                </div>
              </div>

              {/* Fear & Stress */}
              <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '9.5px', color: GREY, display: 'block', fontWeight: 600, marginBottom: '2px' }}>
                  Fear &amp; Stress
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: fearColor }}>
                  {fearScore}% fear
                </span>
                <div style={{ fontSize: '10px', color: GREY, marginTop: '1px' }}>
                  {facialStressScore}% strain
                </div>
                <div style={{ marginTop: '4px' }}>
                  <SparkLine values={stressHistory} color={loadColor} height={18} />
                </div>
              </div>

              {/* Heart Rate & HRV */}
              <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '9.5px', color: GREY, display: 'block', fontWeight: 600, marginBottom: '2px' }}>
                  Heart Rate &amp; HRV
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: hrColor }}>
                  {hrBpm} BPM
                </span>
                <div style={{ fontSize: '10px', color: GREY, marginTop: '1px' }}>
                  HRV {hrvMs}ms RMSSD
                </div>
                <div style={{ marginTop: '4px' }}>
                  <SparkLine values={hrHistory} color={hrColor} height={18} />
                </div>
              </div>

              {/* 45s Baseline */}
              <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '9.5px', color: GREY, display: 'block', fontWeight: 600, marginBottom: '2px' }}>
                  45s Baseline
                </span>
                {isCalibrated ? (
                  <>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#15803D' }}>
                      ✓ Calibrated
                    </span>
                    <div style={{ fontSize: '10px', color: GREY, marginTop: '1px' }}>
                      {baselineCalibration?.baseline?.hr || 72} BPM ref
                    </div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706' }}>
                      Calibrating…
                    </span>
                    {/* Progress bar */}
                    <div style={{ marginTop: '5px', backgroundColor: '#E5E7EB', height: '4px', borderRadius: '2px' }}>
                      <div style={{
                        width: `${calProgress}%`, height: '100%', borderRadius: '2px',
                        backgroundColor: '#D97706', transition: 'width 1s linear',
                      }} />
                    </div>
                    <div style={{ fontSize: '9.5px', color: GREY, marginTop: '2px', textAlign: 'right' }}>
                      {calProgress}%
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── BIOMETRIC GAUGES ── */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: GREY, textTransform: 'uppercase',
              letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
              Live Biometrics
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
              <GaugeRing value={fearScore}    color={fearColor}  label="Fear"     size={54} />
              <GaugeRing value={eyeContact}   color="#526257"    label="Eye"      size={54} sub="contact" />
              <GaugeRing value={Math.min(100, blinkRate * 5)} color="#6B7280" label="Blink"  size={54} sub="rate" />
              <GaugeRing value={liveDistractionScore || 0} color={liveDistractionScore >= 60 ? '#DC2626' : '#D97706'}
                label="Dist." size={54} sub="score" />
            </div>

            {/* Gaze / Head Pose Badge */}
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { label: `Gaze: ${headPose}`, ok: headPose === 'forward' },
                { label: `Face: ${faceDetected ? 'Detected' : 'Lost'}`, ok: faceDetected },
                { label: `Blinks: ${blinkRate}/min`, ok: blinkRate >= 8 && blinkRate <= 22 },
              ].map(({ label, ok }) => (
                <span key={label} style={{
                  fontSize: '9.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px',
                  backgroundColor: ok ? '#F0FDF4' : '#FFF7ED',
                  color: ok ? '#166534' : '#D97706',
                  border: `1px solid ${ok ? '#BBF7D0' : '#FDE68A'}`,
                }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── PROCTORING ALERTS ── */}
          {(tabSwitchCount > 0 || phoneAlerts > 0) && (
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase',
                letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                🚨 Proctoring Alerts
              </span>
              {tabSwitchCount > 0 && (
                <div style={{ padding: '7px 10px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5',
                  borderRadius: '6px', marginBottom: '6px', fontSize: '11px', fontWeight: 700, color: '#991B1B' }}>
                  Tab Switch × {tabSwitchCount}
                  {tabSwitchCount >= 3 && <span style={{ marginLeft: '8px', color: '#B91C1C' }}>⚠️ Session flagged</span>}
                </div>
              )}
              {phoneAlerts > 0 && (
                <div style={{ padding: '7px 10px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5',
                  borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#991B1B' }}>
                  📱 Phone Alert × {phoneAlerts}
                  {phoneAlertReason && (
                    <span style={{ display: 'block', fontSize: '9.5px', color: '#B91C1C', marginTop: '2px', fontWeight: 600 }}>
                      {phoneAlertReason}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STRESS MARKERS ── */}
          {stressMarkers?.length > 0 && (
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: GREY, textTransform: 'uppercase',
                letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Stress Signals
              </span>
              {stressMarkers.map((m, i) => (
                <div key={i} style={{
                  fontSize: '10.5px', color: '#374151', padding: '4px 0',
                  borderBottom: i < stressMarkers.length - 1 ? `1px solid ${BORDER}` : 'none',
                  lineHeight: 1.4,
                }}>
                  {m}
                </div>
              ))}
            </div>
          )}

          {/* ── STAR TRACKER (HR track) ── */}
          {isHrTrack && (
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: GREY, textTransform: 'uppercase',
                letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                STAR Tracker
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px' }}>
                {[
                  { k: 'S', label: 'Situation', covered: star.hasSituation },
                  { k: 'T', label: 'Task',      covered: star.hasTask },
                  { k: 'A', label: 'Action',    covered: star.hasAction },
                  { k: 'R', label: 'Result',    covered: star.hasResult },
                ].map(({ k, label, covered }) => (
                  <div key={k} style={{
                    padding: '6px 4px', borderRadius: '6px', textAlign: 'center',
                    backgroundColor: covered ? '#526257' : '#F3F4F6',
                    color: covered ? '#FFF' : GREY,
                    border: `1px solid ${covered ? '#526257' : BORDER}`,
                    transition: 'all 0.25s ease',
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, display: 'block' }}>{k}</span>
                    <span style={{ fontSize: '8.5px', fontWeight: 600 }}>{covered ? '✓' : label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANSWER EVAL CARD ── */}
          {lastRubric && (
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, color: GREY, textTransform: 'uppercase',
                letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Last Answer Eval
              </span>
              <div style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: BG,
                border: `1px solid ${BORDER}`, fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, color: BLACK }}>{lastRubric.verdict || 'Evaluated'}</span>
                  <span style={{ fontWeight: 800, color: BLACK }}>{lastRubric.overall}/100</span>
                </div>
                {lastRubric.feedback && (
                  <p style={{ margin: 0, color: '#374151', lineHeight: 1.4, fontSize: '10.5px' }}>
                    {lastRubric.feedback}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── LIVE TRANSCRIPT (Proctor) ── */}
          <div style={{ padding: '12px 16px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: GREY, textTransform: 'uppercase',
              letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Live Transcript
            </span>
            <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: BG, border: `1px solid ${BORDER}`,
              fontSize: '11.5px', maxHeight: '120px', overflowY: 'auto', lineHeight: 1.5 }}>
              {liveText || <span style={{ color: GREY, fontStyle: 'italic' }}>Awaiting candidate speech…</span>}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
