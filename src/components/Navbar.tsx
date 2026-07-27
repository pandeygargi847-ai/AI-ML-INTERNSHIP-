import React from 'react';
import {
  Activity,
  Camera,
  Play,
  Cpu,
  User,
  MessageSquare,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CVMode } from '../types';

interface NavbarProps {
  cvMode: CVMode;
  setCvMode: (mode: CVMode) => void;
  activeTab: 'monitor' | 'trends' | 'lab';
  setActiveTab: (tab: 'monitor' | 'trends' | 'lab') => void;
  onOpenProfile: () => void;
  onOpenChat: () => void;
  isScanning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cvMode,
  setCvMode,
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenChat,
  isScanning,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6 text-slate-950 animate-pulse" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                OpenCV Health Vision
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                rPPG AI 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Non-Contact Vitals Monitoring & Gemini Health Prediction
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            id="nav-tab-monitor"
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'monitor'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Live Monitor</span>
          </button>

          <button
            id="nav-tab-trends"
            onClick={() => setActiveTab('trends')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'trends'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>History & Trends</span>
          </button>

          <button
            id="nav-tab-lab"
            onClick={() => setActiveTab('lab')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'lab'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>OpenCV Lab</span>
          </button>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center justify-end space-x-2">
          {/* Camera Mode Toggle */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              id="mode-btn-live"
              disabled={isScanning}
              onClick={() => setCvMode('live')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                cvMode === 'live'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Use Webcam Feed"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Webcam</span>
            </button>

            <button
              id="mode-btn-demo"
              disabled={isScanning}
              onClick={() => setCvMode('demo')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                cvMode === 'demo'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Interactive Simulation Demo Mode"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo Sim</span>
            </button>
          </div>

          {/* User Profile */}
          <button
            id="btn-user-profile"
            onClick={onOpenProfile}
            className="flex items-center space-x-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            title="User Profile Context"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">Profile</span>
          </button>

          {/* AI Doctor Chat */}
          <button
            id="btn-open-chat"
            onClick={onOpenChat}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition-all shadow-sm"
            title="AI Health Assistant"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Assist</span>
          </button>
        </div>
      </div>
    </header>
  );
};
