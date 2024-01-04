// TypeScript definitions
interface Danmuku {
    time: number;
    displayType: number;
    color: number;
    sentTime: number;
    text: string;
}

interface AnimationConfig {
    animationId: number;
    startTime: number;
    displayType: number;
}

interface OverlayConfig {
    number_of_rows: number;
    speedup: number;
    danmukuConfig: {
        fontSize: string;
        fontFamily: string;
        fontWeight: string;
        textShadow: string;
        opacity: number;
    };
}

// Main script
(() => {
'use strict';

const validDisplayTypes: number[] = [1, 5];

const failureDanmuku: Danmuku = {
	time: 0,
	displayType: 1,
	color: 0,
	sentTime: 0,
	text: 'Failed to load this danmuku data!',
};

let video: HTMLVideoElement | null = null;
let overlay: HTMLDivElement | null = null;
let displayedDanmukus: Set<Danmuku> = new Set();
let activeAnimations: Map<HTMLParagraphElement, AnimationConfig> = new Map();

let overlayConfig: OverlayConfig = {
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
overlayConfig.number_of_rows = Math.max(1, overlayConfig.number_of_rows);

function createOverlay(target: HTMLElement): void {
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
	
	if (target.parentElement === null) { return; }
    target.parentElement.appendChild(overlay);

    // resize overlay when window is resized
    window.addEventListener('resize', function() {
		if (overlay === null) { return; }
        overlay.style.top = target.offsetTop + 'px';
        overlay.style.left = target.offsetLeft + 'px';
        overlay.style.width = target.offsetWidth + 'px';
        overlay.style.height = target.offsetHeight + 'px';
    });
    
}

function getVideo(): void {
    video = document.querySelector('video');
    if (!video) {
        console.log('No video element found for danmuku overlay!');
        return;
    }
    alert('Video element found!');
}

window.onload = (): void => {
    getVideo();
    if (!video) { return; }
    createOverlay(video)
};

function parseDanmuku(xmlData: string): Danmuku[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const danmukuXMLElements = xmlDoc.getElementsByTagName("d");

    return Array.from(danmukuXMLElements)
    .map(de => {
		const p = de.getAttribute("p");
		if (p === null) { return failureDanmuku; }
		
        const attributes = p.split(",");
        /*
            p: time, displayType, ?, color (decimal), sent time, ?, ?, ?, ?
            - time: relative timestamp in milliseconds
            - displayType: 1 for rolling danmuku, 5 for top danmuku
            - color: decimal representation of color in RGB
            - sent time: unix time when the danmuku was sent 
        */
        const time = parseFloat(attributes[0]);
        const displayType = parseInt(attributes[1]);
        const color = parseInt(attributes[3]);
        const sentTime = parseInt(attributes[4]);
		const text = de.textContent || '';

		const d: Danmuku = {
            time: time,
            // use rolling danmuku as default displayType
            displayType: validDisplayTypes.includes(displayType) ? displayType : 1,
            color: color,
            sentTime: sentTime,
            text: text,
        };

        return d;
    })
    .sort((a, b) => a.time - b.time);
}

function createDanmukuElement(d: Danmuku): HTMLParagraphElement {
	const danmukuElement = document.createElement("p");
    danmukuElement.textContent = d.text;

    danmukuElement.style.position = 'absolute';
    // calculate top (percentage) based on the number of rows
    const topGap = 100 / (overlayConfig.number_of_rows + 1);
    // randomly choose a row to display the danmuku
    danmukuElement.style.top = `${topGap * Math.floor(Math.random() * overlayConfig.number_of_rows)}%`; 
    
    // displayType: 1 for rolling danmuku
    if (d.displayType === 1) {
        danmukuElement.style.left = '100%';
    }
    // displayType: 5 for top danmuku
    else if (d.displayType === 5) {
        danmukuElement.style.left = '50%';
        danmukuElement.style.transform = 'translateX(-50%)';
    }

    danmukuElement.style.whiteSpace = 'nowrap';
	danmukuElement.style.opacity = `${overlayConfig.danmukuConfig.opacity}`;
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
function startAnimation(element: HTMLParagraphElement, video: HTMLVideoElement | null, startTime: number, displayType: number): void {
    if (video === null) {
        console.log("Start animation failed: no video element found!");
        return;
    }
    // with speedup=1, it taks a danmuku 10 seconds (10000ms) to travel across the overlayed video
    const duration = 10 / overlayConfig.speedup;
    // the total distance a danmuku need to travel is video width + danmuku width, so that it dispears when
    // the last character of the danmuku reaches the right edge of the video
    const totalDistance = video.offsetWidth + element.offsetWidth;
    

    function animate(_: any): void {
        // if (!startTime) startTime = currentTime;
        if (video === null) {
            console.log("Animation failed: no video element found!");
            return;
        }
        const currentTime = video.currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = elapsedTime / duration;

        if (progress >= 1) {
            element.remove();
            activeAnimations.delete(element);
            return;
        }

        if (progress < 1 && !video.paused) {
            if (displayType === 1) {
                element.style.transform = `translateX(${-progress * totalDistance}px)`;
            }
            else if (displayType === 5) {
                element.style.transform = 'translateX(-50%)';
            }
            let animationID = requestAnimationFrame(animate);
            activeAnimations.set(
                element,
                {
                    animationId: animationID,
                    startTime: startTime,
                    displayType: displayType,
                });
        }
    }

    let animationID = requestAnimationFrame(animate);
    activeAnimations.set(
        element,
        {
            animationId: animationID,
            startTime: startTime,
            displayType: displayType,
        });
}

function pauseAnimations(): void {
    activeAnimations.forEach((config, _) => {
        cancelAnimationFrame(config.animationId);
    });
}

function resumeAnimations(): void {
    activeAnimations.forEach((config, element) => {
        startAnimation(element, video, config.startTime, config.displayType);
    });
}

function shouldDisplayDanmuku(d: Danmuku): boolean {
    // display a danmuku only when all the conditions are met:
    // 1. video is playing
    // 2. danmuku.time is in [video.currentTime, video.currentTime + 1)
    // 3. danmuku is not already displayed
    return  video !== null                  &&
            video.currentTime >= d.time     && 
            video.currentTime < d.time + 1  && 
            !displayedDanmukus.has(d);
}

function displayDanmuku(danmukuData: Danmuku[], video: HTMLVideoElement): void {
    if (video === null || overlay === null) {
        console.log('No video or overlay element found!');
        return;
    }

    video.addEventListener('timeupdate', () => {
        danmukuData.forEach(d => {
            if (!shouldDisplayDanmuku(d) || overlay === null) {
                return;
            }
            const danmukuElement = createDanmukuElement(d);            
            
            overlay.appendChild(danmukuElement);

            startAnimation(danmukuElement, video, d.time, d.displayType);
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
        if (overlay === null) {
            console.log("Seek failed: no overlay element found!");
            return;
        }
        overlay.innerHTML = ''; // Clear existing danmukus
        displayedDanmukus.clear(); // Reset the displayed danmukus
        // You might need to re-calculate which danmukus to display based on new currentTime
        resumeAnimations();
    });
}

const input: HTMLInputElement = document.createElement('input');
input.type = 'file';
input.accept = '.xml';
input.style.position = 'fixed';
input.style.top = '10px';
input.style.left = '10px';
input.style.zIndex = '10000';
document.body.appendChild(input);

input.addEventListener('change', function(this: HTMLInputElement) {
    if (!this.files) {
        alert('No file selected!');
        return;
    }
    const file = this.files[0];
    if (!file) {
        alert('No file selected!');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        if (!e.target || !e.target.result) {
            alert('Failed to read the file!');
            return;
        }
        // FIXME: Implement also for ArrayBuffer
        if (typeof e.target.result !== 'string') {
            alert('Failed to read the file!');
            return;
        }
        const danmukuData = parseDanmuku(e.target.result);
        alert(`Parsed ${danmukuData.length} danmukus!`);
        if (video === null) {
            console.log('No video element found!');
            return;
        }
        displayDanmuku(danmukuData, video);
    };
    reader.readAsText(file);
});
})();
