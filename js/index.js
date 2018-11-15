document.fonts.ready.then(initialize)

function serializeForm (form) {
  let config = {}
  formData = new FormData(form)
  const formDataItems = [...formData.entries()]
  // debugger
  for (var key of formData.keys()) {
    config[key] = formData.get(key)
  }
  console.log(config)
  // console.log(
  //   Object.keys(config).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(config[k])}`).join('&')
  // )
  return config
}

function initialize () {
  const form = document.forms[0]
  let config = serializeForm(form)
  const [ canvasWidth, canvasHeight ] = config.ratio.split(':') // this shouldn't be duplicated
  const canvas = document.querySelector('canvas')
  const context = canvas.getContext('2d')
  const context2 = new window.C2S(canvasWidth, canvasHeight);
  //const dpr = window.devicePixelRatio || 1

  renderCanvas(canvas, context, context2, config)

  // eventListeners
  form
    .querySelectorAll('input')
    .forEach(input => {
      input.addEventListener('input', (_) => {
        config = serializeForm(form)
        renderCanvas(canvas, context, context2, config)
      })
    })

  form
    .querySelectorAll('select')
    .forEach(input => {
      input.addEventListener('input', (_) => {
        config = serializeForm(form)
        renderCanvas(canvas, context, context2, config)
      })
    })

  form
    .querySelector('button[name="chaos"]')
    .addEventListener('click', (_) => {
      renderCanvas(canvas, context, context2, config)
    })

  document
    .querySelector('a[name="download-vector"]')
    .addEventListener('click', (e) => {
      e.currentTarget.download = 'disarray.svg';
      let source = context2.getSerializedSvg(true)
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source
      const url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source)
      e.currentTarget.href = url
    })

  document
    .querySelector('a[name="download-raster"]')
    .addEventListener('click', (e) => {
      e.currentTarget.download = 'disarray.png';
      e.currentTarget.href = canvas.toDataURL('image/png')
    })

  document
    .querySelector('a[name="print-canvas"]')
    .addEventListener('click', (e) => {
      console.log('hi');
      var win=window.open();
      win.document.write("<br><img src='"+canvas.toDataURL()+"'/>");
      win.print();
      win.location.reload();
    })
}

function renderCanvas (canvas, ctx, ctx2, config) {
  const {
    ratio,
    displacement,
    fontMultiplier,
    negative,
    rotation,
    showBoxes,
    stringToPrint,
    textStyle,
  } = config
  const [ canvasWidth, canvasHeight ] = ratio.split(':')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  let foregroundColor = negative ? 'white' : 'black'
  let backgroundColor = negative ? 'black' : 'white'
  const offset = canvas.width / 20 // maintains ratio

  function preDraw(ctx) {
    //ctx.scale(dpr, dpr)
    ctx.fillStyle = backgroundColor
    ctx.clearRect(0, 0, canvas.width, canvas.height) // clears everything away (useful for svg)
    ctx.fillRect(0, 0, canvas.width, canvas.height) // adds background color
  }

  preDraw(ctx)
  preDraw(ctx2)

  const squaresAcross = stringToPrint.length
  const squareSize = (canvas.width - (offset * 2)) / squaresAcross
  const squaresDown = Math.floor((canvas.height - (offset * 2)) / squareSize)

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
    }
  }
}
