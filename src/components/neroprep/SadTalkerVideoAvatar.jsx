import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Video, Volume2, UserCheck, RefreshCw } from 'lucide-react';

export const SADTALKER_PERSONAS = [
  {
    id: 'maya_hr',
    name: 'Maya (HR Talent Lead)',
    role: 'HR & Cultural Fit Specialist',
    gender: 'female',
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-business-woman-talking-at-a-conference-video-call-42792-large.mp4'
  },
  {
    id: 'alex_tech',
    name: 'Alex (Technical Specialist)',
    role: 'Full Stack & DSA Examiner',
    gender: 'male',
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-having-a-video-call-in-front-of-his-laptop-42805-large.mp4'
  },
  {
    id: 'daniel_architect',
    name: 'Daniel (System Architect)',
    role: 'System Design & High Scale Lead',
    gender: 'male',
    posterUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-businessman-in-suit-having-a-video-call-42820-large.mp4'
  },
  {
    id: 'sarah_manager',
    name: 'Sarah (Engineering Manager)',
    role: 'Behavioral & Leadership Evaluator',
    gender: 'female',
    posterUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-sitting-on-a-desk-talking-on-a-video-call-42813-large.mp4'
  }
];

export default function SadTalkerVideoAvatar({
  aiStatus = 'speaking', // 'speaking' | 'listening' | 'thinking' | 'connecting'
  isEmpathyActive = false,
  spokenText = '',
  trackId = 'hr',
  width = '100%',
  height = '100%'
}) {
  const videoRef = useRef(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState(() => {
    if (trackId === 'tech' || trackId === 'dsa') return 'alex_tech';
    if (trackId === 'system_design') return 'daniel_architect';
    if (trackId === 'managerial' || trackId === 'behavioral') return 'sarah_manager';
    return 'maya_hr';
  });

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const activePersona = SADTALKER_PERSONAS.find(p => p.id === selectedPersonaId) || SADTALKER_PERSONAS[0];

  // Control video playback based on AI state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (aiStatus === 'speaking') {
      video.playbackRate = 1.0;
      video.play().catch(() => {});
    } else if (aiStatus === 'listening') {
      // Subtly slowed idle playback for natural listening nods & blinks
      video.playbackRate = 0.5;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [aiStatus]);

  return (
    <div style={{
      width,
      height,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '14px',
      backgroundColor: '#1E2420',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* ── SadTalker Video Element ── */}
      <video
        ref={videoRef}
        src={activePersona.videoUrl}
        poster={activePersona.posterUrl}
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
          filter: isEmpathyActive ? 'contrast(1.05) saturate(1.1)' : 'contrast(1.02)'
        }}
      />

      {/* ── Photorealistic Poster Fallback if network stream delayed ── */}
      {(!videoLoaded || videoError) && (
        <img
          src={activePersona.posterUrl}
          alt={activePersona.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}

      {/* ── Live State Overlay Pill ── */}
      <div style={{
        position: 'absolute',
        bottom: '6px',
        left: '6px',
        zIndex: 10,
        backgroundColor: 'rgba(30, 36, 32, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '6px',
        padding: '2px 6px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: aiStatus === 'speaking' ? 'var(--btn-sage)' : (isEmpathyActive ? '#D97706' : '#9CA3AF'),
          animation: aiStatus === 'speaking' ? 'pulse 1.2s infinite' : 'none'
        }} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#FAF8F5', letterSpacing: '0.2px' }}>
          SadTalker HD
        </span>
      </div>

      {/* ── Subtle Active Speaking Wave ── */}
      {aiStatus === 'speaking' && (
        <div style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          zIndex: 10,
          backgroundColor: 'rgba(82, 98, 87, 0.9)',
          borderRadius: '6px',
          padding: '2px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <Volume2 size={11} color="#FFFFFF" />
          <span style={{ fontSize: '9px', fontWeight: 800, color: '#FFFFFF' }}>TALKING</span>
        </div>
      )}
    </div>
  );
}
