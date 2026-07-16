export function NuiButton(textMsg, callback, options) {

  options = options || {};

  this.name = "NuiButton";
  this.sensitivity = options.sensitivity || "mid";
  this.callback = callback;
  this.shemaX = 8;
  this.shemaY = 8;
  this.text = textMsg;
  this.myOpacity = 0.3;

  this.textColor = options.textColor ? options.textColor : "rgba(0,0,0,1)";
  this.font = options.font ? options.font : "30px sans-serif";
  this.bgColor = options.bgColor ? options.bgColor : "rgba(122,122,222,0.4)";
  this.discretePositionX = options.col !== undefined ? options.col : 4;
  this.discretePositionY = options.row !== undefined ? options.row : 3;
  this.discreteWidth = options.cols !== undefined ? options.cols : 3;
  this.discreteHeight = options.rows !== undefined ? options.rows : 2;

  this.borderColors = {
    r: 10,
    g: 150,
    b: 110
  };

  this.draw = function(engine) {

    engine.ctx.save()

    engine.ctx.fillStyle = "rgba(" + this.borderColors.r + ", 150, " + this.borderColors.b + ", " + this.myOpacity + " )"

    engine.ctx.fillRect(
      engine.getCanvasWidth(100) / this.shemaX * this.discretePositionX - 10,
      engine.getCanvasHeight(100) / this.shemaY * this.discretePositionY - 10,
      engine.getCanvasWidth(100) / this.shemaX * this.discreteWidth + 20,
      engine.getCanvasHeight(100) / this.shemaY * this.discreteHeight + 20);

    engine.ctx.font = this.font;
    engine.ctx.fillStyle = this.bgColor;
    // engine.ctx.fillStyle = "rgba(210, 90, 110, " + this.myOpacity + " )"

    engine.ctx.fillRect(
      engine.getCanvasWidth(100) / this.shemaX * this.discretePositionX,
      engine.getCanvasHeight(100) / this.shemaY * this.discretePositionY,
      engine.getCanvasWidth(100) / this.shemaX * this.discreteWidth,
      engine.getCanvasHeight(100) / this.shemaY * this.discreteHeight);

    engine.ctx.fillStyle = this.textColor;

    engine.ctx.fillText(
      this.text,
      engine.getCanvasWidth(100) / this.shemaX * this.discretePositionX,
      engine.getCanvasHeight(100) / this.shemaY * (this.discretePositionY + 0.7),
      engine.getCanvasWidth(35),
      engine.getCanvasHeight(9));

    engine.ctx.restore();

  };

  this.getInteractionIndices = function() {
    var indices = [];
    for(var i = 0;i < this.discreteWidth;i++) {
      var col = this.discretePositionX + i;
      var row = this.discretePositionY;
      indices.push(row * this.shemaX + col);
    }
    return indices;
  };

  this.update = function(engine) {
    var indices = this.getInteractionIndices();

    // read statuses safely (guard against out-of-range cells)
    var statuses = indices.map(function(idx) {
      var cell = engine.interActionController.main[idx];
      return cell ? cell.status : false;
    });

    var anyTrue = statuses.some(function(s) {return s === true;});
    var allTrue = statuses.every(function(s) {return s === true;});

    // "mid": any adjacent pair true triggers
    var pairTrue = false;
    for(var i = 0;i < statuses.length - 1;i++) {
      if(statuses[i] === true && statuses[i + 1] === true) {
        pairTrue = true;
        break;
      }
    }

    var triggered = this.sensitivity === "low" ? allTrue : pairTrue;

    if(triggered) {
      console.log("Button is triggered.");
      this.callback("no");
    }

    if(anyTrue) {
      if(this.borderColors.r < 255) this.borderColors.r += 20;
      if(this.borderColors.b < 255) this.borderColors.b += 20;
    } else {
      if(this.borderColors.r > 0.1) this.borderColors.r -= 20;
      if(this.borderColors.b > 0.1) this.borderColors.b -= 20;
    }
  };
}