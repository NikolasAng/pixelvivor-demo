import { ENEMY_TYPES } from './entities.mjs?v336';
import { enemies, gameOver, gameStarted } from './game-core.mjs?v336';

const MUSIC_TRACKS={camp:'music/camp1.mp3',gameplay:'music/gameplay.mp3',boss:'music/boss.mp3',credits:'music/credits.mp3'};
const musicPlayer=new Audio();
musicPlayer.loop=true;
musicPlayer.preload='auto';
musicPlayer.volume=.34;

let currentMusicTrack='',audioUnlocked=false,audioEnabled=true,soundContext=null,soundMasterGain=null,soundCompressor=null;
let musicVolume=.34,sfxVolume=.75;
let whiteNoiseBuf=null,brownNoiseBuf=null;

// Polyphony & anti-lag throttling for 100+ simultaneous kills/hits
const lastSoundAt=new Map();
let activeSfxVoices=0;
const MAX_ACTIVE_SFX=12;
let pickupComboCount=0,lastPickupTime=0;

// Immersive Music Breathing (Natural atmospheric silence windows in gameplay)
let gameplaySilenceUntil=0;
let gameplayPlayStartedAt=0;
let musicFadeTimer=null;
let musicFadingOut=false;

try{
  // Use audio_v2 so any accidental 'off' state from the old unmarked 'M' hotkey is cleared
  audioEnabled=localStorage.getItem('pixelvivor.audio_v2')!=='off';
  const savedVolumes=JSON.parse(localStorage.getItem('pixelvivor.audioVolumes')||'{}');
  if(Number.isFinite(savedVolumes.music))musicVolume=Math.max(0,Math.min(1,savedVolumes.music));
  if(Number.isFinite(savedVolumes.sfx))sfxVolume=Math.max(0,Math.min(1,savedVolumes.sfx));
  musicPlayer.volume=musicVolume;
}catch{}

function isIntroOverlayActive(){
  const startEl=document.getElementById('startScreen');
  if(startEl&&startEl.style.display!=='none'&&getComputedStyle(startEl).display!=='none')return true;
  const storyEl=document.getElementById('storyIntroScreen');
  if(storyEl&&storyEl.style.display!=='none'&&getComputedStyle(storyEl).display!=='none')return true;
  return false;
}

function clearMusicFade(){
  if(musicFadeTimer){
    clearInterval(musicFadeTimer);
    musicFadeTimer=null;
  }
  musicFadingOut=false;
}

function fadeMusicTo(targetVol,durationMs,onDone){
  clearMusicFade();
  const steps=18;
  const stepMs=Math.max(20,Math.floor(durationMs/steps));
  const startVol=musicPlayer.volume;
  let step=0;
  if(targetVol<startVol)musicFadingOut=true;
  musicFadeTimer=setInterval(()=>{
    step++;
    const t=Math.min(1,step/steps);
    musicPlayer.volume=Math.max(0,Math.min(1,startVol+(targetVol-startVol)*t));
    if(step>=steps){
      clearMusicFade();
      if(onDone)onDone();
    }
  },stepMs);
}

musicPlayer.addEventListener('ended',()=>{
  if(currentMusicTrack==='gameplay'){
    // Natural silence window (45-75 seconds) for dark-fantasy atmosphere
    const silenceSec=45+Math.random()*30;
    gameplaySilenceUntil=performance.now()+silenceSec*1000;
  }
});

function syncMusicTrack(){
  if(!gameStarted&&isIntroOverlayActive())return;
  const bossAlive=enemies.some(enemy=>enemy.hp>0&&ENEMY_TYPES[enemy.type]?.boss);
  const desiredTrack=gameOver?'credits':!gameStarted?'camp':bossAlive?'boss':'gameplay';
  setMusicTrack(desiredTrack);
}

