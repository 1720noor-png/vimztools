export default class Cropper {
  constructor(element, options) {
    this.element = element;
    this.options = options;
  }
  getCroppedCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    return canvas;
  }
  destroy() {}
}
