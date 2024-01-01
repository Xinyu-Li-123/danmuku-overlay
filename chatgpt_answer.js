// ... existing code ...

let activeAnimations = new Map();  // Map to track active animations

// Start animation of a single Danmuku element
function startAnimation(element, danmuku, video) {
    let startTime = video.currentTime;
    const duration = 10 / overlayConfig.speedup;
    const totalDistance = video.offsetWidth + element.offsetWidth;

    function animate() {
        const currentTime = video.currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = elapsedTime / duration;

        if (progress >= 1) {
            element.remove();
            activeAnimations.delete(danmuku);
            return;
        }

        if (!video.paused) {
            element.style.transform = `translateX(${-progress * totalDistance}px)`;
            let animationId = requestAnimationFrame(animate);
            activeAnimations.set(danmuku, animationId);
        }
    }

    animate();
}

// Pause animations
function pauseAnimations() {
    activeAnimations.forEach((animationId, danmuku) => {
        cancelAnimationFrame(animationId);
    });
}

// Resume animations
function resumeAnimations() {
    activeAnimations.forEach((_, danmuku) => {
        let danmukuElement = createDanmukuElement(danmuku);
        overlay.appendChild(danmukuElement);
        startAnimation(danmukuElement, danmuku, video);
    });
}

// ... existing event listener code ...

video.addEventListener('seeked', () => {
    pauseAnimations();
    overlay.innerHTML = ''; // Clear existing danmukus
    displayedDanmukus.clear(); // Reset the displayed danmukus
    activeAnimations.clear(); // Clear active animations
    // Restart animations for danmukus relevant to the new currentTime
    danmukuData.forEach(d => {
        if (shouldDisplayDanmuku(d)) {
            const danmukuElement = createDanmukuElement(d);
            overlay.appendChild(danmukuElement);
            startAnimation(danmukuElement, d, video);
            displayedDanmukus.add(d);
        }
    });
});
