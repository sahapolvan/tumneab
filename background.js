// =========================
// background.js
// =========================

const bg = document.createElement("div");

bg.id = "background";

bg.style.position = "fixed";
bg.style.left = "0";
bg.style.top = "0";
bg.style.width = "100vw";
bg.style.height = "100vh";
bg.style.overflow = "hidden";
bg.style.zIndex = "-100";

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

    bottom:"230px",

    width:"100%"

});

//============================
// CLOUD
//============================

addLayer("cloud.png",{

    left:"0",

    top:"20px",

    width:"100%"

});

//============================
// TREE
//============================

addLayer("tree.png",{

    right:"0",

    bottom:"170px",

    height:"65%"

});

//============================
// HOUSE
//============================

addLayer("house.png",{

    left:"40px",

    bottom:"120px",

    width:"340px"

});

//============================
// RICE
//============================

addLayer("rice.png",{

    left:"0",

    bottom:"0",

    width:"100%"

});

//============================
// POND
//============================

addLayer("pond.png",{

    left:"180px",

    bottom:"10px",

    width:"420px"

});

//============================
// FIREFLY
//============================

addLayer("firefly.png",{

    left:"0",

    top:"0",

    width:"100%",

    height:"100%",

    objectFit:"cover",

    pointerEvents:"none",

    opacity:"0.8"

});
