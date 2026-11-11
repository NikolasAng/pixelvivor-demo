import { ENEMY_SPEED_MULT, ENEMY_TYPES, isFlyingEnemy } from './entities.mjs?v336';
import { TILE } from './underground.mjs?v336';
import { isNight, isBloodMoon, enemies } from './state.mjs?v336';
import { playSfx } from './audio.mjs?v336';
import { forEachEnemyNear } from './spatial.mjs?v336';
import { damageEnemy } from './weapons-combat.mjs?v336';
import { spawnParticles } from './relics-achievements.mjs?v336';
import { applyPlayerDamage } from './player-movement.mjs?v336';

/**
 * Updates an individual enemy's movement, speed modifiers, soft-separation (flocking),
 * passive swimming/wandering, fish flopping, and dungeon wall collision.
 */
export function updateEnemyMovement(e, dt, {
  player,
  elapsed,
  chronoStats,
  eInDungeon,
  hasFriendlyFire,
  packCentroids,
  summonedSpirits
}) {
  // Blizzard falling descent & landing impact
  if (e.isFalling) {
    e.fallTimer = (e.fallTimer ?? 1.2) - dt;
    const progress = Math.max(0, Math.min(1, 1 - (e.fallTimer / (e.maxFallTimer || 1.2))));
    e.x = e.targetX;
    e.y = e.startY + (e.targetY - e.startY) * progress;
    if (e.fallTimer <= 0) {
      e.isFalling = false;
      e.x = e.targetX;
      e.y = e.targetY;
      spawnParticles(e.x, e.y, '#e0f7fa', 14);
      playSfx('hit');
      const dist = Math.hypot((player.x + player.w / 2) - e.x, (player.y + player.h / 2) - e.y);
      if (dist < 42) {
        applyPlayerDamage(Math.floor(e.damage * 0.75), 'blizzard', '#80deea');
      }
    }
    return;
  }

  // Speed modifiers (base 0.52 + scaling up to +0.22 as the run advances)
  const timeSpeedBonus = Math.min(0.22, (elapsed / 1500) * 0.22);
  let sp = e.speed * (ENEMY_SPEED_MULT + timeSpeedBonus);

  // Early game (levels 1-5): enemies move very slow to help new players
  if (player.level <= 5) {
    const levelSlow = 0.3 + (player.level - 1) * 0.14; // 0.3 at level 1, 0.86 at level 5
    sp *= levelSlow;
    if (typeof window !== 'undefined' && window.GAME_SETTINGS?.difficulty === 0) {
      sp *= 0.88;
    }
  }

  if (e.boss && e.phase === 2) sp *= 1.25;
  if (e.boss && e.phase === 3) sp *= 1.5;
  if (e.frozen && e.frozenTimer > 0 && !e.freezeImmune) sp = 0;
  if (e.slowTimer > 0) sp *= 0.48;
  if (e.upgradeSlowTimer > 0) sp *= (1 - player.frostSlow);
  if (e.dreamCatcherSlow) { sp *= 0.8; e.dreamCatcherSlow = false; }

  const eInAbyss = (e.x > 700000 * TILE && e.x < 900000 * TILE);
  if (ENEMY_TYPES[e.type]?.water) {
    sp *= (e.inWater === 0 && !eInAbyss) ? 0.6 : 1.4;
  } else if (!isFlyingEnemy(e)) {
    if (e.inWater === 2) sp *= 0.5;
    else if (e.inWater === 1) sp *= 0.7;
  }

  if (isNight() && e.type === 'vampire') sp *= 1.1;
  if (e.isVampireLord) sp *= (isBloodMoon ? 1.15 : 1);
  if (e.type === 'rooster' || ENEMY_TYPES[e.type]?.dasher) {
    e.dashCooldown = (e.dashCooldown ?? 2.2) - dt;
    if (e.dashCooldown <= 0) {
      e.dashCooldown = 2.4 + Math.random() * 0.8;
      e.dashBurstTimer = 0.38;
    }
    if (e.dashBurstTimer > 0) {
      e.dashBurstTimer = Math.max(0, e.dashBurstTimer - dt);
      sp *= 2.25;
    }
  }

  const dx = (player.x + player.w / 2) - e.x;
  const dy = (player.y + player.h / 2) - e.y;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;

  if (chronoStats && d < chronoStats.radius * player.areaMult) {
    sp *= (1 - chronoStats.slowAmount);
  }
  // Time Dilation ability: slow enemies when player HP < 25%
  if (player.timeDilationActive && d < 300) sp *= 0.70;
  // Time Freeze ability: freeze enemies for 3s
  if (player.timeFreezeActive > 0) sp = 0;

  const isWhale = (e.type === 'abyss_whale_1' || e.type === 'abyss_whale_2' || e.type === 'abyss_whale');
  let vx = (dx / d) * sp * dt * 60;
  let vy = (dy / d) * sp * dt * 60;

  // Ritualist channeling movement: maintain orbit around altar
  if (e.isRitualist && e.altarX != null) {
    e.ritualAngle = (e.ritualAngle || 0) + dt * 0.45;
    const targetX = e.altarX + Math.cos(e.ritualAngle) * 105;
    const targetY = e.altarY + Math.sin(e.ritualAngle) * 105;
    const rdx = targetX - e.x;
    const rdy = targetY - e.y;
    const rd = Math.hypot(rdx, rdy) || 1;
    vx = (rdx / rd) * Math.min(sp * dt * 60, rd);
    vy = (rdy / rd) * Math.min(sp * dt * 60, rd);
  }

  if (e.frozen && e.frozenTimer > 0 && !e.freezeImmune) {
    vx = 0;
    vy = 0;
  }

  // Passive creatures (Whales)
  if (e.passive || ENEMY_TYPES[e.type]?.passive) {
    if (e.passiveAngle === undefined) {
      const goRight = Math.random() < 0.5;
      e.passiveAngle = goRight ? (Math.random() - 0.5) * 0.35 : Math.PI + (Math.random() - 0.5) * 0.35;
      e.targetAngle = e.passiveAngle;
      e.passiveTimer = 10 + Math.random() * 15;
      e.swimSeed = Math.random() * 100;
    }
    e.passiveTimer -= dt;
    if (e.passiveTimer <= 0) {
      const goRight = Math.random() < 0.5;
      e.targetAngle = goRight ? (Math.random() - 0.5) * 0.35 : Math.PI + (Math.random() - 0.5) * 0.35;
      e.passiveTimer = 12 + Math.random() * 18;
    }
    let angleDiff = e.targetAngle - e.passiveAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    e.passiveAngle += angleDiff * Math.min(1, dt * 0.35);

    vx = Math.cos(e.passiveAngle) * sp * dt * 60;
    vy = Math.sin(e.passiveAngle) * sp * dt * 60;
  } else if (!e.frozen || e.frozenTimer <= 0) {
    // ═══ SOFT SEPARATION (Flocking / Anti-Stacking Force) ═══
    // Prevents mobs from collapsing into a single point, creating a natural surrounding circle
    if (!e.swarmMember) {
      const pDistX = Math.abs(e.x - (player.x + player.w / 2));
      const pDistY = Math.abs(e.y - (player.y + player.h / 2));
      // Skip expensive spatial separation for enemies far off-screen
      if (pDistX <= 750 && pDistY <= 600) {
        if (e._sepTick === undefined) e._sepTick = Math.floor(Math.random() * 2);
        e._sepTick = (e._sepTick + 1) % 2;
        // Recalculate every 2nd frame per mob, or every frame for bosses / ultra elites
        if (e._sepTick === 0 || e.boss || e.ultraElite || e._sepX === undefined) {
          const selfRadius = Math.max(e.w, e.h) * 0.44;
          const searchDist = selfRadius + 36;
          let sepX = 0, sepY = 0;

          forEachEnemyNear(e.x, e.y, searchDist, other => {
            if (other === e || other.hp <= 0 || other.passive) return;
            const edx = e.x - other.x;
            const edy = e.y - other.y;
            const otherRadius = Math.max(other.w, other.h) * 0.44;
            const minDist = selfRadius + otherRadius;
            const distSq = edx * edx + edy * edy;

            if (distSq < minDist * minDist && distSq > 0.0001) {
              const dist = Math.sqrt(distSq);
              const overlap = (minDist - dist) / minDist; // 0 (edges touch) to 1 (full overlap)

              // Bosses and Ultra-Elites have much higher mass: small mobs yield to them
              const otherWeight = other.boss ? 3.0 : (other.ultraElite ? 2.0 : 1.0);
              const selfWeight = e.boss ? 0.08 : (e.ultraElite ? 0.35 : 1.0);
              const push = overlap * otherWeight * selfWeight * 2.2;

              sepX += (edx / dist) * push;
              sepY += (edy / dist) * push;
            }
          });

          // Clamp separation impulse so mobs smoothly slide around each other without jitter
          const maxSep = Math.max(1.5, sp * dt * 60 * 1.6);
          const sepLen = Math.hypot(sepX, sepY);
          if (sepLen > maxSep && sepLen > 0) {
            sepX = (sepX / sepLen) * maxSep;
            sepY = (sepY / sepLen) * maxSep;
          }
          e._sepX = sepX;
          e._sepY = sepY;
        }

        vx += (e._sepX || 0);
        vy += (e._sepY || 0);
      }
    }
  }

  // Friendly Fire ability - enemies damage each other on collision (spatial grid query)
  if (hasFriendlyFire && e.hp > 0 && Math.random() < 0.08) {
    forEachEnemyNear(e.x, e.y, 44, other => {
      if (other === e || other.hp <= 0) return;
      const edx = e.x - other.x, edy = e.y - other.y;
      const minDist = (Math.max(e.w, e.h) + Math.max(other.w, other.h)) * 0.42;
      if (edx * edx + edy * edy < minDist * minDist && Math.random() < 0.25) {
        damageEnemy(other, e.damage * 0.5, { noProc: true });
        return false;
      }
    });
  }

  // Apex Predator hunter timer & fade-out
  if (e.isHunter && e.hp > 0) {
    e.hunterTimer = (e.hunterTimer ?? 30) - dt;
    if (e.hunterTimer <= 0) {
      e.hp = 0;
      e.deathTimer = 0.01;
      spawnParticles(e.x, e.y, '#e53935', 14);
      const remainingHunters = enemies.filter(o => o !== e && o.isHunter && o.hp > 0);
      if (remainingHunters.length === 0) {
        playSfx('confirm');
        const toast = document.createElement('div');
        toast.className = 'relic-toast';
        toast.style.borderColor = '#ef5350';
        toast.style.boxShadow = '0 0 25px rgba(239,83,80,0.6)';
        toast.innerHTML = `<strong style="color:#ff8a80">🐺 THE HUNT RETREATED!</strong><br/><span>You survived the apex predators!</span>`;
        document.getElementById('relicToasts')?.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    }
  }

  // Wolf pack cohesion
  if (e.type === 'wolf' && e.role === 'follower' && e.packId != null && d > 60 && packCentroids) {
    const pack = packCentroids.get(e.packId);
    if (pack) {
      const cx = pack.x - e.x, cy = pack.y - e.y, cd = Math.sqrt(cx * cx + cy * cy) || 1;
      vx += cx / cd * e.cohesion * sp * dt * 60 * 0.5;
      vy += cy / cd * e.cohesion * sp * dt * 60 * 0.5;
    }
  }

  // Fish hopping behavior on land
  const isFishOnLand = (e.type === 'fish' && (e.inWater === 0 || !e.inWater));
  if (isFishOnLand && (!e.frozen || e.frozenTimer <= 0)) {
    const flopPeriod = 0.65;
    e.flopTimer = ((e.flopTimer || 0) + dt) % flopPeriod;
    const flopProgress = e.flopTimer / flopPeriod;
    const jumpFraction = 0.62;

    if (flopProgress < jumpFraction) {
      const tJump = flopProgress / jumpFraction;
      e.jumpHeight = Math.sin(tJump * Math.PI) * 22;
      e.jumpAirborne = true;
      e.jumpProgress = tJump;
      const forwardMult = (1 / jumpFraction) * 1.35;
      vx *= forwardMult;
      vy *= forwardMult;
    } else {
      e.jumpHeight = 0;
      e.jumpAirborne = false;
      e.jumpProgress = 0;
      vx = 0;
      vy = 0;
    }
  } else if (e.type === 'fish') {
    e.jumpHeight = 0;
    e.jumpAirborne = false;
    e.jumpProgress = 0;
    e.flopTimer = 0;
  }

  if (!e.frozen || e.frozenTimer <= 0) {
    e.wobble += dt * 8;
    e.bob += dt * 6;
  } else {
    vx = 0;
    vy = 0;
  }

  // Run wall steering & sliding in dungeons and Dream Biome (around Dream Shop)
  const eInDream = (e.x > 550000 * TILE && e.x < 650000 * TILE);
  const eNearMountain = window.isMountainBlocked ? window.isMountainBlocked(e.x - 50, e.y - 50, e.w + 100, e.h + 100) : false;
  const eNearWell = window.isLifeWellBlocked ? window.isLifeWellBlocked(e.x - 40, e.y - 40, e.w + 80, e.h + 80) : false;
  if ((eInDungeon || eInDream || eNearMountain || eNearWell) && window.isWallCollision) {
    const lookAhead = 40;
    const testX = e.x + vx;
    const testY = e.y + vy;
    if (window.isWallCollision(testX, testY, e.w, e.h)) {
      const perp1X = -vy, perp1Y = vx;
      const perp2X = vy, perp2Y = -vx;
      const p1d = Math.sqrt(perp1X * perp1X + perp1Y * perp1Y) || 1;
      const p2d = Math.sqrt(perp2X * perp2X + perp2Y * perp2Y) || 1;
      const dir1Blocked = window.isWallCollision(e.x + (perp1X / p1d) * lookAhead, e.y + (perp1Y / p1d) * lookAhead, e.w, e.h);
      const dir2Blocked = window.isWallCollision(e.x + (perp2X / p2d) * lookAhead, e.y + (perp2Y / p2d) * lookAhead, e.w, e.h);
      if (!dir1Blocked) {
        vx += (perp1X / p1d) * sp * dt * 60 * 0.8;
        vy += (perp1Y / p1d) * sp * dt * 60 * 0.8;
      } else if (!dir2Blocked) {
        vx += (perp2X / p2d) * sp * dt * 60 * 0.8;
        vy += (perp2Y / p2d) * sp * dt * 60 * 0.8;
      }
    }
    const newX = e.x + vx;
    const newY = e.y + vy;
    if (!window.isWallCollision(newX, newY, e.w, e.h)) {
      e.x = newX;
      e.y = newY;
    } else if (!window.isWallCollision(newX, e.y, e.w, e.h)) {
      e.x = newX;
    } else if (!window.isWallCollision(e.x, newY, e.w, e.h)) {
      e.y = newY;
    }
  } else {
    e.x += vx;
    e.y += vy;
  }

  // Summoned Spirits damage
  if (summonedSpirits && summonedSpirits.length > 0) {
    for (let si = summonedSpirits.length - 1; si >= 0; si--) {
      const spirit = summonedSpirits[si];
      if (!spirit.permanent || elapsed < spirit.nextHit) continue;
      if (Math.hypot(e.x - spirit.x, e.y - spirit.y) < Math.max(e.w, e.h) * 0.35 + 12) {
        spirit.hp -= e.damage;
        spirit.nextHit = elapsed + 1;
        if (spirit.hp <= 0) {
          spawnParticles(spirit.x, spirit.y, '#bd83ff', 8);
          summonedSpirits.splice(si, 1);
        }
      }
    }
  }

  // Facing direction (flipX)
  if (isWhale) {
    if (Math.abs(vx) > 0.01) e.flipX = vx < 0;
  } else {
    const pdx = (player.x + player.w / 2) - e.x;
    if (Math.abs(pdx) > 2) e.flipX = pdx < 0;
  }

  // Direction & procedural animation timers (smooth continuous advance, prevents jitter)
  e.lastVx = vx;
  e.lastVy = vy;
  const isMoving = Math.hypot(vx, vy) > 0.08;
  e.animTimer = (e.animTimer || 0) + (isMoving ? dt : dt * 0.45);
  if (e.hp <= 0 && (!e.deathTimer || e.deathTimer === 0)) {
    e.deathTimer = 0.3;
  }
}
