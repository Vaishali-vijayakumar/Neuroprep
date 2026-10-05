/**
 * PhoneDetector.js — Dual-Modality Phone Usage & Screen-Scanning Proctoring Engine
 *
 * Designed to detect and prevent unauthorized smartphone usage during interviews:
 * 1. Visual Object Recognition (COCO-SSD / TensorFlow.js):
 *    Scans the camera feed at ~320ms intervals for cell phones / mobile devices held up
 *    to the screen (e.g., scanning questions using Google Lens, ChatGPT Vision, or taking photos).
 *
 * 2. Downward Gaze Reading / Distraction Tracker (7s / 15s Thresholds):
 *    Detects continuous downward gaze when a candidate is reading answers off a phone or notes
 *    hidden below the camera line.
 *
 * 3. Screen-Scanning Heuristic:
 *    Cross-references phone object appearance in camera view with forward/downward gaze orientation
 *    to detect active screen capture attempts.
 */

export class PhoneDetector {
  constructor(options = {}) {
    this.onPhoneDetected = options.onPhoneDetected || null;
    this.onPhoneWarning  = options.onPhoneWarning  || null;
    this.enableAudioAlert = options.enableAudioAlert !== false;

    this.model = null;
    this.loading = false;
    this.loadPromise = null;

    // Downward gaze tracking (7s suspicion threshold, 15s critical threshold)
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

    // Distraction report & session timeline
    this.incidentLogs = [];
    this.totalPhoneVisibleSeconds = 0;
    this.lastVisibleStartTime = 0;

    // Audio context for warning chime
    this.audioCtx = null;

    this.initModel();
  }

