# Bridget Fan

A personal website about my path into platform engineering, with a specialism in HashiCorp Vault.

The single-page timeline covers undergraduate study in Chengdu, postgraduate interpreting study in Australia, industry experience, family life, a return to university for cybersecurity, and engineering work at Macquarie Group and Wipro / Optus.

## Website

https://bridgetfan.github.io/

This is a static website built with HTML, CSS, JavaScript and SVG. It includes a continuous illustrated timeline, a capability-focused toolbox, automatic scrolling, hover notes, mobile interactions and support for reduced-motion preferences.

Search indexing is discouraged with a `noindex, nofollow` meta tag. The published website and this repository remain public; the tag is not access control.

## Publish with GitHub Pages

1. Create a public repository named `bridgetfan.github.io`.
2. Put the website files at the root of the `main` branch.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**, then **main** and **/ (root)**, and save.
5. Open the website URL reported by GitHub Pages once deployment completes.

The `.nojekyll` file keeps the site as plain static files. No build service, database or server installation is required. Google Fonts is used for typography, with local system-font fallbacks.

## Main files

- `index.html`: page structure and shared illustrations.
- `style.css`: layout, colours and animation.
- `scenes.js`: timeline content, illustration scenes and supporting notes.
- `app.js`: scrolling, navigation and interactions.
- `family-cartoon-set.png`: stylised character illustrations used throughout the timeline.

Edit the content in `scenes.js`, then commit the changes to update the site.
