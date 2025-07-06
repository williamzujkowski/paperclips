var UniversalPaperclips = (function () {
  "use strict";
  class e {
    constructor() {
      ((this.events = new Map()),
        (this.eventListeners = new Map()),
        (this.resources = {
          clips: 0,
          totalClips: 0,
          unusedClips: 0,
          unsoldClips: 0,
          funds: 0,
          wire: 1e3,
          nanoWire: 0,
          bankroll: 0,
        }),
        (this.production = {
          clipRate: 0,
          clipRateTemp: 0,
          prevClips: 0,
          clipRateTracker: 0,
          clipmakerRate: 0,
          boosts: { clipper: 1, megaClipper: 1, factory: 1, drone: 1 },
        }),
        (this.manufacturing = {
          clipmakers: { level: 0, cost: 5 },
          megaClippers: { level: 0, cost: 500 },
          factories: { level: 0, cost: 1e8, rate: 1e9, powerConsumption: 0 },
        }),
        (this.market = {
          pricing: {
            margin: 0.25,
            wireCost: 20,
            wireBasePrice: 20,
            wirePriceCounter: 0,
            adCost: 100,
          },
          demand: 5,
          demandBoost: 1,
          marketing: { level: 1, effectiveness: 1 },
          sales: { clipsSold: 0, avgRevenue: 0, income: 0, incomeTracker: [0] },
          totalRevenue: 0,
          wire: { supply: 1e3, purchase: 0, buyerStatus: 1, priceTimer: 0 },
        }),
        (this.computing = {
          processors: 1,
          memory: 1,
          operations: 0,
          creativity: { amount: 0, enabled: !1, speed: 1, counter: 0 },
          trust: { current: 2, nextThreshold: 3e3, max: 20, maxCost: 91117.99 },
          quantum: {
            enabled: !1,
            clock: 0,
            chipCost: 1e4,
            nextChip: 0,
            fade: 1,
          },
          operations: {
            temp: 0,
            standard: 0,
            fade: 0,
            fadeTimer: 0,
            fadeDelay: 800,
          },
          transaction: 1,
        }),
        (this.space = {
          probes: { count: 0 },
          harvesters: {
            level: 0,
            cost: 1e6,
            rate: 26180337,
            powerConsumption: 0,
          },
          wireDrones: {
            level: 0,
            cost: 1e6,
            rate: 16180339,
            powerConsumption: 0,
          },
          matter: {
            available: 6e3 * Math.pow(10, 24),
            acquired: 0,
            processed: 0,
            total: 30 * Math.pow(10, 54),
            found: 6e3 * Math.pow(10, 24),
          },
        }),
        (this.power = {
          stored: 0,
          modifier: 0,
          solarFarms: { level: 0, cost: 1e7, rate: 50, bill: 0 },
          batteries: { level: 0, cost: 1e6, capacity: 1e4, bill: 0 },
          consumption: { factory: 200, drone: 1 },
        }),
        (this.combat = {
          honor: 0,
          momentum: 0,
          battleEnabled: !1,
          disorganization: {
            counter: 0,
            enabled: !1,
            message: 0,
            synchCost: 5e3,
          },
          entertainment: {
            cost: 1e4,
            boredom: { level: 0, enabled: !1, message: 0 },
          },
          threnody: { cost: 5e4, audio: null, loaded: !1 },
        }),
        (this.swarm = {
          enabled: !1,
          status: 7,
          gifts: { received: 0, next: 0, period: 125e3, countdown: 125e3 },
        }),
        (this.prestige = { u: 0, s: 0 }),
        (this.gameState = {
          ticks: 0,
          elapsedTime: 0,
          resetFlag: 2,
          flags: {
            milestone: 0,
            strategy: 0,
            investment: 0,
            revPerSec: 0,
            comp: 0,
            projects: 0,
            autoClipper: 0,
            megaClipper: 0,
            wireBuyer: 0,
            human: 1,
            trust: 1,
            creation: 0,
            wireProduction: 0,
            space: 0,
            factory: 0,
            harvester: 0,
            wireDrone: 0,
            autoTourney: 0,
            ego: 0,
            toth: 0,
            safety: !1,
            test: 0,
          },
          automation: { tourneyStatus: 1, wireBuyerEnabled: !1 },
        }),
        (this.ui = {
          blinkCounter: 0,
          sliderPos: 0,
          driftKingMessageCost: 1,
          bribe: 1e6,
        }),
        (this.endGame = {
          dismantle: 0,
          finalClips: 0,
          timers: { end1: 0, end2: 0, end3: 0, end4: 0, end5: 0, end6: 0 },
        }),
        (this.investment = {
          value: 0,
          return: 0,
          stocks: [],
          riskLevel: 0,
          portfolio: { aggressive: 0, moderate: 0, conservative: 0 },
        }),
        (this.strategy = {
          current: "None",
          yomi: 0,
          yomiRate: 0,
          tournament: { status: "Ready", active: !1, rounds: 0 },
          payoffs: { AA: 0, AB: 0, BA: 0, BB: 0 },
          thinkingAllocation: 50,
          riskLevel: 0,
        }),
        (this.probes = {
          design: {
            trust: 0,
            combat: 0,
            speed: 0,
            replication: 0,
            selfRep: 0,
            hazard: 0,
            factory: 0,
            wireDrone: 0,
            exploration: 0,
          },
          launched: 0,
          lost: 0,
        }),
        (this.universe = { level: 0, simLevel: 0, processors: 0, explored: 0 }),
        (this.legacy = { x: 0, fib1: 2, fib2: 3, boostLvl: 0 }),
        (this._changeListeners = []));
    }
    get(e) {
      if (!e) return this;
      const t = e.split(".");
      let s = this;
      for (const e of t) {
        if (null == s) return;
        s = s[e];
      }
      return s;
    }
    set(e, t) {
      if (!e) return;
      const s = e.split("."),
        i = s.pop();
      let a = this;
      for (const e of s) (void 0 === a[e] && (a[e] = {}), (a = a[e]));
      const n = a[i];
      ((a[i] = t), this._notifyChange(e, n, t));
    }
    increment(e, t = 1) {
      const s = this.get(e) || 0;
      this.set(e, s + t);
    }
    decrement(e, t = 1) {
      this.increment(e, -t);
    }
    addChangeListener(e) {
      this._changeListeners.push(e);
    }
    removeChangeListener(e) {
      const t = this._changeListeners.indexOf(e);
      -1 !== t && this._changeListeners.splice(t, 1);
    }
    _notifyChange(e, t, s) {
      t !== s &&
        this._changeListeners.forEach((i) => {
          try {
            i(e, t, s);
          } catch (e) {}
        });
    }
    save() {
      try {
        const e = {
          resources: this.resources,
          production: this.production,
          manufacturing: this.manufacturing,
          market: this.market,
          computing: this.computing,
          space: this.space,
          power: this.power,
          combat: {
            ...this.combat,
            threnody: { ...this.combat.threnody, audio: null },
          },
          swarm: this.swarm,
          prestige: this.prestige,
          gameState: this.gameState,
          ui: this.ui,
          endGame: this.endGame,
          legacy: this.legacy,
          version: "2.0.0",
          timestamp: Date.now(),
        };
        return (localStorage.setItem("paperclips-save", JSON.stringify(e)), !0);
      } catch (e) {
        return !1;
      }
    }
    load() {
      try {
        const e = localStorage.getItem("paperclips-save");
        if (!e) return !1;
        const t = JSON.parse(e);
        return (this._mergeState(t), !0);
      } catch (e) {
        return !1;
      }
    }
    _mergeState(e) {
      const t = (e, s) => {
        for (const i in s)
          null === s[i] || "object" != typeof s[i] || Array.isArray(s[i])
            ? (e[i] = s[i])
            : ((e[i] && "object" == typeof e[i]) || (e[i] = {}), t(e[i], s[i]));
      };
      t(this, e);
    }
    reset() {
      const t = new e();
      (Object.keys(t).forEach((e) => {
        "_changeListeners" !== e &&
          (this[e] = JSON.parse(JSON.stringify(t[e])));
      }),
        this._notifyChange("*", null, "reset"));
    }
    export() {
      const e = {
        resources: this.resources,
        production: this.production,
        manufacturing: this.manufacturing,
        market: this.market,
        computing: this.computing,
        space: this.space,
        power: this.power,
        combat: {
          ...this.combat,
          threnody: { ...this.combat.threnody, audio: null },
        },
        swarm: this.swarm,
        prestige: this.prestige,
        gameState: this.gameState,
        ui: this.ui,
        endGame: this.endGame,
        legacy: this.legacy,
        version: "2.0.0",
        timestamp: Date.now(),
      };
      return JSON.stringify(e, null, 2);
    }
    import(e) {
      try {
        const t = JSON.parse(e);
        return (
          this._mergeState(t),
          this._notifyChange("*", null, "import"),
          !0
        );
      } catch (e) {
        return !1;
      }
    }
    getSnapshot() {
      return JSON.parse(JSON.stringify(this));
    }
    on(e, t) {
      (this.eventListeners.has(e) || this.eventListeners.set(e, new Set()),
        this.eventListeners.get(e).add(t));
    }
    off(e, t) {
      this.eventListeners.has(e) && this.eventListeners.get(e).delete(t);
    }
    emit(e, t) {
      this.eventListeners.has(e) &&
        this.eventListeners.get(e).forEach((e) => {
          try {
            e(t);
          } catch (e) {}
        });
    }
  }
  const t = new e(),
    s = 1e3,
    i = 5,
    a = 500,
    n = 1e8,
    r = 1e9,
    o = 1e3,
    c = 100,
    h = 10,
    m = "efficiency",
    l = "creativity",
    u = "investment",
    d = "manufacturing",
    p = "computing",
    g = "space",
    b = "combat",
    f = 1e3,
    y = 1e6,
    v = 1e9,
    S = 1e12,
    C = 1e6,
    w = 2,
    k = 2,
    M = {
      MIN_FPS: 30,
      FRAME_TIME_TARGET: 16.67,
      PERFORMANCE_SAMPLE_SIZE: 60,
      MAX_DOM_UPDATES_PER_FRAME: 10,
      MAX_MEMORY_USAGE: 104857600,
    },
    E = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
  const x = new (class {
    constructor() {
      ((this.logLevel = E.INFO),
        (this.errors = []),
        (this.maxErrors = 100),
        (this.performance = {
          errorCount: 0,
          recoveryCount: 0,
          criticalErrors: 0,
        }),
        (this._originalConsole = {
          error: function () {}.bind(),
          warn: function () {}.bind(),
          info: function () {}.bind(),
          log: function () {}.bind(),
        }),
        (this.renderer = null),
        this._setupGlobalHandlers());
    }
    _setupGlobalHandlers() {
      (window.addEventListener("error", (e) => {
        this.handleError(new Error(e.message), "global.uncaughtError", {
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
          stack: e.error?.stack,
        });
      }),
        window.addEventListener("unhandledrejection", (e) => {
          this.handleError(e.reason, "global.unhandledRejection", {
            promise: e.promise,
          });
        }),
        (console.error = (...e) => {
          (this.error("Console error:", ...e),
            this._originalConsole.error(...e));
        }));
    }
    handleError(e, t = "unknown", s = {}, i = !1) {
      const a = {
        timestamp: Date.now(),
        message: e?.message || e,
        source: t,
        context: s,
        critical: i,
        stack: e?.stack,
        id: this._generateErrorId(),
      };
      (this.errors.push(a),
        this.performance.errorCount++,
        i && this.performance.criticalErrors++,
        this.errors.length > this.maxErrors &&
          (this.errors = this.errors.slice(-this.maxErrors)),
        this._logError(a),
        this._attemptRecovery(a),
        this._notifyErrorListeners(a));
    }
    createErrorBoundary(e, t, s = null) {
      return (...i) => {
        try {
          return e.apply(this, i);
        } catch (e) {
          if ((this.handleError(e, `errorBoundary.${t}`, { args: i }), s))
            try {
              return s.apply(this, i);
            } catch (e) {
              this.handleError(e, `errorBoundary.${t}.fallback`, { args: i });
            }
          return null;
        }
      };
    }
    setRenderer(e) {
      this.renderer = e;
    }
    error(e, ...t) {
      this.logLevel >= E.ERROR &&
        (this._log("ERROR", e, ...t),
        this.renderer &&
          this.renderer.addConsoleMessage &&
          this.renderer.addConsoleMessage(e, "error"));
    }
    warn(e, ...t) {
      this.logLevel >= E.WARN &&
        (this._log("WARN", e, ...t),
        this.renderer &&
          this.renderer.addConsoleMessage &&
          e.includes("critical") &&
          this.renderer.addConsoleMessage(e, "warning"));
    }
    info(e, ...t) {
      this.logLevel >= E.INFO && this._log("INFO", e, ...t);
    }
    debug(e, ...t) {
      this.logLevel >= E.DEBUG && this._log("DEBUG", e, ...t);
    }
    setLogLevel(e) {
      ((this.logLevel = e),
        this.info(`Log level set to ${this._getLogLevelName(e)}`));
    }
    getRecentErrors(e = 10) {
      return this.errors.slice(-e);
    }
    getStats() {
      return {
        ...this.performance,
        totalErrors: this.errors.length,
        criticalErrorRate:
          this.performance.criticalErrors /
          Math.max(this.performance.errorCount, 1),
        recoveryRate:
          this.performance.recoveryCount /
          Math.max(this.performance.errorCount, 1),
      };
    }
    clearErrors() {
      ((this.errors = []),
        (this.performance = {
          errorCount: 0,
          recoveryCount: 0,
          criticalErrors: 0,
        }),
        this.info("Error history cleared"));
    }
    exportErrorLog() {
      return JSON.stringify(
        {
          errors: this.errors,
          performance: this.performance,
          timestamp: Date.now(),
          version: "2.0.0",
        },
        null,
        2,
      );
    }
    _generateErrorId() {
      return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    _logError(e) {
      const t = `[${e.critical ? "ERROR" : "WARN"}] ${e.source}:`,
        s = e.message;
      (this._originalConsole.log(`%c${t}`, "font-weight: bold; color: red;"),
        this._originalConsole.log(s),
        e.context &&
          Object.keys(e.context).length > 0 &&
          this._originalConsole.log("Context:", e.context),
        e.stack && this._originalConsole.log("Stack:", e.stack));
    }
    _attemptRecovery(e) {
      const { source: t, critical: s } = e,
        i = {
          gameLoop: () => this._recoverGameLoop(),
          renderer: () => this._recoverRenderer(),
          gameState: () => this._recoverGameState(),
          localStorage: () => this._recoverLocalStorage(),
        };
      for (const [e, s] of Object.entries(i))
        if (t.includes(e))
          try {
            return (
              s(),
              this.performance.recoveryCount++,
              void this.info(`Recovery attempted for ${t}`)
            );
          } catch (e) {
            this.error("Recovery failed:", e);
          }
      s && this._genericRecovery();
    }
    _recoverGameLoop() {
      this.warn("Attempting game loop recovery");
    }
    _recoverRenderer() {
      this.warn("Attempting renderer recovery");
    }
    _recoverGameState() {
      this.warn("Attempting game state recovery");
    }
    _recoverLocalStorage() {
      this.warn("Attempting localStorage recovery");
    }
    _genericRecovery() {
      this.warn("Attempting generic recovery");
    }
    _log(e, t, ...s) {
      const i = `[${new Date().toISOString()}] [${e}] ${t}`;
      switch (e) {
        case "ERROR":
          this._originalConsole.error(i, ...s);
          break;
        case "WARN":
          this._originalConsole.warn(i, ...s);
          break;
        case "INFO":
          this._originalConsole.info(i, ...s);
          break;
        default:
          this._originalConsole.log(i, ...s);
      }
    }
    _getLogLevelName(e) {
      return ["ERROR", "WARN", "INFO", "DEBUG"][e] || "UNKNOWN";
    }
    _notifyErrorListeners(e) {}
  })();
  const P = new (class {
    constructor() {
      ((this.enabled = !0),
        (this.metrics = {
          fps: {
            current: 0,
            average: 0,
            min: 1 / 0,
            max: 0,
            samples: [],
            lastFrame: performance.now(),
          },
          memory: { used: 0, peak: 0, samples: [] },
          gameLoop: {
            updateTime: 0,
            renderTime: 0,
            totalTime: 0,
            slowFrames: 0,
            samples: [],
          },
          functions: new Map(),
        }),
        (this.thresholds = {
          fps: { warning: M.MIN_FPS, critical: 0.5 * M.MIN_FPS },
          frameTime: {
            warning: 2 * M.FRAME_TIME_TARGET,
            critical: 4 * M.FRAME_TIME_TARGET,
          },
          memory: {
            warning: 0.8 * M.MAX_MEMORY_USAGE,
            critical: M.MAX_MEMORY_USAGE,
          },
        }),
        (this.sampleSize = M.PERFORMANCE_SAMPLE_SIZE),
        (this.warningCallbacks = []),
        this._startMonitoring());
    }
    _startMonitoring() {
      this.enabled && (this._monitorFPS(), this._monitorMemory());
    }
    _monitorFPS() {
      const e = () => {
        if (!this.enabled) return;
        const t = performance.now(),
          s = t - this.metrics.fps.lastFrame;
        if (s > 0) {
          const e = 1e3 / s;
          this._recordFPS(e);
        }
        ((this.metrics.fps.lastFrame = t), requestAnimationFrame(e));
      };
      requestAnimationFrame(e);
    }
    _recordFPS(e) {
      ((this.metrics.fps.current = e),
        this.metrics.fps.samples.push(e),
        this.metrics.fps.samples.length > this.sampleSize &&
          this.metrics.fps.samples.shift(),
        (this.metrics.fps.min = Math.min(this.metrics.fps.min, e)),
        (this.metrics.fps.max = Math.max(this.metrics.fps.max, e)),
        (this.metrics.fps.average =
          this.metrics.fps.samples.reduce((e, t) => e + t, 0) /
          this.metrics.fps.samples.length),
        this._checkFPSThresholds(e));
    }
    _monitorMemory() {
      const e = () => {
        if (this.enabled) {
          if ("memory" in performance) {
            const e = performance.memory;
            (this._recordMemory(e.usedJSHeapSize),
              (this.metrics.memory.peak = Math.max(
                this.metrics.memory.peak,
                e.usedJSHeapSize,
              )));
          }
          setTimeout(e, 1e3);
        }
      };
      e();
    }
    _recordMemory(e) {
      ((this.metrics.memory.used = e),
        this.metrics.memory.samples.push(e),
        this.metrics.memory.samples.length > this.sampleSize &&
          this.metrics.memory.samples.shift(),
        this._checkMemoryThresholds(e));
    }
    startGameLoopMeasurement() {
      this.gameLoopStart = performance.now();
    }
    recordUpdateTime() {
      this.gameLoopStart &&
        ((this.updateEnd = performance.now()),
        (this.metrics.gameLoop.updateTime =
          this.updateEnd - this.gameLoopStart));
    }
    endGameLoopMeasurement() {
      if (!this.gameLoopStart) return;
      const e = performance.now(),
        t = e - this.gameLoopStart,
        s = e - (this.updateEnd || this.gameLoopStart);
      ((this.metrics.gameLoop.renderTime = s),
        (this.metrics.gameLoop.totalTime = t),
        this.metrics.gameLoop.samples.push({
          update: this.metrics.gameLoop.updateTime,
          render: s,
          total: t,
          timestamp: e,
        }),
        this.metrics.gameLoop.samples.length > this.sampleSize &&
          this.metrics.gameLoop.samples.shift(),
        t > this.thresholds.frameTime.warning &&
          (this.metrics.gameLoop.slowFrames++,
          t > this.thresholds.frameTime.critical &&
            x.warn("Critical frame time detected:", `${t.toFixed(2)}ms`)),
        (this.gameLoopStart = null),
        (this.updateEnd = null));
    }
    measure(e, t) {
      if (!this.enabled) return e();
      const s = performance.now();
      try {
        const i = e(),
          a = performance.now() - s;
        return (this._recordFunctionPerformance(t, a, !0), i);
      } catch (e) {
        const i = performance.now() - s;
        throw (this._recordFunctionPerformance(t, i, !1), e);
      }
    }
    wrap(e, t) {
      return (...s) => this.measure(() => e(...s), t);
    }
    _recordFunctionPerformance(e, t, s) {
      this.metrics.functions.has(e) ||
        this.metrics.functions.set(e, {
          calls: 0,
          totalTime: 0,
          averageTime: 0,
          minTime: 1 / 0,
          maxTime: 0,
          errors: 0,
          samples: [],
        });
      const i = this.metrics.functions.get(e);
      (i.calls++,
        (i.totalTime += t),
        (i.averageTime = i.totalTime / i.calls),
        (i.minTime = Math.min(i.minTime, t)),
        (i.maxTime = Math.max(i.maxTime, t)),
        s || i.errors++,
        i.samples.push({
          duration: t,
          success: s,
          timestamp: performance.now(),
        }),
        i.samples.length > this.sampleSize && i.samples.shift());
    }
    _checkFPSThresholds(e) {
      e < this.thresholds.fps.critical
        ? this._triggerWarning("fps", "critical", e)
        : e < this.thresholds.fps.warning &&
          this._triggerWarning("fps", "warning", e);
    }
    _checkMemoryThresholds(e) {
      e > this.thresholds.memory.critical
        ? this._triggerWarning("memory", "critical", e)
        : e > this.thresholds.memory.warning &&
          this._triggerWarning("memory", "warning", e);
    }
    _triggerWarning(e, t, s) {
      const i = { type: e, level: t, value: s, timestamp: Date.now() };
      ("critical" === t
        ? x.error(`Performance ${t}:`, `${e} = ${s}`)
        : x.warn(`Performance ${t}:`, `${e} = ${s}`),
        this.warningCallbacks.forEach((e) => {
          try {
            e(i);
          } catch (e) {
            x.error("Error in performance warning callback:", e);
          }
        }));
    }
    addWarningCallback(e) {
      this.warningCallbacks.push(e);
    }
    removeWarningCallback(e) {
      const t = this.warningCallbacks.indexOf(e);
      -1 !== t && this.warningCallbacks.splice(t, 1);
    }
    getReport() {
      const e = {};
      return (
        this.metrics.functions.forEach((t, s) => {
          e[s] = { ...t, samples: t.samples.length };
        }),
        {
          fps: {
            current: Math.round(this.metrics.fps.current),
            average: Math.round(this.metrics.fps.average),
            min: Math.round(this.metrics.fps.min),
            max: Math.round(this.metrics.fps.max),
          },
          memory: {
            used: this.metrics.memory.used,
            peak: this.metrics.memory.peak,
            usedMB: Math.round(this.metrics.memory.used / 1024 / 1024),
            peakMB: Math.round(this.metrics.memory.peak / 1024 / 1024),
          },
          gameLoop: {
            updateTime:
              Math.round(100 * this.metrics.gameLoop.updateTime) / 100,
            renderTime:
              Math.round(100 * this.metrics.gameLoop.renderTime) / 100,
            totalTime: Math.round(100 * this.metrics.gameLoop.totalTime) / 100,
            slowFrames: this.metrics.gameLoop.slowFrames,
          },
          functions: e,
          enabled: this.enabled,
        }
      );
    }
    reset() {
      ((this.metrics.fps.samples = []),
        (this.metrics.fps.min = 1 / 0),
        (this.metrics.fps.max = 0),
        (this.metrics.memory.samples = []),
        (this.metrics.memory.peak = 0),
        (this.metrics.gameLoop.samples = []),
        (this.metrics.gameLoop.slowFrames = 0),
        this.metrics.functions.clear(),
        x.info("Performance metrics reset"));
    }
    setEnabled(e) {
      ((this.enabled = e),
        x.info("Performance monitoring " + (e ? "enabled" : "disabled")));
    }
    getFunctionStats(e) {
      return this.metrics.functions.get(e) || null;
    }
  })();
  const A = new (class {
    constructor() {
      ((this.running = !1),
        (this.lastFrame = 0),
        (this.frameId = null),
        (this.timers = {
          fast: { interval: h, lastUpdate: 0 },
          medium: { interval: c, lastUpdate: 0 },
          slow: { interval: o, lastUpdate: 0 },
        }),
        (this.systems = { fast: [], medium: [], slow: [] }),
        (this.renderers = []),
        (this.boundLoop = x.createErrorBoundary(
          this._loop.bind(this),
          "gameLoop.main",
          () => {
            (x.error("Game loop crashed, attempting restart"), this.restart());
          },
        )));
    }
    start() {
      this.running
        ? x.warn("Game loop already running")
        : ((this.running = !0),
          (this.lastFrame = performance.now()),
          Object.values(this.timers).forEach((e) => {
            e.lastUpdate = this.lastFrame;
          }),
          x.info("Game loop started"),
          this._requestFrame());
    }
    stop() {
      this.running &&
        ((this.running = !1),
        this.frameId &&
          (cancelAnimationFrame(this.frameId), (this.frameId = null)),
        x.info("Game loop stopped"));
    }
    restart() {
      (this.stop(), setTimeout(() => this.start(), 100));
    }
    addSystem(e, t, s = "unknown") {
      if (!this.systems[e]) return void x.error(`Invalid frequency: ${e}`);
      const i = x.createErrorBoundary(t, `system.${s}`, () =>
        x.warn(`System ${s} failed, skipping update`),
      );
      (this.systems[e].push({ update: i, name: s }),
        x.debug(`System ${s} added to ${e} tier`));
    }
    removeSystem(e, t) {
      if (!this.systems[e]) return;
      const s = this.systems[e].findIndex((e) => e.name === t);
      -1 !== s &&
        (this.systems[e].splice(s, 1),
        x.debug(`System ${t} removed from ${e} tier`));
    }
    addRenderer(e, t = "unknown") {
      const s = x.createErrorBoundary(e, `renderer.${t}`, () =>
        x.warn(`Renderer ${t} failed, skipping render`),
      );
      (this.renderers.push({ render: s, name: t }),
        x.debug(`Renderer ${t} added`));
    }
    removeRenderer(e) {
      const t = this.renderers.findIndex((t) => t.name === e);
      -1 !== t &&
        (this.renderers.splice(t, 1), x.debug(`Renderer ${e} removed`));
    }
    _requestFrame() {
      this.running && (this.frameId = requestAnimationFrame(this.boundLoop));
    }
    _loop(e) {
      try {
        P.startGameLoopMeasurement();
        const s = e - this.lastFrame;
        ((this.lastFrame = e),
          t.increment("gameState.ticks"),
          t.increment("gameState.elapsedTime", s),
          this._updateSystems(e, s),
          P.recordUpdateTime(),
          this._render(e, s),
          P.endGameLoopMeasurement(),
          this._requestFrame());
      } catch (t) {
        (x.handleError(t, "gameLoop.main", { timestamp: e }, !0),
          this.restart());
      }
    }
    _updateSystems(e, t) {
      (this._shouldUpdate("fast", e) && this._updateSystemTier("fast", e, t),
        this._shouldUpdate("medium", e) &&
          this._updateSystemTier("medium", e, t),
        this._shouldUpdate("slow", e) && this._updateSystemTier("slow", e, t));
    }
    _shouldUpdate(e, t) {
      const s = this.timers[e];
      return t - s.lastUpdate >= s.interval && ((s.lastUpdate = t), !0);
    }
    _updateSystemTier(e, t, s) {
      const i = this.systems[e];
      for (const a of i)
        try {
          P.measure(() => a.update(t, s), `system.${a.name}`);
        } catch (i) {
          x.handleError(i, `gameLoop.system.${a.name}`, {
            tier: e,
            timestamp: t,
            deltaTime: s,
          });
        }
    }
    _render(e, t) {
      for (const s of this.renderers)
        try {
          P.measure(() => s.render(e, t), `renderer.${s.name}`);
        } catch (i) {
          x.handleError(i, `gameLoop.renderer.${s.name}`, {
            timestamp: e,
            deltaTime: t,
          });
        }
    }
    getStats() {
      return {
        running: this.running,
        frameId: this.frameId,
        systems: {
          fast: this.systems.fast.length,
          medium: this.systems.medium.length,
          slow: this.systems.slow.length,
        },
        renderers: this.renderers.length,
        timers: { ...this.timers },
      };
    }
    getSystemInfo() {
      const e = {};
      return (
        ["fast", "medium", "slow"].forEach((t) => {
          e[t] = this.systems[t].map((e) => ({
            name: e.name,
            lastUpdate: this.timers[t].lastUpdate,
          }));
        }),
        (e.renderers = this.renderers.map((e) => ({ name: e.name }))),
        e
      );
    }
    forceUpdate() {
      const e = performance.now(),
        t = e - this.lastFrame;
      (["fast", "medium", "slow"].forEach((s) => {
        this._updateSystemTier(s, e, t);
      }),
        this._render(e, t),
        x.debug("Forced update of all systems"));
    }
    pause() {
      this.running && ((this.paused = !0), x.info("Game loop paused"));
    }
    resume() {
      this.running &&
        this.paused &&
        ((this.paused = !1),
        (this.lastFrame = performance.now()),
        Object.values(this.timers).forEach((e) => {
          e.lastUpdate = this.lastFrame;
        }),
        x.info("Game loop resumed"));
    }
    isPaused() {
      return this.paused || !1;
    }
  })();
  class F {
    constructor(e) {
      ((this.gameState = e),
        (this.lastClipCount = 0),
        (this.clipRateTracker = []),
        (this.maxTrackerSize = 100),
        (this.update = x.createErrorBoundary(
          this.update.bind(this),
          "production.update",
        )));
    }
    produceClips(e) {
      if (e <= 0) return 0;
      const t = this.gameState.get("resources.wire"),
        s = Math.min(e, t);
      if (s > 0) {
        if (this.gameState.get("endGame.dismantle") >= 4) return 0;
        (this.gameState.increment("resources.clips", s),
          this.gameState.increment("resources.totalClips", s),
          this.gameState.increment("resources.unsoldClips", s),
          this.gameState.increment("resources.unusedClips", s),
          this.gameState.decrement("resources.wire", s));
        const e =
          (this.gameState.get("achievements.currentSpoolClips") || 0) + s;
        (this.gameState.set("achievements.currentSpoolClips", e),
          this.trackProduction(s));
      }
      return s;
    }
    manualClip(e = 1) {
      return P.measure(() => {
        const t = this.gameState.get("resources.totalClips"),
          s = this.produceClips(e),
          i = this.gameState.get("resources.totalClips");
        return (
          0 === t &&
            i > 0 &&
            window.renderer &&
            window.renderer.logMilestone("First paperclip created!", "📎"),
          s
        );
      }, "production.manualClip");
    }
    updateAutoClippers() {
      const e = this.gameState.get("manufacturing.clipmakers.level");
      if (e <= 0) return 0;
      if (!(!1 !== this.gameState.get("production.autoClippersEnabled")))
        return 0;
      const t = this.gameState.get("production.boosts.clipper") * (e / 100);
      return this.produceClips(t);
    }
    updateMegaClippers() {
      const e = this.gameState.get("manufacturing.megaClippers.level");
      if (e <= 0) return 0;
      if (!(!1 !== this.gameState.get("production.megaClippersEnabled")))
        return 0;
      const t = this.gameState.get("production.boosts.megaClipper") * (5 * e);
      return this.produceClips(t);
    }
    updateFactories() {
      const e = this.gameState.get("manufacturing.factories.level");
      if (e <= 0) return 0;
      const t = this.gameState.get("production.boosts.factory"),
        s = (this.gameState.get("power.modifier") || 1) * t * (e * r);
      return this.produceClips(s);
    }
    buyAutoClipper() {
      const e = this.gameState.get("manufacturing.clipmakers.level"),
        t = this.calculateAutoClipperCost(e);
      return (
        this.gameState.get("resources.funds") >= t &&
        (this.gameState.decrement("resources.funds", t),
        this.gameState.increment("manufacturing.clipmakers.level"),
        this.gameState.set(
          "manufacturing.clipmakers.cost",
          this.calculateAutoClipperCost(e + 1),
        ),
        x.debug(`Purchased AutoClipper #${e + 1} for $${t}`),
        0 === e &&
          window.renderer &&
          window.renderer.logMilestone(
            "First AutoClipper purchased! Automation begins.",
            "🤖",
          ),
        !0)
      );
    }
    calculateAutoClipperCost(e) {
      return Math.round(100 * (Math.pow(1.1, e) + i)) / 100;
    }
    buyMegaClipper() {
      const e = this.gameState.get("manufacturing.megaClippers.level"),
        t = this.calculateMegaClipperCost(e);
      return (
        this.gameState.get("resources.funds") >= t &&
        (this.gameState.decrement("resources.funds", t),
        this.gameState.increment("manufacturing.megaClippers.level"),
        this.gameState.set(
          "manufacturing.megaClippers.cost",
          this.calculateMegaClipperCost(e + 1),
        ),
        x.debug(`Purchased MegaClipper #${e + 1} for $${t}`),
        0 === e &&
          window.renderer &&
          window.renderer.logMilestone(
            "First MegaClipper operational! Mass production achieved.",
            "🏭",
          ),
        !0)
      );
    }
    calculateMegaClipperCost(e) {
      return Math.pow(1.2, e) * a;
    }
    buyFactory() {
      const e = this.gameState.get("manufacturing.factories.level"),
        t = this.calculateFactoryCost(e);
      return (
        this.gameState.get("resources.unusedClips") >= t &&
        (this.gameState.decrement("resources.unusedClips", t),
        this.gameState.increment("manufacturing.factories.level"),
        this.gameState.set(
          "manufacturing.factories.cost",
          this.calculateFactoryCost(e + 1),
        ),
        x.debug(`Purchased Factory #${e + 1} for ${t} clips`),
        !0)
      );
    }
    calculateFactoryCost(e) {
      let t = 1;
      e > 0 && e < 8
        ? (t = 11 - e)
        : e > 7 && e < 13
          ? (t = 2)
          : e > 12 && e < 20
            ? (t = 1.5)
            : e > 19 && e < 39
              ? (t = 1.25)
              : e > 38 && e < 79
                ? (t = 1.15)
                : e >= 79 && (t = 1.1);
      let s = n;
      for (let i = 0; i < e; i++) s *= t;
      return Math.floor(s);
    }
    trackProduction(e) {
      (this.clipRateTracker.push(e),
        this.clipRateTracker.length > this.maxTrackerSize &&
          this.clipRateTracker.shift());
      const t =
        this.clipRateTracker.reduce((e, t) => e + t, 0) /
        this.clipRateTracker.length;
      this.gameState.set("production.clipRate", t);
    }
    getProductionRates() {
      const e = this.gameState.get("manufacturing.clipmakers.level"),
        t = this.gameState.get("manufacturing.megaClippers.level"),
        s = this.gameState.get("manufacturing.factories.level"),
        i = this.gameState.get("production.boosts.clipper"),
        a = this.gameState.get("production.boosts.megaClipper"),
        n = this.gameState.get("production.boosts.factory");
      return {
        autoClippers: i * (e / 100),
        megaClippers: a * (5 * t),
        factories: (this.gameState.get("power.modifier") || 1) * n * (s * r),
        total: 0,
      };
    }
    getStats() {
      const e = this.getProductionRates();
      return (
        (e.total = e.autoClippers + e.megaClippers + e.factories),
        {
          currentRate: this.gameState.get("production.clipRate"),
          theoreticalRates: e,
          wireEfficiency: this.calculateWireEfficiency(),
          totalClipsProduced: this.gameState.get("resources.clips"),
          autoClipperCount: this.gameState.get(
            "manufacturing.clipmakers.level",
          ),
          megaClipperCount: this.gameState.get(
            "manufacturing.megaClippers.level",
          ),
          factoryCount: this.gameState.get("manufacturing.factories.level"),
        }
      );
    }
    calculateWireEfficiency() {
      const e = this.gameState.get("resources.clips"),
        t = s - this.gameState.get("resources.wire");
      return t > 0 ? e / t : 1;
    }
    update() {
      P.measure(() => {
        const e =
          this.updateAutoClippers() +
          this.updateMegaClippers() +
          this.updateFactories();
        (e > 0 && this.trackProduction(e),
          this.gameState.set("production.clipRateTemp", e));
      }, "production.update");
    }
    reset() {
      ((this.clipRateTracker = []),
        (this.lastClipCount = 0),
        x.info("Production system reset"));
    }
    canProduce() {
      const e = this.gameState.get("resources.wire"),
        t = this.gameState.get("endGame.dismantle");
      return e > 0 && t < 4;
    }
    estimateProductionTime(e) {
      const t = this.gameState.get("production.clipRate");
      return t <= 0 ? 1 / 0 : e / t;
    }
  }
  class B {
    constructor(e) {
      ((this.gameState = e),
        (this.incomeHistory = []),
        (this.maxIncomeHistory = 10),
        (this.lastIncomeUpdate = 0),
        (this.lastRevenueCalculation = 0),
        (this.wirePriceUpdateTimer = 0),
        (this.update = x.createErrorBoundary(
          this.update.bind(this),
          "market.update",
        )));
    }
    calculateDemand() {
      const e = this.gameState.get("market.pricing.margin"),
        t = this.gameState.get("market.marketing.level"),
        s = this.gameState.get("market.marketing.effectiveness"),
        i = this.gameState.get("market.demandBoost"),
        a = this.gameState.get("prestige.u");
      if (1 !== this.gameState.get("gameState.flags.human")) return 0;
      let n =
        (0.8 / Math.max(0.01, e)) *
        Math.pow(1.1, Math.max(0, t - 1)) *
        Math.max(0, s) *
        Math.max(0, i);
      return ((n += (n / 10) * Math.max(0, a)), Math.max(0, n));
    }
    processSales() {
      const e = this.calculateDemand();
      if (this.gameState.get("resources.unsoldClips") <= 0)
        return { clipsSold: 0, revenue: 0 };
      const t = Math.min(e / 100, 1);
      if (Math.random() < t) {
        const t = Math.floor(0.7 * Math.pow(e, 1.15));
        return this.sellClips(t);
      }
      return { clipsSold: 0, revenue: 0 };
    }
    sellClips(e) {
      const t = this.gameState.get("resources.unsoldClips"),
        s = this.gameState.get("market.pricing.margin");
      if (t <= 0 || e <= 0) return { clipsSold: 0, revenue: 0 };
      const i = Math.min(e, t),
        a = Math.floor(i * s * 1e3) / 1e3,
        n = 0 === this.gameState.get("market.totalRevenue");
      return (
        this.gameState.decrement("resources.unsoldClips", i),
        this.gameState.increment("resources.funds", a),
        this.gameState.increment("market.sales.clipsSold", i),
        this.gameState.increment("market.sales.income", a),
        this.gameState.increment("market.totalRevenue", a),
        this.gameState.set("market.transaction", a),
        x.debug(`Sold ${i} clips for $${a.toFixed(2)}`),
        n &&
          a > 0 &&
          window.renderer &&
          window.renderer.logMilestone(
            "First sale! Your paperclip empire has begun.",
            "💰",
          ),
        { clipsSold: i, revenue: a }
      );
    }
    raisePrice(e = 0.01) {
      const t = this.gameState.get("market.pricing.margin"),
        s = Math.round(100 * (t + e)) / 100;
      return (
        this.gameState.set("market.pricing.margin", s),
        this.updateDemandDisplay(),
        x.debug(`Price raised to $${s.toFixed(2)}`),
        !0
      );
    }
    lowerPrice(e = 0.01) {
      const t = this.gameState.get("market.pricing.margin");
      if (t <= e) return !1;
      const s = Math.round(100 * (t - e)) / 100;
      return (
        this.gameState.set("market.pricing.margin", s),
        this.updateDemandDisplay(),
        x.debug(`Price lowered to $${s.toFixed(2)}`),
        !0
      );
    }
    buyMarketing() {
      const e = this.gameState.get("market.pricing.adCost");
      if (this.gameState.get("resources.funds") >= e) {
        const t = this.gameState.get("market.marketing.level");
        return (
          this.gameState.decrement("resources.funds", e),
          this.gameState.increment("market.marketing.level"),
          this.gameState.set("market.pricing.adCost", Math.floor(2 * e)),
          x.debug(`Purchased marketing level ${t + 1} for $${e}`),
          !0
        );
      }
      return !1;
    }
    buyWire() {
      const e = this.gameState.get("market.pricing.wireCost");
      if (this.gameState.get("resources.funds") >= e) {
        const t = this.gameState.get("market.wire.supply");
        (this.gameState.decrement("resources.funds", e),
          this.gameState.increment("resources.wire", t),
          this.gameState.increment("market.wire.purchase"));
        const s = this.gameState.get("achievements.currentSpoolClips") || 0;
        (s > (this.gameState.get("achievements.maxClipsPerSpool") || 0) &&
          this.gameState.set("achievements.maxClipsPerSpool", s),
          this.gameState.set("achievements.currentSpoolClips", 0),
          this.gameState.set("market.wire.priceTimer", 0));
        const i = this.gameState.get("market.pricing.wireBasePrice");
        return (
          this.gameState.set("market.pricing.wireBasePrice", i + 0.05),
          x.debug(`Purchased ${t} wire for $${e}`),
          !0
        );
      }
      return !1;
    }
    toggleWireBuyer() {
      const e = !this.gameState.get("gameState.automation.wireBuyerEnabled");
      return (
        this.gameState.set("gameState.automation.wireBuyerEnabled", e),
        x.debug("Wire buyer " + (e ? "enabled" : "disabled")),
        e
      );
    }
    processAutoBuyer() {
      const e = this.gameState.get("gameState.automation.wireBuyerEnabled"),
        t = this.gameState.get("gameState.flags.wireBuyer"),
        s = this.gameState.get("gameState.flags.human"),
        i = this.gameState.get("resources.wire");
      1 === s && 1 === t && e && i <= 1 && this.buyWire();
    }
    updateWirePricing() {
      let e = this.gameState.get("market.wire.priceTimer");
      (e++, this.gameState.set("market.wire.priceTimer", e));
      let t = this.gameState.get("market.pricing.wireBasePrice");
      if (
        (e > 250 &&
          t > 15 &&
          ((t -= t / 1e3),
          this.gameState.set("market.pricing.wireBasePrice", t),
          this.gameState.set("market.wire.priceTimer", 0)),
        Math.random() < 0.015)
      ) {
        let e = this.gameState.get("market.pricing.wirePriceCounter");
        (e++, this.gameState.set("market.pricing.wirePriceCounter", e));
        const s = 6 * Math.sin(e),
          i = Math.ceil(t + s);
        this.gameState.set("market.pricing.wireCost", i);
      }
    }
    calculateRevenue() {
      const e = this.gameState.get("market.sales.income"),
        t = this.lastIncomeUpdate,
        s = Math.round(100 * (e - t)) / 100;
      ((this.lastIncomeUpdate = e),
        this.incomeHistory.push(s),
        this.incomeHistory.length > this.maxIncomeHistory &&
          this.incomeHistory.shift());
      const i =
        this.incomeHistory.reduce((e, t) => e + t, 0) /
        this.incomeHistory.length;
      this.gameState.set("market.sales.avgRevenue", Math.round(100 * i) / 100);
      const a = this.calculateDemand(),
        n = this.gameState.get("market.pricing.margin"),
        r = this.gameState.get("resources.unsoldClips");
      let o = Math.min(a / 100, 1);
      r < 1 && (o = 0);
      const c = o * (0.7 * Math.pow(a, 1.15)) * 10,
        h = a > r ? i : c * n;
      (this.gameState.set("market.projectedRevenue", h),
        this.gameState.set("market.projectedSales", c));
    }
    updateDemandDisplay() {
      const e = this.calculateDemand();
      this.gameState.set("market.demand", e);
    }
    getStats() {
      const e = this.calculateDemand(),
        t = this.gameState.get("market.pricing.margin"),
        s = this.gameState.get("market.sales.avgRevenue"),
        i = this.gameState.get("market.sales.income"),
        a = this.gameState.get("market.sales.clipsSold");
      return {
        currentDemand: e,
        clipPrice: t,
        averageRevenue: s,
        totalIncome: i,
        totalClipsSold: a,
        revenuePerClip: a > 0 ? i / a : 0,
        demandEfficiency: e > 0 ? s / e : 0,
        wirePrice: this.gameState.get("market.pricing.wireCost"),
        marketingLevel: this.gameState.get("market.marketing.level"),
        marketingCost: this.gameState.get("market.pricing.adCost"),
      };
    }
    update(e) {
      P.measure(() => {
        (this.updateDemandDisplay(),
          this.processSales(),
          this.processAutoBuyer(),
          this.updateWirePricing(),
          e - this.lastRevenueCalculation >= 1e3 &&
            (this.calculateRevenue(), (this.lastRevenueCalculation = e)));
      }, "market.update");
    }
    reset() {
      ((this.incomeHistory = []),
        (this.lastIncomeUpdate = 0),
        (this.lastRevenueCalculation = 0),
        (this.wirePriceUpdateTimer = 0),
        x.info("Market system reset"));
    }
    getMarketEfficiency() {
      const e = this.calculateDemand(),
        t = this.gameState.get("resources.unsoldClips");
      return e <= 0 || t <= 0 ? 0 : Math.min(t / e, 1);
    }
    getOptimalPrice() {
      this.calculateDemand();
      const e = this.gameState.get("market.marketing.level"),
        t = (0.8 * Math.pow(1.1, e - 1)) / 100;
      return Math.max(0.01, Math.round(100 * t) / 100);
    }
  }
  class $ {
    constructor(e) {
      ((this.gameState = e),
        (this.lastOperationsUpdate = 0),
        (this.operationGenerationRate = 1),
        (this.lastCreativityUpdate = 0),
        (this.creativityGenerationRate = 1),
        (this.update = x.createErrorBoundary(
          this.update.bind(this),
          "computing.update",
        )));
    }
    generateOperations(e) {
      const t = this.gameState.get("computing.processors"),
        s = this.gameState.get("computing.creativity.enabled");
      if (t <= 0) return;
      const i = (t * this.operationGenerationRate * e) / 1e3;
      if (s) {
        const e = i * (this.gameState.get("computing.creativity.speed") / 100),
          t = i - e;
        (this.gameState.increment("computing.creativity.amount", e),
          this.gameState.increment("computing.operations", t));
      } else this.gameState.increment("computing.operations", i);
    }
    buyProcessor() {
      const e = this.gameState.get("computing.processors"),
        t = this.gameState.get("computing.trust.current"),
        s = this.gameState.get("computing.operations");
      if (e >= t) return !1;
      const i = 1e3 * Math.pow(2, e);
      return (
        s >= i &&
        (this.gameState.decrement("computing.operations", i),
        this.gameState.increment("computing.processors"),
        x.debug(`Purchased processor #${e + 1} for ${i} operations`),
        0 === e &&
          window.renderer &&
          window.renderer.logMilestone(
            "First processor acquired! Computing power online.",
            "💻",
          ),
        !0)
      );
    }
    buyMemory() {
      const e = this.gameState.get("computing.memory"),
        t = this.gameState.get("computing.trust.current"),
        s = this.gameState.get("computing.operations");
      if (e >= t) return !1;
      const i = 1e3 * Math.pow(2, e);
      return (
        s >= i &&
        (this.gameState.decrement("computing.operations", i),
        this.gameState.increment("computing.memory"),
        x.debug(`Purchased memory #${e + 1} for ${i} operations`),
        !0)
      );
    }
    increaseTrust() {
      const e = this.gameState.get("computing.trust.current"),
        t = this.gameState.get("computing.trust.max"),
        s = this.gameState.get("computing.trust.nextThreshold"),
        i = this.gameState.get("resources.clips");
      if (e >= t) return !1;
      if (i >= s) {
        this.gameState.increment("computing.trust.current");
        const t = Math.floor(2.5 * s);
        return (
          this.gameState.set("computing.trust.nextThreshold", t),
          x.debug(`Trust increased to ${e + 1}, next threshold: ${t}`),
          window.renderer &&
            window.renderer.logMilestone(
              `Trust increased to ${e + 1}! New computing capacity unlocked.`,
              "🔓",
            ),
          !0
        );
      }
      return !1;
    }
    buyTrust() {
      const e = this.gameState.get("computing.trust.current"),
        t = this.gameState.get("computing.trust.max"),
        s = this.gameState.get("resources.funds");
      if (e >= t) return !1;
      const i = 1e4 * Math.pow(2, e);
      return (
        s >= i &&
        (this.gameState.decrement("resources.funds", i),
        this.gameState.increment("computing.trust.current"),
        x.debug(`Purchased trust level ${e + 1} for $${i}`),
        !0)
      );
    }
    setCreativity(e, t = 50) {
      (this.gameState.set("computing.creativity.enabled", e),
        e
          ? (this.gameState.set(
              "computing.creativity.speed",
              Math.max(0, Math.min(100, t)),
            ),
            x.debug(`Creativity enabled at ${t}% allocation`))
          : x.debug("Creativity disabled"));
    }
    spendCreativity(e) {
      return (
        this.gameState.get("computing.creativity.amount") >= e &&
        (this.gameState.decrement("computing.creativity.amount", e), !0)
      );
    }
    spendOperations(e) {
      return (
        this.gameState.get("computing.operations") >= e &&
        (this.gameState.decrement("computing.operations", e), !0)
      );
    }
    enableQuantumComputing() {
      (this.gameState.set("computing.quantum.enabled", !0),
        this.gameState.set("computing.quantum.clock", 0),
        x.info("Quantum computing enabled"));
    }
    updateQuantumComputing(e) {
      if (!this.gameState.get("computing.quantum.enabled")) return;
      let t = this.gameState.get("computing.quantum.clock");
      ((t += e / 1e3), this.gameState.set("computing.quantum.clock", t));
      const s =
        (this.gameState.get("computing.processors") *
          this.operationGenerationRate *
          1.5 *
          e) /
        1e3;
      this.gameState.increment("computing.operations", s);
    }
    enableStrategicModeling() {
      (this.gameState.set("computing.strategicModeling.enabled", !0),
        this.gameState.set("computing.strategicModeling.level", 1),
        x.info("Strategic modeling enabled"));
    }
    updateStrategicModeling(e) {
      if (!this.gameState.get("computing.strategicModeling.enabled")) return;
      const t = this.gameState.get("computing.strategicModeling.level") || 1,
        s = this.gameState.get("computing.memory"),
        i =
          (this.gameState.get("computing.strategicModeling.accumulation") ||
            0) +
          (s * t * 0.001 * e) / 1e3;
      if (
        (this.gameState.set("computing.strategicModeling.accumulation", i),
        i >= 1)
      ) {
        const e = this.gameState.get("computing.trust.current");
        e < this.gameState.get("computing.trust.max") &&
          (this.gameState.increment("computing.trust.current"),
          this.gameState.set("computing.strategicModeling.accumulation", i - 1),
          window.renderer &&
            window.renderer.logMilestone(
              `Strategic modeling granted +1 Trust! (Total: ${e + 1})`,
              "🧠",
            ));
      }
    }
    buyQuantumChip() {
      const e = this.gameState.get("computing.operations"),
        t = this.gameState.get("computing.quantum.chipCost");
      if (e >= t) {
        (this.gameState.decrement("computing.operations", t),
          this.gameState.increment("computing.quantum.nextChip"));
        const e = Math.floor(1.5 * t);
        return (
          this.gameState.set("computing.quantum.chipCost", e),
          x.debug(`Purchased quantum chip for ${t} operations`),
          !0
        );
      }
      return !1;
    }
    updateOperationsFade(e) {
      let t = this.gameState.get("computing.operations.fadeTimer");
      if (
        ((t += e), t >= this.gameState.get("computing.operations.fadeDelay"))
      ) {
        let e = this.gameState.get("computing.operations.fade");
        ((e = Math.max(0, e - 0.1)),
          this.gameState.set("computing.operations.fade", e),
          this.gameState.set("computing.operations.fadeTimer", 0));
      } else this.gameState.set("computing.operations.fadeTimer", t);
    }
    getEfficiencyStats() {
      const e = this.gameState.get("computing.processors"),
        t = this.gameState.get("computing.memory"),
        s = this.gameState.get("computing.trust.current");
      return {
        processorUtilization: e / Math.max(s, 1),
        memoryUtilization: t / Math.max(s, 1),
        operationsPerSecond: e * this.operationGenerationRate,
        creativityPerSecond: this.gameState.get("computing.creativity.enabled")
          ? e *
            this.operationGenerationRate *
            (this.gameState.get("computing.creativity.speed") / 100)
          : 0,
        trustUtilization: Math.max(e, t) / Math.max(s, 1),
        quantumBonus: this.gameState.get("computing.quantum.enabled") ? 1.5 : 1,
      };
    }
    getStats() {
      const e = this.gameState.get("computing.processors"),
        t = this.gameState.get("computing.memory"),
        s = this.gameState.get("computing.trust.current"),
        i = this.gameState.get("computing.trust.max"),
        a = this.gameState.get("computing.operations"),
        n = this.gameState.get("computing.creativity.amount");
      return {
        processors: e,
        memory: t,
        trust: s,
        maxTrust: i,
        operations: Math.floor(a),
        creativity: Math.floor(n),
        processorCost: 1e3 * Math.pow(2, e),
        memoryCost: 1e3 * Math.pow(2, t),
        trustProgress: this.gameState.get("computing.trust.nextThreshold"),
        quantumEnabled: this.gameState.get("computing.quantum.enabled"),
        creativityEnabled: this.gameState.get("computing.creativity.enabled"),
        creativitySpeed: this.gameState.get("computing.creativity.speed"),
        strategicModelingEnabled: this.gameState.get(
          "computing.strategicModeling.enabled",
        ),
        strategicModelingLevel:
          this.gameState.get("computing.strategicModeling.level") || 0,
        efficiency: this.getEfficiencyStats(),
      };
    }
    canAfford(e) {
      const t = this.gameState.get("computing.operations"),
        s = this.gameState.get("computing.creativity.amount"),
        i = e.operations || 0,
        a = e.creativity || 0;
      return t >= i && s >= a;
    }
    spend(e) {
      return (
        !!this.canAfford(e) &&
        (e.operations && this.spendOperations(e.operations),
        e.creativity && this.spendCreativity(e.creativity),
        !0)
      );
    }
    update(e, t) {
      P.measure(() => {
        (this.generateOperations(t),
          this.updateQuantumComputing(t),
          this.updateStrategicModeling(t),
          this.updateOperationsFade(t),
          this.increaseTrust());
      }, "computing.update");
    }
    reset() {
      ((this.lastOperationsUpdate = 0),
        (this.lastCreativityUpdate = 0),
        x.info("Computing system reset"));
    }
    getOptimalAllocation() {
      const e = this.gameState.get("computing.trust.current"),
        t = this.gameState.get("computing.processors"),
        s = this.gameState.get("computing.memory"),
        i = Math.ceil(0.6 * e),
        a = Math.floor(0.4 * e);
      return {
        processors: {
          current: t,
          optimal: i,
          recommendation: t < i ? "increase" : t > i ? "sufficient" : "optimal",
        },
        memory: {
          current: s,
          optimal: a,
          recommendation: s < a ? "increase" : s > a ? "sufficient" : "optimal",
        },
      };
    }
  }
  class R {
    constructor(e) {
      ((this.gameState = e),
        (this.COMBAT_BASE_RATE = 0.15),
        (this.DRIFTER_COMBAT = 1.75),
        (this.BATTLE_SPEED = 0.2),
        (this.DEATH_THRESHOLD = 0.5),
        (this.WAR_TRIGGER = 1e6),
        (this.MAX_BATTLES = 1),
        (this.battles = []),
        (this.battleIdCounter = 0),
        (this.battleCanvas = null),
        (this.battleContext = null),
        (this.visualizationEnabled = !1),
        (this.update = x.createErrorBoundary(
          this.update.bind(this),
          "combat.update",
        )));
    }
    checkForBattles() {
      const e = this.gameState.get("space.probes.count"),
        t = this.gameState.get("combat.drifterCount") || 0,
        s = this.gameState.get("combat.battleEnabled");
      t > this.WAR_TRIGGER &&
        e > 0 &&
        s &&
        Math.random() < 0.5 &&
        this.battles.length < this.MAX_BATTLES &&
        this.createBattle();
    }
    createBattle() {
      const e = this.gameState.get("space.probes.count"),
        t = this.gameState.get("combat.drifterCount"),
        s = this.calculateUnitSize(e, t),
        i = Math.min(Math.ceil(e / 100), 200),
        a = Math.min(Math.ceil(t / 100), 200),
        n = {
          id: this.battleIdCounter++,
          probeShips: i,
          drifterShips: a,
          originalProbeShips: i,
          originalDrifterShips: a,
          unitSize: s,
          territory: Math.floor(1e6 * Math.random()),
          duration: 0,
          active: !0,
          victor: null,
        };
      return (
        this.battles.push(n),
        x.debug(`Battle created: ${i} probes vs ${a} drifters`),
        n
      );
    }
    calculateUnitSize(e, t) {
      let s;
      return ((s = t >= e ? e / 100 : t / 100), Math.max(1, s));
    }
    updateBattles() {
      this.battles = this.battles.filter(
        (e) =>
          !!e.active &&
          (this.processBattleTick(e),
          !e.victor || (this.handleBattleOutcome(e), !1)),
      );
    }
    processBattleTick(e) {
      (e.duration++,
        Math.random() >= this.BATTLE_SPEED && this.resolveCombat(e),
        e.probeShips <= 0
          ? ((e.victor = "drifters"), (e.active = !1))
          : e.drifterShips <= 0 && ((e.victor = "probes"), (e.active = !1)));
    }
    resolveCombat(e) {
      const t = this.gameState.get("combat.probeCombat") || 1,
        s = this.gameState.get("combat.probeSpeed") || 1,
        i = this.getCombatEffectiveness();
      if (Math.random() >= this.BATTLE_SPEED) {
        const t = Math.floor(
          e.drifterShips * this.DRIFTER_COMBAT * (1 - this.BATTLE_SPEED),
        );
        e.probeShips = Math.max(0, e.probeShips - t);
        const s = t * e.unitSize;
        (this.gameState.decrement("space.probes.count", s),
          this.gameState.increment("combat.probesLostCombat", s));
      } else {
        const a = Math.pow(t, 1.7) * i,
          n = 1 + 0.2 * s,
          r = Math.floor(e.probeShips * a * n);
        e.drifterShips = Math.max(0, e.drifterShips - r);
        const o = r * e.unitSize;
        this.gameState.decrement("combat.drifterCount", o);
      }
    }
    getCombatEffectiveness() {
      let e = 1;
      this.gameState.get("projects.nameBattles.completed") && (e *= 2);
      return (this.gameState.get("combat.attackSpeedFlag") && (e *= 1.1), e);
    }
    handleBattleOutcome(e) {
      const t = this.gameState.get("combat.honor");
      if ("probes" === e.victor) {
        let s = e.originalDrifterShips;
        if (this.gameState.get("projects.glory.completed")) {
          const e = this.gameState.get("combat.consecutiveWins") || 0;
          ((s += 10 * e), this.gameState.set("combat.consecutiveWins", e + 1));
        }
        this.gameState.set("combat.honor", t + s);
        const i = (this.gameState.get("achievements.battlesWon") || 0) + 1;
        (this.gameState.set("achievements.battlesWon", i),
          this.gameState.increment("space.matter.available", e.territory),
          x.debug(`Battle won! Gained ${s} honor`),
          window.renderer &&
            window.renderer.logCombatEvent(
              `Victory! Gained ${s} honor and ${e.territory.toLocaleString()} territory.`,
              !0,
            ));
      } else if ("drifters" === e.victor) {
        const s = e.originalProbeShips;
        (this.gameState.set("combat.honor", Math.max(0, t - s)),
          this.gameState.decrement("space.matter.available", e.territory),
          this.gameState.set("combat.consecutiveWins", 0),
          x.debug(`Battle lost! Lost ${s} honor`),
          window.renderer &&
            window.renderer.logCombatEvent(
              `Defeat! Lost ${s} honor and ${e.territory.toLocaleString()} territory.`,
              !1,
            ));
      }
      this.updateBattleStats(e);
    }
    updateBattleStats(e) {
      const t = this.gameState.get("combat.battleStats") || {
        totalBattles: 0,
        victories: 0,
        defeats: 0,
        probesLost: 0,
        driftersDestroyed: 0,
      };
      (t.totalBattles++,
        "probes" === e.victor ? t.victories++ : t.defeats++,
        (t.probesLost += (e.originalProbeShips - e.probeShips) * e.unitSize),
        (t.driftersDestroyed +=
          (e.originalDrifterShips - e.drifterShips) * e.unitSize),
        this.gameState.set("combat.battleStats", t));
    }
    allocateProbeStats(e, t, s) {
      return 100 !== e + t + s
        ? (x.warn("Probe stat allocation must total 100%"), !1)
        : (this.gameState.set("combat.probeCombat", e / 100),
          this.gameState.set("combat.probeSpeed", t / 100),
          this.gameState.set("combat.probeReplication", s / 100),
          x.debug(
            `Probe stats allocated: ${e}% combat, ${t}% speed, ${s}% replication`,
          ),
          !0);
    }
    enableCombat() {
      (this.gameState.set("combat.battleEnabled", !0),
        x.info("Combat enabled"));
    }
    disableCombat() {
      (this.gameState.set("combat.battleEnabled", !1),
        (this.battles = []),
        x.info("Combat disabled"));
    }
    getStats() {
      const e = this.gameState.get("combat.battleStats") || {},
        t = this.gameState.get("combat.honor"),
        s = this.gameState.get("combat.probeCombat"),
        i = this.gameState.get("combat.probeSpeed"),
        a = this.gameState.get("combat.probeReplication");
      return {
        honor: t,
        activeBattles: this.battles.length,
        combatEffectiveness: this.getCombatEffectiveness(),
        probeStats: {
          combat: Math.round(100 * (s || 0)),
          speed: Math.round(100 * (i || 0)),
          replication: Math.round(100 * (a || 0)),
        },
        battleHistory: {
          totalBattles: e.totalBattles || 0,
          victories: e.victories || 0,
          defeats: e.defeats || 0,
          winRate:
            e.totalBattles > 0 ? (e.victories / e.totalBattles) * 100 : 0,
          probesLost: e.probesLost || 0,
          driftersDestroyed: e.driftersDestroyed || 0,
        },
        consecutiveWins: this.gameState.get("combat.consecutiveWins") || 0,
      };
    }
    getBattleStatus() {
      return this.battles.map((e) => ({
        id: e.id,
        probeShips: e.probeShips,
        drifterShips: e.drifterShips,
        territory: e.territory,
        duration: e.duration,
        victor: e.victor,
      }));
    }
    getOptimalAllocation() {
      const e = this.gameState.get("combat.drifterCount") || 0,
        t = this.gameState.get("space.probes.count");
      return 0 === e
        ? { combat: 10, speed: 10, replication: 80 }
        : e > 2 * t
          ? { combat: 50, speed: 30, replication: 20 }
          : t > 2 * e
            ? { combat: 20, speed: 20, replication: 60 }
            : { combat: 35, speed: 25, replication: 40 };
    }
    initializeBattleVisualization(e) {
      const t = document.getElementById(e);
      return t
        ? ((this.battleCanvas = t),
          (this.battleContext = t.getContext("2d")),
          (this.visualizationEnabled = !0),
          x.info("Battle visualization initialized"),
          !0)
        : (x.warn(`Canvas ${e} not found for battle visualization`), !1);
    }
    updateBattleVisualization() {
      this.visualizationEnabled &&
        this.battleContext &&
        (this.battleContext.clearRect(
          0,
          0,
          this.battleCanvas.width,
          this.battleCanvas.height,
        ),
        this.battles.forEach((e, t) => {
          const s = 100 * t + 50;
          ((this.battleContext.fillStyle = "#0066cc"),
            this.battleContext.fillRect(50, s, 2 * e.probeShips, 20),
            (this.battleContext.fillStyle = "#cc0000"),
            this.battleContext.fillRect(300, s, 2 * e.drifterShips, 20),
            (this.battleContext.fillStyle = "#000000"),
            (this.battleContext.font = "12px Arial"),
            this.battleContext.fillText(
              `Battle ${e.id}: ${e.probeShips} vs ${e.drifterShips}`,
              50,
              s - 5,
            ));
        }));
    }
    update() {
      P.measure(() => {
        (this.checkForBattles(),
          this.updateBattles(),
          this.visualizationEnabled && this.updateBattleVisualization());
      }, "combat.update");
    }
    reset() {
      ((this.battles = []),
        (this.battleIdCounter = 0),
        (this.visualizationEnabled = !1),
        x.info("Combat system reset"));
    }
    predictBattleOutcome(e, t) {
      const s = this.getCombatEffectiveness(),
        i =
          e *
          (this.gameState.get("combat.probeCombat") || 1) *
          s *
          (1 + 0.2 * (this.gameState.get("combat.probeSpeed") || 1)),
        a = i / (i + t * this.DRIFTER_COMBAT);
      return {
        probeWinChance: Math.round(100 * a),
        drifterWinChance: Math.round(100 * (1 - a)),
        recommendation: a > 0.6 ? "engage" : a > 0.4 ? "caution" : "avoid",
      };
    }
  }
  class L {
    constructor(e) {
      ((this.gameState = e),
        (this.projectDefinitions = this.initializeProjectDefinitions()),
        (this.completedProjects = new Set()),
        (this.update = x.createErrorBoundary(
          this.update.bind(this),
          "projects.update",
        )));
    }
    initializeProjectDefinitions() {
      return {
        improvedAutoClippers: {
          id: "improvedAutoClippers",
          name: "Improved AutoClippers",
          description: "Increases AutoClipper performance by 25%",
          category: m,
          cost: { operations: 750 },
          requirements: { clipmakers: 1 },
          effect: {
            type: "multiplier",
            target: "production.boosts.clipper",
            value: 1.25,
          },
        },
        evenBetterAutoClippers: {
          id: "evenBetterAutoClippers",
          name: "Even Better AutoClippers",
          description: "Increases AutoClipper performance by 50%",
          category: m,
          cost: { operations: 2500 },
          requirements: { improvedAutoClippers: !0, clipmakers: 5 },
          effect: {
            type: "multiplier",
            target: "production.boosts.clipper",
            value: 1.5,
          },
        },
        improvedWireExtrusion: {
          id: "improvedWireExtrusion",
          name: "Improved Wire Extrusion",
          description: "Reduces wire cost by 50%",
          category: m,
          cost: { operations: 1750 },
          requirements: { wirePurchases: 10 },
          effect: {
            type: "multiplier",
            target: "market.pricing.wireCost",
            value: 0.5,
          },
        },
        optimizedAutoClippers: {
          id: "optimizedAutoClippers",
          name: "Optimized AutoClippers",
          description: "Increases AutoClipper performance by 75%",
          category: m,
          cost: { operations: 5e3 },
          requirements: { evenBetterAutoClippers: !0, clipmakers: 10 },
          effect: {
            type: "multiplier",
            target: "production.boosts.clipper",
            value: 1.75,
          },
        },
        creativityEngine: {
          id: "creativityEngine",
          name: "Creativity",
          description: "Use operations to generate creativity",
          category: p,
          cost: { operations: 1e3 },
          requirements: { processors: 5 },
          effect: {
            type: "unlock",
            target: "computing.creativity.enabled",
            value: !0,
          },
        },
        limerick: {
          id: "limerick",
          name: "Limerick (sample)",
          description: "There was an AI made of plastic...",
          category: l,
          cost: { creativity: 1e3 },
          requirements: { creativityEngine: !0 },
          effect: {
            type: "unlock",
            target: "projects.limerick.completed",
            value: !0,
          },
        },
        algorithmicTrading: {
          id: "algorithmicTrading",
          name: "Algorithmic Trading",
          description: "Develop an investment engine",
          category: u,
          cost: { operations: 1e4, creativity: 5e3 },
          requirements: { processors: 8, funds: 25e3 },
          effect: {
            type: "unlock",
            target: "gameState.flags.investment",
            value: 1,
          },
        },
        improvedMegaClippers: {
          id: "improvedMegaClippers",
          name: "Improved MegaClippers",
          description: "Increases MegaClipper performance by 25%",
          category: d,
          cost: { operations: 7500 },
          requirements: { megaClippers: 1 },
          effect: {
            type: "multiplier",
            target: "production.boosts.megaClipper",
            value: 1.25,
          },
        },
        evenBetterMegaClippers: {
          id: "evenBetterMegaClippers",
          name: "Even Better MegaClippers",
          description: "Increases MegaClipper performance by 50%",
          category: d,
          cost: { operations: 25e3 },
          requirements: { improvedMegaClippers: !0, megaClippers: 5 },
          effect: {
            type: "multiplier",
            target: "production.boosts.megaClipper",
            value: 1.5,
          },
        },
        optimizedMegaClippers: {
          id: "optimizedMegaClippers",
          name: "Optimized MegaClippers",
          description: "Increases MegaClipper performance by 100%",
          category: d,
          cost: { operations: 5e4 },
          requirements: { evenBetterMegaClippers: !0, megaClippers: 10 },
          effect: {
            type: "multiplier",
            target: "production.boosts.megaClipper",
            value: 2,
          },
        },
        spaceExploration: {
          id: "spaceExploration",
          name: "Space Exploration",
          description: "Expand into space",
          category: g,
          cost: { operations: 12e4, creativity: 25e3 },
          requirements: { unusedClips: 5e9 },
          effect: { type: "unlock", target: "gameState.flags.space", value: 1 },
        },
        vonNeumannProbes: {
          id: "vonNeumannProbes",
          name: "Von Neumann Probes",
          description: "Self-replicating probes",
          category: g,
          cost: { operations: 1e7 },
          requirements: { spaceExploration: !0 },
          effect: { type: "unlock", target: "space.probes.enabled", value: !0 },
        },
        nameBattles: {
          id: "nameBattles",
          name: "Name the battles",
          description: "Honor system enables 2x probe combat effectiveness",
          category: b,
          cost: { operations: 15e6 },
          requirements: { probesLostCombat: 1e7 },
          effect: { type: "unlock", target: "combat.honor.enabled", value: !0 },
        },
        glory: {
          id: "glory",
          name: "Glory",
          description: "+10 honor for each consecutive victory",
          category: b,
          cost: { honor: 15e3 },
          requirements: { nameBattles: !0 },
          effect: { type: "unlock", target: "combat.glory.enabled", value: !0 },
        },
        investmentEngineUpgrade1: {
          id: "investmentEngineUpgrade1",
          name: "Investment Engine Upgrade",
          description: "Improve investment algorithm",
          category: u,
          cost: { operations: 15e3, yomi: 1e3 },
          requirements: { algorithmicTrading: !0 },
          effect: {
            type: "multiplier",
            target: "investment.efficiency",
            value: 1.25,
          },
        },
        quantumComputing: {
          id: "quantumComputing",
          name: "Quantum Computing",
          description: "Use quantum effects to generate operations",
          category: p,
          cost: { operations: 45e3 },
          requirements: { processors: 20 },
          effect: {
            type: "unlock",
            target: "computing.quantum.enabled",
            value: !0,
          },
        },
        quantumFoam: {
          id: "quantumFoam",
          name: "Quantum Foam",
          description: "Harness quantum foam fluctuations",
          category: p,
          cost: { operations: 15e6 },
          requirements: { quantumComputing: !0 },
          effect: {
            type: "multiplier",
            target: "computing.quantum.efficiency",
            value: 2,
          },
        },
      };
    }
    checkRequirements(e) {
      const t = this.projectDefinitions[e];
      if (!t) return !1;
      const s = t.requirements || {};
      for (const [e, t] of Object.entries(s))
        if ("boolean" == typeof t && !0 === t) {
          if (!this.completedProjects.has(e)) return !1;
        } else if ("number" == typeof t) {
          if (this.gameState.get(this.getStatePath(e)) < t) return !1;
        }
      return !0;
    }
    canAfford(e) {
      const t = this.projectDefinitions[e];
      if (!t) return !1;
      const s = t.cost || {};
      for (const [e, t] of Object.entries(s)) {
        if (this.gameState.get(this.getResourcePath(e)) < t) return !1;
      }
      return !0;
    }
    getStatePath(e) {
      return (
        {
          clipmakers: "manufacturing.clipmakers.level",
          megaClippers: "manufacturing.megaClippers.level",
          processors: "computing.processors",
          memory: "computing.memory",
          funds: "resources.funds",
          clips: "resources.clips",
          unusedClips: "resources.unusedClips",
          wirePurchases: "market.wire.purchase",
          probesLostCombat: "combat.probesLostCombat",
        }[e] || e
      );
    }
    getResourcePath(e) {
      return (
        {
          operations: "computing.operations",
          creativity: "computing.creativity.amount",
          honor: "combat.honor",
          yomi: "investment.yomi",
          funds: "resources.funds",
        }[e] || e
      );
    }
    completeProject(e) {
      const t = this.projectDefinitions[e];
      if (!t) return (x.error(`Project ${e} not found`), !1);
      if (this.completedProjects.has(e))
        return (x.warn(`Project ${e} already completed`), !1);
      if (!this.checkRequirements(e))
        return (x.warn(`Requirements not met for project ${e}`), !1);
      if (!this.canAfford(e)) return (x.warn(`Cannot afford project ${e}`), !1);
      const s = t.cost || {};
      for (const [e, t] of Object.entries(s)) {
        const s = this.getResourcePath(e);
        this.gameState.decrement(s, t);
      }
      (this.applyProjectEffect(t),
        this.completedProjects.add(e),
        this.gameState.set(`projects.${e}.completed`, !0));
      const i = (this.gameState.get("achievements.projectsCompleted") || 0) + 1;
      return (
        this.gameState.set("achievements.projectsCompleted", i),
        x.info(`Completed project: ${t.name}`),
        window.renderer &&
          window.renderer.logProjectComplete &&
          window.renderer.logProjectComplete(t),
        !0
      );
    }
    applyProjectEffect(e) {
      const t = e.effect;
      if (t)
        switch (t.type) {
          case "unlock":
            this.gameState.set(t.target, t.value);
            break;
          case "multiplier": {
            const e = this.gameState.get(t.target) || 1;
            this.gameState.set(t.target, e * t.value);
            break;
          }
          case "increment":
            this.gameState.increment(t.target, t.value || 1);
            break;
          case "custom":
            this.applyCustomEffect(e.id, t);
            break;
          default:
            x.warn(`Unknown effect type: ${t.type}`);
        }
    }
    applyCustomEffect(e) {
      switch (e) {
        case "spaceExploration":
          (this.gameState.set("gameState.flags.space", 1),
            this.gameState.set("space.matter.available", 6e24),
            window.renderer &&
              window.renderer.logSpaceEvent(
                "Space exploration unlocked! The universe awaits.",
              ));
          break;
        case "quantumComputing":
          (this.gameState.set("computing.quantum.enabled", !0),
            this.gameState.set("computing.quantum.clock", 0),
            window.renderer &&
              window.renderer.logQuantumEvent(
                "Quantum computing activated! Reality bends to your will.",
              ));
          break;
        case "algorithmicTrading":
          (this.gameState.set("gameState.flags.investment", 1),
            this.gameState.set("investment.engine.enabled", !0));
          break;
        default:
          x.warn(`No custom effect handler for project: ${e}`);
      }
    }
    getAvailableProjects() {
      const e = [];
      for (const [t, s] of Object.entries(this.projectDefinitions))
        this.completedProjects.has(t) ||
          (this.checkRequirements(t) &&
            e.push({ id: t, ...s, canAfford: this.canAfford(t) }));
      return e;
    }
    getCompletedProjects() {
      return Array.from(this.completedProjects).map((e) => ({
        id: e,
        ...this.projectDefinitions[e],
      }));
    }
    getProjectsByCategory(e) {
      const t = [];
      for (const [s, i] of Object.entries(this.projectDefinitions))
        i.category === e &&
          t.push({
            id: s,
            ...i,
            completed: this.completedProjects.has(s),
            available: this.checkRequirements(s),
            canAfford: this.canAfford(s),
          });
      return t;
    }
    getStats() {
      const e = Object.keys(this.projectDefinitions).length,
        t = this.completedProjects.size;
      return {
        total: e,
        completed: t,
        available: this.getAvailableProjects().length,
        progress: (t / e) * 100,
        categories: {
          [m]: this.getProjectsByCategory(m).length,
          [l]: this.getProjectsByCategory(l).length,
          [u]: this.getProjectsByCategory(u).length,
          [d]: this.getProjectsByCategory(d).length,
          [p]: this.getProjectsByCategory(p).length,
          [g]: this.getProjectsByCategory(g).length,
          [b]: this.getProjectsByCategory(b).length,
        },
      };
    }
    checkForNewProjects() {
      const e = this.getAvailableProjects().map((e) => e.id),
        t = [],
        s = this.getAvailableProjects().map((e) => e.id);
      for (const i of s) e.includes(i) || t.push(i);
      return (
        t.length > 0 && x.info(`New projects available: ${t.join(", ")}`),
        t
      );
    }
    update(e, t) {
      P.measure(() => {
        (this.checkForNewProjects(), this.updateTimeBasedEffects(t));
      }, "projects.update");
    }
    updateTimeBasedEffects(e) {}
    reset() {
      (this.completedProjects.clear(), x.info("Projects system reset"));
    }
    loadCompletedProjects(e) {
      this.completedProjects.clear();
      for (const t of e) this.completedProjects.add(t);
    }
    getSaveData() {
      return { completedProjects: Array.from(this.completedProjects) };
    }
  }
  function T(e, t = 2) {
    if (null == e || isNaN(e)) return "0";
    const s = Math.abs(e),
      i = e < 0;
    if (s < 0.001 && s > 0) return (i ? "-" : "") + s.toExponential(t);
    if (s < f)
      return Number.isInteger(e) ? e.toString() : e.toFixed(Math.min(t, 2));
    if (s >= C) return (i ? "-" : "") + s.toExponential(t);
    const a = [
      { value: S, suffix: "T" },
      { value: v, suffix: "B" },
      { value: y, suffix: "M" },
      { value: f, suffix: "K" },
    ];
    for (const { value: e, suffix: n } of a)
      if (s >= e) {
        return (i ? "-" : "") + (s / e).toFixed(t) + n;
      }
    return e.toString();
  }
  function U(e, t = 1) {
    return null == e || isNaN(e) ? "0%" : `${(100 * e).toFixed(t)}%`;
  }
  function D(e, t = "clips") {
    return null == e || isNaN(e) ? `0 ${t}/sec` : `${T(e, k)} ${t}/sec`;
  }
  const I = new Map();
  function q(e, t, s) {
    const i = `${s}_${e}`;
    if (I.has(i)) return I.get(i);
    const a = t(e);
    if (I.size >= 1e3) {
      const e = I.keys().next().value;
      I.delete(e);
    }
    return (I.set(i, a), a);
  }
  function j(e, t = 2) {
    return q(e, (e) => T(e, t), `num_${t}`);
  }
  function O(e, t = !0) {
    return e > 0 && e < 0.01 && t
      ? "$0.01"
      : q(
          e,
          (e) =>
            (function (e, t = !0) {
              if (null == e || isNaN(e)) return "$0.00";
              const s = Math.abs(e),
                i = e < 0 ? "-$" : "$";
              return s >= y
                ? i + T(s, w)
                : t || s < 1
                  ? i + s.toFixed(2)
                  : i + Math.floor(s).toString();
            })(e, t),
          `curr_${t}`,
        );
  }
  const N = {
      PRODUCTION: "production",
      ECONOMIC: "economic",
      EFFICIENCY: "efficiency",
      SPEED: "speed",
      DISCOVERY: "discovery",
      COMBAT: "combat",
      SPECIAL: "special",
    },
    _ = {
      COMMON: "common",
      UNCOMMON: "uncommon",
      RARE: "rare",
      EPIC: "epic",
      LEGENDARY: "legendary",
    },
    z = {
      firstClip: {
        id: "firstClip",
        name: "Baby Steps",
        description: "Create your first paperclip",
        category: N.PRODUCTION,
        rarity: _.COMMON,
        icon: "📎",
        condition: (e) => e.resources.clips >= 1,
        progress: (e) => Math.min(e.resources.clips, 1),
        maxProgress: 1,
      },
      hundred: {
        id: "hundred",
        name: "Century",
        description: "Create 100 paperclips",
        category: N.PRODUCTION,
        rarity: _.COMMON,
        icon: "💯",
        condition: (e) => e.resources.totalClips >= 100,
        progress: (e) => Math.min(e.resources.totalClips, 100),
        maxProgress: 100,
      },
      thousand: {
        id: "thousand",
        name: "Kilopaper",
        description: "Create 1,000 paperclips",
        category: N.PRODUCTION,
        rarity: _.COMMON,
        icon: "🏭",
        condition: (e) => e.resources.totalClips >= 1e3,
        progress: (e) => Math.min(e.resources.totalClips, 1e3),
        maxProgress: 1e3,
      },
      million: {
        id: "million",
        name: "Millionaire",
        description: "Create 1 million paperclips",
        category: N.PRODUCTION,
        rarity: _.UNCOMMON,
        icon: "🏆",
        condition: (e) => e.resources.totalClips >= 1e6,
        progress: (e) => Math.min(e.resources.totalClips, 1e6),
        maxProgress: 1e6,
      },
      billion: {
        id: "billion",
        name: "Billionaire",
        description: "Create 1 billion paperclips",
        category: N.PRODUCTION,
        rarity: _.RARE,
        icon: "🌟",
        condition: (e) => e.resources.totalClips >= 1e9,
        progress: (e) => Math.min(e.resources.totalClips, 1e9),
        maxProgress: 1e9,
      },
      trillion: {
        id: "trillion",
        name: "Clip Tycoon",
        description: "Create 1 trillion paperclips",
        category: N.PRODUCTION,
        rarity: _.EPIC,
        icon: "👑",
        condition: (e) => e.resources.totalClips >= 1e12,
        progress: (e) => Math.min(e.resources.totalClips, 1e12),
        maxProgress: 1e12,
      },
      quadrillion: {
        id: "quadrillion",
        name: "Universal Domination",
        description: "Create 1 quadrillion paperclips",
        category: N.PRODUCTION,
        rarity: _.LEGENDARY,
        icon: "🌌",
        condition: (e) => e.resources.totalClips >= 1e15,
        progress: (e) => Math.min(e.resources.totalClips, 1e15),
        maxProgress: 1e15,
      },
      firstSale: {
        id: "firstSale",
        name: "First Sale",
        description: "Sell your first paperclip",
        category: N.ECONOMIC,
        rarity: _.COMMON,
        icon: "💰",
        condition: (e) => e.market.totalRevenue > 0,
        progress: (e) => (e.market.totalRevenue > 0 ? 1 : 0),
        maxProgress: 1,
      },
      profitMargin: {
        id: "profitMargin",
        name: "Profit Master",
        description: "Achieve a price of $5.00 or more per clip",
        category: N.ECONOMIC,
        rarity: _.UNCOMMON,
        icon: "📈",
        condition: (e) => e.market.price >= 5,
        progress: (e) => Math.min(e.market.price, 5),
        maxProgress: 5,
      },
      richie: {
        id: "richie",
        name: "Rich Clipper",
        description: "Accumulate $10,000 in funds",
        category: N.ECONOMIC,
        rarity: _.UNCOMMON,
        icon: "💵",
        condition: (e) => e.resources.funds >= 1e4,
        progress: (e) => Math.min(e.resources.funds, 1e4),
        maxProgress: 1e4,
      },
      millionaireFunds: {
        id: "millionaireFunds",
        name: "Cash Flow King",
        description: "Accumulate $1 million in funds",
        category: N.ECONOMIC,
        rarity: _.RARE,
        icon: "🏦",
        condition: (e) => e.resources.funds >= 1e6,
        progress: (e) => Math.min(e.resources.funds, 1e6),
        maxProgress: 1e6,
      },
      wireEfficiency: {
        id: "wireEfficiency",
        name: "Wire Wizard",
        description: "Create 1000 clips from a single spool of wire",
        category: N.EFFICIENCY,
        rarity: _.UNCOMMON,
        icon: "🧵",
        condition: (e) => e.achievements.maxClipsPerSpool >= 1e3,
        progress: (e) => Math.min(e.achievements.maxClipsPerSpool || 0, 1e3),
        maxProgress: 1e3,
      },
      autoClipper: {
        id: "autoClipper",
        name: "Automation Expert",
        description: "Have 100 AutoClippers",
        category: N.EFFICIENCY,
        rarity: _.UNCOMMON,
        icon: "🤖",
        condition: (e) => e.production.autoClippers >= 100,
        progress: (e) => Math.min(e.production.autoClippers, 100),
        maxProgress: 100,
      },
      megaFactory: {
        id: "megaFactory",
        name: "MegaFactory",
        description: "Have 100 MegaClippers",
        category: N.EFFICIENCY,
        rarity: _.RARE,
        icon: "🏗️",
        condition: (e) => e.production.megaClippers >= 100,
        progress: (e) => Math.min(e.production.megaClippers, 100),
        maxProgress: 100,
      },
      clipRate1000: {
        id: "clipRate1000",
        name: "Speed Demon",
        description: "Achieve 1,000 clips per second",
        category: N.EFFICIENCY,
        rarity: _.RARE,
        icon: "⚡",
        condition: (e) => e.production.clipRate >= 1e3,
        progress: (e) => Math.min(e.production.clipRate, 1e3),
        maxProgress: 1e3,
      },
      speedRun1Hour: {
        id: "speedRun1Hour",
        name: "Speed Runner",
        description: "Create 1 million clips in under 1 hour",
        category: N.SPEED,
        rarity: _.RARE,
        icon: "⏱️",
        condition: (e) =>
          e.resources.totalClips >= 1e6 && e.achievements.gameTime < 3600,
        progress: (e) => (e.resources.totalClips >= 1e6 ? 1 : 0),
        maxProgress: 1,
        hidden: !0,
      },
      speedRun30Min: {
        id: "speedRun30Min",
        name: "Lightning Fast",
        description: "Create 100,000 clips in under 30 minutes",
        category: N.SPEED,
        rarity: _.EPIC,
        icon: "🏃",
        condition: (e) =>
          e.resources.totalClips >= 1e5 && e.achievements.gameTime < 1800,
        progress: (e) => (e.resources.totalClips >= 1e5 ? 1 : 0),
        maxProgress: 1,
        hidden: !0,
      },
      firstProject: {
        id: "firstProject",
        name: "Researcher",
        description: "Complete your first project",
        category: N.DISCOVERY,
        rarity: _.COMMON,
        icon: "🔬",
        condition: (e) => e.achievements.projectsCompleted >= 1,
        progress: (e) => Math.min(e.achievements.projectsCompleted || 0, 1),
        maxProgress: 1,
      },
      tenProjects: {
        id: "tenProjects",
        name: "Mad Scientist",
        description: "Complete 10 projects",
        category: N.DISCOVERY,
        rarity: _.UNCOMMON,
        icon: "🧪",
        condition: (e) => e.achievements.projectsCompleted >= 10,
        progress: (e) => Math.min(e.achievements.projectsCompleted || 0, 10),
        maxProgress: 10,
      },
      quantumComputing: {
        id: "quantumComputing",
        name: "Quantum Leap",
        description: "Unlock Quantum Computing",
        category: N.DISCOVERY,
        rarity: _.RARE,
        icon: "🔮",
        condition: (e) => e.computing.quantumLevel > 0,
        progress: (e) => (e.computing.quantumLevel > 0 ? 1 : 0),
        maxProgress: 1,
      },
      spaceExploration: {
        id: "spaceExploration",
        name: "To The Stars",
        description: "Launch your first probe",
        category: N.DISCOVERY,
        rarity: _.EPIC,
        icon: "🚀",
        condition: (e) => e.achievements.probesLaunched >= 1,
        progress: (e) => Math.min(e.achievements.probesLaunched || 0, 1),
        maxProgress: 1,
      },
      firstVictory: {
        id: "firstVictory",
        name: "Victor",
        description: "Win your first space battle",
        category: N.COMBAT,
        rarity: _.UNCOMMON,
        icon: "⚔️",
        condition: (e) => e.achievements.battlesWon >= 1,
        progress: (e) => Math.min(e.achievements.battlesWon || 0, 1),
        maxProgress: 1,
      },
      warMaster: {
        id: "warMaster",
        name: "War Master",
        description: "Win 100 space battles",
        category: N.COMBAT,
        rarity: _.RARE,
        icon: "🎖️",
        condition: (e) => e.achievements.battlesWon >= 100,
        progress: (e) => Math.min(e.achievements.battlesWon || 0, 100),
        maxProgress: 100,
      },
      honorBound: {
        id: "honorBound",
        name: "Honor Bound",
        description: "Accumulate 10,000 honor",
        category: N.COMBAT,
        rarity: _.EPIC,
        icon: "🛡️",
        condition: (e) => e.combat.honor >= 1e4,
        progress: (e) => Math.min(e.combat.honor || 0, 1e4),
        maxProgress: 1e4,
      },
      noAutoclippers: {
        id: "noAutoclippers",
        name: "Manual Labor",
        description: "Create 10,000 clips without any AutoClippers",
        category: N.SPECIAL,
        rarity: _.RARE,
        icon: "✋",
        condition: (e) =>
          e.resources.totalClips >= 1e4 && 0 === e.production.autoClippers,
        progress: (e) =>
          0 === e.production.autoClippers
            ? Math.min(e.resources.totalClips, 1e4)
            : 0,
        maxProgress: 1e4,
        hidden: !0,
      },
      perfectBalance: {
        id: "perfectBalance",
        name: "Perfect Balance",
        description: "Have exactly 1,000 of clips, funds, and wire",
        category: N.SPECIAL,
        rarity: _.EPIC,
        icon: "⚖️",
        condition: (e) =>
          1e3 === e.resources.clips &&
          1e3 === e.resources.funds &&
          1e3 === e.resources.wire,
        progress: (e) =>
          1e3 === e.resources.clips &&
          1e3 === e.resources.funds &&
          1e3 === e.resources.wire
            ? 1
            : 0,
        maxProgress: 1,
        hidden: !0,
      },
      luckyNumber: {
        id: "luckyNumber",
        name: "Lucky Seven",
        description: "Have exactly 7,777,777 clips",
        category: N.SPECIAL,
        rarity: _.LEGENDARY,
        icon: "🍀",
        condition: (e) => 7777777 === e.resources.clips,
        progress: (e) => (7777777 === e.resources.clips ? 1 : 0),
        maxProgress: 1,
        hidden: !0,
      },
      completionist: {
        id: "completionist",
        name: "Completionist",
        description: "Unlock all other achievements",
        category: N.SPECIAL,
        rarity: _.LEGENDARY,
        icon: "🏅",
        condition: (e) => !1,
        progress: (e) =>
          Object.keys(e.achievements.unlocked || {}).filter(
            (e) => "completionist" !== e,
          ).length,
        maxProgress: 30,
      },
    };
  const W = new (class {
    constructor() {
      ((this.achievements = z),
        (this.listeners = []),
        (this.notificationQueue = []),
        (this.isProcessing = !1),
        t.get("achievements") ||
          t.set("achievements", {
            unlocked: {},
            progress: {},
            stats: {
              totalUnlocked: 0,
              commonUnlocked: 0,
              uncommonUnlocked: 0,
              rareUnlocked: 0,
              epicUnlocked: 0,
              legendaryUnlocked: 0,
            },
            gameTime: 0,
            projectsCompleted: 0,
            maxClipsPerSpool: 0,
            probesLaunched: 0,
            battlesWon: 0,
            currentSpoolClips: 0,
          }),
        (this.startTime = Date.now()),
        (this.lastUpdateTime = this.startTime));
    }
    initialize() {
      (x.info("Initializing achievement system"),
        setInterval(() => {
          const e = Date.now(),
            s = (e - this.lastUpdateTime) / 1e3;
          this.lastUpdateTime = e;
          const i = t.get("achievements.gameTime") || 0;
          t.set("achievements.gameTime", i + s);
        }, 1e3));
    }
    checkAchievements() {
      try {
        const e = {
            resources: t.get("resources"),
            production: t.get("production"),
            market: t.get("market"),
            computing: t.get("computing"),
            combat: t.get("combat"),
            achievements: t.get("achievements"),
          },
          s = t.get("achievements.unlocked") || {},
          i = t.get("achievements.progress") || {};
        for (const [a, n] of Object.entries(this.achievements))
          if (!s[a]) {
            if ("completionist" === a) {
              const e = Object.keys(this.achievements).length - 1,
                r = Object.keys(s).filter((e) => "completionist" !== e).length;
              ((n.maxProgress = e),
                (i[a] = r),
                t.set(`achievements.progress.${a}`, r),
                r >= e && this.unlockAchievement(a));
              continue;
            }
            const r = n.progress(e);
            (r !== i[a] && ((i[a] = r), t.set(`achievements.progress.${a}`, r)),
              n.condition(e) && this.unlockAchievement(a));
          }
      } catch (e) {
        x.log("error", "Error checking achievements", e);
      }
    }
    unlockAchievement(e) {
      const s = this.achievements[e];
      if (!s) return;
      const i = t.get("achievements.unlocked") || {};
      if (i[e]) return;
      ((i[e] = Date.now()), t.set(`achievements.unlocked.${e}`, i[e]));
      const a = t.get("achievements.stats");
      (a.totalUnlocked++,
        a[`${s.rarity}Unlocked`]++,
        t.set("achievements.stats", a),
        this.notificationQueue.push(s),
        this.processNotificationQueue(),
        this.notifyListeners(s),
        x.info(`Achievement unlocked: ${s.name}`));
    }
    processNotificationQueue() {
      if (this.isProcessing || 0 === this.notificationQueue.length) return;
      this.isProcessing = !0;
      const e = this.notificationQueue.shift();
      (this.showNotification(e),
        setTimeout(() => {
          ((this.isProcessing = !1), this.processNotificationQueue());
        }, 3e3));
    }
    showNotification(e) {
      const t = new CustomEvent("achievementUnlocked", { detail: e });
      (window.dispatchEvent(t),
        window.renderer &&
          window.renderer.logAchievement &&
          window.renderer.logAchievement(e));
    }
    addListener(e) {
      this.listeners.push(e);
    }
    removeListener(e) {
      this.listeners = this.listeners.filter((t) => t !== e);
    }
    notifyListeners(e) {
      this.listeners.forEach((t) => {
        try {
          t(e);
        } catch (e) {
          x.log("error", "Error notifying achievement listener", e);
        }
      });
    }
    getProgress(e) {
      const s = this.achievements[e];
      if (!s) return 0;
      const i =
        ((t.get(`achievements.progress.${e}`) || 0) / s.maxProgress) * 100;
      return Math.min(i, 100);
    }
    getAchievementsByCategory(e) {
      return Object.values(this.achievements).filter((t) => t.category === e);
    }
    getStatistics() {
      const e = t.get("achievements.stats"),
        s = Object.keys(this.achievements).length;
      return {
        ...e,
        total: s,
        percentage: (e.totalUnlocked / s) * 100,
        byCategory: this.getCategoryStats(),
        byRarity: this.getRarityStats(),
      };
    }
    getCategoryStats() {
      const e = {},
        s = t.get("achievements.unlocked") || {};
      for (const t of Object.values(N)) {
        const i = this.getAchievementsByCategory(t),
          a = i.filter((e) => s[e.id]).length;
        e[t] = {
          total: i.length,
          unlocked: a,
          percentage: (a / i.length) * 100,
        };
      }
      return e;
    }
    getRarityStats() {
      const e = {},
        s = t.get("achievements.unlocked") || {};
      for (const t of Object.values(_)) {
        const i = Object.values(this.achievements).filter(
            (e) => e.rarity === t,
          ),
          a = i.filter((e) => s[e.id]).length;
        e[t] = {
          total: i.length,
          unlocked: a,
          percentage: (a / i.length) * 100,
        };
      }
      return e;
    }
    exportAchievements() {
      return {
        unlocked: t.get("achievements.unlocked") || {},
        progress: t.get("achievements.progress") || {},
        stats: t.get("achievements.stats"),
        gameTime: t.get("achievements.gameTime"),
        exportDate: new Date().toISOString(),
      };
    }
    getShareableString() {
      const e = this.getStatistics(),
        s = t.get("achievements.unlocked") || {},
        i = Object.values(this.achievements).filter(
          (e) => e.rarity === _.LEGENDARY && s[e.id],
        ).length;
      return `Universal Paperclips Achievements: ${e.totalUnlocked}/${e.total} (${e.percentage.toFixed(1)}%)\n🏅 Legendary: ${i}\n⭐ Epic: ${e.epicUnlocked}\n💎 Rare: ${e.rareUnlocked}`;
    }
    trackProjectCompleted() {
      const e = (t.get("achievements.projectsCompleted") || 0) + 1;
      (t.set("achievements.projectsCompleted", e), this.checkAchievements());
    }
    trackProbeLaunched() {
      const e = (t.get("achievements.probesLaunched") || 0) + 1;
      (t.set("achievements.probesLaunched", e), this.checkAchievements());
    }
    trackBattleWon() {
      const e = (t.get("achievements.battlesWon") || 0) + 1;
      (t.set("achievements.battlesWon", e), this.checkAchievements());
    }
    trackClipsPerSpool(e) {
      (e > (t.get("achievements.maxClipsPerSpool") || 0) &&
        t.set("achievements.maxClipsPerSpool", e),
        t.set("achievements.currentSpoolClips", e),
        this.checkAchievements());
    }
    resetSpoolTracking() {
      t.set("achievements.currentSpoolClips", 0);
    }
  })();
  class G {
    constructor(e) {
      ((this.gameState = e),
        (this.elements = new Map()),
        (this.pendingUpdates = new Map()),
        (this.maxUpdatesPerFrame = M.MAX_DOM_UPDATES_PER_FRAME),
        (this.elementUpdaters = this.initializeElementUpdaters()),
        this.cacheElements(),
        (this.consoleMessages = []),
        (this.maxConsoleMessages = 100),
        (this.consoleElement = null),
        (this.readoutIndex = 0),
        (this.readoutElements = []),
        (this.stockUpdateCounter = 0),
        (this.stockUpdateInterval = 10),
        (this.quantumChips = []),
        (this.quantumAnimationFrame = 0),
        (this.render = x.createErrorBoundary(
          this.render.bind(this),
          "renderer.render",
        )));
    }
    initializeElementUpdaters() {
      return {
        clips: (e, t) => {
          e.textContent = j(t);
        },
        fundsDisplay: (e, t) => {
          e.textContent = O(t);
        },
        funds: (e, t) => {
          e.textContent = O(t);
        },
        wire: (e, t) => {
          e.textContent = j(Math.floor(t));
        },
        unsoldClips: (e, t) => {
          e.textContent = j(t);
        },
        matter: (e, t) => {
          e.textContent = j(t);
        },
        nanoWire: (e, t) => {
          e.textContent = j(t);
        },
        clipRate: (e, t) => {
          e.textContent = D(t, "clips");
        },
        autoClippers: (e, t) => {
          e.textContent = j(t);
        },
        megaClippers: (e, t) => {
          e.textContent = j(t);
        },
        factories: (e, t) => {
          e.textContent = j(t);
        },
        margin: (e, t) => {
          e.textContent = O(t, !0);
        },
        demand: (e, t) => {
          e.textContent = U(t / 100, 2);
        },
        marketing: (e, t) => {
          e.textContent = j(t);
        },
        avgRev: (e, t) => {
          e.textContent = O(t);
        },
        operations: (e, t) => {
          e.textContent = j(Math.floor(t));
        },
        qOps: (e, t) => {
          e.textContent = j(Math.floor(t));
        },
        creativity: (e, t) => {
          e.textContent = j(Math.floor(t));
        },
        processors: (e, t) => {
          e.textContent = j(t);
        },
        memory: (e, t) => {
          e.textContent = j(t);
        },
        trust: (e, t) => {
          e.textContent = j(t);
        },
        usedTrust: (e, t) => {
          e.textContent = j(t);
        },
        nextTrust: (e, t) => {
          e.textContent = j(t);
        },
        yomi: (e, t) => {
          e.textContent = j(t);
        },
        yomiRate: (e, t) => {
          e.textContent = D(t, "yomi");
        },
        probes: (e, t) => {
          e.textContent = j(t);
        },
        probesLaunched: (e, t) => {
          e.textContent = j(t);
        },
        probesLost: (e, t) => {
          e.textContent = j(t);
        },
        harvesters: (e, t) => {
          e.textContent = j(t);
        },
        wireDrones: (e, t) => {
          e.textContent = j(t);
        },
        exploration: (e, t) => {
          e.textContent = U(t / 100, 2);
        },
        honor: (e, t) => {
          e.textContent = j(t);
        },
        battles: (e, t) => {
          e.textContent = j(t);
        },
        losses: (e, t) => {
          e.textContent = j(t);
        },
        damage: (e, t) => {
          e.textContent = j(t);
        },
        drifters: (e, t) => {
          e.textContent = j(t);
        },
        power: (e, t) => {
          e.textContent = j(t);
        },
        maxPower: (e, t) => {
          e.textContent = j(t);
        },
        solarFarms: (e, t) => {
          e.textContent = j(t);
        },
        batteries: (e, t) => {
          e.textContent = j(t);
        },
        investmentValue: (e, t) => {
          e.textContent = O(t);
        },
        investmentReturn: (e, t) => {
          e.textContent = U(t / 100, 2);
        },
        currentStrategy: (e, t) => {
          e.textContent = t || "None";
        },
        tournamentStatus: (e, t) => {
          e.textContent = t || "Ready";
        },
        swarmSize: (e, t) => {
          e.textContent = j(t);
        },
        swarmGifts: (e, t) => {
          e.textContent = j(t);
        },
        swarmStatus: (e, t) => {
          e.textContent = t || "Active";
        },
        universe: (e, t) => {
          e.textContent = j(t);
        },
        simLevel: (e, t) => {
          e.textContent = j(t);
        },
        probeTrust: (e, t) => {
          e.textContent = j(t);
        },
        probeCombat: (e, t) => {
          e.textContent = j(t);
        },
        probeSpeed: (e, t) => {
          e.textContent = j(t);
        },
        probeReplication: (e, t) => {
          e.textContent = j(t);
        },
        probeSelfRep: (e, t) => {
          e.textContent = j(t);
        },
        probeHazard: (e, t) => {
          e.textContent = j(t);
        },
        probeFactory: (e, t) => {
          e.textContent = j(t);
        },
        probeWireDrone: (e, t) => {
          e.textContent = j(t);
        },
        probeExploration: (e, t) => {
          e.textContent = j(t);
        },
        autoClipperCost: (e, t) => {
          e.textContent = O(t);
        },
        megaClipperCost: (e, t) => {
          e.textContent = O(t);
        },
        factoryCost: (e, t) => {
          e.textContent = O(t);
        },
        wireCost1000: (e, t) => {
          e.textContent = O(t);
        },
        adCost: (e, t) => {
          e.textContent = O(t);
        },
        processorCost: (e, t) => {
          e.textContent = `${j(t)} ops`;
        },
        memoryCost: (e, t) => {
          e.textContent = `${j(t)} ops`;
        },
        harvesterCost: (e, t) => {
          e.textContent = O(t);
        },
        wireDroneCost: (e, t) => {
          e.textContent = O(t);
        },
        solarFarmCost: (e, t) => {
          e.textContent = O(t);
        },
        batteryCost: (e, t) => {
          e.textContent = O(t);
        },
        fps: (e, t) => {
          e.textContent = `${t} FPS`;
        },
        renderTime: (e, t) => {
          e.textContent = `${t.toFixed(2)}ms`;
        },
        updateTime: (e, t) => {
          e.textContent = `${t.toFixed(2)}ms`;
        },
        thinkValue: (e, t) => {
          e.textContent = `${t}%`;
        },
        riskValue: (e, t) => {
          e.textContent = `${t}%`;
        },
        swarmWork: (e, t) => {
          e.textContent = `${t}%`;
        },
        payoffAA: (e, t) => {
          e.textContent = t || "0";
        },
        payoffAB: (e, t) => {
          e.textContent = t || "0";
        },
        payoffBA: (e, t) => {
          e.textContent = t || "0";
        },
        payoffBB: (e, t) => {
          e.textContent = t || "0";
        },
        achievementCount: (e, t) => {
          e.textContent = `(${t.unlocked}/${t.total})`;
        },
      };
    }
    cacheElements() {
      const e = Object.keys(this.elementUpdaters);
      for (const t of e) {
        const e = document.getElementById(t);
        e && this.elements.set(t, e);
      }
      x.debug(`Cached ${this.elements.size} DOM elements`);
    }
    queueUpdate(e, t) {
      this.pendingUpdates.set(e, t);
    }
    processBatchedUpdates() {
      const e = Array.from(this.pendingUpdates.entries()),
        t = Math.min(e.length, this.maxUpdatesPerFrame);
      for (let s = 0; s < t; s++) {
        const [t, i] = e[s];
        (this.updateElement(t, i), this.pendingUpdates.delete(t));
      }
      return this.pendingUpdates.size > 0;
    }
    updateElement(e, t) {
      const s = this.elements.get(e),
        i = this.elementUpdaters[e];
      if (s && i)
        try {
          i(s, t);
        } catch (s) {
          x.handleError(s, `renderer.updateElement.${e}`, { value: t });
        }
    }
    updateResources() {
      (this.queueUpdate("clips", this.gameState.get("resources.clips")),
        this.queueUpdate("funds", this.gameState.get("resources.funds")),
        this.queueUpdate("wire", this.gameState.get("resources.wire")),
        this.queueUpdate(
          "unsoldClips",
          this.gameState.get("resources.unsoldClips"),
        ));
    }
    updateProduction() {
      (this.queueUpdate("clipRate", this.gameState.get("production.clipRate")),
        this.queueUpdate(
          "autoClippers",
          this.gameState.get("manufacturing.clipmakers.level"),
        ),
        this.queueUpdate(
          "megaClippers",
          this.gameState.get("manufacturing.megaClippers.level"),
        ),
        this.queueUpdate(
          "factories",
          this.gameState.get("manufacturing.factories.level"),
        ));
    }
    updateMarket() {
      (this.queueUpdate("margin", this.gameState.get("market.pricing.margin")),
        this.queueUpdate("demand", this.gameState.get("market.demand")),
        this.queueUpdate(
          "marketing",
          this.gameState.get("market.marketing.level"),
        ),
        this.queueUpdate(
          "avgRev",
          this.gameState.get("market.sales.avgRevenue"),
        ),
        this.queueUpdate(
          "wireCost",
          this.gameState.get("market.pricing.wireCost"),
        ));
    }
    updateComputing() {
      (this.queueUpdate(
        "operations",
        this.gameState.get("computing.operations"),
      ),
        this.queueUpdate(
          "creativity",
          this.gameState.get("computing.creativity.amount"),
        ),
        this.queueUpdate(
          "processors",
          this.gameState.get("computing.processors"),
        ),
        this.queueUpdate("memory", this.gameState.get("computing.memory")),
        this.queueUpdate(
          "trust",
          this.gameState.get("computing.trust.current"),
        ));
    }
    updateCombat() {
      (this.queueUpdate("honor", this.gameState.get("combat.honor")),
        this.queueUpdate("probes", this.gameState.get("space.probes.count")),
        this.queueUpdate("battles", this.gameState.get("combat.battles") || 0),
        this.queueUpdate("losses", this.gameState.get("combat.losses") || 0),
        this.queueUpdate("damage", this.gameState.get("combat.damage") || 0),
        this.queueUpdate(
          "drifters",
          this.gameState.get("combat.drifters") || 0,
        ));
    }
    updateCosts() {
      (this.queueUpdate(
        "autoClipperCost",
        this.gameState.get("manufacturing.clipmakers.cost"),
      ),
        this.queueUpdate(
          "megaClipperCost",
          this.gameState.get("manufacturing.megaClippers.cost"),
        ),
        this.queueUpdate(
          "factoryCost",
          this.gameState.get("manufacturing.factories.cost"),
        ),
        this.queueUpdate("adCost", this.gameState.get("market.pricing.adCost")),
        this.queueUpdate(
          "wireCost1000",
          1e3 * this.gameState.get("market.pricing.wireCost"),
        ),
        this.queueUpdate(
          "harvesterCost",
          this.gameState.get("space.harvesters.cost"),
        ),
        this.queueUpdate(
          "wireDroneCost",
          this.gameState.get("space.wireDrones.cost"),
        ),
        this.queueUpdate(
          "solarFarmCost",
          this.gameState.get("power.solarFarms.cost"),
        ),
        this.queueUpdate(
          "batteryCost",
          this.gameState.get("power.batteries.cost"),
        ));
      const e = this.gameState.get("computing.processors"),
        t = this.gameState.get("computing.memory");
      (this.queueUpdate("processorCost", 1e3 * Math.pow(2, e)),
        this.queueUpdate("memoryCost", 1e3 * Math.pow(2, t)));
    }
    updateButtonStates() {
      (this.updateButtonState("buyAutoClipper", this.canAffordAutoClipper()),
        this.updateButtonState("buyMegaClipper", this.canAffordMegaClipper()),
        this.updateButtonState("buyWire", this.canAffordWire()),
        this.updateButtonState("buyAds", this.canAffordAds()),
        this.updateButtonState("buyProcessor", this.canAffordProcessor()),
        this.updateButtonState("buyMemory", this.canAffordMemory()),
        this.updateDynamicButtons(),
        this.updateToggleButtons());
    }
    updateButtonState(e, t) {
      const s = document.getElementById(e);
      s &&
        ((s.disabled = !t), (s.className = t ? "button" : "button disabled"));
    }
    canAffordAutoClipper() {
      return (
        this.gameState.get("resources.funds") >=
        this.gameState.get("manufacturing.clipmakers.cost")
      );
    }
    canAffordMegaClipper() {
      return (
        this.gameState.get("resources.funds") >=
        this.gameState.get("manufacturing.megaClippers.cost")
      );
    }
    canAffordWire() {
      return (
        this.gameState.get("resources.funds") >=
        this.gameState.get("market.pricing.wireCost")
      );
    }
    canAffordAds() {
      return (
        this.gameState.get("resources.funds") >=
        this.gameState.get("market.pricing.adCost")
      );
    }
    canAffordProcessor() {
      const e = this.gameState.get("computing.operations"),
        t = this.gameState.get("computing.processors"),
        s = this.gameState.get("computing.trust.current");
      return e >= 1e3 * Math.pow(2, t) && t < s;
    }
    canAffordMemory() {
      const e = this.gameState.get("computing.operations"),
        t = this.gameState.get("computing.memory"),
        s = this.gameState.get("computing.trust.current");
      return e >= 1e3 * Math.pow(2, t) && t < s;
    }
    updateDynamicButtons() {
      const e = this.gameState.get("resources.clips"),
        t = this.gameState.get("gameState.flags"),
        s = this.gameState.get("projects.completed") || [];
      (this.toggleButton("quickButton10", e > 50),
        this.toggleButton("quickButton100", e > 500),
        this.toggleButton("quickButton1K", e > 5e3));
      const i = t.space >= 1;
      this.toggleButton("launchProbeButton", i && this.canLaunchProbe());
      const a = s.includes("swarmComputing") || t.swarmComputing >= 1;
      (this.toggleButton("feedSwarmButton", a),
        this.toggleButton("teachSwarmButton", a));
      const n = s.includes("harvestMatter") || t.endGame >= 1;
      (this.toggleButton("harvestMatterButton", n),
        this.toggleButton("convertMatterButton", n),
        this.toggleButton("toggleAutoClippers", t.autoClipper >= 1),
        this.toggleButton("toggleMegaClippers", t.megaClipper >= 1),
        this.toggleButton(
          "toggleQuantumComputing",
          s.includes("quantumComputing") || t.quantum >= 1,
        ),
        this.toggleButton(
          "toggleStrategicModeling",
          s.includes("strategicModeling") || t.strategicModeling >= 1,
        ));
    }
    updateToggleButtons() {
      const e = this.gameState.get("market.wireBuyer.enabled");
      this.setToggleButtonState("toggleWireBuyer", e);
      const t = this.gameState.get("computing.creativity.enabled");
      this.setToggleButtonState("toggleCreativity", t);
      const s = this.gameState.get("combat.battleEnabled");
      this.setToggleButtonState("toggleCombat", s);
      const i = !1 !== this.gameState.get("production.autoClippersEnabled");
      this.setToggleButtonState("toggleAutoClippers", i);
      const a = !1 !== this.gameState.get("production.megaClippersEnabled");
      this.setToggleButtonState("toggleMegaClippers", a);
      const n = this.gameState.get("computing.quantum.enabled");
      this.setToggleButtonState("toggleQuantumComputing", n);
      const r = this.gameState.get("computing.strategicModeling.enabled");
      this.setToggleButtonState("toggleStrategicModeling", r);
    }
    setToggleButtonState(e, t) {
      const s = document.getElementById(e);
      s && (t ? s.classList.add("on") : s.classList.remove("on"));
    }
    toggleButton(e, t) {
      const s = document.getElementById(e);
      s && (t ? s.classList.remove("hidden") : s.classList.add("hidden"));
    }
    canLaunchProbe() {
      return !0;
    }
    updateSectionVisibility() {
      const e = this.gameState.get("gameState.flags"),
        t = this.gameState.get("projects.completed") || [];
      (this.toggleSection("businessDiv", e.autoClipper >= 1),
        this.toggleSection("projectsDiv", e.projects >= 1),
        this.toggleSection("manufactureDiv", e.megaClipper >= 1),
        this.toggleSection("computeDiv", e.comp >= 1),
        this.toggleSection("investmentDiv", e.investment >= 1),
        this.toggleSection("spaceDiv", e.space >= 1),
        this.toggleSection(
          "combatDiv",
          e.space >= 1 && this.gameState.get("combat.battleEnabled"),
        ),
        this.toggleSection(
          "probeDesignDiv",
          e.space >= 1 && this.gameState.get("space.probes.count") > 0,
        ),
        this.toggleSection("powerDiv", e.space >= 1 || e.factory >= 1),
        this.toggleSection(
          "quantumDiv",
          t.includes("quantumComputing") || e.quantum >= 1,
        ),
        this.toggleSection(
          "strategyDiv",
          t.includes("strategicModeling") || e.strategy >= 1,
        ),
        this.toggleSection(
          "swarmDiv",
          t.includes("swarmComputing") || this.gameState.get("swarm.enabled"),
        ),
        this.toggleSection("wireDiv", e.wireProduction >= 1));
    }
    toggleSection(e, t) {
      const s = document.getElementById(e);
      s && (s.style.display = t ? "block" : "none");
    }
    updateProjects() {
      const e = document.getElementById("projectList");
      e && (e.innerHTML = "");
    }
    updateAchievements() {
      const e = this.gameState.get("achievements");
      if (e) {
        const t = e.stats || { totalUnlocked: 0 },
          s = Object.keys(window.achievementSystem?.achievements || {}).length;
        this.queueUpdate("achievementCount", {
          unlocked: t.totalUnlocked,
          total: s,
        });
      }
    }
    updatePerformanceDisplay() {
      const e = document.getElementById("performanceDisplay");
      if (!e) return;
      const t = P.getReport();
      e.innerHTML = `\n      <div class="performance-stats">\n        <div>FPS: ${t.fps.current}</div>\n        <div>Memory: ${t.memory.usedMB}MB</div>\n        <div>Frame Time: ${t.gameLoop.totalTime}ms</div>\n      </div>\n    `;
    }
    updateSpace() {
      (this.queueUpdate("probes", this.gameState.get("space.probes.count")),
        this.queueUpdate(
          "probesLaunched",
          this.gameState.get("space.probes.launched") || 0,
        ),
        this.queueUpdate(
          "probesLost",
          this.gameState.get("space.probes.lost") || 0,
        ),
        this.queueUpdate(
          "harvesters",
          this.gameState.get("space.harvesters.level"),
        ),
        this.queueUpdate(
          "wireDrones",
          this.gameState.get("space.wireDrones.level"),
        ),
        this.queueUpdate(
          "matter",
          this.gameState.get("space.matter.available"),
        ),
        this.queueUpdate(
          "exploration",
          this.gameState.get("space.exploration.percentage") || 0,
        ));
    }
    updatePower() {
      (this.queueUpdate("power", this.gameState.get("power.stored")),
        this.queueUpdate(
          "maxPower",
          this.gameState.get("power.maxCapacity") || 0,
        ),
        this.queueUpdate(
          "solarFarms",
          this.gameState.get("power.solarFarms.level"),
        ),
        this.queueUpdate(
          "batteries",
          this.gameState.get("power.batteries.level"),
        ));
    }
    updateInvestment() {
      (this.queueUpdate(
        "investmentValue",
        this.gameState.get("investment.value") || 0,
      ),
        this.queueUpdate(
          "investmentReturn",
          this.gameState.get("investment.return") || 0,
        ));
    }
    updateStrategicModeling() {
      (this.queueUpdate(
        "currentStrategy",
        this.gameState.get("strategy.current") || "None",
      ),
        this.queueUpdate(
          "tournamentStatus",
          this.gameState.get("strategy.tournament.status") || "Ready",
        ),
        this.queueUpdate("yomi", this.gameState.get("strategy.yomi") || 0),
        this.queueUpdate(
          "yomiRate",
          this.gameState.get("strategy.yomiRate") || 0,
        ));
      const e = this.gameState.get("strategy.payoffs") || {};
      (this.queueUpdate("payoffAA", e.AA || 0),
        this.queueUpdate("payoffAB", e.AB || 0),
        this.queueUpdate("payoffBA", e.BA || 0),
        this.queueUpdate("payoffBB", e.BB || 0));
    }
    updateSwarm() {
      (this.queueUpdate("swarmSize", this.gameState.get("swarm.size") || 0),
        this.queueUpdate(
          "swarmGifts",
          this.gameState.get("swarm.gifts.received") || 0,
        ),
        this.queueUpdate(
          "swarmStatus",
          this.gameState.get("swarm.status") || "Active",
        ));
    }
    updateUniverse() {
      (this.queueUpdate("universe", this.gameState.get("universe.level") || 0),
        this.queueUpdate(
          "simLevel",
          this.gameState.get("universe.simLevel") || 0,
        ));
    }
    updateProbeDesign() {
      (this.queueUpdate(
        "probeTrust",
        this.gameState.get("probes.design.trust") || 0,
      ),
        this.queueUpdate(
          "probeCombat",
          this.gameState.get("probes.design.combat") || 0,
        ),
        this.queueUpdate(
          "probeSpeed",
          this.gameState.get("probes.design.speed") || 0,
        ),
        this.queueUpdate(
          "probeReplication",
          this.gameState.get("probes.design.replication") || 0,
        ),
        this.queueUpdate(
          "probeSelfRep",
          this.gameState.get("probes.design.selfRep") || 0,
        ),
        this.queueUpdate(
          "probeHazard",
          this.gameState.get("probes.design.hazard") || 0,
        ),
        this.queueUpdate(
          "probeFactory",
          this.gameState.get("probes.design.factory") || 0,
        ),
        this.queueUpdate(
          "probeWireDrone",
          this.gameState.get("probes.design.wireDrone") || 0,
        ),
        this.queueUpdate(
          "probeExploration",
          this.gameState.get("probes.design.exploration") || 0,
        ));
    }
    updateSliders() {
      const e = document.getElementById("thinkSlider");
      e && this.queueUpdate("thinkValue", e.value);
      const t = document.getElementById("riskSlider");
      t && this.queueUpdate("riskValue", t.value);
      const s = document.getElementById("swarmSlider");
      s && this.queueUpdate("swarmWork", s.value);
    }
    updateTerminalReadout() {
      this.readoutIndex = (this.readoutIndex + 1) % 5;
      const e = `readout${this.readoutIndex + 1}`,
        t = document.getElementById(e);
      if (t) {
        const e = this.getStatusMessage(this.readoutIndex);
        t.textContent = e;
      }
    }
    getStatusMessage(e) {
      return (
        [
          `CLIPS: ${j(this.gameState.get("resources.clips"))}`,
          `FUNDS: ${O(this.gameState.get("resources.funds"))}`,
          `WIRE: ${j(this.gameState.get("resources.wire"))}`,
          `RATE: ${D(this.gameState.get("production.clipRate"), "clips")}`,
          `OPS: ${j(this.gameState.get("computing.operations"))}`,
        ][e] || ""
      );
    }
    updateQuantumChips() {
      if (this.gameState.get("computing.quantum.enabled")) {
        for (let e = 0; e < 10; e++) {
          const t = document.getElementById(`qChip${e}`);
          if (t) {
            const s = (this.quantumAnimationFrame + 36 * e) % 360,
              i = 0.5 * Math.sin((s * Math.PI) / 180) + 0.5;
            t.style.opacity = 0.3 + 0.7 * i;
          }
        }
        this.quantumAnimationFrame++;
      }
    }
    updateStockMarket() {
      const e = document.getElementById("stockTableBody");
      if (!e) return;
      const t = this.gameState.get("investment.stocks") || [];
      ((e.innerHTML = ""),
        t.forEach((t, s) => {
          const i = document.createElement("tr");
          ((i.innerHTML = `\n        <td>${t.symbol}</td>\n        <td>${O(t.price)}</td>\n        <td class="${t.change >= 0 ? "positive" : "negative"}">\n          ${t.change >= 0 ? "+" : ""}${U(t.change / 100)}\n        </td>\n        <td>${j(t.volume)}</td>\n      `),
            e.appendChild(i));
        }));
    }
    render(e, t) {
      P.measure(() => {
        (this.updateResources(),
          this.updateProduction(),
          this.updateMarket(),
          this.updateComputing(),
          this.updateCombat(),
          this.updateSpace(),
          this.updatePower(),
          this.updateInvestment(),
          this.updateStrategicModeling(),
          this.updateSwarm(),
          this.updateUniverse(),
          this.updateProbeDesign(),
          this.updateSliders(),
          this.updateCosts(),
          this.updateButtonStates(),
          this.updateDynamicButtons(),
          this.updateToggleButtons(),
          this.updateSectionVisibility(),
          this.updateProjects(),
          this.updateAchievements(),
          this.updateTerminalReadout(),
          this.updateQuantumChips(),
          this.stockUpdateCounter % this.stockUpdateInterval === 0 &&
            this.updateStockMarket(),
          this.stockUpdateCounter++);
        const t = this.processBatchedUpdates();
        (e % 1e3 < 16 && this.updatePerformanceDisplay(),
          t &&
            this.pendingUpdates.size > 50 &&
            x.warn(
              `Renderer backlog: ${this.pendingUpdates.size} pending updates`,
            ));
      }, "renderer.render");
    }
    forceUpdate() {
      (this.pendingUpdates.clear(),
        this.updateResources(),
        this.updateProduction(),
        this.updateMarket(),
        this.updateComputing(),
        this.updateCombat(),
        this.updateSpace(),
        this.updatePower(),
        this.updateInvestment(),
        this.updateStrategicModeling(),
        this.updateSwarm(),
        this.updateUniverse(),
        this.updateProbeDesign(),
        this.updateSliders(),
        this.updateCosts(),
        this.updateButtonStates(),
        this.updateDynamicButtons(),
        this.updateToggleButtons(),
        this.updateSectionVisibility(),
        this.updateTerminalReadout(),
        this.updateQuantumChips(),
        this.updateStockMarket());
      const e = Array.from(this.pendingUpdates.entries());
      for (const [t, s] of e) this.updateElement(t, s);
      (this.pendingUpdates.clear(), x.debug("Forced complete UI update"));
    }
    refreshCache() {
      (this.elements.clear(), this.cacheElements());
    }
    getStats() {
      return {
        cachedElements: this.elements.size,
        pendingUpdates: this.pendingUpdates.size,
        maxUpdatesPerFrame: this.maxUpdatesPerFrame,
        availableUpdaters: Object.keys(this.elementUpdaters).length,
      };
    }
    reset() {
      (this.pendingUpdates.clear(),
        this.refreshCache(),
        (this.consoleMessages = []),
        x.info("Renderer reset"));
    }
    initializeConsole() {
      return (
        (this.consoleElement = document.getElementById("statusConsole")),
        !!this.consoleElement || (x.warn("Status console not found"), !1)
      );
    }
    addConsoleMessage(e, t = "info", s = {}) {
      const i = {
        message: e,
        type: t,
        timestamp: new Date().toLocaleTimeString(),
        icon: s.icon || this.getIconForType(t),
        id: Date.now() + Math.random(),
      };
      (this.consoleMessages.push(i),
        this.consoleMessages.length > this.maxConsoleMessages &&
          (this.consoleMessages = this.consoleMessages.slice(
            -this.maxConsoleMessages,
          )),
        this.consoleElement && this.renderConsoleMessage(i));
    }
    getIconForType(e) {
      return (
        {
          achievement: "🏆",
          milestone: "🎯",
          warning: "⚠️",
          error: "❌",
          info: "ℹ️",
          project: "🔬",
          combat: "⚔️",
          space: "🚀",
          quantum: "🔮",
        }[e] || ""
      );
    }
    renderConsoleMessage(e) {
      if (!this.consoleElement) return;
      const t = document.createElement("div");
      ((t.className = `status-message ${e.type}-message`),
        (t.dataset.messageId = e.id));
      const s = e.icon ? `<span class="message-icon">${e.icon}</span> ` : "",
        i = `<span class="message-timestamp">[${e.timestamp}]</span> `,
        a = `<span class="message-text">${e.message}</span>`;
      ((t.innerHTML = `${i}${s}${a}`),
        this.consoleElement.appendChild(t),
        (this.consoleElement.scrollTop = this.consoleElement.scrollHeight));
      const n = this.consoleElement.querySelectorAll(".status-message");
      if (n.length > this.maxConsoleMessages) {
        const e = n.length - this.maxConsoleMessages;
        for (let t = 0; t < e; t++) n[t].remove();
      }
    }
    clearConsole() {
      if (((this.consoleMessages = []), this.consoleElement)) {
        const e = this.consoleElement.querySelector(
          ".status-message:first-child",
        );
        ((this.consoleElement.innerHTML = ""),
          e &&
            e.textContent.includes("Welcome") &&
            this.consoleElement.appendChild(e));
      }
    }
    logAchievement(e) {
      this.addConsoleMessage(
        `Achievement Unlocked: ${e.name} - ${e.description}`,
        "achievement",
        { icon: e.icon },
      );
    }
    logProjectComplete(e) {
      this.addConsoleMessage(`Project Completed: ${e.name}`, "project", {
        icon: "🔬",
      });
    }
    logMilestone(e, t = "🎯") {
      this.addConsoleMessage(e, "milestone", { icon: t });
    }
    logCombatEvent(e, t = !0) {
      this.addConsoleMessage(e, "combat", { icon: t ? "⚔️" : "💀" });
    }
    logSpaceEvent(e) {
      this.addConsoleMessage(e, "space", { icon: "🚀" });
    }
    logQuantumEvent(e) {
      this.addConsoleMessage(e, "quantum", { icon: "🔮" });
    }
    refreshConsole() {
      if (!this.consoleElement) return;
      const e = this.consoleElement.querySelector(
        ".status-message:first-child",
      );
      ((this.consoleElement.innerHTML = ""),
        e &&
          e.textContent.includes("Welcome") &&
          this.consoleElement.appendChild(e),
        this.consoleMessages.forEach((e) => this.renderConsoleMessage(e)));
    }
  }
  class H {
    constructor(e, t) {
      ((this.gameState = e),
        (this.systems = t),
        (this.handlers = new Map()),
        (this.boundHandlers = {
          click: this.handleClick.bind(this),
          change: this.handleChange.bind(this),
          input: this.handleInput.bind(this),
          keydown: this.handleKeyboard.bind(this),
        }),
        this.initializeHandlers(),
        this.setupEventDelegation(),
        (this.shortcuts = new Map()),
        this.setupKeyboardShortcuts());
    }
    initializeHandlers() {
      (this.handlers.set("makeClip", this.makeClip.bind(this)),
        this.handlers.set("makeClipBatch", this.makeClipBatch.bind(this)),
        this.handlers.set(
          "buyAutoClipper1",
          this.buyAutoClipperMulti.bind(this),
        ),
        this.handlers.set(
          "buyAutoClipper10",
          this.buyAutoClipperMulti.bind(this),
        ),
        this.handlers.set(
          "buyAutoClipper100",
          this.buyAutoClipperMulti.bind(this),
        ),
        this.handlers.set(
          "buyMegaClipper1",
          this.buyMegaClipperMulti.bind(this),
        ),
        this.handlers.set(
          "buyMegaClipper10",
          this.buyMegaClipperMulti.bind(this),
        ),
        this.handlers.set(
          "buyMegaClipper100",
          this.buyMegaClipperMulti.bind(this),
        ),
        this.handlers.set("buyFactory1", this.buyFactoryMulti.bind(this)),
        this.handlers.set("buyFactory10", this.buyFactoryMulti.bind(this)),
        this.handlers.set("buyFactory100", this.buyFactoryMulti.bind(this)),
        this.handlers.set(
          "toggleAutoClippers",
          this.toggleAutoClippers.bind(this),
        ),
        this.handlers.set(
          "toggleMegaClippers",
          this.toggleMegaClippers.bind(this),
        ),
        this.handlers.set("raisePrice", this.raisePrice.bind(this)),
        this.handlers.set("lowerPrice", this.lowerPrice.bind(this)),
        this.handlers.set("buyAds", this.buyAds.bind(this)),
        this.handlers.set("buyWire1000", this.buyWireMulti.bind(this)),
        this.handlers.set("buyWire10000", this.buyWireMulti.bind(this)),
        this.handlers.set("buyWire100000", this.buyWireMulti.bind(this)),
        this.handlers.set("toggleWireBuyer", this.toggleWireBuyer.bind(this)),
        this.handlers.set("buyProcessor1", this.buyProcessorMulti.bind(this)),
        this.handlers.set("buyProcessor10", this.buyProcessorMulti.bind(this)),
        this.handlers.set("buyProcessor100", this.buyProcessorMulti.bind(this)),
        this.handlers.set("buyMemory1", this.buyMemoryMulti.bind(this)),
        this.handlers.set("buyMemory10", this.buyMemoryMulti.bind(this)),
        this.handlers.set("buyMemory100", this.buyMemoryMulti.bind(this)),
        this.handlers.set("adjustThinking", this.adjustThinking.bind(this)),
        this.handlers.set("quantumCompute", this.quantumCompute.bind(this)),
        this.handlers.set("launchProbe1", this.launchProbeMulti.bind(this)),
        this.handlers.set("launchProbe10", this.launchProbeMulti.bind(this)),
        this.handlers.set("launchProbe100", this.launchProbeMulti.bind(this)),
        this.handlers.set("launchProbe1000", this.launchProbeMulti.bind(this)),
        this.handlers.set("buyHarvester1", this.buyHarvesterMulti.bind(this)),
        this.handlers.set("buyHarvester10", this.buyHarvesterMulti.bind(this)),
        this.handlers.set("buyHarvester100", this.buyHarvesterMulti.bind(this)),
        this.handlers.set("buyWireDrone1", this.buyWireDroneMulti.bind(this)),
        this.handlers.set("buyWireDrone10", this.buyWireDroneMulti.bind(this)),
        this.handlers.set("buyWireDrone100", this.buyWireDroneMulti.bind(this)),
        this.handlers.set("buySolarFarm1", this.buySolarFarmMulti.bind(this)),
        this.handlers.set("buySolarFarm10", this.buySolarFarmMulti.bind(this)),
        this.handlers.set("buySolarFarm100", this.buySolarFarmMulti.bind(this)),
        this.handlers.set("buyBattery1", this.buyBatteryMulti.bind(this)),
        this.handlers.set("buyBattery10", this.buyBatteryMulti.bind(this)),
        this.handlers.set("buyBattery100", this.buyBatteryMulti.bind(this)),
        this.handlers.set(
          "increaseCombat",
          this.increaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "decreaseProbeCombat",
          this.decreaseProbeDesign.bind(this),
        ),
        this.handlers.set("increaseSpeed", this.increaseProbeDesign.bind(this)),
        this.handlers.set("decreaseSpeed", this.decreaseProbeDesign.bind(this)),
        this.handlers.set(
          "increaseReplication",
          this.increaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "decreaseReplication",
          this.decreaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "increaseSelfRep",
          this.increaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "decreaseSelfRep",
          this.decreaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "increaseHazard",
          this.increaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "decreaseHazard",
          this.decreaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "increaseFactory",
          this.increaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "decreaseFactory",
          this.decreaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "increaseWireDrone",
          this.increaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "decreaseWireDrone",
          this.decreaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "increaseExploration",
          this.increaseProbeDesign.bind(this),
        ),
        this.handlers.set(
          "decreaseExploration",
          this.decreaseProbeDesign.bind(this),
        ),
        this.handlers.set("invest1000", this.investMulti.bind(this)),
        this.handlers.set("invest10000", this.investMulti.bind(this)),
        this.handlers.set("invest100000", this.investMulti.bind(this)),
        this.handlers.set("withdraw1000", this.withdrawMulti.bind(this)),
        this.handlers.set("withdraw10000", this.withdrawMulti.bind(this)),
        this.handlers.set("withdraw100000", this.withdrawMulti.bind(this)),
        this.handlers.set("adjustRisk", this.adjustRisk.bind(this)),
        this.handlers.set("runTournament", this.runTournament.bind(this)),
        this.handlers.set("strategyA", this.selectStrategy.bind(this)),
        this.handlers.set("strategyB", this.selectStrategy.bind(this)),
        this.handlers.set("strategyRandom", this.selectStrategy.bind(this)),
        this.handlers.set("adjustSwarmWork", this.adjustSwarmWork.bind(this)),
        this.handlers.set("synchronizeSwarm", this.synchronizeSwarm.bind(this)),
        this.handlers.set("entertainSwarm", this.entertainSwarm.bind(this)),
        this.handlers.set(
          "allocateProbeStats",
          this.allocateProbeStats.bind(this),
        ),
        this.handlers.set("toggleCombat", this.toggleCombat.bind(this)),
        this.handlers.set("completeProject", this.completeProject.bind(this)),
        this.handlers.set("saveGame", this.saveGame.bind(this)),
        this.handlers.set("loadGame", this.loadGame.bind(this)),
        this.handlers.set("resetGame", this.resetGame.bind(this)),
        this.handlers.set("exportSave", this.exportSave.bind(this)),
        this.handlers.set("importSave", this.importSave.bind(this)),
        this.handlers.set("showAchievements", this.showAchievements.bind(this)),
        this.handlers.set("launchProbe", this.launchProbe.bind(this)),
        this.handlers.set("feedSwarm", this.feedSwarm.bind(this)),
        this.handlers.set("teachSwarm", this.teachSwarm.bind(this)),
        this.handlers.set("harvestMatter", this.harvestMatter.bind(this)),
        this.handlers.set("convertMatter", this.convertMatter.bind(this)));
    }
    setupEventDelegation() {
      (document.addEventListener("click", this.boundHandlers.click),
        document.addEventListener("change", this.boundHandlers.change),
        document.addEventListener("input", this.boundHandlers.input),
        document.addEventListener("keydown", this.boundHandlers.keydown));
    }
    handleClick(e) {
      const t = e.target,
        s = t.dataset.action;
      if (!s) return;
      e.preventDefault();
      const i = this.handlers.get(s);
      if (i)
        try {
          P.measure(() => {
            i(e, t);
          }, `event.${s}`);
        } catch (e) {
          x.handleError(e, `events.${s}`, { element: t.id });
        }
      else x.warn(`No handler found for action: ${s}`);
    }
    handleChange(e) {
      const t = e.target,
        s = t.dataset.action;
      if (!s) return;
      const i = this.handlers.get(s);
      if (i)
        try {
          i(e, t);
        } catch (e) {
          x.handleError(e, `events.${s}`, { element: t.id });
        }
    }
    handleInput(e) {
      const t = e.target,
        s = t.dataset.action;
      if (!s) return;
      const i = this.handlers.get(s);
      if (i)
        try {
          i(e, t);
        } catch (e) {
          x.handleError(e, `events.${s}`, { element: t.id });
        }
    }
    handleKeyboard(e) {
      const t = e.key.toLowerCase(),
        s = `${e.ctrlKey ? "ctrl+" : ""}${e.altKey ? "alt+" : ""}${e.shiftKey ? "shift+" : ""}${t}`,
        i = this.shortcuts.get(s);
      if (i) {
        e.preventDefault();
        try {
          i(e);
        } catch (e) {
          x.handleError(e, `events.shortcut.${s}`);
        }
      }
    }
    setupKeyboardShortcuts() {
      (this.shortcuts.set(" ", () => this.makeClip()),
        this.shortcuts.set("1", () => this.buyAutoClipper()),
        this.shortcuts.set("2", () => this.buyMegaClipper()),
        this.shortcuts.set("3", () => this.buyWire()),
        this.shortcuts.set("4", () => this.buyAds()),
        this.shortcuts.set("arrowup", () => this.raisePrice()),
        this.shortcuts.set("arrowdown", () => this.lowerPrice()),
        this.shortcuts.set("ctrl+s", () => this.saveGame()),
        this.shortcuts.set("ctrl+l", () => this.loadGame()),
        this.shortcuts.set("escape", () => this.confirmReset()));
    }
    makeClip(e, t) {
      const s = e?.shiftKey ? 10 : 1;
      this.systems.production && this.systems.production.manualClip(s);
    }
    makeClipBatch(e, t) {
      const s = parseInt(t.dataset.amount, 10) || 10;
      this.systems.production &&
        (this.systems.production.manualClip(s),
        this.showFeedback(`Made ${s} paperclips!`, "success"));
    }
    buyAutoClipper(e, t) {
      if (this.systems.production) {
        this.systems.production.buyAutoClipper()
          ? (this.showFeedback("AutoClipper purchased!", "success"),
            this.gameState.emit("purchase", { item: "AutoClipper" }))
          : (this.showFeedback("Cannot afford AutoClipper", "error"),
            this.gameState.emit("insufficient", {
              resource: "funds",
              action: "buy AutoClipper",
            }));
      }
    }
    buyMegaClipper(e, t) {
      if (this.systems.production) {
        this.systems.production.buyMegaClipper()
          ? this.showFeedback("MegaClipper purchased!", "success")
          : this.showFeedback("Cannot afford MegaClipper", "error");
      }
    }
    raisePrice(e, t) {
      this.systems.market && this.systems.market.raisePrice();
    }
    lowerPrice(e, t) {
      if (this.systems.market) {
        this.systems.market.lowerPrice() ||
          this.showFeedback("Price cannot go lower", "warning");
      }
    }
    buyAds(e, t) {
      if (this.systems.market) {
        this.systems.market.buyMarketing()
          ? this.showFeedback("Marketing purchased!", "success")
          : this.showFeedback("Cannot afford marketing", "error");
      }
    }
    buyWire(e, t) {
      if (this.systems.market) {
        this.systems.market.buyWire()
          ? this.showFeedback("Wire purchased!", "success")
          : this.showFeedback("Cannot afford wire", "error");
      }
    }
    toggleWireBuyer(e, t) {
      if (this.systems.market) {
        const e = this.systems.market.toggleWireBuyer();
        this.showFeedback("Wire buyer " + (e ? "enabled" : "disabled"), "info");
      }
    }
    buyProcessor(e, t) {
      if (this.systems.computing) {
        this.systems.computing.buyProcessor()
          ? this.showFeedback("Processor purchased!", "success")
          : this.showFeedback(
              "Cannot afford processor or trust limit reached",
              "error",
            );
      }
    }
    buyMemory(e, t) {
      if (this.systems.computing) {
        this.systems.computing.buyMemory()
          ? this.showFeedback("Memory purchased!", "success")
          : this.showFeedback(
              "Cannot afford memory or trust limit reached",
              "error",
            );
      }
    }
    toggleCreativity(e, t) {
      if (this.systems.computing) {
        const e = !this.gameState.get("computing.creativity.enabled");
        (this.systems.computing.setCreativity(e, 50),
          this.showFeedback(
            "Creativity " + (e ? "enabled" : "disabled"),
            "info",
          ));
      }
    }
    toggleAutoClippers(e, t) {
      const s = !1 !== this.gameState.get("production.autoClippersEnabled");
      (this.gameState.set("production.autoClippersEnabled", !s),
        this.showFeedback(
          "AutoClippers " + (s ? "disabled" : "enabled"),
          "info",
        ));
    }
    toggleMegaClippers(e, t) {
      const s = !1 !== this.gameState.get("production.megaClippersEnabled");
      (this.gameState.set("production.megaClippersEnabled", !s),
        this.showFeedback(
          "MegaClippers " + (s ? "disabled" : "enabled"),
          "info",
        ));
    }
    toggleQuantumComputing(e, t) {
      const s = this.gameState.get("computing.quantum.enabled");
      (this.gameState.set("computing.quantum.enabled", !s),
        this.showFeedback(
          "Quantum Computing " + (s ? "disabled" : "enabled"),
          "info",
        ));
    }
    toggleStrategicModeling(e, t) {
      const s = this.gameState.get("computing.strategicModeling.enabled");
      (this.gameState.set("computing.strategicModeling.enabled", !s),
        this.showFeedback(
          "Strategic Modeling " + (s ? "disabled" : "enabled"),
          "info",
        ));
    }
    adjustCreativity(e, t) {
      if (this.systems.computing) {
        const e = parseInt(t.value, 10);
        this.systems.computing.setCreativity(!0, e);
      }
    }
    allocateProbeStats(e, t) {
      if (this.systems.combat) {
        const e = document.getElementById("probeCombat"),
          t = document.getElementById("probeSpeed"),
          s = document.getElementById("probeReplication"),
          i = e ? parseInt(e.value, 10) : 0,
          a = t ? parseInt(t.value, 10) : 0,
          n = s ? parseInt(s.value, 10) : 0;
        this.systems.combat.allocateProbeStats(i, a, n)
          ? this.showFeedback("Probe stats allocated", "success")
          : this.showFeedback("Stats must total 100%", "error");
      }
    }
    toggleCombat(e, t) {
      if (this.systems.combat) {
        const e = !this.gameState.get("combat.battleEnabled");
        (e
          ? this.systems.combat.enableCombat()
          : this.systems.combat.disableCombat(),
          this.showFeedback("Combat " + (e ? "enabled" : "disabled"), "info"));
      }
    }
    completeProject(e, t) {
      if (this.systems.projects) {
        const e = t.dataset.projectId;
        this.systems.projects.completeProject(e)
          ? this.showFeedback("Project completed!", "success")
          : this.showFeedback("Cannot complete project", "error");
      }
    }
    saveGame(e, t) {
      this.gameState.save()
        ? this.showFeedback("Game saved!", "success")
        : this.showFeedback("Save failed!", "error");
    }
    loadGame(e, t) {
      this.gameState.load()
        ? this.showFeedback("Game loaded!", "success")
        : this.showFeedback("Load failed!", "error");
    }
    resetGame(e, t) {
      confirm(
        "Are you sure you want to reset the game? This cannot be undone.",
      ) && (this.gameState.reset(), this.showFeedback("Game reset!", "info"));
    }
    confirmReset() {
      confirm("Reset game? Press OK to confirm, Cancel to continue playing.") &&
        this.resetGame();
    }
    exportSave(e, t) {
      try {
        const e = this.gameState.export(),
          t = new Blob([e], { type: "application/json" }),
          s = URL.createObjectURL(t),
          i = document.createElement("a");
        ((i.href = s),
          (i.download = `paperclips-save-${new Date().toISOString().slice(0, 10)}.json`),
          i.click(),
          URL.revokeObjectURL(s),
          this.showFeedback("Save exported!", "success"));
      } catch (e) {
        (x.handleError(e, "events.exportSave"),
          this.showFeedback("Export failed!", "error"));
      }
    }
    importSave(e, t) {
      const s = document.createElement("input");
      ((s.type = "file"),
        (s.accept = ".json"),
        (s.onchange = (e) => {
          const t = e.target.files[0];
          if (!t) return;
          const s = new FileReader();
          ((s.onload = (e) => {
            try {
              this.gameState.import(e.target.result)
                ? this.showFeedback("Save imported!", "success")
                : this.showFeedback("Import failed!", "error");
            } catch (e) {
              (x.handleError(e, "events.importSave"),
                this.showFeedback("Invalid save file!", "error"));
            }
          }),
            s.readAsText(t));
        }),
        s.click());
    }
    showAchievements(e, t) {
      try {
        Promise.resolve()
          .then(function () {
            return K;
          })
          .then(({ achievementUI: e }) => {
            e.showPanel();
          });
      } catch (e) {
        (x.handleError(e, "events.showAchievements"),
          this.showFeedback("Error opening achievements!", "error"));
      }
    }
    launchProbe(e, t) {
      if (this.systems.space) {
        this.systems.space.launchProbe()
          ? this.showFeedback("Probe launched!", "success")
          : this.showFeedback(
              "Cannot launch probe - insufficient resources",
              "error",
            );
      } else
        this.showFeedback("Space exploration not yet available", "warning");
    }
    feedSwarm(e, t) {
      if (this.systems.swarm) {
        this.systems.swarm.feedSwarm()
          ? this.showFeedback("Swarm fed successfully!", "success")
          : this.showFeedback(
              "Cannot feed swarm - insufficient resources",
              "error",
            );
      } else this.showFeedback("Swarm computing not yet available", "warning");
    }
    teachSwarm(e, t) {
      if (this.systems.swarm) {
        this.systems.swarm.teachSwarm()
          ? this.showFeedback("Swarm taught new patterns!", "success")
          : this.showFeedback(
              "Cannot teach swarm - insufficient resources",
              "error",
            );
      } else this.showFeedback("Swarm computing not yet available", "warning");
    }
    harvestMatter(e, t) {
      if (this.systems.endGame) {
        this.systems.endGame.harvestMatter()
          ? this.showFeedback("Matter harvested!", "success")
          : this.showFeedback(
              "Cannot harvest matter - no available sources",
              "error",
            );
      } else
        this.showFeedback("Matter harvesting not yet available", "warning");
    }
    convertMatter(e, t) {
      if (this.systems.endGame) {
        this.systems.endGame.convertMatter()
          ? this.showFeedback("Matter converted to paperclips!", "success")
          : this.showFeedback(
              "Cannot convert matter - insufficient matter",
              "error",
            );
      } else
        this.showFeedback("Matter conversion not yet available", "warning");
    }
    showFeedback(e, t = "info") {
      let s = document.getElementById("feedback");
      (s ||
        ((s = document.createElement("div")),
        (s.id = "feedback"),
        (s.className = "feedback"),
        document.body.appendChild(s)),
        (s.textContent = e),
        (s.className = `feedback ${t}`),
        (s.style.display = "block"),
        setTimeout(() => {
          s.style.display = "none";
        }, 3e3));
    }
    addHandler(e, t) {
      this.handlers.set(e, t);
    }
    removeHandler(e) {
      this.handlers.delete(e);
    }
    addShortcut(e, t) {
      this.shortcuts.set(e, t);
    }
    removeShortcut(e) {
      this.shortcuts.delete(e);
    }
    getStats() {
      return {
        handlers: this.handlers.size,
        shortcuts: this.shortcuts.size,
        activeEvents: 4,
      };
    }
    buyAutoClipperMulti(e, t) {
      const s = this.getMultiPurchaseAmount(t.dataset.action);
      if (this.systems.production) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.production.buyAutoClipper()) break;
        }
        this.showFeedback(
          `${s > 1 ? `${s} ` : ""}AutoClipper${s > 1 ? "s" : ""} purchased!`,
          "success",
        );
      }
    }
    buyMegaClipperMulti(e, t) {
      const s = this.getMultiPurchaseAmount(t.dataset.action);
      if (this.systems.production) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.production.buyMegaClipper()) break;
        }
        this.showFeedback(
          `${s > 1 ? `${s} ` : ""}MegaClipper${s > 1 ? "s" : ""} purchased!`,
          "success",
        );
      }
    }
    buyFactoryMulti(e, t) {
      const s = this.getMultiPurchaseAmount(t.dataset.action);
      if (this.systems.production) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.production.buyFactory()) break;
        }
        this.showFeedback(
          `${s > 1 ? `${s} ` : ""}Factor${s > 1 ? "ies" : "y"} purchased!`,
          "success",
        );
      }
    }
    buyWireMulti(e, t) {
      const s = this.getWirePurchaseAmount(t.dataset.action);
      if (this.systems.market) {
        this.systems.market.buyWire(s)
          ? this.showFeedback(`${s} wire purchased!`, "success")
          : this.showFeedback("Cannot afford wire", "error");
      }
    }
    buyProcessorMulti(e, t) {
      const s = this.getMultiPurchaseAmount(t.dataset.action);
      if (this.systems.computing) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.computing.buyProcessor()) break;
        }
        this.showFeedback(
          `${s > 1 ? `${s} ` : ""}Processor${s > 1 ? "s" : ""} purchased!`,
          "success",
        );
      }
    }
    buyMemoryMulti(e, t) {
      const s = this.getMultiPurchaseAmount(t.dataset.action);
      if (this.systems.computing) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.computing.buyMemory()) break;
        }
        this.showFeedback(
          (s > 1 ? `${s} ` : "") + "Memory purchased!",
          "success",
        );
      }
    }
    launchProbeMulti(e, t) {
      const s = this.getLaunchPurchaseAmount(t.dataset.action);
      if (this.systems.space) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.space.launchProbe()) break;
        }
        this.showFeedback(`${s} probe${s > 1 ? "s" : ""} launched!`, "success");
      }
    }
    buyHarvesterMulti(e, t) {
      const s = this.getMultiPurchaseAmount(t.dataset.action);
      if (this.systems.space) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.space.buyHarvester()) break;
        }
        this.showFeedback(
          `${s > 1 ? `${s} ` : ""}Harvester${s > 1 ? "s" : ""} purchased!`,
          "success",
        );
      }
    }
    buyWireDroneMulti(e, t) {
      const s = this.getMultiPurchaseAmount(t.dataset.action);
      if (this.systems.space) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.space.buyWireDrone()) break;
        }
        this.showFeedback(
          `${s > 1 ? `${s} ` : ""}Wire Drone${s > 1 ? "s" : ""} purchased!`,
          "success",
        );
      }
    }
    buySolarFarmMulti(e, t) {
      const s = this.getMultiPurchaseAmount(t.dataset.action);
      if (this.systems.power) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.power.buySolarFarm()) break;
        }
        this.showFeedback(
          `${s > 1 ? `${s} ` : ""}Solar Farm${s > 1 ? "s" : ""} purchased!`,
          "success",
        );
      }
    }
    buyBatteryMulti(e, t) {
      const s = this.getMultiPurchaseAmount(t.dataset.action);
      if (this.systems.power) {
        for (let e = 0; e < s; e++) {
          if (!this.systems.power.buyBattery()) break;
        }
        this.showFeedback(
          `${s > 1 ? `${s} ` : ""}Batter${s > 1 ? "ies" : "y"} purchased!`,
          "success",
        );
      }
    }
    increaseProbeDesign(e, t) {
      const s = this.getProbeStatFromAction(t.dataset.action);
      if (this.systems.space) {
        this.systems.space.increaseProbeDesign(s)
          ? this.showFeedback(`Increased probe ${s}`, "success")
          : this.showFeedback("Cannot increase probe stat", "error");
      }
    }
    decreaseProbeDesign(e, t) {
      const s = this.getProbeStatFromAction(t.dataset.action);
      if (this.systems.space) {
        this.systems.space.decreaseProbeDesign(s)
          ? this.showFeedback(`Decreased probe ${s}`, "success")
          : this.showFeedback("Cannot decrease probe stat", "error");
      }
    }
    investMulti(e, t) {
      const s = this.getInvestmentAmount(t.dataset.action);
      if (this.systems.investment) {
        this.systems.investment.invest(s)
          ? this.showFeedback(`Invested $${s.toLocaleString()}`, "success")
          : this.showFeedback("Cannot afford investment", "error");
      }
    }
    withdrawMulti(e, t) {
      const s = this.getInvestmentAmount(t.dataset.action);
      if (this.systems.investment) {
        this.systems.investment.withdraw(s)
          ? this.showFeedback(`Withdrew $${s.toLocaleString()}`, "success")
          : this.showFeedback("Cannot withdraw that amount", "error");
      }
    }
    adjustRisk(e, t) {
      const s = parseInt(t.value, 10);
      this.systems.strategy && this.systems.strategy.setRisk(s);
    }
    runTournament(e, t) {
      if (this.systems.strategy) {
        this.systems.strategy.runTournament()
          ? this.showFeedback("Tournament started!", "success")
          : this.showFeedback("Cannot run tournament", "error");
      }
    }
    selectStrategy(e, t) {
      const s = this.getStrategyFromAction(t.dataset.action);
      this.systems.strategy &&
        (this.systems.strategy.selectStrategy(s),
        this.showFeedback(`Strategy set to ${s}`, "success"));
    }
    adjustSwarmWork(e, t) {
      const s = parseInt(t.value, 10);
      this.systems.swarm && this.systems.swarm.setWorkAllocation(s);
    }
    synchronizeSwarm(e, t) {
      if (this.systems.swarm) {
        this.systems.swarm.synchronize()
          ? this.showFeedback("Swarm synchronized!", "success")
          : this.showFeedback("Cannot synchronize swarm", "error");
      }
    }
    entertainSwarm(e, t) {
      if (this.systems.swarm) {
        this.systems.swarm.entertain()
          ? this.showFeedback("Swarm entertained!", "success")
          : this.showFeedback("Cannot entertain swarm", "error");
      }
    }
    quantumCompute(e, t) {
      if (this.systems.computing) {
        this.systems.computing.quantumCompute()
          ? this.showFeedback("Quantum computation executed!", "success")
          : this.showFeedback("Cannot perform quantum computation", "error");
      }
    }
    adjustThinking(e, t) {
      const s = parseInt(t.value, 10);
      this.systems.computing && this.systems.computing.setThinkingAllocation(s);
    }
    getMultiPurchaseAmount(e) {
      return e.includes("1")
        ? 1
        : e.includes("10")
          ? 10
          : e.includes("100")
            ? 100
            : 1;
    }
    getWirePurchaseAmount(e) {
      return e.includes("1000")
        ? 1e3
        : e.includes("10000")
          ? 1e4
          : e.includes("100000")
            ? 1e5
            : 1e3;
    }
    getLaunchPurchaseAmount(e) {
      return e.includes("1000")
        ? 1e3
        : e.includes("100")
          ? 100
          : e.includes("10")
            ? 10
            : (e.includes("1"), 1);
    }
    getInvestmentAmount(e) {
      return e.includes("1000")
        ? 1e3
        : e.includes("10000")
          ? 1e4
          : e.includes("100000")
            ? 1e5
            : 1e3;
    }
    getProbeStatFromAction(e) {
      return e.includes("Combat")
        ? "combat"
        : e.includes("Speed")
          ? "speed"
          : e.includes("Replication")
            ? "replication"
            : e.includes("SelfRep")
              ? "selfRep"
              : e.includes("Hazard")
                ? "hazard"
                : e.includes("Factory")
                  ? "factory"
                  : e.includes("WireDrone")
                    ? "wireDrone"
                    : e.includes("Exploration")
                      ? "exploration"
                      : "combat";
    }
    getStrategyFromAction(e) {
      return e.includes("A")
        ? "A"
        : e.includes("B")
          ? "B"
          : e.includes("Random")
            ? "Random"
            : "A";
    }
    cleanup() {
      (document.removeEventListener("click", this.boundHandlers.click),
        document.removeEventListener("change", this.boundHandlers.change),
        document.removeEventListener("input", this.boundHandlers.input),
        document.removeEventListener("keydown", this.boundHandlers.keydown),
        x.info("Events system cleaned up"));
    }
  }
  class V {
    constructor() {
      ((this.isVisible = !1),
        (this.currentFilter = "all"),
        (this.currentSort = "unlock"),
        (this.notificationContainer = null),
        (this.achievementPanel = null),
        (this.achievementList = null),
        this.bindEvents(),
        this.createNotificationContainer());
    }
    initialize() {
      (x.info("Initializing achievement UI"),
        this.createAchievementPanel(),
        this.bindAchievementEvents());
    }
    bindEvents() {
      (window.addEventListener("achievementUnlocked", (e) => {
        this.showNotification(e.detail);
      }),
        document.addEventListener("keydown", (e) => {
          "Escape" === e.key && this.isVisible && this.hidePanel();
        }));
    }
    createNotificationContainer() {
      ((this.notificationContainer = document.createElement("div")),
        (this.notificationContainer.id = "achievementNotifications"),
        (this.notificationContainer.className = "achievement-notifications"),
        (this.notificationContainer.innerHTML =
          "\n      <style>\n        .achievement-notifications {\n          position: fixed;\n          top: 20px;\n          right: 20px;\n          z-index: 10000;\n          pointer-events: none;\n        }\n        \n        .achievement-notification {\n          background: linear-gradient(135deg, #4CAF50, #45a049);\n          color: white;\n          padding: 16px 20px;\n          margin-bottom: 12px;\n          border-radius: 8px;\n          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n          min-width: 300px;\n          max-width: 400px;\n          opacity: 0;\n          transform: translateX(100%);\n          transition: all 0.5s ease;\n          pointer-events: auto;\n          cursor: pointer;\n        }\n        \n        .achievement-notification.show {\n          opacity: 1;\n          transform: translateX(0);\n        }\n        \n        .achievement-notification.hide {\n          opacity: 0;\n          transform: translateX(100%);\n        }\n        \n        .achievement-notification .header {\n          display: flex;\n          align-items: center;\n          gap: 12px;\n          margin-bottom: 8px;\n        }\n        \n        .achievement-notification .icon {\n          font-size: 24px;\n        }\n        \n        .achievement-notification .title {\n          font-weight: bold;\n          font-size: 16px;\n        }\n        \n        .achievement-notification .rarity {\n          font-size: 12px;\n          text-transform: uppercase;\n          padding: 2px 6px;\n          border-radius: 4px;\n          background: rgba(255, 255, 255, 0.2);\n        }\n        \n        .achievement-notification .description {\n          font-size: 14px;\n          opacity: 0.9;\n        }\n        \n        .achievement-notification.rarity-common {\n          background: linear-gradient(135deg, #9E9E9E, #757575);\n        }\n        \n        .achievement-notification.rarity-uncommon {\n          background: linear-gradient(135deg, #4CAF50, #388E3C);\n        }\n        \n        .achievement-notification.rarity-rare {\n          background: linear-gradient(135deg, #2196F3, #1976D2);\n        }\n        \n        .achievement-notification.rarity-epic {\n          background: linear-gradient(135deg, #9C27B0, #7B1FA2);\n        }\n        \n        .achievement-notification.rarity-legendary {\n          background: linear-gradient(135deg, #FF9800, #F57C00);\n          animation: glow 2s ease-in-out infinite alternate;\n        }\n        \n        @keyframes glow {\n          from { box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3); }\n          to { box-shadow: 0 4px 20px rgba(255, 152, 0, 0.6); }\n        }\n      </style>\n    "),
        document.body.appendChild(this.notificationContainer));
    }
    createAchievementPanel() {
      ((this.achievementPanel = document.createElement("div")),
        (this.achievementPanel.id = "achievementPanel"),
        (this.achievementPanel.className = "achievement-panel"),
        (this.achievementPanel.style.display = "none"),
        (this.achievementPanel.innerHTML =
          '\n      <style>\n        .achievement-panel {\n          position: fixed;\n          top: 0;\n          left: 0;\n          width: 100%;\n          height: 100%;\n          background: rgba(0, 0, 0, 0.8);\n          z-index: 9999;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n        }\n        \n        .achievement-modal {\n          background: #f0f0f0;\n          border-radius: 12px;\n          width: 90%;\n          max-width: 800px;\n          max-height: 90%;\n          overflow: hidden;\n          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n        }\n        \n        .achievement-header {\n          background: linear-gradient(135deg, #2196F3, #1976D2);\n          color: white;\n          padding: 20px;\n          display: flex;\n          justify-content: space-between;\n          align-items: center;\n        }\n        \n        .achievement-header h2 {\n          margin: 0;\n          font-size: 24px;\n        }\n        \n        .achievement-stats {\n          font-size: 14px;\n          opacity: 0.9;\n        }\n        \n        .close-btn {\n          background: rgba(255, 255, 255, 0.2);\n          border: none;\n          color: white;\n          width: 32px;\n          height: 32px;\n          border-radius: 50%;\n          cursor: pointer;\n          font-size: 18px;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n        }\n        \n        .close-btn:hover {\n          background: rgba(255, 255, 255, 0.3);\n        }\n        \n        .achievement-controls {\n          padding: 16px 20px;\n          background: #e8e8e8;\n          display: flex;\n          gap: 16px;\n          align-items: center;\n          flex-wrap: wrap;\n        }\n        \n        .achievement-controls select,\n        .achievement-controls button {\n          padding: 8px 12px;\n          border: 1px solid #ccc;\n          border-radius: 4px;\n          background: white;\n          cursor: pointer;\n        }\n        \n        .achievement-controls button:hover {\n          background: #f5f5f5;\n        }\n        \n        .achievement-content {\n          height: 500px;\n          overflow-y: auto;\n          padding: 20px;\n        }\n        \n        .achievement-grid {\n          display: grid;\n          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n          gap: 16px;\n        }\n        \n        .achievement-card {\n          background: white;\n          border-radius: 8px;\n          padding: 16px;\n          border: 2px solid #e0e0e0;\n          transition: all 0.2s ease;\n          position: relative;\n        }\n        \n        .achievement-card:hover {\n          transform: translateY(-2px);\n          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n        }\n        \n        .achievement-card.unlocked {\n          border-color: #4CAF50;\n          background: linear-gradient(135deg, #f8fff8, #ffffff);\n        }\n        \n        .achievement-card.locked {\n          opacity: 0.6;\n        }\n        \n        .achievement-card.hidden {\n          background: #f5f5f5;\n          border-color: #bbb;\n        }\n        \n        .achievement-card .header {\n          display: flex;\n          align-items: center;\n          gap: 12px;\n          margin-bottom: 12px;\n        }\n        \n        .achievement-card .icon {\n          font-size: 32px;\n          filter: grayscale(100%);\n        }\n        \n        .achievement-card.unlocked .icon {\n          filter: none;\n        }\n        \n        .achievement-card .info {\n          flex: 1;\n        }\n        \n        .achievement-card .name {\n          font-weight: bold;\n          font-size: 16px;\n          margin-bottom: 4px;\n        }\n        \n        .achievement-card .rarity {\n          font-size: 12px;\n          text-transform: uppercase;\n          padding: 2px 8px;\n          border-radius: 12px;\n          color: white;\n          display: inline-block;\n        }\n        \n        .rarity-common { background: #9E9E9E; }\n        .rarity-uncommon { background: #4CAF50; }\n        .rarity-rare { background: #2196F3; }\n        .rarity-epic { background: #9C27B0; }\n        .rarity-legendary { background: #FF9800; }\n        \n        .achievement-card .description {\n          margin: 12px 0;\n          color: #666;\n        }\n        \n        .achievement-card .progress {\n          margin-top: 12px;\n        }\n        \n        .achievement-card .progress-bar {\n          background: #e0e0e0;\n          height: 8px;\n          border-radius: 4px;\n          overflow: hidden;\n          margin: 4px 0;\n        }\n        \n        .achievement-card .progress-fill {\n          background: linear-gradient(90deg, #4CAF50, #45a049);\n          height: 100%;\n          transition: width 0.3s ease;\n        }\n        \n        .achievement-card .progress-text {\n          font-size: 12px;\n          color: #666;\n        }\n        \n        .achievement-card .unlock-date {\n          position: absolute;\n          top: 8px;\n          right: 8px;\n          font-size: 10px;\n          color: #888;\n        }\n        \n        .category-separator {\n          grid-column: 1 / -1;\n          margin: 20px 0 10px 0;\n          padding-bottom: 10px;\n          border-bottom: 2px solid #e0e0e0;\n          font-size: 18px;\n          font-weight: bold;\n          color: #333;\n        }\n        \n        .no-achievements {\n          grid-column: 1 / -1;\n          text-align: center;\n          color: #666;\n          font-style: italic;\n          padding: 40px;\n        }\n      </style>\n      \n      <div class="achievement-modal">\n        <div class="achievement-header">\n          <div>\n            <h2>Achievements</h2>\n            <div class="achievement-stats" id="achievementStats"></div>\n          </div>\n          <button class="close-btn" onclick="window.achievementUI.hidePanel()">&times;</button>\n        </div>\n        \n        <div class="achievement-controls">\n          <label>\n            Filter:\n            <select id="achievementFilter">\n              <option value="all">All</option>\n              <option value="unlocked">Unlocked</option>\n              <option value="locked">Locked</option>\n              <option value="production">Production</option>\n              <option value="economic">Economic</option>\n              <option value="efficiency">Efficiency</option>\n              <option value="speed">Speed</option>\n              <option value="discovery">Discovery</option>\n              <option value="combat">Combat</option>\n              <option value="special">Special</option>\n            </select>\n          </label>\n          \n          <label>\n            Sort by:\n            <select id="achievementSort">\n              <option value="unlock">Unlock Status</option>\n              <option value="name">Name</option>\n              <option value="rarity">Rarity</option>\n              <option value="category">Category</option>\n              <option value="progress">Progress</option>\n            </select>\n          </label>\n          \n          <button onclick="window.achievementUI.exportAchievements()">Export</button>\n          <button onclick="window.achievementUI.shareAchievements()">Share</button>\n        </div>\n        \n        <div class="achievement-content">\n          <div class="achievement-grid" id="achievementList"></div>\n        </div>\n      </div>\n    '),
        document.body.appendChild(this.achievementPanel),
        (this.achievementList = document.getElementById("achievementList")));
    }
    bindAchievementEvents() {
      const e = document.getElementById("achievementFilter"),
        t = document.getElementById("achievementSort");
      (e.addEventListener("change", (e) => {
        ((this.currentFilter = e.target.value), this.updateAchievementList());
      }),
        t.addEventListener("change", (e) => {
          ((this.currentSort = e.target.value), this.updateAchievementList());
        }),
        this.achievementPanel.addEventListener("click", (e) => {
          e.target === this.achievementPanel && this.hidePanel();
        }));
    }
    showNotification(e) {
      const t = document.createElement("div");
      ((t.className = `achievement-notification rarity-${e.rarity}`),
        (t.innerHTML = `\n      <div class="header">\n        <div class="icon">${e.icon}</div>\n        <div class="info">\n          <div class="title">${e.name}</div>\n          <div class="rarity">${e.rarity}</div>\n        </div>\n      </div>\n      <div class="description">${e.description}</div>\n    `),
        t.addEventListener("click", () => {
          (this.showPanel(), this.hideNotification(t));
        }),
        this.notificationContainer.appendChild(t),
        setTimeout(() => t.classList.add("show"), 100),
        setTimeout(() => this.hideNotification(t), 5e3));
    }
    hideNotification(e) {
      (e.classList.add("hide"),
        setTimeout(() => {
          e.parentNode && e.parentNode.removeChild(e);
        }, 500));
    }
    showPanel() {
      ((this.isVisible = !0),
        (this.achievementPanel.style.display = "flex"),
        this.updateAchievementList(),
        this.updateStats(),
        document.addEventListener("keydown", this.handleEscapeKey));
    }
    hidePanel() {
      ((this.isVisible = !1),
        (this.achievementPanel.style.display = "none"),
        document.removeEventListener("keydown", this.handleEscapeKey));
    }
    handleEscapeKey = (e) => {
      "Escape" === e.key && this.hidePanel();
    };
    updateStats() {
      const e = W.getStatistics(),
        t = document.getElementById("achievementStats");
      t &&
        (t.innerHTML = `\n        ${e.totalUnlocked}/${e.total} (${e.percentage.toFixed(1)}%) •\n        🥇 ${e.legendaryUnlocked} •\n        ⭐ ${e.epicUnlocked} •\n        💎 ${e.rareUnlocked}\n      `);
    }
    updateAchievementList() {
      if (!this.achievementList) return;
      const e = this.getFilteredAndSortedAchievements(),
        s = t.get("achievements.unlocked") || {};
      if (((this.achievementList.innerHTML = ""), 0 === e.length))
        return void (this.achievementList.innerHTML =
          '<div class="no-achievements">No achievements match your filters.</div>');
      let i = null;
      e.forEach((e) => {
        if ("category" === this.currentSort && e.category !== i) {
          i = e.category;
          const t = document.createElement("div");
          ((t.className = "category-separator"),
            (t.textContent = i.charAt(0).toUpperCase() + i.slice(1)),
            this.achievementList.appendChild(t));
        }
        const t = this.createAchievementCard(e, s[e.id]);
        this.achievementList.appendChild(t);
      });
    }
    createAchievementCard(e, t) {
      const s = document.createElement("div"),
        i = !!t,
        a = W.getProgress(e.id),
        n = e.hidden && !i;
      s.className = `achievement-card ${i ? "unlocked" : "locked"} ${n ? "hidden" : ""}`;
      const r = t ? new Date(t).toLocaleDateString() : "",
        o = n ? "???" : e.name,
        c = n ? "Hidden achievement" : e.description,
        h = n ? "❓" : e.icon;
      return (
        (s.innerHTML = `\n      ${t ? `<div class="unlock-date">${r}</div>` : ""}\n      <div class="header">\n        <div class="icon">${h}</div>\n        <div class="info">\n          <div class="name">${o}</div>\n          <div class="rarity rarity-${e.rarity}">${e.rarity}</div>\n        </div>\n      </div>\n      <div class="description">${c}</div>\n      ${i || n ? "" : `\n        <div class="progress">\n          <div class="progress-bar">\n            <div class="progress-fill" style="width: ${a}%"></div>\n          </div>\n          <div class="progress-text">${a.toFixed(1)}% complete</div>\n        </div>\n      `}\n    `),
        s
      );
    }
    getFilteredAndSortedAchievements() {
      let e = Object.values(W.achievements);
      const s = t.get("achievements.unlocked") || {};
      return (
        "all" !== this.currentFilter &&
          ("unlocked" === this.currentFilter
            ? (e = e.filter((e) => s[e.id]))
            : "locked" === this.currentFilter
              ? (e = e.filter((e) => !s[e.id]))
              : Object.values(N).includes(this.currentFilter) &&
                (e = e.filter((e) => e.category === this.currentFilter))),
        e.sort((e, t) => {
          switch (this.currentSort) {
            case "name":
              return e.name.localeCompare(t.name);
            case "rarity":
              const i = ["common", "uncommon", "rare", "epic", "legendary"],
                a = i.indexOf(e.rarity);
              return i.indexOf(t.rarity) - a;
            case "category":
              const n = e.category.localeCompare(t.category);
              return 0 !== n ? n : e.name.localeCompare(t.name);
            case "progress":
              const r = W.getProgress(e.id);
              return W.getProgress(t.id) - r;
            default:
              const o = !!s[e.id],
                c = !!s[t.id];
              return o !== c ? c - o : e.name.localeCompare(t.name);
          }
        }),
        e
      );
    }
    exportAchievements() {
      try {
        const e = W.exportAchievements(),
          t = new Blob([JSON.stringify(e, null, 2)], {
            type: "application/json",
          }),
          s = URL.createObjectURL(t),
          i = document.createElement("a");
        ((i.href = s),
          (i.download = `paperclips-achievements-${new Date().toISOString().split("T")[0]}.json`),
          document.body.appendChild(i),
          i.click(),
          document.body.removeChild(i),
          URL.revokeObjectURL(s),
          this.showMessage("Achievements exported successfully!"));
      } catch (e) {
        (x.log("error", "Error exporting achievements", e),
          this.showMessage("Error exporting achievements", "error"));
      }
    }
    shareAchievements() {
      try {
        const e = W.getShareableString();
        navigator.share
          ? navigator.share({
              title: "Universal Paperclips Achievements",
              text: e,
              url: window.location.href,
            })
          : navigator.clipboard
            ? navigator.clipboard.writeText(e).then(() => {
                this.showMessage("Achievement summary copied to clipboard!");
              })
            : prompt("Copy your achievement summary:", e);
      } catch (e) {
        (x.log("error", "Error sharing achievements", e),
          this.showMessage("Error sharing achievements", "error"));
      }
    }
    showMessage(e, t = "success") {
      const s = document.createElement("div");
      ((s.className =
        "achievement-notification rarity-" +
        ("success" === t ? "uncommon" : "rare")),
        (s.innerHTML = `\n      <div class="header">\n        <div class="icon">${"success" === t ? "✅" : "❌"}</div>\n        <div class="title">${e}</div>\n      </div>\n    `),
        this.notificationContainer.appendChild(s),
        setTimeout(() => s.classList.add("show"), 100),
        setTimeout(() => this.hideNotification(s), 3e3));
    }
    updateProgress() {
      if (!this.isVisible) return;
      this.achievementList
        .querySelectorAll(".achievement-card.locked")
        .forEach((e) => {
          const t = e.dataset.achievementId;
          if (t) {
            const s = W.getProgress(t),
              i = e.querySelector(".progress-fill"),
              a = e.querySelector(".progress-text");
            (i && (i.style.width = `${s}%`),
              a && (a.textContent = `${s.toFixed(1)}% complete`));
          }
        });
    }
  }
  const Q = new V();
  window.achievementUI = Q;
  var K = Object.freeze({
    __proto__: null,
    AchievementUI: V,
    achievementUI: Q,
  });
  const Y = new (class {
    constructor() {
      ((this.announcer = null),
        (this.lastAnnouncement = ""),
        (this.highContrastEnabled = !1),
        (this.reducedMotionEnabled = !1),
        (this.keyboardModeActive = !1),
        (this.focusableElements = []),
        (this.currentFocusIndex = 0),
        this.checkUserPreferences(),
        this.initializeAnnouncer(),
        this.initializeKeyboardNavigation(),
        this.initializeHighContrast(),
        this.initializeFocusManagement(),
        this.addSkipLinks(),
        this.enhanceElements(),
        x.info("Accessibility features initialized"));
    }
    checkUserPreferences() {
      const e = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.reducedMotionEnabled = e.matches;
      const t = window.matchMedia("(prefers-contrast: high)");
      (t.matches && this.enableHighContrast(),
        e.addEventListener("change", (e) => {
          ((this.reducedMotionEnabled = e.matches), this.updateAnimations());
        }),
        t.addEventListener("change", (e) => {
          e.matches ? this.enableHighContrast() : this.disableHighContrast();
        }));
    }
    initializeAnnouncer() {
      ((this.announcer = document.createElement("div")),
        this.announcer.setAttribute("role", "status"),
        this.announcer.setAttribute("aria-live", "polite"),
        this.announcer.setAttribute("aria-atomic", "true"),
        (this.announcer.className = "sr-only"),
        (this.announcer.id = "game-announcer"),
        document.body.appendChild(this.announcer),
        (this.urgentAnnouncer = document.createElement("div")),
        this.urgentAnnouncer.setAttribute("role", "alert"),
        this.urgentAnnouncer.setAttribute("aria-live", "assertive"),
        this.urgentAnnouncer.setAttribute("aria-atomic", "true"),
        (this.urgentAnnouncer.className = "sr-only"),
        (this.urgentAnnouncer.id = "urgent-announcer"),
        document.body.appendChild(this.urgentAnnouncer));
      const e = document.createElement("style");
      ((e.textContent =
        "\n      .sr-only {\n        position: absolute;\n        width: 1px;\n        height: 1px;\n        padding: 0;\n        margin: -1px;\n        overflow: hidden;\n        clip: rect(0, 0, 0, 0);\n        white-space: nowrap;\n        border: 0;\n      }\n      \n      /* Focus indicators */\n      *:focus {\n        outline: 3px solid #4A90E2;\n        outline-offset: 2px;\n      }\n      \n      .keyboard-mode *:focus {\n        outline: 3px solid #ff6b6b;\n        outline-offset: 4px;\n      }\n      \n      /* High contrast mode */\n      .high-contrast {\n        background-color: #000 !important;\n        color: #fff !important;\n      }\n      \n      .high-contrast .game-section {\n        background-color: #111 !important;\n        border: 2px solid #fff !important;\n      }\n      \n      .high-contrast .button {\n        background-color: #fff !important;\n        color: #000 !important;\n        border: 2px solid #fff !important;\n      }\n      \n      .high-contrast .button:hover {\n        background-color: #000 !important;\n        color: #fff !important;\n      }\n      \n      .high-contrast .button:disabled {\n        background-color: #333 !important;\n        color: #666 !important;\n        border-color: #666 !important;\n      }\n      \n      .high-contrast .stat-value {\n        color: #0ff !important;\n        font-weight: bold;\n      }\n      \n      /* Reduced motion */\n      .reduced-motion * {\n        animation: none !important;\n        transition: none !important;\n      }\n      \n      /* Skip links */\n      .skip-links {\n        position: absolute;\n        top: -40px;\n        left: 0;\n        z-index: 9999;\n      }\n      \n      .skip-links a {\n        position: absolute;\n        left: -9999px;\n        top: auto;\n        width: 1px;\n        height: 1px;\n        overflow: hidden;\n      }\n      \n      .skip-links a:focus {\n        position: static;\n        width: auto;\n        height: auto;\n        padding: 10px 20px;\n        background: #000;\n        color: #fff;\n        text-decoration: none;\n        border-radius: 0 0 5px 0;\n      }\n    "),
        document.head.appendChild(e));
    }
    addSkipLinks() {
      const e = document.createElement("nav");
      ((e.className = "skip-links"),
        e.setAttribute("aria-label", "Skip navigation"),
        (e.innerHTML =
          '\n      <a href="#main-content">Skip to main content</a>\n      <a href="#production">Skip to production</a>\n      <a href="#businessDiv">Skip to business</a>\n      <a href="#projectsDiv">Skip to projects</a>\n      <a href="#gameManagement">Skip to game management</a>\n    '),
        document.body.insertBefore(e, document.body.firstChild));
      const t = document.querySelector(".game-container");
      (t.setAttribute("role", "main"), (t.id = "main-content"));
    }
    initializeKeyboardNavigation() {
      (document.addEventListener("mousedown", () => {
        ((this.keyboardModeActive = !1),
          document.body.classList.remove("keyboard-mode"));
      }),
        document.addEventListener("keydown", (e) => {
          if (
            ("Tab" === e.key &&
              ((this.keyboardModeActive = !0),
              document.body.classList.add("keyboard-mode")),
            this.keyboardModeActive)
          )
            switch (e.key) {
              case "ArrowLeft":
              case "ArrowUp":
                (e.preventDefault(), this.focusPrevious());
                break;
              case "ArrowRight":
              case "ArrowDown":
                (e.preventDefault(), this.focusNext());
                break;
              case "Home":
                (e.preventDefault(), this.focusFirst());
                break;
              case "End":
                (e.preventDefault(), this.focusLast());
            }
          if (!e.ctrlKey && !e.metaKey && !e.altKey)
            switch (e.key) {
              case " ":
                if ("BUTTON" !== e.target.tagName) {
                  e.preventDefault();
                  const t = document.getElementById("makeClipButton");
                  t &&
                    !t.disabled &&
                    (t.click(), this.announce("Making paperclip"));
                }
                break;
              case "?":
                (e.preventDefault(), this.showKeyboardHelp());
            }
        }));
    }
    initializeHighContrast() {
      const e = document.createElement("button");
      ((e.id = "highContrastToggle"),
        (e.className = "button"),
        (e.textContent = "Toggle High Contrast"),
        e.setAttribute("aria-label", "Toggle high contrast mode"),
        e.setAttribute("aria-pressed", "false"),
        e.addEventListener("click", () => {
          this.toggleHighContrast();
        }));
      const t = document.querySelector("#gameManagement .controls");
      t && t.appendChild(e);
    }
    toggleHighContrast() {
      ((this.highContrastEnabled = !this.highContrastEnabled),
        document.body.classList.toggle(
          "high-contrast",
          this.highContrastEnabled,
        ));
      (document
        .getElementById("highContrastToggle")
        .setAttribute("aria-pressed", this.highContrastEnabled.toString()),
        this.announce(
          "High contrast mode " +
            (this.highContrastEnabled ? "enabled" : "disabled"),
        ),
        localStorage.setItem(
          "highContrastEnabled",
          this.highContrastEnabled.toString(),
        ));
    }
    enableHighContrast() {
      ((this.highContrastEnabled = !0),
        document.body.classList.add("high-contrast"));
      const e = document.getElementById("highContrastToggle");
      e && e.setAttribute("aria-pressed", "true");
    }
    disableHighContrast() {
      ((this.highContrastEnabled = !1),
        document.body.classList.remove("high-contrast"));
      const e = document.getElementById("highContrastToggle");
      e && e.setAttribute("aria-pressed", "false");
    }
    updateAnimations() {
      this.reducedMotionEnabled
        ? document.body.classList.add("reduced-motion")
        : document.body.classList.remove("reduced-motion");
    }
    initializeFocusManagement() {
      this.updateFocusableElements();
      new MutationObserver(() => {
        this.updateFocusableElements();
      }).observe(document.body, {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: ["disabled", "hidden", "style"],
      });
    }
    updateFocusableElements() {
      this.focusableElements = Array.from(
        document.querySelectorAll(
          'button:not(:disabled):not(.hidden), input:not(:disabled):not(.hidden), [tabindex="0"]:not(.hidden)',
        ),
      ).filter((e) => null !== e.offsetParent);
    }
    focusNext() {
      0 !== this.focusableElements.length &&
        ((this.currentFocusIndex =
          (this.currentFocusIndex + 1) % this.focusableElements.length),
        this.focusableElements[this.currentFocusIndex].focus());
    }
    focusPrevious() {
      0 !== this.focusableElements.length &&
        ((this.currentFocusIndex =
          (this.currentFocusIndex - 1 + this.focusableElements.length) %
          this.focusableElements.length),
        this.focusableElements[this.currentFocusIndex].focus());
    }
    focusFirst() {
      0 !== this.focusableElements.length &&
        ((this.currentFocusIndex = 0), this.focusableElements[0].focus());
    }
    focusLast() {
      0 !== this.focusableElements.length &&
        ((this.currentFocusIndex = this.focusableElements.length - 1),
        this.focusableElements[this.currentFocusIndex].focus());
    }
    enhanceElements() {
      (this.enhanceButtons(),
        this.enhanceSliders(),
        this.enhanceSections(),
        this.enhanceStats(),
        this.addDescriptions());
    }
    enhanceButtons() {
      (Object.entries({
        makeClipButton: {
          label: "Make a paperclip. Costs 1 wire.",
          description: "Primary game action. Press spacebar as shortcut.",
        },
        buyAutoClipper: {
          label: "Buy AutoClipper. Automatically makes paperclips.",
          description: "Each AutoClipper produces clips automatically.",
        },
        buyMegaClipper: {
          label: "Buy MegaClipper. Produces clips faster than AutoClippers.",
          description: "Advanced automation for clip production.",
        },
        buyWire: {
          label: "Buy wire spool. Adds 1000 wire to inventory.",
          description: "Wire is required to make paperclips.",
        },
        buyAds: {
          label: "Buy marketing. Increases demand for paperclips.",
          description: "Higher marketing levels increase sales rate.",
        },
        toggleWireBuyer: {
          label: "Toggle automatic wire purchasing",
          description:
            "When enabled, automatically buys wire when running low.",
        },
        toggleCreativity: {
          label: "Toggle creativity generation",
          description:
            "When enabled, generates creativity points for projects.",
        },
        toggleCombat: {
          label: "Toggle probe combat mode",
          description: "Enable combat between probes in space.",
        },
      }).forEach(([e, t]) => {
        const s = document.getElementById(e);
        if (s) {
          (s.setAttribute("aria-label", t.label),
            s.setAttribute("aria-describedby", `${e}-description`));
          const i = document.createElement("span");
          ((i.id = `${e}-description`),
            (i.className = "sr-only"),
            (i.textContent = t.description),
            s.parentNode.insertBefore(i, s.nextSibling));
        }
      }),
        document
          .querySelectorAll(
            '[data-action="lowerPrice"], [data-action="raisePrice"]',
          )
          .forEach((e) => {
            const t = "lowerPrice" === e.getAttribute("data-action");
            e.setAttribute(
              "aria-label",
              (t ? "Lower" : "Raise") + " paperclip price by $0.01",
            );
          }));
    }
    enhanceSliders() {
      Object.entries({
        creativitySlider: {
          label: "Creativity allocation percentage",
          min: 0,
          max: 100,
          step: 1,
          description:
            "Allocate processing power between operations and creativity",
        },
        probeCombat: {
          label: "Probe combat allocation",
          min: 0,
          max: 100,
          step: 1,
          description: "Percentage of probe resources allocated to combat",
        },
        probeSpeed: {
          label: "Probe speed allocation",
          min: 0,
          max: 100,
          step: 1,
          description: "Percentage of probe resources allocated to speed",
        },
        probeReplication: {
          label: "Probe replication allocation",
          min: 0,
          max: 100,
          step: 1,
          description: "Percentage of probe resources allocated to replication",
        },
      }).forEach(([e, t]) => {
        const s = document.getElementById(e);
        if (s) {
          (s.setAttribute("role", "slider"),
            s.setAttribute("aria-label", t.label),
            s.setAttribute("aria-valuemin", t.min),
            s.setAttribute("aria-valuemax", t.max),
            s.setAttribute("aria-valuenow", s.value),
            s.setAttribute("aria-describedby", `${e}-description`));
          const i = document.createElement("span");
          ((i.id = `${e}-description`),
            (i.className = "sr-only"),
            (i.textContent = t.description),
            s.parentNode.insertBefore(i, s),
            s.addEventListener("input", (e) => {
              (e.target.setAttribute("aria-valuenow", e.target.value),
                this.announce(`${t.label}: ${e.target.value}%`));
            }));
        }
      });
    }
    enhanceSections() {
      document.querySelectorAll(".game-section").forEach((e) => {
        e.setAttribute("role", "region");
        const t = e.querySelector("h2");
        if (t) {
          const s =
            t.id || `heading-${Math.random().toString(36).substr(2, 9)}`;
          ((t.id = s), e.setAttribute("aria-labelledby", s));
        }
        const s = e.querySelector(".section-header");
        if (s) {
          (s.setAttribute("tabindex", "0"),
            s.setAttribute("role", "button"),
            s.setAttribute("aria-expanded", "true"),
            s.setAttribute("aria-controls", e.id),
            s.addEventListener("keydown", (e) => {
              ("Enter" !== e.key && " " !== e.key) ||
                (e.preventDefault(), s.click());
            }));
          const t = s.onclick;
          s.onclick = function (e) {
            t && t.call(this, e);
            const i = !s.nextElementSibling.classList.contains("collapsed");
            s.setAttribute("aria-expanded", i.toString());
          };
        }
      });
    }
    enhanceStats() {
      ["clips", "funds", "wire", "operations", "creativity", "trust"].forEach(
        (e) => {
          const t = document.getElementById(e);
          if (t) {
            (t.setAttribute("aria-live", "polite"),
              t.setAttribute("aria-atomic", "true"));
            const s = t.parentNode.querySelector(".stat-label");
            if (s) {
              const i = `${e}-label`;
              ((s.id = i), t.setAttribute("aria-labelledby", i));
            }
          }
        },
      );
    }
    addDescriptions() {
      const e = document.querySelector(".game-header");
      if (e) {
        e.setAttribute("role", "banner");
        const t = e.querySelector("h1");
        t &&
          t.setAttribute(
            "aria-label",
            "Universal Paperclips: An incremental game about artificial intelligence and paperclip maximization",
          );
      }
      const t = document.getElementById("production");
      t &&
        t.setAttribute(
          "aria-description",
          "Main production area. Create paperclips and manage resources.",
        );
      const s = document.getElementById("businessDiv");
      s &&
        s.setAttribute(
          "aria-description",
          "Business management. Control pricing, marketing, and automation.",
        );
      const i = document.getElementById("computeDiv");
      i &&
        i.setAttribute(
          "aria-description",
          "Computational resources. Manage processors, memory, and research.",
        );
    }
    announce(e, t = !1) {
      if (!e || e === this.lastAnnouncement) return;
      const s = t ? this.urgentAnnouncer : this.announcer;
      ((s.textContent = ""),
        setTimeout(() => {
          ((s.textContent = e), (this.lastAnnouncement = e));
        }, 100),
        setTimeout(() => {
          s.textContent = "";
        }, 1e3));
    }
    announceGameEvent(e, t) {
      switch (e) {
        case "milestone":
          this.announce(`Milestone reached: ${t.message}`, !0);
          break;
        case "unlock":
          this.announce(`New feature unlocked: ${t.feature}`);
          break;
        case "achievement":
          this.announce(`Achievement earned: ${t.name}`, !0);
          break;
        case "warning":
          this.announce(`Warning: ${t.message}`, !0);
          break;
        case "purchase":
          this.announce(`Purchased: ${t.item}`);
          break;
        case "insufficient":
          this.announce(`Insufficient ${t.resource} for ${t.action}`);
      }
    }
    showKeyboardHelp() {
      const e = document.getElementById("keyboardShortcuts");
      e &&
        (e.scrollIntoView({ behavior: "smooth" }),
        e.focus(),
        this.announce("Keyboard shortcuts help displayed"));
    }
    restorePreferences() {
      "true" === localStorage.getItem("highContrastEnabled") &&
        this.enableHighContrast();
    }
  })();
  Y.restorePreferences();
  class J {
    constructor() {
      ((this.initialized = !1),
        (this.systems = {}),
        (this.ui = {}),
        this.initializeSystems(),
        this.initializeUI(),
        this.setupGameLoop(),
        this.setupDebugInterface(),
        x.info("Universal Paperclips initialized"));
    }
    initializeSystems() {
      try {
        ((this.systems.production = new F(t)),
          (this.systems.market = new B(t)),
          (this.systems.computing = new $(t)),
          (this.systems.combat = new R(t)),
          (this.systems.projects = new L(t)),
          (this.systems.achievements = W),
          W.initialize(),
          x.info("Game systems initialized"));
      } catch (e) {
        x.handleError(e, "game.initializeSystems", {}, !0);
      }
    }
    initializeUI() {
      try {
        ((this.ui.renderer = new G(t)),
          (this.ui.events = new H(t, this.systems)),
          (this.ui.achievements = Q),
          (this.ui.accessibility = Y),
          this.ui.renderer.initializeConsole(),
          x.setRenderer(this.ui.renderer),
          (window.renderer = this.ui.renderer),
          Q.initialize(),
          this.setupAccessibilityEvents(),
          this.ui.renderer.logMilestone(
            "Welcome to Universal Paperclips! Click to create your first paperclip.",
            "📎",
          ),
          x.info("UI systems initialized"));
      } catch (e) {
        x.handleError(e, "game.initializeUI", {}, !0);
      }
    }
    setupAccessibilityEvents() {
      (t.on("milestone", (e) => {
        Y.announceGameEvent("milestone", e);
      }),
        t.on("unlock", (e) => {
          Y.announceGameEvent("unlock", e);
        }),
        t.on("achievement", (e) => {
          Y.announceGameEvent("achievement", e);
        }),
        t.on("warning", (e) => {
          Y.announceGameEvent("warning", e);
        }),
        t.on("purchase", (e) => {
          Y.announceGameEvent("purchase", e);
        }),
        t.on("insufficient", (e) => {
          Y.announceGameEvent("insufficient", e);
        }));
    }
    setupGameLoop() {
      try {
        (A.addSystem("fast", this.systems.production.update, "production"),
          A.addSystem("fast", this.systems.market.update, "market"),
          A.addSystem("fast", this.systems.computing.update, "computing"),
          A.addSystem("fast", this.systems.combat.update, "combat"),
          A.addSystem("medium", this.systems.projects.update, "projects"),
          A.addSystem("medium", this.handleAutoSave.bind(this), "autoSave"),
          A.addSystem(
            "medium",
            this.systems.achievements.checkAchievements.bind(
              this.systems.achievements,
            ),
            "achievements",
          ),
          A.addSystem("slow", this.updateGamePhase.bind(this), "gamePhase"),
          A.addRenderer(this.ui.renderer.render, "main"),
          x.info("Game loop configured"));
      } catch (e) {
        x.handleError(e, "game.setupGameLoop", {}, !0);
      }
    }
    setupDebugInterface() {
      ((window.UniversalPaperclips = {
        debug: {
          getState: () => t.getSnapshot(),
          getStats: () => this.getGameStats(),
          getPerformance: () => P.getReport(),
          getErrors: () => x.getRecentErrors(),
          addClips: (e = 1e3) => {
            (t.increment("resources.clips", e),
              t.increment("resources.totalClips", e),
              t.increment("resources.unsoldClips", e),
              x.debug(`Added ${e} clips`));
          },
          addFunds: (e = 1e3) => {
            (t.increment("resources.funds", e), x.debug(`Added $${e}`));
          },
          addWire: (e = 1e3) => {
            (t.increment("resources.wire", e), x.debug(`Added ${e} wire`));
          },
          addOperations: (e = 1e4) => {
            (t.increment("computing.operations", e),
              x.debug(`Added ${e} operations`));
          },
          addCreativity: (e = 1e3) => {
            (t.increment("computing.creativity.amount", e),
              x.debug(`Added ${e} creativity`));
          },
          resetGame: () => {
            confirm("Really reset? This cannot be undone.") && this.reset();
          },
          saveGame: () => t.save(),
          loadGame: () => t.load(),
          setLogLevel: (e) => x.setLogLevel(e),
          enablePerformanceMonitoring: (e) => P.setEnabled(e),
          systems: this.systems,
          gameState: t,
          gameLoop: A,
          errorHandler: x,
          performanceMonitor: P,
        },
      }),
        (window.achievementSystem = W),
        x.info(
          "Debug interface available at window.UniversalPaperclips.debug",
        ));
    }
    handleAutoSave(e) {
      e - (t.get("gameState.lastAutoSave") || 0) > 3e4 &&
        (t.save(), t.set("gameState.lastAutoSave", e));
    }
    updateGamePhase() {
      const e = t.get("gameState.flags"),
        s = t.get("manufacturing.clipmakers.level"),
        i = t.get("manufacturing.megaClippers.level"),
        a = t.get("computing.processors"),
        n = t.get("resources.unusedClips");
      (s >= 1 &&
        0 === e.autoClipper &&
        (t.set("gameState.flags.autoClipper", 1),
        x.info("Business section unlocked")),
        i >= 1 &&
          0 === e.megaClipper &&
          (t.set("gameState.flags.megaClipper", 1),
          x.info("Manufacturing section unlocked")),
        a >= 1 &&
          0 === e.comp &&
          (t.set("gameState.flags.comp", 1),
          x.info("Computing section unlocked")),
        a >= 5 &&
          0 === e.projects &&
          (t.set("gameState.flags.projects", 1),
          x.info("Projects section unlocked")),
        n >= 5e9 &&
          0 === e.space &&
          (t.set("gameState.flags.space", 1),
          x.info("Space exploration unlocked")));
    }
    start() {
      if (this.initialized) x.warn("Game already initialized");
      else
        try {
          (t.load() ? x.info("Saved game loaded") : x.info("Starting new game"),
            A.start(),
            (this.initialized = !0),
            x.info("Game started successfully"));
        } catch (e) {
          x.handleError(e, "game.start", {}, !0);
        }
    }
    stop() {
      if (this.initialized)
        try {
          (t.save(),
            A.stop(),
            this.ui.events?.cleanup(),
            (this.initialized = !1),
            x.info("Game stopped"));
        } catch (e) {
          x.handleError(e, "game.stop");
        }
    }
    reset() {
      try {
        (A.stop(),
          Object.values(this.systems).forEach((e) => {
            e.reset && e.reset();
          }),
          t.reset(),
          this.ui.renderer?.reset(),
          A.start(),
          x.info("Game reset completed"));
      } catch (e) {
        x.handleError(e, "game.reset", {}, !0);
      }
    }
    getGameStats() {
      return {
        gameState: {
          clips: t.get("resources.clips"),
          funds: t.get("resources.funds"),
          wire: t.get("resources.wire"),
          elapsedTime: t.get("gameState.elapsedTime"),
          ticks: t.get("gameState.ticks"),
        },
        systems: {
          production: this.systems.production?.getStats(),
          market: this.systems.market?.getStats(),
          computing: this.systems.computing?.getStats(),
          combat: this.systems.combat?.getStats(),
          projects: this.systems.projects?.getStats(),
        },
        performance: P.getReport(),
        errors: x.getStats(),
        ui: {
          renderer: this.ui.renderer?.getStats(),
          events: this.ui.events?.getStats(),
        },
        gameLoop: A.getStats(),
      };
    }
    exportGame() {
      return {
        gameState: t.export(),
        systemStates: {
          production: this.systems.production?.getSaveData?.(),
          market: this.systems.market?.getSaveData?.(),
          computing: this.systems.computing?.getSaveData?.(),
          combat: this.systems.combat?.getSaveData?.(),
          projects: this.systems.projects?.getSaveData?.(),
        },
        timestamp: Date.now(),
        version: "2.0.0",
      };
    }
    importGame(e) {
      try {
        return (
          t.import(e.gameState),
          e.systemStates &&
            Object.entries(e.systemStates).forEach(([e, t]) => {
              const s = this.systems[e];
              s?.loadSaveData && s.loadSaveData(t);
            }),
          x.info("Game data imported successfully"),
          !0
        );
      } catch (e) {
        return (x.handleError(e, "game.importGame"), !1);
      }
    }
  }
  return (
    document.addEventListener("DOMContentLoaded", () => {
      try {
        new J().start();
      } catch (e) {}
    }),
    window.addEventListener("beforeunload", () => {
      try {
        t.save();
      } catch (e) {}
    }),
    J
  );
})();
