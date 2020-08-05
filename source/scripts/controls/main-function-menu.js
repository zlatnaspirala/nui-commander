
  var indicatorsBlocks = {

    name: "indicatorsBlocks",

    shemaX: 8,
    shemaY: 8,

    text: [
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F7",
      "F8",
    ],

    draw: function(engine) {

      for (var j = 0;j < this.shemaX; j++) {

        for (var i = 0;i < this.shemaY; i++) {

          engine.ctx.strokeRect(
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX * j,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY * i,
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY);

          engine.ctx.fillText(
            this.text[j] + (i + 1),
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX * j,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY * i + 10,
            engine.getCanvasWidth(12.5),
            engine.getCanvasHeight(12.5));
        }
      }

      }


    }

  app.drawer.elements.push(indicatorsBlocks)
