
let families = [];

function buildFamilies(){

    families = [];

    const map = {};

    Object.values(people).forEach(person=>{

        if(!person.father && !person.mother)
            return;

        const father = person.father || "";
        const mother = person.mother || "";

        const key = father + "|" + mother;

        if(!map[key]){

            map[key]={

                id:key,

                father:father,

                mother:mother,

                children:[],

                level:0,

                width:0,

                x:0,

                y:0

            };

        }

        map[key].children.push(person.id);

    });

    families = Object.values(map);

}
function getFamilyByParents(father,mother){

    return families.find(f=>

        (f.father==father && f.mother==mother)

        ||

        (f.father==mother && f.mother==father)

    );

}
function getChildFamilies(family){

    let result=[];

    family.children.forEach(id=>{

        families.forEach(f=>{

            if(
                f.father==id ||
                f.mother==id
            ){

                if(!result.includes(f))
                    result.push(f);

            }

        });

    });

    return result;

}
function findRootFamilies(){

    return families.filter(f=>{

        return !f.father || !f.mother;

    });

}

/* ==========================
   Generation
========================== */

let generations = [];

/* ==========================
   สร้าง Generation
========================== */

function buildGenerations(rootId){

    generations = [];

    let current = [rootId];

    while(current.length){

        generations.push(current);

        let next = [];

        current.forEach(id=>{

            const person = people[id];

            if(!person) return;

            const children = getChildren(person);

            children.forEach(child=>{

                if(!next.includes(child.id)){

                    next.push(child.id);

                }

            });

        });

        current = next;

    }

}
