let lastRenderedDreamRelicsKey = null;
function updateDreamRelicHUD() {
  const container = document.getElementById('dreamRelicSlots');
  if (!container) return;
  if (!state.isInDream) {
    if (container.innerHTML !== '') container.innerHTML = '';
    lastRenderedDreamRelicsKey = null;
    return;
  }
  const relics = state.dreamRelics || [];
  const key = relics.join(',');
  if (key === lastRenderedDreamRelicsKey) return;
  lastRenderedDreamRelicsKey = key;

  let html = '';
  for (let i = 0; i < 4; i++) {
    const relicId = relics[i];
    const def = relicId ? DREAM_RELICS_MAP[relicId] : null;
    if (def) {
      html += `<div title="${def.name}: ${def.desc}" style="width: 44px; height: 44px; background: rgba(22, 10, 40, 0.92); border: 2px solid #ba68c8; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(186,104,200,0.7), inset 0 0 8px rgba(0,229,255,0.4); cursor: help; transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.12)'" onmouseout="this.style.transform='scale(1)'">
        <span data-sprite="${def.sprite}" data-icon-size="32"></span>
      </div>`;
    } else {
      html += `<div style="width: 44px; height: 44px; background: rgba(12, 6, 22, 0.65); border: 1.5px dashed rgba(123, 31, 162, 0.45); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(186, 104, 200, 0.35); font-family: 'Cinzel', serif; font-size: 11px; font-weight: bold;">
        ${i + 1}
      </div>`;
    }
  }
  container.innerHTML = html;
  renderAtlasIcons(container);
}
window.updateDreamRelicHUD = updateDreamRelicHUD;

import { BIOMES, biomeAt } from './world.mjs?v336';
import { ENEMY_TYPES } from './entities.mjs?v336';
import { WEAPON_DEFS, RUN_UPGRADES, TERRAIN_CONDITION_HINTS, WEATHER_TYPES, DREAM_RELICS_MAP } from './config.mjs?v336';
import { playSfx, syncMusicTrack } from './audio.mjs?v336';
import { campSave, saveCamp, recordRunLog, forfeitRunQuestItemsOnDeath } from './save.mjs?v336';
import { state, player, playerWeapons, equipment, getDaylight, flood, gameStarted, relicJournalIds, equippedRelicIds, relicJournal } from './state.mjs?v336';
import { showMilestoneToast, iconCanvas, renderAtlasIcons, drawUiIcon, createUiIconElement, createUpgradeIconElement } from './ui-icons.mjs?v336';
import { TILE } from './underground.mjs?v336';
import { fires, findCampSpawn } from './world-chunks.mjs?v336';
import { EQUIPMENT_UPGRADES, formatRelicCountdown, updateRelicTracker, spawnParticles, spawnDamageNumber, hasCompanionRelicPower, recomputeRelicModifiers } from './relics-achievements.mjs?v336';
import { saveRelicJournal, saveEquippedRelics } from './quests.mjs?v336';
import { LEVEL_MILESTONES, STAT_UPGRADES, addWeapon, grantRunUpgrade, addEquipment, resolveCampSceneId, settleCampRun, getSelectedCharacter } from './camp.mjs?v336';
import { scaleWeaponStats } from './weapons-combat.mjs?v336';

