import { biomeBoundaryDist, BIOMES, BIOME_TILE_COLORS, BIOME_TEXTURE, WATER_COLOR, getWaterColor, hashRand, smoothstep, lerp, biomeAt, blendedTileColor, waterLevelAt, waterValueAt, setWorldSeed, getWorldSeed } from './world.mjs?v336';
import { ENEMY_SPEED_MULT, ENEMY_TYPES, BIOME_BOSSES, pickBiomeEnemy, createEnemySpawner, isFlyingEnemy, isLargeOrBossEnemy } from './entities.mjs?v336';
import { createDamageHandler } from './combat.mjs?v336';
import { relicForRoll, relicEffectFor, loadRelicJournal, saveRelicJournal, loadEquippedRelics, saveEquippedRelics, NPC_RELICS } from './quests.mjs?v336';

import { CHICKEN_ASSETS, SPECIAL_ITEMS_MAP, rainbowStaffImg, frostStaffImg, EXT_BOSS_DEFS, EXT_BOSSES, monstersNewSheetImg, SPECIAL_ITEMS_SPRITES, specialItemsSheetImg, MATERIAL_DROPS_SPRITES, inventoryDropsSheetImg, SPECIAL_ITEMS_LIST, xpOrbImg, undergroundTilesetImg, undergroundObjectsImg, undergroundChestsImg, undergroundTrapsImg, undergroundCracksFloorImg, undergroundCracksWallsImg, dungeon1MapImg, dungeon1OverheadImg, SPRITE_DEFS, ATLAS, WEAPON_BULLET_SPRITES } from './assets.mjs?v336';
export { CHICKEN_ASSETS, SPECIAL_ITEMS_MAP, EXT_BOSS_DEFS, EXT_BOSSES, SPECIAL_ITEMS_SPRITES, MATERIAL_DROPS_SPRITES, SPECIAL_ITEMS_LIST, WEAPON_BULLET_SPRITES };
import { WEATHER_TYPES, BOSS_DATA, HORDE_EVENTS, RAINBOW_COLORS, WEAPON_DEFS, LEGENDARY_SETS, ALL_LEGENDARY_PIECES, ALL_TRINKETS, CAMP_WEAPONS, CAMP_TOOLS, MATERIALS, CAMP_GEAR, CAMP_COMPANIONS, BIOME_SCENE_FAMILIARS, MOUNTS, MOUNT_KEY_MAP, MOUNT_IMAGES, DAILY_QUEST_POOLS, getDailyDateKey, getDailyResetTimeRemaining, getDailyQuestsForToday, getAllCampQuests, getCampQuest, CAMP_QUESTS, PLAYABLE_CHARACTERS, LORE_ENTRIES, DEFAULT_UNLOCKED_LORE, CAMP_SCENES, NPC_DIALOGUES, COMPANION_RELIC_SKILLS, RUN_UPGRADES, TERRAIN_CONDITION_HINTS, LEFT_FACING_ENEMY_SPRITES, DREAM_RELICS, DREAM_RELICS_MAP } from './config.mjs?v336';
import { MUSIC_TRACKS, musicPlayer, syncMusicTrack, setMusicTrack, updateAudioToggle, unlockAudio, toggleAudio, playSfx, saveAudioVolumes } from './audio.mjs?v336';
import { saveSettings, applySettingsUI, setupSettingsListeners, makeFreshCampSave, loadCampSave, campSave, unlockedClues, unlockedJournals, unlockedSymbols, unlockedStories, LORE_SETS, loadLoreSets, saveLoreSets, unlockLore, createRunProgress, saveCamp, showCampMessage, resetAllGameData, exportSaveData, triggerSaveImport, handleSaveFileSelected } from './save.mjs?v336';
import { state, canvas, ctx, viewZoom, VW, VH, DAY_LENGTH, getDayPhase, getDaylight, getSunX, isNight, weatherParticles, lightnings, unlockedAch, player, camera, keys, enemies, projectiles, xpGems, particles, damageNumbers, playerWeapons, equipment, relicJournal, relicJournalIds, equippedRelicIds, mines, holyPools, chainVisuals, summonedSpirits, voidRifts, meleeSwings, prismBeams, rainbowArcs, krakenEruptions, krakenInkClouds, trinketPickups, legendaryPickups, npcBubbleMap } from './state.mjs?v336';
export { floodBoost, lastCleanup, lastDespawn, worldTime, isBloodMoon, nextBloodMoonCheck, weather, lightningCooldown, lightningFlash, maskOfCalmActive, flood, floodScanTimer, killsByFire, killsByWater, killsAtNight, bossKills, vampireKills, survivedStorm, survivedFlood, inStorm, inFlood, inNight, enemiesFrozenRun, totalHealedHPRun, rangedKillsRun, meleeKillsRun, chestsOpenedRun, survivedBloodMoon, bossIntro, deathSeq, elapsed, kills, paused, gameOver, gameStarted, nextBossTime, spawnedBossBiomes, screenShakeIntensity, hordeEvent, lastHordeSpawnTime, lastSwarmWaveTime, phoenixRevivedThisRun, carriedRelic, relicModifiers, lastQuestText, inventoryOpen, activeNearbyNPC, npcModalOpen, currentInteractingNPC, gamblingInProgress, currentLoreCategory, hasResumableProgress, FOG_REVEAL_RADIUS, fogRevealVersion, lastRevealedTile, lastFogSave, campDialogueTimer, campTab, campRunSettled, companions, potionCount, relicsAtRunStart, questProgress, currentInventoryFilter, selectedInventoryItem, packCounter, damageNumberRingIdx, cachedNearestRelic, lastNearestRelicAt, pendingLevelUps, lastBiome, lastStatus, lastVisitedBiome, lastConditionsKey, lastHudHpPct, lastHudClockWeatherKey, lastTime, mouseScreenX, mouseScreenY, mouseDown, sleepDebt, dreamTimer, dreamKills, isInDream, nightmareLevel, lastSleepBiome, consecutiveSleeps, awakeningProgress, isStruggling, struggleTimer, wakeAlarmBuff, sandmanSpawned, savedDreamReturnPos, dreamRelics, dreamRelicPickups, dreamStationaryTimer, dreamEssenceTimer, dreamCoins, dreamCoinPickups, dreamShopStock } from './state.mjs?v336';
import { revealedTiles, getFogRevealRadius, hasRevealedTile, enemyIsRevealed, enemyCanAggroPlayer, playerCanSeeEnemy, ENEMY_GRID_CELL, enemyGrid, anyRevealedEnemyAlive, enemyGridKey, rebuildEnemyGrid, forEachEnemyNear, findNearestRevealedEnemy, findKNearestRevealedEnemies, hitTest, distToSegmentSq } from './spatial.mjs?v336';
import { drawSprite, iconCanvas, renderAtlasIcons, showDropToast, showMilestoneToast, showRelicToast } from './ui-icons.mjs?v336';
import { TILE, CHUNK_SIZE, CHUNK_PX, CAVE_PAD, CAVE_W, caveCache, generateCaveChunk, getCaveTile, drawUndergroundFloor, drawUndergroundRubble, drawAutotiledWall, getUndergroundWallTile } from './underground.mjs?v336';
import { ACHIEVEMENTS, grantAchievementReward, isTrophyUnlocked, syncTrophiesFromAchievements, checkAchievements, showAchievementPopup, updateAchCount, toggleAchList, getEquippedSetPieces, getActiveSetBonuses, applyEquippedSetBonuses, spawnTrinketDrop, collectTrinket, spawnLegendaryPieceDrop, collectLegendarySetPiece, EQUIPMENT_UPGRADES, spawnDamageNumber, getNearestRelic, formatRelicCountdown, updateCampReturnLock, updateRelicTracker, renderInventory, recomputeRelicModifiers, hasCompanionRelicPower, applyCompanionRelicPowers, applyCompanionRelicImpact, fireCarriedRelicPower, setRelicSlot, collectRelic, bankCarriedRelic, tryCollectRelic, updateRelicPickups, toggleInventory, spawnParticles, spawnSplash } from './relics-achievements.mjs?v336';
import { getSelectedCharacter, applySelectedCharacter, restoreRunProgress, revealAroundPlayer, resolveCampSceneId, setCampScene, initCampSpeechBubbles, showNpcBubble, triggerRandomCampDialogue, triggerCampReaction, scheduleNextCampDialogue, clearCampSpeechBubbles, resetQuestProgress, getStoryStageStatus, getQuestProgress, isQuestComplete, LEVEL_MILESTONES, grantRunUpgrade, applyEquippedTrinkets, resetRunUpgrades, STAT_UPGRADES, addWeapon, addEquipment, tryEvolveWeapons, syncCharacterDisplay, addMaterialDrop, consumeMaterial, getInventoryItems, renderCampInventory, renderCampConditions, isCampUnlocked, renderCampTrophies, renderCamp, getCampItemCost, buyCampItem, handleCampAction, settleCampRun, getActiveMount, toggleMount, useHealingDraught } from './camp.mjs?v336';
import { NPC_ARCHETYPES, grantRandomRelic, createNpcInstance, tryInteractSunkenShrine, tryInteractMountainShrine, tryEnterChickenDimension, tryEnterVoid, tryEnterCave, tryInteractNPC, openNPCModal, renderNPCModalContent, closeNPCModal } from './npcs-portals.mjs?v336';
export { tryEnterChickenDimension };
import { getEnemyCap, getRegularEnemyCount, spawnEnemyAt, startBossIntro, spawnWolfPack, spawnWaterEnemy, spawnBiomeEnemy, spawnVampirePack, spawnBiomeBoss, pickHordeEvent, getHordeDensityMult, spawnRingFormation, spawnVFormation, spawnPincerFormation, spawnWallFormation, spawnSpiralFormation, spawnAmbushFormation, spawnGauntletFormation, spawnBlizzardFormation, spawnTsunamiFormation, spawnHuntFormation, spawnPhalanxFormation, spawnRitualFormation, getActiveRitual, showHordeWarning, showHordeToast, pruneFarRegularEnemies, executeHordeEvent, fastForwardTime, updateSwarmWaves, spawnSwarmWave, updateHordeEvents } from './enemies-spawner.mjs?v336';
import { updateEnemyMovement } from './enemies-movement.mjs?v336';
import { baseDamageEnemy, damageEnemy, updateCampCompanions, getCachedRainbowGradient, drawRainbowArc, drawPrismBeam, updateWeaponFields, drawWeaponField, drawWeaponSwing, drawSummonedSpirit, scaleWeaponStats, fireWeapon } from './weapons-combat.mjs?v336';
import { checkLevelUp, showLevelUp, updateWeaponHUD, openDreamShopModal, updateEquipHUD, updateFieldConditions, getClockLabel, updateHUD, updateWeaponCooldownHUD, showGameOver } from './ui-hud.mjs?v336';
import { tryPlayerDash, startGame, openMenuModal, updateFullscreenButton, returnToCamp, resolvePlayerEnemyCollision, updateAbilities, applyPlayerDamage, tryInteractDreamShop, applyDreamRelicEffects, DUNGEON_MOVEMENT_MODE, getTileSpeedMultiplier, tryGridMove, updateGridMovement, updateFreeMovement, updatePlayerMovement } from './player-movement.mjs?v336';
import { cachedFrameSunX, cachedFrameDaylight, drawShadow, drawTreeShadow, lightingCanvas, lightingCtx, applyDynamicLighting, SPRITE_FLASH_CACHE, getSpriteFlashCanvas, AURA_GLOW_CACHE, drawCachedRadialGlow, drawEntitySprite, drawSubmergedCharacter, drawMountedPlayer, drawPlayer, drawHealthBar, drawCampCompanion, drawEnemy, drawFogOfWar, minimapTerrainCanvas, minimapTerrainCtx, minimapCacheKey, lastMinimapDrawAt, drawMinimap, draw, drawAimReticle, drawPickaxeSwing } from './renderer.mjs?v336';
import { makeLiquidFrames, LIQUIDS, chunks, chunkKey, surfaceWaterLevelAt, clampByte, drawRichLandTile, drawBiomeTexture, drawRichWaterTile, generateChunk, getChunk, getVisibleChunks, tileAtWorld, cleanupChunks, detachBakedDecor, rebakeDecorToChunk, drawLightning, sunImg, moonImg, moonBloodCanvas, prepareBloodMoonCanvas, sunGlowCanvas, moonGlowCanvas, bloodGlowCanvas, initCelestialGlow, drawCelestialBody, cloudsImg, cloudsStormCanvas, cloudsRainCanvas, prepareCloudWeatherCanvases, cloudWindBg, cloudWindFg, updateParallaxClouds, modFloat, drawParallaxClouds, floodTileQueue, floodQueuedTiles, dirtyChunks, scanFloodTiles, updateTileOnChunkCanvas, redrawChunkCanvas, fires, FIRE_MAX, FIRE_SPREAD, FIRE_DPS, FIRE_SPREAD_CHANCE, MAX_ACTIVE_FIRES, FIRE_PARTICLE_RATE, burningTrees, woodPickups, igniteTile, findCampSpawn } from './world-chunks.mjs?v336';


