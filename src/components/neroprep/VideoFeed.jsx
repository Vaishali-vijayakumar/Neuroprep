import React, { useEffect, useRef } from 'react';

export default function VideoFeed({ stream, muted = false, style = {}, onVideoReady }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      onVideoReady?.(videoRef.current);
    }
  }, [stream]);

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
