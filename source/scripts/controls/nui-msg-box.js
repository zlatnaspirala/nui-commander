export class NuiMsgBox {

  constructor(textMsg, callback) {
    this.name        = "NuiMsgBox";
    this.sensitivity = "mid";
    this.callback    = callback;
    this.shemaX      = 8;
    this.shemaY      = 8;
    this.yesText     = "YES";
    this.noText      = "NO";
    this.messageText = textMsg;
    this.myOpacity   = 0.3;
  }

  draw(engine) {
    const { ctx } = engine;
    const w = (col) => engine.getCanvasWidth(100)  / this.shemaX * col;
    const h = (row) => engine.getCanvasHeight(100) / this.shemaY * row;

    ctx.save();
    ctx.font = "30px sans-serif";

    // ── Message box background ──────────────────────────────────────────────
    ctx.fillStyle = `rgba(10, 150, 110, ${this.myOpacity})`;
    ctx.fillRect(w(1), h(1), w(6), h(2));

    ctx.fillStyle = "black";
    ctx.fillText(this.messageText, w(2), h(1.5), engine.getCanvasWidth(35), engine.getCanvasHeight(9));

    // ── YES button ──────────────────────────────────────────────────────────
    ctx.fillStyle = `rgba(210, 50, 110, ${this.myOpacity})`;
    ctx.fillRect(w(1), h(2), w(3), h(1));

    ctx.fillStyle = "white";
    ctx.fillText(this.yesText, w(2), h(2.7), engine.getCanvasWidth(15), engine.getCanvasHeight(9));

    // ── NO button ───────────────────────────────────────────────────────────
    ctx.fillStyle = `rgba(210, 90, 110, ${this.myOpacity})`;
    ctx.fillRect(w(4), h(2), w(3), h(1));

    ctx.fillStyle = "black";
    ctx.fillText(this.noText, w(5.1), h(2.7), engine.getCanvasWidth(35), engine.getCanvasHeight(9));

    ctx.restore();
  }

  update(engine) {
    if (this.sensitivity !== "mid") return;

    const zone = (i) => engine.interActionController.main[i].status;

    const yes = [zone(17), zone(18), zone(19)];
    const no  = [zone(20), zone(21), zone(22)];

    const adjacentPair = ([a, b, c]) => (a && b) || (b && c);

    if (adjacentPair(no)) {
      console.log("MsgBox answer is no.");
      this.callback("no");
    }

    if (adjacentPair(yes)) {
      console.log("MsgBox answer is yes.");
      this.callback("yes");
    }
  }

}