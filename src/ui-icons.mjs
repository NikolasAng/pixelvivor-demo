const dreamCoinImg = new Image(); dreamCoinImg.src = 'assets/Dream biom/Environment/dream_coin.webp';
const dreamShopImg = new Image(); dreamShopImg.src = 'assets/Dream biom/Environment/Dream_shop.webp';
import { MONSTER_ANIMATIONS, TRINKET_RELIC_ICONS, ATLAS, WEAPON_BULLET_SPRITES, frostStaffImg, rainbowStaffImg, EXT_BOSSES, MATERIAL_DROPS_SPRITES, inventoryDropsSheetImg, SPECIAL_ITEMS_SPRITES, specialItemsSheetImg, SPECIAL_ITEMS_MAP, xpOrbImg, WEATHER_ICONS, BIOME_ICONS, FIELD_CONDITION_ICONS, UPGRADE_ICONS } from './assets.mjs?v336';
import { playSfx } from './audio.mjs?v336';
import { ctx } from './game-core.mjs?v336';


function createUpgradeIconElement(idOrName, size = 56) {
  if (!idOrName) return null;
  const entry = UPGRADE_ICONS[idOrName] || window.UPGRADE_ICONS?.[idOrName];
  if (!entry || !entry.img) return null;
  const { img, bbox } = entry;
  const dpr = Math.max(2, window.devicePixelRatio || 2);
  const canv = document.createElement('canvas');
  canv.width = Math.round(size * dpr);
  canv.height = Math.round(size * dpr);
  canv.style.width = `${size}px`;
  canv.style.height = `${size}px`;
  canv.className = 'upgrade-custom-icon high-detail-icon';
  const cx = canv.getContext('2d');
  cx.scale(dpr, dpr);
  cx.imageSmoothingEnabled = true;
  cx.imageSmoothingQuality = 'high';

  const [rawMinX, rawMinY, rawMaxX, rawMaxY] = bbox || [0, 0, 1024, 572];
  const isUpgradeSheet = typeof (entry.src || img.src) === 'string' && (entry.src || img.src).includes('UPGRADES');

  const draw = () => {
    if (!img.complete || !img.naturalWidth) return;
    const sxRatio = isUpgradeSheet ? (img.naturalWidth / 1024) : 1;
    const syRatio = isUpgradeSheet ? (img.naturalHeight / 572) : 1;
    const minX = Math.round(rawMinX * sxRatio), minY = Math.round(rawMinY * syRatio);
    const maxX = Math.round(rawMaxX * sxRatio), maxY = Math.round(rawMaxY * syRatio);
    const uBw = Math.max(1, maxX - minX), uBh = Math.max(1, maxY - minY);
    const uScale = Math.min((size * 0.94) / uBw, (size * 0.94) / uBh);
    const uDw = uBw * uScale, uDh = uBh * uScale;
    cx.clearRect(0, 0, size, size);
    cx.drawImage(img, minX, minY, uBw, uBh, (size - uDw) / 2, (size - uDh) / 2, uDw, uDh);
  };

  if (img.complete && img.naturalWidth > 0) {
    draw();
  } else {
    img.addEventListener('load', draw, { once: true });
  }

  return canv;
}
window.createUpgradeIconElement = createUpgradeIconElement;

