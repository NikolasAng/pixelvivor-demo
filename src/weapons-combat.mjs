import { ENEMY_TYPES } from './entities.mjs?v336';
import { createDamageHandler } from './combat.mjs?v336';
import { WEAPON_DEFS, RAINBOW_COLORS } from './config.mjs?v336';
import { playSfx } from './audio.mjs?v336';
import { state, ctx, camera, player, enemies, projectiles, particles, mines, chainVisuals, summonedSpirits, voidRifts, meleeSwings, prismBeams, rainbowArcs, fireBreaths, activeChainWhips } from './state.mjs?v336';
import { enemyIsRevealed, findNearestRevealedEnemy, findKNearestRevealedEnemies, forEachEnemyNear, anyRevealedEnemyAlive, distToSegmentSq } from './spatial.mjs?v336';
import { drawSprite } from './ui-icons.mjs?v336';
import { TILE } from './underground.mjs?v336';
import { igniteTile } from './world-chunks.mjs?v336';
import { spawnDamageNumber, spawnParticles, applyCompanionRelicPowers, applyCompanionRelicImpact } from './relics-achievements.mjs?v336';
import { getActiveMount } from './camp.mjs?v336';
import { spawnEnemyAt } from './enemies-spawner.mjs?v336';
import { drawHealthBar } from './game-core.mjs?v336';

const rukCleaverHorizontalImg = new Image();
rukCleaverHorizontalImg.src = 'characters/ORK/ruk main weapon/ruk_cleaver_horizontal.webp?v309';

const baseDamageEnemy=createDamageHandler({player,spawnDamageNumber,getDamageMultiplier:()=>{
  let mult = relicModifiers.damage*(1+player.berserkerLevels*Math.floor(Math.max(0,1-player.hp/player.maxHp)*20)*.01);
  // Anchor ability: +50% damage while standing still
  if(player.abilities && player.abilities.includes('anchor') && !player.moving){
    mult *= 1.5;
  }
  // Nightmare Shard: +30% player damage
  if(state.isInDream && state.dreamRelics && state.dreamRelics.includes('nightmare_shard')){
    mult *= 1.3;
  }
  // Golden Feather temporary buff (+20% damage for 15s)
  if(player.goldenFeatherTimer && player.goldenFeatherTimer > 0){
    mult *= 1.2;
  }
  return mult;
},canDamage:enemyIsRevealed});
function damageEnemy(e,dmg,{noProc=false}={}){if(maskOfCalmActive)return false;if(e.isFalling)return false;if(!enemyIsRevealed(e))return false;if(e.passive||ENEMY_TYPES[e.type]?.passive)return false;
  // Champion Barrier Affix check
  if(e.barrierHits && e.barrierHits > 0){
    e.barrierHits--;
    spawnParticles(e.x, e.y, '#00e5ff', 4);
    spawnDamageNumber(e.x, e.y - (e.h||32)/2 - 10, 'SHIELD', '#80d8ff');
    return false;
  }
  if(e.isPhalanx){
    const facingAngle = Math.atan2(e.phalanxDirY || (player.y - e.y), e.phalanxDirX || (player.x - e.x));
    const attackerAngle = Math.atan2(player.y - e.y, player.x - e.x);
    let diff = Math.abs(facingAngle - attackerAngle);
    while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
    if (diff < Math.PI * 0.45) {
      dmg *= 0.25;
      spawnParticles(e.x, e.y, '#ffd54f', 6);
      spawnDamageNumber(e.x, e.y - e.h/2 - 10, 'BLOCKED', '#90caf9');
    } else {
      dmg *= 1.2;
      spawnDamageNumber(e.x, e.y - e.h/2 - 10, 'FLANK!', '#ffeb3b');
    }
  }if(!e.boss&&player.executeThreshold>0&&e.maxHp>0&&e.hp/e.maxHp<=player.executeThreshold){e.hp=0;e.hitByPlayer=true;e.hitFlash=.1;spawnDamageNumber(e.x,e.y-e.h/2,'EXECUTE','#ffd54f');return true;}if(e.markedTimer&&e.markedTimer>0){dmg*=1.15;e.markedTimer-=1/60;}const critical=!noProc&&Math.random()<player.critChance;
  if(critical && player.bloodthirster3pc){
    player.hp = Math.min(player.maxHp, player.hp + 5);
    spawnDamageNumber(player.x+player.w/2, player.y-10, '+5 HP', '#e53935');
  }
  if(!noProc && player.stormcaller3pc){
    player._stormCounter = (player._stormCounter || 0) + 1;
    if(player._stormCounter >= 3){
      player._stormCounter = 0;
      spawnParticles(e.x, e.y, '#00e5ff', 18);
      damageEnemy(e, 80, { noProc: true });
      spawnDamageNumber(e.x, e.y-15, 'THUNDER', '#00e5ff');
    }
  }
  const applied=baseDamageEnemy(e,dmg*(critical?player.critMult:1));if(applied){e.showHpTimer=5.0;if(!noProc){if(player.emberDamage>0){e.burnDamage=player.emberDamage;e.burnTimer=2;e.burnTick=e.burnTick||0;}if(player.frostSlow>0)e.upgradeSlowTimer=Math.max(e.upgradeSlowTimer||0,1.5);}}return applied;}

