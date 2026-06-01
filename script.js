const canvas = document.getElementById("game");
const ctx = canvas ? canvas.getContext("2d") : null;

const coinsEl = document.getElementById("coins");
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const messageEl = document.getElementById("message");
const shopButtons = document.querySelectorAll(".shop-item");
const shipShopToggle = document.getElementById("shipShopToggle");
const shipShop = document.getElementById("shipShop");
const shipInfoEl = document.getElementById("shipInfo");
const shipButtons = document.querySelectorAll(".ship-option");

const ships = {
  scout: { name: "Scout", cost: 0, speed: 7, damageMultiplier: 1.0, description: "Bilanciata e stabile" },
  interceptor: { name: "Interceptor", cost: 2500, speed: 10, damageMultiplier: 1.1, description: "Velocissima per schivare" },
  titan: { name: "Titan", cost: 3500, speed: 6, damageMultiplier: 1.4, description: "Più lenta ma potente" },
  falcon: { name: "Falcon", cost: 5000, speed: 11, damageMultiplier: 1.2, description: "Velocità e precisione superiori" },
  destroyer: { name: "Destroyer", cost: 7000, speed: 5, damageMultiplier: 1.6, description: "Massimo potere di fuoco" }
};

const shipLooks = {
  scout: { body: "#dffbff", wing: "#ff69c9", window: "#4bdfff", flame: "#fff06a", width: 1, height: 1 },
  interceptor: { body: "#8efcff", wing: "#5b7cff", window: "#ffffff", flame: "#ff69c9", width: 0.82, height: 1.16 },
  titan: { body: "#f1f4ff", wing: "#8b5cf6", window: "#62d777", flame: "#ff7d55", width: 1.22, height: 0.95 },
  falcon: { body: "#ffe66d", wing: "#ff69c9", window: "#10213d", flame: "#8efcff", width: 0.95, height: 1.08 },
  destroyer: { body: "#d9b6ff", wing: "#72338a", window: "#fff06a", flame: "#ff3f7d", width: 1.34, height: 1.02 }
};

function safeTextSet(element, value) {
  if (element) {
    element.textContent = value;
  }
}

const keys = {
  left: false,
  right: false,
  shoot: false
};

const weapons = {
  basic: {
    name: "Laser base",
    cost: 0,
    damage: 1,
    speed: 9,
    cooldown: 320,
    color: "#9df6ff",
    width: 4
  },
  plasma: {
    name: "Plasma",
    cost: 120,
    damage: 2,
    speed: 11,
    cooldown: 230,
    color: "#ff69c9",
    width: 7
  },
  nova: {
    name: "Nova",
    cost: 320,
    damage: 4,
    speed: 13,
    cooldown: 165,
    color: "#fff06a",
    width: 10
  },
  comet: {
    name: "Cometa",
    cost: 1000,
    damage: 8,
    speed: 20,
    cooldown: 132,
    color: "#8efcff",
    width: 12
  },
  nebula: {
    name: "Nebula",
    cost: 2500,
    damage: 14,
    speed: 24,
    cooldown: 108,
    color: "#d9b6ff",
    width: 15
  },
  supernova: {
    name: "Supernova",
    cost: 5000,
    damage: 20,
    speed: 28,
    cooldown: 88,
    color: "#ff7d55",
    width: 18
  },
  tonCannon: {
    name: "Cannone TON",
    cost: 10000,
    damage: 34,
    speed: 34,
    cooldown: 64,
    color: "#ff69c9",
    width: 24
  }
};

