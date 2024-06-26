interface AnimationConfig {
    animationId: number;
    startTime: number;
    displayType: number;
}

interface OverlayConfig {
    numTracks: number;
    speedup: number;
    danmakuConfig: {
        fontSize: string;
        fontFamily: string;
        fontWeight: string;
        textShadow: string;
        opacity: number;
    };
}

export { AnimationConfig, OverlayConfig }