const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

// =========================
// PLAYER
// =========================

const player = {
  x: canvas.width / 2 - 15,
  y: canvas.height / 2 - 15,
  size: 30,
  color: "cyan"
};

// =========================
// MONDO
// =========================

const worldPos = {
  x: 0,
  y: 0
};

const speed = 4;

// =========================
// INPUT TASTIERA
// =========================

const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

window.addEventListener("keydown", (e) => {

  if (e.code === "ArrowUp" || e.code === "KeyW") {
    keys.up = true;
  }

  if (e.code === "ArrowDown" || e.code === "KeyS") {
    keys.down = true;
  }

  if (e.code === "ArrowLeft" || e.code === "KeyA") {
    keys.left = true;
  }

  if (e.code === "ArrowRight" || e.code === "KeyD") {
    keys.right = true;
  }

});

window.addEventListener("keyup", (e) => {

  if (e.code === "ArrowUp" || e.code === "KeyW") {
    keys.up = false;
  }

  if (e.code === "ArrowDown" || e.code === "KeyS") {
    keys.down = false;
  }

  if (e.code === "ArrowLeft" || e.code === "KeyA") {
    keys.left = false;
  }

  if (e.code === "ArrowRight" || e.code === "KeyD") {
    keys.right = false;
  }

});

// =========================
// STELLE
// =========================

const stars = [];

for (let i = 0; i < 400; i++) {

  stars.push({
    x: Math.random() * 8000,
    y: Math.random() * 8000,
    size: Math.random() * 2 + 1
  });

}

// =========================
// UPDATE
// =========================

function update() {

  if (keys.up) {
    worldPos.y -= speed;
  }

  if (keys.down) {
    worldPos.y += speed;
  }

  if (keys.left) {
    worldPos.x -= speed;
  }

  if (keys.right) {
    worldPos.x += speed;
  }

}

// =========================
// GRIGLIA
// =========================

function drawGrid() {

  const gridSize = 50;

  const offsetX = worldPos.x % gridSize;
  const offsetY = worldPos.y % gridSize;

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;

  // verticali
  for (
    let x = -gridSize;
    x < canvas.width + gridSize;
    x += gridSize
  ) {

    ctx.beginPath();

    ctx.moveTo(x - offsetX, 0);
    ctx.lineTo(x - offsetX, canvas.height);

    ctx.stroke();

  }

  // orizzontali
  for (
    let y = -gridSize;
    y < canvas.height + gridSize;
    y += gridSize
  ) {

    ctx.beginPath();

    ctx.moveTo(0, y - offsetY);
    ctx.lineTo(canvas.width, y - offsetY);

    ctx.stroke();

  }

}

// =========================
// STELLE
// =========================

function drawStars() {

  ctx.fillStyle = "white";

  stars.forEach((star) => {

    const screenX = star.x - worldPos.x;
    const screenY = star.y - worldPos.y;

    if (
      screenX >= -10 &&
      screenX <= canvas.width + 10 &&
      screenY >= -10 &&
      screenY <= canvas.height + 10
    ) {

      ctx.fillRect(
        screenX,
        screenY,
        star.size,
        star.size
      );

    }

  });

}

// =========================
// PLAYER
// =========================

function drawPlayer() {

  ctx.shadowColor = "cyan";
  ctx.shadowBlur = 20;

  ctx.fillStyle = player.color;

  ctx.fillRect(
    player.x,
    player.y,
    player.size,
    player.size
  );

  ctx.shadowBlur = 0;

}

// =========================
// DRAW
// =========================

function draw() {

  // pulizia
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // sfondo
  ctx.fillStyle = "black";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawStars();
  drawGrid();
  drawPlayer();

}

// =========================
// GAME LOOP
// =========================

function gameLoop() {

  update();
  draw();

  requestAnimationFrame(gameLoop);

}

gameLoop();