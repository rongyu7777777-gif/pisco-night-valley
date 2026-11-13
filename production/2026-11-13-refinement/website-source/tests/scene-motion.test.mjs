import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/scene-motion.js',import.meta.url),'utf8');
const flush=async()=>{await Promise.resolve();await Promise.resolve();};

function fixture({deferred=false}={}){
  const listeners={},globalListeners={},videos=[],uploads=[];
  const document={hidden:false,addEventListener:(type,fn)=>listeners[type]=fn,
    createElement:()=>{
      const events={};
      const video={dataset:{},paused:true,readyState:2,currentTime:0,playCalls:0,pauseCalls:0,
        setAttribute(){},addEventListener:(type,fn)=>events[type]=fn,
        emit:(type)=>events[type]?.(),
        play(){this.playCalls++;this.paused=false;
          if(deferred)return new Promise((resolve,reject)=>{this.resolvePlay=resolve;this.rejectPlay=reject;});
          return Promise.resolve();
        },
        pause(){this.pauseCalls++;this.paused=true;},
        requestVideoFrameCallback(fn){this.nextFrame=fn;},
      };videos.push(video);return video;
    }};
  const gl={TEXTURE_2D:1,UNPACK_FLIP_Y_WEBGL:2,RGBA:3,UNSIGNED_BYTE:4,
    bindTexture(_target,texture){this.texture=texture;},pixelStorei(){},
    texImage2D(...args){uploads.push({texture:this.texture,source:args.at(-1)});
      if(this.failVideo&&args.at(-1).play)throw Error('Video upload failed');
    }};
  const renderer={gl,root:{append(){}},sources:Object.fromEntries(Array.from({length:6},(_,i)=>[i,{texture:'texture-'+i,img:{poster:i}}]))};
  const SceneMotion=vm.runInNewContext(source+';SceneMotion',{
    document,addEventListener:(type,fn)=>globalListeners[type]=fn,
    PISCO_SCENES:Array.from({length:6},(_,i)=>({id:'world-'+i,video:'world-'+i+'.mp4'})),
  });
  return {motion:new SceneMotion(renderer),renderer,document,listeners,globalListeners,videos,uploads};
}

test('six-scene motion lazily starts only the visible pair and pauses scenes left behind',async()=>{
  const f=fixture();f.motion.update([0,1]);await flush();
  assert.equal(f.videos.length,2);assert.equal(f.videos.filter(v=>!v.paused).length,2);
  f.motion.update([2,3]);await flush();
  assert.equal(f.videos.length,4);assert.equal(f.videos.filter(v=>!v.paused).length,2);
  assert.ok(f.motion.entries.get(0).video.paused&&f.motion.entries.get(1).video.paused);
  f.motion.update([4,5]);await flush();
  assert.equal(f.videos.length,6);assert.equal(f.videos.filter(v=>!v.paused).length,2);
  f.motion.update([5,5]);await flush();
  assert.equal(f.videos.filter(v=>!v.paused).length,1);
  assert.equal(f.motion.entries.get(5).video.dataset.motionState,'playing');
});

test('a background tab pauses every video and resumes only the current pair',async()=>{
  const f=fixture();f.motion.update([0,1]);await flush();
  f.document.hidden=true;f.listeners.visibilitychange();
  assert.ok(f.videos.every(v=>v.paused));
  f.motion.update([2,3]);assert.equal(f.videos.length,2);
  f.document.hidden=false;f.listeners.visibilitychange();f.motion.update([2,3]);await flush();
  assert.equal(f.videos.filter(v=>!v.paused).length,2);
  assert.ok(f.motion.entries.get(0).video.paused&&f.motion.entries.get(1).video.paused);
});

test('reduced motion creates no video and restores a playing scene to its poster',async()=>{
  const f=fixture();f.motion.update([0,1],true);assert.equal(f.videos.length,0);
  f.motion.update([0,1]);await flush();
  f.videos.forEach(v=>v.emit('loadeddata'));f.motion.update([0,1]);
  assert.ok([...f.motion.entries.values()].every(e=>e.uploaded));
  f.motion.update([0,1],true);
  assert.ok(f.videos.every(v=>v.paused&&v.dataset.motionState==='reduced'));
  assert.ok([...f.motion.entries.values()].every(e=>!e.uploaded));
  assert.deepEqual(f.uploads.slice(-2).map(x=>x.source.poster),[0,1]);
});

test('texture uploads happen on decoded frames while narrative position remains idle',async()=>{
  const f=fixture();f.motion.update([0,0]);await flush();
  const video=f.videos[0];video.emit('loadeddata');f.motion.update([0,0]);
  assert.equal(f.uploads.length,1);
  f.motion.update([0,0]);assert.equal(f.uploads.length,1);
  video.nextFrame();f.motion.update([0,0]);assert.equal(f.uploads.length,2);
  assert.equal(f.videos.length,1);
});

test('a failed decoded video upload restores its original poster and stops retrying',async()=>{
  const f=fixture();f.motion.update([0]);await flush();
  f.videos[0].emit('loadeddata');f.motion.update([0]);
  f.renderer.gl.failVideo=true;f.videos[0].nextFrame();f.motion.update([0]);
  const entry=f.motion.entries.get(0);
  assert.equal(entry.failed,true);assert.equal(entry.uploaded,false);
  assert.equal(entry.video.paused,true);assert.equal(entry.video.dataset.motionState,'fallback');
  assert.equal(f.uploads.at(-1).source,f.renderer.sources[0].img);
  const count=f.uploads.length;f.motion.update([0]);assert.equal(f.uploads.length,count);
});

test('autoplay denial preserves the poster and can retry after user interaction',async()=>{
  const f=fixture({deferred:true});f.motion.update([0]);
  const entry=f.motion.entries.get(0);
  entry.video.rejectPlay(Object.assign(Error('Autoplay blocked'),{name:'NotAllowedError'}));await flush();
  assert.equal(entry.blocked,true);assert.equal(entry.video.dataset.motionState,'fallback');
  f.motion.update([0]);assert.equal(entry.video.playCalls,1);
  f.globalListeners.pointerdown();f.motion.update([0]);assert.equal(entry.video.playCalls,2);
});

test('pausing a still-starting video does not permanently block it when scrolling back',async()=>{
  const f=fixture({deferred:true});f.motion.update([0,1]);
  const entry=f.motion.entries.get(0);
  f.motion.update([2,3]);
  entry.video.rejectPlay(Object.assign(Error('play() interrupted by pause()'),{name:'AbortError'}));await flush();
  assert.equal(entry.blocked,false);
  f.motion.update([0,1]);assert.equal(entry.video.playCalls,2);
});

test('a superseded play rejection cannot override the resumed scene playback',async()=>{
  const f=fixture({deferred:true});f.motion.update([0]);
  const entry=f.motion.entries.get(0),rejectPrevious=entry.video.rejectPlay;
  f.motion.update([1]);f.motion.update([0]);
  entry.video.resolvePlay();await flush();
  assert.equal(entry.video.dataset.motionState,'playing');
  rejectPrevious(Object.assign(Error('interrupted'),{name:'AbortError'}));await flush();
  assert.equal(entry.blocked,false);assert.equal(entry.attempted,true);
  assert.equal(entry.video.dataset.motionState,'playing');
  f.motion.update([0]);assert.equal(entry.video.playCalls,2);
});
