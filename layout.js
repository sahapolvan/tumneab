const NODE_WIDTH = 140;    // ช่องไฟแนวขนานระหว่างบุคคลแต่ละคน
const LEVEL_HEIGHT = 240;  // ระยะห่างระหว่างแถวรุ่น (แนวตั้ง)

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. ระบุรุ่น (Generation) ให้ถูกต้องตามสายเลือดจากบนลงล่าง
    Object.values(people).forEach(person => {
        if (person.id == "1" || person.id == "2") {
            personLevels[person.id] = 0; // รุ่นปู่ย่า
        }
    });

    for (let run = 0; run < 4; run++) {
        Object.values(people).forEach(person => {
            const fatherLevel = personLevels[person.father];
            const motherLevel = personLevels[person.mother];
            if (fatherLevel !== undefined) personLevels[person.id] = fatherLevel + 1;
            else if (motherLevel !== undefined) personLevels[person.id] = motherLevel + 1;
        });
    }

    // เก็บตกกลุ่มเขย/สะใภ้ให้อยู่รุ่นเดียวกับคู่สมรส
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

    // 2. ค้นหาต้นตระกูลสูงสุด (ไอดี 1: เภา)
    const root = people["1"];
    const rootMother = people["2"];
    if (!root) return;

    // 3. ตรรกะจัดกึ่งกลางอัจฉริยะ (วาดจากบนลงล่างและเฉลี่ยพื้นที่กลุ่มลูกหลานให้อยู่ตรงกลางเสมอ)
    const visited = new Set();

    // บล็อกแรก: วางต้นตระกูลไว้ตรงกึ่งกลางหน้าจอ (สมมติจุดศูนย์กลางที่ X = 1200 เพื่อเผื่อพื้นที่ขยายข้าง)
    const screenCenterX = 1200;
    layout["1"] = { x: screenCenterX - 75, y: 100 };
    layout["2"] = { x: screenCenterX + 75, y: 100 };
    visited.add("1").add("2");

    // ฟังก์ชันคำนวณหาความกว้างรวมของ "กลุ่มลูก ๆ" ในครอบครัวนั้น เพื่อนำมาจัดกึ่งกลางใต้พ่อแม่
    function getChildrenTotalWidth(family) {
        if (!family || !family.children || family.children.length === 0) return NODE_WIDTH * 1.5;
        let totalCount = 0;
        family.children.forEach(cId => {
            totalCount++; // นับตัวลูก
            const child = people[cId];
            const cSpouse = child?.spouse || child?.spoues;
            if (cSpouse) totalCount += cSpouse.split("|").length; // นับสะใภ้/เขย
        });
        return totalCount * NODE_WIDTH;
    }

    // ฟังก์ชันย่อยสำหรับจัดวางตำแหน่งลูกหลานให้กึ่งกลางใต้โฮดพ่อแม่พอดีเป๊ะ
    function layoutFamilyChildren(parentFamily, parentCenterX, level) {
        if (!parentFamily || !parentFamily.children || parentFamily.children.length === 0) return;

        const currentY = level * LEVEL_HEIGHT + 100;
        const totalWidth = getChildrenTotalWidth(parentFamily);
        // หาจุดเริ่มต้นด้านซ้ายสุดเพื่อให้กลุ่มลูกอยู่กึ่งกลางใต้จุด parentCenterX พอดี
        let startX = parentCenterX - (totalWidth / 2) + (NODE_WIDTH / 2);

        parentFamily.children.forEach(childId => {
            const child = people[childId];
            if (!child || visited.has(childId)) return;

            // วางตัวลูกหลัก
            layout[childId] = { x: startX, y: currentY };
            visited.add(childId);
            
            // ตรวจสอบคู่สมรส (เขย/สะใภ้) ของลูกคนนี้เพื่อดึงมานั่งเก้าอี้ติดกันข้าง ๆ ทันที
            const spouseField = child.spouse || child.spoues;
            let spouseOffset = 0;
            if (spouseField) {
                spouseField.split("|").forEach(sId => {
                    const partnerId = sId.trim();
                    if (people[partnerId] && !visited.has(partnerId)) {
                        startX += NODE_WIDTH;
                        layout[partnerId] = { x: startX, y: currentY };
                        visited.add(partnerId);
                        spouseOffset += NODE_WIDTH;
                    }
                });
            }

            // ค้นหาต่อเนื่องเผื่อว่าลูกคนนี้มีครอบครัวย่อย (เพื่อส่งต่อพิกัดจัดกึ่งกลางให้รุ่นหลาน/เหลน ถัดลงไป)
            const ownFamily = families.find(f => f.father == childId || f.mother == childId);
            if (ownFamily) {
                // จุดกึ่งกลางของคู่สามีภรรยานี้
                const currentCoupleCenterX = layout[childId].x + (spouseOffset / 2);
                layoutFamilyChildren(ownFamily, currentCoupleCenterX, level + 1);
            }

            startX += NODE_WIDTH; // ขยับสเปซสแตนบายให้ลูกบ้านถัดไป
        });
    }

    // สั่งเริ่มรันตรรกะจัดกึ่งกลางจาก ครอบครัวต้นตระกูลรุ่นแรก (เภา-สวัสดิ์) ส่งพิกัดกึ่งกลางหน้าจอลงไป
    const rootFamily = families.find(f => (f.father == "1" && f.mother == "2") || (f.father == "2" && f.mother == "1"));
    if (rootFamily) {
        layoutFamilyChildren(rootFamily, screenCenterX, 1);
    }

    // เก็บตกคนโสดหรือคนที่ข้อมูลหลุดโพลอย ๆ ให้ไปวางต่อท้ายแถวในรุ่นของตัวเองเพื่อป้องกันผังพัง
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
