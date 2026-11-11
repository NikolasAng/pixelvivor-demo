import { biomeAt } from './world.mjs?v336';
import { ENEMY_TYPES, BIOME_BOSSES, pickBiomeEnemy, createEnemySpawner } from './entities.mjs?v336';
import { BOSS_DATA, HORDE_EVENTS } from './config.mjs?v336';
import { playSfx, setMusicTrack } from './audio.mjs?v336';
import { campSave, saveCamp } from './save.mjs?v336';
import { state, enemies, player, VW, VH } from './state.mjs?v336';
import { playerCanSeeEnemy } from './spatial.mjs?v336';
import { TILE } from './underground.mjs?v336';
import { tileAtWorld } from './world-chunks.mjs?v336';
import { spawnParticles } from './relics-achievements.mjs?v336';


let activeRitual = null;
function getActiveRitual() {
  return activeRitual;
}

const getEnemyCap=()=>{
  if (isInChickenDimension()) return 420;
  const pLvl = (typeof player !== 'undefined' && player.level) ? player.level : 1;
  const isCasual = (typeof window !== 'undefined' && window.GAME_SETTINGS?.difficulty === 0);
  const bossAlive = enemies.some(e => (e.boss || ENEMY_TYPES[e.type]?.boss) && e.hp > 0); const bossMult = bossAlive ? 0.6 : 1; if (pLvl < 15) {
    const earlyCaps = [14, 14, 17, 21, 26, 32, 38, 45, 52, 58, 64, 70, 76, 82, 88];
    const baseEarly = Math.floor((earlyCaps[Math.max(1, Math.min(14, pLvl))] || 14) * bossMult);
    return isCasual ? Math.max(10, Math.floor(baseEarly * 0.8)) : baseEarly;
  }
  const timeBonus = (elapsed / 60) * 3.5;
  const levelBonus = (pLvl - 15) * 2.0;
  const maxCap = isCasual ? 160 : 210;
  return Math.floor(Math.min(88 + timeBonus + levelBonus, maxCap) * bossMult);
};
const getRegularEnemyCount=()=>{
  let count=0;
  for(let i=0;i<enemies.length;i++){
    const e=enemies[i];
    if(!e.elite&&!e.boss&&!e.swarmMember)count++;
  }
  return count;
};
const spawnEnemyAt=createEnemySpawner({
  enemies,
  getElapsed:()=>elapsed,
  getPlayerLevel:()=>player.level,
  getBossIntro:()=>bossIntro,
  startBossIntro,
  canPlayerSeeEnemy:playerCanSeeEnemy,
  canSpawn:()=>enemies.length<(isInChickenDimension()?460:(getEnemyCap()+24))&&getRegularEnemyCount()<getEnemyCap()
});
function startBossIntro(boss){
  campSave.discovered = campSave.discovered || {};
  campSave.discovered[boss.type] = true;
  if(boss.type === 'plainsBoss') campSave.discovered['bloodLord'] = true;
  if(boss.type === 'bloodLord') campSave.discovered['plainsBoss'] = true;
  saveCamp();
  const data=BOSS_DATA[boss.type]||BOSS_DATA.boss;
  playSfx('boss');setMusicTrack('boss');
  bossIntro={timer:2.2,boss,zoom:1.4};
  document.getElementById('bossName').textContent=data.name;
  document.getElementById('bossSub').textContent=data.sub;
  const el=document.getElementById('bossIntro');
  el.style.display='flex';
  // reset animations
  el.querySelectorAll('.label,.name,.sub').forEach(n=>{
    n.style.animation='none';
    void n.offsetHeight;
    n.style.animation='';
  });
}
function isInChickenDimension() {
  return (player.x > 910000 * TILE && player.x < 990000 * TILE && player.y > 910000 * TILE && player.y < 990000 * TILE);
}
function spawnWolfPack(sx,sy){
  if(state.isInDream || (player.x / TILE > 550000 && player.x / TILE < 650000) || isInChickenDimension()) return;
  const pid=++packCounter;
  const size=2+Math.floor(Math.random()*3);
  for(let i=0;i<size;i++){
    const a=Math.random()*Math.PI*2,d=20+Math.random()*50;
    spawnEnemyAt(sx+Math.cos(a)*d,sy+Math.sin(a)*d,'wolf',{packId:pid,role:i===0?'leader':'follower',cohesion:.4+Math.random()*.3});
  }
}
function spawnWaterEnemy(){
  if(state.isInDream || (player.x / TILE > 550000 && player.x / TILE < 650000) || isInChickenDimension()) return false;
  for(let i=0;i<12;i++){
    const a=Math.random()*Math.PI*2,d=200+Math.random()*300;
    const sx=player.x+Math.cos(a)*d,sy=player.y+Math.sin(a)*d;
    if(tileAtWorld(Math.floor(sx/TILE),Math.floor(sy/TILE))>0){
      const roll=Math.random();
      const waterEnemy=roll<.5?'fish':roll<.73?'crocodile':roll<.88?'jellyfish':'shark';
      spawnEnemyAt(sx,sy,waterEnemy);
      return true;
    }
  }
  return false;
}
function spawnBiomeEnemy(){
  const _pwx = Math.floor(player.x / TILE), _pwy = Math.floor(player.y / TILE);
  const _inDream = state.isInDream || (_pwx > 550000 && _pwx < 650000 && _pwy > 550000 && _pwy < 650000);
  if (_inDream) {
    const k = state.dreamKills || 0;
    // Every 2 kills unlocks the next mob:
    // 0 kills: 1 mob (dream_mob_01)
    // 2 kills: 2 mobs (dream_mob_01, dream_mob_02)
    // ...
    // 80 kills (82% progress): all 41 mobs unlocked!
    const unlockedCount = Math.min(41, Math.max(1, 1 + Math.floor(k / 2)));
    const pool = [];
    for(let m = 1; m <= unlockedCount; m++){
      pool.push(`dream_mob_${String(m).padStart(2, '0')}`);
    }
    // Also add extra weight to the newest unlocked mob so it appears noticeably
    if (unlockedCount > 1) {
      pool.push(`dream_mob_${String(unlockedCount).padStart(2, '0')}`);
    }
    const type = pool[Math.floor(Math.random() * pool.length)];
    const a = Math.random() * Math.PI * 2;
    const d = Math.max(VW(), VH()) * 0.65 + Math.random() * 80;
    spawnEnemyAt(player.x + Math.cos(a) * d, player.y + Math.sin(a) * d, type);
    return;
  }
  const _inChickenDim = _pwx > 910000 && _pwx < 990000 && _pwy > 910000 && _pwy < 990000;
  if (_inChickenDim) {
    if (state.chickenKingDefeated) return;
    const type = pickBiomeEnemy('chicken', elapsed);
    const a = Math.random() * Math.PI * 2;
    const d = Math.max(VW(), VH()) * (0.36 + Math.random() * 0.28);
    const sx = player.x + Math.cos(a) * d, sy = player.y + Math.sin(a) * d;
    if (type === 'chicken') {
      const flock = 10 + Math.floor(Math.random() * 9);
      for (let f = 0; f < flock; f++) {
        const fa = Math.random() * Math.PI * 2, fd = 12 + Math.random() * 95;
        spawnEnemyAt(sx + Math.cos(fa) * fd, sy + Math.sin(fa) * fd, 'chicken');
      }
    } else if (type === 'rooster') {
      const flock = 3 + Math.floor(Math.random() * 4);
      for (let f = 0; f < flock; f++) {
        const fa = Math.random() * Math.PI * 2, fd = 15 + Math.random() * 60;
        spawnEnemyAt(sx + Math.cos(fa) * fd, sy + Math.sin(fa) * fd, 'rooster');
      }
    } else {
      spawnEnemyAt(sx, sy, 'giantChicken');
      for (let f = 0; f < 5; f++) {
        const fa = Math.random() * Math.PI * 2, fd = 25 + Math.random() * 55;
        spawnEnemyAt(sx + Math.cos(fa) * fd, sy + Math.sin(fa) * fd, 'chicken');
      }
    }
    return;
  }
  const _inAbyss = _pwx > 700000 && _pwx < 900000 && _pwy > 700000 && _pwy < 900000;
  if (_inAbyss) {
    const type = pickBiomeEnemy('abyss', elapsed);
    const a = Math.random() * Math.PI * 2;
    const d = Math.max(VW(), VH()) * 0.65 + Math.random() * 80;
    spawnEnemyAt(player.x + Math.cos(a) * d, player.y + Math.sin(a) * d, type);
    return;
  }
  // === UNDERGROUND PACK: enemy routing ===
  const _inUnder = _pwx > 100000 && _pwx < 300000 && _pwy > 100000 && _pwy < 300000;
  const _inCity = _pwx > 199940 && _pwx < 200060 && _pwy > 199940 && _pwy < 200060;
  if (_inUnder && !_inCity) {
    const minutes = elapsed / 60;
    let pool;
    if (minutes < 3) {
      pool = ['bat','skeleton','goblin','spiderling','rockBeetle','direBat','ghostWisp','caveSpider','caveRat'];
    } else if (minutes < 8) {
      pool = ['skeletonArcher','zombie','caveGhost','cursedSkull','lavaSlime','caveGoblin','stoneGolem','wraith','iceWraith'];
    } else if (minutes < 15) {
      pool = ['caveTroll','ironGolem','boneKnight','shadowLurker','necromancer','spiderQueenling','voidling','mimicChest','crystalGolem'];
    } else {
      pool = Math.random() < 0.10
        ? ['undeadChampion','caveHydra','boneDrake','voidHorror','ancientLich','demonLord','frostGiant']
        : ['caveTroll','wraith','ironGolem','boneKnight','shadowLurker','necromancer','spiderQueenling','voidling','crystalGolem'];
    }
    // Filter to types that actually exist in ENEMY_TYPES
    pool = pool.filter(t => ENEMY_TYPES[t]);
    if (pool.length) {
      const type = pool[Math.floor(Math.random() * pool.length)];
      const a = Math.random() * Math.PI * 2;
      const d = Math.max(VW(), VH()) * 0.65 + Math.random() * 80;
      spawnEnemyAt(player.x + Math.cos(a) * d, player.y + Math.sin(a) * d, type);
      return;
    }
    // If pool empty, fall through to default
  }
  const a=Math.random()*Math.PI*2,d=Math.max(VW(),VH())*.65+Math.random()*80;
  const sx=player.x+Math.cos(a)*d,sy=player.y+Math.sin(a)*d;
  const mountainMobs = typeof window !== 'undefined' && window.getMountainMobsAt && (window.getMountainMobsAt(player.x, player.y) || window.getMountainMobsAt(sx, sy));
  if (mountainMobs && mountainMobs.length > 0) {
    const mobType = mountainMobs[Math.floor(Math.random() * mountainMobs.length)];
    spawnEnemyAt(sx, sy, mobType);
    return;
  }
  const inChickenDim = (_pwx > 910000 && _pwx < 990000 && _pwy > 910000 && _pwy < 990000);
  const bn=inChickenDim ? 'chicken' : biomeAt(Math.floor(sx/TILE),Math.floor(sy/TILE));
  const tn=pickBiomeEnemy(bn,elapsed);
  if(tn==='wolf')spawnWolfPack(sx,sy);else spawnEnemyAt(sx,sy,tn);
}
function spawnVampirePack(){
  if(state.isInDream || (player.x / TILE > 550000 && player.x / TILE < 650000) || isInChickenDimension()) return;
  const a=Math.random()*Math.PI*2,d=Math.max(VW(),VH())*.65+Math.random()*80;
  const sx=player.x+Math.cos(a)*d,sy=player.y+Math.sin(a)*d;
  const count=1+Math.floor(Math.random()*3);
  for(let i=0;i<count;i++){
    const aa=Math.random()*Math.PI*2,dd=20+Math.random()*40;
    spawnEnemyAt(sx+Math.cos(aa)*dd,sy+Math.sin(aa)*dd,'vampire');
  }
}
function spawnBiomeBoss(){
  if(state.isInDream || (player.x / TILE > 550000 && player.x / TILE < 650000)) return false;
  // In the Chicken Dimension, Chicken King ONLY spawns via the 10,000 Chicken Coins trigger
  if (isInChickenDimension()) return false;
  let bn = biomeAt(Math.floor((player.x+player.w/2)/TILE), Math.floor((player.y+player.h/2)/TILE));
  if (spawnedBossBiomes.has(bn)) return false;
  if (bn === 'chicken' && enemies.some(e => e.hp > 0 && e.type === 'chickenKing')) {
    spawnedBossBiomes.add('chicken');
    return false;
  }
  if (bn === 'abyss' && enemies.some(e => e.hp > 0 && (e.type === 'abyss_octopus' || e.type === 'Abyssal_kraken'))) {
    spawnedBossBiomes.add('abyss');
    return false;
  }
  const a = Math.random() * Math.PI * 2;
  const d = Math.max(VW(), VH()) * 0.7 + 100;
  const sx = player.x + Math.cos(a) * d;
  const sy = player.y + Math.sin(a) * d;
  // === UNDERGROUND PACK: underground boss rotation ===
  // Caves can only ever trigger one boss per run (spawnedBossBiomes keyed on biome), so cycle
  // among the four underground bosses instead of always using the single BIOME_BOSSES entry.
  const _uBosses = ['stoneColossus', 'crystalBeholder', 'caveWyrm', 'lavaTitan'];
  const _bossType = bn === 'chicken'
    ? 'chickenKing'
    : (bn === 'abyss'
      ? 'abyss_octopus'
      : (bn === 'undergroundCave'
        ? _uBosses[Math.floor(Math.random() * _uBosses.length)]
        : (BIOME_BOSSES[bn] || 'plainsBoss')));
  const _spawned = spawnEnemyAt(sx, sy, _bossType);
  // === UNDERGROUND PACK: mark the biome only once the boss actually spawned ===
  // This add() used to run before spawnEnemyAt, so a failed spawn (null) still marked the
  // biome as done and the boss never appeared for the rest of the run. Now a failure returns
  // false, the biome stays eligible, and update() retries at the next boss check.
  if (!_spawned) return false;
  // Note: Boss is registered as defeated in spawnedBossBiomes ONLY when killed!
  return true;
}

