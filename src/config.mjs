const WEATHER_TYPES={clear:{label:'Clear',sprite:'rpg_lightSpirit'},rain:{label:'Rain',sprite:'rpg_waterSprite'},snow:{label:'Snow',sprite:'snowman'},storm:{label:'Storm',sprite:'rpg_lightningSprite'}};

const BOSS_DATA={
  dream_sandman:{name:'THE SANDMAN',sub:'Lord of the Nightmare Realm'},
  voidGod:{name:'VOID GOD',sub:'Master of the Cosmic Void'},
  abyss_octopus:{name:'KRAKEN',sub:'Terror of the Sunken Depths'},
  Abyssal_kraken:{name:'KRAKEN',sub:'Terror of the Sunken Depths'},
  crystalGuardian:{name:'CRYSTAL GUARDIAN',sub:'Keeper of the Prismatic Wastes'},
  sporeKing:{name:'SPORE KING',sub:'Monarch of the Fungal Core'},
  graveLord:{name:'GRAVE LORD',sub:'Tyrant of the Deadlands'},
  banditWarlord:{name:'BANDIT WARLORD',sub:'Terror of the Scorched Badlands'},
  pharaoh:{name:'PHARAOH',sub:'King of the Burning Sands'},
  iceTitan:{name:'ICE TITAN',sub:'The Frozen Colossus'},
  treant:{name:'TREANT',sub:'Guardian of the Deep Forest'},
  lichKing:{name:'LICH KING',sub:'Keeper of the Enchanted Wilds'},
  phoenix:{name:'PHOENIX',sub:'The Heart of the Volcano'},
  swampHorror:{name:'SWAMP HORROR',sub:'Devourer of the Mire'},
  bloodLord:{name:'BLOOD LORD',sub:'Sovereign of the Crimson Realm'},
  plainsBoss:{name:'ELDER ROOT',sub:'Ancient Colossus of the Plains'},
  vampireLord:{name:'VAMPIRE LORD',sub:'Ruler of the Blood Moon'},
  stoneColossus:{name:'STONE COLOSSUS',sub:'Ancient Guardian of the Depths'},
  crystalBeholder:{name:'CRYSTAL BEHOLDER',sub:'The Prismatic Gaze'},
  caveWyrm:{name:'CAVE WYRM',sub:'Terror of the Underworld'},
  lavaTitan:{name:'LAVA WYRM',sub:'Molten Scourge of the Core'},
  chickenKing:{name:'CHICKEN KING',sub:'Supreme Monarch of the Coop'},
  boss:{name:'BOSS',sub:'Unknown Terror'}
};

const HORDE_EVENTS = {
  baseCooldown: 105,
  minCooldown: 70,
  cooldownDecay: 8,
  warningDuration: 3.0,
  minLevel: 4
};

const RAINBOW_COLORS=['#ff1744','#ff9100','#ffea00','#00e676','#00b0ff','#d500f9'];

const WEAPON_DEFS={
  warhammer:{name:'Spiked Warhammer',sprite:'warhammer',icon:'warhammer',maxLevel:8,desc:'Borin\'s heavy warhammer. Hurls upward in an arc, spinning and crushing foes on impact.',
    stats:lvl=>({cooldown:Math.max(0.65, 1.7 - lvl * 0.12),damage:38 + lvl * 14,count:1 + Math.floor(lvl / 3),speed:7 + lvl * 0.5,arcHeight:280,gravity:620,radius:55 + lvl * 8,knockback:42 + lvl * 5})},
  chainWhip:{name:'Chain Whip',sprite:'chainWhip',icon:'chainWhip',maxLevel:8,desc:'Caelen\'s spiked chain whip. Snaps straight forward, piercing all enemies in its line.',
    stats:lvl=>({cooldown:Math.max(0.40, 1.2 - lvl * 0.10),damage:26 + lvl * 9,range:210 + lvl * 25,duration:0.28,knockback:25 + lvl * 4})},
  elvenBow:{name:'Elven Bow',sprite:'arrow',icon:'elvenBow',maxLevel:8,desc:'Ari\'s enchanted elven bow. Rapid piercing arrows with deadly precision.',
    stats:lvl=>({cooldown:Math.max(0.22, 0.85 - lvl * 0.08),damage:10 + lvl * 4,count:1 + Math.floor(lvl / 2),speed:18 + lvl * 1.5,pierce:2 + Math.floor(lvl / 2)})},
  orcCleaver:{name:'Stonejaw Cleaver',sprite:'orcCleaver',icon:'orcCleaver',maxLevel:8,desc:'Slashes in a massive crushing arc that knocks back all nearby enemies',
    stats:lvl=>({cooldown:Math.max(0.65, 1.6 - lvl * 0.12),damage:32 + lvl * 12,range:130 + lvl * 10,arc:Math.PI * 0.70,duration:0.28,knockback:28})},
stonePickaxe:{name:'Stone Pickaxe',sprite:'rpg_pickaxe',maxLevel:5,tool:true,desc:'Chips one nearby cave wall per swing',
     stats:lvl=>({cooldown:[1.4,1.2,1.0,0.85,0.7][lvl-1],damage:[18,24,32,42,55][lvl-1],range:[48,50,52,54,56][lvl-1],breakPad:2,maxBreaks:1}),
    fire:(px,py,dirX,dirY,stats)=>{const a=Math.atan2(dirY,dirX);return[{x:px+dirX*18,y:py+dirY*18,vx:dirX*4,vy:dirY*4,life:.18,damage:stats.damage,type:'slash',angle:a,w:stats.range,h:stats.range,hit:new Set(),isPickaxe:true,breakPad:stats.breakPad,maxBreaks:stats.maxBreaks,wallsBroken:0}];}},
bronzePickaxe:{name:'Bronze Pickaxe',sprite:'rpg_pickaxe_bronze',maxLevel:5,tool:true,desc:'Breaks up to 2 cave walls per swing',
     stats:lvl=>({cooldown:[1.2,1.0,0.85,0.7,0.55][lvl-1],damage:[28,38,50,65,85][lvl-1],range:[56,58,60,62,64][lvl-1],breakPad:2,maxBreaks:2}),
    fire:(px,py,dirX,dirY,stats)=>{const a=Math.atan2(dirY,dirX);return[{x:px+dirX*20,y:py+dirY*20,vx:dirX*5,vy:dirY*5,life:.2,damage:stats.damage,type:'slash',angle:a,w:stats.range,h:stats.range,hit:new Set(),isPickaxe:true,breakPad:stats.breakPad,maxBreaks:stats.maxBreaks,wallsBroken:0}];}},
  metalPickaxe:{name:'Metal Pickaxe',sprite:'rpg_pickaxe_metal',maxLevel:5,tool:true,desc:'Breaks up to 3 cave walls per swing',
    stats:lvl=>({cooldown:[1.0,0.85,0.7,0.55,0.45][lvl-1],damage:[40,55,75,95,120][lvl-1],range:[62,64,66,68,72][lvl-1],breakPad:14,maxBreaks:3}),
    fire:(px,py,dirX,dirY,stats)=>{const a=Math.atan2(dirY,dirX);return[{x:px+dirX*22,y:py+dirY*22,vx:dirX*5.5,vy:dirY*5.5,life:.22,damage:stats.damage,type:'slash',angle:a,w:stats.range,h:stats.range,hit:new Set(),isPickaxe:true,breakPad:stats.breakPad,maxBreaks:stats.maxBreaks,wallsBroken:0}];}},
  torch:{name:'Torch',sprite:'rpg_torch',maxLevel:5,tool:true,desc:'Illuminates a radius around you',
    stats:lvl=>({lightRadius:[150, 200, 250, 300, 400][lvl-1]}),
    fire:(px,py,dirX,dirY,stats,lv)=>{
      // Torch doesn't fire projectiles, it provides passive lighting
      return [];
    }},
  fireBreath:{name:'Fire Breath',sprite:'fireBreath',maxLevel:8,desc:'Breathes a searing torrent of dragonfire that incinerates and pushes back enemies in front of you · Evolves with Iron Helmet',
    stats:lvl=>({cooldown:Math.max(0.65, 1.8 - lvl * 0.14),damage:24 + lvl * 10,range:170 + lvl * 20,arc:Math.PI * 0.48,duration:0.52})},
  dragonInferno:{name:'Dragon Inferno',sprite:'dragonInferno',maxLevel:1,evolution:true,desc:'Unleashes an overwhelming storm of draconic hellfire in an expanded cone with double damage and explosive burns',
    stats:()=>({cooldown:0.65,damage:160,range:360,arc:Math.PI * 0.70,duration:0.65})},
  wand:{name:'Magic Wand',sprite:'arcane_bolt',icon:'wand',maxLevel:8,desc:'Fires at nearby enemies · Evolves with a level 5 Ring of Power',
    stats:lvl=>({cooldown:Math.max(.28,1-lvl*.08),damage:8+lvl*4,count:1+Math.floor(lvl/2),speed:9,pierce:lvl>=4?1:0})},
  arcaneBarrage:{name:'Arcane Barrage',sprite:'arcane_bolt',maxLevel:1,evolution:true,desc:'Unleashes 16 heavy arcane bolts in a rapid volley',
    stats:()=>({cooldown:.38,damage:13,targets:4,shotsPerTarget:4,speed:11,pierce:1})},
  arrowstorm:{name:'Arrowstorm',sprite:'arrow',maxLevel:1,evolution:true,desc:'Sweeps a wide fan of 12 piercing heavy arrows through the horde',
    stats:()=>({cooldown:.75,damage:26,count:12,spread:2.0,speed:17,pierce:3})},
  knife:{name:'Throwing Knife',sprite:'throwing_knife',maxLevel:8,desc:'Throws rapid piercing knives at nearby enemies',
    stats:lvl=>({cooldown:Math.max(.28,1.05-lvl*.1),damage:10+lvl*4,count:1+Math.floor((lvl+1)/3),speed:14,pierce:lvl>=6?2:(lvl>=3?1:0)})},
  garlic:{name:'Garlic Ward',sprite:'garlic_aura',maxLevel:8,desc:'Repels and damages nearby enemies with aura pulses',
    stats:lvl=>({cooldown:.5,damage:6+lvl*3,radius:56+lvl*14})},
  aura:{name:'Fire Aura',sprite:'fireball',icon:'aura',maxLevel:8,desc:'Blasts nearby enemies and ignites the ground',
    stats:lvl=>({cooldown:Math.max(1.2,3-lvl*.2),damage:15+lvl*6,radius:90+lvl*14})},
	boomerang:{name:'Boomerang',sprite:'boomerang',maxLevel:8,desc:'Flies out, then returns to you',
  stats:lvl=>({cooldown:Math.max(.7,1.6-lvl*.12),damage:12+lvl*5,count:1+Math.floor(lvl/3),speed:7})},
    chain:{name:'Chain Lightning',sprite:'lightning_orb',maxLevel:8,desc:'Jumps from enemy to enemy',
  stats:lvl=>({cooldown:Math.max(1.5,3-lvl*.2),damage:10+lvl*5,jumps:3+Math.floor(lvl/2),range:180})},
  bow:{name:'Longbow',sprite:'arrow',maxLevel:8,desc:'Fires fast arrows that pierce enemies · Evolves with a level 5 Ring of Power',
  stats:lvl=>({cooldown:Math.max(.25,.9-lvl*.08),damage:7+lvl*3,count:1+Math.floor(lvl/2),speed:18,pierce:2+lvl})},
   orbital:{name:'Orbiting Orbs',sprite:'orbiting_orb',maxLevel:8,desc:'Orbs spin around you',
  stats:lvl=>({cooldown:0,damage:6+lvl*3,count:1+lvl,radius:70+lvl*6,rotationSpeed:2+lvl*.15})},
    mine:{name:'Mines',sprite:'mine',maxLevel:8,desc:'Places mines that explode near enemies',
  stats:lvl=>({cooldown:Math.max(.8,1.8-lvl*.15),damage:25+lvl*12,radius:60+lvl*8,count:1+Math.floor(lvl/3)})},
  holyWater:{name:'Holy Water',sprite:'holy_water',maxLevel:8,desc:'Creates a damaging pool on impact',
  stats:lvl=>({cooldown:Math.max(1.5,3.5-lvl*.2),damage:4+lvl*3,radius:55+lvl*6,duration:4+lvl*.3})},
  crossbow:{name:'Repeating Crossbow',sprite:'crossbow_bolt',maxLevel:8,desc:'Fires a rapid spread of heavy bolts',
  stats:lvl=>({cooldown:Math.max(.5,1.45-lvl*.1),damage:10+lvl*4,count:2+Math.floor(lvl/2),speed:15,pierce:Math.floor(lvl/3)})},
  frostbolt:{name:'Frost Shards',sprite:'frost_shard',maxLevel:8,desc:'Freezes revealed enemies briefly with icy shots',
  stats:lvl=>({cooldown:Math.max(.55,1.6-lvl*.12),damage:9+lvl*4,count:1+Math.floor(lvl/3),speed:10,pierce:lvl>=5?1:0})},
  bombard:{name:'Goblin Bombard',sprite:'goblin_bomb',maxLevel:8,desc:'Lobs bombs that burst across a wide area',
  stats:lvl=>({cooldown:Math.max(1.1,2.5-lvl*.18),damage:24+lvl*10,radius:72+lvl*9,count:1+Math.floor(lvl/4)})},
  spear:{name:'Spear of Dawn',sprite:'spear',maxLevel:8,desc:'Sweeps a wide arc in front of you, piercing all enemies · Evolves with a level 1 Iron Helmet',
  stats:lvl=>({cooldown:Math.max(.6,1.6-lvl*.14),damage:18+lvl*7,arcRange:90+lvl*8,arcAngle:Math.PI*2/3,pierce:99})},
  tome:{name:"Summoner's Tome",sprite:'rpg_tome_magic',maxLevel:8,desc:'Summons arcane spirits that hunt nearby enemies  Evolves with a level 1 Amulet of Vigor',
  stats:lvl=>({cooldown:Math.max(4,8-lvl*.5),damage:14+lvl*5,count:Math.min(4,1+Math.floor(lvl/2)),duration:6+lvl*.8,speed:3+lvl*.15,attackRate:0.8})},
  voidRift:{name:'Void Rift',sprite:'void_rift',maxLevel:8,desc:'Opens a rift that pulls enemies in and damages them · Evolves with a level 5 Ring of Power',
  stats:lvl=>({cooldown:Math.max(2.5,5-lvl*.3),damage:8+lvl*4,radius:70+lvl*10,pullStrength:.3+lvl*.05,duration:1.5+lvl*.15})},
  chrono:{name:'Chrono Prism',sprite:'rpg_hourglass',maxLevel:8,desc:'Slows nearby enemies and speeds up your attacks · Evolves with a level 1 Water Boots',
  stats:lvl=>({cooldown:0,damage:0,radius:120+lvl*15,slowAmount:.15+lvl*.03,attackSpeedBonus:.04+lvl*.02})},
  glaiveSun:{name:'Glaive of the Sun',sprite:'spear',maxLevel:1,evolution:true,desc:'Sweeps a radiant circle around you',stats:()=>({cooldown:.82,damage:95,arcRange:190,arcAngle:Math.PI*2,pierce:999})},
  necromancerGrimoire:{name:"Necromancer's Grimoire",sprite:'rpg_tome_magic',maxLevel:1,evolution:true,desc:'Summons spirits that remain until defeated',stats:()=>({cooldown:4,damage:50,count:4,duration:Infinity,speed:4.8,attackRate:0.85})},
  singularity:{name:'Singularity',sprite:'void_rift',maxLevel:1,evolution:true,desc:'A gravitational vortex that devours swarms and crushes elites',stats:()=>({cooldown:6.0,damage:180,radius:200,pullStrength:.75,duration:3.8})},
  temporalLord:{name:'Temporal Lord',sprite:'rpg_hourglass',maxLevel:1,evolution:true,desc:'Slows nearby enemies by 50% and speeds up attacks by 30%',stats:()=>({cooldown:0,damage:0,radius:240,slowAmount:.5,attackSpeedBonus:.3})},
  prismStaff:{name:'Rainbow Staff',sprite:'prism_staff',shopOnly:true,maxLevel:8,desc:'Fires a sweeping rainbow arc beam that cuts through enemies in a wide curve · Evolves with Mage Crest',
    stats:lvl=>({cooldown:Math.max(1.2,2.5-lvl*0.15),damage:16+lvl*6,width:18+lvl*3,range:420+lvl*30,pierce:999})},
  rainbowBarrage:{name:'Rainbow Barrage',sprite:'prism_staff',maxLevel:1,evolution:true,desc:'Unleashes 6 prismatic lasers in a 360° rainbow barrage (+50% Damage)',
    stats:()=>({cooldown:1.2,damage:Math.round((15+8*6)*1.5),width:22,range:640,pierce:999,beams:6})},
  frostBeam:{name:'Frost Staff',sprite:'frost_staff',maxLevel:8,desc:'Fires a piercing freezing beam that freezes enemies solid in an ice block  Evolves with Frozen Core',
    stats:lvl=>({cooldown:Math.max(4.8, 8.5 - (lvl - 1) * 0.5), damage: 45 + lvl * 12, width: 18 + lvl * 3, range: 560, freezeDuration: 3.2 + lvl * 0.2, pierce: 999})},
  permafrost:{name:'Permafrost',sprite:'frost_staff',maxLevel:1,evolution:true,desc:'Doubles beam width. Frozen enemies take massive damage and shatter on death for 180 AoE ice damage.',
    stats:()=>({cooldown: 5.0, damage: 160, width: 44, range: 660, freezeDuration: 5.5, pierce: 999})}
};
if (typeof window !== 'undefined') window.WEAPON_DEFS = WEAPON_DEFS;

