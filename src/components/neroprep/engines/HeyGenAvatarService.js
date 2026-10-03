/**
 * HeyGenAvatarService.js — Real-Time Interactive Streaming AI Interviewer
 * Direct HeyGen WebRTC Streaming Engine (Zero-dependency, Full Browser WebRTC)
 * 
 * Features:
 * - Live WebRTC photorealistic streaming avatar video & audio
 * - Real-time lip-synced question delivery (`speak`)
 * - Adaptive candidate reassurance / reactions (`reactToInterviewee`)
 * - Instant speech interruption (`interrupt`)
 * - Clean WebRTC PeerConnection teardown (`stopSession`)
 */

export const HEYGEN_AVATAR_PRESETS = [
  { id: 'josh_lite3_20230714', name: 'Josh (Technical Lead)', role: 'Tech & Architecture Specialist', gender: 'male' },
  { id: 'Wayne_20240711', name: 'Wayne (Engineering Director)', role: 'System Design & DSA Panelist', gender: 'male' },
  { id: 'Elenora_IT_Sitting_public', name: 'Elenora (Senior HR Partner)', role: 'HR & Behavioral Lead', gender: 'female' },
  { id: 'Angela-inblackskirt-20220820', name: 'Angela (Talent Assessor)', role: 'Campus Drive Interviewer', gender: 'female' }
];

export class HeyGenAvatarService {
  constructor(options = {}) {
    this.apiKey = options.apiKey || localStorage.getItem('neuroprep_heygen_key') || '';
    this.avatarId = options.avatarId || localStorage.getItem('neuroprep_heygen_avatar_id') || 'josh_lite3_20230714';
    this.onTalkingStatusChange = options.onTalkingStatusChange || (() => {});
    this.onStreamReady = options.onStreamReady || (() => {});
    this.onError = options.onError || (() => {});

    this.peerConnection = null;
    this.sessionId = null;
    this.token = null;
    this.isStreaming = false;
    this.isTalking = false;
    this.mediaStream = null;
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (this.apiKey) {
      localStorage.setItem('neuroprep_heygen_key', this.apiKey);
    }
  }

  setAvatarId(avatarId) {
    this.avatarId = avatarId;
    localStorage.setItem('neuroprep_heygen_avatar_id', avatarId);
  }

  /**
   * Request a real-time streaming access token from HeyGen
   */
  async createAccessToken() {
    if (!this.apiKey) {
      throw new Error('HeyGen API Key is required. Please enter your API Key in Settings.');
    }

    const res = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HeyGen Token Creation failed (${res.status})`);
    }

    const json = await res.json();
    this.token = json.data?.token;
    return this.token;
  }

  /**
   * Initialize and start WebRTC Live Avatar Stream
   * @param {HTMLVideoElement} videoElement 
   */
  async startSession(videoElement) {
    try {
      const token = await this.createAccessToken();

      // 1. Create a new streaming session with HeyGen
      const newSessionRes = await fetch('https://api.heygen.com/v1/streaming.new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          avatar_name: this.avatarId,
          quality: 'medium',
          version: 'v2'
        })
      });

      if (!newSessionRes.ok) {
        const err = await newSessionRes.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to initialize HeyGen avatar session');
      }

      const sessionJson = await newSessionRes.json();
      const { session_id, sdp: serverSdp, ice_servers } = sessionJson.data;
      this.sessionId = session_id;

      // 2. Initialize Browser WebRTC RTCPeerConnection
      this.peerConnection = new RTCPeerConnection({
        iceServers: ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      this.mediaStream = new MediaStream();

      this.peerConnection.ontrack = (event) => {
        if (event.track) {
          this.mediaStream.addTrack(event.track);
          if (videoElement) {
            videoElement.srcObject = this.mediaStream;
            videoElement.onloadedmetadata = () => {
              videoElement.play().catch(() => {});
            };
          }
          this.isStreaming = true;
          this.onStreamReady(this.mediaStream);
        }
      };

      // Set Remote Description from Server SDP
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(serverSdp));

      // Create Local SDP Answer
      const localAnswer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(localAnswer);

      // ICE Candidates handling
      this.peerConnection.onicecandidate = async ({ candidate }) => {
        if (candidate && this.sessionId) {
          try {
            await fetch('https://api.heygen.com/v1/streaming.ice', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                session_id: this.sessionId,
                candidate: candidate.toJSON()
              })
            });
          } catch (_) {}
        }
      };

      // 3. Start the WebRTC stream with local answer
      const startRes = await fetch('https://api.heygen.com/v1/streaming.start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          sdp: localAnswer
        })
      });

      if (!startRes.ok) {
        throw new Error('Failed to establish WebRTC streaming session with HeyGen');
      }

      this.isStreaming = true;
      return { sessionId: this.sessionId };
    } catch (err) {
      this.onError(err);
      throw err;
    }
  }

  /**
   * Make the HeyGen avatar speak an interview question with real-time lip sync
   * @param {string} text 
   */
  async speak(text) {
    if (!this.sessionId || !this.token || !this.isStreaming || !text) {
      return false;
    }

    try {
      this.isTalking = true;
      this.onTalkingStatusChange(true);

      const res = await fetch('https://api.heygen.com/v1/streaming.task', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          text: text,
          task_type: 'repeat'
        })
      });

      if (!res.ok) {
        this.isTalking = false;
        this.onTalkingStatusChange(false);
        return false;
      }

      // Estimate speaking duration based on word count (~150 words/min)
      const words = text.split(/\s+/).length;
      const durationMs = Math.max(3000, Math.min(18000, (words / 2.5) * 1000));
      setTimeout(() => {
        this.isTalking = false;
        this.onTalkingStatusChange(false);
      }, durationMs);

      return true;
    } catch (err) {
      console.warn('[HeyGen] Speak error:', err.message);
      this.isTalking = false;
      this.onTalkingStatusChange(false);
      return false;
    }
  }

  /**
   * React in real time to candidate's response or stress state
   * @param {string} reactionText 
   */
  async reactToInterviewee(reactionText) {
    return this.speak(reactionText);
  }

  /**
   * Interrupt the avatar speaking if the candidate starts answering
   */
  async interrupt() {
    if (this.sessionId && this.token && this.isTalking) {
      try {
        await fetch('https://api.heygen.com/v1/streaming.interrupt', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ session_id: this.sessionId })
        });
      } catch (_) {}
      this.isTalking = false;
      this.onTalkingStatusChange(false);
    }
  }

  /**
   * End and close the WebRTC stream session cleanly
   */
  async stopSession() {
    if (this.sessionId && this.token) {
      try {
        await fetch('https://api.heygen.com/v1/streaming.stop', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ session_id: this.sessionId })
        });
      } catch (_) {}
    }

    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (_) {}
      this.peerConnection = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.sessionId = null;
    this.isStreaming = false;
    this.isTalking = false;
  }
}

export default HeyGenAvatarService;
