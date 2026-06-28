
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

        const father =
            people[f.father];

        const mother =
            people[f.mother];

        const fatherHasParent =
            father &&
            (
                father.father ||
                father.mother
            );

        const motherHasParent =
            mother &&
            (
                mother.father ||
                mother.mother
            );

        return !fatherHasParent &&
               !motherHasParent;

    });

}


function buildFamilyLevels(){

    // รีเซ็ต
    families.forEach(f=>{

        f.level = -1;

    });

    // หา Root Family
    const roots =
    findRootFamilies();

roots.forEach(root=>{

    setFamilyLevel(root,0);

});

}
function setFamilyLevel(family,level){

    if(!family) return;

    if(
        family.level!=-1 &&
        family.level<=level
    ) return;

    family.level = level;

    const childs =
        getChildFamilies(family);

    childs.forEach(child=>{

        setFamilyLevel(
            child,
            level+1
        );

    });

}
