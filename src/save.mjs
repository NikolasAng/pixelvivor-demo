import { biomeAt } from './world.mjs?v336';
import { SPECIAL_ITEMS_LIST } from './assets.mjs?v336';
import { WEAPON_DEFS, CAMP_WEAPONS, CAMP_TOOLS, CAMP_GEAR, CAMP_COMPANIONS, MOUNTS, PLAYABLE_CHARACTERS, getDailyDateKey, getAllCampQuests, LORE_ENTRIES, DEFAULT_UNLOCKED_LORE } from './config.mjs?v336';
import { playSfx } from './audio.mjs?v336';
import { TILE, player, playerWeapons, equipment, carriedRelic, phoenixRevivedThisRun, elapsed, worldTime, kills, nextBossTime, relicsAtRunStart, spawnedBossBiomes, killsByFire, killsByWater, killsAtNight, bossKills, vampireKills, unlockedAch, potionCount, revealedTiles, gameStarted, gameOver, resolveCampSceneId, campTab, renderCamp } from './game-core.mjs?v336';

const defaultDiff = (typeof window !== 'undefined' && window.IS_DEMO) ? 0 : 1;
window.GAME_SETTINGS = JSON.parse(localStorage.getItem('pixelvivor_settings') || JSON.stringify({showDamageNumbers:true,screenShake:true,enableWeather:true,manualAim:false,autoLevel:false,showMinimap:true,enableFog:true,zoom:1.0,uiScale:1.0,difficulty:defaultDiff,showFps:true,perfPreset:'balanced',damageNumbersMode:'compressed',particleLimit:150,shadowQuality:'fast',weatherDensity:'low',gemClustering:true,smartOffscreen:true}));
if (window.GAME_SETTINGS.enableFog === undefined) window.GAME_SETTINGS.enableFog = true;
if (window.GAME_SETTINGS.difficulty === undefined) window.GAME_SETTINGS.difficulty = defaultDiff;
if (window.GAME_SETTINGS.showFps === undefined) window.GAME_SETTINGS.showFps = true;
if (window.GAME_SETTINGS.perfPreset === undefined) window.GAME_SETTINGS.perfPreset = 'balanced';
if (window.GAME_SETTINGS.damageNumbersMode === undefined) window.GAME_SETTINGS.damageNumbersMode = 'compressed';
if (window.GAME_SETTINGS.particleLimit === undefined) window.GAME_SETTINGS.particleLimit = 150;
if (window.GAME_SETTINGS.shadowQuality === undefined) window.GAME_SETTINGS.shadowQuality = 'fast';
if (window.GAME_SETTINGS.weatherDensity === undefined) window.GAME_SETTINGS.weatherDensity = 'low';
if (window.GAME_SETTINGS.gemClustering === undefined) window.GAME_SETTINGS.gemClustering = true;
if (window.GAME_SETTINGS.smartOffscreen === undefined) window.GAME_SETTINGS.smartOffscreen = true;
function saveSettings() { localStorage.setItem('pixelvivor_settings', JSON.stringify(window.GAME_SETTINGS)); applySettingsUI(); }
function applySettingsUI() {
  const container = document.getElementById('hudContainer') || document.getElementById('hud');
  if (container) {
    container.style.transform = `scale(${window.GAME_SETTINGS.uiScale})`;
    container.style.transformOrigin = 'top left';
  }
  const campMenu = document.getElementById('menu');
  if (campMenu) {
    campMenu.style.transform = 'none';
  }
  const panel = document.getElementById('minimapPanel');
  if (panel && window.GAME_SETTINGS.showMinimap === false) panel.style.display = 'none';
  const fpsEl = document.getElementById('fpsCounter');
  if (fpsEl) {
    fpsEl.style.display = window.GAME_SETTINGS.showFps ? 'inline-flex' : 'none';
  }
}
applySettingsUI();
try{localStorage.removeItem('pixelvivor.renderer3d');}catch{}

