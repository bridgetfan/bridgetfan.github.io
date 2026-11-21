/* Bound a quick swipe and its momentum to less than a screen. */
function createReadingScroll({onInput,reduced,isBlocked}) {
  let target=scrollY,lastY=scrollY,frame=0,lastTime=0,burstAt=-Infinity,origin=scrollY,direction=0,touch=null;
  const maximum=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
  const budget=()=>Math.max(180,innerHeight*.82);
  const nested=el=>el.closest('#music-panel,dialog,#year-nav,input,textarea,select,[contenteditable="true"]');
  function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;target=lastY=scrollY;burstAt=-Infinity;touch=null;}
  function animate(time){
    frame=0;
    if(isBlocked()||Math.abs(scrollY-lastY)>3){cancel();return;}
    const dt=lastTime?Math.min(250,time-lastTime):16;lastTime=time;
    target=Math.max(0,Math.min(maximum(),target));
    const d=target-scrollY,step=Math.sign(d)*Math.min(Math.abs(d)*(1-Math.exp(-dt/75)),dt*.85);
    window.scrollTo({top:Math.abs(d)<3?target:scrollY+step,behavior:'instant'});lastY=scrollY;
    if(Math.abs(target-scrollY)>1)frame=requestAnimationFrame(animate);else lastTime=0;
  }
  function moveTo(y){
    target=Math.max(0,Math.min(maximum(),y));
    if(reduced.matches){window.scrollTo({top:target,behavior:'instant'});lastY=scrollY;return;}
    if(!frame){lastY=scrollY;lastTime=0;frame=requestAnimationFrame(animate);}
  }
  addEventListener('wheel',event=>{
    if(event.ctrlKey||event.metaKey||isBlocked()||nested(event.target)||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
    if(!event.cancelable){cancel();onInput();return;}
    event.preventDefault();onInput();
    const now=performance.now(),sign=Math.sign(event.deltaY),limit=budget();
    if(now-burstAt>220||direction!==sign){target=origin=scrollY;direction=sign;}
    burstAt=now;
    const pixels=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?innerHeight:1);
    moveTo(Math.max(origin-limit,Math.min(origin+limit,target+Math.max(-limit,Math.min(limit,pixels)))));
  },{passive:false});
  addEventListener('touchstart',event=>{
    if(event.touches.length!==1||isBlocked()||nested(event.target)){cancel();return;}
    cancel();const p=event.touches[0];touch={x:p.clientX,y:p.clientY,origin:scrollY,axis:null,limit:budget()};
  },{passive:true});
  addEventListener('touchmove',event=>{
    if(!touch||event.touches.length!==1){cancel();return;}
    const p=event.touches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;
    if(!touch.axis&&Math.max(Math.abs(dx),Math.abs(dy))>5)touch.axis=Math.abs(dy)>Math.abs(dx)?'y':'x';
    if(touch.axis!=='y')return;
    if(!event.cancelable){cancel();onInput();return;}
    event.preventDefault();onInput();moveTo(touch.origin+Math.max(-touch.limit,Math.min(touch.limit,-dy)));
  },{passive:false});
  addEventListener('touchend',()=>{touch=null;},{passive:true});
  addEventListener('touchcancel',cancel,{passive:true});
  addEventListener('pointerdown',event=>{if(event.pointerType!=='touch')cancel();},{passive:true});
  addEventListener('resize',cancel);addEventListener('visibilitychange',cancel);
  return {cancel};
}
