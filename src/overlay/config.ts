import { OverlayConfig } from "../types/ConfigTypes";

const defaultOverlayConfig: OverlayConfig = {
	numTracks: 8,
	speedup: 1,
	danmakuConfig: {
		fontSize: '24px',
		fontFamily: 'SimHei, \'Microsoft JhengHei\', Arial, Helvetica, sans-serif',
		fontWeight: 'bold',
		textShadow: '1px 0 1px #000000,0 1px 1px #000000,0 -1px 1px #000000,-1px 0 1px #000000',
		opacity: 0.7
	},
}

export { defaultOverlayConfig };