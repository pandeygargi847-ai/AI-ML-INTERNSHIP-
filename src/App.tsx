import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { VisionFeed } from './components/VisionFeed';
import { VitalsDisplay } from './components/VitalsDisplay';
import { PredictionCard } from './components/PredictionCard';
import { HistoryTrends } from './components/HistoryTrends';
import { CVLab } from './components/CVLab';
import { UserProfileModal } from './components/UserProfileModal';
import { AIChatModal } from './components/AIChatModal';
import {
  CVMetrics,
  CVMode,
  CVFilterMode,
  HealthPrediction,
  ScanSession,
  UserProfile,
} from './types';
import {
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  Activity,
  Heart,
  Eye,
  BookOpen,
} from 'lucide-react';

export default function App() {
  // Navigation & Mode
  const [cvMode, setCvMode] = useState<CVMode>('demo'); // Default to interactive demo simulation so app is instantly alive!
  const [cvFilterMode, setCvFilterMode] = useState<CVFilterMode>('opencv_matrix');
  const [activeTab, setActiveTab] = useState<'monitor' | 'trends' | 'lab'>('monitor');

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('opencv_health_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      age: 28,
      gender: 'male',
      sleepHours: 7.5,
      activityLevel: 'moderate',
      recentSymptoms: [],
    };
  });

  // Save profile to localStorage
  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem('opencv_health_profile', JSON.stringify(updated));
  };

  // Real-time CV Metrics & Waveform
  const [currentMetrics, setCurrentMetrics] = useState<CVMetrics>({
    heartRate: 72,
    hrvSdnn: 46,
    hrvRmssd: 39,
    respirationRate: 16,
    fatigueIndex: 22,
    blinkRate: 14,
    eyeAspectRatio: 0.28,
    postureScore: 94,
    headTiltAngle: 1.2,
    signalQuality: 88,
    fps: 30,
  });
  const [ppgWave, setPpgWave] = useState<number[]>([]);

  // Scan & Prediction State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [prediction, setPrediction] = useState<HealthPrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  // Scan Sessions History
  const [sessions, setSessions] = useState<ScanSession[]>(() => {
    const saved = localStorage.getItem('opencv_health_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('opencv_health_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Scan Timer Reference
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time callback from VisionFeed
  const handleMetricsUpdate = (metrics: CVMetrics, wave: number[]) => {
    setCurrentMetrics(metrics);
    setPpgWave(wave);
  };

  // Start 20s Health Scan
  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    const startTime = Date.now();
    const duration = 20000; // 20 seconds

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setScanProgress(progress);

      if (elapsed >= duration) {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        finishScan();
      }
    }, 200);
  };

  // Cancel Scan
  const handleCancelScan = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setIsScanning(false);
    setScanProgress(0);
  };

  // Finish Scan & call Gemini API
  const finishScan = async () => {
    setIsScanning(false);
    setIsPredicting(true);

    try {
      const res = await fetch('/api/predict-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: currentMetrics,
          profile,
          durationSeconds: 20,
        }),
      });

      const data: HealthPrediction = await res.json();
      setPrediction(data);

      // Save session log
      const newSession: ScanSession = {
        id: 'scan_' + Date.now(),
        timestamp: new Date().toISOString(),
        durationSeconds: 20,
        metrics: currentMetrics,
        prediction: data,
        rawPpgWave: ppgWave,
        profile,
      };

      setSessions((prev) => [newSession, ...prev]);
    } catch (err) {
      console.error('Failed to get Gemini prediction:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleClearHistory = () => {
    setSessions([]);
    localStorage.removeItem('opencv_health_sessions');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar Navigation */}
      <Navbar
        cvMode={cvMode}
        setCvMode={setCvMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        isScanning={isScanning}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* Tab 1: Live Monitor & Scan Dashboard */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            {/* Top Info Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    OpenCV Computer Vision rPPG Vitals Monitor
                  </h2>
                  <p className="text-xs text-slate-400">
                    Facial micro-vascular pulse extraction • Real-time Green channel BVP filtering • Gemini AI risk prediction
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Privacy First (Local Frame Matrix)</span>
                </span>
              </div>
            </div>

            {/* Video Stage Container */}
            <VisionFeed
              cvMode={cvMode}
              cvFilterMode={cvFilterMode}
              setCvFilterMode={setCvFilterMode}
              onMetricsUpdate={handleMetricsUpdate}
              isScanning={isScanning}
              scanProgress={scanProgress}
              onStartScan={handleStartScan}
              onCancelScan={handleCancelScan}
            />

            {/* Real-time Extracted Vitals Metrics Bar */}
            <VitalsDisplay metrics={currentMetrics} />

            {/* Gemini AI Prediction Card */}
            <PredictionCard
              prediction={prediction}
              metrics={currentMetrics}
              profile={profile}
              isLoading={isPredicting}
            />
          </div>
        )}

        {/* Tab 2: Scan History & Trends */}
        {activeTab === 'trends' && (
          <HistoryTrends sessions={sessions} onClearHistory={handleClearHistory} />
        )}

        {/* Tab 3: OpenCV Educational Lab */}
        {activeTab === 'lab' && <CVLab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-400">
              OpenCV Health Monitor & Predictor
            </span>
          </div>

          <p className="text-slate-500">
            Powered by OpenCV Computer Vision Frame Processing & Gemini AI Diagnostic Reasoning
          </p>
        </div>
      </footer>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* AI Doctor Chat Drawer Modal */}
      <AIChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        metrics={currentMetrics}
        prediction={prediction}
      />
    </div>
  );
}
