import{S as e,a as t,b as n,d as r,i,m as a,o,p as s,s as c,u as l,v as u}from"./Nav-Dqhb_S6z.js";var d=e();function f(e,t,n){let r=(t,n)=>{let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r)??``;throw e.deleteShader(r),Error(`shader: ${t}`)}return r},i=e.createProgram(),a=r(e.VERTEX_SHADER,t),o=r(e.FRAGMENT_SHADER,n);if(e.attachShader(i,a),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(a),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw Error(`program: ${e.getProgramInfoLog(i)}`);return i}function p(e,t,n){let r={};for(let i of n)r[i]=e.getUniformLocation(t,i);return r}function m(e,t,n,r){let i=e.createTexture();return e.bindTexture(e.TEXTURE_2D,i),e.pixelStorei(e.UNPACK_ALIGNMENT,1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,t,n,0,e.RGBA,e.UNSIGNED_BYTE,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),i}async function h(e){let t=await(await fetch(e)).blob(),n=await createImageBitmap(t,{colorSpaceConversion:`none`,premultiplyAlpha:`none`}),r=document.createElement(`canvas`);r.width=n.width,r.height=n.height;let i=r.getContext(`2d`,{willReadFrequently:!0,colorSpace:`srgb`});i.drawImage(n,0,0),n.close();let a=i.getImageData(0,0,r.width,r.height).data;return{width:r.width,height:r.height,data:a}}async function g(e){return new Uint8Array(await(await fetch(e)).arrayBuffer())}function _(e,t={}){try{return e.getContext(`webgl2`,{antialias:!0,alpha:!0,premultipliedAlpha:!0,powerPreference:`high-performance`,...t})}catch{return null}}var v=`#version 300 es
layout(location = 0) in vec2 a;
void main() { gl_Position = vec4(a, 0., 1.); }`,y=`#version 300 es
precision highp float;
uniform vec2 uRes, uTilt;
uniform float uJ, uRoll, uTime, uOpen, uMotes, uReach;
uniform vec3 uGround;
out vec4 o;

// The shaft's stretches, by blocks fallen from the surface: where each begins and how far
// its walls stand from the middle. The mouth steps in three times; the throat is narrow.
const int N = 6;
const float TOP[7] = float[7](0., 2., 6., 12., 128., 188., 212.);
const float HALF[6] = float[6](7.5, 6.5, 5.5, 4.5, 3., 4.5);

float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h2(i), h2(i + vec2(1., 0.)), f.x), mix(h2(i + vec2(0., 1.)), h2(i + 1.), f.x), f.y);
}

// What the block at a depth is made of. cell tells blocks apart, f is the place within the
// block; sharp is 0 where blocks are too small to tell. An ore is its rock with flecks in it.
vec3 rock(float j, vec2 cell, vec2 f, float sharp, out float lit) {
  float n = mix(0.5, h2(cell), sharp), n2 = h2(cell + 17.3), pick = h2(cell + 5.1), k = h2(cell + 9.7);
  vec2 sub = floor(f * 4.);
  bool fleck = sharp > 0.5 && h2(cell * 3.7 + sub * 1.31) > 0.56;
  lit = 0.;
  if (j < 1.) return vec3(0.13, 0.29, 0.19) * (0.84 + n * 0.32);
  if (j < 4. + n2 * 2.) return vec3(0.31, 0.225, 0.15) * (0.8 + n * 0.4);
  if (j < 123. + n2 * 3.) {
    float deep = smoothstep(58., 70., j + (n2 - 0.5) * 10.);
    vec3 c = mix(vec3(0.37, 0.38, 0.40), vec3(0.17, 0.18, 0.21), deep) * (0.8 + n * 0.4);
    if (sharp > 0.5) {
      // A cave the shaft has cut open, a pocket of lava far down, the odd ore.
      float cave = vn(cell * vec2(0.14, 0.12) + 3.7);
      if (j > 14. && cave > 0.73) c *= mix(1., 0.34, smoothstep(0.73, 0.79, cave)) * vec3(0.9, 0.94, 1.);
      else if (j > 100. && vn(cell * 0.23 + 11.) > 0.83) { c = vec3(0.92, 0.33, 0.05) * (0.62 + n * 0.5); lit = 0.55; }
      else if (pick > 0.962 && fleck) {
        c = j < 40. ? (k < 0.5 ? vec3(0.07, 0.07, 0.08) : k < 0.8 ? vec3(0.80, 0.63, 0.50) : vec3(0.84, 0.50, 0.30))
          : j < 84. ? (k < 0.4 ? vec3(0.95, 0.79, 0.28) : k < 0.7 ? vec3(0.20, 0.36, 0.86) : vec3(0.80, 0.63, 0.50))
          : (k < 0.5 ? vec3(0.88, 0.15, 0.12) : vec3(0.36, 0.90, 0.86));
        lit = j > 84. ? 0.3 : 0.;
      }
    }
    return c;
  }
  if (j < 128.) return vec3(0.095, 0.095, 0.105) * (0.55 + n * 0.95);
  if (j < 188.) {
    if (n2 > 0.972 && fleck) { lit = 0.45; return vec3(0.40, 0.23, 0.78); }
    return vec3(0.085, 0.062, 0.13) * (0.7 + n * 0.65);
  }
  if (j < 191. + n2 * 2.) return vec3(0.095, 0.095, 0.105) * (0.55 + n * 0.95);
  return vec3(0.27, 0.085, 0.078) * (0.7 + n * 0.55);
}

// The joints between blocks, fading where blocks get too small.
float joints(vec2 uv, float px) {
  vec2 f = fract(uv);
  float e = min(min(f.x, 1. - f.x), min(f.y, 1. - f.y));
  return (1. - smoothstep(0., 0.06 + px, e)) * (1. - smoothstep(0.2, 0.8, px));
}

// The motes of the dark between the worlds: they fly outward past the eye, inside the shaft.
float motes(vec2 s, float t) {
  float a = atan(s.y, s.x), acc = 0.;
  for (int layer = 0; layer < 2; layer++) {
    float cells = layer == 0 ? 23. : 37.;
    float ia = floor(a / 6.2831853 * cells);
    for (int d = -1; d <= 1; d++) {
      float id = ia + float(d) + float(layer) * 100., h = h1(id);
      float ang = (ia + float(d) + 0.5 + (h - 0.5) * 0.8) / cells * 6.2831853;
      float ph = fract(h * 7.31 + t * (0.22 + h1(id + 3.) * 0.3));
      float rr = ph * ph * 1.7 + 0.03, size = 0.006 + rr * 0.016;
      acc += smoothstep(size, 0., length(s - vec2(cos(ang), sin(ang)) * rr)) * smoothstep(0., 0.2, ph) * (1. - ph);
    }
  }
  return acc;
}

void main() {
  // A line of sight: how far it goes sideways for each block it goes down.
  vec2 s = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y) * 1.5 + uTilt;
  float cr = cos(uRoll), sr = sin(uRoll);
  s = mat2(cr, -sr, sr, cr) * s;
  float m = max(abs(s.x), abs(s.y));
  float foot = TOP[N] - uJ;
  vec3 ember = vec3(1., 0.40, 0.09);

  vec3 col = vec3(0.); float alpha = 1.; bool hit = false;
  for (int i = 0; i < N; i++) {
    float a = max(TOP[i] - uJ, 0.), b = TOP[i + 1] - uJ, w = HALF[i];
    if (b <= 0.) continue;
    float lit;
    if (m * a > w) {
      // The ledge this stretch begins with (the first one is the ground round the pit).
      vec2 g = s * a; float j = TOP[i], px = fwidth(g.x) + fwidth(g.y), sharp = 1. - smoothstep(0.5, 1.5, px);
      vec2 cell = floor(g + 0.5);
      vec3 c = rock(j + 0.5, cell + j * 3.1, fract(g + 0.5), sharp, lit);
      float cheb = max(abs(g.x), abs(g.y));
      float day = exp(-j / 22.), torch = 1.2 * exp(-a / 30.) * (uJ < 0. ? 0. : 1.);
      float light = (day + torch * (1. - day * 0.5)) * 1.22;
      // In the shade of the wall it comes out of.
      if (i > 0) light *= mix(0.5, 1., smoothstep(0., 1.3, HALF[i - 1] - cheb));
      c *= 1. - 0.3 * joints(g + 0.5, px);
      col = c * light + c * lit;
      if (i == 0) {
        // The ground gives way to the page's own stone, block by block.
        float away = smoothstep(8. * uReach, 30. * uReach, cheb + (h2(cell) - 0.5) * 5. * uReach);
        col = mix(col * mix(0.72, 1., smoothstep(0., 2.2, cheb - w)), uGround, away);
      }
      hit = true; break;
    }
    if (m * b > w) {
      // Its wall.
      float t = w / m, j = uJ + t;
      bool xs = abs(s.x) > abs(s.y);
      float along = (xs ? s.y : s.x) * t + w, side = xs ? (s.x > 0. ? 0.80 : 1.04) : (s.y > 0. ? 1.14 : 0.66);
      vec2 uv = vec2(along, j); float px = fwidth(uv.x) + fwidth(uv.y), sharp = 1. - smoothstep(0.5, 1.5, px);
      vec2 cell = floor(uv) + (xs ? (s.x > 0. ? 100. : 200.) : (s.y > 0. ? 300. : 400.));
      vec3 c = rock(j, cell, fract(uv), sharp, lit);
      float day = exp(-max(j, 0.) / 22.), torch = 1.2 * exp(-t / 30.) * smoothstep(-30., 4., uJ);
      float between = smoothstep(126., 134., j) * (1. - smoothstep(182., 190., j));
      float light = day + torch * (1. - day * 0.5) + between * 0.5;
      c *= 1. - 0.28 * joints(uv, px);
      // The light of what lies below comes up the walls.
      float below = exp(-max(TOP[N] - j, 0.) / 13.) * smoothstep(150., 200., uJ + t * 0.5);
      col = c * light * side * mix(vec3(1.), vec3(0.78, 0.66, 1.), between) + c * lit + c * ember * below * 0.75 + ember * below * 0.03;
      // The top of a stretch lies in the shade of the ledge over it.
      if (i > 0 && i < 4) col *= mix(0.62, 1., smoothstep(0., 2.5, j - TOP[i]));
      hit = true; break;
    }
  }
  if (!hit) {
    // Out through the foot: the light below, and then the Nether itself.
    float flick = 0.86 + 0.14 * vn(s * 90. + uTime * 1.6);
    col = ember * flick * 1.25 * (1. - uOpen);
    alpha = 1. - uOpen;
  } else {
    // The light spills up round the foot while it is far below.
    float edge = HALF[N - 1] / max(foot, 1.);
    col += ember * exp(-max(m - edge, 0.) / (edge * 1.6 + 0.004)) * 0.55 * (1. - uOpen) * smoothstep(-70., 0., uJ + 12.);
    col += vec3(0.62, 0.42, 1.) * motes(s, uTime * 0.6 + uJ * 0.045) * uMotes;
  }
  o = vec4(col * alpha, alpha);
}`,b=class e{gl;p;u;vao;static make(t){let n=_(t,{antialias:!1,depth:!1});if(!n)return null;try{return new e(n)}catch(e){return console.warn(e),null}}constructor(e){this.gl=e,this.p=f(e,v,y),this.u=p(e,this.p,[`uRes`,`uTilt`,`uJ`,`uRoll`,`uTime`,`uOpen`,`uMotes`,`uGround`,`uReach`]),this.vao=e.createVertexArray(),e.bindVertexArray(this.vao),e.bindBuffer(e.ARRAY_BUFFER,e.createBuffer()),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0)}draw(e){let t=this.gl,n=this.u;t.viewport(0,0,t.drawingBufferWidth,t.drawingBufferHeight),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(this.p),t.bindVertexArray(this.vao),t.uniform2f(n.uRes,t.drawingBufferWidth,t.drawingBufferHeight),t.uniform2f(n.uTilt,e.tilt[0],e.tilt[1]),t.uniform1f(n.uJ,e.j),t.uniform1f(n.uRoll,e.roll),t.uniform1f(n.uTime,e.time),t.uniform1f(n.uOpen,e.open),t.uniform1f(n.uMotes,e.motes),t.uniform3f(n.uGround,12/255,11/255,13/255),t.uniform1f(n.uReach,e.reach??1),t.drawArrays(t.TRIANGLES,0,3)}},x=new Set,S=!1,C=!1;function w(){S=!1;for(let e of x)e()}function T(){S||(S=!0,requestAnimationFrame(w))}function E(e){return x.add(e),C||(C=!0,addEventListener(`scroll`,T,{passive:!0}),addEventListener(`resize`,T)),e(),()=>{x.delete(e)}}function D(e){let t=e.getBoundingClientRect(),n=t.height-innerHeight;return n<=0?+(t.top<=0):Math.max(0,Math.min(1,-t.top/n))}function O(e,t,n=[]){(0,d.useEffect)(()=>{let n=e.current;if(n)return E(()=>t(n))},n)}var k=()=>typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches,A=()=>k()||document.documentElement.dataset.world===`none`,j=s();function M({children:e}){return(0,j.jsx)(`ol`,{className:`steps`,children:e.map((e,t)=>(0,j.jsxs)(`li`,{children:[(0,j.jsx)(`span`,{className:`digits step-n`,children:t+1}),(0,j.jsx)(`div`,{children:e})]},t))})}function N(){return(0,j.jsx)(`section`,{id:`mod`,className:`relative z-10 bg-stone`,children:(0,j.jsx)(`div`,{className:`wrap py-[clamp(72px,12vh,140px)]`,children:(0,j.jsxs)(`div`,{className:`slab modpanel`,...r(0),children:[(0,j.jsxs)(`div`,{children:[(0,j.jsx)(c,{c:`var(--color-torch)`,children:`Seedlands Link · the mod`}),(0,j.jsxs)(`h2`,{className:`title mt-5`,children:[`One small mod.`,(0,j.jsx)(`br`,{}),`Nothing to type.`]}),(0,j.jsx)(`p`,{className:`lead mt-5 max-w-[32rem]`,children:`Seedlands Link is the free companion mod for Minecraft: Java Edition. With it your game finds Seedlands on your Wi‑Fi by itself: no addresses, no passwords, no account.`}),(0,j.jsxs)(`div`,{className:`mt-8 flex flex-wrap gap-3.5`,children:[(0,j.jsxs)(`a`,{className:`key torch`,href:u.file,download:!0,children:[t.down,`Download Seedlands Link`]}),(0,j.jsx)(`a`,{className:`key`,href:`mod.html`,children:`All about the mod`})]}),(0,j.jsxs)(`p`,{className:`meta`,children:[(0,j.jsxs)(`span`,{children:[`Version `,u.version]}),(0,j.jsx)(`span`,{children:u.size}),(0,j.jsx)(`span`,{children:`Fabric`}),(0,j.jsx)(`span`,{children:u.game})]})]}),(0,j.jsx)(M,{children:[(0,j.jsxs)(j.Fragment,{children:[`Install `,(0,j.jsx)(`a`,{href:a,children:`Fabric Loader`}),` for your version of the game.`]}),(0,j.jsxs)(j.Fragment,{children:[`Put `,(0,j.jsx)(`strong`,{children:`Seedlands Link`}),` into your game’s `,(0,j.jsx)(`code`,{className:`code`,children:`mods`}),` folder and start the game.`]}),(0,j.jsx)(j.Fragment,{children:`On your iPhone or iPad, on the same Wi‑Fi, open Seedlands and tap the walking figure at the top right.`}),(0,j.jsx)(j.Fragment,{children:`When the key lights up, tap it. The map takes your game’s version and seed, and follows you.`})]}),(0,j.jsx)(`div`,{className:`well tells`,children:(0,j.jsxs)(`p`,{children:[(0,j.jsx)(`strong`,{children:`What it tells, and to whom.`}),` `,n,` Nothing leaves your network.`]})})]})})})}var P=[`Places`,`Orte`,`Lugares`,`Lieux`,`Luoghi`,`地点`,`地點`,`जगहें`,`Места`];function F(){let[e,t]=(0,d.useState)(0),[n,r]=(0,d.useState)(!1);return(0,d.useEffect)(()=>{if(k())return;let e=0,n=setInterval(()=>{r(!0),e=window.setTimeout(()=>{t(e=>(e+1)%P.length),r(!1)},260)},1900);return()=>{clearInterval(n),clearTimeout(e)}},[]),(0,j.jsx)(`span`,{className:`tongue well`,"aria-hidden":!0,children:(0,j.jsx)(`span`,{"data-out":n,children:P[e]},e)})}function I(){return(0,j.jsx)(`section`,{id:`more`,className:`relative z-10 bg-stone`,children:(0,j.jsxs)(`div`,{className:`wrap pb-[clamp(72px,12vh,140px)] pt-6`,children:[(0,j.jsx)(c,{c:`var(--color-paper)`,i:0,children:`And the rest`}),(0,j.jsx)(o,{className:`headline mt-5`,lines:[`Small things,`,`done properly.`]}),(0,j.jsxs)(`div`,{className:`bento`,children:[(0,j.jsxs)(`div`,{className:`slab card card-wide`,...r(0),children:[(0,j.jsxs)(`h3`,{children:[(0,j.jsx)(i,{c:`var(--color-torch)`}),`Coordinates, both ways`]}),(0,j.jsx)(`p`,{children:`Touch and hold anywhere for X, Y and Z and the biome. Type or paste coordinates to fly there. Overworld and Nether are converted for you.`}),(0,j.jsxs)(`div`,{className:`twin`,"aria-hidden":!0,children:[(0,j.jsxs)(`span`,{className:`well digits`,children:[(0,j.jsx)(i,{c:`var(--color-moss)`}),`2880 71 −1040`]}),(0,j.jsx)(`i`,{children:t.right}),(0,j.jsxs)(`span`,{className:`well digits`,children:[(0,j.jsx)(i,{c:`var(--color-ember)`}),`360 71 −130`]})]})]}),(0,j.jsxs)(`div`,{className:`slab card`,...r(1),children:[(0,j.jsxs)(`h3`,{children:[(0,j.jsx)(i,{c:`var(--color-moss)`}),`Java and Bedrock`]}),(0,j.jsx)(`p`,{children:`Java Edition from 1.18.2 to 26.3, Bedrock Edition from 1.18 to 26.60. Choose the version your world was made in.`})]}),(0,j.jsxs)(`div`,{className:`slab card`,...r(2),children:[(0,j.jsxs)(`h3`,{children:[(0,j.jsx)(i,{c:`var(--color-scan)`}),`Back where you left it`]}),(0,j.jsx)(`p`,{children:`Put the app away and open it again: the map is there on the first frame, exactly where you were.`})]}),(0,j.jsxs)(`div`,{className:`slab card`,...r(0),children:[(0,j.jsxs)(`h3`,{children:[(0,j.jsx)(i,{c:`var(--color-paper)`}),`Nothing collected`]}),(0,j.jsxs)(`p`,{children:[`No account, no ads, no tracking. Everything the map shows is worked out on your device, from the seed. `,(0,j.jsx)(`a`,{href:`privacy.html`,children:`Privacy`})]})]}),(0,j.jsxs)(`div`,{className:`slab card card-wide`,...r(1),children:[(0,j.jsxs)(`h3`,{children:[(0,j.jsx)(i,{c:`var(--color-ember)`}),`iPhone, iPad, iPhone Duo`]}),(0,j.jsx)(`p`,{children:`Made for each, with smooth motion at up to 120 Hz, and in eleven languages.`}),(0,j.jsx)(`div`,{className:`twin`,children:(0,j.jsx)(F,{})})]}),(0,j.jsxs)(`div`,{className:`slab card`,...r(2),children:[(0,j.jsxs)(`h3`,{children:[(0,j.jsx)(i,{c:`#c9b48a`}),`Help, from a person`]}),(0,j.jsxs)(`p`,{children:[`Something doesn’t match your world? `,(0,j.jsx)(`a`,{href:`support.html`,children:`Support`}),` has the answers, and every message is read.`]})]})]})]})})}function L(){let e=(0,d.useRef)(null);return(0,d.useEffect)(()=>{let t=e.current,n=b.make(t);if(!n){t.dataset.off=`true`;return}let r=k(),i=0,a=!1,o=[0,0],s=[0,0],c=e=>{if(i=0,!a)return;let l=Math.min(devicePixelRatio||1,2),u=Math.round(t.clientWidth*l),d=Math.round(t.clientHeight*l);(t.width!==u||t.height!==d)&&(t.width=u,t.height=d);let f=e/1e3,p=r?[0,0]:[Math.sin(f*.5)*.012,Math.cos(f*.37)*.012];o=[o[0]+(s[0]+p[0]-o[0])*.08,o[1]+(s[1]+p[1]-o[1])*.08],n.draw({j:-32,roll:0,tilt:o,time:f,open:0,motes:0,reach:.42}),r||(i=requestAnimationFrame(c))},l=()=>{i||=requestAnimationFrame(c)},u=new IntersectionObserver(([e])=>{a=e.isIntersecting,a&&l()});u.observe(t);let d=e=>{let n=t.getBoundingClientRect();s=[-((e.clientX-(n.left+n.width/2))/innerWidth)*.3,(e.clientY-(n.top+n.height/2))/innerHeight*.3],l()};return addEventListener(`pointermove`,d,{passive:!0}),()=>{u.disconnect(),removeEventListener(`pointermove`,d),cancelAnimationFrame(i)}},[]),(0,j.jsx)(`canvas`,{ref:e,className:`pit`,"aria-hidden":!0})}function R(){return(0,j.jsxs)(`section`,{id:`get`,className:`closing relative z-10 bg-stone`,children:[(0,j.jsx)(L,{}),(0,j.jsxs)(`div`,{className:`wrap closing-copy`,children:[(0,j.jsx)(o,{className:`headline`,lines:[`See your world before`,`you set foot in it.`]}),(0,j.jsx)(`p`,{className:`lead mt-5`,...r(2),children:`Seedlands, for iPhone and iPad.`}),(0,j.jsxs)(`div`,{className:`mt-8 flex flex-wrap justify-center gap-3.5`,...r(3),children:[(0,j.jsx)(l,{}),(0,j.jsxs)(`a`,{className:`key`,href:`mod.html`,children:[t.down,`Get the mod`]})]})]})]})}export{k as a,O as c,m as d,_ as f,p as h,M as i,b as l,f as m,N as n,A as o,h as p,I as r,D as s,R as t,g as u};