const targetTypes = [
  { type: "star", label: "Stella", points: 15, coins: 5, radius: 13, hp: 1, color: "#ffffff", chance: 50, minLevel: 1 },
  { type: "pulsar", label: "Pulsar", points: 100, coins: 120, radius: 15, hp: 1, color: "#9df6ff", chance: 10, minLevel: 2 },
  { type: "meteor", label: "Meteorite", points: 25, coins: 10, radius: 18, hp: 1, color: "#b98a5b", chance: 30, minLevel: 1 },
  { type: "planet", label: "Pianeta", points: 50, coins: 22, radius: 24, hp: 2, color: "#62d777", chance: 18, minLevel: 4 },
  { type: "galaxy", label: "Galassia", points: 80, coins: 35, radius: 28, hp: 3, color: "#c071ff", chance: 12, minLevel: 6 },
  { type: "blackhole", label: "Buco nero", points: 160, coins: 75, radius: 30, hp: 5, color: "#141424", chance: 6, minLevel: 8 },
  { type: "ufo", label: "UFO", points: 120, coins: 80, radius: 26, hp: 3, color: "#8efcff", chance: 14, minLevel: 5 },
  { type: "neutron", label: "Stella neutronica", points: 140, coins: 180, radius: 16, hp: 2, color: "#c7f7ff", chance: 8, minLevel: 9 },
  { type: "redgiant", label: "Gigante rossa", points: 180, coins: 240, radius: 31, hp: 4, color: "#ff7d55", chance: 6, minLevel: 12 },
  { type: "quasar", label: "Quasar", points: 260, coins: 360, radius: 20, hp: 4, color: "#ffe66d", chance: 4, minLevel: 15 },
  { type: "ton618", label: "TON-618", points: 520, coins: 750, radius: 42, hp: 9, color: "#05020f", chance: 2, minLevel: 18 }
];

const powerUpTypes = [
  { type: "rapid", label: "Rapid Fire", color: "#ff69c9", duration: 9000 },
  { type: "shield", label: "Scudo", color: "#62d777", duration: 9000 },
  { type: "coinBoost", label: "Doppio Credito", color: "#ffe66d", duration: 9000 }
];

const game = {
  coins: 0,
  score: 0,
  level: 1,
  lives: 3,
  destroyed: 0,
  running: true,
  lastShot: 0,
  lastSpawn: 0,
  lastPowerUp: 0,
  spawnDelay: 1450,
  activeWeapon: "basic",
  selectedShip: "scout",
  ownedWeapons: new Set(["basic"]),
  ownedShips: new Set(["scout"]),
  activePowerUps: {
    rapid: 0,
    shield: 0,
    coins: 0
  }
};

const player = {
  x: canvas.width / 2,
  y: canvas.height - 72,
  width: 58,
  height: 82,
  speed: 7
};

const bullets = [];
const targets = [];
const powerUps = [];
const spaceStars = [];

