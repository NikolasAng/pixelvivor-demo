import { MOUNTAIN_TILE_IMAGES, MOUNTAIN_BIOME_ASSETS } from './assets.mjs?v336';

// 64x64 sub-tile collision grid (80 cols x 72 rows = 5760 bits / 720 bytes)
// Extracted from pixel alpha channels of the 90 mountain tiles.
// Allows natural access into the hollow inner valley and passage through the southern gorge.
const COLLISION_B64 = 'gMCHwIfAhwAAAPD///////8PAADw////////HwAA+P///////z8AAPz///////8/AAD+////////fwAA/v////////8AAP//////////AAD//////////wAA/v/+//7//v8AAP7//v/+//7/AQD8P/w//D/8/wcA/n/8P/w//P8HAP5/8A/wD/D/BwD//4ABgAGA/w8A//8AAAAAgP8fAP//AAAAAMD/PwD/fwAAAADA/z8A/n8AAAAAwP8/APw/AAAAAMD/HwD8PwAAAACA/x8A/n8AAAAAAP8PAP7/AAAAAID/HwD//wAAAADA/x8A//8AAAAAwP8/AP7/AQAAAMD/PwD+/wEAAADA/z8A/P8BAAAAwP8/APz/AwAAAID/PwDw/wcAAAAA/38A8P8PAAAAAPh/APD/DwAAAAD4/wDw/w8AAAAA/P8B8P8PAAAAAPz/AeD/HwAAAAD8/wPA/x8AAAAA/P8BgP8/AAAAAPz/AQD+fwAAAAD4/wEA/v8AAAAA8P8BAP//AAAAAOD/AwD//wAAAADg/wcA/v8AAAAA8P8HAP9/AAAAAPD/DwD/PwAAAADw/w/A/z8AAAAA8P8HwP8fAAAAAPD/B+D/HwAAAADg/wPg/x8AAAAA8P8DwP8fAAAAAPj/AOD/HwAAAAD8/wHA/w8AAAAA/v8BgP8HAAAAgP//A8D/jwAAAMD//wHA//8HAADg//8B4P//DwAA8P//AOD//x+AA/j//wDA//8fwB/4/z8AwP//P+A//P8PAID//3/wP/z/AwAA////8H/8/wMAAPz///x//P8BAAAQ///8//z/AQAAAP///v/5/wAAAAD/f/7/8f8AAAAA/D/+/4EfAAAAAPw//v8AAgAAAADgD/z/AAAAAAAAgAD4fwAAAAAAAAAA8B8AAAAAAAAAAIAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

let mountainCollisionBytes = null;
function getCollisionBytes() {
  if (mountainCollisionBytes) return mountainCollisionBytes;
  if (typeof atob !== 'undefined') {
    const bin = atob(COLLISION_B64);
    mountainCollisionBytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) mountainCollisionBytes[i] = bin.charCodeAt(i);
  } else if (typeof Buffer !== 'undefined') {
    mountainCollisionBytes = new Uint8Array(Buffer.from(COLLISION_B64, 'base64'));
  } else {
    mountainCollisionBytes = new Uint8Array(720);
  }
  return mountainCollisionBytes;
}

