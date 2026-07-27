import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { ScanSession } from '../types';
import { Calendar, Trash2, Activity, Heart, ShieldCheck } from 'lucide-react';

interface HistoryTrendsProps {
  sessions: ScanSession[];
  onClearHistory: () => void;
}

export const HistoryTrends: React.FC<HistoryTrendsProps> = ({
  sessions,
  onClearHistory,
}) => {
  if (sessions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center my-6 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No Scan Sessions Recorded Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Run a 20-second OpenCV health scan to log your Heart Rate, HRV, Respiration Rate, and Gemini AI health predictions here.
        </p>
      </div>
    );
  }

  // Format chart data
  const chartData = sessions.map((s, idx) => ({
    time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    bpm: s.metrics.heartRate,
    sdnn: s.metrics.hrvSdnn,
    respiration: s.metrics.respirationRate,
    fatigue: s.metrics.fatigueIndex,
    score: s.prediction?.overallHealthScore || 85,
  }));

  return (
    <div className="space-y-6 my-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Biometric Scan History & Trends</h2>
          <p className="text-xs text-slate-400">
            {sessions.length} recorded OpenCV rPPG sessions in local storage
          </p>
        </div>

        <button
          id="btn-clear-history"
          onClick={onClearHistory}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-xs font-medium border border-slate-700 hover:border-rose-500/30 transition-all flex items-center space-x-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Recharts Graphical Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heart Rate & HRV Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Heart Rate (BPM) & HRV SDNN (ms)</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="bpm"
                  name="Heart Rate (BPM)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f43f5e' }}
                />
                <Line
                  type="monotone"
                  dataKey="sdnn"
                  name="HRV SDNN (ms)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Score & Fatigue Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Overall Health Score vs Fatigue Index</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Health Score (/100)"
                  stroke="#10b981"
                  fill="rgba(16, 185, 129, 0.15)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="fatigue"
                  name="Fatigue Index"
                  stroke="#a855f7"
                  fill="rgba(168, 85, 247, 0.15)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sessions History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Past Scan Sessions Log
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Heart Rate</th>
                <th className="p-3.5">HRV SDNN</th>
                <th className="p-3.5">Respiration</th>
                <th className="p-3.5">Fatigue</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Health Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 text-slate-200">
                    {new Date(s.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-rose-400 font-bold">{s.metrics.heartRate} BPM</td>
                  <td className="p-3.5 text-emerald-400 font-bold">{s.metrics.hrvSdnn} ms</td>
                  <td className="p-3.5 text-cyan-400">{s.metrics.respirationRate} RPM</td>
                  <td className="p-3.5 text-purple-400">{s.metrics.fatigueIndex}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.prediction?.riskLevel === 'LOW'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {s.prediction?.riskLevel || 'NORMAL'}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-400">
                    {s.prediction?.overallHealthScore || 85} / 100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
