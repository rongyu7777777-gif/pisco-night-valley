# -*- coding: utf-8 -*-
from pathlib import Path
import json, html, shutil
root=Path(__file__).resolve().parent
j=json.loads((root/'storyboard-and-prompts.json').read_text(encoding="utf-8"))
names=['door-ajar','door-open','private-club','mask-crossing','vampire-castle','coastal-reflection','athlete-house','helmet-crossing','midnight-garage','mirror-crossing','elven-court','map-crossing','roommates','reserved-place']
pairs=['The Door','The Invitation','The Castle','The Coast','The Midnight Garage','The Elven Court','The Reserved Place']
sources=['private-club','private-club','vampire-castle','athlete-house','midnight-garage','elven-court','roommates']
notes=[
'同一扇门从一线光打开；尾帧已明确指定原男主与原会所。门仅用于开场。',
'原男主、灰领带、原灯光。邀请函和假面提前入画，随后转向同一件假面。',
'保留原吸血鬼、黑衬衣、酒红翻领。假面维持同方向，眼孔显露海岸线索。',
'保留原三人、原衣服和座位。窗外黑色机车提前出现；推进到同一小木桌的头盔，镜头沿弧线转向。',
'原车库男主、原机车小圆镜。地图先出现，镜中再显露王庭白桥。',
'原女王、皇冠、长袖衣服和月夜私室。地图、矩形暖窗和三餐串联目的地。',
'原两位室友、原服装、灰沙发和餐桌。邀请函提前入画，最后揭示第三席。'
]
cards=[]
for i in range(7):
 frames=[]
 for k in [i*2,i*2+1]:
  s=j['shots'][k]; num=f'{k+1:02d}'; src=f'keyframes-r2/{num}-{names[k]}.png'
  frames.append(f'<figure><a class="frame-link" href="{src}" data-caption="{num} · {html.escape(s["title"])}"><img src="{src}" alt="{num} {html.escape(s["title"])}" width="1672" height="941"></a><figcaption><b>{num} · {html.escape(s["title"])}</b><span>原分镜：{html.escape(s["frame"])}</span></figcaption></figure>')
 cards.append(f'<section id="pair-{i+1}"><div class="pair-title"><h2>{i+1:02d} / {pairs[i]}</h2><a href="references/{sources[i]}.png" class="source" target="_blank">查看线上原画 ↗</a></div><div class="frames">{"".join(frames)}</div><p class="connection">{notes[i]}</p></section>')