function checkLevelUp(){
  while(player.xp>=player.xpNext){
    player.xp-=player.xpNext;
    player.level++;
    player.xpNext=Math.floor(player.xpNext*1.22+8+player.level*2);
    const milestone=LEVEL_MILESTONES[player.level];
    if(milestone){
      milestone.apply();
      showMilestoneToast(player.level,milestone.label);
    }
    pendingLevelUps++;
  }
  const levelup=document.getElementById('levelup');
  if(pendingLevelUps>0&&levelup?.style.display!=='flex'&&!levelup?.classList.contains('levelup-closing')){
    pendingLevelUps--;
    showLevelUp();
  }
}
function showLevelUp(){
  // upgrade_open handled below
  paused=true;
  playSfx('upgrade_open'); paused=true; const modal=document.getElementById('levelup');
  if(modal){
    modal.classList.remove('levelup-closing');
    modal.classList.add('levelup-active');
    modal.style.display='flex';
  }
  const tag=document.getElementById('levelupCelebrationTag');
  if(tag)tag.textContent=`CONGRATULATIONS! ★ LEVEL ${player.level} REACHED ★`;
  const particles=document.getElementById('levelupParticles');
  if(particles){
    particles.replaceChildren();
    for(let i=0;i<18;i++){
      const s=document.createElement('span');
      s.className='levelup-spark';
      s.style.setProperty('--spark-x',`${(i*5.5+Math.random()*4).toFixed(1)}%`);
      s.style.setProperty('--spark-y',`${(70+Math.random()*25).toFixed(1)}%`);
      s.style.setProperty('--spark-delay',`${(Math.random()*0.5).toFixed(2)}s`);
      s.style.setProperty('--spark-dur',`${(1.3+Math.random()*0.9).toFixed(2)}s`);
      s.style.setProperty('--spark-size',`${(4+Math.random()*7).toFixed(0)}px`);
      particles.appendChild(s);
    }
  }
  const cont=document.getElementById('cardContainer');
  if(cont){
    cont.className='cards';
    cont.innerHTML='';
  }
  const actions=document.getElementById('levelupActions');if(actions){actions.replaceChildren();const info=document.createElement('span');info.textContent=`Rerolls: ${player.rerolls||0} | Banishes: ${player.banishes||0}`;actions.appendChild(info);if(player.rerolls>0){const button=document.createElement('button');button.type='button';button.textContent='Reroll choices';button.onclick=()=>{player.rerolls--;showLevelUp();};actions.appendChild(button);}}
  const weaponOpts=[],upgradeOpts=[];
  for(const w of playerWeapons)if(w.level<WEAPON_DEFS[w.id].maxLevel)
    weaponOpts.push({type:'upgrade',id:w.id,name:WEAPON_DEFS[w.id].name+' +1',desc:WEAPON_DEFS[w.id].desc,lvl:w.level+1});
  for(const id of Object.keys(WEAPON_DEFS))if(!WEAPON_DEFS[id].evolution&&!WEAPON_DEFS[id].tool&&!WEAPON_DEFS[id].shopOnly&&!((id==='wand'&&playerWeapons.some(w=>w.id==='arcaneBarrage'))||(id==='bow'&&playerWeapons.some(w=>w.id==='arrowstorm'))||(id==='prismStaff'&&playerWeapons.some(w=>w.id==='rainbowBarrage'))||(id==='frostBeam'&&playerWeapons.some(w=>w.id==='permafrost'))||(id==='fireBreath'&&playerWeapons.some(w=>w.id==='dragonInferno')))&&!playerWeapons.find(w=>w.id===id))
    weaponOpts.push({type:'new',id,name:WEAPON_DEFS[id].name,desc:WEAPON_DEFS[id].desc,lvl:1});
  for(const u of STAT_UPGRADES)if(!player.banishedUpgrades.includes(u.id))upgradeOpts.push({type:'stat',...u});
  for(const u of RUN_UPGRADES)if((player.upgradeLevels[u.id]||0)<u.maxLevel&&!player.banishedUpgrades.includes(u.id))upgradeOpts.push({type:'runUpgrade',...u});
  for(const e of EQUIPMENT_UPGRADES){
    const ex=equipment.find(x=>x.id===e.id);
    if((ex&&ex.level>=(e.maxLevel||Infinity))||player.banishedUpgrades.includes(e.id))continue;
    upgradeOpts.push({type:'equip',id:e.id,sprite:e.sprite,name:e.name+(ex?` +1 (Lv${ex.level+1})`:''),desc:e.desc,lvl:ex?ex.level+1:1,maxLevel:e.maxLevel||null});
  }
  const takeRandom=(items,count)=>{
    const pool=items.slice(),picked=[];
    while(pool.length&&picked.length<count)picked.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    return picked;
  };
  const choiceCount=3+Math.min(2,player.cardDraw||0);
  const picks=[...takeRandom(weaponOpts,1),...takeRandom(upgradeOpts,choiceCount-1)];
  if(picks.length<3)picks.push(...takeRandom(weaponOpts.filter(item=>!picks.some(pick=>pick.id===item.id)),3-picks.length));
  if(picks.length<3)picks.push(...takeRandom(upgradeOpts.filter(item=>!picks.some(pick=>pick.id===item.id)),3-picks.length));
  let closing = false;
  picks.forEach((p, idx)=>{
    const card=document.createElement('div');
    card.className='card';
    card.style.setProperty('--card-idx', idx);
    let iconEl = createUpgradeIconElement(p.id, 56);
    if (!iconEl && p.sprite) iconEl = createUpgradeIconElement(p.sprite, 56) || iconCanvas(p.sprite, 56);
    if (!iconEl && WEAPON_DEFS[p.id]) iconEl = createUpgradeIconElement(WEAPON_DEFS[p.id].sprite, 56) || iconCanvas(WEAPON_DEFS[p.id].sprite, 56);
    if (!iconEl) iconEl = iconCanvas(p.sprite || 'wand', 56);
    card.appendChild(iconEl);
    const nameEl=document.createElement('div');nameEl.className='name';nameEl.textContent=p.name;card.appendChild(nameEl);
    if(p.category){const category=document.createElement('div');category.className='upgrade-category';category.textContent=p.category;card.appendChild(category);}
    if(p.type==='runUpgrade'){const l=document.createElement('div');l.className='lvl';l.textContent=`Lv ${(player.upgradeLevels[p.id]||0)+1} / ${p.maxLevel}`;card.appendChild(l);}
    if(p.lvl){const l=document.createElement('div');l.className='lvl';const cap=p.maxLevel||((p.type==='new'||p.type==='upgrade')?WEAPON_DEFS[p.id].maxLevel:null);l.textContent=`Lv ${p.lvl}${cap?` / ${cap}`:''}`;card.appendChild(l);}
    const descEl=document.createElement('div');descEl.className='desc';descEl.textContent=p.desc;card.appendChild(descEl);
    if(player.banishes>0&&['stat','runUpgrade','equip'].includes(p.type)){
      const button=document.createElement('button');
      button.type='button';
      button.className='card-banish';
      button.textContent=`Banish (${player.banishes})`;
      button.onclick=event=>{
        event.stopPropagation();
        if(closing)return;
        player.banishes--;
        if(!player.banishedUpgrades.includes(p.id))player.banishedUpgrades.push(p.id);
        showLevelUp();
      };
      card.appendChild(button);
    }
    card.onclick=()=>{
      if(closing)return;
      closing=true;
      // upgrade_pick handled below

      playSfx('upgrade_pick'); card.classList.add('selected-card');
      if(cont)cont.classList.add('fading-cards');
      if(modal)modal.classList.add('levelup-closing');

      if(p.type==='new'||p.type==='upgrade')addWeapon(p.id);
      else if(p.type==='stat')p.apply();
      else if(p.type==='runUpgrade')grantRunUpgrade(p.id);
      else if(p.type==='equip')addEquipment(p.id);

      setTimeout(()=>{
        if(modal){
          modal.style.display='none';
          modal.classList.remove('levelup-active','levelup-closing');
        }
        if(cont)cont.classList.remove('fading-cards');
        paused=false;
        updateWeaponHUD();
        updateEquipHUD();
        checkLevelUp();
      }, 240);
    };
    if(cont)cont.appendChild(card);
  });
}
function updateWeaponHUD(){
  const el=document.getElementById('weapons');
  el.innerHTML='';
  for(let idx=0; idx<playerWeapons.length; idx++){
    const w = playerWeapons[idx];
    const slot=document.createElement('div');
    slot.className='wslot';
    slot.dataset.weaponIndex = String(idx);
    slot.dataset.weaponId = w.id;
    slot.appendChild(createUpgradeIconElement(w.id, 40) || iconCanvas(WEAPON_DEFS[w.id].sprite, 40));
    const lvl=document.createElement('div');
    lvl.className='lvl';
    lvl.textContent=WEAPON_DEFS[w.id].evolution?'EVO':w.level;
    slot.appendChild(lvl);

    const cdOverlay=document.createElement('div');
    cdOverlay.className='wslot-cd-overlay';
    cdOverlay.style.display='none';
    slot.appendChild(cdOverlay);

    const cdText=document.createElement('div');
    cdText.className='wslot-cd-text';
    cdText.style.display='none';
    slot.appendChild(cdText);

    el.appendChild(slot);
  }
  if(carriedRelic){
    const iconByPower={flameVolley:'rpg_fireSprite',ricochet:'gem',stormChain:'rpg_lightningSprite',phoenixGuard:'rpg_shield_gold'};
    const sprite=carriedRelic.sprite || iconByPower[relicModifiers.special] || 'rpg_gem_diamond';
    if(sprite){
      const slot=document.createElement('div');slot.className='wslot';slot.title=`Temporary relic power: ${relicModifiers.special}`;
      slot.appendChild(iconCanvas(sprite,38));
      const label=document.createElement('div');label.className='lvl';label.textContent='TEMP';slot.appendChild(label);el.appendChild(slot);
    }
  }
}
function updateEquipHUD(){
  const el=document.getElementById('equip');
  el.innerHTML='';
  for(const e of equipment){
    const slot=document.createElement('div');
    slot.className='eslot';
    slot.appendChild(createUpgradeIconElement(e.id, 34) || iconCanvas(e.sprite, 34));
    const lvl=document.createElement('div');lvl.className='lvl';lvl.style.position='absolute';lvl.style.bottom='0';lvl.style.right='2px';lvl.style.fontSize='10px';lvl.style.color='#ffd54f';lvl.style.fontWeight='bold';lvl.textContent=e.level;
    slot.appendChild(lvl);
    el.appendChild(slot);
  }
  updateConchHUD();
}

let lastConchStateKey = null;
function updateConchHUD(){
  const slot = document.getElementById('conchQuickSlot');
  if(!slot) return;
  if(!gameStarted || gameOver){
    if(slot.style.display !== 'none') slot.style.display = 'none';
    lastConchStateKey = null;
    return;
  }

  const hasConch = Boolean(
    campSave.hasTidecallerConch ||
    relicJournalIds.has('relic_tidecaller_conch') ||
    equippedRelicIds.includes('relic_tidecaller_conch') ||
    relicJournal.some(r => r && (r.id === 'relic_tidecaller_conch' || r.name === "Tidecaller's Conch"))
  );

  if(!hasConch){
    if(slot.style.display !== 'none') slot.style.display = 'none';
    lastConchStateKey = null;
    return;
  }

  const isUsed = Boolean(window.__conchUsedThisRun);
  const isDelugeActive = Boolean(flood && flood.active && flood.timer > 0);
  const floodSec = isDelugeActive ? Math.ceil(flood.timer) : 0;
  const stateKey = `${hasConch}|${isUsed}|${isDelugeActive}|${floodSec}`;
  if(stateKey === lastConchStateKey) return;
  lastConchStateKey = stateKey;

  slot.style.display = 'flex';
  slot.className = isUsed ? 'used' : (isDelugeActive ? 'deluge-active' : '');
  slot.title = isUsed
    ? "Tidecaller's Conch: Exhausted (1x per expedition)"
    : (isDelugeActive
      ? `Torrential Deluge Active (${floodSec}s remaining)`
      : "Tidecaller's Conch: Click or press [C] to summon a 60-second Deluge!");

  let labelHtml = '';
  if(isDelugeActive){
    labelHtml = `
      <div class="conch-slot-info">
        <strong style="color:#00e5ff;font-size:11px;letter-spacing:1px;text-transform:uppercase;">DELUGE ACTIVE!</strong>
        <small style="color:#b2ebf2;font-size:9.5px;">Surging: ${floodSec}s</small>
      </div>
    `;
  } else if(isUsed){
    labelHtml = `
      <div class="conch-slot-info">
        <strong style="color:#90a4ae;font-size:11px;letter-spacing:1px;text-transform:uppercase;">CONCH EXHAUSTED</strong>
        <small style="color:#78909c;font-size:9.5px;">1x per expedition</small>
      </div>
    `;
  } else {
    labelHtml = `
      <div class="conch-slot-info">
        <strong style="color:#00e5ff;font-size:11px;letter-spacing:1px;text-transform:uppercase;">BLOW CONCH [C]</strong>
        <small style="color:#b2ebf2;font-size:9.5px;">Summon 60s Deluge</small>
      </div>
    `;
  }

  slot.innerHTML = `
    <span class="conch-icon-wrap" data-sprite="Tidecallers_Conch" data-icon-size="30"></span>
    ${labelHtml}
  `;
  renderAtlasIcons(slot);
}
window.updateConchHUD = updateConchHUD;

