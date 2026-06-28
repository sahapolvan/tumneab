let families = [];

function buildFamilies(){
    families = [];
    const map = {};

    Object.values(people).forEach(person => {
        // หากไม่มีทั้งพ่อและแม่ ให้ข้ามไปก่อน (จะถูกประมวลผลเมื่อพบโหนดคู่สมรสหรือลูก)
        if(!person.father && !person.mother) return;

        const father = person.father || "";
        const mother = person.mother || "";

        // ✅ แก้ไข: ปรับปรุงการสร้างคีย์ให้ไม่ซ้ำซ้อนกัน กรณีที่มีเฉพาะพ่อหรือแม่คนเดียว
        let key = father + "|" + mother;
        if (!father && mother) key = `single_mother|${mother}`;
        if (father && !mother) key = `${father}|single_father`;

        if(!map[key]){
            map[key] = {
                id: key,
                father: father,
                mother: mother,
                children: [],
                level: -1, // เริ่มต้นที่ -1 เพื่อรอการคำนวณ
                width: 0,
                x: 0,
                y: 0
            };
        }

        // เพิ่มไอดีลูกเข้ากลุ่มครอบครัว
        if (!map[key].children.includes(person.id)) {
            map[key].children.push(person.id);
        }
    });

    families = Object.values(map);
    console.log("Families =", families);
}

function getFamilyByParents(father, mother){
    return families.find(f => 
        (f.father == father && f.mother == mother) ||
        (f.father == mother && f.mother == father)
    );
}

function getChildFamilies(family){
    let result = [];
    if (!family || !family.children) return result;

    family.children.forEach(childId => {
        families.forEach(f => {
            // ค้นหาครอบครัวที่ลูกคนนี้ไปเป็นพ่อหรือแม่ในรุ่นถัดไป
            if(f.father == childId || f.mother == childId){
                if(!result.includes(f)) result.push(f);
            }
        });
    });
    return result;
}

// ✅ แก้ไข: ปรับปรุงการหา Root Families ให้แม่นยำขึ้น
// ครอบครัวที่เป็น Root คือครอบครัวที่ทั้งพ่อและแม่ "ไม่เป็นลูกของครอบครัวใดๆ เลยในระบบ"
function findRootFamilies(){
    return families.filter(f => {
        // ตรวจสอบว่ามีครอบครัวไหนที่มีพ่อคนนี้เป็นลูกไหม
        const hasFatherParent = families.some(parentFam => parentFam.children.includes(f.father));
        // ตรวจสอบว่ามีครอบครัวไหนที่มีแม่คนนี้เป็นลูกไหม
        const hasMotherParent = families.some(parentFam => parentFam.children.includes(f.mother));

        // ถ้าไม่มีใครเป็นลูกของครอบครัวอื่นเลย แสดงว่าเป็นต้นตระกูลสูงสุด (Root)
        return !hasFatherParent && !hasMotherParent;
    });
}

function buildFamilyLevels(){
    // รีเซ็ตค่าระดับทุกครอบครัวเป็น -1
    families.forEach(f => { f.level = -1; });

    // ค้นหาและตั้งค่าระดับให้กับ Root Family เริ่มต้นที่ระดับ 0
    const roots = findRootFamilies();
    console.log("Roots Identified =", roots);

    roots.forEach(root => {
        // ใช้ Set เพื่อป้องกันการเกิดลูปนรก (Infinite Loop Stack Overflow)
        const visited = new Set();
        setFamilyLevel(root, 0, visited);
    });
}

// ✅ แก้ไข: เพิ่มพารามิเตอร์ visited Set เพื่อป้องกันปัญหาผังแต่งงานวนลูปจนบราวเซอร์ค้าง
function setFamilyLevel(family, level, visited){
    if(!family) return;
    if(visited.has(family.id)) return; // หากเคยคำนวณครอบครัวนี้ในลูปนี้แล้ว ให้หยุดทันที

    // หากครอบครัวนี้เคยมีระดับที่คำนวณไว้สูงกว่า (อยู่รุ่นลึกกว่า) ให้คงค่าเดิมไว้เพื่อไม่ให้ผังเบี้ยว
    if(family.level !== -1 && family.level >= level) return;

    family.level = level;
    visited.add(family.id);

    // ดึงครอบครัวของลูกๆ เพื่อไปคำนวณระดับในรุ่นถัดไป (Level + 1)
    const childs = getChildFamilies(family);
    childs.forEach(child => {
        // ส่งต่อตัวแปร visited แบบคัดลอกค่าไปใช้ในสายตระกูลนั้นๆ
        setFamilyLevel(child, level + 1, new Set(visited));
    });
}
