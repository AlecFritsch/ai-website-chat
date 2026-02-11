import { useShallow } from 'zustand/react/shallow';
import useChatStore from '../store/Chat.store';
import useTestStore from '../store/Test.store';
import { Role } from '../store/Chat.types';
import { RecordingState } from '../store/Test.types';
import { marked } from 'marked';
import browser from 'webextension-polyfill';

export default function useChat() {
  const { addMessage, updateMessage } = useChatStore(
    useShallow(({ updateMessage, addMessage }) => ({
      updateMessage,
      addMessage,
    }))
  );
  
  const { recordingState, addStep } = useTestStore(
    useShallow(({ recordingState, addStep }) => ({
      recordingState,
      addStep,
    }))
  );

  const sendMessage = async (message: string) => {
    // 1. Add user message to UI
    addMessage(Role.user, message);

    // 2. Create a placeholder for the AI response
    const assistantMessageId = addMessage(Role.assistant, 'Denke nach...');

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
      
      console.log("Sending chat message with URL:", url);

      // 4. Send to /chat endpoint - AI decides if action is needed
      const data = await browser.runtime.sendMessage({
        type: "CHAT",
        message: message,
        url: url,
      });

      if (!data || !data.success) {
        throw new Error(data?.error || 'Keine Antwort vom Backend erhalten.');
      }

      // 5. Check if action or analysis is required
      if (data.requiresAction) {
        // Update message to show action is being executed
        updateMessage(assistantMessageId, 'Führe Browser-Action aus...');
        
        // Execute action via /action endpoint
        const actionData = await browser.runtime.sendMessage({
          type: "ACTION",
          instruction: data.response,
          url: url,
        });

        if (!actionData || !actionData.success) {
          throw new Error(actionData?.error || 'Action fehlgeschlagen.');
        }

        // Record step if recording
        if (recordingState === RecordingState.recording) {
          addStep({
            instruction: data.response,
            url: url,
            success: true,
          });
        }

        const formattedResponse = await marked.parse(actionData.message || 'Aktion erfolgreich ausgeführt.');
        updateMessage(assistantMessageId, formattedResponse);
      } else if (data.requiresAnalysis) {
        // Update message to show analysis is being performed
        updateMessage(assistantMessageId, 'Analysiere Webseite...');
        
        // Execute analysis via /analyze endpoint
        const analyzeData = await browser.runtime.sendMessage({
          type: "ANALYZE",
          instruction: data.response,
          url: url,
        });

        if (!analyzeData || !analyzeData.success) {
          throw new Error(analyzeData?.error || 'Analyse fehlgeschlagen.');
        }

        // Format analysis result
        const analysisText = typeof analyzeData.analysis === 'string' 
          ? analyzeData.analysis 
          : JSON.stringify(analyzeData.analysis, null, 2);
        
        const formattedResponse = await marked.parse(analysisText);
        updateMessage(assistantMessageId, formattedResponse);
      } else {
        // Normal chat response
        const formattedResponse = await marked.parse(data.response);
        updateMessage(assistantMessageId, formattedResponse);
      }

    } catch (err: any) {
      console.error("Fehler bei der Kommunikation:", err);
      
      // Record failed step if recording
      if (recordingState === RecordingState.recording) {
        addStep({
          instruction: message,
          url: window.location.href,
          success: false,
        });
      }
      
      const errorMessage = await marked.parse(`**Fehler:** ${err.message}. \n\n*Läuft dein lokaler \`server.js\`?*`);
      updateMessage(assistantMessageId, errorMessage);
    }
  };

  return {
    sendMessage,
  };
}
