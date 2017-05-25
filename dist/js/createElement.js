(function (root) {

  function CanvasTextWrapper(canvas, text, options) {
    'use strict';

    var defaults = {
      font: '18px Arial, sans-serif',
      sizeToFill: false,
      maxFontSizeToFill: false,
      lineHeight: 1,
      allowNewLine: true,
      lineBreak: 'auto',
      textAlign: 'left',
      verticalAlign: 'top',
      justifyLines: false,
      paddingX: 0,
      paddingY: 0,
      fitParent: false,
      strokeText: false,
      renderHDPI: true,
      textDecoration: 'none',
      x: 0,
      y: 0,
      w: 0,
      h: 0
    };

    var opts = {};

    for (var key in defaults) {
      opts[key] = options.hasOwnProperty(key) ? options[key] : defaults[key];
    }

    var context = canvas.getContext('2d');
    context.font = opts.font;
    context.textBaseline = 'bottom';

    var scale = 1;
    var devicePixelRatio = (typeof global !== 'undefined') ? global.devicePixelRatio : root.devicePixelRatio;

    if (opts.renderHDPI && devicePixelRatio > 1) {
      var tempCtx = {};

      // store context settings in a temp object before scaling otherwise they will be lost
      for (var key in context) {
        tempCtx[key] = context[key];
      }

      var canvasWidth = canvas.width;
      var canvasHeight = canvas.height;
      scale = devicePixelRatio;

      canvas.width = canvasWidth * scale;
      canvas.height = canvasHeight * scale;
      canvas.style.width = canvasWidth * scale * 0.5 + 'px';
      canvas.style.height = canvasHeight * scale * 0.5 + 'px';

      // restore context settings
      for (var key in tempCtx) {
        try {
          context[key] = tempCtx[key];
        } catch (e) {

        }
      }

      context.scale(scale, scale);
    }

    var EL_WIDTH = opts.w / scale; // (!opts.fitParent ? canvas.width : canvas.parentNode.clientWidth) / scale;
    var EL_HEIGHT = opts.h / scale; // (!opts.fitParent ? canvas.height : canvas.parentNode.clientHeight) / scale;
    var MAX_TXT_WIDTH = EL_WIDTH - (opts.paddingX * 2);
    var MAX_TXT_HEIGHT = EL_HEIGHT - (opts.paddingY * 2);

    var fontSize = opts.font.match(/\d+(px|em|%)/g) ? +opts.font.match(/\d+(px|em|%)/g)[0].match(/\d+/g) : 18;
    var textBlockHeight = 0;
    var lines = [];
    var newLineIndexes = [];
    var textPos = {x: 0, y: 0};
    var lineHeight = 0;
    var fontParts;

    setFont(fontSize);
    setLineHeight();
    validate();
    render();

    function setFont(fontSize) {
      if (!fontParts) fontParts = (!opts.sizeToFill) ? opts.font.split(/\b\d+px\b/i) : context.font.split(/\b\d+px\b/i);
      context.font = fontParts[0] + fontSize + 'px' + fontParts[1];
    }

    function setLineHeight() {
      if (!isNaN(opts.lineHeight)) {
        lineHeight = fontSize * opts.lineHeight;
      } else if (opts.lineHeight.toString().indexOf('px') !== -1) {
        lineHeight = parseInt(opts.lineHeight);
      } else if (opts.lineHeight.toString().indexOf('%') !== -1) {
        lineHeight = (parseInt(opts.lineHeight) / 100) * fontSize;
      }
    }

    function render() {
      if (opts.sizeToFill) {
        var wordsCount = text.trim().split(/\s+/).length;
        var newFontSize = 0;
        var fontSizeHasLimit = opts.maxFontSizeToFill !== false;

        do {
          if (fontSizeHasLimit) {
            if (++newFontSize <= opts.maxFontSizeToFill) {
              adjustFontSize(newFontSize);
            } else {
              break;
            }
          } else {
            adjustFontSize(++newFontSize);
          }
        } while (textBlockHeight < MAX_TXT_HEIGHT && (lines.join(' ').split(/\s+/).length == wordsCount));

        adjustFontSize(--newFontSize);
      } else {
        wrap();
      }

      if (opts.justifyLines && opts.lineBreak === 'auto') {
        justify();
      }

      setVertAlign();
      setHorizAlign();
      drawText();
    }

    function adjustFontSize(size) {
      setFont(size);
      lineHeight = size;
      wrap();
    }

    function wrap() {
      if (opts.allowNewLine) {
        var newLines = text.trim().split('\n');
        for (var i = 0, idx = 0; i < newLines.length - 1; i++) {
          idx += newLines[i].trim().split(/\s+/).length;
          newLineIndexes.push(idx)
        }
      }

      var words = text.trim().split(/\s+/);
      checkLength(words);
      breakText(words);

      textBlockHeight = lines.length * lineHeight;
    }

    function checkLength(words) {
      var testString, tokenLen, sliced, leftover;

      words.forEach(function (word, index) {
        testString = '';
        tokenLen = context.measureText(word).width;

        if (tokenLen > MAX_TXT_WIDTH) {
          for (var k = 0; (context.measureText(testString + word[k]).width <= MAX_TXT_WIDTH) && (k < word.length); k++) {
            testString += word[k];
          }

          sliced = word.slice(0, k);
          leftover = word.slice(k);
          words.splice(index, 1, sliced, leftover);
        }
      });
    }

    function breakText(words) {
      lines = [];
      for (var i = 0, j = 0; i < words.length; j++) {
        lines[j] = '';

        if (opts.lineBreak === 'auto') {
          if (context.measureText(lines[j] + words[i]).width > MAX_TXT_WIDTH) {
            break;
          } else {
            while ((context.measureText(lines[j] + words[i]).width <= MAX_TXT_WIDTH) && (i < words.length)) {

              lines[j] += words[i] + ' ';
              i++;

              if (opts.allowNewLine) {
                for (var k = 0; k < newLineIndexes.length; k++) {
                  if (newLineIndexes[k] === i) {
                    j++;
                    lines[j] = '';
                    break;
                  }
                }
              }
            }
          }
          lines[j] = lines[j].trim();
        } else {
          lines[j] = words[i];
          i++;
        }
      }
    }

    function justify() {
      var maxLen, longestLineIndex, tokenLen;
      for (var i = 0; i < lines.length; i++) {
        tokenLen = context.measureText(lines[i]).width;

        if (!maxLen || tokenLen > maxLen) {
          maxLen = tokenLen;
          longestLineIndex = i;
        }
      }

      // fill lines with extra spaces
      var numWords, spaceLength, numOfSpaces, num, filler;
      var delimiter = '\u200A';
      for (i = 0; i < lines.length; i++) {
        if (i === longestLineIndex) continue;

        numWords = lines[i].trim().split(/\s+/).length;
        if (numWords <= 1) continue;

        lines[i] = lines[i].trim().split(/\s+/).join(delimiter);

        spaceLength = context.measureText(delimiter).width;
        numOfSpaces = (maxLen - context.measureText(lines[i]).width) / spaceLength;
        num = numOfSpaces / (numWords - 1);

        filler = '';
        for (var j = 0; j < num; j++) {
          filler += delimiter;
        }

        lines[i] = lines[i].trim().split(delimiter).join(filler);
      }
    }

    function underline(text, x, y) {
      var width = context.measureText(text).width;

      switch (context.textAlign) {
        case 'center':
          x -= (width / 2);
          break;
        case 'right':
          x -= width;
          break;
      }

      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + width, y);
      context.stroke();
    }

    function drawText() {
      textPos.y += opts.y;
      textPos.x += opts.x;
      for (var i = 0; i < lines.length; i++) {
        textPos.y = parseInt(textPos.y) + lineHeight;
        context.fillText(lines[i], textPos.x, textPos.y);

        if (opts.strokeText) {
          context.strokeText(lines[i], textPos.x, textPos.y);
        }

        if (opts.textDecoration.toLocaleLowerCase() === 'underline') {
          underline(lines[i], textPos.x, textPos.y);
        }
      }
    }

    function setHorizAlign() {
      context.textAlign = opts.textAlign;

      if (opts.textAlign == 'center') {
        textPos.x = EL_WIDTH / 2;
      } else if (opts.textAlign == 'right') {
        textPos.x = EL_WIDTH - opts.paddingX;
      } else {
        textPos.x = opts.paddingX;
      }
    }

    function setVertAlign() {
      if (opts.verticalAlign == 'middle') {
        textPos.y = (EL_HEIGHT - textBlockHeight) / 2;
      } else if (opts.verticalAlign == 'bottom') {
        textPos.y = EL_HEIGHT - textBlockHeight - opts.paddingY;
      } else {
        textPos.y = opts.paddingY;
      }
    }

    function validate() {
      if (typeof text !== 'string')
        throw new TypeError('The second parameter must be a String.');

      if (isNaN(fontSize))
        throw new TypeError('Cannot parse "font".');

      if (isNaN(lineHeight))
        throw new TypeError('Cannot parse "lineHeight".');

      if (opts.textAlign.toLocaleLowerCase() !== 'left' && opts.textAlign.toLocaleLowerCase() !== 'center' && opts.textAlign.toLocaleLowerCase() !== 'right')
        throw new TypeError('Property "textAlign" must be set to either "left", "center", or "right".');

      if (opts.verticalAlign.toLocaleLowerCase() !== 'top' && opts.verticalAlign.toLocaleLowerCase() !== 'middle' && opts.verticalAlign.toLocaleLowerCase() !== 'bottom')
        throw new TypeError('Property "verticalAlign" must be set to either "top", "middle", or "bottom".');

      if (typeof opts.justifyLines !== 'boolean')
        throw new TypeError('Property "justifyLines" must be a Boolean.');

      if (isNaN(opts.paddingX))
        throw new TypeError('Property "paddingX" must be a Number.');

      if (isNaN(opts.paddingY))
        throw new TypeError('Property "paddingY" must be a Number.');

      if (typeof opts.fitParent !== 'boolean')
        throw new TypeError('Property "fitParent" must be a Boolean.');

      if (opts.lineBreak.toLocaleLowerCase() !== 'auto' && opts.lineBreak.toLocaleLowerCase() !== 'word')
        throw new TypeError('Property "lineBreak" must be set to either "auto" or "word".');

      if (typeof opts.sizeToFill !== 'boolean')
        throw new TypeError('Property "sizeToFill" must be a Boolean.');

      if (typeof opts.strokeText !== 'boolean')
        throw new TypeError('Property "strokeText" must be a Boolean.');

      if (typeof opts.renderHDPI !== 'boolean')
        throw new TypeError('Property "renderHDPI" must be a Boolean.');

      if (opts.textDecoration.toLocaleLowerCase() !== 'none' && opts.textDecoration.toLocaleLowerCase() !== 'underline')
        throw new TypeError('Property "textDecoration" must be set to either "none" or "underline".');
    }
  }

  if ('module' in root && 'exports' in module) {
    module.exports = CanvasTextWrapper;
  } else {
    root.CanvasTextWrapper = CanvasTextWrapper;
  }
})(this);

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

