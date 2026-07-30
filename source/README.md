# nui-commander

> Control your UI with nothing but your hands in the air.

Version 1.1.13

**nui-commander** is a browser-based motion detection framework that turns a webcam feed into a gesture-driven UI system. It detects movement in a live video stream and maps it to an 8×8 grid of interaction zones — each zone can trigger actions, animate canvas elements, or drive any custom logic you wire up.

The interface renders directly on top of the video in an **augmented reality** style — no mouse, no touch, no keyboard required.

![screenshot](https://github.com/zlatnaspirala/nui-commander/blob/master/source/screenshot.jpg)

---

## How it works

The canvas engine continuously diffs successive webcam frames. When movement is detected in a grid zone, that zone's opacity accumulates and its action fires. When the zone goes idle, opacity fades back to zero. Everything runs on the main thread at low CPU cost — no WASM, no heavy ML models required.

---

## Quick Start

### `index.html`
Minimum:
```html
  <div id="nui-commander-container">
    <video id="webcam" autoplay width="640" height="480"></video>
    <canvas id="canvas-source" width="640" height="480"></canvas>
    <canvas id="canvas-blended" width="640" height="480" style="display:none;"></canvas>
    <div id="xylo"></div>
  </div>
```

### How to use it from npm service.

```js

import {
  indicatorsBlocks,
  CanvasEngine,
  interActionController,
  NuiMsgBox,
  NuiCursor,
  NuiMenu,
  NuiSlider,
  NuiButton
} from "nui-commander";

  // This is from matrix-engine-wgpu engine.
  // import {createNuiContainer} from "../../../src/engine/buildin/adapter-nui-commander.js";

  byId('nui-commander-container').style.left = '10%';
  byId('nui-commander-container').style.top = '40%'

  var nuiCommander = {};
  // NUI PART START
  nuiCommander.drawer = new CanvasEngine(interActionController);
  nuiCommander.drawer.draw();

  nuiCommander.indicatorsBlocks = indicatorsBlocks;
  nuiCommander.drawer.elements.push(nuiCommander.indicatorsBlocks);

  nuiCommander.indicatorsBlocks.text[7] = '';

  const cursor = new NuiCursor({color: "255, 80, 80"});
  nuiCommander.drawer.elements.push(cursor);

  const slider = new NuiSlider("Bloom Intesity", {
    row: 2, value: 1, onChange: v => {
      // console.log('test')
      app.bloomPass.setIntensity(v)
    }
  });

  const sliderBloomRad = new NuiSlider("Bloom Blur", {
    row: 4, value: 1, onChange: v => {
      // console.log('test')
      app.bloomPass.setBlurRadius(v)
    }
  });

  const hideSliderBloom = new NuiButton('hide', () => {
    nuiCommander.drawer.removeElement(slider);
    nuiCommander.drawer.removeElement(sliderBloomRad);
    nuiCommander.drawer.removeElement(hideSliderBloom);
    // bring the menu back
    nuiCommander.drawer.elements.push(menu);
  }, {col: 3, row: 0, cols: 2, rows: 1, sensitivity: 'low', bgColor: '#121234', textColor: "white"}
  )

  const menu = new NuiMenu([
    {
      label: "Light red", action: () => {
        app.lightContainer[0].setColor([100, 1, 0])
      }
    },
    {
      label: "Light green", action: () => {
        app.lightContainer[0].setColor([0, 100, 1])
      }
    },
    {
      label: "Volumetric", action: () => {
        app.activateVolumetricEffect({
          density: 0.5,
          steps: 30,
          scatterStrength: 2,
          heightFalloff: 0.2,
          lightColor: [0, 1.8, 10]
        })
      }
    },
    {
      label: "Bloom settings", action: () => {
        nuiCommander.drawer.removeElement(menu);
        nuiCommander.drawer.elements.push(slider);
        nuiCommander.drawer.elements.push(sliderBloomRad);
        nuiCommander.drawer.elements.push(hideSliderBloom);
      }
    }
  ], {
    col: 0,
    cols: 2,
    startRow: 0,
    dwellMs: 200,
    color: "255, 160, 255",
    accentColor: "255, 80, 120",
    onSelect: (item, i) => console.log("selected:", item.label)
  });

  nuiCommander.drawer.elements.push(menu);

  app.nui = nuiCommander;
  console.info("nui-commander controls attached.");

  // NUI PART END
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

[![Watch the video](https://www.youtube.com/watch?v=Z5BvZvprzRM)](https://www.youtube.com/watch?v=Z5BvZvprzRM)

Example used in The Beast engine:

```js
    byId('nui-commander-container').style.left = '10%';
    byId('nui-commander-container').style.top = '40%'

    var nuiCommander = {};
    // NUI PART START
    nuiCommander.drawer = new CanvasEngine(interActionController, {domVisual: false, width: 640, height: 480});
    nuiCommander.drawer.draw();

    nuiCommander.indicatorsBlocks = indicatorsBlocks;
    nuiCommander.drawer.elements.push(nuiCommander.indicatorsBlocks);

    nuiCommander.indicatorsBlocks.text[7] = '';

    const cursor = new NuiCursor({color: "255, 80, 80"});
    nuiCommander.drawer.elements.push(cursor);

    const slider = new NuiSlider("Bloom Intesity", {
      row: 2, value: 1, onChange: v => {
        // agnostic
        // app.bloomPass.setIntensity(v)
      }
    });

    const sliderBloomRad = new NuiSlider("Bloom Blur", {
      row: 4, value: 1, onChange: v => {
        // agnostic
        // app.bloomPass.setBlurRadius(v)
      }
    });

    const hideSliderBloom = new NuiButton('hide', () => {
      nuiCommander.drawer.removeElement(slider);
      nuiCommander.drawer.removeElement(sliderBloomRad);
      nuiCommander.drawer.removeElement(hideSliderBloom);
      // bring the menu back
      nuiCommander.drawer.elements.push(menu);
    }, {col: 3, row: 0, cols: 2, rows: 1, sensitivity: 'low', bgColor: '#121234', textColor: "white"}
    )

    const menu = new NuiMenu([
      {
        label: "Light red", action: () => {
          // agnostic
          // app.lightContainer[0].setColor([100, 1, 0])
        }
      },
      {
        label: "Light green", action: () => {
          // agnostic
          // app.lightContainer[0].setColor([0, 100, 1])
        }
      },
      {
        label: "Volumetric", action: () => {
          // agnostic
          // app.activateVolumetricEffect({
          //   density: 0.5,
          //   steps: 30,
          //   scatterStrength: 2,
          //   heightFalloff: 0.2,
          //   lightColor: [0, 1.8, 10]
          // })
        }
      },
      {
        label: "Bloom settings", action: () => {
          nuiCommander.drawer.removeElement(menu);
          nuiCommander.drawer.elements.push(slider);
          nuiCommander.drawer.elements.push(sliderBloomRad);
          nuiCommander.drawer.elements.push(hideSliderBloom);
        }
      },
      // {
      //   label: "Set pos Z", action: () => {
      //     console.log( "cursor pos : " + cursor.y )
      //     // app.matrixPhysics.explodeAll([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      //     //   0, 0, -20, 15.0, 20.0);
      //   }
      // },
    ], {
      col: 0,
      cols: 2,
      startRow: 0,
      dwellMs: 200,
      color: "255, 160, 255",
      accentColor: "255, 80, 120",
      onSelect: (item, i) => console.log("selected:", item.label)
    });

    nuiCommander.drawer.elements.push(menu);

    app.nui = nuiCommander;
    console.info("nui-commander controls attached.");

    // NUI PART END
```
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
MIT — based on :
[magic-xylophone](https://github.com/soundstep/magic-xylophone) by soundstep.
