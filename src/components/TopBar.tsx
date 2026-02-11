import React, { useCallback } from "react";
import styles from "./TopBar.module.scss";
import BackIcon from "./icons/BackIcon";
import ClearIcon from "./icons/ClearIcon";
import useChatStore from "../store/Chat.store";
import { useShallow } from "zustand/react/shallow";
import { removeChatWidget } from "../utils/widgetControl";

export default function TopBar() {
  const { clearMessages, messages } = useChatStore(
    useShallow(({ messages, clearMessages }) => ({
      messages,
      clearMessages,
    }))
  );

  const removeWidget = useCallback(() => {
    removeChatWidget();
  }, []);

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
        <button className={styles.actionButton} onClick={removeWidget}>
          <ClearIcon size={18} />
        </button>
      </div>
    </div>
  );
}
