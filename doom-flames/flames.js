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

	constructor(flameOptions) {
		const { posX, posY, pxSize, rowIndex, colIndex, rowsAmount, colsAmount, color } = flameOptions
		const gradientStepsAmount = rowsAmount

		this.posX = posX
		this.posY = posY
		this.width = pxSize
		this.height = pxSize
		this.currentRow = rowIndex + 1
		this.currentCol = colIndex + 1
		this.color = color
		this.colorGradient = this.genGradient(color, gradientStepsAmount)
		this.colorIndex = this.colorGradient.length - 1
		this.currentColor = this.colorGradient[this.colorIndex]
	}

	updateColor(matrix) {
		const last = this.colorGradient.length - 1
		const topOfFlamesArea = this.rowsAmount - this.rowsAmount / 4
		const shouldUpddate = Math.floor(Math.random() * 3) - 1

		// 1/3 chance for the pixel to update
		// to make flame grow slower and create sparks
		if (shouldUpddate !== 0) {
			return
		}

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

			// if (true) {
			// 	//..
			// }
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

class Spark {
	constructor(posX, posY, size, color) {
		this.posX = posX
		this.posY = posY
		this.size = size / 2
		this.color = color
		this.speedY = size * (0.5 + Math.random()) // upward (increasing posY)
		this.speedX = (Math.random() - 0.5) * size // sideways drift
		this.maxLife = 8 + Math.floor(Math.random() * 8) // in frames
		this.life = this.maxLife
	}

	update() {
		this.posX += this.speedX
		this.posY += this.speedY
		this.life--
	}
}

function genMatrix(matrixOptions) {
	const matrix = []
	const { pxSize, rowsAmount, colsAmount, startPos, color } = matrixOptions
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

function gameLoop(timestamp, canvas, matrix, flameOptions = { fps: 10 }) {
	window.gameLoopId = requestAnimationFrame((time) => {
		gameLoop(time, canvas, matrix, flameOptions)
	})

	// Throttle frames
	const { fps } = flameOptions
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

	// const sparkMin = 6 // hottest colour index that can emit a spark
	// const sparkMax = 16 // coolest colour index that can emit a spark
	// const sparkChance = 0.03

	// // Spawn at flame tips
	// matrix.forEach((row, rowIndex) => {
	// 	row.forEach((px) => {
	// 		const above = matrix[rowIndex + 1]?.[px.currentCol - 1]
	// 		const isTip = above && above.colorIndex > sparkMax
	// 		const inBand = px.colorIndex >= sparkMin && px.colorIndex <= sparkMax

	// 		if (isTip && inBand && Math.random() < sparkChance) {
	// 			sparks.push(new Spark(px.posX, px.posY, px.width, px.currentColor))
	// 		}
	// 	})
	// })

	// // Update, draw and remove expired sparks
	// for (let i = sparks.length - 1; i >= 0; i--) {
	// 	const spark = sparks[i]
	// 	spark.update()

	// 	if (spark.life <= 0 || spark.posY > canvas.height) {
	// 		sparks.splice(i, 1)
	// 		continue
	// 	}

	// 	ctx.globalAlpha = spark.life / spark.maxLife
	// 	ctx.fillStyle = spark.color // '#ffffff'
	// 	ctx.fillRect(Math.round(spark.posX), Math.round(spark.posY) + 100, flameOptions.pxSize, flameOptions.pxSize)
	// }
	// ctx.globalAlpha = 1
}

function initCanvas(matrix, flameOptions) {
	console.log('starting loop')

	if (window.gameLoopId) {
		cancelAnimationFrame(window.gameLoopId)
		window.gameLoopId = null
	}

	const canvas = document.getElementById('c')
	const ctx = canvas.getContext('2d')
	ctx.imageSmoothingEnabled = false

	gameLoop(null, canvas, matrix, flameOptions)
}

const sparks = []
const flameOptions = {
	pxSize: 4,
	rowsAmount: 100,
	colsAmount: 200,
	startPos: 100,
	fps: 60,
	wind: 0,
	color: '#ffa500'
}
const matrix = genMatrix(flameOptions) // Light fire
initCanvas(matrix, flameOptions) // Burn
