let drawn = {};

// ==========================
// เริ่มวาดต้นไม้
// ==========================
function drawTree(){
    canvas.innerHTML = "";
    drawn = {}; // รีเซ็ตสถานะการวาด

    // ค้นหาโหนดต้นตระกูล (ไอดี 1: เภา)
    const root = Object.values(people).find(p => p.name === "เภา" || p.id == "1");

    if(!root){
        alert("ไม่พบต้นตระกูล (เภา)");
        return;
    }

    // 1. รันระบบคำนวณความสัมพันธ์และจัดสรรสเปซช่องไฟโครงสร้างทั้งหมด
    buildFamilies();
    buildFamilyLevels();
    layoutTree();

    // 2. สั่งวาดทุกคนในระบบตามตำแหน่งพิกัดที่แท้จริงจาก Layout
    // วิธีนี้จะแก้ปัญหา "คนโสดชื่อหาย" และ "ชื่อทับกัน" ได้ถาวร เพราะทุกคนมีตำแหน่งประจำของตัวเอง
    Object.keys(layout).forEach(personId => {
        const person = people[personId];
        const pos = layout[personId];
        
        if (person && pos && !drawn[personId]) {
            createPerson(person, pos.x, pos.y);
            drawn[personId] = true;
        }
    });

    // 3. วาดเส้นเชื่อมโยงความสัมพันธ์ และ ไอคอนหัวใจ ❤️
    if (typeof families !== "undefined") {
        families.forEach(family => {
            const fatherPos = layout[family.father];
            const motherPos = layout[family.mother];

            let parentCenterX = 0;
            let parentCenterY = 0;

            // กรณีมีคู่สมรส (มีทั้งพ่อและแม่) -> ลากเส้นแต่งงานและใส่หัวใจตรงกลาง
            if (fatherPos && motherPos) {
                if (typeof drawLineBetweenPoints === "function") {
                    drawLineBetweenPoints(fatherPos.x, fatherPos.y, motherPos.x, motherPos.y);
                } else {
                    drawLine(fatherPos.x, fatherPos.y, motherPos.x - fatherPos.x, 2);
                }
                
                parentCenterX = (fatherPos.x + motherPos.x) / 2;
                parentCenterY = (fatherPos.y + motherPos.y) / 2;
                createHeart(parentCenterX - 16, parentCenterY - 45); // ปรับตำแหน่งหัวใจให้อยู่ระหว่างคู่รัก
            } else if (fatherPos) {
                parentCenterX = fatherPos.x;
                parentCenterY = fatherPos.y;
            } else if (motherPos) {
                parentCenterX = motherPos.x;
                parentCenterY = motherPos.y;
            }

            // ลากเส้นจากจุดกึ่งกลางพ่อแม่ ดิ่งลงไปหาลูกๆ ทุกคนในครอบครัวนั้น
            if (family.children && parentCenterX !== 0) {
                family.children.forEach(childId => {
                    const childPos = layout[childId];
                    if (childPos) {
                        if (typeof drawLineBetweenPoints === "function") {
                            // ลากเส้นตรงจากจุดเชื่อมโยงพ่อแม่ไปยังลูกแต่ละคน
                            drawLineBetweenPoints(parentCenterX, parentCenterY, childPos.x, childPos.y);
                        } else {
                            drawLine(parentCenterX, parentCenterY, childPos.x - parentCenterX, childPos.y - parentCenterY);
                        }
                    }
                });
            }
        });
    }

    // จัดตำแหน่งมุมมองหน้าจอเริ่มต้น
    offsetX = 50;
    offsetY = 50;
    applyTransform();
    
    if (typeof resizeCanvas === "function") {
        resizeCanvas();
    }
}

// โน้ต: ฟังก์ชันเสริมด้านล่างนี้ยังคงเก็บไว้เพื่อให้ระบบส่วนอื่นไม่พัง
function getSpouses(person){
    const spouseField = person.spouse || person.spoues; // รองรับทั้งสะกดถูกและสะกดผิดในตารางข้อมูล
    if(!spouseField) return [];
    return spouseField.split("|").map(id => people[id.trim()]).filter(Boolean);
}

function getChildrenOfCouple(fatherId, motherId){
    return Object.values(people).filter(child => {
        return (
            (child.father == fatherId && child.mother == motherId) ||
            (child.father == motherId && child.mother == fatherId)
        );
    });
}

function getChildren(person){
    let result = [];
    getSpouses(person).forEach(spouse => {
        result.push(...getChildrenOfCouple(person.id, spouse.id));
    });
    Object.values(people).forEach(child => {
        if(child.father == person.id || child.mother == person.id){
            if(!result.includes(child)) result.push(child);
        }
    });
    return result;
}
