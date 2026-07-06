const NODE_WIDTH = 140;    // ช่องไฟแนวขนานระหว่างบุคคลแต่ละคน
const LEVEL_HEIGHT = 190;  // ระยะห่างแนวตั้งระหว่างรุ่น

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
      // --- โดนเปลี่ยนจากคำว่า .find เป็น .filter เพื่อดึงทุกครอบครัวที่คนนี้เป็นพ่อหรือแม่ ---
const ownFamilies = families.filter(f => f.father == personId || f.mother == personId);

let childrenTotalWidth = 0;
let hasChildren = false;

// ลูปดึงลูกจากทุกๆ ครอบครัวที่สัมพันธ์กันมารวมความกว้าง
ownFamilies.forEach(family => {
    if (family.children && family.children.length > 0) {
        hasChildren = true;
        family.children.forEach(childId => {
            childrenTotalWidth += calculateSubtreeWidth(childId);
        });
    }
});

if (!hasChildren) {
    subtreeWidths[personId] = selfWidth;
    return selfWidth;
}
      // --- เปลี่ยนจาก .find เป็น .filter เพื่อให้คำนวณตำแหน่งลูกๆ ครบทุกบ้านแต่งซ้ำ ---
const ownFamilies = families.filter(f => f.father == personId || f.mother == personId);

// รวบรวมรายชื่อลูกทุกคนจากทุกครอบครัวเพื่อหาขนาดความกว้างรวมก่อน
let allChildrenIds = [];
ownFamilies.forEach(family => {
    if (family.children) {
        allChildrenIds = allChildrenIds.concat(family.children);
    }
});

if (allChildrenIds.length > 0) {
    // คำนวณหาจุดเริ่มต้น X ให้กลุ่มลูกทั้งหมดอยู่กึ่งกลางใต้โซนพ่อแม่
    const childrenWidthSum = allChildrenIds.reduce((sum, cId) => sum + (subtreeWidths[cId] || NODE_WIDTH), 0);
    let childStartX = startX + (totalZoneWidth - childrenWidthSum) / 2;
    
    // วาดและจัดวางพิกัดลูกเรียงลำดับไปทีละคนอย่างถูกต้องสอดคล้องกัน
    allChildrenIds.forEach(childId => {
        const childWidth = subtreeWidths[childId] || NODE_WIDTH;
        layoutPersonAndFamily(childId, childStartX, level + 1);
        childStartX += childWidth;
    });
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
        
        layout["1"] = { x: rootCenterX - 75, y: 145 };
        layout["2"] = { x: rootCenterX + 75, y: 145 };
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
