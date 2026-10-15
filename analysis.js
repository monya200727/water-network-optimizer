/* analysis.js - unique features: (1) failure / vulnerability analysis, (2) benchmark of Ford-Fulkerson vs Edmonds-Karp vs Dinic */
const nmA=i=>G.nodes[i].name;
const deliv=(r,E)=>G.nodes.map((n,i)=>n.type==='n'?E.reduce((s,e,k)=>s+(e.v===i?r.flows[k]:0)-(e.u===i?r.flows[k]:0),0):0);
function vulnerability(){const E=eff(),base=maxFlow(G.nodes,E,'ek',false),bd=deliv(base,E),rows=[];
 if(base.value===0){$('vuln').innerHTML='<p class="note">Build a working network first: the flow must be above zero.</p>';return}
 const test=(label,edges,pipe)=>{const r=maxFlow(G.nodes,edges,'ek',false),d=deliv(r,edges);let w=-1,wl=0;
  d.forEach((v,i)=>{if(G.nodes[i].type==='n'&&bd[i]-v>wl){wl=bd[i]-v;w=i}});rows.push({label,pipe,after:r.value,loss:base.value-r.value,worst:w>=0?`${nmA(w)} (-${wl})`:'none'})};
 E.forEach((e,i)=>{if(!G.edges[i].down)test(`Pipe ${nmA(e.u)} → ${nmA(e.v)} bursts`,E.map((x,k)=>k===i?{...x,cap:0}:x),i)});
 G.nodes.forEach((n,k)=>{if(n.type!=='n')test(`${n.type==='r'?'Reservoir':'Junction'} ${n.name} offline`,E.map(x=>x.u===k||x.v===k?{...x,cap:0}:x),-1)});
 const pipes=rows.filter(r=>r.pipe>=0),score=pipes.length?Math.round(100*pipes.reduce((s,r)=>s+r.after/base.value,0)/pipes.length):100,safe=pipes.filter(r=>r.loss===0).length;
 rows.sort((a,b)=>b.loss-a.loss);const top=rows[0];
 $('vuln').innerHTML=`<p><b>Resilience score: ${score}%</b> (${score>=90?'very resilient':score>=70?'moderately resilient':'fragile'}). This is the average share of the ${base.value} units still delivered when any one pipe bursts.</p>
 <p>Most critical element: <b>${top.label}</b>, which cuts delivery by ${top.loss} units (${Math.round(100*top.loss/base.value)}%). ${safe} of ${pipes.length} pipes can fail with no loss at all, because the network has backup routes.</p>
 <div class="tw"><table><tr><th>Failure</th><th>Flow after</th><th>Water lost</th><th>Hardest hit</th><th></th></tr>${rows.slice(0,8).map(r=>`<tr><td>${r.label}</td><td>${r.after}</td><td>${r.loss}</td><td>${r.worst}</td><td>${r.pipe>=0?`<button onclick="burst(${r.pipe})">Simulate</button>`:''}</td></tr>`).join('')}</table></div>`}
function burst(i){G.edges[i].down=true;stopPlay();view.res=null;if(compute())view.idx=view.res.steps.length;refresh();vulnerability()}
/* ---- benchmark on random networks ---- */
function randNet(V,seed){let s=seed;const rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const nodes=[],edges=[],ord=[0,1],seen=new Set();for(let i=0;i<V;i++)nodes.push({name:'v'+i,type:i<2?'r':i<5?'n':'j'});
 for(let i=5;i<V;i++)ord.push(i);ord.push(2,3,4);
 for(let k=0;k<4*V;k++){const a=Math.floor(rnd()*(ord.length-1)),b=a+1+Math.floor(rnd()*Math.min(12,ord.length-1-a)),u=ord[a],v=ord[b];
  if(!seen.has(u*V+v)){seen.add(u*V+v);edges.push({u,v,cap:1+Math.floor(rnd()*100),cost:1+Math.floor(rnd()*9)})}}
 return{nodes,edges}}
