from pathlib import Path
import json, shutil

root = Path(__file__).resolve().parent
def read(name): return json.loads((root/name).read_text())
def write(name, data): (root/name).write_text(json.dumps(data, ensure_ascii=False, indent=2))
archive = root/'archive/v6'; archive.mkdir(parents=True, exist_ok=True)
for name in ['storyboard.json','video-plan.json','generation-index.json','direction.json']:
    if not (archive/name).exists(): shutil.copy2(root/name, archive/name)
story=read('storyboard.json'); art=read('generation-index.json'); refinement=read('prop-refinement-v8.json')
story.update(version='v8',status='道具推进版完整分镜；拉帘入站视频已生成，整条视频待制作与连续性验收',scope='24 镜动作分镜 + 5 个道具／光源匹配切点 + 入站与选择闭环。保留六个不同世界与六句原对白。')
changes={
'03':dict(action='他瞥一眼离场宾客，再看向你，把手里的双眼面具随手放在烛台旁，倚住桌上的小盒；手松开系带。',camera='保持人物与桌边在同一镜头里；镜头随手的下落降低，靠近放稳的面具。',reason='面具从开场就自然存在；放下舞会身份，转入私人邀约。对白处可以回答，也可以继续探索。'),
'04':dict(title='镜头靠近桌边的眼孔',action='面具留在桌上不动，镜头贴近其中一个眼孔；另一只眼与鼻梁逐渐出画。',camera='由中近景连续推到微距；左眼杏仁轮廓和左上高光对齐 T1，焦点由蕾丝落向眼孔深处。',reason='观众主动靠近细节；角色无需把物件举向镜头。'),
'05':dict(title='掠过面具，发现另一个人',action='同一眼孔近景接入古堡；镜头向前略向右掠过床边桌上刚摘下的面具，露出斜卧的银发吸血鬼。',camera='T1 首帧后保持前进并做小弧线侧移，近处蕾丝边向左出画；不让人物拿面具遮挡镜头。',reason='面具属于两场的舞会余韵，视觉接点相同，人物与世界发生变化。'),
'11':dict(action='左边让出沙发；中间拎起玄关原有的头盔示意出门；右边递来饮料。',camera='先看清三人的不同邀约，再沿中间人的转身移向玄关；头盔一直在故事空间内。',reason='留在沙发、一起出门、接下饮料都能进入角色故事；继续滚动跟随出门的动作。'),
'12':dict(title='留在玄关的黑色镜片',action='准备出门的人把头盔暂放在玄关凳上，转身拿外套；镜头继续接近静止的镜片。',camera='从人物手的落点接一次短前推；末帧对齐 T3 的轮廓和琥珀弧光，手和人物均已离开微距画面。',reason='头盔是出门准备的一部分，动作完成后由镜头接续，而非递向观众遮屏。'),
'13':dict(action='T3 的黑镜片接入车库；骑手顺手把头盔挂在车把旁，镜头略向右前移，展开摩托与车库。',camera='镜片移出光轴时才露出环境；保持琥珀反光方向和曝光，不能让旧房间的倒影带进车库。'),
'15':dict(action='他坐稳后回头看你，一手拍空后座，另一手留在车把；固定后视镜已映出身后的林道灯火。',camera='沿后座向前靠近他的肩侧，再由目光移焦到原有后视镜；不用手把镜子扭向观众。',reason='拍后座完成邀约；镜中延伸的路给用户一个继续前进的方向。'),
'16':dict(title='沿镜中的路继续',action='骑手的动作停在等待；镜头自己靠近固定的圆镜，三点金光和林径逐步占满画面。',camera='在接近过程中逐渐靠近镜面法线；到 T4 时圆框、林径和三灯位置匹配，再继续前推至镜框出画。',reason='镜头从一个自然存在的倒影进入另一世界，骑手不展示镜子。'),
'17':dict(action='镜框随前推扩出画面，倒影里的林道成为眼前私庭；女王在右侧向前走，回头确认你跟上。',camera='沿同一林径继续前进，三盏灯保持位置关系；庭院不再额外摆一面圆镜。'),
'21':dict(action='同形烛焰接入室友餐桌；她为放下第三份餐，把桌上蜡烛移开半掌距离，镜头顺势掠过。',camera='先匹配烛焰形状与摆动方向，再延续小幅向前侧移；移动蜡烛是为腾出餐位。',reason='同一束暖光把神秘邀约带回日常；三份晚餐说明空位一直为你保留。')}
for s in story['shots']:
    s.update(changes.get(s['id'],{}))