const LEGENDARY_SETS = [
  {
    id: 'bloodthirster',
    name: 'Bloodthirster',
    color: '#e53935',
    icon: 'rpg_sword_diamond',
    desc: 'Forged in blood to feast upon the life force of fallen foes.',
    twoPieceBonus: '+15% Attack Speed & +10% Lifesteal Rate',
    threePieceBonus: '+50% Critical Damage & Critical hits restore 5 HP',
    pieces: [
      { id: 'bloodthirster_helm', setId: 'bloodthirster', setName: 'Bloodthirster', slot: 'helm', name: 'Bloodthirster Visor', sprite: 'rpg_helmet_horned', desc: '+15% damage dealt, +5% lifesteal chance', stats: { damageMult: 1.15, lifestealChance: 0.05 } },
      { id: 'bloodthirster_armor', setId: 'bloodthirster', setName: 'Bloodthirster', slot: 'armor', name: 'Bloodthirster Cuirass', sprite: 'rpg_shield_wood', desc: '+35 Max HP, +10% damage reduction', stats: { maxHp: 35, defense: 0.10 } },
      { id: 'bloodthirster_blade', setId: 'bloodthirster', setName: 'Bloodthirster', slot: 'weapon', name: 'Bloodthirster Edge', sprite: 'rpg_sword_iron', desc: '+20% attack damage, +12% attack speed', stats: { damageMult: 1.20, attackSpeedMult: 1.12 } }
    ]
  },
  {
    id: 'stormcaller',
    name: 'Stormcaller',
    color: '#00e5ff',
    icon: 'rpg_lightningSprite',
    desc: 'Harnesses atmospheric fury to call down chaining lightning.',
    twoPieceBonus: '-15% Spell Cooldowns & +20% Projectile Speed',
    threePieceBonus: 'Every 3rd attack calls down a devastating Thunder Strike on nearby foes',
    pieces: [
      { id: 'stormcaller_helm', setId: 'stormcaller', setName: 'Stormcaller', slot: 'helm', name: 'Stormcaller Crown', sprite: 'rpg_crown', desc: '-15% cooldowns, +15% projectile speed', stats: { cooldownMult: 0.85, projSpeedMult: 1.15 } },
      { id: 'stormcaller_armor', setId: 'stormcaller', setName: 'Stormcaller', slot: 'armor', name: 'Stormcaller Raiment', sprite: 'rpg_potion_blue', desc: '+18% movement speed, storm immunity', stats: { speedMult: 1.18, stormImmune: true } },
      { id: 'stormcaller_conduit', setId: 'stormcaller', setName: 'Stormcaller', slot: 'weapon', name: 'Stormcaller Conduit', sprite: 'rpg_staff_magic', desc: 'Shots electrify enemies (+25 lightning damage)', stats: { lightningProcDamage: 25 } }
    ]
  },
  {
    id: 'titanguard',
    name: 'Titan Guard',
    color: '#ffd54f',
    icon: 'rpg_shield_gold',
    desc: 'Carved from living mountain bedrock to absorb crushing blows.',
    twoPieceBonus: '+40 Max HP & +25% Thorns Reflection',
    threePieceBonus: 'Absorbs fatal hit with 3s invulnerability (60s cd) + 20% Defense',
    pieces: [
      { id: 'titanguard_helm', setId: 'titanguard', setName: 'Titan Guard', slot: 'helm', name: 'Titan Greathelm', sprite: 'rpg_helmet_gold', desc: '+50 Max HP, +20% knockback resistance', stats: { maxHp: 50, knockbackResist: 0.20 } },
      { id: 'titanguard_armor', setId: 'titanguard', setName: 'Titan Guard', slot: 'armor', name: 'Titan Colossus Plate', sprite: 'rpg_shield_iron', desc: '+30% damage reduction, +30% thorns reflection', stats: { defense: 0.30, thorns: 0.30 } },
      { id: 'titanguard_shield', setId: 'titanguard', setName: 'Titan Guard', slot: 'weapon', name: 'Titan Bulwark', sprite: 'rpg_shield_gold', desc: 'Generates a 40 HP recharging barrier', stats: { maxShield: 40 } }
    ]
  },
  {
    id: 'voidwalker',
    name: 'Voidwalker',
    color: '#b388ff',
    icon: 'rpg_voidSpirit',
    desc: 'Bends space to phase through swarms and multiply ricochets.',
    twoPieceBonus: '+20% Dodge Chance & +15% Movement Speed',
    threePieceBonus: 'All projectiles ricochet 2 extra times with +35% Void area explosions',
    pieces: [
      { id: 'voidwalker_helm', setId: 'voidwalker', setName: 'Voidwalker', slot: 'helm', name: 'Voidwalker Cowl', sprite: 'rpg_crystal_purple', desc: '+20% dodge chance, shadows trail your steps', stats: { dodgeChance: 0.20 } },
      { id: 'voidwalker_armor', setId: 'voidwalker', setName: 'Voidwalker', slot: 'armor', name: 'Voidwalker Shroud', sprite: 'rpg_book_blue', desc: '+15% movement speed, phases through enemies', stats: { speedMult: 1.15, phaseThrough: true } },
      { id: 'voidwalker_eye', setId: 'voidwalker', setName: 'Voidwalker', slot: 'weapon', name: 'Voidwalker Eye', sprite: 'rpg_gem_amethyst', desc: '+25% XP gain, projectiles pierce 2 extra foes', stats: { xpMult: 1.25, extraPierce: 2 } }
    ]
  },
  {
    id: 'solararchon',
    name: 'Solar Archon',
    color: '#ff9800',
    icon: 'rpg_lightSpirit',
    desc: 'Infused with primal stellar fire to incinerate surrounding hordes.',
    twoPieceBonus: '+2.5 HP/sec Regen & +25% Fire Damage',
    threePieceBonus: 'Defeated enemies explode in radiant bursts of fire dealing 150 area damage',
    pieces: [
      { id: 'solararchon_helm', setId: 'solararchon', setName: 'Solar Archon', slot: 'helm', name: 'Solar Diadem', sprite: 'rpg_gem_diamond', desc: '+2.0 HP/sec regen, illuminates dark nights', stats: { regen: 2.0 } },
      { id: 'solararchon_armor', setId: 'solararchon', setName: 'Solar Archon', slot: 'armor', name: 'Solar Archon Aegis', sprite: 'rpg_chest_gold', desc: '+20% damage, burning sun aura (35 DPS)', stats: { damageMult: 1.20, sunAuraDps: 35 } },
      { id: 'solararchon_scepter', setId: 'solararchon', setName: 'Solar Archon', slot: 'weapon', name: 'Solar Dawn Scepter', sprite: 'rpg_staff_wood', desc: 'Attacks ignite enemies with holy fire', stats: { holyIgniteDps: 30 } }
    ]
  }
];

const ALL_LEGENDARY_PIECES = LEGENDARY_SETS.flatMap(s => s.pieces);

const ALL_TRINKETS = [
  // Core & Gem Trinkets
  { id: 't_luckycoin', name: 'Lucky Coin', sprite: 'Lucky_Coin', desc: '+12% Relic Drop Chance', requiresCamp: true, stats: { luckMult: 0.12 } },
  { id: 't_vampfang', name: 'Vampire Fang', sprite: 'Vampire_Fang', desc: '+5% Lifesteal', requiresCamp: true, stats: { lifesteal: 0.05 } },
  { id: 't_feather', name: 'Swift Feather', sprite: 'Swift_Feather', desc: '+8% Move Speed', stats: { moveSpeed: 0.08 } },
  { id: 't_ironring', name: 'Iron Ring', sprite: 'Iron_Ring', desc: '+3 Armor (+15% Defense)', stats: { armor: 3 } },
  { id: 't_rubydrop', name: 'Ruby Drop', sprite: 'Ruby_Drop', desc: '+25 Max HP', stats: { maxHp: 25 } },
  { id: 't_sapphiredrop', name: 'Sapphire Drop', sprite: 'Sapphire_Drop', desc: '+10% XP Gain', stats: { xpMult: 0.10 } },
  { id: 't_emeralddrop', name: 'Emerald Drop', sprite: 'Emerald_Drop', desc: '+1.5 HP/sec Regen', stats: { regen: 1.5 } },
  { id: 't_topazdrop', name: 'Topaz Drop', sprite: 'Topaz_Drop', desc: '+15% Gold Found', stats: { goldMult: 0.15 } },
  { id: 't_amethystdrop', name: 'Amethyst Drop', sprite: 'amethyst_drop', desc: '+10% Damage', stats: { damageMult: 0.10 } },
  { id: 't_diamonddrop', name: 'Diamond Drop', sprite: 'Diamond_Drop', desc: '+5% Crit Chance', requiresCamp: true, stats: { critChance: 0.05 } },
  { id: 't_thiefglove', name: 'Thief Glove', sprite: 'Thief_Glove', desc: '+20 Pickup Range', stats: { pickupRange: 20 } },

  // Class Crest Trinkets
  { id: 't_warriorcrest', name: 'Warrior Crest', sprite: 'warrior_crest', desc: '+15% Melee Damage', stats: { meleeMult: 0.15 } },
  { id: 't_magecrest', name: 'Mage Crest', sprite: 'Mage_Crest', desc: '+15% Magic Damage', stats: { magicMult: 0.15 } },
  { id: 't_huntercrest', name: 'Hunter Crest', sprite: 'Hunter_Crest', desc: '+10% Projectile Speed', stats: { projSpeed: 0.10 } },
  { id: 't_assassincrest', name: 'Assassin Crest', sprite: 'Assassin_Crest', desc: '+20% Crit Damage', stats: { critMult: 0.20 } },
  { id: 't_defendercrest', name: 'Defender Crest', sprite: 'Defender_Crest', desc: '-10% Damage Taken', stats: { defenseMult: -0.10 } },
  { id: 't_berserkercrest', name: 'Berserker Crest', sprite: 'Berserker_Crest', desc: '+10% Attack Speed', stats: { attackSpeed: 0.10 } },
  { id: 't_clericcrest', name: 'Cleric Crest', sprite: 'Cleric_Crest', desc: '+15% Healing Received', stats: { healingMult: 0.15 } },
  { id: 't_alchemistcrest', name: 'Alchemist Crest', sprite: 'Alchemist_Crest', desc: '+10% Poison Damage', stats: { poisonMult: 0.1 } },
  { id: 't_pyromancercrest', name: 'Pyromancer Crest', sprite: 'Pyromancer_Crest', desc: '+10% Fire Damage', stats: { fireMult: 0.1 } },
  { id: 't_cryomancercrest', name: 'Cryomancer Crest', sprite: 'Cryomancer_Crest', desc: '+10% Ice Damage', stats: { iceMult: 0.1 } },
  { id: 't_electromancercrest', name: 'Electro Crest', sprite: 'Electro_Crest', desc: '+10% Lightning Damage', stats: { lightningMult: 0.1 } },
  { id: 't_necromancercrest', name: 'Necromancer Crest', sprite: 'Necromancer_Crest', desc: '+10% Summon Damage', stats: { summonMult: 0.1 } },
  { id: 't_druidcrest', name: 'Druid Crest', sprite: 'Druid_Crest', desc: '+10% Summon HP', stats: { summonHp: 0.1 } },
  { id: 't_beastmastercrest', name: 'Beastmaster Crest', sprite: 'Beastmaster_Crest', desc: '+10% Companion Damage', stats: { compMult: 0.1 } },
  { id: 't_tinkercrest', name: 'Tinker Crest', sprite: 'Tinker_Crest', desc: '+10% Trap Damage', stats: { trapMult: 0.1 } },
  { id: 't_explorercrest', name: 'Explorer Crest', sprite: 'Explorer_Crest', desc: '+10% Fog Reveal Range', stats: { fogRange: 0.1 } },
  { id: 't_merchantcrest', name: 'Merchant Crest', sprite: 'Merchant_Crest', desc: '-5% Shop Prices', stats: { shopPrice: -0.05 } },
  { id: 't_gamblercrest', name: 'Gambler Crest', sprite: 'Gambler_Crest', desc: '+5% Dodge Chance', stats: { dodgeChance: 0.05 } },
  { id: 't_championcrest', name: 'Champion Crest', sprite: 'Champion_Crest', desc: '+5% Boss Damage', requiresCamp: true, stats: { bossMult: 0.05 } },
  { id: 't_waterstone', name: 'Water Stone', sprite: 'Water_Stone', desc: '-10% Water Penalty', stats: { waterSlow: -0.1 } },

  // Specialty Trinkets
  { id: 't_bloodstone', name: 'Blood Stone', sprite: 'Blood_Stone', desc: '+1 Max HP/kill (max 50)', requiresCamp: true, stats: { maxHpKill: 50 } },
  { id: 't_magnet', name: 'Orb Magnet', sprite: 'Orb_Magnet', desc: 'Collects all orbs on the ground', requiresCamp: true, stats: { pickupRange: 5000 } },

  // Special Trophies Trinkets (from Special Items)
  { id: 'spyglass', name: 'Spyglass', sprite: 'Spyglass', desc: '+20% Fog Reveal Range', requiresCamp: true, stats: { fogRange: 0.20 } },
  { id: 'necklace', name: 'Amulet of Vigor', sprite: 'Amulet_of_Vigor', desc: '+20 Max HP', stats: { maxHp: 20 } },
  { id: 'wizard_hat', name: "Wizard's Hat", sprite: 'Wizards_Hat', desc: '+10% Magic Damage', stats: { magicMult: 0.10 } },
  { id: 'ring_emerald', name: 'Emerald Ring', sprite: 'Emerald_Ring', desc: '+1 HP/sec Regen', stats: { regen: 1.0 } },
  { id: 'gold_pouch', name: 'Gold Pouch', sprite: 'Gold_Pouch', desc: '+10% Gold Found', stats: { goldMult: 0.10 } },
  { id: 'pocket_watch', name: 'Pocket Watch', sprite: 'Pocket_Watch', desc: '-10% Cooldowns', stats: { attackSpeed: 0.10 } },
  { id: 'crystal_shard', name: 'Crystal Shard', sprite: 'Crystal_Shard', desc: '+10% Ice Damage', stats: { iceMult: 0.10 } },
  { id: 'boots_winged', name: 'Winged Boots', sprite: 'Winged_Boots', desc: '+10% Move Speed', stats: { moveSpeed: 0.10 } },
  { id: 'potion_belt', name: 'Potion Belt', sprite: 'Potion_Belt', desc: '+5% Healing Received', stats: { healingMult: 0.05 } },
  { id: 'hourglass', name: 'Hourglass', sprite: 'Hourglass', desc: '+5% Attack Speed', stats: { attackSpeed: 0.05 } },
  { id: 'lantern', name: 'Lantern', sprite: 'Lantern', desc: '+50% Light Radius (Underworld/Abyss)', requiresCamp: true, stats: { lightRadius: 0.50 } },
  { id: 'chalice_gold', name: 'Golden Chalice', sprite: 'Golden_Chalice', desc: '+10% Lifesteal', requiresCamp: true, stats: { lifesteal: 0.10 } },
  { id: 'compass', name: 'Compass', sprite: 'Compass', desc: 'Reveals nearest Relic on minimap', requiresCamp: true, stats: { revealRelic: true } },
  { id: 'arrow_bundle', name: 'Arrow Bundle', sprite: 'Arrow_Bundle', desc: '+10% Projectile Speed', stats: { projSpeed: 0.10 } },
  { id: 'lavender', name: 'Lavender Bundle', sprite: 'Lavender_Bundle', desc: '+10% Healing Received', stats: { healingMult: 0.10 } },
  { id: 'gloves_leather', name: 'Leather Gloves', sprite: 'Leather_Gloves', desc: '+5% Melee Damage', stats: { meleeMult: 0.05 } },
  { id: 'book_star', name: 'Star Tome', sprite: 'Star_Tome', desc: '+10% XP Gain', stats: { xpMult: 0.10 } },
  { id: 'anchor_chain', name: 'Anchor Chain', sprite: 'Anchor_Chain', desc: '+15% Armor, -5% Move Speed', stats: { defenseMult: -0.15, moveSpeed: -0.05 } },
  { id: 'heart_locket', name: 'Heart Locket', sprite: 'Heart_Locket', desc: '+20 Max HP', stats: { maxHp: 20 } },
];

