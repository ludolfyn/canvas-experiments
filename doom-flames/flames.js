class Flame {
	pxSize = 4
	flamePosX = 0
	flamePosY = 0
	flameHeight = 100
	flameWidth = 256
	fps = 0
	windSpeed = 1
	color = '#ffa500'
	decayRate = 1.55
	showMatrix = false
	flickeringFlame = false
	flameEdgeLeft = this.flamePosX
	flameEdgeRight = this.flamePosX + this.flameWidth
	middleOfFlame = this.flamePosX + Math.floor(this.flameWidth / 2)

	constructor(options) {
		options = options ?? {}

		for (let key of Object.keys(options)) {
			this[key] = options[key]
		}

		this.flameEdgeLeft = this.flamePosX
		this.flameEdgeRight = this.flamePosX + this.flameWidth
		this.middleOfFlame = this.flamePosX + Math.floor(this.flameWidth / 2)

		const gradientStepsAmount = Math.floor(this.flameHeight / this.pxSize)
		this.colorGradient = this.genGradient(this.color, gradientStepsAmount)
		console.log(this)
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

	constructor(options) {
		const { pxSize, rowIndex, colIndex } = options

		Object.assign(this, options)

		this.width = pxSize
		this.height = pxSize
		this.currentRow = rowIndex + 1
		this.currentCol = colIndex + 1
		this.colorIndex = this.colorGradient.length - 1
		this.currentColor = this.colorGradient[this.colorIndex]
	}

	updateColor(matrix) {
		// 1/3 chance for the pixel to update
		// to make flame grow slower and create sparks
		const shouldUpdate = Math.random() < 1 / 3

		if (!this.flickeringFlame && !shouldUpdate) {
			return
		}

		const last = this.colorGradient.length - 1
		const flameOffsetForWindOverReach = (this.flameWidth / 4) * this.windSpeed

		// right check - if (this.currentCol > this.colsAmount - flameOffsetForWindOverReach)
		// left check - if (this.currentCol < flameOffsetForWindOverReach)
		if (this.currentCol > this.colsAmount - flameOffsetForWindOverReach) {
			// Offset on side of matrix: black if no wind, otherwise continuation of flame
			this.colorIndex = this.windSpeed ? Math.min(this.grabColorIndexFromBelow(matrix), last) : last
		} else if (this.currentRow === 1) {
			// First row (bottom): slight flicker at the source
			this.colorIndex = Math.floor(Math.random() * 3)
		} else {
			// Wind effect (applies windSpeed prop)
			this.colorIndex = Math.min(this.grabColorIndexFromBelow(matrix), last)
		}

		this.currentColor = this.colorGradient[this.colorIndex]
	}

	grabColorIndexFromBelow(matrix) {
		const last = this.colorGradient.length - 1
		const offsetRange = Math.random() < 1 / 3 ? 3 : Math.max(1, 3 - this.windSpeed)

		const decay = Math.floor(Math.random() * this.decayRate)
		const offset = Math.floor(Math.random() * offsetRange) - 1
		const below = matrix[this.currentRow - 2]?.[this.currentCol - 1 + offset]

		return (below?.colorIndex ?? last) + decay
	}
}

function runGameLoop(canvas, getMatrix, getFlameOptions) {
	const ctx = canvas.getContext('2d')
	let lastTime = 0
	let lastFill = null

	function frame(timestamp) {
		window.gameLoopId = requestAnimationFrame(frame)

		const flameOptions = getFlameOptions()
		const fps = flameOptions.fps || 0
		const interval = fps ? 1000 / fps : 0

		// Throttle frames
		const delta = timestamp - lastTime
		if (delta < interval) return
		lastTime = interval ? timestamp - (delta % interval) : timestamp

		const matrix = getMatrix()
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		if (flameOptions.showMatrix) {
			ctx.strokeStyle = '#ffffff'
			ctx.lineWidth = 0.2
		}

		for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
			const row = matrix[rowIndex]
			for (let colIndex = 0; colIndex < row.length; colIndex++) {
				const px = row[colIndex]

				// Update px color
				px.updateColor(matrix)

				if (px.currentColor !== lastFill) {
					ctx.fillStyle = px.currentColor
					lastFill = px.currentColor
				}
				ctx.fillRect(px.posX, px.posY, px.width, px.height)

				// border
				if (flameOptions.showMatrix) {
					ctx.strokeRect(px.posX + 0.5, px.posY + 0.5, px.width - 1, px.height - 1)
				}
			}
		}
	}

	window.gameLoopId = requestAnimationFrame(frame)
}

function stopGameLoop() {
	if (window.gameLoopId) {
		cancelAnimationFrame(window.gameLoopId)
		window.gameLoopId = null
	}
}

function genMatrix(flameOptions) {
	const matrix = []
	const { pxSize, flamePosX, flamePosY, flameWidth, flameHeight } = flameOptions
	const canvas = document.querySelector('canvas')
	const colsAmount = Math.floor(flameWidth)
	const rowsAmount = Math.floor(flameHeight)

	for (let rowIndex = 0; rowIndex < rowsAmount; rowIndex++) {
		const row = []
		for (let colIndex = 0; colIndex < colsAmount; colIndex++) {
			const posX = pxSize * colIndex + flamePosX
			const posY = pxSize * rowIndex + flamePosY
			flameOptions.posX = posX
			flameOptions.posY = posY
			flameOptions.rowIndex = rowIndex
			flameOptions.colIndex = colIndex
			flameOptions.rowsAmount = rowsAmount
			flameOptions.colsAmount = colsAmount
			const pixel = new Pixel(flameOptions)

			row.push(pixel)
		}
		matrix.push(row)
	}
	console.log(matrix)
	return matrix
}

function initCanvas(matrix, flameOptions) {
	console.log('starting loop')

	stopGameLoop()

	const canvas = document.getElementById('c')
	const ctx = canvas.getContext('2d')
	ctx.imageSmoothingEnabled = false

	runGameLoop(
		canvas,
		() => matrix,
		() => flameOptions
	)
}

export { Flame, Pixel, genMatrix, initCanvas, runGameLoop, stopGameLoop }