function updateCampCompanions(dt){
  const px=player.x+player.w/2,py=player.y+player.h/2;
  const moveToward=(companion,x,y,rate,face=true)=>{
    const dx=x-companion.x,dy=y-companion.y;
    const blend=1-Math.exp(-rate*dt);
    companion.x+=dx*blend;companion.y+=dy*blend;
    if(face&&Math.abs(dx)>1)companion.flipX=dx<0;
  };
  if(maskOfCalmActive){
    companions.forEach((companion,index)=>{
      const orbitAngle=elapsed*.95+index*Math.PI*2/Math.max(1,companions.length);
      const orbitX=px+Math.cos(orbitAngle)*72;
      const orbitY=py+Math.sin(orbitAngle)*52;
      if(!Number.isFinite(companion.x)||Math.hypot(px-companion.x,py-companion.y)>520){
        companion.x=orbitX;companion.y=orbitY;
      }
      moveToward(companion,orbitX,orbitY,5.5);
    });
    return;
  }
  const nearestEnemy=(x,y,range)=>maskOfCalmActive ? null : findNearestRevealedEnemy(x,y,range);
  companions.forEach((companion,index)=>{
    const orbitAngle=elapsed*.95+index*Math.PI*2/Math.max(1,companions.length);
    const orbitX=px+Math.cos(orbitAngle)*72;
    const orbitY=py+Math.sin(orbitAngle)*52;
    if(!Number.isFinite(companion.x)||Math.hypot(px-companion.x,py-companion.y)>520){
      companion.x=orbitX;companion.y=orbitY;
    }
    companion.cooldown=Math.max(0,(companion.cooldown||0)-dt);
    companion.healTimer=Math.max(0,(companion.healTimer||0)-dt);
    companion.attackTimer=Math.max(0,(companion.attackTimer||0)-dt);
    companion.dashTimer=Math.max(0,(companion.dashTimer||0)-dt);
    companion.attackFlash=Math.max(0,(companion.attackFlash||0)-dt);

    if(companion.id==='healer'||companion.id==='sylva'){
      moveToward(companion,orbitX,orbitY,5.5);
      if(companion.healTimer<=0&&player.hp<player.maxHp){
        const healing=Math.ceil(Math.min(8*player.companionMult,player.maxHp-player.hp));
        player.hp+=healing;
        companion.healFlash=.5;
        companion.healTimer=1.8;
        spawnDamageNumber(px,player.y-10,`+${healing} HP`,'#80e89a');
        spawnParticles(px,py,'#80e89a',8);
      }
      const threat=nearestEnemy(companion.x,companion.y,280);
      if(threat&&companion.attackTimer<=0){
        playSfx('attack');
        const dx=threat.x-companion.x,dy=threat.y-companion.y,d=Math.hypot(dx,dy)||1;
        const speed=8;
        projectiles.push(applyCompanionRelicPowers({x:companion.x,y:companion.y-6,vx:dx/d*speed,vy:dy/d*speed,damage:9,pierce:0,life:Math.min(1.2,d/(speed*60)+.2),sprite:window.extItemSprite('p_companionOrb'),w:12,h:12,angle:Math.atan2(dy,dx),companionShot:true}));
        companion.attackTimer=2.2;
      }
      companion.healFlash=Math.max(0,(companion.healFlash||0)-dt);
      return;
    }

    if(companion.id==='scout'){
      const heldTarget=companion.targetEnemy;
      const target=heldTarget&&heldTarget.hp>0&&enemyIsRevealed(heldTarget)&&Math.hypot(heldTarget.x-companion.x,heldTarget.y-companion.y)<520
        ?heldTarget:nearestEnemy(companion.x,companion.y,480);
      companion.targetEnemy=target;
      const side=index%2===0?1:-1;
      const sideX=-player.lastMoveY*side,sideY=player.lastMoveX*side;
      let goalX=px+sideX*66,goalY=py+sideY*66;
      if(target){
        const dx=target.x-companion.x,dy=target.y-companion.y,d=Math.hypot(dx,dy)||1;
        if(d>175){goalX=target.x-dx/d*135;goalY=target.y-dy/d*135;}
        else{goalX=companion.x;goalY=companion.y;}
        companion.facingX=dx;
        if(Math.abs(dx)>8)companion.flipX=dx<0;
        if(companion.cooldown<=0){
          playSfx('attack');
          const speed=12;
          projectiles.push(applyCompanionRelicPowers({x:companion.x,y:companion.y-5,vx:dx/d*speed,vy:dy/d*speed,damage:14,pierce:0,life:Math.min(1.2,d/(speed*60)+.2),sprite:window.extItemSprite('p_companionArrow'),w:28,h:14,angle:Math.atan2(dy,dx),companionShot:true}));
          companion.cooldown=1.05;
          companion.attackFlash=.18;
        }
      }
      if(!target&&Math.abs(goalX-companion.x)>8)companion.flipX=goalX<companion.x;
      moveToward(companion,goalX,goalY,3.8,false);
      return;
    }

    if(companion.id==='fox'||companion.id==='ignis'){
      const target=companion.dashTarget&&companion.dashTarget.hp>0&&enemyIsRevealed(companion.dashTarget)
        ?companion.dashTarget:null;
      if(companion.dashTimer>0&&target){
        const dx=target.x-companion.x,dy=target.y-companion.y,d=Math.hypot(dx,dy)||1;
        companion.facingX=dx;
        const dashStep=Math.min(d,620*dt);
        companion.x+=dx/d*dashStep;companion.y+=dy/d*dashStep;
        if(d<=Math.max(target.w,target.h)*.5+18&&!companion.dashHit){
          playSfx('attack');
          damageEnemy(target,18);
          applyCompanionRelicImpact(target,18);
          spawnParticles(target.x,target.y,'#ff9d3c',10);
          companion.dashHit=true;companion.attackFlash=.24;
        }
      }else{
        companion.dashTimer=0;companion.dashTarget=null;companion.dashHit=false;
        const nearby=nearestEnemy(companion.x,companion.y,340);
        if(nearby&&companion.cooldown<=0){
          const dx=nearby.x-companion.x,dy=nearby.y-companion.y,d=Math.hypot(dx,dy)||1;
          companion.facingX=dx;
          if(d>145){moveToward(companion,nearby.x-dx/d*65,nearby.y-dy/d*65,8);}
          else{
            companion.dashTarget=nearby;
            companion.dashTimer=.34;
            companion.dashHit=false;
            companion.cooldown=1.25;
          }
        }else moveToward(companion,orbitX,orbitY,7.5);
      }
    }else if(companion.id==='aldric'||companion.id==='nanook'||companion.id==='khepri'){
      const facingX=player.lastMoveX||1,facingY=player.lastMoveY||0;
      const goalX=px+facingX*55,goalY=py+facingY*55;
      moveToward(companion,goalX,goalY,4.5);
      const lvlFactor=1+player.level*0.10;
      companion.maxHp=100*lvlFactor;
      if(companion.hp===undefined)companion.hp=companion.maxHp;
      companion.tauntTimer=Math.max(0,(companion.tauntTimer||0)-dt);
      if(companion.tauntTimer<=0){
        companion.tauntTimer=6;
        forEachEnemyNear(companion.x, companion.y, 180, enemy => {
          if(enemy.hp<=0||!enemyIsRevealed(enemy))return;
          if((enemy.x-companion.x)**2+(enemy.y-companion.y)**2<180*180){enemy.tauntTarget=companion;enemy.tauntTimer=2;}
        });
      }
      companion.regenTimer=Math.max(0,(companion.regenTimer||0)-dt);
      if(companion.regenTimer<=0){
        companion.regenTimer=3;
        companion.hp=Math.min(companion.maxHp,companion.hp+companion.maxHp*0.15);
      }
      if(companion.hp<=0){
        companion.hp=0;companion.downedTimer=10;
        companion.x=px+(Math.random()-0.5)*600;
        companion.y=py+(Math.random()-0.5)*600;
      }
      if(companion.downedTimer&&companion.downedTimer>0){
        companion.downedTimer-=dt;
        if(companion.downedTimer<=0){companion.hp=companion.maxHp*0.5;companion.downedTimer=0;}
        return;
      }
      return;
    }else if(companion.id==='kael'){
      const t=elapsed*0.8;
      const goalX=px+Math.cos(t)*50;
      const goalY=py-60+Math.sin(t*2)*15;
      moveToward(companion,goalX,goalY,6,false);
      companion.markTimer=Math.max(0,(companion.markTimer||0)-dt);
      if(companion.markTimer<=0){
        companion.markTimer=3;
        const sorted=findKNearestRevealedEnemies(px,py,5);
        for(const e of sorted){e.markedTimer=5;}
      }
      companion.bossWarnTimer=Math.max(0,(companion.bossWarnTimer||0)-dt);
      let nearbyBoss=null;
      forEachEnemyNear(px, py, 500, e => {
        if(ENEMY_TYPES[e.type]?.boss&&e.hp>0&&(e.x-px)**2+(e.y-py)**2<500*500){nearbyBoss=e;return false;}
      });
      if(nearbyBoss&&!companion.bossWarned){
        companion.bossWarned=true;
        const toast=document.createElement('div');toast.className='relic-toast';
        const title=document.createElement('strong');title.textContent='KAEL SPOTS A BOSS';title.style.color='#61b8ff';
        const name=document.createElement('span');name.textContent=`${nearbyBoss.type} is nearby!`;
        toast.append(title,name);
        document.getElementById('relicToasts')?.appendChild(toast);
        setTimeout(()=>toast.remove(),3600);
      }
      if(!nearbyBoss)companion.bossWarned=false;
      return;
    }else if(companion.id==='fenrir'||companion.id==='bramble'||companion.id==='yukon'||companion.id==='leo'){
      companion.packTimer=Math.max(0,(companion.packTimer||0)-dt);
      if(companion.packTimer<=0)companion.packKillCount=0;
      companion.howlTimer=Math.max(0,(companion.howlTimer||0)-dt);
      if(companion.howlTimer<=0){
        companion.howlTimer=20;
        forEachEnemyNear(companion.x, companion.y, 200, enemy => {
          if(enemy.hp<=0||!enemyIsRevealed(enemy))return;
          if((enemy.x-companion.x)**2+(enemy.y-companion.y)**2<200*200){enemy.slowTimer=Math.max(enemy.slowTimer||0,3);}
        });
        particles.push({x:companion.x,y:companion.y,vx:0,vy:0,life:.6,maxLife:.6,color:'#e0e0e0',explosion:150});
      }
      const target=nearestEnemy(companion.x,companion.y,420);
      if(target){
        const dx=target.x-companion.x,dy=target.y-companion.y,d=Math.hypot(dx,dy)||1;
        companion.flipX=dx<0;
        if(d>32){moveToward(companion,target.x,target.y,8,false);}
        else{
          if(companion.cooldown<=0){
            playSfx('attack');
            const packBonus=companion.packKillCount>=3?1.3:1;
            damageEnemy(target,15*packBonus);
            companion.cooldown=0.8;
            companion.packKillCount++;
            companion.packTimer=5;
          }
        }
      }else{moveToward(companion,orbitX,orbitY,7);}
      return;
    }else if(companion.id==='selene'||companion.id==='aurelius'||companion.id==='scorch'){
      const goalX=px-40,goalY=py-45;
      moveToward(companion,goalX,goalY,5,false);
      companion.cooldown=Math.max(0,(companion.cooldown||0)-dt);
      if(companion.cooldown<=0){
        const target=nearestEnemy(companion.x,companion.y,340);
        if(target){
          playSfx('attack');
          const dx=target.x-companion.x,dy=target.y-companion.y,d=Math.hypot(dx,dy)||1;
          projectiles.push(applyCompanionRelicPowers({
            x:companion.x,y:companion.y,vx:dx/d*9,vy:dy/d*9,
            damage:12+player.level*1.5,pierce:0,life:1.2,
            sprite:WEAPON_DEFS['arcaneBarrage'].sprite,w:36,h:36,angle:Math.atan2(dy,dx),companionShot:true
          }));
          companion.cooldown=1.4;
          companion.attackFlash=.2;
        }
      }
      return;
    }else if(companion.id==='morvath'){
      moveToward(companion,orbitX,orbitY,5);
      if(!Array.isArray(companion.summons)) companion.summons = [];
      const pLvl = Math.max(1, player.level || 1);
      const maxSummons = Math.min(10, 2 + Math.floor(pLvl / 2));
      const perCast = Math.min(3, 1 + Math.floor(pLvl / 5));
      const summonInterval = Math.max(3.8, 6.2 - pLvl * 0.14);
      if(companion.summonTimer === undefined) companion.summonTimer = 1.2;
      companion.summonTimer -= dt;
      if(companion.summonTimer <= 0 && companion.summons.length < maxSummons){
        companion.summonTimer = summonInterval;
        const toSpawn = Math.min(perCast, maxSummons - companion.summons.length);
        const sprite = pLvl < 6 ? 'rpg_skeleton_small' : 'skeleton';
        const baseSize = pLvl < 6
          ? (18 + Math.min(4, (pLvl - 1) * 0.8))
          : (pLvl < 14
            ? (25 + (pLvl - 6) * 1.4)
            : Math.min(48, 36 + (pLvl - 14) * 0.9));
        for(let k=0;k<toSpawn;k++){
          const a = Math.random()*Math.PI*2;
          const dist = 26 + Math.random()*28;
          const sx = companion.x + Math.cos(a)*dist, sy = companion.y + Math.sin(a)*dist;
          spawnParticles(sx, sy, '#b388ff', 8);
          companion.summons.push({
            x: sx, y: sy,
            w: Math.round(baseSize), h: Math.round(baseSize * 1.1),
            sprite,
            damage: Math.round(6 + pLvl * 1.6),
            speed: pLvl < 6 ? 3.2 : (pLvl < 14 ? 3.5 : 3.8),
            life: 22, maxLife: 22,
            attackCd: 0,
            animTime: Math.random() * 10,
            isMoving: true,
            flipX: false,
            orbitAngle: a,
            tier: pLvl < 6 ? 1 : (pLvl < 14 ? 2 : 3)
          });
        }
        playSfx('attack');
      }
      for(let si=companion.summons.length-1; si>=0; si--){
        const s = companion.summons[si];
        s.life -= dt;
        if(s.life <= 0){
          spawnParticles(s.x, s.y, '#cfd8dc', 6);
          companion.summons.splice(si, 1);
          continue;
        }
        if(s.attackCd > 0) s.attackCd -= dt;
        s.animTime = (s.animTime || 0) + dt;
        const target = nearestEnemy(s.x, s.y, 440);
        if(target){
          const dx = target.x - s.x, dy = target.y - s.y;
          const d = Math.hypot(dx, dy) || 1;
          if(Math.abs(dx) > 1) s.flipX = dx < 0;
          const hitDist = (Math.max(target.w||32, target.h||32) * 0.42) + (s.w * 0.5) + 10;
          if(d > hitDist){
            const step = s.speed * 60 * dt;
            s.x += (dx / d) * Math.min(step, d - hitDist * 0.5);
            s.y += (dy / d) * Math.min(step, d - hitDist * 0.5);
            s.isMoving = true;
          } else {
            s.isMoving = false;
            if(s.attackCd <= 0){
              s.attackCd = 0.65;
              damageEnemy(target, s.damage * (player.companionMult || 1));
              applyCompanionRelicImpact(target, s.damage * (player.companionMult || 1));
              spawnParticles(target.x, target.y, '#e0e0e0', 4);
              spawnParticles(target.x, target.y, '#b388ff', 3);
            }
          }
        } else {
          s.orbitAngle = (s.orbitAngle || 0) + dt * 1.4;
          const goalX = companion.x + Math.cos(s.orbitAngle) * (34 + (si % 3) * 14);
          const goalY = companion.y + Math.sin(s.orbitAngle) * (28 + (si % 3) * 12);
          const dx = goalX - s.x, dy = goalY - s.y;
          const d = Math.hypot(dx, dy);
          if(d > 4){
            const step = Math.min(d, (s.speed + 0.6) * 60 * dt);
            s.x += (dx / d) * step;
            s.y += (dy / d) * step;
            if(Math.abs(dx) > 0.5) s.flipX = dx < 0;
            s.isMoving = true;
          } else {
            s.isMoving = false;
          }
        }
      }
      return;
    }else if(companion.id==='naja'||companion.id==='nyx'||companion.id==='frostwing'){
      moveToward(companion,orbitX,orbitY,6);
      companion.cooldown=Math.max(0,(companion.cooldown||0)-dt);
      if(companion.cooldown<=0){
        const target=nearestEnemy(companion.x,companion.y,260);
        if(target){
          playSfx('attack');
          if(companion.id==='naja'){
            damageEnemy(target,14);
            target.slowTimer=Math.max(target.slowTimer||0,2.5);
            spawnParticles(target.x,target.y,'#76ff03',6);
          }else if(companion.id==='nyx'){
            damageEnemy(target,16);
            if(player.hp<player.maxHp)player.hp=Math.min(player.maxHp,player.hp+2);
            spawnParticles(target.x,target.y,'#e040fb',8);
          }else if(companion.id==='frostwing'){
            damageEnemy(target,12);
            target.slowTimer=Math.max(target.slowTimer||0,3.5);
            spawnParticles(target.x,target.y,'#80d8ff',8);
          }
          companion.cooldown=1.2;
        }
      }
      return;
    }else if(companion.id==='ashe'){
      const goalX=px+40,goalY=py-40;
      moveToward(companion,goalX,goalY,4,false);
      companion.burnAuraTimer=Math.max(0,(companion.burnAuraTimer||0)-dt);
      if(companion.burnAuraTimer<=0){
        companion.burnAuraTimer=0.5;
        forEachEnemyNear(companion.x, companion.y, 90, enemy => {
          if(enemy.hp<=0||!enemyIsRevealed(enemy))return;
          if((enemy.x-companion.x)**2+(enemy.y-companion.y)**2<90*90){enemy.hp-=4+player.level*0.3;}
        });
      }
      return;
    }
  });
}