function imagePreloader() {
  var _this = this;
  this.loadImages = function (_list, _callback) {
    var images = {};
    var cnt = 0;
    var imageName;
    function getImage() {
      if (cnt < _list.length) {
        imageName = _list[cnt].split('/').reverse()[0];
        images[imageName] = new Image();
        images[imageName].onload = function () {
          cnt += 1;
          getImage();
        };
        images[imageName].src = _list[cnt];
      } else if (typeof _callback !== 'undefined') {
        _callback(images);
      }
    }
    getImage();
  };
}

function NodeCreator() {
  var _this = this;
}
NodeCreator.prototype.createElement = function (_type) {
  return new Node(_type);
};

function Node(_type) {
  var properties = new Properties();
  this.data = _type;
  this.children = [];
  this.type = _type;
  this.style = {};
  this.innerHTML = '';
  this.event = {
    click: undefined,
    mousedown: undefined,
    mousemove: undefined,
    mouseup: undefined
  };
  this.addEventListener = function (_event, _callback) {
    if (typeof _event !== 'undefined' && typeof _callback !== 'undefined') {
      this.event[_event] = _callback;
    }
  };
  this.removeEventListener = function (_event) {
    if (typeof _event !== 'undefined') {
      this.event[_event] = undefined;
    }
  }
  properties.addDefault(this);
}
Node.prototype.appendChild = function (_node) {
  this.children.push(_node);
};
Node.prototype.css = function (_obj) {
  Object.keys(_obj).forEach((i) => {
    if (this.style.hasOwnProperty(i)) {
      this.style[i] = _obj[i];
    }
  });
};

