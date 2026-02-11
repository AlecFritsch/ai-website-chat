import { useShallow } from 'zustand/react/shallow';
import useChatStore from '../store/Chat.store';
import { Role } from '../store/Chat.types';
import { marked } from 'marked';
import browser from 'webextension-polyfill';

export default function useChat() {
  const { addMessage, updateMessage } = useChatStore(
    useShallow(({ updateMessage, addMessage }) => ({
      updateMessage,
      addMessage,
    }))
  );

  const sendMessage = async (message: string) => {
    // 1. Add user message to UI
    addMessage(Role.user, message);

    // 2. Create a placeholder for the AI response
    const assistantMessageId = addMessage(Role.assistant, 'Agent wird initialisiert...');

    try {
      // 3. Get URL
      let url = window.location.href;
      
      try {
        // Try to get active tab URL via polyfill
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0] && tabs[0].url) {
          url = tabs[0].url;
        }
      } catch (e) {
        console.log("Using window.location.href as fallback", e);
      }
      
      console.log("Prompting background for URL:", url);

      // 4. Send the prompt to our background script (to bypass Mixed Content / CORS)
      const data = await browser.runtime.sendMessage({
        type: "RUN_STAGEHAND_TEST",
        prompt: message,
        url: url,
      });

      if (!data || !data.success) {
        throw new Error(data?.error || 'Keine Antwort vom Backend erhalten.');
      }

      const formattedResponse = await marked.parse(data.message || 'Aktion erfolgreich ausgeführt.');
      
      // 5. Update the AI message with the final result
      updateMessage(assistantMessageId, formattedResponse);

    } catch (err: any) {
      console.error("Fehler bei der Kommunikation:", err);
      const errorMessage = await marked.parse(`**Fehler:** ${err.message}. \n\n*Läuft dein lokaler \`server.js\`?*`);
      updateMessage(assistantMessageId, errorMessage);
    }
  };

  return {
    sendMessage,
  };
}
