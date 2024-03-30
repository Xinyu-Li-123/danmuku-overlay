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

export { Danmaku };