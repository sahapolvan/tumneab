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
    layoutTree(); // ดึงตำแหน่งจาก layout.js

    // 1. วาดเส้นคู่สมรสแนวนอนสั้น ๆ และใส่หัวใจ ❤️
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
                        // ลากเส้นแนวนอนบาง ๆ เชื่อมคู่รัก
                        drawLine(pPos.x, pPos.y, sPos.x - pPos.x, 2);

                        // คำนวณหาจุดกึ่งกลางระหว่างคู่รักโดยตรง
                        const centerX = (pPos.x + sPos.x) / 2;
                        const centerY = (pPos.y + sPos.y) / 2;
                        
                        // วางหัวใจเหนือกึ่งกลางของคู่นั้น ๆ พอดีเป๊ะ
                        createHeart(centerX - 16, centerY - 45); 
                        drewHearts.add(heartKey);
                    }
                }
            });
        }
    });

    // 2. ลากเส้นกิ่งก้านสายสัมพันธ์หักมุมฉากแบบล็อกความยาวเส้นตั้งให้สม่ำเสมอเท่ากันทุกรุ่น
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
            // ปรับระยะหย่อนดิ่งลงมาก่อนเลี้ยวให้สม่ำเสมอเท่ากันทุกรุ่นที่ +80px พ้นระดับชื่อคนพอดีเป๊ะ
            const dropY = parentCenterY + 80; 

            // ลากเส้นดิ่งแกนหลักลงมาจากจุดกึ่งกลางพ่อแม่คู่จริงมาพักที่ระนาบคานเลี้ยว
            drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

            // ลากเส้นแนวนอนเลี้ยวไปหาพิกัดแกน X ของตัวลูก
            if (parentCenterX <= childPos.x) {
                drawLine(parentCenterX, dropY, childPos.x - parentCenterX, 2);
            } else {
                drawLine(childPos.x, dropY, parentCenterX - childPos.x, 2);
            }

            // ลากเส้นดิ่งย่อยจากระนาบคานเลี้ยว ทิ่มตรงลงกึ่งกลางหัวโหนดลูกแต่ละคนพอดีเป๊ะ
            drawLine(childPos.x, dropY, 2, (childPos.y - OFFSET_Y) - dropY);
        }
    });

    // 3. วาดกล่องบุคคลทุกคน (ซ่อนเส้นเชื่อมไว้เลเยอร์ด้านหลังโหนดคน)
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
// ฟังก์ชันย่อยสำหรับสร้างองค์ประกอบ (DOM Element)
// ==========================================

function createPerson(person, x, y) {
    const div = document.createElement("div");
    div.className = "person";
    div.id = "person-" + person.id;
    div.style.left = (x - OFFSET_X) + "px";
    div.style.top = (y - OFFSET_Y) + "px";
    div.style.zIndex = "10"; // บังคับให้อยู่ด้านหน้าเส้น

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
    heart.style.zIndex = "11"; // หัวใจอยู่ชั้นหน้าสุด
    canvas.appendChild(heart);
}

function drawLine(x, y, width, height) {
    const line = document.createElement("div");
    line.className = "line";
    line.style.left = x + "px";
    line.style.top = y + "px";
    line.style.width = width + "px";
    line.style.height = height + "px";
    line.style.zIndex = "1"; // เส้นอยู่หลังโหนดบุคคล
    canvas.appendChild(line);
}
