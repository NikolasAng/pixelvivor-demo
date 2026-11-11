import { relicEffectFor, relicSpriteFor, saveRelicJournal, saveEquippedRelics, relicRequiresCampReturn } from './quests.mjs?v336';
import { SPECIAL_ITEMS_LIST } from './assets.mjs?v336';
import { ALL_LEGENDARY_PIECES, LEGENDARY_SETS, ALL_TRINKETS, getCampQuest, COMPANION_RELIC_SKILLS } from './config.mjs?v336';
import { playSfx } from './audio.mjs?v336';
import { campSave, saveCamp, unlockedSymbols, unlockedJournals, LORE_SETS } from './save.mjs?v336';
import { state, unlockedAch, player, trinketPickups, legendaryPickups, damageNumbers, relicJournal, relicJournalIds, equippedRelicIds, chainVisuals, projectiles, particles, camera, viewZoom } from './state.mjs?v336';
import { findNearestRevealedEnemy } from './spatial.mjs?v336';
import { renderAtlasIcons, showRelicToast, showDropToast, iconCanvas } from './ui-icons.mjs?v336';
import { TILE } from './underground.mjs?v336';
import { chunks } from './world-chunks.mjs?v336';
import { getQuestProgress, damageEnemy, checkLevelUp, updateWeaponHUD } from './game-core.mjs?v336';

const ACHIEVEMENTS=[
  {id:'firstBlood',sprite:'rpg_sword_iron',name:'First Blood',desc:'Defeat 1 enemy',check:()=>kills>=1},
  {id:'slayer',sprite:'rpg_demon_skull',name:'Slayer',desc:'Defeat 50 enemies',check:()=>kills>=50},
  {id:'massacre',sprite:'rpg_reaper',name:'Massacre',desc:'Defeat 200 enemies',check:()=>kills>=200},
  {id:'pyro',sprite:window.extItemSprite('p_relicFire'),name:'Pyromaniac',desc:'Defeat 50 enemies with fire',check:()=>killsByFire>=50},
  {id:'fisherman',sprite:'rpg_fish_small',name:'Angler',desc:'Defeat 20 water creatures',check:()=>killsByWater>=20},
  {id:'nightOwl',sprite:'rpg_crystal_purple',name:'Night Owl',desc:'Defeat 30 enemies at night',check:()=>killsAtNight>=30},
  {id:'stormChaser',sprite:'rpg_lightningSprite',name:'Storm Chaser',desc:'Survive a storm',check:()=>survivedStorm},
  {id:'flooded',sprite:'rpg_waterSprite',name:'Flood Survivor',desc:'Survive a flood',check:()=>survivedFlood},
  {id:'firstBoss',sprite:'rpg_crown',name:'Boss Slayer',desc:'Defeat a boss',check:()=>bossKills>=1},
  {id:'vampireSlayer',sprite:'vampire',name:'Vampire Hunter',desc:'Defeat 10 vampires',check:()=>vampireKills>=10},
  {id:'maxLevel',sprite:'rpg_gem_diamond',name:'Max Level',desc:'Reach level 20',check:()=>player.level>=20},
  {id:'survivor',sprite:'rpg_shield_gold',name:'Survivor',desc:'Survive for 5 minutes',check:()=>elapsed>=300},

  // Special Items & Trophies Achievements (Added)
  {id:'frozenHeart',sprite:'gold_pouch',name:'Frozen Heart',desc:'Complete the ritual of the Frozen Heart',check:()=>(typeof unlockedSymbols!=='undefined'&&unlockedSymbols.has('s_frozen_heart'))||Boolean(campSave&&campSave.unlockedSymbols&&campSave.unlockedSymbols.includes('s_frozen_heart'))},
  {id:'sunkenTemple',sprite:'pocket_watch',name:'Sunken Temple',desc:'Discover the Sunken Temple secret',check:()=>(typeof unlockedJournals!=='undefined'&&unlockedJournals.has('j_sunken_temple'))||Boolean(campSave&&campSave.unlockedJournals&&campSave.unlockedJournals.includes('j_sunken_temple'))},
  {id:'cryomancer',sprite:'crystal_shard',name:'Cryomancer',desc:'Freeze 50 enemies',check:()=>enemiesFrozenRun>=50||(player.freezeKills||0)>=50},
  {id:'healer',sprite:'potion_belt',name:'Healer',desc:'Heal 500 HP total',check:()=>totalHealedHPRun>=500},
  {id:'scholar',sprite:'book_locked',name:'Scholar',desc:'Read 10 Lore entries',check:()=>{let count=0;if(typeof LORE_SETS!=='undefined'){for(const k in LORE_SETS)count+=LORE_SETS[k].size;}return count>=10;}},
  {id:'bloodMoonRitual',sprite:'chalice_gold',name:'Blood Moon Ritual',desc:'Survive a Blood Moon',check:()=>survivedBloodMoon||(isBloodMoon&&elapsed>=180)},
  {id:'relicHunter',sprite:'compass',name:'Relic Hunter',desc:'Defeat a boss and recover relics',check:()=>bossKills>=1&&(typeof relicJournal!=='undefined'&&relicJournal.length>0)},
  {id:'sharpshooter',sprite:'arrow_bundle',name:'Sharpshooter',desc:'Kill 100 enemies with ranged attacks',check:()=>rangedKillsRun>=100},
  {id:'forager',sprite:'lavender',name:'Wilderness Forager',desc:'Discover 5 biomes',check:()=>(typeof discoveredBiomes!=='undefined'&&discoveredBiomes.size>=5)||(campSave&&campSave.unlockedCamps&&campSave.unlockedCamps.length>=5)},
  {id:'survivorXp',sprite:'potion_purple',name:'Seasoned Survivor',desc:'Survive 5 minutes in an expedition',check:()=>elapsed>=300},
  {id:'berserker',sprite:'gloves_leather',name:'Berserker',desc:'Kill 50 enemies with melee attacks',check:()=>meleeKillsRun>=50},
  {id:'voidPortal',sprite:'scroll',name:'Void Portal',desc:'Unlock the Void Portal secret',check:()=>Boolean(campSave&&campSave.hasDimensionalKey)||Boolean(campSave&&campSave.voidPortalEntered)},
  {id:'explorer',sprite:'book_star',name:'Explorer',desc:'Discover 5 biomes',check:()=>(typeof discoveredBiomes!=='undefined'&&discoveredBiomes.size>=5)||(campSave&&campSave.unlockedCamps&&campSave.unlockedCamps.length>=5)},
  {id:'tank',sprite:'anchor_chain',name:'Tank',desc:'Survive for 10 minutes',check:()=>elapsed>=600},
  {id:'collector',sprite:'heart_locket',name:'Collector',desc:'Open 20 chests or recover 3 relics',check:()=>chestsOpenedRun>=20||(questProgress&&questProgress.relicsRun>=3)},
  {id:'chickenKingSlayer',sprite:'chickenCrown',name:'Poultry Regicide',desc:'Defeat the Chicken King in the Chicken Dimension',check:()=>Boolean(campSave&&(campSave.unlockedChickenCrown||(campSave.bestiary&&campSave.bestiary.chickenKing>0)))}
];

