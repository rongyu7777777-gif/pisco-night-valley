// Optional real video loops; the image texture is always the immediate fallback.
class SceneMotion {
  constructor(renderer){
    this.renderer=renderer;this.entries=new Map();this.visible=new Set();
    document.addEventListener('visibilitychange',()=>{
      for(const entry of this.entries.values()){
        if(document.hidden){entry.playRequest++;entry.video.pause();}
        entry.attempted=false;
      }
    });
    addEventListener('pointerdown',()=>{
      for(const entry of this.entries.values())if(entry.blocked){entry.blocked=false;entry.attempted=false;}
    },{passive:true});
  }
  create(index){
    const scene=PISCO_SCENES[index];
    if(!scene.video||!this.renderer.gl)return null;
    const video=document.createElement('video');
    video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;
    video.preload='auto';video.hidden=true;video.setAttribute('aria-hidden','true');
    video.dataset.sceneMotion=scene.id;video.dataset.motionState='loading';
    const entry={index,video,dirty:false,uploaded:false,attempted:false,blocked:false,failed:false,lastFrame:-1,playRequest:0};
    this.entries.set(index,entry);this.renderer.root.append(video);
    video.addEventListener('loadeddata',()=>{entry.dirty=true;video.dataset.motionState='ready';});
    video.addEventListener('error',()=>{entry.failed=true;video.dataset.motionState='fallback';this.restore(entry);});
    if(video.requestVideoFrameCallback){
      const decoded=()=>{entry.dirty=true;video.requestVideoFrameCallback(decoded);};
      video.requestVideoFrameCallback(decoded);
    }
    video.src=scene.video;
    return entry;
  }
  restore(entry){
    if(!entry.uploaded)return;
    const {gl,sources}=this.renderer,source=sources[entry.index];
    gl.bindTexture(gl.TEXTURE_2D,source.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source.img);
    entry.uploaded=false;entry.dirty=true;
  }
  update(indices,reduced=false){
    if(!this.renderer.gl)return;
    this.visible=new Set(indices);
    if(!reduced&&!document.hidden)for(const index of this.visible){
      if(!this.entries.has(index))this.create(index);
    }
    for(const entry of this.entries.values()){
      const {video}=entry;
      if(reduced||document.hidden||!this.visible.has(entry.index)||entry.failed){
        if(entry.attempted)entry.playRequest++;
        if(!video.paused)video.pause();entry.attempted=false;
        if(reduced||entry.failed)this.restore(entry);
        if(!entry.failed)video.dataset.motionState=reduced?'reduced':'paused';
        continue;
      }
      if(!entry.attempted&&!entry.blocked){
        entry.attempted=true;
        const request=++entry.playRequest;
        video.play().then(()=>{
          if(request===entry.playRequest)video.dataset.motionState=video.paused?'paused':'playing';
        }).catch(error=>{
          // Scroll/visibility may pause a video before play() has finished.
          // An interrupted or superseded request is not an autoplay denial.
          if(request!==entry.playRequest)return;
          if(error?.name==='AbortError'){
            entry.attempted=false;video.dataset.motionState=video.paused?'paused':'ready';return;
          }
          entry.blocked=true;video.dataset.motionState='fallback';this.restore(entry);
        });
      }
      if(entry.blocked||video.readyState<2)continue;
      const frame=video.getVideoPlaybackQuality?.().totalVideoFrames??video.currentTime;
      const changed=video.requestVideoFrameCallback?entry.dirty:frame!==entry.lastFrame;
      if(!changed)continue;
      const {gl,sources}=this.renderer;
      try{
        gl.bindTexture(gl.TEXTURE_2D,sources[entry.index].texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);
        entry.uploaded=true;entry.dirty=false;entry.lastFrame=frame;
      }catch{
        entry.failed=true;video.pause();video.dataset.motionState='fallback';this.restore(entry);
      }
    }
  }
}
