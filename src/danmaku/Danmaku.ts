
class Danmaku {
	// the html element that represents the danmaku
	private danmaku: HTMLElement;
	// the html element that contains the danmaku element
	private overlay: HTMLElement;
	// the video timestamp when the danmaku should be sent
	private time: number = 0;
	// 1 for rolling danmaku, 5 for top danmaku
	private displayType: number = 1;
	// decimal representation of color in RGB
	private color: string = "black";
	// unix time when the danmaku was sent
	private sentTime: number = 0;
	private text: string = "Danmuku text placeholder";

	constructor(overlayElement: HTMLElement, time: number, displayType: number, color: string, sentTime: number, text: string) {
		this.overlay = overlayElement;
		this.time = time;
		this.displayType = displayType;
		this.color = color;
		this.sentTime = sentTime;
		this.text = text;

		this.danmaku = this.create_and_append(overlayElement);
	}

	// create the html element for the danmaku
	private create_and_append(overlay: HTMLElement): HTMLElement {
		const danmaku = document.createElement("div");
		danmaku.className = 'danmaku';
		danmaku.style.position = 'absolute';
		danmaku.style.color = this.color;
		danmaku.style.fontSize = '20px';
		danmaku.style.whiteSpace = 'nowrap';
		danmaku.style.transition = 'transform 5s linear';
		danmaku.style.zIndex = '9999';
		danmaku.style.pointerEvents = 'none';
		danmaku.innerText = this.text;
		return danmaku;
	}

	// play the danmaku animation
	public play(): void {
		this.danmaku.style.transform = `translateX(-100%)`;
	}

	// pause the danmaku animation
	public pause(): void {
		this.danmaku.style.transform = `translateX(-100%)`;
	}

	// seek the danmaku animation
	public seek(currentTime: number): void {
		// check the position of the danmaku at currentTime and move the danmaku
		//    if currentTime is not within the time range of the danmaku, destroy the danmaku
	}

	// clear the danmaku
	// FIXME: This won't work since typescript has no class destructor
	public clear(): void {
		
	}
}

export { Danmaku };