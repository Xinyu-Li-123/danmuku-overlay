# Danmuku Overlay

This repo provides a Javascript script `danmuku_overlay.js` that can create an overlay of danmuku on top of a video element^[For security reasons, there are cases where this script won't work. For detail, see [this section](#-limiation)]. The script is written in pure Javascript with no dependency on any third-party library. In effect, **it can turn any video player into a danmuku player**.

The easiest way to use this script is to use it with Tampermonkey, although the script make no use of Tampermonkey api. 

## Usage

### Tampermonkey (Manual)

1. Install Tampermonkey for your browser.
2. Create a new script in Tampermonkey.
3. Copy the content of `danmuku_overlay_userscript.js` into the script.

### Tampermonkey (Greasy Fork)

Not yet available. I plan to upload it to Greasy Fork in the future.

### Raw HTML

1. Copy the content of `danmuku_overlay.js` to the bottom of your HTML file inside a `<script>` tag.

## Limitation

Due to security reasons, this script won't work in the following cases:

- The video element is in a cross-origin iframe which blocks access to its content.
- The video is in a shadow DOM which blocks access to its content.