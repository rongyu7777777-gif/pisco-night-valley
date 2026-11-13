import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const CameraTravel=vm.runInNewContext(fs.readFileSync(new URL('../src/travel.js',import.meta.url),'utf8')+';CameraTravel');
const describeJourney=vm.runInNewContext(fs.readFileSync(new URL('../src/travel.js',import.meta.url),'utf8')+';describeJourney');
const describeTear=vm.runInNewContext(fs.readFileSync(new URL('../src/travel.js',import.meta.url),'utf8')+';describeTear');
const describeTypography=vm.runInNewContext(fs.readFileSync(new URL('../src/travel.js',import.meta.url),'utf8')+';describeTypography');
const TheatreScene=vm.runInNewContext(fs.readFileSync(new URL('../src/theatre.js',import.meta.url),'utf8')+';TheatreScene',{describeJourney,describeTear,PISCO_SCENES:Array.from({length:6},(_,i)=>({id:'world-'+i,focus:0}))});
const settle=c=>{for(let i=0;i<180;i++)c.update(1/60);};
test('small wheel deltas move the camera before any chapter changes',()=>{const c=new CameraTravel();c.push(12);c.update(1/60);assert.ok(c.position>0&&c.position<.01);assert.ok(c.target>c.position);});
test('a burst of small inputs is accumulated rather than throttled away',()=>{const c=new CameraTravel();for(let i=0;i<30;i++)c.push(5);settle(c);assert.ok(Math.abs(c.position-150/1550)<.00001);});
test('reverse input retraces the same rail and respects the entrance',()=>{const c=new CameraTravel();c.push(1800);settle(c);c.push(-900);settle(c);assert.ok(Math.abs(c.position-900/1550)<.00001);c.push(-2000);settle(c);assert.equal(c.position,0);});
test('idle frames settle without silently advancing the narrative',()=>{const c=new CameraTravel();c.seek(1.4);settle(c);const previous=c.position;settle(c);assert.equal(c.position,previous);assert.equal(c.target,1.4);});
test('camera depth is continuous across all five world boundaries in both directions',()=>{const scene=Object.create(TheatreScene.prototype);scene.sources=Object.fromEntries(Array.from({length:6},(_,i)=>[i,{img:{width:1672,height:941}}]));scene.travel={position:0,max:6};for(const boundary of [1,2,3,4,5]){scene.travel.position=boundary-.00001;const before=scene.homeFrame();scene.travel.position=boundary+.00001;const after=scene.homeFrame();assert.equal(before.b.name,after.a.name);assert.ok(Math.abs(before.db-after.da)<.001);}scene.travel.position=.3;const a=scene.homeFrame();scene.travel.position=.31;assert.ok(scene.homeFrame().da>a.da);});
test('six-world rail clamps at each end and keeps the final world visible',()=>{const c=new CameraTravel();c.push(100000);settle(c);assert.equal(c.position,6);c.push(-100000);settle(c);assert.equal(c.position,0);const scene=Object.create(TheatreScene.prototype);scene.sources=Object.fromEntries(Array.from({length:6},(_,i)=>[i,{img:{width:1672,height:941}}]));scene.travel={position:6,max:6};assert.equal(scene.homeFrame().a.name,'world-5');});
test('entering a later story retains the visible world instead of flashing the first world',()=>{const scene=Object.create(TheatreScene.prototype);scene.sources=Object.fromEntries(Array.from({length:6},(_,i)=>[i,{img:{width:1672,height:941}}]));scene.travel={position:4.3,max:6};scene.current=scene.destination=scene.scene(0);scene.mode='home';scene.transition=1;scene.setStory(4,0);assert.equal(scene.current.index,4);assert.equal(scene.destination.index,4);assert.equal(scene.mode,'story');assert.equal(scene.stage,0);});
test('the same rail positions produce the same image tear in both scroll directions',()=>{const c=new CameraTravel();const points=[.55,.63,.74,.86,.94,.99,1.01];const frames=[];for(const p of points){c.seek(p);settle(c);frames.push(describeJourney(c.position));}for(let i=points.length-1;i>=0;i--){c.seek(points[i]);settle(c);assert.deepEqual(describeJourney(c.position),frames[i]);}});
test('story entry near every threshold uses the incoming world already visible on screen',()=>{const scene=Object.create(TheatreScene.prototype);scene.sources=Object.fromEntries(Array.from({length:6},(_,i)=>[i,{img:{width:1672,height:941}}]));scene.travel={position:0,max:6};for(let i=0;i<5;i++){scene.travel.position=i+.96;scene.mode='home';scene.current=scene.destination=scene.scene(i);const frame=scene.homeFrame();assert.equal(frame.visibleScene,i+1);scene.setStory(frame.visibleScene);assert.equal(scene.current.index,i+1);assert.equal(scene.destination.index,i+1);assert.equal(scene.transition,1);}});
function typographyDomFixture(){
  const source=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const render=source.match(/^function renderHome\(n\).*$/m)[0];
  const update=source.match(/^function updateJourney\(position\).*$/m)[0];
  const element=()=>({style:{setProperty(name,value){this[name]=value;}},attributes:{},children:[],
    setAttribute(name,value){this.attributes[name]=value;},
    replaceChildren(...children){this.children=children;},querySelectorAll(){return this.children;}});
  const elements=Object.fromEntries(['#chapterLine','#chapter','#cue','#caption','#eyebrow','#title'].map(id=>[id,element()]));
  const stories=Array.from({length:6},(_,i)=>({id:'world-'+i,t:'World '+i,beats:['Entrance '+i,'Closer '+i],quote:'Response '+i}));
  const hero=element();
  const context={describeJourney,describeTypography,hero,view:'hero',stories,reduced:false,homeStep:0,homeBeat:-1,
    $:id=>elements[id],document:{createElement:element},markView(){},
    setTimeout(){throw Error('Gesture typography must not schedule a delayed text swap.');}};
  const api=vm.runInNewContext(render+';'+update+';({renderHome,updateJourney})',context);
  api.renderHome(0);
  return {api,context,elements,hero};
}
test('visible title and scene composition update together while crossing and reversing',()=>{
  const f=typographyDomFixture();
  for(const [position,expected] of [[.70,0],[.7507,0],[.765,1],[.84,1],[.909,1],[1.04,1],[.909,1],[.765,1],[.7507,0],[.70,0],[4.96,5]]){
    f.api.updateJourney(position);
    assert.equal(f.context.homeStep,expected);
    assert.equal(f.elements['#title'].textContent,'World '+expected);
    assert.equal(f.hero.attributes['data-scene'],'world-'+expected);
    assert.equal(f.hero.inert,!describeTypography(position).interactive);
  }
});
test('caption handoffs move the existing lines without restarting the scene title',()=>{
  const f=typographyDomFixture(),lines=f.elements['#caption'].children;
  const boundaries=[.52/3,2*.52/3];
  for(const boundary of boundaries){
    f.api.updateJourney(boundary-.005);
    const before=lines.map(line=>line.style.transform);
    f.api.updateJourney(boundary+.005);
    assert.equal(f.elements['#caption'].children,lines);
    assert.equal(f.elements['#title'].textContent,'World 0');
    assert.notDeepEqual(lines.map(line=>line.style.transform),before);
    assert.equal(lines.filter(line=>line.attributes['aria-hidden']==='false').length,1);
  }
});

