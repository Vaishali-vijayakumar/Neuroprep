import React from 'react';
import useInterviewStore from '../../store/interviewStore';
import { StressScorer } from './engines/StressScorer';

let scorerInstance = null;
try {
  scorerInstance = new StressScorer();
} catch (e) {
  console.warn('[SidePanel] StressScorer init:', e);
}

// ── Monochrome formatting helpers ────────────────────────────────────────────
const BLACK  = '#111111';
const GREY   = '#6B7280';
const BORDER = '#E5E7EB';
const BG     = '#FAFAFA';

export default function SidePanel({
  faceTelemetry = {},
  audioMetrics = {},
  vocalAnalysis = null,
  userAnswerText = '',
  interimText = '',
  onSendAnswer = () => {},
  aiStatus = 'listening',
  elapsedSeconds = 0,
}) {
  const stressIndex = useInterviewStore((s) => s.stressIndex) || 0;
  const transcript  = useInterviewStore((s) => s.transcript) || [];

  const {
    faceDetected  = false,
    stressScore   = 0,
    cognitiveLoad = null,
    headPose      = 'forward',
  } = faceTelemetry || {};

  const { volume = 0, wpm = 0, isVoice = false } = audioMetrics || {};

  const hasStressData = faceDetected && stressScore > 0;
  let stress = null;
  if (hasStressData && scorerInstance?.getLabel) {
    try {
      stress = scorerInstance.getLabel(stressScore);
    } catch (_) {}
  }

  // Calculate Cognitive Load bar percentage (0-100)
  const loadPct = hasStressData ? Math.min(100, Math.max(10, Number(stressScore) || 0)) : 35;

  // Live text stream from candidate
  const userLines = Array.isArray(transcript) ? transcript.filter(t => t && t.role === 'user') : [];
  const lastUserText = userLines.length > 0 ? userLines[userLines.length - 1]?.text : '';
  const liveText = userAnswerText || interimText || lastUserText || '';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      backgroundColor: '#FFFFFF', borderLeft: `1px solid ${BORDER}`,
      fontFamily: 'var(--font-inter)', overflow: 'hidden',
    }}>

      {/* ── 1. COGNITIVE LOAD PANEL ───────────────────────────────────────── */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Cognitive Load
          </span>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
            backgroundColor: BLACK, color: '#FFFFFF',
          }}>
            {cognitiveLoad ? `${cognitiveLoad} Load` : stress ? stress.label : 'Focused'}
          </span>
        </div>

        {/* Load Meter Bar: Calm --- ● --- High */}
        <div style={{ position: 'relative', margin: '12px 0 6px 0' }}>
          <div style={{ backgroundColor: '#E5E7EB', height: '6px', borderRadius: '3px', width: '100%' }}>
            <div style={{
              width: `${loadPct}%`, height: '100%', borderRadius: '3px',
              backgroundColor: BLACK, transition: 'width 0.5s ease',
            }} />
          </div>
          {/* Active Marker Dot */}
          <div style={{
            position: 'absolute', top: '-4px', left: `calc(${loadPct}% - 7px)`,
            width: '14px', height: '14px', borderRadius: '50%',
            backgroundColor: BLACK, border: '2px solid #FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left 0.5s ease',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: GREY, fontWeight: 600 }}>
          <span>Calm</span>
          <span>Focused</span>
          <span>High</span>
        </div>

        {/* Telemetry rows */}
        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: '10px', color: GREY, display: 'block', fontWeight: 600 }}>Speech Pace</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: BLACK }}>
              {wpm > 180 ? 'Fast' : wpm > 0 && wpm < 80 ? 'Slow' : wpm > 0 ? 'Normal' : '—'}
            </span>
          </div>
          <div style={{ padding: '8px 10px', backgroundColor: BG, borderRadius: '6px', border: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: '10px', color: GREY, display: 'block', fontWeight: 600 }}>Head Alignment</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: BLACK }}>
              {headPose === 'forward' ? 'Center' : headPose || 'Center'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. INTERVIEW INTELLIGENCE PANEL ───────────────────────────────── */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 10px 0' }}>
          Interview Intelligence
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Voice Status',  value: isVoice ? 'Speaking' : 'Listening' },
            { label: 'Speech WPM',    value: wpm > 0 ? `${wpm} wpm` : '—' },
            { label: 'Difficulty',    value: 'Adaptive' },
            { label: 'Mode',          value: aiStatus === 'speaking' ? 'AI Turn' : 'Candidate Turn' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: GREY }}>{label}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: BLACK }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. ADAPTIVE INTERVIEW INDICATOR ───────────────────────────────── */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, backgroundColor: BG }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: BLACK, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Adaptive Engine
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: GREY }}>Level 3</span>
        </div>
        <p style={{ fontSize: '11px', color: GREY, margin: 0, lineHeight: 1.4 }}>
          Questions adapt dynamically based on your previous answers and code logic.
        </p>
      </div>

      {/* ── 4. LIVE TRANSCRIPT (NO CHAT UI) ───────────────────────────────── */}
      <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Live Transcript
          </span>
          {isVoice && (
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
              backgroundColor: BLACK, color: '#FFFFFF',
            }}>
              Live
            </span>
          )}
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px', borderRadius: '6px',
          backgroundColor: BG, border: `1px solid ${BORDER}`,
          fontSize: '12.5px', lineHeight: 1.6, color: BLACK,
          fontFamily: 'var(--font-inter)',
        }}>
          {liveText ? (
            <p style={{ margin: 0 }}>{liveText}</p>
          ) : (
            <p style={{ margin: 0, color: GREY, fontStyle: 'italic', fontSize: '12px' }}>
              Speak into your microphone. Your live spoken response will be transcribed here.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
