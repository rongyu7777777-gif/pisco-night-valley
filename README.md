# Pisco — Four video previews

Revision: v33-desktop-logo-inset-20261119.

1. The Countdown — 1×
2. The Winter Lodge — 1.5×
3. The Poker Table — 1.5×
4. The Ballroom — 1×

The first chapter now uses the user-supplied countdown footage from 2026-11-18, with matching start/end images. Its complete 302-frame, 1920x1080, 30 fps timeline is preserved in a fast-start H.264 MP4; the original AAC audio packets are copied unchanged. First-scene playback remains 1x. First-scene titles, teaser, accessibility text and Stories card now match the countdown scene. The stable coffee-date scene ID remains for existing deep links.

The Winter Lodge now uses the user-supplied 2026-11-18 16:27 video with matching start/end images. Its complete 362-frame, 1920x1080, 30 fps timeline is preserved in a fast-start H.264 MP4, with unchanged original AAC audio packets. Native playback remains 1.5x.

The third chapter replaces the previous motorcycle clip with the newly supplied private poker-table footage, matching cover images and copy. The Winter Lodge and The Poker Table now play 50% faster through native per-scene playbackRate. The video files retain their full original timelines; speed is not baked into the MP4s. A web-optimized H.264 third clip preserves original frame timestamps and AAC audio.

The Sound control plays the original embedded audio of the current chapter. It is available on desktop and mobile. Videos start muted for browser autoplay; click the speaker icon beside the social links to enable original audio. Audio follows the active chapter during transitions, keeping background/preloaded chapters muted. The synthetic oscillator soundtrack has been removed. The current Ballroom asset and its pre-repair export contain no audio track; restoring that chapter's original soundtrack requires a source file with audio. Native pitch preservation remains enabled for the 1.5x scenes.

The exact R9 SVG artwork and aspect ratio are preserved. Header logo widths remain 92 px on desktop, 74 px on mobile portrait and 64 px on small-screen landscape.

This is a current preview release; updated footage is expected later. Scroll, drag and arrow keys control camera travel independently from native playback. Chapter four wraps to chapter one, including reverse travel.

GitHub Pages publishes this self-contained static site from the root of main. Typography uses Bodoni Moda for headlines and Manrope for body/UI, self-hosted as WOFF2. Both are licensed under SIL OFL 1.1; full notices are included in assets/fonts/.

The header links to the supplied TikTok, X and Discord destinations in new tabs, using locally embedded Tabler outline brand marks. Stories, About and the 18+ header label are removed. The logo uses a 28-40 px desktop left inset (8 px more breathing room from the left edge) and a 16 px mobile left inset, preserving the original artwork and size.

Social links are icon-only on all screen sizes, with optically balanced brand sizes and 44 px touch targets. The original-audio toggle sits beside them and switches between muted-speaker and sound-wave icons, with accessible state labels and keyboard focus.

This revision preserves the latest typography, outline icons and individual scene compositions. The desktop scroll hint now has a gently floating arrow: a 1.8-second cycle, 6 px of downward travel and subtle opacity change. Its text stays still. The animation is disabled when reduced motion is requested; the existing mobile hint visibility is unchanged.

Header icons use a unified outline style in brand gold (#E5DFBA), matching the original Pisco logo. Every icon shares a 1.5 px non-scaling stroke, round caps and round joins; optical sizes and the speaker offset balance their visual centers. Social marks and the mute cross come from Tabler Icons (MIT; assets/icons/TABLER-LICENSE.txt).

The volume control now uses a wider simplified speaker, one sound arc, and a compact Tabler mute cross beside the intact speaker, while preserving the shared brand gold and audio behavior.

Header icon sizes are calibrated for visual weight: TikTok 25 px, X 26 px, Discord 25 px and both sound states 29 px. Click targets remain 44 px. The group sits 12 px farther right on narrow screens; desktop right inset is 16-24 px.

The eyebrow captions and decorative short rules above all four scene headlines have been removed; main headlines and descriptions remain.

The X mark has returned to the same Tabler outline family as TikTok and Discord.

Each desktop scene has its own copy composition and camera approach, tuned against actual start/middle/end video frames:
- Countdown: compact middle-left copy, slight upper-left focus, zoom 1.025 to 1.08.
- Winter Lodge: upper-right copy, upward focus, zoom 1.025 to 1.12.
- Poker Table: upper-left copy, focus toward the lower table, zoom 1.025 to 1.18.
- Ballroom: lower-left copy, focus toward the right, zoom 1.025 to 1.14.
Text keeps the original travel and scale formulas unchanged: -128 px approach travel plus the original exit travel, and the original 1.28 approach / 1.52 exit scale. Each scene changes only its starting composition and transform origin. Camera crop positions are clamped to keep the canvas covered, and the incoming transition uses the next scene's starting camera. Portrait text stays separate from the video, retaining its original 0.45 travel and 0.2 scale multipliers. Reduced-motion mode keeps the camera/text composition static.

## Run locally

This source package contains the complete static site, including videos, poster images, self-hosted fonts and licenses. No dependency installation or build step is required.

From the extracted directory, run:

```sh
python -m http.server 4218
```

Then open http://127.0.0.1:4218/ in a browser. The page markup, styles, content configuration and runtime are in index.html; static files are in assets/.

The source ZIP is exported from the same Git commit published to GitHub Pages.
