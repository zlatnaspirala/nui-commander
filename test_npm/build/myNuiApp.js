(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _nuiCommander = require("nui-commander");

var nuiCommander = {};
nuiCommander.drawer = new _nuiCommander.canvasEngine(_nuiCommander.interActionController);
nuiCommander.drawer.draw();
nuiCommander.indicatorsBlocks = _nuiCommander.indicatorsBlocks;
nuiCommander.drawer.elements.push(nuiCommander.indicatorsBlocks);
nuiCommander.drawer.elements.push(new _nuiCommander.nuiMsgBox("Do you love this project?", function (answer) {
  console.log(answer);
  nuiCommander.drawer.removeElementByName("nuiMsgBox");

  if (answer == "yes") {
    console.log("Good answer is yes.");
    setTimeout(() => {
      nuiCommander.drawer.elements.push(new _nuiCommander.nuiMsgBox("Do you wanna to activate some commander options?", function (answer) {
        nuiCommander.drawer.removeElementByName("nuiMsgBox");

        if (answer == "yes") {
          alert("ok , interest idea.");
        }
      }));
    }, 100);
  } else {
    console.log("Ok good buy.");
    window.location.href = "https://google.com";
  }
}));
console.info("nui-commander controls attached.");

},{"nui-commander":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "indicatorsBlocks", {
  enumerable: true,
  get: function () {
    return _mainFunctionMenu.indicatorsBlocks;
  }
});
Object.defineProperty(exports, "canvasEngine", {
  enumerable: true,
  get: function () {
    return _canvasEngine.canvasEngine;
  }
});
Object.defineProperty(exports, "DetectBrowser", {
  enumerable: true,
  get: function () {
    return _helper.DetectBrowser;
  }
});
Object.defineProperty(exports, "interActionController", {
  enumerable: true,
  get: function () {
    return _controller.interActionController;
  }
});
Object.defineProperty(exports, "nuiMsgBox", {
  enumerable: true,
  get: function () {
    return _nuiMsgBox.nuiMsgBox;
  }
});

var _mainFunctionMenu = require("./scripts/controls/main-function-menu");

var _canvasEngine = require("./scripts/canvasEngine");

var _helper = require("./scripts/helper");

var _controller = require("./scripts/controller");

var _nuiMsgBox = require("./scripts/controls/nui-msg-box");

},{"./scripts/canvasEngine":3,"./scripts/controller":4,"./scripts/controls/main-function-menu":5,"./scripts/controls/nui-msg-box":6,"./scripts/helper":7}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canvasEngine = canvasEngine;

var _bufferLoad = require("./system/buffer-load");

var _helper = require("./helper");

