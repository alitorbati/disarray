var form = document.forms[0]

var config = {
  // stringToPrint: 'disarray',
  stringToPrint: '',
  showBoxes: false,
  fontMultiplier: 1,
  fontName: 'Space Mono',
  textStyle: 'stroke', // or 'stroke' or 'fill'
}

// doEverything(config);

var input = form.querySelector('input[name="stringToPrint"]')
input.addEventListener('keyup', (e) => {
  config.stringToPrint = e.target.value,
  doEverything(config);
})

var select = form.querySelector('select[name="textStyle"]')
select.addEventListener('change', (e) => {
  console.log(e.target.value)
  config.textStyle = e.target.value,
  doEverything(config);
})

function doEverything (config) {
  var canvas = document.querySelector('canvas');
  var context = canvas.getContext('2d');
  var dpr = window.devicePixelRatio;

  const {
    stringToPrint,
    showBoxes,
    fontMultiplier,
    fontName,
    textStyle,
  } = config

  const canvasWidth = 240 * dpr * 2;
  const canvasHeight = 360 * dpr * 2;
  const offset = canvasWidth / 20;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.scale(dpr, dpr);

  var randomDisplacement = 15;
  var rotateMultiplier = 10;

  var squaresAcross = stringToPrint.length
  var squaresDown = 5
  var squareSize = (canvasWidth - offset * 2) / squaresAcross;
  var squaresDown = Math.floor((canvasHeight - (offset * 2))/ squareSize)

  function draw (width, height, letter = '') {
    context.beginPath();
    context.rect(-width/2, -height/2, width, height);
    showBoxes && context.stroke();
    context.font = `${squareSize * fontMultiplier}px ${fontName || 'Courier'}`;
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context[`${textStyle}Text`](letter, 0, 0);
  }

  let overall = 0
  for(var i = 0; i < squaresAcross; i++) {
    for(var j = 0; j < squaresDown; j++) {
      var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      var rotateAmt = j * Math.PI / 180 * plusOrMinus * Math.random() * rotateMultiplier;

      plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      var horizontalPlacement = i * squareSize;
      var verticalPlacement = j * squareSize;
      var translateAmt = j / squareSize * plusOrMinus * Math.random() * randomDisplacement;

      context.save();
      context.translate(
        horizontalPlacement + translateAmt + (squareSize / 2) + offset,
        verticalPlacement + (squareSize / 2) + offset
      );
      context.rotate(rotateAmt);
      draw(squareSize, squareSize, stringToPrint[i].toUpperCase());
      context.restore();
      overall++
    }
  }

}
