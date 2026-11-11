import { state, relicJournal, carriedRelic } from './state.mjs?v336';
import { campSave } from './save.mjs?v336';
import { getWorldSeed, biomeBoundaryDist, BIOMES, BIOME_TEXTURE, getWaterColor, hashRand, lerp, biomeAt, blendedTileColor, waterLevelAt, waterValueAt } from './world.mjs?v336';
import { relicForRoll } from './quests.mjs?v336';
import { DREAM_RELICS } from './config.mjs?v336';
import { ATLAS, CHICKEN_ASSETS, dungeon1MapImg, undergroundObjectsImg, undergroundTrapsImg } from './assets.mjs?v336';
import { TILE, CHUNK_SIZE, CHUNK_PX, getCaveTile, getUndergroundWallTile, drawUndergroundFloor, drawUndergroundRubble, drawAutotiledWall } from './underground.mjs?v336';
import { isMountainBlocked, isInsideAnyMountain, isNearMountainEntrancePass, isNearMountainCenterpiece } from './mountains.mjs?v336';
import { ctx, VW, VH, camera, player, floodBoost, createNpcInstance, DAY_LENGTH, worldTime, isBloodMoon, weather } from './game-core.mjs?v336';

function makeLiquidFrames(deep, bgHex, bgShallow, waveColorD, waveColorS, reflColor){
  const frames=[];
  for(let f=0;f<3;f++){
    const c=document.createElement('canvas');c.width=TILE;c.height=TILE;
    const cx=c.getContext('2d');
    cx.imageSmoothingEnabled=false;
    const shift=(f*4)%12;
    // Crisp 2px pixel-art animated horizontal wave crests (inset so shoreline banks stay crisp)
    cx.fillStyle=deep?waveColorD:waveColorS;
    cx.fillRect(8+shift, 12, 10, 2);
    cx.fillRect(22-Math.floor(shift*0.5), 22, 12, 2);
    cx.fillRect(10+Math.floor(shift*0.5), 30, 8, 2);
    // Bright pixel-art water glints
    cx.fillStyle=reflColor;
    cx.fillRect(10+shift, 12, 4, 2);
    cx.fillRect(26-Math.floor(shift*0.5), 22, 4, 2);
    if(deep){
      cx.fillRect(14+((f*6)%14), 18, 2, 2);
      cx.fillRect(24-((f*4)%10), 28, 2, 2);
    }
    frames.push(c);
  }
  return frames;
}

const LIQUIDS = {
  default: {
    d: makeLiquidFrames(true, '#1b4f82', 'rgba(40,110,170,0.15)', 'rgba(98,178,242,0.42)', 'rgba(130,202,252,0.38)', 'rgba(220,245,255,0.55)'),
    s: makeLiquidFrames(false, '#25669e', 'rgba(50,128,188,0.12)', 'rgba(110,190,248,0.36)', 'rgba(145,212,255,0.42)', 'rgba(228,248,255,0.50)')
  },
  volcano: {
    d: makeLiquidFrames(true, '#d83b15', 'rgba(190,60,20,0.2)', 'rgba(240,110,30,0.55)', 'rgba(250,130,40,0.5)', 'rgba(255,210,90,0.65)'),
    s: makeLiquidFrames(false, '#d83b15', 'rgba(190,60,20,0.2)', 'rgba(240,110,30,0.55)', 'rgba(250,130,40,0.5)', 'rgba(255,210,90,0.65)')
  },
  desert: {
    d: makeLiquidFrames(true, '#c8a050', 'rgba(180,140,70,0.2)', 'rgba(220,180,95,0.45)', 'rgba(235,195,105,0.4)', 'rgba(250,220,140,0.4)'),
    s: makeLiquidFrames(false, '#c8a050', 'rgba(180,140,70,0.2)', 'rgba(220,180,95,0.45)', 'rgba(235,195,105,0.4)', 'rgba(250,220,140,0.4)')
  },
  swamp: {
    d: makeLiquidFrames(true, '#3a5436', 'rgba(60,80,45,0.2)', 'rgba(90,125,75,0.42)', 'rgba(105,140,85,0.38)', 'rgba(150,190,120,0.35)'),
    s: makeLiquidFrames(false, '#3a5436', 'rgba(60,80,45,0.2)', 'rgba(90,125,75,0.42)', 'rgba(105,140,85,0.38)', 'rgba(150,190,120,0.35)')
  },
  deadlands: {
    d: makeLiquidFrames(true, '#462652', 'rgba(70,35,80,0.2)', 'rgba(110,60,130,0.45)', 'rgba(125,75,145,0.4)', 'rgba(165,110,190,0.38)'),
    s: makeLiquidFrames(false, '#462652', 'rgba(70,35,80,0.2)', 'rgba(110,60,130,0.45)', 'rgba(125,75,145,0.4)', 'rgba(165,110,190,0.38)')
  }
};

const chunks=new Map();
const chunkKey=(cx,cy)=>cx+','+cy;

const CHICKEN_DIM_PROPS = {
  decorChance: 0,
  treeChance: 0,
  treeSprites: [],
  treeScale: [1.0, 1.0],
  decorSprites: []
};

const RARE_RELIC_NAMES = new Set(['Moonlit Astrolabe', 'Frostglass Eye', 'Sunken Signet', 'Stormheart Relic', 'Mirror Shard']);
function hasRareRelicInInventory() {
  const activeCarried = carriedRelic || state.carriedRelic;
  if (activeCarried && activeCarried.id !== 'relic_golden_egg') {
    return true;
  }
  if (Array.isArray(relicJournal) && relicJournal.some(r => r && r.id !== 'relic_golden_egg')) {
    return true;
  }
  return false;
}

function surfaceWaterLevelAt(wx, wy){
  if(wx > 100000 && wx < 300000) return 0;
  if(wx > 550000 && wx < 650000 && wy > 550000 && wy < 650000) return 0;
  if(wx > 910000 && wx < 990000 && wy > 910000 && wy < 990000) return 0;
  const bn = biomeAt(wx, wy);
  if(bn === 'snow' || bn === 'dwarfCity' || bn === 'dream') return 0;
  return waterLevelAt(wx, wy, floodBoost);
}

function clampByte(v){
  return v < 0 ? 0 : v > 255 ? Math.round(v) : Math.round(v);
}

function drawRichLandTile(ccx, bn, landColor, sx, sy, wx, wy){
  if (bn === 'dream') {
    ccx.fillStyle = 'rgb(45, 25, 65)';
    ccx.fillRect(sx, sy, TILE, TILE);
    return;
  }
  if (wx > 910000 && wx < 990000 && wy > 910000 && wy < 990000) {
    const tRoll = hashRand(wx, wy, 701);
    const gImg = tRoll < 0.5 ? CHICKEN_ASSETS?.tiles?.grass1 : CHICKEN_ASSETS?.tiles?.grass3;
    if (gImg && gImg.complete && gImg.naturalWidth > 0) {
      ccx.drawImage(gImg, 0, 0, gImg.naturalWidth, gImg.naturalHeight, sx, sy, TILE, TILE);
      return;
    }
  }
  // Seamless sub-tile organic pixel-art patches (gentle, low-contrast shading)
  const isFungalOrDead = (bn === 'fungalWastes' || bn === 'deadlands');
  const nearPlains = isFungalOrDead && (landColor[1] > landColor[0] - 8);

  for(let gy = 0; gy < 4; gy++){
    for(let gx = 0; gx < 4; gx++){
      const sampleX = (wx + gx * 0.25) * 1.15 + 113.7;
      const sampleY = (wy + gy * 0.25) * 1.15 - 79.3;
      const macro = waterValueAt(sampleX, sampleY, 0);
      const micro = (hashRand(wx * 4 + gx, wy * 4 + gy, 301) - 0.5) * 0.22;
      const val = macro + micro;

      let r = landColor[0], g = landColor[1], b = landColor[2];
      if(bn === 'plains'){
        if(val > 0.36){
          r += 14; g += 16; b -= 1;
        } else if(val < -0.34){
          r -= 12; g -= 16; b -= 6;
        }
      } else if(bn === 'forest' || bn === 'magicForest'){
        if(val > 0.34){
          r += 10; g += 14; b += (bn === 'magicForest' ? 6 : -1);
        } else if(val < -0.32){
          r -= 10; g -= 13; b -= 5;
        }
      } else if(isFungalOrDead){
        if((bn === 'fungalWastes' && val > 0.46) || (nearPlains && val > 0.12)){
          r = lerp(r, 74, 0.45);
          g = lerp(g, 122, 0.45);
          b = lerp(b, 52, 0.45);
        } else if(val > 0.28){
          r += 9; g += 8; b += 9;
        } else if(val < -0.30){
          r -= 10; g -= 9; b -= 9;
        }
      } else if(bn === 'snow'){
        if(val > 0.34){
          r += 10; g += 10; b += 8;
        } else if(val < -0.34){
          r -= 13; g -= 8; b -= 1;
        }
      } else if(bn === 'desert'){
        if(val > 0.34){
          r += 12; g += 10; b += 5;
        } else if(val < -0.32){
          r -= 12; g -= 13; b -= 9;
        }
      } else if(bn === 'volcano'){
        if(val > 0.38){
          r += 14; g += 5; b -= 2;
        } else if(val < -0.30){
          r -= 14; g -= 10; b -= 6;
        }
      } else if(bn === 'badlands'){
        if(val > 0.34){
          r += 12; g += 8; b += 3;
        } else if(val < -0.30){
          r -= 12; g -= 8; b -= 5;
        }
      } else if(bn === 'swamp'){
        if(val > 0.32){
          r += 6; g += 12; b -= 2;
        } else if(val < -0.30){
          r -= 10; g -= 10; b -= 7;
        }
      } else if(bn === 'crystalWastes'){
        if(val > 0.34){
          r += 6; g += 14; b += 17;
        } else if(val < -0.30){
          r -= 7; g -= 9; b -= 8;
        }
      } else {
        const shift = Math.round(val * 10);
        r += shift; g += shift; b += shift;
      }

      ccx.fillStyle = `rgb(${clampByte(r)},${clampByte(g)},${clampByte(b)})`;
      ccx.fillRect(sx + gx * 10, sy + gy * 10, 10, 10);
    }
  }
}

function drawBiomeTexture(ccx,bn,sx,sy,wx,wy){
  if (wx > 910000 && wx < 990000 && wy > 910000 && wy < 990000) return;
  const mtnInf = (typeof window !== 'undefined' && window.getMountainInfluence) ? window.getMountainInfluence(wx * 40, wy * 40) : null;
  if (mtnInf && mtnInf.weight > 0 && mtnInf.weight < 1) {
    const roll = hashRand(wx, wy, 811);
    bn = roll < mtnInf.weight ? mtnInf.targetBiome : (window.getNativeBiomeAt ? window.getNativeBiomeAt(wx, wy) : bn);
  }
  if(bn==='dream'){
    ccx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    ccx.fillRect(sx + 6, sy + 6, 2, 2);
    ccx.fillRect(sx + 24, sy + 22, 2, 2);
    ccx.fillStyle = 'rgba(186, 104, 200, 0.35)';
    ccx.fillRect(sx + 18, sy + 10, 2, 2);
    ccx.fillRect(sx + 8, sy + 26, 2, 2);
    return;
  }
  if(bn==='plains'||bn==='forest'||bn==='magicForest'){
    const isPlains = bn==='plains';
    const isMagic = bn==='magicForest';
    // 1. Light, sparse turf specks (2 per tile)
    for(let i=0;i<2;i++){
      const cx0 = Math.floor(hashRand(wx+i*13,wy+i*7,100)*17)*2 + 2;
      const cy0 = Math.floor(hashRand(wx+i*31,wy+i*17,101)*17)*2 + 2;
      const isLight = hashRand(wx+i*5,wy+i*3,102) < 0.54;
      if(isLight){
        ccx.fillStyle = isPlains ? 'rgba(154,212,78,0.40)' : isMagic ? 'rgba(130,205,155,0.38)' : 'rgba(106,168,64,0.38)';
      } else {
        ccx.fillStyle = isPlains ? 'rgba(38,78,24,0.38)' : isMagic ? 'rgba(42,36,78,0.38)' : 'rgba(24,54,20,0.42)';
      }
      ccx.fillRect(sx+cx0, sy+cy0, 4, 2);
    }

    // 2. Subtle grass blade tuft (only 1 or 2 per tile)
    const tuftCount = 1 + (hashRand(wx,wy,104) > 0.55 ? 1 : 0);
    for(let i=0;i<tuftCount;i++){
      const gx = Math.floor(hashRand(wx+i*23,wy+i*19,105)*16)*2 + 4;
      const gy = Math.floor(hashRand(wx+i*29,wy+i*13,106)*15)*2 + 6;
      ccx.fillStyle = isPlains ? '#488630' : isMagic ? '#467a58' : '#356926';
      ccx.fillRect(sx+gx, sy+gy-2, 2, 4);
      ccx.fillRect(sx+gx+2, sy+gy-4, 2, 4);
      ccx.fillStyle = isPlains ? '#98cf52' : isMagic ? '#8ce0b0' : '#6eb346';
      ccx.fillRect(sx+gx+2, sy+gy-4, 2, 2);
    }

    // 3. Occasional tiny wildflower (~14% of tiles)
    const flowerRoll = hashRand(wx,wy,205);
    if(flowerRoll > 0.86){
      const fx = Math.floor(hashRand(wx,wy,206)*14)*2 + 6;
      const fy = Math.floor(hashRand(wx,wy,207)*14)*2 + 6;
      const fType = hashRand(wx,wy,208);
      if(isMagic && fType > 0.45){
        ccx.fillStyle = '#d580ff';
        ccx.fillRect(sx+fx, sy+fy-2, 2, 2);
        ccx.fillStyle = '#fff59d';
        ccx.fillRect(sx+fx, sy+fy, 2, 2);
      } else if(fType < 0.5){
        ccx.fillStyle = '#f5f7fa';
        ccx.fillRect(sx+fx-2, sy+fy, 2, 2);
        ccx.fillRect(sx+fx+2, sy+fy, 2, 2);
        ccx.fillStyle = '#ffd54f';
        ccx.fillRect(sx+fx, sy+fy, 2, 2);
      } else {
        ccx.fillStyle = '#ffb300';
        ccx.fillRect(sx+fx, sy+fy, 2, 2);
        ccx.fillStyle = '#fff176';
        ccx.fillRect(sx+fx, sy+fy-2, 2, 2);
      }
    }
    return;
  }

  if(bn==='fungalWastes'||bn==='deadlands'){
    for(let i=0;i<3;i++){
      const px = Math.floor(hashRand(wx+i*13,wy+i*7,100)*17)*2 + 2;
      const py = Math.floor(hashRand(wx+i*31,wy+i*17,101)*17)*2 + 2;
      const r = hashRand(wx+i*5,wy+i*3,102);
      if(r < 0.50){
        ccx.fillStyle = 'rgba(40,30,44,0.45)';
        ccx.fillRect(sx+px, sy+py, 4, 2);
      } else {
        ccx.fillStyle = 'rgba(118,98,120,0.38)';
        ccx.fillRect(sx+px, sy+py, 4, 2);
      }
    }
    const dRoll = hashRand(wx,wy,205);
    if(dRoll > 0.84){
      const px = Math.floor(hashRand(wx,wy,206)*14)*2 + 6;
      const py = Math.floor(hashRand(wx,wy,207)*14)*2 + 8;
      ccx.fillStyle = '#5c5063';
      ccx.fillRect(sx+px, sy+py-2, 4, 2);
      ccx.fillStyle = '#807287';
      ccx.fillRect(sx+px+2, sy+py-2, 2, 2);
    }
    return;
  }

  const t=BIOME_TEXTURE[bn];if(!t)return;
  for(let i=0;i<t.count;i++){
    const px=Math.floor(hashRand(wx+i*13,wy+i*7,100)*(TILE/2))*2;
    const py=Math.floor(hashRand(wx+i*31,wy+i*17,101)*(TILE/2))*2;
    const r=hashRand(wx+i*5,wy+i*3,102);
    ccx.fillStyle=r<0.55?t.light:t.dark;
    ccx.fillRect(sx+px,sy+py,t.size,t.size);
  }
  const detail=hashRand(wx,wy,205);
  if(detail>.78){
    const px=4+Math.floor(hashRand(wx,wy,206)*16)*2;
    const py=6+Math.floor(hashRand(wx,wy,207)*14)*2;
    if(bn==='desert'){
      ccx.fillStyle='rgba(130,105,67,.45)';
      ccx.fillRect(sx+px,sy+py,4,2);
      ccx.fillStyle='rgba(245,221,158,.55)';
      ccx.fillRect(sx+px+2,sy+py,2,2);
    }else if(bn==='snow'){
      ccx.fillStyle='rgba(255,255,255,.8)';
      ccx.fillRect(sx+px,sy+py,2,2);
      ccx.fillRect(sx+px+2,sy+py-2,2,4);
    }else if(bn==='volcano'){
      ccx.fillStyle='rgba(255,121,45,.58)';
      ccx.fillRect(sx+px,sy+py,4,2);
      ccx.fillStyle='rgba(45,35,37,.75)';
      ccx.fillRect(sx+px+4,sy+py+2,2,2);
    }else if(bn==='badlands'){
      ccx.fillStyle='rgba(35,30,25,.5)';
      ccx.fillRect(sx+px,sy+py,4,2);
      ccx.fillRect(sx+px+2,sy+py+2,2,2);
      if(hashRand(wx,wy,208)>.5){
        ccx.fillStyle='rgba(45,40,35,.45)';
        ccx.fillRect(sx+px+6,sy+py-2,2,2);
      }
    }else if(bn==='swamp'){
      ccx.fillStyle='rgba(45,35,25,.5)';
      ccx.fillRect(sx+px,sy+py,4,2);
      ccx.fillRect(sx+px+2,sy+py+2,2,2);
    }else if(bn==='crystalWastes'){
      ccx.fillStyle='rgba(180,200,220,.4)';
      ccx.fillRect(sx+px,sy+py,2,2);
      ccx.fillRect(sx+px+2,sy+py+2,2,2);
    }else{
      ccx.fillStyle='rgba(20,45,28,.6)';
      ccx.fillRect(sx+px,sy+py,2,4);
      ccx.fillRect(sx+px+2,sy+py+2,2,4);
    }
  }
}

