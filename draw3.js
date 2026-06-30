const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // ดึงพิกัดแบ่งโซนจาก layout.js

    // 1. ✅ ปรับปรุงใหม่แบบเนี๊ยบ 100%: วาดหัวใจเฉพาะ "คู่สมรสตัวจริง" ที่นั่งติดกันเท่านั้น (ตัดปัญหาพี่น้องติดหัวใจทิ้งเด็ดขาด)
    const drewHearts = new Set();
    
    // แยกกลุ่มคนออกตามระดับแถวแนวตั้ง (แกน Y)
    const yRows = {};
    Object.keys(layout).forEach(id => {
        const pos = layout[id];
        if (pos) {
            if (!yRows[pos.y]) yRows[pos.y] = [];
            yRows[pos.y].push({ id: id, x: pos.x, y: pos.y });
        }
    });

    // วนลูปตรวจเช็กคนที่นั่งเรียงหน้ากระดานในแถวเดียวกัน
    Object.keys(yRows).forEach(y => {
        // จัดคิวเรียงลำดับพิกัดจาก ซ้าย ไป ขวา (ตามพิกัดที่ยืนจริงบนหน้าจอ)
        const rowPeople = yRows[y].sort((a, b) => a.x - b.x);
        
        // จับคู่เฉพาะคนที่นั่งเก้าอี้ติดกันข้าง ๆ กันทีละคู่
        for (let i = 0; i < rowPeople.length - 1; i++) {
            const p1 = rowPeople[i];
            const p2 = rowPeople[i+1];
            
            const person1 = people[p1.id];
            const person2 = people[p2.id];
            
            if (person1 && person2) {
                // ✅ ตรวจสอบความสัมพันธ์อย่างเข้มงวด: 
                // ต้องมีฝ่ายใดฝ่ายหนึ่งระบุไอดีของอีกฝ่ายในช่องคู่สมรส (spouse) เท่านั้นถึงจะใส่หัวใจให้
                const isSpouse1 = (person1.spouse || person1.spoues || "").split("|").map(id => id.trim()).includes(p2.id);
                const isSpouse2 = (person2.spouse || person2.spoues || "").split("|").map(id => id.trim()).includes(p1.id);
                
                // หากเช็กแล้วเป็นคู่รักกันจริง และยังไม่เคยถูกวาดหัวใจดวงนี้
                if ((isSpouse1 || isSpouse2) && !drewHearts.has([p1.id, p2.id].sort().join("-"))) {
                    
                    // ลากเส้นแนวนอนสั้น ๆ เชื่อมกล่องคู่รัก
                    drawLine(p1.x, p1.y, p2.x - p1.x, 2);

                    // คำนวณจุดกึ่งกลางระหว่างพิกัด X ของคนที่นั่งติดกันคู่นั้นตรง ๆ
                    const centerX = (p1.x + p2.x) / 2;
                    const centerY = (p1.y + p2.y) / 2;
                    
                    // ปักหัวใจไว้ตรงกลางช่องไฟว่าง ๆ ระหว่างคู่รักพอดีเป๊ะ ไม่ทับหัวใคร และไม่ขึ้นที่พี่น้อง
                    createHeart(centerX - 16, centerY - 45); 
                    
                    const heartKey = [p1.id, p2.id].sort().join("-");
                    drewHearts.add(heartKey);
                }
            }
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

// ฟังก์ชันสร้างวัตถุโครงสร้างเลเยอร์คงเดิมเพื่อความปลอดภัย
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
