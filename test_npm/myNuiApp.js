import {
  indicatorsBlocks,
  CanvasEngine,
  interActionController,
  NuiMsgBox } from "nui-commander";

var nuiCommander = {};
nuiCommander.drawer = new CanvasEngine( interActionController );
nuiCommander.drawer.draw();

nuiCommander.indicatorsBlocks = indicatorsBlocks;
nuiCommander.drawer.elements.push( nuiCommander.indicatorsBlocks );

nuiCommander.drawer.elements.push(
  new NuiMsgBox( "Do you love this project?", function ( answer ) {
    console.log( answer );
    nuiCommander.drawer.removeElementByName( "NuiMsgBox" );
    if (answer == "yes") {
      console.log( "Good answer is yes." );
      setTimeout( () => {
        nuiCommander.drawer.elements.push(
          new NuiMsgBox(
            "Do you wanna to activate some commander options?",
            function (answer) {
              nuiCommander.drawer.removeElementByName( "NuiMsgBox" );
              if (answer == "yes") {
                alert("ok , interest idea.");
              }
            }
          )
        );
      }, 100);
    } else {
      console.log( "Ok good buy." );
      window.location.href = "https://google.com";
    }
  } )
);

console.info( "nui-commander controls attached." );