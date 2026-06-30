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
        const father = people[family.father];
        const mother = people[family.mother];

        let parentCenterX = 0;
        let parentCenterY = 0;

        // เช็กว่าฝ่ายชาย หรือ ฝ่ายหญิง มีคู่สมรสหลายคนหรือไม่
        const fatherHasMultipleSpouses = father ? getSpouses(father).length > 1 : false;
        const motherHasMultipleSpouses = mother ? getSpouses(mother).length > 1 : false;

        if (fatherPos && motherPos) {
            // เฉพาะกรณีที่มีคู่หลายคน: ให้เช็กว่าใครเป็นเขย/สะใภ้ (คนที่แต่งเข้าบ้านที่มีหลายคู่)
            if (fatherHasMultipleSpouses && !motherHasMultipleSpouses) {
                // ถ้าพ่อมีเมียหลายคน -> ให้เส้นลูกลากออกจากพิกัดของ "แม่" (สะใภ้) โดยตรง
                parentCenterX = motherPos.x;
                parentCenterY = motherPos.y;
            } else if (motherHasMultipleSpouses && !fatherHasMultipleSpouses) {
                // ถ้าแม่มีผัวหลายคน -> ให้เส้นลูกลากออกจากพิกัดของ "พ่อ" (เขย) โดยตรง
                parentCenterX = fatherPos.x;
                parentCenterY = fatherPos.y;
            } else {
                // กรณีปกติ (ผัวเดียวเมียเดียว หรือแต่งซ้อนทั้งคู่): ลากออกจากจุดกึ่งกลางระหว่างพ่อแม่ตามเดิม
                parentCenterX = (fatherPos.x + motherPos.x) / 2;
                parentCenterY = (fatherPos.y + motherPos.y) / 2;
            }
        } else if (fatherPos) {
            parentCenterX = fatherPos.x;
            parentCenterY = fatherPos.y;
        } else if (motherPos) {
            parentCenterX = motherPos.x;
            parentCenterY = motherPos.y;
        }

        // --- ท่อนลากเส้นดิ่งลงมาหาลูกๆ (แบบหักมุมเพื่อหลบโหนดตามที่แนะนำก่อนหน้า) ---
        if (family.children && parentCenterX !== 0) {
            family.children.forEach(childId => {
                const childPos = layout[childId];
                if (childPos) {
                    // คำนวณจุดกึ่งกลางแนวตั้งทำเป็นระเบียงทางเดิน
                    const midY = (parentCenterY + childPos.y) / 2;

                    if (typeof drawLineBetweenPoints === "function") {
                        drawLineBetweenPoints(parentCenterX, parentCenterY, parentCenterX, midY);
                        drawLineBetweenPoints(parentCenterX, midY, childPos.x, midY);
                        drawLineBetweenPoints(childPos.x, midY, childPos.x, childPos.y);
                    } else {
                        drawLine(parentCenterX, parentCenterY, 0, midY - parentCenterY); 
                        drawLine(parentCenterX, midY, childPos.x - parentCenterX, 0);   
                        drawLine(childPos.x, midY, 0, childPos.y - midY);               
                    }
                }
            });
        }
    });
}
    
    // 3. วาดเส้นเชื่อมโยงความสัมพันธ์ และ ไอคอนหัวใจ ❤️
   /* if (typeof families !== "undefined") {
        families.forEach(family => {
            const fatherPos = layout[family.father];
            const motherPos = layout[family.mother];

            let parentCenterX = 0;
            let parentCenterY = 0;

    // 3. วาดเส้นเชื่อมโยงความสัมพันธ์ และ ไอคอนหัวใจ ❤️
    if (typeof families !== "undefined") {
        families.forEach(family => {
            const fatherPos = layout[family.father];
            const motherPos = layout[family.mother];

            let parentCenterX = 0;
            let parentCenterY = 0;

            // ❌ ลบหรือปิดตรรกะวาดเส้นแต่งงานและ createHeart ตรงนี้ออกไปเลยครับน้า
            // ❌ เพราะ draw.js มันจัดการวาดให้ครบและตรงคู่สมบูรณ์แบบอยู่แล้ว
            if (fatherPos && motherPos) {
                parentCenterX = (fatherPos.x + motherPos.x) / 2;
                parentCenterY = (fatherPos.y + motherPos.y) / 2;
                // createHeart(parentCenterX - 16, parentCenterY - 45); // 👈 ลบหรือปิดบรรทัดนี้ทิ้งเด็ดขาด
            } else if (fatherPos) {
                parentCenterX = fatherPos.x;
                parentCenterY = fatherPos.y;
            } else if (motherPos) {
                parentCenterX = motherPos.x;
                parentCenterY = motherPos.y;
            }

            // คงท่อนลากเส้นดิ่งลงมาหาลูกๆ นี้ไว้ใน tree.js ตามเดิม (หรือถ้า draw.js มีท่อนนี้แล้วก็ปิดได้ครับ)
            if (family.children && parentCenterX !== 0) {
                family.children.forEach(childId => {
                    const childPos = layout[childId];
                    if (childPos) {
                        if (typeof drawLineBetweenPoints === "function") {
                            drawLineBetweenPoints(parentCenterX, parentCenterY, childPos.x, childPos.y);
                        } else {
                            drawLine(parentCenterX, parentCenterY, childPos.x - parentCenterX, childPos.y - parentCenterY);
                        }
                    }
                });
            }
        });
    }

*/
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
