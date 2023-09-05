import { loop, repeatFor, Rect } from "./lib.js";

{
  // --- Konstante Geschwindigkeit in X-Richtung ---
  const obj = new Rect(1, "purple");
  loop(() => {
    const v = 20;
    let s = 2;
    return repeatFor(2, 0.05, (_t, dt) => {
      s = s + v * dt; // s(t_2) = s(t_1) + s'(t_1) * (t_2 - t_1)
      obj.setPos(s, 50);
    });
  });
}

{
  // --- Der freie Fall auf der Erde ---
  const obj = new Rect(1, "green");
  loop(() => {
    const a = -9.81;
    let y = 40;
    return repeatFor(3, 0.05, (t, dt) => {
      const v = a * t;
      y = y + v * dt;
      obj.setPos(3, y);
    });
  });
}

{
  // --- Der lotrechte Wurf auf dem Mond ---
  const obj = new Rect(1, "red");
  loop(() => {
    const a_y = -1.625;
    let v_y = 10;
    let y = 1;
    return repeatFor(15, 0.05, (_t, dt) => {
      v_y = v_y + a_y * dt;
      y = y + v_y * dt;
      obj.setPos(8, y);
    });
  });
}

{
  // --- Der schräge Wurf auf der Erde ---
  const obj = new Rect(1, "blue");
  loop(() => {
    const v_x = 10;
    const a_y = -9.81;
    let x = 5;
    let y = 40;
    return repeatFor(3.5, 0.05, (t, dt) => {
      const v_y = a_y * t;
      y = y + v_y * dt;
      x = x + v_x * dt;
      obj.setPos(x, y);
    });
  });
}

{
  // --- Der lotrechte Wurf auf der Erde mit beschleunigter Bewegung in -X-Richtung mit Bounce ---
  const obj = new Rect(1, "orange");
  loop(() => {
    const a_x = 0.2;
    const a_y = -9.81;
    let v_x = 0;
    let v_y = 30;
    let x = 10;
    let y = 1;
    return repeatFor(20, 0.005, (_t, dt) => {
      v_x = v_x + a_x * dt;
      v_y = v_y + a_y * dt;
      x = x + v_x * dt;
      y = y + v_y * dt;
      if (y <= 0) v_y *= -1;
      obj.setPos(x, y);
    });
  });
}
