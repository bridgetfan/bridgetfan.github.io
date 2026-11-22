// A reading gesture only interrupts autoplay. The browser owns the pan and its momentum.
function installReadingInput(pausePlayback) {
  function handleInput(event) {
    if (event.ctrlKey || event.metaKey || event.target.closest?.('#auto-toggle, #music-player, dialog')) return;
    pausePlayback();
  }

  for (const type of ['pointerdown', 'touchstart', 'wheel']) {
    window.addEventListener(type, handleInput, { capture: true, passive: true });
  }
}
