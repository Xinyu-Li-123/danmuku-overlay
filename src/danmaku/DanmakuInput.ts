import { Overlay } from '../overlay/Overlay';
import { parseDanmakuFile } from '../utils/parsing';
import { createSnackbar } from '../utils/snackbar';
import './DanmakuInput.css';

function createDanmakuXMLInput(overlay: Overlay) {
	const inputElement = document.createElement('input');
	inputElement.type = 'file';
	inputElement.accept = '.xml';
	inputElement.className = 'danmaku-input';

	inputElement.addEventListener('change', function(this: HTMLInputElement) {
		// convert xml file to string
		if (!this.files || this.files.length === 0) {
			createSnackbar('No file selected!', 3000, 'error');
			return;
		}
		const file = this.files[0];
		const reader = new FileReader();
		reader.onload = function(e) {
			if (!e.target || !e.target.result) {
				createSnackbar('Failed to read the file!', 3000, 'error');
				return;
			}
			// : Implement also for ArrayBuffer
			if (typeof e.target.result !== 'string') {
				createSnackbar('Failed to read the file!', 3000, 'error');
				return;
			}
			const danmakuData = parseDanmakuFile(e.target.result);
			createSnackbar(`Parsed ${danmakuData.length} danmakus!`, 3000, 'success');
			overlay.setDanmakus(danmakuData);
		};
		reader.readAsText(file);
	});

	// append input element to the overlay
	if (overlay.overlayElement.parentElement === null) {
		createSnackbar('Parent element of the overlay is null', 3000, 'error');
	}
	else {
		overlay.overlayElement.parentElement.appendChild(inputElement);
	}
}

export { createDanmakuXMLInput };