function hashRand(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

// 5 Distinct Mountain Biome Locations Across the World
export const MOUNTAIN_BIOMES = [
  {
    id: 1,
    name: "Alchemist's Caldera",
    biomeName: 'Fungal Wastes',
    targetBiome: 'fungalWastes',
    startX: 2000,
    startY: 1500,
    w: 5120,
    h: 4608,
    valleyCenter: { x: 2000 + 2560, y: 1500 + 1920 }, // 4560, 3420
    entrance: { x: 2000 + 1890, y: 1500 + 4400 },     // 3890, 5900
    treeAsset: 'madAlchemistTree',
    treeScale: 0.62, // Colossal 1.63x scaling
    hasAlchemist: true,
    mobs: ['cyclops_mountain1', 'unicorn_mountain1'],
    landmarks: [
      { asset: 'guardianMountain', relX: 1750, relY: 4350, scale: 0.38 },
      { asset: 'mountainShrine', relX: 2040, relY: 4350, scale: 0.30 }
    ]
  },
  {
    id: 2,
    name: "The Whispering Grove",
    biomeName: 'Deep Forest',
    targetBiome: 'forest',
    startX: -26000,
    startY: -22000,
    w: 5120,
    h: 4608,
    valleyCenter: { x: -26000 + 2560, y: -22000 + 1920 }, // -23440, -20080
    entrance: { x: -26000 + 1890, y: -22000 + 4400 },     // -24110, -17600
    treeAsset: 'mountainTree1',
    treeScale: 0.62, // Colossal 1.63x scaling
    hasAlchemist: false,
    mobs: ['drake_mountain2', 'warewoolf_mountain2'],
    landmarks: [
      { asset: 'guardianMountain', relX: 1750, relY: 4350, scale: 0.38 },
      { asset: 'mountainShrine', relX: 2040, relY: 4350, scale: 0.30 }
    ]
  },
  {
    id: 3,
    name: "The Arcane Sanctuary",
    biomeName: 'Magic Forest',
    targetBiome: 'magicForest',
    startX: 32000,
    startY: -20000,
    w: 5120,
    h: 4608,
    valleyCenter: { x: 32000 + 2560, y: -20000 + 1920 }, // 34560, -18080
    entrance: { x: 32000 + 1890, y: -20000 + 4400 },     // 33890, -15600
    treeAsset: 'mountainTree3',
    treeScale: 0.62, // Colossal 1.63x scaling
    hasAlchemist: false,
    mobs: ['icegiant_mountain3', 'minotaur_mountain3'],
    landmarks: [
      { asset: 'guardianMountain', relX: 1750, relY: 4350, scale: 0.38 },
      { asset: 'mountainShrine', relX: 2040, relY: 4350, scale: 0.30 }
    ]
  },
  {
    id: 4,
    name: "The Dread Crags",
    biomeName: 'Deadlands',
    targetBiome: 'deadlands',
    startX: -32000,
    startY: -45000,
    w: 5120,
    h: 4608,
    valleyCenter: { x: -32000 + 2560, y: -45000 + 1920 }, // -29440, -43080
    entrance: { x: -32000 + 1890, y: -45000 + 4400 },     // -30110, -40600
    treeAsset: 'mountainTree4',
    treeScale: 0.62, // Colossal 1.63x scaling
    hasAlchemist: false,
    mobs: ['berserker_mountain4', 'flyguardian_mountain4', 'grifin_mountain4'],
    landmarks: [
      { asset: 'guardianMountain', relX: 1750, relY: 4350, scale: 0.38 },
      { asset: 'mountainShrine', relX: 2040, relY: 4350, scale: 0.30 }
    ]
  },
  {
    id: 5,
    name: "The Frostpeak Hollow",
    biomeName: 'Snow & Crystal Peaks',
    targetBiome: 'snow',
    startX: 52000,
    startY: 25000,
    w: 5120,
    h: 4608,
    valleyCenter: { x: 52000 + 2560, y: 25000 + 1920 }, // 54560, 26920
    entrance: { x: 52000 + 1890, y: 25000 + 4400 },     // 53890, 29400
    treeAsset: 'mushroomTree2',
    treeScale: 0.62, // Colossal 1.63x scaling
    hasAlchemist: false,
    hasFrostHermit: true,
    mobs: ['flyonehanddrak_mountain5', 'reddragiondrake_mountain5', 'threeheaded_mountain5'],
    landmarks: [
      { asset: 'guardianMountain', relX: 1750, relY: 4350, scale: 0.38 },
      { asset: 'mountainShrine', relX: 2040, relY: 4350, scale: 0.30 }
    ]
  }
];

// Backwards-compatible primary definitions
export const MOUNTAIN_WALL = MOUNTAIN_BIOMES[0];
export const MOUNTAIN_VALLEY_CENTER = MOUNTAIN_BIOMES[0].valleyCenter;
export const MOUNTAIN_ENTRANCE = MOUNTAIN_BIOMES[0].entrance;

/**
 * Returns true if the given world coordinates lie inside any of the 5 mountain biome areas.
 * Used to keep procedural chunk artifacts (water, caves, random relics) outside.
 */
export function isInsideAnyMountain(x, y, pad = 80) {
  for (let b = 0; b < MOUNTAIN_BIOMES.length; b++) {
    const mb = MOUNTAIN_BIOMES[b];
    const extraSouth = Math.max(700, pad); // Generous clearance in front of southern entrance
    if (x >= mb.startX - pad && x <= mb.startX + mb.w + pad &&
        y >= mb.startY - pad && y <= mb.startY + mb.h + extraSouth) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a world position is within the southern entrance gorge canyon or the approach just outside it.
 */
export function isNearMountainEntrancePass(x, y, dist = 360) {
  for (let b = 0; b < MOUNTAIN_BIOMES.length; b++) {
    const mb = MOUNTAIN_BIOMES[b];
    const ex = mb.startX + 1890;
    const ey1 = mb.startY + 3200;
    const ey2 = mb.startY + 5400;
    if (Math.abs(x - ex) <= dist && y >= ey1 && y <= ey2) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a world position is within the clearing reserved for the Colossal Centerpiece Tree & Mad Alchemist.
 */
export function isNearMountainCenterpiece(x, y, radius = 200) {
  for (let b = 0; b < MOUNTAIN_BIOMES.length; b++) {
    const mb = MOUNTAIN_BIOMES[b];
    if (Math.hypot(x - mb.valleyCenter.x, y - mb.valleyCenter.y) <= radius) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the mountain biome definition object for a world position, if inside its bounds.
 */
export function getMountainBiomeObjectAt(x, y, pad = 80) {
  for (let b = 0; b < MOUNTAIN_BIOMES.length; b++) {
    const mb = MOUNTAIN_BIOMES[b];
    const extraSouth = Math.max(700, pad);
    if (x >= mb.startX - pad && x <= mb.startX + mb.w + pad &&
        y >= mb.startY - pad && y <= mb.startY + mb.h + extraSouth) {
      return mb;
    }
  }
  return null;
}

/**
 * Returns the specific mob types assigned to this mountain biome.
 */
export function getMountainMobsAt(x, y) {
  const mb = getMountainBiomeObjectAt(x, y, 120);
  return mb ? mb.mobs : null;
}

/**
 * Returns continuous mountain biome influence weight [0.0, 1.0] and metadata for any world coordinate.
 * - 1.0: Deep inside the caldera bowl or entrance gorge canyon.
 * - 0.0: Outside in the native world biome (no rectangular boundaries!).
 * - (0.0, 1.0): Smooth organic transition zone with natural boundary wave noise.
 */
export function getMountainInfluence(x, y) {
  for (let b = 0; b < MOUNTAIN_BIOMES.length; b++) {
    const mb = MOUNTAIN_BIOMES[b];

    // Fast broadphase AABB rejection
    if (x < mb.startX - 800 || x > mb.startX + mb.w + 800 ||
        y < mb.startY - 800 || y > mb.startY + mb.h + 1800) {
      continue;
    }

    const relX = x - mb.startX;
    const relY = y - mb.startY;
    const gorgeX = 1890;

    // Organic continuous boundary wave noise (frequency ~ 0.0028, amplitude ~ 85px)
    const nX = x * 0.0028, nY = y * 0.0028;
    const noiseOffset = Math.sin(nX * 3.1 + nY * 1.7) * 55 + Math.cos(nX * 1.3 - nY * 2.8) * 45;

    // 1. Southern Entrance Gorge Corridor and Outer Fan Transition
    if (relY >= 2800 && relY <= 5600) {
      const dGorgeX = Math.abs(relX - gorgeX);
      if (relY <= 4350) {
        // Inside the canyon gorge pass
        if (dGorgeX <= 380) return { weight: 1.0, targetBiome: mb.targetBiome, mb };
        if (dGorgeX <= 560) {
          const raw = (560 - dGorgeX) / 180;
          const smooth = raw * raw * (3 - 2 * raw);
          return { weight: Math.max(0, Math.min(1, smooth)), targetBiome: mb.targetBiome, mb };
        }
      } else {
        // Exiting the gorge past the entrance monuments into the outer world (relY 4350 -> 5450)
        const exitProgress = (relY - 4350) / 1100; // 0.0 at statues -> 1.0 in open field
        if (exitProgress < 1.0) {
          const fanWidth = 560 + exitProgress * 640 + noiseOffset * 0.6;
          if (dGorgeX < fanWidth) {
            const xFactor = Math.max(0, 1 - (dGorgeX / fanWidth));
            const yFactor = Math.max(0, 1 - exitProgress);
            const rawW = Math.max(0, Math.min(1.0, xFactor * yFactor));
            const smoothW = rawW * rawW * (3 - 2 * rawW); // Smoothstep C1 continuity
            if (smoothW > 0.002) {
              return { weight: Math.max(0, Math.min(1, smoothW)), targetBiome: mb.targetBiome, mb };
            }
          }
        }
      }
    }

    // 2. Inner Caldera Bowl & Mountain Rock Ring
    const dx = (relX - 2560) / 1.16;
    const dy = (relY - 1920);
    const dist = Math.hypot(dx, dy) + noiseOffset;

    // Deep inside caldera
    if (dist <= 1300) {
      return { weight: 1.0, targetBiome: mb.targetBiome, mb };
    }

    // Falloff across the rock ring to the outside edge of the mountain (radial C1 smoothstep, no Y-cutoff)
    if (dist < 2350) {
      const t = (dist - 1300) / (2350 - 1300);
      let rawW = Math.max(0, Math.min(1.0, 1 - t));
      const smoothW = rawW * rawW * (3 - 2 * rawW);
      if (smoothW > 0.005) {
        return { weight: Math.max(0, Math.min(1, smoothW)), targetBiome: mb.targetBiome, mb };
      }
    }
  }

  return null;
}

/**
 * Returns the target biome type for any point inside a mountain formation (e.g. 'fungalWastes', 'forest', 'magicForest', 'deadlands', 'snow').
 * Seamlessly resolves at the 50% midpoint of the continuous transition zone.
 */
export function getMountainBiomeAt(x, y) {
  const inf = getMountainInfluence(x, y);
  return (inf && inf.weight >= 0.50) ? inf.targetBiome : null;
}

// The Mad Alchemist NPC (sits at the base of colossal mad_alchemist_tree5 in Biome 1)
export const MAD_ALCHEMIST_NPC = {
  id: 'mad_alchemist',
  role: 'mad_alchemist',
  name: 'Mad Alchemist',
  title: 'Mad Alchemist',
  actionLabel: 'Talk',
  x: MOUNTAIN_BIOMES[0].valleyCenter.x + 56,
  y: MOUNTAIN_BIOMES[0].valleyCenter.y + 18,
  sprite: 'mad_alchemist',
  portraitImg: 'assets/mountain biom/mad_alchemist.webp',
  dialogue: "Ah, you found me! I was wondering when you'd show up. Have a seat, we have much to discuss."
};

export function getMadAlchemistNPC() {
  return MAD_ALCHEMIST_NPC;
}

// Frost Hermit Commander Alden NPC (keeper of the Fifth Seal inside Mountain 5: The Frostpeak Hollow, Full Game only)
export const FROST_HERMIT_NPC = {
  id: 'frost_hermit_alden',
  role: 'frost_hermit',
  name: 'Commander Alden',
  title: 'The Frost Hermit · Keeper of the Fifth Seal',
  actionLabel: 'Talk',
  x: MOUNTAIN_BIOMES[4].valleyCenter.x + 56,
  y: MOUNTAIN_BIOMES[4].valleyCenter.y + 18,
  sprite: 'npc_alden',
  portraitSprite: 'npc_alden',
  portraitImg: 'assets/monsters_new/npc_alden_anim/preview.webp?v332'
};

export function getFrostHermitNPC() {
  return FROST_HERMIT_NPC;
}

if (typeof window !== 'undefined') {
  window.MOUNTAIN_BIOMES = MOUNTAIN_BIOMES;
  window.MOUNTAIN_WALL = MOUNTAIN_WALL;
  window.MOUNTAIN_VALLEY_CENTER = MOUNTAIN_VALLEY_CENTER;
  window.MOUNTAIN_ENTRANCE = MOUNTAIN_ENTRANCE;
  window.isInsideAnyMountain = isInsideAnyMountain;
  window.isNearMountainEntrancePass = isNearMountainEntrancePass;
  window.isNearMountainCenterpiece = isNearMountainCenterpiece;
  window.getMountainInfluence = getMountainInfluence;
  window.getMountainBiomeAt = getMountainBiomeAt;
  window.getMountainBiomeObjectAt = getMountainBiomeObjectAt;
  window.getMountainMobsAt = getMountainMobsAt;
  window.MAD_ALCHEMIST_NPC = MAD_ALCHEMIST_NPC;
  window.getMadAlchemistNPC = getMadAlchemistNPC;
  window.FROST_HERMIT_NPC = FROST_HERMIT_NPC;
  window.getFrostHermitNPC = getFrostHermitNPC;
  window.isMountainBlocked = isMountainBlocked;
  window.getVisibleMountainTiles = getVisibleMountainTiles;
  window.getVisibleMountainEntities = getVisibleMountainEntities;
}

/**
 * Checks collision against all 5 mountain biome bitmasks (64x64 cell resolution)
 * and physical entity trunks/bases.
 * Mountain rock faces block movement; the hollow inner valleys and the southern gorges remain walkable.
 */
export function isMountainBlocked(x, y, w = 30, h = 40) {
  const bytes = getCollisionBytes();
  const CELL_SIZE = 64;
  const COLS = 80;
  const ROWS = 72;

  for (let b = 0; b < MOUNTAIN_BIOMES.length; b++) {
    const mb = MOUNTAIN_BIOMES[b];
    const relX1 = x - mb.startX;
    const relY1 = y - mb.startY;
    const relX2 = relX1 + w;
    const relY2 = relY1 + h;

    // Fast broadphase AABB check for this mountain instance
    if (relX2 <= 0 || relX1 >= mb.w || relY2 <= 0 || relY1 >= mb.h) {
      continue;
    }

    // Colossal Centerpiece Tree trunk collision
    const tcx = mb.valleyCenter.x, tcy = mb.valleyCenter.y;
    if (x + w > tcx - 48 && x < tcx + 48 && y + h > tcy - 16 && y < tcy + 22) {
      return true;
    }

    // Entrance landmarks collision (Guardian Mountain statue & Mountain Shrine)
    for (let l = 0; l < mb.landmarks.length; l++) {
      const lm = mb.landmarks[l];
      const lx = mb.startX + lm.relX, ly = mb.startY + lm.relY;
      const rw = lm.asset === 'guardianMountain' ? 36 : 44;
      if (x + w > lx - rw && x < lx + rw && y + h > ly - 14 && y < ly + 18) {
        return true;
      }
    }

    const c1 = Math.max(0, Math.floor(relX1 / CELL_SIZE));
    const c2 = Math.min(COLS - 1, Math.floor((relX2 - 1) / CELL_SIZE));
    const r1 = Math.max(0, Math.floor(relY1 / CELL_SIZE));
    const r2 = Math.min(ROWS - 1, Math.floor((relY2 - 1) / CELL_SIZE));

    for (let r = r1; r <= r2; r++) {
      const rowOffset = r * COLS;
      for (let c = c1; c <= c2; c++) {
        const idx = rowOffset + c;
        if ((bytes[idx >> 3] & (1 << (idx & 7))) !== 0) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Returns the subset of tiles from all 5 mountain formations currently within the camera viewport.
 */
export function getVisibleMountainTiles(camX, camY, viewW, viewH) {
  const visible = [];
  const tileSize = 512;
  const cols = 10, rows = 9;
  const totalTiles = cols * rows; // 90

  for (let b = 0; b < MOUNTAIN_BIOMES.length; b++) {
    const mb = MOUNTAIN_BIOMES[b];
    const { startX, startY, w, h } = mb;

    // Fast viewport intersection for this entire mountain biome
    if (startX + w < camX || startX > camX + viewW || startY + h < camY || startY > camY + viewH) {
      continue;
    }

    const vLeft = camX - tileSize;
    const vRight = camX + viewW + tileSize;
    const vTop = camY - tileSize;
    const vBottom = camY + viewH + tileSize;

    for (let index = 0; index < totalTiles; index++) {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * tileSize;
      const y = startY + row * tileSize;

      if (x + tileSize >= vLeft && x <= vRight && y + tileSize >= vTop && y <= vBottom) {
        const img = MOUNTAIN_TILE_IMAGES[index];
        visible.push({
          biomeId: mb.id,
          index,
          col,
          row,
          x,
          y,
          sortY: y + tileSize,
          img
        });
      }
    }
  }

  return visible;
}

/**
 * Returns landmark entities (Giant Trees, Guardian Mountain statues, Mountain Shrines, Mad Alchemist)
 * for any of the 5 mountain biomes currently in view.
 * All entities are Y-sorted into the main renderList.
 */
export function getVisibleMountainEntities(camX, camY, viewW, viewH, now, player) {
  const entities = [];
  const pad = 450;
  const drawPromptBadge = (ctx, sx, sy, badgeText, strokeColor = '#d9bd75') => {
    const bob = Math.sin(now * 0.005) * 3;
    ctx.font = 'bold 12px sans-serif';
    const bw = ctx.measureText(badgeText).width + 16;
    ctx.fillStyle = 'rgba(12, 18, 24, 0.88)';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(sx - bw / 2, sy + bob, bw, 22, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, sx, sy + 11 + bob);
  };

  for (let b = 0; b < MOUNTAIN_BIOMES.length; b++) {
    const mb = MOUNTAIN_BIOMES[b];
    if (mb.startX + mb.w < camX - pad || mb.startX > camX + viewW + pad || mb.startY + mb.h < camY - pad || mb.startY > camY + viewH + pad) {
      continue;
    }

    // 1. Colossal Centerpiece Tree (Scaled up by ~1.63x to 0.62)
    const treeImg = MOUNTAIN_BIOME_ASSETS[mb.treeAsset];
    const treeX = mb.valleyCenter.x;
    const treeY = mb.valleyCenter.y;
    const treeScale = mb.treeScale || 0.62;
    const treeW = 1024 * treeScale; // ~635px
    const treeH = 1024 * treeScale;

    if (treeX + treeW/2 >= camX - pad && treeX - treeW/2 <= camX + viewW + pad && treeY + 60 >= camY - pad && treeY - treeH <= camY + viewH + pad) {
      entities.push({
        y: treeY + 18,
        draw: (ctx) => {
          if (treeImg && treeImg.complete && treeImg.naturalWidth > 0) {
            ctx.save();
            // Ground shadow under colossal trunk
            ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
            ctx.beginPath();
            ctx.ellipse(treeX - camX, treeY - camY + 14, treeW * 0.24, 26, 0, 0, Math.PI * 2);
            ctx.fill();
            // Draw colossal tree sprite
            ctx.drawImage(treeImg, treeX - camX - treeW / 2, treeY - camY - treeH + 42, treeW, treeH);
            ctx.restore();
          }
        }
      });
    }

    // 3. Mad Alchemist (only in Biome 1 - Scaled up by 1.25x)
    if (mb.hasAlchemist) {
      const alchemist = MAD_ALCHEMIST_NPC;
      const ax = alchemist.x, ay = alchemist.y;
      if (ax >= camX - 120 && ax <= camX + viewW + 120 && ay >= camY - 120 && ay <= camY + viewH + 120) {
        entities.push({
          y: ay + 20,
          draw: (ctx) => {
            const sheet = MOUNTAIN_BIOME_ASSETS.madAlchemistSheet;
            ctx.save();
            const sx = ax - camX;
            const sy = ay - camY;

            // Character ground shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
            ctx.beginPath();
            ctx.ellipse(sx, sy + 15, 24, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            // 8-frame animation at 8 FPS (90x90px - 1.25x scaling)
            const dw = 90, dh = 90;
            if (sheet && sheet.complete && sheet.naturalWidth > 0) {
              const frameIdx = Math.floor(now * 0.008) % 8;
              const fw = 256, fh = 256;
              ctx.drawImage(sheet, frameIdx * fw, 0, fw, fh, sx - dw / 2, sy - dh + 22, dw, dh);
            } else if (MOUNTAIN_BIOME_ASSETS.madAlchemistPortrait && MOUNTAIN_BIOME_ASSETS.madAlchemistPortrait.complete) {
              ctx.drawImage(MOUNTAIN_BIOME_ASSETS.madAlchemistPortrait, sx - 30, sy - 52, 60, 60);
            }

            // Interactive prompt badge when player is near
            if (player) {
              const pDist = Math.hypot((player.x + player.w/2) - ax, (player.y + player.h/2) - ay);
              if (pDist < 105) {
                drawPromptBadge(ctx, sx, sy - 72, '[E] Talk', '#d9bd75');
              }
            }
            ctx.restore();
          }
        });
      }
    }

    // 3b. Frost Hermit Commander Alden (Mountain 5 only, Full Game only)
    if (mb.hasFrostHermit && !(typeof window !== 'undefined' && window.IS_DEMO)) {
      const alden = FROST_HERMIT_NPC;
      const ax = alden.x, ay = alden.y;
      if (ax >= camX - 120 && ax <= camX + viewW + 120 && ay >= camY - 120 && ay <= camY + viewH + 120) {
        entities.push({
          y: ay + 20,
          draw: (ctx) => {
            const sheet = MOUNTAIN_BIOME_ASSETS.frostHermitAldenSheet;
            ctx.save();
            const sx = ax - camX;
            const sy = ay - camY;

            // Frosty ground aura & shadow
            ctx.fillStyle = 'rgba(79, 195, 247, 0.16)';
            ctx.beginPath();
            ctx.ellipse(sx, sy + 14, 30, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
            ctx.beginPath();
            ctx.ellipse(sx, sy + 15, 22, 9, 0, 0, Math.PI * 2);
            ctx.fill();

            // 8-frame idle animation at 8 FPS (128x128 source frames)
            const dw = 82, dh = 82;
            if (sheet && sheet.complete && sheet.naturalWidth > 0) {
              const frameIdx = Math.floor(now * 0.008) % 8;
              const fw = 128, fh = 128;
              ctx.drawImage(sheet, frameIdx * fw, 0, fw, fh, sx - dw / 2, sy - dh + 20, dw, dh);
            } else if (MOUNTAIN_BIOME_ASSETS.frostHermitAldenPortrait && MOUNTAIN_BIOME_ASSETS.frostHermitAldenPortrait.complete) {
              ctx.drawImage(MOUNTAIN_BIOME_ASSETS.frostHermitAldenPortrait, sx - 28, sy - 50, 56, 56);
            }

            // Story quest marker overhead
            const done = Boolean(window.campSave?.secret2Complete);
            const markerBob = Math.sin(now * 0.006) * 3;
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = done ? '#52ff52' : '#4fc3f7';
            ctx.fillText(done ? '✦' : '!', sx, sy - 66 + markerBob);

            if (player) {
              const pDist = Math.hypot((player.x + player.w / 2) - ax, (player.y + player.h / 2) - ay);
              if (pDist < 105) {
                drawPromptBadge(ctx, sx, sy - 86, '[E] Speak with Alden', '#4fc3f7');
              }
            }
            ctx.restore();
          }
        });
      }
    }

    // 4. Entrance Landmarks (Guardian Mountain & Mountain Shrine)
    for (let l = 0; l < mb.landmarks.length; l++) {
      const lm = mb.landmarks[l];
      const img = MOUNTAIN_BIOME_ASSETS[lm.asset];
      const lx = mb.startX + lm.relX;
      const ly = mb.startY + lm.relY;
      const scale = lm.scale || 0.35;
      const rawW = lm.asset === 'guardianMountain' ? 633 : 1024;
      const rawH = lm.asset === 'guardianMountain' ? 554 : 1024;
      const lw = rawW * scale;
      const lh = rawH * scale;

      if (lx + lw/2 >= camX - pad && lx - lw/2 <= camX + viewW + pad && ly + 50 >= camY - pad && ly - lh <= camY + viewH + pad) {
        entities.push({
          y: ly + 16,
          draw: (ctx) => {
            if (img && img.complete && img.naturalWidth > 0) {
              ctx.save();
              ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
              ctx.beginPath();
              ctx.ellipse(lx - camX, ly - camY + 10, lw * 0.28, 15, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.drawImage(img, lx - camX - lw / 2, ly - camY - lh + 22, lw, lh);
              if (lm.asset === 'mountainShrine' && player) {
                const pDist = Math.hypot((player.x + player.w / 2) - lx, (player.y + player.h / 2) - (ly - lh * 0.35));
                if (pDist < 130) {
                  const isM5 = mb.id === 5;
                  const label = isM5 ? '[E] Frostpeak Shrine' : '[E] Mountain Shrine';
                  drawPromptBadge(ctx, lx - camX, ly - camY - lh + 4, label, isM5 ? '#4fc3f7' : '#d9bd75');
                }
              }
              ctx.restore();
            }
          }
        });
      }
    }
  }

  return entities;
}
