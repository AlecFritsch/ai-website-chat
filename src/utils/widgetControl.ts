import { CHAT_WIDGET_ID } from "./constants";

/**
 * Setup the chat widget
 */
export function setupChatWidget() {
  // Create the iframe
  const iframe = document.createElement("iframe");
  iframe.id = CHAT_WIDGET_ID;
  iframe.src = chrome.runtime.getURL("src/widget.html");
  iframe.style.display = "none";
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "400px";
  iframe.style.height = "600px";
  iframe.style.border = "1px solid #37373a";
  iframe.style.zIndex = "9999";
  iframe.style.backgroundColor = "#161618";
  iframe.style.borderRadius = "8px";
  iframe.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.5)";

  // Add the iframe to the document
  document.body.appendChild(iframe);

  // Dragging logic
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  iframe.addEventListener("mouseenter", () => {
    if (!isDragging) {
      iframe.style.borderColor = "#838e95";
    }
  });

  iframe.addEventListener("mouseleave", () => {
    if (!isDragging) {
      iframe.style.borderColor = "#37373a";
    }
  });

  // Mouse down event to start dragging - only in top 80px area (TopBar + Tabs)
  iframe.addEventListener("mousedown", (e) => {
    const rect = iframe.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    
    // Only allow dragging from top 80px (TopBar + Tabs area)
    if (relativeY <= 80) {
      isDragging = true;
      offsetX = e.clientX - iframe.offsetLeft;
      offsetY = e.clientY - iframe.offsetTop;
      iframe.style.pointerEvents = "none";
      e.preventDefault();
    }
  });

  // Mouse move event to drag the iframe
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      
      requestAnimationFrame(() => {
        iframe.style.left = `${newX}px`;
        iframe.style.top = `${newY}px`;
        iframe.style.bottom = "";
        iframe.style.right = "";
      });
    }
  });

  // Mouse up event to stop dragging
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      iframe.style.pointerEvents = "auto";
    }
  });
}

/**
 * Makes the widget visible on the page - This is executed within the browser tab
 * @param widgetId string
 */
export function setWidgetToVisibility(widgetId: string, visibile: boolean) {
  const iframe = document.getElementById(widgetId) as HTMLIFrameElement;
  if (iframe) {
    iframe.style.display = visibile ? "block" : "none";
  }
}

export function setupTriggers() {
  // allow the chat widget to be toggled by alt + c or option + c
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.code === "KeyC") {
      setWidgetToVisibility(CHAT_WIDGET_ID, true);
    }
    if (e.key === "Escape") {
      setWidgetToVisibility(CHAT_WIDGET_ID, false);
    }
  });
}

/**
 * Inject the chat widget to the current tab
 */
export const injectChatWidget = async () => {
  // get the current document from browser tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  if (currentTab && currentTab.id) {
    // inject the script to the current tab
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: setWidgetToVisibility,
      args: [CHAT_WIDGET_ID, true],
    });
  }
};

/**
 * Remove the chat widget from the current tab
 */
export const removeChatWidget = async () => {
  // get the current document from browser tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];

    if (currentTab && currentTab.id) {
      // remove the iframe from the current tab
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: (widgetId) => {
          const iframe = document.getElementById(widgetId);
          if (iframe) {
            iframe.style.display = "none";
          }
        },
        args: [CHAT_WIDGET_ID],
      });
    }
  });
};
