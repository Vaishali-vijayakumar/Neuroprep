import React, { useEffect, useRef } from 'react';

export default function VideoFeed({ stream, muted = false, style = {}, onVideoReady }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    
    // Explicitly invoke play() to satisfy browser autoplay requirements
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[VideoFeed] Autoplay notice (safe fallback):', err.message);
      });
    }

    const handleReady = () => {
      if (video.videoWidth > 0 || video.readyState >= 2) {
        onVideoReady?.(video);
      }
    };

    video.addEventListener('loadedmetadata', handleReady);
    video.addEventListener('canplay', handleReady);
    video.addEventListener('playing', handleReady);

    // Initial check in case stream was already loaded
    if (video.readyState >= 2) {
      handleReady();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleReady);
      video.removeEventListener('canplay', handleReady);
      video.removeEventListener('playing', handleReady);
    };
  }, [stream, onVideoReady]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      style={{ display: 'block', ...style }}
    />
  );
}