document.getElementById('conchQuickSlot')?.addEventListener('click', (e) => {
  e.stopPropagation();
  if(typeof window.useTidecallerConch === 'function') {
    window.useTidecallerConch();
  }
});

// ═══════════════════════════════════════════════════════════
// HUD
// ═══════════════════════════════════════════════════════════

function renderWeatherIcon(weatherType = weather.type, isDream = false, isAbyss = false) {
  const el = document.getElementById('weather');
  if (!el) return;
  const key = isDream ? 'ethereal' : (isAbyss ? 'submerged' : weatherType);
  const label = isDream ? 'Ethereal' : (isAbyss ? 'Submerged' : (WEATHER_TYPES[weatherType]?.label || weatherType));
  const fallback = isDream ? 'rpg_feather_blue' : (isAbyss ? 'sunken_shrine' : (WEATHER_TYPES[weatherType]?.sprite || 'rpg_lightSpirit'));

  const icon = createUiIconElement(key, 24, fallback);
  icon.setAttribute('aria-hidden', 'true');
  const span = document.createElement('span');
  span.className = 'hud-icon-label';
  span.textContent = label;

  el.replaceChildren(icon, span);
  delete el.dataset.sprite;
  delete el.dataset.label;
  el.dataset.atlasRendered = `${key}:${label}`;
}

function renderClockIcon(clockLabel = getClockLabel(), isBloodMoonActive = false, isDream = false) {
  const el = document.getElementById('clock');
  if (!el) return;
  let key = 'day';
  if (isDream || clockLabel === 'Dream Realm' || clockLabel === 'The Void') key = 'timeless';
  else if (clockLabel === 'Underground') key = 'underground';
  else if (clockLabel === 'Abyss') key = 'abyss';
  else if (isBloodMoonActive) key = 'bloodMoon';
  else if (clockLabel === 'Night') key = 'night';
  else if (clockLabel === 'Dusk') key = 'dusk';
  else if (clockLabel === 'Midday') key = 'midday';
  else key = 'day';

  const label = isDream ? 'Timeless' : clockLabel;
  const fallback = (isDream || clockLabel === 'The Void') ? 'rpg_voidSpirit' : (clockLabel === 'Underground' ? 'torch' : (clockLabel === 'Abyss' ? 'sunken_shrine' : (isBloodMoonActive ? 'rpg_gem_red' : (clockLabel === 'Night' ? 'rpg_crystal_purple' : (clockLabel === 'Dusk' ? 'autumnTree' : 'rpg_lightSpirit')))));

  const icon = createUiIconElement(key, 24, fallback);
  icon.setAttribute('aria-hidden', 'true');
  const span = document.createElement('span');
  span.className = 'hud-icon-label';
  span.textContent = label;

  el.replaceChildren(icon, span);
  delete el.dataset.sprite;
  delete el.dataset.label;
  el.dataset.atlasRendered = `${key}:${label}`;
}

function renderBiomeIcon(bn, isAbyss = false, isUnderworld = false, isChickenDim = false) {
  const el = document.getElementById('biome');
  if (!el) return;
  let key = 'plains';
  let label = BIOMES[bn]?.name || 'Wilderness';
  let fallback = 'grassTuft';

  if (isChickenDim || bn === 'chicken') {
    key = 'plains';
    label = 'Chicken Dimension';
    fallback = 'goldenEgg';
  } else if (isAbyss || bn === 'abyss') {
    key = 'abyss';
    label = 'The Sunken Depths';
    fallback = 'sunken_shrine';
  } else if (isUnderworld || bn === 'underground' || bn === 'undergroundCave' || bn === 'dwarfCity' || bn === 'depths') {
    key = 'underground';
    label = 'The Depths';
    fallback = 'rock1';
  } else if (bn === 'dream') {
    key = 'dream';
    label = 'Dreamscape';
    fallback = 'dream_tree_cyan';
  } else if (bn === 'dimensionX') {
    key = 'dimensionX';
    fallback = 'rpg_voidSpirit';
  } else if (bn === 'forest') {
    key = 'forest'; fallback = 'oakTree';
  } else if (bn === 'magicForest') {
    key = 'magicForest'; fallback = 'rpg_magic_tree';
  } else if (bn === 'desert') {
    key = 'desert'; fallback = 'cactus';
  } else if (bn === 'snow') {
    key = 'snow'; fallback = 'snowPineTree';
  } else if (bn === 'swamp') {
    key = 'swamp'; fallback = 'mushroom';
  } else if (bn === 'volcano') {
    key = 'volcano'; fallback = 'burningTree';
  } else if (bn === 'badlands') {
    key = 'badlands'; fallback = 'grassTuft';
  } else if (bn === 'fungalWastes') {
    key = 'fungalWastes'; fallback = 'mushroom';
  } else if (bn === 'deadlands') {
    key = 'deadlands'; fallback = 'rock1';
  } else if (bn === 'crystalWastes') {
    key = 'crystalWastes'; fallback = 'rpg_voidSpirit';
  }

  const icon = createUiIconElement(key, 24, fallback);
  icon.setAttribute('aria-hidden', 'true');
  const span = document.createElement('span');
  span.className = 'hud-icon-label';
  span.textContent = label;

  el.replaceChildren(icon, span);
  delete el.dataset.sprite;
  delete el.dataset.label;
  el.dataset.atlasRendered = `${key}:${label}`;
}

