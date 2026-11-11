import { hashRand } from './world.mjs?v336';
import { undergroundTilesetImg, undergroundCracksFloorImg, undergroundObjectsImg } from './assets.mjs?v336';
import { playSfx } from './audio.mjs?v336';
import { tileAtWorld, chunks, chunkKey, spawnParticles } from './game-core.mjs?v336';
import { isMountainBlocked } from './mountains.mjs?v336';

const TILE=40,CHUNK_SIZE=8,CHUNK_PX=TILE*CHUNK_SIZE;
window.brokenWalls = window.brokenWalls || new Set();

const CAVE_PAD = 4, CAVE_W = CHUNK_SIZE + 2 * CAVE_PAD;
const caveCache = new Map();

function generateCaveChunk(cx, cy) {
  const ox = cx * CHUNK_SIZE - CAVE_PAD, oy = cy * CHUNK_SIZE - CAVE_PAD;
  let grid = new Uint8Array(CAVE_W * CAVE_W);
  // Step 1: Deterministic noise (45% walls)
  for (let y = 0; y < CAVE_W; y++) {
    for (let x = 0; x < CAVE_W; x++) {
      grid[y * CAVE_W + x] = hashRand(ox + x, oy + y, 888) < 0.45 ? 1 : 0;
    }
  }
  // Step 2: Cellular automata (4 iterations: roguelike B5678/S45678 standard)
  for (let iter = 0; iter < 4; iter++) {
    const next = new Uint8Array(CAVE_W * CAVE_W);
    for (let y = 0; y < CAVE_W; y++) {
      for (let x = 0; x < CAVE_W; x++) {
        let walls = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= CAVE_W || ny < 0 || ny >= CAVE_W) {
              walls += (hashRand(ox + nx, oy + ny, 888) < 0.45 ? 1 : 0);
            } else {
              walls += grid[ny * CAVE_W + nx];
            }
          }
        }
        if (grid[y * CAVE_W + x] === 1) {
          next[y * CAVE_W + x] = walls >= 4 ? 1 : 0;  // Survive
        } else {
          next[y * CAVE_W + x] = walls >= 5 ? 1 : 0;  // Born
        }
      }
    }
    grid = next;
  }
  // Step 3: Clean up orphan 1x1 wall spikes and fill isolated 1x1 void holes
  const cleaned = new Uint8Array(grid);
  for (let y = 1; y < CAVE_W - 1; y++) {
    for (let x = 1; x < CAVE_W - 1; x++) {
      const up = grid[(y - 1) * CAVE_W + x], down = grid[(y + 1) * CAVE_W + x];
      const left = grid[y * CAVE_W + x - 1], right = grid[y * CAVE_W + x + 1];
      const ortho = up + down + left + right;
      if (grid[y * CAVE_W + x] === 1 && ortho <= 1) {
        cleaned[y * CAVE_W + x] = 0;
      } else if (grid[y * CAVE_W + x] === 0 && ortho === 4) {
        cleaned[y * CAVE_W + x] = 1;
      }
    }
  }
  grid = cleaned;
  const tiles = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
  for (let y = 0; y < CHUNK_SIZE; y++) {
    for (let x = 0; x < CHUNK_SIZE; x++) {
      tiles[y * CHUNK_SIZE + x] = grid[(y + CAVE_PAD) * CAVE_W + (x + CAVE_PAD)];
    }
  }
  return tiles;
}

function getCaveTile(wx, wy) {
  const cx = Math.floor(wx / CHUNK_SIZE), cy = Math.floor(wy / CHUNK_SIZE);
  const k = `${cx},${cy}`;
  let ch = caveCache.get(k);
  if (!ch) {
    ch = generateCaveChunk(cx, cy);
    if (caveCache.size > 2000) caveCache.clear();
    caveCache.set(k, ch);
  }
  const tx = wx - cx * CHUNK_SIZE, ty = wy - cy * CHUNK_SIZE;
  return ch[ty * CHUNK_SIZE + tx] === 1;
}

window.isTileBlocked = function(tx, ty) {
  if (tx <= 100000 || tx >= 300000) return false;
  if (window.brokenWalls && window.brokenWalls.size > 0 && window.brokenWalls.has(`${tx},${ty}`)) return false;
  const dung = window.DUNGEON1_DATA;
  if (dung) {
    const dtx = tx - 200000;
    const dty = ty - 200000;
    if (dtx < 0 || dtx >= dung.width) return true;
    if (dty < 0 || dty >= dung.height) return true;
    return dung.blocked[dty][dtx] === '1';
  }
  return getCaveTile(tx, ty);
};

