import React from 'react';
import {
  Heart,
  Activity,
  Wind,
  Eye,
  Compass,
  Wifi,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { CVMetrics } from '../types';

interface VitalsDisplayProps {
  metrics: CVMetrics;
}

export const VitalsDisplay: React.FC<VitalsDisplayProps> = ({ metrics }) => {
  // Helper for status styling
  const getHeartRateStatus = (bpm: number) => {
    if (bpm >= 60 && bpm <= 95) return { label: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (bpm < 60) return { label: 'Bradycardia / Athletic', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    return { label: 'Elevated Tachycardia', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  };

  const getHrvStatus = (sdnn: number) => {
    if (sdnn >= 40) return { label: 'High Resilience', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (sdnn >= 25) return { label: 'Moderate Flexibility', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Autonomic Strain', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const hrStatus = getHeartRateStatus(metrics.heartRate);
  const hrvStatus = getHrvStatus(metrics.hrvSdnn);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Heart Rate (BPM) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Heart Rate (rPPG)
              </h3>
              <p className="text-[10px] text-slate-400">Green Channel Pulse</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${hrStatus.color}`}>
            {hrStatus.label}
          </span>
        </div>

        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {metrics.heartRate}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase">BPM</span>
        </div>

        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-rose-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (metrics.heartRate / 160) * 100)}%` }}
          />
        </div>
      </div>

      {/* 2. Heart Rate Variability (SDNN / RMSSD) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                HRV (SDNN / RMSSD)
              </h3>
              <p className="text-[10px] text-slate-400">Autonomic Flexibility</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${hrvStatus.color}`}>
            {hrvStatus.label}
          </span>
        </div>

        <div className="flex items-baseline space-x-3 my-1">
          <div>
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {metrics.hrvSdnn}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 ml-1">SDNN (ms)</span>
          </div>
          <div className="text-slate-500 text-sm">/</div>
          <div>
            <span className="text-xl font-bold font-mono text-slate-300">
              {metrics.hrvRmssd}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 ml-1">RMSSD</span>
          </div>
        </div>

        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (metrics.hrvSdnn / 100) * 100)}%` }}
          />
        </div>
      </div>

      {/* 3. Respiration Rate (RPM) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Respiration Rate
              </h3>
              <p className="text-[10px] text-slate-400">Optical Pulse Envelope</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Normal Rhythm
          </span>
        </div>

        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {metrics.respirationRate}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase">RPM</span>
        </div>

        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-cyan-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (metrics.respirationRate / 30) * 100)}%` }}
          />
        </div>
      </div>

      {/* 4. Ocular Fatigue & Blink EAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Fatigue & Ocular EAR
              </h3>
              <p className="text-[10px] text-slate-400">Blink & Aperture Index</p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
              metrics.fatigueIndex > 50
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {metrics.fatigueIndex > 50 ? 'Drowsiness Risk' : 'Alert'}
          </span>
        </div>

        <div className="flex items-baseline space-x-3 my-1">
          <div>
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {metrics.fatigueIndex}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 ml-1">/100 Fatigue</span>
          </div>
          <div className="text-slate-500 text-sm">|</div>
          <div>
            <span className="text-lg font-bold font-mono text-purple-300">
              {metrics.eyeAspectRatio.toFixed(2)}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 ml-1">EAR</span>
          </div>
        </div>

        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full transition-all duration-300 ${
              metrics.fatigueIndex > 50 ? 'bg-rose-500' : 'bg-purple-500'
            }`}
            style={{ width: `${metrics.fatigueIndex}%` }}
          />
        </div>
      </div>

      {/* 5. Posture & Head Orientation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Ergonomic Posture
              </h3>
              <p className="text-[10px] text-slate-400">Head Tilt Matrix</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {metrics.postureScore > 80 ? 'Aligned' : 'Correction Rec.'}
          </span>
        </div>

        <div className="flex items-baseline space-x-3 my-1">
          <div>
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {metrics.postureScore}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 ml-1">/100 Index</span>
          </div>
          <div className="text-slate-500 text-sm">|</div>
          <div>
            <span className="text-lg font-bold font-mono text-amber-300">
              {metrics.headTiltAngle}°
            </span>
            <span className="text-[10px] font-semibold text-slate-400 ml-1">Tilt</span>
          </div>
        </div>

        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${metrics.postureScore}%` }}
          />
        </div>
      </div>

      {/* 6. Camera Signal Quality (SNR) & FPS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                CV Signal SNR
              </h3>
              <p className="text-[10px] text-slate-400">Optical Fidelity</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {metrics.fps} FPS
          </span>
        </div>

        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {metrics.signalQuality}%
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase">SNR</span>
        </div>

        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${metrics.signalQuality}%` }}
          />
        </div>
      </div>
    </div>
  );
};