for (let i = 0; i < 130; i++) {
  spaceStars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.7 + 0.25
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pickTargetType() {
  const availableTargets = targetTypes.filter((item) => game.level >= item.minLevel);
  const totalChance = availableTargets.reduce((sum, item) => sum + item.chance, 0);
  let roll = Math.random() * totalChance;

  for (const item of availableTargets) {
    roll -= item.chance;
    if (roll <= 0) {
      return item;
    }
  }

  return availableTargets[0];
}

function getArmorChance() {
  if (game.level < 5) {
    return 0;
  }

  if (game.level >= 90) {
    return 0.95;
  }

  if (game.level >= 70) {
    return 0.78;
  }

  return clamp(0.08 + game.level * 0.006, 0.08, 0.36);
}

function getArmorBonus() {
  if (game.level < 5 || Math.random() > getArmorChance()) {
    return null;
  }

  const armorLevel = game.level >= 90 ? 5 : game.level >= 70 ? 4 : game.level >= 35 ? 3 : game.level >= 16 ? 2 : 1;
  return {
    armored: true,
    armorLevel,
    hpBonus: armorLevel + Math.floor(game.level / 10) + (game.level >= 70 ? Math.floor(game.level / 8) : 0),
    labelPrefix: armorLevel >= 5 ? "Impossibile" : armorLevel === 4 ? "Estremo" : armorLevel === 3 ? "Elite" : armorLevel === 2 ? "Corazzato" : "Resistente"
  };
}

function getExtremeSpawnCount() {
  if (game.level >= 95) {
    return 4;
  }

  if (game.level >= 85) {
    return 3;
  }

  if (game.level >= 70) {
    return 2;
  }

  return 1;
}

function getExtremeHpMultiplier() {
  if (game.level >= 90) {
    return 2.4;
  }

  if (game.level >= 80) {
    return 1.9;
  }

  if (game.level >= 70) {
    return 1.45;
  }

  return 1;
}

function setMessage(text) {
  safeTextSet(messageEl, text);
}

function isPowerUpActive(type) {
  return game.activePowerUps[type] > performance.now();
}

function getActivePowerUpsText() {
  const active = [];

  if (isPowerUpActive("rapid")) {
    active.push("Rapid Fire");
  }
  if (isPowerUpActive("shield")) {
    active.push("Scudo");
  }
  if (isPowerUpActive("coins")) {
    active.push("Doppio Credito");
  }

  return active.length ? active.join(" • ") : "Nessun potenziamento attivo";
}

function updateHud() {
  safeTextSet(coinsEl, game.coins);
  safeTextSet(levelEl, game.level);
  safeTextSet(scoreEl, game.score);
  safeTextSet(livesEl, game.lives);
  updateShopButtons();
  updateShipButtons();
}

function updateLevel() {
  const nextLevel = clamp(Math.floor(game.destroyed / 3) + 1, 1, 100);

  if (nextLevel !== game.level) {
    game.level = nextLevel;
    game.spawnDelay = game.level >= 70 ? clamp(880 - (game.level - 70) * 12, 260, 880) : clamp(1450 - game.level * 9, 500, 1450);
    const unlockMessage = getLevelUnlockMessage(game.level);
    setMessage(`Livello ${game.level} - ${getDifficultyLabel(game.level)}! ${unlockMessage}`);
  }
}

function getLevelUnlockMessage(level) {
  if (level === 2) {
    return "I primi pulsar compaiono: inizia facile.";
  }

  if (level === 4) {
    return "Arrivano i pianeti: aumenta la sfida.";
  }

  if (level === 5) {
    return "UFO e oggetti resistenti in avvicinamento: mantieni la mira.";
  }

  if (level === 6) {
    return "Galassie in vista: i nemici diventano più impegnativi.";
  }

  if (level === 8) {
    return "Attento ai buchi neri: delle trappole arrivate dallo spazio.";
  }

  if (level === 10) {
    return "Quasar potenti: la difficoltà sale ancora.";
  }

  if (level === 12) {
    return "TON-618 appare: sei in una zona pericolosa.";
  }

  if (level === 25) {
    return "Il campo è più denso: continua a sparare.";
  }

  if (level === 35) {
    return "Compaiono oggetti elite: servono armi davvero potenti.";
  }

  if (level === 50) {
    return "Metà strada verso il livello 100! La sfida aumenta.";
  }

  if (level === 70) {
    return "Zona estrema: gli oggetti arrivano in ondate e resistono molto di più.";
  }

  if (level === 75) {
    return "Quasi alla fine: ogni nemico conta.";
  }

  if (level === 85) {
    return "Tempesta finale: tre oggetti alla volta, quasi tutti corazzati.";
  }

  if (level === 95) {
    return "Modalità impossibile: sopravvivere è già una vittoria.";
  }

  if (level === 100) {
    return "Hai raggiunto il livello massimo: mostra il tuo punteggio.";
  }

  return "Gli oggetti cadono sempre più veloci.";
}

function getDifficultyLabel(level) {
  if (level <= 20) {
    return "Facile";
  }

  if (level <= 50) {
    return "Medio";
  }

  if (level < 70) {
    return "Difficile";
  }

  if (level < 90) {
    return "Estremo";
  }

  return "Impossibile";
}

function activatePowerUp(type, duration) {
  game.activePowerUps[type] = performance.now() + duration;
}

function spawnPowerUp(time) {
  if (time - game.lastPowerUp < 14000) {
    return;
  }

  if (Math.random() > 0.18) {
    return;
  }

  const powerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  powerUps.push({
    type: powerUp.type,
    label: powerUp.label,
    x: Math.random() * (canvas.width - 40) + 20,
    y: -24,
    radius: 16,
    speed: 2.4,
    color: powerUp.color,
    duration: powerUp.duration
  });

  game.lastPowerUp = time;
}

function collectPowerUp(powerUp) {
  activatePowerUp(powerUp.type, powerUp.duration);

  if (powerUp.type === "rapid") {
    setMessage("Potenziamento Rapid Fire attivo!");
  } else if (powerUp.type === "shield") {
    setMessage("Scudo attivo: il prossimo colpo è bloccato.");
  } else if (powerUp.type === "coinBoost") {
    setMessage("Potenziamento Doppio Credito attivo!");
  }

  updateHud();
}

function drawPowerUp(powerUp) {
  ctx.save();
  ctx.fillStyle = powerUp.color;
  ctx.beginPath();
  ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.fillText(powerUp.type === "coinBoost" ? "+" : powerUp.type === "rapid" ? "⚡" : "⛨", powerUp.x, powerUp.y + 4);
  ctx.restore();
}

function damagePlayer(target) {
  if (isPowerUpActive("shield")) {
    game.activePowerUps.shield = 0;
    setMessage("Lo scudo ha assorbito il colpo!");
    updateHud();
    return;
  }

  const extremeDamage = game.level >= 90 ? 3 : game.level >= 70 ? 2 : 1;
  game.lives -= Math.max(target.type === "ton618" ? 2 : 1, extremeDamage);
  game.score = Math.max(0, game.score - (game.level >= 70 ? 140 : target.dangerous ? 80 : 30));

  if (game.lives <= 0) {
    game.lives = 3;
    game.score = 0;
    game.coins = Math.max(0, game.coins - 80);
    targets.length = 0;
    bullets.length = 0;
    setMessage("Game over! Riparti con 3 vite.");
  } else if (target.type === "ufo") {
    setMessage(`UFO preso! Vite rimaste: ${game.lives}.`);
  } else if (target.type === "ton618") {
    setMessage(`TON-618 ti ha risucchiato! Vite rimaste: ${game.lives}.`);
  } else {
    setMessage(`Colpito! Vite rimaste: ${game.lives}.`);
  }

  updateHud();
}

function shoot(time) {
  const weapon = weapons[game.activeWeapon];
  const cooldown = isPowerUpActive("rapid") ? weapon.cooldown / 2 : weapon.cooldown;
  const ship = ships[game.selectedShip] || ships.scout;

  if (time - game.lastShot < cooldown) {
    return;
  }

  game.lastShot = time;
  bullets.push({
    x: player.x,
    y: player.y - 44,
    width: weapon.width,
    height: 26,
    radius: weapon.width * 0.6,
    speed: weapon.speed,
    damage: Math.round(weapon.damage * ship.damageMultiplier),
    color: weapon.color
  });
}

function spawnTarget(time) {
  if (time - game.lastSpawn < game.spawnDelay) {
    return;
  }

  game.lastSpawn = time;

  for (let i = 0; i < getExtremeSpawnCount(); i++) {
    const base = pickTargetType();
    const levelBoost = 1 + game.level * (game.level >= 70 ? 0.115 : 0.08);
    const armor = getArmorBonus();
    const rawHp = base.hp + Math.floor(game.level / 7) + (armor ? armor.hpBonus : 0);
    const hp = Math.ceil(rawHp * getExtremeHpMultiplier());

    targets.push({
      ...base,
      label: armor ? `${armor.labelPrefix} ${base.label}` : base.label,
      x: Math.random() * (canvas.width - base.radius * 2) + base.radius,
      y: -base.radius - 10 - i * 46,
      speed: (Math.random() * 1.4 + 1.3) * levelBoost,
      hp,
      maxHp: hp,
      armored: Boolean(armor),
      armorLevel: armor ? armor.armorLevel : 0,
      points: armor ? Math.round(base.points * (1.35 + armor.armorLevel * 0.2)) : base.points,
      coins: armor ? Math.round(base.coins * (1.35 + armor.armorLevel * 0.25)) : base.coins,
      spin: Math.random() * Math.PI
    });
  }
}

function hitCircleRect(circle, rect) {
  if (!circle || !rect || typeof circle.radius !== 'number' || typeof rect.width !== 'number' || typeof rect.height !== 'number') {
    return false;
  }

  const closestX = clamp(circle.x, rect.x - rect.width / 2, rect.x + rect.width / 2);
  const closestY = clamp(circle.y, rect.y - rect.height / 2, rect.y + rect.height / 2);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return dx * dx + dy * dy < circle.radius * circle.radius;
}

function collectTarget(target) {
  const levelBonus = Math.floor(game.level * 2);
  let earnedCoins = target.coins + levelBonus;

  if (isPowerUpActive("coins")) {
    earnedCoins *= 2;
    setMessage(`${target.label} colpito: +${earnedCoins} monete (bonus x2)`);
  } else {
    setMessage(`${target.label} colpito: +${earnedCoins} monete`);
  }

  game.score += target.points;
  game.coins += earnedCoins;
  game.destroyed += 1;
  updateLevel();
  updateHud();
}

function update(time) {
  if (keys.left) {
    player.x -= player.speed;
  }

  if (keys.right) {
    player.x += player.speed;
  }

  player.x = clamp(player.x, 44, canvas.width - 44);

  if (keys.shoot) {
    shoot(time);
  }

  spawnTarget(time);
  spawnPowerUp(time);

  for (const star of spaceStars) {
    star.y += star.speed + game.level * 0.04;
    if (star.y > canvas.height) {
      star.y = -6;
      star.x = Math.random() * canvas.width;
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    if (!bullet) {
      continue;
    }

    bullet.y -= bullet.speed;
    if (bullet.y < -40) {
      bullets.splice(i, 1);
    }
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    if (!powerUp) {
      continue;
    }

    powerUp.y += powerUp.speed;

    if (powerUp.y > canvas.height + powerUp.radius) {
      powerUps.splice(i, 1);
      continue;
    }

    if (hitCircleRect(powerUp, player)) {
      collectPowerUp(powerUp);
      powerUps.splice(i, 1);
      continue;
    }
  }

  for (let i = targets.length - 1; i >= 0; i--) {
    const target = targets[i];
    if (!target) {
      continue;
    }

    target.y += target.speed;
    target.spin += 0.03;

    if (target.y > canvas.height + target.radius) {
      targets.splice(i, 1);
      if (game.level >= 70) {
        damagePlayer(target);
      }
      continue;
    }

    if (hitCircleRect(target, player)) {
      targets.splice(i, 1);
      damagePlayer(target);
      continue;
    }

    for (let b = bullets.length - 1; b >= 0; b--) {
      const bullet = bullets[b];
      if (!bullet || !hitCircleRect(target, bullet)) {
        continue;
      }

      target.hp -= bullet.damage;
      bullets.splice(b, 1);

      if (target.hp <= 0) {
        collectTarget(target);
        targets.splice(i, 1);
      }

      break;
    }
  }
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#03040d");
  gradient.addColorStop(0.48, "#130d32");
  gradient.addColorStop(1, "#050612");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const star of spaceStars) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.45 + star.size * 0.18})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
}

