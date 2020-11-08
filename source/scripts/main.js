
/**
 * Main file for creating instances.
 *
 */

 app = {};

 window.onload = function() {

  var browser = new detectBrowser();
  app.drawer = new canvasEngine(interActionController);
  app.drawer.draw();

  asyncLoad("scripts/controls/main-function-menu.js");
  asyncLoad("scripts/controls/nui-msg-box.js");

  asyncLoad("scripts/controls/nui-button.js", function() {

    this.window.app.drawer.elements.push(
       new window.nuiMsgBox(
        "Do you love this project?",
        function (answer) {

          console.log(answer)
          app.drawer.removeElementByName("nuiMsgBox")

          if (answer == "yes") {

            console.log("Good answer is yes.")

            setTimeout( () => {
              app.drawer.elements.push(
              new window.nuiMsgBox(
                "Do you wanna to activate voice commander?",
                function (answer) {
                  app.drawer.removeElementByName("nuiMsgBox")
                  if (answer == "yes") {
                    // root.vc.run()
                    alert('ok')
                  }
                }))
            }, 800)

          } else {
            console.log("Ok good buy.")
            window.location.href = "https://google.com"
          }

        }))

      console.info("nui-commander controls attached.")

        /*
        // clear it first
        indicatorsBlocks.icons = [];
        for (var x = 0; x < 64; x++) {
          var commanderIconField = new Image();
          commanderIconField.src = "images/note1.png";
          commanderIconField.onload = function () {
            indicatorsBlocks.icons.push(this)
          }
        }
        */

 })

}

/**
 *
 *       var actions = this.window.interActionController
      var indicators = this.window.indicatorsBlocks

      indicators.text[0] = "VOICE"
      actions.main[0].onAction = function() {
        if (actions.main[1].status == false) {
          root.vc.run()
        }
      }

      indicators.text[8] = "THEME"
      actions.main[1].onAction = function() {
        root.operations.switchTheme()
      }

      indicators.text[16] = "LOGIN"
      actions.main[2].onAction = function() {
        root.$root.$emit('googleApiLoginEvent', { start: 'start googleApiLoginEvent' })
      }

      indicators.text[24] = "SpinPlaces"
      actions.main[3].onAction = function() {
        (root.$root.$children[0] as App).switchPlaceAction()
      }

      // About
      indicators.text[56] = "ABOUT"
      actions.main[7].onAction = function() {
        (root.$root.$children[0].$children[0] as myHeader).showAboutDialogClick()
      }

      // logo for vuletube
      indicators.text[63] = "VULETUBE"
      actions.main[63].onAction = function() {
      }

      var commanderIconField0 = new Image()
      commanderIconField0.src = "/assets/icons/svgs/solid/file-audio.svg"
      commanderIconField0.onload = function () {
        indicators.icons[0] = this
      }

      var commanderIconField1 = new Image()
      commanderIconField1.src = "/assets/icons/svgs/solid/th-large.svg"
      commanderIconField1.onload = function () {
        indicators.icons[1] = this
      }

      var commanderIconField2 = new Image()
      commanderIconField2.src = "/assets/icons/svgs/solid/key.svg"
      commanderIconField2.onload = function () {
        indicators.icons[2] = this
      }

      var commanderIconField3 = new Image()
      commanderIconField3.src = "/assets/icons/svgs/brands/superpowers.svg"
      commanderIconField3.onload = function () {
        indicators.icons[3] = this
      }

      var commanderIconField7 = new Image()
      commanderIconField7.src = "/assets/icons/pngs/information.png"
      commanderIconField7.onload = function () {
        indicators.icons[7] = this
      }
 */
