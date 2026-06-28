const NODE_WIDTH = 140;    // ช่องไฟแนวขนานระหว่างบุคคลแต่ละคน
const LEVEL_HEIGHT = 240;  // ระยะห่างระหว่างแถวรุ่น (แนวตั้ง)

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. ระบุรุ่น (Generation) ตามสายเลือดจากบนลงล่างอย่างแม่นยำ
    Object.values(people).forEach(person => {
        if (person.id == "1" || person.id == "2") {
            personLevels[person.id] = 0; // รุ่นปู่ย่า
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

    // จัดกลุ่มเขย/สะใภ้ให้อยู่รุ่นเดียวกับคู่สมรสของตนเอง
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

    // ดักกรณีหลุดโพลอย ๆ ให้เป็นรุ่นแรก
    Object.values(people).forEach(person => {
        if (personLevels[person.id] === undefined) personLevels[person.id] = 0;
    });

    // 2. จัดกลุ่มรายชื่อคนแยกตามแถวรุ่น (Rows) และเรียงลำดับไอดีให้แน่นอน
    const rows = {};
    Object.keys(personLevels).forEach(pId => {
        const gen = personLevels[pId];
        if (!rows[gen]) rows[gen] = [];
        rows[gen].push(people[pId]);
    });

    // 3. กำหนดแกนหน้าจอหลัก (สมมติความกว้างหน้าจอไว้ที่ 1600px เพื่อให้ขึงแถวได้กว้างและสมดุล)
    const viewWidth = 1600;

    Object.keys(rows).forEach(level => {
        const currentY = Number(level) * LEVEL_HEIGHT + 100;
        const orderedPeople = [];
        const visited = new Set();

        // จัดคิวให้คู่สมรสยืนติดกันเสมอ เพื่อให้เส้นแต่งงานและหัวใจสวยงาม
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

        // 4. ✅ คำนวณจุดเริ่มต้น (startX) เพื่อเว้นขอบซ้าย-ขวาให้เท่ากันตามแนวคิดของน้า
        const totalPeopleInRow = orderedPeople.length;
        const totalRowWidth = totalPeopleInRow * NODE_WIDTH;
        
        // หาจุดเริ่มวาดด้านซ้าย เพื่อให้แถวนี้อยู่กึ่งกลางหน้าเว็บพอดี (ขอบซ้ายและขวาจะเหลือเท่ากันเป๊ะ)
        let startX = (viewWidth - totalRowWidth) / 2 + (NODE_WIDTH / 2);

        // วางตำแหน่งพิกเซลของทุกคนในแถวนี้เรียงหน้ากระดานต่อคิวกันไปยาว ๆ 
        orderedPeople.forEach(person => {
            layout[person.id] = {
                x: startX,
                y: currentY
            };
            startX += NODE_WIDTH; // ดันคิวไปข้างหน้าทีละคน ไม่มีซ้อนทับกันแน่นอน
        });
    });
}
