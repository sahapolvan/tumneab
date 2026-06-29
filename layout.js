const NODE_WIDTH = 140;    // ช่องไฟแนวขนานระหว่างบุคคลแต่ละคน
const LEVEL_HEIGHT = 180;  // ระยะห่างแนวตั้งระหว่างรุ่น

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. ระบุเจเนอเรชันล็อกตามสายเลือดจากบนลงล่างอย่างแม่นยำ
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

    // 2. ฟังก์ชันคำนวณพื้นที่ความกว้างโซน (นับคู่ครองแต่งซ้ำทุกคนละเอียด เพื่อกางขอบบ้าน)
    const subtreeWidths = {};
    function calculateSubtreeWidth(personId) {
        if (subtreeWidths[personId]) return subtreeWidths[personId];
        
        const person = people[personId];
        if (!person) return NODE_WIDTH;

        let selfWidth = NODE_WIDTH;
        const spouseField = person.spouse || person.spoues;
        if (spouseField && spouseField.trim()) {
            const spouseCount = spouseField.split("|").filter(id => id.trim()).length;
            selfWidth += (spouseCount * NODE_WIDTH);
        }

        const ownFamily = families.find(f => f.father == personId || f.mother == personId);
        if (!ownFamily || !ownFamily.children || ownFamily.children.length === 0) {
            subtreeWidths[personId] = selfWidth;
            return selfWidth;
        }

        let childrenTotalWidth = 0;
        ownFamily.children.forEach(childId => {
            childrenTotalWidth += calculateSubtreeWidth(childId);
        });

        // กั้นขอบสเปซเผื่อข้างระหว่างสายบ้าน (Buffer + 60px) ป้องกันคนทับกัน
        const finalWidth = Math.max(selfWidth, childrenTotalWidth) + 60;
        subtreeWidths[personId] = finalWidth;
        return finalWidth;
    }

    // 3. วางตำแหน่งแบบล็อกพื้นที่ตามขนาดโซนยึดจากระยะลูกหลานจริง (จัดกึ่งกลางกลุ่ม)
    const visited = new Set();

    function layoutPersonAndFamily(personId, startX, level) {
        if (!personId || visited.has(personId)) return;

        const person = people[personId];
        if (!person) return;

        const currentY = level * LEVEL_HEIGHT + 100;
        const totalZoneWidth = subtreeWidths[personId] || NODE_WIDTH;

        // วางกล่องตัวหลักให้อยู่กึ่งกลางโซนบ้านตัวเอง
        let myX = startX + (totalZoneWidth / 2) - (NODE_WIDTH / 2);
        
        // ดักกรณีคนแต่งงานซ้ำหลายคน ให้เฉลี่ยขยับตัวหลักหลบไปซ้าย เพื่อให้กลุ่มเมีย ๆ นั่งเรียงต่อท้ายได้กึ่งกลางโซนพอดี
        const spouseField = person.spouse || person.spoues;
        if (spouseField && spouseField.trim()) {
            const totalSpouseCount = spouseField.split("|").filter(id => id.trim()).length;
            myX = myX - ((totalSpouseCount * NODE_WIDTH) / 2);
        }

        layout[personId] = { x: myX, y: currentY };
        visited.add(personId);

        // วางกล่องคู่สมรสทุกคนเรียงติดคิวต่อท้ายไปทางขวาอย่างเสถียร
        if (spouseField) {
            spouseField.split("|").forEach(sId => {
                const partnerId = sId.trim();
                if (people[partnerId] && !visited.has(partnerId)) {
                    myX += NODE_WIDTH;
                    layout[partnerId] = { x: myX, y: currentY };
                    visited.add(partnerId);
                }
            });
        }

        // ส่งต่อกรอบพื้นที่แบ่งโซนลงไปให้รุ่นลูกหลานด้านล่าง
        const ownFamily = families.find(f => f.father == personId || f.mother == personId);
        if (ownFamily && ownFamily.children && ownFamily.children.length > 0) {
            // คำนวณขอบเขตลูกให้อยู่กึ่งกลางใต้โซนบ้านพ่อแม่พอดีเป๊ะ ไม่เบี้ยวไปข้างใดข้างหนึ่ง
            const childrenWidthSum = ownFamily.children.reduce((sum, cId) => sum + (subtreeWidths[cId] || NODE_WIDTH), 0);
            let childStartX = startX + (totalZoneWidth - childrenWidthSum) / 2;
            
            ownFamily.children.forEach(childId => {
                const childWidth = subtreeWidths[childId] || NODE_WIDTH;
                layoutPersonAndFamily(childId, childStartX, level + 1);
                childStartX += childWidth;
            });
        }
    }

    calculateSubtreeWidth("1");
    
    // ตั้งจุดสตาร์ทซ้ายสุดของผังทั้งหมดที่ X = 100
    layoutPersonAndFamily("1", 100, 1);

    // 4. ล็อกตำแหน่งประธานสูงสุด "เภา-สวัสดิ์" (รุ่น 0) จัดกึ่งกลางเหนือโซนลูกหลานทั้งหมดอย่างสมดุลร้อยเปอร์เซ็นต์
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

    // เก็บตกคนโสด
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
