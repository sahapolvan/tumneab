// คัดลอกโค้ดส่วนนี้ไปทับหรือแทนที่ฟังก์ชันลากเส้นใน draw.js เดิมของคุณ
function drawTree() {
    canvas.innerHTML = "";
    drawn = {};

    buildFamilies();
    buildFamilyLevels();
    layoutTree(); // รันตัวจัดแถวหน้ากระดานตัวใหม่ข้างบน

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
                
                // 1. ลากเส้นดิ่งสั้นๆ ลงมาจากกึ่งกลางพ่อแม่
                drawLine(parentCenterX, parentCenterY, 2, dropY - parentCenterY);

                // หาพิกัดลูกคนแรกและคนสุดท้ายในระบบแถวเพื่อสร้างคานแนวนอน
                const childPositions = family.children.map(id => layout[id]).filter(Boolean);
                if (childPositions.length > 0) {
                    const minX = Math.min(...childPositions.map(p => p.x));
                    const maxX = Math.max(...childPositions.map(p => p.x));

                    // 2. ลากคานสายใยแนวนอนเชื่อมขอบเขตกลุ่มลูก
                    drawLine(minX, dropY, maxX - minX, 2);

                    // 3. ลากเส้นดิ่งย่อยจากคานแนวนอน ทิ่มลงหัวโหนดลูกแต่ละคนพอดี
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

    offsetX = 40;
    offsetY = 40;
    applyTransform();
    if (typeof resizeCanvas === "function") resizeCanvas();
}
