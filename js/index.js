document.fonts.ready.then(start)

function toggleTheme() {
  const html = document.getElementsByTagName('html')[0]
  html.classList.toggle('dark')
}

function remixForm() {
  initializeCanvas(decomposeHash(window.location.hash))
}

function randomizeForm() {
  function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const strings = [
    'INDETERMINACY',
    'ORDER', 'STRUCTURE', 'SEQUENCE', 'METHOD', 'SYSTEM',
    'CHAOS', 'DISARRAY', 'DISORDER', 'HAVOC', 'ENTROPY',
    '••••••••••', '++++++++++', '$$$$$$$$$$', '          ',
  ]

  const textInputs = document.getElementsByName('text')
  textInputs[0].value = strings[getRandomInt(0, strings.length - 1)]

  const rangeInputs = document.querySelectorAll('input[type="range"]')
  rangeInputs.forEach(input => {
    const { min, max, step } = input
    input.value = Math.ceil(getRandomInt(min, max) / step) * step
  })

  const radioInputs = document.getElementsByName('textStyle')
  radioInputs[getRandomInt(0, radioInputs.length - 1)].checked = true

  const checkboxInputs = document.querySelectorAll('input[type="checkbox"]')
  checkboxInputs.forEach(input => {
    input.checked = !!getRandomInt(0, 1)
  })

  // juicy
  window.location.hash = composeHash(getFormAsObject(document.forms[0]))
}

function getFormAsObject (form) {
  let object = {}
  formData = new FormData(form)
  const formDataItems = [ ...formData.entries() ]
  for (var key of formData.keys()) {
    object[key] = formData.get(key)
  }
  return object
}

function composeHash (object) {
  return Object.keys(object).map(
    // k => `${encodeURIComponent(k)}=${encodeURIComponent(object[k])}`
    // dangerous, but looks better in url
    k => `${k}=${(object[k])}`
  ).join('&')
}

function decomposeHash (string) {
  const object = {}
  string.slice(1).split('&').forEach(pair => {
    const [key, value] = pair.split('=')
    object[key] = decodeURIComponent(value)
  })
  return object
}

// this is getting off-track
// function setFormFromHash (form, hash) {
//   const config = decomposeHash(hash)
//   Object.keys(config).forEach(key => {
//     switch (key) {
//       case 'text':
//       case 'displacement':
//       case 'rotation':
//       case 'fontSize':
//         const inputs = document.getElementsByName(key)
//         inputs[0].value = config[key]
//         break;
//       case 'textStyle':
//         const radioInputs = document.getElementsByName(key)
//         radioInputs.forEach(input => { input.checked = input.value === config[key] })
//         break;
//       case 'showBoxes':
//       case 'negative':
//         const checboxInputs = document.getElementsByName(key)
//         checboxInputs[0].checked = config[key] === 'true' || config[key] === 'on'
//         break;
//     }
//   })
// }


function start () {
  const form = document.forms[0]
  window.onhashchange = () => { initializeCanvas(decomposeHash(window.location.hash)) }
  randomizeForm()

  // wtf is even going on here
  // if(window.location.hash) {
  //   setFormFromHash(form, window.location.hash)
  //   initializeCanvas(decomposeHash(window.location.hash))
  // } else {
  //   randomizeForm()
  // }

  const inputs = [
    ...form.querySelectorAll('input'),
    ...form.querySelectorAll('select'),
  ]

  inputs.forEach(input => {
    input.addEventListener('input', (event) => {
      const {
        currentTarget,
        currentTarget: {
          name,
        }
      } = event

      const value = currentTarget.type === 'checkbox'
        ? currentTarget.checked
        : currentTarget.value

      config = decomposeHash(window.location.hash)
      config[name] = value
      window.location.hash = composeHash(config)
    })
  })
}

function initializeCanvas (config) {
  const [ canvasWidth, canvasHeight ] = config.ratio.split(':') // this shouldn't be duplicated
  const canvas = document.querySelector('canvas')
  const context = canvas.getContext('2d')
  const context2 = new window.C2S(canvasWidth, canvasHeight);
  //const dpr = window.devicePixelRatio || 1

  renderCanvas(canvas, context, context2, config)

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

  // document
  //   .querySelector('a[name="print-canvas"]')
  //   .addEventListener('click', (e) => {
  //     // console.log('hi');
  //     var win=window.open('', '', 'width=' + canvasWidth + ',height=' + canvasHeight);
  //     win.document.write("<br><img src='"+canvas.toDataURL()+"'/>");
  //     win.print();
  //     win.location.reload();
  //   })
}

function renderCanvas (canvas, ctx, ctx2, config) {
  const {
    displacement,
    fontSize,
    negative,
    ratio,
    rotation,
    showBoxes,
    text,
    textStyle,
  } = config
  // something like this to clean up url hash
  // const {
  //   d: displacement,
  //   f: fontSize,
  //   n: negative,
  //   o: ratio,
  //   r: rotation,
  //   b: showBoxes,
  //   t: text,
  //   s: textStyle,
  // } = config
  const [ canvasWidth, canvasHeight ] = ratio.split(':')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  let foregroundColor = (negative === 'true' || negative === 'on') ? 'white' : 'black'
  let backgroundColor = (negative === 'true' || negative === 'on') ? 'black' : 'white'
  const offset = canvas.width / 20 // maintains ratio

  function preDraw(ctx) {
    //ctx.scale(dpr, dpr)
    ctx.fillStyle = backgroundColor
    ctx.clearRect(0, 0, canvas.width, canvas.height) // clears everything away (useful for svg)
    ctx.fillRect(0, 0, canvas.width, canvas.height) // adds background color
  }

  preDraw(ctx)
  preDraw(ctx2)

  const squaresAcross = text.length
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
        ;(showBoxes === 'true' || showBoxes === 'on') && ctx.stroke()
        // showBoxes && ctx.stroke()
        ctx.font = `${squareSize * (fontSize / 100)}px 'Space Mono'`
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx[`${textStyle}Text`](text[i], 0, 0)
        ctx.restore()
      }

      draw(ctx)
      draw(ctx2)
    }
  }
}
