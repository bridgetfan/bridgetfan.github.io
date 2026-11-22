function installReadingInput(pausePlayback) {
  const surface = document.querySelector('main');
  const mobile = matchMedia('(max-width: 760px), (pointer: coarse)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ignored = '#auto-toggle, #music-player, dialog';
  let drag = null;
  let glide = 0;
  let lastWheelTime = -Infinity;

  function interrupt() {
    cancelAnimationFrame(glide);
    glide = 0;
    drag = null;
    lastWheelTime = -Infinity;
  }

  function configure() {
    interrupt();
    const scale = window.visualViewport?.scale ?? 1;
    surface.classList.toggle('touch-reading', mobile.matches && scale <= 1.01);
  }

  function write(top) {
    window.scrollTo({ top, behavior: 'instant' });
  }

  function handleInput(event) {
    if (event.ctrlKey || event.metaKey) return;
    if (event.type !== 'wheel') interrupt();
    if (!event.target.closest?.(ignored)) pausePlayback();
  }

  for (const type of ['pointerdown', 'touchstart', 'wheel']) {
    window.addEventListener(type, handleInput, { passive: true, capture: true });
  }
  window.addEventListener('keydown', interrupt, true);
  document.addEventListener('visibilitychange', interrupt);
  mobile.addEventListener('change', configure);
  window.visualViewport?.addEventListener('resize', () => {
    // A collapsing address bar changes height during a gesture, without zooming.
    if (surface.classList.contains('touch-reading') !==
        (mobile.matches && visualViewport.scale <= 1.01)) configure();
  });
  configure();

  surface.addEventListener('touchstart', event => {
    if (!surface.classList.contains('touch-reading') || event.touches.length !== 1) return;
    const point = event.touches[0];
    drag = { x: point.clientX, y: point.clientY, top: scrollY, lastY: point.clientY,
      time: event.timeStamp, velocity: 0, vertical: false };
  }, { passive: true });

  surface.addEventListener('touchmove', event => {
    if (!drag || event.touches.length !== 1) return;
    const point = event.touches[0];
    const distance = drag.y - point.clientY;
    if (!drag.vertical) {
      const horizontal = Math.abs(point.clientX - drag.x);
      if (Math.max(horizontal, Math.abs(distance)) < 4) return;
      if (horizontal > Math.abs(distance)) { drag = null; return; }
      drag.vertical = true;
    }
    if (!event.cancelable) { drag = null; return; }
    event.preventDefault();
    // Absolute displacement keeps the page under the finger, even with sparse events.
    write(drag.top + distance);
    const dt = Math.max(1, event.timeStamp - drag.time);
    drag.velocity = (drag.lastY - point.clientY) / dt;
    drag.lastY = point.clientY;
    drag.time = event.timeStamp;
  }, { passive: false });

  surface.addEventListener('touchcancel', interrupt, { passive: true });
  surface.addEventListener('touchend', event => {
    const ended = drag;
    drag = null;
    if (!ended?.vertical || reducedMotion.matches || event.timeStamp - ended.time > 75) return;
    const origin = scrollY;
    const limit = Math.min(64, innerHeight * 0.08);
    const distance = Math.max(-limit, Math.min(limit, ended.velocity * 48));
    if (Math.abs(distance) < 2) return;
    const start = performance.now();
    function finish(now) {
      const t = Math.min(1, (now - start) / 150);
      write(origin + distance * (1 - (1 - t) ** 3));
      glide = t < 1 ? requestAnimationFrame(finish) : 0;
    }
    glide = requestAnimationFrame(finish);
  }, { passive: true });

  // Mobile web views can deliver a flick as a burst of wheel deltas.
  // Let small inputs through at full scale and rate-limit large bursts in either direction.
  window.addEventListener('wheel', event => {
    if (!surface.classList.contains('touch-reading') || event.ctrlKey || event.metaKey ||
        event.target.closest?.(ignored) || document.querySelector('dialog[open]') ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) || !event.cancelable) return;
    cancelAnimationFrame(glide);
    const units = event.deltaMode === 2 ? innerHeight : event.deltaMode === 1 ? 18 : 1;
    const pixels = event.deltaY * units;
    const elapsed = Math.min(55, Math.max(0, event.timeStamp - lastWheelTime));
    lastWheelTime = event.timeStamp;
    const limit = innerHeight * 1.05 * elapsed / 1000;
    event.preventDefault();
    write(scrollY + Math.sign(pixels) * Math.min(Math.abs(pixels), limit));
  }, { passive: false });
}
