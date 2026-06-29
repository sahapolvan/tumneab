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

    // 2. ✅ ปรับปรุงใหม่: ฟังก์ชันคำนวณพื้นที่ความกว้างโซน (นับคู่สมรสทุกคนละเอียด ป้องกันคนซ้อนกัน)
    const subtreeWidths = {};
    function calculateSubtreeWidth(personId) {
        if (subtreeWidths[personId]) return subtreeWidths[personId];
        
        const person = people[personId];
        if (!person) return NODE_WIDTH;

        // นับจำนวนเก้าอี้ที่ตัวเองและคู่สมรสทั้งหมดต้องใช้ (เช่น แม้ว + เมีย 3 คน = 4 เก้าอี้)
        let selfWidth = NODE_WIDTH;
        const spouseField = person.spouse || person.spoues;
        if (spouseField && spouseField.trim()) {
            const spouseCount = spouseField.split("|").filter(id => id.trim()).length;
            selfWidth += (spouseCount * NODE_WIDTH);
        }

        // ค้นหาครอบครัวย่อยด้านล่างเพื่อดูพื้นที่ของลูกหลาน
        const ownFamily = families.find(f => f.father == personId || f.mother == personId);
        
        // ถ้าไม่มีลูก พื้นที่โซนบ้านคือขนาดของตัวเองและคู่สมรสทั้งหมด
        if (!ownFamily || !ownFamily.children || ownFamily.children.length === 0) {
            subtreeWidths[personId] = selfWidth;
            return selfWidth;
        }

        // ถ้ามีลูก ให้คำนวณพื้นที่ของสายลูกหลานทุกคนรวมกันลึกลงไป
        let childrenTotalWidth = 0;
        ownFamily.children.forEach(childId => {
            childrenTotalWidth += calculateSubtreeWidth(childId);
        });

        // ✅ เพิ่มความกว้างเผื่อและช่องว่างกั้นระหว่างขอบบ้าน (Buffer) เพื่อไม่ให้คนแถว 3 วิ่งไปทับบ้านข้าง ๆ
        const finalWidth = Math.max(selfWidth, childrenTotalWidth) + 40;
        subtreeWidths[personId] = finalWidth;
        return finalWidth;
    }

    // 3. วางตำแหน่งแบบล็อกพื้นที่ตามขนาดโซนยึดจากระยะลูกหลานจริง
    const visited = new Set();

    function layoutPersonAndFamily(personId, startX, level) {
        if (!personId || visited.has(personId)) return;

        const person = people[personId];
        if (!person) return;

        const currentY = level * LEVEL_HEIGHT + 100;
        const totalZoneWidth = subtreeWidths[personId] || NODE_WIDTH;

        // วางกล่องตัวหลักไว้ในพื้นที่โซนของตัวเอง
        let myX = startX + (totalZoneWidth / 2) - (NODE_WIDTH / 2);
        
        // ดักจับและคัดกรองพิกัดกรณีแต่งงานซ้ำหลายคน ไม่ให้พิกัดตัวพ่อ/แม่เบี้ยว
        const spouseField = person.spouse || person.spoues;
        let totalSpouseCount = 0;
        if (spouseField && spouseField.trim()) {
            totalSpouseCount = spouseField.split("|").filter(id => id.trim()).length;
            // ขยับตัวหลักไปทางซ้ายนิดนึงเพื่อให้กลุ่มเมีย ๆ นั่งเรียงต่อท้ายทางขวาได้สมดุลกึ่งกลางโซน
            myX = myX - ((totalSpouseCount * NODE_WIDTH) / 2);
        }

        layout[personId] = { x: myX, y: currentY };
        visited.add(personId);

        // วางกล่องคู่สมรสทุกคนเรียงต่อคิวข้างตัวหลักยาวไปทางขวา
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

        // ส่งต่อกรอบพื้นที่แบ่งโซนลงไปให้รุ่นลูกหลานด้านล่างอย่างเที่ยงตรง
        const ownFamily = families.find(f => f.father == personId || f.mother == personId);
        if (ownFamily && ownFamily.children && ownFamily.children.length > 0) {
            // ปรับจุดเริ่มวาดของลูกให้อยู่ในขอบกรอบโซนบ้านพ่อแม่พอดี
            let childStartX = startX + (totalZoneWidth - (ownFamily.children.reduce((sum, cId) => sum + (subtreeWidths[cId] || NODE_WIDTH), 0))) / 2;
            
            ownFamily.children.forEach(childId => {
                const childWidth = subtreeWidths[childId] || NODE_WIDTH;
                layoutPersonAndFamily(childId, childStartX, level + 1);
                childStartX += childWidth;
            });
        }
    }

    // 4. สั่งเริ่มระบบประมวลผลขนาดพื้นที่โซนรายบุคคล
    calculateSubtreeWidth("1");

    // วางตำแหน่งสายตระกูลทั้งหมดเริ่มจาก "เภา" (ไอดี 1) ขึงพื้นที่ซ้ายสุดที่พิกัด X = 100
    layoutPersonAndFamily("1", 100, 1);

    // ล็อกตำแหน่งประธานสูงสุด "เภา-สวัสดิ์" (รุ่น 0) ให้อยู่กึ่งกลางเหนือกลุ่มโซนลูกหลานทั้งหมดอย่างสมดุล
    const rootFamily = families.find(f => (f.father == "1" && f.mother == "2") || (f.father == "2" && f.mother == "1"));
    if (rootFamily && layout["1"]) {
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

    // เก็บตกคนโสดหรือข้อมูลหลุดโพลอย ๆ
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
