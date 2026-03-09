//  NuiToast
//  A timed notification that fades in, holds, then fades out automatically.
//  No motion interaction required — purely informational.
//
//  Usage:
//    const toast = new NuiToast("File saved!", { duration: 2000, color: "0,200,120" });
//    engine.elements.push(toast);
//
//  It removes itself from engine.elements when done.
export class NuiToast {

  constructor(text, options = {}) {
    this.name = "NuiToast";
    this.text = text;
    this.duration = options.duration ?? 2000;   // ms to stay fully visible
    this.color = options.color ?? "30, 30, 200"; // RGB string
    this.posY = options.posY ?? 85;     // % from top

    // Internal state machine: "in" → "hold" → "out" → "done"
    this._phase = "in";
    this._opacity = 0;
    this._holdMs = 0;
    this._done = false;
  }

  get done() {return this._done;}

  draw(engine) {
    if(this._done) return;
    const {ctx} = engine;
    const w = engine.getCanvasWidth(100);
    const h = engine.getCanvasHeight(100);

    const boxW = w * 0.5;
    const boxH = h * 0.08;
    const boxX = (w - boxW) / 2;
    const boxY = h * (this.posY / 100);

    ctx.save();

    // Background pill
    ctx.fillStyle = `rgba(${this.color}, ${this._opacity * 0.85})`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, boxH / 2);
    ctx.fill();

    // Text
    ctx.fillStyle = `rgba(255, 255, 255, ${this._opacity})`;
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, boxX + boxW / 2, boxY + boxH / 2, boxW * 0.9);

    ctx.restore();
  }

  update(engine) {
    if(this._done) return;

    const SPEED = 0.04;

    if(this._phase === "in") {
      this._opacity += SPEED;
      if(this._opacity >= 1) {this._opacity = 1; this._phase = "hold";}

    } else if(this._phase === "hold") {
      // hold duration counted in update ticks (~50fps = 20ms each)
      this._holdMs += 20;
      if(this._holdMs >= this.duration) this._phase = "out";

    } else if(this._phase === "out") {
      this._opacity -= SPEED;
      if(this._opacity <= 0) {
        this._opacity = 0;
        this._done = true;
        // Auto-remove from engine elements
        engine.removeElementByName(this.name);
      }
    }
  }
}

//  NuiSlider
//  A horizontal slider controlled by motion zones.
//  Left zones  (cols 1-2) → decrease value
//  Right zones (cols 5-6) → increase value
//  Center zone (cols 3-4) → neutral / display only
//
//  Grid rows used: configurable via options.row (0-7), default row 6
//
//  Usage:
//    const slider = new NuiSlider("Volume", {
//      row:      6,        // which grid row to occupy
//      min:      0,
//      max:      100,
//      value:    50,
//      step:     2,        // how much each tick changes value
//      color:    "80, 180, 255",
//      onChange: (val) => console.log("value:", val)
//    });
//    engine.elements.push(slider);
export class NuiSlider {

  constructor(label, options = {}) {
    this.name = "NuiSlider";
    this.label = label;
    this.row = options.row ?? 6;
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.value = options.value ?? 50;
    this.step = options.step ?? 2;
    this.color = options.color ?? "80, 180, 255";
    this.onChange = options.onChange ?? null;

    this._shemaX = 8;
    this._shemaY = 8;
    this._opacity = 0.6;
    this._flash = 0;    // brief highlight when value changes
  }

  draw(engine) {
    const {ctx} = engine;
    const W = engine.getCanvasWidth(100);
    const H = engine.getCanvasHeight(100);
    const cellW = W / this._shemaX;
    const cellH = H / this._shemaY;
    const y = cellH * this.row;

    ctx.save();

    // ── Track background ───────────────────────────────────────────────────
    ctx.fillStyle = `rgba(20, 20, 20, 0.5)`;
    ctx.fillRect(cellW, y + cellH * 0.3, W - cellW * 2, cellH * 0.4);

    // ── Filled portion ─────────────────────────────────────────────────────
    const pct = (this.value - this.min) / (this.max - this.min);
    const trackW = W - cellW * 2;
    const fillW = trackW * pct;
    ctx.fillStyle = `rgba(${this.color}, ${this._opacity + this._flash})`;
    ctx.fillRect(cellW, y + cellH * 0.3, fillW, cellH * 0.4);

    // ── Thumb ──────────────────────────────────────────────────────────────
    const thumbX = cellW + fillW;
    ctx.fillStyle = `rgba(255, 255, 255, ${this._opacity + this._flash})`;
    ctx.beginPath();
    ctx.arc(thumbX, y + cellH * 0.5, cellH * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // ── Labels ─────────────────────────────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${this.label}: ${Math.round(this.value)}`, cellW, y + cellH * 0.15, trackW);

    // ── Arrow hints ────────────────────────────────────────────────────────
    ctx.fillStyle = `rgba(${this.color}, 0.7)`;
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("◀", cellW * 0.5, y + cellH * 0.5);
    ctx.fillText("▶", W - cellW * 0.5, y + cellH * 0.5);

    ctx.restore();
  }

  update(engine) {
    const row = this.row;
    const main = engine.interActionController.main;
    const baseIdx = row * this._shemaX;

    // Zones 0-1 of the row = left (decrease), zones 6-7 = right (increase)
    const leftActive = main[baseIdx]?.status || main[baseIdx + 1]?.status;
    const rightActive = main[baseIdx + 6]?.status || main[baseIdx + 7]?.status;

    let changed = false;

    if(leftActive) {
      this.value = Math.max(this.min, this.value - this.step);
      changed = true;
    }
    if(rightActive) {
      this.value = Math.min(this.max, this.value + this.step);
      changed = true;
    }

    if(changed) {
      this._flash = 0.3;
      this.onChange?.(this.value);
    }

    // Decay flash
    if(this._flash > 0) this._flash = Math.max(0, this._flash - 0.02);
  }
}

//  NuiRadialMenu
//  A circular menu drawn at the center of the canvas.
//  The 8×8 grid is mapped to 8 radial sectors (one per column).
//  Motion in a sector highlights that option; dwell for `dwellMs` selects it.
//
//  Usage:
//    const menu = new NuiRadialMenu([
//      { label: "Play",     action: () => {} },
//      { label: "Settings", action: () => {} },
//      { label: "Exit",     action: () => {} },
//    ], { dwellMs: 800 });
//    engine.elements.push(menu);
//  NuiRadialMenu  (fixed sector ↔ column mapping)
//  Columns go left → right, sectors go left → right.
//  Col 0-1 = leftmost sector, Col 6-7 = rightmost sector.
export class NuiRadialMenu {
  constructor(items, options = {}) {
    this.name = "NuiRadialMenu";
    this.items = items;              // [{ label, action }]
    this.dwellMs = options.dwellMs ?? 800;
    this.color = options.color ?? "80, 160, 255";

    this._shemaX = 8;
    this._shemaY = 8;
    this._hovered = -1;
    this._dwellTick = 0;
    this._opacities = new Array(items.length).fill(0.3);
    this._fired = false;
  }