const _propsAtlasImg = new Image();
_propsAtlasImg.src = 'assets/props_atlas.webp';
window.PROPS_ATLAS_IMG = _propsAtlasImg;
window.PROPS_ATLAS_REGIONS = {"CaveObj_256_Dark_totem1":{"sx":2,"sy":2,"sw":256,"sh":256},"CaveObj_256_Dinosaur_skeleton_full":{"sx":260,"sy":2,"sw":256,"sh":256},"CaveObj_256_centipede1":{"sx":518,"sy":2,"sw":256,"sh":256},"CaveObj_256_centipede2":{"sx":776,"sy":2,"sw":256,"sh":256},"CaveObj_256_white_crystal1":{"sx":1034,"sy":2,"sw":256,"sh":256},"Forest_Mega_tree1":{"sx":1292,"sy":2,"sw":256,"sh":256},"Forest_Tree_idol_dragon":{"sx":1550,"sy":2,"sw":256,"sh":256},"Autumn_tree1":{"sx":1808,"sy":2,"sw":128,"sh":128},"Broken_tree7":{"sx":2,"sy":260,"sw":128,"sh":128},"Burned_tree1":{"sx":132,"sy":260,"sw":128,"sh":128},"CaveObj_128_Beige_rpck1":{"sx":262,"sy":260,"sw":128,"sh":128},"CaveObj_128_Building1":{"sx":392,"sy":260,"sw":128,"sh":128},"CaveObj_128_Building2":{"sx":522,"sy":260,"sw":128,"sh":128},"CaveObj_128_Dark_totem2":{"sx":652,"sy":260,"sw":128,"sh":128},"CaveObj_128_Dark_totem3":{"sx":782,"sy":260,"sw":128,"sh":128},"CaveObj_128_Dark_totem4":{"sx":912,"sy":260,"sw":128,"sh":128},"CaveObj_128_Demon_scull":{"sx":1042,"sy":260,"sw":128,"sh":128},"CaveObj_128_Dinosaur_skeleton_part1":{"sx":1172,"sy":260,"sw":128,"sh":128},"CaveObj_128_Dinosaur_skeleton_part2":{"sx":1302,"sy":260,"sw":128,"sh":128},"CaveObj_128_Gates3":{"sx":1432,"sy":260,"sw":128,"sh":128},"CaveObj_128_cocoon_web":{"sx":1562,"sy":260,"sw":128,"sh":128},"CaveObj_128_magic_circle":{"sx":1692,"sy":260,"sw":128,"sh":128},"CaveObj_128_magic_circle2":{"sx":1822,"sy":260,"sw":128,"sh":128},"CaveObj_128_mushroom21":{"sx":2,"sy":390,"sw":128,"sh":128},"CaveObj_128_mushroom31":{"sx":132,"sy":390,"sw":128,"sh":128},"CaveObj_128_mushroom32":{"sx":262,"sy":390,"sw":128,"sh":128},"CaveObj_128_white_crystal2":{"sx":392,"sy":390,"sw":128,"sh":128},"CaveObj_128_white_crystal3":{"sx":522,"sy":390,"sw":128,"sh":128},"CaveObj_128_white_crystal4":{"sx":652,"sy":390,"sw":128,"sh":128},"Christmas_tree1":{"sx":782,"sy":390,"sw":128,"sh":128},"Flower_tree1":{"sx":912,"sy":390,"sw":128,"sh":128},"Forest_Beige_green_mushroom1":{"sx":1042,"sy":390,"sw":128,"sh":128},"Forest_Blue_green_balls_tree1":{"sx":1172,"sy":390,"sw":128,"sh":128},"Forest_Curved_tree1":{"sx":1302,"sy":390,"sw":128,"sh":128},"Forest_Curved_tree2":{"sx":1432,"sy":390,"sw":128,"sh":128},"Forest_Ent_man":{"sx":1562,"sy":390,"sw":128,"sh":128},"Forest_Ent_woman":{"sx":1692,"sy":390,"sw":128,"sh":128},"Forest_Light_balls_tree1":{"sx":1822,"sy":390,"sw":128,"sh":128},"Forest_Light_balls_tree2":{"sx":2,"sy":520,"sw":128,"sh":128},"Forest_Living_gazebo1":{"sx":132,"sy":520,"sw":128,"sh":128},"Forest_Living_gazebo2":{"sx":262,"sy":520,"sw":128,"sh":128},"Forest_Luminous_tree1":{"sx":392,"sy":520,"sw":128,"sh":128},"Forest_Luminous_tree2":{"sx":522,"sy":520,"sw":128,"sh":128},"Forest_Mega_tree2":{"sx":652,"sy":520,"sw":128,"sh":128},"Forest_Swirling_tree1":{"sx":782,"sy":520,"sw":128,"sh":128},"Forest_Swirling_tree2":{"sx":912,"sy":520,"sw":128,"sh":128},"Forest_Tree_idol_deer":{"sx":1042,"sy":520,"sw":128,"sh":128},"Forest_Tree_idol_human":{"sx":1172,"sy":520,"sw":128,"sh":128},"Forest_Tree_idol_wolf":{"sx":1302,"sy":520,"sw":128,"sh":128},"Forest_White_red_mushroom1":{"sx":1432,"sy":520,"sw":128,"sh":128},"Forest_White_tree1":{"sx":1562,"sy":520,"sw":128,"sh":128},"Forest_Willow1":{"sx":1692,"sy":520,"sw":128,"sh":128},"Forest_Willow2":{"sx":1822,"sy":520,"sw":128,"sh":128},"Fruit_tree1":{"sx":2,"sy":650,"sw":128,"sh":128},"Fruit_tree2":{"sx":132,"sy":650,"sw":128,"sh":128},"Moss_tree1":{"sx":262,"sy":650,"sw":128,"sh":128},"Palm_tree1_1":{"sx":392,"sy":650,"sw":128,"sh":128},"Palm_tree2_1":{"sx":522,"sy":650,"sw":128,"sh":128},"Snow_christmass_tree1":{"sx":652,"sy":650,"sw":128,"sh":128},"Snow_tree1":{"sx":782,"sy":650,"sw":128,"sh":128},"Tree1":{"sx":912,"sy":650,"sw":128,"sh":128},"Autumn_tree2":{"sx":1042,"sy":650,"sw":64,"sh":64},"Autumn_tree3":{"sx":1108,"sy":650,"sw":64,"sh":64},"Broken_tree4":{"sx":1174,"sy":650,"sw":64,"sh":64},"Burned_tree2":{"sx":1240,"sy":650,"sw":64,"sh":64},"Burned_tree3":{"sx":1306,"sy":650,"sw":64,"sh":64},"Bush_Autumn_bush1":{"sx":1372,"sy":650,"sw":64,"sh":64},"Bush_Cactus2_1":{"sx":1438,"sy":650,"sw":64,"sh":64},"Bush_Fern1_1":{"sx":1504,"sy":650,"sw":64,"sh":64},"Bush_Fern2_1":{"sx":1570,"sy":650,"sw":64,"sh":64},"Bush_Snow_bush1":{"sx":1636,"sy":650,"sw":64,"sh":64},"Bush_blue_flowers1":{"sx":1702,"sy":650,"sw":64,"sh":64},"Bush_orange_flowers1":{"sx":1768,"sy":650,"sw":64,"sh":64},"Bush_pink_flowers1":{"sx":1834,"sy":650,"sw":64,"sh":64},"Bush_red_flowers1":{"sx":1900,"sy":650,"sw":64,"sh":64},"CaveObj_64_Beige_rpck2":{"sx":1966,"sy":650,"sw":64,"sh":64},"CaveObj_64_Beige_rpck3":{"sx":2,"sy":780,"sw":64,"sh":64},"CaveObj_64_Blue_green_crystal1":{"sx":68,"sy":780,"sw":64,"sh":64},"CaveObj_64_Blue_green_crystal2":{"sx":134,"sy":780,"sw":64,"sh":64},"CaveObj_64_Bonefire":{"sx":200,"sy":780,"sw":64,"sh":64},"CaveObj_64_Dark_totem5":{"sx":266,"sy":780,"sw":64,"sh":64},"CaveObj_64_Dinosaur_skeleton__head":{"sx":332,"sy":780,"sw":64,"sh":64},"CaveObj_64_Dinosaur_skeleton__light":{"sx":398,"sy":780,"sw":64,"sh":64},"CaveObj_64_Gates1":{"sx":464,"sy":780,"sw":64,"sh":64},"CaveObj_64_Gates2":{"sx":530,"sy":780,"sw":64,"sh":64},"CaveObj_64_caveman_statue1":{"sx":596,"sy":780,"sw":64,"sh":64},"CaveObj_64_caveman_statue2":{"sx":662,"sy":780,"sw":64,"sh":64},"CaveObj_64_crystal_blue_green_vertical1":{"sx":728,"sy":780,"sw":64,"sh":64},"CaveObj_64_crystal_blue_green_vertical3":{"sx":794,"sy":780,"sw":64,"sh":64},"CaveObj_64_mushroom11":{"sx":860,"sy":780,"sw":64,"sh":64},"CaveObj_64_mushroom12":{"sx":926,"sy":780,"sw":64,"sh":64},"CaveObj_64_mushroom22":{"sx":992,"sy":780,"sw":64,"sh":64},"CaveObj_64_mushroom23":{"sx":1058,"sy":780,"sw":64,"sh":64},"CaveObj_64_mushroom33":{"sx":1124,"sy":780,"sw":64,"sh":64},"CaveObj_64_mushroom41":{"sx":1190,"sy":780,"sw":64,"sh":64},"CaveObj_64_mushroom42":{"sx":1256,"sy":780,"sw":64,"sh":64},"CaveObj_64_white_crystal1":{"sx":1322,"sy":780,"sw":64,"sh":64},"CaveObj_64_white_crystal2":{"sx":1388,"sy":780,"sw":64,"sh":64},"CaveObj_64_white_crystal_vertical1":{"sx":1454,"sy":780,"sw":64,"sh":64},"CaveObj_64_white_crystal_vertical3":{"sx":1520,"sy":780,"sw":64,"sh":64},"Christmas_tree2":{"sx":1586,"sy":780,"sw":64,"sh":64},"Crystal_Black_crystal1":{"sx":1652,"sy":780,"sw":64,"sh":64},"Crystal_Black_crystal2":{"sx":1718,"sy":780,"sw":64,"sh":64},"Crystal_Blue_crystal1":{"sx":1784,"sy":780,"sw":64,"sh":64},"Crystal_Dark_red_crystal1":{"sx":1850,"sy":780,"sw":64,"sh":64},"Crystal_Dark_red_crystal2":{"sx":1916,"sy":780,"sw":64,"sh":64},"Crystal_Green_crystal1":{"sx":1982,"sy":780,"sw":64,"sh":64},"Crystal_Green_crystal2":{"sx":2,"sy":846,"sw":64,"sh":64},"Crystal_Pink_crystal1":{"sx":68,"sy":846,"sw":64,"sh":64},"Crystal_Pink_crystal2":{"sx":134,"sy":846,"sw":64,"sh":64},"Crystal_Red_crystal1":{"sx":200,"sy":846,"sw":64,"sh":64},"Crystal_Red_crystal2":{"sx":266,"sy":846,"sw":64,"sh":64},"Crystal_Violet_crystal1":{"sx":332,"sy":846,"sw":64,"sh":64},"Crystal_Violet_crystal2":{"sx":398,"sy":846,"sw":64,"sh":64},"Crystal_White_crystal1":{"sx":464,"sy":846,"sw":64,"sh":64},"Crystal_White_crystal2":{"sx":530,"sy":846,"sw":64,"sh":64},"Crystal_Yellow_crystal1":{"sx":596,"sy":846,"sw":64,"sh":64},"Crystal_Yellow_crystal2":{"sx":662,"sy":846,"sw":64,"sh":64},"Crystal_Yellow_green_crystal1":{"sx":728,"sy":846,"sw":64,"sh":64},"Crystal_Yellow_green_crystal2":{"sx":794,"sy":846,"sw":64,"sh":64},"Flower_tree2":{"sx":860,"sy":846,"sw":64,"sh":64},"Flower_tree3":{"sx":926,"sy":846,"sw":64,"sh":64},"Forest_Beige_green_mushroom2":{"sx":992,"sy":846,"sw":64,"sh":64},"Forest_Blue_green_balls_tree2":{"sx":1058,"sy":846,"sw":64,"sh":64},"Forest_Curved_tree3":{"sx":1124,"sy":846,"sw":64,"sh":64},"Forest_Light_balls_tree3":{"sx":1190,"sy":846,"sw":64,"sh":64},"Forest_Luminous_tree3":{"sx":1256,"sy":846,"sw":64,"sh":64},"Forest_Luminous_tree4":{"sx":1322,"sy":846,"sw":64,"sh":64},"Forest_Swirling_tree3":{"sx":1388,"sy":846,"sw":64,"sh":64},"Forest_White_red_mushroom2":{"sx":1454,"sy":846,"sw":64,"sh":64},"Forest_White_red_mushroom3":{"sx":1520,"sy":846,"sw":64,"sh":64},"Forest_White_tree2":{"sx":1586,"sy":846,"sw":64,"sh":64},"Forest_Willow3":{"sx":1652,"sy":846,"sw":64,"sh":64},"Fruit_tree3":{"sx":1718,"sy":846,"sw":64,"sh":64},"Moss_tree2":{"sx":1784,"sy":846,"sw":64,"sh":64},"Moss_tree3":{"sx":1850,"sy":846,"sw":64,"sh":64},"Palm_tree1_2":{"sx":1916,"sy":846,"sw":64,"sh":64},"Palm_tree1_3":{"sx":1982,"sy":846,"sw":64,"sh":64},"Palm_tree2_2":{"sx":2,"sy":912,"sw":64,"sh":64},"Palm_tree2_3":{"sx":68,"sy":912,"sw":64,"sh":64},"Rock1_1":{"sx":134,"sy":912,"sw":64,"sh":64},"Rock1_2":{"sx":200,"sy":912,"sw":64,"sh":64},"Rock2_1":{"sx":266,"sy":912,"sw":64,"sh":64},"Rock2_2":{"sx":332,"sy":912,"sw":64,"sh":64},"Rock3_1":{"sx":398,"sy":912,"sw":64,"sh":64},"Rock3_2":{"sx":464,"sy":912,"sw":64,"sh":64},"Rock4_1":{"sx":530,"sy":912,"sw":64,"sh":64},"Rock4_2":{"sx":596,"sy":912,"sw":64,"sh":64},"Rock5_1":{"sx":662,"sy":912,"sw":64,"sh":64},"Rock5_2":{"sx":728,"sy":912,"sw":64,"sh":64},"Rock6_1":{"sx":794,"sy":912,"sw":64,"sh":64},"Rock6_2":{"sx":860,"sy":912,"sw":64,"sh":64},"Rock7_1":{"sx":926,"sy":912,"sw":64,"sh":64},"Rock7_2":{"sx":992,"sy":912,"sw":64,"sh":64},"Rock8_1":{"sx":1058,"sy":912,"sw":64,"sh":64},"Rock8_2":{"sx":1124,"sy":912,"sw":64,"sh":64},"Rock_Rokc3_snow_shadow_dark1":{"sx":1190,"sy":912,"sw":64,"sh":64},"Rock_Rokc3_snow_shadow_dark2":{"sx":1256,"sy":912,"sw":64,"sh":64},"Snow_christmass_tree2":{"sx":1322,"sy":912,"sw":64,"sh":64},"Snow_tree2":{"sx":1388,"sy":912,"sw":64,"sh":64},"Snow_tree3":{"sx":1454,"sy":912,"sw":64,"sh":64},"Tree2":{"sx":1520,"sy":912,"sw":64,"sh":64},"Tree3":{"sx":1586,"sy":912,"sw":64,"sh":64},"Broken_tree3":{"sx":1652,"sy":912,"sw":48,"sh":48},"Crystal_Blue_crystal2":{"sx":1702,"sy":912,"sw":48,"sh":48},"Broken_tree1":{"sx":1752,"sy":912,"sw":32,"sh":32},"Broken_tree2":{"sx":1786,"sy":912,"sw":32,"sh":32},"Broken_tree5":{"sx":1820,"sy":912,"sw":32,"sh":32},"Bush_Autumn_bush2":{"sx":1854,"sy":912,"sw":32,"sh":32},"Bush_Burned_tree1":{"sx":1888,"sy":912,"sw":32,"sh":32},"Bush_Burned_tree2":{"sx":1922,"sy":912,"sw":32,"sh":32},"Bush_Cactus1_1":{"sx":1956,"sy":912,"sw":32,"sh":32},"Bush_Cactus1_2":{"sx":1990,"sy":912,"sw":32,"sh":32},"Bush_Cactus2_2":{"sx":2,"sy":978,"sw":32,"sh":32},"Bush_Fern1_2":{"sx":36,"sy":978,"sw":32,"sh":32},"Bush_Fern2_2":{"sx":70,"sy":978,"sw":32,"sh":32},"Bush_Snow_bush2":{"sx":104,"sy":978,"sw":32,"sh":32},"Bush_blue_flowers2":{"sx":138,"sy":978,"sw":32,"sh":32},"Bush_orange_flowers2":{"sx":172,"sy":978,"sw":32,"sh":32},"Bush_pink_flowers2":{"sx":206,"sy":978,"sw":32,"sh":32},"Bush_red_flowers2":{"sx":240,"sy":978,"sw":32,"sh":32},"Bush_simple1_1":{"sx":274,"sy":978,"sw":32,"sh":32},"Bush_simple1_2":{"sx":308,"sy":978,"sw":32,"sh":32},"Bush_simple2_1":{"sx":342,"sy":978,"sw":32,"sh":32},"Bush_simple2_2":{"sx":376,"sy":978,"sw":32,"sh":32},"CaveObj_32_Blue_green_crystal3":{"sx":410,"sy":978,"sw":32,"sh":32},"CaveObj_32_Human_skeleton":{"sx":444,"sy":978,"sw":32,"sh":32},"CaveObj_32_crystal_blue_green_vertical2":{"sx":478,"sy":978,"sw":32,"sh":32},"CaveObj_32_crystal_blue_green_vertical4":{"sx":512,"sy":978,"sw":32,"sh":32},"CaveObj_32_mushroom13":{"sx":546,"sy":978,"sw":32,"sh":32},"CaveObj_32_mushroom43":{"sx":580,"sy":978,"sw":32,"sh":32},"CaveObj_32_white_crystal3":{"sx":614,"sy":978,"sw":32,"sh":32},"CaveObj_32_white_crystal_vertical2":{"sx":648,"sy":978,"sw":32,"sh":32},"CaveObj_32_white_crystal_vertical4":{"sx":682,"sy":978,"sw":32,"sh":32},"Christmas_tree3":{"sx":716,"sy":978,"sw":32,"sh":32},"Crystal_Black_crystal3":{"sx":750,"sy":978,"sw":32,"sh":32},"Crystal_Blue_crystal3":{"sx":784,"sy":978,"sw":32,"sh":32},"Crystal_Dark_red_crystal3":{"sx":818,"sy":978,"sw":32,"sh":32},"Crystal_Green_crystal3":{"sx":852,"sy":978,"sw":32,"sh":32},"Crystal_Pink_crystal3":{"sx":886,"sy":978,"sw":32,"sh":32},"Crystal_Red_crystal3":{"sx":920,"sy":978,"sw":32,"sh":32},"Crystal_Violet_crystal3":{"sx":954,"sy":978,"sw":32,"sh":32},"Crystal_White_crystal3":{"sx":988,"sy":978,"sw":32,"sh":32},"Crystal_Yellow_crystal3":{"sx":1022,"sy":978,"sw":32,"sh":32},"Crystal_Yellow_green_crystal3":{"sx":1056,"sy":978,"sw":32,"sh":32},"Forest_Beige_green_mushroom3":{"sx":1090,"sy":978,"sw":32,"sh":32},"Forest_Blue_green_balls_tree3":{"sx":1124,"sy":978,"sw":32,"sh":32},"Forest_Chanterelles1":{"sx":1158,"sy":978,"sw":32,"sh":32},"Forest_Chanterelles2":{"sx":1192,"sy":978,"sw":32,"sh":32},"Forest_Chanterelles3":{"sx":1226,"sy":978,"sw":32,"sh":32},"Rock1_3":{"sx":1260,"sy":978,"sw":32,"sh":32},"Rock1_4":{"sx":1294,"sy":978,"sw":32,"sh":32},"Rock2_3":{"sx":1328,"sy":978,"sw":32,"sh":32},"Rock2_4":{"sx":1362,"sy":978,"sw":32,"sh":32},"Rock3_3":{"sx":1396,"sy":978,"sw":32,"sh":32},"Rock3_4":{"sx":1430,"sy":978,"sw":32,"sh":32},"Rock4_3":{"sx":1464,"sy":978,"sw":32,"sh":32},"Rock4_4":{"sx":1498,"sy":978,"sw":32,"sh":32},"Rock5_3":{"sx":1532,"sy":978,"sw":32,"sh":32},"Rock5_4":{"sx":1566,"sy":978,"sw":32,"sh":32},"Rock6_3":{"sx":1600,"sy":978,"sw":32,"sh":32},"Rock6_4":{"sx":1634,"sy":978,"sw":32,"sh":32},"Rock7_3":{"sx":1668,"sy":978,"sw":32,"sh":32},"Rock7_4":{"sx":1702,"sy":978,"sw":32,"sh":32},"Rock8_3":{"sx":1736,"sy":978,"sw":32,"sh":32},"Rock8_4":{"sx":1770,"sy":978,"sw":32,"sh":32},"Rock_Rokc3_snow_shadow_dark3":{"sx":1804,"sy":978,"sw":32,"sh":32},"Rock_Rokc3_snow_shadow_dark4":{"sx":1838,"sy":978,"sw":32,"sh":32},"Snow_christmass_tree3":{"sx":1872,"sy":978,"sw":32,"sh":32},"Broken_tree6":{"sx":1906,"sy":978,"sw":16,"sh":16},"Bush_Autumn_bush3":{"sx":1924,"sy":978,"sw":16,"sh":16},"Bush_Broken_tree1":{"sx":1942,"sy":978,"sw":16,"sh":16},"Bush_Broken_tree2":{"sx":1960,"sy":978,"sw":16,"sh":16},"Bush_Cactus1_3":{"sx":1978,"sy":978,"sw":16,"sh":16},"Bush_Cactus2_3":{"sx":1996,"sy":978,"sw":16,"sh":16},"Bush_Fern1_3":{"sx":2014,"sy":978,"sw":16,"sh":16},"Bush_Fern2_3":{"sx":2,"sy":1012,"sw":16,"sh":16},"Bush_Snow_bush3":{"sx":20,"sy":1012,"sw":16,"sh":16},"Bush_blue_flowers3":{"sx":38,"sy":1012,"sw":16,"sh":16},"Bush_orange_flowers3":{"sx":56,"sy":1012,"sw":16,"sh":16},"Bush_pink_flowers3":{"sx":74,"sy":1012,"sw":16,"sh":16},"Bush_red_flowers3":{"sx":92,"sy":1012,"sw":16,"sh":16},"Bush_simple1_3":{"sx":110,"sy":1012,"sw":16,"sh":16},"Bush_simple2_3":{"sx":128,"sy":1012,"sw":16,"sh":16},"CaveObj_16_Blue_green_crystal4":{"sx":146,"sy":1012,"sw":16,"sh":16},"CaveObj_16_white_crystal4":{"sx":164,"sy":1012,"sw":16,"sh":16},"Crystal_Black_crystal4":{"sx":182,"sy":1012,"sw":16,"sh":16},"Crystal_Blue_crystal":{"sx":200,"sy":1012,"sw":16,"sh":16},"Crystal_Dark_red_crystal4":{"sx":218,"sy":1012,"sw":16,"sh":16},"Crystal_Green_crystal4":{"sx":236,"sy":1012,"sw":16,"sh":16},"Crystal_Pink_crystal4":{"sx":254,"sy":1012,"sw":16,"sh":16},"Crystal_Red_crystal4":{"sx":272,"sy":1012,"sw":16,"sh":16},"Crystal_Violet_crystal4":{"sx":290,"sy":1012,"sw":16,"sh":16},"Crystal_White_crystal4":{"sx":308,"sy":1012,"sw":16,"sh":16},"Crystal_Yellow_crystal4":{"sx":326,"sy":1012,"sw":16,"sh":16},"Crystal_Yellow_green_crystal4":{"sx":344,"sy":1012,"sw":16,"sh":16},"Rock1_5":{"sx":362,"sy":1012,"sw":16,"sh":16},"Rock2_5":{"sx":380,"sy":1012,"sw":16,"sh":16},"Rock3_5":{"sx":398,"sy":1012,"sw":16,"sh":16},"Rock4_5":{"sx":416,"sy":1012,"sw":16,"sh":16},"Rock5_5":{"sx":434,"sy":1012,"sw":16,"sh":16},"Rock6_5":{"sx":452,"sy":1012,"sw":16,"sh":16},"Rock7_5":{"sx":470,"sy":1012,"sw":16,"sh":16},"Rock8_5":{"sx":488,"sy":1012,"sw":16,"sh":16},"Rock_Rokc3_snow_shadow_dark5":{"sx":506,"sy":1012,"sw":16,"sh":16}};
function rebuildExtTreesAtlas() {
  if (!window.TREE_DIMS || !window.EXT_TREES) return;
  if (window.PROPS_ATLAS_IMG && window.PROPS_ATLAS_REGIONS) {
    if (!window.PROPS_ATLAS_IMG.complete || window.PROPS_ATLAS_IMG.naturalWidth <= 0) return;
    const regions = { ...window.PROPS_ATLAS_REGIONS };
    const extraEntries = [];
    for (const [name, dims] of Object.entries(window.TREE_DIMS)) {
      if (dims.sheetImg || regions[name]) continue;
      const img = window.EXT_TREES[name];
      if (img && img.complete && img.naturalWidth > 0) {
        extraEntries.push({ name, img, w: img.naturalWidth, h: img.naturalHeight });
      }
    }
    const baseW = window.PROPS_ATLAS_IMG.naturalWidth;
    const baseH = window.PROPS_ATLAS_IMG.naturalHeight;
    if (extraEntries.length === 0) {
      window.EXT_TREES_ATLAS = { canvas: window.PROPS_ATLAS_IMG, regions };
      return;
    }
    let curX = 2, curY = baseH + 2, rowH = 0;
    const placements = [];
    for (const e of extraEntries) {
      if (curX + e.w + 2 > Math.max(baseW, 2048)) { curX = 2; curY += rowH + 2; rowH = 0; }
      placements.push({ name: e.name, img: e.img, sx: curX, sy: curY, sw: e.w, sh: e.h });
      curX += e.w + 2;
      if (e.h > rowH) rowH = e.h;
    }
    const c = (window.EXT_TREES_ATLAS && window.EXT_TREES_ATLAS.canvas instanceof HTMLCanvasElement) ? window.EXT_TREES_ATLAS.canvas : document.createElement('canvas');
    c.width = Math.max(baseW, 2048);
    c.height = Math.max(baseH, curY + rowH + 2);
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(window.PROPS_ATLAS_IMG, 0, 0);
    for (const p of placements) {
      cx.drawImage(p.img, p.sx, p.sy);
      regions[p.name] = { sx: p.sx, sy: p.sy, sw: p.sw, sh: p.sh };
    }
    window.EXT_TREES_ATLAS = { canvas: c, regions };
    return;
  }
  const entries = [];
  for (const [name, dims] of Object.entries(window.TREE_DIMS)) {
    if (dims.sheetImg) continue;
    const img = window.EXT_TREES[name];
    if (img && img.complete && img.naturalWidth > 0) {
      entries.push({ name, img, w: img.naturalWidth, h: img.naturalHeight });
    }
  }
  if (entries.length === 0) return;
  entries.sort((a, b) => b.h - a.h || b.w - a.w);
  const atlasW = 2048;
  const pad = 2;
  let curX = pad, curY = pad, rowH = 0;
  const placements = [];
  for (const e of entries) {
    if (curX + e.w + pad > atlasW) {
      curX = pad;
      curY += rowH + pad;
      rowH = 0;
    }
    placements.push({ name: e.name, img: e.img, sx: curX, sy: curY, sw: e.w, sh: e.h });
    curX += e.w + pad;
    if (e.h > rowH) rowH = e.h;
  }
  const atlasH = Math.max(64, curY + rowH + pad);
  const c = (window.EXT_TREES_ATLAS && window.EXT_TREES_ATLAS.canvas) || document.createElement('canvas');
  c.width = atlasW;
  c.height = atlasH;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  const regions = {};
  for (const p of placements) {
    cx.drawImage(p.img, p.sx, p.sy);
    regions[p.name] = { sx: p.sx, sy: p.sy, sw: p.sw, sh: p.sh };
  }
  window.EXT_TREES_ATLAS = { canvas: c, regions };
}

let _extTreeChunkRefreshTimer = null;
const scheduleExtTreeChunkRefresh = () => {
  if (_extTreeChunkRefreshTimer) return;
  _extTreeChunkRefreshTimer = setTimeout(() => {
    _extTreeChunkRefreshTimer = null;
    rebuildExtTreesAtlas();
    if (typeof window !== 'undefined' && window.activeInteractiveDecors) window.activeInteractiveDecors.length = 0;
    if (typeof chunks !== 'undefined' && chunks.clear) chunks.clear();
  }, 120);
};
if (window.PROPS_ATLAS_IMG && !window.PROPS_ATLAS_IMG.complete) {
  window.PROPS_ATLAS_IMG.addEventListener('load', scheduleExtTreeChunkRefresh, { once: true });
}
for (const [name, dims] of Object.entries(window.TREE_DIMS)) {
  if (dims.sheetImg) {
    window.EXT_TREES[name] = dims.sheetImg;
    if (!dims.sheetImg.complete) {
      dims.sheetImg.addEventListener('load', scheduleExtTreeChunkRefresh, { once: true });
    }
    continue;
  }
  if (window.PROPS_ATLAS_IMG && window.PROPS_ATLAS_REGIONS?.[name]) {
    window.EXT_TREES[name] = window.PROPS_ATLAS_IMG;
    continue;
  }
  const img = new Image();
  img.onload = scheduleExtTreeChunkRefresh;
  img.src = dims.path || ('assets/Trees/PNG/Assets_separately/Trees/' + name + '.webp');
  window.EXT_TREES[name] = img;
}

dungeon1MapImg.onload = () => {
  if (typeof chunks !== 'undefined' && chunks.clear) {
    chunks.clear();
  }
};
if (CHICKEN_ASSETS && CHICKEN_ASSETS.tiles) {
  for (const tImg of Object.values(CHICKEN_ASSETS.tiles)) {
    if (tImg && !tImg.complete) {
      tImg.addEventListener('load', scheduleExtTreeChunkRefresh, { once: true });
    }
  }
}






// -------------------------------------------------------------------------
// WATER FRAMES (Transparent pixel-art animated wave & shimmer overlays)
// -------------------------------------------------------------------------


// ═══════════════════════════════════════════════════════════
// WORLD WATER STATE
// ═══════════════════════════════════════════════════════════
// Flood shifts water threshold up temporarily

// ═══════════════════════════════════════════════════════════
// TIME / WEATHER / MOON
// ═══════════════════════════════════════════════════════════
function checkBloodMoon(){
  if(!isNight()){if(isBloodMoon)isBloodMoon=false;return;}
  if(worldTime>=nextBloodMoonCheck){
    if(isBloodMoon) survivedBloodMoon = true;
    nextBloodMoonCheck=worldTime+DAY_LENGTH;
    isBloodMoon=Math.random()<0.14;
  }
}

function updateWeather(dt){
  weather.timer-=dt;
  if(weather.timer<=0){
    const r=Math.random();
    if(weather.type==='clear'){
      const roll=r;
      weather.type=roll<0.16?'rain':roll<0.26?'snow':roll<0.35?'storm':'clear';
      weather.timer=weather.type==='clear'?(90+Math.random()*60):(16+Math.random()*12);
    }else{
      weather.type='clear';
      weather.timer=110+Math.random()*80;
    }
    if(weather.type==='rain'&&Math.random()<0.15)weather.type='storm';
  }
}
function updateWeatherParticles(dt){
  const isAbyss = (player.x > 700000*TILE && player.x < 900000*TILE && player.y > 700000*TILE && player.y < 900000*TILE);
  const isUnder = (player.x > 100000*TILE && player.x < 300000*TILE && player.y > 100000*TILE && player.y < 300000*TILE);
  if (isAbyss || isUnder || state.isInDream) {
    if (weatherParticles.length > 0) weatherParticles.length = 0;
    return;
  }
  const target=weather.type==='clear'?0:weather.type==='rain'||weather.type==='storm'?180:110;
  while(weatherParticles.length<target)weatherParticles.push({
    x:Math.random()*VW(),y:-10-Math.random()*VH(),
    vy:(weather.type==='rain'||weather.type==='storm')?900+Math.random()*400:120+Math.random()*80,
    vx:(weather.type==='rain'||weather.type==='storm')?-140:(Math.random()-.5)*40,
    len:12+Math.random()*10,size:2+Math.random()*2,wobble:Math.random()*Math.PI*2
  });
  while(weatherParticles.length>target)weatherParticles.pop();
  for(const p of weatherParticles){
    p.wobble+=dt*4;
    p.x+=(p.vx+Math.sin(p.wobble)*20)*dt;
    p.y+=p.vy*dt;
    if(p.y>VH()+20){p.y=-20;p.x=Math.random()*VW();}
    if(p.x<-20)p.x=VW()+20;
    if(p.x>VW()+20)p.x=-20;
  }
}