function grantAchievementReward(achId){
  if(!window.campSave) return;
  if(!campSave.collectedTrophies) campSave.collectedTrophies = [];
  if(!campSave.unlockedTrophies) campSave.unlockedTrophies = [];
  if(!campSave.newTrophyIds) campSave.newTrophyIds = [];
  if(!campSave.ownedGear) campSave.ownedGear = [];
  if(!campSave.ownedTrinkets) campSave.ownedTrinkets = [];

  const matched = SPECIAL_ITEMS_LIST.filter(item => item.achId === achId);
  let changed = false;

  matched.forEach(trophy => {
    if(!campSave.unlockedTrophies.includes(trophy.id)){
      campSave.unlockedTrophies.push(trophy.id);
      if(!campSave.newTrophyIds.includes(trophy.id)){
        campSave.newTrophyIds.push(trophy.id);
      }
      if(trophy.type === 'Trinket'){
        if(!campSave.ownedTrinkets.includes(trophy.id)) campSave.ownedTrinkets.push(trophy.id);
      }else if(trophy.type === 'Quest Item'){
        if(!campSave.collectedTrophies.includes(trophy.id)) campSave.collectedTrophies.push(trophy.id);
      }
      changed = true;
    }
  });

  if(changed){
    saveCamp();
  }
}

function isTrophyUnlocked(item){
  if(!item) return false;
  if(campSave?.unlockedTrophies?.includes(item.id)) return true;
  if(unlockedAch.has(item.achId)) return true;
  return false;
}

function syncTrophiesFromAchievements(){
  if(!window.campSave) return;
  for(const a of ACHIEVEMENTS){
    if(unlockedAch.has(a.id) || (campSave.unlockedTitles && campSave.unlockedTitles.includes(a.name))){
      grantAchievementReward(a.id);
    }
  }
}

function checkAchievements(){
  for(const a of ACHIEVEMENTS){
    if(unlockedAch.has(a.id))continue;
    if(a.check()){
      unlockedAch.add(a.id);
      grantAchievementReward(a.id);
      showAchievementPopup(a);
      updateAchCount();
    }
  }
}
function showAchievementPopup(a){
  const div=document.createElement('div');
  div.className='achPop';
  const rewardItem = SPECIAL_ITEMS_LIST.find(item => item.achId === a.id);
  const rewardHtml = rewardItem ? `<div style="font-size:11px; color:#ffd700; margin-top:3px; font-weight:bold;">🏆 Trophy Unlocked: ${rewardItem.name}!</div>` : '';
  div.innerHTML=`<span class="ic" data-sprite="${a.sprite}" data-icon-size="28"></span><div><div class="ti">Achievement Unlocked</div><div class="nm">${a.name}</div>${rewardHtml}</div>`;
  renderAtlasIcons(div);
  document.getElementById('achievements').appendChild(div);
  setTimeout(()=>div.remove(),4800);
}
function updateAchCount(){
  document.getElementById('achCount').textContent=unlockedAch.size;
}
function toggleAchList(){
  const el=document.getElementById('achList');
  if(el.style.display==='block'){el.style.display='none';return;}
  el.innerHTML=ACHIEVEMENTS.map(a=>`
    <div class="achItem ${unlockedAch.has(a.id)?'':'locked'}">
      <span class="ic" data-sprite="${a.sprite}" data-icon-size="28"></span>
      <div><div class="nm">${a.name}</div><div class="ds">${a.desc}</div></div>
    </div>
  `).join('');
  renderAtlasIcons(el);
  el.style.display='block';
}
document.getElementById('achTotal').textContent=ACHIEVEMENTS.length;

function getEquippedSetPieces(){
  const equipped = (campSave && campSave.equippedSetPieces) ? campSave.equippedSetPieces : {};
  return Object.values(equipped).filter(Boolean).map(id => ALL_LEGENDARY_PIECES.find(p => p.id === id)).filter(Boolean);
}

function getActiveSetBonuses(){
  const equipped = getEquippedSetPieces();
  const setCounts = {};
  for(const p of equipped){
    setCounts[p.setId] = (setCounts[p.setId] || 0) + 1;
  }
  return LEGENDARY_SETS.map(set => {
    const count = setCounts[set.id] || 0;
    return {
      set,
      count,
      has2pc: count >= 2,
      has3pc: count >= 3
    };
  });
}