const CAMP_WEAPONS=[
  {id:'warhammer',name:'Spiked Warhammer',sprite:'warhammer',desc:'Borin\'s heavy warhammer. Hurls upward in an arc, spinning and crushing foes on impact.',cost:480},
  {id:'chainWhip',name:'Chain Whip',sprite:'chainWhip',desc:'Caelen\'s spiked chain whip. Snaps straight forward, piercing all enemies in its line.',cost:480},
  {id:'elvenBow',name:'Elven Bow',sprite:'elvenBow',desc:'Ari\'s enchanted elven bow. Rapid piercing arrows with deadly precision.',cost:480},
  {id:'orcCleaver',name:'Stonejaw Cleaver',sprite:'orcCleaver',desc:'Ruk\'s colossal bone-cleaver. Slashes through hordes with crushing force.',cost:500},
  {id:'wand',name:'Magic Wand',sprite:'wand',desc:'Fires arcane bolts at nearby enemies · Evolves with a level 5 Ring of Power.',cost:0},
  {id:'fireBreath',name:'Fire Breath',sprite:'fireBreath',desc:'Breathes searing dragonfire in front of you.',cost:500},
  {id:'knife',name:'Trail Knife',sprite:'throwing_knife',desc:'Quick, close-range blades.',cost:250},
  {id:'bow',name:'Longbow',sprite:'arrow',desc:'Fast arrows with piercing shots.',cost:300},
  {id:'garlic',name:'Warding Charm',sprite:'garlic_aura',desc:'A protective damage aura.',cost:280},
  {id:'aura',name:'Ember Flask',sprite:'aura',desc:'A blast of fire around you.',cost:350},
  {id:'crossbow',name:'Repeating Crossbow',sprite:'crossbow_bolt',desc:'Rapid volleys of heavy bolts.',cost:450},
  {id:'frostbolt',name:'Frost Shards',sprite:'frost_shard',desc:'Icy shots slow enemies they hit.',cost:400},
  {id:'bombard',name:'Goblin Bombard',sprite:'goblin_bomb',desc:'Lob area-burst bombs at nearby foes.',cost:500},
  {id:'spear',name:'Spear of Dawn',sprite:'spear',desc:'Wide melee sweep that pierces all nearby enemies.',cost:480},
  {id:'tome',name:"Summoner's Tome",sprite:'rpg_tome_magic',desc:'Summons spirits that hunt and fight nearby foes.',cost:600},
  {id:'voidRift',name:'Void Rift',sprite:'void_rift',desc:'Pulls nearby enemies into a damaging rift.',cost:650},
  {id:'chrono',name:'Chrono Prism',sprite:'rpg_hourglass',desc:'Slows nearby enemies and speeds your attacks.',cost:550},
  {id:'frostBeam',name:'Frost Staff',sprite:'frost_staff',desc:'Fires a piercing freezing beam that freezes enemies in its path.',cost:580}
];
const CAMP_TOOLS=[
  {id:'stonePickaxe',name:'Stone Pickaxe',sprite:'rpg_pickaxe',desc:'Breaks 1 cave wall per swing.',cost:150},
  {id:'bronzePickaxe',name:'Bronze Pickaxe',sprite:'rpg_pickaxe_bronze',desc:'Breaks up to 2 cave walls per swing.',cost:900},
  {id:'metalPickaxe',name:'Metal Pickaxe',sprite:'rpg_pickaxe_metal',desc:'Breaks up to 3 cave walls per swing.',cost:2200},
  {id:'torch',name:'Torch',sprite:'rpg_torch',desc:'Illuminate the darkness around you.',cost:100}
];

// ===========================================================
// MATERIALS SYSTEM (Phase 1)
// ===========================================================
const MATERIALS = {
  abyssalKey: {
    id: 'abyssalKey',
    name: 'The Abyssal Key',
    sprite: 'Abyssal_Key',
    rarity: 'mythic',
    rarityLabel: 'Secret Key',
    rarityColor: '#00e5ff',
    desc: 'An ancient crystalline oceanic key unsealed from the Sunken Shrine. Unlocks passage to The Sunken Depths (The Abyss).',
    effectDesc: '+10 Max HP & +15% Damage in submerged areas permanently',
    consume: (save, plyr) => {
      save.hasAbyssalKey = true;
      save.permHpBonus = (save.permHpBonus || 0) + 10;
      if (plyr) {
        plyr.maxHp += 10;
        plyr.hp = Math.min(plyr.hp + 10, plyr.maxHp);
      }
      return '+10 Max HP gained! The Abyssal Key permanently unseals The Sunken Depths.';
    }
  },
  tidecallersConch: {
    id: 'tidecallersConch',
    name: "Tidecaller's Conch",
    sprite: 'Tidecallers_Conch',
    rarity: 'legendary',
    rarityLabel: 'Legendary Relic',
    rarityColor: '#00e5ff',
    desc: "An ancient sea horn gifted by Caelen. Blow it under the open sky to summon a 60-second deluge (Flood).",
    effectDesc: "Active power: Blow the conch in-run to summon a 60s Deluge (1x/run)",
    consume: (save) => {
      save.hasTidecallerConch = true;
      return "The Tidecaller's Conch is permanently attuned to your expedition kit!";
    }
  },
  abyssalHeart: {
    id: 'abyssalHeart',
    name: 'Abyssal Heart',
    sprite: 'rpg_abyssalHeart',
    rarity: 'mythic',
    rarityLabel: 'Mythic',
    rarityColor: '#00e5ff',
    desc: 'A throbbing oceanic core pulsating with torrential abyssal energy from the Kraken.',
    effectDesc: '+35 Max HP & +6% Movement Speed permanently',
    consume: (save, plyr) => {
      save.permHpBonus = (save.permHpBonus || 0) + 35;
      save.permSpeedBonus = (save.permSpeedBonus || 0) + 0.17;
      plyr.maxHp += 35;
      plyr.hp = Math.min(plyr.hp + 35, plyr.maxHp);
      plyr.speed += 0.17;
      return '+35 Max HP & +6% Speed permanently!';
    }
  },
  voidEssence: {
    id: 'voidEssence',
    name: 'Void Essence',
    sprite: 'rpg_voidEssence',
    rarity: 'mythic',
    rarityLabel: 'Mythic',
    rarityColor: '#e040fb',
    desc: 'Pulsing cosmic energy harvested from the heart of the Void God.',
    effectDesc: '+25 Max HP & +5% All Damage permanently',
    consume: (save, plyr) => {
      save.permHpBonus = (save.permHpBonus || 0) + 25;
      save.permDmgBonus = (save.permDmgBonus || 0) + 0.05;
      plyr.maxHp += 25;
      plyr.hp = Math.min(plyr.hp + 25, plyr.maxHp);
      plyr.damageMultiplier = (plyr.damageMultiplier || 1) + 0.05;
      return '+25 Max HP & +5% Damage gained permanently!';
    }
  },
  phoenixFeather: {
    id: 'phoenixFeather',
    name: 'Phoenix Feather',
    sprite: 'rpg_phoenixFeather',
    rarity: 'legendary',
    rarityLabel: 'Legendary',
    rarityColor: '#ff9800',
    desc: 'A radiant feather burning with eternal warmth from the Volcano Phoenix.',
    effectDesc: '+0.5 HP/s Passive Regen permanently',
    consume: (save, plyr) => {
      save.permRegenBonus = (save.permRegenBonus || 0) + 0.5;
      plyr.regen = (plyr.regen || 0) + 0.5;
      return '+0.5 HP/s Passive Regen gained permanently!';
    }
  },
  frozenCore: {
    id: 'frozenCore',
    name: 'Frozen Core',
    sprite: 'rpg_frozenCore',
    rarity: 'epic',
    rarityLabel: 'Epic',
    rarityColor: '#4fc3f7',
    desc: 'An intensely chilled crystalline core taken from the Ice Titan.',
    effectDesc: '+4% Armor / Damage Reduction permanently',
    consume: (save, plyr) => {
      save.permDefenseBonus = (save.permDefenseBonus || 0) + 0.04;
      plyr.defense = Math.min(0.8, (plyr.defense || 0) + 0.04);
      return '+4% Armor / Damage Reduction gained permanently!';
    }
  },
  ancientBark: {
    id: 'ancientBark',
    name: 'Ancient Bark',
    sprite: 'rpg_ancientBark',
    rarity: 'rare',
    rarityLabel: 'Rare',
    rarityColor: '#81c784',
    desc: 'Petrified, moss-covered bark harvested from the ancient Treant.',
    effectDesc: '+15 Max HP permanently',
    consume: (save, plyr) => {
      save.permHpBonus = (save.permHpBonus || 0) + 15;
      plyr.maxHp += 15;
      plyr.hp = Math.min(plyr.hp + 15, plyr.maxHp);
      return '+15 Max HP gained permanently!';
    }
  },
  goldOre: {
    id: 'goldOre',
    name: 'Gold Ore',
    sprite: 'rpg_ore_gold',
    rarity: 'uncommon',
    rarityLabel: 'Uncommon',
    rarityColor: '#ffd54f',
    desc: 'A glittering nugget of dense gold ore dropped by elite enemies.',
    effectDesc: 'Smelt into +150 Gold immediately',
    consume: (save, plyr) => {
      save.gold = (save.gold || 0) + 150;
      return '+150 Gold added to your pouch!';
    }
  },
  dwarvenSteel: {
    id: 'dwarvenSteel',
    name: 'Dwarven Steel',
    sprite: 'rpg_dwarvenSteel',
    rarity: 'rare',
    rarityLabel: 'Rare',
    rarityColor: '#b0bec5',
    desc: 'Heavy alloy forged in the molten furnaces of the Dwarf City.',
    effectDesc: '+3% Move Speed permanently',
    consume: (save, plyr) => {
      save.permSpeedBonus = (save.permSpeedBonus || 0) + 0.03;
      plyr.speed = (plyr.speed || 2.8) * 1.03;
      return '+3% Move Speed gained permanently!';
    }
  },
  cosmicDust: {
    id: 'cosmicDust',
    name: 'Cosmic Dust',
    sprite: 'rpg_cosmicDust',
    rarity: 'epic',
    rarityLabel: 'Epic',
    rarityColor: '#ba68c8',
    desc: 'Fine crystalline powder from dimensional rifts that alters fate.',
    effectDesc: '+1 Reroll & +1 Banish per run permanently',
    consume: (save, plyr) => {
      save.permRerolls = (save.permRerolls || 0) + 1;
      save.permBanishes = (save.permBanishes || 0) + 1;
      plyr.rerolls = (plyr.rerolls || 0) + 1;
      plyr.banishes = (plyr.banishes || 0) + 1;
      return '+1 Reroll & +1 Banish per run gained permanently!';
    }
  },
  goldenEgg: {
    id: 'goldenEgg',
    name: 'Golden Egg',
    sprite: 'goldenEgg',
    rarity: 'mythic',
    rarityLabel: 'Mythic Quest Item',
    rarityColor: '#ffd700',
    desc: 'A radiant solid-gold egg laid by the Chicken King. Opens the Chicken Shrine portal and fortifies vitality (Max 5 HP stacks).',
    effectDesc: '+5 Max HP permanently (Max 5 stacks) & unlocks Chicken Shrine Portal',
    consume: (save, plyr) => {
      save.hasGoldenEgg = true;
      const cur = Number(save.goldenEggStacks) || 0;
      if (cur >= 5) {
        save.gold = (save.gold || 0) + 150;
        return 'Max 5 Golden Egg HP stacks reached! Shrine key active & converted to +150 Gold.';
      }
      save.goldenEggStacks = cur + 1;
      save.permHpBonus = (save.permHpBonus || 0) + 5;
      plyr.maxHp += 5;
      plyr.hp = Math.min(plyr.hp + 5, plyr.maxHp);
      return `+5 Max HP gained permanently! (${save.goldenEggStacks}/5 Golden Eggs)`;
    }
  },
  chickenFeather: {
    id: 'chickenFeather',
    name: 'Chicken Feather',
    sprite: 'chickenFeather',
    rarity: 'legendary',
    rarityLabel: 'Legendary',
    rarityColor: '#ffca28',
    desc: 'An enchanted tail-feather from the Chicken King that permanently lightens your footsteps (Max 5).',
    effectDesc: '+1% Movement Speed permanently (Max 5 stacks)',
    consume: (save, plyr) => {
      const cur = Number(save.chickenFeathers) || 0;
      if (cur >= 5) {
        save.gold = (save.gold || 0) + 100;
        return 'Max 5 Chicken Feather stacks reached! Converted to +100 Gold.';
      }
      save.chickenFeathers = cur + 1;
      save.permSpeedBonus = (save.permSpeedBonus || 0) + 0.01;
      plyr.speed *= 1.01;
      return `+1% Move Speed permanently! (${save.chickenFeathers}/5 Feathers)`;
    }
  },
  chickenKingCrown: {
    id: 'chickenKingCrown',
    name: "Chicken King's Crown",
    sprite: 'chickenCrown',
    rarity: 'mythic',
    rarityLabel: 'Mythic Crown & Trophy',
    rarityColor: '#ffab00',
    desc: 'The royal golden crown of the Chicken King. Worn atop your head as a symbol of poultry sovereignty (Max 3 stat stacks).',
    effectDesc: 'Cosmetic Head Crown + Consume for +10 Max HP & +2% All Damage permanently (Max 3 stacks)',
    consume: (save, plyr) => {
      save.unlockedChickenCrown = true;
      save.equippedChickenCrown = true;
      const cur = Number(save.chickenCrownStacks) || 0;
      if (cur >= 3) {
        save.gold = (save.gold || 0) + 250;
        return 'Max 3 Chicken Crown stacks reached! Crown equipped & converted to +250 Gold.';
      }
      save.chickenCrownStacks = cur + 1;
      save.permHpBonus = (save.permHpBonus || 0) + 10;
      save.permDmgBonus = (save.permDmgBonus || 0) + 0.02;
      plyr.maxHp += 10;
      plyr.hp = Math.min(plyr.hp + 10, plyr.maxHp);
      plyr.damageMultiplier = (plyr.damageMultiplier || 1) + 0.02;
      return `+10 Max HP, +2% All Damage (${save.chickenCrownStacks}/3 Crowns) & Chicken Crown equipped!`;
    }
  },
  chickenCoin: {
    id: 'chickenCoin',
    name: 'Chicken Coin',
    sprite: 'chickenCoin',
    rarity: 'rare',
    rarityLabel: 'Rare Currency',
    rarityColor: '#ffd54f',
    desc: 'An ancient coin minted in the secret Chicken Dimension.',
    effectDesc: 'Exchange for +250 Camp Gold',
    consume: (save, _plyr) => {
      save.gold = (save.gold || 0) + 250;
      return '+250 Camp Gold added!';
    }
  }
};
if (typeof window !== 'undefined') window.MATERIALS = MATERIALS;

