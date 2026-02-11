import React, { useCallback } from "react";
import styles from "./Popup.module.scss";
import AIIcon from "../components/icons/AIIcon";
import { injectChatWidget } from "../utils/widgetControl";

export default function Popup() {
  const injectScript = useCallback(() => {
    injectChatWidget();
    window.close();
  }, []);

  return (
    <div className={styles.popup}>
      <div className={styles.icon}>
        <AIIcon />
      </div>
      <div className={styles.texts}>
        <h2>AI Testing Assistant</h2>
        <p>Chat with AI and record test flows</p>
      </div>
      <button className={styles.cta} onClick={injectScript}>
        Open Chat
      </button>
      <div className={styles.helpText}>
        Alt + C to toggle
      </div>
    </div>
  );
}
