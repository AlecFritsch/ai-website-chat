import React, { useEffect } from 'react';
import useTestStore from '../store/Test.store';
import styles from './TestList.module.scss';
import browser from 'webextension-polyfill';

export default function TestList() {
  const { savedTests, loadTests, deleteTest } = useTestStore();

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const handlePlayTest = async (testId: string) => {
    const test = savedTests.find(t => t.id === testId);
    if (!test) return;

    // Execute each step
    for (const step of test.steps) {
      try {
        await browser.runtime.sendMessage({
          type: "ACTION",
          instruction: step.instruction,
          url: step.url,
        });
        
        // Wait between steps
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Step failed:', error);
        break;
      }
    }
  };

  const handleExport = (testId: string) => {
    const test = savedTests.find(t => t.id === testId);
    if (!test) return;

    const dataStr = JSON.stringify(test, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${test.name.replace(/\s+/g, '_')}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  if (savedTests.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No tests yet</p>
        <p className={styles.hint}>Start recording to create tests</p>
      </div>
    );
  }

  return (
    <div className={styles.testList}>
      <h3>Saved Tests</h3>
      {savedTests.map((test) => (
        <div key={test.id} className={styles.testItem}>
          <div className={styles.testInfo}>
            <div className={styles.testName}>{test.name}</div>
            <div className={styles.testMeta}>
              {test.steps.length} steps · {new Date(test.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className={styles.testActions}>
            <button onClick={() => handlePlayTest(test.id)} title="Play">
              ▶
            </button>
            <button onClick={() => handleExport(test.id)} title="Export">
              ↓
            </button>
            <button onClick={() => deleteTest(test.id)} title="Delete">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