const CAMP_GEAR=[
  {id:'boots',sprite:'boots',cost:180},
  {id:'ring',sprite:'ring',cost:300},
  {id:'helmet',sprite:'helmet',cost:250},
  {id:'amulet',sprite:'amulet',cost:250},
  {id:'rainbow_staff',sprite:'prism_staff',cost:100000,isLegendaryWeapon:true,weaponId:'prismStaff',tooltip:'The ultimate weapon. Only the richest can afford it.'}
];
const CAMP_COMPANIONS=[
  // ─── PLAINS (Valley Camp) ──────────────────────────────────
  {id:'fox',name:'Ember, Little Familiar',sprite:'campFox',role:'Familiar',cost:250,biome:'plains',desc:'Runs ahead and dashes through enemies with a fiery strike.',quote:'Yip! The valley grass smells sweet and clear.'},
  {id:'aldric',name:'Sir Aldric, the Shield-bearer',sprite:'comp_aldric',role:'Tank',cost:500,biome:'plains',desc:'Intercepts damage aimed at you, grants vanguard defense, and taunts nearby foes.',quote:'Stand firm. My shield is pledged to your safety.'},

  // ─── FOREST (Forest Camp) ──────────────────────────────────
  {id:'scout',name:'Mira, Trail Scout',sprite:'comp_scout',role:'Archer',cost:300,biome:'forest',desc:'Circles the fight and fires rapid tracking arrows from the foliage.',quote:'Keep low in the ferns, Wayfarer. Danger stalks these woods.'},
  {id:'kael',name:'Kael, the Raven Spy',sprite:'comp_kael',role:'Recon',cost:350,biome:'forest',desc:'Reveals fog further, marks targets for +15% damage, and warns of bosses.',quote:'Caw! Eyes in the clouds, blades in the shadows.'},

  // ─── DESERT (Desert Camp) ──────────────────────────────────
  {id:'morvath',name:'Morvath, the Bone Apprentice',sprite:'comp_morvath',role:'Summoner',cost:130,biome:'desert',desc:'Summons skeletal minions that fight for you, and detonates corpses.',quote:'Dust to dust, yet bone endures forever.'},

  // ─── SNOW (Frost Camp) ─────────────────────────────────────
  {id:'fenrir',name:'Fenrir, the Wolf Pup',sprite:'comp_fenrir',role:'Melee DPS',cost:200,biome:'snow',desc:'Hunts with you. Howls to slow enemies by 40% and gains frenzy on kills.',quote:'*Soft wolf whimper* ...ready to hunt across the frozen drifts!'},
  {id:'healer',name:'Sister Rowan',sprite:'comp_healer',role:'Field medic',cost:90,biome:'snow',desc:'Fires spirit bolts and restores health in pulses.',quote:'May the light steady your trembling hands.'},

  // ─── MAGIC FOREST (Enchanted Camp) ─────────────────────────
  {id:'selene',name:'Selene, Arcane Familiar',sprite:'comp_selene',role:'Arcane Magic',cost:400,biome:'magicForest',desc:'Casts arcane starbolts, grants +10% XP, and reveals hidden relics.',quote:'The ley lines hum with restless arcane energy tonight.'},

  // ─── VOLCANO (Volcanic Camp) ───────────────────────────────
  {id:'ashe',name:'Ashe, the Phoenix Hatchling',sprite:'comp_ashe',role:'Revive & Burn',cost:320,biome:'volcano',desc:'Grants +10% fire damage, a fiery burn aura, and one resurrection per run.',quote:'Chirp! Sparks fly wherever I flutter!'}
];

const BIOME_SCENE_FAMILIARS = {
  plains: [
    { id: 'fox', sprite: 'campFox', size: 84, x: 0.34, y: 0.82 },
    { id: 'aldric', sprite: 'comp_aldric', size: 92, x: 0.60, y: 0.80 }
  ],
  forest: [
    { id: 'scout', sprite: 'comp_scout', size: 88, x: 0.34, y: 0.82 },
    { id: 'kael', sprite: 'comp_kael', size: 78, x: 0.60, y: 0.78 }
  ],
  desert: [
    { id: 'morvath', sprite: 'comp_morvath', size: 92, x: 0.46, y: 0.80 }
  ],
  snow: [
    { id: 'fenrir', sprite: 'comp_fenrir', size: 88, x: 0.34, y: 0.80 },
    { id: 'healer', sprite: 'comp_healer', size: 92, x: 0.60, y: 0.80 }
  ],
  magicForest: [
    { id: 'selene', sprite: 'comp_selene', size: 88, x: 0.46, y: 0.80 }
  ],
  volcano: [
    { id: 'ashe', sprite: 'comp_ashe', size: 84, x: 0.46, y: 0.79 }
  ]
};

