var script = document.createElement('script');
script.src = chrome.runtime.getURL('danmuku_overlay.js');
(document.head || document.documentElement).appendChild(script);
console.log('Injected danmuku_overlay.js');
console.log(document.querySelector("video"));
console.log(document);