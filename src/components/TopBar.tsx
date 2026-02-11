import React, { useCallback, useState } from "react";
import styles from "./TopBar.module.scss";
import BackIcon from "./icons/BackIcon";
import ClearIcon from "./icons/ClearIcon";
import useChatStore from "../store/Chat.store";
import useTestStore from "../store/Test.store";
import { RecordingState } from "../store/Test.types";
import { useShallow } from "zustand/react/shallow";
import { removeChatWidget } from "../utils/widgetControl";

export default function TopBar() {
  const { clearMessages, messages } = useChatStore(
    useShallow(({ messages, clearMessages }) => ({
      messages,
      clearMessages,
    }))
  );

  const { recordingState, startRecording, stopRecording, saveTest, currentTest } = useTestStore();
  const [testName, setTestName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const removeWidget = useCallback(() => {
    removeChatWidget();
  }, []);

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

  return (
    <div className={styles.topBar} data-drag-handle="true">
      <div className={styles.header}>
        {messages && Object.keys(messages).length > 0 && (
          <button className={styles.backButton} onClick={clearMessages}>
            <BackIcon size={18} />
          </button>
        )}
        <h1 className={styles.title}>AI Testing</h1>
      </div>
      {/* Action buttons  */}
      <div className={styles.actions}>
        {recordingState === RecordingState.idle ? (
          showNameInput ? (
            <>
              <input
                type="text"
                placeholder="Test Name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartRecording()}
                className={styles.nameInput}
                autoFocus
              />
              <button onClick={handleStartRecording} className={styles.actionButton} title="Start Recording">
                <span style={{ fontSize: '16px' }}>▶</span>
              </button>
              <button onClick={() => setShowNameInput(false)} className={styles.actionButton} title="Cancel">
                <span style={{ fontSize: '20px' }}>×</span>
              </button>
            </>
          ) : (
            <button onClick={() => setShowNameInput(true)} className={styles.actionButton} title="Record Test">
              <span style={{ fontSize: '18px' }}>●</span>
            </button>
          )
        ) : (
          <>
            <span className={styles.recordingIndicator} title={`Recording: ${currentTest?.name}`}>
              <span style={{ fontSize: '16px' }}>●</span> {currentTest?.steps.length || 0}
            </span>
            <button onClick={handleStopAndSave} className={styles.actionButton} title="Stop & Save">
              <span style={{ fontSize: '16px' }}>■</span>
            </button>
          </>
        )}
        <button className={styles.actionButton} onClick={removeWidget} title="Close">
          <ClearIcon size={18} />
        </button>
      </div>
    </div>
  );
}
