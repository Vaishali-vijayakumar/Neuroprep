import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useMediaStream — Custom hook that manages camera and microphone streams.
 * Camera and mic are MANDATORY for all interview tracks.
 */
export default function useMediaStream() {
  const [stream, setStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('idle'); // idle | requesting | granted | denied | error
  const [errorMessage, setErrorMessage] = useState('');
  const streamRef = useRef(null);

  const requestPermissions = useCallback(async () => {
    setPermissionStatus('requesting');
    setErrorMessage('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionStatus('granted');
    } catch (err) {
      setPermissionStatus('denied');
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Camera and microphone access was denied. Please allow permissions in your browser settings and try again.');
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('No camera or microphone was found. Please connect a device and try again.');
      } else {
        setErrorMessage(`Could not access media devices: ${err.message}`);
      }
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setMicEnabled(prev => !prev);
    }
  }, []);

  const toggleCam = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setCamEnabled(prev => !prev);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
      setPermissionStatus('idle');
    }
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    stream,
    micEnabled,
    camEnabled,
    permissionStatus,
    errorMessage,
    requestPermissions,
    toggleMic,
    toggleCam,
    stopStream,
  };
}