// ═══════════════════════════════════════════════════════════
// LIGHTNING
// ═══════════════════════════════════════════════════════════
function triggerLightning(){
  const angle=Math.random()*Math.PI*2;
  const dist=80+Math.random()*Math.min(500,Math.max(VW(),VH())*0.5);
  const x=player.x+player.w/2+Math.cos(angle)*dist;
  const y=player.y+player.h/2+Math.sin(angle)*dist;
  // Build zigzag segments
  const segs=[{x,y:y-450}];
  let cx=x,cy=y-450;
  for(let i=0;i<6;i++){
    cx+=(Math.random()-.5)*55;
    cy+=(450/6)*(0.7+Math.random()*0.6);
    segs.push({x:cx,y:cy});
  }
  segs.push({x,y});
  lightnings.push({segs,life:.35,maxLife:.35,x,y});
  // Damage enemies in radius
  for(const e of enemies){
    if(enemyIsRevealed(e)&&Math.hypot(e.x-x,e.y-y)<70){e.hp-=55;e.hitFlash=.15;spawnDamageNumber(e.x,e.y-e.h/2,55,'#87ceeb');if(Math.random()<.6&&tileAtWorld(Math.floor(e.x/TILE),Math.floor(e.y/TILE))===0)igniteTile(Math.floor(e.x/TILE),Math.floor(e.y/TILE));}
  }
  // Damage player
  if(Math.hypot(player.x+player.w/2-x,player.y+player.h/2-y)<70){
    const dmg = 35;
    // Shield Bubble check for lightning damage
    applyPlayerDamage(dmg, 'weather_lightning', '#87ceeb', { rawDmg: dmg });
    player.invulnTimer=.4;
  }
  // Ignite
  const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);
  if(tileAtWorld(tx,ty)===0)igniteTile(tx,ty);
  // Flash
  lightningFlash={life:.15};
}
function updateLightning(dt){
  if(lightningFlash.life>0)lightningFlash.life-=dt;
  const isAbyss = (player.x > 700000*TILE && player.x < 900000*TILE && player.y > 700000*TILE && player.y < 900000*TILE);
  const isUnder = (player.x > 100000*TILE && player.x < 300000*TILE && player.y > 100000*TILE && player.y < 300000*TILE);
  if (isAbyss || isUnder || state.isInDream) {
    if (lightnings.length > 0) lightnings.length = 0;
    return;
  }
  if(weather.type==='storm'){
    lightningCooldown-=dt;
    if(lightningCooldown<=0){
      lightningCooldown=1.5+Math.random()*3.5;
      triggerLightning();
    }
  }
  for(let i=lightnings.length-1;i>=0;i--){
    lightnings[i].life-=dt;
    if(lightnings[i].life<=0)lightnings.splice(i,1);
  }
}

// ═══════════════════════════════════════════════════════════
// MASK OF CALM (PEACEFUL UNIQUE ARTIFACT)
// ═══════════════════════════════════════════════════════════


function triggerFlood(duration = 60){
  const isAbyss = (player.x > 700000*TILE && player.x < 900000*TILE && player.y > 700000*TILE && player.y < 900000*TILE);
  if (isAbyss || state.isInDream) return false;
  flood.active = true;
  flood.timer = duration;
  flood.nextFlood = duration + 180;
  scanFloodTiles();
  return true;
}
window.triggerFlood = triggerFlood;

