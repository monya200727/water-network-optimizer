/* app.js - controls, animation, progress log and the bottleneck / upgrade report */
const HINTS={move:'Drag a node to move it. Click a pipe to select it and edit its capacity.',r:'Click empty space to add a reservoir (water source), or click a node to turn it into one.',
 n:'Click empty space to add a neighborhood (water demand), or click a node to turn it into one.',j:'Click empty space to add a junction, or click a node to turn it into one.',
 pipe:'Click a node, then a second node, to lay a one-way pipe between them. Capacity and cost come from the boxes above.',del:'Click a node or a pipe to delete it.'};
let tm=null;
function setTool(t){ui.tool=t;ui.pend=-1;document.querySelectorAll('#tools [data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===t));$('hint').textContent=HINTS[t];refresh()}
function edited(){stopPlay();$('vuln').innerHTML='<p class="note">Network changed. Press Analyse failures to update.</p>';view.res=view.alt=null;view.idx=0;ui.sel=-1;ui.pend=-1;refresh()}
function refresh(){draw();const s=ui.sel>=0&&G.edges[ui.sel];$('sel').hidden=!s;if(s){$('selname').textContent=`Pipe ${G.nodes[s.u].name} → ${G.nodes[s.v].name}`;$('selburst').textContent=s.down?'Repair pipe':'Burst pipe'}panels()}
function compute(){if(!G.nodes.some(n=>n.type==='r')||!G.nodes.some(n=>n.type==='n')){$('stats').innerHTML='<p class="note">Add at least one reservoir and one neighborhood, connect them with pipes, then press Run.</p>';return false}
 const a=$('algo').value,E=eff();view.res=maxFlow(G.nodes,E,a);view.k={ek:maxFlow(G.nodes,E,'ek',false),ff:maxFlow(G.nodes,E,'ff',false),mc:maxFlow(G.nodes,E,'mcmf',false)};view.idx=0;return true}
function step(){if(!view.res&&!compute())return false;if(view.idx<view.res.steps.length)view.idx++;refresh();return !isDone()}
function stopPlay(){clearTimeout(tm);tm=null;$('run').textContent='Run'}
function play(){if(tm){stopPlay();return}if(!view.res||isDone()){if(!compute())return}
 $('run').textContent='Pause';const tick=()=>{if(!step()){stopPlay();return}tm=setTimeout(tick,1150-$('spd').value*11)};tm=setTimeout(tick,150)}
function applyUp(i,st){G.edges[i].cap+=st;stopPlay();if(compute())view.idx=view.res.steps.length;refresh()}
function panels(){const r=view.res,E=eff();
 if(!r){$('stats').innerHTML=$('stats').innerHTML.includes('Add at least')?$('stats').innerHTML:'<p class="note">Press Run to watch augmenting paths being found one by one, or Finish for the final answer.</p>';$('log').innerHTML='';$('rep').innerHTML='<p class="note">The report appears when the run finishes.</p>';return}
 const al=$('algo').value,cur=view.idx?r.steps[view.idx-1].total:0,fl=flowsNow(),cost=E.reduce((s,e,k)=>s+fl[k]*(e.cost||0),0);
 $('stats').innerHTML=`<div class="kv"><div><b>${cur}</b><span>flow delivered now</span></div><div><b>${view.idx}/${r.steps.length}</b><span>augmenting paths</span></div><div><b>${cost}</b><span>pumping cost now</span></div></div>`+
  (isDone()?`<p class="note">Edmonds-Karp needs ${view.k.ek.count} augmentations and Ford-Fulkerson (DFS) needs ${view.k.ff.count}. ${al==='mcmf'?'':`Routing the same ${r.value} units at minimum cost would cost ${view.k.mc.cost} instead of ${cost}: choose Min-cost max-flow to see that routing.`}</p>`:'');
 $('log').innerHTML=r.steps.slice(0,view.idx).map(s=>`<li>${s.path.join(' → ')}: <b>+${s.delta}</b> (total ${s.total})${s.arcs.some(a=>a.back)?' · cancels earlier flow':''}</li>`).join('');$('log').scrollTop=1e6;
 if(!isDone()){$('rep').innerHTML='<p class="note">The report appears when the run finishes.</p>';return}
 const f=r.flows,nm=i=>G.nodes[i].name,st=Math.max(1,+$('upstep').value||5),cutCap=r.cut.reduce((s,i)=>s+E[i].cap,0),
  net=i=>E.reduce((s,e,k)=>s+(e.v===i?f[k]:0)-(e.u===i?f[k]:0),0),cs=new Set(r.cut),
  status=i=>cs.has(i)?'Bottleneck':f[i]>=E[i].cap&&E[i].cap>0?'Saturated':f[i]===0?'Unused':'OK';
 const rows=E.map((e,i)=>i).sort((a,b)=>(status(b)==='Bottleneck')-(status(a)==='Bottleneck')||f[b]/(E[b].cap||1)-f[a]/(E[a].cap||1))
  .map(i=>`<tr><td>${nm(E[i].u)} → ${nm(E[i].v)}</td><td>${f[i]}/${E[i].cap}</td><td>${E[i].cap?Math.round(100*f[i]/E[i].cap):0}%</td><td>${status(i)==='Bottleneck'?'<span class="tag">Bottleneck</span>':status(i)}</td></tr>`).join('');
 const ups=E.map((e,i)=>({i,gain:maxFlow(G.nodes,E.map((x,k)=>k===i?{...x,cap:x.cap+st}:x),'ek',false).value-r.value})).filter(u=>u.gain>0&&!G.edges[u.i].down).sort((a,b)=>b.gain-a.gain).slice(0,5);
 $('rep').innerHTML=`<p><b>Maximum flow: ${r.value} units.</b> Minimum cut capacity: ${cutCap} units (equal, as the max-flow min-cut theorem says). Total pumping cost: ${cost}.</p>
 <h3>Delivered to neighborhoods</h3><p>${G.nodes.map((n,i)=>n.type==='n'?`${n.name}: ${net(i)}`:'').filter(Boolean).join(' · ')||'none'}</p>
 <h3>Minimum cut (the bottleneck pipes)</h3><p>${r.cut.length?r.cut.map(i=>`${nm(E[i].u)} → ${nm(E[i].v)} (${E[i].cap})`).join(', '):'No pipes: nothing limits the flow.'}</p>
 <p class="note">These pipes are full and separate the reservoir side (shaded) from the neighborhoods. Upgrading any other pipe cannot raise total delivery.</p>
 <h3>Capacity upgrade suggestions (+${st} units on one pipe)</h3>${ups.length?`<div class="tw"><table><tr><th>Pipe</th><th>New max flow</th><th>Gain</th><th></th></tr>${ups.map(u=>`<tr><td>${nm(E[u.i].u)} → ${nm(E[u.i].v)}</td><td>${r.value+u.gain}</td><td>+${u.gain}</td><td><button onclick="applyUp(${u.i},${st})">Apply</button></td></tr>`).join('')}</table></div>`:
  '<p>No single-pipe upgrade of this size increases the flow. Several parallel bottlenecks may need upgrading together, or try a larger upgrade size.</p>'}
 <h3>All pipes</h3><div class="tw"><table><tr><th>Pipe</th><th>Flow/Cap</th><th>Used</th><th>Status</th></tr>${rows}</table></div>
 <h3>Complexity</h3><p class="note">Edmonds-Karp: O(V·E²) because BFS always takes a shortest augmenting path. Ford-Fulkerson with DFS: O(E·f), which depends on the flow value f. Here V = ${G.nodes.length}, E = ${E.length}. Several reservoirs and neighborhoods are handled by a super-source and super-sink with unlimited capacity.</p>`}
document.querySelectorAll('#tools [data-t]').forEach(b=>b.onclick=()=>setTool(b.dataset.t));
$('run').onclick=play;$('step').onclick=()=>{stopPlay();if(isDone()&&view.res)return;step()};
$('fin').onclick=()=>{stopPlay();if(!view.res&&!compute())return;view.idx=view.res.steps.length;refresh()};
$('reset').onclick=()=>{stopPlay();view.res=view.alt=null;view.idx=0;refresh()};
$('algo').onchange=edited;$('upstep').onchange=refresh;
$('sample').onclick=()=>{loadSample();edited()};$('clear').onclick=()=>{clearGraph();edited()};
$('selapply').onclick=()=>{if(ui.sel>=0){Object.assign(G.edges[ui.sel],{cap:Math.max(0,+$('selcap').value||0),cost:Math.max(0,+$('selcost').value||0)});const s=ui.sel;edited();setSel(s)}};
$('seldel').onclick=()=>{if(ui.sel>=0){G.edges.splice(ui.sel,1);edited()}};
$('selburst').onclick=()=>{if(ui.sel>=0){const e=G.edges[ui.sel],s=ui.sel;e.down=!e.down;edited();setSel(s)}};
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',draw);
loadSample();setTool('move');
