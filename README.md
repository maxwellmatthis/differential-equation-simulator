# differential-equation-simulator

A small program and framework for visualizing physical objects moving around.

# How to Use - Example

```js
// make sure to update the names of these elements to your own
const engineTime = document.querySelector("span#engine-time");
const realTime = document.querySelector("span#real-time");
/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas#view");

import { Engine, Rect } from "./lib.js";

class ConstantX extends Rect {
  constructor(ix, iy, dt, v = 40) {
    super(ix, iy, dt);
    this.registerCompute((dt) => {
      const x = this.x + v * dt; // s(t_2) = s(t_1) + s'(t_1) * (t_2 - t_1)
      v *= this.verticalEdgeBounceFactor(v); // flips v_x vector when the `Rect` touches the left or right edge
      this.setX(x);
    });
  }
}

const engine = new Engine(canvas, [ new ConstantX(10, 20, 0.01) ]);
engine.registerHTMLComponents(engineTime, realTime);
engine.run(50, 0.001); // run the engine at a max speed of `1ms`, this dictates how quickly all objects can compute
```

# Demo

[![](./demo/demo.mov)](Demo)
