import { hashRand, biomeAt } from './world.mjs?v336';
import { relicEffectFor, saveRelicJournal, saveEquippedRelics } from './quests.mjs?v336';
import { ATLAS } from './assets.mjs?v336';
import { playSfx } from './audio.mjs?v336';
import { campSave, saveCamp, unlockLore } from './save.mjs?v336';
import { state, relicJournalIds, relicJournal, equippedRelicIds, player, playerWeapons, projectiles, xpGems, mines, holyPools, summonedSpirits, voidRifts, prismBeams, rainbowArcs, camera, VW, VH, isNight, spawnedBossBiomes } from './state.mjs?v336';
import { showDropToast, iconCanvas, renderAtlasIcons } from './ui-icons.mjs?v336';
import { TILE } from './underground.mjs?v336';
import { chunks, findCampSpawn } from './world-chunks.mjs?v336';
import { recomputeRelicModifiers, renderInventory, spawnParticles } from './relics-achievements.mjs?v336';
import { spawnEnemyAt, startBossIntro } from './enemies-spawner.mjs?v336';
import { updateHUD, updateWeaponHUD, checkLevelUp, enemies } from './game-core.mjs?v336';

const TRAVELER_LORE_TREE = {
  intro: {
    speaker: "Caelen the Stranded",
    title: "Vanguard Scout of Eld",
    text: "Hold your blade! ...By the ancient trees, you're not one of those void-born horrors. You bear the mark of the Guardians! Please, lower your steel. I've been stranded in this drowned marshland, hunted by nightmares from the abyss.",
    options: [
      { text: "Who are you, and what are you doing in this flooded mire?", next: "who" },
      { text: "What are those shadowy horrors pursuing you? (Ask about the Void)", next: "void" },
      { text: "What is that spiral sea horn in your pack?", next: "conch" },
      { text: "⚔ 'Steel yourself, Caelen. Whatever is hunting you, we face it together!'", action: "start_ambush" },
      { text: "I need to prepare myself first. Stay safe.", action: "close" }
    ]
  },
  who: {
    speaker: "Caelen the Stranded",
    title: "Vanguard Scout of Eld",
    text: "I was an advance scout for the Guardians before the Great Fracture. I was charting the roots of the five colossal Mega-Trees. When the tectonic rifts split open, the sea poured inland, drowning these marshes. The old scrolls spoke of the Sunken Temple hidden deep beneath... but the moment I unearthed the Tidecaller's Conch, the Void swarmed me.",
    options: [
      { text: "Tell me more about the Void God and the threat to Eld.", next: "void" },
      { text: "What does the Tidecaller's Conch do?", next: "conch" },
      { text: "⚔ 'I will defend you! Let them come!'", action: "start_ambush" },
      { text: "← Back", next: "intro" }
    ]
  },
  void: {
    speaker: "Caelen the Stranded",
    title: "Vanguard Scout of Eld",
    text: "They are thralls of the Void God, born from the rift in Dimension X. Legend says Aethelgard—the first and greatest Guardian—discovered that the five Mega-Trees were never sanctuaries, but living prisons of ancient world titans! Driven mad by this cosmic truth, he seeks to shatter the seals and consume all reality into eternal nothingness.",
    options: [
      { text: "How can we reach the Void God and end this nightmare?", next: "endgame_hints" },
      { text: "Tell me about the Tidecaller's Conch.", next: "conch" },
      { text: "⚔ 'We cannot let Eld fall. Ready your weapon, I\'ll protect you!'", action: "start_ambush" },
      { text: "← Back", next: "intro" }
    ]
  },
  conch: {
    speaker: "Caelen the Stranded",
    title: "Vanguard Scout of Eld",
    text: "The Tidecaller's Conch is an ancient relic forged from a deep leviathan. When blown under the open sky, it commands the heavens to unleash a 60-second torrential Deluge! The Sunken Temple in this swamp remains sealed in dry dirt—it can ONLY awaken when completely submerged beneath midnight floodwaters!",
    options: [
      { text: "Where do we go after the Sunken Temple?", next: "endgame_hints" },
      { text: "Who are you again?", next: "who" },
      { text: "⚔ 'Give me the word and draw your steel. We fight together!'", action: "start_ambush" },
      { text: "← Back", next: "intro" }
    ]
  },
  endgame_hints: {
    speaker: "Caelen the Stranded",
    title: "Vanguard Scout of Eld",
    text: "Listen carefully to the chain of secrets: 1. Blow the Conch during night in the Swamp to submerge the Sunken Temple and claim the Abyssal Key. 2. Dive into The Abyss and slay the Kraken for its Abyssal Heart. 3. Bring that Heart to the Frost Hermit on the highest blizzard peak (Mountain 5). 4. Awaken the five Mountain Titans to forge the Key to Dimension X. Only then can you breach the Void God\'s lair and decide Eld\'s fate!",
    options: [
      { text: "⚔ 'Understood. Let\'s eliminate your pursuers right now!'", action: "start_ambush" },
      { text: "← Back", next: "intro" }
    ]
  },
  ambush_in_progress: {
    speaker: "Caelen the Stranded",
    title: "Vanguard Scout of Eld",
    text: "They are surrounding us! Watch the perimeter—two concentric rings of Void horrors are closing in! Do not let them breach our perimeter!",
    options: [
      { text: "Keep your head down, I\'m cutting them down!", action: "close" }
    ]
  },
  ambush_survived: {
    speaker: "Caelen the Stranded",
    title: "Vanguard Scout of Eld",
    text: "By Eld\'s living light... you slaughtered the entire Void vanguard! I have never witnessed such martial power. The prophecies were true—you are the Guardian destined to break the cycle. Here, take the Tidecaller\'s Conch, my expedition gold, and my eternal gratitude!",
    options: [
      { text: "✦ Claim Conch & Clues (+300 Gold, +200 XP, Tidecaller's Conch)", action: "claim_reward" }
    ]
  },
  completed: {
    speaker: "Caelen the Stranded",
    title: "Vanguard Scout of Eld",
    text: "The path is clear. I will return to the Sanctuary Camp. Remember: blow the Tidecaller\'s Conch at midnight in the swamp to submerge the Sunken Temple. The fate of Eld rests on your shoulders, Guardian.",
    options: [
      { text: "Remind me of the path to the Void God.", next: "endgame_hints" },
      { text: "Safe travels, Caelen.", action: "close" }
    ]
  }
};

const FROST_HERMIT_LORE_TREE = {
  intro_no_heart: {
    text: "Step no closer unless Eld's ember burns in your veins... Wait—the Guardian mark glows upon your brow, Wayfarer. Long ago they called me Commander Alden of Frostpeak Hollow. Turn back for now: until the Kraken's Abyssal Heart melts the ice upon this Fifth Seal, no mortal blade can awaken the true Titan beneath.",
    options: [
      { text: "Commander Alden? From the Sin of the Blood Altar?", next: "alden_past" },
      { text: "Why did Aethelgard become the Void God?", next: "aethelgard_truth" },
      { text: "Where do I claim the Abyssal Heart?", next: "need_abyss" },
      { text: "I will return once the Kraken falls.", action: "close" }
    ]
  },
  intro_has_heart: {
    text: "Hold... that rhythmic crimson pulse beneath your cloak. You survived The Abyss and tore the Abyssal Heart from the Kraken! Commander Alden of the fallen Order greets you, Wayfarer. Lay the Heart upon my frostbound anvil—I will forge the Heart of Winter and wake the Fifth Seal's true Frostpeak Titan!",
    options: [
      { text: "❄ Offer Abyssal Heart — Forge Heart of Winter & Awaken Frostpeak Titan!", action: "forge_secret2" },
      { text: "Why did you exile yourself after the Blood Altar?", next: "alden_past" },
      { text: "Tell me the truth about Aethelgard and the Five Great Trees.", next: "aethelgard_truth" },
      { text: "Let me prepare before waking the Titan.", action: "close" }
    ]
  },
  alden_past: {
    text: "After the First Cataclysm, the seals binding the Five Great Trees fractured. To reinforce those living prisons, we—the elders still warming their hands at Valley Camp—spilled village blood upon the Blood Altar. I fled to Frostpeak Hollow in penance, guarding the Fifth Seal so none would wake the Titan unprepared.",
    options: [
      { text: "← Back", next: "back_root" }
    ]
  },
  aethelgard_truth: {
    text: "Grand Commander Aethelgard shattered when he pierced the Deep Void and saw Eld's endless wheel of recycled souls. He became the Void God not from petty malice, but to grant all reality The Final Quiet. To face him in Dimension X without another Blood Altar, you must break all Five Mountain Seals first.",
    options: [
      { text: "← Back", next: "back_root" }
    ]
  },
  need_abyss: {
    text: "Rescue Caelen in the flooded Swamp to earn Tidecaller's Conch, then blow it at midnight to submerge the Sunken Shrine. Claim the Abyssal Key, descend into The Abyss, and slay the Kraken for its Abyssal Heart.",
    options: [
      { text: "← Back", next: "back_root" }
    ]
  },
  titan_awakened: {
    text: "The Heart of Winter beats beside you—even deep rivers freeze solid beneath your boots. Yet the Awakened Frostpeak Titan still prowls this hollow behind the Fifth Seal. Bring it down to shatter the first Mountain Seal!",
    options: [
      { text: "❄ Re-Awaken the Frostpeak Titan inside the Hollow!", action: "respawn_titan" },
      { text: "Remind me of the Blood Altar and Aethelgard.", next: "alden_past" },
      { text: "I am hunting it now.", action: "close" }
    ]
  },
  completed: {
    text: "The Frostpeak Seal—the first of Eld's Five Mountain Seals—lies shattered! With the Heart of Winter and the Frozen Core in hand, four Mountain Sanctuaries remain: Alchemist's Caldera, The Whispering Grove, Arcane Sanctuary, and Morvath's Dread Crags. Seek their Shrines when you are ready to forge the Key to Dimension X.",
    options: [
      { text: "⚔ Challenge the Awakened Frostpeak Titan again.", action: "respawn_titan" },
      { text: "Tell me again of our sin at the Blood Altar.", next: "alden_past" },
      { text: "Rest well, Commander Alden.", action: "close" }
    ]
  }
};