function drawSprite(name,dx,dy,dw,dh,flipX=false,alpha=1,targetCtx=null){
  const c = targetCtx || ctx;
  let img = ATLAS.canvas, sx, sy, sw, sh;
  let forceSmoothing = false;
  if (typeof name === 'string' && WEAPON_BULLET_SPRITES[name]) {
    const bImg = WEAPON_BULLET_SPRITES[name];
    if (bImg && bImg.complete && bImg.naturalWidth > 0) {
      img = bImg; sx = 0; sy = 0; sw = bImg.naturalWidth; sh = bImg.naturalHeight;
      forceSmoothing = true;
    } else {
      const r = ATLAS.regions[name];
      if (r) { sx = r.x; sy = r.y; sw = r.w; sh = r.h; }
      else return;
    }
  } else if (name === 'frost_beam' || name === 'frost_staff') {
    if (frostStaffImg.complete && frostStaffImg.naturalWidth > 0) {
      img = frostStaffImg; sx = 0; sy = 0; sw = frostStaffImg.naturalWidth; sh = frostStaffImg.naturalHeight;
    } else {
      const r = ATLAS.regions['rpg_iceSprite']; if (!r) return;
      sx = r.x; sy = r.y; sw = r.w; sh = r.h;
    }
  } else if (name === 'prism_staff' || name === 'rainbow_staff') {
    if (rainbowStaffImg.complete && rainbowStaffImg.naturalWidth > 0) {
      img = rainbowStaffImg; sx = 0; sy = 0; sw = rainbowStaffImg.naturalWidth; sh = rainbowStaffImg.naturalHeight;
    } else {
      const r = ATLAS.regions['bolt']; if (!r) return;
      sx = r.x; sy = r.y; sw = r.w; sh = r.h;
    }
  } else if (name === 'dream_coin') {
    if (dreamCoinImg.complete && dreamCoinImg.naturalWidth > 0) {
      img = dreamCoinImg; sx = 0; sy = 0; sw = dreamCoinImg.naturalWidth; sh = dreamCoinImg.naturalHeight;
      forceSmoothing = true;
    } else return;
  } else if (name === 'dream_shop') {
    if (dreamShopImg.complete && dreamShopImg.naturalWidth > 0) {
      img = dreamShopImg; sx = 0; sy = 0; sw = dreamShopImg.naturalWidth; sh = dreamShopImg.naturalHeight;
      forceSmoothing = true;
    } else return;
  } else if (typeof name === 'string' && EXT_BOSSES[name]) {
    const ext = EXT_BOSSES[name];
    if (ext && ext.complete && ext.naturalWidth > 0) {
      img = ext; sx = 0; sy = 0; sw = ext.naturalWidth; sh = ext.naturalHeight;
      forceSmoothing = true;
    } else return;
  } else if (typeof name === 'string' && MATERIAL_DROPS_SPRITES[name]) {
    const reg = MATERIAL_DROPS_SPRITES[name];
    if (inventoryDropsSheetImg.complete && inventoryDropsSheetImg.naturalWidth > 0) {
      img = inventoryDropsSheetImg; sx = reg.sx; sy = reg.sy; sw = reg.sw; sh = reg.sh;
      forceSmoothing = true;
    } else {
      const r = ATLAS.regions[name]; if (!r) return;
      sx = r.x; sy = r.y; sw = r.w; sh = r.h;
    }
    } else if (typeof name === 'string' && (TRINKET_RELIC_ICONS[name] || (typeof window !== 'undefined' && window.TRINKET_RELIC_ICONS?.[name]))) {
    const iconImg = TRINKET_RELIC_ICONS[name] || (typeof window !== 'undefined' && window.TRINKET_RELIC_ICONS?.[name]);
    if (iconImg && iconImg.complete && iconImg.naturalWidth > 0) {
      img = iconImg; sx = 0; sy = 0; sw = iconImg.naturalWidth; sh = iconImg.naturalHeight;
      forceSmoothing = true;
    } else return;
  } else if (typeof name === 'string' && (MONSTER_ANIMATIONS[name] || (typeof window !== 'undefined' && window.MONSTER_ANIMATIONS?.[name]))) {
    const anim = MONSTER_ANIMATIONS[name] || (typeof window !== 'undefined' && window.MONSTER_ANIMATIONS?.[name]);
    if (anim.img && anim.img.complete && anim.img.naturalWidth > 0) {
      img = anim.img;
      const fw = anim.frameW || 128, fh = anim.frameH || 128;
      sx = 0; sy = 0; sw = fw; sh = fh;
      forceSmoothing = true;
    } else return;
  } else if (typeof name === 'string' && SPECIAL_ITEMS_SPRITES[name]) {
    const reg = SPECIAL_ITEMS_SPRITES[name];
    if (specialItemsSheetImg.complete && specialItemsSheetImg.naturalWidth > 0) {
      img = specialItemsSheetImg; sx = reg.sx; sy = reg.sy; sw = reg.sw; sh = reg.sh;
      forceSmoothing = true;
    } else {
      const r = ATLAS.regions[name]; if (!r) return;
      sx = r.x; sy = r.y; sw = r.w; sh = r.h;
    }
  } else if (name === 'xp_orb') {
    if (xpOrbImg.complete && xpOrbImg.naturalWidth > 0) {
      img = xpOrbImg; sx = 0; sy = 0; sw = xpOrbImg.naturalWidth; sh = xpOrbImg.naturalHeight;
      forceSmoothing = true;
    } else {
      const r = ATLAS.regions['gem']; if (!r) return;
      sx = r.x; sy = r.y; sw = r.w; sh = r.h;
    }
  } else if (name === 'xp_gem_elite') {
    const gemImg = window.XP_GEM_ELITE_IMG;
    if (gemImg && gemImg.complete && gemImg.naturalWidth > 0) {
      img = gemImg; sx = 0; sy = 0; sw = gemImg.naturalWidth; sh = gemImg.naturalHeight;
      forceSmoothing = true;
    } else {
      const r = ATLAS.regions['rpg_gem_amethyst']; if (!r) return;
      sx = r.x; sy = r.y; sw = r.w; sh = r.h;
    }
  } else if (name === 'xp_gem_legendary') {
    const gemImg = window.XP_GEM_LEGENDARY_IMG;
    if (gemImg && gemImg.complete && gemImg.naturalWidth > 0) {
      img = gemImg; sx = 0; sy = 0; sw = gemImg.naturalWidth; sh = gemImg.naturalHeight;
      forceSmoothing = true;
    } else {
      const r = ATLAS.regions['rpg_gem_diamond']; if (!r) return;
      sx = r.x; sy = r.y; sw = r.w; sh = r.h;
    }
  } else if (name === 'xp_gem_mythic') {
    const gemImg = window.XP_GEM_MYTHIC_IMG;
    if (gemImg && gemImg.complete && gemImg.naturalWidth > 0) {
      img = gemImg; sx = 0; sy = 0; sw = gemImg.naturalWidth; sh = gemImg.naturalHeight;
      forceSmoothing = true;
    } else {
      const r = ATLAS.regions['rpg_gem_ruby']; if (!r) return;
      sx = r.x; sy = r.y; sw = r.w; sh = r.h;
    }
  } else if (typeof name === 'string' && name.startsWith('ext_item_')) {
    const id = parseInt(name.split('_')[2], 10);
    const ext = window.EXT_ITEMS[id];
    if(ext && ext.complete && ext.naturalWidth>0){
      img = ext; sx = 0; sy = 0; sw = ext.naturalWidth; sh = ext.naturalHeight;
    } else return;
  } else if (typeof name === 'string' && window.ABYSS_DECOR_DIMS && window.ABYSS_DECOR_DIMS[name]) {
    const d = window.ABYSS_DECOR_DIMS[name];
    if (d.img && d.img.complete && d.img.naturalWidth > 0) {
      img = d.img; sx = d.sx; sy = d.sy; sw = d.sw; sh = d.sh;
    } else {
      ctx.save();
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(dx, dy, dw, dh);
      ctx.restore();
      return;
    }
  } else if (typeof name === 'string' && window.ABYSS_SHEET_ENEMIES?.regions?.[name]) {
    const r = window.ABYSS_SHEET_ENEMIES.regions[name];
    const sImg = window.ABYSS_SHEET_ENEMIES.img;
    if (sImg && sImg.complete && sImg.naturalWidth > 0) {
      img = sImg; sx = r.sx; sy = r.sy; sw = r.sw; sh = r.sh;
    } else {
      const ext = window.EXT_ABYSS_MOBS?.[name];
      if (ext && ext.complete && ext.naturalWidth > 0) {
        img = ext; sx = 0; sy = 0; sw = ext.naturalWidth; sh = ext.naturalHeight;
      } else {
        ctx.save();
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(dx, dy, dw, dh);
        ctx.restore();
        return;
      }
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
      } else return;
    }
  } else if (typeof name === 'string' && window.EXT_ABYSS_MOBS && window.EXT_ABYSS_MOBS[name]) {
    const ext = window.EXT_ABYSS_MOBS[name];
    if(ext && ext.complete && ext.naturalWidth>0){
      img = ext; sx = 0; sy = 0; sw = ext.naturalWidth; sh = ext.naturalHeight;
    } else {
      ctx.save();
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(dx, dy, dw, dh);
      ctx.restore();
      return;
    }
  } else if (typeof name === 'string' && window.NEW_MONSTER_SHEET?.regions?.[name] && window.NEW_MONSTER_IMG?.complete && window.NEW_MONSTER_IMG.naturalWidth > 0) {
    const mr = window.NEW_MONSTER_SHEET.regions[name];
    img = window.NEW_MONSTER_IMG; sx = mr.x; sy = mr.y; sw = mr.w; sh = mr.h;
  } else if (typeof name === 'string' && window.DREAM_BIOME_SHEET?.regions?.[name] && window.DREAM_BIOME_IMG?.complete && window.DREAM_BIOME_IMG.naturalWidth > 0) {
    const mr = window.DREAM_BIOME_SHEET.regions[name];
    img = window.DREAM_BIOME_IMG; sx = mr.x; sy = mr.y; sw = mr.w; sh = mr.h;
    forceSmoothing = true;
  } else {
    const r = ATLAS.regions[name];
    if(!r) {
      c.save();
      c.fillStyle = '#ff5252';
      c.beginPath();
      c.arc(dx + dw/2, dy + dh/2, Math.max(dw, dh) * 0.45, 0, Math.PI * 2);
      c.fill();
      c.restore();
      return;
    }
    sx = r.x; sy = r.y; sw = r.w; sh = r.h;
  }
  c.globalAlpha=alpha;
  const prevSmooth = c.imageSmoothingEnabled;
  if (forceSmoothing) c.imageSmoothingEnabled = true;
  if(flipX){c.save();c.translate(dx+dw,dy);c.scale(-1,1);c.drawImage(img,sx,sy,sw,sh,0,0,dw,dh);c.restore();}
  else c.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
  if (forceSmoothing) c.imageSmoothingEnabled = prevSmooth;
  c.globalAlpha=1;
}