function drawRocket() {
  const look = shipLooks[game.selectedShip] || shipLooks.scout;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(look.width, look.height);

  ctx.shadowColor = "#9df6ff";
  ctx.shadowBlur = 18;
  ctx.fillStyle = look.body;
  ctx.beginPath();
  ctx.moveTo(0, -48);
  ctx.quadraticCurveTo(31, -18, 22, 35);
  ctx.lineTo(-22, 35);
  ctx.quadraticCurveTo(-31, -18, 0, -48);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = look.wing;
  ctx.beginPath();
  ctx.moveTo(-20, 12);
  ctx.lineTo(-48, 43);
  ctx.lineTo(-19, 34);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(20, 12);
  ctx.lineTo(48, 43);
  ctx.lineTo(19, 34);
  ctx.fill();

  ctx.fillStyle = look.window;
  ctx.beginPath();
  ctx.arc(0, -18, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = look.flame;
  ctx.beginPath();
  ctx.moveTo(-11, 37);
  ctx.lineTo(0, 66 + Math.sin(Date.now() / 70) * 9);
  ctx.lineTo(11, 37);
  ctx.fill();

  ctx.restore();
}

function drawBullet(bullet) {
  ctx.save();
  ctx.shadowColor = bullet.color;
  ctx.shadowBlur = 16;
  ctx.fillStyle = bullet.color;
  ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height);
  ctx.restore();
}

