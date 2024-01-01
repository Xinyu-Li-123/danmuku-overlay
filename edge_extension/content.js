var script = document.createElement('script');
script.src = chrome.extension.getURL('danmuku_overlay.js');
(document.head || document.documentElement).appendChild(script);
console.log("Danmuku Overlay injected");
console.log(script.src)