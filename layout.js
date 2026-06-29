const NODE_WIDTH = 140;    // ช่องไฟแนวขนานระหว่างบุคคลแต่ละคน
const LEVEL_HEIGHT = 240;  // ระยะห่างแนวตั้งระหว่างรุ่น

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. ระบุรุ่นตามสายเลือดจากบนลงล่างอย่างแม่นยำ
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

    // 2. ฟังก์ชันคำนวณพื้นที่ขอบเขต Subtree โซนบ้าน
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

        const finalWidth = Math.max(selfWidth, childrenTotalWidth) + 40;
        subtreeWidths[personId] = finalWidth;
        return finalWidth;
    }

    // 3. ✅ ตรรกะใหม่ตามแนวคิดน้า: วางตำแหน่งดิ่งตรงแนวคงที่ (ไม่ขยับหนีตามลูกจนเส้นโย่ง)
    const visited = new Set();

    function layoutPersonAndFamily(personId, startX, level) {
        if (!personId || visited.has(personId)) return;

        const person = people[personId];
        if (!person) return;

        const currentY = level * LEVEL_HEIGHT + 100;
        
        // บังคับให้ตัวหลักตั้งหลักวาดชิดขอบซ้ายของกรอบโซนบ้านตัวเองเสมอตายตัว
        // วิธีนี้จะทำให้จุดยืนของพ่อแม่นิ่งตรงแนว ไม่ขยับเบี้ยวไปขวาตามกลุ่มสะใภ้ด้านล่าง
        let myX = startX + 20; 

        layout[personId] = { x: myX, y: currentY };
        visited.add(personId);

        const spouseField = person.spouse || person.spoues;
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

        const ownFamily = families.find(f => f.father == personId || f.mother == personId);
        if (ownFamily && ownFamily.children && ownFamily.children.length > 0) {
            let childStartX = startX;
            ownFamily.children.forEach(childId => {
                const childWidth = subtreeWidths[childId] || NODE_WIDTH;
                layoutPersonAndFamily(childId, childStartX, level + 1);
                childStartX += childWidth;
            });
        }
    }

    calculateSubtreeWidth("1");
    
    // ตั้งหลักผังเริ่มจาก X = 50 สม่ำเสมอกันหน้ากระดาน
    layoutPersonAndFamily("1", 50, 1);

    // ล็อกระนาบปู่ย่ารุ่นแรกให้อยู่ตรงแนวคงที่สมดุลเหนือหัวรุ่นลูกตัวแรก
    if (layout["1"]) {
        layout["1"] = { x: layout["3"].x, y: 100 }; // ล็อกแนวตรงกับบ้านแรก
        layout["2"] = { x: layout["3"].x + NODE_WIDTH, y: 100 };
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
