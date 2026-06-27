const NODE_WIDTH = 260;
const LEVEL_HEIGHT = 220;

let layout = {};
let nextLeafX = 0;

/* ==========================
   คืนคู่สมรสทั้งหมด
========================== */

function getSpouses(person){

    if(!person || !person.spoues)
        return [];

    return person.spoues
        .split("|")
        .map(id => people[id])
        .filter(Boolean);

}

/* ==========================
   ลูกของคู่หนึ่ง
========================== */

function getChildrenOfCouple(id1,id2){

    return Object.values(people).filter(child=>{

        return (

            (child.father==id1 &&
             child.mother==id2)

            ||

            (child.father==id2 &&
             child.mother==id1)

        );

    });

}

/* ==========================
   ลูกทั้งหมดของคนนี้
========================== */

function getChildren(person){

    let result=[];

    const spouses=getSpouses(person);

    if(spouses.length){

        spouses.forEach(spouse=>{

            result.push(

                ...getChildrenOfCouple(
                    person.id,
                    spouse.id
                )

            );

        });

    }

    // ลูกที่ไม่มีข้อมูลคู่สมรส

    Object.values(people).forEach(child=>{

        if(

            child.father==person.id ||

            child.mother==person.id

        ){

            if(!result.includes(child))

                result.push(child);

        }

    });

    return result;

}

/* ==========================
   ความกว้างของครอบครัว
========================== */

function getFamilyWidth(personId){

    const person=people[personId];

    if(!person)
        return NODE_WIDTH;

    const children=getChildren(person);

    if(children.length==0)
        return NODE_WIDTH;

    let width=0;

    children.forEach(child=>{

        width+=getFamilyWidth(child.id);

    });

    return Math.max(width,NODE_WIDTH);

}

/* ==========================
   คำนวณตำแหน่ง
========================== */

function calcLayout(personId,level=0){

    const person=people[personId];

    if(!person) return;

    const children=getChildren(person);

    if(children.length==0){

        layout[person.id]={

            x:nextLeafX,

            y:level

        };

        nextLeafX+=NODE_WIDTH;

        return layout[person.id].x;

    }

    let firstX=null;
    let lastX=null;

    children.forEach(child=>{

        const x=calcLayout(
            child.id,
            level+1
        );

        if(firstX===null)
            firstX=x;

        lastX=x;

    });

    layout[person.id]={

        x:(firstX+lastX)/2,

        y:level

    };

    return layout[person.id].x;

}

/* ==========================
   เริ่มคำนวณผัง
========================== */

function layoutTree(rootId){

    layout={};

    nextLeafX=0;

    calcLayout(rootId);

}
