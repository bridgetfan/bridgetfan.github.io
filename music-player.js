'use strict';

(() => {
  const player=document.querySelector('#music-player');
  const audio=document.querySelector('#story-music');
  const toggle=document.querySelector('#music-toggle');
  const options=document.querySelector('#music-options');
  const panel=document.querySelector('#music-panel');
  const volume=document.querySelector('#music-volume');
  const volumeValue=document.querySelector('#music-volume-value');
  const status=document.querySelector('#music-status');
  const elapsed=document.querySelector('#music-elapsed');
  let requested=false,context=null,gain=null;

  function update(state) {
    const playing=state==='playing';
    const engaged=requested;
    player.classList.toggle('is-playing',playing);
    player.classList.toggle('is-loading',state==='loading');
    toggle.setAttribute('aria-pressed',String(engaged));
    toggle.setAttribute('aria-label',engaged?'Pause instrumental music':'Play instrumental music');
    toggle.title=engaged?'Pause Inspired':'Play Inspired';
    status.textContent=playing?'Playing softly':state==='loading'?'Loading the music…':state==='error'?'Could not load the music. Tap the record to retry.':'Click the record to play.';
  }

  function setVolume() {
    const level=Number(volume.value)/100;
    if(gain)gain.gain.value=level;
    else audio.volume=level;
    volumeValue.textContent=volume.value+'%';
    volume.setAttribute('aria-valuetext',volume.value+' percent');
  }

  function prepareAudio() {
    // A gain node keeps the volume control useful on mobile Safari too.
    const AudioEngine=window.AudioContext||window.webkitAudioContext;
    if(!context&&AudioEngine){
      try {
        context=new AudioEngine();
        const source=context.createMediaElementSource(audio);
        gain=context.createGain();
        source.connect(gain);gain.connect(context.destination);
        audio.volume=1;
      } catch(error) {
        context=null;gain=null;
      }
    }
    setVolume();
    if(context?.state==='suspended')context.resume().catch(()=>{});
  }

  toggle.addEventListener('click',async()=>{
    if(requested||!audio.paused){requested=false;audio.pause();update('paused');return;}
    requested=true;
    if(audio.error)audio.load();
    prepareAudio();
    update('loading');
    try {
      await audio.play();
      if(!requested)audio.pause();
    } catch(error) {
      if(!requested)return;
      requested=false;audio.pause();update('error');
    }
  });
  audio.addEventListener('playing',()=>{if(requested)update('playing');else audio.pause();});
  audio.addEventListener('waiting',()=>{if(requested)update('loading');});
  audio.addEventListener('pause',()=>{requested=false;update('paused');});
  audio.addEventListener('error',()=>{requested=false;update('error');});
  audio.addEventListener('timeupdate',()=>{
    const seconds=Math.floor(audio.currentTime||0);
    elapsed.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
  });
  volume.addEventListener('input',setVolume);

  function closePanel(restoreFocus=false) {
    panel.hidden=true;options.setAttribute('aria-expanded','false');
    if(restoreFocus)options.focus({preventScroll:true});
  }
  options.addEventListener('click',()=>{
    panel.hidden=!panel.hidden;
    options.setAttribute('aria-expanded',String(!panel.hidden));
  });
  document.querySelector('#close-music').addEventListener('click',()=>closePanel(true));
  document.addEventListener('click',event=>{if(!player.contains(event.target))closePanel();});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!panel.hidden&&!document.querySelector('dialog[open]')){
      event.preventDefault();closePanel(true);
    }
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){requested=false;audio.pause();}});
  addEventListener('pagehide',()=>{requested=false;audio.pause();});
  setVolume();update('paused');
})();
