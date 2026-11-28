import { initModalDrag, setControls, resetControls, initFlameDrag } from './controls.js'
import { Flame, genMatrix, initCanvas, runGameLoop } from './flames.js'

// --- Flames ---
window.flame = new Flame()
window.matrix = genMatrix(window.flame) // Light fire
const canvas = initCanvas(window.matrix, window.flame) // Burn
initFlameDrag(canvas, genMatrix, initCanvas)

// --- App ---
const controls = setControls(window.flame)
const resetBtn = controls.querySelector('#reset-controls')
const controlsInputs = controls.querySelectorAll('input')
initModalDrag(controls)
controlsInputs.forEach((input) => {
	const key = input.dataset.key
	const valueElem = input.closest('.input-wrap').querySelector('label span')
	// input.addEventListener('input', (event) => {
	// 	valueElem.innerText = event.currentTarget.value
	// })
	input.addEventListener('input', (event) => {
		const inputElem = event.currentTarget
		const value = inputElem.type === 'checkbox' ? inputElem.checked : inputElem.value
		const computedValue = isNaN(value) ? value : Number(value)
		window.flame.set(key, computedValue)
		window.matrix = genMatrix(window.flame) // Light fire
		initCanvas(window.matrix, window.flame)

		if (inputElem.dataset.key === 'flickeringFlame') {
			value ? (window.flame.fps = 10) : (window.flame.fps = 0)
		}

		setControls(window.flame)
		// valueElem.innerText = value
	})
})
resetBtn.addEventListener('click', (event) => {
	resetControls(genMatrix)
})