function setMusicTrack(track){
  if(!MUSIC_TRACKS[track])return;
  const now=performance.now();

  if(currentMusicTrack!==track){
    clearMusicFade();
    currentMusicTrack=track;
    gameplaySilenceUntil=0;
    gameplayPlayStartedAt=now;
    musicPlayer.loop=(track!=='gameplay');
    musicPlayer.volume=musicVolume;
    musicPlayer.src=MUSIC_TRACKS[track];
    if(audioEnabled&&audioUnlocked){
      musicPlayer.play().catch(()=>{});
    }
    return;
  }

  if(!audioEnabled||!audioUnlocked)return;

  if(track==='gameplay'){
    // If we are inside an atmospheric silence window, stay quiet until it expires
    if(gameplaySilenceUntil>now){
      if(!musicPlayer.paused&&!musicFadingOut)musicPlayer.pause();
      return;
    }
    // If silence window just finished, smoothly fade gameplay music back in
    if(gameplaySilenceUntil>0&&now>=gameplaySilenceUntil){
      gameplaySilenceUntil=0;
      gameplayPlayStartedAt=now;
      musicPlayer.currentTime=0;
      musicPlayer.volume=0.01;
      musicPlayer.play().then(()=>{
        fadeMusicTo(musicVolume,3200);
      }).catch(()=>{});
      return;
    }
    // Also trigger a smooth fade-out into a silence window after ~155-185s of continuous gameplay music
    if(!musicPlayer.paused&&!musicFadingOut&&gameplayPlayStartedAt>0&&(now-gameplayPlayStartedAt)>165000){
      const silenceSec=45+Math.random()*30;
      gameplaySilenceUntil=now+3500+silenceSec*1000;
      fadeMusicTo(0,3500,()=>{
        musicPlayer.pause();
        musicPlayer.volume=musicVolume;
      });
      return;
    }
  }

  if(musicPlayer.paused&&!musicFadingOut){
    musicPlayer.volume=musicVolume;
    gameplayPlayStartedAt=now;
    musicPlayer.play().catch(()=>{});
  }
}

function updateAudioToggle(){
  const button=document.getElementById('audioToggle');
  if(!button)return;
  button.textContent=audioEnabled?'MUSIC + SFX ON':'MUSIC + SFX OFF';
  button.setAttribute('aria-pressed',String(audioEnabled));
}

function initNoiseBuffers(ctx){
  if(whiteNoiseBuf&&brownNoiseBuf)return;
  const sr=ctx.sampleRate||44100;
  const len=Math.floor(sr*0.6);
  whiteNoiseBuf=ctx.createBuffer(1,len,sr);
  brownNoiseBuf=ctx.createBuffer(1,len,sr);
  const wData=whiteNoiseBuf.getChannelData(0);
  const bData=brownNoiseBuf.getChannelData(0);
  let lastOut=0;
  for(let i=0;i<len;i++){
    const white=Math.random()*2-1;
    wData[i]=white;
    lastOut=(lastOut+(0.02*white))/1.02;
    bData[i]=lastOut*3.2;
  }
}

function unlockAudio(){
  audioUnlocked=true;
  const AudioContextType=window.AudioContext||window.webkitAudioContext;
  if(AudioContextType){
    if(!soundContext){
      soundContext=new AudioContextType();
      soundCompressor=soundContext.createDynamicsCompressor();
      soundCompressor.threshold.setValueAtTime(-16,soundContext.currentTime);
      soundCompressor.knee.setValueAtTime(18,soundContext.currentTime);
      soundCompressor.ratio.setValueAtTime(6,soundContext.currentTime);
      soundCompressor.attack.setValueAtTime(0.003,soundContext.currentTime);
      soundCompressor.release.setValueAtTime(0.18,soundContext.currentTime);

      soundMasterGain=soundContext.createGain();
      soundMasterGain.gain.value=audioEnabled?sfxVolume:0;
      soundCompressor.connect(soundMasterGain);
      soundMasterGain.connect(soundContext.destination);
      initNoiseBuffers(soundContext);
    }
    if(soundContext.state==='suspended')soundContext.resume().catch(()=>{});
  }
  syncMusicTrack();
}

function toggleAudio(){
  audioEnabled=!audioEnabled;
  try{localStorage.setItem('pixelvivor.audio_v2',audioEnabled?'on':'off');}catch{}
  if(soundMasterGain)soundMasterGain.gain.value=audioEnabled?sfxVolume:0;
  updateAudioToggle();
  if(audioEnabled){unlockAudio();}else{clearMusicFade();musicPlayer.pause();}
}

