var form = document.forms[0]
var config = {}
var canvas = document.querySelector('canvas')
var context = canvas.getContext('2d')

function setConfigValue (input) {
  if (input.type === 'checkbox') { value = input.checked }
  else if (input.type === 'text') { value = input.value }
  else if (input.checked) { value = input.value }
  config[input.name] = value
}

function initConfig () {
  var inputs = form.querySelectorAll('input')
  inputs.forEach(input => { setConfigValue(input) })
  renderCanvas(canvas, context, config)
}

initConfig()

var inputs = form.querySelectorAll('input')
inputs.forEach(input => {
  input.addEventListener('input', (e) => {
    setConfigValue(e.target)
    renderCanvas(canvas, context, config)
  })
})

function renderCanvas (canvas, context, config) {
  // var dpr = window.devicePixelRatio
  var dpr = 1 // work on this

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

  const canvasWidth = 240 * dpr * 2
  const canvasHeight = 360 * dpr * 2
  const offset = canvasWidth / 20 // maintains ratio
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  negative ? canvas.classList.add('negative') : canvas.classList.remove('negative')
  context.scale(dpr, dpr)

  var squaresAcross = stringToPrint.length
  var squaresDown = 5
  var squareSize = (canvasWidth - offset * 2) / squaresAcross
  var squaresDown = Math.floor((canvasHeight - (offset * 2))/ squareSize)

  for(var i = 0; i < squaresAcross; i++) {
    for(var j = 0; j < squaresDown; j++) {
      var plusOrMinus = Math.random() < 0.5 ? -1 : 1
      var rotateAmt = j * Math.PI / 180 * plusOrMinus * Math.random() * rotation

      plusOrMinus = Math.random() < 0.5 ? -1 : 1
      var horizontalPlacement = i * squareSize
      var verticalPlacement = j * squareSize
      var translateAmt = j / squareSize * plusOrMinus * Math.random() * displacement

      context.save()
      context.translate(
        horizontalPlacement + translateAmt + (squareSize / 2) + offset,
        verticalPlacement + (squareSize / 2) + offset
      )
      context.rotate(rotateAmt)
      // draw
      context.beginPath()
      context.rect(-squareSize/2, -squareSize/2, squareSize, squareSize)
      context.fillStyle = (negative ? 'white' : 'black')
      context.strokeStyle = (negative ? 'white' : 'black')
      showBoxes && context.stroke()
      context.font = `${squareSize * fontMultiplier}px ${fontName || 'Courier'}`
      context.textBaseline = 'middle'
      context.textAlign = 'center'
      context[`${textStyle}Text`](stringToPrint[i], 0, 0)
      context.restore()
    }
  }
}
