// Use the document itself for dragging. Estimate the release speed from recent
// finger positions, then coast with friction until the remaining travel is negligible.
function installReadingInput(pausePlayback) {
  const compact = matchMedia('(max-width: 760px), (pointer: coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const excluded = 'dialog, #music-player, input, textarea, select, [contenteditable="true"]';
  let drag = null, frame = 0;
  let wheelCredit = 0, wheelAt = -Infinity, wheelDirection = 0;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    drag = null;
    wheelAt = -Infinity;
  }
  function configure() {
    const enabled = compact.matches && (window.visualViewport?.scale ?? 1) <= 1.01;
    if (root.classList.contains('paced-reading') === enabled) return;
    stop();
    root.classList.toggle('paced-reading', enabled);
  }
  configure();
  compact.addEventListener('change', configure);
  window.visualViewport?.addEventListener('resize', configure);
  function pause(event) {
    if (!event.target.closest?.('#auto-toggle, #music-player, dialog')) pausePlayback();
  }
  window.addEventListener('pointerdown', event => { stop(); pause(event); }, {capture:true, passive:true});
  document.addEventListener('keydown', stop, true);
  document.addEventListener('visibilitychange', stop);
  window.addEventListener('pagehide', stop);
  const moveTo = top => window.scrollTo({top, behavior:'instant'});
  function eligible(event) {
    return root.classList.contains('paced-reading') && !document.querySelector('dialog[open]') &&
      !event.target.closest?.(excluded);
  }
  document.addEventListener('touchstart', event => {
    stop();
    pause(event);
    if (event.touches.length !== 1 || !eligible(event)) return;
    const p = event.touches[0];
    drag = {x:p.clientX, y:p.clientY, origin:scrollY, vertical:false, direction:0,
      samples:[{y:p.clientY, t:event.timeStamp}]};
  }, {capture:true, passive:true});

  function sample(y,t) {
    const list = drag.samples;
    const step = y - list.at(-1).y;
    if (step && drag.direction && Math.sign(step) !== drag.direction) list.splice(0, list.length-1);
    if (step) drag.direction = Math.sign(step);
    list.push({y,t});
    while (list.length > 2 && list[1].t <= t-90) list.shift();
  }
  document.addEventListener('touchmove', event => {
    if (!drag || event.touches.length !== 1) return;
    const p = event.touches[0], dy = drag.y-p.clientY;
    if (!drag.vertical) {
      const dx = Math.abs(p.clientX-drag.x);
      if (Math.max(dx, Math.abs(dy)) < 3) return;
      if (dx > Math.abs(dy)) { drag = null; return; }
      drag.vertical = true;
    }
    if (!event.cancelable) { drag = null; return; }
    event.preventDefault();
    moveTo(drag.origin+dy);
    sample(p.clientY,event.timeStamp);
  }, {capture:true, passive:false});

  document.addEventListener('touchcancel', stop, {passive:true});
  document.addEventListener('touchend', event => {
    const d = drag;
    drag = null;
    if (!d?.vertical || reduced.matches) return;
    const end = d.samples.at(-1), first = d.samples[0];
    const held = event.timeStamp-end.t;
    if (held >= 90) return;
    const speed = (first.y-end.y)/Math.max(8,end.t-first.t);
    const decay = 145;
    const limit = Math.min(innerHeight*0.45, Math.abs(first.y-end.y)*1.6+24);
    const travel = Math.sign(speed)*Math.min(limit,Math.abs(speed)*decay)*(1-held/90);
    if (Math.abs(travel) < 2) return;
    const origin = scrollY, start = performance.now();
    function coast(now) {
      const remaining = Math.exp(-Math.max(0,now-start)/decay);
      if (remaining*Math.abs(travel) <= 1) { moveTo(origin+travel); frame=0; return; }
      moveTo(origin+travel*(1-remaining));
      frame = requestAnimationFrame(coast);
    }
    frame = requestAnimationFrame(coast);
  }, {passive:true});

  window.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey) return;
    pause(event);
    if (!eligible(event) || !event.cancelable || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    cancelAnimationFrame(frame);
    const units = event.deltaMode === 2 ? innerHeight : event.deltaMode === 1 ? 18 : 1;
    const pixels = event.deltaY*units, direction = Math.sign(pixels);
    const elapsed = Math.max(0,event.timeStamp-wheelAt);
    // Some mobile viewers forward a flick as wheel events. Bound both a single
    // outlier and a dense burst, while letting small deltas through immediately.
    const capacity = innerHeight*0.32;
    if (direction !== wheelDirection || elapsed >= 180) wheelCredit = capacity;
    else wheelCredit = Math.min(capacity,wheelCredit+elapsed*innerHeight*0.0011);
    const step = Math.min(Math.abs(pixels),innerHeight*0.12,wheelCredit);
    wheelAt = event.timeStamp;
    wheelDirection = direction;
    wheelCredit -= step;
    event.preventDefault();
    moveTo(scrollY+direction*step);
  }, {passive:false});
}
