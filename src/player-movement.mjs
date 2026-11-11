function tryInteractDreamShop() {
  if (!state.isInDream) return false;
  const shopX = 600000 * TILE, shopY = 600000 * TILE;
  const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
  const pDist = Math.hypot(pcx - shopX, pcy - (shopY - 40));
  if (pDist < 240) {
    if (typeof window.openDreamShopModal === 'function') {
      window.openDreamShopModal();
      return true;
    }
  }
  return false;
}
window.tryInteractDreamShop = tryInteractDreamShop;
window.spawnZombie = (x, y) => spawnEnemyAt(x ?? (player.x + 80), y ?? player.y, 'zombie');
window.spawnGoblin = (x, y) => spawnEnemyAt(x ?? (player.x + 100), y ?? player.y, 'goblin');
window.spawnSlime = (type = 'slime', x, y) => spawnEnemyAt(x ?? (player.x + 80), y ?? player.y, type);
window.spawnAllSlimes = () => {
  const types = ['slime', 'iceSlime', 'lavaSlime'];
  return types.map((t, idx) => spawnEnemyAt(player.x + (idx - 1) * 60, player.y - 70, t));
};
window.spawnAnimatedMobs = () => {
  const allAnimMobs = ['wolf', 'boar', 'bat', 'skeleton', 'skeletonArcher', 'stoneTitan', 'shark', 'slime', 'zombie', 'goblin', 'crocodile', 'vampire', 'bandit', 'beetle', 'voidSpirit', 'voidHorror', 'voidling', 'earthGolem', 'mummy', 'fairy', 'imp'];
  return allAnimMobs.map((t, i) => {
    const angle = (i / allAnimMobs.length) * Math.PI * 2;
    const dist = 90 + (i % 2) * 35;
    return spawnEnemyAt(player.x + Math.cos(angle) * dist, player.y + Math.sin(angle) * dist, t);
  });
};
window.spawnNewAnimatedMobs = () => {
  const newMobs = ['voidSpirit', 'voidHorror', 'voidling', 'earthGolem', 'mummy', 'fairy', 'imp'];
  return newMobs.map((t, i) => {
    const angle = (i / newMobs.length) * Math.PI * 2;
    const dist = 110;
    return spawnEnemyAt(player.x + Math.cos(angle) * dist, player.y + Math.sin(angle) * dist, t);
  });
};
window.spawnTestMobs = (x, y) => {
  const z = window.spawnZombie(x, y !== undefined ? y - 30 : undefined);
  const g = window.spawnGoblin(x !== undefined ? x + 35 : undefined, y !== undefined ? y : undefined);
  const s = window.spawnSlime('slime', x !== undefined ? x + 70 : undefined, y !== undefined ? y + 30 : undefined);
  return [z, g, s];
};

import { lerp, biomeAt, setWorldSeed } from './world.mjs?v336';
import { NPC_DIALOGUES, CAMP_COMPANIONS, BIOME_SCENE_FAMILIARS, CAMP_WEAPONS, CAMP_GEAR, CAMP_TOOLS, ALL_TRINKETS, MOUNTS, MATERIALS, HORDE_EVENTS, PLAYABLE_CHARACTERS, WEAPON_DEFS } from './config.mjs?v336';
import { saveRelicJournal, saveEquippedRelics } from './quests.mjs?v336';
import { updateAudioToggle, syncMusicTrack, toggleAudio, playSfx, setMusicTrack } from './audio.mjs?v336';
import { campSave, saveCamp, showCampMessage, recordRunLog, unlockLore, createRunProgress, captureRunQuestBaseline } from './save.mjs?v336';
import { state, canvas, viewZoom, VW, VH, player, camera, keys, enemies, projectiles, xpGems, relicJournal, relicJournalIds, equippedRelicIds, equipment, playerWeapons, hordeEvent, krakenEruptions, krakenInkClouds, spawnedBossBiomes, flood, prismBeams, rainbowArcs } from './state.mjs?v336';
import { revealedTiles, rebuildEnemyGrid, forEachEnemyNear } from './spatial.mjs?v336';
import { iconCanvas, showDropToast, renderAtlasIcons } from './ui-icons.mjs?v336';
import { TILE } from './underground.mjs?v336';
import { chunks, findCampSpawn, tileAtWorld } from './world-chunks.mjs?v336';
import { setBiomeScale } from './world.mjs?v336';
import { MOUNTAIN_WALL, MOUNTAIN_VALLEY_CENTER, MOUNTAIN_ENTRANCE, MOUNTAIN_BIOMES } from './mountains.mjs?v336';
import { syncTrophiesFromAchievements, grantAchievementReward, isTrophyUnlocked, spawnParticles, tryCollectRelic, toggleInventory, applyEquippedSetBonuses, updateCampReturnLock, spawnDamageNumber, spawnSplash, recomputeRelicModifiers, renderInventory } from './relics-achievements.mjs?v336';
import { showNpcBubble, triggerCampReaction, setCampScene, renderCamp, useHealingDraught, toggleMount, clearCampSpeechBubbles, resetQuestProgress, resetRunUpgrades, applySelectedCharacter, revealAroundPlayer, addWeapon, addEquipment, handleCampAction, settleCampRun, resolveCampSceneId, initCampSpeechBubbles, scheduleNextCampDialogue, getActiveMount, getSelectedCharacter } from './camp.mjs?v336';
import { closeNPCModal, tryInteractNPC, tryInteractSunkenShrine, tryInteractMountainShrine, tryEnterChickenDimension, tryEnterCave, tryEnterVoid } from './npcs-portals.mjs?v336';
import { fastForwardTime, spawnEnemyAt, startBossIntro } from './enemies-spawner.mjs?v336';
import { fireWeapon } from './weapons-combat.mjs?v336';
import { checkLevelUp, updateWeaponHUD, updateHUD, updateEquipHUD, showGameOver } from './ui-hud.mjs?v336';

updateAudioToggle();syncMusicTrack();



// ═══════════════════════════════════════════════════════════
// DAILY QUEST ROTATION SYSTEM (24h Reset)
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// NPC ENCOUNTERS SYSTEM (4 Archetypes)
// ═══════════════════════════════════════════════════════════

syncTrophiesFromAchievements();
window.showNpcBubble = showNpcBubble;
window.triggerCampReaction = triggerCampReaction;
window.NPC_DIALOGUES = NPC_DIALOGUES;
window.setCampScene = setCampScene;
window.renderCamp = renderCamp;
window.grantAchievementReward = grantAchievementReward;
window.isTrophyUnlocked = isTrophyUnlocked;
window.campSave = campSave;
window.CAMP_COMPANIONS = CAMP_COMPANIONS;
window.BIOME_SCENE_FAMILIARS = BIOME_SCENE_FAMILIARS;
window.fireWeapon = fireWeapon;
window.prismBeams = prismBeams;
window.rainbowArcs = rainbowArcs;
window.iconCanvas = iconCanvas;
window.CAMP_WEAPONS = CAMP_WEAPONS;
window.revealedTiles = revealedTiles;
window.enemies = enemies;
window.rebuildEnemyGrid = rebuildEnemyGrid;



// ═══════════════════════════════════════════════════════════
// ENEMIES
// ═══════════════════════════════════════════════════════════
// ═══ GLOBAL ENEMY SPEED TUNING ═══
// 0.6 = 40% slower, 0.5 = half speed, 1.0 = default

function tryPlayerDash() {
  if (!gameStarted || gameOver || paused) return false;
  if ((player.dashCooldown || 0) > 0 || (player.dashTimer || 0) > 0) return false;

  let dx = 0, dy = 0;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;

  if (dx === 0 && dy === 0) {
    if (player.lastMoveX !== 0 || player.lastMoveY !== 0) {
      dx = player.lastMoveX || 0;
      dy = player.lastMoveY || 0;
    } else if (player.facingY !== 0) {
      dx = 0;
      dy = player.facingY;
    } else {
      dx = player.facing || 1;
      dy = 0;
    }
  }

  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.SQRT2;
    player.dashDirX = dx * inv;
    player.dashDirY = dy * inv;
  } else if (dx !== 0) {
    player.dashDirX = dx > 0 ? 1 : -1;
    player.dashDirY = 0;
  } else if (dy !== 0) {
    player.dashDirX = 0;
    player.dashDirY = dy > 0 ? 1 : -1;
  } else {
    player.dashDirX = player.facing || 1;
    player.dashDirY = 0;
  }
  player.dashTimer = 0.22;
  player.dashCooldown = 3.2;
  player.invulnTimer = Math.max(player.invulnTimer || 0, 0.28);

  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#4fc3f7', 16);
  try { playSfx('dash'); } catch(e) { try { playSfx('levelup'); } catch(e2) {} }
  return true;
}

