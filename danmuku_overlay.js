// ==UserScript==
// @name         Danmuku Overlay
// @namespace    http://tampermonkey.net/
// @version      2023-12-31
// @description  Create an overlay of danmuku on a selected video element
// @author       You
// @match        http://localhost:8000
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ntdm9.com
// @grant        unsafeWindow
// @run-at       document-end
// @require      file://D:\tmp\danmuku_overlay\danmuku_overlay.js
// ==/UserScript==

(function() {
'use strict';

// Get video element
// use unsafeWindow to access the video element in the page context
const video = unsafeWindow.document.querySelector('video');
if (!video) {
    alert('No video element found!');
    return;
}
else {
    alert('Video element found!');
}


// Function to parse XML and return Danmuku data
function parseDanmuku(xmlData) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const danmukus = xmlDoc.getElementsByTagName("d");

    return Array.from(danmukus)
    .map(d => {
        const attributes = d.getAttribute("p").split(",");
        const text = d.textContent;
        /*
            p: time, type, ?, color (decimal), sent time, ?, ?, ?, ?
            - time: relative timestamp in milliseconds
            - type: 1 for rolling danmuku, 5 for top danmuku
            - color: decimal representation of color in RGB
            - sent time: unix time when the danmuku was sent 
        */
        return {
            time: parseFloat(attributes[0]),
            type: parseInt(attributes[1]),
            color: parseInt(attributes[3]),
            sentTime: parseInt(attributes[4]),
            text: text
        }
    })
    .sort((a, b) => a.time - b.time);
}


// Function to display Danmuku
function displayDanmuku(danmukuData, video) {
    const overlay = document.createElement("div");
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';

    video.parentElement.style.position = 'relative';
    video.parentElement.appendChild(overlay);

    video.addEventListener('timeupdate', () => {
        danmukuData.forEach(d => {
            if (!(video.currentTime >= d.time && video.currentTime < d.time + 5)) { // Display for 5 seconds
                return;
            }
            const danmukuElement = document.createElement("p");
            danmukuElement.textContent = d.text;
            danmukuElement.style.position = 'absolute';
            danmukuElement.style.top = `${Math.random() * 80}%`; // Random position
            danmukuElement.style.left = '100%';
            danmukuElement.style.whiteSpace = 'nowrap';
            danmukuElement.style.color = `#${d.color.toString(16)}`;
            danmukuElement.style.textShadow = '0 0 2px black';

            overlay.appendChild(danmukuElement);

            const width = danmukuElement.offsetWidth;
            const duration = 10; // Speed of moving

            danmukuElement.style.transition = `transform ${duration}s linear`;
            danmukuElement.style.transform = `translateX(-${width + overlay.offsetWidth}px)`;

            setTimeout(() => danmukuElement.remove(), duration * 1000);
        });
    });
}

// Create file input
const input = document.createElement('input');
input.type = 'file';
input.accept = '.xml';
input.style.position = 'fixed';
input.style.top = '10px';
input.style.left = '10px';
input.style.zIndex = '10000';
document.body.appendChild(input);

input.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) {
        alert('No file selected!');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const danmukuData = parseDanmuku(e.target.result);
        if (!video) {
            alert('No video element found!');
        }
        displayDanmuku(danmukuData, video);
    };
    reader.readAsText(file);
});
})();
