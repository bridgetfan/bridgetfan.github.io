'use strict';

// One changing light connects the story; its short trail never becomes a road.
const lightScenes = {
  chengdu:    {x:470, y:139, color:[166,223,239], kind:'star', caption:'A spark, carried forward.'},
  australia:  {x:410, y:267, color:[158,226,231], kind:'city', caption:'A new city. A wider horizon.'},
  work:       {x:422, y:341, color:[183,224,215], kind:'window', caption:'A different perspective, taking shape.'},
  married:    {x:375, y:379, color:[255,208,151], kind:'home', caption:'A light shared.'},
  aiden:      {x:355, y:302, color:[255,216,171], kind:'nursery', caption:'A new little light.'},
  reset:      {x:608, y:450, color:[189,222,224], kind:'screen', caption:'A screen after dark. A new direction.'},
  internship: {x:659, y:408, color:[136,231,224], kind:'window', caption:'From learning to practice.'},
  engineering:{x:690, y:344, color:[153,242,209], kind:'identity', caption:'Identity becomes connection.'},
  next:       {x:654, y:278, color:[126,228,237], kind:'signal', caption:'Connections become capability.'},
  now:        {x:580, y:288, color:[174,242,212], kind:'platform', caption:'A practice that keeps growing.'}
};

function sceneLightMarkup(id) {
  const s=lightScenes[id];
  const {x,y}=s;
  let shape='';
  if(s.kind==='star') shape=`<path class="beacon-shape" d="M${x} ${y-18}q2 16 18 18-16 2-18 18-2-16-18-18 16-2 18-18Z"/>`;
  if(['city','window'].includes(s.kind)) shape=`<rect class="beacon-window" x="${x-12}" y="${y-21}" width="24" height="42" rx="2"/><path class="beacon-lines" d="M${x} ${y-20}v40m-11-20h22"/>`;
  if(s.kind==='home') shape=`<rect class="beacon-window" x="${x-32}" y="${y-39}" width="64" height="78" rx="1"/><path class="beacon-lines" d="M${x} ${y-39}v78m-32-39h64"/>`;
  if(s.kind==='nursery') shape=`<path class="beacon-window" d="M${x-62} ${y+56}v-73a62 62 0 0 1 124 0v73Z"/><path class="beacon-lines" d="M${x} ${y-73}v129m-62-56h124"/>`;
  if(s.kind==='screen') shape=`<path class="beacon-screen" d="M${x-69} ${y-29}h134l5 52H${x-74}Z"/><g class="beacon-code"><path d="M${x-50} ${y-13}h48m-48 13h80m-80 13h60"/></g>`;
  if(['identity','signal','platform'].includes(s.kind)) shape=`<circle class="beacon-orbit" cx="${x}" cy="${y}" r="23"/><circle class="beacon-orbit second-orbit" cx="${x}" cy="${y}" r="39"/><path class="beacon-lines" d="M${x-38} ${y}h-28m104 0h28m-66-38v-22m0 98v22"/>`;
  const detail=id==='engineering'?'vault':id;
  const label='Explore '+s.caption.replace(/\.$/,'').toLowerCase();
  return `<g class="scene-beacon hotspot" style="--beacon-rgb:${s.color.join(',')}" role="button" tabindex="0" data-detail="${detail}" aria-label="${label}"><title>${s.caption}</title><defs><radialGradient id="beacon-glow-${id}"><stop stop-color="rgb(${s.color.join(',')})" stop-opacity=".45"/><stop offset=".3" stop-color="rgb(${s.color.join(',')})" stop-opacity=".16"/><stop offset="1" stop-color="rgb(${s.color.join(',')})" stop-opacity="0"/></radialGradient></defs><circle class="beacon-aura" cx="${x}" cy="${y}" r="72" fill="url(#beacon-glow-${id})"/>${shape}<circle class="beacon-dot" data-light-anchor cx="${x}" cy="${y}" r="3.4"/></g>`;
}

