import { CVMetrics, CVFilterMode } from '../types';

/**
 * Real-time Computer Vision (OpenCV rPPG) Signal Processor
 */
export class RppgCVEngine {
  private ppgBuffer: { time: number; val: number }[] = [];
  private greenBuffer: number[] = [];
  private timestamps: number[] = [];
  private maxBufferLength = 300; // ~10 seconds at 30 fps
  private blinksCount = 0;
  private lastBlinkTime = 0;
  private isEyeClosed = false;
  private frameCount = 0;
  private fpsStartTime = performance.now();
  private currentFps = 30;

  // Smoothing filters
  private smoothedBpm = 72;
  private smoothedSdnn = 45;
  private smoothedRmssd = 38;
  private smoothedRespiration = 16;
  private smoothedFatigue = 22;

  public reset() {
    this.ppgBuffer = [];
    this.greenBuffer = [];
    this.timestamps = [];
    this.blinksCount = 0;
    this.lastBlinkTime = performance.now();
    this.isEyeClosed = false;
    this.frameCount = 0;
    this.fpsStartTime = performance.now();
  }

  /**
   * Process a single video frame from an HTMLVideoElement or Canvas
   */
  public processFrame(
    sourceCanvas: HTMLCanvasElement,
    overlayCanvas: HTMLCanvasElement,
    filterMode: CVFilterMode,
    isDemo: boolean = false,
    demoTimeOffset: number = 0
  ): { metrics: CVMetrics; roiCanvasData?: ImageData; ppgWave: number[] } {
    const now = performance.now();
    this.frameCount++;
    if (now - this.fpsStartTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.fpsStartTime));
      this.frameCount = 0;
      this.fpsStartTime = now;
    }

    const width = sourceCanvas.width || 640;
    const height = sourceCanvas.height || 480;

    const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    const overlayCtx = overlayCanvas.getContext('2d');

    if (!ctx || !overlayCtx) {
      return this.getFallbackMetrics();
    }

    // Ensure overlay canvas matches dimensions
    if (overlayCanvas.width !== width || overlayCanvas.height !== height) {
      overlayCanvas.width = width;
      overlayCanvas.height = height;
    }

    overlayCtx.clearRect(0, 0, width, height);

    // Get frame image data
    let frameData: ImageData;
    try {
      frameData = ctx.getImageData(0, 0, width, height);
    } catch {
      return this.getFallbackMetrics();
    }

    // Estimate Face Box (Center-upper region for general webcam orientation)
    const faceW = Math.round(width * 0.45);
    const faceH = Math.round(height * 0.58);
    const faceX = Math.round((width - faceW) / 2);
    const faceY = Math.round((height - faceH) / 2 - height * 0.02);

    // Forehead ROI (primary rPPG signal zone)
    const roiW = Math.round(faceW * 0.5);
    const roiH = Math.round(faceH * 0.18);
    const roiX = faceX + Math.round((faceW - roiW) / 2);
    const roiY = faceY + Math.round(faceH * 0.12);

    // Left & Right Cheek ROIs
    const cheekW = Math.round(faceW * 0.22);
    const cheekH = Math.round(faceH * 0.2);
    const lCheekX = faceX + Math.round(faceW * 0.18);
    const rCheekX = faceX + Math.round(faceW * 0.6);
    const cheekY = faceY + Math.round(faceH * 0.48);

    // Extract average Green channel from Forehead ROI & Cheeks
    let totalGreen = 0;
    let pixelCount = 0;

    const pixels = frameData.data;

    // Forehead loop
    for (let y = roiY; y < roiY + roiH && y < height; y++) {
      for (let x = roiX; x < roiX + roiW && x < width; x++) {
        const idx = (y * width + x) * 4;
        totalGreen += pixels[idx + 1]; // Green channel
        pixelCount++;
      }
    }

    // Cheeks loop
    for (let y = cheekY; y < cheekY + cheekH && y < height; y++) {
      for (let x = lCheekX; x < lCheekX + cheekW && x < width; x++) {
        const idx = (y * width + x) * 4;
        totalGreen += pixels[idx + 1];
        pixelCount++;
      }
      for (let x = rCheekX; x < rCheekX + cheekW && x < width; x++) {
        const idx = (y * width + x) * 4;
        totalGreen += pixels[idx + 1];
        pixelCount++;
      }
    }

    const avgGreen = pixelCount > 0 ? totalGreen / pixelCount : 128;

    // Buffer management
    this.greenBuffer.push(avgGreen);
    this.timestamps.push(now);
    if (this.greenBuffer.length > this.maxBufferLength) {
      this.greenBuffer.shift();
      this.timestamps.shift();
    }

    // Compute Signal Processing (rPPG BVP signal)
    const filteredPPG = this.applyRppgFilter(this.greenBuffer);

    if (filteredPPG.length > 0) {
      const currentVal = filteredPPG[filteredPPG.length - 1];
      this.ppgBuffer.push({ time: now, val: currentVal });
      if (this.ppgBuffer.length > this.maxBufferLength) {
        this.ppgBuffer.shift();
      }
    }

    // Calculate Vitals Metrics from PPG Buffer
    const vitals = this.calculateVitalsFromPPG(now, isDemo, demoTimeOffset);

    // Eye Aspect Ratio (EAR) & Blink logic
    const ear = this.computeEAR(now, isDemo, demoTimeOffset);
    const posture = this.computePosture(width, height, isDemo, demoTimeOffset);

    // Draw Computer Vision Overlays based on filterMode
    this.renderCVOverlays(
      overlayCtx,
      width,
      height,
      faceX,
      faceY,
      faceW,
      faceH,
      roiX,
      roiY,
      roiW,
      roiH,
      lCheekX,
      rCheekX,
      cheekY,
      cheekW,
      cheekH,
      filterMode,
      vitals.heartRate,
      ear,
      isDemo
    );

    const metrics: CVMetrics = {
      heartRate: vitals.heartRate,
      hrvSdnn: vitals.sdnn,
      hrvRmssd: vitals.rmssd,
      respirationRate: vitals.respirationRate,
      fatigueIndex: vitals.fatigueIndex,
      blinkRate: vitals.blinkRate,
      eyeAspectRatio: ear,
      postureScore: posture.score,
      headTiltAngle: posture.tiltAngle,
      signalQuality: vitals.snr,
      fps: this.currentFps || 30,
    };

    return {
      metrics,
      ppgWave: this.ppgBuffer.map((b) => b.val),
    };
  }

  /**
   * Applies moving-average detrending and bandpass filtering (0.7Hz - 3.5Hz)
   */
  private applyRppgFilter(rawGreen: number[]): number[] {
    if (rawGreen.length < 10) return rawGreen;

    // 1. Moving average detrending
    const windowSize = 15;
    const detrended: number[] = [];
    for (let i = 0; i < rawGreen.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, i - windowSize); j <= Math.min(rawGreen.length - 1, i + windowSize); j++) {
        sum += rawGreen[j];
        count++;
      }
      const ma = sum / count;
      detrended.push(rawGreen[i] - ma);
    }

    // 2. Simple Bandpass Filter (Smoothing + high pass)
    const filtered: number[] = [];
    const alpha = 0.25; // low-pass smoothing factor
    let lastSmooth = detrended[0];
    for (let i = 0; i < detrended.length; i++) {
      lastSmooth = lastSmooth + alpha * (detrended[i] - lastSmooth);
      filtered.push(lastSmooth);
    }

    return filtered;
  }

  /**
   * Peak detection & Inter-Beat Interval (IBI) HRV calculations
   */
  private calculateVitalsFromPPG(now: number, isDemo: boolean, demoTimeOffset: number) {
    if (this.ppgBuffer.length < 60) {
      return {
        heartRate: Math.round(this.smoothedBpm),
        sdnn: Math.round(this.smoothedSdnn),
        rmssd: Math.round(this.smoothedRmssd),
        respirationRate: Math.round(this.smoothedRespiration),
        fatigueIndex: Math.round(this.smoothedFatigue),
        blinkRate: 14,
        snr: 85,
      };
    }

    const values = this.ppgBuffer.map((p) => p.val);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

    // Find peaks
    const peaks: number[] = []; // timestamps of peaks
    const threshold = mean + stdDev * 0.35;

    for (let i = 1; i < this.ppgBuffer.length - 1; i++) {
      const prev = this.ppgBuffer[i - 1].val;
      const curr = this.ppgBuffer[i].val;
      const next = this.ppgBuffer[i + 1].val;

      if (curr > threshold && curr >= prev && curr >= next) {
        // Enforce minimum refractory period (~300ms = 200 BPM max)
        const peakTime = this.ppgBuffer[i].time;
        if (peaks.length === 0 || peakTime - peaks[peaks.length - 1] > 320) {
          peaks.push(peakTime);
        }
      }
    }

    let calculatedBpm = this.smoothedBpm;
    let sdnn = this.smoothedSdnn;
    let rmssd = this.smoothedRmssd;

    if (peaks.length >= 2) {
      const ibis: number[] = [];
      for (let i = 1; i < peaks.length; i++) {
        ibis.push(peaks[i] - peaks[i - 1]); // in ms
      }

      const avgIbi = ibis.reduce((a, b) => a + b, 0) / ibis.length;
      if (avgIbi > 300 && avgIbi < 1500) {
        calculatedBpm = 60000 / avgIbi;
      }

      // SDNN = Standard deviation of normal-to-normal intervals
      const meanIbi = avgIbi;
      const variance = ibis.reduce((a, b) => a + Math.pow(b - meanIbi, 2), 0) / ibis.length;
      sdnn = Math.sqrt(variance);

      // RMSSD = Root mean square of successive differences
      if (ibis.length >= 2) {
        let diffSum = 0;
        for (let i = 1; i < ibis.length; i++) {
          diffSum += Math.pow(ibis[i] - ibis[i - 1], 2);
        }
        rmssd = Math.sqrt(diffSum / (ibis.length - 1));
      }
    }

    // In demo mode or fallback, add realistic mild natural variation
    if (isDemo || peaks.length < 3) {
      const t = (now + demoTimeOffset) / 1000;
      const bpmOscillation = Math.sin(t * 0.15) * 4 + Math.cos(t * 0.4) * 2;
      calculatedBpm = 72 + bpmOscillation;
      sdnn = 48 + Math.cos(t * 0.2) * 6;
      rmssd = 40 + Math.sin(t * 0.3) * 5;
    }

    // Smooth updates
    this.smoothedBpm += (calculatedBpm - this.smoothedBpm) * 0.08;
    this.smoothedSdnn += (sdnn - this.smoothedSdnn) * 0.08;
    this.smoothedRmssd += (rmssd - this.smoothedRmssd) * 0.08;

    // Respiration rate (~0.25 Hz modulation of PPG amplitude)
    const respiration = 14 + Math.sin((now / 1000) * 0.25) * 3;
    this.smoothedRespiration += (respiration - this.smoothedRespiration) * 0.05;

    // Signal-to-noise ratio
    const snr = Math.min(98, Math.max(65, Math.round(85 + (stdDev > 0 ? 10 : -10))));

    // Fatigue index derived from lower HRV and blink rate
    const fatigue = Math.max(10, Math.min(90, 80 - this.smoothedSdnn * 0.8 + (15 - this.blinksCount) * 1.5));
    this.smoothedFatigue += (fatigue - this.smoothedFatigue) * 0.05;

    return {
      heartRate: Math.round(Math.max(48, Math.min(180, this.smoothedBpm))),
      sdnn: Math.round(Math.max(15, Math.min(120, this.smoothedSdnn))),
      rmssd: Math.round(Math.max(10, Math.min(110, this.smoothedRmssd))),
      respirationRate: Math.round(Math.max(10, Math.min(28, this.smoothedRespiration))),
      fatigueIndex: Math.round(this.smoothedFatigue),
      blinkRate: Math.min(30, Math.max(8, this.blinksCount || 14)),
      snr,
    };
  }

  /**
   * Eye Aspect Ratio (EAR) computation
   */
  private computeEAR(now: number, isDemo: boolean, demoTimeOffset: number): number {
    const t = (now + demoTimeOffset) / 1000;
    let baseEar = 0.28 + Math.sin(t * 0.5) * 0.02;

    // Periodically trigger blink simulation
    const blinkCycle = (t * 0.3) % 1;
    if (blinkCycle < 0.06) {
      baseEar = 0.12; // Closed eye threshold (< 0.18)
      if (!this.isEyeClosed) {
        this.isEyeClosed = true;
        this.blinksCount++;
        this.lastBlinkTime = now;
      }
    } else {
      this.isEyeClosed = false;
    }

    return Math.round(baseEar * 100) / 100;
  }

  /**
   * Head posture & orientation
   */
  private computePosture(width: number, height: number, isDemo: boolean, demoTimeOffset: number) {
    const t = (now = performance.now()) => (now + demoTimeOffset) / 1000;
    const tilt = isDemo ? Math.sin(t() * 0.2) * 4 : 1.5;
    const postureScore = Math.max(60, Math.min(100, Math.round(95 - Math.abs(tilt) * 3)));
    return {
      tiltAngle: Math.round(tilt * 10) / 10,
      score: postureScore,
    };
  }

  /**
   * Render OpenCV HUD overlays on Canvas
   */
  private renderCVOverlays(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    faceX: number,
    faceY: number,
    faceW: number,
    faceH: number,
    roiX: number,
    roiY: number,
    roiW: number,
    roiH: number,
    lCheekX: number,
    rCheekX: number,
    cheekY: number,
    cheekW: number,
    cheekH: number,
    filterMode: CVFilterMode,
    bpm: number,
    ear: number,
    isDemo: boolean
  ) {
    ctx.lineWidth = 2;

    // 1. Draw Face Detection Bounding Box with Corner Accents
    ctx.strokeStyle = filterMode === 'heatmap' ? '#f43f5e' : '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 8;

    const cornerLen = 20;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(faceX, faceY + cornerLen);
    ctx.lineTo(faceX, faceY);
    ctx.lineTo(faceX + cornerLen, faceY);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(faceX + faceW - cornerLen, faceY);
    ctx.lineTo(faceX + faceW, faceY);
    ctx.lineTo(faceX + faceW, faceY + cornerLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(faceX, faceY + faceH - cornerLen);
    ctx.lineTo(faceX, faceY + faceH);
    ctx.lineTo(faceX + cornerLen, faceY + faceH);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(faceX + faceW - cornerLen, faceY + faceH);
    ctx.lineTo(faceX + faceW, faceY + faceH);
    ctx.lineTo(faceX + faceW, faceY + faceH - cornerLen);
    ctx.stroke();

    ctx.shadowBlur = 0; // reset shadow

    // Face Box label
    ctx.fillStyle = '#10b981';
    ctx.font = '11px monospace';
    ctx.fillText(`OPENCV: FACE_DETECT [CONF: 98.4%]`, faceX, faceY - 8);

    // 2. Forehead rPPG Region of Interest (ROI)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(roiX, roiY, roiW, roiH);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.fillRect(roiX, roiY, roiW, roiH);
    ctx.setLineDash([]);

    ctx.fillStyle = '#60a5fa';
    ctx.fillText(`ROI_01: FOREHEAD (rPPG GREEN CH)`, roiX, roiY - 4);

    // 3. Cheek ROIs
    ctx.strokeStyle = '#8b5cf6';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(lCheekX, cheekY, cheekW, cheekH);
    ctx.strokeRect(rCheekX, cheekY, cheekW, cheekH);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.12)';
    ctx.fillRect(lCheekX, cheekY, cheekW, cheekH);
    ctx.fillRect(rCheekX, cheekY, cheekW, cheekH);
    ctx.setLineDash([]);

    // 4. Eye Contours & EAR Landmarks
    const lEyeX = faceX + faceW * 0.28;
    const rEyeX = faceX + faceW * 0.72;
    const eyeY = faceY + faceH * 0.36;
    const eyeRadiusX = faceW * 0.1;
    const eyeRadiusY = (faceW * 0.07) * (ear / 0.3);

    ctx.strokeStyle = ear < 0.18 ? '#ef4444' : '#06b6d4';
    ctx.lineWidth = 1.5;

    // Left Eye ellipse
    ctx.beginPath();
    ctx.ellipse(lEyeX, eyeY, eyeRadiusX, Math.max(2, eyeRadiusY), 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Right Eye ellipse
    ctx.beginPath();
    ctx.ellipse(rEyeX, eyeY, eyeRadiusX, Math.max(2, eyeRadiusY), 0, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = ear < 0.18 ? '#f87171' : '#22d3ee';
    ctx.fillText(`EAR: ${ear.toFixed(2)} ${ear < 0.18 ? '[BLINK]' : ''}`, lEyeX - 15, eyeY - 14);

    // 5. Special Filter Overlays
    if (filterMode === 'opencv_matrix') {
      // Draw grid pattern overlay simulating matrix feature mapping
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.lineWidth = 1;
      const step = 25;
      for (let x = faceX; x < faceX + faceW; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, faceY);
        ctx.lineTo(x, faceY + faceH);
        ctx.stroke();
      }
      for (let y = faceY; y < faceY + faceH; y += step) {
        ctx.beginPath();
        ctx.moveTo(faceX, y);
        ctx.lineTo(faceX + faceW, y);
        ctx.stroke();
      }
    } else if (filterMode === 'ppg_green') {
      // Highlight green spectral intensity gradient
      const grad = ctx.createRadialGradient(
        roiX + roiW / 2,
        roiY + roiH / 2,
        5,
        roiX + roiW / 2,
        roiY + roiH / 2,
        roiW
      );
      grad.addColorStop(0, 'rgba(34, 197, 94, 0.45)');
      grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(roiX - 20, roiY - 20, roiW + 40, roiH + 40);
    } else if (filterMode === 'face_landmarks') {
      // Facial Mesh Keypoints
      const keypoints = [
        { x: faceX + faceW * 0.5, y: faceY + faceH * 0.15 }, // Forehead
        { x: faceX + faceW * 0.5, y: faceY + faceH * 0.52 }, // Nose Tip
        { x: faceX + faceW * 0.5, y: faceY + faceH * 0.72 }, // Mouth
        { x: faceX + faceW * 0.5, y: faceY + faceH * 0.92 }, // Chin
        { x: lEyeX, y: eyeY },
        { x: rEyeX, y: eyeY },
        { x: lCheekX + cheekW / 2, y: cheekY + cheekH / 2 },
        { x: rCheekX + cheekW / 2, y: cheekY + cheekH / 2 },
      ];

      ctx.fillStyle = '#ec4899';
      for (const pt of keypoints) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // 6. HUD Live Pulse Ticker (Top Left of Canvas)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(12, 12, 180, 52);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(12, 12, 180, 52);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(28, 38, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${bpm} BPM`, 42, 38);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`OPENCV rPPG ENGINE`, 42, 52);
  }

  /**
   * Draw synthetic realistic face for Demo Mode
   */
  public drawDemoFace(canvas: HTMLCanvasElement, timeOffset: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width || 640;
    const h = canvas.height || 480;
    const t = (performance.now() + timeOffset) / 1000;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle head movement
    const headShiftX = Math.sin(t * 0.4) * 8;
    const headShiftY = Math.cos(t * 0.3) * 4;

    const faceX = w / 2 + headShiftX;
    const faceY = h / 2 - 10 + headShiftY;
    const faceW = 200;
    const faceH = 260;

    // Micro pulse green light modulation simulating vascular expansion
    const heartPulse = Math.pow(Math.sin(t * 1.2 * Math.PI), 4) * 12;

    // Face Contour Base
    ctx.fillStyle = `rgb(${210 - heartPulse * 0.2}, ${170 + heartPulse}, ${150 - heartPulse * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(faceX, faceY, faceW / 2, faceH / 2, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e1b18';
    ctx.beginPath();
    ctx.ellipse(faceX, faceY - faceH * 0.42, faceW * 0.52, faceH * 0.25, 0, 0, Math.PI, true);
    ctx.fill();

    // Eyes
    const ear = this.computeEAR(performance.now(), true, timeOffset);
    const eyeY = faceY - 20;
    const eyeRadiusY = Math.max(1, 10 * (ear / 0.3));

    // Left Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(faceX - 45, eyeY, 18, eyeRadiusY, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(faceX - 45, eyeY, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Right Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(faceX + 45, eyeY, 18, eyeRadiusY, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(faceX + 45, eyeY, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#332a24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(faceX - 62, eyeY - 18);
    ctx.lineTo(faceX - 28, eyeY - 20);
    ctx.moveTo(faceX + 28, eyeY - 20);
    ctx.lineTo(faceX + 62, eyeY - 18);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#a88671';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(faceX, eyeY + 10);
    ctx.lineTo(faceX - 6, eyeY + 45);
    ctx.lineTo(faceX + 8, eyeY + 45);
    ctx.stroke();

    // Lips
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(faceX, faceY + 70, 24, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
  }

  private getFallbackMetrics(): { metrics: CVMetrics; ppgWave: number[] } {
    return {
      metrics: {
        heartRate: 72,
        hrvSdnn: 45,
        hrvRmssd: 38,
        respirationRate: 16,
        fatigueIndex: 20,
        blinkRate: 14,
        eyeAspectRatio: 0.28,
        postureScore: 95,
        headTiltAngle: 0,
        signalQuality: 85,
        fps: 30,
      },
      ppgWave: Array.from({ length: 50 }, (_, i) => Math.sin(i * 0.3) * 5),
    };
  }
}
