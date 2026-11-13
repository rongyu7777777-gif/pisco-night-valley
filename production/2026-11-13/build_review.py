from pathlib import Path
import json
from html import escape

ROOT = Path(__file__).resolve().parent
SCENES = [
    ('03-private-club', 'The Private Club', 'A knowing challenge.', 'A diagonal lean, sustained eye contact and gold against the rainy violet city.'),
    ('05-vampire-castle', 'The Vampire Castle', 'Too close to look away.', 'A restrained half-smile, a forward shoulder and wine-red velvet under candlelight.'),
    ('07-athlete-house', 'The Coastal House', 'Three different intentions.', 'Relaxed confidence, playful challenge and quiet amusement in the same room.'),
    ('09-midnight-garage', 'The Midnight Garage', 'An invitation without a word.', 'A lower viewpoint and a held gaze, framed by warm metal and a cold, rainy street.'),
    ('11-elven-court', 'The Elven Court', 'She already knows.', 'An appraising look over the shoulder, gold embroidery and a moonlit city.'),
    ('13-roommates', 'The Roommates', 'Someone saved your place.', 'Two distinct expressions, layered distance and a warm welcome with anticipation.'),
]
nav = ''.join(f'<a href="#{slug}">{slug[:2]} {escape(title)}</a>' for slug,title,_,_ in SCENES)
cards = []
for slug,title,line,desc in SCENES:
    label = escape(title)
    cards.append(f'''
    <article id="{slug}">
      <div class="scene-head"><div><span class="eyebrow">SHOT {slug[:2]}</span><h2>{label}</h2></div>
      <div class="switch" role="group" aria-label="Compare {label}">
        <button type="button" data-mode="new" aria-pressed="true">New direction</button>
        <button type="button" data-mode="old" aria-pressed="false">Previous r2</button>
      </div></div>
      <figure class="frame">
        <img class="new" src="frames/{slug}.png" alt="New cinematic style study: {label}" width="1672" height="941">
        <img class="old" src="originals/{slug}.png" alt="Previous r2 storyboard: {label}" width="1672" height="941" hidden>
        <figcaption class="badge">NEW DIRECTION</figcaption>
      </figure>
      <div class="scene-foot"><div><h3>{escape(line)}</h3><p>{escape(desc)}</p></div><a class="full" href="frames/{slug}.png" target="_blank" rel="noopener">Open full image ↗</a></div>
    </article>''')
html = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PISCO — Cinematic style studies</title><style>
@font-face{font-family:Inria;src:url('brand/inria-serif-400.ttf') format('truetype');font-weight:400;font-display:swap}
:root{color-scheme:dark;--paper:#ede8df;--muted:#a69c90;--line:#393029;--accent:#e1b17d}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:30px}body{margin:0;background:#100e0d;color:var(--paper);font-family:Inria,Georgia,serif;font-weight:400}a{color:inherit}button{font:inherit}button,a{-webkit-tap-highlight-color:transparent}a:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:5px}header,main,footer{width:min(1400px,92vw);margin:auto}header{padding:24px 0 0;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}.logo{width:144px;height:58px;object-fit:contain}.meta,.eyebrow,.badge{font:11px/1.5 Arial,sans-serif;letter-spacing:2px;text-transform:uppercase}.meta{color:var(--muted)}.intro{padding:68px 0 40px;max-width:850px}.eyebrow{color:var(--accent)}h1,h2,h3,p{font-weight:400;margin:0}h1{font-size:clamp(40px,6.4vw,86px);line-height:1.02;margin:16px 0 25px;letter-spacing:-2px}.lead{font-size:21px;line-height:1.55;color:#c9c1b7;max-width:720px}.status{margin-top:18px;color:var(--muted);font:12px/1.7 Arial,sans-serif}nav{display:flex;flex-wrap:wrap;gap:10px 24px;padding:22px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}nav a{text-decoration:none;color:#c7beb3;font-size:15px}nav a:hover{color:var(--accent)}article{padding:48px 0 28px;border-bottom:1px solid var(--line)}.scene-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:20px}h2{font-size:34px;line-height:1.2;margin-top:7px}.switch{display:flex;border:1px solid #514338;border-radius:3px;overflow:hidden;flex-shrink:0}.switch button{cursor:pointer;border:0;background:transparent;color:#b6a99b;padding:11px 17px;font-size:15px}.switch button[aria-pressed=true]{background:var(--paper);color:#21170f}.frame{margin:0;position:relative;background:#080706;aspect-ratio:1672/941;overflow:hidden}.frame img{width:100%;height:100%;object-fit:contain;display:block}.frame img[hidden]{display:none}.badge{position:absolute;left:16px;top:16px;background:#111b;padding:7px 11px;color:#eee4d8;backdrop-filter:blur(6px);font-size:9px}.scene-foot{display:flex;justify-content:space-between;gap:30px;padding:22px 0 5px}h3{font-size:25px;margin-bottom:7px}.scene-foot p{color:var(--muted);font-size:17px;line-height:1.5;max-width:880px}.full{white-space:nowrap;align-self:start;font-size:14px;color:#c9aa8c;text-underline-offset:5px;margin-top:6px}footer{padding:38px 0 60px;color:var(--muted);font:12px/1.8 Arial,sans-serif}footer a{text-underline-offset:4px}
@media(max-width:650px){header{padding-top:12px}.logo{width:118px}.meta{font-size:9px;letter-spacing:1px}.intro{padding:38px 0 28px}.lead{font-size:18px}h1{letter-spacing:-1px}.scene-head{align-items:start;flex-direction:column;gap:14px}h2{font-size:29px}.switch button{padding:9px 14px;font-size:14px}.scene-foot{flex-direction:column;gap:10px}.scene-foot p{font-size:16px}.badge{left:8px;top:8px;font-size:8px;padding:4px 7px}article{padding-top:32px}nav{gap:13px 20px}nav a{font-size:14px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body>
<header><img class="logo" src="brand/pisco-r5.svg" alt="PISCO"><span class="meta">Cinematic studies · 13 Nov 2026</span></header>
<main><section class="intro"><div class="eyebrow">Six scenes / A new visual direction</div><h1>Closer.<br>More charged.</h1><p class="lead">Held gazes. Off-axis poses. Candle-gold against violet night. Six character encounters, with their story clues kept in place.</p><p class="status">Static style studies for review. The original 14-shot storyboard remains available. Compare each study with its previous r2 frame.</p></section>
<nav aria-label="Scenes">NAV_PLACEHOLDER</nav>
CARDS_PLACEHOLDER
</main><footer><p>Built-in ImageGen · PISCO r5 · Inria Serif Regular 400</p><p>These six studies explore acting, framing and light. Adjacent transition frames still need to be aligned after the direction is selected.</p><p><a href="prompts.json">Prompts &amp; production record</a> · <a href="PC-HANDOFF.txt">Continue on PC</a></p></footer>
<script>
document.querySelectorAll('.switch button').forEach(button => button.addEventListener('click',()=>{
 const article=button.closest('article'); const old=button.dataset.mode==='old';
 article.querySelector('.old').hidden=!old; article.querySelector('.new').hidden=old;
 article.querySelectorAll('.switch button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 article.querySelector('.badge').textContent=old?'PREVIOUS R2':'NEW DIRECTION';
 const full=article.querySelector('.full');full.href=(old?'originals/':'frames/')+article.id+'.png';
}));
</script></body></html>'''
(ROOT/'review.html').write_text(html.replace('NAV_PLACEHOLDER',nav).replace('CARDS_PLACEHOLDER',''.join(cards)),encoding='utf-8')
print('Built review.html with 6 scene comparisons.')