function Tree() {
  this.root = null;
}

Tree.prototype.add = function (data, toNodeData) {
  var node = new Node(data);
  var parent = toNodeData ? this.findBFS(toNodeData) : null;
  if (parent) {
    parent.children.push(node);
  } else if (!this.root) {
    this.root = node;
  } /* else {
    return 'Root node is already assigned';
  } */
  return node; // ref to node
};
Tree.prototype.remove = function (data) {
  if (this.root.data === data) {
    this.root = null;
  }

  var queue = [this.root];
  while (queue.length) {
    var node = queue.shift();
    for (var i = 0; i < node.children.length; i++) {
      if (node.children[i].data === data) {
        node.children.splice(i, 1);
      } else {
        queue.push(node.children[i]);
      }
    }
  }
};
Tree.prototype.contains = function (data) {
  return this.findBFS(data) ? true : false;
};
Tree.prototype.findBFS = function (data) {
  var queue = [this.root];
  while (queue.length) {
    var node = queue.shift();
    if (node.data === data) {
      return node;
    }
    for (var i = 0; i < node.children.length; i++) {
      queue.push(node.children[i]);
    }
  }
  return null;
};
Tree.prototype._preOrder = function (node, fn) {
  if (node) {
    if (fn) {
      fn(node);
    }
    for (var i = 0; i < node.children.length; i++) {
      this._preOrder(node.children[i], fn);
    }
  }
};
Tree.prototype._postOrder = function (node, fn) {
  if (node) {
    for (var i = 0; i < node.children.length; i++) {
      this._postOrder(node.children[i], fn);
    }
    if (fn) {
      fn(node);
    }
  }
};
Tree.prototype.traverseDFS = function (fn, method) {
  var current = this.root;
  if (method) {
    this['_' + method](current, fn);
  } else {
    this._preOrder(current, fn);
  }
};
Tree.prototype.traverseBFS = function (fn) {
  var queue = [this.root];
  while (queue.length) {
    var node = queue.shift();
    if (fn) {
      fn(node);
    }
    for (var i = 0; i < node.children.length; i++) {
      queue.push(node.children[i]);
    }
  }
};
Tree.prototype.print = function () {
  if (!this.root) {
    return console.log('No root node found');
  }
  var newline = new Node('|');
  var queue = [this.root, newline];
  var string = '';
  while (queue.length) {
    var node = queue.shift();
    string += node.data.toString() + ' ';
    if (node === newline && queue.length) {
      queue.push(newline);
    }
    for (var i = 0; i < node.children.length; i++) {
      queue.push(node.children[i]);
    }
  }
  console.log(string.slice(0, -2).trim());
};
Tree.prototype.printByLevel = function () {
  if (!this.root) {
    return console.log('No root node found');
  }
  var newline = new Node('\n');
  var queue = [this.root, newline];
  var string = '';
  while (queue.length) {
    var node = queue.shift();
    string += node.data.toString() + (node.data !== '\n' ? ' ' : '');
    if (node === newline && queue.length) {
      queue.push(newline);
    }
    for (var i = 0; i < node.children.length; i++) {
      queue.push(node.children[i]);
    }
  }
  console.log(string.trim());
};
/*
var tree = new Tree();
tree.add('ceo');
tree.add('cto', 'ceo');
tree.add('dev1', 'cto');
tree.add('dev2', 'cto');
tree.add('dev3', 'cto');
tree.add('cfo', 'ceo');
tree.add('accountant', 'cfo');
tree.add('cmo', 'ceo');
tree.print(); // => ceo | cto cfo cmo | dev1 dev2 dev3 accountant
tree.printByLevel();  // => ceo \n cto cfo cmo \n dev1 dev2 dev3 accountant
console.log('tree contains dev1 is true:', tree.contains('dev1')); // => true
console.log('tree contains dev4 is false:', tree.contains('dev4')); // => false
console.log('--- BFS');
tree.traverseBFS(function (node) {
  console.log(node.data);
}); // => ceo cto cfo cmo dev1 dev2 dev3 accountant
console.log('--- DFS preOrder');
tree.traverseDFS(function (node) {
  console.log(node.data);
}, 'preOrder'); // => ceo cto dev1 dev2 dev3 cfo accountant cmo
console.log('--- DFS postOrder');
tree.traverseDFS(function (node) {
  console.log(node.data);
}, 'postOrder'); // => dev1 dev2 dev3 cto accountant cfo cmo ceo
tree.remove('cmo');
tree.print(); // => ceo | cto cfo | dev1 dev2 dev3 accountant
tree.remove('cfo');
tree.print(); // => ceo | cto | dev1 dev2 dev3
*/