const SFX_COOLDOWNS={
  hit:65,
  kill:85,
  explosion:95,
  pickup:52,
  attack:115,
  shoot:105,
  hurt:420,
  step_land:275,
  step_water:330,
  step_bush:150,
  step_squish:165,
  step_stone:160,
  step_crystal:175,
  splash_enter:220,
  splash_exit:220,
  dash:180,
  select:45,
  confirm:60,
  upgrade_open:180,
  upgrade_pick:120,
  relic:180,
  heal:180,
  buff:180,
  quest:200,
  warning:280,
  portal:240,
  boss:450,
  death:500,
  levelup:200,
  levelUp:200
};

function trackVoice(durationSec){
  activeSfxVoices++;
  setTimeout(()=>{
    activeSfxVoices=Math.max(0,activeSfxVoices-1);
  },Math.ceil(durationSec*1000)+25);
}

function playNoiseLayer(ctx,dest,{brown=false,filterType='bandpass',freq=800,freqEnd=0,q=1.2,gain=0.08,attack=0.005,duration=0.12,delay=0}){
  if(!whiteNoiseBuf)initNoiseBuffers(ctx);
  const src=ctx.createBufferSource();
  src.buffer=brown?brownNoiseBuf:whiteNoiseBuf;
  const filter=ctx.createBiquadFilter();
  filter.type=filterType;
  const start=ctx.currentTime+delay;
  filter.frequency.setValueAtTime(Math.max(30,freq),start);
  if(freqEnd>0){
    filter.frequency.exponentialRampToValueAtTime(Math.max(30,freqEnd),start+duration);
  }
  filter.Q.setValueAtTime(q,start);
  const g=ctx.createGain();
  g.gain.setValueAtTime(0.0001,start);
  g.gain.linearRampToValueAtTime(gain,start+attack);
  g.gain.exponentialRampToValueAtTime(0.0001,start+duration);
  src.connect(filter);
  filter.connect(g);
  g.connect(dest);
  src.start(start,Math.random()*0.15,duration+0.02);
  src.stop(start+duration+0.02);
}

function playToneLayer(ctx,dest,{wave='triangle',freq=440,freqEnd=0,gain=0.07,attack=0.006,duration=0.14,delay=0,detune=0}){
  const osc=ctx.createOscillator();
  const g=ctx.createGain();
  const start=ctx.currentTime+delay;
  osc.type=wave;
  osc.frequency.setValueAtTime(Math.max(24,freq),start);
  if(freqEnd>0){
    osc.frequency.exponentialRampToValueAtTime(Math.max(24,freqEnd),start+duration);
  }
  if(detune)osc.detune.setValueAtTime(detune,start);
  g.gain.setValueAtTime(0.0001,start);
  g.gain.linearRampToValueAtTime(gain,start+attack);
  g.gain.exponentialRampToValueAtTime(0.0001,start+duration);
  osc.connect(g);
  g.connect(dest);
  osc.start(start);
  osc.stop(start+duration+0.015);
}

