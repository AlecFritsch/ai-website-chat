import { CHAT_WIDGET_ID } from "./constants";

/**
 * Setup the chat widget
 */
export function setupChatWidget() {
  // Create container
  const container = document.createElement("div");
  container.id = CHAT_WIDGET_ID + "-container";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.width = "400px";
  container.style.height = "600px";
  container.style.zIndex = "9999";
  container.style.display = "none";

  // Create the iframe
  const iframe = document.createElement("iframe");
  iframe.id = CHAT_WIDGET_ID;
  iframe.src = chrome.runtime.getURL("src/widget.html");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "1px solid #37373a";
  iframe.style.backgroundColor = "#161618";
  iframe.style.borderRadius = "8px";
  iframe.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.5)";
  iframe.style.display = "block";

  // Create drag handle overlay (only left side of TopBar, excluding buttons)
  const dragHandle = document.createElement("div");
  dragHandle.style.position = "absolute";
  dragHandle.style.top = "0";
  dragHandle.style.left = "0";
  dragHandle.style.width = "200px"; // Only cover title area
  dragHandle.style.height = "48px";
  dragHandle.style.cursor = "grab";
  dragHandle.style.zIndex = "1";
  dragHandle.style.pointerEvents = "auto";

  container.appendChild(iframe);
  container.appendChild(dragHandle);
  document.body.appendChild(container);

  // Dragging logic
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  container.addEventListener("mouseenter", () => {
    if (!isDragging) {
      iframe.style.borderColor = "#838e95";
    }
  });

  container.addEventListener("mouseleave", () => {
    if (!isDragging) {
      iframe.style.borderColor = "#37373a";
    }
  });

  // Mouse down on drag handle to start dragging
  dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - container.offsetLeft;
    offsetY = e.clientY - container.offsetTop;
    dragHandle.style.cursor = "grabbing";
    // Keep same size, don't expand
    e.preventDefault();
  });

  // Mouse move event to drag the container
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      // Disable iframe pointer events during drag
      iframe.style.pointerEvents = "none";
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      requestAnimationFrame(() => {
        container.style.left = `${newX}px`;
        container.style.top = `${newY}px`;
        container.style.bottom = "";
        container.style.right = "";
      });
    }
  });

  // Mouse up event to stop dragging
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      dragHandle.style.cursor = "grab";
      // Re-enable iframe pointer events
      iframe.style.pointerEvents = "auto";
    }
  });
}

/**
 * Makes the widget visible on the page - This is executed within the browser tab
 * @param widgetId string
 */
export function setWidgetToVisibility(widgetId: string, visibile: boolean) {
  const container = document.getElementById(widgetId + "-container");
  if (container) {
    container.style.display = visibile ? "block" : "none";
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
      // hide the container from the current tab
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: (widgetId) => {
          const container = document.getElementById(widgetId + "-container");
          if (container) {
            container.style.display = "none";
          }
        },
        args: [CHAT_WIDGET_ID],
      });
    }
  });
};
