from pathlib import Path
import json, hashlib, struct

root = Path(__file__).resolve().parent
story = json.loads((root / 'storyboard.json').read_text(encoding='utf-8'))
art = json.loads((root / 'generation-index.json').read_text(encoding='utf-8'))
assets = []
for item in art['boards'] + art['seams']:
    path = root / item['file']
    raw = path.read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'
    width, height = struct.unpack('>II', raw[16:24])
    item['sha256'] = hashlib.sha256(raw).hexdigest()
    item['width'], item['height'] = width, height
    assets.append({key: item[key] for key in ['id', 'file', 'sha256', 'width', 'height']})

extra_files = list(art.get('productionAssets', []))
pilot = story.get('production', {}).get('pilot', {})
if pilot.get('file'):
    extra_files.append(pilot['file'])
for relative in extra_files:
    raw = (root / relative).read_bytes()
    assets.append({'file': relative, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})

seams = {item['id']: item for item in art['seams']}
clips = []
for i, b in enumerate(art['boards']):
    shots = [s for s in story['shots'] if s['board'] == b['id']]
    def boundary(key):
        if not key:
            return None
        item = seams[key]
        return {k: item[k] for k in ['id', 'file', 'sha256']}
    clips.append({'id': b['id'], 'referenceBoard': b['file'], 'status': 'storyboard_only',
                  'fps': 24, 'suggestedSeconds': 8, 'startImage': boundary(b['entry']),
                  'endImage': boundary(b['exit']), 'shots': [s['id'] for s in shots],
                  'videoPrompt': '\n'.join(s['action'] + ' Camera: ' + s['camera'] for s in shots),
                  'limitations': 'Prepare standalone full-resolution character keyframes before generation. The contact sheet is not a video input frame.'})
for a, b in zip(clips, clips[1:]):
    assert a['endImage'] == b['startImage']
assert len(story['shots']) == 24 and sum(s['frameCount'] for s in story['shots']) == 1152
plan = {'status': 'opening_pilot_generated_full_sequence_pending', 'fps': 24, 'linearReferenceSeconds': 48,
        'pilot': story['production'].get('pilot'),
        'sharedBoundaryRule': 'Adjacent clips must reference the same file and SHA256. This does not alone guarantee motion continuity.',
        'clips': clips, 'production': story['production']}
(root / 'video-plan.json').write_text(json.dumps(plan, ensure_ascii=False, indent=2), encoding='utf-8')
(root / 'assets-manifest.json').write_text(json.dumps(assets, ensure_ascii=False, indent=2), encoding='utf-8')
template = (root / 'review-template.html').read_text(encoding='utf-8')
payload = json.dumps({'story': story, 'art': art}, ensure_ascii=False).replace('</', '<\\/')
(root / 'review.html').write_text(template.replace('__DATA__', payload), encoding='utf-8')
print(f'Built 24-shot review, {len(clips)} clip plans and {len(seams)} identical shared boundaries.')