function updateFlood(dt){
  const isAbyss = (player.x > 700000*TILE && player.x < 900000*TILE && player.y > 700000*TILE && player.y < 900000*TILE);
  if (isAbyss || state.isInDream) return;
  if(!flood.active){
    flood.nextFlood-=dt;
    if(flood.nextFlood<=0&&(weather.type==='rain'||weather.type==='storm')){
      flood.active=true;flood.timer=18;flood.nextFlood=240+Math.random()*120;
    }
  }else{
    flood.timer-=dt;
    // Ramp up over first 3s
    const target=0.32;
    flood.level+=(target-flood.level)*Math.min(1,dt*1.5);
    floodBoost=flood.level;
    // Damage player if standing in newly flooded area
    const wx=Math.floor((player.x+player.w/2)/TILE),wy=Math.floor((player.y+player.h/2)/TILE);
    const wl=tileAtWorld(wx,wy);
    if(!maskOfCalmActive&&wl>0&&Math.random()<0.5*dt&&!campSave.ownedGear.includes('boots')){
      const dmg = 2;
      // Shield Bubble check for flood damage
      applyPlayerDamage(dmg, 'weather_flood', '#4fc3f7', { rawDmg: dmg });
    }
    // Scan for tiles that need flood updates periodically or when queue is empty
    floodScanTimer-=dt;
    if(floodScanTimer<=0||floodTileQueue.length===0){
      floodScanTimer=0.25;
      scanFloodTiles();
    }
    if(flood.timer<=0){
      flood.active=false;floodBoost=0;flood.level=0;
      // Scan to drain all flooded tiles back to normal
      scanFloodTiles();
    }
  }

  // ── Time-Slicing: Process 10-20 tiles per frame from queue ──
  const TILES_PER_FRAME=16;
  let processed=0;
  while(floodTileQueue.length>0&&processed<TILES_PER_FRAME){
    const item=floodTileQueue.shift();
    floodQueuedTiles.delete(`${item.wx},${item.wy}`);

    const ch=item.ch;
    if(!chunks.has(chunkKey(ch.cx,ch.cy))) continue;

    const currentTargetWl=(item.bn==='snow'||item.bn==='dwarfCity'||(item.wx>100000&&item.wx<300000))?0:waterLevelAt(item.wx,item.wy,floodBoost);
    const oldWl=ch.tiles[item.ty*CHUNK_SIZE+item.tx];
    if(oldWl!==currentTargetWl){
      ch.tiles[item.ty*CHUNK_SIZE+item.tx]=currentTargetWl;

      // Update waterTiles array for Layer 2 water animation
      if(currentTargetWl>0){
        const wt=ch.waterTiles.find(w=>w.tx===item.tx&&w.ty===item.ty);
        if(wt){
          wt.level=currentTargetWl;
        }else{
          ch.waterTiles.push({tx:item.tx,ty:item.ty,level:currentTargetWl,biome:item.bn});
        }
      }else{
        const wtIdx=ch.waterTiles.findIndex(w=>w.tx===item.tx&&w.ty===item.ty);
        if(wtIdx>=0) ch.waterTiles.splice(wtIdx,1);
      }

      // Update tile on chunk canvas immediately
      updateTileOnChunkCanvas(ch,item.tx,item.ty,item.wx,item.wy,currentTargetWl,item.bn);

      // Mark chunk as dirty for full pass / edge extrusion
      ch.dirty=true;
      dirtyChunks.add(ch);
    }
    processed++;
  }

  // ── Dirty chunk redraw: at most 1 chunk per frame ──
  if(dirtyChunks.size>0){
    const ch=dirtyChunks.values().next().value;
    dirtyChunks.delete(ch);
    if(ch&&chunks.has(chunkKey(ch.cx,ch.cy))){
      redrawChunkCanvas(ch);
      ch.dirty=false;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// FIRE + BURNING TREES
// ═══════════════════════════════════════════════════════════
function updateFires(dt){
  // ═══ FIRE TILES — lifecycle + spread ═══
  const firesToDelete=[];
  for(const[key,f]of fires){
    f.life-=dt;
    f.spreadTimer-=dt;
    if(f.spreadTimer<=0){
      f.spreadTimer=FIRE_SPREAD;
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
        if(Math.random()<FIRE_SPREAD_CHANCE)igniteTile(f.wx+dx,f.wy+dy);
      }
    }
    if(Math.random()<FIRE_PARTICLE_RATE)particles.push({
      x:f.wx*TILE+Math.random()*TILE,y:f.wy*TILE+Math.random()*TILE,
      vx:(Math.random()-.5)*15,vy:-30-Math.random()*40,
      life:.5,maxLife:.5,color:Math.random()<.5?'#ff9800':'#ffeb3b'
    });
    if(f.life<=0)firesToDelete.push(key);
  }
  for(const k of firesToDelete)fires.delete(k);

  // ═══ DAMAGE — single pass over enemies stepping on fire tiles ═══
  if(fires.size>0 && !maskOfCalmActive){
    for(const e of enemies){
      if(e.hp<=0)continue;
      const etx=Math.floor(e.x/TILE);
      const ety=Math.floor(e.y/TILE);
      const onFire = fires.has(etx+','+ety) ||
                     fires.has(Math.floor((e.x - (e.w||20)*0.25)/TILE)+','+Math.floor(e.y/TILE)) ||
                     fires.has(Math.floor((e.x + (e.w||20)*0.25)/TILE)+','+Math.floor(e.y/TILE));

      if(onFire){
        e.fireBurnTimer = (e.fireBurnTimer || 0) - dt;
        if(e.fireBurnTimer <= 0){
          e.fireBurnTimer = 0.25;
          const burnDmg = 4;
          e.hp -= burnDmg;
          e.hitFlash = 0.08;
          spawnDamageNumber(e.x, e.y - (e.h || 24)/2, burnDmg, '#ff7043');
          if(e.hp<=0 && !e._fireKill){
            e._fireKill = true;
            killsByFire++;
            questProgress.fireKills = killsByFire;
          }
        }
      }
    }
  }
  const ptx=Math.floor((player.x+player.w/2)/TILE);
  const pty=Math.floor((player.y+player.h/2)/TILE);
  if(fires.has(ptx+','+pty)){
    player.fireBurnTimer = (player.fireBurnTimer || 0) - dt;
    if(player.fireBurnTimer <= 0){
      player.fireBurnTimer = 0.5;
      const burnDmg = 4;
      applyPlayerDamage(burnDmg, 'fire_tile', '#ff9800', { rawDmg: burnDmg });
    }
  } else {
    player.fireBurnTimer = 0;
  }

  // ═══ BURNING TREES ═══
  const treesToDelete=[];
  for(const[key,t]of burningTrees){
    t.life-=dt;
    if(Math.random()<.2)particles.push({
      x:t.x+(Math.random()-.5)*20,y:t.y-20-Math.random()*30,
      vx:(Math.random()-.5)*20,vy:-40-Math.random()*30,
      life:.5,maxLife:.5,color:Math.random()<.5?'#ff9800':'#e53935'
    });
    for(const e of enemies){
      const dx=e.x-t.x,dy=e.y-t.y;
      if(enemyIsRevealed(e)&&dx*dx+dy*dy<1600)e.hp-=8*dt;
    }
    if(t.life<=0){
      for(let i=0;i<2;i++){
        woodPickups.push({
          x:t.x+(Math.random()-.5)*20,y:t.y+(Math.random()-.5)*15,
          vx:(Math.random()-.5)*30,vy:-30-Math.random()*30,
          bob:Math.random()*Math.PI*2,life:30
        });
      }
      spawnParticles(t.x,t.y-10,'#ff9800',12);
      treesToDelete.push(key);
    }
  }
  for(const k of treesToDelete)burningTrees.delete(k);

  // ═══ LEGENDARY SET PICKUPS ═══
  for(let i=legendaryPickups.length-1;i>=0;i--){
    const l=legendaryPickups[i];
    l.life-=dt;l.bob+=dt*4;
    const dx=(player.x+player.w/2)-l.x,dy=(player.y+player.h/2)-l.y;
    const d2=dx*dx+dy*dy;
    const pr=player.pickupRange+relicModifiers.pickupRange+40;
    if(d2<pr*pr){
      const d=Math.sqrt(d2)||1;
      l.x+=dx/d*12*dt*60;l.y+=dy/d*12*dt*60;
      if(d<30){
        collectLegendarySetPiece(l.piece);
        legendaryPickups.splice(i,1);
        continue;
      }
    }
    if(l.life<=0)legendaryPickups.splice(i,1);
  }
  
  //  TRINKET PICKUPS 
  for(let i=trinketPickups.length-1;i>=0;i--){
    const l=trinketPickups[i];
    l.bob+=dt*4;
    const dx=(player.x+player.w/2)-l.x,dy=(player.y+player.h/2)-l.y;
    const d2=dx*dx+dy*dy;
    const pr=player.pickupRange+relicModifiers.pickupRange+40;
    if(d2<pr*pr){
      const d=Math.sqrt(d2)||1;
      l.x+=dx/d*12*dt*60;l.y+=dy/d*12*dt*60;
      if(d<30){
        collectTrinket(l);
        trinketPickups.splice(i,1);
        continue;
      }
    }
  }

  // ═══ WOOD PICKUPS ═══
  for(let i=woodPickups.length-1;i>=0;i--){
    const w=woodPickups[i];
    w.life-=dt;w.bob+=dt*4;
    w.vy+=200*dt;w.x+=w.vx*dt;w.y+=w.vy*dt;
    w.vx*=.95;
    const dx=(player.x+player.w/2)-w.x,dy=(player.y+player.h/2)-w.y;
    const d2=dx*dx+dy*dy;
    const pr=player.pickupRange+relicModifiers.pickupRange;
    if(d2<pr*pr){
      const d=Math.sqrt(d2)||1;
      w.x+=dx/d*10*dt*60;w.y+=dy/d*10*dt*60;
      if(d<25){
        const seleneBonus=companions.some(c=>c.id==='selene')?1.10:1;
        player.xp+=3*seleneBonus;player.hp=Math.min(player.maxHp,player.hp+5);
        spawnDamageNumber(w.x,w.y,'+5 HP','#4CAF50');
        checkLevelUp();
        woodPickups.splice(i,1);continue;
      }
    }
    if(w.life<=0)woodPickups.splice(i,1);
  }

  // ═══ CHICKEN DIMENSION BUFF TIMERS & PICKUPS ═══
  if(player.secondWindTimer > 0) player.secondWindTimer = Math.max(0, player.secondWindTimer - dt);
  if(player.chickenLegTimer > 0) player.chickenLegTimer = Math.max(0, player.chickenLegTimer - dt);
  if(player.goldenFeatherTimer > 0) player.goldenFeatherTimer = Math.max(0, player.goldenFeatherTimer - dt);
  if(state.chickenPickups && state.chickenPickups.length > 0){
    for(let i = state.chickenPickups.length - 1; i >= 0; i--){
      const cp = state.chickenPickups[i];
      cp.life -= dt;
      cp.bob = (cp.bob || 0) + dt * 4.5;
      const dx = (player.x + player.w / 2) - cp.x, dy = (player.y + player.h / 2) - cp.y;
      const d2 = dx * dx + dy * dy;
      const pr = Number.isFinite(player.pickupRange + relicModifiers.pickupRange + 36) ? Math.max(0, player.pickupRange + relicModifiers.pickupRange + 36) : 64;
      if(d2 < pr * pr){
        const d = Math.sqrt(d2) || 1;
        cp.x += (dx / d) * 11 * dt * 60;
        cp.y += (dy / d) * 11 * dt * 60;
        if(d < 28){
          if(cp.type === 'chickenLeg'){
            const wasActive = player.chickenLegTimer > 7.5;
            player.chickenLegTimer = 10.0;
            playSfx('pickup');
            spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ffb74d', 8);
            if (!wasActive) spawnDamageNumber(player.x + player.w/2, player.y - 20, '+50% SPEED (10s)!', '#ffb74d');
            showDropToast('🍗 Chicken Leg! +50% Move Speed for 10s!', '#ffb74d', 'chickenLeg');
          } else if(cp.type === 'goldenFeather'){
            const wasActive = player.goldenFeatherTimer > 12.5;
            player.goldenFeatherTimer = 15.0;
            playSfx('pickup');
            spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ffd700', 8);
            if (!wasActive) spawnDamageNumber(player.x + player.w/2, player.y - 20, '+20% DAMAGE (15s)!', '#ffd700');
            showDropToast('🪶 Golden Feather! +20% Damage for 15s!', '#ffd700', 'goldenFeather');
          } else if(cp.type === 'eggBomb'){
            playSfx('explosion');
            screenShakeIntensity = Math.max(screenShakeIntensity, 6);
            spawnParticles(cp.x, cp.y, '#ff7043', 20);
            forEachEnemyNear(cp.x, cp.y, 160, ne => {
              if(ne.hp > 0 && (ne.x - cp.x)**2 + (ne.y - cp.y)**2 <= 160 * 160){
                damageEnemy(ne, 50, { noProc: true });
              }
            });
            showDropToast('💣 Egg Bomb detonated for 50 AoE damage!', '#ff7043', 'eggBomb');
          }
          state.chickenPickups.splice(i, 1);
          continue;
        }
      }
      if(cp.life <= 0) state.chickenPickups.splice(i, 1);
    }
  }

  // ═══ CHICKEN COIN PICKUPS (Custom Economy in Chicken Dimension) ═══
  if(state.chickenCoinPickups && state.chickenCoinPickups.length > 0){
    const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
    const pr = player.pickupRange + relicModifiers.pickupRange + 42;
    const pr2 = pr * pr;
    for(let i = state.chickenCoinPickups.length - 1; i >= 0; i--){
      const cc = state.chickenCoinPickups[i];
      if(!cc){ state.chickenCoinPickups.splice(i, 1); continue; }
      cc.life -= dt;
      cc.bob = (cc.bob || 0) + dt * 4.5;
      const dx = pcx - cc.x, dy = pcy - cc.y;
      const d2 = dx * dx + dy * dy;
      if(Number.isFinite(d2) && d2 < pr2){
        const d = Math.sqrt(d2) || 1;
        cc.x += (dx / d) * 12 * dt * 60;
        cc.y += (dy / d) * 12 * dt * 60;
        if(d < 28){
          const val = cc.value || 50;
          state.chickenCoins = (state.chickenCoins || 0) + val;
          campSave.chickenCoins = state.chickenCoins;
          saveCamp();
          playSfx('pickup');
          spawnParticles(pcx, pcy, '#ffd700', 4);
          state.chickenCoinPickups.splice(i, 1);
          if(state.chickenCoins >= 100000 && !state.chickenKingSpawned && !state.chickenKingDefeated && !enemies.some(e => e.hp > 0 && e.type === 'chickenKing')){
            state.chickenKingSpawned = true;
            spawnEnemyAt(player.x + 280, player.y - 120, 'chickenKing');
            showDropToast('👑 100,000 Chicken Coins collected! The Chicken King has awakened!', '#ffd700', 'chickenKingCrown');
          }
          continue;
        }
      }
      if(cc.life <= 0) state.chickenCoinPickups.splice(i, 1);
    }
  }

  // ═══ CONSUMABLE FOOD PICKUPS (Grilled Fish +20, Heart Steak +45, Roasted Ham +85) ═══
  if(state.foodPickups && state.foodPickups.length > 0){
    const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
    const pr = Number.isFinite(player.pickupRange + relicModifiers.pickupRange + 36) ? Math.max(0, player.pickupRange + relicModifiers.pickupRange + 36) : 64;
    const pr2 = pr * pr;
    for(let i = state.foodPickups.length - 1; i >= 0; i--){
      const fp = state.foodPickups[i];
      if(!fp || !Number.isFinite(fp.x) || !Number.isFinite(fp.y)){ state.foodPickups.splice(i, 1); continue; }
      fp.life -= dt;
      fp.bob = (Number.isFinite(fp.bob) ? fp.bob : 0) + dt * 4.5;
      const dx = pcx - fp.x, dy = pcy - fp.y;
      const d2 = dx * dx + dy * dy;
      if(Number.isFinite(d2) && d2 < pr2){
        const d = Math.sqrt(d2) || 1;
        fp.x += (dx / d) * 12 * dt * 60;
        fp.y += (dy / d) * 12 * dt * 60;
        if(d < 26){
          const healAmount = fp.hp || 20;
          const actualHeal = Math.min(healAmount, player.maxHp - player.hp);
          player.hp = Math.min(player.maxHp, player.hp + healAmount);
          totalHealedHPRun = (totalHealedHPRun || 0) + actualHeal;
          spawnDamageNumber(player.x + player.w / 2, player.y - 25, '+' + healAmount + ' HP', '#00e676');
          spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#69f0ae', 8);
          playSfx('pickup');
          state.foodPickups.splice(i, 1);
          continue;
        }
      }
      if(fp.life <= 0) state.foodPickups.splice(i, 1);
    }
  }

  // ═══ WELL OF LIFE HEALING AURA (Demo Landmark Replaces Caves) ═══
  if(window.activeLifeWells && window.activeLifeWells.length > 0){
    const px = player.x + player.w / 2, py = player.y + player.h / 2;
    for(const well of window.activeLifeWells){
      const wx = well.x, wy = well.y - 20;
      const distSq = (px - wx) ** 2 + (py - wy) ** 2;
      if(distSq < 85 * 85){
        well.playerNear = true;
        well.healTimer = (well.healTimer || 0) + dt;
        if(Math.random() < dt * 14){
          spawnParticles(wx + (Math.random() - 0.5) * 36, wy + (Math.random() - 0.5) * 18, '#64ffda', 1);
        }
        if(well.healTimer >= 0.5){
          well.healTimer = 0;
          if(player.hp < player.maxHp){
            const healTick = Math.max(1, Math.round(player.maxHp * 0.05));
            const actualTick = Math.min(healTick, player.maxHp - player.hp);
            player.hp = Math.min(player.maxHp, player.hp + healTick);
            totalHealedHPRun = (totalHealedHPRun || 0) + actualTick;
            spawnDamageNumber(player.x + player.w / 2, player.y - 25, '+' + actualTick + ' HP', '#64ffda');
            spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#64ffda', 6);
            playSfx('pickup');
          }
        }
      } else {
        well.playerNear = false;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// BOSS INTRO
// ═══════════════════════════════════════════════════════════

let _decorTouchFrame = 0;
let _prevDecorPx = null;
function updatePlayerDecorInteraction(dt, activeMount) {
  if (typeof window === 'undefined') return;
  const activeList = window.activeInteractiveDecors || (window.activeInteractiveDecors = []);
  _decorTouchFrame++;
  const fx = player.x + player.w * 0.5;
  const fy = player.y + player.h - 3;
  const moveDx = _prevDecorPx === null ? (player.facing || 1) : (fx - _prevDecorPx);
  _prevDecorPx = fx;
  const moveDir = Math.abs(moveDx) > 0.1 ? Math.sign(moveDx) : (player.facing || 1);
  let targetLift = 0;

  if (!activeMount?.flying && player.inWater <= 0 && !gameOver) {
    const minCx = Math.floor((fx - 40) / CHUNK_PX);
    const maxCx = Math.floor((fx + 40) / CHUNK_PX);
    const minCy = Math.floor((fy - 40) / CHUNK_PX);
    const maxCy = Math.floor((fy + 40) / CHUNK_PX);
    const touchDecor = (ch, d, fromBaked) => {
      if (d.isAbyss && !d.isSoftFlora && /hole|pit|ship/i.test(d.sprite || '')) return;
      const wx0 = ch.cx * CHUNK_PX + d.x;
      const wy0 = ch.cy * CHUNK_PX + d.y;
      if (fx < wx0 - 3 || fx > wx0 + d.dw + 3) return;
      if (fy < wy0 + d.dh * 0.36 || fy > wy0 + d.dh + 6) return;

      if (fromBaked && !d.detached) {
        if (activeList.length >= 18) return;
        detachBakedDecor(ch, d);
        d._ch = ch; d._fromBaked = true; d._isActive = true;
        d._squish = 0; d._bend = 0; d._squishVel = 0; d._bendVel = 0; d._idleTimer = 0; d._stepCd = 0;
        activeList.push(d);
      } else if (!fromBaked && !d._isActive) {
        if (activeList.length >= 24) return;
        d._ch = ch; d._fromBaked = false; d._isActive = true;
        d._squish = 0; d._bend = 0; d._squishVel = 0; d._bendVel = 0; d._idleTimer = 0; d._stepCd = 0;
        activeList.push(d);
      }
      d._touchedFrame = _decorTouchFrame;
      d._idleTimer = 0;
      const dtType = d.decorType || 'bush';
      if (dtType === 'rock' || dtType === 'crystal') {
        targetLift = Math.min(targetLift, dtType === 'crystal' ? -5.5 : -4.5);
      }
      if (!d._playerInside || (player.moving && (d._stepCd || 0) <= 0)) {
        d._stepCd = 0.24;
        if (dtType === 'bush') {
          d._squish = Math.max(d._squish || 0, 0.34);
          d._bend = moveDir * 0.30;
          playSfx('step_bush');
          if (particles.length < 260) {
            const leafColor = /flower/i.test(d.sprite || '') ? '#f48fb1' : (/snow|ice/i.test(d.sprite || '') ? '#e1f5fe' : (/autumn/i.test(d.sprite || '') ? '#ffb74d' : '#9fe070'));
            for (let k = 0; k < 4; k++) {
              particles.push({
                x: fx + (Math.random() - 0.5) * 10,
                y: fy - 4 - Math.random() * 6,
                vx: moveDir * (0.4 + Math.random() * 1.1) + (Math.random() - 0.5) * 1.2,
                vy: -0.9 - Math.random() * 1.3,
                life: 0.42, maxLife: 0.42,
                color: leafColor
              });
            }
          }
        } else if (dtType === 'mushroom') {
          d._squish = Math.max(d._squish || 0, 0.46);
          d._bend = moveDir * 0.16;
          playSfx('step_squish');
          if (particles.length < 260) {
            for (let k = 0; k < 5; k++) {
              particles.push({
                x: fx + (Math.random() - 0.5) * 12,
                y: fy - 5,
                vx: (Math.random() - 0.5) * 1.4,
                vy: -0.7 - Math.random() * 1.4,
                life: 0.55, maxLife: 0.55,
                color: Math.random() < 0.5 ? '#ce93d8' : '#ffe082'
              });
            }
          }
        } else {
          d._squish = Math.max(d._squish || 0, 0.08);
          d._bend = moveDir * 0.04;
          playSfx(dtType === 'crystal' ? 'step_crystal' : 'step_stone');
          if (particles.length < 260) {
            const chipColor = dtType === 'crystal' ? '#80deea' : '#cfd8dc';
            for (let k = 0; k < 3; k++) {
              particles.push({
                x: fx + (Math.random() - 0.5) * 8,
                y: fy - 2,
                vx: (Math.random() - 0.5) * 1.8,
                vy: -1.1 - Math.random() * 1.2,
                life: 0.32, maxLife: 0.32,
                color: chipColor
              });
            }
          }
        }
      }
    };

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const ch = chunks.get(chunkKey(cx, cy));
        if (!ch) continue;
        if (ch.bakedDecor) {
          for (let i = 0; i < ch.bakedDecor.length; i++) {
            const bd = ch.bakedDecor[i];
            if (!bd.detached) touchDecor(ch, bd, true);
          }
        }
        if (ch.decor) {
          for (let i = 0; i < ch.decor.length; i++) {
            touchDecor(ch, ch.decor[i], false);
          }
        }
      }
    }
    // Also let already-detached active decors detect continued overlap even if player moves slightly
    for (let i = 0; i < activeList.length; i++) {
      const d = activeList[i];
      if (d._fromBaked && d._ch && d._touchedFrame !== _decorTouchFrame) {
        touchDecor(d._ch, d, false);
      }
    }
  }

  const curLift = player.decorStepOffsetY || 0;
  const nextLift = curLift + (targetLift - curLift) * Math.min(1, dt * 18);
  player.decorStepOffsetY = Math.abs(nextLift) < 0.08 && targetLift === 0 ? 0 : nextLift;

  for (let i = activeList.length - 1; i >= 0; i--) {
    const d = activeList[i];
    if (!d._ch || !chunks.has(chunkKey(d._ch.cx, d._ch.cy))) {
      d._isActive = false; d._playerInside = false;
      activeList.splice(i, 1);
      continue;
    }
    d._playerInside = (d._touchedFrame === _decorTouchFrame);
    if (d._stepCd > 0) d._stepCd -= dt;
    const isSoft = d.decorType === 'bush' || d.decorType === 'mushroom';
    const targetSquish = (d._playerInside && isSoft) ? (d.decorType === 'mushroom' ? 0.30 : 0.22) : 0;
    d._squishVel += ((targetSquish - d._squish) * 150 - d._squishVel * 14) * dt;
    d._squish = Math.max(-0.12, Math.min(0.55, d._squish + d._squishVel * dt));
    d._bendVel += ((0 - d._bend) * 125 - d._bendVel * 12) * dt;
    d._bend = Math.max(-0.45, Math.min(0.45, d._bend + d._bendVel * dt));

    if (!d._playerInside) {
      d._idleTimer = (d._idleTimer || 0) + dt;
      if (d._idleTimer > 1.0 && Math.abs(d._squish) < 0.015 && Math.abs(d._bend) < 0.015) {
        d._squish = 0; d._bend = 0; d._isActive = false;
        if (d._fromBaked) rebakeDecorToChunk(d._ch, d);
        activeList.splice(i, 1);
      }
    } else {
      d._idleTimer = 0;
    }
  }
}

function update(dt){
  if(!gameStarted)return;
  // Boss intro pauses everything
  if(bossIntro.timer>0){
    bossIntro.timer-=dt;
    if(bossIntro.boss){
      camera.x=bossIntro.boss.x-VW()/2;
      camera.y=bossIntro.boss.y-VH()/2;
      bossIntro.zoom=1+Math.min(1,bossIntro.timer/2.2)*.3;
    }
    if(bossIntro.timer<=0){
      document.getElementById('bossIntro').style.display='none';
      bossIntro.boss=null;bossIntro.zoom=1;
    }
    return;
  }
  if(deathSeq.active){
    deathSeq.timer+=dt;
    const tNorm=Math.min(1,deathSeq.timer/1.35);
    const ease=1-Math.pow(1-tNorm,3);
    deathSeq.zoom=1+1.35*ease;
    const targetCamX=player.x+player.w/2-VW()/2;
    const targetCamY=player.y+player.h/2-VH()/2;
    camera.x+=(targetCamX-camera.x)*Math.min(1,dt*10);
    camera.y+=(targetCamY-camera.y)*Math.min(1,dt*10);
    const slowDt=dt*0.15;
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];
      p.x+=p.vx*60*slowDt;
      p.y+=p.vy*60*slowDt;
      p.life-=slowDt;
      if(p.life<=0)particles.splice(i,1);
    }
    for(let i=damageNumbers.length-1;i>=0;i--){
      const d=damageNumbers[i];
      d.y-=24*slowDt;
      d.life-=slowDt;
      if(d.life<=0)damageNumbers.splice(i,1);
    }
    for(let i=0;i<enemies.length;i++){
      const e=enemies[i];
      e.wobble=(e.wobble||0)+slowDt*2;
      if(e.hitFlash>0)e.hitFlash=Math.max(0,e.hitFlash-slowDt);
    }
    if(deathSeq.timer<1.45&&Math.random()<dt*22){
      particles.push({
        x:player.x+player.w/2+(Math.random()-0.5)*22,
        y:player.y+player.h-6+(Math.random()-0.5)*8,
        vx:(Math.random()-0.5)*0.6,
        vy:-0.7-Math.random()*1.1,
        life:0.45+Math.random()*0.35,
        maxLife:0.8,
        color:Math.random()<0.68?'#e53935':'#ffd54f'
      });
    }
    if(deathSeq.timer>=deathSeq.duration){
      deathSeq.active=false;
      deathSeq.done=true;
      const goEl=document.getElementById('gameover');
      if(goEl)goEl.style.display='flex';
      syncMusicTrack();
    }
    return;
  }
  if(paused||gameOver)return;
  updateRelicPickups();
  // Pickaxe swing timer
  if ((player.pickaxeSwingTimer || 0) > 0) player.pickaxeSwingTimer = Math.max(0, player.pickaxeSwingTimer - dt);
  if ((player.fireBreathTimer || 0) > 0) player.fireBreathTimer = Math.max(0, player.fireBreathTimer - dt);
  if ((player.weaponSwingTimer || 0) > 0) player.weaponSwingTimer = Math.max(0, player.weaponSwingTimer - dt);
  elapsed+=dt;
  // No-damage timer (only when not hit)
  if(player.invulnTimer<=0) questProgress.noDamageTime += dt;
  
  // Challenge & Story quests real-time tracking
  if(!questProgress.tookDamage && player.level > (questProgress.untouchableLevel||1)){
    questProgress.untouchableLevel = player.level;
  }
  if(elapsed <= 600 && player.level >= 15){
    questProgress.speedrunCompleted = true;
  }
  if(kills === 0 && elapsed >= 300){
    questProgress.pacifistCompleted = true;
  }
  const curBiome = biomeAt(Math.floor((player.x + player.w / 2) / TILE), Math.floor((player.y + player.h / 2) / TILE));
  if(curBiome && !questProgress.visitedBiomes[curBiome]){
    questProgress.visitedBiomes[curBiome] = true;
  }

  // Dream Biome Survival Loop
  if(state.isInDream){
    state.dreamTimer = (state.dreamTimer || 0) + dt;
    applyDreamRelicEffects(dt);
    // The awakening bar fills ONLY when killing dream mobs!

    // Nightmare level scaling: Level 1 (0-33%), Level 2 (33-66%), Level 3 (66-100%)
    if(state.awakeningProgress < 33){
      state.nightmareLevel = 1;
    } else if(state.awakeningProgress < 66){
      state.nightmareLevel = 2;
    } else {
      state.nightmareLevel = 3;
    }

    // No bosses spawn in Dream Biome as requested

    // Complete Awakening at 100%
    if(state.awakeningProgress >= 100){
      if(typeof window.exitDream === 'function') window.exitDream(false);
    }
  }
  
  // Track night survival
  if(isNight()){
    inNight = true;
  }else if(inNight){
    inNight = false;
    questProgress.nightsSurvived = (questProgress.nightsSurvived || 0) + 1;
  }
  
  // Track distance from camp
  const campOriginX = campSave.campX ?? 100;
  const campOriginY = campSave.campY ?? 100;
  const distTiles = Math.floor(Math.hypot((player.x + player.w / 2) - campOriginX, (player.y + player.h / 2) - campOriginY) / TILE);
  if(distTiles > (questProgress.maxDistTilesFromCamp || 0)){
    questProgress.maxDistTilesFromCamp = distTiles;
  }
  const prevDayCycle = Math.floor(worldTime / DAY_LENGTH);
  worldTime += dt;
  const newDayCycle = Math.floor(worldTime / DAY_LENGTH);
  if (newDayCycle > prevDayCycle) {
    campSave.day = (campSave.day || 1) + (newDayCycle - prevDayCycle);
    saveCamp();
    updateHUD();
  }
  if(carriedRelic&&carriedRelic.timeRemaining>0){
    const wasLocked=carriedRelic.timeRemaining>0;
    carriedRelic.timeRemaining=Math.max(0,carriedRelic.timeRemaining-dt);
    if(wasLocked&&carriedRelic.timeRemaining===0){
      playSfx('confirm');
      const toast=document.createElement('div');toast.className='relic-toast';
      const title=document.createElement('strong');title.textContent='CAMP RETURN UNLOCKED';title.style.color=carriedRelic.color;
      const name=document.createElement('span');name.textContent=`${carriedRelic.name} is secured by the timer.`;
      toast.append(title,name);document.getElementById('relicToasts').appendChild(toast);setTimeout(()=>toast.remove(),3600);saveCamp();
    }
  }
  const inChickenDimEnv = (player.x > 910000 * TILE && player.x < 990000 * TILE && player.y > 910000 * TILE && player.y < 990000 * TILE);
  if (inChickenDimEnv) {
    isBloodMoon = false;
    weather.type = 'clear';
    weather.timer = 60;
    flood.active = false;
    flood.timer = 0;
    floodBoost = 0;
    lightnings.length = 0;
    weatherParticles.length = 0;
    player.inWater = 0;
  } else {
    checkBloodMoon();
    updateWeather(dt);
    updateWeatherParticles(dt);
    updateLightning(dt);
    updateFlood(dt);
  }
  updateParallaxClouds(dt);
  updateHordeEvents(dt);
  updateSwarmWaves(dt);

  // Demo 20-Minute Hard Limit (1200s)
  if (typeof window !== 'undefined' && window.IS_DEMO) {
    if (elapsed >= 1080 && !window._demoWarningShown) {
      window._demoWarningShown = true;
      if (typeof showDropToast === 'function') {
        showDropToast('⏳ DEMO LIMIT: 2 MINUTES REMAINING!', '#ffb74d');
      }
    }
    if (elapsed >= 1200 && !window._demoVictoryTriggered) {
      window._demoVictoryTriggered = true;
      if (typeof window.showDemoVictoryModal === 'function') {
        window.showDemoVictoryModal(null, true);
      }
    }
  }

  // Ability updates
  updateAbilities(dt);

  // NPC Proximity Detection
  const cx=Math.floor(player.x/CHUNK_PX),cy=Math.floor(player.y/CHUNK_PX);
  let closestNPC = null, closestDist = Infinity;
  for(let i=cx-1;i<=cx+1;i++)for(let j=cy-1;j<=cy+1;j++){
    const ch=chunks.get(chunkKey(i,j));
    if(!ch)continue;
    for(const npc of ch.npcSites||[]){
      const dist=Math.hypot(player.x+player.w/2-npc.x,player.y+player.h/2-npc.y);
      if(dist<80 && dist<closestDist){
        closestDist = dist;
        closestNPC = npc;
      }
    }
  }
  const fAlden = !(typeof window !== 'undefined' && window.IS_DEMO) ? window.FROST_HERMIT_NPC : null; if(fAlden){ const dist = Math.hypot(player.x+player.w/2-fAlden.x, player.y+player.h/2-fAlden.y); if(dist < 105 && dist < closestDist){ closestDist = dist; closestNPC = fAlden; } }
  const mAlc = window.MAD_ALCHEMIST_NPC;
  if(mAlc){
    const dist = Math.hypot(player.x+player.w/2-mAlc.x, player.y+player.h/2-mAlc.y);
    if(dist < 105 && dist < closestDist){
      closestDist = dist;
      closestNPC = mAlc;
    }
  }
  activeNearbyNPC = closestNPC;



  // Track storm/flood survival
  if(weather.type==='storm')inStorm=true;
  else if(inStorm){
    inStorm=false;
    survivedStorm=true;
    questProgress.stormsSurvived++;
  }
  if(flood.active)inFlood=true;
  else if(inFlood){
    inFlood=false;
    survivedFlood=true;
    questProgress.floodsSurvived = (questProgress.floodsSurvived || 0) + 1;
  }

  const activeMount = getActiveMount();

  // Update player movement (grid or free mode)
  updatePlayerMovement(dt);
  revealAroundPlayer();
  if(elapsed-lastFogSave>=8){lastFogSave=elapsed;saveCamp();}
  rebuildEnemyGrid();

  // Ice slow (spatial query around player instead of all enemies)
  let iceSlow=1;
  const pcx0=player.x+player.w/2, pcy0=player.y+player.h/2;
  forEachEnemyNear(pcx0, pcy0, 175, e => {
    if(e.hp<=0)return;
    if(e.type==='iceGolem'||e.type==='iceTitan'||e.type==='iceSprite'){
      const r=e.type==='iceTitan'?170:130;
      const dx=pcx0-e.x,dy=pcy0-e.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<r)iceSlow=Math.min(iceSlow,.5+(d/r)*.5);
    }
  });
  player.slowFactor=iceSlow;

  // Collision push-out
  resolvePlayerEnemyCollision();
  if(player.regen+relicModifiers.regen>0){const h=(player.regen+relicModifiers.regen)*dt;player.hp=Math.min(player.maxHp,player.hp+h);totalHealedHPRun+=h;}
  if(player.maxShield > 0){
    player.shieldRegenTimer += dt;
    const shieldLevel = player.upgradeLevels?.shieldGen || 1;
    const regenInterval = Math.max(0.8, 1.8 - shieldLevel * 0.2);
    if(player.shieldRegenTimer >= regenInterval){
      const ticks = Math.floor(player.shieldRegenTimer / regenInterval);
      player.shieldRegenTimer -= ticks * regenInterval;
      const regenPerTick = Math.max(1, Math.round(shieldLevel * 0.75));
      player.shield = Math.min(player.maxShield, player.shield + ticks * regenPerTick);
    }
  }
  if(player.invulnTimer>0)player.invulnTimer-=dt;

  // Poison
  if(player.poisonTimer>0){
    player.poisonTimer-=dt;
    player.poisonTickTimer+=dt;
    if(player.poisonTickTimer>=.5){
      player.poisonTickTimer=0;
      const dmg=player.poisonStacks*2;
      // Shield Bubble check for poison damage
      if(player.abilities && player.abilities.includes('shield_bubble') && player.shieldBubbleCharges > 0){
        player.shieldBubbleCharges--;
        spawnDamageNumber(player.x + player.w/2, player.y - 10, 'BLOCKED', '#4fc3f7');
        spawnParticles(player.x + player.w/2, player.y + player.h/2, '#4fc3f7', 6);
      } else {
        questProgress.noDamageTime=0;questProgress.tookDamage=true;player.hp-=dmg;playSfx('hurt');
        if(window.GAME_SETTINGS.screenShake) screenShakeIntensity = Math.min(30, screenShakeIntensity + dmg * 0.8);
        spawnDamageNumber(player.x+player.w/2,player.y-10,dmg,'#7CFC00');
        spawnParticles(player.x+player.w/2,player.y+player.h/2,'#7CFC00',4);
        if(player.hp<=0){player.hp=0;gameOver=true;showGameOver();return;}
      }
    }
    if(player.poisonTimer<=0){player.poisonStacks=0;player.poisonTickTimer=0;}
  }

  // Water ripples
  if(player.inWater>0&&player.moving&&Math.random()<.4 && particles.length < 260)particles.push({
    x:player.x+player.w/2+(Math.random()-.5)*player.w,y:player.y+player.h-4,
    vx:(Math.random()-.5)*2,vy:-1-Math.random(),life:.4,maxLife:.4,color:'rgba(200,230,255,.9)'
  });

  // Physical foot/decor interaction (bush squish/bend, mushroom spores, rock/crystal step-up)
  updatePlayerDecorInteraction(dt, activeMount);

  // Camera smooth follow (Lerp: prevents jitter/trembling)
  const targetCamX = player.x + player.w / 2 - VW() / 2;
  const targetCamY = player.y + player.h / 2 - VH() / 2;
  const lerpFactor = 0.15;
  camera.x += (targetCamX - camera.x) * lerpFactor;
  camera.y += (targetCamY - camera.y) * lerpFactor;

  if(elapsed-lastCleanup>2){lastCleanup=elapsed;cleanupChunks();}

  const enemyCap=getEnemyCap();
  if(elapsed-lastDespawn>1){
    lastDespawn=elapsed;
    let regularEnemyCount=getRegularEnemyCount();
    for(let i=enemies.length-1;i>=0;i--){
      const enemy=enemies[i];
      if(!enemy){ enemies.splice(i, 1); continue; }
      if(enemy.boss)continue;
      const dist2=(enemy.x-player.x)**2+(enemy.y-player.y)**2;
      if(enemy.hordeSpawn){
        if(dist2 > 2200*2200) enemies.splice(i,1);
        continue;
      }
      if(enemy.elite || enemy.swarmMember) continue;
      const tooFar=dist2 > 1800*1800;
      const overCap=regularEnemyCount>enemyCap && dist2 > 950*950;
      if(tooFar||overCap){
        enemies.splice(i,1);
        regularEnemyCount--;
      }
    }
  }

  // Spawning - smooth scaling up to 22 enemies/sec for dense field presence
  const minutes=elapsed/60;
  const diff = window.GAME_SETTINGS?.difficulty ?? 1;
  let diffSpawnMult = 1;
  if (diff === 0) diffSpawnMult = 0.55;
  else if (diff === 2) diffSpawnMult = 1.3;
  else if (diff === 3) diffSpawnMult = 1.6;
  else if (diff === 4) diffSpawnMult = 2.0;
  const _pwx = Math.floor(player.x / TILE), _pwy = Math.floor(player.y / TILE);
  const _inAbyssNow = _pwx > 700000 && _pwx < 900000 && _pwy > 700000 && _pwy < 900000;
  const _inChickenNow = _pwx > 910000 && _pwx < 990000 && _pwy > 910000 && _pwy < 990000;
  if (_inChickenNow) {
    if (!state.savedChickenWeapons) {
      state.savedChickenWeapons = playerWeapons.map(w => ({ ...w }));
    }
    if (playerWeapons.length !== 1 || playerWeapons[0].id !== 'boomerang') {
      const existingBoom = playerWeapons.find(w => w.id === 'boomerang') || state.savedChickenWeapons?.find(w => w.id === 'boomerang');
      const boomLvl = existingBoom ? existingBoom.level : Math.max(1, Math.min(8, player.level || 1));
      playerWeapons.splice(0, playerWeapons.length, { id: 'boomerang', level: boomLvl, timer: 0 });
      updateWeaponHUD();
    }
    if ((state.chickenCoins || 0) >= 100000 && !state.chickenKingSpawned && !state.chickenKingDefeated && !enemies.some(e => e.hp > 0 && e.type === 'chickenKing')) {
      state.chickenKingSpawned = true;
      spawnEnemyAt(player.x + 280, player.y - 120, 'chickenKing');
      showDropToast('👑 100,000 Chicken Coins collected! The Chicken King has awakened!', '#ffd700', 'chickenKingCrown');
    }
  } else if (state.savedChickenWeapons && state.savedChickenWeapons.length > 0) {
    playerWeapons.splice(0, playerWeapons.length, ...state.savedChickenWeapons.map(w => ({ ...w, timer: 0 })));
    state.savedChickenWeapons = null;
    updateWeaponHUD();
  }
  const pLvl = player.level || 1;
  const bossAlive = enemies.some(e => (e.boss || ENEMY_TYPES[e.type]?.boss) && e.hp > 0);
  const levelSpawnBonus = Math.max(0, pLvl - 14) * 0.20;
  const rawSpawnRate = _inChickenNow ? 26 : Math.min(1.8 + minutes * 0.65 + levelSpawnBonus, 22);
  const spawnRate = rawSpawnRate * diffSpawnMult * (bossAlive && !_inChickenNow ? 0.45 : 1);
  if (!(_inChickenNow && state.chickenKingDefeated)) {
    if(Math.random()<spawnRate*dt)spawnBiomeEnemy();
    if(_inChickenNow && enemies.length < 280){
      spawnBiomeEnemy();
      if(enemies.length < 180) spawnBiomeEnemy();
    }
  }
  if(!_inAbyssNow && !_inChickenNow){
    if(player.inWater>0&&Math.random()<.8*dt)spawnWaterEnemy();
    else if(Math.random()<.25*dt)spawnWaterEnemy();
    if(isNight()&&Math.random()<.08*dt)spawnVampirePack();
  }
  if (!_inChickenNow && !state.isInDream && player.level >= 10 && player.level < 12 && !state.bossWarningShown) { state.bossWarningShown = true; showDropToast('⚠️ The ground trembles... The Biome Lord awakens at Level 12!', '#ff5252'); }
  if (!_inChickenNow && player.level >= 12 && !bossAlive) {
      const bn = biomeAt(Math.floor((player.x+player.w/2)/TILE), Math.floor((player.y+player.h/2)/TILE));
      if (spawnedBossBiomes.has(bn)) {
        // Boss already defeated in this biome. Check again in 5 seconds to see if they moved to a new biome.
        if (nextBossTime <= elapsed) {
          nextBossTime = elapsed + 5;
        }
      } else if (elapsed >= nextBossTime) {
        const targetClearCap = Math.max(18, Math.floor(enemyCap * 0.55));
        while(getRegularEnemyCount() >= targetClearCap) {
          let farthestIndex=-1, farthestDistance=-1;
          for(let i=0; i<enemies.length; i++) {
            const enemy = enemies[i]; if(enemy.elite || enemy.boss) continue;
            const distance = (enemy.x-player.x)**2 + (enemy.y-player.y)**2;
            if(distance > farthestDistance) { farthestDistance = distance; farthestIndex = i; }
          }
          if(farthestIndex < 0) break;
          enemies.splice(farthestIndex, 1);
        }
        const didSpawn = spawnBiomeBoss();
        if (didSpawn) {
          nextBossTime = Math.max(elapsed, nextBossTime) + 60;
        } else {
          nextBossTime = elapsed + 2;
        }
      }
    }

    // High-Level Surge Waves (Surround player with 16-28 aggressive mobs every ~22s at Lv 30+)
    if (!state.lastSurgeTime) state.lastSurgeTime = 0;
    if (!state.isInDream && !_inChickenNow && pLvl >= 30 && elapsed - state.lastSurgeTime >= 22) {
      state.lastSurgeTime = elapsed;
      const surgeCount = Math.min(30, Math.floor(14 + (pLvl - 30) * 0.25));
      const curBn = biomeAt(Math.floor((player.x + player.w/2)/TILE), Math.floor((player.y + player.h/2)/TILE)) || 'plains';
      const chosenMob = pickBiomeEnemy(curBn, elapsed) || 'wolf';
      const baseDist = Math.max(VW(), VH()) * 0.62;
      for (let i = 0; i < surgeCount; i++) {
        const ang = (i / surgeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const d = baseDist + (Math.random() - 0.5) * 80;
        spawnEnemyAt(player.x + Math.cos(ang) * d, player.y + Math.sin(ang) * d, chosenMob, { hordeSpawn: true });
      }
      showHordeToast('⚔️ SURGE WAVE INCOMING!');
    }

    // Endless Apex Nemesis Invasions (Level 35, 55, 75, 95, 120+) in Full Game
    if (!state.apexInvasionLevels) state.apexInvasionLevels = new Set();
    const apexThresholds = [35, 55, 75, 95, 120];
    for (const lvl of apexThresholds) {
      if (pLvl >= lvl && !state.apexInvasionLevels.has(lvl) && !bossAlive && !_inChickenNow && !state.isInDream) {
        state.apexInvasionLevels.add(lvl);
        spawnBiomeBoss();
        showHordeToast(`⚡ APEX NEMESIS INVASION (LV ${lvl})!`);
        screenShakeIntensity = Math.max(screenShakeIntensity || 0, 7);
        break;
      }
    }

  // Weapons
  const chronoWeapon=playerWeapons.find(item=>item.id==='chrono'||item.id==='temporalLord');
  const chronoStats=chronoWeapon?scaleWeaponStats(WEAPON_DEFS[chronoWeapon.id].stats(chronoWeapon.level)):null;
  for(const w of playerWeapons){
    if(w.id==='chrono'||w.id==='temporalLord'){w.timer=0;continue;}
    const wDef = WEAPON_DEFS[w.id]; if (!wDef) continue; const stats = scaleWeaponStats(wDef.stats(w.level));
    w.timer-=dt*(1+(chronoStats?.attackSpeedBonus||0));
    if(w.timer<=0){
      const dreamAttackSpeedMult = (state.isInDream && state.dreamRelics && state.dreamRelics.includes('coffee_bean')) ? 0.9 : 1.0;
      const cd = stats.cooldown*player.cooldownMultiplier*relicModifiers.cooldown*(activeMount?.attackSpeedMult||1)*dreamAttackSpeedMult;
      const fired = fireWeapon(w,stats);
      if(fired !== false){
        w.timer=cd;
        w.maxTimer=cd;
      } else {
        w.timer=0.06;
      }
    }
  }
  fireCarriedRelicPower(dt);
  updateCampCompanions(dt);

    // Projectiles
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i];
    if(!p || typeof p !== 'object' || !Number.isFinite(p.x) || !Number.isFinite(p.y)){
      projectiles.splice(i, 1);
      continue;
    }
    if(maskOfCalmActive && !p.enemyShot){
      projectiles.splice(i, 1);
      continue;
    }
    p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.life-=dt;

    if(p.behavior==='warhammer'){
      p.vy += (p.gravity || 0.28) * dt * 60;
      p.angle = (p.angle || 0) + (p.spinSpeed || 16) * dt;
      if(p.life <= 0){
        const r2 = (p.impactRadius || 65) * (p.impactRadius || 65);
        forEachEnemyNear(p.x, p.y, p.impactRadius || 65, e => {
          if(e.hp<=0||!enemyIsRevealed(e)) return;
          const dx=e.x-p.x, dy=e.y-p.y;
          if(dx*dx + dy*dy < r2){
            damageEnemy(e, p.damage * 1.35, { knockback: (p.knockback || 38) * 1.4 });
          }
        });
        screenShakeIntensity = Math.max(screenShakeIntensity || 0, 5);
        spawnParticles(p.x, p.y, '#e0e0e0', 14);
        spawnParticles(p.x, p.y, '#ffb74d', 8);
        playSfx('explosion');
        projectiles.splice(i, 1);
        continue;
      }
    }
if(p.isPickaxe) {
        const maxBreaks=p.maxBreaks||1;
        if((p.wallsBroken||0)<maxBreaks){
          const pad=p.breakPad??2;
          const tx1 = Math.floor((p.x - p.w/2 - pad)/TILE);
          const ty1 = Math.floor((p.y - p.h/2 - pad)/TILE);
          const tx2 = Math.floor((p.x + p.w/2 + pad)/TILE);
          const ty2 = Math.floor((p.y + p.h/2 + pad)/TILE);
          // Direction of travel — only break tiles in front of the projectile
          const dirLen = Math.hypot(p.vx, p.vy) || 1;
          const dirX = p.vx / dirLen;
          const dirY = p.vy / dirLen;
          for(let tx = tx1; tx <= tx2 && (p.wallsBroken||0)<maxBreaks; tx++) {
             for(let ty = ty1; ty <= ty2 && (p.wallsBroken||0)<maxBreaks; ty++) {
                 if (window.isWallTile(tx, ty)) {
                    // Only break tiles whose center is in front of the projectile
                    const tileCX = (tx + 0.5) * TILE;
                    const tileCY = (ty + 0.5) * TILE;
                    const relX = tileCX - p.x;
                    const relY = tileCY - p.y;
                    const dot = relX * dirX + relY * dirY;
                    if (dot < -TILE * 0.5) continue; // behind the projectile — skip
                    window.breakWallAt(tx, ty);
                    player.pickaxeSwingTimer = 0.45;
                    p.wallsBroken=(p.wallsBroken||0)+1;
                 }
             }
          }
        }
    }


    // ═══ BOOMERANG behavior ═══
    if(p.behavior==='boomerang'){
      p.age += dt;
      p.angle += dt * 15;
      // Turn back after 0.6 seconds
      if(!p.returnPhase && p.age > 0.6){
        p.returnPhase = true;
        if(p.hitTargets) p.hitTargets.length = 0;
      }
      if(p.returnPhase){
        const dx = (player.x + player.w/2) - p.x;
        const dy = (player.y + player.h/2) - p.y;
        const d = Math.sqrt(dx*dx + dy*dy) || 1;
        const sp = Math.hypot(p.vx, p.vy) || 7;
        p.vx = dx/d * sp;
        p.vy = dy/d * sp;
        // Remove after returning to the player
        if(d < 30){ projectiles.splice(i,1); continue; }
      }
    }

    // Thrown projectiles tumbling in flight
    if(p.behavior==='holyThrow') p.angle += dt * 8;
    if(p.behavior==='bombard') p.angle += dt * 7;

    // Holy water creates a pool on impact
    if(p.behavior==='holyThrow' && p.life <= 0){
      holyPools.push({
        x: p.targetX, y: p.targetY,
        radius: p.holyRadius, damage: p.holyDamage,
        life: p.holyDuration, maxLife: p.holyDuration, tick: 0
      });
      spawnParticles(p.targetX, p.targetY, '#bbdefb', 12);
      projectiles.splice(i, 1);
      continue;
    }

    if(p.behavior==='bombard' && p.life <= 0){
      const r2 = p.bombRadius * p.bombRadius;
      forEachEnemyNear(p.targetX, p.targetY, p.bombRadius, e => {
        if(e.hp<=0||!enemyIsRevealed(e))return;
        const dx=e.x-p.targetX, dy=e.y-p.targetY;
        if(dx*dx+dy*dy<r2)damageEnemy(e,p.bombDamage);
      });
      particles.push({x:p.targetX,y:p.targetY,vx:0,vy:0,life:.45,maxLife:.45,color:'#ff9b45',explosion:p.bombRadius});
      spawnParticles(p.targetX,p.targetY,'#ffbd63',14);
      projectiles.splice(i,1);
      continue;
    }

    if(p.enemyShot){
      if(maskOfCalmActive){
        if (p.life <= 0) projectiles.splice(i, 1);
        continue;
      }
      if(player.invulnTimer<=0 && hitTest(p.x-p.w/2,p.y-p.h/2,p.w,p.h, player.x,player.y,player.w,player.h)){
         let actualDmg = p.damage;
         const shotSource = p.shooterType ? `mob_${p.shooterType}` : 'enemy_projectile';
         applyPlayerDamage(actualDmg, shotSource, '#ff5252', { rawDmg: actualDmg });
         player.invulnTimer = 0.6;
         projectiles.splice(i, 1);
         continue;
      }
      if (p.life <= 0) projectiles.splice(i, 1);
      continue;
    }

    // Standard projectile hit test using spatial grid
    let hit=false;
    const pSearchR = Math.max(p.w, p.h) * 0.5 + 104;
    forEachEnemyNear(p.x, p.y, pSearchR, e => {
      if(e.hp<=0||!enemyIsRevealed(e)||e.passive||ENEMY_TYPES[e.type]?.passive)return;
      if(p.hitTargets?.includes(e))return;
      if(hitTest(p.x-p.w/2,p.y-p.h/2,p.w,p.h,e.x-e.w/2,e.y-e.h/2,e.w,e.h)){
        damageEnemy(e,p.damage*(p.companionShot?player.companionMult:1));
        if(p.companionBonus)damageEnemy(e,p.companionBonus*(p.companionShot?player.companionMult:1));
        if(p.companionChain>0){
          const hitTargets=p.hitTargets||(p.hitTargets=[]);if(!hitTargets.includes(e))hitTargets.push(e);
          const points=[{x:e.x,y:e.y}];let origin=e;
          for(let jump=0;jump<p.companionChain;jump++){
            const next=findNearestRevealedEnemy(origin.x,origin.y,190,hitTargets);
            if(!next)break;
            hitTargets.push(next);damageEnemy(next,p.damage*.55);points.push({x:next.x,y:next.y});origin=next;
          }
          if(points.length>1)chainVisuals.push({points,life:.28,maxLife:.28});
          p.companionChain=0;
        }
        if(p.slowDuration)e.slowTimer=Math.max(e.slowTimer||0,p.slowDuration);
        if(p.ricochets>0){
          p.ricochets--;p.hitTargets.push(e);
          const next=findNearestRevealedEnemy(e.x,e.y,360,p.hitTargets);
          if(next){
            const dx=next.x-p.x,dy=next.y-p.y,d=Math.hypot(dx,dy)||1,speed=Math.hypot(p.vx,p.vy)||9;
            p.vx=dx/d*speed;p.vy=dy/d*speed;p.angle=Math.atan2(p.vy,p.vx);p.life=Math.max(p.life,.75);
            return false;
          }
          hit=true;return false;
        }
        if(p.pierce>0){p.pierce--;const ht=p.hitTargets||(p.hitTargets=[]);if(!ht.includes(e))ht.push(e);}else{hit=true;return false;}
      }
    });
    if(hit||p.life<=0)projectiles.splice(i,1);
  }

  updateWeaponFields(dt);

  // Enemies
  const packCentroids=new Map();
  for(const e of enemies){
    if(!e || e.packId==null)continue;
    const p=packCentroids.get(e.packId)||{x:0,y:0,n:0};
    p.x+=e.x;p.y+=e.y;p.n++;
    packCentroids.set(e.packId,p);
  }
  for(const p of packCentroids.values()){p.x/=p.n;p.y/=p.n;}

  const hasFriendlyFire = Boolean(player.abilities && player.abilities.includes('friendly_fire'));

  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i];
    if(!e || typeof e !== 'object'){
      enemies.splice(i, 1);
      continue;
    }
    if(e.hitFlash>0)e.hitFlash-=dt;
    if(e.slowTimer>0)e.slowTimer=Math.max(0,e.slowTimer-dt);
    if(e.frozenTimer>0){e.frozenTimer=Math.max(0,e.frozenTimer-dt);if(e.frozenTimer<=0)e.frozen=false;}
    if(e.upgradeSlowTimer>0)e.upgradeSlowTimer=Math.max(0,e.upgradeSlowTimer-dt);
    if(e.burnTimer>0){e.burnTimer=Math.max(0,e.burnTimer-dt);e.burnTick=(e.burnTick||0)+dt;if(e.burnTick>=1){e.burnTick-=1;damageEnemy(e,e.burnDamage||0,{noProc:true});}}

    // Handle swarm member death
    if(e.swarmMember && e.hp<=0){
      spawnParticles(e.x, e.y, '#ff5252', 2);
      enemies.splice(i, 1);
      continue;
    }

    // Handle cross swarm rotation (only on leader)
    if(e.swarmFormation === 'cross' && !e.swarmMember){
      e.swarmRotationTimer = (e.swarmRotationTimer || 0) + dt;
      if(e.swarmRotationTimer >= 2){
        e.swarmRotationTimer = 0;
        e.swarmRotation = (e.swarmRotation || 0) + Math.PI / 2; // Rotate 90 degrees
      }
    }

    if(e.hp<=0){
      if(!e.deathProcessed){
        // Volatile Champion death explosion
        if(e.championAffix === 'volatile' && !e._hasDetonated){
          e._hasDetonated = true;
          spawnParticles(e.x, e.y, '#ff5722', 18);
          particles.push({x: e.x, y: e.y, vx: 0, vy: 0, life: 0.35, maxLife: 0.35, color: '#ff7043', explosion: 90});
          forEachEnemyNear(e.x, e.y, 90, nearby => {
            if(nearby !== e && nearby.hp > 0){
              nearby.speed = (nearby.speed || 1) * 1.35;
            }
          });
        }
        const isBossMob = Boolean(ENEMY_TYPES[e.type]?.boss);
        const isUltraMob = Boolean(e.ultraElite);
        const isEliteMob = Boolean(e.elite);
        let gemSprite = e.megaOrbSprite || 'xp_orb';
        let gemColor = e.megaOrbColor || null;
        if(isBossMob || e.tier === 'mythic' || gemSprite === 'xp_gem_mythic'){
          gemSprite = 'xp_gem_mythic';
          gemColor = '#ff4d4d';
        } else if(isUltraMob || e.tier === 'legendary' || gemSprite === 'xp_gem_legendary'){
          gemSprite = 'xp_gem_legendary';
          gemColor = '#ffd45c';
        } else if(isEliteMob || e.tier === 'elite' || gemSprite === 'xp_gem_elite'){
          gemSprite = gemSprite || 'xp_gem_elite';
          gemColor = gemColor || '#c38cff';
        }
        const isMega = Boolean(isBossMob || isUltraMob || isEliteMob || e.tier || (gemSprite && gemSprite.startsWith('xp_gem_')));

        e.deathProcessed = true;
        e.deathTimer = 0.3;
        if (!isBossMob && !e.passive && e.hitByPlayer && particles.length < 280) {
          const isGreenBlood = /goblin|slime|spider|beetle|mantis|ant|snake|worm|leech|croc|toad|crab|fungal|swamp|rot|zombie|ghoul|troll|hydra|scorpion|scarab|centipede|moth/i.test(e.type || '');
          const bloodSize = Math.max(28, Math.min(50, Math.max(e.w || 28, e.h || 28) * 1.15));
          particles.push({
            x: e.x, y: e.y, vx: 0, vy: 0,
            life: 0.36, maxLife: 0.36,
            color: isGreenBlood ? '#64dd17' : '#e53935',
            explosion: bloodSize,
            spriteAnim: isGreenBlood ? 'green_blood' : 'red_blood',
            rot: Math.random() * Math.PI * 2
          });
        }
        spawnParticles(e.x,e.y,gemColor||(isEliteMob?'#ffd54f':'#e53935'),isMega?18:6);
      const _isChickenEnemy = (_pwx > 910000 && _pwx < 990000 && _pwy > 910000 && _pwy < 990000) || (e.type === 'chicken' || e.type === 'rooster' || e.type === 'giantChicken' || e.type === 'chickenKing');
      let merged=false;
      const isClustering = window.GAME_SETTINGS?.gemClustering !== false;
      const mergeDist2 = isClustering ? (xpGems.length > 60 ? 10000 : 900) : (xpGems.length > 85 ? 4200 : 400);
      if(!isMega && !_isChickenEnemy)for(let gi=xpGems.length-1;gi>=0;gi--){
        const g=xpGems[gi];
        const gdx=g.x-e.x,gdy=g.y-e.y;
        if(!g.mega&&gdx*gdx+gdy*gdy<mergeDist2){g.xp+=e.xp*player.xpMultiplier*relicModifiers.xp*player.gemValueMult;g.life=Math.max(g.life,20);merged=true;break;}
      }
      if(!merged && !state.isInDream && !_isChickenEnemy){
        if (isClustering && xpGems.length > 90) {
          const g1 = xpGems[0], g2 = xpGems[1];
          if (g1 && g2 && !g1.mega && !g2.mega) {
            g2.xp += g1.xp;
            g2.life = Math.max(g2.life, 20);
            xpGems.shift();
          }
        }
        xpGems.push({x:e.x,y:e.y,xp:e.xp*player.xpMultiplier*relicModifiers.xp*player.gemValueMult,life:25,bob:Math.random()*Math.PI*2,mega:isMega,sprite:gemSprite,color:gemColor});
      }
      if (_isChickenEnemy && (!state.chickenKingDefeated || e.type === 'chickenKing')) {
        if (!state.chickenCoinPickups) state.chickenCoinPickups = [];
        const coinVal = e.type === 'chickenKing' ? 2500 : (e.type === 'giantChicken' ? 250 : (e.type === 'rooster' ? 100 : 50));
        let mergedCoin = false;
        const coinMergeR2 = state.chickenCoinPickups.length > 90 ? 3600 : 400;
        for (let ci = state.chickenCoinPickups.length - 1; ci >= 0; ci--) {
          const cp = state.chickenCoinPickups[ci];
          if (!cp) continue;
          const cdx = cp.x - e.x, cdy = cp.y - e.y;
          if (cdx * cdx + cdy * cdy < coinMergeR2) {
            cp.value = (cp.value || 50) + coinVal;
            cp.life = Math.max(cp.life || 45, 45);
            mergedCoin = true;
            break;
          }
        }
        if (!mergedCoin) {
          state.chickenCoinPickups.push({
            x: e.x,
            y: e.y,
            value: coinVal,
            life: 45,
            bob: Math.random() * Math.PI * 2
          });
        }
      }
      kills++;
      if(state.isInDream || (e.type && e.type.startsWith('dream_'))){
        state.dreamKills = (state.dreamKills || 0) + 1;
        const prevUnlocked = Math.min(41, Math.max(1, 1 + Math.floor((state.dreamKills - 1) / 2)));
        const newUnlocked = Math.min(41, Math.max(1, 1 + Math.floor(state.dreamKills / 2)));

        // Awakening progress calculation (Wake-Up Alarm: +5, Potion of Sleep: +50%)
        let awkGain = 1.025;
        if(state.dreamRelics && state.dreamRelics.includes('wake_alarm')){
          awkGain += 5.0;
        }
        if(state.dreamRelics && state.dreamRelics.includes('potion_sleep')){
          awkGain *= 1.5;
        }
        state.awakeningProgress = Math.min(100, (state.awakeningProgress || 0) + awkGain);

        if(newUnlocked > prevUnlocked){
          const newMobId = `dream_mob_${String(newUnlocked).padStart(2, '0')}`;
          const a = Math.random() * Math.PI * 2;
          const d = 260 + Math.random() * 80;
          spawnEnemyAt(player.x + Math.cos(a) * d, player.y + Math.sin(a) * d, newMobId);
          spawnDamageNumber(player.x + player.w/2, player.y - 30, `+ NEW MOB #${newUnlocked}!`, '#ba68c8');
        } else {
          spawnDamageNumber(e.x, e.y - 20, `+${Math.round(awkGain)}% AWAKE`, '#00e5ff');
        }

        // Drop Dream Coins (+10 Dream Coins per mob kill)
        if(!state.dreamCoinPickups) state.dreamCoinPickups = [];
        state.dreamCoinPickups.push({
          x: e.x,
          y: e.y,
          value: 10,
          life: 40,
          bob: Math.random() * Math.PI * 2
        });

        // Dream Leech upgrade check
        if(player.dreamLeech && player.dreamLeech > 0 && player.hp < player.maxHp){
          player.hp = Math.min(player.maxHp, player.hp + player.dreamLeech);
          spawnDamageNumber(player.x + player.w/2, player.y - 15, `+${player.dreamLeech} HP`, '#69f0ae');
        }

        // Dream Relic drop check (Lucid Pillow: +20% drop rate)
        const baseDropRate = 0.08;
        const dropMult = (state.dreamRelics && state.dreamRelics.includes('lucid_pillow')) ? 1.2 : 1.0;
        if(Math.random() < baseDropRate * dropMult){
          let relicId = null;
          // Lucid Bell: 1% rare drop and only after 60s survived
          const canDropBell = (state.dreamTimer || 0) >= 60;
          if(canDropBell && Math.random() < 0.01){
            relicId = 'lucid_bell';
          } else {
            const nonBellPool = DREAM_RELICS.filter(r => r.id !== 'lucid_bell');
            const picked = nonBellPool[Math.floor(Math.random() * nonBellPool.length)];
            relicId = picked.id;
          }
          const relicDef = DREAM_RELICS_MAP[relicId];
          if(relicDef){
            if(!state.dreamRelicPickups) state.dreamRelicPickups = [];
            state.dreamRelicPickups.push({
              x: e.x,
              y: e.y,
              relicId,
              sprite: relicDef.sprite,
              name: relicDef.name,
              desc: relicDef.desc,
              life: 45,
              bob: Math.random() * Math.PI * 2
            });
            spawnParticles(e.x, e.y, '#ba68c8', 12);
          }
        }

        if(state.awakeningProgress >= 100 && typeof window.exitDream === 'function'){
          window.exitDream(false);
        }
      }
      // Bloodlust ability
      if(player.abilities && player.abilities.includes('bloodlust')){
        player.bloodlustStacks = (player.bloodlustStacks || 0) + 1;
        player.damageMultiplier = (player.damageMultiplier || 1) * 1.01;
        if(player.bloodlustStacks % 10 === 0){
          spawnDamageNumber(player.x + player.w/2, player.y - 40, `+${player.bloodlustStacks}% DMG`, '#ff0000');
        }
      }
      // Lucky Drop ability
      if(player.abilities && player.abilities.includes('lucky_drop') && Math.random() < 0.20 && !_isChickenEnemy){
        if(!merged)xpGems.push({x:e.x,y:e.y,xp:e.xp*player.xpMultiplier*relicModifiers.xp*player.gemValueMult,life:25,bob:Math.random()*Math.PI*2,mega:isMega,sprite:gemSprite,color:gemColor});
      }
        campSave.bestiary = campSave.bestiary || {};
        campSave.bestiary[e.type] = (campSave.bestiary[e.type] || 0) + 1;
        campSave.discovered = campSave.discovered || {};
        campSave.discovered[e.type] = true;
        if(e.type === 'plainsBoss') { campSave.discovered['bloodLord'] = true; campSave.bestiary['bloodLord'] = (campSave.bestiary['bloodLord'] || 0) + 1; }
        if(e.type === 'bloodLord') { campSave.discovered['plainsBoss'] = true; campSave.bestiary['plainsBoss'] = (campSave.bestiary['plainsBoss'] || 0) + 1; }
      // In-run Gold from Kills
      let goldDrop = 0;
      if(ENEMY_TYPES[e.type]?.boss) {
        if(window.IS_DEMO && !window._demoVictoryTriggered) {
          window._demoVictoryTriggered = true;
          setTimeout(() => {
            if(typeof window.showDemoVictoryModal === 'function') {
              window.showDemoVictoryModal(e);
            }
          }, 2400);
        }
        const _bossBn = biomeAt(Math.floor((e.x + (e.w||32)/2)/TILE), Math.floor((e.y + (e.h||32)/2)/TILE)) || 'plains';
        spawnedBossBiomes.add(_bossBn);
        goldDrop = Math.floor((60 + Math.random() * 40) * (player.goldFindMult || 1));
      } else if(e.ultraElite) {
        goldDrop = Math.floor((45 + Math.random() * 30) * (player.goldFindMult || 1));
      } else if(e.isHunter) {
        goldDrop = Math.floor((25 + Math.random() * 20) * (player.goldFindMult || 1));
      } else if(e.elite) {
        goldDrop = Math.floor((12 + Math.random() * 15) * (player.goldFindMult || 1));
      } else if(Math.random() < 0.22) {
        goldDrop = Math.floor((1 + Math.random() * 2) * (player.goldFindMult || 1));
      }
      if(goldDrop > 0){
        campSave.gold += goldDrop;
        if(questProgress.goldAccumulated !== undefined) questProgress.goldAccumulated += goldDrop;
      }

      // Consumable Food Drops (Fish +20 HP, Steak +45 HP, Ham +85 HP)
      if(!_isChickenEnemy && !state.isInDream){
        if(!state.foodPickups) state.foodPickups = [];
        const isBoss = Boolean(ENEMY_TYPES[e.type]?.boss);
        const isElite = Boolean(e.elite || e.ultraElite);
        const isBossMinion = Boolean(e.isBossMinion);
        const isCasual = (typeof window !== 'undefined' && window.GAME_SETTINGS?.difficulty === 0);
        const foodRoll = Math.random();
        const dropThreshold = (isBoss || isBossMinion) ? 1.0 : (isElite ? (isCasual ? 0.65 : 0.40) : (isCasual ? 0.085 : 0.045));
        if(foodRoll < dropThreshold){
          const typeRoll = Math.random();
          let fType, fHp, fName;
          if(isBoss){
            if(typeRoll < 0.50){
              fType = 'food_steak'; fHp = 45; fName = 'Heart Steak';
            } else {
              fType = 'food_ham'; fHp = 85; fName = 'Roasted Ham';
            }
          } else {
            if(typeRoll < 0.60){
              fType = 'food_fish'; fHp = 20; fName = 'Grilled Fish';
            } else if(typeRoll < 0.90){
              fType = 'food_steak'; fHp = 45; fName = 'Heart Steak';
            } else {
              fType = 'food_ham'; fHp = 85; fName = 'Roasted Ham';
            }
          }
          state.foodPickups.push({
            x: e.x,
            y: e.y,
            type: fType,
            sprite: fType,
            hp: fHp,
            name: fName,
            life: 45,
            bob: Math.random() * Math.PI * 2
          });
        }
      }

      // Chicken Dimension Mob Drops (chickenLeg 10%, goldenFeather 15%, eggBomb 20%)
      if(!state.chickenPickups) state.chickenPickups = [];
      if(e.type === 'chicken' && Math.random() < 0.10){
        state.chickenPickups.push({ x: e.x, y: e.y, type: 'chickenLeg', sprite: 'chickenLeg', life: 35, bob: Math.random() * Math.PI * 2 });
      } else if(e.type === 'rooster' && Math.random() < 0.15){
        state.chickenPickups.push({ x: e.x, y: e.y, type: 'goldenFeather', sprite: 'goldenFeather', life: 35, bob: Math.random() * Math.PI * 2 });
      } else if(e.type === 'giantChicken' && Math.random() < 0.20){
        state.chickenPickups.push({ x: e.x, y: e.y, type: 'eggBomb', sprite: 'eggBomb', life: 35, bob: Math.random() * Math.PI * 2 });
      }

      // Quest & Legendary Set Drops
      if(e.elite && !_isChickenEnemy) {
        questProgress.elites++;
        if(Math.random() < 0.12) spawnLegendaryPieceDrop(e.x, e.y);
        if(Math.random() < 0.35) {
          const matRoll = Math.random();
          if (matRoll < 0.50) {
            addMaterialDrop('goldOre', 1, 'Elite Monster');
          } else if (matRoll < 0.80) {
            addMaterialDrop('dwarvenSteel', 1, 'Elite Monster');
          } else {
            addMaterialDrop('cosmicDust', 1, 'Elite Monster');
          }
        }
      }
      if(e.ultraElite) {
        if(Math.random() < 0.5) spawnLegendaryPieceDrop(e.x, e.y);
        if(e.type === 'treant') {
          addMaterialDrop('ancientBark', 2, 'ANCIENT TREANT');
        } else if(e.type === 'sporeKing') {
          addMaterialDrop('cosmicDust', 2, 'SPORE EMPEROR');
        } else if(e.type === 'graveLord') {
          addMaterialDrop('dwarvenSteel', 2, 'GRAVE TYRANT');
        } else if(e.type === 'banditWarlord') {
          addMaterialDrop('goldOre', 3, 'WARLORD CHIEFTAIN');
        }
      }
      if(ENEMY_TYPES[e.type]?.boss) {
        questProgress.bosses++;
        if(!campSave.defeatedBossBiomes) campSave.defeatedBossBiomes = [];
        const bn = biomeAt(Math.floor(e.x/TILE), Math.floor(e.y/TILE));
        if(!campSave.defeatedBossBiomes.includes(bn)){
          campSave.defeatedBossBiomes.push(bn);
          saveCamp();
        }
        spawnLegendaryPieceDrop(e.x, e.y);

        // Materials System Drops (Phase 1)
        if(e.type === 'voidGod') {
          addMaterialDrop('voidEssence', 1, 'VOID GOD');
        } else if(e.type === 'abyss_octopus') {
          addMaterialDrop('abyssalHeart', 1, 'KRAKEN'); campSave.hasAbyssalHeart = true; if(!(typeof window !== 'undefined' && window.IS_DEMO)) campSave.secret2Stage = Math.max(campSave.secret2Stage || 0, 1); saveCamp();
          unlockLore('clues', 'c_abyss_key');
          unlockLore('clues', 'c_abyss_kraken');
          unlockLore('symbols', 's_eye_of_abyss');
          unlockLore('stories', 'st_drowned_kingdom');
          showDropToast((typeof window !== 'undefined' && window.IS_DEMO) ? "Kraken vanquished! Inscription revealed: 'Seek the Frozen Titan atop the Blizzard Peaks...'" : "Kraken vanquished! Bring the Abyssal Heart to Commander Alden in Mountain 5 (Frostpeak Hollow)!", '#00e5ff');
        } else if(e.type === 'phoenix') {
          addMaterialDrop('phoenixFeather', 1, 'PHOENIX');
        } else if(e.type === 'iceTitan') {
          addMaterialDrop('frozenCore', 1, 'ICE TITAN'); campSave.hasFrozenCore = true; if(e.isSecret2Titan && !(typeof window !== 'undefined' && window.IS_DEMO)) { campSave.secret2Complete = true; campSave.secret2Stage = 3; campSave.mountainSealsBroken = Math.max(campSave.mountainSealsBroken || 0, 1); campSave.gold = (campSave.gold || 0) + 500; addMaterialDrop('frozenCore', 1, 'FROSTPEAK SEAL'); unlockLore('clues', 'c_frostpeak_seal'); unlockLore('stories', 'st_fifth_seal'); saveCamp(); showDropToast("❄️ SECRET 2 COMPLETE! Frostpeak Seal (1/5) Shattered! +500g · Speak to Alden!", '#4fc3f7'); }

          // ❄️ Mask of Calm Boss Reward:
          unlockLore('clues', 'c_mask_of_calm');

          // 1. Add to active in-run Relic Inventory & auto-equip
          const maskRelic = {
            id: 'relic_mask_of_calm',
            name: 'Mask of Calm',
            tier: 'legendary',
            tierLabel: 'Legendary Relic',
            sprite: 'Mask_Of_Calm',
            color: '#64b5f6',
            xp: 1500,
            effect: {
              label: 'Pacifies all wild beasts and grants absolute peace (Worn)',
              power: 'calm'
            },
            duration: 999999,
            attackTimer: 0
          };
          if (!relicJournalIds.has('relic_mask_of_calm')) {
            relicJournalIds.add('relic_mask_of_calm');
            relicJournal.push(maskRelic);
            saveRelicJournal(relicJournal);
          }
          if (!equippedRelicIds.includes('relic_mask_of_calm')) {
            const emptySlot = equippedRelicIds.findIndex(s => s === null);
            const slotToUse = emptySlot !== -1 ? emptySlot : 0;
            equippedRelicIds[slotToUse] = 'relic_mask_of_calm';
            saveEquippedRelics(equippedRelicIds);
          }

          // 2. Activate calm state & notifications
          maskOfCalmActive = true;
          showDropToast("❄️ You found the Mask of Calm! (Check your Lore Journal)", '#64b5f6');
          playSfx('buff');
          spawnDamageNumber(player.x + player.w/2, player.y - 20, 'MASK OF CALM EQUIPPED', '#64b5f6');
          spawnParticles(player.x + player.w/2, player.y + player.h/2, '#64b5f6', 25);
          recomputeRelicModifiers();
          renderInventory();
        } else if(e.type === 'treant') {
          addMaterialDrop('ancientBark', 2, 'ANCIENT TREANT');
        } else if(e.type === 'plainsBoss' || e.type === 'bloodLord') {
          addMaterialDrop('ancientBark', 2, e.type === 'plainsBoss' ? 'ELDER ROOT' : 'BLOOD LORD');
        } else if(e.type === 'lichKing') {
          addMaterialDrop('cosmicDust', 2, 'LICH KING');
        } else if(e.type === 'pharaoh') {
          addMaterialDrop('goldOre', 3, 'PHARAOH');
        } else if(e.type === 'swampHorror') {
          addMaterialDrop('ancientBark', 2, 'SWAMP HORROR');
        } else if(e.type === 'vampireLord') {
          addMaterialDrop('voidEssence', 1, 'VAMPIRE LORD');
        } else if(e.type === 'stoneColossus') {
          addMaterialDrop('dwarvenSteel', 2, 'STONE COLOSSUS');
        } else if(e.type === 'crystalBeholder') {
          addMaterialDrop('cosmicDust', 2, 'CRYSTAL BEHOLDER');
        } else if(e.type === 'caveWyrm') {
          addMaterialDrop('dwarvenSteel', 3, 'CAVE WYRM');
        } else if(e.type === 'lavaTitan') {
          addMaterialDrop('phoenixFeather', 1, 'LAVA WYRM');
        } else if(e.type === 'chickenKing') {
          // 1. Golden Egg bonus (+5 Max HP permanent on first defeat / up to 5 stacks max)
          const curEggStacks = Number(campSave.goldenEggStacks) || 0;
          if (curEggStacks < 5) {
            campSave.goldenEggStacks = curEggStacks + 1;
            campSave.permHpBonus = (campSave.permHpBonus || 0) + 5;
            player.maxHp += 5;
            player.hp = Math.min(player.maxHp, player.hp + 5);
            spawnDamageNumber(player.x + player.w/2, player.y - 36, `+5 PERM MAX HP (${campSave.goldenEggStacks}/5 EGGS)!`, '#ffd700');
          }

          // 2. Chicken Crown (100% cosmetic unlock + Royal drops, stat bonus capped at 3 stacks)
          campSave.unlockedChickenCrown = true;
          campSave.equippedChickenCrown = true;
          grantAchievementReward('chickenKingSlayer');
          addMaterialDrop('chickenKingCrown', 1, 'CHICKEN KING');
          addMaterialDrop('chickenCoin', 1, 'CHICKEN KING');
          showDropToast('👑 Unlocked Cosmetic: Chicken Crown! (Equip/Toggle in Camp Inventory)', '#ffd700', 'chickenCrown');

          // Activate & spawn the Return Portal back to the Plains
          state.chickenKingDefeated = true;
          const portalWx = Math.floor(e.x / TILE), portalWy = Math.floor(e.y / TILE);
          const portalChunk = chunks.get(chunkKey(Math.floor(portalWx / CHUNK_SIZE), Math.floor(portalWy / CHUNK_SIZE)));
          if (portalChunk && portalChunk.tall && !portalChunk.tall.some(t => t.featureType === 'chickenReturnPortal')) {
            portalChunk.tall.push({
              x: portalWx * TILE + TILE / 2,
              y: portalWy * TILE + TILE,
              sprite: 'chicken_portal',
              scale: 1.0,
              isFeature: true,
              featureType: 'chickenReturnPortal',
              tx: portalWx,
              ty: portalWy
            });
          }
          showDropToast('🌀 The Chicken King has fallen! The Return Portal to the Plains has opened!', '#88ff88', 'chicken_portal');

          // 3. Chicken Feather (50% drop, +1% Move Speed permanent, max 5)
          if(Math.random() < 0.50){
            addMaterialDrop('chickenFeather', 1, 'CHICKEN KING');
            const curFeathers = Number(campSave.chickenFeathers) || 0;
            if(curFeathers < 5){
              campSave.chickenFeathers = curFeathers + 1;
              campSave.permSpeedBonus = (campSave.permSpeedBonus || 0) + 0.01;
              player.speed *= 1.01;
              showDropToast(`🪶 Chicken Feather! +1% Permanent Move Speed (${campSave.chickenFeathers}/5)`, '#ffca28', 'chickenFeather');
            }
          }
          unlockLore('clues', 'c_chicken_shrine');
          unlockLore('journals', 'j_chicken_dimension');
          saveCamp();
        }
      }

      // Solar Archon 3-Piece: Supernova on enemy defeat
      if(player.solarArchon3pc){
        spawnParticles(e.x, e.y, '#ff9800', 16);
        forEachEnemyNear(e.x, e.y, 85, nearby => {
          if(nearby.hp > 0 && (nearby.x - e.x)**2 + (nearby.y - e.y)**2 < 85*85){
            damageEnemy(nearby, 150, { noProc: true });
          }
        });
      }
      if(player.lifestealStacks>0){player.lifestealProgress++;if(player.lifestealProgress>=3){player.lifestealProgress-=3;player.hp=Math.min(player.maxHp,player.hp+player.lifestealStacks);}}
      if(isNight()){ killsAtNight++; questProgress.nightKills = killsAtNight; }
      if(ENEMY_TYPES[e.type] && ENEMY_TYPES[e.type].water){ killsByWater++; questProgress.waterKills = killsByWater; }
      if(ENEMY_TYPES[e.type] && ENEMY_TYPES[e.type].boss)bossKills++;
      if(e.frozen || (e.frozenTimer && e.frozenTimer > 0) || (e.freezeTimer && e.freezeTimer > 0)){
        enemiesFrozenRun++;
        if(playerWeapons.some(w=>w.id==='permafrost')){
          spawnParticles(e.x, e.y, '#00e5ff', 16);
          particles.push({x:e.x, y:e.y, vx:0, vy:0, life:0.35, maxLife:0.35, color:'#80d8ff', explosion:110});
          const shatterDmg = Math.round(180 * (player.damageMultiplier || 1));
          forEachEnemyNear(e.x, e.y, 110, nearby => {
            if(nearby !== e && nearby.hp > 0 && enemyIsRevealed(nearby)){
              damageEnemy(nearby, shatterDmg, {noProc:true});
              spawnParticles(nearby.x, nearby.y, '#80d8ff', 4);
            }
          });
        }
      }
      if(meleeSwings && meleeSwings.length > 0) meleeKillsRun++; else rangedKillsRun++;
      if(e.type==='vampire'||e.type==='vampireLord'){
        vampireKills++;
        questProgress.vampiresRun = (questProgress.vampiresRun || 0) + 1;
      }
      if(e.type==='vampireLord'||e.isVampireLord){
        questProgress.vampireLordKilled = true;
      }
      // Fire kill counting done in fire update via _fireKill
      if(player.activeQuest) {
        if(player.activeQuest.type==='kill_enemies' && !e.boss) player.activeQuest.progress++;
        if(player.activeQuest.type==='kill_elites' && e.elite) player.activeQuest.progress++;
        if(player.activeQuest.type==='kill_boss' && e.boss) player.activeQuest.progress++;
        if(player.activeQuest.type==='defend_traveler' && (e.ambushMob || (e.type && (e.type.startsWith('void') || e.type.startsWith('shadow'))))) player.activeQuest.progress++;
        if(player.activeQuest.progress>=player.activeQuest.goal && !player.activeQuest.notified){
          player.activeQuest.notified = true;
          playSfx('confirm');
          const isAmbush = player.activeQuest.type === 'defend_traveler';
          const toast=document.createElement('div');toast.className='relic-toast';
          toast.style.borderColor=isAmbush?'#00e5ff':'#ffd700';
          toast.style.boxShadow=isAmbush?'0 0 35px rgba(0, 229, 255, 0.9)':'0 0 30px rgba(255, 215, 0, 0.7)';
          toast.innerHTML=isAmbush
            ? `<strong style="color:#00e5ff">VOID AMBUSH SURVIVED!</strong><br/>Return to Caelen to claim the Tidecaller's Conch & Lore Clues!`
            : `<strong style="color:#ffd700">TRAVELER TASK COMPLETE!</strong><br/>Return to the Lost Traveler to claim your reward!`;
          document.getElementById('relicToasts')?.appendChild(toast);
          setTimeout(()=>toast.remove(),5000);
        }
      }

      // If swarm leader dies, kill all members
      if(e.swarmMembers && e.swarmMembers.length > 0){
        for(const member of e.swarmMembers){
          member.hp = 0;
        }
      }
      } else {
        e.deathTimer = (e.deathTimer || 0) - dt;
      }

      if(e.deathTimer <= 0){
        enemies.splice(i,1);
      }
      continue;
    }
    if(!enemyCanAggroPlayer(e))continue;

    // Handle swarm movement - members follow the leader
    if(e.swarmMember && e.leader && e.leader.hp > 0){
      if(e.swarmFormation === 'cross'){
        // Cross formation: rotate based on leader's rotation
        const rotation = e.leader.swarmRotation || 0;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const rotatedX = e.swarmOffsetX * cos - e.swarmOffsetY * sin;
        const rotatedY = e.swarmOffsetX * sin + e.swarmOffsetY * cos;
        e.x = e.leader.x + rotatedX;
        e.y = e.leader.y + rotatedY;
      } else {
        // Default circular formation: members orbit the leader
        const rotationSpeed = 2 * dt;
        e.swarmAngle += rotationSpeed;
        e.x = e.leader.x + Math.cos(e.swarmAngle) * e.swarmRadius;
        e.y = e.leader.y + Math.sin(e.swarmAngle) * e.swarmRadius;
      }
      continue; // Skip normal movement for swarm members
    }

    // Clean up swarm members if leader is dead
    if(e.swarmMember && (!e.leader || e.leader.hp <= 0)){
      e.hp = 0;
      continue;
    }
    if(e.showHpTimer > 0) e.showHpTimer -= dt;
    if(ENEMY_TYPES[e.type]?.boss){
      if(!campSave.discovered?.[e.type]){
        campSave.discovered = campSave.discovered || {};
        campSave.discovered[e.type] = true;
        if(e.type === 'plainsBoss') campSave.discovered['bloodLord'] = true;
        if(e.type === 'bloodLord') campSave.discovered['plainsBoss'] = true;
        saveCamp();
      }
      if(!e.introShown&&bossIntro.timer<=0&&playerCanSeeEnemy(e)){
        e.introShown=true;
        startBossIntro(e);
        return;
      }
    }

    // Water transition (evaluated at enemy FEET, with shore smoothing and flying checks)
    const footX = Math.floor((e.x + (e.w || 24) * 0.5) / TILE);
    const footY = Math.floor((e.y + (e.h || 24) - 4) / TILE);
    const eInDungeon = (footX > 100000 && footX < 300000);
    if (e._wtx !== footX || e._wty !== footY) {
      e._wtx = footX; e._wty = footY;
      if (isFlyingEnemy(e)) {
        e.inWater = 0;
      } else {
        let wd = eInDungeon ? (window.isWaterTile(footX, footY) ? 2 : 0) : (typeof tileAtWorld === 'function' ? tileAtWorld(footX, footY) : 0);
        // Shore smoothing: if adjacent to land, cap deep water to shallow
        if (wd === 2 && typeof tileAtWorld === 'function') {
          const hasLand = (tileAtWorld(footX + 1, footY) === 0 || tileAtWorld(footX - 1, footY) === 0 || tileAtWorld(footX, footY + 1) === 0 || tileAtWorld(footX, footY - 1) === 0);
          if (hasLand) wd = 1;
        }
        e.inWater = wd;
      }
      if(e.inWater!==e.wasInWater){
        if(e.inWater>0 && !isFlyingEnemy(e)) spawnSplash(e.x + (e.w || 24) * 0.5, e.y + (e.h || 24) - 2, e.w > 35);
        e.wasInWater=e.inWater;
      }
    }

    // Boss Phases
    
      if (e.hp > 0 && ENEMY_TYPES[e.type] && ENEMY_TYPES[e.type].shooter && !e.boss) {
          if (e.attackTimer === undefined) e.attackTimer = Math.random() * 2 + 1;
          e.attackTimer -= dt;
          if (e.attackTimer <= 0) {
              e.attackTimer = ENEMY_TYPES[e.type].attackRate || 3;
              // Only fire if enemy is alive, revealed to player, and within visible on-screen range (<= 380px)
              if (enemyIsRevealed(e)) {
                  const ex = e.x + (e.w || 28) / 2, ey = e.y + (e.h || 28) / 2;
                  const pdx = (player.x + player.w/2) - ex, pdy = (player.y + player.h/2) - ey;
                  const distSq = pdx*pdx + pdy*pdy;
                  if (distSq < 380 * 380 && distSq > 30 * 30) {
                      const angle = Math.atan2(pdy, pdx);
                      const speed = ENEMY_TYPES[e.type].projSpeed || 3.2;
                      const pSprite = ENEMY_TYPES[e.type].projSprite || 'bolt';
                      const isArrow = (pSprite === 'arrow');
                      projectiles.push({
                          x: ex, y: ey,
                          vx: Math.cos(angle) * speed,
                          vy: Math.sin(angle) * speed,
                          damage: Math.round(e.damage || 10),
                          pierce: 0,
                          life: 2.8,
                          sprite: pSprite,
                          w: isArrow ? 26 : 14,
                          h: isArrow ? 10 : 14,
                          angle: angle,
                          enemyShot: true,
                          shooterType: e.type
                      });
                      playSfx('attack');
                  }
              }
          }
      }
      
      if (e.boss) {
        const hpPercent = e.hp / e.maxHp;
        let newPhase = 1;
        if (hpPercent <= 0.33) newPhase = 3;
        else if (hpPercent <= 0.66) newPhase = 2;

        if (!e.phase) e.phase = 1;

        if (newPhase > e.phase) {
            e.phase = newPhase;
            screenShakeIntensity = Math.max(screenShakeIntensity, e.phase === 3 ? 15 : 10);
            playSfx('boss'); // roar
            e.megaOrbColor = e.phase === 3 ? '#ff0000' : '#ffaa00';
            spawnParticles(e.x, e.y, e.megaOrbColor, 30);
            e.enragePulse = 1.0;
            
            if (e.type === 'abyss_octopus' || e.type === 'Abyssal_kraken') {
              if (e.phase === 2) {
                for (let m = 0; m < 4; m++) {
                  const ma = Math.random() * Math.PI * 2, mr = 80 + Math.random() * 80;
                  spawnEnemyAt(e.x + Math.cos(ma)*mr, e.y + Math.sin(ma)*mr, m % 2 === 0 ? 'abyss_jelly' : 'deep_fish');
                }
              } else if (e.phase === 3) {
                for (let m = 0; m < 6; m++) {
                  const ma = Math.random() * Math.PI * 2, mr = 90 + Math.random() * 90;
                  const mType = m % 3 === 0 ? 'abyss_squid' : (m % 3 === 1 ? 'spike_fish' : 'bone_fish');
                  spawnEnemyAt(e.x + Math.cos(ma)*mr, e.y + Math.sin(ma)*mr, mType);
                }
              }
            } else if (e.type === 'chickenKing') {
              if (e.phase === 2) {
                showDropToast('🐔 CHICKEN KING PHASE 2: Speed +25% & Royal Flock Summoned!', '#ffca28');
                for (let m = 0; m < 6; m++) {
                  const ma = (m / 6) * Math.PI * 2, mr = 75 + Math.random() * 45;
                  spawnEnemyAt(e.x + Math.cos(ma) * mr, e.y + Math.sin(ma) * mr, m % 3 === 0 ? 'rooster' : 'chicken');
                }
              } else if (e.phase === 3) {
                showDropToast('🔥 CHICKEN KING ENRAGED (PHASE 3): Speed +50% & Egg Bombardment!', '#ff5252');
                for (let m = 0; m < 8; m++) {
                  const ma = (m / 8) * Math.PI * 2, mr = 85 + Math.random() * 55;
                  const mType = m === 0 ? 'giantChicken' : (m % 2 === 0 ? 'rooster' : 'chicken');
                  spawnEnemyAt(e.x + Math.cos(ma) * mr, e.y + Math.sin(ma) * mr, mType);
                }
              }
            } else if (e.phase === 3) {
                const minionType = ENEMY_TYPES[e.type].summonMinions || 'slime';
                for(let m=0; m<5; m++) {
                    const ma = Math.random()*Math.PI*2, mr = 50 + Math.random()*50;
                    const sm = spawnEnemyAt(e.x + Math.cos(ma)*mr, e.y + Math.sin(ma)*mr, minionType);
                    if (sm) sm.isBossMinion = true;
                }
            }
            if (e.phase === 2 && (e.type === 'plainsBoss' || e.type === 'bloodLord')) {
                for(let m=0; m<3; m++) {
                    const ma = Math.random()*Math.PI*2, mr = 60 + Math.random()*40;
                    const sm = spawnEnemyAt(e.x + Math.cos(ma)*mr, e.y + Math.sin(ma)*mr, 'slime');
                    if (sm) sm.isBossMinion = true;
                }
            }
        }
        if (e.enragePulse > 0) e.enragePulse = Math.max(0, e.enragePulse - dt*2);
        
        // Attack Timer for all phases
        const isKrakenBoss = (e.type === 'abyss_octopus' || e.type === 'Abyssal_kraken');
        if (isKrakenBoss) {
          const pdx = (player.x + player.w/2) - e.x, pdy = (player.y + player.h/2) - e.y;
          const pd = Math.hypot(pdx, pdy) || 1;
          const angle = Math.atan2(pdy, pdx);

          // 1. Abyssal Maelstrom Whirlpool Suction (Phases 2 & 3)
          if (e.phase >= 2 && pd < 680) {
            const pullSpeed = e.phase === 3 ? 1.4 : 0.8;
            player.x -= (pdx / pd) * pullSpeed * dt * 60;
            player.y -= (pdy / pd) * pullSpeed * dt * 60;
            if (Math.random() < 0.4) {
              const bAngle = Math.random() * Math.PI * 2;
              const bDist = 80 + Math.random() * 220;
              spawnParticles(e.x + Math.cos(bAngle)*bDist, e.y + Math.sin(bAngle)*bDist, e.phase === 3 ? '#ff1744' : '#00e5ff', 2);
            }
          }

          // 2. Tentacle Eruption (Crushing Grasp)
          e.tentacleTimer = (e.tentacleTimer || 5.0) - dt;
          if (e.tentacleTimer <= 0) {
            e.tentacleTimer = e.phase === 3 ? 2.8 : (e.phase === 2 ? 4.0 : 5.5);
            window.krakenEruptions = window.krakenEruptions || [];
            const numEruptions = e.phase === 3 ? 8 : (e.phase === 2 ? 5 : 3);
            const warnTime = e.phase === 3 ? 0.85 : (e.phase === 2 ? 1.05 : 1.25);
            for (let k = 0; k < numEruptions; k++) {
              let exPos, eyPos;
              if (e.phase === 3) {
                const ringAngle = (k / numEruptions) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
                const ringR = 80 + Math.random() * 50;
                exPos = player.x + player.w/2 + Math.cos(ringAngle) * ringR;
                eyPos = player.y + player.h/2 + Math.sin(ringAngle) * ringR;
              } else if (k === 0) {
                exPos = player.x + player.w/2 + (player.lastMoveX || 0) * 80;
                eyPos = player.y + player.h/2 + (player.lastMoveY || 0) * 80;
              } else {
                const fa = Math.random() * Math.PI * 2;
                const fr = 50 + Math.random() * 110;
                exPos = player.x + player.w/2 + Math.cos(fa) * fr;
                eyPos = player.y + player.h/2 + Math.sin(fa) * fr;
              }
              window.krakenEruptions.push({
                x: exPos, y: eyPos, radius: 46, timer: warnTime, maxTimer: warnTime, damage: 32 + (e.phase * 8), erupted: false, linger: 0
              });
            }
            playSfx('attack');
          }

          // 3. Black Ink Cloud (Phases 2 & 3)
          if (e.phase >= 2) {
            e.inkCloudTimer = (e.inkCloudTimer || 8.0) - dt;
            if (e.inkCloudTimer <= 0) {
              e.inkCloudTimer = e.phase === 3 ? 6.0 : 8.0;
              window.krakenInkClouds = window.krakenInkClouds || [];
              window.krakenInkClouds.push({
                x: e.x, y: e.y, radius: e.phase === 3 ? 320 : 250, life: 6.5, maxLife: 6.5
              });
              spawnParticles(e.x, e.y, '#050b14', 35);
              playSfx('boss');
            }
          }

          // 4. Tidal Hydro Projectiles
          e.attackTimer = (e.attackTimer || 2.5) - dt;
          if (e.attackTimer <= 0) {
            e.attackTimer = e.phase === 3 ? 1.1 : (e.phase === 2 ? 1.6 : 2.4);
            if (e.phase === 1) {
              for (let off of [-0.15, 0.15]) {
                projectiles.push({
                  x: e.x, y: e.y,
                  vx: Math.cos(angle + off) * 4.6, vy: Math.sin(angle + off) * 4.6,
                  damage: e.damage, pierce: 0, life: 4,
                  sprite: 'rpg_bottle_water', w: 18, h: 18, angle: angle + off,
                  enemyShot: true
                });
              }
            } else if (e.phase === 2) {
              for (let i = 0; i < 8; i++) {
                const ringA = angle + (i / 8) * Math.PI * 2;
                projectiles.push({
                  x: e.x, y: e.y,
                  vx: Math.cos(ringA) * 5.2, vy: Math.sin(ringA) * 5.2,
                  damage: e.damage, pierce: 0, life: 3.5,
                  sprite: 'rpg_bottle_water', w: 18, h: 18, angle: ringA,
                  enemyShot: true
                });
              }
            } else {
              for (let i = 0; i < 16; i++) {
                const ringA = (i / 16) * Math.PI * 2;
                projectiles.push({
                  x: e.x, y: e.y,
                  vx: Math.cos(ringA) * 6.5, vy: Math.sin(ringA) * 6.5,
                  damage: e.damage, pierce: 0, life: 3.8,
                  sprite: 'rpg_bottle_water', w: 18, h: 18, angle: ringA,
                  enemyShot: true
                });
              }
              projectiles.push({
                x: e.x, y: e.y,
                vx: Math.cos(angle) * 8.5, vy: Math.sin(angle) * 8.5,
                damage: Math.round(e.damage * 1.25), pierce: 0, life: 3.0,
                sprite: 'rpg_abyssalHeart', w: 22, h: 22, angle: angle,
                enemyShot: true
              });
            }
            playSfx('attack');
          }
        } else if (e.phase >= 1) {
            if (!e.attackTimer) e.attackTimer = 2.5;
            e.attackTimer -= dt;
            const pdxPre = (player.x+player.w/2) - e.x, pdyPre = (player.y+player.h/2) - e.y;
            const anglePre = Math.atan2(pdyPre, pdxPre);
            if (e.attackTimer > 0 && e.attackTimer < 0.75 && (e.type === 'plainsBoss' || e.type === 'bloodLord')) {
              e.windupTelegraph = true;
              e.telegraphAngle = anglePre;
            } else if (e.attackTimer <= 0) {
              e.windupTelegraph = false;
            }
            if (e.attackTimer <= 0 && (!e.frozen || e.frozenTimer <= 0)) {
                e.attackTimer = e.phase === 3 ? 1.0 : (e.phase === 2 ? 1.5 : 2.5);
                const pdx = (player.x+player.w/2) - e.x, pdy = (player.y+player.h/2) - e.y;
                const pd = Math.hypot(pdx, pdy) || 1;
                const angle = Math.atan2(pdy, pdx);

                let speed = e.phase === 3 ? 8 : 6;
                let sprite = 'bolt';
                let w = 16, h = 16;
                let numProjectiles = 1;
                let spread = 0;

                switch(e.type) {
                      case 'iceTitan':
                          sprite = 'rpg_gem_blue'; numProjectiles = e.phase === 3 ? 5 : (e.phase === 2 ? 3 : 1); spread = 0.6; speed = e.phase === 1 ? 3 : 4.5; break;
                      case 'phoenix':
                          sprite = 'rpg_fireSprite'; numProjectiles = e.phase === 3 ? 5 : (e.phase === 2 ? 3 : 1); spread = 1.0; speed = e.phase === 1 ? 4 : 7; break;
                      case 'pharaoh':
                          sprite = 'rpg_gem_ruby'; numProjectiles = e.phase === 3 ? 4 : (e.phase === 2 ? 2 : 1); spread = 0.3; speed = e.phase === 1 ? 6 : 12; break;
                      case 'swampHorror':
                          sprite = 'rpg_potion_green'; numProjectiles = e.phase === 3 ? 12 : (e.phase === 2 ? 8 : 4); spread = Math.PI * 2; speed = 3.5; break;
                      case 'lichKing':
                          sprite = 'orb'; numProjectiles = e.phase === 3 ? 4 : (e.phase === 2 ? 3 : 1); spread = 0.4; speed = e.phase === 1 ? 5 : 8; break;
                      case 'vampireLord':
                          sprite = 'rpg_batVampire'; numProjectiles = e.phase === 3 ? 5 : (e.phase === 2 ? 3 : 1); spread = 1.2; speed = 6; w=16; h=12; break;
                      case 'treant':
                      case 'plainsBoss':
                      case 'bloodLord':
                          sprite = 'rpg_gem_green'; numProjectiles = e.phase === 3 ? 5 : (e.phase === 2 ? 3 : 1); spread = 0.8; speed = 5; break;
                      case 'crystalGuardian':
                          sprite = 'rpg_gem_diamond'; numProjectiles = e.phase === 3 ? 8 : (e.phase === 2 ? 4 : 2); spread = Math.PI*2; speed = 6; w=14; h=14; break;
                      case 'sporeKing':
                          sprite = 'rpg_potion_green'; numProjectiles = e.phase === 3 ? 6 : (e.phase === 2 ? 3 : 1); spread = 0.8; speed = 5; w=16; h=16; break;
                      case 'graveLord':
                          sprite = 'rpg_demon_skull'; numProjectiles = e.phase === 3 ? 3 : (e.phase === 2 ? 2 : 1); spread = 0.4; speed = 7; w=16; h=16; break;
                      case 'banditWarlord':
                          sprite = 'rpg_coin_gold'; numProjectiles = e.phase === 3 ? 5 : (e.phase === 2 ? 3 : 1); spread = 0.6; speed = e.phase === 1 ? 5 : 9; w=12; h=12; break;
                      case 'voidGod':
                          sprite = 'rpg_crystal_purple'; numProjectiles = e.phase === 3 ? 12 : (e.phase === 2 ? 8 : 4); spread = Math.PI*2; speed = 8; w=20; h=20; break;
                      case 'chickenKing':
                          sprite = 'goldenFeather';
                          numProjectiles = e.phase === 3 ? 10 : (e.phase === 2 ? 5 : 3);
                          spread = e.phase === 3 ? Math.PI * 2 : (e.phase === 2 ? 0.95 : 0.55);
                          speed = e.phase === 3 ? 7.5 : (e.phase === 2 ? 6.2 : 5.0);
                          w = 20; h = 20;
                          if (e.phase >= 2) {
                            e.chickenSummonCount = (e.chickenSummonCount || 0) + 1;
                            if (e.chickenSummonCount % 2 === 0) {
                              for (let cm = 0; cm < (e.phase === 3 ? 3 : 2); cm++) {
                                const cma = Math.random() * Math.PI * 2;
                                spawnEnemyAt(e.x + Math.cos(cma) * 70, e.y + Math.sin(cma) * 70, 'chicken');
                              }
                            }
                          }
                          if (e.phase === 3) {
                            window.krakenEruptions = window.krakenEruptions || [];
                            for (let eb = 0; eb < 4; eb++) {
                              const ba = (eb / 4) * Math.PI * 2 + Math.random() * 0.5;
                              const br = 45 + Math.random() * 95;
                              window.krakenEruptions.push({
                                x: player.x + player.w/2 + Math.cos(ba) * br,
                                y: player.y + player.h/2 + Math.sin(ba) * br,
                                radius: 48,
                                timer: 0.95,
                                maxTimer: 0.95,
                                damage: 50,
                                erupted: false,
                                linger: 0,
                                isEggBombardment: true
                              });
                            }
                          }
                          break;
                      default:
                          numProjectiles = e.phase === 3 ? 3 : (e.phase === 2 ? 2 : 1); spread = 0.5; break;
                  }

                for(let i=0; i<numProjectiles; i++) {
                    const offsetAngle = numProjectiles === 1 ? angle : (spread === Math.PI * 2) 
                        ? angle + (i/numProjectiles)*Math.PI*2 
                        : angle - spread/2 + (i/(numProjectiles-1))*spread;
                    projectiles.push({
                        x: e.x, y: e.y, vx: Math.cos(offsetAngle)*speed, vy: Math.sin(offsetAngle)*speed,
                        damage: e.damage, pierce: 0, life: 3.5,
                        sprite: sprite, w: w, h: h, angle: offsetAngle,
                        enemyShot: true
                    });
                }
                playSfx('attack');
            }
        }
    }

    updateEnemyMovement(e, dt, {
      player,
      elapsed,
      chronoStats,
      eInDungeon,
      hasFriendlyFire,
      packCentroids,
      summonedSpirits
    });

    // Treant summons
    if(e.summonTimer>0){
      e.summonTimer-=dt;
      if(e.summonTimer<=0){
        e.summonTimer=11;
        for(let k=0;k<2;k++){
          const a=Math.random()*Math.PI*2;
          spawnEnemyAt(e.x+Math.cos(a)*60,e.y+Math.sin(a)*60,'slime');
        }
      }
    }

    // Attack player
    if(e.swarmMember || ENEMY_TYPES[e.type]?.passive || (e.frozen && e.frozenTimer > 0)) continue; // Swarm, passive, and frozen creatures don't damage player
    if(player.invulnTimer<=0 && hitTest(e.x-e.w/2,e.y-e.h/2,e.w,e.h,player.x,player.y,player.w,player.h)){
      if(Math.random()<player.dodgeChance){player.invulnTimer=.35;spawnDamageNumber(player.x+player.w/2,player.y-10,'DODGE','#8ee7ff');continue;}
      const finalDmg=(e.damage||0)*(1-Math.min(0.85,(player.defense||0)+(activeMount?.defenseBonus||0)));
      const shieldDamage=Math.min(player.shield||0,finalDmg);player.shield-=shieldDamage;const hpDamage=finalDmg-shieldDamage;
      let actualDmg=hpDamage;
      const aldric=companions.find(c=>c.id==='aldric'&&c.hp>0&&!c.downedTimer);
      if(aldric){
        const transfer=Math.min(actualDmg*0.4,aldric.hp);
        aldric.hp-=transfer;actualDmg-=transfer;
      }
      const eDef = ENEMY_TYPES[e.type];
      const isBoss = Boolean(eDef?.boss || e.isBoss);
      const isUltra = Boolean(eDef?.ultraElite || e.ultraElite);
      const srcPrefix = isBoss ? 'boss_' : (isUltra ? 'ultra_' : (e.hordeSpawn ? 'horde_' : 'mob_'));
      const enemySrc = srcPrefix + (e.type || 'unknown');
      applyPlayerDamage(actualDmg, enemySrc, '#ff5252', { rawDmg: (e.damage || 0) });
      player.invulnTimer=.6;
      if(player.thorns > 0){
        const reflectDmg = Math.round(((finalDmg * 0.5) + (player.maxHp * 0.08) + 12) * player.thorns * (player.damageMultiplier || 1));
        damageEnemy(e, reflectDmg, { noProc: true });
        spawnDamageNumber(e.x, e.y - 12, reflectDmg, '#81c784');
        spawnParticles(e.x, e.y, '#81c784', 6);
      }
      if(e.type==='slime'||e.type==='swampHorror'){
        player.poisonStacks=Math.min(3,player.poisonStacks+1);
        player.poisonTimer=Math.max(player.poisonTimer,4);
      }
      if(ENEMY_TYPES[e.type].drain)e.hp=Math.min(e.maxHp,e.hp+e.damage*.5);
      if(player.hp<=0){player.hp=0;gameOver=true;showGameOver();return;}
    }
  }

  // Swamp horror poison aura
  forEachEnemyNear(pcx0, pcy0, 125, e => {
    if(e.type!=='swampHorror'||!enemyCanAggroPlayer(e))return;
    const dx=e.x-pcx0,dy=e.y-pcy0;
    if(dx*dx+dy*dy<120*120&&Math.random()<.6*dt){
      player.poisonStacks=Math.min(3,player.poisonStacks+1);
      player.poisonTimer=Math.max(player.poisonTimer,3);
    }
  });

  // Garlic (with Max HP scaling + repelling knockback pulse)
  const garlic=playerWeapons.find(w=>w.id==='garlic');
  if(garlic && !maskOfCalmActive){
    const stats=scaleWeaponStats(WEAPON_DEFS.garlic.stats(garlic.level));
    const pcx2=player.x+player.w/2,pcy2=player.y+player.h/2;
    const r=stats.radius*player.areaMult;
    const r2=r*r;
    const hpBonus = Math.floor((player.maxHp || 100) * 0.04);
    forEachEnemyNear(pcx2, pcy2, r, e => {
      const dx=e.x-pcx2,dy=e.y-pcy2;
      if(dx*dx+dy*dy<r2){
        e.garlicTick=(e.garlicTick||0)+dt;
        if(e.garlicTick>=.5){
          e.garlicTick=0;
          damageEnemy(e, stats.damage + hpBonus);
          const dist = Math.hypot(dx, dy) || 1;
          e.x += (dx / dist) * 10;
          e.y += (dy / dist) * 10;
          if(Math.random()<0.35) spawnParticles(e.x,e.y,'#dcf8c6',3);
        }
      }
    });
  }

  updateFires(dt);
  // ═══ ORBITALS ═══
