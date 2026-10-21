
(function(){
const firebaseConfig={
  apiKey:"AIzaSyDaQfbs38e-DamGophAUpre2bDe2IMbkJc",
  authDomain:"nayeem-wabsite.firebaseapp.com",
  databaseURL:"https://nayeem-wabsite-default-rtdb.firebaseio.com",
  projectId:"nayeem-wabsite",
  storageBucket:"nayeem-wabsite.appspot.com",
  messagingSenderId:"295428770923",
  appId:"1:295428770923:web:d4cb3c946450731378352e",
  measurementId:"G-7TEJ7M6GWV"
};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>/^(https?:\/\/|data:image\/)/i.test(String(u||'').trim())?String(u).trim().replace(/'/g,'%27').replace(/"/g,'%22'):'';
const grads=['linear-gradient(135deg,#0b1020,#3b1d6e)','linear-gradient(135deg,#0c5a3a,#12a064)','linear-gradient(135deg,#1b1442,#5b3fd1)','linear-gradient(135deg,#2c3a2a,#8a6b3a)'];
const bg=(img,i)=>img?`background:#222 url('${img}') center/cover no-repeat`:`background:${grads[i%grads.length]}`;
const list=v=>v?Object.entries(v).map(([id,o])=>({id,...o})):[];
const short=(t,n)=>{t=String(t||'');return t.length>n?t.slice(0,n).trim()+'…':t};

function renderProjects(v){
  const box=document.querySelector('#projects .grid');const items=list(v);
  if(!box||!items.length)return;store.projects=items;
  box.innerHTML=items.map((p,i)=>{
    const img=safeUrl(p.image),link=safeUrl(p.link)||'#';
    const tags=(Array.isArray(p.tags)?p.tags:[]).map(t=>`<span>${esc(t)}</span>`).join('');
    return `<a class="card" href="#project/${encodeURIComponent(p.id)}"><div class="thumb" style="${bg(img,i)}">${img?'':esc(p.title)}</div><div class="in"><h4>${esc(p.title)}</h4><small>${esc(short(p.description,60))}</small><span class="go">→</span><div class="tags">${tags}</div></div></a>`;
  }).join('');
}
function renderBlog(v){
  const box=document.querySelector('#blog .grid');
  const items=list(v).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  if(!box||!items.length)return;store.blog=items;
  box.innerHTML=items.map((p,i)=>{
    const img=safeUrl(p.image),link=safeUrl(p.link)||'#';
    const d=p.date&&!isNaN(new Date(p.date))?new Date(p.date).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'2-digit'}):'';
    const rt=p.readTime?` · ${esc(p.readTime)} min read`:'';
    return `<a class="card" href="#blog/${encodeURIComponent(p.id)}"><div class="thumb" style="${bg(img,i+3)}"></div><div class="in"><small>${esc(d)}${rt}</small><h4>${esc(p.title)}</h4><p>${esc(short(p.description,100))}</p><span class="go">→</span></div></a>`;
  }).join('');
}
let gal=[],gi=0;
function renderGallery(v){
  const box=document.querySelector('#gallery .gal');
  gal=list(v).filter(g=>safeUrl(g.image));
  if(!box||!gal.length)return;
  box.innerHTML=gal.map((g,i)=>`<div class="${[0,3,4].includes(i%8)?'tall':''}" role="button" tabindex="0" aria-label="${esc(g.title||'Gallery image')}" data-i="${i}" style="${bg(safeUrl(g.image),i)}"></div>`).join('');
}
const lb=document.createElement('div');
lb.className='lb';lb.hidden=true;
lb.innerHTML='<button class="lbx" aria-label="Close">✕</button><button class="lbp" aria-label="Previous">‹</button><img alt=""><button class="lbn" aria-label="Next">›</button>';
document.body.appendChild(lb);
const lbImg=lb.querySelector('img');
function show(i){gi=(i+gal.length)%gal.length;lbImg.src=safeUrl(gal[gi].image);lbImg.alt=gal[gi].title||'';lb.hidden=false}
lb.querySelector('.lbx').onclick=()=>lb.hidden=true;
lb.querySelector('.lbp').onclick=e=>{e.stopPropagation();show(gi-1)};
lb.querySelector('.lbn').onclick=e=>{e.stopPropagation();show(gi+1)};
lb.onclick=e=>{if(e.target===lb)lb.hidden=true};
addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')lb.hidden=true;if(e.key==='ArrowLeft')show(gi-1);if(e.key==='ArrowRight')show(gi+1)});
const galBox=document.querySelector('#gallery .gal');
if(galBox){
  galBox.addEventListener('click',e=>{const t=e.target.closest('[data-i]');if(t)show(+t.dataset.i)});
  galBox.addEventListener('keydown',e=>{const t=e.target.closest('[data-i]');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();show(+t.dataset.i)}});
}
const stars=r=>{r=Math.max(0,Math.min(5,Math.round(Number(r)||0)));return '\u2605'.repeat(r)+'\u2606'.repeat(5-r)};
const Q=s=>document.querySelector(s);
const store={projects:[],apps:[],blog:[]};

