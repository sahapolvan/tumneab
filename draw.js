const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); 

    // 1. วาดกล่องบุคคล
    Object.keys(layout).forEach(personId => {
        const person = people[personId];
        const pos = layout[personId];
        if (person && pos) {
            createPerson(person, pos.x, pos.y);
            if (pos.x > canvasWidth) canvasWidth = pos.x;
            if (pos.y > canvasHeight) canvasHeight = pos.y;
        }
    });

    // 2. วาดเส้นสมรสและหัวใจ ❤️ 
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

    // 3. ✅ ปรับปรุงใหม่: ลากเส้นแยกสะพานเฉพาะครอบครัว ป้องกันเส้นทับกันตรงกลาง
    if (typeof families !== "undefined") {
        families.forEach(family => {
            const fatherPos = layout[family.father];
            const motherPos = layout[family.mother];
            
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

            if (family.children && family.children.length > 0 && parentCenterX !== 0) {
                const childPositions = family.children.map(id => layout[id]).filter(Boolean);
                
                if (childPositions.length > 0) {
                    // ระยะหักเลี้ยวแนวนอนดิ่งลงมา 90px (ไม่ยาวจนทับรุ่นถัดไป)
                    const dropY = parentCenterY + 90; 

                    // 1. ลากเส้นดิ่งจากกึ่งกลางพ่อแม่ลงมาพักที่คาน
                    drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

                    // 2. หาขอบเขตลูกซ้ายสุดและขวาสุดเฉพาะของครอบครัวนี้
                    const minX = Math.min(...childPositions.map(p => p.x));
                    const maxX = Math.max(...childPositions.map(p => p.x));

                    // 3. ขึงสะพานแนวนอนเฉพาะขอบเขตลูกของตัวเอง (เส้นจะไม่วิ่งไปปนกับบ้านอื่นตรงกลางจอ)
                    const bridgeLeft = Math.min(minX, parentCenterX);
                    const bridgeRight = Math.max(maxX, parentCenterX);
                    drawLine(bridgeLeft, dropY, bridgeRight - bridgeLeft, 2);

                    // 4. ลากเส้นดิ่งย่อยจากคาน ทิ่มลงกึ่งกลางหัวโหนดลูกแต่ละคนพอดีเป๊ะ
                    family.children.forEach(childId => {
                        const childPos = layout[childId];
                        if (childPos) {
                            drawLine(childPos.x, dropY, 2, (childPos.y - OFFSET_Y) - dropY);
                        }
                    });
                }
            }
        });
    }

    offsetX = 60;
    offsetY = 40;
    applyTransform();
    if (typeof resizeCanvas === "function") resizeCanvas();
}

// ฟังก์ชันย่อยคงเดิม
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
