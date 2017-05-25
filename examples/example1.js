var stage;
var canvas;
var context;
function onload() {
  canvas = document.getElementById('stage');
  context = canvas.getContext('2d');
  stage = new createElement({
    canvas,
    images: ['smiley.png'],
    callback: callback
  });
}

function callback() {
  // start development
  var div_1 = stage.createElement('div');
  var div_2 = stage.createElement('div');
  var div_3 = stage.createElement('div');
  stage.body.appendChild(div_1);
  stage.body.appendChild(div_2);
  stage.body.appendChild(div_3);
  div_1.css({
    'background-color': '#FFFF00',
    'left': '10px',
    'top': '10px',
    'width': '300px',
    'height': '100px',
    'z-index': 4,
    'font': '18px Arial, sans-serif',
    'text-align': 'left',
    'vertical-align': 'middle',
    'text-decoration': 'underline',
    'color': '#000000',
    'text-decoration-color': 'blue'
  });
  div_1.innerHTML = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';

  div_2.css({
    'background-color': '#000000',
    'left': '110px',
    'top': '110px',
    'width': '100px',
    'height': '100px',
    'z-index': 2
  });
  div_3.css({
    'background-color': '#FF0000',
    'left': '210px',
    'top': '210px',
    'width': '100px',
    'height': '100px',
    'opacity': 1,
    'z-index': 3,
    'background-image': 'smiley.png',
    'background-size': '100% 100%',
    'background-position': '0px 0px',
    'background-repeat': 'no-repeat',
    'transform': 'scale(0.5,0.5) rotate(0deg)',
    'transform-origin': '260px 260px'
  });
  div_1.addEventListener('mousedown', function (e) {
    console.log('div 1 clicked');
  });
  div_2.addEventListener('click', function (e) {
    console.log('div 2 clicked');
  });
  stage.draw();
  // console.log(div_1);
}