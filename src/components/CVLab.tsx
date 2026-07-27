import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  Activity,
  Eye,
  Brain,
  ChevronRight,
  Code2,
  CheckCircle2,
} from 'lucide-react';

export const CVLab: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      title: '1. Face Detection & Forehead ROI Extraction',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      summary:
        'Locates facial bounding box and extracts the forehead Region of Interest (ROI) where micro-vascular blood circulation is highest.',
      mathFormula: 'ROI_{forehead} = (x_{face} + 0.25 \\cdot w, \\; y_{face} + 0.12 \\cdot h, \\; 0.5 \\cdot w, \\; 0.18 \\cdot h)',
      explanation:
        'Using color matrix spatial filters and facial landmarks, the algorithm isolates skin regions on the forehead and cheeks. This prevents background noise, hair, and clothing from distorting optical vascular signals.',
      codeSnippet: `// Extract Forehead ROI green channel mean intensity
let totalGreen = 0, pixelCount = 0;
for (let y = roiY; y < roiY + roiH; y++) {
  for (let x = roiX; x < roiX + roiW; x++) {
    const idx = (y * width + x) * 4;
    totalGreen += framePixels[idx + 1]; // Green channel
    pixelCount++;
  }
}
const meanGreen = totalGreen / pixelCount;`,
    },
    {
      id: 2,
      title: '2. RGB Channel Decomposition (Green Light Absorption)',
      icon: <Cpu className="w-5 h-5 text-teal-400" />,
      summary:
        'Decomposes video frames into RGB matrices. Hemoglobin in cutaneous capillaries absorbs green light (520-575nm) most intensely.',
      mathFormula: 'I_{green}(t) = \\frac{1}{N} \\sum_{(x,y) \\in ROI} G(x,y,t)',
      explanation:
        'With each cardiac ventricular contraction, a arterial pressure pulse wave travels through blood vessels, increasing micro-vascular blood volume in the face. Green light absorption spikes, producing a periodic fluctuation $I_{green}(t)$ proportional to heart rate.',
      codeSnippet: `// Buffer raw green light intensity across time
greenBuffer.push(meanGreen);
timestamps.push(performance.now());
if (greenBuffer.length > 300) {
  greenBuffer.shift();
  timestamps.shift();
}`,
    },
    {
      id: 3,
      title: '3. Moving-Average Detrending & Bandpass Filtering',
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      summary:
        'Removes low-frequency baseline drifts (head sway, lighting shifts) and high-frequency camera noise using bandpass filtering (0.7 Hz - 3.5 Hz).',
      mathFormula: '0.7 \\text{ Hz} \\le f \\le 3.5 \\text{ Hz} \\quad \\iff \\quad 42 \\text{ BPM} \\le HR \\le 210 \\text{ BPM}',
      explanation:
        'A moving-average subtraction detrends slow lighting variations. Next, a digital Butterworth-like smoothing filter suppresses frequencies outside human physiological heart rates.',
      codeSnippet: `// Moving average detrending
const ma = windowSum / windowCount;
const detrendedVal = rawGreen[i] - ma;

// Low-pass smoothing filter
smoothed = smoothed + alpha * (detrendedVal - smoothed);`,
    },
    {
      id: 4,
      title: '4. Peak Detection & HRV Interval Analysis',
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      summary:
        'Detects cardiac pulse peaks to calculate Heart Rate (BPM) and Inter-Beat Interval (IBI) variations for Heart Rate Variability (HRV).',
      mathFormula: '\\text{SDNN} = \\sqrt{\\frac{1}{N} \\sum (IBI_i - \\overline{IBI})^2}, \\quad \\text{RMSSD} = \\sqrt{\\frac{1}{N-1} \\sum (IBI_{i+1} - IBI_i)^2}',
      explanation:
        'Peaks are identified when filtered PPG exceeds moving threshold $+ 0.35 \\sigma$. Time differences between successive peaks yield NN intervals, from which SDNN and RMSSD quantify sympathetic vs parasympathetic vagal tone.',
      codeSnippet: `// Peak detection logic
if (curr > threshold && curr >= prev && curr >= next) {
  const ibi = currentPeakTime - lastPeakTime;
  calculatedBpm = 60000 / ibi; // BPM calculation
  ibis.push(ibi);
}`,
    },
    {
      id: 5,
      title: '5. Ocular Aspect Ratio (EAR) & Fatigue Index',
      icon: <Eye className="w-5 h-5 text-amber-400" />,
      summary:
        'Tracks eye aperture and blink frequency to compute drowsiness and cognitive fatigue scores.',
      mathFormula: '\\text{EAR} = \\frac{||p_2 - p_6|| + ||p_3 - p_5||}{2 \\cdot ||p_1 - p_4||}',
      explanation:
        'Six facial eye landmarks define the vertical and horizontal aperture ratio. An EAR $< 0.18$ indicates an active blink event. Prolonged blink durations and low EAR values indicate driver drowsiness or fatigue.',
      codeSnippet: `// Eye Aspect Ratio calculation
const verticalDist = (p2_p6 + p3_p5) / 2;
const ear = verticalDist / horizontalDist;
if (ear < 0.18) {
  blinkCount++;
  isClosed = true;
}`,
    },
    {
      id: 6,
      title: '6. Gemini AI Multimodal Health Prediction Pipeline',
      icon: <Brain className="w-5 h-5 text-emerald-400" />,
      summary:
        'Transmits real-time CV biomarkers to server-side Gemini 3.6 Flash model to evaluate autonomic health, stress risk, and clinical wellness recommendations.',
      mathFormula: 'f_{\\text{Gemini}}(\\text{BPM}, \\text{SDNN}, \\text{RMSSD}, \\text{EAR}, \\text{Profile}) \\rightarrow \\text{Health Risk Report}',
      explanation:
        'Gemini combines non-contact optical biomarkers with user age, sleep, and lifestyle context to perform clinical-grade autonomic nervous system modeling and generate personalized medical recommendations.',
      codeSnippet: `// Server-side Gemini API prompt & schema call
const response = await ai.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: promptText,
  config: { responseSchema: healthReportSchema }
});`,
    },
  ];

  const currentStep = steps.find((s) => s.id === activeStep) || steps[0];

  return (
    <div className="space-y-6 my-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">OpenCV Computer Vision Laboratory</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive technical methodology of rPPG, green light absorption, FFT frequency extraction, and Gemini AI modeling.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-slate-800 text-emerald-400 text-xs font-mono border border-slate-700">
          OpenCV.js / WebAssembly rPPG 2.0
        </span>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              activeStep === step.id
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <div className="mb-2">{step.icon}</div>
            <span className="text-[11px] font-bold font-mono leading-tight">
              Step 0{step.id}
            </span>
          </button>
        ))}
      </div>

      {/* Step Detail Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {currentStep.icon}
            <span>{currentStep.title}</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Active Module
          </span>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {currentStep.summary}
        </p>

        {/* Math Formula Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Mathematical Formulation
          </span>
          <code className="text-xs font-mono text-cyan-400 block overflow-x-auto py-1">
            {currentStep.mathFormula}
          </code>
        </div>

        {/* Detailed Explanation */}
        <div className="text-xs text-slate-300 leading-relaxed space-y-2">
          <p>{currentStep.explanation}</p>
        </div>

        {/* Code Snippet Box */}
        <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              TypeScript / OpenCV.js Algorithm
            </span>
            <span>cvEngine.ts</span>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            {currentStep.codeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
