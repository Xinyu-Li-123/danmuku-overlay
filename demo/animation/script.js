// const animElement = document.getElementById("foo");
const playPauseBtn = document.getElementById("play-pause-btn");
const danmakuContainer = document.getElementById("danmaku-container");

// content of the danmakus
let danmakus = [
	{ content: "这是弹幕1" },
	{ content: "这是弹幕2" },
	{ content: "这是弹幕3" },
	{ content: "这是弹幕4" },
	{ content: "这是弹幕5" },
	{ content: "这是弹幕6" },
	{ content: "这是弹幕7" },
];

// html elements of the active (currently displayed) danmakus
let activeDanmakuElements = [];

// play / pause the animation on button click
playPauseBtn.addEventListener("click", () => {
	// map playPauseBtn text to the new animation state
	const newAnimationState = playPauseBtn.textContent === "Play" ? "running" : "paused";

	activeDanmakuElements.map((danmakuElement) => {
		const currentPlayState = danmakuElement.style.animationPlayState;

		// if the element is currently animating, stop it
		if (currentPlayState === "running") {
			danmakuElement.style.animationPlayState = "paused";
			playPauseBtn.textContent = "Play";
		}
		// otherwise, start the animation
		else {
			danmakuElement.style.animationPlayState = "running";
			playPauseBtn.textContent = "Pause";
		}
	});
});


// remove the element on animation end
animElement.addEventListener("animationended", () => {
	alert("Animation has ended!");
	danmakuContainer.innerHTML = "";
});