function canvasEngine(interActionController, options) {
  if (typeof options === 'undefined') {
    options = {
      domVisual: false
    };
    this.options = options;
  }

  var root = this;
  root.interActionController = interActionController; // create dom element

  this.canvasDom = document.createElement("canvas");
  this.canvasDom.setAttribute("id", "drawer");
  this.canvasDom.setAttribute("width", "640px");
  this.canvasDom.setAttribute("height", "480px");
  this.canvasDom.setAttribute("style", "position: absolute;z-index:20;left: 0; top: 0;");
  this.ctx = this.canvasDom.getContext("2d");
  var content = (0, _helper.getDom)("nui-commander-container");
  content.appendChild(this.canvasDom);
  this.systemOnPause = false;
  this.elements = [];

  this.removeElementByName = function (name) {
    this.elements.forEach(function (item, index, array) {
      if (item.name == name) {
        array.splice(index, 1);
      }
    });
  };

  this.getCanvasWidth = function (per) {
    if (per == 0) {
      return 0;
    }

    return this.canvasDom.width / 100 * per;
  };

  this.getCanvasHeight = function (per) {
    if (per == 0) {
      return 0;
    }

    return this.canvasDom.height / 100 * per;
  };

  this.draw = function () {
    root.ctx.clearRect(0, 0, root.getCanvasWidth(100), root.getCanvasHeight(100));
    this.elements.forEach(function (element) {
      element.draw(root);
      element.update(root);
    });
    setTimeout(function () {
      root.draw();
    }, 20);
  }; // NUI STAFF


  var content = (0, _helper.getDom)("nui-commander-container");
  var video = (0, _helper.getDom)('webcam');
  this.blockIndicatorSize = 8;

  if (root.options.domVisual == true) {
    for (var j = 0; j < root.blockIndicatorSize * root.blockIndicatorSize; j++) {
      var domIndicator = document.createElement("div");
      domIndicator.setAttribute("id", "note" + j);
      domIndicator.setAttribute("class", "note");
      domIndicator.innerHTML = `
          <div class="gui-func-field" > field ` + j + ` </div>
      `;
      (0, _helper.getDom)("xylo").appendChild(domIndicator);
    }
  }

  var notesPosY = [];
  var notesPosX = [];

  function hasGetUserMedia() {
    // Note: Opera builds are unprefixed.
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  }

  if (hasGetUserMedia()) {
    console.log("hasGetUserMedia TRUE");
  } else {
    console.warn("hasGetUserMedia FALSE");
    return;
  }

  var webcamError = function (e) {
    alert('Webcam error!', e);
  };

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      video: true
    }).then(function (stream) {
      video.srcObject = stream;
      initialize();
    }, webcamError);
  } else if (navigator.getUserMedia) {
    navigator.getUserMedia({
      video: true
    }, function (stream) {
      video.srcObject = stream;
      initialize();
    }, webcamError);
  } else if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia({
      video: true
    }, function (stream) {
      video.srcObject = window.webkitURL.createObjectURL(stream);
      initialize();
    }, webcamError);
  } else {//video.src = 'somevideo.webm'; // fallback.
  }

  var AudioContext = window.AudioContext || window.webkitAudioContext || null;
  var timeOut, lastImageData;
  var canvasSource = (0, _helper.getDom)("canvas-source");
  var canvasBlended = (0, _helper.getDom)("canvas-blended");
  var contextSource = canvasSource.getContext('2d');
  var contextBlended = canvasBlended.getContext('2d');
  var soundContext;
  var bufferLoader;
  this.notes = []; // mirror video

  contextSource.translate(canvasSource.width, 0);
  contextSource.scale(-1, 1);
  var c = 5;

  function initialize() {
    if (!AudioContext) {
      alert("AudioContext not supported!");
    } else {
      setTimeout(loadSounds, 1000);
    }
  }

  function loadSounds() {
    soundContext = new AudioContext();
    bufferLoader = new _bufferLoad.BufferLoader(soundContext, ['sounds/note1.mp3', 'sounds/note2.mp3', 'sounds/note3.mp3', 'sounds/note4.mp3', 'sounds/note5.mp3', 'sounds/note6.mp3', 'sounds/note7.mp3', 'sounds/note8.mp3'], finishedLoading);
    bufferLoader.load();
  }

  function finishedLoading(bufferList) {
    for (var j = 0; j < root.blockIndicatorSize; j++) {
      for (var d = 0; d < root.blockIndicatorSize; d++) {
        notesPosX.push(d * root.getCanvasWidth(100) / root.blockIndicatorSize);
        notesPosY.push(j * root.getCanvasHeight(100) / root.blockIndicatorSize);
      }
    }

    for (var i = 0; i < root.blockIndicatorSize * root.blockIndicatorSize; i++) {
      var source = soundContext.createBufferSource();
      source.buffer = bufferList[i];
      source.connect(soundContext.destination);
      var note = null;

      if (root.options.domVisual == true) {
        note = {
          note: source,
          ready: true,
          visual: (0, _helper.getDom)("note" + i)
        };
      } else {
        note = {
          note: source,
          ready: true,
          visual: false
        };
      }

      note.area = {
        x: notesPosX[i],
        y: notesPosY[i],
        w: root.getCanvasWidth(100) / root.blockIndicatorSize,
        h: root.getCanvasHeight(100) / root.blockIndicatorSize,
        status: true
      };
      root.notes.push(note);
    }

    if (root.options.domVisual == false) {
      root.checkAreas = root.checkAreasOverride1;
    }

    start();
  }

  function playSound(obj) {
    if (!obj.ready) return;
    var source = soundContext.createBufferSource();
    source.buffer = obj.note.buffer;
    source.connect(soundContext.destination);
    source.start(0);
    obj.ready = false; // throttle the note

    setTimeout(setNoteReady, 400, obj);
  }

  function setNoteReady(obj) {
    obj.ready = true;
  }

  function start() {
    // getDom(canvasSource).delay(600).fadeIn();
    // getDom(canvasBlended).delay(600).fadeIn();
    root.update();
  }

  window.requestAnimFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  }();

  this.update = function () {
    if (!root.systemOnPause) {
      root.drawVideo();
      root.blend();
      root.checkAreas();
      requestAnimFrame(root.update);
    }
  };

  this.drawVideo = function () {
    contextSource.drawImage(video, 0, 0, video.width, video.height);
  };

  this.blend = function () {
    var width = canvasSource.width;
    var height = canvasSource.height; // get webcam image data

    var sourceData = contextSource.getImageData(0, 0, width, height); // create an image if the previous image doesn’t exist

    if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, width, height); // create a ImageData instance to receive the blended result

    var blendedData = contextSource.createImageData(width, height); // blend the 2 images

    differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data); // draw the result in a canvas

    contextBlended.putImageData(blendedData, 0, 0); // store the current webcam image

    lastImageData = sourceData;
  };

  function fastAbs(value) {
    // funky bitwise, equal Math.abs
    return (value ^ value >> 31) - (value >> 31);
  }

  function threshold(value) {
    return value > 0x15 ? 0xFF : 0;
  }

  function difference(target, data1, data2) {
    // blend mode difference
    if (data1.length != data2.length) return null;
    var i = 0;

    while (i < data1.length * 0.25) {
      target[4 * i] = data1[4 * i] == 0 ? 0 : fastAbs(data1[4 * i] - data2[4 * i]);
      target[4 * i + 1] = data1[4 * i + 1] == 0 ? 0 : fastAbs(data1[4 * i + 1] - data2[4 * i + 1]);
      target[4 * i + 2] = data1[4 * i + 2] == 0 ? 0 : fastAbs(data1[4 * i + 2] - data2[4 * i + 2]);
      target[4 * i + 3] = 0xFF;
      ++i;
    }
  }

  function differenceAccuracy(target, data1, data2) {
    if (data1.length != data2.length) return null;
    var i = 0;

    while (i < data1.length * 0.25) {
      var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
      var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
      var diff = threshold(fastAbs(average1 - average2));
      target[4 * i] = diff;
      target[4 * i + 1] = diff;
      target[4 * i + 2] = diff;
      target[4 * i + 3] = 0xFF;
      ++i;
    }
  }

  this.checkAreas = function () {
    // loop over the note areas
    for (var r = 0; r < root.notes.length; ++r) {
      if (root.notes[r].area.status == true) {
        var blendedData = contextBlended.getImageData(root.notes[r].area.x, root.notes[r].area.y, root.notes[r].area.w, root.notes[r].area.h);
        var i = 0;
        var average = 0; // loop over the pixels

        while (i < blendedData.data.length * 0.25) {
          // make an average between the color channel
          average += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]) / 3;
          ++i;
        } // calculate an average between of the color values of the note area


        average = Math.round(average / (blendedData.data.length * 0.25));

        if (average > 10) {
          // over a small limit, consider that a movement is detected
          // play a note and show a visual feedback to the user
          playSound(root.notes[r]);

          if (root.notes[r].visual) {
            root.notes[r].visual.style.opacity = 1;
          }

          if (typeof root.interActionController.main[r] !== 'undefined' && typeof root.interActionController.main[r].action !== 'undefined') {
            root.interActionController.main[r].action();
          }
        } else {
          if (root.notes[r].visual.style.opacity <= 0) {
            root.notes[r].visual.style.opacity = 0;
          } else {
            root.notes[r].visual.style.opacity -= 0.1;
          }
        }
      }
    }
  };

  this.checkAreasOverride1 = function () {
    for (var r = 0; r < root.notes.length; ++r) {
      if (root.notes[r].area.status == true) {
        var blendedData = contextBlended.getImageData(root.notes[r].area.x, root.notes[r].area.y, root.notes[r].area.w, root.notes[r].area.h);
        var i = 0;
        var average = 0;

        while (i < blendedData.data.length * 0.25) {
          average += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]) / 3;
          ++i;
        }

        average = Math.round(average / (blendedData.data.length * 0.25));

        if (average > 10) {
          playSound(root.notes[r]);

          if (typeof root.interActionController.main[r] !== 'undefined' && typeof root.interActionController.main[r].action !== 'undefined') {
            root.interActionController.main[r].action();
          }
        } else {
          /*
          if (root.notes[r].visual.style.opacity <= 0) {
            root.notes[r].visual.style.opacity = 0;
          } else {
            root.notes[r].visual.style.opacity -= 0.1;
          }
          */
        }
      }
    }
  };
}

},{"./helper":7,"./system/buffer-load":8}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interActionController = void 0;

