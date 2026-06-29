const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // อ้างอิงพิกัดกระจายขอบหน้ากระดานสมดุลจาก layout.js

    // 1. วาดกล่องบุคคลทุกคนตามตำแหน่งพิกัด
    Object.keys(layout).forEach(personId => {
        const person = people[personId];
        const pos = layout[personId];
        if (person && pos) {
            createPerson(person, pos.x, pos.y);
            if (pos.x > canvasWidth) canvasWidth = pos.x;
            if (pos.y > canvasHeight) canvasHeight = pos.y;
        }
    });

    // 2. วาดเส้นคู่สมรสแนวนอนสั้น ๆ และใส่หัวใจ ❤️
    const drewHearts = new Set();
    Object.values(people).forEach(person => {
        const spouseField = person.spouse || person.spoues;
        if (spouseField) {
            spouseField.split("|").forEach(sId => {
                const partnerId = sId.trim();
                if (!partnerId) return;

                const pPos = layout[person.id];
                const sPos = layout[partnerId];

                if (pPos && sPos) {
                    const heartKey = [person.id, partnerId].sort().join("-");
                    if (!drewHearts.has(heartKey)) {
                        drawLine(pPos.x, pPos.y, sPos.x - pPos.x, 2);
                        const centerX = (pPos.x + sPos.x) / 2;
                        const centerY = (pPos.y + sPos.y) / 2;
                        createHeart(centerX - 16, centerY - 45); 
                        drewHearts.add(heartKey);
                    }
                }
            });
        }
    });

    // 3. ✅ ปรับปรุงใหม่แบบเด็ดขาด: ลากเส้นกิ่งหักเลี้ยวโดยแบ่งระดับ "ความสูง-ต่ำ (เยื้องเลน)" แยกเด็ดขาดตามแต่ละบ้าน
    // วิธีนี้จะแก้ปัญหาการจัดแถวกึ่งกลางแล้วเส้นวิ่งมาชนเกยกันเป็นคานยาวเส้นเดียวได้ 100%
    
    // สร้างตัวนับดัชนีครอบครัวในแต่ละรุ่นเพื่อใช้คำนวณระยะเยื้องเลน
    let familyIndexMap = {};

    Object.values(people).forEach(child => {
        if (!child.father && !child.mother) return;

        const childPos = layout[child.id];
        if (!childPos) return;

        const fatherPos = layout[child.father];
        const motherPos = layout[child.mother];

        let parentCenterX = 0;
        let parentCenterY = 0;
        let parentIdKey = child.father || child.mother; // ใช้ไอดีพ่อหรือแม่เป็นคีย์ระบุกลุ่มบ้าน

        if (fatherPos && motherPos) {
            parentCenterX = (fatherPos.x + motherPos.x) / 2;
            parentCenterY = fatherPos.y;
            parentIdKey = [child.father, child.mother].sort().join("-");
        } else if (fatherPos) {
            parentCenterX = fatherPos.x;
            parentCenterY = fatherPos.y;
        } else if (motherPos) {
            parentCenterX = motherPos.x;
            parentCenterY = motherPos.y;
        }

        if (parentCenterX !== 0) {
            // สุ่มจัดลำดับคิวให้แต่ละบ้านมีระนาบความสูงคานเลี้ยวไม่เท่ากัน
            if (familyIndexMap[parentIdKey] === undefined) {
                // เก็บจำนวนกลุ่มบ้านที่เจอในรุ่นความสูงระดับนี้
                let countInThisLevel = Object.keys(familyIndexMap).filter(k => k.startsWith(parentCenterY)).length;
                familyIndexMap[parentIdKey] = countInThisLevel;
            }

            // คำนวณระยะเยื้องเลนแนวตั้ง (ดึงให้แต่ละบ้านสูง-ต่ำสลับฟันปลาห่างกันทีละ 20px ไม่ให้เส้นระนาบชนกัน)
            const laneOffset = familyIndexMap[parentIdKey] * 22; 
            const dropY = parentCenterY + 45 + laneOffset; 

            // ลากเส้นดิ่งลงมาจากจุดกึ่งกลางพ่อแม่คู่ตัวจริงมาพักที่เลนตัวเอง
            drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

            // ลากเส้นแนวนอนเลี้ยวไปหาพิกัดแกน X ของตัวลูก
            if (parentCenterX <= childPos.x) {
                drawLine(parentCenterX, dropY, childPos.x - parentCenterX, 2);
            } else {
                drawLine(childPos.x, dropY, parentCenterX - childPos.x, 2);
            }

            // ลากเส้นดิ่งย่อยจากระนาบเลน ทิ่มตรงลงกึ่งกลางหัวโหนดลูกคนนั้น ๆ พอดีเป๊ะ
            drawLine(childPos.x, dropY, 2, (childPos.y - OFFSET_Y) - dropY);
        }
    });

    offsetX = 60;
    offsetY = 40;
    applyTransform();
    if (typeof resizeCanvas === "function") resizeCanvas();
}

// ฟังก์ชันสร้างวัตถุคงเดิม
function createPerson(person, x, y) {
    const div = document.createElement("div");
    div.className = "person";
    div.id = "person-" + person.id;
    div.style.left = (x - OFFSET_X) + "px";
    div.style.top = (y - OFFSET_Y) + "px";
    div.onclick = () => showPopup(person);
    const genderClass = person.gender === "ช" ? "male" : "female";
    const icon = person.gender === "ช" ? "👨" : "👩";
    div.innerHTML = `<div class="circle ${genderClass}">${icon}</div><div class="person-name">${person.name}</div>`;
    canvas.appendChild(div);
}

function createHeart(x, y) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = "❤️";
    heart.style.left = x + "px";
    heart.style.top = y + "px";
    canvas.appendChild(heart);
}

function drawLine(x, y, width, height) {
    const line = document.createElement("div");
    line.className = "line";
    line.style.left = x + "px";
    line.style.top = y + "px";
    line.style.width = width + "px";
    line.style.height = height + "px";
    canvas.appendChild(line);
}
