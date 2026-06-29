const NODE_WIDTH = 150;    // ช่องไฟแนวขนานระหว่างบุคคลทั่วไป
const COUPLE_GAP = 160;    // ช่องไฟระหว่างคู่สมรสเพื่อไม่ให้วงกลมซ้อนกัน
const LEVEL_HEIGHT = 240;  // ระยะห่างแนวตั้งระหว่างรุ่น

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. ระบุรุ่นตามสายเลือดจากบนลงล่างอย่างแม่นยำ
    Object.values(people).forEach(person => {
        if (person.id == "1" || person.id == "2") {
            personLevels[person.id] = 0;
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

    // 2. จัดกลุ่มแยกแถวรุ่น
    const rows = {};
    Object.keys(personLevels).forEach(pId => {
        const gen = personLevels[pId];
        if (!rows[gen]) rows[gen] = [];
        rows[gen].push(people[pId]);
    });

    // 3. จัดคิวเรียงหน้ากระดานแบบเว้นขอบตามแนวคิดของน้า
    Object.keys(rows).forEach(level => {
        const currentY = Number(level) * LEVEL_HEIGHT + 100;
        const orderedPeople = [];
        const visited = new Set();

        // เรียงลำดับให้คู่สมรสยืนติดกันเสมอ
        rows[level].sort((a, b) => Number(a.id) - Number(b.id)).forEach(person => {
            if (visited.has(person.id)) return;

            orderedPeople.push(person);
            visited.add(person.id);

            const spouseField = person.spouse || person.spoues;
            if (spouseField) {
                spouseField.split("|").forEach(sId => {
                    const partnerId = sId.trim();
                    const partner = people[partnerId];
                    if (partner && personLevels[partner.id] === Number(level) && !visited.has(partner.id)) {
                        orderedPeople.push(partner);
                        visited.add(partner.id);
                    }
                });
            }
        });

        // 4. คำนวณขอบเขตหน้าเว็บแบบยืดหยุ่นตามจำนวนคนจริงในแถวเพื่อไม่ให้แน่นตรงกลาง
        const totalPeopleInRow = orderedPeople.length;
        
        // ขยายพื้นที่พื้นที่หน้าจอตามจำนวนคน (คนเยอะ หน้าเว็บจะขยายขอบกว้างออกไปด้านข้างอัตโนมัติ)
        const dynamicViewWidth = Math.max(1800, totalPeopleInRow * (NODE_WIDTH + 20));
        const totalRowWidth = totalPeopleInRow * NODE_WIDTH;
        
        // คำนวณเว้นขอบซ้าย-ขวาให้เท่ากันเป๊ะ ๆ
        let startX = (dynamicViewWidth - totalRowWidth) / 2 + (NODE_WIDTH / 2);

        orderedPeople.forEach(person => {
            layout[person.id] = {
                x: startX,
                y: currentY
            };
            startX += NODE_WIDTH; // ทุกคนมีพื้นที่เก้าอี้ส่วนตัว ไม่ทับกันแน่นอน
        });
    });
}
