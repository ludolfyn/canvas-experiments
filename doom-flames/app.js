import { initModalDrag, resetControls } from './controls.js'
import { genMatrix, initCanvas, runGameLoop } from './flames.js'

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
window.matrix = genMatrix(window.flameOptions) // Light fire
initCanvas(window.matrix, window.flameOptions) // Burn

// --- App ---
const controls = document.querySelector('.controls')
const resetBtn = controls.querySelector('#reset-controls')
const controlsInputs = controls.querySelectorAll('input')
initModalDrag(controls)
controlsInputs.forEach((input) => {
	const key = input.dataset.key
	const valueElem = input.closest('.input-wrap').querySelector('label span')
	input.addEventListener('input', (event) => {
		valueElem.innerText = event.currentTarget.value
	})
	input.addEventListener('change', (event) => {
		const value = event.currentTarget.value
		const computedValue = isNaN(value) ? value : Number(value)
		window.flameOptions[key] = computedValue
		window.matrix = genMatrix(window.flameOptions) // Light fire
		// initCanvas(window.matrix, window.flameOptions)

		valueElem.innerText = event.currentTarget.value
	})
})
resetBtn.addEventListener('click', (event) => {
	resetControls(genMatrix)
})
