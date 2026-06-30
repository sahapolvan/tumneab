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
    
    Object.values(people).forEach(person => {
        const spouseField = person.spouse || person.spoues;
        if (spouseField) {
            // ดึงรายชื่อคู่สมรสทั้งหมดของคนนี้ออกมา
            const partnerIds = spouseField.split("|").map(id => id.trim()).filter(Boolean);
            const posMain = layout[person.id]; 

            if (posMain) {
                // วนลูปวาดเส้นและหัวใจตรงจากตัวหลักไปยังคู่สมรสทุกคน (รองรับทั้งแม้วและตี๋ที่เป็น LGBT)
                for (let i = 0; i < partnerIds.length; i++) {
                    const spouseId = partnerIds[i];
                    const posSpouse = layout[spouseId];

                    if (posSpouse) {
                        const heartKey = [person.id, spouseId].sort().join("-");
                        
                        if (!drewHearts.has(heartKey)) {
                            // 1. หาจุดเริ่มต้นและจุดสิ้นสุดบนแกน X ของคู่รักคู่นี้
                            const startX = Math.min(posMain.x, posSpouse.x);
                            const endX = Math.max(posMain.x, posSpouse.x);
                            
                            // 2. ดึงให้เส้นแต่งงานแนวนอน ขยับลงมาอยู่ "ใต้กรอบวงกลม" พอดี เพื่อไม่ให้เส้นตัดผ่านหน้า
                            // (ปรับตัวเลข + 40 หรือ + 50 ตามระยะความสูงของโหนดวงกลมคุณได้เลยครับ)
                            const marriageLineY = posMain.y + 45; 

                            // ลากเส้นแนวนอนเชื่อมความสัมพันธ์ระหว่างคู่รัก
                            drawLine(startX + 35, marriageLineY, (endX - startX), 2);

                            // 3. คำนวณจุดกึ่งกลางแกน X ระหว่างโหนดทั้งสอง
                            const centerX = (posMain.x + posSpouse.x) / 2;
                            
                            // ✅ แก้บั๊กหัวใจทับหัวถาวร: วางไอคอนหัวใจให้อยู่กึ่งกลางคานเส้นแต่งงาน marriageLineY พอดี
                            // ไม่ใช้ค่า pos.y ของตัวคนมาเฉลี่ยอีกต่อไป หัวใจจะไม่ลอยขึ้นไปทับหัวใครแน่นอน
                            createHeart(centerX - 16, marriageLineY - 15); 
                            
                            drewHearts.add(heartKey);
                        }
                    }
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
