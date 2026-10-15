/* flow.js - maximum flow, minimum cut, min-cost flow and Dinic.
   algo 'ek' = Edmonds-Karp (BFS shortest path), 'ff' = Ford-Fulkerson (DFS path),
   'mcmf' = min-cost max-flow (cheapest augmenting path, SPFA / Bellman-Ford).
   Multiple sources/sinks: a super-source feeds every reservoir and a super-sink
   drains every neighborhood, both with unlimited capacity. */
const INF=1e9;
function buildNet(nodes,edges){const n=nodes.length,S=n,T=n+1,to=[],cap=[],cost=[],g=Array.from({length:n+2},()=>[]);
 const add=(u,v,c,w)=>{g[u].push(to.length);to.push(v);cap.push(c);cost.push(w);g[v].push(to.length);to.push(u);cap.push(0);cost.push(-w)};
 edges.forEach(e=>add(e.u,e.v,e.cap,e.cost||0));      // arc 2i = pipe i, arc 2i+1 = its residual (back) arc
 nodes.forEach((x,i)=>{if(x.type==='r')add(S,i,INF,0);if(x.type==='n')add(i,T,INF,0)});
 return{n,S,T,to,cap,cost,g}}
function maxFlow(nodes,edges,algo,record=true){
 const{n,S,T,to,cap,cost,g}=buildNet(nodes,edges);
 const bfs=()=>{const pa=new Array(n+2).fill(-1),seen=new Array(n+2).fill(false);seen[S]=true;const q=[S];
  for(let h=0;h<q.length;h++)for(const a of g[q[h]])if(cap[a]>0&&!seen[to[a]]){seen[to[a]]=true;pa[to[a]]=a;if(to[a]===T)return pa;q.push(to[a])}
  return null};
 const dfs=()=>{const pa=new Array(n+2).fill(-1),seen=new Array(n+2).fill(false);
  const go=u=>{if(u===T)return true;seen[u]=true;for(const a of g[u])if(cap[a]>0&&!seen[to[a]]){pa[to[a]]=a;if(go(to[a]))return true}return false};
  return go(S)?pa:null};
 const spfa=()=>{const d=new Array(n+2).fill(Infinity),pa=new Array(n+2).fill(-1),inq=new Array(n+2).fill(false),q=[S];d[S]=0;
  for(let h=0;h<q.length;h++){const u=q[h];inq[u]=false;for(const a of g[u])if(cap[a]>0&&d[u]+cost[a]<d[to[a]]){d[to[a]]=d[u]+cost[a];pa[to[a]]=a;if(!inq[to[a]]){inq[to[a]]=true;q.push(to[a])}}}
  return d[T]<Infinity?pa:null};
 const find=algo==='ff'?dfs:algo==='mcmf'?spfa:bfs,m2=2*edges.length,steps=[],lim=record?20000:2e6;let total=0,count=0;
 for(;;){const pa=find();if(!pa||count>lim)break;
  const arcs=[];let v=T;while(v!==S){const a=pa[v];arcs.push(a);v=to[a^1]}arcs.reverse();
  const delta=Math.min(...arcs.map(a=>cap[a]));                 // bottleneck of this path
  arcs.forEach(a=>{cap[a]-=delta;cap[a^1]+=delta});total+=delta;count++;
  if(record)steps.push({delta,total,arcs:arcs.filter(a=>a<m2).map(a=>({e:a>>1,back:!!(a&1)})),
   path:[S,...arcs.map(a=>to[a])].filter(i=>i<n).map(i=>nodes[i].name),flows:edges.map((_,i)=>cap[2*i+1])})}
 const seen=new Array(n+2).fill(false);seen[S]=true;const q=[S];   // min cut: nodes reachable from S in the residual graph
 for(let h=0;h<q.length;h++)for(const a of g[q[h]])if(cap[a]>0&&!seen[to[a]]){seen[to[a]]=true;q.push(to[a])}
 const flows=edges.map((_,i)=>cap[2*i+1]);
 return{value:total,count,steps,flows,cost:flows.reduce((s,f,i)=>s+f*(edges[i].cost||0),0),reach:seen.slice(0,n),
  cut:edges.map((e,i)=>i).filter(i=>seen[edges[i].u]&&!seen[edges[i].v]&&edges[i].cap>0)};
}
/* Dinic: BFS levels, then a blocking flow per phase. O(V^2 E). */
function dinic(nodes,edges){const{n,S,T,to,cap,g}=buildNet(nodes,edges);let flow=0,phases=0;
 for(;;){const lv=new Array(n+2).fill(-1);lv[S]=0;const q=[S];
  for(let h=0;h<q.length;h++)for(const a of g[q[h]])if(cap[a]>0&&lv[to[a]]<0){lv[to[a]]=lv[q[h]]+1;q.push(to[a])}
  if(lv[T]<0)break;phases++;const it=new Array(n+2).fill(0);
  const go=(u,f)=>{if(u===T)return f;for(;it[u]<g[u].length;it[u]++){const a=g[u][it[u]];
   if(cap[a]>0&&lv[to[a]]===lv[u]+1){const d=go(to[a],Math.min(f,cap[a]));if(d>0){cap[a]-=d;cap[a^1]+=d;return d}}}return 0};
  for(let f;(f=go(S,INF))>0;)flow+=f}
 return{value:flow,phases}}
