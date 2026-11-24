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

export { initModalDrag }