  draw(engine) {
    const {ctx} = engine;
    const cx = engine.getCanvasWidth(50);
    const cy = engine.getCanvasHeight(50);
    const R = Math.min(engine.getCanvasWidth(40), engine.getCanvasHeight(40));
    const r = R * 0.35;
    const n = this.items.length;
    const arc = (Math.PI * 2) / n;

    ctx.save();

    for(let i = 0;i < n;i++) {
      // ── FIX: sectors laid out left→right matching grid columns ──────────
      // Sector 0 starts at the LEFT  (angle = -Math.PI/2 - half arc)
      // then goes clockwise so sector 0 = left, sector n-1 = right
      // We rotate the whole wheel so sector 0 sits on the LEFT side:
      //   startAngle offset = -Math.PI/2 - (arc * n/2) puts sector 0 on left
      const offset = -Math.PI / 2 - arc * (n / 2);
      const startAngle = offset + arc * i;
      const endAngle = startAngle + arc;
      const isHovered = i === this._hovered;
      const op = this._opacities[i];
      // Sector fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, isHovered ? R * 1.05 : R, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = isHovered
        ? `rgba(${this.color}, ${op})`
        : `rgba(40, 40, 80, ${op})`;
      ctx.fill();

      // Sector border
      ctx.strokeStyle = `rgba(${this.color}, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      const midAngle = startAngle + arc / 2;
      const lx = cx + Math.cos(midAngle) * (r + (R - r) * 0.55);
      const ly = cy + Math.sin(midAngle) * (r + (R - r) * 0.55);

      ctx.fillStyle = isHovered ? "white" : `rgba(200,200,200,0.8)`;
      ctx.font = isHovered ? "bold 15px monospace" : "13px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.items[i].label, lx, ly);

      // Dwell progress arc
      if(isHovered && this._dwellTick > 0) {
        const progress = Math.min(this._dwellTick / this.dwellMs, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, r + (R - r) * 0.85, startAngle, startAngle + arc * progress);
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
    // Center hole
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(10, 10, 30, 0.85)";
    ctx.fill();
    ctx.restore();
  }

  update(engine) {
    const main = engine.interActionController.main;
    const n = this.items.length;
    const colsPerSector = this._shemaX / n;  // e.g. 8 items = 1 col each, 4 items = 2 cols each
    let activeSector = -1;
    // ── FIX: col 0 = sector 0 (left), col 7 = sector n-1 (right) ──────────
    for(let col = 0;col < this._shemaX && activeSector === -1;col++) {
      const sector = Math.floor(col / colsPerSector);
      for(let row = 0;row < this._shemaY;row++) {
        const idx = row * this._shemaX + col;
        if(main[idx]?.status) {
          activeSector = sector;
          break;
        }
      }
    }

    // Hover changed → reset dwell
    if(activeSector !== this._hovered) {
      this._hovered = activeSector;
      this._dwellTick = 0;
      this._fired = false;
    }

    // Accumulate dwell
    if(this._hovered >= 0) {
      this._dwellTick += 20;
      if(this._dwellTick >= this.dwellMs && !this._fired) {
        this._fired = true;
        console.log(`RadialMenu selected: ${this.items[this._hovered].label}`);
        this.items[this._hovered].action?.();
      }
    }

    // Animate opacities
    for(let i = 0;i < n;i++) {
      const target = i === this._hovered ? 0.75 : 0.3;
      this._opacities[i] += (target - this._opacities[i]) * 0.1;
    }
  }
}

//  NuiCursor
//  Tracks the "center of mass" of all active motion zones and draws a
//  smooth cursor dot that follows it. Great as a always-on overlay.
//
//  The cursor position is also publicly available as:
//    cursor.x  (canvas pixels)
//    cursor.y  (canvas pixels)
//    cursor.normX  (0.0 – 1.0)
//    cursor.normY  (0.0 – 1.0)
//
//  Usage:
//    const cursor = new NuiCursor({ color: "255, 80, 80", size: 18 });
//    engine.elements.push(cursor);
//
//  Other elements can read cursor.normX / cursor.normY for hover detection.
export class NuiCursor {

  constructor(options = {}) {
    this.name = "NuiCursor";
    this.color = options.color ?? "255, 80, 80";
    this.size = options.size ?? 18;
    this.visible = options.visible ?? true;

    this._shemaX = 8;
    this._shemaY = 8;

    // Smoothed position (canvas pixels)
    this.x = 0;
    this.y = 0;

    // Normalised 0–1
    this.normX = 0;
    this.normY = 0;

    // Raw target before smoothing
    this._targetX = 0;
    this._targetY = 0;
    this._active = false;

    this._opacity = 0;
    this._trail = [];           // last N positions for motion trail
    this._trailMax = 8;
  }

  draw(engine) {
    if(!this.visible || !this._active) return;
    const {ctx} = engine;

    ctx.save();

    // ── Motion trail ───────────────────────────────────────────────────────
    this._trail.forEach((pt, i) => {
      const t = i / this._trail.length;
      const r = this.size * 0.4 * t;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, r), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${t * this._opacity * 0.4})`;
      ctx.fill();
    });

