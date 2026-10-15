/* graph.js - network model (nodes = reservoirs/junctions/neighborhoods, edges = pipes with capacity and cost) and sample city */
const G={nodes:[],edges:[]},cnt={r:0,n:0,j:0},PRE={r:'R',n:'N',j:'J'};
const eff=()=>G.edges.map(e=>e.down?{...e,cap:0}:e);          // burst pipes carry nothing
function addNode(x,y,type){G.nodes.push({name:PRE[type]+(++cnt[type]),x,y,type});return G.nodes.length-1}
function addPipe(u,v,cap,cost=1){const e=G.edges.find(e=>e.u===u&&e.v===v);if(e)e.cap+=cap;else G.edges.push({u,v,cap,cost})}
function delNode(i){G.nodes.splice(i,1);G.edges=G.edges.filter(e=>e.u!==i&&e.v!==i).map(e=>({...e,u:e.u>i?e.u-1:e.u,v:e.v>i?e.v-1:e.v}))}
function clearGraph(){G.nodes=[];G.edges=[];cnt.r=cnt.n=cnt.j=0}
function loadSample(){clearGraph();
 [['r',70,150],['r',70,380],['j',270,90],['j',270,260],['j',270,430],['j',480,170],['j',480,350],['n',720,90],['n',720,260],['n',720,440]].forEach(a=>addNode(a[1],a[2],a[0]));
 const id=s=>G.nodes.findIndex(n=>n.name===s);
 [['R1','J1',20,2],['R1','J2',15,3],['R2','J2',12,2],['R2','J3',18,4],['J1','J4',12,3],['J2','J4',8,1],['J2','J5',10,5],['J3','J5',14,2],
  ['J4','N1',14,2],['J4','N2',10,3],['J5','N2',9,4],['J5','N3',15,1],['J1','N1',6,8]].forEach(p=>addPipe(id(p[0]),id(p[1]),p[2],p[3]))}
