import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Play,
  Settings,
  Layers,
  Zap,
  RotateCcw,
  AlertCircle,
  Eye,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { CVMetrics, CVMode, CVFilterMode } from '../types';
import { RppgCVEngine } from '../utils/cvEngine';

interface VisionFeedProps {
  cvMode: CVMode;
  cvFilterMode: CVFilterMode;
  setCvFilterMode: (mode: CVFilterMode) => void;
  onMetricsUpdate: (metrics: CVMetrics, ppgWave: number[]) => void;
  isScanning: boolean;
  scanProgress: number; // 0 - 100
  onStartScan: () => void;
  onCancelScan: () => void;
}

export const VisionFeed: React.FC<VisionFeedProps> = ({
  cvMode,
  cvFilterMode,
  setCvFilterMode,
  onMetricsUpdate,
  isScanning,
  scanProgress,
  onStartScan,
  onCancelScan,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ppgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const engineRef = useRef<RppgCVEngine>(new RppgCVEngine());

  // Demo simulation state
  const demoTimeRef = useRef<number>(0);

  // Initialize Camera Stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (cvMode === 'live') {
      setCameraError(null);
      navigator.mediaDevices
        ?.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
            setCameraActive(true);
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unequipped:', err);
          setCameraError(
            'Webcam permission denied or camera unavailable. Please switch to Demo Simulation Mode to experience full OpenCV processing.'
          );
          setCameraActive(false);
        });
    } else {
      setCameraActive(false);
      setCameraError(null);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cvMode]);

  // Main Processing Loop (30 FPS)
  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = () => {
      const engine = engineRef.current;
      const sourceCanvas = sourceCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const video = videoRef.current;

      if (sourceCanvas && overlayCanvas) {
        const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });

        if (cvMode === 'live' && video && cameraActive && video.readyState >= 2 && ctx) {
          sourceCanvas.width = video.videoWidth || 640;
          sourceCanvas.height = video.videoHeight || 480;
          ctx.drawImage(video, 0, 0, sourceCanvas.width, sourceCanvas.height);
        } else if (cvMode === 'demo') {
          sourceCanvas.width = 640;
          sourceCanvas.height = 480;
          demoTimeRef.current += 33.3; // simulate frame interval
          engine.drawDemoFace(sourceCanvas, demoTimeRef.current);
        }

        // Process Computer Vision frame
        const { metrics, ppgWave } = engine.processFrame(
          sourceCanvas,
          overlayCanvas,
          cvFilterMode,
          cvMode === 'demo',
          demoTimeRef.current
        );

        // Update real-time metrics & wave graph
        onMetricsUpdate(metrics, ppgWave);

        // Draw Oscilloscope PPG Signal Wave
        drawPpgOscilloscope(ppgCanvasRef.current, ppgWave);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cvMode, cvFilterMode, cameraActive]);

  // Oscilloscope PPG canvas renderer
  const drawPpgOscilloscope = (canvas: HTMLCanvasElement | null, wave: number[]) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (!wave || wave.length === 0) return;

    // Normalize wave values
    const min = Math.min(...wave, -10);
    const max = Math.max(...wave, 10);
    const range = max - min || 1;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#10b981'; // glowing emerald
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 6;

    const step = w / (wave.length - 1 || 1);
    for (let i = 0; i < wave.length; i++) {
      const x = i * step;
      const normalized = (wave[i] - min) / range;
      const y = h - 10 - normalized * (h - 20);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Video Feed Header & Mode Controls */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>OPENCV {cvMode.toUpperCase()} STREAM</span>
          </div>

          {cameraError && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Camera Error</span>
            </span>
          )}
        </div>

        {/* OpenCV Filter Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-mono text-[10px] uppercase px-2 hidden sm:inline">
            CV Filter:
          </span>
          <button
            id="filter-raw"
            onClick={() => setCvFilterMode('raw')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              cvFilterMode === 'raw'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw
          </button>
          <button
            id="filter-matrix"
            onClick={() => setCvFilterMode('opencv_matrix')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              cvFilterMode === 'opencv_matrix'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Matrix
          </button>
          <button
            id="filter-ppg"
            onClick={() => setCvFilterMode('ppg_green')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              cvFilterMode === 'ppg_green'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Green rPPG
          </button>
          <button
            id="filter-landmarks"
            onClick={() => setCvFilterMode('face_landmarks')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              cvFilterMode === 'face_landmarks'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Landmarks
          </button>
        </div>
      </div>

      {/* Main Vision Stage */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Hidden video element for webcam */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="hidden"
        />

        {/* Hidden canvas for processing raw frames */}
        <canvas ref={sourceCanvasRef} className="hidden" />

        {/* Visible Canvas for Video Render / Synthetic Simulation */}
        <canvas
          ref={sourceCanvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Real-time Computer Vision HUD Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Camera Permission Alert Box if failed */}
        {cvMode === 'live' && cameraError && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-lg">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Webcam Stream Unavailable</h3>
            <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
              {cameraError}
            </p>
            <button
              id="btn-switch-demo"
              onClick={() => {
                setCvFilterMode('opencv_matrix');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch Synthetic OpenCV Simulation</span>
            </button>
          </div>
        )}

        {/* Active Scan Timer Ring Overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center mb-3">
              {/* SVG Circular Progress Bar */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-emerald-500 fill-none transition-all duration-300"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * scanProgress) / 100}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {Math.round(scanProgress)}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">SCANNING</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 font-medium animate-pulse mb-4">
              Extracting micro-vascular blood volume pulse (rPPG)...
            </p>

            <button
              id="btn-cancel-scan"
              onClick={onCancelScan}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-mono border border-slate-700"
            >
              Cancel Scan
            </button>
          </div>
        )}
      </div>

      {/* Real-time Oscilloscope PPG Waveform Footer */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Oscilloscope Canvas */}
        <div className="w-full md:w-2/3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              rPPG BVP Signal Waveform (Forehead ROI)
            </span>
            <span>0.7 - 3.5 Hz Bandpass</span>
          </div>

          <div className="relative h-16 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <canvas ref={ppgCanvasRef} width={600} height={64} className="w-full h-full" />
          </div>
        </div>

        {/* Scan Trigger Button */}
        <div className="w-full md:w-1/3 flex items-center justify-end">
          {!isScanning ? (
            <button
              id="btn-start-scan"
              onClick={onStartScan}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 group"
            >
              <Zap className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>Start 20s Health Scan</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              <span>OpenCV Diagnostic Session Running...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