function drawRichWaterTile(ccx, bn, landColor, wl, sx, sy, wx, wy){
  const nLand = surfaceWaterLevelAt(wx, wy - 1) === 0;
  const sLand = surfaceWaterLevelAt(wx, wy + 1) === 0;
  const wLand = surfaceWaterLevelAt(wx - 1, wy) === 0;
  const eLand = surfaceWaterLevelAt(wx + 1, wy) === 0;
  const nwLand = surfaceWaterLevelAt(wx - 1, wy - 1) === 0;
  const neLand = surfaceWaterLevelAt(wx + 1, wy - 1) === 0;
  const swLand = surfaceWaterLevelAt(wx - 1, wy + 1) === 0;
  const seLand = surfaceWaterLevelAt(wx + 1, wy + 1) === 0;
  const nearShore = nLand || sLand || wLand || eLand || nwLand || neLand || swLand || seLand;

  const isSpecialLiquid = (bn === 'volcano' || bn === 'desert' || bn === 'swamp' || bn === 'deadlands');
  const wColor = getWaterColor(bn);

  // 1. Base Water Fill & Sub-Tile Pixel-Art Depth Shading
  for(let gy = 0; gy < 4; gy++){
    for(let gx = 0; gx < 4; gx++){
      const wSample = waterValueAt(wx + gx * 0.25, wy + gy * 0.25, floodBoost);
      let depthT = (wSample - 0.42) / (0.76 - 0.42);
      depthT = Math.max(0, Math.min(1, depthT));

      let r, g, b;
      if(!isSpecialLiquid){
        // Mockup cerulean-sapphire water palette:
        // Shallows: vibrant teal-blue [46, 126, 184], Mid: rich cerulean [34, 98, 158], Deep: sapphire-navy [24, 74, 128]
        if(depthT < 0.45){
          const f = depthT / 0.45;
          r = lerp(46, 34, f);
          g = lerp(126, 98, f);
          b = lerp(184, 158, f);
        } else {
          const f = (depthT - 0.45) / 0.55;
          r = lerp(34, 24, f);
          g = lerp(98, 74, f);
          b = lerp(158, 128, f);
        }
        // Subtle horizontal wave trough banding
        if((gy + Math.floor(hashRand(wx + gx, wy, 400) * 2)) % 2 === 0){
          r -= 4; g -= 6; b -= 5;
        }
      } else {
        const mix = wl === 2 ? Math.min(1, depthT * 0.9 + 0.25) : depthT * 0.72 + 0.18;
        r = lerp(landColor[0], wColor[0], mix);
        g = lerp(landColor[1], wColor[1], mix);
        b = lerp(landColor[2], wColor[2], mix);
      }
      ccx.fillStyle = `rgb(${clampByte(r)},${clampByte(g)},${clampByte(b)})`;
      ccx.fillRect(sx + gx * 10, sy + gy * 10, 10, 10);
    }
  }

  // 2. Crisp Baked Horizontal Pixel-Art Wave & Shimmer Lines (matching mockup water texture)
  const waveMid = bn === 'volcano' ? '#ff8a3d' : bn === 'desert' ? '#e6c278' : bn === 'swamp' ? '#688c5e' : bn === 'deadlands' ? '#86529c' : '#58aee8';
  const waveBright = bn === 'volcano' ? '#ffe082' : bn === 'desert' ? '#fff3cf' : bn === 'swamp' ? '#9cc28c' : bn === 'deadlands' ? '#b882d1' : '#a8dfff';
  const waveCount = 3 + Math.floor(hashRand(wx, wy, 402) * 2);
  for(let i = 0; i < waveCount; i++){
    const wyOff = (nLand ? 12 : 4) + i * 8 + Math.floor(hashRand(wx + i * 7, wy + i * 13, 403) * 3) * 2;
    if(wyOff >= TILE - (sLand ? 8 : 4)) continue;
    const wxOff = (wLand ? 8 : 2) + Math.floor(hashRand(wx + i * 17, wy + i * 5, 404) * 8) * 2;
    const wLen = Math.min(TILE - wxOff - (eLand ? 8 : 2), 10 + Math.floor(hashRand(wx + i * 23, wy + i * 11, 405) * 6) * 2);
    if(wLen >= 6){
      ccx.fillStyle = waveMid;
      ccx.fillRect(sx + wxOff, sy + wyOff, wLen, 2);
      if(wLen >= 10){
        ccx.fillStyle = waveBright;
        ccx.fillRect(sx + wxOff + 2, sy + wyOff, Math.max(4, wLen - 6), 2);
      }
      // Trailing 2x2 pixel-art ripple dot
      if(wxOff + wLen + 4 < TILE - (eLand ? 6 : 2)){
        ccx.fillStyle = waveMid;
        ccx.fillRect(sx + wxOff + wLen + 2, sy + wyOff, 2, 2);
      }
    }
  }

  // 3. Stepped Cascade / Waterfall Foam when shallow water (wl=1) drops into deep water (wl=2)
  const nWl = surfaceWaterLevelAt(wx, wy - 1);
  if(!isSpecialLiquid && wl === 2 && nWl === 1 && hashRand(wx, wy, 406) > 0.35){
    for(let x = 4; x < TILE - 4; x += 4){
      const ch = 4 + Math.floor(hashRand(wx * 10 + x, wy, 407) * 3) * 2;
      ccx.fillStyle = 'rgba(130, 206, 255, 0.55)';
      ccx.fillRect(sx + x, sy, 2, ch + 2);
      ccx.fillStyle = 'rgba(228, 248, 255, 0.78)';
      ccx.fillRect(sx + x, sy, 2, Math.max(2, ch - 2));
    }
  }

  // 4. Autotiled 3D Earthy/Rocky Shoreline Banks & Overhanging Biome Turf
  const turfR = landColor[0], turfG = landColor[1], turfB = landColor[2];
  const turfMain = `rgb(${turfR},${turfG},${turfB})`;
  const turfHighlight = `rgb(${clampByte(turfR + 24)},${clampByte(turfG + 28)},${clampByte(turfB + 6)})`;
  const turfShadow = `rgb(${clampByte(turfR - 26)},${clampByte(turfG - 30)},${clampByte(turfB - 14)})`;
  const foamOuter = isSpecialLiquid ? waveMid : '#6ec2f2';
  const foamInner = isSpecialLiquid ? waveBright : '#dff5ff';

  // --- NORTH BANK (3D recessed earthen/rocky cliff ledge at top of water tile) ---
  if(nLand){
    for(let x = 0; x < TILE; x += 2){
      const bh = 8 + (hashRand(wx * 20 + x, wy, 410) > 0.55 ? 2 : 0);
      // Underwater drop shadow below the northern bank
      ccx.fillStyle = 'rgba(10, 24, 44, 0.45)';
      ccx.fillRect(sx + x, sy + bh, 2, 6);
      // Crisp waterline foam strip at base of cliff
      ccx.fillStyle = foamOuter;
      ccx.fillRect(sx + x, sy + bh - 2, 2, 2);
      if(((x / 2) + wx) % 2 === 0){
        ccx.fillStyle = foamInner;
        ccx.fillRect(sx + x, sy + bh - 2, 2, 2);
      }
      // Sculpted dark earth & stone bank face
      ccx.fillStyle = '#2d231e';
      ccx.fillRect(sx + x, sy + 2, 2, bh - 4);
      ccx.fillStyle = ((x / 2) % 3 === 0) ? '#59636e' : '#4a3a31';
      ccx.fillRect(sx + x, sy + 2, 2, Math.max(2, bh - 6));
      // Overhanging turf lip at very top
      ccx.fillStyle = turfShadow;
      ccx.fillRect(sx + x, sy, 2, 4);
      ccx.fillStyle = turfMain;
      ccx.fillRect(sx + x, sy, 2, 2);
      if(hashRand(wx * 20 + x, wy, 411) > 0.5){
        ccx.fillStyle = turfHighlight;
        ccx.fillRect(sx + x, sy + 2, 2, 2);
      }
    }
  }

  // --- WEST BANK (left shoreline edge) ---
  if(wLand){
    for(let y = 0; y < TILE; y += 2){
      const bw = 4 + (hashRand(wx, wy * 20 + y, 412) > 0.5 ? 2 : 0);
      ccx.fillStyle = 'rgba(10, 24, 44, 0.35)';
      ccx.fillRect(sx + bw, sy + y, 4, 2);
      ccx.fillStyle = (((y / 2) + wy) % 2 === 0) ? foamInner : foamOuter;
      ccx.fillRect(sx + bw, sy + y, 2, 2);
      ccx.fillStyle = '#3d3029';
      ccx.fillRect(sx + 2, sy + y, bw - 2, 2);
      ccx.fillStyle = turfMain;
      ccx.fillRect(sx, sy + y, 2, 2);
      if(hashRand(wx, wy * 20 + y, 413) > 0.55){
        ccx.fillStyle = turfShadow;
        ccx.fillRect(sx + 2, sy + y, 2, 2);
      }
    }
  }

  // --- EAST BANK (right shoreline edge) ---
  if(eLand){
    for(let y = 0; y < TILE; y += 2){
      const bw = 4 + (hashRand(wx, wy * 20 + y, 414) > 0.5 ? 2 : 0);
      ccx.fillStyle = 'rgba(10, 24, 44, 0.32)';
      ccx.fillRect(sx + TILE - bw - 4, sy + y, 4, 2);
      ccx.fillStyle = (((y / 2) + wy) % 2 === 0) ? foamInner : foamOuter;
      ccx.fillRect(sx + TILE - bw - 2, sy + y, 2, 2);
      ccx.fillStyle = '#3d3029';
      ccx.fillRect(sx + TILE - bw, sy + y, bw - 2, 2);
      ccx.fillStyle = turfMain;
      ccx.fillRect(sx + TILE - 2, sy + y, 2, 2);
      if(hashRand(wx, wy * 20 + y, 415) > 0.55){
        ccx.fillStyle = turfShadow;
        ccx.fillRect(sx + TILE - 4, sy + y, 2, 2);
      }
    }
  }

  // --- SOUTH BANK (bottom overlapping turf & shallow foam rim) ---
  if(sLand){
    for(let x = 0; x < TILE; x += 2){
      const bh = 4 + (hashRand(wx * 20 + x, wy, 416) > 0.55 ? 2 : 0);
      ccx.fillStyle = (((x / 2) + wx) % 2 === 0) ? foamInner : foamOuter;
      ccx.fillRect(sx + x, sy + TILE - bh - 2, 2, 2);
      ccx.fillStyle = '#382c26';
      ccx.fillRect(sx + x, sy + TILE - bh, 2, 2);
      ccx.fillStyle = turfShadow;
      ccx.fillRect(sx + x, sy + TILE - bh + 2, 2, bh - 2);
      ccx.fillStyle = turfMain;
      ccx.fillRect(sx + x, sy + TILE - 2, 2, 2);
      // Upward-poking grass blades along the southern shore
      if(hashRand(wx * 20 + x, wy, 417) > 0.58){
        ccx.fillStyle = turfHighlight;
        ccx.fillRect(sx + x, sy + TILE - bh - 2, 2, 2);
      }
    }
  }

  // --- INNER & OUTER CORNERS (smooth rounded pixel-art shoreline joints) ---
  if((nLand && wLand) || (nwLand && !nLand && !wLand)){
    ccx.fillStyle = '#3d3029';
    ccx.fillRect(sx, sy, 8, 8);
    ccx.fillStyle = turfMain;
    ccx.fillRect(sx, sy, 6, 6);
    ccx.fillStyle = foamInner;
    ccx.fillRect(sx + 6, sy + 6, 4, 2);
    ccx.fillRect(sx + 6, sy + 8, 2, 2);
  }
  if((nLand && eLand) || (neLand && !nLand && !eLand)){
    ccx.fillStyle = '#3d3029';
    ccx.fillRect(sx + TILE - 8, sy, 8, 8);
    ccx.fillStyle = turfMain;
    ccx.fillRect(sx + TILE - 6, sy, 6, 6);
    ccx.fillStyle = foamInner;
    ccx.fillRect(sx + TILE - 10, sy + 6, 4, 2);
    ccx.fillRect(sx + TILE - 8, sy + 8, 2, 2);
  }
  if((sLand && wLand) || (swLand && !sLand && !wLand)){
    ccx.fillStyle = '#3d3029';
    ccx.fillRect(sx, sy + TILE - 8, 8, 8);
    ccx.fillStyle = turfMain;
    ccx.fillRect(sx, sy + TILE - 6, 6, 6);
    ccx.fillStyle = foamOuter;
    ccx.fillRect(sx + 6, sy + TILE - 8, 4, 2);
  }
  if((sLand && eLand) || (seLand && !sLand && !eLand)){
    ccx.fillStyle = '#3d3029';
    ccx.fillRect(sx + TILE - 8, sy + TILE - 8, 8, 8);
    ccx.fillStyle = turfMain;
    ccx.fillRect(sx + TILE - 6, sy + TILE - 6, 6, 6);
    ccx.fillStyle = foamOuter;
    ccx.fillRect(sx + TILE - 10, sy + TILE - 8, 4, 2);
  }

  // 5. Shoreline Aquatic Flora & Stones (Reeds/Cattails, Lily Pads, River Stones)
  if(bn !== 'volcano' && bn !== 'desert'){
    // A. Clumps of Shoreline Reeds / Cattails (like the mockup!)
    const reedRoll = hashRand(wx, wy, 510);
    if((nearShore || wl === 1) && reedRoll < 0.28){
      const rx = 8 + Math.floor(hashRand(wx, wy, 511) * 9) * 2;
      const ry = 18 + Math.floor(hashRand(wx, wy, 512) * 7) * 2;
      // Water ripple ring at base of reeds
      ccx.fillStyle = '#8ad4fc';
      ccx.fillRect(sx + rx - 2, sy + ry + 2, 14, 2);
      ccx.fillStyle = '#dff5ff';
      ccx.fillRect(sx + rx, sy + ry + 2, 8, 2);
      // 5 vertical pixel-art reed stalks with golden-olive & green tones
      const stalkColors = ['#466922', '#6e9634', '#9cb34c', '#b8b858', '#567d29'];
      const stalkHeights = [12, 16, 14, 18, 10];
      for(let s = 0; s < 5; s++){
        const stX = sx + rx + s * 2;
        const stH = stalkHeights[(s + Math.floor(reedRoll * 10)) % 5];
        ccx.fillStyle = '#263d16';
        ccx.fillRect(stX, sy + ry, 2, 2);
        ccx.fillStyle = stalkColors[s];
        ccx.fillRect(stX, sy + ry - stH, 2, stH);
        // Cattail brown seed head on tall stalks
        if(stH >= 16){
          ccx.fillStyle = '#54341e';
          ccx.fillRect(stX, sy + ry - stH + 2, 2, 4);
          ccx.fillStyle = '#c9c26b';
          ccx.fillRect(sx + rx + s * 2, sy + ry - stH, 2, 2);
        }
      }
    }
    // B. Floating Lily Pads & Water Lilies
    else if((wl === 1 || nearShore) && hashRand(wx, wy, 513) < 0.24){
      const lx = 8 + Math.floor(hashRand(wx, wy, 514) * 10) * 2;
      const ly = 12 + Math.floor(hashRand(wx, wy, 515) * 9) * 2;
      // Dark water drop shadow
      ccx.fillStyle = 'rgba(8, 24, 46, 0.48)';
      ccx.fillRect(sx + lx, sy + ly + 4, 8, 2);
      // Lily pad body
      ccx.fillStyle = '#285924';
      ccx.fillRect(sx + lx - 2, sy + ly, 10, 4);
      ccx.fillRect(sx + lx, sy + ly - 2, 6, 6);
      ccx.fillStyle = '#4e943a';
      ccx.fillRect(sx + lx, sy + ly, 6, 4);
      ccx.fillStyle = '#78bd58';
      ccx.fillRect(sx + lx, sy + ly, 4, 2);
      // Optional blooming water-lily flower on pad
      if(hashRand(wx, wy, 516) > 0.52){
        ccx.fillStyle = hashRand(wx, wy, 517) > 0.5 ? '#f48fb1' : '#ffffff';
        ccx.fillRect(sx + lx + 2, sy + ly - 2, 4, 2);
        ccx.fillStyle = '#ffd54f';
        ccx.fillRect(sx + lx + 2, sy + ly, 2, 2);
      }
    }

    // C. Partially Submerged Shoreline River Stones
    if(nearShore && hashRand(wx, wy, 518) < 0.22){
      const stX = 8 + Math.floor(hashRand(wx, wy, 519) * 10) * 2;
      const stY = (nLand ? 10 : 16) + Math.floor(hashRand(wx, wy, 520) * 6) * 2;
      // Foam ring around submerged stone base
      ccx.fillStyle = '#9be0ff';
      ccx.fillRect(sx + stX - 2, sy + stY + 4, 10, 2);
      // Stone body
      ccx.fillStyle = '#333c45';
      ccx.fillRect(sx + stX, sy + stY, 6, 4);
      ccx.fillStyle = '#5c6975';
      ccx.fillRect(sx + stX, sy + stY, 6, 2);
      ccx.fillStyle = '#8594a1';
      ccx.fillRect(sx + stX + 2, sy + stY - 2, 4, 2);
    }
  }
}