function applyEquippedSetBonuses(){
  if(!player) return;
  player.bloodthirster2pc = false;
  player.bloodthirster3pc = false;
  player.stormcaller2pc = false;
  player.stormcaller3pc = false;
  player.titanGuard2pc = false;
  player.titanGuard3pc = false;
  player.voidwalker2pc = false;
  player.voidwalker3pc = false;
  player.solarArchon2pc = false;
  player.solarArchon3pc = false;

  const equipped = getEquippedSetPieces();
  const setCounts = {};
  for(const p of equipped){
    setCounts[p.setId] = (setCounts[p.setId] || 0) + 1;
    if(p.stats.damageMult) player.damageMultiplier *= p.stats.damageMult;
    if(p.stats.maxHp){ player.maxHp += p.stats.maxHp; player.hp = Math.min(player.maxHp, player.hp + p.stats.maxHp); }
    if(p.stats.defense) player.defense = Math.min(0.85, (player.defense || 0) + p.stats.defense);
    if(p.stats.attackSpeedMult) player.attackSpeedMult = (player.attackSpeedMult || 1) * p.stats.attackSpeedMult;
    if(p.stats.cooldownMult) player.cooldownMultiplier *= p.stats.cooldownMult;
    if(p.stats.speedMult) player.speed *= p.stats.speedMult;
    if(p.stats.regen) player.regen += p.stats.regen;
    if(p.stats.dodgeChance) player.dodgeChance = Math.min(0.75, (player.dodgeChance || 0) + p.stats.dodgeChance);
    if(p.stats.thorns) player.thorns = (player.thorns || 0) + p.stats.thorns;
    if(p.stats.xpMult) player.xpMultiplier *= p.stats.xpMult;
    if(p.stats.extraPierce) player.extraPierce = (player.extraPierce || 0) + p.stats.extraPierce;
    if(p.stats.maxShield) player.shield = Math.max(player.shield || 0, p.stats.maxShield);
    if(p.stats.lifestealChance) player.lifestealChance = (player.lifestealChance || 0) + p.stats.lifestealChance;
  }

  if((setCounts['bloodthirster'] || 0) >= 2){
    player.bloodthirster2pc = true;
    player.attackSpeedMult = (player.attackSpeedMult || 1) * 1.15;
    player.lifestealRate = (player.lifestealRate || 0) + 0.10;
  }
  if((setCounts['bloodthirster'] || 0) >= 3){
    player.bloodthirster3pc = true;
    player.critMult = (player.critMult || 2) + 0.50;
  }

  if((setCounts['stormcaller'] || 0) >= 2){
    player.stormcaller2pc = true;
    player.cooldownMultiplier *= 0.85;
    player.projSpeedMult = (player.projSpeedMult || 1) * 1.20;
  }
  if((setCounts['stormcaller'] || 0) >= 3){
    player.stormcaller3pc = true;
  }

  if((setCounts['titanguard'] || 0) >= 2){
    player.titanGuard2pc = true;
    player.maxHp += 40;
    player.thorns = (player.thorns || 0) + 0.25;
  }
  if((setCounts['titanguard'] || 0) >= 3){
    player.titanGuard3pc = true;
    player.defense = Math.min(0.85, (player.defense || 0) + 0.20);
  }

  if((setCounts['voidwalker'] || 0) >= 2){
    player.voidwalker2pc = true;
    player.dodgeChance = Math.min(0.75, (player.dodgeChance || 0) + 0.20);
    player.speed *= 1.15;
  }
  if((setCounts['voidwalker'] || 0) >= 3){
    player.voidwalker3pc = true;
    player.ricochetChance = 1.0;
  }

  if((setCounts['solararchon'] || 0) >= 2){
    player.solarArchon2pc = true;
    player.regen += 2.5;
    player.fireDamageMult = (player.fireDamageMult || 1) * 1.25;
  }
  if((setCounts['solararchon'] || 0) >= 3){
    player.solarArchon3pc = true;
  }
}

