const NODE_WIDTH = 140;    // ช่องไฟแนวขนานระหว่างบุคคลแต่ละคน
const LEVEL_HEIGHT = 240;  // ระยะห่างแนวตั้งระหว่างรุ่น

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. ระบุรุ่น (Generation) ตามสายเลือดจากบนลงล่างอย่างแม่นยำ
    Object.values(people).forEach(person => {
        if (person.id == "1" || person.id == "2") personLevels[person.id] = 0;
    });

    for (let run = 0; run < 4; run++) {
        Object.values(people).forEach(person => {
            const fatherLevel = personLevels[person.father];
            const motherLevel = personLevels[person.mother];
            if (fatherLevel !== undefined) personLevels[person.id] = fatherLevel + 1;
            else if (motherLevel !== undefined) personLevels[person.id] = motherLevel + 1;
        });
    }

    for (let run = 0; run < 4; run++) {
        Object.values(people).forEach(person => {
            if (personLevels[person.id] === undefined) {
                const spouseField = person.spouse || person.spoues;
                if (spouseField) {
                    const spouseIds = spouseField.split("|").map(id => id.trim());
                    for (let sId of spouseIds) {
                        if (personLevels[sId] !== undefined) {
                            personLevels[person.id] = personLevels[sId];
                            break;
                        }
                    }
                }
            }
        });
    }

    // 2. ฟังก์ชันแบ่งโซนความกว้าง (คำนวณพื้นที่ที่แต่ละสายบ้านต้องใช้ล่วงหน้าจากล่างขึ้นบน)
    const subtreeWidths = {};
    function calculateSubtreeWidth(personId) {
        if (subtreeWidths[personId]) return subtreeWidths[personId];
        
        const person = people[personId];
        if (!person) return NODE_WIDTH;

        // ค้นหาครอบครัวที่คนนี้เป็นพ่อหรือแม่ เพื่อดูว่ามีลูก ๆ กี่คน
        const ownFamily = families.find(f => f.father == personId || f.mother == personId);
        
        // ถ้าคนนี้เป็นคนโสด ไม่มีลูก พื้นที่ของเขาคือขนาดโหนดปกติ
        if (!ownFamily || !ownFamily.children || ownFamily.children.length === 0) {
            let selfWidth = NODE_WIDTH;
            // ถ้ามีคู่สมรส ให้บวกพื้นที่คู่สมรสเพิ่มเข้าไปในโซนบ้านด้วย
            const spouseField = person.spouse || person.spoues;
            if (spouseField && spouseField.trim()) selfWidth += NODE_WIDTH;
            subtreeWidths[personId] = selfWidth;
            return selfWidth;
        }

        // ถ้ามีลูก ให้หาขนาดพื้นที่รวมของลูกหลานทุกคนในสายบ้านนี้ลึกซึ้งลงไปด้านล่าง
        let childrenTotalWidth = 0;
        ownFamily.children.forEach(childId => {
            childrenTotalWidth += calculateSubtreeWidth(childId);
        });

        // โซนของบ้านนี้จะกว้างเท่ากับขนาดพื้นที่ทั้งหมดที่ลูกหลานใช้รวมกัน
        subtreeWidths[personId] = Math.max(NODE_WIDTH * 2, childrenTotalWidth);
        return subtreeWidths[personId];
    }

    // 3. ✅ ตรรกะใหม่ตามแนวคิดน้า: วางตำแหน่งแบบ "แบ่งโซนล็อกพื้นที่ยึดตามระยะลูกตัวเอง"
    const visited = new Set();

    function layoutPersonAndFamily(personId, startX, level) {
        if (!personId || visited.has(personId)) return;

        const person = people[personId];
        if (!person) return;

        const currentY = level * LEVEL_HEIGHT + 100;
        const totalZoneWidth = subtreeWidths[personId] || NODE_WIDTH;

        // วางกล่องตัวหลักไว้ตรงกึ่งกลางของ "โซนพื้นที่บ้านตัวเอง"
        let myX = startX + (totalZoneWidth / 2) - (NODE_WIDTH / 2);
        layout[personId] = { x: myX, y: currentY };
        visited.add(personId);

        // ตรวจสอบคู่สมรส (เขย/สะใภ้) ดึงมานั่งประกบข้างตัวหลักทันที
        const spouseField = person.spouse || person.spoues;
        let spouseOffset = 0;
        if (spouseField) {
            spouseField.split("|").forEach(sId => {
                const partnerId = sId.trim();
                if (people[partnerId] && !visited.has(partnerId)) {
                    myX += NODE_WIDTH;
                    layout[partnerId] = { x: myX, y: currentY };
                    visited.add(partnerId);
                    spouseOffset += NODE_WIDTH;
                }
            });
        }

        // วางตำแหน่งกลุ่มลูก ๆ ให้อยู่ภายในกรอบโซนขอบเขตของพ่อแม่พอดีเป๊ะ ไม่วิ่งข้ามไปปนบ้านอื่น
        const ownFamily = families.find(f => f.father == personId || f.mother == personId);
        if (ownFamily && ownFamily.children && ownFamily.children.length > 0) {
            let childStartX = startX;
            ownFamily.children.forEach(childId => {
                const childWidth = subtreeWidths[childId] || NODE_WIDTH;
                // ส่งต่อไปคำนวณในรุ่นถัดไป (Level + 1) โดยจำกัดพื้นที่ให้อยู่ในโซนย่อย childStartX
                layoutPersonAndFamily(childId, childStartX, level + 1);
                childStartX += childWidth; // ขยับกรอบโซนให้ลูกคนถัดไป
            });
        }
    }

    // 4. สั่งรันคำนวณพื้นที่โซนตระกูลทั้งหมด
    calculateSubtreeWidth("1");

    // สั่งเริ่มต้นกระจายโซนตั้งแต่ "เภา" (ไอดี 1) เป็นหลัก ตั้งพิกัดซ้ายสุดที่ X = 100
    layoutPersonAndFamily("1", 100, 1);

    // ดึงต้นตระกูลสูงสุด (เภา-สวัสดิ์) รุ่น 0 ขึ้นไปจัดวางตรงกึ่งกลางเหนือโซนลูก ๆ ทั้งหมดให้ออกมาสมดุลสวยงาม
    const rootFamily = families.find(f => (f.father == "1" && f.mother == "2") || (f.father == "2" && f.mother == "1"));
    if (rootFamily && layout["1"]) {
        // หาจุดกึ่งกลางของรุ่นลูกทั้งหมดเพื่อล็อกตำแหน่งปู่ย่าให้สมดุล
        let childrenXSum = 0;
        let childrenCount = 0;
        rootFamily.children.forEach(cId => {
            if (layout[cId]) {
                childrenXSum += layout[cId].x;
                childrenCount++;
            }
        });
        const rootCenterX = childrenCount > 0 ? childrenXSum / childrenCount : 800;
        
        layout["1"] = { x: rootCenterX - 75, y: 100 };
        layout["2"] = { x: rootCenterX + 75, y: 100 };
    }

    // เก็บตกคนโสดหรือคนที่ข้อมูลตกหล่นให้ไปวางต่อท้ายแถวกันผังพัง
    Object.values(people).forEach(person => {
        if (!layout[person.id]) {
            const lvl = personLevels[person.id] || 0;
            let maxX = 100;
            Object.keys(layout).forEach(id => {
                if (personLevels[id] === lvl && layout[id].x > maxX) maxX = layout[id].x;
            });
            layout[person.id] = { x: maxX + NODE_WIDTH + 50, y: lvl * LEVEL_HEIGHT + 100 };
        }
    });
}
