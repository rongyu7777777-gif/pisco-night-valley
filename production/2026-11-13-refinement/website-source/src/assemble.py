from pathlib import Path
import base64, mimetypes, re, json, hashlib, shutil

root=Path(__file__).resolve().parent.parent
source=root/'src'
assets=root/'assets'
def uri(path,mime=None):
    return 'data:'+(mime or mimetypes.guess_type(str(path))[0] or 'application/octet-stream')+';base64,'+base64.b64encode(path.read_bytes()).decode()
fonts=(assets/'fonts.css').read_text()
fonts='/*\n'+(assets/'fonts/inria-serif-OFL.txt').read_text()+'\n*/\n'+fonts
for rel in set(re.findall(r'url\(([^)]+)\)',fonts)):
    fonts=fonts.replace(rel,uri(assets/rel,'font/ttf'))
stories=json.loads((assets/'stories.json').read_text())
focus=[.16,.16,0,.12,.1,-.32]
scenes=[{'id':s['id'],'focus':focus[i],'src':uri(assets/'roleplay-20261111'/s['image'],'image/webp')} for i,s in enumerate(stories)]
motion_manifest=assets/'scene-motion.json'
motion=json.loads(motion_manifest.read_text()) if motion_manifest.exists() else {}
motion_output=root/'dist/assets/motion'
if motion_output.exists(): shutil.rmtree(motion_output)
for scene in scenes:
    relative=motion.get(scene['id'])
    if not relative: continue
    clip=(assets/relative).resolve()
    if assets.resolve() not in clip.parents or clip.suffix.lower() not in ('.mp4','.webm') or not clip.is_file():
        raise ValueError(f'Invalid motion asset for {scene["id"]}: {relative}')
    digest=hashlib.sha256(clip.read_bytes()).hexdigest()[:12]
    filename=f'{scene["id"]}-{digest}{clip.suffix.lower()}'
    motion_output.mkdir(parents=True,exist_ok=True)
    shutil.copy2(clip,motion_output/filename)
    scene['video']=f'assets/motion/{filename}'
engine='const STORY_CONTENT='+json.dumps(stories,ensure_ascii=False)+';\nconst PISCO_SCENES='+json.dumps(scenes)+';\n'+(source/'travel.js').read_text()+'\n'+(source/'scene-motion.js').read_text()+'\n'+(source/'theatre.js').read_text()
app=(source/'app.js').read_text()
html=(source/'interface.html').read_text().replace('/* EMBED_FONTS */',fonts).replace('LOGO_URI',uri(assets/'pisco-logo-latest.svg','image/svg+xml')).replace('/* EMBED_THEATRE */',re.sub(r'</script',r'<\\/script',engine,flags=re.I)).replace('/* EMBED_APP */',re.sub(r'</script',r'<\\/script',app,flags=re.I))
(root/'dist').mkdir(exist_ok=True)
(root/'dist/index.html').write_text(html)
print('Built six-world roleplay version:',len(html.encode()),'bytes')

# Keep the coordinated artwork as a separate static website preview.
# New costumes must not flash back to the previous videos during playback.
study_manifest=assets/'art-studies.json'
if study_manifest.exists():
    studies=json.loads(study_manifest.read_text())
    study_scenes=[dict(scene) for scene in scenes]
    if set(studies)!=set(scene['id'] for scene in scenes):
        raise ValueError('The art preview requires one approved-for-review still for each of the six worlds.')
    study_output=root/'dist/assets/art'
    study_output.mkdir(parents=True,exist_ok=True)
    for scene in study_scenes:
        item=studies[scene['id']]
        study=(assets/item['image']).resolve()
        if assets.resolve() not in study.parents or not study.is_file():
            raise ValueError(f'Invalid art study: {item["image"]}')
        digest=hashlib.sha256(study.read_bytes()).hexdigest()[:12]
        filename=f'{scene["id"]}-{digest}{study.suffix.lower()}'
        shutil.copy2(study,study_output/filename)
        scene['src']=f'assets/art/{filename}'
        scene['focus']=item['focus']
        scene.pop('video',None)
    study_engine=engine.replace('const PISCO_SCENES='+json.dumps(scenes)+';', 'const PISCO_SCENES='+json.dumps(study_scenes)+';',1)
    study_html=html.replace(re.sub(r'</script',r'<\\/script',engine,flags=re.I),re.sub(r'</script',r'<\\/script',study_engine,flags=re.I),1)
    study_html=study_html.replace('<title>Pisco — Behind the Curtain</title>','<title>Pisco — Six-world art studies</title>')
    study_html=study_html.replace('<body data-view="hero"', '<body data-art-study="editorial-v3" data-view="hero"',1)
    (root/'dist/art-study.html').write_text(study_html)
    print('Built art-study.html with six new stills; previous videos excluded from this art preview.')