window.isLifeWellBlocked = function(x, y, w, h) {
  if (!window.activeLifeWells || window.activeLifeWells.length === 0) return false;
  const ew = w || 30;
  const eh = h || 40;
  const footBottom = y + eh;
  const footTop = footBottom - 12;
  const cx = x + ew / 2;
  const footLeft = cx - Math.min(14, ew * 0.4);
  const footRight = cx + Math.min(14, ew * 0.4);

  for (let i = 0; i < window.activeLifeWells.length; i++) {
    const well = window.activeLifeWells[i];
    const bx1 = well.x - 28;
    const bx2 = well.x + 28;
    const by1 = well.y - 34;
    const by2 = well.y - 6;

    if (footRight >= bx1 && footLeft <= bx2 && footBottom >= by1 && footTop <= by2) {
      return true;
    }
  }
  return false;
};

window.isAreaBlocked = function(x, y, w, h) {
  // Pre-rendered Mountain Wall collision (solid impassable rectangle)
  if (isMountainBlocked(x, y, w, h)) {
    return true;
  }
  // Well of Life solid stone base collision (mobs and player cannot walk over it)
  if (window.isLifeWellBlocked && window.isLifeWellBlocked(x, y, w, h)) {
    return true;
  }
  // Dream Shop collision (prevents player and mobs from walking on/inside the shop)
  const shopX = 600000 * TILE, shopY = 600000 * TILE;
  const ew = w || 30, eh = h || 40;
  const ex1 = x, ex2 = x + ew;
  const ey1 = y + eh * 0.35, ey2 = y + eh;
  if (ex2 > shopX - 175 && ex1 < shopX + 175 && ey2 > shopY - 260 && ey1 < shopY - 15) {
    return true;
  }

  if (x <= 100000 * TILE || x >= 300000 * TILE) return false;
  // Top-down 2.5D collision box (feet / base contact):
  // Compact 16px wide box centered horizontally with 8px height at floor contact
  const boxW = Math.min(16, (w || 30) * 0.55);
  const cx = x + (w || 30) / 2;
  const left = cx - boxW / 2;
  const right = cx + boxW / 2 - 1;
  const footBottom = y + (h || 42) - 1;
  const footTop = footBottom - 7;

  const tx1 = Math.floor(left / TILE);
  const ty1 = Math.floor(footTop / TILE);
  const tx2 = Math.floor(right / TILE);
  const ty2 = Math.floor(footBottom / TILE);

  for (let ty = ty1; ty <= ty2; ty++) {
    for (let tx = tx1; tx <= tx2; tx++) {
      if (window.isTileBlocked(tx, ty)) return true;
    }
  }
  return false;
};

window.isWallTile = function(tx, ty) {
  return window.isTileBlocked(tx, ty);
};

window.isWallCollision = function(x, y, w, h) {
  return window.isAreaBlocked(x, y, w, h);
};

window.isWaterTile = function(tx, ty) {
  if (tx > 100000 && tx < 300000) {
    const dung = window.DUNGEON1_DATA;
    if (dung && dung.water) {
      const dtx = tx - 200000, dty = ty - 200000;
      if (dtx >= 0 && dtx < dung.width && dty >= 0 && dty < dung.height) {
        return dung.water[dty][dtx] === '1';
      }
    }
    return false;
  }
  return typeof tileAtWorld === 'function' ? tileAtWorld(tx, ty) > 0 : false;
};

function drawUndergroundFloor(ccx, sx, sy, wx, wy) {
  if (undergroundTilesetImg.complete && undergroundTilesetImg.naturalWidth > 0) {
    // Official dungeon floor tiles from Tiled_files/walls_floor.webp (GID 515 / 627)
    const isDark = hashRand(wx, wy, 881) < 0.12;
    if (isDark) {
      ccx.drawImage(undergroundTilesetImg, 192, 224, 16, 16, sx, sy, TILE, TILE);
    } else {
      ccx.drawImage(undergroundTilesetImg, 32, 128, 16, 16, sx, sy, TILE, TILE);
    }
  } else {
    ccx.fillStyle = '#4a4758';
    ccx.fillRect(sx, sy, TILE, TILE);
  }
  // Soft ambient contact shadow below north walls
  const isW = (x, y) => window.isWallTile(x, y);
  if (isW(wx, wy - 1)) {
    const g = ccx.createLinearGradient(0, sy, 0, sy + 14);
    g.addColorStop(0, 'rgba(10,8,22,0.45)');
    g.addColorStop(1, 'rgba(10,8,22,0)');
    ccx.fillStyle = g;
    ccx.fillRect(sx, sy, TILE, 14);
  }
}

