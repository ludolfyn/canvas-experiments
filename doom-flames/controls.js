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

function setControls(data) {
	const canvas = document.querySelector('canvas')
	const inputBlocks = document.querySelectorAll('.controls .input-wrap')
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
}

function resetControls(genMatrix) {
	// window.flameOptions = {
	// 	pxSize: 4,
	// 	rowsAmount: 128,
	// 	colsAmount: 256,
	// 	startPos: 0,
	// 	fps: 0,
	// 	windSpeed: 2,
	// 	color: '#ffa500'
	// }
	// window.matrix = genMatrix(window.flameOptions)
	window.location.reload()
}

export { initModalDrag, setControls, resetControls }
