// ===========================================
// background.js
// Part 1
// By ChatGPT
// ===========================================

// --------------------
// สร้าง CSS Animation
// --------------------

const style = document.createElement("style");

style.textContent = `

@keyframes moonGlow{

    0%{
        opacity:.55;
        transform:scale(1);
    }

    50%{
        opacity:1;
        transform:scale(1.08);
    }

    100%{
        opacity:.55;
        transform:scale(1);
    }

}

`;

document.head.appendChild(style);

// --------------------
// Background
// --------------------

const bg = document.createElement("div");

bg.id = "bgScene";

Object.assign(bg.style,{

    position:"fixed",

    left:"0",

    top:"0",

    width:"100vw",

    height:"100vh",

    overflow:"hidden",

    zIndex:"-999",

    pointerEvents:"none",

    background:
    "url('assets/night.png') center center / cover no-repeat"

});

document.body.prepend(bg);

// --------------------
// Moon Glow
// --------------------

const moonGlow = document.createElement("div");

Object.assign(moonGlow.style,{

    position:"absolute",

    right:"10%",

    top:"10%",

    width:"220px",

    height:"220px",

    borderRadius:"50%",

    background:
    "radial-gradient(circle, rgba(255,255,255,.65), rgba(255,255,255,0))",

    filter:"blur(20px)",

    animation:
    "moonGlow 6s ease-in-out infinite"

});

bg.appendChild(moonGlow);

// --------------------
// Moon
// --------------------

const moon = document.createElement("div");

Object.assign(moon.style,{

    position:"absolute",

    right:"13%",

    top:"13%",

    width:"90px",

    height:"90px",

    borderRadius:"50%",

    background:"#F8F8F0",

    boxShadow:
    "0 0 40px rgba(255,255,220,.8)"

});

bg.appendChild(moon);

// --------------------
// เอฟเฟกต์ทั้งหมดจะถูกสร้างในนี้
// --------------------

const effectLayer = document.createElement("div");

Object.assign(effectLayer.style,{

    position:"absolute",

    inset:"0"

});

bg.appendChild(effectLayer);

// --------------------
// Responsive
// --------------------

function resizeBackground(){

    if(window.innerWidth < 700){

        moon.style.width="60px";
        moon.style.height="60px";

        moonGlow.style.width="150px";
        moonGlow.style.height="150px";

    }else{

        moon.style.width="90px";
        moon.style.height="90px";

        moonGlow.style.width="220px";
        moonGlow.style.height="220px";

    }

}

resizeBackground();

window.addEventListener("resize",resizeBackground);

console.log("Background Part 1 Loaded");

// ===========================================
// Part 2
// ระบบสร้างดาว
// ===========================================

// Animation ดาว

const starStyle = document.createElement("style");

starStyle.textContent = `

@keyframes twinkle{

    0%{
        opacity:.15;
        transform:scale(.8);
    }

    50%{
        opacity:1;
        transform:scale(1.4);
    }

    100%{
        opacity:.15;
        transform:scale(.8);
    }

}

`;

document.head.appendChild(starStyle);


// จำนวนดาว

const STAR_COUNT = 180;


// สร้างดาว

for(let i=0;i<STAR_COUNT;i++){

    const star = document.createElement("div");

    const size = Math.random()*3 + 1;

    Object.assign(star.style,{

        position:"absolute",

        width:size+"px",

        height:size+"px",

        borderRadius:"50%",

        background:"#ffffff",

        left:(Math.random()*100)+"%",

        top:(Math.random()*65)+"%",

        opacity:Math.random(),

        boxShadow:
        "0 0 8px rgba(255,255,255,.9)",

        animation:
        `twinkle ${2+Math.random()*4}s infinite`,

        animationDelay:
        (Math.random()*6)+"s"

    });

    effectLayer.appendChild(star);

}

console.log("Stars Loaded");

// ===========================================
// Part 3
// Firefly
// ===========================================

// Animation

const fireflyStyle = document.createElement("style");

fireflyStyle.textContent = `

@keyframes fireflyBlink{

    0%{
        opacity:.2;
    }

    50%{
        opacity:1;
    }

    100%{
        opacity:.2;
    }

}

`;

document.head.appendChild(fireflyStyle);


// จำนวนหิ่งห้อย

const FIREFLY_COUNT = 35;

const fireflies = [];

for(let i=0;i<FIREFLY_COUNT;i++){

    const f = document.createElement("div");

    const size = Math.random()*5 + 3;

    Object.assign(f.style,{

        position:"absolute",

        width:size+"px",

        height:size+"px",

        borderRadius:"50%",

        background:"#FFF7A5",

        boxShadow:
        "0 0 12px #FFF176",

        left:(Math.random()*100)+"%",

        top:(60+Math.random()*35)+"%",

        animation:
        `fireflyBlink ${1+Math.random()*2}s infinite`

    });

    effectLayer.appendChild(f);

    fireflies.push({

        el:f,

        x:Math.random()*window.innerWidth,

        y:window.innerHeight*0.6+
          Math.random()*window.innerHeight*0.3,

        dx:(Math.random()-0.5)*0.4,

        dy:(Math.random()-0.5)*0.25

    });

}


// Animation

