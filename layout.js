const NODE_WIDTH = 260;
const LEVEL_HEIGHT = 220;

let layout = {};
let nextLeafX = 0;

function getChildren(person){

    const spouses = getSpouses(person);

    return Object.values(people).filter(child=>{

        if(
            child.father==person.id ||
            child.mother==person.id
        ) return true;

        return spouses.some(spouse=>

            child.father==spouse.id ||
            child.mother==spouse.id

        );

    });

}
function calcLayout(personId, level=0){

    const person = people[personId];

    if(!person) return;

    const children = getAllChildren(person);
    
    if(children.length==0){

        layout[person.id]={
            x:nextLeafX,
            y:level
        };

        nextLeafX += NODE_WIDTH;

        return layout[person.id].x;

    }

    let first,last;

    children.forEach((child,index)=>{

        const x =
            calcLayout(child.id,level+1);

        if(index==0) first=x;

        last=x;

    });

    layout[person.id]={
        x:(first+last)/2,
        y:level
    };

    return layout[person.id].x;

}

function layoutTree(rootId){

    layout={};

    nextLeafX=0;

    calcLayout(rootId);

}
function getAllChildren(person){

    const spouses = getSpouses(person);

    let children = [];

    spouses.forEach(spouse=>{

        children.push(
            ...getChildrenOfCouple(
                person.id,
                spouse.id
            )
        );

    });

    // กรณีไม่มีคู่สมรส
    if(spouses.length==0){

        children = getChildren(person);

    }

    return children;

}
function getChildrenOfCouple(father,mother){

    return Object.values(people).filter(child=>{

        return (

            (child.father==father &&
             child.mother==mother)

            ||

            (child.father==mother &&
             child.mother==father)

        );

    });

}
function getFamilyWidth(fatherId, motherId){

    const children =
        getChildrenOfCouple(
            fatherId,
            motherId
        );

    // ไม่มีลูก
    if(children.length==0)
        return NODE_WIDTH;

    let width = 0;

    children.forEach(child=>{

        if(layout[child.id]){

            width += NODE_WIDTH;

        }

    });

    return Math.max(width, NODE_WIDTH);

}
function getSpouses(person){

    if(!person.spoues) return [];

    return person.spoues
        .split("|")
        .map(id => people[id])
        .filter(Boolean);

}
