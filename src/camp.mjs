import { BIOMES, biomeAt } from './world.mjs?v336';
import { ENEMY_TYPES } from './entities.mjs?v336';
import { relicEffectFor, relicSpriteFor, saveRelicJournal, saveEquippedRelics, NPC_RELICS } from './quests.mjs?v336';
import { SPECIAL_ITEMS_LIST, SPECIAL_ITEMS_MAP } from './assets.mjs?v336';
import { PLAYABLE_CHARACTERS, RUN_UPGRADES, WEAPON_DEFS, CAMP_SCENES, BIOME_SCENE_FAMILIARS, CAMP_BUILDING_NPCS, NPC_DIALOGUES, ALL_TRINKETS, MATERIALS, LORE_ENTRIES, CAMP_QUESTS, getDailyQuestsForToday, getDailyResetTimeRemaining, getDailyDateKey, getAllCampQuests, getCampQuest, CAMP_WEAPONS, CAMP_TOOLS, CAMP_GEAR, ALL_LEGENDARY_PIECES, LEGENDARY_SETS, MOUNTS, MOUNT_IMAGES, CAMP_COMPANIONS, COMPANION_RELIC_SKILLS, BOSS_DATA } from './config.mjs?v336';
import { playSfx } from './audio.mjs?v336';
import { campSave, saveCamp, showCampMessage, createRunProgress, LORE_SETS, saveLoreSets, saveSettings, commitRunQuestBaseline } from './save.mjs?v336';
import { state, player, playerWeapons, equipment, unlockedAch, relicJournal, relicJournalIds, equippedRelicIds, npcBubbleMap, fireBreaths } from './state.mjs?v336';
import { getFogRevealRadius, revealedTiles } from './spatial.mjs?v336';
import { renderAtlasIcons, iconCanvas, showDropToast } from './ui-icons.mjs?v336';
import { TILE } from './underground.mjs?v336';
import { findCampSpawn } from './world-chunks.mjs?v336';
import { ACHIEVEMENTS, EQUIPMENT_UPGRADES, recomputeRelicModifiers, updateAchCount, isTrophyUnlocked, syncTrophiesFromAchievements, applyEquippedSetBonuses, getActiveSetBonuses, bankCarriedRelic, renderInventory } from './relics-achievements.mjs?v336';
import { updateWeaponHUD, updateHUD, startGame } from './game-core.mjs?v336';

function getSelectedCharacter(){return PLAYABLE_CHARACTERS.find(item=>item.id===campSave.character)||PLAYABLE_CHARACTERS[0];}
function applySelectedCharacter(){
  const character=getSelectedCharacter();
  player.sprite=character.sprite;
  player.walkSprite=character.walkSprite || character.sprite;
  player.backSprite=character.backSprite || character.sprite;
  player.backWalkSprite=character.backWalkSprite || character.sprite;
  player.customChar=Boolean(character.customChar);
  player.directionalChar=Boolean(character.directionalChar);
  player.animSheets=character.animSheets || null;
  player.imgWalk=character.imgWalk;
  player.imgIdle=character.imgIdle;
  player.maxHp=character.maxHp + (campSave.permHpBonus || 0);
  player.hp=player.maxHp;
  player.speed=character.speed * (1 + (campSave.permSpeedBonus || 0));
  player.damageMultiplier=character.damage * (1 + (campSave.permDmgBonus || 0));
  if(campSave.permRegenBonus) player.regen = (player.regen || 0) + campSave.permRegenBonus;
  if(campSave.permDefenseBonus) player.defense = Math.min(0.8, (player.defense || 0) + campSave.permDefenseBonus);
  if(campSave.permRerolls) player.rerolls = (player.rerolls || 0) + campSave.permRerolls;
  if(campSave.permBanishes) player.banishes = (player.banishes || 0) + campSave.permBanishes;
  if(!campSave.ownedWeapons) campSave.ownedWeapons = ['wand', 'fireBreath', 'orcCleaver'];
  if(!campSave.ownedWeapons.includes('wand')) campSave.ownedWeapons.unshift('wand');
  if(!campSave.ownedWeapons.includes('fireBreath')) campSave.ownedWeapons.push('fireBreath');
  if(!campSave.ownedWeapons.includes('orcCleaver')) campSave.ownedWeapons.push('orcCleaver');
  const startingW = character.startingWeapon || (character.id === 'knight' ? 'fireBreath' : (character.id === 'orc' ? 'orcCleaver' : 'wand'));
  if(!campSave.ownedWeapons.includes(startingW)) campSave.ownedWeapons.push(startingW);
  if(!campSave.loadoutWeapons || !campSave.loadoutWeapons.length){
    campSave.loadoutWeapons = [startingW];
  }
}
applySelectedCharacter();

// ═══════════════════════════════════════════════════════════
// LORE JOURNAL SYSTEM
// ═══════════════════════════════════════════════════════════
function restoreRunProgress(){
  const progress=campSave.runProgress;
  if(!progress||progress.version!==1||!progress.player){campSave.runProgress=null;return false;}
  const savedPlayer=progress.player;
  for(const key of ['level','xp','xpNext','hp','maxHp','speed','pickupRange','regen','cooldownMultiplier','damageMultiplier','defense','xpMultiplier','waterSlowMultiplier','poisonStacks','poisonTimer','slowFactor','bonusProjectiles','critChance','critMult','extraPierce','projSpeedMult','executeThreshold','emberDamage','frostSlow','dodgeChance','thorns','lifestealProgress','lifestealStacks','shield','maxShield','shieldRegenTimer','hasRevive','areaMult','durationMult','gemValueMult','ricochetChance','rerolls','banishes','cardDraw','luckMult','goldFindMult','companionMult','bloodPactLevels','glassCannonLevels','berserkerLevels']){
    if(Number.isFinite(savedPlayer[key]))player[key]=savedPlayer[key];
  }
  player.level=Math.max(1,Math.floor(player.level));player.xp=Math.max(0,player.xp);player.xpNext=Math.max(1,player.xpNext);
  player.maxHp=Math.max(1,player.maxHp);player.hp=Math.max(1,Math.min(player.maxHp,player.hp));
  player.pickupRange=Math.max(0,player.pickupRange);player.defense=Math.max(0,Math.min(.8,player.defense));
  player.invulnTimer=0;player.poisonStacks=Math.max(0,Math.floor(player.poisonStacks));
  player.hasRevive=Boolean(savedPlayer.hasRevive);
  player.upgradeLevels=progress.upgradeLevels&&typeof progress.upgradeLevels==='object'?{...progress.upgradeLevels}:{};
  player.banishedUpgrades=Array.isArray(progress.banishedUpgrades)?progress.banishedUpgrades.filter(id=>RUN_UPGRADES.some(u=>u.id===id)||STAT_UPGRADES.some(u=>u.id===id)||EQUIPMENT_UPGRADES.some(u=>u.id===id)):[];
  player.rerolls=Math.max(0,Math.floor(player.rerolls||0));player.banishes=Math.max(0,Math.floor(player.banishes||0));player.shield=Math.max(0,Math.min(player.maxShield,player.shield));
  playerWeapons.splice(0,playerWeapons.length);
  for(const savedWeapon of Array.isArray(progress.weapons)?progress.weapons:[]){
    const weaponId=savedWeapon?.id==='pickaxe'?'stonePickaxe':savedWeapon?.id;
    const def=WEAPON_DEFS[weaponId];
    if(!def)continue;
    const level=Math.max(1,Math.min(def.maxLevel,Math.floor(savedWeapon.level||1)));
    playerWeapons.push({id:weaponId,level,timer:0});
  }
  if(!playerWeapons.length){ const defW = getSelectedCharacter()?.startingWeapon || (campSave.character === 'knight' ? 'fireBreath' : 'wand'); playerWeapons.push({id:defW,level:1,timer:0}); }
  equipment.splice(0,equipment.length);
  for(const savedGear of Array.isArray(progress.equipment)?progress.equipment:[]){
    const def=EQUIPMENT_UPGRADES.find(item=>item.id===savedGear?.id);
    if(def)equipment.push({id:def.id,level:Math.max(1,Math.min(def.maxLevel||99,Math.floor(savedGear.level||1))),sprite:def.sprite});
  }
  const savedRelic=progress.carriedRelic;
  carriedRelic=savedRelic&&typeof savedRelic.id==='string'&&/^-?\d+,-?\d+$/.test(savedRelic.id)&&typeof savedRelic.name==='string'
    ?{id:savedRelic.id,name:savedRelic.name,tier:savedRelic.tier,tierLabel:savedRelic.tierLabel,color:savedRelic.color,xp:Math.max(0,Number(savedRelic.xp)||0),effect:savedRelic.effect||relicEffectFor(savedRelic.name),duration:Math.max(1,Number(savedRelic.duration)||20),timeRemaining:Number.isFinite(savedRelic.timeRemaining)?Math.max(0,savedRelic.timeRemaining):Math.max(1,Number(savedRelic.duration)||20),attackTimer:Math.max(0,Number(savedRelic.attackTimer)||0)}
    :null;
  elapsed=Math.max(0,Number.isFinite(progress.elapsed)?progress.elapsed:0);
  worldTime=Math.max(0,Number.isFinite(progress.worldTime)?progress.worldTime:worldTime);
  kills=Math.max(0,Math.floor(Number.isFinite(progress.kills)?progress.kills:0));
  nextBossTime=Math.max(elapsed+1,Number.isFinite(progress.nextBossTime)?progress.nextBossTime:360);
  spawnedBossBiomes=new Set(progress.spawnedBossBiomes||[]);
  if(player.level >= 12){
    nextBossTime = Math.min(nextBossTime, Math.max(360, elapsed + 1.2));
  }
  relicsAtRunStart=Math.max(0,Math.floor(Number.isFinite(progress.relicsAtRunStart)?progress.relicsAtRunStart:relicJournal.length));
  killsByFire=Math.max(0,Math.floor(progress.killsByFire||0));
  killsByWater=Math.max(0,Math.floor(progress.killsByWater||0));
  killsAtNight=Math.max(0,Math.floor(progress.killsAtNight||0));
  bossKills=Math.max(0,Math.floor(progress.bossKills||0));
  vampireKills=Math.max(0,Math.floor(progress.vampireKills||0));
  unlockedAch.clear();
  for(const id of Array.isArray(progress.achievements)?progress.achievements:[])if(ACHIEVEMENTS.some(item=>item.id===id))unlockedAch.add(id);
  phoenixRevivedThisRun=Boolean(progress.phoenixRevivedThisRun);
  recomputeRelicModifiers();
  tryEvolveWeapons();
  updateAchCount();
  hasResumableProgress=true;
  return true;
}
function revealAroundPlayer(){
  FOG_REVEAL_RADIUS = getFogRevealRadius();
  const centerX=Math.floor((player.x+player.w/2)/TILE),centerY=Math.floor((player.y+player.h/2)/TILE);
  const centerKey=`${centerX},${centerY}`;
  if(centerKey===lastRevealedTile)return false;
  lastRevealedTile=centerKey;
  fogRevealVersion++;
  const prevSize = revealedTiles.size;
  for(let y=-FOG_REVEAL_RADIUS;y<=FOG_REVEAL_RADIUS;y++)for(let x=-FOG_REVEAL_RADIUS;x<=FOG_REVEAL_RADIUS;x++){
    if(x*x+y*y>FOG_REVEAL_RADIUS*FOG_REVEAL_RADIUS)continue;
    revealedTiles.add(`${centerX+x},${centerY+y}`);
  }
  const newlyAdded = revealedTiles.size - prevSize;
  if(newlyAdded > 0 && typeof questProgress !== 'undefined'){
    questProgress.tilesRevealedRun = (questProgress.tilesRevealedRun || 0) + newlyAdded;
    const curB = biomeAt(centerX, centerY);
    if(curB && ['plains','forest','desert','snow','magicForest','volcano'].includes(curB)){
      if(!campSave.unlockedCamps) campSave.unlockedCamps = ['plains'];
      if(!campSave.unlockedCamps.includes(curB)){
        campSave.unlockedCamps.push(curB);
        saveCamp();
      }
    }
  }
  while(revealedTiles.size>30000)revealedTiles.delete(revealedTiles.values().next().value);
  return true;
}
function resolveCampSceneId(biomeId,wx,wy){
  if(Number.isFinite(wx)&&Number.isFinite(wy)){
    if(wx>700000&&wy>700000&&wx<900000&&wy<900000)return'abyss';
    if(wx>400000&&wy>400000)return'dimensionX';
    if(wx>100000&&wy>100000&&wx<300000&&wy<300000)return'undergroundCave';
  }
  if(biomeId==='dwarfCity')return'undergroundCave';
  if(biomeId in CAMP_SCENES)return biomeId;
  if(campSave.campBiome in CAMP_SCENES)return campSave.campBiome==='dwarfCity'?'undergroundCave':campSave.campBiome;
  return'plains';
}

function setCampScene(sceneId){
  const resolved=resolveCampSceneId(sceneId);
  const scene=CAMP_SCENES[resolved]||CAMP_SCENES.plains;
  const panel=document.querySelector('.camp-scene');
  const image=document.getElementById('campBackdrop');
  if(!panel||!image)return;
  panel.dataset.scene=resolved;
  image.src=scene.src;
  image.alt=`${scene.name} pixel-art scene`;
  document.getElementById('campSceneEyebrow').textContent=scene.eyebrow;
  document.getElementById('campSceneName').textContent=scene.name;
  document.getElementById('campSceneDetail').textContent=scene.detail;

  // Building NPCs (Inn on left, Store on right)
  const buildingNpcs = CAMP_BUILDING_NPCS[resolved] || CAMP_BUILDING_NPCS.plains;
  const innMarker = document.getElementById('campSceneInnNpc');
  if (innMarker && buildingNpcs.inn) {
    innMarker.style.display = '';
    innMarker.dataset.npc = buildingNpcs.inn.id;
    innMarker.dataset.sprite = buildingNpcs.inn.sprite;
    innMarker.dataset.iconSize = String(buildingNpcs.inn.size || 92);
    innMarker.dataset.imageX = String(buildingNpcs.inn.x || 0.18);
    innMarker.dataset.imageY = String(buildingNpcs.inn.y || 0.75);
    innMarker.title = `${buildingNpcs.inn.name} (${buildingNpcs.inn.title}) - Click to visit Inn`;
    delete innMarker.dataset.atlasRendered;
  }
  const storeMarker = document.getElementById('campSceneStoreNpc');
  if (storeMarker && buildingNpcs.store) {
    storeMarker.style.display = '';
    storeMarker.dataset.npc = buildingNpcs.store.id;
    storeMarker.dataset.sprite = buildingNpcs.store.sprite;
    storeMarker.dataset.iconSize = String(buildingNpcs.store.size || 92);
    storeMarker.dataset.imageX = String(buildingNpcs.store.x || 0.82);
    storeMarker.dataset.imageY = String(buildingNpcs.store.y || 0.76);
    storeMarker.title = `${buildingNpcs.store.name} (${buildingNpcs.store.title}) - Click to visit Store`;
    delete storeMarker.dataset.atlasRendered;
  }

  // Unique Familiars on camp screen for this biome (1 or 2)
  const fam1 = document.getElementById('campSceneFamiliar1');
  const fam2 = document.getElementById('campSceneFamiliar2');
  const pair = BIOME_SCENE_FAMILIARS[resolved] || BIOME_SCENE_FAMILIARS.plains;
  if(fam1){
    if(pair && pair[0]){
      fam1.style.display = '';
      fam1.dataset.npc = pair[0].id;
      fam1.dataset.sprite = pair[0].sprite;
      fam1.dataset.iconSize = String(pair[0].size || 84);
      fam1.dataset.imageX = String(pair[0].x);
      fam1.dataset.imageY = String(pair[0].y);
      delete fam1.dataset.atlasRendered;
    } else {
      fam1.style.display = 'none';
    }
  }
  if(fam2){
    if(pair && pair[1]){
      fam2.style.display = '';
      fam2.dataset.npc = pair[1].id;
      fam2.dataset.sprite = pair[1].sprite;
      fam2.dataset.iconSize = String(pair[1].size || 92);
      fam2.dataset.imageX = String(pair[1].x);
      fam2.dataset.imageY = String(pair[1].y);
      delete fam2.dataset.atlasRendered;
    } else {
      fam2.style.display = 'none';
    }
  }

  document.querySelectorAll('.camp-overlay-marker').forEach(marker=>{
    marker.style.setProperty('--camp-x',`${Number(marker.dataset.imageX)*100}%`);
    marker.style.setProperty('--camp-y',`${Number(marker.dataset.imageY)*100}%`);
  });
  renderAtlasIcons(panel);
  initCampSpeechBubbles();
}
{
  const curChar = getSelectedCharacter();
  let returnedBiome = null;
  try {
    returnedBiome = sessionStorage.getItem('pixelvivor.returnedFromBiome');
    sessionStorage.removeItem('pixelvivor.returnedFromBiome');
  } catch (_) {}
  if (returnedBiome) {
    const initialBiome = resolveCampSceneId(returnedBiome);
    campSave.campBiome = initialBiome;
    if (Number.isFinite(campSave.campX) && Number.isFinite(campSave.campY)) {
      player.x = campSave.campX;
      player.y = campSave.campY;
    } else {
      const campSpawn = findCampSpawn(initialBiome);
      player.x = campSpawn.x;
      player.y = campSpawn.y;
    }
    setCampScene(initialBiome);
  } else {
    const homeBiome = resolveCampSceneId(curChar.biome || 'plains');
    campSave.campBiome = homeBiome;
    campSave.runProgress = null;
    const campSpawn = findCampSpawn(homeBiome);
    player.x = campSpawn.x;
    player.y = campSpawn.y;
    campSave.campX = player.x;
    campSave.campY = player.y;
    setCampScene(homeBiome);
  }
}

// ═══════════════════════════════════════════════════════════
// CAMP NPC SPEECH BUBBLES SYSTEM
// ═══════════════════════════════════════════════════════════

