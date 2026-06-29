const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // ดึงพิกัดโซนจาก layout.js

    // 1. วาดระบบเส้นแต่งงานแนวนอน และรูปหัวใจ ❤️ (แก้ไขให้วางตรงกลางคู่ใครคู่มันอย่างถูกต้อง)
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
                        // ลากเส้นแนวนอนสั้น ๆ เชื่อมคู่รักที่อยู่ติดกัน
                        drawLine(pPos.x, pPos.y, sPos.x - pPos.x, 2);

                        // ✅ แก้ไขใหม่: คำนวณจุดกึ่งกลางระหว่างคู่นั้น ๆ จริง ๆ ป้องกันหัวใจบินไปกองรวมกัน
                        const centerX = (pPos.x + sPos.x) / 2;
                        const centerY = (pPos.y + sPos.y) / 2;
                        createHeart(centerX - 16, centerY - 45); // วางเหนือนามสกุล
                        drewHearts.add(heartKey);
                    }
                }
            });
        }
    });

    // 2. ✅ แก้ไขใหม่: ลากเส้นกิ่งแบบ "หย่อนดิ่งพ้นชื่อก่อนค่อยเลี้ยวหักมุม" แยกอิสระขาดจากกัน
    Object.values(people).forEach(child => {
        if (!child.father && !child.mother) return;

        const childPos = layout[child.id];
        if (!childPos) return;

        const fatherPos = layout[child.father];
        const motherPos = layout[child.mother];

        let parentCenterX = 0;
        let parentCenterY = 0;

        if (fatherPos && motherPos) {
            parentCenterX = (fatherPos.x + motherPos.x) / 2;
            parentCenterY = fatherPos.y;
        } else if (fatherPos) {
            parentCenterX = fatherPos.x;
            parentCenterY = fatherPos.y;
        } else if (motherPos) {
            parentCenterX = motherPos.x;
            parentCenterY = motherPos.y;
        }

        if (parentCenterX !== 0) {
            // ✅ แก้ไขใหม่: ขยับระยะหักเลี้ยวแนวนอนให้หย่อนลึกลงมา (130px) ให้ดิ่งพ้นชื่อพ่อแม่ลงมาก่อนค่อยเลี้ยว
            // และปรับระยะรุ่นแรก (เภา-สวัสดิ์ parentCenterY == 100) ให้สั้นกระชับลงมาเป็นพิเศษตามที่น้าสั่ง
            const dropY = parentCenterY === 100 ? parentCenterY + 80 : parentCenterY + 120; 

            // ลากเส้นดิ่งแกนหลักลงมาจากจุดกึ่งกลางคู่แต่งงานพุ่งลงมาพักที่เลนตัวเอง
            drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

            // ลากเส้นแนวนอนเลี้ยวไปหาพิกัดแกน X ของตัวลูก
            if (parentCenterX <= childPos.x) {
                drawLine(parentCenterX, dropY, childPos.x - parentCenterX, 2);
            } else {
                drawLine(childPos.x, dropY, parentCenterX - childPos.x, 2);
            }

            // ลากเส้นดิ่งย่อยจากสะพานระนาบ ทิ่มตรงลงกึ่งกลางหัวโหนดลูกคนนั้น ๆ พอดีเป๊ะ
            drawLine(childPos.x, dropY, 2, (childPos.y - OFFSET_Y) - dropY);
        }
    });

    // 3. วาดกล่องบุคคลทุกคน (เอามาวาดขั้นตอนสุดท้าย เพื่อให้โหนดรูปคนทับอยู่ด้านบนของเส้นเชื่อม)
    Object.keys(layout).forEach(personId => {
        const person = people[personId];
        const pos = layout[personId];
        if (person && pos) {
            createPerson(person, pos.x, pos.y);
            if (pos.x > canvasWidth) canvasWidth = pos.x;
            if (pos.y > canvasHeight) canvasHeight = pos.y;
        }
    });

    offsetX = 60;
    offsetY = 40;
    applyTransform();
    if (typeof resizeCanvas === "function") resizeCanvas();
}

// ==========================================
// ฟังก์ชันย่อยสำหรับสร้างองค์ประกอบ (ปรับแต่งสไตล์ความเรียบร้อย)
// ==========================================
function createPerson(person, x, y) {
    const div = document.createElement("div");
    div.className = "person";
    div.id = "person-" + person.id;
    div.style.left = (x - OFFSET_X) + "px";
    div.style.top = (y - OFFSET_Y) + "px";
    
    // ✅ เพิ่มเติม: บังคับให้โหนดรูปคนอยู่เลเยอร์หน้าสุดเสมอ บังเส้นเชื่อมด้านหลัง
    div.style.zIndex = "10"; 

    div.onclick = () => showPopup(person);

    const genderClass = person.gender === "ช" ? "male" : "female";
    const icon = person.gender === "ช" ? "👨" : "👩";

    div.innerHTML = `
        <div class="circle ${genderClass}">
            ${icon}
        </div>
        <div class="person-name">
            ${person.name}
        </div>
    `;
    canvas.appendChild(div);
}

function createHeart(x, y) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = "❤️";
    heart.style.left = x + "px";
    heart.style.top = y + "px";
    // ✅ เพิ่มเติม: ให้หัวใจลอยอยู่ชั้นหน้าเพื่อความชัดเจน
    heart.style.zIndex = "11"; 
    canvas.appendChild(heart);
}

function drawLine(x, y, width, height) {
    const line = document.createElement("div");
    line.className = "line";
    line.style.left = x + "px";
    line.style.top = y + "px";
    line.style.width = width + "px";
    line.style.height = height + "px";
    
    // ✅ เพิ่มเติม: ซ่อนเส้นเชื่อมความสัมพันธ์ไว้เลเยอร์หลังสุด ไม่ให้พาดบังหน้าไอคอนและชื่อคน
    line.style.zIndex = "1"; 
    
    canvas.appendChild(line);
}
