// Canvas Setup
const html = document.querySelector("html");
/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas#view");
const ctx = canvas.getContext("2d");
ctx.canvas.width = Math.floor(html.clientWidth);
ctx.canvas.height = Math.floor(html.clientHeight);

/**
 * Runs a function every `delta_t` for a given `duration`.
 * @param {number} duration [s] The duration for which to repeat.
 * @param {number} delta_t [s] The time between executions.
 * @param {(time_passed, delta_t) => void} fn A function that is run continuously for the given duration.
 * @returns a Promise to make it easier to wait for the loop to finish.
 */
export const repeatFor = async (duration, delta_t, fn) => {
  return new Promise((resolve, _) => {
    let time_passed = 0;
    const interval = setInterval(() => {
      time_passed += delta_t; // t_2 = t_1 + ∆t
      fn(time_passed, delta_t);
      if (time_passed > duration) {
        clearInterval(interval);
        resolve();
      };
    }, delta_t * 1000);
  });
};

export const loop = async (fn) => {
  await fn();
  setTimeout(() => loop(fn), 1000);
};

/**
 * Clears the entire canvas.
 */
export const clear = () => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

export class Rect {
  /**
   * Creates a rectangle. Set its position to show it. (10px = 1m)
   * @param {number} side_length The rectangles side length [m]
   * @param {string} color The color to render with.
   * @param {string} trail Whether to leave behind a lightened trail to show history.
   */
  constructor(side_length, color = "blue", trail = true) {
    this.side_length = side_length * 10;
    this.color = color;
    this.trail = trail;
  }

  /**
   * Sets the square's position to a given set of coordinates. (10px = 1m)
   * @param {number} x Center X-Coordinate [m]
   * @param {number} y Center Y-Coordinate [m]
   */
  setPos(x, y) {
    this.#erase();
    this.x = Math.round(x * 10);
    this.y = Math.round(ctx.canvas.height - y * 10);
    this.#draw();
  }

  #draw(color = this.color) {
    ctx.fillStyle = color;
    ctx.fillRect(
      this.x - this.side_length / 2,
      this.y - this.side_length / 2,
      this.side_length,
      this.side_length
    );
  }

  #erase() {
    if (this.trail) {
      this.#draw("rgba(256, 256, 256, 0.7)");
    } else {
      ctx.clearRect(
        this.x - this.side_length / 2,
        this.y - this.side_length / 2,
        this.side_length,
        this.side_length
      );
    }
  }
}