// ═══════════════════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════════════════
addEventListener('keydown',e=>{
  const kLow = e.key ? e.key.toLowerCase() : '';
  keys[kLow] = true;
  if(e.code) keys[e.code.toLowerCase()] = true;
  if(e.code === 'KeyW') keys['w'] = true;
  if(e.code === 'KeyA') keys['a'] = true;
  if(e.code === 'KeyS') keys['s'] = true;
  if(e.code === 'KeyD') keys['d'] = true;
  if(e.code === 'KeyE') keys['e'] = true;

  if((kLow==='m' || e.code==='KeyM') && e.ctrlKey && !e.repeat){toggleAudio();return;}
  if(e.key===' ' || e.code==='Space'){
    e.preventDefault();
    if(!e.repeat && gameStarted && !paused && !gameOver){
      tryPlayerDash();
    }
    return;
  }
  if(e.key==='Escape' || e.code==='Escape'){
    if(npcModalOpen){closeNPCModal();return;}
    const openModal=document.querySelector('.menu-modal.open');
    if(openModal){openModal.classList.remove('open');return;}
  }
  const isKeyE = e.code==='KeyE' || kLow==='e' || e.key==='ε' || e.key==='Ε' || e.keyCode===69;
  if((e.key==='Escape' || e.code==='Escape' || isKeyE) && document.getElementById('dreamShopModal')?.style.display === 'flex'){
    if (typeof window.closeDreamShopModal === 'function') {
      window.closeDreamShopModal();
      return;
    }
  }
  if(isKeyE && !e.repeat){
    if(tryInteractDreamShop()) return;
    if(tryInteractNPC()) return;
    if(tryInteractSunkenShrine()) return;
    if(tryInteractMountainShrine()) return;
    if(tryEnterChickenDimension()) return;
    if(tryEnterCave()) return;
    if(tryEnterVoid()) return;
    tryCollectRelic();
  }
  if((kLow==='c' || e.code==='KeyC') && !e.repeat && gameStarted && !gameOver){
    if(typeof window.useTidecallerConch === 'function'){
      window.useTidecallerConch();
      return;
    }
  }
  if((kLow==='i' || e.code==='KeyI') && !e.repeat){toggleInventory();return;}
  if((kLow==='h' || e.code==='KeyH') && !e.repeat){useHealingDraught();return;}
  if((kLow==='f' || e.code==='KeyF') && !e.repeat && gameStarted && !gameOver){
    toggleMount();return;
  }
  if((kLow==='t' || e.code==='KeyT') && !e.repeat && gameStarted && !gameOver && !window.IS_DEMO){fastForwardTime(300);return;}
  if((kLow==='l' || e.code==='KeyL') && !e.repeat && gameStarted && !gameOver && !window.IS_DEMO){player.xp=player.xpNext;checkLevelUp();return;}
  if((kLow==='z' || e.code==='KeyZ') && !e.repeat && gameStarted && !gameOver && !window.IS_DEMO){
    const animTypes = ['wolf', 'boar', 'bat', 'skeleton', 'skeletonArcher', 'stoneTitan', 'shark', 'slime', 'zombie', 'goblin', 'crocodile', 'vampire', 'bandit', 'beetle', 'voidSpirit', 'voidHorror', 'voidling', 'earthGolem', 'mummy', 'fairy', 'imp'];
    const idx = (window._animTestIdx = ((window._animTestIdx || 0) + 1) % animTypes.length);
    const chosen = animTypes[idx];
    const prev = animTypes[(idx + animTypes.length - 1) % animTypes.length];
    const dir = player.facing === 'left' ? -1 : 1;
    spawnEnemyAt(player.x + dir * 85, player.y - 25, chosen);
    spawnEnemyAt(player.x + dir * 120, player.y + 25, prev);
    showDropToast('Spawned: ' + chosen + ' & ' + prev + ' (Anim Test [Z])', '#66bb6a');
    return;
  }
  if((e.key==='Escape' || e.code==='Escape') && inventoryOpen){toggleInventory();return;}
  if((e.key==='Escape' || e.code==='Escape') && gameStarted && !gameOver && document.getElementById('levelup').style.display!=='flex'){
    if (state.isInDream) return;
    paused=!paused;
    document.getElementById('pauseMenu').style.display=paused?'flex':'none';
  }
});
addEventListener('keyup',e=>{
  const kLow = e.key ? e.key.toLowerCase() : '';
  keys[kLow] = false;
  if(e.code) keys[e.code.toLowerCase()] = false;
  if(e.code === 'KeyW') keys['w'] = false;
  if(e.code === 'KeyA') keys['a'] = false;
  if(e.code === 'KeyS') keys['s'] = false;
  if(e.code === 'KeyD') keys['d'] = false;
  if(e.code === 'KeyE') keys['e'] = false;
});


window.enterVoidPortal = function() {
  if (!campSave.hasDimensionalKey) return;
  // Teleport player to the void
  player.x = 450000;
  player.y = 450000;
  camera.x = player.x - canvas.width/2/viewZoom();
  camera.y = player.y - canvas.height/2/viewZoom();
  // Start the game!
  document.getElementById('campOverlay').style.display='none';
  startGame();
  showDropToast("You have entered the Void Realm.", '#cb8cff');
};

  function startGame(){
  if(gameStarted||gameOver)return;
  clearCampSpeechBubbles();
    gameStarted=true;
  deathSeq={active:false,done:false,timer:0,duration:1.85,zoom:1};
  playSfx('confirm');
  if (window.resetMinimapView) window.resetMinimapView();setMusicTrack('gameplay');
  paused=false;
  campRunSettled=false;
  const continuing=hasResumableProgress;
  // Reset bounty progress αν ΔΕΝ συνεχίζεις save
  if(!continuing) resetQuestProgress();
  hasResumableProgress=false;
  if(!continuing){
    state.lastSurgeTime = 0;
    state.apexInvasionLevels = new Set();
    
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    setWorldSeed(newSeed);
    chunks.clear();
    const hasDevStartBiome = Boolean(state.devStartBiome && state.devStartBiome !== 'default');
    const hasDevStartLevel = Boolean(state.devStartLevel && Number(state.devStartLevel) > 1);
    const hasDevBorder = Boolean(state.devSpawnNearBorder);
    const hasDevWeapons = Boolean(state.devGiveWeaponsAt5);
    state.devSpawn = Boolean(hasDevStartBiome || hasDevStartLevel || hasDevBorder || hasDevWeapons);

    const targetBiome = hasDevStartBiome ? state.devStartBiome : (getSelectedCharacter()?.biome || campSave.campBiome || 'plains');
    campSave.campBiome = targetBiome;
    const campSpawn = findCampSpawn(targetBiome, Boolean(state.devSpawnNearBorder));
    player.x = campSpawn.x;
    player.y = campSpawn.y;
    camera.x = player.x + player.w/2 - VW()/2;
    camera.y = player.y + player.h/2 - VH()/2;
    resetRunUpgrades();applySelectedCharacter();applyEquippedSetBonuses();relicsAtRunStart=relicJournal.length;

    if (hasDevStartLevel) {
      const targetLvl = Math.max(1, Math.min(80, parseInt(state.devStartLevel, 10) || 1));
      player.level = targetLvl;
      let xpNext = 10;
      for (let l = 1; l < targetLvl; l++) {
        xpNext = Math.floor(xpNext * 1.22 + 8 + (l + 1) * 2);
      }
      player.xpNext = xpNext;
      player.hp = player.maxHp;
    }

    if (hasDevWeapons) {
      const devWeapons = ['wand', 'bow', 'spear', 'tome'];
      devWeapons.forEach(wId => {
        let existing = playerWeapons.find(w => w.id === wId);
        if (!existing) {
          playerWeapons.push({ id: wId, level: 5, timer: 0 });
        } else {
          existing.level = Math.max(existing.level, 5);
        }
      });
      updateWeaponHUD();
      updateHUD();
    }
    hordeEvent.timer = HORDE_EVENTS.baseCooldown;
    hordeEvent.active = false;
    hordeEvent.warning = 0;
    hordeEvent.type = null;
    hordeEvent.data = null;
    lastHordeSpawnTime = 0;
    lastSwarmWaveTime = 0;
    krakenEruptions.length = 0;
    krakenInkClouds.length = 0;
    state.foodPickups = []; player.secondWindUsed = false; player.secondWindTimer = 0;
    if(window.activeLifeWells) window.activeLifeWells.length = 0;
    state.chickenDimensionEntered = false;
    state.chickenKingSpawned = false;
    state.chickenKingDefeated = false;
    state.lastDamageSource = 'unknown';
    state.rawDamageTakenRun = 0;
    state.effectiveDamageTakenRun = 0;
    state.totalDamageTakenRun = 0;
    state.damageBySource = {};
    state.recentHitBuffer = [];
  }
  if(!continuing){phoenixRevivedThisRun=false;captureRunQuestBaseline();saveCamp();}
  revealAroundPlayer();
  lastFogSave=elapsed;
  revealAroundPlayer();
  lastFogSave=elapsed;
  if(!continuing){
    state.lastSurgeTime = 0;
    state.apexInvasionLevels = new Set();
    campSave.runs++;
    playerWeapons.length = 0;
    const curChar = getSelectedCharacter();
    const starterWeapon = curChar?.startingWeapon || (campSave.character === 'knight' ? 'fireBreath' : (campSave.character === 'orc' ? 'orcCleaver' : 'wand'));
    const loadout = (campSave.loadoutWeapons && campSave.loadoutWeapons.length > 0)
      ? campSave.loadoutWeapons
      : [starterWeapon];
    for (const wid of loadout) {
      if (!playerWeapons.some(w => w.id === wid)) addWeapon(wid);
    }
  }
  for(const id of campSave.ownedGear)if(!equipment.some(item=>item.id===id))addEquipment(id);
  companions.forEach((companion,index)=>{
    companion.cooldown=0;
    companion.x=player.x+player.w/2-38-(index-(companions.length-1)/2)*30;
    companion.y=player.y+player.h/2+38;
  });
  saveCamp();
  updateWeaponHUD();updateEquipHUD();
  document.getElementById('menu').style.display='none';
  document.getElementById('pauseMenu').style.display='none';
}
function openMenuModal(id){document.getElementById(id)?.classList.add('open');}
function updateFullscreenButton(){
  const button=document.getElementById('fullscreenToggle');
  if(button)button.textContent=document.fullscreenElement?'Exit fullscreen':'Enter fullscreen';
}
document.getElementById('tipsButton').addEventListener('click',()=>openMenuModal('helpModal'));
document.getElementById('openSettings').addEventListener('click',()=>openMenuModal('settingsModal'));
document.getElementById('pauseSettings')?.addEventListener('click',()=>{playSfx('confirm');openMenuModal('settingsModal');});
  const handleFastForward5Min = () => {
  fastForwardTime(300);
  showDropToast("⚡ Fast-forwarded +5 minutes!", '#4fc3f7');
  if (paused) {
    paused = false;
    const pm = document.getElementById('pauseMenu');
    if (pm) pm.style.display = 'none';
  }
  document.getElementById('settingsModal')?.classList.remove('open');
};
document.getElementById('btnTestFastForward5Min')?.addEventListener('click', handleFastForward5Min);
document.getElementById('pauseFastForward')?.addEventListener('click', handleFastForward5Min);
document.getElementById('openCredits').addEventListener('click',()=>openMenuModal('creditsModal'));


// ==========================================
// SANDBOX / TEST MODE CONTROLS
// ==========================================
window.grantSandboxResources = function() {
  if(!campSave.materials) campSave.materials = {};

  campSave.gold = (campSave.gold || 0) + 999999;
  campSave.chickenCoins = (campSave.chickenCoins || 0) + 999999;
  state.chickenCoins = (state.chickenCoins || 0) + 999999;
  state.dreamCoins = (state.dreamCoins || 0) + 999999;
  campSave.potionCount = 99;

  for (const k of Object.keys(MATERIALS)) {
    campSave.materials[k] = Math.max(campSave.materials[k] || 0, 99);
  }

  saveCamp();
  playSfx('levelup');
  if(typeof updateHUD === 'function') updateHUD();
  if(typeof renderCamp === 'function') renderCamp();
  if(typeof renderInventory === 'function') renderInventory();

  showDropToast('💰 SANDBOX: +999,999 Gold, Coins & 99 All Materials Granted!', '#ffd700');
};