for (const w of playerWeapons) {
  if (w.id !== 'orbital') continue;
  const stats = scaleWeaponStats(WEAPON_DEFS.orbital.stats(w.level));
  if (w.angle === undefined) w.angle = 0;
  w.angle += dt * stats.rotationSpeed;
  if (maskOfCalmActive) continue;
  const pcx = player.x + player.w/2, pcy = player.y + player.h/2;
  for (let i = 0; i < stats.count; i++) {
    const a = w.angle + (i * Math.PI * 2 / stats.count);
    const ox = pcx + Math.cos(a) * stats.radius;
    const oy = pcy + Math.sin(a) * stats.radius;
    forEachEnemyNear(ox, oy, 56, e => {
      if (e.hp <= 0) return;
      const dx = e.x - ox, dy = e.y - oy;
      const rr = Math.max(e.w, e.h) * 0.42 + 14;
      if (dx*dx + dy*dy < rr*rr) {
        if (!e.lastOrbHit || elapsed - e.lastOrbHit > 0.4) {
          e.lastOrbHit = elapsed;
          damageEnemy(e, stats.damage);
        }
      }
    });
  }
}

// ═══ MINES ═══
for (let i = mines.length - 1; i >= 0; i--) {
  const m = mines[i];
  m.armTime -= dt;
  m.fuse -= dt;
  m.spin += dt * 3;
  if (maskOfCalmActive) continue;
  if (m.armTime > 0) continue;
  let trigger = false;
  forEachEnemyNear(m.x, m.y, 36, e => {
    if (e.hp <= 0) return;
    if ((e.x - m.x)**2 + (e.y - m.y)**2 < 32*32) { trigger = true; return false; }
  });
  if (trigger || m.fuse <= 0) {
    const mr2 = m.radius * m.radius;
    forEachEnemyNear(m.x, m.y, m.radius, e => {
      if (e.hp <= 0) return;
      if ((e.x - m.x)**2 + (e.y - m.y)**2 < mr2) damageEnemy(e, m.damage);
    });
    particles.push({ x: m.x, y: m.y, vx: 0, vy: 0, life: 0.52, maxLife: 0.52, color: '#ff5722', explosion: m.radius, spriteAnim: 'mine_explosion', frames: 8 });
    spawnParticles(m.x, m.y, '#ff9800', 18);
    mines.splice(i, 1);
  }
}

