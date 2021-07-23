import {indicatorsBlocks} from "./scripts/controls/main-function-menu";
import {canvasEngine} from "./scripts/canvasEngine";
// import {DetectBrowser} from "./scripts/helper";
import {interActionController} from "./scripts/controller";
import {nuiMsgBox} from "./scripts/controls/nui-msg-box";

export let nuiCommander = {};

window.nuiCommander = nuiCommander;

export function loadNuiCommander() {

  // var browser = new DetectBrowser();
  nuiCommander.drawer = new canvasEngine( interActionController );
  nuiCommander.drawer.draw();

  nuiCommander.indicatorsBlocks = indicatorsBlocks;
  nuiCommander.drawer.elements.push( nuiCommander.indicatorsBlocks );

  nuiCommander.drawer.elements.push(
    new nuiMsgBox( "Do you love this project?", function ( answer ) {
      console.log( answer );
      nuiCommander.drawer.removeElementByName( "nuiMsgBox" );

      if ( answer == "yes" ) {
        console.log( "Good answer is yes." );

        setTimeout( () => {
          nuiCommander.drawer.elements.push(
            new nuiMsgBox(
              "Do you wanna to activate voice commander?",
              function ( answer ) {
                nuiCommander.drawer.removeElementByName( "nuiMsgBox" );
                if ( answer == "yes" ) {
                  // root.vc.run()
                  alert( "ok" );
                }
              }
            )
          );
        }, 800 );
      } else {
        console.log( "Ok good buy." );
        window.location.href = "https://google.com";
      }
    } )
  );

  console.info( "nui-commander controls attached." );

  nuiCommander.indicatorsBlocks.icons = [];
  for ( var x = 0; x < 64; x++ ) {
    var commanderIconField = new Image();
    commanderIconField.src = "images/note1.png";
    commanderIconField.onload = function () {
      nuiCommander.indicatorsBlocks.icons.push( this );
    };
  }

  /*
        // clear it first
        nuiCommander.indicatorsBlocks.icons = [];
        for (var x = 0; x < 64; x++) {
          var commanderIconField = new Image();
          commanderIconField.src = "images/note1.png";
          commanderIconField.onload = function () {
            nuiCommander.indicatorsBlocks.icons.push(this)
          }
        }
        */
}

loadNuiCommander();

/**
 *    var actions = this.window.interActionController
      var indicators = this.window.nuiCommander.indicatorsBlocks

      indicators.text[16] = "LOGIN"
      actions.main[2].onAction = function() {
        root.$root.$emit('googleApiLoginEvent', { start: 'start googleApiLoginEvent' })
      }

      var commanderIconField0 = new Image()
      commanderIconField0.src = "/assets/icons/svgs/solid/file-audio.svg"
      commanderIconField0.onload = function () {
        indicators.icons[0] = this
      }
 */
