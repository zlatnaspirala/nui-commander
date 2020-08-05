
function canvasEngine() {

  var root = this;

  // create dom element
  this.canvasDom = document.createElement("canvas");
  this.canvasDom.setAttribute("id", "drawer");
  this.canvasDom.setAttribute("width", "640px");
  this.canvasDom.setAttribute("style", "z-index:20;");
  this.ctx = this.canvasDom.getContext("2d");
  document.body.appendChild(this.canvasDom);

  this.elements = [];

  this.draw = function() {

    this.elements.forEach(function(element) {
      element.draw(this.ctx);
    });

    this.setTimeout(function() {
      root.draw();
    }, 20);
  }

}
