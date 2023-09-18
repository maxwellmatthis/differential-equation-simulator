const SECOND_IN_MS = 1000;
const METERS_IN_PIXELS = 10;

const unitMeasures = {
  y: 31557600000,
  mo: 2629800000,
  w: 604800000,
  d: 86400000,
  h: 3600000,
  m: 60000,
  s: 1000,
  ms: 1,
};
/**
 * Formats milliseconds as `1y 2mo 3w 4d 5h 6m 7s 8ms`.
 * @param {number} millis Milliseconds to be formatted.
 */
function formatTime(millis) {
  if (millis === 0) return "0s";
  millis = Math.abs(Math.floor(millis));
  const parts = [];
  for (const [unit, ms] of Object.entries(unitMeasures)) {
    const unitValue = Math.floor(millis / ms);
    if (unitValue !== 0) {
      millis -= unitValue * ms;
      parts.push(unitValue + unit);
    }
  }
  return parts.join(" ");
}

export class Engine {
  /**
   * Create a new `Engine` to simulate `Things`.
   * @param {HTMLCanvasElement} canvas A canvas to paint to.
   * @param {Thing[]} things Things to register on this engine initially.
   * @param {Thing[]} fps The display frames per second.
   */
  constructor(canvas, things = [], fps = 30) {
    this.things = things;
    // Canvas Setup
    this.ctx = canvas.getContext("2d");
    const setCanvasSize = () => {
      this.ctx.canvas.width = Math.floor(canvas.clientWidth);
      this.ctx.canvas.height = Math.floor(canvas.clientHeight);
    }
    setCanvasSize();
    if (window) window.addEventListener("resize", setCanvasSize);
    for (const thing of this.things) {
      thing.registerCanvasContext(this.ctx);
    }
    this.fps = fps;
    this.#computeAll(0);
  }

  /**
   * Add a thing to the engine.
   * @param {Thing} thing A new thing.
   */
  register(thing) {
    this.things.push(thing);
    thing.registerCanvasContext(this.ctx);
    thing.compute(0);
  }

  registerHTMLComponents(engineTimeDisplay, realTimeDisplay, fpsDisplay) {
    this.engineTimeDisplay = engineTimeDisplay;
    this.realTimeDisplay = realTimeDisplay;
    this.fpsDisplay = fpsDisplay;
  }

  #displayStats() {
    if (this.engineTimeDisplay) this.engineTimeDisplay.textContent = formatTime(this.virtual_runtime);
    if (this.realTimeDisplay) this.realTimeDisplay.textContent = formatTime(Date.now() - this.real_runtime_start);
    if (this.fpsDisplay) this.fpsDisplay.textContent = Math.round(this.fps);
  }

  #render() {
    for (const thing of this.things) {
      thing.paint();
    }
  }

  /**
   * Run the engine.
   * @param {number} duration_s [s] The duration to run the engine for. Default = `Infinity`
   */
  async run(duration_s = Infinity) {
    const duration_ms = duration_s * SECOND_IN_MS;
    this.real_runtime_start = Date.now();
    this.virtual_runtime = 0;
    this.running = true;
    this.#displayStats();
    this.metaInterval = setInterval(() => this.#displayStats(), SECOND_IN_MS / 16);
    const timeout = 1000 / this.fps;
    let delta_time_ms = timeout;
    while (this.running) {
      const start = Date.now();
      this.#computeAll(delta_time_ms);
      this.virtual_runtime += delta_time_ms;
      this.#render();
      if (this.virtual_runtime > duration_ms) break;
      const end = Date.now();
      await new Promise((resolve, _) => setTimeout(resolve, timeout-(end-start)));
      delta_time_ms = Date.now() - start;
      this.fps = 1000 / delta_time_ms;
    }
    this.stop();
    this.#displayStats();
  }

  #computeAll(delta_time_ms) {
    for (const thing of this.things) {
      thing.computeIfReady(delta_time_ms);
    }
  }

  stop() {
    this.running = false;
    clearInterval(this.metaInterval);
  }
}

export class Thing {
  /**
   * @param {number} x Initial x-coordinate.
   * @param {number} y Initial y-coordinate.
   * @param {number} delta_time_s The time between computations.
   */
  constructor(x = 0, y = 0, delta_time_s = 0.1) {
    this.x = x;
    this.y = y;
    this.delta_time_ms = delta_time_s * SECOND_IN_MS;
    this.time_accumulated_since_last = 0;
  }

