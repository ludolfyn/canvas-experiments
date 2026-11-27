function initModalDrag(modal) {
	let dragging = false,
		offsetX = 0,
		offsetY = 0

	modal.addEventListener('mousedown', (e) => {
		if (e.target.closest('input, textarea, select, button')) return

		const rect = modal.getBoundingClientRect()

		// Convert to explicit position and remove centering transform
		modal.style.left = rect.left + 'px'
		modal.style.top = rect.top + 'px'
		modal.style.transform = 'none'

		offsetX = e.clientX - rect.left
		offsetY = e.clientY - rect.top
		dragging = true
		modal.classList.add('dragging')
	})

	document.addEventListener('mousemove', (e) => {
		if (!dragging) return
		modal.style.left = e.clientX - offsetX + 'px'
		modal.style.top = e.clientY - offsetY + 'px'
	})

	document.addEventListener('mouseup', () => {
		dragging = false
		modal.classList.remove('dragging')
	})
}

function initFlameDrag(canvas, genMatrix, initCanvas) {
	let flame = window.flame
	let matrix = window.matrix
	let dragging = false

	const viewportWidth = window.innerWidth
	const viewportHeight = window.innerHeight

	let rect = canvas.getBoundingClientRect()
	let canvasPosX = rect.left
	let canvasPosY = rect.top
	let flameHalfX = (flame.flameWidth * flame.pxSize) / 2
	let flameHalfY = (flame.flameHeight * flame.pxSize) / 2

	canvas.addEventListener('mousedown', (e) => {
		const clickedOnFlameX =
			e.clientX - canvasPosX >= flame.flamePosX &&
			e.clientX - canvasPosX <= flame.flamePosX + flame.flameWidth * flame.pxSize
		const mouseY = viewportHeight - e.clientY - canvasPosY
		const clickedOnFlameY =
			mouseY >= flame.flamePosY && mouseY <= flame.flamePosY + flame.flameHeight * flame.pxSize
		console.log(viewportHeight - e.clientY - canvasPosY, flame.flamePosY)

		if (!clickedOnFlameX || !clickedOnFlameY) return

		console.log('hit')

		rect = canvas.getBoundingClientRect()
		canvasPosX = rect.left
		canvasPosY = rect.top
		flameHalfX = (flame.flameWidth * flame.pxSize) / 2
		flameHalfY = (flame.flameHeight * flame.pxSize) / 2

		dragging = true
		canvas.classList.add('dragging')
	})

	document.addEventListener('mousemove', (e) => {
		if (!dragging) return

		flame.flamePosX = e.clientX - canvasPosX - flameHalfX
		flame.flamePosY = viewportHeight - e.clientY - canvasPosY - 20

		matrix = genMatrix(flame) // Light fire
		const canvas = initCanvas(matrix, flame)
		setControls(window.flame)
	})

	canvas.addEventListener('mouseup', () => {
		dragging = false
		canvas.classList.remove('dragging')
	})
}

function setControls(data) {
	const canvas = document.querySelector('canvas')
	const controls = document.querySelector('.controls')
	const inputBlocks = controls.querySelectorAll('.input-wrap')
	inputBlocks.forEach((block) => {
		const labelAmount = block.querySelector('label span')
		const input = block.querySelector('input')
		const dataKey = input.dataset.key

		labelAmount.innerText = data[dataKey]

		if (input.type === 'checkbox') {
			input.checked = data[dataKey]
		} else {
			input.value = data[dataKey]
		}

		if (dataKey === 'flameWidth') {
			input.setAttribute('max', (canvas.width - data.flamePosX) / data.pxSize)
		}
		if (dataKey === 'flameHeight') {
			input.setAttribute('max', (canvas.height - data.flamePosY) / data.pxSize)
		}
		if (dataKey === 'flamePosX') {
			input.setAttribute('max', canvas.width - data.flameWidth * data.pxSize)
		}
		if (dataKey === 'flamePosY') {
			input.setAttribute('max', canvas.height - data.flameHeight * data.pxSize)
		}
	})

	return controls
}

function resetControls(genMatrix) {
	// window.flame = {
	// 	pxSize: 4,
	// 	rowsAmount: 128,
	// 	colsAmount: 256,
	// 	startPos: 0,
	// 	fps: 0,
	// 	windSpeed: 2,
	// 	color: '#ffa500'
	// }
	// window.matrix = genMatrix(window.flame)
	window.location.reload()
}

export { initModalDrag, initFlameDrag, setControls, resetControls }
