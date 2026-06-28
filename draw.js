const OFFSET_X = 45; 
const OFFSET_Y = 45;

function drawTree() {
    canvas.innerHTML = "";
    canvasWidth = 0;
    canvasHeight = 0;

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); 

    // 1. วาดกล่องบุคคลทุกคนตามตำแหน่งพิกัดที่จัดกึ่งกลางสมดุลไว้แล้ว
    Object.keys(layout).forEach(personId => {
        const person = people[personId];
        const pos = layout[personId];
        if (person && pos) {
            createPerson(person, pos.x, pos.y);
            if (pos.x > canvasWidth) canvasWidth = pos.x;
            if (pos.y > canvasHeight) canvasHeight = pos.y;
        }
    });

    // 2. ลากเส้นแต่งงานแนวนอนและวางรูปหัวใจ ❤️ ให้คู่สมรสทุกคู่ในระบบตระกูล
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
                        // ลากเส้นแนวนอนสั้น ๆ เชื่อมระหว่างคู่รัก
                        drawLine(pPos.x, pPos.y, sPos.x - pPos.x, 2);

                        // วางหัวใจเหนือกึ่งกลางเส้นแต่งงานพอดีเป๊ะ
                        const centerX = (pPos.x + sPos.x) / 2;
                        const centerY = (pPos.y + sPos.y) / 2;
                        createHeart(centerX - 16, centerY - 45);
                        drewHearts.add(heartKey);
                    }
                }
            });
        }
    });

    // 3. ลากเส้นกิ่งความสัมพันธ์หักมุมฉาก ดิ่งตรงลงหัวโหนดลูกอย่างแม่นยำ
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

            // ลากเส้นกิ่งลงด้านล่างเฉพาะครอบครัวที่มี "ลูก" กรอกอยู่ในตารางข้อมูล
            if (family.children && family.children.length > 0 && parentCenterX !== 0) {
                const dropY = parentCenterY + 65; // ระยะดิ่งลงมาก่อนจะหักมุมแนวนอน
                
                // ลากเส้นดิ่งแกนกลางลงมาจากจุดกึ่งกลางพ่อแม่
                drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

                // หาค่าพิกัด X ของลูกคนซ้ายสุดและขวาสุดในกลุ่มบ้านนี้
                const childPositions = family.children.map(id => layout[id]).filter(Boolean);
                if (childPositions.length > 0) {
                    const minX = Math.min(...childPositions.map(p => p.x));
                    const maxX = Math.max(...childPositions.map(p => p.x));

                    // ลากเส้นสะพานแนวนอนขึงรองรับเฉพาะกลุ่มลูกตัวเอง ไม่ลากยาวเกินขอบเขต
                    drawLine(minX, dropY, maxX - minX, 2);

                    // ลากเส้นดิ่งย่อยจากสะพาน ทิ่มตรงลงกึ่งกลางหัวโหนดลูกแต่ละคนพอดีเป๊ะ ไม่เบี้ยวเอียง
                    family.children.forEach(childId => {
                        const childPos = layout[childId];
                        if (childPos) {
                            drawLine(childPos.x, dropY, 2, childPos.y - dropY - OFFSET_Y);
                        }
                    });
                }
            }
        });
    }

    // ปรับระยะขอบหน้าจอเริ่มต้น
    offsetX = 60;
    offsetY = 40;
    applyTransform();
    if (typeof resizeCanvas === "function") resizeCanvas();
}

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
