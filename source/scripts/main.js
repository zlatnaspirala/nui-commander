
/**
 * Main file for creating instances.
 *
 */

 app = {};

 window.onload = function() {

  var browser = new detectBrowser();
  app.drawer = new canvasEngine(interActionController);
  app.drawer.draw();
  SCRIPT.LOAD("scripts/controls/main-function-menu.js");

 }


