// กำหนดขนาดรัศมีเพื่อจัดตำแหน่งให้อยู่กึ่งกลางพิกัดพอดี (หักลบความกว้างวงกลม 90px / 2 = 45)
const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    // 1. เคลียร์หน้าจอแคนวาสเดิมก่อนวาดใหม่ทุกครั้ง
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    // 2. วางพิกัดตำแหน่งโหนดทั้งหมดใหม่
    layoutTree();

    // 3. วาดบุคคลทุกคนลงบนแคนวาสตามพิกัดที่คำนวณได้
    Object.keys(layout).forEach(id => {
        const person = people[id];
        const pos = layout[id];
        if (person && pos) {
            createPerson(person, pos.x, pos.y);
            
            // อัปเดตขนาดความกว้าง/ยาวสูงสุดของแคนวาสเพื่อระบุขอบเขตระบบลากผัง
            if (pos.x > canvasWidth) canvasWidth = pos.x;
            if (pos.y > canvasHeight) canvasHeight = pos.y;
        }
    });

    // 4. วาดเส้นเชื่อมโยงความสัมพันธ์เครือญาติและหัวใจคู่สมรส
    if (typeof families !== "undefined") {
        families.forEach(family => {
            const fatherPos = layout[family.father];
            const motherPos = layout[family.mother];

            let parentCenterX = 0;
            let parentCenterY = 0;

            // กรณีมีทั้งพ่อและแม่ ให้ลากเส้นเชื่อมแต่งงานกันและใส่รูปหัวใจตรงกลาง
            if (fatherPos && motherPos) {
                // ลากเส้นแนวนอนเชื่อมระหว่างพ่อและแม่
                drawLineBetweenPoints(fatherPos.x, fatherPos.y, motherPos.x, motherPos.y);
                
                // หาจุดกึ่งกลางระหว่างคู่สมรส
                parentCenterX = (fatherPos.x + motherPos.x) / 2;
                parentCenterY = (fatherPos.y + motherPos.y) / 2;
                
                // วางไอคอนหัวใจตรงกลางเส้นแต่งงาน (ปรับ Offset ไอคอนเล็กน้อยเพื่อให้ตรงจุด)
                createHeart(parentCenterX - 16, parentCenterY - 16);
            } else if (fatherPos) {
                parentCenterX = fatherPos.x;
                parentCenterY = fatherPos.y;
            } else if (motherPos) {
                parentCenterX = motherPos.x;
                parentCenterY = motherPos.y;
            }

            // ลากเส้นจากจุดกึ่งกลางพ่อแม่ลงมาหาลูกๆ ทุกคน
            if (family.children && parentCenterX !== 0) {
                family.children.forEach(childId => {
                    const childPos = layout[childId];
                    if (childPos) {
                        // ลากเส้นเฉียงจากจุดศูนย์กลางพ่อแม่ วิ่งตรงไปหาจุดกึ่งกลางของลูกแต่ละคน
                        drawLineBetweenPoints(parentCenterX, parentCenterY, childPos.x, childPos.y);
                    }
                });
            }
        });
    }

    // ปรับขนาดแคนวาสรองรับขอบเขตวัตถุทั้งหมด
    if (typeof resizeCanvas === "function") {
        resizeCanvas();
    }
}

function createPerson(person, x, y) {
    const div = document.createElement("div");
    div.className = "person";
    div.id = "person-" + person.id;

    // ✅ ปรับแก้: หักลบค่า Offset เพื่อให้พิกัด (X, Y) อยู่กึ่งกลางวงกลมพอดี
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

// ✅ เพิ่มเติม: ฟังก์ชันคำนวณและลากเส้นเชื่อมพิกัดแบบรองรับเส้นเฉียงทุกองศาด้วย CSS Transform
function drawLineBetweenPoints(x1, y1, x2, y2) {
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 100 / Math.PI * (180 / 100); // คำนวณองศาลาดเอียง

    const line = document.createElement("div");
    line.className = "line";
    
    // ตั้งค่าสไตล์พื้นฐานให้เส้นมีความหนา 2px แนวนอน
    line.style.position = "absolute";
    line.style.left = x1 + "px";
    line.style.top = y1 + "px";
    line.style.width = length + "px";
    line.style.height = "2px"; 
    
    // หมุนเส้นจากจุดเริ่มต้น (0, 0) วิ่งตรงไปยังจุดปลายทาง
    line.style.transformOrigin = "0 0";
    line.style.transform = `rotate(${angle}deg)`;

    canvas.appendChild(line);
}

// เก็บรักษากลไกการวาดแบบเดิมของคุณเผื่อกรณีสคริปต์อื่นยังคงเรียกใช้งานอยู่
function drawLine(x, y, width, height) {
    const line = document.createElement("div");
    line.className = "line";
    line.style.left = x + "px";
    line.style.top = y + "px";
    line.style.width = width + "px";
    line.style.height = height + "px";
    canvas.appendChild(line);
}