const NPC_ARCHETYPES = {
  merchant: {
    role: 'merchant',
    name: 'Bartholomew the Peddler',
    title: 'Wandering Merchant',
    sprite: 'npc_bartholomew',
    indicator: '$',
    indicatorColor: '#ffd54f',
    greeting: "Greetings, traveler! The roads are treacherous, but my wares are guaranteed to keep your heart beating... for the right price.",
    stockPool: [
      { id: 'elixir_hp', name: 'Vitality Elixir', sprite: 'rpg_potion_red', cost: 50, desc: 'Restores full HP & permanently grants +25 Max HP for this run', apply: (p) => { p.maxHp += 25; p.hp = p.maxHp; } },
      { id: 'whetstone', name: 'Sharpening Whetstone', sprite: 'rpg_sword_gold', cost: 70, desc: '+15% Total Damage for this run', apply: (p) => { p.damageMultiplier = (p.damageMultiplier || 1) * 1.15; } },
      { id: 'wind_tincture', name: 'Windstride Draught', sprite: 'rpg_boot_leather', cost: 60, desc: '+12% Speed & -10% Weapon Cooldowns', apply: (p) => { p.speed *= 1.12; p.cooldownMultiplier = (p.cooldownMultiplier || 1) * 0.90; } },
      { id: 'tome_xp', name: 'Tome of Ancient Lore', sprite: 'rpg_scroll', cost: 65, desc: '+30% XP gain from all sources for this run', apply: (p) => { p.xpMultiplier = (p.xpMultiplier || 1) * 1.30; } },
      { id: 'gold_magnet', name: 'Alchemical Magnet', sprite: 'rpg_coin_gold', cost: 55, desc: 'Triples pickup range & +25% Gold find', apply: (p) => { p.pickupRange = (p.pickupRange || 32) * 3; p.goldFindMult = (p.goldFindMult || 1) * 1.25; } },
      { id: 'relic_cache', name: 'Mystery Relic Cache', sprite: 'gem', cost: 120, desc: 'Receive a guaranteed Rare Relic immediately', apply: () => { grantRandomRelic('rare'); } },
      { id: 'anchor', name: 'Anchor', sprite: 'rpg_anchor', cost: 80, desc: 'While standing still: +50% damage', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('anchor'); } },
      { id: 'random_teleport', name: 'Random Teleport', sprite: 'rpg_portal', cost: 75, desc: 'Every 10s you teleport randomly 5 tiles', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('random_teleport'); } },
      { id: 'shield_bubble', name: 'Shield Bubble', sprite: 'rpg_shield_blue', cost: 90, desc: 'Absorbs 1 hit every 8s', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('shield_bubble'); p.shieldBubbleCharges = 1; } },
      { id: 'time_dilation', name: 'Time Dilation', sprite: 'rpg_clock', cost: 100, desc: 'When HP <25%: everything around you moves 30% slower', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('time_dilation'); } },
      { id: 'time_freeze', name: 'Time Freeze', sprite: 'rpg_hourglass', cost: 150, desc: 'Every 60s: 3s where everything freezes except you', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('time_freeze'); } },
      { id: 'rewind', name: 'Rewind', sprite: 'rpg_reverse', cost: 200, desc: 'When you die: take back the last 10s (once)', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('rewind'); } },
      { id: 'bloodlust', name: 'Bloodlust', sprite: 'rpg_skull_red', cost: 85, desc: 'Every kill gives +1% damage until end of run (no cap!)', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('bloodlust'); p.bloodlustStacks = 0; } },
      { id: 'friendly_fire', name: 'Friendly Fire', sprite: 'rpg_fire_chaos', cost: 70, desc: 'Enemies damage each other', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('friendly_fire'); } },
      { id: 'ghost_walk', name: 'Ghost Walk', sprite: 'rpg_ghost', cost: 95, desc: 'Walk through enemies (no collision)', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('ghost_walk'); } },
      { id: 'twin_shot', name: 'Twin Shot', sprite: 'rpg_double_arrow', cost: 110, desc: 'Every weapon fires 2 projectiles instead of 1', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('twin_shot'); } },
      { id: 'rapid_fire', name: 'Rapid Fire', sprite: 'rpg_speed', cost: 65, desc: '+50% attack speed, -20% damage', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('rapid_fire'); p.cooldownMultiplier = (p.cooldownMultiplier || 1) * 0.67; p.damageMultiplier = (p.damageMultiplier || 1) * 0.80; } },
      { id: 'lucky_drop', name: 'Lucky Drop', sprite: 'rpg_star', cost: 60, desc: '20% chance each enemy drops double XP', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('lucky_drop'); } },
      { id: 'iron_skin', name: 'Iron Skin', sprite: 'rpg_armor', cost: 75, desc: '+50% armor but -20% speed', apply: (p) => { p.abilities = p.abilities || []; p.abilities.push('iron_skin'); p.defense = Math.min(0.85, (p.defense || 0) + 0.50); p.speed *= 0.80; } }
    ]
  },
  lost_traveler: {
    role: 'lost_traveler',
    name: 'Caelen the Stranded',
    title: 'Lost Traveler',
    sprite: 'npc_caelen',
    portraitSprite: 'npc_caelen',
    indicator: '!',
    indicatorColor: '#00e5ff',
    greeting: "Praise the heavens, a friendly face! Horrid beasts crawl from the flooded mire and surround my campsite. If you can thin their ranks, I can find my way home... and I will entrust you with a sacred oceanic relic!",
    inProgressMsg: "They are surrounding us! Watch the perimeter—two concentric rings of Void horrors are closing in!",
    completeMsg: "You survived! You've made the roads safe again. As promised, take this ancient sea horn—The Tidecaller's Conch! Legend whispers it summons the great deluge to awaken the Sunken Shrine...",
    quest: {
      type: 'defend_traveler',
      goal: 32,
      label: 'Survive Void Ambush',
      rewardGold: 300,
      rewardXp: 200
    }
  },
  traveler: {
    role: 'traveler',
    name: 'Tariq of the Dunes',
    title: 'Wayward Scout',
    sprite: 'npc_tariq',
    portraitSprite: 'npc_tariq',
    indicator: '!',
    indicatorColor: '#52ff52',
    greeting: "Greetings, wayfarer. The road ahead is crawling with hostile beasts. Clear out some of the predators in this region, and I will gladly share my bounty.",
    inProgressMsg: "The wilds are still swarming. Keep hunting until the contract is fulfilled!",
    completeMsg: "Fine hunting, friend! Here is your share of the bounty and a keepsake from my journeys.",
    quest: {
      type: 'kill_enemies',
      goal: 20,
      label: 'Slay Monsters',
      rewardGold: 120,
      rewardXp: 80
    }
  },
  hermit: {
    role: 'hermit',
    name: 'Old Man Alistair',
    title: 'Reclusive Hermit',
    sprite: 'npc_alistair',
    indicator: '✦',
    indicatorColor: '#c38cff',
    greeting: "Few seek the silence of these forgotten groves. Sit by my hearth, wayfarer. The spirits whisper of your perilous journey. Receive my blessing.",
    afterBlessingMsg: "The spirits of the wild walk beside you now. May the stars guide your blade.",
    blessings: [
      { id: 'might', name: 'Blessing of Might', sprite: 'rpg_sword_gold', desc: '+20% Damage & +10% Crit Chance for this run', apply: (p) => { p.damageMultiplier = (p.damageMultiplier || 1) * 1.20; p.critChance = (p.critChance || 0) + 0.10; } },
      { id: 'stone', name: 'Blessing of Stone', sprite: 'rpg_shield_gold', desc: '+25% Damage Reduction & +40 Max HP (heals full)', apply: (p) => { p.defense = Math.min(0.85, (p.defense || 0) + 0.25); p.maxHp += 40; p.hp = p.maxHp; } },
      { id: 'swiftness', name: 'Blessing of Swift Wind', sprite: 'rpg_boot_leather', desc: '+15% Move Speed & -15% Weapon Cooldowns', apply: (p) => { p.speed *= 1.15; p.cooldownMultiplier = (p.cooldownMultiplier || 1) * 0.85; } },
      { id: 'leyline', name: 'Blessing of Ley Lines', sprite: 'rpg_crystal_purple', desc: '+35% XP Gain & +1.5 HP/sec Health Regeneration', apply: (p) => { p.xpMultiplier = (p.xpMultiplier || 1) * 1.35; p.regen = (p.regen || 0) + 1.5; } }
    ]
  },
  gambler: {
    role: 'gambler',
    name: 'Rikkt the Dice Fiend',
    title: 'Risky Gambler',
    sprite: 'npc_rikkt',
    indicator: '🎲',
    indicatorColor: '#ff9800',
    greeting: "Hehehe! Looking to test your luck against the bone dice? Fortune smiles upon the bold, traveler... or leaves them with empty pockets! Care to roll?"
  },
  mad_farmer: {
    role: 'mad_farmer',
    name: 'The Mad Poultry Farmer',
    title: 'Eccentric Shrine Keeper',
    sprite: 'mad_farmer_idle',
    portraitSprite: 'mad_poultry_farmer',
    indicator: '!',
    indicatorColor: '#ffd700',
    greetingWithRelic: "I see you carry a rare artifact. I have something far more... unique. An egg not from this world. Trade me the relic, and it's yours.",
    greetingNoRelic: "Come back when you have something worth trading.",
    afterTradeMsg: "There is a Poultry King... in a place that is not here. Find the Shrine."
  }
};


