// ==UserScript==
// @name         Danmuku Overlay
// @namespace    http://tampermonkey.net/
// @version      2023-12-31
// @description  Create an overlay of danmuku on a selected video element
// @author       You
// @match        https://www.ntdm9.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ntdm9.com
// @grant        none
// ==/UserScript==

(function() {
'use strict';

// Get video after 3 seconds
var video = null;
setTimeout(() => {
    // find all iframes, and find video inside the ifrmames
    alert('Finding video element...');
    // const iframes = document.querySelectorAll('iframe');
    // for (let iframe of iframes) {
    // 	const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    // 	const iframeVideo = iframeDocument.querySelector('video');

    // 	if (iframeVideo) {
    // 		video = iframeVideo;
    // 		break;
    // 	}
    // }
    if (!video) {
        video = document.querySelector('video');
    }
    video ? alert('Video found!') : alert('No video element found!');
}, 3000);

// Function to parse XML and return Danmuku data
function parseDanmuku(xmlData) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const danmukuData = []; // Array to store Danmuku data
    const danmukus = xmlDoc.getElementsByTagName("d");

    for (let danmuku of danmukus) {
        const attributes = danmuku.getAttribute("p").split(",");
        const text = danmuku.textContent;
        /*
            p: time, type, ?, color (decimal), sent time, ?, ?, ?, ?
            - time: relative timestamp in milliseconds
            - type: 1 for rolling danmuku, 5 for top danmuku
            - color: decimal representation of color in RGB
            - sent time: unix time when the danmuku was sent 
        */
        d = {
            time: parseFloat(attributes[0]),
            type: parseInt(attributes[1]),
            color: parseInt(attributes[3]),
            sentTime: parseInt(attributes[4]),
            text: text
        }
        danmukuData.push(d);
    }
    

    // sort by time
    danmukuData.sort((a, b) => a.time - b.time);

    return danmukuData;
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
            if (video.currentTime >= d.time && video.currentTime < d.time + 5) { // Display for 5 seconds
                const danmukuElement = document.createElement("p");
                danmukuElement.textContent = d.text;
                danmukuElement.style.position = 'absolute';
                danmukuElement.style.top = `${Math.random() * 80}%`; // Random position
                danmukuElement.style.left = '100%';
                danmukuElement.style.whiteSpace = 'nowrap';
                danmukuElement.style.color = 'white';
                danmukuElement.style.textShadow = '0 0 2px black';

                overlay.appendChild(danmukuElement);

                const width = danmukuElement.offsetWidth;
                const duration = 10; // Speed of moving

                danmukuElement.style.transition = `transform ${duration}s linear`;
                danmukuElement.style.transform = `translateX(-${width + overlay.offsetWidth}px)`;

                setTimeout(() => danmukuElement.remove(), duration * 1000);
            }
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
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const danmukuData = parseDanmuku(e.target.result);
            if (video) {
                displayDanmuku(danmukuData, video);
            } else {
                alert('No video element found!');
            }
        };
        reader.readAsText(file);
    }
});
})();
