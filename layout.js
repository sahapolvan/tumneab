const NODE_WIDTH = 130;    // ระยะห่างซ้าย-ขวา ระหว่างคนในแถวเดียวกัน
const LEVEL_HEIGHT = 240;  // ระยะห่างแนวตั้ง ระหว่างแถวรุ่น

let layout = {};

function layoutTree() {
    layout = {};
    const personLevels = {};

    // 1. ค้นหาต้นตระกูลสูงสุด (ไอดี 1: เภา) เพื่อตั้งค่าเริ่มต้นเป็นรุ่น 0
    const root = Object.values(people).find(p => p.name === "เภา" || p.id == "1");
    if (!root) return;
    personLevels[root.id] = 0;

    // หาคู่สมรสของต้นตระกูล (สวัสดิ์) ให้ล็อกอยู่รุ่น 0 ร่วมกัน
    const rootSpouse = root.spouse || root.spoues;
    if (rootSpouse) {
        rootSpouse.split("|").forEach(sId => { personLevels[sId.trim()] = 0; });
    }

    // 2. ✅ ปรับปรุงใหม่: ใช้ลูป Dynamic เช็กระดับความลึกสายเลือดเรื่อย ๆ จนกว่าจะครบทุกคนในตาราง (ไม่จำกัดจำนวนรุ่น)
    let changed = true;
    let safetyCounter = 0;
    
    while (changed && safetyCounter < 20) {
        changed = false;
        safetyCounter++;

        Object.values(people).forEach(person => {
            // ถ้าระบุรุ่นไปแล้วให้ข้าม
            if (personLevels[person.id] !== undefined) return;

            // เช็กระดับรุ่นจาก พ่อ หรือ แม่ (ถ้าคนใดคนหนึ่งมีรุ่นแล้ว ลูกจะได้รุ่นถัดไปทันที)
            const fatherLevel = personLevels[person.father];
            const motherLevel = personLevels[person.mother];

            if (fatherLevel !== undefined) {
                personLevels[person.id] = fatherLevel + 1;
                changed = true;
            } else if (motherLevel !== undefined) {
                personLevels[person.id] = motherLevel + 1;
                changed = true;
            }
        });

        // ลูปเก็บตกกลุ่ม เขย / สะใภ้ ในรุ่นนั้น ๆ ให้ดึงมาอยู่รุ่นเดียวกับคู่สมรสของตนเอง
        Object.values(people).forEach(person => {
            if (personLevels[person.id] !== undefined) return;

            const spouseField = person.spouse || person.spoues;
            if (spouseField) {
                const spouseIds = spouseField.split("|").map(id => id.trim());
                for (let sId of spouseIds) {
                    if (personLevels[sId] !== undefined) {
                        personLevels[person.id] = personLevels[sId];
                        changed = true;
                        break;
                    }
                }
            }
        });
    }

    // ป้องกันกรณีข้อมูลหลุดโพลอย ๆ ให้ตั้งเป็นรุ่น 0 ไว้หน้าเว็บจะได้ไม่พัง
    Object.values(people).forEach(person => {
        if (personLevels[person.id] === undefined) {
            personLevels[person.id] = 0;
        }
    });

    // 3. จัดกลุ่มคนแยกตามระดับรุ่นลงแต่ละแถว
    const rows = {};
    Object.keys(personLevels).forEach(pId => {
        const gen = personLevels[pId];
        if (!rows[gen]) rows[gen] = [];
        rows[gen].push(people[pId]);
    });

    // หาจำนวนรุ่นทั้งหมดที่มีในระบบตารางข้อมูลตอนนี้
    const totalLevels = Object.keys(rows).map(Number).sort((a, b) => b - a);
    const maxLevel = totalLevels[0] || 0;

    // 4. ✅ ปรับปรุงใหม่: วาดพิกัดจากล่างขึ้นบนแบบไดนามิก รองรับตั้งแต่รุ่นล่างสุดดันขึ้นไปหารุ่นบนสุด
    let currentX = 100;
    const visited = new Set();

    for (let level = maxLevel; level >= 0; level--) {
        const currentY = level * LEVEL_HEIGHT + 100;

        if (level === maxLevel) {
            // แถวล่างสุด (รุ่นเหลน หรือรุ่นล่าสุดในตาราง) ให้วางเรียงหน้ากระดานเพื่อขยายสเปซฐาน
            rows[level].forEach(person => {
                if (visited.has(person.id)) return;

                layout[person.id] = { x: currentX, y: currentY };
                visited.add(person.id);
                currentX += NODE_WIDTH;

                // ดึงคู่แต่งงานในรุ่นล่างสุดมานั่งติดกัน
                const spouseField = person.spouse || person.spoues;
                if (spouseField) {
                    spouseField.split("|").forEach(sId => {
                        const partnerId = sId.trim();
                        if (people[partnerId] && !visited.has(partnerId)) {
                            layout[partnerId] = { x: currentX, y: currentY };
                            visited.add(partnerId);
                            currentX += NODE_WIDTH;
                            currentX += 30; // เว้นสเปซแยกกลุ่มบ้าน
                        }
                    });
                }
            });
        } else {
            // รุ่นที่อยู่สูงขึ้นไป (พ่อแม่/ปู่ย่า) ให้คำนวณตำแหน่งจัดกึ่งกลางเหนือหัวกลุ่มลูก ๆ ของตัวเองเสมอ
            families.forEach(fam => {
                // ค้นหารุ่นของครอบครัวนี้
                const famLevel = personLevels[fam.father] !== undefined ? personLevels[fam.father] : personLevels[fam.mother];
                if (famLevel !== level) return;

                const father = people[fam.father];
                const mother = people[fam.mother];

                let childrenXSum = 0;
                let validChildrenCount = 0;

                if (fam.children) {
                    fam.children.forEach(cId => {
                        if (layout[cId]) {
                            childrenXSum += layout[cId].x;
                            validChildrenCount++;
                        }
                        // รวมพิกัดคู่สมรสของลูกด้วยเพื่อความสมดุล
                        const cSpouse = people[cId]?.spouse || people[cId]?.spoues;
                        if (cSpouse) {
                            cSpouse.split("|").forEach(sId => {
                                if (layout[sId.trim()]) {
                                    childrenXSum += layout[sId.trim()].x;
                                    validChildrenCount++;
                                }
                            });
                        }
                    });
                }

                let targetCenterX = currentX;
                if (validChildrenCount > 0) {
                    targetCenterX = childrenXSum / validChildrenCount;
                } else {
                    targetCenterX = currentX;
                    currentX += (NODE_WIDTH * 2); // ขยับเผื่อกรณีไม่มีลูก
                }

                // วางตำแหน่งพ่อแม่ให้คร่อมกึ่งกลางพอดี
                if (father && !visited.has(father.id) && mother && !visited.has(mother.id)) {
                    layout[father.id] = { x: targetCenterX - 70, y: currentY };
                    layout[mother.id] = { x: targetCenterX + 70, y: currentY };
                    visited.add(father.id);
                    visited.add(mother.id);
                } else {
                    if (father && !visited.has(father.id)) {
                        layout[father.id] = { x: targetCenterX, y: currentY };
                        visited.add(father.id);
                    }
                    if (mother && !visited.has(mother.id)) {
                        layout[mother.id] = { x: targetCenterX, y: currentY };
                        visited.add(mother.id);
                    }
                }
            });

            // เก็บตกคนโสดในรุ่นนั้น ๆ ที่ไม่มีครอบครัว ให้วางต่อท้ายแถวขวา
            if (rows[level]) {
                rows[level].forEach(p => {
                    if (!layout[p.id] && !visited.has(p.id)) {
                        let maxX = 100;
                        Object.keys(layout).forEach(id => {
                            if (personLevels[id] === level && layout[id].x > maxX) maxX = layout[id].x;
                        });
                        layout[p.id] = { x: maxX + NODE_WIDTH + 50, y: currentY };
                        visited.add(p.id);
                    }
                });
            }
        }
    }
}