    // ── Outer ring ─────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${this.color}, ${this._opacity * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── Inner dot ──────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this._opacity})`;
    ctx.fill();

    ctx.restore();
  }

  update(engine) {
    const main = engine.interActionController.main;
    const W = engine.getCanvasWidth(100);
    const H = engine.getCanvasHeight(100);
    const cellW = W / this._shemaX;
    const cellH = H / this._shemaY;

    let sumX = 0, sumY = 0, count = 0;

    for(let row = 0;row < this._shemaY;row++) {
      for(let col = 0;col < this._shemaX;col++) {
        const idx = row * this._shemaX + col;
        if(main[idx]?.status) {
          // Use cell center as position sample
          sumX += cellW * col + cellW / 2;
          sumY += cellH * row + cellH / 2;
          count++;
        }
      }
    }

    this._active = count > 0;

    if(this._active) {
      this._targetX = sumX / count;
      this._targetY = sumY / count;
    }

    // Smooth lerp toward target
    const LERP = 0.15;
    this.x = this.x + (this._targetX - this.x) * LERP;
    this.y = this.y + (this._targetY - this.y) * LERP;

    // Update normalised coords
    this.normX = this.x / W;
    this.normY = this.y / H;

    // Fade in/out
    const targetOpacity = this._active ? 1 : 0;
    this._opacity += (targetOpacity - this._opacity) * 0.08;

    // Record trail
    if(this._active) {
      this._trail.push({x: this.x, y: this.y});
      if(this._trail.length > this._trailMax) this._trail.shift();
    } else {
      if(this._trail.length > 0) this._trail.shift();
    }
  }
}

//  NuiToggle
//  A toggle that flips on/off when motion is detected in its zone.
//  Smooth animated pill, glow, scan line, ripple burst.
//
//  Grid position : col, row  (0–7)
//  Grid size     : cols, rows span — default 1×1, can cover multiple cells.
//  Motion in ANY cell of the span triggers dwell accumulation.
//
//  Usage:
//    const toggle = new NuiToggle("Mute", {
//      col:      6,
//      row:      0,
//      cols:     2,          // span 2 columns  (default: 1)
//      rows:     2,          // span 2 rows     (default: 1)
//      dwellMs:  600,
//      onColor:  "80, 220, 160",
//      offColor: "200, 60, 80",
//      initial:  false,
//      onChange: (isOn) => console.log("is on:", isOn)
//    });
//    engine.elements.push(toggle);
//
//  Read state anytime:  toggle.isOn  → true / false
export class NuiToggle {
  constructor(label, options = {}) {
    this.name = "NuiToggle";
    this.label = label;
    // Grid position & size
    this.col = options.col ?? 6;
    this.row = options.row ?? 0;
    this.cols = options.cols ?? 1;   // how many columns to span
    this.rows = options.rows ?? 1;   // how many rows to span
    // Behaviour
    this.dwellMs = options.dwellMs ?? 600;
    this.onColor = options.onColor ?? "80, 220, 160";
    this.offColor = options.offColor ?? "200, 60, 80";
    this.onChange = options.onChange ?? null;
    this.isOn = options.initial ?? false;
    this._shemaX = 8;
    this._shemaY = 8;
    // Dwell + gap tolerance
    this._dwellTick = 0;
    this._fired = false;
    this._gapTick = 0;
    this._gapMax = 200;   // ms of inactivity to forgive (flicker tolerance)
    // Visual lerp state
    this._thumbPos = this.isOn ? 1 : 0;
    this._glowAlpha = 0;
    this._ripple = 0;
    this._rippleX = 0;
    this._rippleY = 0;
    this._labelPulse = 0;
  }

