// ==UserScript==
// @name         Danmuku Overlay
// @namespace    http://tampermonkey.net/
// @version      2023-12-31
// @description  Create an overlay of danmuku on a selected video element
// @author       You
// @match        https://www.ntdm9.com/*
// @match        https://danmu.yhdmjx.com/*
// @match        http://localhost:8000/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ntdm9.com
// @grant        unsafeWindow
// @run-at       document-end
// @require      file://D:\tmp\danmuku_overlay\danmuku_overlay.js
// ==/UserScript==

(function() {
'use strict';

let video = null;                   // Video element on which to display danmuku
let overlay = null;                 // Overlay element on which to display danmuku
let displayedDanmukus = new Set();  // Set of displayed danmukus


// configurable parameters
// TODO: add a dropdown menu to tune these configs
let overlayConfig = {
    number_of_rows: 8,
    speedup: 1,
    danmukuConfig: {
        fontSize: 24,
        fontFamily: 'SimHei, \'Microsoft JhengHei\', Arial, Helvetica, sans-serif',
        fontWeight: 'bold',
        textShadow: '1px 0 1px #000000,0 1px 1px #000000,0 -1px 1px #000000,-1px 0 1px #000000',
        opacity: 0.5,
    },
}

/**
 * 
 * @param {*} target - The target element on which to create the overlay
 */
function createOverlay(target) {
    overlay = document.createElement("div");
    overlay.id = 'danmuku-overlay';

    // set to the same size as target
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = target.offsetWidth + 'px';
    overlay.style.height = target.offsetHeight + 'px';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';

    target.parentElement.style.position = 'relative';
    target.parentElement.appendChild(overlay);

    // resize overlay when window is resized
    window.addEventListener('resize', function() {
        overlay.style.width = target.offsetWidth + 'px';
        overlay.style.height = target.offsetHeight + 'px';
    });
    
}

function getVideo() {
    video = unsafeWindow.document.querySelector('video');
    if (!video) {
        alert('No video element found!');
        return;
    }
    alert('Video element found!');
}

// Get video element and create danmuku overlay on page load
window.onload = () => {
    getVideo();
    if (!video) {
        return;
    }
    createOverlay(video);
};


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


// Create and format a single Danmuku element
function createDanmukuElement(d) {
    const danmukuElement = document.createElement("p");
    danmukuElement.textContent = d.text;

    danmukuElement.style.position = 'absolute';
    danmukuElement.style.top = `${Math.random() * 80}%`; // Random position
    danmukuElement.style.left = '100%';

    danmukuElement.style.whiteSpace = 'nowrap';
    danmukuElement.style.opacity = overlayConfig.danmukuConfig.opacity;
    danmukuElement.style.color = `#${d.color.toString(16)}`;

    danmukuElement.style.fontSize = `${overlayConfig.danmukuConfig.fontSize}px`;
    danmukuElement.style.textShadow = overlayConfig.danmukuConfig.textShadow;
    danmukuElement.style.fontFamily = overlayConfig.danmukuConfig.fontFamily;
    danmukuElement.style.fontWeight = overlayConfig.danmukuConfig.fontWeight;

    return danmukuElement;
}

// Start animation of a single Danmuku element
function startAnimation(element, video) {
    let startTime = null;
    // with speedup=1, it taks a danmuku 10 seconds (10000ms) to travel across the overlayed video
    const duration = 10000 / overlayConfig.speedup;
    // the total distance a danmuku need to travel is video width + danmuku width, so that it dispears when
    // the last character of the danmuku reaches the right edge of the video
    const totalDistance = video.offsetWidth + element.offsetWidth;
    

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = elapsedTime / duration;

        if (progress >= 1) {
            element.remove();
            return;
        }

        if (progress < 1 && !video.paused) {
            element.style.transform = `translateX(${-progress * totalDistance}px)`;
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

// Pause animations
function pauseAnimations() {
    // Implement logic to pause animations
    // You might need to keep track of the animation state of each danmuku
}

// Resume animations
function resumeAnimations() {
    // Implement logic to resume animations
}

// Check if a Danmuku should be displayed
function shouldDisplayDanmuku(d) {
    // display a danmuku only when all the conditions are met:
    // 1. video is playing
    // 2. danmuku.time is in [video.currentTime, video.currentTime + 1)
    // 3. danmuku is not already displayed
    // FIXME: For now, we ensure the first condition by calling this function only when timeUpdate event is fired
    return  video.currentTime >= d.time     && 
            video.currentTime < d.time + 1  && 
            !displayedDanmukus.has(d);
}

// Function to display Danmuku
function displayDanmuku(danmukuData, video) {
    if (!video || !overlay) {
        alert('No video or overlay element found!');
        return;
    }

    video.addEventListener('timeupdate', () => {
        danmukuData.forEach(d => {
            if (!shouldDisplayDanmuku(d)) {
                return;
            }
            const danmukuElement = createDanmukuElement(d);            
            
            overlay.appendChild(danmukuElement);

            startAnimation(danmukuElement, video);
            displayedDanmukus.add(d);
        });
    });

    video.addEventListener('pause', () => {
        pauseAnimations();
    });

    video.addEventListener('play', () => {
        resumeAnimations();
    });

    video.addEventListener('seeked', () => {
        overlay.innerHTML = ''; // Clear existing danmukus
        displayedDanmukus.clear(); // Reset the displayed danmukus
        // You might need to re-calculate which danmukus to display based on new currentTime
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
        alert(`Parsed ${danmukuData.length} danmukus!`);
        if (!video) {
            alert('No video element found!');
        }
        displayDanmuku(danmukuData, video);
    };
    reader.readAsText(file);
});

})();
