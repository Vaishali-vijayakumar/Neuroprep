import React, { useEffect, useRef, useState } from 'react';

/**
 * Dual-state royalty-free ($0) real-human video interviewer personas.
 * - `videoUrl`: plays with smooth crossfade when `aiStatus === 'speaking'`
 * - `idleVideoUrl` (optional): plays when listening/thinking; if omitted,
 *   crossfades cleanly to an animated lifelike breathing portrait (`posterUrl`)
 *   so the interviewer never mouths words while the candidate is speaking.
 */
export const SADTALKER_TRACK_PERSONAS = {
  hr: {
    name: 'Maya',
    role: 'HR Talent Lead',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-business-woman-talking-at-a-conference-video-call-42792-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  },
  tech: {
    name: 'Alex',
    role: 'Technical Specialist',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-having-a-video-call-in-front-of-his-laptop-42805-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
  },
  dsa: {
    name: 'Aria',
    role: 'DSA Evaluator',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-business-woman-talking-at-a-conference-video-call-42792-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  },
  coding: {
    name: 'Aria',
    role: 'Live Coding Lead',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-business-woman-talking-at-a-conference-video-call-42792-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  },
  system_design: {
    name: 'Daniel',
    role: 'System Architect',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-businessman-in-suit-having-a-video-call-42820-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85'
  },
  lld: {
    name: 'Daniel',
    role: 'LLD Specialist',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-businessman-in-suit-having-a-video-call-42820-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85'
  },
  behavioral: {
    name: 'Maya',
    role: 'Behavioral Evaluator',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-sitting-on-a-desk-talking-on-a-video-call-42813-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85'
  },
  managerial: {
    name: 'Sarah',
    role: 'Engineering Manager',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-sitting-on-a-desk-talking-on-a-video-call-42813-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85'
  },
  project: {
    name: 'Alex',
    role: 'Project Viva Examiner',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-having-a-video-call-in-front-of-his-laptop-42805-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
  },
  resume: {
    name: 'Sarah',
    role: 'Resume Examiner',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-sitting-on-a-desk-talking-on-a-video-call-42813-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85'
  },
  stress: {
    name: 'Victor',
    role: 'Stress Interviewer',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-businessman-in-suit-having-a-video-call-42820-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85'
  },
  ai_ml: {
    name: 'Nova',
    role: 'AI / ML Specialist',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-business-woman-talking-at-a-conference-video-call-42792-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  },
  cybersecurity: {
    name: 'Cipher',
    role: 'Security Architect',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-having-a-video-call-in-front-of-his-laptop-42805-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
  },
  cloud: {
    name: 'Marcus',
    role: 'Cloud Architect',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-businessman-in-suit-having-a-video-call-42820-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85'
  },
  devops: {
    name: 'Soren',
    role: 'DevOps Engineer',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-having-a-video-call-in-front-of-his-laptop-42805-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
  },
  default: {
    name: 'Morgan',
    role: 'AI Interviewer',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-business-woman-talking-at-a-conference-video-call-42792-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85'
  }
};

export default function SadTalkerRealHumanAvatar({
  aiStatus = 'speaking', // 'speaking' | 'listening' | 'thinking' | 'connecting'
  isEmpathyActive = false,
  spokenText = '',
  trackId = 'hr',
  width = '100%',
  height = '100%'
}) {
  const speakingVideoRef = useRef(null);
  const idleVideoRef = useRef(null);
  const [speakingLoaded, setSpeakingLoaded] = useState(false);
  const [speakingError, setSpeakingError] = useState(false);
  const [idleError, setIdleError] = useState(false);

  const cleanTrackId = String(trackId || 'hr').toLowerCase();
  const persona = SADTALKER_TRACK_PERSONAS[cleanTrackId] || SADTALKER_TRACK_PERSONAS.default;
  const isSpeaking = aiStatus === 'speaking';
  const hasIdleVideo = Boolean(persona.idleVideoUrl) && !idleError;

  // Sync dual-state video playback without slow-motion mouthing during listening
  useEffect(() => {
    const speakVid = speakingVideoRef.current;
    const idleVid = idleVideoRef.current;

    if (speakVid) {
      speakVid.muted = true;
      speakVid.volume = 0;
      if (isSpeaking) {
        speakVid.playbackRate = 1.0;
        speakVid.play().catch(() => {});
      } else {
        speakVid.pause();
      }
    }

    if (idleVid && hasIdleVideo) {
      idleVid.muted = true;
      idleVid.volume = 0;
      if (!isSpeaking && aiStatus !== 'connecting') {
        idleVid.playbackRate = 0.9;
        idleVid.play().catch(() => {});
      } else {
        idleVid.pause();
      }
    }
  }, [aiStatus, isSpeaking, hasIdleVideo]);

  const filterStyle = isEmpathyActive
    ? 'contrast(1.06) saturate(1.12)'
    : 'contrast(1.02)';

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#1E2420',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <style>{`
        @keyframes avatarIdleBreathe {
          0%, 100% { transform: scale(1.03) translateY(0px); }
          50% { transform: scale(1.055) translateY(-1px); }
        }
        @keyframes avatarVoiceBar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>

      {/* ── Layer 1: Attentive Idle / Listening State (Poster or Idle Clip) ── */}
      {hasIdleVideo ? (
        <video
          ref={idleVideoRef}
          src={persona.idleVideoUrl}
          poster={persona.posterUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setIdleError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: !isSpeaking ? 1 : 0,
            transition: 'opacity 0.35s ease',
            transform: 'scale(1.04)',
            filter: filterStyle
          }}
        />
      ) : (
        <img
          src={persona.posterUrl}
          alt={persona.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: filterStyle,
            animation: !isSpeaking ? 'avatarIdleBreathe 4.5s ease-in-out infinite' : 'none',
            transform: 'scale(1.04)'
          }}
        />
      )}

      {/* ── Layer 2: Active Speaking Video (Crossfades in only when speaking) ── */}
      {!speakingError && (
        <video
          ref={speakingVideoRef}
          src={persona.videoUrl}
          poster={persona.posterUrl}
          loop
          muted
          playsInline
          onLoadedData={() => setSpeakingLoaded(true)}
          onError={() => setSpeakingError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isSpeaking && speakingLoaded ? 1 : 0,
            transition: 'opacity 0.35s ease',
            transform: 'scale(1.04)',
            filter: filterStyle
          }}
        />
      )}

      {/* ── Layer 3: Subtle Live Activity Indicator (Voice Bars / Listening Dot) ── */}
      <div
        aria-label={isSpeaking ? 'Interviewer speaking' : `Interviewer ${aiStatus}`}
        style={{
          position: 'absolute',
          bottom: '6px',
          right: '6px',
          padding: '3px 6px',
          borderRadius: '999px',
          background: 'rgba(17, 24, 20, 0.72)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          gap: '2.5px',
          pointerEvents: 'none'
        }}
      >
        {isSpeaking ? (
          <>
            <span style={{ width: '2.5px', background: '#6EE7B7', borderRadius: '2px', animation: 'avatarVoiceBar 0.55s ease-in-out infinite' }} />
            <span style={{ width: '2.5px', background: '#6EE7B7', borderRadius: '2px', animation: 'avatarVoiceBar 0.45s ease-in-out 0.15s infinite' }} />
            <span style={{ width: '2.5px', background: '#6EE7B7', borderRadius: '2px', animation: 'avatarVoiceBar 0.6s ease-in-out 0.3s infinite' }} />
          </>
        ) : (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: aiStatus === 'thinking' ? '#FBBF24' : '#93C5FD'
            }}
          />
        )}
      </div>
    </div>
  );
}