const timeIt=fn=>{const t=performance.now();let r;for(let i=0;i<3;i++)r=fn();return[(performance.now()-t)/3,r]};
const BS=[10,25,50,100,200,400],bout=[];
function bench(){const b=$('benchbtn');b.disabled=true;bout.length=0;let k=0;
 const next=()=>{if(k>=BS.length){b.disabled=false;return}const V=BS[k++],{nodes,edges}=randNet(V,V*7+1),
  [tf,rf]=timeIt(()=>maxFlow(nodes,edges,'ff',false)),[te,re]=timeIt(()=>maxFlow(nodes,edges,'ek',false)),[td,rd]=timeIt(()=>dinic(nodes,edges));
  bout.push({V,E:edges.length,flow:re.value,ok:rf.value===re.value&&rd.value===re.value,af:rf.count,ae:re.count,ph:rd.phases,tf,te,td});drawBench();setTimeout(next,20)};
 setTimeout(next,20)}
function drawBench(){const f2=v=>v<10?v.toFixed(2):v<100?v.toFixed(1):Math.round(v);
 $('bt').innerHTML='<tr><th>Nodes</th><th>Pipes</th><th>Max flow</th><th>All agree</th><th>FF paths</th><th>EK paths</th><th>Dinic phases</th><th>FF ms</th><th>EK ms</th><th>Dinic ms</th></tr>'+
  bout.map(r=>`<tr><td>${r.V}</td><td>${r.E}</td><td>${r.flow}</td><td>${r.ok?'✓':'✗'}</td><td>${r.af}</td><td>${r.ae}</td><td>${r.ph}</td><td>${f2(r.tf)}</td><td>${f2(r.te)}</td><td>${f2(r.td)}</td></tr>`).join('');
 const c=$('bc'),d=window.devicePixelRatio||1,w=900,h=300;if(c.width!==w*d){c.width=w*d;c.height=h*d}
 const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);if(!bout.length)return;
 const L=56,Rr=20,Tp=30,B=h-34,mx=Math.max(...bout.map(r=>Math.max(r.tf,r.te,r.td)),.01),X=i=>L+i*(w-L-Rr)/Math.max(1,BS.length-1),Y=v=>B-v/mx*(B-Tp);
 x.font='12px Figtree,sans-serif';x.textAlign='center';x.fillStyle=css('--mut');x.strokeStyle=css('--line');x.lineWidth=1;
 for(let k=0;k<=4;k++){const y=Y(mx*k/4);x.beginPath();x.moveTo(L,y);x.lineTo(w-Rr,y);x.stroke();x.textAlign='right';x.fillText(f2(mx*k/4),L-6,y+4)}
 x.textAlign='center';BS.forEach((v,i)=>x.fillText(v+' nodes',X(i),h-12));
 [['Ford-Fulkerson (DFS)','tf','#f2a900'],['Edmonds-Karp (BFS)','te',css('--acc')],['Dinic','td',css('--ok')]].forEach(([nm,key,col],j)=>{
  x.strokeStyle=col;x.fillStyle=col;x.lineWidth=2.5;x.beginPath();bout.forEach((r,i)=>i?x.lineTo(X(i),Y(r[key])):x.moveTo(X(i),Y(r[key])));x.stroke();
  bout.forEach((r,i)=>{x.beginPath();x.arc(X(i),Y(r[key]),3.5,0,7);x.fill()});x.textAlign='left';x.fillRect(L+j*190,10,10,10);x.fillStyle=css('--ink');x.fillText(nm,L+j*190+16,19)});
 x.save();x.translate(14,h/2);x.rotate(-Math.PI/2);x.textAlign='center';x.fillStyle=css('--mut');x.fillText('time (ms)',0,0);x.restore()}
$('vbtn').onclick=vulnerability;$('benchbtn').onclick=bench;
$('repair').onclick=()=>{G.edges.forEach(e=>e.down=false);edited();vulnerability()};
