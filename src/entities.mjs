// v95
export const ENEMY_SPEED_MULT = 0.52;
export const ENEMY_TYPES={
  dwarfMiner: { sprite: 'corruptDwarf1', w: 32, h: 32, speed: 1.2, hp: 45, damage: 15, xp: 12, knockbackResist: 0.3, eliteChance: 0.05, behavior: 'melee' },
  dwarfGuard: { sprite: 'corruptDwarf2', w: 40, h: 40, speed: 0.8, hp: 120, damage: 25, xp: 25, knockbackResist: 0.6, eliteChance: 0.1, behavior: 'melee' },
  dwarfRunesmith: { sprite: 'corruptDwarf3', w: 32, h: 40, speed: 1.0, hp: 75, damage: 20, xp: 18, knockbackResist: 0.4, eliteChance: 0.2, behavior: 'shoot' },

  bat:{hp:12,speed:1.7,damage:6,sprite:'bat',spriteVariants:['bat','rpg_bat_small','rpg_batFire','rpg_batIce'],w:28,h:22,xp:1,sizeRange:[.95,1.35]},
  zombie:{hp:40,speed:.9,damage:12,sprite:'zombie',spriteVariants:['zombie'],w:26,h:36,xp:2,sizeRange:[.82,1.2]},
  skeleton:{hp:25,speed:1.4,damage:9,sprite:'skeleton',spriteVariants:['skeleton','rpg_skeleton_small','rpg_skeletonWarrior'],w:24,h:34,xp:2,sizeRange:[.78,1.24]},
  skeletonArcher:{hp:34,speed:1.3,damage:11,sprite:'rpg_skeletonArcher',w:25,h:36,xp:3,sizeRange:[.84,1.18]},
  goblin:{hp:28,speed:1.8,damage:9,sprite:'rpg_goblin',w:26,h:32,xp:2,sizeRange:[.95,1.3]},
  snake:{hp:85,speed:1.95,damage:18,sprite:'rpg_snake',w:56,h:32,xp:6,sizeRange:[.92,1.2]},
  imp:{hp:38,speed:1.9,damage:12,sprite:'rpg_imp',w:26,h:30,xp:4,sizeRange:[.95,1.25]},
  giantMoth:{hp:58,speed:1.8,damage:14,sprite:'rpg_mothGiant',w:34,h:30,xp:5,sizeRange:[.86,1.18]},
  bandit:{hp:62,speed:1.45,damage:16,sprite:'rpg_banditRed',w:26,h:36,xp:5,sizeRange:[.84,1.18]},
  tiger:{hp:132,speed:1.65,damage:23,sprite:'rpg_tiger',w:42,h:32,xp:8,sizeRange:[.9,1.16]},
  panther:{hp:98,speed:2.2,damage:19,sprite:'rpg_panther',w:40,h:28,xp:7,sizeRange:[.86,1.18]},
  mantis:{hp:140,speed:1.85,damage:26,sprite:'rpg_mantis',w:52,h:52,xp:10,dasher:true,sizeRange:[.92,1.2]},
  eel:{hp:88,speed:1.75,damage:18,sprite:'rpg_eel',w:38,h:20,xp:6,water:true,sizeRange:[.86,1.18]},
  shadowDemon:{hp:112,speed:1.7,damage:24,sprite:'rpg_shadowDemon',w:34,h:38,xp:9,sizeRange:[.9,1.16]},
  voidSpirit:{hp:96,speed:1.35,damage:22,sprite:'rpg_voidSpirit',w:30,h:36,xp:9,sizeRange:[.84,1.2]},
  crow:{hp:14,speed:1.9,damage:7,sprite:'rpg_crow',w:28,h:24,xp:1,sizeRange:[.9,1.25]},
  beetle:{hp:30,speed:1.6,damage:10,sprite:'rpg_beetleGiant',w:32,h:28,xp:2,sizeRange:[.95,1.25]},
  antSoldier:{hp:30,speed:1.55,damage:11,sprite:'rpg_antSoldier',w:26,h:28,xp:2,sizeRange:[.9,1.25]},
  direWolf:{hp:36,speed:2.3,damage:12,sprite:'rpg_direWolf',w:34,h:25,xp:3,sizeRange:[.86,1.2]},
  ghostBat:{hp:14,speed:2.0,damage:7,sprite:'rpg_batGhost',w:28,h:22,xp:1,sizeRange:[.95,1.25]},
  airSprite:{hp:28,speed:2.4,damage:9,sprite:'rpg_airSprite',w:26,h:32,xp:2,sizeRange:[.95,1.25]},
  natureSprite:{hp:48,speed:1.6,damage:14,sprite:'rpg_natureSpirit',w:28,h:34,xp:3,sizeRange:[.95,1.25]},
  scarab:{hp:30,speed:1.65,damage:9,sprite:'rpg_beetleGiant',w:32,h:28,xp:2,sizeRange:[.95,1.25]},
  centipede:{hp:30,speed:2.2,damage:10,sprite:'rpg_centipede',w:32,h:22,xp:2,sizeRange:[.95,1.25]},
  sandKnight:{hp:31,speed:1.2,damage:11,sprite:'rpg_skeletonWarrior',w:26,h:36,xp:2,sizeRange:[.82,1.18]},
  frostWolf:{hp:36,speed:2.2,damage:11,sprite:'rpg_wolfWhite',w:32,h:24,xp:3,sizeRange:[.84,1.2]},
  iceSlime:{hp:42,speed:.9,damage:9,sprite:'rpg_slimeIce',w:32,h:28,xp:2,sizeRange:[.95,1.35]},
  iceBat:{hp:14,speed:2.0,damage:7,sprite:'rpg_batIce',w:28,h:22,xp:1,sizeRange:[.95,1.25]},
  rotZombie:{hp:48,speed:.85,damage:14,sprite:'rpg_zombieRotting',w:28,h:38,xp:2,sizeRange:[.84,1.2]},
  bogCrab:{hp:50,speed:1.35,damage:14,sprite:'rpg_crabRed',w:30,h:24,xp:3,water:true,sizeRange:[.84,1.2]},
  mireWorm:{hp:34,speed:1.5,damage:10,sprite:'rpg_wormGiant',w:28,h:24,xp:3,sizeRange:[.9,1.25]},
  fireBat:{hp:14,speed:2.0,damage:7,sprite:'rpg_batFire',w:28,h:22,xp:1,sizeRange:[.95,1.25]},
  lavaSlime:{hp:42,speed:.9,damage:10,sprite:'rpg_slimeLava',w:32,h:28,xp:2,sizeRange:[.95,1.35]},
  hellBeetle:{hp:30,speed:1.7,damage:10,sprite:'rpg_beetleFire',w:28,h:24,xp:2,sizeRange:[.82,1.2]},
  ghost:{hp:65,speed:1.1,damage:15,sprite:'ghost',spriteVariants:['ghost','rpg_wraith','rpg_banshee','rpg_wisp'],w:26,h:30,xp:3,sizeRange:[.8,1.24]},
  wraith:{hp:78,speed:1.25,damage:17,sprite:'rpg_wraith',w:28,h:34,xp:4,sizeRange:[.8,1.24]},
  banshee:{hp:60,speed:1.55,damage:16,sprite:'rpg_banshee',w:26,h:34,xp:4,sizeRange:[.78,1.2]},
  wisp:{hp:24,speed:2.1,damage:8,sprite:'rpg_wisp',w:26,h:28,xp:2,sizeRange:[.9,1.35]},
  fairy:{hp:36,speed:1.85,damage:10,sprite:'rpg_fairy',w:26,h:28,xp:3,sizeRange:[.9,1.3]},
  wolf:{hp:30,speed:2.0,damage:10,sprite:'wolf',spriteVariants:['wolf','rpg_wolfGray','rpg_wolfBlack','rpg_wolfWhite'],w:30,h:22,xp:2,sizeRange:[.76,1.34]},
  bear:{hp:92,speed:.9,damage:18,sprite:'rpg_bear',w:42,h:32,xp:5,sizeRange:[.88,1.24]},
  boar:{hp:64,speed:1.65,damage:16,sprite:'rpg_boar',w:36,h:28,xp:4,sizeRange:[.82,1.3]},
  lion:{hp:110,speed:1.35,damage:20,sprite:'rpg_lion',w:40,h:32,xp:6,sizeRange:[.86,1.24]},
  spider:{hp:24,speed:1.9,damage:8,sprite:'rpg_spiderBlack',spriteVariants:['rpg_spiderBlack','rpg_spiderRed'],w:28,h:24,xp:2,sizeRange:[.9,1.35]},
  scorpion:{hp:42,speed:1.6,damage:12,sprite:'rpg_scorpionBrown',w:30,h:24,xp:3,sizeRange:[.78,1.3]},
  mummy:{hp:55,speed:.8,damage:14,sprite:'mummy',w:26,h:36,xp:3},
  slime:{hp:35,speed:1.0,damage:8,sprite:'slime',spriteVariants:['slime','rpg_slime_green','rpg_slime_blue','rpg_slimeRed','rpg_slimeToxic'],w:32,h:28,xp:2,sizeRange:[.95,1.35]},
  fireSprite:{hp:44,speed:1.8,damage:13,sprite:'rpg_fireSprite',w:28,h:34,xp:3,sizeRange:[.95,1.28]},
  iceSprite:{hp:48,speed:1.4,damage:12,sprite:'rpg_iceSprite',w:28,h:34,xp:3,sizeRange:[.95,1.26]},
  earthGolem:{hp:145,speed:.55,damage:22,sprite:'rpg_earthGolem',w:38,h:38,xp:7,sizeRange:[.9,1.2]},
  iceGolem:{hp:100,speed:.6,damage:18,sprite:'iceGolem',w:30,h:38,xp:4},
  fish:{hp:20,speed:2.4,damage:7,sprite:'fish',spriteVariants:['fish','rpg_fish_small','rpg_fishLarge','rpg_piranha'],w:28,h:22,xp:1,water:true,sizeRange:[.95,1.28]},
  shark:{hp:125,speed:1.55,damage:22,sprite:'rpg_shark',w:42,h:32,xp:7,water:true,sizeRange:[.86,1.25]},
  jellyfish:{hp:38,speed:1.1,damage:10,sprite:'rpg_jellyfish',w:28,h:30,xp:3,water:true,sizeRange:[.8,1.25]},
  redDrake:{hp:190,speed:1.45,damage:25,sprite:'rpg_dragon_red',w:48,h:42,xp:9,sizeRange:[.82,1.28]},
  blueDrake:{hp:205,speed:1.25,damage:24,sprite:'rpg_dragon_blue',w:50,h:42,xp:9,sizeRange:[.82,1.28]},
  crocodile:{hp:90,speed:1.2,damage:20,sprite:'crocodile',w:40,h:26,xp:5,water:true},
  vampire:{hp:55,speed:2.2,damage:14,sprite:'vampire',w:26,h:38,xp:4,night:true,drain:true},
  pharaoh:{hp:950,speed:.95,damage:32,sprite:'Pharaoh',w:102,h:106,xp:80,boss:true,sizeRange:[2.1,2.1]},
  iceTitan:{hp:1250,speed:.6,damage:34,sprite:'Ice_titan',w:100,h:84,xp:90,boss:true,freezeAura:true,sizeRange:[2.2,2.2]},
  treant:{hp:520,speed:.55,damage:20,sprite:'treant',w:48,h:56,xp:85,boss:false,ultraElite:true,elite:true,eliteName:'ANCIENT TREANT',summonMinions:'slime',sizeRange:[1.2,1.2]},
  swampHorror:{hp:1050,speed:.7,damage:28,sprite:'Swamp_Horror',w:96,h:74,xp:80,boss:true,poisonAura:true,sizeRange:[2.2,2.2]},
  bloodLord:{hp:1250,speed:.75,damage:34,sprite:'Blood_Lord',w:86,h:94,xp:95,boss:true,summonMinions:'plains_goblin',sizeRange:[2.2,2.2]},
  plainsBoss:{hp:1200,speed:.72,damage:34,sprite:'plains_boss',w:92,h:104,xp:95,boss:true,summonMinions:'plains_goblin',sizeRange:[2.2,2.2]},
  lichKing:{hp:1150,speed:.85,damage:36,sprite:'Lich_King',w:76,h:88,xp:90,boss:true,sizeRange:[2.2,2.2]},
  phoenix:{hp:1200,speed:1.35,damage:40,sprite:'Phoenix',w:76,h:88,xp:95,boss:true,sizeRange:[2.2,2.2]},
  vampireLord:{hp:1300,speed:1.3,damage:42,sprite:'Vampire_Lord',w:84,h:92,xp:120,boss:true,drain:true,isVampireLord:true,sizeRange:[2.2,2.2]},
        voidGod:{hp:4500,speed:0.8,damage:50,sprite:'Void_God',w:88,h:115,xp:1000,boss:true,summonMinions:'rpg_voidSpirit',sizeRange:[2.4,2.4]},
  swarm:{hp:150,speed:1.3,damage:8,sprite:'bat',w:80,h:80,xp:15,swarm:true,swarmCount:30,swarmRadius:60},
  crossSwarm:{hp:180,speed:1.1,damage:10,sprite:'crossSwarm',w:80,h:80,xp:20,swarm:true,swarmFormation:'cross',swarmCount:40,swarmRadius:70}, 
    plains_goblin:{hp:25,speed:1.4,damage:8,sprite:'rpg_goblin',w:26,h:28,xp:2,sizeRange:[0.95,1.25]},
    plains_brute:{hp:150,speed:0.7,damage:20,sprite:'rpg_stoneTitan',w:38,h:38,xp:10,sizeRange:[1.15,1.35]},
    forest_ent:{hp:200,speed:0.5,damage:25,sprite:'treant',w:42,h:50,xp:15,sizeRange:[1.15,1.35]},
    forest_sprite:{hp:15,speed:1.8,damage:5,sprite:'rpg_fairy',w:26,h:26,xp:1,sizeRange:[0.95,1.2]},
    magic_golem:{hp:250,speed:0.4,damage:30,sprite:'rpg_earthGolem',w:42,h:42,xp:18,sizeRange:[1.15,1.35]},
    magic_pixie:{hp:10,speed:2.2,damage:4,sprite:'rpg_fairy',w:26,h:26,xp:1,sizeRange:[0.95,1.2]},
    desert_worm:{hp:120,speed:1.1,damage:18,sprite:'rpg_snake',w:32,h:32,xp:8,sizeRange:[1.1,1.35]},
    desert_vulture:{hp:40,speed:1.6,damage:12,sprite:'rpg_crow',w:28,h:26,xp:4,sizeRange:[0.95,1.2]},
    snow_yeti:{hp:300,speed:0.6,damage:35,sprite:'rpg_bear',w:44,h:44,xp:20,sizeRange:[1.15,1.35]},
    snow_fox:{hp:35,speed:1.7,damage:10,sprite:'rpg_wolfWhite',w:30,h:28,xp:3,sizeRange:[0.95,1.2]},
    swamp_toad:{hp:60,speed:0.9,damage:15,sprite:'slime',w:30,h:30,xp:5,sizeRange:[1.0,1.25]},
    swamp_leech:{hp:20,speed:1.5,damage:8,sprite:'rpg_wormGiant',w:28,h:24,xp:2,sizeRange:[0.95,1.25]},
    volcano_hound:{hp:70,speed:1.8,damage:22,sprite:'rpg_beetleFire',w:32,h:32,xp:6,sizeRange:[1.0,1.25]},
    volcano_ash_zombie:{hp:180,speed:0.6,damage:28,sprite:'zombie',w:32,h:36,xp:12,sizeRange:[1.1,1.35]},
    crystal_crawler:{hp:140,speed:1.0,damage:20,sprite:'rpg_spider',w:34,h:34,xp:10,sizeRange:[1.1,1.3]},
    crystal_shardling:{hp:15,speed:2.0,damage:6,sprite:'rpg_wisp',w:26,h:26,xp:1,sizeRange:[0.95,1.2]},
    fungal_sporeling:{hp:25,speed:0.8,damage:5,sprite:'rpg_slime_green',w:28,h:26,xp:2,sizeRange:[0.95,1.25]},
    fungal_brute:{hp:220,speed:0.5,damage:30,sprite:'rpg_zombieGreen',w:38,h:38,xp:15,sizeRange:[1.15,1.35]},
    dead_knight:{hp:160,speed:0.9,damage:25,sprite:'rpg_skeleton_small',w:32,h:36,xp:12,sizeRange:[1.1,1.35]},
    dead_ghoul:{hp:45,speed:1.7,damage:15,sprite:'rpg_zombieRotting',w:28,h:28,xp:4,sizeRange:[0.8,1.1]},
    badlands_coyote:{hp:50,speed:1.6,damage:12,sprite:'wolf',w:30,h:30,xp:4,sizeRange:[0.9,1.1]},
    badlands_golem:{hp:280,speed:0.5,damage:35,sprite:'rpg_earthGolem',w:42,h:42,xp:18,sizeRange:[1.15,1.35]},
    void_crawler:{hp:90,speed:1.4,damage:18,sprite:'rpg_shadowDemon',w:32,h:32,xp:7,sizeRange:[0.9,1.2]},
    void_behemoth:{hp:500,speed:0.4,damage:50,sprite:'rpg_voidSpirit',w:48,h:48,xp:40,sizeRange:[1.25,1.5]},
    void_eye:{hp:30,speed:2.2,damage:10,sprite:'bat',w:28,h:24,xp:3,sizeRange:[0.95,1.25]},
    plains_archer:{hp:15,speed:1.1,damage:8,sprite:'rpg_banditRed',w:28,h:30,xp:3,sizeRange:[0.95,1.2],shooter:true,projSprite:'arrow',projSpeed:3,attackRate:3},
    forest_hunter:{hp:20,speed:1.0,damage:10,sprite:'rpg_rogue',w:26,h:26,xp:4,sizeRange:[0.8,1.0],shooter:true,projSprite:'arrow',projSpeed:3.5,attackRate:2.8},
    magic_mage:{hp:18,speed:0.8,damage:12,sprite:'rpg_wizard',w:26,h:26,xp:5,sizeRange:[0.9,1.1],shooter:true,projSprite:'arcane_bolt',projSpeed:2.5,attackRate:3.5},
    desert_spitter:{hp:25,speed:0.9,damage:15,sprite:'rpg_snake',w:28,h:28,xp:6,sizeRange:[0.9,1.2],shooter:true,projSprite:'rpg_potion_green',projSpeed:3,attackRate:3.2},
    snow_thrower:{hp:30,speed:0.7,damage:18,sprite:'rpg_earthGolem',w:32,h:32,xp:7,sizeRange:[1.1,1.3],shooter:true,projSprite:'rpg_iceSprite',projSpeed:2.5,attackRate:4},
    swamp_shaman:{hp:28,speed:0.8,damage:14,sprite:'rpg_mageRed',w:26,h:26,xp:6,sizeRange:[0.9,1.1],shooter:true,projSprite:'rpg_potion_green',projSpeed:2.8,attackRate:3.5},
    volcano_flinger:{hp:35,speed:0.9,damage:20,sprite:'rpg_demonRed',w:30,h:30,xp:8,sizeRange:[1.0,1.3],shooter:true,projSprite:'rpg_fireSprite',projSpeed:3.2,attackRate:3.0},
    crystal_weaver:{hp:40,speed:0.8,damage:16,sprite:'rpg_spider',w:30,h:30,xp:9,sizeRange:[1.1,1.3],shooter:true,projSprite:'rpg_gem_diamond',projSpeed:2.5,attackRate:3.8},
    fungal_lobber:{hp:45,speed:0.6,damage:22,sprite:'rpg_slime_green',w:34,h:34,xp:10,sizeRange:[1.1,1.3],shooter:true,projSprite:'rpg_potion_green',projSpeed:2.2,attackRate:4.2},
    dead_cultist:{hp:38,speed:0.8,damage:18,sprite:'rpg_lichKing',w:28,h:28,xp:9,sizeRange:[0.9,1.1],shooter:true,projSprite:'rpg_demon_skull',projSpeed:2.5,attackRate:3.5},
    badlands_slinger:{hp:35,speed:1.1,damage:15,sprite:'rpg_banditRed',w:26,h:26,xp:8,sizeRange:[0.8,1.0],shooter:true,projSprite:'rpg_coin_gold',projSpeed:4,attackRate:2.5},
    void_caster:{hp:80,speed:0.7,damage:30,sprite:'rpg_wraith',w:32,h:32,xp:15,sizeRange:[1.0,1.2],shooter:true,projSprite:'rpg_crystal_purple',projSpeed:3,attackRate:3.5},
    crystalGuardian:{hp:2000,speed:1.0,damage:34,sprite:'Crystal_Beholder',w:88,h:80,xp:85,boss:true,summonMinions:'rpg_wisp',sizeRange:[2.2,2.2]},
    sporeKing:{hp:680,speed:0.85,damage:19,sprite:'rpg_slime_green',w:46,h:46,xp:85,boss:false,ultraElite:true,elite:true,eliteName:'SPORE EMPEROR',summonMinions:'slime',sizeRange:[1.25,1.25]},
    graveLord:{hp:720,speed:1.1,damage:22,sprite:'rpg_wraith',w:42,h:48,xp:90,boss:false,ultraElite:true,elite:true,eliteName:'GRAVE TYRANT',summonMinions:'skeleton',sizeRange:[1.2,1.2]},
    banditWarlord:{hp:620,speed:1.25,damage:18,sprite:'rpg_banditRed',w:38,h:44,xp:75,boss:false,ultraElite:true,elite:true,eliteName:'WARLORD CHIEFTAIN',summonMinions:'bandit',sizeRange:[1.2,1.2]},
    // === UNDERGROUND PACK: new mobs (only safe additions) ===
    // Sprites for all six exist in SPRITE_DEFS (verified via ATLAS.regions).
    // NOTE: `size:1` is inert here — the spawner reads `sizeRange`, not `size`;
    // these fall back to the default sizeRange [.84,1.22]. Kept as specified.
    caveSpider:{sprite:'caveSpider',w:26,h:24,speed:1.9,damage:8,hp:32,xp:6,size:1},
    caveRat:{sprite:'caveRat',w:26,h:20,speed:2.1,damage:7,hp:28,xp:5,size:1},
  plagueRat:{sprite:'plagueRat',w:26,h:20,speed:1.85,damage:9,hp:32,xp:4,sizeRange:[0.9,1.25]},
    caveGhost:{sprite:'caveGhost',w:24,h:24,speed:1.5,damage:9,hp:35,xp:7,size:1},
    cursedSkull:{sprite:'cursedSkull',w:22,h:22,speed:1.7,damage:9,hp:38,xp:7,size:1},
    spiderling:{sprite:'spiderling',w:22,h:22,speed:1.6,damage:4,hp:14,xp:3,size:1},
    rockBeetle:{sprite:'rockBeetle',w:24,h:22,speed:1.2,damage:5,hp:20,xp:4,size:1},
    // === UNDERGROUND PACK: sprite-backed mobs for the 3-8 / 8-15 / 15+ tiers ===
    // Every `sprite` below already exists in SPRITE_DEFS (authored in pixel-atlas-studio-V2,
    // verified against ATLAS.regions before adding). These were the names the underground
    // spawn pools referenced but which had no ENEMY_TYPES entry, so the pools filtered to
    // empty and caves fell through to BIOME_SPAWNS.plains. Uses sizeRange (not `size`,
    // which the spawner ignores) so sizes actually vary.
    direBat:{sprite:'direBat',w:30,h:22,speed:2.05,damage:8,hp:16,xp:2,sizeRange:[.86,1.22]},
    ghostWisp:{sprite:'ghostWisp',w:22,h:24,speed:1.9,damage:8,hp:26,xp:2,sizeRange:[.8,1.26]},
    caveGoblin:{sprite:'caveGoblin',w:24,h:28,speed:1.75,damage:10,hp:34,xp:3,sizeRange:[.82,1.2]},
    stoneGolem:{sprite:'stoneGolem',w:32,h:36,speed:.7,damage:16,hp:95,xp:5,sizeRange:[.9,1.18]},
    iceWraith:{sprite:'iceWraith',w:28,h:34,speed:1.3,damage:17,hp:84,xp:5,sizeRange:[.84,1.2]},
    caveTroll:{sprite:'caveTroll',w:40,h:44,speed:1.1,damage:22,hp:130,xp:9,sizeRange:[.9,1.18]},
    ironGolem:{sprite:'ironGolem',w:36,h:40,speed:.65,damage:20,hp:150,xp:9,sizeRange:[.92,1.16]},
    boneKnight:{sprite:'boneKnight',w:30,h:40,speed:1.4,damage:21,hp:110,xp:9,sizeRange:[.86,1.18]},
    shadowLurker:{sprite:'shadowLurker',w:32,h:32,speed:1.9,damage:23,hp:100,xp:9,sizeRange:[.84,1.2]},
    necromancer:{sprite:'necromancer',w:30,h:40,speed:1.1,damage:20,hp:95,xp:9,sizeRange:[.9,1.16],shooter:true,projSprite:'rpg_demon_skull',projSpeed:2.6,attackRate:3.4},
    spiderQueenling:{sprite:'spiderQueenling',w:36,h:32,speed:1.6,damage:19,hp:120,xp:9,sizeRange:[.88,1.2]},
    voidling:{sprite:'voidling',w:30,h:34,speed:1.5,damage:22,hp:90,xp:9,sizeRange:[.82,1.22]},
    mimicChest:{sprite:'mimicChest',w:32,h:28,speed:.8,damage:24,hp:140,xp:10,sizeRange:[.9,1.18]},
    crystalGolem:{sprite:'crystalGolem',w:34,h:38,speed:.7,damage:21,hp:160,xp:10,sizeRange:[.92,1.16]},
    undeadChampion:{sprite:'undeadChampion',w:40,h:46,speed:1.2,damage:30,hp:260,xp:16,sizeRange:[.94,1.14]},
    caveHydra:{sprite:'caveHydra',w:52,h:44,speed:1.0,damage:33,hp:320,xp:18,sizeRange:[.96,1.14]},
    boneDrake:{sprite:'boneDrake',w:50,h:42,speed:1.3,damage:32,hp:300,xp:18,sizeRange:[.94,1.16]},
    voidHorror:{sprite:'voidHorror',w:52,h:48,speed:1.15,damage:36,hp:340,xp:20,sizeRange:[.96,1.14]},
    ancientLich:{sprite:'ancientLich',w:40,h:50,speed:1.0,damage:34,hp:280,xp:19,sizeRange:[.92,1.16],shooter:true,projSprite:'rpg_crystal_purple',projSpeed:3,attackRate:3.2},
    demonLord:{sprite:'demonLord',w:52,h:52,speed:1.25,damage:38,hp:380,xp:22,sizeRange:[.96,1.14]},
    frostGiant:{sprite:'frostGiant',w:46,h:52,speed:.85,damage:35,hp:360,xp:20,sizeRange:[.96,1.14]},
    // === UNDERGROUND PACK: the 4 underground bosses (BOSSES half-row sprites) ===
    stoneColossus:{sprite:'Cave_titan',w:110,h:70,speed:.7,damage:34,hp:1250,xp:80,boss:true,sizeRange:[2.0,2.0]},
    crystalBeholder:{sprite:'Crystal_Beholder',w:88,h:80,speed:.9,damage:30,hp:1100,xp:75,boss:true,sizeRange:[2.2,2.2]},
    caveWyrm:{sprite:'Cave_Wyrm',w:120,h:82,speed:1.1,damage:36,hp:1200,xp:85,boss:true,summonMinions:'caveRat',sizeRange:[2.0,2.0]},
    lavaTitan:{sprite:'Cave_lava_Wyrm',w:120,h:80,speed:.75,damage:40,hp:1300,xp:90,boss:true,sizeRange:[2.0,2.0]},
    // === ABYSS BIOME (The Sunken Depths) ===
    abyss_crab:{hp:120,speed:1.1,damage:18,sprite:'abyss_crab',w:36,h:28,xp:6,water:true,sizeRange:[0.9,1.2]},
    abyss_fish:{hp:45,speed:2.2,damage:12,sprite:'abyss_fish',w:32,h:22,xp:4,water:true,sizeRange:[0.8,1.2]},
    abyss_horse:{hp:70,speed:1.7,damage:15,sprite:'abyss_horse',w:24,h:36,xp:5,water:true,sizeRange:[0.8,1.2]},
    abyss_jelly:{hp:55,speed:1.2,damage:14,sprite:'abyss_jelly',w:26,h:40,xp:5,water:true,sizeRange:[0.85,1.25]},
    abyss_squid:{hp:140,speed:1.6,damage:22,sprite:'abyss_squid',w:42,h:26,xp:8,water:true,shooter:true,projSprite:'rpg_bottle_water',projSpeed:3.2,attackRate:2.8,sizeRange:[0.9,1.3]},
    abyss_turtle:{hp:280,speed:0.8,damage:26,sprite:'abyss_turtle',w:44,h:34,xp:12,water:true,sizeRange:[1.0,1.3]},
    abyss_worm:{hp:160,speed:1.3,damage:24,sprite:'abyss_worm',w:38,h:32,xp:9,water:true,sizeRange:[0.9,1.3]},
    bone_fish:{hp:60,speed:2.4,damage:16,sprite:'bone_fish',w:32,h:20,xp:5,water:true,sizeRange:[0.8,1.2]},
    deep_fish:{hp:50,speed:2.0,damage:14,sprite:'deep_fish',w:30,h:22,xp:4,water:true,sizeRange:[0.8,1.2]},
    spike_fish:{hp:85,speed:1.8,damage:20,sprite:'spike_fish',w:32,h:30,xp:6,water:true,sizeRange:[0.85,1.2]},
    Star_Fish:{hp:75,speed:1.0,damage:16,sprite:'Star_Fish',w:28,h:28,xp:5,water:true,sizeRange:[0.8,1.2]},
    abyss_cuttle_up:{hp:65,speed:2.1,damage:13,sprite:'abyss_cuttle_up',w:22,h:38,xp:5,water:true,sizeRange:[0.85,1.15]},
    abyss_octo_sheet:{hp:135,speed:1.4,damage:20,sprite:'abyss_octo_sheet',w:38,h:32,xp:8,water:true,sizeRange:[0.9,1.2]},
    abyss_cuttlefish:{hp:110,speed:1.7,damage:18,sprite:'abyss_cuttlefish',w:40,h:26,xp:7,water:true,sizeRange:[0.9,1.2]},
    abyss_viperfish:{hp:95,speed:2.3,damage:24,sprite:'abyss_viperfish',w:42,h:22,xp:7,water:true,sizeRange:[0.9,1.2]},
    abyss_needle_fish:{hp:85,speed:2.7,damage:16,sprite:'abyss_needle_fish',w:52,h:26,xp:6,water:true,sizeRange:[0.9,1.2]},
    abyss_squid_anim:{hp:160,speed:1.65,damage:24,sprite:'abyss_squid_anim',w:78,h:48,xp:10,water:true,shooter:true,projSprite:'rpg_bottle_water',projSpeed:2.8,attackRate:3.2,sizeRange:[0.9,1.2]},
    abyss_coelacanth:{hp:220,speed:1.45,damage:22,sprite:'abyss_coelacanth',w:80,h:46,xp:12,water:true,sizeRange:[0.9,1.15]},
    abyss_isopod:{hp:380,speed:1.05,damage:26,sprite:'abyss_isopod',w:96,h:54,xp:16,water:true,knockbackResist:0.6,sizeRange:[0.9,1.15]},
    abyss_pufferfish:{hp:240,speed:1.35,damage:20,sprite:'abyss_pufferfish',w:72,h:52,xp:12,water:true,sizeRange:[0.9,1.15]},
    abyss_dunkleosteus:{hp:720,speed:1.25,damage:38,sprite:'abyss_dunkleosteus',w:140,h:68,xp:35,water:true,knockbackResist:0.8,sizeRange:[0.95,1.2]},
    abyss_colossal_squid:{hp:520,speed:1.2,damage:32,sprite:'abyss_colossal_squid',w:96,h:52,xp:30,water:true,sizeRange:[1.1,1.3]},
    abyss_cyan_dunkle:{hp:680,speed:1.0,damage:36,sprite:'abyss_cyan_dunkle',w:92,h:54,xp:35,water:true,sizeRange:[1.1,1.3]},
    abyss_purple_leviathan:{hp:720,speed:0.95,damage:38,sprite:'abyss_purple_leviathan',w:105,h:56,xp:40,water:true,sizeRange:[1.15,1.35]},
    abyss_spider_crab:{hp:580,speed:0.85,damage:30,sprite:'abyss_spider_crab',w:82,h:62,xp:32,water:true,sizeRange:[1.05,1.25]},
    abyss_bloop:{hp:850,speed:1.15,damage:42,sprite:'abyss_bloop',w:90,h:68,xp:45,water:true,sizeRange:[1.15,1.35]},
    abyss_octopus:{hp:3800,speed:0.9,damage:48,sprite:'Abyssal_kraken',w:510,h:285,xp:350,boss:true,isKrakenBoss:true,water:true,summonMinions:'abyss_jelly',sizeRange:[1.2,1.25]},
    Abyssal_kraken:{hp:3800,speed:0.9,damage:48,sprite:'Abyssal_kraken',w:510,h:285,xp:350,boss:true,isKrakenBoss:true,water:true,summonMinions:'abyss_jelly',sizeRange:[1.2,1.25]},
    abyss_whale_1:{hp:999999,speed:0.32,damage:0,passive:true,sprite:'abyss_whale_1',w:580,h:185,xp:0,water:true,sizeRange:[1.0,1.25]},
    abyss_whale_2:{hp:999999,speed:0.28,damage:0,passive:true,sprite:'abyss_whale_2',w:520,h:305,xp:0,water:true,sizeRange:[1.0,1.25]},
    abyss_whale:{hp:999999,speed:0.28,damage:0,passive:true,sprite:'abyss_whale',w:520,h:305,xp:0,water:true,sizeRange:[1.0,1.25]},
    white_shark:{hp:950,speed:2.3,damage:42,sprite:'white_shark',w:168,h:84,xp:50,water:true,sizeRange:[1.0,1.15]},
    // === DREAM BIOME: 41 UNIQUE MOBS ===
    dream_mob_01:{hp:90,speed:1.8,damage:2,sprite:'dream_mob_01',w:36,h:40,xp:6,sizeRange:[0.9,1.2]},
    dream_mob_02:{hp:115,speed:1.35,damage:2,sprite:'dream_mob_02',w:38,h:44,xp:7,shooter:true,projSprite:'rpg_crystal_purple',projSpeed:2.8,attackRate:2.8,sizeRange:[0.95,1.25]},
    dream_mob_03:{hp:150,speed:1.45,damage:3,sprite:'dream_mob_03',w:40,h:46,xp:8,sizeRange:[1.0,1.25]},
    dream_mob_04:{hp:260,speed:1.1,damage:3,sprite:'dream_mob_04',w:46,h:48,xp:11,sizeRange:[1.05,1.35]},
    dream_mob_05:{hp:130,speed:1.65,damage:3,sprite:'dream_mob_05',w:38,h:42,xp:9,sizeRange:[0.95,1.2]},
    dream_mob_06:{hp:320,speed:0.95,damage:4,sprite:'dream_mob_06',w:48,h:52,xp:14,sizeRange:[1.1,1.4]},
    dream_mob_07:{hp:90,speed:1.8,damage:2,sprite:'dream_mob_07',w:36,h:40,xp:6,sizeRange:[0.9,1.2]},
    dream_mob_08:{hp:115,speed:1.35,damage:2,sprite:'dream_mob_08',w:38,h:44,xp:7,shooter:true,projSprite:'rpg_crystal_purple',projSpeed:2.8,attackRate:2.8,sizeRange:[0.95,1.25]},
    dream_mob_09:{hp:150,speed:1.45,damage:3,sprite:'dream_mob_09',w:40,h:46,xp:8,sizeRange:[1.0,1.25]},
    dream_mob_10:{hp:299,speed:1.1,damage:3,sprite:'dream_mob_10',w:46,h:48,xp:11,sizeRange:[1.05,1.35]},
    dream_mob_11:{hp:149,speed:1.65,damage:3,sprite:'dream_mob_11',w:38,h:42,xp:9,sizeRange:[0.95,1.2]},
    dream_mob_12:{hp:368,speed:0.95,damage:4,sprite:'dream_mob_12',w:48,h:52,xp:14,sizeRange:[1.1,1.4]},
    dream_mob_13:{hp:103,speed:1.8,damage:2,sprite:'dream_mob_13',w:36,h:40,xp:6,sizeRange:[0.9,1.2]},
    dream_mob_14:{hp:132,speed:1.35,damage:3,sprite:'dream_mob_14',w:38,h:44,xp:7,shooter:true,projSprite:'rpg_crystal_purple',projSpeed:2.8,attackRate:2.8,sizeRange:[0.95,1.25]},
    dream_mob_15:{hp:172,speed:1.45,damage:3,sprite:'dream_mob_15',w:40,h:46,xp:8,sizeRange:[1.0,1.25]},
    dream_mob_16:{hp:299,speed:1.1,damage:4,sprite:'dream_mob_16',w:46,h:48,xp:11,sizeRange:[1.05,1.35]},
    dream_mob_17:{hp:149,speed:1.65,damage:3,sprite:'dream_mob_17',w:38,h:42,xp:9,sizeRange:[0.95,1.2]},
    dream_mob_18:{hp:368,speed:0.95,damage:4,sprite:'dream_mob_18',w:48,h:52,xp:14,sizeRange:[1.1,1.4]},
    dream_mob_19:{hp:103,speed:1.8,damage:2,sprite:'dream_mob_19',w:36,h:40,xp:6,sizeRange:[0.9,1.2]},
    dream_mob_20:{hp:149,speed:1.35,damage:3,sprite:'dream_mob_20',w:38,h:44,xp:7,shooter:true,projSprite:'rpg_crystal_purple',projSpeed:2.8,attackRate:2.8,sizeRange:[0.95,1.25]},
    dream_mob_21:{hp:195,speed:1.45,damage:3,sprite:'dream_mob_21',w:40,h:46,xp:8,sizeRange:[1.0,1.25]},
    dream_mob_22:{hp:338,speed:1.1,damage:4,sprite:'dream_mob_22',w:46,h:48,xp:11,sizeRange:[1.05,1.35]},
    dream_mob_23:{hp:169,speed:1.65,damage:3,sprite:'dream_mob_23',w:38,h:42,xp:9,sizeRange:[0.95,1.2]},
    dream_mob_24:{hp:416,speed:0.95,damage:4,sprite:'dream_mob_24',w:48,h:52,xp:14,sizeRange:[1.1,1.4]},
    dream_mob_25:{hp:117,speed:1.8,damage:2,sprite:'dream_mob_25',w:36,h:40,xp:6,sizeRange:[0.9,1.2]},
    dream_mob_26:{hp:149,speed:1.35,damage:3,sprite:'dream_mob_26',w:38,h:44,xp:7,shooter:true,projSprite:'rpg_crystal_purple',projSpeed:2.8,attackRate:2.8,sizeRange:[0.95,1.25]},
    dream_mob_27:{hp:195,speed:1.45,damage:3,sprite:'dream_mob_27',w:40,h:46,xp:8,sizeRange:[1.0,1.25]},
    dream_mob_28:{hp:338,speed:1.1,damage:4,sprite:'dream_mob_28',w:46,h:48,xp:11,sizeRange:[1.05,1.35]},
    dream_mob_29:{hp:169,speed:1.65,damage:3,sprite:'dream_mob_29',w:38,h:42,xp:9,sizeRange:[0.95,1.2]},
    dream_mob_30:{hp:464,speed:0.95,damage:4,sprite:'dream_mob_30',w:48,h:52,xp:14,sizeRange:[1.1,1.4]},
    dream_mob_31:{hp:130,speed:1.8,damage:2,sprite:'dream_mob_31',w:36,h:40,xp:6,sizeRange:[0.9,1.2]},
    dream_mob_32:{hp:166,speed:1.35,damage:3,sprite:'dream_mob_32',w:38,h:44,xp:7,shooter:true,projSprite:'rpg_crystal_purple',projSpeed:2.8,attackRate:2.8,sizeRange:[0.95,1.25]},
    dream_mob_33:{hp:217,speed:1.45,damage:3,sprite:'dream_mob_33',w:40,h:46,xp:8,sizeRange:[1.0,1.25]},
    dream_mob_34:{hp:377,speed:1.1,damage:4,sprite:'dream_mob_34',w:46,h:48,xp:11,sizeRange:[1.05,1.35]},
    dream_mob_35:{hp:188,speed:1.65,damage:3,sprite:'dream_mob_35',w:38,h:42,xp:9,sizeRange:[0.95,1.2]},
    dream_mob_36:{hp:464,speed:0.95,damage:4,sprite:'dream_mob_36',w:48,h:52,xp:14,sizeRange:[1.1,1.4]},
    dream_mob_37:{hp:130,speed:1.8,damage:2,sprite:'dream_mob_37',w:36,h:40,xp:6,sizeRange:[0.9,1.2]},
    dream_mob_38:{hp:166,speed:1.35,damage:3,sprite:'dream_mob_38',w:38,h:44,xp:7,shooter:true,projSprite:'rpg_crystal_purple',projSpeed:2.8,attackRate:2.8,sizeRange:[0.95,1.25]},
    dream_mob_39:{hp:217,speed:1.45,damage:3,sprite:'dream_mob_39',w:40,h:46,xp:8,sizeRange:[1.0,1.25]},
    dream_mob_40:{hp:416,speed:1.1,damage:4,sprite:'dream_mob_40',w:46,h:48,xp:11,sizeRange:[1.05,1.35]},
    dream_mob_41:{hp:208,speed:1.65,damage:3,sprite:'dream_mob_41',w:38,h:42,xp:9,sizeRange:[0.95,1.2]},
    dream_mob_clock:{hp:85,speed:1.85,damage:14,sprite:'dream_mob_01',w:34,h:34,xp:5,sizeRange:[0.85,1.25]},
    dream_mob_eye:{hp:110,speed:1.4,damage:18,sprite:'dream_mob_03',w:32,h:36,xp:6,shooter:true,projSprite:'rpg_crystal_purple',projSpeed:2.8,attackRate:2.9,sizeRange:[0.9,1.25]},
    dream_mob_teddy:{hp:240,speed:1.1,damage:24,sprite:'dream_mob_08',w:42,h:44,xp:10,sizeRange:[0.95,1.3]},
    dream_mob_shadow:{hp:180,speed:1.7,damage:22,sprite:'dream_mob_07',w:36,h:46,xp:9,sizeRange:[0.9,1.2]},
    dream_sandman:{hp:450,speed:1.1,damage:32,sprite:'dream_mob_41',w:56,h:58,xp:25,sizeRange:[1.3,1.5]},
    // === CHICKEN SECRET LEVEL MOBS & BOSS ===
    chicken:{hp:10,speed:2.0,damage:6,sprite:'chicken_swarm',w:28,h:28,xp:2,sizeRange:[0.85,1.15]},
    rooster:{hp:25,speed:2.8,damage:12,sprite:'rooster_mob',w:34,h:30,xp:4,dasher:true,sizeRange:[0.95,1.2]},
    giantChicken:{hp:80,speed:0.8,damage:22,sprite:'giant_chicken',w:50,h:44,xp:10,sizeRange:[1.15,1.4]},
    chickenKing:{hp:1800,speed:1.0,damage:36,sprite:'chicken_king',w:96,h:82,xp:250,boss:true,isChickenKing:true,summonMinions:'chicken',sizeRange:[3.0,3.0]},

    // === 5 MOUNTAIN BIOMES ANIMATED MOBS (12 Unique Mobs, 2x Colossal Sized) ===
    // Mountain 1: Alchemist's Caldera (Fungal Wastes)
    cyclops_mountain1:{hp:550,speed:0.85,damage:32,sprite:'cyclops_mountain1',w:104,h:120,xp:28,sizeRange:[1.05,1.2],knockbackResist:0.7},
    unicorn_mountain1:{hp:280,speed:1.85,damage:20,sprite:'unicorn_mountain1',w:92,h:96,xp:20,sizeRange:[1.0,1.15],dasher:true},

    // Mountain 2: The Whispering Grove (Forest)
    drake_mountain2:{hp:440,speed:1.25,damage:26,sprite:'drake_mountain2',w:96,h:104,xp:24,sizeRange:[1.05,1.2]},
    warewoolf_mountain2:{hp:350,speed:1.95,damage:24,sprite:'warewoolf_mountain2',w:88,h:100,xp:22,sizeRange:[1.0,1.15]},

    // Mountain 3: The Arcane Sanctuary (Magic Forest)
    icegiant_mountain3:{hp:680,speed:0.75,damage:36,sprite:'icegiant_mountain3',w:112,h:128,xp:34,sizeRange:[1.1,1.25],knockbackResist:0.8},
    minotaur_mountain3:{hp:480,speed:1.35,damage:30,sprite:'minotaur_mountain3',w:100,h:112,xp:26,sizeRange:[1.05,1.2]},

    // Mountain 4: The Dread Crags (Deadlands)
    berserker_mountain4:{hp:420,speed:1.6,damage:32,sprite:'berserker_mountain4',w:92,h:104,xp:25,sizeRange:[1.05,1.2]},
    flyguardian_mountain4:{hp:320,speed:1.75,damage:24,sprite:'flyguardian_mountain4',w:96,h:96,xp:22,sizeRange:[1.0,1.15]},
    grifin_mountain4:{hp:520,speed:1.5,damage:30,sprite:'grifin_mountain4',w:104,h:108,xp:30,sizeRange:[1.05,1.2]},

    // Mountain 5: The Frostpeak Hollow (Snow & Crystal Peaks)
    flyonehanddrak_mountain5:{hp:480,speed:1.45,damage:30,sprite:'flyonehanddrak_mountain5',w:100,h:104,xp:26,sizeRange:[1.05,1.2]},
    reddragiondrake_mountain5:{hp:820,speed:1.15,damage:40,sprite:'reddragiondrake_mountain5',w:120,h:124,xp:42,sizeRange:[1.1,1.25],knockbackResist:0.85},
    threeheaded_mountain5:{hp:720,speed:0.95,damage:36,sprite:'threeheaded_mountain5',w:116,h:120,xp:36,sizeRange:[1.1,1.25],knockbackResist:0.75}
};
const BIOME_SPAWNS={
  plains:[['plains_archer',0.2,20],['plains_goblin',0.3,0],['plains_brute',0.1,60],['goblin',0.4,0],['zombie',0.25,10],['bandit',0.2,60],['boar',0.2,90],['crow',0.2,0],['beetle',0.18,30],['antSoldier',0.16,75],['mantis',0.14,50]],
  forest:[['forest_hunter',0.2,30],['forest_sprite',0.2,15],['forest_ent',0.1,80],['wolf',0.4,0],['bear',0.2,60],['spider',0.3,30],['direWolf',0.18,90],['snake',0.18,45],['mantis',0.18,40],['tiger',0.1,120],['panther',0.15,100],['treant',0.008,180]],
  magicForest:[['magic_mage',0.2,40],['magic_pixie',0.25,20],['magic_golem',0.1,90],['fairy',0.3,0],['giantMoth',0.2,45],['natureSprite',0.15,60],['wisp',0.3,0],['airSprite',0.15,90],['ghostBat',0.18,35],['mantis',0.22,30],['swarm',0.08,120]],
  desert:[['desert_spitter',0.2,50],['desert_vulture',0.2,25],['desert_worm',0.15,75],['snake',0.25,15],['mummy',0.4,0],['scorpion',0.3,30],['scarab',0.25,25],['centipede',0.2,80],['sandKnight',0.12,120],['lion',0.16,100]],
  snow:[['snow_thrower',0.2,60],['snow_fox',0.3,10],['snow_yeti',0.15,100],['frostWolf',0.3,0],['iceSlime',0.25,30],['iceBat',0.2,0],['iceSprite',0.22,45],['iceGolem',0.18,70]],
  swamp:[['swamp_shaman',0.2,50],['swamp_leech',0.25,15],['swamp_toad',0.2,50],['snake',0.22,20],['crocodile',0.15,90],['bogCrab',0.2,50],['mireWorm',0.15,100],['eel',0.2,45],['jellyfish',0.16,70],['slime',0.4,0]],
  volcano:[['volcano_flinger',0.2,60],['volcano_hound',0.2,30],['volcano_ash_zombie',0.15,85],['fireBat',0.25,0],['lavaSlime',0.2,45],['hellBeetle',0.16,90],['fireSprite',0.25,15],['earthGolem',0.15,70],['redDrake',0.08,150]],
  crystalWastes:[['crystal_weaver',0.2,60],['crystal_shardling',0.3,20],['crystal_crawler',0.2,70],['blueDrake',0.08,120],['fish',0.3,0],['shark',0.15,90],['bat',0.4,0],['skeletonArcher',0.2,40],['crossSwarm',0.06,140]],
  fungalWastes:[['fungal_lobber',0.2,60],['fungal_sporeling',0.35,10],['fungal_brute',0.15,80],['mantis',0.2,40],['snake',0.3,0],['rotZombie',0.2,50],['zombie',0.4,0],['sporeKing',0.008,180]],
  deadlands:[['dead_cultist',0.2,60],['dead_ghoul',0.25,30],['dead_knight',0.15,65],['zombie',0.35,0],['skeleton',0.4,0],['ghost',0.3,20],['wraith',0.2,60],['banshee',0.15,90],['vampire',0.1,120],['graveLord',0.008,180]],
  badlands:[['badlands_slinger',0.2,60],['badlands_coyote',0.3,20],['badlands_golem',0.15,90],['imp',0.3,0],['shadowDemon',0.15,80],['banditWarlord',0.008,180]],
  dimensionX:[['void_caster',0.25,60],['void_eye',0.35,0],['void_crawler',0.25,40],['void_behemoth',0.15,120],['voidSpirit',0.4,0]],
  abyss:[['abyss_needle_fish',0.28,0],['abyss_fish',0.26,0],['deep_fish',0.24,0],['Star_Fish',0.22,0],['abyss_jelly',0.22,15],['abyss_horse',0.18,20],['abyss_coelacanth',0.22,25],['bone_fish',0.20,30],['abyss_pufferfish',0.20,35],['spike_fish',0.18,40],['abyss_isopod',0.18,45],['abyss_crab',0.18,50],['abyss_worm',0.16,60],['abyss_dunkleosteus',0.12,60],['abyss_turtle',0.14,80],['abyss_squid_anim',0.20,40],['white_shark',0.08,60],['abyss_whale_1',0.06,30],['abyss_whale_2',0.06,45]],
  chicken:[['chicken',0.75,0],['rooster',0.18,0],['giantChicken',0.07,0]],
  dream:[['dream_mob_01',0.25,0],['dream_mob_02',0.25,0],['dream_mob_03',0.25,0],['dream_mob_04',0.25,0],['dream_mob_05',0.25,0],['dream_mob_06',0.25,0],['dream_mob_07',0.25,0],['dream_mob_08',0.25,0],['dream_mob_09',0.25,0],['dream_mob_10',0.25,0],['dream_mob_11',0.25,0],['dream_mob_12',0.25,0],['dream_mob_13',0.25,0],['dream_mob_14',0.25,0],['dream_mob_15',0.22,15],['dream_mob_16',0.22,15],['dream_mob_17',0.22,15],['dream_mob_18',0.22,15],['dream_mob_19',0.22,15],['dream_mob_20',0.22,15],['dream_mob_21',0.22,15],['dream_mob_22',0.22,15],['dream_mob_23',0.22,15],['dream_mob_24',0.22,15],['dream_mob_25',0.22,15],['dream_mob_26',0.22,15],['dream_mob_27',0.22,15],['dream_mob_28',0.22,15],['dream_mob_29',0.2,30],['dream_mob_30',0.2,30],['dream_mob_31',0.2,30],['dream_mob_32',0.2,30],['dream_mob_33',0.2,30],['dream_mob_34',0.2,30],['dream_mob_35',0.2,30],['dream_mob_36',0.2,30],['dream_mob_37',0.2,30],['dream_mob_38',0.2,30],['dream_mob_39',0.2,30],['dream_mob_40',0.2,30],['dream_mob_41',0.2,30],['dream_mob_clock',0.25,0],['dream_mob_eye',0.25,0],['dream_mob_teddy',0.22,15],['dream_mob_shadow',0.20,30]],
};
  export const BIOME_BOSSES={plains:'plainsBoss',forest:'bloodLord',magicForest:'lichKing',desert:'pharaoh',snow:'iceTitan',swamp:'swampHorror',volcano:'phoenix',crystalWastes:'crystalBeholder',fungalWastes:'swampHorror',deadlands:'vampireLord',badlands:'bloodLord',dimensionX:'voidGod',abyss:'abyss_octopus',chicken:'chickenKing',
    // === UNDERGROUND PACK: default underground boss ===
    // Without this key, BIOME_BOSSES['undergroundCave'] was undefined and caves spawned the
    // surface Blood Lord via the `|| 'bloodLord'` fallback. spawnBiomeBoss() rotates among all
    // four underground bosses; this is the safe single-boss default for any other reader.
    undergroundCave:'stoneColossus'};