window.grantSandboxAllUnlocks = function() {
  // 1. All Camp Weapons
  if(!campSave.ownedWeapons) campSave.ownedWeapons = [];
  for (const w of CAMP_WEAPONS) {
    if (!campSave.ownedWeapons.includes(w.id)) campSave.ownedWeapons.push(w.id);
  }

  // If currently in a run, grant & max out weapons
  if(gameStarted && !gameOver && typeof playerWeapons !== 'undefined') {
    for(let i = playerWeapons.length - 1; i >= 0; i--) {
      if(!WEAPON_DEFS[playerWeapons[i]?.id]) playerWeapons.splice(i, 1);
    }
    const starterPicks = ['wand', 'fireBreath', 'elvenBow', 'warhammer', 'chainWhip', 'orcCleaver'].filter(id => WEAPON_DEFS[id]);
    for(const wid of starterPicks) {
      if(!playerWeapons.some(pw => pw.id === wid) && playerWeapons.length < 4) {
        playerWeapons.push({ id: wid, level: 8, timer: 0 });
      }
    }
    for(const pw of playerWeapons) {
      const maxLvl = WEAPON_DEFS[pw.id]?.maxLevel || 8;
      pw.level = Math.min(maxLvl, Math.max(pw.level || 1, 8));
    }
  }

  // 2. All Gear & Tools
  if(!campSave.ownedGear) campSave.ownedGear = [];
  for (const g of CAMP_GEAR) {
    if (!campSave.ownedGear.includes(g.id)) campSave.ownedGear.push(g.id);
  }
  if(typeof CAMP_TOOLS !== 'undefined') {
    if(!campSave.ownedTools) campSave.ownedTools = [];
    for (const t of CAMP_TOOLS) {
      if (!campSave.ownedTools.includes(t.id)) campSave.ownedTools.push(t.id);
    }
  }

  // 3. All Trinkets
  if(!campSave.ownedTrinkets) campSave.ownedTrinkets = [];
  for (const tr of ALL_TRINKETS) {
    if (!campSave.ownedTrinkets.includes(tr.id)) campSave.ownedTrinkets.push(tr.id);
  }

  // 4. Secret items & Relics
  campSave.hasTidecallerConch = true;
  campSave.hasAbyssalKey = true;
  campSave.hasAbyssalHeart = true;
  campSave.hasGoldenEgg = true;
  campSave.hasFrozenCore = true;
  if(!campSave.materials) campSave.materials = {};
  campSave.materials.tidecallersConch = 1;
  campSave.materials.abyssalKey = 1;
  campSave.materials.abyssalHeart = Math.max(campSave.materials.abyssalHeart || 0, 1);
  campSave.materials.goldenEgg = 5;
  campSave.materials.frozenCore = 5;
  unlockLore('clues', 'c_tidecaller_conch');
  unlockLore('clues', 'c_sunken_shrine');
  unlockLore('clues', 'c_abyss_key');
  unlockLore('clues', 'c_abyss_kraken');

  const allRelicPool = [
    { id: 'relic_tidecaller_conch', name: "Tidecaller's Conch", tier: 'rare', color: '#00e5ff', sprite: 'Tidecallers_Conch', xp: 50, effect: { label: 'Active: Summon 60s Deluge', power: 'tidecaller' } },
    { id: 'relic_abyssal_key', name: "The Abyssal Key", tier: 'mythic', color: '#00e5ff', sprite: 'Abyssal_Key', xp: 100, effect: { label: 'Key of the Depths: Unlocks passage to The Sunken Depths (The Abyss) & +15% Damage.', damage: 1.15 } },
    { id: 'relic_abyssal_heart', name: 'Heart of the Abyss', tier: 'mythic', color: '#00e5ff', sprite: 'rpg_abyssalHeart', xp: 100, effect: { label: '+35% Damage, +35% XP', damage: 1.35, xp: 1.35 } },
    { id: 'relic_heart_of_winter', name: 'Heart of Winter', tier: 'rare', color: '#4fc3f7', sprite: 'rpg_frozenCore', xp: 50, effect: { label: 'Freeze water under footsteps', power: 'iceBridge' } },
    { id: 'relic_blade_void', name: 'Blade of the Void', tier: 'mythic', color: '#ff4d4d', sprite: 'Blade_of_the_Void', xp: 100, effect: { label: '+50% damage, -15% cooldown', damage: 1.50, cooldown: 0.85 } },
    { id: 'relic_aegis_ancients', name: 'Aegis of the Ancients', tier: 'mythic', color: '#ff4d4d', sprite: 'aegis_of_the_ancients', xp: 100, effect: { label: '+35% damage, +35% XP, +10% speed', damage: 1.35, xp: 1.35, speed: 1.10 } },
    { id: 'relic_tome_eternity', name: 'Tome of Eternity', tier: 'mythic', color: '#ff4d4d', sprite: 'Tome_of_Eternity', xp: 100, effect: { label: '+40% XP, +2 HP/sec', xp: 1.40, regen: 2.0 } },
    { id: 'relic_wanderers_cloak', name: "Wanderer's Cloak", tier: 'mythic', color: '#ff4d4d', sprite: 'Wanderers_Cloak', xp: 100, effect: { label: '+25% speed, Ricochet shots', speed: 1.25, power: 'ricochet' } },
    { id: 'relic_phoenix_heart', name: 'Phoenix Heart', tier: 'legendary', color: '#ffd45c', sprite: 'Phoenix_Heart', xp: 75, effect: { label: 'One phoenix rescue', power: 'phoenixGuard' } }
  ];

  for(const r of allRelicPool) {
    if(!relicJournalIds.has(r.id)) {
      relicJournalIds.add(r.id);
      relicJournal.push(r);
    }
  }
  saveRelicJournal(relicJournal);

  for(let i = 0; i < 4; i++) {
    if(!equippedRelicIds[i] && allRelicPool[i]) {
      equippedRelicIds[i] = allRelicPool[i].id;
    }
  }
  saveEquippedRelics(equippedRelicIds);

  // 5. All Characters, Mounts, Companions
  if(!campSave.unlockedCharacters) campSave.unlockedCharacters = [];
  for (const c of PLAYABLE_CHARACTERS) {
    if (!campSave.unlockedCharacters.includes(c.id)) campSave.unlockedCharacters.push(c.id);
  }
  if(!campSave.ownedMounts) campSave.ownedMounts = [];
  if(!campSave.unlockedMounts) campSave.unlockedMounts = [];
  for (const mId of Object.keys(MOUNTS)) {
    if (!campSave.ownedMounts.includes(mId)) campSave.ownedMounts.push(mId);
    if (!campSave.unlockedMounts.includes(mId)) campSave.unlockedMounts.push(mId);
  }
  if(!campSave.unlockedCompanions) campSave.unlockedCompanions = [];
  for (const comp of CAMP_COMPANIONS) {
    if (!campSave.unlockedCompanions.includes(comp.id)) campSave.unlockedCompanions.push(comp.id);
  }

  saveCamp();
  playSfx('levelup');
  recomputeRelicModifiers();
  if(typeof updateHUD === 'function') updateHUD();
  if(typeof updateWeaponHUD === 'function') updateWeaponHUD();
  if(typeof renderInventory === 'function') renderInventory();
  if(typeof renderCamp === 'function') renderCamp();

  showDropToast('⚔️ SANDBOX: All Weapons, Relics, Trinkets & Characters Unlocked!', '#00e5ff');
};