  draw(engine) {
    const {ctx} = engine;
    const W = engine.getCanvasWidth(100);
    const H = engine.getCanvasHeight(100);
    const cellW = W / this._shemaX;
    const cellH = H / this._shemaY;

    // Total pixel area of the span
    const x = cellW * this.col;
    const y = cellH * this.row;
    const w = cellW * this.cols;
    const h = cellH * this.rows;
    const color = this.isOn ? this.onColor : this.offColor;
    ctx.save();
    // ── Zone hint border ───────────────────────────────────────────────────
    ctx.strokeStyle = `rgba(${color}, 0.25)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    // ── Dwell scan line (sweeps full height of span) ───────────────────────
    if(this._dwellTick > 0 && !this._fired) {
      const progress = Math.min(this._dwellTick / this.dwellMs, 1);
      const scanY = y + h * progress;
      const grad = ctx.createLinearGradient(x, scanY - 8, x, scanY + 8);
      grad.addColorStop(0, `rgba(${color}, 0)`);
      grad.addColorStop(0.5, `rgba(${color}, 0.7)`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(x, scanY - 8, w, 16);
    }
    // ── Pill — scales with span size ───────────────────────────────────────
    const pillW = w * 0.72;
    const pillH = h * 0.28;
    const pillX = x + (w - pillW) / 2;
    const pillY = y + h * 0.52;
    const pillR = pillH / 2;
    // Glow / shadow
    ctx.shadowColor = `rgba(${color}, ${this._glowAlpha * 0.8})`;
    ctx.shadowBlur = 18 + this.cols * 4;
    ctx.fillStyle = `rgba(20, 20, 35, 0.85)`;
    this._roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Pill fill
    ctx.fillStyle = `rgba(${color}, ${0.25 + this._thumbPos * 0.35})`;
    this._roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
    ctx.fill();
    // Pill border
    ctx.strokeStyle = `rgba(${color}, ${0.4 + this._thumbPos * 0.4})`;
    ctx.lineWidth = 1.5;
    this._roundRect(ctx, pillX, pillY, pillW, pillH, pillR);
    ctx.stroke();

    // ── Thumb ──────────────────────────────────────────────────────────────
    const thumbR = pillH * 0.42;
    const thumbMinX = pillX + thumbR + 3;
    const thumbMaxX = pillX + pillW - thumbR - 3;
    const thumbX = thumbMinX + (thumbMaxX - thumbMinX) * this._thumbPos;
    const thumbY = pillY + pillH / 2;

    ctx.shadowColor = `rgba(${color}, ${this._glowAlpha})`;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, thumbR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, ${0.7 + this._thumbPos * 0.3})`;
    ctx.fill();

    // Thumb highlight
    ctx.beginPath();
    ctx.arc(thumbX - thumbR * 0.25, thumbY - thumbR * 0.25, thumbR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + this._thumbPos * 0.25})`;
    ctx.fill();

    ctx.shadowBlur = 0;
    // ── Icon + label — centred in the full span area ───────────────────────
    const cx = x + w / 2;
    const iconSize = Math.round(Math.min(w, h) * 0.22);
    const lblSize = Math.round(Math.min(w, h) * 0.16);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${iconSize}px monospace`;
    ctx.fillStyle = `rgba(${color}, ${0.5 + this._labelPulse * 0.5})`;
    ctx.fillText(this.isOn ? "✓" : "✕", cx, y + h * 0.28);
    ctx.font = `${lblSize}px monospace`;
    ctx.fillStyle = `rgba(220, 220, 220, ${0.6 + this._labelPulse * 0.4})`;
    ctx.fillText(this.label, cx, y + h * 0.82);
    // Ripple — scales with span
    if(this._ripple > 0) {
      const maxR = Math.max(w, h) * 0.6;
      const rr = maxR * (1 - this._ripple);
      ctx.beginPath();
      ctx.arc(this._rippleX, this._rippleY, rr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color}, ${this._ripple * 0.8})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  update(engine) {
    // Check ALL cells inside the span for any active zone
    const main = engine.interActionController.main;
    let active = false;

    for(let r = this.row;r < this.row + this.rows && !active;r++) {
      for(let c = this.col;c < this.col + this.cols && !active;c++) {
        const idx = r * this._shemaX + c;
        if(main[idx]?.status) active = true;
      }
    }

    // Dwell with gap tolerance
    if(active) {
      this._gapTick = 0;
      this._dwellTick += 20;
      if(this._dwellTick >= this.dwellMs && !this._fired) {
        this._fired = true;
        this._toggle(engine);
      }
    } else {
      this._gapTick += 20;
      if(this._gapTick >= this._gapMax) {
        this._dwellTick = 0;
        this._fired = false;
        this._gapTick = 0;
      }
    }
    // Lerp visuals
    this._thumbPos += ((this.isOn ? 1 : 0) - this._thumbPos) * 0.12;
    this._glowAlpha += ((active ? 0.9 : (this.isOn ? 0.4 : 0.1)) - this._glowAlpha) * 0.1;
    this._labelPulse += ((active ? 1 : 0) - this._labelPulse) * 0.1;
    if(this._ripple > 0) this._ripple = Math.max(0, this._ripple - 0.04);
  }

