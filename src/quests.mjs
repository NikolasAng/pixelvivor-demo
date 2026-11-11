// v95
const RELIC_POOLS = [
  {
    key: 'common', label: 'Common', color: '#c7d2da', xp: 5, duration: 30,
    names: ['Weathered Coin', 'Traveler’s Button', 'Cracked Charm', 'Ember Sigil'],
    sprites: ['Weathered_Coin', 'Travelers_Button', 'Cracked_Charm', 'Ember_Sigil'],
    effects: [
      { label: '+5% damage', damage: 1.05 },
      { label: '+4% movement', speed: 1.04 },
      { label: '+12 pickup range', pickupRange: 12 },
      { label: 'Temporary weapon: Ember Volley', power: 'flameVolley', companionPower: 'ember' }
    ]
  },
  {
    key: 'uncommon', label: 'Uncommon', color: '#65d39a', xp: 10, duration: 40,
    names: ['Verdant Compass', 'Mossbound Locket', 'Whispering Seed', 'Mirror Shard'],
    sprites: ['Verdant_Compass', 'Mossbound_Locket', 'Whispering_Seed', 'Mirror_Shard'],
    effects: [
      { label: '+8% XP', xp: 1.08 },
      { label: '+0.15 HP/sec', regen: .15 },
      { label: '-6% cooldown', cooldown: .94 },
      { label: 'Your shots ricochet once', power: 'ricochet', companionPower: 'mirror' }
    ]
  },
  {
    key: 'rare', label: 'Rare', color: '#61b8ff', xp: 20, duration: 50,
    names: ['Moonlit Astrolabe', 'Frostglass Eye', 'Sunken Signet', 'Stormheart Relic'],
    sprites: ['Moonlit_Astrolabe', 'Frostglass_Eye', 'Sunken_Signet', 'Stormheart_Relic'],
    effects: [
      { label: '+12% damage', damage: 1.12 },
      { label: '+12% XP', xp: 1.12 },
      { label: '+8% movement', speed: 1.08 },
      { label: 'Temporary weapon: Storm Chain', power: 'stormChain', companionPower: 'storm' }
    ]
  },
  {
    key: 'epic', label: 'Epic', color: '#c38cff', xp: 40, duration: 60,
    names: ['Ashen Crown', 'Warden’s Sigil'],
    sprites: ['Ashen_Crown', 'Wardens_Sigil'],
    effects: [
      { label: '+0.3 HP/sec', regen: .3 },
      { label: '+16% damage', damage: 1.16 }
    ]
  },
  {
    key: 'legendary', label: 'Legendary', color: '#ffd45c', xp: 75, duration: 75,
    names: ['Worldroot Seed', 'First Flame', 'Crown of the Wilds', 'Phoenix Heart'],
    sprites: ['Worldroot_Seed', 'First_Flame', 'Crown_of_the_Wilds', 'Phoenix_Heart'],
    effects: [
      { label: '+20% XP', xp: 1.2 },
      { label: '+22% damage', damage: 1.22 },
      { label: '+14% movement', speed: 1.14 },
      { label: 'One temporary phoenix rescue', power: 'phoenixGuard', companionPower: 'phoenix' }
    ]
  }
];


export const CAMP_EXTRACT_TIERS = new Set(['epic', 'legendary', 'mythic']);

export function relicRequiresCampReturn(tier){
  return CAMP_EXTRACT_TIERS.has(String(tier || '').toLowerCase());
}

export const NPC_RELICS = [
  { tier: 'mythic', tierLabel: 'Secret World Key', color: '#00e5ff', xp: 100, duration: 999999, name: "The Abyssal Key", sprite: 'Abyssal_Key', requiresCampReturn: false, effect: { label: 'Key of the Depths: Unlocks passage to The Sunken Depths (The Abyss) & +15% Damage.', damage: 1.15 } },
  { tier: 'mythic', tierLabel: 'Mythic', color: '#ff4d4d', xp: 100, duration: 90, name: 'Aegis of the Ancients', sprite: 'aegis_of_the_ancients', requiresCampReturn: true, effect: { label: '+35% damage, +35% XP, +10% speed', damage: 1.35, xp: 1.35, speed: 1.10 } },
  { tier: 'mythic', tierLabel: 'Mythic', color: '#ff4d4d', xp: 100, duration: 90, name: 'Blade of the Void', sprite: 'Blade_of_the_Void', requiresCampReturn: true, effect: { label: '+50% damage, -15% cooldown', damage: 1.50, cooldown: 0.85 } },
  { tier: 'mythic', tierLabel: 'Mythic', color: '#ff4d4d', xp: 100, duration: 90, name: 'Tome of Eternity', sprite: 'Tome_of_Eternity', requiresCampReturn: true, effect: { label: '+40% XP, +2 HP/sec', xp: 1.40, regen: 2.0 } },
  { tier: 'mythic', tierLabel: 'Mythic', color: '#ff4d4d', xp: 100, duration: 90, name: "Wanderer's Cloak", sprite: 'Wanderers_Cloak', requiresCampReturn: true, effect: { label: '+25% speed, Your shots ricochet once', speed: 1.25, power: 'ricochet' } },
  { tier: 'rare', tierLabel: 'Rare Relic', color: '#00e5ff', xp: 50, duration: 999999, name: "Tidecaller's Conch", sprite: 'Tidecallers_Conch', requiresCampReturn: false, effect: { label: 'Active Relic: Click in inventory to summon a 60s Deluge (Flood)!', power: 'tidecaller' } }
];

