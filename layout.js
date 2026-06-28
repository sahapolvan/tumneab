const NODE_WIDTH = 130;    // ระยะห่างซ้าย-ขวา ระหว่างคนในแถวเดียวกัน
const LEVEL_HEIGHT = 200;  // ระยะห่างแนวตั้ง ระหว่างแถวรุ่น

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. ค้นหาต้นตระกูลสูงสุด (ไอดี 1: เภา) เพื่อตั้งค่าเริ่มต้น
    const root = Object.values(people).find(p => p.name === "เภา" || p.id == "1");
    if (!root) return;

    // 2. ลูปคำนวณรุ่น (Generation) ให้กับคนที่มี "พ่อ" หรือ "แม่" ระบุในตารางก่อน (สายเลือดแท้)
    // ทำซ้ำหลายๆ รอบเพื่อเคลียร์ลำดับจากรุ่นปู่ ไปรุ่นลูก และรุ่นหลาน ให้ครบทุกโหนด
    for (let run = 0; run < 3; run++) {
        Object.values(people).forEach(person => {
            // ถ้ารากเหง้าตระกูล (เภา, สวัสดิ์) ให้ล็อกอยู่รุ่น 0 (แถวแรก)
            if (person.id == "1" || person.id == "2") {
                personLevels[person.id] = 0;
                return;
            }

            // เช็กว่าพ่อหรือแม่มีคะแนนรุ่นหรือยัง
            const fatherLevel = personLevels[person.father];
            const motherLevel = personLevels[person.mother];

            if (fatherLevel !== undefined) {
                personLevels[person.id] = fatherLevel + 1;
            } else if (motherLevel !== undefined) {
                personLevels[person.id] = motherLevel + 1;
            }
        });
    }

    // 3. ลูปเก็บตกกลุ่ม "เขย / สะใภ้" ที่ไม่มีพ่อแม่ในระบบ โดยจัดให้อยู่รุ่นเดียวกับคู่สมรสของตนเอง
    for (let run = 0; run < 3; run++) {
        Object.values(people).forEach(person => {
            if (personLevels[person.id] === undefined) {
                const spouseField = person.spouse || person.spoues;
                if (spouseField) {
                    // แตกไอดีคู่สมรสออกดู (รองรับกรณีแต่งซ้ำ เช่น 20|25|26)
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

    // ป้องกันกรณีฉุกเฉินถ้ายังมีใครหลุดโผไม่มีรุ่น ให้ตั้งเป็นรุ่น 0 ไว้ก่อนหน้าเว็บจะได้ไม่พัง
    Object.values(people).forEach(person => {
        if (personLevels[person.id] === undefined) {
            personLevels[person.id] = 0;
        }
    });

    // 4. นำรายชื่อมาจัดกลุ่มแบ่งลงแต่ละแถว (Rows)
    const rows = {};
    Object.keys(personLevels).forEach(pId => {
        const gen = personLevels[pId];
        if (!rows[gen]) rows[gen] = [];
        rows[gen].push(people[pId]);
    });

    // 5. คำนวณพิกัดตำแหน่งพิกเซล X, Y วางเรียงหน้ากระดานตามแถวรุ่นที่ถูกต้อง
    Object.keys(rows).sort((a, b) => Number(a) - Number(b)).forEach(level => {
        let currentX = 100; // จุดเริ่มต้นแกน X ซ้ายสุดของแต่ละแถว
        const currentY = Number(level) * LEVEL_HEIGHT + 100; // พิกัดแกน Y ล็อกตายตัวตามระดับรุ่น

        rows[level].forEach(person => {
            layout[person.id] = {
                x: currentX,
                y: currentY
            };
            currentX += NODE_WIDTH; // ขยับสเปซช่องไฟไปทางขวาสำหรับคนถัดไป
        });
    });
}
