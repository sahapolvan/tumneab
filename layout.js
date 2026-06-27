const NODE_WIDTH = 260;
const LEVEL_HEIGHT = 220;

let layout = {};
let nextLeafX = 0;

// ==========================
// คืนคู่สมรสทั้งหมด
// ==========================

function getSpouses(person){

    if(!person)
        return [];

    if(!person.spoues)
        return [];

    return person.spoues
        .split("|")
        .map(id => people[id])
        .filter(Boolean);

}

// ==========================
// ลูกของคู่หนึ่ง
// ==========================

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

// ==========================
// ลูกทั้งหมดของคนนี้
// ==========================

function getChildren(person){

    let result=[];

    // ลูกของทุกคู่สมรส

    getSpouses(person).forEach(spouse=>{

        result.push(

            ...getChildrenOfCouple(
                person.id,
                spouse.id
            )

        );

    });

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

// ==========================
// ความกว้างของครอบครัว
// ==========================

function getFamilyWidth(personId){

    const person = people[personId];

    if(!person)
        return NODE_WIDTH;

    const children =
        getChildren(person);

    if(children.length==0)
        return NODE_WIDTH;

    let width = 0;

    children.forEach(child=>{

        width +=
            getFamilyWidth(child.id);

    });

    return Math.max(
        width,
        NODE_WIDTH
    );

}
