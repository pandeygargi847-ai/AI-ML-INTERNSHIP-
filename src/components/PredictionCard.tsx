import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Activity,
  CheckCircle,
  Clock,
  Download,
  Brain,
  Zap,
  Info,
} from 'lucide-react';
import { HealthPrediction, CVMetrics, UserProfile } from '../types';

interface PredictionCardProps {
  prediction: HealthPrediction | null;
  metrics: CVMetrics;
  profile: UserProfile;
  isLoading: boolean;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  metrics,
  profile,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center my-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          Generating Gemini AI Diagnostic Report...
        </h3>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed">
          Evaluating rPPG micro-vascular blood volume pulses, HRV spectral density, autonomic tone, and user health profile.
        </p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl my-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Gemini AI Health Risk Prediction Engine</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Complete a 20-second OpenCV rPPG scan to compute cardiovascular risk factors, autonomic stress balance, and personalized medical recommendations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
            Status: Ready
          </span>
        </div>
      </div>
    );
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return {
          label: 'LOW RISK (OPTIMAL)',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <ShieldCheck className="w-4 h-4" />,
        };
      case 'MODERATE':
        return {
          label: 'MODERATE STRESS RISK',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: <ShieldAlert className="w-4 h-4" />,
        };
      default:
        return {
          label: 'ELEVATED CARDIOVASCULAR STRAIN',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: <ShieldAlert className="w-4 h-4" />,
        };
    }
  };

  const riskBadge = getRiskBadge(prediction.riskLevel);

  // Handle report printing/downloading
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 lg:p-8 my-6 transition-all">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Gemini AI Diagnostic Report</h2>
              <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1 ${riskBadge.bg}`}>
                {riskBadge.icon}
                <span>{riskBadge.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generated: {new Date(prediction.timestamp).toLocaleString()} • Confidence: {prediction.confidenceScore}%
            </p>
          </div>
        </div>

        <button
          id="btn-download-pdf"
          onClick={handlePrintReport}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-2 transition-all"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Health Summary</span>
        </button>
      </div>

      {/* Primary Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {/* Overall Score */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Overall Health Index
            </span>
            <div className="flex items-baseline space-x-1 my-1">
              <span className="text-4xl font-extrabold font-mono text-emerald-400">
                {prediction.overallHealthScore}
              </span>
              <span className="text-xs font-bold text-slate-500">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400">Cardiopulmonary stability</p>
          </div>

          <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-emerald-500 flex items-center justify-center font-mono font-bold text-xs text-white">
            {prediction.overallHealthScore}%
          </div>
        </div>

        {/* Autonomic Stress Index */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Autonomic Stress Index
            </span>
            <div className="flex items-baseline space-x-1 my-1">
              <span className="text-4xl font-extrabold font-mono text-cyan-400">
                {prediction.autonomicStressIndex}
              </span>
              <span className="text-xs font-bold text-slate-500">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400">Sympathetic / Vagal balance</p>
          </div>

          <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-cyan-500 flex items-center justify-center font-mono font-bold text-xs text-white">
            {prediction.autonomicStressIndex}%
          </div>
        </div>

        {/* Cardiovascular Wellness */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cardio Wellness Score
            </span>
            <div className="flex items-baseline space-x-1 my-1">
              <span className="text-4xl font-extrabold font-mono text-purple-400">
                {prediction.cardiovascularWellnessScore}
              </span>
              <span className="text-xs font-bold text-slate-500">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400">Micro-vascular pulse tone</p>
          </div>

          <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-purple-500 flex items-center justify-center font-mono font-bold text-xs text-white">
            {prediction.cardiovascularWellnessScore}%
          </div>
        </div>
      </div>

      {/* AI Narrative Physician Summary */}
      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 mb-6">
        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span>Clinical Vitals Assessment & Interpretation</span>
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed">
          {prediction.aiSummary}
        </p>
      </div>

      {/* Biomarkers Breakdown Grid */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Extracted Biomarkers Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {prediction.biomarkers?.map((bm, i) => (
            <div
              key={i}
              className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{bm.name}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{bm.value}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{bm.description}</p>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase shrink-0 ml-2 ${
                  bm.status === 'optimal'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {bm.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Actionable Health Guidance</span>
          </h3>
          <ul className="space-y-2">
            {prediction.recommendations?.map((rec, i) => (
              <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Diagnostic Re-test Guidance</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {prediction.retestTimeframe}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              This AI assessment is for wellness and fitness tracking. Always consult a physician for clinical medical diagnosis.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
