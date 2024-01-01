# Danmuku Overlay

This repo provides a Tampermonkey script `danmuku_overlay.js` that can create an overlay of danmuku on top of a video element^[For security reasons, there are cases where this script won't work. For detail, see [this section](#-limiation)]. The script is written in pure Javascript with no dependency on any third-party library. It can be used in any browser that supports Tampermonkey. **This script in effect can turn any video player into a danmuku player**.

## Limitation

Due to security reasons, this script won't work in the following cases:

- The video element is in a cross-origin iframe which blocks access to its content.
- The video is in a shadow DOM which blocks access to its content.