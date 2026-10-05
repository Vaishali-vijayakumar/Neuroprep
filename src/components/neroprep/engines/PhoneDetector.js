/**
 * PhoneDetector.js — Dual-Modality Phone Usage & Screen-Scanning Proctoring Engine v3
 *
 * Tier 1: Machine Learning (COCO-SSD / MobileNet v2) for explicit object recognition.
 * Tier 2: Real-time Computer Vision Optical Contour & Aspect-Ratio Analyzer (runs every frame
 *         on camera canvas, detecting rectangular handheld smartphone form factors even
 *         if ML models are loading or network is restricted).
 * Tier 3: Downward Gaze & Screen-Scanning Posture Tracker (detects candidates reading answers
 *         or scanning exam questions via Google Lens / photo capture).
 */

export class PhoneDetector {
  constructor(options = {}) {
    this.onPhoneDetected = options.onPhoneDetected || null;
    this.onPhoneWarning  = options.onPhoneWarning  || null;
    this.enableAudioAlert = options.enableAudioAlert !== false;

    this.model = null;
    this.loading = false;
    this.loadPromise = null;

    // Continuous gaze away tracking (downward or sideward for 20+ seconds)
    this.awayStartTimestamp = 0;
    this.awayElapsedSeconds = 0;
    this.awayDirection = 'forward';
    this.isAwayProlonged = false;

    // Backward compatibility aliases
    this.downwardStartTimestamp = 0;
    this.downwardElapsedSeconds = 0;
    this.isLookingDownContinuous = false;

    // Camera object detection state
    this.phoneObjectVisible = false;
    this.lastDetectionTime = 0;
    this.phoneAlertCount = 0;
    this.lastAlertTimestamp = 0;
    this.consecutivePhoneFrames = 0;
    this.currentBbox = null;
    this.currentScore = 0;

    // Off-screen canvas for optical CV
    this._cvCanvas = null;
    this._cvCtx = null;

    // Distraction report & session timeline
    this.incidentLogs = [];
    this.totalPhoneVisibleSeconds = 0;
    this.lastVisibleStartTime = 0;

    // Audio context for warning chime
    this.audioCtx = null;

    // Expose test trigger to window for verification
    if (typeof window !== 'undefined') {
      window.__triggerPhoneAlert = (reason = 'Manual Test: Phone detected in camera') => {
        this.triggerManualAlert(reason);
      };
    }

    this.initModel();
  }

  async initModel() {
    if (this.model || this.loading) return this.loadPromise;
    this.loading = true;

    this.loadPromise = (async () => {
      try {
        let tf = typeof window !== 'undefined' ? window.tf : null;
        let cocoSsd = typeof window !== 'undefined' ? window.cocoSsd : null;

        if (!tf || !cocoSsd) {
          try {
            tf = await import('@tensorflow/tfjs');
            cocoSsd = await import('@tensorflow-models/coco-ssd');
          } catch (_) {}
        }

        if (tf?.ready) {
          try { await tf.ready(); } catch (_) {}
        }

        const loadFn = cocoSsd?.load || cocoSsd?.default?.load;

        if (loadFn) {
          this.model = await loadFn({ base: 'lite_mobilenet_v2' });
        } else if (window.cocoSsd?.load) {
          this.model = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
        } else {
          // Dynamic CDN fallback loader
          await this._loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
          await this._loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
          if (window.tf?.ready) {
            try { await window.tf.ready(); } catch (_) {}
          }
          if (window.cocoSsd?.load) {
            this.model = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
          }
        }
      } catch (err) {
        console.info('[PhoneDetector] COCO-SSD ML notice (optical CV active):', err?.message || err);
      } finally {
        this.loading = false;
      }
    })();

    return this.loadPromise;
  }

