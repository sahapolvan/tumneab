const NODE_WIDTH = 260;
const LEVEL_HEIGHT = 260;

let layout = {};

function layoutTree(){
    layout = {};

    // คำนวณระดับ Family (คาดว่าฟังก์ชันนี้อยู่ในไฟล์อื่น เช่น tree.js หรือ family.js)
    if (typeof buildFamilyLevels === "function") {
        buildFamilyLevels();
    }

    // แยกครอบครัวตามรุ่น
    const rows = {};
    families.forEach(f => {
        if (!rows[f.level]) rows[f.level] = [];
        rows[f.level].push(f);
    });

    // วางตำแหน่งแต่ละรุ่น
    Object.keys(rows).forEach(level => {
        layoutRow(rows[level], Number(level));
    });
}

function layoutRow(familiesInRow, level){
    let x = 200; // จุดเริ่มต้นแกน X ของรุ่นนั้นๆ
    const y = level * LEVEL_HEIGHT + 80; // คำนวณพิกัด Y เป็นพิกเซลที่ถูกต้อง

    familiesInRow.forEach(family => {
        const father = people[family.father];
        const mother = people[family.mother];

        // บันทึกพิกัดของศูนย์กลางครอบครัวนี้
        family.x = x;
        family.y = y;

        // 1. วางตำแหน่งพ่อ
        if(father){
            layout[father.id] = {
                x: x,
                y: y // ✅ แก้ไขจาก level เป็น y (พิกเซล)
            };
        }

        // 2. วางตำแหน่งแม่ (ห่างจากพ่อ 140px เพื่อความกระชับ หรือ 180px ตามเดิมของคุณ)
        const spouseOffset = 140; 
        if(mother){
            layout[mother.id] = {
                x: father ? x + spouseOffset : x,
                y: y // ✅ แก้ไขจาก level เป็น y (พิกเซล)
            };
        }

        // คำนวณจุดกึ่งกลางของพ่อแม่เพื่อใช้วางตำแหน่งลูกๆ
        let parentCenterX = x;
        if (father && mother) {
            parentCenterX = x + (spouseOffset / 2);
        }

        // 3. ✅ เพิ่มระบบวางตำแหน่งลูกๆ (ที่ของเดิมขาดหายไป)
        if (family.children && family.children.length > 0) {
            const childWidth = 140; // ความกว้างพื้นที่ต่อลูก 1 คน
            const totalChildrenWidth = (family.children.length - 1) * childWidth;
            // หาจุดเริ่มต้น X ของลูกคนแรกเพื่อให้กลุ่มลูกอยู่กึ่งกลางใต้พ่อแม่พอดี
            let startChildX = parentCenterX - (totalChildrenWidth / 2);
            // พิกัด Y ของลูกจะอยู่ในรุ่นถัดไป ( level + 1 )
            const childY = (level + 1) * LEVEL_HEIGHT + 80;

            family.children.forEach((childId, index) => {
                // วางลูกเฉพาะกรณีที่ลูกคนนั้นยังไม่มีตำแหน่ง (ป้องกันการทับซ้อนกรณีแต่งงานซ้ำ)
                if (!layout[childId]) {
                    layout[childId] = {
                        x: startChildX + (index * childWidth),
                        y: childY
                    };
                }
            });
        }

        // คำนวณพื้นที่ครอบครัวเพื่อดันสเปซสำหรับครอบครัวถัดไปในรุ่นเดียวกัน
        const width = getFamilyWidth(family);
        x += width;
    });
}

function getFamilyWidth(family){
    const father = people[family.father];
    const mother = people[family.mother];
    const childrenCount = family.children ? family.children.length : 0;

    let base = 220;
    if(father && mother){
        base = 320;
    }

    const childSpace = childrenCount * 140;
    // คืนค่าความกว้างที่มากที่สุดระหว่างพื้นที่พ่อแม่ หรือพื้นที่ของลูกๆ
    return Math.max(base, childSpace + 60);
}
