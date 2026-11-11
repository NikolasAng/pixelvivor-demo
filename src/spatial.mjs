import { ENEMY_TYPES } from './entities.mjs?v336';
import { campSave } from './save.mjs?v336';
import { TILE, player, enemies, fogRevealVersion, FOG_REVEAL_RADIUS, maskOfCalmActive } from './game-core.mjs?v336';

const revealedTiles=new Set(campSave.exploredTiles);

function getFogRevealRadius(){
  return (campSave && campSave.cartographerBonus) ? 12 : 9;
}

function hasRevealedTile(tileX,tileY){return revealedTiles.has(`${tileX},${tileY}`);}
function enemyIsRevealed(enemy){ if(!enemy) return false; if(enemy.boss || ENEMY_TYPES[enemy.type]?.boss) return true; if(typeof window !== 'undefined' && window.GAME_SETTINGS?.disableFog) return true;
  const tx=Math.floor(enemy.x/TILE),ty=Math.floor(enemy.y/TILE);
  if(enemy._rtx===tx&&enemy._rty===ty){
    if(enemy._rev||enemy._rfv===fogRevealVersion)return enemy._rev;
  }
  enemy._rtx=tx;enemy._rty=ty;enemy._rfv=fogRevealVersion;
  return (enemy._rev=revealedTiles.has(`${tx},${ty}`));
}
function enemyCanAggroPlayer(enemy){return !maskOfCalmActive && (enemy.boss || enemyIsRevealed(enemy));}
function playerCanSeeEnemy(enemy){
  const dx=player.x+player.w/2-enemy.x,dy=player.y+player.h/2-enemy.y;
  const visionRadius=FOG_REVEAL_RADIUS*TILE;
  return dx*dx+dy*dy<=visionRadius*visionRadius&&enemyIsRevealed(enemy);
}

// ═══════════════════════════════════════════════════════════
// 2D SPATIAL HASH GRID FOR FAST O(1) ENEMY QUERIES
// ═══════════════════════════════════════════════════════════
const ENEMY_GRID_CELL = 96;
const enemyGrid = new Map();
const enemyGridPool = [];
let anyRevealedEnemyAlive = false;

function enemyGridKey(cx, cy) {
  return ((cx + 500000) * 1000000) + (cy + 500000);
}

function rebuildEnemyGrid() {
  for (const cell of enemyGrid.values()) {
    cell.length = 0;
    enemyGridPool.push(cell);
  }
  enemyGrid.clear();
  anyRevealedEnemyAlive = false;
  for (let i = 0, len = enemies.length; i < len; i++) {
    const e = enemies[i];
    if (!e || e.hp <= 0) continue;
    const rev = enemyIsRevealed(e);
    if (rev) anyRevealedEnemyAlive = true;
    const cx = Math.floor(e.x / ENEMY_GRID_CELL);
    const cy = Math.floor(e.y / ENEMY_GRID_CELL);
    const key = enemyGridKey(cx, cy);
    let cell = enemyGrid.get(key);
    if (!cell) {
      cell = enemyGridPool.pop() || [];
      enemyGrid.set(key, cell);
    }
    cell.push(e);
  }
}

function forEachEnemyNear(x, y, radius, fn) {
  const pad = radius + 12;
  const minCX = Math.floor((x - pad) / ENEMY_GRID_CELL);
  const maxCX = Math.floor((x + pad) / ENEMY_GRID_CELL);
  const minCY = Math.floor((y - pad) / ENEMY_GRID_CELL);
  const maxCY = Math.floor((y + pad) / ENEMY_GRID_CELL);
  for (let cy = minCY; cy <= maxCY; cy++) {
    const rowBase = (cy + 500000);
    for (let cx = minCX; cx <= maxCX; cx++) {
      const cell = enemyGrid.get(((cx + 500000) * 1000000) + rowBase);
      if (!cell) continue;
      for (let i = 0, len = cell.length; i < len; i++) {
        if (fn(cell[i]) === true) return;
      }
    }
  }
}

