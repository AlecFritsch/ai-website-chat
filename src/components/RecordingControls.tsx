import React, { useState } from 'react';
import useTestStore from '../store/Test.store';
import { RecordingState } from '../store/Test.types';
import styles from './RecordingControls.module.scss';

export default function RecordingControls() {
  const { recordingState, startRecording, stopRecording, saveTest, currentTest } = useTestStore();
  const [testName, setTestName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleStartRecording = () => {
    if (!testName.trim()) {
      setShowNameInput(true);
      return;
    }
    
    const url = window.location.href;
    startRecording(testName, url);
    setShowNameInput(false);
    setTestName('');
  };

  const handleStopAndSave = () => {
    stopRecording();
    saveTest();
  };

  if (recordingState === RecordingState.idle) {
    return (
      <div className={styles.controls}>
        {showNameInput ? (
          <div className={styles.nameInput}>
            <input
              type="text"
              placeholder="Test Name..."
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartRecording()}
              autoFocus
            />
            <button onClick={handleStartRecording} className={styles.startBtn}>
              Start
            </button>
            <button onClick={() => setShowNameInput(false)} className={styles.cancelBtn}>
              ×
            </button>
          </div>
        ) : (
          <button onClick={() => setShowNameInput(true)} className={styles.recordBtn}>
            ● Record Test
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.controls}>
      <div className={styles.recordingIndicator}>
        <span className={styles.pulse}>●</span>
        <span>{currentTest?.name}</span>
        <span className={styles.stepCount}>{currentTest?.steps.length || 0}</span>
      </div>
      <button onClick={handleStopAndSave} className={styles.stopBtn}>
        ■ Stop & Save
      </button>
    </div>
  );
}