let _canonicalChickenShrineChunk = null;
let _canonicalChickenShrineSeed = null;

function getCanonicalChickenShrineChunk() {
  const currentSeed = getWorldSeed();
  if (_canonicalChickenShrineChunk && _canonicalChickenShrineSeed === currentSeed) {
    return _canonicalChickenShrineChunk;
  }
  // Deterministic search in Plains biome starting near chunk (2, 0)
  const originX = 2;
  const originY = 0;
  for (let r = 0; r <= 35; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (r > 0 && Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const cx = originX + dx;
        const cy = originY + dy;
        const wx = cx * CHUNK_SIZE + 8;
        const wy = cy * CHUNK_SIZE + 8;
        if (biomeAt(wx, wy) === 'plains' &&
            !isInsideAnyMountain(wx * TILE, wy * TILE, 300) &&
            !isNearMountainEntrancePass(wx * TILE, wy * TILE) &&
            !isMountainBlocked(wx * TILE - 40, wy * TILE - 40, 120, 120)) {
          _canonicalChickenShrineChunk = { cx, cy, wx, wy };
          _canonicalChickenShrineSeed = currentSeed;
          return _canonicalChickenShrineChunk;
        }
      }
    }
  }
  _canonicalChickenShrineChunk = { cx: 2, cy: 0, wx: 2 * CHUNK_SIZE + 8, wy: 8 };
  _canonicalChickenShrineSeed = currentSeed;
  return _canonicalChickenShrineChunk;
}

let _canonicalSunkenShrineChunk = null;
let _canonicalSunkenShrineSeed = null;

function getCanonicalSunkenShrineChunk() {
  const currentSeed = getWorldSeed();
  if (_canonicalSunkenShrineChunk && _canonicalSunkenShrineSeed === currentSeed) {
    return _canonicalSunkenShrineChunk;
  }
  // Deterministic search in Swamp biome: prioritize the closest accessible Swamp patch to spawn
  for (let r = 1; r <= 45; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const cx = dx;
        const cy = dy;
        const wx = cx * CHUNK_SIZE + 8;
        const wy = cy * CHUNK_SIZE + 8;
        if (biomeAt(wx, wy) === 'swamp' &&
            !isInsideAnyMountain(wx * TILE, wy * TILE, 220) &&
            !isNearMountainEntrancePass(wx * TILE, wy * TILE) &&
            !isMountainBlocked(wx * TILE - 40, wy * TILE - 40, 120, 120)) {
          _canonicalSunkenShrineChunk = { cx, cy, wx, wy };
          _canonicalSunkenShrineSeed = currentSeed;
          return _canonicalSunkenShrineChunk;
        }
      }
    }
  }
  _canonicalSunkenShrineChunk = { cx: -12, cy: 12, wx: -12 * CHUNK_SIZE + 8, wy: 12 * CHUNK_SIZE + 8 };
  _canonicalSunkenShrineSeed = currentSeed;
  return _canonicalSunkenShrineChunk;
}