function updateFieldConditions(biome,clockLabel){
  const pTileX = Math.floor(player.x / TILE), pTileY = Math.floor(player.y / TILE);
  const isAbyss = (pTileX > 700000 && pTileX < 900000 && pTileY > 700000 && pTileY < 900000);
  const isUnderworld = (pTileX > 100000 && pTileX < 300000 && pTileY > 100000 && pTileY < 300000);
  const isVoid = (pTileX > 400000 && pTileY > 400000 && !isAbyss && !isUnderworld);
  const isDream = (pTileX > 550000 && pTileX < 650000 && pTileY > 550000 && pTileY < 650000) || state.isInDream;
  const isChickenDim = (pTileX > 910000 && pTileX < 990000 && pTileY > 910000 && pTileY < 990000);
  const title = isChickenDim ? 'The Chicken Dimension' : (isDream ? 'The Dreamscape' : (isAbyss ? 'The Sunken Depths' : (isVoid ? 'The Cosmic Void' : (isUnderworld ? 'The Depths' : (BIOMES[biome]?.name || 'Wilderness')))));
  const detail = isChickenDim ? 'Secret Poultry Realm. Only the Boomerang works here! Collect 100,000 Chicken Coins to summon the Chicken King.' : (isDream ? 'Nightmare realm. Survive until awakening or struggle to wake up.' : (isAbyss ? 'Submerged trench realm. Home of the ancient Kraken.' : (isVoid ? (TERRAIN_CONDITION_HINTS.dimensionX || 'An eerie void of cosmic rifts and elder void spirits.') : (isUnderworld ? (TERRAIN_CONDITION_HINTS.undergroundCave || 'Dark caverns with stone walls. Use torch to illuminate.') : (TERRAIN_CONDITION_HINTS[biome] || 'Stay alert for local threats.')))));

  const baseIconKey = isDream ? 'dream' : (isAbyss ? 'abyss' : (isVoid ? 'timeless' : (isUnderworld ? 'underground' : 'safeZone')));
  const entries=[{iconKey: baseIconKey, fallbackSprite: isVoid ? 'rpg_voidSpirit' : 'rpg_lightSpirit', title, detail}];

  if((clockLabel==='Night'||isBloodMoon) && !isChickenDim && !isUnderworld && !isVoid)entries.push({iconKey: isBloodMoon ? 'bloodMoon' : 'night', fallbackSprite: isBloodMoon ? 'rpg_gem_red' : 'rpg_crystal_purple', title:isBloodMoon?'Blood Moon':'Night', detail:'Vampire packs can spawn in groups of one to three; darkness reduces visibility.'});
  if(isBloodMoon && !isChickenDim && !isUnderworld && !isVoid)entries.push({iconKey: 'cursed', fallbackSprite: 'rpg_gem_red', title:'Blood Moon', detail:'The Vampire Lord moves faster tonight.'});
  if(weather.type==='storm' && !isUnderworld && !isVoid && !isAbyss && !isChickenDim)entries.push({iconKey: 'stormHazard', fallbackSprite: 'rpg_lightningSprite', title:'Storm', detail:'Nearby lightning can deal 35 damage and ignite the ground.'});
  if(biome==='swamp' && !isChickenDim)entries.push({iconKey: 'swampPoison', fallbackSprite: 'rpg_potion_green', title:'Swamp poison', detail:'Slime and Horror hits, plus the Horror aura, add stacks: 2 damage per stack every 0.5s (max 5).'});
  if(player.poisonStacks>0)entries.push({iconKey: 'poison', fallbackSprite: 'rpg_potion_green', title:`Poison x${player.poisonStacks}`, detail:`${player.poisonStacks*2} damage every 0.5s while the poison lasts.`});
  if(flood.active && !isAbyss && !isChickenDim)entries.push({iconKey: 'flood', fallbackSprite: 'rpg_waterSprite', title:'Flood', detail:'Flooded tiles slow movement and can deal 2 damage per tick.'});
  if(player.inWater>0 && !isAbyss && !isChickenDim)entries.push({iconKey: 'water', fallbackSprite: 'rpg_waterSprite', title:player.inWater===2?'Deep water':'Shallow water', detail:'Movement speed is reduced while you are in water.'});
  const tileX=Math.floor((player.x+player.w/2)/TILE),tileY=Math.floor((player.y+player.h/2)/TILE);
  if(fires.has(`${tileX},${tileY}`))entries.push({iconKey: 'burning', fallbackSprite: 'burningTree', title:'Burning ground', detail:'Standing in fire deals 6 damage per second.'});
  if(carriedRelic){
    const campStatus=carriedRelic.timeRemaining>0?`Camp unlocks in ${formatRelicCountdown(carriedRelic.timeRemaining)}`:'Camp return is unlocked';
    entries.push({iconKey: 'relicDetected', fallbackSprite: 'rpg_chest_gold', title:`Carrying ${carriedRelic.name}`, detail:`${campStatus}. Dying loses the relic.`});
  }

  const panel=document.getElementById('conditionsPanel');
  const list=document.getElementById('conditionEntries');
  panel.style.display=gameStarted&&!gameOver?'block':'none';
  const key=entries.map(entry=>`${entry.iconKey}:${entry.title}:${entry.detail}`).join('|');
  if(key===lastConditionsKey)return;
  lastConditionsKey=key;
  list.replaceChildren(...entries.map(entry=>{
    const row=document.createElement('div');row.className='condition-entry';
    const iconContainer=document.createElement('span');iconContainer.className='condition-icon';
    const iconCanvasEl=createUiIconElement(entry.iconKey, 24, entry.fallbackSprite);
    iconContainer.appendChild(iconCanvasEl);
    const copy=document.createElement('span');copy.className='condition-copy';
    const title=document.createElement('strong');title.textContent=entry.title;
    const detail=document.createElement('small');detail.textContent=entry.detail;
    copy.append(title,detail);row.append(iconContainer,copy);return row;
  }));
}

