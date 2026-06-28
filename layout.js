const NODE_WIDTH = 130;    // ช่องไฟแนวขนานระหว่างบุคคลแต่ละคน
const LEVEL_HEIGHT = 200;  // ระยะห่างระหว่างแถวรุ่น (แนวตั้ง)

let layout = {};

function layoutTree() {
    layout = {};
    
    // 1. สร้างตัวแปรเก็บโครงสร้างเจเนอเรชันแยกตามบุคคล
    const personLevels = {};
    
    // ค้นหาต้นตระกูลสูงสุด (ไอดี 1: เภา)
    const root = Object.values(people).find(p => p.name === "เภา" || p.id == "1");
    if (!root) return;

    // 2. ฟังก์ชันเดินสายเลือดแบบเจาะลึกเพื่อหาว่าใครอยู่ "รุ่น (Generation)" ไหนกันแน่
    function assignGeneration(personId, currentGen) {
        if (!personId) return;
        
        // บันทึกรุ่นให้กับตัวเอง (ถ้าเคยบันทึกแล้วและเจอค่าที่ลึกกว่า ให้ใช้ค่าที่ลึกกว่า)
        if (personLevels[personId] === undefined || currentGen > personLevels[personId]) {
            personLevels[personId] = currentGen;
        } else {
            return; // ป้องกันการวิ่งวนลูป
        }

        const person = people[personId];
        if (!person) return;

        // หาคู่สมรสของคนนี้ เพื่อจัดให้อยู่ในรุ่น (แถว) เดียวกันเสมอ
        const spouseField = person.spouse || person.spoues;
        if (spouseField) {
            spouseField.split("|").forEach(sId => {
                const sIdTrim = sId.trim();
                if (sIdTrim && (personLevels[sIdTrim] === undefined || currentGen > personLevels[sIdTrim])) {
                    personLevels[sIdTrim] = currentGen;
                }
            });
        }

        // หาครอบครัวที่คนๆ นี้เป็นพ่อหรือแม่ เพื่อส่งต่อรุ่นถัดไป (currentGen + 1) ให้กับลูกๆ
        if (typeof families !== "undefined") {
            const ownFamilies = families.filter(f => f.father == personId || f.mother == personId);
            ownFamilies.forEach(fam => {
                if (fam.children) {
                    fam.children.forEach(childId => {
                        assignGeneration(childId, currentGen + 1);
                    });
                }
            });
        }
    }

    // เริ่มคำนวณรุ่นจาก "เภา" ที่ระดับ 0
    assignGeneration(root.id, 0);

    // ตรวจสอบเก็บตกคนที่อาจจะหลุดโผจากสายเลือดหลัก ให้เช็กจากโครงสร้างครอบครัวซ้ำ
    Object.values(people).forEach(p => {
        if (personLevels[p.id] === undefined) {
            // ถ้าไม่เจอรุ่น ให้พยายามอิงตามครอบครัวที่มีอยู่
            const parentFam = families.find(f => f.children.includes(p.id));
            if (parentFam && parentFam.level !== -1) {
                personLevels[p.id] = parentFam.level + 1;
            } else {
                personLevels[p.id] = 0; // ป้องกันข้อมูลตกหล่นให้เซ็ตเป็น 0 ไว้ก่อน
            }
        }
    });

    // 3. จัดกลุ่มคนแยกตามรุ่นลงแถว
    const rows = {};
    Object.keys(personLevels).forEach(pId => {
        const gen = personLevels[pId];
        if (!rows[gen]) rows[gen] = [];
        rows[gen].push(people[pId]);
    });

    // 4. คำนวณพิกัด X, Y วางเรียงหน้ากระดานตามรุ่นจริงแบบไม่สลับแถว
    Object.keys(rows).sort((a, b) => Number(a) - Number(b)).forEach(level => {
        let currentX = 100; // จุดเริ่มต้นแกน X ซ้ายสุดของแถว
        const currentY = Number(level) * LEVEL_HEIGHT + 100; // พิกัดแนวตั้งล็อกตามรุ่นเป๊ะๆ

        rows[level].forEach(person => {
            layout[person.id] = {
                x: currentX,
                y: currentY
            };
            currentX += NODE_WIDTH; // ขยับช่องไฟไปทางขวาสำหรับคนถัดไปในแถว
        });
    });
}
