let drawn = {};

// ==========================
// เริ่มวาดต้นไม้
// ==========================
function drawTree(){
    canvas.innerHTML = "";
    drawn = {}; // เคลียร์สถานะการวาดบุคคล

    // ค้นหาโหนดต้นตระกูลสูงสุดตามชื่อที่ต้องการ
    const root = Object.values(people).find(p => p.name === "เภา");

    if(!root){
        alert("ไม่พบต้นตระกูลชื่อ 'เภา' ในระบบ");
        return;
    }

    // 1. จัดเตรียมโครงสร้างความสัมพันธ์และคำนวณพิกัดสเปซล่วงหน้า
    buildFamilies();
    buildFamilyLevels();
    layoutTree();

    // 2. เริ่มต้นวิ่งวาดตามสายเลือดจากโหนดราก
    drawPersonFamily(root.id);

    // 3. กำหนดตำแหน่งมุมมองเริ่มต้นให้สวยงาม
    offsetX = 100;
    offsetY = 50;
    applyTransform();
    
    // อัปเดตขนาดพื้นที่แคนวาสรองรับระบบลากผัง
    if (typeof resizeCanvas === "function") {
        resizeCanvas();
    }
}

// ==========================
// วาดคน + ไล่สายครอบครัว
// ==========================
function drawPersonFamily(personId){
    // ดักจับกรณีที่บุคคลนี้ถูกวาดขึ้นจอไปแล้ว เพื่อป้องกันปัญหาโหนดซ้อนทับกัน
    if(drawn[personId]) return;

    const person = people[personId];
    if(!person) return;

    const pos = layout[personId];
    if(!pos) return;

    // ✅ ปรับแก้: ดึงพิกัด X, Y พิกเซลที่คำนวณเสร็จแล้วจาก Layout ตรงๆ (ไม่บวก/คูณซ้ำ)
    const x = pos.x;
    const y = pos.y;

    // สั่งวาดกล่องบุคคลหลักลงบนแคนวาส และบันทึกสถานะ
    createPerson(person, x, y);
    drawn[personId] = true;

    const spouses = getSpouses(person);

    // กรณีไม่มีคู่สมรส ให้ขยับไปไล่วาดที่กลุ่มลูกโดยตรง (ถ้ามี)
    if(spouses.length === 0){
        const children = getChildren(person);
        children.forEach(child => {
            drawPersonFamily(child.id);
        });
        return;
    }

    // มีคู่สมรส -> วาดคู่สมรสและเส้นสายใยร่วมกัน
    spouses.forEach((spouse, index) => {
        drawCouple(person, spouse, x, y, index);
    });
}

// ==========================
// วาดคู่สมรส + เส้นเชื่อมโยงลูก
// ==========================
function drawCouple(person, spouse, x, y, index){
    // ป้องกันกรณีที่คู่สมรสเคยถูกวาดในฐานะสายเลือดหลักไปแล้ว
    if(drawn[spouse.id]) return;

    // คำนวณตำแหน่งกล่องคู่สมรสให้เยื้องไปทางขวาตามลำดับ index คู่ครอง
    const spouseOffset = 140; 
    const sx = x + spouseOffset + (index * 60);
    const sy = y;

    // วาดไอคอนหัวใจตรงกลางระหว่างพิกัดทั้งสองคน
    const centerX = (x + sx) / 2;
    createHeart(centerX - 16, y - 16);

    // วาดกล่องคู่สมรสและบันทึกสถานะลงทะเบียนหน้าจอ
    createPerson(spouse, sx, sy);
    drawn[spouse.id] = true;

    const children = getChildrenOfCouple(person.id, spouse.id);
    if(children.length === 0) return;

    // ✅ ปรับแก้: เปลี่ยนไปใช้ฟังก์ชันลากเส้นเชื่อมพิกัดอัจฉริยะ (drawLineBetweenPoints) 
    // แทนการใช้เลขฮาร์ดโค้ดเดิม เพื่อให้เส้นยึดเกาะกึ่งกลางวัตถุพอดี
    children.forEach(child => {
        const cpos = layout[child.id];
        if(cpos) {
            // ลากเส้นเฉียงจากจุดหัวใจกึ่งกลางพ่อแม่ วิ่งตรงดิ่งไปหาจุดศูนย์กลางของลูกแต่ละคน
            if (typeof drawLineBetweenPoints === "function") {
                drawLineBetweenPoints(centerX, y, cpos.x, cpos.y);
            } else {
                drawLine(centerX, y, cpos.x - centerX, cpos.y - y);
            }
            
            // วนลูปต่อเนื่องเพื่อไปไล่สายตระกูลย่อยของลูกคนนั้นๆ
            drawPersonFamily(child.id);
        }
    });
}

// ==========================
// ฟังก์ชันดึงข้อมูลความสัมพันธ์ (Helper Functions)
// ==========================
function getSpouses(person){
    // ✅ ปรับแก้: แก้ไขคำสะกดผิดจาก person.spoues เป็น person.spouse
    if(!person || !person.spouse) return [];

    return person.spouse
        .split("|")
        .map(id => people[id.trim()])
        .filter(Boolean);
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
