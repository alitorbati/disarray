const form = document.forms[0]
const config = {}
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

function setConfigValue (input) {
  if (input.type === 'checkbox') { value = input.checked }
  else if (input.type === 'text') { value = input.value }
  else if (input.checked) { value = input.value }
  config[input.name] = value
}

function initConfig () {
  const inputs = form.querySelectorAll('input')
  inputs.forEach(input => { setConfigValue(input) })
  document.querySelector('button').addEventListener('click', (_) => {
    renderCanvas(canvas, ctx, config)
  })
  renderCanvas(canvas, ctx, config)
}

initConfig()

const inputs = form.querySelectorAll('input')
inputs.forEach(input => {
  input.addEventListener('input', (e) => {
    setConfigValue(e.target)
    renderCanvas(canvas, ctx, config)
  })
})

function renderCanvas (canvas, ctx, config) {
  var dpr = window.devicePixelRatio || 1

  const {
    stringToPrint,
    showBoxes,
    fontMultiplier,
    fontName,
    textStyle,
    displacement,
    rotation,
    negative,
  } = config

  const canvasWidth = 480
  const canvasHeight = 720
  const offset = canvasWidth / 20 // maintains ratio
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  negative ? canvas.classList.add('negative') : canvas.classList.remove('negative')
  // ctx.scale(dpr, dpr)
  ctx.scale(dpr, dpr)

  const squaresAcross = stringToPrint.length
  const squareSize = ((canvasWidth / dpr) - (offset * 2)) / squaresAcross
  const squaresDown = Math.floor((canvasHeight - (offset * 2))/ squareSize)

  for(var i = 0; i < squaresAcross; i++) {
    for(var j = 0; j < squaresDown; j++) {
      let plusOrMinus = Math.random() < 0.5 ? -1 : 1
      const rotateAmt = j * Math.PI / 180 * plusOrMinus * Math.random() * rotation

      plusOrMinus = Math.random() < 0.5 ? -1 : 1
      const horizontalPlacement = i * squareSize
      const verticalPlacement = j * squareSize
      const translateAmt = j / squareSize * plusOrMinus * Math.random() * displacement

      ctx.save()
      ctx.translate(
        horizontalPlacement + translateAmt + (squareSize / 2) + offset,
        verticalPlacement + (squareSize / 2) + offset
      )
      ctx.rotate(rotateAmt)
      // draw
      ctx.beginPath()
      ctx.rect(-squareSize/2, -squareSize/2, squareSize, squareSize)
      ctx.fillStyle = (negative ? 'white' : 'black')
      ctx.strokeStyle = (negative ? 'white' : 'black')
      showBoxes && ctx.stroke()
      ctx.font = `${squareSize * fontMultiplier}px ${fontName || 'Courier'}`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx[`${textStyle}Text`](stringToPrint[i], 0, 0)
      ctx.restore()
    }
  }
}
