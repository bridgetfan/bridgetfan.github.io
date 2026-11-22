/* The browser owns gestures and momentum. On small screens, three native scroll
   pixels advance the presentation by one pixel; input is never intercepted. */
function installReadingViewport({surface,yearRail,onInput,isBlocked,reduced}){
  const factor=3;
  let enhanced=false,spacer=null,slot=null,railStart=0;
  const root=document.documentElement;
  const nativePosition=()=>Math.max(0,window.scrollY);
  const position=()=>nativePosition()/(enhanced?factor:1);
  function paint(value=position()){
    if(!enhanced)return;
    surface.style.transform=`translate3d(0,-${value}px,0)`;
    root.classList.toggle('reading-rail-visible',value>=railStart);
  }
  function refresh(){
    if(!enhanced)return;
    const header=parseFloat(getComputedStyle(root).getPropertyValue('--header'))||0;
    const contentHeight=surface.getBoundingClientRect().height;
    const maximum=Math.max(0,contentHeight+header-innerHeight);
    spacer.style.height=`${maximum*factor+innerHeight-header}px`;
    railStart=slot.offsetTop;
  }
  function scrollTo(value){
    window.scrollTo({top:Math.max(0,value)*(enhanced?factor:1),behavior:'instant'});
    paint(value);
  }
  function resize(){
    const next=innerWidth<=760&&!reduced.matches;
    if(next!==enhanced){
      const previous=position();
      if(next){
        slot=document.createElement('div');slot.className='year-rail-slot';
        slot.style.height=yearRail.getBoundingClientRect().height+'px';
        yearRail.before(slot);document.body.append(yearRail);
        spacer=document.createElement('div');spacer.id='reading-space';spacer.setAttribute('aria-hidden','true');
        surface.after(spacer);enhanced=true;root.classList.add('reading-viewport');
      }else{
        slot.replaceWith(yearRail);slot=null;spacer.remove();spacer=null;
        enhanced=false;root.classList.remove('reading-viewport','reading-rail-visible');surface.style.transform='';
      }
      root.dataset.readingScale=String(enhanced?factor:1);
      refresh();scrollTo(previous);
    }else refresh();
  }
  const protectedControl=target=>target.closest('#auto-toggle,#music-player,dialog,input,textarea,select,[contenteditable="true"]');
  // Passive observers only: no preventDefault, gesture caps, release timers or
  // position corrections. Native inertia advances the same continuous progress.
  for(const type of ['wheel','touchstart','pointerdown']){
    addEventListener(type,event=>{
      if(!isBlocked()&&!protectedControl(event.target)&&!event.ctrlKey&&!event.metaKey)onInput();
    },{passive:true});
  }
  resize();
  return {get enhanced(){return enhanced;},position,paint,refresh,resize,scrollTo,
    updateRail(value){if(enhanced)root.classList.toggle('reading-rail-visible',value>=railStart);}};
}
