function createElement(_options) {
  var _this = this;
  var hasOProp = Object.prototype.hasOwnProperty;
  var canvas = _options.canvas;
  var context = canvas.getContext('2d');
  var imagePreloaderCls = new imagePreloader();
  var images = {};
  var stage = new NodeCreator();
  var renderer = new Renderer();
  var isDevice = BrowserDetect.isDevice();
  var mouseEvents = (isDevice) ? {
    down: 'touchstart',
    move: 'touchmove',
    up: 'touchend',
    click: 'click'
  } : {
    down: 'mousedown',
    move: 'mousemove',
    up: 'mouseup',
    click: 'click'
  };

  renderer.setData({
    canvas: _options.canvas,
  });
  // preload images
  stage.body = stage.createElement('body'); // stage to append

  stage.draw = function () {
    canvas.width = canvas.width;
    context.save();
    context.globalAlpha = 1;
    // get z-index
    var _zindexArr = [];
    var elements = stage.body.children;
    var i = 0;
    var k = 0;
    for (i = 0; i < elements.length; i += 1) {
      if (elements[i].style['z-index'] !== '' && typeof elements[i].style['z-index'] === 'number') {
        _zindexArr.push(elements[i].style['z-index']);
      }
    }
    _zindexArr.sort();
    var _arr = [];
    for (k = 0; k < elements.length; k += 1) {
      if (elements[k].style['z-index'] === '') {
        _arr.push(k);
      }
    }
    if (_zindexArr.length > 0) {
      for (i = 0; i < _zindexArr.length; i += 1) {
        for (k = 0; k < elements.length; k += 1) {
          if (elements[k].style['z-index'] !== '' && _zindexArr[i] === elements[k].style['z-index']) {
            _arr.push(k);
          }
        }
      }
    }
    // background
    context.save();
    renderer.background(elements, _arr);
    // renderer.textWrapper(elements, _arr);
    context.restore();
  };
  imagePreloaderCls.loadImages(_options.images, imageCallback);

  function addEvents() {
    canvas.addEventListener(mouseEvents.click, mouseEvent);
    canvas.addEventListener(mouseEvents.down, mouseEvent);
    canvas.addEventListener(mouseEvents.move, mouseEvent);
    canvas.addEventListener(mouseEvents.up, mouseEvent);
  }

  function mouseEvent(e) {
    var pageX,
      pageY;

    if (isDevice) {
      pageX = e.changedTouches[0].pageX;
      pageY = e.changedTouches[0].pageY;
    } else {
      pageX = e.pageX;
      pageY = e.pageY;
    }
    // ----------------------------
    var _typeStr = '';
    switch (e.type) {
      case 'touchstart':
      case 'mousedown':
        _typeStr = 'mousedown';
        e.preventDefault();
        break;
      case 'touchmove':
      case 'mousemove':
        _typeStr = 'mousemove';
        break;
      case 'touchend':
      case 'mouseup':
        _typeStr = 'mouseup';
        break;
      case 'click':
        _typeStr = 'click';
        break;
      default:
        break;
    }
    if (_typeStr !== '') {
      var _zindexArr = [];
      var elements = stage.body.children;
      var i = 0;
      var k = 0;
      for (i = 0; i < elements.length; i += 1) {
        if (elements[i].style['z-index'] !== '' && typeof elements[i].style['z-index'] === 'number') {
          _zindexArr.push(elements[i].style['z-index']);
        }
      }
      _zindexArr.sort();
      var _arr = [];
      for (k = 0; k < elements.length; k += 1) {
        if (elements[k].style['z-index'] === '') {
          _arr.push(k);
        }
      }
      if (_zindexArr.length > 0) {
        for (i = 0; i < _zindexArr.length; i += 1) {
          for (k = 0; k < elements.length; k += 1) {
            if (elements[k].style['z-index'] !== '' && _zindexArr[i] === elements[k].style['z-index']) {
              _arr.push(k);
            }
          }
        }
      }
      var x;
      var y;
      var w;
      var h;
      var offsetX = canvas.offsetLeft;
      var offsetY = canvas.offsetTop;
      var click = true;
      var mousedown = true;
      var mousemove = true;
      var mouseup = true;
      for (k = _arr.length - 1; k >= 0; k -= 1) {
        x = parseNumber(elements[k].style.left);
        y = parseNumber(elements[k].style.top);
        w = parseNumber(elements[k].style.width);
        h = parseNumber(elements[k].style.height);

        if (checkMouseIn(x, y, w, h, pageX, pageY, offsetX, offsetY)) {
          if (click && _typeStr === 'click') {
            if (typeof elements[k].event.click !== 'undefined') {
              click = false;
              elements[k].event.click();
            }
          }
          if (mousedown && _typeStr === 'mousedown') {
            if (typeof elements[k].event.mousedown !== 'undefined') {
              mousedown = false;
              elements[k].event.mousedown();
            }
          }
          if (mousemove && _typeStr === 'mousemove') {
            if (typeof elements[k].event.mousemove !== 'undefined') {
              mousemove = false;
              elements[k].event.mousemove();
            }
          }
          if (mouseup && _typeStr === 'mouseup') {
            if (typeof elements[k].event.mouseup !== 'undefined') {
              mouseup = false;
              elements[k].event.mouseup();
            }
          }
        }
      }
    }
  }

  function checkMouseIn(_x, _y, _w, _h, _pageX, _pageY, _offsetX, _offsetY) {
    _pageX -= _offsetX;
    _pageY -= _offsetY;
    return ((_pageX >= _x) && (_pageX <= (_x + _w)) && (_pageY >= _y) && (_pageY <= (_y + _h)));
  }
  function imageCallback(_images) {
    if (typeof _images !== 'undefined') {
      images = _images;
      renderer.setData({
        images
      });
    }
    if (typeof _options.callback !== 'undefined') {
      _options.callback();
    }
  }
  addEvents();
  return stage;
}
function parseNumber(str) {
  return Number(str.replace(/[^0-9.]/g, ''));
}
// ===================================================================================
// DETECT BROWSER TO IDENTIFY THE PLATFORM
// ===================================================================================
var BrowserDetect = {
  platformAndroid() {
    return !!navigator.userAgent.match(/Android/i);
  },
  platformBlackBerry() {
    return !!navigator.userAgent.match(/BlackBerry/i);
  },
  platformIOS() {
    return !!navigator.userAgent.match(/iPhone|iPad|iPod|caireadymobile/i);
  },
  platformWindows() {
    return !!navigator.userAgent.match(/IEMobile/i);
  },
  isDevice() {
    return (BrowserDetect.platformAndroid() || BrowserDetect.platformBlackBerry() || BrowserDetect.platformIOS() || BrowserDetect.platformWindows());
  },
  ie9() {
    return !!navigator.userAgent.match(/MSIE 9.0/i);
  },
  ie10() {
    return !!navigator.userAgent.match(/MSIE 10.0/i);
  }
};
