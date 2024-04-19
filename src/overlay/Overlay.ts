import { Danmaku } from '../danmaku/Danmaku';
import { AnimationConfig, OverlayConfig } from '../types/ConfigTypes';
import { createSnackbar } from '../utils/snackbar';


class Overlay {
    private target: HTMLElement;
    public overlayElement: HTMLElement;
    private currentDanmakuIndex: number;
    private danmakus: Danmaku[] = [];
    private activeDanmakuElements: HTMLElement[] = [];

    // TODO: add OverlayConfig as parameter
    constructor(target: HTMLVideoElement) {
        this.target = target;
        this.overlayElement = this.createOverlayElement();
        this.currentDanmakuIndex = -1;
        
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
        this.clear();
        this.danmakus = danmakus;
        this.currentDanmakuIndex = 0;
        createSnackbar('Overlay set danmaku');
    }

    public play(): void {
        createSnackbar('Overlay play');

    }

    public pause(): void {
        createSnackbar('Overlay pause');
    }

    // TODO: To seek to a timestamp, we clear screen and ???
    public seek(currentTime: number): void {
        createSnackbar(`Overlay seek to ${currentTime}s`);
        this.clearScreen();
        // move the currentDanmakuIndex to the danmaku that should be displayed at the current time
        this.currentDanmakuIndex = this.danmakus.findIndex((danmaku) => danmaku.time >= currentTime);
    }

    // On time update, we fetch the danmaku that should be displayed at the current time
    public timeupdate(currentTime: number): void {
        // createSnackbar(`Overlay timeupdate ${currentTime}s`);
        // console.log(`Overlay timeupdate ${currentTime}s`);
        // const danmakus = this.danmakus.filter((danmaku) => danmaku.time === currentTime);
        let i = this.currentDanmakuIndex;
        try {
            while (i < this.danmakus.length && this.danmakus[i].time <= currentTime) {
                this.displayDanmaku(this.danmakus[i]);
                console.log(`Display danmaku ${i} at ${this.danmakus[i].time}s with text ${this.danmakus[i].text}`);
                i++;
            }
        } catch (error) {
            console.error(error);
            debugger;
        }
        this.currentDanmakuIndex = i;
    }

    private displayDanmaku(danmaku: Danmaku): void {
        const danmakuElement = document.createElement('div');
        danmakuElement.className = 'danmaku';
        danmakuElement.style.color = '#' + danmaku.color.toString(16);
        danmakuElement.textContent = danmaku.text;
        this.overlayElement.appendChild(danmakuElement);
        this.activeDanmakuElements.push(danmakuElement);
    }

    // only clear existing danmakus on the screen. Note that it's different from clear()
    //    in that overlay.danmakus is not cleared
    public clearScreen(): void {
        this.overlayElement.innerHTML = '';
        this.activeDanmakuElements = [];
    }

    // clear the overlay. Run when initialized or when another danmaku file is loaded
    // - clear() should be idempotent
    public clear(): void {
        this.clearScreen();
        this.danmakus = [];
        this.currentDanmakuIndex = -1;
        createSnackbar('Overlay cleared');
    }

}

export { Overlay };