function spawnTrinketDrop(x, y, specificId = null){
  const owned = (campSave && campSave.ownedTrinkets) ? campSave.ownedTrinkets : [];
  const unowned = ALL_TRINKETS.filter(t => !owned.includes(t.id));
  const pool = unowned.length ? unowned : ALL_TRINKETS;
  const t = specificId ? ALL_TRINKETS.find(t=>t.id===specificId) : pool[Math.floor(Math.random()*pool.length)];
  if(!t) return;
  trinketPickups.push({ x, y, id: t.id, sprite: t.sprite, name: t.name, bob: Math.random()*Math.PI*2 });
}
function collectTrinket(t){
  chestsOpenedRun++;
  if(!campSave.ownedTrinkets) campSave.ownedTrinkets = [];
  if(!campSave.ownedTrinkets.includes(t.id)){
    campSave.ownedTrinkets.push(t.id);
  } else {
    campSave.gold += 25; // Duplicate gives gold
  }
  playSfx('relic');
  const toast = document.createElement('div');
  toast.className = 'relic-toast';
  toast.style.borderColor = '#c0c0c0';
  toast.innerHTML = `<strong>Found Trinket: ${t.name}</strong><br/>Equip in Camp for fine-tuning!`;
  document.getElementById('relicToasts').appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
function spawnLegendaryPieceDrop(x, y, specificPieceId = null){
  const owned = (campSave && campSave.ownedSetPieces) ? campSave.ownedSetPieces : [];
  const unowned = ALL_LEGENDARY_PIECES.filter(p => !owned.includes(p.id));
  const pool = unowned.length ? unowned : ALL_LEGENDARY_PIECES;
  const piece = specificPieceId ? ALL_LEGENDARY_PIECES.find(p=>p.id===specificPieceId) : pool[Math.floor(Math.random()*pool.length)];
  if(!piece) return;
  legendaryPickups.push({
    x, y,
    piece,
    bob: Math.random() * Math.PI * 2,
    life: 120
  });
  spawnParticles(x, y, '#ffd700', 30);
  playSfx('confirm');
}

function collectLegendarySetPiece(piece){
  if(!piece) return;
  if(!campSave.ownedSetPieces) campSave.ownedSetPieces = [];
  if(!campSave.ownedSetPieces.includes(piece.id)){
    campSave.ownedSetPieces.push(piece.id);
  }
  if(!campSave.equippedSetPieces) campSave.equippedSetPieces = { helm: null, armor: null, weapon: null };
  if(!campSave.equippedSetPieces[piece.slot]){
    campSave.equippedSetPieces[piece.slot] = piece.id;
  }
  applyEquippedSetBonuses();
  saveCamp();

  const setDef = LEGENDARY_SETS.find(s => s.id === piece.setId);
  const count = setDef ? setDef.pieces.filter(p => campSave.ownedSetPieces.includes(p.id)).length : 1;

  playSfx('relic');
  const toast = document.createElement('div');
  toast.className = 'relic-toast';
  toast.style.borderColor = '#ffd700';
  toast.style.boxShadow = '0 0 35px rgba(255, 215, 0, 0.85)';
  toast.innerHTML = `<strong style="color:#ffd700">⭐ LEGENDARY SET ITEM!</strong><br/>
    <span style="color:#fff;font-size:14px;font-weight:700;">${piece.name}</span><br/>
    <small style="color:${setDef?setDef.color:'#ffd54f'};font-weight:600;">${setDef?setDef.name:'Set'} (${count}/3 Collected)</small>`;
  document.getElementById('relicToasts').appendChild(toast);
  setTimeout(() => toast.remove(), 6000);

  spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ffd700', 30);
  spawnDamageNumber(player.x + player.w/2, player.y - 20, piece.name, '#ffd700');
}

const EQUIPMENT_UPGRADES=[
  {id:'boots',sprite:'boots',name:'Water Boots',desc:'-50% water slow penalty · Max Lv 5 · Evolution catalyst',maxLevel:5,apply:()=>{player.waterSlowMultiplier=Math.max(.15,player.waterSlowMultiplier*.5);}},
  {id:'ring',sprite:'ring',name:'Ring of Power',desc:'+15% damage dealt · Max Lv 5 · Evolution catalyst',maxLevel:5,apply:()=>{player.damageMultiplier*=1.15;}},
  {id:'helmet',sprite:'helmet',name:'Iron Helmet',desc:'+20% damage reduction · Max Lv 5 · Evolution catalyst',maxLevel:5,apply:()=>{player.defense=Math.min(.7,player.defense+0.2);}},
  {id:'amulet',sprite:'amulet',name:'Amulet of Vigor',desc:'+20% XP gain · Max Lv 5 · Evolution catalyst',maxLevel:5,apply:()=>{player.xpMultiplier*=1.2;}}
];

function spawnDamageNumber(x,y,dmg,color='#fff'){
  if(!window.GAME_SETTINGS?.showDamageNumbers)return;
  if(dmg === 0 || dmg === '0' || Math.round(dmg) === 0)return;
  const mode = window.GAME_SETTINGS?.damageNumbersMode || 'compressed';
  if(mode === 'off') return;
  const cap = mode === 'compressed' ? 36 : 65;
  if(mode === 'compressed' && damageNumbers.length > 16){
    for(let i=damageNumbers.length-1; i>=Math.max(0, damageNumbers.length-10); i--){
      const d = damageNumbers[i];
      if(d && d.life > 0.4 && Math.abs(d.x - x) < 22 && Math.abs(d.y - y) < 22){
        if(typeof d.dmg === 'number' && typeof dmg === 'number'){
          d.dmg += dmg;
          d.life = 0.7;
          return;
        }
      }
    }
  }
  if(damageNumbers.length >= cap){
    const slot = damageNumbers[damageNumberRingIdx % damageNumbers.length];
    damageNumberRingIdx++;
    slot.x = x; slot.y = y; slot.dmg = dmg; slot.color = color; slot.life = .7; slot.maxLife = .7;
    return;
  }
  damageNumbers.push({x,y,dmg,color,life:.7,maxLife:.7});
}
function getNearestRelic(){
  if(carriedRelic)return null;
  const now = performance.now();
  if (now - lastNearestRelicAt < 140 && cachedNearestRelic) {
    const site = cachedNearestRelic.site;
    if (!relicJournalIds.has(site.id)) {
      const px = player.x + player.w/2, py = player.y + player.h/2;
      const dx = site.x - px, dy = site.y - py;
      cachedNearestRelic.dx = dx;
      cachedNearestRelic.dy = dy;
      cachedNearestRelic.distance = Math.hypot(dx, dy);
      return cachedNearestRelic;
    }
  }
  lastNearestRelicAt = now;
  const px=player.x+player.w/2,py=player.y+player.h/2;
  let nearest=null,bestDistance=Infinity;
  for(const chunk of chunks.values())for(const site of chunk.relicSites||[]){
    if(relicJournalIds.has(site.id)||site.id===carriedRelic?.id)continue;
    const distance=(site.x-px)**2+(site.y-py)**2;
    if(distance<bestDistance){nearest=site;bestDistance=distance;}
  }
  cachedNearestRelic = nearest?{site:nearest,distance:Math.sqrt(bestDistance),dx:nearest.x-px,dy:nearest.y-py}:null;
  return cachedNearestRelic;
}
function formatRelicCountdown(seconds){
  const total=Math.max(0,Math.ceil(seconds));
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}
function updateCampReturnLock(){
  const button=document.getElementById('returnToCampPause');
  const label=document.getElementById('campReturnLabel');
  const hudBtn=document.getElementById('hudReturnToCampBtn');
  const hudLabel=document.getElementById('hudCampReturnLabel');

  if(state.isInDream){
    if(button){
      button.disabled=true;
      button.classList.add('locked');
      button.title='You are trapped in a dream.';
    }
    if(label) label.textContent='Trapped in Dream';
    if(hudBtn){
      hudBtn.disabled=true;
      hudBtn.classList.remove('locked');
      hudBtn.classList.add('dream-wake');
      hudBtn.title='Survive until you awaken from the dream...';
    }
    if(hudLabel){
      hudLabel.textContent='Awakening (' + Math.floor(state.awakeningProgress || 0) + '%)';
    }
    return;
  }

  if(hudBtn) hudBtn.classList.remove('dream-wake');
  const locked=!!carriedRelic&&carriedRelic.timeRemaining>0;
  const text=locked?`Camp locked · ${formatRelicCountdown(carriedRelic.timeRemaining)}`:'Return to camp';
  const title=locked?`Protect ${carriedRelic.name} until the countdown ends.`:'Return safely to camp and bank your carried relic.';
  if(button){
    button.disabled=locked; button.classList.toggle('locked', locked);
    button.title=title;
  }
  if(label)label.textContent=text;
  if(hudBtn){
    hudBtn.disabled=locked; hudBtn.classList.toggle('locked', locked);
    hudBtn.title=title;
  }
  if(hudLabel)hudLabel.textContent=locked?`Locked (${formatRelicCountdown(carriedRelic.timeRemaining)})`:'Return to Camp';
}
function updateRelicTracker(){
  updateCampReturnLock();
  const tracker=document.getElementById('questTracker');
  if(!tracker)return;
  if(state.isInDream){
    tracker.style.display = 'none';
    return;
  }
  document.getElementById('inventoryCount').textContent=relicJournal.length;
  tracker.style.display=gameStarted&&!gameOver?'flex':'none';
  if(!gameStarted||gameOver)return;
  
  const contract=getCampQuest(campSave.questId);
  const title=tracker.querySelector('strong');
  
  if(contract){
    const progress=Math.floor(getQuestProgress(contract));
    const pct=Math.min(100,progress/contract.target*100);
    title.textContent=contract.category==='daily'?`[DAILY] ${contract.name.toUpperCase()}`:contract.name.toUpperCase();
    let detailText = `${progress}/${contract.target}`;
    if(contract.type==='untouchableLevel'){
      detailText = questProgress.tookDamage && questProgress.untouchableLevel < 20 ? 'FAILED (hit taken)' : `Lvl ${player.level}/${contract.target}`;
    }else if(contract.type==='speedrunLevel'){
      const mins=Math.floor(elapsed/60), secs=Math.floor(elapsed%60);
      const timeStr=`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
      detailText = elapsed > 600 && !questProgress.speedrunCompleted ? 'EXPIRED (>10m)' : `Lvl ${player.level}/${contract.target} (${timeStr}/10:00)`;
    }else if(contract.type==='pacifistTime'){
      detailText = kills > 0 && !questProgress.pacifistCompleted ? 'FAILED (enemy slain)' : `${Math.floor(progress)}s/${contract.target}s (0 kills)`;
    }else if(contract.type==='survivorTime'){
      const mins=Math.floor(elapsed/60), secs=Math.floor(elapsed%60);
      detailText = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')} / 30:00`;
    }else if(contract.type==='explorerBiomes'){
      detailText = `${progress}/${contract.target} biomes`;
    }else if(contract.type==='berserkerKills'){
      detailText = `${progress}/${contract.target} kills`;
    }else if(contract.type==='collectorRelics'){
      detailText = `${progress}/${contract.target} relics`;
    }
    const bonusText = contract.legendaryReward ? ' + Relic' : '';
    const text=`${contract.objective} · ${detailText} · +${contract.reward}g${bonusText}`;
    if(text!==lastQuestText){document.getElementById('questObjective').textContent=text;lastQuestText=text;}
    // Progress bar visual
    tracker.style.setProperty('--quest-progress',`${pct}%`);
    return;
  }
  
  // Default relic hunting tracker
  title.textContent='RELIC HUNT';
  const nearest=getNearestRelic();
  if(carriedRelic){
    const wait=carriedRelic.timeRemaining>0?`camp unlocks in ${formatRelicCountdown(carriedRelic.timeRemaining)}`:'camp return unlocked';
    const special=carriedRelic.effect?.label||'special power active';
    const text=`Protect ${carriedRelic.name} · ${wait} · ${special}`;
    if(text!==lastQuestText){document.getElementById('questObjective').textContent=text;lastQuestText=text;}
    return;
  }
  let direction='';
  if(nearest&&nearest.distance>75){
    direction=Math.abs(nearest.dx)>Math.abs(nearest.dy)?(nearest.dx>0?'E':'W'):(nearest.dy>0?'S':'N');
  }
  const detail=nearest
    ? nearest.distance<=75?`Move close to pick up · ${nearest.site.tierLabel}`:`${direction} · ${Math.round(nearest.distance/TILE)} tiles away`
    : 'Explore to find an ancient cache';
  const text=`Find a lost relic · ${detail} · ${relicJournal.length} stored`;
  if(text!==lastQuestText){document.getElementById('questObjective').textContent=text;lastQuestText=text;}
}

function syncWorldSecretRelics(){
  if(campSave.hasTidecallerConch && !relicJournalIds.has('relic_tidecaller_conch')){
    const cRelic = {
      id: 'relic_tidecaller_conch',
      name: "Tidecaller's Conch",
      tier: 'rare',
      tierLabel: 'Secret World Relic',
      sprite: 'Tidecallers_Conch',
      color: '#00e5ff',
      xp: 50,
      duration: 999999,
      requiresCampReturn: false,
      effect: { label: 'Active: Click or press [C] to summon a 60s Deluge (1x/run)', power: 'tidecaller' }
    };
    relicJournalIds.add(cRelic.id);
    relicJournal.push(cRelic);
    saveRelicJournal(relicJournal);
    const emptySlotIdx = equippedRelicIds.findIndex(id => !id);
    if(emptySlotIdx !== -1 && !equippedRelicIds.includes(cRelic.id)){
      equippedRelicIds[emptySlotIdx] = cRelic.id;
      saveEquippedRelics(equippedRelicIds);
    }
  }
  if(campSave.hasAbyssalKey && !relicJournalIds.has('relic_abyssal_key')){
    const kRelic = {
      id: 'relic_abyssal_key',
      name: "The Abyssal Key",
      tier: 'mythic',
      tierLabel: 'Secret World Key',
      sprite: 'Abyssal_Key',
      color: '#00e5ff',
      xp: 100,
      duration: 999999,
      requiresCampReturn: false,
      effect: { label: 'Key of the Depths: Unlocks passage to The Sunken Depths (The Abyss) & +15% Damage.', damage: 1.15 }
    };
    relicJournalIds.add(kRelic.id);
    relicJournal.push(kRelic);
    saveRelicJournal(relicJournal);
    const emptySlotIdx = equippedRelicIds.findIndex(id => !id);
    if(emptySlotIdx !== -1 && !equippedRelicIds.includes(kRelic.id)){
      equippedRelicIds[emptySlotIdx] = kRelic.id;
      saveEquippedRelics(equippedRelicIds);
    }
  }
  if(!(typeof window !== 'undefined' && window.IS_DEMO) && campSave.hasHeartOfWinter && !relicJournalIds.has('relic_heart_of_winter')){
    const wRelic = {
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
    relicJournalIds.add(wRelic.id);
    relicJournal.push(wRelic);
    saveRelicJournal(relicJournal);
    const emptySlotIdx = equippedRelicIds.findIndex(id => !id);
    if(emptySlotIdx !== -1 && !equippedRelicIds.includes(wRelic.id)){
      equippedRelicIds[emptySlotIdx] = wRelic.id;
      saveEquippedRelics(equippedRelicIds);
    }
  }
}

function renderInventory(){
  syncWorldSecretRelics();
  const list=document.getElementById('inventoryEntries');
  if(!list)return;
  document.getElementById('inventoryCount').textContent=relicJournal.length;
  const carriedStatus=document.getElementById('carriedRelicStatus');
  if(carriedStatus){
    const companionPower=carriedRelic?.effect?.companionPower||relicEffectFor(carriedRelic?.name||'').companionPower;
    const skill=companionPower?COMPANION_RELIC_SKILLS[companionPower]:'';
    carriedStatus.textContent=carriedRelic?`Carrying High-Tier: ${carriedRelic.name} (${carriedRelic.tierLabel}) · ${carriedRelic.effect?.label||'Power active'} · Safe return secures it into inventory!`:'No high-tier relic carried. Common, uncommon & rare relics go directly into your 4-slot inventory!';
    carriedStatus.classList.toggle('active',!!carriedRelic);
  }
  list.replaceChildren();
  const slots=document.getElementById('equippedRelics');
  slots.replaceChildren();
  equippedRelicIds.forEach((id,index)=>{
    const relic=relicJournal.find(item=>item.id===id);
    const slot=document.createElement('div');
    slot.className='equipped-relic-slot';
    slot.setAttribute('data-slot', index + 1);
    const label=document.createElement('strong');
    label.className='slot-header';
    label.textContent=`SLOT ${index+1}`;
    if(relic){
      slot.classList.add('has-relic');
      const body=document.createElement('div');
      body.className='equipped-slot-content';
      if(relic.effect?.power === 'tidecaller'){
        slot.style.cursor = 'pointer';
        slot.title = 'Click to blow the Conch and summon the Deluge (Flood)!';
        slot.addEventListener('click', () => {
          if(window.useTidecallerConch) window.useTidecallerConch();
        });
      }
      const icon=document.createElement('span');
      icon.className='equipped-slot-icon';
      icon.dataset.sprite = relic.sprite || relicSpriteFor(relic.name);
      icon.style.color=relic.color;
      const meta=document.createElement('div');
      meta.className='equipped-slot-meta';
      const name=document.createElement('span');
      name.className='equipped-slot-name';
      name.textContent=relic.name;
      name.style.color=relic.color;
      const unequipBtn=document.createElement('button');
      unequipBtn.type='button';
      unequipBtn.className='slot-unequip-btn';
      unequipBtn.textContent='✕';
      unequipBtn.title=`Unequip ${relic.name}`;
      unequipBtn.addEventListener('click',(e)=>{
        e.stopPropagation();
        setRelicSlot(index,null);
      });
      icon.dataset.iconSize = '26';
      meta.appendChild(name);
      body.append(icon, meta);
      slot.append(label, body, unequipBtn);
      renderAtlasIcons(slot);
    } else {
      const empty=document.createElement('span');
      empty.className='equipped-slot-empty';
      empty.textContent='Empty';
      slot.append(label, empty);
    }
    slots.appendChild(slot);
  });
  if(!relicJournal.length){
    const empty=document.createElement('p');
    empty.className='relic-empty';empty.textContent='No relics collected yet.';list.appendChild(empty);return;
  }
  for(const relic of [...relicJournal].reverse()){
    const row=document.createElement('div');row.className='relic-entry';
    const icon=document.createElement('span');icon.className='relic-entry-icon';icon.dataset.sprite = relic.sprite || relicSpriteFor(relic.name); icon.style.color=relic.color;
    const copy=document.createElement('div');copy.className='relic-entry-copy';
    const name=document.createElement('strong');name.textContent=relic.name;
    const tier=document.createElement('span');tier.textContent=relic.tierLabel;tier.style.color=relic.color;
    const effect=relic.effect||relicEffectFor(relic.name);
    const effectText=document.createElement('span');
    const companionPower=relic.effect?.companionPower||relicEffectFor(relic.name).companionPower;
    effectText.textContent=companionPower?`Companions: ${COMPANION_RELIC_SKILLS[companionPower]||'relic skill unlocked'}`:effect.label;
    copy.append(name,tier,effectText);row.append(icon,copy);renderAtlasIcons(row);
    const actions=document.createElement('div');actions.className='relic-actions';
    if(relic.effect?.power === 'tidecaller'){
      const useBtn=document.createElement('button');
      useBtn.type='button';
      useBtn.className='relic-action-use-btn';
      useBtn.style.cssText = 'background:#00e5ff;color:#000;font-weight:bold;font-size:11px;padding:3px 8px;border-radius:4px;border:none;cursor:pointer;margin-right:6px;';
      useBtn.textContent = 'BLOW CONCH';
      useBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if(window.useTidecallerConch) window.useTidecallerConch();
      });
      actions.appendChild(useBtn);
    }
    equippedRelicIds.forEach((id,index)=>{
      const button=document.createElement('button');button.type='button';
      button.textContent=id===relic.id?`Unequip ${index+1}`:`Slot ${index+1}`;
      button.addEventListener('click',()=>setRelicSlot(index,id===relic.id?null:relic.id));
      actions.appendChild(button);
    });
    row.appendChild(actions);list.appendChild(row);
  }
}
window.useTidecallerConch = function(){
  if(!gameStarted || gameOver) return false;
  if(paused){
    if(typeof inventoryOpen !== 'undefined' && inventoryOpen && typeof toggleInventory === 'function'){
      toggleInventory();
    } else {
      return false;
    }
  }
  const hasConch = Boolean(
    campSave.hasTidecallerConch ||
    relicJournalIds.has('relic_tidecaller_conch') ||
    equippedRelicIds.includes('relic_tidecaller_conch') ||
    relicJournal.some(r => r && (r.id === 'relic_tidecaller_conch' || r.name === "Tidecaller's Conch"))
  );
  if(!hasConch) {
    showRelicToast({ name: "Tidecaller's Conch", tierLabel: 'Locked', color: '#ff5252', effect: { label: 'Rescue the Lost Traveler in the Swamp first!' } });
    return false;
  }
  if(window.__conchUsedThisRun) {
    showRelicToast({ name: "Tidecaller's Conch", tierLabel: 'Exhausted', color: '#ff9800', effect: { label: 'The sea horn can only summon one deluge per expedition!' } });
    return false;
  }
  if(typeof window.triggerFlood === 'function') {
    const success = window.triggerFlood(60);
    if(success) {
      window.__conchUsedThisRun = true;
      playSfx('relic');
      spawnParticles(player.x + player.w/2, player.y + player.h/2, '#00e5ff', 40);
      spawnSplash(player.x + player.w/2, player.y + player.h/2, true);
      showDropToast("🌊 The Tidecaller's Conch roars! A 60-second deluge floods the land!", '#00e5ff');
      showRelicToast({ name: "Tidecaller's Conch", tierLabel: 'Horn Blown!', color: '#00e5ff', effect: { label: 'A torrential Deluge floods the land for 60 seconds!' } });
      const trackerEl = document.getElementById('questTracker');
      if(trackerEl) {
        trackerEl.classList.remove('inventory-pulse-collect');
        void trackerEl.offsetWidth;
        trackerEl.classList.add('inventory-pulse-collect');
      }
      if(typeof window.updateConchHUD === 'function') window.updateConchHUD();
      if(typeof renderInventory === 'function') renderInventory();
      return true;
    }
  }
  return false;
};