// ═══ HOLY POOLS ═══
for (let i = holyPools.length - 1; i >= 0; i--) {
  const hp = holyPools[i];
  hp.life -= dt;
  hp.tick -= dt;
  if (hp.tick <= 0) {
    hp.tick = 0.4;
    if (!maskOfCalmActive) {
      const hpr2 = hp.radius * hp.radius;
      forEachEnemyNear(hp.x, hp.y, hp.radius, e => {
        if (e.hp <= 0) return;
        if ((e.x - hp.x)**2 + (e.y - hp.y)**2 < hpr2) damageEnemy(e, hp.damage);
      });
    }
  }
  if (hp.life <= 0) holyPools.splice(i, 1);
}

// ═══ CHAIN VISUALS ═══
for (let i = chainVisuals.length - 1; i >= 0; i--) {
  chainVisuals[i].life -= dt;
  if (chainVisuals[i].life <= 0) chainVisuals.splice(i, 1);
}

// ═══ KRAKEN ERUPTIONS & INK CLOUDS ═══
for (let i = krakenEruptions.length - 1; i >= 0; i--) {
  const er = krakenEruptions[i];
  if (!er.erupted) {
    er.timer -= dt;
    if (er.timer <= 0) {
      er.erupted = true;
      er.linger = 0.55;
      spawnParticles(er.x, er.y, '#00e5ff', 18);
      spawnParticles(er.x, er.y, '#1a237e', 14);
      if (window.GAME_SETTINGS?.screenShake) screenShakeIntensity = Math.max(screenShakeIntensity, 6);
      playSfx('explosion');
      const pdx = (player.x + player.w / 2) - er.x;
      const pdy = (player.y + player.h / 2) - er.y;
      if (pdx * pdx + pdy * pdy < er.radius * er.radius) {
        if (player.invulnTimer <= 0) {
          applyPlayerDamage(er.damage, 'kraken_eruption', '#ff1744');
          player.invulnTimer = 0.7;
          if (window.GAME_SETTINGS?.screenShake) screenShakeIntensity = Math.max(screenShakeIntensity, 9);
          spawnParticles(player.x, player.y, '#ff1744', 12);
        }
      }
    }
  } else {
    er.linger -= dt;
    if (er.linger <= 0) {
      krakenEruptions.splice(i, 1);
    }
  }
}

