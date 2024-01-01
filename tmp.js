let displayedDanmukus = new Set();

function displayDanmuku(danmukuData, video) {
    // ... existing setup code ...

    video.addEventListener('timeupdate', () => {
        danmukuData.forEach(d => {
            if (video.currentTime >= d.time && video.currentTime < d.time + 5 && !displayedDanmukus.has(d)) { 
                // ... create danmukuElement ...

                startAnimation(danmukuElement, video);
                displayedDanmukus.add(d);
            }
        });
    });

    video.addEventListener('pause', () => {
        pauseAnimations();
    });

    video.addEventListener('play', () => {
        resumeAnimations();
    });

    video.addEventListener('seeked', () => {
        overlay.innerHTML = ''; // Clear existing danmukus
        displayedDanmukus.clear(); // Reset the displayed danmukus
        // You might need to re-calculate which danmukus to display based on new currentTime
    });
}

function startAnimation(element, video) {
    let startTime = null;
    const duration = 10000; // Duration in milliseconds

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = elapsedTime / duration;

        if (progress < 1 && !video.paused) {
            element.style.transform = `translateX(${progress * -100}%)`;
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

function pauseAnimations() {
    // Implement logic to pause animations
    // You might need to keep track of the animation state of each danmuku
}

function resumeAnimations() {
    // Implement logic to resume animations
}