function createStoryLight(journey, chapters) {
  const ns='http://www.w3.org/2000/svg';
  const layer=document.createElementNS(ns,'svg');
  layer.setAttribute('class','story-light-layer');
  layer.setAttribute('aria-hidden','true');
  layer.setAttribute('focusable','false');
  layer.innerHTML=`<defs><radialGradient id="story-light-halo"><stop stop-color="white" stop-opacity=".85"/><stop offset=".12" stop-color="rgb(var(--signal-rgb))" stop-opacity=".65"/><stop offset=".4" stop-color="rgb(var(--signal-rgb))" stop-opacity=".15"/><stop offset="1" stop-color="rgb(var(--signal-rgb))" stop-opacity="0"/></radialGradient><linearGradient id="story-light-fade" gradientUnits="userSpaceOnUse"><stop stop-color="rgb(var(--signal-rgb))" stop-opacity="0"/><stop offset=".75" stop-color="rgb(var(--signal-rgb))" stop-opacity=".35"/><stop offset="1" stop-color="rgb(var(--signal-rgb))" stop-opacity=".9"/></linearGradient></defs><path class="story-light-soft" fill="none"/><path class="story-light-tail" fill="none" stroke="url(#story-light-fade)"/><g class="story-light-head"><circle r="29" fill="url(#story-light-halo)"/><circle class="story-light-core" r="3" fill="#f5ffff"/></g>`;
  journey.prepend(layer);
  const tail=layer.querySelector('.story-light-tail');
  const soft=layer.querySelector('.story-light-soft');
  const head=layer.querySelector('.story-light-head');
  const fade=layer.querySelector('#story-light-fade');
  const smooth=t=>t*t*(3-2*t);
  let lastWidth=0,lastHeight=0,lastColor='';
  function anchor(chapter,base) {
    const r=chapter.querySelector('[data-light-anchor]').getBoundingClientRect();
    return {x:r.left+r.width/2-base.left,y:r.top+r.height/2-base.top,color:lightScenes[chapter.id].color};
  }
  function point(y,points,corridor) {
    let i=0;
    while(i<points.length-2&&y>points[i+1].y)i++;
    const a=points[i],b=points[i+1];
    const t=Math.max(0,Math.min(1,(y-a.y)/(b.y-a.y||1)));
    let x=corridor;
    if(t<.24)x=a.x+(corridor-a.x)*smooth(t/.24);
    else if(t>.76)x=corridor+(b.x-corridor)*smooth((t-.76)/.24);
    const color=a.color.map((v,n)=>Math.round(v+(b.color[n]-v)*smooth(t)));
    return {x,y,color};
  }
  return {
    update() {
      const base=journey.getBoundingClientRect();
      const width=journey.clientWidth,height=journey.offsetHeight;
      if(width!==lastWidth||height!==lastHeight){layer.setAttribute('viewBox',`0 0 ${width} ${height}`);lastWidth=width;lastHeight=height;}
      const anchors=chapters.map(c=>anchor(c,base));
      const first=anchors[0],last=anchors[anchors.length-1];
      const points=[{x:first.x-35,y:12,color:first.color},...anchors,{x:last.x+35,y:height-20,color:last.color}];
      const y=Math.max(12,Math.min(height-20,innerHeight*.53-base.top));
      const corridor=width-(innerWidth<=760?12:34);
      const p=point(y,points,corridor);
      const start=Math.max(12,y-(innerWidth<=760?115:175));
      const trail=[];
      for(let n=0;n<=24;n++){
        const q=point(start+(y-start)*n/24,points,corridor);
        trail.push(`${n?'L':'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`);
      }
      tail.setAttribute('d',trail.join(' '));soft.setAttribute('d',trail.join(' '));
      fade.setAttribute('x1',point(start,points,corridor).x);fade.setAttribute('y1',start);
      fade.setAttribute('x2',p.x);fade.setAttribute('y2',p.y);
      head.setAttribute('transform',`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      const color=p.color.join(',');
      if(color!==lastColor){layer.style.setProperty('--signal-rgb',color);lastColor=color;}
      layer.classList.toggle('visible',base.top<innerHeight*.72&&base.bottom>innerHeight*.3);
      chapters.forEach((c,i)=>{
        const distance=Math.abs(anchors[i].y-y);
        const level=Math.max(.06,1-distance/(innerHeight*.86));
        c.style.setProperty('--light-level',level.toFixed(3));
        c.style.setProperty('--chapter-light',lightScenes[c.id].color.join(','));
        c.classList.toggle('light-reached',y>=anchors[i].y-45);
      });
    }
  };
}