function makeFreshCampSave(){
  return {day:1,gold:120,runs:0,character:'wayfarer',ownedWeapons:['wand','fireBreath','orcCleaver'],loadoutWeapons:['wand'],ownedGear:[],ownedCompanions:[],companions:[],potions:0,questId:null,campBiome:null,campX:null,campY:null,exploredTiles:[],runProgress:null,ownedMounts:[],equippedMount:null,storyStages:{},unlockedTitles:[],unlockedCamps:['plains'],merchantDiscount:0,cartographerBonus:false,vampireHunterSkin:false,dailyCompleted:{date:getDailyDateKey(),quests:[]},ownedSetPieces:[],equippedSetPieces:{helm:null,armor:null,weapon:null},ownedTrinkets:[],equippedTrinkets:[null,null,null],bestiary:{},discovered:{},materials:{},lore:{clues:[],journals:[],symbols:[],stories:[]},permHpBonus:0,permDmgBonus:0,permRegenBonus:0,permDefenseBonus:0,permSpeedBonus:0,permRerolls:0,permBanishes:0,collectedTrophies:[],unlockedTrophies:[],newTrophyIds:[],hasGoldenEgg:false,unlockedChickenCrown:false,equippedChickenCrown:false,goldenEggStacks:0,chickenCrownStacks:0,chickenFeathers:0,chickenCoins:0,hasTidecallerConch:false,hasAbyssalKey:false,hasAbyssalHeart:false,hasFrozenCore:false,hasHeartOfWinter:false,secret2Stage:0,secret2Complete:false,mountainSealsBroken:0,runQuestBaseline:null};
}
function loadCampSave(){
  const fresh=makeFreshCampSave();
  try{
    const saved=JSON.parse(localStorage.getItem('pixelvivor.camp')||'null');
    if(!saved||typeof saved!=='object')return fresh;
    const migrateToolId=id=>id==='pickaxe'?'stonePickaxe':id;
    const validIds=(values,allowed)=>Array.isArray(values)?[...new Set(values.map(migrateToolId).filter(id=>allowed.includes(id)))]:[];
    const ownedWeapons=validIds(saved.ownedWeapons,['wand','fireBreath','orcCleaver','prismStaff',...Object.keys(WEAPON_DEFS),...CAMP_WEAPONS.map(item=>item.id), ...CAMP_TOOLS.map(item=>item.id)]);
    if(!ownedWeapons.includes('wand'))ownedWeapons.unshift('wand');
    if(!ownedWeapons.includes('fireBreath'))ownedWeapons.push('fireBreath');
    if(!ownedWeapons.includes('orcCleaver'))ownedWeapons.push('orcCleaver');
    const loadoutWeapons=validIds(saved.loadoutWeapons,ownedWeapons);
    if(loadoutWeapons.length === 0){
      const selChar = PLAYABLE_CHARACTERS.find(item=>item.id===saved.character);
      const fallbackW = selChar?.startingWeapon || (saved.character === 'knight' ? 'fireBreath' : (saved.character === 'orc' ? 'orcCleaver' : 'wand'));
      if(!ownedWeapons.includes(fallbackW)) ownedWeapons.push(fallbackW);
      loadoutWeapons.push(fallbackW);
    }
    const questId=getAllCampQuests().some(quest=>quest.id===saved.questId)?saved.questId:null;
    return {
      day:Number.isFinite(saved.day)?Math.max(1,Math.floor(saved.day)):1,
      gold:Number.isFinite(saved.gold)?Math.max(0,Math.floor(saved.gold)):fresh.gold,
      runs:Number.isFinite(saved.runs)?Math.max(0,Math.floor(saved.runs)):0,
      character:PLAYABLE_CHARACTERS.some(item=>item.id===saved.character)?saved.character:'wayfarer',
      ownedWeapons,loadoutWeapons:loadoutWeapons.slice(0,4),
      ownedGear:validIds(saved.ownedGear,[...CAMP_GEAR.map(item=>item.id), ...SPECIAL_ITEMS_LIST.map(item=>item.id)]),
      ownedCompanions:validIds(saved.ownedCompanions||saved.companions,CAMP_COMPANIONS.map(item=>item.id)),
      companions:validIds(saved.companions,saved.ownedCompanions||saved.companions||[]),
      potions:Number.isFinite(saved.potions)?Math.max(0,Math.floor(saved.potions)):0,
      questId,
      unlockedCamps:Array.isArray(saved.unlockedCamps)?Array.from(new Set(['plains',...saved.unlockedCamps])):['plains'],
      campBiome:['plains','forest','desert','snow','swamp','magicForest','volcano','crystalWastes','fungalWastes','deadlands','badlands','undergroundCave','dwarfCity','dimensionX','abyss'].includes(saved.campBiome)?saved.campBiome:null,
      campX:Number.isFinite(saved.campX)?saved.campX:null,
      campY:Number.isFinite(saved.campY)?saved.campY:null,
      exploredTiles:Array.isArray(saved.exploredTiles)?saved.exploredTiles.filter(key=>typeof key==='string'&&/^-?\d+,-?\d+$/.test(key)).slice(-30000):[],
      runProgress:saved.runProgress&&typeof saved.runProgress==='object'?saved.runProgress:null,
      ownedMounts:Array.isArray(saved.ownedMounts)
        ? saved.ownedMounts.filter(id => MOUNTS[id]) : [],
      equippedMount:MOUNTS[saved.equippedMount] ? saved.equippedMount : null,
      storyStages:(saved.storyStages&&typeof saved.storyStages==='object')?saved.storyStages:{},
      unlockedTitles:Array.isArray(saved.unlockedTitles)?saved.unlockedTitles:[],
      merchantDiscount:Number(saved.merchantDiscount)||0,
      cartographerBonus:Boolean(saved.cartographerBonus),
      vampireHunterSkin:Boolean(saved.vampireHunterSkin),
      dailyCompleted:(saved.dailyCompleted&&saved.dailyCompleted.date===getDailyDateKey()&&Array.isArray(saved.dailyCompleted.quests))?saved.dailyCompleted:{date:getDailyDateKey(),quests:[]},
      ownedSetPieces:Array.isArray(saved.ownedSetPieces)?saved.ownedSetPieces:[],
      equippedSetPieces:(saved.equippedSetPieces&&typeof saved.equippedSetPieces==='object')?saved.equippedSetPieces:{helm:null,armor:null,weapon:null},
      ownedTrinkets:Array.isArray(saved.ownedTrinkets)?saved.ownedTrinkets:[],
      equippedTrinkets:Array.isArray(saved.equippedTrinkets)?saved.equippedTrinkets:[null,null,null],
      bestiary:(saved.bestiary&&typeof saved.bestiary==='object')?saved.bestiary:{},
      discovered:(saved.discovered&&typeof saved.discovered==='object')?saved.discovered:{},
      materials:(saved.materials&&typeof saved.materials==='object')?saved.materials:{},
      lore:(saved.lore&&typeof saved.lore==='object')?saved.lore:{clues:[],journals:[],symbols:[],stories:[]},
      permHpBonus:Number(saved.permHpBonus)||0,
      permDmgBonus:Number(saved.permDmgBonus)||0,
      permRegenBonus:Number(saved.permRegenBonus)||0,
      permDefenseBonus:Number(saved.permDefenseBonus)||0,
      permSpeedBonus:Number(saved.permSpeedBonus)||0,
      permRerolls:Number(saved.permRerolls)||0,
      permBanishes:Number(saved.permBanishes)||0,
      collectedTrophies:Array.isArray(saved.collectedTrophies)?saved.collectedTrophies:[],
      unlockedTrophies:Array.isArray(saved.unlockedTrophies)?saved.unlockedTrophies:[],
      newTrophyIds:Array.isArray(saved.newTrophyIds)?saved.newTrophyIds:[],
      hasGoldenEgg:Boolean(saved.hasGoldenEgg),
      unlockedChickenCrown:Boolean(saved.unlockedChickenCrown),
      equippedChickenCrown:Boolean(saved.equippedChickenCrown),
      goldenEggStacks:Math.max(0,Math.min(5,Number(saved.goldenEggStacks)||0)),
      chickenCrownStacks:Math.max(0,Math.min(3,Number(saved.chickenCrownStacks)||0)),
      chickenFeathers:Math.max(0,Math.min(5,Number(saved.chickenFeathers)||0)),
      chickenCoins:Math.max(0,Math.floor(Number(saved.chickenCoins)||0)),
      hasTidecallerConch:Boolean(saved.hasTidecallerConch),
      hasAbyssalKey:Boolean(saved.hasAbyssalKey),
      hasAbyssalHeart:Boolean(saved.hasAbyssalHeart),
      hasFrozenCore:Boolean(saved.hasFrozenCore),
      hasHeartOfWinter:Boolean(saved.hasHeartOfWinter),
      secret2Stage:Math.max(0,Math.floor(Number(saved.secret2Stage)||0)),
      secret2Complete:Boolean(saved.secret2Complete),
      mountainSealsBroken:Math.max(0,Math.floor(Number(saved.mountainSealsBroken)||0)),
      runQuestBaseline:(saved.runQuestBaseline && typeof saved.runQuestBaseline === 'object') ? saved.runQuestBaseline : null
    };
  }catch(error){
    console.warn('Camp progress could not be loaded.',error);
    return fresh;
  }
}
const campSave=loadCampSave();
window.campSave=campSave;
if(!campSave.collectedTrophies) campSave.collectedTrophies = [];
if(!campSave.unlockedTrophies) campSave.unlockedTrophies = [];
if(!campSave.newTrophyIds) campSave.newTrophyIds = [];

