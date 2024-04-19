import { Danmaku } from '../danmaku/Danmaku';
import { AnimationConfig, OverlayConfig } from '../types/ConfigTypes';
import { createSnackbar } from '../utils/snackbar';
import "../styles/Danmaku.css"

class Overlay {
    private target: HTMLVideoElement;
    private config: OverlayConfig;
    public overlayElement: HTMLElement;
    private currentDanmakuIndex: number;
    private danmakus: Danmaku[] = [];
    private activeDanmakuElements: HTMLElement[] = [];

    // TODO: add OverlayConfig as parameter
    constructor(target: HTMLVideoElement, config: OverlayConfig) {
        this.target = target;
        this.config = config;
        this.overlayElement = this.createOverlayElement();
        this.currentDanmakuIndex = -1;
        // console.log("In Overlay constructor, this = ");
        // console.log(this);
        this.clear();
    }

    private isActive(): boolean {
        return this.currentDanmakuIndex !== -1;
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

    public setDanmakus(danmakus: Danmaku[]): void {
        this.clear();
        this.danmakus = danmakus;
        this.seek(this.target.currentTime);
        createSnackbar('Overlay set danmaku');
    }

    public play(): void {
        createSnackbar('Overlay play');
        // start the animation of the danmaku
        // console.log("In Overlay play(), this = ");
        // console.log(this);
        if (!this.isActive()) { return; }
        this.activeDanmakuElements.forEach((danmakuElement) => {
            danmakuElement.style.animationPlayState = 'running';
        });
    }

    public pause(): void {
        createSnackbar('Overlay pause');
        // pause the animation of the danmaku
        // console.log("In Overlay pause(), this = ");
        // console.log(this);
        if (!this.isActive()) { return; }
        this.activeDanmakuElements.forEach((danmakuElement) => {
            danmakuElement.style.animationPlayState = 'paused';
        });
    }

    // TODO: To seek to a timestamp, we clear screen and ???
    public seek(currentTime: number): void {
        createSnackbar(`Overlay seek to ${currentTime}s`);
        // console.log("In Overlay seek(), this = ");
        // console.log(this);
        this.clearScreen();
        // move the currentDanmakuIndex to the danmaku that should be displayed at the current time
        // if no danmaku should be displayed at the current time, set currentDanmakuIndex to -1
        if (this.danmakus.length === 0) { 
            this.currentDanmakuIndex = -1;
        }
        this.currentDanmakuIndex = this.danmakus.findIndex((danmaku) => danmaku.time >= currentTime);
    }

    // On time update, we fetch the danmaku that should be displayed at the current time
    public timeupdate(currentTime: number): void {
        // console.log("In Overlay timeupdate(), this = ");
        // console.log(this);
        if (!this.isActive()) { return; }
        // createSnackbar(`Overlay timeupdate ${currentTime}s`);
        // console.log(`Overlay timeupdate ${currentTime}s`);
        // const danmakus = this.danmakus.filter((danmaku) => danmaku.time === currentTime);
        let i = this.currentDanmakuIndex;
        try {
            while (i < this.danmakus.length && this.danmakus[i].time <= currentTime) {
                this.createDisplayDanmakuElement(this.danmakus[i]);
                console.log(`Display danmaku ${i} at ${this.danmakus[i].time}s with text ${this.danmakus[i].text}`);
                i++;
            }
        } catch (error) {
            console.error(error);
            debugger;
        }
        this.currentDanmakuIndex = i;
    }

    private stylizeDanmakuElement(danmakuElement: HTMLElement, danmaku: Danmaku): void {
        // per overlay config
        danmakuElement.style.fontSize = this.config.danmakuConfig.fontSize;
        danmakuElement.style.fontFamily = this.config.danmakuConfig.fontFamily;
        danmakuElement.style.fontWeight = this.config.danmakuConfig.fontWeight;
        danmakuElement.style.textShadow = this.config.danmakuConfig.textShadow;
        danmakuElement.style.opacity = this.config.danmakuConfig.opacity.toString();

        // per danmaku object
        danmakuElement.style.color = '#' + danmaku.color.toString(16);

        // randomized values
        // - random track
        danmakuElement.style.top = (Math.floor(Math.random() * this.config.numTracks) * 100 / this.config.numTracks) + '%';
    }

    private createDisplayDanmakuElement(danmaku: Danmaku): void {
        const danmakuElement = document.createElement('div');

        danmakuElement.className = 'danmaku';
        danmakuElement.textContent = danmaku.text;

        this.stylizeDanmakuElement(danmakuElement, danmaku);

        // remove danmaku on animation end
        // FIXME: `this` is not the Overlay object
        danmakuElement.addEventListener('animationend', () => {
            this.overlayElement.removeChild(danmakuElement);
            // TODO: Create index of danmaku instead of searching for it brute force
            this.activeDanmakuElements = this.activeDanmakuElements.filter((element) => element !== danmakuElement);
        });

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
        // console.log("In Overlay clear(), this = ");
        // console.log(this);
        if (!this.isActive()) { return; }
        this.clearScreen();
        this.danmakus = [];
        this.currentDanmakuIndex = -1;
        createSnackbar('Overlay cleared');
    }

}

export { Overlay };