export const fireBreathStreamImg = new Image(); fireBreathStreamImg.src = 'assets/weapons/fire_breath_stream.webp?v309';
export const fireBreathStreamLeftImg = new Image(); fireBreathStreamLeftImg.src = 'assets/weapons/fire_breath_stream_left.webp?v309';
export const chainWhipSheetImg = new Image(); chainWhipSheetImg.src = 'assets/weapons/chain_whip_sheet.webp?v309';
export const chainWhipSheetLeftImg = new Image(); chainWhipSheetLeftImg.src = 'assets/weapons/chain_whip_sheet_left.webp?v309';
export const warhammerProjImg = new Image(); warhammerProjImg.src = 'assets/weapons/warhammer_projectile.webp?v309';
export const chainWhipIconImg = new Image(); chainWhipIconImg.src = 'assets/weapons/chain_whip_icon.webp?v309';
export const elvenBowIconImg = new Image(); elvenBowIconImg.src = 'assets/weapons/elven_bow_icon.webp?v309';
import { ITEM_SPRITE_MAPPING } from './item-mapping.mjs?v336';

const MOUNTAIN_TILES = [];
const MOUNTAIN_TILE_IMAGES = [];
const _MTN_ALIAS = {4:2,6:2,5:3,14:12,15:13,19:9,22:9,23:9,24:9,25:9,29:9,33:9,34:9,35:9,43:9,44:9,45:9,46:9,54:9,55:9,56:9,79:9,80:9,81:9,88:9,89:9};
const _MTN_IMG_CACHE = {};
for (let i = 0; i < 90; i++) {
  const canon = _MTN_ALIAS[i] ?? i;
  const padIndex = String(canon).padStart(3, '0');
  const path = `assets/mountain_tiles/mountain_tiles_512px/tile_${padIndex}.webp`;
  MOUNTAIN_TILES.push(path);
  if (typeof Image !== 'undefined') {
    if (!_MTN_IMG_CACHE[canon]) {
      const img = new Image();
      img.src = path;
      _MTN_IMG_CACHE[canon] = img;
    }
    MOUNTAIN_TILE_IMAGES.push(_MTN_IMG_CACHE[canon]);
  }
}
if (typeof window !== 'undefined') {
  window.MOUNTAIN_TILES = MOUNTAIN_TILES;
  window.MOUNTAIN_TILE_IMAGES = MOUNTAIN_TILE_IMAGES;
}

const MOUNTAIN_BIOME_ASSETS = {};
if (typeof Image !== 'undefined') {
  const load = (src, alt) => {
    const img = new Image();
    img.src = src;
    if (alt) {
      img.onerror = () => { if (img.src !== alt) img.src = alt; };
    }
    return img;
  };
  MOUNTAIN_BIOME_ASSETS.madAlchemistSheet = load('assets/mountain biom/mad_alchemist_anim/spritesheet.webp', 'assets/mountain%20biom/mad_alchemist_anim/spritesheet.webp');
  MOUNTAIN_BIOME_ASSETS.madAlchemistPortrait = load('assets/mountain biom/mad_alchemist.webp', 'assets/mountain%20biom/mad_alchemist.webp');
  MOUNTAIN_BIOME_ASSETS.frostHermitAldenSheet = load('assets/monsters_new/npc_alden_anim/spritesheet.webp?v332');
  MOUNTAIN_BIOME_ASSETS.frostHermitAldenPortrait = load('assets/monsters_new/npc_alden_anim/preview.webp?v332');
  MOUNTAIN_BIOME_ASSETS.madAlchemistTree = load('assets/mountain biom/mad_alchemist_tree5.webp', 'assets/mountain%20biom/mad_alchemist_tree5.webp');
  MOUNTAIN_BIOME_ASSETS.mountainTree1 = load('assets/mountain biom/mountain_tree1.webp', 'assets/mountain%20biom/mountain_tree1.webp');
  MOUNTAIN_BIOME_ASSETS.mountainTree3 = load('assets/mountain biom/mountain_tree3.webp', 'assets/mountain%20biom/mountain_tree3.webp');
  MOUNTAIN_BIOME_ASSETS.mountainTree4 = load('assets/mountain biom/mountain_tree4.webp', 'assets/mountain%20biom/mountain_tree4.webp');
  MOUNTAIN_BIOME_ASSETS.mushroomTree2 = load('assets/mountain biom/mushroom_tree2.webp', 'assets/mountain%20biom/mushroom_tree2.webp');
  MOUNTAIN_BIOME_ASSETS.guardianMountain = load('assets/mountain biom/guardian_mountain.webp', 'assets/mountain%20biom/guardian_mountain.webp');
  MOUNTAIN_BIOME_ASSETS.mountainShrine = load('assets/mountain biom/mountain_shrine.webp', 'assets/mountain%20biom/mountain_shrine.webp');
}
if (typeof window !== 'undefined') {
  window.MOUNTAIN_BIOME_ASSETS = MOUNTAIN_BIOME_ASSETS;
}

window.EXT_ITEMS = [];
const itemsAtlasImg = new Image();
itemsAtlasImg.src = 'assets/items/items_atlas.webp?v315';
itemsAtlasImg.onload = () => {
  const COLS = 32, TILE_SIZE = 16;
  for (let i = 0; i <= 505; i++) {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE; c.height = TILE_SIZE;
    const ctx = c.getContext('2d');
    const col = i % COLS, row = Math.floor(i / COLS);
    ctx.drawImage(itemsAtlasImg, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
    const tileImg = new Image();
    tileImg.src = c.toDataURL();
    window.EXT_ITEMS[i] = tileImg;
  }
};
itemsAtlasImg.onerror = () => {
  // Graceful fallback to separate files if atlas is absent
  for(let i=0; i<=505; i++){ const img=new Image(); img.src='assets/items/Seperate/tile'+String(i).padStart(3,'0')+'.webp'; window.EXT_ITEMS[i]=img; }
};
['merchant','traveler','hermit','gambler','cultist','noble','nomad','dwarf','plague','darkelf'].forEach((n, i) => { const img = new Image(); img.src = 'assets/npcs/npc_' + n + '.webp?v145'; window.EXT_ITEMS[600+i] = img; });
window.extItemSprite = function(str){
  if (window.TRINKET_RELIC_ICONS && (window.TRINKET_RELIC_ICONS[str] || window.TRINKET_RELIC_ICONS[String(str).toLowerCase()])) {
    return str;
  }
  if (window.ITEM_SPRITE_MAPPING && window.ITEM_SPRITE_MAPPING[str] !== undefined) {
    return 'ext_item_' + window.ITEM_SPRITE_MAPPING[str];
  }
  let hash=0;
  for(let i=0;i<str.length;i++) hash=str.charCodeAt(i)+((hash<<5)-hash);
  return 'ext_item_'+(Math.abs(hash)%506);
};

window.EXT_BOSSES = window.EXT_BOSSES || {};
const plainsBossImg = new Image();
plainsBossImg.src = 'assets/bosses/plains_boss.webp';
window.EXT_BOSSES['plains_boss'] = plainsBossImg;
window.EXT_BOSSES['plainsBoss'] = plainsBossImg;
window.EXT_BOSSES['bloodLord'] = plainsBossImg;

function loadLocalMobImg(relPath) {
  if (typeof Image === 'undefined') return null;
  const img = new Image();
  const rawPath = relPath;
  const encPath = encodeURI(relPath);
  img.src = encPath;
  img.onerror = () => { if (img.src !== rawPath) img.src = rawPath; };
  return img;
}

export const plainsBossWalkSheetImg = loadLocalMobImg('assets/bosses/plains_boss_anim/walk_spritesheet.webp');
export const plainsBossAttackSheetImg = loadLocalMobImg('assets/bosses/plains_boss_anim/attack_spritesheet.webp');
export const plainsBossDieSheetImg = loadLocalMobImg('assets/bosses/plains_boss_anim/die_spritesheet.webp');

window.EXT_ABYSS_MOBS = window.EXT_ABYSS_MOBS || {};
const abyssMobList = [
  'abyss_crab', 'abyss_jelly',
  'abyss_octopus', 'abyss_squid', 'abyss_turtle'
];
for(const mName of abyssMobList) {
  const mImg = new Image();
  mImg.src = 'assets/Abyss Biom/enemies/' + mName + '.webp';
  window.EXT_ABYSS_MOBS[mName] = mImg;
}
window.EXT_BOSSES['abyss_octopus'] = window.EXT_ABYSS_MOBS['abyss_octopus'];

// === ABYSS BIOME DECORATION & ENEMY SPRITE SHEETS ===
const abyssSheetDecor1 = new Image(); abyssSheetDecor1.src = 'assets/Abyss Biom/decorations/decor_abyss1.webp';
const abyssSheetDecor2 = new Image(); abyssSheetDecor2.src = 'assets/Abyss Biom/decorations/decor_abyss2.webp';
const abyssSheetReefs1 = new Image(); abyssSheetReefs1.src = 'assets/Abyss Biom/decorations/reefs1.webp';
const abyssSheetReefs2 = new Image(); abyssSheetReefs2.src = 'assets/Abyss Biom/decorations/reefs2.webp';
const abyssSheetStatues1 = new Image(); abyssSheetStatues1.src = 'assets/Abyss Biom/decorations/statues1.webp';
const abyssSunkenShipImg = new Image(); abyssSunkenShipImg.src = 'assets/Abyss Biom/decorations/Sunken_Ship.webp';
const abyssHolePit1Img = new Image(); abyssHolePit1Img.src = 'assets/Abyss Biom/decorations/Hole_pit.webp';
const abyssHolePit2Img = new Image(); abyssHolePit2Img.src = 'assets/Abyss Biom/decorations/Hole_pit2.webp';
const abyssHolePit3Img = new Image(); abyssHolePit3Img.src = 'assets/Abyss Biom/decorations/Hole_pit3.webp';
const abyssWhale1Img = new Image(); abyssWhale1Img.src = 'assets/Abyss Biom/decorations/abyss_whale_1.webp';
const abyssWhale2Img = new Image(); abyssWhale2Img.src = 'assets/Abyss Biom/decorations/abyss_whale.webp';
const abyssWhiteSharkImg = new Image(); abyssWhiteSharkImg.src = 'assets/Abyss Biom/enemies/white_shark.webp';
const abyssKrakenImg = new Image(); abyssKrakenImg.src = 'assets/Abyss Biom/decorations/Abyssal_kraken.webp';
const abyssEnemiesSheetImg = new Image(); abyssEnemiesSheetImg.src = 'assets/Abyss Biom/enemies/sprite_sheet_abyss_enemies1.webp';

window.EXT_BOSSES['abyss_octopus'] = abyssKrakenImg;
window.EXT_BOSSES['Abyssal_kraken'] = abyssKrakenImg;
window.EXT_ABYSS_MOBS['white_shark'] = abyssWhiteSharkImg;
window.EXT_ABYSS_MOBS['abyss_whale_1'] = abyssWhale1Img;
window.EXT_ABYSS_MOBS['abyss_whale_2'] = abyssWhale2Img;
window.EXT_ABYSS_MOBS['abyss_whale'] = abyssWhale2Img;
window.EXT_ABYSS_MOBS['abyss_octopus'] = abyssKrakenImg;
window.EXT_ABYSS_MOBS['Abyssal_kraken'] = abyssKrakenImg;

// === CHICKEN SECRET BIOME ASSETS ===
function loadChickenImg(file) {
  const img = new Image();
  img.src = 'assets/Chicken Biom/' + file + '?v260';
  return img;
}
const CHICKEN_ASSETS = {
  items: {
    goldenEgg: loadChickenImg('Golden_Egg_obj.webp'),
    goldenEggshell: loadChickenImg('Golden_Eggshell_material_drop.webp'),
    chickenCrown: loadChickenImg('chicken_crown_obj.webp'),
    chickenFeather: loadChickenImg('chicken_feather_material_drop.webp'),
    chickenKingCrown: loadChickenImg('chicken_crown_obj.webp'),
    chickenCoin: loadChickenImg('chicken_coin.webp'),
    chickenLeg: loadChickenImg('chicken_leg_obj.webp'),
    goldenFeather: loadChickenImg('chicken_feather_material_drop.webp'),
    eggBomb: loadChickenImg('chicken_kings_crown_material_drop.webp')
  },
  environment: {
    chickenShrine: loadChickenImg('chicken_shrine_env.webp'),
    chickenPortal: loadChickenImg('chicken_portal_env.webp'),
    chickenSign: loadChickenImg('scarecrow_decor.webp')
  },
  enemies: {
    chicken: loadChickenImg('Chicken_swarm_mob.webp'),
    rooster: loadChickenImg('rooster_mob.webp'),
    giantChicken: loadChickenImg('Giant_chicken_Tank_mob.webp')
  },
  boss: {
    chickenKing: loadChickenImg('chicken_King_Boss.webp')
  },
  tiles: {
    grass1: loadChickenImg('grass_tile1.webp'),
    grass3: loadChickenImg('grass_tile3.webp')
  },
  anim: {
    chickenSwarmSheet: loadChickenImg('chicken_swarm_anim/spritesheet.webp'),
    roosterSheet: loadChickenImg('rooster_mob_anim/spritesheet.webp'),
    giantChickenSheet: loadChickenImg('Giant_chicken_Tank_mob_anim/spritesheet.webp'),
    chickenKingSheet: loadChickenImg('chicken_King_Boss_anim/spritesheet.webp')
  },
  decorations: {
    coop: loadChickenImg('chicken_coop.webp'),
    feeder: loadChickenImg('chicken_Feeder_decor.webp'),
    nest: loadChickenImg('Egg_Nest_Decor.webp'),
    hayBale: loadChickenImg('hay_bale_decor.webp'),
    scarecrow: loadChickenImg('scarecrow_decor.webp')
  },
  npcs: {
    madFarmerPortrait: loadChickenImg('mad_poultry_farmer.webp'),
    madFarmerIdleSheet: loadChickenImg('mad_poultry_farmer/spritesheet.webp')
  }
};
window.CHICKEN_ASSETS = CHICKEN_ASSETS;
window.EXT_ABYSS_MOBS['chicken'] = CHICKEN_ASSETS.enemies.chicken;
window.EXT_ABYSS_MOBS['chicken_swarm'] = CHICKEN_ASSETS.enemies.chicken;
window.EXT_ABYSS_MOBS['rooster'] = CHICKEN_ASSETS.enemies.rooster;
window.EXT_ABYSS_MOBS['rooster_mob'] = CHICKEN_ASSETS.enemies.rooster;
window.EXT_ABYSS_MOBS['giantChicken'] = CHICKEN_ASSETS.enemies.giantChicken;
window.EXT_ABYSS_MOBS['giant_chicken'] = CHICKEN_ASSETS.enemies.giantChicken;

window.ABYSS_SHEET_ENEMIES = {
  img: abyssEnemiesSheetImg,
  regions: {
    // Row 1
    abyss_fish:             { sx: 59,  sy: 32,  sw: 98,  sh: 62 },
    abyss_horse:            { sx: 260, sy: 25,  sw: 102, sh: 78 },
    abyss_cuttle_up:        { sx: 501, sy: 11,  sw: 39,  sh: 106 },
    abyss_jelly:            { sx: 666, sy: 15,  sw: 92,  sh: 103 },
    bone_fish:              { sx: 822, sy: 33,  sw: 155, sh: 61 },
    // Row 2
    abyss_squid:            { sx: 67,  sy: 125, sw: 67,  sh: 111 },
    deep_fish:              { sx: 216, sy: 146, sw: 134, sh: 96 },
    abyss_worm:             { sx: 434, sy: 142, sw: 164, sh: 89 },
    abyss_crab:             { sx: 641, sy: 129, sw: 156, sh: 116 },
    abyss_octo_sheet:       { sx: 838, sy: 130, sw: 152, sh: 126 },
    // Row 3
    abyss_cuttlefish:       { sx: 33,  sy: 286, sw: 177, sh: 85 },
    abyss_turtle:           { sx: 239, sy: 275, sw: 159, sh: 96 },
    spike_fish:             { sx: 439, sy: 270, sw: 143, sh: 105 },
    Star_Fish:              { sx: 620, sy: 263, sw: 154, sh: 112 },
    abyss_viperfish:        { sx: 814, sy: 291, sw: 184, sh: 74 },
    // Row 4
    abyss_needle_fish:      { sx: 49,  sy: 443, sw: 183, sh: 52 },
    abyss_colossal_squid:   { sx: 291, sy: 409, sw: 357, sh: 143 },
    abyss_cyan_dunkle:      { sx: 679, sy: 398, sw: 323, sh: 157 },
    // Row 5
    abyss_purple_leviathan: { sx: 9,   sy: 593, sw: 377, sh: 160 },
    abyss_spider_crab:      { sx: 426, sy: 570, sw: 280, sh: 181 },
    abyss_bloop:            { sx: 757, sy: 590, sw: 250, sh: 167 }
  }
};

window.ABYSS_DECOR_DIMS = {
  // decor_abyss1 (256x255 cells: small seabed items 48-60px, structures 68-90px)
  abyss_d1_shell:    { img: abyssSheetDecor1, sx: 0,   sy: 0,   sw: 256, sh: 255, destW: 52, destH: 48, padBottom: 4 },
  abyss_d1_throne:   { img: abyssSheetDecor1, sx: 256, sy: 0,   sw: 256, sh: 255, destW: 72, destH: 84, padBottom: 5 },
  abyss_d1_arch:     { img: abyssSheetDecor1, sx: 512, sy: 0,   sw: 256, sh: 255, destW: 88, destH: 82, padBottom: 6 },
  abyss_d1_trident:  { img: abyssSheetDecor1, sx: 768, sy: 0,   sw: 256, sh: 255, destW: 58, destH: 78, padBottom: 5 },
  abyss_d1_bell:     { img: abyssSheetDecor1, sx: 0,   sy: 255, sw: 256, sh: 255, destW: 68, destH: 74, padBottom: 6 },
  abyss_d1_anemone:  { img: abyssSheetDecor1, sx: 256, sy: 255, sw: 256, sh: 255, destW: 60, destH: 60, padBottom: 4 },
  abyss_d1_vase:     { img: abyssSheetDecor1, sx: 512, sy: 255, sw: 256, sh: 255, destW: 54, destH: 68, padBottom: 5 },
  abyss_d1_chest:    { img: abyssSheetDecor1, sx: 768, sy: 255, sw: 256, sh: 255, destW: 62, destH: 52, padBottom: 4 },
  abyss_d1_skull:    { img: abyssSheetDecor1, sx: 0,   sy: 510, sw: 256, sh: 255, destW: 72, destH: 62, padBottom: 6 },
  abyss_d1_tubes:    { img: abyssSheetDecor1, sx: 256, sy: 510, sw: 256, sh: 255, destW: 62, destH: 68, padBottom: 5 },
  abyss_d1_stairs:   { img: abyssSheetDecor1, sx: 512, sy: 510, sw: 256, sh: 255, destW: 86, destH: 72, padBottom: 8 },
  abyss_d1_obelisk:  { img: abyssSheetDecor1, sx: 768, sy: 510, sw: 256, sh: 255, destW: 58, destH: 92, padBottom: 6 },

  // decor_abyss2 (256x255 cells: corals, relics, and seabed ruins)
  abyss_d2_coral_blue: { img: abyssSheetDecor2, sx: 0,   sy: 0,   sw: 256, sh: 255, destW: 56, destH: 56, padBottom: 6 },
  abyss_d2_coral_pink: { img: abyssSheetDecor2, sx: 256, sy: 0,   sw: 256, sh: 255, destW: 56, destH: 56, padBottom: 4 },
  abyss_d2_kelp:       { img: abyssSheetDecor2, sx: 512, sy: 0,   sw: 256, sh: 255, destW: 60, destH: 76, padBottom: 6 },
  abyss_d2_wreck_sm:   { img: abyssSheetDecor2, sx: 768, sy: 0,   sw: 256, sh: 255, destW: 98, destH: 82, padBottom: 8 },
  abyss_d2_anchor:     { img: abyssSheetDecor2, sx: 0,   sy: 255, sw: 256, sh: 255, destW: 70, destH: 78, padBottom: 7 },
  abyss_d2_pillar:     { img: abyssSheetDecor2, sx: 256, sy: 255, sw: 256, sh: 255, destW: 62, destH: 88, padBottom: 7 },
  abyss_d2_clam:       { img: abyssSheetDecor2, sx: 512, sy: 255, sw: 256, sh: 255, destW: 62, destH: 54, padBottom: 5 },
  abyss_d2_shrooms:    { img: abyssSheetDecor2, sx: 768, sy: 255, sw: 256, sh: 255, destW: 66, destH: 60, padBottom: 5 },
  abyss_d2_ribs:       { img: abyssSheetDecor2, sx: 0,   sy: 510, sw: 256, sh: 255, destW: 90, destH: 66, padBottom: 6 },
  abyss_d2_urchin:     { img: abyssSheetDecor2, sx: 256, sy: 510, sw: 256, sh: 255, destW: 48, destH: 46, padBottom: 4 },
  abyss_d2_moss_chest: { img: abyssSheetDecor2, sx: 512, sy: 510, sw: 256, sh: 255, destW: 62, destH: 54, padBottom: 5 },
  abyss_d2_face_relic: { img: abyssSheetDecor2, sx: 768, sy: 510, sw: 256, sh: 255, destW: 74, destH: 70, padBottom: 6 },

  // statues1 (exact cropped tall regal Atlantean statues)
  abyss_st_mermaid1: { img: abyssSheetStatues1, sx: 67,  sy: 40,  sw: 223, sh: 450, destW: 90,  destH: 180, padBottom: 8 },
  abyss_st_siren:    { img: abyssSheetStatues1, sx: 371, sy: 60,  sw: 293, sh: 436, destW: 120, destH: 178, padBottom: 8 },
  abyss_st_triton:   { img: abyssSheetStatues1, sx: 705, sy: 68,  sw: 289, sh: 422, destW: 122, destH: 178, padBottom: 8 },
  abyss_st_mermaid2: { img: abyssSheetStatues1, sx: 40,  sy: 576, sw: 301, sh: 397, destW: 135, destH: 178, padBottom: 8 },
  abyss_st_maiden:   { img: abyssSheetStatues1, sx: 398, sy: 530, sw: 250, sh: 446, destW: 100, destH: 178, padBottom: 8 },
  abyss_st_crystal:  { img: abyssSheetStatues1, sx: 710, sy: 534, sw: 279, sh: 442, destW: 112, destH: 178, padBottom: 8 },

  // reefs1 (exact cropped towering coral spires & deep grottos)
  abyss_rf1_spire:   { img: abyssSheetReefs1, sx: 44, sy: 32, sw: 280, sh: 460, destW: 112, destH: 184, padBottom: 6 },
  abyss_rf1_tiered:  { img: abyssSheetReefs1, sx: 368, sy: 96, sw: 300, sh: 384, destW: 132, destH: 169, padBottom: 6 },
  abyss_rf1_cauldron:{ img: abyssSheetReefs1, sx: 696, sy: 104, sw: 312, sh: 372, destW: 140, destH: 167, padBottom: 6 },
  abyss_rf1_arch:    { img: abyssSheetReefs1, sx: 16, sy: 616, sw: 356, sh: 340, destW: 153, destH: 146, padBottom: 6 },
  abyss_rf1_pillar:  { img: abyssSheetReefs1, sx: 396, sy: 532, sw: 284, sh: 424, destW: 116, destH: 174, padBottom: 6 },
  abyss_rf1_crystals:{ img: abyssSheetReefs1, sx: 700, sy: 584, sw: 292, sh: 368, destW: 134, destH: 169, padBottom: 6 },

  // reefs2 (exact cropped wide coral platforms, bridges & arches)
  abyss_rf2_sponge:  { img: abyssSheetReefs2, sx: 80, sy: 64, sw: 388, sh: 324, destW: 171, destH: 143, padBottom: 6 },
  abyss_rf2_pointed: { img: abyssSheetReefs2, sx: 568, sy: 20, sw: 376, sh: 376, destW: 158, destH: 158, padBottom: 6 },
  abyss_rf2_plateau: { img: abyssSheetReefs2, sx: 56, sy: 396, sw: 428, sh: 292, destW: 180, destH: 123, padBottom: 6 },
  abyss_rf2_arch2:   { img: abyssSheetReefs2, sx: 552, sy: 404, sw: 408, sh: 288, destW: 171, destH: 121, padBottom: 6 },
  abyss_rf2_purple:  { img: abyssSheetReefs2, sx: 88, sy: 696, sw: 360, sh: 296, destW: 162, destH: 133, padBottom: 6 },
  abyss_rf2_shelf:   { img: abyssSheetReefs2, sx: 580, sy: 684, sw: 368, sh: 312, destW: 166, destH: 140, padBottom: 6 },

  // Grand Sunken Ship (1024x572: colossal shipwreck landmark)
  abyss_sunken_ship: { img: abyssSunkenShipImg, sx: 0, sy: 0, sw: 1024, sh: 572, destW: 320, destH: 178, padBottom: 18 },

  // Deep Abyss Chasms & Sinkholes (hole_pit)
  abyss_hole_pit1: { img: abyssHolePit1Img, sx: 0, sy: 0, sw: 850, sh: 534, destW: 240, destH: 151, padBottom: 10 },
  abyss_hole_pit2: { img: abyssHolePit2Img, sx: 0, sy: 0, sw: 867, sh: 528, destW: 246, destH: 150, padBottom: 10 },
  abyss_hole_pit3: { img: abyssHolePit3Img, sx: 0, sy: 0, sw: 808, sh: 458, destW: 238, destH: 135, padBottom: 8 },
  Hole_pit:        { img: abyssHolePit1Img, sx: 0, sy: 0, sw: 850, sh: 534, destW: 240, destH: 151, padBottom: 10 },
  Hole_pit2:       { img: abyssHolePit2Img, sx: 0, sy: 0, sw: 867, sh: 528, destW: 246, destH: 150, padBottom: 10 },
  Hole_pit3:       { img: abyssHolePit3Img, sx: 0, sy: 0, sw: 808, sh: 458, destW: 238, destH: 135, padBottom: 8 }
};

export const SPECIAL_ITEMS_MAP = {
  'Abyssal_Key': 'assets/special Items/Abyssal_Key.webp',
  'abyssal_key': 'assets/special Items/Abyssal_Key.webp',
  'Tidecallers_Conch': 'assets/special Items/Tidecallers_Conch.webp',
  'tidecallers_conch': 'assets/special Items/Tidecallers_Conch.webp',
  'Eye_Sigil': 'assets/special Items/Eye_Sigil.webp',
  'eye_sigil': 'assets/special Items/Eye_Sigil.webp',
  'Mask_Of_Calm': 'assets/special Items/Mask_Of_Calm.webp',
  'mask_of_calm': 'assets/special Items/Mask_Of_Calm.webp',
  'Heart_of_Winter': 'assets/special Items/Heart_of_Winter.webp',
  'heart_of_winter': 'assets/special Items/Heart_of_Winter.webp',
  'Sun_Shield': 'assets/special Items/Sun_Shield.webp',
  'sun_shield': 'assets/special Items/Sun_Shield.webp',
  'Mad_Alchemist_Tome': 'assets/special Items/Mad_Alchemist_Tome.webp',
  'mad_alchemist_tome': 'assets/special Items/Mad_Alchemist_Tome.webp',
  'Mad_Alchemist_Journal': 'assets/special Items/Mad_Alchemist_Journal.webp',
  'mad_alchemist_journal': 'assets/special Items/Mad_Alchemist_Journal.webp',
  'Mad_Alchemist_secret': 'assets/special Items/Mad_Alchemist_secret.webp',
  'mad_alchemist_secret': 'assets/special Items/Mad_Alchemist_secret.webp',
  'Void_Key': 'assets/special Items/Void_Key.webp',
  'void_key': 'assets/special Items/Void_Key.webp',
  'Void_Essence': 'assets/special Items/Void_Essence.webp',
  'void_essence': 'assets/special Items/Void_Essence.webp',
  'Crystal_Key': 'assets/special Items/Crystal_Key.webp',
  'crystal_key': 'assets/special Items/Crystal_Key.webp',
  'Crystal_Shard': 'assets/special Items/Crystal_Shard.webp',
  'crystal_shard': 'assets/special Items/Crystal_Shard.webp',
  'Frozen_Core': 'assets/special Items/Frozen_Core.webp',
  'frozen_core': 'assets/special Items/Frozen_Core.webp',
  'Frozen_Sigil': 'assets/special Items/Frozen_Sigil.webp',
  'frozen_sigil': 'assets/special Items/Frozen_Sigil.webp',
  'Book_Of_Ord': 'assets/special Items/Book_Of_Ord.webp',
  'book_of_ord': 'assets/special Items/Book_Of_Ord.webp',
  'Book_Of_Wiz': 'assets/special Items/Book_Of_Wiz.webp',
  'book_of_wiz': 'assets/special Items/Book_Of_Wiz.webp',
  'Broken_Myth': 'assets/special Items/Broken_Myth.webp',
  'broken_myth': 'assets/special Items/Broken_Myth.webp',
  'Philosophers_Stone': 'assets/special Items/Philosophers_Stone.webp',
  'philosophers_stone': 'assets/special Items/Philosophers_Stone.webp',
  'Rite_of_the_Frozen_Heart': 'assets/special Items/Rite_of_the_Frozen_Heart.webp',
  'rite_of_the_frozen_heart': 'assets/special Items/Rite_of_the_Frozen_Heart.webp',
  'Clues': 'assets/special Items/Clues.webp',
  'clues': 'assets/special Items/Clues.webp',
  'Journals': 'assets/special Items/Journals.webp',
  'journals': 'assets/special Items/Journals.webp',
  'Symbols': 'assets/special Items/Symbols.webp',
  'symbols': 'assets/special Items/Symbols.webp',
  'Stories': 'assets/special Items/Stories.webp',
  'stories': 'assets/special Items/Stories.webp',
  'prism_staff': 'assets/weapons/Rainbow_staff.webp',
  'rainbow_staff': 'assets/weapons/Rainbow_staff.webp',
  'Rainbow_staff': 'assets/weapons/Rainbow_staff.webp',
  'frost_beam': 'assets/weapons/Frost_staff.webp',
  'frost_staff': 'assets/weapons/Frost_staff.webp',
  'Frost_staff': 'assets/weapons/Frost_staff.webp',
  'goldenEgg': 'assets/Chicken Biom/Golden_Egg_obj.webp',
  'Golden_Egg': 'assets/Chicken Biom/Golden_Egg_obj.webp',
  'chickenCrown': 'assets/Chicken Biom/chicken_crown_obj.webp',
  'chicken_crown': 'assets/Chicken Biom/chicken_crown_obj.webp',
  'chickenFeather': 'assets/Chicken Biom/chicken_feather_material_drop.webp',
  'chicken_feather': 'assets/Chicken Biom/chicken_feather_material_drop.webp',
  'chickenKingCrown': 'assets/Chicken Biom/chicken_crown_obj.webp',
  'chicken_king_crown': 'assets/Chicken Biom/chicken_crown_obj.webp',
  'chickenCoin': 'assets/Chicken Biom/chicken_coin.webp',
  'chicken_coin': 'assets/Chicken Biom/chicken_coin.webp',
  'chickenLeg': 'assets/Chicken Biom/chicken_leg_obj.webp',
  'goldenFeather': 'assets/Chicken Biom/chicken_feather_material_drop.webp',
  'eggBomb': 'assets/Chicken Biom/chicken_kings_crown_material_drop.webp',
  'mad_farmer_idle': 'assets/Chicken Biom/mad_poultry_farmer.webp',
  'mad_poultry_farmer': 'assets/Chicken Biom/mad_poultry_farmer.webp',
  'food_fish': 'assets/consumables/food_fish.webp',
  'food_steak': 'assets/consumables/food_steak.webp',
  'food_ham': 'assets/consumables/food_ham.webp'
};
const foodFishImg = new Image(); foodFishImg.src = 'assets/consumables/food_fish.webp';
const foodSteakImg = new Image(); foodSteakImg.src = 'assets/consumables/food_steak.webp';
const foodHamImg = new Image(); foodHamImg.src = 'assets/consumables/food_ham.webp';
const rainbowStaffImg = new Image();
rainbowStaffImg.src = 'assets/weapons/Rainbow_staff.webp?v191';
const frostStaffImg = new Image();
frostStaffImg.src = 'assets/weapons/Frost_staff.webp?v191';
window.SPECIAL_ITEMS_MAP = SPECIAL_ITEMS_MAP;

const TRINKET_RELIC_FILES = [
  'Alchemist_Crest.webp',
  'Amulet_of_Vigor.webp',
  'Anchor_Chain.webp',
  'Arrow_Bundle.webp',
  'Ashen_Crown.webp',
  'Assassin_Crest.webp',
  'Beastmaster_Crest.webp',
  'Berserker_Crest.webp',
  'Blade_of_the_Void.webp',
  'Blood_Stone.webp',
  'Champion_Crest.webp',
  'Cleric_Crest.webp',
  'Compass.webp',
  'Cracked_Charm.webp',
  'Crown_of_the_Wilds.webp',
  'Cryomancer_Crest.webp',
  'Crystal_Shard.webp',
  'Defender_Crest.webp',
  'Diamond_Drop.webp',
  'Druid_Crest.webp',
  'Electro_Crest.webp',
  'Ember_Sigil.webp',
  'Emerald_Drop.webp',
  'Emerald_Ring.webp',
  'Explorer_Crest.webp',
  'First_Flame.webp',
  'Frostglass_Eye.webp',
  'Gambler_Crest.webp',
  'Gold_Pouch.webp',
  'Golden_Chalice.webp',
  'Heart_Locket.webp',
  'Hourglass.webp',
  'Hunter_Crest.webp',
  'Iron_Ring.webp',
  'Lantern.webp',
  'Lavender_Bundle.webp',
  'Leather_Gloves.webp',
  'Lucky_Coin.webp',
  'Mage_Crest.webp',
  'Merchant_Crest.webp',
  'Mirror_Shard.webp',
  'Moonlit_Astrolabe.webp',
  'Mossbound_Locket.webp',
  'Necromancer_Crest.webp',
  'Orb_Magnet.webp',
  'Phoenix_Heart.webp',
  'Pocket_Watch.webp',
  'Potion_Belt.webp',
  'Pyromancer_Crest.webp',
  'Ruby_Drop.webp',
  'Sapphire_Drop.webp',
  'Spyglass.webp',
  'Star_Tome.webp',
  'Stormheart_Relic.webp',
  'Sunken_Signet.webp',
  'Swift_Feather.webp',
  'Thief_Glove.webp',
  'Tinker_Crest.webp',
  'Tome_of_Eternity.webp',
  'Topaz_Drop.webp',
  'Travelers_Button.webp',
  'Vampire_Fang.webp',
  'Verdant_Compass.webp',
  'Wanderers_Cloak.webp',
  'Wardens_Sigil.webp',
  'Water_Stone.webp',
  'Weathered_Coin.webp',
  'Whispering_Seed.webp',
  'Winged_Boots.webp',
  'Wizards_Hat.webp',
  'Worldroot_Seed.webp',
  'aegis_of_the_ancients.webp',
  'amethyst_drop.webp',
  'warrior_crest.webp',
];

const TRINKET_RELIC_ICONS = {};
for (const file of TRINKET_RELIC_FILES) {
  const base = file.replace(/\.(png|webp)$/i, '');
  const img = new Image();
  img.src = 'assets/Trinkets Relics Icons/' + file;
  TRINKET_RELIC_ICONS[file] = img;
  TRINKET_RELIC_ICONS[base] = img;
  TRINKET_RELIC_ICONS[base.toLowerCase()] = img;
}

const TRINKET_RELIC_ALIASES = {
  'Aegis of the Ancients': 'aegis_of_the_ancients',
  'Alchemist Crest': 'Alchemist_Crest',
  'Amethyst Drop': 'amethyst_drop',
  'Amulet of Vigor': 'Amulet_of_Vigor',
  'Anchor Chain': 'Anchor_Chain',
  'Arrow Bundle': 'Arrow_Bundle',
  'Ashen Crown': 'Ashen_Crown',
  'Assassin Crest': 'Assassin_Crest',
  'Beastmaster Crest': 'Beastmaster_Crest',
  'Berserker Crest': 'Berserker_Crest',
  'Blade of the Void': 'Blade_of_the_Void',
  'Blood Stone': 'Blood_Stone',
  'Champion Crest': 'Champion_Crest',
  'Cleric Crest': 'Cleric_Crest',
  'Compass': 'Compass',
  'Cracked Charm': 'Cracked_Charm',
  'Crown of the Wilds': 'Crown_of_the_Wilds',
  'Cryomancer Crest': 'Cryomancer_Crest',
  'Crystal Shard': 'Crystal_Shard',
  'Defender Crest': 'Defender_Crest',
  'Diamond Drop': 'Diamond_Drop',
  'Druid Crest': 'Druid_Crest',
  'Electro Crest': 'Electro_Crest',
  'Ember Sigil': 'Ember_Sigil',
  'Emerald Drop': 'Emerald_Drop',
  'Emerald Ring': 'Emerald_Ring',
  'Explorer Crest': 'Explorer_Crest',
  'First Flame': 'First_Flame',
  'Frostglass Eye': 'Frostglass_Eye',
  'Gambler Crest': 'Gambler_Crest',
  'Gold Pouch': 'Gold_Pouch',
  'Golden Chalice': 'Golden_Chalice',
  'Heart Locket': 'Heart_Locket',
  'Hourglass': 'Hourglass',
  'Hunter Crest': 'Hunter_Crest',
  'Iron Ring': 'Iron_Ring',
  'Lantern': 'Lantern',
  'Lavender Bundle': 'Lavender_Bundle',
  'Leather Gloves': 'Leather_Gloves',
  'Lucky Coin': 'Lucky_Coin',
  'Mage Crest': 'Mage_Crest',
  'Merchant Crest': 'Merchant_Crest',
  'Mirror Shard': 'Mirror_Shard',
  'Moonlit Astrolabe': 'Moonlit_Astrolabe',
  'Mossbound Locket': 'Mossbound_Locket',
  'Necromancer Crest': 'Necromancer_Crest',
  'Orb Magnet': 'Orb_Magnet',
  'Phoenix Heart': 'Phoenix_Heart',
  'Pocket Watch': 'Pocket_Watch',
  'Potion Belt': 'Potion_Belt',
  'Pyromancer Crest': 'Pyromancer_Crest',
  'Ruby Drop': 'Ruby_Drop',
  'Sapphire Drop': 'Sapphire_Drop',
  'Spyglass': 'Spyglass',
  'Star Tome': 'Star_Tome',
  'Stormheart Relic': 'Stormheart_Relic',
  'Sunken Signet': 'Sunken_Signet',
  'Swift Feather': 'Swift_Feather',
  'Thief Glove': 'Thief_Glove',
  'Tinker Crest': 'Tinker_Crest',
  'Tome of Eternity': 'Tome_of_Eternity',
  'Topaz Drop': 'Topaz_Drop',
  "Traveler's Button": "Travelers_Button",
  'Traveler’s Button': 'Travelers_Button',
  'Vampire Fang': 'Vampire_Fang',
  'Verdant Compass': 'Verdant_Compass',
  "Wanderer's Cloak": "Wanderers_Cloak",
  'Wanderer’s Cloak': 'Wanderers_Cloak',
  "Warden's Sigil": "Wardens_Sigil",
  'Warden’s Sigil': 'Wardens_Sigil',
  'Warrior Crest': 'warrior_crest',
  'Water Stone': 'Water_Stone',
  'Weathered Coin': 'Weathered_Coin',
  'Whispering Seed': 'Whispering_Seed',
  'Winged Boots': 'Winged_Boots',
  "Wizard's Hat": "Wizards_Hat",
  'Worldroot Seed': 'Worldroot_Seed',
  'aegisoftheancients': 'aegis_of_the_ancients',
  'alchemistcrest': 'Alchemist_Crest',
  'amethystdrop': 'amethyst_drop',
  'amuletofvigor': 'Amulet_of_Vigor',
  'anchor_chain': 'Anchor_Chain',
  'anchorchain': 'Anchor_Chain',
  'arrow_bundle': 'Arrow_Bundle',
  'arrowbundle': 'Arrow_Bundle',
  'ashencrown': 'Ashen_Crown',
  'assassincrest': 'Assassin_Crest',
  'beastmastercrest': 'Beastmaster_Crest',
  'berserkercrest': 'Berserker_Crest',
  'bladeofthevoid': 'Blade_of_the_Void',
  'bloodstone': 'Blood_Stone',
  'book_star': 'Star_Tome',
  'bookstar': 'Star_Tome',
  'boots_winged': 'Winged_Boots',
  'bootswinged': 'Winged_Boots',
  'chalice_gold': 'Golden_Chalice',
  'chalicegold': 'Golden_Chalice',
  'championcrest': 'Champion_Crest',
  'clericcrest': 'Cleric_Crest',
  'compass': 'Compass',
  'crackedcharm': 'Cracked_Charm',
  'crownofthewilds': 'Crown_of_the_Wilds',
  'cryomancercrest': 'Cryomancer_Crest',
  'crystal_shard': 'Crystal_Shard',
  'crystalshard': 'Crystal_Shard',
  'defendercrest': 'Defender_Crest',
  'diamonddrop': 'Diamond_Drop',
  'druidcrest': 'Druid_Crest',
  'electrocrest': 'Electro_Crest',
  'embersigil': 'Ember_Sigil',
  'emeralddrop': 'Emerald_Drop',
  'emeraldring': 'Emerald_Ring',
  'explorercrest': 'Explorer_Crest',
  'firstflame': 'First_Flame',
  'frostglasseye': 'Frostglass_Eye',
  'gamblercrest': 'Gambler_Crest',
  'gloves_leather': 'Leather_Gloves',
  'glovesleather': 'Leather_Gloves',
  'gold_pouch': 'Gold_Pouch',
  'goldenchalice': 'Golden_Chalice',
  'goldpouch': 'Gold_Pouch',
  'heart_locket': 'Heart_Locket',
  'heartlocket': 'Heart_Locket',
  'hourglass': 'Hourglass',
  'huntercrest': 'Hunter_Crest',
  'ironring': 'Iron_Ring',
  'lantern': 'Lantern',
  'lavender': 'Lavender_Bundle',
  'lavenderbundle': 'Lavender_Bundle',
  'leathergloves': 'Leather_Gloves',
  'luckycoin': 'Lucky_Coin',
  'magecrest': 'Mage_Crest',
  'merchantcrest': 'Merchant_Crest',
  'mirrorshard': 'Mirror_Shard',
  'moonlitastrolabe': 'Moonlit_Astrolabe',
  'mossboundlocket': 'Mossbound_Locket',
  'necklace': 'Amulet_of_Vigor',
  'necromancercrest': 'Necromancer_Crest',
  'orbmagnet': 'Orb_Magnet',
  'phoenixheart': 'Phoenix_Heart',
  'pocket_watch': 'Pocket_Watch',
  'pocketwatch': 'Pocket_Watch',
  'potion_belt': 'Potion_Belt',
  'potionbelt': 'Potion_Belt',
  'pyromancercrest': 'Pyromancer_Crest',
  'ring_emerald': 'Emerald_Ring',
  'ringemerald': 'Emerald_Ring',
  'rubydrop': 'Ruby_Drop',
  'sapphiredrop': 'Sapphire_Drop',
  'spyglass': 'Spyglass',
  'startome': 'Star_Tome',
  'stormheartrelic': 'Stormheart_Relic',
  'sunkensignet': 'Sunken_Signet',
  'swiftfeather': 'Swift_Feather',
  't_alchemistcrest': 'Alchemist_Crest',
  't_amethystdrop': 'amethyst_drop',
  't_assassincrest': 'Assassin_Crest',
  't_beastmastercrest': 'Beastmaster_Crest',
  't_berserkercrest': 'Berserker_Crest',
  't_bloodstone': 'Blood_Stone',
  't_championcrest': 'Champion_Crest',
  't_clericcrest': 'Cleric_Crest',
  't_cryomancercrest': 'Cryomancer_Crest',
  't_defendercrest': 'Defender_Crest',
  't_diamonddrop': 'Diamond_Drop',
  't_druidcrest': 'Druid_Crest',
  't_electromancercrest': 'Electro_Crest',
  't_emeralddrop': 'Emerald_Drop',
  't_explorercrest': 'Explorer_Crest',
  't_feather': 'Swift_Feather',
  't_gamblercrest': 'Gambler_Crest',
  't_huntercrest': 'Hunter_Crest',
  't_ironring': 'Iron_Ring',
  't_luckycoin': 'Lucky_Coin',
  't_magecrest': 'Mage_Crest',
  't_magnet': 'Orb_Magnet',
  't_merchantcrest': 'Merchant_Crest',
  't_necromancercrest': 'Necromancer_Crest',
  't_pyromancercrest': 'Pyromancer_Crest',
  't_rubydrop': 'Ruby_Drop',
  't_sapphiredrop': 'Sapphire_Drop',
  't_thiefglove': 'Thief_Glove',
  't_tinkercrest': 'Tinker_Crest',
  't_topazdrop': 'Topaz_Drop',
  't_vampfang': 'Vampire_Fang',
  't_warriorcrest': 'warrior_crest',
  't_waterstone': 'Water_Stone',
  'talchemistcrest': 'Alchemist_Crest',
  'tamethystdrop': 'amethyst_drop',
  'tassassincrest': 'Assassin_Crest',
  'tbeastmastercrest': 'Beastmaster_Crest',
  'tberserkercrest': 'Berserker_Crest',
  'tbloodstone': 'Blood_Stone',
  'tchampioncrest': 'Champion_Crest',
  'tclericcrest': 'Cleric_Crest',
  'tcryomancercrest': 'Cryomancer_Crest',
  'tdefendercrest': 'Defender_Crest',
  'tdiamonddrop': 'Diamond_Drop',
  'tdruidcrest': 'Druid_Crest',
  'telectromancercrest': 'Electro_Crest',
  'temeralddrop': 'Emerald_Drop',
  'texplorercrest': 'Explorer_Crest',
  'tfeather': 'Swift_Feather',
  'tgamblercrest': 'Gambler_Crest',
  'thiefglove': 'Thief_Glove',
  'thuntercrest': 'Hunter_Crest',
  'tinkercrest': 'Tinker_Crest',
  'tironring': 'Iron_Ring',
  'tluckycoin': 'Lucky_Coin',
  'tmagecrest': 'Mage_Crest',
  'tmagnet': 'Orb_Magnet',
  'tmerchantcrest': 'Merchant_Crest',
  'tnecromancercrest': 'Necromancer_Crest',
  'tomeofeternity': 'Tome_of_Eternity',
  'topazdrop': 'Topaz_Drop',
  'tpyromancercrest': 'Pyromancer_Crest',
  'travelersbutton': 'Travelers_Button',
  'trubydrop': 'Ruby_Drop',
  'tsapphiredrop': 'Sapphire_Drop',
  'tthiefglove': 'Thief_Glove',
  'ttinkercrest': 'Tinker_Crest',
  'ttopazdrop': 'Topaz_Drop',
  'tvampfang': 'Vampire_Fang',
  'twarriorcrest': 'warrior_crest',
  'twaterstone': 'Water_Stone',
  'vampirefang': 'Vampire_Fang',
  'verdantcompass': 'Verdant_Compass',
  'wandererscloak': 'Wanderers_Cloak',
  'wardenssigil': 'Wardens_Sigil',
  'warriorcrest': 'warrior_crest',
  'waterstone': 'Water_Stone',
  'weatheredcoin': 'Weathered_Coin',
  'whisperingseed': 'Whispering_Seed',
  'wingedboots': 'Winged_Boots',
  'wizard_hat': 'Wizards_Hat',
  'wizardhat': 'Wizards_Hat',
  'wizardshat': 'Wizards_Hat',
  'worldrootseed': 'Worldroot_Seed',
};
for (const [alias, target] of Object.entries(TRINKET_RELIC_ALIASES)) {
  if (TRINKET_RELIC_ICONS[target]) {
    TRINKET_RELIC_ICONS[alias] = TRINKET_RELIC_ICONS[target];
  }
}
Object.assign(TRINKET_RELIC_ICONS, {
  goldenEgg: CHICKEN_ASSETS.items.goldenEgg,
  goldenegg: CHICKEN_ASSETS.items.goldenEgg,
  Golden_Egg: CHICKEN_ASSETS.items.goldenEgg,
  chickenCrown: CHICKEN_ASSETS.items.chickenCrown,
  chickencrown: CHICKEN_ASSETS.items.chickenCrown,
  chicken_crown: CHICKEN_ASSETS.items.chickenCrown,
  chickenFeather: CHICKEN_ASSETS.items.chickenFeather,
  chickenfeather: CHICKEN_ASSETS.items.chickenFeather,
  chicken_feather: CHICKEN_ASSETS.items.chickenFeather,
  chickenKingCrown: CHICKEN_ASSETS.items.chickenKingCrown,
  chickenkingcrown: CHICKEN_ASSETS.items.chickenKingCrown,
  chickenCoin: CHICKEN_ASSETS.items.chickenCoin,
  chickencoin: CHICKEN_ASSETS.items.chickenCoin,
  chickenLeg: CHICKEN_ASSETS.items.chickenLeg,
  chickenleg: CHICKEN_ASSETS.items.chickenLeg,
  goldenFeather: CHICKEN_ASSETS.items.goldenFeather,
  goldenfeather: CHICKEN_ASSETS.items.goldenFeather,
  eggBomb: CHICKEN_ASSETS.items.eggBomb,
  eggbomb: CHICKEN_ASSETS.items.eggBomb,
  mad_farmer_idle: CHICKEN_ASSETS.npcs.madFarmerPortrait,
  mad_poultry_farmer: CHICKEN_ASSETS.npcs.madFarmerPortrait,
  food_fish: foodFishImg,
  food_steak: foodSteakImg,
  food_ham: foodHamImg
});
window.TRINKET_RELIC_ICONS = TRINKET_RELIC_ICONS;


export const EXT_BOSS_DEFS = {
  'plains_boss':        'assets/bosses/plains_boss.webp?v197',
  'plainsBoss':         'assets/bosses/plains_boss.webp?v197',
  'Blood_Lord':         'assets/bosses/Blood_Lord.webp?v197',
  'bloodLord':          'assets/bosses/Blood_Lord.webp?v197',
  'Lich_King':          'assets/bosses/Lich_King.webp?v197',
  'lichKing':           'assets/bosses/Lich_King.webp?v197',
  'rpg_lichKing':       'assets/bosses/Lich_King.webp?v197',
  'Pharaoh':            'assets/bosses/Pharaoh.webp?v197',
  'pharaoh':            'assets/bosses/Pharaoh.webp?v197',
  'Ice_titan':          'assets/bosses/Ice_titan.webp?v197',
  'iceTitan':           'assets/bosses/Ice_titan.webp?v197',
  'Swamp_Horror':       'assets/bosses/Swamp_Horror.webp?v197',
  'swampHorror':        'assets/bosses/Swamp_Horror.webp?v197',
  'Phoenix':            'assets/bosses/Phoenix.webp?v197',
  'phoenix':            'assets/bosses/Phoenix.webp?v197',
  'rpg_phoenix':        'assets/bosses/Phoenix.webp?v197',
  'Vampire_Lord':       'assets/bosses/Vampire_Lord.webp?v197',
  'vampireLord':        'assets/bosses/Vampire_Lord.webp?v197',
  'Void_God':           'assets/bosses/Void_God.webp?v197',
  'voidGod':            'assets/bosses/Void_God.webp?v197',
  'Cave_titan':         'assets/bosses/Cave_titan.webp?v197',
  'stoneColossus':      'assets/bosses/Cave_titan.webp?v197',
  'Crystal_Beholder':   'assets/bosses/Crystal_Beholder.webp?v197',
  'crystalBeholder':    'assets/bosses/Crystal_Beholder.webp?v197',
  'Cave_Wyrm':          'assets/bosses/Cave_Wyrm.webp?v197',
  'caveWyrm':           'assets/bosses/Cave_Wyrm.webp?v197',
  'Cave_lava_Wyrm':     'assets/bosses/Cave_lava_Wyrm.webp?v197',
  'lavaTitan':          'assets/bosses/Cave_lava_Wyrm.webp?v197',
  'dream_sandman':      'assets/Dream biom/Mobs/dream_sandman.webp',
  'sandman':            'assets/Dream biom/Mobs/dream_sandman.webp',
  'chickenKing':        'assets/Chicken Biom/chicken_King_Boss.webp?v260',
  'chicken_king':       'assets/Chicken Biom/chicken_King_Boss.webp?v260'
};

export const EXT_BOSSES = {};
for (const [key, src] of Object.entries(EXT_BOSS_DEFS)) {
  const img = new Image();
  img.src = src;
  EXT_BOSSES[key] = img;
}
window.EXT_BOSSES = EXT_BOSSES;
window.EXT_BOSS_DEFS = EXT_BOSS_DEFS;

const monstersNewSheetImg = new Image();
monstersNewSheetImg.src = (window.NEW_MONSTER_SHEET && window.NEW_MONSTER_SHEET.src) || 'assets/monsters_new_sheet.webp';
window.NEW_MONSTER_IMG = monstersNewSheetImg;

const zombieAnimSheetImg = new Image();
zombieAnimSheetImg.src = 'assets/monsters_new/zombie_anim/spritesheet.webp?v247';

const goblinAnimSheetImg = new Image();
goblinAnimSheetImg.src = 'assets/monsters_new/goblin_anim/spritesheet.webp?v260';

const nineSlimesSheetImg = new Image();
nineSlimesSheetImg.src = 'assets/monsters_new/9slimes_anim/spritesheet.webp?v250';
window.NINE_SLIMES_SHEET_IMG = nineSlimesSheetImg;

// ── NEW ANIMATED MONSTER SHEETS ──
const sharkAnimSheetImg = new Image();
sharkAnimSheetImg.src = 'assets/monsters_new/rpg_shark_anim/spritesheet.webp?v260';

const skeletonSmallAnimSheetImg = new Image();
skeletonSmallAnimSheetImg.src = 'assets/monsters_new/skeleton_small_anim/spritesheet.webp?v251';

const archerAnimSheetImg = new Image();
archerAnimSheetImg.src = 'assets/monsters_new/archer_anim/spritesheet.webp?v251';

const skeletonAnimSheetImg = new Image();
skeletonAnimSheetImg.src = 'assets/monsters_new/skeleton_anim/spritesheet.webp?v251';

const skeletonArcherAnimSheetImg = new Image();
skeletonArcherAnimSheetImg.src = 'assets/monsters_new/skeletonArcher_anim/spritesheet.webp?v251';

const boarAnimSheetImg = new Image();
boarAnimSheetImg.src = 'assets/monsters_new/boar_anim/spritesheet.webp?v251';

const stoneTitanAnimSheetImg = new Image();
stoneTitanAnimSheetImg.src = 'assets/monsters_new/stoneTitan_anim/spritesheet.webp?v251';

const wolfAnimSheetImg = new Image();
wolfAnimSheetImg.src = 'assets/monsters_new/wolf_anim/spritesheet.webp?v251';

const batAnimSheetImg = new Image();
batAnimSheetImg.src = 'assets/monsters_new/bat_anim/spritesheet.webp?v251';

const crocodileAnimSheetImg = new Image();
crocodileAnimSheetImg.src = 'assets/monsters_new/crocodile_anim/spritesheet.webp?v260';

const vampireAnimSheetImg = new Image();
vampireAnimSheetImg.src = 'assets/monsters_new/vampire_anim/spritesheet.webp?v260';

const banditRedAnimSheetImg = new Image();
banditRedAnimSheetImg.src = 'assets/monsters_new/rpg_banditRed_anim/spritesheet.webp?v260';

const beetleGiantAnimSheetImg = new Image();
beetleGiantAnimSheetImg.src = 'assets/monsters_new/beetleGiant/spritesheet.webp?v260';

const firecampAnimSheetImg = new Image();
firecampAnimSheetImg.src = 'assets/monsters_new/firecamp_anim/spritesheet.webp?v260';

const jellyfishAnimSheetImg = new Image();
jellyfishAnimSheetImg.src = 'assets/monsters_new/jellyfish_anim/spritesheet.webp?v260';

const campFoxAnimSheetImg = new Image();
campFoxAnimSheetImg.src = 'assets/monsters_new/campFox_anim/spritesheet.webp?v260';

const crowAnimSheetImg = new Image();
crowAnimSheetImg.src = 'assets/monsters_new/crow_anim/spritesheet.webp?v260';

const antSoldierAnimSheetImg = new Image();
antSoldierAnimSheetImg.src = 'assets/monsters_new/antSoldier_anim/spritesheet.webp?v260';

const plagueRatAnimSheetImg = new Image();
plagueRatAnimSheetImg.src = 'assets/monsters_new/plagueRat_anim/spritesheet.webp?v260';

const caveRatAnimSheetImg = new Image();
caveRatAnimSheetImg.src = 'assets/monsters_new/caveRat_anim/spritesheet.webp?v260';


const npcBartholomewSheetImg = new Image();
npcBartholomewSheetImg.src = 'assets/monsters_new/npc_bartholomew_anim/spritesheet.webp?v260';

const npcTariqSheetImg = new Image();
npcTariqSheetImg.src = 'assets/monsters_new/npc_tariq_anim/spritesheet.webp?v260';

const npcThrainSheetImg = new Image();
npcThrainSheetImg.src = 'assets/monsters_new/npc_thrain_anim/spritesheet.webp?v260';

const npcCaelenSheetImg = new Image();
npcCaelenSheetImg.src = 'assets/monsters_new/npc_caelen_anim/spritesheet.webp?v260';

const npcVesperSheetImg = new Image();
npcVesperSheetImg.src = 'assets/monsters_new/npc_vesper_anim/spritesheet.webp?v260';

const npcRikktSheetImg = new Image();
npcRikktSheetImg.src = 'assets/monsters_new/npc_rikkt_anim/spritesheet.webp?v260';

const npcMalakorSheetImg = new Image();
npcMalakorSheetImg.src = 'assets/monsters_new/npc_malakor_anim/spritesheet.webp?v260';

const npcAlistairSheetImg = new Image();
npcAlistairSheetImg.src = 'assets/monsters_new/npc_alistair_anim/spritesheet.webp?v260';

const npcVanceSheetImg = new Image();
npcVanceSheetImg.src = 'assets/monsters_new/npc_vance_anim/spritesheet.webp?v260';

const npcCorvusSheetImg = new Image();
npcCorvusSheetImg.src = 'assets/monsters_new/npc_corvus_anim/spritesheet.webp?v260';

const npcAldenSheetImg = new Image();
npcAldenSheetImg.src = 'assets/monsters_new/npc_alden_anim/spritesheet.webp?v332';
// Companions & Familiars
const compAldricSheetImg = new Image();
compAldricSheetImg.src = 'assets/monsters_new/comp_aldric_anim/spritesheet.webp?v260';

const compAsheSheetImg = new Image();
compAsheSheetImg.src = 'assets/monsters_new/comp_ashe_anim/spritesheet.webp?v260';

const compFenrirSheetImg = new Image();
compFenrirSheetImg.src = 'assets/monsters_new/comp_fenrir_anim/spritesheet.webp?v260';

const compKaelSheetImg = new Image();
compKaelSheetImg.src = 'assets/monsters_new/comp_kael_anim/spritesheet.webp?v260';

const compSeleneSheetImg = new Image();
compSeleneSheetImg.src = 'assets/monsters_new/comp_selene_anim/spritesheet.webp?v260';

const compMorvathSheetImg = new Image();
compMorvathSheetImg.src = 'assets/monsters_new/comp_morvath_anim/spritesheet.webp?v260';

const compHealerSheetImg = new Image();
compHealerSheetImg.src = 'assets/monsters_new/comp_healer_anim/spritesheet.webp?v260';

const compScoutSheetImg = new Image();
compScoutSheetImg.src = 'assets/monsters_new/comp_scout_anim/spritesheet.webp?v260';

// ─── 5 MOUNTAIN BIOMES ANIMATED MOBS (12 Unique Mobs, 8-frame 256x256 @ 8 fps) ───
const loadMountainMobSheet = (folder) => {
  if (typeof Image === 'undefined') return null;
  const rawPath = `assets/mountain biom/mountain_biom_mobs/${folder}/spritesheet.webp`;
  const encPath = `assets/mountain%20biom/mountain_biom_mobs/${folder}/spritesheet.webp`;
  const img = new Image();
  img.src = encPath;
  img.onerror = () => { if (img.src !== rawPath) img.src = rawPath; };
  return img;
};

const loadMountainMobPortrait = (name) => {
  if (typeof Image === 'undefined') return null;
  const rawPath = `assets/mountain biom/mountain_biom_mobs/${name}.webp`;
  const encPath = `assets/mountain%20biom/mountain_biom_mobs/${name}.webp`;
  const img = new Image();
  img.src = encPath;
  img.onerror = () => { if (img.src !== rawPath) img.src = rawPath; };
  return img;
};

// Mountain 1: Alchemist's Caldera (Fungal Wastes)
const cyclopsMountain1SheetImg = loadMountainMobSheet('cyclops_mountain1_anim');
const unicornMountain1SheetImg = loadMountainMobSheet('unicorn_mountain1_anim');
// Mountain 2: The Whispering Grove (Forest)
const drakeMountain2SheetImg = loadMountainMobSheet('drake_mountain2_anim');
const warewoolfMountain2SheetImg = loadMountainMobSheet('warewoolf_mountain2_anim');
// Mountain 3: The Arcane Sanctuary (Magic Forest)
const icegiantMountain3SheetImg = loadMountainMobSheet('icegiant_mountain3_anim');
const minotaurMountain3SheetImg = loadMountainMobSheet('minotaur_mountain3_anim');
// Mountain 4: The Dread Crags (Deadlands)
const berserkerMountain4SheetImg = loadMountainMobSheet('berserker_mountain4_anim');
const flyguardianMountain4SheetImg = loadMountainMobSheet('flyguardian_mountain4_anim');
const grifinMountain4SheetImg = loadMountainMobSheet('grifin_mountain4_anim');
// Mountain 5: The Frostpeak Hollow (Snow & Crystal Peaks)
const flyonehanddrakMountain5SheetImg = loadMountainMobSheet('flyonehanddrak_mountain5_anim');
const reddragiondrakeMountain5SheetImg = loadMountainMobSheet('reddragiondrake_mountain5_anim');
const threeheadedMountain5SheetImg = loadMountainMobSheet('threeheaded_mountain5_anim');

// Portraits / Static Fallbacks
const cyclopsMountain1PortraitImg = loadMountainMobPortrait('cyclops_mountain1');
const unicornMountain1PortraitImg = loadMountainMobPortrait('unicorn_mountain1');
const drakeMountain2PortraitImg = loadMountainMobPortrait('drake_mountain2');
const warewoolfMountain2PortraitImg = loadMountainMobPortrait('warewoolf_mountain2');
const icegiantMountain3PortraitImg = loadMountainMobPortrait('icegiant_mountain3');
const minotaurMountain3PortraitImg = loadMountainMobPortrait('minotaur_mountain3');
const berserkerMountain4PortraitImg = loadMountainMobPortrait('berserker_mountain4');
const flyguardianMountain4PortraitImg = loadMountainMobPortrait('flyguardian_mountain4');
const grifinMountain4PortraitImg = loadMountainMobPortrait('grifin_mountain4');
const flyonehanddrakMountain5PortraitImg = loadMountainMobPortrait('flyonehanddrak_mountain5');
const reddragiondrakeMountain5PortraitImg = loadMountainMobPortrait('reddragiondrake_mountain5');
const threeheadedMountain5PortraitImg = loadMountainMobPortrait('threeheaded_mountain5');

const MOUNTAIN_MOBS_ASSETS = {
  cyclops_mountain1: { sheet: cyclopsMountain1SheetImg, portrait: cyclopsMountain1PortraitImg },
  unicorn_mountain1: { sheet: unicornMountain1SheetImg, portrait: unicornMountain1PortraitImg },
  drake_mountain2: { sheet: drakeMountain2SheetImg, portrait: drakeMountain2PortraitImg },
  warewoolf_mountain2: { sheet: warewoolfMountain2SheetImg, portrait: warewoolfMountain2PortraitImg },
  icegiant_mountain3: { sheet: icegiantMountain3SheetImg, portrait: icegiantMountain3PortraitImg },
  minotaur_mountain3: { sheet: minotaurMountain3SheetImg, portrait: minotaurMountain3PortraitImg },
  berserker_mountain4: { sheet: berserkerMountain4SheetImg, portrait: berserkerMountain4PortraitImg },
  flyguardian_mountain4: { sheet: flyguardianMountain4SheetImg, portrait: flyguardianMountain4PortraitImg },
  grifin_mountain4: { sheet: grifinMountain4SheetImg, portrait: grifinMountain4PortraitImg },
  flyonehanddrak_mountain5: { sheet: flyonehanddrakMountain5SheetImg, portrait: flyonehanddrakMountain5PortraitImg },
  reddragiondrake_mountain5: { sheet: reddragiondrakeMountain5SheetImg, portrait: reddragiondrakeMountain5PortraitImg },
  threeheaded_mountain5: { sheet: threeheadedMountain5SheetImg, portrait: threeheadedMountain5PortraitImg }
};

// Dedicated Mob loaders for Animated Mobs (loadLocalMobImg declared near top)

// RPG Snake & Mantis (8 frames @ 8 fps, 128x128)
const snakeAnimSheetImg = loadLocalMobImg('assets/monsters_new/rpg_snake_anim/spritesheet.webp');
const snakePortraitImg = loadLocalMobImg('assets/monsters_new/rpg_snake.webp');
const mantisAnimSheetImg = loadLocalMobImg('assets/monsters_new/mantis_anim/spritesheet.webp');
const mantisPortraitImg = loadLocalMobImg('assets/monsters_new/rpg_mantis.webp');

// White Shark (8 frames @ 10 fps, 196x92, strictly cropped without Kraken)
const whitesharkSheetImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/boss_whiteshark/whiteshark_spritesheet.webp');
const whitesharkPortraitImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/boss_whiteshark/whiteshark.webp');

// 6 Abyssal Animated Mobs (8 frames @ 8 fps, with dedicated cropped spritesheets & portraits)
const abyssNeedleFishSheetImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_needle_fish_anim/spritesheet.webp');
const abyssNeedleFishPortraitImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_needle_fish_anim/portrait.webp');
const abyssSquidAnimSheetImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_squid_anim/spritesheet.webp');
const abyssSquidAnimPortraitImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_squid_anim/portrait.webp');
const abyssCoelacanthSheetImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_coelacanth_anim/spritesheet.webp');
const abyssCoelacanthPortraitImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_coelacanth_anim/portrait.webp');
const abyssIsopodSheetImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_isopod_anim/spritesheet.webp');
const abyssIsopodPortraitImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_isopod_anim/portrait.webp');
const abyssPufferfishSheetImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_pufferfish_anim/spritesheet.webp');
const abyssPufferfishPortraitImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_pufferfish_anim/portrait.webp');
const abyssDunkleosteusSheetImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_dunkleosteus_anim/spritesheet.webp');
const abyssDunkleosteusPortraitImg = loadLocalMobImg('assets/Abyss Biom/mobs_anim/abyss_dunkleosteus_anim/portrait.webp');

// 7 New Animated Mobs (8 frames @ 8 fps, 128x128)
const voidSpiritAnimSheetImg = loadLocalMobImg('assets/monsters_new/rpg_voidSpirit_anim/spritesheet.webp');
const voidSpiritPortraitImg = loadLocalMobImg('assets/monsters_new/rpg_voidSpirit_anim/source.webp');

const voidHorrorAnimSheetImg = loadLocalMobImg('assets/monsters_new/voidHorror_anim/spritesheet.webp');
const voidHorrorPortraitImg = loadLocalMobImg('assets/monsters_new/voidHorror_anim/source.webp');

const voidlingAnimSheetImg = loadLocalMobImg('assets/monsters_new/voidling_anim/spritesheet.webp');
const voidlingPortraitImg = loadLocalMobImg('assets/monsters_new/voidling_anim/source.webp');

const earthGolemAnimSheetImg = loadLocalMobImg('assets/monsters_new/rpg_earthGolem_anim/spritesheet.webp');
const earthGolemPortraitImg = loadLocalMobImg('assets/monsters_new/rpg_earthGolem_anim/source.webp');

const mummyAnimSheetImg = loadLocalMobImg('assets/monsters_new/mummy_anim/spritesheet.webp');
const mummyPortraitImg = loadLocalMobImg('assets/monsters_new/mummy_anim/source.webp');

const fairyAnimSheetImg = loadLocalMobImg('assets/monsters_new/rpg_fairy_anim/spritesheet.webp');
const fairyPortraitImg = loadLocalMobImg('assets/monsters_new/rpg_fairy_anim/source.webp');

const impAnimSheetImg = loadLocalMobImg('assets/monsters_new/rpg_imp_anim/spritesheet.webp');
const impPortraitImg = loadLocalMobImg('assets/monsters_new/rpg_imp_anim/source.webp');

if (typeof window !== 'undefined') {
  window.MOUNTAIN_MOBS_ASSETS = MOUNTAIN_MOBS_ASSETS;
  window.EXT_ABYSS_MOBS = window.EXT_ABYSS_MOBS || {};
  window.EXT_ABYSS_MOBS['cyclops_mountain1'] = cyclopsMountain1PortraitImg;
  window.EXT_ABYSS_MOBS['unicorn_mountain1'] = unicornMountain1PortraitImg;
  window.EXT_ABYSS_MOBS['drake_mountain2'] = drakeMountain2PortraitImg;
  window.EXT_ABYSS_MOBS['warewoolf_mountain2'] = warewoolfMountain2PortraitImg;
  window.EXT_ABYSS_MOBS['icegiant_mountain3'] = icegiantMountain3PortraitImg;
  window.EXT_ABYSS_MOBS['minotaur_mountain3'] = minotaurMountain3PortraitImg;
  window.EXT_ABYSS_MOBS['berserker_mountain4'] = berserkerMountain4PortraitImg;
  window.EXT_ABYSS_MOBS['flyguardian_mountain4'] = flyguardianMountain4PortraitImg;
  window.EXT_ABYSS_MOBS['grifin_mountain4'] = grifinMountain4PortraitImg;
  window.EXT_ABYSS_MOBS['flyonehanddrak_mountain5'] = flyonehanddrakMountain5PortraitImg;
  window.EXT_ABYSS_MOBS['reddragiondrake_mountain5'] = reddragiondrakeMountain5PortraitImg;
  window.EXT_ABYSS_MOBS['threeheaded_mountain5'] = threeheadedMountain5PortraitImg;

  // Snake, Mantis, White Shark, and 6 Abyssal Mobs
  window.EXT_ABYSS_MOBS['snake'] = snakePortraitImg;
  window.EXT_ABYSS_MOBS['rpg_snake'] = snakePortraitImg;
  window.EXT_ABYSS_MOBS['mantis'] = mantisPortraitImg;
  window.EXT_ABYSS_MOBS['rpg_mantis'] = mantisPortraitImg;
  window.EXT_ABYSS_MOBS['white_shark'] = whitesharkPortraitImg;
  window.EXT_ABYSS_MOBS['abyss_needle_fish'] = abyssNeedleFishPortraitImg;
  window.EXT_ABYSS_MOBS['abyss_squid_anim'] = abyssSquidAnimPortraitImg;
  window.EXT_ABYSS_MOBS['abyss_coelacanth'] = abyssCoelacanthPortraitImg;
  window.EXT_ABYSS_MOBS['abyss_isopod'] = abyssIsopodPortraitImg;
  window.EXT_ABYSS_MOBS['abyss_pufferfish'] = abyssPufferfishPortraitImg;
  window.EXT_ABYSS_MOBS['abyss_dunkleosteus'] = abyssDunkleosteusPortraitImg;

  // 7 New Animated Mobs Portraits
  window.EXT_ABYSS_MOBS['rpg_voidSpirit'] = voidSpiritPortraitImg;
  window.EXT_ABYSS_MOBS['voidSpirit'] = voidSpiritPortraitImg;
  window.EXT_ABYSS_MOBS['void_spirit'] = voidSpiritPortraitImg;

  window.EXT_ABYSS_MOBS['voidHorror'] = voidHorrorPortraitImg;
  window.EXT_ABYSS_MOBS['void_horror'] = voidHorrorPortraitImg;

  window.EXT_ABYSS_MOBS['voidling'] = voidlingPortraitImg;

  window.EXT_ABYSS_MOBS['rpg_earthGolem'] = earthGolemPortraitImg;
  window.EXT_ABYSS_MOBS['earthGolem'] = earthGolemPortraitImg;
  window.EXT_ABYSS_MOBS['earth_golem'] = earthGolemPortraitImg;

  window.EXT_ABYSS_MOBS['mummy'] = mummyPortraitImg;

  window.EXT_ABYSS_MOBS['rpg_fairy'] = fairyPortraitImg;
  window.EXT_ABYSS_MOBS['fairy'] = fairyPortraitImg;

  window.EXT_ABYSS_MOBS['rpg_imp'] = impPortraitImg;
  window.EXT_ABYSS_MOBS['imp'] = impPortraitImg;
}


export const MONSTER_ANIMATIONS = {
  // Plains Boss Animated (Walk: 8 frames, 256x256 @ 8 fps)
  plains_boss: { img: plainsBossWalkSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/bosses/plains_boss_anim/walk_spritesheet.webp' },
  plainsBoss:  { img: plainsBossWalkSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/bosses/plains_boss_anim/walk_spritesheet.webp' },

  // 7 New Animated Mobs (8 frames @ 8 fps, 128x128)
  voidSpirit:     { img: voidSpiritAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_voidSpirit_anim/spritesheet.webp' },
  rpg_voidSpirit: { img: voidSpiritAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_voidSpirit_anim/spritesheet.webp' },
  void_spirit:    { img: voidSpiritAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_voidSpirit_anim/spritesheet.webp' },

  voidHorror:     { img: voidHorrorAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/voidHorror_anim/spritesheet.webp' },
  void_horror:    { img: voidHorrorAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/voidHorror_anim/spritesheet.webp' },

  voidling:       { img: voidlingAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/voidling_anim/spritesheet.webp' },

  earthGolem:     { img: earthGolemAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_earthGolem_anim/spritesheet.webp' },
  rpg_earthGolem: { img: earthGolemAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_earthGolem_anim/spritesheet.webp' },
  earth_golem:    { img: earthGolemAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_earthGolem_anim/spritesheet.webp' },

  mummy:          { img: mummyAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/mummy_anim/spritesheet.webp' },

  fairy:          { img: fairyAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_fairy_anim/spritesheet.webp' },
  rpg_fairy:      { img: fairyAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_fairy_anim/spritesheet.webp' },

  imp:            { img: impAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_imp_anim/spritesheet.webp' },
  rpg_imp:        { img: impAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_imp_anim/spritesheet.webp' },
  rpg_impSmall:   { img: impAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_imp_anim/spritesheet.webp' },
  zombie: {
    img: zombieAnimSheetImg,
    frameCount: 8,
    frameW: 128,
    frameH: 128,
    fps: 8,
    src: 'assets/monsters_new/zombie_anim/spritesheet.webp?v247'
  },
  goblin: {
    img: goblinAnimSheetImg,
    frameCount: 8,
    frameW: 128,
    frameH: 128,
    fps: 8,
    src: 'assets/monsters_new/goblin_anim/spritesheet.webp?v260'
  },
  rpg_goblin: {
    img: goblinAnimSheetImg,
    frameCount: 8,
    frameW: 128,
    frameH: 128,
    fps: 8,
    src: 'assets/monsters_new/goblin_anim/spritesheet.webp?v260'
  },
  // ── 9 SLIMES MULTI-SPRITE SHEET (Row 0: Water, Lava, Ice | Row 1: Green, Blood, Toxic | Row 2: Stone, Crystal, Void) ──
  slime_water:   { img: nineSlimesSheetImg, stepX: 256, subX: 15, subY: 38, sw: 69, sh: 46, frameCount: 8, fps: 8 },
  rpg_slime_blue:{ img: nineSlimesSheetImg, stepX: 256, subX: 15, subY: 38, sw: 69, sh: 46, frameCount: 8, fps: 8 },
  slime_lava:    { img: nineSlimesSheetImg, stepX: 256, subX: 98, subY: 22, sw: 66, sh: 62, frameCount: 8, fps: 8 },
  rpg_slimeLava: { img: nineSlimesSheetImg, stepX: 256, subX: 98, subY: 22, sw: 66, sh: 62, frameCount: 8, fps: 8 },
  lavaSlime:     { img: nineSlimesSheetImg, stepX: 256, subX: 98, subY: 22, sw: 66, sh: 62, frameCount: 8, fps: 8 },
  slime_ice:     { img: nineSlimesSheetImg, stepX: 256, subX: 180, subY: 29, sw: 67, sh: 57, frameCount: 8, fps: 8 },
  rpg_slimeIce:  { img: nineSlimesSheetImg, stepX: 256, subX: 180, subY: 29, sw: 67, sh: 57, frameCount: 8, fps: 8 },
  iceSlime:      { img: nineSlimesSheetImg, stepX: 256, subX: 180, subY: 29, sw: 67, sh: 57, frameCount: 8, fps: 8 },
  slime_green:   { img: nineSlimesSheetImg, stepX: 256, subX: 16, subY: 94, sw: 68, sh: 59, frameCount: 8, fps: 8 },
  slime:         { img: nineSlimesSheetImg, stepX: 256, subX: 16, subY: 94, sw: 68, sh: 59, frameCount: 8, fps: 8 },
  rpg_slime_green:{ img: nineSlimesSheetImg, stepX: 256, subX: 16, subY: 94, sw: 68, sh: 59, frameCount: 8, fps: 8 },
  slime_red:     { img: nineSlimesSheetImg, stepX: 256, subX: 98, subY: 95, sw: 67, sh: 54, frameCount: 8, fps: 8 },
  rpg_slimeRed:  { img: nineSlimesSheetImg, stepX: 256, subX: 98, subY: 95, sw: 67, sh: 54, frameCount: 8, fps: 8 },
  slime_toxic:   { img: nineSlimesSheetImg, stepX: 256, subX: 181, subY: 102, sw: 67, sh: 51, frameCount: 8, fps: 8 },
  rpg_slimeToxic:{ img: nineSlimesSheetImg, stepX: 256, subX: 181, subY: 102, sw: 67, sh: 51, frameCount: 8, fps: 8 },
  slime_stone:   { img: nineSlimesSheetImg, stepX: 256, subX: 16, subY: 168, sw: 67, sh: 47, frameCount: 8, fps: 8 },
  slime_crystal: { img: nineSlimesSheetImg, stepX: 256, subX: 95, subY: 163, sw: 71, sh: 54, frameCount: 8, fps: 8 },
  slime_dark:    { img: nineSlimesSheetImg, stepX: 256, subX: 179, subY: 161, sw: 68, sh: 59, frameCount: 8, fps: 8 },

  // ── SHARK & WHITE SHARK (Fast Crawl / Land-Sea Swim) ──
  shark:        { img: sharkAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 16, src: 'assets/monsters_new/rpg_shark_anim/spritesheet.webp?v260' },
  rpg_shark:    { img: sharkAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 16, src: 'assets/monsters_new/rpg_shark_anim/spritesheet.webp?v260' },
  white_shark:  { img: whitesharkSheetImg, frameCount: 8, frameW: 196, frameH: 92, fps: 10, water: true, isAquatic: true, src: 'assets/Abyss Biom/mobs_anim/boss_whiteshark/whiteshark_spritesheet.webp' },

  // ── 6 ABYSSAL UNIQUE ANIMATED MOBS (8 frames @ 8 fps, water aquatic) ──
  abyss_needle_fish: { img: abyssNeedleFishSheetImg, frameCount: 8, frameW: 64,  frameH: 32, fps: 8, water: true, isAquatic: true, src: 'assets/Abyss Biom/mobs_anim/abyss_needle_fish_anim/spritesheet.webp' },
  abyss_squid:       { img: abyssSquidAnimSheetImg,  frameCount: 8, frameW: 112, frameH: 64, fps: 8, water: true, isAquatic: true, src: 'assets/Abyss Biom/mobs_anim/abyss_squid_anim/spritesheet.webp' },
  abyss_squid_anim:  { img: abyssSquidAnimSheetImg,  frameCount: 8, frameW: 112, frameH: 64, fps: 8, water: true, isAquatic: true, src: 'assets/Abyss Biom/mobs_anim/abyss_squid_anim/spritesheet.webp' },
  abyss_coelacanth:  { img: abyssCoelacanthSheetImg, frameCount: 8, frameW: 96,  frameH: 56, fps: 8, water: true, isAquatic: true, src: 'assets/Abyss Biom/mobs_anim/abyss_coelacanth_anim/spritesheet.webp' },
  abyss_isopod:      { img: abyssIsopodSheetImg,     frameCount: 8, frameW: 144, frameH: 80, fps: 8, water: true, isAquatic: true, src: 'assets/Abyss Biom/mobs_anim/abyss_isopod_anim/spritesheet.webp' },
  abyss_pufferfish:  { img: abyssPufferfishSheetImg, frameCount: 8, frameW: 108, frameH: 76, fps: 8, water: true, isAquatic: true, src: 'assets/Abyss Biom/mobs_anim/abyss_pufferfish_anim/spritesheet.webp' },
  abyss_dunkleosteus:{ img: abyssDunkleosteusSheetImg, frameCount: 8, frameW: 196, frameH: 96, fps: 8, water: true, isAquatic: true, src: 'assets/Abyss Biom/mobs_anim/abyss_dunkleosteus_anim/spritesheet.webp' },

  // ── RPG SNAKE & MANTIS (8 frames @ 8 fps, 128x128) ──
  snake:      { img: snakeAnimSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_snake_anim/spritesheet.webp' },
  rpg_snake:  { img: snakeAnimSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/rpg_snake_anim/spritesheet.webp' },
  mantis:     { img: mantisAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/mantis_anim/spritesheet.webp' },
  rpg_mantis: { img: mantisAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/mantis_anim/spritesheet.webp' },

  // ── SKELETON SMALL (Crawl walk: 8 frames) ──
  rpg_skeleton_small: { img: skeletonSmallAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/skeleton_small_anim/spritesheet.webp?v251' },
  dead_knight:        { img: skeletonSmallAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/skeleton_small_anim/spritesheet.webp?v251' },

  // ── ARCHER (Smooth run & draw: 8 frames) ──
  archer:        { img: archerAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/archer_anim/spritesheet.webp?v251' },
  rpg_archer:    { img: archerAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/archer_anim/spritesheet.webp?v251' },
  plains_archer: { img: archerAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/archer_anim/spritesheet.webp?v251' },

  // ── SKELETON (Warrior walk: 8 frames) ──
  skeleton:            { img: skeletonAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/skeleton_anim/spritesheet.webp?v251' },
  rpg_skeletonWarrior: { img: skeletonAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/skeleton_anim/spritesheet.webp?v251' },
  sandKnight:          { img: skeletonAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/skeleton_anim/spritesheet.webp?v251' },

  // ── SKELETON ARCHER (Walk & shoot: 8 frames) ──
  skeletonArcher:     { img: skeletonArcherAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/skeletonArcher_anim/spritesheet.webp?v251' },
  rpg_skeletonArcher: { img: skeletonArcherAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/skeletonArcher_anim/spritesheet.webp?v251' },

  // ── BOAR (Smooth walk / charge: 8 frames) ──
  boar:     { img: boarAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/boar_anim/spritesheet.webp?v251' },
  rpg_boar: { img: boarAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/boar_anim/spritesheet.webp?v251' },

  // ── STONE TITAN (Heavy titan stride: 8 frames) ──
  stoneTitan:     { img: stoneTitanAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/stoneTitan_anim/spritesheet.webp?v251' },
  rpg_stoneTitan: { img: stoneTitanAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/stoneTitan_anim/spritesheet.webp?v251' },
  plains_brute:   { img: stoneTitanAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/stoneTitan_anim/spritesheet.webp?v251' },

  // ── WOLF (Wolf pack run: 8 frames) ──
  wolf:            { img: wolfAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/wolf_anim/spritesheet.webp?v251' },
  rpg_wolfGray:    { img: wolfAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/wolf_anim/spritesheet.webp?v251' },
  rpg_wolfBlack:   { img: wolfAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/wolf_anim/spritesheet.webp?v251' },
  rpg_wolfWhite:   { img: wolfAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/wolf_anim/spritesheet.webp?v251' },
  direWolf:        { img: wolfAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/wolf_anim/spritesheet.webp?v251' },
  rpg_direWolf:    { img: wolfAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/wolf_anim/spritesheet.webp?v251' },
  frostWolf:       { img: wolfAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/wolf_anim/spritesheet.webp?v251' },
  snow_fox:        { img: wolfAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/wolf_anim/spritesheet.webp?v251' },
  badlands_coyote: { img: wolfAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/wolf_anim/spritesheet.webp?v251' },

  // ── BAT (Wing flap fly cycle: 12 frames) ──
  bat:          { img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },
  rpg_bat_small:{ img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },
  rpg_batFire:  { img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },
  rpg_batIce:   { img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },
  rpg_batGhost: { img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },
  fireBat:      { img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },
  iceBat:       { img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },
  ghostBat:     { img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },
  direBat:      { img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },
  void_eye:     { img: batAnimSheetImg, frameCount: 12, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/bat_anim/spritesheet.webp?v251' },

  // ── CROCODILE (8 frames @ 8 fps, 128x128) ──
  crocodile:     { img: crocodileAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/crocodile_anim/spritesheet.webp?v260' },
  rpg_crocodile: { img: crocodileAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/crocodile_anim/spritesheet.webp?v260' },

  // ── VAMPIRE (8 frames @ 8 fps, 256x256) ──
  vampire:       { img: vampireAnimSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/monsters_new/vampire_anim/spritesheet.webp?v260' },
  rpg_vampire:   { img: vampireAnimSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/monsters_new/vampire_anim/spritesheet.webp?v260' },
  vampireLord:   { img: vampireAnimSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/monsters_new/vampire_anim/spritesheet.webp?v260' },
  Vampire_Lord:  { img: vampireAnimSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/monsters_new/vampire_anim/spritesheet.webp?v260' },

  // ── BANDIT RED (8 frames @ 8 fps, 256x256) ──
  bandit:           { img: banditRedAnimSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/monsters_new/rpg_banditRed_anim/spritesheet.webp?v260' },
  rpg_banditRed:    { img: banditRedAnimSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/monsters_new/rpg_banditRed_anim/spritesheet.webp?v260' },
  badlands_slinger: { img: banditRedAnimSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/monsters_new/rpg_banditRed_anim/spritesheet.webp?v260' },
  banditWarlord:    { img: banditRedAnimSheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/monsters_new/rpg_banditRed_anim/spritesheet.webp?v260' },

  // ── GIANT BEETLE (8 frames @ 8 fps, 128x128) ──
  beetle:          { img: beetleGiantAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/beetleGiant/spritesheet.webp?v260' },
  rpg_beetleGiant: { img: beetleGiantAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/beetleGiant/spritesheet.webp?v260' },
  scarab:          { img: beetleGiantAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/beetleGiant/spritesheet.webp?v260' },
  rockBeetle:      { img: beetleGiantAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/beetleGiant/spritesheet.webp?v260' },

  // ── JELLYFISH (8 frames @ 8 fps, 128x128) ──
  jellyfish:       { img: jellyfishAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/jellyfish_anim/spritesheet.webp?v260' },
  rpg_jellyfish:   { img: jellyfishAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/jellyfish_anim/spritesheet.webp?v260' },
  abyss_jelly:     { img: jellyfishAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/jellyfish_anim/spritesheet.webp?v260' },

  // ── CAMP FOX / EMBER (8 frames @ 8 fps, 128x128) ──
  campFox:         { img: campFoxAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/campFox_anim/spritesheet.webp?v260' },
  comp_fox:        { img: campFoxAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/campFox_anim/spritesheet.webp?v260' },
  fox:             { img: campFoxAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/campFox_anim/spritesheet.webp?v260' },

  // ── CROW (8 frames @ 8 fps, 128x128) ──
  crow:            { img: crowAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/crow_anim/spritesheet.webp?v260' },
  rpg_crow:        { img: crowAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/crow_anim/spritesheet.webp?v260' },
  desert_vulture:  { img: crowAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/crow_anim/spritesheet.webp?v260' },

  // ── ANT SOLDIER (8 frames @ 8 fps, 128x128) ──
  antSoldier:      { img: antSoldierAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/antSoldier_anim/spritesheet.webp?v260' },
  rpg_antSoldier:  { img: antSoldierAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/antSoldier_anim/spritesheet.webp?v260' },
  ant:             { img: antSoldierAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/antSoldier_anim/spritesheet.webp?v260' },

  // ── PLAGUE RAT (8 frames @ 8 fps, 128x128) ──
  plagueRat:       { img: plagueRatAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/plagueRat_anim/spritesheet.webp?v260' },
  rpg_plagueRat:   { img: plagueRatAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/plagueRat_anim/spritesheet.webp?v260' },

  // ── CAVE RAT (8 frames @ 8 fps, 128x128) ──
  caveRat:         { img: caveRatAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/caveRat_anim/spritesheet.webp?v260' },
  rpg_caveRat:     { img: caveRatAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/caveRat_anim/spritesheet.webp?v260' },
  rat:             { img: caveRatAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/caveRat_anim/spritesheet.webp?v260' },

  // ── GIANT BEETLE ALIASES ──
  rpg_beetleFire:  { img: beetleGiantAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/beetleGiant/spritesheet.webp?v260' },
  hellBeetle:      { img: beetleGiantAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/beetleGiant/spritesheet.webp?v260' },

  // ── FIRE CAMP / FIREWOOD (8 frames @ 8 fps, 128x128) ──
  firecamp: { img: firecampAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/firecamp_anim/spritesheet.webp?v260' },
  campfire: { img: firecampAnimSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, src: 'assets/monsters_new/firecamp_anim/spritesheet.webp?v260' },

  // ── WORLD NPCS (8 frames @ 8 fps, 128x128, idle) ──
  npc_bartholomew: { img: npcBartholomewSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_bartholomew_anim/spritesheet.webp?v260' },
  npc_tariq:       { img: npcTariqSheetImg,       frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_tariq_anim/spritesheet.webp?v260' },
  npc_thrain:      { img: npcThrainSheetImg,      frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_thrain_anim/spritesheet.webp?v260' },
  npc_caelen:      { img: npcCaelenSheetImg,      frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_caelen_anim/spritesheet.webp?v260' },
  npc_vesper:      { img: npcVesperSheetImg,      frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_vesper_anim/spritesheet.webp?v260' },
  npc_rikkt:       { img: npcRikktSheetImg,       frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_rikkt_anim/spritesheet.webp?v260' },
  npc_malakor:     { img: npcMalakorSheetImg,     frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_malakor_anim/spritesheet.webp?v260' },
  npc_alistair:    { img: npcAlistairSheetImg,    frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_alistair_anim/spritesheet.webp?v260' },
  npc_vance:       { img: npcVanceSheetImg,       frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_vance_anim/spritesheet.webp?v260' },
  npc_corvus:      { img: npcCorvusSheetImg,      frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_corvus_anim/spritesheet.webp?v260' },
  npc_alden:       { img: npcAldenSheetImg,       frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/npc_alden_anim/spritesheet.webp?v332' },
  mad_farmer_idle: { img: CHICKEN_ASSETS.npcs.madFarmerIdleSheet, frameCount: 8, frameW: 256, frameH: 256, fps: 8, isIdle: true, src: 'assets/Chicken Biom/mad_poultry_farmer/spritesheet.webp?v260' },
  mad_poultry_farmer: { img: CHICKEN_ASSETS.npcs.madFarmerIdleSheet, frameCount: 8, frameW: 256, frameH: 256, fps: 8, isIdle: true, src: 'assets/Chicken Biom/mad_poultry_farmer/spritesheet.webp?v260' },
  chicken:       { img: CHICKEN_ASSETS.anim.chickenSwarmSheet, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/Chicken Biom/chicken_swarm_anim/spritesheet.webp?v260' },
  chicken_swarm: { img: CHICKEN_ASSETS.anim.chickenSwarmSheet, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/Chicken Biom/chicken_swarm_anim/spritesheet.webp?v260' },
  rooster:       { img: CHICKEN_ASSETS.anim.roosterSheet,      frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/Chicken Biom/rooster_mob_anim/spritesheet.webp?v260' },
  rooster_mob:   { img: CHICKEN_ASSETS.anim.roosterSheet,      frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/Chicken Biom/rooster_mob_anim/spritesheet.webp?v260' },
  giantChicken:  { img: CHICKEN_ASSETS.anim.giantChickenSheet, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/Chicken Biom/Giant_chicken_Tank_mob_anim/spritesheet.webp?v260' },
  giant_chicken: { img: CHICKEN_ASSETS.anim.giantChickenSheet, frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/Chicken Biom/Giant_chicken_Tank_mob_anim/spritesheet.webp?v260' },
  chickenKing:   { img: CHICKEN_ASSETS.anim.chickenKingSheet,  frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/Chicken Biom/chicken_King_Boss_anim/spritesheet.webp?v260' },
  chicken_king:  { img: CHICKEN_ASSETS.anim.chickenKingSheet,  frameCount: 8, frameW: 256, frameH: 256, fps: 8, src: 'assets/Chicken Biom/chicken_King_Boss_anim/spritesheet.webp?v260' },

  // ─── 5 MOUNTAIN BIOMES ANIMATED MOBS (12 Unique Mobs, 8-frame 256x256 @ 8 fps) ───
  // Mountain 1 (Alchemist's Caldera): Cyclops & Unicorn
  cyclops_mountain1:      { img: cyclopsMountain1SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.793, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/cyclops_mountain1_anim/spritesheet.webp' },
  cyclops_mountain1_anim: { img: cyclopsMountain1SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.793, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/cyclops_mountain1_anim/spritesheet.webp' },
  unicorn_mountain1:      { img: unicornMountain1SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.789, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/unicorn_mountain1_anim/spritesheet.webp' },
  unicorn_mountain1_anim: { img: unicornMountain1SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.789, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/unicorn_mountain1_anim/spritesheet.webp' },

  // Mountain 2 (The Whispering Grove): Drake & Werewolf
  drake_mountain2:        { img: drakeMountain2SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.742, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/drake_mountain2_anim/spritesheet.webp' },
  drake_mountain2_anim:   { img: drakeMountain2SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.742, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/drake_mountain2_anim/spritesheet.webp' },
  warewoolf_mountain2:      { img: warewoolfMountain2SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.762, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/warewoolf_mountain2_anim/spritesheet.webp' },
  warewoolf_mountain2_anim: { img: warewoolfMountain2SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.762, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/warewoolf_mountain2_anim/spritesheet.webp' },
  werewolf_mountain2:       { img: warewoolfMountain2SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.762, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/warewoolf_mountain2_anim/spritesheet.webp' },

  // Mountain 3 (The Arcane Sanctuary): Ice Giant & Minotaur
  icegiant_mountain3:      { img: icegiantMountain3SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.805, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/icegiant_mountain3_anim/spritesheet.webp' },
  icegiant_mountain3_anim: { img: icegiantMountain3SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.805, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/icegiant_mountain3_anim/spritesheet.webp' },
  minotaur_mountain3:      { img: minotaurMountain3SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.801, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/minotaur_mountain3_anim/spritesheet.webp' },
  minotaur_mountain3_anim: { img: minotaurMountain3SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.801, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/minotaur_mountain3_anim/spritesheet.webp' },

  // Mountain 4 (The Dread Crags): Berserker, Flying Guardian & Griffin
  berserker_mountain4:        { img: berserkerMountain4SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.801, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/berserker_mountain4_anim/spritesheet.webp' },
  berserker_mountain4_anim:   { img: berserkerMountain4SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.801, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/berserker_mountain4_anim/spritesheet.webp' },
  flyguardian_mountain4:      { img: flyguardianMountain4SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.801, isFlyer: true, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/flyguardian_mountain4_anim/spritesheet.webp' },
  flyguardian_mountain4_anim: { img: flyguardianMountain4SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.801, isFlyer: true, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/flyguardian_mountain4_anim/spritesheet.webp' },
  grifin_mountain4:           { img: grifinMountain4SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.797, isFlyer: true, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/grifin_mountain4_anim/spritesheet.webp' },
  grifin_mountain4_anim:      { img: grifinMountain4SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.797, isFlyer: true, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/grifin_mountain4_anim/spritesheet.webp' },
  griffin_mountain4:          { img: grifinMountain4SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.797, isFlyer: true, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/grifin_mountain4_anim/spritesheet.webp' },

  // Mountain 5 (The Frostpeak Hollow): Flying One-Hand Drake, Red Dragon Drake & Three-Headed Chimera
  flyonehanddrak_mountain5:      { img: flyonehanddrakMountain5SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.777, isFlyer: true, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/flyonehanddrak_mountain5_anim/spritesheet.webp' },
  flyonehanddrak_mountain5_anim: { img: flyonehanddrakMountain5SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.777, isFlyer: true, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/flyonehanddrak_mountain5_anim/spritesheet.webp' },
  reddragiondrake_mountain5:      { img: reddragiondrakeMountain5SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.770, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/reddragiondrake_mountain5_anim/spritesheet.webp' },
  reddragiondrake_mountain5_anim: { img: reddragiondrakeMountain5SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.770, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/reddragiondrake_mountain5_anim/spritesheet.webp' },
  threeheaded_mountain5:         { img: threeheadedMountain5SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.766, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/threeheaded_mountain5_anim/spritesheet.webp' },
  threeheaded_mountain5_anim:    { img: threeheadedMountain5SheetImg, frameCount: 8, frameW: 256, frameH: 256, fps: 8, footRatio: 0.766, isMountainMob: true, src: 'assets/mountain biom/mountain_biom_mobs/threeheaded_mountain5_anim/spritesheet.webp' },

  // Backward compatibility aliases for ext_item_600..609:
  ext_item_600:    { img: npcBartholomewSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  ext_item_601:    { img: npcCaelenSheetImg,      frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  ext_item_602:    { img: npcAlistairSheetImg,    frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  ext_item_603:    { img: npcRikktSheetImg,       frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  ext_item_604:    { img: npcVesperSheetImg,      frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  ext_item_605:    { img: npcVanceSheetImg,       frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  ext_item_606:    { img: npcTariqSheetImg,       frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  ext_item_607:    { img: npcThrainSheetImg,      frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  ext_item_608:    { img: npcCorvusSheetImg,      frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  ext_item_609:    { img: npcMalakorSheetImg,     frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true },
  // ─── COMPANIONS & FAMILIARS (8 frames @ 8 fps, 128x128, idle) ───
  comp_aldric:  { img: compAldricSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_aldric_anim/spritesheet.webp?v260' },
  aldric:       { img: compAldricSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_aldric_anim/spritesheet.webp?v260' },
  comp_ashe:    { img: compAsheSheetImg,    frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_ashe_anim/spritesheet.webp?v260' },
  ashe:         { img: compAsheSheetImg,    frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_ashe_anim/spritesheet.webp?v260' },
  comp_fenrir:  { img: compFenrirSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_fenrir_anim/spritesheet.webp?v260' },
  fenrir:       { img: compFenrirSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_fenrir_anim/spritesheet.webp?v260' },
  comp_kael:    { img: compKaelSheetImg,    frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_kael_anim/spritesheet.webp?v260' },
  kael:         { img: compKaelSheetImg,    frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_kael_anim/spritesheet.webp?v260' },
  comp_selene:  { img: compSeleneSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_selene_anim/spritesheet.webp?v260' },
  selene:       { img: compSeleneSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_selene_anim/spritesheet.webp?v260' },
  comp_morvath: { img: compMorvathSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_morvath_anim/spritesheet.webp?v260' },
  morvath:      { img: compMorvathSheetImg, frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_morvath_anim/spritesheet.webp?v260' },
  comp_healer:  { img: compHealerSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_healer_anim/spritesheet.webp?v260' },
  healer:       { img: compHealerSheetImg,  frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_healer_anim/spritesheet.webp?v260' },
  comp_scout:   { img: compScoutSheetImg,   frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_scout_anim/spritesheet.webp?v260' },
  scout:        { img: compScoutSheetImg,   frameCount: 8, frameW: 128, frameH: 128, fps: 8, isIdle: true, src: 'assets/monsters_new/comp_scout_anim/spritesheet.webp?v260' },
};
window.MONSTER_ANIMATIONS = MONSTER_ANIMATIONS;

const dreamBiomeSheetImg = new Image();
dreamBiomeSheetImg.src = (window.DREAM_BIOME_SHEET && window.DREAM_BIOME_SHEET.src) || 'assets/dream_biome_sheet.webp';
window.DREAM_BIOME_IMG = dreamBiomeSheetImg;

export const SPECIAL_ITEMS_SPRITES = {
  "potion_gold":    { sx: 3,   sy: 0,   sw: 97,  sh: 157 },
  "spyglass":       { sx: 203, sy: 30,  sw: 115, sh: 118 },
  "horn":           { sx: 373, sy: 25,  sw: 106, sh: 136 },
  "necklace":       { sx: 539, sy: 40,  sw: 77,  sh: 113 },
  "wizard_hat":     { sx: 661, sy: 41,  sw: 105, sh: 109 },
  "ring_emerald":   { sx: 834, sy: 31,  sw: 94,  sh: 112 },
  "gold_pouch":     { sx: 971, sy: 31,  sw: 86,  sh: 111 },

  "potion_red":     { sx: 4,   sy: 193, sw: 98,  sh: 164 },
  "pocket_watch":   { sx: 134, sy: 214, sw: 141, sh: 140 },
  "crystal_shard":  { sx: 359, sy: 193, sw: 83,  sh: 165 },
  "boots_winged":   { sx: 535, sy: 192, sw: 143, sh: 185 },
  "potion_belt":    { sx: 792, sy: 239, sw: 148, sh: 104 },
  "hourglass":      { sx: 975, sy: 174, sw: 89,  sh: 188 },

  "potion_green":   { sx: 0,   sy: 439, sw: 97,  sh: 158 },
  "book_locked":    { sx: 132, sy: 432, sw: 152, sh: 166 },
  "lantern":        { sx: 333, sy: 395, sw: 96,  sh: 210 },
  "chalice_gold":   { sx: 478, sy: 441, sw: 91,  sh: 161 },
  "compass":        { sx: 637, sy: 464, sw: 100, sh: 120 },
  "arrow_bundle":   { sx: 795, sy: 396, sw: 98,  sh: 216 },
  "lavender":       { sx: 964, sy: 418, sw: 98,  sh: 183 },

  "potion_purple":  { sx: 0,   sy: 669, sw: 97,  sh: 158 },
  "gloves_leather": { sx: 166, sy: 677, sw: 157, sh: 143 },
  "scroll":         { sx: 371, sy: 677, sw: 131, sh: 108 },
  "book_star":      { sx: 544, sy: 671, sw: 118, sh: 122 },
  "anchor_chain":   { sx: 730, sy: 636, sw: 124, sh: 195 },
  "heart_locket":   { sx: 912, sy: 637, sw: 126, sh: 189 }
};
window.SPECIAL_ITEMS_SPRITES = SPECIAL_ITEMS_SPRITES;

const specialItemsSheetImg = new Image();
specialItemsSheetImg.src = 'assets/special Items/items_sheet.webp?v188';
window.SPECIAL_ITEMS_IMG = specialItemsSheetImg;

export const MATERIAL_DROPS_SPRITES = {
  "rpg_dwarvenSteel":   { sx: 0,   sy: 18, sw: 120, sh: 103, file: 'assets/special Items/dwarvenSteel.webp' },
  "dwarvenSteel":       { sx: 0,   sy: 18, sw: 120, sh: 103, file: 'assets/special Items/dwarvenSteel.webp' },
  "rpg_cosmicDust":     { sx: 138, sy: 8,  sw: 96,  sh: 113, file: 'assets/special Items/cosmicDust.webp' },
  "cosmicDust":         { sx: 138, sy: 8,  sw: 96,  sh: 113, file: 'assets/special Items/cosmicDust.webp' },
  "rpg_abyssalHeart":   { sx: 250, sy: 3,  sw: 117, sh: 123, file: 'assets/special Items/abyssalHeart.webp' },
  "abyssalHeart":       { sx: 250, sy: 3,  sw: 117, sh: 123, file: 'assets/special Items/abyssalHeart.webp' },
  "rpg_voidEssence":    { sx: 382, sy: 1,  sw: 95,  sh: 128, file: 'assets/special Items/voidEssence.webp' },
  "voidEssence":        { sx: 382, sy: 1,  sw: 95,  sh: 128, file: 'assets/special Items/voidEssence.webp' },
  "rpg_phoenixFeather": { sx: 499, sy: 5,  sw: 100, sh: 122, file: 'assets/special Items/phoenixFeather.webp' },
  "phoenixFeather":     { sx: 499, sy: 5,  sw: 100, sh: 122, file: 'assets/special Items/phoenixFeather.webp' },
  "rpg_frozenCore":     { sx: 622, sy: 0,  sw: 92,  sh: 129, file: 'assets/special Items/frozenCore.webp' },
  "frozenCore":         { sx: 622, sy: 0,  sw: 92,  sh: 129, file: 'assets/special Items/frozenCore.webp' },
  "rpg_ancientBark":    { sx: 732, sy: 0,  sw: 106, sh: 129, file: 'assets/special Items/ancientBark.webp' },
  "ancientBark":        { sx: 732, sy: 0,  sw: 106, sh: 129, file: 'assets/special Items/ancientBark.webp' },
  "rpg_ore_gold":       { sx: 853, sy: 15, sw: 109, sh: 104, file: 'assets/special Items/goldOre.webp' },
  "goldOre":            { sx: 853, sy: 15, sw: 109, sh: 104, file: 'assets/special Items/goldOre.webp' },
  "rpg_goldOre":        { sx: 853, sy: 15, sw: 109, sh: 104, file: 'assets/special Items/goldOre.webp' }
};
window.MATERIAL_DROPS_SPRITES = MATERIAL_DROPS_SPRITES;

const inventoryDropsSheetImg = new Image();
inventoryDropsSheetImg.src = 'assets/special Items/inventory_drops.webp?v196';
window.INVENTORY_DROPS_IMG = inventoryDropsSheetImg;

export const SPECIAL_ITEMS_LIST = [
  { id: 'potion_gold', sprite: 'potion_gold', name: 'Golden Elixir', type: 'Consumable', effect: '+50 HP instant heal.', achId: 'firstBlood', achName: 'First Blood', achDesc: 'Defeat 1 enemy' },
  { id: 'spyglass', sprite: 'Spyglass', name: 'Spyglass', type: 'Trinket', effect: '+20% Fog Reveal Range.', achId: 'massacre', achName: 'Massacre', achDesc: 'Defeat 200 enemies' },
  { id: 'horn', sprite: 'horn', name: 'Horn of the Fallen Kings', type: 'Quest Item', effect: 'Summons a random Boss. Defeat for double loot.', achId: 'firstBoss', achName: 'Boss Slayer', achDesc: 'Defeat a boss' },
  { id: 'necklace', sprite: 'Amulet_of_Vigor', name: 'Amulet of Vigor', type: 'Trinket', effect: '+20 Max HP.', achId: 'survivor', achName: 'Survivor', achDesc: 'Survive 5 minutes' },
  { id: 'wizard_hat', sprite: 'Wizards_Hat', name: "Wizard's Hat", type: 'Trinket', effect: '+10% Magic Damage.', achId: 'maxLevel', achName: 'Max Level', achDesc: 'Reach level 20' },
  { id: 'ring_emerald', sprite: 'Emerald_Ring', name: 'Emerald Ring', type: 'Trinket', effect: '+1 HP/sec Regen.', achId: 'nightOwl', achName: 'Night Owl', achDesc: '30 night kills' },
  { id: 'gold_pouch', sprite: 'Gold_Pouch', name: 'Gold Pouch', type: 'Trinket', effect: '+10% Gold Found.', achId: 'frozenHeart', achName: 'Frozen Heart', achDesc: 'Complete ritual' },
  { id: 'potion_red', sprite: 'potion_red', name: 'Crimson Flask', type: 'Consumable', effect: '+50% Damage for 10s.', achId: 'slayer', achName: 'Slayer', achDesc: 'Defeat 50 enemies' },
  { id: 'pocket_watch', sprite: 'Pocket_Watch', name: 'Pocket Watch', type: 'Trinket', effect: '-10% Cooldowns.', achId: 'sunkenTemple', achName: 'Sunken Temple', achDesc: 'Find the secret' },
  { id: 'crystal_shard', sprite: 'Crystal_Shard', name: 'Crystal Shard', type: 'Trinket', effect: '+10% Ice Damage.', achId: 'cryomancer', achName: 'Cryomancer', achDesc: 'Freeze 50 enemies' },
  { id: 'boots_winged', sprite: 'Winged_Boots', name: 'Winged Boots', type: 'Trinket', effect: '+10% Move Speed.', achId: 'stormChaser', achName: 'Storm Chaser', achDesc: 'Survive storm' },
  { id: 'potion_belt', sprite: 'Potion_Belt', name: 'Potion Belt', type: 'Trinket', effect: '+5% Healing Received.', achId: 'healer', achName: 'Healer', achDesc: 'Heal 500 HP total' },
  { id: 'hourglass', sprite: 'Hourglass', name: 'Hourglass', type: 'Trinket', effect: '+5% Attack Speed.', achId: 'pyro', achName: 'Pyromaniac', achDesc: '50 fire kills' },
  { id: 'potion_green', sprite: 'potion_green', name: 'Verdant Brew', type: 'Consumable', effect: '+5 HP/sec Regen for 15s.', achId: 'flooded', achName: 'Flood Survivor', achDesc: 'Survive flood' },
  { id: 'book_locked', sprite: 'book_locked', name: 'Locked Tome', type: 'Quest Item', effect: 'Contains forbidden knowledge (unlocks lore entry).', achId: 'scholar', achName: 'Scholar', achDesc: 'Read 10 Lore entries' },
  { id: 'lantern', sprite: 'Lantern', name: 'Lantern', type: 'Trinket', effect: '+50% Light Radius (Underworld/Abyss).', achId: 'vampireSlayer', achName: 'Vampire Hunter', achDesc: '10 vampires' },
  { id: 'chalice_gold', sprite: 'Golden_Chalice', name: 'Golden Chalice', type: 'Trinket', effect: '+10% Lifesteal.', achId: 'bloodMoonRitual', achName: 'Blood Moon Ritual', achDesc: 'Survive Blood Moon' },
  { id: 'compass', sprite: 'Compass', name: 'Compass', type: 'Trinket', effect: 'Reveals nearest Relic on minimap.', achId: 'relicHunter', achName: 'Relic Hunter', achDesc: 'Defeat a boss' },
  { id: 'arrow_bundle', sprite: 'Arrow_Bundle', name: 'Arrow Bundle', type: 'Trinket', effect: '+10% Projectile Speed.', achId: 'sharpshooter', achName: 'Sharpshooter', achDesc: '100 ranged kills' },
  { id: 'lavender', sprite: 'Lavender_Bundle', name: 'Lavender Bundle', type: 'Trinket', effect: '+10% Healing Received.', achId: 'forager', achName: 'Wilderness Forager', achDesc: 'Discover 5 biomes' },
  { id: 'potion_purple', sprite: 'potion_purple', name: 'Violet Tonic', type: 'Consumable', effect: '+100% XP Gain for 10s.', achId: 'survivorXp', achName: 'Seasoned Survivor', achDesc: 'Survive 5 minutes' },
  { id: 'gloves_leather', sprite: 'Leather_Gloves', name: 'Leather Gloves', type: 'Trinket', effect: '+5% Melee Damage.', achId: 'berserker', achName: 'Berserker', achDesc: '50 melee kills' },
  { id: 'scroll', sprite: 'scroll', name: 'Sealed Scroll', type: 'Quest Item', effect: 'Reveals a riddle for next World Secret.', achId: 'voidPortal', achName: 'Void Portal', achDesc: 'Complete secret' },
  { id: 'book_star', sprite: 'Star_Tome', name: 'Star Tome', type: 'Trinket', effect: '+10% XP Gain.', achId: 'explorer', achName: 'Explorer', achDesc: 'Discover 5 biomes' },
  { id: 'anchor_chain', sprite: 'Anchor_Chain', name: 'Anchor Chain', type: 'Trinket', effect: '+15% Armor, -5% Move Speed.', achId: 'tank', achName: 'Tank', achDesc: 'Survive 10 minutes' },
  { id: 'heart_locket', sprite: 'Heart_Locket', name: 'Heart Locket', type: 'Trinket', effect: '+20 Max HP.', achId: 'collector', achName: 'Collector', achDesc: 'Open 20 chests' },
  { id: 'chickenCrown', sprite: 'chickenCrown', name: 'Chicken Crown', type: 'Cosmetic Trophy', effect: 'Royal poultry crown cosmetic. Can be equipped in Camp Trophies.', achId: 'chickenKingSlayer', achName: 'Poultry Regicide', achDesc: 'Defeat the Chicken King' }
];
window.SPECIAL_ITEMS_LIST = SPECIAL_ITEMS_LIST;

const xpOrbImg = new Image();
xpOrbImg.src = 'assets/xp_orb.webp?v182';
window.XP_ORB_IMG = xpOrbImg;

const xpGemEliteImg = new Image();
xpGemEliteImg.src = 'assets/xp_gem_elite.webp';
window.XP_GEM_ELITE_IMG = xpGemEliteImg;

const xpGemLegendaryImg = new Image();
xpGemLegendaryImg.src = 'assets/xp_gem_legendary.webp';
window.XP_GEM_LEGENDARY_IMG = xpGemLegendaryImg;

const xpGemMythicImg = new Image();
xpGemMythicImg.src = 'assets/xp_gem_mythic.webp';
window.XP_GEM_MYTHIC_IMG = xpGemMythicImg;

window.TREE_DIMS = {
  Autumn_tree1: { w: 128, h: 128, padBottom: 29, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Autumn_tree1.webp' },
  Autumn_tree2: { w: 64, h: 64, padBottom: 2, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Autumn_tree2.webp' },
  Autumn_tree3: { w: 64, h: 64, padBottom: 13, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Autumn_tree3.webp' },
  Broken_tree1: { w: 32, h: 32, padBottom: 3, scale: 1.2, path: 'assets/Trees/PNG/Assets_separately/Trees/Broken_tree1.webp' },
  Broken_tree2: { w: 32, h: 32, padBottom: 4, scale: 1.2, path: 'assets/Trees/PNG/Assets_separately/Trees/Broken_tree2.webp' },
  Broken_tree3: { w: 48, h: 48, padBottom: 11, scale: 1.4, path: 'assets/Trees/PNG/Assets_separately/Trees/Broken_tree3.webp' },
  Broken_tree4: { w: 64, h: 64, padBottom: 22, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Broken_tree4.webp' },
  Broken_tree5: { w: 32, h: 32, padBottom: 7, scale: 1.2, path: 'assets/Trees/PNG/Assets_separately/Trees/Broken_tree5.webp' },
  Broken_tree6: { w: 16, h: 16, padBottom: 3, scale: 1.5, path: 'assets/Trees/PNG/Assets_separately/Trees/Broken_tree6.webp' },
  Broken_tree7: { w: 128, h: 128, padBottom: 49, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Broken_tree7.webp' },
  Burned_tree1: { w: 128, h: 128, padBottom: 32, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Burned_tree1.webp' },
  Burned_tree2: { w: 64, h: 64, padBottom: 4, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Burned_tree2.webp' },
  Burned_tree3: { w: 64, h: 64, padBottom: 16, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Burned_tree3.webp' },
  Christmas_tree1: { w: 128, h: 128, padBottom: 28, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Christmas_tree1.webp' },
  Christmas_tree2: { w: 64, h: 64, padBottom: 8, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Christmas_tree2.webp' },
  Christmas_tree3: { w: 32, h: 32, padBottom: 2, scale: 1.2, path: 'assets/Trees/PNG/Assets_separately/Trees/Christmas_tree3.webp' },
  Flower_tree1: { w: 128, h: 128, padBottom: 31, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Flower_tree1.webp' },
  Flower_tree2: { w: 64, h: 64, padBottom: 5, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Flower_tree2.webp' },
  Flower_tree3: { w: 64, h: 64, padBottom: 17, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Flower_tree3.webp' },
  Fruit_tree1: { w: 128, h: 128, padBottom: 30, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Fruit_tree1.webp' },
  Fruit_tree2: { w: 128, h: 128, padBottom: 35, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Fruit_tree2.webp' },
  Fruit_tree3: { w: 64, h: 64, padBottom: 16, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Fruit_tree3.webp' },
  Moss_tree1: { w: 128, h: 128, padBottom: 31, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Moss_tree1.webp' },
  Moss_tree2: { w: 64, h: 64, padBottom: 4, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Moss_tree2.webp' },
  Moss_tree3: { w: 64, h: 64, padBottom: 14, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Moss_tree3.webp' },
  Palm_tree1_1: { w: 128, h: 128, padBottom: 31, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Palm_tree1_1.webp' },
  Palm_tree1_2: { w: 64, h: 64, padBottom: 4, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Palm_tree1_2.webp' },
  Palm_tree1_3: { w: 64, h: 64, padBottom: 16, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Palm_tree1_3.webp' },
  Palm_tree2_1: { w: 128, h: 128, padBottom: 31, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Palm_tree2_1.webp' },
  Palm_tree2_2: { w: 64, h: 64, padBottom: 6, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Palm_tree2_2.webp' },
  Palm_tree2_3: { w: 64, h: 64, padBottom: 18, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Palm_tree2_3.webp' },
  Snow_christmass_tree1: { w: 128, h: 128, padBottom: 29, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Snow_christmass_tree1.webp' },
  Snow_christmass_tree2: { w: 64, h: 64, padBottom: 7, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Snow_christmass_tree2.webp' },
  Snow_christmass_tree3: { w: 32, h: 32, padBottom: 2, scale: 1.2, path: 'assets/Trees/PNG/Assets_separately/Trees/Snow_christmass_tree3.webp' },
  Snow_tree1: { w: 128, h: 128, padBottom: 31, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Snow_tree1.webp' },
  Snow_tree2: { w: 64, h: 64, padBottom: 3, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Snow_tree2.webp' },
  Snow_tree3: { w: 64, h: 64, padBottom: 13, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Snow_tree3.webp' },
  Tree1: { w: 128, h: 128, padBottom: 29, scale: 1.0, path: 'assets/Trees/PNG/Assets_separately/Trees/Tree1.webp' },
  Tree2: { w: 64, h: 64, padBottom: 2, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Tree2.webp' },
  Tree3: { w: 64, h: 64, padBottom: 13, scale: 1.35, path: 'assets/Trees/PNG/Assets_separately/Trees/Tree3.webp' },
  Forest_Beige_green_mushroom1: { w: 128, h: 128, padBottom: 32, scale: 0.85, path: 'assets/forest/Assets/Beige_green_mushroom1.webp' },
  Forest_Beige_green_mushroom2: { w: 64, h: 64, padBottom: 9, scale: 1.0, path: 'assets/forest/Assets/Beige_green_mushroom2.webp' },
  Forest_Beige_green_mushroom3: { w: 32, h: 32, padBottom: 3, scale: 0.95, path: 'assets/forest/Assets/Beige_green_mushroom3.webp' },
  Forest_Blue_green_balls_tree1: { w: 128, h: 128, padBottom: 31, scale: 1.0, path: 'assets/forest/Assets/Blue-green_balls_tree1.webp' },
  Forest_Blue_green_balls_tree2: { w: 64, h: 64, padBottom: 8, scale: 1.35, path: 'assets/forest/Assets/Blue-green_balls_tree2.webp' },
  Forest_Blue_green_balls_tree3: { w: 32, h: 32, padBottom: 2, scale: 0.95, path: 'assets/forest/Assets/Blue-green_balls_tree3.webp' },
  Forest_Chanterelles1: { w: 32, h: 32, padBottom: 3, scale: 0.95, path: 'assets/forest/Assets/Chanterelles1.webp' },
  Forest_Chanterelles2: { w: 32, h: 32, padBottom: 4, scale: 0.95, path: 'assets/forest/Assets/Chanterelles2.webp' },
  Forest_Chanterelles3: { w: 32, h: 32, padBottom: 7, scale: 0.95, path: 'assets/forest/Assets/Chanterelles3.webp' },
  Forest_Curved_tree1: { w: 128, h: 128, padBottom: 22, scale: 1.0, path: 'assets/forest/Assets/Curved_tree1.webp' },
  Forest_Curved_tree2: { w: 128, h: 128, padBottom: 26, scale: 1.0, path: 'assets/forest/Assets/Curved_tree2.webp' },
  Forest_Curved_tree3: { w: 64, h: 64, padBottom: 2, scale: 1.35, path: 'assets/forest/Assets/Curved_tree3.webp' },
  Forest_Ent_man: { w: 128, h: 128, padBottom: 17, scale: 1.0, path: 'assets/forest/Assets/Ent_man.webp' },
  Forest_Ent_woman: { w: 128, h: 128, padBottom: 17, scale: 1.0, path: 'assets/forest/Assets/Ent_woman.webp' },
  Forest_Light_balls_tree1: { w: 128, h: 128, padBottom: 22, scale: 1.0, path: 'assets/forest/Assets/Light_balls_tree1.webp' },
  Forest_Light_balls_tree2: { w: 128, h: 128, padBottom: 29, scale: 1.0, path: 'assets/forest/Assets/Light_balls_tree2.webp' },
  Forest_Light_balls_tree3: { w: 64, h: 64, padBottom: 9, scale: 1.35, path: 'assets/forest/Assets/Light_balls_tree3.webp' },
  Forest_Living_gazebo1: { w: 128, h: 128, padBottom: 8, scale: 1.0, path: 'assets/forest/Assets/Living gazebo1.webp' },
  Forest_Living_gazebo2: { w: 128, h: 128, padBottom: 18, scale: 1.0, path: 'assets/forest/Assets/Living gazebo2.webp' },
  Forest_Luminous_tree1: { w: 128, h: 128, padBottom: 16, scale: 1.0, path: 'assets/forest/Assets/Luminous_tree1.webp' },
  Forest_Luminous_tree2: { w: 128, h: 128, padBottom: 22, scale: 1.0, path: 'assets/forest/Assets/Luminous_tree2.webp' },
  Forest_Luminous_tree3: { w: 64, h: 64, padBottom: 1, scale: 1.35, path: 'assets/forest/Assets/Luminous_tree3.webp' },
  Forest_Luminous_tree4: { w: 64, h: 64, padBottom: 6, scale: 1.35, path: 'assets/forest/Assets/Luminous_tree4.webp' },
  Forest_Mega_tree1: { w: 256, h: 256, padBottom: 18, scale: 0.65, path: 'assets/forest/Assets/Mega_tree1.webp' },
  Forest_Mega_tree2: { w: 128, h: 128, padBottom: 12, scale: 1.0, path: 'assets/forest/Assets/Mega_tree2.webp' },
  Forest_Swirling_tree1: { w: 128, h: 128, padBottom: 16, scale: 1.0, path: 'assets/forest/Assets/Swirling tree1.webp' },
  Forest_Swirling_tree2: { w: 128, h: 128, padBottom: 27, scale: 1.0, path: 'assets/forest/Assets/Swirling tree2.webp' },
  Forest_Swirling_tree3: { w: 64, h: 64, padBottom: 4, scale: 1.35, path: 'assets/forest/Assets/Swirling tree3.webp' },
  Forest_Tree_idol_deer: { w: 128, h: 128, padBottom: 17, scale: 1.0, path: 'assets/forest/Assets/Tree_idol_deer.webp' },
  Forest_Tree_idol_dragon: { w: 256, h: 256, padBottom: 82, scale: 0.65, path: 'assets/forest/Assets/Tree_idol_dragon.webp' },
  Forest_Tree_idol_human: { w: 128, h: 128, padBottom: 8, scale: 1.0, path: 'assets/forest/Assets/Tree_idol_human.webp' },
  Forest_Tree_idol_wolf: { w: 128, h: 128, padBottom: 26, scale: 1.0, path: 'assets/forest/Assets/Tree_idol_wolf.webp' },
  Forest_White_red_mushroom1: { w: 128, h: 128, padBottom: 29, scale: 0.85, path: 'assets/forest/Assets/White-red_mushroom1.webp' },
  Forest_White_red_mushroom2: { w: 64, h: 64, padBottom: 3, scale: 1.0, path: 'assets/forest/Assets/White-red_mushroom2.webp' },
  Forest_White_red_mushroom3: { w: 64, h: 64, padBottom: 15, scale: 1.0, path: 'assets/forest/Assets/White-red_mushroom3.webp' },
  Forest_White_tree1: { w: 128, h: 128, padBottom: 22, scale: 1.0, path: 'assets/forest/Assets/White_tree1.webp' },
  Forest_White_tree2: { w: 64, h: 64, padBottom: 6, scale: 1.35, path: 'assets/forest/Assets/White_tree2.webp' },
  Forest_Willow1: { w: 128, h: 128, padBottom: 23, scale: 1.0, path: 'assets/forest/Assets/Willow1.webp' },
  Forest_Willow2: { w: 128, h: 128, padBottom: 28, scale: 1.0, path: 'assets/forest/Assets/Willow2.webp' },
  Forest_Willow3: { w: 64, h: 64, padBottom: 7, scale: 1.35, path: 'assets/forest/Assets/Willow3.webp' },
  Bush_Autumn_bush1: { w: 64, h: 64, padBottom: 19, scale: 0.72, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Autumn_bush1.webp' },
  Bush_Autumn_bush2: { w: 32, h: 32, padBottom: 5, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Autumn_bush2.webp' },
  Bush_Autumn_bush3: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Autumn_bush3.webp' },
  Bush_Broken_tree1: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Broken_tree1.webp' },
  Bush_Broken_tree2: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Broken_tree2.webp' },
  Bush_Burned_tree1: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Burned_tree1.webp' },
  Bush_Burned_tree2: { w: 32, h: 32, padBottom: 5, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Burned_tree2.webp' },
  Bush_blue_flowers1: { w: 64, h: 64, padBottom: 12, scale: 0.72, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_blue_flowers1.webp' },
  Bush_blue_flowers2: { w: 32, h: 32, padBottom: 1, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_blue_flowers2.webp' },
  Bush_blue_flowers3: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_blue_flowers3.webp' },
  Bush_orange_flowers1: { w: 64, h: 64, padBottom: 14, scale: 0.72, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_orange_flowers1.webp' },
  Bush_orange_flowers2: { w: 32, h: 32, padBottom: 3, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_orange_flowers2.webp' },
  Bush_orange_flowers3: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_orange_flowers3.webp' },
  Bush_pink_flowers1: { w: 64, h: 64, padBottom: 17, scale: 0.72, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_pink_flowers1.webp' },
  Bush_pink_flowers2: { w: 32, h: 32, padBottom: 5, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_pink_flowers2.webp' },
  Bush_pink_flowers3: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_pink_flowers3.webp' },
  Bush_red_flowers1: { w: 64, h: 64, padBottom: 11, scale: 0.72, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_red_flowers1.webp' },
  Bush_red_flowers2: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_red_flowers2.webp' },
  Bush_red_flowers3: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_red_flowers3.webp' },
  Bush_simple1_1: { w: 32, h: 32, padBottom: 3, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_simple1_1.webp' },
  Bush_simple1_2: { w: 32, h: 32, padBottom: 5, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_simple1_2.webp' },
  Bush_simple1_3: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_simple1_3.webp' },
  Bush_simple2_1: { w: 32, h: 32, padBottom: 0, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_simple2_1.webp' },
  Bush_simple2_2: { w: 32, h: 32, padBottom: 3, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_simple2_2.webp' },
  Bush_simple2_3: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Bush_simple2_3.webp' },
  Bush_Cactus1_1: { w: 32, h: 32, padBottom: 1, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Cactus1_1.webp' },
  Bush_Cactus1_2: { w: 32, h: 32, padBottom: 4, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Cactus1_2.webp' },
  Bush_Cactus1_3: { w: 16, h: 16, padBottom: 2, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Cactus1_3.webp' },
  Bush_Cactus2_1: { w: 64, h: 64, padBottom: 12, scale: 0.72, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Cactus2_1.webp' },
  Bush_Cactus2_2: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Cactus2_2.webp' },
  Bush_Cactus2_3: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Cactus2_3.webp' },
  Bush_Fern1_1: { w: 64, h: 64, padBottom: 14, scale: 0.72, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Fern1_1.webp' },
  Bush_Fern1_2: { w: 32, h: 32, padBottom: 4, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Fern1_2.webp' },
  Bush_Fern1_3: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Fern1_3.webp' },
  Bush_Fern2_1: { w: 64, h: 64, padBottom: 15, scale: 0.72, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Fern2_1.webp' },
  Bush_Fern2_2: { w: 32, h: 32, padBottom: 6, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Fern2_2.webp' },
  Bush_Fern2_3: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Fern2_3.webp' },
  Bush_Snow_bush1: { w: 64, h: 64, padBottom: 15, scale: 0.72, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Snow_bush1.webp' },
  Bush_Snow_bush2: { w: 32, h: 32, padBottom: 5, scale: 0.85, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Snow_bush2.webp' },
  Bush_Snow_bush3: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/bushes/PNG/Assets_texture_shadow_dark/Snow_bush3.webp' },
  Rock1_1: { w: 64, h: 64, padBottom: 2, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock1_1.webp' },
  Rock1_2: { w: 64, h: 64, padBottom: 10, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock1_2.webp' },
  Rock1_3: { w: 32, h: 32, padBottom: 0, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock1_3.webp' },
  Rock1_4: { w: 32, h: 32, padBottom: 3, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock1_4.webp' },
  Rock1_5: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/rocks and stones/PNG/Objects_separately/Rock1_5.webp' },
  Rock2_1: { w: 64, h: 64, padBottom: 5, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock2_1.webp' },
  Rock2_2: { w: 64, h: 64, padBottom: 10, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock2_2.webp' },
  Rock2_3: { w: 32, h: 32, padBottom: 0, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock2_3.webp' },
  Rock2_4: { w: 32, h: 32, padBottom: 4, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock2_4.webp' },
  Rock2_5: { w: 16, h: 16, padBottom: 2, scale: 1.0, path: 'assets/rocks and stones/PNG/Objects_separately/Rock2_5.webp' },
  Rock3_1: { w: 64, h: 64, padBottom: 2, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock3_1.webp' },
  Rock3_2: { w: 64, h: 64, padBottom: 8, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock3_2.webp' },
  Rock3_3: { w: 32, h: 32, padBottom: 0, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock3_3.webp' },
  Rock3_4: { w: 32, h: 32, padBottom: 5, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock3_4.webp' },
  Rock3_5: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/rocks and stones/PNG/Objects_separately/Rock3_5.webp' },
  Rock4_1: { w: 64, h: 64, padBottom: 6, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock4_1.webp' },
  Rock4_2: { w: 64, h: 64, padBottom: 12, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock4_2.webp' },
  Rock4_3: { w: 32, h: 32, padBottom: 0, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock4_3.webp' },
  Rock4_4: { w: 32, h: 32, padBottom: 5, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock4_4.webp' },
  Rock4_5: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/rocks and stones/PNG/Objects_separately/Rock4_5.webp' },
  Rock5_1: { w: 64, h: 64, padBottom: 0, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock5_1.webp' },
  Rock5_2: { w: 64, h: 64, padBottom: 6, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock5_2.webp' },
  Rock5_3: { w: 32, h: 32, padBottom: 0, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock5_3.webp' },
  Rock5_4: { w: 32, h: 32, padBottom: 3, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock5_4.webp' },
  Rock5_5: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/rocks and stones/PNG/Objects_separately/Rock5_5.webp' },
  Rock6_1: { w: 64, h: 64, padBottom: 3, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock6_1.webp' },
  Rock6_2: { w: 64, h: 64, padBottom: 11, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock6_2.webp' },
  Rock6_3: { w: 32, h: 32, padBottom: 0, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock6_3.webp' },
  Rock6_4: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock6_4.webp' },
  Rock6_5: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/rocks and stones/PNG/Objects_separately/Rock6_5.webp' },
  Rock7_1: { w: 64, h: 64, padBottom: 6, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock7_1.webp' },
  Rock7_2: { w: 64, h: 64, padBottom: 14, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock7_2.webp' },
  Rock7_3: { w: 32, h: 32, padBottom: 3, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock7_3.webp' },
  Rock7_4: { w: 32, h: 32, padBottom: 7, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock7_4.webp' },
  Rock7_5: { w: 16, h: 16, padBottom: 4, scale: 1.0, path: 'assets/rocks and stones/PNG/Objects_separately/Rock7_5.webp' },
  Rock8_1: { w: 64, h: 64, padBottom: 3, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock8_1.webp' },
  Rock8_2: { w: 64, h: 64, padBottom: 8, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rock8_2.webp' },
  Rock8_3: { w: 32, h: 32, padBottom: 1, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock8_3.webp' },
  Rock8_4: { w: 32, h: 32, padBottom: 1, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rock8_4.webp' },
  Rock8_5: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/rocks and stones/PNG/Objects_separately/Rock8_5.webp' },
  Rock_Rokc3_snow_shadow_dark1: { w: 64, h: 64, padBottom: 2, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rokc3_snow_shadow_dark1.webp' },
  Rock_Rokc3_snow_shadow_dark2: { w: 64, h: 64, padBottom: 8, scale: 0.75, path: 'assets/rocks and stones/PNG/Objects_separately/Rokc3_snow_shadow_dark2.webp' },
  Rock_Rokc3_snow_shadow_dark3: { w: 32, h: 32, padBottom: 0, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rokc3_snow_shadow_dark3.webp' },
  Rock_Rokc3_snow_shadow_dark4: { w: 32, h: 32, padBottom: 5, scale: 0.85, path: 'assets/rocks and stones/PNG/Objects_separately/Rokc3_snow_shadow_dark4.webp' },
  Rock_Rokc3_snow_shadow_dark5: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/rocks and stones/PNG/Objects_separately/Rokc3_snow_shadow_dark5.webp' },
  Crystal_Black_crystal1: { w: 64, h: 64, padBottom: 5, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Black_crystal1.webp' },
  Crystal_Black_crystal2: { w: 64, h: 64, padBottom: 12, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Black_crystal2.webp' },
  Crystal_Black_crystal3: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Black_crystal3.webp' },
  Crystal_Black_crystal4: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Black_crystal4.webp' },
  Crystal_Blue_crystal: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Blue_crystal.webp' },
  Crystal_Blue_crystal1: { w: 64, h: 64, padBottom: 6, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Blue_crystal1.webp' },
  Crystal_Blue_crystal2: { w: 48, h: 48, padBottom: 6, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Blue_crystal2.webp' },
  Crystal_Blue_crystal3: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Blue_crystal3.webp' },
  Crystal_Dark_red_crystal1: { w: 64, h: 64, padBottom: 7, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Dark_red_ crystal1.webp' },
  Crystal_Dark_red_crystal2: { w: 64, h: 64, padBottom: 13, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Dark_red_ crystal2.webp' },
  Crystal_Dark_red_crystal3: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Dark_red_ crystal3.webp' },
  Crystal_Dark_red_crystal4: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Dark_red_ crystal4.webp' },
  Crystal_Green_crystal1: { w: 64, h: 64, padBottom: 10, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Green_crystal1.webp' },
  Crystal_Green_crystal2: { w: 64, h: 64, padBottom: 15, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Green_crystal2.webp' },
  Crystal_Green_crystal3: { w: 32, h: 32, padBottom: 4, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Green_crystal3.webp' },
  Crystal_Green_crystal4: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Green_crystal4.webp' },
  Crystal_Pink_crystal1: { w: 64, h: 64, padBottom: 8, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Pink_crystal1.webp' },
  Crystal_Pink_crystal2: { w: 64, h: 64, padBottom: 10, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Pink_crystal2.webp' },
  Crystal_Pink_crystal3: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Pink_crystal3.webp' },
  Crystal_Pink_crystal4: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Pink_crystal4.webp' },
  Crystal_Red_crystal1: { w: 64, h: 64, padBottom: 6, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Red_crystal1.webp' },
  Crystal_Red_crystal2: { w: 64, h: 64, padBottom: 10, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Red_crystal2.webp' },
  Crystal_Red_crystal3: { w: 32, h: 32, padBottom: 1, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Red_crystal3.webp' },
  Crystal_Red_crystal4: { w: 16, h: 16, padBottom: 0, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Red_crystal4.webp' },
  Crystal_Violet_crystal1: { w: 64, h: 64, padBottom: 8, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Violet_crystal1.webp' },
  Crystal_Violet_crystal2: { w: 64, h: 64, padBottom: 13, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Violet_crystal2.webp' },
  Crystal_Violet_crystal3: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Violet_crystal3.webp' },
  Crystal_Violet_crystal4: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Violet_crystal4.webp' },
  Crystal_White_crystal1: { w: 64, h: 64, padBottom: 4, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/White_crystal1.webp' },
  Crystal_White_crystal2: { w: 64, h: 64, padBottom: 12, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/White_crystal2.webp' },
  Crystal_White_crystal3: { w: 32, h: 32, padBottom: 2, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/White_crystal3.webp' },
  Crystal_White_crystal4: { w: 16, h: 16, padBottom: 2, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/White_crystal4.webp' },
  Crystal_Yellow_green_crystal1: { w: 64, h: 64, padBottom: 7, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Yellow-green_crystal1.webp' },
  Crystal_Yellow_green_crystal2: { w: 64, h: 64, padBottom: 11, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Yellow-green_crystal2.webp' },
  Crystal_Yellow_green_crystal3: { w: 32, h: 32, padBottom: 1, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Yellow-green_crystal3.webp' },
  Crystal_Yellow_green_crystal4: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Yellow-green_crystal4.webp' },
  Crystal_Yellow_crystal1: { w: 64, h: 64, padBottom: 4, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Yellow_crystal1.webp' },
  Crystal_Yellow_crystal2: { w: 64, h: 64, padBottom: 12, scale: 0.8, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Yellow_crystal2.webp' },
  Crystal_Yellow_crystal3: { w: 32, h: 32, padBottom: 1, scale: 0.85, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Yellow_crystal3.webp' },
  Crystal_Yellow_crystal4: { w: 16, h: 16, padBottom: 1, scale: 1.0, path: 'assets/Crystal/PNG/Assets_texture_shadow_dark/Yellow_crystal4.webp' },
  CaveObj_256_Dark_totem1: { w: 256, h: 256, padBottom: 59, scale: 0.55, path: 'assets/cave objects/PNG/Objects_separately/256/Dark_totem_dark_shadow1.webp' },
  CaveObj_256_Dinosaur_skeleton_full: { w: 256, h: 256, padBottom: 82, scale: 0.55, path: 'assets/cave objects/PNG/Objects_separately/256/Dinosaur_skeleton_full_dark_shadow.webp' },
  CaveObj_256_centipede1: { w: 256, h: 256, padBottom: 76, scale: 0.55, path: 'assets/cave objects/PNG/Objects_separately/256/centipede_dark_shadow1.webp' },
  CaveObj_256_centipede2: { w: 256, h: 256, padBottom: 76, scale: 0.55, path: 'assets/cave objects/PNG/Objects_separately/256/centipede_dark_shadow2.webp' },
  CaveObj_256_white_crystal1: { w: 256, h: 256, padBottom: 59, scale: 0.55, path: 'assets/cave objects/PNG/Objects_separately/256/white_crystal_light_shadow1.webp' },
  CaveObj_128_Beige_rpck1: { w: 128, h: 128, padBottom: 27, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Beige_rpck_dark_shadow1.webp' },
  CaveObj_128_Building1: { w: 128, h: 128, padBottom: 9, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Building1_dark_shadow.webp' },
  CaveObj_128_Building2: { w: 128, h: 128, padBottom: 11, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Building2_dark_shadow.webp' },
  CaveObj_128_Dark_totem2: { w: 128, h: 128, padBottom: 22, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Dark_totem_dark_shadow2.webp' },
  CaveObj_128_Dark_totem3: { w: 128, h: 128, padBottom: 24, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Dark_totem_dark_shadow3.webp' },
  CaveObj_128_Dark_totem4: { w: 128, h: 128, padBottom: 41, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Dark_totem_dark_shadow4.webp' },
  CaveObj_128_Demon_scull: { w: 128, h: 128, padBottom: 34, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Demon_scull_dark_shadow.webp' },
  CaveObj_128_Dinosaur_skeleton_part1: { w: 128, h: 128, padBottom: 29, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Dinosaur_skeleton_part1_dark_shadow.webp' },
  CaveObj_128_Dinosaur_skeleton_part2: { w: 128, h: 128, padBottom: 18, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Dinosaur_skeleton_part2_dark_shadow.webp' },
  CaveObj_128_Gates3: { w: 128, h: 128, padBottom: 32, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/Gates_dark_shadow3.webp' },
  CaveObj_128_cocoon_web: { w: 128, h: 128, padBottom: 18, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/cocoon_web.webp' },
  CaveObj_128_magic_circle2: { w: 128, h: 128, padBottom: 32, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/magic_circle2_dark_shadow.webp' },
  CaveObj_128_magic_circle: { w: 128, h: 128, padBottom: 29, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/magic_circle_dark_shadow.webp' },
  CaveObj_128_mushroom21: { w: 128, h: 128, padBottom: 25, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/mushroom2_dark_shadow1.webp' },
  CaveObj_128_mushroom31: { w: 128, h: 128, padBottom: 16, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/mushroom3_dark_shadow1.webp' },
  CaveObj_128_mushroom32: { w: 128, h: 128, padBottom: 22, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/mushroom3_dark_shadow2.webp' },
  CaveObj_128_white_crystal2: { w: 128, h: 128, padBottom: 22, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/white_crystal_light_shadow2.webp' },
  CaveObj_128_white_crystal3: { w: 128, h: 128, padBottom: 24, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/white_crystal_light_shadow3.webp' },
  CaveObj_128_white_crystal4: { w: 128, h: 128, padBottom: 41, scale: 0.78, path: 'assets/cave objects/PNG/Objects_separately/128/white_crystal_light_shadow4.webp' },
  CaveObj_64_Beige_rpck2: { w: 64, h: 64, padBottom: 5, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/Beige_rpck_dark_shadow2.webp' },
  CaveObj_64_Beige_rpck3: { w: 64, h: 64, padBottom: 13, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/Beige_rpck_dark_shadow3.webp' },
  CaveObj_64_Blue_green_crystal1: { w: 64, h: 64, padBottom: 9, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/Blue-green_crystal_dark_shadow1.webp' },
  CaveObj_64_Blue_green_crystal2: { w: 64, h: 64, padBottom: 13, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/Blue-green_crystal_dark_shadow2.webp' },
  CaveObj_64_Bonefire: { w: 64, h: 64, padBottom: 20, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/Bonefire_dark_shadow.webp' },
  CaveObj_64_Dark_totem5: { w: 64, h: 64, padBottom: 10, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/Dark_totem_dark_shadow5.webp' },
  CaveObj_64_Dinosaur_skeleton__head: { w: 64, h: 64, padBottom: 13, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/Dinosaur_skeleton__head_dark_shadow.webp' },
  CaveObj_64_Dinosaur_skeleton__light: { w: 64, h: 64, padBottom: 13, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/Dinosaur_skeleton__light_dark_shadow.webp' },
  CaveObj_64_Gates1: { w: 64, h: 64, padBottom: 5, scale: 1.45, path: 'assets/cave objects/PNG/Objects_separately/64/Gates_dark_shadow1.webp' },
  CaveObj_64_Gates2: { w: 64, h: 64, padBottom: 4, scale: 1.45, path: 'assets/cave objects/PNG/Objects_separately/64/Gates_dark_shadow2.webp' },
  CaveObj_64_caveman_statue1: { w: 64, h: 64, padBottom: 2, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/caveman_statue_dark_shadow1.webp' },
  CaveObj_64_caveman_statue2: { w: 64, h: 64, padBottom: 9, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/caveman_statue_dark_shadow2.webp' },
  CaveObj_64_crystal_blue_green_vertical1: { w: 64, h: 64, padBottom: 13, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/crystal_blue-green_vertical1.webp' },
  CaveObj_64_crystal_blue_green_vertical3: { w: 64, h: 64, padBottom: 13, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/crystal_blue-green_vertical3.webp' },
  CaveObj_64_mushroom11: { w: 64, h: 64, padBottom: 2, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/mushroom1_dark_shadow1.webp' },
  CaveObj_64_mushroom12: { w: 64, h: 64, padBottom: 10, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/mushroom1_dark_shadow2.webp' },
  CaveObj_64_mushroom22: { w: 64, h: 64, padBottom: 4, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/mushroom2_dark_shadow2.webp' },
  CaveObj_64_mushroom23: { w: 64, h: 64, padBottom: 10, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/mushroom2_dark_shadow3.webp' },
  CaveObj_64_mushroom33: { w: 64, h: 64, padBottom: 9, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/mushroom3_dark_shadow3.webp' },
  CaveObj_64_mushroom41: { w: 64, h: 64, padBottom: 11, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/mushroom4_dark_shadow1.webp' },
  CaveObj_64_mushroom42: { w: 64, h: 64, padBottom: 14, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/mushroom4_dark_shadow2.webp' },
  CaveObj_64_white_crystal1: { w: 64, h: 64, padBottom: 6, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/white_crystal_dark_shadow1.webp' },
  CaveObj_64_white_crystal2: { w: 64, h: 64, padBottom: 13, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/white_crystal_dark_shadow2.webp' },
  CaveObj_64_white_crystal_vertical1: { w: 64, h: 64, padBottom: 14, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/white_crystal_vertical1.webp' },
  CaveObj_64_white_crystal_vertical3: { w: 64, h: 64, padBottom: 14, scale: 0.85, path: 'assets/cave objects/PNG/Objects_separately/64/white_crystal_vertical3.webp' },
  CaveObj_32_Blue_green_crystal3: { w: 32, h: 32, padBottom: 3, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/32/Blue-green_crystal_dark_shadow3.webp' },
  CaveObj_32_Human_skeleton: { w: 32, h: 32, padBottom: 5, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/32/Human_skeleton_dark_shadow.webp' },
  CaveObj_32_crystal_blue_green_vertical2: { w: 32, h: 32, padBottom: 5, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/32/crystal_blue-green_vertical2.webp' },
  CaveObj_32_crystal_blue_green_vertical4: { w: 32, h: 32, padBottom: 5, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/32/crystal_blue-green_vertical4.webp' },
  CaveObj_32_mushroom13: { w: 32, h: 32, padBottom: 1, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/32/mushroom1_dark_shadow3.webp' },
  CaveObj_32_mushroom43: { w: 32, h: 32, padBottom: 4, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/32/mushroom4_dark_shadow3.webp' },
  CaveObj_32_white_crystal3: { w: 32, h: 32, padBottom: 4, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/32/white_crystal_dark_shadow3.webp' },
  CaveObj_32_white_crystal_vertical2: { w: 32, h: 32, padBottom: 6, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/32/white_crystal_vertical2.webp' },
  CaveObj_32_white_crystal_vertical4: { w: 32, h: 32, padBottom: 6, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/32/white_crystal_vertical4.webp' },
  CaveObj_16_Blue_green_crystal4: { w: 16, h: 16, padBottom: 1, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/16/Blue-green_crystal_dark_shadow4.webp' },
  CaveObj_16_white_crystal4: { w: 16, h: 16, padBottom: 2, scale: 0.95, path: 'assets/cave objects/PNG/Objects_separately/16/white_crystal_dark_shadow4.webp' },
  // Sunken Shrine and Abyss Biome Decorations
  sunken_shrine: { w: 359, h: 491, padBottom: 25, scale: 0.8, path: 'assets/sunken_shrine.webp' },
  // Well of Life Structure (Replaces caves in Demo mode)
  life_well: { w: 112, h: 138, padBottom: 20, scale: 1.0, path: 'assets/structures/life_well.webp' },
  // Chicken Secret Biome Decorations & Structures
  chicken_coop:   { w: 84,  h: 85,  padBottom: 6,  scale: 1.0, sheetImg: CHICKEN_ASSETS.decorations.coop,      sx: 0, sy: 0, sw: 479, sh: 488, path: 'assets/Chicken Biom/chicken_coop.webp?v260' },
  chicken_feeder: { w: 56,  h: 45,  padBottom: 4,  scale: 1.0, sheetImg: CHICKEN_ASSETS.decorations.feeder,    sx: 0, sy: 0, sw: 564, sh: 454, path: 'assets/Chicken Biom/chicken_Feeder_decor.webp?v260' },
  egg_nest:       { w: 46,  h: 38,  padBottom: 4,  scale: 1.0, sheetImg: CHICKEN_ASSETS.decorations.nest,      sx: 0, sy: 0, sw: 530, sh: 442, path: 'assets/Chicken Biom/Egg_Nest_Decor.webp?v260' },
  hay_bale:       { w: 50,  h: 50,  padBottom: 4,  scale: 1.0, sheetImg: CHICKEN_ASSETS.decorations.hayBale,   sx: 0, sy: 0, sw: 479, sh: 476, path: 'assets/Chicken Biom/hay_bale_decor.webp?v260' },
  scarecrow:      { w: 58,  h: 72,  padBottom: 6,  scale: 1.0, sheetImg: CHICKEN_ASSETS.decorations.scarecrow, sx: 0, sy: 0, sw: 410, sh: 510, path: 'assets/Chicken Biom/scarecrow_decor.webp?v260' },
  chicken_shrine: { w: 112, h: 121, padBottom: 10, scale: 1.0, sheetImg: CHICKEN_ASSETS.environment.chickenShrine, sx: 0, sy: 0, sw: 470, sh: 509, path: 'assets/Chicken Biom/chicken_shrine_env.webp?v260' },
  chicken_portal: { w: 116, h: 118, padBottom: 8,  scale: 1.0, sheetImg: CHICKEN_ASSETS.environment.chickenPortal, sx: 0, sy: 0, sw: 514, sh: 522, path: 'assets/Chicken Biom/chicken_portal_env.webp?v260' },
  chicken_sign:   { w: 58,  h: 72,  padBottom: 4,  scale: 1.0, sheetImg: CHICKEN_ASSETS.environment.chickenSign,   sx: 0, sy: 0, sw: 410, sh: 510, path: 'assets/Chicken Biom/scarecrow_decor.webp?v260' },
  ...Object.fromEntries(Object.entries(window.ABYSS_DECOR_DIMS).map(([k, d]) => [
    k, { w: d.destW, h: d.destH, padBottom: d.padBottom, scale: 1.0, sheetImg: d.img, sx: d.sx, sy: d.sy, sw: d.sw, sh: d.sh }
  ]))
};
window.TREE_ALIASES = {
  oakTree: 'Tree1', pineTree: 'Christmas_tree1', snowPineTree: 'Snow_christmass_tree1',
  palmTree: 'Palm_tree1_1', deadTree: 'Burned_tree1', birchTree: 'Tree2',
  autumnTree: 'Autumn_tree1', willowTree: 'Forest_Willow1', rpg_oak_tree: 'Tree1',
  rpg_pine_tree: 'Christmas_tree1', rpg_birch_tree: 'Tree2', rpg_dead_tree: 'Burned_tree1',
  rpg_palm_tree: 'Palm_tree1_1', rpg_cherry_tree: 'Flower_tree1', rpg_willow_tree: 'Forest_Willow1',
  rpg_magic_tree: 'Forest_Luminous_tree1', witheredTree: 'Broken_tree4',
  rock1: 'Rock4_3', rock2: 'Rock1_3', rpg_boulder: 'Rock4_1', canyonRock: 'Rock2_2',
  bush: 'Bush_simple1_1', rpg_bush_flower: 'Bush_blue_flowers1', cactus: 'Bush_Cactus2_1',
  deadShrub: 'Bush_Burned_tree1', mushroom: 'Forest_White_red_mushroom2',
  rpg_mushroom_glow: 'CaveObj_64_mushroom22', rpg_crystal_purple: 'Crystal_Violet_crystal1',
  crystalSpire: 'Crystal_Blue_crystal1', geodeBlue: 'Crystal_Blue_crystal2',
  rpg_geode: 'Crystal_Pink_crystal2', rpg_stalagmite: 'CaveObj_64_Beige_rpck2',
  bonePile: 'CaveObj_64_Bonefire', animalSkull: 'CaveObj_64_Dinosaur_skeleton__head',
  tombstone: 'CaveObj_64_caveman_statue1',
  caveMouth: 'CaveObj_128_Gates3', caveSnow: 'CaveObj_128_Gates3', caveDesert: 'CaveObj_128_Gates3',
  caveVolcano: 'CaveObj_64_Gates1', caveDeadlands: 'CaveObj_64_Gates1',
  caveSwamp: 'CaveObj_64_Gates2', caveMagic: 'CaveObj_64_Gates2',
  desertShrine: 'CaveObj_256_Dinosaur_skeleton_full', ruinGate: 'CaveObj_128_Building1',
  cabin: 'Forest_Living_gazebo1',
  Hole_pit: 'abyss_hole_pit1', Hole_pit2: 'abyss_hole_pit2', Hole_pit3: 'abyss_hole_pit3',
  hole_pit: 'abyss_hole_pit1', hole_pit1: 'abyss_hole_pit1', hole_pit2: 'abyss_hole_pit2', hole_pit3: 'abyss_hole_pit3'
};
window.EXT_TREES = {};

const undergroundTilesetImg = new Image();
undergroundTilesetImg.src = 'assets/undergroud_city/Tiled_files/walls_floor.webp';

const undergroundObjectsImg = new Image();
undergroundObjectsImg.src = 'assets/undergroud_city/Tiled_files/Objects.webp';

const undergroundChestsImg = new Image();
undergroundChestsImg.src = 'assets/undergroud_city/Tiled_files/doors_lever_chest_animation.webp';

const undergroundTrapsImg = new Image();
undergroundTrapsImg.src = 'assets/undergroud_city/Tiled_files/trap_animation.webp';

const undergroundCracksFloorImg = new Image();
undergroundCracksFloorImg.src = 'assets/undergroud_city/Tiled_files/decorative_cracks_floor.webp';

const undergroundCracksWallsImg = new Image();
undergroundCracksWallsImg.src = 'assets/undergroud_city/Tiled_files/decorative_cracks_walls.webp';

const dungeon1MapImg = new Image();
dungeon1MapImg.src = 'assets/undergroud_city/dungeon1_rendered.webp';

const dungeon1OverheadImg = new Image();
dungeon1OverheadImg.src = 'assets/undergroud_city/dungeon1_overhead.webp';


// ═══════════════════════════════════════════════════════════
// SPRITES
// ═══════════════════════════════════════════════════════════
const SPRITE_DEFS={
  player1:{palette:{K:'#28202a',H:'#4e3028',S:'#f0bd85',R:'#b73432',L:'#f2c45e',B:'#75492f',T:'#354b67',G:'#292b37'},data:["......KKKK......",".....KHHHHK.....","....KHHHHHHK....","...KKSSSSSSKK...","...KSSKSSKSSK...","...KSSSSSSSSK...","....KKSSSSKK....",".....KSSSSK.....","....KKRRRRKK....","...KKRRRRRRKK...","..KKRRRRRRRRKK..","..KRRRLLRRRLLK..","..KRRRBBBBRRRK..","...KRRRRRRRRK...","....KKBBBBKK....",".....KTTTTK.....","....KKTTTTKK....","...KKK....KKK...","...KKK....KKK...","..KKKK....KKKK.."]},
  player2:{palette:{K:'#28202a',H:'#4e3028',S:'#f0bd85',R:'#b73432',L:'#f2c45e',B:'#75492f',T:'#354b67',G:'#292b37'},data:["......KKKK......",".....KHHHHK.....","....KHHHHHHK....","...KKSSSSSSKK...","...KSSKSSKSSK...","...KSSSSSSSSK...","....KKSSSSKK....",".....KSSSSK.....","...KKRRRRRRKK...","..KKRRRRRRRRKK..","..KRRRRRRRRRRRK.","..KRRLLBBBBLLRK.","..KRRRBBBBRRRK..","...KRRRRRRRRK...","....KKBBBBKK....","....KTTTTKK.....","....KKTTTTKK....","....KKK...KKK...","...KKK.....KKK..","....KKK...KKK..."]},
  playerElf:{palette:{K:'#25352e',H:'#d5a94f',S:'#f2d5a6',E:'#a9d581',W:'#26352b',G:'#477d45',L:'#9fbd59',B:'#67482e',D:'#344d37'},data:["E...KKHHKK...E..",".....KHHHHK.....","....KHHHHHHK....","...KKSSSSSSKK...","...KSSWSSWSSK...","...KSSSSSSSSK...","....KKSSSSKK....",".....KSSSSK.....","....KKGGGGKK....","...KKGGGGGGKK...","..KKGGLLLLGGKK..","..KGGGGLLLLGGGK.","..KGGGBBBBGGGK..","...KGGGDDGGGK...","....KKGGGGKK....",".....KSSSSK.....","....KKBBBBKK....","...KKK....KKK...","...KKK....KKK...","..KKKK....KKKK.."]},
  playerElfWalk:{palette:{K:'#25352e',H:'#d5a94f',S:'#f2d5a6',E:'#a9d581',W:'#26352b',G:'#477d45',L:'#9fbd59',B:'#67482e',D:'#344d37'},data:["E...KKHHKK...E..",".....KHHHHK.....","....KHHHHHHK....","...KKSSSSSSKK...","...KSSWSSWSSK...","...KSSSSSSSSK...","....KKSSSSKK....",".....KSSSSK.....","....KKGGGGKK....","...KKGGGGGGKK...","..KKGGLLLLGGKK..","..KGGGGLLLLGGGK.","..KGGGBBBBGGGK..","...KGGGDDGGGK...","....KKGGGGKK....",".....KSSSSK.....","....KKBBBBKK....","..KKK......KKK..","...KKK....KKK...","...KKK....KKK..."]},
  playerOrc:{palette:{K:'#292229',H:'#382b33',S:'#6eaa62',E:'#8cc979',W:'#1c241d',T:'#f2eee2',C:'#c7d4c2',B:'#4f6f99',D:'#324766',L:'#79a9c4'},data:["......KKKK......",".....KHHHHK.....","....KHHHHHHK....","...KKSSSSSSKK...","...KSSWSSWSSK...","..KKSSSSSSSSKK..","...KTTSSSSSTK...","....KKSSSSKK....","....KKBBBBKK....","...KKBBBBBBKK...","..KKBBLLLLBBKK..","..KBBBBLLLLBBK..","..KBBBBCLLBBBK..","...KBBBDDBBBK...","....KKBBBBKK....","....KKDDDDKK....","...KKK....KKK...","...KKK....KKK...","..KKKK....KKKK..","..KKKK....KKKK.."]},
  playerOrcWalk:{palette:{K:'#292229',H:'#382b33',S:'#6eaa62',E:'#8cc979',W:'#1c241d',T:'#f2eee2',C:'#c7d4c2',B:'#4f6f99',D:'#324766',L:'#79a9c4'},data:["......KKKK......",".....KHHHHK.....","....KHHHHHHK....","...KKSSSSSSKK...","...KSSWSSWSSK...","..KKSSSSSSSSKK..","...KTTSSSSSTK...","....KKSSSSKK....","....KKBBBBKK....","...KKBBBBBBKK...","..KKBBLLLLBBKK..","..KBBBBLLLLBBK..","..KBBBBCLLBBBK..","...KBBBDDBBBK...","....KKBBBBKK....","....KKDDDDKK....","...KKK....KKK...","..KKK.....KKK...","...KKK....KKK...","...KKK....KKK..."]},
  playerDwarf:{palette:{K:'#34251e',H:'#b8692f',S:'#f0c39b',W:'#28231e',G:'#536f3c',D:'#34482c',B:'#67442d',L:'#e4b54c',C:'#d68d42'},data:["......KKKK......",".....KKKKKK.....","....KKHHHHKK....","...KKHHHHHHKK...","...KKSSSSSSKK...","...KSSWSSWSSK...","...KSSSSSSSSK...","....KKHHHHKK....","...KKHHHHHHKK...","..KKHHHHHHHHKK..","..KHHHCLLCHHHK..","..KHHHBBBBHHHK..","..KKGGBBBBGGKK..","...KGGGLLLGGK...","..KKGGGGGGGGKK..","..KKGBBGBBGGKK..","...KKBBBBBBKK...","...KKK....KKK...","...KKK....KKK...","..KKKK....KKKK.."]},
  playerDwarfWalk:{palette:{K:'#34251e',H:'#b8692f',S:'#f0c39b',W:'#28231e',G:'#536f3c',D:'#34482c',B:'#67442d',L:'#e4b54c',C:'#d68d42'},data:["......KKKK......",".....KKKKKK.....","....KKHHHHKK....","...KKHHHHHHKK...","...KKSSSSSSKK...","...KSSWSSWSSK...","...KSSSSSSSSK...","....KKHHHHKK....","...KKHHHHHHKK...","..KKHHHHHHHHKK..","..KHHHCLLCHHHK..","..KHHHBBBBHHHK..","..KKGGBBBBGGKK..","...KGGGLLLGGK...","..KKGGGGGGGGKK..","..KKGBBGBBGGKK..","...KKBBBBBBKK...","..KKKK....KKKK..","...KKK....KKK...","...KKK....KKK..."]},
  bat:{palette:{B:'#4a148c',W:'#ff1744',D:'#311b92'},data:["B..........B","BB........BB","BBB..BB..BBB","BBBBBBBBBBBB",".BBBBBBBBBB.","..BBDWWDWBB.","...BBBBBB...","....BBBB....","....B..B...."]},
  zombie:{palette:{Z:'#7CB342',D:'#33691E',W:'#c62828',M:'#1a1a1a'},data:["....ZZZZ....","...ZZZZZZ...","..ZZZZZZZZ..","..ZWZZZZWZ..","..ZZZZZZZZ..","..ZZMMMMZZ..","...ZZZZZZ...","....ZZZZ....","..ZZZZZZZZ..",".ZZZZZZZZZZ.",".ZZZZZZZZZZ.",".ZZZZZZZZZZ.","...ZZZZZZ...","...ZZ..ZZ...","...ZZ..ZZ...","..ZZZ..ZZZ.."]},
  skeleton:{palette:{"W":"#e0e0e0","K":"#1a1a1a","G":"#9e9e9e"},data:["....WWWW....","...WWWWWW...","..WWWWWWWW..","..WKWWWWKW..","..WWWWWWWW..","...WKKKKW...","....WWWW....","....WWWW....","..WWWKKWWW..",".WWWWKKWWWW.",".WW.WKKW.WW.",".WW.KKKK.WW.","...WWKKWW...","...WW..WW...","...WW..WW...","..WWW..WWW.."]},
  ghost:{palette:{C:'#80DEEA',W:'#1a1a1a',L:'#b2ebf2'},data:["...CCCCCC...","..CCCCCCCC..",".CCCCCCCCCC.",".CWCCCCCCWC.",".CCCCCCCCCC.",".CCCCCCCCCC.",".CCCCCCCCCC.",".CCCCCCCCCC.",".CCCCCCCCCC.",".CCCCCCCCCC.",".LCCCCCCCLL.",".CC.CC.CC.C.",".C..C..C..C."]},
  boss:{palette:{D:'#B71C1C',R:'#e53935',W:'#ffeb3b',M:'#1a1a1a',K:'#7f0000'},data:["..KK........KK..",".KKKK......KKKK.",".KWWKK....KKWWK.",".KKKKKKKKKKKKKK.","..KKKKKKKKKKKK..",".KKKKKKKKKKKKKK.","KKKRRKKKKKKRRKKK","KKKRRKKKKKKRRKKK","KKKKKKKKKKKKKKKK",".KKKKKMMMMKKKKK.",".KKKKKKKKKKKKKK.","..KKKKKKKKKKKK..","...KKKKKKKKKK...","..KKK......KKK..","..KKK......KKK..",".KKKK......KKKK."]},
  wolf:{palette:{W:'#9E9E9E',K:'#1a1a1a',L:'#e0e0e0'},data:["..WW......WW..",".WWWW....WWWW.","WWWWWWWWWWWWWW","WWKKWWWWWWKKWW","WWWWWWWWWWWWWW","WWWWWKKKKWWWWW",".WWWWWWWWWWWW.","..WWWWWWWWWW..","..WW..WW..WW..","..W....W...W.."]},
  mummy:{palette:{B:'#d7c9a8',D:'#8b7355',K:'#1a1a1a'},data:["....BBBB....","...BBBBBB...","..BBBBBBBB..","..BKBBBBKB..","..BBBBBBBB..","..BBBBBBBB..","...BBBBBB...","..DDBBBBDD..",".BBBBBBBBBB.",".DDBBBBBBDD.",".BBBBBBBBBB.",".DDBBBBBBDD.","...BB..BB...","...BB..BB...","...BB..BB...","..BBB..BBB.."]},
  slime:{palette:{G:'#5a9a3a',D:'#3a6a2a',L:'#c8e6c9',K:'#1a1a1a'},data:["....GGGG....","..GGGGGGGG..",".GGLLGGLLGG.",".GLKGGGGKLG.","GGGGGGGGGGGG","GGGGGGGGGGGG","GGGGGGGGGGGG",".GGGGGGGGGG.","..GGGGGGGG..","....DDDD...."]},
  iceGolem:{palette:{I:'#8ac6e8',W:'#e0f0ff',K:'#1a1a1a',D:'#5a96c8'},data:["....IIIIII....","...IIIIIIII...","..IIIIIIIIII..","..IKIIIIIIKI..","..IIIIIIIIII..","...IIIIIIII...","..IIIIIIIIII..",".IIIIIIIIIIII.","IIIIIIIIIIIIII","IIDIIIIIIIIDII","IIIIIIIIIIIIII",".IIIIIIIIIIII.","..IIIIIIIIII..","..III....III..","..III....III..",".IIII....IIII."]},
  fish:{palette:{F:'#3b82f6',W:'#fff',D:'#1e3a8a'},data:["..FFFF..",".FFFFFF.","FFWFFFFF","FFFFFFFF",".FFFFFF.","..FFFF.."]},
  crocodile:{palette:{G:'#4a7a3a',D:'#1a3a1a',W:'#e0e0e0',K:'#1a1a1a'},data:["..GGGG......",".GGGGGGG....","GGWGGGGGGGGG","GGGGGGGGGGGG","GGGGGGGGGGG.",".GGGGGGGGG..","..GGGGGGG...","...GG.GG...."]},
  vampire:{palette:{K:'#1a1a1a',R:'#b71c1c',W:'#fff',C:'#5a0000'},data:["....KKKK....","...KKKKKK...","..KKKKKKKK..","..KRKKKKRK..","..KKKKKKKK..","..KKWWWWKK..","...KCCCCK...","..KKKKKKKK..",".KKKKKKKKKK.",".KKKKKKKKKK.",".KKKKKKKKKK.","...KK..KK...","...KK..KK...","..KKK..KKK.."]},
  vampireLord:{palette:{K:'#1a1a1a',R:'#b71c1c',W:'#fff',C:'#5a0000',Y:'#ffeb3b',P:'#6a1b9a'},data:["P...........P","PP...KKKK...PP","PPP.KKKKKK.PPP","PPPPKRKKRKPPPP","PPPPKKKKKKPPPP",".PPP.KWWWWK.PPP","..PP.KCCCCK.PP","...PKKKKKKP...","..KKKKKKKKKK..",".KKKKKKKKKKKK.","KKKKRKKKKRKKKK","KKKKKKKKKKKKKK","KKKK.RRRR.KKKK",".KKK.RRRR.KKK.",".KKK..KK..KKK.","KKKK..KK..KKKK"]},
  pharaoh:{palette:{Y:'#ffd54f',W:'#fff',B:'#d7c9a8',K:'#1a1a1a'},data:["...YY..YY...","..YWYYYYWY..","..YYYYYYYY..",".BBBBBBBBBB.",".BWBBBBBBWB.",".BBBBBBBBBB.","..BBBBBBBB..",".BBBBBBBBBB.","BBBBBBBBBBBB","BBBBBBBBBBBB","BWWBBBBBBWWB","BBBBBBBBBBBB",".BBB..BBB...",".BB....BB..."]},
  iceTitan:{palette:{I:'#8ac6e8',W:'#e0f0ff',K:'#1a1a1a',D:'#5a96c8'},data:["...IIIIII...","..IIWWIIII..","..IIIIIIII..","..IKIIIIKI..","...IIIIII...","..IIIIIIII..",".IIIIIIIIII.","IIIIIIIIIIII","IIDIIIIIIIIDI","IIIIIIIIIIII","IIIIIIIIIIII",".IIIIIIIIII.","..III..III..",".IIII..IIII."]},
  treant:{palette:{G:'#3a7a2a',L:'#5a9a3a',B:'#5a3a1e',K:'#1a1a1a'},data:["...GGGGGG...","..GGLLGGGG..",".GGGGGGGGGG.","GGGGGGGGGGGG","GGGKKGGKKGGG","GGGGGGGGGGGG",".GGGGGGGGGG.","..GGGGGGGG..","....BBBB....","..BBBBBBBB..","..BBBBBBBB..","...BBBBBB...","...BB..BB...","...BB..BB...","..BBB..BBB..","..BBB..BBB.."]},
  swampHorror:{palette:{G:'#2a4a2a',D:'#0f1f0f',L:'#4a7a4a',K:'#ffeb3b'},data:["....GGGGGG....","..GGGGGGGGGG..",".GGLLGGLLGGGG.",".GGKGGGGKGGGG.","GGGGGGGGGGGGGG","GGGGGGGGGGGGGG","GGGGGGGGGGGGGG","GGGGGGGGGGGGGG",".GGGGGGGGGGGG.","..GGGGGGGGGG..","...GGGGGGGG...","....DDDDDD...."]},
  bloodLord:{palette:{R:'#b71c1c',D:'#5a0000',W:'#fff',K:'#1a1a1a',Y:'#ffeb3b'},data:["R..R......R..R","RR.R......R.RR","RRRR......RRRR","RRRRRRRRRRRRRR","RRRRRRRRRRRRRR",".RRRRRRRRRRRR.","..RRRRRRRRRR..","..RKWWWWWWKR..","..RKYWKWWYKR..","..RRRRRRRRRR..","..RRKKKKKKRR..","..RRRRRRRRRR..","...RRRRRRRR...","..RRR....RRR..","..RRR....RRR..",".RRRR....RRRR."]},
  gem:{palette:{"G":"#42a5f5","W":"#bbdefb","D":"#1565c0","A":"#65b1ec"},data:["..AAAA..",".AAWWGA.","AGWWGGGA","AGGGGAGA","GGGAAGGG","DGGGGGGD",".DGGGGD.","..DDDD.."]},
  bolt:{palette:{B:'#1976d2',W:'#64b5f6',L:'#bbdefb'},data:["...BB...","..BBBB..",".BBWWBB.","BBWWLWBB","BWWLWLWB","BWWLWLWB","BBWWLWBB",".BBWWBB.","..BBBB..","...BB..."]},
  knife:{palette:{W:'#e0e0e0',L:'#ffffff',K:'#5d4037'},data:["..WWWWWWWKKK",".WWWLWWWWWKK","WWWLWWWWWWKK",".WWWLWWWWWKK","..WWWWWWWKKK"]},
  wood:{palette:{B:'#5a3a1e',D:'#3a2a0a',L:'#8a5a2e'},data:["..LLBB..",".LLLLBB.","BBBBBBBB","BBBBBBBB","DDBBBBDD","DDDDDDDD"]},
  // ---- Equipment sprites ----
  boots:{palette:{B:'#8b4513',D:'#5a2a0a',L:'#c87040',K:'#1a1a1a'},data:["BBBBBBBB","BBBBBBBB","BBBBBBBB","BB....BB","BB....BB","BB....BB","BBBBBBBB","DDDDDDDD"]},
  ring:{palette:{G:'#ffd54f',Y:'#ffeb3b',D:'#b8860b',R:'#e53935'},data:["..GGGG..",".GG..GG.","GG.YY.GG","G.YRRY.G","G.YRRY.G","GG.YY.GG",".GG..GG.","..DDDD.."]},
  helmet:{palette:{G:'#9e9e9e',D:'#404040',L:'#d0d0d0'},data:["..GGGG..",".GLLGG.","GLGGGGLG","GGGGGGGG","GG....GG","GG....GG",".GGGGGG.","..DDDD.."]},
  amulet:{palette:{Y:'#ffeb3b',B:'#3b82f6',D:'#b8860b',L:'#fff'},data:["..D..D..",".D.YY.D.",".DYYYYD.","DDYBBYDD","..YBBY..","..YLLY..","...YY...","...DD..."]},
  boomerang:{palette:{B:'#8B4513',L:'#d2a679',W:'#fff'},data:["..BBBB..",".BLLBB..","BLB..BB.","BLB...B.","BLB..BB.",".BLLBB..","..BBBB..","........"]},
  arrow:{palette:{W:'#e0e0e0',B:'#5a3a1e',Y:'#ffd54f',R:'#e53935'},data:["...W....","..WWW...",".WWWWW..","WWWWWWW.","BBWWWBB.","..WWW...","..WRW...","..RRR..."]},
  mine:{palette:{K:'#1a1a1a',R:'#e53935',Y:'#ffeb3b',W:'#888'},data:["...KK...","..KRRK..",".KKRRKK.","KKKYYKKK","KKKKKKKK","KWWKKWWK","KKKKKKKK",".KK..KK."]},
  orb:{palette:{P:'#ba68c8',W:'#fff',L:'#e1bee7',D:'#4a148c'},data:["...PP...","..PPPP..",".PPLLPP.","PPWLLWPP","PPLLWLPP",".PPLLPP.","..PPPP..","...DD..."]},
  holyFlask:{palette:{B:'#42a5f5',W:'#bbdefb',G:'#e0e0e0',Y:'#fff9c4'},data:["...GG...","...GG...","..GGGG..","..BWWB..",".BWWWWB.","BWWYYWWB","BWWYYWWB","BBWWWWBB"]},
  grassTuft:{palette:{G:'#5a9a3a',D:'#3a6a2a'},data:["..G..G..",".GG..GG.","GGDGGDGG","GDGGGDGG",".D....D."]},
  birchTree:{palette:{G:'#4a8a42',L:'#86b96a',W:'#e4dfc7',D:'#8d896f'},data:["..GGGGGG....",".GGLLGGGG...","GGGGGGGGGG..",".GGGGGGGGG..","..GGGGGG....","....WW......","....WD......","....WW......","....WD......","....WW......","...WWWW....."]},
  autumnTree:{palette:{R:'#b94c32',O:'#df8a3b',Y:'#e3b94f',B:'#65452d'},data:["...OOOOO....","..OORROOO...",".OOOYYOOOO..","OOOOOOOOOO..",".OOOOOOOO...","...OOOO.....",".....BB.....",".....BB.....",".....BB.....","....BBBB...."]},
  willowTree:{palette:{G:'#527c3b',L:'#86a957',B:'#5a422b',D:'#382e25'},data:["...GGGGGGG....","..GGLLGGGGGG..",".GGGGGGGGGGGG.","GGGGGGGGGGGGGG",".GGGGGGGGGGG..","..GGGGGGGGGG..","...GGGGGGGG...","......BB......","......BB......","......BB......",".....BBBB....."]},
  flower1:{palette:{R:'#e53935',Y:'#ffeb3b',G:'#3a6a2a',W:'#ff8a80'},data:["..RRR...",".RWRRR..","RRRRRRR.",".RRRRR..","...Y....","...Y....","...G....","..GGG..."]},
  flower2:{palette:{Y:'#ffeb3b',O:'#ff9800',G:'#3a6a2a'},data:["...YYY..","..YYYYY.","..YOOOY.","..YYYYY.","...YYY..","....G...","....G...","...GGG.."]},
  rock1:{palette:{G:'#808080',D:'#404040',L:'#b0b0b0'},data:["..GGG...",".GLGGG..","GLGGGGG.","GGGGGGG.",".GGGGG..","..DDDD.."]},
  rock2:{palette:{G:'#6a6a6a',D:'#3a3a3a',L:'#909090'},data:["...GG...","..GGGL..",".GGGGGG.","GGGGGGG.",".DGGGGD.","..DDDD.."]},
  mushroom:{palette:{R:'#e53935',W:'#fff',S:'#f5f5dc',D:'#8a1a1a'},data:["..RRRR..",".RRWWRR.","RRWWRRWR","RRRRRRRR",".RRRRRR.","..SSSS..","..SSSS..","..SSSS.."]},
  bush:{palette:{G:'#3a7a2a',D:'#1a4a1a',L:'#5a9a3a'},data:["..GGGG..",".GGLLGG.","GGGGGGGG","GLGGGGLG","GGGGGGGG",".GGGGGG.","..GGGG.."]},
  oakTree:{palette:{"G":"#397a2a","L":"#70a84b","D":"#245021","B":"#62452c","A":"#2b341d"},data:["....DDDD....","..DDDGGDDD..",".DDGGGLGGDD.","DDGGLLLLLGDD","DDGGLLLLLGDD",".DDGGGLGGDD.","..DDDGDDDD..","....DBBB....","....DBBB....","....BBBB....","...BBBBBB...","..BBBBBBBB.."]},
  pineTree:{palette:{G:'#2a5a2a',D:'#1a3a1a',B:'#4a2a1a',W:'#fff'},data:["....GG....","...GGGG...","..GGGGGG..","...WWWW...","..GGGGGG..",".GGGGGGGG.","..GGGGGG..",".GGGGGGGG.","GGGGGGGGGG","..GGGGGG..",".GGGGGGGG.","GGGGGGGGGG","....BB....","....BB....","....BB...."]},
  snowPineTree:{palette:{G:'#315d59',D:'#244440',B:'#4a3b2d',W:'#f2f7f5'},data:["....GG....","...WWGG...","..WWGGGG..","...WWWW...","..GGWWGG..",".GGWWGGGG.","..GGGGGG..",".GGWWGGGG.","GGGGWWGGGG","..GGGGGG..",".GGGGGGGG.","GGGGGGGGGG","....BB....","....BB....","....BB...."]},
  cactus:{palette:{"G":"#4a8a3a","D":"#2a5a2a","L":"#6aaa4a","Y":"#ffeb3b","A":"#0c0d0d"},data:["...GG...","..GGGG..","..GGGG..","G.GAGG.G","GGGGGGGG","GGGGGGGG","G.GGAG.G","..GGGG..","..GGGG..","..GGYY..","..GGGG..","..GAGG..","..GGGG..","..GGAG..","..GGGG..","..DDDD.."]},
  palmTree:{palette:{G:'#468a43',L:'#78aa4b',B:'#8a6038',D:'#67452c'},data:["...LG..GL...","..LGGGGGGL..","LGGGGGGGGGGL","...GGGGGG...",".....BB.....",".....BB.....",".....BB.....",".....BB.....",".....BB.....","....BBBB....","...BBBBBB..."]},
  mountain:{palette:{"S":"#626b68","L":"#a4aaa0","D":"#39413f","W":"#e4e9e1","G":"#4b6640","A":"#c8cbcb"},data:[".........L..........","........LLL.........",".......LLLLL........","......LLLALLL.......",".....LLLALLLLL......","....LLLALLLLLLL.....","...LLLALLLLALLLLL...","..LLLALLLLLLALLLLL..",".LLLLLLLLLLLLALLLLL.","LLLLLLLLLLLLLLLLLLLL","SSSSSSSSSDDSSSSSSSSS","SSSSSSSSSDDSSSSSSSSS","SSSSSSSSDDDDSSSSSSSS","SSSSSSDDDDDDSSSSSSSS","SSSSSSSSSSSSSSSSSSSS","GGGGGSSSSSSSSSSGGGGG","GGGGGGGGGGGGGGGGGGGG"]},
  snowPeak:{palette:{S:'#657783',D:'#465660',W:'#f5fbff',I:'#c8e2ef'},data:[".........W..........","........WWW.........",".......WWWWW........","......WWWWWWW.......",".....WWWWWWWWW......","....WWWWWWWWWWW.....","...WWWWWWWWWWWWWW...","..WWWWWWWWWWWWWWWW..",".WWWWWWWWWWWWWWWWWW.","WWWWWWWWWWWWWWWWWWWW","SSSSSSSSSDDSSSSSSSSS","SSSSSSSSSDDSSSSSSSSS","SSSSSSSSDDDDSSSSSSSS","SSSSSSSDDDDDDSSSSSSS","SSSSSSSSSSSSSSSSSSSS","SSSSSSSSSSSSSSSSSSSS","SSSSSSSSSSSSSSSSSSSS"]},
  mesa:{palette:{R:'#a85536',O:'#ce7b49',D:'#713f2d',Y:'#edbd73',S:'#8e4c31'},data:["....YYYYYYYYYYYY....","...YOOOOOOOOOOY...","..YOORRRRRRRROOY..",".YORRRRRRRRRRRROY.","YORRRRRRRRRRRRRROY","ORRRRRRRRRRRRRRRRO","ORRRRRRRRRRRRRRRRO","ORRRRRRRRRRRRRRRRO","ORRRRRRRRRRRRRRRRO","ORRRSSSSDDDDSSRRRO","ORRSSSSDDDDDDSSRRRO","ORRSSSSDDDDDDSSRRRO","ORRRSSSSDDDDSSRRRO","ORRRRRRRRRRRRRRRRO",".ORRRRRRRRRRRRRRO.","..OOOOOOOOOOOOOO..","...DDDDDDDDDDDD...","..DDDDDDDDDDDDDD.."]},
  caveMouth:{palette:{"S":"#73776d","L":"#a8a793","R":"#514f46","K":"#111612","M":"#202723"},data:["....LLLL....","..LLSSSSLL..",".LSSSSSSSSL.","LSSSSSSSSSSL","SSSSSRRRSSSS","SSSSRKKKRSSS","SSSRKKKKKRSS","SSSRKKKKKRSS","SSSSRKKKRSSS","SSSSSMMSSSSS","SSSSSSSSSSSS","..SSSSSSSS.."]},
  ruinGate:{palette:{S:'#8f8976',L:'#d0c4a1',D:'#5b574d',K:'#292b28',G:'#71805a',M:'#aaa28a'},data:["....LLLLLLLLLLLL....","...LSSSSSSSSSSSSL...","..LSSSSSSSSSSSSSSL..","..LSSSSSSSSSSSSSSL..","..LSSSSSSSSSSSSSSL..","..LSSSSSSSSSSSSSSL..","..LSSSSSSSSSSSSSSL..","..LSSSSSSSSSSSSSSL..","..LSSSSSSSSSSSSSSL..","..LSSSSSSSSSSSSSSL..","..LSSSSSSSSSSSSSSL..","..LSSSSSSSSSSSSSSL..","..LLLSSSSSSSSSSLLL..","..DDDLLLLLLLLLDDDD..","...GG...GG...GGGG...","..GGGG..GGGGGGGGGG.."]},
  desertShrine:{palette:{S:'#bd884d',L:'#f0c77a',D:'#785134',R:'#a65036',K:'#38271e',Y:'#ffdf9a'},data:["........YY........",".......YYYY.......","......YYYYYY......",".....YYYYYYYY.....","....YYLLRRLLYY....","...YYLLRRRRLLYY...","..YYLLRRRRRRLLYY..",".YYLLRRSSSSRRLLYY.","YYLLRRSSSSSSRRLLYY","YLLRRSSSKKSSSRRLLY","YLLRRSSSKKSSSRRLLY","YLLRRSSSKKSSSRRLLY","YYLLRRSSSSSSRRLLYY",".YYLLRRRRRRRRLLYY.","..YYLLLLLLLLLLYY..","...DDDDDDDDDDDD...","..DDDDDDDDDDDDDD.."]},
  cabin:{palette:{"R":"#a84d3b","O":"#d6784d","B":"#8a5838","L":"#c58b55","D":"#49372b","K":"#241f1a"},data:[".....RR.....","....ROOR....","...ROOOOR...","..ROOOOOOR..",".ROOOOOOOOR.","ROOOOOOOOOOR","BBBBBBBBBBBB","BLBBBBBBBBLB","BBBBBKKBBBBB","BBBBBKKBBBBB","BBBBBKKBBBBB","BBBBBKKBBBBB","BBBBBKKBBBBB","DDDDDDDDDDDD"]},
  deadTree:{palette:{B:'#3a2a1a',D:'#1a0a00'},data:[".B...B..B.","BBB.BBB.BB","..BBBBB.B.","...BBB....","...BBB....","...BBB....","...BBB....","...BBB....","...BBB....","...BBB....","...BBB....","..BBBBB..."]},
  snowman:{palette:{W:'#fff',B:'#1a1a1a',O:'#ff9800',R:'#e53935'},data:["..RRRR..",".RRRRRR.","..WWWW..",".WWWWWW.",".WBWWBW.",".WWWWWW.",".WWOOWW.","..WWWW..",".WWWWWW.","WWWWWWWW","WWWWWWWW",".WWWWWW."]},
  burningTree:{palette:{O:'#ff9800',Y:'#ffeb3b',R:'#e53935',K:'#1a1a1a'},data:["...OOO..OOO.","..OYOOYOOYO.","OOOOOOOOOOOO",".OOOYYOOOYO.","..OOORROOO..","...ORRRRO...","....OOOO....","....OOOO....","....KKKK....","....KKKK....","....KKKK....","..KKKKKKKK.."]},
  rpg_potion_red:{palette:{"K":"#3a0a0a","R":"#e53935","L":"#ff8a80","W":"#fff","G":"#8a8a90"},data:["...WW...","...WW...","..KRRK..",".KRLRRK.","KRRLLRRK","KRRRRRRK","KRRRRRRK",".KKKKKK."]},
  rpg_potion_blue:{palette:{"K":"#0a1a3a","B":"#42a5f5","L":"#90caf9","W":"#fff","G":"#8a8a90"},data:["...WW...","...WW...","...KBK...","...KBK...","..KBLBK.","..KBBBK.","..KBBBK.",".KKKKKK."]},
  rpg_potion_green:{palette:{"K":"#0a2a0a","G":"#4caf50","L":"#a5d6a7","W":"#fff","g":"#8a8a90"},data:["...WW...","...WW...","...KGK...","..KGLK..","..KGGK..",".KGGLGK.","KGGGGGGK","KKKKKKKK"]},
  rpg_potion_purple:{palette:{"K":"#1a0a2a","P":"#9c27b0","L":"#ce93d8","W":"#fff","G":"#8a8a90"},data:["...WW...","...WW...","..KPPK..","..KPLK..","KPPPPPPK","KPPLLPPK","KPPPPPPK","KKKKKKKK"]},
  rpg_potion_yellow:{palette:{"K":"#3a2a0a","Y":"#ffeb3b","L":"#fff59d","W":"#fff","G":"#8a8a90"},data:["...WW...","..KYLK..",".KYYYLK.","KYYYYYYK","KYYYYYYK",".KYYYYK.","..KYYK..","...KK..."]},
  rpg_potion_black:{palette:{"K":"#0a0a0a","P":"#4a148c","L":"#7e57c2","W":"#fff","G":"#8a8a90"},data:["..WWW...","..KKW...","..KPK...","...KPK..","...KLPK.",".KKKPPK.","KPPPPPK.","KKKKKKK."]},
  rpg_flask_empty:{palette:{"K":"#3a3a40","G":"#8a8a90","L":"#c0c0c8","W":"#fff"},data:["...WW...","...WW...","..KGGK..",".KG..GK.","KG....GK","KG....GK","KGGGGGGK",".KKKKKK."]},
  rpg_vial_small:{palette:{"K":"#3a0a0a","R":"#f44336","L":"#ff8a80","W":"#fff"},data:["..WW..","..KK..",".KRWK.","KRLRWK","KRRRRK",".KKKK."]},
  rpg_elixir:{palette:{"K":"#2a1a0a","G":"#ffd54f","L":"#fff59d","B":"#5a3a1a","W":"#fff"},data:["....WW....","....WW....","...KBBK...",".KBGBGBK..","KBGLLGBK..","KBGLLGBK..","KBGGGGBK..","KBBGGGBBK.",".KBBBBBBK.",".KKKKKKKK."]},
  rpg_bottle_water:{palette:{"K":"#0a2a4a","B":"#4fc3f7","L":"#b3e5fc","W":"#fff","G":"#8a8a90"},data:["...WW...","...WW...","..KGGK..","..KGKK..","KGLLLLGK","KGLBBLGK","KGBBBBGK",".KKKKKK."]},
  rpg_coin_gold:{palette:{"K":"#5a3a0a","G":"#ffd54f","L":"#fff59d","D":"#b8860b"},data:["..KKK..",".KGGGK.","KGGLLGK","KGLGGGK","KGGGGGK",".KGGGK.","..KKK.."]},
  rpg_coin_silver:{palette:{"K":"#3a3a44","S":"#e0e0e0","L":"#ffffff","D":"#808088"},data:["..KKKK..",".KSSSSK.","KSSLLSSK","KSSLLSSK","KSSSSSSK",".KSSSSK.","..KKKK.."]},
  rpg_coin_bronze:{palette:{"K":"#3a1a0a","B":"#cd7f32","L":"#e6a860","D":"#8a4a10"},data:["..KKK..",".KBBBK.","KBBKBBK","KBKKKBK","KBBKBBK",".KBBBK.","..KKK.."]},
  rpg_gem_red:{palette:{"K":"#3a0a0a","R":"#e53935","L":"#ff8a80","W":"#fff"},data:["...KK...","..KRRK..",".KRLLRK.","KRRLLRRK",".KRRRRK.","..KRRK..","...KK..."]},
  rpg_gem_blue:{palette:{"K":"#0a1a3a","B":"#42a5f5","L":"#bbdefb","W":"#fff"},data:["...KK...","..KBK...",".KBBLK..","KBBBBLK.","KBBBBBK.",".KBBBK..","..KKK..."]},
  rpg_gem_green:{palette:{"K":"#0a2a0a","E":"#4caf50","L":"#c8e6c9","W":"#fff","G":"#2e7d32"},data:["..KKKK..",".KEEGK.","KEELEEGK","KEEEEEGK",".KEEGK.","..KKKK.."]},
  rpg_gem_diamond:{palette:{"K":"#3a3a4a","D":"#b3e5fc","L":"#fff","C":"#4fc3f7"},data:["..KKKK..",".KCDDCK.","KCDLLDCK","KCDDDDCK",".KCDDCK.","..KKKK.."]},
  rpg_gem_emerald:{palette:{"K":"#0a3a1a","E":"#00c853","L":"#b9f6ca","W":"#fff"},data:["..KKKKK.",".KEL.EK.","KELLEE.K","KEELEE.K","KEEEE..K",".KKKKKK."]},
  rpg_gem_amethyst:{palette:{"K":"#2a0a3a","A":"#9c27b0","L":"#ce93d8","W":"#fff"},data:["...K....","..KAK...","..KALK.K",".KAAAKAK","KAAAALAK",".KAA.KK.","..KK...."]},
  rpg_gem_ruby:{palette:{"K":"#3a0a0a","R":"#c62828","L":"#ef9a9a","W":"#fff"},data:["KKKKKKK.","KRRRRRK.","KRLRRLRK","KRRRRRRK","KKKKKKK.","........"]},
  rpg_scroll:{palette:{"K":"#3a2a1a","P":"#d7c9a8","L":"#f5e6c8","D":"#8a7355"},data:["..KKK..","KPPPKK.","KPLPDK.","KPLPDK.","KPLPDK.","KPLPDK.",".KDDKK.","..KK..."]},
  rpg_book_red:{palette:{"K":"#1a0a0a","R":"#c62828","L":"#ef5350","W":"#f5f5dc","G":"#ffd54f"},data:["..KKKK..",".KRLRRK.","KRLRRRGK","KRLRWW.K","KRLRWW.K","KRLRRR.K",".KRRRRK.","..KKKK.."]},
  rpg_book_blue:{palette:{"K":"#0a1a3a","B":"#1976d2","L":"#42a5f5","W":"#f5f5dc","G":"#ffd54f"},data:["........","..KK.KK.","KBBWKBBW","KBW.KBW.","KBW.KBW.","KBBWKBBW","..KK.KK.","........"]},
  rpg_tome_magic:{palette:{"K":"#1a0a2a","P":"#6a1b9a","L":"#ab47bc","G":"#ffeb3b","W":"#f5f5dc"},data:["...KKK..","..KPPK..",".KPLPK..","KPPGPK.K","KPPLPK.K",".KPPPKK.","..KKK...","........"]},
  rpg_sword_iron:{palette:{"K":"#1a1a2a","S":"#b0b0b8","L":"#e0e0e8","H":"#5a3a1e","G":"#8a8a48"},data:["....K....","...KSK...","...KSLK..","...KSLK..","...KSLK..","...KSLK..","..KGGSK..",".KGHHGGK.","..KHHK...","...KK...."]},
  rpg_sword_gold:{palette:{"K":"#3a2a0a","G":"#ffd54f","L":"#fff59d","H":"#8a5a1a","C":"#c8961a"},data:[".....K...","....KGK..","...KGGLK.","...KGGLK.","...KGLK..","..KGGK...","..KCCK...","..CHHC...","..KHHK...","...KK...."]},
  rpg_sword_diamond:{palette:{"K":"#1a2a3a","D":"#4fc3f7","L":"#e1f5fe","H":"#5a3a1e","C":"#b3e5fc"},data:["....K....","...KDK...","..KDDDK..","..KDLDK..","..KDDDK..","..KDDDK..",".KCCCCK..","..CHHC...","..KHHK...","...KK...."]},
  rpg_dagger:{palette:{"K":"#1a1a2a","S":"#c0c0c8","L":"#f0f0f8","H":"#5a3a1e","G":"#8a8a48"},data:["...K...","..KSK..","..KSLK.","..KSLK.","..KSLK.","..KGSK.","..KHHK.","..KHK..","..KK..."]},
  rpg_axe:{palette:{"K":"#2a1a0a","S":"#c0c0c8","L":"#f0f0f8","H":"#5a3a1e"},data:["..KKK..","..KSLK.","..KSLK.","..KKKK.","..KKKK.","..KKKK.","..KKKK.","..KKKK.","..KKKK.","...KK.."]},
  rpg_battle_axe:{palette:{"K":"#2a1a0a","S":"#c0c0c8","L":"#f0f0f8","H":"#5a3a1e","G":"#8a8a48"},data:[".KKK.KKK.","KSSK.KSSK","KSLSK.KSK","KKKKKKKKK","..KSHHK..","..KHHHK..","..KHHHK..","..KHHHK..","...KKK..."]},
  rpg_bow:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","S":"#f5f5dc"},data:["..KKK....","..KBK....",".KBLLK...","KBLLLK...","KBLLLK...","KBLLLK...","KBLLLK...",".KBLLK...","..KBK....","..KKK....","..KSK...."]},
  rpg_crossbow:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","S":"#5a5a60","W":"#f5f5dc"},data:["..KKKKK.","KBLLLBK.","KBSSSBSK","KKKWKKK.","..KKK...","..K.K...","..K.K...","..KKK..."]},
  rpg_staff_wood:{palette:{"K":"#2a1a0a","B":"#5a3a1e","L":"#8a5a2e","W":"#fff","G":"#4fc3f7"},data:["....WW....","...WGKW...","..WGGLKW..","...WGKW...","....KK....","....KK....","....KK....","....KK....","....KK....","....KK....","....KK....","...KKKK..."]},
  rpg_staff_magic:{palette:{"K":"#1a0a2a","B":"#5a3a1e","G":"#ce93d8","L":"#f3e5f5","W":"#fff","P":"#9c27b0"},data:["...WGW....","..WGGGW...","..WGGLGW..","..WGPLGW..","..WGGGLKW.","...WPGGW..","...KKGK...","....KK....","....KK....","....KK....","....KK....","....KK....","...KKKK..."]},
  rpg_hammer:{palette:{"K":"#1a1a2a","S":"#8a8a90","L":"#d0d0d8","H":"#5a3a1e","B":"#3a3a44"},data:["..KKKKK..",".KSSLLSK.","KSLLLSBK.","KSSSBBK..","..KHHK...","..KHHK...","..KHHK...","..KHHK...","...KK...."]},
  rpg_wizard:{palette:{"K":"#1a0a2a","P":"#4a148c","L":"#ab47bc","D":"#ffeb3b","W":"#fce4ec"},data:["...KKKKK....","..KPPPPPK...","..KPLWLPK...","..KPPPPPK...","..KPPPPPK...","...KPPPK....","..KPPPPPK...","..KPPPPPK...","..KPPPPPK...","..KPPPPPK...","..KPPPPPK...","...K...K....","...K...K....","..KKK.KKK..."]},
  rpg_merchant:{palette:{"K":"#2e1503","P":"#5d4037","L":"#8d6e63","D":"#ffb300","W":"#fff3e0"},data:["...KKKKK....","..KPPPPPK...","..KPLWLPK...","..KPPPPPK...","..KPPPPPK...","...KPPPK....","..KPPPPPK...","..KPPPPPK...","..KPPPPPK...","..KPPPPPK...","..KPPPPPK...","...K...K....","...K...K....","..KKK.KKK..."]},
  rpg_blacksmith:{palette:{"K":"#111","P":"#424242","L":"#9e9e9e","D":"#bf360c","W":"#e0e0e0"},data:["...KKKKK....","..KPPPPPK...","..KPLWLPK...","..KPPPPPK...","..KPPPPPK...","...KPPPK....","..KPPPPPK...","..KPPPPPK...","..KPPPPPK...","..KPPPPPK...","..KPPPPPK...","...K...K....","...K...K....","..KKK.KKK..."]},
  rpg_spear:{palette:{"K":"#1a1a2a","S":"#c0c0c8","L":"#f0f0f8","H":"#5a3a1e"},data:["...K...","..KSK..","..KSK..","..KSLK.","..KSK..","..KHK..","..KHK..","..KHK..","..KHK..","..KHK..","..KHK..","..KKK.."]},
  rpg_shield_wood:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","G":"#5a5a60","D":"#3a2010"},data:[".KKKKKK.","KLLLLLLK","KLLDDLLK","KLLGGLLK","KLLDDLLK","KLLLLLLK",".KKKKKK.","........"]},
  rpg_shield_iron:{palette:{"K":"#1a1a2a","B":"#8a8a90","L":"#e0e0e8","G":"#c62828","D":"#5a5a60"},data:["KKKKKKKK","KLLLLLLK","KLLBBLLK","KLLGGLLK","KLLGGLLK","KLLBBLLK",".KLLLLK.","..KLLK..","...KK..."]},
  rpg_shield_gold:{palette:{"K":"#3a2a0a","B":"#ffd54f","L":"#fff59d","G":"#1976d2","D":"#b8860b"},data:["KKKKKKKK","KLLLLLLK","KLLGGLLK","KLLLLLLK","KLLGGLLK","KLLLLLLK","KLLLLLLK","KKKKKKKK"]},
  rpg_helmet_iron:{palette:{"K":"#1a1a2a","B":"#8a8a90","L":"#d0d0d8","D":"#5a5a60"},data:["..KKKKK..",".KLLBLLK.","KLLBBBLLK","KBLLBLLBK","KBBKKKBBK","KBB...BBK","KDD...DDK",".KK...KK."]},
  rpg_helmet_gold:{palette:{"K":"#3a2a0a","B":"#ffd54f","L":"#fff59d","G":"#e53935","D":"#b8860b"},data:["...GGG...",".KGLLGGK.","KLLBBGGLK","KBLLBLLBK","KBBKKKBBK","KBB...BBK","KDD...DDK",".KK...KK."]},
  rpg_mask:{palette:{"K":"#1a1a2a","W":"#f5f5f5","L":"#ffffff","B":"#64b5f6","D":"#90caf9"},data:["...KKKK...","..KWLLWK..","..KWLLWK..",".KBDWWDBK.",".KBDKKDBK.",".KWWKKWWK.",".KWWWWWWK.","..KWWWWK..","...KKKK..."]},
  rpg_helmet_horned:{palette:{"K":"#1a0a0a","B":"#5a5a60","L":"#8a8a90","H":"#f5f5dc","D":"#3a3a44"},data:["H.......H","HK.....KH",".KBBBBK..",".KBLLBK..","KBBBBBLLK","KBLLBBLBK",".KBBBBK..","..KKKK..."]},
  rpg_chest_iron:{palette:{"K":"#1a1a2a","B":"#8a8a90","L":"#d0d0d8","D":"#5a5a60"},data:["..KKKKK..",".KLLLLLK.","KLLBBLLK.","KLLBBLLK.","KLLBBLLK.","KLLLBBLLK","KLLBBLLLK",".KLLLLLK.","..KKKKK.."]},
  rpg_chest_gold:{palette:{"K":"#3a2a0a","B":"#ffd54f","L":"#fff59d","G":"#e53935","D":"#b8860b"},data:["..KKKKK..",".KLLLLLK.","KLLGGLLK.","KLLGGLLK.","KLLGGLLK.","KLLLGGLLK","KLLGGLLLK",".KLLLLLK.","..KKKKK.."]},
  rpg_boots_leather:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","D":"#3a2010"},data:["KK...KK..","KBL.KBLK.","KBL.KBLK.","KBL.KBLK.","KBL.KBLK.","KBLLKBLLK","KDDDKDDDK",".KKK.KKK."]},
  rpg_gloves:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","D":"#3a2010"},data:["KBB.KBB.","KBL.KBLK","KBLKBLBK","KBLLBBLK","KBLLLLBK","KDDDDDDK",".KKKKKK."]},
  rpg_oak_tree:{palette:{"K":"#0a1a0a","G":"#3a7a2a","L":"#5a9a3a","D":"#1a4a1a","B":"#5a3a1e"},data:["...KKKK.....","..KGGLLK....",".KGLLLLGK...","KGGLLLLGGK..","KGLLLLLLGK..",".KGGGGGGK...","..KGGGGK....","...KGGK.....","....BB......","....BB......","....BB......","....BB......","...BBBB.....","...DDDD....."]},
  rpg_pine_tree:{palette:{"K":"#0a1a0a","G":"#2a5a2a","L":"#3a7a3a","B":"#4a2a1a"},data:["....KK....","...KGLK...","..KGLLK...",".KGLLLK...","..KGLLK...",".KGLLGLK..","..KGLLK...",".KGLGLGK..","..KGLGK...",".KGGGGGK..","..KGGGK...","...KGLK...","....BB....","....BB...."]},
  rpg_birch_tree:{palette:{"K":"#1a1a0a","G":"#5a9a3a","L":"#a5d6a7","W":"#e0e0d0","B":"#f0f0d0"},data:["....KK....","...KGLK...","..KGGLK...",".KGLLLGK..","..KGGGK...",".KGLGLLK..","..KGGGK...","...KBBK...","...KWBK...","...KBBK...","...KWBK...","...KBBK...","...KBBK...","...KKKK..."]},
  rpg_dead_tree:{palette:{"K":"#1a0a00","B":"#3a2a1a","D":"#1a0a00"},data:["..B...B..",".BB.B.BB.","B..BBB..B","..BBBB...","..KBBK...","..KBBK...","..KBBK...","..KBBK...","..KBBK...","..KBBK...","..KBBK...","..KKKK..."]},
  rpg_palm_tree:{palette:{"K":"#0a1a0a","G":"#2a8a3a","L":"#5aaa4a","B":"#8a5a2e","D":"#5a3a1e"},data:["..GGGG.G..",".GGLGLGGG.",".GGGGGGGG.","..GGGGG...","....BB....","....BB....","....BB....","....BB....","....BB....","....BB....","....BB....","...KBBK...","...KBBK...","...KDDK..."]},
  rpg_cherry_tree:{palette:{"K":"#1a0a1a","P":"#e91e63","L":"#f8bbd0","B":"#5a3a1e","D":"#8a1a3a"},data:["..KKKKKK..",".KPLLPPK..","KPLLLPPLK.","KPPLPLLPPK","KPPLPLLPK.","KPPPPPPPKK",".KPPPPPK..","..KKKKK...","....BB....","....BB....","....BB....","...BBBB..."]},
  rpg_willow_tree:{palette:{"K":"#0a1a0a","G":"#3a7a3a","L":"#7ab87a","D":"#1a4a1a","B":"#4a2a1a"},data:["...KKKKKK...","..KGLLLLGK..",".KGLGGLLGK..","KGGLGLLGLGK.","KGGGLGLGGGK.","KGGLGGLGGLK.",".KGLGGLGGK..","..KGLGGGK...","...KBBK.....","...KBBK.....","...KBBK.....","...KBBK.....","...KDDK....."]},
  rpg_magic_tree:{palette:{"K":"#1a0a2a","P":"#9c27b0","L":"#ce93d8","G":"#ffeb3b","B":"#3a1a4a"},data:["...KKKKKK...","..KGPLLPGK..",".KPGLLGPLK..","KPGLGGLLGPK.","KPGLLGGLGPK.",".KPGLGLLPK..","..KGPLLGK...","...KGGK.....","....BB......","....BB......","....BB......","...BBBB....."]},
  rpg_snowy_pine:{palette:{"K":"#0a1a2a","G":"#2a5a5a","L":"#5a8a8a","W":"#f0f8ff","B":"#4a2a1a"},data:["....WW....","...WGGW...","..WGWGW...",".WGGWGGW..","..WGGW....",".WGGLGGW..","..WGGLW...",".WGGLGGW..","...WGGLW..","...KGGK...","....BB....","....BB....","....BB....","....KK...."]},
  rpg_cactus_tall:{palette:{"K":"#0a2a0a","G":"#4a8a3a","L":"#8acc6a","D":"#2a5a2a","Y":"#ffeb3b"},data:["..KGGK..",".KGLLGK.","..KGGK..","G.KGGK.G","GKGGGGKG","GGGGGGGG","GGGGGGGG","G.KGGK.G","..KGGK..","..KGGK..","..KGGK..","..KGGK..","..KGGK..","..KDDK.."]},
  rpg_bamboo:{palette:{"K":"#0a2a0a","G":"#5aa83a","L":"#a5d6a7","D":"#2a5a2a"},data:["KGK.","KLK.","KGK.","KLK.","KGK.","KLK.","KGK.","KLK.","KGK.","KLK.","KGK.","KLK.","KGK.","KKK."]},
  rpg_bush_flower:{palette:{"K":"#0a1a0a","G":"#3a7a2a","L":"#7ab87a","R":"#e53935","Y":"#ffeb3b"},data:["..KKKK..",".KGGLLGK","KGLLRLLG","KGLRGRLG","KGRYGLLG",".KGGLLGK","..KKKK.."]},
  rpg_grass_tuft:{palette:{"G":"#5a9a3a","D":"#3a6a2a"},data:["..G..G..",".GG..GG.","GGDGGDGG","GDGGGDGG",".D....D."]},
  rpg_flower_red:{palette:{"K":"#3a0a0a","R":"#e53935","L":"#ff8a80","Y":"#ffeb3b","G":"#3a6a2a"},data:["..KKK..",".KRLRK.","KRLRLRK","KRRRRRK",".KRYRK.","..KGK..","..KGK.."]},
  rpg_flower_blue:{palette:{"K":"#0a1a3a","B":"#42a5f5","L":"#90caf9","Y":"#ffeb3b","G":"#3a6a2a"},data:["..KKK..",".KBLBK.","KBLBLBK","KBBBBBK",".KBYBK.","..KGK..","..KGK.."]},
  rpg_flower_yellow:{palette:{"K":"#3a2a0a","Y":"#ffeb3b","L":"#fff59d","O":"#ff9800","G":"#3a6a2a"},data:["..KKK..",".KYLYK.","KYLYLYK","KYYYYYK",".KYOYK.","..KGK..","..KGK.."]},
  rpg_mushroom_red:{palette:{"K":"#1a0a0a","R":"#e53935","W":"#fff","S":"#f5f5dc","D":"#8a1a1a"},data:["..KKKK..",".KRWWRK.","KRWWRRWR","KRRRRRRK",".KKKKKK.","..KSSK..","..KSSK..","..KSSK.."]},
  rpg_mushroom_blue:{palette:{"K":"#0a0a2a","B":"#42a5f5","W":"#b3e5fc","S":"#e0e0e0","D":"#1565c0"},data:["..KKKK..",".KBWWBK.","KBWWBBWB","KBBBBBBK",".KKKKKK.","..KSSK..","..KSSK..","..KSSK.."]},
  rpg_mushroom_glow:{palette:{"K":"#1a0a2a","P":"#ce93d8","W":"#fff","L":"#f3e5f5","S":"#8a8a90"},data:["..KKKK..",".KPWWPK.","KPWWPPWP","KPPPPPPK",".KKKKKK.","..KLSK..","..KLSK..","..KLSK.."]},
  rpg_vine:{palette:{"K":"#0a2a0a","G":"#3a7a2a","L":"#7ab87a"},data:["KKGGKK","KGGLLK","KGGLLK","KGGLLK","KGGLLK","KGGLLK","KGGLLK","KGGLLK","KGGLLK","KGGLLK",".KKKK."]},
  rpg_rock_small:{palette:{"K":"#1a1a20","G":"#6a6a72","L":"#9a9aa2","D":"#3a3a44"},data:["..KGGLK.",".KGLLGGK","KGLGGGGK","KGGGGGGK",".KDDDDK.","..KKKK.."]},
  rpg_rock_large:{palette:{"K":"#1a1a20","G":"#6a6a72","L":"#9a9aa2","D":"#3a3a44"},data:["...KKKK...","..KGLLGK..",".KGLGGLLK.","KGLLGGGGK.","KGLGGGGDK.","KGGGGDDGK.","KGGDDGGGK.",".KDGGDDK..","..KKKKKK.."]},
  rpg_boulder:{palette:{"K":"#1a1a20","G":"#5a5a62","L":"#8a8a92","D":"#3a3a44"},data:["....KKKK....","..KGGLLGK...",".KGLLGGGLK..","KGLLGGGGGGK.","KGLGGGGGDGK.","KGGGGDDGGK..","KGGDDGGGK...",".KGGDGGK....","..KKKKKK...."]},
  rpg_ore_gold:{palette:{"K":"#1a1a20","G":"#6a6a72","D":"#3a3a44","Y":"#ffd54f","L":"#fff59d"},data:["..KGGLK.","KGLGYKLK","KGLYYGLK","KGLLYGK.",".KYGGLK.","..KDDK.."]},
  rpg_ore_iron:{palette:{"K":"#1a1a20","G":"#6a6a72","D":"#3a3a44","I":"#c0c0c8","L":"#f0f0f8"},data:["..KGGLK.","KGLGIKLK","KGLIIGLK","KGLLIGK.",".KIGGLK.","..KDDK.."]},
  rpg_ore_diamond:{palette:{"K":"#1a2a3a","G":"#5a5a62","D":"#3a3a44","C":"#4fc3f7","L":"#e1f5fe"},data:["..KGGLK.","KGLGCLKL","KGLCCGLK","KGLLCGK.",".KCGGLK.","..KDDK.."]},
  rpg_crystal_blue:{palette:{"K":"#0a1a3a","C":"#42a5f5","L":"#bbdefb","W":"#fff"},data:["..KK...","..KCK..","..KCLK.",".KCLLK.","KCLLCLK","KCLLCLK","KCLCLK.","KCCK...",".KK...."]},
  rpg_crystal_purple:{palette:{"K":"#1a0a3a","P":"#9c27b0","L":"#ce93d8","W":"#fff"},data:["..KK...","..KPK..","..KPLK.",".KPLLK.","KPLLPLK","KPLLPLK","KPLPLK.","KPPK...",".KK...."]},
  rpg_stalagmite:{palette:{"K":"#1a1a20","G":"#6a6a72","L":"#9a9aa2","D":"#3a3a44"},data:["..KGK...",".KGLLK..",".KGLLGK.","KGLGGGK.","KGGGGDGK","KGGDDDGK","KGGDDGGK","KKKKKKKK"]},
  rpg_geode:{palette:{"K":"#2a0a3a","P":"#9c27b0","L":"#ce93d8","G":"#6a6a72","W":"#fff"},data:["..KKKK..",".KGPPGK.","KGLLLPGK","KGPWLLGK","KGPLLLPK",".KGLLGK.","..KKKK.."]},
  rpg_cabin:{palette:{"R":"#8b4513","D":"#3e1e08","W":"#c87f3a","K":"#1a1a1a","B":"#5a3a1e","G":"#7fbf7f","L":"#4a2a10"},data:["......RRRR......","....RRRRRRRR....","..RRRRRRRRRRRR..","RRRRRRRRRRRRRRRR",".KKKKKKKKKKKKKK.","KWWWWWWWWWWWWWWK","KWKKWWWWWWKKWWWK","KWGGKWWWWKGGWWWK","KWGGKWWWWKGGWWWK","KWKKWWWWWWKKWWWK","KWWWWWWWWWWWWWWK","KWWWWKLLLLKWWWWK","KWWWWKLLLLKWWWWK","KWWWWKLLLLKWWWWK","KWWWWKKLLKKWWWWK","KDDDDKDDDDKDDDDK"]},
  rpg_tent:{palette:{"K":"#1a1a20","R":"#c62828","D":"#8a1a1a","L":"#ef5350","B":"#3a3a44"},data:["....KK......","...KRRLK....","..KRRLLRK...",".KRRLLLLRK..","KRRLLLLLLRK.","KRRDDLLLLRK.","KRRKKDLLLRK.","KRRKBBKLLRK.","KRKKBBKKKKK.","KKKKBBKKKKK."]},
  rpg_tower:{palette:{"K":"#1a1a20","G":"#8a8a80","L":"#b0b0a8","D":"#4a4a45","B":"#5a3a1e"},data:["..KK..","..KLGK",".KLLGK","KKLLGK","KLLLGK","KKLLGK","KLLLGK","KKLLGK","KLLLGK","KKLLGK","KLLLGK","KKLLGK","KLLLGK","KKKKKK"]},
  rpg_ruin_pillar:{palette:{"K":"#1a1a20","G":"#8a8a80","L":"#b0b0a8","D":"#4a4a45"},data:["KKKKK.","KLLGK.","KLLGK.","KLLGK.","KLLGK.","KLLGKK","KLLGLK","KLLGLK","KKKKKK",".KKK.."]},
  rpg_ruin_wall:{palette:{"K":"#1a1a20","G":"#8a8a80","L":"#b0b0a8","D":"#4a4a45"},data:["KK.KKKKK.KKK","KLKKLKKKLKKL","KLLKLLLKLLLK",".KKKKKKKKKK.","KKKKKKKKKKKK","KLLLKLLLKLLK","KLLLKLLLKLLK","KKKKKKKKKKKK","KKK.KKKK.KKK","KK..KKKK..KK"]},
  rpg_sign_post:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","D":"#5a3a1e","W":"#f5f5dc"},data:["KKKKKKKKK.","KWWWWWWWK.","KWWWWWWWK.","KKKKKKKKK.","..KBBK....","..KBBK....","..KBBK....","..KBBK....","..KBBK....","..KBBK....","..KDDK....","..KKKK...."]},
  rpg_lamp_post:{palette:{"K":"#1a1a20","B":"#3a3a44","L":"#5a5a60","Y":"#ffeb3b","W":"#fff59d"},data:["..KKK..",".KYLYK.","KYLWLK.","KYLWLK.","KYLLLK.",".KKYKK.",".KBBK..",".KBBK..",".KBBK..",".KBBK..",".KBBK..",".KBBK..",".KLLK..","..KK..."]},
  rpg_well:{palette:{"K":"#1a1a20","G":"#8a8a80","L":"#b0b0a8","D":"#4a4a45","B":"#5a3a1e","W":"#3a6ba5"},data:["...KKKK...","..KBBBBK..",".KKKKKKKK.","KGLLLLLGK.","KGWLLWLGK.","KGLWLWLGK.","KGLLLLLGK.","KGGGGGGGK.",".KDDDDDK..","..KKKK...."]},
  rpg_campfire:{palette:{"K":"#1a0a00","B":"#5a3a1e","D":"#3a2010","R":"#ff5722","Y":"#ffeb3b","O":"#ff9800"},data:["...K....","..KRK...",".KRYK...","KRYOKR..","KRYOOKR.","KKYYOKK.","KBBKBBK.",".KDKDBK.","..KKK..."]},
  rpg_chest_wood:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","D":"#3a2010","Y":"#ffd54f"},data:["..KKKKKK..",".KLLLLLK..","KLLBBLLK..","KLLLLLLK..","KBBKYYBBK.","KBLLKLLBK.","KBLLKLLBK.","KDDDDDDDK.","..KKKKKK.."]},
  rpg_tent_blue:{palette:{"K":"#000","B":"#1976d2","L":"#42a5f5","D":"#0d47a1"},data:["....KK......","...KBBLK....","..KBBLLBK...",".KBBLLLLBK..","KBBLLLLLLBK.","KBBKKLLLBK..","KBBKKLLLBK..","KBKKKKLLBK..","KKKKKKKKKK.."]},
  rpg_cabin_mossy:{palette:{"R":"#8b4513","D":"#3e1e08","W":"#c87f3a","K":"#1a1a1a","G":"#4a7a3a","L":"#4a2a10"},data:["......RRRR......","..GG..GGGG..GG..","..GGGGGGGGGGGG..","RRRRRRRRRRRRRRRR",".KKKKKKKKKKKKKK.","KWGGWWWWWWGGWWWK","KWGGWWWWWWGGWWWK","KWWKKWWWWKKWWWWK","KWKKWWWWWWKKWWWK","KWWWWWWWWWWWWWWK","KWWWWKLLLLKWWWWK","KWWWWKLLLLKWWWWK","KWWWWKLLLLKWWWWK","KWWWWKLLLLKWWWWK","KWWWWKKLLKKWWWWK","KDDDDKDDDDKDDDDK"]},
  rpg_barrel:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","D":"#3a2010","Y":"#8a8a48"},data:["KKKKKK..","KYLLYK..","KBBBBK..","KYLLYK..","KBBBBK..","KYLLYK..","KBBBBK..","KDDDDK..","KKKKKK.."]},
  rpg_crate:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","D":"#3a2010"},data:["KKKKKKKK","KLLLLLLK","KLBBBBLK","KBLBBLBK","KBLBBLBK","KBLBBLBK","KLBBBBLK","KKKKKKKK"]},
  rpg_fence:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040"},data:["KBK.KBK.KBK.","KLK.KLK.KLK.","KKKKKKKKKKKK","KLK.KLK.KLK.","KBK.KBK.KBK.","KLK.KLK.KLK.","KKKKKKKKKKKK","KLK.KLK.KLK."]},
  rpg_ladder:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040"},data:["KB.KB","KL.KL","KKKKK","KB.KB","KL.KL","KKKKK","KB.KB","KL.KL","KKKKK","KB.KB","KL.KL","KKKKK","KB.KB","KL.KL"]},
  rpg_anvil:{palette:{"K":"#1a1a20","G":"#5a5a62","L":"#8a8a92","D":"#3a3a44"},data:["KKKKKKKKK.",".KGGGGGGK.","KGGLLLLGGK","KKGGGGGGKK",".KKGGGGKK.","..KGGGK...","..KGGGK...","..KKKKK..."]},
  rpg_workbench:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","D":"#3a2010","G":"#5a5a62"},data:["KKKKKKKKKK.","KLLLLLLLLK.","KGGGGGGGGK.","KKKKKKKKKK.","KB.KB..KB..","KB.KB..KB..","KL.KL..KL..","KK.KK..KK.."]},
  rpg_torch:{palette:{"K":"#2a1a0a","B":"#8b4513","L":"#c87040","Y":"#ffeb3b","O":"#ff9800","R":"#ff5722"},data:["..K..",".KYK.","KOYRK","KOYOK",".KKK.","..K..","..B..","..B..","..B..","..B..","....."]},
  rpg_bed:{palette:{"K":"#1a1a20","B":"#8b4513","L":"#c87040","R":"#c62828","W":"#f5f5dc","D":"#3a2010"},data:["KKKKKKKKKKK.","KRRWRRWRRWK.","KRRWRRWRRWK.","KBBBBBBBBBK.","KLLLLLLLLLK.","KKKKKKKKKKK.","KL.......LK.","KK.......KK."]},
  rpg_cauldron:{palette:{"K":"#1a1a20","G":"#3a3a44","L":"#5a5a60","P":"#9c27b0","W":"#ce93d8"},data:["..K.K.K..",".KKKKKKK.","KPWLWLPPK","KPWLWLWPK","KPPPPPPPK","KGGGGGGGK","KGG...GGK",".KK...KK."]},
  rpg_door:{palette:{"K":"#1a0a00","B":"#8b4513","L":"#c87040","D":"#3a2010","Y":"#ffd54f"},data:["KKKKKK.","KLLBLK.","KLLBLK.","KLLBLK.","KLLBLK.","KLLYBK.","KLLBLK.","KLLBLK.","KLLBLK.","KLLBLK.","KDDDDK.","KKKKKK."]},
  rpg_window:{palette:{"K":"#1a1a20","B":"#8b4513","L":"#c87040","C":"#4fc3f7","W":"#e1f5fe"},data:["KKKKKKKK","KLLLLLLK","KLCCCLLK","KLCCCCLK","KLCCCCLK","KLLCCLLK","KLLLLLLK","KKKKKKKK"]},
  rpg_mailbox:{palette:{"K":"#1a1a20","R":"#c62828","L":"#ef5350","B":"#5a3a1e","W":"#f5f5dc"},data:["KKKKK.","KRRRK.","KRWLK.","KRRRK.","KKKKK.","..BK..","..BK..","..BK..","...K..","..KK.."]},
  rpg_slime_green:{palette:{"K":"#0a2a0a","G":"#5a9a3a","L":"#a5d6a7","W":"#fff","D":"#3a6a2a"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slime_blue:{palette:{"K":"#0a0a2a","B":"#3b82f6","L":"#90caf9","W":"#fff","D":"#1e3a8a"},data:["..KKKK..",".KBLLBK.","KBLLLLBK","KBLWWLBK","KBLWWLBK","KBBBBBBK",".KBBBBK.","..KDDK.."]},
  rpg_bat_small:{palette:{"K":"#1a0a2a","B":"#4a148c","W":"#ff1744","D":"#311b92"},data:["K........K","KK......KK","KBB.BB..BK","KBBBBBBBBK","KBBWBWBBBK",".KBBBBBBK.","..KBBBBK..","....KK...."]},
  rpg_spider:{palette:{"K":"#0a0a0a","B":"#1a1a1a","R":"#e53935","L":"#5a5a5a"},data:["K..KK..K","KK.KK.KK","KKKKKKKK",".KBLLBK.",".KBRRBK.","K.KKKK.K","K.KKKK.K",".K....K."]},
  rpg_snake:{palette:{"K":"#1a0a00","B":"#4a8a3a","L":"#8acc6a","D":"#2a5a2a","Y":"#ffeb3b"},data:["....KKK....",".KKKL.LK...","K.L.L.L.K..","K.LB.L.LK..","K.LB.L.LKK.","KLBB.L.LBK.","KLBK.KLBLK.",".KK...KKKK."]},
  rpg_crab:{palette:{"K":"#3a0a0a","R":"#e53935","L":"#ff8a80","W":"#fff","D":"#8a1a1a"},data:["K.KKKKK.K","KKRWLWRKK","KRRRRRRRK","KRDRRDRRK",".KKKKKKK.","KK.K.K.KK","KK.K.K.KK"]},
  rpg_scorpion:{palette:{"K":"#1a0a0a","B":"#5a3a1a","L":"#8a5a2e","Y":"#ffeb3b","D":"#3a2010"},data:["......KK.",".....KLYK",".KKK.KLBK","KKBBKBBK.","KBBBBBBKK","KBK.KBB.K","KK...KK.."]},
  rpg_worm:{palette:{"K":"#3a0a0a","B":"#e5a0a0","L":"#ffb8b8","D":"#8a1a1a","W":"#fff"},data:["KK..","KWK.","KBK.","KBK.","KLK.","KBLK","KBLK","KBDK",".KK."]},
  rpg_snail:{palette:{"K":"#1a0a00","B":"#8a5a2e","L":"#c87a3a","D":"#5a3a1a","W":"#f5f5dc"},data:["...KKK..","..KBLBK.","KKBLLBK.","KBBLBLBK","KBBBBBBK","KKKKKWKK",".K.K.K.K"]},
  rpg_beetle:{palette:{"K":"#0a0a0a","B":"#1a2a3a","L":"#3a5a7a","W":"#fff","D":"#0a0a1a"},data:["..KKKK..",".KBLLBK.","KBLWWLBK","KBLWWLBK","KBBBBBBK",".KKKKKK.","K.K..K.K"]},
  rpg_fairy:{palette:{"K":"#1a0a2a","P":"#e1bee7","W":"#fff","Y":"#ffeb3b","L":"#f3e5f5"},data:["...KK...","Y..KK..Y","YYKPPKYY",".KPWLK..","YYKPPKYY","Y..KK..Y","...KK..."]},
  campFox:{palette:{"K":"#43200f","O":"#e97828","C":"#ffe0a3","W":"#fff7df"},data:["..K....K..",".KOK..KOK.","KOOOKKOOOK","KOOOCCOOOK",".KOOOCCOK.","..KKKKKK..",".K..K..K.."]},
  rpg_wisp:{palette:{"K":"#0a0a2a","B":"#4fc3f7","L":"#b3e5fc","W":"#fff"},data:["..KKK...",".KBLBK..","KBLWLBK.","KLWWWLBK","KLWWWLBK","KBLWLBK.",".KBLBK..","..KKK..."]},
  rpg_goblin:{palette:{"K":"#0a2a0a","G":"#5a9a3a","L":"#a5d6a7","R":"#e53935","B":"#3a1a00"},data:["..KKKK..",".KGLLGK.","KGKGGKGK","KGRGGRGK","KGGGGGGK",".KGGGGK.","KBBBBBBK","KBB..BBK"]},
  rpg_skeleton_small:{palette:{"K":"#0a0a0a","W":"#e0e0e0","D":"#9e9e9e"},data:["..KKKK..",".KWWWWK.","KWKWWKWK","KWWWWWWK",".KKWWKK.",".KWKWKWK",".KKKKKK."]},
  rpg_imp:{palette:{"K":"#2a0a0a","R":"#c62828","L":"#ef5350","Y":"#ffeb3b","W":"#fff"},data:["K......K","KK....KK","KRRRRRRK","KRWYWRKK","KRRRRRK.",".KRRRK..",".KK.KK.."]},
  rpg_fish_small:{palette:{"K":"#0a1a3a","B":"#3b82f6","L":"#90caf9","W":"#fff","D":"#1e3a8a"},data:["..KKKK..",".KBLLBK.","KBWLWLBK","KBLLBLBK",".KBBBBK.",".KK.DK.."]},
  rpg_apple:{palette:{"K":"#3a0a0a","R":"#e53935","L":"#ff8a80","G":"#3a6a2a","W":"#fff"},data:["..KWK...",".KKWK...","KRRRKK..","KRLLRRK.","KRLWRRK.","KRRRRRK.","KRRRRK..",".KKKK..."]},
  rpg_bread:{palette:{"K":"#3a1a00","B":"#d4a860","L":"#f5d090","D":"#8a5a1a"},data:["..KKKK..",".KBBBBK.","KBLLLBBK","KBLLLLBK","KBBBBBBK",".KKKKKK."]},
  rpg_cheese:{palette:{"K":"#3a2a00","Y":"#ffd54f","L":"#fff59d","O":"#ff9800"},data:["..KKKK..",".KYLLYK.","KYLLYKKK","KYYOYYKK","KYYYYYYK",".KKKKKK."]},
  rpg_meat:{palette:{"K":"#3a0a0a","R":"#e57373","L":"#ffab91","W":"#f5f5dc","D":"#8a1a1a"},data:["..KKK...",".KRLRK..","KRLWLRK.","KRLWLRK.","KRLLRRK.","KRRRRRK.",".KKKKK.."]},
  rpg_fish_food:{palette:{"K":"#0a1a3a","B":"#5aa8e0","L":"#b3e5fc","W":"#fff","Y":"#ffeb3b"},data:["..KKK...",".KBLLK..","KBWLWLBK","KBLLBLBK",".KBBBBK.",".KKKKK.."]},
  rpg_carrot:{palette:{"K":"#0a1a00","O":"#ff9800","L":"#ffb74d","G":"#4caf50"},data:["..GG..",".GGGG.","..GG..",".KOOO.","KOOLO.","KOOOO.",".KOOOK","..KKK."]},
  rpg_berry_red:{palette:{"K":"#1a0000","R":"#e53935","L":"#ff8a80","G":"#3a6a2a"},data:["..G.....","G.G.....",".KRRK...","KRLLRK..","KRRRRK..","KRRRRK..",".KKKKK.."]},
  rpg_berry_blue:{palette:{"K":"#00001a","B":"#3b82f6","L":"#90caf9","G":"#3a6a2a"},data:["..G.....","G.G.....",".KBBK...","KBLLBK..","KBBBBK..","KBBBBK..",".KKKKK.."]},
  rpg_egg:{palette:{"K":"#3a2a1a","W":"#f5f5dc","L":"#ffffff","Y":"#ffeb3b"},data:["..KKK...",".KWWLK..","KWWLLWK.","KWLLLWWK","KWWLLLWK",".KWWWWK.","..KKKK.."]},
  rpg_mushroom_food:{palette:{"K":"#1a0a0a","R":"#e53935","W":"#fff","S":"#f5f5dc"},data:["..KKKK..",".KRWWRK.","KRWWRRWR","KRRRRRRK",".KKKKKK.","..KSSK..","..KSSK..","..KKKK.."]},
  rpg_honey:{palette:{"K":"#3a1a00","Y":"#ffd54f","L":"#fff59d","O":"#ff9800","B":"#8a5a1a"},data:["..KKK..","..KKK..",".KBBBK.","KBBYBBK","KBYYYYK","KBYYOYK",".KKKKK."]},
  rpg_cake:{palette:{"K":"#3a0a1a","P":"#f8bbd0","L":"#fff","W":"#fff","R":"#e53935","Y":"#ffeb3b"},data:["...Y....",".K.R.K..",".KKKKK..","KPLLLPK.","KPPPPP.K","KKKKKKK."]},
  rpg_crown:{palette:{"K":"#3a2a00","G":"#ffd54f","L":"#fff59d","R":"#e53935","B":"#1976d2"},data:["K..K..K.","KK.KK.KK","KGKGKGGK","KGLLLGGK","KGGRBGKG","KGGGGGGK","KKKKKKKK"]},
  rpg_dragon_red:{palette:{"K":"#1a0000","R":"#c62828","L":"#ef5350","Y":"#ffeb3b","W":"#fff","D":"#7f0000"},data:["..K..........K..",".KRK........KRK.","KRRLK......KRRLK","KRRRLK....KRRRLK","KRRRRK..KKRRRRK.","KRRRRRKKRRRRRK..",".KRRRYRRYRRRK...","..KRRWRRWRRK....","...KRRRRRRK.....","...KRDRRDRK.....","..KKKKKKKKKK....","...K..KK..K....."]},
  rpg_dragon_blue:{palette:{"K":"#000a1a","B":"#1976d2","L":"#42a5f5","Y":"#ffeb3b","W":"#fff","D":"#0d47a1"},data:["..K..........K..",".KBK........KBK.","KB.LK......KB.LK","KB.LK......KB.LK","KBBBLK....KBBBLK","KBBBBK..KKBBBBK.","KBBBBBKKBBBBBK..",".KBBBYBBYBBBK...","..KBBWBBWBBK....","...KBBBBBBK.....","...KBDBBDBK.....","..KKKKKKKKKK....","...K..KK..K....."]},
  rpg_demon_skull:{palette:{"K":"#0a0a0a","B":"#1a1a1a","R":"#c62828","W":"#fff","Y":"#ffeb3b"},data:["..KKKKKK..",".KBBBBBBK.","KBBBBBBBBK","KBKRBBKRBK","KBKRBBKRBK","KBBBBBBBBK","KBBKWKWBBK","KBBYYYYBBK",".KBBBBBBK.","..KKKKKK.."]},
  rpg_angel_wing:{palette:{"K":"#3a3a2a","W":"#f5f5dc","L":"#ffffff","Y":"#ffeb3b"},data:["K...........","WK..........","WWK.........","WWWK........","WWWWK.......","WLWWWK......","WWLWWWK.....","WWWLWWWK....","WWWWLWWWK...","WWWWWWWWWK..",".KWWWWWWWK..","..KKKKKKKK.."]},
  rpg_demon_wing:{palette:{"K":"#0a0a0a","B":"#1a0a1a","R":"#7f0000","Y":"#ffeb3b","D":"#4a0000"},data:["K...........","BK..........","BBK.........","DBBK........","DDBBK.......","DDDBBK......","DRDBBK......","DDRDBBK.....","DDDRDBBK....","DDDDRDBBK...","DDDDRDDBBK..",".KKKKKKKKKK."]},
  rpg_portal:{palette:{"K":"#1a0a3a","P":"#9c27b0","L":"#ce93d8","W":"#fff","Y":"#ffeb3b"},data:["..KKKK..",".KPPLPK.","KPLWWLPK","KPLWWLPK","KPLLLLPK",".KPPPPK.","..KKKK.."]},
  rpg_throne:{palette:{"K":"#1a0a00","B":"#8b4513","L":"#c87040","R":"#c62828","Y":"#ffd54f","D":"#3a2010"},data:["..KRRRRK..",".KRYYRYK..","KRRRRRRRK.","KBKBBKBK..","KBLBBLK...","KBLBBLK...","KBBKKBBK..","KLL.KLLK..","KBB.KBBK..","KDD.KDDK..","KKK..KKK.."]},
  rpg_slimeGreen:{palette:{"K":"#0a2a0a","G":"#5a9a3a","L":"#a5d6a7","W":"#fff","D":"#3a6a2a"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slimeBlue:{palette:{"K":"#0a0a2a","G":"#3b82f6","L":"#90caf9","W":"#fff","D":"#1e3a8a"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slimeRed:{palette:{"K":"#2a0a0a","G":"#e53935","L":"#ff8a80","W":"#fff","D":"#8a1a1a"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slimePurple:{palette:{"K":"#1a0a2a","G":"#9c27b0","L":"#ce93d8","W":"#fff","D":"#6a1b9a"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slimeGold:{palette:{"K":"#3a2a0a","G":"#ffd54f","L":"#fff59d","W":"#fff","D":"#b8860b"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slimeIce:{palette:{"K":"#0a1a2a","G":"#8ac6e8","L":"#e0f0ff","W":"#fff","D":"#5a96c8"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slimeLava:{palette:{"K":"#1a0a00","G":"#ff5722","L":"#ffb74d","W":"#ffeb3b","D":"#bf360c"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slimeToxic:{palette:{"K":"#0a2a1a","G":"#7cb342","L":"#c5e1a5","W":"#ffeb3b","D":"#33691e"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slimeMetal:{palette:{"K":"#1a1a20","G":"#8a8a90","L":"#d0d0d8","W":"#fff","D":"#5a5a62"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_slimeGhost:{palette:{"K":"#1a1a2a","G":"#a0c4e8","L":"#e0f0ff","W":"#fff","D":"#6a8ac8"},data:["..KKKK..",".KGLLGK.","KGLLLLGK","KGLWWLGK","KGLWWLGK","KGGGGGGK",".KGGGGK.","..KDDK.."]},
  rpg_batBrown:{palette:{"K":"#1a0a0a","B":"#8b4513","W":"#ff1744","D":"#5a2a0a"},data:["K..........K","KK........KK","KBB..BB..BBK","KBBBBBBBBBK.","KBBWBWBWBBK.",".KBBBBBBK...","..KBBBBK....","....KK......"]},
  rpg_batVampire:{palette:{"K":"#1a0a0a","B":"#c62828","W":"#fff","D":"#7a0000"},data:["K..........K","KK........KK","KBB..BB..BBK","KBBBBBBBBBK.","KBBWBWBWBBK.",".KBBBBBBK...","..KBBBBK....","....KK......"]},
  rpg_batGhost:{palette:{"K":"#1a1a2a","B":"#a0c4e8","W":"#fff","D":"#6a8ac8"},data:["K..........K","KK........KK","KBB..BB..BBK","KBBBBBBBBBK.","KBBWBWBWBBK.",".KBBBBBBK...","..KBBBBK....","....KK......"]},
  rpg_batFire:{palette:{"K":"#1a0a00","B":"#ff5722","W":"#ffeb3b","D":"#bf360c"},data:["K..........K","KK........KK","KBB..BB..BBK","KBBBBBBBBBK.","KBBWBWBWBBK.",".KBBBBBBK...","..KBBBBK....","....KK......"]},
  rpg_batIce:{palette:{"K":"#0a1a2a","B":"#8ac6e8","W":"#fff","D":"#5a96c8"},data:["K..........K","KK........KK","KBB..BB..BBK","KBBBBBBBBBK.","KBBWBWBWBBK.",".KBBBBBBK...","..KBBBBK....","....KK......"]},
  rpg_batGiant:{palette:{"K":"#1a0a0a","B":"#4a148c","W":"#ff1744","D":"#2a0a5a"},data:["K............K","KK..........KK","KBB..BB..BBBK.","KBBBBBBBBBBBK.","KBBWBBBBWBBK..",".KBBBBBBBBK...","..KBBBBBBK....","...KKKKKK....."]},
  rpg_crow:{palette:{"K":"#0a0a0a","B":"#1a1a1a","W":"#ffeb3b","D":"#000"},data:["...KKK....","..KBBWK...","..KBBBBK..","KKBBBBBBK.",".KBBBBBBK.","..KBBBBK..","..KK..KK..",".........."]},
  rpg_raven:{palette:{"K":"#0a0a1a","B":"#2a1a3a","W":"#ff1744","D":"#1a0a2a"},data:["...KKK....","..KBBWK...","..KBBBBK..","KKBBBBBBK.",".KBBBBBBK.","..KBBBBK..","..KK..KK..",".........."]},
  rpg_mothGiant:{palette:{"K":"#3a2a0a","B":"#e0c060","W":"#8a1a1a","D":"#a08030"},data:["..KK....KK..",".KBBK..KBBK.","KBBBBKKBBBBK","KBBWWBBWWBBK",".KBBBBBBBBK.","..KBBBBBBK..","...KBBBBK...","....KKKK...."]},
  rpg_wasp:{palette:{"K":"#1a1a00","B":"#ffd54f","D":"#1a1a1a","W":"#fff"},data:["K....K...","KK..KK...","KBDDBDK..","KBDDDDK..","KDDDDKKK.",".KDDDK...","..KKK....","..K.K...."]},
  rpg_zombieGreen:{palette:{"K":"#1a1a1a","Z":"#7cb342","D":"#33691e","W":"#c62828","B":"#4a2a0a"},data:["....KKKK....","...KZZZZK...","..KZZZZZZK..","..KZWZZWZK..","..KZZZZZZK..","..KZKKKKZK..","...KZZZZK...","..KZZZZZZK..",".KZZZZZZZZK.","KZZZZZZZZZZK","KZZZZZZZZZZK",".KZZZZZZZZK.","..KZBK..KZBK","..KKK...KKK."]},
  rpg_zombieRotting:{palette:{"K":"#0a0a0a","Z":"#5a8a3a","D":"#2a4a1a","W":"#e53935","B":"#3a1a0a"},data:["....KKKK....","...KZZZZK...","..KZZDZZZK..","..KZWZZWZK..","..KZZZDZZK..","..KZDDDDZK..","...KZZZZK...","..KZDZZZK...",".KZZDZZZZK..","KZZZZZZDZZK.","KZDZZZZZZZK.",".KZZZZZZZK..","..KZBK..KZK.","..KKK...KKK."]},
  rpg_skeletonArcher:{palette:{"K":"#1a1a1a","W":"#e0e0e0","D":"#9e9e9e","B":"#8b4513"},data:["....KKKK....","...KWWWWK...","..KWWWWWWK..","..KWKWWKWK..","..KWWWWWWK..","...KWWWWK...","....KKKK....","..KWWWWWWK..",".KWWWWWWWWK.","KWKWWWWWWKWK","KWDW....WDWK","..KWWWWWWK..","...KWK..KWK.","...KKK..KKK."]},
  rpg_skeletonWarrior:{palette:{"K":"#1a1a1a","W":"#e0e0e0","D":"#9e9e9e","S":"#c0c0c8"},data:["....KKKK....","...KWWWWK...","..KWWWWWWK..","..KWKWWKWK..","..KWWWWWWK..","...KWWWWK...","...KWSSWK...","..KWWWWWWK..",".KWKWWWWKWK.","KWSW....WSWK","KWKW....KWKW","..KWWWWWWK..","...KWK..KWK.","...KKK..KKK."]},
  rpg_wraith:{palette:{"K":"#0a0a1a","C":"#5a6a9a","L":"#a0b0d0","W":"#ff1744"},data:["...KKKKKK...","..KCCCCCCK..",".KCCCCCCCCK.",".KCWCCCCWCK.",".KCCCCCCCCK.",".KCCCCCCCCK.",".KCCCCCCCCK.",".KCCCCCCCCK.",".KCCCCCCCCK.",".KCCCCCCCCK.",".LCCCCCCCCL.","..KCC.KKCCK.",".KC..C..KC..","..C..C..C..."]},
  rpg_lich:{palette:{"K":"#0a0a1a","W":"#e0e0e0","P":"#6a1b9a","Y":"#ffeb3b","B":"#3a1a5a"},data:["...KKKKKK...","..KWKWWKWK..","..KWWWWWWK..","..KWKWWKWK..","..KWWWWWWK..","...KWWWWK...","...KYWWYK...","..KPPPPPPK..",".KPPPPPPPPK.","KPPYKKKKYPPK","KPKK....KKPK",".KPPPPPPPPK.","..KPPK.KPPK.","..KKK..KKK.."]},
  rpg_reaper:{palette:{"K":"#0a0a0a","D":"#2a2a3a","S":"#c0c0c8","W":"#ff1744"},data:["....KKKK....","...KDDDDK...","..KDDDDDDK..","..KDWDDWDK..","..KDDDDDDK..","...KDDDDK...","..KDDDDDDK..",".KDDDDDDDDK.","KDDDDDDDDDDK","KDDDDDDDDDDK",".KDDDDDDDDK.","..KDD..DDK..","..KDK..KDK..","..KKK..KKK.."]},
  rpg_boneKnight:{palette:{"K":"#1a1a1a","W":"#e0e0e0","S":"#5a5a62","D":"#9e9e9e","Y":"#ffeb3b"},data:["....KKKK....","...KSSSSK...","..KSWSSWSK..","..KSKSSKSK..","..KSSSSSSK..","...KSSSSK...","..KSSYYSSK..",".KWWWWWWWWK.","KWSWWWWWSWK.","KWWWWWWWWWK.",".KWWWWWWWWK.","..KWW..WWK..","..KWK..KWK..","..KKK..KKK.."]},
  rpg_banshee:{palette:{"K":"#0a0a2a","C":"#a0d0e0","L":"#e0f5ff","W":"#1a1a1a"},data:["...KKKKKK....","..KCCCCCCK...",".KCCCCCCCCK..",".KCWCCCCWCK..",".KCCCCCCCCK..",".KCCWWWWCCK..",".KCCCCCCCCK..",".KCCCCCCCCK..",".LCCCCCCCCL..","..KCCCCCCK...","...KCCCCK....","...KC..CK....","...C....C....","............."]},
  rpg_zombieKing:{palette:{"K":"#1a1a1a","Z":"#7cb342","D":"#33691e","W":"#c62828","Y":"#ffd54f","P":"#6a1b9a","B":"#6a452c"},data:["...Y.Y..Y...","...KYYKKYYK.","..KYKYYKYYK.","...KZZZZZK..","..KZWZZWZK..","..KZZZZZZK..","..KZKKKKZK..","...KZZZZK...","..KPZZZZPK..",".KZZZZZZZZK.","KZZZZZZZZZZK","KZZZZZZZZZZK",".KZZZZZZZZK.","..KZB..ZBK..","..KKK..KKK.."]},
  rpg_banditRed:{palette:{"K":"#1a1a1a","B":"#8b6b3a","D":"#3a2a1a","R":"#c62828","W":"#ffeb3b"},data:["....KKKK....","...KDDDDK...","..KDDDDDDK..","..KDBBBBDK..","..KDBWBBWDK.","..KDDBBBDK..","...KRRRRK...","..KBBBBBBK..",".KBBBBBBBBK.",".KBBBBBBBBK.","..KBBBBBBK..","..KBK..KBK..","..KBK..KBK..","..KKK..KKK.."]},
  rpg_knight:{palette:{"K":"#1a1a1a","S":"#a0a0a8","L":"#e0e0e8","B":"#5a5a62","R":"#c62828"},data:["....KKKK....","...KSSSSK...","..KSLSSLSK..","..KSSSSSSK..","..KSBSSBSK..","..KSSSSSSK..","...KSSSSK...","..KRRRRRRK..",".KLSSSSSSLK.","KSLSSSSSSLK.","KSSSSSSSSSK.",".KSSSSSSSK..","..KSK..KSK..","..KKK..KKK.."]},
  rpg_knightDark:{palette:{"K":"#0a0a0a","S":"#3a3a44","L":"#5a5a68","B":"#2a2a34","R":"#8a0000"},data:["....KKKK....","...KSSSSK...","..KSLSSLSK..","..KSSSSSSK..","..KSBSSBSK..","..KSSSSSSK..","...KSSSSK...","..KRRRRRRK..",".KLSSSSSSLK.","KSLSSSSSSLK.","KSSSSSSSSSK.",".KSSSSSSSK..","..KSK..KSK..","..KKK..KKK.."]},
  rpg_mage:{palette:{"K":"#1a0a2a","R":"#3b82f6","D":"#1e3a8a","Y":"#ffeb3b","W":"#f5f5dc"},data:["...KKKKK....","..KRRRRK....","..KRWWRK....","..KRYYRK....","..KRRRRK....","...KRRK.....","..KDDDDK....",".KDDDDDDK...","KDDWDDWDDK..","KDDDDDDDDK..","KDDDDDDDDK..",".KDDDDDDK...","..KDD.DDK...","..KKK.KKK..."]},
  rpg_mageRed:{palette:{"K":"#2a0a0a","R":"#e53935","D":"#8a1a1a","Y":"#ffeb3b","W":"#f5f5dc"},data:["...KKKKK....","..KRRRRK....","..KRWWRK....","..KRYYRK....","..KRRRRK....","...KRRK.....","..KDDDDK....",".KDDDDDDK...","KDDWDDWDDK..","KDDDDDDDDK..","KDDDDDDDDK..",".KDDDDDDK...","..KDD.DDK...","..KKK.KKK..."]},
  rpg_archer:{palette:{"K":"#1a0a0a","G":"#4a7a2a","B":"#8b4513","D":"#5a3a1e","W":"#f5f5dc"},data:["...KKKKK....","..KGGGGK....","..KGWGWK....","..KGGGGK....","..KGGGGK....","...KGGK.....","..KDDDDK....",".KDDDDDDK...","KDDDDDDDK...","KDDDDDDDK...","KDDDDDDDK...",".KDDDDDDK...","..KDD.DDK...","..KKK.KKK..."]},
  rpg_berserker:{palette:{"K":"#1a0a0a","S":"#e0a080","R":"#c62828","B":"#5a3a1e","W":"#f5f5dc"},data:["....KKKK....","...KSSSSK...","..KSWSSWSK..","..KSSSSSSK..","..KSSKKSSK..","...KSSSSK...","..KRRRRRRK..",".KSSRRRRSSK.","KSSRRRRRRSSK","KSSRRRRRRSSK",".KSRRRRRRSK.","..KRR..RRK..","..KBBK.KBBK.","..KKK..KKK.."]},
  rpg_priest:{palette:{"K":"#1a1a20","W":"#f5f5dc","Y":"#ffd54f","D":"#8a8a80","C":"#a0c4e8"},data:["....KKKK....","...KWWWWK...","..KWWWWWWK..","..KWWKKWWK..","..KWWWWWWK..","...KWWWWK...","..KWWYYWWK..",".KWWWWWWWWK.","KWWCWWWWCWK.",".KWWWWWWWWK.","..KWWWWWWK..","..KWWWWWWK..","..KWW.KWWK..","..KKK..KKK.."]},
  rpg_rogue:{palette:{"K":"#0a0a0a","D":"#2a2a3a","B":"#5a5a6a","W":"#ffeb3b","R":"#c62828"},data:["...KKKKK....","..KDDDDDK...","..KDWDDWDK..","..KDDDDDDK..","...KDDDDK...","..KDDDDDDK..",".KDBDDDBDK..","KDBDDDDDDBK.","KDDDDDDDDK..","KDBDDDDDBK..",".KDDDDDDDK..","..KDD..DDK..","..KDK..KDK..","..KKK..KKK.."]},
  rpg_paladin:{palette:{"K":"#1a1a20","S":"#c0c0c8","L":"#f0f0f8","W":"#ffd54f","B":"#8a8a48"},data:["....KKKK....","...KSSSSK...","..KSLSSLSK..","..KSWWWWSK..","..KSWWWWSK..","...KSSSSK...","...KWWWWK...","..KLSSSSLK..",".KSWSSSSWSK.","KSWWSSSSWWSK","KSSWWSSWWSSK",".KSSSSSSSSK.","..KSSK.KSSK.","..KKK..KKK.."]},
  rpg_wolfGray:{palette:{"K":"#1a1a1a","W":"#9e9e9e","L":"#e0e0e0","Y":"#ff1744"},data:["..KK......KK..",".KWWK....KWWK.","KWWWWWWWWWWWWK","KWWKKWWWWKKWWK","KWWYWWWWWWYWWK","KWWWWKKKKWWWWK",".KWWWWWWWWWWK.","..KWWWWWWWWK..","..KW..WW..WK..","..KK..KK..KK.."]},
  rpg_wolfBlack:{palette:{"K":"#000","W":"#2a2a2a","L":"#5a5a5a","Y":"#ff1744"},data:["..KK......KK..",".KWWK....KWWK.","KWWWWWWWWWWWWK","KWWKKWWWWKKWWK","KWWYWWWWWWYWWK","KWWWWKKKKWWWWK",".KWWWWWWWWWWK.","..KWWWWWWWWK..","..KW..WW..WK..","..KK..KK..KK.."]},
  rpg_wolfWhite:{palette:{"K":"#1a1a20","W":"#f0f0f0","L":"#fff","Y":"#1976d2"},data:["..KK......KK..",".KWWK....KWWK.","KWWWWWWWWWWWWK","KWWKKWWWWKKWWK","KWWYWWWWWWYWWK","KWWWWKKKKWWWWK",".KWWWWWWWWWWK.","..KWWWWWWWWK..","..KW..WW..WK..","..KK..KK..KK.."]},
  rpg_wolfFire:{palette:{"K":"#1a0a00","W":"#ff5722","L":"#ffb74d","Y":"#ffeb3b"},data:["..KK......KK..",".KWWK....KWWK.","KWWWWWWWWWWWWK","KWWKKWWWWKKWWK","KWWYWWWWWWYWWK","KWWWWKKKKWWWWK",".KWWWWWWWWWWK.","..KWWWWWWWWK..","..KW..WW..WK..","..KK..KK..KK.."]},
  rpg_bear:{palette:{"K":"#1a0a00","B":"#6d3a1e","L":"#8a5a2e","W":"#f5f5dc","D":"#3a1a0a"},data:["..KKK....KKK..",".KBLLK..KBLLK.","KBLLLLLLLLLLBK","KBLLWLLLLWLLBK","KBLLLLLLLLLLBK","KBBLLLLLLLLBBK",".KBLLLLLLLLBK.","..KBLLLLLLBK..","..KBK....KBK..","..KKK....KKK.."]},
  rpg_boar:{palette:{"K":"#1a0a00","B":"#4a2a1a","L":"#6a4a2a","W":"#f5f5dc","D":"#2a1a0a","T":"#e0e0e0"},data:["..KKKKKKKK..",".KBLLLLLBK..","KBLLWLLLBLK.","KBLLLLLLLLK.","KBLLLLLLLBK.","KBBLLLLLLBK.","TKBLLLLLBKT.","..KBLLLLBK..",".T.KB..BK.T.","...KKK.KKK.."]},
  rpg_lion:{palette:{"K":"#3a2a0a","M":"#d4a04a","L":"#f5d080","W":"#f5f5dc","D":"#8a6a2a","B":"#6a452c"},data:["..KKK.KKK...",".KMLMKKLMK..","KMLWWLLLWLMK","KMLLLLLLLLMK","KMLLLLLLLLMK",".KMLLLLLLMK.","..KBLLLLBK..","..KBLLLLBK..","..KBK..KBK..","..KKK..KKK.."]},
  rpg_tiger:{palette:{"K":"#1a0a00","O":"#e08020","W":"#f5f5dc","D":"#1a1a1a","Y":"#ffeb3b","L":"#d8d4cf","B":"#6a452c"},data:["..KKK.KKK...",".KOLOKKOLK..","KOLWWLLLWLOK","KODLOOOLDOK.","KOLLOOOOLLOK",".KOOLOOLLOK.","..KOBLLLBOK.","..KBLLLLLBK.","..KBK..KBK..","..KKK..KKK.."]},
  rpg_panther:{palette:{"K":"#000","P":"#1a1a2a","L":"#3a3a4a","Y":"#ffeb3b"},data:["..KKK.KKK...",".KPLPKKLPK..","KPLYYLLLPLK.","KPLLLLLLLLK.","KPLLLLLLLLK.",".KPLLLLLLPK.","..KPLLLLLPK.","..KPLLLLLPK.","..KPK..KPK..","..KKK..KKK.."]},
  rpg_direWolf:{palette:{"K":"#1a0a1a","W":"#3a2a3a","L":"#6a4a6a","Y":"#ff1744","D":"#1a0a1a"},data:["..KK........KK..",".KWWK......KWWK.","KWWWWWWWWWWWWWWK","KWWKKWWWWWWKKWWK","KWWYWWWWWWWWYWWK","KWWWWWKKKKWWWWWK",".KWWWWWWWWWWWWK.","..KWWWWWWWWWWK..","..KWW..WW..WWK..","..KKK..KK..KKK.."]},
  rpg_spiderBlack:{palette:{"K":"#0a0a0a","B":"#1a1a1a","R":"#e53935","L":"#3a3a3a"},data:["K..KKKK..K","KK.KBBK.KK","KKKKBBKKKK",".KBLLLLBK.",".KBRRRRBK.","K.KBBBBK.K","K.KB..BK.K",".K.K..K.K."]},
  rpg_spiderRed:{palette:{"K":"#0a0a0a","B":"#8a1a1a","R":"#ffeb3b","L":"#c62828"},data:["K..KKKK..K","KK.KBBK.KK","KKKKBBKKKK",".KBLLLLBK.",".KBRRRRBK.","K.KBBBBK.K","K.KB..BK.K",".K.K..K.K."]},
  rpg_scorpionBrown:{palette:{"K":"#1a0a00","B":"#6a3a1a","L":"#8a5a2e","Y":"#ffeb3b"},data:["......KK..",".....KYBK.","KKKK.KLBK.","KBBKKBBK..","KBBBBBBKK.","KBK.KBB.K.","KK...KK..."]},
  rpg_beetleGiant:{palette:{"K":"#0a0a0a","B":"#1a2a3a","L":"#3a5a7a","W":"#fff"},data:["..KKKKKK..",".KBLLLLBK.","KBLLWWLLBK","KBLLWWLLBK","KBBLLLLBBK",".KKKKKKKK.","K.K....K.K","..K....K.."]},
  rpg_beetleFire:{palette:{"K":"#1a0a00","B":"#e53935","L":"#ff8a80","W":"#ffeb3b"},data:["..KKKKKK..",".KBLLLLBK.","KBLLWWLLBK","KBLLWWLLBK","KBBLLLLBBK",".KKKKKKKK.","K.K....K.K","..K....K.."]},
  rpg_antSoldier:{palette:{"K":"#1a0a00","B":"#8a3a1a","L":"#c66a2a","W":"#fff"},data:["..KKK...","..KBK...","KBBBBK..","KBBLBK..","KBBBBK..",".KBBK...","..KKK...","..K.K..."]},
  rpg_antQueen:{palette:{"K":"#1a0a00","B":"#8a3a1a","L":"#c66a2a","Y":"#ffd54f"},data:["..KKKK....","..KBYK....","KBBBBBK...","KBBLBBK...","KBBBBBK...","KBBBBKKK..",".KBBK..KK.","..KKK...K."]},
  rpg_mantis:{palette:{"K":"#0a2a0a","G":"#5a9a3a","L":"#a5d6a7","W":"#fff"},data:["...KKK...","..KGLGK..","..KGWGK..",".KGLLGK..","KGLLGLK..",".KGGGK...","..KGK....","..K.K...."]},
  rpg_centipede:{palette:{"K":"#1a0a00","B":"#8a5a1a","L":"#c68a3a","Y":"#ffeb3b"},data:["...KK....","..KYK....",".KBLBK...","KBLBK....",".KBLBK...","..KBLBK..","...KBLK..","....KKK.."]},
  rpg_wormGiant:{palette:{"K":"#1a0a00","B":"#e0a0a0","L":"#ffb8b8","W":"#fff"},data:["...KK....","..KWK....","..KBK....",".KBLBK...","KBLBK....",".KBLK....","..KKK....","..K.K...."]},
  rpg_fishSmall:{palette:{"K":"#0a1a3a","B":"#3b82f6","L":"#90caf9","W":"#fff","D":"#1e3a8a"},data:["..KKKK..",".KBLLBK.","KBWLWLBK","KBLLBLBK",".KBBBBK.",".KK.DK.."]},
  rpg_fishLarge:{palette:{"K":"#0a1a3a","B":"#1976d2","L":"#64b5f6","W":"#fff","D":"#0d47a1"},data:["..KKKKKK...",".KBLLLBBK..","KBWLWLLLLBK","KBLLLLLLBBK","KBLLWLLLLBK",".KBBLLLBBK.","..KBBBBK...","..KK.DK...."]},
  rpg_piranha:{palette:{"K":"#1a0000","B":"#c62828","L":"#ef5350","W":"#fff","T":"#f5f5dc","D":"#5b574d"},data:["..KKKK..",".KBLLBK.","KBWWWWBK","KBTTTTBK","KBTTTTBK",".KBBBBK.","..K..DK."]},
  rpg_shark:{palette:{"K":"#0a1a3a","B":"#5a7a9a","L":"#a0c0d0","W":"#fff","D":"#2a3a4a"},data:["..KKKKKKK..",".KBLLLLBBK.","KBWWBBBBBBK","KBBBBBBBBKK","KBBBBBBBBK.","KBBBBBBBBK.",".KBBBBBBK..","..KK..KKK.."]},
  rpg_crabRed:{palette:{"K":"#2a0000","B":"#e53935","L":"#ff8a80","W":"#fff","D":"#8a1a1a"},data:["K.KKKKK.K","KKBWLWBKK","KBBBBBBBK","KBDBBDBBK",".KKKKKKK.","KK.K.K.KK","K..K.K..K"]},
  rpg_jellyfish:{palette:{"K":"#0a0a2a","C":"#a0d0e0","L":"#e0f5ff","W":"#fff"},data:["..KKKK..",".KCCLCK.","KCLLLLCK","KCLLLLCK","KCLLLLCK",".KCCCCK.","K.C.C.C.","..C.C.C."]},
  rpg_octopus:{palette:{"K":"#1a0a1a","P":"#9c27b0","L":"#ce93d8","W":"#fff"},data:["..KKKK..",".KPLLPK.","KPLLWWLK","KPLLWWLK","KPLLLLPK",".KPPPPK.","K.K.K.K.","K.K.K.K."]},
  rpg_eel:{palette:{"K":"#0a2a1a","G":"#3a8a4a","L":"#7aba8a","Y":"#ffeb3b"},data:["...KK....",".KGLGK...","KGLYYLGK.","KGLLGGGK.",".KGGGGLK.",".KGGGGK..","..KGGK...","...KK...."]},
  rpg_seahorse:{palette:{"K":"#2a1a0a","O":"#ffa726","L":"#ffcc80","W":"#fff"},data:["..KKK...",".KOLOK..","KOWLLK..","KOLLOK..",".KLOK...","..KOK...","..KOK...",".KOLK...",".KKK...."]},
  rpg_turtle:{palette:{"K":"#0a2a0a","G":"#4a7a3a","L":"#7aaa5a","B":"#5a3a1e","W":"#fff"},data:["..KKKKKK..",".KGGLLGGK.","KGGLGGGLGK","KGGLGGLLGK","KGLLGGGLGK",".KGGGGGGK.","..KK..KK..","..KK..KK.."]},
  rpg_fireSprite:{palette:{"K":"#1a0a00","F":"#ff5722","L":"#ffeb3b","W":"#fff"},data:["...KKKK...","..KFLLFK..",".KFLWWLFK.","KFLWWWWLFK","KFLLLLLLFK",".KFFFFFFK.","..KFFLFFK.","..KK..KK.."]},
  rpg_iceSprite:{palette:{"K":"#0a1a2a","I":"#8ac6e8","L":"#e0f0ff","W":"#fff"},data:["...KKKK...","..KILLIK..",".KILWWLIK.","KILWWWWLIK","KILLLLLLIK",".KIIIIIIK.","..KIILIIK.","..KK..KK.."]},
  rpg_earthGolem:{palette:{"K":"#1a0a00","E":"#6a4a3a","L":"#a08070","W":"#ffeb3b","D":"#3a2a1a"},data:["..KKKKKK..",".KELLLEK..","KELEWLELEK","KELLLELLEK",".KEEEEEEK.","KEEEEELEEK","KEEELLEEEK",".KEE..EEK.","..KK..KK.."]},
  rpg_airSprite:{palette:{"K":"#1a2a3a","A":"#a0d0e0","L":"#e0f5ff","W":"#fff"},data:["...KKKK...","..KALLAK..",".KALWWLAK.","KALWWWWLAK","KALLLLLLAK",".KAAAAAAK.","..KAA..AK.","...K....K."]},
  rpg_waterSprite:{palette:{"K":"#0a1a3a","W":"#4fc3f7","L":"#b3e5fc","H":"#fff"},data:["...KKKK...","..KWLLWK..",".KWLHHWLK.","KWLHHHWWLK","KWLLLLLLWK",".KWWWWWWK.","..KW.WWK..","..KK.KK..."]},
  rpg_lightningSprite:{palette:{"K":"#3a2a0a","Y":"#ffeb3b","L":"#fff59d","W":"#fff"},data:["...KKKK...","..KYLLYK..",".KYLWWLYK.","KYLWWWWLYK","KYLLLLLLYK",".KYYYYYYK.","..KY.LYK..","..KK.KK..."]},
  rpg_shadowDemon:{palette:{"K":"#000","S":"#1a1a2a","L":"#3a3a5a","Y":"#ff1744"},data:["...KKKK...","..KSLLSK..",".KSLYYLSK.","KSLYYYYLSK","KSLLLLLLSK",".KSSSSSSK.","..KSS.SSK.","..KK..KK.."]},
  rpg_lightSpirit:{palette:{"K":"#3a2a0a","L":"#fff59d","W":"#fff","Y":"#ffeb3b"},data:["...KKKK...","..KLLLWK..",".KLLWWWLK.","KLLWWWWLLK","KLLWWWWLLK",".KLLLLLLK.","..KLLLLK..","..KK..KK.."]},
  rpg_natureSpirit:{palette:{"K":"#0a2a0a","N":"#4a8a3a","L":"#8acc6a","Y":"#ffeb3b"},data:["...KKKK...","..KNLLNK..",".KNLYYLNK.","KNLLYYLLNK","KNLLLLLLNK",".KNNNNNNK.","..KNNLNNK.","..KK..KK.."]},
  rpg_voidSpirit:{palette:{"K":"#000","V":"#2a0a4a","L":"#6a2a8a","Y":"#e1bee7"},data:["...KKKK...","..KVLLVK..",".KVLYYLVK.","KVLYYYYLVK","KVLLLLLLVK",".KVVVVVVK.","..KVV.VVK.","..KK..KK.."]},
  rpg_impSmall:{palette:{"K":"#1a0a00","R":"#c62828","L":"#ef5350","Y":"#ffeb3b","W":"#fff"},data:["K......K","KK....KK","KRRLRRRK","KRWYWRKK","KRRRRRK.",".KRRRK..",".KK.KK..","........"]},
  rpg_demonWinged:{palette:{"K":"#0a0a0a","D":"#2a2a3a","R":"#8a0000","W":"#fff","Y":"#ffeb3b"},data:["R.........R","RR.......RR","RDR.....RDR","RDRDDDRDR..",".RDRRRRDR..","..RDRRRDR..","...KRDRK...","...KK.KK..."]},
  rpg_demonRed:{palette:{"K":"#1a0000","R":"#c62828","L":"#ef5350","W":"#fff","Y":"#ffeb3b"},data:["K........K","KR......RK","KRR.KK.RRK","KRRRRRRRRK","KRWYRRYWKR","KRRRRRRRRK",".KRRRRRRK.","..KRRRRK..","..KK..KK.."]},
  rpg_succubus:{palette:{"K":"#1a0a1a","P":"#9c27b0","L":"#ce93d8","R":"#c62828","Y":"#ffeb3b","W":"#fff"},data:["...KKKKK....","..KPLLPK....","..KPWLPK....","..KPRRPK....","...KPPK.....","..KPPPK.....","..KKKKK.KK..","..KPKKPK....","..KPK.KPK...","..KK...KK..."]},
  rpg_angel:{palette:{"K":"#3a2a0a","W":"#f5f5dc","L":"#fff","Y":"#ffd54f","B":"#a0c4e8"},data:["W.....W.","WW...WW.","WWWWWWWK","WWLYYLWK","WWLYYLWK","WWWWWWWK",".KWWWWK.","..KWWK..","..KKKK..","........"]},
  rpg_seraph:{palette:{"K":"#3a2a0a","W":"#fff","L":"#fff59d","Y":"#ffeb3b","B":"#a0c4e8"},data:["W...W...W","WW..W..WW","WWWWWWWWW","WWLYYLWWW","WWLYYLWWW","WWWWWWWWW",".KWWWWWK.","..KWWWK..","..KKKK...","........."]},
  rpg_archangel:{palette:{"K":"#3a2a0a","G":"#ffd54f","L":"#fff59d","W":"#fff","B":"#1976d2"},data:["W.....W.","WW...WW.","WWGGGGWK","WGGLLGGK","WGGLLGGK","WWGGGGWK",".KGGGGK.","..KGGK..","..KKKK..","........"]},
  rpg_fallenAngel:{palette:{"K":"#1a0a1a","D":"#3a2a3a","W":"#8a8a90","R":"#8a0000","Y":"#ff1744"},data:["W.....W.","WW...WW.","WWDDDDWK","WDRRYDWK","WDRRYDWK","WWDDDDWK",".KDDDDK.","..KDDK..","..KKKK..","........"]},
  rpg_devil:{palette:{"K":"#1a0000","R":"#8a0000","L":"#c62828","W":"#fff","Y":"#ffeb3b"},data:["K.......K","KK.....KK","KRRK.KRK.","KRRLRRRK.","KRWYLWRK.","KRRRRRRK.",".KRRRRK..","..KRRK...","..KK.KK.."]},
  rpg_cherub:{palette:{"K":"#3a2a0a","W":"#f5f5dc","L":"#fff","P":"#ff8a80"},data:["W.....W","WW...WW","WWPPPWW","WPLLLPW","WWWWWWW",".KWWWK.",".KWPWK.","..KKK.."]},
  rpg_dragonRed:{palette:{"K":"#1a0000","R":"#c62828","L":"#ef5350","Y":"#ffeb3b","W":"#fff","D":"#7f0000"},data:["..K..........K..",".KRK........KRK.","KRRLK......KRRLK","KRRRLK....KRRRLK","KRRRRK..KKRRRRK.","KRRRRRKKRRRRRK..",".KRRRYRRYRRRK...","..KRRWRRWRRK....","...KRRRRRRK.....","...KRDRRDRK.....","..KKKKKKKKKK....","...K..KK..K....."]},
  rpg_dragonBlue:{palette:{"K":"#000a1a","B":"#1976d2","L":"#42a5f5","Y":"#ffeb3b","W":"#fff","D":"#0d47a1"},data:["..K..........K..",".KBK........KBK.","KBLLK......KBLLK","KBBBLK....KBBBLK","KBBBBK..KKBBBBK.","KBBBBBKKBBBBBK..",".KBBBYBBYBBBK...","..KBBWBBWBBK....","...KBBBBBBK.....","...KBDBBDBK.....","..KKKKKKKKKK....","...K..KK..K....."]},
  rpg_dragonBlack:{palette:{"K":"#000","B":"#1a1a2a","L":"#3a3a5a","Y":"#ff1744","W":"#fff","D":"#000","R":"#c62828"},data:["..K..........K..",".KBK........KBK.","KBLLK......KBLLK","KBBBLK....KBBBLK","KBBBBK..KKBBBBK.","KBBBBBKKBBBBBK..",".KBBBYBBYBBBK...","..KBBRBBRBBK....","...KBBBBBBK.....","...KBDBBDBK.....","..KKKKKKKKKK....","...K..KK..K....."]},
  rpg_dragonGold:{palette:{"K":"#3a2a0a","G":"#ffd54f","L":"#fff59d","Y":"#fff","R":"#b8860b","D":"#8a6a2a","W":"#fff"},data:["..K..........K..",".KGK........KGK.","KGLLK......KGLLK","KGGGLK....KGGGLK","KGGGGK..KKGGGGK.","KGGGGGKKGGGGGK..",".KGGGYGGYGGGK...","..KGGWGGWGGK....","...KGGGGGGK.....","...KGDRRDRK.....","..KKKKKKKKKK....","...K..KK..K....."]},
  rpg_demonLord:{palette:{"K":"#000","D":"#2a0a0a","R":"#c62828","Y":"#ffeb3b","W":"#fff","P":"#6a1b9a"},data:["K...KKKK...K","KK.KRRRRK.KK","KKRKRRRRKRKK","KKRRYRRYRRKK","KKRRRRRRRRKK",".KRRWWWWRRK.","..KRRRRRRK..","..KRRKKRRK..","..KRR..RRK..","..KKK..KKK.."]},
  rpg_lichKing:{palette:{"K":"#0a0a1a","W":"#e0e0e0","P":"#6a1b9a","Y":"#ffeb3b","D":"#3a1a5a"},data:["...Y..Y....","...YYYY....","...KWWK....","..KWKKWK...","..KWWWWK...","..KWKKWK...","...KWWK....","..KPPPPK...",".KPWWWWPK..","KPWKKKKWPK.","KPKK..KKPK.",".KPPPPPPK..","..KPPKPPK..","..KKK.KKK.."]},
  rpg_stoneTitan:{palette:{"K":"#1a1a20","S":"#5a5a62","L":"#8a8a92","W":"#ffeb3b","D":"#3a3a44"},data:["..KKKKKK..",".KSLLLSK..","KSLLWLLSK.","KSLLWLLSK.","KSLLLLLSK.","KSLLSLLSK.",".KSSSSSSK.","KSSSLLSSSK","KSSLLLLSSK",".KSS..SSK.","..KK..KK..","..KK..KK.."]},
  rpg_hydra:{palette:{"K":"#0a2a0a","G":"#4a8a3a","L":"#8acc6a","Y":"#ffeb3b","W":"#fff"},data:["K..KKKK..K","KGKGGGGKGK","KGGGGGGGGK","KGYGGGYGGK","KGGGGGGGGK",".KGGGGGGK.","..KGGGGK..","..KGGGGK..","..KGGGGK..","..KGGGGK..","..KK..KK..","..KK..KK.."]},
  rpg_kraken:{palette:{"K":"#1a0a2a","P":"#5a1a8a","L":"#9c4ac8","Y":"#ff1744","W":"#fff"},data:["..KKKKKK..",".KPLLLLPK.","KPLLYYLLPK","KPLWWWWLPK","KPLLLLLLPK",".KPPPPPPK.","K.P.KK.P.K","K.P.KK.P.K","K.P.KK.P.K","..K..K..K."]},
  rpg_phoenix:{palette:{"K":"#1a0a00","R":"#ff5722","O":"#ffa726","Y":"#ffeb3b","W":"#fff"},data:["...YYYY...","..YYYYYY..",".YYYWWYYY.","YYYWWWWYYY","YYYWWWWYYY","YYRRRRRRYY",".RRROORRR.",".RRR..RRR.","..R....R..","..K....K.."]},
    comp_aldric:{palette:{"K":"#1a1a20","A":"#b0bec5","G":"#ffb300","B":"#1e88e5","S":"#ffccbc"},data:["....KKKK....","...KSSSSK...","..KSKSSKSK..","...KSSSSK...",".KKKAAAAKK..","KGAKAAAAKGK.","KGAKAAAAKGGK","KGAKABBAABAK","KGAKAABAAAAK","KGAKABBAABAK","KKKKAAAAAAK.","...KAAAAAAK.","...KAK..KAK.","...KKK..KKK."]},
  comp_kael:{palette:{"K":"#111111","D":"#37474f","B":"#283593","Y":"#fdd835"},data:["..............","......KKK.....",".....KDDDK....","...KKKDDDK....","..KDDDYYDK....","..KDDDDKKK....",".KBDDDDBK.....","KBDDDDDBK.....","KBBDBBDBK.....",".KDDDDDK......","..K.K.K.......","..K.K.K......."]},
  comp_fenrir:{palette:{"K":"#1a1a20","W":"#ffffff","G":"#9e9e9e","B":"#42a5f5"},data:["..............","....K....K....","...KWK..KWK...","...KWWKKWWK...","...KWBWBWWK...","..KWWWWWWWWK..",".KWWGWWGWWWK..","KWWWWWWWWGWWK.","KGWGWWGWWGWGK.",".KWWWWWWWWWK..","..K.K...K.K...","..KKK...KKK..."]},
  comp_selene:{palette:{"K":"#311b92","P":"#e040fb","L":"#ea80fc","W":"#ffffff"},data:[".....KK.....","...KKLWKK...","..KLPWWLPK..","..KLWWWWLK..","..KLPWWLPK..","...KKLWKK...","KPK.KLPK.KPK","KLPKKLPKKLPK",".KLPKLWKPLLK","..KLKPPKLLK.","...KK..KKK..","............"]},
  comp_morvath:{palette:{"K":"#1a1a20","W":"#e0e0e0","R":"#b71c1c","G":"#64dd17"},data:["....KKKK....","...KWWWWK...","..KWGWGWK...","..KWWWWWWK..","...KRRRRK...","..KRRRRRRK..",".KWRRRRRRWK.","KWWKRRRRKWWK","KW.KRRRRK.WK","K..KRRRRK..K","...KRRRRK...","...KRRRRK...","...KRRRRK...","...KKKKKK..."]},
  comp_ashe:{palette:{"K":"#212121","R":"#e65100","O":"#ff9800","Y":"#ffeb3b","W":"#ffffff"},data:[".....KK.....","...KKRRYK...","..KRROOYK...",".KRRRROYYK..","KROKWROOYK..","KROOOOYYYK..",".KRRRROYYK..","..KRRROOYK..","..KROOYYYK..","...KR..RYK..","...KK..KK...","............"]},
  rpg_hourglass:{palette:{"K":"#30251d","G":"#ffd54f","L":"#fff59d","B":"#42a5f5"},data:["KKKKKKKK","KLLLLLLK",".KGGGGK.","..KKBK..","..KBKK..",".KGGGGK.","KLLLLLLK","KKKKKKKK"]},
  rpg_backpack:{palette:{K:'#241f1a',B:'#8b4513',L:'#c87040',G:'#ffd54f'},data:["..KKKK..",".KBBBBK.","KBLBBLBK","KBBBBBBK","KBBGGBBK","KBBBBBBK",".KBBBBK.","..KKKK.."]},
  player1_copy:{palette:{"R":"#c62828","F":"#ffcc80","W":"#1a1a1a","S":"#5d4037","B":"#1a1a1a"},data:["....RRRR....","...RRRRRR...","..RRRRRRRR..","..FFFFFFFF..","..FFFFFFFF..","..FFFFFFFF..","..FFFFFFFF..","...FFFFFF...","....RRRR....","..RRRRRRRR..",".RRRRRRRRRR.",".RRBBBBBBRR.",".RRBBBBBBRR.","...BBBBBB...","...BB..BB...","..BBB..BBB.."]},
  player2_copy:{palette:{"R":"#c62828","F":"#ffcc80","W":"#1a1a1a","S":"#5d4037","B":"#1a1a1a"},data:["....RRRR....","...RRRRRR...","..RRRRRRRR..","..FFFFFFFF..","..FFFFFFFF..","..FFFFFFFF..","..FFFFFFFF..","...FFFFFF...","....RRRR....","..RRRRRRRR..",".RRRRRRRRRR.",".RRBBBBBBRR.",".RRBBBBBBRR.","...BBBBBB...","..BB....BB..",".BBB....BBB."]}
};
// ═══════════════════════════════════════════════════════════
// UNDERGROUND PACK — Append (δεν σβήνει τίποτα)
// ═══════════════════════════════════════════════════════════
(function(){
  const PACK=[
/* VOL.1 */
{name:'caveWall',palette:{a:'#2a2438',b:'#453d55',c:'#655c78'},data:['abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaabbcaaaabbca','aaaaabbcaaaabbca','aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaabbcaaaabbca','aaaaabbcaaaabbca','aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaa']},
{name:'caveWallCrack',palette:{a:'#2a2438',b:'#453d55',c:'#655c78',x:'#0a0810'},data:['abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaxaaaaaaaa','aaaaaaxxaaaabbca','aaaaabbcaaaabbca','aaaaaaaxaaaaaaaa','abbaaaaaxbaaaaab','abbaaaaaaxaaaaab','aaaaaaaaaxaaaaaa','aaaaabbcaaxaabca','aaaaabbcaaaabbca','aaaaaaaaaxaaaaaa','abbaaaaabxaaaaab','abbaaaaabbaaaaxb','aaaaaaaaaaaaaaxa','aaaaaaaaaaaaaaaa']},
{name:'caveFloor',palette:{i:'#3d2a1c',j:'#5c4430'},data:['iiiiiiiiiiiiiiii','ijiiiiiiijiiiiii','iiiiiiiiiiiiiiii','iiiiijiiiiiiiiii','iiiiiiiiiiiiiiii','iiiiiiiiiiiijiii','iiijiiiiiiiiiiii','iiiiiiiiiiiiiiii','iiiiiiiiijiiiiii','iiiiiiiiiiiiiiii','ijiiiiiiiiiiiiii','iiiiiiiiiiiiiiji','iiiiijiiiiiiiiii','iiiiiiiiiiiiiiii','iiiiiiiiijiiiiii','iiiiiiiiiiiiiiii']},
{name:'caveFloorPebbles',palette:{i:'#3d2a1c',j:'#5c4430',k:'#7a6048'},data:['iiiiiiiiiiiiiiii','ijiiijjiiiiiiiii','iijjijjiiiiiijji','iijjiiiiiiiijjii','iiiiiiiiiiiiiiii','iiiiiiiijjiiiiii','iiijjiiijjiiiiii','iijjiiiiiiiiiijj','iiiiiiiiiiiiiijj','iiiiiiiiiiiiiiii','ijjiiiiiiijjiiii','ijjiiiiiiijjiiii','iiiiiiiiiiiiiiii','iiiiijjiiiiiiiii','iiiiijjiiiiijjii','iiiiiiiiiiiiijji']},
{name:'stalagmite',palette:{c:'#2a2438',d:'#453d55',e:'#655c78'},data:['................','.......cc.......','......cddc......','......cddc......','.....cddddc.....','.....cdeedc.....','.....cddddc.....','....cddddddc....','....cdeeeedc....','....cddddddc....','...cddddddddc...','...cdeeeeeedc...','..cddddddddddc..','..cdeeeeeeeedc..','.cddddddddddddc.','.cccccccccccccc.']},
{name:'stalactite',palette:{c:'#2a2438',d:'#453d55',e:'#655c78'},data:['.cccccccccccccc.','.cddddddddddddc.','..cdeeeeeeeedc..','..cddddddddddc..','...cdeeeeeedc...','...cddddddddc...','....cdeeeedc....','....cddddddc....','.....cdeedc.....','.....cddddc.....','.....cddddc.....','......cddc......','......cddc......','.......cc.......','................','................']},
{name:'oreGold',palette:{a:'#2a2438',b:'#453d55',g:'#d09020',G:'#ffdd55'},data:['aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaa','aaaaaagggaaaaaaa','aaaagggGGgggaaaa','aaaaggGGGGggaaab','aaaagggGGgggaaab','aaaaaagggaaaaaaa','aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaagggaaaab','aaaaaaaggGggaaaa','aaaaaaaaaaaaggaa','aaaaaaaaaaaaaaaa']},
{name:'oreDiamond',palette:{a:'#2a2438',b:'#453d55',y:'#66ddff',Y:'#ffffff',z:'#2060a0'},data:['aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaa','aaaaaazzzaaaaaaa','aaaazzzyyzzzaaaa','aaaazzyyYyyzaaab','aaaazzzyyzzzaaab','aaaaaazzzaaaaaaa','aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaazzzaaaab','aaaaaaazyyyzaaaa','aaaaaaaaaazzaaaa','aaaaaaaaaaaaaaaa']},
{name:'crystalCluster',palette:{c:'#4020a0',C:'#a040ff',H:'#e090ff'},data:['................','.......c........','......cCc.......','......cCc.......','.....cCCCc......','.....cCCCc......','.....cCHCc......','.....cCCCc......','...c.cCCCc.c....','..cCc.cCc.cCc...','..cHc.cCc.cHc...','..cCc.cCc.cCc...','...c..cCc..c....','......cCc.......','......cCc.......','.......c........']},
{name:'glowingMushroom',palette:{s:'#d0b0a0',c:'#7040a0',C:'#e090ff',H:'#ffddff'},data:['................','..........cc....','.....cc..cCCc...','....cHCc.cCCc...','....cCCc..cc....','.....cc...s.....','..........s.....','......s...s.....','......s...s.....','......s...s.....','......s...s.....','......s.........','......s.........','.....ss.........','................','................']},
{name:'torch',palette:{w:'#5c4430',d:'#3d2a1c',f:'#ff6600',F:'#ffcc00',H:'#ffeeaa'},data:['................','.......HH.......','......HFFH......','.....HfFFfH.....','.....FFffFF.....','....FffFFffF....','.....FFffFF.....','......ffff......','.......ww.......','......dwwd......','......dwwd......','......dwwd......','.......ww.......','.......ww.......','.......ww.......','......dwwd......']},
{name:'lavaTile',palette:{k:'#661100',L:'#cc3300',m:'#ffaa00',N:'#ffee66'},data:['kkLkkLLkkLkLLkkL','kLLmkLLLmkLLmmLk','LmNNmLmNNmLmNNmL','kLmmLkLmmLkLmmLk','kkLLkkkLLkkkLLkk','kLLLkkLLLLkLLkLk','LmNNmLmNNmLmNNmL','LLmmLLLLmmLLLLmL','kkLkkLLkkLkLLkkL','kLLmkLLLmkLLmmLk','LmNNmLmNNmLmNNmL','kLmmLkLmmLkLmmLk','kkLLkkkLLkkkLLkk','kLLLkkLLLLkLLkLk','LmNNmLmNNmLmNNmL','LLmmLLLLmmLLLLmL']},
{name:'caveSpider',palette:{b:'#1a0a1a',B:'#3a2a3a',E:'#ff2222'},data:['................','..b..b....b..b..','...b.b....b.b...','....bb....bb....','....bbbbbbbb....','...bBBBBBBBBb...','..bBBEEBBEEBBb..','..bBBEEBBEEBBb..','..bBBBBBBBBBBb..','..bBBBBBBBBBBb..','...bBBBBBBBBb...','....bbbbbbbb....','...bb..bb..bb...','..b..b.b..b..b..','..b..b.b..b..b..','...b...b..b...b.']},
{name:'caveGhost',palette:{g:'#2a4a5a',G:'#5a8aaa',H:'#e0f0ff'},data:['................','................','.....gggg.......','....gGGGGg......','...gGGGGGGg.....','...gGgGHHGgGg...','..gGgGHHGgGg....','..gGGGGGGGGg....','..gGGGGGGGGg....','..gGGGGGGGGg....','..gGGGGGGGGg....','..gGGGGGGGGg....','..gGGGGGGGGg....','..gGgGGgGGgg....','..g.g.gg.ggg....','...g..g...g.....']},
{name:'caveRat',palette:{b:'#3a2a20',B:'#5a4030',E:'#ff2222',t:'#7a6050'},data:['................','................','................','................','..t...........t.','..t...........t.','...bbbbbbbbbb...','..bBBBBBBBBBBb..','..bBBEBBBBEBBb..','..bBBBBBBBBBBb..','..bBBBBBBttttb..','..bBBBBBBbbbbb..','..bbbbbbbbbbbb..','.bb..........bb.','.bb..........bb.','................']},
{name:'stoneGolem',palette:{c:'#2a2438',d:'#453d55',e:'#655c78',G:'#5aff80'},data:['................','....cccccccc....','...cdddddddc....','..cdeGGGGedc....','..cdeGGGGedc....','...cdddddddc....','....cdddddc.....','..cccccccccccc..','.cddddddddddddc.','.cddeeeeeeeeedc.','.cddeGGGGGGedc..','.cddeGGGGGGedc..','.cddeeeeeeeedc..','.cddccccccccdc..','.ccdcc....ccdcc.','..cc........cc..']},
{name:'caveEntrance',palette:{a:'#2a2438',b:'#453d55',x:'#0a0810',d:'#1a1428'},data:['aaaaaaaaaaaaaaaa','abbbbbbbbbbbbbba','abbbbbbbbbbbbbba','abbxxxxxxxxxxbba','abbxxxxxxxxxxbba','abxxxxxxxxxxxxba','abxxxdddddddxxba','abxxdddddddddxxa','abxxdddddddddxxa','abxxdddddddddxxa','abxxdddddddddxxa','abxxdddddddddxxa','abbxdddddddddbba','abbxxdddddddxxba','abbbbbbbbbbbbbba','aaaaaaaaaaaaaaaa']},
{name:'ladder',palette:{w:'#3d2a1c',L:'#b88040'},data:['................','.wDw........wDw.','.wDw........wDw.','.wDwwwwwwwwwwDw.','.wDwLLLLLLLLwDw.','.wDw........wDw.','.wDwwwwwwwwwwDw.','.wDwLLLLLLLLwDw.','.wDw........wDw.','.wDwwwwwwwwwwDw.','.wDwLLLLLLLLwDw.','.wDw........wDw.','.wDwwwwwwwwwwDw.','.wDwLLLLLLLLwDw.','.wDw........wDw.','................']},
/* VOL.2 ores */
{name:'oreIron',palette:{a:'#2a2438',b:'#453d55',g:'#7a7a8a',G:'#d0d0e0'},data:['aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaa','aaaaaagggaaaaaaa','aaaagggGGgggaaaa','aaaaggGGGGggaaab','aaaagggGGgggaaab','aaaaaagggaaaaaaa','aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaagggaaaab','aaaaaaaggGggaaaa','aaaaaaaaaaaaggaa','aaaaaaaaaaaaaaaa']},
{name:'oreCoal',palette:{a:'#2a2438',b:'#453d55',g:'#0a0a0a',G:'#2a2a2a'},data:['aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaa','aaaaaggagaaaaaaa','aaaagGGgaggaaaaa','aaaagGGGGgggaaab','aaaagagGGgagaaab','aaaaaggagaaaaaaa','aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaagagaaaab','aaaaaaaggGggaaaa','aaaaaaaaaaaaggaa','aaaaaaaaaaaaaaaa']},
{name:'oreRuby',palette:{a:'#2a2438',b:'#453d55',g:'#7a1010',G:'#ff4040',H:'#ffaaaa'},data:['aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaa','aaaaaaaggHaaaaaa','aaaaaggGGGggaaaa','aaaagGHHHGGggaab','aaaaggGHGGggaaaab','aaaaaggggaaaaaaa','aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaaggHaaaab','aaaaaaagGGgagaaa','aaaaaaaaaaaaggaa','aaaaaaaaaaaaaaaa']},
{name:'oreEmerald',palette:{a:'#2a2438',b:'#453d55',g:'#0a6030',G:'#40ff80',H:'#a0ffb0'},data:['aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaa','aaaaaaaggaaaaaaa','aaaagggGggggaaaa','aaaagGHHGGggaaab','aaaaggGGGgggaaaab','aaaaaaggagaaaaaa','aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaaggHaaaab','aaaaaaagGGgagaaa','aaaaaaaaaaaaggaa','aaaaaaaaaaaaaaaa']},
{name:'oreAmethyst',palette:{a:'#2a2438',b:'#453d55',g:'#4a1080',G:'#b060ff',H:'#e0b0ff'},data:['aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaabbaaaaab','aaaaaaaaaaaaaaaa','aaaaaaaaaaaaaaaa','aaaaaagggaaaaaaa','aaaagggGHgggaaaa','aaaagGHHHGGggaab','aaaaggGHHGgggaaab','aaaaaaggagaaaaaa','aaaaaaaaaaaaaaaa','abbaaaaabbaaaaab','abbaaaaaggaaaaab','aaaaaaagGGgagaaa','aaaaaaaaaaaaggaa','aaaaaaaaaaaaaaaa']},
{name:'caveMoss',palette:{i:'#3d2a1c',j:'#5c4430',m:'#3a5a2a',M:'#5a8030'},data:['iiiiiiiiiiiiiiii','ijiiiiiiijiiiiii','iimmmiiiiiiiiiii','iimMmmiiiiijiiii','iiimmmiiiiiiiiii','iiiiiiiiiiiiiiii','iiiiiiiiiiiijiii','iiijiiimmmiiiiii','iiiiiiimMmmiiiii','iiiiiimmmiiiiiii','ijiiiiiiiiiiiiii','iiiiiiiiiiiiiiji','iiiiijiiiiiiiiii','iiiiiiiiiiiiiiii','iiiiiiiiijiiiiii','iiiiiiiiiiiiiiii']},
{name:'caveWater',palette:{w:'#0a2030',W:'#1a4060',b:'#3a7090',B:'#6ab0d0'},data:['wwwwwwwwwwwwwwww','wwwwwwwwwwwwwwww','wwbwwwwwwwwwbwww','wWbWwwwwwwWWbWww','wwwwwwwwwwwwwwww','wwwwwwwwwwwwwwww','wwwwwwwwbwwwwwww','wwwwwwwWbWwwwwww','wwwwwwwwwwwwwwww','wwwwwwwwwwwwwwww','wwwwbwwwwwwwwbww','wwwWbWwwwwwwWbWw','wwwwwwwwwwwwwwww','wwwwwwwwwwwwwwww','wwwwwwwwwwwwwwww','wwwwwwwwwwwwwwww']},
{name:'supportBeam',palette:{w:'#3d2a1c',D:'#8a5a2a',L:'#b88040'},data:['wwwwwwwwwwwwwwww','wLLLLLLLLLLLLLLw','wLDDDDDDDDDDDDLw','wLDwwwwwwwwwwDLw','wLDwwwwwwwwwwDLw','wLDwwwwwwwwwwDLw','wLDwwwwwwwwwwDLw','wLDwwwwwwwwwwDLw','wLDwwwwwwwwwwDLw','wLDwwwwwwwwwwDLw','wLDwwwwwwwwwwDLw','wLDwwwwwwwwwwDLw','wLDwwwwwwwwwwDLw','wLDDDDDDDDDDDDLw','wLLLLLLLLLLLLLLw','wwwwwwwwwwwwwwww']},
{name:'mineRail',palette:{m:'#5a5a6a',M:'#a0a0b0'},data:['...mm......mm...','...mm......mm...','...mm......mm...','..mMMm....mMMm..','...mm......mm...','...mm......mm...','...mm......mm...','..mMMm....mMMm..','...mm......mm...','...mm......mm...','...mm......mm...','..mMMm....mMMm..','...mm......mm...','...mm......mm...','...mm......mm...','..mMMm....mMMm..']},
{name:'mineCart',palette:{w:'#3d2a1c',D:'#8a5a2a',m:'#5a5a6a',M:'#a0a0b0'},data:['................','................','................','..wwwwwwwwwwww..','..wDDDDDDDDDDw..','..wDwwwwwwwwDw..','..wDDDDDDDDDDw..','..wwwwwwwwwwww..','..mM........Mm..','.mM..........Mm.','mM............Mm','mMm..........mMm','.mMm........mMm.','..mMmm....mmMm..','...mMmm..mmMm...','....mm....mm....']},
{name:'brokenPillar',palette:{c:'#2a2438',d:'#453d55',e:'#655c78',x:'#0a0810'},data:['..cccccccccccc..','..cdeeeeeeeedc..','..cddddddddddc..','..cdeeeeeeeedc..','..cddddddddddc..','..cdeeeeeeeedc..','..cddddddddddc..','..cdexxxxxxxdc..','..cdddxddddxdc..','..cddxdddxxxdc..','..cdxxdddxxxxc..','..cdxddxxxxxxc..','.ccddddddddddcc.','cddddxxxxxxxxddc','cddddddddddddddc','.cccccccccccccc.']},
{name:'woodBridge',palette:{w:'#3d2a1c',D:'#8a5a2a',L:'#b88040'},data:['................','wwwwwwwwwwwwwwww','wDDDDDDDDDDDDDDw','wLLLLLLLLLLLLLLw','wDDDDDDDDDDDDDDw','wwwwwwwwwwwwwwww','................','wwwwwwwwwwwwwwww','wDDDDDDDDDDDDDDw','wLLLLLLLLLLLLLLw','wDDDDDDDDDDDDDDw','wwwwwwwwwwwwwwww','................','wwwwwwwwwwwwwwww','wDDDDDDDDDDDDDDw','wwwwwwwwwwwwwwww']},
{name:'bonesPile',palette:{b:'#5a5040',B:'#e0d8c0'},data:['................','................','..b..........b..','..bb........bb..','.bBBb......bBBb.','.bBBb..bb..bBBb.','..bb..bBBb..bb..','......bBBb......','...bb.bBBb.bb...','..bBBb.bb.bBBb..','..bBBb....bBBb..','...bb..bb..bb...','..bb..bBBb.bb...','.bBBb.bBBb.bBBb.','.bBBBbbBBBbbBBb.','..bbbbbbbbbbbb..']},
{name:'skull',palette:{b:'#5a5040',B:'#e0d8c0',E:'#1a1428',W:'#f0e8d0'},data:['................','................','................','....bbbbbbbb....','...bBBBBBBBBb...','..bBBBBBBBBBBb..','..bBWWBBBBWWBb..','..bBWEBBBBEWBb..','..bBWWBBBBWWBb..','..bBBBBBBBBBBb..','..bBBBWWWWBBBb..','...bBBWBWBWBb...','....bBBBBBBb....','.....bBWBWb.....','......bbbb......','................']},
{name:'spiderweb',palette:{w:'#8a8a8a'},data:['w...............','.ww.............','..www...........','...wwww.........','....wwwww.......','.....wwwwww.....','......wwwwwww...','.......wwwwwwww.','........wwwwwww.','.........wwwwww.','..........wwwww.','...........wwww.','............www.','.............ww.','..............w.','................']},
{name:'glowLichen',palette:{G:'#5aff80',H:'#b0ffb0'},data:['................','................','................','................','................','................','........GG......','......GGHHGG....','.....GGHHHHGG...','.....GGHHHHGG...','......GGHHGG....','........GG......','................','................','................','................']},
{name:'spikes',palette:{m:'#5a5a6a',M:'#a0a0b0'},data:['................','................','................','................','..m...m...m...m.','.mMm.mMm.mMm.mMm','.MMm.MMm.MMm.MMm','.MMm.MMm.MMm.MMm','.MMm.MMm.MMm.MMm','.MMm.MMm.MMm.MMm','MMMMMMMMMMMMMMMM','MMMMMMMMMMMMMMMM','MMMMMMMMMMMMMMMM','MMMMMMMMMMMMMMMM','................','................']},
{name:'fallingRock',palette:{c:'#2a2438',d:'#453d55',e:'#655c78'},data:['.......cc.......','......cddc......','.....cddddc.....','....cdddddddc...','....cdeeeedc....','...cddddddddc...','...cdeeeeeedc...','..cddddddddddc..','..cdeeeeeeeedc..','.cddddddddddddc.','.cccccccccccccc.','................','................','................','................','................']},
{name:'poisonGas',palette:{g:'#3a6a3a',G:'#5a9a5a',h:'#8aba8a',H:'#b0dab0'},data:['................','................','......gggg......','.....gGGGGg.....','....gGGhhGGg....','...gGhhhhhhGg...','...gGhhHHhhGg...','..gGGhHHHHhGGg..','..gGgGhhhhGgGg..','..gggggggggggg..','...gg..gg..gg...','....g...g...g...','................','................','................','................']},
{name:'lavaGeyser',palette:{k:'#661100',L:'#cc3300',m:'#ffaa00',N:'#ffee66'},data:['................','................','................','................','................','................','......kkkk......','.....kLLmmk.....','.....kmNNmk.....','.....kmmmmk.....','....kkLLLLkk....','....kkkkkkkk....','....kkkkkkkk....','....kkkkkkkk....','....kkkkkkkk....','....kkkkkkkk....']},
{name:'ruby',palette:{r:'#a02020',R:'#ff6060',H:'#ffaaaa'},data:['................','................','................','......rrrr......','.....rRRHHr.....','.....rRHHHr.....','.....rRHHHr.....','.....rRRHHr.....','.....rrRRRr.....','......rrrr......','.......rr.......','................','................','................','................','................']},
{name:'coinPile',palette:{g:'#a07020',G:'#d0a040',S:'#ffedaa'},data:['................','................','................','................','..ggg.....ggg...','.gGGGg...gGGGg..','.gGSGg...gGSGg..','..ggg.....ggg...','.....ggg........','....gGGGg.......','....gGSGg.......','.....ggg........','................','................','................','................']},
{name:'mineKey',palette:{g:'#a07020',G:'#d0a040'},data:['................','................','.....gggg.......','....gGGGGg......','...gG....Gg.....','...gG....Gg.....','...gG....Gg.....','....gGGGGg......','.....gggg.......','......gg........','......gg........','......gg........','......gggg......','......gg.gg.....','......gg..gg....','................']},
{name:'lantern',palette:{w:'#3d2a1c',D:'#8a5a2a',G:'#3a4a5a',H:'#ffcc60',F:'#ffeeaa'},data:['.......w........','.......w........','.......w........','......www.......','.....wDDDw......','....wDGGGDw.....','....wGHHHGw.....','....wGHFHGw.....','....wGHHHGw.....','....wDGGGDw.....','....wDDDDDw.....','.....wDDDw......','......www.......','................','................','................']},
{name:'glowMushroomBlue',palette:{s:'#d0b0a0',c:'#1a4a80',C:'#4080d0',H:'#a0d0ff'},data:['................','................','.....cccc.......','....cHHCc.......','...cCHHHCc......','...cCHHHHCc.....','...cCHHHHCc.....','...ccHHHHcc.....','....ccHHcc......','.....ssss.......','......ss........','......ss........','......ss........','.....ssss.......','................','................']},
{name:'cavePortal',palette:{p:'#4020a0',P:'#a040ff',H:'#e090ff',b:'#1a1028'},data:['................','....bbbbbbbb....','...bppppppppb...','..bpPPPPPPPPpb..','..bpPWWWWWWPpb..','.bpPPWHHHHWPpPb.','.bpPHHHHHHHHPpb.','.bpPHHHHHHHHPpb.','.bpPHHHHHHHHPpb.','.bpPPWHHHHWPpPb.','..bpPWWWWWWPpb..','..bpPPPPPPPPpb..','...bppppppppb...','....bbbbbbbb....','................','................']},
/* MOBS T1 */
{name:'spiderling',palette:{b:'#0a0a0a',B:'#3a2a2a',E:'#ff2020'},data:['................','..b..........b..','..b.b......b.b..','...b.b....b.b...','....bbbbbbbb....','...bBBBBBBBBb...','..bBBEEBBEEBBb..','..bBBEEBBEEBBb..','..bBBBBBBBBBBb..','...bBBBBBBBBb...','....bbbbbbbb....','...b.b....b.b...','..b.b......b.b..','..b..........b..','................','................']},
{name:'mushroomSprout',palette:{c:'#a04020',C:'#ff8040',W:'#ffd0a0',s:'#d0b0a0',e:'#1a0a0a'},data:['................','................','......cccc......','....ccCCCCcc....','...cCCWWWWCCc...','..cCCWWWWWWCCc..','..cCCWWWWWWCCc..','..ccCCWWWWCCcc..','...cccccccccc...','.....ssssss.....','.....seeese.....','.....ssssss.....','......ssss......','......ssss......','................','................']},
{name:'rockBeetle',palette:{b:'#1a1a1a',B:'#4a4a3a',L:'#6a6a5a',H:'#8a8a70',E:'#ff4020'},data:['................','................','...bb......bb...','..bBBb....bBBb..','..bBBbbbbbbBBb..','...bBBBBBBBBb...','..bBHHBBBBHHBb..','..bBHHBBBBHHBb..','..bBLBBBBBBLBb..','..bBLBBEEBBLb...','..bBBBBBBBBBBb..','...bbBBBBBBbb...','....bbbbbbbb....','....b......b....','...b........b...','................']},
{name:'fireImp',palette:{r:'#ff4000',R:'#ff8020',Y:'#ffdd60',W:'#fff8d0',E:'#0a0505',h:'#5a1a08'},data:['................','.....r..r.......','....rRrrRr......','....rRRRRr......','...rRWEERWEr....','...rRRRRRRr.....','....rRYYRr......','...rrrrrrrrr....','..rrRRRRRRRrr...','..rRRYYYYYRRr...','..rRRYYYYYRRr...','..rrRRRRRRRrr...','...rr.rrr.rr....','...r...r...r....','..hh...hh...hh..','................']},
{name:'direBat',palette:{b:'#1a0a1a',B:'#4a2a5a',E:'#ff2030',f:'#2a1a2a'},data:['................','..b..........b..','.bBb........bBb.','.bBb........bBb.','bBBbb......bbBBb','bBBBb......bBBBB','bBBBBbbbbbbBBBBb','.bBBBBBBBBBBBBb.','..bBEBBBBBBEBb..','...bBBBBBBBBb...','....bBBBBBBb....','.....bBBBBb.....','......bffb......','.......bb.......','................','................']},
{name:'caveCrab',palette:{s:'#a02020',S:'#e05030',H:'#ff9060',w:'#ffffff'},data:['................','s..............s','ss............ss','.s....ssss....s.','.s..ssSSSSss..s.','..ssSHHHHHHSss..','..sSHHHHHHHHSs..','..sSHeWeWeWeSs..','..sSHHHHHHHHSs..','...sSHHHHHHSs...','....ssSSSSss....','s....sSSSSs....s','ss...ss..ss...ss','.s..s......s..s.','....s........s..','................']},
{name:'crystalSprite',palette:{c:'#3050a0',C:'#6090e0',H:'#c0e0ff'},data:['................','.......c........','......cCc.......','......cCc.......','.....cCHCc......','.....cCHCc......','.....cCHCc......','......cCc.......','.......c........','.......c........','...c...c...c....','..cCc..c..cCc...','..cHc..c..cHc...','...c.......c....','................','................']},
{name:'toxicSlime',palette:{g:'#1a3a1a',G:'#4a9a3a',H:'#80d060',E:'#0a0a0a',p:'#a0e070'},data:['................','................','................','.....gggggg.....','....gGGGGGGg....','...gGHHHHHHGg...','..gGGGEEGEEGGg..','..gGGGGGGGGGGg..','..gGGGGGGGGGGg..','..gGGGGGGGGGGg..','..ggGGGGGGGGgg..','...gggggggggg...','....p......p....','................','................','................']},
{name:'ghostWisp',palette:{b:'#1020a0',B:'#4060e0',H:'#90c0ff',W:'#e0f0ff'},data:['................','................','.....BBBB.......','....BHHHHB......','...BHHHHHHB.....','...BHWWHHWB.....','..BHHWWWWWHB....','..BHHHWWWHHB....','..BHHHHHHHHB....','..bBHHHHHHBb....','...bbBHHBbb.....','....b.b..b......','................','................','................','................']},
{name:'batSwarm',palette:{b:'#0a0505',B:'#2a1a2a',E:'#ff3040'},data:['..b..........b..','.bBb........bBb.','bBBb..b..b..bBBb','bBBbbbbbbbbbbBBb','.bBBBBBBBBBBBBb.','..bBEBBBBBBEBb..','...bBBBBBBBBb...','..b..bbbb..b....','.bBb.bBBb.bBb...','..b..bBBb..b....','.....bEEb.......','..b...bb...b....','.bBb......bBb...','..b........b....','................','................']},
/* MOBS T2 */
{name:'skeletonArcher',palette:{b:'#5a5040',B:'#e0d8c0',E:'#ff2020',w:'#8a5a2a',a:'#c0a060'},data:['................','.....bbbb.......','....bBBBBb......','...bBBBBBBb.....','...bBEBBEBb.....','...bBBBBBBb.....','....bBBBBb......','.....bBBb.......','....bbBBbb....w.','...bBBbBBbBBbw..','...bBb.BB.bBw...','...bb..BB..ww...','......BBBB.a....','......BBBB.a....','.....bBwwBa.....','.....bbbb.......']},
{name:'zombieMiner',palette:{g:'#3a5a2a',G:'#6a9a4a',H:'#9ac080',E:'#c0ff60',h:'#5a4a2a',p:'#8a8a8a'},data:['................','.....hhhhh......','....hhhhhhh.....','...gGGGGGGg.....','...gGEEGEEGg....','...gGGGGGGg.....','....gGGGGg......','...ggGGGGgg.....','..gGGgGGgGGg....','..gGg.GG.gGg....','..gg..GG..gg....','......GGGG......','.....pGGp.......','.....pGGp.......','....pp..pp......','................']},
{name:'caveGoblin',palette:{g:'#3a6a2a',G:'#6aaa4a',H:'#a0d080',E:'#ffcc00',r:'#a02020',c:'#8a5a2a'},data:['................','................','...gG......Gg...','...gGGGGGGGGg...','..gGHHHHHHHHGg..','..gGHEGGGGEHGg..','..gGHHHHHHHHGg..','..gGGHHHHHGGg...','...gGGGGGGGGg...','...rggGGGGggr...','..rGGgGGGGgGGr..','..rGg.GGGG.gGr..','......GGGG......','......GGGG......','.....cGGGGc.....','.....cc..cc.....']},
{name:'plagueRat',palette:{b:'#1a2a1a',B:'#3a5a3a',H:'#7aa070',E:'#c0ff60',t:'#a0a070',p:'#1a0a1a'},data:['................','................','..t...........t.','..t...........t.','...bbbbbbbbbb...','..bBBBBBBBBBBb..','..bBBEBBBBEBBb..','..bBBBBBBBBBBb..','..bHHBBBBBBBBb..','..bHHBBBBppppb..','..bbbbbbbbpppb..','...bb......bbb..','..b..b....b..b..','..b..b....b..b..','................','................']},
{name:'cursedSkull',palette:{b:'#5a5040',B:'#e0d8c0',E:'#ff2020',W:'#f0e8d0',g:'#a040ff'},data:['................','................','....bbbbbbbb....','...bBBBBBBBBb...','..bBBBBBBBBBBb..','..bBWWBBBBWWBb..','..bBWEBBBBEWBb..','..bBWWBBBBWWBb..','..bBBBBBBBBBBb..','..bBBBWWWWBBBb..','...bBBWBWBWBb...','....bbbbbbbb....','.....b.gg.b.....','......g..g......','....gg....gg....','................']},
{name:'mimicChest',palette:{w:'#3a2a1a',W:'#8a5a2a',L:'#b88040',G:'#ffd060',t:'#e0e0e0',E:'#ff2020',m:'#a02020'},data:['................','................','..WWWWWWWWWWWW..','..WwwwwwwwwwwW..','..WwwwwwwwwwwW..','..WWWWWWWWWWWW..','..WLLLLLLLLLLW..','..WLGGGGGGGGLW..','..WLGGGGGGGGLW..','..WLLLLLLLLLLW..','..WLGttGGttGLW..','..WLGtEtEtGGLW..','..WLGGGGGGGGLW..','..WLmmmmmmmGLW..','..WWWWWWWWWWWW..','................']},
{name:'crystalGolem',palette:{c:'#2030a0',C:'#5080e0',H:'#a0d0ff',W:'#ffffff'},data:['................','....c......c....','...cCc....cCc...','...cCc....cCc...','....cCCCCCCc....','...cCHHHHHCc....','..cCHWCCWCHCc...','..cCHHCCCHHCc...','...cCHHHHHCc....','..ccCCCCCCCcc...','.cCHCCCCCHCc....','.cCHCCCCCHCc....','..cCCCCCCCc.....','...cCc..cCc.....','...cCc..cCc.....','...ccc..ccc.....']},
{name:'boneKnight',palette:{b:'#3a3020',B:'#d0c8b0',E:'#ff3020',s:'#5a5a6a',S:'#a0a0b0',r:'#802020'},data:['................','.....sssss......','....sSSSSSs.....','...sSSSSSSSs....','...sSSEEESSs....','...sSSSSSSSs....','....sSSSSSs.....','.....sBBs.......','...ssBBBBss.....','..sBBsBBsBBs....','..sBs.BB.sBs....','..ss..BB..ss....','......BBBB......','......BBBB......','.....rBBBBr.....','....rr....rr....']},
{name:'spiderQueenling',palette:{p:'#3a0a3a',P:'#7a1a5a',H:'#ff3080',E:'#ffcc00',b:'#0a0a0a'},data:['.p..p......p..p.','.p.p.p....p.p.p.','..ppp.b..b.ppp..','...bp.bbbb.pb...','....bbPPPPbb....','...bPPPPPPPPb...','..bPPHHPHHPHPb..','..bPPHHEEHEHPb..','..bPPHHPHHPHPb..','...bPPPPPPPPb...','....bbPPPPbb....','...bp.bbbb.pb...','..ppp.b..b.ppp..','.p.p.p....p.p.p.','.p..p......p..p.','................']},
{name:'lavaSlime',palette:{r:'#3a0808',R:'#a02000',H:'#ff6020',Y:'#ffcc30',E:'#0a0505'},data:['................','................','................','.....rrrrrr.....','....rRRRRRRr....','...rRHHHHHHr....','..rRRYYERYYEr...','..rRYYYYYYYYr...','..rRYYYYYYYYr...','..rRYYYYYYYYr...','..rrRRRRRRRRr...','...rrrrrrrrr....','................','................','................','................']},
/* MOBS T3 */
{name:'caveTroll',palette:{g:'#2a4a2a',G:'#5a8a4a',H:'#90c080',E:'#ffcc00',t:'#e0e0d0',m:'#5a1a1a'},data:['................','.....gggggg.....','....gGGGGGGg....','...gGHHHHHHGg...','...gGHEGGGEHGg..','...gGHHHHHHGg...','..gGGGmmmmGGGg..','..gGGtmtmtmtGg..','..gGGGmmmmGGGg..','.gGGgGGGGGGgGGg.','.gGg.gGGGGg.gGg.','.gg...gGGg...gg.','......gGGg......','......gGGg......','.....gGGGGg.....','.....gg..gg.....']},
{name:'wraith',palette:{p:'#2a0a3a',P:'#5a2a8a',H:'#a060e0',W:'#e0c0ff',E:'#ff3060'},data:['................','.....pppppp.....','....pPPPPPPp....','...pPHHHHHHPp...','...pHWEEEHWHPp..','..pPHWEEEHWHPp..','..pPHHHHHHHHPp..','..pPPPPPPPPPPp..','..pPPPPPPPPPPp..','..pPPPPPPPPPPp..','..pPPPPPPPPPPp..','..ppPPPPPPPPpp..','...ppPPPPPPpp...','....ppppppp.....','.....p...p......','................']},
{name:'magmaHound',palette:{r:'#1a0808',R:'#6a1a08',H:'#ff4000',Y:'#ffcc30',E:'#ffee60',W:'#fff8d0'},data:['................','...rr.....rr....','..rRRr...rRRr...','..rHRr...rHRr...','..rRRRrrrRRRr...','..rRRHHHHHRRr...','..rREWHRRHWEr...','..rRRRHHHRRRr...','..rHHHRRRHHHr...','..rHHHRRRHHHr...','..rrrRRRRRrrr...','..r.rRRRRRr.r...','....rRRRRRr.....','....r.....r.....','...rr.....rr....','................']},
{name:'necromancer',palette:{r:'#2a1a4a',R:'#4a2a8a',H:'#a060e0',B:'#d0c8b0',E:'#ff3020',g:'#5aff80',s:'#8a5a2a'},data:['................','.....rrrrrr.....','....rRRRRRRr....','...rRRHHHHRRr...','...rRHEEEHRRr...','...rRRHHHHRRr...','..rRRRRRRRRRRr..','..rRBBBBBBBBRr..','..rRRRRRRRRRRr..','..rRggggggggRr..','..rRgHggggHgRr..','..rRggggggggRr..','..rrRRRRRRRRrr..','...rrRRRRRRrr...','.....s....s.....','....ss....ss....']},
{name:'ironGolem',palette:{i:'#2a2a3a',I:'#5a5a70',H:'#8a8aa0',E:'#ffcc00'},data:['................','....iiiiiiii....','...iIIIIIIIIi...','..iIIHIIIIHIIi..','..iIIEEIIEEIIi..','..iIIIIIIIIIIi..','...iIIIIIIIIi...','..iiiiiiiiiiii..','.iIIIIIIIIIIIIi.','.iIIHHHHHHHHIIi.','.iIIHHHHHHHHIIi.','.iIIIIIIIIIIIIi.','..iiiiiiiiiiii..','..iIiI....IiIi..','..iIiI....IiIi..','..iii......iii..']},
{name:'shadowLurker',palette:{b:'#0a0510',B:'#1a0a2a',E:'#ff2060',H:'#5a1a8a'},data:['................','.....bbbbbb.....','....bBBBBBBb....','...bBBBBBBBBb...','...bBEEBBEEBb...','...bBBBBBBBBb...','....bBBBBBBb....','..bbbBBBBBBbbb..','.bBBBBBBBBBBBBb.','bBBBBBBBBBBBBBBb','bBBBBBBBBBBBBBBb','.bBBHHBBHHBBBBb.','..bbHHBBHHBBbb..','...b.bb.bb.b....','................','................']},
{name:'iceWraith',palette:{c:'#1a3a6a',C:'#5090d0',H:'#a0d0ff',W:'#ffffff',E:'#ff2020'},data:['................','.....cccccc.....','....cCCCCCCc....','...cCHHHHHHCc...','...cHWEEEHWCc...','..cCHWEEEHWCCc..','..cCHHHHHHHCCc..','..cCCCCCCCCCcc..','..cCCCCCCCCCcc..','..cCCWWWWWCCCc..','..cCCWWWWWCCCc..','..ccCCCCCCCCcc..','...ccCCCCCCcc...','....cccccccc....','.....c....c.....','................']},
{name:'undeadChampion',palette:{b:'#3a3020',B:'#d0c8b0',E:'#ff3020',r:'#802020',s:'#5a5a6a',S:'#a0a0b0',c:'#ffcc00'},data:['......c........','.....sssss......','....sSSSSSs.....','...sSSSSSSSs....','...sSSEEESSs....','...sSSSSSSSs....','....sSSSSSs.....','.....sBBs.......','...ssBBBBss.....','..sBBsBBsBBs....','..sBs.BB.sBs....','..ss..BB..ss....','......BBBB......','.....rBBBBr.....','....rrBBBBrr....','....rr....rr....']},
{name:'voidling',palette:{p:'#1a0a2a',P:'#3a1a5a',H:'#8050c0',W:'#e0c0ff',E:'#ff40ff'},data:['................','.....pppppp.....','....pPPPPPPp....','...pPHHHHHHPp...','...pHWEHWEPHp...','...pPHHHHHHPp...','..pPPHHHHHPPp...','..pPPPPPPPPPp...','..pPPPPPPPPPp...','..pPPWWWWWPPp...','..pPPWWWWWPPp...','..ppPPPPPPPpp...','...ppPPPPPpp....','....ppppppp.....','.....p...p......','................']},
/* MOBS T4 */
{name:'caveHydra',palette:{g:'#0a1a0a',G:'#2a5a2a',H:'#5aa040',Y:'#ffdd40',R:'#aa2020'},data:['..gG......Gg....','..gH..gG..Hg....','.gGH.gGHG.HGg...','.gHH.gHHG.HHg...','..gG.YY.Gg......','..gGgRRgGg......','...gGggGg.......','....gGGg........','...ggGGgg.......','..gGHHHHGg......','.gGHHHHHHGg.....','gGHHHHHHHHGg....','gGHHHHHHHHGg....','.gGHHHHHHGg.....','..gGGGGGGg......','...gg..gg.......']},
{name:'boneDrake',palette:{b:'#3a3020',B:'#d0c8b0',E:'#ff3020',W:'#f0e8d0'},data:['................','...b........b...','..bBb......bBb..','..bBBb....bBBb..','...bBBbbbbBBb...','...bBBBBBBBBb...','..bBBEBBBBEBBb..','..bBBBBBBBBBBb..','...bBBWWWWBBb...','....bbBBBBbb....','.....bBBBBb.....','....bBBBBBBb....','...bBb....bBb...','..bBb......bBb..','..bb........bb..','................']},
{name:'voidHorror',palette:{p:'#0a0510',P:'#2a0a4a',H:'#7040c0',E:'#ff20ff',x:'#000000'},data:['..p.p......p.p..','.pPpPp....pPpPp.','pPPPPPppppPPPPPp','pPPHHHHHHHHHPPPp','pPHHHEEHHHEEHHPP','pPHHHEEHHHEEHHPP','pPPHHHHHHHHHPPPp','pPPPHHHHHHHPPPPp','pPPPPPxxxPPPPPPp','.pPPPPPPPxxxxPPp','.pPPPPPPxxxxxPPp','..pPPPPxxxxxxPp.','..pPPPPxxxxxPPp.','...ppPPxxxPPpp..','....ppppppp.....','................']},
{name:'ancientLich',palette:{c:'#1a0a2a',C:'#4020a0',H:'#a060e0',B:'#d0c8b0',E:'#ff30c0',g:'#5aff80'},data:['.......c........','.....ccccccc....','....cCCCCCCc....','...cCHHHHHHCc...','...cBHEEBEHBc...','...cBHHHHHHBc...','....cBBBBBBc....','..ccCCCCCCCCcc..','..cCHHHHHHHHCc..','..cCgggggggHCc..','..cCgHggggHgCc..','..cCgHggggHgCc..','..ccCCCCCCCCcc..','...ccCCCCCCcc...','.....cc..cc.....','.....cc..cc.....']},
{name:'demonLord',palette:{r:'#3a0808',R:'#8a1a08',H:'#ff4020',E:'#ffee60',h:'#1a0505'},data:['..h..h......h..h','.hHh.hHh..hHh.hH','.hHHh.hHh.hHh.hH','..hHHhhHHhhHHh..','..hHHHHHHHHHHh..','...hHHEEEEEHHh..','...hHHEEEEEHHh..','...hHHHHHHHHh...','..hhRRRRRRRRhh..','.hRRYRRRRRYRRh..','hRRYYRRRRRYYRRh.','hRRYRRRRRRRYRRh.','hRRRRRRRRRRRRRh.','.hhRRRRRRRRhh...','...hh..hh..hh...','..hh....hh...hh.']},
{name:'frostGiant',palette:{c:'#1a3a6a',C:'#4060a0',H:'#80a0e0',W:'#e0f0ff',E:'#a0e0ff'},data:['.......cc.......','.....ccccccc....','....cCCCCCCc....','...cCHHHHHHCc...','...cCHEEEHHCc...','...cCHHHHHHCc...','....cCCCCCCc....','..ccCCCCCCCCcc..','..cCHHHHHHHHCc..','..cCHHHHHHHHCc..','..cCHWWWWWHHCc..','..cCHWWWWWHHCc..','..ccCCCCCCCCcc..','...ccCCCCCCcc...','...cc......cc...','...cc......cc...']}
];

/* BOSSES με half-row mirror */
const BOSSES={
 stoneColossus:{palette:{'#':'#1a1428','+':'#3d3548','*':'#5a5068','@':'#5aff80','!':'#c0ffa0'},half:['................','..........######','.........#******','........#*++++@@','........#*++++@@','........#*++++++','........#*++++++','.........#*+++++','..........#*++++','............#*++','........###**+++','.......######*++','......#######*++','.....########*++','....#########*++','....###*+++++*++','....###*+++++*++','....###*+++++*++','....###*+++++*++','....###*+++++*++','....###*+++++*++','.....###*++++*++','.....####*++++++','......###*+++++.','......###*++++..','......###*++++..','......###*++++..','......###*++++..','......###*++++..','.....####*++++..','.....####*++++..','.....####*++++..']},
 crystalBeholder:{palette:{'#':'#1a1428','+':'#3d2a60','*':'#5a4090','o':'#8060c0','@':'#ff3080','~':'#a090e0','O':'#e0d0ff'},half:['................','................','................','........~.......','.......~o~......','.......~o~......','........#.......','.......####.....','.....##+***##...','...##+******##..','..##+*********#.','.##oooo*****###.','.#oooooo*@@@@@#.','.#oooooo*@@@@@#.','.#oooooo*@@@@@#.','.##oooo*****###.','..##oooo****##..','...##+******##..','.....##+***##...','.......####.....','........#.......','.......~o~......','.......~o~......','........~.......','................','................','................','................','................','................','................','................']},
 caveWyrm:{palette:{'#':'#0a0a08','+':'#2a4a20','o':'#5a9a3a','@':'#ffcc00','!':'#aa1010','~':'#e0e0f0','^':'#6a3010','x':'#1a0a08'},half:['................','..^.............','.#+#............','.#+#............','.#+#............','.#+##...........','..#++#..........','..###+++###.....','..##*++oooo+++..','.#*ooooooo@@@+..','.#*ooooooo@@@+..','.#*ooooooooo++..','.##*oooooooooo+.','.###**oooooooo+.','.#####******+++.','.###~~~*+++++++.','.##~~~~~#++++++.','.#!!!!!!!#+++++.','.#!!!!!!!!#++++.','.#!!!!!!!!!#+++.','.#!!!!!!!!!#+++.','.##!!!!!!!#++++.','.###~~~~~#+++++.','.###~~~#+++++++.','.#######+++++++.','..#####+++++++..','...###++++++++..','....###+++++++..','.....###++++++..','......##++++++..','.......##+++++..','........#+++++..']},
 lavaTitan:{palette:{'#':'#0a0505','%':'#1a0a1a','+':'#3a0808','*':'#7a1a00','o':'#ff4400','@':'#ffaa00','~':'#ffee66','x':'#ffffff'},half:['........................','.........~@~@~@.........','........~@~@~@~@........','.......~@~@~@~@~@.......','......~@~@~@~@~@~@......','.....~@~@~@~@~@~@~@.....','....~@~@~@~@~@~@~@~@....','.....%~....%~....%~.....','..........%~............','.........%~~%...........','........%@~~@%..........','........%@~~@%..........','........%@~~@%..........','.......%@~~~~@%.........','.......%@~xx~@%.........','.......%@~xx~@%.........','.......%@~xx~@%.........','.......%@~~~~@%.........','........%@~~@%..........','.........%%%%...........','.......%%%##%%.........','.....%%%%%%%%%##........','...###############......','..#***************#.....','.##**ooooooooooooo**#...','##**oooooooooooooooo**#.','#*oooooooooooooooooooo*#','#*oooooooooooooooooooo*#','#*oooooooooooooooooooo*#','##**ooooooooooooooooo**#','.##**oooooooooooooo**#..','..##**oooooooooooo**#...','..###**oooooooooo**##...','..####**oooooooo**###...','..#####**********####...','..#####**oooooo**####...','..######**oooo**#####...','...######******######...','...#######****#######...','...#########**#########.','....##################..','....###******###****###.','...###**oooo**#**oooo**#','..###**oooooo**oooooo**#','..##**oooooooooooooooo**','..##*oooooooooooooooooo*','..##*oooooooooooooooooo*','..##*oooooooooooooooooo*']}
};

  // Push single-frame sprites (skip αν υπάρχει όνομα — μην σβήνεις τα δικά σου)
  for(const s of PACK){
    if(!SPRITE_DEFS[s.name]) SPRITE_DEFS[s.name]=s;
  }
  // Push bosses (expand half→full via mirror)
  for(const k in BOSSES){
    if(SPRITE_DEFS[k]) continue;
    const b=BOSSES[k];
    const data=b.half.map(h=>h+h.split('').reverse().join(''));
    SPRITE_DEFS[k]={palette:b.palette,data};
  }
  console.log('✅ Underground pack loaded. Total sprites:',Object.keys(SPRITE_DEFS).length);
})();

// ═══════════════════════════════════════════════════════════
// ATLAS
// ═══════════════════════════════════════════════════════════
// Rear-facing frames reuse each race's palette and outfit while turning face pixels into hair.
for(const [base,back,backWalk,outfit] of [['playerElf','playerElfBack','playerElfBackWalk','G'],['playerOrc','playerOrcBack','playerOrcBackWalk','B'],['playerDwarf','playerDwarfBack','playerDwarfBackWalk','G']]){
  const source=SPRITE_DEFS[base],walking=SPRITE_DEFS[base==='player1'?'player2':`${base}Walk`];
  const makeBack=definition=>({palette:definition.palette,data:definition.data.map((row,index)=>Array.from(row,(pixel,x)=>{
    // Keep rear arms tucked against the body: no outward pixels can read as hands.
    if(index>=8&&index<=16&&(x<=4||x>=row.length-5))return '.';
    if(index>=3&&index<=7&&pixel!=='.'&&pixel!=='E')return 'H';
    if(pixel==='S')return outfit;
    if(index>=8&&index<=16&&(pixel==='W'||pixel==='T'))return outfit;
    return pixel;
  }).join(''))});
  SPRITE_DEFS[back]=makeBack(source);
  SPRITE_DEFS[backWalk]=makeBack(walking);
}
// Red character front and rear frames taken directly from the updated atlas.
const redBackPalette={R:'#c62828',F:'#ffcc80',W:'#1a1a1a',S:'#5d4037',B:'#1a1a1a'};
SPRITE_DEFS.player1={palette:redBackPalette,data:["....RRRR....","...RRRRRR...","..RRRRRRRR..","..FFFFFFFF..","..FWFFFFWF..","..FFFFFFFF..","..FFFFSSFF..","...FFFFFF...","....RRRR....","..RRRRRRRR..",".RRRRRRRRRR.",".RRBBBBBBRR.",".RRBBBBBBRR.","...BBBBBB...","...BB..BB...","..BBB..BBB.."]};
SPRITE_DEFS.player2={palette:redBackPalette,data:["....RRRR....","...RRRRRR...","..RRRRRRRR..","..FFFFFFFF..","..FWFFFFWF..","..FFFFFFFF..","..FFFFSSFF..","...FFFFFF...","....RRRR....","..RRRRRRRR..",".RRRRRRRRRR.",".RRBBBBBBRR.",".RRBBBBBBRR.","...BBBBBB...","..BB....BB..",".BBB....BBB."]};
SPRITE_DEFS.playerBack={palette:redBackPalette,data:["....RRRR....","...RRRRRR...","..RRRRRRRR..","..FFFFFFFF..","..FFFFFFFF..","..FFFFFFFF..","..FFFFFFFF..","...FFFFFF...","....RRRR....","..RRRRRRRR..",".RRRRRRRRRR.",".RRBBBBBBRR.",".RRBBBBBBRR.","...BBBBBB...","...BB..BB...","..BBB..BBB.."]};
SPRITE_DEFS.playerBackWalk={palette:redBackPalette,data:["....RRRR....","...RRRRRR...","..RRRRRRRR..","..FFFFFFFF..","..FFFFFFFF..","..FFFFFFFF..","..FFFFFFFF..","...FFFFFF...","....RRRR....","..RRRRRRRR..",".RRRRRRRRRR.",".RRBBBBBBRR.",".RRBBBBBBRR.","...BBBBBB...","..BB....BB..",".BBB....BBB."]};
  SPRITE_DEFS.tile_plains = {"palette":{"L":"#8bc34a","G":"#528e32","g":"#3f7528","d":"#2d591e"},"data":["GLGGgGGG","LLgGgGgG","gGGGGgGL","GGGdGGGL","gGGGGgGG","GGgGLLGg","GGGGgGGd","gGGLGgGG"]};
  SPRITE_DEFS.tile_forest = {"palette":{"G":"#3a6a2a","g":"#2a5a1a","d":"#1a4a0a"},"data":["gGGgGGdG","GGdGGgGG","GGGGGGgG","dGgGGGGG","GGGGdGGg","gGGGGGGG","GGdGGgGG","GGGGgGGd"]};
  SPRITE_DEFS.tile_magicForest = {"palette":{"G":"#49694d","g":"#39593d","d":"#5d4d82"},"data":["GGgGgGgG","gGgGGdGG","dGGgGGgG","GGgGGdGG","gGGgGgGG","GGdGGgGG","gGGgGgGg","GGgGgGGd"]};
  SPRITE_DEFS.tile_desert = {"palette":{"D":"#d4b96a","d":"#c4a95a","s":"#e4c97a"},"data":["sDDdDsDD","DDsDDDsD","DsDDdDDD","DDDDsDDd","sDDDsDDD","DDdDDsDD","DsDDDDdD","DDsDDsDD"]};
  SPRITE_DEFS.tile_snow = {"palette":{"S":"#d8e8f0","s":"#c8d8e0","i":"#b8c8d0"},"data":["SSsSSsSi","SsSSiSSS","sSSSSsSS","SSSSsSSs","SiSSsSSS","sSSSSSiS","SSSsSSSS","sSiSSSsS"]};
  SPRITE_DEFS.tile_swamp = {"palette":{"M":"#4a5a3a","m":"#3a4a2a","d":"#2a3a1a"},"data":["MmMMdMMM","MMdMMmMM","mMMMMmMM","MMMmMMdM","mMMdMMMM","MMMmMMmM","MMdMMmMM","mMMMMdMM"]};
  SPRITE_DEFS.tile_volcano = {"palette":{"V":"#69392b","v":"#59291b","l":"#e06731"},"data":["VvVVvVVv","VVvVVlVV","vVVVVvVV","VVlVVVVv","vVVvVVVV","VVVVvVVl","vVVlVVvV","VVvVVvVV"]};
  SPRITE_DEFS.tile_deadlands = {"palette":{"k":"#1a161f","d":"#352d40","D":"#463c54","p":"#554a66"},"data":["dkkdDddkdDdkkddD","dddddddDDdddDpDd","DDDDDDDDpDddDppD","ddDppDddpppDdDpp","dddDpDdkdppDkkDp","DdkdDddkkDDdkkdD","DdkdDDddddddddDd","DdDDDDdDpDddDppd","ddpppDdDppDdDppD","ddDppdkdDppdddpp","dkkdDddkdDDdkkdD","DdkddDDdkdDddddd","pDddDpDddDDDdDDD","DdDppDdDppDDdppp","ddpppdddppDddDpD","kkdpDdkdDpDkkdDD"]};
  SPRITE_DEFS.tile_fungal = {"palette":{"F":"#382c3a","f":"#544456","g":"#68566a","L":"#5d8c3e"},"data":["gLLLgfffgLLLgfff","gLLLgfffgLLLgfff","fgggfFFFfgggfFFF","FfffFFFFFfffFFFF","FfffFFFFFfffFFFF","FfffFFFFFfffFFFF","fgggfFFFfgggfFFf","gLLLgfffgLLLgfff","gLLLgfffgLLLgfff","gLLLgfffgLLgffff","fgggfFFFfggffFFF","FfffFFFFFfffFFFF","FfffFFFFFfffFFFF","FfffFFFFffffFFFF","fgLgfFFffgggfFFf","gLLLgfffgLLLgfff"]};
  SPRITE_DEFS.tile_crystal = {"palette":{"c":"#081426","C":"#122c4a","b":"#1b416e","B":"#255994","l":"#4df"},"data":["BlCcBbCBBbccBbcc","BccBCcBbCBBbBcBb","cBBccBCcBBCBcbBc","bBcBBCcBbcBBbBcB","BcbBclBCcBbCBBbB","BbccBBccBCcBbCBB","CcBbCcBbccBbcBBC","BbBccbCcBbCcBbCB","BBcBBccBCcclCcBb","BBbBcBBccBbcBBCc","BBBcbBcBBCcBbCBB","BBBCBcBBccBCcBbC","BlBBBbBcBBccBCcB","BBBBCBBbBcBBCcBb","BBBBBBCccbBcBBCc","BBBBBccBbccBCccB"]};
  SPRITE_DEFS.tile_badlands = {"palette":{"D":"#4a2211","r":"#6e3016","B":"#8a4020","b":"#a8522c","k":"#301408"},"data":["rrBBBrrrrrrrrrrB","BBbbbBBrrrrrrBBb","bbDDDbbBrkrrBbbD","DDrrrDDbBBBBbDDr","rrBBBrrDbbbbDrrB","BBbbbBBrDDDDrBBb","bbDDDbbBrrrrBbbD","DDrrrDDbBBBBbDDr","rrBBBrrDbbbbDrrB","BBbbbBBrDDDDrBBb","bbDDDbbBrrrrBbbD","DDrrrDDbkBBBbDDr","rrBBBrrDbbbbDrrB","BBbbbBBrDDDDkBBb","bbDDDbbBrrrrBbbD","DDrrrDDbBBBBbDDr"]};
  SPRITE_DEFS.tombstone = {"palette":{"g":"#777","G":"#999","d":"#555","w":"#333"},"data":["..GGGG..",".GggggG.",".gGggGg.",".gggggg.","GggggggG","gGdwGdwg","ggGggGgg","gggggggg"]};
  SPRITE_DEFS.bonePile = {"palette":{"w":"#eee","b":"#ccc"},"data":["........","........","...ww...","..bwwb..","..wwbw..","..bbwb..",".wwwwww.",".bwwbww."]};
  SPRITE_DEFS.giantMushroom = {"palette":{"s":"#aaa","S":"#ddd","r":"#1ee3bd","R":"#0af8c5"},"data":["..RRRR..",".RrRRrR.","RrRrrRrR","RRrRrrRR","RrrrrrrR","...SS...","...Ss...","...sS..."]};
  SPRITE_DEFS.sporePod = {"palette":{"g":"#1a4a40","G":"#2a5a50","l":"#4af880"},"data":["........","...GG...","..GllG..",".GlllgG.","GglllgGg","gGgllGgG","GgGgGgGg","gGgGgGgG"]};
  SPRITE_DEFS.crystalSpire = {"palette":{"c":"#052a4a","C":"#153a5a","b":"#254a6a","l":"#4df","L":"#aaffff"},"data":["...L....","..lLl...","..lLc...","..lCcc..",".lLCCb..",".lCbcb..",".Ccbcbc.","Ccbccbc."]};
  SPRITE_DEFS.canyonRock = {"palette":{"b":"#7a3a1a","B":"#8a4a2a","r":"#9a5a3a"},"data":["........","........","..rBB...",".rBBBb..",".BBBbb..",".BBbb...","rBBbbb..","BBbbbb.."]};
  SPRITE_DEFS.animalSkull = {"palette":{"w":"#fff","b":"#ccc","k":"#111"},"data":["........","........","..bbbb..",".wwwwww.","wwkwkwww","wwwwwbww","..www...","...ww..."]};
  SPRITE_DEFS.deadShrub = {"palette":{"b":"#332","d":"#221"},"data":["........","........","...b....","..b.b...","..bb.b..",".dbbd.b.",".bbdbb..",".ddbdd.."]};
    SPRITE_DEFS.witheredTree = {"palette":{"d":"#403a45","D":"#302a35","p":"#504a55","b":"#222"},"data":["...b....","..bbb...","..b.bb..",".bbb....","..bbbb..","...bb...","...bb...","...bb..."]};
  SPRITE_DEFS.geodeBlue = {"palette":{"b":"#052a4a","l":"#4df","c":"#153a5a"},"data":["........","..bb....",".bcclb..",".bcllb..","..bcbb..","...b....","........","........"]};
    SPRITE_DEFS.tile_void = {"palette":{"B":"#04040a","b":"#0b0b1a","p":"#16122e","P":"#291e4a","w":"#ffffff","s":"#88aaff"},"data":["pPPPPPPPPppbbbBB","pPPPPPPPPppbbbbB","PPPPPPPPPppbbbbb","wPPPPPPPpppbbbbb","pPPPPPPpppbbbbbb","ppPPPppwpbbbbbbb","pppppppbbbbbbbbb","bpppbbbbbbbbbbbb","bbbbbbbBBBBBwbbb","bbwbBBBBBBBBBbbb","bbbBBBBBBBBBBBwb","bbBBBBBBBBBBBBbb","bBwBBBBBBBBBBBbb","bBBBBBBBwBBBBBbb","bBBBBBBBBBBBBBbb","bbBBBBBBBBBBBbbb"]};
  SPRITE_DEFS.tile_cave = {"palette":{"c":"#3a3a3a"},"data":["cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc","cccccccccccccccc"]};
  const ATLAS_SLOT=20,ATLAS_COLS=8,ATLAS_PAD=1;

const baseCaveData = ["....LLLL....","..LLSSSSLL..",".LSSSSSSSSL.","LSSSSSSSSSSL","SSSSSRRRSSSS","SSSSRKKKRSSS","SSSRKKKKKRSS","SSSRKKKKKRSS","SSSSRKKKRSSS","SSSSSMMSSSSS","SSSSSSSSSSSS","..SSSSSSSS.."];
SPRITE_DEFS.caveDesert = { palette: {"S":"#d9a066","L":"#ffcc99","R":"#a67340","K":"#111612","M":"#593a20"}, data: baseCaveData };
SPRITE_DEFS.caveSnow = { palette: {"S":"#cceeff","L":"#ffffff","R":"#99bbdd","K":"#111612","M":"#334455"}, data: baseCaveData };
SPRITE_DEFS.caveVolcano = { palette: {"S":"#2a1a1a","L":"#4a2a2a","R":"#1a0f0f","K":"#ffaa00","M":"#cc4400"}, data: baseCaveData };
SPRITE_DEFS.caveSwamp = { palette: {"S":"#3d4a2d","L":"#63754e","R":"#242b1a","K":"#0a0d07","M":"#191e12"}, data: baseCaveData };
SPRITE_DEFS.caveMagic = { palette: {"S":"#8e70a8","L":"#bda8cf","R":"#58436e","K":"#1a1224","M":"#3b2a4d"}, data: baseCaveData };
SPRITE_DEFS.caveDeadlands = { palette: {"S":"#4a3a4a","L":"#6a5a6a","R":"#2a1a2a","K":"#000000","M":"#1a0a1a"}, data: baseCaveData };


const dwarfData1 = ["....LLLL....","...LSSSSL...","..LRRSSRRL..","..LKKSSKKL..","..LSSSSSSL..",".MMMWMWWMMM.","..MMWWWWMM..","..MMWWWWMM..","...MWWWWM...","...MWWWWM...","...KK..KK...","...KK..KK..."];
const dwarfData2 = ["...LLLLLL...","..LSSSSSSL..",".LRRRSSRRRL.",".LKKKSSKKKL.",".LSSSSSSSSL.","MMMMWWWWMMMM","..MMWWWWMM..","..MMWWWWMM..","...MWWWWM...","...MWWWWM...","...KK..KK...","...KK..KK..."];
const dwarfData3 = [".....LL.....","....LLLL....","...LSSSSL...","..LRRSSRRL..","..LKKSSKKL..","..LSSSSSSL..",".MMMMMMMMMM.","..MMWWWWMM..","..MMWWWWMM..","...MWWWWM...","...KK..KK...","...KK..KK..."];
SPRITE_DEFS.corruptDwarf1 = { palette: {"S":"#ffcccc","L":"#444444","R":"#aa2222","K":"#111111","M":"#222222","W":"#aa0000"}, data: dwarfData1 };
SPRITE_DEFS.corruptDwarf2 = { palette: {"S":"#ffcccc","L":"#222222","R":"#aa2222","K":"#111111","M":"#111111","W":"#880000"}, data: dwarfData2 };
SPRITE_DEFS.corruptDwarf3 = { palette: {"S":"#ffcccc","L":"#662288","R":"#aa2222","K":"#111111","M":"#331144","W":"#aa00aa"}, data: dwarfData3 };


const pickaxeData = [".......SS...","......SLLS..",".....SLLKLS.","....SLKRRKLS",".....KKRKK..","......KWK...",".....KWK....","....KWK.....","...KWK......","..KWK.......",".KWK........","WW.........."];
SPRITE_DEFS.rpg_pickaxe = { palette: {"S":"#888888","L":"#bbbbbb","K":"#222222","R":"#555555","W":"#8b4513"}, data: pickaxeData };
SPRITE_DEFS.rpg_pickaxe_bronze = { palette: {"S":"#8a5a2b","L":"#c48a4a","K":"#222222","R":"#6b3f18","W":"#5d4037"}, data: pickaxeData };
SPRITE_DEFS.rpg_pickaxe_metal = { palette: {"S":"#9aa4b2","L":"#e8eef8","K":"#1a1a22","R":"#5c6b7a","W":"#3e2723"}, data: pickaxeData };
const torchData = ["....FF.....","...FFF....","..WWWW....","..WWWW....","..WWWW....","..WKKW....","..KKKK....","..KKKK....","..KKKK....","..WWWW....","..WWWW....","..WWWW...."];
SPRITE_DEFS.rpg_torch = { palette: {"F":"#ffaa00","W":"#8b4513","K":"#444444"}, data: torchData };

// Material Sprites (Phase 1)
SPRITE_DEFS.rpg_voidEssence = { palette: {"K":"#0a0014","V":"#38006b","P":"#7b1fa2","L":"#ba68c8","W":"#ffffff"}, data: ["...KKK...","..KVLLK..",".KVWLLPK.","KVWWWLLPK","KVWLLLLPK",".KVLLLPK.","..KPPPK..","...KKK..."] };
SPRITE_DEFS.rpg_phoenixFeather = { palette: {"K":"#2b0700","R":"#c62828","O":"#ff6f00","Y":"#ffd54f","W":"#fff9c4"}, data: [".....WW.","....WYY.","...WOYY.","..ROYY..","..ROYY..",".RROO...","..RRK...","..KK...."] };
SPRITE_DEFS.rpg_frozenCore = { palette: {"K":"#001020","B":"#0d47a1","C":"#00e5ff","L":"#80d8ff","W":"#ffffff"}, data: ["...KK...","..KWWK..",".KCWWCK.","KBCCCWWK","KBCCCWWK",".KBBCCK.","..KBBK..","...KK..."] };
SPRITE_DEFS.rpg_ancientBark = { palette: {"K":"#1a1005","B":"#3e2723","L":"#5d4037","G":"#2e7d32","M":"#81c784"}, data: ["..KKK...",".KBBBLK.","KBMGLLBK","KBGLMGBK","KBLGGMBK","KBBLLLBM",".KBBLBK.","..KKK..."] };
SPRITE_DEFS.rpg_dwarvenSteel = { palette: {"K":"#11161b","S":"#37474f","M":"#78909c","L":"#cfd8dc","O":"#ff9800"}, data: [".KKKKKK.","KLMLLLMK","KLSSSSMK","KLSOMSMK","KLSOMSMK","KLSSSSMK","KMMMMMMK",".KKKKKK."] };
SPRITE_DEFS.rpg_cosmicDust = { palette: {"K":"#0a001a","P":"#4a148c","M":"#ab47bc","C":"#00e5ff","W":"#ffffff"}, data: ["...W....",".W.P.C..","..PMPW..","WPMWMP.W","..PMPW..",".C.P.W..","....W...","........"] };
SPRITE_DEFS.rpg_abyssalHeart = { palette: {"K":"#020b14","B":"#0d47a1","T":"#00e5ff","D":"#1a237e","W":"#e0f7fa"}, data: ["...KKK...","..KTTTK..",".KTTWTTK.","KTWWTTTDK","KTWWTTTDK",".KTTTTDK.","..KDDDDK.","...KKK..."] };
const ATLAS=(()=>{
  const names=Object.keys(SPRITE_DEFS);
  const rows=Math.ceil(names.length/ATLAS_COLS);
  const slot=ATLAS_SLOT+ATLAS_PAD*2;
  const c=document.createElement('canvas');
  c.width=ATLAS_COLS*slot;c.height=rows*slot;
  const cx=c.getContext('2d');
  const regions={};
  names.forEach((name,i)=>{
    const def=SPRITE_DEFS[name];
    const h=def.data.length,w=Math.max(...def.data.map(row=>row.length));
    const ox=(i%ATLAS_COLS)*slot+ATLAS_PAD;
    const oy=Math.floor(i/ATLAS_COLS)*slot+ATLAS_PAD;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const ch=def.data[y][x];
      if(ch===undefined||ch==='.'||ch===' ')continue;
      cx.fillStyle=def.palette[ch]||'#f0f';
      cx.fillRect(ox+x,oy+y,1,1);
    }
    regions[name]={x:ox,y:oy,w,h};
  });
  return {canvas:c,regions};
})();
if (window.TREE_DIMS) {
  for (const [name, dims] of Object.entries(window.TREE_DIMS)) {
    ATLAS.regions[name] = { x: 0, y: 0, w: dims.w, h: dims.h, isTree: true, padBottom: dims.padBottom, scale: dims.scale };
  }
}
if (window.TREE_ALIASES) {
  for (const [alias, real] of Object.entries(window.TREE_ALIASES)) {
    if (ATLAS.regions[real] && !ATLAS.regions[alias]) {
      ATLAS.regions[alias] = { ...ATLAS.regions[real] };
    }
  }
}

// ═══════════════════════════════════════════════════════════
// WEAPON BULLET SPRITES (High-res cropped weapon projectiles)
// ═══════════════════════════════════════════════════════════
// Fire Aura & Terrain Fire animated frames (5 frames)
const FIRE_AURA_FILES = [
  'assets/weapon bullets/fire_aura.webp?v200',
  'assets/weapon bullets/fire_aura2.webp?v200',
  'assets/weapon bullets/fire_aura3.webp?v200',
  'assets/weapon bullets/fire_aura4.webp?v200',
  'assets/weapon bullets/fire_aura5.webp?v200'
];
const FIRE_AURA_FRAMES = FIRE_AURA_FILES.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});
window.FIRE_AURA_FRAMES = FIRE_AURA_FRAMES;

export const WEAPON_BULLET_SPRITES = {};
const WEAPON_BULLET_FILES = {
  arcane_bolt:    'assets/weapon bullets/arcane_bolt.webp?v200',
  throwing_knife: 'assets/weapon bullets/throwing_knife.webp?v200',
  garlic_aura:    'assets/weapon bullets/garlic_aura.webp?v200',
  fire_aura:      'assets/weapon bullets/fire_aura.webp?v200',
  fire_aura2:     'assets/weapon bullets/fire_aura2.webp?v200',
  fire_aura3:     'assets/weapon bullets/fire_aura3.webp?v200',
  fire_aura4:     'assets/weapon bullets/fire_aura4.webp?v200',
  fire_aura5:     'assets/weapon bullets/fire_aura5.webp?v200',
  fireball:       'assets/weapon bullets/fireball.webp?v200',
  boomerang:      'assets/weapon bullets/boomerang.webp?v200',
  lightning_orb:  'assets/weapon bullets/lightning_orb.webp?v200',
  arrow:          'assets/weapon bullets/arrow.webp?v200',
  orbiting_orb:   'assets/weapon bullets/orbiting_orb.webp?v200',
  mine:           'assets/weapon bullets/mine.webp?v200',
  mine_explosion: 'assets/weapon bullets/mine_explosion_spritesheet.webp?v329',
  green_blood:    'assets/weapon bullets/green_blood_spritesheet.webp?v331',
  red_blood:      'assets/weapon bullets/red_blood_spritesheet.webp?v331',
  holy_water:     'assets/weapon bullets/holy_water.webp?v200',
  crossbow_bolt:  'assets/weapon bullets/crossbow_bolt.webp?v200',
  frost_shard:    'assets/weapon bullets/frost_shard.webp?v200',
  goblin_bomb:    'assets/weapon bullets/goblin_bomb.webp?v200',
  spear:          'assets/weapon bullets/spear.webp?v200',
  spirit:         'assets/weapon bullets/spirit.webp?v200',
  void_rift:      'assets/weapon bullets/void_rift.webp?v200'
};
const WEAPON_BULLET_ALIASES = {
  bolt: 'arcane_bolt',
  knife: 'throwing_knife',
  garlic: 'garlic_aura',
  holyFlask: 'holy_water',
  orb: 'orbiting_orb',
  rpg_wisp: 'spirit'
};
for (const [key, src] of Object.entries(WEAPON_BULLET_FILES)) {
  const img = new Image();
  img.src = src;
  WEAPON_BULLET_SPRITES[key] = img;
}
for (const [alias, target] of Object.entries(WEAPON_BULLET_ALIASES)) {
  WEAPON_BULLET_SPRITES[alias] = WEAPON_BULLET_SPRITES[target];
}
WEAPON_BULLET_SPRITES['warhammer'] = warhammerProjImg;
WEAPON_BULLET_SPRITES['chainWhip'] = chainWhipIconImg;
WEAPON_BULLET_SPRITES['elvenBow'] = elvenBowIconImg;
window.WEAPON_BULLET_SPRITES = WEAPON_BULLET_SPRITES;


// === UI ICONS: WEATHER, BIOMES, FIELD CONDITIONS ===
const WEATHER_ICON_PATHS = {
  clear: 'assets/weather icons/Clear.webp',
  rain: 'assets/weather icons/Rain.webp',
  snow: 'assets/weather icons/Snow.webp',
  storm: 'assets/weather icons/Storm.webp',
  day: 'assets/weather icons/day.webp',
  midday: 'assets/weather icons/day.webp',
  dusk: 'assets/weather icons/Night.webp',
  night: 'assets/weather icons/Night.webp',
  bloodMoon: 'assets/weather icons/blood_moon.webp',
  timeless: 'assets/weather icons/The_Void.webp',
  ethereal: 'assets/weather icons/Dream_Biome.webp',
  submerged: 'assets/weather icons/The_Abyss.webp'
};

const BIOME_ICON_PATHS = {
  plains: 'assets/weather icons/Plains.webp',
  forest: 'assets/weather icons/Forest.webp',
  magicForest: 'assets/weather icons/Magic_Forest.webp',
  desert: 'assets/weather icons/Desert.webp',
  snow: 'assets/weather icons/Snowfield.webp',
  swamp: 'assets/weather icons/Swamp.webp',
  volcano: 'assets/weather icons/Volcano.webp',
  badlands: 'assets/weather icons/Badlands.webp',
  fungalWastes: 'assets/weather icons/Fungal_Wastes.webp',
  deadlands: 'assets/weather icons/Graveyard.webp',
  crystalWastes: 'assets/weather icons/The_Void.webp',
  abyss: 'assets/weather icons/The_Abyss.webp',
  dimensionX: 'assets/weather icons/The_Void.webp',
  undergroundCave: 'assets/weather icons/Underground.webp',
  dwarfCity: 'assets/weather icons/Underground.webp',
  underground: 'assets/weather icons/Underground.webp',
  depths: 'assets/weather icons/Underground.webp',
  dream: 'assets/weather icons/Dream_Biome.webp'
};

const FIELD_CONDITION_ICON_PATHS = {
  compass: 'assets/weather icons/Safe_Zone.webp',
  safeZone: 'assets/weather icons/Safe_Zone.webp',
  relicDetected: 'assets/weather icons/Relic_Detected.webp',
  relic: 'assets/weather icons/Relic_Detected.webp',
  bloodMoon: 'assets/weather icons/Blood Moon_Cursed.webp',
  cursed: 'assets/weather icons/Blood Moon_Cursed.webp',
  night: 'assets/weather icons/Night.webp',
  storm: 'assets/weather icons/Storm_hazard.webp',
  stormHazard: 'assets/weather icons/Storm_hazard.webp',
  flood: 'assets/weather icons/Flood.webp',
  water: 'assets/weather icons/Flood.webp',
  fire: 'assets/weather icons/Fire.webp',
  burning: 'assets/weather icons/Fire.webp',
  poison: 'assets/weather icons/Poison.webp',
  swampPoison: 'assets/weather icons/Poison.webp',
  frozen: 'assets/weather icons/Frozen.webp',
  slowed: 'assets/weather icons/Slowed.webp',
  shielded: 'assets/weather icons/Shielded.webp',
  bossNearby: 'assets/weather icons/Boss_Nearby.webp',
  boss: 'assets/weather icons/Boss_Nearby.webp',
  fastPredators: 'assets/weather icons/Fast_Predators.webp',
  predators: 'assets/weather icons/Fast_Predators.webp'
};

const WEATHER_ICONS = {};
for (const [k, p] of Object.entries(WEATHER_ICON_PATHS)) {
  const img = new Image(); img.src = p; WEATHER_ICONS[k] = img;
}

const BIOME_ICONS = {};
for (const [k, p] of Object.entries(BIOME_ICON_PATHS)) {
  const img = new Image(); img.src = p; BIOME_ICONS[k] = img;
}

const FIELD_CONDITION_ICONS = {};
for (const [k, p] of Object.entries(FIELD_CONDITION_ICON_PATHS)) {
  const img = new Image(); img.src = p; FIELD_CONDITION_ICONS[k] = img;
}

window.WEATHER_ICONS = WEATHER_ICONS;
window.BIOME_ICONS = BIOME_ICONS;
window.FIELD_CONDITION_ICONS = FIELD_CONDITION_ICONS;

const UPGRADE_ICON_PATHS = {
  // Equipment (4)
  amulet: 'assets/UPGRADES ICONS/Amulet_of_Vigor.webp',
  helmet: 'assets/UPGRADES ICONS/Iron_Helmet.webp',
  ring: 'assets/UPGRADES ICONS/Ring_of_Power.webp',
  boots: 'assets/UPGRADES ICONS/Water_Boots.webp',

  // Stat Upgrades (6)
  heal: 'assets/UPGRADES ICONS/Full_Heal.webp',
  maxHp: 'assets/UPGRADES ICONS/Max_HP.webp',
  speed: 'assets/UPGRADES ICONS/Move_Speed.webp',
  pickup: 'assets/UPGRADES ICONS/Pickup_Range.webp',
  regen: 'assets/UPGRADES ICONS/Regen.webp',
  cd: 'assets/UPGRADES ICONS/Weapon_cooldown.webp',

  // Weapons (6)
  boomerang: 'assets/UPGRADES ICONS/Boomerang.webp',
  chain: 'assets/UPGRADES ICONS/Chain_Lightning.webp',
  aura: 'assets/UPGRADES ICONS/Fire_Aura.webp',
  garlic: 'assets/UPGRADES ICONS/Garlic_Ward.webp',
  knife: 'assets/UPGRADES ICONS/Throwing_Knife.webp',
  wand: 'assets/UPGRADES ICONS/magic_wand.webp',
  orcCleaver: 'characters/ORK/ruk main weapon/ruk_main_weapon_icon.webp',
  warhammer: 'assets/weapons/warhammer_icon.webp',
  chainWhip: 'assets/weapons/chain_whip_icon.webp',
  elvenBow: 'assets/weapons/elven_bow_icon.webp',
  fireBreath: 'characters/KNIGHT/fire_breath_weapon_anim/icon.webp',
  dragonInferno: 'characters/KNIGHT/fire_breath_weapon_anim/icon.webp',
  tome: 'assets/UPGRADES ICONS/Summoners_Tomb.webp',
  necromancerGrimoire: 'assets/UPGRADES ICONS/Summoners_Tomb.webp',

  // Run Upgrades (24)
  banish: 'assets/UPGRADES ICONS/Banish.webp',
  berserker: 'assets/UPGRADES ICONS/Berserker.webp',
  bloodPact: 'assets/UPGRADES ICONS/Blood_Pact.webp',
  force: 'assets/UPGRADES ICONS/Brute_Force.webp',
  cardDraw: 'assets/UPGRADES ICONS/Card_Draw.webp',
  companionBond: 'assets/UPGRADES ICONS/Companion_Bond.webp',
  crit: 'assets/UPGRADES ICONS/Critical_Strike.webp',
  ember: 'assets/UPGRADES ICONS/Ember_Touch.webp',
  dodge: 'assets/UPGRADES ICONS/Evasion.webp',
  execute: 'assets/UPGRADES ICONS/Executioner.webp',
  frost: 'assets/UPGRADES ICONS/Frostbite.webp',
  glassCannon: 'assets/UPGRADES ICONS/Glass_Cannon.webp',
  lifesteal: 'assets/UPGRADES ICONS/Lifesteal.webp',
  luck: 'assets/UPGRADES ICONS/Lucky.webp',
  magnifier: 'assets/UPGRADES ICONS/Magnifier.webp',
  persistent: 'assets/UPGRADES ICONS/Persistent.webp',
  pierce: 'assets/UPGRADES ICONS/Piercing_Shots.webp',
  projSpeed: 'assets/UPGRADES ICONS/Rapid_Fire.webp',
  reroll: 'assets/UPGRADES ICONS/Reroll.webp',
  ricochet: 'assets/UPGRADES ICONS/Ricochet.webp',
  critDmg: 'assets/UPGRADES ICONS/Sharpened_Edge.webp',
  shieldGen: 'assets/UPGRADES ICONS/Shield Generator.webp',
  thorns: 'assets/UPGRADES ICONS/Thorns.webp',
  wideArc: 'assets/UPGRADES ICONS/Wide_Arc.webp',

  // Aliases by exact filenames and original names
  'Amulet_of_Vigor': 'assets/UPGRADES ICONS/Amulet_of_Vigor.webp',
  'Iron_Helmet': 'assets/UPGRADES ICONS/Iron_Helmet.webp',
  'Ring_of_Power': 'assets/UPGRADES ICONS/Ring_of_Power.webp',
  'Water_Boots': 'assets/UPGRADES ICONS/Water_Boots.webp',
  'Full_Heal': 'assets/UPGRADES ICONS/Full_Heal.webp',
  'Max_HP': 'assets/UPGRADES ICONS/Max_HP.webp',
  'Move_Speed': 'assets/UPGRADES ICONS/Move_Speed.webp',
  'Pickup_Range': 'assets/UPGRADES ICONS/Pickup_Range.webp',
  'Regen': 'assets/UPGRADES ICONS/Regen.webp',
  'Weapon_cooldown': 'assets/UPGRADES ICONS/Weapon_cooldown.webp',
  'Boomerang': 'assets/UPGRADES ICONS/Boomerang.webp',
  'Chain_Lightning': 'assets/UPGRADES ICONS/Chain_Lightning.webp',
  'lightning_orb': 'assets/UPGRADES ICONS/Chain_Lightning.webp',
  'Fire_Aura': 'assets/UPGRADES ICONS/Fire_Aura.webp',
  'Garlic_Ward': 'assets/UPGRADES ICONS/Garlic_Ward.webp',
  'garlic_aura': 'assets/UPGRADES ICONS/Garlic_Ward.webp',
  'Throwing_Knife': 'assets/UPGRADES ICONS/Throwing_Knife.webp',
  'throwing_knife': 'assets/UPGRADES ICONS/Throwing_Knife.webp',
  'magic_wand': 'assets/UPGRADES ICONS/magic_wand.webp',
  'Summoners_Tomb': 'assets/UPGRADES ICONS/Summoners_Tomb.webp',
  'Summoners_Tome': 'assets/UPGRADES ICONS/Summoners_Tomb.webp',
  'summoners_tomb': 'assets/UPGRADES ICONS/Summoners_Tomb.webp',
  'summoners_tome': 'assets/UPGRADES ICONS/Summoners_Tomb.webp',
  'rpg_tome_magic': 'assets/UPGRADES ICONS/Summoners_Tomb.webp',
  'Banish': 'assets/UPGRADES ICONS/Banish.webp',
  'Berserker': 'assets/UPGRADES ICONS/Berserker.webp',
  'Blood_Pact': 'assets/UPGRADES ICONS/Blood_Pact.webp',
  'Brute_Force': 'assets/UPGRADES ICONS/Brute_Force.webp',
  'Card_Draw': 'assets/UPGRADES ICONS/Card_Draw.webp',
  'Companion_Bond': 'assets/UPGRADES ICONS/Companion_Bond.webp',
  'Critical_Strike': 'assets/UPGRADES ICONS/Critical_Strike.webp',
  'Ember_Touch': 'assets/UPGRADES ICONS/Ember_Touch.webp',
  'Evasion': 'assets/UPGRADES ICONS/Evasion.webp',
  'Executioner': 'assets/UPGRADES ICONS/Executioner.webp',
  'Frostbite': 'assets/UPGRADES ICONS/Frostbite.webp',
  'Glass_Cannon': 'assets/UPGRADES ICONS/Glass_Cannon.webp',
  'Lifesteal': 'assets/UPGRADES ICONS/Lifesteal.webp',
  'Lucky': 'assets/UPGRADES ICONS/Lucky.webp',
  'Magnifier': 'assets/UPGRADES ICONS/Magnifier.webp',
  'Persistent': 'assets/UPGRADES ICONS/Persistent.webp',
  'Piercing_Shots': 'assets/UPGRADES ICONS/Piercing_Shots.webp',
  'Rapid_Fire': 'assets/UPGRADES ICONS/Rapid_Fire.webp',
  'Reroll': 'assets/UPGRADES ICONS/Reroll.webp',
  'Ricochet': 'assets/UPGRADES ICONS/Ricochet.webp',
  'Sharpened_Edge': 'assets/UPGRADES ICONS/Sharpened_Edge.webp',
  'Shield Generator': 'assets/UPGRADES ICONS/Shield Generator.webp',
  'Shield_Generator': 'assets/UPGRADES ICONS/Shield Generator.webp',
  'Thorns': 'assets/UPGRADES ICONS/Thorns.webp',
  'Wide_Arc': 'assets/UPGRADES ICONS/Wide_Arc.webp'
};

const UPGRADE_ICON_BBOXES = {
  amulet: [307, 0, 717, 511],
  helmet: [273, 48, 701, 536],
  ring: [298, 74, 726, 519],
  boots: [281, 65, 726, 502],
  heal: [341, 65, 717, 493],
  maxHp: [289, 108, 735, 493],
  speed: [281, 40, 785, 502],
  pickup: [298, 57, 734, 502],
  regen: [289, 65, 735, 511],
  cd: [273, 57, 743, 528],
  orcCleaver: [0, 0, 204, 299],
  warhammer: [0, 0, 333, 303],
  chainWhip: [0, 0, 333, 303],
  elvenBow: [0, 0, 333, 303],
  fireBreath: [0, 0, 333, 303],
  dragonInferno: [0, 0, 333, 303],
  boomerang: [267, 83, 760, 493],
  chain: [281, 40, 743, 536],
  lightning_orb: [281, 40, 743, 536],
  aura: [289, 65, 735, 511],
  garlic: [289, 49, 735, 528],
  garlic_aura: [289, 49, 735, 528],
  knife: [273, 48, 751, 519],
  throwing_knife: [273, 48, 751, 519],
  wand: [273, 48, 751, 528],
  tome: [264, 74, 751, 511],
  necromancerGrimoire: [264, 74, 751, 511],
  banish: [272, 40, 752, 528],
  berserker: [281, 48, 743, 519],
  bloodPact: [196, 40, 820, 536],
  force: [273, 57, 751, 511],
  cardDraw: [213, 40, 785, 536],
  companionBond: [273, 74, 752, 519],
  crit: [289, 65, 735, 511],
  ember: [289, 65, 734, 519],
  dodge: [273, 57, 751, 519],
  execute: [230, 57, 777, 519],
  frost: [281, 57, 751, 502],
  glassCannon: [238, 74, 786, 536],
  lifesteal: [341, 65, 683, 493],
  luck: [281, 48, 744, 528],
  magnifier: [281, 49, 760, 528],
  persistent: [281, 14, 751, 553],
  pierce: [264, 48, 768, 519],
  projSpeed: [256, 74, 760, 528],
  reroll: [264, 74, 768, 519],
  ricochet: [264, 83, 743, 502],
  critDmg: [307, 65, 716, 492],
  shieldGen: [298, 40, 726, 536],
  thorns: [281, 65, 743, 511],
  wideArc: [281, 57, 735, 511],

  'Amulet_of_Vigor': [307, 0, 717, 511],
  'Iron_Helmet': [273, 48, 701, 536],
  'Ring_of_Power': [298, 74, 726, 519],
  'Water_Boots': [281, 65, 726, 502],
  'Full_Heal': [341, 65, 717, 493],
  'Max_HP': [289, 108, 735, 493],
  'Move_Speed': [281, 40, 785, 502],
  'Pickup_Range': [298, 57, 734, 502],
  'Regen': [289, 65, 735, 511],
  'Weapon_cooldown': [273, 57, 743, 528],
  'Boomerang': [267, 83, 760, 493],
  'Chain_Lightning': [281, 40, 743, 536],
  'Fire_Aura': [289, 65, 735, 511],
  'Garlic_Ward': [289, 49, 735, 528],
  'Throwing_Knife': [273, 48, 751, 519],
  'magic_wand': [273, 48, 751, 528],
  'Summoners_Tomb': [264, 74, 751, 511],
  'Summoners_Tome': [264, 74, 751, 511],
  'summoners_tomb': [264, 74, 751, 511],
  'summoners_tome': [264, 74, 751, 511],
  'rpg_tome_magic': [264, 74, 751, 511],
  'Banish': [272, 40, 752, 528],
  'Berserker': [281, 48, 743, 519],
  'Blood_Pact': [196, 40, 820, 536],
  'Brute_Force': [273, 57, 751, 511],
  'Card_Draw': [213, 40, 785, 536],
  'Companion_Bond': [273, 74, 752, 519],
  'Critical_Strike': [289, 65, 735, 511],
  'Ember_Touch': [289, 65, 734, 519],
  'Evasion': [273, 57, 751, 519],
  'Executioner': [230, 57, 777, 519],
  'Frostbite': [281, 57, 751, 502],
  'Glass_Cannon': [238, 74, 786, 536],
  'Lifesteal': [341, 65, 683, 493],
  'Lucky': [281, 48, 744, 528],
  'Magnifier': [281, 49, 760, 528],
  'Persistent': [281, 14, 751, 553],
  'Piercing_Shots': [264, 48, 768, 519],
  'Rapid_Fire': [256, 74, 760, 528],
  'Reroll': [264, 74, 768, 519],
  'Ricochet': [264, 83, 743, 502],
  'Sharpened_Edge': [307, 65, 716, 492],
  'Shield Generator': [298, 40, 726, 536],
  'Shield_Generator': [298, 40, 726, 536],
  'Thorns': [281, 65, 743, 511],
  'Wide_Arc': [281, 57, 735, 511]
};

const UPGRADE_ICONS = {};
for (const [k, p] of Object.entries(UPGRADE_ICON_PATHS)) {
  const img = new Image();
  img.src = p;
  UPGRADE_ICONS[k] = { img, bbox: UPGRADE_ICON_BBOXES[k] || [0, 0, 1024, 572], src: p };
}

window.UPGRADE_ICONS = UPGRADE_ICONS;


export {
  MOUNTAIN_TILES,
  MOUNTAIN_TILE_IMAGES,
  MOUNTAIN_BIOME_ASSETS,
  MOUNTAIN_MOBS_ASSETS,
  CHICKEN_ASSETS,
  TRINKET_RELIC_ICONS,
  FIRE_AURA_FRAMES,
  WEATHER_ICONS,
  BIOME_ICONS,
  FIELD_CONDITION_ICONS,
  UPGRADE_ICONS,
  rainbowStaffImg,
  frostStaffImg,
  monstersNewSheetImg,
  specialItemsSheetImg,
  inventoryDropsSheetImg,
  xpOrbImg,
  undergroundTilesetImg,
  undergroundObjectsImg,
  undergroundChestsImg,
  undergroundTrapsImg,
  undergroundCracksFloorImg,
  undergroundCracksWallsImg,
  dungeon1MapImg,
  dungeon1OverheadImg,
  SPRITE_DEFS,
  ATLAS
};