function initCampSpeechBubbles() {
  npcBubbleMap.clear();
  document.querySelectorAll('.camp-overlay-marker[data-npc]').forEach(marker => {
    Array.from(marker.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) node.remove();
    });
    const npcId = marker.dataset.npc;
    let bubble = marker.querySelector('.npc-speech-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'npc-speech-bubble';
      bubble.style.display = 'none';
      marker.appendChild(bubble);
    }
    npcBubbleMap.set(npcId, { marker, bubble, timer: null });

    if (!marker.dataset.speechClickAttached) {
      marker.dataset.speechClickAttached = 'true';
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        const curNpcId = marker.dataset.npc;
        if (!curNpcId) return;
        try { playSfx('confirm'); } catch (_) {}
        const dialogues = NPC_DIALOGUES.filter(d => d.speaker === curNpcId && !d.condition);
        if (dialogues.length) {
          const d = dialogues[Math.floor(Math.random() * dialogues.length)];
          showNpcBubble(curNpcId, d.text, 4500);
        }
        if (marker.id === 'campSceneInnNpc') {
          setTimeout(() => { campTab = 'tavern'; renderCamp(); }, 350);
        } else if (marker.id === 'campSceneStoreNpc') {
          setTimeout(() => { campTab = 'shop'; renderCamp(); }, 350);
        }
      });
    }
  });
}

function showNpcBubble(speakerId, text, duration = 4500) {
  const entry = npcBubbleMap.get(speakerId);
  if (!entry || !entry.marker) return;

  if (!entry.bubble || !entry.marker.contains(entry.bubble)) {
    let bubble = entry.marker.querySelector('.npc-speech-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'npc-speech-bubble';
      bubble.style.display = 'none';
      entry.marker.appendChild(bubble);
    }
    entry.bubble = bubble;
  }

  Array.from(entry.marker.childNodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) node.remove();
  });

  if (entry.timer) clearTimeout(entry.timer);

  entry.bubble.textContent = text;
  entry.bubble.style.display = 'block';
  entry.bubble.classList.remove('fading');
  entry.marker.classList.add('speaking');

  entry.timer = setTimeout(() => {
    entry.bubble.classList.add('fading');
    entry.timer = setTimeout(() => {
      entry.bubble.style.display = 'none';
      entry.bubble.classList.remove('fading');
      entry.marker.classList.remove('speaking');
      entry.timer = null;
    }, 300);
  }, duration);
}

function triggerRandomCampDialogue() {
  const menuEl = document.getElementById('menu');
  if (gameStarted && (!menuEl || menuEl.style.display === 'none')) return;

  const activeScene = resolveCampSceneId(campSave.campBiome);
  const localPair = BIOME_SCENE_FAMILIARS[activeScene] || BIOME_SCENE_FAMILIARS.plains;
  const activeSpeakers = new Set(['wayfarer', ...localPair.map(p => p.id)]);
  const eligible = NPC_DIALOGUES.filter(d => !d.condition && activeSpeakers.has(d.speaker));
  if (!eligible.length) return;

  const chosen = eligible[Math.floor(Math.random() * eligible.length)];
  showNpcBubble(chosen.speaker, chosen.text, 4500);

  if (chosen.chatter) {
    setTimeout(() => {
      const currentMenu = document.getElementById('menu');
      if (gameStarted && (!currentMenu || currentMenu.style.display === 'none')) return;
      showNpcBubble(chosen.chatter.replySpeaker, chosen.chatter.replyText, 4200);
    }, 2000);
  }
}

function triggerCampReaction(condition) {
  const eligible = NPC_DIALOGUES.filter(d => d.condition === condition);
  if (!eligible.length) return;

  const first = eligible[Math.floor(Math.random() * eligible.length)];
  setTimeout(() => showNpcBubble(first.speaker, first.text, 5000), 700);

  const remaining = eligible.filter(d => d.speaker !== first.speaker);
  if (remaining.length && Math.random() < 0.6) {
    const second = remaining[Math.floor(Math.random() * remaining.length)];
    setTimeout(() => showNpcBubble(second.speaker, second.text, 5000), 2200);
  }
}

function scheduleNextCampDialogue() {
  if (campDialogueTimer) clearTimeout(campDialogueTimer);
  const delay = 12000 + Math.random() * 6000;
  campDialogueTimer = setTimeout(() => {
    triggerRandomCampDialogue();
    scheduleNextCampDialogue();
  }, delay);
}

function clearCampSpeechBubbles() {
  if (campDialogueTimer) {
    clearTimeout(campDialogueTimer);
    campDialogueTimer = null;
  }
  npcBubbleMap.forEach(entry => {
    if (entry.timer) clearTimeout(entry.timer);
    if (entry.bubble) {
      entry.bubble.textContent = '';
      entry.bubble.style.display = 'none';
      entry.bubble.classList.remove('fading');
    }
    if (entry.marker) {
      entry.marker.classList.remove('speaking');
      Array.from(entry.marker.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
    }
  });
}


function resetQuestProgress(){
  questProgress = {
    elites:0,
    noDamageTime:0,
    stormsSurvived:0,
    fireKills:0,
    nightKills:0,
    waterKills:0,
    relicsRun:0,
    bosses:0,
    tookDamage:false,
    untouchableLevel:1,
    speedrunCompleted:false,
    pacifistTime:0,
    pacifistCompleted:false,
    visitedBiomes:{},
    nightsSurvived:0,
    vampiresRun:0,
    vampireLordKilled:false,
    floodsSurvived:0,
    tilesRevealedRun:0,
    maxDistTilesFromCamp:0
  };
}

function getStoryStageStatus(quest){
  if(!quest || quest.category !== 'story') return { isUnlocked: true, isCompleted: false, isCurrent: true };
  const currentCompletedStage = (campSave && campSave.storyStages) ? (campSave.storyStages[quest.chainId] || 0) : 0;
  const isCompleted = currentCompletedStage >= quest.stage;
  const isUnlocked = quest.stage === 1 || currentCompletedStage >= (quest.stage - 1);
  const isCurrent = isUnlocked && !isCompleted && (currentCompletedStage === quest.stage - 1);
  return { isUnlocked, isCompleted, isCurrent, currentCompletedStage };
}

function getQuestProgress(quest){
  if(!quest) return 0;
  if(quest.type==='kills') return kills;
  if(quest.type==='time') return Math.floor(elapsed);
  if(quest.type==='relics') return questProgress.relicsRun || Math.max(0, relicJournal.length - relicsAtRunStart);
  if(quest.type==='untouchableLevel'){
    if(questProgress.untouchableLevel>=quest.target) return quest.target;
    return questProgress.tookDamage ? 0 : player.level;
  }
  if(quest.type==='speedrunLevel'){
    if(questProgress.speedrunCompleted) return quest.target;
    return elapsed<=600 ? player.level : 0;
  }
  if(quest.type==='pacifistTime'){
    if(questProgress.pacifistCompleted) return quest.target;
    return kills===0 ? Math.floor(elapsed) : 0;
  }
  if(quest.type==='berserkerKills') return kills;
  if(quest.type==='explorerBiomes') return Object.keys(questProgress.visitedBiomes||{}).length;
  if(quest.type==='collectorRelics') return questProgress.relicsRun || Math.max(0, relicJournal.length - relicsAtRunStart);
  if(quest.type==='survivorTime') return Math.floor(elapsed);
  // Story quest types
  if(quest.type==='playerLevel') return player.level;
  if(quest.type==='nightsSurvived') return questProgress.nightsSurvived || 0;
  if(quest.type==='vampiresRun') return questProgress.vampiresRun || 0;
  if(quest.type==='vampireLordKill') return questProgress.vampireLordKilled ? 1 : 0;
  if(quest.type==='floodsSurvived') return questProgress.floodsSurvived || 0;
  if(quest.type==='goldAccumulated') return campSave.gold;
  if(quest.type==='weaponsOwned') return campSave.ownedWeapons.length;
  if(quest.type==='bossesTotal') return (questProgress.bosses || 0) + bossKills;
  if(quest.type==='tilesRevealedRun') return questProgress.tilesRevealedRun || 0;
  if(quest.type==='distanceFromCamp') return Math.floor(questProgress.maxDistTilesFromCamp || 0);
  return questProgress[quest.type] || 0;
}

function isQuestComplete(quest){
  if(!quest) return false;
  if(quest.type==='untouchableLevel') return Boolean(questProgress.untouchableLevel>=quest.target);
  if(quest.type==='speedrunLevel') return Boolean(questProgress.speedrunCompleted || (elapsed<=600 && player.level>=quest.target));
  if(quest.type==='pacifistTime') return Boolean(questProgress.pacifistCompleted || (kills===0 && elapsed>=quest.target));
  return getQuestProgress(quest) >= quest.target;
}

// ═══════════════════════════════════════════════════════════
// LEVEL MILESTONES — free passives every 5 levels
// ═══════════════════════════════════════════════════════════
const LEVEL_MILESTONES={
  5:{label:'+4% damage',apply:()=>{player.damageMultiplier*=1.04;}},
  10:{label:'+5% move speed',apply:()=>{player.speed*=1.05;}},
  15:{label:'+6% damage',apply:()=>{player.damageMultiplier*=1.06;}},
  20:{label:'-8% cooldown',apply:()=>{player.cooldownMultiplier*=.92;}},
  25:{label:'+1 projectile',apply:()=>{player.bonusProjectiles=(player.bonusProjectiles||0)+1;}},
  30:{label:'+7% damage',apply:()=>{player.damageMultiplier*=1.07;}},
  35:{label:'+8% move speed',apply:()=>{player.speed*=1.08;}},
  40:{label:'-10% cooldown',apply:()=>{player.cooldownMultiplier*=.90;}},
  45:{label:'+10% damage',apply:()=>{player.damageMultiplier*=1.10;}},
  50:{label:'+1 projectile',apply:()=>{player.bonusProjectiles=(player.bonusProjectiles||0)+1;}},
  60:{label:'+15% damage',apply:()=>{player.damageMultiplier*=1.15;}},
  70:{label:'+1 projectile',apply:()=>{player.bonusProjectiles=(player.bonusProjectiles||0)+1;}},
  80:{label:'+20% damage',apply:()=>{player.damageMultiplier*=1.20;}}
};


function grantRunUpgrade(id){
 player.upgradeLevels[id]=(player.upgradeLevels[id]||0)+1;
 switch(id){
 case'force':player.knockbackPower=(player.knockbackPower||0)+15;player.meleeDamageBonus=(player.meleeDamageBonus||1)+.2;break;
 case'crit':player.critChance=Math.min(.4,player.critChance+.08);break;case'critDmg':player.critMult+=.3;break;
 case'pierce':player.extraPierce++;break;case'projSpeed':player.projSpeedMult*=1.12;break;case'execute':player.executeThreshold=Math.min(.3,player.executeThreshold+.15);break;
 case'ember':player.emberDamage+=5;break;case'frost':player.frostSlow=Math.min(.4,player.frostSlow+.2);break;case'dodge':player.dodgeChance=Math.min(.3,player.dodgeChance+.06);break;
 case'thorns':player.thorns+=.25;break;case'lifesteal':player.lifestealStacks++;break;case'shieldGen':player.maxShield=(player.maxShield||0)+25;player.shield=Math.min(player.maxShield,(player.shield||0)+25);break;case'secondWind':player.hasRevive=true;break;
 case'wideArc':player.areaMult*=1.15;break;case'persistent':player.durationMult*=1.2;break;case'magnifier':player.pickupRange*=1.25;player.gemValueMult*=1.15;break;case'ricochet':player.ricochetChance=Math.min(.3,player.ricochetChance+.1);break;
 case'reroll':player.rerolls++;break;case'banish':player.banishes++;break;case'luck':player.luckMult*=1.2;player.goldFindMult*=1.15;break;case'cardDraw':player.cardDraw++;break;case'companionBond':player.companionMult*=1.25;break;
 case'bloodPact':player.bloodPactLevels++;player.damageMultiplier*=1.4;player.maxHp=Math.max(1,Math.floor(player.maxHp*.85));player.hp=Math.min(player.hp,player.maxHp);break;
 case'glassCannon':player.glassCannonLevels++;player.damageMultiplier*=1.25;player.defense=Math.max(0,player.defense-.2);break;case'berserker':player.berserkerLevels++;break;
 }
}
function applyEquippedTrinkets() {
  if (!campSave.equippedTrinkets) return;
  campSave.equippedTrinkets.forEach(tId => {
    if(!tId) return;
    const t = ALL_TRINKETS.find(x => x.id === tId);
    if(!t || !t.stats) return;
    if(t.stats.luckMult) player.luckMult = (player.luckMult||1) * (1 + t.stats.luckMult);
    if(t.stats.lifesteal) player.lifestealChance = (player.lifestealChance||0) + t.stats.lifesteal;
    if(t.stats.moveSpeed) player.speed *= (1 + t.stats.moveSpeed);
    if(t.stats.armor) player.defense = Math.min(0.7, (player.defense||0) + (t.stats.armor * 0.05));
    if(t.stats.maxHp) player.maxHp += t.stats.maxHp;
    if(t.stats.xpMult) player.xpMultiplier = (player.xpMultiplier||1) * (1 + t.stats.xpMult);
    if(t.stats.regen) player.regen = (player.regen||0) + t.stats.regen;
    if(t.stats.goldMult) player.goldFindMult = (player.goldFindMult||1) * (1 + t.stats.goldMult);
    if(t.stats.damageMult) player.damageMultiplier = (player.damageMultiplier||1) * (1 + t.stats.damageMult);
    if(t.stats.critChance) player.critChance = (player.critChance||0) + t.stats.critChance;
    if(t.stats.pickupRange) player.pickupRange = (player.pickupRange||40) + t.stats.pickupRange;
    if(t.stats.critMult) player.critMult = (player.critMult||2) + t.stats.critMult;
    if(t.stats.defenseMult) player.defense = Math.min(0.7, (player.defense||0) - t.stats.defenseMult); // -damage taken = +defense
    if(t.stats.attackSpeed) player.cooldownMultiplier *= (1 - t.stats.attackSpeed);
    if(t.stats.healingMult) player.healingRecvMult = (player.healingRecvMult||1) + t.stats.healingMult;
    if(t.stats.fogRange) campSave.cartographerBonus = true; // hacky, gives +3 fog range
    if(t.stats.shopPrice) campSave.merchantDiscount = true; // shop discount
    if(t.stats.dodgeChance) player.dodgeChance = (player.dodgeChance||0) + t.stats.dodgeChance;
    if(t.stats.waterSlow) player.waterSlowMultiplier = Math.max(0.15, (player.waterSlowMultiplier||0.5) + t.stats.waterSlow);
    if(t.stats.maxHpKill) player.maxHpKillLimit = t.stats.maxHpKill;
  });
}
function resetRunUpgrades(){window.__conchUsedThisRun = false; if(typeof window.updateConchHUD === 'function') window.updateConchHUD(); player.fireBreathTimer = 0; if (typeof fireBreaths !== 'undefined') fireBreaths.length = 0;
  if(campSave.hasAbyssalKey){
    if(!campSave.materials) campSave.materials = {};
    campSave.materials.abyssalKey = Math.max(campSave.materials.abyssalKey || 0, 1);
    if(!relicJournalIds.has('relic_abyssal_key')){
      const kRelic = { id: 'relic_abyssal_key', name: "The Abyssal Key", tier: 'mythic', tierLabel: 'Secret World Key', sprite: 'Abyssal_Key', color: '#00e5ff', xp: 100, duration: 999999, requiresCampReturn: false, effect: { label: 'Key of the Depths: Unlocks passage to The Sunken Depths (The Abyss) & +15% Damage.', damage: 1.15 } };
      relicJournalIds.add(kRelic.id);
      relicJournal.push(kRelic);
      saveRelicJournal(relicJournal);
      const emptyIdx = equippedRelicIds.findIndex(id => !id);
      if(emptyIdx !== -1) { equippedRelicIds[emptyIdx] = kRelic.id; saveEquippedRelics(equippedRelicIds); }
    }
  }
  if(campSave.hasTidecallerConch){
    if(!campSave.materials) campSave.materials = {};
    campSave.materials.tidecallersConch = Math.max(campSave.materials.tidecallersConch || 0, 1);
    if(!relicJournalIds.has('relic_tidecaller_conch')){
      const cRelic = { id: 'relic_tidecaller_conch', name: "Tidecaller's Conch", tier: 'rare', tierLabel: 'Secret World Relic', sprite: 'Tidecallers_Conch', color: '#00e5ff', xp: 50, duration: 999999, requiresCampReturn: false, effect: { label: 'Active: Click or press [C] to summon a 60s Deluge (1x/run)', power: 'tidecaller' } };
      relicJournalIds.add(cRelic.id);
      relicJournal.push(cRelic);
      saveRelicJournal(relicJournal);
      const emptyIdx = equippedRelicIds.findIndex(id => !id);
      if(emptyIdx !== -1) { equippedRelicIds[emptyIdx] = cRelic.id; saveEquippedRelics(equippedRelicIds); }
    }
  }state.savedChickenWeapons = null;state.chickenCoinPickups = [];state.chickenKingSpawned = false;state.chickenKingDefeated = false;state.chickenDimensionEntered = false;state.recentHitBuffer = [];state.devSpawn = false;state.carriedRelic = null;state.pendingLevelUps = 0;player.level = 1;player.xp = 0;player.xpNext = 10;state.nextBossTime = 360;state.bossWarningShown = false;state.chickenCoins = campSave.chickenCoins || 0;player.activeQuest = null;player.completedNPCs = [];applyEquippedSetBonuses();Object.assign(player,{knockbackPower:0,meleeDamageBonus:1,critChance:0,critMult:2,extraPierce:0,projSpeedMult:1,executeThreshold:0,emberDamage:0,frostSlow:0,dodgeChance:0,thorns:0,lifestealProgress:0,lifestealStacks:0,shield:0,maxShield:0,shieldRegenTimer:0,hasRevive:false,areaMult:1,durationMult:1,gemValueMult:1,ricochetChance:0,rerolls:0,banishes:0,cardDraw:0,luckMult:1,goldFindMult:1,companionMult:1,bloodPactLevels:0,glassCannonLevels:0,berserkerLevels:0,bonusProjectiles:0,upgradeLevels:{},banishedUpgrades:[]}); applyEquippedTrinkets();}
const STAT_UPGRADES=[
  {id:'maxHp',sprite:'rpg_potion_red',name:'+20 Max Health',desc:'Increase your maximum health',apply:()=>{player.maxHp+=20;player.hp+=20;}},
  {id:'heal',sprite:'rpg_potion_red',name:'Full Heal',desc:'Restore all health',apply:()=>{player.hp=player.maxHp;}},
  {id:'speed',sprite:'rpg_boots_leather',name:'+10% Move Speed',desc:'Move faster',apply:()=>{player.speed*=1.1;}},
  {id:'pickup',sprite:'orb',name:'+30 Pickup Range',desc:'Collect XP from farther away',apply:()=>{player.pickupRange+=30;}},
  {id:'regen',sprite:'rpg_potion_green',name:'+0.5 Health/sec',desc:'Slowly restore health',apply:()=>{player.regen+=.5;}},
  {id:'cd',sprite:'rpg_lightningSprite',name:'-10% Weapon Cooldown',desc:'Weapons attack more often',apply:()=>{player.cooldownMultiplier*=.9;}},
  {id:'damage',sprite:'rpg_sword_iron',name:'+12% Damage',desc:'Deal more damage with every weapon',apply:()=>{player.damageMultiplier*=1.12;}},
  {id:'defense',sprite:'rpg_shield_iron',name:'+10% Damage Reduction',desc:'Take less damage from enemies',apply:()=>{player.defense=Math.min(.7,player.defense+.1);}},
  {id:'xp',sprite:'amulet',name:'+15% XP Gain',desc:'Earn experience faster',apply:()=>{player.xpMultiplier*=1.15;}}
];

function addWeapon(id){
  const ex=playerWeapons.find(w=>w.id===id);
  if(ex){if(ex.level<WEAPON_DEFS[id].maxLevel)ex.level++;}
  else playerWeapons.push({id,level:1,timer:0});
  tryEvolveWeapons();
}
function addEquipment(id){
  const def=EQUIPMENT_UPGRADES.find(e=>e.id===id);
  if(!def)return false;
  const existing=equipment.find(e=>e.id===id);
  if(existing&&existing.level>=(def.maxLevel||Infinity))return false;
  if(existing){existing.level++;}else{equipment.push({id,level:1,sprite:def.sprite});}
  def.apply();
  tryEvolveWeapons();
  return true;
}
function tryEvolveWeapons(){
  const equipmentLevel=id=>equipment.find(item=>item.id===id)?.level||0;
  const recipes=[
    {base:'wand',result:'arcaneBarrage',reward:'25 arcane bolts',requires:()=>equipmentLevel('ring')>=5},
    {base:'bow',result:'arrowstorm',reward:'15 piercing arrows',requires:()=>equipmentLevel('ring')>=5},
    {base:'spear',result:'glaiveSun',reward:'360 degree radiant sweep',requires:()=>equipmentLevel('helmet')>=1},
    {base:'tome',result:'necromancerGrimoire',reward:'permanent fighting spirits',requires:()=>equipmentLevel('amulet')>=1},
    {base:'voidRift',result:'singularity',reward:'five-second enemy-consuming rift',requires:()=>equipmentLevel('ring')>=5},
    {base:'chrono',result:'temporalLord',reward:'50% slow and 30% attack speed',requires:()=>equipmentLevel('boots')>=1},
    {base:'prismStaff',result:'rainbowBarrage',reward:'6-beam 360° Rainbow Barrage (+50% Damage)',requires:()=>(campSave.equippedTrinkets||[]).includes('t_magecrest')},
    {base:'frostBeam',result:'permafrost',reward:'Doubled beam width & frozen enemies shatter for 30 AoE damage',requires:()=>Boolean((campSave.materials&&campSave.materials.frozenCore>0)||(campSave.equippedTrinkets||[]).some(id=>id==='crystal_shard'||id==='t_cryomancercrest')||(campSave.ownedGear||[]).includes('crystal_shard'))},
    {base:'fireBreath',result:'dragonInferno',reward:'Expanded dragon inferno cone with explosive burns',requires:()=>equipmentLevel('helmet')>=1}
  ];
  let evolved=false;
  for(const recipe of recipes){
    if(playerWeapons.some(weapon=>weapon.id===recipe.result))continue;
    const base=playerWeapons.find(weapon=>weapon.id===recipe.base);
    if(!base||base.level<WEAPON_DEFS[recipe.base].maxLevel||!recipe.requires())continue;
    playerWeapons.splice(playerWeapons.indexOf(base),1,{id:recipe.result,level:1,timer:0});
    playSfx('levelup');
    const toast=document.createElement('div');toast.className='relic-toast';
    const title=document.createElement('strong');title.textContent='WEAPON EVOLVED';title.style.color='#b58cff';
    const name=document.createElement('span');name.textContent=WEAPON_DEFS[recipe.result].name;
    const reward=document.createElement('span');reward.textContent=recipe.reward;
    toast.append(title,name,reward);document.getElementById('relicToasts').appendChild(toast);
    setTimeout(()=>toast.remove(),4200);
    evolved=true;
  }
  if(evolved)updateWeaponHUD();
  return evolved;
}
function syncCharacterDisplay(){
  const character=getSelectedCharacter();
  const name=document.getElementById('campCharacterName');
  const race=document.getElementById('campCharacterRace');
  const role=document.getElementById('campCharacterRole');
  const hpEl=document.getElementById('campCharacterHp');
  const weatherEl=document.getElementById('campProfileWeather');
  if(name)name.textContent=character.name;
  if(race)race.textContent=character.race;
  if(role)role.textContent=(character.desc||'').split('-')[0].trim()||'Balanced';
  const totalMaxHp=(character.maxHp||100)+(campSave.permHpBonus||0);
  if(hpEl)hpEl.textContent=`${totalMaxHp} HP`;
  
  const activeSceneId=resolveCampSceneId(campSave.campBiome||character.biome||'plains');
  campSave.campBiome=activeSceneId;
  const WEATHER_BY_SCENE={
    plains:'Clear Skies',forest:'Canopy Breeze',desert:'Scorching Sun',snow:'Frost Winds',
    swamp:'Marsh Mist',magicForest:'Starlight Glow',volcano:'Ember Ash',crystalWastes:'Prismatic Sky',
    fungalWastes:'Spore Haze',deadlands:'Blood Dusk',badlands:'Dry Gale',undergroundCave:'Deep Cavern',
    dwarfCity:'Forge Heat',dimensionX:'Cosmic Void',abyss:'Abyssal Depths'
  };
  if(weatherEl)weatherEl.textContent=WEATHER_BY_SCENE[activeSceneId]||'Clear Skies';
  setCampScene(activeSceneId);

  if ((campSave.materials && campSave.materials.chickenKingCrown > 0) && !campSave.unlockedChickenCrown) {
    campSave.unlockedChickenCrown = true;
    campSave.equippedChickenCrown = true;
  }
  for(const id of ['campAvatar','campScenePlayer','pausePlayerIcon']){
    const icon=document.getElementById(id);
    if(icon){
      if(character.directionalChar){
        icon.dataset.sprite='';
        if(id==='campScenePlayer'){
          icon.style.backgroundImage='none';
          icon.style.scale='';
          let visual = icon.querySelector('.camp-player-visual');
          if(!visual){
            visual = document.createElement('div');
            visual.className = 'camp-player-visual';
            icon.prepend(visual);
          }
          visual.style.width='100%';
          visual.style.height='100%';
          visual.style.backgroundImage='url(' + (character.previewWebp || 'characters/idle_preview.webp?v260') + ')';
          visual.style.backgroundSize='contain';
          visual.style.backgroundRepeat='no-repeat';
          visual.style.backgroundPosition='center bottom';
          visual.style.imageRendering='pixelated';
          visual.style.transform=(character.campFaceLeft || character.id==='wayfarer')?'scaleX(-1)':'none';
        } else {
          icon.style.backgroundImage='url(' + (character.previewWebp || 'characters/idle_preview.webp?v260') + ')';
          icon.style.backgroundSize='contain';
          icon.style.backgroundRepeat='no-repeat';
          icon.style.backgroundPosition='center bottom';
          icon.style.imageRendering='pixelated';
          icon.style.transform=(character.campFaceLeft || character.id==='wayfarer')?'scaleX(-1)':'none';
        }
        if(icon.dataset.iconSize){ const s=icon.dataset.iconSize; icon.style.width=s+'px'; icon.style.height=s+'px'; }
        if (icon.classList.contains('camp-overlay-marker')) {
          const canvas = icon.querySelector('canvas');
          if (canvas) canvas.remove();
          Array.from(icon.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) node.remove();
          });
        } else {
          icon.innerHTML='';
        }
      } else if(character.customChar && character.imgIdle){
        icon.dataset.sprite='';
        icon.style.backgroundImage='url(' + character.imgIdle.src + ')';
        icon.style.backgroundSize='400% 400%';
        icon.style.backgroundPosition='0 0';
        icon.style.imageRendering='pixelated';
        if(icon.dataset.iconSize){ const s=icon.dataset.iconSize; icon.style.width=s+'px'; icon.style.height=s+'px'; }
        if (icon.classList.contains('camp-overlay-marker')) {
          const canvas = icon.querySelector('canvas');
          if (canvas) canvas.remove();
          Array.from(icon.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) node.remove();
          });
        } else {
          icon.innerHTML='';
        }
      } else {
        icon.style.backgroundImage='';
        icon.dataset.sprite=character.sprite;
        renderAtlasIcons(icon.parentElement);
      }
      const oldCrown = icon.querySelector('.camp-chicken-crown-hat');
      if (oldCrown) oldCrown.remove();
      if (campSave.equippedChickenCrown) {
        icon.style.position = icon.classList.contains('camp-overlay-marker') ? 'absolute' : 'relative';
        const crownImg = document.createElement('img');
        crownImg.className = 'camp-chicken-crown-hat';
        crownImg.src = 'assets/Chicken Biom/chicken_crown_obj.webp?v260';
        crownImg.alt = 'Chicken Crown';
        const isScene = id === 'campScenePlayer';
        crownImg.style.cssText = `position:absolute;left:50%;top:${isScene ? '-2px' : '-4px'};transform:translateX(-50%);width:${isScene ? '26px' : '22px'};height:${isScene ? '20px' : '17px'};object-fit:contain;image-rendering:pixelated;pointer-events:none;z-index:10;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.85));`;
        icon.appendChild(crownImg);
      }
    }
  }
}
window.openTrinketModal = function(slotIdx){
  const listEl = document.getElementById('trinketList');
  if(!listEl) return;
  const owned = campSave.ownedTrinkets || [];
  const equipped = campSave.equippedTrinkets || [null,null,null];
  let html = `<button class="camp-action secondary" style="width:100%;text-align:left;padding:10px;" onclick="window.setTrinketSlot(${slotIdx}, null)">[ UNEQUIP SLOT ]</button>`;
  
  owned.forEach(tId => {
    const t = ALL_TRINKETS.find(x => x.id === tId);
    if(!t) return;
    const isEquipped = equipped.includes(t.id);
    html += `<button class="camp-contract ${isEquipped?'active':''}" style="cursor:pointer;width:100%;border:none;background:rgba(255,255,255,0.05);" ${isEquipped?'disabled':''} onclick="window.setTrinketSlot(${slotIdx}, '${t.id}')">
      <span class="camp-contract-icon" data-sprite="${t.sprite}"></span>
      <div class="camp-contract-copy" style="text-align:left;">
        <strong>${t.name}</strong>
        <small>${t.desc}</small>
      </div>
      ${isEquipped ? '<span style="color:#ffd54f;">Equipped</span>' : '<span style="color:#4caf50;">Select</span>'}
    </button>`;
  });
  listEl.innerHTML = html;
  renderAtlasIcons(listEl);
  document.getElementById('trinketModal').classList.add('open');
};
window.setTrinketSlot = function(slotIdx, tId){
  if(!campSave.equippedTrinkets) campSave.equippedTrinkets = [null,null,null];
  campSave.equippedTrinkets[slotIdx] = tId;
  saveCamp();
  renderCamp();
  document.getElementById('trinketModal').classList.remove('open');
};