const PHYSICAL_RELICS = [
  { tier: 'common', tierLabel: 'Common', color: '#c7d2da', xp: 5, duration: 25, name: 'Ember Sigil', sprite: 'Ember_Sigil', requiresCampReturn: false, effect: { label: 'Temporary weapon: Ember Volley', power: 'flameVolley', companionPower: 'ember' } },
  { tier: 'uncommon', tierLabel: 'Uncommon', color: '#65d39a', xp: 10, duration: 35, name: 'Mirror Shard', sprite: 'Mirror_Shard', requiresCampReturn: false, effect: { label: 'Your shots ricochet once', power: 'ricochet', companionPower: 'mirror' } },
  { tier: 'rare', tierLabel: 'Rare', color: '#61b8ff', xp: 20, duration: 50, name: 'Stormheart Relic', sprite: 'Stormheart_Relic', requiresCampReturn: false, effect: { label: 'Temporary weapon: Storm Chain', power: 'stormChain', companionPower: 'storm' } },
  { tier: 'legendary', tierLabel: 'Legendary', color: '#ffd45c', xp: 75, duration: 75, name: 'Phoenix Heart', sprite: 'Phoenix_Heart', requiresCampReturn: true, effect: { label: 'One temporary phoenix rescue', power: 'phoenixGuard', companionPower: 'phoenix' } }
];

export function relicForRoll(rarityRoll, nameRoll) {
  const tierIndex = rarityRoll > .96 ? 4
    : rarityRoll > .88 ? 3
    : rarityRoll > .72 ? 2
    : rarityRoll > .45 ? 1
    : 0;
  const pool = RELIC_POOLS[tierIndex];
  const itemIndex = Math.floor((nameRoll || 0) * pool.names.length) % pool.names.length;
  const name = pool.names[itemIndex];
  const sprite = pool.sprites[itemIndex];
  const effect = pool.effects[itemIndex];
  return {
    tier: pool.key,
    tierLabel: pool.label,
    color: pool.color,
    xp: pool.xp,
    duration: pool.duration || 30,
    name,
    sprite,
    requiresCampReturn: relicRequiresCampReturn(pool.key),
    effect: { ...effect }
  };
}

export function relicSpriteFor(name) {
  if (!name) return 'rpg_gem_diamond';
  const npcRelic = NPC_RELICS.find(relic => relic.name === name);
  if (npcRelic?.sprite) return npcRelic.sprite;
  const physicalRelic = PHYSICAL_RELICS.find(relic => relic.name === name);
  if (physicalRelic?.sprite) return physicalRelic.sprite;
  for (const tier of RELIC_POOLS) {
    const index = tier.names.indexOf(name);
    if (index !== -1 && tier.sprites?.[index]) return tier.sprites[index];
  }
  return (typeof window !== 'undefined' && window.extItemSprite) ? window.extItemSprite(name) : 'rpg_gem_diamond';
}

export function relicEffectFor(name) {
  const npcRelic = NPC_RELICS.find(relic => relic.name === name);
  if (npcRelic) return npcRelic.effect;
  const physicalRelic = PHYSICAL_RELICS.find(relic => relic.name === name);
  if (physicalRelic) return physicalRelic.effect;
  for (const tier of RELIC_POOLS) {
    const index = tier.names.indexOf(name);
    if (index !== -1) return tier.effects[index];
  }
  return { label: 'No passive effect' };
}

export function loadRelicJournal() {
  try {
    const saved = JSON.parse(localStorage.getItem('pixelvivor.relics') || '[]');
    return Array.isArray(saved) ? saved.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string') : [];
  } catch {
    return [];
  }
}

export function saveRelicJournal(journal) {
  try {
    localStorage.setItem('pixelvivor.relics', JSON.stringify(journal));
  } catch {
    // Keep the discoveries available for this run if storage is unavailable.
  }
}

export function loadEquippedRelics() {
  try {
    const saved = JSON.parse(localStorage.getItem('pixelvivor.equippedRelics') || '[]');
    const list = Array.isArray(saved) ? saved.slice(0, 4).map(id => typeof id === 'string' ? id : null) : [];
    while (list.length < 4) { list.push(null); }
    return list;
  } catch {
    return [null, null, null, null];
  }
}

export function saveEquippedRelics(ids) {
  try {
    localStorage.setItem('pixelvivor.equippedRelics', JSON.stringify(ids));
  } catch {
    // Keep the equipped state for this run if storage is unavailable.
  }
}
