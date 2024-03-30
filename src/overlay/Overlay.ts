import { Danmaku } from "../types/DanmakuTypes";
import { AnimationConfig, OverlayConfig } from "../types/ConfigTypes";


class Overlay {
    private target: HTMLElement;
    private overlayElement: HTMLElement;

    constructor(target: HTMLElement) {
        this.target = target;
        this.overlayElement = this.createOverlay();
    }

    private createOverlay(): HTMLElement {
        const overlay = document.createElement("div");
        overlay.id = 'danmaku-overlay';

        // set to the same size as target
        overlay.style.position = 'absolute';
        overlay.style.top = this.target.offsetTop + 'px';
        overlay.style.left = this.target.offsetLeft + 'px';
        overlay.style.width = this.target.offsetWidth + 'px';
        overlay.style.height = this.target.offsetHeight + 'px';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '9999';
        overlay.style.overflow = 'hidden';

		// for testing purpose, we color the overlay with red color
		overlay.style.backgroundColor = "rgba(255, 0, 0, 0.5)";

        if (this.target.parentElement) {
            this.target.parentElement.appendChild(overlay);
        }

        // resize overlay when the target is resized
        const resizeObserver = new ResizeObserver(() => {
            overlay.style.top = this.target.offsetTop + 'px';
            overlay.style.left = this.target.offsetLeft + 'px';
            overlay.style.width = this.target.offsetWidth + 'px';
            overlay.style.height = this.target.offsetHeight + 'px';
        });
        resizeObserver.observe(this.target);

        return overlay;
    }
}

export { Overlay };