// ===========================================================
// INVENTORY & COLLECTIBLES SYSTEM (Phase 1)
// ===========================================================


function addMaterialDrop(matId, count = 1, sourceName = '') {
  const mat = MATERIALS[matId];
  if(!mat) return;
  if(!campSave.materials) campSave.materials = {};
  campSave.materials[matId] = (campSave.materials[matId] || 0) + count;
  saveCamp();
  const countStr = count > 1 ? ` x${count}` : '';
  const text = sourceName === 'Elite Monster'
    ? `★ ELITE DEFEATED — ${mat.name}${countStr} added`
    : `★ ${sourceName.toUpperCase()} DEFEATED — ${mat.name}${countStr} added`;
  showDropToast(text, mat.rarityColor || '#ffd700', mat.sprite);
}

function consumeMaterial(matId) {
  try {
    const mat = MATERIALS[matId];
    if(!mat) return;
    if(!campSave.materials) campSave.materials = {};
    const count = campSave.materials[matId] || 0;
    if(count <= 0) {
      showCampMessage(`You do not have any ${mat.name}.`);
      return;
    }
    
    campSave.materials[matId]--;
    if(campSave.materials[matId] <= 0) {
      delete campSave.materials[matId];
      selectedInventoryItem = null;
    } else {
      if(selectedInventoryItem && selectedInventoryItem.id === matId) {
        selectedInventoryItem.count = campSave.materials[matId];
      }
    }

    const effectMsg = mat.consume(campSave, player);
    saveCamp();
    try { updateHUD(); } catch(e) {}
    try {
      const goldEl = document.getElementById('campGold');
      if(goldEl) goldEl.textContent = campSave.gold;
    } catch(e) {}

    try { playSfx('confirm'); } catch(e) {}
    showCampMessage(`★ Consumed ${mat.name}! ${effectMsg}`);
    renderCamp();
  } catch(err) {
    console.error('Failed to consume material:', err);
  }
}

function getInventoryItems(filter = 'all') {
  const items = [];
  const seenIds = new Set();

  // 1. Materials
  if (filter === 'all' || filter === 'materials') {
    for (const [matId, mat] of Object.entries(MATERIALS)) {
      const count = matId === 'chickenCoin'
        ? Math.max(campSave.materials?.[matId] || 0, campSave.chickenCoins || 0)
        : (campSave.materials?.[matId] || 0);
      if (count > 0) {
        items.push({
          id: matId,
          type: 'materials',
          categoryLabel: 'Material',
          name: mat.name,
          sprite: mat.sprite,
          rarity: mat.rarity,
          rarityLabel: mat.rarityLabel,
          rarityColor: mat.rarityColor,
          count: count,
          desc: mat.desc,
          effectDesc: mat.effectDesc,
          consumable: true
        });
      }
    }
  }

  // 2. Weapons
  if (filter === 'all' || filter === 'weapons') {
    const ownedW = campSave.ownedWeapons || [];
    for (const wid of ownedW) {
      if (seenIds.has(wid)) continue;
      seenIds.add(wid);
      const def = CAMP_WEAPONS.find(w => w.id === wid) || 
                  (typeof CAMP_TOOLS !== 'undefined' ? CAMP_TOOLS.find(t => t.id === wid) : null) || 
                  WEAPON_DEFS[wid];
      const isEq = (campSave.loadoutWeapons || []).includes(wid);
      items.push({
        id: wid,
        type: 'weapons',
        categoryLabel: 'Weapon',
        name: def?.name || wid,
        sprite: def?.icon || (def?.sprite === 'arcane_bolt' ? 'wand' : (def?.sprite === 'fireball' ? 'aura' : (def?.sprite || wid))),
        rarity: 'rare',
        rarityLabel: 'Rare',
        rarityColor: '#42a5f5',
        count: 1,
        desc: def?.desc || 'A combat weapon used in expeditions.',
        effectDesc: isEq ? 'Equipped in active weapon loadout' : 'Unequipped (Stored in backpack)',
        equipped: isEq,
        consumable: false
      });
    }
  }

  // 3. Gear
  if (filter === 'all' || filter === 'gear') {
    if (campSave.unlockedChickenCrown || (campSave.materials && campSave.materials.chickenKingCrown > 0)) {
      campSave.unlockedChickenCrown = true;
      const isCrownEq = Boolean(campSave.equippedChickenCrown);
      items.push({
        id: 'chickenCrown',
        type: 'gear',
        categoryLabel: 'Cosmetic Headgear • Trophy',
        name: 'Chicken Crown',
        sprite: 'chickenCrown',
        rarity: 'mythic',
        rarityLabel: 'Mythic Cosmetic',
        rarityColor: '#ffd700',
        count: 1,
        desc: 'The royal golden crown of the Chicken King, worn proudly atop your character\'s head.',
        effectDesc: isCrownEq ? 'Equipped on character head (Cosmetic Crown active)' : 'Unequipped (Click below to wear on head)',
        equipped: isCrownEq,
        consumable: false
      });
    }
    for (const gid of (campSave.ownedGear || [])) {
      if (gid === 'mask_of_calm' || gid === 'chickenCrown') continue;
      if (seenIds.has(gid)) continue;
      const trophyDef = SPECIAL_ITEMS_LIST.find(t => t.id === gid);
      if (trophyDef) {
        if (trophyDef.type === 'Trinket') continue; // Trinkets belong in Trinkets tab!
        seenIds.add(gid);
        items.push({
          id: trophyDef.id,
          type: 'gear',
          categoryLabel: `Trophy • ${trophyDef.type}`,
          name: trophyDef.name,
          sprite: trophyDef.sprite,
          rarity: 'legendary',
          rarityLabel: 'Trophy',
          rarityColor: '#ffd700',
          count: 1,
          desc: trophyDef.effect,
          effectDesc: trophyDef.effect,
          equipped: true,
          consumable: trophyDef.type === 'Consumable'
        });
        continue;
      }
      const def = CAMP_GEAR.find(g => g.id === gid);
      const upDef = (typeof EQUIPMENT_UPGRADES !== 'undefined') ? EQUIPMENT_UPGRADES.find(u => u.id === gid) : null;
      items.push({
        id: gid,
        type: 'gear',
        categoryLabel: 'Adventurer Gear',
        name: upDef?.name || (gid.charAt(0).toUpperCase() + gid.slice(1)),
        sprite: def?.sprite || 'rpg_chest_iron',
        rarity: 'uncommon',
        rarityLabel: 'Uncommon',
        rarityColor: '#65d39a',
        count: 1,
        desc: upDef?.desc || 'Permanent camping gear.',
        effectDesc: 'Passive equipment stats active',
        equipped: true,
        consumable: false
      });
    }
    for (const sid of (campSave.ownedSetPieces || [])) {
      const piece = ALL_LEGENDARY_PIECES.find(p => p.id === sid);
      const isEq = Object.values(campSave.equippedSetPieces || {}).includes(sid);
      if (piece) {
        items.push({
          id: sid,
          type: 'gear',
          categoryLabel: `Set Piece (${piece.slot.toUpperCase()})`,
          name: piece.name,
          sprite: piece.sprite,
          rarity: 'legendary',
          rarityLabel: 'Legendary',
          rarityColor: '#ffd700',
          count: 1,
          desc: piece.desc,
          effectDesc: isEq ? 'Equipped in Set Loadout' : 'Stored in backpack',
          equipped: isEq,
          consumable: false
        });
      }
    }
  }

  // 4. Relics
  if (filter === 'all' || filter === 'relics') {
    const seenRelics = new Set();
    const trophyIds = [...(campSave.collectedTrophies || [])];
    if (campSave.hasGoldenEgg && !trophyIds.includes('goldenEgg')) {
      trophyIds.push('goldenEgg');
    }
    for (const qid of trophyIds) {
      const qDef = SPECIAL_ITEMS_LIST.find(t => t.id === qid);
      if (qDef && !seenRelics.has(qid)) {
        seenRelics.add(qid);
        items.push({
          id: qDef.id,
          type: 'relics',
          categoryLabel: `Quest Collectible`,
          name: qDef.name,
          sprite: qDef.sprite,
          rarity: 'legendary',
          rarityLabel: 'Trophy',
          rarityColor: '#ffd700',
          count: 1,
          desc: qDef.effect,
          effectDesc: 'Unlocked Secret & Lore Fragment',
          equipped: false,
          consumable: false
        });
      }
    }
    for (const relic of relicJournal) {
      if (seenRelics.has(relic.id)) continue;
      seenRelics.add(relic.id);
      items.push({
        id: relic.id,
        type: 'relics',
        categoryLabel: `Relic • ${relic.tierLabel || relic.tier || 'Rare'}`,
        name: relic.name,
        sprite: relic.sprite || relicSpriteFor(relic.name) || 'rpg_gem_diamond',
        rarity: relic.tier || 'rare',
        rarityLabel: relic.tierLabel || 'Rare',
        rarityColor: relic.color || '#61b8ff',
        count: 1,
        desc: relic.desc || (relic.effect ? relic.effect.label : 'An ancient relic excavated from deep runs.'),
        effectDesc: relic.effect?.label || 'Passive exploration power',
        equipped: (equippedRelicIds || []).includes(relic.id),
        consumable: false
      });
    }
  }

  // 5. Trinkets
  if (filter === 'all' || filter === 'trinkets') {
    for (const tid of (campSave.ownedTrinkets || [])) {
      if (seenIds.has(tid)) continue;
      const t = ALL_TRINKETS.find(x => x.id === tid) || SPECIAL_ITEMS_LIST.find(x => x.id === tid);
      const isEq = (campSave.equippedTrinkets || []).includes(tid);
      if (t) {
        seenIds.add(tid);
        items.push({
          id: tid,
          type: 'trinkets',
          categoryLabel: 'Trinket Charm',
          name: t.name,
          sprite: t.sprite,
          rarity: 'rare',
          rarityLabel: 'Rare',
          rarityColor: '#ba68c8',
          count: 1,
          desc: t.desc || t.effect || 'A mystical charm that bestows passive bonuses.',
          effectDesc: isEq ? 'Equipped in Charm Slot' : 'Stored in backpack',
          equipped: isEq,
          consumable: false
        });
      }
    }
  }

  return items;
}

