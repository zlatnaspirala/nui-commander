
# nui-commander
 Motion detect on video stream is used to create and control UI Menu system with basic GUI controls, actions-events, popup or creating dom element or canvas staff.
 Interface must be drawn on video tag in `AR` manner.
 Objective is to create total manipulation only with your hands in the air with minimum CPU price usage.

![screenshot](https://github.com/zlatnaspirala/nui-commander/blob/master/screenshot.jpg)

On canvas indicator table blocks canvas object will accumulate movement action and after some little period on idle it ill fall to the opacity `0`. This is just example of usage!


## Whole Example
### `Branch two Message Box NUI with two button options yes or no`

### `index.html`
```html
<html>
<head>
  <link rel="stylesheet" href="css/style.css">
  <script type="module" src="myNuiApp.js" ></script>
</head>
<body>
  <div id="container">
    <div id="nui-commander-container">
      <video id="webcam" autoplay width="640" height="480"></video>
      <canvas id="canvas-source" width="640" height="480"></canvas>
      <canvas id="canvas-blended" width="640" height="480" style="display: none;"></canvas>
      <div id="xylo"></div>
    </div>
  </div>
</body>
</html>
```

### `myNuiApp.js`
```js
  import {
    indicatorsBlocks,
    canvasEngine,
    interActionController,
    nuiMsgBox } from "nui-commander";

  var nuiCommander = {};
  nuiCommander.drawer = new canvasEngine( interActionController );
  nuiCommander.drawer.draw();

  nuiCommander.indicatorsBlocks = indicatorsBlocks;
  nuiCommander.drawer.elements.push( nuiCommander.indicatorsBlocks );

  nuiCommander.drawer.elements.push(
    new nuiMsgBox( "Do you love this project?", function ( answer ) {
      console.log( answer );
      nuiCommander.drawer.removeElementByName( "nuiMsgBox" );
      if (answer == "yes") {
        console.log( "Good answer is yes." );
        setTimeout( () => {
          nuiCommander.drawer.elements.push(
            new nuiMsgBox(
              "Do you wanna to activate some commander options?",
              function (answer) {
                nuiCommander.drawer.removeElementByName( "nuiMsgBox" );
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
```
<br/>

## Example for mask
#### `Adding Block partial backgrounds`
```js
nuiCommander.indicatorsBlocks.icons = [];
for ( var x = 0; x < 64; x++ ) {
  var commanderIconField = new Image();
  commanderIconField.src = "images/tile.png";
  commanderIconField.onload = function () {
    nuiCommander.indicatorsBlocks.icons.push( this );
  };
}
```
![screenshot](https://github.com/zlatnaspirala/nui-commander/blob/master/images.jpg)


## Objective:

   - web instance [priory]
       - must work on chrome, opera, safari, firefox and all mobile versions.
       - video stream basic movement motion detect
       - make small canvas object drawer and create interface and logic for actions(some method call)
       - must have a excellent input output logic to be reusable in many ways.


### nui-commander user in vuletube:

![screenshot](https://github.com/zlatnaspirala/nui-commander/blob/master/nui-commander-vuletube.png)
### Nui-commander used like submodules in
### https://github.com/zlatnaspirala/vue-typescript-starter 

<br/>
<br/>


## LICENCE:
### Based on project:
### https://github.com/soundstep/magic-xylophone MIT
