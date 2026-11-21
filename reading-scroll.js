/* Manual movement belongs to the browser, including momentum and touch gestures. */
function installNativeReadingInput({onInput,isBlocked}){
  const controls=target=>target.closest('#music-player,dialog,input,textarea,select,[contenteditable="true"]');
  addEventListener('wheel',event=>{
    if(isBlocked()||controls(event.target)||event.ctrlKey||event.metaKey||Math.abs(event.deltaY)<=Math.abs(event.deltaX))return;
    const pixels=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?innerHeight:1);
    // Remote browsers can encode one swipe as several thousand pixels.
    // Normalize that single oversized command; ordinary wheel input stays native.
    if(event.cancelable&&Math.abs(pixels)>innerHeight*.9){
      event.preventDefault();onInput();
      window.scrollBy({top:Math.sign(pixels)*innerHeight*.75,behavior:'smooth'});
    }else onInput();
  },{passive:false});
  addEventListener('touchstart',event=>{
    if(event.touches.length===1&&!isBlocked()&&!controls(event.target)&&!event.target.closest('.site-header'))onInput();
  },{passive:true});
  addEventListener('pointerdown',event=>{
    if(event.pointerType==='mouse'&&!isBlocked()&&(event.clientX>=document.documentElement.clientWidth||event.target.closest('main')))onInput();
  },{passive:true});
}
