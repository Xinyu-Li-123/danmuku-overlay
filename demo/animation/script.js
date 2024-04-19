// const animElement = document.getElementById("foo");
const playPauseBtn = document.getElementById("play-pause-btn");
const removeBtn = document.getElementById("remove-btn");
const danmakuContainer = document.getElementById("danmaku-container");

// modify the --container-width css variable to 700px
danmakuContainer.style.setProperty("--container-width", "600px");

const danmakuMoveEndBase = parseFloat(getComputedStyle(danmakuContainer).getPropertyValue("--danmaku-move-end-base"));
const danmakuMoveEndLeftMin = parseFloat(getComputedStyle(danmakuContainer).getPropertyValue("--danmaku-move-end-left-min"));
const danmakuOnScreenTime = parseFloat(getComputedStyle(danmakuContainer).getPropertyValue("--danmaku-on-screen-time"));

// player-independent configuration for the overlay
const overlayConfig = {
	numTracks: 8,
}


const customStyle = document.createElement("style");
document.head.appendChild(customStyle);

// add (cache) the keyframes for moving danmaku of length level
function addMoveKeyframes(level) {
	const keyframeName = `move-${level}`;
	// check if the keyframe is already defined
	if (cachedMoveKeyframes.includes(level)) {
		return;
	}
	cachedMoveKeyframes.push(level);
	const keyframe = `@keyframes ${keyframeName} {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(${danmakuMoveEndLeftMin * Math.pow(danmakuMoveEndBase, level) - danmakuContainer.clientWidth}px);
		}
	}\n`;
	customStyle.innerHTML += keyframe;
	console.log(`Keyframes ${keyframeName} added. Content: ${keyframe}`);
}

// cache some keyframes
const cachedMoveKeyframes = [];
[0, 1, 2].forEach((level) => {
	addMoveKeyframes(level);
});


// "<danmaku-id>": <danmaku-content>
// let danmakus = {
// 	0: { content: "这是弹幕111111111111111111111111111111111111111111111111111111111111111111111" },
// 	1: { content: "这是弹幕2" },
// 	2: { content: "这是弹幕3" },
// 	3: { content: "这是弹幕4" },
// 	4: { content: "这是弹幕5" },
// };

// stress test: 500 danmakus at once
let danmakus = {};
for (let i = 0; i < 100; i++) {
	// danmakus[i] = { content: `这是弹幕${i}` };
	// generate danmaku of random length
	const length = Math.floor(Math.random() * 200) + 1;
	const uniqueContent = `这是弹幕${i}`;
	const dummyContent = Array(length).fill("1").join("");
	danmakus[i] = { content: uniqueContent + dummyContent };
}

// "<danmaku-id>": <danmaku-element>
// only record html elements of the active (currently displayed) danmakus
let activeDanmakuElements = {};

function addDanmaku(danmakuId) {
	if (danmakus[danmakuId] === undefined) {
		console.error(`Danmaku with id ${danmakuId} does not exist.`);
		return;
	}
	if (activeDanmakuElements[danmakuId] !== undefined) {
		console.error(`Danmaku with id ${danmakuId} is already added to the screen.`);
		return;
	}

	const danmaku = danmakus[danmakuId];
	const danmakuElement = document.createElement("div");
	danmakuElement.textContent = danmaku.content;
	danmakuElement.classList.add("danmaku");


	// Randomly assign a track using overlayConfig.numTracks and danmakuContainer.clientHeight
	const trackHeight = 100 / overlayConfig.numTracks;
	const trackIndex = Math.floor(Math.random() * overlayConfig.numTracks);
	danmakuElement.style.top = `${trackIndex * trackHeight}%`;

	// add the danmaku element to the container
	danmakuContainer.appendChild(danmakuElement);
	activeDanmakuElements[danmakuId] = danmakuElement;

	/* TODO: 
	 * To use "dynamic" keyframe, we predefine a collection of move keyframes for danmaku of diff len,
	 * and calculate the animation duration of danmaku dynamically to make its "screen time" constant. 
	 * By "screen time", we mean the time that a danmaku is visible on the screen / video / overlay.
	*/
	// Note that the duration must be computed after appending the element to the container
	// since it depends on the clientWidth of the element, which is only available after it is appended
	const danmakuElementLength = danmakuElement.clientWidth;
	// console.log(`Danmaku <${danmakuId}> length: ${danmakuElementLength}`);
	// moveKeyframeChoice = i iff danmakuElementLength in 
	// - [-endLeft * (endBase**i), endLeft * (endBase**(i+1))] for i = 0, 1, 2, ...
	// - [0, -endLeft] for i = -1
	const t = Math.floor(Math.log(danmakuElementLength / -danmakuMoveEndLeftMin) / Math.log(danmakuMoveEndBase));
	const moveKeyframeChoice = t < 0 ? 0 : t + 1;
	const moveKeyframe = `move-${moveKeyframeChoice}`;
	// if the choice is not cached, create the keyframes and use it
	if (!cachedMoveKeyframes.includes(moveKeyframeChoice)) {
		// console.log(`Danmaku <${danmakuId}> trigger addMoveKeyframes(${moveKeyframeChoice})`);
		addMoveKeyframes(moveKeyframeChoice);
	}
	// Compute the animation duration to satisfy the danmakuOnScreenTime
	const moveLeftEnd = danmakuMoveEndLeftMin * Math.pow(danmakuMoveEndBase, moveKeyframeChoice);
	// The entire danmaku should be visible on the screen for danmakuOnScreenTime
	const animationDuration = danmakuOnScreenTime * (danmakuContainer.clientWidth + (-moveLeftEnd)) / (danmakuContainer.clientWidth + danmakuElementLength);
	// console.log(`Danmaku <${danmakuId}> animation duration: ${animationDuration}`);
	danmakuElement.style.animation = `${moveKeyframe} ${animationDuration}s linear forwards`;

	// remove the danmaku element from the container after the animation ends
	danmakuElement.addEventListener("animationend", () => {
		danmakuContainer.removeChild(danmakuElement);
		delete activeDanmakuElements[danmakuId];
	});

	// play or pause based on the state of playPauseBtn
	danmakuElement.style.animationPlayState = playPauseBtn.textContent === "Play" ? "paused" : "running";
}

// play / pause the animation on button click
playPauseBtn.addEventListener("click", () => {
	// map playPauseBtn text to the new animation state
	const currentState = playPauseBtn.textContent;

	const newAnimationState = currentState === "Play" ? "running" : "paused";

	for (const danmakuId in activeDanmakuElements) {
		activeDanmakuElements[danmakuId].style.animationPlayState = newAnimationState;
	}

	playPauseBtn.textContent = currentState === "Play" ? "Pause" : "Play";
});

removeBtn.addEventListener("click", () => {
	// remove all active danmakus
	for (const danmakuId in activeDanmakuElements) {
		danmakuContainer.removeChild(activeDanmakuElements[danmakuId]);
		delete activeDanmakuElements[danmakuId];
	}
});

// on page load, add all danmakus to the screen
Object.keys(danmakus).forEach((danmakuId) => {
	// addDanmaku(danmakuId);
	// add danmaku after a random delay
	setTimeout(() => {
		addDanmaku(danmakuId);
	}, Math.random() * 5000);
});

