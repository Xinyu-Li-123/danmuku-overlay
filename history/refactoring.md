# Refactoring Plan

The `history/single_content/content_scripts/content.ts` file is a huge IIFE that contains all the logic for the extension. For better maintainability and extensibility (e.g. integrate [dandanplay's danmaku database](https://api.dandanplay.net/swagger/ui/index#!/)), I want to refactor the code into multiple files.

The basic idea is to extract an `Overlay` class that contains the logic for overlaying danmaku on video. Abstractly speaking, this class should be able to do the following (although the source code for these functionalities may be decoupled into different files):
- given a video element, create the overlay div and place it on top of that video
- provide the user with a dropdown menu to input source for danmaku data (file, url, dandanplay database)
- manipulate danmaku animation according to video status
- resize the overlay div according to video size, or go fullscreen when video goes fullscreen
- provide a menu for user to config the danmaku (e.g. filter, size, speed) persistently (need local storage)

## Rambling

I don't regret writing the IIFE-version of the extension though. It was a good way to get started and to understand how browser extension works. I think "makeshift demo + refactoring" is better than "strictly follow best practices from the beginning", which is a form of [premature design](https://scalibq.wordpress.com/2011/07/20/premature-design-is-the-root-of-all-evil/).

The main motivation for the refactoring is that I realize it would be nearly impossible to add support for dandanplay's danmaku database to the current codebase, and I think I have an adequate understanding of what each component should do now.
