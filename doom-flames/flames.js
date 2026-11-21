class Pixel {
	posX = 0
	posY = 0
	height = 16
	width = 16
	color = '#ffa500'
	colorGradient = []
	currentColor = '#ffffff'
	opacity = 100
	rowsAmount = 1
	currentRow = 1
	colsAmount = 1
	currentCol = 1

	constructor(posVector, rowIndex, colIndex, pxSize, colorGradientData = { color: '#ffa500', steps: 16 }) {
		this.posX = posVector.posX
		this.posY = posVector.posY
		this.width = pxSize
		this.height = pxSize
		this.currentRow = rowIndex + 1
		this.currentCol = colIndex + 1
		this.color = colorGradientData.color
		this.colorGradient = this.genGradient(colorGradientData.color, colorGradientData.steps)
		this.colorIndex = this.colorGradient.length - 1
		this.currentColor = this.colorGradient[this.colorIndex]
	}

	updateColor(matrix) {
		const last = this.colorGradient.length - 1

		if (this.currentRow === 1) {
			// Choose one of the first 3 colors to create slight flicker at the source
			this.colorIndex = Math.floor(Math.random() * 3)
		} else {
			const decay = Math.floor(Math.random() * 3) // 0 to 2
			const offset = Math.floor(Math.random() * 3) - 1 // -1, 0, 1
			const below = matrix[this.currentRow - 2]?.[this.currentCol - 1 + offset]

			const neighbourIndex = below?.colorIndex ?? last
			const cooledIndex = neighbourIndex + decay
			this.colorIndex = Math.min(cooledIndex, last)
		}

		this.currentColor = this.colorGradient[this.colorIndex]
	}

	genGradient(colorHex, stepsAmount) {
		const hex = colorHex.replace('#', '')
		const full =
			hex.length === 3
				? hex
						.split('')
						.map((c) => c + c)
						.join('')
				: hex

		const r = parseInt(full.slice(0, 2), 16)
		const g = parseInt(full.slice(2, 4), 16)
		const b = parseInt(full.slice(4, 6), 16)

		const toHex = (n) => Math.round(n).toString(16).padStart(2, '0')
		const rgbToHex = (r, g, b) => `#${toHex(r)}${toHex(g)}${toHex(b)}`
		const lerp = (from, to, t) => from + (to - from) * t

		const whiteSteps = Math.ceil(stepsAmount / 2)
		const blackSteps = stepsAmount - whiteSteps

		const gradient = []

		// White to full color (includes both endpoints)
		for (let i = 0; i < whiteSteps; i++) {
			const t = i / (whiteSteps - 1)
			gradient.push(rgbToHex(lerp(255, r, t), lerp(255, g, t), lerp(255, b, t)))
		}

		// Full color to black (excludes the full color, includes black)
		for (let i = 1; i <= blackSteps; i++) {
			const t = i / blackSteps
			gradient.push(rgbToHex(lerp(r, 0, t), lerp(g, 0, t), lerp(b, 0, t)))
		}

		return gradient
	}
}

function genMatrix(matrixOptions) {
	const matrix = []
	const { pxSize, rowsAmount, colsAmount, startPos, color } = matrixOptions
	const canvas = document.querySelector('canvas')
	// const colsAmount = canvas.width / pxSize
	// const rowsAmount = canvas.height / pxSize

	for (let rowIndex = 0; rowIndex < rowsAmount; rowIndex++) {
		const row = []
		for (let colIndex = 0; colIndex < colsAmount; colIndex++) {
			const posX = pxSize * colIndex + startPos
			const posY = pxSize * rowIndex
			const pixel = new Pixel({ posX, posY }, rowIndex, colIndex, pxSize, {
				steps: rowsAmount - 16,
				color: color
			})
			row.push(pixel)
		}
		matrix.push(row)
	}
	console.log(matrix)
	return matrix
}

let lastTime = 0

function gameLoop(timestamp, canvas, matrix) {
	window.gameLoopId = requestAnimationFrame((time) => {
		gameLoop(time, canvas, matrix)
	})

	// Throttle frames
	const fps = 10
	const interval = 1000 / fps
	lastTime = lastTime || timestamp
	const delta = timestamp - lastTime
	if (delta < interval) {
		return
	}

	lastTime = timestamp

	const ctx = canvas.getContext('2d')
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	matrix.forEach((row, rowIndex) => {
		row.forEach((px) => {
			// Update px color
			px.updateColor(matrix)

			// ctx.globalAlpha = px.opacity;
			ctx.fillStyle = px.currentColor
			ctx.fillRect(px.posX, px.posY, px.width, px.height)

			// border
			// ctx.strokeStyle = '#ffffff'
			// ctx.lineWidth = 0.2
			// ctx.strokeRect(px.posX + 0.5, px.posY + 0.5, px.width - 1, px.height - 1)
		})
	})
}

function initCanvas(matrix) {
	console.log('starting loop')

	if (window.gameLoopId) {
		cancelAnimationFrame(window.gameLoopId)
		window.gameLoopId = null
	}

	const canvas = document.getElementById('c')
	const ctx = canvas.getContext('2d')
	ctx.imageSmoothingEnabled = false

	gameLoop(null, canvas, matrix)
}

const flameOptions = {
	pxSize: 8,
	rowsAmount: 80,
	colsAmount: 60,
	startPos: 100,
	color: '#1100ff'
}
const matrix = genMatrix(flameOptions) // Light fire
initCanvas(matrix) // Burn