function generateChunk(cx,cy){
  const tiles=new Array(CHUNK_SIZE*CHUNK_SIZE);
  const waterTiles=[];const tall=[];const relicSites=[];const biomeCounts={};
  const cityWalls=new Set();
  const cityRoofs=new Set();
  let abyssPitLoc=null;
  const isAbyssChunk = (cx * CHUNK_SIZE > 700000 && cx * CHUNK_SIZE < 900000 && cy * CHUNK_SIZE > 700000 && cy * CHUNK_SIZE < 900000);
  const isChickenChunk = (cx * CHUNK_SIZE > 910000 && cx * CHUNK_SIZE < 990000 && cy * CHUNK_SIZE > 910000 && cy * CHUNK_SIZE < 990000);
  const dcx = cx - 25000;
  const dcy = cy - 25000;
  const dung = window.DUNGEON1_DATA;
  const dungChunksW = dung ? Math.ceil(dung.width / CHUNK_SIZE) : 8;
  const dungChunksH = dung ? Math.ceil(dung.height / CHUNK_SIZE) : 6;
  const isDungeonChunk = (dcx >= 0 && dcx < dungChunksW && dcy >= 0 && dcy < dungChunksH);
  const wantsRelic=!isChickenChunk&&(hashRand(cx,cy,916)>.975);
  const featureRoll=hashRand(cx,cy,920);
  let featureType=isChickenChunk?null:(featureRoll>.992?'cave':featureRoll>.965?'structure':featureRoll>.91?'mountain':null);
  let relicCandidate=null,relicCandidateScore=-Infinity;
  let featureCandidate=null,featureCandidateScore=-1;
  for(let ty=0;ty<CHUNK_SIZE;ty++)for(let tx=0;tx<CHUNK_SIZE;tx++){
    const wx=cx*CHUNK_SIZE+tx,wy=cy*CHUNK_SIZE+ty;
    const isChickenDim = (wx>910000&&wx<990000&&wy>910000&&wy<990000);
    const bn=biomeAt(wx,wy),b=isChickenDim?CHICKEN_DIM_PROPS:BIOMES[bn];
    biomeCounts[bn]=(biomeCounts[bn]||0)+1;
    const isAbyss = (bn==='abyss' || (wx>700000&&wx<900000&&wy>700000&&wy<900000));
    const isDream = (bn==='dream' || (wx>550000&&wx<650000&&wy>550000&&wy<650000));
    const inMountain = isInsideAnyMountain(wx * TILE, wy * TILE, 80);
    const inEntrancePass = isNearMountainEntrancePass(wx * TILE, wy * TILE);
    let wl=(inMountain||inEntrancePass||bn==='snow'||bn==='dwarfCity'||isAbyss||isDream||isChickenDim||(wx>100000&&wx<300000))?0:waterLevelAt(wx,wy,floodBoost);
    tiles[ty*CHUNK_SIZE+tx]=wl;
    
    const isUnderworld = (wx > 100000 && wx < 300000);
    
    if (isDungeonChunk) {
        // Place exit ladder at spawn point
        const spawnX = (dung?.spawnX ?? 26);
        const spawnY = (dung?.spawnY ?? 23);
        if (wx === 200000 + spawnX && wy === 200000 + spawnY) {
            tall.push({
                x: wx * TILE + TILE / 2,
                y: wy * TILE + TILE,
                sprite: 'rpg_ladder',
                scale: 2.8,
                tx: wx,
                ty: wy,
                featureType: 'cave'
            });
        }
        continue;
    } else if(isUnderworld) {
        if(getCaveTile(wx, wy)) {
            if(!window.brokenWalls.has(`${wx},${wy}`)) {
                // === UNDERGROUND CITY: wall tileset + embedded ore veins ===
                const wallTile = getUndergroundWallTile(wx, wy);
                const wallNoise = hashRand(wx, wy, 555);
                let oreSprite = null;
                if (wallNoise >= 0.95) {
                  const orePool = ['oreGold','oreIron','oreCoal','oreRuby','oreEmerald','oreAmethyst','oreDiamond'];
                  oreSprite = orePool[Math.min(6, Math.floor((wallNoise - 0.95) / 0.05 * 7))];
                }
                tall.push({
                  x: wx * TILE + TILE / 2,
                  y: wy * TILE + TILE,
                  tx: wx,
                  ty: wy,
                  isWall: true,
                  srcX: wallTile.srcX,
                  srcY: wallTile.srcY,
                  oreSprite
                });
            }
            // rare wall torch: ambient light in the dark
            if (hashRand(wx, wy, 992) < 0.010) {
              tall.push({x:wx*TILE+TILE/2, y:wy*TILE+TILE, sprite:'torch', scale:2.2, tx:wx, ty:wy, isTorch:true});
            }
            continue;
        }
    }
    
    if(wx===200000 && wy===200000) {
        tall.push({x:wx*TILE+TILE/2, y:wy*TILE+TILE, sprite:'rpg_portal', scale:10, isFeature:true, featureType:'voidPortal', tx:wx, ty:wy});
        continue;
    }
    if(wx===750000 && wy===750000) {
        tall.push({x:wx*TILE+TILE/2, y:wy*TILE+TILE, sprite:'sunken_shrine', scale:0.8, isFeature:true, featureType:'abyssReturnPortal', tx:wx, ty:wy});
        continue;
    }
    if(wx===950000 && wy===950000) {
        if (state.chickenKingDefeated) {
          tall.push({x:wx*TILE+TILE/2, y:wy*TILE+TILE, sprite:'chicken_portal', scale:1.0, isFeature:true, featureType:'chickenReturnPortal', tx:wx, ty:wy});
        }
        continue;
    }
    if(isChickenDim) continue;
    
    if(wl>0){waterTiles.push({tx,ty,level:wl,biome:bn});continue;}
    if(wantsRelic && !inMountain && !inEntrancePass && !isMountainBlocked(wx * TILE, wy * TILE, TILE, TILE)){
      const score=hashRand(wx,wy,917);
      if(score>relicCandidateScore){relicCandidateScore=score;relicCandidate={wx,wy};}
    }
    // Abyss colour-boundary reef wall: reefs line the diagonal where the seabed tint changes
    if(isAbyss && wx%4===0 && wy%4===0 && biomeBoundaryDist(wx,wy)<0.012 && hashRand(wx,wy,961)<0.8 && !(wx===750000&&wy===750000)){
      const reefNames=['abyss_rf1_spire','abyss_rf1_tiered','abyss_rf1_cauldron','abyss_rf1_arch','abyss_rf1_pillar','abyss_rf1_crystals','abyss_rf2_sponge','abyss_rf2_pointed','abyss_rf2_plateau','abyss_rf2_arch2','abyss_rf2_purple','abyss_rf2_shelf'];
      const rs=reefNames[Math.floor(hashRand(wx,wy,962)*reefNames.length)];
      tall.push({x:wx*TILE+TILE/2,y:wy*TILE+TILE,sprite:rs,scale:1.0,tx:wx,ty:wy});
      continue;
    }
    const isAbyssLoc = isAbyssChunk || (wx > 700000 && wx < 900000 && wy > 700000 && wy < 900000) || bn === 'abyss';
    const isDreamLoc = (wx > 550000 && wx < 650000 && wy > 550000 && wy < 650000) || bn === 'dream';
    if(featureType && !isAbyssLoc && !isDreamLoc && !inMountain && !inEntrancePass && !isInsideAnyMountain(wx * TILE, wy * TILE, 300) && !isMountainBlocked(wx * TILE - 40, wy * TILE - 40, 120, 120)){
      const score=hashRand(wx,wy,921);
      if(score>featureCandidateScore){featureCandidateScore=score;featureCandidate={wx,wy};}
    }
    const isUnderworldDecor = (wx > 100000 && wx < 300000);
    if(isUnderworldDecor) continue;
    const isNearDreamShop = Math.abs(wx - 600000) <= 9 && Math.abs(wy - 600000) <= 9;
    if(isNearDreamShop) continue;
    if(isMountainBlocked(wx * TILE - 20, wy * TILE - 20, TILE + 40, TILE + 40)) continue;
    if(inEntrancePass) continue;
    if(inMountain && isNearMountainCenterpiece(wx * TILE, wy * TILE, 185)) continue;
    const rnd=hashRand(wx,wy,12);
    if(rnd>=b.decorChance)continue;
    const tallRnd=hashRand(wx,wy,77);
    if(tallRnd<b.treeChance){
      // Guarantee open walking paths by keeping at least 1 tile clearance between trees
      if(tall.some(t => Math.abs(t.tx - wx) <= 1 && Math.abs(t.ty - wy) <= 1)) continue;
      const species=Math.floor(hashRand(wx,wy,211)*b.treeSprites.length);
      const scaleRoll=hashRand(wx,wy,212);
      const scale=(b.treeScale[0]+scaleRoll*(b.treeScale[1]-b.treeScale[0]))*(0.76+hashRand(wx,wy,214)*0.54);
      tall.push({x:wx*TILE+TILE/2,y:wy*TILE+TILE,sprite:b.treeSprites[species],scale,tx:wx,ty:wy});
    }
  }
  // Strictly ONE Chicken Shrine in Plains and strictly ONE Sunken Shrine in Swamp across entire world
  const canonicalChicken = getCanonicalChickenShrineChunk();
  const isChickenShrineChunk = Boolean(canonicalChicken && cx === canonicalChicken.cx && cy === canonicalChicken.cy);
  if ((biomeCounts['swamp'] || 0) >= 110 && biomeAt(cx * CHUNK_SIZE + 8, cy * CHUNK_SIZE + 8) === 'swamp' && biomeAt(cx * CHUNK_SIZE + 10, cy * CHUNK_SIZE + 8) === 'swamp' && !isInsideAnyMountain((cx * CHUNK_SIZE + 8) * TILE, (cy * CHUNK_SIZE + 8) * TILE, 260) && !isNearMountainEntrancePass((cx * CHUNK_SIZE + 8) * TILE, (cy * CHUNK_SIZE + 8) * TILE) && !isMountainBlocked((cx * CHUNK_SIZE + 8) * TILE - 40, (cy * CHUNK_SIZE + 8) * TILE - 40, 120, 120) && !Array.from(chunks.values()).some(c => c && c.tall && c.tall.some(t => t.featureType === 'sunkenShrine'))) { _canonicalSunkenShrineChunk = { cx, cy, wx: cx * CHUNK_SIZE + 8, wy: cy * CHUNK_SIZE + 8 }; _canonicalSunkenShrineSeed = getWorldSeed(); }
  const canonicalSunken = getCanonicalSunkenShrineChunk();
  const isSunkenShrineChunk = Boolean(canonicalSunken && cx === canonicalSunken.cx && cy === canonicalSunken.cy);

  if (isChickenShrineChunk) {
    featureType = 'chickenShrine';
    featureCandidate = { wx: canonicalChicken.wx, wy: canonicalChicken.wy };
  } else if (isSunkenShrineChunk) {
    featureType = 'sunkenShrine';
    featureCandidate = { wx: canonicalSunken.wx, wy: canonicalSunken.wy };
  }

  let chickenShrineLoc = null;
  let sunkenShrineLoc = null;
  if(featureCandidate && !isInsideAnyMountain(featureCandidate.wx * TILE, featureCandidate.wy * TILE, 300) && !isNearMountainEntrancePass(featureCandidate.wx * TILE, featureCandidate.wy * TILE) && !isMountainBlocked(featureCandidate.wx * TILE - 40, featureCandidate.wy * TILE - 40, 120, 120) && !isAbyssChunk && biomeAt(featureCandidate.wx, featureCandidate.wy) !== 'abyss' && biomeAt(featureCandidate.wx, featureCandidate.wy) !== 'dream' && !(featureCandidate.wx > 550000 && featureCandidate.wx < 650000) && !(featureCandidate.wx > 700000 && featureCandidate.wx < 990000)){
    const {wx,wy}=featureCandidate;
    const bn=biomeAt(wx,wy);
    let sprite,scale;
    if(featureType==='mountain' || featureType==='cave'){
      if(typeof window !== 'undefined' && window.IS_DEMO) {
        featureType = 'lifeWell';
        sprite = 'life_well';
        scale = 1.0;
      } else {
        featureType = 'cave'; // Ensure it's treated as a cave
        sprite = bn==='snow'?'caveSnow':bn==='desert'?'caveDesert':bn==='volcano'?'caveVolcano':bn==='swamp'?'caveSwamp':bn==='magicForest'?'caveMagic':bn==='deadlands'?'caveDeadlands':'caveMouth';
        const hasExt = Boolean(window.TREE_DIMS?.[sprite] || (window.TREE_ALIASES?.[sprite] && window.TREE_DIMS?.[window.TREE_ALIASES[sprite]]));
        scale = hasExt ? (2.0 + hashRand(wx,wy,923)*0.25) : (5.8+hashRand(wx,wy,923)*.7);
      }
    }else{
      if(isSunkenShrineChunk) {
        featureType = 'sunkenShrine';
        sprite = 'sunken_shrine';
        scale = 0.8;
        sunkenShrineLoc = { wx, wy };
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 3; dx++) { const tx = wx - cx * CHUNK_SIZE + dx, ty = wy - cy * CHUNK_SIZE + dy; if (tx >= 0 && tx < CHUNK_SIZE && ty >= 0 && ty < CHUNK_SIZE) tiles[ty * CHUNK_SIZE + tx] = 0; }
        for (let wi = waterTiles.length - 1; wi >= 0; wi--) { if (Math.abs((cx * CHUNK_SIZE + waterTiles[wi].tx) - wx) <= 3 && Math.abs((cy * CHUNK_SIZE + waterTiles[wi].ty) - wy) <= 2) waterTiles.splice(wi, 1); }
      } else if(isChickenShrineChunk) {
        featureType = 'chickenShrine';
        sprite = 'chicken_shrine';
        scale = 1.0;
        chickenShrineLoc = { wx, wy };
      } else {
        sprite = bn==='swamp'?'CaveObj_128_mushroom31':bn==='plains'?'ruinGate':bn==='desert'?'CaveObj_256_Dinosaur_skeleton_full':bn==='badlands'?'CaveObj_128_Demon_scull':bn==='forest'?'Forest_Tree_idol_deer':bn==='magicForest'?'Forest_Living_gazebo1':bn==='fungalWastes'?'CaveObj_128_mushroom31':bn==='deadlands'?'CaveObj_128_Building1':bn==='volcano'?'CaveObj_128_Building2':bn==='crystalWastes'?'CaveObj_256_white_crystal1':bn==='snow'?'CaveObj_128_Building1':'ruinGate';
        const hasExt = Boolean(window.TREE_DIMS?.[sprite] || (window.TREE_ALIASES?.[sprite] && window.TREE_DIMS?.[window.TREE_ALIASES[sprite]]));
        scale = hasExt ? (2.0 + hashRand(wx,wy,924)*0.25) : (5.8+hashRand(wx,wy,924)*.7);
      }
    }
    for(let i=tall.length-1;i>=0;i--){
      if(Math.abs(tall[i].tx-wx)<=1&&Math.abs(tall[i].ty-wy)<=1)tall.splice(i,1);
    }
    tall.push({x:wx*TILE+TILE/2,y:wy*TILE+TILE,sprite,scale,tx:wx,ty:wy,featureType});
  }

  // Abyss Biome Landmark Decoration: hole_pit (not too many, but not few; spaced cleanly)
  if (isAbyssChunk || (biomeCounts['abyss'] && biomeCounts['abyss'] > 16)) {
    const abyssPitRoll = hashRand(cx, cy, 948);
    // ~12% of chunks spawn a hole pit, skipping if adjacent left or top chunks spawned one to guarantee clean spacing
    if (abyssPitRoll < 0.12) {
      const leftHadPit = hashRand(cx - 1, cy, 948) < 0.12;
      const topHadPit = hashRand(cx, cy - 1, 948) < 0.12;
      if (!leftHadPit && !topHadPit) {
        const pitVariant = Math.floor(hashRand(cx, cy, 949) * 3);
        const pitSprite = pitVariant === 0 ? 'abyss_hole_pit1' : pitVariant === 1 ? 'abyss_hole_pit2' : 'abyss_hole_pit3';
        const ptx = 3 + Math.floor(hashRand(cx, cy, 951) * 2);
        const pty = 3 + Math.floor(hashRand(cx, cy, 952) * 2);
        const pwx = cx * CHUNK_SIZE + ptx;
        const pwy = cy * CHUNK_SIZE + pty;
        abyssPitLoc = { wx: pwx, wy: pwy };
        // Clear other tall props within 2-tile radius so the pit has an open, uncluttered stage
        for (let i = tall.length - 1; i >= 0; i--) {
          if (Math.abs(tall[i].tx - pwx) <= 2 && Math.abs(tall[i].ty - pwy) <= 2) {
            tall.splice(i, 1);
          }
        }
        tall.push({ x: pwx * TILE + TILE / 2, y: pwy * TILE + TILE, sprite: pitSprite, scale: 1.0, tx: pwx, ty: pwy, isHolePit: true });
      }
    }
  }

  // In Demo mode, guarantee a Well of Life near spawn in Plains (chunk 0,0)
  if(typeof window !== 'undefined' && window.IS_DEMO && cx === 0 && cy === 0 && !tall.some(t => t.featureType === 'lifeWell')) {
    const pwx = 8, pwy = 12;
    for(let i = tall.length - 1; i >= 0; i--) {
      if(Math.abs(tall[i].tx - pwx) <= 2 && Math.abs(tall[i].ty - pwy) <= 2) {
        tall.splice(i, 1);
      }
    }
    tall.push({
      x: pwx * TILE + TILE / 2,
      y: pwy * TILE + TILE,
      sprite: 'life_well',
      scale: 1.0,
      tx: pwx,
      ty: pwy,
      featureType: 'lifeWell'
    });
  }

  const npcSites = [];
  let npcCandidate=null,npcCandidateScore=-Infinity;
  let forceRole = null;
  if(cx === 1 && cy === 0) forceRole = 'merchant';
  else if(cx === 0 && cy === 1) forceRole = 'traveler';
  else if(cx === -1 && cy === 0) forceRole = 'hermit';
  else if(cx === 0 && cy === -1) forceRole = 'gambler';

  const isDreamChunk = (cx * CHUNK_SIZE > 550000 && cx * CHUNK_SIZE < 650000 && cy * CHUNK_SIZE > 550000 && cy * CHUNK_SIZE < 650000);
  const shouldSpawnNpc = !isAbyssChunk && !isDreamChunk && !isChickenChunk && (Boolean(forceRole) || (hashRand(cx,cy,940) > 0.95 && (cx !== 0 || cy !== 0)));
  if(shouldSpawnNpc){
    for(let ty=0;ty<CHUNK_SIZE;ty++)for(let tx=0;tx<CHUNK_SIZE;tx++){
       const wx=cx*CHUNK_SIZE+tx,wy=cy*CHUNK_SIZE+ty;
       if(tiles[ty*CHUNK_SIZE+tx]===0 && !isInsideAnyMountain(wx * TILE, wy * TILE, 120) && !isMountainBlocked(wx * TILE, wy * TILE, 36, 44)) {
          const score=hashRand(wx,wy,941);
          if(score>npcCandidateScore){npcCandidateScore=score;npcCandidate={wx,wy};}
       }
    }
    if(!npcCandidate && forceRole){
      const midX = cx*CHUNK_SIZE + 8, midY = cy*CHUNK_SIZE + 8;
      tiles[8*CHUNK_SIZE + 8] = 0;
      npcCandidate = { wx: midX, wy: midY };
    }
  }
  if(npcCandidate && !isInsideAnyMountain(npcCandidate.wx * TILE, npcCandidate.wy * TILE, 120) && !isMountainBlocked(npcCandidate.wx * TILE, npcCandidate.wy * TILE, 36, 44)){
    const {wx,wy}=npcCandidate;
    let role = forceRole;
    if(!role){
      const typeRoll = hashRand(wx,wy,942);
      if(typeRoll >= 0.75) role = 'gambler';
      else if(typeRoll >= 0.50) role = 'hermit';
      else if(typeRoll >= 0.25) role = 'traveler';
      else role = 'merchant';
    }
    // Generic random NPCs are never lost_traveler or mad_farmer (they are strictly single-instance)
    if(role !== 'lost_traveler' && role !== 'mad_farmer'){
      const npc = createNpcInstance(role, wx, wy);
      npcSites.push(npc);
    }
  }
  // Spawn "The Mad Poultry Farmer" ONLY next to the strictly unique canonical Chicken Shrine in Plains
  if (chickenShrineLoc && !isMountainBlocked(chickenShrineLoc.wx * TILE, chickenShrineLoc.wy * TILE, 36, 44)) {
    if (!npcSites.some(n => n.role === 'mad_farmer')) {
      const farmerNpc = createNpcInstance('mad_farmer', chickenShrineLoc.wx + 2, chickenShrineLoc.wy);
      npcSites.push(farmerNpc);
    }
  }
  // Spawn "The Lost Traveler" (Caelen) ONLY next to the strictly unique canonical Sunken Shrine in Swamp
  if (sunkenShrineLoc && !isMountainBlocked(sunkenShrineLoc.wx * TILE, sunkenShrineLoc.wy * TILE, 36, 44)) {
    if (!npcSites.some(n => n.role === 'lost_traveler')) { npcSites.length = 0;
      const caelenNpc = createNpcInstance('lost_traveler', sunkenShrineLoc.wx + 2, sunkenShrineLoc.wy);
      npcSites.push(caelenNpc);
    }
  }

  if(relicCandidate && !isMountainBlocked(relicCandidate.wx * TILE, relicCandidate.wy * TILE, 32, 32) && !isChickenChunk && !(relicCandidate.wx > 910000 && relicCandidate.wx < 990000 && relicCandidate.wy > 910000 && relicCandidate.wy < 990000)){
    const {wx,wy}=relicCandidate;
    const bn = biomeAt(wx,wy);
    const isDreamRelicLoc = bn === 'dream' || (wx > 550000 && wx < 650000 && wy > 550000 && wy < 650000);
    if(isDreamRelicLoc){
      const isNearShop = Math.abs(wx - 600000) <= 9 && Math.abs(wy - 600000) <= 9;
      if(!isNearShop && Array.isArray(DREAM_RELICS)){
        const nonBellPool = DREAM_RELICS.filter(r => r.id !== 'lucid_bell');
        const pickRelic = nonBellPool[Math.floor(hashRand(wx, wy, 918) * nonBellPool.length)];
        if(pickRelic){
          relicSites.push({
            id: `${wx},${wy}`,
            x: wx * TILE + TILE / 2,
            y: wy * TILE + TILE,
            name: pickRelic.name,
            sprite: pickRelic.sprite,
            relicId: pickRelic.id,
            desc: pickRelic.desc,
            stats: pickRelic.stats,
            isDreamRelic: true,
            color: '#ba68c8'
          });
        }
      }
    } else {
      const rarityRoll=hashRand(wx,wy,918),luckAdjustedRoll=1-(1-rarityRoll)/Math.max(1,player.luckMult||1);
      const drop=relicForRoll(Math.min(.999999,luckAdjustedRoll),hashRand(wx,wy,919));
      relicSites.push({id:`${wx},${wy}`,x:wx*TILE+TILE/2,y:wy*TILE+TILE, ...drop});
    }
  }

  const cc=document.createElement('canvas');cc.width=CHUNK_PX+2;cc.height=CHUNK_PX+2;
  const ccx=cc.getContext('2d');ccx.imageSmoothingEnabled=false;

  if (isDungeonChunk) {
    if (dungeon1MapImg && (dungeon1MapImg.complete || dungeon1MapImg.width > 0)) {
      ccx.drawImage(dungeon1MapImg, dcx * 128, dcy * 128, 128, 128, 0, 0, CHUNK_PX, CHUNK_PX);
    } else {
      ccx.fillStyle = '#0f0e19';
      ccx.fillRect(0, 0, CHUNK_PX, CHUNK_PX);
    }
  } else if (cx > 12500 && cx < 37500 && cy > 12500 && cy < 37500) {
    ccx.fillStyle = '#0f0e19';
    ccx.fillRect(0, 0, CHUNK_PX, CHUNK_PX);
  } else {
    for(let ty=0;ty<CHUNK_SIZE;ty++)for(let tx=0;tx<CHUNK_SIZE;tx++){
      const wx=cx*CHUNK_SIZE+tx,wy=cy*CHUNK_SIZE+ty;
      const sx=tx*TILE,sy=ty*TILE;
      const wl=tiles[ty*CHUNK_SIZE+tx];
      const bn=biomeAt(wx,wy);
      const landColor=blendedTileColor(wx,wy);
      if(wl===0){
        if (bn === 'dream') {
          ccx.fillStyle = 'rgb(45, 25, 65)';
          ccx.fillRect(sx, sy, TILE, TILE);
          drawBiomeTexture(ccx, bn, sx, sy, wx, wy);
        } else if (bn === 'dwarfCity') {
          const spriteRegion = ATLAS.regions[BIOMES[bn].groundSprite];
          if(spriteRegion) {
            ccx.drawImage(ATLAS.canvas, spriteRegion.x, spriteRegion.y, spriteRegion.w, spriteRegion.h, sx, sy, TILE, TILE);
          } else {
            ccx.fillStyle='rgb('+landColor[0]+','+landColor[1]+','+landColor[2]+')';
            ccx.fillRect(sx,sy,TILE,TILE);
          }
        } else {
          drawRichLandTile(ccx, bn, landColor, sx, sy, wx, wy);
          drawBiomeTexture(ccx, bn, sx, sy, wx, wy);
        }
      }else{
        drawRichWaterTile(ccx, bn, landColor, wl, sx, sy, wx, wy);
      }
      // Paint dwarfCity walls with solid fill and brick pattern
      if(cityWalls.has(`${wx},${wy}`)) {
        ccx.fillStyle = '#3a3a44';
        ccx.fillRect(sx, sy, TILE, TILE);
        ccx.fillStyle = '#6a6a72';
        ccx.fillRect(sx, sy, TILE, 3);
        ccx.fillStyle = '#1a1a24';
        ccx.fillRect(sx, sy + TILE - 3, TILE, 3);
        ccx.fillStyle = '#2a2a32';
        for(let by = 8; by < TILE; by += 8) {
          ccx.fillRect(sx, sy + by, TILE, 1);
        }
      }
    }
  }
  // Extrude right and bottom 1px edge by 2px so adjacent chunks overlap seamlessly without #0b0b12 grid lines
  ccx.drawImage(cc, CHUNK_PX - 1, 0, 1, CHUNK_PX, CHUNK_PX, 0, 2, CHUNK_PX);
  ccx.drawImage(cc, 0, CHUNK_PX - 1, CHUNK_PX + 2, 1, 0, CHUNK_PX, CHUNK_PX + 2, 2);

    // ── Pass 1.5: underground wall edge treatment (rim + under-shadow + floor corner AO)
  // Runs after the base tile pass, before decor. Only touches underground chunks.
  {
    const pwx0 = cx * CHUNK_SIZE, pwy0 = cy * CHUNK_SIZE;
    const inUnderBox = pwx0 > 100000 && pwx0 < 300000 && pwy0 > 100000 && pwy0 < 300000;
    if (inUnderBox) {
      for (let ty = 0; ty < CHUNK_SIZE; ty++) {
        for (let tx = 0; tx < CHUNK_SIZE; tx++) {
          const wx = pwx0 + tx, wy = pwy0 + ty;
          const sx = tx * TILE, sy = ty * TILE;
          const isWall = getCaveTile(wx, wy) && !window.brokenWalls.has(`${wx},${wy}`);
          if (isWall) {
            // New tileset handles wall borders natively in Layer 6
          } else {
            // soft contact shadow only directly below a wall face
            if (getCaveTile(wx, wy - 1) && !window.brokenWalls.has(`${wx},${wy-1}`)) {
              const g = ccx.createLinearGradient(0, sy, 0, sy + 14);
              g.addColorStop(0, 'rgba(10,10,25,0.38)');
              g.addColorStop(1, 'rgba(10,10,25,0)');
              ccx.fillStyle = g;
              ccx.fillRect(sx, sy, TILE, 14);
            }
          }
        }
      }
    }
  }
  const decor=[]; const bakedDecor=[]; // interior static decor is baked directly onto ch.canvas!
  for(let ty=0;ty<CHUNK_SIZE;ty++)for(let tx=0;tx<CHUNK_SIZE;tx++){
    if(isDungeonChunk) continue;
    const wx=cx*CHUNK_SIZE+tx,wy=cy*CHUNK_SIZE+ty;
    if(tiles[ty*CHUNK_SIZE+tx]!==0)continue;
    const isChickenDim = (wx>910000&&wx<990000&&wy>910000&&wy<990000);
    if(isChickenDim) continue;
    const bn=biomeAt(wx,wy),b=isChickenDim?CHICKEN_DIM_PROPS:BIOMES[bn];
    const isUnderworldDecor = (wx > 100000 && wx < 300000);
    // === UNDERGROUND PACK: floor decor + hazards ===
    if (isUnderworldDecor) {
      // Gate on the full box so cave decor never bleeds onto surface tiles.
      const inUnderBox = wx > 100000 && wx < 300000 && wy > 100000 && wy < 300000;
      // Only dress OPEN floor. walls get their own tall[] sprites, and tiles[] is 0 for both
      // (see the wl computation), so without this the decor also landed on wall tiles and
      // showed as strips poking out under the wall bases.
      if (inUnderBox && !getCaveTile(wx, wy)) {
        // NOTE: aux seeds below must be bit-distant from the gate seed (777) and from
        // each other. hashRand XORs its seed in BEFORE a single mix round, so nearby
        // seeds (778/779/781) stay correlated with 777 and collapse the sprite pool
        // to ~6 of 16 sprites, with a near-constant scale. Measured: chi2 883121 -> 22.
        const dNoise = hashRand(wx, wy, 777);
        if (false) {
        }
        else if (dNoise > 0.4 && dNoise < 0.45) {
          // === DWARF CITY: city-themed decor ===
          if (bn === 'dwarfCity') {
            const cityDecor = ['rpg_barrel', 'rpg_crate', 'rpg_anvil', 'rpg_workbench', 'rpg_lamp_post', 'rpg_cauldron', 'rpg_chest_wood', 'rpg_sign_post'];
            const deco = cityDecor[Math.floor(hashRand(wx, wy, 778019) * cityDecor.length)];
            const r = ATLAS.regions[deco];
            if (r) {
              const scale = 1.5 + hashRand(wx, wy, 778027) * 0.5;
              const dw = r.w * scale, dh = r.h * scale;
              const dx = tx * TILE + (TILE - dw) / 2;
              const dy = ty * TILE + TILE - dh - 2;
              ccx.fillStyle = 'rgba(0,0,0,0.30)';
              ccx.beginPath();
              ccx.ellipse(tx * TILE + TILE / 2, ty * TILE + TILE - 3, dw * 0.34, 3, 0, 0, Math.PI * 2);
              ccx.fill();
              ccx.drawImage(ATLAS.canvas, r.x, r.y, r.w, r.h, dx, dy, dw, dh);
            }
          } else {
            // === UNDERGROUND CITY: 100% Tileset Props from user mapping table ===
            const pRoll = hashRand(wx, wy, 778019);
            let prop = null;
            if (pRoll < 0.16) {
              // Wood barrel (barrel_wood 336,0)
              prop = { img: undergroundObjectsImg, srcX: 336, srcY: 0, sw: 16, sh: 16, dw: 28, dh: 28 };
            } else if (pRoll < 0.30) {
              // Wood crate (wood_crate 240,16)
              prop = { img: undergroundObjectsImg, srcX: 240, srcY: 16, sw: 16, sh: 16, dw: 28, dh: 28 };
            } else if (pRoll < 0.44) {
              // Tall crate (wood_crate_tall 256,0)
              prop = { img: undergroundObjectsImg, srcX: 256, srcY: 0, sw: 16, sh: 16, dw: 28, dh: 32 };
            } else if (pRoll < 0.58) {
              // Purple urn (urn_purple_small 352,16)
              prop = { img: undergroundObjectsImg, srcX: 352, srcY: 16, sw: 16, sh: 16, dw: 24, dh: 24 };
            } else if (pRoll < 0.70) {
              // Grey urn (urn_grey 240,64)
              prop = { img: undergroundObjectsImg, srcX: 240, srcY: 64, sw: 16, sh: 16, dw: 24, dh: 24 };
            } else if (pRoll < 0.80) {
              // Blue vase (vase_blue 352,0)
              prop = { img: undergroundObjectsImg, srcX: 352, srcY: 0, sw: 16, sh: 16, dw: 24, dh: 26 };
            } else if (pRoll < 0.90) {
              // Gold pile (gold_pile_small 160,0 or gold_coins_spread 224,0)
              const gType = hashRand(wx, wy, 778021) < 0.5 ? 160 : 224;
              prop = { img: undergroundObjectsImg, srcX: gType, srcY: 0, sw: 16, sh: 16, dw: 26, dh: 22 };
            } else {
              // Gold chest (chest_closed_wood 128,48 or chest_gold 144,16 or chest_open_gold 128,0)
              const cRoll = hashRand(wx, wy, 778022);
              const csx = cRoll < 0.33 ? 128 : cRoll < 0.66 ? 144 : 128;
              const csy = cRoll < 0.33 ? 48 : cRoll < 0.66 ? 16 : 0;
              prop = { img: undergroundObjectsImg, srcX: csx, srcY: csy, sw: 16, sh: 16, dw: 30, dh: 28 };
            }
            if (prop) {
              tall.push({
                x: wx * TILE + TILE / 2,
                y: wy * TILE + TILE,
                tx: wx,
                ty: wy,
                isUndergroundProp: true,
                ...prop
              });
            }
          }
        }
        // Rare hazards (~2% of tiles)
        else if (dNoise > 0.96 && dNoise < 0.98) {
          // Iron floor spike trap from trap_animation.webp!
          if (undergroundTrapsImg.complete && undergroundTrapsImg.naturalWidth > 0) {
            ccx.drawImage(undergroundTrapsImg, 80, 0, 16, 16, tx * TILE, ty * TILE, TILE, TILE);
          } else {
            const r = ATLAS.regions['spikes'];
            if (r) ccx.drawImage(ATLAS.canvas, r.x, r.y, r.w, r.h, tx * TILE, ty * TILE, TILE, TILE);
          }
        }
        // === DWARF CITY: rare city features (1% of floor tiles) ===
        if (bn === 'dwarfCity' && hashRand(wx, wy, 778040) < 0.01) {
          const cityFeatures = ['rpg_well', 'rpg_campfire', 'rpg_tent', 'rpg_cabin'];
          const feature = cityFeatures[Math.floor(hashRand(wx, wy, 778041) * cityFeatures.length)];
          const r = ATLAS.regions[feature];
          if (r) {
            const scale = 2.0 + hashRand(wx, wy, 778042) * 0.5;
            const dw = r.w * scale, dh = r.h * scale;
            const dx = tx * TILE + (TILE - dw) / 2;
            const dy = ty * TILE + TILE - dh - 2;
            // contact shadow
            ccx.fillStyle = 'rgba(0,0,0,0.30)';
            ccx.beginPath();
            ccx.ellipse(tx * TILE + TILE / 2, ty * TILE + TILE - 3, dw * 0.34, 3, 0, 0, Math.PI * 2);
            ccx.fill();
            ccx.drawImage(ATLAS.canvas, r.x, r.y, r.w, r.h, dx, dy, dw, dh);
          }
        }
      }
      continue;
    }
    const isNearDreamShop = Math.abs(wx - 600000) <= 9 && Math.abs(wy - 600000) <= 9;
    if(isNearDreamShop) continue;
    const isInsideMtn = window.getMountainInfluence
      ? Boolean(window.getMountainInfluence(wx * TILE, wy * TILE)?.weight >= 0.50)
      : isInsideAnyMountain(wx * TILE, wy * TILE, 40);
    if(isMountainBlocked(wx * TILE - 20, wy * TILE - 20, TILE + 40, TILE + 40)) continue;
    if(isNearMountainEntrancePass(wx * TILE, wy * TILE)) continue;
    if(isInsideMtn && isNearMountainCenterpiece(wx * TILE, wy * TILE, 185)) continue;
    const effectiveDecorChance = isInsideMtn ? 0.35 : b.decorChance;
    const rnd=hashRand(wx,wy,12);
    if(rnd>=effectiveDecorChance)continue;
    if(abyssPitLoc && Math.abs(wx - abyssPitLoc.wx) <= 2 && Math.abs(wy - abyssPitLoc.wy) <= 1) continue;
    const tallRnd=hashRand(wx,wy,77);
    if(tallRnd<b.treeChance)continue;
    if(tall.some(t => t.tx === wx && t.ty === wy)) continue;

    // Decor selection: inside mountain, filter out artificial buildings, ruins, totems, and statues
    const STRUCTURE_REGEX = /building|totem|gazebo|ruingate|scull|skeleton|bonefire|statue|idol|centipede|demon|circle|obelisk|tower/i;
    let decorPool = b.decorSprites;
    if (isInsideMtn) {
      const naturalPool = b.decorSprites.filter(s => !STRUCTURE_REGEX.test(s));
      if (naturalPool.length > 0) decorPool = naturalPool;
    }
    const pick=hashRand(wx,wy,41);
    const sprite=decorPool[Math.floor(pick*decorPool.length)];
    const tName=window.EXT_TREES?.[sprite]?sprite:window.TREE_ALIASES?.[sprite];
    const ext=tName?window.EXT_TREES[tName]:null;
    const dims=tName?window.TREE_DIMS?.[tName]:null;
    if(ext&&dims){
      const isSheetDecor = dims.sheetImg !== undefined;
      const dw = Math.round(isSheetDecor ? dims.w : (dims.w>=64?68:dims.w>=32?46:28)*(dims.w/Math.max(dims.w,dims.h))*(0.70+hashRand(wx,wy,213)*0.78));
      const dh = Math.round(isSheetDecor ? dims.h : (dims.w>=64?68:dims.w>=32?46:28)*(dims.h/Math.max(dims.w,dims.h))*(0.70+hashRand(wx,wy,213)*0.78));
      const padB = isSheetDecor ? (dims.padBottom||0) : ((dims.padBottom||0)*(dims.w>=64?68:dims.w>=32?46:28)/Math.max(dims.w,dims.h));
      const atlasReg = !isSheetDecor ? window.EXT_TREES_ATLAS?.regions?.[tName] : null;
      const imgSrc = (atlasReg && window.EXT_TREES_ATLAS?.canvas) ? window.EXT_TREES_ATLAS.canvas : ext;
      const sx = atlasReg ? atlasReg.sx : (dims.sx !== undefined ? dims.sx : 0);
      const sy = atlasReg ? atlasReg.sy : (dims.sy !== undefined ? dims.sy : 0);
      const sw = atlasReg ? atlasReg.sw : (dims.sw !== undefined ? dims.sw : dims.w);
      const sh = atlasReg ? atlasReg.sh : (dims.sh !== undefined ? dims.sh : dims.h);
      const isAbyssDecor = (wx > 700000 && wx < 900000) || bn === 'abyss' || (typeof sprite === 'string' && sprite.startsWith('abyss_'));
      const isSoftFlora = isAbyssDecor && (sprite === 'abyss_d2_kelp' || sprite === 'abyss_d1_anemone' || sprite === 'abyss_d1_tubes');
      const decorType = /crystal/i.test(sprite) ? 'crystal' : (/rock|rpck|stone|skull|scull|skeleton|statue|idol|totem|grave/i.test(sprite) ? 'rock' : (/mushroom|spore/i.test(sprite) ? 'mushroom' : 'bush'));
      const dx = Math.round(tx*TILE+(TILE-dw)/2), dy = Math.round(ty*TILE+TILE-dh+padB-3);
      const canBake = !isSoftFlora && !isInsideMtn && dx >= 0 && dy >= 0 && (dx + dw) <= CHUNK_PX && (dy + dh) <= CHUNK_PX && (imgSrc === window.EXT_TREES_ATLAS?.canvas || (imgSrc.complete && imgSrc.naturalWidth > 0));
      if (canBake) {
        ccx.drawImage(imgSrc, sx, sy, sw, sh, dx, dy, dw, dh);
        bakedDecor.push({img:imgSrc,sx,sy,sw,sh,x:dx,y:dy,dw,dh,sprite,decorType,wx,wy,detached:false});
      } else {
        decor.push({img:imgSrc,sx,sy,sw,sh,x:dx,y:dy,dw,dh,isAbyss:isAbyssDecor,isSoftFlora,sprite,decorType,wx,wy});
      }
      continue;
    }
    if(window.DREAM_BIOME_SHEET?.regions?.[sprite] && window.DREAM_BIOME_IMG){
      const reg = window.DREAM_BIOME_SHEET.regions[sprite];
      const dw = Math.round(reg.w * (0.65 + hashRand(wx,wy,213)*0.35));
      const dh = Math.round(reg.h * (0.65 + hashRand(wx,wy,213)*0.35));
      const decorType = /crystal/i.test(sprite) ? 'crystal' : (/rock|stone|totem/i.test(sprite) ? 'rock' : (/mushroom|spore/i.test(sprite) ? 'mushroom' : 'bush'));
      decor.push({img:window.DREAM_BIOME_IMG,sx:reg.x,sy:reg.y,sw:reg.w,sh:reg.h,x:Math.round(tx*TILE+(TILE-dw)/2),y:Math.round(ty*TILE+TILE-dh-3),dw,dh,isAbyss:false,isSoftFlora:false,sprite,decorType,wx,wy});
      continue;
    }
    const r=ATLAS.regions[sprite];if(!r)continue;
    const scale=/mushroom|flower/i.test(sprite)?1+hashRand(wx,wy,213)*.45:2.4+hashRand(wx,wy,213)*1.5,dw=Math.round(r.w*scale),dh=Math.round(r.h*scale);
    const isAbyssDecor = (wx > 700000 && wx < 900000) || bn === 'abyss' || (typeof sprite === 'string' && sprite.startsWith('abyss_'));
    const decorType = /crystal/i.test(sprite) ? 'crystal' : (/rock|rpck|stone|skull|scull|skeleton|statue|idol|totem|grave/i.test(sprite) ? 'rock' : (/mushroom|spore/i.test(sprite) ? 'mushroom' : 'bush'));
    const dx2 = Math.round(tx*TILE+(TILE-dw)/2), dy2 = Math.round(ty*TILE+TILE-dh-3);
    if (!isInsideMtn && dx2 >= 0 && dy2 >= 0 && (dx2 + dw) <= CHUNK_PX && (dy2 + dh) <= CHUNK_PX) {
      ccx.drawImage(ATLAS.canvas, r.x, r.y, r.w, r.h, dx2, dy2, dw, dh);
      bakedDecor.push({img:ATLAS.canvas,sx:r.x,sy:r.y,sw:r.w,sh:r.h,x:dx2,y:dy2,dw,dh,sprite,decorType,wx,wy,detached:false});
    } else {
      decor.push({img:ATLAS.canvas,sx:r.x,sy:r.y,sw:r.w,sh:r.h,x:dx2,y:dy2,dw,dh,isAbyss:isAbyssDecor,isSoftFlora:false,sprite,decorType,wx,wy});
    }
  }
  // Create roof canvas for dwarfCity only when inside dwarfCity bounds
  let roofCanvas = null;
  if (cityWalls.size > 0) {
    for(let ty=0;ty<CHUNK_SIZE;ty++)for(let tx=0;tx<CHUNK_SIZE;tx++){
      const wx=cx*CHUNK_SIZE+tx,wy=cy*CHUNK_SIZE+ty;
      const sx=tx*TILE,sy=ty*TILE;
      const isCity = (wx > 199940 && wx < 200060 && wy > 199940 && wy < 200060);
      if(isCity && !cityWalls.has(`${wx},${wy}`) && !window.brokenWalls.has(`${wx},${wy}`)) {
        // Check if surrounded by walls on all 4 sides
        const northWall = cityWalls.has(`${wx},${wy-1}`);
        const southWall = cityWalls.has(`${wx},${wy+1}`);
        const eastWall = cityWalls.has(`${wx+1},${wy}`);
        const westWall = cityWalls.has(`${wx-1},${wy}`);
        if(northWall && southWall && eastWall && westWall) {
          if (!roofCanvas) {
            roofCanvas = document.createElement('canvas');
            roofCanvas.width = CHUNK_PX;
            roofCanvas.height = CHUNK_PX;
            const rCtx = roofCanvas.getContext('2d');
            rCtx.imageSmoothingEnabled = false;
          }
          const roofCtx = roofCanvas.getContext('2d');
          cityRoofs.add(`${wx},${wy}`);
          roofCtx.fillStyle = '#5a5a62';
          roofCtx.fillRect(sx, sy, TILE, TILE);
          // Dark cross pattern
          roofCtx.fillStyle = '#3a3a44';
          roofCtx.fillRect(sx + 4, sy, TILE - 8, TILE);
          roofCtx.fillRect(sx, sy + 4, TILE, TILE - 8);
        }
      }
    }
  }
  let dominant='plains',max=0;
  for(const k in biomeCounts)if(biomeCounts[k]>max){max=biomeCounts[k];dominant=k;}
  // Final sanitation pass: Strip any relics, npcs, or tall props that overlap solid mountain rock
  if (relicSites && relicSites.length > 0) {
    for (let i = relicSites.length - 1; i >= 0; i--) {
      if (isMountainBlocked(relicSites[i].x - 16, relicSites[i].y - 16, 32, 32)) {
        relicSites.splice(i, 1);
      }
    }
  }
  if (npcSites && npcSites.length > 0) {
    for (let i = npcSites.length - 1; i >= 0; i--) {
      if (isMountainBlocked(npcSites[i].x - 16, npcSites[i].y - 16, 32, 32)) {
        npcSites.splice(i, 1);
      }
    }
  }
  if (tall && tall.length > 0) {
    for (let i = tall.length - 1; i >= 0; i--) {
      if (isMountainBlocked(tall[i].x - 20, tall[i].y - 20, 40, 40)) {
        tall.splice(i, 1);
      }
    }
  }

  if (typeof window !== 'undefined' && tall) {
    window.activeLifeWells = window.activeLifeWells || [];
    for (const t of tall) {
      if (t.featureType === 'lifeWell' && !window.activeLifeWells.some(w => w.x === t.x && w.y === t.y)) {
        window.activeLifeWells.push(t);
      }
    }
  }

  return{cx,cy,tiles,waterTiles,tall,decor,bakedDecor,relicSites,npcSites,canvas:cc,roofCanvas,cityRoofs,cityWalls,biome:dominant};
}

