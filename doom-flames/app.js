import { initModalDrag, setControls, resetControls } from './controls.js'
import { Flame, genMatrix, initCanvas, runGameLoop } from './flames.js'

// --- Flames ---
window.flameOptions = new Flame()
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
		initCanvas(window.matrix, window.flameOptions)

		if (inputElem.dataset.key === 'flickeringFlame') {
			value ? (window.flameOptions.fps = 10) : (window.flameOptions.fps = 0)
		}

		setControls(window.flameOptions)

		// valueElem.innerText = value
	})
})
resetBtn.addEventListener('click', (event) => {
	resetControls(genMatrix)
})
