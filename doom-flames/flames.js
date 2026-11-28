class Flame {
	pxSize = 4
	flamePosX = 50
	flamePosY = 0
	flameHeight = 100
	flameWidth = 230
	fps = 0
	windSpeed = 0
	color = '#ffa500'
	decayRate = 2.15
	showMatrix = false
	flickeringFlame = false
	flameEdgeLeft = this.flamePosX
	flameEdgeRight = this.flamePosX + this.flameWidth
	middleOfFlame = this.flamePosX + Math.floor(this.flameWidth / 2)
	taperSides = true

	constructor(options) {
		options = options ?? {}

		for (let key of Object.keys(options)) {
			this[key] = options[key]
		}

		this.flameEdgeLeft = this.flamePosX
		this.flameEdgeRight = this.flamePosX + this.flameWidth
		this.middleOfFlame = this.flamePosX + Math.floor(this.flameWidth / 2)

		this.initNewGradient()
		console.log(this)
	}

	set(key, val) {
		this[key] = val

		if (['flameHeight', 'decayRate', 'color'].includes(key)) {
			this.initNewGradient()
		}

		console.log(key, val)
	}

	initNewGradient() {
		const gradientStepsAmount = Math.floor(this.decayRate * (this.flameHeight / this.decayRate / this.decayRate))
		this.colorGradient = this.genGradient(this.color, gradientStepsAmount)
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

		if (this.taperSides) {
			this.colorIndex = this.taperFlameEdgePixels()
		}

		this.currentColor = this.colorGradient[this.colorIndex]
	}

	grabColorIndexFromBelow(matrix) {
		const last = this.colorGradient.length - 1
		const onInThreeChanceHit = Math.random() < 1 / 3
		const offsetRange = onInThreeChanceHit ? 3 : Math.max(0, 3 - this.windSpeed)

		const decay = Math.floor(Math.random() * this.decayRate)
		const offset = Math.floor(Math.random() * offsetRange) - 1
		const below = matrix[this.currentRow - 2]?.[this.currentCol - 1 + offset]

		return (below?.colorIndex ?? last) + decay
	}

	taperFlameEdgePixels(edgeWidth = 12) {
		const last = this.colorGradient.length - 1
		const iterations = 4
		let flameEdge = edgeWidth
		let randomness = 3
		let colorIndex = this.colorIndex

		for (let i = 0; i < iterations; i++) {
			flameEdge = i ? flameEdge * 2 : flameEdge
			randomness = i ? randomness / 2 : randomness

			if (this.currentCol < this.flameWidth / flameEdge && Math.random() < 1 / randomness) {
				colorIndex = Math.min(this.colorIndex + 1, last)
			}
			if (this.currentCol > this.flameWidth - this.flameWidth / flameEdge && Math.random() < 1 / randomness) {
				colorIndex = Math.min(this.colorIndex + 1, last)
			}
		}

		return colorIndex
	}
}

function runGameLoop(canvas, getMatrix, getFlameOptions) {
	const ctx = canvas.getContext('2d')
	ctx.imageSmoothingEnabled = false

	const offscreen = document.createElement('canvas')
	const offscreenCtx = offscreen.getContext('2d')

	// Used only to convert any CSS color string to RGBA
	const colorCtx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
	colorCtx.canvas.width = 1
	colorCtx.canvas.height = 1
	const colorCache = new Map()

	let lastTime = 0
	let imageData = null
	let buffer32 = null
	let rowsAmount = 0
	let colsAmount = 0
	let originX = 0
	let originY = 0

	function toUint32(color) {
		let value = colorCache.get(color)
		if (value === undefined) {
			colorCtx.clearRect(0, 0, 1, 1)
			colorCtx.fillStyle = color
			colorCtx.fillRect(0, 0, 1, 1)
			const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data
			// Little-endian ABGR
			value = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0
			colorCache.set(color, value)
		}
		return value
	}

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

		// (Re)create the buffer if the matrix size changed
		if (matrix.length !== rowsAmount || matrix[0].length !== colsAmount) {
			rowsAmount = matrix.length
			colsAmount = matrix[0].length
			offscreen.width = colsAmount
			offscreen.height = rowsAmount
			imageData = offscreenCtx.createImageData(colsAmount, rowsAmount)
			buffer32 = new Uint32Array(imageData.data.buffer)

			// Top-left corner of the grid on the canvas
			originX = Infinity
			originY = Infinity
			for (const row of matrix) {
				for (const px of row) {
					originX = Math.min(originX, px.posX)
					originY = Math.min(originY, px.posY)
				}
			}
		}

		for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
			const row = matrix[rowIndex]
			for (let colIndex = 0; colIndex < row.length; colIndex++) {
				const px = row[colIndex]

				// Update px color
				px.updateColor(matrix)

				// One buffer pixel per matrix pixel
				const x = Math.round((px.posX - originX) / px.width)
				const y = Math.round((px.posY - originY) / px.height)
				buffer32[y * colsAmount + x] = toUint32(px.currentColor)
			}
		}

		offscreenCtx.putImageData(imageData, 0, 0)

		const first = matrix[0][0]
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.drawImage(offscreen, originX, originY, colsAmount * first.width, rowsAmount * first.height)

		// border
		if (flameOptions.showMatrix) {
			ctx.strokeStyle = '#ffffff'
			ctx.lineWidth = 0.2
			for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
				const row = matrix[rowIndex]
				for (let colIndex = 0; colIndex < row.length; colIndex++) {
					const px = row[colIndex]
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
	// console.log(matrix)
	return matrix
}

function initCanvas(matrix, flameOptions) {
	// console.log('starting loop')

	stopGameLoop()

	const canvas = document.getElementById('c')
	const ctx = canvas.getContext('2d')
	ctx.imageSmoothingEnabled = false

	runGameLoop(
		canvas,
		() => matrix,
		() => flameOptions
	)

	return canvas
}

export { Flame, Pixel, genMatrix, initCanvas, runGameLoop, stopGameLoop }
