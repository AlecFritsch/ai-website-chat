import React, { useState } from "react";
import ChatScreen from "../components/ChatScreen";
import TestList from "../components/TestList";
import PanelLayout from "../layouts/PanelLayout";
import styles from "./Panel.module.scss";

export default function Panel() {
  const [activeTab, setActiveTab] = useState<'chat' | 'tests'>('chat');

  return (
    <PanelLayout>
      <div className={styles.panelContainer}>
        <div className={styles.tabs}>
          <button 
            className={activeTab === 'chat' ? styles.active : ''}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button 
            className={activeTab === 'tests' ? styles.active : ''}
            onClick={() => setActiveTab('tests')}
          >
            Tests
          </button>
        </div>
        
        {activeTab === 'chat' ? (
          <ChatScreen />
        ) : (
          <TestList />
        )}
      </div>
    </PanelLayout>
  );
}