export function pickBiomeEnemy(bn,elapsed,allowSpecial=true){
  const table=BIOME_SPAWNS[bn]||BIOME_SPAWNS.plains;
  const elig=table.filter(([t,_,m])=>{
    if(elapsed<m)return false;
    if(!allowSpecial && bn !== 'chicken'){
      const def=ENEMY_TYPES[t];
      if(def&&(def.ultraElite||def.swarm||def.passive||def.boss))return false;
    }
    return true;
  });
  if(!elig.length)return bn==='chicken'?'chicken':(bn==='abyss'?'abyss_fish':'bat');
  const tot=elig.reduce((s,[_,w])=>s+w,0);
  let r=Math.random()*tot;
  for(const[t,w]of elig){r-=w;if(r<=0)return t;}
  return elig[0][0];
}
const ELITE_ORBS=[
  {sprite:'xp_gem_elite',color:'#c38cff',tier:'elite'},
  {sprite:'xp_gem_legendary',color:'#ffd45c',tier:'legendary'},
  {sprite:'xp_gem_mythic',color:'#ff4d4d',tier:'mythic'}
];

export function isFlyingEnemy(e) {
  if (!e) return false;
  if (e.flying || ENEMY_TYPES[e.type]?.flying) return true;
  const t = e.type || '';
  return Boolean(
    t.includes('bat') || t.includes('Bat') || t.includes('fly') || t.includes('Fly') ||
    t.includes('drake') || t.includes('Drake') || t.includes('ghost') || t.includes('Ghost') ||
    t.includes('wisp') || t.includes('Wisp') || t.includes('fairy') || t.includes('Fairy') ||
    t.includes('pixie') || t.includes('Pixie') || t.includes('moth') || t.includes('Moth') ||
    t.includes('vulture') || t.includes('crow') || t.includes('Crow') || t.includes('swarm') ||
    t.includes('wraith') || t.includes('banshee') || t.includes('voidSpirit') || t.includes('airSprite') ||
    t.includes('fireSprite') || t.includes('iceSprite') || t.includes('natureSprite')
  );
}

