import { create } from 'zustand';
import { RecordingState, TestFlow, TestStep } from './Test.types';

interface TestStore {
  recordingState: RecordingState;
  currentTest: TestFlow | null;
  savedTests: TestFlow[];
  
  // Recording actions
  startRecording: (name: string, baseUrl: string) => void;
  stopRecording: () => void;
  addStep: (step: Omit<TestStep, 'id' | 'timestamp'>) => void;
  
  // Test management
  saveTest: () => void;
  loadTests: () => void;
  deleteTest: (testId: string) => void;
  
  // Playback
  playTest: (testId: string) => Promise<void>;
}

const useTestStore = create<TestStore>((set, get) => ({
  recordingState: RecordingState.idle,
  currentTest: null,
  savedTests: [],
  
  startRecording: (name: string, baseUrl: string) => {
    const newTest: TestFlow = {
      id: `test_${Date.now()}`,
      name,
      description: '',
      createdAt: Date.now(),
      steps: [],
      baseUrl,
    };
    
    set({
      recordingState: RecordingState.recording,
      currentTest: newTest,
    });
  },
  
  stopRecording: () => {
    set({ recordingState: RecordingState.idle });
  },
  
  addStep: (step) => {
    const { currentTest, recordingState } = get();
    
    if (recordingState !== RecordingState.recording || !currentTest) {
      return;
    }
    
    const newStep: TestStep = {
      ...step,
      id: `step_${Date.now()}`,
      timestamp: Date.now(),
    };
    
    set({
      currentTest: {
        ...currentTest,
        steps: [...currentTest.steps, newStep],
      },
    });
  },
  
  saveTest: () => {
    const { currentTest, savedTests } = get();
    
    if (!currentTest || currentTest.steps.length === 0) {
      return;
    }
    
    // Save to localStorage
    const updatedTests = [...savedTests, currentTest];
    localStorage.setItem('ai_test_flows', JSON.stringify(updatedTests));
    
    set({
      savedTests: updatedTests,
      currentTest: null,
      recordingState: RecordingState.idle,
    });
  },
  
  loadTests: () => {
    const stored = localStorage.getItem('ai_test_flows');
    if (stored) {
      try {
        const tests = JSON.parse(stored);
        set({ savedTests: tests });
      } catch (e) {
        console.error('Failed to load tests:', e);
      }
    }
  },
  
  deleteTest: (testId: string) => {
    const { savedTests } = get();
    const updated = savedTests.filter(t => t.id !== testId);
    localStorage.setItem('ai_test_flows', JSON.stringify(updated));
    set({ savedTests: updated });
  },
  
  playTest: async (testId: string) => {
    const { savedTests } = get();
    const test = savedTests.find(t => t.id === testId);
    
    if (!test) {
      throw new Error('Test not found');
    }
    
    // Execute each step via background script
    for (const step of test.steps) {
      // Send action to backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait between steps
      // TODO: Implement actual execution
    }
  },
}));

export default useTestStore;
