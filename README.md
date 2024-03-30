# Danmaku Overlay

This repo provides a Microsoft Edge extension called "Danmaku Overlay" that can create an overlay of danmaku (bullet comment) on top of a video element in a webpage.

For now, user need to upload danmaku data in xml format to create the overlay. In the future, I plan to integrate dandanplay's danmaku database to the extension and automatically match danmaku based on webpage title.

## Why Browser Extension instead of Userscript?

If there is a video inside an iframe, a userscript won't have the priviledge to access that video element due to same origin policy (assuming the userscript running in the webpage and the video element are not from the same origin). However, a browser extension can access the video element in an iframe. Other than that, there is no difference between a browser extension and a userscript for this application.
