/* Each physical gesture has one target, bounded by the neighbouring chapters. */
function installNativeReadingInput({onInput,isBlocked}){
  const controls=target=>target.closest('#music-player,dialog,input,textarea,select,[contenteditable="true"]');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let wheel=null,touch=null,release=null,wheelTimer=0,correcting=false;
  const behavior=()=>reducedMotion.matches?'instant':'smooth';
  const maximum=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
  function bounds(origin){
    const stops=[0,...Array.from(document.querySelectorAll('.chapter,#expertise,footer'),el=>{
      const margin=parseFloat(getComputedStyle(el).scrollMarginTop)||0;
      return Math.max(0,el.getBoundingClientRect().top+scrollY-margin);
    }),maximum()].sort((a,b)=>a-b);
    return {min:stops.filter(y=>y<origin-24).at(-1)??0,max:stops.find(y=>y>origin+24)??maximum()};
  }
  const clamp=(value,range)=>Math.max(range.min,Math.min(range.max,value));
  function clearWheel(){clearTimeout(wheelTimer);wheelTimer=0;wheel=null;}
  addEventListener('wheel',event=>{
    if(isBlocked()||controls(event.target)||event.ctrlKey||event.metaKey||Math.abs(event.deltaY)<=Math.abs(event.deltaX))return;
    release=null;onInput();
    const pixels=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?innerHeight:1);
    const now=event.timeStamp,sign=Math.sign(pixels);
    if(!wheel||now-wheel.at>280||wheel.sign!==sign){wheel={...bounds(scrollY),target:scrollY,at:now,sign};}
    wheel.at=now;
    clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{wheel=null;wheelTimer=0;},400);
    wheel.target=clamp(wheel.target+pixels,wheel);
    if(event.cancelable){event.preventDefault();window.scrollTo({top:wheel.target,behavior:behavior()});}
  },{passive:false});
  addEventListener('touchstart',event=>{
    clearWheel();touch=null;release=null;
    if(event.touches.length!==1||isBlocked()||controls(event.target)||event.target.closest('.site-header'))return;
    onInput();
    // Cancel a previous glide before the next finger starts a fresh gesture.
    window.scrollTo({top:scrollY,behavior:'instant'});
    const p=event.touches[0];
    touch={...bounds(scrollY),origin:scrollY,x:p.clientX,y:p.clientY,lastY:p.clientY,at:event.timeStamp,velocity:0,axis:null};
  },{passive:true});
  addEventListener('touchmove',event=>{
    if(!touch||event.touches.length!==1||isBlocked()){touch=null;return;}
    const p=event.touches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;
    if(!touch.axis&&Math.max(Math.abs(dx),Math.abs(dy))>6)touch.axis=Math.abs(dy)>Math.abs(dx)?'y':'x';
    if(touch.axis!=='y')return;
    const dt=Math.max(8,event.timeStamp-touch.at);
    touch.velocity=Math.max(-2,Math.min(2,(touch.lastY-p.clientY)/dt));
    touch.lastY=p.clientY;touch.at=event.timeStamp;
    if(event.cancelable){
      event.preventDefault();
      window.scrollTo({top:clamp(touch.origin-dy,touch),behavior:'instant'});
    }
  },{passive:false});
  addEventListener('touchend',event=>{
    if(!touch)return;
    const gesture=touch;touch=null;
    if(gesture.axis!=='y')return;
    release=gesture;
    const velocity=event.timeStamp-gesture.at<100?gesture.velocity:0;
    window.scrollTo({top:clamp(scrollY+velocity*150,gesture),behavior:behavior()});
  },{passive:true});
  addEventListener('touchcancel',()=>{touch=null;},{passive:true});
  // A fallback also contains non-cancelable remote-browser scroll commands.
  addEventListener('scroll',()=>{
    const gesture=touch?.axis==='y'?touch:(wheel||release);
    if(!gesture||correcting)return;
    const target=clamp(scrollY,gesture);
    if(Math.abs(target-scrollY)>1){correcting=true;window.scrollTo({top:target,behavior:'instant'});correcting=false;}
  },{passive:true});
  addEventListener('pointerdown',event=>{
    clearWheel();release=null;
    if(event.pointerType==='mouse'&&!isBlocked()&&(event.clientX>=document.documentElement.clientWidth||event.target.closest('main')))onInput();
  },{passive:true});
  addEventListener('keydown',()=>{clearWheel();touch=null;release=null;});
  addEventListener('resize',()=>{clearWheel();touch=null;release=null;});
  addEventListener('visibilitychange',()=>{clearWheel();touch=null;release=null;});
}
