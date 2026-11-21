/* Manual movement follows input only. Native vertical touch inertia is disabled on the story surface in CSS. */
function installNativeReadingInput({onInput,isBlocked,getStops}){
  const controls=target=>target.closest('#music-player,dialog,input,textarea,select,[contenteditable="true"]');
  let wheel=null,touch=null,layoutWidth=innerWidth;
  const maximum=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
  function bounds(origin){
    const measured=getStops?getStops():Array.from(document.querySelectorAll('.chapter,#expertise,footer'),el=>{
      const margin=parseFloat(getComputedStyle(el).scrollMarginTop)||0;
      return Math.max(0,el.getBoundingClientRect().top+scrollY-margin);
    });
    const stops=[0,...measured,maximum()].sort((a,b)=>a-b);
    return {min:stops.filter(y=>y<origin-24).at(-1)??0,max:stops.find(y=>y>origin+24)??maximum()};
  }
  const clamp=(value,range)=>Math.max(range.min,Math.min(range.max,value));
  function reset(){wheel=null;touch=null;}
  function stopNativeGlide(){window.scrollTo({top:scrollY,behavior:'instant'});}
  addEventListener('wheel',event=>{
    if(isBlocked()||controls(event.target)||event.ctrlKey||event.metaKey||Math.abs(event.deltaY)<=Math.abs(event.deltaX))return;
    onInput();touch=null;
    const pixels=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?innerHeight:1);
    const now=event.timeStamp,sign=Math.sign(pixels);
    if(!wheel||now-wheel.at>420||wheel.sign!==sign){
      const range=bounds(scrollY),travel=innerHeight*.7;
      // A forwarded mobile fling is a stream of wheel events, not a TouchEvent.
      // Keep its entire inertial tail inside one reading-sized movement.
      wheel={min:Math.max(range.min,scrollY-travel),max:Math.min(range.max,scrollY+travel),target:scrollY,at:now-80,sign};
    }
    // Bound both event size and event rate; a large forwarded delta must not teleport.
    const elapsed=Math.max(8,Math.min(80,now-wheel.at));
    const step=sign*Math.min(Math.abs(pixels)*.8,innerHeight*.08,innerHeight*.9*elapsed/1000);
    wheel.at=now;
    wheel.target=clamp(wheel.target+step,wheel);
    if(event.cancelable){event.preventDefault();window.scrollTo({top:wheel.target,behavior:'instant'});}
  },{passive:false});
  addEventListener('touchstart',event=>{
    reset();
    if(event.touches.length!==1||isBlocked()||controls(event.target))return;
    onInput();stopNativeGlide();
    const p=event.touches[0];
    touch={...bounds(scrollY),origin:scrollY,x:p.clientX,y:p.clientY,axis:null};
  },{passive:true});
  addEventListener('touchmove',event=>{
    if(!touch||event.touches.length!==1||isBlocked()){touch=null;return;}
    const p=event.touches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;
    if(!touch.axis&&Math.max(Math.abs(dx),Math.abs(dy))>0)touch.axis=Math.abs(dy)>Math.abs(dx)?'y':'x';
    if(touch.axis!=='y')return;
    if(event.cancelable){event.preventDefault();window.scrollTo({top:clamp(touch.origin-dy,touch),behavior:'instant'});}
  },{passive:false,capture:true});
  addEventListener('touchend',()=>{
    const wasVertical=touch?.axis==='y';touch=null;
    // The position does not advance at release; this only cancels native inertia.
    if(wasVertical)stopNativeGlide();
  },{passive:true});
  addEventListener('touchcancel',()=>{touch=null;},{passive:true});
  addEventListener('pointerdown',event=>{
    wheel=null;
    if(event.pointerType==='mouse'&&!isBlocked()&&(event.clientX>=document.documentElement.clientWidth||event.target.closest('main'))){onInput();stopNativeGlide();}
  },{passive:true});
  addEventListener('keydown',reset);
  addEventListener('resize',()=>{
    wheel=null;
    // Mobile address-bar collapse changes height during a drag. Keep tracking it.
    if(innerWidth!==layoutWidth){touch=null;layoutWidth=innerWidth;}
  });
  addEventListener('visibilitychange',reset);
}