quotes=''.join(f'<p><small>SHOT {x["shot"]}</small> {html.escape(x["quote"])}</p>' for x in j['originalDialogues'])
doc='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PISCO · 14-shot continuity review</title><style>
@font-face{font-family:Inria;src:url(brand/inria-serif-400.ttf)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#10110f;color:#edeae2;font:15px/1.7 system-ui,sans-serif}a{color:inherit;text-underline-offset:5px}header,main,footer{max-width:1480px;margin:auto;padding:36px 40px}header{padding-top:50px;border-bottom:1px solid #36372f}.logo{width:165px;height:55px;overflow:hidden}.logo svg{width:165px;height:auto}h1,h2{font-family:Inria,Georgia,serif;font-weight:400;margin:12px 0}h1{font-size:54px;line-height:1.05}h2{font-size:32px}.eyebrow{color:#b5a98c;font-size:11px;letter-spacing:.18em;text-transform:uppercase}.intro{max-width:880px;color:#bbbdb2}.status{padding:14px 20px;background:#22251e;border-left:2px solid #b8b28c;margin:24px 0}.nav{display:flex;gap:12px;flex-wrap:wrap}.nav a{font-size:12px;border:1px solid #45493d;padding:6px 12px;text-decoration:none}.pair-title{display:flex;align-items:center;justify-content:space-between;gap:16px}.source{color:#b7baa9;font-size:12px}section{margin-bottom:50px;scroll-margin-top:20px}.frames{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0}figure img{display:block;width:100%;height:auto;background:#272923;aspect-ratio:1672/941}figcaption{padding:14px 0;display:flex;flex-direction:column;gap:5px}figcaption span{color:#a7ac9e;font-size:13px}figcaption b{font-weight:500}.connection{margin:0;border-top:1px solid #34382e;padding-top:14px;color:#c0c6b5;font-size:13px}.quotes{display:grid;grid-template-columns:1fr 1fr;gap:0 40px}.quotes p{font:24px/1.4 Inria,Georgia,serif}.quotes small{display:block;font:10px/2 system-ui;color:#adb397;letter-spacing:.12em}footer{border-top:1px solid #34382e;color:#a7ac9e;font-size:12px}dialog{background:#111;border:1px solid #666;color:white;padding:14px;max-width:96vw;width:1600px}dialog::backdrop{background:#000d}dialog img{width:100%;display:block}dialog button{float:right;background:#2d3027;border:1px solid #777;color:white;padding:8px 16px;cursor:pointer}.dialog-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px}@media(max-width:700px){header,main,footer{padding:24px 18px}h1{font-size:38px}h2{font-size:26px}.frames,.quotes{grid-template-columns:1fr}.pair-title{align-items:start}.source{white-space:nowrap}section{margin-bottom:36px}}@media print{body{background:white;color:#111}.nav,.source,dialog{display:none}section{break-inside:avoid}.intro,.connection,figcaption span{color:#444}}
</style><header><div class="logo">LOGO</div><p class="eyebrow">Production review · r2 · 2026.11.12</p>
<h1>The Reserved Place</h1><p class="intro">14 镜完整静态输入稿。以线上原人物和原场景做局部修正，串联邀请函 → 假面 → 头盔 → 后视镜 → 地图 → 第三个位置。</p>
<div class="status"><strong>当前状态：静态修正版，等待审阅。</strong><br>本页是视频参考帧，并非已经生成的视频。此前单首帧开门试片已拒收；没有新增视频消费。</div><nav class="nav">NAV<a href="video-input-plan-r2.json">视频输入配置</a><a href="PC-HANDOFF.md">PC 接续说明</a></nav></header><main>CARDS<section><h2>Original dialogue</h2><div class="quotes">QUOTES</div></section>
<section><h2>Continuity rules</h2><p class="intro">人物、衣服、光线和核心布景沿用线上原画；没有用户伸入画面的手。除开场外，不增加门。04 / 06 / 08 / 10 / 12 以道具反射提前揭露下一幕，画面撕裂由网页层控制。叙事动作跟随滚动、可停可逆，环境微动独立运行。</p>
<p class="intro">每段需要明确绑定首帧和尾帧；模型仍需逐段检查脸、人数、道具形状和空间关系。静态图及提示词本身不保证视频一致。新生成前须核对模型首尾帧能力与费用。</p>
</section>
</main><footer>Exact r5 logo · Inria Serif Regular 400 · Original website preserved · Static candidates are not user-approved.<br>查看原图可对照人物及布景；点击任一分镜可放大。06假面角度与07头盔桌面位置的变体详见 PC 接续说明。</footer><dialog><div class="dialog-head"><span></span><button type="button">关闭 ×</button></div><img alt=""></dialog><script>
const d=document.querySelector('dialog');document.querySelectorAll('.frame-link').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();d.querySelector('img').src=a.getAttribute('href');d.querySelector('img').alt=a.dataset.caption;d.querySelector('span').textContent=a.dataset.caption;d.showModal()}));d.querySelector('button').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()});
</script></html>'''
logo=(root/'brand/pisco-r5.svg').read_text(encoding="utf-8")
# Preserve source path data; viewBox only presents existing artwork without redrawing.
import re
logo=re.sub(r'viewBox="[^"]+"','viewBox="175 195 1450 450"',logo, count=1)
logo=re.sub(r'width="[^"]+"','width="1450"',logo, count=1)
logo=re.sub(r'height="[^"]+"','height="450"',logo, count=1)
doc=doc.replace('LOGO',logo).replace('NAV',''.join(f'<a href="#pair-{i+1}">{i*2+1:02d}–{i*2+2:02d}</a>' for i in range(7))).replace('CARDS',''.join(cards)).replace('QUOTES',quotes)
(root/'review.html').write_text(doc, encoding="utf-8")
print(root/'review.html')