export function isLargeOrBossEnemy(e) {
  if (!e) return false;
  if (e.boss || ENEMY_TYPES[e.type]?.boss || e.type === 'plainsBoss' || e.type === 'bloodLord' || e.ultraElite) return true;
  const w = e.w || ENEMY_TYPES[e.type]?.w || 0;
  const h = e.h || ENEMY_TYPES[e.type]?.h || 0;
  return (w >= 54 || h >= 54);
}

export function createEnemySpawner({enemies,getElapsed,getPlayerLevel=()=>1,getBossIntro,startBossIntro,canPlayerSeeEnemy=()=>true,canSpawn=()=>true}){
  let lastEliteSpawn=-Infinity;
  let lastUltraEliteSpawn=-Infinity;
  return function spawnEnemyAt(sx,sy,typeName,extra={}){
    const isDreamArea = Boolean(globalThis.isInDream) || (sx / 40 > 550000 && sx / 40 < 650000 && sy / 40 > 550000 && sy / 40 < 650000);
    if (isDreamArea && !typeName.startsWith('dream_')) {
      return null;
    }
    if (!isDreamArea && typeName.startsWith('dream_')) {
      return null;
    }
    const isChickenArea = (sx / 40 > 910000 && sx / 40 < 990000 && sy / 40 > 910000 && sy / 40 < 990000);
    const isChickenMob = (typeName === 'chicken' || typeName === 'rooster' || typeName === 'giantChicken' || typeName === 'chickenKing');
    if (isChickenArea && !isChickenMob) {
      return null;
    }
    if (!isChickenArea && isChickenMob) {
      return null;
    }
    if (typeof window !== 'undefined' && ((window.isMountainBlocked && window.isMountainBlocked(sx, sy, 30, 40)) || (window.isNearMountainEntrancePass && window.isNearMountainEntrancePass(sx, sy, 260)))) {
      return null;
    }
    const t=ENEMY_TYPES[typeName];
    if(!t)return null;
    if(t.boss && enemies.some(e => e.hp > 0 && (e.type === typeName || ((typeName === 'abyss_octopus' || typeName === 'Abyssal_kraken') && (e.type === 'abyss_octopus' || e.type === 'Abyssal_kraken'))))){
      return null;
    }
    const elapsed=getElapsed();
    const minutes=elapsed/60;
    const pLevel = (typeof getPlayerLevel === 'function' ? getPlayerLevel() : 1) || 1;
    
    // Effective progress combines elapsed time and player level so over-leveled players face proportional challenge
    const levelFactor = Math.max(0, (pLevel - 1) / 3.2);
    const effTime = Math.max(minutes, levelFactor);

    let diffScale = 1;
    let diffDmg = 1;
    let diffSpeed = 1;
    let diffXP = 1;
    const diff = window.GAME_SETTINGS?.difficulty ?? 1;
    if(diff === 0) { diffScale = 0.7; diffDmg = 0.7; diffXP = 1.0; }
    else if(diff === 2) { diffScale = 1.4; diffDmg = 1.4; }
    else if(diff === 3) { diffScale = 2.0; diffDmg = 2.0; diffSpeed = 1.1; }
    else if(diff === 4) { diffScale = 3.0; diffDmg = 3.0; diffSpeed = 1.25; }

    // Dynamic Multi-Tier HP Scaling:
    // - Up to 8 eff-time: gentle, accessible learning curve
    // - 8 to 20: steady veteran progression
    // - 20 to 35 (Lv 65+): nightmare ramp (+3.5x per eff-min)
    // - 35+ (Lv 110+): colossal scaling (+7.5x per eff-min), matching late-game 10,000-50,000+ DPS builds!
    let baseHpFactor;
    if (effTime <= 8) {
      baseHpFactor = 1 + Math.sqrt(effTime) * 1.35;
    } else if (effTime <= 20) {
      baseHpFactor = 1 + Math.sqrt(8) * 1.35 + Math.min(effTime - 8, 7) * 1.15 + Math.max(0, effTime - 15) * 1.45;
    } else if (effTime <= 35) {
      baseHpFactor = 1 + Math.sqrt(8) * 1.35 + 7 * 1.15 + 5 * 1.45 + (effTime - 20) * 2.8;
    } else {
      baseHpFactor = 1 + Math.sqrt(8) * 1.35 + 7 * 1.15 + 5 * 1.45 + 15 * 2.8 + (effTime - 35) * 6.0;
    }
    const bossHpFactor = 1 + Math.sqrt(Math.min(effTime, 12)) * 0.55 + Math.max(0, effTime - 12) * 0.35;
    const hpScale = (t.boss ? bossHpFactor : baseHpFactor) * diffScale;
    const dmgScale = (1 + Math.min(effTime * 0.12, 5.5)) * diffDmg;
    const speedScale = 1 + Math.min(0.28, Math.max(0, (pLevel - 20) * 0.0035));
    const xpScale = (1 + Math.min(minutes * 0.25, 3.0)) * diffXP;
    const eliteHPMult=2.0*(1+effTime/28);
    const eliteDamageMult=1.25*(1+effTime/35);
    const eliteCooldown=Math.max(16,40-effTime*0.8);
    const maxElites=Math.min(6,1+Math.floor(effTime/8));
    const bossPlayerScale=t.boss?(1+Math.max(0,(pLevel-14)/22)):1;
    const isUltraElite=Boolean(t.ultraElite||extra.ultraElite);
    if(isUltraElite){
      if(extra.hordeSpawn||elapsed-lastUltraEliteSpawn<90||enemies.some(enemy=>enemy.ultraElite&&enemy.hp>0))return null;
      lastUltraEliteSpawn=elapsed;
    }
    const requestedElite=extra.elite??(!t.boss&&!t.passive&&!extra.hordeSpawn&&Math.random()<.016);
    const elite=Boolean(isUltraElite||(requestedElite&&!t.boss&&!t.passive&&!extra.hordeSpawn&&elapsed-lastEliteSpawn>=eliteCooldown&&enemies.filter(enemy=>enemy.elite&&!enemy.ultraElite&&enemy.hp>0).length<maxElites));
    if(elite&&!isUltraElite)lastEliteSpawn=elapsed;
    if(!elite&&!extra.hordeSpawn&&!canSpawn())return null;
    let eliteOrb=null;
    if(t.boss || extra.tier === 'mythic'){
      eliteOrb={sprite:'xp_gem_mythic',color:'#ff4d4d',tier:'mythic'};
    } else if(isUltraElite || extra.tier === 'legendary'){
      eliteOrb={sprite:'xp_gem_legendary',color:'#ffd45c',tier:'legendary'};
    } else if(elite || extra.tier === 'elite'){
      const tierRoll = extra.eliteTier || (Math.random() < 0.10 ? 'mythic' : (Math.random() < 0.35 ? 'legendary' : 'elite'));
      if(tierRoll === 'mythic') eliteOrb={sprite:'xp_gem_mythic',color:'#ff4d4d',tier:'mythic'};
      else if(tierRoll === 'legendary') eliteOrb={sprite:'xp_gem_legendary',color:'#ffd45c',tier:'legendary'};
      else eliteOrb={sprite:'xp_gem_elite',color:'#c38cff',tier:'elite'};
    }
    const eliteNames={wolf:'Wolf Alpha',slime:'Slime King',vampire:'Vampire Elder',bat:'Nightwing',zombie:'Rotting Brute',skeleton:'Bone Warlord',snake:'Broodmother',imp:'Ash Warlock',tiger:'Jungle Lord',panther:'Shadow Stalker',mantis:'Blade Dancer',eel:'Deepcoil',shadowDemon:'Abyssal Knight',voidSpirit:'Void Herald'};
    const rawEliteName=t.eliteName||(elite?(eliteNames[typeName]||`${typeName.replace(/([A-Z])/g,' $1').replace(/^./,letter=>letter.toUpperCase())} Alpha`):null);
    let eliteName=rawEliteName;
    if(eliteName && !t.boss && !isUltraElite){
      if(eliteOrb?.tier === 'mythic') eliteName = `Mythic ${rawEliteName}`;
      else if(eliteOrb?.tier === 'legendary') eliteName = `Legendary ${rawEliteName}`;
    }
    // Champion Affixes for High-Level Elites (Lv 25+ or 8m+)
    let championAffix = null;
    if ((elite || isUltraElite) && (pLevel >= 25 || minutes >= 8)) {
      const affixRoll = Math.random();
      if (affixRoll < 0.28) {
        championAffix = 'juggernaut'; // 100% knockback & freeze immunity
      } else if (affixRoll < 0.55) {
        championAffix = 'speedDemon'; // +45% speed
      } else if (affixRoll < 0.80) {
        championAffix = 'barrier'; // Hit-counter shield absorbing hits
      } else {
        championAffix = 'volatile'; // Detonates on death
      }
    }
    const knockbackResist = championAffix === 'juggernaut' ? 1.0 : (t.boss ? 0.95 : Math.min(0.70, Math.max(0, (pLevel - 15) * 0.0075 + (minutes > 15 ? (minutes - 15) * 0.015 : 0))));

    const [minScale,maxScale]=t.sizeRange||[.84,1.22];
    const sizeScale=(extra.sizeScale??(minScale+Math.random()*(maxScale-minScale)))*(elite&&!isUltraElite?1.2:1);
    const sprite=extra.sprite||(t.spriteVariants?t.spriteVariants[Math.floor(Math.random()*t.spriteVariants.length)]:t.sprite);

    // Check if spawn position is inside a wall
    const testW = t.boss ? Math.min(t.w, 96) : t.w * sizeScale;
    const testH = t.boss ? Math.min(t.h, 96) : t.h * sizeScale;
    if (window.isWallCollision && window.isWallCollision(sx - testW/2, sy - testH/2, testW, testH)) {
      let found = false;
      const searchR = Math.max(60, Math.min(testW, testH) * 2);
      for (let attempt = 0; attempt < 16; attempt++) {
        const angle = ((attempt % 8) / 8) * Math.PI * 2;
        const offset = searchR * (attempt < 8 ? 1 : 1.7);
        const testSx = sx + Math.cos(angle) * offset;
        const testSy = sy + Math.sin(angle) * offset;
        if (!window.isWallCollision(testSx - testW/2, testSy - testH/2, testW, testH)) {
          sx = testSx;
          sy = testSy;
          found = true;
          break;
        }
      }
      if (!found) return null; // No valid spawn position found
    }

    const effHPMult=(elite&&!isUltraElite)?eliteHPMult:1;
    const effDmgMult=(elite&&!isUltraElite)?eliteDamageMult:1;
    const e={type:typeName,boss:Boolean(t.boss),passive:Boolean(t.passive),x:sx,y:sy,w:t.w*sizeScale,h:t.h*sizeScale,sizeScale,
      hp:Math.floor(t.hp*hpScale*bossPlayerScale*effHPMult),maxHp:Math.floor(t.hp*hpScale*bossPlayerScale*effHPMult),
      speed:t.speed*diffSpeed*speedScale*(championAffix==='speedDemon'?1.45:1),
      damage:t.damage*dmgScale*effDmgMult,xp:t.xp*xpScale*(isUltraElite?1:(elite?6:1)),sprite,
      championAffix,
      barrierHits: championAffix === 'barrier' ? Math.min(24, Math.floor(10 + pLevel * 0.12)) : 0,
      maxBarrierHits: championAffix === 'barrier' ? Math.min(24, Math.floor(10 + pLevel * 0.12)) : 0,
      freezeImmune: championAffix === 'juggernaut' || Boolean(t.boss),
      knockbackResist,
      wobble:Math.random()*Math.PI*2,bob:Math.random()*Math.PI*2,
      garlicTick:0,flipX:false,hitFlash:0,inWater:0,wasInWater:0,
      animTimer:0,deathTimer:0,lastVx:0,lastVy:0,summonTimer:t.summonMinions?6:0,
      poisonAuraTimer:0,
      ...extra,ultraElite:isUltraElite,elite,eliteName,
      tier:eliteOrb?.tier||extra.tier||(t.boss?'mythic':(isUltraElite?'legendary':(elite?'elite':null))),
      megaOrbSprite:eliteOrb?.sprite||null,
      megaOrbColor:eliteOrb?.color||(isUltraElite?'#ffd45c':(t.boss?'#ff4d4d':'#c38cff'))};

    // Handle swarm enemies - create multiple tiny entities that move as one
    if(t.swarm){
      const swarmCount = t.swarmCount || 30 + Math.floor(Math.random() * 20);
      const swarmRadius = t.swarmRadius || 60;
      const swarmFormation = t.swarmFormation || 'circle';
      e.swarmId = Math.random().toString(36).substr(2, 9);
      e.swarmMembers = [];
      e.swarmOffset = Math.random() * Math.PI * 2;
      e.swarmRotation = 0;
      e.swarmRotationTimer = 0;

      for(let i = 0; i < swarmCount; i++){
        let offsetX, offsetY, angle, radius;

        if(swarmFormation === 'cross'){
          // Cross formation: place members along 4 arms of a cross
          const arm = i % 4;
          const armIndex = Math.floor(i / 4);
          const spacing = 12;
          const armLength = Math.floor(swarmCount / 4) * spacing;

          if(arm === 0){ // Top arm
            offsetX = 0;
            offsetY = -spacing * (armIndex + 1);
          } else if(arm === 1){ // Right arm
            offsetX = spacing * (armIndex + 1);
            offsetY = 0;
          } else if(arm === 2){ // Bottom arm
            offsetX = 0;
            offsetY = spacing * (armIndex + 1);
          } else { // Left arm
            offsetX = -spacing * (armIndex + 1);
            offsetY = 0;
          }

          angle = Math.atan2(offsetY, offsetX);
          radius = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        } else {
          // Default circular formation
          angle = (i / swarmCount) * Math.PI * 2 + e.swarmOffset;
          radius = swarmRadius * (0.3 + Math.random() * 0.7);
          offsetX = Math.cos(angle) * radius;
          offsetY = Math.sin(angle) * radius;
        }

        const member={
          type:typeName,
          swarmMember:true,
          swarmId:e.swarmId,
          leader:e,
          x:sx + offsetX,
          y:sy + offsetY,
          w:12,
          h:12,
          hp:5,
          maxHp:5,
          speed:0,
          damage:3,
          xp:0,
          sprite:t.swarmFormation === 'cross' ? 'rpg_gem_diamond' : (isChickenArea ? 'chicken_swarm' : 'bat'),
          wobble:Math.random()*Math.PI*2,
          bob:Math.random()*Math.PI*2,
          flipX:false,
          hitFlash:0,
          inWater:0,
          wasInWater:0,
          animTimer:0,deathTimer:0,lastVx:0,lastVy:0,swarmOffsetX:offsetX,
          swarmOffsetY:offsetY,
          swarmAngle:angle,
          swarmRadius:radius,
          swarmFormation:swarmFormation
        };
        e.swarmMembers.push(member);
        enemies.push(member);
      }
    }

    enemies.push(e);
    const bossIntro=getBossIntro();
    if(t.boss&&bossIntro.timer<=0&&canPlayerSeeEnemy(e)){
      e.introShown=true;
      startBossIntro(e);
    }
    return e;
  };
}