trans=story['transitions']
trans[0].update(motion='放下面具→镜头推入眼孔→沿床边桌的面具侧缘向前掠过',notes='完整道具保持可佩戴的双眼半面结构；微距只拍其中一个眼孔。两个场景都先交代面具的存在，再由镜头完成匹配剪辑。禁止角色端着面具挡镜头。')
trans[2].update(motion='出门准备中放下头盔→镜头推近静止镜片→车库里顺手挂起',notes='头盔先出现在玄关，具有出门用途；切点共用 T3 的黑镜片与单条暖反光。不要为转场新增第二次递物动作。')
trans[3].update(motion='拍后座后镜头移焦→推近固定后视镜→镜框出画，倒影的林道成为私庭',notes='保持镜中林径、三盏灯与下一场入场画面的一致性；车库的镜子正常固定在车把，庭院中不加镜子。此处是有意的跨世界镜头语言。')
trans[4].update(motion='护火动作完成→镜头推近火焰→为第三份餐腾位置时蜡烛侧移',notes='保留同形火焰、偏转方向和曝光；室友移动蜡烛是为了放餐，转场不能先于这项动作的动机。')
story['production'].update(motion='镜头推进是主线，但每一段有自己的轨迹：贴桌前推、抬头接光源、跟随到玄关、过肩移焦、越过桌边。角色不重复递物或遮挡镜头。',canonical='seams/ 中五张交接原图锁定微距切点；四格图仅示意动作与构图。T4 出镜后的林径仍需单独做与倒影一致的全幅关键帧。',evaluation='整条视频仍未完成。逐个切点检查前后各至少 12 帧：形状、方向、速度、曝光、焦点与倒影；首尾帧相同并不能保证中间运动合格。',pilot={'id':'P01-arrival','file':'video-production/P01-arrival/P01-arrival-v6-hailuo02.mp4','status':'generated_first_sample','model':'Hailuo-02','requestedSeconds':6,'note':'入站拉帘独立样片；不是 48 秒整条成片。尚需逐帧审查动作与镜头是否满足导演要求。'})
story['direction']='采用道具近景推进与形状／光感匹配切换不同世界。v7 环境构图替换方案停止。'
art['version']='v8'
for job in refinement['jobs']:
    b=next(b for b in art['boards'] if b['id']==job['id'])
    target=root/'scenes'/job['id']/'storyboard-v8.png';shutil.copy2(job['source'],target)
    b.update(file=str(target.relative_to(root)),source=job['source'],naturalActionPrompt=job['prompt'])
    (target.parent/'storyboard-v8.prompt.txt').write_text(job['prompt'])
env=read('environment-direction-v7.json');env.update(status='not_selected',supersededBy='v8 道具近景推进方案',reason='用户反馈环境对接不如之前道具衔接自然，镜头感不足。')
write('environment-direction-v7.json',env)
for item in refinement['archivedEnvironment']:
    if item.get('source'):
        dest=root/'archive/environment-v7'/item['id'];dest.mkdir(parents=True,exist_ok=True)
        shutil.copy2(item['source'],dest/'environment-pair.png')
