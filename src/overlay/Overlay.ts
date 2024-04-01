import { Danmaku } from '../danmaku/Danmaku';
import { AnimationConfig, OverlayConfig } from '../types/ConfigTypes';
import { createSnackbar } from '../utils/snackbar';


class Overlay {
    private target: HTMLElement;
    public overlayElement: HTMLElement;
    private danmakus: Danmaku[] = [];

    // TODO: add OverlayConfig as parameter
    constructor(target: HTMLVideoElement) {
        this.target = target;
        this.overlayElement = this.createOverlayElement();
        
        this.clear();
    }

    // create the html element for the overlay. Danmaku elements will be appended to this element
    private createOverlayElement(): HTMLElement {
        const targetElement = this.target;
        const overlayElement = document.createElement('div');
        overlayElement.id = 'danmaku-overlay';

        // set to the same size as target
        overlayElement.style.position = 'absolute';
        overlayElement.style.pointerEvents = 'none';
        overlayElement.style.zIndex = '9999';
        overlayElement.style.overflow = 'hidden';

		// for testing purpose, we color the overlay with red color
		overlayElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';

        // append overlay to the parent of the target element
		if (targetElement.parentElement === null) {
			createSnackbar('Parent element of the target is null', 3000, 'error');
		}
        else {
            targetElement.parentElement.appendChild(overlayElement);        
        }

        return overlayElement;
    }

    public setDanmaku(danmakus: Danmaku[]): void {
        this.danmakus = danmakus;
        createSnackbar('Overlay set danmaku');
    }

    public play(): void {
        createSnackbar('Overlay play');
    }

    public pause(): void {
        createSnackbar('Overlay pause');
    }

    public seek(currentTime: number): void {
        createSnackbar(`Overlay seek to ${currentTime}s`);
        this.clearScreen();
        
    }

    // only clear existing danmakus on the screen. Note that it's different from clear()
    //    in that overlay.danmakus is not cleared
    public clearScreen(): void {
        this.overlayElement.innerHTML = '';
    }

    // clear the overlay. Run when initialized or when another danmaku file is loaded
    // - clear() should be idempotent
    public clear(): void {
        this.clearScreen();
        this.danmakus = [];
        createSnackbar('Overlay cleared');
    }

}

export { Overlay };