function recomputeRelicModifiers(){
  relicModifiers={damage:1,speed:1,cooldown:1,xp:1,regen:0,pickupRange:0,ricochet:false,special:null};
  const applyEffect=effect=>{
    relicModifiers.damage*=effect.damage||1;
    relicModifiers.speed*=effect.speed||1;
    relicModifiers.cooldown*=effect.cooldown||1;
    relicModifiers.xp*=effect.xp||1;
    relicModifiers.regen+=effect.regen||0;
    relicModifiers.pickupRange+=effect.pickupRange||0;
  };
  for(const id of equippedRelicIds){
    const relic=relicJournal.find(item=>item.id===id);
    if(!relic)continue;
    const effect=relic.effect||relicEffectFor(relic.name);
    applyEffect(effect);
  }
  if(carriedRelic){
    const effect=carriedRelic.effect||relicEffectFor(carriedRelic.name);
    applyEffect(effect);
    relicModifiers.special=effect.power||null;
    relicModifiers.ricochet=effect.power==='ricochet';
  }
  maskOfCalmActive = equippedRelicIds.includes('relic_mask_of_calm');
  player.hasIceBridge = equippedRelicIds.includes('relic_heart_of_winter') || relicModifiers.special === 'iceBridge';
  player.relicModifiers=relicModifiers;
}
function hasCompanionRelicPower(power){
  return relicJournal.some(relic=>(relic.effect?.companionPower||relicEffectFor(relic.name).companionPower)===power);
}
function applyCompanionRelicPowers(projectile){
  if(!projectile.companionShot)return projectile;
  if(hasCompanionRelicPower('ember'))projectile.companionBonus=(projectile.companionBonus||0)+5;
  if(hasCompanionRelicPower('mirror')){projectile.ricochets=Math.max(projectile.ricochets||0,1);projectile.hitTargets=projectile.hitTargets||[];}
  if(hasCompanionRelicPower('storm'))projectile.companionChain=Math.max(projectile.companionChain||0,2);
  return projectile;
}
function applyCompanionRelicImpact(target,baseDamage){
  if(hasCompanionRelicPower('ember'))damageEnemy(target,5);
  if(!hasCompanionRelicPower('storm'))return;
  const hit=new Set([target]),points=[{x:target.x,y:target.y}];let origin=target;
  for(let jump=0;jump<2;jump++){
    const next = findNearestRevealedEnemy(origin.x, origin.y, 180, hit);
    if(!next)break;
    hit.add(next);damageEnemy(next,baseDamage*.55);points.push({x:next.x,y:next.y});origin=next;
  }
  if(points.length>1)chainVisuals.push({points,life:.28,maxLife:.28});
}
function fireCarriedRelicPower(dt){
  if(maskOfCalmActive) return;
  if(!carriedRelic||!['flameVolley','stormChain'].includes(relicModifiers.special))return;
  carriedRelic.attackTimer=Math.max(0,(carriedRelic.attackTimer||0)-dt);
  if(carriedRelic.attackTimer>0)return;
  const px=player.x+player.w/2,py=player.y+player.h/2;
  const firstTarget=findNearestRevealedEnemy(px,py);
  if(!firstTarget){carriedRelic.attackTimer=.25;return;}
  if(relicModifiers.special==='flameVolley'){
    const dx=firstTarget.x-px,dy=firstTarget.y-py,d=Math.hypot(dx,dy)||1;
    projectiles.push({x:px,y:py,vx:dx/d*12,vy:dy/d*12,damage:18,pierce:0,life:1.4,sprite:window.extItemSprite('p_relicFire'),w:16,h:16,angle:Math.atan2(dy,dx),relicFire:true});
    carriedRelic.attackTimer=2.4;
    return;
  }
  const points=[{x:px,y:py}],hit=new Set();
  let origin={x:px,y:py};
  for(let jump=0;jump<4;jump++){
    const target=findNearestRevealedEnemy(origin.x,origin.y,260,hit);
    if(!target)break;
    hit.add(target);damageEnemy(target,20);points.push({x:target.x,y:target.y});origin=target;
  }
  if(points.length>1)chainVisuals.push({points,life:.34,maxLife:.34});
  carriedRelic.attackTimer=3.4;
}
function setRelicSlot(index,id){
  if(index<0||index>=equippedRelicIds.length)return;
  if(id&&!relicJournalIds.has(id))return;
  if(id){
    const existingIndex = equippedRelicIds.indexOf(id);
    if(existingIndex !== -1 && existingIndex !== index){
      equippedRelicIds[existingIndex] = null;
    }
  }
  equippedRelicIds[index]=id;
  saveEquippedRelics(equippedRelicIds);
  recomputeRelicModifiers();
  renderInventory();
}

