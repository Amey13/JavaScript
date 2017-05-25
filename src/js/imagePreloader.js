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
