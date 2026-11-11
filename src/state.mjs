import { loadRelicJournal, loadEquippedRelics } from './quests.mjs?v336';
import { CAMP_COMPANIONS } from './config.mjs?v336';
import { campSave } from './save.mjs?v336';

const canvas=document.getElementById('c'),ctx=canvas.getContext('2d');

canvas.width=innerWidth;canvas.height=innerHeight;

function viewZoom(){return Math.max(.5,Math.min(2,Number(window.GAME_SETTINGS.zoom)||1));}
function VW(){return canvas.width/viewZoom();}
function VH(){return canvas.height/viewZoom();}

let floodBoost=0;   // 0=normal, up to 0.25 extra water coverage

// ═══════════════════════════════════════════════════════════
// CHUNK GEN & RICH PIXEL-ART TERRAIN / WATER RENDERING
// ═══════════════════════════════════════════════════════════
let lastCleanup=0,lastDespawn=0;

const DAY_LENGTH=300;let worldTime=45;
const getDayPhase=()=>(worldTime%DAY_LENGTH)/DAY_LENGTH;
const getDaylight=()=>0.5+0.5*Math.sin(getDayPhase()*Math.PI*2-Math.PI/2);
const getSunX=()=>Math.cos(getDayPhase()*Math.PI*2-Math.PI/2);
const isNight=()=>getDaylight()<0.35;

let isBloodMoon=false,nextBloodMoonCheck=0;

let weather={type:'clear',timer:120};

const weatherParticles=[];

const lightnings=[];let lightningCooldown=0;

let lightningFlash={life:0};

let maskOfCalmActive = false;

// ═══════════════════════════════════════════════════════════
// FLOOD & INCREMENTAL WATER TIME-SLICING
// ═══════════════════════════════════════════════════════════
let flood={active:false,timer:0,nextFlood:240,level:0};
let floodScanTimer=0;

let killsByFire=0,killsByWater=0,killsAtNight=0,bossKills=0,vampireKills=0;
let survivedStorm=false,survivedFlood=false;
let inStorm=false,inFlood=false,inNight=false;
let enemiesFrozenRun=0, totalHealedHPRun=0, rangedKillsRun=0, meleeKillsRun=0, chestsOpenedRun=0, survivedBloodMoon=false;
const unlockedAch=new Set();

let bossIntro={timer:0,boss:null,zoom:1};
let deathSeq={active:false,done:false,timer:0,duration:1.85,zoom:1};

// ═══════════════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════════════
const player={
  x:0,y:0,w:30,h:42,hp:100,maxHp:100,speed:2.8,
  tileX:26,tileY:23,pixelX:0,pixelY:0,
  moveFrom:{x:26,y:23},moveTo:{x:26,y:23},moveProgress:1,moveDuration:0.15,
  level:1,xp:0,xpNext:10,pickupRange:90,regen:0,invulnTimer:0,
  facing:1,facingY:1,walkTimer:0,moving:false,lastMoveX:0,lastMoveY:1,
  customChar:false,directionalChar:false,animSheets:null,
  poisonStacks:0,poisonTimer:0,poisonTickTimer:0,
  slowFactor:1,inWater:0,wasInWater:0,
  waterSlowMultiplier:1,
  damageMultiplier:1,defense:0,cooldownMultiplier:1,xpMultiplier:1,bonusProjectiles:0,
  critChance:0,critMult:2,extraPierce:0,projSpeedMult:1,executeThreshold:0,emberDamage:0,frostSlow:0,
  dodgeChance:0,thorns:0,lifestealProgress:0,lifestealStacks:0,shield:0,maxShield:0,shieldRegenTimer:0,hasRevive:false,
  areaMult:1,durationMult:1,gemValueMult:1,ricochetChance:0,rerolls:0,banishes:0,cardDraw:0,
  luckMult:1,goldFindMult:1,companionMult:1,bloodPactLevels:0,glassCannonLevels:0,berserkerLevels:0,upgradeLevels:{},banishedUpgrades:[],
  mounted:false,
  abilities:[],
  bloodlustStacks:0,
  shieldBubbleTimer:0,
  shieldBubbleCharges:0,
  randomTeleportTimer:0,
  timeFreezeTimer:0,
  timeFreezeActive:0,
  rewindUsed:false,
  rewindHistory:[],
  timeDilationActive:false,
  fireBreathTimer:0,
  fireBreathMax:0.52,
  fireBreathAngle:0
};
const camera={x:0,y:0};
const keys={};
let elapsed=0,kills=0;
let paused=false,gameOver=false,gameStarted=false;
let nextBossTime=360;
let spawnedBossBiomes=new Set();
let screenShakeIntensity=0;
let enemies=[],projectiles=[],xpGems=[],particles=[],damageNumbers=[];


