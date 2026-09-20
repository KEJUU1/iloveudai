const c=document.getElementById("scene"),ctx=c.getContext("2d");
let W,H,DPR,flowers=[],grass=[],stars=[],start;

function resize(){
  DPR=Math.min(devicePixelRatio||1,2); W=innerWidth; H=innerHeight;
  c.width=W*DPR;c.height=H*DPR;c.style.width=W+"px";c.style.height=H+"px";
  ctx.setTransform(DPR,0,0,DPR,0,0);
  build();
}
function rand(a,b){return a+Math.random()*(b-a)}
function build(){
  flowers=[];grass=[];stars=[];
  const base=H*.94;
  const count=Math.max(13,Math.floor(W/58));
  for(let i=0;i<count;i++){
    const x=(i+.5)/count*W+rand(-25,25);
    const h=rand(H*.22,H*.46);
    flowers.push({
      x,y:base,h,lean:rand(-.14,.14),size:rand(.55,1.0),
      delay:i*115+rand(0,300),phase:rand(0,Math.PI*2),
      bloom:rand(.7,1.05), petals:Math.random()>.25?5:6
    });
  }
  for(let i=0;i<Math.max(26,W/18);i++){
    grass.push({x:rand(0,W),h:rand(35,130),lean:rand(-.25,.25),delay:rand(0,1800)});
  }
  for(let i=0;i<120;i++) stars.push({x:rand(0,W),y:rand(0,H*.55),r:rand(.35,1.5),a:rand(.15,.8),p:rand(0,7)});
}
function ease(t){return 1-Math.pow(1-t,3)}
function line(x1,y1,x2,y2,w=1.5,alpha=.8){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.lineWidth=w;ctx.strokeStyle=`rgba(109,164,127,${alpha})`;ctx.stroke();
}
function petal(cx,cy,r,ang,scale){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);
  ctx.beginPath();
  ctx.ellipse(0,-r*.68,r*.34,r*.72,0,0,Math.PI*2);
  const g=ctx.createLinearGradient(0,-r*1.4,0,0);
  g.addColorStop(0,"rgba(244,248,239,.98)");
  g.addColorStop(.65,"rgba(205,219,211,.96)");
  g.addColorStop(1,"rgba(131,151,143,.9)");
  ctx.fillStyle=g;ctx.fill();ctx.restore();
}
function flower(f,t){
  const q=Math.min(1,Math.max(0,(t-f.delay)/1150));
  if(q<=0)return;
  const s=ease(q);
  const sway=Math.sin(t*.0011+f.phase)*7;
  const x=f.x, y=f.y, topY=y-f.h*s;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(f.lean+Math.sin(t*.001+f.phase)*.025);
  // stem
  ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(sway*.45,-f.h*.5*s,sway,-f.h*s);
  ctx.lineWidth=2.2;ctx.strokeStyle="rgba(83,127,94,.95)";ctx.stroke();
  // leaves
  const leaves=[.32,.48,.62,.76];
  leaves.forEach((p,j)=>{
    const ly=-f.h*p*s, side=j%2?1:-1;
    ctx.save();ctx.translate(sway*p,ly);ctx.rotate(side*(.65+Math.sin(t*.001+j)*.05));
    ctx.beginPath();ctx.ellipse(side*20,0,28,9,0,0,Math.PI*2);
    ctx.fillStyle="rgba(65,103,76,.92)";ctx.fill();ctx.restore();
  });
  // flower head
  if(s>.5){
    const bx=sway, by=-f.h*s;
    const bloom=Math.min(1,(s-.5)*2);
    ctx.save();ctx.translate(bx,by);ctx.scale(bloom,bloom);
    ctx.shadowBlur=18;ctx.shadowColor="rgba(220,238,229,.34)";
    const n=f.petals;
    for(let k=0;k<n;k++)petal(0,0,32,k*Math.PI*2/n,t);
    ctx.shadowBlur=0;
    ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);
    ctx.fillStyle="#d8c38d";ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function drawGrass(t){
  grass.forEach((g,i)=>{
    const q=Math.min(1,Math.max(0,(t-g.delay)/900));
    if(q<=0)return;
    const s=ease(q),x=g.x,y=H*.94,h=g.h*s;
    const sw=Math.sin(t*.0018+i)*12;
    ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+sw*.4,y-h*.55,x+g.lean*h+sw,y-h);
    ctx.lineWidth=1.2;ctx.strokeStyle="rgba(67,106,76,.7)";ctx.stroke();
  });
}
function drawStars(t){
  stars.forEach(s=>{
    const a=s.a*(.55+.45*Math.sin(t*.001+s.p));
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(225,235,224,${a})`;ctx.fill();
  });
}
function frame(t){
  if(!start)start=t;
  const e=t-start;
  ctx.clearRect(0,0,W,H);
  drawStars(e);
  drawGrass(e);
  flowers.forEach(f=>flower(f,e));
  // subtle ground haze
  const g=ctx.createLinearGradient(0,H*.78,0,H);
  g.addColorStop(0,"rgba(4,9,12,0)");
  g.addColorStop(1,"rgba(1,4,5,.75)");
  ctx.fillStyle=g;ctx.fillRect(0,H*.76,W,H*.24);
  requestAnimationFrame(frame);
}
addEventListener("resize",resize);resize();requestAnimationFrame(frame);
