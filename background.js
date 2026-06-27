// =========================
// background.js (Responsive)
// =========================

const bg = document.createElement("div");

bg.id = "background";

Object.assign(bg.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    zIndex: "-100",
    pointerEvents: "none"
});

document.body.prepend(bg);

//----------------------------

function addLayer(src, style){

    const img = document.createElement("img");

    img.src = "assets/" + src;

    img.style.position = "absolute";

    Object.assign(img.style, style);

    bg.appendChild(img);

    return img;

}

//============================
// SKY
//============================

addLayer("sky.png",{

    left:"0",
    top:"0",
    width:"100%",
    height:"100%",
    objectFit:"cover"

});

//============================
// MOUNTAIN
//============================

addLayer("mountain.png",{

    left:"0",
    bottom:"18%",
    width:"100%"

});

//============================
// CLOUD
//============================

const cloud = addLayer("cloud.png",{

    left:"0",
    top:"2%",
    width:"100%"

});

//============================
// TREE
//============================

const tree = addLayer("tree.png",{

    right:"2%",
    bottom:"18%",
    height:"55vh"

});

//============================
// HOUSE
//============================

const house = addLayer("house.png",{

    left:"6%",
    bottom:"10%",
    width:"22vw",
    minWidth:"180px",
    maxWidth:"420px"

});

//============================
// RICE
//============================

addLayer("rice.png",{

    left:"0",
    bottom:"0",
    width:"100%",
    height:"28vh",
    objectFit:"cover"

});

//============================
// POND
//============================

addLayer("pond.png",{

    left:"45%",
    bottom:"2%",
    width:"25vw",
    minWidth:"180px",
    maxWidth:"420px"

});

//============================
// FIREFLY
//============================

const firefly = addLayer("firefly.png",{

    left:"0",
    top:"0",
    width:"100%",
    height:"100%",
    objectFit:"cover",
    opacity:"0.9"

});

//============================
// Responsive
//============================

function resizeScene(){

    if(window.innerWidth > window.innerHeight){

        // แนวนอน / คอม

        house.style.width = "16vw";
        tree.style.height = "72vh";

    }else{

        // มือถือแนวตั้ง

        house.style.width = "26vw";
        tree.style.height = "55vh";

    }

}

resizeScene();

window.addEventListener("resize", resizeScene);