let hordeEvent = {
  timer: 100,
  active: false,
  warning: 0,
  type: null,
  data: null
};

let lastHordeSpawnTime = 0;
let lastSwarmWaveTime = 0;
let phoenixRevivedThisRun = false;

const playerWeapons=[];
const equipment=[]; // {id, icon, sprite, level}
const relicJournal=loadRelicJournal();
const relicJournalIds=new Set(relicJournal.map(relic=>relic.id));
let carriedRelic=null;
const equippedRelicIds=loadEquippedRelics().map(id=>id&&relicJournalIds.has(id)?id:null);
while(equippedRelicIds.length<4)equippedRelicIds.push(null);
let relicModifiers={damage:1,speed:1,cooldown:1,xp:1,regen:0,pickupRange:0,ricochet:false,special:null};
let lastQuestText='';
let inventoryOpen=false;
// Weapon upgrade arrays
let mines = [];
let holyPools = [];
let chainVisuals = [];
let summonedSpirits=[];
let voidRifts=[];
let meleeSwings=[];
let prismBeams=[];
let rainbowArcs=[];
let fireBreaths=[], activeChainWhips=[];
let krakenEruptions = [];
let krakenInkClouds = [];
window.krakenEruptions = krakenEruptions;
window.krakenInkClouds = krakenInkClouds;

// ═══════════════════════════════════════════════════════════
// WEAPONS
// ═══════════════════════════════════════════════════════════

// Equipment upgrades (persistent once purchased)
// ═══════════════════════════════════════════════════════════
// LEGENDARY ITEM SETS (5 Sets × 3 Pieces)
// ═══════════════════════════════════════════════════════════

let trinketPickups = [];

const legendaryPickups = [];

let activeNearbyNPC = null;
let npcModalOpen = false;
let currentInteractingNPC = null;
let gamblingInProgress = false;

let currentLoreCategory = 'clues';


let hasResumableProgress=false;

let FOG_REVEAL_RADIUS=9;
let fogRevealVersion=1;
let lastRevealedTile='',lastFogSave=0;

const npcBubbleMap = new Map();
let campDialogueTimer = null;

