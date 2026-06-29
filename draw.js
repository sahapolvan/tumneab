const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // ดึงพิกัดแถวหน้ากระดานสมดุล

    // 1. วาดกล่องบุคคลทุกคนตามตำแหน่งพิกัด
    Object.keys(layout).forEach(personId => {
        const person = people[personId];
        const pos = layout[personId];
        if (person && pos) {
            createPerson(person, pos.x, pos.y);
            if (pos.x > canvasWidth) canvasWidth = pos.x;
            if (pos.y > canvasHeight) canvasHeight = pos.y;
        }
    });

    // 2. วาดเส้นคู่สมรสแนวนอนสั้น ๆ และใส่หัวใจ ❤️
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
                        // ลากเส้นแนวนอนบาง ๆ เชื่อมเฉพาะคู่รักที่นั่งติดกัน
                        drawLine(pPos.x, pPos.y, sPos.x - pPos.x, 2);

                        const centerX = (pPos.x + sPos.x) / 2;
                        const centerY = (pPos.y + sPos.y) / 2;
                        createHeart(centerX - 16, centerY - 45); 
                        drewHearts.add(heartKey);
                    }
                }
            });
        }
    });

    // 3. ✅ ปรับปรุงใหม่แบบเด็ดขาด: ลากเส้นสายใยตรงจาก "คู่พ่อแม่" ทิ่มลงหัวโหนด "ลูก" ทีละคน (งดใช้คานแนวนอนร่วมกัน)
    // วิธีนี้จะตัดปัญหาเรื่องเส้นคานแนวนอนทับกันยาวทะลุจอทิ้งไปร้อยเปอร์เซ็นต์
    Object.values(people).forEach(child => {
        // ข้ามคนไม่มีพ่อและแม่ (รุ่นปู่ย่า หรือเขยสะใภ้)
        if (!child.father && !child.mother) return;

        const childPos = layout[child.id];
        if (!childPos) return;

        // หาพิกัดของพ่อและแม่ของเด็กคนนี้
        const fatherPos = layout[child.father];
        const motherPos = layout[child.mother];

        let parentCenterX = 0;
        let parentCenterY = 0;

        // หาจุดกึ่งกลางของคู่พ่อแม่รายบุคคลจริง ๆ จากตารางข้อมูล
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

        // หากพบคู่พ่อแม่ในระบบพิกัด ให้ลากเส้นหักฉากส่วนบุคคลลงมาหาลูกโดยตรง
        if (parentCenterX !== 0) {
            // จุดหักเลี้ยวแนวตั้ง (ดิ่งลงมาจากแถวพ่อแม่ 85px) เป็นของใครของมัน ไม่ปนกัน
            const dropY = parentCenterY + 85; 

            // ลากเส้นดิ่งสั้น ๆ ลงมาจากกึ่งกลางพ่อแม่คู่ตัวจริง
            drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

            // ลากเส้นแนวนอนจากจุดดิ่งของพ่อแม่ วิ่งไปหาพิกัดแกน X ของตัวลูกรายคน
            if (parentCenterX <= childPos.x) {
                drawLine(parentCenterX, dropY, childPos.x - parentCenterX, 2);
            } else {
                drawLine(childPos.x, dropY, parentCenterX - childPos.x, 2);
            }

            // ลากเส้นดิ่งย่อยทิ่มตรงลงกึ่งกลางหัวโหนดลูกคนนั้นพอดีเป๊ะ
            drawLine(childPos.x, dropY, 2, (childPos.y - OFFSET_Y) - dropY);
        }
    });

    offsetX = 60;
    offsetY = 40;
    applyTransform();
    if (typeof resizeCanvas === "function") resizeCanvas();
}

// ฟังก์ชันสร้างวัตถุคงเดิม
function createPerson(person, x, y) {
    const div = document.createElement("div");
    div.className = "person";
    div.id = "person-" + person.id;
    div.style.left = (x - OFFSET_X) + "px";
    div.style.top = (y - OFFSET_Y) + "px";
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