let cachedRainbowGrad = null;
let cachedGradSpan = 0;
function getCachedRainbowGradient(c, span) {
  const rounded = Math.max(100, Math.round(span));
  if (!cachedRainbowGrad || cachedGradSpan !== rounded) {
    cachedGradSpan = rounded;
    cachedRainbowGrad = c.createLinearGradient(0, -rounded, 0, rounded);
    cachedRainbowGrad.addColorStop(0.00, '#ff1744');
    cachedRainbowGrad.addColorStop(0.18, '#ff9100');
    cachedRainbowGrad.addColorStop(0.36, '#ffea00');
    cachedRainbowGrad.addColorStop(0.55, '#00e676');
    cachedRainbowGrad.addColorStop(0.75, '#00b0ff');
    cachedRainbowGrad.addColorStop(1.00, '#d500f9');
  }
  return cachedRainbowGrad;
}

function drawRainbowArc(arc){
  const prog = Math.max(0, Math.min(1, 1 - (arc.life / arc.maxLife)));
  const alpha = Math.max(0, Math.min(1, arc.life / (arc.maxLife * 0.45)));
  if (alpha <= 0.01) return;

  const expand = Math.sin(Math.min(1, prog * 1.5) * Math.PI * 0.5);
  const curRadius = arc.radius * (0.28 + 0.72 * expand);
  const halfSpan = arc.arcSpan * 0.5;
  const maxW = arc.maxWidth * (0.85 + 0.3 * Math.sin(prog * Math.PI));

  const sx = arc.startX - camera.x;
  const sy = arc.startY - camera.y;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(arc.angle);
  ctx.globalAlpha = alpha;

  const steps = 36;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = -halfSpan + t * (2 * halfSpan);
    const taper = Math.cos((a / halfSpan) * (Math.PI * 0.5));
    const r = curRadius + maxW * taper;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const a = -halfSpan + t * (2 * halfSpan);
    const taper = Math.cos((a / halfSpan) * (Math.PI * 0.5));
    const r = Math.max(10, curRadius - maxW * taper);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    ctx.lineTo(x, y);
  }
  ctx.closePath();

  const spanY = curRadius * Math.sin(halfSpan) + maxW;
  const grad = getCachedRainbowGradient(ctx, spanY);

  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = 18 * alpha;
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowBlur = 10 * alpha;
  const bandColors = ['#ff1744', '#ffea00', '#00e676', '#00b0ff', '#d500f9'];
  for (let b = 0; b < bandColors.length; b++) {
    const bandOffset = ((b / (bandColors.length - 1)) - 0.5) * (maxW * 0.7);
    ctx.strokeStyle = bandColors[b];
    ctx.lineWidth = Math.max(1.2, (maxW * 0.18) * alpha);
    ctx.shadowColor = bandColors[b];
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(10, curRadius + bandOffset), -halfSpan * 0.96, halfSpan * 0.96);
    ctx.stroke();
  }

  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10 * alpha;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2.5, maxW * 0.42 * alpha);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, curRadius, -halfSpan * 0.92, halfSpan * 0.92);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.2, maxW * 0.18 * alpha);
  ctx.beginPath();
  ctx.arc(0, 0, curRadius, -halfSpan * 0.85, halfSpan * 0.85);
  ctx.stroke();

  ctx.restore();
}