function redrawChunkBaseRegion(ch, rx, ry, rw, rh) {
  if (!ch || !ch.canvas) return;
  const ccx = ch.canvas.getContext('2d');
  if (!ccx) return;
  ccx.imageSmoothingEnabled = false;
  const minTx = Math.max(0, Math.floor(rx / TILE));
  const maxTx = Math.min(CHUNK_SIZE - 1, Math.floor((rx + rw) / TILE));
  const minTy = Math.max(0, Math.floor(ry / TILE));
  const maxTy = Math.min(CHUNK_SIZE - 1, Math.floor((ry + rh) / TILE));
  const inUnderBox = ch.cx * CHUNK_SIZE > 100000 && ch.cx * CHUNK_SIZE < 300000 && ch.cy * CHUNK_SIZE > 100000 && ch.cy * CHUNK_SIZE < 300000;
  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      const wx = ch.cx * CHUNK_SIZE + tx;
      const wy = ch.cy * CHUNK_SIZE + ty;
      const sx = tx * TILE, sy = ty * TILE;
      const wl = ch.tiles[ty * CHUNK_SIZE + tx];
      const bn = biomeAt(wx, wy);
      const landColor = blendedTileColor(wx, wy);
      if (wl === 0) {
        if (bn === 'dream') {
          ccx.fillStyle = 'rgb(45, 25, 65)';
          ccx.fillRect(sx, sy, TILE, TILE);
          drawBiomeTexture(ccx, bn, sx, sy, wx, wy);
        } else if (bn === 'dwarfCity') {
          const spriteRegion = ATLAS.regions[BIOMES[bn].groundSprite];
          if (spriteRegion) ccx.drawImage(ATLAS.canvas, spriteRegion.x, spriteRegion.y, spriteRegion.w, spriteRegion.h, sx, sy, TILE, TILE);
          else { ccx.fillStyle = `rgb(${landColor[0]},${landColor[1]},${landColor[2]})`; ccx.fillRect(sx, sy, TILE, TILE); }
        } else {
          drawRichLandTile(ccx, bn, landColor, sx, sy, wx, wy);
          drawBiomeTexture(ccx, bn, sx, sy, wx, wy);
        }
        if (inUnderBox && getCaveTile(wx, wy - 1) && !window.brokenWalls?.has(`${wx},${wy - 1}`)) {
          const g = ccx.createLinearGradient(0, sy, 0, sy + 14);
          g.addColorStop(0, 'rgba(10,10,25,0.38)');
          g.addColorStop(1, 'rgba(10,10,25,0)');
          ccx.fillStyle = g;
          ccx.fillRect(sx, sy, TILE, 14);
        }
      } else {
        drawRichWaterTile(ccx, bn, landColor, wl, sx, sy, wx, wy);
      }
    }
  }
  if (ch.bakedDecor) {
    const tLeft = minTx * TILE, tTop = minTy * TILE;
    const tRight = (maxTx + 1) * TILE, tBottom = (maxTy + 1) * TILE;
    for (let i = 0; i < ch.bakedDecor.length; i++) {
      const bd = ch.bakedDecor[i];
      if (bd.detached) continue;
      if (bd.x + bd.dw > tLeft && bd.x < tRight && bd.y + bd.dh > tTop && bd.y < tBottom) {
        if (bd.img === ATLAS.canvas || bd.img === window.EXT_TREES_ATLAS?.canvas || (bd.img.complete && bd.img.naturalWidth > 0)) {
          ccx.drawImage(bd.img, bd.sx, bd.sy, bd.sw, bd.sh, bd.x, bd.y, bd.dw, bd.dh);
        }
      }
    }
  }
  if (maxTx === CHUNK_SIZE - 1) ccx.drawImage(ch.canvas, CHUNK_PX - 1, 0, 1, CHUNK_PX, CHUNK_PX, 0, 2, CHUNK_PX);
  if (maxTy === CHUNK_SIZE - 1) ccx.drawImage(ch.canvas, 0, CHUNK_PX - 1, CHUNK_PX + 2, 1, 0, CHUNK_PX, CHUNK_PX + 2, 2);
}