for (let i = krakenInkClouds.length - 1; i >= 0; i--) {
  const ic = krakenInkClouds[i];
  ic.life -= dt;
  const pdx = (player.x + player.w / 2) - ic.x;
  const pdy = (player.y + player.h / 2) - ic.y;
  if (pdx * pdx + pdy * pdy < ic.radius * ic.radius) {
    player.inkSlowTimer = 0.5;
  }
  if (ic.life <= 0) {
    krakenInkClouds.splice(i, 1);
  }
}

  // XP gems
  const pPickupR = player.pickupRange + relicModifiers.pickupRange;
  const pPickupR2 = pPickupR * pPickupR;
  const seleneBonus = companions.some(c=>c.id==='selene')?1.10:1;
  for(let i=xpGems.length-1;i>=0;i--){
    const g=xpGems[i];
    if(!g){xpGems.splice(i,1);continue;}
    g.life=(Number.isFinite(g.life)?g.life:25)-dt;
    g.bob=(Number.isFinite(g.bob)?g.bob:0)+dt*4;
    const dx=pcx0-g.x,dy=pcy0-g.y;
    const d2=dx*dx+dy*dy;
    if(d2<pPickupR2){
      const d=Math.sqrt(d2)||1;
      g.x+=dx/d*10*dt*60;g.y+=dy/d*10*dt*60;
      if(d<22){
        if(state.isInDream){
          playSfx('pickup');
          xpGems.splice(i,1);
          continue;
        }
        player.xp+=g.xp*seleneBonus*(activeMount?.passiveXpMult||1);
        playSfx('pickup');
        xpGems.splice(i,1);
        checkLevelUp();
        continue;
      }
    }
    if(g.life<=0)xpGems.splice(i,1);
  }

  // Dream Coin Pickups update & collection
  if(state.isInDream && state.dreamCoinPickups && state.dreamCoinPickups.length > 0){
    const pcx = player.x + player.w/2, pcy = player.y + player.h/2;
    const pPickupR = player.pickupRange + (relicModifiers?.pickupRange || 0);
    const pPickupR2 = (pPickupR + 30) * (pPickupR + 30);

    for(let ci = state.dreamCoinPickups.length - 1; ci >= 0; ci--){
      const cp = state.dreamCoinPickups[ci];
      if(!cp) { state.dreamCoinPickups.splice(ci, 1); continue; }
      cp.life -= dt;
      cp.bob = (cp.bob || 0) + dt * 4;
      if(cp.life <= 0){
        state.dreamCoinPickups.splice(ci, 1);
        continue;
      }

      const dx = pcx - cp.x, dy = pcy - cp.y;
      const d2 = dx * dx + dy * dy;
      if(d2 < pPickupR2){
        const d = Math.sqrt(d2) || 1;
        cp.x += (dx / d) * 12 * dt * 60;
        cp.y += (dy / d) * 12 * dt * 60;
      }

      if(d2 < 28 * 28){
        state.dreamCoins = (state.dreamCoins || 0) + (cp.value || 10);
        state.dreamCoinPickups.splice(ci, 1);
        playSfx('pickup');
        spawnDamageNumber(pcx, pcy - 20, `+${cp.value || 10} COINS`, '#ffd700');
        spawnParticles(pcx, pcy, '#ffd700', 8);
      }
    }
  }

  // Dream Shop Interaction Check
  if(state.isInDream && (keys['e'] || keys['KeyE'] || keys['ε'] || keys['Ε'])){
    const shopX = 600000 * TILE, shopY = 600000 * TILE;
    const pDist = Math.hypot((player.x + player.w/2) - shopX, (player.y + player.h/2) - (shopY - 40));
    if(pDist < 240){
      keys['e'] = false; keys['KeyE'] = false; keys['ε'] = false; keys['Ε'] = false;
      openDreamShopModal();
    }
  }

  // Dream Relic Pickups update & collection
  if(state.dreamRelicPickups && state.dreamRelicPickups.length > 0){
    const pcx = player.x + player.w/2, pcy = player.y + player.h/2;
    const pPickupR = player.pickupRange + (relicModifiers?.pickupRange || 0);
    const pPickupR2 = (pPickupR + 30) * (pPickupR + 30);

    for(let pi = state.dreamRelicPickups.length - 1; pi >= 0; pi--){
      const dp = state.dreamRelicPickups[pi];
      if(!dp) { state.dreamRelicPickups.splice(pi, 1); continue; }
      dp.life -= dt;
      dp.bob = (dp.bob || 0) + dt * 3.5;
      if(dp.life <= 0){
        state.dreamRelicPickups.splice(pi, 1);
        continue;
      }

      const dx = pcx - dp.x, dy = pcy - dp.y;
      const d2 = dx * dx + dy * dy;
      if(d2 < pPickupR2){
        const d = Math.sqrt(d2) || 1;
        dp.x += (dx / d) * 11 * dt * 60;
        dp.y += (dy / d) * 11 * dt * 60;
      }

      if(d2 < 28 * 28){
        if(dp.relicId === 'lucid_bell'){
          state.dreamRelicPickups.splice(pi, 1);
          playSfx('relic');
          showDropToast('🔔 You rang the Lucid Bell! Waking up...', '#ffd700');
          if(typeof window.exitDream === 'function'){
            window.exitDream(true);
          }
          break;
        } else {
          if(!state.dreamRelics) state.dreamRelics = [];
          if(state.dreamRelics.length < 4){
            state.dreamRelics.push(dp.relicId);
            state.dreamRelicPickups.splice(pi, 1);
            playSfx('relic');
            spawnDamageNumber(pcx, pcy - 20, `+ ${dp.name}!`, '#ba68c8');
            spawnParticles(pcx, pcy, '#ba68c8', 16);
            showDropToast(`✨ Dream Relic: ${dp.name}`, '#ba68c8');
            if(typeof window.updateDreamRelicHUD === 'function') window.updateDreamRelicHUD();
          } else {
            if(!dp._toastCd || dp._toastCd <= 0){
              spawnDamageNumber(pcx, pcy - 20, 'MAX RELICS (4/4)', '#ff5252');
              dp._toastCd = 1.5;
            } else {
              dp._toastCd -= dt;
            }
          }
        }
      }
    }
  }

  // Particles
  if(particles.length>300)particles.splice(0,particles.length-300);
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;
    p.vx*=.94;p.vy*=.94;
    p.life-=dt;
    if(p.life<=0)particles.splice(i,1);
  }
  // Damage numbers
  for(let i=damageNumbers.length-1;i>=0;i--){
    const d=damageNumbers[i];
    d.y-=40*dt;d.life-=dt;
    if(d.life<=0)damageNumbers.splice(i,1);
  }

  checkAchievements();
  updateHUD();
  syncMusicTrack();
}

