const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // ดึงพิกัดจัดโซนสมดุลจาก layout.js

    // 1. วาดเส้นคู่สมรสแนวนอน และใส่หัวใจ ❤️ (✅ แก้ไขใหม่: คำนวณหาคู่ที่นั่งติดกันจริง ๆ)
    const drewHearts = new Set();
    
    // ✅ เปลี่ยนมาวนลูปจากข้อมูลครอบครัว (families) โดยตรง เพื่อวาดหัวใจเฉพาะคู่แต่งงานจริง ๆ
    families.forEach(family => {
        const fatherId = family.father;
        const motherId = family.mother;
        
        if (fatherId && motherId) {
            const pos1 = layout[fatherId];
            const pos2 = layout[motherId];

            if (pos1 && pos2) {
                // สร้าง Key เพื่อไม่ให้วาดซ้ำ
                const heartKey = [fatherId, motherId].sort().join("-");
                
                if (!drewHearts.has(heartKey)) {
                    // ลากเส้นแนวนอนสั้น ๆ ระหว่างคู่รัก
                    // เช็กเพื่อให้ลากจากซ้ายไปขวาเสมอ ไม่ว่าพ่อหรือแม่จะอยู่ซ้าย
                    const startX = Math.min(pos1.x, pos2.x);
                    const endX = Math.max(pos1.x, pos2.x);
                    drawLine(startX, pos1.y, endX - startX, 2);

                    // หาจุดกึ่งกลางระหว่างพ่อและแม่ที่แต่งงานกันจริง ๆ
                    const centerX = (pos1.x + pos2.x) / 2;
                    const centerY = (pos1.y + pos2.y) / 2;
                    
                    // วาดรูปหัวใจตรงจุดกึ่งกลางของคู่สมรสคู่นั้น
                    createHeart(centerX - 16, centerY - 45); 
                    drewHearts.add(heartKey);
                }
            }
        }
    });

    // 2. ✅ แก้ไขใหม่: ล็อกระยะหักเลี้ยวแนวตั้ง (dropY) ให้สั้นกระชับและยาวเท่ากันเป๊ะ 80px ทุกรุ่นตระกูล
    Object.values(people).forEach(child => {
        if (!child.father && !child.mother) return;

        const childPos = layout[child.id];
        if (!childPos) return;

        const fatherPos = layout[child.father];
        const motherPos = layout[child.mother];

        let parentCenterX = 0;
        let parentCenterY = 0;

        // ดึงพิกัดกึ่งกลางของพ่อแม่ตัวจริง
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
    // 🛠️ เอาพิกัดหัวโหนดลูกตั้ง แล้วลอยขึ้นไปข้างบนเป็นระยะคงที่ (เช่น 40px หรือ 50px)
    const dropY = (childPos.y - OFFSET_Y) - 40; 

    // ลากเส้นดิ่งลงมาจากจุดกึ่งกลางพ่อแม่มาพักที่คานเลี้ยวของตัวเอง
    drawLine(parentCenterX, parentCenterY, 4, dropY - parentCenterY);

    // ลากเส้นแนวนอนเลี้ยวจากคานวิ่งไปหาพิกัดแกน X ของตัวลูก
    if (parentCenterX <= childPos.x) {
        drawLine(parentCenterX, dropY, childPos.x - parentCenterX, 4);
    } else {
        drawLine(childPos.x, dropY, parentCenterX - childPos.x, 4);
    }

    // ลากเส้นดิ่งย่อยจากสะพานระนาบ ทิ่มตรงลงกึ่งกลางหัวโหนดลูกแต่ละคนพอดีเป๊ะ
    drawLine(childPos.x, dropY, 4, (childPos.y - OFFSET_Y) - dropY);
}
});
    // 3. วาดกล่องบุคคลทุกคน (ซ่อนระบบเส้นเชื่อมไว้เลเยอร์ด้านหลังโหนดคน)
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

// ฟังก์ชันสร้างวัตถุระบบ Layer คงเดิมเพื่อความปลอดภัย
function createPerson(person, x, y) {
    const div = document.createElement("div");
    div.className = "person";
    div.id = "person-" + person.id;
    div.style.left = (x - OFFSET_X) + "px";
    div.style.top = (y - OFFSET_Y) + "px";
    div.style.zIndex = "10"; 
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
    line.style.zIndex = "1"; 
    canvas.appendChild(line);
}
