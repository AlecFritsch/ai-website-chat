import { create } from "zustand";
import { ChatRole, ChatStoreState, Message, Role } from "./Chat.types";
import { v4 as uuid } from "uuid";
import { API_KEY_STORAGE_KEY } from "../utils/constants";

const useChatStore = create<ChatStoreState>((set) => ({
  messages: {},
  apiKey: "gemini-key-managed-in-backend", // Dummy key

  saveApiKey: (key: string) => {
    // Diese Funktion wird nicht mehr benötigt, da wir keinen Key im Frontend speichern
    console.log("API Key wird jetzt im Backend verwaltet.");
  },

  addMessage: (role: ChatRole, content: string) => {
    const messageId = uuid();
    set((state) => ({
      messages: {
        ...state.messages,
        [messageId]: {
          id: messageId,
          role,
          content,
        },
      },
    }));
    return messageId;
  },

  updateMessage: (id: string, content: string) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [id]: {
          ...(state.messages[id] || { id, role: Role.assistant }),
          content,
        },
      },
    }));
  },

  clearMessages: () => {
    set({ messages: {} });
  },
}));

export default useChatStore;