function getClockLabel(){
  const wx = Math.floor((player.x + player.w / 2) / TILE), wy = Math.floor((player.y + player.h / 2) / TILE);
  const isAbyss = (wx > 700000 && wx < 900000 && wy > 700000 && wy < 900000);
  const isUnderworld = (wx > 100000 && wx < 300000 && wy > 100000 && wy < 300000);
  const isVoid = (wx > 400000 && wy > 400000 && !isAbyss && !isUnderworld);
  const isDream = state.isInDream || (wx > 550000 && wx < 650000 && wy > 550000 && wy < 650000);
  const currentBiome = biomeAt(wx, wy);

  if (isUnderworld || currentBiome === 'undergroundCave' || currentBiome === 'dwarfCity') return 'Underground';
  if (isVoid || currentBiome === 'dimensionX') return 'The Void';
  if (isAbyss || currentBiome === 'abyss') return 'Abyss';
  if (isDream || currentBiome === 'dream') return 'Dream Realm';
  if (isBloodMoon) return 'Blood Moon';
  const d = getDaylight();
  if (d < .25) return 'Night';
  if (d < .55) return 'Dusk';
  if (d < .85) return 'Day';
  return 'Midday';
}
function updateHUD(){
  document.getElementById('hpText').textContent=`${Math.ceil(player.hp)} / ${player.maxHp}`;
  const hpPct = Math.max(0, player.hp / player.maxHp * 100);
  if (Math.abs(hpPct - lastHudHpPct) > 0.05) {
    lastHudHpPct = hpPct;
    document.getElementById('hpBar').style.width = hpPct + '%';
    if (window.hpTrailTimeout) clearTimeout(window.hpTrailTimeout);
    window.hpTrailTimeout = setTimeout(() => {
      const trail = document.getElementById('hpTrail');
      if (trail) trail.style.width = hpPct + '%';
    }, 250);
  }
  document.getElementById('lvlText').textContent=player.level;
  const diffBadgeEl = document.getElementById('diffHudBadge');
  if (diffBadgeEl) diffBadgeEl.style.display = (window.GAME_SETTINGS?.difficulty === 0) ? 'inline-flex' : 'none';
  document.getElementById('xpBar').style.width=Math.min(100,player.xp/player.xpNext*100)+'%';
  document.getElementById('killText').textContent=kills;
  const runGoldEl=document.getElementById('runGoldText');
  if(runGoldEl)runGoldEl.textContent=campSave.gold;
  const dayEl=document.getElementById('dayCounter');
  if(dayEl)dayEl.textContent = 'DAY ' + (campSave.day || 1);
  const m=Math.floor(elapsed/60),s=Math.floor(elapsed%60);
  const timeStr=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const tTxt = document.getElementById('timerText');
  if (tTxt) tTxt.textContent = timeStr;
  else {
    const tParent = document.getElementById('timer');
    if (tParent && tParent.firstChild) tParent.firstChild.nodeValue = timeStr;
  }
  const wx=Math.floor((player.x+player.w/2)/TILE),wy=Math.floor((player.y+player.h/2)/TILE);
  const bn=biomeAt(wx,wy);
  const isAbyss = (wx>700000&&wx<900000 && wy>700000&&wy<900000);
  const isUnderworld = (wx>100000&&wx<300000 && wy>100000&&wy<300000);
  const isDream = state.isInDream || (wx>550000&&wx<650000 && wy>550000&&wy<650000);
  const isChickenDim = (wx>910000&&wx<990000 && wy>910000&&wy<990000);
  const chickenCoinsVal = Math.max(0, Math.floor(Number(state.chickenCoins ?? campSave.chickenCoins) || 0));
  let chickenCoinHudEl = document.getElementById('chickenCoinsHudRow');
  if (isChickenDim) {
    if (!chickenCoinHudEl) {
      const hudParent = document.getElementById('hud');
      const statusNode = document.getElementById('status');
      if (hudParent) {
        chickenCoinHudEl = document.createElement('div');
        chickenCoinHudEl.id = 'chickenCoinsHudRow';
        chickenCoinHudEl.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:4px;padding:3px 8px;background:rgba(24,18,6,0.85);border:1px solid #ffd700;border-radius:5px;color:#ffd700;font:700 12px monospace;box-shadow:0 0 10px rgba(255,215,0,0.25);';
        if (statusNode) hudParent.insertBefore(chickenCoinHudEl, statusNode);
        else hudParent.appendChild(chickenCoinHudEl);
      }
    }
    if (chickenCoinHudEl) {
      chickenCoinHudEl.style.display = 'flex';
      const coinText = `🪙 ${chickenCoinsVal.toLocaleString('en-US')} / 100,000`;
      if (chickenCoinHudEl.dataset.lastText !== coinText) {
        chickenCoinHudEl.dataset.lastText = coinText;
        const coinIcon = iconCanvas('chickenCoin', 18);
        coinIcon.className = 'atlas-icon';
        const span = document.createElement('span');
        span.textContent = coinText;
        chickenCoinHudEl.replaceChildren(coinIcon, span);
      }
    }
  } else if (chickenCoinHudEl) {
    chickenCoinHudEl.style.display = 'none';
  }
  const clockLabel=isChickenDim?'Day':getClockLabel();
  const cwKey=`${clockLabel}|${isChickenDim?false:isBloodMoon}|${isChickenDim?'clear':weather.type}|${isAbyss}|${isDream}|${isChickenDim}`;
  if(cwKey!==lastHudClockWeatherKey){
    lastHudClockWeatherKey=cwKey;
    renderClockIcon(clockLabel, isChickenDim?false:isBloodMoon, isDream);
    renderWeatherIcon(isChickenDim?'clear':weather.type, isDream, isAbyss);
  }
  const sceneBiome=isChickenDim?'chicken':resolveCampSceneId(bn,wx,wy);
  if(bn!==lastBiome || sceneBiome!==lastVisitedBiome){
    lastBiome=bn;
    lastVisitedBiome=sceneBiome;
    renderBiomeIcon(bn, isAbyss, isUnderworld, isChickenDim);
  }
  const st=[];
  if(maskOfCalmActive)st.push({sprite:'rpg_mask',label:'Calm Active'});
  if(player.poisonStacks>0)st.push({sprite:'rpg_potion_green',label:`Poison x${player.poisonStacks}`});
  if(player.shield>0)st.push({sprite:'rpg_shield_gold',label:`Shield ${Math.ceil(player.shield)}/${player.maxShield}`});
  if(player.slowFactor<.95)st.push({sprite:'rpg_iceSprite',label:`Slowed ${Math.round((1-player.slowFactor)*100)}%`});
  if(!isAbyss && !isDream && !isChickenDim){
    if(player.inWater===1)st.push({sprite:'rpg_waterSprite',label:'Shallow'});
    if(player.inWater===2)st.push({sprite:'rpg_waterSprite',label:'Deep'});
    if(flood.active)st.push({sprite:'rpg_waterSprite',label:`FLOOD ${Math.ceil(flood.timer)}s`});
    if(weather.type==='storm')st.push({sprite:'rpg_lightningSprite',label:'Storm'});
  }
  const status=document.getElementById('status');
  const statusKey=st.map(item=>`${item.sprite}:${item.label}`).join('|');
  if(statusKey!==lastStatus){lastStatus=statusKey;status.replaceChildren(...st.flatMap(item=>{const icon=iconCanvas(item.sprite,22);icon.className='atlas-icon';const label=document.createElement('span');label.textContent=item.label;return[icon,label];}));}
  updateConchHUD();
  // Subtle Moon Icon update (reflects camp sleep tracking debt)
  const moonIcon = document.getElementById('hudMoonIcon');
  if (moonIcon) {
    const debt = state.consecutiveSleeps || state.sleepDebt || 0;
    if (debt === 0) {
      moonIcon.style.color = '#ffffff';
      moonIcon.style.filter = 'drop-shadow(0 0 2px rgba(255,255,255,0.8))';
      moonIcon.style.animation = 'none';
      moonIcon.textContent = '🌙';
    } else if (debt === 1) {
      moonIcon.style.color = '#fff59d';
      moonIcon.style.filter = 'drop-shadow(0 0 4px rgba(255,245,157,0.8))';
      moonIcon.style.animation = 'none';
      moonIcon.textContent = '🌙';
    } else if (debt === 2) {
      moonIcon.style.color = '#fdd835';
      moonIcon.style.filter = 'drop-shadow(0 0 6px rgba(253,216,53,0.9))';
      moonIcon.style.animation = 'none';
      moonIcon.textContent = '🌘';
    } else {
      moonIcon.style.color = '#ba68c8';
      moonIcon.style.filter = 'drop-shadow(0 0 10px #7b1fa2)';
      moonIcon.style.animation = 'moonPulse 1.2s infinite alternate';
      moonIcon.textContent = '🌑';
    }
  }

  // Awakening meter in center-top
  const awkContainer = document.getElementById('awakeningMeterContainer');
  if (awkContainer) {
    if (state.isInDream) {
      awkContainer.style.display = 'flex';
      const pct = Math.floor(state.awakeningProgress || 0);
      const pctEl = document.getElementById('awakeningPct');
      if (pctEl) pctEl.textContent = `${pct}%`;
      const barEl = document.getElementById('awakeningBar');
      if (barEl) barEl.style.width = `${Math.min(100, Math.max(0, state.awakeningProgress || 0))}%`;

      const coinsCountEl = document.getElementById('dreamCoinsCount');
      if (coinsCountEl) coinsCountEl.textContent = state.dreamCoins || 0;
      updateDreamRelicHUD();
    } else {
      updateDreamRelicHUD();
      awkContainer.style.display = 'none';
    }
  }

  updateFieldConditions(bn,clockLabel);
  updateRelicTracker();
  updateWeaponCooldownHUD();
}