function findNearestRevealedEnemy(x, y, maxRange = Infinity, exclude = null) {
  let best = null;
  let bestD2 = maxRange * maxRange;
  const isExcluded = exclude
    ? (exclude instanceof Set ? (e => exclude.has(e)) : (e => exclude.includes(e)))
    : null;
  if (maxRange <= 650 && enemyGrid.size > 0) {
    forEachEnemyNear(x, y, maxRange, e => {
      if (e.hp <= 0 || !enemyIsRevealed(e) || e.passive || ENEMY_TYPES[e.type]?.passive) return;
      if (isExcluded && isExcluded(e)) return;
      const dx = e.x - x, dy = e.y - y;
      const rawD2 = dx * dx + dy * dy; if (rawD2 > maxRange * maxRange) return; const d2 = (e.boss || ENEMY_TYPES[e.type]?.boss) && rawD2 <= 440 * 440 ? rawD2 * 0.4 : rawD2;
      if (d2 < bestD2) { bestD2 = d2; best = e; }
    });
    return best;
  }
  for (let i = 0, len = enemies.length; i < len; i++) {
    const e = enemies[i];
    if (!e || e.hp <= 0 || !enemyIsRevealed(e) || e.passive || ENEMY_TYPES[e.type]?.passive) continue;
    if (isExcluded && isExcluded(e)) continue;
    const dx = e.x - x, dy = e.y - y;
    const rawD2 = dx * dx + dy * dy; const d2 = (e.boss || ENEMY_TYPES[e.type]?.boss) && rawD2 <= 440 * 440 ? rawD2 * 0.4 : rawD2;
    if (d2 < bestD2) { bestD2 = d2; best = e; }
  }
  return best;
}

function findKNearestRevealedEnemies(x, y, k) {
  if (k <= 0) return [];
  if (k === 1) {
    const single = findNearestRevealedEnemy(x, y);
    return single ? [single] : [];
  }
  const topE = [];
  const topD = [];
  for (let i = 0, len = enemies.length; i < len; i++) {
    const e = enemies[i];
    if (!e || e.hp <= 0 || !enemyIsRevealed(e) || e.passive || ENEMY_TYPES[e.type]?.passive) continue;
    const dx = e.x - x, dy = e.y - y;
    const rawD2 = dx * dx + dy * dy; const d2 = (e.boss || ENEMY_TYPES[e.type]?.boss) && rawD2 <= 440 * 440 ? rawD2 * 0.4 : rawD2;
    const curLen = topE.length;
    if (curLen < k || d2 < topD[curLen - 1]) {
      let pos = curLen;
      if (curLen === k) pos = k - 1;
      while (pos > 0 && d2 < topD[pos - 1]) {
        if (pos < k) {
          topD[pos] = topD[pos - 1];
          topE[pos] = topE[pos - 1];
        }
        pos--;
      }
      topD[pos] = d2;
      topE[pos] = e;
    }
  }
  return topE;
}

function hitTest(ax,ay,aw,ah,bx,by,bw,bh){
  const ar=Math.max(aw,ah)*.42,br=Math.max(bw,bh)*.42;
  const dx=(ax+aw/2)-(bx+bw/2),dy=(ay+ah/2)-(by+bh/2);
  return dx*dx+dy*dy<(ar+br)*(ar+br);
}

function distToSegmentSq(px, py, x1, y1, x2, y2){
  const l2 = (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1);
  if(l2 === 0) return (px - x1)*(px - x1) + (py - y1)*(py - y1);
  let t = ((px - x1)*(x2 - x1) + (py - y1)*(y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return (px - projX)*(px - projX) + (py - projY)*(py - projY);
}

export { revealedTiles, getFogRevealRadius, hasRevealedTile, enemyIsRevealed, enemyCanAggroPlayer, playerCanSeeEnemy, ENEMY_GRID_CELL, enemyGrid, anyRevealedEnemyAlive, enemyGridKey, rebuildEnemyGrid, forEachEnemyNear, findNearestRevealedEnemy, findKNearestRevealedEnemies, hitTest, distToSegmentSq };
