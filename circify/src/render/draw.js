import { SIGNAL, PALETTE, ICON_PATHS, GRID_SIZE, signalColor } from '../core/signals.js';
import { cubicBezierPoint, connectionCurveFromPins } from './bezier.js';

const MONO = 'JetBrains Mono, Consolas, monospace';

export function drawRoundedRect(ctx, x, y, w, h, r) {
  const rc = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rc, y);
  ctx.lineTo(x + w - rc, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rc);
  ctx.lineTo(x + w, y + h - rc);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rc, y + h);
  ctx.lineTo(x + rc, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rc);
  ctx.lineTo(x, y + rc);
  ctx.quadraticCurveTo(x, y, x + rc, y);
  ctx.closePath();
}

export function drawGrid(ctx, viewport, width, height) {
  const left   = -viewport.tx / viewport.scale;
  const top    = -viewport.ty / viewport.scale;
  const right  = (width  - viewport.tx) / viewport.scale;
  const bottom = (height - viewport.ty) / viewport.scale;
  ctx.save();
  ctx.lineWidth   = 1 / viewport.scale;
  ctx.strokeStyle = PALETTE.grid;
  ctx.beginPath();
  const sx = Math.floor(left / GRID_SIZE) * GRID_SIZE;
  const sy = Math.floor(top  / GRID_SIZE) * GRID_SIZE;
  for (let x = sx; x <= Math.ceil(right  / GRID_SIZE) * GRID_SIZE; x += GRID_SIZE) {
    ctx.moveTo(x, top); ctx.lineTo(x, bottom);
  }
  for (let y = sy; y <= Math.ceil(bottom / GRID_SIZE) * GRID_SIZE; y += GRID_SIZE) {
    ctx.moveTo(left, y); ctx.lineTo(right, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawConnections(ctx, edges, nodes, timeMs) {
  for (const edge of edges.values()) {
    const source = nodes.get(edge.sourceID);
    const target = nodes.get(edge.targetID);
    if (!source || !target) continue;
    const p0 = source.outputPin;
    const p3 = target.inputPins[edge.targetPinIndex];
    if (!p0 || !p3) continue;

    const curve   = connectionCurveFromPins(p0, p3);
    const c       = signalColor(edge.signal);
    const isHigh  = edge.signal === SIGNAL.HIGH;
    const isFloat = edge.signal === SIGNAL.FLOAT;

    ctx.save();
    ctx.lineWidth   = isHigh ? 3.2 : 2.4;
    ctx.strokeStyle = c;
    ctx.shadowBlur  = isHigh ? 14 : isFloat ? 0 : 2;
    ctx.shadowColor = c;
    if (isFloat) ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(curve.p0.x, curve.p0.y);
    ctx.bezierCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y, curve.p3.x, curve.p3.y);
    ctx.stroke();
    ctx.restore();

    if (isHigh) {
      for (let i = 0; i < 3; i++) {
        const t  = (timeMs * 0.00055 + edge.pulseOffset + i * 0.28) % 1;
        const pt = cubicBezierPoint(curve.p0, curve.p1, curve.p2, curve.p3, t);
        ctx.save();
        ctx.fillStyle   = '#d0faff';
        ctx.shadowColor = '#00f2ff';
        ctx.shadowBlur  = 18;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const mid   = cubicBezierPoint(curve.p0, curve.p1, curve.p2, curve.p3, 0.5);
    const label = edge.signal === SIGNAL.HIGH ? '1' : edge.signal === SIGNAL.LOW ? '0' : 'Z';
    ctx.save();
    ctx.fillStyle = c + 'cc';
    drawRoundedRect(ctx, mid.x - 6.5, mid.y - 5.5, 13, 11, 4);
    ctx.fill();
    ctx.font         = `bold 8px ${MONO}`;
    ctx.fillStyle    = '#fff';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, mid.x, mid.y);
    ctx.restore();
  }
}

function drawClockBody(ctx, node) {
  const cx = node.x + node.width * 0.44;
  const cy = node.y + node.height * 0.5;
  const ww = 18, hh = 9;
  const color = signalColor(node.outputState);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.6;
  ctx.shadowColor = node.outputState === SIGNAL.HIGH ? color : 'transparent';
  ctx.shadowBlur  = node.outputState === SIGNAL.HIGH ? 6 : 0;
  ctx.beginPath();
  ctx.moveTo(cx - ww / 2, cy + hh / 2);
  ctx.lineTo(cx - ww / 4, cy + hh / 2);
  ctx.lineTo(cx - ww / 4, cy - hh / 2);
  ctx.lineTo(cx + ww / 4, cy - hh / 2);
  ctx.lineTo(cx + ww / 4, cy + hh / 2);
  ctx.lineTo(cx + ww / 2, cy + hh / 2);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x + node.width - 14, node.y + node.height / 2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDFFBody(ctx, node) {
  const step = node.height / 3;
  ctx.save();
  ctx.font         = `bold 9px ${MONO}`;
  ctx.fillStyle    = PALETTE.pinLabel;
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  ctx.fillText('D', node.x + 6, node.y + step);
  ctx.fillText('▷', node.x + 5, node.y + step * 2);
  ctx.textAlign = 'right';
  ctx.fillText('Q', node.x + node.width - 6, node.y + step);
  ctx.restore();
  ctx.save();
  ctx.font         = `bold 12px ${MONO}`;
  ctx.fillStyle    = PALETTE.nodeStroke;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DFF', node.x + node.width * 0.5, node.y + node.height * 0.58);
  ctx.restore();
  const qColor = signalColor(node.outputState);
  ctx.save();
  ctx.fillStyle   = qColor;
  ctx.shadowColor = qColor;
  ctx.shadowBlur  = node.outputState === SIGNAL.HIGH ? 10 : 2;
  ctx.beginPath();
  ctx.arc(node.x + node.width - 6, node.y + step, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSRLatchBody(ctx, node) {
  const step = node.height / 3;
  ctx.save();
  ctx.font         = `bold 9px ${MONO}`;
  ctx.fillStyle    = PALETTE.pinLabel;
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  ctx.fillText('S', node.x + 6, node.y + step);
  ctx.fillText('R', node.x + 6, node.y + step * 2);
  ctx.textAlign = 'right';
  ctx.fillText('Q', node.x + node.width - 6, node.y + step);
  ctx.restore();
  ctx.save();
  ctx.font         = `bold 11px ${MONO}`;
  ctx.fillStyle    = PALETTE.nodeStroke;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SR', node.x + node.width * 0.5, node.y + node.height * 0.58);
  ctx.restore();
}

export function drawNode(ctx, node, selectedNodeID) {
  const selected  = node.id === selectedNodeID;
  const isHigh    = node.outputState === SIGNAL.HIGH;
  const stroke    = selected ? PALETTE.selected : PALETTE.nodeStroke;
  const glowColor = isHigh ? PALETTE.high : selected ? PALETTE.selected : PALETTE.nodeShadow;

  if (selected) {
    ctx.save();
    ctx.strokeStyle = PALETTE.selected + '55';
    ctx.lineWidth   = 4;
    drawRoundedRect(ctx, node.x - 3, node.y - 3, node.width + 6, node.height + 6, 13);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.shadowBlur  = isHigh ? 18 : selected ? 8 : 4;
  ctx.shadowColor = glowColor;
  drawRoundedRect(ctx, node.x, node.y, node.width, node.height, 10);
  const grad = ctx.createLinearGradient(node.x, node.y, node.x, node.y + node.height);
  grad.addColorStop(0, PALETTE.nodeFill0);
  grad.addColorStop(1, PALETTE.nodeFill1);
  ctx.fillStyle   = grad;
  ctx.fill();
  ctx.lineWidth   = selected ? 2.2 : 1.4;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();

  switch (node.type) {
    case 'CLK':     drawClockBody(ctx, node); break;
    case 'DFF':     drawDFFBody(ctx, node); break;
    case 'SRLATCH': drawSRLatchBody(ctx, node); break;
    case 'INPUT': {
      const isHi  = node.outputState === SIGNAL.HIGH;
      const color = signalColor(node.outputState);
      ctx.save();
      ctx.fillStyle    = color;
      ctx.shadowColor  = isHi ? color : 'transparent';
      ctx.shadowBlur   = isHi ? 10 : 0;
      ctx.font         = `bold 18px ${MONO}`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isHi ? '1' : '0', node.x + node.width * 0.46, node.y + node.height * 0.54);
      ctx.restore();
      break;
    }
    case 'OUTPUT': {
      const color = signalColor(node.outputState);
      const cx = node.x + node.width * 0.56;
      const cy = node.y + node.height * 0.5;
      ctx.save();
      ctx.strokeStyle = color + '55';
      ctx.lineWidth   = 4;
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle   = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = node.outputState === SIGNAL.HIGH ? 14 : 3;
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle    = '#fff';
      ctx.shadowBlur   = 0;
      ctx.font         = `bold 9px ${MONO}`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        node.outputState === SIGNAL.HIGH ? '1' : node.outputState === SIGNAL.LOW ? '0' : 'Z',
        cx, cy
      );
      ctx.restore();
      break;
    }
    default:
      if (ICON_PATHS[node.type]) {
        ctx.save();
        ctx.translate(node.x + node.width * 0.52, node.y + node.height * 0.5);
        ctx.scale(1.15, 1.15);
        ctx.lineWidth   = 1.5;
        ctx.strokeStyle = isHigh ? '#a0d8f0' : PALETTE.pinLabel;
        ctx.stroke(new Path2D(ICON_PATHS[node.type]));
        ctx.restore();
      }
  }

  for (const pin of node.inputPins) {
    const color = signalColor(node.inputStates[pin.index]);
    ctx.save();
    ctx.fillStyle   = color;
    ctx.shadowColor = color;
    ctx.shadowBlur  = node.inputStates[pin.index] === SIGNAL.HIGH ? 6 : 1;
    ctx.beginPath(); ctx.arc(pin.x, pin.y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  if (node.outputPin && node.type !== 'DFF') {
    ctx.save();
    ctx.fillStyle   = signalColor(node.outputState);
    ctx.shadowColor = signalColor(node.outputState);
    ctx.shadowBlur  = isHigh ? 8 : 1;
    ctx.beginPath(); ctx.arc(node.outputPin.x, node.outputPin.y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle    = selected ? '#c8e8f8' : PALETTE.pinLabel;
  ctx.font         = `10px ${MONO}`;
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(node.label || `${node.type}_${node.id}`, node.x + 4, node.y - 4);
  ctx.restore();
}

export function drawConnectPreview(ctx, connecting, snappedTarget) {
  if (!connecting) return;
  const p0 = connecting.from, p3 = connecting.to;
  const dx = Math.max(40, Math.abs(p3.x - p0.x) * 0.5);
  const p1 = { x: p0.x + dx, y: p0.y };
  const p2 = { x: p3.x - dx, y: p3.y };

  ctx.save();
  ctx.setLineDash([9, 6]);
  ctx.lineWidth   = 2.4;
  ctx.strokeStyle = PALETTE.selected;
  ctx.shadowBlur  = 12;
  ctx.shadowColor = PALETTE.selected;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  ctx.stroke();
  ctx.restore();

  if (snappedTarget) {
    ctx.save();
    ctx.strokeStyle = PALETTE.selected;
    ctx.fillStyle   = PALETTE.selected + '44';
    ctx.lineWidth   = 2;
    ctx.shadowColor = PALETTE.selected;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.arc(snappedTarget.pin.x, snappedTarget.pin.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