function updateWeaponCooldownHUD(){
  const slots = document.querySelectorAll('#weapons .wslot[data-weapon-index]');
  for(let i=0; i<slots.length; i++){
    const slot = slots[i];
    const idx = Number(slot.dataset.weaponIndex);
    const w = playerWeapons[idx];
    if(!w) continue;
    const cdOverlay = slot.querySelector('.wslot-cd-overlay');
    const cdText = slot.querySelector('.wslot-cd-text');
    if(!cdOverlay || !cdText) continue;

    const remaining = Math.max(0, w.timer || 0);
    const def = WEAPON_DEFS[w.id];
    if(!def) continue;
    const maxCd = w.maxTimer || (scaleWeaponStats(def.stats(w.level)).cooldown * (player.cooldownMultiplier || 1));

    if(remaining > 0.05 && maxCd > 0){
      const pct = Math.min(1, Math.max(0, remaining / maxCd));
      cdOverlay.style.display = 'block';
      cdOverlay.style.height = `${(pct * 100).toFixed(1)}%`;
      cdText.style.display = 'block';
      cdText.textContent = remaining >= 10 ? `${Math.ceil(remaining)}s` : `${remaining.toFixed(1)}s`;
    } else {
      if(cdOverlay.style.display !== 'none') cdOverlay.style.display = 'none';
      if(cdText.style.display !== 'none') cdText.style.display = 'none';
    }
  }
}
window.updateWeaponCooldownHUD = updateWeaponCooldownHUD;
function getSourceDisplayName(srcKey) {
  if (!srcKey || typeof srcKey !== 'string') return 'Unknown';
  if (srcKey === 'weather_lightning') return 'Lightning';
  if (srcKey === 'weather_flood') return 'Flood';
  if (srcKey === 'fire_tile') return 'Fire';
  if (srcKey === 'kraken_eruption') return 'Kraken Eruption';
  if (srcKey === 'enemy_projectile') return 'Enemy Projectile';
  if (srcKey === 'blizzard') return 'Blizzard Falling Beast';

  let raw = srcKey;
  if (raw.startsWith('boss_')) raw = raw.slice(5);
  else if (raw.startsWith('ultra_')) raw = raw.slice(6);
  else if (raw.startsWith('horde_')) raw = raw.slice(6);
  else if (raw.startsWith('mob_')) raw = raw.slice(4);

  const def = (typeof ENEMY_TYPES !== 'undefined') ? ENEMY_TYPES[raw] : null;
  if (def && typeof def.eliteName === 'string' && def.eliteName) {
    return def.eliteName.toLowerCase().replace(/^\w|\s\w/g, c => c.toUpperCase());
  }

  return raw
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^\w|\s\w/g, c => c.toUpperCase());
}

function computeDeathAnalytics() {
  const killSource = state.lastDamageSource || 'unknown';
  const killerName = getSourceDisplayName(killSource);

  // Top 3 damage sources across the whole run
  const bySource = state.damageBySource || {};
  const entries = Object.entries(bySource).filter(([_, dmg]) => typeof dmg === 'number' && dmg > 0);
  const totalRunDamage = entries.reduce((acc, [_, dmg]) => acc + dmg, 0);

  const topSources = entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, dmg]) => {
      const pct = totalRunDamage > 0 ? Math.round((dmg / totalRunDamage) * 100) : 0;
      return {
        name: getSourceDisplayName(key),
        damage: Math.round(dmg),
        pct
      };
    })
    .filter(s => s && s.name && s.damage > 0);

  // Ring buffer analysis: hits within the last 8 seconds
  const curTime = typeof elapsed === 'number' ? elapsed : 0;
  const buffer = Array.isArray(state.recentHitBuffer) ? state.recentHitBuffer : [];
  const recentHits = buffer.filter(h => h && typeof h.t === 'number' && (curTime - h.t) <= 8.0);

  const hints = [];

  // Hint: One huge hit (>40% of max HP)
  const maxHp = (typeof player !== 'undefined' && player && player.maxHp) ? player.maxHp : 100;
  const hugeHit = recentHits.find(h => h && typeof h.effective === 'number' && h.effective >= maxHp * 0.4);
  if (hugeHit) {
    hints.push(`Likely lethal blow: A single hit (${hugeHit.effective} damage) took out a large part of your health.`);
  }

  // Hint: >60% of recent damage from a single source
  const recentTotalDmg = recentHits.reduce((acc, h) => acc + (h.effective || 0), 0);
  if (recentTotalDmg > 0) {
    const recentBySrc = {};
    recentHits.forEach(h => {
      recentBySrc[h.source] = (recentBySrc[h.source] || 0) + (h.effective || 0);
    });
    const sortedRecent = Object.entries(recentBySrc).sort((a, b) => b[1] - a[1]);
    if (sortedRecent.length > 0 && sortedRecent[0][1] / recentTotalDmg >= 0.60) {
      const topRecentName = getSourceDisplayName(sortedRecent[0][0]);
      hints.push(`Likely focused assault: Most of the recent damage came from ${topRecentName}.`);
    }
  }

  // Hint: Surrounded (many hits in short time)
  if (hints.length < 2 && recentHits.length >= 7) {
    hints.push(`Possibly overwhelmed: You were surrounded with ${recentHits.length} hits in 8 seconds.`);
  }

  // Hint: Environmental damage share across run
  const weatherDmg = (bySource['weather_lightning'] || 0) + (bySource['weather_flood'] || 0) + (bySource['fire_tile'] || 0);
  if (hints.length < 2 && totalRunDamage > 0 && (weatherDmg / totalRunDamage) >= 0.25) {
    hints.push(`Possibly hazardous conditions: The weather and environment cost you ${Math.round(weatherDmg)} HP.`);
  }

  // Hint: Armor & shield mitigation
  const rawDmg = Math.round(state.rawDamageTakenRun || 0);
  const effDmg = Math.round(state.effectiveDamageTakenRun || 0);
  const blockedDmg = Math.max(0, rawDmg - effDmg);
  if (hints.length < 2 && rawDmg >= 120 && (blockedDmg / rawDmg) < 0.15) {
    hints.push('Possibly undergeared: Your armor and shield blocked very little damage.');
  }

  return {
    killerName,
    topSources,
    hints: hints.slice(0, 2)
  };
}