const CAMP_BUILDING_NPCS = {
  plains: {
    store: { id: 'store_bartholomew', sprite: 'npc_bartholomew', name: 'Bartholomew the Peddler', title: 'Frontier Merchant', quote: 'Fresh from the trade routes! Fine weapons, sturdy tools, and survival kit for the road.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_rikkt',         sprite: 'npc_rikkt',       name: 'Rikkt the Dice Fiend',    title: 'Tavern Host & Gambler', quote: 'Pull up a stool by the hearth! A hot stew and a game of dice will warm any traveler.', size: 92, x: 0.18, y: 0.75 }
  },
  forest: {
    store: { id: 'store_caelen',      sprite: 'npc_caelen',      name: 'Caelen the Ranger',       title: 'Forest Quartermaster', quote: 'Stock up on arrows and hunting kit before you plunge into the deep canopy.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_alistair',      sprite: 'npc_alistair',    name: 'Old Man Alistair',        title: 'Reclusive Hermit & Storyteller', quote: 'Rest your bones, young traveler. The ancient woods are unforgiving to the weary.', size: 92, x: 0.18, y: 0.75 }
  },
  desert: {
    store: { id: 'store_tariq',       sprite: 'npc_tariq',       name: 'Tariq of the Dunes',      title: 'Caravan Trader', quote: 'Water is precious, but my blades are sharp! Camel-tested wares for the harsh dunes.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_rikkt',         sprite: 'npc_rikkt',       name: 'Baron Sterling',          title: 'Oasis Saloon Master', quote: 'An oasis of luxury amidst the burning sands! Refresh yourself before the desert night falls.', size: 92, x: 0.18, y: 0.75 }
  },
  snow: {
    store: { id: 'store_thrain',      sprite: 'npc_thrain',      name: 'Thrain Ironforge',        title: 'Dwarven Armorer', quote: 'Dwarven steel never cracks in the frost! Cold-forged armor and heavy blades, right here.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_caelen',        sprite: 'npc_caelen',      name: 'Caelen the Stranded',     title: 'Frost Lodgekeeper', quote: 'The blizzard howls outside, but the fire is roaring. Have a mug of hot spiced mead.', size: 92, x: 0.18, y: 0.75 }
  },
  swamp: {
    store: { id: 'store_corvus',      sprite: 'npc_corvus',      name: 'Corvus the Alchemist',    title: 'Plague Doctor & Apothecary', quote: 'Leech-proof boots, anti-venom draughts, and purified iron. You will need them all.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_vesper',        sprite: 'npc_vesper',      name: 'Vesper the Bone Seer',    title: 'Occult Mystic & Innkeeper', quote: 'The mist speaks of treacherous waters. Rest in the dry hut and let the spirits guide you.', size: 92, x: 0.18, y: 0.75 }
  },
  magicForest: {
    store: { id: 'store_vance',       sprite: 'npc_vance',       name: 'Lord Vance',              title: 'Guild Quartermaster', quote: 'Guild supplies of the highest pedigree! Enchanted relics and polished steel.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_malakor',       sprite: 'npc_malakor',     name: 'Malakor Nightblade',      title: 'Shadow Mercenary & Bouncer', quote: 'Keep your coin purse close and your wits sharp. Strange dreams haunt these woods.', size: 92, x: 0.18, y: 0.75 }
  },
  volcano: {
    store: { id: 'store_thrain',      sprite: 'npc_thrain',      name: 'Thrain Ironforge',        title: 'Heat-Tempered Armorer', quote: 'Heat-tempered obsidian and volcano-hardened armor! Tested against dragon fire.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_malakor',       sprite: 'npc_malakor',     name: 'Malakor Nightblade',      title: 'Magma Tavern Watcher', quote: 'The air smells of sulfur and ash. Drink quick and keep your boots laced tight.', size: 92, x: 0.18, y: 0.75 }
  },
  crystalWastes: {
    store: { id: 'store_vance',       sprite: 'npc_vance',       name: 'Lord Vance',              title: 'Prism Merchant', quote: 'Resonant crystal blades and prism-crafted shields. The finest catalog on the frontier.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_alistair',      sprite: 'npc_alistair',    name: 'Old Man Alistair',        title: 'Hermit Sage', quote: 'The humming crystals can soothe or shatter the mind. Sit and rest while your senses settle.', size: 92, x: 0.18, y: 0.75 }
  },
  fungalWastes: {
    store: { id: 'store_corvus',      sprite: 'npc_corvus',      name: 'Corvus the Alchemist',    title: 'Mycological Chemist', quote: 'Spore masks and fungal-treated weapons. Do not inhale the blue dust out there.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_vesper',        sprite: 'npc_vesper',      name: 'Vesper the Bone Seer',    title: 'Spore Refuge Hostess', quote: 'Beneath the giant mushrooms, time moves strangely. Rest your weary eyes, traveler.', size: 92, x: 0.18, y: 0.75 }
  },
  deadlands: {
    store: { id: 'store_corvus',      sprite: 'npc_corvus',      name: 'Corvus the Alchemist',    title: 'Sanctified Provisioner', quote: 'Holy water, consecrated silver, and purifying salts. Essential for walking the tombs.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_malakor',       sprite: 'npc_malakor',     name: 'Malakor Nightblade',      title: 'Crypt Saloon Sentinel', quote: 'The dead do not sleep, but you must. I will watch the door while you catch your breath.', size: 92, x: 0.18, y: 0.75 }
  },
  badlands: {
    store: { id: 'store_tariq',       sprite: 'npc_tariq',       name: 'Tariq of the Dunes',      title: 'Wasteland Quartermaster', quote: 'Gunslinger grit and desert steel! Rugged gear for the scorched wasteland.', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_rikkt',         sprite: 'npc_rikkt',       name: 'Rikkt the Dice Fiend',    title: 'Scorched Saloon Host', quote: 'High stakes and dusty boots! The saloon is open for all survivor vagabonds.', size: 92, x: 0.18, y: 0.75 }
  },
  undergroundCave: {
    store: { id: 'store_thrain',      sprite: 'npc_thrain',      name: 'Thrain Ironforge',        title: 'Master Deep-Delver Armorer', quote: 'Masterwork dwarven pickaxes, deep-delver armor, and reinforced mining shields!', size: 92, x: 0.82, y: 0.76 },
    inn:   { id: 'inn_caelen',        sprite: 'npc_caelen',      name: 'Caelen the Stranded',     title: 'Subterranean Tavern Host', quote: 'A hot meal beneath ten thousand tons of rock. Nothing beats dwarven ale after a deep delve.', size: 92, x: 0.18, y: 0.75 }
  }
};

// ===========================================================
// MOUNTS -- Hybrid Phase 1 (crop rendering)
// ===========================================================
const MOUNTS = {
  warHorse: {
    id:'warHorse', name:'War Horse', sprite:'rpg_lion',
    category:'swift', cost:250,
    speedMult:1.40, damageMult:1.0, defenseBonus:0,
    attackSpeedMult:0.70, flying:false,
    desc:'Fast ground mount. -30% attack speed while riding.'
  },
  redDrake: {
    id:'redDrake', name:'Red Drake', sprite:'rpg_dragon_red',
    category:'flying', cost:500,
    speedMult:1.35, damageMult:0.60, defenseBonus:0,
    attackSpeedMult:1.0, flying:true,
    desc:'Flying dragon. Ignores water. -40% weapon damage.'
  },
  warBear: {
    id:'warBear', name:'War Bear', sprite:'rpg_bear',
    category:'heavy', cost:350,
    speedMult:0.90, damageMult:1.0, defenseBonus:0.30,
    attackSpeedMult:1.0, flying:false,
    desc:'Slow but tanky. +30% defense while riding.'
  },
  fairySteed: {
    id:'fairySteed', name:'Fairy Steed', sprite:'rpg_fairy',
    category:'magic', cost:200,
    speedMult:1.25, damageMult:1.0, defenseBonus:0,
    attackSpeedMult:1.0, flying:false,
    passiveXpMult:1.15,
    desc:'A gentle fairy. +15% XP gain.'
  }
};

const MOUNT_KEY_MAP = {
  warBear: 'bear',
  bear: 'bear',
  redDrake: 'drake',
  drake: 'drake',
  fairySteed: 'fairy',
  fairy: 'fairy',
  warHorse: 'lion',
  lion: 'lion'
};

const MOUNT_IMAGES = {};
for (let c = 1; c <= 6; c++) {
  MOUNT_IMAGES[c] = {};
  for (const m of ['bear', 'drake', 'fairy', 'lion']) {
    const img = typeof Image !== 'undefined' ? new Image() : { src: '' };
    img.src = `16xcharacters/Char_00${c}_${m}_mount.webp?v183`;
    MOUNT_IMAGES[c][m] = img;
  }
}
if (typeof window !== 'undefined') window.MOUNT_IMAGES = MOUNT_IMAGES;

const DAILY_QUEST_POOLS = {
  hunt: [
    { id: 'daily-hunt-200', name: 'Daily Hunt: Swarm Cull', sprite: 'rpg_sword_iron', slotName: 'Daily Hunt', objective: 'Defeat 200 enemies in one run.', type: 'kills', target: 200, reward: 300, flavor: '"Keep the horde numbers from spilling into the camp."' },
    { id: 'daily-hunt-elites', name: 'Daily Hunt: Elite Stalkers', sprite: 'rpg_demon_skull', slotName: 'Daily Hunt', objective: 'Defeat 8 elite enemies.', type: 'elites', target: 8, reward: 350, flavor: '"Target the alpha beasts leading the frontier packs."' },
    { id: 'daily-hunt-night', name: 'Daily Hunt: Night Cleansing', sprite: 'rpg_crystal_purple', slotName: 'Daily Hunt', objective: 'Defeat 40 enemies during the night.', type: 'nightKills', target: 40, reward: 320, flavor: '"Cleanse the darkness before sunrise."' },
    { id: 'daily-hunt-water', name: 'Daily Hunt: Marsh Purge', sprite: 'rpg_waterSprite', slotName: 'Daily Hunt', objective: 'Defeat 35 water creatures.', type: 'waterKills', target: 35, reward: 300, flavor: '"Drive the amphibious fiends from the riverbanks."' },
    { id: 'daily-hunt-pyro', name: 'Daily Hunt: Scorched Earth', sprite: 'rpg_fireSprite', slotName: 'Daily Hunt', objective: 'Defeat 40 enemies with fire.', type: 'fireKills', target: 40, reward: 320, flavor: '"Burn back the encroaching wilderness."' }
  ],
  run: [
    { id: 'daily-run-15m', name: 'Daily Run: The Long Trek', sprite: 'rpg_hourglass', slotName: 'Daily Run', objective: 'Survive for 15 minutes in the wilds.', type: 'survivorTime', target: 900, reward: 250, flavor: '"A quarter hour in hostile lands tests every reserve of endurance."' },
    { id: 'daily-run-biomes', name: 'Daily Run: Trail Blazer', sprite: 'rpg_sign_post', slotName: 'Daily Run', objective: 'Explore 4 distinct biomes in one expedition.', type: 'explorerBiomes', target: 4, reward: 280, flavor: '"Cross borders and survey distant grounds."' },
    { id: 'daily-run-tiles', name: 'Daily Run: Deep Mapping', sprite: 'rpg_compass', slotName: 'Daily Run', objective: 'Reveal 250 tiles from the mist.', type: 'tilesRevealedRun', target: 250, reward: 260, flavor: "\"Every revealed ridge brings safety to tomorrow's travelers.\"" },
    { id: 'daily-run-untouched', name: 'Daily Run: Evasive Scout', sprite: 'rpg_shield_gold', slotName: 'Daily Run', objective: 'Survive 6 minutes without taking damage.', type: 'noDamageTime', target: 360, reward: 350, flavor: "\"Speed and wits keep you out of harm's path.\"" },
    { id: 'daily-run-distance', name: 'Daily Run: Outpost Odyssey', sprite: 'rpg_boots_leather', slotName: 'Daily Run', objective: 'Travel 80 tiles away from camp.', type: 'distanceFromCamp', target: 80, reward: 270, flavor: '"Scout far beyond the safety of the perimeter."' }
  ],
  legend: [
    { id: 'daily-legend-bosses', name: 'Daily Legend: Titan Slayers', sprite: 'rpg_crown', slotName: 'Daily Legend', objective: 'Defeat 3 bosses.', type: 'bossesTotal', target: 3, reward: 400, relicReward: true, flavor: '"Bring down three monarchs of the wilds and claim their relics."' },
    { id: 'daily-legend-relics', name: 'Daily Legend: Ancient Vaults', sprite: 'gem', slotName: 'Daily Legend', objective: 'Recover 2 relics in one run.', type: 'collectorRelics', target: 2, reward: 450, relicReward: true, flavor: '"Extract two ancient cores from lost caches."' },
    { id: 'daily-legend-vampire', name: 'Daily Legend: Crimson Scourge', sprite: 'rpg_batVampire', slotName: 'Daily Legend', objective: 'Defeat the Vampire Lord.', type: 'vampireLordKill', target: 1, reward: 500, relicReward: true, flavor: '"Confront the master of the blood moon."' },
    { id: 'daily-legend-level20', name: 'Daily Legend: Heroic Ascension', sprite: 'rpg_angel', slotName: 'Daily Legend', objective: 'Reach level 20 in an expedition.', type: 'playerLevel', target: 20, reward: 420, relicReward: true, flavor: '"Ascend through martial prowess to heroic standing."' }
  ]
};

function getDailyDateKey(){
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}

function getDailyResetTimeRemaining(){
  const now = new Date();
  const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const diffMs = Math.max(0, nextReset.getTime() - now.getTime());
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function getDailyQuestsForToday(){
  const dateKey = getDailyDateKey();
  let hash = 0;
  for(let i = 0; i < dateKey.length; i++){
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  const huntIndex = Math.abs(hash % DAILY_QUEST_POOLS.hunt.length);
  const runIndex = Math.abs(((hash >> 3) ^ 7) % DAILY_QUEST_POOLS.run.length);
  const legendIndex = Math.abs(((hash >> 6) ^ 13) % DAILY_QUEST_POOLS.legend.length);
  
  return [
    { ...DAILY_QUEST_POOLS.hunt[huntIndex], category: 'daily', dailySlot: 'hunt' },
    { ...DAILY_QUEST_POOLS.run[runIndex], category: 'daily', dailySlot: 'run' },
    { ...DAILY_QUEST_POOLS.legend[legendIndex], category: 'daily', dailySlot: 'legend' }
  ];
}

function getAllCampQuests(){
  return [...getDailyQuestsForToday(), ...CAMP_QUESTS];
}

function getCampQuest(id){
  if(!id) return null;
  const standard = CAMP_QUESTS.find(item => item.id === id);
  if(standard) return standard;
  const daily = getDailyQuestsForToday().find(item => item.id === id);
  return daily || null;
}

const CAMP_QUESTS=[
  {id:'frontier-patrol',name:'Frontier Patrol',sprite:'rpg_sword_iron',objective:'Defeat 20 creatures on the trail.',type:'kills',target:20,reward:65},
  {id:'long-road',name:'The Long Road',sprite:'rpg_hourglass',objective:'Survive for 3 minutes in the wilds.',type:'time',target:180,reward:75},
  {id:'relic-run',name:'Relic Runner',sprite:'gem',objective:'Find and recover a relic cache.',type:'relics',target:1,reward:55},
  // ═══════════════════════════════════════════════════════════
  // BOUNTY QUESTS — Phase 1 (8 new)
  // ═══════════════════════════════════════════════════════════
  {id:'elite-slayer',name:'Elite Slayer',sprite:'rpg_demon_skull',
   category:'bounty',objective:'Defeat 5 elite enemies in one expedition.',
   type:'elites',target:5,reward:200,
   flavor:'"The beasts that stalk the frontier must fall. — Ranger Aldric"'},
  {id:'untouched',name:'Untouched',sprite:'rpg_shield_gold',
   category:'bounty',objective:'Survive 5 minutes without taking damage.',
   type:'noDamageTime',target:300,reward:400,
   flavor:'"The best armor is never being hit at all."'},
  {id:'storm-chaser',name:'Storm Chaser',sprite:'rpg_lightningSprite',
   category:'bounty',objective:'Survive 2 storms.',
   type:'stormsSurvived',target:2,reward:250,
   flavor:'"Lightning fears no one. But you will learn to dance with it."'},
  {id:'pyromaniac',name:'Pyromaniac',sprite:(typeof window !== 'undefined' && typeof window.extItemSprite === 'function') ? window.extItemSprite('p_relicFire') : 'p_relicFire',
   category:'bounty',objective:'Defeat 50 enemies with fire.',
   type:'fireKills',target:50,reward:200,
   flavor:'"Let the wilds burn. They will regrow."'},
  {id:'night-owl',name:'Night Owl',sprite:'rpg_crystal_purple',
   category:'bounty',objective:'Defeat 30 enemies during the night.',
   type:'nightKills',target:30,reward:180,
   flavor:'"When the sun sets, the brave grow bolder."'},
  {id:'deep-diver',name:'Deep Diver',sprite:'rpg_waterSprite',
   category:'bounty',objective:'Defeat 30 water creatures.',
   type:'waterKills',target:30,reward:200,
   flavor:'"The rivers hold more than fish, wayfarer."'},
  {id:'relic-runner',name:'Relic Runner',sprite:'gem',
   category:'bounty',objective:'Recover 1 relic from the wilds.',
   type:'relicsRun',target:1,reward:150,
   flavor:'"The old magic calls to those who listen."'},
  {id:'boss-hunter',name:'Boss Hunter',sprite:'rpg_crown',
   category:'bounty',objective:'Defeat 2 bosses.',
   type:'bosses',target:2,reward:300,
   flavor:'"Every beast has a master. Find them. End them."'},

  // ═══════════════════════════════════════════════════════════
  // CHALLENGE QUESTS — Hardcore & High Reward
  // ═══════════════════════════════════════════════════════════
  {id:'the-untouchable',name:'The Untouchable',sprite:'rpg_shield_gold',
   category:'challenge',objective:'Reach level 20 without taking damage.',
   type:'untouchableLevel',target:20,reward:1000,legendaryReward:true,
   flavor:'"A master does not dodge the strike; they were never where it landed."'},
  {id:'speedrun',name:'Speedrun',sprite:'rpg_boots_leather',
   category:'challenge',objective:'Reach level 15 in under 10 minutes.',
   type:'speedrunLevel',target:15,reward:800,
   flavor:'"Blaze through the wilderness before twilight descends."'},
  {id:'pacifist',name:'Pacifist',sprite:'rpg_natureSpirit',
   category:'challenge',objective:'Survive 5 minutes without killing any enemies.',
   type:'pacifistTime',target:300,reward:600,
   flavor:'"True strength lies in walking through shadows without shedding blood."'},
  {id:'berserker',name:'Berserker',sprite:'rpg_berserker',
   category:'challenge',objective:'Defeat 500 enemies in a single expedition.',
   type:'berserkerKills',target:500,reward:700,
   flavor:'"Leave nothing standing in your wake."'},
  {id:'explorer',name:'Explorer',sprite:'rpg_sign_post',
   category:'challenge',objective:'Visit 5 distinct biomes in a single expedition.',
   type:'explorerBiomes',target:5,reward:500,
   flavor:'"Cross mountains, swamps, and deserts to map the unknown frontier."'},
  {id:'collector',name:'Collector',sprite:'rpg_chest_gold',
   category:'challenge',objective:'Recover 3 relics in a single expedition.',
   type:'collectorRelics',target:3,reward:900,
   flavor:'"The ancient world left treasures for those daring enough to reclaim them."'},
  {id:'survivor',name:'Survivor',sprite:'rpg_crown',
   category:'challenge',objective:'Survive for 30 minutes in the wilds.',
   type:'survivorTime',target:1800,reward:1200,
   flavor:'"Outlast the legions of the dark until the dawn."'},

  // ═══════════════════════════════════════════════════════════
  // STORY QUESTS (Chains — 3 Stages Each)
  // ═══════════════════════════════════════════════════════════
  // Chain 1: The Frontier Trail
  {id:'frontier-trail-1',chainId:'frontier-trail',chainName:'The Frontier Trail',stage:1,
   category:'story',name:'Frontier Trail I: The Wild Path',sprite:'rpg_sword_iron',
   objective:'Defeat 30 enemies.',type:'kills',target:30,reward:100,
   flavor:'"The frontier crawls with hungry beasts. Thin their numbers before we build the trail."'},
  {id:'frontier-trail-2',chainId:'frontier-trail',chainName:'The Frontier Trail',stage:2,
   category:'story',name:'Frontier Trail II: Seasoned Wanderer',sprite:'rpg_compass',
   objective:'Reach level 10.',type:'playerLevel',target:10,reward:150,
   flavor:'"Survival is an art. Hone your skills until the wild bends to your will."'},
  {id:'frontier-trail-3',chainId:'frontier-trail',chainName:'The Frontier Trail',stage:3,
   category:'story',name:'Frontier Trail III: Alpha Hunt',sprite:'rpg_crown',
   objective:'Defeat 1 boss.',type:'bosses',target:1,reward:350,relicReward:true,
   chainRewardDesc:'Title: "Frontier Explorer"',
   flavor:'"The lord of the wilderness watches from the crags. Bring down the apex predator."'},

  // Chain 2: Blood Moon Ritual
  {id:'blood-moon-1',chainId:'blood-moon',chainName:'Blood Moon Ritual',stage:1,
   category:'story',name:'Blood Moon I: Nocturnal Vigil',sprite:'rpg_crystal_purple',
   objective:'Survive 1 night.',type:'nightsSurvived',target:1,reward:120,
   flavor:'"When the stars fade and red mist rises, hold fast until morning."'},
  {id:'blood-moon-2',chainId:'blood-moon',chainName:'Blood Moon Ritual',stage:2,
   category:'story',name:'Blood Moon II: Children of the Night',sprite:'rpg_batVampire',
   objective:'Defeat 10 vampires.',type:'vampiresRun',target:10,reward:200,
   flavor:'"Fangs in the darkness. Drive iron through ten of their blackened hearts."'},
  {id:'blood-moon-3',chainId:'blood-moon',chainName:'Blood Moon Ritual',stage:3,
   category:'story',name:'Blood Moon III: Crimson Master',sprite:'rpg_demon_skull',
   objective:'Defeat the Vampire Lord.',type:'vampireLordKill',target:1,reward:500,relicReward:true,
   chainRewardDesc:'"Vampire Hunter" Companion Skin',
   flavor:'"The lord of blood beckons under the crimson orb. Slay him and break the curse."'},

  // Chain 3: The Flooded Path
  {id:'flooded-path-1',chainId:'flooded-path',chainName:'The Flooded Path',stage:1,
   category:'story',name:'The Flooded Path I: Waterlogged Horizon',sprite:'rpg_sign_post',
   objective:'Visit 3 distinct biomes.',type:'explorerBiomes',target:3,reward:80,
   flavor:'"The waterways connect distant reaches. Chart three biomes to find the channel."'},
  {id:'flooded-path-2',chainId:'flooded-path',chainName:'The Flooded Path',stage:2,
   category:'story',name:'The Flooded Path II: River Stalkers',sprite:'rpg_waterSprite',
   objective:'Defeat 20 water creatures.',type:'waterKills',target:20,reward:150,
   flavor:'"Lurkers in the reeds pull travelers beneath. Clear the waters."'},
  {id:'flooded-path-3',chainId:'flooded-path',chainName:'The Flooded Path',stage:3,
   category:'story',name:'The Flooded Path III: Deluge',sprite:'rpg_bottle_water',
   objective:'Survive a flood event.',type:'floodsSurvived',target:1,reward:300,
   chainRewardDesc:'Water Boots (Equipped for Free)',
   flavor:'"The rivers burst their banks. Stay afloat while the torrent rages."'},

  // Chain 4: Merchant's Debt
  {id:'merchants-debt-1',chainId:'merchants-debt',chainName:"Merchant's Debt",stage:1,
   category:'story',name:"Merchant's Debt I: Gold Rush",sprite:'rpg_coin_gold',
   objective:'Accumulate 500 gold.',type:'goldAccumulated',target:500,reward:150,
   flavor:'"The caravans will not supply a pauper. Amass enough coin to prove your credit."'},
  {id:'merchants-debt-2',chainId:'merchants-debt',chainName:"Merchant's Debt",stage:2,
   category:'story',name:"Merchant's Debt II: Arms Deal",sprite:'rpg_axe_iron',
   objective:'Own at least 2 weapons.',type:'weaponsOwned',target:2,reward:200,
   flavor:'"Wands alone win no wars. Expand your arsenal from the quartermaster."'},
  {id:'merchants-debt-3',chainId:'merchants-debt',chainName:"Merchant's Debt",stage:3,
   category:'story',name:"Merchant's Debt III: Debt Collector",sprite:'rpg_chest_gold',
   objective:'Defeat 3 bosses.',type:'bossesTotal',target:3,reward:450,
   chainRewardDesc:'20% Permanent Discount in Camp Store',
   flavor:'"Trophies from great beasts command the highest market prices. Hunt down three bosses."'},

  // Chain 5: The Lost Cartographer
  {id:'lost-cartographer-1',chainId:'lost-cartographer',chainName:'The Lost Cartographer',stage:1,
   category:'story',name:'Lost Cartographer I: Charting the Mist',sprite:'rpg_book_blue',
   objective:'Reveal 200 tiles in the wilderness.',type:'tilesRevealedRun',target:200,reward:100,
   flavor:'"The old map is worn to shreds. Push through the fog and chart two hundred steps."'},
  {id:'lost-cartographer-2',chainId:'lost-cartographer',chainName:'The Lost Cartographer',stage:2,
   category:'story',name:'Lost Cartographer II: Deep Unknown',sprite:'rpg_compass',
   objective:'Reach 100 tiles away from camp.',type:'distanceFromCamp',target:100,reward:200,
   flavor:'"The edge of civilization lies far behind. Journey one hundred leagues out."'},
  {id:'lost-cartographer-3',chainId:'lost-cartographer',chainName:'The Lost Cartographer',stage:3,
   category:'story',name:"Lost Cartographer III: Cartographer's Trove",sprite:'gem',
   objective:'Recover 3 relics.',type:'collectorRelics',target:3,reward:400,
   chainRewardDesc:'+30% Vision & Fog Reveal Radius',
   flavor:'"The mapmaker buried three relics where the ley lines converge. Recover them."'}
];

const createCharImg = (src) => {
  if (typeof Image === 'undefined') return { src };
  const img = new Image();
  img.src = src;
  return img;
};

// Animated directional player characters (8 frames, square frames, idle + walk, left + right).
// `faceLeft`/`faceRight` = file names (without .webp) of the sheet whose character LOOKS left/right.
// If a character moonwalks, swap its two names. `contentH`/`pad` = measured content height / bottom padding
// of the source frame (px); `target` = on-screen height (px) of the character.
const makeCharAnim = (dir, f, m) => {
  const L = (n) => createCharImg('characters/' + dir + '/' + n + '.webp?v294');
  const scale = m.target / m.contentH;
  return {
    idleLeft: L(f.idleLeft), idleRight: L(f.idleRight),
    walkLeft: L(f.walkLeft), walkRight: L(f.walkRight),
    frame: m.frame, scale, foot: m.pad * scale,
    ...(f.weaponSwingRight ? {
      weaponSwingRight: createCharImg(f.weaponSwingRight),
      weaponSwingLeft: createCharImg(f.weaponSwingLeft),
      weaponSwingFrameW: m.weaponSwingFrameW || 340,
      weaponSwingFrameH: m.weaponSwingFrameH || 340,
      weaponSwingScale: m.weaponSwingScale || 0.38
    } : {}),
    ...(f.fireBreathRight ? {
      fireBreathRight: createCharImg(f.fireBreathRight),
      fireBreathLeft: createCharImg(f.fireBreathLeft),
      fireBreathFrame: m.fireBreathFrame || 256,
      fireBreathScale: m.fireBreathScale || (m.target / 110),
      fireBreathFoot: (m.fireBreathFoot || 0) * (m.target / 110)
    } : {})
  };
};
const CHAR_ANIMS = {
  wayfarer: makeCharAnim('wayfarer',
    {idleLeft:'wayfarer_idle_right_spritesheet', idleRight:'wayfarer_idle_spritesheet', walkLeft:'wayfarer_walk_right_spritesheet', walkRight:'wayfarer_walk_spritesheet'},
    {frame:174, contentH:174, pad:0, target:76}),
  elf: makeCharAnim('ELF',
    {idleLeft:'ari_elf_idle_spritesheet', idleRight:'ari_elf_idle_left_spritesheet', walkLeft:'ari_walk_spritesheet', walkRight:'ari_walk_left_spritesheet'},
    {frame:256, contentH:240, pad:15, target:78}),
  orc: makeCharAnim('ORK',
    {
      idleLeft:'ruk_idle_spritesheet',
      idleRight:'ruk_idle_left_spritesheet',
      walkLeft:'ruk_walk_spritesheet',
      walkRight:'ruk_walk_left_spritesheet',
      weaponSwingRight:'characters/ORK/ruk main weapon/spritesheet_right.webp?v309',
      weaponSwingLeft:'characters/ORK/ruk main weapon/spritesheet_left.webp?v309'
    },
    {frame:256, contentH:211, pad:20, target:76, weaponSwingFrameW:340, weaponSwingFrameH:340, weaponSwingScale:0.38}),
  dwarf: makeCharAnim('DWORF',
    {idleLeft:'idle_borin_spritesheet', idleRight:'idle_left_borin_spritesheet', walkLeft:'walk_spritesheet', walkRight:'walk_left_spritesheet'},
    {frame:256, contentH:232, pad:15, target:68}),
  mystic: makeCharAnim('MYSTIC',
    {idleLeft:'sylas_idle_spritesheet', idleRight:'sylas_idle_left_spritesheet', walkLeft:'sylas_walk_spritesheet', walkRight:'sylas_walk_left_spritesheet'},
    {frame:256, contentH:243, pad:13, target:78}),
  knight: makeCharAnim('KNIGHT',
    {
      idleLeft:'idle_zak_spritesheet',
      idleRight:'idle_zak_left_spritesheet',
      walkLeft:'walk_spritesheet',
      walkRight:'walk_left_spritesheet',
      fireBreathRight:'characters/KNIGHT/fire_breath_weapon_anim/spritesheet.webp?v305',
      fireBreathLeft:'characters/KNIGHT/fire_breath_weapon_anim/spritesheet_left.webp?v305'
    },
    {frame:171, contentH:171, pad:0, target:80, fireBreathFrame:256, fireBreathScale:80/110}),
  wayfarerEX: makeCharAnim('KAELEN',
    {idleLeft:'kaelen_idle_spritesheet', idleRight:'kaelen_idle_left_spritesheet', walkLeft:'kaelen_walk_spritesheet', walkRight:'kaelen_walk_left_spritesheet'},
    {frame:197, contentH:197, pad:0, target:78})
};

const ALL_PLAYABLE_CHARACTERS=[
  {id:'wayfarer',name:'Wayfarer',race:'Human',maxHp:100,speed:2.8,damage:1,desc:'Balanced - 100 HP',biome:'plains',campFaceLeft:true,previewWebp:'characters/wayfarer/wayfarer_idle_preview.webp?v294',animSheets:CHAR_ANIMS.wayfarer},
  {id:'elf',name:'Ari Greenleaf',race:'Elf',maxHp:90,speed:3.1,damage:1,desc:'Swift - 90 HP · Elven Bow',biome:'forest',previewWebp:'characters/ELF/ari_elf_idle_preview.webp?v294',animSheets:CHAR_ANIMS.elf,startingWeapon:'elvenBow'},
  {id:'orc',name:'Ruk Stonejaw',race:'Orc',maxHp:110,speed:2.7,damage:1.1,desc:'Strong - +10% DMG · Stonejaw Cleaver',biome:'desert',previewWebp:'characters/ORK/ruk_preview.webp?v294',animSheets:CHAR_ANIMS.orc,startingWeapon:'orcCleaver'},
  {id:'dwarf',name:'Borin Emberbeard',race:'Dwarf',maxHp:125,speed:2.5,damage:1,desc:'Sturdy - 125 HP, slower · Warhammer',biome:'snow',previewWebp:'characters/DWORF/borin_preview.webp?v294',animSheets:CHAR_ANIMS.dwarf,startingWeapon:'warhammer'},
  {id:'mystic',name:'Sylas',race:'Mystic',maxHp:85,speed:3.0,damage:1.2,desc:'Glass Cannon - 85 HP',biome:'magicForest',previewWebp:'characters/MYSTIC/sylas_idle_preview.webp?v294',animSheets:CHAR_ANIMS.mystic},
  {id:'knight',name:'Zak',race:'Knight',maxHp:140,speed:2.4,damage:0.9,desc:'Tank - 140 HP · Fire Breath',biome:'volcano',previewWebp:'characters/KNIGHT/preview.webp?v294',animSheets:CHAR_ANIMS.knight,startingWeapon:'fireBreath'},
  {
    id:'wayfarer_upgraded',
    name:'Wayfarer (EX)',
    race:'Arcane Mage',
    maxHp:110,
    speed:2.9,
    damage:1.15,
    desc:'Arcane Master - 110 HP, +15% damage',
    biome:'plains',
    previewWebp:'characters/KAELEN/kaelen_idle_preview.webp?v294',
    animSheets:CHAR_ANIMS.wayfarerEX,
    startingWeapon:'chainWhip'
  }
];

const PLAYABLE_CHARACTERS = (typeof window !== 'undefined' && window.IS_DEMO)
  ? ALL_PLAYABLE_CHARACTERS.filter(c => ['wayfarer', 'knight', 'orc'].includes(c.id))
  : ALL_PLAYABLE_CHARACTERS;
// All playable characters use the directional 8-frame animation system (renderer.mjs drawPlayer).
for(const ch of PLAYABLE_CHARACTERS){
  ch.sprite = 'player1';
  ch.customChar = false;
  ch.directionalChar = true;
  ch.imgIdle = ch.animSheets.idleRight;
  ch.imgWalk = ch.animSheets.walkRight;
}

const LORE_ENTRIES = {
  clues: [
    { id: 'c_hermit', title: "The Hermit's Warning", icon: 'rpg_scroll', desc: "Do not venture into the weeping grove when the crimson moon ascends; the roots have teeth." },
    { id: 'c_blood_altar', title: "Blood Altar Inscription", icon: 'desertShrine', desc: "Only blood spilled in moonlight shall awaken the ancient titan beneath the cracked earth." },
    { id: 'c_sunken_tide', title: "The Receding Tide", icon: 'Tidecallers_Conch', desc: "When the great flood begins, seek high ground immediately. The drowned dead crawl onto the shallows." },
    { id: 'c_whispering_caves', title: "Whispers from the Depths", icon: 'caveMouth', desc: "The crystal formations in the deep caverns resonate with ancient memories of a fallen kingdom." },
    { id: 'c_frozen_tracks', title: "Frozen Tracks", icon: 'snowman', desc: "Giant three-toed footprints lead straight toward the howling blizzard peaks." },
    { id: 'c_shadow_mark', title: "The Shadow Mark", icon: 'rpg_gem_amethyst', desc: "Strange runes carved on dead birch trees ward off something that fears no blade." },
    { id: 'c_mask_of_calm', title: "The Mask of Calm", icon: 'Mask_Of_Calm', desc: "A serene mask found in the frozen heart of the Ice Titan. It calms the beasts around you and grants absolute peace." },
    { id: 'c_sunken_shrine', title: "The Sunken Shrine", icon: 'sunken_shrine', desc: "An ancient stone effigy half-buried in the swamp. It awakens only when the midnight deluge (Night & Flood) drowns the marshlands." },
    { id: 'c_tidecaller_conch', title: "The Tidecaller's Conch", icon: 'Tidecallers_Conch', desc: "Gifted by the rescued traveler of the marshlands. Blowing this ancient sea shell summons a torrential flood for 60 seconds." },
    { id: 'c_abyss_kraken', title: "Wrath of the Deep Titan", icon: 'Eye_Sigil', desc: "The Kraken has fallen, yet the abyssal trench groans. An ancient tablet in the depths reads: 'The boiling trench waters freeze only before the Heart of Winter... Seek the Frozen Titan atop the howling blizzard peaks.'" },
    { id: 'c_frost_hermit', title: "Commander Alden's Exile", icon: 'Heart_of_Winter', desc: "Commander Alden of the Fifth Seal still keeps vigil inside Frostpeak Hollow. Only the Abyssal Heart of the Kraken can rekindle the altar's frozen forge." },
    { id: 'c_frostpeak_seal', title: "The Frostpeak Seal (1/5)", icon: 'rpg_frozenCore', desc: "The Awakened Frostpeak Titan has fallen. One of the Five Mountain Seals is broken—only four remain across the Mountain Sanctuaries before the Key to Dimension X can be forged." },
    { id: 'c_abyss_key', title: "The Abyssal Key", icon: 'Abyssal_Key', desc: "Forged in the trench depths, this crystalline oceanic key unseals the portal to The Sunken Depths." },
    { id: 'c_chicken_shrine', title: "The Chicken Shrine", icon: 'goldenEgg', desc: "There is a Poultry King... in a place that is not here. Find the Shrine." }
  ],
  journals: [
    { id: 'j_sunken_temple', title: "The Sunken Temple", icon: 'ruinGate', desc: "Day 42: The temple's flooded halls still echo with the chants of the drowned priesthood. We found the obsidian key." },
    { id: 'j_lost_cartographer', title: "Cartographer's Final Note", icon: 'rpg_scroll', desc: "The fog does not merely obscure the land; it moves, it watches, it hungers." },
    { id: 'j_ember_chronicle', title: "Chronicles of Ember", icon: 'burningTree', desc: "The volcanic rift opened during the great cataclysm, bathing the southern rim in eternal fire." },
    { id: 'j_alchemist_tome', title: "The Hermetic Alchemist", icon: 'Mad_Alchemist_Tome', desc: "Refining the pure essence of wild mushrooms allows one to brew potions of fleeting immortality." },
    { id: 'j_dwarven_expedition', title: "Dwarven Expedition Log", icon: 'rpg_hammer', desc: "We dug too deep beneath the frozen plateau. The ice groaned in response." },
    { id: 'j_alden_confession', title: "Confession of the Blood Altar", icon: 'rpg_scroll', desc: "Commander Alden's own hand records the terrible price paid after the First Cataclysm: innocent blood spilled upon the altar to bind the Five Great Tree titans—and why Aethelgard turned toward the Void." },
    { id: 'j_void_wanderer', title: "Words of the Void Wanderer", icon: 'Void_Key', desc: "Between dimensions lies an endless void where time has no master." },
    { id: 'j_chicken_dimension', title: "There Is No Chicken Level", icon: 'chickenCrown', desc: "Day ???: The portal opened in a burst of feathers. Thousands of furious chickens and their towering King rule this pasture!" }
  ],
  symbols: [
    { id: 's_frozen_heart', title: "Frozen Heart", icon: 'Heart_of_Winter', desc: "A sacred emblem of absolute zero, pulsing with an icy chill that never fades." },
    { id: 's_phoenix_crest', title: "Phoenix Crest", icon: 'rpg_gem_ruby', desc: "Symbol of eternal rebirth through blazing fire. Feared by the creatures of the dark." },
    { id: 's_eye_of_abyss', title: "Eye of the Abyss", icon: 'Eye_Sigil', desc: "An ancient sigil depicting an eye surrounded by deep-sea tentacles." },
    { id: 's_emerald_serpent', title: "The Emerald Serpent", icon: 'rpg_gem_emerald', desc: "Mark of the venomous tribes that ruled the primal marshlands centuries ago." },
    { id: 's_golden_sun', title: "The Golden Solar Mark", icon: 'Sun_Shield', desc: "A forgotten seal of the Radiant Kings who once vanquished the shadowy hordes." },
    { id: 's_void_sigil', title: "Sigil of Nullification", icon: 'rpg_potion_black', desc: "A dark geometric rune that devours light and magical energy." }
  ],
  stories: [
    { id: 'st_guardians', title: "The Guardians of Eld", icon: 'rpg_shield_gold', desc: "Legends speak of towering stone and ice titans forged by the creators to safeguard the relics of the prime world." },
    { id: 'st_fifth_seal', title: "Shattering of the Fifth Seal", icon: 'Heart_of_Winter', desc: "Atop Frostpeak Hollow, Commander Alden forged the Heart of Winter from the Kraken's core, freeing the Wayfarer to strike down the true Awakened Frostpeak Titan and break the first of the Five Mountain Seals." },
    { id: 'st_first_fall', title: "The Night of the Falling Stars", icon: 'rpg_sword_diamond', desc: "When the sky shattered, shimmering celestial metal seeded the world with raw eldritch power." },
    { id: 'st_blood_lord', title: "Rise of the Blood Lord", icon: 'rpg_gem_red', desc: "A tyrant king who bathed in crimson ichor to escape death, becoming the immortal terror of the plains." },
    { id: 'st_drowned_kingdom', title: "The Drowned Kingdom", icon: 'rpg_shield_iron', desc: "An entire maritime civilization submerged in a single night by the Wrath of the Great Tide." },
    { id: 'st_forest_whisperer', title: "Song of the Mother Tree", icon: 'rpg_oak_tree', desc: "Deep within the enchanted groves, the ancient roots hum melodies that heal wounded souls." },
    { id: 'st_void_weaver', title: "The Void Weaver", icon: 'rpg_wizard', desc: "A being that weaves threads of reality and unreality across the endless expanse." }
  ]
};

// NOTE: For development/testing, some initial entries are pre-unlocked.
// For production, change DEFAULT_UNLOCKED_LORE arrays to [] so all lore is discovered via gameplay.
const DEFAULT_UNLOCKED_LORE = {
  clues: ['c_hermit', 'c_blood_altar', 'c_sunken_tide'],
  journals: ['j_sunken_temple', 'j_lost_cartographer', 'j_ember_chronicle'],
  symbols: ['s_frozen_heart', 's_phoenix_crest'],
  stories: ['st_guardians', 'st_first_fall']
};

const CAMP_SCENES={
  plains:{src:'assets/camp_valley.jfif',name:'Valley Camp',eyebrow:'PLAINS OUTPOST',detail:'A quiet camp in the open valley.'},
  forest:{src:'assets/camp_forest.jfif',name:'Forest Camp',eyebrow:'FOREST OUTPOST',detail:'Shelter beneath the old forest canopy.'},
  desert:{src:'assets/camp_desert.jfif',name:'Desert Camp',eyebrow:'DESERT OUTPOST',detail:'A welcome refuge beneath the sandstone cliffs.'},
  snow:{src:'assets/camp_snow.jfif',name:'Snow Camp',eyebrow:'FROST OUTPOST',detail:'Warm up before crossing the frozen wilds.'},
  swamp:{src:'assets/camp_swamp.jfif',name:'Swamp Camp',eyebrow:'SWAMP OUTPOST',detail:'A dry path through the flooded forest.'},
  magicForest:{src:'assets/camp_magic_forest.jfif',name:'Enchanted Camp',eyebrow:'ENCHANTED OUTPOST',detail:'Strange lights guide travelers through the trees.'},
  volcano:{src:'assets/camp_volcano.jfif',name:'Volcanic Camp',eyebrow:'VOLCANIC OUTPOST',detail:'A guarded refuge near the molten ridges.'},
  crystalWastes:{src:'assets/camp_crystal.jfif',name:'Crystal Camp',eyebrow:'CRYSTAL OUTPOST',detail:'A sanctuary among the glowing spires.'},
  fungalWastes:{src:'assets/camp_fungal.jfif',name:'Fungal Camp',eyebrow:'TOXIC OUTPOST',detail:'A safe glow beneath the giant mushrooms.'},
  deadlands:{src:'assets/camp_deadlands.jfif',name:'Graveyard Camp',eyebrow:'DEADLANDS OUTPOST',detail:'A grim stopover amidst the fog and tombstones.'},
  badlands:{src:'assets/camp_badlands.jfif',name:'Badlands Camp',eyebrow:'SCORCHED OUTPOST',detail:'A dusty refuge under a blazing sun.'},
  undergroundCave:{src:'assets/camp_underworld.jfif',name:'Underworld Camp',eyebrow:'CAVE OUTPOST',detail:'A glowing refuge deep beneath the stone.'},
  dwarfCity:{src:'assets/camp_underworld.jfif',name:'Underworld Camp',eyebrow:'CAVE OUTPOST',detail:'A glowing refuge deep beneath the stone.'},
  dimensionX:{src:'assets/camp_void.webp',name:'Void Camp',eyebrow:'DIMENSIONAL OUTPOST',detail:'An anchor point adrift in the starry cosmos.'},
  abyss:{src:'assets/abyss_camp.webp',name:'Abyssal Camp',eyebrow:'SUNKEN DEPTHS OUTPOST',detail:'A sanctuary in the drowned kingdom of the abyss.'}
};

const NPC_DIALOGUES = [
  // Building NPCs (Inn & Store)
  { speaker: 'store_bartholomew', text: 'Fresh wares straight from the trade routes! Fair prices for true wayfarers.', priority: 2 },
  { speaker: 'inn_rikkt', text: 'Roll the dice, share a drink! The night is young and the fire is warm.', priority: 2 },
  { speaker: 'store_caelen', text: 'Sharp broadheads and supple bowstrings. Never enter the trees unarmed.', priority: 2 },
  { speaker: 'inn_alistair', text: 'Sit a while and rest your weary feet. I have seen many summers in these woods.', priority: 2 },
  { speaker: 'store_tariq', text: 'Finest Damascus blades in the oasis! Guaranteed to slice sand or beast.', priority: 2 },
  { speaker: 'store_thrain', text: 'By the stone father, dwarven steel will never fail you! Pick your weapon.', priority: 2 },
  { speaker: 'store_corvus', text: 'Antitoxins, poultices, and silvered daggers. Prevention is better than rot.', priority: 2 },
  { speaker: 'inn_vesper', text: 'The spirits are calm tonight. Rest within these walls, child of the frontier.', priority: 2 },
  { speaker: 'store_vance', text: 'Guild-certified arms and armor. Only the best for high-tier expeditions.', priority: 2 },
  { speaker: 'inn_malakor', text: 'Sleep lightly, friend. I will keep watch by the threshold.', priority: 2 },

  // Plains (fox, fenrir, kael)
  { speaker: 'fox', text: 'Yip! The valley grass smells sweet and clear.', priority: 1 },
  { speaker: 'fox', text: '*Nuzzles your boots eagerly, ready for the path.*', priority: 1 },
  { speaker: 'fox', text: 'Fast feet never get caught in the weeds!', priority: 1 },
  { speaker: 'fenrir', text: 'Grrr... the wind smells of danger and glory.', priority: 1 },
  { speaker: 'fenrir', text: '*Soft wolf whimper* ...need headpats.', priority: 1 },
  { speaker: 'fenrir', text: '*Sniffs the campfire ashes eagerly*', priority: 1 },
  { speaker: 'fenrir', text: 'Awoooo! The hunt calls to us across the plains!', priority: 1 },
  { speaker: 'kael', text: 'Caw! Eyes in the clouds, blades in the shadows.', priority: 1 },
  { speaker: 'kael', text: 'I spot three enemy ambushes ahead. Stay alert.', priority: 1 },

  // Forest (bramble, sylva, scout)
  { speaker: 'bramble', text: '*Snarls playfully and chews on a fallen pinecone.*', priority: 1 },
  { speaker: 'bramble', text: 'The forest paths are deep and dark. Stay close.', priority: 1 },
  { speaker: 'bramble', text: 'Grrr... I smell prey moving beneath the old roots.', priority: 1 },
  { speaker: 'sylva', text: 'The ancient trees whisper secrets to those who listen.', priority: 1 },
  { speaker: 'sylva', text: '*Sprinkles glittering green pollen over your wounds.*', priority: 1 },
  { speaker: 'sylva', text: 'Stay gentle, Wayfarer. The woods protect their own.', priority: 1 },
  { speaker: 'scout', text: 'Keep low in the ferns. Danger stalks these thickets.', priority: 1 },

  // Desert (naja, leo, khepri)
  { speaker: 'naja', text: '*Sssss... the sandstone is delightfully warm tonight.*', priority: 1 },
  { speaker: 'naja', text: 'One swift strike is all it takes. Poison does the rest.', priority: 1 },
  { speaker: 'naja', text: '*Coils peacefully near the desert campfire hearth.*', priority: 1 },
  { speaker: 'leo', text: 'Rrr-oar! The desert sands bow before our pride!', priority: 1 },
  { speaker: 'leo', text: '*Stretches massive golden paws across the warm sand.*', priority: 1 },
  { speaker: 'leo', text: 'Hold your head high. True apex hunters do not cower.', priority: 1 },
  { speaker: 'khepri', text: '*Carapace plates click and clatter rhythmically.*', priority: 1 },

  // Snow (yukon, frostwing, nanook)
  { speaker: 'yukon', text: '*Breathes a plume of frosty mist into the hearth.*', priority: 1 },
  { speaker: 'yukon', text: 'Awoooo! The winter frost makes our fangs razor sharp!', priority: 1 },
  { speaker: 'yukon', text: '*Rolls happily in a fresh drift of frozen snow.*', priority: 1 },
  { speaker: 'frostwing', text: 'Screee! Chilling winds guide our wings through the gale!', priority: 1 },
  { speaker: 'frostwing', text: '*Hangs upside down from the shelter beam, observing.*', priority: 1 },
  { speaker: 'frostwing', text: 'Ice preserves the worthy... and shatters the weak!', priority: 1 },
  { speaker: 'nanook', text: '*Deep rumbling snore by the snowbank.*', priority: 1 },

  // Magic Forest (selene, nyx, aurelius)
  { speaker: 'selene', text: 'The ley lines hum with restless arcane energy tonight.', priority: 1 },
  { speaker: 'selene', text: 'The mist conceals more than just wandering beasts.', priority: 1 },
  { speaker: 'selene', text: 'A calm mind weaves the sharpest starbolt incantations.', priority: 1 },
  { speaker: 'nyx', text: '*A soft whisper echoes from the starlit shadows.*', priority: 1 },
  { speaker: 'nyx', text: 'The void is not empty... it is hungry for fresh light.', priority: 1 },
  { speaker: 'nyx', text: '*Flickers like a ghost between the enchanted tree trunks.*', priority: 1 },
  { speaker: 'aurelius', text: '*Puffs a ring of glowing blue astral flame.* Rawr!', priority: 1 },

  // Volcano (ashe, ignis, scorch)
  { speaker: 'ashe', text: 'Chirp! Sparks fly wherever I flutter! Puuu!', priority: 1 },
  { speaker: 'ashe', text: '*Flaps tiny fiery wings near the hearth embers*', priority: 1 },
  { speaker: 'ashe', text: 'Even ash can be reborn in golden, glorious flame!', priority: 1 },
  { speaker: 'ignis', text: '*Barks joyfully as fiery sparks puff from its snout!*', priority: 1 },
  { speaker: 'ignis', text: 'Woof! Let us charge headfirst into the inferno!', priority: 1 },
  { speaker: 'ignis', text: '*Paws the volcanic obsidian rock eagerly.*', priority: 1 },
  { speaker: 'scorch', text: 'Screee! Magma bubbles and sparks fly across the ridge!', priority: 1 },

  // Legacy NPCs
  { speaker: 'morvath', text: 'The dead have so much to whisper, if one listens.', priority: 1 },
  { speaker: 'aldric', text: 'Stand firm. No beast shall breach our palisade.', priority: 1 },
  { speaker: 'healer', text: 'May the healing light ease your burdens, Wayfarer.', priority: 1 },
  { speaker: 'wayfarer', text: 'One more breath by the hearth before the road calls.', priority: 1 },
  { speaker: 'wayfarer', text: 'Check the blades. Check the draughts.', priority: 1 },

  // Biome Chatter Pairings
  { speaker: 'fox', text: 'Yip! Bet I can outrun you to the palisade gate, Sir Aldric!', priority: 3, chatter: { replySpeaker: 'aldric', replyText: 'Steady, little fox. Speed is nothing without armor to back it.' } },
  { speaker: 'kael', text: 'Caw! Enemies spotted circling beyond the thicket.', priority: 3, chatter: { replySpeaker: 'scout', replyText: 'Arrow notched. They will not cross the tree line.' } },
  { speaker: 'fenrir', text: '*Soft wolf whimper* ...the winter wind bites cold tonight.', priority: 3, chatter: { replySpeaker: 'healer', replyText: 'Come rest by the fire, Fenrir. May the light warm your spirit.' } },
  { speaker: 'aldric', text: 'Rest well, Wayfarer. My shield watches over the camp.', priority: 1 },
  { speaker: 'aldric', text: 'A solid defense turns the tide of any war.', priority: 1 },
  { speaker: 'scout', text: 'The forest paths are quiet... too quiet. Keep your eyes sharp.', priority: 1 },
  { speaker: 'scout', text: 'Wind is blowing south. Perfect for long-range archery.', priority: 1 },
  { speaker: 'healer', text: 'Do not fear the frost. The sacred light never fades.', priority: 1 },
  { speaker: 'healer', text: '*Gently bandages your travel-worn hands.*', priority: 1 },
  { speaker: 'morvath', text: 'The desert sands hide centuries of bleached bones.', priority: 1 },
  { speaker: 'morvath', text: 'In these dunes, even the dust obeys the grave.', priority: 1 },

  // Reactions: Επιστροφή από Run με χαμηλό HP (< 35%)
  { speaker: 'fenrir', text: '*Whines anxiously and licks your wounds*', priority: 10, condition: 'return_low_hp' },
  { speaker: 'fox', text: 'Yip! Quick, rest by the fire before you faint!', priority: 10, condition: 'return_low_hp' },
  { speaker: 'sylva', text: '*Sprinkles restorative fairy dust over your injuries*', priority: 10, condition: 'return_low_hp' },
  { speaker: 'ashe', text: 'Chirp! My embers will mend your weary bones!', priority: 10, condition: 'return_low_hp' },
  { speaker: 'selene', text: 'You barely escaped the void\'s grasp, Wayfarer.', priority: 10, condition: 'return_low_hp' },
  { speaker: 'yukon', text: '*Nudges you gently toward the warmth of the fire*', priority: 10, condition: 'return_low_hp' },

  // Reactions: Ασφαλής / Επιτυχής επιστροφή
  { speaker: 'fenrir', text: '*Barks joyfully and wags tail!*', priority: 8, condition: 'return_safe' },
  { speaker: 'fox', text: 'Yip yip! You made it back with the loot!', priority: 8, condition: 'return_safe' },
  { speaker: 'leo', text: 'A glorious victory! Our pride grows stronger.', priority: 8, condition: 'return_safe' },
  { speaker: 'ashe', text: 'Screee! The hunter returns victorious!', priority: 8, condition: 'return_safe' },
  { speaker: 'selene', text: 'The stars guided your steps back safely.', priority: 8, condition: 'return_safe' }
];

const COMPANION_RELIC_SKILLS={ember:'Ember shots (+5 damage)',mirror:'Ricochet shots',storm:'Storm chain shots',phoenix:'One phoenix rescue per expedition'};

const RUN_UPGRADES=[
  {id:'force',sprite:'rpg_spear',name:'Brute Force',desc:'+15 knockback and +20% melee damage',maxLevel:6,category:'Offensive'},
{id:'crit',sprite:'rpg_sword_diamond',name:'Critical Strike',desc:'+8% chance to deal double damage',maxLevel:5,category:'Offensive'},
{id:'critDmg',sprite:'rpg_sword_gold',name:'Sharpened Edge',desc:'+30% critical damage',maxLevel:5,category:'Offensive'},
{id:'pierce',sprite:'arrow',name:'Piercing Shots',desc:'+1 projectile pierce',maxLevel:3,category:'Offensive'},
{id:'projSpeed',sprite:'rpg_lightningSprite',name:'Rapid Fire',desc:'+12% projectile speed',maxLevel:5,category:'Offensive'},
{id:'execute',sprite:'rpg_demon_skull',name:'Executioner',desc:'Instantly defeat regular enemies below the threshold',maxLevel:2,category:'Offensive'},
{id:'ember',sprite:(typeof window !== 'undefined' && typeof window.extItemSprite === 'function') ? window.extItemSprite('p_relicFire') : 'p_relicFire',name:'Ember Touch',desc:'Attacks burn for 5 damage/sec over 2 sec',maxLevel:3,category:'Offensive'},
{id:'frost',sprite:'rpg_iceSprite',name:'Frostbite',desc:'Attacks slow enemies by 20% for 1.5 sec',maxLevel:2,category:'Offensive'},
{id:'dodge',sprite:'rpg_rogue',name:'Evasion',desc:'+6% chance to dodge attacks',maxLevel:5,category:'Defensive'},
{id:'thorns',sprite:'rpg_shield_iron',name:'Thorns',desc:'Reflect contact damage scaled with Max HP and Damage Multiplier',maxLevel:4,category:'Defensive'},
{id:'lifesteal',sprite:'rpg_potion_red',name:'Lifesteal',desc:'Restore 1 HP per 3 kills',maxLevel:5,category:'Defensive'},
{id:'shieldGen',sprite:'rpg_shield_gold',name:'Shield Generator',desc:'+25 shield; regenerate shield rapidly every 1.5s',maxLevel:4,category:'Defensive'},
{id:'secondWind',sprite:'comp_ashe',name:'Second Wind',desc:'Revive once per run at 50% HP',maxLevel:1,category:'Defensive'},
{id:'wideArc',sprite:'rpg_crystal_purple',name:'Wide Arc',desc:'+15% weapon area and radius',maxLevel:5,category:'Area & Effect'},
{id:'persistent',sprite:'rpg_hourglass',name:'Persistent',desc:'+20% weapon effect duration',maxLevel:5,category:'Area & Effect'},
{id:'magnifier',sprite:'orb',name:'Magnifier',desc:'+25% pickup range and +15% XP gem value',maxLevel:3,category:'Area & Effect'},
{id:'ricochet',sprite:'gem',name:'Ricochet',desc:'+10% chance for projectiles to bounce once',maxLevel:3,category:'Area & Effect'},
{id:'reroll',sprite:'rpg_hourglass',name:'Reroll',desc:'+1 level-up reroll this run',maxLevel:3,category:'Utility & Meta'},
{id:'banish',sprite:'rpg_scroll',name:'Banish',desc:'+1 charge to remove a card type from future offers',maxLevel:3,category:'Utility & Meta'},
{id:'luck',sprite:'rpg_gem_emerald',name:'Lucky',desc:'+20% relic tier chance and +15% gold',maxLevel:3,category:'Utility & Meta'},
{id:'cardDraw',sprite:'rpg_scroll',name:'Card Draw',desc:'+1 level-up choice',maxLevel:2,category:'Utility & Meta'},
{id:'companionBond',sprite:'rpg_archer',name:'Companion Bond',desc:'Companions deal and heal 25% more',maxLevel:3,category:'Utility & Meta'},
{id:'bloodPact',sprite:'rpg_potion_red',name:'Blood Pact',desc:'+40% damage, but -15% maximum HP',maxLevel:3,category:'Special / Endgame'},
{id:'glassCannon',sprite:'rpg_sword_diamond',name:'Glass Cannon',desc:'+25% damage, but -20% defense',maxLevel:3,category:'Special / Endgame'},
{id:'berserker',sprite:'rpg_demon_skull',name:'Berserker',desc:'+1% damage per 5% missing HP',maxLevel:3,category:'Special / Endgame'}
];

const TERRAIN_CONDITION_HINTS={
  plains:'Open ground; roaming packs can surround you.',
  forest:'Fast predators stalk the wooded paths.',
  magicForest:'Spirits and shadow creatures roam here.',
  desert:'Scorpions and lions roam the dunes.',
  snow:'Nearby ice creatures can slow your movement.',
  swamp:'Slimes and the Swamp Horror can inflict poison.',
  volcano:'Storms can ignite ground; burning tiles deal 6 HP per second.',
  crystalWastes:'Shimmering crystalline jagged peaks pulsing with unstable energy.',
  fungalWastes:'Toxic spore hazards and mutated giants thrive in the fungal gloom.',
  deadlands:'Desolate cursed soil haunted by wraiths and skeletal horrors.',
  badlands:'Arid craggy wastes stalked by apex carnivores and mantises.',
  undergroundCave:'Subterranean caverns with stone walls. Use torch to illuminate.',
  dwarfCity:'Ancient underground citadel guarded by dwarven sentinels.',
  dimensionX:'An eerie void of cosmic rifts and elder void spirits.',
  abyss:'Submerged oceanic trench; aquatic monstrosities hunt in the depths.',
  dream:'Surreal shifting dreamscape where nightmares take physical form.',
  chicken:'Secret clucking pasture; swarms of poultry guard the Chicken King.'
};

const LEFT_FACING_ENEMY_SPRITES = new Set([
  'tiger',
  'rpg_tiger',
  'lion',
  'rpg_lion',
  'blueDrake',
  'rpg_dragon_blue'
]);
if (typeof window !== 'undefined') window.LEFT_FACING_ENEMY_SPRITES = LEFT_FACING_ENEMY_SPRITES;

const DREAM_RELICS = [
  {
    id: 'dream_anchor',
    name: 'Dream Anchor',
    sprite: 'dream_item_anchor',
    desc: 'Increases defense by 50% while standing still.',
    stats: { defenseStill: 0.5 }
  },
  {
    id: 'lucid_bell',
    name: 'Lucid Bell',
    sprite: 'dream_item_bell',
    desc: 'The ONLY Exit: Instantly wakes you up, but you lose all collected loot.',
    stats: { exitDream: true },
    rare: true
  },
  {
    id: 'wake_alarm',
    name: 'Wake-Up Alarm',
    sprite: 'dream_item_clock',
    desc: 'Increases Awakening Bar by +5 every time you kill an enemy.',
    stats: { awakeningKillBonus: 5 }
  },
  {
    id: 'reality_compass',
    name: 'Reality Compass',
    sprite: 'dream_item_ring',
    desc: 'Reveals the location of the nearest safe zone or exit on the minimap.',
    stats: { revealExit: true }
  },
  {
    id: 'dream_catcher',
    name: 'Dream Catcher',
    sprite: 'dream_item_amulet',
    desc: 'Slows down all enemies by 20% within a 3-tile radius.',
    stats: { auraSlow: 0.2, auraRadius: 120 }
  },
  {
    id: 'dream_essence',
    name: 'Dream Essence',
    sprite: 'dream_item_essence',
    desc: 'Heals the player for 2 HP every 5 seconds.',
    stats: { healAmount: 2, healInterval: 5 }
  },
  {
    id: 'nightmare_shard',
    name: 'Nightmare Shard',
    sprite: 'dream_item_hourglass',
    desc: 'Increases player damage by 30% but decreases defense by 10%.',
    stats: { damageMult: 1.3, defenseMult: 0.9 }
  },
  {
    id: 'sandman_dust',
    name: "Sandman's Dust",
    sprite: 'dream_item_lantern',
    desc: 'Enemies have a 10% chance to fall asleep (stun) when they hit the player.',
    stats: { stunChanceOnHit: 0.1 }
  },
  {
    id: 'lucid_feather',
    name: 'Lucid Feather',
    sprite: 'dream_item_feather',
    desc: 'Increases player movement speed by 15% and allows dashing through enemies.',
    stats: { speedMult: 1.15, phaseDash: true }
  },
  {
    id: 'tear_of_eye',
    name: 'Tear of the Eye',
    sprite: 'dream_item_eye_tome',
    desc: 'Regenerates 1 HP per second if the player stands still for 3 seconds.',
    stats: { standRegenDelay: 3, standRegenHp: 1 }
  },
  {
    id: 'potion_sleep',
    name: 'Potion of Sleep',
    sprite: 'dream_item_potion',
    desc: 'Increases the Awakening Bar fill rate by 50% (stacks with kills).',
    stats: { awakeningMult: 1.5 }
  },
  {
    id: 'stitched_button',
    name: 'Stitched Button',
    sprite: 'dream_item_mirror',
    desc: 'Reduces all incoming damage by 2 flat points.',
    stats: { flatDmgReduction: 2 }
  },
  {
    id: 'coffee_bean',
    name: 'Coffee Bean',
    sprite: 'dream_item_chalice',
    desc: 'Grants immunity to the "Slowed" debuff and increases attack speed by 10%.',
    stats: { slowImmunity: true, attackSpeedMult: 1.1 }
  },
  {
    id: 'reality_tear',
    name: 'Reality Tear',
    sprite: 'dream_item_orb',
    desc: 'Creates a small explosion that knocks back enemies when the player takes damage.',
    stats: { knockbackOnDmg: true }
  },
  {
    id: 'lucid_pillow',
    name: 'Lucid Pillow',
    sprite: 'dream_item_mask',
    desc: 'Increases the drop rate of other Dream Relics by 20%.',
    stats: { dreamDropRateMult: 1.2 }
  }
];
const DREAM_RELICS_MAP = Object.fromEntries(DREAM_RELICS.map(r => [r.id, r]));

export { WEATHER_TYPES, BOSS_DATA, HORDE_EVENTS, RAINBOW_COLORS, WEAPON_DEFS, LEGENDARY_SETS, ALL_LEGENDARY_PIECES, ALL_TRINKETS, CAMP_WEAPONS, CAMP_TOOLS, MATERIALS, CAMP_GEAR, CAMP_COMPANIONS, BIOME_SCENE_FAMILIARS,
  CAMP_BUILDING_NPCS, MOUNTS, MOUNT_KEY_MAP, MOUNT_IMAGES, DAILY_QUEST_POOLS, getDailyDateKey, getDailyResetTimeRemaining, getDailyQuestsForToday, getAllCampQuests, getCampQuest, CAMP_QUESTS, PLAYABLE_CHARACTERS, LORE_ENTRIES, DEFAULT_UNLOCKED_LORE, CAMP_SCENES, NPC_DIALOGUES, COMPANION_RELIC_SKILLS, RUN_UPGRADES, TERRAIN_CONDITION_HINTS, LEFT_FACING_ENEMY_SPRITES, DREAM_RELICS, DREAM_RELICS_MAP };

export { DEFAULT_BIOME_SCALE, BASE_BLEND_HALF, BASE_BIOME_SCALE } from './world.mjs?v336';
