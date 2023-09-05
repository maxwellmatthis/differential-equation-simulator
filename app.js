import { loop, repeatFor, Rect } from "./lib.js";

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
