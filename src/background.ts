import browser from "webextension-polyfill";

console.log("Background service worker active.");

browser.runtime.onMessage.addListener((message, _sender) => {
  // Chat endpoint - AI decides if action is needed
  if (message.type === "CHAT") {
    console.log("Received CHAT message:", message.message);
    
    return fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.message,
        url: message.url,
      }),
    })
      .then(async response => {
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server error: ${response.status} ${errText}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error("Background fetch error:", error);
        return { success: false, error: error.message };
      });
  }
  
  // Action endpoint - execute browser action via CDP
  if (message.type === "ACTION") {
    console.log("Received ACTION instruction:", message.instruction);
    
    return fetch('http://localhost:3000/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instruction: message.instruction,
        url: message.url,
      }),
    })
      .then(async response => {
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server error: ${response.status} ${errText}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error("Background fetch error:", error);
        return { success: false, error: error.message };
      });
  }
  
  // Analyze endpoint - analyze webpage with Stagehand
  if (message.type === "ANALYZE") {
    console.log("Received ANALYZE instruction:", message.instruction);
    
    return fetch('http://localhost:3000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instruction: message.instruction,
        url: message.url,
      }),
    })
      .then(async response => {
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server error: ${response.status} ${errText}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error("Background fetch error:", error);
        return { success: false, error: error.message };
      });
  }
});
