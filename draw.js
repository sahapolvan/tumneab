// กำหนดระยะหักลบรัศมี เพื่อให้พิกัด X, Y อยู่ตรงจุดกึ่งกลางของวงกลมพอดี
const OFFSET_X = 45; 
const OFFSET_Y = 45;

// ==========================================
// ฟังก์ชันหลักในการควบคุมและสั่งวาดผังเครือญาติ
// ==========================================
function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // ดึงการจัดแถวหน้ากระดานจาก layout.js

    // 1. วาดกล่องบุคคลทุกคนตามพิกัดแถวที่เรียงกันเรียบร้อย
    Object.keys(layout).forEach(personId => {
        const person = people[personId];
        const pos = layout[personId];
        if (person && pos) {
            createPerson(person, pos.x, pos.y);
            
            if (pos.x > canvasWidth) canvasWidth = pos.x;
            if (pos.y > canvasHeight) canvasHeight = pos.y;
        }
    });

    // 2. วาดระบบเส้นเชื่อมความสัมพันธ์แบบหักมุมฉากสไตล์ทำเนียบองค์กร
    if (typeof families !== "undefined") {
        families.forEach(family => {
            const fatherPos = layout[family.father];
            const motherPos = layout[family.mother];

            let parentCenterX = 0;
            let parentCenterY = 0;

            // วาดเส้นสมรสแนวนอนระหว่างคู่รัก และใส่หัวใจตรงกลาง
            if (fatherPos && motherPos) {
                drawLine(fatherPos.x, fatherPos.y, motherPos.x - fatherPos.x, 2);
                parentCenterX = (fatherPos.x + motherPos.x) / 2;
                parentCenterY = fatherPos.y;
                createHeart(parentCenterX - 16, parentCenterY - 45);
            } else if (fatherPos) {
                parentCenterX = fatherPos.x;
                parentCenterY = fatherPos.y;
            } else if (motherPos) {
                parentCenterX = motherPos.x;
                parentCenterY = motherPos.y;
            }

            // ลากเส้นกิ่งลงมาหาลูกๆ แบบหักมุม
            if (family.children && family.children.length > 0 && parentCenterX !== 0) {
                const dropY = parentCenterY + 60; // ระยะดิ่งลงมาจากพ่อแม่ก่อนจะหักเลี้ยวแนวนอน
                
                // ลากเส้นดิ่งสั้นๆ ลงมาจากกึ่งกลางพ่อแม่
                drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

                // หาพิกัดลูกคนแรกและคนสุดท้ายในระบบแถวเพื่อสร้างคานแนวนอน
                const childPositions = family.children.map(id => layout[id]).filter(Boolean);
                if (childPositions.length > 0) {
                    const minX = Math.min(...childPositions.map(p => p.x));
                    const maxX = Math.max(...childPositions.map(p => p.x));

                    // ลากคานสายใยแนวนอนเชื่อมขอบเขตกลุ่มลูก
                    drawLine(minX, dropY, maxX - minX, 2);

                    // ลากเส้นดิ่งย่อยจากคานแนวนอน ทิ่มลงหัวโหนดลูกแต่ละคนพอดี
                    family.children.forEach(childId => {
                        const childPos = layout[childId];
                        if (childPos) {
                            drawLine(childPos.x, dropY, 2, childPos.y - dropY);
                        }
                    });
                }
            }
        });
    }

    // กำหนดตำแหน่งมุมมองหน้าจอเริ่มต้น
    offsetX = 40;
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

    // จัดให้จุดพิกัดอยู่กึ่งกลางวงกลมพอดี
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
