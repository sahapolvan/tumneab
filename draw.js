const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // อ้างอิงพิกัดกระจายขอบสมดุลจาก layout.js

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

    // 2. ✅ แก้ไขใหม่: กู้คืนสัญลักษณ์รูปหัวใจ ❤️ และลากเส้นแต่งงานสั้น ๆ 
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
                        // ลากเส้นแนวนอนบาง ๆ เชื่อมคู่สมรสที่ยืนติดกัน
                        drawLine(pPos.x, pPos.y, sPos.x - pPos.x, 2);

                        // คำนวณพิกัดวางหัวใจให้อยู่ตรงกลางด้านบนพอดีเป๊ะ
                        const centerX = (pPos.x + sPos.x) / 2;
                        const centerY = (pPos.y + sPos.y) / 2;
                        createHeart(centerX - 16, centerY - 45); // ดึงหัวใจโผล่ขึ้นมาเหนือนามสกุล
                        drewHearts.add(heartKey);
                    }
                }
            });
        }
    });

    // 3. ✅ แก้ไขใหม่ทั้งหมด: ลากเส้นกิ่งความสัมพันธ์แบบ "หักเลี้ยวรายตัว" (Independent L-Shape Lines)
    // วิธีนี้จะยกเลิกการขึงคานสะพานยาวร่วมกลางหน้าจอ เพื่อตัดปัญหาเส้นทับกันกลายเป็นคานเดียวกวาดผ่านทุกบ้าน
    if (typeof families !== "undefined") {
        families.forEach(family => {
            const fatherPos = layout[family.father];
            const motherPos = layout[family.mother];
            
            let parentCenterX = 0;
            let parentCenterY = 0;

            // หาจุดกึ่งกลางของคู่สามี-ภรรยาเพื่อเป็นจุดปล่อยสายใยหลัก
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

            // ถ้าครอบครัวนี้ระบุว่ามีลูกในระบบตารางข้อมูลจริง
            if (family.children && family.children.length > 0 && parentCenterX !== 0) {
                
                // กำหนดระยะหักเลี้ยวแนวตั้งดิ่งลงมาจากพ่อแม่กึ่งกลางระหว่างรุ่น (80px)
                const dropY = parentCenterY + 80; 

                // ลากเส้นดิ่งประธานเส้นเดียวสั้น ๆ ลงมาจากจุดกึ่งกลางคู่แต่งงานพุ่งลงมาพักที่ระดับ dropY
                drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

                // วนลูปแยกวาดเส้นกิ่งให้ลูกแต่ละคนแยกอิสระขาดออกจากกันเด็ดขาด
                family.children.forEach(childId => {
                    const childPos = layout[childId];
                    if (childPos) {
                        // ลากเส้นแนวนอนหักมุมเลี้ยวจากปลายแกนหลัก (parentCenterX, dropY) วิ่งหน้ากระดานไปหาแกน X ของตัวลูก (childPos.x, dropY)
                        if (parentCenterX <= childPos.x) {
                            drawLine(parentCenterX, dropY, childPos.x - parentCenterX, 2);
                        } else {
                            drawLine(childPos.x, dropY, parentCenterX - childPos.x, 2);
                        }

                        // ลากเส้นดิ่งย่อยดิ่งหัวมุมทิ่มฉากตรงลงไปครอบหัวโหนดลูกคนนั้น ๆ พอดีเป๊ะ ไม่เลี้ยวพาดผ่านใคร
                        drawLine(childPos.x, dropY, 2, (childPos.y - OFFSET_Y) - dropY);
                    }
                });
            }
        });
    }

    // กำหนดระยะขอบและสเกลมุมมองหน้าเว็บเริ่มต้น
    offsetX = 60;
    offsetY = 40;
    applyTransform();
    if (typeof resizeCanvas === "function") resizeCanvas();
}

// ==========================================
// ฟังก์ชันย่อยสำหรับสร้างองค์ประกอบบนแคนวาส (คงเดิมเพื่อความปลอดภัย)
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