function pickHordeEvent(biome = '') {
  const minutes = elapsed / 60;
  let gauntletWeight = 12;
  let tsunamiWeight = 10;
  let huntWeight = 12;
  let ritualWeight = 10;
  let blizzardWeight = 10;
  let phalanxWeight = 10;

  if (biome === 'forest' || biome === 'badlands') gauntletWeight = 36;
  if (biome === 'swamp' || biome === 'abyss') tsunamiWeight = 40;
  if (biome === 'plains' || biome === 'deadlands') huntWeight = 35;
  if (biome === 'magicForest' || biome === 'deadlands') ritualWeight = 35;
  if (biome === 'snow' || biome === 'crystalWastes') blizzardWeight = 38;
  if (biome === 'desert' || biome === 'badlands') phalanxWeight = 36;

  const available = [
    {id:'ring', weight:18, minTime:0},
    {id:'vform', weight:16, minTime:2},
    {id:'gauntlet', weight:gauntletWeight, minTime:2.5},
    {id:'blizzard', weight:blizzardWeight, minTime:3.5},
    {id:'pincer', weight:12, minTime:4},
    {id:'tsunami', weight:tsunamiWeight, minTime:5},
    {id:'hunt', weight:huntWeight, minTime:5.5},
    {id:'phalanx', weight:phalanxWeight, minTime:6.5},
    {id:'wall', weight:10, minTime:7},
    {id:'ritual', weight:ritualWeight, minTime:8},
    {id:'spiral', weight:10, minTime:10},
    {id:'ambush', weight:8, minTime:14}
  ].filter(e => minutes >= e.minTime);
  
  const total = available.reduce((s,e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for(const e of available) {
    roll -= e.weight;
    if(roll <= 0) return e.id;
  }
  return 'ring';
}

function getHordeDensityMult() {
  return 1 + Math.min(0.85, (elapsed / 720));
}

function spawnRingFormation(enemyType) {
  const count = Math.floor((12 + Math.floor(Math.random() * 6)) * getHordeDensityMult());
  const radius = 350 + Math.random() * 100;
  const startAngle = Math.random() * Math.PI * 2;
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  for(let i = 0; i < count; i++) {
    const angle = startAngle + (i / count) * Math.PI * 2;
    const x = px + Math.cos(angle) * radius;
    const y = py + Math.sin(angle) * radius;
    spawnEnemyAt(x, y, enemyType, {hordeSpawn:true});
  }
}

function spawnVFormation(enemyType) {
  const count = Math.floor((8 + Math.floor(Math.random() * 5)) * getHordeDensityMult());
  const angle = Math.random() * Math.PI * 2;
  const dirX = Math.cos(angle), dirY = Math.sin(angle);
  const perpX = -dirY, perpY = dirX;
  const distance = 500;
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  const cx = px + dirX * distance;
  const cy = py + dirY * distance;
  for(let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const offset = Math.floor(i / 2) * 45;
    const x = cx + perpX * side * offset - dirX * offset * 0.4;
    const y = cy + perpY * side * offset - dirY * offset * 0.4;
    spawnEnemyAt(x, y, enemyType, {hordeSpawn:true});
  }
}

function spawnPincerFormation(enemyType) {
  const count = Math.floor((6 + Math.floor(Math.random() * 3)) * getHordeDensityMult());
  const angle = Math.random() * Math.PI * 2;
  const distance = 450;
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  for(let i = 0; i < count; i++) {
    const a = angle + (Math.random() - 0.5) * 0.5;
    const r = distance + (Math.random() - 0.5) * 60;
    spawnEnemyAt(px + Math.cos(a) * r, py + Math.sin(a) * r, enemyType, {hordeSpawn:true});
  }
  for(let i = 0; i < count; i++) {
    const a = angle + Math.PI + (Math.random() - 0.5) * 0.5;
    const r = distance + (Math.random() - 0.5) * 60;
    spawnEnemyAt(px + Math.cos(a) * r, py + Math.sin(a) * r, enemyType, {hordeSpawn:true});
  }
}

function spawnWallFormation(enemyType) {
  const count = Math.floor((12 + Math.floor(Math.random() * 6)) * getHordeDensityMult());
  const angle = Math.random() * Math.PI * 2;
  const dirX = Math.cos(angle), dirY = Math.sin(angle);
  const perpX = -dirY, perpY = dirX;
  const distance = 500;
  const spacing = 38;
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  const cx = px + dirX * distance;
  const cy = py + dirY * distance;
  const startOffset = -(count - 1) * spacing / 2;
  for(let i = 0; i < count; i++) {
    const offset = startOffset + i * spacing;
    const x = cx + perpX * offset;
    const y = cy + perpY * offset;
    spawnEnemyAt(x, y, enemyType, {hordeSpawn:true});
  }
}

function spawnSpiralFormation(enemyType) {
  const count = Math.floor((14 + Math.floor(Math.random() * 6)) * getHordeDensityMult());
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  const startAngle = Math.random() * Math.PI * 2;
  for(let i = 0; i < count; i++) {
    const t = i / count;
    const angle = startAngle + t * Math.PI * 4;
    const radius = 280 + t * 240;
    const x = px + Math.cos(angle) * radius;
    const y = py + Math.sin(angle) * radius;
    spawnEnemyAt(x, y, enemyType, {hordeSpawn:true});
  }
}

function spawnBlizzardFormation(enemyType) {
  const count = Math.floor((12 + Math.floor(Math.random() * 5)) * getHordeDensityMult());
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  for(let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 260;
    const targetX = px + Math.cos(angle) * dist;
    const targetY = py + Math.sin(angle) * dist;
    const fallDuration = 1.0 + Math.random() * 0.4;
    const startY = targetY - 420;
    spawnEnemyAt(targetX, startY, enemyType, {
      hordeSpawn: true,
      formation: 'blizzard',
      isFalling: true,
      fallTimer: fallDuration,
      maxFallTimer: fallDuration,
      startY,
      targetX,
      targetY
    });
  }
}

function spawnPhalanxFormation(enemyType) {
  const angle = Math.random() * Math.PI * 2;
  const dirX = Math.cos(angle), dirY = Math.sin(angle);
  const perpX = -dirY, perpY = dirX;
  const distance = 460;
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  const cx = px + dirX * distance;
  const cy = py + dirY * distance;
  const countPerRow = Math.min(6, Math.max(4, Math.floor(4 * getHordeDensityMult())));
  const spacing = 40;
  const startOffset = -(countPerRow - 1) * spacing / 2;

  for (let row = 0; row < 2; row++) {
    const rowOffsetDist = row * 38;
    for (let i = 0; i < countPerRow; i++) {
      const lateralOffset = startOffset + i * spacing;
      const x = cx + perpX * lateralOffset + dirX * rowOffsetDist;
      const y = cy + perpY * lateralOffset + dirY * rowOffsetDist;
      const e = spawnEnemyAt(x, y, enemyType, {
        hordeSpawn: true,
        formation: 'phalanx',
        isPhalanx: true,
        phalanxDirX: -dirX,
        phalanxDirY: -dirY
      });
      if (e) {
        e.hp = Math.floor(e.hp * 1.4);
        e.maxHp = e.hp;
        e.speed *= 0.88;
      }
    }
  }
}

function spawnAmbushFormation(enemyType) {
  const count = Math.floor((8 + Math.floor(Math.random() * 5)) * getHordeDensityMult());
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  for(let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 120 + Math.random() * 60;
    spawnEnemyAt(px + Math.cos(angle) * r, py + Math.sin(angle) * r, enemyType, {hordeSpawn:true});
  }
}

function spawnGauntletFormation(enemyType) {
  const countPerSide = Math.floor((6 + Math.floor(Math.random() * 3)) * getHordeDensityMult());
  const angle = Math.random() * Math.PI * 2;
  const dirX = Math.cos(angle), dirY = Math.sin(angle);
  const perpX = -dirY, perpY = dirX;
  const corridorHalfWidth = 140;
  const spacing = 52;
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  const startOffset = -(countPerSide - 1) * spacing / 2;
  for(let i = 0; i < countPerSide; i++) {
    const offset = startOffset + i * spacing;
    const lx = px - perpX * corridorHalfWidth + dirX * offset;
    const ly = py - perpY * corridorHalfWidth + dirY * offset;
    spawnEnemyAt(lx, ly, enemyType, {hordeSpawn:true, formation:'gauntlet'});
    const rx = px + perpX * corridorHalfWidth + dirX * offset;
    const ry = py + perpY * corridorHalfWidth + dirY * offset;
    spawnEnemyAt(rx, ry, enemyType, {hordeSpawn:true, formation:'gauntlet'});
  }
}

function spawnTsunamiFormation(enemyType) {
  const count = Math.floor((18 + Math.floor(Math.random() * 6)) * getHordeDensityMult());
  const angle = Math.random() * Math.PI * 2;
  const dirX = Math.cos(angle), dirY = Math.sin(angle);
  const perpX = -dirY, perpY = dirX;
  const distance = 520;
  const spacing = 38;
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  const cx = px + dirX * distance;
  const cy = py + dirY * distance;
  const startOffset = -(count - 1) * spacing / 2;
  const gapIndex = Math.floor(count * 0.35 + Math.random() * (count * 0.3));
  for(let i = 0; i < count; i++) {
    if (i === gapIndex || i === gapIndex + 1) continue;
    const offset = startOffset + i * spacing;
    const sinWave = Math.sin((i / count) * Math.PI * 3.5) * 85;
    const x = cx + perpX * offset + dirX * sinWave;
    const y = cy + perpY * offset + dirY * sinWave;
    spawnEnemyAt(x, y, enemyType, {hordeSpawn:true, formation:'tsunami'});
  }
}

function spawnHuntFormation(enemyType) {
  const count = Math.min(3, Math.max(2, Math.floor(1.8 * getHordeDensityMult())));
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  for(let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 420 + Math.random() * 60;
    const x = px + Math.cos(angle) * dist;
    const y = py + Math.sin(angle) * dist;
    const e = spawnEnemyAt(x, y, enemyType, {hordeSpawn:true, isHunter:true, hunterTimer:30});
    if(e) {
      e.hp = Math.floor(e.hp * 2.6);
      e.maxHp = e.hp;
      e.speed *= 1.32;
      e.xp = Math.floor(e.xp * 4);
      e.damage = Math.floor(e.damage * 1.25);
    }
  }
}

function spawnRitualFormation(enemyType) {
  const px = player.x + player.w/2;
  const py = player.y + player.h/2;
  const altarAngle = Math.random() * Math.PI * 2;
  const altarDist = 280;
  const altarX = px + Math.cos(altarAngle) * altarDist;
  const altarY = py + Math.sin(altarAngle) * altarDist;
  const count = 8;
  const radius = 105;
  for(let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = altarX + Math.cos(angle) * radius;
    const y = altarY + Math.sin(angle) * radius;
    spawnEnemyAt(x, y, enemyType, {
      hordeSpawn: true,
      isRitualist: true,
      altarX,
      altarY,
      ritualAngle: angle
    });
  }
  activeRitual = {
    altarX,
    altarY,
    timer: 25,
    maxTimer: 25,
    enemyType
  };
}

function showHordeWarning(type) {
  const names = {
    ring: 'RING OF DOOM',
    vform: 'V-FORMATION INCOMING',
    pincer: 'PINCER ATTACK',
    wall: 'WALL OF DEATH',
    spiral: 'SPIRAL DESCENT',
    ambush: 'AMBUSH!',
    gauntlet: 'THE GAUNTLET RUN',
    blizzard: 'BLIZZARD IMPACT INCOMING',
    tsunami: 'TIDAL TSUNAMI INCOMING',
    hunt: 'THE PACK IS HUNTING YOU',
    phalanx: 'SHIELD PHALANX ADVANCING',
    ritual: 'DARK RITUAL IN PROGRESS'
  };
  const icons = {
    ring: '⚔️',
    vform: '⚔️',
    pincer: '⚔️',
    wall: '⚔️',
    spiral: '⚔️',
    ambush: '⚠️',
    gauntlet: '🌲',
    blizzard: '❄️',
    tsunami: '🌊',
    hunt: '🐺',
    phalanx: '🛡️',
    ritual: '🔮'
  };
  const toast = document.createElement('div');
  toast.className = 'horde-warning';
  const title = document.createElement('strong');
  title.textContent = (icons[type] || '⚠️') + ' ' + (names[type] || 'HORDE INCOMING');
  title.style.color = type === 'hunt' ? '#ff5252' : type === 'ritual' ? '#e040fb' : type === 'tsunami' ? '#00e5ff' : '#ffb74d';
  const sub = document.createElement('span');
  sub.textContent = '3 seconds...';
  toast.append(title, sub);
  document.getElementById('relicToasts')?.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showHordeToast(type) {
  const titles = {
    ring: '⚔️ HORDE ARRIVED!',
    vform: '⚔️ V-FORMATION ARRIVED!',
    pincer: '⚔️ PINCER ATTACK!',
    wall: '⚔️ WALL OF DEATH!',
    spiral: '⚔️ SPIRAL CLOSING IN!',
    ambush: '⚔️ AMBUSH SPRUNG!',
    gauntlet: '🌲 THE GAUNTLET HAS BEGUN!',
    blizzard: '❄️ BLIZZARD TOUCHDOWN!',
    tsunami: '🌊 TIDAL TSUNAMI STRIKES!',
    hunt: '🐺 APEX PREDATORS ON THE PROWL!',
    phalanx: '🛡️ PHALANX MARCHING IN!',
    ritual: '🔮 RITUAL SUMMONING BEGUN!'
  };
  const toast = document.createElement('div');
  toast.className = 'horde-warning';
  toast.style.borderColor = type === 'hunt' ? '#ff5252' : type === 'ritual' ? '#ba68c8' : type === 'tsunami' ? '#00e5ff' : '#ffb300';
  toast.style.boxShadow = `0 0 30px ${type === 'hunt' ? 'rgba(255, 82, 82, 0.7)' : type === 'ritual' ? 'rgba(186, 104, 200, 0.7)' : type === 'tsunami' ? 'rgba(0, 229, 255, 0.7)' : 'rgba(255, 179, 0, 0.7)'}`;
  const title = document.createElement('strong');
  title.textContent = titles[type] || '⚔️ HORDE ARRIVED!';
  title.style.color = type === 'hunt' ? '#ff5252' : type === 'ritual' ? '#e040fb' : type === 'tsunami' ? '#00e5ff' : '#ffb300';
  toast.append(title);
  document.getElementById('relicToasts')?.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function pruneFarRegularEnemies(targetMax = null) {
  const cap = getEnemyCap();
  const effMax = targetMax !== null ? targetMax : (isInChickenDimension() ? Math.max(cap, 380) : cap);
  if (enemies.length <= effMax) return;
  const px = player.x, py = player.y;
  for (let i = enemies.length - 1; i >= 0 && enemies.length > effMax; i--) {
    const e = enemies[i];
    if (e.boss || e.elite || e.hordeSpawn || e.swarmMember || (e.swarmMembers && e.swarmMembers.length)) continue;
    const d2 = (e.x - px) ** 2 + (e.y - py) ** 2;
    if (d2 > 850 * 850) enemies.splice(i, 1);
  }
}

function executeHordeEvent() {
  pruneFarRegularEnemies(240);
  const {type, data} = hordeEvent;
  const {enemyType} = data;
  const spawners = {
    ring: spawnRingFormation,
    vform: spawnVFormation,
    pincer: spawnPincerFormation,
    wall: spawnWallFormation,
    spiral: spawnSpiralFormation,
    ambush: spawnAmbushFormation,
    gauntlet: spawnGauntletFormation,
    blizzard: spawnBlizzardFormation,
    tsunami: spawnTsunamiFormation,
    hunt: spawnHuntFormation,
    phalanx: spawnPhalanxFormation,
    ritual: spawnRitualFormation
  };
  spawners[type]?.(enemyType);
  lastHordeSpawnTime = elapsed;
  playSfx('boss');
  showHordeToast(type);
}

function fastForwardTime(seconds = 300) {
  if (!gameStarted || gameOver) return;
  elapsed += seconds;
  worldTime += seconds;
  nextBossTime = Math.min(nextBossTime, elapsed + 10);
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60).toString().padStart(2, '0');
  const toast = document.createElement('div');
  toast.className = 'relic-toast';
  toast.style.borderColor = '#4fc3f7';
  toast.style.boxShadow = '0 0 25px rgba(79,195,247,0.6)';
  toast.innerHTML = `<strong style="color:#4fc3f7">WARPED TO ${mins}:${secs}</strong><br/><span>Spawn scaling updated (+${Math.floor(seconds/60)}m)</span>`;
  document.getElementById('relicToasts')?.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
  playSfx('confirm');
}

function updateSwarmWaves(dt) {
  if (gameOver || !gameStarted || paused || elapsed < 130) return;
  if (hordeEvent.active || (elapsed - lastHordeSpawnTime < 55) || enemies.some(e => (e.boss || ENEMY_TYPES[e.type]?.boss) && e.hp > 0)) return;
  const interval = Math.max(65, 95 - (elapsed / 240) * 12);
  if (elapsed - lastSwarmWaveTime >= interval) {
    lastSwarmWaveTime = elapsed;
    spawnSwarmWave();
  }
}

function spawnSwarmWave() {
  if(state.isInDream || (player.x / TILE > 550000 && player.x / TILE < 650000)) return;
  pruneFarRegularEnemies(250);
  const biome = isInChickenDimension() ? 'chicken' : biomeAt(Math.floor(player.x / TILE), Math.floor(player.y / TILE));
  const enemyType = pickBiomeEnemy(biome, elapsed, false);
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.max(VW(), VH()) * 0.65 + 40;
  const cx = player.x + Math.cos(angle) * dist;
  const cy = player.y + Math.sin(angle) * dist;
  const count = isInChickenDimension() ? 42 : Math.min(15, Math.floor(5 + (elapsed / 60) * 0.65));
  const waveMax = isInChickenDimension() ? 460 : 340;
  for (let i = 0; i < count; i++) {
    if (enemies.length >= waveMax) break;
    const spread = (Math.random() - 0.5) * 180;
    const offsetDist = (Math.random() - 0.5) * 120;
    const perpX = -Math.sin(angle), perpY = Math.cos(angle);
    const sx = cx + perpX * spread + Math.cos(angle) * offsetDist;
    const sy = cy + perpY * spread + Math.sin(angle) * offsetDist;
    spawnEnemyAt(sx, sy, enemyType, { hordeSpawn: true });
  }
}

function updateHordeEvents(dt) {
  if(gameOver || !gameStarted || paused) {
    if(gameOver) activeRitual = null;
    return;
  }
  if(state.isInDream || (player.x / TILE > 550000 && player.x / TILE < 650000)) return;

  // Active Dark Ritual lifecycle
  if (activeRitual) {
    activeRitual.timer -= dt;
    const ritualists = enemies.filter(e => e.isRitualist && e.hp > 0);
    
    // Ambient ritual particles
    if (Math.random() < 0.25) {
      spawnParticles(
        activeRitual.altarX + (Math.random() - 0.5) * 80,
        activeRitual.altarY + (Math.random() - 0.5) * 80,
        '#ba68c8',
        2
      );
    }

    if (ritualists.length === 0) {
      // Disrupted! Success!
      playSfx('confirm');
      spawnParticles(activeRitual.altarX, activeRitual.altarY, '#ffd54f', 35);
      campSave.gold = (campSave.gold || 0) + 75;
      saveCamp();
      player.xp = (player.xp || 0) + 250;
      
      const toast = document.createElement('div');
      toast.className = 'relic-toast';
      toast.style.borderColor = '#ab47bc';
      toast.style.boxShadow = '0 0 25px rgba(171,71,188,0.7)';
      toast.innerHTML = `<strong style="color:#e1bee7">🔮 RITUAL DISRUPTED!</strong><br/><span style="color:#ffd54f">+75 Gold & +250 XP Awarded!</span>`;
      document.getElementById('relicToasts')?.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);

      activeRitual = null;
    } else if (activeRitual.timer <= 0) {
      // Time expired! Dark beast summoned!
      playSfx('boss');
      screenShakeIntensity = 12;
      for (const r of ritualists) {
        r.hp = 0;
        r.deathTimer = 0.01;
        spawnParticles(r.x, r.y, '#7b1fa2', 12);
      }
      spawnEnemyAt(activeRitual.altarX, activeRitual.altarY, activeRitual.enemyType, {
        elite: true,
        ultraElite: elapsed >= 480
      });
      spawnParticles(activeRitual.altarX, activeRitual.altarY, '#e040fb', 40);

      const toast = document.createElement('div');
      toast.className = 'horde-warning';
      toast.style.borderColor = '#d500f9';
      toast.style.boxShadow = '0 0 30px rgba(213,0,249,0.8)';
      toast.innerHTML = `<strong style="color:#ff4081">⚠️ RITUAL COMPLETED!</strong><br/><span>An Ancient Beast has been summoned!</span>`;
      document.getElementById('relicToasts')?.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);

      activeRitual = null;
    }
  }

  if(hordeEvent.active) {
    hordeEvent.warning -= dt;
    if(hordeEvent.warning <= 0) {
      executeHordeEvent();
      hordeEvent.active = false;
      hordeEvent.timer = Math.max(
        HORDE_EVENTS.minCooldown,
        HORDE_EVENTS.baseCooldown - (elapsed / 240) * HORDE_EVENTS.cooldownDecay
      );
    }
    return;
  }
  hordeEvent.timer -= dt;
  if(hordeEvent.timer <= 0) {
    if(player.level < HORDE_EVENTS.minLevel || enemies.some(e => (e.boss || ENEMY_TYPES[e.type]?.boss) && e.hp > 0)) {
      hordeEvent.timer = 5;
      return;
    }
    if(elapsed - lastSwarmWaveTime < 40) {
      hordeEvent.timer = 15;
      return;
    }
    const biome = isInChickenDimension() ? 'chicken' : biomeAt(Math.floor(player.x/TILE), Math.floor(player.y/TILE));
    const type = pickHordeEvent(biome);
    const enemyType = pickBiomeEnemy(biome, elapsed, false);
    hordeEvent.type = type;
    hordeEvent.data = {enemyType, biome};
    hordeEvent.warning = HORDE_EVENTS.warningDuration;
    hordeEvent.active = true;
    showHordeWarning(type);
  }
}

if (typeof window !== 'undefined') {
  window.spawnMountainMobs = function(mountainId = 1, count = 3) {
    const mb = window.MOUNTAIN_BIOMES ? window.MOUNTAIN_BIOMES.find(m => m.id === Number(mountainId)) : null;
    if (!mb || !mb.mobs || !mb.mobs.length) return false;
    const spawned = [];
    for (let i = 0; i < count; i++) {
      const mobType = mb.mobs[i % mb.mobs.length];
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.4;
      const dist = 120 + Math.random() * 80;
      const mx = player.x + Math.cos(angle) * dist;
      const my = player.y + Math.sin(angle) * dist;
      const e = spawnEnemyAt(mx, my, mobType);
      if (e) spawned.push(e);
    }
    return spawned;
  };
}

export { getEnemyCap, getRegularEnemyCount, spawnEnemyAt, startBossIntro, spawnWolfPack, spawnWaterEnemy, spawnBiomeEnemy, spawnVampirePack, spawnBiomeBoss, pickHordeEvent, getHordeDensityMult, spawnRingFormation, spawnVFormation, spawnPincerFormation, spawnWallFormation, spawnSpiralFormation, spawnAmbushFormation, spawnGauntletFormation, spawnBlizzardFormation, spawnTsunamiFormation, spawnHuntFormation, spawnPhalanxFormation, spawnRitualFormation, getActiveRitual, showHordeWarning, showHordeToast, pruneFarRegularEnemies, executeHordeEvent, fastForwardTime, updateSwarmWaves, spawnSwarmWave, updateHordeEvents };
