const NODE_WIDTH = 260;
const LEVEL_HEIGHT = 260;

let layout = {};

function layoutTree(rootId){

    layout = {};

    // แบ่ง Family ตาม Level
    const levels = {};

    families.forEach(family=>{

        if(!levels[family.level]){

            levels[family.level] = [];

        }

        levels[family.level].push(family);

    });

    // เรียงจากบนลงล่าง
    Object.keys(levels)
        .sort((a,b)=>a-b)
        .forEach(level=>{

            layoutLevel(
                levels[level],
                Number(level)
            );

        });

}

function layoutLevel(levelFamilies,level){

    let x = 200;

    const y =
        level * LEVEL_HEIGHT + 80;

    levelFamilies.forEach(family=>{

        family.x = x;
        family.y = y;

        // พ่อ
        if(family.father){

            layout[family.father]={

                x:x,

                y:level

            };

        }

        // แม่
        if(family.mother){

            layout[family.mother]={

                x:x+180,

                y:level

            };

        }

        x += 500;

    });

}