  _toggle(engine) {
    this.isOn = !this.isOn;
    // Ripple from center of the full span
    const W = engine.getCanvasWidth(100);
    const H = engine.getCanvasHeight(100);
    const cellW = W / this._shemaX;
    const cellH = H / this._shemaY;
    this._rippleX = cellW * this.col + (cellW * this.cols) / 2;
    this._rippleY = cellH * this.row + (cellH * this.rows) / 2;
    this._ripple = 1;

    console.log(`NuiToggle "${this.label}" → ${this.isOn ? "ON" : "OFF"}`);
    this.onChange?.(this.isOn);
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  NuiFaceDetect
//  Low-CPU face detection using the native browser FaceDetector API.
//  Falls back gracefully if unsupported.
//
//  Strategy for low CPU cost:
//    - Detection runs on a throttled interval (not every frame)
//    - Detection runs on a small downscaled offscreen canvas
//    - Draw() only renders — zero detection work on the render path
//    - All visual effects are pure canvas math, no extra allocations
//
//  Effects per detected face:
//    - Animated corner brackets (cyberpunk HUD style)
//    - Scanline sweep across the face box
//    - Pulsing confidence ring around face center
//    - Glitch flicker on lock
//    - Floating label with face index + confidence
//    - Global screen edge vignette when any face is present
//
//  Usage:
//    const faceDetect = new NuiFaceDetect(videoElement, {
//      intervalMs:   200,        // how often to run detection (default 200ms)
//      maxFaces:     4,          // max faces to track (default 4)
//      color:        "0, 220, 180",
//      showConf:     true,       // show confidence % label
//      onFace:       (faces) => console.log(faces.length, "faces"),
//    });
//    engine.elements.push(faceDetect);
//
//  Read detected faces anytime:
//    faceDetect.faces  → array of { x, y, w, h, confidence }
//    faceDetect.count  → number of currently detected faces
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
//  NuiFaceDetect  — native FaceDetector API, properly guarded
//
//  Fixes vs broken version:
//    1. _detecting flag prevents overlapping async detect() calls
//    2. video.readyState >= 2 AND videoWidth > 0 check before detect
//    3. Offscreen canvas size set AFTER video is ready (correct dimensions)
//    4. Detection result coords scaled back to engine canvas space
//    5. try/catch logs the actual error instead of swallowing it
//
//  Usage:
//    const face = new NuiFaceDetect(getDom("webcam"), {
//      intervalMs: 200,
//      color:      "0, 220, 180",
//      onLock:     () => console.log("locked!"),
//    });
//    engine.elements.push(face);
// ═══════════════════════════════════════════════════════════════════════════

export class NuiFaceDetect {

  constructor(videoElement, options = {}) {
    this.name       = "NuiFaceDetect";
    this.video      = videoElement;
    this.intervalMs = options.intervalMs ?? 200;
    this.maxFaces   = options.maxFaces   ?? 2;
    this.color      = options.color      ?? "0, 220, 180";
    this.showConf   = options.showConf   ?? true;
    this.onLock     = options.onLock     ?? null;
    this.onFace     = options.onFace     ?? null;

    // Public
    this.faces = [];
    this.count = 0;

    // Internal
    this._tick        = 0;
    this._lastDetect  = 0;
    this._detecting   = false;   // ← KEY: prevents overlapping async calls
    this._detector    = null;
    this._ready       = false;

    // Offscreen canvas — sized lazily once video is ready
    this._off    = document.createElement("canvas");
    this._offCtx = this._off.getContext("2d", { willReadFrequently: true });
    this._scaleX = 1;
    this._scaleY = 1;

    // Visual slots
    this._slots = Array.from({ length: this.maxFaces }, () => ({
      box: null, rawBox: null,
      alpha: 0, bracket: 0,
      scanY: 0, scanDir: 1,
      ring: 0, glitch: 0,
      lockTime: 0, locked: false,
    }));

    this._vignetteAlpha = 0;

    this._initDetector();
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  _initDetector() {
    if (!("FaceDetector" in window)) {
      console.error("[NuiFaceDetect] FaceDetector not available.");
      return;
    }
    try {
      this._detector = new FaceDetector({
        maxDetectedFaces: this.maxFaces,
        fastMode:         true
      });
      this._ready = true;
      console.log("[NuiFaceDetect] ✓ FaceDetector ready");
    } catch(e) {
      console.error("[NuiFaceDetect] FaceDetector constructor failed:", e);
    }
  }

  // ── Detection ─────────────────────────────────────────────────────────────

  async _detect(engineW, engineH) {
    if (!this._ready)      return;
    if (this._detecting)   return;   // ← skip if previous call still running

    // Guard: video must be playing and have real dimensions
    const v = this.video;
    if (!v || v.readyState < 2 || v.videoWidth === 0 || v.videoHeight === 0) return;

    // Lazy-init offscreen canvas to actual video dimensions (not assumed 640×480)
    if (this._off.width !== v.videoWidth || this._off.height !== v.videoHeight) {
      // Use half resolution for performance
      this._off.width  = Math.floor(v.videoWidth  / 2);
      this._off.height = Math.floor(v.videoHeight / 2);
      console.log(`[NuiFaceDetect] Off-canvas: ${this._off.width}×${this._off.height}`);
    }

    // Scale factors: offscreen → engine canvas
    this._scaleX = engineW / this._off.width;
    this._scaleY = engineH / this._off.height;

    this._detecting = true;

    try {
      // Draw video to offscreen at half res
      this._offCtx.drawImage(v, 0, 0, this._off.width, this._off.height);

      const results = await this._detector.detect(this._off);

      this.faces = results.map(f => ({
        x:          f.boundingBox.x      * this._scaleX,
        y:          f.boundingBox.y      * this._scaleY,
        w:          f.boundingBox.width  * this._scaleX,
        h:          f.boundingBox.height * this._scaleY,
        confidence: f.confidence ?? 0.9,
      }));

      this.count = this.faces.length;

      // Assign to slots
      for (let i = 0; i < this.maxFaces; i++) {
        this._slots[i].rawBox = i < this.faces.length ? this.faces[i] : null;
        if (i < this.faces.length && !this._slots[i].box) {
          this._slots[i].box = { ...this.faces[i] };
        }
      }

      if (this.count > 0) this.onFace?.(this.faces);

    } catch(e) {
      console.error("[NuiFaceDetect] detect() failed:", e);
    } finally {
      this._detecting = false;   // ← always release lock, even on error
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────────────

  draw(engine) {
    const { ctx } = engine;
    const W = engine.getCanvasWidth(100);
    const H = engine.getCanvasHeight(100);

    ctx.save();

    // Vignette
    if (this._vignetteAlpha > 0.01) {
      const vg = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.9);
      vg.addColorStop(0, `rgba(0,0,0,0)`);
      vg.addColorStop(1, `rgba(${this.color}, ${this._vignetteAlpha * 0.3})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }

    // Not ready indicator
    if (!this._ready) {
      ctx.fillStyle = "rgba(255,60,60,0.9)";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("⚠ FaceDetector not ready", 8, 8);
      ctx.restore();
      return;
    }

    // Draw each slot
    for (let i = 0; i < this.maxFaces; i++) {
      const slot = this._slots[i];
      if (slot.alpha < 0.01 || !slot.box) continue;
      this._drawSlot(ctx, slot, i, engine);
    }

    ctx.restore();
  }

  _drawSlot(ctx, slot, index, engine) {
    const b   = slot.box;
    const a   = slot.alpha;
    const col = this.color;
    const cx  = b.x + b.w / 2;
    const cy  = b.y + b.h / 2;

    // Corner brackets
    const blen = Math.min(b.w, b.h) * 0.22 * slot.bracket;
    ctx.strokeStyle = `rgba(${col}, ${a})`;
    ctx.lineWidth   = 2.5;
    ctx.beginPath(); ctx.moveTo(b.x,         b.y + blen); ctx.lineTo(b.x,         b.y        ); ctx.lineTo(b.x + blen,         b.y        ); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x+b.w-blen,b.y        ); ctx.lineTo(b.x+b.w,     b.y        ); ctx.lineTo(b.x+b.w,            b.y + blen ); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x,         b.y+b.h-blen); ctx.lineTo(b.x,        b.y+b.h    ); ctx.lineTo(b.x + blen,         b.y+b.h    ); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x+b.w-blen,b.y+b.h    ); ctx.lineTo(b.x+b.w,     b.y+b.h   ); ctx.lineTo(b.x+b.w,            b.y+b.h-blen); ctx.stroke();

    // Box fill
    ctx.fillStyle = `rgba(${col}, ${a * 0.04})`;
    ctx.fillRect(b.x, b.y, b.w, b.h);

    // Scanline
    const scanAbsY = b.y + slot.scanY * b.h;
    const sg = ctx.createLinearGradient(b.x, scanAbsY - 8, b.x, scanAbsY + 8);
    sg.addColorStop(0,   `rgba(${col}, 0)`);
    sg.addColorStop(0.5, `rgba(${col}, ${a * 0.55})`);
    sg.addColorStop(1,   `rgba(${col}, 0)`);
    ctx.fillStyle = sg;
    ctx.fillRect(b.x, scanAbsY - 8, b.w, 16);

    // Dual pulse rings
    const rBase  = Math.max(b.w, b.h) * 0.55;
    const rPulse = rBase + Math.sin(slot.ring) * rBase * 0.1;
    ctx.beginPath(); ctx.arc(cx, cy, rPulse,        0, Math.PI*2); ctx.strokeStyle = `rgba(${col}, ${a*0.2})`; ctx.lineWidth = 1;   ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, rPulse * 0.75, 0, Math.PI*2); ctx.strokeStyle = `rgba(${col}, ${a*0.12})`; ctx.lineWidth = 1; ctx.stroke();

    // Glitch burst on lock
    if (slot.glitch > 0.05) {
      const gy = b.y + Math.random() * b.h;
      const gh = 3 + Math.random() * 5;
      const gx = (Math.random() - 0.5) * 12 * slot.glitch;
      ctx.save();
      ctx.globalAlpha = slot.glitch * a * 0.6;
      ctx.drawImage(engine.canvasDom, b.x, gy, b.w, gh, b.x + gx, gy, b.w, gh);
      ctx.restore();
    }

    // Lock tag
    if (slot.locked) {
      const tagW = 72, tagH = 16;
      ctx.fillStyle = `rgba(${col}, ${a * 0.85})`;
      ctx.fillRect(b.x, b.y - tagH - 3, tagW, tagH);
      ctx.fillStyle    = "rgba(0,0,0,0.9)";
      ctx.font         = "bold 10px monospace";
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FACE LOCK", b.x + tagW / 2, b.y - tagH / 2 - 3);
    }

    // Confidence
    if (this.showConf && b.confidence !== undefined) {
      ctx.font         = "11px monospace";
      ctx.fillStyle    = `rgba(${col}, ${a * 0.9})`;
      ctx.textAlign    = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(`#${index}  ${Math.round(b.confidence * 100)}%`, b.x + b.w, b.y - 4);
    }

    // Crosshair
    ctx.strokeStyle = `rgba(${col}, ${a * 0.4})`;
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(cx-8, cy); ctx.lineTo(cx+8, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy-8); ctx.lineTo(cx, cy+8); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${col}, ${a * 0.7})`; ctx.fill();
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(engine) {
    this._tick += 20;
    const W = engine.getCanvasWidth(100);
    const H = engine.getCanvasHeight(100);

    // Throttled detection
    if (this._tick - this._lastDetect >= this.intervalMs) {
      this._lastDetect = this._tick;
      this._detect(W, H);   // async — non-blocking
    }

    let anyActive = false;

    for (let i = 0; i < this.maxFaces; i++) {
      const slot    = this._slots[i];
      const hasRaw  = slot.rawBox !== null;

      // Fade
      slot.alpha += ((hasRaw ? 1 : 0) - slot.alpha) * 0.08;

      if (slot.alpha < 0.01) {
        slot.box = null; slot.locked = false; slot.lockTime = 0;
        continue;
      }

      anyActive = true;

      // Smooth box lerp
      if (hasRaw && slot.box) {
        const L = 0.18;
        slot.box.x          += (slot.rawBox.x - slot.box.x) * L;
        slot.box.y          += (slot.rawBox.y - slot.box.y) * L;
        slot.box.w          += (slot.rawBox.w - slot.box.w) * L;
        slot.box.h          += (slot.rawBox.h - slot.box.h) * L;
        slot.box.confidence  = slot.rawBox.confidence;
      } else if (hasRaw) {
        slot.box = { ...slot.rawBox };
      }

      // Animations
      slot.bracket += (1 - slot.bracket) * 0.1;
      slot.scanY   += 0.012 * slot.scanDir;
      if (slot.scanY > 1) { slot.scanY = 1; slot.scanDir = -1; }
      if (slot.scanY < 0) { slot.scanY = 0; slot.scanDir =  1; }
      slot.ring    += 0.06;

      // Lock-in
      if (hasRaw) {
        slot.lockTime += 20;
        if (slot.lockTime > 800 && !slot.locked) {
          slot.locked = true;
          slot.glitch = 1;
          this.onLock?.();
        }
      } else {
        slot.lockTime = 0;
        slot.locked   = false;
      }

      if (slot.glitch > 0) slot.glitch = Math.max(0, slot.glitch - 0.05);
    }

    this._vignetteAlpha += ((anyActive ? 1 : 0) - this._vignetteAlpha) * 0.05;
  }
}

export class NuiVirtualKeyboard {

  constructor(options={}){

    this.name="NuiVirtualKeyboard";

    this.layout = options.layout ?? [
      "QWERTYUI",
      "ASDFGHJK",
      "ZXCVBNM_"
    ];

    this.row = options.row ?? 2;

    this.onKey = options.onKey ?? null;

    this._shemaX = 8;
    this._shemaY = 8;

  }

  draw(engine){

    const {ctx} = engine;

    const W = engine.getCanvasWidth(100);
    const H = engine.getCanvasHeight(100);

    const cellW = W/this._shemaX;
    const cellH = H/this._shemaY;

    ctx.save();

    this.layout.forEach((line,r)=>{

      [...line].forEach((ch,c)=>{

        const x = c*cellW;
        const y = (this.row+r)*cellH;

        ctx.strokeStyle="rgba(255,255,255,0.2)";
        ctx.strokeRect(x,y,cellW,cellH);

        ctx.fillStyle="white";
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.font="bold 18px monospace";

        ctx.fillText(ch==="_"?"⌫":ch,x+cellW/2,y+cellH/2);

      });

    });

    ctx.restore();

  }

  update(engine){

    const main = engine.interActionController.main;

    for(let r=0;r<this.layout.length;r++){
      for(let c=0;c<8;c++){

        const idx = (this.row+r)*8 + c;

        if(main[idx]?.status){

          const ch = this.layout[r][c];

          this.onKey?.(ch==="_"?"BACKSPACE":ch);

        }

      }
    }

  }

}

 // ═══════════════════════════════════════════════════════════════════════════
//  NuiMenu
//  A vertical list menu drawn on the canvas grid.
//  Motion in a row zone highlights that item.
//  Dwell for `dwellMs` selects it.
//
//  Layout: anchored to a grid column, each item occupies one row.
//  Up to 8 items (one per grid row).
//
//  Effects:
//    - Smooth highlight slide between items
//    - Dwell progress bar fills left→right on hovered item
//    - Selected item flashes + fires callback
//    - Idle items breathe softly
//    - Entry animation — items slide in from left on mount
//    - Scanline on hovered row
//    - Active item has side accent bar
//
//  Usage:
//    const menu = new NuiMenu([
//      { label: "Play",      action: () => startGame()  },
//      { label: "Settings",  action: () => openSettings() },
//      { label: "Credits",   action: () => showCredits() },
//      { label: "Exit",      action: () => quit()       },
//    ], {
//      col:       0,           // starting column (0–7)
//      cols:      3,           // how many columns wide (default 3)
//      startRow:  2,           // starting row (default 0)
//      dwellMs:   700,
//      color:     "80, 160, 255",
//      accentColor: "255, 80, 120",
//      onSelect:  (item, index) => console.log("selected:", item.label)
//    });
//    engine.elements.push(menu);
//
//  Control from outside:
//    menu.selectIndex(2)       // programmatically select item
//    menu.hoveredIndex         // currently hovered item (-1 = none)
//    menu.selectedIndex        // last selected item (-1 = none)
// ═══════════════════════════════════════════════════════════════════════════

export class NuiMenu {

  constructor(items, options = {}) {
    this.name        = "NuiMenu";
    this.items       = items;

    this.col         = options.col         ?? 0;
    this.cols        = options.cols        ?? 3;
    this.startRow    = options.startRow    ?? 0;
    this.dwellMs     = options.dwellMs     ?? 700;
    this.color       = options.color       ?? "80, 160, 255";
    this.accentColor = options.accentColor ?? "255, 80, 120";
    this.onSelect    = options.onSelect    ?? null;

    this._shemaX     = 8;
    this._shemaY     = 8;

    // State
    this.hoveredIndex  = -1;
    this.selectedIndex = -1;

    this._dwellTick  = 0;
    this._gapTick    = 0;
    this._gapMax     = 220;
    this._fired      = false;

    // Per-item visual state
    this._itemStates = items.map((_, i) => ({
      alpha:     0,
      slideX:    1,          // 0 = in position, 1 = off to left (entry anim)
      highlight: 0,          // 0→1 hover brightness
      flash:     0,          // selection flash
      entryDelay: i * 80,    // stagger entry animation
      entryDone:  false,
    }));

    // Shared
    this._highlightY  = -1;   // smooth highlight bar Y position (pixels)
    this._highlightA  = 0;    // highlight bar alpha
    this._tick        = 0;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  selectIndex(i) {
    if (i < 0 || i >= this.items.length) return;
    this.selectedIndex = i;
    this._itemStates[i].flash = 1;
    this.onSelect?.(this.items[i], i);
    this.items[i].action?.();
  }

  // ── Draw ──────────────────────────────────────────────────────────────────

  draw(engine) {
    const { ctx } = engine;
    const W     = engine.getCanvasWidth(100);
    const H     = engine.getCanvasHeight(100);
    const cellW = W / this._shemaX;
    const cellH = H / this._shemaY;

    const menuX = cellW * this.col;
    const menuW = cellW * this.cols;

    ctx.save();

    // ── Smooth highlight bar ───────────────────────────────────────────────
    if (this.hoveredIndex >= 0 && this._highlightA > 0.01) {
      const barY = cellH * (this.startRow + this.hoveredIndex);
      this._highlightY = this._highlightY < 0
        ? barY
        : this._highlightY + (barY - this._highlightY) * 0.18;

      ctx.fillStyle = `rgba(${this.color}, ${this._highlightA * 0.12})`;
      ctx.fillRect(menuX, this._highlightY, menuW, cellH);

      // Side accent bar
      ctx.fillStyle = `rgba(${this.accentColor}, ${this._highlightA * 0.9})`;
      ctx.fillRect(menuX, this._highlightY, 3, cellH);
    }

    // ── Draw each item ─────────────────────────────────────────────────────
    for (let i = 0; i < this.items.length; i++) {
      const item  = this.items[i];
      const state = this._itemStates[i];
      if (state.alpha < 0.01) continue;

      const itemY    = cellH * (this.startRow + i);
      const isHover  = i === this.hoveredIndex;
      const isSelect = i === this.selectedIndex;
      const a        = state.alpha;

      // Entry slide offset
      const slideOff = state.slideX * menuW * 0.4;

      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(-slideOff, 0);

      // ── Row background ───────────────────────────────────────────────────
      const rowAlpha = 0.06 + state.highlight * 0.08 + state.flash * 0.15;
      ctx.fillStyle  = `rgba(${this.color}, ${rowAlpha})`;
      ctx.fillRect(menuX, itemY, menuW, cellH);

      // ── Bottom separator line ────────────────────────────────────────────
      ctx.strokeStyle = `rgba(${this.color}, ${0.1 + state.highlight * 0.15})`;
      ctx.lineWidth   = 0.5;
      ctx.beginPath();
      ctx.moveTo(menuX + 12, itemY + cellH - 1);
      ctx.lineTo(menuX + menuW - 12, itemY + cellH - 1);
      ctx.stroke();

      // ── Label ────────────────────────────────────────────────────────────
      const fontSize = Math.round(cellH * 0.32);
      ctx.font         = `${isHover ? "bold " : ""}${fontSize}px monospace`;
      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = isHover
        ? `rgba(255, 255, 255, ${0.9 + state.flash * 0.1})`
        : `rgba(${this.color}, ${0.55 + state.highlight * 0.3})`;
      ctx.fillText(item.label, menuX + 18, itemY + cellH / 2, menuW - 30);

      // ── Arrow indicator on hovered item ──────────────────────────────────
      if (isHover) {
        ctx.font      = `${fontSize}px monospace`;
        ctx.fillStyle = `rgba(${this.accentColor}, ${this._highlightA * 0.9})`;
        ctx.textAlign = "right";
        ctx.fillText("▶", menuX + menuW - 8, itemY + cellH / 2);
      }

      // ── Index number ─────────────────────────────────────────────────────
      ctx.font      = `${Math.round(cellH * 0.18)}px monospace`;
      ctx.fillStyle = `rgba(${this.color}, ${0.2 + state.highlight * 0.2})`;
      ctx.textAlign = "left";
      ctx.fillText(`${i + 1}`, menuX + 5, itemY + cellH * 0.22);

      ctx.restore();

      // ── Dwell progress bar (drawn without slide offset) ──────────────────
      if (isHover && this._dwellTick > 0 && !this._fired) {
        const progress = Math.min(this._dwellTick / this.dwellMs, 1);
        // Track
        ctx.fillStyle = `rgba(${this.color}, 0.1)`;
        ctx.fillRect(menuX, itemY + cellH - 3, menuW, 3);
        // Fill
        const grad = ctx.createLinearGradient(menuX, 0, menuX + menuW, 0);
        grad.addColorStop(0,   `rgba(${this.accentColor}, 0.9)`);
        grad.addColorStop(1,   `rgba(${this.color}, 0.9)`);
        ctx.fillStyle = grad;
        ctx.fillRect(menuX, itemY + cellH - 3, menuW * progress, 3);
      }

      // ── Selection flash overlay ───────────────────────────────────────────
      if (state.flash > 0.01) {
        ctx.fillStyle = `rgba(255, 255, 255, ${state.flash * 0.25})`;
        ctx.fillRect(menuX, itemY, menuW, cellH);
      }
    }

    // ── Scanline on hovered row ────────────────────────────────────────────
    if (this.hoveredIndex >= 0 && this._highlightA > 0.1) {
      const scanBaseY = cellH * (this.startRow + this.hoveredIndex);
      const scanPhase = (this._tick % 1200) / 1200;
      const scanY     = scanBaseY + scanPhase * cellH;
      const sg        = ctx.createLinearGradient(0, scanY - 5, 0, scanY + 5);
      sg.addColorStop(0,   `rgba(${this.color}, 0)`);
      sg.addColorStop(0.5, `rgba(${this.color}, ${this._highlightA * 0.4})`);
      sg.addColorStop(1,   `rgba(${this.color}, 0)`);
      ctx.fillStyle = sg;
      ctx.fillRect(menuX, scanY - 5, menuW, 10);
    }

    ctx.restore();
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(engine) {
    this._tick += 20;
    const main = engine.interActionController.main;

    // ── Detect hovered row ─────────────────────────────────────────────────
    let hovered = -1;

    for (let i = 0; i < this.items.length; i++) {
      const gridRow = this.startRow + i;
      if (gridRow >= this._shemaY) break;

      // Check all columns in the menu width for this row
      for (let c = this.col; c < this.col + this.cols; c++) {
        const idx = gridRow * this._shemaX + c;
        if (main[idx]?.status) { hovered = i; break; }
      }
      if (hovered >= 0) break;
    }

    // ── Dwell with gap tolerance ───────────────────────────────────────────
    if (hovered >= 0) {

      if (hovered !== this.hoveredIndex) {
        // Moved to a new item — reset dwell
        this.hoveredIndex = hovered;
        this._dwellTick   = 0;
        this._fired       = false;
        this._gapTick     = 0;
      }

      this._gapTick    = 0;
      this._dwellTick += 20;

      if (this._dwellTick >= this.dwellMs && !this._fired) {
        this._fired = true;
        this.selectIndex(this.hoveredIndex);
      }

    } else {
      this._gapTick += 20;
      if (this._gapTick >= this._gapMax) {
        this.hoveredIndex = -1;
        this._dwellTick   = 0;
        this._fired       = false;
        this._gapTick     = 0;
      }
    }

    // ── Animate highlight bar ──────────────────────────────────────────────
    const targetHA = this.hoveredIndex >= 0 ? 1 : 0;
    this._highlightA += (targetHA - this._highlightA) * 0.1;

    // ── Per-item state update ──────────────────────────────────────────────
    for (let i = 0; i < this.items.length; i++) {
      const state    = this._itemStates[i];
      const isHover  = i === this.hoveredIndex;

      // Entry animation
      if (!state.entryDone) {
        if (this._tick >= state.entryDelay) {
          state.alpha  += (1 - state.alpha)  * 0.1;
          state.slideX += (0 - state.slideX) * 0.1;
          if (state.alpha > 0.98) { state.alpha = 1; state.slideX = 0; state.entryDone = true; }
        }
      }

      // Hover highlight
      const targetHL = isHover ? 1 : 0;
      state.highlight += (targetHL - state.highlight) * 0.12;

      // Flash decay
      if (state.flash > 0) state.flash = Math.max(0, state.flash - 0.04);
    }
  }
}