function drawUndergroundRubble(ccx, sx, sy, wx, wy) {
  // 1. Authentic floor fracture decal from decorative_cracks_floor.webp
  if (undergroundCracksFloorImg.complete && undergroundCracksFloorImg.naturalWidth > 0) {
    const crackVariants = [
      { x: 64, y: 128 },
      { x: 32, y: 160 },
      { x: 0, y: 176 },
      { x: 48, y: 176 }
    ];
    const cv = crackVariants[Math.floor(hashRand(wx, wy, 903) * crackVariants.length)];
    ccx.drawImage(undergroundCracksFloorImg, cv.x, cv.y, 16, 16, sx, sy, TILE, TILE);
  }

  // 2. Real rock & debris overlay from Objects.webp (small rocks, pebbles, shattered masonry)
  if (undergroundObjectsImg.complete && undergroundObjectsImg.naturalWidth > 0) {
    const rockTiles = [
      { x: 224, y: 80 }, // Medium rock cluster
      { x: 240, y: 80 }, // Small stone cluster
      { x: 32, y: 128 }, // Shattered rubble rocks
      { x: 48, y: 128 }, // Loose stone fragments
      { x: 64, y: 128 }  // Heavy rubble pile
    ];
    const rk = rockTiles[Math.floor(hashRand(wx, wy, 442) * rockTiles.length)];
    ccx.drawImage(undergroundObjectsImg, rk.x, rk.y, 16, 16, sx, sy, TILE, TILE);
  }

  // 3. Scattered broken wall bricks with drop shadows (distinct visual evidence of collapsed wall)
  const h1 = hashRand(wx, wy, 117);
  const h2 = hashRand(wx, wy, 219);
  const h3 = hashRand(wx, wy, 331);

  // Brick 1 (upper chunk)
  const b1x = sx + 2 + Math.floor(h1 * 4);
  const b1y = sy + 2 + Math.floor(h2 * 3);
  ccx.fillStyle = 'rgba(10, 8, 20, 0.45)';
  ccx.fillRect(b1x + 1, b1y + 1, 4, 3); // drop shadow
  ccx.fillStyle = '#353347';
  ccx.fillRect(b1x, b1y, 4, 3);        // brick body
  ccx.fillStyle = '#454459';
  ccx.fillRect(b1x, b1y, 3, 1);        // brick highlight

  // Brick 2 (lower chunk)
  const b2x = sx + 8 + Math.floor(h2 * 3);
  const b2y = sy + 7 + Math.floor(h3 * 3);
  ccx.fillStyle = 'rgba(10, 8, 20, 0.45)';
  ccx.fillRect(b2x + 1, b2y + 1, 4, 3); // drop shadow
  ccx.fillStyle = '#262536';
  ccx.fillRect(b2x, b2y, 4, 3);        // darker stone chunk
  ccx.fillStyle = '#38374a';
  ccx.fillRect(b2x, b2y, 3, 1);        // stone highlight

  // Fine mortar pebbles
  ccx.fillStyle = '#5c5b70';
  ccx.fillRect(sx + 3 + Math.floor(h3 * 7), sy + 11, 2, 1);
  ccx.fillRect(sx + 12, sy + 3 + Math.floor(h1 * 7), 1, 2);
}

function drawAutotiledWall(ccx, sx, sy, wx, wy) {
  // Always render base floor first to eliminate transparent gaps or black canvas bleed
  drawUndergroundFloor(ccx, sx, sy, wx, wy);

  if (!undergroundTilesetImg.complete || undergroundTilesetImg.naturalWidth <= 0) {
    ccx.fillStyle = '#3a3247';
    ccx.fillRect(sx, sy, TILE, TILE);
    return;
  }
  
  const isW = (x, y) => window.isWallTile(x, y);
  const hasN = isW(wx, wy - 1);
  const hasS = isW(wx, wy + 1);
  const hasW = isW(wx - 1, wy);
  const hasE = isW(wx + 1, wy);

  // Column determination from Tiled_files/walls_floor.webp (17 cols):
  // col 1 (16px) = Left cap (East neighbor of broken wall)
  // col 2 (32px) = Mid wall
  // col 3 (48px) = Right cap (West neighbor of broken wall)
  let col = 2; // Mid wall
  let isPillar = false;
  if (!hasW && hasE) {
    col = 1; // Left end cap
  } else if (hasW && !hasE) {
    col = 3; // Right end cap
  } else if (!hasW && !hasE) {
    col = 2; // Pillar / isolated column
    isPillar = true;
  }

  // Row determination:
  // row 1 (16px) = Top rim / coping (South neighbor of broken wall)
  // row 2 (32px) = Main wall face
  // row 4 (64px) = Wall base contacting floor (North neighbor of broken wall)
  let row = 2;
  if (!hasN && hasS) {
    row = 1; // Top coping rim facing north (South neighbor of broken hole)
  } else if (hasN && !hasS) {
    row = 4; // Base contacting floor facing south (North neighbor of broken hole)
  } else if (!hasN && !hasS) {
    // Vertically isolated wall: check if breach was to North or South
    if (window.brokenWalls.has(`${wx},${wy - 1}`)) {
      row = 1; // South neighbor of broken tile -> Top rim
    } else {
      row = 4; // North neighbor of broken tile -> Base
    }
  } else {
    row = 2; // Middle vertical face (hasN && hasS)
  }

  ccx.drawImage(undergroundTilesetImg, col * 16, row * 16, 16, 16, sx, sy, TILE, TILE);

  if (isPillar) {
    ccx.fillStyle = 'rgba(12, 10, 20, 0.45)';
    ccx.fillRect(sx, sy, 2, TILE);
    ccx.fillRect(sx + TILE - 2, sy, 2, TILE);
  }
}

