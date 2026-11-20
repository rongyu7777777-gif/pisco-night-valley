# Pisco — Four video previews

Revision: v44-new-fourth-video-20261120.

1. The Countdown — 1×
2. The Winter Lodge — 1.5×
3. The Poker Table — 1.5×
4. The Surprise Party — 1×

The first chapter now uses the user-supplied countdown footage from 2026-11-18, with matching start/end images. Its complete 302-frame, 1920x1080, 30 fps timeline is preserved in a fast-start H.264 MP4; the original AAC audio packets are copied unchanged. First-scene playback remains 1x. First-scene titles, teaser, accessibility text and Stories card now match the countdown scene. The stable coffee-date scene ID remains for existing deep links.

The Winter Lodge now uses the user-supplied 2026-11-18 16:27 video with matching start/end images. Its complete 362-frame, 1920x1080, 30 fps timeline is preserved in a fast-start H.264 MP4, with unchanged original AAC audio packets. Native playback remains 1.5x.

The third chapter replaces the previous motorcycle clip with the newly supplied private poker-table footage, matching cover images and copy. The Winter Lodge and The Poker Table now play 50% faster through native per-scene playbackRate. The video files retain their full original timelines; speed is not baked into the MP4s. A web-optimized H.264 third clip preserves original frame timestamps and AAC audio.

The fourth chapter now uses the supplied 2026-11-20 21:12 surprise-party video. Its complete 241-frame, 1920x1080, 24 fps timeline is preserved in a web-compatible H.264 MP4 with fast-start metadata, and the original stereo AAC packets are copied unchanged. The full 10.08-second media duration includes the audio tail. New start/end posters are extracted from this web video. Playback stays at 1x; the stable ballroom scene ID preserves existing deep links. The previous fourth-chapter video and posters have been removed from the current source package.

The Sound control plays the original embedded audio of the current chapter. It is available on desktop and mobile. Videos start muted for browser autoplay; click the speaker icon beside the social links to enable original audio. Audio follows the active chapter during transitions, keeping background/preloaded chapters muted. The synthetic oscillator soundtrack has been removed. The new fourth chapter includes its original AAC audio, controlled by the same Sound toggle. Native pitch preservation remains enabled for the 1.5x scenes.

