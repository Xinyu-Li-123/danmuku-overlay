interface Danmaku {
    // the video timestamp when the danmaku should be sent
    time: number;
    // 1 for rolling danmaku, 5 for top danmaku
    displayType: number;
    // decimal representation of color in RGB
    color: number;
    // unix time when the danmaku was sent
    sentTime: number;
    text: string;
}

const failureDanmaku: Danmaku = {
	time: 0,
	displayType: 1,
	color: 0,
	sentTime: 0,
	text: 'Failed to load this danmaku data!',
};

const validDisplayTypes: number[] = [1, 5];

export { Danmaku, failureDanmaku, validDisplayTypes };