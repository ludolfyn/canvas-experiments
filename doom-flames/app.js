import { initModalDrag } from './controls.js'
import { genMatrix, initCanvas } from './flames.js'

// --- Flames ---
window.flameOptions = {
	pxSize: 4,
	rowsAmount: 128,
	colsAmount: 256,
	startPos: 0,
	fps: 0,
	windSpeed: 2,
	color: '#ffa500'
}
const matrix = genMatrix(window.flameOptions) // Light fire
initCanvas(matrix, window.flameOptions) // Burn

// --- App ---
const controls = document.querySelector('.controls')
const controlsInputs = controls.querySelectorAll('input')
initModalDrag(controls)
controlsInputs.forEach((input) => {
	const key = input.dataset.key
	input.addEventListener('change', (event) => {
		window.flameOptions[key] = event.currentTarget.value

		const matrix = genMatrix(window.flameOptions) // Light fire
		initCanvas(matrix, window.flameOptions) // Burn
	})
})