let campTab='home',campRunSettled=false;
let companions=CAMP_COMPANIONS.filter(item=>campSave.companions.includes(item.id)).map(item=>({
  ...item,
  cooldown:0,x:player.x,y:player.y,
  hp:100,maxHp:100,           // Aldric
  markTimer:0,                 // Kael
  packKillCount:0,packTimer:0, // Fenrir
  buffTimer:0,                 // Selene
  summons:[],lastSummon:0,     // Morvath
  burnAuraTimer:0,             // Ashe
  usedRevive:false             // Ashe
}));
let potionCount=campSave.potions;
let relicsAtRunStart=relicJournal.length;
// ═══════════════════════════════════════════════════════════
// QUEST PROGRESS TRACKING
// ═══════════════════════════════════════════════════════════
let questProgress = {
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

let currentInventoryFilter = 'all';
let selectedInventoryItem = null;

let packCounter=0;

let damageNumberRingIdx = 0;

let cachedNearestRelic = null, lastNearestRelicAt = -1;

let pendingLevelUps=0;

let lastBiome='',lastStatus='',lastVisitedBiome=campSave.campBiome||'plains';
let lastConditionsKey='',lastHudHpPct=-1,lastHudClockWeatherKey='';

let lastTime=performance.now();

let mouseScreenX = 0, mouseScreenY = 0, mouseDown = false;

// Dream Biome & Sleep Debt state
let sleepDebt = 0;
let dreamTimer = 0;
let dreamKills = 0;
let isInDream = false;
let nightmareLevel = 1;
let lastSleepBiome = null;
let consecutiveSleeps = 0;
let awakeningProgress = 0;
let isStruggling = false;
let struggleTimer = 0;
let wakeAlarmBuff = 0;
let sandmanSpawned = false;
let savedDreamReturnPos = null;
let dreamRelics = [];
let dreamRelicPickups = [];
let dreamStationaryTimer = 0;
let dreamEssenceTimer = 0;
let dreamCoins = 0;
let dreamCoinPickups = [];
let dreamShopStock = null;
let chickenCoins = campSave.chickenCoins || 0;
let chickenCoinPickups = [];
let chickenKingSpawned = false;
let chickenKingDefeated = false;
let chickenDimensionEntered = false;
let savedChickenWeapons = null;
let lastDamageSource = 'unknown';
let rawDamageTakenRun = 0;
let effectiveDamageTakenRun = 0;
let totalDamageTakenRun = 0;
let damageBySource = {};
let recentHitBuffer = [];
let devSpawn = false;
let devSpawnNearBorder = false;
let devStartBiome = 'default';
let devStartLevel = 1;
let devGiveWeaponsAt5 = false;

const state = globalThis;
Object.defineProperties(globalThis, {
  floodBoost: { get: () => floodBoost, set: (val) => { floodBoost = val; }, configurable: true, enumerable: true },
  lastCleanup: { get: () => lastCleanup, set: (val) => { lastCleanup = val; }, configurable: true, enumerable: true },
  lastDespawn: { get: () => lastDespawn, set: (val) => { lastDespawn = val; }, configurable: true, enumerable: true },
  worldTime: { get: () => worldTime, set: (val) => { worldTime = val; }, configurable: true, enumerable: true },
  isBloodMoon: { get: () => isBloodMoon, set: (val) => { isBloodMoon = val; }, configurable: true, enumerable: true },
  nextBloodMoonCheck: { get: () => nextBloodMoonCheck, set: (val) => { nextBloodMoonCheck = val; }, configurable: true, enumerable: true },
  weather: { get: () => weather, set: (val) => { weather = val; }, configurable: true, enumerable: true },
  lightningCooldown: { get: () => lightningCooldown, set: (val) => { lightningCooldown = val; }, configurable: true, enumerable: true },
  lightningFlash: { get: () => lightningFlash, set: (val) => { lightningFlash = val; }, configurable: true, enumerable: true },
  maskOfCalmActive: { get: () => maskOfCalmActive, set: (val) => { maskOfCalmActive = val; }, configurable: true, enumerable: true },
  flood: { get: () => flood, set: (val) => { flood = val; }, configurable: true, enumerable: true },
  floodScanTimer: { get: () => floodScanTimer, set: (val) => { floodScanTimer = val; }, configurable: true, enumerable: true },
  killsByFire: { get: () => killsByFire, set: (val) => { killsByFire = val; }, configurable: true, enumerable: true },
  killsByWater: { get: () => killsByWater, set: (val) => { killsByWater = val; }, configurable: true, enumerable: true },
  killsAtNight: { get: () => killsAtNight, set: (val) => { killsAtNight = val; }, configurable: true, enumerable: true },
  bossKills: { get: () => bossKills, set: (val) => { bossKills = val; }, configurable: true, enumerable: true },
  vampireKills: { get: () => vampireKills, set: (val) => { vampireKills = val; }, configurable: true, enumerable: true },
  survivedStorm: { get: () => survivedStorm, set: (val) => { survivedStorm = val; }, configurable: true, enumerable: true },
  survivedFlood: { get: () => survivedFlood, set: (val) => { survivedFlood = val; }, configurable: true, enumerable: true },
  inStorm: { get: () => inStorm, set: (val) => { inStorm = val; }, configurable: true, enumerable: true },
  inFlood: { get: () => inFlood, set: (val) => { inFlood = val; }, configurable: true, enumerable: true },
  inNight: { get: () => inNight, set: (val) => { inNight = val; }, configurable: true, enumerable: true },
  enemiesFrozenRun: { get: () => enemiesFrozenRun, set: (val) => { enemiesFrozenRun = val; }, configurable: true, enumerable: true },
  totalHealedHPRun: { get: () => totalHealedHPRun, set: (val) => { totalHealedHPRun = val; }, configurable: true, enumerable: true },
  rangedKillsRun: { get: () => rangedKillsRun, set: (val) => { rangedKillsRun = val; }, configurable: true, enumerable: true },
  meleeKillsRun: { get: () => meleeKillsRun, set: (val) => { meleeKillsRun = val; }, configurable: true, enumerable: true },
  chestsOpenedRun: { get: () => chestsOpenedRun, set: (val) => { chestsOpenedRun = val; }, configurable: true, enumerable: true },
  survivedBloodMoon: { get: () => survivedBloodMoon, set: (val) => { survivedBloodMoon = val; }, configurable: true, enumerable: true },
  bossIntro: { get: () => bossIntro, set: (val) => { bossIntro = val; }, configurable: true, enumerable: true },
  deathSeq: { get: () => deathSeq, set: (val) => { deathSeq = val; }, configurable: true, enumerable: true },
  elapsed: { get: () => elapsed, set: (val) => { elapsed = val; }, configurable: true, enumerable: true },
  kills: { get: () => kills, set: (val) => { kills = val; }, configurable: true, enumerable: true },
  paused: { get: () => paused, set: (val) => { paused = val; }, configurable: true, enumerable: true },
  gameOver: { get: () => gameOver, set: (val) => { gameOver = val; }, configurable: true, enumerable: true },
  gameStarted: { get: () => gameStarted, set: (val) => { gameStarted = val; }, configurable: true, enumerable: true },
  nextBossTime: { get: () => nextBossTime, set: (val) => { nextBossTime = val; }, configurable: true, enumerable: true },
  spawnedBossBiomes: { get: () => spawnedBossBiomes, set: (val) => { spawnedBossBiomes = val; }, configurable: true, enumerable: true },
  screenShakeIntensity: { get: () => screenShakeIntensity, set: (val) => { screenShakeIntensity = val; }, configurable: true, enumerable: true },
  hordeEvent: { get: () => hordeEvent, set: (val) => { hordeEvent = val; }, configurable: true, enumerable: true },
  lastHordeSpawnTime: { get: () => lastHordeSpawnTime, set: (val) => { lastHordeSpawnTime = val; }, configurable: true, enumerable: true },
  lastSwarmWaveTime: { get: () => lastSwarmWaveTime, set: (val) => { lastSwarmWaveTime = val; }, configurable: true, enumerable: true },
  phoenixRevivedThisRun: { get: () => phoenixRevivedThisRun, set: (val) => { phoenixRevivedThisRun = val; }, configurable: true, enumerable: true },
  carriedRelic: { get: () => carriedRelic, set: (val) => { carriedRelic = val; }, configurable: true, enumerable: true },
  relicModifiers: { get: () => relicModifiers, set: (val) => { relicModifiers = val; }, configurable: true, enumerable: true },
  lastQuestText: { get: () => lastQuestText, set: (val) => { lastQuestText = val; }, configurable: true, enumerable: true },
  inventoryOpen: { get: () => inventoryOpen, set: (val) => { inventoryOpen = val; }, configurable: true, enumerable: true },
  activeNearbyNPC: { get: () => activeNearbyNPC, set: (val) => { activeNearbyNPC = val; }, configurable: true, enumerable: true },
  npcModalOpen: { get: () => npcModalOpen, set: (val) => { npcModalOpen = val; }, configurable: true, enumerable: true },
  currentInteractingNPC: { get: () => currentInteractingNPC, set: (val) => { currentInteractingNPC = val; }, configurable: true, enumerable: true },
  gamblingInProgress: { get: () => gamblingInProgress, set: (val) => { gamblingInProgress = val; }, configurable: true, enumerable: true },
  currentLoreCategory: { get: () => currentLoreCategory, set: (val) => { currentLoreCategory = val; }, configurable: true, enumerable: true },
  hasResumableProgress: { get: () => hasResumableProgress, set: (val) => { hasResumableProgress = val; }, configurable: true, enumerable: true },
  FOG_REVEAL_RADIUS: { get: () => FOG_REVEAL_RADIUS, set: (val) => { FOG_REVEAL_RADIUS = val; }, configurable: true, enumerable: true },
  fogRevealVersion: { get: () => fogRevealVersion, set: (val) => { fogRevealVersion = val; }, configurable: true, enumerable: true },
  lastRevealedTile: { get: () => lastRevealedTile, set: (val) => { lastRevealedTile = val; }, configurable: true, enumerable: true },
  lastFogSave: { get: () => lastFogSave, set: (val) => { lastFogSave = val; }, configurable: true, enumerable: true },
  campDialogueTimer: { get: () => campDialogueTimer, set: (val) => { campDialogueTimer = val; }, configurable: true, enumerable: true },
  campTab: { get: () => campTab, set: (val) => { campTab = val; }, configurable: true, enumerable: true },
  campRunSettled: { get: () => campRunSettled, set: (val) => { campRunSettled = val; }, configurable: true, enumerable: true },
  companions: { get: () => companions, set: (val) => { companions = val; }, configurable: true, enumerable: true },
  potionCount: { get: () => potionCount, set: (val) => { potionCount = val; }, configurable: true, enumerable: true },
  relicsAtRunStart: { get: () => relicsAtRunStart, set: (val) => { relicsAtRunStart = val; }, configurable: true, enumerable: true },
  questProgress: { get: () => questProgress, set: (val) => { questProgress = val; }, configurable: true, enumerable: true },
  currentInventoryFilter: { get: () => currentInventoryFilter, set: (val) => { currentInventoryFilter = val; }, configurable: true, enumerable: true },
  selectedInventoryItem: { get: () => selectedInventoryItem, set: (val) => { selectedInventoryItem = val; }, configurable: true, enumerable: true },
  packCounter: { get: () => packCounter, set: (val) => { packCounter = val; }, configurable: true, enumerable: true },
  damageNumberRingIdx: { get: () => damageNumberRingIdx, set: (val) => { damageNumberRingIdx = val; }, configurable: true, enumerable: true },
  cachedNearestRelic: { get: () => cachedNearestRelic, set: (val) => { cachedNearestRelic = val; }, configurable: true, enumerable: true },
  lastNearestRelicAt: { get: () => lastNearestRelicAt, set: (val) => { lastNearestRelicAt = val; }, configurable: true, enumerable: true },
  pendingLevelUps: { get: () => pendingLevelUps, set: (val) => { pendingLevelUps = val; }, configurable: true, enumerable: true },
  lastBiome: { get: () => lastBiome, set: (val) => { lastBiome = val; }, configurable: true, enumerable: true },
  lastStatus: { get: () => lastStatus, set: (val) => { lastStatus = val; }, configurable: true, enumerable: true },
  lastVisitedBiome: { get: () => lastVisitedBiome, set: (val) => { lastVisitedBiome = val; }, configurable: true, enumerable: true },
  lastConditionsKey: { get: () => lastConditionsKey, set: (val) => { lastConditionsKey = val; }, configurable: true, enumerable: true },
  lastHudHpPct: { get: () => lastHudHpPct, set: (val) => { lastHudHpPct = val; }, configurable: true, enumerable: true },
  lastHudClockWeatherKey: { get: () => lastHudClockWeatherKey, set: (val) => { lastHudClockWeatherKey = val; }, configurable: true, enumerable: true },
  lastTime: { get: () => lastTime, set: (val) => { lastTime = val; }, configurable: true, enumerable: true },
  mouseScreenX: { get: () => mouseScreenX, set: (val) => { mouseScreenX = val; }, configurable: true, enumerable: true },
  mouseScreenY: { get: () => mouseScreenY, set: (val) => { mouseScreenY = val; }, configurable: true, enumerable: true },
  mouseDown: { get: () => mouseDown, set: (val) => { mouseDown = val; }, configurable: true, enumerable: true },
  sleepDebt: { get: () => sleepDebt, set: (val) => { sleepDebt = val; }, configurable: true, enumerable: true },
  dreamTimer: { get: () => dreamTimer, set: (val) => { dreamTimer = val; }, configurable: true, enumerable: true },
  dreamKills: { get: () => dreamKills, set: (val) => { dreamKills = val; }, configurable: true, enumerable: true },
  isInDream: { get: () => isInDream, set: (val) => { isInDream = val; }, configurable: true, enumerable: true },
  nightmareLevel: { get: () => nightmareLevel, set: (val) => { nightmareLevel = val; }, configurable: true, enumerable: true },
  lastSleepBiome: { get: () => lastSleepBiome, set: (val) => { lastSleepBiome = val; }, configurable: true, enumerable: true },
  consecutiveSleeps: { get: () => consecutiveSleeps, set: (val) => { consecutiveSleeps = val; }, configurable: true, enumerable: true },
  awakeningProgress: { get: () => awakeningProgress, set: (val) => { awakeningProgress = val; }, configurable: true, enumerable: true },
  isStruggling: { get: () => isStruggling, set: (val) => { isStruggling = val; }, configurable: true, enumerable: true },
  struggleTimer: { get: () => struggleTimer, set: (val) => { struggleTimer = val; }, configurable: true, enumerable: true },
  wakeAlarmBuff: { get: () => wakeAlarmBuff, set: (val) => { wakeAlarmBuff = val; }, configurable: true, enumerable: true },
  sandmanSpawned: { get: () => sandmanSpawned, set: (val) => { sandmanSpawned = val; }, configurable: true, enumerable: true },
  savedDreamReturnPos: { get: () => savedDreamReturnPos, set: (val) => { savedDreamReturnPos = val; }, configurable: true, enumerable: true },
  dreamRelics: { get: () => dreamRelics, set: (val) => { dreamRelics = val; }, configurable: true, enumerable: true },
  dreamRelicPickups: { get: () => dreamRelicPickups, set: (val) => { dreamRelicPickups = val; }, configurable: true, enumerable: true },
  dreamStationaryTimer: { get: () => dreamStationaryTimer, set: (val) => { dreamStationaryTimer = val; }, configurable: true, enumerable: true },
  dreamEssenceTimer: { get: () => dreamEssenceTimer, set: (val) => { dreamEssenceTimer = val; }, configurable: true, enumerable: true },
  dreamCoins: { get: () => dreamCoins, set: (val) => { dreamCoins = val; }, configurable: true, enumerable: true },
  dreamCoinPickups: { get: () => dreamCoinPickups, set: (val) => { dreamCoinPickups = val; }, configurable: true, enumerable: true },
  dreamShopStock: { get: () => dreamShopStock, set: (val) => { dreamShopStock = val; }, configurable: true, enumerable: true },
  chickenCoins: { get: () => chickenCoins, set: (val) => { chickenCoins = val; }, configurable: true, enumerable: true },
  chickenCoinPickups: { get: () => chickenCoinPickups, set: (val) => { chickenCoinPickups = val; }, configurable: true, enumerable: true },
  chickenKingSpawned: { get: () => chickenKingSpawned, set: (val) => { chickenKingSpawned = val; }, configurable: true, enumerable: true },
  chickenKingDefeated: { get: () => chickenKingDefeated, set: (val) => { chickenKingDefeated = val; }, configurable: true, enumerable: true },
  chickenDimensionEntered: { get: () => chickenDimensionEntered, set: (val) => { chickenDimensionEntered = val; }, configurable: true, enumerable: true },
  savedChickenWeapons: { get: () => savedChickenWeapons, set: (val) => { savedChickenWeapons = val; }, configurable: true, enumerable: true },
  lastDamageSource: { get: () => lastDamageSource, set: (val) => { lastDamageSource = val; }, configurable: true, enumerable: true },
  rawDamageTakenRun: { get: () => rawDamageTakenRun, set: (val) => { rawDamageTakenRun = val; }, configurable: true, enumerable: true },
  effectiveDamageTakenRun: { get: () => effectiveDamageTakenRun, set: (val) => { effectiveDamageTakenRun = val; }, configurable: true, enumerable: true },
  totalDamageTakenRun: { get: () => totalDamageTakenRun, set: (val) => { totalDamageTakenRun = val; }, configurable: true, enumerable: true },
  damageBySource: { get: () => damageBySource, set: (val) => { damageBySource = val; }, configurable: true, enumerable: true },
  recentHitBuffer: { get: () => recentHitBuffer, set: (val) => { recentHitBuffer = val; }, configurable: true, enumerable: true },
  devSpawn: { get: () => devSpawn, set: (val) => { devSpawn = val; }, configurable: true, enumerable: true },
  devSpawnNearBorder: { get: () => devSpawnNearBorder, set: (val) => { devSpawnNearBorder = val; }, configurable: true, enumerable: true },
  devStartBiome: { get: () => devStartBiome, set: (val) => { devStartBiome = val; }, configurable: true, enumerable: true },
  devStartLevel: { get: () => devStartLevel, set: (val) => { devStartLevel = val; }, configurable: true, enumerable: true },
  devGiveWeaponsAt5: { get: () => devGiveWeaponsAt5, set: (val) => { devGiveWeaponsAt5 = val; }, configurable: true, enumerable: true },
});

export { state, canvas, ctx, viewZoom, VW, VH, DAY_LENGTH, getDayPhase, getDaylight, getSunX, isNight, weatherParticles, lightnings, unlockedAch, player, camera, keys, enemies, projectiles, xpGems, particles, damageNumbers, playerWeapons, equipment, relicJournal, relicJournalIds, equippedRelicIds, mines, holyPools, chainVisuals, summonedSpirits, voidRifts, meleeSwings, prismBeams, rainbowArcs, fireBreaths, activeChainWhips, krakenEruptions, krakenInkClouds, trinketPickups, legendaryPickups, npcBubbleMap, floodBoost, lastCleanup, lastDespawn, worldTime, isBloodMoon, nextBloodMoonCheck, weather, lightningCooldown, lightningFlash, maskOfCalmActive, flood, floodScanTimer, killsByFire, killsByWater, killsAtNight, bossKills, vampireKills, survivedStorm, survivedFlood, inStorm, inFlood, inNight, enemiesFrozenRun, totalHealedHPRun, rangedKillsRun, meleeKillsRun, chestsOpenedRun, survivedBloodMoon, bossIntro, deathSeq, elapsed, kills, paused, gameOver, gameStarted, nextBossTime, spawnedBossBiomes, screenShakeIntensity, hordeEvent, lastHordeSpawnTime, lastSwarmWaveTime, phoenixRevivedThisRun, carriedRelic, relicModifiers, lastQuestText, inventoryOpen, activeNearbyNPC, npcModalOpen, currentInteractingNPC, gamblingInProgress, currentLoreCategory, hasResumableProgress, FOG_REVEAL_RADIUS, fogRevealVersion, lastRevealedTile, lastFogSave, campDialogueTimer, campTab, campRunSettled, companions, potionCount, relicsAtRunStart, questProgress, currentInventoryFilter, selectedInventoryItem, packCounter, damageNumberRingIdx, cachedNearestRelic, lastNearestRelicAt, pendingLevelUps, lastBiome, lastStatus, lastVisitedBiome, lastConditionsKey, lastHudHpPct, lastHudClockWeatherKey, lastTime, mouseScreenX, mouseScreenY, mouseDown, sleepDebt, dreamTimer, dreamKills, isInDream, nightmareLevel, lastSleepBiome, consecutiveSleeps, awakeningProgress, isStruggling, struggleTimer, wakeAlarmBuff, sandmanSpawned, savedDreamReturnPos, dreamRelics, dreamRelicPickups, dreamStationaryTimer, dreamEssenceTimer, dreamCoins, dreamCoinPickups, dreamShopStock, chickenCoins, chickenCoinPickups, chickenKingSpawned, chickenKingDefeated, chickenDimensionEntered, savedChickenWeapons, lastDamageSource, rawDamageTakenRun, effectiveDamageTakenRun, totalDamageTakenRun, damageBySource, recentHitBuffer, devSpawn, devSpawnNearBorder, devStartBiome, devStartLevel, devGiveWeaponsAt5 };
