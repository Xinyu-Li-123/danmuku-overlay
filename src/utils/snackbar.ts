import './snackbar.css';

const snackbarTypes = ['info', 'success', 'error', 'default'];

class Snackbar {
    private element: HTMLElement;
    private progressBar: HTMLElement;
    private fadeTimeoutHandle: number | null = null;
    private progressBarHandle: number | null = null;

    constructor(messageText: string, displayDuration: number, fadeDuration: number, sbType: string, private snackbars: Snackbars) {
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

        closeButton.onclick = () => this.remove(0);

        this.snackbars.addElement(this.element);

        this.progressBarHandle = window.setTimeout(() => {
            this.progressBar.style.width = '0%';
        }, 1);

        this.fadeTimeoutHandle = window.setTimeout(() => {
            this.remove(fadeDuration);
        }, displayDuration);
    }

    remove(fadeDuration: number) {
        if (this.fadeTimeoutHandle) {
            clearTimeout(this.fadeTimeoutHandle);
        }
        if (this.progressBarHandle) {
            clearTimeout(this.progressBarHandle);
        }

        this.element.style.opacity = '0';
        window.setTimeout(() => {
            this.snackbars.removeElement(this.element);
        }, fadeDuration);
    }
}

class Snackbars {
    private elements: HTMLElement[] = [];

    addElement(element: HTMLElement) {
        let bottomOffset = 20;
        this.elements.forEach(sb => {
            bottomOffset += sb.offsetHeight + 10;
        });
        element.style.bottom = `${bottomOffset}px`;

        this.elements.push(element);
        document.body.appendChild(element);
        this.updatePositions();
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
            bottomOffset += sb.offsetHeight + 10;
            sb.style.bottom = `${bottomOffset}px`;
        });
    }
}

const snackbarsManager = new Snackbars();

function createSnackbar(messageText: string, displayDuration: number = 3000, fadeDuration: number = 1000, alertType: string = 'info') {
    new Snackbar(messageText, displayDuration, fadeDuration, alertType, snackbarsManager);
}

export { createSnackbar };