  /**
   * Run the compute function if the thing is ready
   * @param {number} delta_time_ms [ms]
   */
  computeIfReady(delta_time_ms) {
    this.time_accumulated_since_last += delta_time_ms;
    if (this.time_accumulated_since_last > this.delta_time_ms) {
      try {
        while (this.time_accumulated_since_last > 0) {
          const dt = Math.min(this.time_accumulated_since_last, this.delta_time_ms);
          this.compute(dt / SECOND_IN_MS);
          this.time_accumulated_since_last -= dt;
        }
      } catch (error) {
        console.error(error);
      }
      this.time_accumulated_since_last = 0;
    }
  }

  /**
   * Compute the new position based on the time passed since the last computation.
   * @param {number} delta_time_s [s]
   */
  compute(delta_time_s) {
    if (!this.hasWarnedCompute) {
      console.warn(this.constructor.name + " does not implement the `Thing.compute` method!", this);
      this.hasWarnedCompute = true;
    }
  }

  registerCompute(fn) {
    this.compute = fn;
  }

  registerCanvasContext(ctx) {
    this.ctx = ctx;
  }

  flipY(y_val) {
    return this.ctx.canvas.height - y_val;
  }

  paint() {
    if (!this.hasWarnedPaint) {
      console.warn(this.constructor.name + " does not implement the `Thing.paint` method!", this);
      this.hasWarnedPaint = true;
    }
  }
}

/**
 * An implementation of thing that features a rectangle that paints itself to the canvas automatically.
 */
export class Rect extends Thing {
  /**
   * Creates a rectangle. Set its position to show it. (10px = 1m)
   * @param {number} x Initial x-coordinate.
   * @param {number} y Initial y-coordinate.
   * @param {number} delta_time_s [s] ∆t
   * @param {number} side_length [m] The rectangles side length
   * @param {string} color The color to render with.
   * @param {boolean} trail Whether to leave behind a lightened trail to show history.
   */
  constructor(
    x,
    y,
    delta_time_s,
    side_length = 1,
    color = "blue",
    trail = true,
  ) {
    super(x, y, delta_time_s);
    this.side_length = Math.round(side_length * METERS_IN_PIXELS);
    this.side_length_halves = this.side_length / 2;
    this.color = color;
    this.trail = trail;
  }

  #hide() {
    if (this.trail) {
      this.ctx.fillStyle = "rgba(256, 256, 256, 0.7)";
      this.ctx.fillRect(
        this.lastPaintX,
        this.lastPaintY,
        this.side_length,
        this.side_length
      );
    } else {
      this.ctx.clearRect(
        this.lastPaintX,
        this.lastPaintY,
        this.side_length,
        this.side_length
      );
    }
  }

  paint(color = this.color) {
    this.#hide();
    this.lastPaintX = Math.round(this.x * METERS_IN_PIXELS - this.side_length_halves)
    this.lastPaintY = Math.round(this.flipY(this.y * METERS_IN_PIXELS - this.side_length_halves))
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      this.lastPaintX,
      this.lastPaintY,
      this.side_length,
      this.side_length
    );
  }

  /**
   * Helps update `v_x` depending on an objects position in the canvas.
   * @param {number} v_x The current x velocity.
   * @returns `1` or `-1` depending on whether or not the left or right edge is being touched.
   */
  verticalEdgeBounceFactor(v_x) {
    return (
      (this.x * METERS_IN_PIXELS - this.side_length_halves <= 0 && v_x < 0) ||
      (this.x * METERS_IN_PIXELS + this.side_length_halves >= this.ctx.canvas.width && v_x > 0)
    ) ? -1 : 1;
  }

  /**
   * Helps update `v_y` depending on an objects position in the canvas.
   * @param {number} v_y The current y velocity.
   * @returns `1` or `-1` depending on whether or not the top or bottom edge is being touched.
   */
  horizontalEdgeBounceFactor(v_y) {
    return (
      (this.y * METERS_IN_PIXELS - this.side_length_halves <= 0 && v_y < 0) ||
      (this.y * METERS_IN_PIXELS + this.side_length_halves >= this.ctx.canvas.height && v_y > 0)
    ) ? -1 : 1;
  }
}