The R9 SVG paths and aspect ratio are preserved; its fills now use the supplied reference red (#EA0B1B). Header logo widths remain 92 px on desktop, 74 px on mobile portrait and 64 px on small-screen landscape.

The temporary “Setting the scene…” loading label and the thin progress bar at the very bottom edge have been removed. Chapter navigation and the animated scroll hint remain available. Media initialization, camera travel and chapter deep links are unchanged.

This is a current preview release; updated footage is expected later. Scroll, drag and arrow keys control camera travel independently from native playback. Chapter four wraps to chapter one, including reverse travel.

GitHub Pages publishes this self-contained static site from the root of main. Typography uses Bodoni Moda for headlines and Manrope for body/UI, self-hosted as WOFF2. Both are licensed under SIL OFL 1.1; full notices are included in assets/fonts/.

The header links to the supplied TikTok, X and Discord destinations in new tabs, using locally embedded Tabler outline brand marks. Stories, About and the 18+ header label are removed. The logo uses a 28-40 px desktop left inset (8 px more breathing room from the left edge) and a 16 px mobile left inset, preserving the original artwork and size.

Social links are icon-only on all screen sizes, with optically balanced brand sizes and 44 px touch targets. The original-audio toggle sits beside them and switches between muted-speaker and sound-wave icons, with accessible state labels and keyboard focus.

This revision preserves the latest typography, outline icons and individual scene compositions. The desktop scroll hint now has a gently floating arrow: a 1.8-second cycle, 6 px of downward travel and subtle opacity change. Its text stays still. The animation is disabled when reduced motion is requested; the existing mobile hint visibility is unchanged.

Header icons use a unified white (#FFFFFF) outline style; the Pisco logo retains the reference red (#EA0B1B). Every icon shares a 1.5 px non-scaling stroke, round caps and round joins; optical sizes and the speaker offset balance their visual centers. Social marks come from Tabler Icons (MIT; assets/icons/TABLER-LICENSE.txt).

The volume control follows the supplied mute/unmute references with custom linear artwork: a compact outlined speaker, an X for muted playback, and two curved sound waves when enabled. Both states use the same unfilled, 1.5 px rounded white stroke as the header icons, preserving the existing 44 px touch target, accessible labels and original-audio toggle behavior.

Header icon sizes are calibrated for visual weight: TikTok 25 px, X 26 px, Discord 25 px and both sound states 29 px. Click targets remain 44 px. The group sits 12 px farther right on narrow screens; desktop right inset is 16-24 px.

The eyebrow captions and decorative short rules above all four scene headlines have been removed; main headlines and descriptions remain.

The X mark has returned to the same Tabler outline family as TikTok and Discord.

Each desktop scene has its own copy composition and camera approach, tuned against actual start/middle/end video frames:
- Countdown: compact middle-left copy, slight upper-left focus, zoom 1.025 to 1.08.
- Winter Lodge: upper-right copy, upward focus, zoom 1.025 to 1.12.
- Poker Table: upper-left copy, focus toward the lower table, zoom 1.025 to 1.18.
- Surprise Party: lower-left copy, focus toward the right, zoom 1.025 to 1.14.
Text keeps the -128 px approach travel and original exit travel. Scaling is restrained to 1.08 during approach and 1.12 at exit, reducing coverage of the characters while keeping gesture-linked depth. Each scene retains its starting composition and transform origin. Camera crop positions are clamped to keep the canvas covered, and the incoming transition uses the next scene's starting camera. Portrait text stays separate from the video, retaining its original 0.45 travel and 0.2 scale multipliers. Reduced-motion mode keeps the camera/text composition static.

## Current scene copy

The headline and supporting text use the following supplied pairs. Existing headline capitalization and scene composition are preserved. On desktop viewports at most 640 px tall, the opening copy starts at 42vh to keep the longer headline clear of chapter navigation.

- The Countdown (option 6): **A little danger. An undeniable spark.** — Meet the character you’ll think about tomorrow.
- The Winter Lodge (option 3): **Softly intoxicating. Uniquely yours.** — Step into stories where your daydreams come alive.
- The Poker Table (option 5): **Some stories begin after midnight.** — What happens next is yours to decide.
- The Surprise Party (option 4): **One taste, and reality can wait.** — Stay for the spark. Come back for the chemistry.

Desktop headline containers now use up to 760 px / 60vw, replacing the narrower per-scene limits. Headlines use the full container width without an additional em-based cap. Font sizes, copy, scene anchors and alignments are preserved; supporting text retains its narrower 30ch measure, and mobile text remains bounded by the available screen width.

The Countdown headline breaks after “danger.” and the Surprise Party headline after “taste,” so “An” and “and” begin their next phrases. Explicit line breaks are preserved while narrow screens can still wrap naturally.

The tear transition now starts after 646 px of wheel travel per scene instead of 1,292 px; its visible opening follows the existing rendering curve. The opening itself retains its original 1,216 px travel, shape and reversible progression; native video timing is unchanged.

## Red logo and white interface

The Pisco logo keeps the supplied reference red, RGB(234, 11, 27), #EA0B1B. Its embedded and external SVG copies are identical. Headlines, body copy, outline icons and active chapter marks use white at 65% opacity, with 65% white for chapter labels and the scroll hint. Inactive chapter marks and separators use 20% white. Header icons brighten to full white on hover or focus. The logo and tear-light opacity are independent of this softer interface styling. The tear keeps a bright white core and white fibers, with a red (#EA0B1B) outer halo and a sparse red accent among the edge particles (approximately 25% selected without increasing particle density). The Canvas fallback uses the same white edge and red shadow. Ambient lighting remains white. White-core intensity, geometry, layout, typography, semantic line breaks, scroll distances and restrained text scaling are preserved. Video and poster artwork retain their original colors.

## Run locally

This source package contains the complete static site, including videos, poster images, self-hosted fonts and licenses. No dependency installation or build step is required.

From the extracted directory, run:

```sh
python -m http.server 4218
```

Then open http://127.0.0.1:4218/ in a browser. The page markup, styles, content configuration and runtime are in index.html; static files are in assets/.

The source ZIP is exported from the same Git commit published to GitHub Pages.
