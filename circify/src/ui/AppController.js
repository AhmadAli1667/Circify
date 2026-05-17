import {
  SIGNAL,
  PIN_SNAP_RADIUS,
  PALETTE,
  TYPE_LIST,
  TYPE_SYMBOL,
  makeId,
  snapToGrid,
  worldDistance,
} from '../core/signals.js';
import {
  AndGate,
  OrGate,
  NotGate,
  XorGate,
  XnorGate,
  NandGate,
  NorGate,
  BufferGate,
  InputSource,
  OutputProbe,
} from '../core/components.js';
import { ClockSource, DFlipFlop, SRLatch } from '../core/sequential.js';
import { CircuitGraph } from '../core/graph.js';
import { SimEngine } from '../core/simEngine.js';
import { TimingDiagram } from './timingDiagram.js';
import { drawGrid, drawConnections, drawNode, drawConnectPreview } from '../render/draw.js';
import { connectionCurveFromPins, nearestPointOnBezierApprox } from '../render/bezier.js';
import { quineMcCluskeyMinimize, implicantsToSOP, grayCodeList } from '../analysis/minimizer.js';
import { toVerilog } from '../io/verilog.js';
import { getTemplate } from './templates.js';

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export class AppController {
  constructor() {
    this.workspace = document.getElementById('workspace');
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.backCanvas = document.createElement('canvas');
    this.backCtx = this.backCanvas.getContext('2d');

    this.statusLine = document.getElementById('statusLine');
    this.dataBox = document.getElementById('dataBox');
    this.contextMenu = document.getElementById('contextMenu');
    this.analysisOverlay = document.getElementById('analysisOverlay');
    this.truthTableWrap = document.getElementById('truthTableWrap');
    this.kmapWrap = document.getElementById('kmapWrap');
    this.simplifiedExprBox = document.getElementById('simplifiedExprBox');

    this.analysisState = {
      rows: [],
      inputNodes: [],
      outputNodes: [],
      selectedOutputID: null,
      simplified: null,
    };

    this.graph = new CircuitGraph();
    this.zoomLimits = { min: 0.7, max: 1.8 };
    this.currentCircuitName = 'Circuit 1';
    this.circuits = new Map();
    this.undoStack = [];
    this.redoStack = [];

    this.viewport = { tx: 0, ty: 0, scale: 1 };

    this.interaction = {
      draggingNodeID: null,
      dragOffset: { x: 0, y: 0 },
      panning: false,
      panStart: { x: 0, y: 0 },
      mouseWorld: { x: 0, y: 0 },
      connecting: null,
      snappedTarget: null,
      clickStart: null,
      dragSnapshot: null,
    };

    this.selectedNodeID = null;
    this.contextNodeID = null;
    this.contextEdgeID = null;

    // Sequential simulation
    this.simEngine = new SimEngine(this.graph);
    this.timingDiagram = null;
    this.timingPanelVisible = false;

    this.simEngine.onTick = (tick) => {
      const el = document.getElementById('simTickCount');
      if (el) el.textContent = String(tick);
      this.updatePropertiesPanel(this.selectedNodeID);
      this._renderTimingDiagram();
    };
    this.simEngine.onError = (msg) => this.setStatus(msg, true);

    this.bindUI();
    this.bindCanvasEvents();
    this.bindKeyboard();
    this.resize();
    this.setTheme('cyber');
    this.seedDemo();
    this.captureSnapshot();
    this.saveCurrentCircuit();
    this.updateZoomUI();
    requestAnimationFrame((t) => this.render(t));
  }

  // ── Status ────────────────────────────────────────────────────────────────

  setStatus(text, isError = false) {
    this.statusLine.textContent = text;
    this.statusLine.style.color = isError ? '#ff8d98' : '#9bc3db';
    const dot = document.getElementById('statusDot');
    if (dot) dot.classList.toggle('error', isError);
  }

  // ── UI Bindings ───────────────────────────────────────────────────────────

  bindUI() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById(`tab-${tabName}`);
        if (pane) pane.classList.add('active');
      });
    });

    const gateButtons = document.getElementById('gateButtons');
    TYPE_LIST.forEach((type) => {
      const btn = document.createElement('button');
      btn.className = 'gate-btn';
      btn.dataset.gateType = type;
      btn.innerHTML = `<span class="sym">${TYPE_SYMBOL[type]}</span><span>${type}</span>`;
      btn.addEventListener('click', () => this.addGate(type));
      gateButtons.appendChild(btn);
    });

    document.getElementById('addInputBtn').addEventListener('click', () => this.addInput());
    document.getElementById('addOutputBtn').addEventListener('click', () => this.addOutput());

    // Sequential
    document.getElementById('addClkBtn').addEventListener('click', () => this.addClock());
    document.getElementById('addDFFBtn').addEventListener('click', () => this.addDFF());
    document.getElementById('addSRLatchBtn').addEventListener('click', () => this.addSRLatch());

    // Templates
    document.getElementById('loadTemplateBtn').addEventListener('click', () => {
      const id = document.getElementById('templateSelect').value;
      if (id) this.loadTemplate(id);
    });

    // View controls
    document.getElementById('zoomInBtn').addEventListener('click', () => this.stepZoom(1.15));
    document.getElementById('zoomOutBtn').addEventListener('click', () => this.stepZoom(0.87));
    document.getElementById('zoomResetBtn').addEventListener('click', () => this.resetView());
    document.getElementById('locateTopBtn').addEventListener('click', () => this.fitToCircuit());
    document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJson());
    document.getElementById('runTopBtn').addEventListener('click', () => this.runSimulation());
    document.getElementById('analyzeTopBtn').addEventListener('click', () => this.openAnalysisPanel());
    document.getElementById('themeSelect').addEventListener('change', (e) => this.setTheme(e.target.value));

    // Project
    document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    document.getElementById('redoBtn').addEventListener('click', () => this.redo());
    document.getElementById('newCircuitBtn').addEventListener('click', () => this.createCircuit());
    document.getElementById('saveCircuitBtn').addEventListener('click', () => this.saveCurrentCircuit());
    document.getElementById('deleteCircuitBtn').addEventListener('click', () => this.deleteCurrentCircuit());
    document.getElementById('circuitSelect').addEventListener('change', (e) => this.switchCircuit(e.target.value));
    document.getElementById('zoomSlider').addEventListener('input', (e) => {
      this.applyZoom(Number(e.target.value) / 100, this.getFocusWorldPoint());
    });

    // Simulation controls
    document.getElementById('simPlayBtn').addEventListener('click', () => {
      this.simEngine.start();
      document.getElementById('simPlayBtn').classList.add('active');
      document.getElementById('simPauseBtn').classList.remove('active');
      this.setStatus('Simulation running…');
    });
    document.getElementById('simPauseBtn').addEventListener('click', () => {
      this.simEngine.stop();
      document.getElementById('simPlayBtn').classList.remove('active');
      document.getElementById('simPauseBtn').classList.add('active');
      this.setStatus('Simulation paused.');
    });
    document.getElementById('simStepBtn').addEventListener('click', () => {
      try {
        this.simEngine.step();
        this.setStatus(`Stepped → tick ${this.simEngine.tick}`);
      } catch (err) {
        this.setStatus(err.message, true);
      }
    });
    document.getElementById('simResetBtn').addEventListener('click', () => {
      this.simEngine.reset();
      document.getElementById('simPlayBtn').classList.remove('active');
      document.getElementById('simPauseBtn').classList.remove('active');
      const el = document.getElementById('simTickCount');
      if (el) el.textContent = '0';
      this._renderTimingDiagram();
      this.setStatus('Simulation reset.');
    });
    document.getElementById('simSpeedSlider').addEventListener('input', (e) => {
      const hz = Number(e.target.value);
      this.simEngine.setSpeed(hz);
      const lbl = document.getElementById('simSpeedLabel');
      if (lbl) lbl.textContent = `${hz} Hz`;
    });

    // Timing diagram toggle
    document.getElementById('toggleTimingBtn').addEventListener('click', () => this.toggleTimingPanel());
    document.getElementById('closeTimingBtn').addEventListener('click', () => {
      this.timingPanelVisible = false;
      document.getElementById('timingPanel').style.display = 'none';
      document.getElementById('toggleTimingBtn').classList.remove('active');
    });

    // Data / IO
    document.getElementById('closeAnalysisBtn').addEventListener('click', () => this.closeAnalysisPanel());
    document.getElementById('buildTruthTableBtn').addEventListener('click', () => this.buildTruthTable());
    document.getElementById('drawKmapBtn').addEventListener('click', () => this.drawKmapForSelection());
    document.getElementById('drawSimplifiedBtn').addEventListener('click', () => this.drawSimplifiedCircuit());
    document.getElementById('kmapOutputSelect').addEventListener('change', (e) => {
      this.analysisState.selectedOutputID = e.target.value || null;
    });
    document.getElementById('insertCircuitSummaryBtn').addEventListener('click', () => {
      document.getElementById('aiPromptBox').value = this.getCircuitSummaryPrompt();
      this.setStatus('Circuit summary copied into AI prompt box.');
    });
    document.getElementById('askAIBtn').addEventListener('click', () => this.askAIProvider());

    document.getElementById('saveBtn').addEventListener('click', () => {
      this.dataBox.value = this.graph.toJSON(this.viewport);
      this.setStatus('Circuit serialized to JSON.');
    });

    document.getElementById('loadBtn').addEventListener('click', () => {
      try {
        const loaded = this.graph.fromJSON(this.dataBox.value.trim());
        if (loaded.viewport) {
          this.viewport = {
            tx: loaded.viewport.tx ?? 0,
            ty: loaded.viewport.ty ?? 0,
            scale: Math.max(this.zoomLimits.min, Math.min(this.zoomLimits.max, loaded.viewport.scale ?? 1)),
          };
        }
        this.simEngine.syncGraph(this.graph);
        this.clampViewportToCircuit();
        this.updateZoomUI();
        this.setStatus('Circuit restored from JSON.');
      } catch (err) {
        this.setStatus(`Load failed: ${err.message}`, true);
      }
    });

    document.getElementById('verilogBtn').addEventListener('click', () => {
      try {
        this.dataBox.value = toVerilog(this.graph);
        this.setStatus('Verilog generated via topological sort.');
      } catch (err) {
        this.setStatus(err.message, true);
      }
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      this.captureSnapshot();
      this.graph.clear();
      this.selectedNodeID = null;
      this.simEngine.syncGraph(this.graph);
      this.updatePropertiesPanel(null);
      this.saveCurrentCircuit();
      this.setStatus('Circuit cleared.');
    });

    this.contextMenu.addEventListener('click', (evt) => {
      const action = evt.target.getAttribute('data-action');
      if (!action) return;
      const node = this.contextNodeID ? this.graph.getNode(this.contextNodeID) : null;

      if (action === 'delete' && node) {
        this.captureSnapshot();
        this.graph.removeNode(node.id);
        if (this.selectedNodeID === node.id) {
          this.selectedNodeID = null;
          this.updatePropertiesPanel(null);
        }
        this.saveCurrentCircuit();
        this.setStatus(`Deleted ${node.type} (${node.id}).`);
      }
      if (action === 'toggle-inputs' && node) {
        if (node.toggleInputCount()) {
          this.captureSnapshot();
          this.graph.cleanupInvalidPinConnections(node.id);
          this.saveCurrentCircuit();
          this.setStatus(`Input count changed to ${node.inputCount} for ${node.id}.`);
        } else {
          this.setStatus('Input count cannot be changed for this component.', true);
        }
      }
      if (action === 'rename' && node) {
        const nextLabel = window.prompt('Enter new name:', node.label || node.id);
        if (nextLabel && nextLabel.trim()) {
          this.captureSnapshot();
          node.label = nextLabel.trim();
          this.saveCurrentCircuit();
          this.updatePropertiesPanel(this.selectedNodeID);
          this.setStatus(`Renamed ${node.id} to ${node.label}.`);
        }
      }
      if (action === 'delete-wire' && this.contextEdgeID) {
        this.captureSnapshot();
        this.graph.removeConnection(this.contextEdgeID);
        this.graph.stabilizeAll();
        this.saveCurrentCircuit();
        this.setStatus('Wire deleted.');
      }
      this.hideContextMenu();
    });

    window.addEventListener('pointerdown', (evt) => {
      if (evt.button === 2) return;
      if (this.contextMenu.style.display === 'block' && this.contextMenu.contains(evt.target)) return;
      this.hideContextMenu();
    });
    window.addEventListener('resize', () => {
      this.resize();
      if (this.timingPanelVisible) this._resizeTimingDiagram();
    });
  }

  // ── Keyboard Shortcuts ────────────────────────────────────────────────────

  bindKeyboard() {
    window.addEventListener('keydown', (evt) => {
      const tag = evt.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((evt.key === 'Delete' || evt.key === 'Backspace') && this.selectedNodeID) {
        evt.preventDefault();
        this.captureSnapshot();
        this.graph.removeNode(this.selectedNodeID);
        this.selectedNodeID = null;
        this.updatePropertiesPanel(null);
        this.saveCurrentCircuit();
        this.setStatus('Node deleted.');
        return;
      }

      if (evt.ctrlKey && !evt.shiftKey && evt.key === 'z') {
        evt.preventDefault();
        this.undo();
        return;
      }

      if ((evt.ctrlKey && evt.key === 'y') || (evt.ctrlKey && evt.shiftKey && evt.key === 'Z')) {
        evt.preventDefault();
        this.redo();
        return;
      }

      if (evt.key === 'Escape') {
        evt.preventDefault();
        this.interaction.connecting = null;
        this.interaction.snappedTarget = null;
        if (this.selectedNodeID) {
          this.selectedNodeID = null;
          this.updatePropertiesPanel(null);
        }
        this.hideContextMenu();
        return;
      }

      if (evt.key === 'f' || evt.key === 'F') {
        evt.preventDefault();
        this.fitToCircuit();
        return;
      }

      if (evt.key === ' ') {
        evt.preventDefault();
        try {
          this.simEngine.step();
          this.setStatus(`Stepped → tick ${this.simEngine.tick}`);
        } catch (err) {
          this.setStatus(err.message, true);
        }
      }
    });
  }

  // ── Zoom / Viewport ───────────────────────────────────────────────────────

  stepZoom(factor) {
    const nextScale = Math.max(
      this.zoomLimits.min,
      Math.min(this.zoomLimits.max, this.viewport.scale * factor)
    );
    this.applyZoom(nextScale, this.getFocusWorldPoint());
    this.setStatus(`Zoom: ${Math.round(this.viewport.scale * 100)}%`);
  }

  getFocusWorldPoint() {
    const selected = this.selectedNodeID ? this.graph.getNode(this.selectedNodeID) : null;
    if (selected) return { x: selected.x + selected.width * 0.5, y: selected.y + selected.height * 0.5 };

    const nodes = Array.from(this.graph.nodes.values());
    if (nodes.length === 0) {
      const rect = this.canvas.getBoundingClientRect();
      return this.clientToWorld(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
    }
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + n.width));
    const maxY = Math.max(...nodes.map((n) => n.y + n.height));
    return { x: (minX + maxX) * 0.5, y: (minY + maxY) * 0.5 };
  }

  applyZoom(nextScale, focusWorld) {
    this.viewport.scale = Math.max(this.zoomLimits.min, Math.min(this.zoomLimits.max, nextScale));
    this.viewport.tx = this.canvas.clientWidth * 0.5 - focusWorld.x * this.viewport.scale;
    this.viewport.ty = this.canvas.clientHeight * 0.5 - focusWorld.y * this.viewport.scale;
    this.clampViewportToCircuit();
    this.updateZoomUI();
  }

  clampViewportToCircuit() {
    const nodes = Array.from(this.graph.nodes.values());
    if (nodes.length === 0) return;
    const minX = Math.min(...nodes.map((n) => n.x)) - 220;
    const minY = Math.min(...nodes.map((n) => n.y)) - 220;
    const maxX = Math.max(...nodes.map((n) => n.x + n.width)) + 220;
    const maxY = Math.max(...nodes.map((n) => n.y + n.height)) + 220;
    const minTx = this.canvas.clientWidth - maxX * this.viewport.scale;
    const maxTx = -minX * this.viewport.scale;
    const minTy = this.canvas.clientHeight - maxY * this.viewport.scale;
    const maxTy = -minY * this.viewport.scale;
    this.viewport.tx = Math.min(maxTx, Math.max(minTx, this.viewport.tx));
    this.viewport.ty = Math.min(maxTy, Math.max(minTy, this.viewport.ty));
  }

  updateZoomUI() {
    const pct = Math.round(this.viewport.scale * 100);
    const slider = document.getElementById('zoomSlider');
    const label = document.getElementById('zoomPct');
    if (slider) slider.value = String(pct);
    if (label) label.textContent = `${pct}%`;
  }

  resetView() {
    this.viewport.scale = 1;
    this.viewport.tx = this.canvas.clientWidth * 0.12;
    this.viewport.ty = this.canvas.clientHeight * 0.18;
    this.clampViewportToCircuit();
    this.updateZoomUI();
    this.setStatus('Viewport reset.');
  }

  fitToCircuit() {
    const nodes = Array.from(this.graph.nodes.values());
    if (nodes.length === 0) { this.resetView(); return; }
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + n.width));
    const maxY = Math.max(...nodes.map((n) => n.y + n.height));
    const pad = 80;
    const sx = this.canvas.clientWidth / Math.max(100, maxX - minX + pad * 2);
    const sy = this.canvas.clientHeight / Math.max(100, maxY - minY + pad * 2);
    this.viewport.scale = Math.max(this.zoomLimits.min, Math.min(this.zoomLimits.max, Math.min(sx, sy)));
    this.viewport.tx = this.canvas.clientWidth * 0.5 - (minX + maxX) * 0.5 * this.viewport.scale;
    this.viewport.ty = this.canvas.clientHeight * 0.5 - (minY + maxY) * 0.5 * this.viewport.scale;
    this.updateZoomUI();
    this.setStatus('Viewport centered on current circuit.');
  }

  // ── Theme ─────────────────────────────────────────────────────────────────

  setTheme(themeName) {
    const mono = themeName === 'mono';
    document.body.setAttribute('data-theme', mono ? 'mono' : 'cyber');

    if (mono) {
      PALETTE.high      = '#111111';
      PALETTE.low       = '#747474';
      PALETTE.floating  = '#aaaaaa';
      PALETTE.selected  = '#000000';
      PALETTE.grid      = '#d8d8d8';
      PALETTE.nodeFill0 = 'rgba(245, 245, 248, 0.97)';
      PALETTE.nodeFill1 = 'rgba(230, 230, 235, 0.97)';
      PALETTE.nodeStroke = '#999999';
      PALETTE.nodeShadow = '#bbbbbb';
      PALETTE.pinLabel   = '#555555';
    } else {
      PALETTE.high      = '#00d15f';
      PALETTE.low       = '#f04d4d';
      PALETTE.floating  = '#4a6a80';
      PALETTE.selected  = '#13d1a5';
      PALETTE.grid      = '#1a2030';
      PALETTE.nodeFill0 = 'rgba(22, 32, 48, 0.97)';
      PALETTE.nodeFill1 = 'rgba(10, 16, 26, 0.97)';
      PALETTE.nodeStroke = '#2e4055';
      PALETTE.nodeShadow = '#0e1c2a';
      PALETTE.pinLabel   = '#7a9ab2';
    }

    this.setStatus(`Theme: ${mono ? 'B&W Light' : 'Cyber Dark'}.`);
  }

  // ── Simulation ────────────────────────────────────────────────────────────

  runSimulation() {
    try {
      this.graph.stabilizeAll();
      this.updatePropertiesPanel(this.selectedNodeID);
      this.setStatus('Circuit stabilized.');
    } catch (err) {
      this.setStatus(`Simulation error: ${err.message}`, true);
    }
  }

  // ── Timing Diagram ────────────────────────────────────────────────────────

  toggleTimingPanel() {
    this.timingPanelVisible = !this.timingPanelVisible;
    const panel = document.getElementById('timingPanel');
    const toggleBtn = document.getElementById('toggleTimingBtn');
    if (!panel) return;

    if (this.timingPanelVisible) {
      panel.style.display = 'flex';
      toggleBtn?.classList.add('active');
      if (!this.timingDiagram) {
        const canvas = document.getElementById('timingCanvas');
        this.timingDiagram = new TimingDiagram(canvas);
      }
      this._resizeTimingDiagram();
    } else {
      panel.style.display = 'none';
      toggleBtn?.classList.remove('active');
    }
  }

  _resizeTimingDiagram() {
    if (!this.timingDiagram) return;
    const canvas = document.getElementById('timingCanvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    this.timingDiagram.resize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
    this._renderTimingDiagram();
  }

  _renderTimingDiagram() {
    if (!this.timingPanelVisible || !this.timingDiagram) return;
    this.timingDiagram.render(this.simEngine.history, this.graph.nodes);
  }

  // ── Properties Panel ──────────────────────────────────────────────────────

  updatePropertiesPanel(nodeID) {
    const panel = document.getElementById('propertiesPanel');
    const body = document.getElementById('propertiesBody');
    if (!panel || !body) return;
    if (!nodeID) {
      panel.style.display = 'none';
      return;
    }
    const node = this.graph.getNode(nodeID);
    if (!node) {
      panel.style.display = 'none';
      return;
    }
    panel.style.display = '';

    const pinState = (s) => (s === SIGNAL.HIGH ? '1' : s === SIGNAL.LOW ? '0' : 'Z');
    const sigClass = (s) => (s === SIGNAL.HIGH ? 'sig-high' : s === SIGNAL.LOW ? 'sig-low' : 'sig-float');

    const inputRows = node.inputPins.map((pin, i) => {
      const s = node.inputStates[i];
      const label = node.type === 'DFF' ? (i === 0 ? 'D' : 'CLK') :
                    node.type === 'SRLATCH' ? (i === 0 ? 'S' : 'R') : `In ${i}`;
      return `<div class="prop-row">
        <span class="prop-key">${label}</span>
        <span class="prop-val ${sigClass(s)}">${pinState(s)}</span>
      </div>`;
    }).join('');

    body.innerHTML = `
      <div class="prop-row">
        <span class="prop-key">Type</span>
        <span class="prop-val prop-type">${escapeHtml(node.type)}</span>
      </div>
      <div class="prop-row">
        <span class="prop-key">Label</span>
        <span class="prop-val prop-label">${escapeHtml(node.label || '')}</span>
      </div>
      ${inputRows}
      <div class="prop-row">
        <span class="prop-key">Output</span>
        <span class="prop-val ${sigClass(node.outputState)}">${pinState(node.outputState)}</span>
      </div>
      <div class="prop-row">
        <span class="prop-key">ID</span>
        <span class="prop-val prop-id">${escapeHtml(String(node.id))}</span>
      </div>
    `;
  }

  // ── Circuit Management ────────────────────────────────────────────────────

  refreshCircuitList() {
    const select = document.getElementById('circuitSelect');
    const names = Array.from(this.circuits.keys());
    select.innerHTML = '';
    names.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === this.currentCircuitName) opt.selected = true;
      select.appendChild(opt);
    });
  }

  saveCurrentCircuit() {
    this.circuits.set(this.currentCircuitName, this.graph.toJSON(this.viewport));
    this.refreshCircuitList();
    this.setStatus(`Saved "${this.currentCircuitName}".`);
  }

  createCircuit() {
    const name = window.prompt('New circuit name:', `Circuit ${this.circuits.size + 1}`);
    if (!name || !name.trim()) return;
    this.currentCircuitName = name.trim();
    this.captureSnapshot();
    this.graph.clear();
    this.simEngine.syncGraph(this.graph);
    this.selectedNodeID = null;
    this.updatePropertiesPanel(null);
    this.viewport = { tx: this.canvas.clientWidth * 0.12, ty: this.canvas.clientHeight * 0.18, scale: 1 };
    this.saveCurrentCircuit();
  }

  switchCircuit(name) {
    if (!this.circuits.has(name)) return;
    this.currentCircuitName = name;
    this.applySnapshot(this.circuits.get(name));
    this.simEngine.syncGraph(this.graph);
    this.selectedNodeID = null;
    this.updatePropertiesPanel(null);
    this.setStatus(`Switched to "${name}".`);
  }

  deleteCurrentCircuit() {
    if (this.circuits.size <= 1) {
      this.setStatus('At least one circuit must remain.', true);
      return;
    }
    this.circuits.delete(this.currentCircuitName);
    this.currentCircuitName = Array.from(this.circuits.keys())[0];
    this.switchCircuit(this.currentCircuitName);
    this.refreshCircuitList();
  }

  exportJson() {
    const json = this.graph.toJSON(this.viewport);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentCircuitName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.setStatus('Circuit exported as JSON.');
  }

  // ── Undo / Redo ───────────────────────────────────────────────────────────

  captureSnapshot() {
    this.undoStack.push(this.graph.toJSON(this.viewport));
    if (this.undoStack.length > 100) this.undoStack.shift();
    this.redoStack.length = 0;
  }

  applySnapshot(json) {
    const loaded = this.graph.fromJSON(json);
    if (loaded.viewport) {
      this.viewport = {
        tx: loaded.viewport.tx ?? 0,
        ty: loaded.viewport.ty ?? 0,
        scale: Math.max(this.zoomLimits.min, Math.min(this.zoomLimits.max, loaded.viewport.scale ?? 1)),
      };
    }
    this.clampViewportToCircuit();
    this.updateZoomUI();
  }

  undo() {
    if (!this.undoStack.length) return;
    this.redoStack.push(this.graph.toJSON(this.viewport));
    this.applySnapshot(this.undoStack.pop());
    this.updatePropertiesPanel(this.selectedNodeID);
    this.setStatus('Undo applied.');
  }

  redo() {
    if (!this.redoStack.length) return;
    this.undoStack.push(this.graph.toJSON(this.viewport));
    this.applySnapshot(this.redoStack.pop());
    this.updatePropertiesPanel(this.selectedNodeID);
    this.setStatus('Redo applied.');
  }

  // ── Node Placement ────────────────────────────────────────────────────────

  _placementCenter(offsetX = 0, offsetY = 0) {
    const rect = this.canvas.getBoundingClientRect();
    const c = this.clientToWorld(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
    return {
      x: snapToGrid(c.x + offsetX + (Math.random() - 0.5) * 40),
      y: snapToGrid(c.y + offsetY + (Math.random() - 0.5) * 40),
    };
  }

  addGate(type) {
    this.captureSnapshot();
    const { x, y } = this._placementCenter();
    const id = makeId('g');
    const ctors = { AND: AndGate, OR: OrGate, NOT: NotGate, XOR: XorGate, XNOR: XnorGate, NAND: NandGate, NOR: NorGate, BUF: BufferGate };
    const Ctor = ctors[type];
    if (!Ctor) return;
    const node = (type === 'NOT' || type === 'BUF') ? new Ctor(id, x, y) : new Ctor(id, x, y, 2);
    this.graph.addNode(node);
    this.selectedNodeID = node.id;
    this.updatePropertiesPanel(node.id);
    this.saveCurrentCircuit();
    this.setStatus(`${type} gate added.`);
  }

  addInput() {
    this.captureSnapshot();
    const { x, y } = this._placementCenter(-60);
    const node = new InputSource(makeId('i'), x, y);
    this.graph.addNode(node);
    this.selectedNodeID = node.id;
    this.updatePropertiesPanel(node.id);
    this.saveCurrentCircuit();
    this.setStatus('Input source added.');
  }

  addOutput() {
    this.captureSnapshot();
    const { x, y } = this._placementCenter(60);
    const node = new OutputProbe(makeId('o'), x, y);
    this.graph.addNode(node);
    this.selectedNodeID = node.id;
    this.updatePropertiesPanel(node.id);
    this.saveCurrentCircuit();
    this.setStatus('Output probe added.');
  }

  addClock() {
    this.captureSnapshot();
    const { x, y } = this._placementCenter(-80);
    const node = new ClockSource(makeId('clk'), x, y);
    node.label = `CLK_${node.id}`;
    this.graph.addNode(node);
    this.selectedNodeID = node.id;
    this.updatePropertiesPanel(node.id);
    this.saveCurrentCircuit();
    this.setStatus('Clock source added. Use Play or Step to tick.');
  }

  addDFF() {
    this.captureSnapshot();
    const { x, y } = this._placementCenter();
    const node = new DFlipFlop(makeId('dff'), x, y);
    node.label = `DFF_${node.id}`;
    this.graph.addNode(node);
    this.selectedNodeID = node.id;
    this.updatePropertiesPanel(node.id);
    this.saveCurrentCircuit();
    this.setStatus('D Flip-Flop added. Connect D and CLK pins.');
  }

  addSRLatch() {
    this.captureSnapshot();
    const { x, y } = this._placementCenter();
    const node = new SRLatch(makeId('sr'), x, y);
    node.label = `SR_${node.id}`;
    this.graph.addNode(node);
    this.selectedNodeID = node.id;
    this.updatePropertiesPanel(node.id);
    this.saveCurrentCircuit();
    this.setStatus('SR Latch added. Connect S and R pins.');
  }

  loadTemplate(id) {
    const tpl = getTemplate(id);
    if (!tpl) { this.setStatus(`Template "${id}" not found.`, true); return; }
    this.captureSnapshot();
    this.graph.fromObject(tpl);
    this.simEngine.syncGraph(this.graph);
    this.selectedNodeID = null;
    this.updatePropertiesPanel(null);
    try { this.graph.stabilizeAll(); } catch (_) {}
    this.fitToCircuit();
    this.saveCurrentCircuit();
    this.setStatus(`Loaded template: ${tpl.name}.`);
  }

  seedDemo() {
    const cx = this.canvas.clientWidth * 0.5 / 1 || 400;
    const cy = this.canvas.clientHeight * 0.5 / 1 || 300;
    const i0 = new InputSource(makeId('i'), 100, 160);
    i0.label = 'A';
    const i1 = new InputSource(makeId('i'), 100, 260);
    i1.label = 'B';
    const xor = new XorGate(makeId('g'), 280, 200, 2);
    xor.label = 'XOR_1';
    const out = new OutputProbe(makeId('o'), 460, 200);
    out.label = 'SUM';
    this.graph.addNode(i0);
    this.graph.addNode(i1);
    this.graph.addNode(xor);
    this.graph.addNode(out);
    this.graph.addConnection(i0.id, xor.id, 0);
    this.graph.addConnection(i1.id, xor.id, 1);
    this.graph.addConnection(xor.id, out.id, 0);
    try { this.graph.stabilizeAll(); } catch (_) {}
    this.viewport.tx = this.canvas.clientWidth * 0.12;
    this.viewport.ty = this.canvas.clientHeight * 0.18;
  }

  // ── Context Menu ──────────────────────────────────────────────────────────

  showContextMenu(clientX, clientY, node, edge) {
    const toggleItem = this.contextMenu.querySelector("[data-action='toggle-inputs']");
    const renameItem = this.contextMenu.querySelector("[data-action='rename']");
    const deleteNodeItem = this.contextMenu.querySelector("[data-action='delete']");
    const deleteWireItem = this.contextMenu.querySelector("[data-action='delete-wire']");
    const toggleAllowed = !!node && ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR'].includes(node.type);
    toggleItem.style.display = toggleAllowed ? 'block' : 'none';
    renameItem.style.display = node ? 'block' : 'none';
    deleteNodeItem.style.display = node ? 'block' : 'none';
    deleteWireItem.style.display = edge ? 'block' : 'none';
    this.contextMenu.style.left = `${clientX + 6}px`;
    this.contextMenu.style.top = `${clientY + 6}px`;
    this.contextMenu.style.display = 'block';
  }

  hideContextMenu() {
    this.contextMenu.style.display = 'none';
    this.contextNodeID = null;
    this.contextEdgeID = null;
  }

  // ── Coordinate Transforms ─────────────────────────────────────────────────

  clientToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.viewport.tx) / this.viewport.scale,
      y: (clientY - rect.top - this.viewport.ty) / this.viewport.scale,
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx * this.viewport.scale + this.viewport.tx,
      y: wy * this.viewport.scale + this.viewport.ty,
    };
  }

  // ── Hit Testing ───────────────────────────────────────────────────────────

  pickNodeAt(wx, wy) {
    const nodes = Array.from(this.graph.nodes.values());
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].hitTestAABB(wx, wy)) return nodes[i];
    }
    return null;
  }

  pickPin(wx, wy) {
    for (const node of this.graph.nodes.values()) {
      if (node.outputPin) {
        if (worldDistance({ x: wx, y: wy }, node.outputPin) <= 8)
          return { node, pin: node.outputPin, kind: 'output' };
      }
      for (const pin of node.inputPins) {
        if (worldDistance({ x: wx, y: wy }, pin) <= 8)
          return { node, pin, kind: 'input' };
      }
    }
    return null;
  }

  findMagneticPin(wx, wy, radius) {
    let best = null;
    for (const node of this.graph.nodes.values()) {
      for (const pin of node.inputPins) {
        const d = worldDistance({ x: wx, y: wy }, pin);
        if (d <= radius && (!best || d < best.distance)) {
          best = { node, pin, kind: 'input', distance: d };
        }
      }
    }
    return best;
  }

  pickEdgeWithPoint(wx, wy, radius = 9) {
    let best = null;
    const cursor = { x: wx, y: wy };
    for (const edge of this.graph.edges.values()) {
      const source = this.graph.getNode(edge.sourceID);
      const target = this.graph.getNode(edge.targetID);
      if (!source || !target) continue;
      const p0 = source.outputPin;
      const p3 = target.inputPins[edge.targetPinIndex];
      if (!p0 || !p3) continue;
      const curve = connectionCurveFromPins(p0, p3);
      const nearest = nearestPointOnBezierApprox(cursor, curve.p0, curve.p1, curve.p2, curve.p3);
      if (nearest.distance <= radius && (!best || nearest.distance < best.distance)) {
        best = { edge, point: nearest.point, distance: nearest.distance };
      }
    }
    return best;
  }

  pickEdgeAt(wx, wy) {
    const hit = this.pickEdgeWithPoint(wx, wy, 9);
    return hit ? hit.edge : null;
  }

  // ── Canvas Events ─────────────────────────────────────────────────────────

  bindCanvasEvents() {
    this.canvas.addEventListener('contextmenu', (evt) => {
      evt.preventDefault();
      const world = this.clientToWorld(evt.clientX, evt.clientY);
      const node = this.pickNodeAt(world.x, world.y);
      const edge = node ? null : this.pickEdgeAt(world.x, world.y);
      if (node) {
        this.contextNodeID = node.id;
        this.contextEdgeID = null;
        this.showContextMenu(evt.clientX, evt.clientY, node, null);
      } else if (edge) {
        this.contextNodeID = null;
        this.contextEdgeID = edge.id;
        this.showContextMenu(evt.clientX, evt.clientY, null, edge);
      } else {
        this.hideContextMenu();
      }
    });

    this.canvas.addEventListener('pointerdown', (evt) => {
      const world = this.clientToWorld(evt.clientX, evt.clientY);
      this.interaction.mouseWorld = world;
      this.interaction.clickStart = { x: world.x, y: world.y };

      if (evt.button === 1 || (evt.button === 0 && evt.shiftKey)) {
        this.interaction.panning = true;
        this.interaction.panStart = { x: evt.clientX, y: evt.clientY };
        this.canvas.style.cursor = 'grabbing';
        return;
      }
      if (evt.button !== 0) return;
      if (this.interaction.connecting) return;

      const pinHit = this.pickPin(world.x, world.y);
      if (pinHit && pinHit.kind === 'output') {
        this.interaction.connecting = { sourceID: pinHit.node.id, from: { ...pinHit.pin }, to: { x: world.x, y: world.y } };
        return;
      }

      const edgeTap = this.pickEdgeWithPoint(world.x, world.y, 10);
      if (edgeTap) {
        this.interaction.connecting = { sourceID: edgeTap.edge.sourceID, from: { ...edgeTap.point }, to: { x: world.x, y: world.y } };
        this.interaction.snappedTarget = this.findMagneticPin(world.x, world.y, PIN_SNAP_RADIUS);
        if (this.interaction.snappedTarget) {
          this.interaction.connecting.to = { x: this.interaction.snappedTarget.pin.x, y: this.interaction.snappedTarget.pin.y };
        }
        this.setStatus('Wire tap: drag to an input pin.');
        return;
      }

      const node = this.pickNodeAt(world.x, world.y);
      if (node) {
        this.selectedNodeID = node.id;
        this.updatePropertiesPanel(node.id);
        this.interaction.dragSnapshot = this.graph.toJSON(this.viewport);
        this.interaction.draggingNodeID = node.id;
        this.interaction.dragOffset = { x: world.x - node.x, y: world.y - node.y };
      } else {
        this.selectedNodeID = null;
        this.updatePropertiesPanel(null);
      }
    });

    this.canvas.addEventListener('pointermove', (evt) => {
      const world = this.clientToWorld(evt.clientX, evt.clientY);
      this.interaction.mouseWorld = world;

      if (this.interaction.panning) {
        this.viewport.tx += evt.clientX - this.interaction.panStart.x;
        this.viewport.ty += evt.clientY - this.interaction.panStart.y;
        this.clampViewportToCircuit();
        this.interaction.panStart = { x: evt.clientX, y: evt.clientY };
        return;
      }

      if (this.interaction.draggingNodeID) {
        const node = this.graph.getNode(this.interaction.draggingNodeID);
        if (node) node.setPosition(world.x - this.interaction.dragOffset.x, world.y - this.interaction.dragOffset.y);
        return;
      }

      if (this.interaction.connecting) {
        this.interaction.connecting.to = world;
        const snap = this.findMagneticPin(world.x, world.y, PIN_SNAP_RADIUS);
        this.interaction.snappedTarget = snap;
        if (snap) this.interaction.connecting.to = { x: snap.pin.x, y: snap.pin.y };
      }
    });

    this.canvas.addEventListener('pointerup', (evt) => {
      const world = this.clientToWorld(evt.clientX, evt.clientY);

      if (this.interaction.panning) {
        this.interaction.panning = false;
        this.canvas.style.cursor = 'crosshair';
        return;
      }

      const draggingNodeID = this.interaction.draggingNodeID;
      this.interaction.draggingNodeID = null;

      if (this.interaction.connecting) {
        const sourceID = this.interaction.connecting.sourceID;
        const snap = this.interaction.snappedTarget;
        if (snap && snap.kind === 'input') {
          const result = this.graph.addConnection(sourceID, snap.node.id, snap.pin.index);
          if (!result.ok) {
            this.setStatus(result.reason, true);
          } else {
            this.captureSnapshot();
            this.saveCurrentCircuit();
            this.setStatus('Connection created.');
          }
          this.interaction.connecting = null;
          this.interaction.snappedTarget = null;
          return;
        }
        const edgeTap = this.pickEdgeWithPoint(world.x, world.y, 10);
        if (edgeTap) {
          this.interaction.connecting.sourceID = edgeTap.edge.sourceID;
          this.interaction.connecting.from = { ...edgeTap.point };
          this.interaction.connecting.to = { ...edgeTap.point };
          this.interaction.snappedTarget = null;
          this.setStatus('Source moved to tapped wire. Drag to an input pin.');
          return;
        }
        this.interaction.connecting = null;
        this.interaction.snappedTarget = null;
        return;
      }

      if (evt.button === 0 && draggingNodeID) {
        const node = this.graph.getNode(draggingNodeID);
        if (!node) return;
        if (this.interaction.dragSnapshot) {
          this.undoStack.push(this.interaction.dragSnapshot);
          if (this.undoStack.length > 100) this.undoStack.shift();
          this.redoStack.length = 0;
          this.interaction.dragSnapshot = null;
          this.saveCurrentCircuit();
        }
        const clickStart = this.interaction.clickStart;
        if (node.type === 'INPUT' && clickStart) {
          if (worldDistance(clickStart, world) < 4) {
            this.captureSnapshot();
            node.cycleState();
            try { this.graph.stabilizeAll(); } catch (_) {}
            this.updatePropertiesPanel(this.selectedNodeID);
            this.saveCurrentCircuit();
            this.setStatus(`Input ${node.label || node.id} → ${node.outputState === null ? 'Z (floating)' : node.outputState}.`);
          }
        }
      }
    });

    this.canvas.addEventListener('wheel', (evt) => {
      evt.preventDefault();
      const world = this.clientToWorld(evt.clientX, evt.clientY);
      const delta = evt.deltaY < 0 ? 1.1 : 0.9;
      const nextScale = Math.max(this.zoomLimits.min, Math.min(this.zoomLimits.max, this.viewport.scale * delta));
      this.applyZoom(nextScale, world);
    }, { passive: false });
  }

  // ── Canvas Resize ─────────────────────────────────────────────────────────

  resize() {
    const rect = this.workspace.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    this.canvas.width = width;
    this.canvas.height = height;
    this.backCanvas.width = width;
    this.backCanvas.height = height;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.backCtx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ── Render Loop ───────────────────────────────────────────────────────────

  render(timeMs) {
    const bctx = this.backCtx;
    const { width, height } = this.canvas;

    bctx.save();
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, width, height);
    bctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#0b0e14';
    bctx.fillRect(0, 0, width, height);
    bctx.restore();

    bctx.save();
    bctx.setTransform(this.viewport.scale, 0, 0, this.viewport.scale, this.viewport.tx, this.viewport.ty);
    drawGrid(bctx, this.viewport, width, height);
    drawConnections(bctx, this.graph.edges, this.graph.nodes, timeMs);
    for (const node of this.graph.nodes.values()) drawNode(bctx, node, this.selectedNodeID);
    drawConnectPreview(bctx, this.interaction.connecting, this.interaction.snappedTarget);
    bctx.restore();

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(this.backCanvas, 0, 0, width, height);
    this.ctx.restore();

    requestAnimationFrame((t) => this.render(t));
  }

  // ── Analysis ──────────────────────────────────────────────────────────────

  openAnalysisPanel() {
    this.analysisOverlay.style.display = 'flex';
  }

  closeAnalysisPanel() {
    this.analysisOverlay.style.display = 'none';
  }

  getInputNodes() {
    return Array.from(this.graph.nodes.values())
      .filter((n) => n.type === 'INPUT')
      .sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));
  }

  getOutputNodes() {
    return Array.from(this.graph.nodes.values())
      .filter((n) => n.type === 'OUTPUT')
      .sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));
  }

  buildTruthTable() {
    const inputNodes = this.getInputNodes();
    const outputNodes = this.getOutputNodes();
    if (!inputNodes.length || !outputNodes.length) {
      this.setStatus('Need at least one input and one output.', true);
      return;
    }
    if (inputNodes.length > 10) {
      this.setStatus('Truth table limited to 10 inputs.', true);
      return;
    }

    const snapshot = this.graph.toJSON(this.viewport);
    const rows = [];
    const rowCount = 1 << inputNodes.length;
    for (let mask = 0; mask < rowCount; mask++) {
      const inBits = [];
      for (let i = 0; i < inputNodes.length; i++) {
        const bit = (mask >> (inputNodes.length - i - 1)) & 1;
        inBits.push(bit);
        inputNodes[i].outputState = bit === 1 ? SIGNAL.HIGH : SIGNAL.LOW;
      }
      this.graph.stabilizeAll();
      rows.push({ mask, inBits, outBits: outputNodes.map((o) => (o.outputState === SIGNAL.HIGH ? 1 : 0)) });
    }

    this.applySnapshot(snapshot);
    this.analysisState = {
      rows,
      inputNodes: inputNodes.map((n) => ({ id: n.id, label: n.label || n.id })),
      outputNodes: outputNodes.map((n) => ({ id: n.id, label: n.label || n.id })),
      selectedOutputID: outputNodes[0]?.id || null,
      simplified: null,
    };

    this.renderTruthTable();
    this.populateKmapOutputSelect();
    this.simplifiedExprBox.textContent = 'Truth table built. Select an output and draw K-map.';
    this.setStatus('Truth table generated.');
  }

  renderTruthTable() {
    const { rows, inputNodes, outputNodes } = this.analysisState;
    if (!rows.length) { this.truthTableWrap.innerHTML = ''; return; }
    const headInputs = inputNodes.map((i) => `<th>${escapeHtml(i.label)}</th>`).join('');
    const headOutputs = outputNodes.map((o) => `<th>${escapeHtml(o.label)}</th>`).join('');
    const body = rows.map((r) => {
      const ins = r.inBits.map((v) => `<td class="${v ? 'tt-one' : 'tt-zero'}">${v}</td>`).join('');
      const outs = r.outBits.map((v) => `<td class="${v ? 'tt-one' : 'tt-zero'}">${v}</td>`).join('');
      return `<tr>${ins}${outs}</tr>`;
    }).join('');
    this.truthTableWrap.innerHTML = `<table class="logic-table"><thead><tr>${headInputs}${headOutputs}</tr></thead><tbody>${body}</tbody></table>`;
  }

  populateKmapOutputSelect() {
    const select = document.getElementById('kmapOutputSelect');
    select.innerHTML = '';
    this.analysisState.outputNodes.forEach((o, idx) => {
      const opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = o.label;
      if (idx === 0) opt.selected = true;
      select.appendChild(opt);
    });
  }

  drawKmapForSelection() {
    const { rows, inputNodes, outputNodes } = this.analysisState;
    if (!rows.length) { this.setStatus('Build truth table first.', true); return; }
    if (inputNodes.length > 5) { this.setStatus('K-map supports up to 5 variables.', true); return; }
    const selectedID = document.getElementById('kmapOutputSelect').value;
    const outIndex = outputNodes.findIndex((o) => o.id === selectedID);
    if (outIndex < 0) { this.setStatus('Select an output for K-map.', true); return; }

    const n = inputNodes.length;
    const rowBits = Math.floor(n / 2);
    const colBits = n - rowBits;
    const rowCodes = grayCodeList(rowBits);
    const colCodes = grayCodeList(colBits);

    let html = `<table class="logic-table"><thead><tr><th>R\\C</th>${colCodes.map((c) => `<th>${c || '-'}</th>`).join('')}</tr></thead><tbody>`;
    for (let r = 0; r < rowCodes.length; r++) {
      html += `<tr><th>${rowCodes[r] || '-'}</th>`;
      for (let c = 0; c < colCodes.length; c++) {
        const idx = parseInt(`${rowCodes[r]}${colCodes[c]}` || '0', 2);
        const v = rows[idx]?.outBits[outIndex] ?? 0;
        html += `<td class="${v ? 'tt-one' : 'tt-zero'}">${v}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    this.kmapWrap.innerHTML = html;

    const minterms = rows.filter((r) => r.outBits[outIndex] === 1).map((r) => r.mask);
    const inputNames = inputNodes.map((node) => node.label || node.id);
    const implicants = quineMcCluskeyMinimize(n, minterms);
    const expr = implicantsToSOP(implicants, inputNames);

    this.analysisState.simplified = {
      output: outputNodes[outIndex],
      inputNames,
      implicants,
      expr,
      varCount: n,
    };
    this.simplifiedExprBox.textContent = `${outputNodes[outIndex].label} = ${expr}`;
    this.setStatus('K-map drawn and simplified expression generated.');
  }

  drawSimplifiedCircuit() {
    const info = this.analysisState.simplified;
    if (!info) { this.setStatus('Generate K-map first.', true); return; }

    this.captureSnapshot();
    this.graph.clear();

    const inputNodes = info.inputNames.map((name, idx) => {
      const node = new InputSource(makeId('i'), 80, 90 + idx * 90);
      node.label = name;
      this.graph.addNode(node);
      return node;
    });

    const splitMap = new Map();
    const allocSignal = (varIdx, yBase) => {
      const prev = splitMap.get(varIdx) || inputNodes[varIdx];
      const b = new BufferGate(makeId('g'), 250 + (splitMap.get(varIdx) ? 70 : 0), yBase);
      b.label = `BUF_${info.inputNames[varIdx]}`;
      this.graph.addNode(b);
      this.graph.addConnection(prev.id, b.id, 0);
      splitMap.set(varIdx, b);
      return b;
    };

    const termOutputs = [];
    for (let t = 0; t < info.implicants.length; t++) {
      const imp = info.implicants[t];
      const literals = [];
      let y = 120 + t * 95;
      for (let i = 0; i < imp.length; i++) {
        if (imp[i] === '-') continue;
        const src = allocSignal(i, y);
        if (imp[i] === '1') {
          literals.push(src);
        } else {
          const inv = new NotGate(makeId('g'), 400, y);
          inv.label = `NOT_${info.inputNames[i]}`;
          this.graph.addNode(inv);
          this.graph.addConnection(src.id, inv.id, 0);
          literals.push(inv);
          y += 42;
        }
      }
      if (!literals.length) {
        const c1 = new InputSource(makeId('i'), 80, 100 + info.inputNames.length * 95);
        c1.label = 'CONST_1';
        c1.outputState = SIGNAL.HIGH;
        this.graph.addNode(c1);
        termOutputs.push(c1);
        continue;
      }
      let current = literals[0];
      let pending = literals.slice(1);
      while (pending.length > 0) {
        const take = [current, ...pending.splice(0, 3)];
        if (take.length === 1) { current = take[0]; break; }
        const andNode = new AndGate(makeId('g'), 560 + t * 30, 130 + t * 90, Math.min(4, take.length));
        andNode.label = `TERM_${t + 1}`;
        this.graph.addNode(andNode);
        for (let p = 0; p < take.length; p++) this.graph.addConnection(take[p].id, andNode.id, p);
        current = andNode;
      }
      termOutputs.push(current);
    }

    let finalSource = termOutputs[0] || null;
    let remain = termOutputs.slice(1);
    while (remain.length > 0) {
      const take = [finalSource, ...remain.splice(0, 3)];
      const orNode = new OrGate(makeId('g'), 780, 220 + remain.length * 20, Math.min(4, take.length));
      orNode.label = 'SIMPLIFIED_OR';
      this.graph.addNode(orNode);
      for (let p = 0; p < take.length; p++) this.graph.addConnection(take[p].id, orNode.id, p);
      finalSource = orNode;
    }

    const out = new OutputProbe(makeId('o'), 950, 220);
    out.label = `${info.output.label}_SIMPLIFIED`;
    this.graph.addNode(out);
    if (finalSource) this.graph.addConnection(finalSource.id, out.id, 0);

    this.fitToCircuit();
    this.runSimulation();
    this.saveCurrentCircuit();
    this.closeAnalysisPanel();
    this.setStatus('Simplified circuit generated.');
  }

  // ── AI Helper ─────────────────────────────────────────────────────────────

  getCircuitSummaryPrompt() {
    const inputs = this.getInputNodes();
    const outputs = this.getOutputNodes();
    const gates = Array.from(this.graph.nodes.values()).filter((n) => n.type !== 'INPUT' && n.type !== 'OUTPUT');
    return [
      'Review this digital circuit and suggest improvements:',
      `Inputs (${inputs.length}): ${inputs.map((n) => n.label).join(', ')}`,
      `Outputs (${outputs.length}): ${outputs.map((n) => n.label).join(', ')}`,
      `Gates (${gates.length}): ${gates.map((n) => `${n.type}:${n.label}`).join(', ')}`,
      'Please provide truth table checks, minimization, and hazard notes.',
    ].join('\n');
  }

  askAIProvider() {
    const provider = document.getElementById('aiProviderSelect').value;
    const prompt = (document.getElementById('aiPromptBox').value || this.getCircuitSummaryPrompt()).trim();
    const q = encodeURIComponent(prompt);
    let url = `https://chatgpt.com/?q=${q}`;
    if (provider === 'gemini') url = 'https://gemini.google.com/app';
    if (provider === 'perplexity') url = `https://www.perplexity.ai/search/new?q=${q}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    this.setStatus('Opened AI assistant in a new tab.');
  }
}
