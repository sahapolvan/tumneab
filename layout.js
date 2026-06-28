const NODE_WIDTH = 130;    // ระยะห่างซ้าย-ขวา ระหว่างคนในแถวเดียวกัน
const LEVEL_HEIGHT = 240;  // ระยะห่างแนวตั้ง ระหว่างแถวรุ่น

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. ล็อกระดับรุ่นตระกูลหลักจากบนลงล่าง (เภา-สวัสดิ์ อยู่รุ่น 0 บนสุด)
    Object.values(people).forEach(person => {
        if (person.id == "1" || person.id == "2") {
            personLevels[person.id] = 0;
        }
    });

    // ลูปหาความห่างจากสายเลือดเภา (ทำ 4 รอบเพื่อให้ไล่ลงไปถึงรุ่นเหลนได้ครบถ้วน)
    for (let run = 0; run < 4; run++) {
        Object.values(people).forEach(person => {
            const fatherLevel = personLevels[person.father];
            const motherLevel = personLevels[person.mother];

            // ลูกแท้ ๆ จะได้ระดับรุ่นต่อจาก พ่อ หรือ แม่ เสมอ
            if (fatherLevel !== undefined) {
                personLevels[person.id] = fatherLevel + 1;
            } else if (motherLevel !== undefined) {
                personLevels[person.id] = motherLevel + 1;
            }
        });
    }

    // ลูปจัดกลุ่ม "สะใภ้ / เขย" ให้ขึ้น-ลง ไปอยู่ระดับรุ่นเดียวกับแฟน (คู่สมรส) ของตัวเองทันที
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

    // ดักกรณีข้อมูลหลุดโพลอย ๆ ให้ตั้งเป็นรุ่น 0
    Object.values(people).forEach(person => {
        if (personLevels[person.id] === undefined) {
            personLevels[person.id] = 0;
        }
    });

    // 2. จัดกลุ่มคนแยกตามระดับแถวรุ่นที่แท้จริง
    const rows = {};
    Object.keys(personLevels).forEach(pId => {
        const gen = personLevels[pId];
        if (!rows[gen]) rows[gen] = [];
        rows[gen].push(people[pId]);
    });

    // 3. จัดคิวเรียงหน้ากระดานตามเจเนอเรชัน โดยดึง "คู่รัก" มานั่งเก้าอี้ติดกันเสมอ
    const visited = new Set();
    Object.keys(rows).sort((a, b) => Number(a) - Number(b)).forEach(level => {
        let currentX = 100;
        const currentY = Number(level) * LEVEL_HEIGHT + 100;

        const orderedPeople = [];

        rows[level].forEach(person => {
            if (visited.has(person.id)) return;

            orderedPeople.push(person);
            visited.add(person.id);

            // เช็กคู่สมรสเพื่อดึงมานั่งเก้าอี้ตัวข้าง ๆ ทันที
            const spouseField = person.spouse || person.spoues;
            if (spouseField) {
                spouseField.split("|").forEach(sId => {
                    const partnerId = sId.trim();
                    const partner = people[partnerId];
                    // บังคับให้คู่สมรสที่อยู่รุ่นเดียวกันมานั่งติดกัน
                    if (partner && personLevels[partner.id] === Number(level) && !visited.has(partner.id)) {
                        orderedPeople.push(partner);
                        visited.add(partner.id);
                    }
                });
            }
        });

        // 4. บันทึกพิกัดลงแคนวาสจริง
        orderedPeople.forEach(person => {
            layout[person.id] = {
                x: currentX,
                y: currentY
            };
            currentX += NODE_WIDTH;
        });
    });
}
