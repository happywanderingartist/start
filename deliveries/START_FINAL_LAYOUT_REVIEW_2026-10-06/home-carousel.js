window.mountHomeCarousel = function () {
'use strict';
const region=document.querySelector('.recommend'),viewport=document.querySelector('.viewport');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const embla=EmblaCarousel(viewport,{loop:true,align:'start',duration:reduce.matches?0:25});
const play=document.querySelector('#play'),dots=[...document.querySelectorAll('[data-slide]')];
let timer=null,manualPause=false,hover=false,focused=false,interacted=false,inView=true;
const canPlay=()=>!manualPause&&!hover&&!focused&&!interacted&&!document.hidden&&!reduce.matches&&inView;
function schedule(){clearTimeout(timer);timer=null;const active=canPlay();region.dataset.rotation=active?'playing':'paused';region.dataset.pauseReasons=[manualPause&&'manual',hover&&'hover',focused&&'focus',interacted&&'interaction',document.hidden&&'background',reduce.matches&&'reduced-motion',!inView&&'outside-view'].filter(Boolean).join(',');const requested=!manualPause&&!interacted&&!reduce.matches;play.textContent=requested?'暂停':'播放';play.setAttribute('aria-label',requested?'暂停自动播放':'播放自动推荐');play.disabled=reduce.matches;document.querySelector('#announcement').setAttribute('aria-live',active?'off':'polite');if(active)timer=setTimeout(()=>{region.dataset.autoAdvances=String(Number(region.dataset.autoAdvances||0)+1);embla.scrollNext();},7000);}
function update(){const i=embla.selectedScrollSnap();dots.forEach((d,n)=>d.setAttribute('aria-current',String(n===i)));document.querySelector('#count').textContent=`0${i+1} / 04`;document.querySelector('#announcement').textContent=embla.slideNodes()[i].getAttribute('aria-label');embla.slideNodes().forEach((s,n)=>{s.inert=n!==i;});schedule();}
function stop(){interacted=true;schedule();}
play.onclick=()=>{if(!manualPause&&!interacted){manualPause=true;}else{manualPause=false;interacted=false;focused=false;hover=false;}schedule();};
document.querySelector('#prev').onclick=()=>{stop();embla.scrollPrev();};
document.querySelector('#next').onclick=()=>{stop();embla.scrollNext();};
dots.forEach(d=>d.onclick=()=>{stop();embla.scrollTo(Number(d.dataset.slide));});
viewport.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stop();embla.scrollTo((embla.selectedScrollSnap()+(e.key==='ArrowRight'?1:3))%4,true);}});
region.addEventListener('mouseenter',()=>{hover=true;schedule();});region.addEventListener('mouseleave',()=>{hover=false;schedule();});
region.addEventListener('focusin',e=>{if(e.target!==play){focused=true;schedule();}});region.addEventListener('focusout',e=>{if(!region.contains(e.relatedTarget)){focused=false;schedule();}});
embla.on('pointerDown',stop).on('select',update).on('reInit',update);
const motionChange=()=>{embla.reInit({duration:reduce.matches?0:25});schedule();};
document.addEventListener('visibilitychange',schedule);reduce.addEventListener('change',motionChange);
const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.4});observer.observe(viewport);
update();

return ()=>{clearTimeout(timer);observer.disconnect();document.removeEventListener("visibilitychange",schedule);reduce.removeEventListener("change",motionChange);embla.destroy();};
};