function renderCampInventory(panel) {
  if(!campSave.materials) campSave.materials = {};
  
  const allItems = getInventoryItems(currentInventoryFilter);
  const TOTAL_SLOTS = 30;
  const slotCount = Math.max(TOTAL_SLOTS, allItems.length);
  
  const counts = {
    all: getInventoryItems('all').length,
    weapons: getInventoryItems('weapons').length,
    gear: getInventoryItems('gear').length,
    relics: getInventoryItems('relics').length,
    trinkets: getInventoryItems('trinkets').length,
    materials: getInventoryItems('materials').length
  };

  const filters = [
    { id: 'all', label: 'All', count: counts.all, icon: 'rpg_backpack' },
    { id: 'weapons', label: 'Weapons', count: counts.weapons, icon: 'rpg_sword_iron' },
    { id: 'gear', label: 'Gear', count: counts.gear, icon: 'rpg_chest_iron' },
    { id: 'relics', label: 'Relics', count: counts.relics, icon: 'rpg_gem_diamond' },
    { id: 'trinkets', label: 'Trinkets', count: counts.trinkets, icon: 'rpg_coin_gold' },
    { id: 'materials', label: 'Materials', count: counts.materials, icon: 'rpg_crystal_purple' }
  ];

  const filterBarHtml = `
    <div class="inventory-filters">
      ${filters.map(f => `
        <button type="button" class="inventory-filter-btn ${currentInventoryFilter === f.id ? 'active' : ''}" data-inv-filter="${f.id}">
          <span data-sprite="${f.icon}" data-icon-size="16"></span>
          <span>${f.label}</span>
          <span class="inv-filter-badge">${f.count}</span>
        </button>
      `).join('')}
    </div>
  `;

  // Always prioritize a consumable material if no item is selected or previous item gone
  const activeItem = (selectedInventoryItem && allItems.some(it => it.id === selectedInventoryItem.id))
    ? allItems.find(it => it.id === selectedInventoryItem.id)
    : (allItems.find(it => it.consumable) || allItems[0] || null);
  selectedInventoryItem = activeItem;

  let slotsHtml = '';
  for(let i = 0; i < slotCount; i++) {
    const item = allItems[i];
    if(item) {
      const isSel = activeItem && activeItem.id === item.id;
      slotsHtml += `
        <div class="inventory-slot has-item ${isSel ? 'selected' : ''}" 
             data-slot-idx="${i}" 
             data-item-id="${item.id}"
             data-item-type="${item.type}"
             style="border-color:${item.rarityColor}; box-shadow: 0 0 10px ${item.rarityColor}28;"
             title="${item.name} (${item.rarityLabel})">
          <span data-sprite="${item.sprite}" data-icon-size="32"></span>
          ${item.count > 1 ? `<span class="inventory-slot-count">x${item.count}</span>` : ''}
          ${item.equipped ? `<span class="inventory-slot-badge">EQ</span>` : ''}
        </div>
      `;
    } else {
      slotsHtml += `
        <div class="inventory-slot empty" data-slot-idx="${i}">
          <span class="inventory-slot-empty-dot"></span>
        </div>
      `;
    }
  }

  const inspectorHtml = activeItem ? `
    <div class="inventory-inspector-card" style="border-color:${activeItem.rarityColor}; box-shadow: 0 0 20px ${activeItem.rarityColor}22;">
      <div class="inv-inspect-header">
        <div class="inv-inspect-icon" style="background: radial-gradient(circle, ${activeItem.rarityColor}33 0%, rgba(0,0,0,0.6) 70%); border: 1px solid ${activeItem.rarityColor};">
          <span data-sprite="${activeItem.sprite}" data-icon-size="44"></span>
        </div>
        <div>
          <div class="inv-inspect-tag" style="color:${activeItem.rarityColor}; border:1px solid ${activeItem.rarityColor}66;">
            ${activeItem.categoryLabel} &bull; ${activeItem.rarityLabel || activeItem.rarity.toUpperCase()}
          </div>
          <h3 class="inv-inspect-name" style="color:${activeItem.rarityColor};">${activeItem.name}</h3>
          ${activeItem.count > 1 ? `<span class="inv-inspect-qty">Carried: <strong>${activeItem.count}</strong></span>` : ''}
          ${activeItem.equipped ? `<span class="inv-inspect-eq-tag">✓ Currently Equipped</span>` : ''}
        </div>
      </div>
      <p class="inv-inspect-desc">${activeItem.desc}</p>
      <div class="inv-inspect-effect">
        <strong style="color:#ffd700;">EFFECT / STATS</strong>
        <span>${activeItem.effectDesc}</span>
      </div>
      ${activeItem.consumable ? `
        <button type="button" class="camp-action inv-consume-btn" data-action="consume-material" data-id="${activeItem.id}" style="margin-top:10px;padding:12px;background:linear-gradient(135deg, #7b1fa2, #ba68c8);border:2px solid #ea80fc;color:#fff;font-weight:bold;font-size:13px;border-radius:6px;width:100%;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 15px rgba(224, 64, 251, 0.4);">
          <span data-sprite="${activeItem.sprite}" data-icon-size="22"></span>
          <span>✨ CONSUME ${activeItem.name.toUpperCase()} (${activeItem.count} remaining)</span>
        </button>
      ` : ''}
      ${(activeItem.id === 'chickenCrown' || activeItem.id === 'chickenKingCrown') ? `
        <button type="button" class="camp-action" onclick="window.toggleChickenCrownCosmetic()" style="margin-top:10px;padding:11px;background:linear-gradient(135deg, #f57f17, #ffb300);border:2px solid #ffe082;color:#1b1200;font-weight:bold;font-size:13px;border-radius:6px;width:100%;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 15px rgba(255, 193, 7, 0.4);">
          <span data-sprite="chickenCrown" data-icon-size="22"></span>
          <span>👑 ${campSave.equippedChickenCrown ? 'UNEQUIP CROWN FROM HEAD' : 'EQUIP CROWN ON HEAD'}</span>
        </button>
      ` : ''}
      ${(activeItem.type === 'weapons' || activeItem.id === 'rainbow_staff' || activeItem.id === 'prismStaff') ? `
        <button type="button" class="camp-action inv-equip-weapon-btn" data-action="weapon-toggle" data-id="${activeItem.id === 'rainbow_staff' ? 'prismStaff' : activeItem.id}" style="margin-top:10px;padding:10px;background:${campSave.loadoutWeapons.includes(activeItem.id === 'rainbow_staff' ? 'prismStaff' : activeItem.id) ? 'linear-gradient(135deg, #2e7d32, #43a047)' : 'linear-gradient(135deg, #e65100, #ff8f00)'};border:2px solid ${campSave.loadoutWeapons.includes(activeItem.id === 'rainbow_staff' ? 'prismStaff' : activeItem.id) ? '#a5d6a7' : '#ffd54f'};color:#fff;font-weight:bold;font-size:12px;border-radius:6px;width:100%;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
          <span data-sprite="${activeItem.sprite}" data-icon-size="20"></span>
          <span>${campSave.loadoutWeapons.includes(activeItem.id === 'rainbow_staff' ? 'prismStaff' : activeItem.id) ? `✓ EQUIPPED (${campSave.loadoutWeapons.length}/4) · UNEQUIP` : `EQUIP IN LOADOUT (${campSave.loadoutWeapons.length}/4)`}</span>
        </button>
      ` : ''}
    </div>
  ` : `
    <div class="inventory-inspector-card empty">
      <div style="text-align:center; padding: 40px 10px; color:#8a8a92;">
        <span data-sprite="rpg_backpack" data-icon-size="48" style="opacity:0.35; display:block; margin:0 auto 10px;"></span>
        <strong>Inventory is Empty</strong>
        <p style="font-size:11px; margin-top:6px;">Venture into expeditions, slay bosses, or click "+Add Test Materials" to test.</p>
      </div>
    </div>
  `;

  panel.innerHTML = `
    <div class="camp-panel-heading">
      <h2>Inventory & Collectibles</h2>
      <span>30 Grid Slots &bull; Materials, Weapons, Relics, Charms & Gear</span>
    </div>
    <div class="inventory-container">
      ${filterBarHtml}
      <div class="inventory-main-layout">
        <div class="inventory-grid-wrap">
          <div class="inventory-grid">${slotsHtml}</div>
          <small class="inventory-grid-hint">Click or hover slot to inspect &bull; Click Consume to apply permanent bonus</small>
        </div>
        <div id="inventoryInspector">${inspectorHtml}</div>
      </div>
    </div>
  `;

  panel.querySelectorAll('.inventory-slot.has-item').forEach(slot => {
    slot.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(slot.dataset.slotIdx, 10);
      const item = allItems[idx];
      if(!item) return;
      selectedInventoryItem = item;
      playSfx('confirm');
      renderCampInventory(panel);
    });
  });

  const consumeBtn = panel.querySelector('.inv-consume-btn');
  if(consumeBtn) {
    consumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      consumeMaterial(consumeBtn.dataset.id);
    });
  }

  renderAtlasIcons(panel);
}

