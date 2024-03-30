// Main script
(() => {
'use strict';

/**** Helper Functions ****/

// create a snackbar to display messages (a snackbar is a small popup that appears at the bottom of the screen)
function createSnackbar(messageText, displayDuration, fadeDuration, alertType) {
	const snackbar = document.createElement('div');

	snackbar.textContent = messageText;
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

/**** Main Script ****/

let video = null;
let overlay = null;
// a set to keep track of displayed danmakus
let displayedDanmakus = new Set();
let activeAnimations = new Map();
let overlayConfig = {
	number_of_rows: 8,
	speedup: 1,
	danmakuConfig: {
		fontSize: '24px',
		fontFamily: 'SimHei, \'Microsoft JhengHei\', Arial, Helvetica, sans-serif',
		fontWeight: 'bold',
		textShadow: '1px 0 1px #000000,0 1px 1px #000000,0 -1px 1px #000000,-1px 0 1px #000000',
		opacity: 0.5,
	},
};
overlayConfig.number_of_rows = Math.max(1, overlayConfig.number_of_rows);
const validDisplayTypes = [1, 5];
const failureDanmaku = {
	time: 0,
	displayType: 1,
	color: 0,
	sentTime: 0,
	text: 'Failed to load this danmaku data!',
};

// create an overlay (as a div) of danmakus on the video
function createOverlay(target) {
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
	if (target.parentElement === null) {
		return;
	}
	target.parentElement.appendChild(overlay);
	// resize overlay when window is resized
	window.addEventListener('resize', function () {
		if (overlay === null) {
			return;
		}
		overlay.style.top = target.offsetTop + 'px';
		overlay.style.left = target.offsetLeft + 'px';
		overlay.style.width = target.offsetWidth + 'px';
		overlay.style.height = target.offsetHeight + 'px';
		updateOverlayForResizeOrFullscreen();
	});
}

// get video element
//    note that we need to do this inside a browser extension to
//    get the video element inside the iframe
function getVideo() {
	video = document.querySelector('video');
	if (!video) {
		console.log('No video element found for danmaku overlay!');
		return;
	}
	createSnackbar('Video element found!', 3000, 2000, 'success');
	// if video is found, add an input element for uploading danmaku data
	document.body.appendChild(danmakuFileInput);
}

window.onload = () => {
	setTimeout(() => {
		getVideo();
		if (!video) {
			return;
		}
		// if get video, create an input for uploading danmaku data
		document.body.appendChild(danmakuFileInput);
		// if get video, create an overlay for danmaku
		createOverlay(video);
	}
	, 1000);
};

// parse the xml danmaku file into an array of danmaku objects
function parseDanmakuFile(xmlData) {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlData, "text/xml");
	const danmakuXMLElements = xmlDoc.getElementsByTagName("d");
	return Array.from(danmakuXMLElements)
		.map(de => {
		const p = de.getAttribute("p");
		if (p === null) {
			return failureDanmaku;
		}
		const attributes = p.split(",");
		/*
			p: time, displayType, ?, color (decimal), sent time, ?, ?, ?, ?
			- time: relative timestamp in milliseconds
			- displayType: 1 for rolling danmaku, 5 for top danmaku
			- color: decimal representation of color in RGB
			- sent time: unix time when the danmaku was sent
		*/
		const time = parseFloat(attributes[0]);
		const displayType = parseInt(attributes[1]);
		const color = parseInt(attributes[3]);
		const sentTime = parseInt(attributes[4]);
		const text = de.textContent || '';
		const d = {
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
function createDanmakuElement(d) {
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
function startAnimation(element, video, startTime, displayType) {
	if (video === null) {
		console.log("Start animation failed: no video element found!");
		return;
	}
	// with speedup=1, it taks a danmaku 10 seconds (10000ms) to travel across the overlayed video
	const duration = 10 / overlayConfig.speedup;
	// the total distance a danmaku need to travel is video width + danmaku width, so that it dispears when
	// the last character of the danmaku reaches the right edge of the video
	const totalDistance = video.offsetWidth + element.offsetWidth;
	function animate(_) {
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
			activeAnimations.set(element, {
				animationId: animationID,
				startTime: startTime,
				displayType: displayType,
			});
		}
	}
	let animationID = requestAnimationFrame(animate);
	activeAnimations.set(element, {
		animationId: animationID,
		startTime: startTime,
		displayType: displayType,
	});
}
function pauseAnimations() {
	activeAnimations.forEach((config, _) => {
		cancelAnimationFrame(config.animationId);
	});
}
function resumeAnimations() {
	activeAnimations.forEach((config, element) => {
		startAnimation(element, video, config.startTime, config.displayType);
	});
}
function shouldDisplayDanmaku(d) {
	// display a danmaku only when all the conditions are met:
	// 1. video is playing
	// 2. danmaku.time is in [video.currentTime, video.currentTime + 1)
	// 3. danmaku is not already displayed
	return video !== null &&
		video.currentTime >= d.time &&
		video.currentTime < d.time + 1 &&
		!displayedDanmakus.has(d);
}
function displayDanmaku(danmakuData, video) {
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
// overlay under fullscreen mode
function updateOverlayForResizeOrFullscreen() {
	if (video === null || overlay === null) {
		return;
	}
	if (document.fullscreenElement === video) {
		// Video is in fullscreen mode
		console.log('Video is in fullscreen mode!');
		// request fullscreen for overlay
		// overlay.requestFullscreen();
		// set overlay to fullscreen
		overlay.style.position = 'fixed';
		overlay.style.top = '0';
		overlay.style.left = '0';
		overlay.style.width = '100%';
		overlay.style.height = '100%';
		// z-index trick: set to the maximum value
		overlay.style.zIndex = '2147483647;';
	}
	else {
		// Video is not in fullscreen, revert to original settings
		overlay.style.position = 'absolute';
		overlay.style.top = video.offsetTop + 'px';
		overlay.style.left = video.offsetLeft + 'px';
		overlay.style.width = video.offsetWidth + 'px';
		overlay.style.height = video.offsetHeight + 'px';
	}
}
document.addEventListener('fullscreenchange', updateOverlayForResizeOrFullscreen);
const danmakuFileInput = document.createElement('input');
danmakuFileInput.type = 'file';
danmakuFileInput.accept = '.xml';
danmakuFileInput.style.position = 'fixed';
danmakuFileInput.style.top = '10px';
danmakuFileInput.style.left = '10px';
danmakuFileInput.style.zIndex = '10000';
danmakuFileInput.addEventListener('change', function () {
	if (!this.files) {
		createSnackbar("No file selected!", 3000, 2000, "error");
		return;
	}
	const file = this.files[0];
	if (!file) {
		createSnackbar("No file selected!", 3000, 2000, "error");
		return;
	}
	const reader = new FileReader();
	reader.onload = function (e) {
		if (!e.target || !e.target.result) {
			createSnackbar("Failed to read the file!", 3000, 2000, "error");
			return;
		}
		// FIXME: Implement also for ArrayBuffer
		if (typeof e.target.result !== 'string') {
			createSnackbar("Failed to read the file!", 3000, 2000, "error");
			return;
		}
		const danmakuData = parseDanmakuFile(e.target.result);
		createSnackbar(`Parsed ${danmakuData.length} danmakus!`, 3000, 2000, 'success');
		if (video === null) {
			console.log('No video element found!');
			return;
		}
		displayDanmaku(danmakuData, video);
	};
	reader.readAsText(file);
});
})();

