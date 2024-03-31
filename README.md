# Danmaku Overlay

This is the repo for Danmuku Overlay, a browser extension that can create an overlay of danmaku (bullet comment) on top of a video element in a webpage. It's written in typescript, and has zero dependency (except for the dev dependencies).

For now, user need to upload danmaku data in xml format to create the overlay. In the future, I plan to integrate dandanplay's danmaku database to the extension and automatically match danmaku based on webpage title.

## Todo List

### Features

- [ ] Add a dropdown menu for user to select danmaku source. This menu should only appear when the user's mouse is hovering over the video element.
- [ ] Integrate dandanplay's danmaku database

### Dev

- [ ] Refactor the `content.ts` script into multiple files
- [x] Integrate TS and Webpack workflows

## Why browser extension instead of userscript?

If there is a video inside an iframe, a userscript won't have the priviledge to access that video element due to same origin policy (assuming the userscript running in the webpage and the video element are not from the same origin). However, a browser extension can access the video element in an iframe. Other than that, there is no difference between a browser extension and a userscript for this application.

## Build

You need to have node.js and pnpm installed to build the extension. Run the following command to install the dependencies:

```bash
pnpm install
```

Then run the following command to build the extension:

```bash
pnpm run build
```

The end result is a bundled file `dist/content.js` that contains all the content script code for the extension.

To load the extension with this local bundled content script, you need to load the extension as an unpacked extension in your browser. For example, in Chrome, you can go to `chrome://extensions/`, enable developer mode, and click "Load unpacked" to load the extension.

