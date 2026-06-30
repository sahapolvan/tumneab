const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // ดึงพิกัดจาก layout.js

    // 1. ✅ แก้บั๊กหัวใจเกินและซ้อนทับหัวคนถาวร (ฉบับล็อกไอดี ป้องกันผัวเมียสลับกันวาดซ้ำ)
    const drewHearts = new Set();
    
    Object.values(people).forEach(person => {
        const spouseField = person.spouse || person.spoues;
        if (spouseField) {
            spouseField.split("|").forEach(sId => {
                const partnerId = sId.trim();
                if (!partnerId) return;

                // ✅ ดักจับบั๊กเด็ดขาด: บังคับให้วาดหัวใจเฉพาะตอนที่ไอดีของตัวเอง น้อยกว่า ไอดีคู่สมรสเท่านั้น (person.id < partnerId)
                // วิธีนี้จะทำให้ ตี๋ เป็นคนวาดหัวใจให้เมียทั้ง 3 คนเองคนเดียวจบ และเมื่อโค้ดวนลูปไปถึง โค้ง, ต้อง, ตั้ม จะโดนสั่งห้ามวาดซ้ำเด็ดขาด!
                if (Number(person.id) < Number(partnerId)) {
                    
                    const pPos = layout[person.id];
                    const sPos = layout[partnerId];

                    if (pPos && sPos) {
                        const heartKey = [person.id, partnerId].sort((a, b) => Number(a) - Number(b)).join("-");
                        
                        if (!drewHearts.has(heartKey)) {
                            // ลากเส้นแนวนอนสั้น ๆ เชื่อมระหว่างเก้าอี้คู่รัก
                            drawLine(pPos.x, pPos.y, sPos.x - pPos.x, 2);

                            // คำนวณจุดกึ่งกลางระหว่างคู่แต่งงานคู่นี้จริง ๆ 
                            const centerX = (pPos.x + sPos.x) / 2;
                            const centerY = (pPos.y + sPos.y) / 2;
                            
                            // วางหัวใจเหนือกึ่งกลางเส้นแต่งงานพอดีเป๊ะ ไม่ลอยทับหัวใคร
                            createHeart(centerX - 16, centerY - 45); 
                            drewHearts.add(heartKey);
                        }
                    }
                }
            });
        }
    });

    // 2. ลากเส้นกิ่งก้านสายสัมพันธ์หักมุมฉาก ล็อกความยาวเส้นตั้งให้สม่ำเสมอสั้นเท่ากัน 80px ทุกรุ่นตระกูล
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
            const dropY = parentCenterY + 80; 

            drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

            if (parentCenterX <= childPos.x) {
                drawLine(parentCenterX, dropY, childPos.x - parentCenterX, 2);
            } else {
                drawLine(childPos.x, dropY, parentCenterX - childPos.x, 2);
            }

            drawLine(childPos.x, dropY, 2, (childPos.y - OFFSET_Y) - dropY);
        }
    });

    // 3. วาดกล่องบุคคลทุกคนไว้เลเยอร์หน้าสุด (ซ่อนระบบเส้นเชื่อมไว้เลเยอร์ด้านหลังโหนดคน)
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

// ฟังก์ชันสร้างวัตถุกงเดิมเพื่อความปลอดภัย
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