function grantRandomRelic(tier = 'rare') {
  const poolNames = tier === 'legendary' 
    ? ['Worldroot Seed', 'First Flame', 'Crown of the Wilds']
    : ['Mirror Shard', 'Stormheart Relic', 'Phoenix Heart', 'Moonlit Astrolabe', 'Frostglass Eye', 'Sunken Signet'];
  const chosen = poolNames[Math.floor(Math.random() * poolNames.length)];
  const isLegendary = tier === 'legendary' || chosen === 'Worldroot Seed' || chosen === 'First Flame' || chosen === 'Crown of the Wilds';
  const relObj = {
    id: `relic_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    name: chosen,
    tier: isLegendary ? 'legendary' : 'rare',
    tierLabel: isLegendary ? 'Legendary' : 'Rare',
    color: isLegendary ? '#ffd45c' : '#61b8ff',
    xp: isLegendary ? 75 : 25,
    effect: relicEffectFor(chosen)
  };
  relicJournalIds.add(relObj.id);
  relicJournal.push(relObj);
  saveRelicJournal(relicJournal);
  recomputeRelicModifiers();
  renderInventory();
  return relObj;
}

function createNpcInstance(role, wx, wy){
  const currentBiome = biomeAt(wx, wy);
  // Strict rule: Lost Traveler can ONLY exist in the Swamp biome!
  if (false && role === 'lost_traveler' && currentBiome !== 'swamp') {
    role = 'traveler';
  }
  // Strict rule: Mad Poultry Farmer can ONLY exist in the Plains biome!
  if (false && role === 'mad_farmer' && currentBiome !== 'plains') {
    role = 'merchant';
  }
  const arch = NPC_ARCHETYPES[role] || NPC_ARCHETYPES.merchant;
  const vRoll = hashRand(wx, wy, 949);
  const ROLE_VARIANTS = {
    merchant: [
      { sprite: 'npc_bartholomew', name: 'Bartholomew the Peddler', title: 'Wandering Merchant' },
      { sprite: 'npc_thrain', name: 'Thrain Ironforge', title: 'Dwarven Armorer' },
      { sprite: 'npc_vance', name: 'Lord Vance', title: 'Guild Quartermaster' }
    ],
    lost_traveler: [
      { sprite: 'npc_caelen', portraitSprite: 'npc_caelen', name: 'Caelen the Stranded', title: 'Lost Traveler' }
    ],
    traveler: [
      { sprite: 'npc_tariq', portraitSprite: 'npc_tariq', name: 'Tariq of the Dunes', title: 'Desert Nomad' },
      { sprite: 'npc_malakor', portraitSprite: 'npc_malakor', name: 'Malakor Nightblade', title: 'Shadow Mercenary' },
      { sprite: 'npc_tariq', portraitSprite: 'npc_tariq', name: 'Bran the Wanderer', title: 'Wayward Scout' }
    ],
    hermit: [
      { sprite: 'npc_alistair', name: 'Old Man Alistair', title: 'Reclusive Hermit' },
      { sprite: 'npc_vesper', name: 'Vesper the Bone Seer', title: 'Occult Mystic' },
      { sprite: 'npc_corvus', name: 'Corvus the Alchemist', title: 'Plague Doctor' }
    ],
    gambler: [
      { sprite: 'npc_rikkt', name: 'Rikkt the Dice Fiend', title: 'Risky Gambler' },
      { sprite: 'npc_vance', name: 'Baron Sterling', title: 'High Roller' }
    ],
    mad_farmer: [
      { sprite: 'mad_farmer_idle', portraitSprite: 'mad_poultry_farmer', name: 'The Mad Poultry Farmer', title: 'Eccentric Shrine Keeper' }
    ]
  };
  const variants = ROLE_VARIANTS[role] || ROLE_VARIANTS.merchant;
  const chosenVar = (Math.abs(wx) <= 24 && Math.abs(wy) <= 24)
    ? variants[0]
    : variants[Math.floor(vRoll * variants.length)];
  const npc = {
    id: `npc_${wx}_${wy}`,
    x: wx*TILE + TILE/2,
    y: wy*TILE + TILE,
    role,
    name: chosenVar.name || arch.name,
    title: chosenVar.title || arch.title,
    sprite: chosenVar.sprite || arch.sprite,
    portraitSprite: chosenVar.portraitSprite || arch.portraitSprite || chosenVar.sprite || arch.sprite,
    animSeed: hashRand(wx, wy, 873) * 10,
    indicator: arch.indicator,
    indicatorColor: arch.indicatorColor,
    purchased: [],
    blessed: false,
    chosenBlessing: null
  };

  if(role === 'merchant'){
    const pool = [...arch.stockPool];
    npc.stock = [];
    for(let i=0; i<3; i++){
      const r = hashRand(wx + i*7, wy + i*13, 944 + i);
      const idx = Math.floor(r * pool.length);
      npc.stock.push(pool.splice(idx, 1)[0]);
    }
  } else if(role === 'lost_traveler'){
    npc.dialogueNode = 'intro';
    npc.quest = {
      type: 'defend_traveler',
      goal: 32,
      label: 'Survive Void Ambush',
      rewardGold: 300,
      rewardXp: 200,
      progress: 0,
      accepted: false,
      completed: false
    };
  } else if(role === 'traveler'){
    npc.quest = {
      type: 'kill_enemies',
      goal: 20,
      label: 'Slay Monsters',
      rewardGold: 120,
      rewardXp: 80,
      progress: 0,
      accepted: false,
      completed: false
    };
  } else if(role === 'hermit'){
    const pool = [...arch.blessings];
    npc.offerings = [];
    for(let i=0; i<3; i++){
      const r = hashRand(wx + i*5, wy + i*11, 946 + i);
      const idx = Math.floor(r * pool.length);
      npc.offerings.push(pool.splice(idx, 1)[0]);
    }
  }
  return npc;
}

function spawnAbyssalKraken(){
  // Clear any existing bosses/krakens in the arena
  for(let i = enemies.length - 1; i >= 0; i--) {
    if(enemies[i].boss || enemies[i].type === 'abyss_octopus' || enemies[i].type === 'Abyssal_kraken') {
      enemies.splice(i, 1);
    }
  }
  spawnedBossBiomes.add('abyss');
  const kraken = spawnEnemyAt(player.x, player.y - 320, 'abyss_octopus');
  if(kraken){
    kraken.boss = true;
    kraken.isKrakenBoss = true;
  }
  startBossIntro('abyss_octopus');
  state.screenShakeIntensity = 25;
  spawnParticles(player.x, player.y - 320, '#00e5ff', 50);
}

function tryInteractSunkenShrine() {
  if(!gameStarted || gameOver) return false;
  const px = player.x + player.w/2, py = player.y + player.h/2;
  for(const chunk of chunks.values()) {
    if(!chunk.tall) continue;
    for(const t of chunk.tall) {
      if(t.featureType === 'sunkenShrine') {
        const dh = 491 * (t.scale || 0.8);
        const cx = t.x, cy = t.y - dh * 0.4;
        const distSq = (cx - px)**2 + (cy - py)**2;
        if(distSq < 45000) {
          if(!campSave.hasAbyssalKey) {
            if(isNight() && flood.active) {
              campSave.hasAbyssalKey = true;
              if(!campSave.materials) campSave.materials = {};
              campSave.materials.abyssalKey = Math.max(campSave.materials.abyssalKey || 0, 1);
              saveCamp();
              unlockLore('clues', 'c_sunken_shrine');
              unlockLore('clues', 'c_abyss_key');
              unlockLore('journals', 'j_sunken_temple');
              playSfx('confirm');

              // Award The Abyssal Key relic into 4-slot inventory
              const abyssalKeyRelic = {
                id: 'relic_abyssal_key',
                name: "The Abyssal Key",
                tier: 'mythic',
                tierLabel: 'Secret World Key',
                sprite: 'Abyssal_Key',
                color: '#00e5ff',
                xp: 100,
                duration: 999999,
                requiresCampReturn: false,
                effect: {
                  label: 'Key of the Depths: Unlocks passage to The Sunken Depths (The Abyss) & +15% Damage.',
                  damage: 1.15
                }
              };
              if (!relicJournalIds.has(abyssalKeyRelic.id)) {
                relicJournalIds.add(abyssalKeyRelic.id);
                relicJournal.push(abyssalKeyRelic);
                saveRelicJournal(relicJournal);
                const emptySlotIdx = equippedRelicIds.findIndex(id => !id);
                if (emptySlotIdx !== -1) {
                  equippedRelicIds[emptySlotIdx] = abyssalKeyRelic.id;
                  saveEquippedRelics(equippedRelicIds);
                }
                recomputeRelicModifiers();
                renderInventory();
                if (typeof window.flyRelicToInventory === 'function') {
                  window.flyRelicToInventory({ x: t.x, y: t.y }, abyssalKeyRelic);
                }
              }

              showDropToast("🌊 The Sunken Shrine awakens! You received The Abyssal Key! Press [E] to enter The Abyss!", '#00e5ff');
              return true;
            } else {
              unlockLore('clues', 'c_sunken_shrine');
              showDropToast("The Sunken Shrine is dormant... It demands the midnight deluge (Night & Flood) to awaken!", '#4fc3f7');
              return true;
            }
          } else {
            // Already unlocked key -> enter Abyss!
            window.lastSurfacePos = { x: player.x, y: player.y };
            if (window.brokenWalls) window.brokenWalls.clear();
            if (typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
            player.x = 750000 * TILE;
            player.y = 750000 * TILE;
            camera.x = player.x - VW()/2;
            camera.y = player.y - VH()/2;
            playSfx('confirm');

            // Ensure key is in inventory
            if(!campSave.materials) campSave.materials = {};
            campSave.materials.abyssalKey = Math.max(campSave.materials.abyssalKey || 0, 1);

            // GUARANTEE KRAKEN BOSS IN THE SUNKEN DEPTHS!
            spawnAbyssalKraken();
            showDropToast("🦑 Plunged into The Sunken Depths! The Kraken awakens!", '#00e5ff');
            return true;
          }
        }
      } else if(t.featureType === 'abyssReturnPortal') {
        const dh = 491 * (t.scale || 0.8);
        const cx = t.x, cy = t.y - dh * 0.4;
        const distSq = (cx - px)**2 + (cy - py)**2;
        if(distSq < 45000) {
          if (window.brokenWalls) window.brokenWalls.clear();
          if (typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
          if (window.lastSurfacePos) {
            player.x = window.lastSurfacePos.x;
            player.y = window.lastSurfacePos.y;
          } else {
            player.x = 0;
            player.y = 0;
          }
          camera.x = player.x - VW()/2;
          camera.y = player.y - VH()/2;
          playSfx('confirm');
          showDropToast("Ascended from The Sunken Depths to the Surface.", '#88ff88');
          return true;
        }
      }
    }
  }
  return false;
}

function spawnSecret2FrostpeakTitan(centerX, centerY) {
  if (typeof window !== 'undefined' && window.IS_DEMO) return null;
  if (enemies.some(e => e.hp > 0 && e.isSecret2Titan)) {
    showDropToast('❄️ The Awakened Frostpeak Titan is already prowling Frostpeak Hollow!', '#4fc3f7');
    return null;
  }
  const m5 = window.MOUNTAIN_BIOMES?.[4];
  const sx = centerX ?? (m5 ? m5.valleyCenter.x : player.x);
  const sy = centerY ?? (m5 ? m5.valleyCenter.y + 185 : player.y - 200);
  const titan = spawnEnemyAt(sx, sy, 'iceTitan');
  if (titan) {
    titan.boss = true;
    titan.isSecret2Titan = true;
    titan.maxHp = Math.round((titan.maxHp || 1250) * 1.45);
    titan.hp = titan.maxHp;
    titan.damage = Math.round((titan.damage || 34) * 1.25);
    spawnedBossBiomes.add('snow');
  }
  startBossIntro('iceTitan');
  state.screenShakeIntensity = 22;
  spawnParticles(sx, sy, '#80deea', 55);
  showDropToast('❄️ FIFTH SEAL SHAKEN! The Awakened Frostpeak Titan emerges!', '#4fc3f7');
  return titan;
}

function tryInteractMountainShrine() {
  if (!gameStarted || gameOver) return false;
  const list = window.MOUNTAIN_BIOMES || [];
  const px = player.x + player.w / 2, py = player.y + player.h / 2;
  for (let i = 0; i < list.length; i++) {
    const mb = list[i];
    for (const lm of mb.landmarks || []) {
      if (lm.asset !== 'mountainShrine') continue;
      const lx = mb.startX + lm.relX;
      const ly = mb.startY + lm.relY;
      const dist = Math.hypot(px - lx, py - (ly - 107));
      if (dist > 135) continue;

      if (typeof window !== 'undefined' && window.IS_DEMO) {
        playSfx('select');
        showDropToast('❄️ The Mountain Seals awaken only in the Full Edition of PIXELVIVOR.', '#80deea');
        return true;
      }

      if (mb.id === 5) {
        if (!campSave.hasHeartOfWinter) {
          playSfx('select');
          showDropToast('❄️ Fifth Seal Altar dormant — Seek Commander Alden deeper inside Frostpeak Hollow!', '#4fc3f7');
          return true;
        }
        spawnSecret2FrostpeakTitan(mb.valleyCenter.x, mb.valleyCenter.y + 185);
        playSfx('confirm');
        return true;
      }

      playSfx('select');
      if (!campSave.secret2Complete) {
        showDropToast(`⛩️ ${mb.name} Seal is sealed — Shatter the Fifth Seal in Mountain 5 (Frostpeak Hollow) first!`, '#d9bd75');
      } else {
        showDropToast(`⛩️ ${mb.name} resonates (${campSave.mountainSealsBroken || 1}/5 Seals)... Remaining Mountain Titans awaken next!`, '#ffd54f');
      }
      return true;
    }
  }
  return false;
}
window.tryInteractMountainShrine = tryInteractMountainShrine;

function tryEnterChickenDimension() {
  if(!gameStarted || gameOver) return false;
  const px = player.x + player.w/2, py = player.y + player.h/2;
  for(const chunk of chunks.values()) {
    if(!chunk.tall) continue;
    for(const t of chunk.tall) {
      if(t.featureType === 'chickenShrine') {
        const dh = 135 * (t.scale || 1.0);
        const cx = t.x, cy = t.y - dh * 0.4;
        const distSq = (cx - px)**2 + (cy - py)**2;
        if(distSq < 45000) {
          if (state.chickenDimensionEntered) {
            playSfx('hit');
            showDropToast("The Chicken Shrine's power is exhausted for this run. Trade another Rare Relic in your next run!", '#ff5252');
            return true;
          }
          const hasEgg = Boolean(
            campSave.hasGoldenEgg ||
            (campSave.materials && campSave.materials.goldenEgg > 0)
          );
          if(!hasEgg) {
            playSfx('hit');
            showDropToast("The Chicken Shrine stands dormant... Trade a Rare Relic with the Mad Poultry Farmer for a Golden Egg!", '#ffd700');
            return true;
          } else {
            // Consume Golden Egg on entry & mark dimension entered for this run
            campSave.hasGoldenEgg = false;
            if (campSave.materials && campSave.materials.goldenEgg > 0) {
              campSave.materials.goldenEgg = Math.max(0, campSave.materials.goldenEgg - 1);
            }
            state.chickenDimensionEntered = true;
            saveCamp();

            window.lastSurfacePos = { x: player.x, y: player.y };
            if (window.brokenWalls) window.brokenWalls.clear();
            if (typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
            // Clear surface enemies, XP orbs, and active weapon fields
            enemies.length = 0;
            xpGems.length = 0;
            projectiles.length = 0;
            mines.length = 0;
            holyPools.length = 0;
            summonedSpirits.length = 0;
            voidRifts.length = 0;
            prismBeams.length = 0;
            rainbowArcs.length = 0;
            state.chickenCoinPickups = [];
            state.chickenPickups = [];
            state.chickenKingSpawned = false;
            state.chickenKingDefeated = false;

            // Restrict player weapons strictly to Boomerang inside the Chicken Dimension
            if (!state.savedChickenWeapons) {
              state.savedChickenWeapons = playerWeapons.map(w => ({ ...w }));
            }
            const existingBoomerang = playerWeapons.find(w => w.id === 'boomerang');
            const boomerangLevel = existingBoomerang ? existingBoomerang.level : Math.max(1, player.level || 1);
            playerWeapons.splice(0, playerWeapons.length, { id: 'boomerang', level: Math.min(8, boomerangLevel), timer: 0 });

            player.x = 950000 * TILE;
            player.y = 950000 * TILE;
            camera.x = player.x - VW()/2;
            camera.y = player.y - VH()/2;
            unlockLore('clues', 'c_chicken_shrine');
            unlockLore('journals', 'j_chicken_dimension');
            updateWeaponHUD();
            updateHUD();
            playSfx('confirm');
            showDropToast("Cluck-Cluck! Portal opened to the Chicken Dimension! Collect 100,000 Chicken Coins with your Boomerang to summon the Chicken King!", '#ffd700', 'goldenEgg');
            setTimeout(() => {
              if (typeof spawnEnemyAt === 'function') {
                for (let f = 0; f < 55; f++) {
                  const fa = (f / 55) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
                  const dist = 160 + (f % 6) * 55 + Math.random() * 35;
                  const mType = f % 14 === 0 ? 'giantChicken' : (f % 4 === 0 ? 'rooster' : 'chicken');
                  spawnEnemyAt(player.x + Math.cos(fa) * dist, player.y + Math.sin(fa) * dist, mType);
                }
              }
            }, 350);
            return true;
          }
        }
      } else if(t.featureType === 'chickenReturnPortal') {
        const dh = 135 * (t.scale || 1.0);
        const cx = t.x, cy = t.y - dh * 0.4;
        const distSq = (cx - px)**2 + (cy - py)**2;
        if(distSq < 45000) {
          if (!state.chickenKingDefeated) {
            playSfx('hit');
            showDropToast("Defeat the Chicken King (collect 100,000 Chicken Coins) to unlock the Return Portal!", '#ff5252');
            return true;
          }
          if (window.brokenWalls) window.brokenWalls.clear();
          if (typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
          enemies.length = 0;
          projectiles.length = 0;
          state.chickenCoinPickups = [];
          state.chickenPickups = [];
          // Restore player's normal weapon loadout upon returning to the Plains
          if (state.savedChickenWeapons && state.savedChickenWeapons.length > 0) {
            playerWeapons.splice(0, playerWeapons.length, ...state.savedChickenWeapons.map(w => ({ ...w, timer: 0 })));
            state.savedChickenWeapons = null;
          }
          if (window.lastSurfacePos) {
            player.x = window.lastSurfacePos.x;
            player.y = window.lastSurfacePos.y;
          } else {
            const plainsSpawn = typeof findCampSpawn === 'function' ? findCampSpawn('plains') : { x: 0, y: 0 };
            player.x = plainsSpawn.x;
            player.y = plainsSpawn.y;
          }
          camera.x = player.x - VW()/2;
          camera.y = player.y - VH()/2;
          updateWeaponHUD();
          updateHUD();
          playSfx('confirm');
          showDropToast("Returned from the Chicken Dimension to the Plains! Your weapons have been restored.", '#88ff88');
          return true;
        }
      }
    }
  }
  return false;
}
window.tryEnterChickenDimension = tryEnterChickenDimension;

function tryEnterVoid() {
  if(!gameStarted || gameOver) return false;
  
  if(!campSave.defeatedBossBiomes) campSave.defeatedBossBiomes = [];
  const requiredBiomes = ['plains','forest','magicForest','desert','snow','swamp','volcano','crystalWastes','fungalWastes','deadlands','badlands'];
  const hasAll = requiredBiomes.every(b => campSave.defeatedBossBiomes.includes(b));

  const px = player.x + player.w/2, py = player.y + player.h/2;
  for(const chunk of chunks.values()) {
    if(chunk.tall) {
      for(const t of chunk.tall) {
        if(t.featureType === 'voidPortal') {
          const r = ATLAS.regions[t.sprite];
          const dh = (r ? r.h : 32) * (t.scale || 10);
          const cx = t.x, cy = t.y - dh * 0.4;
          const distSq = (cx - px)**2 + (cy - py)**2;
          if(distSq < 40000) {
             if(!hasAll) {
                const count = requiredBiomes.filter(b => campSave.defeatedBossBiomes.includes(b)).length;
                showDropToast(`The Void Portal is sealed... (${count}/11 Bosses Defeated)`, '#ff5555');
                return true;
             }
             player.x = 400500 * TILE;
             player.y = 400500 * TILE;
             camera.x = player.x - VW()/2;
             camera.y = player.y - VH()/2;
             playSfx('confirm');
             showDropToast("You have entered the Void Realm.", '#cb8cff');
             return true;
          }
        }
      }
    }
  }
  return false;
}
function tryEnterCave() {
  if(!gameStarted || gameOver) return false;
  const px = player.x + player.w/2, py = player.y + player.h/2;
  for(const chunk of chunks.values()) {
    if(chunk.tall) {
      for(const t of chunk.tall) {
        if(t.featureType === 'lifeWell') {
          const cx = t.x, cy = t.y - 20;
          const distSq = (cx - px)**2 + (cy - py)**2;
          if(distSq < 25600) {
            playSfx('pickup');
            showDropToast('Rejuvenating Waters of the Well of Life restore your vigor!', '#64ffda', 'life_well');
            return true;
          }
        }
        if(t.featureType === 'cave') {
          const r = ATLAS.regions[t.sprite];
          const dh = (r ? r.h : 32) * (t.scale || 5.8);
          const cx = t.x, cy = t.y - dh * 0.4;
          const distSq = (cx - px)**2 + (cy - py)**2;
          if(distSq < 25600) {
             const tileX = Math.floor(px / TILE);
             if (tileX > 700000 && tileX < 900000) return false;
             if(tileX < 100000) {
               window.lastSurfacePos = { x: player.x, y: player.y };
               
               if (window.brokenWalls) window.brokenWalls.clear();
               if (typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
               const dung = window.DUNGEON1_DATA;
               const spawnX = (dung && dung.spawnX) || 26;
               const spawnY = (dung && dung.spawnY) || 23;
               player.x = (200000 + spawnX) * TILE;
               player.y = (200000 + spawnY) * TILE;
               player.tileX = spawnX;
               player.tileY = spawnY;
               player.pixelX = player.x;
               player.pixelY = player.y;
               player.moveFrom = { x: spawnX, y: spawnY };
               player.moveTo = { x: spawnX, y: spawnY };
               player.moveProgress = 1;
               player.moving = false;
               camera.x = player.x - VW()/2;
               camera.y = player.y - VH()/2;
               playSfx('confirm');
               showDropToast("Entered The Depths...", '#ffd54f');
               return true;
             } else if(tileX > 100000 && tileX < 300000) {
               
               if (window.brokenWalls) window.brokenWalls.clear();
               if (typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
               if (window.lastSurfacePos) {
                 player.x = window.lastSurfacePos.x;
                 player.y = window.lastSurfacePos.y;
               } else {
                 player.x -= 200000 * TILE;
                 player.y -= 200000 * TILE;
               }
               camera.x = player.x - VW()/2;
               camera.y = player.y - VH()/2;
               playSfx('confirm');
               showDropToast("Returned to Surface.", '#88ff88');
               return true;
             }
          }
        }
      }
    }
  }
  return false;
}
function tryInteractNPC(){
  if(!gameStarted || gameOver) return false;
  if(activeNearbyNPC){
    openNPCModal(activeNearbyNPC);
    return true;
  }
  const px = player.x + player.w/2, py = player.y + player.h/2;
  const fAlden = !(typeof window !== 'undefined' && window.IS_DEMO) ? window.FROST_HERMIT_NPC : null; if (fAlden && Math.hypot(px - fAlden.x, py - fAlden.y) < 105) { openNPCModal(fAlden); return true; }
  const mAlc = window.MAD_ALCHEMIST_NPC;
  if (mAlc && Math.hypot(px - mAlc.x, py - mAlc.y) < 85) {
    openNPCModal(mAlc);
    return true;
  }
  for(const chunk of chunks.values()){
    for(const npc of chunk.npcSites||[]){
      if(Math.hypot(px - npc.x, py - npc.y) < 85){
        openNPCModal(npc);
        return true;
      }
    }
  }
  return false;
}

function openNPCModal(npc){
  if(!npc) return;
  currentInteractingNPC = npc;
  npcModalOpen = true;
  paused = true;
  const modal = document.getElementById('npcModal');
  if(!modal) return;
  modal.classList.add('open');

  const portraitCont = document.getElementById('npcPortraitContainer');
  if(portraitCont){
    if(npc.portraitImg){
      const img = document.createElement('img');
      img.src = npc.portraitImg;
      img.style.width = '44px';
      img.style.height = '44px';
      img.style.objectFit = 'contain';
      img.style.imageRendering = 'pixelated';
      portraitCont.replaceChildren(img);
    } else {
      portraitCont.replaceChildren(iconCanvas(npc.portraitSprite || npc.sprite, 44));
    }
  }
  const roleEl = document.getElementById('npcModalRole');
  if(roleEl) roleEl.textContent = npc.title?.toUpperCase() || npc.role?.toUpperCase();
  const titleEl = document.getElementById('npcModalTitle');
  if(titleEl) titleEl.textContent = npc.name || 'Stranger';

  renderNPCModalContent();
}

function renderNPCModalContent(){
  if(!currentInteractingNPC) return;
  const npc = currentInteractingNPC;
  const arch = NPC_ARCHETYPES[npc.role];
  const speechEl = document.getElementById('npcDialogueText');
  const dynEl = document.getElementById('npcDynamicContent');
  const goldEl = document.getElementById('npcPlayerGold');
  if(goldEl) goldEl.textContent = campSave.gold;
  if(!dynEl || !speechEl) return;

  if(npc.role === 'frost_hermit'){
    if (typeof window !== 'undefined' && window.IS_DEMO) {
      speechEl.textContent = "The Fifth Seal slumbers until the Full Edition of PIXELVIVOR.";
      dynEl.innerHTML = '';
      return;
    }
    const hasHeart = Boolean(campSave.hasAbyssalHeart || (campSave.materials && campSave.materials.abyssalHeart > 0));
    const tundraKilled = Boolean(campSave.defeatedBossBiomes?.includes('snow') || campSave.hasFrozenCore);
    let nodeKey = npc.dialogueNode;
    if (!nodeKey || nodeKey === 'back_root') {
      if (campSave.secret2Complete) nodeKey = 'completed';
      else if (campSave.hasHeartOfWinter) nodeKey = 'titan_awakened';
      else nodeKey = hasHeart ? 'intro_has_heart' : 'intro_no_heart';
    }
    const node = FROST_HERMIT_LORE_TREE[nodeKey] || FROST_HERMIT_LORE_TREE.intro_no_heart;
    let bodyText = node.text;
    if ((nodeKey === 'intro_no_heart' || nodeKey === 'intro_has_heart') && tundraKilled && !campSave.secret2Complete) {
      bodyText += "\n\n(Alden notices the chill around you: \"You already shattered a wandering Ice Titan out on the tundra... yet the true Awakened Frostpeak Titan bound beneath this Fifth Seal is far deadlier.\")";
    }
    speechEl.textContent = bodyText;

    let optionsHtml = '<div class="npc-dialogue-choices">';
    for (const opt of node.options) {
      let btnClass = 'npc-dialogue-choice-btn';
      let clickAttr = '';
      if (opt.action === 'forge_secret2') {
        btnClass += ' primary-action';
        clickAttr = 'onclick="window.__forgeHeartOfWinterAndTitan()"';
      } else if (opt.action === 'respawn_titan') {
        btnClass += ' claim-action';
        clickAttr = 'onclick="window.__respawnSecret2Titan()"';
      } else if (opt.action === 'close') {
        btnClass += ' close-action';
        clickAttr = 'onclick="window.__closeTravelerDialogue()"';
      } else if (opt.next) {
        clickAttr = `onclick="window.__aldenDialogueNext('${opt.next}')"`;
      }
      optionsHtml += `<button class="${btnClass}" ${clickAttr} type="button">${opt.text}</button>`;
    }
    optionsHtml += '</div>';
    dynEl.innerHTML = optionsHtml;
    return;
  }
  if(npc.role === 'mad_alchemist'){
    speechEl.textContent = npc.dialogue || "Ah, you found me! I was wondering when you'd show up. Have a seat, we have much to discuss.";
    dynEl.innerHTML = `
      <div style="padding: 14px; background: rgba(20, 30, 25, 0.6); border: 1px solid rgba(129, 199, 132, 0.35); border-radius: 6px; text-align: center; color: #c8e6c9; font-size: 13px; font-style: italic; line-height: 1.5;">
        The alchemist sits peacefully among the ancient roots of the giant tree, observing your arrival with intrigued golden eyes.
      </div>
    `;
    return;
  }

  if(npc.role === 'merchant'){
    speechEl.textContent = arch.greeting;
    let html = '';
    (npc.stock || []).forEach((item, idx) => {
      const bought = npc.purchased?.includes(item.id);
      const canAfford = campSave.gold >= item.cost;
      html += `
        <div class="npc-shop-item">
          <div class="npc-item-info">
            <span data-sprite="${item.sprite}" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong>${item.name}</strong>
              <small>${item.desc}</small>
            </div>
          </div>
          <div>
            ${bought ? '<button class="npc-action-btn purchased" disabled>Purchased</button>' : `
              <button class="npc-action-btn" onclick="window.__buyMerchantItem(${idx})" ${canAfford ? '' : 'disabled'}>
                <span data-sprite="rpg_coin_gold" data-icon-size="16"></span> ${item.cost}g
              </button>
            `}
          </div>
        </div>
      `;
    });
    dynEl.innerHTML = html;
  } else if(npc.role === 'lost_traveler'){
    if (!npc.quest || npc.quest.type !== 'defend_traveler') {
      npc.quest = {
        type: 'defend_traveler',
        goal: 32,
        progress: 0,
        accepted: false,
        completed: false,
        label: 'Survive Void Ambush',
        rewardGold: 300,
        rewardXp: 200
      };
    }
    const q = npc.quest;
    const isCompleted = q?.completed || player.completedNPCs?.includes(npc.id);
    const isActive = player.activeQuest && player.activeQuest.npcId === npc.id;
    const canTurnIn = isActive && player.activeQuest.progress >= player.activeQuest.goal;

    let nodeKey = 'intro';
    if (isCompleted) {
      nodeKey = 'completed';
    } else if (canTurnIn) {
      nodeKey = 'ambush_survived';
    } else if (isActive) {
      nodeKey = 'ambush_in_progress';
    } else {
      nodeKey = npc.dialogueNode || 'intro';
    }

    const node = TRAVELER_LORE_TREE[nodeKey] || TRAVELER_LORE_TREE.intro;
    speechEl.textContent = node.text;

    let optionsHtml = '<div class="npc-dialogue-choices">';
    for (const opt of node.options) {
      let btnClass = 'npc-dialogue-choice-btn';
      let clickAttr = '';
      if (opt.action === 'start_ambush') {
        btnClass += ' primary-action';
        clickAttr = 'onclick="window.__startTravelerAmbush()"';
      } else if (opt.action === 'claim_reward') {
        btnClass += ' claim-action';
        clickAttr = 'onclick="window.__claimTravelerReward()"';
      } else if (opt.action === 'close') {
        btnClass += ' close-action';
        clickAttr = 'onclick="window.__closeTravelerDialogue()"';
      } else if (opt.next) {
        clickAttr = `onclick="window.__travelerDialogueNext('${opt.next}')"`;
      }
      optionsHtml += `<button class="${btnClass}" ${clickAttr} type="button">${opt.text}</button>`;
    }
    optionsHtml += '</div>';

    if (isActive && !isCompleted && !canTurnIn) {
      const prog = player.activeQuest.progress || 0;
      const goal = player.activeQuest.goal || 32;
      const pct = Math.min(100, Math.round((prog / goal) * 100));
      optionsHtml += `
        <div class="npc-quest-card" style="margin-top:10px;border-color:#ba68c8;">
          <div class="npc-item-info">
            <span data-sprite="rpg_sword_iron" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong style="color:#e040fb">Void Ambush In Progress!</strong>
              <small>Slaughter the Void Rings: ${prog} / ${goal} (${pct}%)</small>
            </div>
          </div>
          <span style="color:#ffd700;font-weight:bold;font-size:12px;">Active</span>
        </div>
      `;
    }

    dynEl.innerHTML = optionsHtml;
  } else if(npc.role === 'traveler'){
    const q = npc.quest || { type: 'kill_enemies', goal: 20, progress: 0, accepted: false, completed: false, label: 'Slay Monsters', rewardGold: 120, rewardXp: 80 };
    npc.quest = q;
    const isCompleted = q.completed || player.completedNPCs?.includes(npc.id);
    const isActive = player.activeQuest && player.activeQuest.npcId === npc.id;
    const canTurnIn = isActive && player.activeQuest.progress >= player.activeQuest.goal;

    if(isCompleted){
      speechEl.textContent = "Safe roads to you, friend. You have cleared the path of danger for all wanderers.";
      dynEl.innerHTML = `
        <div class="npc-quest-card" style="border-color:#4caf50;">
          <div class="npc-item-info">
            <span data-sprite="rpg_coin_gold" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong style="color:#4caf50">Bounty Completed!</strong>
              <small>Contract fulfilled. The wilderness is safer thanks to your blade.</small>
            </div>
          </div>
        </div>
      `;
    } else if(canTurnIn){
      speechEl.textContent = "Spectacular work! The predators are broken. Here is your share of the bounty and a relic from the frontier.";
      dynEl.innerHTML = `
        <div class="npc-quest-card" style="border-color:#ffd700;">
          <div class="npc-item-info">
            <span data-sprite="rpg_coin_gold" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong style="color:#ffd700">Contract Ready for Turn-In!</strong>
              <small>Reward: +${player.activeQuest.rewardGold || 120}g, +${player.activeQuest.rewardXp || 80} XP, Random Relic</small>
            </div>
          </div>
          <button class="npc-action-btn primary-action" onclick="window.__claimGenericQuestReward()">
            Claim Bounty
          </button>
        </div>
      `;
    } else if(isActive){
      const prog = player.activeQuest.progress || 0;
      const goal = player.activeQuest.goal || 20;
      const pct = Math.min(100, Math.round((prog / goal) * 100));
      speechEl.textContent = arch.inProgressMsg || "The wilds are still infested. Keep hunting!";
      dynEl.innerHTML = `
        <div class="npc-quest-card" style="border-color:#52ff52;">
          <div class="npc-item-info">
            <span data-sprite="rpg_sword_iron" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong style="color:#52ff52">Bounty In Progress</strong>
              <small>Slay Monsters: ${prog} / ${goal} (${pct}%)</small>
            </div>
          </div>
          <span style="color:#ffd700;font-weight:bold;font-size:12px;">Active</span>
        </div>
      `;
    } else {
      speechEl.textContent = arch.greeting;
      dynEl.innerHTML = `
        <div class="npc-quest-card">
          <div class="npc-item-info">
            <span data-sprite="rpg_scroll" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong>Monster Hunting Contract</strong>
              <small>Slay ${q.goal || 20} monsters in this realm. Reward: +${q.rewardGold || 120}g, +${q.rewardXp || 80} XP, Random Relic.</small>
            </div>
          </div>
          <button class="npc-action-btn" onclick="window.__acceptGenericQuest()">
            Accept Contract
          </button>
        </div>
      `;
    }
  } else if(npc.role === 'hermit'){
    if(npc.blessed || player.completedNPCs?.includes(npc.id)){
      speechEl.textContent = arch.afterBlessingMsg;
      dynEl.innerHTML = `
        <div class="npc-blessing-card">
          <div class="npc-item-info">
            <span data-sprite="rpg_wizard" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong style="color:#c38cff">Active Blessing: ${npc.chosenBlessing || 'Ancient Gift'}</strong>
              <small>The spirits will shield your footsteps until your run concludes.</small>
            </div>
          </div>
        </div>
      `;
    } else {
      speechEl.textContent = arch.greeting;
      let html = '';
      (npc.offerings || []).forEach((blessing, idx) => {
        html += `
          <div class="npc-blessing-card">
            <div class="npc-item-info">
              <span data-sprite="${blessing.sprite}" data-icon-size="28"></span>
              <div class="npc-item-copy">
                <strong>${blessing.name}</strong>
                <small>${blessing.desc}</small>
              </div>
            </div>
            <button class="npc-action-btn" onclick="window.__chooseHermitBlessing(${idx})">
              Choose
            </button>
          </div>
        `;
      });
      dynEl.innerHTML = html;
    }
  } else if(npc.role === 'gambler'){
    speechEl.textContent = arch.greeting;
    const canFlip = campSave.gold >= 50;
    const canRelic = campSave.gold >= 100;
    dynEl.innerHTML = `
      <div class="npc-gamble-card">
        <div class="npc-item-info">
          <span data-sprite="rpg_coin_gold" data-icon-size="28"></span>
          <div class="npc-item-copy">
            <strong>Coin Flip (50 Gold)</strong>
            <small>50% Chance: Win 120 Gold (+70g Net) | Lose 50g</small>
          </div>
        </div>
        <button class="npc-action-btn npc-gamble-btn" onclick="window.__gambleGame('coin_flip')" ${canFlip ? '' : 'disabled'}>
          Flip Coin
        </button>
      </div>
      <div class="npc-gamble-card">
        <div class="npc-item-info">
          <span data-sprite="gem" data-icon-size="28"></span>
          <div class="npc-item-copy">
            <strong>High Stakes Relic Roll (100 Gold)</strong>
            <small>50% Chance: Win Rare or Legendary Relic! | Lose 100g</small>
          </div>
        </div>
        <button class="npc-action-btn npc-gamble-btn" onclick="window.__gambleGame('relic_roll')" ${canRelic ? '' : 'disabled'}>
          Roll Dice
        </button>
      </div>
      <div id="gambleResultBox" class="gamble-status-box">Place your wager and roll the bones!</div>
    `;
  } else if(npc.role === 'mad_farmer'){
    const rareRelicInfo = findPlayerRareRelic();
    const hasGoldenEgg = Boolean(
      campSave.hasGoldenEgg ||
      (campSave.materials && campSave.materials.goldenEgg > 0)
    );
    const coins = Math.max(0, Math.floor(Number(state.chickenCoins ?? campSave.chickenCoins) || 0));
    state.chickenCoins = coins;
    campSave.chickenCoins = coins;

    let cardsHtml = '';
    if (rareRelicInfo && !hasGoldenEgg) {
      speechEl.textContent = arch.greetingWithRelic;
      cardsHtml += `
        <div class="npc-quest-card">
          <div class="npc-item-info">
            <span data-sprite="goldenEgg" data-icon-size="32"></span>
            <div class="npc-item-copy">
              <strong style="color:#ffd700">Golden Egg (Otherworldly Artifact)</strong>
              <small>Offer Rare Relic: <span style="color:#61b8ff">${rareRelicInfo.relic.name}</span></small>
            </div>
          </div>
          <button class="npc-action-btn" onclick="window.__tradeMadFarmerRelic()" style="background:#ffd700;color:#000;font-weight:bold;">
            Trade
          </button>
        </div>
      `;
    } else if (!hasGoldenEgg && !npc.traded && coins === 0) {
      speechEl.textContent = arch.greetingNoRelic;
      cardsHtml += `
        <div class="npc-quest-card">
          <div class="npc-item-info">
            <span data-sprite="gem" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong style="color:#aaa">Requires a Rare Relic</strong>
              <small>Bring a Rare Relic (e.g., Moonlit Astrolabe) to trade for the Golden Egg.</small>
            </div>
          </div>
        </div>
      `;
    } else {
      speechEl.textContent = coins > 0
        ? "Ah, you survived the Poultry Realm! Trade me those shiny Chicken Coins for pure arcane experience!"
        : arch.afterTradeMsg;
    }

    if (hasGoldenEgg || npc.traded || coins > 0) {
      const xpOffers = getFarmerXpOffers();
      const curLvl = Math.max(1, player.level || 1);
      const canBuySmall = coins >= 2500;
      const canBuyMed = coins >= 12500;
      const canBuyLarge = coins >= 50000;
      cardsHtml += `
        <div class="npc-quest-card" style="margin-bottom:8px;border-color:rgba(255,215,0,0.4);">
          <div class="npc-item-info">
            <span data-sprite="chickenCoin" data-icon-size="30"></span>
            <div class="npc-item-copy">
              <strong style="color:#ffd700">Chicken Coin Pouch: 🪙 ${coins.toLocaleString('en-US')} Coins</strong>
              <small>Exchange Chicken Coins for XP (scales with your current Level: Lv ${curLvl}).</small>
            </div>
          </div>
        </div>
        <div class="npc-shop-item">
          <div class="npc-item-info">
            <span data-sprite="rpg_scroll" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong>Poultry Wisdom (+${xpOffers.small.toLocaleString('en-US')} XP)</strong>
              <small>Cost: 2,500 Chicken Coins (~10% of Lv ${curLvl} XP)</small>
            </div>
          </div>
          <button class="npc-action-btn" onclick="window.__buyFarmerXp(2500, 'small')" ${canBuySmall ? '' : 'disabled'}>
            <span data-sprite="chickenCoin" data-icon-size="16"></span> 2,500 Coins
          </button>
        </div>
        <div class="npc-shop-item">
          <div class="npc-item-info">
            <span data-sprite="rpg_scroll" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong>Rooster's Tome (+${xpOffers.medium.toLocaleString('en-US')} XP)</strong>
              <small>Cost: 12,500 Chicken Coins (~40% of Lv ${curLvl} XP)</small>
            </div>
          </div>
          <button class="npc-action-btn" onclick="window.__buyFarmerXp(12500, 'medium')" ${canBuyMed ? '' : 'disabled'}>
            <span data-sprite="chickenCoin" data-icon-size="16"></span> 12,500 Coins
          </button>
        </div>
        <div class="npc-shop-item">
          <div class="npc-item-info">
            <span data-sprite="goldenEgg" data-icon-size="28"></span>
            <div class="npc-item-copy">
              <strong>Royal Poultry Codex (+${xpOffers.large.toLocaleString('en-US')} XP)</strong>
              <small>Cost: 50,000 Chicken Coins (~95% of Lv ${curLvl} XP)</small>
            </div>
          </div>
          <button class="npc-action-btn" onclick="window.__buyFarmerXp(50000, 'large')" ${canBuyLarge ? '' : 'disabled'}>
            <span data-sprite="chickenCoin" data-icon-size="16"></span> 50,000 Coins
          </button>
        </div>
      `;
    }
    dynEl.innerHTML = cardsHtml;
  }

  renderAtlasIcons(dynEl);
}

function closeNPCModal(){
  npcModalOpen = false;
  paused = false;
  currentInteractingNPC = null;
  document.getElementById('npcModal')?.classList.remove('open');
}

window.__buyMerchantItem = function(index){
  if(!currentInteractingNPC || currentInteractingNPC.role !== 'merchant') return;
  const item = currentInteractingNPC.stock?.[index];
  if(!item) return;
  if(currentInteractingNPC.purchased?.includes(item.id)) return;
  if(campSave.gold < item.cost) return;
  campSave.gold -= item.cost;
  if(!currentInteractingNPC.purchased) currentInteractingNPC.purchased = [];
  currentInteractingNPC.purchased.push(item.id);
  item.apply(player);
  playSfx('confirm');
  saveCamp();
  updateHUD();
  const toast=document.createElement('div');toast.className='relic-toast';
  toast.style.borderColor='#ffd700';
  toast.style.boxShadow='0 0 25px rgba(255, 215, 0, 0.6)';
  toast.innerHTML=`<strong style="color:#ffd700">PURCHASED: ${item.name}</strong><br/>${item.desc}`;
  document.getElementById('relicToasts')?.appendChild(toast);
  setTimeout(()=>toast.remove(),4000);
  renderNPCModalContent();
};

window.__aldenDialogueNext = function(nodeKey){
  if(!currentInteractingNPC || currentInteractingNPC.role !== 'frost_hermit') return;
  currentInteractingNPC.dialogueNode = (nodeKey === 'back_root') ? null : nodeKey;
  playSfx('select');
  renderNPCModalContent();
};

window.__forgeHeartOfWinterAndTitan = function(){
  if(!currentInteractingNPC || currentInteractingNPC.role !== 'frost_hermit') return;
  if(typeof window !== 'undefined' && window.IS_DEMO) return;
  const hasHeart = Boolean(campSave.hasAbyssalHeart || (campSave.materials && campSave.materials.abyssalHeart > 0));
  if(!hasHeart) return;

  campSave.hasAbyssalHeart = true;
  campSave.hasHeartOfWinter = true;
  campSave.secret2Stage = Math.max(campSave.secret2Stage || 0, 2);
  unlockLore('clues', 'c_frost_hermit');
  unlockLore('journals', 'j_alden_confession');
  saveCamp();

  if (!relicJournalIds.has('relic_heart_of_winter')) {
    const winterRelic = {
      id: 'relic_heart_of_winter',
      name: 'Heart of Winter',
      tier: 'rare',
      tierLabel: 'Secret World Relic',
      sprite: 'rpg_frozenCore',
      color: '#4fc3f7',
      xp: 120,
      duration: 999999,
      requiresCampReturn: false,
      effect: { label: 'Freeze water under footsteps · +10% Move Speed', power: 'iceBridge', speed: 1.10 }
    };
    relicJournalIds.add(winterRelic.id);
    relicJournal.push(winterRelic);
    saveRelicJournal(relicJournal);
    const emptySlotIdx = equippedRelicIds.findIndex(id => !id);
    if (emptySlotIdx !== -1) {
      equippedRelicIds[emptySlotIdx] = winterRelic.id;
      saveEquippedRelics(equippedRelicIds);
    }
    if (typeof window.flyRelicToInventory === 'function') {
      window.flyRelicToInventory({ x: currentInteractingNPC.x, y: currentInteractingNPC.y }, winterRelic);
    }
  }
  recomputeRelicModifiers();
  renderInventory();
  updateWeaponHUD();

  playSfx('confirm');
  currentInteractingNPC.dialogueNode = null;
  closeNPCModal();
  const m5 = window.MOUNTAIN_BIOMES?.[4];
  spawnSecret2FrostpeakTitan(m5 ? m5.valleyCenter.x : player.x, m5 ? m5.valleyCenter.y + 185 : player.y - 200);
};

window.__respawnSecret2Titan = function(){
  if(!currentInteractingNPC || currentInteractingNPC.role !== 'frost_hermit') return;
  if(typeof window !== 'undefined' && window.IS_DEMO) return;
  playSfx('confirm');
  currentInteractingNPC.dialogueNode = null;
  closeNPCModal();
  const m5 = window.MOUNTAIN_BIOMES?.[4];
  spawnSecret2FrostpeakTitan(m5 ? m5.valleyCenter.x : player.x, m5 ? m5.valleyCenter.y + 185 : player.y - 200);
};

window.__travelerDialogueNext = function(nodeKey){
  if(!currentInteractingNPC || currentInteractingNPC.role !== 'lost_traveler') return;
  currentInteractingNPC.dialogueNode = nodeKey;
  playSfx('select');
  renderNPCModalContent();
};

window.__closeTravelerDialogue = function(){
  closeNPCModal();
};

window.__startTravelerAmbush = function(){
  if(!currentInteractingNPC || currentInteractingNPC.role !== 'lost_traveler') return;
  const npc = currentInteractingNPC;
  const cx = npc.x;
  const cy = npc.y;
  const ambushGoal = 32;

  npc.ambushActive = true;
  npc.ambushGoal = ambushGoal;
  npc.ambushProgress = 0;
  npc.dialogueNode = 'ambush_in_progress';

  player.activeQuest = {
    npcId: npc.id,
    type: 'defend_traveler',
    label: 'Survive Void Ambush',
    goal: ambushGoal,
    progress: 0,
    rewardGold: 300,
    rewardXp: 200,
    notified: false
  };

  closeNPCModal();

  playSfx('warning');
  state.screenShakeIntensity = 18;
  spawnParticles(cx, cy, '#9c27b0', 50);

  // Concentric Ring 1: Inner ring of 14 Void Crawlers and Voidlings (radius 260px)
  const innerCount = 14;
  const innerR = 260;
  const innerPool = ['void_crawler', 'voidling'];
  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2;
    const ex = cx + Math.cos(angle) * innerR;
    const ey = cy + Math.sin(angle) * innerR;
    const mType = innerPool[i % innerPool.length];
    const mob = spawnEnemyAt(ex, ey, mType, { hordeSpawn: true });
    if (mob) {
      mob.ambushMob = true;
      mob.ambushNpcId = npc.id;
    }
    spawnParticles(ex, ey, '#ba68c8', 12);
  }

  // Concentric Ring 2: Outer ring of 18 Void Spirits, Horrors, Shadow Demons, Void Casters & Behemoths (radius 500px)
  const outerCount = 18;
  const outerR = 500;
  const outerPool = ['voidSpirit', 'voidHorror', 'shadowDemon', 'void_caster'];
  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2 + (Math.PI / outerCount);
    const ex = cx + Math.cos(angle) * outerR;
    const ey = cy + Math.sin(angle) * outerR;
    const mType = (i === 0 || i === 9) ? 'void_behemoth' : outerPool[i % outerPool.length];
    const mob = spawnEnemyAt(ex, ey, mType, { hordeSpawn: true });
    if (mob) {
      mob.ambushMob = true;
      mob.ambushNpcId = npc.id;
    }
    spawnParticles(ex, ey, '#7b1fa2', 15);
  }

  const toast = document.createElement('div');
  toast.className = 'relic-toast';
  toast.style.borderColor = '#e040fb';
  toast.style.boxShadow = '0 0 35px rgba(224, 64, 251, 0.9)';
  toast.innerHTML = '<strong style="color:#e040fb">⚔ VOID AMBUSH INITIATED!</strong><br/>Protect Caelen! Slaughter the 2 concentric Void Rings (0/32)!';
  document.getElementById('relicToasts')?.appendChild(toast);
  setTimeout(() => toast.remove(), 5500);
};

window.__acceptTravelerQuest = window.__startTravelerAmbush;

window.__claimTravelerReward = function(){
  if(!currentInteractingNPC || currentInteractingNPC.role !== 'lost_traveler') return;
  const npc = currentInteractingNPC;
  const q = npc.quest;
  if(!player.activeQuest || player.activeQuest.progress < player.activeQuest.goal) return;

  campSave.gold += 300;
  player.xp += 200;
  checkLevelUp();

  // Story Reward: Guarantee Tidecaller\'s Conch on first rescue!
  let relic;
  if(!campSave.hasTidecallerConch && !relicJournalIds.has('relic_tidecaller_conch')) {
    campSave.hasTidecallerConch = true;
    if(!campSave.materials) campSave.materials = {};
    campSave.materials.tidecallersConch = Math.max(campSave.materials.tidecallersConch || 0, 1);
    unlockLore('clues', 'c_tidecaller_conch');
    unlockLore('clues', 'c_sunken_shrine');
    unlockLore('clues', 'c_abyss_kraken');
    relic = {
      id: 'relic_tidecaller_conch',
      name: "Tidecaller's Conch",
      tier: 'rare',
      tierLabel: 'Secret World Relic',
      sprite: 'Tidecallers_Conch',
      color: '#00e5ff',
      xp: 50,
      effect: {
        label: 'Active: Click in 4-slot inventory or press to summon a 60s Flood Deluge! (1x/run)',
        power: 'tidecaller'
      },
      duration: 999999,
      requiresCampReturn: false
    };
    relicJournalIds.add(relic.id);
    relicJournal.push(relic);
    saveRelicJournal(relicJournal);
    const emptySlotIdx = equippedRelicIds.findIndex(id => !id);
    if(emptySlotIdx !== -1) {
      equippedRelicIds[emptySlotIdx] = relic.id;
      saveEquippedRelics(equippedRelicIds);
    }
    recomputeRelicModifiers();
    renderInventory();
    updateWeaponHUD();
  } else {
    relic = grantRandomRelic('rare');
  }

  // Visual flying effect sending relic to the 4 slots inventory at top screen
  if (typeof window.flyRelicToInventory === 'function') {
    window.flyRelicToInventory({ x: npc.x, y: npc.y }, relic);
  }

  if(!player.completedNPCs) player.completedNPCs = [];
  player.completedNPCs.push(npc.id);
  if (q) q.completed = true;
  npc.ambushActive = false;
  npc.ambushCompleted = true;
  npc.dialogueNode = 'completed';
  player.activeQuest = null;

  playSfx('confirm');
  saveCamp();
  updateHUD();

  const toast = document.createElement('div');
  toast.className = 'relic-toast';
  toast.style.borderColor = '#00e5ff';
  toast.style.boxShadow = '0 0 35px rgba(0, 229, 255, 0.85)';
  toast.innerHTML = `<strong style="color:#00e5ff">TRAVELER RESCUED!</strong><br/>+300g, +200 XP, and Received: <span style="color:${relic.color}">${relic.name}</span>!`;
  document.getElementById('relicToasts')?.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);

  renderNPCModalContent();
};

window.__chooseHermitBlessing = function(index){
  if(!currentInteractingNPC || currentInteractingNPC.role !== 'hermit') return;
  if(currentInteractingNPC.blessed) return;
  const blessing = currentInteractingNPC.offerings?.[index];
  if(!blessing) return;
  blessing.apply(player);
  currentInteractingNPC.blessed = true;
  currentInteractingNPC.chosenBlessing = blessing.name;
  if(!player.completedNPCs) player.completedNPCs = [];
  player.completedNPCs.push(currentInteractingNPC.id);
  playSfx('confirm');
  spawnParticles(player.x + player.w/2, player.y + player.h/2, '#c38cff', 24);
  updateHUD();
  const toast=document.createElement('div');toast.className='relic-toast';
  toast.style.borderColor='#c38cff';
  toast.style.boxShadow='0 0 30px rgba(195, 140, 255, 0.7)';
  toast.innerHTML=`<strong style="color:#c38cff">HERMIT BLESSING RECEIVED!</strong><br/>${blessing.name}: ${blessing.desc}`;
  document.getElementById('relicToasts')?.appendChild(toast);
  setTimeout(()=>toast.remove(),5000);
  renderNPCModalContent();
};

window.__gambleGame = function(gameType){
  if(!currentInteractingNPC || currentInteractingNPC.role !== 'gambler' || gamblingInProgress) return;
  const cost = gameType === 'coin_flip' ? 50 : 100;
  if(campSave.gold < cost){
    const resEl = document.getElementById('gambleResultBox');
    if(resEl) resEl.innerHTML = '<span style="color:#ff5252">Not enough gold to place this wager!</span>';
    return;
  }
  campSave.gold -= cost;
  updateHUD();
  gamblingInProgress = true;
  const resEl = document.getElementById('gambleResultBox');
  if(resEl){
    resEl.innerHTML = gameType === 'coin_flip' 
      ? '<span class="gamble-rolling">🪙 Flipping the golden coin...</span>' 
      : '<span class="gamble-rolling">🎲 Rolling the bone dice...</span>';
  }
  document.querySelectorAll('.npc-gamble-btn').forEach(btn => btn.disabled = true);
  setTimeout(()=>{
    gamblingInProgress = false;
    const win = Math.random() < 0.50;
    if(gameType === 'coin_flip'){
      if(win){
        campSave.gold += 120;
        playSfx('confirm');
        if(resEl) resEl.innerHTML = '<span style="color:#52ff52;font-size:15px;">🎉 Heads! WINNER! Paid out 120 Gold (+70g profit)!</span>';
        const toast=document.createElement('div');toast.className='relic-toast';
        toast.style.borderColor='#ffd700';
        toast.innerHTML='<strong style="color:#ffd700">COIN FLIP WON!</strong><br/>+120 Gold added to your pouch!';
        document.getElementById('relicToasts')?.appendChild(toast);
        setTimeout(()=>toast.remove(),4000);
      } else {
        playSfx('hit');
        if(resEl) resEl.innerHTML = '<span style="color:#ff5252;font-size:15px;">💀 Tails! The Gambler swept the pot!</span>';
      }
    } else {
      if(win){
        const isLegendary = Math.random() < 0.35;
        const relic = grantRandomRelic(isLegendary ? 'legendary' : 'rare');
        playSfx('confirm');
        if(resEl) resEl.innerHTML = `<span style="color:#ffd700;font-size:15px;">👑 NATURAL 20! Won <strong style="color:${relic.color}">${relic.name}</strong> (${relic.tierLabel})!</span>`;
        const toast=document.createElement('div');toast.className='relic-toast';
        toast.style.borderColor='#ffd700';
        toast.style.boxShadow='0 0 35px rgba(255, 215, 0, 0.8)';
        toast.innerHTML=`<strong style="color:#ffd700">GAMBLER HIGH ROLLER!</strong><br/>Won Relic: <span style="color:${relic.color}">${relic.name}</span>!`;
        document.getElementById('relicToasts')?.appendChild(toast);
        setTimeout(()=>toast.remove(),5000);
      } else {
        playSfx('hit');
        if(resEl) resEl.innerHTML = '<span style="color:#ff5252;font-size:15px;">🎲 Snake Eyes! Rolled a 1! The chest stays locked.</span>';
      }
    }
    saveCamp();
    updateHUD();
    document.querySelectorAll('.npc-gamble-btn').forEach(btn => btn.disabled = false);
    const goldDisplay = document.getElementById('npcPlayerGold');
    if(goldDisplay) goldDisplay.textContent = campSave.gold;
  }, 650);
};

function findPlayerRareRelic() {
  const RARE_RELIC_NAMES = new Set([
    'Moonlit Astrolabe',
    'Mirror Shard',
    'Stormheart Relic',
    'Phoenix Heart',
    'Frostglass Eye',
    'Sunken Signet'
  ]);
  const isRareRelic = (r) => Boolean(r && r.id !== 'relic_golden_egg' && (r.tier === 'rare' || String(r.tierLabel || '').toLowerCase() === 'rare' || RARE_RELIC_NAMES.has(r.name)));
  const activeCarried = state.carriedRelic || (typeof window !== 'undefined' ? window.carriedRelic : null);
  if (activeCarried && isRareRelic(activeCarried)) {
    return { source: 'carried', relic: activeCarried };
  }
  if (Array.isArray(relicJournal)) {
    const preferredIdx = relicJournal.findIndex(r => r && r.name === 'Moonlit Astrolabe' && isRareRelic(r));
    if (preferredIdx >= 0) return { source: 'journal', index: preferredIdx, relic: relicJournal[preferredIdx] };
    const idx = relicJournal.findIndex(isRareRelic);
    if (idx >= 0) return { source: 'journal', index: idx, relic: relicJournal[idx] };
  }
  // Fallback: accept any carried or stored relic so the player can trade any relic they acquire
  if (activeCarried && activeCarried.id !== 'relic_golden_egg') {
    return { source: 'carried', relic: activeCarried };
  }
  if (Array.isArray(relicJournal)) {
    const anyIdx = relicJournal.findIndex(r => r && r.id !== 'relic_golden_egg');
    if (anyIdx >= 0) return { source: 'journal', index: anyIdx, relic: relicJournal[anyIdx] };
  }
  return null;
}

window.__tradeMadFarmerRelic = function(){
  if (!currentInteractingNPC || currentInteractingNPC.role !== 'mad_farmer') return;
  const rareRelicInfo = findPlayerRareRelic();
  if (!rareRelicInfo) {
    renderNPCModalContent();
    return;
  }
  const tradedName = rareRelicInfo.relic.name || 'Rare Relic';
  const tradedId = rareRelicInfo.relic.id;
  if (rareRelicInfo.source === 'carried') {
    state.carriedRelic = null;
  } else if (rareRelicInfo.source === 'journal' && Array.isArray(relicJournal)) {
    relicJournal.splice(rareRelicInfo.index, 1);
    if (tradedId && relicJournalIds) relicJournalIds.delete(tradedId);
    if (tradedId && Array.isArray(equippedRelicIds)) {
      const eqIdx = equippedRelicIds.indexOf(tradedId);
      if (eqIdx >= 0) {
        equippedRelicIds.splice(eqIdx, 1);
        saveEquippedRelics();
      }
    }
    saveRelicJournal(relicJournal);
  }
  recomputeRelicModifiers();

  // Add Golden Egg to inventory & unlock lore entry
  campSave.hasGoldenEgg = true;
  if (!campSave.materials) campSave.materials = {};
  campSave.materials.goldenEgg = (campSave.materials.goldenEgg || 0) + 1;
  if (!campSave.collectedTrophies) campSave.collectedTrophies = [];
  if (!campSave.collectedTrophies.includes('goldenEgg')) {
    campSave.collectedTrophies.push('goldenEgg');
  }
  currentInteractingNPC.traded = true;
  currentInteractingNPC.indicator = '✦';
  currentInteractingNPC.indicatorColor = '#52ff52';
  if (!player.completedNPCs) player.completedNPCs = [];
  if (!player.completedNPCs.includes(currentInteractingNPC.id)) {
    player.completedNPCs.push(currentInteractingNPC.id);
  }

  saveCamp();
  unlockLore('clues', 'c_chicken_shrine');
  renderInventory();
  updateHUD();
  playSfx('confirm');
  showDropToast(`Traded ${tradedName} for the Golden Egg!`, '#ffd700', 'goldenEgg');
  renderNPCModalContent();
};

function getFarmerXpOffers() {
  const xpNext = Math.max(10, Math.floor(Number(player.xpNext) || 10));
  return {
    small: Math.max(1, Math.round(xpNext * 0.10)),
    medium: Math.max(4, Math.round(xpNext * 0.40)),
    large: Math.max(9, Math.round(xpNext * 0.95))
  };
}

window.__buyFarmerXp = function(coinCost = 2500, tierOrAmount = 'small'){
  if (!currentInteractingNPC || currentInteractingNPC.role !== 'mad_farmer') return;
  const currentCoins = Math.max(0, Math.floor(Number(state.chickenCoins ?? campSave.chickenCoins) || 0));
  if (currentCoins < coinCost) {
    playSfx('hit');
    return;
  }
  const offers = getFarmerXpOffers();
  const xpAmount = typeof tierOrAmount === 'string' ? (offers[tierOrAmount] || offers.small) : Math.max(1, Number(tierOrAmount) || offers.small);
  const nextCoins = currentCoins - coinCost;
  state.chickenCoins = nextCoins;
  campSave.chickenCoins = nextCoins;
  saveCamp();
  player.xp = (player.xp || 0) + xpAmount;
  playSfx('confirm');
  checkLevelUp();
  updateHUD();
  showDropToast(`Spent ${coinCost.toLocaleString('en-US')} Chicken Coins for +${xpAmount.toLocaleString('en-US')} XP!`, '#ffd700', 'chickenCoin');
  renderNPCModalContent();
};

document.getElementById('npcModalClose')?.addEventListener('click', closeNPCModal);
document.getElementById('npcLeaveBtn')?.addEventListener('click', closeNPCModal);

export { NPC_ARCHETYPES, grantRandomRelic, createNpcInstance, tryInteractSunkenShrine, tryInteractMountainShrine, tryEnterChickenDimension, tryEnterVoid, tryEnterCave, tryInteractNPC, openNPCModal, renderNPCModalContent, closeNPCModal };

window.__acceptGenericQuest = function(){
  if(!currentInteractingNPC || !currentInteractingNPC.quest) return;
  const q = currentInteractingNPC.quest;
  q.accepted = true;
  player.activeQuest = {
    npcId: currentInteractingNPC.id,
    type: q.type || 'kill_enemies',
    goal: q.goal || 20,
    progress: 0,
    label: q.label || 'Slay Monsters',
    rewardGold: q.rewardGold || 120,
    rewardXp: q.rewardXp || 80,
    notified: false
  };
  playSfx('quest');
  renderNPCModalContent();
};

window.__claimGenericQuestReward = function(){
  if(!currentInteractingNPC || !player.activeQuest || player.activeQuest.npcId !== currentInteractingNPC.id) return;
  if(player.activeQuest.progress < player.activeQuest.goal) return;
  const q = currentInteractingNPC.quest;
  if(q) q.completed = true;
  if(!player.completedNPCs) player.completedNPCs = [];
  player.completedNPCs.push(currentInteractingNPC.id);
  
  campSave.gold = (campSave.gold || 0) + (player.activeQuest.rewardGold || 120);
  saveCamp();
  player.xp += (player.activeQuest.rewardXp || 80);
  checkLevelUp();
  
  const relic = grantRandomRelic('rare');
  playSfx('confirm');
  showDropToast(`Bounty Complete! +${player.activeQuest.rewardGold}g, +${player.activeQuest.rewardXp} XP, and found ${relic.name}!`, '#ffd700');
  
  player.activeQuest = null;
  renderNPCModalContent();
};
