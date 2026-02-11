import React, { useCallback } from "react";
import styles from "./PanelLayout.module.scss";
import TopBar from "../components/TopBar";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <TopBar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
