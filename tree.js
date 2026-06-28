let drawn = {};

// ==========================
// วาดต้นไม้ทั้งหมด
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

    layoutTree(root.id);
buildGenerations(root.id);
    drawFamily(root.id);

    offsetX = 100;
    offsetY = 50;

    applyTransform();

}

// ==========================
// วาดครอบครัว
// ==========================

function drawFamily(personId){

    if(drawn[personId])
        return;

    const person = people[personId];

    if(!person)
        return;

    drawn[personId]=true;

    const pos = layout[personId];

    if(!pos)
        return;

    const x = pos.x + 300;
    const y = pos.y * LEVEL_HEIGHT + 80;

    createPerson(
        person,
        x,
        y
    );

    const spouses = getSpouses(person);

    // ไม่มีคู่สมรส
    if(spouses.length==0){

        const children=getChildren(person);

        children.forEach(child=>{

            drawFamily(child.id);

        });

        return;

    }

    let currentX = x + 160;

    spouses.forEach(spouse=>{

        drawCouple(
            person,
            spouse,
            x,
            y,
            currentX
        );

        currentX += getCoupleWidth(
            person,
            spouse
        );

    });

}
// ==========================
// วาด 1 คู่สมรส
// ==========================

function drawCouple(
    person,
    spouse,
    personX,
    personY,
    spouseX
){

    createHeart(
        spouseX - 55,
        personY + 25
    );

    createPerson(
        spouse,
        spouseX,
        personY
    );

    const centerX =
        (personX + 45 + spouseX + 45) / 2;

    const children =
        getChildrenOfCouple(
            person.id,
            spouse.id
        );

    if(children.length==0)
        return;

    // เส้นลง
    drawLine(
        centerX,
        personY + 90,
        4,
        50
    );

    const first =
        layout[children[0].id];

    const last =
        layout[
            children[
                children.length-1
            ].id
        ];

    // เส้นแนวนอน
    drawLine(
        first.x + 345,
        personY + 140,
        (last.x-first.x),
        4
    );

    children.forEach(child=>{

        drawLine(
            layout[child.id].x + 345,
            personY + 140,
            4,
            80
        );

        drawFamily(child.id);

    });

}
// ==========================
// คำนวณความกว้างของครอบครัว
// ==========================

function getCoupleWidth(person, spouse){

    const children =
        getChildrenOfCouple(
            person.id,
            spouse.id
        );

    // ไม่มีลูก
    if(children.length==0){

        return 220;

    }

    let first =
        layout[children[0].id].x;

    let last =
        layout[
            children[
                children.length-1
            ].id
        ].x;

    // ความกว้างของกลุ่มลูก
    let width = last - first + NODE_WIDTH;

    // อย่างน้อยต้องห่าง 220
    if(width < 220)
        width = 220;

    // เว้นช่องระหว่างครอบครัว
    return width + 120;

}


