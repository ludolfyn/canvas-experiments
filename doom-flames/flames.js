class Pixel {
	posX = 0
	posY = 0
	height = 16
	width = 16
	color = '#ffa500'
	colorGradient = []
	currentColor = '#ffffff'
	windSpeed = 0
	opacity = 100
	rowsAmount = 1
	currentRow = 1
	colsAmount = 1
	currentCol = 1

	constructor(flameOptions) {
		const { posX, posY, pxSize, rowIndex, colIndex, rowsAmount, colsAmount, color, windSpeed } = flameOptions
		const gradientStepsAmount = rowsAmount - 20

		this.posX = posX
		this.posY = posY
		this.width = pxSize
		this.height = pxSize
		this.currentRow = rowIndex + 1
		this.currentCol = colIndex + 1
		this.color = color
		this.windSpeed = windSpeed
		this.colorGradient = this.genGradient(color, gradientStepsAmount)
		this.colorIndex = this.colorGradient.length - 1
		this.currentColor = this.colorGradient[this.colorIndex]
		this.rowsAmount = rowsAmount
		this.colsAmount = colsAmount
	}

	updateColor(matrix) {
		const last = this.colorGradient.length - 1
		const shouldUpddate = Math.floor(Math.random() * 3) - 1
		const matrixOffsetSides = (this.colsAmount / 6) * this.windSpeed
		const grabColorIndexFromBelow = () => {
			const minusOneToOne = Math.floor(Math.random() * 3) - 1
			const offsetRange = !minusOneToOne ? 3 : 3 + this.windSpeed

			const decay = Math.floor(Math.random() * 3)
			const offset = Math.floor(Math.random() * offsetRange) - 1
			const below = matrix[this.currentRow - 2]?.[this.currentCol - 1 + offset]

			const neighbourIndex = below?.colorIndex ?? last
			const cooledIndex = neighbourIndex + decay

			return cooledIndex
		}

		// Create offset on side of matrix
		if (this.currentCol < matrixOffsetSides && this.windSpeed) {
			if (!this.windSpeed) {
				// Fill offset pixels with black (if no wind)
				this.colorIndex = last
			} else if (shouldUpddate >= 1) {
				// Fill offset with continuation of flame
				const cooledIndex = grabColorIndexFromBelow()
				this.colorIndex = Math.min(cooledIndex, last)
			}

			this.currentColor = this.colorGradient[this.colorIndex]
			return
		}

		// if (this.currentCol > this.colsAmount - matrixOffsetSides) {
		// 	this.colorIndex = this.colorGradient.length - 1
		// 	this.currentColor = this.colorGradient[this.colorIndex]
		// 	return
		// }

		// 1/3 chance for the pixel to update
		// to make flame grow slower and create sparks
		if (shouldUpddate < 1) {
			return
		}

		// If in first row (bottom)
		if (this.currentRow === 1) {
			// Choose one of the first 3 colors to create slight flicker at the source
			this.colorIndex = Math.floor(Math.random() * 3)
		} else {
			// Creates wind effect (apply windSpeed prop)
			const cooledIndex = grabColorIndexFromBelow()
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
	const { pxSize, rowsAmount, colsAmount, startPos } = matrixOptions
	const canvas = document.querySelector('canvas')

	for (let rowIndex = 0; rowIndex < rowsAmount; rowIndex++) {
		const row = []
		for (let colIndex = 0; colIndex < colsAmount; colIndex++) {
			const posX = pxSize * colIndex + startPos
			const posY = pxSize * rowIndex
			flameOptions.posX = posX
			flameOptions.posY = posY
			flameOptions.rowIndex = rowIndex
			flameOptions.colIndex = colIndex
			const pixel = new Pixel(flameOptions)

			row.push(pixel)
		}
		matrix.push(row)
	}
	console.log(matrix)
	return matrix
}

let lastTime = 0
function runGameLoop(timestamp, canvas, matrix, flameOptions = { fps: 10 }) {
	// if (timestamp > 500) {
	// 	stopGameLoop()
	// 	return
	// }

	window.gameLoopId = requestAnimationFrame((time) => {
		runGameLoop(time, canvas, matrix, flameOptions)
	})

	// Throttle frames
	const { fps } = flameOptions
	const interval = 1000 / fps
	lastTime = lastTime || timestamp
	const delta = timestamp - lastTime
	if (fps && delta < interval) {
		return
	}

	lastTime = timestamp

	const ctx = canvas.getContext('2d')
	// ctx.clearRect(0, 0, canvas.width, canvas.height)
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

function stopGameLoop() {
	if (window.gameLoopId) {
		cancelAnimationFrame(window.gameLoopId)
		window.gameLoopId = null
	}
}

function initCanvas(matrix, flameOptions) {
	console.log('starting loop')

	stopGameLoop()

	const canvas = document.getElementById('c')
	const ctx = canvas.getContext('2d')
	ctx.imageSmoothingEnabled = false

	runGameLoop(null, canvas, matrix, flameOptions)
}

export { Pixel, genMatrix, initCanvas, runGameLoop, stopGameLoop }
