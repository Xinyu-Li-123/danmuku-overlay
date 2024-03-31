import { Danmaku } from "../danmaku/Danmaku";
import { AnimationConfig, OverlayConfig } from "../types/ConfigTypes";
import { createSnackbar } from "../utils/utils";


class Overlay {
    private target: HTMLElement;
    public overlayElement: HTMLElement;
    public danmakus: Danmaku[] = [];

    // TODO: add OverlayConfig as parameter
    constructor(target: HTMLVideoElement) {
        this.target = target;
        this.overlayElement = this.createOverlayElement();
        this.clear();
    }

    // create the html element for the overlay. Danmaku elements will be appended to this element
    private createOverlayElement(): HTMLElement {
        const overlayElement = document.createElement("div");
        overlayElement.id = 'danmaku-overlay';

        // set to the same size as target
        overlayElement.style.position = 'absolute';
        overlayElement.style.pointerEvents = 'none';
        overlayElement.style.zIndex = '9999';
        overlayElement.style.overflow = 'hidden';

		// for testing purpose, we color the overlay with red color
		overlayElement.style.backgroundColor = "rgba(255, 0, 0, 0.5)";

        return overlayElement;
    }

    public play(): void {
        createSnackbar("Overlay play");
    }

    public pause(): void {
        createSnackbar("Overlay pause");
    }

    public seek(currentTime: number): void {
        createSnackbar(`Overlay seek to ${currentTime}s`);
    }

    // clear the overlay. Run when initialized or when another danmaku file is loaded
    public clear(): void {
        this.overlayElement.innerHTML = "";
        this.danmakus = [];
        createSnackbar("Overlay cleared");
    }

}

export { Overlay };