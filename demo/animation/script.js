// const animElement = document.getElementById("foo");
const playPauseBtn = document.getElementById("play-pause-btn");
const danmakuContainer = document.getElementById("danmaku-container");
// player-independent configuration for the overlay
const overlayConfig = {
	numTracks: 8,
}

// "<danmaku-id>": <danmaku-content>
let danmakus = {
	"delsl3919c": { content: "这是弹幕111111" },
	"a321v19329": { content: "这是弹幕2" },
	"b123v12312": { content: "这是弹幕3" },
	"nvb9192c00": { content: "这是弹幕4" },
	"3219e&*^@e": { content: "这是弹幕5" },
};


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

	/* TODO: 
	 * To use "dynamic" keyframe, we predefine a collection of move keyframes for danmaku of diff len,
	 * and calculate the animation duration of danmaku dynamically to make its "screen time" constant. 
	 * By "screen time", we mean the time that a danmaku is visible on the screen / video / overlay.
	*/
	// danmakuElement.style.animation = `move-${???} ${danmaku.content.length * 0.5}s linear forwards`;

	// Randomly assign a track using overlayConfig.numTracks and danmakuContainer.clientHeight
	const trackHeight = 100 / overlayConfig.numTracks;
	const trackIndex = Math.floor(Math.random() * overlayConfig.numTracks);
	danmakuElement.style.top = `${trackIndex * trackHeight}%`;

	// add the danmaku element to the container
	danmakuContainer.appendChild(danmakuElement);
	activeDanmakuElements[danmakuId] = danmakuElement;

	// remove the danmaku element from the container after the animation ends
	danmakuElement.addEventListener("animationend", () => {
		danmakuContainer.removeChild(danmakuElement);
		// delete activeDanmakuElements[danmakuId];
	});

	// play or pause based on the state of playPauseBtn
	danmakuElement.style.animationPlayState = playPauseBtn.textContent === "Play" ? "paused" : "running";
}

// 

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

// on page load, add all danmakus to the screen
Object.keys(danmakus).forEach((danmakuId) => {
	addDanmaku(danmakuId);
});


// // remove the element on animation end
// animElement.addEventListener("animationended", () => {
// 	alert("Animation has ended!");
// 	danmakuContainer.innerHTML = "";
// });

// .danmaku-container {
// 	--container-width: 600px;
// 	--container-height: 360px;
// }


// modify the --container-width css variable to 700px
danmakuContainer.style.setProperty("--container-width", "600px");