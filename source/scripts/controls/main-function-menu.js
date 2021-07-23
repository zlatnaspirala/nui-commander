
/**
 * @description Inline code used to make easy default setup.
 * For opacity, text, icons(images).
 * No draws for empty string
 */

export let indicatorsBlocks = {
    name: "this",
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
      "HOME", "free", "", "", "", "", "", "ADD SOMETHING",
      "CONTROL 1", "", "", "", "", "", "", "",
      "CONTROL 2", "", "", "", "", "", "", "",
      "CONTROL 3", "", "", "", "", "", "", "",
      "CONTROL 4", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "",
    ],

    iconsStyle: {
      localScale: 0
    },

    icons: [
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null
    ],

    draw: function(engine) {

      var c = 0;
      engine.ctx.save()

      for (var j = 0;j < this.shemaX; j++) {

        for (var i = 0;i < this.shemaY; i++) {

          if (typeof engine.interActionController.main[c] !== 'undefined' &&
              engine.interActionController.main[c].status == true) {

            this.opacity[c] = this.opacity[c] + 0.02
            engine.ctx.fillStyle = "rgba(250, 250, 100, " + this.opacity[c] + " )"

            engine.ctx.fillRect(
            engine.getCanvasWidth(100) / this.shemaX * i,
            engine.getCanvasHeight(100) / this.shemaY * j,
            engine.getCanvasWidth(100) / this.shemaX,
            engine.getCanvasHeight(100) / this.shemaY);

          } else {

            engine.ctx.fillStyle = "rgba(250, 250, 100, " + this.opacity[c] + " )"

            engine.ctx.fillRect(
            engine.getCanvasWidth(100) / this.shemaX * i,
            engine.getCanvasHeight(100) / this.shemaY * j,
            engine.getCanvasWidth(100) / this.shemaX,
            engine.getCanvasHeight(100) / this.shemaY);


           }

          /* Disabled
           engine.ctx.strokeRect(
            engine.getCanvasWidth(100) / this.shemaX * j,
            engine.getCanvasHeight(100) / this.shemaY * i,
            engine.getCanvasWidth(100) / this.shemaX,
            engine.getCanvasHeight(100) / this.shemaY);
          */

          var localScale = this.iconsStyle.localScale;
          // draw icons
          if (typeof this.icons[c] !== 'undefined' && this.icons[c] !== null) {
            engine.ctx.drawImage(
              this.icons[c],
              engine.getCanvasWidth(100) / this.shemaX * i + localScale,
              engine.getCanvasHeight(100) / this.shemaY * j + localScale,
              engine.getCanvasWidth(100) / this.shemaX - 2 * localScale,
              engine.getCanvasHeight(100) / this.shemaY - 2 * localScale);
          } else if (this.text[c] != '') {

            // For improve                          text opacity
            engine.ctx.fillStyle = "rgba(250, 100, 100, 1)"

            engine.ctx.fillRect(
              engine.getCanvasWidth(100) / this.shemaX * j,
              engine.getCanvasHeight(100) / this.shemaY * i ,
              engine.getCanvasWidth(100) / this.shemaX ,
              engine.getCanvasHeight(2.1));

            engine.ctx.fillStyle = "black";
            engine.ctx.font = "16px arial";

            engine.ctx.fillText(
              this.text[c],
              engine.getCanvasWidth(100) / this.shemaX * j,
              engine.getCanvasHeight(100) / this.shemaY * i + 10,
              engine.getCanvasWidth(12.5),
              engine.getCanvasHeight(12.5));
          }

          c++;

        }
      }

      engine.ctx.restore()

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

