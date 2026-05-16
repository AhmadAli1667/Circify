import { SIGNAL } from '../core/signals.js';

const TYPE_COLOR = {
  CLK: '#9b7dea',
  DFF: '#d4a017',
  SRLATCH: '#d47a17',
  INPUT: '#00d15f',
  OUTPUT: '#f04d4d',
};

export class TimingDiagram {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.labelWidth = 96;
    this.rowHeight = 30;
    this.tickWidth = 14;
    this.scrollOffset = 0; // ticks scrolled from right
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
  }

  render(history, nodeMap) {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    // Background
    ctx.fillStyle = '#070b12';
    ctx.fillRect(0, 0, cw, ch);

    // Label column background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, this.labelWidth, ch);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.labelWidth, 0);
    ctx.lineTo(this.labelWidth, ch);
    ctx.stroke();

    const nodeIds = Array.from(history.keys());
    const maxTicks = nodeIds.length > 0
      ? Math.max(...nodeIds.map((id) => history.get(id)?.length ?? 0))
      : 0;

    const plotW = cw - this.labelWidth;
    const tickW = maxTicks > 0 ? Math.min(this.tickWidth, plotW / maxTicks) : this.tickWidth;

    // Tick grid
    for (let t = 0; t <= maxTicks; t++) {
      const x = this.labelWidth + t * tickW;
      if (x > cw) break;
      ctx.strokeStyle = t % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ch);
      ctx.stroke();
    }

    if (nodeIds.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.font = '11px JetBrains Mono, Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Step or play the simulation to record waveforms', cw / 2, ch / 2);
      return;
    }

    nodeIds.forEach((id, rowIdx) => {
      const signals = history.get(id) || [];
      const node = nodeMap.get(id);
      const label = (node?.label || id).substring(0, 12);
      const typeKey = node?.type || '';
      const rowColor = TYPE_COLOR[typeKey] || '#9ab8cc';
      const y = rowIdx * this.rowHeight;
      const midY = y + this.rowHeight / 2;
      const highY = y + this.rowHeight * 0.18;
      const lowY = y + this.rowHeight * 0.82;

      // Row separator
      if (rowIdx > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
        ctx.stroke();
      }

      // Row tint
      if (rowIdx % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.015)';
        ctx.fillRect(this.labelWidth, y, plotW, this.rowHeight);
      }

      // Type badge
      ctx.fillStyle = rowColor + '33';
      ctx.fillRect(2, y + 4, 18, this.rowHeight - 8);
      ctx.strokeStyle = rowColor + '88';
      ctx.lineWidth = 1;
      ctx.strokeRect(2, y + 4, 18, this.rowHeight - 8);
      ctx.fillStyle = rowColor;
      ctx.font = 'bold 7px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typeKey.substring(0, 3), 11, midY);

      // Label
      ctx.fillStyle = '#a0bccf';
      ctx.font = '10px JetBrains Mono, Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, 24, midY);

      if (!signals.length) return;

      // Waveform
      ctx.save();
      ctx.beginPath();
      ctx.rect(this.labelWidth, y, plotW, this.rowHeight);
      ctx.clip();

      let prevSig = signals[0];
      let prevX = this.labelWidth;
      let prevY2 = prevSig === SIGNAL.HIGH ? highY : prevSig === SIGNAL.FLOAT ? midY : lowY;

      for (let t = 0; t < signals.length; t++) {
        const sig = signals[t];
        const x = this.labelWidth + t * tickW;
        const nextX = x + tickW;
        const currY2 = sig === SIGNAL.HIGH ? highY : sig === SIGNAL.FLOAT ? midY : lowY;
        const color = sig === SIGNAL.HIGH ? rowColor : sig === SIGNAL.FLOAT ? '#7a5c00' : rowColor + 'aa';

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = sig === SIGNAL.HIGH ? rowColor : 'transparent';
        ctx.shadowBlur = sig === SIGNAL.HIGH ? 4 : 0;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY2);

        if (currY2 !== prevY2) {
          // Transition edge
          ctx.lineTo(x, prevY2);
          ctx.stroke();
          ctx.beginPath();
          ctx.strokeStyle = '#ffffff44';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
          ctx.moveTo(x, prevY2);
          ctx.lineTo(x, currY2);
          ctx.stroke();
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = sig === SIGNAL.HIGH ? rowColor : 'transparent';
          ctx.shadowBlur = sig === SIGNAL.HIGH ? 4 : 0;
          ctx.moveTo(x, currY2);
        }

        ctx.lineTo(nextX, currY2);
        ctx.stroke();

        prevSig = sig;
        prevX = nextX;
        prevY2 = currY2;
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Tick counter at top-right
    if (maxTicks > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`${maxTicks} ticks`, cw - 4, 3);
    }
  }
}