function Properties() {

}
Properties.prototype.addDefault = function (_node) {
  switch (_node.type) {
    case 'div':
      _node.style.display = 'block';
      _node.style.left = 0;
      _node.style.top = 0;
      _node.style.right = 0;
      _node.style.bottom = 0;
      _node.style.color = '#000000';
      _node.style.opacity = 1;
      _node.style.background = '';
      _node.style['background-color'] = '';
      _node.style['background-image'] = '';
      _node.style['background-position'] = '';
      _node.style['background-repeat'] = 'repeat';
      _node.style['background-clip'] = '';
      _node.style['background-origin'] = '';
      _node.style['background-size'] = '';
      _node.style.border = '';
      _node.style['border-bottom'] = '';
      _node.style['border-bottom-color'] = '';
      _node.style['border-bottom-left-radius'] = '';
      _node.style['border-bottom-right-radius'] = '';
      _node.style['border-bottom-style'] = '';
      _node.style['border-bottom-width'] = '';
      _node.style['border-color'] = '';
      _node.style['border-image'] = '';
      _node.style['border-image-repeat'] = '';
      _node.style['border-image-slice'] = '';
      _node.style['border-image-source'] = '';
      _node.style['border-image-width'] = '';
      _node.style['border-left'] = '';
      _node.style['border-left-color'] = '';
      _node.style['border-left-style'] = '';
      _node.style['border-left-width'] = '';
      _node.style['border-radius'] = '';
      _node.style['border-right'] = '';
      _node.style['border-right-color'] = '';
      _node.style['border-right-style'] = '';
      _node.style['border-right-width'] = '';
      _node.style['border-style'] = '';
      _node.style['border-top'] = '';
      _node.style['border-top-color'] = '';
      _node.style['border-top-left-radius'] = '';
      _node.style['border-top-right-radius'] = '';
      _node.style['border-top-style'] = '';
      _node.style['border-top-width'] = '';
      _node.style['border-width'] = '';
      _node.style['box-decoration-break'] = '';
      _node.style['box-shadow'] = '';
      _node.style.clip = '';
      _node.style.height = '0px';
      _node.style.margin = '';
      _node.style['margin-bottom'] = '';
      _node.style['margin-left'] = '';
      _node.style['margin-right'] = '';
      _node.style['margin-top'] = '';
      _node.style.padding = '';
      _node.style['padding-bottom'] = '';
      _node.style['padding-left'] = '';
      _node.style['padding-right'] = '';
      _node.style['padding-top'] = '';
      _node.style.visibility = '';
      _node.style.width = '';
      _node.style['z-index'] = '';
      _node.style.transform = '';
      _node.style['transform-origin'] = '';
      _node.style.font = '16px Arial, sans-serif';
      _node.style['text-align'] = 'left';
      _node.style['text-decoration'] = 'none';
      _node.style['vertical-align'] = 'top';
      _node.style['text-decoration-color'] = '#000000';
      _node.style['text-wrap'] = true;
      break;
    default:
      break;
  }
};

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
