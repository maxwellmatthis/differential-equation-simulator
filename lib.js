// Canvas Setup
const html = document.querySelector("html");
/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas#view");
export const defaultCtx = canvas.getContext("2d");
defaultCtx.canvas.width = Math.floor(html.clientWidth);
defaultCtx.canvas.height = Math.floor(html.clientHeight);

const SECOND_IN_MS = 1000;
const METERS_IN_PIXELS = 10;

export class Engine {
  /**
   * 
   * @param {Thing[]} things Things to register on this engine initially
   */
  constructor(things = []) {
    this.things = things;
  }

  /**
   * 
   * @param {Thing} thing A new thing.
   */
  register(thing) {
    this.things.push(thing);
  }

  /**
   * Run the engine.
   * @param {number} duration_s [s] The duration to run the engine for.
   * @param {number} min_delta_time_s [s] The minimum ∆t that the engine will compute. This determines how quickly the engine runs.
   */
  async run(duration_s, min_delta_time_s) {
    const duration_ms = duration_s * SECOND_IN_MS;
    const min_delta_time_ms = min_delta_time_s * SECOND_IN_MS;
    this.real_runtime = Date.now();
    this.virtual_runtime = 0;
    this.running = true;
    while (this.running) {
      const start = Date.now();
      this.#computeAll(min_delta_time_ms);
      this.virtual_runtime += min_delta_time_ms;
      if (this.virtual_runtime > duration_ms) break;
      const end = Date.now();
      await new Promise((resolve, _) => setTimeout(resolve, min_delta_time_ms + end - start));
    }
    this.stop();
  }

  #computeAll(delta_time_ms) {
    for (const thing of this.things) {
      thing.computeIfReady(delta_time_ms);
    }
  }

  stop() {
    this.running = false;
  }
}

function flipY(y_val) {
  return defaultCtx.canvas.height - y_val;
}

export class Thing {
  /**
   * @param {number} x Initial x-coordinate.
   * @param {number} y Initial y-coordinate.
   * @param {number} delta_time_s The time between computations.
   */
  constructor(x = 0, y = 0, delta_time_s = 0.1) {
    this.setPos(x, y);
    this.delta_time_ms = delta_time_s * SECOND_IN_MS;
    this.time_accumulated_since_last = 0;
  }

  /**
   * Sets the thing's position to a given set of coordinates. (10px = 1m)
   * @param {number} x Center X-Coordinate [m]
   * @param {number} y Center Y-Coordinate [m]
   */
  setPos(x = this.x, y = this.y) {
    this._beforePositionUpdate?.();
    this.x = x;
    this.y = y;
    this._afterPositionUpdate?.();
  }

  /**
   * Sets the thing's x-position to a given coordinate. (10px = 1m)
   * @param {number} x Center X-Coordinate [m]
   */
  setX(x) {
    this._beforePositionUpdate?.();
    this.x = x;
    this._afterPositionUpdate?.();
  }

  /**
   * Sets the thing's y-position to a given coordinate. (10px = 1m)
   * @param {number} y Center Y-Coordinate [m]
   */
  setY(y) {
    this._beforePositionUpdate?.();
    this.y = y;
    this._afterPositionUpdate?.();
  }

  /**
   * Run the compute function if the thing is ready
   * @param {number} delta_time_ms [ms]
   */
  computeIfReady(delta_time_ms) {
    this.time_accumulated_since_last += delta_time_ms;
    if (this.time_accumulated_since_last > this.delta_time_ms) {
      this.compute(this.time_accumulated_since_last / SECOND_IN_MS);
      this.time_accumulated_since_last = 0;
    }
  }

  /**
   * Compute the new position based on the time passed since the last computation.
   * @param {number} delta_time_s [s]
   */
  compute(delta_time_s) {
    if (!this.hasWarned) {
      console.warn(this, "does not implement the `Thing.compute` method!");
      this.hasWarned = true;
    }
  }

  registerCompute(fn) {
    this.compute = fn;
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
   * @param {string} trail Whether to leave behind a lightened trail to show history.
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
    this.color = color;
    this.trail = trail;
  }

  _afterPositionUpdate(color = this.color) {
    defaultCtx.fillStyle = color;
    defaultCtx.fillRect(
      Math.round(this.x * METERS_IN_PIXELS - this.side_length / 2),
      Math.round(flipY(this.y * METERS_IN_PIXELS - this.side_length / 2)),
      this.side_length,
      this.side_length
    );
  }

  _beforePositionUpdate() {
    if (this.trail) {
      this._afterPositionUpdate("rgba(256, 256, 256, 0.7)");
    } else {
      this._afterPositionUpdate("rgba(0, 0, 0, 0)");
    }
  }
}