function showGameOver(){
  if(player.titanGuard3pc && (!player._titanCd || performance.now() > player._titanCd)){
    player._titanCd = performance.now() + 60000;
    player.hp = Math.max(1, Math.ceil(player.maxHp * 0.40));
    player.invulnTimer = 3.0;
    gameOver = false;
    paused = false;
    spawnParticles(player.x+player.w/2, player.y+player.h/2, '#ffd54f', 35);
    spawnDamageNumber(player.x+player.w/2, player.y-20, 'TITAN AEGIS ABSORB', '#ffd54f');
    const toast = document.createElement('div');
    toast.className = 'relic-toast';
    toast.style.borderColor = '#ffd54f';
    toast.innerHTML = '<strong style="color:#ffd54f">TITAN AEGIS ACTIVATED</strong><br/><span>Lethal hit absorbed! Invulnerable for 3s.</span>';
    document.getElementById('relicToasts')?.appendChild(toast);
    setTimeout(()=>toast.remove(), 4200);
    playSfx('confirm');
    updateHUD();
    return;
  }
  playSfx('death');
  if(player.hasRevive){player.hasRevive=false;gameOver=false;paused=false;player.hp=Math.max(1,Math.ceil(player.maxHp*.5));player.invulnTimer=2.8;spawnParticles(player.x+player.w/2,player.y+player.h/2,'#ffd45c',18);const toast=document.createElement('div');toast.className='relic-toast';const title=document.createElement('strong');title.textContent='SECOND WIND';title.style.color='#ffd45c';const name=document.createElement('span');name.textContent='You return once at half health.';toast.append(title,name);document.getElementById('relicToasts').appendChild(toast);setTimeout(()=>toast.remove(),4200);syncMusicTrack();updateHUD();saveCamp();return;}
  const ashe=companions.find(c=>c.id==='ashe');
  if(ashe&&!ashe.usedRevive&&!phoenixRevivedThisRun){
    ashe.usedRevive=true;gameOver=false;paused=false;
    player.hp=Math.max(1,Math.ceil(player.maxHp*0.4));player.invulnTimer=3;
    spawnParticles(player.x+player.w/2,player.y+player.h/2,'#ff9800',20);
    const toast=document.createElement('div');toast.className='relic-toast';
    const title=document.createElement('strong');title.textContent='ASHE REVIVES YOU';title.style.color='#ff9800';
    const name=document.createElement('span');name.textContent='The phoenix hatchling burns bright.';
    toast.append(title,name);document.getElementById('relicToasts')?.appendChild(toast);
    setTimeout(()=>toast.remove(),4200);syncMusicTrack();updateHUD();saveCamp();return;
  }
  const carriedPhoenix=relicModifiers.special==='phoenixGuard';
  const companionPhoenix=companions.length>0&&hasCompanionRelicPower('phoenix');
  if(!phoenixRevivedThisRun&&(carriedPhoenix||companionPhoenix)){
    phoenixRevivedThisRun=true;gameOver=false;paused=false;
    player.hp=Math.max(1,Math.ceil(player.maxHp*.4));player.invulnTimer=2.8;
    spawnParticles(player.x+player.w/2,player.y+player.h/2,'#ffd45c',18);
    const toast=document.createElement('div');toast.className='relic-toast';
    const title=document.createElement('strong');title.textContent='PHOENIX RESCUE';title.style.color='#ffd45c';
    const name=document.createElement('span');name.textContent=carriedPhoenix?'The carried Phoenix Heart revives you once.':'Your companion calls you back from defeat.';
    toast.append(title,name);document.getElementById('relicToasts').appendChild(toast);setTimeout(()=>toast.remove(),4200);
    syncMusicTrack();updateHUD();saveCamp();
    return;
  }
  if(deathSeq.active||deathSeq.done)return;
  try {
    const wx = Math.floor((player.x + player.w/2) / TILE);
    const wy = Math.floor((player.y + player.h/2) / TILE);
    recordRunLog({
      ts: Date.now(),
      outcome: 'defeat',
      minutes: Number((elapsed / 60).toFixed(2)),
      level: player.level,
      hero: getSelectedCharacter()?.name || campSave.character || 'wayfarer',
      biome: biomeAt(wx, wy) || 'unknown',
      weapons: playerWeapons.map(w => ({ id: w.id, level: w.level })),
      evolutions: playerWeapons.filter(w => w.level >= 8 || w.id.includes('Barrage') || w.id.includes('singularity') || w.id.includes('glaiveSun') || w.id.includes('temporalLord') || w.id.includes('permafrost') || w.id.includes('necromancerGrimoire')).map(w => w.id),
      keystone: null,
      trinkets: (campSave.equippedTrinkets || []).filter(Boolean),
      kills,
      devSpawn: Boolean(state.devSpawn),
      damageTakenEffective: Math.round(state.effectiveDamageTakenRun || 0),
      damageTakenRaw: Math.round(state.rawDamageTakenRun || 0),
      damageBlockedByArmorAndShield: Math.round(Math.max(0, (state.rawDamageTakenRun || 0) - (state.effectiveDamageTakenRun || 0))),
      damageBySource: state.damageBySource || {},
      causeOfDeath: state.lastDamageSource || 'unknown',
      mount: campSave.equippedMount || null,
      companion: (campSave.companions || [])[0] || null
    });
  } catch(err) {
    console.warn('Failed to record run log on game over:', err);
  }
  campSave.runProgress=null;hasResumableProgress=false;
  const lostRelic=carriedRelic;
  carriedRelic=null;recomputeRelicModifiers();
  if(player)player.activeQuest=null;
  const lostQuestItems=forfeitRunQuestItemsOnDeath(relicJournal,relicJournalIds,equippedRelicIds,saveRelicJournal,saveEquippedRelics);
  const lostQuestText=lostQuestItems.length?` Lost unbanked quest item${lostQuestItems.length>1?'s':''}: ${lostQuestItems.join(', ')}.`:'';
  const rewardMessage=settleCampRun(false)+(lostRelic?` ${lostRelic.name} was lost before reaching camp.`:'')+lostQuestText;
  try { sessionStorage.removeItem('pixelvivor.returnedFromBiome'); } catch (_) {}
  const homeBiome=resolveCampSceneId(getSelectedCharacter().biome||'plains');
  campSave.campBiome=homeBiome;
  const homeSpawn=findCampSpawn(homeBiome);
  campSave.campX=homeSpawn.x;
  campSave.campY=homeSpawn.y;
  saveCamp();
  document.getElementById('pauseMenu').style.display='none';
  const goStatsEl=document.getElementById('goStats');
  if(goStatsEl){
    const analytics = computeDeathAnalytics();
    let causeHtml = '';
    if (analytics.killerName) {
      causeHtml += `<div class="go-cause-header"><span class="go-cause-label">Killed by:</span> <strong class="go-cause-name">${analytics.killerName}</strong></div>`;
    }

    if (analytics.topSources && analytics.topSources.length > 0) {
      const topItems = analytics.topSources.map(s => `<span class="go-top-item">${s.name}: ${s.damage} HP (${s.pct}%)</span>`).join('<span class="go-stat-sep">&bull;</span>');
      causeHtml += `<div class="go-top-sources"><span class="go-top-label">Major Threats:</span> ${topItems}</div>`;
    }

    if (analytics.hints && analytics.hints.length > 0) {
      const hintLines = analytics.hints.map(h => `<div class="go-hint-line">&#9670; ${h}</div>`).join('');
      causeHtml += `<div class="go-hints-list">${hintLines}</div>`;
    }

    goStatsEl.innerHTML=`
      ${causeHtml ? `<div class="go-death-section">${causeHtml}</div><div class="go-stats-divider"></div>` : ''}
      <div class="go-stats-main">
        <span class="go-stat-item"><span class="go-stat-icon">&#9201;</span> Survived <strong>${Math.floor(elapsed)}s</strong></span>
        <span class="go-stat-sep">&bull;</span>
        <span class="go-stat-item"><span class="go-stat-icon">&#11088;</span> Level <strong>${player.level}</strong></span>
        <span class="go-stat-sep">&bull;</span>
        <span class="go-stat-item"><span class="go-stat-icon">&#128128;</span> <strong>${kills}</strong> kills</span>
      </div>
      ${rewardMessage?`<div class="go-stats-reward">${rewardMessage}</div>`:''}
    `;
  }
  player.mounted=false;
  deathSeq.active=true;
  deathSeq.done=false;
  deathSeq.timer=0;
  deathSeq.duration=1.85;
  deathSeq.zoom=1;
  spawnParticles(player.x+player.w/2,player.y+player.h/2,'#ef5350',28);
  spawnParticles(player.x+player.w/2,player.y+player.h/2,'#ffd54f',12);
}


export {
  updateDreamRelicHUD,
  checkLevelUp,
  showLevelUp,
  updateWeaponHUD,
  updateEquipHUD,
  updateConchHUD,
  updateFieldConditions,
  renderWeatherIcon,
  renderClockIcon,
  renderBiomeIcon,
  getClockLabel,
  updateHUD,
  updateWeaponCooldownHUD,
  showGameOver,
  openDreamShopModal,
  closeDreamShopModal,
  buyDreamShopItem
};

