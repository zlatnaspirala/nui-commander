import {BufferLoader} from "./system/buffer-load";
import {getDom} from "./helper";

export class CanvasEngine {

  constructor(interActionController, options = {domVisual: false}) {
    this.options = options;
    this.interActionController = interActionController;

    // Canvas setup
    this.canvasDom = document.createElement("canvas");
    this.canvasDom.id = "drawer";
    this.canvasDom.width = 640;
    this.canvasDom.height = 480;
    this.canvasDom.style.cssText = "position:absolute;z-index:20;left:0;top:0;";
    this.ctx = this.canvasDom.getContext("2d");
    getDom("nui-commander-container").appendChild(this.canvasDom);

    this.systemOnPause = false;
    this.elements = [];
    this.notes = [];

    this.blockIndicatorSize = 8;

    // Cache canvas dimensions (avoids repeated DOM reads)
    this._canvasW = this.canvasDom.width;
    this._canvasH = this.canvasDom.height;

    // Precompute block cell dimensions
    this._cellW = this._canvasW / this.blockIndicatorSize;
    this._cellH = this._canvasH / this.blockIndicatorSize;

    // Blending state
    this._lastImageData = null;

    // Source/blended canvas references
    this._canvasSource = getDom("canvas-source");
    this._canvasBlended = getDom("canvas-blended");
    this._ctxSource = this._canvasSource.getContext("2d", {willReadFrequently: true});
    this._ctxBlended = this._canvasBlended.getContext("2d", {willReadFrequently: true});

    // Mirror video horizontally
    this._ctxSource.translate(this._canvasSource.width, 0);
    this._ctxSource.scale(-1, 1);

    // requestAnimationFrame polyfill
    window.requestAnimFrame = (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      ((cb) => window.setTimeout(cb, 1000 / 60))
    );

    // Reusable diff buffer (avoids allocation every frame)
    this._blendedData = this._ctxSource.createImageData(
      this._canvasSource.width,
      this._canvasSource.height
    );

    // Build DOM indicators if domVisual is on
    if(this.options.domVisual) {
      for(let j = 0;j < this.blockIndicatorSize ** 2;j++) {
        const domIndicator = document.createElement("div");
        domIndicator.id = "note" + j;
        domIndicator.className = "note";
        domIndicator.innerHTML = `<div class="gui-func-field">field ${j}</div>`;
        getDom("xylo").appendChild(domIndicator);
      }
    }

    this._video = getDom("webcam");
    this._initUserMedia();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  removeElementByName(name) {
    this.elements = this.elements.filter(el => el.name !== name);
  }

  getCanvasWidth(per) {
    return per === 0 ? 0 : this._canvasW / 100 * per;
  }

  getCanvasHeight(per) {
    return per === 0 ? 0 : this._canvasH / 100 * per;
  }

  draw() {
    this.ctx.clearRect(0, 0, this._canvasW, this._canvasH);
    this.elements.forEach(el => {el.draw(this); el.update(this);});
    setTimeout(() => this.draw(), 20);
  }

  update() {
    if(!this.systemOnPause) {
      this.drawVideo();
      this.blend();
      this.checkAreas();
      requestAnimFrame(() => this.update());
    }
  }

  drawVideo() {
    this._ctxSource.drawImage(
      this._video, 0, 0,
      this._video.width, this._video.height
    );

  }

  blend() {
    const w = this._canvasSource.width;
    const h = this._canvasSource.height;
    const sourceData = this._ctxSource.getImageData(0, 0, w, h);
    if(!this._lastImageData) this._lastImageData = this._ctxSource.getImageData(0, 0, w, h);
    this._differenceAccuracy(this._blendedData.data, sourceData.data, this._lastImageData.data);
    this._ctxBlended.putImageData(this._blendedData, 0, 0);
    this._lastImageData = sourceData;
  }

  // Default checkAreas — with optional DOM visual feedback
  checkAreas() {
    for(let r = 0;r < this.notes.length;r++) {
      const note = this.notes[r];
      if(!note.area.status) continue;

      const {x, y, w, h} = note.area;
      const blendedData = this._ctxBlended.getImageData(x, y, w, h);
      const average = this._calcAverage(blendedData.data);

      if(average > 10) {
        this._playSound(note);
        if(note.visual) note.visual.style.opacity = 1;
        this._fireAction(r);
      } else if(note.visual) {
        note.visual.style.opacity = Math.max(0, note.visual.style.opacity - 0.1);
      }
    }
  }

  // Overridden checkAreas — no DOM visual feedback
  checkAreasOverride1() {
    for(let r = 0;r < this.notes.length;r++) {
      const note = this.notes[r];
      if(!note.area.status) continue;

      const {x, y, w, h} = note.area;
      const blendedData = this._ctxBlended.getImageData(x, y, w, h);
      const average = this._calcAverage(blendedData.data);

      if(average > 10) {
        this._playSound(note);
        this._fireAction(r);
      }
    }
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  _initUserMedia() {
    const hasGetUserMedia = !!(
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
    );

    if(!hasGetUserMedia) {
      console.warn("hasGetUserMedia FALSE");
      return;
    }
    console.log("hasGetUserMedia TRUE");

    const onStream = (stream) => {
      this._video.srcObject = stream;
      this._initialize();
    };

    const onError = (e) => alert("Webcam error!", e);

    if(navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true}).then(onStream, onError);
    } else if(navigator.getUserMedia) {
      navigator.getUserMedia({video: true}, onStream, onError);
    } else if(navigator.webkitGetUserMedia) {
      navigator.webkitGetUserMedia({video: true}, (stream) => {
        this._video.srcObject = window.webkitURL.createObjectURL(stream);
        this._initialize();
      }, onError);
    }
  }