if(!campSave.materials || typeof campSave.materials !== 'object') campSave.materials = {};
if(campSave.hasAbyssalKey) {
  campSave.materials.abyssalKey = Math.max(campSave.materials.abyssalKey || 0, 1);
}
if(campSave.hasTidecallerConch) {
  campSave.materials.tidecallersConch = Math.max(campSave.materials.tidecallersConch || 0, 1);
}
if(campSave.materials?.abyssalHeart > 0) {
  campSave.hasAbyssalHeart = true;
}
if(campSave.materials?.frozenCore > 0) {
  campSave.hasFrozenCore = true;
}
if(!campSave.discovered || typeof campSave.discovered !== 'object') campSave.discovered = {};
if(!campSave.lore || typeof campSave.lore !== 'object') campSave.lore = {clues:[],journals:[],symbols:[],stories:[]};
if((campSave.bestiary?.bloodLord > 0 || campSave.bestiary?.plainsBoss > 0) && !campSave.discovered.plainsBoss) {
  campSave.discovered.plainsBoss = true;
  campSave.discovered.bloodLord = true;
}

const unlockedClues = new Set();
const unlockedJournals = new Set();
const unlockedSymbols = new Set();
const unlockedStories = new Set();

const LORE_SETS = {
  clues: unlockedClues,
  clue: unlockedClues,
  journals: unlockedJournals,
  journal: unlockedJournals,
  symbols: unlockedSymbols,
  symbol: unlockedSymbols,
  stories: unlockedStories,
  story: unlockedStories
};


