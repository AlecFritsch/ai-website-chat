import browser from "webextension-polyfill";

console.log("Background service worker active.");

browser.runtime.onMessage.addListener((message, _sender) => {
  if (message.type === "RUN_STAGEHAND_TEST") {
    console.log("Received RUN_STAGEHAND_TEST for prompt:", message.prompt);
    
    // Return a promise for async response
    return fetch('http://localhost:3000/run-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: message.prompt,
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
