import { Danmaku, failureDanmaku, validDisplayTypes } from "../danmaku/Danmaku";

// parse the xml danmaku file into an array of Danmaku objects
function parseDanmakuXMLFile(xmlData: string): Danmaku[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const danmakuXMLElements = xmlDoc.getElementsByTagName("d");

    return Array.from(danmakuXMLElements)
    .map(de => {
		const p = de.getAttribute("p");
		if (p === null) { return failureDanmaku; }
		
        const attributes = p.split(",");
        /* xml danmaku attributes:
            p: time, displayType, ?, color (decimal), sent time, ?, ?, ?, ?
            - time: video timestamp in milliseconds when the danmaku should be sent
            - displayType: 1 for rolling danmaku, 5 for top danmaku
            - color: decimal representation of color in RGB
            - sent time: unix time when the danmaku was sent 
        */
        const time = parseFloat(attributes[0]);
        const displayType = parseInt(attributes[1]);
        const color = parseInt(attributes[3]);
        const sentTime = parseInt(attributes[4]);
		const text = de.textContent || '';

		const d: Danmaku = {
            time: time,
            // use rolling danmaku as default displayType
            displayType: validDisplayTypes.includes(displayType) ? displayType : 1,
            color: color,
            sentTime: sentTime,
            text: text,
        };

        return d;
    })
	// sort danamku by time to accelerate seeking
    .sort((a, b) => a.time - b.time);
}

export { parseDanmakuXMLFile as parseDanmakuFile };