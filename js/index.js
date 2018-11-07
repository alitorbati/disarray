const canvasWidth = 480
const canvasHeight = 720

document.fonts.ready.then(initialize)


function serializeForm (form) {
  let config = {}
  formData = new FormData(form)
  const formDataItems = [...formData.entries()]
  for (var key of formData.keys()) {
    config[key] = formData.get(key)
  }
  return config
}

function initialize () {
  let config = {}
  const form = document.forms[0]
  const canvas = document.querySelector('canvas')
  const context = canvas.getContext('2d')
  const context2 = new window.C2S(canvasWidth, canvasHeight);
  const dpr = window.devicePixelRatio || 1

  config = serializeForm(form)
  renderCanvas(canvas, context, context2, config, dpr)

  // eventListeners
  form
    .querySelectorAll('input')
    .forEach(input => {
      input.addEventListener('input', (_) => {
        config = serializeForm(form)
        renderCanvas(canvas, context, context2, config, dpr)
      })
    })

  document
    .querySelector('button[name="chaos"]')
    .addEventListener('click', (_) => {
      renderCanvas(canvas, context, context2, config, dpr)
    })

  document
    .querySelector('a[name="download-vector"]')
    .addEventListener('click', (e) => {
      e.currentTarget.download = 'disarray.svg';
      // renderCanvas(canvas, context, config, dpr, true)
      let source = context2.getSerializedSvg(true)
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source
      const url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source)
      // document.querySelector('a[name="download-vector"]').href = url;
      e.currentTarget.href = url
    })

  document
    .querySelector('a[name="download-raster"]')
    .addEventListener('click', (e) => {
      e.currentTarget.download = 'disarray.png';
      e.currentTarget.href = canvas.toDataURL('image/png')
    })
}

function renderCanvas (canvas, ctx, ctx2, config, dpr, renderSvg) {
  const {
    displacement,
    fontMultiplier,
    negative,
    rotation,
    showBoxes,
    stringToPrint,
    textStyle,
  } = config

  let foregroundColor = negative ? 'white' : 'black'
  let backgroundColor = negative ? 'black' : 'white'
  // const canvasWidth = 480
  // const canvasHeight = 720
  const offset = canvasWidth / 20 // maintains ratio


  canvas.width = canvasWidth
  canvas.height = canvasHeight

  function preDraw(ctx) {
    ctx.scale(dpr, dpr)
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  preDraw(ctx)
  preDraw(ctx2)

  const squaresAcross = stringToPrint.length
  const squareSize = ((canvasWidth / dpr) - (offset * 2)) / squaresAcross
  const squaresDown = Math.floor(((canvasHeight / dpr) - (offset * 2)) / squareSize)

  for(var i = 0; i < squaresAcross; i++) {
    for(var j = 0; j < squaresDown; j++) {
      let plusOrMinus = Math.random() < 0.5 ? -1 : 1
      const rotateAmt = j * Math.PI / 180 * plusOrMinus * Math.random() * rotation

      plusOrMinus = Math.random() < 0.5 ? -1 : 1
      const horizontalPlacement = i * squareSize
      const verticalPlacement = j * squareSize
      const translateAmt = j / squareSize * plusOrMinus * Math.random() * (displacement * 10)

      function draw(ctx) {
        ctx.save()
        ctx.translate(
          horizontalPlacement + translateAmt + (squareSize / 2) + offset,
          verticalPlacement + (squareSize / 2) + offset
        )
        ctx.rotate(rotateAmt)
        ctx.beginPath()
        ctx.rect(-squareSize/2, -squareSize/2, squareSize, squareSize)

        ctx.fillStyle = foregroundColor
        ctx.strokeStyle = foregroundColor
        showBoxes && ctx.stroke()
        ctx.font = `${squareSize * (fontMultiplier / 100)}px 'Space Mono'`
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx[`${textStyle}Text`](stringToPrint[i], 0, 0)
        ctx.restore()
      }

      draw(ctx)
      draw(ctx2)

      if (renderSvg) {
        let source = ctx2.getSerializedSvg(true)
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source
        const url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source)
        document.querySelector('a[name="download-vector"]').href = url;
      }
    }
  }
}
