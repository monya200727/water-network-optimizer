/* render.js - draws the network, flows, augmenting path and minimum cut on the canvas */
const W=900,H=520,R=20,view={res:null,alt:null,idx:0},ui={tool:'move',sel:-1,pend:-1,mx:0,my:0};
const flowsNow=()=>view.res&&view.idx>0?view.res.steps[view.idx-1].flows:G.edges.map(()=>0);
const isDone=()=>!!view.res&&view.idx>=view.res.steps.length;
function geom(i){const e=G.edges[i],p=G.nodes[e.u],q=G.nodes[e.v];let dx=q.x-p.x,dy=q.y-p.y;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;
 const off=G.edges.some(o=>o.u===e.v&&o.v===e.u)?9:0,nx=-dy*off,ny=dx*off;
 return{ax:p.x+dx*R+nx,ay:p.y+dy*R+ny,bx:q.x-dx*(R+2)+nx,by:q.y-dy*(R+2)+ny,dx,dy}}
function draw(){const c=$('cv'),d=window.devicePixelRatio||1;if(c.width!==W*d){c.width=W*d;c.height=H*d}
 const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,H);x.textAlign='center';x.textBaseline='middle';x.lineCap='round';
 const f=flowsNow(),done=isDone(),cut=new Set(done?view.res.cut:[]),cur=view.res&&view.idx>0?view.res.steps[view.idx-1]:null,
  path=new Set(cur?cur.arcs.map(a=>a.e):[]),maxc=Math.max(1,...G.edges.map(e=>e.cap)),acc=css('--acc'),ink=css('--ink'),pan=css('--panel'),mut=css('--mut');
 if(done)G.nodes.forEach((n,i)=>{if(view.res.reach[i]){x.globalAlpha=.13;x.fillStyle=acc;x.beginPath();x.arc(n.x,n.y,36,0,7);x.fill();x.globalAlpha=1}});
 const line=(g)=>{x.beginPath();x.moveTo(g.ax,g.ay);x.lineTo(g.bx,g.by);x.stroke()};
 G.edges.forEach((e,i)=>{const g=geom(i),w=2+4*e.cap/maxc,u=e.cap?f[i]/e.cap:0;
  if(path.has(i)){x.strokeStyle='#f2a900';x.lineWidth=w+7;line(g)}
  x.strokeStyle=e.down?css('--bad'):f[i]<=0?mut:u>=1?css('--bad'):`hsl(${Math.round(205-170*u)},75%,48%)`;x.lineWidth=w;if(cut.has(i)||e.down)x.setLineDash([9,5]);line(g);x.setLineDash([]);
  const an=Math.atan2(g.dy,g.dx);x.fillStyle=x.strokeStyle;x.beginPath();x.moveTo(g.bx+g.dx*4,g.by+g.dy*4);
  x.lineTo(g.bx-9*Math.cos(an-.45),g.by-9*Math.sin(an-.45));x.lineTo(g.bx-9*Math.cos(an+.45),g.by-9*Math.sin(an+.45));x.fill();
  const t=e.down?'BURST':`${f[i]}/${e.cap}`,mx=(g.ax+g.bx)/2,my=(g.ay+g.by)/2;x.font='600 12px Figtree,sans-serif';const tw=x.measureText(t).width+10;
  x.fillStyle=pan;x.strokeStyle=ui.sel===i?acc:css('--line');x.lineWidth=ui.sel===i?2:1;x.beginPath();x.roundRect(mx-tw/2,my-9,tw,18,5);x.fill();x.stroke();
  x.fillStyle=ink;x.fillText(t,mx,my+.5)});
 if(ui.pend>=0&&ui.tool==='pipe'){const p=G.nodes[ui.pend];x.setLineDash([5,5]);x.strokeStyle=acc;x.lineWidth=2;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(ui.mx,ui.my);x.stroke();x.setLineDash([])}
 G.nodes.forEach((n,i)=>{x.beginPath();x.arc(n.x,n.y,R,0,7);x.fillStyle=n.type==='r'?acc:n.type==='n'?css('--ok'):pan;x.fill();
  x.lineWidth=ui.pend===i?4:2;x.strokeStyle=ui.pend===i?'#f2a900':n.type==='j'?mut:'transparent';x.stroke();
  x.fillStyle=n.type==='j'?ink:'#fff';x.font='700 13px Figtree,sans-serif';x.fillText(n.name,n.x,n.y+.5);
  const net=G.edges.reduce((s,e,k)=>s+(e.v===i?f[k]:0)-(e.u===i?f[k]:0),0);
  if(n.type!=='j'&&net!==0){x.fillStyle=mut;x.font='12px Figtree,sans-serif';x.fillText((n.type==='n'?'in ':'out ')+Math.abs(net),n.x,n.y+R+13)}})}
