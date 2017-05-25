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