function drawPrismBeam(beam){
  const alpha = Math.max(0, beam.life / beam.maxLife);
  const sx1 = beam.x1 - camera.x;
  const sy1 = beam.y1 - camera.y;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  if(beam.isFrost){
    const sx2 = beam.x2 - camera.x;
    const sy2 = beam.y2 - camera.y;
    ctx.shadowColor = beam.isPermafrost ? '#00e5ff' : '#80d8ff';
    ctx.shadowBlur = beam.isPermafrost ? 24 : 16;
    const outerGrad = ctx.createLinearGradient(sx1, sy1, sx2, sy2);
    outerGrad.addColorStop(0.0, '#ffffff');
    outerGrad.addColorStop(0.25, '#b3e5fc');
    outerGrad.addColorStop(0.65, '#00e5ff');
    outerGrad.addColorStop(1.0, '#0288d1');
    ctx.strokeStyle = outerGrad;
    ctx.lineWidth = Math.max(5, beam.width * alpha);
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2.5, beam.width * 0.45 * alpha);
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx1, sy1, Math.max(2, beam.width * 0.3 * alpha), 0, Math.PI * 2);
    ctx.arc(sx2, sy2, Math.max(2.5, beam.width * 0.4 * alpha), 0, Math.PI * 2);
    ctx.fill();
  }else if(!beam.barrage){
    const sx2 = beam.x2 - camera.x;
    const sy2 = beam.y2 - camera.y;
    const grad = ctx.createLinearGradient(sx1, sy1, sx2, sy2);
    grad.addColorStop(0.0, '#ff1744');
    grad.addColorStop(0.2, '#ff9100');
    grad.addColorStop(0.4, '#ffea00');
    grad.addColorStop(0.6, '#00e676');
    grad.addColorStop(0.8, '#00b0ff');
    grad.addColorStop(1.0, '#d500f9');
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(2, beam.width * alpha);
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.5, beam.width * 0.35 * alpha);
    ctx.stroke();
  }else{
    for(let i=0;i<6;i++){
      const a = beam.baseAngle + i * (Math.PI / 3);
      const sx2 = sx1 + Math.cos(a) * beam.range;
      const sy2 = sy1 + Math.sin(a) * beam.range;
      const color = RAINBOW_COLORS[i];
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, beam.width * alpha);
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1.5, beam.width * 0.3 * alpha);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function updateWeaponFields(dt){
  if(maskOfCalmActive){
    meleeSwings.length = 0;
    prismBeams.length = 0;
    rainbowArcs.length = 0;
    summonedSpirits.length = 0;
    voidRifts.length = 0;
    fireBreaths.length = 0;
    activeChainWhips.length = 0;
    return;
  }
  for(let i=meleeSwings.length-1;i>=0;i--){meleeSwings[i].life-=dt;if(meleeSwings[i].life<=0)meleeSwings.splice(i,1);}
  for(let i=activeChainWhips.length-1;i>=0;i--){activeChainWhips[i].life-=dt;if(activeChainWhips[i].life<=0)activeChainWhips.splice(i,1);}

  for(let i=fireBreaths.length-1;i>=0;i--){
    const fb=fireBreaths[i];
    fb.life -= dt;
    if(fb.life <= 0){
      fireBreaths.splice(i, 1);
      continue;
    }
    fb.tickTimer = (fb.tickTimer || 0) - dt;

    // Follow player facing strictly horizontally as player navigates
    const isFacingLeft = player.facing < 0;
    const angle = isFacingLeft ? Math.PI : 0;
    fb.angle = angle;
    player.fireBreathAngle = angle;

    const startX = player.x + player.w / 2;
    const startY = player.y + player.h / 2;
    fb.x = startX;
    fb.y = startY;

    if(fb.tickTimer <= 0){
      fb.tickTimer = 0.10;
      const range = fb.range;
      const tickDmg = Math.max(1, Math.round(fb.damage * 0.28));
      const mouthY = player.y + player.h * 0.45;
      const halfHeight = 36;

      forEachEnemyNear(startX, startY, range + 60, enemy => {
        if(enemy.hp <= 0 || !enemyIsRevealed(enemy)) return;
        const enemyCenterX = enemy.x + enemy.w / 2;
        const enemyCenterY = enemy.y + enemy.h / 2;
        const enemyRadius = Math.max(enemy.w, enemy.h) * 0.5;

        // Strictly horizontal hit test along Zak's facing direction
        const dy = Math.abs(enemyCenterY - mouthY);
        if(dy > halfHeight + enemyRadius) return;

        // Must strictly be within weapon radius
        const distFromZak = Math.hypot(enemyCenterX - startX, enemyCenterY - startY);
        if(distFromZak > range + enemyRadius) return;

        let inRange = false;
        if(isFacingLeft){
          // Flame extends to the left from Zak's mouth
          const mouthX = player.x + 8;
          if(enemyCenterX <= mouthX + 10 && enemyCenterX >= mouthX - range - enemyRadius){
            inRange = true;
          }
        } else {
          // Flame extends to the right from Zak's mouth
          const mouthX = player.x + player.w - 8;
          if(enemyCenterX >= mouthX - 10 && enemyCenterX <= mouthX + range + enemyRadius){
            inRange = true;
          }
        }

        if(inRange){
          damageEnemy(enemy, tickDmg);
          enemy.burnTimer = Math.max(enemy.burnTimer || 0, fb.isEvo ? 4.0 : 2.5);
          const pushDir = isFacingLeft ? -1 : 1;
          enemy.x += pushDir * (12 + (player.knockbackPower || 0));
          spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, fb.isEvo ? '#ff1744' : '#ff5722', 3);
          spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#ffeb3b', 2);
          if (Math.random() < 0.20) {
            const tx = Math.floor(enemy.x / TILE), ty = Math.floor(enemy.y / TILE);
            igniteTile(tx, ty);
          }
        }
      });
    }
  }

  for(let i=prismBeams.length-1;i>=0;i--){prismBeams[i].life-=dt;if(prismBeams[i].life<=0)prismBeams.splice(i,1);}
  for(let i=rainbowArcs.length-1;i>=0;i--){
    const arc=rainbowArcs[i];
    arc.life-=dt;
    if(arc.life<=0){rainbowArcs.splice(i,1);continue;}
    const prog = Math.max(0, Math.min(1, 1 - (arc.life / arc.maxLife)));
    const curRadius = arc.radius * (0.28 + 0.72 * Math.sin(Math.min(1, prog * 1.5) * Math.PI * 0.5));
    forEachEnemyNear(arc.startX, arc.startY, curRadius + 45, enemy => {
      if(enemy.hp <= 0 || !enemyIsRevealed(enemy) || arc.hitSet.has(enemy)) return;
      const dx = enemy.x - arc.startX;
      const dy = enemy.y - arc.startY;
      const dist = Math.hypot(dx, dy);
      const enemyR = Math.max(enemy.w, enemy.h) * 0.5;
      if(dist > curRadius + enemyR + 12 || dist < curRadius - arc.maxWidth - enemyR - 12) return;
      let diff = Math.atan2(dy, dx) - arc.angle;
      while(diff < -Math.PI) diff += Math.PI * 2;
      while(diff > Math.PI) diff -= Math.PI * 2;
      if(Math.abs(diff) <= (arc.arcSpan * 0.5) + 0.14){
        arc.hitSet.add(enemy);
        damageEnemy(enemy, arc.damage);
        spawnParticles(enemy.x, enemy.y, '#00e5ff', 4);
        spawnParticles(enemy.x, enemy.y, '#ff1744', 3);
        spawnParticles(enemy.x, enemy.y, '#ffd54f', 3);
      }
    });
    const numSparkles = Math.random() < 0.85 ? 2 : 1;
    for(let s = 0; s < numSparkles; s++){
      const a = arc.angle - arc.arcSpan * 0.5 + Math.random() * arc.arcSpan;
      const r = curRadius + (Math.random() - 0.5) * (arc.maxWidth * 0.8);
      const px = arc.startX + Math.cos(a) * r;
      const py = arc.startY + Math.sin(a) * r;
      const speed = 25 + Math.random() * 45;
      const col = RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)];
      particles.push({
        x: px,
        y: py,
        vx: Math.cos(a) * speed + (Math.random() - 0.5) * 18,
        vy: Math.sin(a) * speed + (Math.random() - 0.5) * 18,
        life: 0.28,
        maxLife: 0.28,
        color: col
      });
    }
  }
  for(let i=summonedSpirits.length-1;i>=0;i--){const spirit=summonedSpirits[i];if(!spirit.permanent){spirit.life-=dt;if(spirit.life<=0){summonedSpirits.splice(i,1);continue;}}spirit.attackTimer=Math.max(0,spirit.attackTimer-dt);const target=findNearestRevealedEnemy(spirit.x,spirit.y,420);if(!target)continue;const dx=target.x-spirit.x,dy=target.y-spirit.y,d=Math.hypot(dx,dy)||1;if(d<Math.max(target.w,target.h)*.45+12){if(spirit.attackTimer<=0){damageEnemy(target,spirit.damage);spirit.attackTimer=spirit.attackRate||0.8;spawnParticles(target.x,target.y,'#9beeff',3);}}else{spirit.x+=dx/d*spirit.speed*60*dt;spirit.y+=dy/d*spirit.speed*60*dt;}}
  for(let i=voidRifts.length-1;i>=0;i--){const rift=voidRifts[i];if(!rift||!Number.isFinite(rift.x)||!Number.isFinite(rift.y)||!Number.isFinite(rift.radius)||rift.radius<=0){voidRifts.splice(i,1);continue;}rift.life-=dt;rift.tick-=dt;rift.phase=(Number.isFinite(rift.phase)?rift.phase:0)+dt*3;if(rift.tick<=0){rift.tick=.3;forEachEnemyNear(rift.x,rift.y,rift.radius,enemy=>{if(enemy.hp<=0||!enemyIsRevealed(enemy))return;const distance=Math.hypot(enemy.x-rift.x,enemy.y-rift.y);if(!Number.isFinite(distance)||distance>rift.radius)return;const boss=Boolean(ENEMY_TYPES[enemy.type]?.boss);if(!boss){const pull=Math.min(distance,(rift.pullStrength||0)*60*.3),d=distance||1;enemy.x+=(rift.x-enemy.x)/d*pull;enemy.y+=(rift.y-enemy.y)/d*pull;}if(rift.singularity && !boss){
          if(enemy.hp <= 350 || (enemy.baseHp || 30) <= 90){
            damageEnemy(enemy, 99999);
          } else {
            const crushDmg = Math.max(160, Math.floor(enemy.maxHp * 0.08));
            damageEnemy(enemy, crushDmg);
          }
        } else {
          damageEnemy(enemy, rift.damage);
        }});}if(rift.life<=0)voidRifts.splice(i,1);}
}
function drawWeaponField(field){
  if(!field || field.life <= 0) return;
  const x = field.x - camera.x, y = field.y - camera.y;
  const r = field.radius;
  if(!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(r) || r <= 0) return;
  const phase = Number.isFinite(field.phase) ? field.phase : 0;
  const maxL = (Number.isFinite(field.maxLife) && field.maxLife > 0) ? field.maxLife : 1;
  const pulse = .88 + .12 * Math.sin(performance.now() * .012 + phase);
  ctx.save();
  ctx.globalAlpha=Math.max(0,Math.min(1,field.life/Math.min(.35,maxL)))*pulse;
  const g=ctx.createRadialGradient(x,y,r*.06,x,y,r);
  g.addColorStop(0,'rgba(7,2,18,.86)');
  g.addColorStop(.36,'rgba(50,18,88,.52)');
  g.addColorStop(1,'rgba(124,73,190,0)');
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.arc(x,y,field.radius,0,Math.PI*2);
  ctx.fill();
  ctx.translate(x,y);
  ctx.rotate(field.phase + performance.now() * 0.0015);
  // High-res Void Rift singularity core
  const coreSize = field.radius * (field.singularity ? 1.5 : 1.15);
  drawSprite('void_rift', -coreSize/2, -coreSize/2, coreSize, coreSize);
  ctx.strokeStyle='rgba(210,169,255,.75)';
  ctx.lineWidth=2;
  for(let ring=0;ring<3;ring++){
    ctx.beginPath();
    ctx.ellipse(0,0,field.radius*(.25+ring*.2),field.radius*(.18+ring*.17),ring*.7,0,Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();
}
function drawFireBreath(_fb){
  // Pure pixel-art animation on Zak sprite is used instead of canvas cone effect
}

function drawWeaponSwing(swing){
  if(!swing || swing.life <= 0) return;
  const sx = swing.followPlayer ? (player.x + player.w/2) : swing.x;
  const sy = swing.followPlayer ? (player.y + player.h/2) : swing.y;
  const x = sx - camera.x, y = sy - camera.y;
  const alpha = Math.max(0, Math.min(1, swing.life / swing.maxLife));
  ctx.save();
  ctx.globalAlpha = alpha * 0.72;
  ctx.fillStyle = swing.color;
  ctx.strokeStyle = swing.isCleaver ? '#ffab00' : '#fff2b3';
  ctx.lineWidth = swing.isCleaver ? 4 : 3;
  ctx.shadowColor = swing.color;
  ctx.shadowBlur = swing.isCleaver ? 24 : 16;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, swing.range, swing.fullCircle ? 0 : swing.angle - swing.arc/2, swing.fullCircle ? Math.PI*2 : swing.angle + swing.arc/2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Render Weapon sprite thrusting & sweeping along the swing arc smoothly at 60fps
  const progress = 1 - (swing.life / swing.maxLife);
  const isFacingLeft = Boolean(swing.facingLeft ?? (swing.angle === Math.PI || Math.cos(swing.angle) < -0.1));

  // Consistent overhead chop (from top to bottom) regardless of facing direction!
  const swingAngle = swing.fullCircle
    ? (swing.angle + progress * Math.PI * 2)
    : (isFacingLeft
        ? (swing.angle + swing.arc/2 - progress * swing.arc)
        : (swing.angle - swing.arc/2 + progress * swing.arc));

  if (swing.isCleaver) {
    const cleaverLen = swing.range * 0.82; // Downscaled by ~35% for clean, balanced feel
    const cleaverThick = cleaverLen * (204 / 299);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(swingAngle);
    if (isFacingLeft) {
      ctx.scale(1, -1);
    }
    ctx.globalAlpha = alpha * 0.98;
    if (rukCleaverHorizontalImg.complete && rukCleaverHorizontalImg.naturalWidth > 0) {
      ctx.drawImage(rukCleaverHorizontalImg, 0, -cleaverThick / 2, cleaverLen, cleaverThick);
    } else {
      drawSprite('orcCleaver', 0, -cleaverThick / 2, cleaverLen, cleaverThick);
    }
    ctx.restore();
  } else {
    const spearLen = swing.range * 0.95;
    const spearThick = 24;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(swingAngle);
    ctx.globalAlpha = alpha * 0.95;
    drawSprite('spear', 0, -spearThick/2, spearLen, spearThick);
    ctx.restore();
  }

  ctx.restore();
}
function drawSummonedSpirit(spirit){
  const x=spirit.x-camera.x,y=spirit.y-camera.y,size=spirit.permanent?32:26;
  ctx.save();
  ctx.globalAlpha=spirit.permanent?1:.88;
  ctx.shadowColor=spirit.permanent?'#bd83ff':'#72e8ff';
  ctx.shadowBlur=18;
  drawSprite('spirit',x-size/2,y-size/2,size,size);
  ctx.restore();
  if(spirit.permanent)drawHealthBar(x,y-size/2-4,size,spirit.hp/spirit.maxHp,'#bd83ff');
}
function scaleWeaponStats(stats){const area=Number.isFinite(player.areaMult)?player.areaMult:1;const dur=Number.isFinite(player.durationMult)?player.durationMult:1;return {...stats,...(stats.radius!==undefined?{radius:stats.radius*area}:{}),...(stats.range!==undefined?{range:stats.range*area}:{}),...(stats.arcRange!==undefined?{arcRange:stats.arcRange*area}:{}),...(stats.duration!==undefined?{duration:stats.duration*dur}:{})};}
function fireWeapon(w,stats){
  if(maskOfCalmActive) return;
  stats={...stats,...(stats.count!==undefined&&player.bonusProjectiles?{count:stats.count+player.bonusProjectiles}:{}),...(stats.speed!==undefined?{speed:stats.speed*player.projSpeedMult}:{}),...(stats.pierce!==undefined?{pierce:stats.pierce+player.extraPierce}:{})};
  // Twin Shot ability
  if(player.abilities && player.abilities.includes('twin_shot') && stats.count !== undefined){
    stats.count *= 2;
  }
  const activeMount=getActiveMount();
  if(activeMount?.damageMult) stats.damage*=activeMount.damageMult;
  if(w.id.toLowerCase().includes('fire')||w.id.toLowerCase().includes('ember')){
    const asheBonus=companions.some(c=>c.id==='ashe')?1.10:1;
    stats.damage*=asheBonus;
  }
  const px=player.x+player.w/2,py=player.y+player.h/2;

  // Ruk's default weapon: Stonejaw Cleaver
  if(w.id==='orcCleaver'){
    const range = (stats.range || 180) * (player.areaMult || 1);
    let target = null;
    let aimAngle;
    if (window.GAME_SETTINGS && window.GAME_SETTINGS.manualAim && (player.aimDirX || player.aimDirY)) {
      aimAngle = (player.aimDirX < 0) ? Math.PI : 0;
      target = findNearestRevealedEnemy(px, py, range + 40);
    } else {
      target = findNearestRevealedEnemy(px, py, range + 40);
      if (!target) return false;
      aimAngle = (target.x < px) ? Math.PI : 0;
    }
    if (!target && (!window.GAME_SETTINGS?.manualAim || (!player.aimDirX && !player.aimDirY))) return false;

    player.facing = (aimAngle === Math.PI) ? -1 : 1;
    const arcAngle = stats.arc || (Math.PI * 0.70);
    const swingDur = 0.26;
    const isFacingLeft = (aimAngle === Math.PI);

    meleeSwings.push({
      x: px, y: py,
      angle: aimAngle,
      range: range,
      arc: arcAngle,
      life: swingDur,
      maxLife: swingDur,
      color: 'rgba(255, 120, 20, 0.45)',
      isCleaver: true,
      facingLeft: isFacingLeft,
      followPlayer: true
    });

    forEachEnemyNear(px, py, range + 48, enemy => {
      if(!enemyIsRevealed(enemy)) return;
      const dx = enemy.x - px, dy = enemy.y - py;
      const distance = Math.hypot(dx, dy);
      if(distance > range + Math.max(enemy.w, enemy.h) * 0.4) return;
      const delta = Math.atan2(Math.sin(Math.atan2(dy, dx) - aimAngle), Math.cos(Math.atan2(dy, dx) - aimAngle));
      if(Math.abs(delta) <= arcAngle / 2){
        damageEnemy(enemy, stats.damage * (player.meleeDamageBonus || 1));
        const kbMult = Math.max(0, 1 - (enemy.knockbackResist || 0));
        const kPower = (38 + (player.knockbackPower || 0)) * kbMult;
        enemy.x += Math.cos(Math.atan2(dy, dx)) * kPower;
        enemy.y += Math.sin(Math.atan2(dy, dx)) * kPower;
        for(let p = 0; p < 4; p++){
          particles.push({
            x: enemy.x + enemy.w/2, y: enemy.y + enemy.h/2,
            vx: (Math.random() - 0.5) * 160 + (aimAngle === Math.PI ? -80 : 80),
            vy: (Math.random() - 0.5) * 160,
            life: 0.22, maxLife: 0.22,
            color: Math.random() < 0.5 ? '#ffca28' : '#ff5722',
            size: 3 + Math.random() * 3
          });
        }
      }
    });

    screenShakeIntensity = Math.max(screenShakeIntensity || 0, 5);
    playSfx('attack');
    return true;
  }

  // Borin's default weapon: Spiked Warhammer (Upward arc lob & spinning smash)
  if(w.id==='warhammer'){
    const count = stats.count || 1;
    let target = findNearestRevealedEnemy(px, py, 340);
    let aimDir;
    if (window.GAME_SETTINGS && window.GAME_SETTINGS.manualAim && (player.aimDirX || player.aimDirY)) {
      aimDir = (player.aimDirX < 0) ? -1 : 1;
    } else if (target) {
      aimDir = (target.x < px) ? -1 : 1;
    } else {
      aimDir = (player.facing < 0 || (player.aimDirX < 0)) ? -1 : 1;
    }
    player.facing = aimDir;

    // Extended horizontal reach as requested: around 180-300 px
    let targetDist = target ? Math.abs(target.x - px) : 240;
    targetDist = Math.max(180, Math.min(300, targetDist));

    const flightTime = 0.85; // ~51 frames
    const frames = flightTime * 60;
    const baseVx = aimDir * (targetDist / frames);

    for(let k = 0; k < count; k++){
      const spread = (k - (count - 1) / 2) * 0.55;
      projectiles.push({
        x: px + aimDir * 8,
        y: py - 8,
        vx: baseVx + spread,
        vy: -6.4,
        gravity: 0.25,
        spinSpeed: aimDir * 18,
        angle: 0,
        damage: stats.damage,
        pierce: 999,
        hitList: new Set(),
        life: flightTime,
        maxLife: flightTime,
        sprite: 'warhammer',
        behavior: 'warhammer',
        w: 36, h: 36,
        impactRadius: stats.radius || 75,
        knockback: stats.knockback || 45
      });
    }
    screenShakeIntensity = Math.max(screenShakeIntensity || 0, 3);
    playSfx('attack');
    return true;
  }

  // Caelen's default weapon: Chain Whip (Straight forward pierce snap)
  if(w.id==='chainWhip'){
    const range = (stats.range || 215) * (player.areaMult || 1);
    let target = findNearestRevealedEnemy(px, py, range + 60);
    let aimDir;
    if (window.GAME_SETTINGS && window.GAME_SETTINGS.manualAim && (player.aimDirX || player.aimDirY)) {
      aimDir = (player.aimDirX < 0) ? -1 : 1;
    } else if (target) {
      aimDir = (target.x < px) ? -1 : 1;
    } else {
      aimDir = (player.facing < 0 || (player.aimDirX < 0)) ? -1 : 1;
    }
    player.facing = aimDir;

    const dur = stats.duration || 0.26;
    const isFacingLeft = (aimDir < 0);

    activeChainWhips.push({
      facingLeft: isFacingLeft,
      range: range,
      damage: stats.damage,
      knockback: stats.knockback || 30,
      life: dur, maxLife: dur
    });

    const minX = isFacingLeft ? (px - range) : px;
    const maxX = isFacingLeft ? px : (px + range);
    const whipY = py - 4;

    forEachEnemyNear(px + aimDir * range * 0.5, whipY, range * 0.65, enemy => {
      if(enemy.hp <= 0 || !enemyIsRevealed(enemy)) return;
      const ex = enemy.x + enemy.w/2, ey = enemy.y + enemy.h/2;
      if(ex >= minX && ex <= maxX && Math.abs(ey - whipY) <= 42){
        damageEnemy(enemy, stats.damage * (player.meleeDamageBonus || 1));
        const whipKbMult = Math.max(0, 1 - (enemy.knockbackResist || 0));
        enemy.x += aimDir * (stats.knockback || 30) * whipKbMult;
        for(let p = 0; p < 4; p++){
          particles.push({
            x: ex, y: ey,
            vx: (Math.random() - 0.5) * 140 + aimDir * 60,
            vy: (Math.random() - 0.5) * 140,
            life: 0.2, maxLife: 0.2,
            color: Math.random() < 0.5 ? '#ff9800' : '#ffd54f',
            size: 3 + Math.random() * 3
          });
        }
      }
    });

    screenShakeIntensity = Math.max(screenShakeIntensity || 0, 4);
    playSfx('attack');
    return true;
  }

  // Ari's default weapon: Elven Bow (Rapid Piercing Arrows)
  if(w.id==='elvenBow'){
    const count = stats.count || 1;
    let targets = findKNearestRevealedEnemies(px, py, count);
    if(targets.length > 0){
      if(targets[0].x < px) player.facing = -1;
      else if(targets[0].x > px) player.facing = 1;
      for(const t of targets){
        const dx = (t.x + t.w/2) - px, dy = (t.y + t.h/2) - (py - 4), d = Math.sqrt(dx*dx + dy*dy) || 1;
        const vx = dx/d * stats.speed, vy = dy/d * stats.speed;
        projectiles.push({
          x: px, y: py - 4, vx, vy,
          damage: stats.damage,
          pierce: stats.pierce || 2,
          life: 1.4,
          sprite: 'arrow',
          w: 36, h: 14,
          angle: Math.atan2(vy, vx)
        });
      }
    } else {
      const aimDir = (player.facing < 0 || (player.aimDirX < 0)) ? -1 : 1;
      player.facing = aimDir;
      for(let k = 0; k < count; k++){
        const spreadAngle = (k - (count - 1) / 2) * 0.12;
        const angle = (aimDir < 0 ? Math.PI : 0) + spreadAngle;
        const vx = Math.cos(angle) * stats.speed, vy = Math.sin(angle) * stats.speed;
        projectiles.push({
          x: px, y: py - 4, vx, vy,
          damage: stats.damage,
          pierce: stats.pierce || 2,
          life: 1.4,
          sprite: 'arrow',
          w: 36, h: 14,
          angle: angle
        });
      }
    }
    playSfx('shoot');
    return true;
  }

  // Zak's default weapon: Fire Breath / Dragon Inferno
  // Only fires when enemies are within his default weapon radius!
  if(w.id==='fireBreath'||w.id==='dragonInferno'){
    const isEvo = w.id === 'dragonInferno';
    const range = (stats.range || (isEvo ? 260 : 170)) * (player.areaMult || 1);
    let target = null;
    let aimAngle;
    if (window.GAME_SETTINGS && window.GAME_SETTINGS.manualAim && (player.aimDirX || player.aimDirY)) {
      aimAngle = (player.aimDirX < 0) ? Math.PI : 0;
      target = findNearestRevealedEnemy(px, py, range + 20);
    } else {
      target = findNearestRevealedEnemy(px, py, range + 20);
      if (!target) {
        return false; // No enemies in Zak's default weapon radius -> do not attack!
      }
      aimAngle = (target.x < px) ? Math.PI : 0;
    }

    if (!target && (!window.GAME_SETTINGS?.manualAim || (!player.aimDirX && !player.aimDirY))) {
      return false;
    }

    player.facing = (aimAngle === Math.PI) ? -1 : 1;
    const breathDuration = stats.duration || (isEvo ? 0.65 : 0.52);
    player.fireBreathTimer = breathDuration;
    player.fireBreathMax = breathDuration;
    player.fireBreathAngle = aimAngle;
    player.fireBreathStats = { ...stats, range };

    fireBreaths.push({
      x: px,
      y: py,
      angle: aimAngle,
      range,
      damage: stats.damage,
      isEvo,
      life: breathDuration,
      maxLife: breathDuration,
      tickTimer: 0.05
    });

    screenShakeIntensity = Math.max(screenShakeIntensity || 0, isEvo ? 5 : 3);
    playSfx('attack');
    return true;
  }

  const hasAliveNear = anyRevealedEnemyAlive || Boolean(window.GAME_SETTINGS?.manualAim) || enemies.some(e => e.hp > 0 && Math.hypot(e.x - px, e.y - py) < ((stats.range || 500) + 120));
  if(['wand','knife','crossbow','frostbolt','bombard','arcaneBarrage','arrowstorm','spear','glaiveSun','tome','necromancerGrimoire','voidRift','singularity','prismStaff','rainbowBarrage','frostBeam','permafrost'].includes(w.id)&&!hasAliveNear)return false;
  playSfx('attack');
  const firstProjectile=projectiles.length;
  let aimX = px, aimY = py;
    if (window.GAME_SETTINGS.manualAim) {
      aimX = px + (player.aimDirX || 0) * 200;
      aimY = py + (player.aimDirY || 0) * 200;
    }

  if(w.id==='frostBeam'||w.id==='permafrost'){
    let baseAngle;
    if (window.GAME_SETTINGS && window.GAME_SETTINGS.manualAim && (player.aimDirX || player.aimDirY)) {
      baseAngle = Math.atan2(player.aimDirY || 0, player.aimDirX || 0);
    } else {
      let target = findNearestRevealedEnemy(px, py, stats.range) || findNearestRevealedEnemy(px, py);
      if (!target) {
        let bestDistSq = stats.range * stats.range;
        for (let i = 0, len = enemies.length; i < len; i++) {
          const e = enemies[i];
          if (!e || e.hp <= 0 || e.passive || ENEMY_TYPES[e.type]?.passive) continue;
          const d2 = (e.x - px) * (e.x - px) + (e.y - py) * (e.y - py);
          if (d2 < bestDistSq) {
            bestDistSq = d2;
            target = e;
          }
        }
      }
      if (target) {
        baseAngle = Math.atan2(target.y - py, target.x - px);
      } else {
        baseAngle = player.facing < 0 ? Math.PI : 0;
      }
    }
    const isPermafrost = w.id === 'permafrost';
    const effectiveWidth = isPermafrost ? stats.width * 2 : stats.width;
    const x2 = px + Math.cos(baseAngle) * stats.range;
    const y2 = py + Math.sin(baseAngle) * stats.range;
    const hitSet = new Set();
    const hitRadiusBase = Math.max(effectiveWidth * 0.5, 6) + 8;
    for (let i = 0, len = enemies.length; i < len; i++) {
      const enemy = enemies[i];
      if (!enemy || enemy.hp <= 0 || hitSet.has(enemy)) continue;
      const hitRadius = hitRadiusBase + Math.max(enemy.w, enemy.h) * 0.5;
      if (distToSegmentSq(enemy.x, enemy.y, px, py, x2, y2) <= hitRadius * hitRadius) {
        hitSet.add(enemy);
        enemy.frozen = true;
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.frozenTimer = Math.max(enemy.frozenTimer || 0, stats.freezeDuration || 1.8);
        enemy.slowTimer = Math.max(enemy.slowTimer || 0, (stats.freezeDuration || 1.8) + 1.2);
        enemiesFrozenRun = (enemiesFrozenRun || 0) + 1;
        damageEnemy(enemy, stats.damage);
        spawnParticles(enemy.x, enemy.y, '#80d8ff', 8);
        spawnParticles(enemy.x, enemy.y, '#ffffff', 4);
      }
    }
    prismBeams.push({x1:px, y1:py, x2, y2, angle:baseAngle, range:stats.range, width:effectiveWidth, life:0.22, maxLife:0.22, isFrost:true, isPermafrost});
  }else if(w.id==='prismStaff'||w.id==='rainbowBarrage'){
    const isBarrage = w.id === 'rainbowBarrage';
    let baseAngle;
    if (window.GAME_SETTINGS && window.GAME_SETTINGS.manualAim && (player.aimDirX || player.aimDirY)) {
      baseAngle = Math.atan2(player.aimDirY || 0, player.aimDirX || 0);
    } else {
      const target = findNearestRevealedEnemy(px, py, stats.range) || findNearestRevealedEnemy(px, py);
      if (target) {
        baseAngle = Math.atan2(target.y - py, target.x - px);
      } else {
        baseAngle = player.facing < 0 ? Math.PI : 0;
      }
    }
    const hitSet = new Set();
    const arcSpan = Math.PI * (105 / 180);
    if(!isBarrage){
      const arc = {
        startX: px,
        startY: py,
        angle: baseAngle,
        arcSpan: arcSpan,
        radius: stats.range,
        maxWidth: Math.max(22, (stats.width || 18) * 1.5),
        damage: stats.damage,
        life: 0.4,
        maxLife: 0.4,
        hitSet: new Set()
      };
      forEachEnemyNear(px, py, stats.range + 80, enemy => {
        if(enemy.hp <= 0 || !enemyIsRevealed(enemy) || arc.hitSet.has(enemy)) return;
        const dx = enemy.x - px, dy = enemy.y - py;
        const dist = Math.hypot(dx, dy);
        const enemyR = Math.max(enemy.w, enemy.h) * 0.5;
        if(dist > stats.range + enemyR) return;
        let diff = Math.atan2(dy, dx) - baseAngle;
        while(diff < -Math.PI) diff += Math.PI * 2;
        while(diff > Math.PI) diff -= Math.PI * 2;
        if(Math.abs(diff) <= (arcSpan * 0.5) + 0.14){
          arc.hitSet.add(enemy);
          damageEnemy(enemy, stats.damage);
          spawnParticles(enemy.x, enemy.y, '#00e5ff', 4);
          spawnParticles(enemy.x, enemy.y, '#ff1744', 3);
          spawnParticles(enemy.x, enemy.y, '#ffd54f', 3);
        }
      });
      rainbowArcs.push(arc);
    }else{
      for(let i=0; i<4; i++){
        const a = baseAngle + i * (Math.PI / 2);
        const arc = {
          startX: px,
          startY: py,
          angle: a,
          arcSpan: arcSpan,
          radius: stats.range,
          maxWidth: Math.max(26, (stats.width || 22) * 1.5),
          damage: stats.damage,
          life: 0.4,
          maxLife: 0.4,
          hitSet: new Set()
        };
        forEachEnemyNear(px, py, stats.range + 80, enemy => {
          if(enemy.hp <= 0 || !enemyIsRevealed(enemy) || arc.hitSet.has(enemy)) return;
          const dx = enemy.x - px, dy = enemy.y - py;
          const dist = Math.hypot(dx, dy);
          const enemyR = Math.max(enemy.w, enemy.h) * 0.5;
          if(dist > stats.range + enemyR) return;
          let diff = Math.atan2(dy, dx) - a;
          while(diff < -Math.PI) diff += Math.PI * 2;
          while(diff > Math.PI) diff -= Math.PI * 2;
          if(Math.abs(diff) <= (arcSpan * 0.5) + 0.14){
            arc.hitSet.add(enemy);
            damageEnemy(enemy, stats.damage);
            spawnParticles(enemy.x, enemy.y, RAINBOW_COLORS[i % RAINBOW_COLORS.length], 5);
          }
        });
        rainbowArcs.push(arc);
      }
    }
  }else if(w.id==='spear'||w.id==='glaiveSun'){
    let aim;
    if(player.moving && Math.hypot(player.lastMoveX||0, player.lastMoveY||0) > .1){
      aim = Math.atan2(player.lastMoveY, player.lastMoveX);
    } else if(player.facingY === -1){
      aim = -Math.PI / 2;
    } else if(player.facingY === 1){
      aim = Math.PI / 2;
    } else {
      aim = player.facing < 0 ? Math.PI : 0;
    }
    const fullCircle = w.id === 'glaiveSun';
    meleeSwings.push({x:px, y:py, angle:aim, range:stats.arcRange, arc:stats.arcAngle, life:.2, maxLife:.2, color:fullCircle?'#ffd45c':'#f3e6ad', fullCircle, followPlayer:true});
    forEachEnemyNear(px, py, stats.arcRange + 48, enemy => {if(!enemyIsRevealed(enemy))return;const dx=enemy.x-px,dy=enemy.y-py,distance=Math.hypot(dx,dy);if(distance>stats.arcRange+Math.max(enemy.w,enemy.h)*.35)return;const delta=Math.atan2(Math.sin(Math.atan2(dy,dx)-aim),Math.cos(Math.atan2(dy,dx)-aim));if(fullCircle||Math.abs(delta)<=stats.arcAngle/2){damageEnemy(enemy,stats.damage*(player.meleeDamageBonus||1));enemy.x+=Math.cos(Math.atan2(dy,dx))*(35+(player.knockbackPower||0));enemy.y+=Math.sin(Math.atan2(dy,dx))*(35+(player.knockbackPower||0));}});
  }else if(w.id==='tome'||w.id==='necromancerGrimoire'){
    const permanent=w.id==='necromancerGrimoire';const count=Math.min(stats.count,8-summonedSpirits.length);
    for(let i=0;i<count;i++){const angle=Math.PI*2*(summonedSpirits.length+i)/8;summonedSpirits.push({x:px+Math.cos(angle)*22,y:py+Math.sin(angle)*22,life:stats.duration,permanent,damage:stats.damage,speed:stats.speed,attackTimer:.3+i*.12,hp:permanent?90:1,maxHp:permanent?90:1,nextHit:0,attackRate:stats.attackRate||0.8});spawnParticles(px+Math.cos(angle)*22,py+Math.sin(angle)*22,permanent?'#bd83ff':'#72e8ff',5);}
  }else if(w.id==='voidRift'||w.id==='singularity'){
    const targets=[];forEachEnemyNear(px,py,600,enemy=>{if(Number.isFinite(enemy.x)&&Number.isFinite(enemy.y)&&enemyIsRevealed(enemy)&&(enemy.x-px)**2+(enemy.y-py)**2<600*600)targets.push(enemy);});if(!targets.length)return;const target=targets[Math.floor(Math.random()*targets.length)];if(!Number.isFinite(target.x)||!Number.isFinite(target.y))return;const riftR=Number.isFinite(stats.radius)&&stats.radius>0?stats.radius:70;const riftDur=Number.isFinite(stats.duration)&&stats.duration>0?stats.duration:2.0;const riftPull=Number.isFinite(stats.pullStrength)?stats.pullStrength:0;if(voidRifts.length>=3)voidRifts.shift();voidRifts.push({x:target.x,y:target.y,radius:riftR,damage:stats.damage,pullStrength:riftPull,life:riftDur,maxLife:riftDur,tick:0,singularity:w.id==='singularity',phase:Math.random()*Math.PI*2});spawnParticles(target.x,target.y,w.id==='singularity'?'#cb8cff':'#7f55c9',18);
  }else if(w.id==='chrono'||w.id==='temporalLord'){
    return;
  }else if(w.id==='wand'||w.id==='knife'||w.id==='crossbow'||w.id==='frostbolt'){
    const targets=findKNearestRevealedEnemies(aimX,aimY,stats.count);
    if(!targets.length)return;
    let pw = 36, ph = 36;
    if(w.id==='knife'){ pw = 42; ph = 14; }
    else if(w.id==='crossbow'){ pw = 38; ph = 13; }
    else if(w.id==='frostbolt'){ pw = 42; ph = 20; }
    for(const t of targets){
      const dx=t.x-px,dy=t.y-py,d=Math.sqrt(dx*dx+dy*dy)||1;
      const vx=dx/d*stats.speed,vy=dy/d*stats.speed;
      projectiles.push({
        x:px,y:py,vx,vy,damage:stats.damage,
        pierce:stats.pierce||0,life:1.5,
        sprite:WEAPON_DEFS[w.id].sprite,
        w:pw,h:ph,
        angle:Math.atan2(vy,vx),
        slowDuration:w.id==='frostbolt'?1.6:0
      });
    }
  } else if(w.id==='arcaneBarrage'){
    const targets=findKNearestRevealedEnemies(aimX,aimY,stats.targets);
    for(const target of targets){
      const dx=target.x-px,dy=target.y-py,baseAngle=Math.atan2(dy,dx);
      for(let shot=0;shot<stats.shotsPerTarget;shot++){
        const angle=baseAngle+(shot-(stats.shotsPerTarget-1)/2)*.11;
        projectiles.push({x:px,y:py,vx:Math.cos(angle)*stats.speed,vy:Math.sin(angle)*stats.speed,damage:stats.damage,pierce:stats.pierce,life:1.6,sprite:WEAPON_DEFS['arcaneBarrage'].sprite,w:34,h:34,angle});
      }
    }
  } else if(w.id==='arrowstorm'){
    const target=findNearestRevealedEnemy(aimX,aimY);
    if(!target)return;
    const baseAngle=Math.atan2(target.y-py,target.x-px);
    for(let shot=0;shot<stats.count;shot++){
      const angle=baseAngle-stats.spread/2+stats.spread*(shot/(stats.count-1));
      projectiles.push({x:px,y:py,vx:Math.cos(angle)*stats.speed,vy:Math.sin(angle)*stats.speed,damage:stats.damage,pierce:stats.pierce,life:1.65,sprite:WEAPON_DEFS['arrowstorm'].sprite,w:50,h:14,angle,behavior:'arrowstorm'});
    }
  } else if(w.id==='aura'){
    const r2 = stats.radius * stats.radius;
    forEachEnemyNear(px, py, stats.radius, e => {
      const dx=e.x-px,dy=e.y-py;
      if(dx*dx+dy*dy<r2)damageEnemy(e,stats.damage);
    });
    particles.push({x:px,y:py,vx:0,vy:0,life:.4,maxLife:.4,color:'#ff9800',explosion:stats.radius});
    const rT=Math.floor(stats.radius/TILE);
    for(let k=0;k<3;k++){
      const tx=Math.floor(px/TILE)+Math.floor((Math.random()-.5)*2*rT);
      const ty=Math.floor(py/TILE)+Math.floor((Math.random()-.5)*2*rT);
      igniteTile(tx,ty);
    }
  } else if (w.id === 'boomerang') {
    const t = findNearestRevealedEnemy(px, py);
    const dx = t ? t.x - px : 1, dy = t ? t.y - py : 0;
    for (let k = 0; k < stats.count; k++) {
      const a = Math.atan2(dy, dx) + (k - (stats.count-1)/2) * 0.3;
      projectiles.push({
        x: px, y: py,
        vx: Math.cos(a)*stats.speed, vy: Math.sin(a)*stats.speed,
        damage: stats.damage, pierce: 999, life: 3,
        sprite: 'boomerang', w: 36, h: 28, angle: a,
        behavior: 'boomerang', age: 0, returnPhase: false
      });
    }
  } else if (w.id === 'chain') {
    const hitSet = new Set();
    let cur = { x: px, y: py };
    const chainPts = [{ x: px, y: py }];
    for (let j = 0; j < stats.jumps; j++) {
      const nearest = findNearestRevealedEnemy(cur.x, cur.y, stats.range, hitSet);
      if (!nearest) break;
      hitSet.add(nearest);
      chainPts.push({ x: nearest.x, y: nearest.y });
      damageEnemy(nearest, stats.damage);
      cur = { x: nearest.x, y: nearest.y };
    }
    if (chainPts.length > 1) {
      chainVisuals.push({ points: chainPts, life: 0.3, maxLife: 0.3 });
    }
  } else if (w.id === 'bow') {
    const targets = findKNearestRevealedEnemies(px, py, stats.count);
    for (const t of targets) {
      const dx = t.x - px, dy = t.y - py;
      const d = Math.sqrt(dx*dx+dy*dy) || 1;
      projectiles.push({
        x: px, y: py,
        vx: dx/d*stats.speed, vy: dy/d*stats.speed,
        damage: stats.damage, pierce: stats.pierce, life: 1.2,
        sprite: 'arrow', w: 44, h: 12,
        angle: Math.atan2(dy, dx)
      });
    }
  } else if (w.id === 'mine') {
    for (let k = 0; k < stats.count; k++) {
      const a = Math.random() * Math.PI * 2;
      const d = 20 + Math.random() * 30;
      mines.push({
        x: px + Math.cos(a)*d, y: py + Math.sin(a)*d,
        w: 30, h: 30,
        armTime: 0.6, fuse: 3.5, spin: Math.random()*Math.PI*2,
        damage: stats.damage, radius: stats.radius
      });
    }
  } else if (w.id === 'holyWater') {
    const t = findNearestRevealedEnemy(px, py);
    if (!t) return;
    const dx = t.x - px, dy = t.y - py;
    const d = Math.sqrt(dx*dx+dy*dy) || 1;
    projectiles.push({
      x: px, y: py,
      vx: dx/d*8, vy: dy/d*8,
      damage: 0, pierce: 0, life: d/8/60,
      sprite: 'holy_water', w: 28, h: 28,
      angle: Math.atan2(dy, dx),
      behavior: 'holyThrow',
      targetX: t.x, targetY: t.y,
      holyRadius: stats.radius, holyDamage: stats.damage, holyDuration: stats.duration
    });
  } else if(w.id==='bombard'){
    const targets=findKNearestRevealedEnemies(aimX,aimY,stats.count);
    for(const target of targets){
      const dx=target.x-px,dy=target.y-py,d=Math.hypot(dx,dy)||1;
      projectiles.push({
        x:px,y:py,vx:dx/d*9,vy:dy/d*9,damage:0,pierce:0,life:Math.max(.08,d/(9*60)),
        sprite:'goblin_bomb',w:32,h:32,angle:Math.atan2(dy,dx),behavior:'bombard',
        targetX:target.x,targetY:target.y,bombRadius:stats.radius,bombDamage:stats.damage
      });
    }
  } else if(typeof WEAPON_DEFS[w.id]?.fire==='function'){
    let dirX=player.lastMoveX||0,dirY=player.lastMoveY||0;
    if(Math.hypot(dirX,dirY)<=.1){
      dirX=player.facing<0?-1:1;
      dirY=player.facingY===-1?-1:player.facingY===1?1:0;
    }else{
      const d=Math.hypot(dirX,dirY)||1;
      dirX/=d;dirY/=d;
    }
    for(const shot of WEAPON_DEFS[w.id].fire(px,py,dirX,dirY,stats,w.level))projectiles.push(shot);
  }
  for(let i=firstProjectile;i<projectiles.length;i++){const projectile=projectiles[i];if(projectile.damage<=0||projectile.behavior==='boomerang')continue;if(relicModifiers.ricochet){projectile.ricochets=1;projectile.hitTargets=[];}else if(player.ricochetChance>0&&Math.random()<player.ricochetChance){projectile.ricochets=1;projectile.hitTargets=[];}}
}

export { baseDamageEnemy, damageEnemy, updateCampCompanions, getCachedRainbowGradient, drawRainbowArc, drawPrismBeam, updateWeaponFields, drawWeaponField, drawWeaponSwing, drawFireBreath, drawSummonedSpirit, scaleWeaponStats, fireWeapon };
