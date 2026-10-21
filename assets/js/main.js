
const $=s=>document.querySelector(s);
if($('#menu')) $('#menu').onclick=()=>$('#links')&&$('#links').classList.toggle('open');
document.querySelectorAll('#links a').forEach(a=>a.onclick=()=>$('#links').classList.remove('open'));
if($('#theme')) $('#theme').onclick=()=>{const r=document.documentElement;const dark=r.dataset.theme==='dark'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);r.dataset.theme=dark?'light':'dark';$('#theme').textContent=dark?'☀':'☾'};
if($('#send')) $('#send').onclick=()=>{const m='nayeemhossen816@gmail.com';try{navigator.clipboard.writeText(m)}catch(e){}location.href='mailto:'+m;const t=$('#toast');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)};
const secs=[...document.querySelectorAll('main section')],ls=[...document.querySelectorAll('#links a')];
function spy(){if(!secs.length)return;let c=document.body.dataset.sec||secs[0].id;secs.forEach(s=>{if(scrollY>=s.offsetTop-120)c=s.id});ls.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+c))}
addEventListener('scroll',spy,{passive:true});spy();
