let drawnFamilies = {};

// ==========================
// วาดต้นไม้ทั้งหมด
// ==========================

function drawTree(){

    canvas.innerHTML = "";

    drawnFamilies = {};

    const roots = findRootFamilies();

    if(roots.length===0){

        alert("ไม่พบต้นตระกูล");

        return;

    }

    layoutTree();

    roots.forEach(family=>{

        drawFamilyGroup(family);

    });

    offsetX = 100;
    offsetY = 50;

    applyTransform();

}

// ==========================
// วาด Family Group
// ==========================

function drawFamilyGroup(family){

    if(!family) return;

    if(drawnFamilies[family.id])
        return;

    drawnFamilies[family.id]=true;

    const father =
        people[family.father];

    const mother =
        people[family.mother];

    const x = family.x;
    const y = family.y;

    let centerX = x;

    // วาดพ่อ

    if(father){

        createPerson(
            father,
            x,
            y
        );

        centerX = x + 45;

    }

    // วาดแม่

    if(mother){

        const motherX =
            father ? x + 180 : x;

        createPerson(
            mother,
            motherX,
            y
        );

        if(father){

            createHeart(
                motherX - 55,
                y + 25
            );

            centerX =
                (x + 45 + motherX + 45)/2;

        }else{

            centerX =
                motherX + 45;

        }

    }
        // ==========================
    // วาดลูกของ Family
    // ==========================

    if(family.children.length==0)
        return;

    drawLine(
        centerX,
        y + 90,
        4,
        50
    );

    const first =
        layout[family.children[0]];

    const last =
        layout[
            family.children[
                family.children.length-1
            ]
        ];

    if(first && last){

        drawLine(
            first.x + 345,
            y + 140,
            last.x - first.x,
            4
        );

    }

    family.children.forEach(id=>{

        const pos = layout[id];

        if(!pos) return;

        drawLine(
            pos.x + 345,
            y + 140,
            4,
            80
        );

        const child = people[id];

        if(child){

            createPerson(
                child,
                pos.x + 300,
                pos.y * LEVEL_HEIGHT + 80
            );

        }

        // ถ้าลูกมีครอบครัว ให้วาดต่อ
        families.forEach(nextFamily=>{

            if(
                nextFamily.father==id ||
                nextFamily.mother==id
            ){

                drawFamilyGroup(nextFamily);

            }

        });

    });

}