function loadLoreSets() {
  try {
    const raw = localStorage.getItem('pixelvivor.loreJournal');
    const saved = raw ? JSON.parse(raw) : (campSave?.lore || null);
    if (saved && typeof saved === 'object') {
      if (Array.isArray(saved.clues)) saved.clues.forEach(id => unlockedClues.add(id));
      if (Array.isArray(saved.journals)) saved.journals.forEach(id => unlockedJournals.add(id));
      if (Array.isArray(saved.symbols)) saved.symbols.forEach(id => unlockedSymbols.add(id));
      if (Array.isArray(saved.stories)) saved.stories.forEach(id => unlockedStories.add(id));
      return;
    }
  } catch (e) {
    console.warn('Could not load lore journal from storage', e);
  }
  // If no saved data, seed default test entries
  DEFAULT_UNLOCKED_LORE.clues.forEach(id => unlockedClues.add(id));
  DEFAULT_UNLOCKED_LORE.journals.forEach(id => unlockedJournals.add(id));
  DEFAULT_UNLOCKED_LORE.symbols.forEach(id => unlockedSymbols.add(id));
  DEFAULT_UNLOCKED_LORE.stories.forEach(id => unlockedStories.add(id));
  saveLoreSets();
}

function saveLoreSets() {
  try {
    const data = {
      clues: [...unlockedClues],
      journals: [...unlockedJournals],
      symbols: [...unlockedSymbols],
      stories: [...unlockedStories]
    };
    localStorage.setItem('pixelvivor.loreJournal', JSON.stringify(data));
    if (typeof campSave !== 'undefined' && campSave) {
      campSave.lore = data;
    }
  } catch (e) {
    console.error('Could not save lore journal', e);
  }
}

function unlockLore(type, id) {
  const targetSet = LORE_SETS[type];
  if (!targetSet) {
    console.warn(`[LoreJournal] Unknown category: "${type}". Expected clues, journals, symbols, or stories.`);
    return false;
  }
  if (!targetSet.has(id)) {
    targetSet.add(id);
    saveLoreSets();
    if (typeof campTab !== 'undefined' && campTab === 'journal') {
      renderCamp();
    }
    return true;
  }
  return false;
}


window.unlockLore = unlockLore;
window.unlockedClues = unlockedClues;
window.unlockedJournals = unlockedJournals;
window.unlockedSymbols = unlockedSymbols;
window.unlockedStories = unlockedStories;
window.LORE_ENTRIES = LORE_ENTRIES;

loadLoreSets();

function createRunProgress(){
  return{
    version:1,
    player:Object.fromEntries(['level','xp','xpNext','hp','maxHp','speed','pickupRange','regen','cooldownMultiplier','damageMultiplier','defense','xpMultiplier','waterSlowMultiplier','poisonStacks','poisonTimer','slowFactor','bonusProjectiles','critChance','critMult','extraPierce','projSpeedMult','executeThreshold','emberDamage','frostSlow','dodgeChance','thorns','lifestealProgress','lifestealStacks','shield','maxShield','shieldRegenTimer','hasRevive','areaMult','durationMult','gemValueMult','ricochetChance','rerolls','banishes','cardDraw','luckMult','goldFindMult','companionMult','bloodPactLevels','glassCannonLevels','berserkerLevels'].map(key=>[key,player[key]])),
    weapons:playerWeapons.map(({id,level})=>({id,level})),
    equipment:equipment.map(({id,level})=>({id,level})),
    carriedRelic:carriedRelic?{...carriedRelic}:null,
    phoenixRevivedThisRun,upgradeLevels:{...player.upgradeLevels},banishedUpgrades:[...player.banishedUpgrades],
    elapsed,worldTime,kills,nextBossTime,relicsAtRunStart,
    spawnedBossBiomes:Array.from(spawnedBossBiomes),
    killsByFire,killsByWater,killsAtNight,bossKills,vampireKills,
    achievements:[...unlockedAch]
  };
}

