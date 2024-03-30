// TypeScript definitions
interface Danmaku {
    // the video timestamp when the danmaku should be sent
    time: number;
    // 1 for rolling danmaku, 5 for top danmaku
    displayType: number;
    // decimal representation of color in RGB
    color: number;
    // unix time when the danmaku was sent
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
    danmakuConfig: {
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

/* Helper functions */

// create a snackbar to display messages (a snackbar is a small popup that appears at the bottom of the screen)
function createSnackbar(messageText: string, displayDuration: number = 3000, fadeDuration: number = 1000, alertType: string = 'info') {
	const snackbar = document.createElement('div');

	snackbar.textContent = messageText;
    snackbar.style.fontSize = '16px';
	snackbar.style.bottom = '20px';
	snackbar.style.left = '20px';
	snackbar.style.padding = '20px';
	snackbar.style.borderRadius = '5px';
	snackbar.style.opacity = '1';
	snackbar.style.transition = `opacity ${fadeDuration / 1000}s ease-out`;
	snackbar.style.position = 'fixed';
	snackbar.style.zIndex = '10000';

	// type-specific styles
	if (alertType === 'info') {
		snackbar.style.backgroundColor = 'black';
		snackbar.style.color = 'white';
	} else if (alertType === 'success') {
		snackbar.style.backgroundColor = 'green';
		snackbar.style.color = 'white';
	} else if (alertType === 'error') {
		snackbar.style.backgroundColor = 'red';
		snackbar.style.color = 'white';
	} else {
		// default style
		snackbar.style.backgroundColor = 'black';
		snackbar.style.color = 'white';
	}

	document.body.appendChild(snackbar);

	setTimeout(() => {
		snackbar.style.opacity = '0';
		setTimeout(() => document.body.removeChild(snackbar), fadeDuration);
	}, displayDuration);
}

/* Main Logics */

const validDisplayTypes: number[] = [1, 5];

const failureDanmaku: Danmaku = {
	time: 0,
	displayType: 1,
	color: 0,
	sentTime: 0,
	text: 'Failed to load this danmaku data!',
};

let video: HTMLVideoElement | null = null;
let overlay: HTMLDivElement | null = null;
let displayedDanmakus: Set<Danmaku> = new Set();
let activeAnimations: Map<HTMLParagraphElement, AnimationConfig> = new Map();

let overlayConfig: OverlayConfig = {
	number_of_rows: 8,
	speedup: 1,
	danmakuConfig: {
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
    overlay.id = 'danmaku-overlay';

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
        createSnackbar('No video element found for danmaku overlay!', 3000, 1000, 'error');
        return;
    }
    createSnackbar('Video element found!', 3000, 1000, 'success');
}

// parse the xml danmaku file into an array of Danmaku objects
function parseDanmakuFile(xmlData: string): Danmaku[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const danmakuXMLElements = xmlDoc.getElementsByTagName("d");

    return Array.from(danmakuXMLElements)
    .map(de => {
		const p = de.getAttribute("p");
		if (p === null) { return failureDanmaku; }
		
        const attributes = p.split(",");
        /* xml danmaku attributes:
            p: time, displayType, ?, color (decimal), sent time, ?, ?, ?, ?
            - time: video timestamp in milliseconds when the danmaku should be sent
            - displayType: 1 for rolling danmaku, 5 for top danmaku
            - color: decimal representation of color in RGB
            - sent time: unix time when the danmaku was sent 
        */
        const time = parseFloat(attributes[0]);
        const displayType = parseInt(attributes[1]);
        const color = parseInt(attributes[3]);
        const sentTime = parseInt(attributes[4]);
		const text = de.textContent || '';

		const d: Danmaku = {
            time: time,
            // use rolling danmaku as default displayType
            displayType: validDisplayTypes.includes(displayType) ? displayType : 1,
            color: color,
            sentTime: sentTime,
            text: text,
        };

        return d;
    })
    .sort((a, b) => a.time - b.time);
}

function createDanmakuElement(d: Danmaku): HTMLParagraphElement {
	const danmakuElement = document.createElement("p");
    danmakuElement.textContent = d.text;

    danmakuElement.style.position = 'absolute';
    // calculate top (percentage) based on the number of rows
    const topGap = 100 / (overlayConfig.number_of_rows + 1);
    // randomly choose a row to display the danmaku
    danmakuElement.style.top = `${topGap * Math.floor(Math.random() * overlayConfig.number_of_rows)}%`; 
    
    // displayType: 1 for rolling danmaku
    if (d.displayType === 1) {
        danmakuElement.style.left = '100%';
    }
    // displayType: 5 for top danmaku
    else if (d.displayType === 5) {
        danmakuElement.style.left = '50%';
        danmakuElement.style.transform = 'translateX(-50%)';
    }

    danmakuElement.style.whiteSpace = 'nowrap';
	danmakuElement.style.opacity = `${overlayConfig.danmakuConfig.opacity}`;
    danmakuElement.style.color = `#${d.color.toString(16)}`;

    // calculate fontSize based on the number of rows
    danmakuElement.style.fontSize = overlayConfig.danmakuConfig.fontSize;
    danmakuElement.style.textShadow = overlayConfig.danmakuConfig.textShadow;
    danmakuElement.style.fontFamily = overlayConfig.danmakuConfig.fontFamily;
    danmakuElement.style.fontWeight = overlayConfig.danmakuConfig.fontWeight;

    return danmakuElement;
}

/**
 * 
 * @param {*} element - The danmaku element to animate
 * @param {*} video - The video element on which to display the danmaku
 * @param {*} startTime - The start time of the animation. Used with currentTime to calculate 
 * the horizontal position of the danmaku. If null, use the current time
 */
function startAnimation(element: HTMLParagraphElement, video: HTMLVideoElement | null, startTime: number, displayType: number): void {
    if (video === null) {
        console.log("Start animation failed: no video element found!");
        return;
    }
    // with speedup=1, it taks a danmaku 10 seconds (10000ms) to travel across the overlayed video
    const duration = 10 / overlayConfig.speedup;
    // the total distance a danmaku need to travel is video width + danmaku width, so that it dispears when
    // the last character of the danmaku reaches the right edge of the video
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

function shouldDisplayDanmaku(d: Danmaku): boolean {
    // display a danmaku only when all the conditions are met:
    // 1. video is playing
    // 2. danmaku.time is in [video.currentTime, video.currentTime + 1)
    // 3. danmaku is not already displayed
    return  video !== null                  &&
            video.currentTime >= d.time     && 
            video.currentTime < d.time + 1  && 
            !displayedDanmakus.has(d);
}

function displayDanmaku(danmakuData: Danmaku[], video: HTMLVideoElement): void {
    if (video === null || overlay === null) {
        console.log('No video or overlay element found!');
        return;
    }

    video.addEventListener('timeupdate', () => {
        danmakuData.forEach(d => {
            if (!shouldDisplayDanmaku(d) || overlay === null) {
                return;
            }
            const danmakuElement = createDanmakuElement(d);            
            
            overlay.appendChild(danmakuElement);

            startAnimation(danmakuElement, video, d.time, d.displayType);
            displayedDanmakus.add(d);
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
        overlay.innerHTML = ''; // Clear existing danmakus
        displayedDanmakus.clear(); // Reset the displayed danmakus
        // You might need to re-calculate which danmakus to display based on new currentTime
        resumeAnimations();
    });
}

const danmakuFileInput: HTMLInputElement = document.createElement('input');
danmakuFileInput.type = 'file';
danmakuFileInput.accept = '.xml';
danmakuFileInput.style.position = 'fixed';
danmakuFileInput.style.top = '10px';
danmakuFileInput.style.left = '10px';
danmakuFileInput.style.zIndex = '10000';

danmakuFileInput.addEventListener('change', function(this: HTMLInputElement) {
    if (!this.files) {
        createSnackbar('No file selected!', 3000, 1000, 'error');
        return;
    }
    const file = this.files[0];
    if (!file) {
        createSnackbar('No file selected!', 3000, 1000, 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        if (!e.target || !e.target.result) {
            createSnackbar('Failed to read the file!', 3000, 1000, 'error');
            return;
        }
        // FIXME: Implement also for ArrayBuffer
        if (typeof e.target.result !== 'string') {
            createSnackbar('Failed to read the file!', 3000, 1000, 'error');
            return;
        }
        const danmakuData = parseDanmakuFile(e.target.result);
        createSnackbar(`Parsed ${danmakuData.length} danmakus!`, 3000, 1000, 'success');
        if (video === null) {
            console.log('No video element found!');
            return;
        }
        displayDanmaku(danmakuData, video);
    };
    reader.readAsText(file);
});

/* Entry Point */
function main(): void {
    getVideo();
    if (!video) { return; }
    // if get video succeeds, create an input element for file selection
    document.body.appendChild(danmakuFileInput);
    createOverlay(video)
};
// on window load, wait 1 sec and then run main
window.addEventListener('load', () => setTimeout(main, 1000));
})();