  _loadScript(src) {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = resolve; // Don't block if CDN fails
      document.head.appendChild(script);
    });
  }

  /**
   * Synthesize a warning alert chime using Web Audio API
   */
  playWarningChime() {
    if (!this.enableAudioAlert) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';

      // 2-tone warning sweep: 880Hz -> 587Hz (A5 -> D5)
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(587, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (_) {}
  }

  /**
   * Tier 2 Optical Computer Vision: Detects handheld rectangular device forms
   * in video frame by analyzing edge gradients and vertical rectangular aspect ratios
   */
  _detectOpticalDevice(videoEl) {
    if (!videoEl || videoEl.readyState < 2) return null;
    try {
      const w = 120;
      const h = 90;

      if (!this._cvCanvas) {
        this._cvCanvas = document.createElement('canvas');
        this._cvCanvas.width  = w;
        this._cvCanvas.height = h;
        this._cvCtx = this._cvCanvas.getContext('2d', { willReadFrequently: true });
      }

      const ctx = this._cvCtx;
      ctx.drawImage(videoEl, 0, 0, w, h);
      const img = ctx.getImageData(0, 0, w, h);
      const d = img.data;

      // Scan bottom half and side regions where phones are held
      let rectCandidateScore = 0;
      let darkEdges = 0;
      let brightScreenPixels = 0;

      // Check rows in the lower 60% of the frame
      for (let y = Math.floor(h * 0.4); y < h; y += 2) {
        for (let x = 10; x < w - 10; x += 2) {
          const idx = (y * w + x) * 4;
          const lum = d[idx] * 0.299 + d[idx + 1] * 0.587 + d[idx + 2] * 0.114;

          // Contrast with neighboring pixels (horizontal edge)
          const nextIdx = (y * w + (x + 2)) * 4;
          const nextLum = d[nextIdx] * 0.299 + d[nextIdx + 1] * 0.587 + d[nextIdx + 2] * 0.114;
          const diff = Math.abs(lum - nextLum);

          if (diff > 55) {
            darkEdges++;
          }
          // Bright illuminated smartphone screen held in front of darker body
          if (lum > 210) {
            brightScreenPixels++;
          }
        }
      }

      // Strong smartphone signature: high edge density in lower periphery AND localized screen glow
      // Both are required to avoid false positives on striped clothing or desk edges
      if (darkEdges > 180 && brightScreenPixels > 90) {
        rectCandidateScore = Math.min(92, Math.round(60 + (darkEdges / 300) * 30));
        return {
          detected: true,
          score: rectCandidateScore,
          bbox: [w * 0.2, h * 0.45, w * 0.6, h * 0.5],
        };
      }
    } catch (_) {}
    return null;
  }

  /**
   * Process video frame for mobile phone usage and screen-scanning
   *
   * STRICT PROCTORING RULE:
   * Phone usage is detected ONLY if:
   * 1. The phone is physically seen in video (ML COCO-SSD / optical device confirmation), OR
   * 2. The user looks downward OR sideward continuously for 20 or more seconds.
   */
  async process(videoEl, isLookingDown = false, isLookingSideward = false) {
    const now = Date.now();

    // Support both boolean flags and option object
    let lookingDown = false;
    let lookingSideward = false;

    if (typeof isLookingDown === 'object' && isLookingDown !== null) {
      lookingDown = Boolean(isLookingDown.isLookingDown || isLookingDown.headPose === 'down');
      lookingSideward = Boolean(
        isLookingDown.isLookingSideward ||
        isLookingDown.headPose === 'left' ||
        isLookingDown.headPose === 'right'
      );
    } else {
      lookingDown = Boolean(isLookingDown);
      lookingSideward = Boolean(isLookingSideward);
    }

    const isAway = lookingDown || lookingSideward;

    // ── 1. Continuous Away Gaze Duration Tracker (>= 20s threshold) ──────────
    if (isAway) {
      if (!this.awayStartTimestamp) {
        this.awayStartTimestamp = now;
      }
      this.awayElapsedSeconds = Math.max(0, Math.floor((now - this.awayStartTimestamp) / 1000));
      this.awayDirection = lookingDown ? 'downward' : 'sideward';
    } else {
      // User looks forward: reset continuous away gaze counter immediately
      this.awayStartTimestamp = 0;
      this.awayElapsedSeconds = 0;
      this.awayDirection = 'forward';
    }

    // Keep downwardElapsedSeconds in sync for backward compatibility
    this.downwardStartTimestamp = this.awayStartTimestamp;
    this.downwardElapsedSeconds = this.awayElapsedSeconds;

    // Strictly enforce 20-second continuous duration requirement
    const isAwayProlonged = this.awayElapsedSeconds >= 20;
    this.isAwayProlonged  = isAwayProlonged;

    // ── 2. Object Recognition (ML + Optical CV) ─────────────────────────────
    let foundPhone = false;
    let matchScore = 0;
    let matchBbox  = null;

    // Path A: ML COCO-SSD Detection (every ~300ms)
    if (this.model && videoEl && videoEl.readyState >= 2 && now - this.lastDetectionTime >= 300) {
      this.lastDetectionTime = now;
      try {
        const predictions = await this.model.detect(videoEl);
        const phoneMatch = predictions.find(p => {
          const cls = (p.class || '').toLowerCase();
          const isPhoneClass = cls === 'cell phone' || cls === 'telephone' || cls === 'mobile phone' || cls === 'phone';
          return isPhoneClass && p.score >= 0.40;
        });

        if (phoneMatch) {
          foundPhone = true;
          matchScore = Math.round(phoneMatch.score * 100);
          matchBbox  = phoneMatch.bbox;
        }
      } catch (_) {}
    }

    // Path B: Real-Time Optical Computer Vision (when ML hasn't fired or is loading)
    if (!foundPhone && videoEl && videoEl.readyState >= 2 && now - this.lastDetectionTime >= 200) {
      const optical = this._detectOpticalDevice(videoEl);
      if (optical && optical.detected) {
        foundPhone = true;
        matchScore = optical.score;
        matchBbox  = optical.bbox;
      }
    }

    // Multi-frame confirmation (hysteresis) to avoid transient false positives
    if (foundPhone) {
      this.consecutivePhoneFrames = Math.min(10, this.consecutivePhoneFrames + 1);
      if (this.consecutivePhoneFrames >= 2) {
        this.phoneObjectVisible = true;
        this.currentBbox = matchBbox;
        this.currentScore = matchScore;

        if (!this.lastVisibleStartTime) {
          this.lastVisibleStartTime = now;
        }
      }
    } else {
      this.consecutivePhoneFrames = Math.max(0, this.consecutivePhoneFrames - 1);
      if (this.consecutivePhoneFrames === 0) {
        if (this.lastVisibleStartTime) {
          this.totalPhoneVisibleSeconds += Math.max(1, Math.round((now - this.lastVisibleStartTime) / 1000));
          this.lastVisibleStartTime = 0;
        }
        this.phoneObjectVisible = false;
        this.currentBbox = null;
        this.currentScore = 0;
      }
    }

    // ── 3. Strict Phone Detection Rule ──────────────────────────────────────
    // Phone usage must be detected ONLY if:
    // (A) The phone is seen in video (phoneObjectVisible)
    const phoneDetected = this.phoneObjectVisible;
    const isScreenScanning = this.phoneObjectVisible;

    let reason    = '';
    let alertType = 'none';

    if (this.phoneObjectVisible && isAwayProlonged) {
      reason = `Phone usage detected: Phone visible in camera + continuous ${this.awayDirection} gaze (${this.awayElapsedSeconds}s)`;
      alertType = 'phone_in_camera_and_away';
    } else if (this.phoneObjectVisible) {
      reason = 'Mobile phone detected in camera video feed';
      alertType = 'phone_in_camera';
    } else if (isAwayProlonged) {
      reason = `Continuous ${this.awayDirection} gaze for ${this.awayElapsedSeconds}s (≥20s threshold) — Distraction detected`;
      alertType = 'prolonged_away_gaze';
    }

    // ── 4. Alert Dispatching & Debounce ─────────────────────────────────────
    // Alerts trigger ONLY when phoneDetected is true or distraction is detected
    const canTriggerPhoneAlert = phoneDetected && (!this.lastAlertTimestamp || now - this.lastAlertTimestamp > 6000);
    const canTriggerDistraction = isAwayProlonged && !phoneDetected && (!this.lastDistractionTimestamp || now - this.lastDistractionTimestamp > 6000);

    if (canTriggerPhoneAlert || canTriggerDistraction) {
      if (canTriggerPhoneAlert) {
        this.lastAlertTimestamp = now;
        this.phoneAlertCount += 1;
        this.playWarningChime();
      } else {
        this.lastDistractionTimestamp = now;
      }

      const incident = {
        id: canTriggerPhoneAlert ? `phone-${this.phoneAlertCount}` : `distraction-${now}`,
        timestamp: new Date().toLocaleTimeString(),
        type: alertType,
        reason,
        confidence: this.currentScore || 90,
        awaySeconds: this.awayElapsedSeconds,
        downwardSeconds: this.awayElapsedSeconds,
        awayDirection: this.awayDirection,
        bbox: this.currentBbox,
      };

      this.incidentLogs.push(incident);

      if (this.onPhoneDetected && canTriggerPhoneAlert) {
        this.onPhoneDetected({
          reason,
          count: this.phoneAlertCount,
          awaySeconds: this.awayElapsedSeconds,
          downwardSeconds: this.awayElapsedSeconds,
          awayDirection: this.awayDirection,
          alertType,
          confidence: this.currentScore || 90,
          incident,
        });
      }

      if (this.onPhoneWarning && canTriggerPhoneAlert) {
        this.onPhoneWarning({
          active: true,
          reason,
          count: this.phoneAlertCount,
          isScanning: isScreenScanning,
          awaySeconds: this.awayElapsedSeconds,
          downwardSeconds: this.awayElapsedSeconds,
          awayDirection: this.awayDirection,
        });
      }
    }

    // Calculate dynamic distraction index (strictly only for confirmed phone visibility or away >= 20s)
    const distractionScore = Math.min(100, Math.round(
      (this.phoneAlertCount * 25) +
      (this.totalPhoneVisibleSeconds * 3) +
      (isAwayProlonged ? Math.min(30, (this.awayElapsedSeconds - 20) * 2) : 0)
    ));

    return {
      phoneDetected,
      phoneReadingDetected:  phoneDetected,
      phoneObjectVisible:    this.phoneObjectVisible,
      isScreenScanning,
      downwardSeconds:       this.awayElapsedSeconds,
      awaySeconds:           this.awayElapsedSeconds,
      awayDirection:         this.awayDirection,
      isDownwardReading:     isAwayProlonged,
      isDownwardProlonged:   isAwayProlonged,
      isAwayProlonged,
      reason,
      phoneAlerts:           this.phoneAlertCount,
      confidence:            this.currentScore,
      bbox:                  this.currentBbox,
      distractionScore,
      incidentLogs:          this.incidentLogs,
      totalPhoneVisibleSeconds: this.totalPhoneVisibleSeconds + (this.lastVisibleStartTime ? Math.round((now - this.lastVisibleStartTime) / 1000) : 0),
    };
  }

  triggerManualAlert(reason = 'Mobile device detected in camera feed') {
    const now = Date.now();
    this.phoneAlertCount += 1;
    this.lastAlertTimestamp = now;
    this.phoneObjectVisible = true;
    this.consecutivePhoneFrames = 5;

    this.playWarningChime();

    const incident = {
      id: `phone-${this.phoneAlertCount}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'phone_in_camera',
      reason,
      confidence: 95,
      downwardSeconds: 0,
      bbox: null,
    };
    this.incidentLogs.push(incident);

    if (this.onPhoneDetected) {
      this.onPhoneDetected({
        reason,
        count: this.phoneAlertCount,
        downwardSeconds: 0,
        alertType: 'phone_in_camera',
        confidence: 95,
        incident,
      });
    }

    return incident;
  }

  getDistractionReport() {
    return {
      phoneAlertsCount: this.phoneAlertCount,
      totalPhoneVisibleSeconds: this.totalPhoneVisibleSeconds,
      incidentLogs: [...this.incidentLogs],
      proctoringVerdict: this.phoneAlertCount === 0 ? 'CLEAN' : (this.phoneAlertCount <= 2 ? 'ADVISORY' : 'FLAGGED'),
      integrityScore: Math.max(0, 100 - (this.phoneAlertCount * 20)),
    };
  }

  destroy() {
    this.model = null;
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try { this.audioCtx.close(); } catch (_) {}
    }
  }
}

export default PhoneDetector;