function drawTarget(target) {
  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.rotate(target.spin);
  ctx.shadowColor = target.color;
  ctx.shadowBlur = target.type === "blackhole" || target.type === "ton618" ? 24 : 16;

  if (target.type === "star" || target.type === "pulsar" || target.type === "neutron" || target.type === "redgiant" || target.type === "quasar") {
    drawStarShape(target.radius, target.color);
  } else if (target.type === "meteor") {
    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, target.radius * 1.2, target.radius * 0.82, 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (target.type === "planet") {
    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, target.radius * 1.35, target.radius * 0.42, -0.25, 0, Math.PI * 2);
    ctx.stroke();
  } else if (target.type === "galaxy") {
    ctx.strokeStyle = target.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, target.radius * 1.35, target.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff06a";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (target.type === "ufo") {
    ctx.fillStyle = "#dffbff";
    ctx.beginPath();
    ctx.ellipse(0, 4, target.radius * 1.45, target.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.arc(0, -6, target.radius * 0.62, Math.PI, 0, false);
    ctx.fill();
    ctx.fillStyle = "#ff69c9";
    ctx.beginPath();
    ctx.arc(-16, 8, 4, 0, Math.PI * 2);
    ctx.arc(0, 10, 4, 0, Math.PI * 2);
    ctx.arc(16, 8, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#020208";
    ctx.beginPath();
    ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = target.type === "ton618" ? "#ff69c9" : "#8b5cf6";
    ctx.lineWidth = target.type === "ton618" ? 7 : 5;
    ctx.stroke();

    if (target.type === "ton618") {
      ctx.strokeStyle = "#fff06a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, target.radius * 1.5, target.radius * 0.42, 0.25, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();

  if (target.armored) {
    drawArmor(target);
  }
}

function drawArmor(target) {
  const hpRatio = clamp(target.hp / target.maxHp, 0, 1);
  const armorColor = target.armorLevel >= 3 ? "#fff06a" : target.armorLevel === 2 ? "#ff69c9" : "#8efcff";

  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.strokeStyle = armorColor;
  ctx.lineWidth = 2 + target.armorLevel;
  ctx.shadowColor = armorColor;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(0, 0, target.radius + 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  ctx.beginPath();
  ctx.arc(0, 0, target.radius + 12, -Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();

  ctx.strokeStyle = armorColor;
  ctx.beginPath();
  ctx.arc(0, 0, target.radius + 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
  ctx.stroke();
  ctx.restore();
}

function drawStarShape(radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();

  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const pointRadius = i % 2 === 0 ? radius : radius * 0.45;
    const x = Math.cos(angle) * pointRadius;
    const y = Math.sin(angle) * pointRadius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
}

function draw() {
  drawBackground();

  for (const target of targets) {
    drawTarget(target);
  }

  for (const bullet of bullets) {
    drawBullet(bullet);
  }

  for (const powerUp of powerUps) {
    drawPowerUp(powerUp);
  }

  drawRocket();

  ctx.fillStyle = "rgba(247, 251, 255, 0.72)";
  ctx.font = "12px Arial";
  ctx.fillText(`Livello ${game.level} - ${getDifficultyLabel(game.level)}`, 18, 22);
  ctx.fillText(getActivePowerUpsText(), 18, 40);
  ctx.fillText("A/D o frecce: muovi | Spazio/click: spara", 18, canvas.height - 18);
}

function gameLoop(time) {
  try {
    update(time);
    draw();
  } catch (error) {
    console.error("Errore nel ciclo di gioco:", error);
  }

  requestAnimationFrame(gameLoop);
}

function buyOrEquipWeapon(weaponId, button) {
  const weapon = weapons[weaponId];

  if (!game.ownedWeapons.has(weaponId)) {
    if (game.coins < weapon.cost) {
      setMessage(`Ti servono ${weapon.cost - game.coins} monete per ${weapon.name}.`);
      return;
    }

    game.coins -= weapon.cost;
    game.ownedWeapons.add(weaponId);
    updateHud();
    setMessage(`${weapon.name} acquistato!`);
  } else {
    setMessage(`${weapon.name} equipaggiato.`);
  }

  game.activeWeapon = weaponId;
  updateShopButtons();
}

function updateShopButtons() {
  shopButtons.forEach((button) => {
    const weaponId = button.dataset.weapon;
    const weapon = weapons[weaponId];
    let priceEl = button.querySelector(".weapon-price");
    const isOwned = game.ownedWeapons.has(weaponId);
    const isActive = game.activeWeapon === weaponId;

    if (!priceEl) {
      priceEl = document.createElement("span");
      priceEl.className = "weapon-price";
      button.appendChild(priceEl);
    }

    button.classList.toggle("active", isActive);
    button.classList.toggle("bought", isOwned);

    if (isActive) {
      safeTextSet(priceEl, "Equipaggiata");
    } else if (isOwned) {
      safeTextSet(priceEl, "Usa");
    } else {
      safeTextSet(priceEl, `${weapon.cost} monete`);
    }
  });
}

function updateShipButtons() {
  shipButtons.forEach((button) => {
    const shipId = button.dataset.ship;
    const ship = ships[shipId];
    const isSelected = game.selectedShip === shipId;
    const isOwned = game.ownedShips.has(shipId);

    button.classList.toggle("active", isSelected);
    button.classList.toggle("bought", isOwned);

    const priceEl = button.querySelector("span");
    if (priceEl) {
      if (isSelected) {
        safeTextSet(priceEl, "Equipaggiata");
      } else if (isOwned) {
        safeTextSet(priceEl, "Seleziona");
      } else {
        safeTextSet(priceEl, `${ship.cost} monete`);
      }
    }
  });

  const ship = ships[game.selectedShip];
  if (ship) {
    safeTextSet(shipInfoEl, `${ship.name}: ${ship.description} (velocità ${ship.speed}, danno x${ship.damageMultiplier.toFixed(1)})`);
  }
}

function selectShip(shipId) {
  const ship = ships[shipId];
  if (!ship) {
    return;
  }

  if (!game.ownedShips.has(shipId)) {
    if (game.coins < ship.cost) {
      setMessage(`Ti servono ${ship.cost - game.coins} monete per acquistare ${ship.name}.`);
      return;
    }

    game.coins -= ship.cost;
    game.ownedShips.add(shipId);
    setMessage(`${ship.name} acquistata!`);
  } else {
    setMessage(`${ship.name} selezionata!`);
  }

  game.selectedShip = shipId;
  player.speed = ship.speed;
  updateHud();
}

function toggleShipShop() {
  if (!shipShop) {
    return;
  }

  shipShop.classList.toggle("hidden");
  if (!shipShop.classList.contains("hidden")) {
    updateShipButtons();
  }
}

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    keys.left = true;
  }

  if (event.code === "ArrowRight" || event.code === "KeyD") {
    keys.right = true;
  }

  if (event.code === "Space") {
    event.preventDefault();
    keys.shoot = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    keys.left = false;
  }

  if (event.code === "ArrowRight" || event.code === "KeyD") {
    keys.right = false;
  }

  if (event.code === "Space") {
    keys.shoot = false;
  }
});

if (canvas) {
  canvas.addEventListener("pointerdown", () => {
    keys.shoot = true;
  });

  canvas.addEventListener("pointerup", () => {
    keys.shoot = false;
  });
} else {
  console.warn("Game canvas not found: shooting input disabled.");
}

shopButtons.forEach((button) => {
  button.addEventListener("click", () => {
    buyOrEquipWeapon(button.dataset.weapon, button);
  });
});

shipButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectShip(button.dataset.ship);
  });
});

if (shipShopToggle) {
  shipShopToggle.addEventListener("click", toggleShipShop);
}

updateHud();

if (ctx && canvas) {
  requestAnimationFrame(gameLoop);
} else {
  console.error("Impossibile avviare il gioco: canvas o contesto grafico non trovati.");
}



window.addEventListener('touchmove', function(event) {
    if (event.touches.length > 0) {
        var touchX = event.touches[0].clientX;
  
        var mouseEvent = new MouseEvent('mousemove', {
            clientX: touchX,
            clientY: event.touches[0].clientY
        });
        window.dispatchEvent(mouseEvent);
    }
}, { passive: true });