window.teleportToBiome = function(biomeKey, nearBorder = false) {
  state.devSpawn = true;
  const settingsModal = document.getElementById('settingsModal');
  if(settingsModal) settingsModal.classList.remove('open');
  const pauseMenu = document.getElementById('pauseMenu');
  if(pauseMenu) pauseMenu.style.display = 'none';

  if(!gameStarted || gameOver) {
    const campOverlay = document.getElementById('campOverlay');
    if(campOverlay) campOverlay.style.display = 'none';
    startGame();
  }
  paused = false;

  if(typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
  if(window.brokenWalls) window.brokenWalls.clear();

  // Mountain Biomes (mountain1 .. mountain5)
  if(biomeKey && biomeKey.startsWith('mountain')) {
    const mNum = parseInt(biomeKey.replace('mountain', ''), 10) || 1;
    if(nearBorder && window.teleportToMountain) {
      window.teleportToMountain(mNum, false);
    } else if(window.teleportToMountainValley) {
      window.teleportToMountainValley(mNum);
    }
    return;
  }

  let tx = 100, ty = 100;
  if(biomeKey === 'dream') {
    state.isInDream = true;
    tx = 600000 * TILE;
    ty = 600000 * TILE;
  } else if(biomeKey === 'abyss') {
    tx = 750000 * TILE;
    ty = 750000 * TILE;
    setTimeout(() => {
      if(!enemies.some(e => e.hp > 0 && (e.type === 'abyss_octopus' || e.type === 'Abyssal_kraken'))){
        for(let i = enemies.length - 1; i >= 0; i--) {
          if(enemies[i].boss || enemies[i].type === 'abyss_octopus' || enemies[i].type === 'Abyssal_kraken') enemies.splice(i, 1);
        }
        spawnedBossBiomes.add('abyss');
        const k = spawnEnemyAt(player.x, player.y - 320, 'abyss_octopus');
        if(k){ k.boss = true; k.isKrakenBoss = true; }
        startBossIntro('abyss_octopus');
      }
    }, 120);
  } else if(biomeKey === 'dimensionX') {
    tx = 400500 * TILE;
    ty = 400500 * TILE;
  } else if(biomeKey === 'chicken' || biomeKey === 'chickenDimension') {
    state.chickenDimensionEntered = true;
    tx = 950000 * TILE;
    ty = 950000 * TILE;
  } else if(biomeKey === 'dwarfCity') {
    tx = 200000 * TILE;
    ty = 200000 * TILE;
  } else if(biomeKey === 'undergroundCave') {
    tx = 200026 * TILE;
    ty = 200023 * TILE;
  } else {
    const pt = findCampSpawn(biomeKey, nearBorder);
    tx = pt.x;
    ty = pt.y;
  }

  player.x = tx;
  player.y = ty;
  camera.x = player.x - VW() / 2;
  camera.y = player.y - VH() / 2;

  playSfx('confirm');
  showDropToast(`🚀 Teleported to ${biomeKey.toUpperCase()}!`, '#00e5ff');
};

document.getElementById('btnDevInfiniteResources')?.addEventListener('click', () => {
  window.grantSandboxResources();
});

document.getElementById('btnDevUnlockAll')?.addEventListener('click', () => {
  window.grantSandboxAllUnlocks();
});

document.getElementById('btnDevTeleportAnyBiome')?.addEventListener('click', () => {
  const sel = document.getElementById('devInstantBiomeSelect');
  const val = sel ? sel.value : 'plains';
  window.teleportToBiome(val, false);
});

document.getElementById('btnDevTeleportBiomeBorder')?.addEventListener('click', () => {
  const sel = document.getElementById('devInstantBiomeSelect');
  const val = sel ? sel.value : 'plains';
  window.teleportToBiome(val, true);
});

document.getElementById('btnAddTestMaterials')?.addEventListener('click', () => {
  state.devSpawn = true;
  handleCampAction('add-test-materials');
});

// ==========================================
// DEV/TEST: VOID REALM TEST (Easily removable)
// ==========================================
document.getElementById('btnTestVoidTeleport')?.addEventListener('click', () => {
  state.devSpawn = true;
  const settingsModal = document.getElementById('settingsModal');
  if(settingsModal) settingsModal.classList.remove('open');
  const pauseMenu = document.getElementById('pauseMenu');
  if(pauseMenu) pauseMenu.style.display = 'none';

  if(!gameStarted || gameOver) {
    const campOverlay = document.getElementById('campOverlay');
    if(campOverlay) campOverlay.style.display = 'none';
    startGame();
  }
  paused = false;
  if(typeof chunks !== 'undefined' && chunks.clear) chunks.clear();

  // Teleport to Void Biome (wx > 400000 && wy > 400000)
  player.x = 400500 * TILE;
  player.y = 400500 * TILE;
  camera.x = player.x - VW() / 2;
  camera.y = player.y - VH() / 2;

  // Testing buffs to survive and test the Void God encounter
  player.hp = Math.max(player.hp, 800);
  player.maxHp = Math.max(player.maxHp, 800);
  if(player.level < 15) {
    player.level = 15;
    player.damageMult = (player.damageMult || 1) * 2.5;
  }

  // Remove existing bosses and spawn Void God
  for(let i = enemies.length - 1; i >= 0; i--) {
    if(enemies[i].boss) enemies.splice(i, 1);
  }
  spawnEnemyAt(player.x, player.y - 200, 'voidGod');
  playSfx('confirm');
    showDropToast("🌌 Welcome to The Void! Void God awakened!", '#e040fb');
});

// ==========================================
// DEV/TEST: ABYSS REALM & FLOOD TEST (Easily removable)
// ==========================================
document.getElementById('btnTestAbyssTeleport')?.addEventListener('click', () => {
  state.devSpawn = true;
  const settingsModal = document.getElementById('settingsModal');
  if(settingsModal) settingsModal.classList.remove('open');
  const pauseMenu = document.getElementById('pauseMenu');
  if(pauseMenu) pauseMenu.style.display = 'none';

  if(!gameStarted || gameOver) {
    const campOverlay = document.getElementById('campOverlay');
    if(campOverlay) campOverlay.style.display = 'none';
    startGame();
  }
  paused = false;
  if(typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
  window.lastSurfacePos = { x: player.x, y: player.y };
  if (window.brokenWalls) window.brokenWalls.clear();
  if (typeof chunks !== 'undefined' && chunks.clear) chunks.clear();

  // Teleport to Abyss (wx > 700000 && wy > 700000)
  player.x = 750000 * TILE;
  player.y = 750000 * TILE;
  camera.x = player.x - VW() / 2;
  camera.y = player.y - VH() / 2;

  // Testing buffs
  player.hp = Math.max(player.hp, 800);
  player.maxHp = Math.max(player.maxHp, 800);
  if(player.level < 15) {
    player.level = 15;
    player.damageMult = (player.damageMult || 1) * 2.5;
  }

  // Remove existing bosses and spawn Kraken
  for(let i = enemies.length - 1; i >= 0; i--) {
    if(enemies[i].boss || enemies[i].type === 'abyss_octopus' || enemies[i].type === 'Abyssal_kraken') enemies.splice(i, 1);
  }
  spawnedBossBiomes.add('abyss');
  spawnEnemyAt(player.x, player.y - 200, 'abyss_octopus');
  playSfx('confirm');
    showDropToast("🌊 Welcome to The Sunken Depths! Kraken awakened!", '#00e5ff');
});

document.getElementById('btnTestFlood')?.addEventListener('click', () => {
  state.devSpawn = true;
  const settingsModal = document.getElementById('settingsModal');
  if(settingsModal) settingsModal.classList.remove('open');
  const pauseMenu = document.getElementById('pauseMenu');
  if(pauseMenu) pauseMenu.style.display = 'none';

  if(!gameStarted || gameOver) {
    const campOverlay = document.getElementById('campOverlay');
    if(campOverlay) campOverlay.style.display = 'none';
    startGame();
  }
  paused = false;
  if(typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
  flood.active = true;
  flood.timer = 45;
  floodBoost = 0.25;
  playSfx('confirm');
    showDropToast("🌧️ Midnight Deluge Flood active for 45s!", '#4fc3f7');
});

window.teleportToAbyss = function() {
  document.getElementById('btnTestAbyssTeleport')?.click();
};

function getMountainBiomeTarget(target = 1) {
  if (typeof target === 'string') {
    const parsed = parseInt(target, 10);
    if (!isNaN(parsed)) target = parsed;
  }
  const idx = typeof target === 'number' ? target - 1 : 0;
  return MOUNTAIN_BIOMES[idx] || MOUNTAIN_BIOMES[0];
}

window.teleportToMountain = function(target = 1, behind = false) {
  state.devSpawn = true;
  const settingsModal = document.getElementById('settingsModal');
  if(settingsModal) settingsModal.classList.remove('open');
  const pauseMenu = document.getElementById('pauseMenu');
  if(pauseMenu) pauseMenu.style.display = 'none';

  if(!gameStarted || gameOver) {
    const campOverlay = document.getElementById('campOverlay');
    if(campOverlay) campOverlay.style.display = 'none';
    startGame();
  }
  paused = false;
  if(typeof chunks !== 'undefined' && chunks.clear) chunks.clear();

  const mb = getMountainBiomeTarget(target);
  if(behind) {
    // Just north of mountain wall (occluded behind peak tiles for Y-sorting test)
    player.x = mb.startX + mb.w / 2;
    player.y = mb.startY - 35;
  } else {
    // South gorge entrance path
    player.x = mb.entrance.x;
    player.y = mb.entrance.y;
  }
  camera.x = player.x - VW() / 2;
  camera.y = player.y - VH() / 2;
  playSfx('confirm');
    showDropToast(behind ? `🏔️ Behind: ${mb.name}` : `🏔️ Pass Entrance: ${mb.name}`, '#d7ccc8');
};

window.teleportBehindMountain = function(target = 1) {
  window.teleportToMountain(target, true);
};

window.teleportToMountainValley = function(target = 1) {
  state.devSpawn = true;
  const settingsModal = document.getElementById('settingsModal');
  if(settingsModal) settingsModal.classList.remove('open');
  const pauseMenu = document.getElementById('pauseMenu');
  if(pauseMenu) pauseMenu.style.display = 'none';

  if(!gameStarted || gameOver) {
    const campOverlay = document.getElementById('campOverlay');
    if(campOverlay) campOverlay.style.display = 'none';
    startGame();
  }
  paused = false;
  if(typeof chunks !== 'undefined' && chunks.clear) chunks.clear();

  const mb = getMountainBiomeTarget(target);
  player.x = mb.valleyCenter.x;
  player.y = mb.valleyCenter.y;
  camera.x = player.x - VW() / 2;
  camera.y = player.y - VH() / 2;
  playSfx('confirm');
    showDropToast(`🏞️ Inside: ${mb.name}`, '#81c784');
};

document.getElementById('btnTestMountainTeleport')?.addEventListener('click', () => {
  const sel = document.getElementById('devMountainBiomeSelect');
  const t = sel ? sel.value : 1;
  window.teleportToMountain(t, false);
});

document.getElementById('btnTestMountainValleyTeleport')?.addEventListener('click', () => {
  const sel = document.getElementById('devMountainBiomeSelect');
  const t = sel ? sel.value : 1;
  window.teleportToMountainValley(t);
});

document.getElementById('btnDevTeleportMountainEntrance')?.addEventListener('click', () => {
  const sel = document.getElementById('devMountainBiomeSelect');
  const t = sel ? sel.value : 1;
  window.teleportToMountain(t, false);
});

document.getElementById('btnDevTeleportMountainValley')?.addEventListener('click', () => {
  const sel = document.getElementById('devMountainBiomeSelect');
  const t = sel ? sel.value : 1;
  window.teleportToMountainValley(t);
});

document.getElementById('btnDevSpawnMountainMobs')?.addEventListener('click', () => {
  const sel = document.getElementById('devMountainBiomeSelect');
  const t = sel ? Number(sel.value) : 1;
  const settingsModal = document.getElementById('settingsModal');
  if(settingsModal) settingsModal.classList.remove('open');
  const pauseMenu = document.getElementById('pauseMenu');
  if(pauseMenu) pauseMenu.style.display = 'none';
  if(!gameStarted || gameOver) {
    const campOverlay = document.getElementById('campOverlay');
    if(campOverlay) campOverlay.style.display = 'none';
    startGame();
  }
  paused = false;
  if(window.spawnMountainMobs) {
    const res = window.spawnMountainMobs(t, 4);
    if(res && res.length) {
      showDropToast(`⚔️ Spawned ${res.length} Mountain ${t} Mobs!`, '#ff5252');
    }
  }
});

window.teleportToDungeon = function() {
  state.devSpawn = true;
  const settingsModal = document.getElementById('settingsModal');
  if(settingsModal) settingsModal.classList.remove('open');
  const pauseMenu = document.getElementById('pauseMenu');
  if(pauseMenu) pauseMenu.style.display = 'none';

  if(!gameStarted || gameOver) {
    const campOverlay = document.getElementById('campOverlay');
    if(campOverlay) campOverlay.style.display = 'none';
    startGame();
  }
  paused = false;
  if(typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
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
  camera.x = player.x - VW() / 2;
  camera.y = player.y - VH() / 2;
  playSfx('confirm');
    showDropToast("Entered The Depths (Dungeon 1)!", '#ffd54f');
};

window.teleportToSurface = function() {
  
  if (window.brokenWalls) window.brokenWalls.clear();
  if (typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
  if (window.lastSurfacePos) {
    player.x = window.lastSurfacePos.x;
    player.y = window.lastSurfacePos.y;
  } else {
    player.x = 0;
    player.y = 0;
  }
  camera.x = player.x - VW() / 2;
  camera.y = player.y - VH() / 2;
  playSfx('confirm');
    showDropToast("Returned to Surface.", '#88ff88');
};

document.getElementById('btnTestDungeonTeleport')?.addEventListener('click', () => {
  state.devSpawn = true;
  window.teleportToDungeon();
});
// ==========================================

document.querySelectorAll('[data-close-modal]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.closeModal)?.classList.remove('open')));
document.querySelectorAll('.menu-modal').forEach(modal=>modal.addEventListener('click',event=>{if(event.target!==modal)return;if(modal.id==='npcModal'){closeNPCModal();return;}modal.classList.remove('open');}));
document.getElementById('fullscreenToggle').addEventListener('click',async()=>{
  try{
    if(document.fullscreenElement)await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  }catch{showCampMessage('Fullscreen is not available in this browser.');}
  updateFullscreenButton();
});
document.addEventListener('fullscreenchange',updateFullscreenButton);


updateFullscreenButton();
document.getElementById('resumeButton').addEventListener('click',()=>{
  paused=false;document.getElementById('pauseMenu').style.display='none';
});
function returnToCamp(){
  if(!gameStarted||gameOver)return;
  if(state.isInDream){
    tryToAwake();
    return;
  }
  if(carriedRelic&&carriedRelic.timeRemaining>0){updateCampReturnLock();return;}
  if (state.savedChickenWeapons && state.savedChickenWeapons.length > 0) {
    playerWeapons.splice(0, playerWeapons.length, ...state.savedChickenWeapons.map(w => ({ ...w, timer: 0 })));
    state.savedChickenWeapons = null;
  }
  if (player.x > 910000 * TILE && player.x < 990000 * TILE && window.lastSurfacePos) {
    player.x = window.lastSurfacePos.x;
    player.y = window.lastSurfacePos.y;
  }
  playSfx('confirm');
    if (window.resetMinimapView) window.resetMinimapView();
  const rewardMessage=settleCampRun(true);
  try {
    const wx = Math.floor((player.x + player.w/2) / TILE);
    const wy = Math.floor((player.y + player.h/2) / TILE);
    recordRunLog({
      ts: Date.now(),
      outcome: 'return_to_camp',
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
      causeOfDeath: null,
      mount: campSave.equippedMount || null,
      companion: (campSave.companions || [])[0] || null
    });
  } catch(err) {
    console.warn('Failed to record run log on returnToCamp:', err);
  }
  const wx=Math.floor((player.x+player.w/2)/TILE),wy=Math.floor((player.y+player.h/2)/TILE);
  const currentSceneId=resolveCampSceneId(biomeAt(wx,wy),wx,wy);
  campSave.campBiome=currentSceneId;
  if(!campSave.unlockedCamps)campSave.unlockedCamps=['plains'];
  if(!campSave.unlockedCamps.includes(currentSceneId))campSave.unlockedCamps.push(currentSceneId);
  campSave.campX=player.x;
  campSave.campY=player.y;
  gameOver=true;
  paused=false;
  campSave.runProgress = createRunProgress();
  hasResumableProgress = true;
  saveCamp();
  try{
    sessionStorage.setItem('pixelvivor.returnedFromBiome', currentSceneId);
    sessionStorage.setItem('pixelvivor.campReturnMessage',`You returned safely. ${rewardMessage}`);
    sessionStorage.setItem('pixelvivor.lastRunHpRatio', (player && player.maxHp ? (player.hp / player.maxHp).toFixed(2) : '1'));
  }catch(error){
    console.warn('Camp return message could not be saved.',error);
  }
  localStorage.setItem("pixelvivor.skipStartMenuTime", Date.now().toString());
localStorage.setItem("pixelvivor.skipStartMenu", "true");
window.location.replace(window.location.pathname);
}
window.returnToCamp = returnToCamp;
document.getElementById('returnToCampPause').addEventListener('click', () => {
  if (state.isInDream) {
    tryToAwake();
    return;
  }
  returnToCamp();
});
document.getElementById('hudReturnToCampBtn')?.addEventListener('click', (e) => {
  if (state.isInDream) {
    e.preventDefault();
    e.stopPropagation();
    tryToAwake();
    return;
  }
  returnToCamp();
});
document.getElementById('returnToCamp').addEventListener('click',()=>{
  playSfx('confirm');
    try{
    sessionStorage.removeItem('pixelvivor.returnedFromBiome');
    sessionStorage.setItem('pixelvivor.lastRunHpRatio', '0');
    sessionStorage.setItem('pixelvivor.campReturnMessage', 'You dragged yourself back to camp after defeat.');
  }catch(e){}
  localStorage.setItem("pixelvivor.skipStartMenuTime", Date.now().toString());
  localStorage.setItem("pixelvivor.skipStartMenu", "true");
  window.location.replace(window.location.pathname);
});
  const exitMenuBtn = document.getElementById('exitToMainMenuBtn');
if (exitMenuBtn) {
  exitMenuBtn.addEventListener('click', () => {
    playSfx('confirm');
      try { sessionStorage.removeItem('pixelvivor.returnedFromBiome'); } catch(e){}
    localStorage.removeItem("pixelvivor.skipStartMenu");
    localStorage.removeItem("pixelvivor.skipStartMenuTime");
    window.location.replace(window.location.pathname);
  });
}
document.querySelectorAll('.camp-tab').forEach(button=>button.addEventListener('click',()=>{
  playSfx('confirm');
    campTab=button.dataset.tab;renderCamp();showCampMessage('');
}));
document.getElementById('campAvatarBtn')?.addEventListener('click',()=>{
  const idx=PLAYABLE_CHARACTERS.findIndex(c=>c.id===campSave.character);
  const next=PLAYABLE_CHARACTERS[(idx+1)%PLAYABLE_CHARACTERS.length];
  if(next)handleCampAction('character',next.id);
});
document.getElementById('campProfileBanner')?.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(button)handleCampAction(button.dataset.action,button.dataset.id);
});
document.getElementById('campPersistentActions')?.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');
  if(button)handleCampAction(button.dataset.action,button.dataset.id);
});
document.getElementById('campPanel').addEventListener('click',event=>{
  const loreCatBtn=event.target.closest('[data-lore-cat]');
  if(loreCatBtn){
    playSfx('confirm');
      currentLoreCategory=loreCatBtn.dataset.loreCat;
    renderCamp();
    return;
  }
  const invFilterBtn=event.target.closest('[data-inv-filter]');
  if(invFilterBtn){
    playSfx('confirm');
      currentInventoryFilter=invFilterBtn.dataset.invFilter;
    renderCamp();
    return;
  }
  const filterBtn=event.target.closest('[data-quest-filter]');
  if(filterBtn){
    playSfx('confirm');
      document.querySelectorAll('.quest-tab').forEach(b=>b.classList.toggle('active',b===filterBtn));
    // Filter
    const filter=filterBtn.dataset.questFilter;
    document.querySelectorAll('.camp-contract').forEach(card=>{
      if(filter==='all'){card.style.display='';return;}
      const cat=card.dataset.questCategory;
      card.style.display=(cat===filter||(!cat&&filter==='all'))?'':'none';
    });
  }
  const button=event.target.closest('[data-action]');
  if(button)handleCampAction(button.dataset.action,button.dataset.id);
});
renderAtlasIcons(document.getElementById('menu'));
renderAtlasIcons(document.getElementById('pauseMenu'));
renderAtlasIcons(document.getElementById('inventoryPanel'));
renderCamp();
initCampSpeechBubbles();
scheduleNextCampDialogue();
try{
  const returnMessage=sessionStorage.getItem('pixelvivor.campReturnMessage');
  if(returnMessage){
    sessionStorage.removeItem('pixelvivor.campReturnMessage');
    showCampMessage(returnMessage);
    const hpRatioRaw=sessionStorage.getItem('pixelvivor.lastRunHpRatio');
    sessionStorage.removeItem('pixelvivor.lastRunHpRatio');
    const isLowHp=hpRatioRaw!==null?(parseFloat(hpRatioRaw)<0.35):false;
    setTimeout(()=>{
      triggerCampReaction(isLowHp?'return_low_hp':'return_safe');
    },1200);
  }
}catch(error){
  console.warn('Camp return message could not be loaded.',error);
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// PLAYER-ENEMY COLLISION (push-out)
// ═══════════════════════════════════════════════════════════
function resolvePlayerEnemyCollision() {
  if ((player.dashTimer || 0) > 0) return; // Phase through enemies during dash!
  if (player.abilities && player.abilities.includes('ghost_walk')) return; // Ghost Walk ability
  const pr = Math.max(player.w, player.h) * 0.42;   // player radius
  const maxPush = 4;                                 // clamp per frame

  // Run two passes for stability when surrounded using Spatial Grid
  for (let iter = 0; iter < 2; iter++) {
    const pcx = player.x + player.w / 2;
    const pcy = player.y + player.h / 2;
    let pushed = false;

    forEachEnemyNear(pcx, pcy, 64, e => {
      if (e.hp <= 0) return;

      const dx = pcx - e.x;
      const dy = pcy - e.y;
      const d2 = dx * dx + dy * dy;

      const er = Math.max(e.w, e.h) * 0.42;   // enemy radius
      const minDist = pr + er;

      // Quick rejection
      if (d2 >= minDist * minDist) return;

      const dist = Math.sqrt(d2) || 0.001;
      const overlap = Math.min(minDist - dist, maxPush);
      const nx = dx / dist;
      const ny = dy / dist;

      // Push the player with full weight, preventing pushes into walls
      const pushX = nx * overlap;
      const pushY = ny * overlap;
      if (!window.isAreaBlocked(player.x + pushX, player.y, player.w, player.h)) {
        player.x += pushX;
      }
      if (!window.isAreaBlocked(player.x, player.y + pushY, player.w, player.h)) {
        player.y += pushY;
      }
      pushed = true;
    });

    if (!pushed) break;
  }
}
// ═══════════════════════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════════════════════


function updateAbilities(dt){
  if(!player.abilities) return;

  // Shield Bubble - regenerate charges every 8s
  if(player.abilities.includes('shield_bubble')){
    player.shieldBubbleTimer = (player.shieldBubbleTimer || 0) + dt;
    if(player.shieldBubbleTimer >= 8){
      player.shieldBubbleTimer = 0;
      if((player.shieldBubbleCharges || 0) < 1){
        player.shieldBubbleCharges = 1;
        spawnDamageNumber(player.x + player.w/2, player.y - 20, 'SHIELD READY', '#4fc3f7');
      }
    }
  }

  // Random Teleport - every 10s
  if(player.abilities.includes('random_teleport')){
    player.randomTeleportTimer = (player.randomTeleportTimer || 0) + dt;
    if(player.randomTeleportTimer >= 10){
      player.randomTeleportTimer = 0;
      const angle = Math.random() * Math.PI * 2;
      const dist = 5 * TILE;
      const newX = player.x + Math.cos(angle) * dist;
      const newY = player.y + Math.sin(angle) * dist;
      if(!isWallCollision(newX, newY, player.w, player.h)){
        player.x = newX;
        player.y = newY;
        spawnParticles(player.x + player.w/2, player.y + player.h/2, '#9c27b0', 8);
      }
    }
  }

  // Time Freeze - every 60s, 3s freeze
  if(player.abilities.includes('time_freeze')){
    player.timeFreezeTimer = (player.timeFreezeTimer || 0) + dt;
    if(player.timeFreezeActive > 0){
      player.timeFreezeActive -= dt;
      if(player.timeFreezeActive <= 0){
        player.timeFreezeActive = 0;
      }
    } else if(player.timeFreezeTimer >= 60){
      player.timeFreezeTimer = 0;
      player.timeFreezeActive = 3;
      spawnParticles(player.x + player.w/2, player.y + player.h/2, '#00bcd4', 20);
    }
  }

  // Time Dilation - when HP < 25%
  if(player.abilities.includes('time_dilation')){
    player.timeDilationActive = player.hp / player.maxHp < 0.25;
  }

  // Rewind - store history
  if(player.abilities.includes('rewind') && !player.rewindUsed){
    player.rewindHistory = player.rewindHistory || [];
    player.rewindHistory.push({
      x: player.x,
      y: player.y,
      hp: player.hp,
      maxHp: player.maxHp,
      elapsed: elapsed
    });
    if(player.rewindHistory.length > 600){ // Keep 10 seconds at 60fps
      player.rewindHistory.shift();
    }
  }
}


function applyDreamRelicEffects(dt) {
  if (!state.isInDream) return;

  // Track stationary time for Dream Anchor and Tear of the Eye
  if (!player.moving && Math.hypot(player.vx || 0, player.vy || 0) < 0.1) {
    state.dreamStationaryTimer = (state.dreamStationaryTimer || 0) + dt;
  } else {
    state.dreamStationaryTimer = 0;
  }

  // Coffee Bean: Cleanse slows
  if (state.dreamRelics && state.dreamRelics.includes('coffee_bean')) {
    player.slowFactor = 1;
    player.inkSlowTimer = 0;
  }

  // Dream Essence: Heals 2 HP every 5 seconds
  if (state.dreamRelics && state.dreamRelics.includes('dream_essence')) {
    state.dreamEssenceTimer = (state.dreamEssenceTimer || 0) + dt;
    if (state.dreamEssenceTimer >= 5.0) {
      state.dreamEssenceTimer = 0;
      if (player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + 2);
        spawnDamageNumber(player.x + player.w/2, player.y - 10, '+2 HP', '#69f0ae');
      }
    }
  }

  // Tear of the Eye: Regenerates 1 HP/s if standing still for 3s
  if (state.dreamRelics && state.dreamRelics.includes('tear_of_eye')) {
    if ((state.dreamStationaryTimer || 0) >= 3.0) {
      player._tearRegenTimer = (player._tearRegenTimer || 0) + dt;
      if (player._tearRegenTimer >= 1.0) {
        player._tearRegenTimer = 0;
        if (player.hp < player.maxHp) {
          player.hp = Math.min(player.maxHp, player.hp + 1);
          spawnDamageNumber(player.x + player.w/2, player.y - 10, '+1 HP', '#64ffda');
        }
      }
    } else {
      player._tearRegenTimer = 0;
    }
  }

  // Dream Catcher: Slow enemies by 20% within 3 tiles (120px)
  if (state.dreamRelics && state.dreamRelics.includes('dream_catcher')) {
    forEachEnemyNear(player.x + player.w/2, player.y + player.h/2, 120, e => {
      if (e && e.hp > 0) {
        e.dreamCatcherSlow = true;
      }
    });
  }
}

function applyPlayerDamage(dmg, source='unknown', color='#ff5252', opts=null){
  if(maskOfCalmActive) return;
  // Shield Bubble ability check
  if(player.abilities && player.abilities.includes('shield_bubble') && player.shieldBubbleCharges > 0){
    player.shieldBubbleCharges--;
    spawnDamageNumber(player.x + player.w/2, player.y - 10, 'BLOCKED', '#4fc3f7');
    spawnParticles(player.x + player.w/2, player.y + player.h/2, '#4fc3f7', 6);
    return;
  }

  if(state.isInDream){
    // Dream mobs deal very little damage so the player survives easily
    dmg = Math.max(1, Math.min(3, Math.round(dmg * 0.15)));

    // Stitched Button: -2 flat points
    if(state.dreamRelics && state.dreamRelics.includes('stitched_button')){
      dmg = Math.max(1, dmg - 2);
    }

    // Dream Anchor: +50% defense while standing still
    if(state.dreamRelics && state.dreamRelics.includes('dream_anchor') && (state.dreamStationaryTimer || 0) >= 0.2){
      dmg = Math.max(1, Math.round(dmg * 0.5));
    }

    // Nightmare Shard: -10% defense
    if(state.dreamRelics && state.dreamRelics.includes('nightmare_shard')){
      dmg = Math.max(1, Math.round(dmg * 1.1));
    }

    // Sandman's Dust: 10% chance to stun attacker
    if(state.dreamRelics && state.dreamRelics.includes('sandman_dust') && Math.random() < 0.10){
      forEachEnemyNear(player.x + player.w/2, player.y + player.h/2, 90, e => {
        if(e && e.hp > 0){
          e.frozen = true;
          e.frozenTimer = 2.5;
          spawnDamageNumber(e.x, e.y - 20, 'ASLEEP!', '#ba68c8');
        }
      });
    }

    // Reality Tear: Radial knockback shockwave upon taking damage
    if(state.dreamRelics && state.dreamRelics.includes('reality_tear')){
      spawnParticles(player.x + player.w/2, player.y + player.h/2, '#e040fb', 20);
      spawnDamageNumber(player.x + player.w/2, player.y - 25, 'TEAR BLAST!', '#e040fb');
      forEachEnemyNear(player.x + player.w/2, player.y + player.h/2, 130, e => {
        if(e && e.hp > 0){
          const dx = e.x - (player.x + player.w/2);
          const dy = e.y - (player.y + player.h/2);
          const d = Math.hypot(dx, dy) || 1;
          e.x += (dx / d) * 60;
          e.y += (dy / d) * 60;
          e.hp -= 20;
          spawnDamageNumber(e.x, e.y - 10, '20', '#e040fb');
        }
      });
    }

    player.invulnTimer = Math.max(player.invulnTimer || 0, 0.45);
    if(state.isStruggling){
      state.isStruggling = false;
      state.struggleTimer = 0;
    }
  }
  const isCasual = (typeof window !== 'undefined' && window.GAME_SETTINGS?.difficulty === 0);
  if (isCasual && !state.isInDream) {
    dmg = Math.max(1, Math.round(dmg * 0.75));
  }
  if (!player.secondWindUsed && player.hp > 0 && (player.hp - dmg) > 0 && (player.hp - dmg) <= player.maxHp * 0.25) {
    player.secondWindUsed = true;
    player.secondWindTimer = 3.5;
    player.invulnTimer = Math.max(player.invulnTimer || 0, 1.2);
    spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ffd700', 25);
    spawnDamageNumber(player.x + player.w/2, player.y - 35, '🛡️ SECOND WIND!', '#ffd700');
    playSfx('confirm');
    forEachEnemyNear(player.x + player.w/2, player.y + player.h/2, 110, e => {
      if (e && e.hp > 0 && !e.boss) {
        const dx = e.x - (player.x + player.w/2);
        const dy = e.y - (player.y + player.h/2);
        const d = Math.hypot(dx, dy) || 1;
        e.x += (dx / d) * 75;
        e.y += (dy / d) * 75;
        e.hitFlash = 0.2;
      }
    });
  }
  questProgress.noDamageTime = 0;
  questProgress.tookDamage = true;
  const srcKey = source || 'unknown';
  state.lastDamageSource = srcKey;
  if (!state.damageBySource) state.damageBySource = {};
  state.damageBySource[srcKey] = (state.damageBySource[srcKey] || 0) + Math.round(dmg);
  const rawIncoming = (opts && typeof opts.rawDmg === 'number') ? opts.rawDmg : dmg;
  state.rawDamageTakenRun = (state.rawDamageTakenRun || 0) + rawIncoming;
  state.effectiveDamageTakenRun = (state.effectiveDamageTakenRun || 0) + dmg;
  state.totalDamageTakenRun = state.effectiveDamageTakenRun;
  if (!state.recentHitBuffer) state.recentHitBuffer = [];
  state.recentHitBuffer.push({ t: elapsed, source: srcKey, effective: Math.round(dmg) });
  if (state.recentHitBuffer.length > 80) state.recentHitBuffer.shift();
  player.hp -= dmg;
  const displayDmg = Math.round(dmg);
  if (displayDmg > 0) {
    playSfx('hurt');
    if(window.GAME_SETTINGS.screenShake) screenShakeIntensity = Math.min(30, screenShakeIntensity + dmg * 0.8);
    spawnDamageNumber(player.x + player.w/2, player.y - 10, displayDmg, color);
  }
  if(player.hp <= 0 && !gameOver){
    if(state.isInDream){
      state.awakeningProgress = 100;
      exitDream(true);
      return;
    }
    // Rewind ability check
    if(player.abilities && player.abilities.includes('rewind') && !player.rewindUsed && player.rewindHistory && player.rewindHistory.length > 0){
      player.rewindUsed = true;
      const state = player.rewindHistory[0];
      player.x = state.x;
      player.y = state.y;
      player.hp = state.hp;
      player.maxHp = state.maxHp;
      elapsed = state.elapsed;
      player.rewindHistory = [];
      spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ff9800', 20);
      spawnDamageNumber(player.x + player.w/2, player.y - 30, 'REWIND!', '#ff9800');
      return;
    }
    player.hp = 0;
    gameOver = true;
    showGameOver();
  }
}

// ═══════════════════════════════════════════════════════════
// MOVEMENT MODES: FREE & GRID (DUNGEON)
// ═══════════════════════════════════════════════════════════
const DUNGEON_MOVEMENT_MODE = 'free'; // 'free' ή 'grid'
window.DUNGEON_MOVEMENT_MODE = DUNGEON_MOVEMENT_MODE;
window.enterDream = enterDream;
window.exitDream = exitDream;
window.tryToAwake = tryToAwake;

function getTileSpeedMultiplier(tx, ty) {
  const dung = window.DUNGEON1_DATA;
  if (dung && dung.water) {
    if (ty >= 0 && ty < dung.height && tx >= 0 && tx < dung.width) {
      if (dung.water[ty][tx] === '1') {
        return 0.5;
      }
    }
  }
  return 1.0;
}

function tryGridMove(dx, dy) {
  if (player.moving) return false;

  const targetX = player.tileX + dx;
  const targetY = player.tileY + dy;

  // Check bounds + collision
  const dung = window.DUNGEON1_DATA;
  if (dung) {
    if (targetY < 0 || targetY >= dung.height) return false;
    if (targetX < 0 || targetX >= dung.width) return false;
    if (window.isTileBlocked(200000 + targetX, 200000 + targetY)) return false;
  }

  // Set facing direction
  if (dx > 0) player.facing = 1;
  else if (dx < 0) player.facing = -1;
  if (dy < 0) player.facingY = -1;
  else if (dy > 0) player.facingY = 1;
  else if (dx) player.facingY = 0;
  player.lastMoveX = dx;
  player.lastMoveY = dy;

  // Water slow & stat multipliers
  const waterMult = getTileSpeedMultiplier(targetX, targetY);
  const activeMount = getActiveMount();
  const mountSpeedMult = activeMount?.speedMult || 1;
  const dashMult = (player.dashTimer > 0) ? 2.5 : 1;
  const featherMult = (state.isInDream && state.dreamRelics && state.dreamRelics.includes('lucid_feather')) ? 1.15 : 1.0;
  const effSpeedMult = (player.speed / 2.8) * (relicModifiers?.speed || 1) * (player.slowFactor || 1) * mountSpeedMult * dashMult * waterMult * featherMult;

  // Base move duration: 0.15s (150ms per tile)
  player.moveDuration = 0.15 / Math.max(0.2, effSpeedMult);

  // Start movement
  player.moveFrom = { x: player.tileX, y: player.tileY };
  player.moveTo = { x: targetX, y: targetY };
  player.moveProgress = 0;
  player.moving = true;
  player.walkTimer = 0;
  return true;
}

function updateGridMovement(dt) {
  const DUNGEON_OFFSET_X = 200000;
  const DUNGEON_OFFSET_Y = 200000;

  // Sync / initialize grid position if needed
  if (player.tileX === undefined || player.pixelX === undefined) {
    player.tileX = Math.round(player.x / TILE) - DUNGEON_OFFSET_X;
    player.tileY = Math.round(player.y / TILE) - DUNGEON_OFFSET_Y;
    const dung = window.DUNGEON1_DATA;
    if (dung) {
      player.tileX = Math.max(0, Math.min(dung.width - 1, player.tileX));
      player.tileY = Math.max(0, Math.min(dung.height - 1, player.tileY));
    }
    player.pixelX = (DUNGEON_OFFSET_X + player.tileX) * TILE;
    player.pixelY = (DUNGEON_OFFSET_Y + player.tileY) * TILE;
    player.x = player.pixelX;
    player.y = player.pixelY;
    player.moveFrom = { x: player.tileX, y: player.tileY };
    player.moveTo = { x: player.tileX, y: player.tileY };
    player.moveProgress = 1;
    player.moving = false;
  }

  // Dash timer
  if (player.dashCooldown > 0) player.dashCooldown -= dt;
  if (player.dashTimer > 0) {
    player.dashTimer -= dt;
    if (Math.random() < 0.65) {
      spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#80d8ff', 2);
    }
  }

  function checkGridInput() {
    if (player.moving) return;

    // 1. Keyboard input
    let keyDx = 0, keyDy = 0;
    if (keys['w'] || keys['arrowup']) keyDy = -1;
    else if (keys['s'] || keys['arrowdown']) keyDy = 1;
    if (keys['a'] || keys['arrowleft']) keyDx = -1;
    else if (keys['d'] || keys['arrowright']) keyDx = 1;

    if (keyDx !== 0 || keyDy !== 0) {
      if (keyDx !== 0 && keyDy !== 0) {
        // Diagonal input: attempt preferred axis, fallback to secondary if blocked
        const preferY = (player.lastMoveY !== 0 && player.lastMoveX === 0);
        const first = preferY ? [0, keyDy] : [keyDx, 0];
        const second = preferY ? [keyDx, 0] : [0, keyDy];
        if (!tryGridMove(first[0], first[1])) {
          tryGridMove(second[0], second[1]);
        }
      } else {
        tryGridMove(keyDx, keyDy);
      }
      return;
    }

    // 2. Mouse hold-to-walk with smart corner assist
    if (mouseDown) {
      const targetX = (mouseScreenX / viewZoom()) + camera.x;
      const targetY = (mouseScreenY / viewZoom()) + camera.y;
      const px = player.x + player.w / 2;
      const py = player.y + player.h / 2;
      const diffX = targetX - px, diffY = targetY - py;
      const absX = Math.abs(diffX), absY = Math.abs(diffY);

      let primaryDx = 0, primaryDy = 0;
      let secondaryDx = 0, secondaryDy = 0;

      if (absX >= absY) {
        if (absX > 15) primaryDx = diffX > 0 ? 1 : -1;
        if (absY > 15) secondaryDy = diffY > 0 ? 1 : -1;
      } else {
        if (absY > 15) primaryDy = diffY > 0 ? 1 : -1;
        if (absX > 15) secondaryDx = diffX > 0 ? 1 : -1;
      }

      // Try primary direction first; if blocked against a wall/corner, fallback to secondary
      if (primaryDx !== 0 || primaryDy !== 0) {
        if (!tryGridMove(primaryDx, primaryDy)) {
          if (secondaryDx !== 0 || secondaryDy !== 0) {
            tryGridMove(secondaryDx, secondaryDy);
          }
        }
      } else if (secondaryDx !== 0 || secondaryDy !== 0) {
        tryGridMove(secondaryDx, secondaryDy);
      }
    }
  }

  // 1. Handle input if idle
  if (!player.moving) {
    checkGridInput();
  }

  // 2. Animate movement
  if (player.moving) {
    player.moveProgress += dt / (player.moveDuration || 0.15);

    if (player.moveProgress >= 1) {
      // Movement complete
      player.tileX = player.moveTo.x;
      player.tileY = player.moveTo.y;
      player.pixelX = (DUNGEON_OFFSET_X + player.tileX) * TILE;
      player.pixelY = (DUNGEON_OFFSET_Y + player.tileY) * TILE;
      player.moving = false;
      player.moveProgress = 1;
      player.walkTimer = 0;

      // Continuous input check for seamless walking
      checkGridInput();
    } else {
      // Smooth interpolation using lerp
      const t = player.moveProgress;
      player.pixelX = lerp((DUNGEON_OFFSET_X + player.moveFrom.x) * TILE, (DUNGEON_OFFSET_X + player.moveTo.x) * TILE, t);
      player.pixelY = lerp((DUNGEON_OFFSET_Y + player.moveFrom.y) * TILE, (DUNGEON_OFFSET_Y + player.moveTo.y) * TILE, t); player.walkTimer += dt; if (gameStarted && !paused && !gameOver) playSfx(player.inWater > 0 ? 'step_water' : 'step_land');
      player.walkTimer += dt;
    }
  }

  // 3. Update player.x, player.y from pixelX, pixelY
  player.x = player.pixelX;
  player.y = player.pixelY;

  // 4. Water detection in dungeon
  const pcx = Math.floor((player.x + player.w / 2) / TILE);
  const pcy = Math.floor((player.y + player.h - 4) / TILE);
  player.inWater = window.isWaterTile(pcx, pcy) ? 2 : 0;
  if (player.inWater !== player.wasInWater) {
    if (player.inWater > 0) { spawnSplash(player.x + player.w / 2, player.y + player.h, player.inWater === 2); if ((player.wasInWater || 0) === 0) playSfx('splash_enter'); } else if ((player.wasInWater || 0) > 0) { playSfx('splash_exit'); }
    player.wasInWater = player.inWater;
  }
}

function updateFreeMovement(dt) {
  // Water tracking (Overworld + Dungeon 1, with flying mount and shore smoothing)
  const pcx = Math.floor((player.x + player.w / 2) / TILE);
  const pcy = Math.floor((player.y + player.h - 4) / TILE);
  const inAbyss = (pcx > 700000 && pcx < 900000 && pcy > 700000 && pcy < 900000);
  const inDungeon = (pcx > 100000 && pcx < 300000);
  const activeMount = getActiveMount();
  if (inAbyss || activeMount?.flying) {
    player.inWater = 0;
  } else if (inDungeon) {
    player.inWater = window.isWaterTile(pcx, pcy) ? 2 : 0;
  } else {
    let d = typeof tileAtWorld === 'function' ? tileAtWorld(pcx, pcy) : 0;
    if (d === 2 && typeof tileAtWorld === 'function') {
      const hasLand = (tileAtWorld(pcx + 1, pcy) === 0 || tileAtWorld(pcx - 1, pcy) === 0 || tileAtWorld(pcx, pcy + 1) === 0 || tileAtWorld(pcx, pcy - 1) === 0);
      if (hasLand) d = 1;
    }
    player.inWater = d;
  }
  if(player.inWater !== player.wasInWater){
    if(player.inWater > 0 && !activeMount?.flying) { spawnSplash(player.x + player.w / 2, player.y + player.h, player.inWater === 2); if((player.wasInWater || 0) === 0) playSfx('splash_enter'); } else if(player.inWater === 0 && (player.wasInWater || 0) > 0 && !activeMount?.flying) { playSfx('splash_exit'); }
    player.wasInWater = player.inWater;
  }
  const mountSpeedMult = activeMount?.speedMult || 1;
  const dashMult = (player.dashTimer > 0) ? 2.5 : 1;
  const iceWalk = Boolean(player.hasIceBridge); const wSlowBase=(activeMount?.flying || iceWalk)?1:(player.inWater===2 ? .5 : player.inWater===1 ? .72 : 1); if(iceWalk && player.inWater > 0 && !activeMount?.flying && (!player._lastIceTrailAt || performance.now() - player._lastIceTrailAt > 95)) { player._lastIceTrailAt = performance.now(); spawnParticles(player.x + player.w/2, player.y + player.h - 2, '#b3e5fc', 3); }
  const wSlow=inAbyss ? 1 : (1-(1-wSlowBase)*player.waterSlowMultiplier);

  // Movement
  let mx=0,my=0;
  if (window.GAME_SETTINGS.manualAim) {
    if(keys['a']||keys['arrowleft']) player.aimDirX = -1; else if(keys['d']||keys['arrowright']) player.aimDirX = 1; else player.aimDirX = 0;
    if(keys['w']||keys['arrowup']) player.aimDirY = -1; else if(keys['s']||keys['arrowdown']) player.aimDirY = 1; else player.aimDirY = 0;
    if (!player.aimDirX && !player.aimDirY) { player.aimDirX = player.lastMoveX || 1; player.aimDirY = player.lastMoveY || 0; }
  } else {
    if(keys['a']||keys['arrowleft'])mx-=1;
    if(keys['d']||keys['arrowright'])mx+=1;
    if(keys['w']||keys['arrowup'])my-=1;
    if(keys['s']||keys['arrowdown'])my+=1;
  }
    
  if (mouseDown) {
    const targetX = (mouseScreenX / viewZoom()) + camera.x;
    const targetY = (mouseScreenY / viewZoom()) + camera.y;
    const px = player.x + player.w/2;
    const py = player.y + player.h/2;
    const dx = targetX - px, dy = targetY - py;
    const mag = Math.hypot(dx, dy);
    if (mag > 5) {
      mx = dx / mag;
      my = dy / mag;
    }
  } else if(mx&&my){
    mx*=.707;my*=.707;
  }
  if (player.dashCooldown > 0) player.dashCooldown -= dt;
  if (player.dashTimer > 0) {
    player.dashTimer -= dt;
    mx = Number.isFinite(player.dashDirX) ? player.dashDirX : (player.facing || 1);
    my = Number.isFinite(player.dashDirY) ? player.dashDirY : 0;
    if (Math.random() < 0.65) {
      spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#80d8ff', 2);
    }
  }
  player.moving=(mx!==0||my!==0);
  if(player.dashTimer <= 0) {
    player.lastMoveX = mx;
    player.lastMoveY = my;
  }
  if(player.moving){
    player.walkTimer+=dt;
    if(mx>0)player.facing=1;
    if(mx<0)player.facing=-1;
    if(my<0)player.facingY=-1;else if(my>0)player.facingY=1;else if(mx)player.facingY=0; if(gameStarted && !paused && !gameOver && (player.dashTimer || 0) <= 0 && !activeMount?.flying) playSfx(player.inWater > 0 ? 'step_water' : 'step_land');
  }else player.walkTimer=0;
  if (player.inkSlowTimer > 0) { player.inkSlowTimer = Math.max(0, player.inkSlowTimer - dt); }
  const inkMult = player.inkSlowTimer > 0 ? 0.72 : 1.0;
  const featherMult = (state.isInDream && state.dreamRelics && state.dreamRelics.includes('lucid_feather')) ? 1.15 : 1.0;
  const chickenLegMult = (player.chickenLegTimer && player.chickenLegTimer > 0) ? 1.50 : 1.0;
  const secondWindMult = (player.secondWindTimer && player.secondWindTimer > 0) ? 1.25 : 1.0;
  const effSpeed=player.speed*relicModifiers.speed*player.slowFactor*wSlow*mountSpeedMult*dashMult*(inAbyss?0.95:1)*inkMult*featherMult*chickenLegMult*secondWindMult;

  // Velocity-based sub-pixel movement
  player.vx = mx * effSpeed;
  player.vy = my * effSpeed;

  const moveDx = player.vx * 60 * dt;
  const moveDy = player.vy * 60 * dt;

  // Separate X / Y movement for smooth corner sliding with doorway nudging
  if (moveDx !== 0) {
    if (!window.isAreaBlocked(player.x + moveDx, player.y, player.w, player.h)) {
      player.x += moveDx;
    } else {
      // Corner nudge on Y (if slightly hitting the top/bottom rim of a 1-tile door or corridor)
      const nudgeStep = Math.min(Math.abs(moveDx), 2.5);
      let nudged = false;
      for (let offset = 2; offset <= 8; offset += 2) {
        if (!window.isAreaBlocked(player.x + moveDx, player.y - offset, player.w, player.h)) {
          player.y -= nudgeStep;
          nudged = true;
          break;
        }
        if (!window.isAreaBlocked(player.x + moveDx, player.y + offset, player.w, player.h)) {
          player.y += nudgeStep;
          nudged = true;
          break;
        }
      }
      if (nudged && !window.isAreaBlocked(player.x + moveDx, player.y, player.w, player.h)) {
        player.x += moveDx;
      }
    }
  }
  if (moveDy !== 0) {
    if (!window.isAreaBlocked(player.x, player.y + moveDy, player.w, player.h)) {
      player.y += moveDy;
    } else {
      // Corner nudge on X (if slightly hitting the left/right rim of a 1-tile door or corridor)
      const nudgeStep = Math.min(Math.abs(moveDy), 2.5);
      let nudged = false;
      for (let offset = 2; offset <= 8; offset += 2) {
        if (!window.isAreaBlocked(player.x - offset, player.y + moveDy, player.w, player.h)) {
          player.x -= nudgeStep;
          nudged = true;
          break;
        }
        if (!window.isAreaBlocked(player.x + offset, player.y + moveDy, player.w, player.h)) {
          player.x += nudgeStep;
          nudged = true;
          break;
        }
      }
      if (nudged && !window.isAreaBlocked(player.x, player.y + moveDy, player.w, player.h)) {
        player.y += moveDy;
      }
    }
  }

  // Keep grid variables synced in case mode switches
  player.pixelX = player.x;
  player.pixelY = player.y;
  player.tileX = Math.round(player.x / TILE) - 200000;
  player.tileY = Math.round(player.y / TILE) - 200000;
}

function updatePlayerMovement(dt) {
  if (state.isStruggling) {
    player.moving = false;
    return;
  }
  const inDungeon = (player.x > 100000 * TILE && player.x < 300000 * TILE);
  const mode = window.DUNGEON_MOVEMENT_MODE || DUNGEON_MOVEMENT_MODE;
  if (inDungeon && mode === 'grid') {
    updateGridMovement(dt);
  } else {
    updateFreeMovement(dt);
  }
}



function enterDream() {
  if (state.isInDream) return;
  state.isInDream = true;
  state.dreamTimer = 0;
  state.nightmareLevel = 1;
  state.awakeningProgress = 0;
  state.dreamKills = 0;
  state.isStruggling = false;
  state.struggleTimer = 0;
  state.wakeAlarmBuff = 0;
  state.sandmanSpawned = false;
  state.savedDreamReturnPos = { x: player.x, y: player.y };
  carriedRelic = null;
  state.dreamRelics = [];
  if (typeof window.updateDreamRelicHUD === 'function') window.updateDreamRelicHUD();

  enemies.length = 0;
  xpGems.length = 0;
  projectiles.length = 0;
  const pmEl = document.getElementById('pauseMenu');
  if (pmEl) pmEl.style.display = 'none';
  paused = false;
  updateCampReturnLock();

  let overlay = document.getElementById('dreamTransitionOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'dreamTransitionOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;transition:opacity 0.9s ease;opacity:0;background:#000;';
    document.body.appendChild(overlay);
  }

  overlay.style.background = '#000000';
  overlay.style.opacity = '1';

  setTimeout(() => {
    const spawn = findCampSpawn('dream');
    // Spawn right outside the entrance of the Dream Shop at (600000*TILE, 600000*TILE)
    player.x = spawn.x;
    player.y = spawn.y + 35;
    player.tileX = Math.floor(player.x / TILE);
    player.tileY = Math.floor(player.y / TILE);
    camera.x = player.x - VW() / 2;
    camera.y = player.y - VH() / 2;

    // Invalidate cached Dream Shop chunks so decor around shop is cleanly cleared
    for (let dcx = 74997; dcx <= 75003; dcx++) {
      for (let dcy = 74997; dcy <= 75003; dcy++) {
        chunks.delete(`${dcx},${dcy}`);
      }
    }

    // Roll Dream Shop items: 5 random weapons & 5 upgrades
    state.dreamCoins = 0;
    state.dreamCoinPickups = [];

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

    overlay.style.background = 'radial-gradient(circle, rgba(138,43,226,0.14) 0%, rgba(20,5,35,0.48) 100%)';
    overlay.style.opacity = '1';
    playSfx('relic');
  }, 900);
}

function exitDream(loseLoot = false) {
  if (!state.isInDream) return;
  state.isInDream = false;
  state.awakeningProgress = 0;
  state.nightmareLevel = 1;
  state.dreamTimer = 0;
  state.isStruggling = false;
  state.sandmanSpawned = false;
  state.consecutiveSleeps = 0;
  state.sleepDebt = 0;
  state.dreamRelics = [];
  state.dreamRelicPickups = [];
  if (typeof window.updateDreamRelicHUD === 'function') window.updateDreamRelicHUD();
  state.dreamStationaryTimer = 0;
  state.dreamEssenceTimer = 0;
  state.dreamCoins = 0;
  state.dreamCoinPickups = [];
  state.dreamShopStock = null;
  const dModal = document.getElementById('dreamShopModal');
  if (dModal) dModal.style.display = 'none';

  updateCampReturnLock();

  let overlay = document.getElementById('dreamTransitionOverlay');
  if (overlay) {
    overlay.style.background = loseLoot ? 'rgba(255, 30, 30, 0.55)' : '#ffffff';
    overlay.style.opacity = '0.9';
  }

  enemies.length = 0;
  xpGems.length = 0;
  projectiles.length = 0;

  const campBiome = campSave.campBiome || 'plains';
  const campSpawn = findCampSpawn(campBiome);

  if (!loseLoot) {
    // 100% Awakening: Wake up at camp with FULL HEALTH!
    player.x = campSpawn.x;
    player.y = campSpawn.y;
    player.hp = player.maxHp;
    showDropToast('✨ Awakening complete! You wake up at camp with full health.', '#00e5ff');
    playSfx('levelUp');
  } else {
    // Died in dream or woke via Lucid Bell: Wake up at camp with 1 HP!
    player.x = campSpawn.x;
    player.y = campSpawn.y;
    player.hp = 1;
    showDropToast('You awaken gasping for breath at camp with 1 HP...', '#ff5252');
    playSfx('hurt');
  }

  player.tileX = Math.floor(player.x / TILE);
  player.tileY = Math.floor(player.y / TILE);
  camera.x = player.x - VW() / 2;
  camera.y = player.y - VH() / 2;

  setTimeout(() => {
    if (overlay) {
      overlay.style.opacity = '0';
    }
  }, 800);
}

function tryToAwake() {
  if (!state.isInDream || state.isStruggling) return;
  state.isStruggling = true;
  state.struggleTimer = 1.0;
  state.awakeningProgress = Math.min(100, (state.awakeningProgress || 0) + 10);
  player.invulnTimer = 0.3;
  playSfx('hurt');
  spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ffffff', 14);
  spawnDamageNumber(player.x + player.w/2, player.y - 20, '+10 AWAKE', '#00e5ff');
  if (state.awakeningProgress >= 100) {
    exitDream(false);
  }
}

export {
  tryInteractDreamShop,
  applyDreamRelicEffects,
  enterDream,
  exitDream,
  tryToAwake,
  tryPlayerDash,
  startGame,
  openMenuModal,
  updateFullscreenButton,
  returnToCamp,
  resolvePlayerEnemyCollision,
  updateAbilities,
  applyPlayerDamage,
  DUNGEON_MOVEMENT_MODE,
  getTileSpeedMultiplier,
  tryGridMove,
  updateGridMovement,
  updateFreeMovement,
  updatePlayerMovement
};

// Wire up Dev Settings controls
document.getElementById('devBiomeSize')?.addEventListener('change', (e) => {
  const val = Number(e.target.value);
  if (val > 0) {
    setBiomeScale(val);
    state.devSpawn = true;
    chunks.clear();
  }
});
document.getElementById('devSpawnNearBorder')?.addEventListener('change', (e) => {
  state.devSpawnNearBorder = e.target.checked;
});
document.getElementById('devStartBiome')?.addEventListener('change', (e) => {
  state.devStartBiome = e.target.value;
});
document.getElementById('devStartLevel')?.addEventListener('input', (e) => {
  const v = Math.max(1, Math.min(80, parseInt(e.target.value, 10) || 1));
  state.devStartLevel = v;
});
document.getElementById('devGiveWeaponsAt5')?.addEventListener('change', (e) => {
  state.devGiveWeaponsAt5 = e.target.checked;
});
