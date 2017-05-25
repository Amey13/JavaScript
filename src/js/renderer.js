function Renderer() {
  var canvas;
  var context;
  var images;
  this.setData = function (_obj) {
    Object.keys(_obj).forEach((i) => {
      switch (i) {
        case 'canvas':
          canvas = _obj[i];
          context = canvas.getContext('2d');
          break;
        case 'images':
          images = _obj[i];
          break;
        default:
          break;
      }
    });

    // canvas = _canvas;
    // context = canvas.getContext('2d');
  };
  this.background = function (_elements, _zindexArr) {
    var elements = _elements;
    var element;
    var i = 0;
    var style;
    var x;
    var y;
    var w;
    var h;
    var imgName;
    var img;
    var bg = {};
    for (i = 0; i < _zindexArr.length; i += 1) {
      context.save();
      element = _elements[_zindexArr[i]];
      style = element.style;
      if (style.display === 'block') {
        x = parseInt(style.left, 10);
        y = parseInt(style.top, 10);
        w = parseInt(style.width, 10);
        h = parseInt(style.height, 10);

        if (style.left === '') {
          x = 0;
        }
        if (style.top === '') {
          y = 0;
        }
        if (style.width === '') {
          w = 0;
        }
        if (style.height === '') {
          h = 0;
        }
        if (w > 0 && h > 0) {
          if (typeof style.opacity === 'number') {
            context.globalAlpha = style.opacity;
          }
          // transform
          if (style.transform.trim() !== '') {
            var transformArr = style.transform.trim().split(' ');
            var transformStr = style.transform.trim();
            var translateArr = [];
            var rotateDeg;
            var scaleArr = [];
            var tempArr = [];
            var originArr = [];

            transformArr.forEach(function (m, k) {
              if (m.indexOf('translate(') !== (-1)) {
                tempArr = m.split('translate(');
                tempArr = tempArr[1].split(',');
                translateArr[0] = parseInt(tempArr[0].trim(), 10);
                translateArr[1] = parseInt(tempArr[1].trim(), 10);
              }
              if (m.indexOf('rotate(') !== (-1)) {
                tempArr = m.split('rotate(');
                tempArr = tempArr[1].split(',');
                rotateDeg = parseInt(tempArr[0], 10);
              }
              if (m.indexOf('scale(') !== (-1)) {
                tempArr = m.split('scale(');
                tempArr = tempArr[1].split(',');
                scaleArr[0] = Number(parseNumber(tempArr[0]));
                scaleArr[1] = Number(parseNumber(tempArr[1]));
              }
            });

            if (style['transform-origin'].trim() !== '') {
              tempArr = style['transform-origin'].trim().split(' ');
              originArr[0] = Number(parseNumber(tempArr[0]));
              originArr[1] = Number(parseNumber(tempArr[1]));

            }
            if (originArr.length > 0 && (scaleArr.length > 0 || typeof rotateDeg === 'number' || translateArr.length === 0)) {
              context.translate(originArr[0], originArr[1]);
            } else if (translateArr.length > 0) {
              context.translate(translateArr[0], translateArr[1]);
            }

            if (typeof rotateDeg === 'number') {
              context.rotate(rotateDeg * Math.PI / 180);
            }
            if (scaleArr.length > 0) {
              context.scale(scaleArr[0], scaleArr[1]);
            }

            if (originArr.length > 0 && (scaleArr.length > 0 || typeof rotateDeg === 'number' || translateArr.length === 0)) {
              context.translate(-originArr[0], -originArr[1]);
            }
          }

          // var transformArr = style.transform.split(' ');
          // context.translate(parseInt(transformArr[0], 10), parseInt(transformArr[1]), 10);
          // background color
          if (style['background-color'].trim() !== '') {
            context.fillStyle = style['background-color'];
            context.fillRect(x, y, w, h);
          }
          // background image
          if (style['background-image'].trim() !== '') {
            imgName = style['background-image'].trim();
            img = images[imgName];
            bg = {};
            bg.x = x + 0;
            bg.y = y + 0;
            bg.imgw = img.naturalWidth;
            bg.imgh = img.naturalHeight;
            bg.w = bg.imgw;
            bg.h = bg.imgh;
            var imgw;
            var imgh;
            if (style['background-size'].trim() === '') {
              bg.w = bg.imgw;
              bg.h = bg.imgh;
            } else {
              var arr = style['background-size'].trim().split(' ');
              if (typeof arr[0] !== 'undefined') {
                if (arr[0] === 'auto') {
                  bg.w = bg.imgw;
                } else if (arr[0].indexOf('%') !== (-1)) {
                  bg.w = (w * parseInt(arr[0], 10)) / 100;
                } else {
                  bg.w = parseInt(arr[0], 10);
                }
              }
              if (typeof arr[1] !== 'undefined') {
                if (arr[1] === 'auto') {
                  bg.h = bg.imgh;
                } else if (arr[1].indexOf('%') !== (-1)) {
                  bg.h = (h * parseInt(arr[1], 10)) / 100;
                } else {
                  bg.h = parseInt(arr[1], 10);
                }
              } else {
                bg.h = bg.imgh;
              }
            }
            imgw = bg.imgw;
            imgh = bg.imgh;
            if (style['background-position'].trim() !== '') {
              var arr2 = style['background-position'].trim().split(' ');
              if (typeof arr2[0] !== 'undefined') {
                if (arr2[0].indexOf('%') !== (-1)) {
                  bg.x = x + (w * parseInt(arr2[0], 10)) / 100;
                } else {
                  bg.x = x + parseInt(arr2[0], 10);
                }
              }
              if (typeof arr2[1] !== 'undefined') {
                if (arr2[1].indexOf('%') !== (-1)) {
                  bg.y = y + (h * parseInt(arr2[1], 10)) / 100;
                } else {
                  bg.y = y + parseInt(arr2[1], 10);
                }
              }
            }
            var gapw = ((bg.x + bg.w) - (x + w));
            var gaph = ((bg.y + bg.h) - (y + h));
            var bgsizew = bg.w;
            var bgsizeh = bg.h;
            var gappw;
            var gapph;
            if ((bg.x + bg.w) > (x + w)) {
              bg.w -= gapw;
              gappw = ((100 * gapw) / bgsizew);
              imgw -= (imgw * gappw) / 100;
            }
            if ((bg.y + bg.h) > (y + h)) {
              bg.h -= gaph;
              gapph = ((100 * gaph) / bgsizeh);
              imgh -= (imgh * gapph) / 100;
            }
            var imgx = 0;
            var imgy = 0;
            // console.log(imgx, imgy, imgw, imgh);
            context.drawImage(img, imgx, imgy, imgw, imgh, bg.x, bg.y, bg.w, bg.h);
          }
          if (element.innerHTML !== '') {
            var opts = {
              x: x,
              y: y,
              w: w,
              h: h,
              font: style.font,
              textAlign: style['text-align'],
              paddingX: 0,
              paddingY: 0,
              textDecoration: style['text-decoration'],
              verticalAlign: style['vertical-align'],
              strokeText: false
            };
            context.lineWidth = 2;
            context.strokeStyle = style['text-decoration-color'];
            context.fillStyle = style.color;
            if (element.style['text-wrap']) {
              CanvasTextWrapper(canvas, element.innerHTML, opts);
            } else {
              context.font = style.font;
              context.fillText(element.innerHTML, x, y);
            }
          }
        }
      }
      context.restore();
    }
  };
}