var _bufferLoad = require("./system/buffer-load");

var interActionController = {
  main: []
};
exports.interActionController = interActionController;

for (var x = 0; x < 64; x++) {
  interActionController.main.push(new _bufferLoad.modelBlock(x));
}

interActionController.main[0].onAction = function () {
  console.log("Default command ... ", this.status);
};

},{"./system/buffer-load":8}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.indicatorsBlocks = void 0;

/**
 * @description Inline code used to make easy default setup.
 * For opacity, text, icons(images).
 * No draws for empty string
 */
let indicatorsBlocks = {
  name: "this",
  shemaX: 8,
  shemaY: 8,
  opacity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  text: ["HOME", "free", "", "", "", "", "", "ADD SOMETHING", "CONTROL 1", "", "", "", "", "", "", "", "CONTROL 2", "", "", "", "", "", "", "", "CONTROL 3", "", "", "", "", "", "", "", "CONTROL 4", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  iconsStyle: {
    localScale: 0
  },
  icons: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  draw: function (engine) {
    var c = 0;
    engine.ctx.save();

    for (var j = 0; j < this.shemaX; j++) {
      for (var i = 0; i < this.shemaY; i++) {
        if (typeof engine.interActionController.main[c] !== 'undefined' && engine.interActionController.main[c].status == true) {
          this.opacity[c] = this.opacity[c] + 0.02;
          engine.ctx.fillStyle = "rgba(250, 250, 100, " + this.opacity[c] + " )";
          engine.ctx.fillRect(engine.getCanvasWidth(100) / this.shemaX * i, engine.getCanvasHeight(100) / this.shemaY * j, engine.getCanvasWidth(100) / this.shemaX, engine.getCanvasHeight(100) / this.shemaY);
        } else {
          engine.ctx.fillStyle = "rgba(250, 250, 100, " + this.opacity[c] + " )";
          engine.ctx.fillRect(engine.getCanvasWidth(100) / this.shemaX * i, engine.getCanvasHeight(100) / this.shemaY * j, engine.getCanvasWidth(100) / this.shemaX, engine.getCanvasHeight(100) / this.shemaY);
        }
        /* Disabled
         engine.ctx.strokeRect(
          engine.getCanvasWidth(100) / this.shemaX * j,
          engine.getCanvasHeight(100) / this.shemaY * i,
          engine.getCanvasWidth(100) / this.shemaX,
          engine.getCanvasHeight(100) / this.shemaY);
        */


        var localScale = this.iconsStyle.localScale; // draw icons

        if (typeof this.icons[c] !== 'undefined' && this.icons[c] !== null) {
          engine.ctx.drawImage(this.icons[c], engine.getCanvasWidth(100) / this.shemaX * i + localScale, engine.getCanvasHeight(100) / this.shemaY * j + localScale, engine.getCanvasWidth(100) / this.shemaX - 2 * localScale, engine.getCanvasHeight(100) / this.shemaY - 2 * localScale);
        } else if (this.text[c] != '') {
          // For improve                          text opacity
          engine.ctx.fillStyle = "rgba(250, 100, 100, 1)";
          engine.ctx.fillRect(engine.getCanvasWidth(100) / this.shemaX * j, engine.getCanvasHeight(100) / this.shemaY * i, engine.getCanvasWidth(100) / this.shemaX, engine.getCanvasHeight(2.1));
          engine.ctx.fillStyle = "black";
          engine.ctx.font = "16px arial";
          engine.ctx.fillText(this.text[c], engine.getCanvasWidth(100) / this.shemaX * j, engine.getCanvasHeight(100) / this.shemaY * i + 10, engine.getCanvasWidth(12.5), engine.getCanvasHeight(12.5));
        }

        c++;
      }
    }

    engine.ctx.restore();
  },
  update: function () {
    this.opacity.forEach(function (item, index, array) {
      if (item > 0) {
        array[index] = array[index] - 0.004;
      } else {
        array[index] = 0;
      }
    });
  }
};
exports.indicatorsBlocks = indicatorsBlocks;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nuiMsgBox = nuiMsgBox;

function nuiMsgBox(textMsg, callback) {
  this.name = "nuiMsgBox";
  this.sensitivity = "mid";
  this.callback = callback;
  this.shemaX = 8;
  this.shemaY = 8;
  this.yesText = "YES";
  this.noText = "NO";
  this.messageText = textMsg;
  this.myOpacity = 0.3;

  this.draw = function (engine) {
    engine.ctx.save();
    engine.ctx.fillStyle = "rgba(10, 150, 110, " + this.myOpacity + " )";
    engine.ctx.fillRect(engine.getCanvasWidth(100) / this.shemaX * 1, engine.getCanvasHeight(100) / this.shemaY * 1, engine.getCanvasWidth(100) / this.shemaX * 6, engine.getCanvasHeight(100) / this.shemaY * 2);
    engine.ctx.fillStyle = "black";
    engine.ctx.font = "30px sans-serif";
    engine.ctx.fillText(this.messageText, engine.getCanvasWidth(100) / this.shemaX * 2, engine.getCanvasHeight(100) / this.shemaY * 1.5, engine.getCanvasWidth(35), engine.getCanvasHeight(9));
    engine.ctx.fillStyle = "rgba(210, 50, 110, " + this.myOpacity + " )";
    engine.ctx.fillRect(engine.getCanvasWidth(100) / this.shemaX * 1, engine.getCanvasHeight(100) / this.shemaY * 2, engine.getCanvasWidth(100) / this.shemaX * 3, engine.getCanvasHeight(100) / this.shemaY * 1);
    engine.ctx.fillStyle = "white";
    engine.ctx.fillText(this.yesText, engine.getCanvasWidth(100) / this.shemaX * 2, engine.getCanvasHeight(100) / this.shemaY * 2.7, engine.getCanvasWidth(15), engine.getCanvasHeight(9));
    engine.ctx.fillStyle = "rgba(210, 90, 110, " + this.myOpacity + " )";
    engine.ctx.fillRect(engine.getCanvasWidth(100) / this.shemaX * 4, engine.getCanvasHeight(100) / this.shemaY * 2, engine.getCanvasWidth(100) / this.shemaX * 3, engine.getCanvasHeight(100) / this.shemaY * 1);
    engine.ctx.fillStyle = "black";
    engine.ctx.fillText(this.noText, engine.getCanvasWidth(100) / this.shemaX * 5.1, engine.getCanvasHeight(100) / this.shemaY * 2.7, engine.getCanvasWidth(35), engine.getCanvasHeight(9));
    engine.ctx.restore();
  };

  this.update = function (engine) {
    var y1 = engine.interActionController.main[17].status;
    var y2 = engine.interActionController.main[18].status;
    var y3 = engine.interActionController.main[19].status;
    var n1 = engine.interActionController.main[20].status;
    var n2 = engine.interActionController.main[21].status;
    var n3 = engine.interActionController.main[22].status;

    if (this.sensitivity === "mid") {
      if (n1 === true && n2 === true || n2 === true && n3 === true) {
        console.log("MsgBox answer is no.");
        this.callback("no");
      }

      if (y1 === true && y2 === true || y2 === true && y3 === true) {
        console.log("MsgBox answer is yes.");
        this.callback("yes");
      }
    }
  };
}

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DetectBrowser = DetectBrowser;
exports.getDom = getDom;
exports.asyncLoad = asyncLoad;
exports.SCRIPT = void 0;

function DetectBrowser() {
  var HREFF,
      HREFTXT = "unknown";
  this.NAVIGATOR = navigator.userAgent;
  var NAV = navigator.userAgent;
  var gecko, navIpad, operatablet, navIphone, navFirefox, navChrome, navOpera, navSafari, navandroid, mobile, navMozilla, navUbuntu, navLinux;
  navLinux = NAV.match(/Linux/gi);
  navUbuntu = NAV.match(/Ubuntu/gi);
  gecko = NAV.match(/gecko/gi);
  navOpera = NAV.match(/Opera|OPR\//) ? true : false;
  operatablet = NAV.match(/Tablet/gi);
  navIpad = NAV.match(/ipad/gi);
  navIphone = NAV.match(/iphone/gi);
  navFirefox = NAV.match(/Firefox/gi);
  navMozilla = NAV.match(/mozilla/gi);
  navChrome = NAV.match(/Chrome/gi);
  navSafari = NAV.match(/safari/gi);
  navandroid = NAV.match(/android/gi);
  mobile = NAV.match(/mobile/gi);
  window["TYPEOFANDROID"] = 0;
  window["NOMOBILE"] = 0;
  var mobile = /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase());

  if (mobile) {
    var userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.search("android") > -1 && userAgent.search("mobile") > -1) {
      console.log("ANDROID MOBILE");
    } else if (userAgent.search("android") > -1 && !(userAgent.search("mobile") > -1)) {
      console.log(" ANDROID TABLET ");
      TYPEOFANDROID = 1;
    }
  } else {
    NOMOBILE = 1;
  } //  FIREFOX za android


  if (navFirefox && navandroid && TYPEOFANDROID == 0) {
    HREFF = "#";
    HREFTXT = "mobile_firefox_android";
  } //  FIREFOX za android T


  if (navFirefox && navandroid && TYPEOFANDROID == 1) {
    HREFF = "#";
    HREFTXT = "mobile_firefox_android_tablet";
  } // OPERA ZA ANDROID


  if (navOpera && navandroid) {
    HREFF = "#";
    HREFTXT = "opera_mobile_android";
  } // provera
  // OPERA ZA ANDROID TABLET


  if (navOpera && navandroid && operatablet) {
    HREFF = "#";
    HREFTXT = "opera_mobile_android_tablet";
  } // provera
  //  safari mobile za IPHONE - i  safari mobile za IPAD i CHROME za IPAD


  if (navSafari) {
    var Iphonesafari = NAV.match(/iphone/gi);

    if (Iphonesafari) {
      HREFF = "#";
      HREFTXT = "safari_mobile_iphone";
    } else if (navIpad) {
      HREFF = "#";
      HREFTXT = "mobile_safari_chrome_ipad";
    } else if (navandroid) {
      HREFF = "#";
      HREFTXT = "android_native";
    }
  } // TEST CHROME


  if (navChrome && navSafari && navMozilla && TYPEOFANDROID == 1) {
    HREFF = "#";
    HREFTXT = "mobile_chrome_android_tablet";
  }

  if (navChrome && navSafari && navMozilla && TYPEOFANDROID == 0) {
    HREFF = "#";
    HREFTXT = "mobile_chrome_android";
  }

  if (navChrome && TYPEOFANDROID == 0) {
    HREFF = "#";
    HREFTXT = "chrome_browser";
  }

  if (navMozilla && NOMOBILE == 1 && gecko && navFirefox) {
    HREFF = "#";
    HREFTXT = "firefox_desktop";
  }

  if (navOpera && TYPEOFANDROID == 0 && !mobile) {
    HREFF = "#";
    HREFTXT = "opera_desktop";
  } //linux


  if (navUbuntu && navMozilla && navFirefox && navLinux) {
    HREFF = "#";
    HREFTXT = "firefox_desktop_linux";
  }

  if (navMozilla && navLinux && navChrome && navSafari) {
    HREFF = "#";
    HREFTXT = "chrome_desktop_linux";
  }

  if (navMozilla && navLinux && navChrome && navSafari && navOpera) {
    HREFF = "#";
    HREFTXT = "opera_desktop_linux";
  }
  /**
   * @description Template for this view's container...
   * NOMOBILE = 1 means desktop platform
   * This is ENUMERATORS for property NAME :
   * "mobile_firefox_android"
   * "mobile_firefox_android_tablet"
   * "opera_mobile_android"
   * "opera_mobile_android_tablet"
   * "safari_mobile_iphone"
   * "mobile_safari_chrome_ipad"
   * "android_native"
   * "mobile_chrome_android_tablet"
   * "mobile_chrome_android"
   * "chrome_browser"
   * "firefox_desktop"
   * "opera_desktop"
   * "firefox_desktop_linux"
   * "chrome_desktop_linux"
   * "opera_desktop_linux" .
   * @property NAME
   * @type {String}
   * @default "unknown"
   */


  this.NAME = HREFTXT;
  /**
   * NOMOBILE = 1 Means desktop platform (Any win , mac or linux etc..)
   * NOMOBILE = 2 Means mobile platform (iOS , android etc.)
   * @property NOMOBILE
   * @type Number
   * @default "unknown"
   */

  this.NOMOBILE = NOMOBILE;
}