function renderCampConditions() {
  const el = document.getElementById('campConditionsWidget');
  if (!el) return;

  const conditions = [];

  // Permanent stat bonuses from materials & upgrades
  if (campSave.permHpBonus) conditions.push({ icon: '❤️', label: `+${campSave.permHpBonus} Max HP`, color: '#ef5350' });
  if (campSave.permDmgBonus) conditions.push({ icon: '⚔️', label: `+${Math.round(campSave.permDmgBonus * 100)}% DMG`, color: '#ffb74d' });
  if (campSave.permDefenseBonus) conditions.push({ icon: '🛡️', label: `+${Math.round(campSave.permDefenseBonus * 100)}% Armor`, color: '#64b5f6' });
  if (campSave.permSpeedBonus) conditions.push({ icon: '👟', label: `+${Math.round(campSave.permSpeedBonus * 100)}% Speed`, color: '#81c784' });
  if (campSave.permRegenBonus) conditions.push({ icon: '🌿', label: `+${campSave.permRegenBonus.toFixed(1)}/s Regen`, color: '#aed581' });
  if (campSave.permRerolls) conditions.push({ icon: '🎲', label: `+${campSave.permRerolls} Reroll`, color: '#ba68c8' });
  if (campSave.permBanishes) conditions.push({ icon: '🚫', label: `+${campSave.permBanishes} Banish`, color: '#ce93d8' });

  // Quest chains & story perks
  if (campSave.merchantDiscount) conditions.push({ icon: '🏷️', label: '-20% Store Cost', color: '#ffd54f' });
  if (campSave.cartographerBonus) conditions.push({ icon: '🗺️', label: '+30% Vision', color: '#4dd0e1' });

  // Loadout companions & mount
  if (campSave.equippedMount && MOUNTS[campSave.equippedMount]) {
    conditions.push({ icon: '🐎', label: `Mount: ${MOUNTS[campSave.equippedMount].name}`, color: '#b0bec5' });
  }
  if (campSave.companions && campSave.companions.length > 0) {
    conditions.push({ icon: '🐾', label: `${campSave.companions.length} Companions`, color: '#ffcc80' });
  }

  // Gear & Relics
  const setPiecesCount = Object.keys(campSave.equippedSetPieces || {}).length;
  if (setPiecesCount > 0) {
    conditions.push({ icon: '👑', label: `${setPiecesCount}/3 Set Pieces`, color: '#ffd700' });
  }
  if (typeof relicJournal !== 'undefined' && relicJournal && relicJournal.length > 0) {
    conditions.push({ icon: '🔮', label: `${relicJournal.length} Relics`, color: '#80cbc4' });
  }

  if (conditions.length === 0) {
    el.innerHTML = `
      <div class="camp-conditions-header">
        <span class="camp-cond-title">CONDITIONS & BUFFS</span>
      </div>
      <div class="camp-conditions-empty">No active buffs yet &bull; Consume materials or equip gear</div>
    `;
    return;
  }

  el.innerHTML = `
    <div class="camp-conditions-header">
      <span class="camp-cond-title">⚡ ACTIVE CONDITIONS & BUFFS</span>
      <span class="camp-cond-count">${conditions.length}</span>
    </div>
    <div class="camp-conditions-list">
      ${conditions.map(c => `
        <div class="condition-badge" style="border-color:${c.color}66; box-shadow:0 0 8px ${c.color}22;" title="${c.label}">
          <span class="condition-badge-icon">${c.icon}</span>
          <span class="condition-badge-text" style="color:${c.color}">${c.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function isCampUnlocked(biomeId) {
  if (biomeId === 'plains') return true;
  if (!campSave.unlockedCamps) campSave.unlockedCamps = ['plains'];
  if (campSave.unlockedCamps.includes(biomeId)) return true;
  const curChar = getSelectedCharacter();
  if (curChar && curChar.biome === biomeId) return true;
  if (campSave.campBiome === biomeId) return true;
  return false;
}
window.isCampUnlocked = isCampUnlocked;


window.toggleChickenCrownCosmetic = function() {
  if (!campSave.unlockedChickenCrown && !isTrophyUnlocked({ id: 'chickenCrown', achId: 'chickenKingSlayer' })) return;
  campSave.unlockedChickenCrown = true;
  campSave.equippedChickenCrown = !campSave.equippedChickenCrown;
  saveCamp();
  playSfx('confirm');
  renderCamp();
};

function renderCampTrophies(panel){
  syncTrophiesFromAchievements();
  const unlockedCount = SPECIAL_ITEMS_LIST.filter(item => isTrophyUnlocked(item)).length;
  const totalCount = SPECIAL_ITEMS_LIST.length;
  const hasCrown = Boolean(campSave.unlockedChickenCrown || isTrophyUnlocked({ id: 'chickenCrown', achId: 'chickenKingSlayer' }));
  const crownEquipped = Boolean(hasCrown && campSave.equippedChickenCrown);
  const featherStacks = Math.max(0, Math.min(5, Number(campSave.chickenFeathers) || 0));
  const hasGoldEgg = Boolean(campSave.hasGoldenEgg || (campSave.materials && campSave.materials.goldenEgg > 0));

  const trophyCards = SPECIAL_ITEMS_LIST.map(item => {
    const isUnlocked = isTrophyUnlocked(item);
    const isNew = (campSave.newTrophyIds || []).includes(item.id);

    const typeColor = item.type === 'Trinket' ? '#81d4fa' : item.type === 'Consumable' ? '#ff8a80' : '#ffd54f';
    const borderStyle = isUnlocked ? 'border: 2px solid #ffd700; box-shadow: 0 0 12px rgba(255, 215, 0, 0.28); background: rgba(30, 24, 15, 0.88);' : 'border: 1px solid #2d2015; opacity: 0.55; background: rgba(15, 12, 10, 0.7);';

    return `
      <div class="trophy-card ${isUnlocked ? 'unlocked' : 'locked'}" style="position:relative; display:flex; align-items:center; gap:14px; padding:12px; border-radius:8px; ${borderStyle}">
        ${isNew ? '<span class="trophy-new-badge">NEW!</span>' : ''}
        <div style="width:56px; height:56px; min-width:56px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); border:1px solid ${isUnlocked ? '#ffd700' : '#444'}; border-radius:8px;">
          ${isUnlocked 
            ? `<span data-sprite="${item.sprite}" data-icon-size="46"></span>` 
            : `<span data-sprite="${item.sprite}" data-icon-size="46" style="filter: brightness(0); opacity: 0.25;"></span>`
          }
        </div>
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:${isUnlocked ? '#ffd54f' : '#777'}; font-size:14px;">${isUnlocked ? item.name : '???'}</strong>
            <span style="font-size:10px; font-weight:bold; color:${typeColor}; border:1px solid ${typeColor}; padding:1px 5px; border-radius:4px;">${item.type.toUpperCase()}</span>
          </div>
          <div style="font-size:12px; color:${isUnlocked ? '#ffffff' : '#888'}; margin-top:3px;">
            ${isUnlocked ? item.effect : 'Locked Achievement'}
          </div>
          <div style="font-size:11px; color:#aaa; margin-top:4px; font-style:italic;">
            🏆 Achievement: ${isUnlocked ? item.achName : '???'} (${item.achDesc})
          </div>
        </div>
      </div>
    `;
  }).join('');

  panel.innerHTML = `
    <div class="camp-panel-heading">
      <h2>Trophies &amp; Cosmetics 🏆</h2>
      <span>Unlocked: ${unlockedCount} / ${totalCount} &bull; Cosmetics, Permanent Boosts &amp; Special Trophies</span>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:14px; padding:12px; border-radius:8px; border:1px solid #ffd54f66; background:rgba(36, 28, 14, 0.85);">
      <div style="flex:1; min-width:220px; display:flex; align-items:center; gap:12px;">
        <div style="width:52px; height:52px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.55); border:1px solid ${hasCrown ? '#ffd700' : '#444'}; border-radius:8px;">
          <span data-sprite="chickenCrown" data-icon-size="42" style="${hasCrown ? '' : 'filter:brightness(0);opacity:0.3;'}"></span>
        </div>
        <div style="flex:1;">
          <div style="font-weight:bold; color:#ffd54f; font-size:13px;">👑 Chicken Crown (Cosmetic)</div>
          <div style="font-size:11px; color:#ccc; margin-top:2px;">${hasCrown ? (crownEquipped ? 'Currently Equipped on Character' : 'Unlocked — Click to Wear') : 'Defeat the Chicken King in the Chicken Dimension'}</div>
          ${hasCrown ? `<button onclick="window.toggleChickenCrownCosmetic()" style="margin-top:5px; padding:4px 10px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer; border:1px solid #ffd700; background:${crownEquipped ? '#ffd700' : '#2b2112'}; color:${crownEquipped ? '#1a1206' : '#ffd700'};">${crownEquipped ? '✓ Equipped (Unequip)' : 'Equip Crown'}</button>` : ''}
        </div>
      </div>
      <div style="flex:1; min-width:200px; display:flex; align-items:center; gap:12px;">
        <div style="width:52px; height:52px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.55); border:1px solid ${featherStacks > 0 ? '#ffca28' : '#444'}; border-radius:8px;">
          <span data-sprite="chickenFeather" data-icon-size="42" style="${featherStacks > 0 ? '' : 'filter:brightness(0);opacity:0.3;'}"></span>
        </div>
        <div>
          <div style="font-weight:bold; color:#ffca28; font-size:13px;">🪶 Chicken Feather Boost</div>
          <div style="font-size:12px; color:#fff; margin-top:2px;">Stacks: <strong>${featherStacks} / 5</strong> (+${featherStacks}% Move Speed)</div>
          <div style="font-size:11px; color:#aaa; margin-top:2px;">Golden Egg: <strong style="color:${hasGoldEgg ? '#76ed8a' : '#888'};">${hasGoldEgg ? 'Discovered (+5 Max HP)' : 'Undiscovered'}</strong></div>
        </div>
      </div>
    </div>
    <div class="trophies-grid">
      ${trophyCards}
    </div>
  `;

  // Clear "NEW!" badges once the tab has been viewed
  if (campSave.newTrophyIds && campSave.newTrophyIds.length > 0) {
    campSave.newTrophyIds = [];
    saveCamp();
  }
}

function renderCamp(){
  if(typeof window !== 'undefined' && window.IS_DEMO){
    document.body.classList.add('is-demo');
  }
  const titleSmall = document.querySelector('.camp-brand small');
  if(titleSmall && campSave.unlockedTitles && campSave.unlockedTitles.length){
    titleSmall.textContent = campSave.unlockedTitles[campSave.unlockedTitles.length - 1].toUpperCase();
  }
  const panel=document.getElementById('campPanel');
  if(!panel)return;
  syncCharacterDisplay();
  renderCampConditions();
  document.getElementById('campGold').textContent=campSave.gold;
  const goldBannerEl=document.getElementById('campGoldBanner');
  if(goldBannerEl)goldBannerEl.textContent=campSave.gold;
  document.getElementById('campRuns').textContent=campSave.runs;
  const campDayEl=document.getElementById('campDay');
  if(campDayEl)campDayEl.textContent=campSave.day || 1;

  // Update Set Pieces counter in ornate banner
  const eqSetCount=Object.values(campSave.equippedSetPieces||{}).filter(Boolean).length;
  const setPiecesCountEl=document.getElementById('campSetPiecesCount');
  if(setPiecesCountEl)setPiecesCountEl.textContent=`${eqSetCount}/3`;

  // Update 3 interactive condition hexagons in ornate banner
  const compCount=(companions?companions.length:0)+(campSave.equippedMount?1:0);
  const hexComp=document.getElementById('campBuffCompanions');
  const badgeComp=document.getElementById('hexBadgeCompanions');
  if(hexComp){
    hexComp.classList.toggle('active',compCount>0);
    const compNames=companions.map(c=>c.name.split(',')[0]);
    if(campSave.equippedMount&&MOUNTS[campSave.equippedMount])compNames.push(`Mount: ${MOUNTS[campSave.equippedMount].name}`);
    hexComp.title=compNames.length?`Active Companions & Mount: ${compNames.join(', ')} (Click for Inn)`:'No active companions yet (Click to visit the Inn)';
  }
  if(badgeComp)badgeComp.textContent=String(compCount);

  const defCount=(campSave.ownedGear?.length||0)+(campSave.permHpBonus?1:0)+(campSave.permDefenseBonus?1:0)+(campSave.wellRested?1:0);
  const hexDef=document.getElementById('campBuffDefense');
  const badgeDef=document.getElementById('hexBadgeDefense');
  if(hexDef){
    hexDef.classList.toggle('active',defCount>0);
    const defList=[];
    if(campSave.wellRested)defList.push('Well Rested (Full HP & Clear Ailments)');
    if(campSave.ownedGear?.length)defList.push(`${campSave.ownedGear.length} Gear Pieces`);
    if(campSave.permHpBonus)defList.push(`+${campSave.permHpBonus} Max HP`);
    if(campSave.permDefenseBonus)defList.push(`+${Math.round(campSave.permDefenseBonus*100)}% Armor`);
    hexDef.title=defList.length?`Defense & Gear Buffs: ${defList.join(' · ')} (Click for Inventory)`:'Armor, Gear & Rested Buffs (Click to open Inventory)';
  }
  if(badgeDef)badgeDef.textContent=String(defCount);

  const trinketCount=(campSave.equippedTrinkets||[]).filter(Boolean).length+(typeof relicJournal!=='undefined'&&relicJournal?relicJournal.length:0)+(campSave.permDmgBonus?1:0)+(campSave.permSpeedBonus?1:0)+(campSave.permRegenBonus?1:0);
  const hexTrinket=document.getElementById('campBuffTrinkets');
  const badgeTrinket=document.getElementById('hexBadgeTrinkets');
  if(hexTrinket){
    hexTrinket.classList.toggle('active',trinketCount>0);
    const trinketList=[];
    const eqTrinkets=(campSave.equippedTrinkets||[]).filter(Boolean).length;
    if(eqTrinkets)trinketList.push(`${eqTrinkets} Equipped Trinket${eqTrinkets>1?'s':''}`);
    if(typeof relicJournal!=='undefined'&&relicJournal?.length)trinketList.push(`${relicJournal.length} Relic${relicJournal.length>1?'s':''}`);
    if(campSave.permDmgBonus)trinketList.push(`+${Math.round(campSave.permDmgBonus*100)}% DMG`);
    if(campSave.permSpeedBonus)trinketList.push(`+${Math.round(campSave.permSpeedBonus*100)}% Speed`);
    if(campSave.permRegenBonus)trinketList.push(`+${campSave.permRegenBonus.toFixed(1)}/s Regen`);
    hexTrinket.title=trinketList.length?`Active Blessings & Charms: ${trinketList.join(' · ')} (Click for Trinkets)`:'Trinkets, Relics & Blessings (Click to open Trinkets)';
  }
  if(badgeTrinket)badgeTrinket.textContent=String(trinketCount);

  // 1 Featured Familiar on Camp Menu (Prioritize player's equipped active companion)
  const curCharacter = getSelectedCharacter();
  const activeSceneId = resolveCampSceneId(campSave.campBiome || curCharacter.biome || 'plains');
  campSave.campBiome = activeSceneId;
  const campSceneEl = document.querySelector('.camp-scene');
  if(campSceneEl && campSceneEl.dataset.scene !== activeSceneId) setCampScene(activeSceneId);
  const localBiomeFamiliars = CAMP_COMPANIONS.filter(c => c.biome === activeSceneId);
  const activeFamiliar = companions[0] || localBiomeFamiliars[0] || CAMP_COMPANIONS[0];
  const isEnlisted = companions.some(c => c.id === activeFamiliar.id);
  const famAvatar = document.getElementById('campMenuFamiliarAvatar');
  const famTag = document.getElementById('campMenuFamiliarTag');
  const famName = document.getElementById('campMenuFamiliarName');
  const famRole = document.getElementById('campMenuFamiliarRole');
  const famQuote = document.getElementById('campMenuFamiliarQuote');
  if(famAvatar){
    famAvatar.dataset.sprite = activeFamiliar.sprite;
    delete famAvatar.dataset.atlasRendered;
  }
  if(famTag) famTag.textContent = isEnlisted ? 'ACTIVE FAMILIAR' : 'CAMP GUARDIAN';
  if(famName) famName.textContent = activeFamiliar.name;
  if(famRole) famRole.textContent = activeFamiliar.role;
  if(famQuote) famQuote.textContent = activeFamiliar.desc || '';
  const famCard = document.getElementById('campMenuFamiliarCard');
  if(famCard) renderAtlasIcons(famCard);

  // Sync ornate Set out / Continue button
  const setOutBtn=document.getElementById('campSetOutBtn');
  const setOutLabel=document.getElementById('campSetOutLabel');
  if(setOutBtn){
    setOutBtn.classList.toggle('continuing',Boolean(hasResumableProgress));
    if(setOutLabel)setOutLabel.textContent=hasResumableProgress?'Continue':'';
  }

  if(typeof window !== 'undefined' && window.IS_DEMO && ['quests', 'mounts', 'journal', 'trophies'].includes(campTab)){
    campTab = 'home';
  }
  panel.dataset.tab = campTab;
  document.querySelectorAll('.camp-tab').forEach(button=>button.classList.toggle('active',button.dataset.tab===campTab));
  if(campTab==='home'){
    const quest=getCampQuest(campSave.questId);
    panel.innerHTML=`<div class="camp-panel-heading"><h2>Welcome back, wayfarer</h2><span>${hasResumableProgress?`Expedition paused at level ${player.level}`:'All quiet within the palisade'}</span></div>
      <div class="camp-home-grid">
        <article class="camp-service camp-service-banner camp-service-fire" data-action="rest"><strong>Rest by the fire</strong><p>Recover fully and clear lingering ailments before setting out.</p></article>
        ${(typeof window !== 'undefined' && window.IS_DEMO) ? '' : '<article class="camp-service camp-service-banner camp-service-lead" data-action="open-tab" data-id="quests"><strong>' + (quest?'Contract accepted':'A lead from the frontier') + '</strong><p>' + (quest?`${quest.name} · ${quest.objective}`:'Check the quest board for paid work and a reason to venture out.') + '</p></article>'}
        <article class="camp-service camp-service-banner camp-service-road" data-action="open-tab" data-id="inventory"><strong>Ready for the road</strong><p>${campSave.loadoutWeapons.length} weapons · ${campSave.ownedGear.length} gear pieces · ${campSave.potions} healing draughts</p></article>
        <article class="camp-service camp-service-banner camp-service-company" data-action="open-tab" data-id="tavern"><strong>Your company</strong><p>${companions.length?companions.map(item=>item.name.split(',')[0]).join(' · '):'Visit the Inn to hire a helper or familiar.'}</p></article>
      </div>
      <section class="camp-character-picker" aria-label="Choose your character"><div class="camp-difficulty-bar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;"><div class="camp-character-heading" style="margin-bottom:0;">CHOOSE YOUR CHARACTER</div><div style="display:flex;align-items:center;gap:6px;"><span style="font-size:10px;font-weight:700;color:#d9bd75;text-transform:uppercase;letter-spacing:0.8px;">Difficulty:</span><div style="display:inline-flex;background:rgba(15,20,25,0.85);border:1px solid #d9bd7555;border-radius:16px;padding:2px;gap:2px;"><button type="button" class="camp-diff-btn ${(window.GAME_SETTINGS?.difficulty ?? 0) === 0 ? 'active' : ''}" data-action="set-difficulty" data-id="0" title="Adventurer: -25% enemy DMG, slower early mobs, +food drops" style="padding:3px 10px;border:none;border-radius:14px;font-size:10px;font-weight:bold;cursor:pointer;background:${(window.GAME_SETTINGS?.difficulty ?? 0) === 0 ? 'linear-gradient(135deg, #2e7d32, #43a047)' : 'transparent'};color:${(window.GAME_SETTINGS?.difficulty ?? 0) === 0 ? '#fff' : '#aaa'};box-shadow:${(window.GAME_SETTINGS?.difficulty ?? 0) === 0 ? '0 0 8px rgba(76,175,80,0.5)' : 'none'};">🛡️ Adventurer</button><button type="button" class="camp-diff-btn ${(window.GAME_SETTINGS?.difficulty ?? 0) !== 0 ? 'active' : ''}" data-action="set-difficulty" data-id="1" title="Survivor: Standard roguelite challenge" style="padding:3px 10px;border:none;border-radius:14px;font-size:10px;font-weight:bold;cursor:pointer;background:${(window.GAME_SETTINGS?.difficulty ?? 0) !== 0 ? 'linear-gradient(135deg, #c62828, #e53935)' : 'transparent'};color:${(window.GAME_SETTINGS?.difficulty ?? 0) !== 0 ? '#fff' : '#aaa'};box-shadow:${(window.GAME_SETTINGS?.difficulty ?? 0) !== 0 ? '0 0 8px rgba(229,57,53,0.5)' : 'none'};">⚔️ Survivor</button></div></div></div><div class="camp-character-options">${PLAYABLE_CHARACTERS.map(character=>`<button class="camp-character-option ${campSave.character===character.id?'selected':''}" type="button" data-action="character" data-id="${character.id}" aria-pressed="${campSave.character===character.id}">${character.directionalChar ? `<div style="width:54px;height:54px;overflow:hidden;display:inline-block;flex-shrink:0;border-radius:4px;"><img src="${character.previewWebp || 'characters/idle_preview.webp?v260'}" style="width:54px;height:54px;object-fit:contain;image-rendering:pixelated;${(character.campFaceLeft || character.id==='wayfarer') ? 'transform:scaleX(-1);' : ''}"></div>` : (character.customChar ? `<div style="width:54px;height:54px;overflow:hidden;display:inline-block;flex-shrink:0;border-radius:4px;"><img src="${character.imgIdle.src}" style="width:216px;height:216px;object-position: 0 0;image-rendering:pixelated;${(character.campFaceLeft || character.id==='wayfarer') ? 'transform:scaleX(-1);' : ''}"></div>` : `<span data-sprite="${character.sprite}" data-icon-size="54"></span>`)}<div style="display:flex;flex-direction:column;"><strong>${character.name}</strong><small>${character.race} &bull; ${character.desc}</small></div></button>`).join('')}</div></section>`;
  }else if(campTab==='quests'){
    const todayKey = getDailyDateKey();
    panel.innerHTML=`<div class="camp-panel-heading"><h2>Quest Board</h2><span>Daily Rotations &bull; Story Chains &bull; Bounties &bull; Challenges</span></div>
      <div class="quest-filter">
        <button class="quest-tab active" type="button" data-quest-filter="all">All</button>
        <button class="quest-tab" type="button" data-quest-filter="daily">Daily (3)</button>
        <button class="quest-tab" type="button" data-quest-filter="story">Story Chains</button>
        <button class="quest-tab" type="button" data-quest-filter="bounty">Bounties</button>
        <button class="quest-tab" type="button" data-quest-filter="challenge">Challenges</button>
      </div>
      <div class="daily-quest-banner">
        <span class="daily-banner-icon" data-sprite="rpg_hourglass" data-icon-size="24"></span>
        <div class="daily-banner-info">
          <strong>📅 DAILY CONTRACTS · 24H ROTATION</strong>
          <small>3 fresh contracts every day. Reset in: <span id="dailyCountdown" class="daily-timer-badge">${getDailyResetTimeRemaining()}</span></small>
        </div>
      </div>
      ${getAllCampQuests().map(quest=>{
        const isDaily = quest.category === 'daily';
        const isDailyDone = isDaily && Boolean(campSave.dailyCompleted && campSave.dailyCompleted.date === todayKey && campSave.dailyCompleted.quests.includes(quest.id));
        const status = getStoryStageStatus(quest);
        const isActive = campSave.questId === quest.id;
        const isCompleted = isDaily ? isDailyDone : status.isCompleted;
        const isLocked = !status.isUnlocked;
        const canAccept = (!campSave.questId || isActive) && !isLocked && !isCompleted;
        const progress = isActive ? Math.floor(getQuestProgress(quest)) : (isCompleted ? quest.target : 0);
        const pct = isCompleted ? 100 : Math.min(100, progress / quest.target * 100);
        const progressBar = (isActive || isCompleted) ? `<div class="quest-progress"><div class="quest-progress-bar" style="width:${pct}%"></div><span>${isCompleted?'COMPLETED ✓':`${progress}/${quest.target}`}</span></div>` : '';
        
        let btnLabel = 'Accept';
        let btnIcon = 'rpg_scroll';
        let btnClass = 'camp-action';
        let btnDisabled = '';
        if(isCompleted){
          btnLabel = isDaily ? 'Done Today' : 'Completed';
          btnIcon = 'rpg_shield_gold';
          btnClass = 'camp-action secondary';
          btnDisabled = 'disabled';
        }else if(isLocked){
          btnLabel = `Stage ${quest.stage-1} Req.`;
          btnIcon = 'rpg_shield_wood';
          btnDisabled = 'disabled';
        }else if(isActive){
          btnLabel = 'Accepted';
          btnIcon = 'rpg_shield_iron';
          btnClass = 'camp-action secondary';
        }else if(!canAccept){
          btnLabel = 'Locked';
          btnDisabled = 'disabled';
        }
        
        const relicTag = (quest.legendaryReward || quest.relicReward) ? '<small style="display:block;color:#ffd54f;font-size:10px;font-weight:700;">+ RELIC</small>' : '';
        const dailyBadge = isDaily ? `<span class="daily-slot-badge ${quest.dailySlot||''}">${(quest.slotName||'DAILY').toUpperCase()}</span>` : '';
        
        return `<div class="camp-contract ${isActive?'active':''} ${isCompleted?(isDaily?'daily-stage-completed':'story-stage-completed'):''} ${isLocked?'story-stage-locked':''}" data-quest-category="${quest.category||'standard'}">
          <span class="camp-contract-icon" data-sprite="${quest.sprite}"></span>
          <div class="camp-contract-copy">
            ${dailyBadge}
            ${quest.chainName ? `<span class="quest-chain-badge">${quest.chainName} · Stage ${quest.stage}/3 ${isCompleted?'✓':''}</span>` : ''}
            <strong>${quest.name}</strong>
            <small>${quest.objective}</small>
            ${quest.flavor ? `<em class="quest-flavor">${quest.flavor}</em>` : ''}
            ${quest.chainRewardDesc ? `<span class="quest-chain-final-reward">🏆 Chain Reward: <strong>${quest.chainRewardDesc}</strong></span>` : ''}
            ${progressBar}
          </div>
          <span class="camp-price"><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${quest.reward}${relicTag}</span>
          <button class="${btnClass}" type="button" 
            data-action="quest" data-id="${quest.id}" ${btnDisabled}>
            <span data-sprite="${btnIcon}" data-icon-size="18"></span>
            ${btnLabel}
          </button>
        </div>`;
      }).join('')}`;
  }else if(campTab==='inventory'){
    renderCampInventory(panel);
  }else if(campTab==='shop'){
    const weaponCards=CAMP_WEAPONS.map(item=>{
      const owned=campSave.ownedWeapons.includes(item.id),equipped=campSave.loadoutWeapons.includes(item.id);
      const label=owned?(equipped?'Unequip':'Equip'):`Buy · ${item.cost}g`;
      const action=owned?'weapon-toggle':'weapon-buy';
      const disabled=owned&&equipped&&campSave.loadoutWeapons.length===1;
      return `<div class="camp-contract"><span class="camp-contract-icon" data-sprite="${item.sprite}"></span><div class="camp-contract-copy"><strong>${item.name}</strong><small>${item.desc}</small></div>${owned?'<span class="camp-price">Owned</span>':(campSave.merchantDiscount?`<span class="camp-price"><del style="opacity:0.5;margin-right:4px;">${item.cost}</del><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${getCampItemCost(item.cost)} <small style="color:#4caf50">-20%</small></span>`:`<span class="camp-price"><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${item.cost}</span>`)}<button class="camp-action ${owned?'secondary':''}" type="button" data-action="${action}" data-id="${item.id}" ${disabled?'disabled':''}><span data-sprite="${owned?'rpg_bow':'rpg_coin_gold'}" data-icon-size="18"></span> ${label}</button></div>`;
    }).join('');
    
    const toolCards=CAMP_TOOLS.map(item=>{
      const owned=campSave.ownedWeapons.includes(item.id),equipped=campSave.loadoutWeapons.includes(item.id);
      const label=owned?(equipped?'Unequip':'Equip'):`Buy  ${item.cost}g`;
      const action=owned?'weapon-toggle':'weapon-buy';
      const disabled=owned&&equipped&&campSave.loadoutWeapons.length===1;
      return `<div class="camp-contract"><span class="camp-contract-icon" data-sprite="${item.sprite}"></span><div class="camp-contract-copy"><strong>${item.name}</strong><small>${item.desc}</small></div>${owned?'<span class="camp-price">Owned</span>':(campSave.merchantDiscount?`<span class="camp-price"><del style="opacity:0.5;margin-right:4px;">${item.cost}</del><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${getCampItemCost(item.cost)} <small style="color:#4caf50">-20%</small></span>`:`<span class="camp-price"><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${item.cost}</span>`)}<button class="camp-action ${owned?'secondary':''}" type="button" data-action="${action}" data-id="${item.id}" ${disabled?'disabled':''}><span data-sprite="${owned?item.sprite:'rpg_coin_gold'}" data-icon-size="18"></span> ${label}</button></div>`;
    }).join('');
    const gearCards=CAMP_GEAR.filter(item=>item.id!=='mask_of_calm').map(item=>{
      const gear=EQUIPMENT_UPGRADES.find(entry=>entry.id===item.id) || (item.weaponId ? WEAPON_DEFS[item.weaponId] : null) || {name: 'Rainbow Staff', desc: 'The ultimate prismatic staff.'},owned=campSave.ownedGear.includes(item.id) || (item.weaponId && campSave.ownedWeapons.includes(item.weaponId));
      if(item.isLegendaryWeapon){
        const equipped=campSave.loadoutWeapons.includes(item.weaponId);
        const glowStyle='border:2px solid #ff5722; box-shadow:0 0 18px rgba(255, 87, 34, 0.7); background:linear-gradient(135deg, rgba(45, 15, 10, 0.92), rgba(25, 10, 30, 0.92));';
        const action=owned?'weapon-toggle':'gear-buy';
        const actionId=owned?item.weaponId:item.id;
        const btnLabel=owned?(equipped?'Unequip':'Equip'):'Buy';
        const disabled=owned&&equipped&&campSave.loadoutWeapons.length===1;
        return `<div class="camp-contract legendary-store-item" title="${item.tooltip}" style="${glowStyle}">
          <span class="camp-contract-icon" data-sprite="${item.sprite}"></span>
          <div class="camp-contract-copy">
            <strong style="color:#ffd54f;">${gear.name}</strong>
            <small>${gear.desc}</small>
            <small style="color:#ff8a65; font-style:italic; display:block; margin-top:2px;">"${item.tooltip}"</small>
          </div>
          ${owned?'<span class="camp-price" style="color:#ffd54f;">Unlocked</span>':`<span class="camp-price"><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${item.cost.toLocaleString()}</span>`}
          <button class="camp-action ${owned&&equipped?'secondary':''}" type="button" data-action="${action}" data-id="${actionId}" ${disabled?'disabled':''}>
            <span data-sprite="${owned?'prism_staff':'rpg_coin_gold'}" data-icon-size="18"></span> ${btnLabel}
          </button>
        </div>`;
      }
      return `<div class="camp-contract"><span class="camp-contract-icon" data-sprite="${item.sprite}"></span><div class="camp-contract-copy"><strong>${gear.name}</strong><small>${gear.desc}</small></div>${owned?'<span class="camp-price">Equipped</span>':(campSave.merchantDiscount?`<span class="camp-price"><del style="opacity:0.5;margin-right:4px;">${item.cost}</del><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${getCampItemCost(item.cost)} <small style="color:#4caf50">-20%</small></span>`:`<span class="camp-price"><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${item.cost}</span>`)}<button class="camp-action ${owned?'secondary':''}" type="button" data-action="gear-buy" data-id="${item.id}" ${owned?'disabled':''}><span data-sprite="${owned?'rpg_shield_iron':'rpg_coin_gold'}" data-icon-size="18"></span> ${owned?'Owned':'Buy'}</button></div>`;
    }).join('');
        const curBiome = resolveCampSceneId(campSave.campBiome);
    const buildingNpcs = CAMP_BUILDING_NPCS[curBiome] || CAMP_BUILDING_NPCS.plains;
    const storeNpc = buildingNpcs.store;
    panel.innerHTML=`<div class="camp-panel-heading"><h2>Store &bull; ${CAMP_SCENES[curBiome]?.name || 'Camp'}</h2><span>Choose up to 4 weapons &bull; Gear stays with you</span></div>
      <div class="camp-service-npc-banner camp-service-store-banner">
        <div class="camp-service-npc-avatar" data-sprite="${storeNpc.sprite}" data-icon-size="76"></div>
        <div class="camp-service-npc-copy">
          <div class="camp-service-npc-badge-row">
            <span class="camp-service-npc-tag store-tag">STORE MERCHANT</span>
            <strong class="camp-service-npc-name">${storeNpc.name}</strong>
            <span class="camp-service-npc-title">${storeNpc.title}</span>
          </div>
          <div class="camp-service-npc-quote">"${storeNpc.quote}"</div>
        </div>
      </div>
      <details class="camp-store-section" open><summary class="camp-store-summary">Weapons</summary>${weaponCards}</details>
      <details class="camp-store-section"><summary class="camp-store-summary">Tools</summary>${toolCards}</details>
      <details class="camp-store-section"><summary class="camp-store-summary">Gear</summary>${gearCards}</details>
      <details class="camp-store-section"><summary class="camp-store-summary">Consumables</summary><div class="camp-contract"><span class="camp-contract-icon" data-sprite="${window.extItemSprite('s_healing_draught')}"></span><div class="camp-contract-copy"><strong>Healing draught</strong><small>Press H during a run to restore 35 health.</small></div><span class="camp-price"><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> 100</span><button class="camp-action" type="button" data-action="potion-buy"><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> Buy</button></div></details>`;
  }else if(campTab==='sets'){
    const equipped = (campSave && campSave.equippedSetPieces) ? campSave.equippedSetPieces : {helm:null,armor:null,weapon:null};
    const owned = (campSave && campSave.ownedSetPieces) ? campSave.ownedSetPieces : [];
    const bonuses = getActiveSetBonuses();
    const activeBonusesList = bonuses.filter(b => b.has2pc || b.has3pc);

    const slotCards = ['helm', 'armor', 'weapon'].map(slotKey => {
      const pieceId = equipped[slotKey];
      const piece = pieceId ? ALL_LEGENDARY_PIECES.find(p => p.id === pieceId) : null;
      const slotLabel = slotKey === 'helm' ? 'Headpiece' : slotKey === 'armor' ? 'Chestplate' : 'Weapon / Arm';
      return `<div class="set-slot-card ${piece?'equipped':''}">
        <span class="slot-badge">${slotLabel.toUpperCase()}</span>
        <div class="slot-icon-box">
          <span data-sprite="${piece?piece.sprite:'rpg_shield_wood'}" data-icon-size="34"></span>
        </div>
        <strong>${piece?piece.name:'Empty Slot'}</strong>
        <small>${piece?piece.desc:'Select an owned piece below to equip.'}</small>
        ${piece?`<button class="camp-action secondary" type="button" data-action="set-unequip" data-id="${piece.id}">Unequip</button>`:''}
      </div>`;
    }).join('');

    const bonusSummaryHtml = activeBonusesList.length
      ? activeBonusesList.map(b => `<div class="active-bonus-pill" style="border-color:${b.set.color}">
          <strong style="color:${b.set.color}">${b.set.name} Set (${b.count}/3)</strong>
          <span>${b.has3pc ? `⭐⭐⭐ ${b.set.threePieceBonus}` : `⭐⭐ ${b.set.twoPieceBonus}`}</span>
        </div>`).join('')
      : '<p style="color:#8a95b0;font-size:12px;margin:0;">No set bonuses currently active. Equip 2 or 3 pieces of the same set to activate powerful passives.</p>';

    const setsCatalogHtml = LEGENDARY_SETS.map(set => {
      const setOwnedCount = set.pieces.filter(p => owned.includes(p.id)).length;
      const isComplete = setOwnedCount === 3;
      
      const pieceRows = set.pieces.map(piece => {
        const isPieceOwned = owned.includes(piece.id);
        const isPieceEquipped = Object.values(equipped).includes(piece.id);
        const actionBtn = isPieceEquipped
          ? `<button class="camp-action secondary" type="button" data-action="set-unequip" data-id="${piece.id}">Equipped</button>`
          : isPieceOwned
            ? `<button class="camp-action" type="button" data-action="set-equip" data-id="${piece.id}">Equip</button>`
            : `<button class="camp-action" type="button" disabled style="opacity:0.4;">Locked</button>`;

        return `<div class="set-piece-row ${isPieceOwned?'owned':''} ${isPieceEquipped?'active':''}">
          <span class="set-piece-icon" data-sprite="${piece.sprite}" data-icon-size="24"></span>
          <div class="set-piece-info">
            <strong>${piece.name} <small>(${piece.slot.toUpperCase()})</small></strong>
            <small>${piece.desc}</small>
          </div>
          ${actionBtn}
        </div>`;
      }).join('');

      return `<div class="legendary-set-card" style="border-top:3px solid ${set.color}">
        <div class="set-card-header">
          <div>
            <h3 style="color:${set.color};margin:0;display:flex;align-items:center;gap:6px;">
              <span data-sprite="${set.icon}" data-icon-size="20"></span> ${set.name} Set
            </h3>
            <p style="margin:2px 0 0;font-size:11px;color:#a0aec0;">${set.desc}</p>
          </div>
          <div class="set-collect-badge ${isComplete?'complete':''}">
            ${setOwnedCount}/3 Pieces
          </div>
        </div>
        <div class="set-bonus-box">
          <div class="set-bonus-tier ${setOwnedCount>=2?'active':''}">
            <strong style="color:${setOwnedCount>=2?'#ffd54f':'#718096'}">2-Piece Bonus:</strong>
            <span>${set.twoPieceBonus}</span>
          </div>
          <div class="set-bonus-tier ${setOwnedCount>=3?'active':''}">
            <strong style="color:${setOwnedCount>=3?'#ffd54f':'#718096'}">3-Piece Master Bonus:</strong>
            <span>${set.threePieceBonus}</span>
          </div>
        </div>
        <div class="set-pieces-list">${pieceRows}</div>
      </div>`;
    }).join('');

    panel.innerHTML = `<div class="camp-panel-heading">
        <h2>Legendary Armory ⭐⭐⭐⭐⭐</h2>
        <span>5 Unique 3-Piece Sets &bull; Drops from Elites, Bosses & Quests</span>
      </div>
      <div class="equipped-sets-container">
        <div class="set-slots-row">${slotCards}</div>
        <div class="active-set-bonuses-box">
          <strong style="display:block;font-size:12px;margin-bottom:6px;color:#ffd54f;">ACTIVE SET PASSIVES</strong>
          ${bonusSummaryHtml}
        </div>
      </div>
      <div class="sets-catalog">${setsCatalogHtml}</div>`;
  }else if(campTab==='trinkets'){
    const equipped = (campSave && campSave.equippedTrinkets) ? campSave.equippedTrinkets : [null,null,null];
    const owned = (campSave && campSave.ownedTrinkets) ? campSave.ownedTrinkets : [];
    
    const slotCards = [0, 1, 2].map(slotIdx => {
      const pieceId = equipped[slotIdx];
      const piece = pieceId ? ALL_TRINKETS.find(p => p.id === pieceId) : null;
      return `<div class="set-slot-card ${piece?'equipped':''}" style="cursor:pointer" onclick="window.openTrinketModal(${slotIdx})">
        <span class="slot-badge" style="background:#5a3a1a;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;">SLOT ${slotIdx+1}</span>
        <div class="slot-icon-box" style="margin-top:10px;">
          <span data-sprite="${piece?piece.sprite:'rpg_gem_diamond'}" style="opacity:${piece?1:0.1}" data-icon-size="34"></span>
        </div>
        <div class="slot-info" style="margin-top:10px;">
          <strong style="color:${piece?'#ffd54f':'#8a8a90'}">${piece?piece.name:'Empty'}</strong><br/>
          <small style="color:#a0a0a8">${piece?piece.desc:'Click to equip'}</small>
        </div>
      </div>`;
    }).join('');

    const catalogHtml = ALL_TRINKETS.map(t => {
      const isOwned = owned.includes(t.id);
      return `<div class="set-catalog-card ${isOwned?'owned':''}" style="opacity:${isOwned?1:0.3}">
        <span data-sprite="${t.sprite}" data-icon-size="28" style="margin-right:12px;"></span>
        <div class="catalog-info" style="display:inline-block;vertical-align:middle;">
          <strong style="display:block;color:#ffd54f;">${isOwned ? t.name : '???'}</strong>
          <small style="color:#a0a0a8">${isOwned ? t.desc : 'Find in the wilds'}</small>
        </div>
      </div>`;
    }).join('');

    panel.innerHTML=`<div class="camp-panel-heading"><h2>Trinkets & Charms</h2><span>Equip up to 3 for fine-tuning &bull; Drops from bosses & elites</span></div>
      <div class="equipped-sets-container" style="background:rgba(0,0,0,0.5);padding:15px;border-radius:8px;margin-bottom:20px;">
        <div class="set-slots-row" style="display:flex;gap:15px;">${slotCards}</div>
      </div>
      <div class="sets-catalog" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${catalogHtml}</div>`;
    }else if(campTab==='lore'){
      const bestiary = campSave.bestiary || {};
      const discoveredMap = campSave.discovered || {};
      let totalDiscovered = 0;
      let totalEnemies = Object.keys(ENEMY_TYPES).length;
      
      const enemyCards = Object.entries(ENEMY_TYPES).map(([type, stats]) => {
          const kills = (bestiary[type] || 0) + (type === 'plainsBoss' ? (bestiary['bloodLord'] || 0) : (type === 'bloodLord' ? (bestiary['plainsBoss'] || 0) : 0));
          const isDiscovered = Boolean(kills > 0 || discoveredMap[type] || (type === 'plainsBoss' && (discoveredMap['bloodLord'] || (bestiary['bloodLord'] || 0) > 0)) || (type === 'bloodLord' && (discoveredMap['plainsBoss'] || (bestiary['plainsBoss'] || 0) > 0)));
          if(isDiscovered) totalDiscovered++;
          const sprite = (stats.spriteVariants && stats.spriteVariants.length) ? stats.spriteVariants[0] : stats.sprite;
          const spriteHtml = isDiscovered ? `<span data-sprite="${sprite}" data-icon-size="40"></span>` : `<span data-sprite="${sprite}" data-icon-size="40" style="filter: brightness(0); opacity: 0.5;"></span>`;
          const displayName = (BOSS_DATA[type] && BOSS_DATA[type].name) ? BOSS_DATA[type].name : type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ');
          const name = isDiscovered ? displayName : '???';
          
          return `<div class="camp-contract" style="display:flex; align-items:center; gap:15px; padding:10px; background:rgba(20, 12, 8, 0.7); border:1px solid #3e2723; border-radius:6px;">
              <div style="width:50px; height:50px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); border-radius:8px;">
                  ${spriteHtml}
              </div>
              <div class="camp-contract-copy" style="flex:1;">
                  <strong style="color: ${isDiscovered ? '#fff' : '#888'}">${name} ${stats.boss ? '<span style="color:#ff5a4a; font-size:10px; margin-left:8px; border:1px solid #ff5a4a; padding:2px 4px; border-radius:4px;">BOSS</span>' : ''}</strong>
                  <div style="display:flex; gap:15px; margin-top:5px; font-size:11px; color:#aaa;">
                      ${isDiscovered ? `
                      <span><span style="color:#e53935">&hearts;</span> ${stats.hp}</span>
                      <span><span style="color:#ffd45c">&#9876;</span> ${stats.damage}</span>
                      <span><span style="color:#64b5f6">&#10132;</span> ${stats.speed.toFixed(1)}</span>
                      <span>Kills: <span style="color:#aaffff">${kills}</span></span>
                      ` : `<span>???</span>`}
                  </div>
              </div>
          </div>`;
      }).join('');
      
      panel.innerHTML=`<div class="camp-panel-heading"><h2>Beast Lore</h2><span>Monsters discovered: ${totalDiscovered} / ${totalEnemies}</span></div>
      <div class="sets-catalog" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; max-height: 55vh; overflow-y:auto; padding-right:10px;">${enemyCards}</div>`;
  }else if(campTab==='journal'){
    const categories = [
      { id: 'clues', label: 'Clues', icon: 'rpg_scroll' },
      { id: 'journals', label: 'Journals', icon: 'rpg_book_red' },
      { id: 'symbols', label: 'Symbols', icon: 'rpg_gem_diamond' },
      { id: 'stories', label: 'Stories', icon: 'rpg_shield_gold' }
    ];

    let totalUnlockedAll = 0;
    let totalEntriesAll = 0;
    categories.forEach(c => {
      const list = LORE_ENTRIES[c.id] || [];
      const set = LORE_SETS[c.id] || new Set();
      totalEntriesAll += list.length;
      totalUnlockedAll += list.filter(item => set.has(item.id)).length;
    });

    const categoryTabsHtml = categories.map(cat => {
      const list = LORE_ENTRIES[cat.id] || [];
      const set = LORE_SETS[cat.id] || new Set();
      const count = list.filter(item => set.has(item.id)).length;
      const isActive = currentLoreCategory === cat.id;
      return `<button class="quest-tab ${isActive ? 'active' : ''}" type="button" data-lore-cat="${cat.id}">
        <span data-sprite="${cat.icon}" data-icon-size="16" style="vertical-align:middle; margin-right:4px;"></span>
        ${cat.label} (${count}/${list.length})
      </button>`;
    }).join('');

    const currentList = LORE_ENTRIES[currentLoreCategory] || [];
    const currentSet = LORE_SETS[currentLoreCategory] || new Set();
    const currentUnlockedCount = currentList.filter(item => currentSet.has(item.id)).length;

    const entriesHtml = currentList.map(entry => {
      const isUnlocked = currentSet.has(entry.id);
      const spriteHtml = isUnlocked
        ? `<span data-sprite="${entry.icon}" data-icon-size="38"></span>`
        : `<span data-sprite="${entry.icon}" data-icon-size="38" style="filter: brightness(0); opacity: 0.35;"></span>`;
      
      const title = isUnlocked ? entry.title : '???';
      const desc = isUnlocked ? entry.desc : 'Ancient knowledge hidden in the untamed wilderness. Discover it to reveal its secrets.';
      const statusBadge = isUnlocked
        ? `<span style="color:#81c784; font-size:10px; font-weight:bold; border:1px solid #388e3c; background:rgba(56,142,60,0.2); padding:2px 6px; border-radius:4px;">UNLOCKED</span>`
        : `<span style="color:#e57373; font-size:10px; font-weight:bold; border:1px solid #c62828; background:rgba(198,40,40,0.2); padding:2px 6px; border-radius:4px;">LOCKED</span>`;

      return `<div class="camp-contract" style="display:flex; align-items:flex-start; gap:14px; padding:12px; background:rgba(20, 12, 8, 0.75); border:1px solid ${isUnlocked ? '#5d4037' : '#2d1810'}; border-radius:6px; opacity:${isUnlocked ? '1' : '0.65'};">
        <div style="width:48px; height:48px; min-width:48px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.55); border:1px solid ${isUnlocked ? 'rgba(255,213,79,0.2)' : 'rgba(255,255,255,0.05)'}; border-radius:8px;">
          ${spriteHtml}
        </div>
        <div class="camp-contract-copy" style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color: ${isUnlocked ? '#ffd54f' : '#888'}; font-size:14px;">${title}</strong>
            ${statusBadge}
          </div>
          <p style="margin:0; font-size:12px; line-height:1.45; color: ${isUnlocked ? '#d7ccc8' : '#777'}; font-style: ${isUnlocked ? 'normal' : 'italic'};">
            ${desc}
          </p>
        </div>
      </div>`;
    }).join('');

    panel.innerHTML = `<div class="camp-panel-heading">
        <h2>Lore Journal 📜</h2>
        <span>Total Unlocked: ${totalUnlockedAll} / ${totalEntriesAll} &bull; ${categories.find(c => c.id === currentLoreCategory)?.label}: ${currentUnlockedCount} / ${currentList.length}</span>
      </div>
      <div class="quest-filter" style="margin-bottom:12px;">
        ${categoryTabsHtml}
      </div>
      <div class="sets-catalog" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; max-height: 55vh; overflow-y:auto; padding-right:10px;">
        ${entriesHtml}
      </div>`;
  }else if(campTab==='trophies'){
    renderCampTrophies(panel);
  }else if(campTab==='mounts'){
    panel.innerHTML=`<div class="camp-panel-heading"><h2>The Stable</h2><span>Mounts for the long road</span></div>
      ${Object.values(MOUNTS).map(mount=>{
        const owned=campSave.ownedMounts.includes(mount.id);
        const equipped=campSave.equippedMount===mount.id;
        const canAfford=campSave.gold>=mount.cost;
        return `<div class="camp-contract ${equipped?'active':''}">
          <span class="camp-contract-icon" data-sprite="${mount.sprite}"></span>
          <div class="camp-contract-copy">
            <strong>${mount.name}</strong>
            <small>${mount.desc}</small>
            <span class="mount-category">${mount.category.toUpperCase()}${mount.flying?' · FLYING':''}</span>
          </div>
          ${owned
            ? `<button class="camp-action ${equipped?'secondary':''}" type="button" data-action="mount-equip" data-id="${mount.id}"><span data-sprite="${equipped?'rpg_shield_iron':'rpg_sign_post'}" data-icon-size="18"></span> ${equipped?'Equipped':'Equip'}</button>`
            : `<span class="camp-price"><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${mount.cost}</span>
               <button class="camp-action" type="button" data-action="mount-buy" data-id="${mount.id}" ${!canAfford?'disabled':''}><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> Buy</button>`
          }
        </div>`;
      }).join('')}`;
  }else{
    const currentBiome = resolveCampSceneId(campSave.campBiome);
    const sceneDef = CAMP_SCENES[currentBiome] || CAMP_SCENES.plains;
    const localFamiliars = CAMP_COMPANIONS.filter(item => item.biome === currentBiome);
    const otherOwned = CAMP_COMPANIONS.filter(item => item.biome !== currentBiome && campSave.ownedCompanions.includes(item.id));
    const allOutposts = [
      { id: 'plains', name: 'Valley Camp', biomeName: 'Plains' },
      { id: 'forest', name: 'Forest Camp', biomeName: 'Forest' },
      { id: 'desert', name: 'Desert Camp', biomeName: 'Desert' },
      { id: 'snow', name: 'Snow Camp', biomeName: 'Snow' },
      { id: 'magicForest', name: 'Enchanted Camp', biomeName: 'Magic Forest' },
      { id: 'volcano', name: 'Volcanic Camp', biomeName: 'Volcano' }
    ];

    const maxCompanions = (campSave.equippedTrinkets && campSave.equippedTrinkets.includes('t_beastmastercrest')) ? 2 : 1;
    const activeCompName = companions[0] ? companions[0].name.split(',')[0] : 'None';

    const curInnNpc = (CAMP_BUILDING_NPCS[currentBiome] || CAMP_BUILDING_NPCS.plains).inn;
    panel.innerHTML=`<div class="camp-panel-heading">
      <h2>The Wayfarer Inn &bull; ${sceneDef.name}</h2>
      <span>${localFamiliars.length} local companion${localFamiliars.length > 1 ? 's' : ''} here. Active loadout: <strong>${activeCompName}</strong> (Limit: ${companions.length}/${maxCompanions})</span>
    </div>
    <div class="camp-service-npc-banner camp-service-inn-banner">
      <div class="camp-service-npc-avatar" data-sprite="${curInnNpc.sprite}" data-icon-size="76"></div>
      <div class="camp-service-npc-copy">
        <div class="camp-service-npc-badge-row">
          <span class="camp-service-npc-tag inn-tag">INNKEEPER</span>
          <strong class="camp-service-npc-name">${curInnNpc.name}</strong>
          <span class="camp-service-npc-title">${curInnNpc.title}</span>
        </div>
        <div class="camp-service-npc-quote">"${curInnNpc.quote}"</div>
      </div>
    </div>
    
    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px 10px;margin-bottom:8px;background:rgba(217,189,117,0.08);border:1px solid rgba(217,189,117,0.25);border-radius:4px;flex-wrap:wrap;">
      <span style="font:600 11px Georgia,serif;color:#ffd86b;display:flex;align-items:center;gap:5px;">
        <span data-sprite="ui_camp_inn" data-icon-size="16"></span>
        <span>Outpost Waystones (Fast Travel):</span>
      </span>
      <div style="display:flex;gap:4px;flex-wrap:wrap;">
        ${allOutposts.map(op => {
          const unlocked = isCampUnlocked(op.id);
          const isCurrent = op.id === currentBiome;
          return `<button class="camp-action ${isCurrent ? 'secondary' : (!unlocked ? 'locked' : '')}" type="button" data-action="travel-outpost" data-id="${op.id}" style="padding:3px 7px;font-size:10px;line-height:1.2;opacity:${unlocked ? '1' : '0.5'};" ${(!unlocked || isCurrent) ? 'disabled' : ''} title="${unlocked ? op.name : 'Explore ' + op.biomeName + ' to unlock!'}">
            ${unlocked ? op.name : '🔒 ' + op.biomeName}
          </button>`;
        }).join('')}
      </div>
    </div>

    <div style="font:700 11px monospace;color:#a8d5b8;letter-spacing:.08em;margin:8px 0 6px;display:flex;align-items:center;gap:6px;">
      <span data-sprite="ui_camp_inn" data-icon-size="16"></span>
      <span>RESIDENT COMPANIONS OF ${sceneDef.eyebrow} (${localFamiliars.length} Available)</span>
    </div>

    ${localFamiliars.map(item => {
      const owned = campSave.ownedCompanions.includes(item.id);
      const equipped = campSave.companions.includes(item.id);
      const label = owned ? (equipped ? 'Dismiss' : 'Enlist') : `Hire · ${item.cost}g`;
      const action = owned ? 'companion-toggle' : 'companion-buy';
      return `<div class="camp-contract">
        <span class="camp-contract-icon" data-sprite="${item.sprite}"></span>
        <div class="camp-contract-copy">
          <strong>${item.name} <span class="camp-price">&bull; ${item.role}</span></strong>
          <small>${item.desc}</small>
          <em style="color:#9ec2ae;font-size:10px;display:block;margin-top:2px;">"${item.quote || ''}"</em>
        </div>
        ${owned ? '<span class="camp-price">Contracted</span>' : `<span class="camp-price"><span data-sprite="rpg_coin_gold" data-icon-size="18"></span> ${item.cost}</span>`}
        <button class="camp-action ${equipped ? 'secondary' : ''}" type="button" data-action="${action}" data-id="${item.id}">
          <span data-sprite="${equipped ? 'rpg_shield_iron' : item.sprite}" data-icon-size="18"></span> ${label}
        </button>
      </div>`;
    }).join('')}

    ${otherOwned.length ? `
      <div style="margin:14px 0 6px;padding-top:10px;border-top:1px solid #ffffff1c;display:flex;align-items:center;justify-content:space-between;">
        <span style="font:700 11px monospace;color:#d9bd75;letter-spacing:.08em;">CONTRACTED TRAVEL ROSTER (${otherOwned.length} companions from other camps)</span>
      </div>
      ${otherOwned.map(item => {
        const equipped = campSave.companions.includes(item.id);
        const label = equipped ? 'Dismiss' : 'Enlist';
        return `<div class="camp-contract" style="opacity:0.92;">
          <span class="camp-contract-icon" data-sprite="${item.sprite}"></span>
          <div class="camp-contract-copy">
            <strong>${item.name} <span class="camp-price">&bull; ${item.role} [${(item.biome || '').toUpperCase()}]</span></strong>
            <small>${item.desc}</small>
          </div>
          <span class="camp-price">Contracted</span>
          <button class="camp-action ${equipped ? 'secondary' : ''}" type="button" data-action="companion-toggle" data-id="${item.id}">
            <span data-sprite="${equipped ? 'rpg_shield_iron' : item.sprite}" data-icon-size="18"></span> ${label}
          </button>
        </div>`;
      }).join('')}
    ` : ''}`;
  }
  renderAtlasIcons(panel);
}
function getCampItemCost(cost){
  if(campSave && campSave.merchantDiscount){
    return Math.max(1, Math.round(cost * (1 - campSave.merchantDiscount)));
  }
  return cost;
}

function buyCampItem(cost){
  const finalCost = getCampItemCost(cost);
  if(campSave.gold<finalCost){showCampMessage('Not enough gold. Take a contract and earn your keep.');return false;}
  campSave.gold-=finalCost;
  return true;
}
function handleCampAction(action,id){
  playSfx('confirm');
  if(action==='set-difficulty'){
    window.GAME_SETTINGS.difficulty = Number(id) || 0;
    saveSettings();
    renderCamp();
    const diffLabel = Number(id) === 0 ? '🛡️ Adventurer Mode active. -25% damage taken, slower early mobs, and more food drops.' : '⚔️ Survivor Mode active. Standard challenge.';
    showCampMessage(diffLabel);
    return;
  }
  if(action==='run'){startGame();return;}
  if(action==='travel-outpost'){
    if(!isCampUnlocked(id)){
      showCampMessage(`Outpost locked. Explore the ${id.toUpperCase()} biome on an expedition to unlock!`);
      return;
    }
    campSave.campBiome = id;
    const campSpawn = findCampSpawn(id);
    player.x = campSpawn.x; player.y = campSpawn.y;
    campSave.campX = player.x; campSave.campY = player.y;
    setCampScene(id);
    saveCamp();
    renderCamp();
    showCampMessage(`Traveled to ${CAMP_SCENES[id]?.name || id}.`);
    return;
  }
  if(action==='open-tab'&&id){campTab=id;renderCamp();return;}
  if(action==='consume-material'){consumeMaterial(id);return;}
  if(action==='add-test-materials'){
    if(!campSave.materials) campSave.materials = {};
    for(const k of Object.keys(MATERIALS)) {
      campSave.materials[k] = (campSave.materials[k] || 0) + 2;
    }
    saveCamp();
    playSfx('confirm');
    showCampMessage('★ Added +2 of all 8 materials to inventory!');
    showDropToast('★ Added +2 of all 8 materials to inventory!', '#ea80fc', 'rpg_abyssalHeart');
    renderCamp();
    return;
  }
  if(action==='character'){
    const character=PLAYABLE_CHARACTERS.find(item=>item.id===id);
    if(!character)return;
    campSave.character=character.id;
    resetQuestProgress();
    const defW = character.startingWeapon || (character.id === 'knight' ? 'fireBreath' : 'wand');
    if(hasResumableProgress){
      campSave.runProgress=null;hasResumableProgress=false;
      carriedRelic=null;
      phoenixRevivedThisRun=false;
      elapsed=0;worldTime=45;kills=0;nextBossTime=360;
      spawnedBossBiomes.clear();
      killsByFire=0;killsByWater=0;killsAtNight=0;bossKills=0;vampireKills=0;unlockedAch.clear();updateAchCount();
      playerWeapons.splice(0,playerWeapons.length,{id:defW,level:1,timer:0});
      equipment.splice(0,equipment.length);
    }
    if(!campSave.ownedWeapons.includes(defW)) campSave.ownedWeapons.push(defW);
    campSave.loadoutWeapons = [defW];
    playerWeapons.splice(0, playerWeapons.length, {id:defW, level:1, timer:0});
    applySelectedCharacter();
    player.mounted=false;
    player.level=1;player.xp=0;player.xpNext=10;player.pickupRange=90;player.regen=0;
    player.cooldownMultiplier=1;player.defense=0;player.xpMultiplier=1;player.waterSlowMultiplier=1;
    recomputeRelicModifiers();
    if(character.biome){
      campSave.campBiome=character.biome;
      const campSpawn=findCampSpawn(character.biome);
      player.x=campSpawn.x;player.y=campSpawn.y;
      campSave.campX=player.x;campSave.campY=player.y;
      setCampScene(character.biome);
    }
    saveCamp();
    renderCamp();
    showCampMessage(`${character.name} is ready for the frontier.`);
    return;
  }
  if(action==='rest'){
    player.hp=player.maxHp;player.poisonStacks=0;player.poisonTimer=0;player.slowFactor=1;
    campSave.wellRested=true;
    if(hasResumableProgress)campSave.runProgress=createRunProgress();

    // Each rest advances 1 in-game Day
    campSave.day = (campSave.day || 1) + 1;
    state.worldTime = Math.floor((state.worldTime || 0) / 300 + 1) * 300 + 45;

    // Camp Sleep Tracking
    const curBiome = resolveCampSceneId(campSave.campBiome || getSelectedCharacter()?.biome || 'plains');
    if (state.lastSleepBiome === curBiome) {
      state.consecutiveSleeps = (state.consecutiveSleeps || 0) + 1;
    } else {
      state.consecutiveSleeps = 1;
      state.lastSleepBiome = curBiome;
    }
    state.sleepDebt = state.consecutiveSleeps;

    saveCamp();
    renderCamp();
    updateHUD();

    if (state.consecutiveSleeps >= 3) {
      state.consecutiveSleeps = 0;
      state.sleepDebt = 0;
      saveCamp();
      startGame();
      if (typeof window.enterDream === 'function') {
        window.enterDream();
      }
      return;
    }

    const bannerEl=document.getElementById('campProfileBanner');
    const scenePlayerEl=document.getElementById('campScenePlayer');
    if(bannerEl){bannerEl.classList.remove('rest-flash');void bannerEl.offsetWidth;bannerEl.classList.add('rest-flash');}
    if(scenePlayerEl){scenePlayerEl.classList.remove('rest-flash');void scenePlayerEl.offsetWidth;scenePlayerEl.classList.add('rest-flash');}
    showCampMessage('✨ Day ' + campSave.day + '. You rest by the fire. Full health restored, Well Rested active, and ailments cleared.');
    return;
  }
  if(action==='quest'){
    const quest=getCampQuest(id);
    if(!quest)return;
    if(quest.category==='daily'){
      const todayKey = getDailyDateKey();
      if(campSave.dailyCompleted && campSave.dailyCompleted.date === todayKey && campSave.dailyCompleted.quests.includes(quest.id)){
        showCampMessage('You have already completed this daily contract today! Resets tomorrow.');
        return;
      }
    }
    if(quest.category==='story'){
      const st=getStoryStageStatus(quest);
      if(!st.isUnlocked||st.isCompleted){
        showCampMessage(st.isCompleted?'This stage is already finished!':'Complete the previous stage first.');
        return;
      }
    }
    campSave.questId=campSave.questId===id?null:id;
    saveCamp();renderCamp();showCampMessage(campSave.questId?'Contract pinned to your run. Good hunting.':'Contract abandoned.');return;
  }
  if(action==='weapon-buy'||action==='weapon-toggle'){
    const wDef = typeof WEAPON_DEFS !== 'undefined' ? WEAPON_DEFS[id] : null;
    const item=CAMP_WEAPONS.find(entry=>entry.id===id) || (typeof CAMP_TOOLS !== 'undefined' ? CAMP_TOOLS.find(entry=>entry.id===id) : null) || (id==='prismStaff'?{id:'prismStaff',name:'Rainbow Staff',sprite:'prism_staff',cost:100000}:null) || (wDef ? {id, name:wDef.name || id, sprite:wDef.sprite || id, cost:0} : null);
    if(!item)return;
    if(action==='weapon-buy'){
      if(campSave.ownedWeapons.includes(id))return;
      if(!buyCampItem(item.cost))return;
      campSave.ownedWeapons.push(id);
      if(campSave.loadoutWeapons.length<4)campSave.loadoutWeapons.push(id);
      playSfx('confirm');
      saveCamp();renderCamp();showCampMessage(`${item.name} added to your kit.`);return;
    }
    const index=campSave.loadoutWeapons.indexOf(id);
    if(index>=0){
      if(campSave.loadoutWeapons.length===1){showCampMessage('Keep at least 1 weapon equipped — equip another first to swap.');return;}
      campSave.loadoutWeapons.splice(index,1);
    }else if(campSave.loadoutWeapons.length>=4){showCampMessage('Loadout full (4/4). Unequip a weapon first.');return;}
    else campSave.loadoutWeapons.push(id);
    playSfx('confirm');
    saveCamp();renderCamp();showCampMessage(`${item.name} ${index>=0?'unequipped':'equipped'} (${campSave.loadoutWeapons.length}/4).`);return;
  }
  if(action==='gear-buy'){
    const item=CAMP_GEAR.find(entry=>entry.id===id);
    if(!item||campSave.ownedGear.includes(id))return;
    if(!buyCampItem(item.cost))return;
    campSave.ownedGear.push(id);
    if(item.weaponId){
      if(!campSave.ownedWeapons.includes(item.weaponId)) campSave.ownedWeapons.push(item.weaponId);
      if(campSave.loadoutWeapons.length<4 && !campSave.loadoutWeapons.includes(item.weaponId)) campSave.loadoutWeapons.push(item.weaponId);
      saveCamp();renderCamp();
      const bMsg = 'Bartholomew: "100,000 gold? Do you know how many potions I could buy with that?"';
      showCampMessage('Rainbow Staff added to your kit.');
      showNpcBubble('wayfarer', bMsg, 6000);
      return;
    }
    saveCamp();renderCamp();
    showCampMessage(`${EQUIPMENT_UPGRADES.find(entry=>entry.id===id).name} is now part of your kit.`);return;
  }
  if(action==='set-equip'){
    const piece = ALL_LEGENDARY_PIECES.find(p => p.id === id);
    if(!piece || !campSave.ownedSetPieces.includes(piece.id)) return;
    if(!campSave.equippedSetPieces) campSave.equippedSetPieces = { helm: null, armor: null, weapon: null };
    campSave.equippedSetPieces[piece.slot] = piece.id;
    applyEquippedSetBonuses();
    saveCamp();
    renderCamp();
    showCampMessage(`Equipped ${piece.name}.`);
    return;
  }
  if(action==='set-unequip'){
    const piece = ALL_LEGENDARY_PIECES.find(p => p.id === id);
    if(!piece) return;
    if(campSave.equippedSetPieces && campSave.equippedSetPieces[piece.slot] === piece.id){
      campSave.equippedSetPieces[piece.slot] = null;
      applyEquippedSetBonuses();
      saveCamp();
      renderCamp();
      showCampMessage(`Unequipped ${piece.name}.`);
    }
    return;
  }
  if(action==='mount-buy'){
    const mount=MOUNTS[id];
    if(!mount||campSave.ownedMounts.includes(id))return;
    if(!buyCampItem(mount.cost))return;
    campSave.ownedMounts.push(id);
    if(!campSave.equippedMount)campSave.equippedMount=id;
    saveCamp();renderCamp();
    showCampMessage(`${mount.name} joins your stable.`);
    return;
  }
  if(action==='mount-equip'){
    const mount=MOUNTS[id];
    if(!mount||!campSave.ownedMounts.includes(id))return;
    campSave.equippedMount=campSave.equippedMount===id?null:id;
    saveCamp();renderCamp();
    showCampMessage(campSave.equippedMount?`${mount.name} is ready to ride.`:'Mount unequipped.');
    return;
  }
  if(action==='potion-buy'){
    if(!buyCampItem(25))return;
    potionCount++;saveCamp();renderCamp();showCampMessage(`Healing draught packed. You have ${potionCount}.`);return;
  }
  if(action==='companion-buy'||action==='companion-toggle'){
    const item=CAMP_COMPANIONS.find(entry=>entry.id===id);
    if(!item)return;
    const maxCompanions = (campSave.equippedTrinkets && campSave.equippedTrinkets.includes('t_beastmastercrest')) ? 2 : 1;
    if(action==='companion-buy'){
      if(campSave.ownedCompanions.includes(id))return;
      if(!buyCampItem(item.cost))return;
      campSave.ownedCompanions.push(id);
      if(campSave.companions.length >= maxCompanions){
        campSave.companions = [id];
      } else {
        campSave.companions.push(id);
      }
      showCampMessage(`${item.name} recruited and set as active companion.`);
    }else{
      const index=campSave.companions.indexOf(id);
      if(index>=0){
        campSave.companions.splice(index,1);
        showCampMessage(`${item.name} will rest at camp.`);
      } else {
        if(campSave.companions.length >= maxCompanions){
          campSave.companions = [id];
          showCampMessage(`${item.name} is now your active companion.`);
        } else {
          campSave.companions.push(id);
          showCampMessage(`${item.name} enlisted for your next run.`);
        }
      }
    }
    companions=CAMP_COMPANIONS.filter(i=>campSave.companions.includes(i.id)).slice(0, maxCompanions).map(i=>({
      ...i,cooldown:0,x:player.x,y:player.y,hp:100,maxHp:100,markTimer:0,packKillCount:0,packTimer:0,
      buffTimer:0,summons:[],lastSummon:0,burnAuraTimer:0,usedRevive:false
    }));
    saveCamp();renderCamp();return;
  }
}
function settleCampRun(bankRelic=false){
  if(campRunSettled)return'';
  campRunSettled=true;
  const securedRelic=bankRelic?bankCarriedRelic():null;
  if(bankRelic)commitRunQuestBaseline();
  const baseReward=Math.max(5,Math.floor(elapsed/20)+Math.floor(kills/5));
  let reward=baseReward,contractMessage='';
  const quest=getCampQuest(campSave.questId);
  if(quest){
    const complete=isQuestComplete(quest);
    if(complete){
      reward+=quest.reward;
      let extraRewardMsg = '';
      if(quest.legendaryReward && !relicJournalIds.has('legendary_worldroot_seed')){
        const legendaryRelic = {
          id: 'legendary_worldroot_seed',
          name: 'Worldroot Seed',
          tier: 'legendary',
          tierLabel: 'Legendary',
          color: '#ffd45c',
          xp: 75,
          effect: { label: '+20% XP, +22% damage, +14% speed', xp: 1.2, damage: 1.22, speed: 1.14 }
        };
        relicJournalIds.add(legendaryRelic.id);
        relicJournal.push(legendaryRelic);
        saveRelicJournal(relicJournal);
        recomputeRelicModifiers();
        renderInventory();
        extraRewardMsg = ' + Legendary Relic: Worldroot Seed';
      }
      // Relic reward if applicable
      if(quest.relicReward){
        const poolNames = ['Mirror Shard', 'Stormheart Relic', 'Phoenix Heart', 'Moonlit Astrolabe'];
        const chosen = poolNames[Math.floor(Math.random() * poolNames.length)];
        const relObj = {
          id: `quest_relic_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          name: chosen,
          tier: 'rare',
          tierLabel: 'Rare',
          color: '#61b8ff',
          xp: 25,
          effect: relicEffectFor(chosen)
        };
        relicJournalIds.add(relObj.id);
        relicJournal.push(relObj);
        saveRelicJournal(relicJournal);
        recomputeRelicModifiers();
        renderInventory();
        extraRewardMsg += ` + Relic: ${chosen}`;
      }
      
      // Daily quest completion
      if(quest.category === 'daily'){
        const todayKey = getDailyDateKey();
        if(!campSave.dailyCompleted || campSave.dailyCompleted.date !== todayKey){
          campSave.dailyCompleted = { date: todayKey, quests: [] };
        }
        if(!campSave.dailyCompleted.quests.includes(quest.id)){
          campSave.dailyCompleted.quests.push(quest.id);
        }
        extraRewardMsg += ' 📅 Daily Contract Completed!';
      }

      // Story Chain progression
      if(quest.category === 'story' && quest.chainId){
        if(!campSave.storyStages) campSave.storyStages = {};
        const curStage = campSave.storyStages[quest.chainId] || 0;
        if(quest.stage > curStage){
          campSave.storyStages[quest.chainId] = quest.stage;
        }
        // Chain Completion Rewards
        if(quest.stage === 3){
          if(quest.chainId === 'frontier-trail'){
            if(!campSave.unlockedTitles) campSave.unlockedTitles = [];
            if(!campSave.unlockedTitles.includes('Frontier Explorer')) campSave.unlockedTitles.push('Frontier Explorer');
            extraRewardMsg += ' 🎖️ Chain Complete! Unlocked Title: "Frontier Explorer"!';
          }else if(quest.chainId === 'blood-moon'){
            campSave.vampireHunterSkin = true;
            if(!campSave.unlockedTitles) campSave.unlockedTitles = [];
            if(!campSave.unlockedTitles.includes('Vampire Hunter')) campSave.unlockedTitles.push('Vampire Hunter');
            extraRewardMsg += ' 🧛 Chain Complete! Unlocked "Vampire Hunter" Skin & Title!';
          }else if(quest.chainId === 'flooded-path'){
            if(!campSave.ownedGear.includes('boots')) campSave.ownedGear.push('boots');
            extraRewardMsg += ' 👢 Chain Complete! Unlocked Water Boots for free!';
          }else if(quest.chainId === 'merchants-debt'){
            campSave.merchantDiscount = 0.20;
            extraRewardMsg += ' 🏷️ Chain Complete! Unlocked 20% Discount in Camp Store!';
          }else if(quest.chainId === 'lost-cartographer'){
            campSave.cartographerBonus = true;
            extraRewardMsg += ' 🗺️ Chain Complete! Unlocked +30% Vision & Fog Reveal Radius!';
          }
        }
      }
      contractMessage=` Contract complete: ${quest.name} (+${quest.reward}g${extraRewardMsg}).`;
      campSave.questId=null;
    }else{
      const progress=Math.floor(getQuestProgress(quest));
      contractMessage=` Contract incomplete: ${quest.name} (${progress}/${quest.target}).`;
    }
  }
  reward=Math.floor(reward*(player.goldFindMult||1));
  campSave.gold+=reward;
  saveCamp();
  const companionPower=securedRelic?.effect?.companionPower||relicEffectFor(securedRelic?.name||'').companionPower;
  const companionSkill=companionPower?COMPANION_RELIC_SKILLS[companionPower]:null;
  const relicMessage=securedRelic?` ${securedRelic.name} secured. Companions learned ${companionSkill||'a new relic skill'}.`:'';
  return `+${reward} gold earned.${contractMessage}${relicMessage}`;
}

function getActiveMount(){
  if(!player.mounted||!campSave.equippedMount)return null;
  return MOUNTS[campSave.equippedMount]||null;
}

function toggleMount(){
  if(!campSave.equippedMount){
    const toast=document.createElement('div');toast.className='relic-toast';
    const title=document.createElement('strong');title.textContent='NO MOUNT';title.style.color='#ff9800';
    const name=document.createElement('span');name.textContent='Buy a mount at the Stable first.';
    toast.append(title,name);
    document.getElementById('relicToasts')?.appendChild(toast);
    setTimeout(()=>toast.remove(),3000);
    return;
  }
  player.mounted=!player.mounted;
  if(player.mounted){
    player.facing = 1; // Default looking to the right when mounted as requested
  }
  playSfx('confirm');
  const mount=MOUNTS[campSave.equippedMount];
  const toast=document.createElement('div');toast.className='relic-toast';
  const title=document.createElement('strong');
  title.textContent=player.mounted?'MOUNTED':'DISMOUNTED';
  title.style.color=player.mounted?'#4fc3f7':'#c7d2da';
  const name=document.createElement('span');
  name.textContent=player.mounted?mount.name:'Back on foot.';
  toast.append(title,name);
  document.getElementById('relicToasts')?.appendChild(toast);
  setTimeout(()=>toast.remove(),2400);
}

function useHealingDraught(){
  if(!gameStarted||paused||gameOver||potionCount<1||player.hp>=player.maxHp)return false;
  potionCount--;player.hp=Math.min(player.maxHp,player.hp+35);totalHealedHPRun+=35;player.poisonStacks=0;player.poisonTimer=0;player.poisonTickTimer=0;saveCamp();updateHUD();
  const status=document.getElementById('status'),icon=iconCanvas('rpg_potion_red',18),label=document.createElement('span');
  icon.className='atlas-icon';
      icon.style.width = '18px';
      icon.style.height = '18px';label.textContent=`Healing draught · ${potionCount} left`;status.replaceChildren(icon,label);
  return true;
}

export { getSelectedCharacter, applySelectedCharacter, restoreRunProgress, revealAroundPlayer, resolveCampSceneId, setCampScene, initCampSpeechBubbles, showNpcBubble, triggerRandomCampDialogue, triggerCampReaction, scheduleNextCampDialogue, clearCampSpeechBubbles, resetQuestProgress, getStoryStageStatus, getQuestProgress, isQuestComplete, LEVEL_MILESTONES, grantRunUpgrade, applyEquippedTrinkets, resetRunUpgrades, STAT_UPGRADES, addWeapon, addEquipment, tryEvolveWeapons, syncCharacterDisplay, addMaterialDrop, consumeMaterial, getInventoryItems, renderCampInventory, renderCampConditions, isCampUnlocked, renderCampTrophies, renderCamp, getCampItemCost, buyCampItem, handleCampAction, settleCampRun, getActiveMount, toggleMount, useHealingDraught };
