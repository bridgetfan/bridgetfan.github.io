'use strict';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fineHover = matchMedia('(hover: hover)');
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const journey = document.querySelector('#journey');
const yearNav = document.querySelector('#year-nav');
const dialog = document.querySelector('#detail-dialog');
const panels = {
  vault: {label:'SPECIALIST PRACTICE · HASHICORP VAULT', title:'Secrets and identity, built into the platform.', body:'<p>I work across Vault authentication, secrets engines and application integration. The focus is practical: helping workloads access what they need through patterns that teams can adopt and operate.</p><dl><div><dt>Workload authentication</dt><dd>AWS auth · Kubernetes auth · AppRole</dd></div><div><dt>Secrets engines</dt><dd>KV v1 / v2 · Dynamic database credentials for MSSQL, Oracle and PostgreSQL · PKI · SSH</dd></div><div><dt>Application integration</dt><dd>Vault Agent · CI/CD integrations · Workload onboarding patterns</dd></div><div><dt>Platform engineering</dt><dd>Terraform modules · AWS and EKS integrations · Migration and delivery automation</dd></div></dl><h3>In practice</h3><p>My work has included secrets-management integrations at Macquarie Group and application onboarding and secrets migration at Wipro, working with Optus.</p><div class="detail-cert">HashiCorp Certified: Vault Associate</div>'},
  cloud: {label:'CLOUD PLATFORMS', title:'Connect workloads to secure platform services.', body:'<p>I work with AWS and Kubernetes to integrate authentication and secrets consumption into the environments applications depend on.</p><div class="detail-tags"><span>AWS</span><span>EKS</span><span>Lambda</span><span>Vault Agent</span></div><dl><div><dt>Cloud integration</dt><dd>Workload authentication, secrets consumption and supporting AWS integrations.</dd></div><div><dt>Kubernetes</dt><dd>EKS workloads, Kubernetes authentication and Vault Agent integration patterns.</dd></div><div><dt>Supporting services</dt><dd>Lambda automation, including Go-based integration work.</dd></div></dl><div class="detail-cert">AWS Certified Solutions Architect – Associate<br>AWS Certified Cloud Practitioner</div>'},
  infra: {label:'INFRASTRUCTURE AS CODE', title:'Make the configuration repeatable.', body:'<p>I use Terraform modules and versioned configuration to support repeatable cloud and secrets-management changes.</p><div class="detail-tags"><span>Terraform</span><span>GitLab CI</span><span>Bamboo</span></div><dl><div><dt>Reusable foundations</dt><dd>Terraform modules for shared platform integrations and configuration.</dd></div><div><dt>Delivery workflows</dt><dd>CI/CD pipelines, reviewed changes and environment-aware delivery.</dd></div></dl><p>The aim is to make established patterns easier to reuse, review and maintain as application teams onboard.</p>'},
  automation: {label:'ENGINEERING AUTOMATION', title:'Turn recurring work into reusable workflows.', body:'<p>I use Python and Go to automate platform tasks and build integrations around cloud and secrets-management services.</p><div class="detail-tags"><span>Python</span><span>Go</span><span>Lambda</span><span>CI/CD</span></div><dl><div><dt>Platform workflows</dt><dd>Onboarding helpers, delivery automation and repeatable integration tasks.</dd></div><div><dt>Cloud automation</dt><dd>Lambda-based services and supporting AWS integrations.</dd></div><div><dt>Continuing development</dt><dd>Deepening platform engineering expertise through secure cloud integration and reusable automation.</dd></div></dl><p>I focus on reducing recurring manual steps while keeping the workflow understandable for the people operating it.</p>'},
  platform_delivery: {label:'DELIVERY & OPERATIONS', title:'Help secure patterns become everyday practice.', body:'<p>A platform capability needs more than implementation. I work with application teams through onboarding, integration testing, migration and production-change coordination.</p><dl><div><dt>Application adoption</dt><dd>Integration guidance, onboarding patterns and testing support.</dd></div><div><dt>Operational context</dt><dd>Splunk, troubleshooting and production-change verification.</dd></div><div><dt>Communication</dt><dd>Clear technical explanations and coordination across engineering and application teams.</dd></div></dl><div class="detail-cert">Additional security credential: Certified Ethical Hacker (CEH)</div>'}
};
const responseText = {
  vault:'Workload identity · Authentication · Short-lived access',
  cloud:'Cloud workloads · Trusted identity · Secure integration',
  automation:'Define the pattern · Automate · Reuse',
  next:'Application onboarding · Integrate · Verify',
  reset:'Daytime with Aiden · Study after dark',
  married:'A shared foundation · Since 2015',
  aiden:'Two became three · Aiden, 2020',
  family:'Bridget · Eric · Aiden',
  learning:'Stay curious · Learn · Build'
};
function person(symbol, name, detail, klass='') {
  return `<button class="cast-person ${klass}" data-detail="${detail}" aria-label="Meet ${name}"><svg viewBox="0 0 150 300" aria-hidden="true"><use href="#${symbol}" width="150" height="300"/></svg></button>`;
}
function cast(c) {
  if (c.cast==='study') return '';
  const professional = ['engineering','next'].includes(c.id);
  const bridget = person(professional?'girl-presenting':'girl','Bridget','bridget',professional?'cast-presenting':'');
  const eric = person('partner','Eric','eric','cast-partner');
  const aiden = person('child','Aiden','aiden','cast-child');
  const baby = person('baby','baby Aiden','aiden','cast-baby');
  if (c.cast==='couple') return eric+bridget;
  if (c.cast==='baby') return eric+baby+bridget;
  if (c.cast==='family') return eric+aiden+bridget;
  return bridget;
}
document.querySelector('#story-chapters').innerHTML = chapterScenes.map(c=>`<section id="${c.id}" class="chapter" aria-labelledby="title-${c.id}" style="--accent:${c.accent}"><div class="chapter-copy"><span class="chapter-date">${c.year}</span><span class="chapter-location">${c.location}</span><h2 id="title-${c.id}">${c.title.split('\n').join('<br> ')}</h2><p>${c.description}</p><div class="chapter-tags">${c.tags.map(t=>`<button data-detail="${c.detail}" aria-haspopup="dialog">${t}</button>`).join('')}</div></div><div class="chapter-visual ${c.cast==='study'?'study-visual':''}"><div class="scene-plate"><svg class="scene-art" viewBox="150 80 800 ${c.cast==='study'?650:570}" role="group" aria-label="${c.location}">${c.svg}</svg></div><div class="scene-response" aria-hidden="true">Hover to explore · Tap for the story</div><div class="scene-cast ${c.cast}">${cast(c)}</div><div class="scene-caption">${c.caption}</div></div></section>`).join('');
yearNav.innerHTML = chapterScenes.map((c,i)=>`<a href="#${c.id}" aria-label="${c.year}: ${c.location}" data-year="${i}">${c.nav}</a>`).join('');
const chapters = [...document.querySelectorAll('.chapter')];
const yearLinks = [...yearNav.children];
let active=-1, renderPending=false, autoEnabled=!reduced.matches, autoComplete=false;
let manualUntil=Date.now()+5500, hovering=false, modalOpen=false, camera=scrollY, velocity=0, lastTime=0;
let lastStatus='', interactionTarget=null, lastOpener=null, endOfStory=0;
function render() {
  renderPending=false;
  const center=innerHeight*.52;
  let closest=0, distance=Infinity;
  chapters.forEach((chapter,i)=>{
    const rect=chapter.getBoundingClientRect();
    const d=Math.abs(rect.top+rect.height/2-center);
    if(d<distance){distance=d;closest=i;}
    const near=rect.bottom>-innerHeight&&rect.top<innerHeight*2;
    chapter.classList.toggle('nearby',near);
    if(near)chapter.style.setProperty('--drift',clamp((rect.top+rect.height/2-center)/innerHeight,-1,1).toFixed(3));
  });
  if(active!==closest){
    active=closest;
    chapters.forEach((c,i)=>c.classList.toggle('is-active',i===active));
    yearLinks.forEach((a,i)=>{a.classList.toggle('active',i===active);if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
    if(innerWidth<=760){const a=yearLinks[active];yearNav.scrollTo({left:Math.max(0,a.offsetLeft-yearNav.clientWidth/2+a.offsetWidth/2),behavior:reduced.matches?'instant':'smooth'});}
  }
  const j=journey.getBoundingClientRect();
  const progress=clamp((innerHeight*.5-j.top)/j.height,0,1);
  document.querySelector('#progress-line').style.transform=`scaleX(${progress})`;
  const expert=document.querySelector('#expertise').getBoundingClientRect();
  document.documentElement.classList.toggle('viewing-expertise',expert.top<160);
  endOfStory=expert.top+scrollY-(innerWidth<=760?68:84);
}
function scheduleRender(){if(!renderPending){renderPending=true;requestAnimationFrame(render);}}
function updateStatus(){
  const state=autoComplete?'Replay story':!autoEnabled?'Your pace':modalOpen?'Reading details':hovering?'Paused to explore':Date.now()<manualUntil?'Your pace':'Auto journey';
  if(state===lastStatus)return;
  lastStatus=state;
  document.querySelector('#auto-label').textContent=state;
  const playing=autoEnabled&&!autoComplete;
  document.querySelector('#auto-toggle').setAttribute('aria-pressed',String(playing));
  document.querySelector('#auto-toggle').setAttribute('aria-label',playing?'Pause automatic journey':'Resume automatic journey');
  const status=document.querySelector('#journey-status');
  status.textContent=state==='Paused to explore'?'EXPLORE THE SCENE · MOVE AWAY TO CONTINUE':'';
  status.classList.toggle('visible',state==='Paused to explore');
}
function tick(time){
  const elapsed=lastTime?Math.min(70,time-lastTime):0;lastTime=time;
  const canMove=autoEnabled&&!autoComplete&&!document.hidden&&!reduced.matches&&!modalOpen;
  const moving=canMove&&!hovering&&Date.now()>=manualUntil;
  const speed=moving?(innerWidth<=760?.040:.052):0;
  velocity+=(speed-velocity)*(1-Math.exp(-elapsed/240));
  if(!canMove||Date.now()<manualUntil)velocity=0;
  if(velocity>.0001&&elapsed){
    camera=Math.max(camera,scrollY);
    camera=Math.min(endOfStory,camera+elapsed*velocity);
    window.scrollTo({top:camera,behavior:'instant'});
    if(camera>=endOfStory-1){autoComplete=true;autoEnabled=false;velocity=0;}
  }else camera=scrollY;
  updateStatus();requestAnimationFrame(tick);
}
function pauseForInput(){manualUntil=Date.now()+8000;velocity=0;camera=scrollY;}
addEventListener('wheel',event=>{if(!modalOpen)pauseForInput();},{passive:true});
addEventListener('touchstart',pauseForInput,{passive:true});
addEventListener('scroll',scheduleRender,{passive:true});
addEventListener('resize',()=>{camera=scrollY;scheduleRender();});
addEventListener('visibilitychange',()=>{lastTime=0;camera=scrollY;});
document.querySelector('#auto-toggle').addEventListener('click',()=>{
  if(reduced.matches)return;
  if(autoComplete){autoComplete=false;window.scrollTo({top:0,behavior:'instant'});camera=0;autoEnabled=true;manualUntil=Date.now()+2200;}
  else {autoEnabled=!autoEnabled;manualUntil=0;}
  velocity=0;updateStatus();
});
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{pauseForInput();clearInteraction();}));
function setInteraction(target){
  if(interactionTarget===target)return;
  clearInteraction();interactionTarget=target;hovering=true;
  target.classList.add('is-engaged');
  const visual=target.closest('.chapter-visual');
  if(visual){visual.classList.add('is-engaged');visual.dataset.engaged=target.dataset.detail;visual.querySelector('.scene-response').textContent=responseText[target.dataset.detail]||target.getAttribute('aria-label')||'Explore the story';}
  updateStatus();
}
function clearInteraction(){
  if(interactionTarget){interactionTarget.classList.remove('is-engaged');const visual=interactionTarget.closest('.chapter-visual');if(visual){visual.classList.remove('is-engaged');delete visual.dataset.engaged;visual.querySelector('.scene-response').textContent='Hover to explore · Tap for the story';}}
  interactionTarget=null;hovering=false;updateStatus();
}
document.addEventListener('pointerover',event=>{if(!fineHover.matches||event.pointerType==='touch'||modalOpen)return;const target=event.target.closest('[data-detail]');if(target)setInteraction(target);});
document.addEventListener('pointerout',event=>{const target=event.target.closest('[data-detail]');if(target&&!target.contains(event.relatedTarget)&&!modalOpen)clearInteraction();});
document.addEventListener('focusin',event=>{if(modalOpen)return;const target=event.target.closest('[data-detail],[data-panel]');if(target){hovering=true;if(target.dataset.detail)setInteraction(target);updateStatus();}});
document.addEventListener('focusout',event=>{if(event.target.closest('[data-detail],[data-panel]')&&!modalOpen)clearInteraction();});
function openDetail(key,opener){
  const detail=panels[key]||storyDetails[key];if(!detail)return;
  clearInteraction();lastOpener=opener;modalOpen=true;velocity=0;
  document.querySelector('#detail-label').textContent=detail.label;
  document.querySelector('#detail-title').textContent=detail.title;
  document.querySelector('#detail-body').innerHTML=detail.body;
  document.body.classList.add('dialog-open');
  dialog.showModal();
  dialog.querySelector('.detail-content').scrollTop=0;
  document.querySelector('#close-detail').focus({preventScroll:true});updateStatus();
}
document.addEventListener('click',event=>{
  const target=event.target.closest('[data-panel],[data-detail]');
  if(target&&!dialog.open)openDetail(target.dataset.panel||target.dataset.detail,target);
});
document.addEventListener('keydown',event=>{
  const target=event.target.closest('[data-detail][role="button"]');
  if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openDetail(target.dataset.detail,target);return;}
  if(!modalOpen&&['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))pauseForInput();
});
document.querySelector('#close-detail').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
dialog.addEventListener('close',()=>{
  if(dialog.open)return;
  document.body.classList.remove('dialog-open');clearInteraction();
  if(lastOpener?.isConnected)lastOpener.focus({preventScroll:true});
  modalOpen=false;hovering=false;manualUntil=Date.now()+3500;camera=scrollY;lastTime=0;updateStatus();
});
reduced.addEventListener('change',()=>{autoEnabled=!reduced.matches;autoComplete=false;velocity=0;manualUntil=Date.now()+4000;updateStatus();});
render();document.fonts?.ready.then(scheduleRender);addEventListener('load',scheduleRender);
if(location.hash){requestAnimationFrame(()=>{const target=document.getElementById(location.hash.slice(1));if(target){target.scrollIntoView({behavior:'instant'});pauseForInput();}});}
updateStatus();requestAnimationFrame(tick);