function showMilestoneToast(level,label){
  const toast=document.createElement('div');toast.className='relic-toast';
  const title=document.createElement('strong');title.textContent=`LEVEL ${level} MILESTONE`;title.style.color='#ffd45c';
  const name=document.createElement('span');name.textContent=label;
  toast.append(title,name);
  const container=document.getElementById('relicToasts');
  if(container){container.replaceChildren(toast);setTimeout(()=>toast.remove(),3200);}
}

window.addMessage = function(text, color) { showDropToast(text, color); };
function showDropToast(text, color = '#ffd700', spriteName = null) {
  const container = document.getElementById('relicToasts') || document.getElementById('topNotifications');
  if(!container) return;
  Array.from(container.children).forEach(el => { if (el.id !== 'singleDropToast') el.remove(); });
  let toast = document.getElementById('singleDropToast');
  if (!toast || !container.contains(toast)) { toast = document.createElement('div'); toast.id = 'singleDropToast'; container.prepend(toast); }
  toast.replaceChildren();
  toast.className = 'relic-toast material-drop-toast';
  toast.style.borderColor = color;
  toast.style.boxShadow = `0 0 30px ${color}99`;
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  if (spriteName) {
    const icon = iconCanvas(spriteName, 34);
    if (icon) {
      icon.className = 'atlas-icon';
      toast.appendChild(icon);
    }
  }
  const msg = document.createElement('div');
  msg.innerHTML = `<strong style="color:${color};font-size:13px;letter-spacing:0.5px;">${text}</strong>`;
  toast.appendChild(msg); container.replaceChildren(toast); toast.style.animation = 'none';
  if (window.__singleDropToastTimer) clearTimeout(window.__singleDropToastTimer);
  window.__singleDropToastTimer = setTimeout(() => { if (toast && toast.parentNode) toast.remove(); window.__singleDropToastTimer = null; }, 3200);
  // single-toast timeout handled above
  // silent refresh without confirm sfx spam
}

function showRelicToast(relic){
  const toast=document.createElement('div');toast.className='relic-toast';
  const title=document.createElement('strong');
  title.textContent=relic.requiresCampReturn ? `${(relic.tierLabel||'HIGH-TIER').toUpperCase()} RELIC · EXTRACT TO CAMP` : `${(relic.tierLabel||'RELIC').toUpperCase()} RELIC · 4-SLOT INVENTORY`;
  title.style.color=relic.color||'#ffd54f';
  const name=document.createElement('span');name.textContent=relic.name;
  const wait=Math.ceil(relic.duration||20);
  const reward=document.createElement('span');
  reward.textContent=relic.requiresCampReturn
    ? `${wait}s before camp unlocks · Safe return secures it!`
    : `Added to 4-Slot Inventory! · ${relic.effect?.label||'Power active'}`;
  toast.append(title,name,reward);document.getElementById('relicToasts')?.replaceChildren(toast);
  setTimeout(()=>toast.remove(),5200);
}


