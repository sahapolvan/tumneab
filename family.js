/* ==========================
   Family Groups
========================== */

let families = [];

/* ==========================
   สร้าง Family Group
========================== */

function buildFamilies(){

    families = [];

    const map = {};

    Object.values(people).forEach(person=>{

        if(!person.father && !person.mother)
            return;

        const father =
            person.father || "";

        const mother =
            person.mother || "";

        const key =
            father + "|" + mother;

        if(!map[key]){

            map[key]={

                father,

                mother,

                children:[]

            };

        }

        map[key].children.push(
            person.id
        );

    });

    families = Object.values(map);

}
