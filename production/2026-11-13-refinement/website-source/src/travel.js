// One continuous camera rail. Input is accumulated; small wheel/drag deltas are
// never discarded, and the narrative reads the travelled position, not events.
class CameraTravel {
  constructor(max=6){this.position=0;this.target=0;this.max=max;}
  push(pixels){this.target=Math.max(0,Math.min(this.max,this.target+pixels/1550));}
  seek(position){this.target=Math.max(0,Math.min(this.max,position));}
  update(dt){this.position+=(this.target-this.position)*(1-Math.exp(-8*Math.max(0,Math.min(dt,.1))));if(Math.abs(this.target-this.position)<.00001)this.position=this.target;return this.position;}
}

// A single description drives the camera, visible story and its entry action.
// The image fracture is a position on the rail, never a timed chapter change.
// Its position and envelope have zero slope at both ends, so starting, reversing
// or stopping cannot spawn a rim or leave fragments at a scene boundary.
function describeTear(transition){
  const t=Math.max(0,Math.min(1,transition));
  const ease=t*t*t*(t*(t*6-15)+10);
  const smooth=x=>{const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);};
  const caption=1-smooth((t-.12)/.21)+smooth((t-.67)/.19);
  return {open:ease,lift:ease,rim:16*t*t*(1-t)*(1-t),caption};
}
function describeJourney(position,count=6){
  const p=Math.max(0,Math.min(position,count-.000001));
  const from=Math.min(count-1,Math.floor(p)),local=p-from,to=Math.min(count-1,from+1);
  const transition=from===to?0:Math.max(0,Math.min(1,(local-.52)/.48));
  const crossed=transition>=.50,visibleScene=crossed?to:from;
  return {from,to:transition>0?to:from,local,transition,visibleScene,captionOpacity:describeTear(transition).caption,
    phase:crossed?0:Math.min(2,Math.floor(local/.52*3)),
    depthA:local*10,depthB:transition>0?-5*(1-transition):local*10};
}

// Typography is a place on the same rail as the camera, not a timed animation.
// At the identity crossover both text planes are outside the viewport.
function describeTypography(position,count=6,reduced=false){
  const frame=describeJourney(position,count),age=Math.max(-.24,Math.min(1,position-frame.visibleScene));
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
  const captionProgress=Math.max(0,Math.min(2,age/(.52/3)));
  let y=0,scale=1,opacity=1;
  if(age<0){
    const enter=smooth((age+.24)/.24);
    y=90*(1-enter);scale=.78+.22*enter;opacity=smooth((enter-.08)/.28);
  }else{
    const approach=Math.min(age,.52);
    y=-24*approach;scale=1+.24*approach;
    if(frame.visibleScene<count-1){
      const exit=smooth((age-.52)/.24);
      y-=90*exit;scale+=.36*exit;opacity=1-smooth((exit-.65)/.27);
    }
  }
  if(reduced){y=0;scale=1;opacity=1;}
  return {scene:frame.visibleScene,y,scale,opacity,captionProgress:reduced?Math.round(captionProgress):captionProgress,interactive:opacity>.5&&Math.abs(y)<25};
}
