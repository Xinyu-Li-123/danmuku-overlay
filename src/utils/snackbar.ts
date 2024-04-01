import './snackbar.css';

const snackbarTypes = ['info', 'success', 'error', 'default'];

class Snackbar {
    private element: HTMLElement;
    private progressBar: HTMLElement;
    private timeoutHandle: number | null = null;

    constructor(messageText: string, displayDuration: number, sbType: string, private snackbars: SnackbarsManager) {
        this.element = document.createElement('div');
        const closeButton = document.createElement('button');
        this.progressBar = document.createElement('div');

        if (snackbarTypes.includes(sbType)) {
            this.element.className = `snackbar snackbar-${sbType}`;
        } else {
            console.error(`Invalid snackbar type: ${sbType}`);
            this.element.className = `snackbar snackbar-default`;
        }

        closeButton.className = 'snackbar-close-button';
        this.progressBar.className = 'snackbar-progress-bar';

        this.element.textContent = messageText;
        closeButton.textContent = 'x';
        this.element.appendChild(closeButton);
        this.element.appendChild(this.progressBar);

        closeButton.onclick = () => this.remove();

        this.snackbars.addElement(this.element);

        // Set the progress bar animation duration to match displayDuration
        this.progressBar.style.width = '100%';
        this.progressBar.style.transition = `width ${displayDuration / 1000}s linear`;
        requestAnimationFrame(() => {
            this.progressBar.style.width = '0%';
        });

        this.timeoutHandle = window.setTimeout(() => {
            this.remove();
        }, displayDuration);
    }

    remove() {
        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
        }

        this.snackbars.removeElement(this.element);
    }
}

class SnackbarsManager {
    private elements: HTMLElement[] = [];

    addElement(element: HTMLElement) {
        let bottomOffset = 20;
        this.elements.forEach(sb => {
            bottomOffset += sb.offsetHeight + 10;
        });
        element.style.bottom = `${bottomOffset}px`;
        this.elements.push(element);
        document.body.appendChild(element);
    }

    removeElement(element: HTMLElement) {
        document.body.removeChild(element);
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
        }
        this.updatePositions();
    }

    private updatePositions() {
        let bottomOffset = 20;
        this.elements.forEach(sb => {
            sb.style.bottom = `${bottomOffset}px`;
            bottomOffset += sb.offsetHeight + 10;
        });
    }
}

const snackbarsManager = new SnackbarsManager();

function createSnackbar(messageText: string, displayDuration: number = 3000, alertType: string = 'info') {
    new Snackbar(messageText, displayDuration, alertType, snackbarsManager);
}

export { createSnackbar };