document.querySelectorAll('.camp-brand-mark,.camp-tab [data-sprite]').forEach(element=>renderAtlasIcons(element.parentElement));


// ═══════════════════════════════════════════════════════════
// LEVEL UP UI
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// LOOP
// ═══════════════════════════════════════════════════════════
globalThis.__PIXELVIVOR__ = {
  canvas, ctx, TILE, CHUNK_SIZE, CHUNK_PX, ATLAS, FOG_REVEAL_RADIUS,
  player, camera, keys, elapsed, kills, paused, gameOver, gameStarted,
  woodPickups, playerWeapons, equipment, mines,
  fires, burningTrees, lightnings, relicJournalIds, enemyTypes:ENEMY_TYPES, getVisibleChunks, getDaylight, getSunX, isRevealedTile:hasRevealedTile,
  get lightningFlash(){return lightningFlash;},
  get enemies(){return enemies;},get projectiles(){return projectiles;},get xpGems(){return xpGems;},
  get particles(){return particles;},get damageNumbers(){return damageNumbers;},get holyPools(){return holyPools;},
  get chainVisuals(){return chainVisuals;},get companions(){return companions;},get revealedTiles(){return revealedTiles;},get carriedRelic(){return carriedRelic;},
  drawSprite, drawShadow, drawEntitySprite, drawPlayer, drawEnemy, draw,
  spawnEnemyAt, spawnWolfPack, spawnWaterEnemy, spawnBiomeEnemy, spawnVampirePack,
  spawnBiomeBoss, updateWeaponHUD, updateEquipHUD, updateHUD, showLevelUp,
  showGameOver, WEAPON_DEFS, fireWeapon, weapons: playerWeapons, rebuildEnemyGrid,
  quests:{getNearest:getNearestRelic,collectNearby:tryCollectRelic,pickupNearby:updateRelicPickups,journal:relicJournal,equipped:equippedRelicIds,setSlot:setRelicSlot,modifiers:()=>({...relicModifiers})},
  toggleInventory
};

// Expose spawn functions to window for console debugging
window.spawnEnemyAt = spawnEnemyAt;
window.spawnWolfPack = spawnWolfPack;
window.spawnWaterEnemy = spawnWaterEnemy;
window.spawnBiomeEnemy = spawnBiomeEnemy;
window.spawnVampirePack = spawnVampirePack;
window.spawnBiomeBoss = spawnBiomeBoss;
window.player = player;
window.enemies = enemies;
window.elapsed = elapsed;
window.setBloodMoon = (v = true) => { isBloodMoon = v; };
window.setDay = () => { worldTime = DAY_LENGTH * 0.5; };
window.setNight = () => { worldTime = 0; };
window.addWeapon = addWeapon;
window.playerWeapons = playerWeapons;
window.drawRainbowArc = drawRainbowArc;

recomputeRelicModifiers();
document.getElementById('inventoryToggle').addEventListener('click',toggleInventory);
document.getElementById('inventoryClose').addEventListener('click',toggleInventory);

const fpsSamples = [];
const updateSamples = [];
const renderSamples = [];
let lastFpsUiUpdate = 0;

function syncPerfStatsControls(val) {
  const isEnabled = Boolean(val);
  window.DEV_SHOW_PERF_STATS = isEnabled;
  if (window.GAME_SETTINGS) window.GAME_SETTINGS.showPerfStats = isEnabled;
  const c1 = document.getElementById('devShowPerfStats');
  const c2 = document.getElementById('setPerfStatsModal');
  if (c1 && c1.checked !== isEnabled) c1.checked = isEnabled;
  if (c2 && c2.checked !== isEnabled) c2.checked = isEnabled;
  const perfOverlay = document.getElementById('debugPerfOverlay');
  if (perfOverlay && !isEnabled) perfOverlay.style.display = 'none';
  const drawOverlay = document.getElementById('debugDrawOverlay');
  if (drawOverlay && !isEnabled) drawOverlay.style.display = 'none';
}
window.setPerfStats = syncPerfStatsControls;
document.getElementById('devShowPerfStats')?.addEventListener('change', (e) => syncPerfStatsControls(e.target.checked));
document.getElementById('setPerfStatsModal')?.addEventListener('change', (e) => syncPerfStatsControls(e.target.checked));

const legacyFogCb = document.getElementById('devLegacyFogBlur');
if (legacyFogCb) {
  legacyFogCb.checked = Boolean(window.LEGACY_FOG_BLUR || window.GAME_SETTINGS?.legacyFogBlur);
  legacyFogCb.addEventListener('change', () => {
    window.LEGACY_FOG_BLUR = legacyFogCb.checked;
    if (window.GAME_SETTINGS) window.GAME_SETTINGS.legacyFogBlur = legacyFogCb.checked;
  });
}
window.setLegacyFog = (val) => {
  window.LEGACY_FOG_BLUR = Boolean(val);
  if (window.GAME_SETTINGS) window.GAME_SETTINGS.legacyFogBlur = Boolean(val);
  if (legacyFogCb) legacyFogCb.checked = Boolean(val);
};

const legacyLightingCb = document.getElementById('devLegacyLighting');
if (legacyLightingCb) {
  legacyLightingCb.checked = Boolean(window.RENDER_DEBUG?.legacyLighting || window.GAME_SETTINGS?.legacyLighting);
  legacyLightingCb.addEventListener('change', () => {
    if (window.RENDER_DEBUG) window.RENDER_DEBUG.legacyLighting = legacyLightingCb.checked;
    if (window.GAME_SETTINGS) window.GAME_SETTINGS.legacyLighting = legacyLightingCb.checked;
  });
}
window.setLegacyLighting = (val) => {
  const isLegacy = Boolean(val);
  if (window.RENDER_DEBUG) window.RENDER_DEBUG.legacyLighting = isLegacy;
  if (window.GAME_SETTINGS) window.GAME_SETTINGS.legacyLighting = isLegacy;
  if (legacyLightingCb) legacyLightingCb.checked = isLegacy;
};

const legacySilCb = document.getElementById('devLegacySilhouette');
if (legacySilCb) {
  legacySilCb.checked = Boolean(window.RENDER_DEBUG?.legacySilhouette || window.GAME_SETTINGS?.legacySilhouette);
  legacySilCb.addEventListener('change', () => {
    if (window.RENDER_DEBUG) window.RENDER_DEBUG.legacySilhouette = legacySilCb.checked;
    if (window.GAME_SETTINGS) window.GAME_SETTINGS.legacySilhouette = legacySilCb.checked;
  });
}
window.setLegacySilhouette = (val) => {
  const isLegacy = Boolean(val);
  if (window.RENDER_DEBUG) window.RENDER_DEBUG.legacySilhouette = isLegacy;
  if (window.GAME_SETTINGS) window.GAME_SETTINGS.legacySilhouette = isLegacy;
  if (legacySilCb) legacySilCb.checked = isLegacy;
};

const legacyChunkCb = document.getElementById('devLegacyChunkSampling');
if (legacyChunkCb) {
  legacyChunkCb.checked = Boolean(window.RENDER_DEBUG?.legacyChunkSampling || window.GAME_SETTINGS?.legacyChunkSampling);
  legacyChunkCb.addEventListener('change', () => {
    if (window.RENDER_DEBUG) window.RENDER_DEBUG.legacyChunkSampling = legacyChunkCb.checked;
    if (window.GAME_SETTINGS) window.GAME_SETTINGS.legacyChunkSampling = legacyChunkCb.checked;
  });
}
window.setLegacyChunkSampling = (val) => {
  const isLegacy = Boolean(val);
  if (window.RENDER_DEBUG) window.RENDER_DEBUG.legacyChunkSampling = isLegacy;
  if (window.GAME_SETTINGS) window.GAME_SETTINGS.legacyChunkSampling = isLegacy;
  if (legacyChunkCb) legacyChunkCb.checked = isLegacy;
};

function loop(now){
  const deltaMs = now - lastTime;
  const dt = Math.min(deltaMs / 1000, .05);
  lastTime = now;

  if (deltaMs > 0 && deltaMs < 350) {
    fpsSamples.push(1000 / deltaMs);
    if (fpsSamples.length > 25) fpsSamples.shift();
  }

  const t0 = performance.now();
  update(dt);
  const t1 = performance.now();
  draw();
  const t2 = performance.now();

  const uMs = t1 - t0;
  const rMs = t2 - t1;
  updateSamples.push(uMs);
  if (updateSamples.length > 25) updateSamples.shift();
  renderSamples.push(rMs);
  if (renderSamples.length > 25) renderSamples.shift();

  if (now - lastFpsUiUpdate > 250) {
    lastFpsUiUpdate = now;
    const fpsEl = document.getElementById('fpsCounter');
    const perfOverlay = document.getElementById('debugPerfOverlay');
    const showPerf = Boolean(window.DEV_SHOW_PERF_STATS || window.GAME_SETTINGS?.showPerfStats);
    const avgFps = fpsSamples.length ? Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length) : 60;
    const avgU = (updateSamples.reduce((a, b) => a + b, 0) / (updateSamples.length || 1)).toFixed(1);
    const avgR = (renderSamples.reduce((a, b) => a + b, 0) / (renderSamples.length || 1)).toFixed(1);

    if (perfOverlay) {
      if (showPerf) {
        perfOverlay.style.display = 'inline-flex';
        perfOverlay.textContent = `Up: ${avgU}ms | Ren: ${avgR}ms`;
        perfOverlay.className = 'hud-fps-counter ' + (avgFps >= 55 ? 'fps-good' : (avgFps >= 30 ? 'fps-mid' : 'fps-low'));
      } else {
        perfOverlay.style.display = 'none';
      }
    }

    const drawOverlay = document.getElementById('debugDrawOverlay');
    if (drawOverlay) {
      if (showPerf && window.RENDER_STATS) {
        const s = window.RENDER_STATS;
        const mpx = (s.totalPx / 1000000).toFixed(1);
        drawOverlay.style.display = 'inline-flex';
        drawOverlay.textContent = `Img: ${s.totalCalls} calls (${mpx} Mpx)`;
        drawOverlay.className = 'hud-fps-counter ' + (s.totalCalls < 600 ? 'fps-good' : (s.totalCalls < 1500 ? 'fps-mid' : 'fps-low'));
        drawOverlay.title = `Chunks: ${s.layers.chunks.count} (${(s.layers.chunks.px/1e6).toFixed(1)}M) | Water: ${s.layers.water.count} (${(s.layers.water.px/1e6).toFixed(1)}M) | Mountains: ${s.layers.mountains.count} (${(s.layers.mountains.px/1e6).toFixed(1)}M) | Decor: ${s.layers.decor.count} (${(s.layers.decor.px/1e6).toFixed(1)}M) | Fire: ${s.layers.fire.count} (${(s.layers.fire.px/1e6).toFixed(1)}M) | Entities: ${s.layers.entities.count} (${(s.layers.entities.px/1e6).toFixed(1)}M) | Clouds: ${s.layers.clouds.count} (${(s.layers.clouds.px/1e6).toFixed(1)}M) | Proj: ${s.layers.projectiles.count} (${(s.layers.projectiles.px/1e6).toFixed(1)}M) | Light: ${s.layers.lighting.count} (${(s.layers.lighting.px/1e6).toFixed(1)}M) | Fog: ${s.layers.fog.count} (${(s.layers.fog.px/1e6).toFixed(1)}M) | Sil: ${s.layers.silhouette.count} (${(s.layers.silhouette.px/1e6).toFixed(1)}M) | UI: ${s.layers.ui.count} (${(s.layers.ui.px/1e6).toFixed(1)}M)`;
      } else {
        drawOverlay.style.display = 'none';
      }
    }

    if (fpsEl) {
      if (window.GAME_SETTINGS?.showFps !== false) {
        fpsEl.style.display = 'inline-flex';
        fpsEl.textContent = avgFps + ' FPS';
        fpsEl.className = 'hud-fps-counter ' + (avgFps >= 55 ? 'fps-good' : (avgFps >= 30 ? 'fps-mid' : 'fps-low'));
      } else {
        fpsEl.style.display = 'none';
      }
    }
  }

  requestAnimationFrame(loop);
}
const initW = getSelectedCharacter()?.startingWeapon || (campSave.character === 'knight' ? 'fireBreath' : (campSave.character === 'orc' ? 'orcCleaver' : 'wand'));
addWeapon(initW);
hasResumableProgress=restoreRunProgress();
if(hasResumableProgress)renderCamp();
renderAtlasIcons();
updateWeaponHUD();
updateEquipHUD();
updateHUD();
requestAnimationFrame(loop);
addEventListener('resize',()=>{canvas.width=innerWidth;canvas.height=innerHeight;});
addEventListener('mousemove', e => {
  mouseScreenX = e.clientX;
  mouseScreenY = e.clientY;
});
canvas.addEventListener('click', () => {
  if(!gameStarted || gameOver || paused) return;
  if(typeof tryInteractDreamShop === 'function' && tryInteractDreamShop()) return;
  if(tryInteractNPC()) return;
  if(tryInteractSunkenShrine()) return;
  if(tryInteractMountainShrine()) return;
  if(tryEnterCave()) return;
  if(tryEnterVoid()) return;
});





































setTimeout(() => { if (typeof WEAPON_DEFS !== 'undefined') { Object.keys(WEAPON_DEFS).forEach(k => { if(!WEAPON_DEFS[k].tool && k !== 'prismStaff' && k !== 'rainbowBarrage' && k !== 'frostBeam' && k !== 'permafrost' && k !== 'frostStaff' && k !== 'fireBreath' && k !== 'dragonInferno' && (!window.UPGRADE_ICONS || !window.UPGRADE_ICONS[k])) WEAPON_DEFS[k].sprite = window.extItemSprite(k); }); } if (typeof ALL_LEGENDARY_PIECES !== 'undefined') { ALL_LEGENDARY_PIECES.forEach(p => p.sprite = window.extItemSprite(p.id)); } if (typeof ALL_TRINKETS !== 'undefined') { ALL_TRINKETS.forEach(t => { if (!t.sprite || (!window.TRINKET_RELIC_ICONS?.[t.sprite] && !window.TRINKET_RELIC_ICONS?.[t.id])) t.sprite = window.extItemSprite(t.id); }); } if (typeof STAT_UPGRADES !== 'undefined') { STAT_UPGRADES.forEach(u => { if (!window.UPGRADE_ICONS || !window.UPGRADE_ICONS[u.id]) u.sprite = window.extItemSprite('u_' + u.id); }); } if (typeof RUN_UPGRADES !== 'undefined') { RUN_UPGRADES.forEach(u => { if (!window.UPGRADE_ICONS || !window.UPGRADE_ICONS[u.id]) u.sprite = window.extItemSprite('u_' + u.id); }); } if (typeof EQUIPMENT_UPGRADES !== 'undefined') { EQUIPMENT_UPGRADES.forEach(u => { if (u.id !== 'mask_of_calm' && (!window.UPGRADE_ICONS || !window.UPGRADE_ICONS[u.id])) u.sprite = window.extItemSprite('u_' + u.id); }); } if (typeof CAMP_WEAPONS !== 'undefined') { CAMP_WEAPONS.forEach(w => { if (w.id !== 'frostBeam' && w.id !== 'frostStaff' && w.id !== 'prismStaff' && (!window.UPGRADE_ICONS || !window.UPGRADE_ICONS[w.id])) w.sprite = window.extItemSprite(w.id); }); } if (typeof CAMP_GEAR !== 'undefined') { CAMP_GEAR.forEach(g => { if (g.id !== 'mask_of_calm' && (!window.UPGRADE_ICONS || !window.UPGRADE_ICONS[g.id])) g.sprite = window.extItemSprite('u_' + g.id); }); }  if (typeof NPC_ARCHETYPES !== 'undefined') { NPC_ARCHETYPES.merchant.stockPool.forEach(s => s.sprite = window.extItemSprite('s_' + s.id)); } }, 100);


















export { TILE, ctx, VW, VH, camera, chunks, chunkKey, tileAtWorld, spawnParticles, spawnEnemyAt, createNpcInstance, DAY_LENGTH, enemies, player, playerWeapons, equipment, unlockedAch, revealedTiles, resolveCampSceneId, renderCamp, getQuestProgress, damageEnemy, checkLevelUp, updateWeaponHUD, updateHUD, startGame, drawHealthBar };