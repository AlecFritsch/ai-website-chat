export interface TestStep {
  id: string;
  timestamp: number;
  instruction: string;
  url: string;
  success: boolean;
}

export interface TestFlow {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  steps: TestStep[];
  baseUrl: string;
}

export enum RecordingState {
  idle = 'idle',
  recording = 'recording',
  paused = 'paused',
}
