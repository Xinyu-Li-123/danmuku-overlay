import { Overlay } from "./Overlay";

// OverlayManager hooks the Overlay instance's methods to target video events. For example:
// - resize overlay when the video is resized
// - play overlay animations when the video is played
// - pause overlay animations when the video is paused or buffered
// - clear overlay when the video is ended
// - etc.
class OverlayManager {
	private target: HTMLVideoElement;
	private overlay: Overlay;

	constructor(target: HTMLVideoElement) {
		this.target = target;
		this.overlay = new Overlay(target);
		
		this.appendOverlay();
		this.hookResize();
		this.hookVideoEvents();
	}

	private appendOverlay() {
		const targetElement = this.target;
		const overlayElement = this.overlay.overlayElement;

		if (targetElement.parentElement === null) {
			console.error("Parent element of the target is null");
			return;
		}
        targetElement.parentElement.appendChild(overlayElement);
	}

	private hookResize() {
		const targetElement = this.target;
		const overlayElement = this.overlay.overlayElement;

		const resizeHandler = () => {
			overlayElement.style.top = targetElement.offsetTop + 'px';
			overlayElement.style.left = targetElement.offsetLeft + 'px';
			overlayElement.style.width = targetElement.offsetWidth + 'px';
			overlayElement.style.height = targetElement.offsetHeight + 'px';
		}
		// resize overlay explicitly to ensure it's run at least once
		resizeHandler();
        // resize overlay when the target is resized
        const resizeObserver = new ResizeObserver(resizeHandler);
        resizeObserver.observe(targetElement);
	}

	private hookVideoEvents() {
		const targetElement = this.target;
		const overlay = this.overlay;

		// targetElement.addEventListener("loadstart", overlay.clear);
		// use MutationObserver instead of loadstart event because some SPA can change content dynamically without reloading the page
		const videoSrcObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
					overlay.clear();
				}
			});
		});
		videoSrcObserver.observe(targetElement, {
			attributes: true,
			attributeFilter: ['src']
		});

		targetElement.addEventListener("play", overlay.play);
		targetElement.addEventListener("pause", overlay.pause);
		// note that we should use 'seeking' event instead of 'seeked' event
		targetElement.addEventListener("seeking", () => overlay.seek(targetElement.currentTime));
		// targetElement.addEventListener("ended", overlay.pause);
	}
}

export { OverlayManager };