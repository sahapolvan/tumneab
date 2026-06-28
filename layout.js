const NODE_WIDTH = 260;
const LEVEL_HEIGHT = 260;

let layout = {};

function layoutTree(){

    layout = {};

    // คำนวณระดับ Family
    buildFamilyLevels();

    // แยกตามรุ่น
    const rows = {};

    families.forEach(f=>{

        if(!rows[f.level])
            rows[f.level]=[];

        rows[f.level].push(f);

    });

    // วางแต่ละรุ่น
    Object.keys(rows).forEach(level=>{

        layoutRow(
            rows[level],
            Number(level)
        );

    });

}
function layoutRow(familiesInRow, level){

    let x = 200;

    const y = level * LEVEL_HEIGHT + 80;

    familiesInRow.forEach(family=>{

        const father = people[family.father];
        const mother = people[family.mother];

        family.x = x;
        family.y = y;

        // วางพ่อ
        if(father){

            layout[father.id] = {
                x: x,
                y: level
            };

        }

        // วางแม่
        if(mother){

            layout[mother.id] = {
                x: x + 180,
                y: level
            };

        }

        // คำนวณพื้นที่ครอบครัว
        const width = getFamilyWidth(family);

        x += width;

    });

}
function getFamilyWidth(family){

    const father = people[family.father];
    const mother = people[family.mother];

    const childrenCount = family.children.length;

    let base = 220;

    if(father && mother){
        base = 320;
    }

    const childSpace = childrenCount * 140;

    return Math.max(base, childSpace + 120);

}