function playSfx(rawKind){
  if(!audioEnabled)return;
  if(!soundContext){
    unlockAudio();
    if(!soundContext)return;
  }
  if(soundContext.state==='suspended'){
    soundContext.resume().catch(()=>{});
    return;
  }
  if(soundContext.state!=='running')return;

  const kind=rawKind==='levelUp'?'levelup':rawKind;
  const now=performance.now();
  const minGap=SFX_COOLDOWNS[kind]??70;
  if(now-(lastSoundAt.get(kind)||0)<minGap)return;

  // Enforce global polyphony cap so 100+ simultaneous kills never drop FPS
  const isHighPriority=(kind==='upgrade_open'||kind==='upgrade_pick'||kind==='levelup'||kind==='boss'||kind==='death'||kind==='relic'||kind==='quest');
  if(!isHighPriority&&activeSfxVoices>=MAX_ACTIVE_SFX)return;

  lastSoundAt.set(kind,now);
  const ctx=soundContext;
  const dest=soundCompressor||soundMasterGain||ctx.destination;
  const jitter=0.94+Math.random()*0.12;

  switch(kind){
    case 'step_land':{
      trackVoice(0.09);
      playNoiseLayer(ctx,dest,{brown:true,filterType:'lowpass',freq:240*jitter,freqEnd:95,q:0.9,gain:0.055,attack:0.004,duration:0.075});
      playToneLayer(ctx,dest,{wave:'sine',freq:88*jitter,freqEnd:46,gain:0.032,attack:0.003,duration:0.065});
      break;
    }
    case 'step_water':{
      trackVoice(0.16);
      playNoiseLayer(ctx,dest,{brown:false,filterType:'bandpass',freq:520*jitter,freqEnd:980*jitter,q:2.2,gain:0.05,attack:0.008,duration:0.14});
      playToneLayer(ctx,dest,{wave:'sine',freq:280*jitter,freqEnd:420*jitter,gain:0.024,attack:0.01,duration:0.11});
      break;
    }
    case 'step_bush':{
      trackVoice(0.11);
      playNoiseLayer(ctx,dest,{brown:false,filterType:'bandpass',freq:1050*jitter,freqEnd:1850*jitter,q:1.4,gain:0.038,attack:0.004,duration:0.095});
      break;
    }
    case 'step_squish':{
      trackVoice(0.10);
      playNoiseLayer(ctx,dest,{brown:true,filterType:'lowpass',freq:420*jitter,freqEnd:160,q:1.2,gain:0.042,attack:0.003,duration:0.08});
      playToneLayer(ctx,dest,{wave:'triangle',freq:210*jitter,freqEnd:95,gain:0.03,attack:0.004,duration:0.075});
      break;
    }
    case 'step_stone':{
      trackVoice(0.08);
      playNoiseLayer(ctx,dest,{brown:false,filterType:'highpass',freq:950*jitter,freqEnd:520,q:1.1,gain:0.042,attack:0.002,duration:0.05});
      playToneLayer(ctx,dest,{wave:'triangle',freq:165*jitter,freqEnd:78,gain:0.032,attack:0.002,duration:0.055});
      break;
    }
    case 'step_crystal':{
      trackVoice(0.13);
      playToneLayer(ctx,dest,{wave:'sine',freq:1180*jitter,freqEnd:1540*jitter,gain:0.026,attack:0.003,duration:0.11});
      playNoiseLayer(ctx,dest,{brown:false,filterType:'highpass',freq:1600*jitter,freqEnd:1100,q:1.3,gain:0.024,attack:0.002,duration:0.045});
      break;
    }
    case 'splash_enter':{
      trackVoice(0.28);
      playNoiseLayer(ctx,dest,{brown:true,filterType:'bandpass',freq:340,freqEnd:1150,q:1.6,gain:0.11,attack:0.01,duration:0.25});
      playToneLayer(ctx,dest,{wave:'sine',freq:155,freqEnd:62,gain:0.065,attack:0.006,duration:0.19});
      playToneLayer(ctx,dest,{wave:'sine',freq:390,freqEnd:640,gain:0.035,attack:0.01,duration:0.14,delay:0.06});
      break;
    }
    case 'splash_exit':{
      trackVoice(0.22);
      playNoiseLayer(ctx,dest,{brown:false,filterType:'bandpass',freq:920,freqEnd:380,q:1.8,gain:0.075,attack:0.008,duration:0.19});
      playToneLayer(ctx,dest,{wave:'sine',freq:320,freqEnd:180,gain:0.035,attack:0.006,duration:0.14});
      break;
    }
    case 'dash':{
      trackVoice(0.22);
      playNoiseLayer(ctx,dest,{brown:false,filterType:'bandpass',freq:320,freqEnd:1450,q:1.5,gain:0.09,attack:0.01,duration:0.19});
      playToneLayer(ctx,dest,{wave:'triangle',freq:190,freqEnd:420,gain:0.05,attack:0.008,duration:0.16});
      break;
    }
    case 'attack':
    case 'shoot':{
      trackVoice(0.12);
      const baseF=(kind==='shoot'?520:290)*jitter;
      playNoiseLayer(ctx,dest,{brown:false,filterType:'bandpass',freq:baseF*2.1,freqEnd:baseF*0.7,q:1.4,gain:0.05,attack:0.004,duration:0.095});
      playToneLayer(ctx,dest,{wave:'triangle',freq:baseF,freqEnd:baseF*0.48,gain:0.048,attack:0.004,duration:0.09});
      break;
    }
    case 'hit':{
      trackVoice(0.10);
      playNoiseLayer(ctx,dest,{brown:true,filterType:'bandpass',freq:480*jitter,freqEnd:160,q:1.1,gain:0.075,attack:0.002,duration:0.075});
      playToneLayer(ctx,dest,{wave:'triangle',freq:148*jitter,freqEnd:58,gain:0.07,attack:0.002,duration:0.08});
      break;
    }
    case 'kill':
    case 'explosion':{
      trackVoice(0.22);
      const isExp=(kind==='explosion');
      playNoiseLayer(ctx,dest,{brown:true,filterType:'lowpass',freq:(isExp?380:520)*jitter,freqEnd:75,q:1.0,gain:isExp?0.13:0.095,attack:0.003,duration:isExp?0.24:0.16});
      playToneLayer(ctx,dest,{wave:'sawtooth',freq:(isExp?115:165)*jitter,freqEnd:42,gain:isExp?0.085:0.065,attack:0.003,duration:isExp?0.22:0.15});
      break;
    }
    case 'hurt':{
      trackVoice(0.24);
      playNoiseLayer(ctx,dest,{brown:true,filterType:'lowpass',freq:420,freqEnd:110,q:1.2,gain:0.12,attack:0.003,duration:0.20});
      playToneLayer(ctx,dest,{wave:'sawtooth',freq:165,freqEnd:68,gain:0.095,attack:0.004,duration:0.21});
      playToneLayer(ctx,dest,{wave:'triangle',freq:110,freqEnd:52,gain:0.08,attack:0.005,duration:0.22});
      break;
    }
    case 'pickup':{
      trackVoice(0.14);
      if(now-lastPickupTime<480){
        pickupComboCount=Math.min(10,pickupComboCount+1);
      }else{
        pickupComboCount=0;
      }
      lastPickupTime=now;
      const semitoneMult=Math.pow(1.045,pickupComboCount);
      const f1=587.33*semitoneMult;
      const f2=880*semitoneMult;
      playToneLayer(ctx,dest,{wave:'sine',freq:f1,freqEnd:f1*1.02,gain:0.055,attack:0.004,duration:0.11});
      playToneLayer(ctx,dest,{wave:'triangle',freq:f2,freqEnd:f2*1.03,gain:0.038,attack:0.005,duration:0.12,delay:0.025});
      break;
    }
    case 'upgrade_open':
    case 'levelup':{
      trackVoice(0.55);
      // Warm dark-fantasy resonant chord (D minor -> A5 -> F#5 celestial shimmer)
      playNoiseLayer(ctx,dest,{brown:true,filterType:'bandpass',freq:360,freqEnd:920,q:1.4,gain:0.06,attack:0.02,duration:0.38});
      const notes=[293.66,440.0,554.37,587.33,880.0];
      notes.forEach((f,idx)=>{
        playToneLayer(ctx,dest,{wave:idx<2?'triangle':'sine',freq:f,gain:idx===4?0.065:0.055,attack:0.012,duration:0.36,delay:idx*0.055});
      });
      break;
    }
    case 'upgrade_pick':{
      trackVoice(0.32);
      // Crisp metallic seal lock + warm harmonic confirmation
      playNoiseLayer(ctx,dest,{brown:false,filterType:'bandpass',freq:1400,freqEnd:480,q:2.0,gain:0.055,attack:0.003,duration:0.09});
      playToneLayer(ctx,dest,{wave:'triangle',freq:329.63,freqEnd:659.25,gain:0.075,attack:0.005,duration:0.22});
      playToneLayer(ctx,dest,{wave:'sine',freq:493.88,freqEnd:987.77,gain:0.055,attack:0.008,duration:0.26,delay:0.045});
      break;
    }
    case 'relic':
    case 'quest':{
      trackVoice(0.48);
      const chord=kind==='relic'?[392.0,587.33,783.99,1174.66]:[329.63,440.0,659.25,880.0];
      chord.forEach((f,idx)=>{
        playToneLayer(ctx,dest,{wave:'sine',freq:f,gain:0.06,attack:0.01,duration:0.34,delay:idx*0.065});
        playToneLayer(ctx,dest,{wave:'triangle',freq:f*0.5,gain:0.035,attack:0.012,duration:0.32,delay:idx*0.065});
      });
      break;
    }
    case 'heal':
    case 'buff':{
      trackVoice(0.32);
      playToneLayer(ctx,dest,{wave:'sine',freq:349.23,freqEnd:523.25,gain:0.06,attack:0.012,duration:0.24});
      playToneLayer(ctx,dest,{wave:'triangle',freq:523.25,freqEnd:698.46,gain:0.045,attack:0.015,duration:0.26,delay:0.05});
      break;
    }
    case 'portal':{
      trackVoice(0.45);
      playNoiseLayer(ctx,dest,{brown:true,filterType:'bandpass',freq:220,freqEnd:780,q:2.4,gain:0.085,attack:0.02,duration:0.42});
      playToneLayer(ctx,dest,{wave:'sine',freq:196,freqEnd:392,gain:0.065,attack:0.02,duration:0.40});
      break;
    }
    case 'warning':
    case 'boss':{
      trackVoice(0.55);
      const isBoss=(kind==='boss');
      playNoiseLayer(ctx,dest,{brown:true,filterType:'lowpass',freq:260,freqEnd:80,q:1.1,gain:0.11,attack:0.02,duration:0.50});
      playToneLayer(ctx,dest,{wave:'sawtooth',freq:isBoss?110:146.83,freqEnd:isBoss?65.41:98,gain:0.085,attack:0.015,duration:0.48});
      playToneLayer(ctx,dest,{wave:'triangle',freq:isBoss?164.81:220,freqEnd:isBoss?98:146.83,gain:0.065,attack:0.02,duration:0.48,detune:8});
      break;
    }
    case 'death':{
      trackVoice(0.65);
      playNoiseLayer(ctx,dest,{brown:true,filterType:'lowpass',freq:300,freqEnd:60,q:1.0,gain:0.12,attack:0.01,duration:0.60});
      [293.66,261.63,220.0,146.83].forEach((f,idx)=>{
        playToneLayer(ctx,dest,{wave:'triangle',freq:f,freqEnd:f*0.88,gain:0.075,attack:0.01,duration:0.22,delay:idx*0.11});
      });
      break;
    }
    case 'select':
    case 'confirm':
    default:{
      trackVoice(0.11);
      const f=kind==='select'?480:540;
      playToneLayer(ctx,dest,{wave:'triangle',freq:f,freqEnd:f*1.25,gain:0.045,attack:0.004,duration:0.085});
      break;
    }
  }
}

