/* Six cinematic roleplay worlds. Camera travel responds continuously to input;
   ambient lighting, drifting particles and parallax run on a separate clock. */
class TheatreScene {
  constructor(root,ready,reveal,onTravel){
    this.root=root;this.onTravel=onTravel;this.travel=new CameraTravel(PISCO_SCENES.length);this.mode='home';this.root.style.touchAction='none';
    this.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;this.canvas=document.createElement('canvas');root.append(this.canvas);
    this.gl=this.canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'high-performance'});
    this.pointer=[0,0];this.mouse=[0,0];this.hover=0;this.targetHover=0;this.stage=0;this.transition=1;this.last=performance.now();this.clock=0;this.frames=0;this.sources={};
    if(this.gl){try{this.setup()}catch(e){console.warn('Using the cinematic fallback',e.message);this.gl=null;this.canvas.remove()}}
    Promise.all(PISCO_SCENES.map((s,i)=>this.load(i,s.src))).then(()=>{
      this.current=this.destination=this.scene(0);this.root.style.backgroundImage=`url("${PISCO_SCENES[0].src}")`;
      this.motion=typeof SceneMotion==='function'?new SceneMotion(this):null;
      document.body.dataset.sceneEngine=this.gl?'webgl':'css';this.root.classList.add('ready');ready();reveal();this.resize();requestAnimationFrame(t=>this.tick(t));
    }).catch(e=>{document.body.dataset.engineError=String(e.message||e);throw e});
    addEventListener('resize',()=>this.resize());
    addEventListener('pointermove',e=>{this.pointer=[e.clientX/innerWidth-.5,e.clientY/innerHeight-.5]},{passive:true});
    this.valleyScene={toggleAutoScroll:enabled=>{this.reduced=!enabled}};
  }
  load(index,src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{
    let texture;if(this.gl){const g=this.gl;texture=g.createTexture();g.bindTexture(g.TEXTURE_2D,texture);g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,img)}
    this.sources[index]={texture,img};resolve()};img.onerror=()=>reject(Error('A story image could not load.'));img.src=src})}
  scene(index){const source=this.sources[index];return {name:PISCO_SCENES[index].id,index,rect:[0,0,1,1],ratio:source.img.width/source.img.height,focus:PISCO_SCENES[index].focus,...source}}
  set(next){if(!this.current||next.index===this.destination.index)return;this.current=this.destination;this.destination=next;this.transition=0;}
  setHome(index){this.mode='presentation';this.stage=index;if(this.current)this.set(this.scene(index))}
  seekHome(position){this.mode='home';this.travel.seek(position)}
  resumeHome(){this.mode='home'}
  move(pixels){this.mode='home';const finished=pixels>0&&this.travel.position>this.travel.max-.02&&this.travel.target===this.travel.max;this.travel.push(pixels);return finished}
  homeFrame(){
    const f=describeJourney(this.travel.position,PISCO_SCENES.length);
    return {...f,a:this.scene(f.from),b:this.scene(f.to),m:f.transition,da:f.depthA,db:f.depthB,tear:describeTear(f.transition)};
  }
  setStory(index,beat=0){if(this.mode==='home'&&this.current){const f=this.homeFrame();this.current=this.destination=this.scene(f.visibleScene);this.transition=1}this.mode='story';this.stage=beat;if(this.current)this.set(this.scene(index));}
  startHoverTransition(){this.targetHover=1}stopHoverTransition(){this.targetHover=0}
  resize(){const d=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.round(innerWidth*d);this.canvas.height=Math.round(innerHeight*d);if(this.gl)this.gl.viewport(0,0,this.canvas.width,this.canvas.height)}
  setup(){const g=this.gl;
    const vertex='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
    const fragment=`precision highp float;
      varying vec2 uv;uniform sampler2D a,b;uniform vec4 ar,br;uniform vec2 res,mouse;uniform float aa,ba,af,bf,time,blend,hover,motion,stage,depthA,depthB,cameraZ,journey;uniform vec3 tear;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      float fog(vec2 p){return noise(p)*.55+noise(p*2.03)*.28+noise(p*4.09)*.17;}
      vec2 pictureUV(vec2 coord,float aspect,float focus,float distance,float advance){
        float screen=res.x/res.y;vec2 q=coord-.5;
        if(screen>aspect)q.y*=aspect/screen;else q.x*=screen/aspect;
        // Each video stays a rigid photograph. Only its plane approaches the
        // viewer; fragments at the tear have their own, nearer projection.
        q/=1.025+distance*.012+advance;
        q.x+=focus*(1.-min(screen/aspect,1.));
        q+=mouse*vec2(.009,.005)+vec2(sin(time*.21),cos(time*.17))*.0015*motion;
        return clamp(q+.5,.002,.998);
      }
      vec3 pictureAt(sampler2D tex,vec4 rect,float aspect,float focus,float distance,vec2 coord,float advance){
        return texture2D(tex,rect.xy+pictureUV(coord,aspect,focus,distance,advance)*rect.zw).rgb;
      }
      float lightness(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
      float contour(sampler2D tex,vec4 rect,float aspect,float focus,float distance,vec2 coord,float advance){
        vec2 q=pictureUV(coord,aspect,focus,distance,advance),px=vec2(1.2)/res;
        float lx=lightness(texture2D(tex,rect.xy+(q+vec2(px.x,0.))*rect.zw).rgb)-lightness(texture2D(tex,rect.xy+(q-vec2(px.x,0.))*rect.zw).rgb);
        float ly=lightness(texture2D(tex,rect.xy+(q+vec2(0.,px.y))*rect.zw).rgb)-lightness(texture2D(tex,rect.xy+(q-vec2(0.,px.y))*rect.zw).rgb);
        return clamp(length(vec2(lx,ly))*7.,0.,1.);
      }
      // Fracture is a fixed field in the image, not a timed noise animation.
      // Coarse folds and fine fibers make an irregular tear, never a frame.
      float fracture(vec2 coord,float radius){
        vec2 p=(coord-vec2(.505,.515))*vec2(res.x/res.y,1.);
        vec2 seed=vec2(stage*7.13+2.4,stage*3.79+9.3);
        float angle=atan(p.y,p.x);
        float folds=(noise(p*4.1+seed)-.5)*.20+(noise(p*13.7+seed)-.5)*.080;
        float fibers=(noise(p*63.1+seed)-.5)*.020+(noise(p*179.3+seed)-.5)*.007;
        float lobes=sin(angle*5.+.4)*.025+sin(angle*9.-.8)*.012;
        return length(p*vec2(.96,1.))+folds+fibers+lobes-radius;
      }
      void main(){
        float m=smoothstep(0.,1.,blend);
        vec3 current=pictureAt(a,ar,aa,af,depthA,uv,0.);
        vec3 incoming=pictureAt(b,br,ba,bf,depthB,uv,0.);
        vec3 c=mix(current,incoming,m);
        if(journey>.5){
          // The original picture tears open. No separate architecture appears.
          // Both surfaces remain fully opaque; the incoming video is behind the
          // expanding opening instead of superimposed on the outgoing face.
          float advance=tear.y*.38;
          current=pictureAt(a,ar,aa,af,depthA,uv,advance);
          float radius=mix(-.24,length(vec2(res.x/res.y,1.))*.55+.28,tear.x);
          float distance=fracture(uv,radius);
          float aaWidth=1.25/res.y;
          float intact=smoothstep(-aaWidth,aaWidth,distance);
          c=mix(incoming,current,intact);
          // Near the fracture, real edges in the photograph survive as fine
          // contours while its solid surface breaks into image-colored fibers.
          float rim=tear.z;
          float worn=(1.-smoothstep(.006,.060,distance))*intact*rim;
          float edge=contour(a,ar,aa,af,depthA,uv,advance);
          vec3 ink=mix(current,vec3(.96,.93,.86),.67);
          c=mix(c,incoming*.55+current*.09+ink*edge*1.35,worn*.94);
          // Several scales of tiny fibers follow the ragged boundary, rather
          // than tracing a smooth glowing ring. Their position is reversible.
          vec2 cells=uv*res/2.25,cell=floor(cells),within=fract(cells)-.5;
          float dots=1.-smoothstep(.12,.46,length(within));
          float fiberNoise=noise(uv*res/6.5+vec2(stage*2.,3.));
          float fiberBand=exp(-abs(distance)*110.);
          float broken=step(.28,hash(cell+17.))*dots;
          c+=mix(current,vec3(1.,.96,.88),.7)*fiberBand*(.08+broken*1.40)*rim*(.35+fiberNoise*.9);
          // The same source pixels lift toward the viewer at a nearer depth.
          // The split plane moves less, so flecks visibly separate and pass us.
          vec2 lifted=.5+(uv-.5)/(1.+tear.y*.28);
          float liftedDistance=fracture(lifted,radius);
          vec2 dustGrid=lifted*res/2.7,dustCell=floor(dustGrid),dustUV=(dustCell+.5)*2.7/res;
          float dustDot=1.-smoothstep(.07,.43,length(fract(dustGrid)-.5));
          vec3 dustColor=pictureAt(a,ar,aa,af,depthA,dustUV,advance);
          float dustEdge=contour(a,ar,aa,af,depthA,dustUV,advance);
          float dustBand=(1.-smoothstep(.015,.11,abs(liftedDistance)))*rim;
          float grains=step(.62-dustEdge*.22,hash(dustCell+8.3))*dustDot;
          c+=mix(dustColor,vec3(.96,.93,.86),.50)*grains*dustBand*(.45+dustEdge*1.10);
        }
        float luminance=dot(c,vec3(.21,.72,.07));
        c+=c*pow(luminance,2.)*(.12+.08*sin(time*1.7))*motion;
        float mist=fog(uv*vec2(4.,6.)+vec2(time*.012,-time*.008));
        c+=vec3(.34,.23,.13)*max(0.,mist-.48)*(.22+.25*hover)*motion;
        for(int i=0;i<48;i++){
          float fi=float(i);vec2 seed=vec2(fi,fi*2.1);
          float z=mod(hash(seed+9.)*80.+160.-cameraZ-time*.035,80.)+.7;
          vec2 world=(vec2(hash(seed),hash(seed+4.))-.5)*vec2(24.,13.);
          world+=vec2(sin(time*.23+fi)*.15,cos(time*.17+fi)*.13);
          vec2 pos=.5+world/(z*1.4)/vec2(res.x/res.y,1.);
          vec2 d=(uv-pos)*vec2(res.x/res.y,1.);float radius=(.035+hash(seed+5.)*.04)/z;
          float glow=exp(-dot(d,d)/(radius*radius*2.));
          c+=vec3(.72,.49,.24)*glow*(.14+.23*sin(fi+time*.6)*sin(fi+time*.6))*motion;
        }
        float edge=pow(length((uv-.5)*vec2(.93,1.12)),1.7);c*=1.-edge*.7;
        float centerShade=exp(-dot((uv-vec2(.5,.51))*vec2(1.5,2.5),(uv-vec2(.5,.51))*vec2(1.5,2.5))*1.8);
        c*=1.-.20*centerShade;c*=1.-hover*.10;
        c+=(hash(gl_FragCoord.xy+mod(time*29.,100.))-.5)*.018;
        gl_FragColor=vec4(c,1.);
      }`;
    const compile=(type,src)=>{const s=g.createShader(type);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(s));return s};
    this.program=g.createProgram();g.attachShader(this.program,compile(g.VERTEX_SHADER,vertex));g.attachShader(this.program,compile(g.FRAGMENT_SHADER,fragment));g.linkProgram(this.program);if(!g.getProgramParameter(this.program,g.LINK_STATUS))throw Error(g.getProgramInfoLog(this.program));g.useProgram(this.program);
    const buffer=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),g.STATIC_DRAW);const p=g.getAttribLocation(this.program,'p');g.enableVertexAttribArray(p);g.vertexAttribPointer(p,2,g.FLOAT,false,0,0);
    this.u={};for(const name of ['a','b','ar','br','aa','ba','af','bf','res','mouse','time','blend','hover','motion','stage','depthA','depthB','cameraZ','journey','tear'])this.u[name]=g.getUniformLocation(this.program,name);
  }
  tick(now){const dt=Math.min((now-this.last)/1000,.05);this.last=now;if(!document.hidden){
    this.clock+=dt;this.transition=Math.min(1,this.transition+dt*.85);this.hover+=(this.targetHover-this.hover)*dt*3;
    if(this.mode==='home'){this.travel.update(dt);this.onTravel?.(this.travel.position)}
    this.mouse=this.mouse.map((v,i)=>v+(this.pointer[i]-v)*dt*2);
    const f=this.mode==='home'?this.homeFrame():{a:this.current,b:this.destination,m:this.transition,da:0,db:this.mode==='story'?this.stage*.35:0};
    this.motion?.update([f.a.index,f.b.index],this.reduced);
    if(this.gl&&this.current){const g=this.gl,u=this.u;g.useProgram(this.program);
      [f.a,f.b].forEach((s,i)=>{g.activeTexture(g.TEXTURE0+i);g.bindTexture(g.TEXTURE_2D,s.texture);g.uniform1i(u[i?'b':'a'],i);g.uniform4fv(u[i?'br':'ar'],s.rect);g.uniform1f(u[i?'ba':'aa'],s.ratio);g.uniform1f(u[i?'bf':'af'],s.focus)});
      g.uniform2f(u.res,this.canvas.width,this.canvas.height);g.uniform2fv(u.mouse,this.mouse);g.uniform1f(u.time,this.reduced?0:this.clock);g.uniform1f(u.blend,f.m);g.uniform1f(u.depthA,f.da);g.uniform1f(u.depthB,f.db);g.uniform1f(u.cameraZ,this.travel.position*22);g.uniform1f(u.journey,this.mode==='home'?1:0);const tearing=f.tear||describeTear(f.m);g.uniform3f(u.tear,tearing.open,tearing.lift,tearing.rim);g.uniform1f(u.hover,this.hover);g.uniform1f(u.motion,this.reduced?0:1);g.uniform1f(u.stage,this.mode==='home'?f.a.index:this.stage);g.drawArrays(g.TRIANGLES,0,6);
    }else if(this.current){const s=this.mode==='home'?this.scene(f.visibleScene):(f.m>.5?f.b:f.a);this.root.style.backgroundImage=`url("${s.img.src}")`;this.root.style.backgroundPosition=`${50+s.focus*50}% center`;const drift=this.reduced?0:Math.sin(this.clock*.2)*.003;this.root.style.transform=`scale(${1+(s.index===f.a.index?f.da:f.db)*.008+drift})`;}
    if(++this.frames%6===0){document.body.dataset.ambientFrame=String(this.frames);document.body.dataset.cameraPosition=(this.travel.position*22).toFixed(3);document.body.dataset.cameraTarget=(this.travel.target*22).toFixed(3);document.body.dataset.cameraMode=this.mode;document.body.dataset.scene=this.mode==='home'?PISCO_SCENES[f.visibleScene].id:(f.m>.5?f.b:f.a).name}
  }requestAnimationFrame(t=>this.tick(t));}
}
// A quiet original three-beat music box. Audio is created only after a visitor opts in.
const theatreAudio={isInitialized:true,isMuted:true,audioContext:null,volume:null,timer:null,beat:0,
  initAudio(){},
  toggleMute(){this.isMuted=!this.isMuted;if(!this.audioContext){const C=window.AudioContext||window.webkitAudioContext;this.audioContext=new C();this.volume=this.audioContext.createGain();this.volume.gain.value=0;this.volume.connect(this.audioContext.destination);this.schedule();this.timer=setInterval(()=>this.schedule(),500)}
    this.audioContext.resume();this.volume.gain.setTargetAtTime(this.isMuted?0:.18,this.audioContext.currentTime,.7);return this.isMuted},
  schedule(){if(!this.audioContext||this.isMuted)return;const ctx=this.audioContext,now=ctx.currentTime,notes=[220,329.63,261.63,196,293.66,246.94,174.61,261.63,220,196,293.66,246.94],f=notes[this.beat++%notes.length];[1,2,3].forEach((harmonic,i)=>{const o=ctx.createOscillator(),v=ctx.createGain();o.type='sine';o.frequency.value=f*harmonic;v.gain.setValueAtTime(0,now);v.gain.linearRampToValueAtTime(.16/(i+1),now+.03);v.gain.exponentialRampToValueAtTime(.0001,now+2.6);o.connect(v);v.connect(this.volume);o.start(now);o.stop(now+2.7)})}
};