function getDom(id) {
  return document.getElementById(id);
}

var SCRIPT = {
  SCRIPT_ID: 0,
  SINHRO_LOAD: {},
  LOAD: function addScript(src) {
    var s = document.createElement("script");

    s.onload = function () {
      SCRIPT.SCRIPT_ID++;
      console.log("Script id loaded : " + SCRIPT.SCRIPT_ID + " with src : " + this.src);
    };

    s.setAttribute("src", src);
    document.body.appendChild(s);
  }
};
exports.SCRIPT = SCRIPT;

function asyncLoad(path, callback) {
  if (typeof callback === "undefined") {
    callback = function () {};
  }

  var nuiScript = document.createElement("script");
  nuiScript.src = path;
  document.head.appendChild(nuiScript);

  nuiScript.onload = function () {
    callback();
  };
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BufferLoader = BufferLoader;
exports.modelBlock = modelBlock;

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  var loader = this;

  request.onload = function () {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(request.response, function (buffer) {
      if (!buffer) {
        alert('error decoding file data: ' + url);
        return;
      }

      loader.bufferList[index] = buffer;
      if (++loader.loadCount == loader.urlList.length) loader.onload(loader.bufferList);
    });
  };

  request.onerror = function () {
    alert('BufferLoader: XHR error');
  };

  request.send();
};

BufferLoader.prototype.load = function () {
  for (var i = 0; i < this.urlList.length; ++i) this.loadBuffer(this.urlList[i], i);
};

function modelBlock(x) {
  this.index = x;
  this.status = false;

  this.action = function () {
    var localRoot = this;
    setTimeout(function () {
      localRoot.status = false;
    }, 350);

    if (localRoot.status == false) {
      this.onAction();
      this.status = true;
    }
  }; // For override


  this.onAction = function () {};
}

},{}]},{},[1]);