function rollDreamShopStock() {
  const allWeaponKeys = ['wand', 'knife', 'crossbow', 'frostbolt', 'bombard', 'spear', 'tome', 'arcaneBarrage', 'arrowstorm', 'garlic', 'aura', 'boomerang', 'chain', 'bow', 'orbital', 'mine', 'holyWater', 'voidRift', 'chrono', 'glaiveSun', 'necromancerGrimoire', 'singularity', 'temporalLord', 'prismStaff', 'rainbowBarrage', 'frostBeam', 'permafrost'];
  const shuffledW = [...allWeaponKeys].sort(() => Math.random() - 0.5).slice(0, 5);
  const shopW = shuffledW.map(id => {
    const def = window.WEAPON_DEFS ? window.WEAPON_DEFS[id] : null;
    return {
      id,
      type: 'weapon',
      name: def ? def.name : id,
      sprite: def ? def.sprite : 'wand',
      cost: 50,
      purchased: false
    };
  });

  const allUpgradesList = [
    { id: 'dmg', name: 'Brute Force', desc: '+20% Damage & +15 Knockback', sprite: 'rpg_spear', cost: 30 },
    { id: 'crit', name: 'Critical Strike', desc: '+10% Crit Chance', sprite: 'rpg_sword_diamond', cost: 30 },
    { id: 'critDmg', name: 'Sharpened Edge', desc: '+35% Crit Damage', sprite: 'rpg_sword_gold', cost: 30 },
    { id: 'pierce', name: 'Piercing Shots', desc: '+1 Projectile Pierce', sprite: 'arrow', cost: 35 },
    { id: 'speed', name: 'Rapid Fire', desc: '+15% Projectile Speed', sprite: 'rpg_lightningSprite', cost: 25 },
    { id: 'area', name: 'Expansive Reach', desc: '+25% Area of Effect', sprite: 'rpg_gem_emerald', cost: 30 },
    { id: 'haste', name: 'Swift Stride', desc: '+15% Movement Speed', sprite: 'rpg_feather_blue', cost: 25 },
    { id: 'leech', name: 'Dream Leech', desc: 'Heal 3 HP on enemy kill', sprite: 'rpg_batVampire', cost: 40 },
    { id: 'shield', name: 'Aegis Bubble', desc: '+1 Shield Bubble Charge', sprite: 'rpg_shield_gold', cost: 35 },
    { id: 'cooldown', name: 'Temporal Flux', desc: '-12% Weapon Cooldown', sprite: 'pocket_watch', cost: 35 }
  ];
  const shuffledU = [...allUpgradesList].sort(() => Math.random() - 0.5).slice(0, 5);
  const shopU = shuffledU.map(u => ({ ...u, type: 'upgrade', purchased: false }));

  state.dreamShopStock = { weapons: shopW, upgrades: shopU };
}

function openDreamShopModal() {
  if (!state.isInDream) return;
  if (!state.dreamShopStock || !state.dreamShopStock.weapons || state.dreamShopStock.weapons.length === 0) {
    rollDreamShopStock();
  }
  const modal = document.getElementById('dreamShopModal');
  if (!modal) return;
  modal.style.display = 'flex';

  const closeBtn = document.getElementById('closeDreamShopBtn');
  if (closeBtn && !closeBtn._boundClick) {
    closeBtn._boundClick = true;
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      closeDreamShopModal();
    });
  }
  if (!modal._boundBackdrop) {
    modal._boundBackdrop = true;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeDreamShopModal();
      }
    });
  }

  renderDreamShop();
}

function closeDreamShopModal() {
  const modal = document.getElementById('dreamShopModal');
  if (modal) modal.style.display = 'none';
}

function buyDreamShopItem(type, idx) {
  if (!state.dreamShopStock) return;
  const list = type === 'weapon' ? state.dreamShopStock.weapons : state.dreamShopStock.upgrades;
  const item = list ? list[idx] : null;
  if (!item || item.purchased) return;

  const currentCoins = state.dreamCoins || 0;
  if (currentCoins < item.cost) {
    playSfx('hurt');
    showMilestoneToast('Not enough Dream Coins!');
    return;
  }

  state.dreamCoins = currentCoins - item.cost;
  item.purchased = true;
  playSfx('relic');

  if (type === 'weapon') {
    addWeapon(item.id);
    showMilestoneToast(`Equipped ${item.name}!`);
  } else if (type === 'upgrade') {
    if (item.id === 'dmg') player.damageMultiplier = (player.damageMultiplier || 1) * 1.2;
    else if (item.id === 'crit') player.critChance = (player.critChance || 0) + 0.10;
    else if (item.id === 'critDmg') player.critMult = (player.critMult || 1.5) + 0.35;
    else if (item.id === 'pierce') player.extraPierce = (player.extraPierce || 0) + 1;
    else if (item.id === 'speed') player.projSpeedMult = (player.projSpeedMult || 1) * 1.15;
    else if (item.id === 'area') player.areaMult = (player.areaMult || 1) * 1.25;
    else if (item.id === 'haste') player.speed *= 1.15;
    else if (item.id === 'leech') player.dreamLeech = (player.dreamLeech || 0) + 3;
    else if (item.id === 'shield') player.shieldBubbleCharges = (player.shieldBubbleCharges || 0) + 1;
    else if (item.id === 'cooldown') player.cooldownMultiplier = (player.cooldownMultiplier || 1) * 0.88;
    showMilestoneToast(`Upgrade acquired: ${item.name}!`);
  }

  updateWeaponHUD();
  renderDreamShop();
}

function renderDreamShop() {
  if (!state.dreamShopStock) return;
  const valEl = document.getElementById('shopDreamCoinsVal');
  if (valEl) valEl.textContent = state.dreamCoins || 0;

  const wList = document.getElementById('shopWeaponsList');
  if (wList && state.dreamShopStock.weapons) {
    wList.innerHTML = state.dreamShopStock.weapons.map((w, i) => {
      const owned = Array.isArray(playerWeapons) && playerWeapons.some(pw => pw.id === w.id);
      const btnText = w.purchased ? 'OWNED' : (owned ? `UPGRADE (${w.cost} 🪙)` : `BUY (${w.cost} 🪙)`);
      const btnDisabled = w.purchased || ((state.dreamCoins || 0) < w.cost);
      return `<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(20,10,35,0.7);border:1px solid #7b1fa2;border-radius:6px;padding:6px 10px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span data-sprite="${w.sprite}" data-icon-size="28"></span>
          <div>
            <div style="font-weight:700;font-size:12px;color:#e0f7fa;">${w.name}</div>
            <div style="font-size:10px;color:#b2ebf2;font-family:sans-serif;">${w.cost} Dream Coins</div>
          </div>
        </div>
        <button type="button" onclick="window.buyDreamShopItem('weapon', ${i})" ${btnDisabled ? 'disabled' : ''} style="background:${w.purchased ? 'rgba(100,100,100,0.4)' : '#7b1fa2'};color:#fff;border:1px solid #ba68c8;border-radius:4px;padding:4px 10px;font-family:'Cinzel',sans-serif;font-size:11px;font-weight:700;cursor:${btnDisabled ? 'default' : 'pointer'};">${btnText}</button>
      </div>`;
    }).join('');
    renderAtlasIcons(wList);
  }

  const uList = document.getElementById('shopUpgradesList');
  if (uList && state.dreamShopStock.upgrades) {
    uList.innerHTML = state.dreamShopStock.upgrades.map((u, i) => {
      const btnText = u.purchased ? 'ACQUIRED' : `UPGRADE (${u.cost} 🪙)`;
      const btnDisabled = u.purchased || ((state.dreamCoins || 0) < u.cost);
      return `<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(20,10,35,0.7);border:1px solid #7b1fa2;border-radius:6px;padding:6px 10px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span data-sprite="${u.sprite}" data-icon-size="28"></span>
          <div>
            <div style="font-weight:700;font-size:12px;color:#ba68c8;">${u.name}</div>
            <div style="font-size:10px;color:#b2ebf2;font-family:sans-serif;">${u.desc}</div>
          </div>
        </div>
        <button type="button" onclick="window.buyDreamShopItem('upgrade', ${i})" ${btnDisabled ? 'disabled' : ''} style="background:${u.purchased ? 'rgba(100,100,100,0.4)' : '#0097a7'};color:#fff;border:1px solid #00e5ff;border-radius:4px;padding:4px 10px;font-family:'Cinzel',sans-serif;font-size:11px;font-weight:700;cursor:${btnDisabled ? 'default' : 'pointer'};">${btnText}</button>
      </div>`;
    }).join('');
    renderAtlasIcons(uList);
  }
}

window.openDreamShopModal = openDreamShopModal;
window.closeDreamShopModal = closeDreamShopModal;
window.buyDreamShopItem = buyDreamShopItem;
