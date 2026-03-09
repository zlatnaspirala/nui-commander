# nui-commander

> Control your UI with nothing but your hands in the air.

Version 1.0.0

**nui-commander** is a browser-based motion detection framework that turns a webcam feed into a gesture-driven UI system. It detects movement in a live video stream and maps it to an 8×8 grid of interaction zones — each zone can trigger actions, animate canvas elements, or drive any custom logic you wire up.

The interface renders directly on top of the video in an **augmented reality** style — no mouse, no touch, no keyboard required.

![screenshot](https://github.com/zlatnaspirala/nui-commander/blob/master/source/screenshot.jpg)

---

## How it works

The canvas engine continuously diffs successive webcam frames. When movement is detected in a grid zone, that zone's opacity accumulates and its action fires. When the zone goes idle, opacity fades back to zero. Everything runs on the main thread at low CPU cost — no WASM, no heavy ML models required.

---

## Quick Start

### `index.html`

```html
<html>
<head>
  <link rel="stylesheet" href="css/style.css">
  <script type="module" src="myNuiApp.js"></script>
</head>
<body>
  <div id="container">
    <div id="nui-commander-container">
      <video id="webcam" autoplay width="640" height="480"></video>
      <canvas id="canvas-source" width="640" height="480"></canvas>
      <canvas id="canvas-blended" width="640" height="480" style="display:none;"></canvas>
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
  CanvasEngine,
  interActionController,
  NuiMsgBox
} from "nui-commander";

const nuiCommander = {};
nuiCommander.drawer = new CanvasEngine(interActionController);
nuiCommander.drawer.draw();

// Add the default 8×8 grid overlay
nuiCommander.indicatorsBlocks = indicatorsBlocks;
nuiCommander.drawer.elements.push(nuiCommander.indicatorsBlocks);

// Push a gesture-driven message box
nuiCommander.drawer.elements.push(
  new NuiMsgBox("Do you love this project?", function(answer) {
    nuiCommander.drawer.removeElementByName("NuiMsgBox");

    if (answer === "yes") {
      setTimeout(() => {
        nuiCommander.drawer.elements.push(
          new NuiMsgBox("Activate commander options?", function(answer) {
            nuiCommander.drawer.removeElementByName("NuiMsgBox");
            if (answer === "yes") alert("Great, let's go!");
          })
        );
      }, 100);
    } else {
      window.location.href = "https://google.com";
    }
  })
);

console.info("nui-commander controls attached.");
```

---

## Built-in Controls

All controls share the same interface — push them into `engine.elements` and they handle their own drawing and update loop.

| Control | Description |
|---|---|
| `NuiMsgBox` | Yes / No confirmation dialog |
| `NuiMenu` | Vertical list with dwell selection |
| `NuiRadialMenu` | Circular sector menu, columns mapped to sectors |
| `NuiSlider` | Horizontal value control via left / right zones |
| `NuiToggle` | Single zone on/off flip with animated pill |
| `NuiToast` | Timed notification, fades in and out automatically |
| `NuiCursor` | Tracks center of mass of active zones as a smooth cursor |
| `NuiFaceDetect` | HUD overlay using native browser `FaceDetector` API (Must be activated from chrome://flags)|
| `indicatorsBlocks` | Default 8×8 grid overlay with opacity, text, and icon support |

---

## Tile / Mask visual area

You can replace the default grid highlight with custom tile images to create a textured background mask:

```js
nuiCommander.indicatorsBlocks.icons = [];

for (let x = 0; x < 64; x++) {
  const tile = new Image();
  tile.src = "images/tile.png";
  tile.onload = function() {
    nuiCommander.indicatorsBlocks.icons.push(this);
  };
}
```

---

## Objectives

- Works in Chrome, Opera, Safari, Firefox and all mobile browsers
- Webcam motion detection with no server-side processing
- Low CPU footprint — pure canvas diffing, no heavy dependencies
- Composable element system — push any control into the engine and it just works
- Clean input/output event model — easy to integrate into any existing app

---

## Used In

### [vuletube](https://github.com/zlatnaspirala/nui-commander/blob/master/source/nui-commander-vuletube.png)

![vuletube screenshot](https://github.com/zlatnaspirala/nui-commander/blob/master/source/nui-commander-vuletube.png)

### [vue-typescript-starter](https://github.com/zlatnaspirala/vue-typescript-starter)

nui-commander is used as a git submodule in this Vue + TypeScript boilerplate project.

---

## Licence & Credits

MIT Nikola Lukic zlatnaspirala@gmail.com
MIT — based on [magic-xylophone](https://github.com/soundstep/magic-xylophone) by soundstep.
