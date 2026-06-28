const NODE_WIDTH = 130;    // ระยะห่างซ้าย-ขวา ระหว่างคนในแถวเดียวกัน
const LEVEL_HEIGHT = 220;  // ระยะห่างแนวตั้ง ระหว่างแถวรุ่น

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. กำหนดรุ่น (Generation) ให้กับสายเลือดหลักก่อน
    Object.values(people).forEach(person => {
        if (person.id == "1" || person.id == "2") {
            personLevels[person.id] = 0; // รุ่นปู่ย่า
        }
    });

    // ลูปไล่ระดับจากรุ่นพ่อแม่ ไปรุ่นลูก และรุ่นหลาน (รัน 3 รอบเพื่อให้ข้อมูลนิ่ง)
    for (let run = 0; run < 3; run++) {
        Object.values(people).forEach(person => {
            const fatherLevel = personLevels[person.father];
            const motherLevel = personLevels[person.mother];

            if (fatherLevel !== undefined) {
                personLevels[person.id] = fatherLevel + 1;
            } else if (motherLevel !== undefined) {
                personLevels[person.id] = motherLevel + 1;
            }
        });
    }

    // กำหนดรุ่นให้กลุ่มเขย/สะใภ้ ให้อยู่รุ่นเดียวกับคู่สมรส
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

    // 2. แยกกลุ่มคนลงแต่ละรุ่น แต่ละแถว
    const rows = {};
    Object.keys(personLevels).forEach(pId => {
        const gen = personLevels[pId];
        if (!rows[gen]) rows[gen] = [];
        rows[gen].push(people[pId]);
    });

    // 3. ✅ ตรรกะใหม่: จัดคิวเรียงหน้ากระดาน โดยบังคับให้ "คู่สมรส" ต้องอยู่ติดกันเสมอ
    Object.keys(rows).sort((a, b) => Number(a) - Number(b)).forEach(level => {
        let currentX = 100; // จุดเริ่มต้นแกน X ซ้ายสุดของแถว
        const currentY = Number(level) * LEVEL_HEIGHT + 100; // พิกัดแกan Y ตามแถวรุ่น

        const orderedPeople = [];
        const visited = new Set();

        // เรียงคิวใหม่: เจอใครปุ๊บ ถ้าเขามีคู่ครอง ให้ดึงคู่ครองมาต่อคิวข้างหลังเขาทันที
        rows[level].forEach(person => {
            if (visited.has(person.id)) return;

            orderedPeople.push(person);
            visited.add(person.id);

            // ดึงคู่ครองมานั่งข้างๆ
            const spouseField = person.spouse || person.spoues;
            if (spouseField) {
                spouseField.split("|").forEach(sId => {
                    const partnerId = sId.trim();
                    const partner = people[partnerId];
                    if (partner && !visited.has(partner.id)) {
                        orderedPeople.push(partner);
                        visited.add(partner.id);
                    }
                });
            }
        });

        // 4. บันทึกพิกัดตำแหน่งพิกเซลลงผังแคนวาส
        orderedPeople.forEach(person => {
            layout[person.id] = {
                x: currentX,
                y: currentY
            };
            currentX += NODE_WIDTH; // ขยับไปช่องถัดไป
        });
    });
}