function getUndergroundWallTile(wx, wy) {
  const isW = (x, y) => window.isWallTile(x, y);
  const hasN = isW(wx, wy - 1);
  const hasS = isW(wx, wy + 1);
  const hasW = isW(wx - 1, wy);
  const hasE = isW(wx + 1, wy);

  let col = 2;
  if (!hasW && hasE) col = 1;
  else if (hasW && !hasE) col = 3;

  let row = 2;
  if (!hasN && hasS) {
    row = 1; // Top coping rim facing north
  } else if (hasN && !hasS) {
    row = 4; // Base contacting floor facing south
  } else if (!hasN && !hasS) {
    if (window.brokenWalls.has(`${wx},${wy - 1}`)) {
      row = 1;
    } else {
      row = 4;
    }
  } else {
    row = 2;
  }

  return { srcX: col * 16, srcY: row * 16 };
}

window.breakWallAt = function(tx, ty) {
  if (window.brokenWalls.has(`${tx},${ty}`)) return false;
  window.brokenWalls.add(`${tx},${ty}`);

  // 1. Update the grid data (Dungeon 1)
  const dung = window.DUNGEON1_DATA;
  if (dung) {
    const dtx = tx - 200000;
    const dty = ty - 200000;
    if (dtx >= 0 && dtx < dung.width && dty >= 0 && dty < dung.height) {
      const row = dung.blocked[dty];
      if (row) {
        dung.blocked[dty] = row.substring(0, dtx) + '0' + row.substring(dtx + 1);
      }
    }
  }

  // 2. Redraw the broken tile AND its 4 cardinal neighbors (W, E, N, S)
  const coordsToUpdate = [
    { x: tx, y: ty, isCenter: true },
    { x: tx - 1, y: ty, isCenter: false },
    { x: tx + 1, y: ty, isCenter: false },
    { x: tx, y: ty - 1, isCenter: false },
    { x: tx, y: ty + 1, isCenter: false }
  ];

  for (const pos of coordsToUpdate) {
    const atx = pos.x, aty = pos.y;
    const acx = Math.floor(atx / CHUNK_SIZE), acy = Math.floor(aty / CHUNK_SIZE);
    const ach = chunks.get(chunkKey(acx, acy));
    if (ach) {
      if (ach.tall) {
        ach.tall = ach.tall.filter(t => !(t.tx === atx && t.ty === aty && t.isWall && !window.isWallTile(atx, aty)));
      }
      if (ach.canvas) {
        const ccx = ach.canvas.getContext('2d');
        const sx = (atx - acx * CHUNK_SIZE) * TILE;
        const sy = (aty - acy * CHUNK_SIZE) * TILE;
        ccx.clearRect(sx, sy, TILE, TILE);
        if (pos.isCenter) {
          drawUndergroundFloor(ccx, sx, sy, atx, aty);
          drawUndergroundRubble(ccx, sx, sy, atx, aty);
        } else if (window.isWallTile(atx, aty)) {
          drawAutotiledWall(ccx, sx, sy, atx, aty);
        } else {
          drawUndergroundFloor(ccx, sx, sy, atx, aty);
          if (window.brokenWalls.has(`${atx},${aty}`)) {
            drawUndergroundRubble(ccx, sx, sy, atx, aty);
          }
        }
      }
    }
  }

  spawnParticles(tx * TILE + TILE / 2, ty * TILE + TILE / 2, '#888899', 18);
  playSfx('confirm');
  return true;
};

export { TILE, CHUNK_SIZE, CHUNK_PX, CAVE_PAD, CAVE_W, caveCache, generateCaveChunk, getCaveTile, drawUndergroundFloor, drawUndergroundRubble, drawAutotiledWall, getUndergroundWallTile };
