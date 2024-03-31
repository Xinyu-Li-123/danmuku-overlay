import './snackbar.css';

let snackbars: HTMLElement[] = []; // Track active snackbars

function createSnackbar(messageText: string, displayDuration: number = 3000, fadeDuration: number = 1000, alertType: string = 'info') {
    const snackbar = document.createElement('div');
    const closeButton = document.createElement('button');
    const progressBar = document.createElement('div');

    // Set classes for styling
    if (['info', 'success', 'warning', 'error'].includes(alertType)) {
        snackbar.className = `snackbar snackbar-${alertType}`;
    }
    else {
        snackbar.className = 'snackbar snackbar-default';
    }
    closeButton.className = 'snackbar-close-button';
    progressBar.className = 'snackbar-progress-bar';

    // Setup snackbar
    snackbar.textContent = messageText;
    closeButton.textContent = 'x';

    // Append children
    snackbar.appendChild(closeButton);
    snackbar.appendChild(progressBar);

    // Set the vertical position
    let bottomOffset = 20;
    snackbars.forEach(sb => {
        bottomOffset += sb.offsetHeight + 10; // 10px gap between snackbars
    });
    snackbar.style.bottom = `${bottomOffset}px`;

    snackbars.push(snackbar);
    document.body.appendChild(snackbar);

    // Start the progress bar animation
    const pbHandle = setTimeout(() => progressBar.style.width = '0%', displayDuration / 1000);

    // Auto remove after display duration
    const rmHandle = setTimeout(() => removeSnackbar(snackbar, pbHandle, fadeDuration), displayDuration);
    
    // Close button event
    closeButton.onclick = () => {
        clearTimeout(rmHandle);
        removeSnackbar(snackbar, pbHandle, 0)
    };

}

function removeSnackbar(snackbar: HTMLElement, pbhandle: number, fadeDuration: number) {
    clearTimeout(pbhandle);
    snackbar.style.opacity = '0';
    setTimeout(() => {
        document.body.removeChild(snackbar);
        const index = snackbars.indexOf(snackbar);
        if (index > -1) {
            snackbars.splice(index, 1);
        }
        updateSnackbarPositions();
    }, fadeDuration);
}

function updateSnackbarPositions() {
    let bottomOffset = 20;
    snackbars.forEach(sb => {
        bottomOffset += sb.offsetHeight + 10; // 10px gap between snackbars
        sb.style.bottom = `${bottomOffset}px`;
    });
}

// Export the function if it needs to be used in other modules
export { createSnackbar };
