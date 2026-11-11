
function drawChainWhip(whip){
  if(!whip || whip.life <= 0) return;
  const isLeft = whip.facingLeft;
  const sheet = isLeft ? chainWhipSheetLeftImg : chainWhipSheetImg;
  if(!sheet || !sheet.complete || !sheet.naturalWidth) return;
  const progress = Math.max(0, Math.min(0.999, 1 - (whip.life / (whip.maxLife || 0.26))));
  const frameIdx = Math.min(4, Math.floor(progress * 5));
  const fw = 960, fh = 80;
  const drawW = whip.range;
  const drawH = 36;
  // Anchored dynamically directly onto character hand/chest (slightly above waist)
  const startX = isLeft 
    ? Math.round(player.x + player.w * 0.35 - camera.x)
    : Math.round(player.x + player.w * 0.65 - camera.x);
  const wx = isLeft ? (startX - drawW) : startX;
  const wy = Math.round(player.y + player.h * 0.36 - camera.y - drawH * 0.5);
  ctx.save();
  ctx.drawImage(sheet, frameIdx * fw, 0, fw, fh, wx, wy, drawW, drawH);
  ctx.restore();
}
import { blendedTileColor, biomeAt } from './world.mjs?v336';
import { ENEMY_TYPES, isFlyingEnemy, isLargeOrBossEnemy } from './entities.mjs?v336';
import { fireBreathStreamImg, fireBreathStreamLeftImg, chainWhipSheetImg, chainWhipSheetLeftImg, ATLAS, undergroundTilesetImg, dungeon1OverheadImg, dungeon1MapImg, FIRE_AURA_FRAMES, MONSTER_ANIMATIONS, WEAPON_BULLET_SPRITES } from './assets.mjs?v336';
import { WEAPON_DEFS, PLAYABLE_CHARACTERS, MOUNT_KEY_MAP, MOUNT_IMAGES, LEFT_FACING_ENEMY_SPRITES, DREAM_RELICS_MAP } from './config.mjs?v336';
import { campSave } from './save.mjs?v336';
import { state, canvas, ctx, viewZoom, VW, VH, getDaylight, getSunX, isNight, weatherParticles, lightnings, player, camera, enemies, projectiles, xpGems, particles, damageNumbers, playerWeapons, relicJournalIds, mines, holyPools, chainVisuals, summonedSpirits, voidRifts, meleeSwings, prismBeams, rainbowArcs, fireBreaths, activeChainWhips, krakenEruptions, krakenInkClouds, trinketPickups, legendaryPickups, dreamRelicPickups, dreamCoinPickups } from './state.mjs?v336';
import { hasRevealedTile, findNearestRevealedEnemy } from './spatial.mjs?v336';
import { drawSprite } from './ui-icons.mjs?v336';
import { TILE, CHUNK_SIZE, CHUNK_PX } from './underground.mjs?v336';
import { fires, burningTrees, getVisibleChunks, tileAtWorld, chunks, getChunk, LIQUIDS, woodPickups, drawCelestialBody, drawParallaxClouds, drawLightning, getCanonicalSunkenShrineChunk } from './world-chunks.mjs?v336';
import { getActiveMount } from './camp.mjs?v336';
import { getActiveRitual } from './enemies-spawner.mjs?v336';
import { scaleWeaponStats, drawWeaponField, drawSummonedSpirit, drawWeaponSwing, drawPrismBeam, drawRainbowArc } from './weapons-combat.mjs?v336';
import { getVisibleMountainTiles, getVisibleMountainEntities } from './mountains.mjs?v336';

// Live Render Debug Toggles (all default ON - normal rendering is untouched)
window.RENDER_DEBUG = {
  fog: true,
  lighting: true,
  minimap: true,
  silhouettes: true,
  chunks: true,
  water: true,
  decor: true,
  weather: true,
  shadows: true,
  legacyLighting: false,
  legacySilhouette: false,
  legacyChunkSampling: false
};

