# Bridget Fan

A personal website about my path into platform engineering, with a specialism in HashiCorp Vault.

Website: https://bridgetfan.github.io/

The single-page story moves through undergraduate study in Chengdu, interpreting study in Australia, industry experience, family life, cybersecurity study and engineering work at Macquarie Group and Wipro / Optus.

## Experience

- Continuous scenes connected by a changing source of light. Autoplay uses one browser-composited animation at a steady reading pace, rather than a per-frame native-scroll loop. Pausing restores the current visual position to native scrolling. On phones, native browser scrolling drives the presentation at a 3:1 distance ratio. The browser owns touch, wheel and release inertia; there are no gesture boundaries, release timers or corrective scroll writes. Manual input pauses autoplay, and the current visual position is preserved when switching modes. Desktop and reduced-motion viewing use ordinary page scrolling. Hover feedback never locks playback. Selecting a year pauses autoplay and jumps directly to the selected chapter.
- Scroll rendering reuses measured chapter and light-anchor geometry, refreshing it after font loading or viewport changes. Manual gesture start uses the same cached chapter boundaries.
- Characters contained within each scene, with separate space for the illustrations and text.
- Hover and keyboard-focus feedback on scene details; click or tap to read more.
- A compact capability overview, with details in a desktop side panel or mobile bottom sheet.
- Native modal focus handling, Escape dismissal and restoration of the original reading position.
- Reduced-motion preferences disable automatic scrolling and animated effects.
- A compact vinyl-style player in the top navigation offers optional uplifting instrumental music, with playback and volume controls. Music starts only after a click and pauses when the browser tab is hidden.
- Recording: Inspired, composed and performed by Kevin MacLeod (Incompetech). Licensed under CC BY 4.0; full attribution is in the player and `music-credits.txt`.

## Files

- `index.html`: page structure, illustration symbols and the detail dialog.
- `scenes.js`: timeline content, illustrated scenes and supporting story details.
- `app.js`: scene rendering, automatic scrolling, interactions and capability details.
- `reading-scroll.js`: manual wheel-stream and touch-gesture handling with chapter boundaries.
- `story-light.js`: scene-specific light motifs and the short moving light trail between scenes.
- `music-player.js`: user-controlled audio playback and the floating player.
- `inspired.mp3` and `music-credits.txt`: the instrumental recording and attribution.
- `style.css`: responsive layout, typography and animation.
- `family-cartoon-set.png`: family character artwork and the study portrait.
- `bridget-professional.png`: standing and presenting character poses.
- `geist-*.ttf`: locally served Geist and Geist Mono fonts, with their license files alongside.

GitHub Pages serves the repository root from `main`. No build, database or application server is required. The `.nojekyll` file keeps the website as static files.

Search indexing is discouraged through a `noindex, nofollow` meta tag. The website and source repository remain public; this tag is not access control.
