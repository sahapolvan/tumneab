const NODE_WIDTH = 260;
const LEVEL_HEIGHT = 220;

let layoutPos = {};
let nextLeafX = 0;

function getChildren(person){

    const spouse = people[person.spoues];

    return Object.values(people).filter(child=>{

        const a =
            child.father == person.id ||
            child.mother == person.id;

        const b =
            spouse &&
            (
                child.father == spouse.id ||
                child.mother == spouse.id
            );

        return a || b;

    });

}

function calcLayout(personId, level=0){

    const person = people[personId];

    if(!person) return;

    const children = getChildren(person);

    if(children.length==0){

        layoutPos[person.id]={
            x:nextLeafX,
            y:level
        };

        nextLeafX += NODE_WIDTH;

        return layoutPos[person.id].x;

    }

    let first,last;

    children.forEach((child,index)=>{

        const x =
            calcLayout(child.id,level+1);

        if(index==0) first=x;

        last=x;

    });

    layoutPos[person.id]={
        x:(first+last)/2,
        y:level
    };

    return layoutPos[person.id].x;

}

function layoutTree(rootId){

    layoutPos={};

    nextLeafX=0;

    calcLayout(rootId);

}
