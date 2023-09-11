import { Engine, Rect } from "./lib.js";

class KonstanteXBewegung extends Rect {
  constructor(ix, iy, dt, v = 40) {
    super(ix, iy, dt);
    this.registerCompute((dt) => {
      const x = this.x + v * dt; // s(t_2) = s(t_1) + s'(t_1) * (t_2 - t_1)
      v *= this.verticalEdgeBounceFactor(v);
      this.setX(x);
    });
  }
}

class FreierFall extends Rect {
  constructor(ix, iy, dt, a = -9.81) {
    super(ix, iy, dt);
    let v = 0;
    this.registerCompute((dt) => {
      v = v + a * dt;
      v *= this.horizontalEdgeBounceFactor(v);
      const y = this.y + v * dt;
      this.setY(y);
    });
  }
}

class LotrechterWurf extends Rect {
  constructor(ix, iy, dt, a_y = -1.625, v_y = 10, color) {
    super(ix, iy, dt, undefined, color);
    this.registerCompute((dt) => {
      v_y = v_y + a_y * dt;
      v_y *= this.horizontalEdgeBounceFactor(v_y);
      const y = this.y + v_y * dt;
      this.setY(y);
    });
  }
}

class SchrägerWurf extends Rect {
  constructor(ix, iy, dt, a_y = -9.81, v_x = 20, color, trail) {
    super(ix, iy, dt, undefined, color, trail);
    let v_y = 0;
    this.registerCompute((dt) => {
      v_y = v_y + a_y * dt;
      v_y *= this.horizontalEdgeBounceFactor(v_y);
      const y = this.y + v_y * dt;
      v_x *= this.verticalEdgeBounceFactor(v_x);
      const x = this.x + v_x * dt;
      this.setPos(x, y);
    });
  }
}

class LotrechtBewegt extends Rect {
  constructor(ix, iy, dt, a_x = 0.2, a_y = -9.81, v_x = 0, v_y = 30, side_length, color) {
    super(ix, iy, dt, side_length, color);
    this.registerCompute((dt) => {
      v_x = v_x + a_x * dt;
      v_x *= this.verticalEdgeBounceFactor(v_x);
      const x = this.x + v_x * dt;
      v_y = v_y + a_y * dt;
      v_y *= this.horizontalEdgeBounceFactor(v_y);
      const y = this.y + v_y * dt;
      if (y <= 0) v_y *= -1;
      this.setPos(x, y);
    });
  }
}

const engine = new Engine([
  new KonstanteXBewegung(10, 20, 0.01),
  new FreierFall(20, 40, 0.01),
  new LotrechterWurf(60, 10, 0.001),
  new SchrägerWurf(20, 70, 0.001, undefined, undefined, "magenta", false),
  new LotrechtBewegt(30, 20, 1, undefined, undefined, undefined, undefined, undefined, "purple"),
  new LotrechtBewegt(30, 20, 0.1, undefined, undefined, undefined, undefined, undefined, "red"),
  new LotrechtBewegt(30, 20, 0.01, undefined, undefined, undefined, undefined, undefined, "orange"),
  new LotrechtBewegt(30, 20, 0.001, undefined, undefined, undefined, undefined, undefined, "green")
]);
// for (let i = 0; i < 200; i++) {
//   engine.register(new SchrägerWurf(Math.random() * 100, Math.random() * 100, 0.01, Math.random() * 100, Math.random() * 100));
// }
engine.run(50, 0.001);
