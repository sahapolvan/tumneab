const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // อ้างอิงพิกัดจัดแถวจาก layout.js

    // 1. วาดกล่องบุคคลทุกคนตามตำแหน่งพิกัดที่ถูกต้อง
    Object.keys(layout).forEach(personId => {
        const person = people[personId];
        const pos = layout[personId];
        if (person && pos) {
            createPerson(person, pos.x, pos.y);
            if (pos.x > canvasWidth) canvasWidth = pos.x;
            if (pos.y > canvasHeight) canvasHeight = pos.y;
        }
    });

    // 2. วาดรูปหัวใจ ❤️ เชื่อมคู่สมรสทุกคู่
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
                        // ลากเส้นแต่งงานสั้น ๆ ระหว่างคู่สมรส
                        drawLine(pPos.x, pPos.y, sPos.x - pPos.x, 2);

                        // วางหัวใจตรงกลางเหนือเส้นแต่งงาน
                        const centerX = (pPos.x + sPos.x) / 2;
                        const centerY = (pPos.y + sPos.y) / 2;
                        createHeart(centerX - 16, centerY - 45);
                        drewHearts.add(heartKey);
                    }
                }
            });
        }
    });

    // 3. ✅ ปรับปรุงใหม่: ลากเส้นกิ่งก้านสายสัมพันธ์หักมุมฉากแบบแม่นยำสูง (อิงตามหัวโหนดลูกจริง)
    if (typeof families !== "undefined") {
        families.forEach(family => {
            // หาตำแหน่งของพ่อและแม่
            const fatherPos = layout[family.father];
            const motherPos = layout[family.mother];
            
            let parentCenterX = 0;
            let parentCenterY = 0;

            // หาจุดกึ่งกลางระหว่างคู่รักเพื่อเป็นจุดปล่อยเส้นดิ่งหลักลงมา
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

            // ถ้าครอบครัวนี้มีลูก ให้ปล่อยเส้นกิ่งหักมุมฉาก
            if (family.children && family.children.length > 0 && parentCenterX !== 0) {
                
                // ตรวจสอบพิกัดของลูกทุกคนที่มีอยู่ใน layout จริง
                const childPositions = family.children.map(id => layout[id]).filter(Boolean);
                
                if (childPositions.length > 0) {
                    // ระยะดิ่งลงมาจากแถวพ่อแม่ (กึ่งกลางระหว่างแถวพอดี)
                    const dropY = parentCenterY + 110; 

                    // 1. ลากเส้นดิ่งแกนหลักลงมาจากจุดกึ่งกลางพ่อแม่ มาพักที่ระดับ dropY
                    drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

                    // 2. หาค่าพิกัด X ซ้ายสุด และ ขวาสุด ของกลุ่มลูก ๆ ในครอบครัวนี้
                    const minX = Math.min(...childPositions.map(p => p.x));
                    const maxX = Math.max(...childPositions.map(p => p.x));

                    // 3. ขึงสะพานเส้นแนวนอนเชื่อมระหว่างขอบเขตลูกซ้ายสุดไปขวาสุดพอดีเป๊ะ (ไม่ลากยาวเกินไปหาบ้านอื่น)
                    // และเชื่อมจุดปล่อยแกนหลักเข้ากับสะพานแนวนอนนี้
                    const bridgeLeft = Math.min(minX, parentCenterX);
                    const bridgeRight = Math.max(maxX, parentCenterX);
                    drawLine(bridgeLeft, dropY, bridgeRight - bridgeLeft, 2);

                    // 4. ลากเส้นดิ่งย่อยจากสะพานแนวนอน ทิ่มตรงลงกึ่งกลางหัวโหนดลูกแต่ละคนพอดีเป๊ะ
                    family.children.forEach(childId => {
                        const childPos = layout[childId];
                        if (childPos) {
                            // ลากจากระดับ dropY ดิ่งลงไปหาตำแหน่งหัวโหนดลูก (Y - OFFSET_Y)
                            drawLine(childPos.x, dropY, 2, (childPos.y - OFFSET_Y) - dropY);
                        }
                    });
                }
            }
        });
    }

    // ตั้งค่าขอบและมุมมองแคนวาสเริ่มต้น
    offsetX = 60;
    offsetY = 40;
    applyTransform();
    if (typeof resizeCanvas === "function") resizeCanvas();
}

// ==========================================
// ฟังก์ชันย่อยสำหรับสร้างองค์ประกอบ (DOM Element)
// ==========================================
function createPerson(person, x, y) {
    const div = document.createElement("div");
    div.className = "person";
    div.id = "person-" + person.id;
    div.style.left = (x - OFFSET_X) + "px";
    div.style.top = (y - OFFSET_Y) + "px";
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