  _initialize() {
    const AudioContext = window.AudioContext || window.webkitAudioContext || null;
    if(!AudioContext) {
      alert("AudioContext not supported!");
      return;
    }
    setTimeout(() => this._loadSounds(AudioContext), 1000);
  }

  _loadSounds(AudioContext) {
    this._soundContext = new AudioContext();
    const soundFiles = Array.from({length: 8}, (_, i) => `sounds/note${i + 1}.mp3`);
    const loader = new BufferLoader(this._soundContext, soundFiles, (bufferList) => this._finishedLoading(bufferList));
    loader.load();
  }

  _finishedLoading(bufferList) {
    const totalCells = this.blockIndicatorSize ** 2;

    for(let j = 0;j < this.blockIndicatorSize;j++) {
      for(let d = 0;d < this.blockIndicatorSize;d++) {
        const i = j * this.blockIndicatorSize + d;
        const source = this._soundContext.createBufferSource();
        source.buffer = bufferList[i];
        source.connect(this._soundContext.destination);

        const note = {
          note: source,
          ready: true,
          visual: this.options.domVisual ? getDom("note" + i) : false,
          area: {
            x: d * this._cellW,
            y: j * this._cellH,
            w: this._cellW,
            h: this._cellH,
            status: true
          }
        };

        this.notes.push(note);
      }
    }

    if(!this.options.domVisual) {
      this.checkAreas = this.checkAreasOverride1;
    }

    this.update();
  }

  _playSound(obj) {
    if(!obj.ready) return;
    const source = this._soundContext.createBufferSource();
    source.buffer = obj.note.buffer;
    source.connect(this._soundContext.destination);
    source.start(0);
    obj.ready = false;
    setTimeout(() => {obj.ready = true;}, 400);
  }

  _fireAction(index) {
    const entry = this.interActionController.main[index];
    if(entry?.action) entry.action();
  }

  // ─── Image processing helpers ──────────────────────────────────────────────

  /** Pixel-accurate motion diff using grayscale average + threshold */
  _differenceAccuracy(target, data1, data2) {
    const len = data1.length;
    if(len !== data2.length) return;
    for(let i = 0;i < len;i += 4) {
      const avg1 = (data1[i] + data1[i + 1] + data1[i + 2]) / 3;
      const avg2 = (data2[i] + data2[i + 1] + data2[i + 2]) / 3;
      const diff = this._threshold(this._fastAbs(avg1 - avg2));
      target[i] = target[i + 1] = target[i + 2] = diff;
      target[i + 3] = 0xFF;
    }
  }

  /** Average brightness of a pixel region */
  _calcAverage(data) {
    let sum = 0;
    const pixels = data.length / 4;
    for(let i = 0;i < data.length;i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return Math.round(sum / pixels);
  }

  _fastAbs(value) {
    return (value ^ (value >> 31)) - (value >> 31);
  }

  _threshold(value) {
    return value > 0x15 ? 0xFF : 0;
  }
}