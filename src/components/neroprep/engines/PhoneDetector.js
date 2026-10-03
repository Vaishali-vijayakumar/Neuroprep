/**
 * PhoneDetector.js — Dual-Modality Phone Usage & Distraction Proctoring Engine
 * 
 * 1. Visual Object Recognition (COCO-SSD / TensorFlow.js):
 *    Scans the camera feed to detect physical cell phones / smartphones in view.
 * 
 * 2. Extended Downward Gaze Threshold (> 40 seconds):
 *    Tracks continuous downward head pitch / iris gaze. If candidate continuously looks
 *    down for more than 40 seconds (instead of brief glances), triggers phone distraction alert.
 */

export class PhoneDetector {
  constructor(options = {}) {
    this.onPhoneDetected = options.onPhoneDetected || null;
    this.model = null;
    this.loading = false;
    this.loadPromise = null;
    
    // Downward gaze timer (40 seconds continuous threshold)
    this.downwardStartTimestamp = 0;
    this.downwardElapsedSeconds = 0;
    this.isLookingDownContinuous = false;
    
    // Camera object detection state
    this.phoneObjectVisible = false;
    this.lastDetectionTime = 0;
    this.phoneAlertCount = 0;
    this.lastAlertTimestamp = 0;
    
    this.initModel();
  }

  async initModel() {
    if (this.model || this.loading) return this.loadPromise;
    this.loading = true;

    this.loadPromise = (async () => {
      try {
        // Try importing installed packages or window global
        let tf = window.tf;
        let cocoSsd = window.cocoSsd;

        if (!tf || !cocoSsd) {
          try {
            tf = await import('@tensorflow/tfjs');
            cocoSsd = await import('@tensorflow-models/coco-ssd');
          } catch (_) {}
        }

        if (cocoSsd && cocoSsd.load) {
          this.model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        } else if (window.cocoSsd?.load) {
          this.model = await window.cocoSsd.load();
        } else {
          // Dynamic CDN fallback loader
          await this._loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js');
          await this._loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
          if (window.cocoSsd) {
            this.model = await window.cocoSsd.load();
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
   * Process a single video frame and telemetry input
   * @param {HTMLVideoElement} videoEl
   * @param {boolean} isLookingDown
   * @returns {Object} { phoneDetected, reason, downwardSeconds, phoneObjectVisible, phoneAlerts }
   */
  async process(videoEl, isLookingDown = false) {
    const now = Date.now();

    // ── 1. Downward Gaze Duration Tracker (> 40 seconds) ──
    if (isLookingDown) {
      if (!this.downwardStartTimestamp) {
        this.downwardStartTimestamp = now;
      }
      this.downwardElapsedSeconds = Math.max(0, Math.floor((now - this.downwardStartTimestamp) / 1000));
    } else {
      this.downwardStartTimestamp = 0;
      this.downwardElapsedSeconds = 0;
    }

    const isDownwardOver40s = this.downwardElapsedSeconds >= 40;

    // ── 2. Real Camera Object Detection (Throttle: 1 check per 700ms) ──
    if (this.model && videoEl && videoEl.readyState >= 2 && now - this.lastDetectionTime >= 700) {
      this.lastDetectionTime = now;
      try {
        const predictions = await this.model.detect(videoEl);
        // Look for cell phone / smartphone / remote predictions
        const phoneMatch = predictions.find(p => 
          (p.class === 'cell phone' || p.class === 'remote' || p.class === 'telephone') &&
          p.score >= 0.48
        );
        this.phoneObjectVisible = Boolean(phoneMatch);
      } catch (e) {
        // Silently skip if frame is unavailable
      }
    }

    // ── 3. Combined Decision & Alert Trigger ──
    const phoneDetected = this.phoneObjectVisible || isDownwardOver40s;
    let reason = '';

    if (this.phoneObjectVisible && isDownwardOver40s) {
      reason = 'Phone visible in camera & sustained downward gaze (>40s)';
    } else if (this.phoneObjectVisible) {
      reason = 'Cell phone detected in camera feed';
    } else if (isDownwardOver40s) {
      reason = `Continuous downward gaze for ${this.downwardElapsedSeconds}s (>40s threshold)`;
    }

    if (phoneDetected && (!this.lastAlertTimestamp || now - this.lastAlertTimestamp > 5000)) {
      this.lastAlertTimestamp = now;
      this.phoneAlertCount += 1;
      if (this.onPhoneDetected) {
        this.onPhoneDetected({ reason, count: this.phoneAlertCount, downwardSeconds: this.downwardElapsedSeconds });
      }
    }

    return {
      phoneDetected,
      phoneReadingDetected: phoneDetected,
      phoneObjectVisible: this.phoneObjectVisible,
      downwardSeconds: this.downwardElapsedSeconds,
      isDownwardOver40s,
      reason,
      phoneAlerts: this.phoneAlertCount
    };
  }

  destroy() {
    this.model = null;
  }
}

export default PhoneDetector;
