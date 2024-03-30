import { Overlay } from "./overlay/Overlay";
import { createSnackbar } from "./utils/utils";

// Find video elements. For each video element, create an overlay.
function initialize_extension() {
	const videoElements = document.querySelectorAll("video");
	if (videoElements.length === 0) {
		createSnackbar("No video element found on this page", 5000, 2000, "error");
		return;
	}
	createSnackbar(`${videoElements.length} video element(s) found on this page`, 5000, 2000, "success");
	// TODO: may need to let user choose which video to attach the overlay
	videoElements.forEach((videoElement) => {
		new Overlay(videoElement as HTMLElement);
	});
}

// initialize extension after 1 second to ensure the page is fully loaded
setTimeout(initialize_extension, 1000);
