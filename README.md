# differential-equation-simulator

A small program and framework for visualizing physical objects moving around.

# How to Use - Example

```js
// make sure to update the names of these elements to your own
const engineTime = document.querySelector("span#engine-time");
const realTime = document.querySelector("span#real-time");
const fps = document.querySelector("span#fps");
/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas#view");

import { Engine, Rect } from "./lib.js";

class ConstantX extends Rect {
  constructor(ix, iy, dt, v = 40) {
    super(ix, iy, dt);
    this.registerCompute((dt) => {
      this.x = this.x + v * dt; // s(t_2) = s(t_1) + s'(t_1) * (t_2 - t_1)
      v *= this.verticalEdgeBounceFactor(v); // flips v_x vector when the `Rect` touches the left or right edge
    });
  }
}

const engine = new Engine(canvas, [ new ConstantX(10, 20, 0.01) ]);
engine.registerHTMLComponents(engineTime, realTime, fps);
engine.run(50); // run the engine for 50s
```

# Demo

[![](./demo/demo.mov)](Demo)