function saveCamp(){
  try{
    campSave.potions=potionCount;
    campSave.exploredTiles=[...revealedTiles];
    campSave.lore = {
      clues: [...unlockedClues],
      journals: [...unlockedJournals],
      symbols: [...unlockedSymbols],
      stories: [...unlockedStories]
    };
    if(gameStarted&&!gameOver){
      campSave.campX=player.x;campSave.campY=player.y;
      campSave.runProgress=createRunProgress();
    }
    localStorage.setItem('pixelvivor.camp',JSON.stringify(campSave));
  }catch(error){
    console.error('Camp progress could not be saved.',error);
    const message=document.getElementById('campMessage');
    if(message)message.textContent='Your camp progress could not be saved in this browser.';
  }
}
function showCampMessage(message){
  const el=document.getElementById('campMessage');
  if(el)el.textContent=message;
}

function resetAllGameData(){
  const confirmed = confirm('RESET ALL GAME DATA?\n\nThis will permanently erase all your:\n- Gold & camp progress\n- Unlocked weapons, gear & mounts\n- Relic journal\n- Inventory materials & permanent buffs\n- Settings & custom options\n\nAre you sure you want to start completely fresh?');
  if(!confirmed) return;
  try{
    localStorage.removeItem('pixelvivor.camp');
    localStorage.removeItem('pixelvivor.worldSeed');
    localStorage.removeItem('pixelvivor.relics');
    localStorage.removeItem('pixelvivor.equippedRelics');
    localStorage.removeItem('pixelvivor.audio');
    localStorage.removeItem('pixelvivor.audioVolumes');
    localStorage.removeItem('pixelvivor_settings');
    localStorage.removeItem('pixelvivor.renderer3d');
    for(let i=localStorage.length-1; i>=0; i--){
      const k=localStorage.key(i);
      if(k && k.toLowerCase().includes('pixelvivor')) localStorage.removeItem(k);
    }
  }catch(e){
    console.error('Failed to clear game data:', e);
  }
  const fresh=makeFreshCampSave();
  for(const k of Object.keys(campSave)) delete campSave[k];
  Object.assign(campSave, fresh);
  try{ localStorage.setItem('pixelvivor.camp', JSON.stringify(fresh)); }catch{}
  location.reload();
}
function exportSaveData() {
  try {
    saveCamp();
    const saveBundle = {
      app: 'pixelvivor',
      version: 1,
      timestamp: new Date().toISOString(),
      character: campSave.character,
      gold: campSave.gold,
      camp: JSON.parse(localStorage.getItem('pixelvivor.camp') || '{}'),
      relics: JSON.parse(localStorage.getItem('pixelvivor.relics') || '[]'),
      equippedRelics: JSON.parse(localStorage.getItem('pixelvivor.equippedRelics') || '[]')
    };
    const blob = new Blob([JSON.stringify(saveBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `pixelvivor_save_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    try { playSfx('confirm'); } catch(e) {}
    showCampMessage('★ Save file exported and downloaded successfully!');
  } catch(err) {
    console.error('Failed to export save:', err);
    alert('Failed to export save: ' + err.message);
  }
}

function triggerSaveImport() {
  const input = document.getElementById('saveFileInput');
  if (input) {
    input.value = '';
    input.click();
  }
}

function handleSaveFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || data.app !== 'pixelvivor' || !data.camp) {
        alert('Invalid Pixelvivor save file! Please select a valid pixelvivor_save.json file.');
        return;
      }
      localStorage.setItem('pixelvivor.camp', JSON.stringify(data.camp));
      if (Array.isArray(data.relics)) {
        localStorage.setItem('pixelvivor.relics', JSON.stringify(data.relics));
      }
      if (Array.isArray(data.equippedRelics)) {
        localStorage.setItem('pixelvivor.equippedRelics', JSON.stringify(data.equippedRelics));
      }
      localStorage.setItem('pixelvivor.campReturnMessage', `★ Save file restored successfully! (${data.character || 'Wayfarer'} · ${data.gold || 0}g)`);
      localStorage.setItem('pixelvivor.skipStartMenu', 'true');
      localStorage.setItem("pixelvivor.skipStartMenuTime", Date.now().toString());
      try { playSfx('confirm'); } catch(err) {}
      location.reload();
    } catch(err) {
      console.error('Failed to parse save file:', err);
      alert('Could not parse the selected save file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function recordRunLog(runSummary) {
  try {
    if (typeof runSummary.devSpawn === 'undefined') {
      runSummary.devSpawn = Boolean(globalThis.devSpawn);
    }
    let logs = [];
    try {
      const raw = localStorage.getItem('pv_runlog');
      logs = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(logs)) logs = [];
    } catch (_) {
      logs = [];
    }

    logs.unshift(runSummary);
    if (logs.length > 50) logs.length = 50;

    try {
      localStorage.setItem('pv_runlog', JSON.stringify(logs));
    } catch (quotaError) {
      // If localStorage is full, try trimming down to last 15 entries and retry
      try {
        logs = logs.slice(0, 15);
        localStorage.setItem('pv_runlog', JSON.stringify(logs));
      } catch (_) {
        // Silently ignore to guarantee Game Over flow never breaks
      }
    }
  } catch (err) {
    // Top-level safety guard: Logging must NEVER crash gameplay or Game Over flow
    console.warn('pv_runlog record skipped:', err);
  }
}

function exportRunLog() {
  try {
    const raw = localStorage.getItem('pv_runlog') || '[]';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelvivor_runlog_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSfx('confirm');
  } catch (err) {
    console.error('Failed to export runlog:', err);
  }
}

document.getElementById('exportSaveBtn')?.addEventListener('click', exportSaveData);
document.getElementById('btnStartSave')?.addEventListener('click', exportSaveData);
document.getElementById('exportRunLogBtn')?.addEventListener('click', exportRunLog);
document.getElementById('importSaveBtn')?.addEventListener('click', triggerSaveImport);
document.getElementById('btnStartLoad')?.addEventListener('click', triggerSaveImport);
document.getElementById('saveFileInput')?.addEventListener('change', handleSaveFileSelected);

document.getElementById('resetDataBtn')?.addEventListener('click', resetAllGameData);
document.getElementById('resetDataSettingsBtn')?.addEventListener('click', resetAllGameData);

function setupSettingsListeners() {
  const binds = [
    { id: 'setShowFps', prop: 'showFps', type: 'checkbox' },
    { id: 'setPerfFps', prop: 'showFps', type: 'checkbox' },
    { id: 'setDamageNumbers', prop: 'showDamageNumbers', type: 'checkbox' },
    { id: 'setScreenShake', prop: 'screenShake', type: 'checkbox' },
    { id: 'setWeather', prop: 'enableWeather', type: 'checkbox' },
    { id: 'setManualAim', prop: 'manualAim', type: 'checkbox' },
    { id: 'setAutoLevel', prop: 'autoLevel', type: 'checkbox' },
    { id: 'setMinimap', prop: 'showMinimap', type: 'checkbox' },
    { id: 'setEnableFog', prop: 'enableFog', type: 'checkbox' },
    { id: 'setEnableFogPerf', prop: 'enableFog', type: 'checkbox' },
    { id: 'setGemClustering', prop: 'gemClustering', type: 'checkbox' },
    { id: 'setSmartOffscreen', prop: 'smartOffscreen', type: 'checkbox' },
    { id: 'setDamageNumbersMode', prop: 'damageNumbersMode', type: 'selectString' },
    { id: 'setParticleLimit', prop: 'particleLimit', type: 'selectNumber' },
    { id: 'setShadowQuality', prop: 'shadowQuality', type: 'selectString' },
    { id: 'setWeatherDensity', prop: 'weatherDensity', type: 'selectString' },
    { id: 'setZoom', prop: 'zoom', type: 'range', out: 'zoomValue', format: v => Number(v).toFixed(1) + 'x' },
    { id: 'setUIScale', prop: 'uiScale', type: 'range', out: 'uiScaleValue', format: v => Math.round(Number(v) * 100) + '%' },
    { id: 'setDifficulty', prop: 'difficulty', type: 'selectNumber' }
  ];
  for (const b of binds) {
    const el = document.getElementById(b.id);
    if (!el) continue;
    if (b.type === 'checkbox') {
      el.checked = Boolean(window.GAME_SETTINGS[b.prop]);
      el.addEventListener('change', () => { 
        window.GAME_SETTINGS[b.prop] = el.checked;
        if (b.prop === 'enableFog') {
          const o1 = document.getElementById('setEnableFog');
          const o2 = document.getElementById('setEnableFogPerf');
          if (o1) o1.checked = el.checked;
          if (o2) o2.checked = el.checked;
        } else if (b.prop === 'showFps') {
          const o1 = document.getElementById('setShowFps');
          const o2 = document.getElementById('setPerfFps');
          if (o1) o1.checked = el.checked;
          if (o2) o2.checked = el.checked;
        }
        saveSettings(); 
      });
    } else if (b.type === 'range') {
      el.value = window.GAME_SETTINGS[b.prop];
      if (b.out) document.getElementById(b.out).textContent = b.format(window.GAME_SETTINGS[b.prop]);
      el.addEventListener('input', () => { 
        window.GAME_SETTINGS[b.prop] = Number(el.value); 
        if (b.out) document.getElementById(b.out).textContent = b.format(el.value);
        saveSettings(); 
      });
    } else if (b.type === 'selectNumber') {
      el.value = String(window.GAME_SETTINGS[b.prop] ?? 1);
      el.addEventListener('change', () => {
        window.GAME_SETTINGS[b.prop] = Number(el.value);
        saveSettings();
      });
    } else if (b.type === 'selectString') {
      el.value = String(window.GAME_SETTINGS[b.prop] || '');
      el.addEventListener('change', () => {
        window.GAME_SETTINGS[b.prop] = el.value;
        saveSettings();
      });
    }
  }

  // Presets & Modal Triggers
  function syncPerfModalUI() {
    const currentPreset = window.GAME_SETTINGS.perfPreset || 'balanced';
    document.querySelectorAll('.perf-preset-btn').forEach(btn => btn.classList.remove('active'));
    if (currentPreset === 'maxPerf') document.getElementById('presetMaxPerf')?.classList.add('active');
    else if (currentPreset === 'highQuality') document.getElementById('presetHighQuality')?.classList.add('active');
    else document.getElementById('presetBalanced')?.classList.add('active');

    const bindsToSync = ['setPerfFps','setEnableFogPerf','setDamageNumbersMode','setParticleLimit','setShadowQuality','setWeatherDensity','setGemClustering','setSmartOffscreen'];
    for (const id of bindsToSync) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.type === 'checkbox') el.checked = Boolean(window.GAME_SETTINGS[id === 'setPerfFps' ? 'showFps' : id.replace(/^set/, '').charAt(0).toLowerCase() + id.replace(/^set/, '').slice(1)]);
      else el.value = String(window.GAME_SETTINGS[id.replace(/^set/, '').charAt(0).toLowerCase() + id.replace(/^set/, '').slice(1)]);
    }
  }

  function applyPreset(preset) {
    window.GAME_SETTINGS.perfPreset = preset;
    if (preset === 'maxPerf') {
      window.GAME_SETTINGS.damageNumbersMode = 'off';
      window.GAME_SETTINGS.particleLimit = 60;
      window.GAME_SETTINGS.enableFog = false;
      window.GAME_SETTINGS.shadowQuality = 'off';
      window.GAME_SETTINGS.weatherDensity = 'off';
      window.GAME_SETTINGS.gemClustering = true;
      window.GAME_SETTINGS.smartOffscreen = true;
    } else if (preset === 'highQuality') {
      window.GAME_SETTINGS.damageNumbersMode = 'full';
      window.GAME_SETTINGS.particleLimit = 300;
      window.GAME_SETTINGS.shadowQuality = 'soft';
      window.GAME_SETTINGS.weatherDensity = 'full';
      window.GAME_SETTINGS.gemClustering = false;
      window.GAME_SETTINGS.smartOffscreen = false;
    } else { // balanced
      window.GAME_SETTINGS.damageNumbersMode = 'compressed';
      window.GAME_SETTINGS.particleLimit = 150;
      window.GAME_SETTINGS.shadowQuality = 'fast';
      window.GAME_SETTINGS.weatherDensity = 'low';
      window.GAME_SETTINGS.enableFog = true;
      window.GAME_SETTINGS.gemClustering = true;
      window.GAME_SETTINGS.smartOffscreen = true;
    }
    saveSettings();
    syncPerfModalUI();
  }

  document.getElementById('presetMaxPerf')?.addEventListener('click', () => applyPreset('maxPerf'));
  document.getElementById('presetBalanced')?.addEventListener('click', () => applyPreset('balanced'));
  document.getElementById('presetHighQuality')?.addEventListener('click', () => applyPreset('highQuality'));

  document.getElementById('openPerformanceBtn')?.addEventListener('click', () => {
    document.getElementById('performanceModal')?.classList.add('open');
    syncPerfModalUI();
  });
  document.getElementById('fpsCounter')?.addEventListener('click', () => {
    document.getElementById('performanceModal')?.classList.add('open');
    syncPerfModalUI();
  });
}
setupSettingsListeners();

const QUEST_MATERIAL_KEYS = ['tidecallersConch', 'abyssalKey', 'abyssalHeart', 'goldenEgg'];
const QUEST_ITEM_LABELS = [
  { flag: 'hasTidecallerConch', label: "Tidecaller's Conch", relicId: 'relic_tidecaller_conch' },
  { flag: 'hasAbyssalKey', label: 'The Abyssal Key', relicId: 'relic_abyssal_key' },
  { flag: 'hasAbyssalHeart', label: 'Abyssal Heart' },
  { flag: 'hasHeartOfWinter', label: 'Heart of Winter', relicId: 'relic_heart_of_winter' },
  { flag: 'hasGoldenEgg', label: 'Golden Egg' }
];

function captureRunQuestBaseline() {
  const mats = {};
  for (const k of QUEST_MATERIAL_KEYS) {
    mats[k] = Math.max(0, Number(campSave.materials?.[k]) || 0);
  }
  campSave.runQuestBaseline = {
    hasTidecallerConch: Boolean(campSave.hasTidecallerConch),
    hasAbyssalKey: Boolean(campSave.hasAbyssalKey),
    hasAbyssalHeart: Boolean(campSave.hasAbyssalHeart),
    hasHeartOfWinter: Boolean(campSave.hasHeartOfWinter),
    hasGoldenEgg: Boolean(campSave.hasGoldenEgg),
    secret2Stage: Number(campSave.secret2Stage) || 0,
    secret2Complete: Boolean(campSave.secret2Complete),
    mountainSealsBroken: Number(campSave.mountainSealsBroken) || 0,
    materials: mats
  };
}

function commitRunQuestBaseline() {
  campSave.runQuestBaseline = null;
}

function forfeitRunQuestItemsOnDeath(relicJournal, relicJournalIds, equippedRelicIds, saveRelicJournalFn, saveEquippedRelicsFn) {
  const base = campSave.runQuestBaseline;
  if (!base || typeof base !== 'object') return [];
  const lostNames = [];
  for (const entry of QUEST_ITEM_LABELS) {
    const hadBefore = Boolean(base[entry.flag]);
    const hasNow = Boolean(campSave[entry.flag]);
    if (hasNow && !hadBefore) {
      lostNames.push(entry.label);
      campSave[entry.flag] = false;
      if (entry.relicId && Array.isArray(relicJournal)) {
        for (let i = relicJournal.length - 1; i >= 0; i--) {
          if (relicJournal[i]?.id === entry.relicId) relicJournal.splice(i, 1);
        }
        relicJournalIds?.delete?.(entry.relicId);
        if (Array.isArray(equippedRelicIds)) {
          for (let i = 0; i < equippedRelicIds.length; i++) {
            if (equippedRelicIds[i] === entry.relicId) equippedRelicIds[i] = null;
          }
        }
      }
    }
  }
  if (campSave.materials && base.materials) {
    for (const k of QUEST_MATERIAL_KEYS) {
      const beforeCount = Math.max(0, Number(base.materials[k]) || 0);
      if ((campSave.materials[k] || 0) > beforeCount) {
        if (beforeCount <= 0) delete campSave.materials[k];
        else campSave.materials[k] = beforeCount;
      }
    }
  }
  campSave.secret2Stage = Number(base.secret2Stage) || 0;
  campSave.secret2Complete = Boolean(base.secret2Complete);
  campSave.mountainSealsBroken = Number(base.mountainSealsBroken) || 0;
  campSave.runQuestBaseline = null;
  if (lostNames.length > 0) {
    if (typeof saveRelicJournalFn === 'function') saveRelicJournalFn(relicJournal);
    if (typeof saveEquippedRelicsFn === 'function') saveEquippedRelicsFn(equippedRelicIds);
  }
  return lostNames;
}

export { saveSettings, applySettingsUI, setupSettingsListeners, makeFreshCampSave, loadCampSave, campSave, unlockedClues, unlockedJournals, unlockedSymbols, unlockedStories, LORE_SETS, loadLoreSets, saveLoreSets, unlockLore, createRunProgress, saveCamp, showCampMessage, resetAllGameData, exportSaveData, triggerSaveImport, handleSaveFileSelected, recordRunLog, exportRunLog, captureRunQuestBaseline, commitRunQuestBaseline, forfeitRunQuestItemsOnDeath };
