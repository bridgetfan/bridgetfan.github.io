// Browser gestures move the document directly. Input only pauses playback.
function installReadingInput(pausePlayback) {
  function handleInput(event) {
    if (event.ctrlKey || event.metaKey) return;
    if (event.target.closest?.('#auto-toggle, #music-player, dialog')) return;
    pausePlayback();
  }

  for (const type of ['wheel', 'pointerdown', 'touchstart']) {
    window.addEventListener(type, handleInput, { passive: true });
  }
}