test('a tear starts as a complete outgoing image and ends without residual fragments',()=>{
  const start=describeTear(0),end=describeTear(1);
  assert.equal(start.open,0);assert.equal(start.lift,0);assert.equal(start.rim,0);
  assert.equal(end.open,1);assert.equal(end.lift,1);assert.equal(end.rim,0);
  assert.deepEqual(describeTear(-1),start);assert.deepEqual(describeTear(2),end);
});
test('beginning and ending a tear cannot abruptly spawn or remove its edge',()=>{
  const epsilon=.0001,start=describeTear(epsilon),end=describeTear(1-epsilon);
  assert.ok(start.open<.000001&&start.rim<.000001);
  assert.ok(1-end.open<.000001&&end.rim<.000001);
  for(let i=1;i<1000;i++){
    const before=describeTear((i-1)/1000),after=describeTear(i/1000);
    assert.ok(after.open>=before.open);
    assert.ok(after.open-before.open<.002);
    assert.ok(Math.abs(after.rim-before.rim)<.004);
  }
});
test('an idle camera holds the partially torn frame and reverse input retraces it',()=>{
  const c=new CameraTravel();c.seek(.75);settle(c);
  const frame=()=>describeTear(describeJourney(c.position).transition),before=frame();
  for(let i=0;i<600;i++)c.update(1/60);
  assert.deepEqual(frame(),before);
  c.push(155);settle(c);assert.ok(frame().open>before.open);
  c.push(-155);settle(c);
  assert.ok(Math.abs(frame().open-before.open)<.00001);
  assert.ok(Math.abs(frame().rim-before.rim)<.00001);
});