/* Fast first paint: render the most recent public data saved by this browser,
   then refresh it from Firebase in the background. */
const PUBLIC_CACHE_KEY='nayeemplayz_public_data_v1';
function readPublicCache(){
  try{
    const raw=localStorage.getItem(PUBLIC_CACHE_KEY);
    if(!raw)return null;
    const data=JSON.parse(raw);
    return data&&typeof data==='object'?data:null;
  }catch(e){return null}
}
function writePublicCache(key,value){
  try{
    const data=readPublicCache()||{};
    data[key]=value||{};
    data.updatedAt=Date.now();
    localStorage.setItem(PUBLIC_CACHE_KEY,JSON.stringify(data));
  }catch(e){/* Storage may be unavailable or full; Firebase remains the source of truth. */}
}
function renderCachedPublicData(){
  const cached=readPublicCache();
  if(!cached)return;
  if(cached.projects)renderProjects(cached.projects);
  if(cached.apps)renderApps(cached.apps);
  if(cached.blog)renderBlog(cached.blog);
  if(cached.gallery)renderGallery(cached.gallery);
}
function renderApps(v){
  const box=Q('#apps-grid'),items=list(v).reverse();
  if(!box||!items.length)return;store.apps=items;
  box.innerHTML=items.map((a,i)=>{const img=safeUrl(a.image);
    return `<a class="card" href="#app/${encodeURIComponent(a.id)}"><div class="thumb" style="${img?`background:#222 url('${img}') center/cover no-repeat`:`background:${grads[i%grads.length]}`}">${img?'':esc(a.title)}${a.badge?`<span class="badge">${esc(a.badge)}</span>`:''}</div><div class="in"><h4>${esc(a.title)}</h4><p class="desc">${esc(short(a.description,90))}</p><div class="meta"><span class="stars" title="${esc(a.rating)} stars">${stars(a.rating)}</span><span class="btn s">Details</span></div></div></a>`}).join('');
}
const SEC={project:'projects',blog:'blog',app:'apps'};
const dEl=Q('#detail');let wasDetail=false,lastY=0;
const back=(h,t)=>`<a class="back" href="${h}">\u2190 ${t}</a>`;
const act=(l,t)=>l?`<div class="dact"><a class="btn p" href="${esc(l)}" target="_blank" rel="noopener noreferrer">${t}</a></div>`:'';
function detailHTML(type,id){
  const it=store[SEC[type]].find(x=>x.id===id);
  if(!it)return back('#'+SEC[type],'Back')+'<p class="dbody">Loading\u2026</p>';
  const img=safeUrl(it.image),title=esc(it.title),body=`<div class="dbody">${it.content||esc(it.description) || ''}</div>`;
  if(type==='project'){
    const tags=(Array.isArray(it.tags)?it.tags:[]).map(t=>`<span>${esc(t)}</span>`).join('');
    return back('#projects','All projects')+`<div class="dimg" style="${bg(img,0)}">${img?'':title}</div><div class="tags" style="margin:0 0 12px">${tags}</div><h1>${title}</h1>${body}${act(safeUrl(it.link),'View Project \u2197')}`;
  }
  if(type==='blog'){
    const d=it.date&&!isNaN(new Date(it.date))?new Date(it.date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):'';
    return back('#blog','All posts')+`<div class="dimg" style="${bg(img,3)}"></div><div class="dmeta">${d?`<span>${esc(d)}</span>`:''}${it.readTime?`<span>${esc(it.readTime)} min read</span>`:''}</div><h1>${title}</h1>${body}${act(safeUrl(it.link),'Read more online \u2197')}`;
  }
  const sh=(Array.isArray(it.screenshots)?it.screenshots:[]).map(safeUrl).filter(Boolean);
  return back('#apps','All apps')+`<div class="dhead"><div class="dicon" style="${bg(img,1)}"></div><div><h1 style="margin:0">${title}</h1><div class="stars">${stars(it.rating)}${it.rating?' ('+esc(Number(it.rating).toFixed(1))+')':''}</div></div></div>${body}${sh.length?`<div class="shots">${sh.map(s=>`<img src="${esc(s)}" alt="${title} screenshot" loading="lazy">`).join('')}</div>`:''}${act(safeUrl(it.link),'Download')}`;
}
function route(){
  const m=location.hash.match(/^#(project|blog|app)\/(.+)$/),b=document.body;
  if(m){
    if(!wasDetail)lastY=scrollY;
    let id=m[2];try{id=decodeURIComponent(id)}catch(e){}
    dEl.innerHTML=detailHTML(m[1],id)+`<div class="cms-share"><button type="button" id="shareCurrent">Share this post</button><button type="button" id="copyCurrent">Copy link</button></div>`;const item=(store[SEC[m[1]]]||[]).find(x=>x.id===id);if(item){document.title=(item.title||'Post')+' | Nayeem Hossen';let md=document.querySelector('meta[name=description]');if(!md){md=document.createElement('meta');md.name='description';document.head.appendChild(md)}md.content=String(item.description||item.title||'').slice(0,155);const canon=document.querySelector('link[rel=canonical]')||document.head.appendChild(Object.assign(document.createElement('link'),{rel:'canonical'}));canon.href=location.href;}setTimeout(()=>{const sb=document.getElementById('shareCurrent'),cb=document.getElementById('copyCurrent');if(sb)sb.onclick=async()=>{try{if(navigator.share)await navigator.share({title:document.title,text:(item&&item.description)||'',url:location.href});else{await navigator.clipboard.writeText(location.href);alert('Link copied')}}catch(e){}};if(cb)cb.onclick=async()=>{try{await navigator.clipboard.writeText(location.href);cb.textContent='Copied!'}catch(e){prompt('Copy this link',location.href)}}},0);
    b.classList.add('on-detail');b.dataset.sec=SEC[m[1]];
    if(!wasDetail)scrollTo({top:0,behavior:'instant'});
    wasDetail=true;
  }else{
    b.classList.remove('on-detail');b.dataset.sec='';
    if(wasDetail){const t=location.hash&&document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView();else scrollTo({top:lastY,behavior:'instant'})}
    wasDetail=false;
  }
  dispatchEvent(new Event('scroll'));
}
addEventListener('hashchange',route);
const L1='Shimeji AI pet app. Chat, play and keep a tiny AI buddy on your phone screen.\n\nThis is sample text. Your real details come from the database.';
renderProjects({p1:{title:'Nimo Buddy',description:L1,link:'',tags:['Android','AI']},p2:{title:'Dark Playz',description:'Gaming and utility app.\n\nSample text.',link:'',tags:['Android','Tools']},p3:{title:'Portfolio Website',description:'My personal website.\n\nSample text.',link:'',tags:['Web','Design']}});
renderApps({a2:{title:'Dark Playz',description:'Gaming and utility app.\n\nSample text.',rating:4,link:''},a1:{title:'Nimo Buddy',description:L1,rating:5,link:''}});
renderBlog({b1:{title:'How I Built My First Android App',date:'2025-10-12',readTime:5,description:'My journey, challenges and what I learned while building my first real Android application.\n\nSample text.'},b2:{title:'Web Development Roadmap for Beginners',date:'2025-10-08',readTime:4,description:'A simple roadmap to start your web development journey in 2025.\n\nSample text.'},b3:{title:'Tips for Better Content Creation',date:'2025-10-01',readTime:3,description:'How I plan, shoot and edit my content for social media and YouTube.\n\nSample text.'}});
// Replace sample fallback cards immediately when this browser has cached real posts.
renderCachedPublicData();
route();
const SDK=[['https://www.gstatic.com/firebasejs/9.6.0/','https://cdn.jsdelivr.net/npm/firebase@9.6.0/']];
const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('blocked: '+src));document.head.appendChild(s)});
async function loadSDK(){
  const files=['firebase-app-compat.js','firebase-auth-compat.js','firebase-database-compat.js'];
  let lastError=null;
  for(const base of SDK[0]){
    try{
      await load(base+files[0]);
      await Promise.all([load(base+files[1]),load(base+files[2])]);
      if(typeof firebase!=='undefined')return;
    }catch(e){lastError=e;console.warn('Firebase SDK source failed:',e.message)}
  }
  throw new Error('Firebase SDK did not load. '+(lastError&&lastError.message||'Check network access.'));
}