write('storyboard.json',story);write('generation-index.json',art)
write('direction.json',{'version':'v8','selected':'道具推进与匹配剪辑','notSelected':'v7 环境大景对接','principles':['六个不同世界，原剧情与原对白保留','先建立人物与邀请，再跟着自然动作发现道具','轮廓、材质、明暗、运动方向和节奏共同匹配','维持参考图的浪漫半写实 CG，减少紫色','入站、停留、选择与最后六故事入口形成完整体验'],'transitions':trans})
template=(root/'review-template.html').read_text()
template=template.replace('串联分镜 v6','串联分镜 v8').replace('CONNECTED STORYBOARD / V6','CONNECTED STORYBOARD / V8')
template=template.replace('以及一件引向下一场的东西。','镜头顺着动作发现面具、光源、镜片和倒影，推进到下一场。')
template=template.replace('先让道具转正，再推进；下一场用道具移开、镜框出画等动作展开，保持总体前进方向。','道具先有场景与用途，再让镜头靠近。去掉端面具、举头盔、把镜子转给镜头的动作；五处衔接各有自己的运镜。')
template=template.replace('<h2>下一步视频怎样制作</h2>','<h2>视频制作与入站样片</h2>')
template=template.replace('<div class="handoff"><article>','<article class="pilot"><h3>已生成 · 6 秒拉帘入站样片</h3><p class="muted">Hailuo-02 · 1080P · 已绑定独立首尾画面。此段为实际生成视频；下方 24 镜仍是静态分镜预演。</p><video controls playsinline preload="metadata" style="width:100%;max-height:70vh;background:#000" src="video-production/P01-arrival/P01-arrival-v6-hailuo02.mp4" poster="scenes/01-arrival-club/keyframes/KF01-curtain-start.png"></video><p class="muted">当前只完成入站样片，六世界的完整成片和五个切点尚未生成、验收。</p></article><div class="handoff"><article>',1)
template=template.replace('人物视频、切点速度连续性和手机专用关键帧待后续制作。','入站样片已生成；其余人物视频、切点连续性和手机专用关键帧待制作。')
template=template.replace('后段动作 · 道具移开或继续进入场景','后段动作 · 沿近景揭示新世界')
(root/'review-template.html').write_text(template)
(root/'PC-HANDOFF.txt').write_text('''PISCO 串联分镜 v8 / 2026-11-13

当前方向：恢复之前的道具近景推进与匹配剪辑。六个不同世界保留。
最新用户反馈：环境衔接不如道具衔接自然、镜头感强。
v7 环境大景方案仅放在 archive/environment-v7，不进入当前分镜和视频制作。

打开 review.html 可以离线查看 24 镜分镜、5 个微距交接点和入站视频。
当前 6 秒入站样片：video-production/P01-arrival/P01-arrival-v6-hailuo02.mp4
视频是 TapNow / Hailuo-02、1080P、单条生成，首尾两张图片均已绑定。
不是整条 48 秒视频。六世界完整视频尚未生成，切点连续性尚未验收。

面具：props/venetian-mask/design-v6.png，是双眼、鼻梁与两颊完整的象牙白蕾丝银边半面款。
分镜图片按 scenes/01...06 分目录。v8 替换 1–5 场的部分动作，6 场继续用 v6。
五张微距交接原图位于 seams/，以 generation-index.json 当前 file 字段为准。
不要把整个四格图作为图生视频输入。每段先准备独立动作首尾关键帧。

转场动作：面具放回桌边；月轮接球灯；出门时把头盔暂放玄关；镜头靠近固定后视镜；护住的火接餐桌腾位。
禁止人物反复把物件举到镜头前。女王庭院不再添加独立圆镜。
T4 倒影与庭院入场需保持同一条路径、三灯位置与光向。

48 秒只用于静态导演预演。实际网站以滚动控制，用户可在任一对白处停留并进入故事。
六句原对白未改。官网公开版本本轮未发布。
''')
print('Updated v8 storyboard and review source; archived rejected environment direction.')
