/* editor.js - visual graph editor: add/move/delete nodes, lay pipes, select pipes */
const cv=$('cv');
const pt=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
const hitNode=(x,y)=>G.nodes.findIndex(n=>Math.hypot(n.x-x,n.y-y)<=R+4);
function hitEdge(x,y){let best=-1,bd=9;G.edges.forEach((e,i)=>{const g=geom(i),vx=g.bx-g.ax,vy=g.by-g.ay,
 t=Math.max(0,Math.min(1,((x-g.ax)*vx+(y-g.ay)*vy)/(vx*vx+vy*vy||1))),d=Math.hypot(x-g.ax-t*vx,y-g.ay-t*vy);if(d<bd){bd=d;best=i}});return best}
let drag=-1;
cv.onpointerdown=e=>{const[x,y]=pt(e),h=hitNode(x,y),t=ui.tool;ui.mx=x;ui.my=y;
 if(t==='move'){if(h>=0){drag=h;cv.setPointerCapture(e.pointerId);setSel(-1)}else setSel(hitEdge(x,y))}
 else if(t==='pipe'){if(h<0)ui.pend=-1;else if(ui.pend<0)ui.pend=h;else if(ui.pend!==h){addPipe(ui.pend,h,Math.max(1,+$('cap').value||10),Math.max(0,+$('cost').value||0));ui.pend=-1;edited()}else ui.pend=-1;refresh()}
 else if(t==='del'){if(h>=0){delNode(h);edited()}else{const k=hitEdge(x,y);if(k>=0){G.edges.splice(k,1);edited()}}}
 else{if(h>=0){G.nodes[h].type=t;edited()}else{addNode(Math.min(W-R,Math.max(R,x)),Math.min(H-R-14,Math.max(R,y)),t);edited()}}};
cv.onpointermove=e=>{const[x,y]=pt(e);ui.mx=x;ui.my=y;if(drag>=0){const n=G.nodes[drag];n.x=Math.min(W-R,Math.max(R,x));n.y=Math.min(H-R-14,Math.max(R,y));draw()}else if(ui.pend>=0)draw()};
cv.onpointerup=()=>{drag=-1};
function setSel(i){ui.sel=i;if(i>=0){$('selcap').value=G.edges[i].cap;$('selcost').value=G.edges[i].cost||0}refresh()}