function animateFireflies(){

    fireflies.forEach(f=>{

        f.x += f.dx;
        f.y += f.dy;

        // เด้งกลับเมื่อชนขอบ

        if(f.x<0 || f.x>window.innerWidth){

            f.dx *= -1;

        }

        if(f.y<window.innerHeight*0.45 ||
           f.y>window.innerHeight){

            f.dy *= -1;

        }

        f.el.style.transform =
            `translate(${f.x}px,${f.y}px)`;

    });

    requestAnimationFrame(
        animateFireflies
    );

}

animateFireflies();

console.log("Firefly Loaded");

// ===========================================
// Part 4
// Mist + Hut Light
// ===========================================


// Animation CSS

const mistStyle = document.createElement("style");

mistStyle.textContent = `

@keyframes mistMove{

    0%{
        transform:translateX(-8%);
    }

    50%{
        transform:translateX(8%);
    }

    100%{
        transform:translateX(-8%);
    }

}

@keyframes hutLight{

    0%{
        opacity:.55;
    }

    50%{
        opacity:1;
    }

    100%{
        opacity:.55;
    }

}

`;

document.head.appendChild(mistStyle);


// =========================
// หมอก
// =========================

const mist = document.createElement("div");

Object.assign(mist.style,{

    position:"absolute",

    left:"-10%",

    bottom:"0",

    width:"120%",

    height:"38%",

    background:
"linear-gradient(to top,\
rgba(255,255,255,.18),\
rgba(255,255,255,.08),\
rgba(255,255,255,0))",

    filter:"blur(18px)",

    animation:
"mistMove 40s ease-in-out infinite"

});

effectLayer.appendChild(mist);


// =========================
// แสงเถียงนา
// =========================

const hutLight = document.createElement("div");

Object.assign(hutLight.style,{

    position:"absolute",

    left:"19%",

    bottom:"29%",

    width:"70px",

    height:"70px",

    borderRadius:"50%",

    background:
"radial-gradient(circle,\
rgba(255,220,120,.85),\
rgba(255,220,120,0))",

    filter:"blur(10px)",

    animation:
"hutLight 3s ease-in-out infinite"

});

effectLayer.appendChild(hutLight);


// =========================
// Responsive
// =========================

function resizeHutLight(){

    if(window.innerWidth < 700){

        hutLight.style.left="22%";

        hutLight.style.bottom="27%";

        hutLight.style.width="45px";

        hutLight.style.height="45px";

    }else{

        hutLight.style.left="19%";

        hutLight.style.bottom="29%";

        hutLight.style.width="70px";

        hutLight.style.height="70px";

    }

}

resizeHutLight();

window.addEventListener(
    "resize",
    resizeHutLight
);

console.log("Mist & Hut Light Loaded");


// ===========================================
// Part 5
// Final Animation
// ===========================================


// ------------------------
// ดาวตก
// ------------------------

function createMeteor(){

    const meteor=document.createElement("div");

    Object.assign(meteor.style,{

        position:"absolute",

        width:"140px",

        height:"2px",

        background:
        "linear-gradient(to right,white,transparent)",

        left:(Math.random()*70)+"%",

        top:(Math.random()*30)+"%",

        transform:"rotate(-35deg)",

        opacity:"1"

    });

    effectLayer.appendChild(meteor);

    let x=0;

    let y=0;

    function move(){

        x+=18;

        y+=12;

        meteor.style.transform=
        `translate(${x}px,${y}px) rotate(-35deg)`;

        meteor.style.opacity-=0.02;

        if(meteor.style.opacity<=0){

            meteor.remove();

            return;

        }

        requestAnimationFrame(move);

    }

    move();

}

// ทุก 20~60 วินาที

setInterval(()=>{

    createMeteor();

},20000+Math.random()*40000);


// ------------------------
// หิ่งห้อยบินแบบคลื่น
// ------------------------

let t=0;

function updateFireflies(){

    t+=0.01;

    fireflies.forEach((f,i)=>{

        f.x+=f.dx;

        f.y+=
        Math.sin(t+i)*0.4;

        if(f.x<0){

            f.x=window.innerWidth;

        }

        if(f.x>window.innerWidth){

            f.x=0;

        }

        f.el.style.transform=
        `translate(${f.x}px,${f.y}px)`;

    });

    requestAnimationFrame(updateFireflies);

}

updateFireflies();


// ------------------------
// หมอกหลายชั้น
// ------------------------

for(let i=0;i<2;i++){

    const layer=document.createElement("div");

    Object.assign(layer.style,{

        position:"absolute",

        left:"-15%",

        bottom:(5+i*8)+"%",

        width:"130%",

        height:"18%",

        background:
"linear-gradient(to top,\
rgba(255,255,255,.08),\
rgba(255,255,255,0))",

        filter:"blur(35px)",

        animation:
`mistMove ${55+i*15}s linear infinite`

    });

    effectLayer.appendChild(layer);

}


// ------------------------
// พระจันทร์เปลี่ยนแสง
// ------------------------

let moonValue=0;

function moonBreath(){

    moonValue+=0.015;

    moonGlow.style.opacity=
    0.55+
    Math.sin(moonValue)*0.25;

    requestAnimationFrame(moonBreath);

}

moonBreath();

console.log("Background Final Loaded");



