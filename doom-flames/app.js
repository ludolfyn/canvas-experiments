import { initModalDrag, setControls, resetControls } from './controls.js'
import { genMatrix, initCanvas, runGameLoop } from './flames.js'

// --- Flames ---
window.flameOptions = {
	pxSize: 4,
	flamePosX: 100,
	flamePosY: 100,
	flameHeight: 100,
	flameWidth: 100,
	fps: 0,
	windSpeed: 0,
	color: '#ffa500',
	decayRate: 1.7,
	showMatrix: false
}
window.matrix = genMatrix(window.flameOptions) // Light fire
initCanvas(window.matrix, window.flameOptions) // Burn
setControls(window.flameOptions)

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
		const inputElem = event.currentTarget
		const value = inputElem.type === 'checkbox' ? inputElem.checked : inputElem.value
		const computedValue = isNaN(value) ? value : Number(value)
		window.flameOptions[key] = computedValue
		window.matrix = genMatrix(window.flameOptions) // Light fire
		// initCanvas(window.matrix, window.flameOptions)

		valueElem.innerText = value
	})
})
resetBtn.addEventListener('click', (event) => {
	resetControls(genMatrix)
})
