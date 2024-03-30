function createSnackbar(messageText: string, displayDuration: number = 3000, fadeDuration: number = 1000, alertType: string = 'info') {
	const snackbar = document.createElement('div');

	snackbar.textContent = messageText;
    snackbar.style.fontSize = '16px';
	snackbar.style.bottom = '20px';
	snackbar.style.left = '20px';
	snackbar.style.padding = '20px';
	snackbar.style.borderRadius = '5px';
	snackbar.style.opacity = '1';
	snackbar.style.transition = `opacity ${fadeDuration / 1000}s ease-out`;
	snackbar.style.position = 'fixed';
	snackbar.style.zIndex = '10000';

	// type-specific styles
	if (alertType === 'info') {
		snackbar.style.backgroundColor = 'black';
		snackbar.style.color = 'white';
	} else if (alertType === 'success') {
		snackbar.style.backgroundColor = 'green';
		snackbar.style.color = 'white';
	} else if (alertType === 'error') {
		snackbar.style.backgroundColor = 'red';
		snackbar.style.color = 'white';
	} else {
		// default style
		snackbar.style.backgroundColor = 'black';
		snackbar.style.color = 'white';
	}

	document.body.appendChild(snackbar);

	setTimeout(() => {
		snackbar.style.opacity = '0';
		setTimeout(() => document.body.removeChild(snackbar), fadeDuration);
	}, displayDuration);
}

export { createSnackbar };