function drawUiIcon(iconName, x, y, size = 24, targetCtx = null) {
  const c = targetCtx || ctx;
  const img = WEATHER_ICONS[iconName] || BIOME_ICONS[iconName] || FIELD_CONDITION_ICONS[iconName] ||
              window.WEATHER_ICONS?.[iconName] || window.BIOME_ICONS?.[iconName] || window.FIELD_CONDITION_ICONS?.[iconName];
  if (img && img.complete && img.naturalWidth > 0) {
    c.save();
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(img, x, y, size, size);
    c.restore();
    return true;
  }
  return false;
}
window.drawUiIcon = drawUiIcon;

function createUiIconElement(iconName, size = 24, fallbackSprite = null) {
  const imgObj = WEATHER_ICONS[iconName] || BIOME_ICONS[iconName] || FIELD_CONDITION_ICONS[iconName] ||
                 window.WEATHER_ICONS?.[iconName] || window.BIOME_ICONS?.[iconName] || window.FIELD_CONDITION_ICONS?.[iconName];

  if (imgObj && imgObj.src) {
    const img = document.createElement('img');
    img.src = imgObj.src;
    img.className = 'ui-custom-icon';
    img.alt = iconName;
    img.width = size;
    img.height = size;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.flexShrink = '0';
    img.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,0.65))';
    img.style.verticalAlign = 'middle';
    img.style.display = 'inline-block';
    img.style.objectFit = 'contain';
    img.style.imageRendering = 'auto'; // pristine high-res hardware filtering
    return img;
  }

  // Fallback to crisp high-DPI canvas
  const dpr = Math.max(2, window.devicePixelRatio || 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.className = 'ui-custom-icon';
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  canvas.style.flexShrink = '0';
  canvas.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,0.65))';
  canvas.style.verticalAlign = 'middle';
  canvas.style.display = 'inline-block';
  canvas.style.objectFit = 'contain';

  const cx = canvas.getContext('2d');
  cx.scale(dpr, dpr);

  if (fallbackSprite && ATLAS.regions[fallbackSprite]) {
    const r = ATLAS.regions[fallbackSprite];
    cx.clearRect(0, 0, size, size);
    const scale = Math.min(size / r.w, size / r.h) * 0.92;
    const w = r.w * scale, h = r.h * scale;
    cx.imageSmoothingEnabled = false; // atlas sprite fallback
    cx.drawImage(ATLAS.canvas, r.x, r.y, r.w, r.h, (size - w) / 2, (size - h) / 2, w, h);
  }

  return canvas;
}
window.createUiIconElement = createUiIconElement;

const activeAnimatedUiCanvases = new Set();
let uiAnimLoopId = null;

function stepAnimatedUiCanvases(time) {
  if (activeAnimatedUiCanvases.size === 0) {
    uiAnimLoopId = null;
    return;
  }
  uiAnimLoopId = requestAnimationFrame(stepAnimatedUiCanvases);
  for (const entry of activeAnimatedUiCanvases) {
    try {
      if (!entry.canvas.isConnected) {
        if (time - entry.createdTime > 3000) {
          activeAnimatedUiCanvases.delete(entry);
        }
        continue;
      }
      const frameIndex = Math.floor((time / 1000) * entry.fps) % entry.frameCount;
      if (entry.lastFrame !== frameIndex) {
        entry.lastFrame = frameIndex;
        entry.drawFrame(frameIndex);
      }
    } catch (_) {}
  }
}

function registerAnimatedUiCanvas(canvas, drawFrame, fps = 8, frameCount = 8) {
  const entry = {
    canvas,
    drawFrame,
    fps,
    frameCount,
    lastFrame: -1,
    createdTime: performance.now()
  };
  activeAnimatedUiCanvases.add(entry);
  if (!uiAnimLoopId) {
    uiAnimLoopId = requestAnimationFrame(stepAnimatedUiCanvases);
  }
}