window.playSfx=playSfx;
window.syncMusicTrack=syncMusicTrack;

addEventListener('pointerdown',unlockAudio);
const _at=document.getElementById('audioToggle');if(_at)_at.addEventListener('click',toggleAudio);
updateAudioToggle();

function saveAudioVolumes(){
  try{localStorage.setItem('pixelvivor.audioVolumes',JSON.stringify({music:musicVolume,sfx:sfxVolume}));}catch{}
}

const musicVolumeSlider=document.getElementById('musicVolume'),sfxVolumeSlider=document.getElementById('sfxVolume');
if(musicVolumeSlider&&sfxVolumeSlider){
  musicVolumeSlider.value=musicVolume;sfxVolumeSlider.value=sfxVolume;
  document.getElementById('musicVolumeValue').value=`${Math.round(musicVolume*100)}%`;
  document.getElementById('sfxVolumeValue').value=`${Math.round(sfxVolume*100)}%`;
  musicVolumeSlider.addEventListener('input',()=>{
    musicVolume=Number(musicVolumeSlider.value);musicPlayer.volume=musicVolume;
    document.getElementById('musicVolumeValue').value=`${Math.round(musicVolume*100)}%`;saveAudioVolumes();
  });
  sfxVolumeSlider.addEventListener('input',()=>{
    sfxVolume=Number(sfxVolumeSlider.value);
    if(soundMasterGain)soundMasterGain.gain.value=audioEnabled?sfxVolume:0;
    document.getElementById('sfxVolumeValue').value=`${Math.round(sfxVolume*100)}%`;saveAudioVolumes();
  });
}

export { MUSIC_TRACKS, musicPlayer, syncMusicTrack, setMusicTrack, updateAudioToggle, unlockAudio, toggleAudio, playSfx, saveAudioVolumes };
