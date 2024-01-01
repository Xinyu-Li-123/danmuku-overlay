// ==UserScript==
// @name         Danmuku Overlay
// @namespace    http://tampermonkey.net/
// @version      2023-12-31
// @description  Create an overlay of danmuku on a selected video element
// @author       You
// @match        https://www.ntdm9.com/*
// @match        http://v16m-default.akamaized.net/*
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
let displayedDanmukus = new Set();  // Set of displayed danmukus. A set of danmuku objects
let activeAnimations = new Map();   // Map of active animations. A map from danmuku element to its config {animationId, startTime}


// configurable parameters
// TODO: add a dropdown menu to tune these configs
let overlayConfig = {
    // the height is divided into `number_of_rows` rows, each row corresponds to 
    //  one line of danmukus
    number_of_rows: 8,
    speedup: 1,
    danmukuConfig: {
        fontSize: '24px',
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
    overlay.style.top = target.offsetTop + 'px';
    overlay.style.left = target.offsetLeft + 'px';
    overlay.style.width = target.offsetWidth + 'px';
    overlay.style.height = target.offsetHeight + 'px';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.overflow = 'hidden';

    // target.parentElement.style.position = 'relative';
    target.parentElement.appendChild(overlay);

    // resize overlay when window is resized
    window.addEventListener('resize', function() {
        overlay.style.top = target.offsetTop + 'px';
        overlay.style.left = target.offsetLeft + 'px';
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
        /*
            p: time, type, ?, color (decimal), sent time, ?, ?, ?, ?
            - time: relative timestamp in milliseconds
            - type: 1 for rolling danmuku, 5 for top danmuku
            - color: decimal representation of color in RGB
            - sent time: unix time when the danmuku was sent 
        */
        const time = parseFloat(attributes[0]);
        const type = parseInt(attributes[1]);
        const color = parseInt(attributes[3]);
        const sentTime = parseInt(attributes[4]);
        // const text = d.textContent;
        const text = `${d.textContent} - ${time}`


        return {
            time: time,
            type: type,
            color: color,
            sentTime: sentTime,
            text: text,
        }
    })
    .sort((a, b) => a.time - b.time);
}


// Create and format a single Danmuku element
function createDanmukuElement(d) {
    const danmukuElement = document.createElement("p");
    danmukuElement.textContent = d.text;

    danmukuElement.style.position = 'absolute';
    // calculate top (percentage) based on the number of rows
    const topGap = 100 / overlayConfig.number_of_rows;
    // randomly choose a row to display the danmuku
    danmukuElement.style.top = `${topGap * Math.floor(Math.random() * overlayConfig.number_of_rows)}%`; 
    
    danmukuElement.style.left = '100%';

    danmukuElement.style.whiteSpace = 'nowrap';
    danmukuElement.style.opacity = overlayConfig.danmukuConfig.opacity;
    danmukuElement.style.color = `#${d.color.toString(16)}`;

    // calculate fontSize based on the number of rows
    danmukuElement.style.fontSize = overlayConfig.danmukuConfig.fontSize;
    danmukuElement.style.textShadow = overlayConfig.danmukuConfig.textShadow;
    danmukuElement.style.fontFamily = overlayConfig.danmukuConfig.fontFamily;
    danmukuElement.style.fontWeight = overlayConfig.danmukuConfig.fontWeight;

    return danmukuElement;
}

/**
 * 
 * @param {*} element - The danmuku element to animate
 * @param {*} video - The video element on which to display the danmuku
 * @param {*} startTime - The start time of the animation. Used with currentTime to calculate 
 * the horizontal position of the danmuku. If null, use the current time
 */
function startAnimation(element, video, startTime) {
    // with speedup=1, it taks a danmuku 10 seconds (10000ms) to travel across the overlayed video
    const duration = 10 / overlayConfig.speedup;
    // the total distance a danmuku need to travel is video width + danmuku width, so that it dispears when
    // the last character of the danmuku reaches the right edge of the video
    const totalDistance = video.offsetWidth + element.offsetWidth;
    

    function animate(_) {
        // if (!startTime) startTime = currentTime;
        const currentTime = video.currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = elapsedTime / duration;

        if (progress >= 1) {
            element.remove();
            activeAnimations.delete(element);
            return;
        }

        if (progress < 1 && !video.paused) {
            element.style.transform = `translateX(${-progress * totalDistance}px)`;
            let animationID = requestAnimationFrame(animate);
            activeAnimations.set(
                element,
                {
                    animationId: animationID,
                    startTime: startTime,
                });
        }
    }

    let animationID = requestAnimationFrame(animate);
    activeAnimations.set(
        element,
        {
            animationId: animationID,
            startTime: startTime,
        });
}

// Pause animations
function pauseAnimations() {
    activeAnimations.forEach((config, element) => {
        console.log(config.animationId, config.startTime, element);
        cancelAnimationFrame(config.animationId);
    });
}

// Resume animations
function resumeAnimations() {
    activeAnimations.forEach((config, element) => {
        startAnimation(element, video, config.startTime);
    });
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

            startAnimation(danmukuElement, video, d.time);
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
        resumeAnimations();
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