let cmsDb=null,cmsAuth=null,cmsQuill=null,cmsEditorReady=false,cmsCache={};
const cms$=id=>document.getElementById(id);
const cmsTypes={gallery:'Photo post',blog:'Blog post',projects:'Project post',apps:'App post'};
function cmsStatus(id,msg,error=false){const el=cms$(id);if(el){el.textContent=msg;el.style.color=error?'#ff9aab':'#c6f58b'}}
function cmsOpen(){cms$('cmsOverlay').classList.add('open');cms$('cmsOverlay').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(cmsAuth&&cmsAuth.currentUser)cmsShowWorkspace()}
function cmsClose(){cms$('cmsOverlay').classList.remove('open');cms$('cmsOverlay').setAttribute('aria-hidden','true');document.body.style.overflow=''}
function cmsShowWorkspace(){cms$('cmsLogin').hidden=true;cms$('cmsWorkspace').hidden=false;cms$('cmsSignOut').hidden=false;cmsLoadItems();cmsInitEditor()}
function cmsShowLogin(){cms$('cmsLogin').hidden=false;cms$('cmsWorkspace').hidden=true;cms$('cmsSignOut').hidden=true}
function cmsSlug(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g,'').trim().replace(/[\s-]+/g,'-').slice(0,90)||('post-'+Date.now())}
function cmsLoadItems(){if(!cmsDb)return;const type=cms$('cmsType').value;cms$('cmsItems').innerHTML='<p class="cms-help">Loading…</p>';cmsDb.ref(type).once('value').then(s=>{cmsCache[type]=s.val()||{};const arr=Object.entries(cmsCache[type]);cms$('cmsItems').innerHTML=arr.length?arr.reverse().map(([id,v])=>`<div class="cms-list-item"><span>${esc(v.title||id)}</span><div class="cms-row" style="flex:0 0 auto"><button type="button" data-cms-edit="${esc(id)}">Edit</button><button type="button" class="del" data-cms-del="${esc(id)}">Delete</button></div></div>`).join(''):'<p class="cms-help">No posts yet.</p>'}).catch(e=>cmsStatus('cmsStatus','Cannot load posts: '+e.message,true))}
function cmsInitEditor(){if(cmsEditorReady)return;const css=document.createElement('link');css.rel='stylesheet';css.href='https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.snow.css';document.head.appendChild(css);const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js';sc.onload=()=>{cmsQuill=new Quill('#cmsEditor',{theme:'snow',modules:{toolbar:[[{header:[1,2,3,false]}],['bold','italic','underline','strike'],[{list:'ordered'},{list:'bullet'}],['link','image','video'],[{color:[]},{background:[]}],['clean']]}});cmsEditorReady=true};sc.onerror=()=>cmsStatus('cmsStatus','Editor library could not load. Check internet connection.',true);document.head.appendChild(sc)}
function cmsReset(){cms$('cmsPostForm').reset();cms$('cmsId').value='';cms$('cmsFormTitle').textContent='Create post';cmsStatus('cmsStatus','');if(cmsQuill)cmsQuill.setContents([]);cmsExtraFields()}
function cmsExtraFields(v={}){const type=cms$('cmsType').value;let html='';if(type==='blog')html='<label class="cms-label">Publish date</label><input class="cms-field" id="cmsDate" type="date" value="'+esc(v.date||new Date().toISOString().slice(0,10))+'"><label class="cms-label">Read time (minutes)</label><input class="cms-field" id="cmsReadTime" type="number" min="1" value="'+esc(v.readTime||4)+'">';if(type==='apps')html='<label class="cms-label">Rating (0–5)</label><input class="cms-field" id="cmsRating" type="number" min="0" max="5" step="0.5" value="'+esc(v.rating??5)+'"><label class="cms-label">Badge</label><input class="cms-field" id="cmsBadge" value="'+esc(v.badge||'')+'"><label class="cms-label">Screenshots URLs (one per line)</label><textarea class="cms-field" id="cmsScreenshots" rows="3">'+esc((v.screenshots||[]).join('\n'))+'</textarea>';if(type==='projects')html='<label class="cms-label">Tags (comma-separated)</label><input class="cms-field" id="cmsTags" value="'+esc((v.tags||[]).join(', '))+'" placeholder="Web, Design">';cms$('cmsExtra').innerHTML=html}
function cmsEdit(id){const type=cms$('cmsType').value,v=(cmsCache[type]||{})[id];if(!v)return;cms$('cmsId').value=id;cms$('cmsTitle').value=v.title||'';cms$('cmsSlug').value=v.slug||cmsSlug(v.title||id);cms$('cmsImage').value=v.image||'';cms$('cmsLink').value=v.link||'';cmsExtraFields(v);cmsInitEditor();const wait=()=>{if(cmsQuill)cmsQuill.clipboard.dangerouslyPasteHTML(v.content||v.description||'');else setTimeout(wait,150)};wait();cms$('cmsFormTitle').textContent='Edit: '+(v.title||id);cmsStatus('cmsStatus','Editing existing post.')}
async function cmsUploadImage(){const f=cms$('cmsImageFile').files[0];if(!f)return cms$('cmsImage').value.trim();if(!f.type.startsWith('image/'))throw Error('Please select an image file.');if(f.size>32*1024*1024)throw Error('ImageBB supports images up to 32 MB.');const fd=new FormData();fd.append('image',f);const res=await fetch('https://api.imgbb.com/1/upload?key=ab6b0d97ccda6322ac10de06a9617aab',{method:'POST',body:fd});const j=await res.json();if(!res.ok||!j.success)throw Error(j.error?.message||'ImageBB upload failed');return j.data.url}
async function cmsSave(e){e.preventDefault();if(!cmsAuth||!cmsAuth.currentUser)return cmsStatus('cmsStatus','Please log in first.',true);if(!cmsQuill)return cmsStatus('cmsStatus','Editor is still loading. Try again.',true);const type=cms$('cmsType').value,title=cms$('cmsTitle').value.trim();if(!title)return;const id=cms$('cmsId').value||cmsDb.ref(type).push().key;cmsStatus('cmsStatus','Saving…');try{const image=await cmsUploadImage();const content=cmsQuill.root.innerHTML;const plain=cmsQuill.getText().trim();const post={title,slug:cmsSlug(cms$('cmsSlug').value||title),image:image||'',content,description:plain,link:cms$('cmsLink').value.trim(),updatedAt:new Date().toISOString()};if(type==='blog'){post.date=cms$('cmsDate')?.value||new Date().toISOString().slice(0,10);post.readTime=Number(cms$('cmsReadTime')?.value||4)}if(type==='projects')post.tags=(cms$('cmsTags')?.value||'').split(',').map(x=>x.trim()).filter(Boolean);if(type==='apps'){post.rating=Number(cms$('cmsRating')?.value||5);post.badge=cms$('cmsBadge')?.value||'';post.screenshots=(cms$('cmsScreenshots')?.value||'').split('\n').map(x=>x.trim()).filter(x=>/^https?:\/\//i.test(x))}if(type==='gallery')post.alt=title;await cmsDb.ref(type+'/'+id).set(post);cmsStatus('cmsStatus','Saved successfully.');cmsReset();cmsLoadItems()}catch(err){cmsStatus('cmsStatus','Save failed: '+err.message,true)}}
function cmsBind(){cms$('openCms').addEventListener('click',cmsOpen);cms$('closeCms').addEventListener('click',cmsClose);cms$('cmsOverlay').addEventListener('click',e=>{if(e.target===cms$('cmsOverlay'))cmsClose()});cms$('cmsType').addEventListener('change',()=>{cmsReset();cmsLoadItems()});cms$('cmsNew').addEventListener('click',cmsReset);cms$('cmsPostForm').addEventListener('submit',cmsSave);cms$('cmsItems').addEventListener('click',async e=>{const edit=e.target.closest('[data-cms-edit]'),del=e.target.closest('[data-cms-del]');if(edit)cmsEdit(edit.dataset.cmsEdit);if(del&&confirm('Permanently delete this post?')){try{await cmsDb.ref(cms$('cmsType').value+'/'+del.dataset.cmsDel).remove();cmsLoadItems();cmsStatus('cmsStatus','Post deleted.')}catch(err){cmsStatus('cmsStatus','Delete failed: '+err.message,true)}}});cms$('cmsLoginForm').addEventListener('submit',async e=>{e.preventDefault();cmsStatus('cmsLoginStatus','Signing in…');try{await cmsAuth.signInWithEmailAndPassword(cms$('cmsEmail').value.trim(),cms$('cmsPassword').value);cmsStatus('cmsLoginStatus','');cmsShowWorkspace()}catch(err){cmsStatus('cmsLoginStatus','Login failed: '+err.message,true)}});cms$('cmsSignOut').addEventListener('click',()=>cmsAuth.signOut());document.addEventListener('keydown',e=>{if(e.key==='Escape')cmsClose()})}
function start(){
  if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);
  cmsAuth=firebase.auth();cmsDb=firebase.database();cmsBind();cmsAuth.onAuthStateChanged(user=>{if(user){cmsShowWorkspace()}else cmsShowLogin()});

  const db=firebase.database();
  const err=n=>e=>console.warn('Firebase "'+n+'" could not be read (check Realtime Database rules):',e&&e.message);

  // Load only the collection needed by this page. The homepage still loads all
  // collections, while dedicated pages avoid waiting for unrelated data.
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const isHome=path===''||path==='index.html';
  const need={
    projects:isHome||path==='projects.html'||/^#project\//.test(location.hash),
    blog:isHome||path==='blog.html'||/^#blog\//.test(location.hash),
    gallery:isHome||path==='gallery.html',
    apps:isHome||path==='apps.html'||/^#app\//.test(location.hash)
  };

  if(need.projects)db.ref('projects').on('value',s=>{const v=s.val()||{};writePublicCache('projects',v);renderProjects(v);route()},err('projects'));
  if(need.blog)db.ref('blog').on('value',s=>{const v=s.val()||{};writePublicCache('blog',v);renderBlog(v);route()},err('blog'));
  if(need.gallery)db.ref('gallery').on('value',s=>{const v=s.val()||{};writePublicCache('gallery',v);renderGallery(v)},err('gallery'));
  if(need.apps)db.ref('apps').on('value',s=>{const v=s.val()||{};writePublicCache('apps',v);renderApps(v);route()},err('apps'));
}
(typeof firebase!=='undefined'?Promise.resolve():loadSDK()).then(start).catch(e=>console.warn(e.message));
})();