test('small gestures move and scale readable text before a scene changes',()=>{
  const before=describeTypography(.08),after=describeTypography(.085);
  assert.equal(before.scene,after.scene);
  assert.equal(before.opacity,1);assert.equal(after.opacity,1);
  assert.ok(after.y<before.y);assert.ok(after.scale>before.scale);
  assert.ok(after.captionProgress>before.captionProgress);
});
test('typography holds when the camera settles and retraces the same gesture path',()=>{
  const camera=new CameraTravel(),points=[.08,.173,.35,.57,.67,.72,.77,.86,.98,1.01,4.92,5.8];
  const forward=[];
  for(const position of points){camera.seek(position);settle(camera);forward.push(describeTypography(camera.position));}
  for(let i=points.length-1;i>=0;i--){
    camera.seek(points[i]);settle(camera);
    const held=describeTypography(camera.position);
    assert.deepEqual(held,forward[i]);
    for(let frame=0;frame<120;frame++)camera.update(1/60);
    assert.deepEqual(describeTypography(camera.position),held);
  }
});
test('readable text geometry remains continuous across caption and world landing boundaries',()=>{
  for(let scene=0;scene<6;scene++){
    const boundaries=[scene+.52/3,scene+2*.52/3,scene+.52];
    if(scene>0)boundaries.push(scene);
    for(const position of boundaries){
      const before=describeTypography(position-.00001),after=describeTypography(position+.00001);
      assert.equal(before.scene,after.scene);
      assert.ok(Math.abs(before.y-after.y)<.005);
      assert.ok(Math.abs(before.scale-after.scale)<.0001);
      assert.ok(Math.abs(before.opacity-after.opacity)<.001);
      assert.ok(Math.abs(before.captionProgress-after.captionProgress)<.001);
    }
  }
});
test('scene identity switches only while outgoing and incoming text are offscreen and inert',()=>{
  for(let scene=0;scene<5;scene++){
    const outgoing=describeTypography(scene+.76-.00001),incoming=describeTypography(scene+.76+.00001);
    assert.equal(outgoing.scene,scene);assert.equal(incoming.scene,scene+1);
    assert.equal(outgoing.opacity,0);assert.equal(incoming.opacity,0);
    assert.ok(outgoing.y<-75);assert.ok(incoming.y>75);
    assert.equal(outgoing.interactive,false);assert.equal(incoming.interactive,false);
    const landed=describeTypography(scene+1);
    assert.equal(landed.opacity,1);assert.equal(landed.interactive,true);
  }
});
test('the last world keeps its title and entry usable at the end of the rail',()=>{
  const camera=new CameraTravel();camera.push(100000);settle(camera);
  const final=describeTypography(camera.position);
  assert.equal(final.scene,5);assert.equal(final.opacity,1);assert.equal(final.interactive,true);
  assert.equal(final.captionProgress,2);
  assert.ok(Number.isFinite(final.y)&&Number.isFinite(final.scale));
  assert.deepEqual(final,describeTypography(6));
  const before=describeTypography(5.99);
  assert.equal(before.y,final.y);assert.equal(before.scale,final.scale);
});
test('reduced motion keeps typography stationary and retains the correct story identity',()=>{
  for(const position of [0,.17,.35,.7,.765,.95,1.2,4.76,5.9,6]){
    const type=describeTypography(position,6,true);
    assert.equal(type.scene,describeJourney(position).visibleScene);
    assert.equal(type.y,0);assert.equal(type.scale,1);assert.equal(type.opacity,1);
    assert.equal(type.interactive,true);
    assert.ok(Number.isInteger(type.captionProgress)&&type.captionProgress>=0&&type.captionProgress<=2);
  }
});
