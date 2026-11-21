/* Manual movement belongs to the browser, including momentum and touch gestures. */
function installNativeReadingInput({onInput,isBlocked}){
  const controls=target=>target.closest('#music-player,dialog,input,textarea,select,[contenteditable="true"]');
  addEventListener('wheel',event=>{
    if(!isBlocked()&&!controls(event.target)&&!event.ctrlKey&&!event.metaKey&&Math.abs(event.deltaY)>Math.abs(event.deltaX))onInput();
  },{passive:true});
  addEventListener('touchstart',event=>{
    if(event.touches.length===1&&!isBlocked()&&!controls(event.target)&&!event.target.closest('.site-header'))onInput();
  },{passive:true});
  addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&!isBlocked()&&(event.clientX>=document.documentElement.clientWidth||event.target.closest('main')))onInput();
  },{passive:true});
}
