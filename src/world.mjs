// v95
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
function makePerlin(seed){
  const rand=mulberry32(seed);const p=new Uint8Array(256);
  for(let i=0;i<256;i++)p[i]=i;
  for(let i=255;i>0;i--){const j=Math.floor(rand()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
  const perm=new Uint8Array(512);
  for(let i=0;i<512;i++)perm[i]=p[i&255];
  const fade=t=>t*t*t*(t*(t*6-15)+10);
  const lerpF=(a,b,t)=>a+t*(b-a);
  const grad=(h,x,y)=>{switch(h&3){case 0:return x+y;case 1:return -x+y;case 2:return x-y;default:return -x-y;}};
  return (x,y)=>{
    const X=Math.floor(x)&255,Y=Math.floor(y)&255;
    x-=Math.floor(x);y-=Math.floor(y);
    const u=fade(x),v=fade(y);
    const A=perm[X]+Y,B=perm[X+1]+Y;
    return lerpF(lerpF(grad(perm[A],x,y),grad(perm[B],x-1,y),u),lerpF(grad(perm[A+1],x,y-1),grad(perm[B+1],x-1,y-1),u),v);
  };
}

function getStoredWorldSeed(){
  try {
    const saved = localStorage.getItem('pixelvivor.worldSeed');
    if(saved && !isNaN(Number(saved))) return Number(saved);
  }catch(e){}
  const fresh = Math.floor(Math.random() * 900000) + 100000;
  try { localStorage.setItem('pixelvivor.worldSeed', String(fresh)); }catch(e){}
  return fresh;
}

let SEED = getStoredWorldSeed();
let biomeNoise = makePerlin(SEED);
let waterNoise = makePerlin(SEED + 7);

export function getWorldSeed(){ return SEED; }
export function setWorldSeed(seed){
  SEED = Number(seed) || 12345;
  try { localStorage.setItem('pixelvivor.worldSeed', String(SEED)); }catch(e){}
  biomeNoise = makePerlin(SEED);
  waterNoise = makePerlin(SEED + 7);
}

export function hashRand(x,y,seed){let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(((seed ^ SEED)|0),314159265);h=Math.imul(h^(h>>>13),1274126177);h=Math.imul(h^(h>>>15),1812433253);return((h^(h>>>16))>>>0)/4294967296;}
export const smoothstep=t=>t*t*(3-2*t);
export const lerp=(a,b,t)=>a+t*(b-a);

export const BIOMES={
    abyss:{
      name:'The Abyss',decorChance:.07,treeChance:.16,
      treeSprites:[
        'abyss_st_mermaid1','abyss_st_siren','abyss_st_triton',
        'abyss_st_mermaid2','abyss_st_maiden','abyss_st_crystal',
        'abyss_rf1_spire','abyss_rf1_tiered','abyss_rf1_cauldron',
        'abyss_rf1_arch','abyss_rf1_pillar','abyss_rf1_crystals',
        'abyss_rf2_sponge','abyss_rf2_pointed','abyss_rf2_plateau',
        'abyss_rf2_arch2','abyss_rf2_purple','abyss_rf2_shelf',
        'abyss_sunken_ship'
      ],
      landmarks:['abyss_hole_pit1','abyss_hole_pit2','abyss_hole_pit3'],
      treeScale:[1.0,1.0],
      decorSprites:[
        'abyss_d1_shell','abyss_d1_throne','abyss_d1_arch','abyss_d1_trident',
        'abyss_d1_bell','abyss_d1_anemone','abyss_d1_vase','abyss_d1_chest',
        'abyss_d1_skull','abyss_d1_tubes','abyss_d1_stairs','abyss_d1_obelisk',
        'abyss_d2_coral_blue','abyss_d2_coral_pink','abyss_d2_kelp','abyss_d2_wreck_sm',
        'abyss_d2_anchor','abyss_d2_pillar','abyss_d2_clam','abyss_d2_shrooms',
        'abyss_d2_ribs','abyss_d2_urchin','abyss_d2_moss_chest','abyss_d2_face_relic'
      ],
      groundSprite: 'tile_abyss'
    },
    dimensionX:{
      name:'The Void',decorChance:.08,treeChance:.10,
      treeSprites:['Crystal_Violet_crystal1','Crystal_Black_crystal1','Crystal_Pink_crystal1','Crystal_Dark_red_crystal1','CaveObj_256_Dark_totem1','CaveObj_128_Dark_totem2','CaveObj_128_Dark_totem3','CaveObj_128_Building2','CaveObj_128_magic_circle2','CaveObj_256_centipede2'],
      treeScale:[1.7,2.1],
      decorSprites:['Crystal_Violet_crystal2','Crystal_Violet_crystal3','Crystal_Black_crystal2','Crystal_Black_crystal3','Crystal_Pink_crystal3','CaveObj_64_Dark_totem5','CaveObj_64_white_crystal1'],
      groundSprite: 'tile_void'
    },
    undergroundCave:{name:'The Depths',decorChance:.80,treeChance:.92,treeSprites:['rpg_boulder','rock1','rock2'],treeScale:[4,7],decorSprites:['mushroom','rpg_mushroom_glow','rpg_crystal_purple'], groundSprite: 'tile_cave'},
    dwarfCity:{name:'Corrupted Dwarf City',decorChance:.40,treeChance:.60,treeSprites:['ruinGate','rpg_tower','rpg_obelisk'],treeScale:[5,8],decorSprites:['rock1'], groundSprite: 'tile_cave'},
    plains:{
      name:'Plains',decorChance:.09,treeChance:.14,
      treeSprites:['Tree1','Tree2','Tree3','Fruit_tree1','Fruit_tree2','Fruit_tree3','Autumn_tree1','Autumn_tree2','Forest_Curved_tree1','Forest_Willow2','Rock1_1','Rock4_1','CaveObj_64_caveman_statue1','Bush_orange_flowers1','Bush_red_flowers1'],
      treeScale:[1.8,2.2],
      decorSprites:['Bush_simple1_1','Bush_simple1_2','Bush_simple2_1','Bush_orange_flowers2','Bush_orange_flowers3','Bush_red_flowers2','Bush_Autumn_bush2','Rock4_3','Rock4_4','Rock1_4','Rock1_5','Forest_Chanterelles1','grassTuft','flower1'],
      groundSprite: 'tile_plains'
    },
    forest:{
      name:'Forest',decorChance:.14,treeChance:.22,
      treeSprites:['Forest_Mega_tree1','Forest_Mega_tree2','Forest_Curved_tree1','Forest_Curved_tree2','Forest_Curved_tree3','Forest_Swirling_tree1','Forest_Swirling_tree2','Forest_Willow1','Forest_Willow2','Forest_Ent_man','Forest_Ent_woman','Forest_Tree_idol_deer','Forest_Tree_idol_wolf','Tree1','Christmas_tree1','Moss_tree1','Rock4_1','Rock4_2','CaveObj_64_caveman_statue2','Bush_Fern1_1','Bush_Fern2_1'],
      treeScale:[1.8,2.2],
      decorSprites:['Bush_Fern1_2','Bush_Fern1_3','Bush_Fern2_2','Bush_Fern2_3','Bush_simple1_1','Bush_simple2_2','Bush_red_flowers2','Forest_White_red_mushroom2','Forest_White_red_mushroom3','Forest_Beige_green_mushroom3','Forest_Chanterelles1','Forest_Chanterelles2','Rock4_3','Rock4_4','Rock4_5'],
      groundSprite: 'tile_forest'
    },
    magicForest:{
      name:'Enchanted Forest',decorChance:.14,treeChance:.22,
      treeSprites:['Forest_Luminous_tree1','Forest_Luminous_tree2','Forest_Luminous_tree3','Forest_Luminous_tree4','Forest_Light_balls_tree1','Forest_Light_balls_tree2','Forest_Light_balls_tree3','Forest_Blue_green_balls_tree1','Forest_Blue_green_balls_tree2','Forest_Living_gazebo1','Forest_Living_gazebo2','Forest_Tree_idol_dragon','Forest_Tree_idol_human','Flower_tree1','Flower_tree2','Crystal_Pink_crystal1','Crystal_Violet_crystal1','CaveObj_128_mushroom21','Bush_blue_flowers1','Bush_pink_flowers1'],
      treeScale:[1.8,2.2],
      decorSprites:['Bush_blue_flowers2','Bush_blue_flowers3','Bush_pink_flowers2','Bush_pink_flowers3','Bush_Fern1_2','Crystal_Pink_crystal2','Crystal_Pink_crystal3','Crystal_Violet_crystal2','Crystal_Violet_crystal3','CaveObj_64_mushroom11','CaveObj_64_mushroom22','Forest_Blue_green_balls_tree3','Forest_Chanterelles3'],
      groundSprite: 'tile_magicForest'
    },
    desert:{
      name:'Desert',decorChance:.08,treeChance:.14,
      treeSprites:['Palm_tree1_1','Palm_tree1_2','Palm_tree1_3','Palm_tree2_1','Palm_tree2_2','Bush_Cactus2_1','Rock1_1','Rock1_2','Rock6_1','Rock6_2','CaveObj_128_Beige_rpck1','CaveObj_256_Dinosaur_skeleton_full','CaveObj_128_Dinosaur_skeleton_part1','CaveObj_128_Dinosaur_skeleton_part2','CaveObj_64_Beige_rpck2'],
      treeScale:[1.8,2.2],
      decorSprites:['Bush_Cactus1_1','Bush_Cactus1_2','Bush_Cactus1_3','Bush_Cactus2_2','Bush_Cactus2_3','Rock1_3','Rock1_4','Rock1_5','Rock6_3','Rock6_4','Rock6_5','CaveObj_64_Beige_rpck3','CaveObj_64_Dinosaur_skeleton__head','CaveObj_32_Human_skeleton','Crystal_Yellow_crystal3'],
      groundSprite: 'tile_desert'
    },
    snow:{
      name:'Snowfield',decorChance:.10,treeChance:.20,
      treeSprites:['Snow_christmass_tree1','Snow_christmass_tree2','Snow_tree1','Snow_tree2','Snow_tree3','Forest_White_tree1','Forest_White_tree2','Rock3_1','Rock3_2','Rock_Rokc3_snow_shadow_dark1','Rock_Rokc3_snow_shadow_dark2','Rock5_1','Rock5_2','Crystal_White_crystal1','Crystal_Blue_crystal1','CaveObj_128_white_crystal2','Bush_Snow_bush1'],
      treeScale:[1.8,2.2],
      decorSprites:['Bush_Snow_bush2','Bush_Snow_bush3','Rock3_3','Rock3_4','Rock3_5','Rock_Rokc3_snow_shadow_dark3','Rock_Rokc3_snow_shadow_dark4','Rock5_3','Rock5_4','Crystal_White_crystal2','Crystal_White_crystal3','Crystal_Blue_crystal3','CaveObj_64_white_crystal1','CaveObj_32_white_crystal3'],
      groundSprite: 'tile_snow'
    },
    swamp:{
      name:'Swamp',decorChance:.12,treeChance:.18,
      treeSprites:['Forest_Willow1','Forest_Willow2','Forest_Willow3','Forest_Swirling_tree1','Forest_Swirling_tree2','Moss_tree1','Moss_tree2','Moss_tree3','CaveObj_128_cocoon_web','CaveObj_128_mushroom31','CaveObj_64_caveman_statue1','CaveObj_64_caveman_statue2','CaveObj_128_Dark_totem3','Rock4_2','Rock7_1','Bush_Fern1_1','Bush_Fern2_1'],
      treeScale:[1.8,2.2],
      decorSprites:['Bush_Fern1_2','Bush_Fern2_2','Bush_simple2_1','Bush_simple2_2','CaveObj_64_mushroom41','CaveObj_64_mushroom42','CaveObj_32_mushroom43','Crystal_Green_crystal2','Crystal_Green_crystal3','Rock4_4','Rock7_3','Rock7_4','CaveObj_32_Human_skeleton'],
      groundSprite: 'tile_swamp'
    },
    volcano:{
      name:'Volcano',decorChance:.08,treeChance:.14,
      treeSprites:['Rock8_1','Rock8_2','Burned_tree1','Burned_tree2','Burned_tree3','Crystal_Red_crystal1','Crystal_Dark_red_crystal1','Crystal_Black_crystal1','Crystal_Yellow_crystal1','CaveObj_128_Demon_scull','CaveObj_128_Building2','CaveObj_128_Dark_totem2','CaveObj_128_magic_circle'],
      treeScale:[1.8,2.2],
      decorSprites:['Rock8_3','Rock8_4','Rock8_5','Crystal_Red_crystal2','Crystal_Red_crystal3','Crystal_Dark_red_crystal2','Crystal_Black_crystal2','Crystal_Yellow_crystal2','Bush_Burned_tree1','Bush_Burned_tree2','CaveObj_64_Bonefire','CaveObj_64_Dark_totem5','CaveObj_32_Human_skeleton'],
      groundSprite: 'tile_volcano'
    },
    crystalWastes:{
      name:'Crystal Wastes',decorChance:.10,treeChance:.15,
      treeSprites:['Crystal_Blue_crystal1','Crystal_Violet_crystal1','Crystal_Pink_crystal1','Crystal_White_crystal1','CaveObj_256_white_crystal1','CaveObj_128_white_crystal2','CaveObj_128_white_crystal3','CaveObj_128_white_crystal4','CaveObj_64_Blue_green_crystal1','CaveObj_64_crystal_blue_green_vertical1','CaveObj_64_white_crystal_vertical1','Rock5_1','Rock5_2','Forest_White_tree1','Snow_tree2'],
      treeScale:[1.7,2.1],
      decorSprites:['Crystal_Blue_crystal2','Crystal_Blue_crystal3','Crystal_Violet_crystal2','Crystal_Violet_crystal3','Crystal_Pink_crystal2','Crystal_Pink_crystal3','Crystal_White_crystal2','Crystal_White_crystal3','CaveObj_64_white_crystal1','CaveObj_64_white_crystal2','CaveObj_64_Blue_green_crystal2','CaveObj_32_Blue_green_crystal3','Rock5_3','Rock5_4','Bush_Snow_bush2'],
      groundSprite: 'tile_crystal'
    },
    fungalWastes:{
      name:'Fungal Wastes',decorChance:.12,treeChance:.16,
      treeSprites:['Forest_Beige_green_mushroom1','Forest_White_red_mushroom1','CaveObj_128_mushroom21','CaveObj_128_mushroom31','CaveObj_128_mushroom32','CaveObj_128_cocoon_web','Forest_Light_balls_tree1','Forest_Blue_green_balls_tree1','Moss_tree1','Moss_tree2','Crystal_Green_crystal1','Crystal_Yellow_green_crystal1','CaveObj_64_Blue_green_crystal1'],
      treeScale:[1.8,2.2],
      decorSprites:['Forest_Beige_green_mushroom2','Forest_Beige_green_mushroom3','Forest_White_red_mushroom2','Forest_White_red_mushroom3','CaveObj_64_mushroom11','CaveObj_64_mushroom12','CaveObj_64_mushroom22','CaveObj_64_mushroom23','CaveObj_64_mushroom33','CaveObj_64_mushroom41','CaveObj_64_mushroom42','CaveObj_32_mushroom13','Crystal_Green_crystal3','Crystal_Yellow_green_crystal2','Crystal_Yellow_green_crystal3','Bush_Fern2_2','Rock7_3'],
      groundSprite: 'tile_fungal'
    },
    deadlands:{
      name:'Deadlands',decorChance:.10,treeChance:.16,
      treeSprites:['Forest_White_tree1','Forest_White_tree2','Burned_tree1','Burned_tree2','Broken_tree4','Broken_tree7','CaveObj_256_Dark_totem1','CaveObj_128_Dark_totem2','CaveObj_128_Dark_totem3','CaveObj_128_Dark_totem4','CaveObj_128_Building1','CaveObj_128_Demon_scull','CaveObj_128_magic_circle','CaveObj_128_magic_circle2','CaveObj_128_cocoon_web','CaveObj_256_centipede1','Rock7_1','Rock7_2','Crystal_Black_crystal1','Crystal_Dark_red_crystal1'],
      treeScale:[1.8,2.2],
      decorSprites:['CaveObj_64_Bonefire','CaveObj_64_Dark_totem5','CaveObj_32_Human_skeleton','CaveObj_64_Dinosaur_skeleton__head','CaveObj_64_caveman_statue1','Crystal_Black_crystal2','Crystal_Black_crystal3','Crystal_Dark_red_crystal2','Bush_Burned_tree1','Bush_Burned_tree2','Bush_Broken_tree1','Bush_Broken_tree2','Rock7_3','Rock7_4'],
      groundSprite: 'tile_deadlands'
    },
    badlands:{
      name:'Scorched Badlands',decorChance:.08,treeChance:.14,
      treeSprites:['Rock2_1','Rock2_2','Rock6_1','Rock6_2','CaveObj_128_Beige_rpck1','CaveObj_128_Dinosaur_skeleton_part1','CaveObj_128_Dinosaur_skeleton_part2','CaveObj_128_Demon_scull','CaveObj_128_Dark_totem4','Burned_tree2','Burned_tree3','Broken_tree4','Crystal_Yellow_crystal1','Crystal_Red_crystal1','Bush_Autumn_bush1'],
      treeScale:[1.8,2.2],
      decorSprites:['Rock2_3','Rock2_4','Rock2_5','Rock6_3','Rock6_4','Bush_Autumn_bush2','Bush_Autumn_bush3','Bush_Cactus1_2','Bush_Burned_tree1','CaveObj_64_Dinosaur_skeleton__head','CaveObj_64_Beige_rpck2','CaveObj_64_Beige_rpck3','CaveObj_64_Bonefire','Crystal_Yellow_crystal2','Crystal_Yellow_crystal3','Crystal_Red_crystal3'],
      groundSprite: 'tile_badlands'
    },
    dream:{
      name:'The Dreamscape',decorChance:.14,treeChance:.20,
      treeSprites:[
        'dream_tree_cyan','dream_tree_eye','dream_tree_spirals','dream_tree_purple',
        'dream_tree_willow','dream_tree_spire','dream_tree_crystal',
        'dream_rock_crystal','dream_rock_floating','dream_rock_spire','dream_rock_purple','dream_rock_dark'
      ],
      treeScale:[1.4,1.9],
      decorSprites:[
        'dream_decor_clock','dream_decor_skulls','dream_decor_tree_dead','dream_decor_clock_melt',
        'dream_decor_statue','dream_decor_crystals','dream_decor_candelabra','dream_decor_tombstone',
        'dream_decor_lantern','dream_decor_mirror','dream_decor_bed','dream_decor_door'
      ],
      groundSprite: 'tile_dream'
    }
  };
  export const BIOME_TILE_COLORS={abyss:[14,32,60],dimensionX:[10,10,26],undergroundCave:[45,45,48],dwarfCity:[60,50,45],plains:[78,138,52],forest:[56,108,42],magicForest:[68,110,76],desert:[212,185,106],snow:[216,232,240],swamp:[74,90,58],volcano:[105,57,43], crystalWastes:[37,74,106], fungalWastes:[84,68,86], deadlands:[68,58,74], badlands:[138,74,42], dream:[45,25,65]};
  export const BIOME_TEXTURE={
  abyss:{light:'rgba(24,80,140,.55)',dark:'rgba(6,16,36,.75)',size:3,count:12},
  undergroundCave:{light:'rgba(70,70,70,.55)',dark:'rgba(30,30,30,.65)',size:2,count:12},
  dwarfCity:{light:'rgba(90,80,70,.55)',dark:'rgba(40,30,25,.65)',size:2,count:12},
  plains:{light:'rgba(120,180,80,.55)',dark:'rgba(45,80,30,.55)',size:2,count:8},
  forest:{light:'rgba(70,120,55,.55)',dark:'rgba(25,55,25,.65)',size:3,count:9},
  magicForest:{light:'rgba(138,185,124,.55)',dark:'rgba(77,77,130,.55)',size:2,count:11},
  desert:{light:'rgba(240,220,170,.6)',dark:'rgba(160,130,80,.55)',size:2,count:7},
  snow:{light:'rgba(255,255,255,.75)',dark:'rgba(180,200,220,.5)',size:2,count:8},
  swamp:{light:'rgba(90,110,70,.5)',dark:'rgba(20,35,15,.65)',size:3,count:8},
  volcano:{light:'rgba(224,103,49,.42)',dark:'rgba(55,37,38,.75)',size:2,count:10},
  dream:{light:'rgba(145,95,215,.55)',dark:'rgba(25,10,48,.75)',size:3,count:11},
   fungalWastes:{light:'rgba(140,80,180,.55)',dark:'rgba(50,25,60,.70)',size:3,count:10}
};
export const WATER_COLOR=[36,98,156];
export function getWaterColor(biome) {
  if (biome === 'abyss') return [10, 48, 92];
  if (biome === 'desert') return [200, 160, 80]; // quicksand
  if (biome === 'volcano') return [220, 60, 20]; // lava
  if (biome === 'swamp') return [70, 90, 50]; // swamp water
  if (biome === 'fungalWastes') return WATER_COLOR; // deep cerulean river water matching mockup
  if (biome === 'deadlands') return [80, 40, 90]; // dark magic water
  if (biome === 'dimensionX') return [200, 50, 200]; // void juice
  if (biome === 'dream') return [160, 40, 180]; // dream plasma
  return WATER_COLOR;
}

// Biome Scale Configuration (Balanced natural exploration: ~200-260 tiles avg)
export const DEFAULT_BIOME_SCALE = 0.00085;
export const BASE_BLEND_HALF = 0.04;
export const BASE_BIOME_SCALE = 0.001;

let currentBiomeScale = DEFAULT_BIOME_SCALE;
export function getBiomeScale() { return currentBiomeScale; }
export function setBiomeScale(scale) { currentBiomeScale = Number(scale) || DEFAULT_BIOME_SCALE; }
export function getBlendHalf() { return BASE_BLEND_HALF * (currentBiomeScale / BASE_BIOME_SCALE); }
function biomeValueAt(wx,wy){return biomeNoise(wx*currentBiomeScale,wy*currentBiomeScale)*2.2;}

export function getNativeBiomeAt(wx,wy){
  const b=biomeValueAt(wx,wy);
  if(b<-.90)return'snow';
  if(b<-.65)return'crystalWastes';
  if(b<-.40)return'forest';
  if(b<-.15)return'magicForest';
  if(b<.10)return'fungalWastes';
  if(b<.35)return'plains';
  if(b<.60)return'deadlands';
  if(b<.85)return'swamp';
  if(b<0.90)return'badlands';
  if(b<1.05)return'desert';
  return'volcano';
}

export function biomeAt(wx,wy){
    if (wx > 910000 && wy > 910000 && wx < 990000 && wy < 990000) return 'plains';
    if (wx > 700000 && wy > 700000 && wx < 900000 && wy < 900000) return 'abyss';
    if (wx > 550000 && wy > 550000 && wx < 650000 && wy < 650000) return 'dream';
    if (wx > 400000 && wy > 400000) return 'dimensionX';
    if (wx > 100000 && wy > 100000 && wx < 300000 && wy < 300000) {
       if (wx > 199940 && wx < 200060 && wy > 199940 && wy < 200060) return 'dwarfCity';
       return 'undergroundCave'; // Consistent underground biome for all cave areas
    }
    if (typeof window !== 'undefined' && window.getMountainBiomeAt) {
      const mb = window.getMountainBiomeAt(wx * 40, wy * 40);
      if (mb) return mb;
    }
    return getNativeBiomeAt(wx, wy);
  }
  
  const BIOME_THRESHOLDS = [
    { t: -0.90, from: 'snow', to: 'crystalWastes' },
    { t: -0.65, from: 'crystalWastes', to: 'forest' },
    { t: -0.40, from: 'forest', to: 'magicForest' },
    { t: -0.15, from: 'magicForest', to: 'fungalWastes' },
    { t:  0.10, from: 'fungalWastes', to: 'plains' },
    { t:  0.35, from: 'plains', to: 'deadlands' },
    { t:  0.60, from: 'deadlands', to: 'swamp' },
    { t:  0.75, from: 'swamp', to: 'badlands' },
    { t:  0.90, from: 'badlands', to: 'desert' },
    { t:  1.05, from: 'desert', to: 'volcano' }
  ];

// Distance (in biome-noise units) from the nearest biome colour-blend centre line.
// Inside the Abyss this is the diagonal-ish line where the tile colour changes.
export function biomeBoundaryDist(wx,wy){
  const b=biomeValueAt(wx,wy);
  let best=Infinity;
  for(let i=0;i<BIOME_THRESHOLDS.length;i++){
    const d=Math.abs(b-BIOME_THRESHOLDS[i].t);
    if(d<best)best=d;
  }
  return best;
}

export function getNativeTileColor(wx,wy){
  const b=biomeValueAt(wx,wy);
  const blendHalf = getBlendHalf(); // Constant width in world tiles regardless of scale
  for(let i=0;i<BIOME_THRESHOLDS.length;i++){
    const { t, from, to } = BIOME_THRESHOLDS[i];
    if(b >= t - blendHalf && b <= t + blendHalf){
      let f = (b - (t - blendHalf)) / (blendHalf * 2);
      f = smoothstep(f);
      const ca = BIOME_TILE_COLORS[from], cb = BIOME_TILE_COLORS[to];
      return [
        Math.round(lerp(ca[0],cb[0],f)),
        Math.round(lerp(ca[1],cb[1],f)),
        Math.round(lerp(ca[2],cb[2],f))
      ];
    }
  }
  const nativeBn = getNativeBiomeAt(wx, wy);
  return BIOME_TILE_COLORS[nativeBn] || BIOME_TILE_COLORS.plains;
}

export function blendedTileColor(wx,wy){
  const bn = biomeAt(wx,wy);
  if (bn === 'dream') return BIOME_TILE_COLORS.dream;
  if (bn === 'abyss') return BIOME_TILE_COLORS.abyss;
  if (bn === 'dimensionX') return BIOME_TILE_COLORS.dimensionX;
  if (bn === 'dwarfCity') return BIOME_TILE_COLORS.dwarfCity;
  if (bn === 'undergroundCave') return BIOME_TILE_COLORS.undergroundCave;

  const nativeColor = getNativeTileColor(wx, wy);

  // Smooth continuous mountain biome blending
  const mtnInf = (typeof window !== 'undefined' && window.getMountainInfluence)
    ? window.getMountainInfluence(wx * 40, wy * 40)
    : null;
  if (mtnInf && mtnInf.weight > 0) {
    const targetColor = BIOME_TILE_COLORS[mtnInf.targetBiome] || BIOME_TILE_COLORS.plains;
    const w = mtnInf.weight;
    return [
      Math.round(lerp(nativeColor[0], targetColor[0], w)),
      Math.round(lerp(nativeColor[1], targetColor[1], w)),
      Math.round(lerp(nativeColor[2], targetColor[2], w))
    ];
  }

  return nativeColor;
}

if (typeof window !== 'undefined') {
  window.getNativeBiomeAt = getNativeBiomeAt;
  window.getNativeTileColor = getNativeTileColor;
}
export function waterValueAt(wx,wy,floodBoost=0){
  return waterNoise(wx*.15,wy*.15)*1.6+floodBoost;
}
export function waterLevelAt(wx,wy,floodBoost=0){
  const w=waterValueAt(wx,wy,floodBoost);
  if(w>0.68)return 2;
  if(w>0.42)return 1;
  return 0;
}


