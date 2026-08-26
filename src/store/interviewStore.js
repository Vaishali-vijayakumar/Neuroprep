import { create } from 'zustand';

const useInterviewStore = create((set) => ({
  // Configuration State
  config: null,

  // Session Pipeline State: 'selection' | 'config' | 'device_check' | 'live' | 'completed'
  pipelineState: 'selection',

  // Timer State (seconds elapsed)
  elapsedSeconds: 0,

  // Real-time Telemetry State
  stressIndex: 0,
  transcript: [],

  // AI Evaluation
  lastRubric: null,
  report: null,

  // Shared camera + mic stream (set in DeviceCheck, consumed in InterviewRoom)
  mediaStream: null,

  // Actions
  setPipelineState: (stateName) => set({ pipelineState: stateName }),
  setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),

  startDeviceCheck: () => set({ pipelineState: 'device_check' }),
  startInterview:   () => set({ pipelineState: 'live', stressIndex: 0, transcript: [], elapsedSeconds: 0, lastRubric: null, report: null }),
  endInterview:     (report) => set((state) => ({ pipelineState: 'completed', ...(report ? { report } : {}) })),
  exitInterview:    () => set({ config: null, pipelineState: 'selection', transcript: [], elapsedSeconds: 0, mediaStream: null, report: null }),

  setMediaStream:  (mediaStream) => set({ mediaStream }),

  tickTimer:      () => set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  setStressIndex: (stressIndex) => set({ stressIndex }),
  setLastRubric:  (lastRubric)  => set({ lastRubric }),
  setReport:      (report)      => set({ report }),
  addTranscriptLine: (line) => set((state) => ({
    transcript: [...state.transcript, { ...line, timestamp: line.timestamp || new Date().toISOString() }],
  })),
}));

export default useInterviewStore;