function iconCanvas(spriteName,size=40,alignBottom=false){
  if (!spriteName) return document.createElement('canvas');
  const customUpgrade = UPGRADE_ICONS[spriteName] || window.UPGRADE_ICONS?.[spriteName];
  if (customUpgrade) {
    return createUpgradeIconElement(spriteName, size);
  }
  const customUiImg = WEATHER_ICONS[spriteName] || BIOME_ICONS[spriteName] || FIELD_CONDITION_ICONS[spriteName] ||
                      window.WEATHER_ICONS?.[spriteName] || window.BIOME_ICONS?.[spriteName] || window.FIELD_CONDITION_ICONS?.[spriteName];
  if (customUiImg) {
    const dpr = Math.max(2, window.devicePixelRatio || 2);
    const canv = document.createElement('canvas');
    canv.width = Math.round(size * dpr); canv.height = Math.round(size * dpr);
    canv.style.width = `${size}px`; canv.style.height = `${size}px`;
    const cx = canv.getContext('2d');
    cx.scale(dpr, dpr);
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    const drawUi = () => {
      if (!customUiImg.complete || !customUiImg.naturalWidth) return;
      cx.clearRect(0, 0, size, size);
      cx.drawImage(customUiImg, 0, 0, size, size);
    };
    if (customUiImg.complete && customUiImg.naturalWidth > 0) drawUi();
    else customUiImg.addEventListener('load', drawUi, { once: true });
    return canv;
  }
  if (typeof spriteName === 'string' && (
    spriteName === 'frost_staff' || spriteName === 'frost_beam' || spriteName === 'Frost_staff' ||
    spriteName === 'prism_staff' || spriteName === 'rainbow_staff' || spriteName === 'Rainbow_staff'
  )) {
    const isFrost = spriteName.toLowerCase().includes('frost');
    const srcImg = isFrost ? frostStaffImg : rainbowStaffImg;
    const canv = document.createElement('canvas');
    canv.width = size; canv.height = size;
    const cx = canv.getContext('2d');
    const draw = () => {
      if (!srcImg.complete || !srcImg.naturalWidth) return;
      const nw = srcImg.naturalWidth, nh = srcImg.naturalHeight;
      const scale = Math.min(size / nw, size / nh) * 0.92;
      const w = nw * scale, h = nh * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.imageSmoothingEnabled = false;
      cx.drawImage(srcImg, 0, 0, nw, nh, (size - w) / 2, dy, w, h);
    };
    if (srcImg.complete && srcImg.naturalWidth > 0) draw();
    else srcImg.addEventListener('load', draw, { once: true });
    return canv;
  }
  if (typeof spriteName === 'string' && WEAPON_BULLET_SPRITES[spriteName]) {
    const srcImg = WEAPON_BULLET_SPRITES[spriteName];
    const canv = document.createElement('canvas');
    canv.width = size; canv.height = size;
    const cx = canv.getContext('2d');
    const draw = () => {
      if (!srcImg.complete || !srcImg.naturalWidth) return;
      const nw = srcImg.naturalWidth, nh = srcImg.naturalHeight;
      const scale = Math.min(size / nw, size / nh) * 0.92;
      const w = nw * scale, h = nh * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.imageSmoothingEnabled = true;
      cx.drawImage(srcImg, 0, 0, nw, nh, (size - w) / 2, dy, w, h);
    };
    if (srcImg.complete && srcImg.naturalWidth > 0) draw();
    else srcImg.addEventListener('load', draw, { once: true });
    return canv;
  }
  if (typeof spriteName === 'string' && EXT_BOSSES[spriteName]) {
    const srcImg = EXT_BOSSES[spriteName];
    const canv = document.createElement('canvas');
    canv.width = size; canv.height = size;
    const cx = canv.getContext('2d');
    const draw = () => {
      if (!srcImg.complete || !srcImg.naturalWidth) return;
      const nw = srcImg.naturalWidth, nh = srcImg.naturalHeight;
      const scale = Math.min(size / nw, size / nh) * 0.94;
      const w = nw * scale, h = nh * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.imageSmoothingEnabled = true;
      cx.drawImage(srcImg, 0, 0, nw, nh, (size - w) / 2, dy, w, h);
    };
    if (srcImg.complete && srcImg.naturalWidth > 0) draw();
    else srcImg.addEventListener('load', draw, { once: true });
    return canv;
  }
  if (typeof spriteName === 'string' && MATERIAL_DROPS_SPRITES[spriteName]) {
    const reg = MATERIAL_DROPS_SPRITES[spriteName];
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const cx = c.getContext('2d');
    const drawIcon = () => {
      if (!inventoryDropsSheetImg?.complete || !inventoryDropsSheetImg.naturalWidth) return;
      const scale = Math.min(size / reg.sw, size / reg.sh) * 0.92;
      const w = reg.sw * scale, h = reg.sh * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.imageSmoothingEnabled = true;
      cx.drawImage(inventoryDropsSheetImg, reg.sx, reg.sy, reg.sw, reg.sh, (size - w) / 2, dy, w, h);
    };
    if (inventoryDropsSheetImg?.complete && inventoryDropsSheetImg.naturalWidth > 0) drawIcon();
    else inventoryDropsSheetImg?.addEventListener('load', drawIcon, { once: true });
    return c;
  }
    const customTrinketRelic = (typeof spriteName === 'string' && (TRINKET_RELIC_ICONS[spriteName] || (typeof window !== 'undefined' && window.TRINKET_RELIC_ICONS?.[spriteName])));
  if (customTrinketRelic) {
    const dpr = Math.max(2, window.devicePixelRatio || 2);
    const canv = document.createElement('canvas');
    canv.width = Math.round(size * dpr); canv.height = Math.round(size * dpr);
    canv.style.width = `${size}px`; canv.style.height = `${size}px`;
    const cx = canv.getContext('2d');
    cx.scale(dpr, dpr);
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    const drawTrinketRelic = () => {
      if (!customTrinketRelic.complete || !customTrinketRelic.naturalWidth) return;
      const nw = customTrinketRelic.naturalWidth, nh = customTrinketRelic.naturalHeight;
      const scale = Math.min(size / nw, size / nh) * 0.94;
      const w = nw * scale, h = nh * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.drawImage(customTrinketRelic, 0, 0, nw, nh, (size - w) / 2, dy, w, h);
    };
    if (customTrinketRelic.complete && customTrinketRelic.naturalWidth > 0) drawTrinketRelic();
    else customTrinketRelic.addEventListener('load', drawTrinketRelic, { once: true });
    return canv;
  }

  if (typeof spriteName === 'string' && SPECIAL_ITEMS_SPRITES[spriteName]) {
    const reg = SPECIAL_ITEMS_SPRITES[spriteName];
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const cx = c.getContext('2d');
    const drawIcon = () => {
      if (!specialItemsSheetImg?.complete || !specialItemsSheetImg.naturalWidth) return;
      const scale = Math.min(size / reg.sw, size / reg.sh) * 0.92;
      const w = reg.sw * scale, h = reg.sh * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.imageSmoothingEnabled = false;
      cx.drawImage(specialItemsSheetImg, reg.sx, reg.sy, reg.sw, reg.sh, (size - w) / 2, dy, w, h);
    };
    if (specialItemsSheetImg?.complete && specialItemsSheetImg.naturalWidth > 0) drawIcon();
    else specialItemsSheetImg?.addEventListener('load', drawIcon, { once: true });
    return c;
  }
  if (typeof spriteName === 'string' && SPECIAL_ITEMS_MAP[spriteName]) {
    const img = document.createElement('img');
    img.src = SPECIAL_ITEMS_MAP[spriteName];
    img.width = size; img.height = size;
    img.style.objectFit = 'contain'; img.style.imageRendering = 'pixelated';
    if (alignBottom) img.style.objectPosition = 'center bottom';
    return img;
  }
  if (typeof spriteName === 'string' && (MONSTER_ANIMATIONS[spriteName] || window.MONSTER_ANIMATIONS?.[spriteName])) {
    const anim = MONSTER_ANIMATIONS[spriteName] || window.MONSTER_ANIMATIONS?.[spriteName];

    // If the animation has a folder with native animated preview.webp, return an <img> element.
    // Native WebP animations play automatically in all modern browsers with 0% JS overhead!
    const folderMatch = anim.src ? anim.src.match(/(assets\/monsters_new\/[^/]+)/) : null;
    const webpSrc = folderMatch ? `${folderMatch[1]}/preview.webp?v260` : null;

    if (webpSrc) {
      const img = document.createElement('img');
      img.src = webpSrc;
      img.width = size;
      img.height = size;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      img.style.objectFit = 'contain';
      img.style.imageRendering = 'pixelated';
      if (alignBottom) img.style.objectPosition = 'center bottom';
      return img;
    }

    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    c.style.width = `${size}px`;
    c.style.height = `${size}px`;
    c.style.imageRendering = 'pixelated';
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;

    const fw = anim.frameW || 128, fh = anim.frameH || 128;
    const stepX = anim.stepX !== undefined ? anim.stepX : fw;
    const subX = anim.subX !== undefined ? anim.subX : 0;
    const subY = anim.subY !== undefined ? anim.subY : 0;
    const sw = anim.sw !== undefined ? anim.sw : fw;
    const sh = anim.sh !== undefined ? anim.sh : fh;
    const frameCount = anim.frameCount || 8;
    const fps = anim.fps || 8;

    const scale = Math.min(size / sw, size / sh) * 0.96;
    const w = sw * scale, h = sh * scale;
    const dy = alignBottom ? (size - h) : (size - h) / 2;
    const dx = (size - w) / 2;

    const drawFrame = (frameIndex) => {
      if (!anim.img?.complete || !anim.img.naturalWidth) return;
      const sx = (anim.stepX !== undefined) ? (frameIndex * stepX + subX) : (frameIndex * fw);
      const sy = (anim.subY !== undefined) ? subY : 0;
      cx.clearRect(0, 0, size, size);
      cx.imageSmoothingEnabled = false;
      cx.drawImage(anim.img, sx, sy, sw, sh, dx, dy, w, h);
    };

    drawFrame(0);
    if (!anim.img?.complete || anim.img.naturalWidth === 0) {
      anim.img?.addEventListener('load', () => drawFrame(0), { once: true });
    }

    if (frameCount > 1) {
      registerAnimatedUiCanvas(c, drawFrame, fps, frameCount);
    }
    return c;
  }
  if (typeof spriteName === 'string' && window.NEW_MONSTER_SHEET?.regions?.[spriteName]) {
    const mr = window.NEW_MONSTER_SHEET.regions[spriteName];
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const cx = c.getContext('2d');
    const drawIcon = () => {
      if (!window.NEW_MONSTER_IMG?.complete || !window.NEW_MONSTER_IMG.naturalWidth) return;
      const scale = Math.min(size / mr.w, size / mr.h) * 0.96;
      const w = mr.w * scale, h = mr.h * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.drawImage(window.NEW_MONSTER_IMG, mr.x, mr.y, mr.w, mr.h, (size - w) / 2, dy, w, h);
    };
    if (window.NEW_MONSTER_IMG?.complete && window.NEW_MONSTER_IMG.naturalWidth > 0) drawIcon();
    else window.NEW_MONSTER_IMG?.addEventListener('load', drawIcon, { once: true });
    return c;
  }
  if (spriteName === 'dream_coin') {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const cx = c.getContext('2d');
    const drawCoin = () => {
      if (!dreamCoinImg.complete || !dreamCoinImg.naturalWidth) return;
      cx.clearRect(0, 0, size, size);
      cx.drawImage(dreamCoinImg, 0, 0, dreamCoinImg.naturalWidth, dreamCoinImg.naturalHeight, 0, 0, size, size);
    };
    if (dreamCoinImg.complete && dreamCoinImg.naturalWidth > 0) drawCoin();
    else dreamCoinImg.addEventListener('load', drawCoin, { once: true });
    return c;
  }
  if (typeof spriteName === 'string' && window.DREAM_BIOME_SHEET?.regions?.[spriteName]) {
    const mr = window.DREAM_BIOME_SHEET.regions[spriteName];
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const cx = c.getContext('2d');
    const drawIcon = () => {
      if (!window.DREAM_BIOME_IMG?.complete || !window.DREAM_BIOME_IMG.naturalWidth) return;
      const scale = Math.min(size / mr.w, size / mr.h) * 0.96;
      const w = mr.w * scale, h = mr.h * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.drawImage(window.DREAM_BIOME_IMG, mr.x, mr.y, mr.w, mr.h, (size - w) / 2, dy, w, h);
    };
    if (window.DREAM_BIOME_IMG?.complete && window.DREAM_BIOME_IMG.naturalWidth > 0) drawIcon();
    else window.DREAM_BIOME_IMG?.addEventListener('load', drawIcon, { once: true });
    return c;
  }
  if (typeof spriteName === 'string' && spriteName.startsWith('ext_item_')) {
    const id = parseInt(spriteName.split('_')[2], 10);
    const img = document.createElement('img');
    img.src = (window.EXT_ITEMS && window.EXT_ITEMS[id] && window.EXT_ITEMS[id].src)
      ? window.EXT_ITEMS[id].src
      : 'assets/items/Seperate/tile'+String(id).padStart(3,'0')+'.webp';
    img.width = size; img.height = size;
    img.style.objectFit = 'contain'; img.style.imageRendering = 'pixelated';
    if (alignBottom) img.style.objectPosition = 'center bottom';
    return img;
  }
  if (typeof spriteName === 'string' && (spriteName === 'plains_boss' || (window.EXT_BOSSES && window.EXT_BOSSES[spriteName]))) {
    const img = document.createElement('img');
    img.src = 'assets/bosses/plains_boss.webp';
    img.width = size; img.height = size;
    img.style.objectFit = 'contain'; img.style.imageRendering = 'pixelated';
    return img;
  }
  const resolvedTreeName = (typeof spriteName === 'string' && window.TREE_ALIASES && window.TREE_ALIASES[spriteName]) ? window.TREE_ALIASES[spriteName] : spriteName;
  if (typeof resolvedTreeName === 'string' && window.TREE_DIMS && window.TREE_DIMS[resolvedTreeName]?.path) {
    const img = document.createElement('img');
    img.src = window.TREE_DIMS[resolvedTreeName].path;
    img.width = size; img.height = size;
    img.style.objectFit = 'contain'; img.style.imageRendering = 'pixelated';
    if (alignBottom) img.style.objectPosition = 'center bottom';
    return img;
  }
  if (typeof spriteName === 'string' && window.ABYSS_DECOR_DIMS?.[spriteName]) {
    const d = window.ABYSS_DECOR_DIMS[spriteName];
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const cx = c.getContext('2d');
    const drawIcon = () => {
      if (!d.img?.complete || !d.img.naturalWidth) return;
      const scale = Math.min(size / d.sw, size / d.sh) * 0.95;
      const w = d.sw * scale, h = d.sh * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.drawImage(d.img, d.sx, d.sy, d.sw, d.sh, (size - w) / 2, dy, w, h);
    };
    if (d.img?.complete && d.img.naturalWidth > 0) drawIcon();
    else d.img?.addEventListener('load', drawIcon, { once: true });
    return c;
  }
  if (typeof spriteName === 'string' && window.ABYSS_SHEET_ENEMIES?.regions?.[spriteName]) {
    const ar = window.ABYSS_SHEET_ENEMIES.regions[spriteName];
    const sImg = window.ABYSS_SHEET_ENEMIES.img;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const cx = c.getContext('2d');
    const drawIcon = () => {
      if (!sImg?.complete || !sImg.naturalWidth) return;
      const scale = Math.min(size / ar.sw, size / ar.sh) * 0.95;
      const w = ar.sw * scale, h = ar.sh * scale;
      cx.clearRect(0, 0, size, size);
      const dy = alignBottom ? (size - h) : (size - h) / 2;
      cx.drawImage(sImg, ar.sx, ar.sy, ar.sw, ar.sh, (size - w) / 2, dy, w, h);
    };
    if (sImg?.complete && sImg.naturalWidth > 0) drawIcon();
    else sImg?.addEventListener('load', drawIcon, { once: true });
    return c;
  }
  if (typeof spriteName === 'string' && (spriteName === 'white_shark' || spriteName === 'abyss_whale_1' || spriteName === 'abyss_whale_2' || spriteName === 'abyss_whale')) {
    const ext = window.EXT_ABYSS_MOBS?.[spriteName];
    const img = document.createElement('img');
    img.src = ext?.src || (spriteName === 'white_shark' ? 'assets/Abyss Biom/enemies/white_shark.webp' : ('assets/Abyss Biom/decorations/' + (spriteName === 'abyss_whale_1' ? 'abyss_whale_1.webp' : 'abyss_whale.webp')));
    img.width = size; img.height = size;
    img.style.objectFit = 'contain'; img.style.imageRendering = 'pixelated';
    return img;
  }
  if (typeof spriteName === 'string' && window.EXT_ABYSS_MOBS && window.EXT_ABYSS_MOBS[spriteName]) {
    const img = document.createElement('img');
    img.src = window.EXT_ABYSS_MOBS[spriteName]?.src || ('assets/Abyss Biom/enemies/' + spriteName + '.webp');
    img.width = size; img.height = size;
    img.style.objectFit = 'contain'; img.style.imageRendering = 'pixelated';
    return img;
  }
  if (typeof resolvedTreeName === 'string' && window.EXT_TREES && (window.EXT_TREES[resolvedTreeName] || (window.TREE_DIMS && window.TREE_DIMS[resolvedTreeName]))) {
    const atlasReg = window.EXT_TREES_ATLAS?.regions?.[resolvedTreeName];
    if (atlasReg && window.EXT_TREES_ATLAS?.canvas && (window.EXT_TREES_ATLAS.canvas instanceof HTMLCanvasElement || (window.EXT_TREES_ATLAS.canvas.complete && window.EXT_TREES_ATLAS.canvas.naturalWidth > 0))) {
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const cx = c.getContext('2d');
      cx.imageSmoothingEnabled = false;
      const scale = Math.min(size / atlasReg.sw, size / atlasReg.sh) * 0.9;
      const w = atlasReg.sw * scale, h = atlasReg.sh * scale;
      cx.drawImage(window.EXT_TREES_ATLAS.canvas, atlasReg.sx, atlasReg.sy, atlasReg.sw, atlasReg.sh, (size - w) / 2, (size - h) / 2, w, h);
      return c;
    }
    const extImg = window.EXT_TREES[resolvedTreeName];
    const img = document.createElement('img');
    img.src = extImg?.src || window.TREE_DIMS?.[resolvedTreeName]?.path || ('assets/Trees/PNG/Assets_separately/Trees/' + resolvedTreeName + '.webp');
    img.width = size; img.height = size;
    img.style.objectFit = 'contain'; img.style.imageRendering = 'pixelated';
    return img;
  }
  if (spriteName === 'xp_gem_elite' || spriteName === 'xp_gem_legendary' || spriteName === 'xp_gem_mythic') {
    const img = document.createElement('img');
    img.src = `assets/${spriteName}.webp`;
    img.width = size; img.height = size;
    img.style.objectFit = 'contain';
    return img;
  }
  const r=ATLAS.regions[spriteName];
  if(!r)return document.createElement('canvas');
  const c=document.createElement('canvas');
  c.width=size;c.height=size;
  const cx=c.getContext('2d');
  cx.imageSmoothingEnabled=false;
  const scale=Math.min(size/r.w,size/r.h)*.85;
  const w=r.w*scale,h=r.h*scale;
  const dy=alignBottom?(size-h):(size-h)/2;
  cx.drawImage(ATLAS.canvas,r.x,r.y,r.w,r.h,(size-w)/2,dy,w,h);
  return c;
}
function renderAtlasIcons(root=document){
  const elements=[...(root.matches?.('[data-sprite]')?[root]:[]),...root.querySelectorAll('[data-sprite]')];
  elements.forEach(element=>{
    const spriteName=element.dataset.sprite;
    const isSpecial = spriteName === 'plains_boss' ||
      spriteName === 'frost_beam' ||
      spriteName === 'frost_staff' ||
      spriteName === 'Frost_staff' ||
      spriteName === 'prism_staff' ||
      spriteName === 'rainbow_staff' ||
      spriteName === 'Rainbow_staff' ||
      Boolean(TRINKET_RELIC_ICONS?.[spriteName]) ||
      Boolean(SPECIAL_ITEMS_MAP[spriteName]) ||
      Boolean(SPECIAL_ITEMS_SPRITES?.[spriteName]) ||
      Boolean(MATERIAL_DROPS_SPRITES?.[spriteName]) ||
      Boolean(WEATHER_ICONS?.[spriteName]) ||
      Boolean(BIOME_ICONS?.[spriteName]) ||
      Boolean(FIELD_CONDITION_ICONS?.[spriteName]) ||
      Boolean(UPGRADE_ICONS?.[spriteName]) ||
      Boolean(MONSTER_ANIMATIONS?.[spriteName]) ||
      Boolean(window.NEW_MONSTER_SHEET?.regions?.[spriteName]) ||
      Boolean(window.DREAM_BIOME_SHEET?.regions?.[spriteName]) ||
      Boolean(window.EXT_BOSSES && window.EXT_BOSSES[spriteName]) ||
      Boolean(window.EXT_ABYSS_MOBS && window.EXT_ABYSS_MOBS[spriteName]) ||
      Boolean(window.TREE_DIMS && window.TREE_DIMS[spriteName]?.path) ||
      Boolean(window.EXT_TREES && (window.EXT_TREES[spriteName] || (window.TREE_ALIASES && window.TREE_ALIASES[spriteName])));
    if(!spriteName || (!ATLAS.regions[spriteName] && !spriteName.startsWith('ext_item_') && !isSpecial))return;
    const isMarker = element.classList.contains('camp-overlay-marker');
    if (isMarker) {
      if (element.dataset.atlasRendered === spriteName) return;
      const size = Number(element.dataset.iconSize) || 36;
      const icon = iconCanvas(spriteName, size, true);
      icon.className = 'atlas-icon';
      icon.setAttribute('aria-hidden', 'true');

      const existingIcon = element.querySelector('.atlas-icon');
      const existingBubble = element.querySelector('.npc-speech-bubble');
      if (existingIcon) {
        element.replaceChild(icon, existingIcon);
      } else if (existingBubble) {
        element.insertBefore(icon, existingBubble);
      } else {
        element.appendChild(icon);
      }
      Array.from(element.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
      element.dataset.atlasRendered = spriteName;
      return;
    }
    const label = element.dataset.label ?? (element.children.length === 0 ? element.textContent.trim() : '');
    const renderedKey = `${spriteName}:${label}`;
    if(element.dataset.atlasRendered === renderedKey) return;
    const size = Number(element.dataset.iconSize) || 36;
    const icon = iconCanvas(spriteName, size, false);
    icon.className = 'atlas-icon';
    icon.setAttribute('aria-hidden', 'true');
    element.replaceChildren(icon);
    if(label) element.append(document.createTextNode(` ${label}`));
    element.dataset.atlasRendered = renderedKey;
  });
}

export { drawSprite, drawUiIcon, createUiIconElement, createUpgradeIconElement, iconCanvas, renderAtlasIcons, showDropToast, showMilestoneToast, showRelicToast };
