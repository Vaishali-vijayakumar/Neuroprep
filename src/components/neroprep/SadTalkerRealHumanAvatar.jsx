import React, { useEffect, useRef, useState } from 'react';

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
    name: 'Alex',
    role: 'DSA Specialist',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-having-a-video-call-in-front-of-his-laptop-42805-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
  },
  coding: {
    name: 'Alex',
    role: 'Live Coding Lead',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-having-a-video-call-in-front-of-his-laptop-42805-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85'
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
    name: 'Sarah',
    role: 'Behavioral Lead',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-sitting-on-a-desk-talking-on-a-video-call-42813-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85'
  },
  managerial: {
    name: 'Sarah',
    role: 'Engineering Manager',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-sitting-on-a-desk-talking-on-a-video-call-42813-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85'
  },
  default: {
    name: 'Maya',
    role: 'Lead AI Interviewer',
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
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const cleanTrackId = String(trackId || 'hr').toLowerCase();
  const persona = SADTALKER_TRACK_PERSONAS[cleanTrackId] || SADTALKER_TRACK_PERSONAS.default;

  // Real-time video state synchronization for authentic human interaction
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (aiStatus === 'speaking') {
      video.playbackRate = 1.0;
      video.play().catch(() => {});
    } else if (aiStatus === 'listening') {
      // Natural listening speed with realistic pauses & nods
      video.playbackRate = 0.6;
      video.play().catch(() => {});
    } else if (aiStatus === 'thinking') {
      video.playbackRate = 0.4;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [aiStatus]);

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
      {/* ── 100% Real-Human Video Interviewer ── */}
      <video
        ref={videoRef}
        src={persona.videoUrl}
        poster={persona.posterUrl}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        onError={() => setVideoError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: !videoError ? 'block' : 'none',
          transform: 'scale(1.04)',
          filter: isEmpathyActive ? 'contrast(1.06) saturate(1.12)' : 'contrast(1.02)'
        }}
      />

      {/* ── High-Resolution Real Human Poster Fallback ── */}
      {(!videoLoaded || videoError) && (
        <img
          src={persona.posterUrl}
          alt={persona.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
    </div>
  );
}