function flyRelicToInventory(site, relic){
  try {
    const targetEl = document.getElementById('inventoryToggle') || document.getElementById('questTracker');
    if (!targetEl) return;
    const targetRect = targetEl.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    const zoom = typeof viewZoom === 'function' ? viewZoom() : 1;
    const camX = (camera && Number.isFinite(camera.x)) ? camera.x : 0;
    const camY = (camera && Number.isFinite(camera.y)) ? camera.y : 0;
    const rawStartX = (site.x - camX) * zoom;
    const rawStartY = (site.y - camY) * zoom;
    const startX = Math.max(30, Math.min(window.innerWidth - 30, rawStartX));
    const startY = Math.max(30, Math.min(window.innerHeight - 30, rawStartY));

    const relicColor = relic.color || '#ffd54f';
    const flyer = document.createElement('div');
    flyer.className = 'relic-flying-orb';
    flyer.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      width: 44px;
      height: 44px;
      margin-left: -22px;
      margin-top: -22px;
      pointer-events: none;
      z-index: 9999;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle, ${relicColor}66 0%, rgba(0,0,0,0) 70%);
      filter: drop-shadow(0 0 12px ${relicColor});
      transform: scale(1.35);
      will-change: transform, left, top;
    `;

    let iconEl = null;
    if (typeof iconCanvas === 'function') {
      iconEl = iconCanvas(relic.sprite || relicSpriteFor(relic.name) || 'rpg_gem_diamond', 34);
    }
    if (iconEl) flyer.appendChild(iconEl);
    document.body.appendChild(flyer);

    const startTime = performance.now();
    const duration = 720;
    const midX = (startX + targetX) / 2 + (startX < targetX ? -60 : 60);
    const midY = Math.min(startY, targetY) - 90;
    let lastSparkTime = 0;

    function anim(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const curX = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * midX + ease * ease * targetX;
      const curY = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * midY + ease * ease * targetY;
      const curScale = 1.35 - 0.75 * ease;

      flyer.style.left = `${curX}px`;
      flyer.style.top = `${curY}px`;
      flyer.style.transform = `scale(${curScale}) rotate(${ease * 360}deg)`;

      if (now - lastSparkTime > 40 && progress < 0.95) {
        lastSparkTime = now;
        const spark = document.createElement('div');
        spark.style.cssText = `
          position: fixed;
          left: ${curX + (Math.random() - 0.5) * 14}px;
          top: ${curY + (Math.random() - 0.5) * 14}px;
          width: 6px;
          height: 6px;
          margin-left: -3px;
          margin-top: -3px;
          border-radius: 50%;
          background: ${relicColor};
          box-shadow: 0 0 6px ${relicColor};
          pointer-events: none;
          z-index: 9998;
          opacity: 0.95;
          transition: opacity 0.35s ease-out, transform 0.35s ease-out;
        `;
        document.body.appendChild(spark);
        requestAnimationFrame(() => {
          spark.style.opacity = '0';
          spark.style.transform = `scale(0.2) translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;
        });
        setTimeout(() => spark.remove(), 380);
      }

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        flyer.remove();
        targetEl.classList.remove('inventory-pulse-collect');
        void targetEl.offsetWidth;
        targetEl.classList.add('inventory-pulse-collect');
        setTimeout(() => targetEl.classList.remove('inventory-pulse-collect'), 500);

        for (let i = 0; i < 8; i++) {
          const spark = document.createElement('div');
          const ang = (i / 8) * Math.PI * 2;
          const dist = 18 + Math.random() * 14;
          const sx = targetX + Math.cos(ang) * 10;
          const sy = targetY + Math.sin(ang) * 10;
          const ex = targetX + Math.cos(ang) * dist;
          const ey = targetY + Math.sin(ang) * dist;
          spark.style.cssText = `
            position: fixed;
            left: ${sx}px;
            top: ${sy}px;
            width: 5px;
            height: 5px;
            margin-left: -2.5px;
            margin-top: -2.5px;
            border-radius: 50%;
            background: #ffd54f;
            box-shadow: 0 0 8px ${relicColor};
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.4s ease-out, opacity 0.4s ease-out;
          `;
          document.body.appendChild(spark);
          requestAnimationFrame(() => {
            spark.style.opacity = '0';
            spark.style.transform = `translate(${ex - sx}px, ${ey - sy}px) scale(0.3)`;
          });
          setTimeout(() => spark.remove(), 420);
        }
      }
    }
    requestAnimationFrame(anim);
  } catch (err) {
    console.error('flyRelicToInventory error:', err);
  }
}
window.flyRelicToInventory = flyRelicToInventory;

