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
const repeatFor = async (duration, delta_t, fn) => {
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

const loop = async (fn) => {
  await fn();
  setTimeout(() => loop(fn), 1000);
};

/**
 * Clears the entire canvas.
 */
const clear = () => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

class Rect {
  /**
   * Creates a rectangle. Set its position to show it.
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
   * 
   * __Important:__ The numbers on the y-axis grow down! I.e. P(0, 0) is the top left corner of the screen.
   * @param {number} x Center X-Coordinate [m]
   * @param {number} y Center Y-Coordinate [m]
   */
  setPos(x, y) {
    this.#erase();
    this.x = Math.round(x * 10);
    this.y = Math.round(y * 10);
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

{
  // --- Konstante Geschwindigkeit in X-Richtung ---
  const obj = new Rect(1, "purple");
  loop(() => {
    const v = 20;
    let s = 0;
    return repeatFor(2, 0.05, (_t, dt) => {
      s = s + v * dt; // s(t_2) = s(t_1) + s'(t_1) * (t_2 - t_1)
      obj.setPos(s, 30);
    });
  });
}

{
  // --- Der freie Fall auf der Erde ---
  const obj = new Rect(1, "green");
  loop(() => {
    const a = 9.81;
    let s = 0;
    return repeatFor(3, 0.05, (t, dt) => {
      const v = a * t;
      s = s + v * dt;
      obj.setPos(10, s);
    });
  });
}

{
  // --- Der schräge Wurf auf der Erde ---
  const obj = new Rect(1, "blue");
  loop(() => {
    const v_x = 10;
    const a_y = 9.81;
    let x = 0;
    let y = 0;
    return repeatFor(3.5, 0.05, (t, dt) => {
      const v_y = a_y * t;
      y = y + v_y * dt;
      x = x + v_x * dt;
      obj.setPos(x, y);
    });
  });
}

{
  // --- Der lotrechte Wurf auf dem Mond mit beschleunigter Bewegung in -X-Richtung ---
  const obj = new Rect(1, "red");
  loop(() => {
    const a_x = -0.5;
    const a_y = 1.625;
    let v_x = 0;
    let v_y = -30;
    let x = 50;
    let y = 30;
    return repeatFor(3, 0.05, (t, dt) => {
      v_x = v_x + a_x * t;
      v_y = v_y + a_y * t;
      x = x + v_x * dt;
      y = y + v_y * dt;
      obj.setPos(x, y);
    });
  });
}
