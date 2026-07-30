/* ============================================================
   AARON — cute-site shared module
   page transition: a thin free-hand line is drawn at the click
   height, the paper closes onto it, and the next page opens
   from the same line.
   ============================================================ */

/* ---------- free-hand line generator ---------- */
function freehandLine(width, jitter){
  const j = jitter || 2.4;
  const pts = [[0, 8]];
  let x = 0;
  while (x < width){
    x += 70 + Math.random()*60;
    pts.push([Math.min(x, width), 8 + (Math.random()*2-1)*j]);
  }
  pts.push([width, 8]);
  let d = 'M' + pts[0][0] + ' ' + pts[0][1];
  for (let i = 1; i < pts.length - 1; i++){
    const mx = (pts[i][0] + pts[i+1][0]) / 2;
    const my = (pts[i][1] + pts[i+1][1]) / 2;
    d += ' Q' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
  }
  d += ' L' + width + ' 8';
  return d;
}

/* ---------- the cut transition ---------- */
(function(){
  const NS = 'http://www.w3.org/2000/svg';

  function makeWipe(frac){
    const y = Math.max(.12, Math.min(.88, frac)) * 100;
    const w = document.createElement('div'); w.id = 'wipe';

    const t = document.createElement('div'); t.className = 'w-top';
    t.style.height = 'calc(' + y + 'vh + 2px)';
    const b = document.createElement('div'); b.className = 'w-bot';
    b.style.top = 'calc(' + y + 'vh - 2px)';
    b.style.height = 'calc(' + (100 - y) + 'vh + 2px)';

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'w-line');
    svg.setAttribute('viewBox', '0 0 ' + innerWidth + ' 16');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.top = 'calc(' + y + 'vh - 8px)';
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', freehandLine(innerWidth));
    svg.appendChild(p);

    w.appendChild(t); w.appendChild(b); w.appendChild(svg);
    document.body.appendChild(w);
    return {w: w, p: p};
  }

  /* ---- entry: page opened through a cut → open the paper ---- */
  const inY = sessionStorage.getItem('cutY');
  if (inY !== null){
    sessionStorage.removeItem('cutY');
    const o = makeWipe(parseFloat(inY));
    o.w.classList.add('covered');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      o.w.classList.add('opening');
      setTimeout(function(){
        o.p.style.transition = 'opacity .45s ease';
        o.p.style.opacity = '0';
      }, 600);
      setTimeout(function(){
        o.w.remove();
        document.body.classList.add('drawn');
      }, 1120);
    });});
  } else {
    setTimeout(function(){ document.body.classList.add('drawn'); }, 80);
  }

  /* ---- exit: draw the line, close the paper, go ---- */
  document.addEventListener('click', function(e){
    const a = e.target.closest('a[data-cut]');
    if (!a) return;
    e.preventDefault();
    const href = a.getAttribute('href');
    const frac = (e.clientY || innerHeight/2) / innerHeight;

    const o = makeWipe(frac);
    const L = o.p.getTotalLength();
    o.p.style.strokeDasharray = L;
    o.p.style.strokeDashoffset = L;
    o.p.getBoundingClientRect(); /* reflow */
    o.p.style.transition = 'stroke-dashoffset .34s cubic-bezier(.4,0,.2,1)';
    o.p.style.strokeDashoffset = 0;
    setTimeout(function(){ o.w.classList.add('closing'); }, 300);
    setTimeout(function(){
      sessionStorage.setItem('cutY', String(frac));
      location.href = href;
    }, 780);
  });
})();

/* ---------- mobile hamburger ---------- */
(function(){
  const header=document.querySelector('header');
  const nav=header && header.querySelector('nav');
  if(!nav) return;
  const b=document.createElement('button');
  b.className='burger'; b.setAttribute('aria-label','menu');
  b.innerHTML='<span></span><span></span>';
  header.appendChild(b);
  b.addEventListener('click',()=>document.body.classList.toggle('nav-open'));
  nav.addEventListener('click',()=>document.body.classList.remove('nav-open'));
})();

/* ---------- ink pen trail (optional) ---------- */
(function(){
  if (matchMedia('(hover:none)').matches) return;
  if (document.body.dataset.trail === 'off') return;
  const c = document.createElement('canvas');
  c.id = 'trail';
  document.body.appendChild(c);
  const x = c.getContext('2d');
  let W,H,pts=[];
  function size(){ W=c.width=innerWidth*devicePixelRatio; H=c.height=innerHeight*devicePixelRatio;
    c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; }
  size(); addEventListener('resize',size);
  addEventListener('mousemove',e=>{
    pts.push({x:e.clientX*devicePixelRatio, y:e.clientY*devicePixelRatio, t:performance.now()});
  });
  (function draw(){
    x.clearRect(0,0,W,H);
    const now=performance.now();
    pts=pts.filter(p=>now-p.t<650);
    if(pts.length>1){
      x.beginPath();
      x.moveTo(pts[0].x,pts[0].y);
      for(let i=1;i<pts.length;i++){
        const p=pts[i], q=pts[i-1];
        x.quadraticCurveTo(q.x,q.y,(p.x+q.x)/2,(p.y+q.y)/2);
      }
      x.lineWidth=1.2*devicePixelRatio;
      x.strokeStyle='rgba(26,26,26,.3)';
      x.lineCap='round'; x.lineJoin='round';
      x.stroke();
    }
    requestAnimationFrame(draw);
  })();
})();

/* ---------- data shared by animals / animal pages ---------- */
window.WORKS = [
  {name:"Bear",    file:"img/bear.jpg"},
  {name:"Dragon",  file:"img/dragon.jpg"},
  {name:"Shrimp",  file:"img/shrimp.jpg"},
  {name:"Turtle",  file:"img/kame.jpg"},
  {name:"Deer",    file:"img/deer.jpg"},
  {name:"Whale",   file:"img/whale.jpg"},
  {name:"Rabbit",  file:"img/rabit.jpg"},
  {name:"Tiger",   file:"img/tiger.jpg"},
  {name:"Bird",    file:"img/bird.jpg"},
  {name:"Carp",    file:"img/corp.jpg"},
  {name:"Cow",     file:"img/cow.jpg"},
  {name:"Penguin", file:"img/penguin.jpg"},
];