function collectRelic(site){
  if(!gameStarted||paused||gameOver)return false;
  if(site.isDreamRelic || state.isInDream){
    if(relicJournalIds.has(site.id)) return false;
    const relicId = site.relicId || site.id;
    if(!state.dreamRelics) state.dreamRelics = [];
    if(state.dreamRelics.length >= 4){
      spawnDamageNumber(player.x + player.w/2, player.y - 20, 'MAX RELICS (4/4)', '#ff5252');
      return false;
    }
    relicJournalIds.add(site.id);
    state.dreamRelics.push(relicId);
    playSfx('relic');
    flyRelicToInventory(site, { name: site.name, color: '#ba68c8', sprite: site.sprite || 'rpg_crystal_purple' });
    spawnParticles(site.x, site.y, '#ba68c8', 16);
    spawnDamageNumber(player.x + player.w/2, player.y - 25, `+ ${site.name}!`, '#ba68c8');
    showRelicToast({ name: site.name, tierLabel: 'Dream Relic', color: '#ba68c8' });
    if(typeof window.updateDreamRelicHUD === 'function') window.updateDreamRelicHUD();
    return true;
  }
  if(relicJournalIds.has(site.id))return false;
  const requiresCamp = Boolean(site.requiresCampReturn ?? relicRequiresCampReturn(site.tier));
  if(requiresCamp && carriedRelic)return false;
  const duration=Math.max(1,Number(site.duration)||20);
  const relic={id:site.id,name:site.name,tier:site.tier,tierLabel:site.tierLabel,color:site.color,xp:site.xp,sprite:site.sprite||relicSpriteFor(site.name),effect:site.effect||relicEffectFor(site.name),duration,timeRemaining:duration,attackTimer:0,requiresCampReturn:requiresCamp};
  playSfx('relic');
  flyRelicToInventory(site, relic);
  if(requiresCamp){
    carriedRelic=relic;
  } else {
    relicJournalIds.add(relic.id);
    relicJournal.push(relic);
    questProgress.relicsRun = relicJournal.length - relicsAtRunStart;
    saveRelicJournal(relicJournal);
    const emptySlotIdx = equippedRelicIds.findIndex(id => !id);
    if(emptySlotIdx !== -1){
      equippedRelicIds[emptySlotIdx] = relic.id;
      saveEquippedRelics(equippedRelicIds);
    }
  }
  recomputeRelicModifiers();showRelicToast(relic);renderInventory();updateWeaponHUD();updateRelicTracker();saveCamp();
  return true;
}
function bankCarriedRelic(){
  if(!carriedRelic)return null;
  const relic=carriedRelic;carriedRelic=null;
  if(!relicJournalIds.has(relic.id)){
    relicJournalIds.add(relic.id);
    relicJournal.push(relic);
    questProgress.relicsRun = relicJournal.length - relicsAtRunStart;
    saveRelicJournal(relicJournal);
  }
  recomputeRelicModifiers();renderInventory();updateWeaponHUD();updateRelicTracker();
  return relic;
}
function tryCollectRelic(){
  if(!gameStarted||paused||gameOver)return;
  const nearest=getNearestRelic();
  if(nearest&&nearest.distance<=75)collectRelic(nearest.site);
}
function updateRelicPickups(){
  const nearest=getNearestRelic();
  if(nearest&&nearest.distance<=50)collectRelic(nearest.site);
}
function toggleInventory(){
  if(!gameStarted||gameOver||(!inventoryOpen&&paused))return;
  inventoryOpen=!inventoryOpen;
  paused=inventoryOpen;
  document.getElementById('inventoryPanel').style.display=inventoryOpen?'flex':'none';
  if(inventoryOpen)renderInventory();
}
function spawnParticles(x,y,color,count=8){
  const maxP = window.GAME_SETTINGS?.particleLimit || 150;
  if(particles.length >= maxP) return;
  if(particles.length > maxP * 0.6) count = Math.max(1, Math.floor(count * 0.4));
  else count = Math.min(count, 16);
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2,s=2+Math.random()*4;
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5,maxLife:.5,color});
  }
}
function spawnSplash(x,y,big=false){
  if(particles.length > 240) return;
  const n=big?10:5;
  for(let i=0;i<n;i++){
    const a=-Math.PI/2+(Math.random()-.5)*Math.PI*1.2;
    const s=(big?5:3)+Math.random()*4;
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5,maxLife:.5,color:'rgba(180,220,255,.9)'});
  }
}

export { ACHIEVEMENTS, grantAchievementReward, isTrophyUnlocked, syncTrophiesFromAchievements, checkAchievements, showAchievementPopup, updateAchCount, toggleAchList, getEquippedSetPieces, getActiveSetBonuses, applyEquippedSetBonuses, spawnTrinketDrop, collectTrinket, spawnLegendaryPieceDrop, collectLegendarySetPiece, EQUIPMENT_UPGRADES, spawnDamageNumber, getNearestRelic, formatRelicCountdown, updateCampReturnLock, updateRelicTracker, renderInventory, recomputeRelicModifiers, hasCompanionRelicPower, applyCompanionRelicPowers, applyCompanionRelicImpact, fireCarriedRelicPower, setRelicSlot, collectRelic, bankCarriedRelic, tryCollectRelic, updateRelicPickups, toggleInventory, spawnParticles, spawnSplash, flyRelicToInventory };