  async initModel() {
    if (this.model || this.loading) return this.loadPromise;
    this.loading = true;

    this.loadPromise = (async () => {
      try {
        let tf = window.tf;
        let cocoSsd = window.cocoSsd;

        if (!tf || !cocoSsd) {
          try {
            tf = await import('@tensorflow/tfjs');
            cocoSsd = await import('@tensorflow-models/coco-ssd');
          } catch (_) {}
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
          if (window.cocoSsd?.load) {
            this.model = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
          }
        }
      } catch (err) {
        console.warn('[PhoneDetector] Object detection model notice:', err.message);
      } finally {
        this.loading = false;
      }
    })();

    return this.loadPromise;
  }

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
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
   * Process video frame for mobile phone usage and screen-scanning
   * @param {HTMLVideoElement} videoEl
   * @param {boolean} isLookingDown
   * @returns {Object} phone detection telemetry
   */
  async process(videoEl, isLookingDown = false) {
    const now = Date.now();

    // ── 1. Downward Gaze Duration Tracker (7s suspicion, 15s prolonged) ──
    if (isLookingDown) {
      if (!this.downwardStartTimestamp) {
        this.downwardStartTimestamp = now;
      }
      this.downwardElapsedSeconds = Math.max(0, Math.floor((now - this.downwardStartTimestamp) / 1000));
    } else {
      this.downwardStartTimestamp = 0;
      this.downwardElapsedSeconds = 0;
    }

    const isDownwardReading = this.downwardElapsedSeconds >= 4;
    const isDownwardProlonged = this.downwardElapsedSeconds >= 10;

    // ── 2. Real-Time Camera Object Detection (Throttle: 320ms ~ 3 FPS) ──
    if (this.model && videoEl && videoEl.readyState >= 2 && now - this.lastDetectionTime >= 320) {
      this.lastDetectionTime = now;
      try {
        const predictions = await this.model.detect(videoEl);

        // Detect cell phone / smartphone / remote / telephone classes
        const phoneMatch = predictions.find(p => {
          const cls = (p.class || '').toLowerCase();
          const isPhoneClass = cls === 'cell phone' || cls === 'telephone';
          const isRemoteOrGadget = cls === 'remote' || cls === 'camera';
          return (isPhoneClass && p.score >= 0.35) || (isRemoteOrGadget && p.score >= 0.46);
        });

        if (phoneMatch) {
          this.consecutivePhoneFrames += 1;
          this.phoneObjectVisible = true;
          this.currentBbox = phoneMatch.bbox;
          this.currentScore = Math.round(phoneMatch.score * 100);

          if (!this.lastVisibleStartTime) {
            this.lastVisibleStartTime = now;
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
      } catch (e) {
        // Silently skip transient canvas capture errors
      }
    }

    // ── 3. Screen-Scanning Heuristic ──
    // If a phone is visible in camera view while candidate is facing forward/downward,
    // they are likely holding it up to scan the question text on screen.
    const isScreenScanning = this.phoneObjectVisible;
    const phoneDetected = this.phoneObjectVisible || isDownwardReading;

    let reason = '';
    let alertType = 'none';

    if (this.phoneObjectVisible && isDownwardReading) {
      reason = `Active phone scanning detected (Phone in camera + downward gaze for ${this.downwardElapsedSeconds}s)`;
      alertType = 'screen_scan_and_read';
    } else if (this.phoneObjectVisible) {
      reason = 'Mobile phone detected in screen view (Scanning with Google Lens / Camera prohibited)';
      alertType = 'phone_in_camera';
    } else if (isDownwardProlonged) {
      reason = `Prolonged downward gaze (${this.downwardElapsedSeconds}s) — possible hidden device reading`;
      alertType = 'prolonged_downward_gaze';
    } else if (isDownwardReading) {
      reason = `Downward gaze reading detected (${this.downwardElapsedSeconds}s)`;
      alertType = 'downward_reading';
    }

    // ── 4. Alert Dispatching & Debounce ──
    const canTriggerAlert = phoneDetected && (!this.lastAlertTimestamp || now - this.lastAlertTimestamp > 4500);

    if (canTriggerAlert) {
      this.lastAlertTimestamp = now;
      this.phoneAlertCount += 1;

      // Play auditory warning cue
      this.playWarningChime();

      const incident = {
        id: `phone-${this.phoneAlertCount}`,
        timestamp: new Date().toLocaleTimeString(),
        type: alertType,
        reason,
        confidence: this.currentScore || 85,
        downwardSeconds: this.downwardElapsedSeconds,
        bbox: this.currentBbox,
      };

      this.incidentLogs.push(incident);

      if (this.onPhoneDetected) {
        this.onPhoneDetected({
          reason,
          count: this.phoneAlertCount,
          downwardSeconds: this.downwardElapsedSeconds,
          alertType,
          confidence: this.currentScore,
          incident
        });
      }

      if (this.onPhoneWarning) {
        this.onPhoneWarning({
          active: true,
          reason,
          count: this.phoneAlertCount,
          isScanning: isScreenScanning,
          downwardSeconds: this.downwardElapsedSeconds,
        });
      }
    }

    // Calculate dynamic distraction index (0 = zero distraction, 100 = critical cheating risk)
    const distractionScore = Math.min(100, Math.round(
      (this.phoneAlertCount * 25) +
      (this.totalPhoneVisibleSeconds * 3) +
      (this.downwardElapsedSeconds > 5 ? (this.downwardElapsedSeconds - 5) * 4 : 0)
    ));

    return {
      phoneDetected,
      phoneReadingDetected: phoneDetected,
      phoneObjectVisible: this.phoneObjectVisible,
      isScreenScanning,
      downwardSeconds: this.downwardElapsedSeconds,
      isDownwardReading,
      isDownwardProlonged,
      reason,
      phoneAlerts: this.phoneAlertCount,
      confidence: this.currentScore,
      bbox: this.currentBbox,
      distractionScore,
      incidentLogs: this.incidentLogs,
      totalPhoneVisibleSeconds: this.totalPhoneVisibleSeconds + (this.lastVisibleStartTime ? Math.round((now - this.lastVisibleStartTime) / 1000) : 0),
    };
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
