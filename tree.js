let drawn = {};

// ==========================
// เริ่มวาดต้นไม้
// ==========================
function drawTree(){

    canvas.innerHTML = "";
    drawn = {};

    const root = Object.values(people).find(
        p => p.name === "เภา"
    );

    if(!root){
        alert("ไม่พบต้นตระกูล");
        return;
    }

    // สร้างข้อมูลครอบครัว
    buildFamilies();

    // คำนวณระดับของครอบครัว
    buildFamilyLevels();

    // คำนวณตำแหน่ง
    layoutTree();

    // วาดต้นไม้
    drawPersonFamily(root.id);

    offsetX = 100;
    offsetY = 50;

    applyTransform();
}
// ==========================
// วาดคน + ไล่ครอบครัว
// ==========================

function drawPersonFamily(personId){

    if(drawn[personId]) return;

    const person = people[personId];
    if(!person) return;

    drawn[personId] = true;

    const pos = layout[personId];
    if(!pos) return;

    const x = pos.x + 300;
    const y = pos.y * LEVEL_HEIGHT + 80;

    createPerson(person, x, y);

    const spouses = getSpouses(person);

    if(spouses.length === 0){

        const children = getChildren(person);

        children.forEach(child=>{
            drawPersonFamily(child.id);
        });

        return;
    }

    spouses.forEach((spouse, index)=>{

        drawCouple(person, spouse, x, y, index);

    });

}

// ==========================
// วาดคู่สมรส + ลูก
// ==========================

function drawCouple(person, spouse, x, y, index){

    const sx = x + 160 + (index * 220);

    createHeart(sx - 55, y + 25);
    createPerson(spouse, sx, y);

    const centerX = (x + 45 + sx + 45) / 2;

    const children = getChildrenOfCouple(person.id, spouse.id);

    if(children.length === 0)
        return;

    drawLine(centerX, y + 90, 4, 50);

    const first = layout[children[0].id];
    const last = layout[children[children.length - 1].id];

    if(first && last){

        drawLine(
            first.x + 345,
            y + 140,
            (last.x - first.x),
            4
        );

    }

    children.forEach(child=>{

        const cpos = layout[child.id];

        if(!cpos) return;

        drawLine(
            cpos.x + 345,
            y + 140,
            4,
            80
        );

        drawPersonFamily(child.id);

    });

}