function detachBakedDecor(ch, d) {
  if (!ch || !d || d.detached) return false;
  d.detached = true;
  redrawChunkBaseRegion(ch, d.x, d.y, d.dw, d.dh);
  return true;
}

function rebakeDecorToChunk(ch, d) {
  if (!ch || !d || !d.detached || !ch.canvas) return;
  if (!chunks.has(chunkKey(ch.cx, ch.cy))) { d.detached = false; return; }
  d.detached = false;
  const ccx = ch.canvas.getContext('2d');
  if (!ccx) return;
  ccx.imageSmoothingEnabled = false;
  if (d.img === ATLAS.canvas || d.img === window.EXT_TREES_ATLAS?.canvas || (d.img.complete && d.img.naturalWidth > 0)) {
    ccx.drawImage(d.img, d.sx, d.sy, d.sw, d.sh, d.x, d.y, d.dw, d.dh);
  }
}
function getChunk(cx,cy){
  const k=chunkKey(cx,cy);let ch=chunks.get(k);
  if(!ch){ch=generateChunk(cx,cy);chunks.set(k,ch);}
  return ch;
}
function getVisibleChunks(){
  const minCX=Math.floor(camera.x/CHUNK_PX)-2,maxCX=Math.floor((camera.x+VW())/CHUNK_PX)+2;
  const minCY=Math.floor(camera.y/CHUNK_PX)-2,maxCY=Math.floor((camera.y+VH())/CHUNK_PX)+2;
  const visible=[];
  const shouldShowFarmer = hasRareRelicInInventory() || Boolean(campSave.hasGoldenEgg || (campSave.chickenCoins || 0) > 0 || (state.chickenCoins || 0) > 0 || (campSave.materials && campSave.materials.goldenEgg > 0) || (campSave.collectedTrophies && campSave.collectedTrophies.includes('goldenEgg')));
  for(let cy=minCY;cy<=maxCY;cy++)for(let cx=minCX;cx<=maxCX;cx++){
    const ch = getChunk(cx,cy);
    if (ch && ch.tall) {
      const shrine = ch.tall.find(t => t.featureType === 'chickenShrine');
      if (shrine) {
        if (!ch.npcSites) ch.npcSites = [];
        const hasFarmer = ch.npcSites.some(n => n.role === 'mad_farmer' || n.id === `npc_${shrine.tx + 2}_${shrine.ty}`);
        if (!hasFarmer) {
          ch.npcSites.push(createNpcInstance('mad_farmer', shrine.tx + 2, shrine.ty));
        }
      }
      const sunken = ch.tall.find(t => t.featureType === 'sunkenShrine');
      if (sunken) {
        if (!ch.npcSites) ch.npcSites = [];
        const hasCaelen = ch.npcSites.some(n => n.role === 'lost_traveler' || n.id === `npc_${sunken.tx + 2}_${sunken.ty}`);
        if (!hasCaelen) {
          ch.npcSites.push(createNpcInstance('lost_traveler', sunken.tx + 2, sunken.ty));
        }
      }
      if (state.chickenKingDefeated && cx * CHUNK_SIZE <= 950000 && (cx + 1) * CHUNK_SIZE > 950000 && cy * CHUNK_SIZE <= 950000 && (cy + 1) * CHUNK_SIZE > 950000) {
        if (!ch.tall.some(t => t.featureType === 'chickenReturnPortal')) {
          ch.tall.push({ x: 950000 * TILE + TILE / 2, y: 950000 * TILE + TILE, sprite: 'chicken_portal', scale: 1.0, isFeature: true, featureType: 'chickenReturnPortal', tx: 950000, ty: 950000 });
        }
      }
    }
    visible.push(ch);
  }
  return visible;
}
function tileAtWorld(wx,wy){
  const cx=Math.floor(wx/CHUNK_SIZE),cy=Math.floor(wy/CHUNK_SIZE);
  const ch=chunks.get(chunkKey(cx,cy));if(!ch)return 0;
  return ch.tiles[(wy-cy*CHUNK_SIZE)*CHUNK_SIZE+(wx-cx*CHUNK_SIZE)];
}

