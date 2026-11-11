// v95
export function createDamageHandler({player,spawnDamageNumber,getDamageMultiplier=()=>1,canDamage=()=>true}){
  return function damageEnemy(e,dmg){
    if(!canDamage(e))return false;
    if(e.passive || (e.damage <= 0 && e.xp <= 0))return false;
    const finalDmg=dmg*player.damageMultiplier*getDamageMultiplier();
    if(!Number.isFinite(finalDmg) || finalDmg<=0)return false;
    e.hp-=finalDmg;
    e.hitByPlayer=true;
    e.hitFlash=.12;
    e.showHpTimer=5.0;
    spawnDamageNumber(e.x,e.y-e.h/2,Math.round(finalDmg),'#fff');
    if(typeof window!=='undefined'&&window.playSfx){
      window.playSfx(e.hp<=0?'kill':'hit');
    }
    return true;
  };
}