export const RENDER_STATS = {
  activeLayer: 'other',
  layers: {
    chunks:      { count: 0, px: 0 },
    water:       { count: 0, px: 0 },
    mountains:   { count: 0, px: 0 },
    decor:       { count: 0, px: 0 },
    fire:        { count: 0, px: 0 },
    tall:        { count: 0, px: 0 },
    entities:    { count: 0, px: 0 },
    clouds:      { count: 0, px: 0 },
    projectiles: { count: 0, px: 0 },
    lighting:    { count: 0, px: 0 },
    fog:         { count: 0, px: 0 },
    silhouette:  { count: 0, px: 0 },
    ui:          { count: 0, px: 0 },
    other:       { count: 0, px: 0 }
  },
  totalCalls: 0,
  totalPx: 0,
  reset() {
    this.totalCalls = 0;
    this.totalPx = 0;
    for (const k in this.layers) {
      this.layers[k].count = 0;
      this.layers[k].px = 0;
    }
  },
  record(layer, w, h) {
    const area = Math.round((w || 0) * (h || 0));
    const target = this.layers[layer] || this.layers.other;
    target.count++;
    target.px += area;
    this.totalCalls++;
    this.totalPx += area;
  }
};
if (typeof window !== 'undefined') {
  window.RENDER_STATS = RENDER_STATS;
}
let cachedFrameSunX = 0, cachedFrameDaylight = 1;
function drawShadow(cx,cy,w,scale=1){
  if(window.RENDER_DEBUG && window.RENDER_DEBUG.shadows === false) return;
  if(window.GAME_SETTINGS?.shadowQuality === 'off') return;
  const isFastShadow = window.GAME_SETTINGS?.shadowQuality === 'fast';
  const sunX=cachedFrameSunX,daylight=cachedFrameDaylight;
  const sw=w*(.8+Math.abs(sunX)*.3)*scale;
  if(daylight>=.1){
    const dusk=1-daylight;
    const offX=-sunX*(9+dusk*13)*scale;
    const a=(.2+daylight*.22)*(weather.type==='clear'||weather.type==='snow'?1:.5);
    ctx.fillStyle=`rgba(0,0,0,${a})`;
    ctx.beginPath();ctx.ellipse(cx+offX,cy,sw*(1+dusk*.18),5.5*scale,0,0,Math.PI*2);ctx.fill();
  }
  if(window.GAME_SETTINGS?.shadowQuality !== 'fast' && lightnings.length>0){
    for(const flash of lightnings){
      const life=flash.life/flash.maxLife;
      const dx=cx-(flash.x-camera.x),dy=cy-(flash.y-camera.y);
      const distance=Math.hypot(dx,dy);
      const strength=life*Math.max(0,1-distance/460);
      if(strength<=.02)continue;
      const length=(12+Math.min(48,distance*.11))*scale;
      ctx.fillStyle=`rgba(3,8,18,${strength*.38})`;
      ctx.beginPath();ctx.ellipse(cx+(dx/(distance||1))*length,cy+(dy/(distance||1))*length,sw*.72,5*scale,Math.atan2(dy,dx),0,Math.PI*2);ctx.fill();
    }
  }
}
function drawTreeShadow(cx,cy,rx,ry=null){
  if(window.RENDER_DEBUG && window.RENDER_DEBUG.shadows === false) return;
  if(window.GAME_SETTINGS?.shadowQuality === 'off') return;
  if(viewZoom() < 0.75) return;
  if(!ry) ry = rx * 0.36;
  const sunX = cachedFrameSunX, daylight = cachedFrameDaylight;
  const dusk = 1 - Math.max(0, daylight);
  const offX = -sunX * (14 + dusk * 10);
  const a = (0.32 + daylight * 0.16) * (weather.type==='clear'||weather.type==='snow'?1:0.6);
  ctx.fillStyle = `rgba(10, 16, 12, ${a})`;
  ctx.beginPath();
  ctx.ellipse(cx + offX, cy, rx * (1 + dusk * 0.22), ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if(window.GAME_SETTINGS?.shadowQuality !== 'fast' && lightnings.length>0){
    for(const flash of lightnings){
      const life = flash.life / flash.maxLife;
      const dx = cx - (flash.x - camera.x), dy = cy - (flash.y - camera.y);
      const distance = Math.hypot(dx, dy);
      const strength = life * Math.max(0, 1 - distance / 500);
      if(strength <= 0.02) continue;
      const length = 14 + Math.min(50, distance * 0.12);
      ctx.fillStyle = `rgba(3, 8, 18, ${strength * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(cx + (dx / (distance || 1)) * length, cy + (dy / (distance || 1)) * length, rx * 0.8, ry, Math.atan2(dy, dx), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

let lightingCanvas=null,lightingCtx=null;
function applyDynamicLighting(daylight,relicSites=[]){
  const night=Math.max(0,1-daylight);
  const stormFlash=lightningFlash.life>0?Math.min(1,lightningFlash.life/.15):0;
  const isAbyss = player.x > 700000*TILE && player.x < 900000*TILE
               && player.y > 700000*TILE && player.y < 900000*TILE;
  const isUnder = player.x > 100000*TILE && player.x < 300000*TILE
               && player.y > 100000*TILE && player.y < 300000*TILE;
  const underBoost = isUnder ? 1.55 : 1;
  const darkness = isAbyss ? 0.32 : Math.max(0,night*.46*underBoost-(stormFlash*.36));
  const isLegacyLighting = Boolean(window.RENDER_DEBUG?.legacyLighting || window.GAME_SETTINGS?.legacyLighting);

  if(!lightingCanvas){
    lightingCanvas=document.createElement('canvas');
    lightingCtx=lightingCanvas.getContext('2d');
  }

  if (isLegacyLighting) {
    const lightW=Math.ceil(VW()),lightH=Math.ceil(VH());
    if(lightingCanvas.width!==lightW||lightingCanvas.height!==lightH){
      lightingCanvas.width=lightW;lightingCanvas.height=lightH;
    }
    lightingCtx.setTransform(1,0,0,1,0,0);
    lightingCtx.globalCompositeOperation='source-over';
    lightingCtx.clearRect(0,0,lightW,lightH);
    if(darkness>=.015){
      lightingCtx.fillStyle=`rgba(7,12,30,${darkness})`;
      lightingCtx.fillRect(0,0,lightW,lightH);
    }
    // Punch warm, feathered light back through the night tint. Light intensity flickers with fires.
    lightingCtx.globalCompositeOperation='destination-out';
    const punchLight=(x,y,radius,alpha)=>{
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 2) return;
      const sx=x-camera.x,sy=y-camera.y;
      if(!Number.isFinite(sx) || !Number.isFinite(sy) || sx<-radius||sx>VW()+radius||sy<-radius||sy>VH()+radius)return;
      const safeRad = Math.max(3, radius);
      const safeAlpha = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 0;
      const gradient=lightingCtx.createRadialGradient(sx,sy,2,sx,sy,safeRad);
      gradient.addColorStop(0,`rgba(255,255,255,${safeAlpha})`);
      gradient.addColorStop(.42,`rgba(255,255,255,${safeAlpha*.58})`);
      gradient.addColorStop(1,'rgba(255,255,255,0)');
      lightingCtx.fillStyle=gradient;
      lightingCtx.beginPath();lightingCtx.arc(sx,sy,safeRad,0,Math.PI*2);lightingCtx.fill();
    };
    const now=performance.now();
    let lightCount=0;
    for(const fire of fires.values()){
      if(lightCount>=24)break;
      const x=(fire.wx+.5)*TILE,y=(fire.wy+.5)*TILE;
      const flicker=.86+.14*Math.sin(now/95+fire.wx*2.7+fire.wy);
      punchLight(x,y,105,Math.min(.88,darkness*2.1*flicker));
      lightCount++;
    }
    const visChunks = (typeof getVisibleChunks === 'function') ? getVisibleChunks() : [];
    for(const ch of visChunks){
      if(!ch.tall) continue;
      for(const t of ch.tall){
        if(!t.isTorch && !t.isBrazier) continue;
        const flicker = .82 + .18 * Math.sin(now / 105 + t.tx * 3.1 + t.ty);
        punchLight(t.x, t.y - 12, 130, Math.min(.92, darkness * 2.5 * flicker));
      }
    }
    for(const tree of burningTrees.values()){
      if(lightCount>=28)break;
      const flicker=.9+.1*Math.sin(now/75+tree.x);
      punchLight(tree.x,tree.y-45,150,Math.min(.9,darkness*2.3*flicker));
      lightCount++;
    }
    if(carriedRelic){
      const pulse=.83+.17*Math.sin(now/180);
      punchLight(player.x+player.w/2,player.y+player.h/2,72,Math.min(.58,darkness*.9*pulse));
    }
    const torchWeapon = Array.isArray(playerWeapons) ? playerWeapons.find(w => w.id === 'torch') : null;
    if (isAbyss) {
      const pulse = 0.92 + 0.08 * Math.sin(now / 220);
      punchLight(player.x + player.w / 2, player.y + player.h / 2, 320, 0.95 * pulse);
    } else if (isUnder) {
      const radius = (torchWeapon && torchWeapon.level > 0) ? WEAPON_DEFS.torch.stats(torchWeapon.level).lightRadius : 260;
      const flicker = .94 + .06 * Math.sin(now / 140);
      punchLight(player.x + player.w / 2, player.y + player.h / 2, radius, Math.min(.95, darkness * 2.2 * flicker));
    } else if(torchWeapon && torchWeapon.level > 0){
      const stats = WEAPON_DEFS.torch.stats(torchWeapon.level);
      const flicker=.88+.12*Math.sin(now/120);
      punchLight(player.x+player.w/2,player.y+player.h/2,stats.lightRadius,Math.min(.95,darkness*2.5*flicker));
    }
    for(const site of relicSites){
      punchLight(site.x,site.y-8,82,Math.min(.48,darkness*.82));
    }
    lightingCtx.globalCompositeOperation='source-over';
    if(darkness>=.015)ctx.drawImage(lightingCanvas,0,0);
  } else {
    // Optimized screen-resolution lighting:
    // In daylight (darkness < 0.015), skip offscreen canvas clear, fill, and punch passes entirely!
    if (darkness >= 0.015) {
      const screenW = canvas.width, screenH = canvas.height;
      if (lightingCanvas.width !== screenW || lightingCanvas.height !== screenH) {
        lightingCanvas.width = screenW;
        lightingCanvas.height = screenH;
      }
      lightingCtx.setTransform(1, 0, 0, 1, 0, 0);
      lightingCtx.globalCompositeOperation = 'source-over';
      lightingCtx.clearRect(0, 0, screenW, screenH);
      lightingCtx.fillStyle = `rgba(7,12,30,${darkness})`;
      lightingCtx.fillRect(0, 0, screenW, screenH);

      // Match main ctx transform so world coords (camera, zoom, shake) map directly to screen
      lightingCtx.setTransform(ctx.getTransform());
      lightingCtx.globalCompositeOperation = 'destination-out';

      const punchLight = (x, y, radius, alpha) => {
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 2) return;
        const sx = x - camera.x, sy = y - camera.y;
        if (!Number.isFinite(sx) || !Number.isFinite(sy) || sx < -radius || sx > VW() + radius || sy < -radius || sy > VH() + radius) return;
        const safeRad = Math.max(3, radius);
        const safeAlpha = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 0;
        const gradient = lightingCtx.createRadialGradient(sx, sy, 2, sx, sy, safeRad);
        gradient.addColorStop(0, `rgba(255,255,255,${safeAlpha})`);
        gradient.addColorStop(0.42, `rgba(255,255,255,${safeAlpha * 0.58})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        lightingCtx.fillStyle = gradient;
        lightingCtx.beginPath();
        lightingCtx.arc(sx, sy, safeRad, 0, Math.PI * 2);
        lightingCtx.fill();
      };

      const now = performance.now();
      let lightCount = 0;
      for (const fire of fires.values()) {
        if (lightCount >= 24) break;
        const x = (fire.wx + 0.5) * TILE, y = (fire.wy + 0.5) * TILE;
        const flicker = 0.86 + 0.14 * Math.sin(now / 95 + fire.wx * 2.7 + fire.wy);
        punchLight(x, y, 105, Math.min(0.88, darkness * 2.1 * flicker));
        lightCount++;
      }
      const visChunks = (typeof getVisibleChunks === 'function') ? getVisibleChunks() : [];
      for (const ch of visChunks) {
        if (!ch.tall) continue;
        for (const t of ch.tall) {
          if (!t.isTorch && !t.isBrazier) continue;
          const flicker = 0.82 + 0.18 * Math.sin(now / 105 + t.tx * 3.1 + t.ty);
          punchLight(t.x, t.y - 12, 130, Math.min(0.92, darkness * 2.5 * flicker));
        }
      }
      for (const tree of burningTrees.values()) {
        if (lightCount >= 28) break;
        const flicker = 0.9 + 0.1 * Math.sin(now / 75 + tree.x);
        punchLight(tree.x, tree.y - 45, 150, Math.min(0.9, darkness * 2.3 * flicker));
        lightCount++;
      }
      if (carriedRelic) {
        const pulse = 0.83 + 0.17 * Math.sin(now / 180);
        punchLight(player.x + player.w / 2, player.y + player.h / 2, 72, Math.min(0.58, darkness * 0.9 * pulse));
      }
      const torchWeapon = Array.isArray(playerWeapons) ? playerWeapons.find(w => w.id === 'torch') : null;
      if (isAbyss) {
        const pulse = 0.92 + 0.08 * Math.sin(now / 220);
        punchLight(player.x + player.w / 2, player.y + player.h / 2, 320, 0.95 * pulse);
      } else if (isUnder) {
        const radius = (torchWeapon && torchWeapon.level > 0) ? WEAPON_DEFS.torch.stats(torchWeapon.level).lightRadius : 260;
        const flicker = 0.94 + 0.06 * Math.sin(now / 140);
        punchLight(player.x + player.w / 2, player.y + player.h / 2, radius, Math.min(0.95, darkness * 2.2 * flicker));
      } else if (torchWeapon && torchWeapon.level > 0) {
        const stats = WEAPON_DEFS.torch.stats(torchWeapon.level);
        const flicker = 0.88 + 0.12 * Math.sin(now / 120);
        punchLight(player.x + player.w / 2, player.y + player.h / 2, stats.lightRadius, Math.min(0.95, darkness * 2.5 * flicker));
      }
      for (const site of relicSites) {
        punchLight(site.x, site.y - 8, 82, Math.min(0.48, darkness * 0.82));
      }

      lightingCtx.setTransform(1, 0, 0, 1, 0, 0);
      lightingCtx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(lightingCanvas, 0, 0);
      ctx.restore();
    }
  }

  // Keep nearby light sources visible during the day too; these soft glows sit above
  // the terrain and below the fog layer, so they read clearly without revealing fog.
  ctx.save();
  ctx.globalCompositeOperation='screen';
  const glow=(x,y,radius,color,alpha)=>{
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 2) return;
    const sx=x-camera.x,sy=y-camera.y;
    if(!Number.isFinite(sx) || !Number.isFinite(sy) || sx<-radius||sx>VW()+radius||sy<-radius||sy>VH()+radius)return;
    const safeRad = Math.max(3, radius);
    const safeAlpha = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 0;
    const gradient=ctx.createRadialGradient(sx,sy,1,sx,sy,safeRad);
    gradient.addColorStop(0,`${color}${safeAlpha})`);
    gradient.addColorStop(.32,`${color}${safeAlpha*.42})`);
    gradient.addColorStop(1,`${color}0)`);
    ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(sx,sy,safeRad,0,Math.PI*2);ctx.fill();
  };
  const glowTime=performance.now();
  let glowCount=0;
  if(night >= 0.05){
    for(const fire of fires.values()){
      if(glowCount>=8)break;
      glow((fire.wx+.5)*TILE,(fire.wy+.5)*TILE,75,'rgba(255,133,35,',.18*night);
      glowCount++;
    }
  }
  for(const tree of burningTrees.values()){
    if(glowCount>=28)break;
    glow(tree.x,tree.y-45,132,'rgba(255,108,28,',.13+night*.24);
    glowCount++;
  }
  for(const flash of lightnings){
    const lifeRatio = flash.life / flash.maxLife;
    const pulse = 0.8 + 0.2 * Math.sin(glowTime / 24);
    glow(flash.x, flash.y, 150 * (1 - lifeRatio * 0.3), 'rgba(160,225,255,', 0.45 * lifeRatio * pulse);
  }
  if (isAbyss) {
    const pulse = 0.9 + 0.1 * Math.sin(glowTime / 240);
    glow(player.x + player.w / 2, player.y + player.h / 2, 220, 'rgba(0, 229, 255,', 0.22 * pulse);
  } else {
    glow(player.x+player.w/2,player.y+player.h/2,night>.2?142:88,'rgba(255,202,130,',.055+night*.12);
  }
  if(carriedRelic){
    const pulse=.9+.1*Math.sin(glowTime/170);
    glow(player.x+player.w/2,player.y+player.h/2,68,'rgba(191,128,255,',(.12+night*.2)*pulse);
  }
  for(const site of relicSites)glow(site.x,site.y-16,110,'rgba(194,126,255,',.22+night*.22);
  ctx.restore();
}
const SPRITE_FLASH_CACHE = new Map();
function getSpriteFlashCanvas(cacheKey, img, sx, sy, sw, sh, tintColor = '#ffffff') {
  const fullKey = `${cacheKey}|${tintColor}`;
  let cached = SPRITE_FLASH_CACHE.get(fullKey);
  if (cached) return cached;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(sw));
  c.height = Math.max(1, Math.round(sh));
  const cctx = c.getContext('2d');
  cctx.imageSmoothingEnabled = false;
  cctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  cctx.globalCompositeOperation = 'source-in';
  cctx.fillStyle = tintColor;
  cctx.fillRect(0, 0, c.width, c.height);
  SPRITE_FLASH_CACHE.set(fullKey, c);
  return c;
}
const AURA_GLOW_CACHE = new Map();
let silhouetteCanvas = null, silhouetteCtx = null;
let silhouetteRenderTint = null;
let silhouetteTargetCtx = null;
let currentFrameNow = performance.now();
function drawCachedRadialGlow(cx, cy, radius, colorRgb, alpha = 1, ringMode = false) {
  if (alpha <= 0.01 || radius <= 0) return;
  const key = `${colorRgb}|${ringMode ? 'ring' : 'fill'}`;
  let tex = AURA_GLOW_CACHE.get(key);
  if (!tex) {
    tex = document.createElement('canvas');
    tex.width = 96;
    tex.height = 96;
    const tctx = tex.getContext('2d');
    const g = tctx.createRadialGradient(48, 48, ringMode ? 8 : 6, 48, 48, 48);
    if (ringMode) {
      g.addColorStop(0, `rgba(${colorRgb},0)`);
      g.addColorStop(0.48, `rgba(${colorRgb},1)`);
      g.addColorStop(1, `rgba(${colorRgb},0)`);
    } else {
      g.addColorStop(0, `rgba(${colorRgb},1)`);
      g.addColorStop(1, `rgba(${colorRgb},0)`);
    }
    tctx.fillStyle = g;
    tctx.fillRect(0, 0, 96, 96);
    AURA_GLOW_CACHE.set(key, tex);
  }
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = prevAlpha * Math.min(1, alpha);
  ctx.drawImage(tex, cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.globalAlpha = prevAlpha;
}
function drawEntitySprite(name,x,y,w,h,opts={}){
  const {flipX=false, scaleX=1, scaleY=1, rotation=0, alpha=1, anchorX=.5, anchorY=.5, flashAlpha=0, flashColor='#ffffff', outlineColor=null}=opts;
  const targetCtx = silhouetteTargetCtx || ctx;
  let img, sx, sy, sw, sh, cacheKey = typeof name === 'string' ? name : '';

  const animDef = typeof name === 'string' && (MONSTER_ANIMATIONS?.[name] || window.MONSTER_ANIMATIONS?.[name] || (opts.type && (MONSTER_ANIMATIONS?.[opts.type] || window.MONSTER_ANIMATIONS?.[opts.type])));
  if (animDef && animDef.img && animDef.img.complete && animDef.img.naturalWidth > 0) {
    img = animDef.img;
    const frameCount = animDef.frameCount || 8;
    const fps = animDef.fps || 8;
    const frameW = animDef.frameW || 128;
    const frameH = animDef.frameH || 128;
    let frameIndex = 0;
    if (opts.isFrozen) {
      frameIndex = 0;
    } else {
      const baseTime = (opts.animTime !== undefined) ? opts.animTime : (typeof elapsed !== 'undefined' ? elapsed : (performance.now() * 0.001));
      frameIndex = Math.floor(baseTime * fps) % frameCount;
      if (frameIndex < 0 || isNaN(frameIndex)) frameIndex = 0;
    }
    if (animDef.subX !== undefined || animDef.subY !== undefined || animDef.sw !== undefined) {
      const stepX = animDef.stepX !== undefined ? animDef.stepX : (animDef.frameW || 128);
      sx = frameIndex * stepX + (animDef.subX || 0);
      sy = animDef.subY || 0;
      sw = animDef.sw || (animDef.frameW || 128);
      sh = animDef.sh || (animDef.frameH || 128);
    } else {
      sx = frameIndex * frameW;
      sy = 0;
      sw = frameW;
      sh = frameH;
    }

    const baseSize = Math.max(w, h) * 1.40;
    const aspect = sw / Math.max(1, sh);
    const dw = aspect >= 1 ? baseSize : baseSize * aspect;
    const dh = aspect >= 1 ? baseSize / aspect : baseSize;

    targetCtx.save();
    targetCtx.translate(x + w * anchorX, y + h * anchorY);
    if (rotation) targetCtx.rotate(rotation);
    targetCtx.scale((flipX ? -1 : 1) * scaleX, scaleY);
    if (silhouetteRenderTint) {
      const silCanvas = getSpriteFlashCanvas(`anim:${name}:${frameIndex}`, img, sx, sy, sw, sh, silhouetteRenderTint);
      targetCtx.globalAlpha = 1;
      targetCtx.drawImage(silCanvas, 0, 0, silCanvas.width, silCanvas.height, -dw * anchorX, -dh * anchorY, dw, dh);
      targetCtx.restore();
      return;
    }
    if (outlineColor) {
      const outlineCanvas = getSpriteFlashCanvas(`anim:${name}:${frameIndex}`, img, sx, sy, sw, sh, outlineColor);
      targetCtx.globalAlpha = alpha * 0.62;
      targetCtx.drawImage(outlineCanvas, 0, 0, outlineCanvas.width, outlineCanvas.height, -dw * anchorX * 1.11, -dh * anchorY * 1.11, dw * 1.11, dh * 1.11);
    }
    targetCtx.globalAlpha = alpha;
    targetCtx.drawImage(img, sx, sy, sw, sh, -dw * anchorX, -dh * anchorY, dw, dh);
    if (flashAlpha > 0) {
      const flashCanvas = getSpriteFlashCanvas(`anim:${name}:${frameIndex}`, img, sx, sy, sw, sh, flashColor);
      targetCtx.globalAlpha = alpha * Math.min(0.92, flashAlpha);
      targetCtx.drawImage(flashCanvas, 0, 0, flashCanvas.width, flashCanvas.height, -dw * anchorX, -dh * anchorY, dw, dh);
    }
    targetCtx.restore();
    return;
  }

  if (typeof name === 'string' && window.ABYSS_SHEET_ENEMIES?.regions?.[name]) {
    const ar = window.ABYSS_SHEET_ENEMIES.regions[name];
    img = window.ABYSS_SHEET_ENEMIES.img;
    if (!img || !img.complete || img.naturalWidth === 0) {
      const ext = window.EXT_ABYSS_MOBS?.[name];
      if (ext && ext.complete && ext.naturalWidth > 0) {
        img = ext; sx = 0; sy = 0; sw = ext.naturalWidth; sh = ext.naturalHeight;
      } else {
        return;
      }
    } else {
      sx = ar.sx; sy = ar.sy; sw = ar.sw; sh = ar.sh;
    }
    const baseSize = Math.max(w, h) * 1.3;
    const aspect = sw / Math.max(1, sh);
    const dw = aspect >= 1 ? baseSize : baseSize * aspect;
    const dh = aspect >= 1 ? baseSize / aspect : baseSize;
    targetCtx.save();
    targetCtx.translate(x + w * anchorX, y + h * anchorY);
    if (rotation) targetCtx.rotate(rotation);
    targetCtx.scale((flipX ? -1 : 1) * scaleX, scaleY);
    if (silhouetteRenderTint) {
      const silCanvas = getSpriteFlashCanvas(`abyss:${name}`, img, sx, sy, sw, sh, silhouetteRenderTint);
      targetCtx.globalAlpha = 1;
      targetCtx.drawImage(silCanvas, 0, 0, silCanvas.width, silCanvas.height, -dw * anchorX, -dh * anchorY, dw, dh);
      targetCtx.restore();
      return;
    }
    if (outlineColor) {
      const outlineCanvas = getSpriteFlashCanvas(`abyss:${name}`, img, sx, sy, sw, sh, outlineColor);
      targetCtx.globalAlpha = alpha * 0.62;
      targetCtx.drawImage(outlineCanvas, 0, 0, outlineCanvas.width, outlineCanvas.height, -dw * anchorX * 1.11, -dh * anchorY * 1.11, dw * 1.11, dh * 1.11);
    }
    targetCtx.globalAlpha = alpha;
    targetCtx.drawImage(img, sx, sy, sw, sh, -dw * anchorX, -dh * anchorY, dw, dh);
    if (flashAlpha > 0) {
      const flashCanvas = getSpriteFlashCanvas(`abyss:${name}`, img, sx, sy, sw, sh, flashColor);
      targetCtx.globalAlpha = alpha * Math.min(0.92, flashAlpha);
      targetCtx.drawImage(flashCanvas, 0, 0, flashCanvas.width, flashCanvas.height, -dw * anchorX, -dh * anchorY, dw, dh);
    }
    targetCtx.restore();
    return;
  } else if (typeof name === 'string' && window.NEW_MONSTER_SHEET?.regions?.[name] && window.NEW_MONSTER_IMG?.complete && window.NEW_MONSTER_IMG.naturalWidth > 0) {
    const mr = window.NEW_MONSTER_SHEET.regions[name];
    img = window.NEW_MONSTER_IMG; sx = mr.x; sy = mr.y; sw = mr.w; sh = mr.h;
    const baseSize = Math.max(w, h) * 1.3;
    const aspect = sw / Math.max(1, sh);
    const dw = aspect >= 1 ? baseSize : baseSize * aspect;
    const dh = aspect >= 1 ? baseSize / aspect : baseSize;
    targetCtx.save();
    targetCtx.translate(x + w * anchorX, y + h * anchorY);
    if (rotation) targetCtx.rotate(rotation);
    targetCtx.scale((flipX ? -1 : 1) * scaleX, scaleY);
    if (silhouetteRenderTint) {
      const silCanvas = getSpriteFlashCanvas(`nms:${name}`, img, sx, sy, sw, sh, silhouetteRenderTint);
      targetCtx.globalAlpha = 1;
      targetCtx.drawImage(silCanvas, 0, 0, silCanvas.width, silCanvas.height, -dw * anchorX, -dh * anchorY, dw, dh);
      targetCtx.restore();
      return;
    }
    if (outlineColor) {
      const outlineCanvas = getSpriteFlashCanvas(`nms:${name}`, img, sx, sy, sw, sh, outlineColor);
      targetCtx.globalAlpha = alpha * 0.62;
      targetCtx.drawImage(outlineCanvas, 0, 0, outlineCanvas.width, outlineCanvas.height, -dw * anchorX * 1.11, -dh * anchorY * 1.11, dw * 1.11, dh * 1.11);
    }
    targetCtx.globalAlpha = alpha;
    targetCtx.drawImage(img, sx, sy, sw, sh, -dw * anchorX, -dh * anchorY, dw, dh);
    if (flashAlpha > 0) {
      const flashCanvas = getSpriteFlashCanvas(`nms:${name}`, img, sx, sy, sw, sh, flashColor);
      targetCtx.globalAlpha = alpha * Math.min(0.92, flashAlpha);
      targetCtx.drawImage(flashCanvas, 0, 0, flashCanvas.width, flashCanvas.height, -dw * anchorX, -dh * anchorY, dw, dh);
    }
    targetCtx.restore();
    return;
  } else if (typeof name === 'string' && window.DREAM_BIOME_SHEET?.regions?.[name] && window.DREAM_BIOME_IMG?.complete && window.DREAM_BIOME_IMG.naturalWidth > 0) {
    const mr = window.DREAM_BIOME_SHEET.regions[name];
    img = window.DREAM_BIOME_IMG; sx = mr.x; sy = mr.y; sw = mr.w; sh = mr.h;
    const baseSize = Math.max(w, h) * 1.3;
    const aspect = sw / Math.max(1, sh);
    const dw = aspect >= 1 ? baseSize : baseSize * aspect;
    const dh = aspect >= 1 ? baseSize / aspect : baseSize;
    targetCtx.save();
    targetCtx.translate(x + w * anchorX, y + h * anchorY);
    if (rotation) targetCtx.rotate(rotation);
    targetCtx.scale((flipX ? -1 : 1) * scaleX, scaleY);
    if (silhouetteRenderTint) {
      const silCanvas = getSpriteFlashCanvas(`dbs:${name}`, img, sx, sy, sw, sh, silhouetteRenderTint);
      targetCtx.globalAlpha = 1;
      targetCtx.drawImage(silCanvas, 0, 0, silCanvas.width, silCanvas.height, -dw * anchorX, -dh * anchorY, dw, dh);
      targetCtx.restore();
      return;
    }
    if (outlineColor) {
      const outlineCanvas = getSpriteFlashCanvas(`dbs:${name}`, img, sx, sy, sw, sh, outlineColor);
      targetCtx.globalAlpha = alpha * 0.62;
      targetCtx.drawImage(outlineCanvas, 0, 0, outlineCanvas.width, outlineCanvas.height, -dw * anchorX * 1.11, -dh * anchorY * 1.11, dw * 1.11, dh * 1.11);
    }
    targetCtx.globalAlpha = alpha;
    targetCtx.drawImage(img, sx, sy, sw, sh, -dw * anchorX, -dh * anchorY, dw, dh);
    if (flashAlpha > 0) {
      const flashCanvas = getSpriteFlashCanvas(`dbs:${name}`, img, sx, sy, sw, sh, flashColor);
      targetCtx.globalAlpha = alpha * Math.min(0.92, flashAlpha);
      targetCtx.drawImage(flashCanvas, 0, 0, flashCanvas.width, flashCanvas.height, -dw * anchorX, -dh * anchorY, dw, dh);
    }
    targetCtx.restore();
    return;
  } else if (typeof name === 'string' && name.startsWith('ext_item_')) {
    const id = parseInt(name.split('_')[2], 10);
    const ext = window.EXT_ITEMS[id];
    if(ext && ext.complete && ext.naturalWidth>0){
      img = ext; sx = 0; sy = 0; sw = ext.naturalWidth; sh = ext.naturalHeight;
    }
  } else if (typeof name === 'string' && window.EXT_TREES && (window.EXT_TREES[name] || (window.TREE_ALIASES && window.TREE_ALIASES[name]))) {
    const tName = window.EXT_TREES[name] ? name : window.TREE_ALIASES[name];
    const atlasReg = window.EXT_TREES_ATLAS?.regions?.[tName];
    if (atlasReg && window.EXT_TREES_ATLAS?.canvas) {
      img = window.EXT_TREES_ATLAS.canvas; sx = atlasReg.sx; sy = atlasReg.sy; sw = atlasReg.sw; sh = atlasReg.sh;
    } else {
      const ext = window.EXT_TREES[tName];
      if(ext && ext.complete && ext.naturalWidth>0){
        img = ext; sx = 0; sy = 0; sw = ext.naturalWidth; sh = ext.naturalHeight;
      }
    }
  } else if (typeof name === 'string' && window.EXT_BOSSES && window.EXT_BOSSES[name]) {
    const ext = window.EXT_BOSSES[name];
    if(ext && ext.complete && ext.naturalWidth>0){
      img = ext; sx = 0; sy = 0; sw = ext.naturalWidth; sh = ext.naturalHeight;
    }
  } else if (typeof name === 'string' && window.EXT_ABYSS_MOBS && window.EXT_ABYSS_MOBS[name]) {
    const ext = window.EXT_ABYSS_MOBS[name];
    if(ext && ext.complete && ext.naturalWidth>0){
      img = ext; sx = 0; sy = 0; sw = ext.naturalWidth; sh = ext.naturalHeight;
    }
  } else if (typeof name === 'object' && name.image) {
    img = name.image; sx = name.x; sy = name.y; sw = name.w; sh = name.h;
    cacheKey = `${name.image.src || 'img'}:${sx},${sy},${sw},${sh}`;
  } else {
    const r=ATLAS.regions[name];
    if(!r)return;
    img = ATLAS.canvas; sx = r.x; sy = r.y; sw = r.w; sh = r.h;
  }
  if(!img || (img !== ATLAS.canvas && (!img.complete || img.naturalWidth === 0))){
    return;
  }
  targetCtx.save();
  targetCtx.translate(x+w*anchorX,y+h*anchorY);
  if (rotation) targetCtx.rotate(rotation);
  targetCtx.scale((flipX?-1:1)*scaleX, scaleY);
  targetCtx.translate(-w*anchorX,-h*anchorY);
  if (silhouetteRenderTint) {
    const silCanvas = getSpriteFlashCanvas(cacheKey || `${sx},${sy},${sw},${sh}`, img, sx, sy, sw, sh, silhouetteRenderTint);
    targetCtx.globalAlpha = 1;
    targetCtx.drawImage(silCanvas, 0, 0, silCanvas.width, silCanvas.height, 0, 0, w, h);
    targetCtx.restore();
    return;
  }
  if (outlineColor) {
    const outlineCanvas = getSpriteFlashCanvas(cacheKey || `${sx},${sy},${sw},${sh}`, img, sx, sy, sw, sh, outlineColor);
    targetCtx.globalAlpha = alpha * 0.62;
    targetCtx.drawImage(outlineCanvas, 0, 0, outlineCanvas.width, outlineCanvas.height, -w * 0.055, -h * 0.055, w * 1.11, h * 1.11);
  }
  targetCtx.globalAlpha=alpha;
  targetCtx.drawImage(img,sx,sy,sw,sh,0,0,w,h);
  if (flashAlpha > 0) {
    const flashCanvas = getSpriteFlashCanvas(cacheKey || `${sx},${sy},${sw},${sh}`, img, sx, sy, sw, sh, flashColor);
    targetCtx.globalAlpha = alpha * Math.min(0.92, flashAlpha);
    targetCtx.drawImage(flashCanvas, 0, 0, flashCanvas.width, flashCanvas.height, 0, 0, w, h);
  }
  targetCtx.restore();
}
function drawSubmergedCharacter(sprite,x,y,w,h,depth,options={}){
  // 1. Draw the entire sprite 100% naturally intact (NO rectangles, NO hard clipping boxes)
  drawEntitySprite(sprite,x,y,w,h,options);

  if (silhouetteRenderTint || depth <= 0) return;

  const deep = (depth === 2);
  // Natural water line: right at the soles / ankles (92% for shallow, 84% for deep)
  const surfaceY = Math.round(y + h * (deep ? 0.84 : 0.92));
  const cx = x + w / 2;
  const isPlayerFrame = (w >= 64 && h >= 64 && !options.type);
  const bodyHalfW = isPlayerFrame ? 11 : Math.min(15, Math.max(6, w * 0.24));
  const ry = deep ? 2.6 : 1.8;
  const pulse = Math.sin(performance.now() * 0.005 + x * 0.08) * 0.8;

  // 2. Beautiful soft water foam rings & ripples circling the feet (seamless on water & shores)
  ctx.save();
  // Ambient water contact shadow
  ctx.fillStyle = deep ? 'rgba(8, 34, 52, 0.28)' : 'rgba(12, 44, 64, 0.18)';
  ctx.beginPath();
  ctx.ellipse(cx, surfaceY + 0.5, bodyHalfW + 2, ry + 1.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle water refraction ellipse directly around feet
  ctx.fillStyle = deep ? 'rgba(28, 85, 140, 0.22)' : 'rgba(45, 120, 180, 0.14)';
  ctx.beginPath();
  ctx.ellipse(cx, surfaceY + 1.5, bodyHalfW * 0.95, ry * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer glowing water crest / foam arc
  ctx.strokeStyle = deep ? 'rgba(170, 230, 248, 0.65)' : 'rgba(195, 240, 255, 0.50)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(cx, surfaceY, bodyHalfW + pulse * 0.5, ry, 0, Math.PI * 0.05, Math.PI * 0.95);
  ctx.stroke();

  // Back ripple wave
  ctx.strokeStyle = deep ? 'rgba(135, 208, 235, 0.40)' : 'rgba(160, 222, 245, 0.30)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.ellipse(cx, surfaceY - 0.5, bodyHalfW * 0.85, ry * 0.75, 0, Math.PI * 1.12, Math.PI * 1.88);
  ctx.stroke();
  ctx.restore();
}
function drawDeformedDecor(d, x, y, frontStripOnly = false) {
  if (!d || !d.img) return;
  if (d.img !== ATLAS.canvas && d.img !== window.EXT_TREES_ATLAS?.canvas && !(d.img.complete && d.img.naturalWidth > 0)) return;
  const squish = d._squish || 0;
  const bend = d._bend || 0;
  ctx.save();
  ctx.translate(x + d.dw * 0.5, y + d.dh);
  if (squish !== 0 || bend !== 0) {
    ctx.transform(1 + squish * 0.34, 0, bend, Math.max(0.45, 1 - squish), 0, 0);
  }
  if (frontStripOnly) {
    const ratio = 0.44;
    const stripSy = d.sy + d.sh * (1 - ratio);
    const stripSh = d.sh * ratio;
    const stripDh = d.dh * ratio;
    ctx.globalAlpha = 0.92;
    ctx.drawImage(d.img, d.sx, stripSy, d.sw, stripSh, -d.dw * 0.5, -stripDh, d.dw, stripDh);
  } else {
    ctx.drawImage(d.img, d.sx, d.sy, d.sw, d.sh, -d.dw * 0.5, -d.dh, d.dw, d.dh);
  }
  ctx.restore();
}
function drawForegroundDecorBootOverlap() {
  const activeList = window.activeInteractiveDecors;
  if (!activeList || activeList.length === 0) return;
  for (let i = 0; i < activeList.length; i++) {
    const d = activeList[i];
    if (!d._playerInside || !d._ch) continue;
    if (d.decorType !== 'bush' && d.decorType !== 'mushroom') continue;
    const x = Math.round(d._ch.cx * CHUNK_PX - camera.x + d.x);
    const y = Math.round(d._ch.cy * CHUNK_PX - camera.y + d.y);
    drawDeformedDecor(d, x, y, true);
  }
}
function drawMountedPlayer(){
  const mount=getActiveMount();
  if(!mount)return false;
  
  const px=player.x-camera.x;
  const py=player.y-camera.y;
  const waterDepth=player.inWater||0;
  const sinkOffset=mount.flying ? -12 : (waterDepth===2?7:waterDepth===1?2:0);
  
  const charIdx = Math.max(1, Math.min(6, PLAYABLE_CHARACTERS.findIndex(c => c.id === campSave.character) + 1));
  const mountKey = MOUNT_KEY_MAP[campSave.equippedMount] || 'bear';
  const mountImg = MOUNT_IMAGES[charIdx]?.[mountKey];
  
  const walkCycle = player.moving ? Math.sin(player.walkTimer * 10) : 0;
  const bob = mount.flying
    ? Math.sin(elapsed * 3.5) * 4.5
    : (player.moving ? Math.abs(walkCycle) * 3 : Math.sin(elapsed * 2) * 1.5);

  const stepLift = player.decorStepOffsetY || 0;
  if (mountImg && mountImg.complete && mountImg.naturalWidth > 0) {
    const mountW = Math.round(player.w * 3.4);
    const mountH = Math.round(mountW * (mountImg.naturalHeight / mountImg.naturalWidth));
    const drawX = px + player.w / 2 - mountW / 2;
    const drawY = py + player.h - mountH + bob + sinkOffset + stepLift;
    const faceRight = (player.facing >= 0);

    if (silhouetteRenderTint) {
      const targetCtx = silhouetteTargetCtx || ctx;
      const silCanvas = getSpriteFlashCanvas(`mount:${charIdx}:${mountKey}`, mountImg, 0, 0, mountImg.naturalWidth, mountImg.naturalHeight, silhouetteRenderTint);
      targetCtx.save();
      targetCtx.globalAlpha = 1.0;
      targetCtx.translate(drawX + mountW / 2, drawY + mountH / 2);
      if (faceRight) targetCtx.scale(-1, 1);
      targetCtx.translate(-(drawX + mountW / 2), -(drawY + mountH / 2));
      targetCtx.drawImage(silCanvas, drawX, drawY, mountW, mountH);
      targetCtx.restore();
      return true;
    }
    
    // Shadow
    drawShadow(px + player.w / 2, py + player.h - 1 + stepLift * 0.6, mountW * 0.44 * (1 + stepLift * 0.03), 1.4);
    
    // Status flash
    const flash = player.invulnTimer > 0 && Math.floor(player.invulnTimer * 20) % 2 === 0;
    ctx.save();
    ctx.globalAlpha = flash ? 0.4 : 1.0;
    
    ctx.translate(drawX + mountW / 2, drawY + mountH / 2);
    if (faceRight) {
      ctx.scale(-1, 1);
    }
    ctx.translate(-(drawX + mountW / 2), -(drawY + mountH / 2));
    
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mountImg, drawX, drawY, mountW, mountH);
    ctx.imageSmoothingEnabled = prevSmooth;
    ctx.restore();
    drawForegroundDecorBootOverlap();
    return true;
  }
  
  // Fallback if image not yet loaded
  const mountW=player.w*1.9;
  const mountH=player.h*1.15;
  const mountX=px-(mountW-player.w)/2;
  const mountY=py+player.h-mountH+sinkOffset;
  if (!silhouetteRenderTint) drawShadow(px+player.w/2,mountY+mountH-2,mountW*.5,1.3);
  drawEntitySprite(mount.sprite,mountX,mountY+bob*.5,mountW,mountH,{
    flipX:player.facing<0
  });
  return true;
}

function drawPlayer(){
  let customDrawX, customDrawY;
  const isDead = gameOver && player.hp <= 0;
  if(!isDead && drawMountedPlayer())return;
  const px=player.x-camera.x,py=player.y-camera.y;
  const pTileX = Math.floor(player.x / TILE), pTileY = Math.floor(player.y / TILE);
  const isAbyss = (pTileX > 700000 && pTileX < 900000 && pTileY > 700000 && pTileY < 900000);
  const flash=player.invulnTimer>0&&Math.floor(player.invulnTimer*20)%2===0;
  const walkCycle=(!isDead && player.moving) ? Math.sin(player.walkTimer*12) : 0;
  const bob=isDead ? 0 : (isAbyss
    ? (player.moving ? Math.sin(player.walkTimer * 6) * 4.2 : Math.sin(elapsed * 2.5) * 3.2)
    : (player.moving ? Math.abs(walkCycle)*2.1 : Math.sin(elapsed*2)*1.1));
  const moveAmount=(!isDead && player.moving && !player.directionalChar) ? Math.abs(walkCycle)*0.04 : 0;
  const activeMountObj = getActiveMount();
  const waterDepth = activeMountObj?.flying ? 0 : (player.inWater || 0);
  const sinkOffset = waterDepth === 2 ? 3 : waterDepth === 1 ? 1 : 0;
  const walkingFrame=!isDead&&player.moving&&Math.floor(player.walkTimer*10)%2===0;
  const facingBack=!isDead&&player.facingY<0;
  const deathT = isDead ? (deathSeq.done ? 1 : Math.min(1, (deathSeq.timer || 0) / 0.68)) : 0;
  const deathEase = isDead ? (1 - Math.pow(1 - deathT, 3)) : 0;
  
  if (!silhouetteRenderTint && isAbyss && !isDead && player.moving && Math.random() < 0.22 && particles.length < 280) {
    particles.push({
      x: player.x + player.w / 2 + (Math.random() - 0.5) * 12,
      y: player.y + player.h - 6,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -1.2 - Math.random() * 1.6,
      life: 0.65,
      maxLife: 0.65,
      color: 'rgba(140, 225, 255, 0.75)'
    });
  }

  let frame;
  let drawW, drawH;
  let footAdj = 0;
  if (player.customChar && player.imgWalk && player.imgIdle) {
    const isMoving = !isDead && player.moving;
    const img = isMoving ? player.imgWalk : player.imgIdle;
    let row = 0;
    if (!isDead && player.facingY < 0) row = 3;
    else if (!isDead && player.facingY > 0) row = 0;
    else if (player.facing < 0) row = 1;
    else if (player.facing > 0) row = 2;
    const t = isDead ? 0 : (isMoving ? player.walkTimer * 6 : performance.now() / 250);
    const col = Math.floor(t) % 4;
    frame = { image: img, x: col * 24, y: row * 24, w: 24, h: 24 };
    const sizeMult = 1.7;
    drawW = player.w * sizeMult;
    drawH = player.h * sizeMult;
  } else if (player.directionalChar && player.animSheets) {
    const A = player.animSheets;
    const isMoving = !isDead && player.moving;
    const left = player.facing < 0;
    const isBreathingFire = !isDead && (player.fireBreathTimer || 0) > 0 && A.fireBreathRight;
    let sheet, fs, col;
    if (isBreathingFire) {
      sheet = left ? A.fireBreathLeft : A.fireBreathRight;
      fs = A.fireBreathFrame || 256;
      const progress = Math.max(0, Math.min(0.999, 1 - (player.fireBreathTimer / (player.fireBreathMax || 0.52))));
      col = Math.min(7, Math.floor(progress * 8));
      frame = { image: sheet, x: col * fs, y: 0, w: fs, h: fs };
      const fbScale = A.fireBreathScale || (80 / 110);
      drawW = fs * fbScale;
      drawH = drawW;
      footAdj = 0;
      const anchorOffsetX = (left ? 196 : 60) * fbScale;
      const anchorOffsetY = 185 * fbScale;
      customDrawX = px + player.w / 2 - anchorOffsetX;
      customDrawY = py + player.h - anchorOffsetY + bob + (isAbyss ? -4 : sinkOffset);
    } else {
      sheet = isMoving ? (left ? A.walkLeft : A.walkRight) : (left ? A.idleLeft : A.idleRight);
      fs = A.frame || 174;
      const t = isDead ? 0 : (isMoving ? player.walkTimer * 8 : performance.now() / 125);
      col = Math.floor(t) % 8;
      frame = { image: sheet, x: col * fs, y: 0, w: fs, h: fs };
      drawW = fs * (A.scale || 0.4);
      drawH = drawW;
      footAdj = A.foot || 0;
    }
  } else {
    frame=facingBack?(walkingFrame?player.backWalkSprite:player.backSprite):(walkingFrame?player.walkSprite:player.sprite);
    const sizeMult = 1.18;
    drawW = player.w * sizeMult;
    drawH = player.h * sizeMult;
  }
  const stepLift = isDead ? 0 : (player.decorStepOffsetY || 0);
  const drawX = customDrawX !== undefined ? customDrawX : (px + player.w / 2 - drawW / 2);
  const drawY = (customDrawY !== undefined ? customDrawY : (py + player.h - drawH + footAdj + bob + (isAbyss ? -4 : sinkOffset) + deathEase * 8)) + stepLift;
  const fallDir = player.facing < 0 ? -1 : 1;
  const swimTilt = (isAbyss && !isDead)
    ? (player.moving ? (player.facing < 0 ? -0.16 : 0.16) : Math.sin(elapsed * 1.8) * 0.05)
    : 0;
  const deathRot = isDead
    ? (fallDir * (Math.PI / 2) * deathEase)
    : (swimTilt ? swimTilt : (!facingBack && player.moving ? walkCycle * 0.05 : 0));

  if (silhouetteRenderTint) {
    drawSubmergedCharacter(frame, drawX, drawY, drawW, drawH, waterDepth, {
      flipX: (!player.customChar && !player.directionalChar) && player.facing < 0,
      scaleX: facingBack ? 1 : 1 + moveAmount,
      scaleY: facingBack ? 1 : 1 - moveAmount * 0.45,
      rotation: deathRot,
      anchorX: 0.5,
      anchorY: isDead ? 0.82 : 0.5,
      alpha: 1
    });
    return;
  }

  // 7. Visual Ground Shadow: anchored directly at feet (expands into dark crimson pool on death)
  const shadowScaleLift = Math.max(0.72, 1 + stepLift * 0.035);
  const shadowRadiusX = (isAbyss ? player.w * 0.42 : player.w * (0.55 + deathEase * 0.42)) * shadowScaleLift;
  const shadowRadiusY = (isAbyss ? 3.0 : (4 + deathEase * 3.5)) * shadowScaleLift;
  ctx.fillStyle = isDead ? `rgba(92, 10, 16, ${0.42 + deathEase * 0.32})` : (isAbyss ? 'rgba(0, 8, 24, 0.22)' : 'rgba(0, 0, 0, 0.35)');
  ctx.beginPath();
  ctx.ellipse(
    px + player.w / 2 + (isDead ? (player.facing < 0 ? -10 : 10) * deathEase : 0),
    py + player.h - 1 + stepLift * 0.65,
    shadowRadiusX,
    shadowRadiusY,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  const statusFlashAlpha = isDead
    ? (deathT < 0.38 ? (1 - deathT / 0.38) * 0.85 : 0.24)
    : (player.poisonStacks > 0 ? (.35 + .12 * Math.sin(performance.now() / 150)) : (player.slowFactor < .95 ? .3 : 0));
  const statusFlashColor = isDead
    ? (deathT < 0.16 ? '#ffffff' : '#e53935')
    : (player.poisonStacks > 0 ? '#7CFC00' : '#8ac6e8');

  ctx.save();
  if (maskOfCalmActive && !isDead) {
    ctx.shadowColor = '#64b5f6';
    ctx.shadowBlur = 14 + Math.sin(performance.now() / 200) * 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowColor=isDead?'rgba(229,57,53,0.75)':'rgba(255,255,255,0.7)';ctx.shadowBlur=isDead?10:5;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
  }
  drawSubmergedCharacter(frame, drawX, drawY, drawW, drawH, waterDepth, {
    flipX: (!player.customChar && !player.directionalChar) && player.facing < 0,
    scaleX: facingBack ? 1 : 1 + moveAmount,
    scaleY: facingBack ? 1 : 1 - moveAmount * 0.45,
    rotation: deathRot,
    anchorX: 0.5,
    anchorY: isDead ? 0.82 : 0.5,
    alpha: isDead ? 1 : (maskOfCalmActive ? 0.72 : (flash ? .4 : 1)),
    flashAlpha: statusFlashAlpha,
    flashColor: statusFlashColor
  });
  ctx.restore();
  if(!isDead) drawForegroundDecorBootOverlap();
  if(!isDead && campSave && campSave.equippedChickenCrown){
    const crownY = player.directionalChar ? Math.round(drawY + 4) : Math.round(drawY - 12);
    drawSprite('chickenCrown', Math.round(px + player.w/2 - 12), crownY, 24, 20);
  }


  // Universal Fire Breath Stream Overlay (for all characters)
  if (!isDead && (player.fireBreathTimer || 0) > 0) {
    const isLeft = player.facing < 0;
    const fSheet = isLeft ? fireBreathStreamLeftImg : fireBreathStreamImg;
    if (fSheet && (fSheet.complete || fSheet.naturalWidth > 0)) {
      const progress = Math.max(0, Math.min(0.999, 1 - (player.fireBreathTimer / (player.fireBreathMax || 0.52))));
      const col = Math.min(7, Math.floor(progress * 8));
      const frameCellW = 128;
      const streamW = 196;
      const streamH = 148;
      // Positioned precisely at the character's mouth for all characters (including Zak)
      const mouthOffsetY = campSave.character === 'dwarf' ? -110 : -114;
      const streamX = isLeft 
        ? Math.round(px + player.w / 2 - 158) 
        : Math.round(px + player.w / 2 - 38);
      const streamY = Math.round(py + player.h + mouthOffsetY + stepLift + (isAbyss ? -4 : sinkOffset));
      ctx.save();
      ctx.drawImage(
        fSheet,
        col * frameCellW, 0, frameCellW, 128,
        streamX, streamY,
        streamW, streamH
      );
      ctx.restore();
    }
  }
  if(!isDead && player.hp<player.maxHp)drawHealthBar(px+player.w/2,drawY-8,40,player.hp/player.maxHp,'#65df79');
}
function drawHealthBar(cx,y,width,ratio,color){
    const x=Math.round(cx-width/2),top=Math.round(y),h=4;
    const pct=Math.max(0,Math.min(1,ratio));
    ctx.fillStyle='rgba(8,10,14,.9)';ctx.fillRect(x-1,top-1,width+2,h+2);
    ctx.fillStyle='rgba(80,87,96,.9)';ctx.fillRect(x,top,width,h);
    ctx.fillStyle=color;ctx.fillRect(x,top,Math.round(width*pct),h);
    ctx.strokeStyle='rgba(255,255,255,.48)';ctx.lineWidth=1;ctx.strokeRect(x-.5,top-.5,width+1,h+1);
  }
function drawCampCompanion(companion,index){
  const bob=companion.id==='scout'?0:Math.sin(elapsed*4+index)*2;
  const sprite=companion.sprite;
  const compSizes={fox:[42,34],aldric:[42,44],fenrir:[42,40],ashe:[38,38],kael:[36,36],selene:[42,42],morvath:[38,44],healer:[38,44],scout:[38,42]};
  const [width,height]=compSizes[companion.id]||(companion.id==='fox'?[38,30]:companion.id==='scout'?[32,36]:[32,36]);
  const isCompFlying = (companion.id === 'ashe' || companion.id === 'kael' || companion.id === 'selene');
  const waterDepth = isCompFlying ? 0 : (typeof tileAtWorld === 'function' ? tileAtWorld(Math.floor(companion.x/TILE),Math.floor((companion.y + height/2 - 2)/TILE)) : 0);
  const sinkOffset = waterDepth === 2 ? 2 : waterDepth === 1 ? 1 : 0;
  const x=Math.round(companion.x-camera.x);
  const y=Math.round(companion.y-camera.y+bob+sinkOffset);
  const spriteX=Math.round(x-width/2),spriteY=Math.round(y-height/2);
  if (silhouetteRenderTint) {
    drawSubmergedCharacter(sprite,spriteX,spriteY,width,height,waterDepth,{flipX:companion.flipX??companion.x<player.x+player.w/2,rotation:0});
    return;
  }
  drawShadow(x,y+height/2-1,width*.42,.8);
  if(companion.id==='fox'||companion.id==='healer'){
    ctx.save();
    ctx.globalAlpha=.35+.12*Math.sin(elapsed*5+index);
    ctx.fillStyle=companion.id==='fox'?'#ff9d3c':'#8de77a';
    ctx.beginPath();ctx.ellipse(x,y,16,19,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  if(companion.id==='healer'&&companion.healFlash>0){
    ctx.strokeStyle=`rgba(128,232,154,${companion.healFlash*1.3})`;
    ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x+player.w/2-camera.x,player.y+player.h/2-camera.y,38+(0.5-companion.healFlash)*35,0,Math.PI*2);ctx.stroke();
  }
  if(companion.id==='fox'&&companion.attackFlash>0){
    ctx.strokeStyle=`rgba(255,183,75,${companion.attackFlash*4})`;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(x-13,y-9);ctx.lineTo(x+13,y+9);ctx.moveTo(x+10,y-12);ctx.lineTo(x-10,y+12);ctx.stroke();
  }
  drawSubmergedCharacter(sprite,spriteX,spriteY,width,height,waterDepth,{flipX:companion.flipX??companion.x<player.x+player.w/2,rotation:0});
  if(companion.id==='aldric'&&companion.tauntTimer>5){
    ctx.strokeStyle=`rgba(97,184,255,${companion.tauntTimer-5})`;
    ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,32,0,Math.PI*2);ctx.stroke();
  }
  if(companion.id==='fenrir'&&companion.packKillCount>=3){
    ctx.save();
    ctx.shadowColor='#ffd54f';ctx.shadowBlur=15;
    drawEntitySprite(companion.sprite,spriteX,spriteY,width,height,{flipX:companion.flipX});
    ctx.restore();
  }
  if(companion.id==='selene'&&companion.attackFlash>0){
    ctx.fillStyle=`rgba(201,140,255,${companion.attackFlash*4})`;
    ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();
    companion.attackFlash-=1/60;
  }
  if(companion.id==='morvath'&&companion.summons){
    for(const s of companion.summons){
      if(s.life>0){
        ctx.strokeStyle='rgba(179,136,255,0.28)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(s.x-camera.x,s.y-camera.y);ctx.stroke();
      }
    }
  }
  if(companion.id==='ashe'){
    ctx.strokeStyle=`rgba(255,152,0,${0.3+0.2*Math.sin(elapsed*5)})`;
    ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,90,0,Math.PI*2);ctx.stroke();
  }
  if(companion.id==='scout'||companion.id==='healer'){
    const marker=companion.id==='scout'?'rpg_bow':'rpg_potion_green';
    drawSprite(marker,x-7,y-height/2-18,14,14);
  }
}

function drawEnemy(e){
  if(!e || typeof e !== 'object') return;
  const ex=e.x-camera.x,ey=e.y-camera.y;
  const t=ENEMY_TYPES[e.type];
  const isWhale = (e.type === 'abyss_whale_1' || e.type === 'abyss_whale_2' || e.type === 'abyss_whale');
  const isKraken = (e.type === 'abyss_octopus' || e.type === 'Abyssal_kraken');
  const isAquaticDrifter = isWhale || isKraken;
  const isFishOnLand = (e.type === 'fish' && (e.inWater === 0 || !e.inWater));
  const isFrozen = Boolean(e.frozen || (e.frozenTimer && e.frozenTimer > 0));
  const now = currentFrameNow;

  // ── Creature Classifications ──
  const isHumanoid = (
    e.type === 'zombie' || e.type === 'rotZombie' || e.type === 'volcano_ash_zombie' ||
    e.type === 'skeleton' || e.type === 'skeletonArcher' || e.type === 'mummy' ||
    e.type === 'vampire' || e.type === 'vampireLord' || e.isVampireLord ||
    e.type === 'goblin' || e.type === 'plains_goblin' || e.type === 'plains_brute' || e.type === 'plains_archer' ||
    e.type === 'bandit' || e.type === 'banditWarlord' || e.type === 'dead_knight' || e.type === 'dead_ghoul' ||
    e.type === 'dwarfMiner' || e.type === 'dwarfGuard' || e.type === 'dwarfRunesmith' ||
    e.type === 'sandKnight' || e.type === 'imp' || e.type === 'lichKing' || e.type === 'pharaoh'
  );
  const isAnimal = (
    e.type === 'wolf' || e.type === 'direWolf' || e.type === 'frostWolf' || e.type === 'volcano_hound' ||
    e.type === 'bear' || e.type === 'boar' || e.type === 'lion' || e.type === 'tiger' || e.type === 'panther' ||
    e.type === 'badlands_coyote' || e.type === 'crocodile'
  );
  const isFlyer = (
    e.type === 'bat' || e.type === 'ghostBat' || e.type === 'iceBat' || e.type === 'fireBat' ||
    e.type === 'ghost' || e.type === 'wraith' || e.type === 'banshee' || e.type === 'wisp' ||
    e.type === 'fairy' || e.type === 'rpg_fairy' || e.type === 'voidSpirit' || e.type === 'rpg_voidSpirit' || e.type === 'giantMoth' || e.type === 'crow' || e.type === 'desert_vulture'
  );

  // ── Procedural Speed, Walk Cycle & Animation Timers (Grounded & Subtle) ──
  const lastVx = e.lastVx || 0;
  const lastVy = e.lastVy || 0;
  const speed = Math.hypot(lastVx, lastVy) || (e.speed || 1);
  const isMoving = speed > 0.1 && (Math.abs(lastVx) > 0.01 || Math.abs(lastVy) > 0.01);
  const speedRatio = isFrozen ? 0 : (isMoving ? Math.min(1.0, speed / 2.2) : 0);
  const animTime = e.animTimer !== undefined ? e.animTimer : (now * 0.001);
  const walkPhase = animTime * 9;

  // ── Unified Walking Squash & Stretch (Vampire / Ground Mob Step: 5% / 4%) ──
  const hasMonsterAnim = Boolean(MONSTER_ANIMATIONS?.[e.sprite] || MONSTER_ANIMATIONS?.[e.type]);
  const squash = hasMonsterAnim ? 1 : (1 + Math.sin(walkPhase * 2) * 0.05 * speedRatio);
  const stretch = hasMonsterAnim ? 1 : (1 - Math.sin(walkPhase * 2) * 0.04 * speedRatio);

  // ── Hover & Aquatic Undulation ──
  const hover = (isAquaticDrifter || isFrozen || isFishOnLand) ? 0 : ((e.type==='bat'||e.type==='ghost'||e.type==='wraith'||e.type==='banshee'||e.type==='wisp'||e.type==='fairy'||e.type==='rpg_fairy'||e.type==='voidSpirit'||e.type==='rpg_voidSpirit'||e.type==='fish'||e.type==='jellyfish'||e.type==='vampire'||e.type==='vampireLord')?Math.sin((e.wobble||0)*3 + now*0.005)*2:0);
  const swimUndulation = (isWhale && !isFrozen) ? Math.sin(now * 0.0012 + (e.swimSeed || 0)) * 8 : 0;
  const krakenTime = now * 0.0014 + (e.swimSeed || 0);
  const krakenBob = (isKraken && !isFrozen) ? Math.sin(krakenTime) * 3.5 : 0;
  const krakenSwell = isKraken ? (1.0 + Math.sin(krakenTime * 2) * 0.022) : 1.0;
  const krakenTilt = (isKraken && !isFrozen) ? (Math.cos(krakenTime) * (e.flipX ? -0.025 : 0.025)) : 0;

  // ── Bobbing & Leaping ──
  let bob = 0;
  if (!isFrozen) {
    if (isWhale) {
      bob = swimUndulation;
    } else if (isKraken) {
      bob = krakenBob;
    } else if (!isFishOnLand) {
      if (!isMoving) {
        // Idle Animation: very gentle 0.8px breathing
        const idleBob = Math.sin(now * 0.002 + (e.wobble || 0)) * 0.8;
        bob = idleBob;
      } else {
        // Walk Bob: solid 2.0px arcade step (Vampire / humanoid cadence for all walking mobs)
        bob = hasMonsterAnim ? 0 : Math.abs(Math.sin(walkPhase)) * 2.0 * speedRatio;
      }
      if (e.type === 'ghost') bob += Math.abs(Math.sin(walkPhase)) * 1.0;
      if (e.type === 'slime') bob += Math.sin((e.wobble || 0) * 4) * 1.2;
    }
  }

  // ── Tilt (Subtle 3°–5° grounded lean, upright posture) ──
  const normVx = Math.abs(lastVx) > 0.01 ? (lastVx / (speed || 1)) : 0;
  let mobTilt = 0;
  if (!isFrozen) {
    if (isFlyer) {
      // Flyer tilt: gentle 4° banking sway
      mobTilt = (Math.sin(now * 0.003 + (e.wobble || 0)) * 0.08) + (normVx * 0.05);
    } else {
      // Ground walking mobs (Vampire / humanoid / 4-legged walk): ~2° subtle swagger + ~3° directional lean
      mobTilt = hasMonsterAnim ? (normVx * 0.02) : ((Math.sin(walkPhase) * 0.035 * speedRatio) + (normVx * 0.05));
    }
  }

  const isBoss=Boolean(t?.boss);
  let effectiveTilt = isFrozen ? 0 : mobTilt;
  if (!isFrozen && (isBoss || e.type === 'plainsBoss' || e.type === 'bloodLord') && !isKraken) {
    const pdx = (player.x + player.w / 2) - e.x;
    const pdy = (player.y + player.h / 2) - e.y;
    if (Math.abs(pdx) > 3) {
      e.flipX = pdx < 0;
    }
    const forwardLean = Math.max(-0.06, Math.min(0.06, (pdy / (Math.hypot(pdx, pdy) || 1)) * 0.06));
    effectiveTilt = (e.flipX ? -forwardLean : forwardLean) + Math.sin(walkPhase) * 0.02;
  } else if (!isFrozen && isKraken) {
    const pdx = (player.x + player.w / 2) - e.x;
    if (Math.abs(pdx) > 3) {
      e.flipX = pdx < 0;
    }
    effectiveTilt = krakenTilt;
  } else if (!isFrozen && isWhale) {
    effectiveTilt = Math.cos(now * 0.0012 + (e.swimSeed || 0)) * (e.flipX ? -0.04 : 0.04);
  }

  // ── Hit Reaction & Knockback Impulse (Crisp 5px flinch) ──
  const hitRatio = (isWhale || e.passive || isFrozen) ? 0 : (e.hitFlash > 0 ? Math.min(1, e.hitFlash * 8.5) : 0);
  const hitPunch = isFrozen ? 0 : hitRatio * 0.07;
  let hitKbX = 0;
  let hitKbY = 0;
  if (e.hitFlash > 0 && !isWhale && !isKraken) {
    const kb = (e.hitFlash / 0.12) * 5; // Clean 5px impact displacement
    if (isMoving) {
      hitKbX = -normVx * kb;
      hitKbY = -(lastVy / (speed || 1)) * kb;
    } else {
      const pdx = (player.x + player.w / 2) - e.x;
      const pdy = (player.y + player.h / 2) - e.y;
      const pdist = Math.hypot(pdx, pdy) || 1;
      hitKbX = -(pdx / pdist) * kb;
      hitKbY = -(pdy / pdist) * kb;
    }
  }

  // ── Death Animation (Fade & Scale Down) ──
  let deathScale = 1;
  let deathAlpha = 1;
  if (e.deathTimer > 0) {
    const t = Math.max(0, Math.min(1, e.deathTimer / 0.3));
    deathAlpha = t;
    deathScale = t;
  }

  const bossVisualScale = (isBoss && !isKraken) ? 1.45 : 1.0;
  const mobVisualScale = isBoss ? bossVisualScale : 1.18;
  const drawW = Math.round(e.w * mobVisualScale);
  const drawH = Math.round(e.h * mobVisualScale);

  const fishJumpY = (isFishOnLand && e.jumpHeight) ? e.jumpHeight : 0;
  let fishTilt = 0;
  let fishScaleX = 1;
  let fishScaleY = 1;
  if (isFishOnLand && !isFrozen) {
    if (e.jumpAirborne) {
      const t = e.jumpProgress || 0;
      const pitch = (0.5 - t) * 0.6;
      fishTilt = (e.flipX ? -pitch : pitch);
    }
  }
  if (isFishOnLand) {
    effectiveTilt = fishTilt;
  }

  // ── Effective Scale Computation ──
  let effectiveScaleX = 1;
  let effectiveScaleY = 1;
  if (isFrozen) {
    effectiveScaleX = 1;
    effectiveScaleY = 1;
  } else if (isFishOnLand) {
    effectiveScaleX = fishScaleX;
    effectiveScaleY = fishScaleY;
  } else if (isKraken) {
    effectiveScaleX = krakenSwell * (1 + hitPunch);
    effectiveScaleY = (2 - krakenSwell) * (1 - hitPunch * 0.35);
  } else {
    let baseSquash = squash;
    let baseStretch = stretch;
    if (e.type === 'slime') {
      baseSquash *= (1 + Math.sin(walkPhase * 2) * 0.10);
      baseStretch *= (1 - Math.sin(walkPhase * 2) * 0.10);
    }
    effectiveScaleX = baseSquash * (1 + hitPunch);
    effectiveScaleY = baseStretch * (1 - hitPunch * 0.35);
  }
  if (e.deathTimer > 0) {
    effectiveScaleX *= deathScale;
    effectiveScaleY *= deathScale;
  }

  const animDef = MONSTER_ANIMATIONS?.[e.sprite] || MONSTER_ANIMATIONS?.[e.type];
  const isMountainMob = Boolean(animDef?.isMountainMob || (typeof e.type === 'string' && e.type.includes('_mountain')) || (typeof e.sprite === 'string' && e.sprite.includes('_mountain')));
  const isFlyerMob = Boolean(animDef?.isFlyer || (typeof e.type === 'string' && (e.type.includes('fly') || e.type.includes('grifin'))));

  const groundY = Math.round(ey + e.h / 2 - 2);
  const enemySpriteX = Math.round(ex - drawW / 2 + hitKbX);
  let enemySpriteY = 0;
  let mobShadowW = drawW * 0.40;
  let mobShadowScale = (isBoss ? 1.5 : 1.0) * deathScale;

  if (e.windupTelegraph && typeof e.telegraphAngle === 'number') {
    ctx.save();
    const len = 240;
    const endX = ex + Math.cos(e.telegraphAngle) * len;
    const endY = groundY + Math.sin(e.telegraphAngle) * len;
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.018);
    ctx.strokeStyle = `rgba(255, 23, 68, ${0.45 + pulse * 0.45})`;
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(ex, groundY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(endX, endY, 5 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (isMountainMob) {
    const footRatio = animDef?.footRatio || 0.785;
    const mobDh = Math.max(drawW, drawH) * 1.40;
    mobShadowW = drawW * 0.60;
    if (isFlyerMob) {
      // Flying mountain mob: ground shadow with airborne wing hover
      const flightHover = -28 + Math.sin(now * 0.0035 + (e.wobble || 0)) * 6;
      enemySpriteY = Math.round(groundY + flightHover - drawH * 0.5 - (footRatio - 0.5) * mobDh + hitKbY);
      mobShadowScale = 0.85 * deathScale;
      mobShadowW = drawW * 0.46;
    } else {
      // Ground mountain mob: feet anchored firmly right on ground level with natural step bob
      const walkBob = (isMoving && !isFrozen) ? Math.abs(Math.sin(walkPhase)) * 2.0 : 0;
      enemySpriteY = Math.round(groundY - walkBob - drawH * 0.5 - (footRatio - 0.5) * mobDh + hitKbY);
      mobShadowScale = 1.45 * deathScale;
    }
  } else {
    enemySpriteY = Math.round(ey + e.h / 2 - drawH + bob + hover - fishJumpY + hitKbY);
    mobShadowScale = (isFishOnLand ? Math.max(0.45, 1 - (fishJumpY / 22) * 0.45) : (isBoss ? 1.5 : 1)) * deathScale;
  }

  const isLeftFacing = LEFT_FACING_ENEMY_SPRITES.has(e.sprite) || LEFT_FACING_ENEMY_SPRITES.has(e.type);
  const finalFlipX = isLeftFacing ? !e.flipX : Boolean(e.flipX);

  if (silhouetteRenderTint) {
    const silOpts = {
      flipX: finalFlipX,
      scaleX: effectiveScaleX,
      scaleY: effectiveScaleY,
      rotation: isFrozen ? 0 : effectiveTilt,
      alpha: deathAlpha,
      animTime,
      isMoving,
      isFrozen,
      speedRatio,
      type: e.type
    };
    drawEntitySprite(e.sprite, enemySpriteX, enemySpriteY, drawW, drawH, silOpts);
    return;
  }

  if(e.type==='iceGolem'||e.type==='iceTitan'){
    drawCachedRadialGlow(ex,ey,e.type==='iceTitan'?220:130,'138,198,232',0.25,false);
  }
  if(e.type==='swampHorror'){
    drawCachedRadialGlow(ex,ey,190,'120,200,100',0.25,false);
  }
  if(e.isVampireLord){
    drawCachedRadialGlow(ex,ey,210,'183,28,28',0.4,false);
  }
  if(e.isHunter){
    drawCachedRadialGlow(ex,ey,Math.max(drawW,drawH)*1.4,'229,57,53',0.45,true);
  }
  if(e.isRitualist){
    drawCachedRadialGlow(ex,ey,Math.max(drawW,drawH)*1.25,'171,71,188',0.4,true);
  }
  if(e.isFalling){
    drawCachedRadialGlow(ex,ey,Math.max(drawW,drawH)*1.3,'128,222,234',0.45,true);
  }
  if(e.isPhalanx){
    const shieldAngle = Math.atan2(e.phalanxDirY || (player.y - e.y), e.phalanxDirX || (player.x - e.x));
    const sx = ex + Math.cos(shieldAngle) * (drawW * 0.42);
    const sy = ey + Math.sin(shieldAngle) * (drawH * 0.42);
    ctx.save();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(drawW, drawH) * 0.42, shieldAngle - Math.PI * 0.35, shieldAngle + Math.PI * 0.35);
    ctx.stroke();
    drawCachedRadialGlow(sx, sy, Math.max(drawW, drawH) * 0.6, '255,213,79', 0.35, false);
    ctx.restore();
  }

  // Champion Affix Visual Auras
  if(e.championAffix === 'juggernaut'){
    drawCachedRadialGlow(ex, ey, Math.max(drawW, drawH) * 1.35, '189,189,189', 0.45, true);
    ctx.save();
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(ex, ey, Math.max(drawW, drawH) * 0.52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if(e.championAffix === 'speedDemon'){
    drawCachedRadialGlow(ex, ey, Math.max(drawW, drawH) * 1.35, '255,152,0', 0.45, true);
  } else if(e.championAffix === 'barrier' && e.barrierHits > 0){
    drawCachedRadialGlow(ex, ey, Math.max(drawW, drawH) * 1.4, '0,229,255', 0.45, true);
    ctx.save();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(ex, ey, Math.max(drawW, drawH) * 0.55, now * 0.003, now * 0.003 + Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if(e.championAffix === 'volatile'){
    drawCachedRadialGlow(ex, ey, Math.max(drawW, drawH) * 1.35, '255,87,34', 0.45, true);
  }
  let outlineColor=null;
  if(!isKraken && (e.elite||isBoss||e.isHunter||e.isRitualist)){
    const pulse=.82+.18*Math.sin(now*.004+(e.wobble||0));
    const glowRadius=Math.max(drawW,drawH)*(isBoss?1.35:e.ultraElite?1.35:e.isHunter?1.25:1.05);
    const glowColor=e.ultraElite?'224,64,251':(isBoss?(e.phase===3?'255,0,0':e.phase===2?'255,170,0':'239,83,80'):e.isHunter?'229,57,53':e.isRitualist?'171,71,188':'255,213,79');
    drawCachedRadialGlow(ex,ey+e.h/2-drawH/2,glowRadius,glowColor,(isBoss ? .48 : e.ultraElite ? .45 : .36)*pulse,true);
    outlineColor=e.ultraElite?'#e040fb':(isBoss?(e.phase===3?'#ff0000':e.phase===2?'#ffaa00':'#ff3939'):e.isHunter?'#ef5350':e.isRitualist?'#ba68c8':'#ffd54f');
  }
  if (isKraken && e.phase >= 2) {
    ctx.save();
    const swirlAngle = (now * 0.0028) % (Math.PI * 2);
    const maxR = e.phase === 3 ? 240 : 180;
    for (let r = 80; r <= maxR; r += 50) {
      const a = (1 - (r / maxR)) * (e.phase === 3 ? 0.35 : 0.22);
      ctx.strokeStyle = `rgba(0, 229, 255, ${a})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(ex, ey, r, r * 0.42, swirlAngle + r * 0.03, 0, Math.PI * 1.7);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (!isWhale && !isKraken) {
    drawShadow(ex + hitKbX, groundY, mobShadowW, mobShadowScale);
  }
  const baseAlpha=e.type==='ghost'||e.type==='wraith'||e.type==='banshee'||e.type==='wisp' ? .78 : 1;
  const alpha=baseAlpha * deathAlpha;
  const flashAlpha = isFrozen ? 0.35 : hitRatio;
  const flashColor = isFrozen ? '#ffffff' : '#fff8e7';
  const effectiveOutline = outlineColor;
  const enemySpriteOpts={
    flipX: finalFlipX,
    scaleX: effectiveScaleX,
    scaleY: effectiveScaleY,
    rotation: isFrozen ? 0 : effectiveTilt,
    alpha,
    flashAlpha,
    flashColor,
    outlineColor: effectiveOutline,
    animTime,
    isMoving,
    isFrozen,
    speedRatio,
    type: e.type
  };
  if(!isWhale && !e.passive && e.markedTimer>0){
    ctx.fillStyle='#61b8ff';ctx.beginPath();ctx.arc(ex,enemySpriteY-10,3,0,Math.PI*2);ctx.fill();
  }
  const isFlying = isFlyingEnemy(e);
  const isBigOrBoss = isLargeOrBossEnemy(e);
  const shouldSubmerge = (e.inWater > 0) && !isFlying && !isBigOrBoss;
  if (shouldSubmerge) {
    drawSubmergedCharacter(e.sprite, enemySpriteX, enemySpriteY, drawW, drawH, e.inWater, enemySpriteOpts);
  } else {
    drawEntitySprite(e.sprite, enemySpriteX, enemySpriteY, drawW, drawH, enemySpriteOpts);
    if (isBigOrBoss && e.inWater > 0 && !isFlying) {
      ctx.save();
      ctx.strokeStyle = 'rgba(180, 230, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ex, enemySpriteY + drawH - 4, drawW * 0.35, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  if(e.type==='wolf'&&e.role==='leader'){
    ctx.fillStyle='#ffd54f';ctx.beginPath();ctx.arc(ex,enemySpriteY-8,3,0,Math.PI*2);ctx.fill();
  }

  const isDamaged = (e.ultraElite || (e.hp < e.maxHp) || Boolean(e.showHpTimer && e.showHpTimer > 0)) && (!e.deathTimer || e.deathTimer <= 0);
  if(!isWhale && !e.passive && !ENEMY_TYPES[e.type]?.passive && isDamaged){
    const barWidth = isKraken ? 250 : Math.max(isBoss ? 84 : 34, drawW * 0.65 + (e.ultraElite ? 24 : e.elite ? 14 : 6));
    const barY=enemySpriteY-10;
    const barColor=e.ultraElite?'#e040fb':e.elite?'#ffd54f':isBoss?'#ef5350':e.hp/e.maxHp>.55?'#62d978':e.hp/e.maxHp>.25?'#ffd34e':'#ef5350';
    drawHealthBar(ex,barY,barWidth,e.hp/e.maxHp,barColor);
    if(e.ultraElite){
      ctx.save();
      ctx.font='bold 8px monospace';
      ctx.textAlign='center';
      ctx.textBaseline='bottom';
      ctx.fillStyle='#e040fb';
      ctx.shadowColor='#000';
      ctx.shadowBlur=4;
      ctx.fillText(`★ ${e.eliteName || 'ULTRA ELITE'} ★`,ex,barY-2);
      ctx.restore();
    } else if(e.elite){
      ctx.save();ctx.font='7px monospace';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillStyle='#ffd54f';ctx.fillText(e.eliteName||'ELITE',ex,barY-2);ctx.restore();
    }
  }
}
let fogBlurCanvas = null, fogBlurCtx = null;
let lastFogCamX = -999999, lastFogCamY = -999999;
let lastFogPlayerX = -999999, lastFogPlayerY = -999999;
let lastFogRevealVer = -1;
let lastFogLegacy = false;

function drawFogOfWar(){
  if(window.RENDER_DEBUG && window.RENDER_DEBUG.fog === false) return;
  if(window.GAME_SETTINGS && window.GAME_SETTINGS.enableFog === false) return;
  if(!gameStarted||gameOver)return;
  // 1. Underground depth vignette: creates subtle atmospheric abyss darkness when deep inside underworld caves
  const inUnder = player.x > 100000*TILE && player.x < 300000*TILE
               && player.y > 100000*TILE && player.y < 300000*TILE;
  if (inUnder) {
    const vx = player.x + player.w/2 - camera.x;
    const vy = player.y + player.h/2 - camera.y;
    if (Number.isFinite(vx) && Number.isFinite(vy)) {
      const vg = ctx.createRadialGradient(vx, vy, 180, vx, vy, 640);
      vg.addColorStop(0, 'rgba(14,10,24,0)');
      vg.addColorStop(0.70, 'rgba(14,10,24,0.15)');
      vg.addColorStop(1, 'rgba(10,7,18,0.45)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, VW(), VH());
    }
    return;
  }

  // 2. Surface Soft Fog of War: smooth, organic, feathered boundary for unexplored lands (zero rectangular steps)
  const minX = Math.floor(camera.x / TILE) - 2;
  const maxX = Math.floor((camera.x + VW()) / TILE) + 2;
  const minY = Math.floor(camera.y / TILE) - 2;
  const maxY = Math.floor((camera.y + VH()) / TILE) + 2;

  // Fast check: if all tiles in view are already revealed, skip surface fog entirely
  let hasUnexplored = false;
  for (let ty = minY; ty <= maxY; ty++) {
    for (let tx = minX; tx <= maxX; tx++) {
      if (!hasRevealedTile(tx, ty)) {
        hasUnexplored = true;
        break;
      }
    }
    if (hasUnexplored) break;
  }
  if (!hasUnexplored) return;

  const isLegacy = Boolean(window.LEGACY_FOG_BLUR || window.GAME_SETTINGS?.legacyFogBlur);
  const zScale = Math.min(1, typeof viewZoom === 'function' ? viewZoom() : 1);
  const scale = 0.18 * zScale;
  const maskW = Math.max(10, Math.ceil(VW() * scale));
  const maskH = Math.max(10, Math.ceil(VH() * scale));

  if (!worldFogCanvas) {
    worldFogCanvas = document.createElement('canvas');
    worldFogCanvas.width = maskW;
    worldFogCanvas.height = maskH;
    worldFogCtx = worldFogCanvas.getContext('2d');
  } else if (worldFogCanvas.width !== maskW || worldFogCanvas.height !== maskH) {
    worldFogCanvas.width = maskW;
    worldFogCanvas.height = maskH;
  }

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const moveThreshold = 6;
  const camMoved = Math.hypot(camera.x - lastFogCamX, camera.y - lastFogCamY) >= moveThreshold;
  const playerMoved = Math.hypot(px - lastFogPlayerX, py - lastFogPlayerY) >= moveThreshold;
  const revChanged = lastFogRevealVer !== fogRevealVersion;
  const legacyChanged = lastFogLegacy !== isLegacy;
  const needsRedraw = camMoved || playerMoved || revChanged || legacyChanged;

  if (needsRedraw) {
    lastFogCamX = camera.x;
    lastFogCamY = camera.y;
    lastFogPlayerX = px;
    lastFogPlayerY = py;
    lastFogRevealVer = fogRevealVersion;
    lastFogLegacy = isLegacy;

    worldFogCtx.clearRect(0, 0, maskW, maskH);
    worldFogCtx.fillStyle = 'rgba(10, 16, 24, 0.70)';
    worldFogCtx.fillRect(0, 0, maskW, maskH);

    // Punch out clear vision holes with destination-out
    worldFogCtx.globalCompositeOperation = 'destination-out';

    // Organic circular vision punches (batched into single path for max performance)
    const discR = Math.max(4, (TILE * 1.15) * scale);
    worldFogCtx.fillStyle = 'rgba(0, 0, 0, 1)';
    worldFogCtx.beginPath();
    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        if (hasRevealedTile(tx, ty)) {
          const cx = (tx * TILE + TILE / 2 - camera.x) * scale;
          const cy = (ty * TILE + TILE / 2 - camera.y) * scale;
          worldFogCtx.moveTo(cx + discR, cy);
          worldFogCtx.arc(cx, cy, discR, 0, Math.PI * 2);
        }
      }
    }
    worldFogCtx.fill();

    // Wide, feathered daylight aura around player (keeps player area 100% bright & clear)
    const cpx = (px - camera.x) * scale;
    const cpy = (py - camera.y) * scale;
    const visionRad = Math.max(60, (FOG_REVEAL_RADIUS * TILE * 1.05) * scale);
    const pGrad = worldFogCtx.createRadialGradient(cpx, cpy, visionRad * 0.55, cpx, cpy, visionRad);
    pGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    worldFogCtx.fillStyle = pGrad;
    worldFogCtx.beginPath();
    worldFogCtx.arc(cpx, cpy, visionRad, 0, Math.PI * 2);
    worldFogCtx.fill();

    // If inside or near a mountain, punch out the mountain clearing organically using continuous mountain influence
    if (window.getMountainInfluence && (window.isInsideAnyMountain?.(player.x, player.y, 600) || window.isNearMountainEntrancePass?.(player.x, player.y, 500))) {
      const mR = discR * 1.35;
      worldFogCtx.beginPath();
      for (let ty = minY; ty <= maxY; ty++) {
        for (let tx = minX; tx <= maxX; tx++) {
          const inf = window.getMountainInfluence(tx * TILE, ty * TILE);
          if (inf && inf.weight > 0.05) {
            const cx = (tx * TILE + TILE / 2 - camera.x) * scale;
            const cy = (ty * TILE + TILE / 2 - camera.y) * scale;
            worldFogCtx.moveTo(cx + mR, cy);
            worldFogCtx.arc(cx, cy, mR, 0, Math.PI * 2);
          }
        }
      }
      worldFogCtx.fill();
    }

    worldFogCtx.globalCompositeOperation = 'source-over';

    // If not legacy, apply cheap GPU-friendly softening pass on low-res canvas
    if (!isLegacy) {
      if (!fogBlurCanvas) {
        fogBlurCanvas = document.createElement('canvas');
      }
      const halfW = Math.max(5, Math.ceil(maskW * 0.5));
      const halfH = Math.max(5, Math.ceil(maskH * 0.5));
      if (fogBlurCanvas.width !== halfW || fogBlurCanvas.height !== halfH) {
        fogBlurCanvas.width = halfW;
        fogBlurCanvas.height = halfH;
        fogBlurCtx = fogBlurCanvas.getContext('2d');
      }
      fogBlurCtx.imageSmoothingEnabled = true;
      fogBlurCtx.imageSmoothingQuality = 'low';
      fogBlurCtx.clearRect(0, 0, halfW, halfH);
      fogBlurCtx.drawImage(worldFogCanvas, 0, 0, halfW, halfH);

      worldFogCtx.imageSmoothingEnabled = true;
      worldFogCtx.imageSmoothingQuality = 'low';
      worldFogCtx.clearRect(0, 0, maskW, maskH);

      // Multi-tap softening: blend small offsets to feather circular cloud edges smoothly
      worldFogCtx.globalAlpha = 0.25;
      worldFogCtx.drawImage(fogBlurCanvas, -1.0, 0, maskW, maskH);
      worldFogCtx.drawImage(fogBlurCanvas,  1.0, 0, maskW, maskH);
      worldFogCtx.drawImage(fogBlurCanvas,  0, -1.0, maskW, maskH);
      worldFogCtx.drawImage(fogBlurCanvas,  0,  1.0, maskW, maskH);
      worldFogCtx.globalAlpha = 1.0;
    }
  }

  // Draw onto main canvas
  ctx.save();
  if (isLegacy) {
    ctx.filter = 'blur(10px)';
    ctx.drawImage(worldFogCanvas, 0, 0, VW(), VH());
  } else {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';
    ctx.drawImage(worldFogCanvas, 0, 0, VW(), VH());
  }
  ctx.restore();
}
let minimapTerrainCanvas = null, minimapTerrainCtx = null;
let minimapFogCanvas = null, minimapFogCtx = null;
let worldFogCanvas = null, worldFogCtx = null;
let minimapCacheKey = '', lastMinimapDrawAt = 0;
let minimapZoom = 1.0;
let minimapPanX = 0; // in world tiles
let minimapPanY = 0; // in world tiles
let isDraggingMinimap = false;
let dragStartX = 0, dragStartY = 0;
let panStartX = 0, panStartY = 0;
let minimapListenersAttached = false;
const discoveredMountains = new Set();

function setMinimapZoom(newZoom) {
  minimapZoom = Math.max(0.5, Math.min(3.0, Math.round(newZoom * 100) / 100));
  if (minimapZoom <= 1.0) {
    minimapPanX = 0;
    minimapPanY = 0;
  }
  const badge = document.getElementById('minimapZoomBadge');
  if (badge) badge.textContent = minimapZoom.toFixed(1) + 'x';
  const map = document.getElementById('minimap');
  if (map) map.style.cursor = minimapZoom > 1.0 ? 'grab' : 'default';
}

function resetMinimapView() {
  minimapZoom = 1.0;
  minimapPanX = 0;
  minimapPanY = 0;
  isDraggingMinimap = false;
  const badge = document.getElementById('minimapZoomBadge');
  if (badge) badge.textContent = '1.0x';
  const map = document.getElementById('minimap');
  if (map) map.style.cursor = 'default';
}

if (typeof window !== 'undefined') {
  window.setMinimapZoom = setMinimapZoom;
  window.resetMinimapView = resetMinimapView;
}

function attachMinimapListeners() {
  if (minimapListenersAttached) return;
  const map = document.getElementById('minimap');
  const panel = document.getElementById('minimapPanel');
  if (!map || !panel) return;
  minimapListenersAttached = true;

  document.getElementById('minimapZoomIn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMinimapZoom(minimapZoom + 0.25);
  });

  document.getElementById('minimapZoomOut')?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMinimapZoom(minimapZoom - 0.25);
  });

  document.getElementById('minimapRecenter')?.addEventListener('click', (e) => {
    e.stopPropagation();
    minimapPanX = 0;
    minimapPanY = 0;
    const badge = document.getElementById('minimapZoomBadge');
    if (badge) badge.textContent = minimapZoom.toFixed(1) + 'x';
  });

  panel.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setMinimapZoom(minimapZoom + delta);
  }, { passive: false });

  map.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || minimapZoom <= 1.0) return;
    isDraggingMinimap = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = minimapPanX;
    panStartY = minimapPanY;
    map.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingMinimap) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    const effectiveCell = 5 * minimapZoom;
    minimapPanX = panStartX - (dx / effectiveCell);
    minimapPanY = panStartY - (dy / effectiveCell);
    const maxPan = 60;
    minimapPanX = Math.max(-maxPan, Math.min(maxPan, minimapPanX));
    minimapPanY = Math.max(-maxPan, Math.min(maxPan, minimapPanY));
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingMinimap) {
      isDraggingMinimap = false;
      map.style.cursor = minimapZoom > 1.0 ? 'grab' : 'default';
    }
  });

  map.addEventListener('dblclick', (e) => {
    e.preventDefault();
    minimapPanX = 0;
    minimapPanY = 0;
  });
}

function drawMinimapPlayer(ctx, x, y, angle, now) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Soft pulsing golden halo
  const pulse = Math.sin(now * 0.007) * 1.5;
  ctx.fillStyle = 'rgba(255, 220, 100, 0.28)';
  ctx.beginPath();
  ctx.arc(0, 0, 7.5 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // Dark drop shadow/stroke
  ctx.fillStyle = '#0f171c';
  ctx.beginPath();
  ctx.moveTo(8.5, 0);
  ctx.lineTo(-6.5, -6);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-6.5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Crisp golden chevron
  ctx.fillStyle = '#ffd54f';
  ctx.beginPath();
  ctx.moveTo(7.2, 0);
  ctx.lineTo(-5.2, -4.6);
  ctx.lineTo(-2.2, 0);
  ctx.lineTo(-5.2, 4.6);
  ctx.closePath();
  ctx.fill();

  // Inner highlight
  ctx.strokeStyle = '#fff8e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function drawMinimapBoss(ctx, x, y, now) {
  ctx.save();
  const pulse = Math.sin(now * 0.008);
  ctx.strokeStyle = `rgba(255, 50, 50, ${0.45 + 0.35 * pulse})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, 7 + pulse * 1.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#4a080c';
  ctx.beginPath();
  ctx.arc(x, y, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // Horned skull glyph
  ctx.fillStyle = '#fff0f0';
  ctx.beginPath();
  ctx.arc(x, y - 0.8, 2.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 1.4, y + 1, 2.8, 1.8);
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.moveTo(x - 2.5, y - 1); ctx.lineTo(x - 4.5, y - 4); ctx.lineTo(x - 1.5, y - 2.5); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 2.5, y - 1); ctx.lineTo(x + 4.5, y - 4); ctx.lineTo(x + 1.5, y - 2.5); ctx.fill();
  ctx.fillStyle = '#4a080c';
  ctx.fillRect(x - 1.6, y - 1.2, 1.1, 1.2);
  ctx.fillRect(x + 0.5, y - 1.2, 1.1, 1.2);
  ctx.restore();
}

function drawMinimapRelic(ctx, x, y, color = '#e398ff', now) {
  ctx.save();
  const pulse = Math.sin(now * 0.005);
  ctx.fillStyle = 'rgba(227, 152, 255, 0.32)';
  ctx.beginPath();
  ctx.arc(x, y, 6.5 + pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3b0764';
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x + 5.5, y);
  ctx.lineTo(x, y + 6);
  ctx.lineTo(x - 5.5, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 3.8);
  ctx.lineTo(x + 2.5, y);
  ctx.lineTo(x, y + 3.8);
  ctx.lineTo(x - 2.5, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
  ctx.restore();
}

function drawMinimapNPC(ctx, x, y, color = '#ffd700', now) {
  ctx.save();
  ctx.fillStyle = '#0f291e';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 1.5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y + 3.2, 2.6, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

function drawMinimapMountain(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // Dual mountain peaks
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(x - 4.5, y + 3.5);
  ctx.lineTo(x - 2, y - 1.5);
  ctx.lineTo(x + 0.5, y + 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x - 2.8, y);
  ctx.lineTo(x - 2, y - 1.5);
  ctx.lineTo(x - 1.2, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(x - 2, y + 3.5);
  ctx.lineTo(x + 1.8, y - 4);
  ctx.lineTo(x + 4.5, y + 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(x + 0.4, y - 1.5);
  ctx.lineTo(x + 1.8, y - 4);
  ctx.lineTo(x + 3.2, y - 1.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawMinimapLegendary(ctx, x, y, now) {
  ctx.save();
  const pulse = Math.sin(now * 0.006);
  ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(x, y, 5.5 + pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(x, y, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#fffbeb';
  ctx.beginPath();
  ctx.moveTo(x, y - 3.2);
  ctx.lineTo(x + 1, y - 1);
  ctx.lineTo(x + 3.2, y - 1);
  ctx.lineTo(x + 1.5, y + 0.6);
  ctx.lineTo(x + 2.2, y + 2.8);
  ctx.lineTo(x, y + 1.5);
  ctx.lineTo(x - 2.2, y + 2.8);
  ctx.lineTo(x - 1.5, y + 0.6);
  ctx.lineTo(x - 3.2, y - 1);
  ctx.lineTo(x - 1, y - 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMinimap(){
  if(window.RENDER_DEBUG && window.RENDER_DEBUG.minimap === false){
    const panel=document.getElementById('minimapPanel');
    if(panel && panel.style.display !== 'none') panel.style.display = 'none';
    return;
  }
  const panel=document.getElementById('minimapPanel');
  const map=document.getElementById('minimap');
  if(!panel||!map)return;
  attachMinimapListeners();

  const isLevelUp = document.getElementById('levelup')?.style.display === 'flex';
  const showBtn = gameStarted && !gameOver && !isLevelUp;
  const hudCampBtn = document.getElementById('hudReturnToCampBtn');
  if (hudCampBtn && hudCampBtn.style.display !== (showBtn ? 'flex' : 'none')) {
    hudCampBtn.style.display = showBtn ? 'flex' : 'none';
  }
  const show = showBtn && window.GAME_SETTINGS?.showMinimap !== false;
  if (panel.style.display !== (show ? 'block' : 'none')) {
    panel.style.display = show ? 'block' : 'none';
  }
  if(!show)return;
  const now = performance.now();
  if (now - lastMinimapDrawAt < 33) return; // ~30 FPS smooth rendering
  lastMinimapDrawAt = now;

  const mapCtx = map.getContext('2d');
  const mapW = map.width, mapH = map.height;
  const baseCell = 5;
  const effectiveCell = baseCell * minimapZoom;

  const playerTileX = (player.x + player.w / 2) / TILE;
  const playerTileY = (player.y + player.h / 2) / TILE;
  const centerX = Math.floor(playerTileX);
  const centerY = Math.floor(playerTileY);

  const viewTileCenterX = centerX + minimapPanX;
  const viewTileCenterY = centerY + minimapPanY;

  // 1. Terrain caching
  const terrainKey = `${Math.floor(viewTileCenterX)},${Math.floor(viewTileCenterY)},${minimapZoom.toFixed(2)},${fogRevealVersion}`;
  if (!minimapTerrainCanvas) {
    minimapTerrainCanvas = document.createElement('canvas');
    minimapTerrainCanvas.width = mapW;
    minimapTerrainCanvas.height = mapH;
    minimapTerrainCtx = minimapTerrainCanvas.getContext('2d');
  }
  if (!minimapFogCanvas) {
    minimapFogCanvas = document.createElement('canvas');
    minimapFogCanvas.width = mapW;
    minimapFogCanvas.height = mapH;
    minimapFogCtx = minimapFogCanvas.getContext('2d');
  } else if (minimapFogCanvas.width !== mapW || minimapFogCanvas.height !== mapH) {
    minimapFogCanvas.width = mapW;
    minimapFogCanvas.height = mapH;
  }

  if (minimapCacheKey !== terrainKey) {
    minimapCacheKey = terrainKey;
    minimapTerrainCtx.fillStyle = '#090d12';
    minimapTerrainCtx.fillRect(0, 0, mapW, mapH);

    const halfSpanX = (mapW / 2) / effectiveCell;
    const halfSpanY = (mapH / 2) / effectiveCell;
    const minTileX = Math.floor(viewTileCenterX - halfSpanX) - 2;
    const maxTileX = Math.ceil(viewTileCenterX + halfSpanX) + 2;
    const minTileY = Math.floor(viewTileCenterY - halfSpanY) - 2;
    const maxTileY = Math.ceil(viewTileCenterY + halfSpanY) + 2;
    const tileSize = Math.ceil(effectiveCell) + 1;

    // A. Draw base terrain colors across all visible tiles
    for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        const screenX = (mapW / 2) + (tileX - viewTileCenterX) * effectiveCell;
        const screenY = (mapH / 2) + (tileY - viewTileCenterY) * effectiveCell;

        if (tileAtWorld(tileX, tileY) > 0) {
          minimapTerrainCtx.fillStyle = '#397da5'; // Water
        } else {
          const color = blendedTileColor(tileX, tileY);
          minimapTerrainCtx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        }
        minimapTerrainCtx.fillRect(screenX, screenY, tileSize, tileSize);
      }
    }

    // B. Softened Fog of War mask (completely dissolves rectangular steps)
    minimapFogCtx.clearRect(0, 0, mapW, mapH);
    minimapFogCtx.fillStyle = '#090d12';
    minimapFogCtx.fillRect(0, 0, mapW, mapH);

    // Punch out revealed tiles using overlapping circular discs
    minimapFogCtx.globalCompositeOperation = 'destination-out';
    minimapFogCtx.fillStyle = 'rgba(0,0,0,1)';
    const discRadius = Math.max(3.5, effectiveCell * 0.98);

    for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
      for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
        if (hasRevealedTile(tileX, tileY)) {
          const cx = (mapW / 2) + (tileX - viewTileCenterX + 0.5) * effectiveCell;
          const cy = (mapH / 2) + (tileY - viewTileCenterY + 0.5) * effectiveCell;
          minimapFogCtx.beginPath();
          minimapFogCtx.arc(cx, cy, discRadius, 0, Math.PI * 2);
          minimapFogCtx.fill();
        }
      }
    }
    minimapFogCtx.globalCompositeOperation = 'source-over';

    // C. Composite softened fog onto terrain using smooth Gaussian blur filter (zero rectangular steps)
    const blurAmount = Math.max(3, Math.min(8, Math.round(effectiveCell * 0.75)));
    minimapTerrainCtx.save();
    minimapTerrainCtx.filter = `blur(${blurAmount}px)`;
    minimapTerrainCtx.drawImage(minimapFogCanvas, 0, 0);
    minimapTerrainCtx.restore();
  }

  // Draw cached terrain
  mapCtx.drawImage(minimapTerrainCanvas, 0, 0);

  // Marker projection helper
  const markerPoint = (wx, wy, clip = false) => {
    const tileFloatX = wx / TILE;
    const tileFloatY = wy / TILE;
    const px = (mapW / 2) + (tileFloatX - viewTileCenterX) * effectiveCell;
    const py = (mapH / 2) + (tileFloatY - viewTileCenterY) * effectiveCell;
    const margin = 4;
    const outside = px < margin || px > mapW - margin || py < margin || py > mapH - margin;
    if (clip) {
      const edgePad = 8;
      const cx = Math.max(edgePad, Math.min(mapW - edgePad, px));
      const cy = Math.max(edgePad, Math.min(mapH - edgePad, py));
      return { x: cx, y: cy, outside };
    }
    if (outside) return null;
    return { x: px, y: py, outside: false };
  };

  const seleneActive = companions.some(c => c.id === 'selene');

  // Relic Sites
  for (const chunk of chunks.values()) for (const site of chunk.relicSites || []) {
    const tileX = Math.floor(site.x / TILE), tileY = Math.floor(site.y / TILE);
    if (site.id === carriedRelic?.id || (!hasRevealedTile(tileX, tileY) && !seleneActive)) continue;
    const point = markerPoint(site.x, site.y);
    if (!point) continue;
    drawMinimapRelic(mapCtx, point.x, point.y, site.color || '#e398ff', now);
  }

  // NPC Sites
  for (const chunk of chunks.values()) for (const npc of chunk.npcSites || []) {
    if (player.completedNPCs?.includes(npc.id)) continue;
    const tileX = Math.floor(npc.x / TILE), tileY = Math.floor(npc.y / TILE);
    if (!hasRevealedTile(tileX, tileY)) continue;
    const point = markerPoint(npc.x, npc.y);
    if (!point) continue;
    drawMinimapNPC(mapCtx, point.x, point.y, npc.indicatorColor || '#ffd700', now);
  }

  // Ancient Shrines & Portals on Field Map (Sunken Shrine / Caelen & Abyss Return)
  const drawCyanShrineBeacon = (point) => {
    mapCtx.save();
    const pulse = Math.sin(now * 0.005) * 1.5;
    mapCtx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    mapCtx.beginPath();
    mapCtx.arc(point.x, point.y, 7 + pulse, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.fillStyle = '#00e5ff';
    mapCtx.strokeStyle = '#ffffff';
    mapCtx.lineWidth = 1.2;
    mapCtx.beginPath();
    mapCtx.moveTo(point.x, point.y - 6);
    mapCtx.lineTo(point.x + 5, point.y);
    mapCtx.lineTo(point.x, point.y + 6);
    mapCtx.lineTo(point.x - 5, point.y);
    mapCtx.closePath();
    mapCtx.fill();
    mapCtx.stroke();
    mapCtx.restore();
  };
  let drewSunkenBeacon = false;
  for (const chunk of chunks.values()) for (const t of chunk.tall || []) {
    if (t.featureType === 'sunkenShrine' || t.featureType === 'abyssReturnPortal') {
      if (t.featureType === 'sunkenShrine') drewSunkenBeacon = true;
      const point = markerPoint(t.x, t.y, true);
      if (point) drawCyanShrineBeacon(point);
    }
  }
  if (!drewSunkenBeacon) {
    const pwx = Math.floor((player.x + player.w * 0.5) / TILE);
    const pwy = Math.floor((player.y + player.h * 0.5) / TILE);
    if (biomeAt(pwx, pwy) === 'swamp' || (campSave.hasTidecallerConch && !campSave.hasAbyssalKey)) {
      const canonicalSunken = getCanonicalSunkenShrineChunk();
      if (canonicalSunken) {
        const point = markerPoint(canonicalSunken.wx * TILE + 20, canonicalSunken.wy * TILE + 20, true);
        if (point) drawCyanShrineBeacon(point);
      }
    }
  }

  // Items: XP Gems
  for (const item of xpGems) {
    const tileX = Math.floor(item.x / TILE), tileY = Math.floor(item.y / TILE);
    if (!hasRevealedTile(tileX, tileY)) continue;
    const point = markerPoint(item.x, item.y);
    if (!point) continue;
    mapCtx.fillStyle = item.color || '#6ee7b7';
    const sz = item.mega ? 3.5 : 2;
    mapCtx.fillRect(point.x - sz/2, point.y - sz/2, sz, sz);
  }

  // Items: Legendary Pickups
  for (const item of legendaryPickups) {
    const point = markerPoint(item.x, item.y, true);
    if (!point) continue;
    drawMinimapLegendary(mapCtx, point.x, point.y, now);
  }

  // Items: Wood Pickups
  for (const item of woodPickups) {
    const tileX = Math.floor(item.x / TILE), tileY = Math.floor(item.y / TILE);
    if (!hasRevealedTile(tileX, tileY)) continue;
    const point = markerPoint(item.x, item.y);
    if (!point) continue;
    mapCtx.fillStyle = '#b45309';
    mapCtx.fillRect(point.x - 1, point.y - 1, 2.5, 2.5);
  }

  // Bosses
  for (const enemy of enemies) {
    if (!ENEMY_TYPES[enemy.type]?.boss) continue;
    const tileX = Math.floor(enemy.x / TILE), tileY = Math.floor(enemy.y / TILE);
    const isRevealed = hasRevealedTile(tileX, tileY);
    const distToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (!isRevealed && distToPlayer > 1200) continue; // Fog of War hides distant unencountered bosses
    const point = markerPoint(enemy.x, enemy.y, true);
    if (!point) continue;
    drawMinimapBoss(mapCtx, point.x, point.y, now);
  }

  // Dream Biome specifics
  if (state.isInDream) {
    if (state.dreamRelics && state.dreamRelics.includes('reality_compass')) {
      const centerPt = markerPoint(600000 * TILE, 600000 * TILE, true);
      if (centerPt) {
        const pulse = 3.5 + 1.5 * Math.sin(now * 0.006);
        mapCtx.fillStyle = '#00e5ff';
        mapCtx.beginPath();
        mapCtx.arc(centerPt.x, centerPt.y, pulse, 0, Math.PI * 2);
        mapCtx.fill();
        mapCtx.strokeStyle = '#ffffff';
        mapCtx.lineWidth = 1;
        mapCtx.stroke();
      }
    }
    if (dreamRelicPickups && dreamRelicPickups.length > 0) {
      for (const dp of dreamRelicPickups) {
        const pt = markerPoint(dp.x, dp.y);
        if (!pt) continue;
        drawMinimapRelic(mapCtx, pt.x, pt.y, dp.relicId === 'lucid_bell' ? '#ffd700' : '#ba68c8', now);
      }
    }
    const shopPt = markerPoint(600000 * TILE, 600000 * TILE, true);
    if (shopPt) {
      mapCtx.fillStyle = '#ba68c8';
      mapCtx.beginPath();
      mapCtx.arc(shopPt.x, shopPt.y, 4.5, 0, Math.PI * 2);
      mapCtx.fill();
      mapCtx.strokeStyle = '#ffd700';
      mapCtx.lineWidth = 1.5;
      mapCtx.stroke();
    }
  }

  // Mountain Wall landmark markers (with discovery check!)
  if ((window.MOUNTAIN_BIOMES || window.MOUNTAIN_WALL) && !state.isInDream && !state.isInDungeon) {
    const list = window.MOUNTAIN_BIOMES || [window.MOUNTAIN_WALL];
    for (let b = 0; b < list.length; b++) {
      const mb = list[b];
      const cx = Math.floor(mb.valleyCenter.x / TILE);
      const cy = Math.floor(mb.valleyCenter.y / TILE);
      const ex = Math.floor(mb.entrance.x / TILE);
      const ey = Math.floor(mb.entrance.y / TILE);
      if (hasRevealedTile(cx, cy) || hasRevealedTile(ex, ey) || Math.hypot(player.x - mb.valleyCenter.x, player.y - mb.valleyCenter.y) < 1800) {
        discoveredMountains.add(mb.id);
      }
      if (!discoveredMountains.has(mb.id)) continue; // Obey Fog of War until discovered
      const mPt = markerPoint(mb.startX + mb.w / 2, mb.startY + mb.h / 2, true);
      if (mPt) {
        drawMinimapMountain(mapCtx, mPt.x, mPt.y);
      }
    }
  }

  // Player Indicator Arrow (Facing orientation)
  const playerPt = markerPoint(player.x + player.w / 2, player.y + player.h / 2);
  if (playerPt) {
    let playerAngle = 0;
    if (window.GAME_SETTINGS?.manualAim && Number.isFinite(player.aimAngle)) {
      playerAngle = player.aimAngle;
    } else {
      const pfx = (player.facing < 0 ? -1 : 1);
      const pfy = (player.facingY || 0);
      playerAngle = Math.atan2(pfy, pfx);
    }
    drawMinimapPlayer(mapCtx, playerPt.x, playerPt.y, playerAngle, now);
  }

  // Gold ornate border and corner accents directly on canvas
  mapCtx.save();
  mapCtx.strokeStyle = 'rgba(201, 164, 76, 0.85)';
  mapCtx.lineWidth = 1.5;
  mapCtx.strokeRect(0.5, 0.5, mapW - 1, mapH - 1);
  mapCtx.fillStyle = '#ffd54f';
  const corners = [[3, 3], [mapW - 3, 3], [3, mapH - 3], [mapW - 3, mapH - 3]];
  for (const [cx, cy] of corners) {
    mapCtx.beginPath();
    mapCtx.moveTo(cx, cy - 2);
    mapCtx.lineTo(cx + 2, cy);
    mapCtx.lineTo(cx, cy + 2);
    mapCtx.lineTo(cx - 2, cy);
    mapCtx.closePath();
    mapCtx.fill();
  }
  mapCtx.restore();
}
function draw(){
  currentFrameNow = performance.now();
  RENDER_STATS.reset();
  RENDER_STATS.activeLayer = 'chunks';
  const viewW = VW(), viewH = VH();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#0b0b12';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.imageSmoothingEnabled=false;

  // Player camera zoom (settings) + screen shake
  ctx.save();
  const viewScale=viewZoom();
  ctx.scale(viewScale,viewScale);
  if(screenShakeIntensity>0&&window.GAME_SETTINGS.screenShake){
    ctx.translate((Math.random()-.5)*screenShakeIntensity,(Math.random()-.5)*screenShakeIntensity);
  }
  screenShakeIntensity=Math.max(0,screenShakeIntensity*.86-.15);

  // Zoom for boss intro or death sequence
  const activeCineZoom=(deathSeq.active||deathSeq.done)?deathSeq.zoom:bossIntro.zoom;
  if(activeCineZoom>1){
    ctx.save();
    const z=activeCineZoom;
    ctx.translate(VW()/2,VH()/2);
    ctx.scale(z,z);
    ctx.translate(-VW()/2,-VH()/2);
  }

  // Layer 1: chunks
  const minCX=Math.floor(camera.x/CHUNK_PX)-1,maxCX=Math.floor((camera.x+VW())/CHUNK_PX)+1;
  const minCY=Math.floor(camera.y/CHUNK_PX)-1,maxCY=Math.floor((camera.y+VH())/CHUNK_PX)+1;
  const vis=[];
  const drawChunks = !window.RENDER_DEBUG || window.RENDER_DEBUG.chunks !== false;
  const isLegacyChunkSampling = Boolean(window.RENDER_DEBUG?.legacyChunkSampling || window.GAME_SETTINGS?.legacyChunkSampling);
  const smoothChunks = false;
  if (smoothChunks) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';
  }
  for(let cy=minCY;cy<=maxCY;cy++)for(let cx=minCX;cx<=maxCX;cx++){
    const ch=getChunk(cx,cy);vis.push(ch);
    if(drawChunks) {
      const rx = Math.round(cx*CHUNK_PX-camera.x);
      const ry = Math.round(cy*CHUNK_PX-camera.y);
      if (rx + CHUNK_PX <= 0 || rx >= viewW || ry + CHUNK_PX <= 0 || ry >= viewH) continue;
      ctx.drawImage(ch.canvas, rx, ry);
    }
  }
  // Layer 1.5: dwarfCity roof canvas (semi-transparent when player is under roof)
  const playerTileX=Math.floor(player.x/TILE);
  const playerTileY=Math.floor(player.y/TILE);
  let playerUnderRoof=false;
  for(const ch of vis){
    if(ch.cityRoofs && ch.cityRoofs.has(`${playerTileX},${playerTileY}`)){
      playerUnderRoof=true;
      break;
    }
  }
  if(drawChunks) for(let cy=minCY;cy<=maxCY;cy++)for(let cx=minCX;cx<=maxCX;cx++){
    const ch=getChunk(cx,cy);
    if(ch.roofCanvas && ch.cityRoofs && ch.cityRoofs.size > 0){
      ctx.save();
      if(playerUnderRoof){
        ctx.globalAlpha=0.35;
      }
      const rx = isLegacyChunkSampling ? (cx*CHUNK_PX-camera.x) : Math.round((cx*CHUNK_PX-camera.x)*viewScale)/viewScale;
      const ry = isLegacyChunkSampling ? (cy*CHUNK_PX-camera.y) : Math.round((cy*CHUNK_PX-camera.y)*viewScale)/viewScale;
      ctx.drawImage(ch.roofCanvas, rx, ry);
      ctx.restore();
    }
  }
  if (smoothChunks) {
    ctx.imageSmoothingEnabled = false;
  }

  // Layer 2: water
  RENDER_STATS.activeLayer = 'water';
  const frameIdx=Math.floor(performance.now()/320)%3;
  let daylight=getDaylight(); const sunX=getSunX();
  cachedFrameSunX = sunX;
  cachedFrameDaylight = daylight;
  const undergroundNow = camera.x > 100000 * TILE && camera.x < 300000 * TILE
                      && camera.y > 100000 * TILE && camera.y < 300000 * TILE;
  if (undergroundNow) { daylight = -1.2; cachedFrameDaylight = daylight; }
  const waterAnimTick = Math.floor(performance.now()/360);
  if(viewScale >= 0.78 && (!window.RENDER_DEBUG || window.RENDER_DEBUG.water !== false)) for(const ch of vis){
    const chunkSx = Math.round(ch.cx * CHUNK_PX - camera.x), chunkSy = Math.round(ch.cy * CHUNK_PX - camera.y);
    if(chunkSx + CHUNK_PX < 0 || chunkSx > VW() || chunkSy + CHUNK_PX < 0 || chunkSy > VH()) continue;
    const thinWater = viewScale < 0.95;
    for(const w of ch.waterTiles){
      if(thinWater && ((w.tx + w.ty) & 1) !== 0) continue;
      const sx=chunkSx+w.tx*TILE;
      const sy=chunkSy+w.ty*TILE;
      if(sx<-TILE||sx>VW()||sy<-TILE||sy>VH())continue;
      
      const liq = LIQUIDS[w.biome] || LIQUIDS.default;
      const tileFrame = (waterAnimTick + w.tx + w.ty) % 3;
      const frame = w.level===2 ? liq.d[tileFrame] : liq.s[tileFrame];
      
      ctx.drawImage(frame,sx,sy);
      if(viewScale >= 0.92 && daylight>.4 && w.level===2 && w.biome !== 'volcano' && w.biome !== 'deadlands'){
        const rA=(daylight-.4)*.42*(1-Math.abs(sunX)*.4);
        const rX=Math.round(sx+14+sunX*8), rY=Math.round(sy+18);
        const p=.65+.35*Math.sin(performance.now()/340+w.tx*1.7+w.ty*2.3);
        ctx.fillStyle=`rgba(224,246,255,${(rA*p).toFixed(2)})`;
        ctx.fillRect(rX, rY, 6, 2);
      }
    }
  }

  const drawDecor = !window.RENDER_DEBUG || window.RENDER_DEBUG.decor !== false;
  // Layer 2.3: Pre-rendered Mountain Wall Structure (drawn under decor, trees, and characters)
  RENDER_STATS.activeLayer = 'mountains';
  const mountainTiles = drawDecor ? getVisibleMountainTiles(camera.x, camera.y, viewW, viewH) : [];
  for(let i=0; i<mountainTiles.length; i++){
    const mt = mountainTiles[i];
    if(mt.img && mt.img.complete && mt.img.naturalWidth > 0){
      ctx.drawImage(mt.img, mt.x - camera.x, mt.y - camera.y, 512, 512);
    }
  }

  // Layer 2.5: decor (drawn outside the chunk canvas so sprites are not clipped at chunk edges)
  RENDER_STATS.activeLayer = 'decor';
  const decorNow = performance.now();
  if(drawDecor) for(const ch of vis){
    if(!ch.decor) continue;
    const ox=ch.cx*CHUNK_PX-camera.x, oy=ch.cy*CHUNK_PX-camera.y;
    if(ox + CHUNK_PX < -40 || ox > VW() + 40 || oy + CHUNK_PX < -40 || oy > VH() + 40) continue;
    const isAbyssChunk = (ch.cx * CHUNK_SIZE > 700000 && ch.cx * CHUNK_SIZE < 900000);
    for(const d of ch.decor){
      if(state.isInDream){
        const dwx = ch.cx * CHUNK_PX + d.x, dwy = ch.cy * CHUNK_PX + d.y;
        const shopX = 600000 * TILE, shopY = 600000 * TILE;
        if(Math.abs(dwx - shopX) < 420 && dwy > shopY - 450 && dwy < shopY + 220) continue;
      }
      const x=Math.round(ox+d.x), y=Math.round(oy+d.y);
      if(x+d.dw<0||x>VW()||y+d.dh<0||y>VH()) continue;
      if(viewScale < 0.65 && (d.dw < 24 || d.dh < 24)) continue;
      if(d.img!==ATLAS.canvas && d.img!==window.EXT_TREES_ATLAS?.canvas && !(d.img.complete&&d.img.naturalWidth>0)) {
        continue;
      }
      const isUnderwater = d.isAbyss || isAbyssChunk;
      if (isUnderwater && d.isSoftFlora) {
        ctx.save();
        const worldX = ch.cx * CHUNK_PX + d.x;
        const worldY = ch.cy * CHUNK_PX + d.y;
        const floraSway = Math.sin(decorNow * 0.0010 + worldX * 0.006 + worldY * 0.006) * 0.018;
        ctx.translate(x + d.dw * 0.5, y + d.dh);
        ctx.rotate(floraSway);
        ctx.drawImage(d.img, d.sx, d.sy, d.sw, d.sh, -d.dw * 0.5, -d.dh, d.dw, d.dh);
        ctx.restore();
      } else if (d._isActive && (d._squish || d._bend)) {
        drawDeformedDecor(d, x, y, false);
      } else {
        ctx.drawImage(d.img,d.sx,d.sy,d.sw,d.sh,x,y,d.dw,d.dh);
      }
    }
  }
  if(drawDecor && window.activeInteractiveDecors?.length){
    const activeDec = window.activeInteractiveDecors;
    for(let i=0;i<activeDec.length;i++){
      const d = activeDec[i];
      if(!d._fromBaked || !d._ch) continue;
      const dx = Math.round(d._ch.cx * CHUNK_PX - camera.x + d.x);
      const dy = Math.round(d._ch.cy * CHUNK_PX - camera.y + d.y);
      if(dx + d.dw < 0 || dx > VW() || dy + d.dh < 0 || dy > VH()) continue;
      drawDeformedDecor(d, dx, dy, false);
    }
  }

  // Layer 3: Fires & burning trees (under entities) - Lightweight & high-performance fire tiles
  RENDER_STATS.activeLayer = 'fire';
  const baseFireFrame = Math.floor(performance.now() / 120);
  for(const[key,f]of fires){
    const fx=f.wx*TILE-camera.x,fy=f.wy*TILE-camera.y;
    if(fx<-TILE||fx>viewW||fy<-TILE||fy>viewH)continue;

    const frame = FIRE_AURA_FRAMES[(baseFireFrame + f.wx + f.wy) % 5];
    if (frame && frame.complete && frame.naturalWidth > 0) {
      if (f.life < 0.8) {
        ctx.globalAlpha = Math.max(0.2, f.life / 0.8);
        ctx.drawImage(frame, fx, fy, TILE, TILE);
        ctx.globalAlpha = 1;
      } else {
        ctx.drawImage(frame, fx, fy, TILE, TILE);
      }
    } else {
      ctx.fillStyle = 'rgba(255,120,20,0.6)';
      ctx.fillRect(fx+4, fy+4, TILE-8, TILE-8);
    }
  }
  for(const[key,t]of burningTrees){
    const tx=t.x-camera.x,ty=t.y-camera.y;
    if(tx<-100||tx>VW()+100||ty<-200||ty>VH()+100)continue;
    // Draw burning sprite with flicker
    const flicker=.9+.1*Math.sin(performance.now()/60);
    ctx.globalAlpha=flicker;
    const r=ATLAS.regions.burningTree;
    const dw=r.w*3.5,dh=r.h*3.5;
    drawTreeShadow(tx,ty-4,dw*.22,dw*.08);
    ctx.drawImage(ATLAS.canvas,r.x,r.y,r.w,r.h,tx-dw/2,ty-dh,dw,dh);
  ctx.globalAlpha=1;
    // Fire glow
    const g=ctx.createRadialGradient(tx,ty-dh/2,10,tx,ty-dh/2,80);
    g.addColorStop(0,'rgba(255,120,20,.6)');
    g.addColorStop(1,'rgba(255,120,20,0)');
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(tx,ty-dh/2,80,0,Math.PI*2);ctx.fill();
  }

  const pTileX = Math.floor(player.x / TILE), pTileY = Math.floor(player.y / TILE);
  const isAbyss = (pTileX > 700000 && pTileX < 900000 && pTileY > 700000 && pTileY < 900000);
  const isChickenDim = (pTileX > 910000 && pTileX < 990000 && pTileY > 910000 && pTileY < 990000);
  const isUnderworld = (pTileX > 100000 && pTileX < 300000 && pTileY > 100000 && pTileY < 300000);
  const isVoid = (pTileX > 400000 && pTileY > 400000);
  const drawWeather = !window.RENDER_DEBUG || window.RENDER_DEBUG.weather !== false;
  // Blood moon tint (disabled in dream and chicken dimension)
  if(drawWeather && isBloodMoon && !state.isInDream && !isChickenDim){
    ctx.fillStyle='rgba(120,10,10,0.22)';
    ctx.fillRect(0,0,VW(),VH());
  }
  // Weather tint (disabled in underworld and chicken dimension)
  if (drawWeather && isAbyss) {
    ctx.fillStyle = 'rgba(4, 20, 50, 0.20)';
    ctx.fillRect(0, 0, VW(), VH());
    const radGrad = ctx.createRadialGradient(VW()/2, VH()/2, VW()*0.35, VW()/2, VH()/2, VW()*0.85);
    radGrad.addColorStop(0, 'rgba(0, 40, 90, 0)');
    radGrad.addColorStop(1, 'rgba(2, 10, 28, 0.38)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, VW(), VH());

    if (window.abyssBubbles) {
      ctx.save();
      ctx.fillStyle = 'rgba(180, 240, 255, 0.55)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1;
      const nowB = performance.now() * 0.002;
      for (const b of window.abyssBubbles) {
        b.y -= b.speed;
        b.wobble += 0.03;
        if (b.y < -20) {
          b.y = VH() + 20;
          b.x = Math.random() * VW();
        }
        const bx = b.x + Math.sin(b.wobble + nowB) * 12;
        ctx.globalAlpha = b.alpha;
        ctx.beginPath();
        ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  } else if(!drawWeather || !window.GAME_SETTINGS.enableWeather || isUnderworld || isAbyss || isChickenDim || state.isInDream) {}
  else if(weather.type==='rain'){ctx.fillStyle='rgba(30,40,60,.25)';ctx.fillRect(0,0,VW(),VH());}
  else if(weather.type==='snow'){ctx.fillStyle='rgba(200,210,230,.15)';ctx.fillRect(0,0,VW(),VH());}
  else if(weather.type==='storm'){ctx.fillStyle='rgba(20,20,40,.45)';ctx.fillRect(0,0,VW(),VH());}

  // Layer 4: legendary set pickups
  for(const l of legendaryPickups){
    if(!l || !Number.isFinite(l.x) || !Number.isFinite(l.y)) continue;
    const bobVal = Number.isFinite(l.bob) ? l.bob : 0;
    const bob = Math.sin(bobVal) * 4;
    const px = l.x - camera.x, py = l.y - camera.y + bob;
    if(!Number.isFinite(px) || !Number.isFinite(py)) continue;
    const pulse = Math.max(3, 18 + 5 * Math.sin(performance.now() * 0.007 + bobVal));
    const glow = ctx.createRadialGradient(px, py, 2, px, py, pulse);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
    glow.addColorStop(0.5, 'rgba(255, 179, 0, 0.4)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, pulse, 0, Math.PI * 2);
    ctx.fill();
    drawSprite(l.piece.sprite || 'rpg_crown', px - 36, py - 36, 72, 72);
  }

  const drawPickupGlow = (px, py, r0, r1, stops) => {
    if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(r0) || !Number.isFinite(r1) || r1 <= r0) return false;
    const glow = ctx.createRadialGradient(px, py, r0, px, py, r1);
    for (const [offset, color] of stops) glow.addColorStop(offset, color);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, r1, 0, Math.PI * 2);
    ctx.fill();
    return true;
  };

  // Dream Shop Building (Only 1 in Dream Biome at 600000*TILE, 600000*TILE)
  if(state.isInDream){
    const shopX = 600000 * TILE, shopY = 600000 * TILE;
    const sx = shopX - camera.x, sy = shopY - camera.y;
    const shopW = 400, shopH = 300;
    if(Number.isFinite(sx) && Number.isFinite(sy) && sx > -shopW && sx < viewW + shopW && sy > -shopH && sy < viewH + shopH){
      // Shop ambient base glow
      const shopGlow = ctx.createRadialGradient(sx, sy - 40, 30, sx, sy - 40, 220);
      shopGlow.addColorStop(0, 'rgba(123, 31, 162, 0.55)');
      shopGlow.addColorStop(0.6, 'rgba(74, 20, 140, 0.25)');
      shopGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shopGlow;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 15, 200, 75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Dream Shop sprite (400x300 px)
      drawSprite('dream_shop', sx - shopW / 2, sy - shopH, shopW, shopH);

      // Interactive proximity prompt [E] DREAM SHOP
      const pDist = Math.hypot((player.x + player.w/2) - shopX, (player.y + player.h/2) - (shopY - 40));
      if(pDist < 160){
        const promptY = sy - shopH - 12 + Math.sin(performance.now() * 0.006) * 4;
        ctx.save();
        ctx.font = 'bold 14px "Cinzel", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 12;
        ctx.fillText('[E] DREAM SHOP', sx, promptY);
        ctx.restore();
      }
    }
  }

  // Dream Coin Pickups (Drop from Dream Mobs)
  if(state.isInDream && dreamCoinPickups && dreamCoinPickups.length > 0){
    for(const cp of dreamCoinPickups){
      if(!cp || !Number.isFinite(cp.x) || !Number.isFinite(cp.y)) continue;
      const bobVal = Number.isFinite(cp.bob) ? cp.bob : 0;
      const px = cp.x - camera.x, py = cp.y - camera.y + Math.sin(bobVal) * 4;
      if(!Number.isFinite(px) || !Number.isFinite(py) || px < -32 || px > viewW + 32 || py < -32 || py > viewH + 32) continue;

      const pulse = Math.max(3, 14 + 4 * Math.sin(performance.now() * 0.007 + bobVal));
      drawPickupGlow(px, py, 2, pulse, [[0, 'rgba(255, 215, 0, 0.9)'], [0.5, 'rgba(186, 104, 200, 0.4)'], [1, 'rgba(255, 215, 0, 0)']]);
      drawSprite('dream_coin', px - 14, py - 14, 28, 28);
    }
  }

  // Dream Relic Pickups (inside dream)
  if(state.isInDream && dreamRelicPickups && dreamRelicPickups.length > 0){
    for(const dp of dreamRelicPickups){
      if(!dp || !Number.isFinite(dp.x) || !Number.isFinite(dp.y)) continue;
      const bobVal = Number.isFinite(dp.bob) ? dp.bob : 0;
      const px = dp.x - camera.x, py = dp.y - camera.y + Math.sin(bobVal) * 4;
      if(!Number.isFinite(px) || !Number.isFinite(py)) continue;
      const pulse = Math.max(4, 26 + 8 * Math.sin(performance.now() * 0.005 + bobVal));
      const isBell = dp.relicId === 'lucid_bell';
      const col = isBell ? 'rgba(255, 215, 0,' : 'rgba(186, 104, 200,';
      drawPickupGlow(px, py, 3, pulse, [[0, col + '0.95)'], [0.5, col + '0.45)'], [1, col + '0)']]);
      const dreamRelicSize = 56;
      drawSprite(dp.sprite || 'dream_item_orb', px - dreamRelicSize / 2, py - dreamRelicSize / 2, dreamRelicSize, dreamRelicSize);
    }
  }

  // Trinket Pickups
  for(const l of trinketPickups){
    if(!l || !Number.isFinite(l.x) || !Number.isFinite(l.y)) continue;
    const bobVal = Number.isFinite(l.bob) ? l.bob : 0;
    const bob = Math.sin(bobVal) * 4;
    const px = l.x - camera.x, py = l.y - camera.y + bob;
    if(!Number.isFinite(px) || !Number.isFinite(py)) continue;
    const pulse = Math.max(4, 24 + 6 * Math.sin(performance.now() * 0.005 + bobVal));
    drawPickupGlow(px, py, 3, pulse, [[0, 'rgba(220, 220, 230, 0.95)'], [0.5, 'rgba(192, 192, 210, 0.45)'], [1, 'rgba(192, 192, 210, 0)']]);
    const trinketSize = 56;
    drawSprite(l.sprite, px - trinketSize / 2, py - trinketSize / 2, trinketSize, trinketSize);
  }

  // Layer 4: wood pickups
  for(const w of woodPickups){
    if(!w || !Number.isFinite(w.x) || !Number.isFinite(w.y)) continue;
    const bobVal = Number.isFinite(w.bob) ? w.bob : 0;
    const bob=Math.sin(bobVal)*2;
    drawSprite('wood',w.x-camera.x-15,w.y-camera.y-15+bob,30,30);
  }
  // Layer 4.5: Chicken Dimension item pickups (chickenLeg, goldenFeather, eggBomb)
  if(state.chickenPickups && state.chickenPickups.length > 0){
    for(const cp of state.chickenPickups){
      if(!cp || !Number.isFinite(cp.x) || !Number.isFinite(cp.y)) continue;
      const bobVal = Number.isFinite(cp.bob) ? cp.bob : 0;
      const px = cp.x - camera.x, py = cp.y - camera.y + Math.sin(bobVal) * 3.5;
      if(!Number.isFinite(px) || !Number.isFinite(py) || px < -40 || px > viewW + 40 || py < -40 || py > viewH + 40) continue;
      const pulse = Math.max(4, 20 + 4 * Math.sin(performance.now() * 0.006 + bobVal));
      drawPickupGlow(px, py, 2, pulse, [[0, cp.type === 'eggBomb' ? 'rgba(255, 87, 34, 0.9)' : 'rgba(255, 215, 0, 0.9)'], [1, 'rgba(255, 215, 0, 0)']]);
      drawSprite(cp.sprite || cp.type, px - 18, py - 18, 36, 36);
    }
  }
  // Layer 4.6: Chicken Coin Pickups (Custom Economy in Chicken Dimension)
  if(state.chickenCoinPickups && state.chickenCoinPickups.length > 0){
    for(const cc of state.chickenCoinPickups){
      if(!cc || !Number.isFinite(cc.x) || !Number.isFinite(cc.y)) continue;
      const bobVal = Number.isFinite(cc.bob) ? cc.bob : 0;
      const px = cc.x - camera.x, py = cc.y - camera.y + Math.sin(bobVal) * 3.5;
      if(!Number.isFinite(px) || !Number.isFinite(py) || px < -36 || px > viewW + 36 || py < -36 || py > viewH + 36) continue;
      const pulse = Math.max(3, 16 + 4 * Math.sin(performance.now() * 0.007 + bobVal));
      drawPickupGlow(px, py, 2, pulse, [[0, 'rgba(255, 215, 0, 0.92)'], [0.5, 'rgba(255, 179, 0, 0.45)'], [1, 'rgba(255, 215, 0, 0)']]);
      drawSprite('chickenCoin', px - 15, py - 15, 30, 30);
    }
  }
  // Layer 4.7: Consumable Food Pickups (Grilled Fish, Heart Steak, Roasted Ham)
  if(state.foodPickups && state.foodPickups.length > 0){
    for(const fp of state.foodPickups){
      if(!fp || !Number.isFinite(fp.x) || !Number.isFinite(fp.y)) continue;
      const bobVal = Number.isFinite(fp.bob) ? fp.bob : 0;
      const bob = Math.sin(bobVal) * 3.2;
      const px = fp.x - camera.x, py = fp.y - camera.y + bob;
      if(!Number.isFinite(px) || !Number.isFinite(py) || px < -36 || px > viewW + 36 || py < -36 || py > viewH + 36) continue;
      drawShadow(px, fp.y - camera.y + 4, 14, 0.9);
      const glowColor = fp.hp >= 80 ? 'rgba(255, 140, 0, 0.85)' : (fp.hp >= 40 ? 'rgba(233, 30, 99, 0.8)' : 'rgba(76, 175, 80, 0.8)');
      const pulse = Math.max(3, 15 + 4 * Math.sin(performance.now() * 0.007 + bobVal));
      drawPickupGlow(px, py, 2, pulse, [[0, glowColor], [0.5, glowColor.replace('0.85', '0.35').replace('0.8', '0.3')], [1, 'rgba(0, 0, 0, 0)']]);
      drawSprite(fp.sprite || fp.type, px - 15, py - 15, 30, 30);
    }
  }
  // Layer 5: gems
  for(const g of xpGems){
    if(!g || !Number.isFinite(g.x) || !Number.isFinite(g.y)) continue;
    const x=g.x-camera.x;
    if(!Number.isFinite(x) || x<-48 || x>viewW+48) continue;
    const bobVal = Number.isFinite(g.bob) ? g.bob : 0;
    const bob=Math.sin(bobVal)*2;
    let size=30;
    if(g.sprite==='xp_gem_mythic') size=52;
    else if(g.sprite==='xp_gem_legendary') size=46;
    else if(g.sprite==='xp_gem_elite') size=40;
    else if(g.mega) size=42;
    const y=g.y-camera.y+bob;
    if(!Number.isFinite(y) || y<-48 || y>viewH+48) continue;
    if(g.mega&&g.color){
      const pulse=.85+.25*Math.sin(performance.now()*.008+bobVal);
      const rad = Math.max(3, size*1.15*pulse);
      if(!Number.isFinite(rad)) continue;
      const glow=ctx.createRadialGradient(x,y,2,x,y,rad);
      glow.addColorStop(0,`${g.color}cc`);
      glow.addColorStop(0.5,`${g.color}55`);
      glow.addColorStop(1,`${g.color}00`);
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
    } else {
      const pulse=.85+.15*Math.sin(performance.now()*.006+bobVal);
      const rad = Math.max(3, size*.85*pulse);
      if(!Number.isFinite(rad)) continue;
      const glow=ctx.createRadialGradient(x,y,2,x,y,rad);
      glow.addColorStop(0,'rgba(66,165,245,0.45)');glow.addColorStop(1,'rgba(66,165,245,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
    }
    drawSprite(g.sprite||'xp_orb',x-size/2,y-size/2,size,size);
  }
// Holy water pools
for (const hp of holyPools) {
  const a = Math.min(1, hp.life / hp.maxLife * 2) * 0.6;
  const x = hp.x - camera.x, y = hp.y - camera.y;
  const pulse = 0.9 + 0.1 * Math.sin(performance.now() / 200);
  drawCachedRadialGlow(x, y, hp.radius * pulse, '187,222,251', a, false);
  ctx.strokeStyle = `rgba(187,222,251,${a})`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, hp.radius * pulse, 0, Math.PI*2); ctx.stroke();
}

// ═══ KRAKEN INK CLOUDS ═══
for (const ic of krakenInkClouds) {
  const x = ic.x - camera.x, y = ic.y - camera.y;
  if (x < -ic.radius || x > viewW + ic.radius || y < -ic.radius || y > viewH + ic.radius) continue;
  const fadeIn = Math.min(1, (ic.maxLife - ic.life) / 1.0);
  const fadeOut = Math.min(1, ic.life / 1.5);
  const alpha = Math.max(0, fadeIn * fadeOut * 0.85);
  const now = performance.now();
  const pulse = 1 + 0.04 * Math.sin(now * 0.003 + (ic.x || 0));
  const r = Math.max(3, (Number.isFinite(ic.radius) ? ic.radius : 40) * pulse);
  if (!Number.isFinite(r)) continue;

  ctx.save();
  const grad = ctx.createRadialGradient(x, y, Math.max(0.5, r * 0.08), x, y, r);
  grad.addColorStop(0, `rgba(3, 7, 16, ${alpha})`);
  grad.addColorStop(0.55, `rgba(5, 14, 28, ${alpha * 0.88})`);
  grad.addColorStop(0.85, `rgba(8, 26, 48, ${alpha * 0.42})`);
  grad.addColorStop(1, 'rgba(0, 8, 20, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Swirling dark inky motes inside cloud
  ctx.strokeStyle = `rgba(0, 229, 255, ${alpha * 0.22})`;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.62, r * 0.34, (now * 0.001) % (Math.PI * 2), 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();
}

// ═══ BLIZZARD FALLING TARGET TELEGRAPHS ═══
for (let i = 0; i < enemies.length; i++) {
  const fe = enemies[i];
  if (fe.isFalling && fe.targetX != null) {
    const tx = fe.targetX - camera.x;
    const ty = fe.targetY - camera.y;
    if (tx >= -80 && tx <= viewW + 80 && ty >= -80 && ty <= viewH + 80) {
      const progress = 1 - Math.max(0, fe.fallTimer / (fe.maxFallTimer || 1.2));
      const r = 28 * progress;
      ctx.save();
      ctx.strokeStyle = `rgba(128, 222, 234, ${0.4 + 0.5 * progress})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tx, ty, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(178, 235, 242, ${0.15 + 0.25 * progress})`;
      ctx.beginPath();
      ctx.arc(tx, ty, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(224, 247, 250, ${0.6 * progress})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx - 10, ty); ctx.lineTo(tx + 10, ty);
      ctx.moveTo(tx, ty - 10); ctx.lineTo(tx, ty + 10);
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ═══ ACTIVE DARK RITUAL CIRCLE ═══
const currentRitual = getActiveRitual?.();
if (currentRitual) {
  const rx = currentRitual.altarX - camera.x;
  const ry = currentRitual.altarY - camera.y;
  if (rx >= -220 && rx <= viewW + 220 && ry >= -220 && ry <= viewH + 220) {
    const now = performance.now();
    const pulse = 0.92 + 0.08 * Math.sin(now * 0.005);
    const circleR = 110 * pulse;
    
    drawCachedRadialGlow(rx, ry, circleR * 1.3, '171,71,188', 0.35, false);

    ctx.save();
    // Outer arcane summoning ring
    ctx.strokeStyle = 'rgba(206, 147, 216, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(rx, ry, circleR, 0, Math.PI * 2);
    ctx.stroke();

    // Inner dashed rotating rune ring
    ctx.strokeStyle = 'rgba(225, 190, 231, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(rx, ry, circleR * 0.65, (now * 0.001) % (Math.PI * 2), (now * 0.001) % (Math.PI * 2) + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Central altar core
    ctx.fillStyle = 'rgba(186, 104, 200, 0.25)';
    ctx.beginPath();
    ctx.arc(rx, ry, 26, 0, Math.PI * 2);
    ctx.fill();

    // Energy beam lines from altar to alive ritualists
    for (const re of enemies) {
      if (re.isRitualist && re.hp > 0) {
        const ex = re.x - camera.x;
        const ey = re.y - camera.y;
        ctx.strokeStyle = 'rgba(224, 64, 251, 0.35)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    }

    // Floating timer & status text over the altar
    ctx.font = 'bold 12px "Press Start 2P", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.fillText(`⏳ ${Math.ceil(currentRitual.timer)}s`, rx + 1, ry - 35 + 1);
    ctx.fillStyle = '#f48fb1';
    ctx.fillText(`⏳ ${Math.ceil(currentRitual.timer)}s`, rx, ry - 35);

    ctx.restore();
  }
}

// ═══ KRAKEN TENTACLE ERUPTIONS ═══
for (const er of krakenEruptions) {
  const x = er.x - camera.x, y = er.y - camera.y;
  if (x < -120 || x > viewW + 120 || y < -120 || y > viewH + 120) continue;
  ctx.save();
  if (!er.erupted) {
    // Telegraph ring & filling vortex indicator
    const prog = Math.min(1, 1 - (er.timer / er.maxTimer));
    const pulse = 1 + 0.06 * Math.sin(performance.now() * 0.015);
    const r = er.radius * pulse;

    // Outer warning boundary
    ctx.strokeStyle = `rgba(0, 229, 255, ${0.45 + prog * 0.5})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    // Expanding fill disk
    ctx.fillStyle = `rgba(0, 229, 255, ${0.12 + prog * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, r * prog, 0, Math.PI * 2);
    ctx.fill();

    // Warning spokes
    ctx.strokeStyle = 'rgba(255, 23, 68, 0.45)';
    ctx.lineWidth = 1.5;
    const now = performance.now();
    for (let s = 0; s < 4; s++) {
      const sa = (now * 0.005) + (s * Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(sa) * r, y + Math.sin(sa) * r);
      ctx.lineTo(x + Math.cos(sa) * (r * 0.38), y + Math.sin(sa) * (r * 0.38));
      ctx.stroke();
    }
  } else {
    // Tentacle actively erupting / crushing
    const lingerRatio = Math.max(0, er.linger / 0.55);
    const scale = Math.sin(lingerRatio * Math.PI);
    const erRad = Math.max(6, (Number.isFinite(er.radius) ? er.radius : 30) * 1.4);
    const erGrad = ctx.createRadialGradient(x, y, 4, x, y, erRad);
    erGrad.addColorStop(0, `rgba(0, 229, 255, ${lingerRatio * 0.72})`);
    erGrad.addColorStop(0.6, `rgba(13, 71, 161, ${lingerRatio * 0.5})`);
    erGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = erGrad;
    ctx.beginPath();
    ctx.arc(x, y, er.radius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Whipping tentacle silhouette
    ctx.fillStyle = `rgba(8, 24, 40, ${0.92 * lingerRatio})`;
    ctx.strokeStyle = `rgba(0, 229, 255, ${0.85 * lingerRatio})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const tentH = 80 * scale;
    ctx.ellipse(x, y - tentH * 0.45, er.radius * 0.32, tentH * 0.5, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
  // Garlic Ward glowing aura circle
  const garlicWeapon = playerWeapons.find(w => w.id === 'garlic');
  if (garlicWeapon) {
    const gstats = scaleWeaponStats(WEAPON_DEFS.garlic.stats(garlicWeapon.level));
    const cx = player.x + player.w / 2 - camera.x;
    const cy = player.y + player.h / 2 - camera.y;
    const r = gstats.radius * player.areaMult;
    const now = performance.now();
    const pulse = 1 + 0.025 * Math.sin(now * 0.005);
    const rad = r * pulse;

    ctx.save();
    drawCachedRadialGlow(cx, cy, rad, '195,245,150', 0.14, true);

    // High-res Garlic Aura rotating overlay
    const auraSize = rad * 1.6;
    ctx.save();
    ctx.globalAlpha = 0.32 + 0.08 * Math.sin(now * 0.003);
    ctx.translate(cx, cy);
    ctx.rotate(now * 0.0008);
    drawSprite('garlic_aura', -auraSize/2, -auraSize/2, auraSize, auraSize);
    ctx.restore();

    const borderAlpha = 0.55 + 0.15 * Math.sin(now * 0.004);
    ctx.strokeStyle = `rgba(220, 255, 180, ${borderAlpha})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();

    // Inner subtle concentric ring
    ctx.strokeStyle = `rgba(180, 240, 140, ${borderAlpha * 0.45})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, rad - 3.5), 0, Math.PI * 2);
    ctx.stroke();

    // Rotating protective motes along the ward perimeter
    const motes = 4;
    ctx.fillStyle = 'rgba(255, 255, 220, 0.85)';
    for (let m = 0; m < motes; m++) {
      const moteAngle = (now * 0.0012) + (m * Math.PI * 2 / motes);
      const mx = cx + Math.cos(moteAngle) * rad;
      const my = cy + Math.sin(moteAngle) * rad;
      ctx.beginPath();
      ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }



  const chronoEffect=playerWeapons.find(item=>item.id==='chrono'||item.id==='temporalLord');
  if(chronoEffect){const cstats=WEAPON_DEFS[chronoEffect.id].stats(chronoEffect.level),cx=player.x+player.w/2-camera.x,cy=player.y+player.h/2-camera.y,r=cstats.radius*player.areaMult;ctx.save();drawCachedRadialGlow(cx,cy,r,'255,211,92',0.09,true);ctx.strokeStyle=`rgba(255,214,100,${.3+.06*Math.sin(performance.now()*.003)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();ctx.restore();}
  // Layer 6: Y-sorted entities
  RENDER_STATS.activeLayer = 'entities';
  const renderList=[];
  const occluders=[];
  for(const ch of vis)for(const t of ch.tall){
    if(state.isInDream){
      const shopX = 600000 * TILE, shopY = 600000 * TILE;
      if(Math.abs(t.x - shopX) < 420 && t.y > shopY - 450 && t.y < shopY + 220) continue;
    }
    const sx=t.x-camera.x,sy=t.y-camera.y;
    if (t.isWall) {
      if(sx < -TILE - 40 || sx > viewW + TILE + 40 || sy < -TILE - 40 || sy > viewH + 140) continue;
      const tx = t.x, ty = t.y;
      const wallX = tx - TILE/2 - camera.x, wallY = ty - TILE - camera.y;
      const nearPlayer = Math.abs(tx - player.x) < 220 && Math.abs(ty - player.y) < 220;
      if (nearPlayer) occluders.push({
        x1: wallX, y1: wallY, x2: wallX + TILE, y2: wallY + TILE, sortY: ty,
        drawMask: (mctx) => {
          if (undergroundTilesetImg.complete && undergroundTilesetImg.naturalWidth > 0) {
            mctx.drawImage(undergroundTilesetImg, t.srcX, t.srcY, 16, 16, wallX, wallY, TILE, TILE);
          } else {
            drawSprite('caveWall', wallX, wallY, TILE, TILE, false, 1.0, mctx);
          }
          if (t.oreSprite) {
            drawSprite(t.oreSprite, tx - camera.x - TILE * 0.35, ty - camera.y - TILE * 0.85, TILE * 0.7, TILE * 0.7, false, 1.0, mctx);
          }
        }
      });
      renderList.push({y: ty, draw: () => {
        if (undergroundTilesetImg.complete && undergroundTilesetImg.naturalWidth > 0) {
          ctx.drawImage(undergroundTilesetImg, t.srcX, t.srcY, 16, 16, wallX, wallY, TILE, TILE);
        } else {
          drawSprite('caveWall', wallX, wallY, TILE, TILE);
        }
        if (t.oreSprite) {
          drawSprite(t.oreSprite, tx - camera.x - TILE * 0.35, ty - camera.y - TILE * 0.85, TILE * 0.7, TILE * 0.7);
        }
      }});
      continue;
    }
    if (t.isUndergroundProp) {
      if(sx < -80 || sx > viewW + 80 || sy < -100 || sy > viewH + 100) continue;
      const tx = t.x, ty = t.y;
      const propX = tx - camera.x - t.dw/2, propY = ty - camera.y - t.dh;
      occluders.push({
        x1: propX, y1: propY, x2: propX + t.dw, y2: propY + t.dh, sortY: ty,
        drawMask: (mctx) => {
          if (t.img && t.img.complete && t.img.naturalWidth > 0) {
            mctx.drawImage(t.img, t.srcX, t.srcY, t.sw, t.sh, propX, propY, t.dw, t.dh);
          }
        }
      });
      renderList.push({y: ty, draw: () => {
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.beginPath();
        ctx.ellipse(tx - camera.x, ty - camera.y - 2, t.dw * 0.36, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (t.img && t.img.complete && t.img.naturalWidth > 0) {
          ctx.drawImage(t.img, t.srcX, t.srcY, t.sw, t.sh, propX, propY, t.dw, t.dh);
        }
      }});
      continue;
    }
    if (t._dw === undefined) {
      const dims=window.TREE_DIMS?.[t.sprite]||(window.TREE_ALIASES?.[t.sprite]&&window.TREE_DIMS[window.TREE_ALIASES[t.sprite]]);
      const dreamReg=window.DREAM_BIOME_SHEET?.regions?.[t.sprite];
      const r=ATLAS.regions[t.sprite];
      if(!dims&&!r&&!dreamReg){ t._skip = true; continue; }
      const effScale=dreamReg?(t.scale||1.4):(dims?(t.scale||2.0)*(dims.scale||1.0):(t.scale||3.5));
      t._dw=Math.round((dreamReg?dreamReg.w:(dims?dims.w:r.w))*effScale);
      t._dh=Math.round((dreamReg?dreamReg.h:(dims?dims.h:r.h))*effScale);
      t._padB=dims?(dims.padBottom*effScale):0;
      t._rootY=t.y-t._padB;
      t._isFlat = typeof t.sprite === 'string' && t.sprite.startsWith('CaveObj_128_magic_circle');
      t._isHole = typeof t.sprite === 'string' && (t.sprite.startsWith('abyss_hole_pit') || t.sprite.startsWith('Hole_pit') || t.sprite.startsWith('hole_pit'));
      t._sortY = t._isFlat ? (t.y - t._dh * 0.85) : t._isHole ? (t.y - t._dh * 0.70) : t._rootY;
      t._hasDims = Boolean(dims);
      t._tName = window.EXT_TREES?.[t.sprite] ? t.sprite : window.TREE_ALIASES?.[t.sprite];
    } else if (t._skip) {
      continue;
    }
    const dw=t._dw, dh=t._dh, rootContactY=t._rootY, isFlatRitual=t._isFlat, isHolePit=t._isHole, sortY=t._sortY;
    if(sx<-dw-40||sx>viewW+dw+40||sy<-dh-40||sy>viewH+140)continue;
    const tx=t.x,ty=t.y,ts=t.sprite;
    const propX = Math.round(tx - camera.x - dw/2), propY = Math.round(ty - camera.y - dh);
    if (!isFlatRitual && !isHolePit) {
      const nearPlayer = Math.abs(tx - player.x) < 260 && Math.abs(ty - player.y) < 260;
      if (nearPlayer) occluders.push({
        x1: propX, y1: propY, x2: propX + dw, y2: propY + dh, sortY,
        drawMask: (mctx) => {
          drawSprite(ts, propX, propY, dw, dh, false, 1.0, mctx);
        }
      });
    }
    renderList.push({y:sortY,draw:()=>{
      if(t._hasDims){
        if(!isFlatRitual && !isHolePit && ts!=='CaveObj_64_Bonefire'){
          drawTreeShadow(tx-camera.x,rootContactY-camera.y,dw*0.20,dw*0.07);
        }
        const atlasReg = t._tName ? window.EXT_TREES_ATLAS?.regions?.[t._tName] : null;
        if (atlasReg && window.EXT_TREES_ATLAS?.canvas) {
          ctx.drawImage(window.EXT_TREES_ATLAS.canvas, atlasReg.sx, atlasReg.sy, atlasReg.sw, atlasReg.sh, propX, propY, dw, dh);
        } else {
          drawSprite(ts,propX,propY,dw,dh,false,1.0);
        }
      } else {
        drawShadow(tx-camera.x,ty-camera.y-2,dw*.35,1.2);
        drawSprite(ts,propX,propY,dw,dh);
      }
      if(t.featureType==='cave' || t.featureType==='voidPortal' || t.featureType==='sunkenShrine' || t.featureType==='abyssReturnPortal' || t.featureType==='chickenShrine' || t.featureType==='chickenReturnPortal' || t.featureType==='lifeWell'){
        const px = player.x + player.w/2, py = player.y + player.h/2;
        const cx = tx, cy = ty - dh * 0.4;
        const distSq = (cx - px)**2 + (cy - py)**2;
        const maxDist = (t.featureType==='voidPortal' || t.featureType==='sunkenShrine' || t.featureType==='abyssReturnPortal' || t.featureType==='chickenShrine' || t.featureType==='chickenReturnPortal') ? 45000 : 25600;
        if(distSq < maxDist){
          const isUnderworld = (player.x / TILE) > 100000;
          let badgeText = '';
          if (t.featureType === 'sunkenShrine') {
            if (!campSave.hasAbyssalKey) {
              badgeText = (isNight() && flood.active) ? '[E] Awaken Shrine' : '[E] Examine Shrine';
            } else {
              badgeText = '[E] Enter The Abyss';
            }
          } else if (t.featureType === 'abyssReturnPortal') {
            badgeText = '[E] Return to the Surface';
          } else if (t.featureType === 'chickenShrine') {
            const hasEgg = Boolean(
              campSave.hasGoldenEgg ||
              (campSave.materials && campSave.materials.goldenEgg > 0) ||
              (campSave.collectedTrophies && campSave.collectedTrophies.includes('goldenEgg'))
            );
            badgeText = hasEgg ? '[E] Open Chicken Portal (Golden Egg)' : '[E] Inspect Chicken Shrine';
          } else if (t.featureType === 'chickenReturnPortal') {
            badgeText = '[E] Return to the Plains';
          } else if (t.featureType === 'voidPortal') {
            badgeText = '[E] Enter Void';
          } else if (t.featureType === 'lifeWell') {
            badgeText = '[Well of Life] Healing Waters';
          } else {
            badgeText = isUnderworld ? '[E] Return to Surface' : '[E] Enter Cave';
          }
          ctx.save();
          const bob = Math.sin(performance.now()/220)*3;
          ctx.font = 'bold 12px sans-serif';
          const bw = ctx.measureText(badgeText).width + 16;
          ctx.fillStyle = 'rgba(12, 18, 24, 0.9)';
          ctx.strokeStyle = (t.featureType === 'lifeWell') ? '#64ffda' : ((t.featureType === 'sunkenShrine' || t.featureType === 'abyssReturnPortal') ? '#00e5ff' : '#ffd54f');
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(tx - camera.x - bw/2, ty - camera.y - dh - 20 + bob, bw, 22, 5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(badgeText, tx - camera.x, ty - camera.y - dh - 5 + bob);
          ctx.restore();
        }
      }
    }});
  }
  for(const ch of vis)for(const site of ch.relicSites||[]){
    if(relicJournalIds.has(site.id)||site.id===carriedRelic?.id)continue;
    const sx=site.x-camera.x,sy=site.y-camera.y;
    if(sx<-80||sx>viewW+80||sy<-150||sy>viewH+80)continue;
    renderList.push({y:site.y+1,draw:()=>{
      const now = performance.now();
      const pulse = 0.85 + 0.15 * Math.sin(now / 220 + site.x);
      const bob = Math.sin(now / 260 + site.x) * 6;
      const relicColor = site.color || '#e398ff';

      ctx.save();

      // 1. Vertical Luminous Beacon Beam
      const beamH = 120;
      const beamGrad = ctx.createLinearGradient(sx, sy - beamH, sx, sy - 6);
      beamGrad.addColorStop(0, 'rgba(0,0,0,0)');
      beamGrad.addColorStop(0.5, `${relicColor}26`);
      beamGrad.addColorStop(1, `${relicColor}80`);
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(sx - 24, sy - 6);
      ctx.lineTo(sx - 8, sy - beamH);
      ctx.lineTo(sx + 8, sy - beamH);
      ctx.lineTo(sx + 24, sy - 6);
      ctx.closePath();
      ctx.fill();

      // 2. Glowing Magic Pedestal (Ground Ellipse)
      ctx.shadowColor = relicColor;
      ctx.shadowBlur = 24;
      ctx.strokeStyle = relicColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 6, 26 * pulse, 10 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();

      const groundGlow = ctx.createRadialGradient(sx, sy - 6, 2, sx, sy - 6, 26 * pulse);
      groundGlow.addColorStop(0, `${relicColor}55`);
      groundGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = groundGlow;
      ctx.beginPath();
      ctx.ellipse(sx, sy - 6, 26 * pulse, 10 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Radial Halo behind Floating Relic
      const relicCenterY = sy - 46 + bob;
      const halo = ctx.createRadialGradient(sx, relicCenterY, 4, sx, relicCenterY, 40 * pulse);
      halo.addColorStop(0, `${relicColor}cc`);
      halo.addColorStop(0.5, `${relicColor}44`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(sx, relicCenterY, 40 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 4. Large Relic Sprite (58x58 px!)
      const relicSize = 58;
      ctx.globalAlpha = 0.92 + 0.08 * pulse;
      drawSprite(site.sprite || window.extItemSprite(site.name), sx - relicSize / 2, relicCenterY - relicSize / 2, relicSize, relicSize);

      ctx.restore();
    }});
  }
  
    for(const ch of vis)for(const npc of ch.npcSites||[]){
      const sx=npc.x-camera.x,sy=npc.y-camera.y;
      if(sx<-50||sx>viewW+50||sy<-80||sy>viewH+50)continue;
      
      let indicator = npc.indicator || '!';
      let color = npc.indicatorColor || '#52ff52';
      
      if(npc.role === 'lost_traveler'){
        const isComp = npc.quest?.completed || player.completedNPCs?.includes(npc.id);
        const isActive = player.activeQuest && player.activeQuest.npcId === npc.id;
        if(isComp){
          indicator = '✓'; color = '#4caf50';
        } else if(isActive){
          if(player.activeQuest.progress >= player.activeQuest.goal){
            indicator = '!'; color = '#ffd700';
          } else {
            indicator = '⚔'; color = '#e040fb';
          }
        }
      } else if(npc.role === 'traveler'){
        const isComp = npc.quest?.completed || player.completedNPCs?.includes(npc.id);
        const isActive = player.activeQuest && player.activeQuest.npcId === npc.id;
        if(isComp){
          indicator = '✓'; color = '#4caf50';
        } else if(isActive){
          if(player.activeQuest.progress >= player.activeQuest.goal){
            indicator = '!'; color = '#ffd700';
          } else {
            indicator = '⚔'; color = '#52ff52';
          }
        }
      } else if(npc.role === 'hermit'){
        if(npc.blessed || player.completedNPCs?.includes(npc.id)){
          indicator = '✓'; color = '#61b8ff';
        }
      }
      const isNear = activeNearbyNPC && activeNearbyNPC.id === npc.id;

      const npcAnimTime = (typeof elapsed !== 'undefined' ? elapsed : performance.now() * 0.001) + (npc.animSeed || 0);
      const faceLeft = (player.x + player.w / 2) < npc.x;
      renderList.push({y:npc.y+16, draw:()=>{
        drawShadow(sx, sy+14, 18, 1);
        if(npc.role === 'lost_traveler' && (npc.ambushActive || (player.activeQuest?.npcId === npc.id && player.activeQuest.progress < player.activeQuest.goal))){
          const pulse = 0.88 + 0.12 * Math.sin(performance.now() * 0.006);
          ctx.save();
          ctx.beginPath();
          ctx.arc(sx, sy - 10, 36 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(156, 39, 176, 0.22)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#e040fb';
          ctx.stroke();
          ctx.restore();
        }
        drawEntitySprite(npc.sprite, sx-27, sy-40, 54, 54, {
          flipX: isNear ? faceLeft : (npc.flipX || false),
          animTime: npcAnimTime
        });
        
        ctx.save();
        const bob = Math.sin(performance.now()/220)*4;
        ctx.font = 'bold 26px monospace';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';
        ctx.strokeText(indicator, sx, sy - 46 + bob);
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(indicator, sx, sy - 46 + bob);

        if(isNear && !npcModalOpen){
          let actionLabel = 'Talk';
          if(npc.role === 'merchant') actionLabel = 'Shop';
          else if(npc.role === 'gambler') actionLabel = 'Gamble';
          else if(npc.role === 'hermit') actionLabel = 'Pray';
          else if(npc.role === 'mad_farmer') actionLabel = 'Trade';
          else if((npc.role === 'lost_traveler' || npc.role === 'traveler') && player.activeQuest?.npcId === npc.id && player.activeQuest.progress >= player.activeQuest.goal) actionLabel = 'Turn In';
        else if(npc.role === 'lost_traveler' && player.activeQuest?.npcId === npc.id) actionLabel = 'Defend';
        else if(npc.role === 'traveler' && player.activeQuest?.npcId === npc.id) actionLabel = 'Bounty';
          
          const badgeText = `[E] ${actionLabel}`;
          ctx.font = 'bold 11px sans-serif';
          const bw = ctx.measureText(badgeText).width + 12;
          ctx.fillStyle = 'rgba(12, 18, 24, 0.88)';
          ctx.strokeStyle = '#d9bd75';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(sx - bw/2, sy - 52 + bob, bw, 18, 4);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.fillText(badgeText, sx, sy - 39 + bob);
        }
        ctx.restore();
      }});
    }
    for(const field of voidRifts)renderList.push({y:field.y,draw:()=>drawWeaponField(field)});
  for(const spirit of summonedSpirits)renderList.push({y:spirit.y+10,draw:()=>drawSummonedSpirit(spirit)});
  for(const swing of meleeSwings)renderList.push({y:(swing.followPlayer?(player.y+player.h/2):swing.y)+player.h/2,draw:()=>drawWeaponSwing(swing)});
  for(const whip of activeChainWhips)renderList.push({y:player.y+player.h+2,draw:()=>drawChainWhip(whip)});
  const mEntities = getVisibleMountainEntities(camera.x, camera.y, viewW, viewH, performance.now(), player);
  for(let i=0; i<mEntities.length; i++){
    const me = mEntities[i];
    renderList.push({
      y: me.y,
      draw: () => me.draw(ctx)
    });
  }
  const visibleEnemies = [];
  for(let i=0,len=enemies.length;i<len;i++){
    const e=enemies[i];
    const ex=e.x-camera.x,ey=e.y-camera.y;
    const isBossOrBig = Boolean(ENEMY_TYPES[e.type]?.boss || e.ultraElite || (e.w || 32) > 64);
    const m = isBossOrBig ? 120 : 64;
    if(ex < -m || ex > viewW + m || ey < -m || ey > viewH + m) continue;
    visibleEnemies.push(e);
    renderList.push({y:e.y+e.h,enemy:e});
  }
  companions.forEach((companion,index)=>{
    renderList.push({
      y:companion.y+(companion.id==='fox'?12:17),
      draw:()=>drawCampCompanion(companion,index)
    });
    if(companion.id==='morvath'&&Array.isArray(companion.summons)){
      for(let si=0;si<companion.summons.length;si++){
        const s=companion.summons[si];
        if(s.life<=0)continue;
        renderList.push({
          y:s.y+s.h*0.5,
          draw:()=>{
            const sx=s.x-camera.x,sy=s.y-camera.y;
            const alpha=s.life<0.45?Math.max(0.15,s.life/0.45):1;
            drawShadow(sx,sy+s.h*0.42,s.w*0.36,0.9);
            drawEntitySprite(s.sprite,sx-s.w*0.5,sy-s.h*0.5,s.w,s.h,{
              flipX:s.flipX,
              animTime:s.animTime||0,
              isMoving:Boolean(s.isMoving),
              outlineColor:'#b388ff',
              alpha
            });
          }
        });
      }
    }
  });
  renderList.push({y:player.y+player.h,draw:drawPlayer});
  if((player.pickaxeSwingTimer||0)>0){
    renderList.push({y:player.y+player.h,draw:()=>drawPickaxeSwing(player.x-camera.x,player.y-camera.y)});
  }
  renderList.sort((a,b)=>a.y-b.y);
  for(let i=0,len=renderList.length;i<len;i++){
    const r=renderList[i];
    if(r.enemy)drawEnemy(r.enemy);
    else r.draw();
  }
  for(const beam of prismBeams) drawPrismBeam(beam);
  for(const arc of rainbowArcs) drawRainbowArc(arc);
  if(carriedRelic){
    const rx = player.x + player.w/2 - camera.x;
    const ry = player.y - camera.y - 30;
    const bob = Math.sin(performance.now() / 200) * 4;
    const relicColor = carriedRelic.color || '#e398ff';
    const relicSize = 48;

    ctx.save();
    ctx.shadowColor = relicColor;
    ctx.shadowBlur = 20;

    const halo = ctx.createRadialGradient(rx, ry + bob, 4, rx, ry + bob, 32);
    halo.addColorStop(0, `${relicColor}99`);
    halo.addColorStop(0.6, `${relicColor}33`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(rx, ry + bob, 32, 0, Math.PI * 2);
    ctx.fill();

    drawSprite(carriedRelic.sprite || window.extItemSprite(carriedRelic.name), rx - relicSize / 2, ry + bob - relicSize / 2, relicSize, relicSize);
    ctx.restore();
  }

  // Layer 6.5: Underground Overhead Tiles (Pseudo-3D archways / structures that hide the character)
  if (undergroundNow) {
    const dung = window.DUNGEON1_DATA;
    const overImg = (dungeon1OverheadImg && dungeon1OverheadImg.complete && dungeon1OverheadImg.naturalWidth > 0)
      ? dungeon1OverheadImg
      : dungeon1MapImg;
    if (dung && dung.overhead && overImg && (overImg.complete || overImg.width > 0)) {
      const minDtx = Math.max(0, Math.floor((camera.x - 200000 * TILE) / TILE));
      const maxDtx = Math.min(dung.width - 1, Math.ceil((camera.x + viewW - 200000 * TILE) / TILE));
      const minDty = Math.max(0, Math.floor((camera.y - 200000 * TILE) / TILE));
      const maxDty = Math.min(dung.height - 1, Math.ceil((camera.y + viewH - 200000 * TILE) / TILE));

      for (let dty = minDty; dty <= maxDty; dty++) {
        const row = dung.overhead[dty];
        if (!row) continue;
        for (let dtx = minDtx; dtx <= maxDtx; dtx++) {
          if (row[dtx] === '1') {
            if (window.brokenWalls && window.brokenWalls.has(`${200000 + dtx},${200000 + dty}`)) continue;
            const sx = (200000 + dtx) * TILE - camera.x;
            const sy = (200000 + dty) * TILE - camera.y;
            ctx.drawImage(overImg, dtx * 16, dty * 16, 16, 16, sx, sy, TILE, TILE);
            const srcX = dtx * 16, srcY = dty * 16;
            occluders.push({
              x1: sx, y1: sy, x2: sx + TILE, y2: sy + TILE, sortY: Infinity,
              drawMask: (mctx) => {
                mctx.drawImage(overImg, srcX, srcY, 16, 16, sx, sy, TILE, TILE);
              }
            });
          }
        }
      }
    }
  }

  // Layer 6.6: Occluded Entity Silhouettes (Player, Companions, Enemies behind trees/rocks/walls)
  if (occluders.length > 0 && (!window.RENDER_DEBUG || window.RENDER_DEBUG.silhouettes !== false)) {
    const renderOccludedSilhouette = (bx, by, bw, bh, entitySortY, tintColor, drawFn) => {
      const rx = Math.max(0, Math.floor(bx));
      const ry = Math.max(0, Math.floor(by));
      const rx2 = Math.min(viewW, Math.ceil(bx + bw));
      const ry2 = Math.min(viewH, Math.ceil(by + bh));
      const rw = rx2 - rx, rh = ry2 - ry;
      if (rw <= 0 || rh <= 0) return false;
      let hasOverlap = false;
      for (let j = 0, olen = occluders.length; j < olen; j++) {
        const occ = occluders[j];
        if (occ.sortY <= entitySortY) continue;
        if (occ.x2 > rx && occ.x1 < rx2 && occ.y2 > ry && occ.y1 < ry2) {
          hasOverlap = true;
          break;
        }
      }
      if (!hasOverlap) return false;
      if (!silhouetteCanvas) {
        silhouetteCanvas = document.createElement('canvas');
        silhouetteCtx = silhouetteCanvas.getContext('2d');
      }
      const isLegacySil = Boolean(window.RENDER_DEBUG?.legacySilhouette || window.GAME_SETTINGS?.legacySilhouette);
      if (isLegacySil) {
        if (silhouetteCanvas.width !== viewW || silhouetteCanvas.height !== viewH) {
          silhouetteCanvas.width = viewW;
          silhouetteCanvas.height = viewH;
        }
        silhouetteCtx.imageSmoothingEnabled = false;
        silhouetteCtx.clearRect(rx, ry, rw, rh);
        silhouetteCtx.globalCompositeOperation = 'source-over';
        silhouetteCtx.globalAlpha = 1.0;
        for (let j = 0, olen = occluders.length; j < olen; j++) {
          const occ = occluders[j];
          if (occ.sortY <= entitySortY) continue;
          if (occ.x2 > rx && occ.x1 < rx2 && occ.y2 > ry && occ.y1 < ry2) {
            occ.drawMask(silhouetteCtx);
          }
        }
        silhouetteCtx.globalCompositeOperation = 'source-in';
        silhouetteRenderTint = tintColor;
        silhouetteTargetCtx = silhouetteCtx;
        drawFn();
        silhouetteRenderTint = null;
        silhouetteTargetCtx = null;
        silhouetteCtx.globalCompositeOperation = 'source-over';

        ctx.save();
        ctx.globalAlpha = 0.52;
        const prevLayer = RENDER_STATS.activeLayer;
        RENDER_STATS.activeLayer = 'silhouette';
        ctx.drawImage(silhouetteCanvas, rx, ry, rw, rh, rx, ry, rw, rh);
        RENDER_STATS.activeLayer = prevLayer;
        ctx.restore();
        return true;
      }

      // Optimized localized silhouette buffer (at most ~256x256 instead of 4K!)
      const sW = Math.max(256, Math.ceil(rw));
      const sH = Math.max(256, Math.ceil(rh));
      if (silhouetteCanvas.width < sW || silhouetteCanvas.height < sH) {
        silhouetteCanvas.width = Math.max(silhouetteCanvas.width || 0, sW);
        silhouetteCanvas.height = Math.max(silhouetteCanvas.height || 0, sH);
      }
      silhouetteCtx.imageSmoothingEnabled = false;
      silhouetteCtx.setTransform(1, 0, 0, 1, 0, 0);
      silhouetteCtx.clearRect(0, 0, rw, rh);
      silhouetteCtx.translate(-rx, -ry);
      silhouetteCtx.globalCompositeOperation = 'source-over';
      silhouetteCtx.globalAlpha = 1.0;
      for (let j = 0, olen = occluders.length; j < olen; j++) {
        const occ = occluders[j];
        if (occ.sortY <= entitySortY) continue;
        if (occ.x2 > rx && occ.x1 < rx2 && occ.y2 > ry && occ.y1 < ry2) {
          occ.drawMask(silhouetteCtx);
        }
      }
      silhouetteCtx.globalCompositeOperation = 'source-in';
      silhouetteRenderTint = tintColor;
      silhouetteTargetCtx = silhouetteCtx;
      drawFn();
      silhouetteRenderTint = null;
      silhouetteTargetCtx = null;
      silhouetteCtx.globalCompositeOperation = 'source-over';

      ctx.save();
      ctx.globalAlpha = 0.52;
      const prevLayer = RENDER_STATS.activeLayer;
      RENDER_STATS.activeLayer = 'silhouette';
      ctx.drawImage(silhouetteCanvas, 0, 0, rw, rh, rx, ry, rw, rh);
      RENDER_STATS.activeLayer = prevLayer;
      ctx.restore();
      return true;
    };

    // 1. Enemies (Restricted to Bosses and Ultra-Elites for 90%+ silhouette rendering speedup)
    for (let i = 0, len = visibleEnemies.length; i < len; i++) {
      const e = visibleEnemies[i];
      const isBoss = Boolean(ENEMY_TYPES[e.type]?.boss);
      if (!isBoss && !e.ultraElite) continue;
      const isWhale = (e.type === 'abyss_whale_1' || e.type === 'abyss_whale_2' || e.type === 'abyss_whale');
      if (isWhale) continue;
      const ex = e.x - camera.x, ey = e.y - camera.y;
      const isKraken = (e.type === 'abyss_octopus' || e.type === 'Abyssal_kraken');
      const bossVisualScale = (isBoss && !isKraken) ? 1.45 : 1.0;
      const drawW = Math.round(e.w * bossVisualScale);
      const drawH = Math.round(e.h * bossVisualScale);
      const pad = Math.max(drawW, drawH) * 0.45 + 14;
      const tint = e.ultraElite ? '#e040fb' : (isBoss ? '#ff6d00' : (e.elite ? '#ffd54f' : '#ff5252'));
      renderOccludedSilhouette(
        ex - drawW / 2 - pad,
        ey + e.h / 2 - drawH - pad,
        drawW + pad * 2,
        drawH + pad * 2,
        e.y + e.h,
        tint,
        () => drawEnemy(e)
      );
    }

    // 2. Companions
    for (let i = 0, len = companions.length; i < len; i++) {
      const comp = companions[i];
      const cx = comp.x - camera.x, cy = comp.y - camera.y;
      renderOccludedSilhouette(
        cx - 28,
        cy - 34,
        56,
        68,
        comp.y + (comp.id === 'fox' ? 12 : 17),
        '#69f0ae',
        () => drawCampCompanion(comp, i)
      );
    }

    // 3. Player (and active Mount)
    const px = player.x - camera.x, py = player.y - camera.y;
    const hasMount = Boolean(getActiveMount());
    const pPadX = hasMount ? player.w * 1.6 : player.w * 0.9;
    const pPadY = hasMount ? player.h * 2.2 : player.h * 1.3;
    renderOccludedSilhouette(
      px - pPadX,
      py - pPadY,
      player.w + pPadX * 2,
      player.h + pPadY * 1.5,
      player.y + player.h,
      '#4fc3f7',
      drawPlayer
    );
  }

  // Layer 6.7: Celestial Body (Sun / Moon - moves in arc, clouds pass in front of it)
  RENDER_STATS.activeLayer = 'clouds';
  if(drawWeather && !state.isInDream && !isUnderworld && !isVoid && !isAbyss && !isChickenDim) drawCelestialBody();

  // Layer 6.8: Parallax Clouds (drawn high in the sky over trees, ground and characters, under projectiles, weather & HUD)
  if(drawWeather && !state.isInDream && !isUnderworld && !isVoid && !isAbyss && !isChickenDim) drawParallaxClouds();

  // Layer 7: projectiles
  RENDER_STATS.activeLayer = 'projectiles';
  for(const p of projectiles){
    const sx = p.x - camera.x, sy = p.y - camera.y;
    if (sx < -60 || sx > viewW + 60 || sy < -60 || sy > viewH + 60) continue;
    
    // Distinct Enemy Projectile Warning Glow (prevents invisible or blended hostile shots)
    if(p.enemyShot){
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(p.w, p.h) * 0.75 + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffebee';
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(p.w, p.h) * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if(p.sprite==='arcane_bolt' || p.sprite==='bolt' || p.sprite === 'ext_item_121' || p.sprite === 'ext_item_114'){
      ctx.globalAlpha=.45;ctx.fillStyle='#bb86fc'; ctx.beginPath();ctx.arc(sx,sy,p.w*.65,0,Math.PI*2);ctx.fill(); ctx.globalAlpha=1;
    }
    ctx.save(); ctx.translate(sx,sy); ctx.rotate(p.angle); drawSprite(p.sprite, -p.w/2, -p.h/2, p.w, p.h); ctx.restore();
	// Boomerang trail effect
    if(p.behavior==='boomerang'){
      ctx.strokeStyle='rgba(210,166,121,0.5)';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(sx,sy,14,0,Math.PI*2);
      ctx.stroke();
    }
  }

  // Layer 8: particles
  for(const p of particles){
    const px=p.x-camera.x,py=p.y-camera.y;
    const pad = p.explosion || 12;
    if(px<-pad||px>viewW+pad||py<-pad||py>viewH+pad)continue;
    const a=p.life/p.maxLife;
    if(p.explosion){
      const expSheet = p.spriteAnim ? WEAPON_BULLET_SPRITES[p.spriteAnim] : null;
      const SPRITE_ANIM_TABLES = {
        mine_explosion: { baseW: 2172, baseH: 724, maxSw: 273, minSize: 58, maxSize: 96, mult: 1.05, alphaBoost: 1.65, frames: [[6,248,236,252],[268,226,257,291],[549,227,268,291],[830,225,270,310],[1112,213,273,322],[1391,233,263,308],[1668,226,256,311],[1935,242,237,294]] },
        green_blood:    { baseW: 2083, baseH: 287, maxSw: 262, minSize: 28, maxSize: 54, mult: 1.0,  alphaBoost: 1.5,  frames: [[0,56,154,163],[234,15,209,245],[502,8,238,252],[791,0,262,287],[1098,6,227,261],[1371,6,234,254],[1655,30,205,224],[1919,29,164,240]] },
        red_blood:      { baseW: 2165, baseH: 297, maxSw: 277, minSize: 28, maxSize: 54, mult: 1.0,  alphaBoost: 1.5,  frames: [[0,55,173,192],[242,14,228,272],[521,7,255,274],[828,0,277,297],[1148,3,243,285],[1458,0,261,287],[1782,27,200,244],[2044,99,120,181]] }
      };
      const animDef = p.spriteAnim ? SPRITE_ANIM_TABLES[p.spriteAnim] : null;
      if (expSheet && animDef && expSheet.complete && expSheet.naturalWidth > 0) {
        const frames = animDef.frames.length;
        const progress = Math.max(0, Math.min(0.999, 1 - (p.life / p.maxLife)));
        const frameIdx = Math.min(frames - 1, Math.floor(progress * frames));
        const [rawSx, rawSy, rawSw, rawSh] = animDef.frames[frameIdx];
        const rx = expSheet.naturalWidth / animDef.baseW;
        const ry = expSheet.naturalHeight / animDef.baseH;
        const sx = rawSx * rx, sy = rawSy * ry, sw = rawSw * rx, sh = rawSh * ry;
        const scale = Math.min(animDef.maxSize, Math.max(animDef.minSize, p.explosion * animDef.mult)) / animDef.maxSw;
        const drawW = rawSw * scale;
        const drawH = rawSh * scale;
        ctx.globalAlpha = Math.min(1, a * animDef.alphaBoost);
        if (p.rot) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(p.rot);
          ctx.drawImage(expSheet, sx, sy, sw, sh, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
          ctx.restore();
        } else {
          ctx.drawImage(expSheet, sx, sy, sw, sh, px - drawW * 0.5, py - drawH * 0.52, drawW, drawH);
        }
      } else {
        ctx.globalAlpha=a*.5;ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(px,py,p.explosion*(1-a*.5),0,Math.PI*2);ctx.fill();
      }
    }else{
      ctx.globalAlpha=a;ctx.fillStyle=p.color;ctx.fillRect(px-3,py-3,6,6);
    }
  }
  ctx.globalAlpha=1;

  // Layer 9: lightnings
  if(drawWeather && !isUnderworld && !isVoid && !isAbyss && !isChickenDim && !state.isInDream) {
    for(const l of lightnings)drawLightning(l);
  }

  // Layer 10: weather particles (disabled in underground depths, void, submerged abyss, dream biome, and chicken dimension)
  if(drawWeather && !isUnderworld && !isVoid && !isAbyss && !isChickenDim && !state.isInDream && window.GAME_SETTINGS.enableWeather && window.GAME_SETTINGS?.weatherDensity !== 'off'){
    if(weather.type==='rain'||weather.type==='storm'){
      ctx.strokeStyle=weather.type==='storm'?'rgba(180,210,255,.75)':'rgba(180,210,255,.6)';
      ctx.lineWidth=1.5;
      ctx.beginPath();
      for(const p of weatherParticles){
        ctx.moveTo(p.x,p.y);
        ctx.lineTo(p.x+p.vx*.02,p.y+p.len);
      }
      ctx.stroke();
    }else if(weather.type==='snow'){
      ctx.fillStyle='rgba(255,255,255,.85)';
      for(const p of weatherParticles){
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
      }
    }
  }
// Mines (half-buried in excavated soil)
for (const m of mines) {
  const mx = Math.round(m.x - camera.x), my = Math.round(m.y - camera.y);
  if (mx < -30 || mx > viewW + 30 || my < -30 || my > viewH + 30) continue;
  const nowMs = performance.now();
  const armed = m.armTime <= 0;
  const blink = !armed ? 0.55 : (Math.sin(nowMs / 100) > 0 ? 1 : 0.72);

  // 1. Dark excavated soil pocket beneath the buried mine
  ctx.save();
  ctx.fillStyle = 'rgba(28, 19, 12, 0.76)';
  ctx.beginPath();
  ctx.ellipse(mx, my + 4, 13.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Clip top half so lower ~38% of the mine sits sunk inside the ground
  ctx.save();
  ctx.beginPath();
  ctx.rect(mx - 16, my - 18, 32, 21.5);
  ctx.clip();
  ctx.globalAlpha = blink;
  drawSprite('mine', mx - 13, my - 10, 26, 26);
  ctx.restore();

  // 3. Front overlapping dirt lip / clods hugging the buried base
  ctx.fillStyle = '#4e3723';
  ctx.beginPath();
  ctx.ellipse(mx, my + 4.5, 13, 3.8, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#755336';
  ctx.fillRect(mx - 10, my + 3, 4, 2);
  ctx.fillRect(mx - 3, my + 4, 5, 2);
  ctx.fillRect(mx + 5, my + 3, 4, 2);
  ctx.fillStyle = '#362516';
  ctx.fillRect(mx - 7, my + 5, 3, 1.5);
  ctx.fillRect(mx + 2, my + 5.5, 3, 1.5);

  // 4. Armed indicator pulse & tiny LED dot peeking above the dirt
  if (armed) {
    const pulse = 0.5 + 0.5 * Math.sin(nowMs / 80);
    ctx.strokeStyle = `rgba(255, 80, 20, ${0.42 + 0.45 * pulse})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(mx, my + 3, 16, 7.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = pulse > 0.5 ? '#ff5722' : '#ffab91';
    ctx.beginPath();
    ctx.arc(mx, my - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Orbitals
for (const w of playerWeapons) {
  if (w.id !== 'orbital') continue;
  const stats = scaleWeaponStats(WEAPON_DEFS.orbital.stats(w.level));
  const pcx = player.x + player.w/2 - camera.x;
  const pcy = player.y + player.h/2 - camera.y;
  for (let i = 0; i < stats.count; i++) {
    const a = w.angle + (i * Math.PI * 2 / stats.count);
    const ox = pcx + Math.cos(a) * stats.radius;
    const oy = pcy + Math.sin(a) * stats.radius;
    drawCachedRadialGlow(ox, oy, 20, '100,240,255', 0.45, false);
    drawSprite('orbiting_orb', ox - 14, oy - 14, 28, 28);
  }
}

// Chain lightning visuals
for (const cv of chainVisuals) {
  const a = cv.life / cv.maxLife;
  ctx.strokeStyle = `rgba(100,181,246,${a})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < cv.points.length; i++) {
    const p = cv.points[i];
    const sx = p.x - camera.x, sy = p.y - camera.y;
    if (i === 0) ctx.moveTo(sx, sy);
    else {
      // Zigzag between points
      const prev = cv.points[i-1];
      const mx = ((prev.x + p.x) / 2) - camera.x + (Math.random() - 0.5) * 20;
      const my = ((prev.y + p.y) / 2) - camera.y + (Math.random() - 0.5) * 20;
      ctx.lineTo(mx, my);
      ctx.lineTo(sx, sy);
    }
  }
  ctx.stroke();

  // Draw Lightning Orbs at chain strike targets
  for (const pt of cv.points) {
    const psx = pt.x - camera.x, psy = pt.y - camera.y;
    ctx.save();
    ctx.globalAlpha = a * 0.95;
    drawSprite('lightning_orb', psx - 14, psy - 14, 28, 28);
    ctx.restore();
  }
}
  const relicLights=[];
  for(const ch of vis)for(const site of ch.relicSites||[]){
    if(relicJournalIds.has(site.id)||site.id===carriedRelic?.id)continue;
    const sx=site.x-camera.x,sy=site.y-camera.y;
    if(sx>-90&&sx<viewW+90&&sy>-90&&sy<viewH+90)relicLights.push(site);
  }
  RENDER_STATS.activeLayer = 'lighting';
  if(state.isInDream || isChickenDim) applyDynamicLighting(1.0, relicLights);
  else if(isAbyss) applyDynamicLighting(0.1,relicLights);
  else if(isUnderworld) applyDynamicLighting(-1.2,relicLights);
  else if(window.GAME_SETTINGS.enableWeather) applyDynamicLighting(daylight,relicLights);
  RENDER_STATS.activeLayer = 'fog';
  drawFogOfWar();
  // Layer 11: damage numbers
  if(window.GAME_SETTINGS?.showDamageNumbers && window.GAME_SETTINGS?.damageNumbersMode !== 'off'){
  ctx.font='bold 16px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.strokeStyle='black';ctx.lineWidth=3;
  for(const d of damageNumbers){
    const sx = d.x - camera.x, sy = d.y - camera.y;
    if (sx < -40 || sx > viewW + 40 || sy < -30 || sy > viewH + 30) continue;
    ctx.globalAlpha=d.life/d.maxLife;
    const _dmg = typeof d.dmg === 'string' ? d.dmg : Math.round(d.dmg);
    ctx.strokeText(_dmg, sx, sy);
    ctx.fillStyle=d.color;
    ctx.fillText(_dmg, sx, sy);
  }
  }
  ctx.globalAlpha=1;

  if(activeCineZoom>1)ctx.restore();

  ctx.restore(); // end player camera zoom

  if(deathSeq.active||deathSeq.done){
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    const prog=deathSeq.done?1:Math.min(1,deathSeq.timer/deathSeq.duration);
    const cx=canvas.width/2,cy=canvas.height/2;
    const rad=Math.hypot(cx,cy);
    if (Number.isFinite(cx) && Number.isFinite(cy) && Number.isFinite(rad) && rad > 1) {
      const vig=ctx.createRadialGradient(cx,cy,rad*0.18,cx,cy,rad*0.95);
      vig.addColorStop(0,`rgba(20,4,8,${(0.12*prog).toFixed(3)})`);
      vig.addColorStop(0.55,`rgba(48,6,12,${(0.45*prog).toFixed(3)})`);
      vig.addColorStop(1,`rgba(6,4,10,${(0.88*prog).toFixed(3)})`);
      ctx.fillStyle=vig;
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    ctx.restore();
  }

  // Lightning flash overlay (fullscreen)
  
  // Draw Quest UI
  if(player.activeQuest) {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    const timerEl=document.getElementById('timer');
    const qRight=timerEl?Math.max(...['timer','biome','conditionsPanel'].map(id=>{const el=document.getElementById(id);if(!el||el.offsetParent===null)return 0;const r=el.getBoundingClientRect();return r.top<90?canvas.width-r.left:0;})):130;
    const qX=canvas.width-qRight-212;
    ctx.fillStyle = 'rgba(10,10,15,0.7)';
    const isReady = player.activeQuest.progress >= player.activeQuest.goal;
    const isAmbush = player.activeQuest.type === 'defend_traveler';
    ctx.strokeStyle = isReady ? '#ffd700' : (isAmbush ? '#e040fb' : '#52ff52');
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(qX, 10, 200, 60, 8); ctx.fill(); ctx.stroke();
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = isReady ? '#ffd700' : (isAmbush ? '#e040fb' : '#52ff52');
    ctx.textAlign = 'left';
    ctx.fillText(isReady ? 'QUEST COMPLETE!' : (isAmbush ? 'VOID AMBUSH!' : (player.activeQuest.label || 'BOUNTY HUNT')), qX + 10, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    const qLabel = player.activeQuest.type === 'kill_boss' ? 'Defeat Boss' : player.activeQuest.type === 'kill_elites' ? 'Slay Elites' : isAmbush ? 'Slay Void Rings' : (player.activeQuest.label || 'Kill Enemies');
    ctx.fillText(isReady ? (isAmbush ? 'Return to Caelen!' : 'Return to Scout!') : `${qLabel}: ${player.activeQuest.progress}/${player.activeQuest.goal}`, qX + 10, 55);
    ctx.restore();
  }

  if(lightningFlash.life>0){
    ctx.fillStyle=`rgba(255,255,255,${lightningFlash.life/.15*0.6})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  RENDER_STATS.activeLayer = 'ui';
  drawMinimap();
  drawAimReticle();
}

function drawAimReticle(){
    const active=window.GAME_SETTINGS.manualAim&&gameStarted&&!gameOver&&!paused;
    if(!active)return;
    const z=viewZoom();
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.imageSmoothingEnabled=false;
    const now=performance.now();
    const pWorldX=player.x+player.w/2, pWorldY=player.y+player.h/2;
    const aimX = pWorldX + (player.aimDirX || 0) * 200, aimY = pWorldY + (player.aimDirY || 0) * 200;
    const target=findNearestRevealedEnemy(aimX,aimY);
    if(target){
      const tx=(target.x-camera.x)*z,ty=(target.y-camera.y)*z;
      const half=Math.max(target.w||24,target.h||24)*z*.62+3+Math.sin(now/140)*2;
      const len=Math.max(5,half*.45);
      for(const [color,o] of [['#140c08',1],['#ff5a4a',0]]){
        ctx.fillStyle=color;
        const L=Math.round(tx-half),R=Math.round(tx+half),T=Math.round(ty-half),B=Math.round(ty+half),l=Math.round(len);
        ctx.fillRect(L-o,T-o,l+2*o,2+2*o);ctx.fillRect(L-o,T-o,2+2*o,l+2*o);
        ctx.fillRect(R-l-o,T-o,l+2*o,2+2*o);ctx.fillRect(R-2-o,T-o,2+2*o,l+2*o);
        ctx.fillRect(L-o,B-2-o,l+2*o,2+2*o);ctx.fillRect(L-o,B-l-o,2+2*o,l+2*o);
        ctx.fillRect(R-l-o,B-2-o,l+2*o,2+2*o);ctx.fillRect(R-2-o,B-l-o,2+2*o,l+2*o);
      }
    }
    ctx.restore();
}

// ═══════════════════════════════════════════════════════════
// PICKAXE SWING ANIMATION
// ═══════════════════════════════════════════════════════════
function drawPickaxeSwing(px, py) {
  if ((player.pickaxeSwingTimer || 0) <= 0) return;
  const progress = 1 - (player.pickaxeSwingTimer / 0.45);
  const baseAngle = -Math.PI * 0.35 + progress * (Math.PI * 0.75);
  const angle = player.facing === -1 ? -baseAngle : baseAngle;
  const pivotX = px + player.w / 2 + player.facing * 12;
  const pivotY = py + player.h * 0.55;
  const alpha = 1 - Math.max(0, (progress - 0.8) / 0.2);

  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  drawSprite('rpg_pickaxe', -27.5, -55, 55, 55);
  ctx.restore();

  // Motion arc (135° from -63° to +72°, mirrored for left-facing)
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.6})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const arcR = 30;
  const startAngle = player.facing === -1 ? Math.PI * 0.35 : -Math.PI * 0.35;
  ctx.arc(pivotX, pivotY, arcR, startAngle, angle);
  ctx.stroke();
  ctx.restore();
}


export {
  cachedFrameSunX,
  cachedFrameDaylight,
  drawShadow,
  drawTreeShadow,
  lightingCanvas,
  lightingCtx,
  applyDynamicLighting,
  SPRITE_FLASH_CACHE,
  getSpriteFlashCanvas,
  AURA_GLOW_CACHE,
  drawCachedRadialGlow,
  drawEntitySprite,
  drawSubmergedCharacter,
  drawMountedPlayer,
  drawPlayer,
  drawHealthBar,
  drawCampCompanion,
  drawEnemy,
  drawFogOfWar,
  minimapTerrainCanvas,
  minimapTerrainCtx,
  minimapCacheKey,
  lastMinimapDrawAt,
  minimapZoom,
  minimapPanX,
  minimapPanY,
  setMinimapZoom,
  resetMinimapView,
  drawMinimap,
  draw,
  drawAimReticle,
  drawPickaxeSwing
};