function cleanupChunks(){
  const pcx=Math.floor(player.x/CHUNK_PX),pcy=Math.floor(player.y/CHUNK_PX);
  const keepX=Math.max(9,Math.ceil((VW()/CHUNK_PX)*0.5)+4);
  const keepY=Math.max(9,Math.ceil((VH()/CHUNK_PX)*0.5)+4);
  const toDel=[];
  for(const[k,ch]of chunks)if(Math.abs(ch.cx-pcx)>keepX||Math.abs(ch.cy-pcy)>keepY)toDel.push(k);
  for(const k of toDel)chunks.delete(k);
}

function drawLightning(l){
  const a=l.life/l.maxLife;
  const now = performance.now();
  // High-frequency electric pulse
  const pulse1 = 0.75 + 0.25 * Math.sin(now / 22);
  const pulse2 = 0.8 + 0.2 * Math.sin(now / 35 + 1.2);

  // Main vertical bolt with semi-transparent cyan glow
  ctx.save();
  ctx.strokeStyle=`rgba(220,240,255,${Math.min(0.9, a * pulse1)})`;
  ctx.lineWidth=4;ctx.shadowColor='#87ceeb';ctx.shadowBlur=20;
  ctx.beginPath();
  for(let i=0;i<l.segs.length;i++){
    const s=l.segs[i];
    const sx=s.x-camera.x,sy=s.y-camera.y;
    if(i===0)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);
  }
  ctx.stroke();

  // Inner bright white electric core
  ctx.strokeStyle=`rgba(255,255,255,${Math.min(0.95, a * pulse2)})`;
  ctx.lineWidth=1.5;
  ctx.stroke();
  ctx.shadowBlur=0;
  ctx.restore();

  // Ground hit: light pulsing and semi-transparent
  const gx = l.x - camera.x, gy = l.y - camera.y;
  const groundAlpha = Math.max(0, Math.min(0.6, a * 0.55 * pulse1));
  const groundRad = 65 * (1 - a * 0.35);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // 1. Semi-transparent radial pulsing electric glow on the ground
  const grad = ctx.createRadialGradient(gx, gy, 2, gx, gy, groundRad);
  grad.addColorStop(0, `rgba(255, 255, 255, ${groundAlpha * 0.9})`);
  grad.addColorStop(0.25, `rgba(160, 225, 255, ${groundAlpha * 0.7})`);
  grad.addColorStop(0.6, `rgba(80, 180, 255, ${groundAlpha * 0.35})`);
  grad.addColorStop(1, 'rgba(30, 140, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(gx, gy, groundRad, 0, Math.PI * 2);
  ctx.fill();

  // 2. Pulsing concentric semi-transparent shockwave rings on the ground
  for (let ring = 0; ring < 3; ring++) {
    const ringProgress = ((1 - a) + ring * 0.3) % 1;
    const ringRadius = 14 + ringProgress * 55;
    const ringAlpha = (1 - ringProgress) * 0.45 * a * pulse2;
    ctx.strokeStyle = `rgba(180, 235, 255, ${ringAlpha})`;
    ctx.lineWidth = 1.5 + (1 - ringProgress) * 1.5;
    ctx.beginPath();
    ctx.arc(gx, gy, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. Mini electric ground discharge tendrils radiating along the ground
  const sparkCount = 5;
  const sparkLen = 22 + 10 * pulse1;
  ctx.strokeStyle = `rgba(225, 245, 255, ${groundAlpha * 0.8})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let k = 0; k < sparkCount; k++) {
    const angle = (k / sparkCount) * Math.PI * 2 + (now * 0.008);
    const midAngle = angle + (Math.sin(now * 0.02 + k) * 0.3);
    const mx = gx + Math.cos(midAngle) * (sparkLen * 0.5);
    const my = gy + Math.sin(midAngle) * (sparkLen * 0.35); // flatten for perspective
    const ex = gx + Math.cos(angle) * sparkLen;
    const ey = gy + Math.sin(angle) * (sparkLen * 0.7);
    ctx.moveTo(gx, gy);
    ctx.lineTo(mx, my);
    ctx.lineTo(ex, ey);
  }
  ctx.stroke();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════
// CELESTIAL BODY (SUN / MOON)
// ═══════════════════════════════════════════════════════════
const sunImg = new Image();
sunImg.src = 'assets/sun.webp';

const moonImg = new Image();
moonImg.src = 'assets/moon.webp';

const moonBloodCanvas = document.createElement('canvas');
function prepareBloodMoonCanvas(){
  if(!moonImg.complete || moonImg.naturalWidth === 0) return;
  const w = moonImg.naturalWidth, h = moonImg.naturalHeight;
  moonBloodCanvas.width = w;
  moonBloodCanvas.height = h;
  const bCtx = moonBloodCanvas.getContext('2d');
  bCtx.drawImage(moonImg, 0, 0);
  bCtx.globalCompositeOperation = 'source-atop';
  bCtx.fillStyle = 'rgba(235, 30, 45, 0.78)';
  bCtx.fillRect(0, 0, w, h);
}
moonImg.onload = prepareBloodMoonCanvas;
if(moonImg.complete && moonImg.naturalWidth > 0){
  prepareBloodMoonCanvas();
}

const sunGlowCanvas = document.createElement('canvas');
const moonGlowCanvas = document.createElement('canvas');
const bloodGlowCanvas = document.createElement('canvas');

function initCelestialGlow(c, r, g, b, alpha){
  c.width = 128;
  c.height = 128;
  const gCtx = c.getContext('2d');
  const rad = gCtx.createRadialGradient(64, 64, 6, 64, 64, 64);
  rad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
  rad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  gCtx.fillStyle = rad;
  gCtx.fillRect(0, 0, 128, 128);
}
initCelestialGlow(sunGlowCanvas, 255, 195, 45, 0.40);
initCelestialGlow(moonGlowCanvas, 160, 205, 255, 0.32);
initCelestialGlow(bloodGlowCanvas, 255, 30, 45, 0.55);

window.abyssBubbles = [];
for (let i = 0; i < 45; i++) {
  window.abyssBubbles.push({
    x: Math.random() * 2000,
    y: Math.random() * 1200,
    r: 1.5 + Math.random() * 3.5,
    speed: 0.7 + Math.random() * 1.6,
    wobble: Math.random() * Math.PI * 2,
    alpha: 0.25 + Math.random() * 0.45
  });
}

function drawCelestialBody(){
  const pTileX = Math.floor(player.x / TILE), pTileY = Math.floor(player.y / TILE);
  const isAbyss = (pTileX > 700000 && pTileX < 900000 && pTileY > 700000 && pTileY < 900000);
  const isUnderworld = (pTileX > 100000 && pTileX < 300000 && pTileY > 100000 && pTileY < 300000);
  const isVoid = (pTileX > 400000 && pTileY > 400000);
  const isChickenDim = (pTileX > 910000 && pTileX < 990000 && pTileY > 910000 && pTileY < 990000);
  if(isUnderworld || isVoid || isAbyss || isChickenDim || state.isInDream) return;

  const phase = (worldTime % DAY_LENGTH) / DAY_LENGTH;
  const isDay = (phase >= 0.2015 && phase < 0.7985);

  let progress = 0;
  if(isDay){
    progress = (phase - 0.2015) / 0.597;
  } else {
    progress = phase >= 0.7985 ? (phase - 0.7985) / 0.403 : (phase + 0.2015) / 0.403;
  }
  progress = Math.max(0, Math.min(1, progress));

  const alpha = Math.min(1, Math.min(progress / 0.06, (1 - progress) / 0.06));
  if(alpha <= 0) return;

  const viewW = VW(), viewH = VH();
  const bodyW = Math.max(420, Math.min(560, Math.round(viewW * 0.35)));
  const bodyH = Math.round(bodyW * (174 / 460));

  const marginX = bodyW * 0.35;
  const x = -marginX + progress * (viewW + marginX * 2 - bodyW);
  // Pinned directly to the top edge of the screen so the flat cut is never seen floating
  const y = 0;

  ctx.save();
  ctx.globalAlpha = alpha;

  const glowW = bodyW * 1.5;
  const glowH = bodyH * 2.2;
  const glowX = x + (bodyW - glowW) / 2;
  const glowY = -glowH * 0.35;

  if(isDay){
    if(sunImg.complete && sunImg.naturalWidth > 0){
      ctx.drawImage(sunGlowCanvas, glowX, glowY, glowW, glowH);
      ctx.drawImage(sunImg, Math.round(x), Math.round(y), bodyW, bodyH);
    }
  } else {
    if(moonImg.complete && moonImg.naturalWidth > 0){
      if(isBloodMoon){
        const bloodPulse = 0.85 + 0.15 * Math.sin(worldTime * 3);
        ctx.drawImage(bloodGlowCanvas, glowX, glowY, glowW * bloodPulse, glowH * bloodPulse);
        const activeMoon = (moonBloodCanvas.width > 0) ? moonBloodCanvas : moonImg;
        ctx.drawImage(activeMoon, Math.round(x), Math.round(y), bodyW, bodyH);
      } else {
        ctx.drawImage(moonGlowCanvas, glowX, glowY, glowW, glowH);
        ctx.drawImage(moonImg, Math.round(x), Math.round(y), bodyW, bodyH);
      }
    }
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════
// PARALLAX CLOUDS (SEAMLESS FULL-SCREEN SKY CANOPY)
// ═══════════════════════════════════════════════════════════
const cloudsImg = new Image();
cloudsImg.src = 'assets/clouds.webp';

const cloudsStormCanvas = document.createElement('canvas');
const cloudsRainCanvas = document.createElement('canvas');

function prepareCloudWeatherCanvases(){
  if(!cloudsImg.complete || cloudsImg.naturalWidth === 0) return;
  const w = cloudsImg.naturalWidth, h = cloudsImg.naturalHeight;

  // Storm canvas: dark, gloomy, thunderous tint
  cloudsStormCanvas.width = w;
  cloudsStormCanvas.height = h;
  const sCtx = cloudsStormCanvas.getContext('2d');
  sCtx.drawImage(cloudsImg, 0, 0);
  sCtx.globalCompositeOperation = 'source-atop';
  sCtx.fillStyle = 'rgba(28, 32, 48, 0.72)';
  sCtx.fillRect(0, 0, w, h);

  // Rain canvas: overcast slate-grey tint
  cloudsRainCanvas.width = w;
  cloudsRainCanvas.height = h;
  const rCtx = cloudsRainCanvas.getContext('2d');
  rCtx.drawImage(cloudsImg, 0, 0);
  rCtx.globalCompositeOperation = 'source-atop';
  rCtx.fillStyle = 'rgba(48, 58, 72, 0.50)';
  rCtx.fillRect(0, 0, w, h);
}
cloudsImg.onload = prepareCloudWeatherCanvases;
if(cloudsImg.complete && cloudsImg.naturalWidth > 0){
  prepareCloudWeatherCanvases();
}

let cloudWindBg = 0;
let cloudWindFg = 0;

function updateParallaxClouds(dt){
  // Continuous wind drift from right to left
  cloudWindBg += 8 * dt;   // Background wind speed: 8 px/sec
  cloudWindFg += 22 * dt;  // Foreground wind speed: 22 px/sec
  if(cloudWindBg > 1000000) cloudWindBg %= 1878;
  if(cloudWindFg > 1000000) cloudWindFg %= 1878;
}

const modFloat = (n, m) => ((n % m) + m) % m;

function drawParallaxClouds(){
  // Do not draw sky clouds underground, in the void, in the abyss, in the dream biome, or in the chicken dimension
  const pTileX = Math.floor(player.x / TILE), pTileY = Math.floor(player.y / TILE);
  const isAbyss = (pTileX > 700000 && pTileX < 900000 && pTileY > 700000 && pTileY < 900000);
  const isChickenDim = (pTileX > 910000 && pTileX < 990000 && pTileY > 910000 && pTileY < 990000);
  const isUnderworld = (pTileX > 100000 && pTileX < 300000 && pTileY > 100000 && pTileY < 300000);
  const isVoid = (pTileX > 400000 && pTileY > 400000);
  if(isUnderworld || isVoid || isAbyss || isChickenDim || state.isInDream) return;
  if(!cloudsImg.complete || cloudsImg.naturalWidth === 0) return;

  // Weather-specific texture and opacity
  let sourceImg = cloudsImg;
  let bgAlpha = 0.32;
  let fgAlpha = 0.65;

  if(weather.type === 'storm'){
    sourceImg = cloudsStormCanvas.width > 0 ? cloudsStormCanvas : cloudsImg;
    bgAlpha = 0.45;
    fgAlpha = 0.85;
  }else if(weather.type === 'rain'){
    sourceImg = cloudsRainCanvas.width > 0 ? cloudsRainCanvas : cloudsImg;
    bgAlpha = 0.38;
    fgAlpha = 0.75;
  }

  const viewW = VW(), viewH = VH();
  const rawW = cloudsImg.naturalWidth || 1878;
  const rawH = cloudsImg.naturalHeight || 177;

  // 1. Background Layer: slower wind, higher up, gentle opacity, subtle camera parallax
  const bgScale = 0.95;
  const bgW = Math.round(rawW * bgScale);
  const bgH = Math.round(rawH * bgScale);
  const bgParallax = 0.15;
  const bgTotalX = cloudWindBg + camera.x * bgParallax;
  const bgStartX = -modFloat(bgTotalX, bgW);

  ctx.globalAlpha = bgAlpha;
  for(let x = bgStartX; x < viewW; x += bgW){
    ctx.drawImage(sourceImg, 0, 0, rawW, rawH, Math.round(x), 0, bgW, bgH);
  }

  // 2. Foreground Layer: faster wind, slightly larger & lower, higher opacity, offset peaks
  const fgScale = 1.15;
  const fgW = Math.round(rawW * fgScale);
  const fgH = Math.round(rawH * fgScale);
  const fgParallax = 0.32;
  // Offset by half image width so foreground peaks don't line up with background peaks
  const fgTotalX = cloudWindFg + camera.x * fgParallax + fgW * 0.5;
  const fgStartX = -modFloat(fgTotalX, fgW);

  ctx.globalAlpha = fgAlpha;
  for(let x = fgStartX; x < viewW; x += fgW){
    ctx.drawImage(sourceImg, 0, 0, rawW, rawH, Math.round(x), 15, fgW, fgH);
  }

  ctx.globalAlpha = 1.0;
}

const floodTileQueue=[];
const floodQueuedTiles=new Set();
const dirtyChunks=new Set();

function scanFloodTiles(){
  const pcx=Math.floor(player.x/CHUNK_PX);
  const pcy=Math.floor(player.y/CHUNK_PX);
  const scanRadius=6;
  let added=false;
  for(let dy=-scanRadius;dy<=scanRadius;dy++){
    for(let dx=-scanRadius;dx<=scanRadius;dx++){
      const ch=chunks.get(chunkKey(pcx+dx,pcy+dy));
      if(!ch) continue;
      for(let ty=0;ty<CHUNK_SIZE;ty++){
        for(let tx=0;tx<CHUNK_SIZE;tx++){
          const wx=ch.cx*CHUNK_SIZE+tx, wy=ch.cy*CHUNK_SIZE+ty;
          const key=`${wx},${wy}`;
          if(floodQueuedTiles.has(key)) continue;

          const bn=biomeAt(wx,wy);
          const isChickenTile=(wx>910000&&wx<990000&&wy>910000&&wy<990000);
          const targetWl=(bn==='snow'||bn==='dwarfCity'||bn==='dream'||isChickenTile||(wx>550000&&wx<650000)||(wx>700000&&wx<900000)||(wx>100000&&wx<300000))?0:waterLevelAt(wx,wy,floodBoost);
          const currentWl=ch.tiles[ty*CHUNK_SIZE+tx];
          if(targetWl!==currentWl){
            floodQueuedTiles.add(key);
            const distSq=(wx*TILE+TILE/2-player.x)**2+(wy*TILE+TILE/2-player.y)**2;
            floodTileQueue.push({ch,tx,ty,wx,wy,targetWl,bn,distSq});
            added=true;
          }
        }
      }
    }
  }
  if(added){
    floodTileQueue.sort((a,b)=>a.distSq-b.distSq);
  }
}

function updateTileOnChunkCanvas(ch,tx,ty,wx,wy,wl,bn){
  if(!ch||!ch.canvas) return;
  const ccx=ch.canvas.getContext('2d');
  const sx=tx*TILE, sy=ty*TILE;
  const landColor=blendedTileColor(wx,wy);
  ccx.clearRect(sx,sy,TILE,TILE);
  if(wl===0){
    if(bn==='dwarfCity'){
      const spriteRegion=ATLAS.regions[BIOMES[bn].groundSprite];
      if(spriteRegion){
        ccx.drawImage(ATLAS.canvas,spriteRegion.x,spriteRegion.y,spriteRegion.w,spriteRegion.h,sx,sy,TILE,TILE);
      }else{
        ccx.fillStyle=`rgb(${landColor[0]},${landColor[1]},${landColor[2]})`;
        ccx.fillRect(sx,sy,TILE,TILE);
      }
    }else{
      drawRichLandTile(ccx,bn,landColor,sx,sy,wx,wy);
      drawBiomeTexture(ccx,bn,sx,sy,wx,wy);
    }
  }else{
    drawRichWaterTile(ccx,bn,landColor,wl,sx,sy,wx,wy);
  }
}

function redrawChunkCanvas(ch){
  const cc=ch.canvas;
  if(!cc) return;
  const ccx=cc.getContext('2d');
  ccx.imageSmoothingEnabled=false;
  ccx.clearRect(0,0,cc.width,cc.height);

  for(let ty=0;ty<CHUNK_SIZE;ty++){
    for(let tx=0;tx<CHUNK_SIZE;tx++){
      const wx=ch.cx*CHUNK_SIZE+tx, wy=ch.cy*CHUNK_SIZE+ty;
      const sx=tx*TILE, sy=ty*TILE;
      const wl=ch.tiles[ty*CHUNK_SIZE+tx];
      const bn=biomeAt(wx,wy);
      const landColor=blendedTileColor(wx,wy);
      if(wl===0){
        if(bn==='dwarfCity'){
          const spriteRegion=ATLAS.regions[BIOMES[bn].groundSprite];
          if(spriteRegion){
            ccx.drawImage(ATLAS.canvas,spriteRegion.x,spriteRegion.y,spriteRegion.w,spriteRegion.h,sx,sy,TILE,TILE);
          }else{
            ccx.fillStyle=`rgb(${landColor[0]},${landColor[1]},${landColor[2]})`;
            ccx.fillRect(sx,sy,TILE,TILE);
          }
        }else{
          drawRichLandTile(ccx,bn,landColor,sx,sy,wx,wy);
          drawBiomeTexture(ccx,bn,sx,sy,wx,wy);
        }
      }else{
        drawRichWaterTile(ccx,bn,landColor,wl,sx,sy,wx,wy);
      }
      if(ch.cityWalls&&ch.cityWalls.has(`${wx},${wy}`)){
        ccx.fillStyle='#3a3a44';
        ccx.fillRect(sx,sy,TILE,TILE);
        ccx.fillStyle='#6a6a72';
        ccx.fillRect(sx,sy,TILE,3);
        ccx.fillStyle='#1a1a24';
        ccx.fillRect(sx,sy+TILE-3,TILE,3);
        ccx.fillStyle='#2a2a32';
        for(let by=8;by<TILE;by+=8){
          ccx.fillRect(sx,sy+by,TILE,1);
        }
      }
    }
  }
  if (ch.bakedDecor) { for (const bd of ch.bakedDecor) { if (bd.x >= 0 && bd.y >= 0 && ch.tiles[Math.floor((bd.y + bd.dh * 0.5) / TILE) * CHUNK_SIZE + Math.floor((bd.x + bd.dw * 0.5) / TILE)] === 0) ccx.drawImage(bd.img, bd.sx, bd.sy, bd.sw, bd.sh, bd.x, bd.y, bd.dw, bd.dh); } }
  // Extrude right and bottom 1px edge by 2px so adjacent chunks overlap seamlessly without #0b0b12 grid lines
  ccx.drawImage(cc,CHUNK_PX-1,0,1,CHUNK_PX,CHUNK_PX,0,2,CHUNK_PX);
  ccx.drawImage(cc,0,CHUNK_PX-1,CHUNK_PX+2,1,0,CHUNK_PX,CHUNK_PX+2,2);
}

const fires=new Map();
const FIRE_MAX=1.8;
const FIRE_SPREAD=2.5;
const FIRE_DPS=16;
const FIRE_SPREAD_CHANCE=0.03;
const MAX_ACTIVE_FIRES=16;
const FIRE_PARTICLE_RATE=0.04;
const burningTrees=new Map(); // key `${tx},${ty}` → {x,y,life,maxLife,wood}
const woodPickups=[];

function igniteTile(wx,wy){
  const key=wx+','+wy;
  if(fires.has(key))return;
  if(fires.size>=MAX_ACTIVE_FIRES)return;
  if(tileAtWorld(wx,wy)!==0)return;
  fires.set(key,{wx,wy,life:FIRE_MAX,spreadTimer:FIRE_SPREAD});
  // Check for trees in this tile
  const cx=Math.floor(wx/CHUNK_SIZE),cy=Math.floor(wy/CHUNK_SIZE);
  const ch=chunks.get(chunkKey(cx,cy));
  if(ch){
    for(const t of ch.tall){
      if(t.tx===wx&&t.ty===wy){
        const tkey=t.tx+','+t.ty;
        if(!burningTrees.has(tkey)){
          burningTrees.set(tkey,{x:t.x,y:t.y,life:4,maxLife:4,tx:t.tx,ty:t.ty,sprite:t.sprite});
          // Remove from chunk's tall array
          const idx=ch.tall.indexOf(t);
          if(idx>=0)ch.tall.splice(idx,1);
        }
      }
    }
  }
}

function findCampSpawn(biome, nearBorder = false){
  if(!biome) return {x: 100, y: 100};
  if(biome === 'dream') return {x: 600000 * TILE, y: 600000 * TILE};
  if(biome === 'abyss') return {x: 750000 * TILE, y: 750000 * TILE};
  if(biome === 'dimensionX') return {x: 400500 * TILE, y: 400500 * TILE};
  if(biome === 'dwarfCity') return {x: 200000 * TILE, y: 200000 * TILE};
  if(biome === 'undergroundCave') return {x: 200026 * TILE, y: 200023 * TILE};

  const step = CHUNK_PX * 2;
  const deepCheck = (x, y, radiusTiles = 100) => {
    const wx = Math.floor(x / TILE);
    const wy = Math.floor(y / TILE);
    if (biomeAt(wx, wy) !== biome) return false;
    const r = radiusTiles;
    const diag = Math.round(r * 0.707);
    return biomeAt(wx - r, wy) === biome &&
           biomeAt(wx + r, wy) === biome &&
           biomeAt(wx, wy - r) === biome &&
           biomeAt(wx, wy + r) === biome &&
           biomeAt(wx - diag, wy - diag) === biome &&
           biomeAt(wx + diag, wy + diag) === biome &&
           biomeAt(wx - diag, wy + diag) === biome &&
           biomeAt(wx + diag, wy - diag) === biome;
  };
  const borderCheck = (x, y) => {
    const wx = Math.floor(x / TILE);
    const wy = Math.floor(y / TILE);
    if (biomeAt(wx, wy) !== biome) return false;
    return biomeAt(wx - 12, wy) !== biome ||
           biomeAt(wx + 12, wy) !== biome ||
           biomeAt(wx, wy - 12) !== biome ||
           biomeAt(wx, wy + 12) !== biome;
  };

  if (nearBorder) {
    for (let radius = 0; radius <= 200; radius++) {
      for (let offsetX = -radius; offsetX <= radius; offsetX++) {
        for (const offsetY of radius === 0 ? [0] : [-radius, radius]) {
          const x = 100 + offsetX * step, y = 100 + offsetY * step;
          if (borderCheck(x, y)) return { x, y };
        }
      }
      for (let offsetY = -radius + 1; offsetY < radius; offsetY++) {
        for (const offsetX of [-radius, radius]) {
          const x = 100 + offsetX * step, y = 100 + offsetY * step;
          if (borderCheck(x, y)) return { x, y };
        }
      }
    }
  }

  // 1. Search for 100-tile deep spot (Normal Run default)
  for (let radius = 0; radius <= 200; radius++) {
    for (let offsetX = -radius; offsetX <= radius; offsetX++) {
      for (const offsetY of radius === 0 ? [0] : [-radius, radius]) {
        const x = 100 + offsetX * step, y = 100 + offsetY * step;
        if (deepCheck(x, y, 100)) return { x, y };
      }
    }
    for (let offsetY = -radius + 1; offsetY < radius; offsetY++) {
      for (const offsetX of [-radius, radius]) {
        const x = 100 + offsetX * step, y = 100 + offsetY * step;
        if (deepCheck(x, y, 100)) return { x, y };
      }
    }
  }

  // 2. Fallback to 40-tile deep spot (for narrower biomes like badlands)
  for (let radius = 0; radius <= 200; radius++) {
    for (let offsetX = -radius; offsetX <= radius; offsetX++) {
      for (const offsetY of radius === 0 ? [0] : [-radius, radius]) {
        const x = 100 + offsetX * step, y = 100 + offsetY * step;
        if (deepCheck(x, y, 40)) return { x, y };
      }
    }
    for (let offsetY = -radius + 1; offsetY < radius; offsetY++) {
      for (const offsetX of [-radius, radius]) {
        const x = 100 + offsetX * step, y = 100 + offsetY * step;
        if (deepCheck(x, y, 40)) return { x, y };
      }
    }
  }

  // 3. Fallback to any spot inside the requested biome
  for (let radius = 0; radius <= 200; radius++) {
    for (let offsetX = -radius; offsetX <= radius; offsetX++) {
      for (const offsetY of radius === 0 ? [0] : [-radius, radius]) {
        const x = 100 + offsetX * step, y = 100 + offsetY * step;
        const wx = Math.floor(x / TILE), wy = Math.floor(y / TILE);
        if (biomeAt(wx, wy) === biome) return { x, y };
      }
    }
  }

  return { x: 100, y: 100 };
}

export { makeLiquidFrames, LIQUIDS, chunks, chunkKey, surfaceWaterLevelAt, clampByte, drawRichLandTile, drawBiomeTexture, drawRichWaterTile, generateChunk, getChunk, getVisibleChunks, tileAtWorld, cleanupChunks, detachBakedDecor, rebakeDecorToChunk, drawLightning, sunImg, moonImg, moonBloodCanvas, prepareBloodMoonCanvas, sunGlowCanvas, moonGlowCanvas, bloodGlowCanvas, initCelestialGlow, drawCelestialBody, cloudsImg, cloudsStormCanvas, cloudsRainCanvas, prepareCloudWeatherCanvases, cloudWindBg, cloudWindFg, updateParallaxClouds, modFloat, drawParallaxClouds, floodTileQueue, floodQueuedTiles, dirtyChunks, scanFloodTiles, updateTileOnChunkCanvas, redrawChunkCanvas, fires, FIRE_MAX, FIRE_SPREAD, FIRE_DPS, FIRE_SPREAD_CHANCE, MAX_ACTIVE_FIRES, FIRE_PARTICLE_RATE, burningTrees, woodPickups, igniteTile, findCampSpawn, getCanonicalChickenShrineChunk, getCanonicalSunkenShrineChunk };
