
  var indicatorsBlocks = {

    name: "indicatorsBlocks",

    shemaX: 8,
    shemaY: 8,

    opacity: [
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
    ],

    text: [
      "CLEAR", "VOLUME", "PAUSE", "F4", "F5", "F6", "F7", "ADD SOMETHING",
      "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8",
      "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8",
      "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8",
      "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8",
      "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8",
      "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8",
      "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8",
    ],

    draw: function(engine) {

      var c = 0;

      for (var j = 0;j < this.shemaX; j++) {

        for (var i = 0;i < this.shemaY; i++) {


          if (typeof engine.interActionController.main[c] !== 'undefined' &&
              engine.interActionController.main[c].status == true) {

            engine.ctx.save()

            this.opacity[c] = this.opacity[c] + 0.02
            engine.ctx.fillStyle = "rgba(250, 250, 100, " + this.opacity[c] + " )"

            engine.ctx.fillRect(
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX * i,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY * j,
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY);

            engine.ctx.restore()

           } else {

            engine.ctx.fillStyle = "rgba(250, 250, 100, " + this.opacity[c] + " )"

            engine.ctx.fillRect(
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX * i,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY * j,
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY);


           }


          engine.ctx.strokeRect(
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX * j,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY * i,
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY);

          engine.ctx.fillText(
            this.text[c],
            engine.getCanvasWidth(100) / indicatorsBlocks.shemaX * j,
            engine.getCanvasHeight(100) / indicatorsBlocks.shemaY * i + 10,
            engine.getCanvasWidth(12.5),
            engine.getCanvasHeight(12.5));


            c++;

        }
      }

      },

      update: function() {
        this.opacity.forEach(function(item, index, array) {
          if (item > 0) {
            array[index] = array[index] - 0.004
          } else {
            array[index] = 0
          }
        });
      }

    }

  app.drawer.elements.push(indicatorsBlocks)